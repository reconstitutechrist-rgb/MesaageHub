import { usePhoneTheme } from '@/context/PhoneThemeContext'
import { StudioIcons } from '../utils/StudioIcons'

/**
 * StudioHeader - Top header bar for AI Studio
 *
 * Contains:
 * - Close button
 * - Platform selector dropdown
 * - Undo/Redo buttons
 * - Export button
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
}) {
  const { theme } = usePhoneTheme()

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
        padding: '0 20px',
      }}
    >
      {/* Left: Close button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
        <span
          style={{
            color: theme.text,
            fontSize: '16px',
            fontWeight: '600',
          }}
        >
          AI Studio
        </span>
      </div>

      {/* Center: Platform selector */}
      <button
        onClick={onPlatformClick}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          borderRadius: '8px',
          border: `1px solid ${theme.cardBorder}`,
          background: theme.cardBg,
          cursor: 'pointer',
        }}
      >
        <span style={{ color: theme.text, fontSize: '14px', fontWeight: '500' }}>
          {currentPreset?.label || 'Select Platform'}
        </span>
        <span style={{ color: theme.textMuted, fontSize: '12px' }}>
          {exportWidth} × {exportHeight}
        </span>
        {StudioIcons.chevronDown(theme.textMuted, 16)}
      </button>

      {/* Right: Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Undo */}
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

        {/* Redo */}
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

        {/* Variants button */}
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

        {/* Send as SMS button - direct campaign pipeline */}
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

        {/* Save button */}
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

        {/* Export button */}
        <button
          onClick={onExport}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: '10px',
            border: 'none',
            background: `linear-gradient(135deg, ${theme.gradientStart}, ${theme.gradientEnd})`,
            color: '#fff',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: `0 4px 12px ${theme.accentGlow}`,
          }}
        >
          {StudioIcons.download('#fff', 18)}
          Export
        </button>
      </div>
    </div>
  )
}

export default StudioHeader
