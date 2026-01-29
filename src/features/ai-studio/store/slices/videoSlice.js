/**
 * Video Slice - Manages video generation and overlays (Phase 3)
 *
 * Handles:
 * - Video generation (Veo 3.1, Sora 2)
 * - Video overlays
 * - Video rendering with Creatomate
 * - Preview state
 */

import { aiService } from '@/services/AIService'
import { computeCanvasDimensions } from '../../utils/canvasLogic'

/**
 * Video slice for Zustand store
 */
export const createVideoSlice = (set, get) => ({
  // Video generation
  videoModel: 'veo-3.1',
  videoPrompt: '',
  isGeneratingVideo: false,
  videoGenerationProgress: 0,
  generatedVideoUrl: null,
  videoJobId: null,
  videoError: null,

  // Video overlays
  videoOverlays: [],
  selectedOverlayId: null,

  // Video rendering
  isRenderingVideo: false,
  renderProgress: 0,
  finalVideoUrl: null,

  // Video preview
  isVideoPlaying: false,
  videoCurrentTime: 0,
  videoDuration: 8,

  // Set video model
  setVideoModel: (model) => set({ videoModel: model }),

  // Set video prompt
  setVideoPrompt: (prompt) => set({ videoPrompt: prompt }),

  // Generate video from prompt
  generateVideo: async () => {
    const { videoPrompt, videoModel, isGeneratingVideo, selectedPlatform } = get()
    if (!videoPrompt.trim() || isGeneratingVideo) return

    set({
      isGeneratingVideo: true,
      videoGenerationProgress: 0,
      generatedVideoUrl: null,
      videoError: null,
    })

    try {
      // Determine aspect ratio from platform
      const { exportWidth, exportHeight } = computeCanvasDimensions(selectedPlatform)
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
        set({ videoError: result.message || 'Video generation not configured' })
        return
      }

      if (result.jobId) {
        set({ videoJobId: result.jobId })

        // Poll for completion
        const { videoUrl } = await aiService.pollVideoStatus(result.jobId, videoModel, (progress) =>
          set({ videoGenerationProgress: progress })
        )

        set({
          generatedVideoUrl: videoUrl,
          videoGenerationProgress: 100,
        })
      }
    } catch (error) {
      console.error('Video generation failed:', error)
      set({ videoError: error.message || 'Video generation failed' })
    } finally {
      set({ isGeneratingVideo: false })
    }
  },

  // Add a video overlay
  addVideoOverlay: (data = {}) => {
    const { videoDuration } = get()
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
    set((state) => ({
      videoOverlays: [...state.videoOverlays, overlay],
      selectedOverlayId: overlay.id,
    }))
    return overlay
  },

  // Update a video overlay
  updateVideoOverlay: (id, updates) => {
    set((state) => ({
      videoOverlays: state.videoOverlays.map((o) => (o.id === id ? { ...o, ...updates } : o)),
    }))
  },

  // Remove a video overlay
  removeVideoOverlay: (id) => {
    const { selectedOverlayId } = get()
    set((state) => ({
      videoOverlays: state.videoOverlays.filter((o) => o.id !== id),
      selectedOverlayId: selectedOverlayId === id ? null : selectedOverlayId,
    }))
  },

  // Select an overlay
  selectOverlay: (id) => set({ selectedOverlayId: id }),

  // Clear all video overlays
  clearVideoOverlays: () => {
    set({ videoOverlays: [], selectedOverlayId: null })
  },

  // Render final video with overlays
  renderFinalVideo: async () => {
    const { generatedVideoUrl, videoOverlays, isRenderingVideo } = get()
    if (!generatedVideoUrl || isRenderingVideo) return

    set({
      isRenderingVideo: true,
      renderProgress: 0,
      finalVideoUrl: null,
    })

    try {
      const result = await aiService.renderVideoWithOverlays(generatedVideoUrl, videoOverlays, {
        outputFormat: 'mp4',
        resolution: '1080p',
      })

      if (result.fallback) {
        // Fallback: use original video
        set({ finalVideoUrl: generatedVideoUrl })
        console.warn('Server-side rendering unavailable, using original video')
      } else if (result.renderJobId) {
        // Poll for render completion
        try {
          await aiService.pollRenderStatus(result.renderJobId, (progress) =>
            set({ renderProgress: progress })
          )
        } catch {
          // If polling fails, use original video
          set({ finalVideoUrl: generatedVideoUrl })
        }
      }

      set({ renderProgress: 100 })
    } catch (error) {
      console.error('Video render failed:', error)
      // Fallback to original video
      set({ finalVideoUrl: generatedVideoUrl })
    } finally {
      set({ isRenderingVideo: false })
    }
  },

  // Video preview controls
  setIsVideoPlaying: (playing) => set({ isVideoPlaying: playing }),
  setVideoCurrentTime: (time) => set({ videoCurrentTime: time }),
  setVideoDuration: (duration) => set({ videoDuration: duration }),

  // Reset video state (called by global reset)
  resetVideoState: () => {
    set({
      videoModel: 'veo-3.1',
      videoPrompt: '',
      isGeneratingVideo: false,
      videoGenerationProgress: 0,
      generatedVideoUrl: null,
      videoJobId: null,
      videoError: null,
      videoOverlays: [],
      selectedOverlayId: null,
      isRenderingVideo: false,
      renderProgress: 0,
      finalVideoUrl: null,
      isVideoPlaying: false,
      videoCurrentTime: 0,
      videoDuration: 8,
    })
  },
})
