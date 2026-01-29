/**
 * AI Studio Store Selectors
 *
 * Granular selectors for optimal performance - components only
 * re-render when their specific slice of state changes.
 */

import { useMemo } from 'react'
import { shallow } from 'zustand/shallow'
import { useStudioStore } from './index'
import { computeCanvasDimensions } from './slices/canvasSlice'
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

// Static data exports (no state subscription needed)
export const usePlatformPresets = () => platformPresets
export const usePlatformCategories = () => platformCategories
export const useMarketingTemplates = () => marketingTemplates
export const useTemplateCategories = () => templateCategories

// ============================================
// AI SELECTORS - Granular for minimal re-renders
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

// Combined AI loading state
export const useIsAIBusy = () => {
  const isGenerating = useStudioStore((s) => s.isGenerating)
  const isAnalyzing = useStudioStore((s) => s.isAnalyzing)
  const isGeneratingBackground = useStudioStore((s) => s.isGeneratingBackground)
  const isRemovingBackground = useStudioStore((s) => s.isRemovingBackground)
  const isSuggestingTypography = useStudioStore((s) => s.isSuggestingTypography)
  const isAutoLeveling = useStudioStore((s) => s.isAutoLeveling)

  return (
    isGenerating ||
    isAnalyzing ||
    isGeneratingBackground ||
    isRemovingBackground ||
    isSuggestingTypography ||
    isAutoLeveling
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
// ACTION HOOKS (stable references for callbacks)
// ============================================

// Layer actions
export const useLayerActions = () =>
  useStudioStore(
    (s) => ({
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
    }),
    shallow
  )

// Canvas actions
export const useCanvasActions = () =>
  useStudioStore(
    (s) => ({
      setSelectedPlatform: s.setSelectedPlatform,
      setBackground: s.setBackground,
      setImageFile: s.setImageFile,
      clearImage: s.clearImage,
      setActiveTemplate: s.setActiveTemplate,
      clearTemplate: s.clearTemplate,
    }),
    shallow
  )

// AI actions
export const useAIActions = () =>
  useStudioStore(
    (s) => ({
      setPrompt: s.setPrompt,
      generate: s.generate,
      analyzeImage: s.analyzeImage,
      setBackgroundPrompt: s.setBackgroundPrompt,
      generateBackground: s.generateBackground,
      removeBackground: s.removeBackground,
      suggestTypography: s.suggestTypography,
      autoLevel: s.autoLevel,
    }),
    shallow
  )

// Video actions
export const useVideoActions = () =>
  useStudioStore(
    (s) => ({
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
    }),
    shallow
  )

// UI actions
export const useUIActions = () =>
  useStudioStore(
    (s) => ({
      openModal: s.openModal,
      closeModal: s.closeModal,
      closeAllModals: s.closeAllModals,
      setProjectName: s.setProjectName,
      saveProject: s.saveProject,
      loadProject: s.loadProject,
    }),
    shallow
  )

// Text overlay actions
export const useTextOverlayActions = () =>
  useStudioStore(
    (s) => ({
      setTextOverlay: s.setTextOverlay,
    }),
    shallow
  )

// Global actions
export const useGlobalActions = () =>
  useStudioStore(
    (s) => ({
      resetAll: s.resetAll,
    }),
    shallow
  )
