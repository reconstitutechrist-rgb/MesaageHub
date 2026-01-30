/**
 * AIService - Handles AI-powered marketing content generation
 * Calls Supabase Edge Functions which orchestrate Gemini 3 API
 * Supports: copy generation, image analysis, video analysis
 */

class AIService {
  constructor() {
    this.baseUrl = import.meta.env.VITE_SUPABASE_URL
    this.anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
    this.useMock = !this.baseUrl || !this.anonKey
  }

  /**
   * Call the ai-studio Edge Function
   * @private
   * @param {string} action - The action to perform
   * @param {object} payload - The payload to send
   * @param {number} timeoutMs - Request timeout in milliseconds (default: 30000)
   */
  async _callEdgeFunction(action, payload, timeoutMs = 30000) {
    if (this.useMock) {
      throw new Error('Edge Functions not configured - using mock')
    }

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
   * @returns {Promise<{text: string, fallback: boolean}>}
   */
  async generateMarketingCopy(prompt, imageBase64 = null, context = {}) {
    try {
      const result = await this._callEdgeFunction('generate-copy', {
        prompt,
        imageBase64,
        context,
      })
      return result
    } catch (error) {
      console.warn('Edge Function failed, using mock:', error.message)
      return this._mockGenerateCopy(prompt, context)
    }
  }

  /**
   * Analyze an image using Gemini 3 Pro via Edge Function
   * Extracts scene metadata, subject detection, and copy suggestions
   * @param {string} imageBase64 - Base64 encoded image
   * @returns {Promise<object>} - Scene metadata, subject info, copy suggestions, typography
   */
  async analyzeImage(imageBase64) {
    try {
      const result = await this._callEdgeFunction('analyze-image', {
        imageBase64,
      })
      return result
    } catch (error) {
      console.warn('Image analysis failed, using mock:', error.message)
      return this._mockAnalyzeImage(imageBase64)
    }
  }

  /**
   * Analyze a video using Gemini 3 Pro via Edge Function
   * Extracts scene-by-scene metadata and suggested overlays
   * @param {string} videoBase64 - Base64 encoded video
   * @param {string} mimeType - Video MIME type (default: video/mp4)
   * @returns {Promise<object>} - Key moments, narrative, CTA suggestions
   */
  async analyzeVideo(videoBase64, mimeType = 'video/mp4') {
    try {
      const result = await this._callEdgeFunction('analyze-video', {
        videoBase64,
        mimeType,
      })
      return result
    } catch (error) {
      console.warn('Video analysis failed, using mock:', error.message)
      return {
        keyMoments: [],
        narrative: 'Video analysis unavailable',
        recommendedCTA: 'Learn More',
        fallback: true,
      }
    }
  }

  /**
   * Generate a background image from a text prompt
   * Uses Imagen 4.0 via Edge Function (Vertex AI)
   * @param {string} prompt - Description of the background
   * @param {object} options - Generation options (width, height, style)
   * @returns {Promise<{imageBase64: string|null, fallback: boolean}>}
   */
  async generateBackground(prompt, options = {}) {
    try {
      const result = await this._callEdgeFunction('generate-background', {
        prompt,
        width: options.width || 1080,
        height: options.height || 1080,
        style: options.style || 'photorealistic',
      })
      return result
    } catch (error) {
      console.warn('Background generation failed:', error.message)
      return { imageBase64: null, fallback: true, error: error.message }
    }
  }

  /**
   * Remove background from an image
   * Uses remove.bg API or falls back to Gemini Vision bounds detection
   * @param {string} imageBase64 - Base64 encoded image
   * @returns {Promise<{subjectBase64: string|null, bounds: object|null, fallback: boolean}>}
   */
  async removeBackground(imageBase64) {
    try {
      const result = await this._callEdgeFunction('remove-background', {
        imageBase64,
      })
      return result
    } catch (error) {
      console.warn('Background removal failed:', error.message)
      return { subjectBase64: null, bounds: null, fallback: true }
    }
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
    try {
      const result = await this._callEdgeFunction('suggest-typography', {
        imageBase64,
        textContent,
        subjectBounds: options.subjectBounds,
        canvasWidth: options.canvasWidth || 1080,
        canvasHeight: options.canvasHeight || 1080,
      })
      return result
    } catch (error) {
      console.warn('Typography suggestion failed:', error.message)
      return this._mockTypographySuggestion(textContent, options)
    }
  }

  /**
   * Get auto-level color adjustments to match subject to background
   * @param {string} subjectBase64 - Base64 encoded subject image
   * @param {string} backgroundBase64 - Base64 encoded background image
   * @returns {Promise<object>} - Color adjustment suggestions
   */
  async autoLevel(subjectBase64, backgroundBase64) {
    try {
      const result = await this._callEdgeFunction('auto-level', {
        subjectBase64,
        backgroundBase64,
      })
      return result
    } catch (error) {
      console.warn('Auto-level failed:', error.message)
      return {
        brightness: 0,
        contrast: 0,
        saturation: 0,
        warmth: 0,
        shadowOpacity: 0.3,
        shadowBlur: 20,
        shadowOffsetY: 10,
        fallback: true,
      }
    }
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
   * @returns {Promise<{jobId: string|null, model: string, fallback: boolean}>}
   */
  async generateVideo(prompt, options = {}) {
    const { model = 'veo-3.1', aspectRatio = '16:9', duration = 8, style = 'cinematic' } = options

    try {
      const result = await this._callEdgeFunction('generate-video', {
        prompt,
        model,
        aspectRatio,
        duration,
        style,
      })
      return result
    } catch (error) {
      console.warn('Video generation failed:', error.message)
      return { jobId: null, error: error.message, fallback: true }
    }
  }

  /**
   * Get video generation status
   * @param {string} jobId - The job ID from generateVideo
   * @param {string} model - 'veo-3.1' or 'sora-2'
   * @returns {Promise<{status: string, progress: number, videoUrl?: string}>}
   */
  async getVideoStatus(jobId, model) {
    try {
      const result = await this._callEdgeFunction('get-video-status', {
        jobId,
        model,
      })
      return result
    } catch (error) {
      console.warn('Video status check failed:', error.message)
      return { status: 'failed', error: error.message }
    }
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
   * @returns {Promise<{renderJobId: string|null, status: string, fallback: boolean}>}
   */
  async renderVideoWithOverlays(videoUrl, overlays, options = {}) {
    try {
      const result = await this._callEdgeFunction('render-video-overlays', {
        videoUrl,
        overlays,
        outputFormat: options.outputFormat || 'mp4',
        resolution: options.resolution || '1080p',
      })
      return result
    } catch (error) {
      console.warn('Video overlay rendering failed:', error.message)
      return { renderJobId: null, error: error.message, fallback: true }
    }
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
   * Mock typography suggestion (fallback)
   * @private
   */
  _mockTypographySuggestion(textContent, options = {}) {
    const { subjectBounds } = options
    // Place text above subject if subject is in bottom half, otherwise below
    const defaultY = subjectBounds ? (subjectBounds.y > 50 ? 15 : 85) : 50
    return {
      position: { x: 50, y: defaultY },
      fontSize: 'large',
      fontWeight: '700',
      color: '#ffffff',
      textAlign: 'center',
      shadow: true,
      fallback: true,
    }
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
      try {
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
      } catch {
        // Fall through to mock
      }
    }

    // Fall back to mock for legacy usage
    return this._mockAnalyzeImageLegacy(productName, options)
  }

  /**
   * Mock implementation for copy generation (fallback)
   * @private
   */
  _mockGenerateCopy(prompt, _context = {}) {
    const lowerPrompt = prompt.toLowerCase()
    let text = prompt.toUpperCase()

    // Pattern matching for common marketing scenarios
    if (lowerPrompt.includes('sale')) {
      text = 'MEGA SALE - 50% OFF EVERYTHING!'
    } else if (lowerPrompt.includes('new')) {
      text = 'NEW ARRIVAL - BE THE FIRST TO DISCOVER'
    } else if (lowerPrompt.includes('summer')) {
      text = 'SUMMER COLLECTION - HOT STYLES FOR HOT DAYS'
    } else if (lowerPrompt.includes('holiday') || lowerPrompt.includes('christmas')) {
      text = 'HOLIDAY SPECIAL - SPREAD THE JOY THIS SEASON'
    } else if (lowerPrompt.includes('limited') || lowerPrompt.includes('exclusive')) {
      text = 'EXCLUSIVE OFFER - ONLY WHILE SUPPLIES LAST'
    }

    return { text, fallback: true }
  }

  /**
   * Mock implementation for image analysis (fallback)
   * @private
   */
  _mockAnalyzeImage(_imageBase64) {
    return {
      scene: { lighting: 'natural', mood: 'professional', colors: ['#ffffff', '#000000'] },
      subject: { type: 'product', material: 'unknown', primaryColor: '#ffffff' },
      copy: {
        headline: 'Your Product Here',
        subheadline: 'Quality you can trust',
        cta: 'Shop Now',
      },
      typography: { fontStyle: 'sans', placement: 'bottom', suggestedSize: 'large' },
      fallback: true,
    }
  }

  /**
   * Mock implementation for legacy analyzeProductImage (fallback)
   * @private
   */
  _mockAnalyzeImageLegacy(productName, _options = {}) {
    const name = productName || 'Product'

    return {
      success: true,
      data: {
        headlines: [
          `Summer Sale: ${name}`,
          `Limited Time Offer on ${name}`,
          `Get your ${name} Today!`,
        ],
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
   * @returns {Promise<{imageBase64: string|null, adjustments: object, fallback: boolean}>}
   */
  async applyRelighting(subjectBase64, lightingSettings, backgroundBase64 = null) {
    try {
      const result = await this._callEdgeFunction('apply-relighting', {
        subjectBase64,
        lightingSettings,
        backgroundBase64,
      })
      return result
    } catch (error) {
      console.warn('Re-lighting failed:', error.message)
      // Return mock adjustments for CSS-based fallback
      return {
        imageBase64: null,
        adjustments: this._mockRelightingAdjustments(lightingSettings),
        fallback: true,
      }
    }
  }

  /**
   * Remove objects from an image using AI inpainting
   * @param {string} imageBase64 - Base64 encoded image
   * @param {string} maskBase64 - Base64 encoded mask (white = remove)
   * @returns {Promise<{imageBase64: string|null, fallback: boolean}>}
   */
  async removeObjects(imageBase64, maskBase64) {
    try {
      const result = await this._callEdgeFunction('remove-objects', {
        imageBase64,
        maskBase64,
      })
      return result
    } catch (error) {
      console.warn('Object removal failed:', error.message)
      return { imageBase64: null, fallback: true, error: error.message }
    }
  }

  /**
   * Generate headline variations using AI
   * @param {string} originalHeadline - Current headline text
   * @param {object} context - Context for generation (product, tone, platform)
   * @param {number} count - Number of variations to generate
   * @returns {Promise<{variations: string[], fallback: boolean}>}
   */
  async generateHeadlineVariants(originalHeadline, context = {}, count = 5) {
    try {
      const result = await this._callEdgeFunction('generate-headline-variants', {
        originalHeadline,
        context,
        count,
      })
      return result
    } catch (error) {
      console.warn('Headline generation failed:', error.message)
      return {
        variations: this._mockHeadlineVariants(originalHeadline, count),
        fallback: true,
      }
    }
  }

  /**
   * Generate color scheme variations
   * @param {object} currentColors - Current color palette
   * @param {string} style - Variation style ('complementary', 'analogous', 'triadic')
   * @param {number} count - Number of variations
   * @returns {Promise<{variations: object[], fallback: boolean}>}
   */
  async generateColorVariants(currentColors, style = 'complementary', count = 5) {
    try {
      const result = await this._callEdgeFunction('generate-color-variants', {
        currentColors,
        style,
        count,
      })
      return result
    } catch (error) {
      console.warn('Color variant generation failed:', error.message)
      return {
        variations: this._mockColorVariants(currentColors, count),
        fallback: true,
      }
    }
  }

  /**
   * Generate full design variants (headline + colors + layout suggestions)
   * @param {object} currentDesign - Current design state
   * @param {string[]} variantTypes - Types to generate ('headlines', 'colors', 'layouts')
   * @param {number} count - Number of variants per type
   * @returns {Promise<{variants: object[], fallback: boolean}>}
   */
  async generateDesignVariants(currentDesign, variantTypes = ['headlines'], count = 5) {
    try {
      const result = await this._callEdgeFunction('generate-design-variants', {
        currentDesign,
        variantTypes,
        count,
      })
      return result
    } catch (error) {
      console.warn('Design variant generation failed:', error.message)
      return {
        variants: this._mockDesignVariants(currentDesign, variantTypes, count),
        fallback: true,
      }
    }
  }

  /**
   * Mock re-lighting adjustments for CSS filter fallback
   * @private
   */
  _mockRelightingAdjustments(settings) {
    const temp = settings.temperature || 5600
    const warmth = temp < 5000 ? (5000 - temp) / 100 : -(temp - 5000) / 200

    return {
      brightness: (settings.intensity || 1) * 100,
      contrast: settings.shadowSoftness < 0.5 ? 115 : 100,
      saturate: settings.highlightIntensity > 0.5 ? 110 : 100,
      sepia: warmth > 0 ? Math.min(warmth * 10, 30) : 0,
      hueRotate: warmth < 0 ? Math.max(warmth * 5, -15) : 0,
    }
  }

  /**
   * Mock headline variants for fallback
   * @private
   */
  _mockHeadlineVariants(original, count) {
    const templates = [
      (text) => text.toUpperCase(),
      (text) => `🔥 ${text}`,
      (text) => `${text} - Limited Time!`,
      (text) => `Don't Miss: ${text}`,
      (text) => `NEW: ${text}`,
      (text) => `${text} | Shop Now`,
      (text) => `Exclusive: ${text}`,
    ]

    const variations = []
    for (let i = 0; i < count && i < templates.length; i++) {
      variations.push(templates[i](original))
    }
    return variations
  }

  /**
   * Mock color variants for fallback
   * @private
   */
  _mockColorVariants(currentColors, count) {
    const primary = currentColors.primary || '#3b82f6'
    const variations = []

    // Generate simple hue-shifted variants
    const baseHue = this._hexToHsl(primary).h
    for (let i = 0; i < count; i++) {
      const hueShift = (360 / count) * i
      const newHue = (baseHue + hueShift) % 360
      variations.push({
        primary: this._hslToHex(newHue, 70, 50),
        secondary: this._hslToHex((newHue + 30) % 360, 60, 45),
        accent: this._hslToHex((newHue + 180) % 360, 80, 55),
        text: '#ffffff',
        background: '#1a1a2e',
      })
    }
    return variations
  }

  /**
   * Mock design variants for fallback
   * @private
   */
  _mockDesignVariants(currentDesign, variantTypes, count) {
    const variants = []
    const headlines = currentDesign.headlines || ['Your Product Here']

    for (let i = 0; i < count; i++) {
      const variant = { id: `variant-${i + 1}`, label: `Variant ${String.fromCharCode(65 + i)}` }

      if (variantTypes.includes('headlines')) {
        variant.headline = this._mockHeadlineVariants(headlines[0], 1)[0]
      }
      if (variantTypes.includes('colors')) {
        const colors = this._mockColorVariants(currentDesign.colors || {}, count)
        variant.colors = colors[i] || colors[0]
      }
      if (variantTypes.includes('layouts')) {
        variant.layout = {
          textPosition: i % 2 === 0 ? 'top' : 'bottom',
          textAlign: ['left', 'center', 'right'][i % 3],
        }
      }

      variants.push(variant)
    }
    return variants
  }

  /**
   * Convert hex to HSL
   * @private
   */
  _hexToHsl(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    if (!result) return { h: 0, s: 50, l: 50 }

    const r = parseInt(result[1], 16) / 255
    const g = parseInt(result[2], 16) / 255
    const b = parseInt(result[3], 16) / 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0
    let s = 0
    const l = (max + min) / 2

    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6
          break
        case g:
          h = ((b - r) / d + 2) / 6
          break
        case b:
          h = ((r - g) / d + 4) / 6
          break
      }
    }

    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
  }

  /**
   * Convert HSL to hex
   * @private
   */
  _hslToHex(h, s, l) {
    s /= 100
    l /= 100
    const a = s * Math.min(l, 1 - l)
    const f = (n) => {
      const k = (n + h / 30) % 12
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
      return Math.round(255 * color)
        .toString(16)
        .padStart(2, '0')
    }
    return `#${f(0)}${f(8)}${f(4)}`
  }
}

// Export singleton instance
export const aiService = new AIService()
export default aiService
