/**
 * AI Studio Store Selectors
 *
 * Granular selectors optimized for Zustand 5 using useShallow.
 */

import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useStudioStore } from './index'
import { computeCanvasDimensions } from '../utils/canvasLogic'
import {
  platformPresets,
  platformCategories,
  marketingTemplates,
  templateCategories,
} from '@/lib/platformTemplates'

// ============================================
// LAYER SELECTORS
// ============================================

export const useLayers = () => useStudioStore((s) => s.layers)
export const useSelectedLayerId = () => useStudioStore((s) => s.selectedLayerId)

// Memoized sorted layers
export const useSortedLayers = () => {
  const layers = useStudioStore((s) => s.layers)
  return useMemo(() => [...layers].sort((a, b) => a.zIndex - b.zIndex), [layers])
}

// Selected layer object
export const useSelectedLayer = () => {
  const layers = useStudioStore((s) => s.layers)
  const selectedId = useStudioStore((s) => s.selectedLayerId)
  return useMemo(() => layers.find((l) => l.id === selectedId) || null, [layers, selectedId])
}

// Text layers only
export const useTextLayers = () => {
  const layers = useStudioStore((s) => s.layers)
  return useMemo(() => layers.filter((l) => l.type === 'text'), [layers])
}

// Image layers only
export const useImageLayers = () => {
  const layers = useStudioStore((s) => s.layers)
  return useMemo(() => layers.filter((l) => l.type === 'image'), [layers])
}

// Promotional element layers only
export const usePromotionalLayers = () => {
  const layers = useStudioStore((s) => s.layers)
  return useMemo(
    () =>
      layers.filter((l) =>
        ['badge', 'countdown', 'price', 'cta', 'qrcode', 'stock'].includes(l.type)
      ),
    [layers]
  )
}

// Badge layers only
export const useBadgeLayers = () => {
  const layers = useStudioStore((s) => s.layers)
  return useMemo(() => layers.filter((l) => l.type === 'badge'), [layers])
}

// CTA layers only
export const useCTALayers = () => {
  const layers = useStudioStore((s) => s.layers)
  return useMemo(() => layers.filter((l) => l.type === 'cta'), [layers])
}

// Undo/Redo availability
export const useCanUndo = () => useStudioStore((s) => s._historyIndex > 0)
export const useCanRedo = () => useStudioStore((s) => s._historyIndex < s._history.length - 1)

// ============================================
// CANVAS SELECTORS
// ============================================

export const useSelectedPlatform = () => useStudioStore((s) => s.selectedPlatform)
export const useBackground = () => useStudioStore((s) => s.background)
export const useImageFile = () => useStudioStore((s) => s.imageFile)
export const useActiveTemplate = () => useStudioStore((s) => s.activeTemplate)

// Derived dimensions (memoized)
export const useCanvasDimensions = () => {
  const platform = useStudioStore((s) => s.selectedPlatform)
  return useMemo(() => computeCanvasDimensions(platform), [platform])
}

// Current preset
export const useCurrentPreset = () => {
  const platform = useStudioStore((s) => s.selectedPlatform)
  return useMemo(() => platformPresets[platform] || platformPresets['instagram-post'], [platform])
}

// Static data exports
export const usePlatformPresets = () => platformPresets
export const usePlatformCategories = () => platformCategories
export const useMarketingTemplates = () => marketingTemplates
export const useTemplateCategories = () => templateCategories

// ============================================
// AI SELECTORS
// ============================================

