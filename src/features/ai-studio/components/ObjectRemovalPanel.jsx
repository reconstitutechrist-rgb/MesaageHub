import { useState, useRef, useCallback, useEffect, useMemo, memo } from 'react'
import { usePhoneTheme } from '@/context/PhoneThemeContext'
import { StudioIcons } from '../utils/StudioIcons'
import { BRUSH_SIZES } from '../utils/studioConstants'
import { aiService } from '@/services/AIService'

/**
 * Extract raw base64 from a data URL or return as-is if already raw base64
 */
function extractBase64(input) {
  if (!input) return null
  if (input.startsWith('data:')) {
    const parts = input.split(',')
    return parts.length > 1 ? parts[1] : null
  }
  return input
}

/**
 * ObjectRemovalPanel - Brush-based UI for AI object removal
 *
 * Allows users to paint over unwanted objects (price tags, security sensors,
 * background clutter) and use AI inpainting to remove them.
 */
export const ObjectRemovalPanel = memo(function ObjectRemovalPanel({
  imageBase64: rawImageBase64,
  onImageUpdate,
  isExpanded = false,
}) {
  // Ensure we have raw base64 without data URL prefix
  const imageBase64 = useMemo(() => extractBase64(rawImageBase64), [rawImageBase64])
  const { theme } = usePhoneTheme()
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [brushSize, setBrushSize] = useState(40)
  const [isProcessing, setIsProcessing] = useState(false)
  const [maskData, setMaskData] = useState(null)
  const [isPanelExpanded, setIsPanelExpanded] = useState(isExpanded)

  // Initialize canvas with image
  useEffect(() => {
    if (!canvasRef.current || !imageBase64) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      // Set canvas size to match image aspect ratio (max 300px width for panel)
      const maxWidth = 280
      const scale = maxWidth / img.width
      canvas.width = maxWidth
      canvas.height = img.height * scale

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    }

    img.src = `data:image/png;base64,${imageBase64}`
  }, [imageBase64])

  // Get canvas coordinates from mouse/touch event
  const getCanvasCoords = useCallback((e) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    }
  }, [])

  // Draw brush stroke
  const drawBrushStroke = useCallback(
    (x, y) => {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext('2d')

      // Draw semi-transparent red circle to indicate mask area
      ctx.globalCompositeOperation = 'source-over'
      ctx.fillStyle = 'rgba(239, 68, 68, 0.5)'
      ctx.beginPath()
      ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2)
      ctx.fill()

      // Store mask data
      setMaskData(canvas.toDataURL('image/png'))
    },
    [brushSize]
  )

  // Mouse/touch handlers
  const handlePointerDown = useCallback(
    (e) => {
      e.preventDefault()
      setIsDrawing(true)
      const { x, y } = getCanvasCoords(e)
      drawBrushStroke(x, y)
    },
    [getCanvasCoords, drawBrushStroke]
  )

  const handlePointerMove = useCallback(
    (e) => {
      if (!isDrawing) return
      e.preventDefault()
      const { x, y } = getCanvasCoords(e)
      drawBrushStroke(x, y)
    },
    [isDrawing, getCanvasCoords, drawBrushStroke]
  )

  const handlePointerUp = useCallback(() => {
    setIsDrawing(false)
  }, [])

  // Clear mask
  const handleClearMask = useCallback(() => {
    if (!canvasRef.current || !imageBase64) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      setMaskData(null)
    }

    img.src = `data:image/png;base64,${imageBase64}`
  }, [imageBase64])

  // Generate mask for AI and process
  const handleRemoveObjects = useCallback(async () => {
    if (!canvasRef.current || !imageBase64 || !maskData) return

    setIsProcessing(true)

    try {
      // Create a pure black and white mask from the painted areas
      const canvas = canvasRef.current
      const maskCanvas = document.createElement('canvas')
      maskCanvas.width = canvas.width
      maskCanvas.height = canvas.height
      const maskCtx = maskCanvas.getContext('2d')

      // Fill with black (keep)
      maskCtx.fillStyle = '#000000'
      maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height)

      // Get image data and find red areas (our brush strokes)
      const ctx = canvas.getContext('2d')
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data

      // Create mask: white where we painted (red areas)
      maskCtx.fillStyle = '#ffffff'
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]

        // Detect our red brush strokes
        if (r > 150 && g < 100 && b < 100) {
          const pixelIndex = i / 4
          const x = pixelIndex % canvas.width
          const y = Math.floor(pixelIndex / canvas.width)
          maskCtx.fillRect(x, y, 1, 1)
        }
      }

      const maskBase64 = maskCanvas.toDataURL('image/png').split(',')[1]

      // Call AI service
      const result = await aiService.removeObjects(imageBase64, maskBase64)

      if (result.imageBase64 && !result.fallback) {
        onImageUpdate?.(result.imageBase64)
        handleClearMask()
      } else {
        console.warn('Object removal returned fallback or failed')
      }
    } catch (error) {
      console.error('Object removal failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }, [imageBase64, maskData, onImageUpdate, handleClearMask])

  if (!imageBase64) {
    return null
  }

  return (
    <div
      style={{
        background: theme.cardBg,
        borderRadius: '12px',
        overflow: 'hidden',
        marginBottom: '12px',
      }}
    >
      {/* Header */}
      <button
        onClick={() => setIsPanelExpanded(!isPanelExpanded)}
        style={{
          width: '100%',
          padding: '12px 16px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {StudioIcons.eraser(theme.accent, 18)}
          <span style={{ color: theme.text, fontSize: '14px', fontWeight: '600' }}>
            Object Removal
          </span>
        </div>
        <span
          style={{
            color: theme.textMuted,
            transform: isPanelExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
          }}
        >
          {StudioIcons.chevronDown(theme.textMuted, 16)}
        </span>
      </button>

      {isPanelExpanded && (
        <div style={{ padding: '0 16px 16px' }}>
          {/* Instructions */}
          <p
            style={{
              color: theme.textMuted,
              fontSize: '12px',
              marginBottom: '12px',
              lineHeight: 1.4,
            }}
          >
            Paint over objects to remove (price tags, sensors, background clutter)
          </p>

          {/* Brush Size Selector */}
          <div style={{ marginBottom: '12px' }}>
            <span
              style={{
                color: theme.textMuted,
                fontSize: '11px',
                marginBottom: '6px',
                display: 'block',
              }}
            >
              Brush Size
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              {BRUSH_SIZES.map((brush) => (
                <button
                  key={brush.id}
                  onClick={() => setBrushSize(brush.size)}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    border:
                      brushSize === brush.size
                        ? `2px solid ${theme.accent}`
                        : `1px solid ${theme.cardBorder}`,
                    background: brushSize === brush.size ? `${theme.accent}15` : 'transparent',
                    color: brushSize === brush.size ? theme.accent : theme.text,
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {brush.label}
                </button>
              ))}
            </div>
          </div>

          {/* Canvas for painting mask */}
          <div
            style={{
              border: `1px solid ${theme.cardBorder}`,
              borderRadius: '8px',
              overflow: 'hidden',
              marginBottom: '12px',
              touchAction: 'none',
            }}
          >
            <canvas
              ref={canvasRef}
              onMouseDown={handlePointerDown}
              onMouseMove={handlePointerMove}
              onMouseUp={handlePointerUp}
              onMouseLeave={handlePointerUp}
              onTouchStart={handlePointerDown}
              onTouchMove={handlePointerMove}
              onTouchEnd={handlePointerUp}
              style={{
                display: 'block',
                width: '100%',
                cursor: 'crosshair',
              }}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleClearMask}
              disabled={!maskData}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '8px',
                border: `1px solid ${theme.cardBorder}`,
                background: 'transparent',
                color: maskData ? theme.text : theme.textMuted,
                fontSize: '13px',
                fontWeight: '500',
                cursor: maskData ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              {StudioIcons.x(maskData ? theme.text : theme.textMuted, 14)}
              Clear
            </button>
            <button
              onClick={handleRemoveObjects}
              disabled={!maskData || isProcessing}
              style={{
                flex: 2,
                padding: '10px',
                borderRadius: '8px',
                border: 'none',
                background:
                  !maskData || isProcessing
                    ? theme.cardBg
                    : `linear-gradient(135deg, ${theme.gradientStart}, ${theme.gradientEnd})`,
                color: !maskData || isProcessing ? theme.textMuted : '#fff',
                fontSize: '13px',
                fontWeight: '600',
                cursor: !maskData || isProcessing ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              {isProcessing ? (
                <>
                  <div
                    style={{
                      width: '14px',
                      height: '14px',
                      border: '2px solid currentColor',
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                    }}
                  />
                  Processing...
                </>
              ) : (
                <>
                  {StudioIcons.sparkles('#fff', 14)}
                  Remove Objects
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
})

export default ObjectRemovalPanel
