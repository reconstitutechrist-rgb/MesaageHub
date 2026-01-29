import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { designProjectService } from '@/services/DesignProjectService'
import { queryKeys } from '@/lib/queryClient'

// ============ QUERIES ============

/**
 * Fetch list of design projects with pagination
 * @param {string} userId - User ID
 * @param {object} pagination - Pagination options { limit, offset }
 */
export function useProjectsList(userId, pagination = { limit: 20, offset: 0 }) {
  return useQuery({
    queryKey: queryKeys.projects.list(userId, pagination),
    queryFn: async () => {
      const result = await designProjectService.listProjects(userId, pagination)
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch projects')
      }
      return result
    },
    enabled: !!userId,
  })
}

/**
 * Fetch single project by ID
 * @param {string} projectId - Project ID
 * @param {string} userId - User ID
 */
export function useProject(projectId, userId) {
  return useQuery({
    queryKey: queryKeys.projects.detail(projectId, userId),
    queryFn: async () => {
      const result = await designProjectService.loadProject(projectId, userId)
      if (!result.success) {
        throw new Error(result.error || 'Project not found')
      }
      return result.data
    },
    enabled: !!projectId && !!userId,
  })
}

// ============ MUTATIONS ============

/**
 * Save project mutation (create or update)
 */
export function useSaveProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ projectData, userId }) => {
      const result = await designProjectService.saveProject(projectData, userId)
      if (!result.success) {
        throw new Error(result.error || 'Save failed')
      }
      return result.data
    },
    onSuccess: (data, { userId }) => {
      // Invalidate list to show new/updated project
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.list(userId) })
      // Update individual project cache
      if (data.id) {
        queryClient.setQueryData(queryKeys.projects.detail(data.id, userId), data)
      }
    },
  })
}

/**
 * Delete project with optimistic update
 */
export function useDeleteProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ projectId, userId }) => {
      const result = await designProjectService.deleteProject(projectId, userId)
      if (!result.success) {
        throw new Error(result.error || 'Delete failed')
      }
      return { projectId }
    },
    onMutate: async ({ projectId, userId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.projects.list(userId) })

      // Snapshot previous value for rollback
      const previousProjects = queryClient.getQueryData(queryKeys.projects.list(userId))

      // Optimistically remove project
      queryClient.setQueryData(queryKeys.projects.list(userId), (old) => {
        if (!old) return old
        return {
          ...old,
          data: old.data?.filter((p) => p.id !== projectId),
          total: (old.total || 0) - 1,
        }
      })

      return { previousProjects, userId }
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousProjects && context?.userId) {
        queryClient.setQueryData(queryKeys.projects.list(context.userId), context.previousProjects)
      }
    },
    onSettled: (_data, _error, { userId }) => {
      // Always refetch after mutation settles
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.list(userId) })
    },
  })
}

/**
 * Duplicate project mutation
 */
export function useDuplicateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ projectId, userId }) => {
      const result = await designProjectService.duplicateProject(projectId, userId)
      if (!result.success) {
        throw new Error(result.error || 'Duplicate failed')
      }
      return result.data
    },
    onSuccess: (_data, { userId }) => {
      // Invalidate list to show duplicated project
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.list(userId) })
    },
  })
}