export const usePrompt = () => useStudioStore((s) => s.prompt)
export const useIsGenerating = () => useStudioStore((s) => s.isGenerating)
export const useIsAnalyzing = () => useStudioStore((s) => s.isAnalyzing)
export const useLastAnalysis = () => useStudioStore((s) => s.lastAnalysis)
export const useBackgroundPrompt = () => useStudioStore((s) => s.backgroundPrompt)
export const useIsGeneratingBackground = () => useStudioStore((s) => s.isGeneratingBackground)
export const useGeneratedBackground = () => useStudioStore((s) => s.generatedBackground)
export const useIsRemovingBackground = () => useStudioStore((s) => s.isRemovingBackground)
export const useSubjectImage = () => useStudioStore((s) => s.subjectImage)
export const useSubjectBounds = () => useStudioStore((s) => s.subjectBounds)
export const useIsSuggestingTypography = () => useStudioStore((s) => s.isSuggestingTypography)
export const useTypographySuggestion = () => useStudioStore((s) => s.typographySuggestion)
export const useIsAutoLeveling = () => useStudioStore((s) => s.isAutoLeveling)
export const useLevelAdjustments = () => useStudioStore((s) => s.levelAdjustments)
export const useSelectedLightingPreset = () => useStudioStore((s) => s.selectedLightingPreset)
export const useIsApplyingRelighting = () => useStudioStore((s) => s.isApplyingRelighting)
export const useLastGenerationError = () => useStudioStore((s) => s.lastGenerationError)

// Combined AI loading state
export const useIsAIBusy = () => {
  return useStudioStore(
    (s) =>
      s.isGenerating ||
      s.isAnalyzing ||
      s.isGeneratingBackground ||
      s.isRemovingBackground ||
      s.isSuggestingTypography ||
      s.isAutoLeveling
  )
}

// ============================================
// VIDEO SELECTORS
// ============================================

export const useVideoModel = () => useStudioStore((s) => s.videoModel)
export const useVideoPrompt = () => useStudioStore((s) => s.videoPrompt)
export const useIsGeneratingVideo = () => useStudioStore((s) => s.isGeneratingVideo)
export const useVideoGenerationProgress = () => useStudioStore((s) => s.videoGenerationProgress)
export const useGeneratedVideoUrl = () => useStudioStore((s) => s.generatedVideoUrl)
export const useVideoJobId = () => useStudioStore((s) => s.videoJobId)
export const useVideoError = () => useStudioStore((s) => s.videoError)
export const useVideoOverlays = () => useStudioStore((s) => s.videoOverlays)
export const useSelectedOverlayId = () => useStudioStore((s) => s.selectedOverlayId)
export const useIsRenderingVideo = () => useStudioStore((s) => s.isRenderingVideo)
export const useRenderProgress = () => useStudioStore((s) => s.renderProgress)
export const useFinalVideoUrl = () => useStudioStore((s) => s.finalVideoUrl)
export const useIsVideoPlaying = () => useStudioStore((s) => s.isVideoPlaying)
export const useVideoCurrentTime = () => useStudioStore((s) => s.videoCurrentTime)
export const useVideoDuration = () => useStudioStore((s) => s.videoDuration)

// Selected overlay object
export const useSelectedOverlay = () => {
  const overlays = useStudioStore((s) => s.videoOverlays)
  const selectedId = useStudioStore((s) => s.selectedOverlayId)
  return useMemo(() => overlays.find((o) => o.id === selectedId) || null, [overlays, selectedId])
}

// ============================================
// UI SELECTORS
// ============================================

export const useModals = () => useStudioStore((s) => s.modals)
export const useIsModalOpen = (name) => useStudioStore((s) => s.modals[name])
export const useProjectName = () => useStudioStore((s) => s.projectName)
export const useCurrentProjectId = () => useStudioStore((s) => s.currentProjectId)
export const useIsSaving = () => useStudioStore((s) => s.isSaving)
export const useSaveError = () => useStudioStore((s) => s.saveError)
export const useRecentDesigns = () => useStudioStore((s) => s.recentDesigns)
export const useIsLoadingRecentDesigns = () => useStudioStore((s) => s.isLoadingRecentDesigns)

// ============================================
// TEXT OVERLAY SELECTORS
// ============================================

