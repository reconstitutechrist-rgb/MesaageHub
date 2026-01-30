import { usePhoneTheme } from '@/context/PhoneThemeContext'
import { StudioIcons } from '../../utils/StudioIcons'
import { useContactOverlay, useContactOverlayEnabled, useBrandActions } from '../../store/selectors'

/**
 * ExportOptionsModal - Shows after successful export to media library
 *
 * Offers options to download, send as campaign, or continue editing.
 * Includes contact overlay toggle for branding.
 */
export function ExportOptionsModal({
  isOpen,
  onClose,
  onDownload,
  onSendAsCampaign,
  onMultiPlatformExport,
  isMobile = false,
}) {
  const { theme } = usePhoneTheme()
  const contactOverlay = useContactOverlay()
  const contactOverlayEnabled = useContactOverlayEnabled()
  const { updateContactOverlay } = useBrandActions()

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
          padding: isMobile ? '20px' : '24px',
          zIndex: 1002,
          width: isMobile ? 'calc(100% - 32px)' : '320px',
          maxWidth: '320px',
          boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
        }}
      >
        {/* Success Header */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${theme.gradientStart}, ${theme.gradientEnd})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            {StudioIcons.check('#fff', 28)}
          </div>
          <h3
            style={{
              color: theme.text,
              fontSize: '18px',
              fontWeight: '700',
              margin: '0 0 8px',
            }}
          >
            Saved to Media Library!
          </h3>
          <p style={{ color: theme.textMuted, fontSize: '14px', margin: 0 }}>
            What would you like to do next?
          </p>
        </div>

        {/* Contact Overlay Option */}
        <div
          style={{
            padding: '12px',
            borderRadius: '12px',
            background: theme.cardBg,
            marginBottom: '16px',
          }}
        >
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {StudioIcons.megaphone(theme.accent, 18)}
              <div>
                <span
                  style={{
                    color: theme.text,
                    fontSize: '13px',
                    fontWeight: '500',
                    display: 'block',
                  }}
                >
                  Add contact info
                </span>
                {contactOverlay?.phoneNumber && (
                  <span style={{ color: theme.textMuted, fontSize: '11px' }}>
                    {contactOverlay.text} {contactOverlay.phoneNumber}
                  </span>
                )}
              </div>
            </div>
            <input
              type="checkbox"
              checked={contactOverlayEnabled}
              onChange={(e) => updateContactOverlay({ enabled: e.target.checked })}
              style={{
                width: '18px',
                height: '18px',
                accentColor: theme.accent,
                cursor: 'pointer',
              }}
            />
          </label>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Download Button */}
          <button
            onClick={onDownload}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '16px',
              borderRadius: '12px',
              border: `1px solid ${theme.cardBorder}`,
              background: theme.cardBg,
              color: theme.text,
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              minHeight: '48px',
            }}
          >
            {StudioIcons.download(theme.accent, 20)} Download Image
          </button>

          {/* Multi-Platform Export Button */}
          {onMultiPlatformExport && (
            <button
              onClick={onMultiPlatformExport}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                padding: '16px',
                borderRadius: '12px',
                border: `1px solid ${theme.cardBorder}`,
                background: theme.cardBg,
                color: theme.text,
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                minHeight: '48px',
              }}
            >
              {StudioIcons.multiPlatform(theme.accent, 20)} Export to Multiple Platforms
            </button>
          )}

          {/* Send as Campaign Button */}
          {onSendAsCampaign && (
            <button
              onClick={onSendAsCampaign}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                padding: '16px',
                borderRadius: '12px',
                border: 'none',
                background: `linear-gradient(135deg, ${theme.gradientStart}, ${theme.gradientEnd})`,
                color: '#fff',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: `0 4px 20px ${theme.accentGlow}`,
                minHeight: '48px',
              }}
            >
              {StudioIcons.megaphone('#fff', 20)} Send as Campaign
            </button>
          )}

          {/* Continue Editing Button */}
          <button
            onClick={onClose}
            style={{
              padding: '14px',
              borderRadius: '12px',
              border: 'none',
              background: 'transparent',
              color: theme.textMuted,
              fontSize: '14px',
              cursor: 'pointer',
              minHeight: '44px',
            }}
          >
            Continue Editing
          </button>
        </div>
      </div>
    </>
  )
}

export default ExportOptionsModal
