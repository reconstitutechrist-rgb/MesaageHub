import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { mediaLibraryService } from '@/services/MediaLibraryService'
import { queryKeys } from '@/lib/queryClient'

// ============ QUERIES ============

/**
 * Fetch media library items with caching
 * @param {string} userId - User ID
 * @param {object} options - Filter options { type, source, limit }
 */
export function useMediaLibrary(userId, options = {}) {
  return useQuery({
    queryKey: queryKeys.media.list(userId, options),
    queryFn: async () => {
      const result = await mediaLibraryService.getMediaLibrary(userId, options)
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch media')
      }
      return result.data
    },
    enabled: !!userId,
  })
}

/**
 * Fetch single media item by ID
 * @param {string} mediaId - Media asset ID
 */
export function useMediaById(mediaId) {
  return useQuery({
    queryKey: queryKeys.media.detail(mediaId),
    queryFn: async () => {
      const result = await mediaLibraryService.getMediaById(mediaId)
      if (!result.success) {
        throw new Error(result.error || 'Media not found')
      }
      return result.data
    },
    enabled: !!mediaId,
  })
}

/**
 * Fetch media library stats
 * @param {string} userId - User ID
 */
export function useMediaStats(userId) {
  return useQuery({
    queryKey: queryKeys.media.stats(userId),
    queryFn: async () => {
      const result = await mediaLibraryService.getStats(userId)
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch stats')
      }
      return result.data
    },
    enabled: !!userId,
    staleTime: 60 * 1000, // Stats can be stale for 1 minute
  })
}

// ============ MUTATIONS ============

/**
 * Upload media mutation with automatic cache invalidation
 */
export function useUploadMedia() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ file, source, userId }) => {
      const result = await mediaLibraryService.uploadMedia(file, source, userId)
      if (!result.success) {
        throw new Error(result.error || 'Upload failed')
      }
      return result.data
    },
    onSuccess: (_data, { userId }) => {
      // Invalidate media list to refetch with new item
      queryClient.invalidateQueries({ queryKey: queryKeys.media.list(userId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.media.stats(userId) })
    },
  })
}

/**
 * Upload media from data URL (canvas export)
 */
export function useUploadFromDataUrl() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ dataUrl, fileName, source, userId }) => {
      const result = await mediaLibraryService.uploadFromDataUrl(dataUrl, fileName, source, userId)
      if (!result.success) {
        throw new Error(result.error || 'Upload failed')
      }
      return result.data
    },
    onSuccess: (_data, { userId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.media.list(userId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.media.stats(userId) })
    },
  })
}

/**
 * Delete media with optimistic update
 */
export function useDeleteMedia() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, storagePath }) => {
      const result = await mediaLibraryService.deleteMedia(id, storagePath)
      if (!result.success) {
        throw new Error(result.error || 'Delete failed')
      }
      return { id }
    },
    onMutate: async ({ id, userId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.media.list(userId) })

      // Snapshot previous value for rollback
      const previousMedia = queryClient.getQueryData(queryKeys.media.list(userId))

      // Optimistically remove from cache (instant UI feedback)
      queryClient.setQueryData(queryKeys.media.list(userId), (old) =>
        old?.filter((item) => item.id !== id)
      )

      return { previousMedia, userId }
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousMedia && context?.userId) {
        queryClient.setQueryData(queryKeys.media.list(context.userId), context.previousMedia)
      }
    },
    onSettled: (_data, _error, { userId }) => {
      // Always refetch after mutation settles to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.media.list(userId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.media.stats(userId) })
    },
  })
}

/**
 * Batch delete multiple media items
 */
export function useBatchDeleteMedia() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ items, userId: _userId }) => {
      // Delete all items in parallel
      const results = await Promise.allSettled(
        items.map((item) => mediaLibraryService.deleteMedia(item.id, item.storage_path))
      )

      const failures = results.filter((r) => r.status === 'rejected')
      if (failures.length > 0) {
        throw new Error(`Failed to delete ${failures.length} item(s)`)
      }

      return { deletedCount: items.length }
    },
    onMutate: async ({ items, userId }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.media.list(userId) })

      const previousMedia = queryClient.getQueryData(queryKeys.media.list(userId))
      const idsToDelete = new Set(items.map((item) => item.id))

      // Optimistically remove all items
      queryClient.setQueryData(queryKeys.media.list(userId), (old) =>
        old?.filter((item) => !idsToDelete.has(item.id))
      )

      return { previousMedia, userId }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousMedia && context?.userId) {
        queryClient.setQueryData(queryKeys.media.list(context.userId), context.previousMedia)
      }
    },
    onSettled: (_data, _error, { userId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.media.list(userId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.media.stats(userId) })
    },
  })
}
