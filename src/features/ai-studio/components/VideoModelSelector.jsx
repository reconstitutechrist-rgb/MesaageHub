/**
 * VideoModelSelector - Toggle between Veo 3.1 and Sora 2 video generation models
 */

import { usePhoneTheme } from '@/context/PhoneThemeContext'
import { VIDEO_MODELS } from '../utils/videoConstants'

export function VideoModelSelector({ selectedModel, onModelChange, disabled = false }) {
  const { theme } = usePhoneTheme()

  const models = Object.values(VIDEO_MODELS)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div
        style={{
          display: 'flex',
          gap: '8px',
          background: theme.cardBg,
          borderRadius: '8px',
          padding: '4px',
        }}
      >
        {models.map((model) => {
          const isSelected = selectedModel === model.id
          return (
            <button
              key={model.id}
              onClick={() => !disabled && onModelChange(model.id)}
              disabled={disabled}
              style={{
                flex: 1,
                padding: '10px 12px',
                borderRadius: '6px',
                border: 'none',
                cursor: disabled ? 'not-allowed' : 'pointer',
                background: isSelected ? theme.accent : 'transparent',
                color: isSelected ? '#fff' : theme.textMuted,
                fontWeight: isSelected ? '600' : '400',
                fontSize: '13px',
                transition: 'all 0.2s ease',
                opacity: disabled ? 0.5 : 1,
              }}
            >
              <div style={{ fontWeight: '600' }}>{model.name}</div>
              <div
                style={{
                  fontSize: '10px',
                  opacity: 0.8,
                  marginTop: '2px',
                }}
              >
                {model.provider}
              </div>
            </button>
          )
        })}
      </div>

      {/* Model description */}
      {selectedModel && VIDEO_MODELS[selectedModel] && (
        <div
          style={{
            fontSize: '11px',
            color: theme.textMuted,
            padding: '8px 12px',
            background: `${theme.accent}15`,
            borderRadius: '6px',
            lineHeight: '1.4',
          }}
        >
          <div style={{ fontWeight: '500', marginBottom: '4px' }}>
            {VIDEO_MODELS[selectedModel].description}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
            {VIDEO_MODELS[selectedModel].features.map((feature, i) => (
              <span
                key={i}
                style={{
                  background: theme.accent,
                  color: '#fff',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontSize: '10px',
                }}
              >
                {feature}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default VideoModelSelector
