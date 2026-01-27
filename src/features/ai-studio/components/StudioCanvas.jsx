import { useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react'
import { usePhoneTheme } from '@/context/PhoneThemeContext'
import { LayerType } from '@/hooks/useLayerManager'
import {
  drawBackground,
  drawText,
  drawImage,
  drawTemplateElements,
  drawGrid,
  drawSelectionIndicator,
  getTextBounds,
  loadImageFromFile,
  createExportCanvas,
  canvasToDataUrl,
  canvasToBlob,
} from '@/lib/canvasUtils'
import { FALLBACK_COLORS } from '../utils/studioConstants'

/**
 * StudioCanvas - Pure canvas rendering component for AI Studio
 *
 * Handles all canvas drawing and interaction, but no UI controls.
 * Receives all state as props and calls back on interactions.
 */
const StudioCanvas = forwardRef(function StudioCanvas(
  {
    // Dimensions
    width,
    height,
    exportWidth,
    exportHeight,

    // Content
    background,
    imageFile,
    layers = [],
    primaryTextOverlay,
    activeTemplate,

    // Selection
    selectedLayerId,
    onLayerSelect,

    // Drag handling
    onPrimaryTextDragStart,
    onPrimaryTextDrag,
    onPrimaryTextDragEnd,
    onLayerDragStart,
    onLayerDrag,
    onLayerDragEnd,

    // Style
    style,
    className,
  },
  ref
) {
  const canvasRef = useRef(null)
  const imageRef = useRef(null)
  const isDraggingRef = useRef(false)
  const dragTargetRef = useRef(null) // 'primary' or layer id
  const dragOffsetRef = useRef({ x: 0, y: 0 })

  const { theme, isDark } = usePhoneTheme()
  const fallbackBg = isDark ? FALLBACK_COLORS.dark : FALLBACK_COLORS.light
  const gridColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'

  // Load image when file changes
  useEffect(() => {
    if (!imageFile) {
      imageRef.current = null
      return
    }

    loadImageFromFile(imageFile)
      .then((img) => {
        imageRef.current = img
      })
      .catch((err) => {
        console.error('Failed to load image:', err)
        imageRef.current = null
      })
  }, [imageFile])

  // Draw canvas
  const render = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const w = canvas.width
    const h = canvas.height

    // 1. Draw background
    drawBackground(ctx, background, w, h, fallbackBg)

    // 2. Draw template elements (if no image)
    if (activeTemplate && !imageRef.current) {
      drawTemplateElements(ctx, activeTemplate, w, h)
    }

    // 3. Draw uploaded image
    if (imageRef.current) {
      drawImage(ctx, imageRef.current, w, h, 'contain')
    }

    // 4. Draw grid if empty (no image and no template)
    if (!imageRef.current && !activeTemplate) {
      drawGrid(ctx, w, h, gridColor, 40)
    }

    // 5. Draw primary text overlay
    if (primaryTextOverlay?.text) {
      drawText(ctx, {
        text: primaryTextOverlay.text,
        x: primaryTextOverlay.x,
        y: primaryTextOverlay.y,
        color: primaryTextOverlay.color,
        fontSize: primaryTextOverlay.fontSize,
        fontWeight: 'bold',
        textAlign: 'center',
        shadow: {
          color: 'rgba(0,0,0,0.5)',
          blur: 8,
          offsetX: 2,
          offsetY: 2,
        },
      })
    }

    // 6. Draw additional layers
    layers.forEach((layer) => {
      if (layer.type !== LayerType.TEXT || !layer.visible || !layer.data?.text) return

      const x = (layer.data.x / 100) * w
      const y = (layer.data.y / 100) * h

      drawText(ctx, {
        text: layer.data.text,
        x,
        y,
        color: layer.data.color,
        fontSize: layer.data.fontSize,
        fontWeight: layer.data.fontWeight || 'bold',
        textAlign: 'center',
        shadow: {
          color: 'rgba(0,0,0,0.5)',
          blur: 8,
          offsetX: 2,
          offsetY: 2,
        },
      })

      // Draw selection indicator
      if (layer.id === selectedLayerId) {
        const bounds = getTextBounds(ctx, {
          text: layer.data.text,
          x,
          y,
          fontSize: layer.data.fontSize,
          fontWeight: layer.data.fontWeight || 'bold',
        })
        drawSelectionIndicator(ctx, bounds, theme.accent)
      }
    })
  }, [
    background,
    activeTemplate,
    primaryTextOverlay,
    layers,
    selectedLayerId,
    fallbackBg,
    gridColor,
    theme.accent,
  ])

  // Re-render when dependencies change
  useEffect(() => {
    render()
  }, [render, imageFile, width, height])

  // Re-render when image loads
  useEffect(() => {
    if (!imageFile) return

    const checkImage = () => {
      if (imageRef.current) {
        render()
      }
    }

    // Poll for image load (since it's async)
    const interval = setInterval(checkImage, 100)
    const timeout = setTimeout(() => clearInterval(interval), 3000)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [imageFile, render])

  // Get canvas coordinates from event
  const getCanvasCoords = useCallback((e) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    }
  }, [])

  // Check if point is near primary text overlay
  const isNearPrimaryText = useCallback(
    (x, y) => {
      if (!primaryTextOverlay?.text) return false
      const distance = Math.sqrt(
        Math.pow(x - primaryTextOverlay.x, 2) + Math.pow(y - primaryTextOverlay.y, 2)
      )
      return distance < 150 // Hit radius
    },
    [primaryTextOverlay]
  )

  // Check if point is on a layer
  const getLayerAtPoint = useCallback(
    (x, y) => {
      const canvas = canvasRef.current
      if (!canvas) return null

      const ctx = canvas.getContext('2d')

      // Check layers in reverse order (top first)
      for (let i = layers.length - 1; i >= 0; i--) {
        const layer = layers[i]
        if (layer.type !== LayerType.TEXT || !layer.visible || !layer.data?.text) continue

        const layerX = (layer.data.x / 100) * canvas.width
        const layerY = (layer.data.y / 100) * canvas.height

        const bounds = getTextBounds(ctx, {
          text: layer.data.text,
          x: layerX,
          y: layerY,
          fontSize: layer.data.fontSize,
          fontWeight: layer.data.fontWeight || 'bold',
        })

        const padding = 20
        if (
          x >= bounds.x - padding &&
          x <= bounds.x + bounds.width + padding &&
          y >= bounds.y - padding &&
          y <= bounds.y + bounds.height + padding
        ) {
          return layer
        }
      }

      return null
    },
    [layers]
  )

  // Mouse/touch handlers
  const handlePointerDown = useCallback(
    (e) => {
      const coords = getCanvasCoords(e)

      // Check primary text first
      if (isNearPrimaryText(coords.x, coords.y)) {
        isDraggingRef.current = true
        dragTargetRef.current = 'primary'
        dragOffsetRef.current = {
          x: coords.x - primaryTextOverlay.x,
          y: coords.y - primaryTextOverlay.y,
        }
        onPrimaryTextDragStart?.()
        return
      }

      // Check layers
      const layer = getLayerAtPoint(coords.x, coords.y)
      if (layer) {
        isDraggingRef.current = true
        dragTargetRef.current = layer.id
        const canvas = canvasRef.current
        const layerX = (layer.data.x / 100) * canvas.width
        const layerY = (layer.data.y / 100) * canvas.height
        dragOffsetRef.current = {
          x: coords.x - layerX,
          y: coords.y - layerY,
        }
        onLayerSelect?.(layer.id)
        onLayerDragStart?.(layer.id)
        return
      }

      // Click on empty space - clear selection
      onLayerSelect?.(null)
    },
    [
      getCanvasCoords,
      isNearPrimaryText,
      getLayerAtPoint,
      primaryTextOverlay,
      onPrimaryTextDragStart,
      onLayerSelect,
      onLayerDragStart,
    ]
  )

  const handlePointerMove = useCallback(
    (e) => {
      if (!isDraggingRef.current) return

      const coords = getCanvasCoords(e)
      const canvas = canvasRef.current
      if (!canvas) return

      if (dragTargetRef.current === 'primary') {
        onPrimaryTextDrag?.({
          x: coords.x - dragOffsetRef.current.x,
          y: coords.y - dragOffsetRef.current.y,
        })
      } else if (dragTargetRef.current) {
        // Layer drag - convert to percentage
        onLayerDrag?.(dragTargetRef.current, {
          x: ((coords.x - dragOffsetRef.current.x) / canvas.width) * 100,
          y: ((coords.y - dragOffsetRef.current.y) / canvas.height) * 100,
        })
      }
    },
    [getCanvasCoords, onPrimaryTextDrag, onLayerDrag]
  )

  const handlePointerUp = useCallback(() => {
    if (isDraggingRef.current) {
      if (dragTargetRef.current === 'primary') {
        onPrimaryTextDragEnd?.()
      } else if (dragTargetRef.current) {
        onLayerDragEnd?.(dragTargetRef.current)
      }
    }

    isDraggingRef.current = false
    dragTargetRef.current = null
    dragOffsetRef.current = { x: 0, y: 0 }
  }, [onPrimaryTextDragEnd, onLayerDragEnd])

  // Expose methods via ref
  useImperativeHandle(
    ref,
    () => ({
      // Get the canvas element
      getCanvas: () => canvasRef.current,

      // Force re-render
      render,

      // Export at full resolution
      async exportAsDataUrl(format = 'image/png', quality = 1.0) {
        const canvas = canvasRef.current
        if (!canvas) return null

        const exportCanvas = createExportCanvas(
          canvas,
          exportWidth,
          exportHeight,
          (ctx, scaleX, scaleY, w, h) => {
            // Draw background
            drawBackground(ctx, background, w, h, fallbackBg)

            // Draw template
            if (activeTemplate && !imageRef.current) {
              drawTemplateElements(ctx, activeTemplate, w, h)
            }

            // Draw image
            if (imageRef.current) {
              drawImage(ctx, imageRef.current, w, h, 'contain')
            }

            // Draw primary text (scaled)
            if (primaryTextOverlay?.text) {
              drawText(ctx, {
                text: primaryTextOverlay.text,
                x: primaryTextOverlay.x * scaleX,
                y: primaryTextOverlay.y * scaleY,
                color: primaryTextOverlay.color,
                fontSize: primaryTextOverlay.fontSize * scaleX,
                fontWeight: 'bold',
                textAlign: 'center',
                shadow: {
                  color: 'rgba(0,0,0,0.5)',
                  blur: 8 * scaleX,
                  offsetX: 2 * scaleX,
                  offsetY: 2 * scaleY,
                },
              })
            }

            // Draw layers (scaled)
            layers.forEach((layer) => {
              if (layer.type !== LayerType.TEXT || !layer.visible || !layer.data?.text) return

              const x = (layer.data.x / 100) * w
              const y = (layer.data.y / 100) * h

              drawText(ctx, {
                text: layer.data.text,
                x,
                y,
                color: layer.data.color,
                fontSize: layer.data.fontSize * scaleX,
                fontWeight: layer.data.fontWeight || 'bold',
                textAlign: 'center',
                shadow: {
                  color: 'rgba(0,0,0,0.5)',
                  blur: 8 * scaleX,
                  offsetX: 2 * scaleX,
                  offsetY: 2 * scaleY,
                },
              })
            })
          }
        )

        return canvasToDataUrl(exportCanvas, format, quality)
      },

      // Export as blob
      async exportAsBlob(format = 'image/png', quality = 1.0) {
        const canvas = canvasRef.current
        if (!canvas) return null

        const exportCanvas = createExportCanvas(
          canvas,
          exportWidth,
          exportHeight,
          (ctx, scaleX, scaleY, w, h) => {
            // Same drawing logic as exportAsDataUrl
            drawBackground(ctx, background, w, h, fallbackBg)

            if (activeTemplate && !imageRef.current) {
              drawTemplateElements(ctx, activeTemplate, w, h)
            }

            if (imageRef.current) {
              drawImage(ctx, imageRef.current, w, h, 'contain')
            }

            if (primaryTextOverlay?.text) {
              drawText(ctx, {
                text: primaryTextOverlay.text,
                x: primaryTextOverlay.x * scaleX,
                y: primaryTextOverlay.y * scaleY,
                color: primaryTextOverlay.color,
                fontSize: primaryTextOverlay.fontSize * scaleX,
                fontWeight: 'bold',
                textAlign: 'center',
                shadow: {
                  color: 'rgba(0,0,0,0.5)',
                  blur: 8 * scaleX,
                  offsetX: 2 * scaleX,
                  offsetY: 2 * scaleY,
                },
              })
            }

            layers.forEach((layer) => {
              if (layer.type !== LayerType.TEXT || !layer.visible || !layer.data?.text) return

              const x = (layer.data.x / 100) * w
              const y = (layer.data.y / 100) * h

              drawText(ctx, {
                text: layer.data.text,
                x,
                y,
                color: layer.data.color,
                fontSize: layer.data.fontSize * scaleX,
                fontWeight: layer.data.fontWeight || 'bold',
                textAlign: 'center',
                shadow: {
                  color: 'rgba(0,0,0,0.5)',
                  blur: 8 * scaleX,
                  offsetX: 2 * scaleX,
                  offsetY: 2 * scaleY,
                },
              })
            })
          }
        )

        return canvasToBlob(exportCanvas, format, quality)
      },
    }),
    [
      render,
      exportWidth,
      exportHeight,
      background,
      fallbackBg,
      activeTemplate,
      primaryTextOverlay,
      layers,
    ]
  )

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        cursor: isDraggingRef.current ? 'grabbing' : 'grab',
        touchAction: 'none',
        ...style,
      }}
      className={className}
      onMouseDown={handlePointerDown}
      onMouseMove={handlePointerMove}
      onMouseUp={handlePointerUp}
      onMouseLeave={handlePointerUp}
      onTouchStart={handlePointerDown}
      onTouchMove={handlePointerMove}
      onTouchEnd={handlePointerUp}
    />
  )
})

export { StudioCanvas }
export default StudioCanvas
