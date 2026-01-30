import { useState, memo } from 'react'
import { usePhoneTheme } from '@/context/PhoneThemeContext'
import { StudioIcons } from '../utils/StudioIcons'
import { BRAND_PRESETS, FONT_OPTIONS, OVERLAY_POSITIONS } from '../store/slices/brandSlice'
import {
  useBrandColors,
  useBrandFonts,
  useContactOverlay,
  useBrandActions,
} from '../store/selectors'

/**
 * BrandKitPanel - Brand kit management panel for consistent design identity
 *
 * Features:
 * - Brand color palette (primary, secondary, accent, text, background)
 * - Font selection for headings and body
 * - Logo upload
 * - Contact overlay settings
 * - Preset brand palettes
 */
export const BrandKitPanel = memo(function BrandKitPanel() {
  const { theme } = usePhoneTheme()
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState('colors') // colors, fonts, overlay

  // Get state from store
  const brandColors = useBrandColors()
  const brandFonts = useBrandFonts()
  const contactOverlay = useContactOverlay()

  // Get actions
  const { updateBrandColors, updateBrandFonts, updateContactOverlay, applyBrandPreset } =
    useBrandActions()

  const colorFields = [
    { key: 'primary', label: 'Primary' },
    { key: 'secondary', label: 'Secondary' },
    { key: 'accent', label: 'Accent' },
    { key: 'text', label: 'Text' },
    { key: 'background', label: 'Background' },
  ]

  return (
    <div>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          marginBottom: isExpanded ? '12px' : '0',
        }}
      >
        <h3
          style={{
            color: theme.text,
            fontSize: '14px',
            fontWeight: '600',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {StudioIcons.palette
            ? StudioIcons.palette(theme.accent, 18)
            : StudioIcons.layers(theme.accent, 18)}{' '}
          Brand Kit
        </h3>
        <span
          style={{
            color: theme.textMuted,
            fontSize: '18px',
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
          }}
        >
          ▼
        </span>
      </button>

      {isExpanded && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Brand Color Preview Bar */}
          <div
            style={{
              display: 'flex',
              gap: '4px',
              padding: '8px',
              borderRadius: '8px',
              background: theme.cardBg,
            }}
          >
            {Object.values(brandColors).map((color, idx) => (
              <div
                key={idx}
                style={{
                  flex: 1,
                  height: '24px',
                  background: color,
                  borderRadius: idx === 0 ? '4px 0 0 4px' : idx === 4 ? '0 4px 4px 0' : '0',
                }}
              />
            ))}
          </div>

          {/* Tab Navigation */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {[
              { id: 'colors', label: 'Colors' },
              { id: 'fonts', label: 'Fonts' },
              { id: 'overlay', label: 'Contact' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: activeTab === tab.id ? theme.accent : theme.cardBg,
                  color: activeTab === tab.id ? '#fff' : theme.textMuted,
                  fontSize: '12px',
                  fontWeight: '500',
                  cursor: 'pointer',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Colors Tab */}
          {activeTab === 'colors' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Quick Presets */}
              <div>
                <span
                  style={{
                    color: theme.textMuted,
                    fontSize: '11px',
                    marginBottom: '6px',
                    display: 'block',
                  }}
                >
                  Quick Presets
                </span>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {BRAND_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => applyBrandPreset(preset.id)}
                      title={preset.name}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        border: `1px solid ${theme.cardBorder}`,
                        background: `linear-gradient(135deg, ${preset.colors.primary}, ${preset.colors.secondary})`,
                        cursor: 'pointer',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          height: '8px',
                          background: preset.colors.accent,
                        }}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Individual Color Pickers */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {colorFields.map(({ key, label }) => (
                  <div
                    key={key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span style={{ color: theme.textMuted, fontSize: '12px' }}>{label}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="color"
                        value={brandColors[key]}
                        onChange={(e) => updateBrandColors({ [key]: e.target.value })}
                        style={{
                          width: '28px',
                          height: '28px',
                          padding: 0,
                          border: `1px solid ${theme.cardBorder}`,
                          borderRadius: '6px',
                          cursor: 'pointer',
                        }}
                      />
                      <input
                        type="text"
                        value={brandColors[key]}
                        onChange={(e) => updateBrandColors({ [key]: e.target.value })}
                        style={{
                          width: '70px',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          border: `1px solid ${theme.cardBorder}`,
                          background: theme.searchBg,
                          color: theme.text,
                          fontSize: '11px',
                          fontFamily: 'monospace',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fonts Tab */}
          {activeTab === 'fonts' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Heading Font */}
              <div>
                <span
                  style={{
                    color: theme.textMuted,
                    fontSize: '11px',
                    marginBottom: '6px',
                    display: 'block',
                  }}
                >
                  Heading Font
                </span>
                <select
                  value={brandFonts.heading}
                  onChange={(e) => updateBrandFonts({ heading: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: `1px solid ${theme.cardBorder}`,
                    background: theme.searchBg,
                    color: theme.text,
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  {FONT_OPTIONS.map((font) => (
                    <option key={font.id} value={font.value} style={{ fontFamily: font.value }}>
                      {font.name}
                    </option>
                  ))}
                </select>
                <div
                  style={{
                    marginTop: '8px',
                    padding: '12px',
                    borderRadius: '8px',
                    background: theme.cardBg,
                    fontFamily: brandFonts.heading,
                    fontSize: '18px',
                    fontWeight: '700',
                    color: theme.text,
                    textAlign: 'center',
                  }}
                >
                  Sample Heading
                </div>
              </div>

              {/* Body Font */}
              <div>
                <span
                  style={{
                    color: theme.textMuted,
                    fontSize: '11px',
                    marginBottom: '6px',
                    display: 'block',
                  }}
                >
                  Body Font
                </span>
                <select
                  value={brandFonts.body}
                  onChange={(e) => updateBrandFonts({ body: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: `1px solid ${theme.cardBorder}`,
                    background: theme.searchBg,
                    color: theme.text,
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  {FONT_OPTIONS.map((font) => (
                    <option key={font.id} value={font.value}>
                      {font.name}
                    </option>
                  ))}
                </select>
                <div
                  style={{
                    marginTop: '8px',
                    padding: '12px',
                    borderRadius: '8px',
                    background: theme.cardBg,
                    fontFamily: brandFonts.body,
                    fontSize: '13px',
                    color: theme.textMuted,
                    textAlign: 'center',
                  }}
                >
                  Sample body text for your marketing content
                </div>
              </div>
            </div>
          )}

          {/* Contact Overlay Tab */}
          {activeTab === 'overlay' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Enable Toggle */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                }}
              >
                <span style={{ color: theme.text, fontSize: '13px' }}>Add contact on export</span>
                <input
                  type="checkbox"
                  checked={contactOverlay?.enabled || false}
                  onChange={(e) => updateContactOverlay({ enabled: e.target.checked })}
                  style={{
                    width: '18px',
                    height: '18px',
                    accentColor: theme.accent,
                    cursor: 'pointer',
                  }}
                />
              </label>

              {contactOverlay?.enabled && (
                <>
                  {/* Overlay Text */}
                  <div>
                    <span
                      style={{
                        color: theme.textMuted,
                        fontSize: '11px',
                        marginBottom: '6px',
                        display: 'block',
                      }}
                    >
                      Overlay Text
                    </span>
                    <input
                      type="text"
                      value={contactOverlay?.text || 'Text me at'}
                      onChange={(e) => updateContactOverlay({ text: e.target.value })}
                      placeholder="Text me at"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: `1px solid ${theme.cardBorder}`,
                        background: theme.searchBg,
                        color: theme.text,
                        fontSize: '13px',
                      }}
                    />
                  </div>

                  {/* Phone Number */}
                  <div>
                    <span
                      style={{
                        color: theme.textMuted,
                        fontSize: '11px',
                        marginBottom: '6px',
                        display: 'block',
                      }}
                    >
                      Phone Number
                    </span>
                    <input
                      type="tel"
                      value={contactOverlay?.phoneNumber || ''}
                      onChange={(e) => updateContactOverlay({ phoneNumber: e.target.value })}
                      placeholder="(555) 123-4567"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: `1px solid ${theme.cardBorder}`,
                        background: theme.searchBg,
                        color: theme.text,
                        fontSize: '13px',
                      }}
                    />
                  </div>

                  {/* Position */}
                  <div>
                    <span
                      style={{
                        color: theme.textMuted,
                        fontSize: '11px',
                        marginBottom: '6px',
                        display: 'block',
                      }}
                    >
                      Position
                    </span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {OVERLAY_POSITIONS.map((pos) => (
                        <button
                          key={pos.id}
                          onClick={() => updateContactOverlay({ position: pos.id })}
                          style={{
                            flex: 1,
                            padding: '8px',
                            borderRadius: '8px',
                            border:
                              contactOverlay?.position === pos.id
                                ? `2px solid ${theme.accent}`
                                : `1px solid ${theme.cardBorder}`,
                            background:
                              contactOverlay?.position === pos.id
                                ? `${theme.accent}15`
                                : 'transparent',
                            color:
                              contactOverlay?.position === pos.id ? theme.accent : theme.textMuted,
                            fontSize: '11px',
                            cursor: 'pointer',
                          }}
                        >
                          {pos.name.split(' ')[1]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Preview */}
                  <div
                    style={{
                      padding: '16px',
                      borderRadius: '8px',
                      background: theme.cardBg,
                      position: 'relative',
                      height: '60px',
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '8px',
                        ...(contactOverlay?.position === 'bottom-left' && { left: '8px' }),
                        ...(contactOverlay?.position === 'bottom-center' && {
                          left: '50%',
                          transform: 'translateX(-50%)',
                        }),
                        ...(contactOverlay?.position === 'bottom-right' && { right: '8px' }),
                        background: 'rgba(0,0,0,0.7)',
                        color: '#fff',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {contactOverlay?.text || 'Text me at'}{' '}
                      {contactOverlay?.phoneNumber || '(555) 123-4567'}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
})

export default BrandKitPanel
