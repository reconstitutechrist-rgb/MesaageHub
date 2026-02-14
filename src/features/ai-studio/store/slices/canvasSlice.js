/**
 * Canvas Slice - Manages platform, background, image, and template state
 */

import { platformPresets } from '@/lib/platformTemplates'
import { CANVAS_CONSTRAINTS } from '../../utils/studioConstants'
import { scaleToFit, computeCanvasDimensions } from '../../utils/canvasLogic'
import { createTextLayer } from './layerSlice'

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

  // Set active template — converts elements into interactive layers
  setActiveTemplate: (template) => {
    if (!template || !template.elements) {
      set({ activeTemplate: null })
      return
    }

    // 1. Extract and apply background from template
    const bgElement = template.elements.find((e) => e.type === 'background')
    if (bgElement) {
      if (bgElement.style === 'gradient' && bgElement.colors) {
        set({ background: { type: 'gradient', value: bgElement.colors } })
      } else if (bgElement.style === 'solid' && bgElement.color) {
        set({ background: { type: 'solid', value: bgElement.color } })
      }
    }

    // 2. Convert text elements into layers
    const textElements = template.elements.filter((e) => e.type === 'text')
    const currentMaxZ = Math.max(100, ...get().layers.map((l) => l.zIndex))

    textElements.forEach((el, index) => {
      // Convert position: 'center' -> 50, percentage string -> number
      const xPos = el.position?.x === 'center' ? 50 : parseFloat(el.position?.x) || 50
      const yPos = parseFloat(el.position?.y) || 50

      const layer = createTextLayer({
        name: el.content || 'Template Text',
        zIndex: currentMaxZ + index + 1,
        data: {
          text: el.content || '',
          x: xPos,
          y: yPos,
          color: el.color || '#ffffff',
          fontSize: el.fontSize || 48,
          fontWeight: el.fontWeight || 'bold',
        },
      })

      get().addLayer(layer)
    })

    // 3. Clear activeTemplate — layers now represent the template content
    set({ activeTemplate: null })
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
