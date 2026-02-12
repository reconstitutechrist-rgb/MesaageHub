import { supabase } from '@/lib/supabase'

/**
 * MediaLibraryService - Handles media asset storage and management
 * Uses Supabase Storage for file storage and database for metadata
 */

const STORAGE_BUCKET = 'media-assets'
const TABLE_NAME = 'media_assets'

class MediaLibraryService {
  /**
   * Upload a media file to storage
   * @param {File|Blob} file - The file to upload
   * @param {string} source - Source of the file: 'upload' | 'ai-studio' | 'camera'
   * @param {string} userId - The user ID
   * @returns {Promise<object>} - The saved media asset record
   */
  async uploadMedia(file, source = 'upload', userId = 'demo-user') {
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
  async uploadFromDataUrl(dataUrl, fileName = 'export.png', source = 'ai-studio', userId = 'demo-user') {
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

  // ============================================
  // CDN Helper Methods (Phase 4)
  // ============================================

  /**
   * Persist AI-generated image to CDN
   * Used by Edge Function for auto-caching generated images
   * @param {string} base64Data - Base64 encoded image data (with or without prefix)
   * @param {string} aiModel - The AI model used (e.g., 'imagen-4.0', 'gemini')
   * @param {string} userId - The user ID
   * @returns {Promise<object>} - CDN URL and storage path
   */
  async persistAIImageToCDN(base64Data, aiModel = 'unknown', userId = 'demo-user') {
    try {
      // Strip data URL prefix if present
      const base64Clean = base64Data.replace(/^data:image\/\w+;base64,/, '')

      // Convert base64 to Blob
      const byteCharacters = atob(base64Clean)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: 'image/png' })

      // Generate unique path with model info for analytics
      const timestamp = Date.now()
      const hash = Math.random().toString(36).substring(2, 10)
      const storagePath = `${userId}/ai-generated/${aiModel}/${timestamp}-${hash}.png`

      // Upload to Supabase Storage with long cache
      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(storagePath, blob, {
          contentType: 'image/png',
          cacheControl: '31536000', // 1 year cache
          upsert: false,
        })

      if (uploadError) throw uploadError

      // Get public CDN URL
      const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath)

      return {
        success: true,
        cdnUrl: urlData.publicUrl,
        storagePath,
      }
    } catch (error) {
      console.error('Failed to persist AI image to CDN:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Copy video from external URL to CDN
   * Used to cache videos from Veo/Sora on our CDN
   * @param {string} externalUrl - External video URL (from Veo or Sora)
   * @param {string} aiModel - The AI model used (e.g., 'veo-3.1', 'sora-2')
   * @param {string} userId - The user ID
   * @returns {Promise<object>} - CDN URL and storage path
   */
  async copyVideoToCDN(externalUrl, aiModel = 'unknown', userId = 'demo-user') {
    try {
      // Fetch video from external URL
      const response = await fetch(externalUrl)
      if (!response.ok) {
        throw new Error(`Failed to fetch video: ${response.status}`)
      }
      const blob = await response.blob()

      // Generate unique path
      const timestamp = Date.now()
      const hash = Math.random().toString(36).substring(2, 10)
      const storagePath = `${userId}/ai-videos/${aiModel}/${timestamp}-${hash}.mp4`

      // Upload to Supabase Storage with long cache
      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(storagePath, blob, {
          contentType: 'video/mp4',
          cacheControl: '31536000', // 1 year cache
          upsert: false,
        })

      if (uploadError) throw uploadError

      // Get public CDN URL
      const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath)

      return {
        success: true,
        cdnUrl: urlData.publicUrl,
        storagePath,
      }
    } catch (error) {
      console.error('Failed to copy video to CDN:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Get CDN URL with optional image transforms
   * Supabase Storage supports on-the-fly transforms for images
   * @param {string} storagePath - The storage path
   * @param {object} options - Transform options
   * @returns {string} - CDN URL with transforms
   */
  getCDNUrl(storagePath, options = {}) {
    const { width, height, quality, format } = options

    const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath)

    let url = data.publicUrl

    // Add transform parameters if specified
    const params = []
    if (width) params.push(`width=${width}`)
    if (height) params.push(`height=${height}`)
    if (quality) params.push(`quality=${quality}`)
    if (format) params.push(`format=${format}`)

    if (params.length > 0) {
      url += (url.includes('?') ? '&' : '?') + params.join('&')
    }

    return url
  }

  /**
   * Get media library stats
   * @param {string} userId - The user ID
   * @returns {Promise<object>} - Stats object
   */
  async getStats(userId = 'demo-user') {
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
