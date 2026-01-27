import { usePhoneTheme } from '@/context/PhoneThemeContext'
import { platformCategories } from '@/lib/platformTemplates'

/**
 * PlatformPickerModal - Select social platform for canvas dimensions
 *
 * Shows platform presets grouped by category (square, vertical, horizontal).
 */
export function PlatformPickerModal({
  isOpen,
  onClose,
  presets = {},
  selectedPlatformId,
  onSelect,
  isMobile = false,
}) {
  const { theme } = usePhoneTheme()

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          zIndex: 1001,
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: theme.isDark ? '#1a1a2e' : '#ffffff',
          borderRadius: '24px',
          padding: '24px',
          zIndex: 1002,
          width: isMobile ? 'calc(100% - 32px)' : '420px',
          maxWidth: '420px',
          maxHeight: '80vh',
          overflow: 'auto',
          boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: '20px' }}>
          <h3
            style={{
              color: theme.text,
              fontSize: '18px',
              fontWeight: '700',
              margin: '0 0 4px',
            }}
          >
            Choose Platform
          </h3>
          <p style={{ color: theme.textMuted, fontSize: '13px', margin: 0 }}>
            Select the social platform to optimize your canvas size
          </p>
        </div>

        {/* Platform Categories */}
        {platformCategories.map((category) => {
          const categoryPresets = Object.entries(presets)
            .filter(([, p]) => p.category === category.id)
            .map(([id, p]) => ({ id, ...p }))

          if (categoryPresets.length === 0) return null

          return (
            <div key={category.id} style={{ marginBottom: '20px' }}>
              <h4
                style={{
                  color: theme.textMuted,
                  fontSize: '12px',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '10px',
                }}
              >
                {category.label}
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {categoryPresets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => onSelect(preset.id, preset)}
                    style={{
                      padding: '14px 12px',
                      borderRadius: '12px',
                      border:
                        selectedPlatformId === preset.id
                          ? `2px solid ${theme.accent}`
                          : `1px solid ${theme.cardBorder}`,
                      background:
                        selectedPlatformId === preset.id ? `${theme.accent}15` : theme.cardBg,
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      gap: '6px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        width: '100%',
                      }}
                    >
                      <span
                        style={{
                          color: selectedPlatformId === preset.id ? theme.accent : theme.text,
                          fontSize: '14px',
                          fontWeight: '600',
                        }}
                      >
                        {preset.label}
                      </span>
                      {selectedPlatformId === preset.id && (
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill={theme.accent}
                          style={{ marginLeft: 'auto' }}
                        >
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                        </svg>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{
                          color: theme.textMuted,
                          fontSize: '11px',
                        }}
                      >
                        {preset.width} × {preset.height}
                      </span>
                      <span
                        style={{
                          color: theme.textMuted,
                          fontSize: '11px',
                          padding: '2px 6px',
                          background: theme.cardBg,
                          borderRadius: '4px',
                        }}
                      >
                        {preset.aspectRatio}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )
        })}

        {/* Cancel Button */}
        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '12px',
            border: 'none',
            background: theme.cardBg,
            color: theme.textMuted,
            fontSize: '14px',
            cursor: 'pointer',
            marginTop: '8px',
          }}
        >
          Cancel
        </button>
      </div>
    </>
  )
}

export default PlatformPickerModal
