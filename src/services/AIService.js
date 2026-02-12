/**
 * AIService - Handles AI-powered marketing content generation
 * Calls Supabase Edge Functions which orchestrate Gemini 3 API
 * Supports: copy generation, image analysis, video analysis
 */

class AIService {
  constructor() {
    this.baseUrl = import.meta.env.VITE_SUPABASE_URL
    this.anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  }

  /**
   * Call the ai-studio Edge Function
   * @private
   * @param {string} action - The action to perform
   * @param {object} payload - The payload to send
   * @param {number} timeoutMs - Request timeout in milliseconds (default: 30000)
   */
  async _callEdgeFunction(action, payload, timeoutMs = 30000) {
    // Create AbortController for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const response = await fetch(`${this.baseUrl}/functions/v1/ai-studio`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.anonKey}`,
        },
        body: JSON.stringify({ action, payload }),
        signal: controller.signal,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        // Don't expose internal error details in production
        const isDev = import.meta.env.DEV
        const errorMessage = isDev
          ? errorData.message || `Edge Function error: ${response.status}`
          : response.status >= 500
            ? 'Server error occurred. Please try again.'
            : 'Request failed. Please try again.'
        throw new Error(errorMessage)
      }

      return response.json()
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please try again.')
      }
      throw error
    } finally {
      clearTimeout(timeoutId)
    }
  }

  /**
   * Generate marketing copy from a prompt
   * Uses Gemini 3 Flash for fast generation via Edge Function
   * @param {string} prompt - User's description of what they're selling
   * @param {string|null} imageBase64 - Optional base64 image for multimodal generation
   * @param {object} context - Additional context (platform, tone)
   * @returns {Promise<{text: string}>}
   */
  async generateMarketingCopy(prompt, imageBase64 = null, context = {}) {
    return this._callEdgeFunction('generate-copy', {
      prompt,
      imageBase64,
      context,
    })
  }

  /**
   * Analyze an image using Gemini 3 Pro via Edge Function
   * Extracts scene metadata, subject detection, and copy suggestions
   * @param {string} imageBase64 - Base64 encoded image
   * @returns {Promise<object>} - Scene metadata, subject info, copy suggestions, typography
   */
  async analyzeImage(imageBase64) {
    return this._callEdgeFunction('analyze-image', {
      imageBase64,
    })
  }

  /**
   * Analyze a video using Gemini 3 Pro via Edge Function
   * Extracts scene-by-scene metadata and suggested overlays
   * @param {string} videoBase64 - Base64 encoded video
   * @param {string} mimeType - Video MIME type (default: video/mp4)
   * @returns {Promise<object>} - Key moments, narrative, CTA suggestions
   */
  async analyzeVideo(videoBase64, mimeType = 'video/mp4') {
    return this._callEdgeFunction('analyze-video', {
      videoBase64,
      mimeType,
    })
  }

  /**
   * Generate a background image from a text prompt
   * Uses Imagen 4.0 via Edge Function (Vertex AI)
   * @param {string} prompt - Description of the background
   * @param {object} options - Generation options (width, height, style)
   * @returns {Promise<{imageBase64: string}>}
   */
  async generateBackground(prompt, options = {}) {
    return this._callEdgeFunction('generate-background', {
      prompt,
      width: options.width || 1080,
      height: options.height || 1080,
      style: options.style || 'photorealistic',
    })
  }

  /**
   * Remove background from an image
   * Uses remove.bg API or falls back to Gemini Vision bounds detection
   * @param {string} imageBase64 - Base64 encoded image
   * @returns {Promise<{subjectBase64: string, bounds: object}>}
   */
  async removeBackground(imageBase64) {
    return this._callEdgeFunction('remove-background', {
      imageBase64,
    })
  }

  /**
   * Get typography placement suggestions using AI
   * Suggests position, size, color, and weight that avoids overlapping the subject
   * @param {string|null} imageBase64 - Optional base64 image for context
   * @param {string} textContent - The text to place
   * @param {object} options - Additional options (subjectBounds, canvasWidth, canvasHeight)
   * @returns {Promise<object>} - Typography suggestions
   */
  async suggestTypography(imageBase64, textContent, options = {}) {
    return this._callEdgeFunction('suggest-typography', {
      imageBase64,
      textContent,
      subjectBounds: options.subjectBounds,
      canvasWidth: options.canvasWidth || 1080,
      canvasHeight: options.canvasHeight || 1080,
    })
  }

  /**
   * Get auto-level color adjustments to match subject to background
   * @param {string} subjectBase64 - Base64 encoded subject image
   * @param {string} backgroundBase64 - Base64 encoded background image
   * @returns {Promise<object>} - Color adjustment suggestions
   */
  async autoLevel(subjectBase64, backgroundBase64) {
    return this._callEdgeFunction('auto-level', {
      subjectBase64,
      backgroundBase64,
    })
  }

  // ============================================================================
  // Phase 3: Video Generation Methods
  // ============================================================================

  /**
   * Generate video from text prompt using Veo 3.1 or Sora 2
   * @param {string} prompt - Description of the video to generate
   * @param {object} options - Generation options
   * @param {string} options.model - 'veo-3.1' or 'sora-2'
   * @param {string} options.aspectRatio - '16:9', '9:16', or '1:1'
   * @param {number} options.duration - Duration in seconds (default 8)
   * @param {string} options.style - 'cinematic', 'dynamic', or 'calm'
   * @returns {Promise<{jobId: string, model: string}>}
   */
  async generateVideo(prompt, options = {}) {
    const { model = 'veo-3.1', aspectRatio = '16:9', duration = 8, style = 'cinematic' } = options

    return this._callEdgeFunction('generate-video', {
      prompt,
      model,
      aspectRatio,
      duration,
      style,
    })
  }

  /**
   * Get video generation status
   * @param {string} jobId - The job ID from generateVideo
   * @param {string} model - 'veo-3.1' or 'sora-2'
   * @returns {Promise<{status: string, progress: number, videoUrl?: string}>}
   */
  async getVideoStatus(jobId, model) {
    return this._callEdgeFunction('get-video-status', {
      jobId,
      model,
    })
  }

  /**
   * Poll video generation status until complete (with exponential backoff)
   * @param {string} jobId - The job ID from generateVideo
   * @param {string} model - 'veo-3.1' or 'sora-2'
   * @param {function} onProgress - Progress callback (receives 0-100)
   * @param {number} maxAttempts - Maximum polling attempts (default 60)
   * @returns {Promise<{videoUrl: string}>}
   */
  async pollVideoStatus(jobId, model, onProgress, maxAttempts = 60) {
    let attempts = 0
    let delay = 3000 // Start with 3 seconds

    while (attempts < maxAttempts) {
      const status = await this.getVideoStatus(jobId, model)

      if (status.status === 'completed') {
        onProgress?.(100)
        return { videoUrl: status.videoUrl }
      }

      if (status.status === 'failed') {
        throw new Error(status.error || 'Video generation failed')
      }

      // Report progress
      const progress = status.progress || Math.min((attempts / maxAttempts) * 100, 95)
      onProgress?.(progress)

      // Wait with exponential backoff (max 10 seconds)
      await new Promise((resolve) => setTimeout(resolve, delay))
      delay = Math.min(delay * 1.2, 10000)
      attempts++
    }

    throw new Error('Video generation timed out')
  }

  /**
   * Render video with marketing overlays using Creatomate
   * @param {string} videoUrl - URL of the source video
   * @param {Array} overlays - Array of overlay objects
   * @param {object} options - Rendering options
   * @param {string} options.outputFormat - 'mp4' or 'webm'
   * @param {string} options.resolution - '1080p' or '4k'
   * @returns {Promise<{renderJobId: string, status: string}>}
   */
  async renderVideoWithOverlays(videoUrl, overlays, options = {}) {
    return this._callEdgeFunction('render-video-overlays', {
      videoUrl,
      overlays,
      outputFormat: options.outputFormat || 'mp4',
      resolution: options.resolution || '1080p',
    })
  }

  /**
   * Poll Creatomate render status until complete
   * @param {string} renderJobId - The render job ID
   * @param {function} onProgress - Progress callback
   * @param {number} maxAttempts - Maximum polling attempts
   * @returns {Promise<{videoUrl: string}>}
   */
  async pollRenderStatus(renderJobId, onProgress, maxAttempts = 30) {
    let attempts = 0
    let delay = 2000

    while (attempts < maxAttempts) {
      try {
        // Note: This would need a corresponding Edge Function handler
        // For now, we'll simulate progress
        const progress = Math.min((attempts / maxAttempts) * 100, 95)
        onProgress?.(progress)

        await new Promise((resolve) => setTimeout(resolve, delay))
        delay = Math.min(delay * 1.3, 8000)
        attempts++
      } catch (error) {
        throw new Error(error.message || 'Render status check failed')
      }
    }

    throw new Error('Video rendering timed out')
  }

  /**
   * Legacy method - Generate marketing copy (old interface)
   * Maintained for backwards compatibility with existing code
   * @param {string} productName - Name/description of the product
   * @param {object} options - Additional options
   * @returns {Promise<object>} - { success, data: { headlines[], suggestedColor, etc. } }
   */
  async analyzeProductImage(productName, options = {}) {
    // If we have an actual image, use the new image analysis
    if (options.imageBase64) {
      const analysis = await this.analyzeImage(options.imageBase64)
      return {
        success: true,
        data: {
          headlines: [
            analysis.copy?.headline || `Discover ${productName}`,
            analysis.copy?.subheadline || 'Limited time offer',
            analysis.copy?.cta || 'Shop Now',
          ],
          suggestedColor: '#ffffff',
          suggestedShadow: '#000000',
          suggestedPosition: {
            x: analysis.typography?.placement === 'top' ? 50 : 50,
            y: analysis.typography?.placement === 'top' ? 20 : 80,
          },
          scene: analysis.scene,
          subject: analysis.subject,
          typography: analysis.typography,
        },
      }
    }

    // Use copy generation for text-only requests
    const result = await this.generateMarketingCopy(productName)
    return {
      success: true,
      data: {
        headlines: [result.text || `Discover ${productName}`],
        suggestedColor: '#ffffff',
        suggestedShadow: '#000000',
        suggestedPosition: { x: 50, y: 80 },
      },
    }
  }

  // ============================================================================
  // Phase 3: Advanced AI Methods
  // ============================================================================

  /**
   * Apply intelligent re-lighting to a subject image
   * Simulates lighting effects to match background or preset
   * @param {string} subjectBase64 - Base64 encoded subject image
   * @param {object} lightingSettings - Lighting preset settings
   * @param {string|null} backgroundBase64 - Optional background for reference
   * @returns {Promise<{imageBase64: string, adjustments: object}>}
   */
  async applyRelighting(subjectBase64, lightingSettings, backgroundBase64 = null) {
    return this._callEdgeFunction('apply-relighting', {
      subjectBase64,
      lightingSettings,
      backgroundBase64,
    })
  }

  /**
   * Remove objects from an image using AI inpainting
   * @param {string} imageBase64 - Base64 encoded image
   * @param {string} maskBase64 - Base64 encoded mask (white = remove)
   * @returns {Promise<{imageBase64: string}>}
   */
  async removeObjects(imageBase64, maskBase64) {
    return this._callEdgeFunction('remove-objects', {
      imageBase64,
      maskBase64,
    })
  }

  /**
   * Generate headline variations using AI
   * @param {string} originalHeadline - Current headline text
   * @param {object} context - Context for generation (product, tone, platform)
   * @param {number} count - Number of variations to generate
   * @returns {Promise<{variations: string[]}>}
   */
  async generateHeadlineVariants(originalHeadline, context = {}, count = 5) {
    return this._callEdgeFunction('generate-headline-variants', {
      originalHeadline,
      context,
      count,
    })
  }

  /**
   * Generate color scheme variations
   * @param {object} currentColors - Current color palette
   * @param {string} style - Variation style ('complementary', 'analogous', 'triadic')
   * @param {number} count - Number of variations
   * @returns {Promise<{variations: object[]}>}
   */
  async generateColorVariants(currentColors, style = 'complementary', count = 5) {
    return this._callEdgeFunction('generate-color-variants', {
      currentColors,
      style,
      count,
    })
  }

  /**
   * Generate full design variants (headline + colors + layout suggestions)
   * @param {object} currentDesign - Current design state
   * @param {string[]} variantTypes - Types to generate ('headlines', 'colors', 'layouts')
   * @param {number} count - Number of variants per type
   * @returns {Promise<{variants: object[]}>}
   */
  async generateDesignVariants(currentDesign, variantTypes = ['headlines'], count = 5) {
    return this._callEdgeFunction('generate-design-variants', {
      currentDesign,
      variantTypes,
      count,
    })
  }
}

// Export singleton instance
export const aiService = new AIService()
export default aiService
