import { usePhoneTheme } from '@/context/PhoneThemeContext'
import { StudioIcons } from '../utils/StudioIcons'
import {
  useTextLayers,
  useSelectedLayerId,
  useImageFile,
  useTextOverlayText,
  useLayerActions,
  useUIActions,
  useGlobalActions,
} from '../store/selectors'

/**
 * StudioLayersPanel - Right sidebar for layer management
 *
 * Uses Zustand store for all state and actions.
 *
 * Shows:
 * - Primary text layer
 * - Additional text layers
 * - Image layer
 * - Background layer
 * - Add layer button
 * - Quick actions
 */
export function StudioLayersPanel() {
  const { theme } = usePhoneTheme()

  // Get state from Zustand store
  const textLayers = useTextLayers()
  const selectedLayerId = useSelectedLayerId()
  const imageFile = useImageFile()
  const primaryText = useTextOverlayText()

  // Get actions from Zustand store
  const { selectLayer, toggleLayerVisibility, removeLayer, addTextLayer } = useLayerActions()
  const { openModal } = useUIActions()
  const { resetAll } = useGlobalActions()

  // Derived state
  const hasImage = !!imageFile

  // Action handlers
  const handleResizeCanvas = () => openModal('platforms')
  const handleResetAll = () => resetAll()

  return (
    <div
      style={{
        width: '280px',
        borderLeft: `1px solid ${theme.cardBorder}`,
        background: theme.navBg,
        backdropFilter: 'blur(20px)',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
      }}
    >
      {/* Layers Section */}
      <div>
        <h3
          style={{
            color: theme.text,
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {StudioIcons.layers(theme.accent, 18)} Layers
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Primary Text Layer (legacy) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              borderRadius: '12px',
              background: theme.cardBg,
              border: `1px solid ${theme.cardBorder}`,
              opacity: primaryText ? 1 : 0.5,
            }}
          >
            {StudioIcons.type(theme.textMuted, 18)}
            <span style={{ color: theme.text, fontSize: '13px', flex: 1 }}>
              {primaryText
                ? primaryText.substring(0, 20) + (primaryText.length > 20 ? '...' : '')
                : 'Text Layer'}
            </span>
            {primaryText ? StudioIcons.eye(theme.textMuted) : StudioIcons.eyeOff(theme.textMuted)}
          </div>

          {/* Additional Text Layers */}
          {textLayers.map((layer) => (
            <div
              key={layer.id}
              onClick={() => selectLayer(layer.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                borderRadius: '12px',
                background: selectedLayerId === layer.id ? `${theme.accent}20` : theme.cardBg,
                border: `1px solid ${selectedLayerId === layer.id ? theme.accent : theme.cardBorder}`,
                opacity: layer.visible ? 1 : 0.5,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {StudioIcons.type(theme.textMuted, 18)}
              <span style={{ color: theme.text, fontSize: '13px', flex: 1 }}>
                {layer.data?.text
                  ? layer.data.text.substring(0, 20) + (layer.data.text.length > 20 ? '...' : '')
                  : layer.name}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleLayerVisibility(layer.id)
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                {layer.visible
                  ? StudioIcons.eye(theme.textMuted)
                  : StudioIcons.eyeOff(theme.textMuted)}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  removeLayer(layer.id)
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  color: '#ef4444',
                }}
              >
                {StudioIcons.x('#ef4444', 16)}
              </button>
            </div>
          ))}

          {/* Image Layer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              borderRadius: '12px',
              background: theme.cardBg,
              border: `1px solid ${theme.cardBorder}`,
              opacity: hasImage ? 1 : 0.5,
            }}
          >
            {StudioIcons.image(theme.textMuted, 18)}
            <span style={{ color: theme.text, fontSize: '13px', flex: 1 }}>Image Layer</span>
            {hasImage ? StudioIcons.eye(theme.textMuted) : StudioIcons.eyeOff(theme.textMuted)}
          </div>

          {/* Background Layer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              borderRadius: '12px',
              background: theme.cardBg,
              border: `1px solid ${theme.cardBorder}`,
            }}
          >
            {StudioIcons.grid(theme.textMuted, 18)}
            <span style={{ color: theme.text, fontSize: '13px', flex: 1 }}>Background</span>
            {StudioIcons.eye(theme.textMuted)}
          </div>

          {/* Add Text Layer Button */}
          <button
            onClick={addTextLayer}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px',
              borderRadius: '12px',
              background: 'transparent',
              border: `1px dashed ${theme.cardBorder}`,
              color: theme.accent,
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {StudioIcons.plus(theme.accent, 16)} Add Text Layer
          </button>
        </div>
      </div>

      {/* Quick Actions Section */}
      <div>
        <h3
          style={{
            color: theme.text,
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '12px',
          }}
        >
          Quick Actions
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            onClick={handleResizeCanvas}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              borderRadius: '12px',
              background: 'transparent',
              border: `1px solid ${theme.cardBorder}`,
              color: theme.text,
              fontSize: '13px',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            {StudioIcons.resize(theme.textMuted, 18)} Resize Canvas
          </button>

          <button
            onClick={handleResetAll}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              borderRadius: '12px',
              background: 'transparent',
              border: `1px solid ${theme.cardBorder}`,
              color: theme.text,
              fontSize: '13px',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            {StudioIcons.x(theme.textMuted, 18)} Reset All
          </button>
        </div>
      </div>
    </div>
  )
}

export default StudioLayersPanel
