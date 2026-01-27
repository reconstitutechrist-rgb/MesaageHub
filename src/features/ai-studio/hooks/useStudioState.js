import { useState, useCallback, useMemo } from 'react'
import { useLayerManager } from '@/hooks/useLayerManager'
import {
  platformPresets,
  platformCategories,
  marketingTemplates,
  templateCategories,
} from '@/lib/platformTemplates'
import { DEFAULT_TEXT_OVERLAY, CANVAS_CONSTRAINTS } from '../utils/studioConstants'
import { aiService } from '@/services/AIService'
import { designProjectService } from '@/services/DesignProjectService'

/**
 * Convert a File or Blob to base64 string
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
 * Scale dimensions to fit within max constraints while maintaining aspect ratio
 */
function scaleToFit(width, height, maxWidth, maxHeight) {
  const scaleX = maxWidth / width
  const scaleY = maxHeight / height
  const scale = Math.min(scaleX, scaleY, 1) // Don't scale up

  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
    scale,
  }
}

/**
 * Centralized state management hook for AI Studio
 *
 * Manages:
 * - Platform selection and canvas dimensions
 * - Background (solid/gradient)
 * - Image file
 * - Templates
 * - AI prompt/generation
 * - Text overlay (primary/legacy)
 * - Modal states
 * - Layer management (via useLayerManager)
 */
