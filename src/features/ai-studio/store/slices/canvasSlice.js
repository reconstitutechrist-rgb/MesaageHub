/**
 * Canvas Slice - Manages platform, background, image, and template state
 */

import { platformPresets } from '@/lib/platformTemplates'
import { CANVAS_CONSTRAINTS } from '../../utils/studioConstants'
import { scaleToFit, computeCanvasDimensions } from '../../utils/canvasLogic'

// Re-export for backwards compatibility
export { computeCanvasDimensions }

/**
 * Canvas slice for Zustand store
 */
export const createCanvasSlice = (set, get) => ({
  // Platform state
  selectedPlatform: 'instagram-post',

  // Background state
  background: { type: 'solid', value: null },

  // Image state
  imageFile: null,

  // Template state
  activeTemplate: null,

  // Set selected platform
  setSelectedPlatform: (platformId) => {
    set({ selectedPlatform: platformId })

    // Recenter text overlay when platform changes
    const preset = platformPresets[platformId]
    if (preset) {
      const { MAX_DISPLAY_WIDTH, MAX_DISPLAY_HEIGHT } = CANVAS_CONSTRAINTS
      const scaled = scaleToFit(preset.width, preset.height, MAX_DISPLAY_WIDTH, MAX_DISPLAY_HEIGHT)
      // Update text overlay position via its slice
      const textOverlay = get().textOverlay
      if (textOverlay) {
        set({
          textOverlay: {
            ...textOverlay,
            x: scaled.width / 2,
            y: scaled.height / 2,
          },
        })
      }
    }
  },

  // Set background (clears template if custom)
  setBackground: (newBackground) => {
    set({ background: newBackground })
    // Clear template when setting custom background
    if (newBackground.value) {
      set({ activeTemplate: null })
    }
  },

  // Set image file (clears subject processing state)
  setImageFile: (file) => {
    set({
      imageFile: file,
      // Clear AI subject state when new image is uploaded
      subjectImage: null,
      subjectBounds: null,
      levelAdjustments: null,
    })
  },

  // Clear image
  clearImage: () => {
    set({
      imageFile: null,
      subjectImage: null,
      subjectBounds: null,
      levelAdjustments: null,
    })
  },

  // Set active template (clears background)
  setActiveTemplate: (template) => {
    set({
      activeTemplate: template,
      background: { type: 'solid', value: null },
    })

    // Apply template's main text to text overlay
    if (template?.elements) {
      const mainText = template.elements.find((e) => e.type === 'text' && e.fontSize > 60)
      if (mainText) {
        const textOverlay = get().textOverlay
        set({
          textOverlay: {
            ...textOverlay,
            text: mainText.content,
            color: mainText.color || '#ffffff',
          },
        })
      }
    }
  },

  // Clear template
  clearTemplate: () => {
    set({
      activeTemplate: null,
      background: { type: 'solid', value: null },
    })
  },

  // Reset canvas state (called by global reset)
  resetCanvasState: () => {
    set({
      selectedPlatform: 'instagram-post',
      background: { type: 'solid', value: null },
      imageFile: null,
      activeTemplate: null,
    })
  },
})
