import { useState, useEffect, useRef } from 'react'
import { usePhoneTheme } from '@/context/PhoneThemeContext'
import { StudioIcons } from '../utils/StudioIcons'

/**
 * StudioHeader - Top header bar for AI Studio
 *
 * Desktop: All actions visible inline.
 * Mobile: Compact layout with overflow menu for secondary actions.
 */
export function StudioHeader({
  currentPreset,
  exportWidth,
  exportHeight,
  onPlatformClick,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onSave,
  onExport,
  onClose,
  onVariants,
  onSendAsCampaign,
  isMobile = false,
}) {
  const { theme } = usePhoneTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('pointerdown', handleClick)
    return () => document.removeEventListener('pointerdown', handleClick)
  }, [menuOpen])

  const menuItems = [
    { icon: StudioIcons.undo, label: 'Undo', action: onUndo, disabled: !canUndo },
    { icon: StudioIcons.redo, label: 'Redo', action: onRedo, disabled: !canRedo },
    { icon: StudioIcons.copy, label: 'Variants', action: onVariants },
    ...(onSendAsCampaign
      ? [{ icon: StudioIcons.megaphone, label: 'Send SMS', action: onSendAsCampaign }]
      : []),
    { icon: StudioIcons.save, label: 'Save', action: onSave },
  ]

  return (
    <div
      style={{
        height: '60px',
        borderBottom: `1px solid ${theme.cardBorder}`,
        background: theme.navBg,
        backdropFilter: 'blur(20px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: isMobile ? '0 12px' : '0 20px',
        position: 'relative',
      }}
    >
      {/* Left: Close button + title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '12px' }}>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {StudioIcons.x(theme.textMuted, 24)}
        </button>
        {!isMobile && (
          <span
            style={{
              color: theme.text,
              fontSize: '16px',
              fontWeight: '600',
            }}
          >
            AI Studio
          </span>
        )}
      </div>

      {/* Center: Platform selector */}
      <button
        onClick={onPlatformClick}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: isMobile ? '6px 12px' : '8px 16px',
          borderRadius: '8px',
          border: `1px solid ${theme.cardBorder}`,
          background: theme.cardBg,
          cursor: 'pointer',
        }}
      >
        <span
          style={{
            color: theme.text,
            fontSize: isMobile ? '13px' : '14px',
            fontWeight: '500',
          }}
        >
          {currentPreset?.label || 'Select Platform'}
        </span>
        {!isMobile && (
          <span style={{ color: theme.textMuted, fontSize: '12px' }}>
            {exportWidth} × {exportHeight}
          </span>
        )}
        {StudioIcons.chevronDown(theme.textMuted, 16)}
      </button>

      {/* Right: Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Desktop: all actions inline */}
        {!isMobile && (
          <>
            <button
              onClick={onUndo}
              disabled={!canUndo}
              style={{
                background: 'none',
                border: 'none',
                cursor: canUndo ? 'pointer' : 'not-allowed',
                padding: '8px',
                opacity: canUndo ? 1 : 0.4,
              }}
              title="Undo"
            >
              {StudioIcons.undo(theme.textMuted, 20)}
            </button>

            <button
              onClick={onRedo}
              disabled={!canRedo}
              style={{
                background: 'none',
                border: 'none',
                cursor: canRedo ? 'pointer' : 'not-allowed',
                padding: '8px',
                opacity: canRedo ? 1 : 0.4,
              }}
              title="Redo"
            >
              {StudioIcons.redo(theme.textMuted, 20)}
            </button>

            <button
              onClick={onVariants}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 16px',
                borderRadius: '10px',
                border: `1px solid ${theme.cardBorder}`,
                background: theme.cardBg,
                color: theme.text,
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
              }}
              title="Generate A/B Variants"
            >
              {StudioIcons.copy(theme.accent, 18)}
              Variants
            </button>

            {onSendAsCampaign && (
              <button
                onClick={onSendAsCampaign}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 16px',
                  borderRadius: '10px',
                  border: `1px solid ${theme.cardBorder}`,
                  background: theme.cardBg,
                  color: theme.text,
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                }}
                title="Send as SMS Campaign"
              >
                {StudioIcons.megaphone(theme.accent, 18)}
                Send SMS
              </button>
            )}

            <button
              onClick={onSave}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 16px',
                borderRadius: '10px',
                border: `1px solid ${theme.cardBorder}`,
                background: theme.cardBg,
                color: theme.text,
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
              }}
              title="Save Project"
            >
              {StudioIcons.save(theme.accent, 18)}
              Save
            </button>
          </>
        )}

        {/* Export button - always visible */}
        <button
          onClick={onExport}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: isMobile ? '6px' : '8px',
            padding: isMobile ? '8px 14px' : '10px 20px',
            borderRadius: '10px',
            border: 'none',
            background: `linear-gradient(135deg, ${theme.gradientStart}, ${theme.gradientEnd})`,
            color: '#fff',
            fontSize: isMobile ? '13px' : '14px',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: `0 4px 12px ${theme.accentGlow}`,
          }}
        >
          {StudioIcons.download('#fff', 18)}
          Export
        </button>

        {/* Mobile: overflow menu button */}
        {isMobile && (
          <div ref={menuRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {StudioIcons.moreVertical(theme.textMuted, 22)}
            </button>

            {/* Dropdown menu */}
            {menuOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '4px',
                  minWidth: '180px',
                  background: theme.cardBg,
                  border: `1px solid ${theme.cardBorder}`,
                  borderRadius: '12px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                  backdropFilter: 'blur(20px)',
                  zIndex: 100,
                  overflow: 'hidden',
                }}
              >
                {menuItems.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      if (!item.disabled) {
                        item.action()
                        setMenuOpen(false)
                      }
                    }}
                    disabled={item.disabled}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      width: '100%',
                      padding: '12px 16px',
                      background: 'none',
                      border: 'none',
                      borderBottom:
                        i < menuItems.length - 1 ? `1px solid ${theme.cardBorder}` : 'none',
                      color: item.disabled ? theme.textMuted : theme.text,
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: item.disabled ? 'not-allowed' : 'pointer',
                      opacity: item.disabled ? 0.4 : 1,
                      textAlign: 'left',
                    }}
                  >
                    {item.icon(item.disabled ? theme.textMuted : theme.accent, 18)}
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default StudioHeader
