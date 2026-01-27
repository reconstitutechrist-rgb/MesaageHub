import { useState, useMemo } from 'react'
import { usePhoneTheme } from '@/context/PhoneThemeContext'

/**
 * TemplateBrowserModal - Full template library browser
 *
 * Shows all marketing templates with category filtering.
 */
export function TemplateBrowserModal({
  isOpen,
  onClose,
  templates = [],
  categories = [],
  activeTemplateId,
  onSelect,
  isMobile = false,
}) {
  const { theme } = usePhoneTheme()
  const [category, setCategory] = useState('all')

  const filteredTemplates = useMemo(() => {
    if (category === 'all') return templates
    return templates.filter((t) => t.category === category)
  }, [templates, category])

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
          width: isMobile ? 'calc(100% - 32px)' : '500px',
          maxWidth: '500px',
          maxHeight: '80vh',
          overflow: 'hidden',
          boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: '16px' }}>
          <h3
            style={{
              color: theme.text,
              fontSize: '18px',
              fontWeight: '700',
              margin: '0 0 4px',
            }}
          >
            Marketing Templates
          </h3>
          <p style={{ color: theme.textMuted, fontSize: '13px', margin: 0 }}>
            Choose a pre-designed template to get started quickly
          </p>
        </div>

        {/* Category Filter */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              style={{
                padding: '6px 14px',
                borderRadius: '16px',
                border: 'none',
                background: category === cat.id ? theme.accent : theme.cardBg,
                color: category === cat.id ? '#fff' : theme.textMuted,
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px',
            paddingRight: '8px',
          }}
        >
          {filteredTemplates.map((template) => (
            <button
              key={template.id}
              onClick={() => onSelect(template)}
              style={{
                padding: '12px',
                borderRadius: '16px',
                border:
                  activeTemplateId === template.id
                    ? `2px solid ${theme.accent}`
                    : `1px solid ${theme.cardBorder}`,
                background: activeTemplateId === template.id ? `${theme.accent}10` : theme.cardBg,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
                gap: '10px',
                textAlign: 'left',
              }}
            >
              {/* Template Preview */}
              <div
                style={{
                  width: '100%',
                  height: '100px',
                  borderRadius: '10px',
                  background:
                    template.elements?.[0]?.style === 'gradient'
                      ? `linear-gradient(135deg, ${template.elements[0].colors?.[0]}, ${template.elements[0].colors?.[1]})`
                      : template.elements?.[0]?.color || '#333',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  padding: '8px',
                }}
              >
                {template.elements
                  ?.filter((e) => e.type === 'text')
                  .slice(0, 2)
                  .map((textEl, idx) => (
                    <span
                      key={idx}
                      style={{
                        color: textEl.color || '#fff',
                        fontSize: Math.min(textEl.fontSize / 6, 16),
                        fontWeight: textEl.fontWeight || 'bold',
                        textAlign: 'center',
                        lineHeight: 1.2,
                      }}
                    >
                      {textEl.content}
                    </span>
                  ))}
              </div>

              {/* Template Info */}
              <div>
                <span
                  style={{
                    color: theme.text,
                    fontSize: '13px',
                    fontWeight: '600',
                    display: 'block',
                  }}
                >
                  {template.name}
                </span>
                <span
                  style={{
                    color: theme.textMuted,
                    fontSize: '11px',
                    textTransform: 'capitalize',
                  }}
                >
                  {template.category}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Cancel Button */}
        <button
          onClick={onClose}
          style={{
            marginTop: '16px',
            padding: '14px',
            borderRadius: '12px',
            border: 'none',
            background: theme.cardBg,
            color: theme.textMuted,
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
      </div>
    </>
  )
}

export default TemplateBrowserModal
