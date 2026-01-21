import { supabase, isSupabaseConfigured } from '@/lib/supabase'

/**
 * MediaLibraryService - Handles media asset storage and management
 * Uses Supabase Storage for file storage and database for metadata
 */

const STORAGE_BUCKET = 'media-assets'
const TABLE_NAME = 'media_assets'

// Mock data for demo mode when Supabase is not configured
let mockMediaLibrary = [
  {
    id: 'mock-1',
    user_id: 'demo-user',
    url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400',
    thumbnail_url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=150',
    type: 'image',
    source: 'ai-studio',
    file_name: 'promo-banner.png',
    file_size: 245000,
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'mock-2',
    user_id: 'demo-user',
    url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
    thumbnail_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150',
    type: 'image',
    source: 'upload',
    file_name: 'product-photo.jpg',
    file_size: 189000,
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: 'mock-3',
    user_id: 'demo-user',
    url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
    thumbnail_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=150',
    type: 'image',
    source: 'ai-studio',
    file_name: 'shoe-ad.png',
    file_size: 312000,
    created_at: new Date(Date.now() - 259200000).toISOString(),
  },
]

class MediaLibraryService {
  /**
   * Upload a media file to storage
   * @param {File|Blob} file - The file to upload
   * @param {string} source - Source of the file: 'upload' | 'ai-studio' | 'camera'
   * @param {string} userId - The user ID
   * @returns {Promise<object>} - The saved media asset record
   */
  async uploadMedia(file, source = 'upload', userId = 'demo-user') {
    if (!isSupabaseConfigured) {
      // Demo mode - create mock entry
      const mockAsset = {
        id: `mock-${Date.now()}`,
        user_id: userId,
        url: URL.createObjectURL(file),
        thumbnail_url: URL.createObjectURL(file),
        type: file.type.startsWith('video/') ? 'video' : 'image',
        source,
        file_name: file.name || `${source}-${Date.now()}.${file.type.split('/')[1] || 'png'}`,
        file_size: file.size,
        created_at: new Date().toISOString(),
      }
      mockMediaLibrary.unshift(mockAsset)
      return { success: true, data: mockAsset }
    }

    try {
      // Generate unique file path
      const fileExt =
        file.name?.split('.').pop() || (file.type.startsWith('video/') ? 'mp4' : 'png')
      const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

      // Upload to Supabase Storage
      const { data: _uploadData, error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(fileName, file, {
          contentType: file.type,
          upsert: false,
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(fileName)

      // Create thumbnail URL (for images, use same URL with transform; for videos, use placeholder)
      const isVideo = file.type.startsWith('video/')
      const thumbnailUrl = isVideo
        ? urlData.publicUrl // For videos, we'd need a separate thumbnail generation
        : `${urlData.publicUrl}?width=150&height=150`

      // Save metadata to database
      const mediaRecord = {
        user_id: userId,
        url: urlData.publicUrl,
        thumbnail_url: thumbnailUrl,
        type: isVideo ? 'video' : 'image',
        source,
        file_name: file.name || fileName.split('/').pop(),
        file_size: file.size,
        storage_path: fileName,
      }

      const { data: dbData, error: dbError } = await supabase
        .from(TABLE_NAME)
        .insert(mediaRecord)
        .select()
        .single()

      if (dbError) throw dbError

      return { success: true, data: dbData }
    } catch (error) {
      console.error('Error uploading media:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Upload media from a data URL (e.g., canvas export)
   * @param {string} dataUrl - The data URL of the image/video
   * @param {string} fileName - Desired file name
   * @param {string} source - Source of the file
   * @param {string} userId - The user ID
   * @returns {Promise<object>} - The saved media asset record
   */
  async uploadFromDataUrl(
    dataUrl,
    fileName = 'export.png',
    source = 'ai-studio',
    userId = 'demo-user'
  ) {
    try {
      // Convert data URL to Blob
      const response = await fetch(dataUrl)
      const blob = await response.blob()

      // Create a File object from the Blob
      const file = new File([blob], fileName, { type: blob.type })

      return this.uploadMedia(file, source, userId)
    } catch (error) {
      console.error('Error converting data URL:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Get all media assets for a user
   * @param {string} userId - The user ID
   * @param {object} options - Filter options
   * @returns {Promise<object>} - List of media assets
   */
  async getMediaLibrary(userId = 'demo-user', options = {}) {
    const { type, source, limit = 50 } = options

    if (!isSupabaseConfigured) {
      // Demo mode - return mock data
      let filtered = [...mockMediaLibrary]
      if (type) filtered = filtered.filter((m) => m.type === type)
      if (source) filtered = filtered.filter((m) => m.source === source)
      return { success: true, data: filtered.slice(0, limit) }
    }

    try {
      let query = supabase
        .from(TABLE_NAME)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (type) query = query.eq('type', type)
      if (source) query = query.eq('source', source)

      const { data, error } = await query

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      console.error('Error fetching media library:', error)
      return { success: false, error: error.message, data: [] }
    }
  }

  /**
   * Delete a media asset
   * @param {string} id - The asset ID
   * @param {string} storagePath - The storage path (optional, for Supabase)
   * @returns {Promise<object>} - Result of deletion
   */
  async deleteMedia(id, storagePath = null) {
    if (!isSupabaseConfigured) {
      // Demo mode - remove from mock data
      mockMediaLibrary = mockMediaLibrary.filter((m) => m.id !== id)
      return { success: true }
    }

    try {
      // Delete from storage if path provided
      if (storagePath) {
        await supabase.storage.from(STORAGE_BUCKET).remove([storagePath])
      }

      // Delete from database
      const { error } = await supabase.from(TABLE_NAME).delete().eq('id', id)

      if (error) throw error

      return { success: true }
    } catch (error) {
      console.error('Error deleting media:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Get a single media asset by ID
   * @param {string} id - The asset ID
   * @returns {Promise<object>} - The media asset
   */
  async getMediaById(id) {
    if (!isSupabaseConfigured) {
      const asset = mockMediaLibrary.find((m) => m.id === id)
      return asset ? { success: true, data: asset } : { success: false, error: 'Not found' }
    }

    try {
      const { data, error } = await supabase.from(TABLE_NAME).select('*').eq('id', id).single()

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      console.error('Error fetching media:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Get signed URL for a media asset (for private buckets)
   * @param {string} storagePath - The storage path
   * @param {number} expiresIn - Expiry time in seconds
   * @returns {Promise<string>} - Signed URL
   */
  async getSignedUrl(storagePath, expiresIn = 3600) {
    if (!isSupabaseConfigured) {
      return { success: false, error: 'Supabase not configured' }
    }

    try {
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .createSignedUrl(storagePath, expiresIn)

      if (error) throw error

      return { success: true, url: data.signedUrl }
    } catch (error) {
      console.error('Error getting signed URL:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Get media library stats
   * @param {string} userId - The user ID
   * @returns {Promise<object>} - Stats object
   */
  async getStats(userId = 'demo-user') {
    if (!isSupabaseConfigured) {
      const images = mockMediaLibrary.filter((m) => m.type === 'image').length
      const videos = mockMediaLibrary.filter((m) => m.type === 'video').length
      const aiGenerated = mockMediaLibrary.filter((m) => m.source === 'ai-studio').length
      return {
        success: true,
        data: {
          total: mockMediaLibrary.length,
          images,
          videos,
          aiGenerated,
          totalSize: mockMediaLibrary.reduce((acc, m) => acc + m.file_size, 0),
        },
      }
    }

    try {
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('type, source, file_size')
        .eq('user_id', userId)

      if (error) throw error

      const stats = {
        total: data.length,
        images: data.filter((m) => m.type === 'image').length,
        videos: data.filter((m) => m.type === 'video').length,
        aiGenerated: data.filter((m) => m.source === 'ai-studio').length,
        totalSize: data.reduce((acc, m) => acc + (m.file_size || 0), 0),
      }

      return { success: true, data: stats }
    } catch (error) {
      console.error('Error fetching stats:', error)
      return { success: false, error: error.message }
    }
  }
}

// Export singleton instance
export const mediaLibraryService = new MediaLibraryService()
export default mediaLibraryService
