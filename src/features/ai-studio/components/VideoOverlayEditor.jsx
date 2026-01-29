/**
 * VideoOverlayEditor - Edit overlay properties (content, position, timing, animation, style)
 *
 * Uses Zustand store for video state and actions.
 */

import { usePhoneTheme } from '@/context/PhoneThemeContext'
import { StudioIcons } from '../utils/StudioIcons'
import { OVERLAY_ANIMATIONS, FONT_SIZE_PRESETS, FONT_WEIGHT_PRESETS } from '../utils/videoConstants'
import { useVideoDuration, useVideoActions, useSelectedOverlayId } from '../store/selectors'

// Color palette for overlay text
const COLOR_PALETTE = [
  '#ffffff',
  '#000000',
  '#ef4444',
  '#f59e0b',
  '#22c55e',
  '#3b82f6',
  '#a855f7',
  '#ec4899',
]

export function VideoOverlayEditor({ overlay }) {
  const { theme } = usePhoneTheme()

  // Get state and actions from Zustand store
  const videoDuration = useVideoDuration()
  const selectedOverlayId = useSelectedOverlayId()
  const { updateVideoOverlay, removeVideoOverlay, selectOverlay } = useVideoActions()

  const isSelected = overlay?.id === selectedOverlayId

  if (!overlay) return null

  const handleChange = (field, value) => {
    if (field.includes('.')) {
      // Handle nested fields like 'style.color' or 'timing.start'
      const [parent, child] = field.split('.')
      updateVideoOverlay(overlay.id, {
        [parent]: {
          ...overlay[parent],
          [child]: value,
        },
      })
    } else {
      updateVideoOverlay(overlay.id, { [field]: value })
    }
  }

  return (
    <div
      onClick={() => selectOverlay(overlay.id)}
      style={{
        padding: '12px',
        borderRadius: '8px',
        background: isSelected ? `${theme.accent}15` : theme.bgSecondary,
        border: `1px solid ${isSelected ? theme.accent : theme.border}`,
        transition: 'all 0.2s ease',
        cursor: 'pointer',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {StudioIcons.type(theme.accent, 16)}
          <span style={{ fontSize: '13px', fontWeight: '600', color: theme.text }}>
            {overlay.type === 'text' ? 'Text Overlay' : 'Image Overlay'}
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            removeVideoOverlay(overlay.id)
          }}
          style={{
            padding: '4px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            opacity: 0.6,
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = 0.6)}
        >
          {StudioIcons.trash('#ef4444', 16)}
        </button>
      </div>

      {/* Content input (for text) */}
      {overlay.type === 'text' && (
        <div style={{ marginBottom: '12px' }}>
          <label style={labelStyle(theme)}>Content</label>
          <input
            type="text"
            value={overlay.content}
            onChange={(e) => handleChange('content', e.target.value)}
            onClick={(e) => e.stopPropagation()}
            style={inputStyle(theme)}
            placeholder="Enter text..."
          />
        </div>
      )}

      {/* Position sliders */}
      <div style={{ marginBottom: '12px' }}>
        <label style={labelStyle(theme)}>Position</label>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '10px', color: theme.textSecondary, marginBottom: '4px' }}>
              X: {Math.round(overlay.position.x)}%
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={overlay.position.x}
              onChange={(e) => handleChange('position.x', parseFloat(e.target.value))}
              onClick={(e) => e.stopPropagation()}
              style={sliderStyle(theme)}
            />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '10px', color: theme.textSecondary, marginBottom: '4px' }}>
              Y: {Math.round(overlay.position.y)}%
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={overlay.position.y}
              onChange={(e) => handleChange('position.y', parseFloat(e.target.value))}
              onClick={(e) => e.stopPropagation()}
              style={sliderStyle(theme)}
            />
          </div>
        </div>
      </div>

      {/* Timing sliders */}
      <div style={{ marginBottom: '12px' }}>
        <label style={labelStyle(theme)}>{StudioIcons.clock(theme.textSecondary, 12)} Timing</label>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '10px', color: theme.textSecondary, marginBottom: '4px' }}>
              Start: {overlay.timing.start.toFixed(1)}s
            </div>
            <input
              type="range"
              min={0}
              max={videoDuration}
              step={0.1}
              value={overlay.timing.start}
              onChange={(e) => handleChange('timing.start', parseFloat(e.target.value))}
              onClick={(e) => e.stopPropagation()}
              style={sliderStyle(theme)}
            />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '10px', color: theme.textSecondary, marginBottom: '4px' }}>
              End: {overlay.timing.end.toFixed(1)}s
            </div>
            <input
              type="range"
              min={0}
              max={videoDuration}
              step={0.1}
              value={overlay.timing.end}
              onChange={(e) => handleChange('timing.end', parseFloat(e.target.value))}
              onClick={(e) => e.stopPropagation()}
              style={sliderStyle(theme)}
            />
          </div>
        </div>
      </div>

      {/* Animation dropdown */}
      <div style={{ marginBottom: '12px' }}>
        <label style={labelStyle(theme)}>Animation</label>
        <select
          value={overlay.animation}
          onChange={(e) => handleChange('animation', e.target.value)}
          onClick={(e) => e.stopPropagation()}
          style={selectStyle(theme)}
        >
          {OVERLAY_ANIMATIONS.map((anim) => (
            <option key={anim.id} value={anim.id}>
              {anim.name}
            </option>
          ))}
        </select>
      </div>

      {/* Style controls (for text) */}
      {overlay.type === 'text' && (
        <>
          {/* Color picker */}
          <div style={{ marginBottom: '12px' }}>
            <label style={labelStyle(theme)}>Color</label>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {COLOR_PALETTE.map((color) => (
                <button
                  key={color}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleChange('style.color', color)
                  }}
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '4px',
                    border:
                      overlay.style?.color === color
                        ? `2px solid ${theme.accent}`
                        : '2px solid transparent',
                    background: color,
                    cursor: 'pointer',
                    boxShadow: color === '#ffffff' ? 'inset 0 0 0 1px rgba(0,0,0,0.1)' : 'none',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Font size */}
          <div style={{ marginBottom: '12px' }}>
            <label style={labelStyle(theme)}>Font Size</label>
            <div style={{ display: 'flex', gap: '6px' }}>
              {FONT_SIZE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleChange('style.fontSize', preset.value)
                  }}
                  style={{
                    flex: 1,
                    padding: '6px 8px',
                    borderRadius: '4px',
                    border: 'none',
                    background: overlay.style?.fontSize === preset.value ? theme.accent : theme.bg,
                    color: overlay.style?.fontSize === preset.value ? '#fff' : theme.text,
                    fontSize: '11px',
                    cursor: 'pointer',
                  }}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Font weight */}
          <div style={{ marginBottom: '12px' }}>
            <label style={labelStyle(theme)}>Font Weight</label>
            <select
              value={overlay.style?.fontWeight || 'bold'}
              onChange={(e) => handleChange('style.fontWeight', e.target.value)}
              onClick={(e) => e.stopPropagation()}
              style={selectStyle(theme)}
            >
              {FONT_WEIGHT_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.value}>
                  {preset.name}
                </option>
              ))}
            </select>
          </div>

          {/* Shadow toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={overlay.style?.shadow ?? true}
              onChange={(e) => handleChange('style.shadow', e.target.checked)}
              onClick={(e) => e.stopPropagation()}
              style={{ cursor: 'pointer' }}
            />
            <label style={{ fontSize: '12px', color: theme.text, cursor: 'pointer' }}>
              Text Shadow
            </label>
          </div>
        </>
      )}
    </div>
  )
}

// Reusable styles
const labelStyle = (theme) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  fontSize: '11px',
  fontWeight: '500',
  color: theme.textSecondary,
  marginBottom: '6px',
})

const inputStyle = (theme) => ({
  width: '100%',
  padding: '8px 10px',
  borderRadius: '6px',
  border: `1px solid ${theme.border}`,
  background: theme.bg,
  color: theme.text,
  fontSize: '13px',
  outline: 'none',
})

const selectStyle = (theme) => ({
  width: '100%',
  padding: '8px 10px',
  borderRadius: '6px',
  border: `1px solid ${theme.border}`,
  background: theme.bg,
  color: theme.text,
  fontSize: '13px',
  outline: 'none',
  cursor: 'pointer',
})

const sliderStyle = (theme) => ({
  width: '100%',
  height: '4px',
  WebkitAppearance: 'none',
  appearance: 'none',
  background: theme.border,
  borderRadius: '2px',
  cursor: 'pointer',
})

export default VideoOverlayEditor