export function useStudioState(options = {}) {
  const {
    defaultPlatform = 'instagram-post',
    maxDisplayWidth = CANVAS_CONSTRAINTS.MAX_DISPLAY_WIDTH,
    maxDisplayHeight = CANVAS_CONSTRAINTS.MAX_DISPLAY_HEIGHT,
  } = options

  // Platform & Canvas
  const [selectedPlatform, setSelectedPlatform] = useState(defaultPlatform)

  // Background
  const [background, setBackground] = useState({ type: 'solid', value: null })

  // Image
  const [imageFile, setImageFile] = useState(null)

  // Templates
  const [activeTemplate, setActiveTemplate] = useState(null)

  // AI - Copy generation
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [lastAnalysis, setLastAnalysis] = useState(null)

  // AI - Background generation (Phase 2)
  const [backgroundPrompt, setBackgroundPrompt] = useState('')
  const [isGeneratingBackground, setIsGeneratingBackground] = useState(false)
  const [generatedBackground, setGeneratedBackground] = useState(null)

  // AI - Subject processing (Phase 2)
  const [isRemovingBackground, setIsRemovingBackground] = useState(false)
  const [subjectImage, setSubjectImage] = useState(null)
  const [subjectBounds, setSubjectBounds] = useState(null)

  // AI - Typography (Phase 2)
  const [isSuggestingTypography, setIsSuggestingTypography] = useState(false)
  const [typographySuggestion, setTypographySuggestion] = useState(null)

  // AI - Auto-leveling (Phase 2)
  const [isAutoLeveling, setIsAutoLeveling] = useState(false)
  const [levelAdjustments, setLevelAdjustments] = useState(null)

  // AI - Video generation (Phase 3)
  const [videoModel, setVideoModel] = useState('veo-3.1')
  const [videoPrompt, setVideoPrompt] = useState('')
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false)
  const [videoGenerationProgress, setVideoGenerationProgress] = useState(0)
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState(null)
  const [videoJobId, setVideoJobId] = useState(null)
  const [videoError, setVideoError] = useState(null)

  // Video overlays (Phase 3)
  const [videoOverlays, setVideoOverlays] = useState([])
  const [selectedOverlayId, setSelectedOverlayId] = useState(null)

  // Video rendering (Phase 3)
  const [isRenderingVideo, setIsRenderingVideo] = useState(false)
  const [renderProgress, setRenderProgress] = useState(0)
  const [finalVideoUrl, setFinalVideoUrl] = useState(null)

  // Video preview state (Phase 3)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [videoCurrentTime, setVideoCurrentTime] = useState(0)
  const [videoDuration, setVideoDuration] = useState(8)

  // Primary text overlay (legacy support)
  const [textOverlay, setTextOverlay] = useState(DEFAULT_TEXT_OVERLAY)

  // Modals
  const [modals, setModals] = useState({
    export: false,
    templates: false,
    platforms: false,
    videoExport: false,
    save: false,
  })

  // Project save/load
  const [currentProjectId, setCurrentProjectId] = useState(null)
  const [projectName, setProjectName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)

  // Layer management
  const layerManager = useLayerManager([])

  // Current platform preset
  const currentPreset = useMemo(() => {
    return platformPresets[selectedPlatform] || platformPresets['instagram-post']
  }, [selectedPlatform])

  // Export dimensions (full resolution)
  const exportWidth = currentPreset.width
  const exportHeight = currentPreset.height

  // Display dimensions (scaled to fit)
  const { width: canvasWidth, height: canvasHeight } = useMemo(() => {
    return scaleToFit(exportWidth, exportHeight, maxDisplayWidth, maxDisplayHeight)
  }, [exportWidth, exportHeight, maxDisplayWidth, maxDisplayHeight])

  // Platform selection
  const handlePlatformSelect = useCallback(
    (platformId) => {
      setSelectedPlatform(platformId)
      const preset = platformPresets[platformId]
      if (preset) {
        const scaled = scaleToFit(preset.width, preset.height, maxDisplayWidth, maxDisplayHeight)
        // Recenter text overlay
        setTextOverlay((prev) => ({
          ...prev,
          x: scaled.width / 2,
          y: scaled.height / 2,
        }))
      }
    },
    [maxDisplayWidth, maxDisplayHeight]
  )

  // Background changes
  const handleBackgroundChange = useCallback((newBackground) => {
    setBackground(newBackground)
    // Clear template when setting custom background
    if (newBackground.value) {
      setActiveTemplate(null)
    }
  }, [])

  // Template selection
  const handleTemplateSelect = useCallback((template) => {
    setActiveTemplate(template)
    setBackground({ type: 'solid', value: null }) // Clear custom background

    // Apply template's main text to text overlay
    const mainText = template.elements?.find((e) => e.type === 'text' && e.fontSize > 60)
    if (mainText) {
      setTextOverlay((prev) => ({
        ...prev,
        text: mainText.content,
        color: mainText.color || '#ffffff',
      }))
    }
  }, [])

  const handleClearTemplate = useCallback(() => {
    setActiveTemplate(null)
    setBackground({ type: 'solid', value: null })
  }, [])

  // Image handling
  const handleImageUpload = useCallback((file) => {
    setImageFile(file)
    // Clear subject processing state when new image is uploaded
    setSubjectImage(null)
    setSubjectBounds(null)
    setLevelAdjustments(null)
  }, [])

  const handleClearImage = useCallback(() => {
    setImageFile(null)
    setSubjectImage(null)
    setSubjectBounds(null)
    setLevelAdjustments(null)
  }, [])

  // Text overlay updates
  const handleTextChange = useCallback((updates) => {
    setTextOverlay((prev) => ({ ...prev, ...updates }))
  }, [])

  // AI generation - calls Edge Function via AIService
  const handleGenerate = useCallback(async () => {
    if (!prompt.trim() || isGenerating) return

    setIsGenerating(true)
    try {
      // Get image as base64 if available (for multimodal generation)
      let imageBase64 = null
      if (imageFile) {
        imageBase64 = await fileToBase64(imageFile)
      }

      // Call AI service (Edge Function → Gemini 3 Flash)
      const result = await aiService.generateMarketingCopy(prompt, imageBase64, {
        platform: selectedPlatform,
      })

      // Apply generated text to overlay
      setTextOverlay((prev) => ({
        ...prev,
        text: result.text || prompt.toUpperCase(),
      }))
    } catch (error) {
      console.error('Generation failed:', error)
      // Fallback to uppercase prompt
      setTextOverlay((prev) => ({
        ...prev,
        text: prompt.toUpperCase(),
      }))
    } finally {
      setIsGenerating(false)
    }
  }, [prompt, isGenerating, imageFile, selectedPlatform])

  // Image analysis - calls Edge Function via AIService (Gemini 3 Pro)
  const handleAnalyzeImage = useCallback(async () => {
    if (!imageFile || isAnalyzing) return null

    setIsAnalyzing(true)
    try {
      const imageBase64 = await fileToBase64(imageFile)
      const analysis = await aiService.analyzeImage(imageBase64)

      // Store analysis results
      setLastAnalysis(analysis)

      // Apply suggested headline to text overlay
      if (analysis.copy?.headline) {
        setTextOverlay((prev) => ({
          ...prev,
          text: analysis.copy.headline,
        }))
      }

      return analysis
    } catch (error) {
      console.error('Image analysis failed:', error)
      return null
    } finally {
      setIsAnalyzing(false)
    }
  }, [imageFile, isAnalyzing])

  // AI Background Generation - generates custom backgrounds from text prompts (Phase 2)
  const handleGenerateBackground = useCallback(async () => {
    if (!backgroundPrompt.trim() || isGeneratingBackground) return

    setIsGeneratingBackground(true)
    try {
      const result = await aiService.generateBackground(backgroundPrompt, {
        width: exportWidth,
        height: exportHeight,
        style: 'photorealistic',
      })

      if (result.imageBase64) {
        setGeneratedBackground(result.imageBase64)
        // Set as background
        setBackground({ type: 'image', value: result.imageBase64 })
        // Clear template since we have a custom background
        setActiveTemplate(null)
      }

      return result
    } catch (error) {
      console.error('Background generation failed:', error)
      return null
    } finally {
      setIsGeneratingBackground(false)
    }
  }, [backgroundPrompt, isGeneratingBackground, exportWidth, exportHeight])

  // Remove Background from uploaded image (Phase 2)
  const handleRemoveBackground = useCallback(async () => {
    if (!imageFile || isRemovingBackground) return null

    setIsRemovingBackground(true)
    try {
      const imageBase64 = await fileToBase64(imageFile)
      const result = await aiService.removeBackground(imageBase64)

      if (result.subjectBase64) {
        setSubjectImage(result.subjectBase64)
      }
      if (result.bounds) {
        setSubjectBounds(result.bounds)
      }

      return result
    } catch (error) {
      console.error('Background removal failed:', error)
      return null
    } finally {
      setIsRemovingBackground(false)
    }
  }, [imageFile, isRemovingBackground])

  // Suggest Typography placement using AI (Phase 2)
  const handleSuggestTypography = useCallback(async () => {
    if (!textOverlay?.text || isSuggestingTypography) return null

    setIsSuggestingTypography(true)
    try {
      let imageBase64 = null
      if (imageFile) {
        imageBase64 = await fileToBase64(imageFile)
      }

      const result = await aiService.suggestTypography(imageBase64, textOverlay.text, {
        subjectBounds,
        canvasWidth: exportWidth,
        canvasHeight: exportHeight,
      })

      setTypographySuggestion(result)

      // Apply suggestions to text overlay if not a fallback
      if (!result.fallback && result.position) {
        const fontSizeMap = { small: 32, medium: 42, large: 56, xlarge: 72 }
        setTextOverlay((prev) => ({
          ...prev,
          x: (result.position.x / 100) * canvasWidth,
          y: (result.position.y / 100) * canvasHeight,
          color: result.color || prev.color,
          fontSize: fontSizeMap[result.fontSize] || prev.fontSize,
        }))
      }

      return result
    } catch (error) {
      console.error('Typography suggestion failed:', error)
      return null
    } finally {
      setIsSuggestingTypography(false)
    }
  }, [
    textOverlay,
    isSuggestingTypography,
    imageFile,
    subjectBounds,
    exportWidth,
    exportHeight,
    canvasWidth,
    canvasHeight,
  ])

  // Auto-level subject to match background (Phase 2)
  const handleAutoLevel = useCallback(async () => {
    if (isAutoLeveling) return null

    // Need either subjectImage or the original imageFile, plus a generated background
    const subjectSource = subjectImage || (imageFile ? await fileToBase64(imageFile) : null)
    if (!subjectSource || !generatedBackground) return null

    setIsAutoLeveling(true)
    try {
      const result = await aiService.autoLevel(subjectSource, generatedBackground)
      setLevelAdjustments(result)
      return result
    } catch (error) {
      console.error('Auto-level failed:', error)
      return null
    } finally {
      setIsAutoLeveling(false)
    }
  }, [subjectImage, imageFile, generatedBackground, isAutoLeveling])

  // ============================================================================
  // Phase 3: Video Generation Handlers
  // ============================================================================

  // Generate video from prompt using selected model (Veo 3.1 or Sora 2)
  const handleGenerateVideo = useCallback(async () => {
    if (!videoPrompt.trim() || isGeneratingVideo) return

    setIsGeneratingVideo(true)
    setVideoGenerationProgress(0)
    setGeneratedVideoUrl(null)
    setVideoError(null)

    try {
      // Determine aspect ratio from current platform
      let aspectRatio = '16:9'
      if (exportWidth < exportHeight) aspectRatio = '9:16'
      else if (exportWidth === exportHeight) aspectRatio = '1:1'

      const result = await aiService.generateVideo(videoPrompt, {
        model: videoModel,
        aspectRatio,
        duration: 8,
        style: 'cinematic',
      })

      if (result.fallback) {
        setVideoError(result.message || 'Video generation not configured')
        return
      }

      if (result.jobId) {
        setVideoJobId(result.jobId)

        // Poll for completion
        const { videoUrl } = await aiService.pollVideoStatus(result.jobId, videoModel, (progress) =>
          setVideoGenerationProgress(progress)
        )

        setGeneratedVideoUrl(videoUrl)
        setVideoGenerationProgress(100)
      }
    } catch (error) {
      console.error('Video generation failed:', error)
      setVideoError(error.message || 'Video generation failed')
    } finally {
      setIsGeneratingVideo(false)
    }
  }, [videoPrompt, videoModel, isGeneratingVideo, exportWidth, exportHeight])

  // Add a video overlay (text/logo)
  const addVideoOverlay = useCallback(
    (data = {}) => {
      const overlay = {
        id: `overlay-${Date.now()}`,
        type: 'text',
        content: 'New Text',
        position: { x: 50, y: 50 },
        timing: { start: 0, end: videoDuration },
        animation: 'fade-in',
        style: { color: '#ffffff', fontSize: 48, fontWeight: 'bold', shadow: true },
        ...data,
      }
      setVideoOverlays((prev) => [...prev, overlay])
      setSelectedOverlayId(overlay.id)
      return overlay
    },
    [videoDuration]
  )

  // Update a video overlay
  const updateVideoOverlay = useCallback((id, updates) => {
    setVideoOverlays((prev) => prev.map((o) => (o.id === id ? { ...o, ...updates } : o)))
  }, [])

  // Remove a video overlay
  const removeVideoOverlay = useCallback(
    (id) => {
      setVideoOverlays((prev) => prev.filter((o) => o.id !== id))
      if (selectedOverlayId === id) {
        setSelectedOverlayId(null)
      }
    },
    [selectedOverlayId]
  )

  // Clear all video overlays
  const clearVideoOverlays = useCallback(() => {
    setVideoOverlays([])
    setSelectedOverlayId(null)
  }, [])

  // Render final video with overlays using Creatomate
  const handleRenderFinalVideo = useCallback(async () => {
    if (!generatedVideoUrl || isRenderingVideo) return

    setIsRenderingVideo(true)
    setRenderProgress(0)
    setFinalVideoUrl(null)

    try {
      const result = await aiService.renderVideoWithOverlays(generatedVideoUrl, videoOverlays, {
        outputFormat: 'mp4',
        resolution: '1080p',
      })

      if (result.fallback) {
        // Fallback: use the original video URL without server-rendered overlays
        setFinalVideoUrl(generatedVideoUrl)
        console.warn('Server-side rendering unavailable, using original video')
      } else if (result.renderJobId) {
        // Poll for render completion
        try {
          await aiService.pollRenderStatus(result.renderJobId, (progress) =>
            setRenderProgress(progress)
          )
        } catch {
          // If polling fails, just use original video
          setFinalVideoUrl(generatedVideoUrl)
        }
      }

      setRenderProgress(100)
    } catch (error) {
      console.error('Video render failed:', error)
      // Fallback to original video
      setFinalVideoUrl(generatedVideoUrl)
    } finally {
      setIsRenderingVideo(false)
    }
  }, [generatedVideoUrl, videoOverlays, isRenderingVideo])

  // Reset video state
  const resetVideoState = useCallback(() => {
    setVideoPrompt('')
    setGeneratedVideoUrl(null)
    setVideoJobId(null)
    setVideoError(null)
    setVideoGenerationProgress(0)
    setVideoOverlays([])
    setSelectedOverlayId(null)
    setFinalVideoUrl(null)
    setRenderProgress(0)
    setIsVideoPlaying(false)
    setVideoCurrentTime(0)
  }, [])

  // ============================================================================
  // Project Save/Load Handlers
  // ============================================================================

  // Save project to DesignProjectService
  const handleSaveProject = useCallback(
    async (name, userId = 'demo-user') => {
      if (isSaving) return null

      setIsSaving(true)
      setSaveError(null)

      try {
        const projectData = {
          id: currentProjectId,
          name: name || projectName || 'Untitled Design',
          platform_preset: selectedPlatform,
          layers: layerManager.layers,
          background,
          text_overlay: textOverlay,
          thumbnail_url: null, // Could generate thumbnail in future
        }

        const result = await designProjectService.saveProject(projectData, userId)

        if (result.success) {
          setCurrentProjectId(result.data.id)
          setProjectName(result.data.name)
          return result.data
        } else {
          setSaveError(result.error || 'Failed to save project')
          return null
        }
      } catch (error) {
        console.error('Save project failed:', error)
        setSaveError(error.message || 'Failed to save project')
        return null
      } finally {
        setIsSaving(false)
      }
    },
    [
      isSaving,
      currentProjectId,
      projectName,
      selectedPlatform,
      layerManager.layers,
      background,
      textOverlay,
    ]
  )

  // Load a project from DesignProjectService
  const handleLoadProject = useCallback(
    (project) => {
      if (!project) return

      // Set project identity
      setCurrentProjectId(project.id)
      setProjectName(project.name)

      // Set platform
      if (project.platform_preset && platformPresets[project.platform_preset]) {
        setSelectedPlatform(project.platform_preset)
      }

      // Set background
      if (project.background) {
        setBackground(project.background)
      }

      // Set text overlay
      if (project.text_overlay) {
        setTextOverlay(project.text_overlay)
      }

      // Set layers
      if (project.layers && Array.isArray(project.layers)) {
        layerManager.setAllLayers(project.layers)
      }

      // Close any open modals
      closeAllModals()
    },
    [layerManager, closeAllModals]
  )

  // Modal controls
  const openModal = useCallback((modalName) => {
    setModals((prev) => ({ ...prev, [modalName]: true }))
  }, [])

  const closeModal = useCallback((modalName) => {
    setModals((prev) => ({ ...prev, [modalName]: false }))
  }, [])

  const closeAllModals = useCallback(() => {
    setModals({
      export: false,
      templates: false,
      platforms: false,
      videoExport: false,
      save: false,
    })
  }, [])

  // Reset all state
  const resetAll = useCallback(() => {
    setSelectedPlatform(defaultPlatform)
    setBackground({ type: 'solid', value: null })
    setImageFile(null)
    setActiveTemplate(null)
    setPrompt('')
    setTextOverlay(DEFAULT_TEXT_OVERLAY)
    // Reset Phase 2 state
    setBackgroundPrompt('')
    setGeneratedBackground(null)
    setSubjectImage(null)
    setSubjectBounds(null)
    setTypographySuggestion(null)
    setLevelAdjustments(null)
    // Reset Phase 3 video state
    resetVideoState()
    // Reset project state
    setCurrentProjectId(null)
    setProjectName('')
    setSaveError(null)
    layerManager.clearLayers()
    closeAllModals()
  }, [defaultPlatform, layerManager, closeAllModals, resetVideoState])

  return {
    // Platform
    selectedPlatform,
    setSelectedPlatform: handlePlatformSelect,
    currentPreset,
    platformPresets,
    platformCategories,

    // Canvas dimensions
    canvasWidth,
    canvasHeight,
    exportWidth,
    exportHeight,

    // Background
    background,
    setBackground: handleBackgroundChange,

    // Image
    imageFile,
    setImageFile: handleImageUpload,
    clearImage: handleClearImage,

    // Templates
    activeTemplate,
    activeTemplateId: activeTemplate?.id || null,
    marketingTemplates,
    templateCategories,
    selectTemplate: handleTemplateSelect,
    clearTemplate: handleClearTemplate,

    // AI - Copy generation
    prompt,
    setPrompt,
    isGenerating,
    generate: handleGenerate,
    isAnalyzing,
    analyzeImage: handleAnalyzeImage,
    lastAnalysis,

    // AI - Background generation (Phase 2)
    backgroundPrompt,
    setBackgroundPrompt,
    isGeneratingBackground,
    generateBackground: handleGenerateBackground,
    generatedBackground,

    // AI - Subject processing (Phase 2)
    isRemovingBackground,
    removeBackground: handleRemoveBackground,
    subjectImage,
    subjectBounds,

    // AI - Typography (Phase 2)
    isSuggestingTypography,
    suggestTypography: handleSuggestTypography,
    typographySuggestion,

    // AI - Auto-leveling (Phase 2)
    isAutoLeveling,
    autoLevel: handleAutoLevel,
    levelAdjustments,

    // AI - Video generation (Phase 3)
    videoModel,
    setVideoModel,
    videoPrompt,
    setVideoPrompt,
    isGeneratingVideo,
    videoGenerationProgress,
    generatedVideoUrl,
    videoJobId,
    videoError,
    generateVideo: handleGenerateVideo,

    // Video overlays (Phase 3)
    videoOverlays,
    selectedOverlayId,
    selectOverlay: setSelectedOverlayId,
    addVideoOverlay,
    updateVideoOverlay,
    removeVideoOverlay,
    clearVideoOverlays,

    // Video rendering (Phase 3)
    isRenderingVideo,
    renderProgress,
    finalVideoUrl,
    renderFinalVideo: handleRenderFinalVideo,

    // Video preview (Phase 3)
    isVideoPlaying,
    setIsVideoPlaying,
    videoCurrentTime,
    setVideoCurrentTime,
    videoDuration,
    setVideoDuration,
    resetVideoState,

    // Text overlay (primary/legacy)
    textOverlay,
    setTextOverlay: handleTextChange,

    // Modals
    modals,
    openModal,
    closeModal,
    closeAllModals,

    // Layer management (spread from useLayerManager)
    ...layerManager,

    // Project save/load
    currentProjectId,
    projectName,
    setProjectName,
    isSaving,
    saveError,
    saveProject: handleSaveProject,
    loadProject: handleLoadProject,

    // Reset
    resetAll,
  }
}

export default useStudioState
