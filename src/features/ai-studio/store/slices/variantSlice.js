/**
 * Variant Slice - Manages A/B design variants state
 *
 * Handles:
 * - Generated design variants (headlines, colors, layouts)
 * - Variant comparison and selection
 * - Export as variant set
 */

import { aiService } from '@/services/AIService'

/**
 * Variant slice for Zustand store
 */
export const createVariantSlice = (set, get) => ({
  // Variant state
  variants: [],
  selectedVariantId: null,
  isGeneratingVariants: false,
  variantError: null,
  variantTypes: ['headlines'], // Default to headline generation
  variantCount: 5,

  // Set variant types to generate
  setVariantTypes: (types) => set({ variantTypes: types }),

  // Set number of variants to generate
  setVariantCount: (count) => set({ variantCount: count }),

  // Select a variant for preview
  selectVariant: (variantId) => set({ selectedVariantId: variantId }),

  // Clear variant selection
  clearVariantSelection: () => set({ selectedVariantId: null }),

  // Generate design variants
  generateVariants: async () => {
    const {
      isGeneratingVariants,
      variantTypes,
      variantCount,
      layers,
      textOverlay,
      activeBrandKit,
    } = get()
    if (isGeneratingVariants) return

    set({ isGeneratingVariants: true, variantError: null, variants: [] })

    try {
      // Build current design context
      const currentDesign = {
        headlines: [],
        colors: activeBrandKit?.colors || {
          primary: '#3b82f6',
          secondary: '#8b5cf6',
          accent: '#f59e0b',
          text: '#ffffff',
          background: '#1a1a2e',
        },
        layers: layers,
      }

      // Extract headlines from text layers and textOverlay
      if (textOverlay?.text) {
        currentDesign.headlines.push(textOverlay.text)
      }
      layers
        .filter((l) => l.type === 'text' && l.data?.text)
        .forEach((l) => currentDesign.headlines.push(l.data.text))

      if (currentDesign.headlines.length === 0) {
        currentDesign.headlines = ['Your Product Here']
      }

      // Call AI service
      const result = await aiService.generateDesignVariants(
        currentDesign,
        variantTypes,
        variantCount
      )

      if (result.variants && result.variants.length > 0) {
        // Add original as first variant for comparison
        const variantsWithOriginal = [
          {
            id: 'original',
            label: 'Original',
            headline: currentDesign.headlines[0],
            colors: currentDesign.colors,
            isOriginal: true,
          },
          ...result.variants,
        ]

        set({
          variants: variantsWithOriginal,
          selectedVariantId: 'original',
        })
      } else {
        set({ variantError: 'No variants generated' })
      }
    } catch (error) {
      console.error('Variant generation failed:', error)
      set({ variantError: error.message || 'Failed to generate variants' })
    } finally {
      set({ isGeneratingVariants: false })
    }
  },

  // Generate only headline variants
  generateHeadlineVariants: async (originalHeadline) => {
    const { isGeneratingVariants, variantCount } = get()
    if (isGeneratingVariants) return

    set({ isGeneratingVariants: true, variantError: null })

    try {
      const result = await aiService.generateHeadlineVariants(
        originalHeadline || 'Your Product Here',
        {},
        variantCount
      )

      if (result.variations && result.variations.length > 0) {
        const variants = [
          {
            id: 'original',
            label: 'Original',
            headline: originalHeadline,
            isOriginal: true,
          },
          ...result.variations.map((headline, index) => ({
            id: `headline-${index + 1}`,
            label: `Variant ${String.fromCharCode(65 + index)}`,
            headline,
          })),
        ]

        set({
          variants,
          selectedVariantId: 'original',
        })
      }
    } catch (error) {
      console.error('Headline variant generation failed:', error)
      set({ variantError: error.message })
    } finally {
      set({ isGeneratingVariants: false })
    }
  },

  // Generate only color variants
  generateColorVariants: async () => {
    const { isGeneratingVariants, variantCount, activeBrandKit } = get()
    if (isGeneratingVariants) return

    set({ isGeneratingVariants: true, variantError: null })

    try {
      const currentColors = activeBrandKit?.colors || {
        primary: '#3b82f6',
        secondary: '#8b5cf6',
        accent: '#f59e0b',
      }

      const result = await aiService.generateColorVariants(
        currentColors,
        'complementary',
        variantCount
      )

      if (result.variations && result.variations.length > 0) {
        const variants = [
          {
            id: 'original',
            label: 'Original',
            colors: currentColors,
            isOriginal: true,
          },
          ...result.variations.map((colors, index) => ({
            id: `color-${index + 1}`,
            label: `Palette ${String.fromCharCode(65 + index)}`,
            colors,
          })),
        ]

        set({
          variants,
          selectedVariantId: 'original',
        })
      }
    } catch (error) {
      console.error('Color variant generation failed:', error)
      set({ variantError: error.message })
    } finally {
      set({ isGeneratingVariants: false })
    }
  },

  // Apply a variant to the current design
  applyVariant: (variantId) => {
    const { variants, layers, setAllLayers, setTextOverlay, updateBrandColors } = get()
    const variant = variants.find((v) => v.id === variantId)
    if (!variant || variant.isOriginal) return

    // Apply headline if present
    if (variant.headline) {
      // Update first text layer or textOverlay
      const textLayers = layers.filter((l) => l.type === 'text')
      if (textLayers.length > 0) {
        const updatedLayers = layers.map((l) =>
          l.id === textLayers[0].id ? { ...l, data: { ...l.data, text: variant.headline } } : l
        )
        setAllLayers(updatedLayers)
      } else {
        setTextOverlay?.({ text: variant.headline })
      }
    }

    // Apply colors if present
    if (variant.colors && updateBrandColors) {
      updateBrandColors(variant.colors)
    }

    // Apply layout if present
    if (variant.layout) {
      const textLayers = layers.filter((l) => l.type === 'text')
      if (textLayers.length > 0) {
        const yPosition = variant.layout.textPosition === 'top' ? 20 : 80
        const updatedLayers = layers.map((l) =>
          l.id === textLayers[0].id ? { ...l, data: { ...l.data, y: yPosition } } : l
        )
        setAllLayers(updatedLayers)
      }
    }

    set({ selectedVariantId: variantId })
  },

  // Clear all variants
  clearVariants: () => {
    set({
      variants: [],
      selectedVariantId: null,
      variantError: null,
    })
  },

  // Get selected variant
  getSelectedVariant: () => {
    const { variants, selectedVariantId } = get()
    return variants.find((v) => v.id === selectedVariantId) || null
  },

  // Export variants as a set
  getVariantsForExport: () => {
    const { variants } = get()
    return variants.map((v) => ({
      id: v.id,
      label: v.label,
      headline: v.headline,
      colors: v.colors,
    }))
  },

  // Reset variant state
  resetVariantState: () => {
    set({
      variants: [],
      selectedVariantId: null,
      isGeneratingVariants: false,
      variantError: null,
      variantTypes: ['headlines'],
      variantCount: 5,
    })
  },
})
