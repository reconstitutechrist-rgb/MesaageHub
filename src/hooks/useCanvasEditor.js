import { useState, useRef, useCallback, useEffect } from 'react'
import { useLayerManager, LayerType } from './useLayerManager'
import { aiService } from '@/services/AIService'
import {
  drawBackground,
  drawText,
  drawImage,
  drawTemplateElements,
  drawGrid,
  drawSelectionIndicator,
  getTextBounds,
  createExportCanvas,
  canvasToDataUrl,
  canvasToBlob,
  loadImageFromFile,
} from '@/lib/canvasUtils'

/**
 * Hook for managing a canvas-based image editor with layers and AI support
 * @param {object} options - Configuration options
 * @param {string} [options.defaultPlatform='instagram-post'] - Default platform preset
 * @param {object} [options.theme] - Theme configuration { isDark, bg, text }
 * @param {boolean} [options.singleLayerMode=false] - If true, only allows one text layer (backward compatible)
 * @returns {object} - Canvas editor state and methods
 */
export function useCanvasEditor(options = {}) {
  const {
    defaultPlatform = 'instagram-post',
    theme = { isDark: false },
    singleLayerMode = false,
  } = options

  // Canvas refs
  const canvasRef = useRef(null)
  const imageRef = useRef(null)

  // Layer management
  const layerManager = useLayerManager([])

  // Canvas state
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 800 })
  const [platform, setPlatform] = useState(defaultPlatform)
  const [background, setBackground] = useState(null) // { type: 'solid' | 'gradient', value: string | string[] }
  const [activeTemplate, setActiveTemplate] = useState(null)
  const [uploadedImage, setUploadedImage] = useState(null) // File object

  // AI state
  const [isGenerating, setIsGenerating] = useState(false)
  const [prompt, setPrompt] = useState('')

  // Drag state
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  /**
   * Handle image upload
   */
  const handleImageUpload = useCallback(
    async (file) => {
      if (!file) return

      setUploadedImage(file)
      const img = await loadImageFromFile(file)
      imageRef.current = img

      // Clear text overlay when new image is uploaded
      if (singleLayerMode) {
        layerManager.clearLayers()
        layerManager.addTextLayer('', { x: 50, y: 80 })
      }
    },
    [singleLayerMode, layerManager]
  )

  /**
   * Clear the uploaded image
   */
  const clearImage = useCallback(() => {
    setUploadedImage(null)
    imageRef.current = null
  }, [])

  /**
   * Render the canvas
   */
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const { width, height } = canvasSize

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Draw background
    const fallbackColor = theme.isDark ? '#1a1a2e' : '#f1f5f9'
    drawBackground(ctx, background, width, height, fallbackColor)

    // Draw template elements if active (without image)
    if (activeTemplate && !uploadedImage) {
      drawTemplateElements(ctx, activeTemplate, width, height)
    }

    // Draw uploaded image
    if (imageRef.current) {
      drawImage(ctx, imageRef.current, width, height, 'contain')
    }

    // Draw grid if no image and no template (empty state)
    if (!uploadedImage && !activeTemplate && !background) {
      const gridColor = theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
      drawGrid(ctx, width, height, gridColor, 20)
    }

    // Draw all visible text layers
    layerManager.sortedLayers.forEach((layer) => {
      if (!layer.visible) return

      if (layer.type === LayerType.TEXT) {
        // Convert percentage positions to pixel positions
        const x = (layer.data.x / 100) * width
        const y = (layer.data.y / 100) * height

        drawText(ctx, {
          text: layer.data.text,
          x,
          y,
          color: layer.data.color,
          fontSize: layer.data.fontSize,
          fontWeight: layer.data.fontWeight,
          fontFamily: layer.data.fontFamily,
          textAlign: layer.data.textAlign,
          shadow: layer.data.shadow,
        })

        // Draw selection indicator for selected layer
        if (layer.id === layerManager.selectedLayerId) {
          const bounds = getTextBounds(ctx, {
            text: layer.data.text,
            x,
            y,
            fontSize: layer.data.fontSize,
            fontWeight: layer.data.fontWeight,
            fontFamily: layer.data.fontFamily,
            textAlign: layer.data.textAlign,
          })
          drawSelectionIndicator(ctx, bounds, theme.isDark ? '#06b6d4' : '#0891b2')
        }
      }
    })
  }, [canvasSize, theme, background, activeTemplate, uploadedImage, layerManager])

  /**
   * Trigger canvas re-render when dependencies change
   */
  useEffect(() => {
    renderCanvas()
  }, [renderCanvas])

  /**
   * Also render when image loads
   */
  useEffect(() => {
    if (uploadedImage && imageRef.current) {
      renderCanvas()
    }
  }, [uploadedImage, renderCanvas])

  /**
   * Handle mouse/touch down on canvas
   */
  const handleMouseDown = useCallback(
    (e) => {
      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const scaleX = canvas.width / rect.width
      const scaleY = canvas.height / rect.height
      const x = (e.clientX - rect.left) * scaleX
      const y = (e.clientY - rect.top) * scaleY

      // Check if click is on any text layer (reverse order - top layers first)
      const ctx = canvas.getContext('2d')
      const clickedLayer = [...layerManager.sortedLayers].reverse().find((layer) => {
        if (layer.type !== LayerType.TEXT || layer.locked || !layer.visible) return false

        const layerX = (layer.data.x / 100) * canvas.width
        const layerY = (layer.data.y / 100) * canvas.height
        const bounds = getTextBounds(ctx, {
          text: layer.data.text,
          x: layerX,
          y: layerY,
          fontSize: layer.data.fontSize,
          fontWeight: layer.data.fontWeight,
          fontFamily: layer.data.fontFamily,
          textAlign: layer.data.textAlign,
        })

        // Hit test with some padding
        const padding = 20
        return (
          x >= bounds.x - padding &&
          x <= bounds.x + bounds.width + padding &&
          y >= bounds.y - padding &&
          y <= bounds.y + bounds.height + padding
        )
      })

      if (clickedLayer) {
        layerManager.selectLayer(clickedLayer.id)

        const layerX = (clickedLayer.data.x / 100) * canvas.width
        const layerY = (clickedLayer.data.y / 100) * canvas.height

        setIsDragging(true)
        setDragOffset({
          x: x - layerX,
          y: y - layerY,
        })
      } else {
        layerManager.clearSelection()
      }
    },
    [layerManager]
  )

  /**
   * Handle mouse/touch move on canvas
   */
  const handleMouseMove = useCallback(
    (e) => {
      if (!isDragging || !layerManager.selectedLayerId) return

      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const scaleX = canvas.width / rect.width
      const scaleY = canvas.height / rect.height
      const x = (e.clientX - rect.left) * scaleX
      const y = (e.clientY - rect.top) * scaleY

      // Convert to percentage
      const newX = ((x - dragOffset.x) / canvas.width) * 100
      const newY = ((y - dragOffset.y) / canvas.height) * 100

      // Clamp to canvas bounds
      layerManager.updateSelectedLayer({
        x: Math.max(0, Math.min(100, newX)),
        y: Math.max(0, Math.min(100, newY)),
      })
    },
    [isDragging, dragOffset, layerManager]
  )

  /**
   * Handle mouse/touch up
   */
  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  /**
   * Generate AI content
   */
  const generateWithAI = useCallback(
    async (inputPrompt = prompt) => {
      if (!inputPrompt) return { success: false, error: 'No prompt provided' }

      setIsGenerating(true)
      try {
        const result = await aiService.generateMarketingCopy(inputPrompt)

        if (result.success) {
          const { headline, suggestedColor } = result.data

          if (singleLayerMode) {
            // Update or create single text layer
            if (layerManager.textLayers.length === 0) {
              layerManager.addTextLayer(headline, {
                x: 50,
                y: 50,
                color: suggestedColor || '#ffffff',
              })
            } else {
              const textLayer = layerManager.textLayers[0]
              layerManager.updateLayer(textLayer.id, {
                data: {
                  text: headline,
                  color: suggestedColor || textLayer.data.color,
                },
              })
            }
          } else {
            // Multi-layer mode: add as new layer
            layerManager.addTextLayer(headline, {
              x: 50,
              y: 30,
              color: suggestedColor || '#ffffff',
              fontSize: 60,
            })
          }
        }

        return result
      } finally {
        setIsGenerating(false)
      }
    },
    [prompt, singleLayerMode, layerManager]
  )

  /**
   * Analyze image and generate content
   */
  const analyzeImageAndGenerate = useCallback(
    async (productName) => {
      if (!uploadedImage) return { success: false, error: 'No image uploaded' }

      setIsGenerating(true)
      try {
        const result = await aiService.analyzeProductImage(productName)

        if (result.success) {
          const { headlines, suggestedColor, suggestedPosition } = result.data
          const canvas = canvasRef.current

          if (singleLayerMode) {
            if (layerManager.textLayers.length === 0) {
              layerManager.addTextLayer(headlines[0], {
                x: suggestedPosition?.x || 50,
                y: suggestedPosition?.y || 80,
                color: suggestedColor || '#ffffff',
              })
            } else {
              const textLayer = layerManager.textLayers[0]
              layerManager.updateLayer(textLayer.id, {
                data: {
                  text: headlines[0],
                  color: suggestedColor || textLayer.data.color,
                  x: canvas ? 50 : suggestedPosition?.x || 50,
                  y: canvas ? 80 : suggestedPosition?.y || 80,
                },
              })
            }
          } else {
            layerManager.addTextLayer(headlines[0], {
              x: suggestedPosition?.x || 50,
              y: suggestedPosition?.y || 80,
              color: suggestedColor || '#ffffff',
            })
          }
        }

        return result
      } finally {
        setIsGenerating(false)
      }
    },
    [uploadedImage, singleLayerMode, layerManager]
  )

  /**
   * Apply a marketing template
   */
  const applyTemplate = useCallback((template) => {
    setActiveTemplate(template)

    // Extract background from template
    if (template?.elements) {
      const bgElement = template.elements.find((el) => el.type === 'background')
      if (bgElement) {
        if (bgElement.style === 'gradient' && bgElement.colors) {
          setBackground({ type: 'gradient', value: bgElement.colors })
        } else if (bgElement.style === 'solid' && bgElement.color) {
          setBackground({ type: 'solid', value: bgElement.color })
        }
      }
    }
  }, [])

  /**
   * Clear the template
   */
  const clearTemplate = useCallback(() => {
    setActiveTemplate(null)
  }, [])

  /**
   * Export canvas as data URL
   */
  const exportAsDataUrl = useCallback(
    (exportWidth, exportHeight) => {
      const canvas = canvasRef.current
      if (!canvas) return null

      const exportCanvas = createExportCanvas(
        canvas,
        exportWidth || canvas.width,
        exportHeight || canvas.height,
        (ctx, scaleX, scaleY, width, height) => {
          // Redraw everything at export resolution
          const fallbackColor = theme.isDark ? '#1a1a2e' : '#f1f5f9'
          drawBackground(ctx, background, width, height, fallbackColor)

          if (activeTemplate && !uploadedImage) {
            drawTemplateElements(ctx, activeTemplate, width, height)
          }

          if (imageRef.current) {
            drawImage(ctx, imageRef.current, width, height, 'contain')
          }

          // Draw text layers scaled
          layerManager.sortedLayers.forEach((layer) => {
            if (!layer.visible || layer.type !== LayerType.TEXT) return

            const x = (layer.data.x / 100) * width
            const y = (layer.data.y / 100) * height
            const scaledFontSize = layer.data.fontSize * scaleX

            drawText(ctx, {
              text: layer.data.text,
              x,
              y,
              color: layer.data.color,
              fontSize: scaledFontSize,
              fontWeight: layer.data.fontWeight,
              fontFamily: layer.data.fontFamily,
              textAlign: layer.data.textAlign,
              shadow: layer.data.shadow
                ? {
                    ...layer.data.shadow,
                    blur: layer.data.shadow.blur * scaleX,
                    offsetX: (layer.data.shadow.offsetX || 0) * scaleX,
                    offsetY: (layer.data.shadow.offsetY || 0) * scaleY,
                  }
                : null,
            })
          })
        }
      )

      return canvasToDataUrl(exportCanvas)
    },
    [theme, background, activeTemplate, uploadedImage, layerManager]
  )

  /**
   * Export canvas as Blob
   */
  const exportAsBlob = useCallback(
    async (exportWidth, exportHeight) => {
      const canvas = canvasRef.current
      if (!canvas) return null

      const exportCanvas = createExportCanvas(
        canvas,
        exportWidth || canvas.width,
        exportHeight || canvas.height,
        (ctx, scaleX, scaleY, width, height) => {
          const fallbackColor = theme.isDark ? '#1a1a2e' : '#f1f5f9'
          drawBackground(ctx, background, width, height, fallbackColor)

          if (activeTemplate && !uploadedImage) {
            drawTemplateElements(ctx, activeTemplate, width, height)
          }

          if (imageRef.current) {
            drawImage(ctx, imageRef.current, width, height, 'contain')
          }

          layerManager.sortedLayers.forEach((layer) => {
            if (!layer.visible || layer.type !== LayerType.TEXT) return

            const x = (layer.data.x / 100) * width
            const y = (layer.data.y / 100) * height
            const scaledFontSize = layer.data.fontSize * scaleX

            drawText(ctx, {
              text: layer.data.text,
              x,
              y,
              color: layer.data.color,
              fontSize: scaledFontSize,
              fontWeight: layer.data.fontWeight,
              fontFamily: layer.data.fontFamily,
              textAlign: layer.data.textAlign,
              shadow: layer.data.shadow
                ? {
                    ...layer.data.shadow,
                    blur: layer.data.shadow.blur * scaleX,
                    offsetX: (layer.data.shadow.offsetX || 0) * scaleX,
                    offsetY: (layer.data.shadow.offsetY || 0) * scaleY,
                  }
                : null,
            })
          })
        }
      )

      return canvasToBlob(exportCanvas)
    },
    [theme, background, activeTemplate, uploadedImage, layerManager]
  )

  // === Backward compatibility helpers for single layer mode ===

  /**
   * Get text overlay in legacy format (for backward compatibility)
   */
  const getTextOverlay = useCallback(() => {
    const textLayer = layerManager.textLayers[0]
    if (!textLayer) {
      return { text: '', x: 50, y: 50, color: '#ffffff', fontSize: 48, isDragging: false }
    }
    return {
      text: textLayer.data.text,
      x: textLayer.data.x,
      y: textLayer.data.y,
      color: textLayer.data.color,
      fontSize: textLayer.data.fontSize,
      isDragging,
    }
  }, [layerManager.textLayers, isDragging])

  /**
   * Set text overlay in legacy format (for backward compatibility)
   */
  const setTextOverlay = useCallback(
    (updates) => {
      const newValues = typeof updates === 'function' ? updates(getTextOverlay()) : updates

      if (layerManager.textLayers.length === 0) {
        layerManager.addTextLayer(newValues.text || '', {
          x: newValues.x ?? 50,
          y: newValues.y ?? 50,
          color: newValues.color ?? '#ffffff',
          fontSize: newValues.fontSize ?? 48,
        })
      } else {
        const textLayer = layerManager.textLayers[0]
        layerManager.updateLayer(textLayer.id, {
          data: {
            text: newValues.text ?? textLayer.data.text,
            x: newValues.x ?? textLayer.data.x,
            y: newValues.y ?? textLayer.data.y,
            color: newValues.color ?? textLayer.data.color,
            fontSize: newValues.fontSize ?? textLayer.data.fontSize,
          },
        })
      }
    },
    [layerManager, getTextOverlay]
  )

  return {
    // Refs
    canvasRef,

    // Canvas state
    canvasSize,
    setCanvasSize,
    platform,
    setPlatform,
    background,
    setBackground,
    activeTemplate,
    applyTemplate,
    clearTemplate,
    uploadedImage,
    handleImageUpload,
    clearImage,

    // AI state
    isGenerating,
    prompt,
    setPrompt,
    generateWithAI,
    analyzeImageAndGenerate,

    // Layer management (full access)
    layers: layerManager.layers,
    sortedLayers: layerManager.sortedLayers,
    selectedLayerId: layerManager.selectedLayerId,
    selectedLayer: layerManager.selectedLayer,
    textLayers: layerManager.textLayers,
    addLayer: layerManager.addLayer,
    addTextLayer: layerManager.addTextLayer,
    removeLayer: layerManager.removeLayer,
    updateLayer: layerManager.updateLayer,
    updateSelectedLayer: layerManager.updateSelectedLayer,
    selectLayer: layerManager.selectLayer,
    clearSelection: layerManager.clearSelection,
    toggleLayerVisibility: layerManager.toggleLayerVisibility,
    toggleLayerLock: layerManager.toggleLayerLock,
    moveLayerUp: layerManager.moveLayerUp,
    moveLayerDown: layerManager.moveLayerDown,
    duplicateLayer: layerManager.duplicateLayer,
    clearLayers: layerManager.clearLayers,

    // Canvas operations
    renderCanvas,
    exportAsDataUrl,
    exportAsBlob,

    // Drag operations
    isDragging,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,

    // Backward compatibility (single layer mode)
    textOverlay: getTextOverlay(),
    setTextOverlay,
  }
}