export const useTextOverlay = () => useStudioStore((s) => s.textOverlay)
export const useTextOverlayText = () => useStudioStore((s) => s.textOverlay.text)
export const useTextOverlayPosition = () => {
  const textOverlay = useStudioStore((s) => s.textOverlay)
  return useMemo(() => ({ x: textOverlay.x, y: textOverlay.y }), [textOverlay.x, textOverlay.y])
}

// ============================================
// ACTION HOOKS (using useShallow for Zustand 5)
// ============================================

export const useLayerActions = () =>
  useStudioStore(
    useShallow((s) => ({
      addLayer: s.addLayer,
      addTextLayer: s.addTextLayer,
      removeLayer: s.removeLayer,
      updateLayer: s.updateLayer,
      updateSelectedLayer: s.updateSelectedLayer,
      selectLayer: s.selectLayer,
      clearSelection: s.clearSelection,
      duplicateLayer: s.duplicateLayer,
      clearLayers: s.clearLayers,
      setAllLayers: s.setAllLayers,
      toggleLayerVisibility: s.toggleLayerVisibility,
      toggleLayerLock: s.toggleLayerLock,
      moveLayerUp: s.moveLayerUp,
      moveLayerDown: s.moveLayerDown,
      undo: s.undo,
      redo: s.redo,
      // Promotional element layer actions
      addBadgeLayer: s.addBadgeLayer,
      addCTALayer: s.addCTALayer,
      addPriceLayer: s.addPriceLayer,
      addCountdownLayer: s.addCountdownLayer,
      addStockIndicatorLayer: s.addStockIndicatorLayer,
      addQRCodeLayer: s.addQRCodeLayer,
      addPromotionalLayer: s.addPromotionalLayer,
      addProductTagLayer: s.addProductTagLayer,
    }))
  )

export const useCanvasActions = () =>
  useStudioStore(
    useShallow((s) => ({
      setSelectedPlatform: s.setSelectedPlatform,
      setBackground: s.setBackground,
      setImageFile: s.setImageFile,
      clearImage: s.clearImage,
      setActiveTemplate: s.setActiveTemplate,
      clearTemplate: s.clearTemplate,
    }))
  )

export const useAIActions = () =>
  useStudioStore(
    useShallow((s) => ({
      setPrompt: s.setPrompt,
      generate: s.generate,
      analyzeImage: s.analyzeImage,
      setBackgroundPrompt: s.setBackgroundPrompt,
      setSubjectImage: s.setSubjectImage,
      generateBackground: s.generateBackground,
      removeBackground: s.removeBackground,
      suggestTypography: s.suggestTypography,
      autoLevel: s.autoLevel,
      setSelectedLightingPreset: s.setSelectedLightingPreset,
      applyRelighting: s.applyRelighting,
    }))
  )

export const useVideoActions = () =>
  useStudioStore(
    useShallow((s) => ({
      setVideoModel: s.setVideoModel,
      setVideoPrompt: s.setVideoPrompt,
      generateVideo: s.generateVideo,
      addVideoOverlay: s.addVideoOverlay,
      updateVideoOverlay: s.updateVideoOverlay,
      removeVideoOverlay: s.removeVideoOverlay,
      selectOverlay: s.selectOverlay,
      clearVideoOverlays: s.clearVideoOverlays,
      renderFinalVideo: s.renderFinalVideo,
      setIsVideoPlaying: s.setIsVideoPlaying,
      setVideoCurrentTime: s.setVideoCurrentTime,
      setVideoDuration: s.setVideoDuration,
      resetVideoState: s.resetVideoState,
    }))
  )

export const useUIActions = () =>
  useStudioStore(
    useShallow((s) => ({
      openModal: s.openModal,
      closeModal: s.closeModal,
      closeAllModals: s.closeAllModals,
      setProjectName: s.setProjectName,
      saveProject: s.saveProject,
      loadProject: s.loadProject,
      loadRecentDesigns: s.loadRecentDesigns,
    }))
  )

