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
      generateBackground: s.generateBackground,
      removeBackground: s.removeBackground,
      suggestTypography: s.suggestTypography,
      autoLevel: s.autoLevel,
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
