/**
 * AI Slice - Manages AI generation states
 *
 * Handles:
 * - Copy generation (Gemini 3 Flash)
 * - Image analysis (Gemini 3 Pro)
 * - Background generation (Imagen 4.0)
 * - Subject processing (remove.bg / Gemini Vision)
 * - Typography suggestions
 * - Auto-leveling
 */

import { aiService } from '@/services/AIService'
import { computeCanvasDimensions } from '../../utils/canvasLogic'

/**
 * Convert a File or Blob to base64 string (returns full data URL)
 */
async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Extract raw base64 from a data URL or return as-is if already raw base64
 */
function extractBase64(input) {
  if (!input) return null
  if (typeof input === 'string' && input.startsWith('data:')) {
    const parts = input.split(',')
    return parts.length > 1 ? parts[1] : null
  }
  return input
}

/**
 * AI slice for Zustand store
 */
export const createAISlice = (set, get) => ({
  // Copy generation
  prompt: '',
  isGenerating: false,

  // Image analysis
  isAnalyzing: false,
  lastAnalysis: null,

  // Background generation (Phase 2)
  backgroundPrompt: '',
  isGeneratingBackground: false,
  generatedBackground: null,

  // Subject processing (Phase 2)
  isRemovingBackground: false,
  subjectImage: null,
  subjectBounds: null,

  // Typography (Phase 2)
  isSuggestingTypography: false,
  typographySuggestion: null,

  // Auto-leveling (Phase 2)
  isAutoLeveling: false,
  levelAdjustments: null,

  // Re-lighting (Phase 3)
  selectedLightingPreset: null,
  isApplyingRelighting: false,

  // Generation error tracking (for haptic feedback)
  lastGenerationError: null,

  // Set prompt
  setPrompt: (prompt) => set({ prompt }),

  // Set background prompt
  setBackgroundPrompt: (backgroundPrompt) => set({ backgroundPrompt }),

  // Set subject image (for object removal updates)
  setSubjectImage: (subjectImage) => set({ subjectImage }),

  // Generate marketing copy
  generate: async () => {
    const { prompt, isGenerating, imageFile, selectedPlatform, textOverlay } = get()
    if (!prompt.trim() || isGenerating) return

    set({ isGenerating: true, lastGenerationError: null })
    try {
      // Get image as base64 if available
      let imageBase64 = null
      if (imageFile) {
        imageBase64 = await fileToBase64(imageFile)
      }

      // Call AI service
      const result = await aiService.generateMarketingCopy(prompt, imageBase64, {
        platform: selectedPlatform,
      })

      // Apply generated text to overlay
      set({
        textOverlay: {
          ...textOverlay,
          text: result.text || prompt.toUpperCase(),
        },
      })
    } catch (error) {
      console.error('Generation failed:', error)
      set({ lastGenerationError: 'generation' })
      // Fallback to uppercase prompt
      set({
        textOverlay: {
          ...textOverlay,
          text: prompt.toUpperCase(),
        },
      })
    } finally {
      set({ isGenerating: false })
    }
  },

  // Analyze image
  analyzeImage: async () => {
    const { imageFile, isAnalyzing, textOverlay } = get()
    if (!imageFile || isAnalyzing) return null

    set({ isAnalyzing: true })
    try {
      const imageBase64 = await fileToBase64(imageFile)
      const analysis = await aiService.analyzeImage(imageBase64)

      set({ lastAnalysis: analysis })

      // Apply suggested headline
      if (analysis.copy?.headline) {
        set({
          textOverlay: {
            ...textOverlay,
            text: analysis.copy.headline,
          },
        })
      }

      return analysis
    } catch (error) {
      console.error('Image analysis failed:', error)
      return null
    } finally {
      set({ isAnalyzing: false })
    }
  },

  // Generate background
  generateBackground: async () => {
    const { backgroundPrompt, isGeneratingBackground } = get()
    if (!backgroundPrompt.trim() || isGeneratingBackground) return

    set({ isGeneratingBackground: true, lastGenerationError: null })
    try {
      const { selectedPlatform } = get()
      const { exportWidth, exportHeight } = computeCanvasDimensions(selectedPlatform)

      const result = await aiService.generateBackground(backgroundPrompt, {
        width: exportWidth,
        height: exportHeight,
        style: 'photorealistic',
      })

      if (result.imageBase64) {
        set({
          generatedBackground: result.imageBase64,
          background: { type: 'image', value: result.imageBase64 },
          activeTemplate: null,
        })
      }

      return result
    } catch (error) {
      console.error('Background generation failed:', error)
      set({ lastGenerationError: 'background' })
      return null
    } finally {
      set({ isGeneratingBackground: false })
    }
  },

  // Remove background from image
  removeBackground: async () => {
    const { imageFile, isRemovingBackground } = get()
    if (!imageFile || isRemovingBackground) return null

    set({ isRemovingBackground: true })
    try {
      const imageBase64 = await fileToBase64(imageFile)
      const result = await aiService.removeBackground(imageBase64)

      if (result.subjectBase64) {
        set({ subjectImage: result.subjectBase64 })
      }
      if (result.bounds) {
        set({ subjectBounds: result.bounds })
      }

      return result
    } catch (error) {
      console.error('Background removal failed:', error)
      return null
    } finally {
      set({ isRemovingBackground: false })
    }
  },

  // Suggest typography placement
  suggestTypography: async () => {
    const { textOverlay, isSuggestingTypography, imageFile, subjectBounds, selectedPlatform } =
      get()
    if (!textOverlay?.text || isSuggestingTypography) return null

    set({ isSuggestingTypography: true })
    try {
      let imageBase64 = null
      if (imageFile) {
        imageBase64 = await fileToBase64(imageFile)
      }

      const { exportWidth, exportHeight, canvasWidth, canvasHeight } =
        computeCanvasDimensions(selectedPlatform)

      const result = await aiService.suggestTypography(imageBase64, textOverlay.text, {
        subjectBounds,
        canvasWidth: exportWidth,
        canvasHeight: exportHeight,
      })

      set({ typographySuggestion: result })

      // Apply suggestions if not a fallback
      if (!result.fallback && result.position) {
        const fontSizeMap = { small: 32, medium: 42, large: 56, xlarge: 72 }
        set({
          textOverlay: {
            ...textOverlay,
            x: (result.position.x / 100) * canvasWidth,
            y: (result.position.y / 100) * canvasHeight,
            color: result.color || textOverlay.color,
            fontSize: fontSizeMap[result.fontSize] || textOverlay.fontSize,
          },
        })
      }

      return result
    } catch (error) {
      console.error('Typography suggestion failed:', error)
      return null
    } finally {
      set({ isSuggestingTypography: false })
    }
  },

  // Auto-level subject to match background
  autoLevel: async () => {
    const { isAutoLeveling, subjectImage, imageFile, generatedBackground } = get()
    if (isAutoLeveling) return null

    // Need subject and generated background
    let subjectSource = subjectImage
    if (!subjectSource && imageFile) {
      subjectSource = await fileToBase64(imageFile)
    }
    if (!subjectSource || !generatedBackground) return null

    // Ensure raw base64 for API calls
    const subjectBase64 = extractBase64(subjectSource)
    const backgroundBase64 = extractBase64(generatedBackground)

    set({ isAutoLeveling: true })
    try {
      const result = await aiService.autoLevel(subjectBase64, backgroundBase64)
      set({ levelAdjustments: result })
      return result
    } catch (error) {
      console.error('Auto-level failed:', error)
      return null
    } finally {
      set({ isAutoLeveling: false })
    }
  },

  // Set selected lighting preset (Phase 3)
  setSelectedLightingPreset: (preset) => set({ selectedLightingPreset: preset }),

  // Apply re-lighting to subject (Phase 3)
  applyRelighting: async (lightingSettings) => {
    const { isApplyingRelighting, subjectImage, imageFile, generatedBackground } = get()
    if (isApplyingRelighting) return null

    // Need subject image
    let subjectSource = subjectImage
    if (!subjectSource && imageFile) {
      subjectSource = await fileToBase64(imageFile)
    }
    if (!subjectSource) return null

    // Ensure raw base64 for API calls
    const subjectBase64 = extractBase64(subjectSource)
    const backgroundBase64 = extractBase64(generatedBackground)

    set({ isApplyingRelighting: true })
    try {
      const result = await aiService.applyRelighting(
        subjectBase64,
        lightingSettings,
        backgroundBase64
      )

      // If successful, update the subject image with the relit version
      if (result.imageBase64 && !result.fallback) {
        set({ subjectImage: result.imageBase64 })
      }

      return result
    } catch (error) {
      console.error('Re-lighting failed:', error)
      return null
    } finally {
      set({ isApplyingRelighting: false })
    }
  },

  // Reset AI state (called by global reset)
  resetAIState: () => {
    set({
      prompt: '',
      isGenerating: false,
      isAnalyzing: false,
      lastAnalysis: null,
      backgroundPrompt: '',
      isGeneratingBackground: false,
      generatedBackground: null,
      isRemovingBackground: false,
      subjectImage: null,
      subjectBounds: null,
      isSuggestingTypography: false,
      typographySuggestion: null,
      isAutoLeveling: false,
      levelAdjustments: null,
      selectedLightingPreset: null,
      isApplyingRelighting: false,
      lastGenerationError: null,
    })
  },
})
