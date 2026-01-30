import { useState, memo } from 'react'
import { usePhoneTheme } from '@/context/PhoneThemeContext'
import { StudioIcons } from '../utils/StudioIcons'
import { BADGE_PRESETS, CTA_PRESETS } from '../utils/promotionalElements'
import { QR_PRESETS, generateSMSUri } from '../utils/qrCodeGenerator'
import { useLayerActions } from '../store/selectors'

/**
 * PromotionalElementsPanel - UI for adding promotional overlays
 *
 * Allows users to add badges, CTAs, countdown timers, prices,
 * stock indicators, and QR codes to their designs.
 */
export const PromotionalElementsPanel = memo(function PromotionalElementsPanel({
  userPhoneNumber = '',
}) {
  const { theme } = usePhoneTheme()
  const [activeTab, setActiveTab] = useState('badges')
  const [isExpanded, setIsExpanded] = useState(true)

  const {
    addBadgeLayer,
    addCTALayer,
    addPriceLayer,
    addCountdownLayer,
    addStockIndicatorLayer,
    addQRCodeLayer,
  } = useLayerActions()

  // QR Code config state
  const [qrPreset, setQrPreset] = useState('sms-inquiry')
  const [qrMessage, setQrMessage] = useState(
    "Hi! I saw your promotion and I'm interested in learning more."
  )

  // Price config state
  const [originalPrice, setOriginalPrice] = useState('99.99')
  const [salePrice, setSalePrice] = useState('49.99')

  // Countdown config state
  const [countdownHours, setCountdownHours] = useState(24)

  // Stock config state
  const [stockCount, setStockCount] = useState(5)

  const tabs = [
    { id: 'badges', label: 'Badges', icon: 'badge' },
    { id: 'cta', label: 'Buttons', icon: 'cursor' },
    { id: 'pricing', label: 'Pricing', icon: 'tag' },
    { id: 'urgency', label: 'Urgency', icon: 'clock' },
    { id: 'qr', label: 'QR Code', icon: 'qrcode' },
  ]

  const handleAddBadge = (preset) => {
    addBadgeLayer(preset.id)
  }

  const handleAddCTA = (preset) => {
    addCTALayer(preset.id)
  }

  const handleAddPrice = () => {
    addPriceLayer(parseFloat(originalPrice) || 99.99, parseFloat(salePrice) || 49.99)
  }

  const handleAddCountdown = () => {
    const endDate = new Date(Date.now() + countdownHours * 60 * 60 * 1000).toISOString()
    addCountdownLayer(endDate)
  }

  const handleAddStockIndicator = () => {
    addStockIndicatorLayer(parseInt(stockCount) || 5)
  }

  const handleAddQRCode = () => {
    let data = ''

    if (qrPreset === 'sms-inquiry' || qrPreset === 'sms-order') {
      data = generateSMSUri(userPhoneNumber, qrMessage)
    } else {
      data = qrMessage // Use message field as URL for other presets
    }

    addQRCodeLayer(data, { presetId: qrPreset })
  }

  const buttonStyle = {
    padding: '8px 12px',
    borderRadius: '8px',
    border: `1px solid ${theme.cardBorder}`,
    background: theme.cardBg,
    color: theme.text,
    fontSize: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s',
  }

  const inputStyle = {
    padding: '8px 12px',
    borderRadius: '8px',
    border: `1px solid ${theme.cardBorder}`,
    background: theme.inputBg || theme.cardBg,
    color: theme.text,
    fontSize: '13px',
    width: '100%',
  }

  return (
    <div
      style={{
        background: theme.cardBg,
        borderRadius: '12px',
        overflow: 'hidden',
        marginBottom: '12px',
      }}
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          width: '100%',
          padding: '12px 16px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {StudioIcons.megaphone(theme.accent, 18)}
          <span style={{ color: theme.text, fontSize: '14px', fontWeight: '600' }}>
            Promotional Elements
          </span>
        </div>
        <span
          style={{
            color: theme.textMuted,
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
          }}
        >
          {StudioIcons.chevronDown(theme.textMuted, 16)}
        </span>
      </button>

      {isExpanded && (
        <div style={{ padding: '0 16px 16px' }}>
          {/* Tabs */}
          <div
            style={{
              display: 'flex',
              gap: '4px',
              marginBottom: '12px',
              overflowX: 'auto',
              paddingBottom: '4px',
            }}
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  background: activeTab === tab.id ? theme.accent : 'transparent',
                  color: activeTab === tab.id ? '#fff' : theme.textMuted,
                  fontSize: '11px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div style={{ minHeight: '120px' }}>
            {/* Badges Tab */}
            {activeTab === 'badges' && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '8px',
                }}
              >
                {BADGE_PRESETS.slice(0, 8).map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleAddBadge(preset)}
                    style={{
                      ...buttonStyle,
                      justifyContent: 'center',
                    }}
                  >
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: preset.background,
                      }}
                    />
                    <span style={{ fontSize: '11px' }}>{preset.label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* CTA Buttons Tab */}
            {activeTab === 'cta' && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '8px',
                }}
              >
                {CTA_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleAddCTA(preset)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border:
                        preset.style === 'outline' ? `2px solid ${preset.borderColor}` : 'none',
                      background: preset.style === 'outline' ? 'transparent' : preset.background,
                      color: preset.textColor,
                      fontSize: '11px',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            )}

            {/* Pricing Tab */}
            {activeTab === 'pricing' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ flex: 1 }}>
                    <label
                      style={{
                        fontSize: '11px',
                        color: theme.textMuted,
                        marginBottom: '4px',
                        display: 'block',
                      }}
                    >
                      Original Price
                    </label>
                    <input
                      type="number"
                      value={originalPrice}
                      onChange={(e) => setOriginalPrice(e.target.value)}
                      placeholder="99.99"
                      style={inputStyle}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label
                      style={{
                        fontSize: '11px',
                        color: theme.textMuted,
                        marginBottom: '4px',
                        display: 'block',
                      }}
                    >
                      Sale Price
                    </label>
                    <input
                      type="number"
                      value={salePrice}
                      onChange={(e) => setSalePrice(e.target.value)}
                      placeholder="49.99"
                      style={inputStyle}
                    />
                  </div>
                </div>
                <button
                  onClick={handleAddPrice}
                  style={{
                    ...buttonStyle,
                    width: '100%',
                    justifyContent: 'center',
                    background: theme.accent,
                    color: '#fff',
                    border: 'none',
                  }}
                >
                  {StudioIcons.plus('#fff', 14)}
                  Add Price Display
                </button>
              </div>
            )}

            {/* Urgency Tab (Countdown + Stock) */}
            {activeTab === 'urgency' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Countdown Timer */}
                <div>
                  <label
                    style={{
                      fontSize: '12px',
                      color: theme.text,
                      fontWeight: '500',
                      marginBottom: '8px',
                      display: 'block',
                    }}
                  >
                    Countdown Timer
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="number"
                      value={countdownHours}
                      onChange={(e) => setCountdownHours(parseInt(e.target.value) || 24)}
                      min="1"
                      max="720"
                      style={{ ...inputStyle, width: '80px' }}
                    />
                    <span style={{ color: theme.textMuted, fontSize: '12px', alignSelf: 'center' }}>
                      hours
                    </span>
                    <button
                      onClick={handleAddCountdown}
                      style={{
                        ...buttonStyle,
                        flex: 1,
                        justifyContent: 'center',
                        background: '#ef4444',
                        color: '#fff',
                        border: 'none',
                      }}
                    >
                      {StudioIcons.clock('#fff', 14)}
                      Add Timer
                    </button>
                  </div>
                </div>

                {/* Stock Indicator */}
                <div>
                  <label
                    style={{
                      fontSize: '12px',
                      color: theme.text,
                      fontWeight: '500',
                      marginBottom: '8px',
                      display: 'block',
                    }}
                  >
                    Stock Indicator
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="number"
                      value={stockCount}
                      onChange={(e) => setStockCount(parseInt(e.target.value) || 5)}
                      min="1"
                      max="999"
                      style={{ ...inputStyle, width: '80px' }}
                    />
                    <span style={{ color: theme.textMuted, fontSize: '12px', alignSelf: 'center' }}>
                      left
                    </span>
                    <button
                      onClick={handleAddStockIndicator}
                      style={{
                        ...buttonStyle,
                        flex: 1,
                        justifyContent: 'center',
                        background: '#f59e0b',
                        color: '#fff',
                        border: 'none',
                      }}
                    >
                      {StudioIcons.alert('#fff', 14)}
                      Add Indicator
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* QR Code Tab */}
            {activeTab === 'qr' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label
                    style={{
                      fontSize: '11px',
                      color: theme.textMuted,
                      marginBottom: '4px',
                      display: 'block',
                    }}
                  >
                    QR Type
                  </label>
                  <select
                    value={qrPreset}
                    onChange={(e) => setQrPreset(e.target.value)}
                    style={{
                      ...inputStyle,
                      cursor: 'pointer',
                    }}
                  >
                    {QR_PRESETS.map((preset) => (
                      <option key={preset.id} value={preset.id}>
                        {preset.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      fontSize: '11px',
                      color: theme.textMuted,
                      marginBottom: '4px',
                      display: 'block',
                    }}
                  >
                    {qrPreset.includes('sms') ? 'Pre-filled Message' : 'URL / Data'}
                  </label>
                  <textarea
                    value={qrMessage}
                    onChange={(e) => setQrMessage(e.target.value)}
                    placeholder={
                      qrPreset.includes('sms')
                        ? 'Hi! I saw your promotion...'
                        : 'https://yourwebsite.com/product'
                    }
                    rows={2}
                    style={{
                      ...inputStyle,
                      resize: 'none',
                    }}
                  />
                </div>

                {userPhoneNumber && qrPreset.includes('sms') && (
                  <div
                    style={{
                      padding: '8px',
                      borderRadius: '6px',
                      background: theme.isDark
                        ? 'rgba(34, 197, 94, 0.1)'
                        : 'rgba(34, 197, 94, 0.05)',
                      fontSize: '11px',
                      color: '#22c55e',
                    }}
                  >
                    QR will open SMS to: {userPhoneNumber}
                  </div>
                )}

                <button
                  onClick={handleAddQRCode}
                  style={{
                    ...buttonStyle,
                    width: '100%',
                    justifyContent: 'center',
                    background: theme.accent,
                    color: '#fff',
                    border: 'none',
                  }}
                >
                  {StudioIcons.qrcode
                    ? StudioIcons.qrcode('#fff', 14)
                    : StudioIcons.plus('#fff', 14)}
                  Add QR Code
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
})

export default PromotionalElementsPanel
