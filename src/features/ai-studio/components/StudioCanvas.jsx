import { useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react'
import { usePhoneTheme } from '@/context/PhoneThemeContext'
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
import { LayerType } from '../store'
import {
  useCanvasDimensions,
  useBackground,
  useImageFile,
  useSortedLayers,
  useTextOverlay,
  useActiveTemplate,
  useSelectedLayerId,
  useLayerActions,
  useTextOverlayActions,
} from '../store/selectors'

/**
 * StudioCanvas - Pure canvas rendering component for AI Studio
 *
 * Uses Zustand store for all state. Handles all canvas drawing
 * and interaction, but no UI controls.
 */
const StudioCanvas = forwardRef(function StudioCanvas({ style, className }, ref) {
  // Get state from Zustand store
  const { canvasWidth, canvasHeight, exportWidth, exportHeight } = useCanvasDimensions()
  const background = useBackground()
  const imageFile = useImageFile()
  const layers = useSortedLayers()
  const primaryTextOverlay = useTextOverlay()
  const activeTemplate = useActiveTemplate()
  const selectedLayerId = useSelectedLayerId()

  // Get actions from Zustand store
  const { selectLayer, updateLayer } = useLayerActions()
  const { setTextOverlay } = useTextOverlayActions()
  const canvasRef = useRef(null)
  const imageRef = useRef(null)
  const isDraggingRef = useRef(false)
  const dragTargetRef = useRef(null) // 'primary' or layer id
  const dragOffsetRef = useRef({ x: 0, y: 0 })
  const cachedBoundsRef = useRef(new Map()) // Cache layer bounds for hit testing

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

  // Cache layer bounds for fast hit testing (avoids repeated measureText calls)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const w = canvas.width
    const h = canvas.height

    // Clear old cache
    cachedBoundsRef.current.clear()

    // Calculate and cache bounds for each text layer
    layers.forEach((layer) => {
      if (layer.type !== LayerType.TEXT || !layer.visible || !layer.data?.text) return

      const layerX = (layer.data.x / 100) * w
      const layerY = (layer.data.y / 100) * h

      const bounds = getTextBounds(ctx, {
        text: layer.data.text,
        x: layerX,
        y: layerY,
        fontSize: layer.data.fontSize,
        fontWeight: layer.data.fontWeight || 'bold',
      })

      cachedBoundsRef.current.set(layer.id, {
        bounds,
        visible: layer.visible,
        locked: layer.locked,
        zIndex: layer.zIndex,
      })
    })
  }, [layers, canvasWidth, canvasHeight])

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
  }, [render, imageFile, canvasWidth, canvasHeight])

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

  // Check if point is on a layer using cached bounds (fast - no measureText calls)
  const getLayerAtPoint = useCallback(
    (x, y) => {
      const padding = 20

      // Check layers in reverse order (top first, by zIndex)
      // Sort by zIndex descending for hit testing
      const sortedLayers = [...layers]
        .filter((l) => l.type === LayerType.TEXT && l.visible && l.data?.text)
        .sort((a, b) => b.zIndex - a.zIndex)

      for (const layer of sortedLayers) {
        const cached = cachedBoundsRef.current.get(layer.id)
        if (!cached || !cached.bounds || cached.locked) continue

        const bounds = cached.bounds
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
        selectLayer(layer.id)
        return
      }

      // Click on empty space - clear selection
      selectLayer(null)
    },
    [getCanvasCoords, isNearPrimaryText, getLayerAtPoint, primaryTextOverlay, selectLayer]
  )

  const handlePointerMove = useCallback(
    (e) => {
      if (!isDraggingRef.current) return

      const coords = getCanvasCoords(e)
      const canvas = canvasRef.current
      if (!canvas) return

      if (dragTargetRef.current === 'primary') {
        // Update primary text overlay position (no history during drag)
        setTextOverlay({
          x: coords.x - dragOffsetRef.current.x,
          y: coords.y - dragOffsetRef.current.y,
        })
      } else if (dragTargetRef.current) {
        // Layer drag - convert to percentage, skipHistory=true for smooth dragging
        updateLayer(
          dragTargetRef.current,
          {
            data: {
              x: ((coords.x - dragOffsetRef.current.x) / canvas.width) * 100,
              y: ((coords.y - dragOffsetRef.current.y) / canvas.height) * 100,
            },
          },
          true // skipHistory during drag
        )
      }
    },
    [getCanvasCoords, setTextOverlay, updateLayer]
  )

  const handlePointerUp = useCallback(() => {
    if (isDraggingRef.current && dragTargetRef.current && dragTargetRef.current !== 'primary') {
      // Push final position to history after drag ends
      const layer = layers.find((l) => l.id === dragTargetRef.current)
      if (layer) {
        // Force a history push by updating with skipHistory=false
        updateLayer(dragTargetRef.current, { data: layer.data }, false)
      }
    }

    isDraggingRef.current = false
    dragTargetRef.current = null
    dragOffsetRef.current = { x: 0, y: 0 }
  }, [layers, updateLayer])

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
      width={canvasWidth}
      height={canvasHeight}
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