export const useTextOverlayActions = () =>
  useStudioStore(
    useShallow((s) => ({
      setTextOverlay: s.setTextOverlay,
    }))
  )

export const useGlobalActions = () =>
  useStudioStore(
    useShallow((s) => ({
      resetAll: s.resetAll,
    }))
  )

// ============================================
// BRAND SELECTORS
// ============================================

export const useActiveBrandKit = () => useStudioStore((s) => s.activeBrandKit)
export const useSavedBrandKits = () => useStudioStore((s) => s.savedBrandKits)
export const useIsBrandKitLoading = () => useStudioStore((s) => s.isBrandKitLoading)
export const useBrandKitError = () => useStudioStore((s) => s.brandKitError)

// Brand colors
export const useBrandColors = () => useStudioStore((s) => s.activeBrandKit.colors)
export const useBrandPrimaryColor = () => useStudioStore((s) => s.activeBrandKit.colors.primary)
export const useBrandSecondaryColor = () => useStudioStore((s) => s.activeBrandKit.colors.secondary)
export const useBrandAccentColor = () => useStudioStore((s) => s.activeBrandKit.colors.accent)
export const useBrandTextColor = () => useStudioStore((s) => s.activeBrandKit.colors.text)
export const useBrandBackgroundColor = () =>
  useStudioStore((s) => s.activeBrandKit.colors.background)

// Brand fonts
export const useBrandFonts = () => useStudioStore((s) => s.activeBrandKit.fonts)
export const useBrandHeadingFont = () => useStudioStore((s) => s.activeBrandKit.fonts.heading)
export const useBrandBodyFont = () => useStudioStore((s) => s.activeBrandKit.fonts.body)

// Brand logo
export const useBrandLogo = () => useStudioStore((s) => s.activeBrandKit.logo)

// Contact overlay
export const useContactOverlay = () => useStudioStore((s) => s.activeBrandKit.contactOverlay)
export const useContactOverlayEnabled = () =>
  useStudioStore((s) => s.activeBrandKit.contactOverlay?.enabled ?? false)

// Brand color array for palette display
export const useBrandColorPalette = () => {
  const colors = useStudioStore((s) => s.activeBrandKit.colors)
  return useMemo(
    () => [colors.primary, colors.secondary, colors.accent, colors.text, colors.background],
    [colors.primary, colors.secondary, colors.accent, colors.text, colors.background]
  )
}

// Brand actions
export const useBrandActions = () =>
  useStudioStore(
    useShallow((s) => ({
      setActiveBrandKit: s.setActiveBrandKit,
      updateBrandColors: s.updateBrandColors,
      updateBrandFonts: s.updateBrandFonts,
      setBrandLogo: s.setBrandLogo,
      updateContactOverlay: s.updateContactOverlay,
      applyBrandPreset: s.applyBrandPreset,
      setSavedBrandKits: s.setSavedBrandKits,
      addSavedBrandKit: s.addSavedBrandKit,
      removeSavedBrandKit: s.removeSavedBrandKit,
      updateSavedBrandKit: s.updateSavedBrandKit,
      setBrandKitLoading: s.setBrandKitLoading,
      setBrandKitError: s.setBrandKitError,
      getBrandColor: s.getBrandColor,
      getBrandFont: s.getBrandFont,
      isOnBrandColor: s.isOnBrandColor,
      resetBrandState: s.resetBrandState,
    }))
  )

// ============================================
// VARIANT SELECTORS (Phase 3)
// ============================================

export const useVariants = () => useStudioStore((s) => s.variants)
export const useSelectedVariantId = () => useStudioStore((s) => s.selectedVariantId)
export const useIsGeneratingVariants = () => useStudioStore((s) => s.isGeneratingVariants)
export const useVariantError = () => useStudioStore((s) => s.variantError)
export const useVariantTypes = () => useStudioStore((s) => s.variantTypes)
export const useVariantCount = () => useStudioStore((s) => s.variantCount)

