/**
 * AIService - Handles AI-powered marketing content generation
 * Currently uses mock responses, ready for real API integration (Gemini, OpenAI, etc.)
 */

class AIService {
  constructor() {
    this.provider = 'mock' // 'mock' | 'gemini' | 'openai'
  }

  /**
   * Set the AI provider
   * @param {'mock' | 'gemini' | 'openai'} provider
   */
  setProvider(provider) {
    this.provider = provider
  }

  /**
   * Get current provider
   * @returns {string}
   */
  getProvider() {
    return this.provider
  }

  /**
   * Generate marketing copy from a prompt
   * Used by AIStudioFullScreen for quick text generation
   * @param {string} prompt - User's description of what they're selling
   * @param {object} options - Additional options
   * @returns {Promise<object>} - { success, data: { headline, subhead, cta, suggestedColor } }
   */
  async generateMarketingCopy(prompt, options = {}) {
    if (this.provider === 'mock') {
      return this._mockGenerateCopy(prompt, options)
    }

    // TODO: Implement real API calls
    // if (this.provider === 'gemini') {
    //   return this._geminiGenerateCopy(prompt, options)
    // }

    return { success: false, error: `Provider '${this.provider}' not implemented` }
  }

  /**
   * Analyze a product image and generate marketing suggestions
   * Used by MarketingAIModal for image-based copy generation
   * @param {string} productName - Name/description of the product
   * @param {object} options - Additional options (e.g., image data for future use)
   * @returns {Promise<object>} - { success, data: { headlines[], suggestedColor, suggestedShadow, suggestedPosition } }
   */
  async analyzeProductImage(productName, options = {}) {
    if (this.provider === 'mock') {
      return this._mockAnalyzeImage(productName, options)
    }

    // TODO: Implement real API calls with image analysis
    // if (this.provider === 'gemini') {
    //   return this._geminiAnalyzeImage(productName, options)
    // }

    return { success: false, error: `Provider '${this.provider}' not implemented` }
  }

  /**
   * Mock implementation for copy generation
   * Mimics the behavior from PhoneDashboardPage handleGenerate
   * @private
   */
  async _mockGenerateCopy(prompt, options = {}) {
    const { delay = 2000 } = options

    return new Promise((resolve) => {
      setTimeout(() => {
        const lowerPrompt = prompt.toLowerCase()

        let headline = prompt.toUpperCase()
        let subhead = 'Limited time offer'
        let cta = 'Shop Now'
        let suggestedColor = '#ffffff'

        // Pattern matching for common marketing scenarios
        if (lowerPrompt.includes('sale')) {
          headline = 'MEGA SALE 50% OFF'
          subhead = "Don't miss out on these deals"
          cta = 'Shop the Sale'
          suggestedColor = '#ef4444' // Red for urgency
        } else if (lowerPrompt.includes('new')) {
          headline = 'NEW ARRIVAL'
          subhead = 'Be the first to discover'
          cta = 'Explore Now'
          suggestedColor = '#3b82f6' // Blue for newness
        } else if (lowerPrompt.includes('summer')) {
          headline = 'SUMMER COLLECTION'
          subhead = 'Hot styles for hot days'
          cta = 'Get Summer Ready'
          suggestedColor = '#f59e0b' // Amber for warmth
        } else if (lowerPrompt.includes('holiday') || lowerPrompt.includes('christmas')) {
          headline = 'HOLIDAY SPECIAL'
          subhead = 'Spread the joy this season'
          cta = 'Shop Gifts'
          suggestedColor = '#22c55e' // Green for holidays
        } else if (lowerPrompt.includes('limited') || lowerPrompt.includes('exclusive')) {
          headline = 'EXCLUSIVE OFFER'
          subhead = 'Only while supplies last'
          cta = 'Claim Now'
          suggestedColor = '#a855f7' // Purple for exclusivity
        }

        resolve({
          success: true,
          data: {
            headline,
            subhead,
            cta,
            suggestedColor,
            suggestedPosition: { x: 50, y: 50 }, // Center position in percentages
          },
        })
      }, delay)
    })
  }

  /**
   * Mock implementation for image analysis
   * Mimics the behavior from MarketingAIModal mockGeminiAnalysis
   * @private
   */
  async _mockAnalyzeImage(productName, options = {}) {
    const { delay = 1500 } = options
    const name = productName || 'Product'

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: {
            headlines: [
              `Summer Sale: ${name}`,
              `Limited Time Offer on ${name}`,
              `Get your ${name} Today!`,
            ],
            suggestedColor: '#ffffff',
            suggestedShadow: '#000000',
            suggestedPosition: { x: 50, y: 80 }, // % coordinates - bottom center
          },
        })
      }, delay)
    })
  }

  // Future API implementations would go here:
  // async _geminiGenerateCopy(prompt, options) { ... }
  // async _geminiAnalyzeImage(productName, options) { ... }
  // async _openaiGenerateCopy(prompt, options) { ... }
}

// Export singleton instance
export const aiService = new AIService()
export default aiService
