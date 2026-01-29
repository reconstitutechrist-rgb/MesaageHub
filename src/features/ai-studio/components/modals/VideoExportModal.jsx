/**
 * VideoExportModal - Export options for rendered video with overlays
 */

import { usePhoneTheme } from '@/context/PhoneThemeContext'
import { StudioIcons } from '../../utils/StudioIcons'

export function VideoExportModal({
  isOpen,
  onClose,
  // Rendering state
  isRendering,
  renderProgress,
  // Result
  finalVideoUrl,
  generatedVideoUrl,
  // Actions
  onRenderWithOverlays,
  onDownload,
  onSendAsCampaign,
  hasOverlays = false,
}) {
  const { theme } = usePhoneTheme()

  if (!isOpen) return null

  // Use final video if available, otherwise use generated video
  const downloadUrl = finalVideoUrl || generatedVideoUrl

  const handleDownload = () => {
    if (!downloadUrl) return

    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = `video-${Date.now()}.mp4`
    link.click()

    onDownload?.()
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: theme.bg,
          borderRadius: '16px',
          padding: '24px',
          maxWidth: '400px',
          width: '90%',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
          }}
        >
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: theme.text, margin: 0 }}>
            Export Video
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            {StudioIcons.x(theme.textMuted, 20)}
          </button>
        </div>

        {/* Rendering progress */}
        {isRendering && (
          <div style={{ marginBottom: '20px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '12px',
              }}
            >
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  border: '2px solid rgba(255,255,255,0.2)',
                  borderTopColor: theme.accent,
                  animation: 'spin 1s linear infinite',
                }}
              />
              <span style={{ fontSize: '14px', color: theme.text }}>
                Rendering video with overlays...
              </span>
            </div>
            <div
              style={{
                width: '100%',
                height: '8px',
                background: theme.cardBg,
                borderRadius: '4px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${renderProgress}%`,
                  height: '100%',
                  background: theme.accent,
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
            <div
              style={{
                fontSize: '12px',
                color: theme.textMuted,
                marginTop: '8px',
                textAlign: 'center',
              }}
            >
              {Math.round(renderProgress)}% complete
            </div>
          </div>
        )}

        {/* Success state */}
        {!isRendering && downloadUrl && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            {/* Success message */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px',
                borderRadius: '8px',
                background: '#22c55e15',
                marginBottom: '8px',
              }}
            >
              {StudioIcons.check('#22c55e', 20)}
              <span style={{ fontSize: '14px', color: '#22c55e' }}>Video ready for export!</span>
            </div>

            {/* Render with overlays option */}
            {hasOverlays && !finalVideoUrl && (
              <button
                onClick={onRenderWithOverlays}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '14px 20px',
                  borderRadius: '10px',
                  border: `1px solid ${theme.cardBorder}`,
                  background: theme.cardBg,
                  color: theme.text,
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {StudioIcons.layers(theme.accent, 18)}
                Render with Overlays (Server)
              </button>
            )}

            {/* Download button */}
            <button
              onClick={handleDownload}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '14px 20px',
                borderRadius: '10px',
                border: 'none',
                background: theme.accent,
                color: '#fff',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {StudioIcons.download('#fff', 18)}
              Download Video
            </button>

            {/* Send as campaign button */}
            {onSendAsCampaign && (
              <button
                onClick={() => {
                  onSendAsCampaign(downloadUrl)
                  onClose()
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '14px 20px',
                  borderRadius: '10px',
                  border: `1px solid ${theme.cardBorder}`,
                  background: 'transparent',
                  color: theme.text,
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {StudioIcons.megaphone(theme.accent, 18)}
                Send as Campaign
              </button>
            )}

            {/* Continue editing */}
            <button
              onClick={onClose}
              style={{
                padding: '12px 20px',
                borderRadius: '10px',
                border: 'none',
                background: 'transparent',
                color: theme.textMuted,
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              Continue Editing
            </button>
          </div>
        )}

        {/* No video state */}
        {!isRendering && !downloadUrl && (
          <div
            style={{
              textAlign: 'center',
              padding: '20px',
              color: theme.textMuted,
            }}
          >
            <div style={{ marginBottom: '12px' }}>{StudioIcons.video(theme.textMuted, 48)}</div>
            <p style={{ fontSize: '14px' }}>Generate a video first to export</p>
          </div>
        )}

        {/* CSS for spinner animation */}
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  )
}

export default VideoExportModal