// Selected variant object
export const useSelectedVariant = () => {
  const variants = useStudioStore((s) => s.variants)
  const selectedId = useStudioStore((s) => s.selectedVariantId)
  return useMemo(() => variants.find((v) => v.id === selectedId) || null, [variants, selectedId])
}

// Variant actions
export const useVariantActions = () =>
  useStudioStore(
    useShallow((s) => ({
      setVariantTypes: s.setVariantTypes,
      setVariantCount: s.setVariantCount,
      selectVariant: s.selectVariant,
      clearVariantSelection: s.clearVariantSelection,
      generateVariants: s.generateVariants,
      generateHeadlineVariants: s.generateHeadlineVariants,
      generateColorVariants: s.generateColorVariants,
      applyVariant: s.applyVariant,
      clearVariants: s.clearVariants,
      getSelectedVariant: s.getSelectedVariant,
      getVariantsForExport: s.getVariantsForExport,
      resetVariantState: s.resetVariantState,
    }))
  )

// ============================================
// PRODUCT SELECTORS (Phase 5)
// ============================================

export const useProductCatalog = () => useStudioStore((s) => s.productCatalog)
export const useIsLoadingCatalog = () => useStudioStore((s) => s.isLoadingCatalog)
export const useCatalogError = () => useStudioStore((s) => s.catalogError)

// Product tag layers on canvas
export const useProductTagLayers = () => {
  const layers = useStudioStore((s) => s.layers)
  return useMemo(() => layers.filter((l) => l.type === 'product-tag'), [layers])
}

// Product actions
export const useProductActions = () =>
  useStudioStore(
    useShallow((s) => ({
      setProductCatalog: s.setProductCatalog,
      addProduct: s.addProduct,
      updateProduct: s.updateProduct,
      removeProduct: s.removeProduct,
      loadProductCatalog: s.loadProductCatalog,
      saveProduct: s.saveProduct,
      deleteProduct: s.deleteProduct,
      setCatalogLoading: s.setCatalogLoading,
      setCatalogError: s.setCatalogError,
      resetProductState: s.resetProductState,
    }))
  )

// ============================================
// COMPOSITE SELECTORS (for sidebar performance)
// ============================================

// Batches all AI state into a single subscription
export const useSidebarAIState = () =>
  useStudioStore(
    useShallow((s) => ({
      prompt: s.prompt,
      isGenerating: s.isGenerating,
      isAnalyzing: s.isAnalyzing,
      backgroundPrompt: s.backgroundPrompt,
      isGeneratingBackground: s.isGeneratingBackground,
      generatedBackground: s.generatedBackground,
      isRemovingBackground: s.isRemovingBackground,
      subjectImage: s.subjectImage,
      isSuggestingTypography: s.isSuggestingTypography,
      isAutoLeveling: s.isAutoLeveling,
      selectedLightingPreset: s.selectedLightingPreset,
      isApplyingRelighting: s.isApplyingRelighting,
      lastGenerationError: s.lastGenerationError,
    }))
  )

// Batches all video state into a single subscription
export const useSidebarVideoState = () =>
  useStudioStore(
    useShallow((s) => ({
      videoModel: s.videoModel,
      videoPrompt: s.videoPrompt,
      isGeneratingVideo: s.isGeneratingVideo,
      videoGenerationProgress: s.videoGenerationProgress,
      generatedVideoUrl: s.generatedVideoUrl,
      videoError: s.videoError,
      videoOverlays: s.videoOverlays,
      isRenderingVideo: s.isRenderingVideo,
    }))
  )

// Batches canvas + UI state used by sidebar
export const useSidebarCanvasState = () =>
  useStudioStore(
    useShallow((s) => ({
      imageFile: s.imageFile,
      activeTemplate: s.activeTemplate,
      background: s.background,
      textOverlay: s.textOverlay,
      recentDesigns: s.recentDesigns,
    }))
  )
