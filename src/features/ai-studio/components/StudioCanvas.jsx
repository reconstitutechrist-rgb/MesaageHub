import { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react'
import { usePhoneTheme } from '@/context/PhoneThemeContext'
import { triggerHaptic } from '../utils/haptics'
import {
  drawBackground,
  drawText,
  drawImage,
  drawGrid,
  drawSelectionIndicator,
  getTextBounds,
  loadImageFromFile,
  createExportCanvas,
  canvasToDataUrl,
  canvasToBlob,
  drawPromotionalLayer,
} from '@/lib/canvasUtils'
import { FALLBACK_COLORS } from '../utils/studioConstants'
import { LayerType } from '../store'
import {
  useCanvasDimensions,
  useBackground,
  useImageFile,
  useSortedLayers,
  useTextOverlay,
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

  // Zoom & pan state for pinch-to-zoom
  const [zoomLevel, setZoomLevel] = useState(1)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const pinchRef = useRef({ active: false, initialDistance: 0, initialZoom: 1 })
  const lastTapRef = useRef(0)
  const isPanningRef = useRef(false)

  const { theme, isDark } = usePhoneTheme()
  const fallbackBg = isDark ? FALLBACK_COLORS.dark : FALLBACK_COLORS.light
  const gridColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'

  // Stable ref to render — assigned after render is defined below.
  // Used by the image load effect so it doesn't re-run on every render dep change.
  const renderRef = useRef(null)

  // Load image when file changes (calls render on success via ref)
  useEffect(() => {
    if (!imageFile) {
      imageRef.current = null
      return
    }

    let cancelled = false
    loadImageFromFile(imageFile)
      .then((img) => {
        if (!cancelled) {
          imageRef.current = img
          renderRef.current?.()
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error('Failed to load image:', err)
          imageRef.current = null
        }
      })
    return () => {
      cancelled = true
    }
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

    // 2. Draw uploaded image
    if (imageRef.current) {
      drawImage(ctx, imageRef.current, w, h, 'contain')
    }

    // 3. Draw grid if empty (no image and no layers)
    if (!imageRef.current && layers.length === 0) {
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

    // 6. Draw additional layers (text and promotional elements)
    const promotionalTypes = [
      'badge',
      'cta',
      'price',
      'countdown',
      'stock',
      'qrcode',
      'product-tag',
    ]

    layers.forEach((layer) => {
      if (!layer.visible) return

      // Draw text layers
      if (layer.type === LayerType.TEXT && layer.data?.text) {
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

        // Draw selection indicator for text
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
      }

      // Draw promotional elements
      if (promotionalTypes.includes(layer.type)) {
        drawPromotionalLayer(ctx, layer, w, h)

        // Draw selection indicator for promotional elements
        if (layer.id === selectedLayerId) {
          const x = (layer.data.x / 100) * w
          const y = (layer.data.y / 100) * h
          const size = layer.data.width || layer.data.size || 100
          drawSelectionIndicator(
            ctx,
            { x: x - size / 2, y: y - size / 2, width: size, height: size },
            theme.accent
          )
        }
      }
    })
  }, [
    background,
    primaryTextOverlay,
    layers,
    selectedLayerId,
    fallbackBg,
    gridColor,
    theme.accent,
  ])

  // Keep renderRef in sync so the image load effect always calls the latest render
  renderRef.current = render

  // Re-render using requestAnimationFrame when dependencies change
  useEffect(() => {
    const frameId = requestAnimationFrame(() => render())
    return () => cancelAnimationFrame(frameId)
  }, [render, canvasWidth, canvasHeight])

  // Get canvas coordinates from event
  // Note: getBoundingClientRect() already accounts for CSS transforms (zoom/pan)
  // on ancestor elements, so no manual zoom/pan correction is needed.
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
      // --- Pinch-to-zoom: detect two-finger touch ---
      if (e.touches && e.touches.length === 2) {
        const t1 = e.touches[0]
        const t2 = e.touches[1]
        const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY)
        pinchRef.current = { active: true, initialDistance: dist, initialZoom: zoomLevel }
        isDraggingRef.current = false
        return
      }

      // --- Double-tap to reset zoom (only when zoomed) ---
      if (e.touches && e.touches.length === 1) {
        const now = Date.now()
        if (now - lastTapRef.current < 300 && zoomLevel !== 1) {
          // Double-tap detected while zoomed - reset
          setZoomLevel(1)
          setPanOffset({ x: 0, y: 0 })
          lastTapRef.current = 0
          triggerHaptic('medium')
          return
        }
        lastTapRef.current = now
      }

      const coords = getCanvasCoords(e)

      // Check primary text first
      if (isNearPrimaryText(coords.x, coords.y)) {
        isDraggingRef.current = true
        dragTargetRef.current = 'primary'
        dragOffsetRef.current = {
          x: coords.x - primaryTextOverlay.x,
          y: coords.y - primaryTextOverlay.y,
        }
        triggerHaptic('light')
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
        triggerHaptic('light')
        return
      }

      // Pan when zoomed and tapping empty space
      if (zoomLevel > 1) {
        isPanningRef.current = true
        const clientX = e.touches ? e.touches[0].clientX : e.clientX
        const clientY = e.touches ? e.touches[0].clientY : e.clientY
        // Store offset in screen space (panOffset is in local space, so multiply by zoom)
        dragOffsetRef.current = {
          x: clientX - panOffset.x * zoomLevel,
          y: clientY - panOffset.y * zoomLevel,
        }
        return
      }

      // Click on empty space - clear selection
      selectLayer(null)
    },
    [
      getCanvasCoords,
      isNearPrimaryText,
      getLayerAtPoint,
      primaryTextOverlay,
      selectLayer,
      zoomLevel,
      panOffset,
    ]
  )

  const handlePointerMove = useCallback(
    (e) => {
      // --- Pinch zoom move ---
      if (pinchRef.current.active && e.touches && e.touches.length === 2) {
        const t1 = e.touches[0]
        const t2 = e.touches[1]
        const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY)
        const ratio = dist / pinchRef.current.initialDistance
        setZoomLevel(Math.max(0.5, Math.min(3, pinchRef.current.initialZoom * ratio)))
        return
      }

      // --- Pan when zoomed ---
      if (isPanningRef.current) {
        const clientX = e.touches ? e.touches[0].clientX : e.clientX
        const clientY = e.touches ? e.touches[0].clientY : e.clientY
        // Convert screen delta back to local space by dividing by zoom
        setPanOffset({
          x: (clientX - dragOffsetRef.current.x) / zoomLevel,
          y: (clientY - dragOffsetRef.current.y) / zoomLevel,
        })
        return
      }

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
    [getCanvasCoords, setTextOverlay, updateLayer, zoomLevel]
  )

  const handlePointerUp = useCallback(() => {
    // Reset pinch state
    pinchRef.current.active = false
    isPanningRef.current = false

    if (isDraggingRef.current) {
      // Haptic feedback when drag ends
      triggerHaptic('medium')

      if (dragTargetRef.current && dragTargetRef.current !== 'primary') {
        // Push final position to history after drag ends
        const layer = layers.find((l) => l.id === dragTargetRef.current)
        if (layer) {
          // Force a history push by updating with skipHistory=false
          updateLayer(dragTargetRef.current, { data: layer.data }, false)
        }
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
            const promotionalTypes = [
              'badge',
              'cta',
              'price',
              'countdown',
              'stock',
              'qrcode',
              'product-tag',
            ]

            layers.forEach((layer) => {
              if (!layer.visible) return

              // Draw text layers
              if (layer.type === LayerType.TEXT && layer.data?.text) {
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
              }

              // Draw promotional elements (scaled)
              if (promotionalTypes.includes(layer.type)) {
                // Scale layer data for export
                const scaledLayer = {
                  ...layer,
                  data: {
                    ...layer.data,
                    fontSize: (layer.data.fontSize || 24) * scaleX,
                    width: (layer.data.width || 100) * scaleX,
                    size: (layer.data.size || 120) * scaleX,
                  },
                }
                drawPromotionalLayer(ctx, scaledLayer, w, h)
              }
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

            const promotionalTypes = [
              'badge',
              'cta',
              'price',
              'countdown',
              'stock',
              'qrcode',
              'product-tag',
            ]

            layers.forEach((layer) => {
              if (!layer.visible) return

              // Draw text layers
              if (layer.type === LayerType.TEXT && layer.data?.text) {
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
              }

              // Draw promotional elements (scaled)
              if (promotionalTypes.includes(layer.type)) {
                const scaledLayer = {
                  ...layer,
                  data: {
                    ...layer.data,
                    fontSize: (layer.data.fontSize || 24) * scaleX,
                    width: (layer.data.width || 100) * scaleX,
                    size: (layer.data.size || 120) * scaleX,
                  },
                }
                drawPromotionalLayer(ctx, scaledLayer, w, h)
              }
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
      primaryTextOverlay,
      layers,
    ]
  )

  const resetZoom = useCallback(() => {
    setZoomLevel(1)
    setPanOffset({ x: 0, y: 0 })
  }, [])

  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
          transformOrigin: 'center center',
          transition: zoomLevel === 1 ? 'transform 0.2s ease' : 'none',
        }}
      >
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
      </div>

      {/* Zoom indicator pill */}
      {zoomLevel !== 1 && (
        <button
          onClick={resetZoom}
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            padding: '4px 10px',
            borderRadius: '12px',
            background: 'rgba(0,0,0,0.6)',
            color: '#fff',
            fontSize: '11px',
            fontWeight: '600',
            border: 'none',
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 10,
          }}
        >
          {Math.round(zoomLevel * 100)}%
        </button>
      )}
    </div>
  )
})

export { StudioCanvas }
export default StudioCanvas
