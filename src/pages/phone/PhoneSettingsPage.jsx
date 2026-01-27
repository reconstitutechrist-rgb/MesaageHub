import { useState, useCallback, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/components/providers/AuthProvider'
import { useLocalStorage, useToggle } from '@/hooks'
import { toast } from 'sonner'
import { automationService } from '@/services/AutomationService'
import { themes } from '@/constants/phoneThemes'

// Default settings structure (shared with SettingsPage)
const DEFAULT_SETTINGS = {
  notifications: {
    push: true,
    email: true,
    sound: true,
    messagePreview: true,
  },
  privacy: {
    showOnlineStatus: true,
    showReadReceipts: true,
    showTypingIndicator: true,
  },
  appearance: {
    fontSize: 'medium',
    compactMode: false,
    colorTheme: 'cyanDark',
    layoutTheme: 'cyan',
  },
}

// SVG Icons
const Icons = {
  palette: (color) => (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="13.5" cy="6.5" r="0.5" fill={color} />
      <circle cx="17.5" cy="10.5" r="0.5" fill={color} />
      <circle cx="8.5" cy="7.5" r="0.5" fill={color} />
      <circle cx="6.5" cy="12.5" r="0.5" fill={color} />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 011.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2z" />
    </svg>
  ),
  bell: (color) => (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  ),
  shield: (color) => (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  user: (color) => (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  helpCircle: (color) => (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  info: (color) => (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
  logOut: (color) => (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  chevronRight: (color) => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
  check: (color) => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  moon: (color) => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  ),
  sun: (color) => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  ),
  database: (color) => (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
  ),
  trash: (color) => (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
    </svg>
  ),
  automation: (color) => (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  ),
  gift: (color) => (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 12 20 22 4 22 4 12" />
      <rect x="2" y="7" width="20" height="5" />
      <line x1="12" y1="22" x2="12" y2="7" />
      <path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z" />
      <path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" />
    </svg>
  ),
  plus: (color) => (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  calendar: (color) => (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  download: (color) => (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  creditCard: (color) => (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  ),
  cloud: (color) => (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z" />
    </svg>
  ),
}

// Toggle Switch Component
function Toggle({ enabled, onChange, theme: t }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      style={{
        width: '51px',
        height: '31px',
        borderRadius: '16px',
        background: enabled ? t.accent : t.isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)',
        border: 'none',
        cursor: 'pointer',
        position: 'relative',
        transition: 'background 0.2s ease',
        boxShadow: enabled ? `0 0 15px ${t.accentGlow}` : 'none',
      }}
    >
      <div
        style={{
          width: '27px',
          height: '27px',
          borderRadius: '50%',
          background: '#fff',
          position: 'absolute',
          top: '2px',
          left: enabled ? '22px' : '2px',
          transition: 'left 0.2s ease',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        }}
      />
    </button>
  )
}

// Settings Row Component
function SettingsRow({ icon, label, value, onClick, theme: t, showArrow = true, danger = false }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        padding: '14px 16px',
        background: 'none',
        border: 'none',
        borderBottom: `1px solid ${t.cardBorder}`,
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        cursor: onClick ? 'pointer' : 'default',
        textAlign: 'left',
      }}
    >
      <div
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          background: danger ? `${t.danger}22` : t.cardBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon(danger ? t.danger : t.accent)}
      </div>
      <span style={{ flex: 1, color: danger ? t.danger : t.text, fontSize: '16px' }}>{label}</span>
      {value && <span style={{ color: t.textMuted, fontSize: '14px' }}>{value}</span>}
      {showArrow && onClick && Icons.chevronRight(t.textMuted)}
    </button>
  )
}

// Settings Toggle Row Component
function SettingsToggleRow({ icon, label, description, enabled, onChange, theme: t }) {
  return (
    <div
      style={{
        padding: '14px 16px',
        borderBottom: `1px solid ${t.cardBorder}`,
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
      }}
    >
      <div
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          background: t.cardBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon(t.accent)}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ color: t.text, fontSize: '16px' }}>{label}</div>
        {description && (
          <div style={{ color: t.textMuted, fontSize: '12px', marginTop: '2px' }}>
            {description}
          </div>
        )}
      </div>
      <Toggle enabled={enabled} onChange={onChange} theme={t} />
    </div>
  )
}

// Theme Selection Modal
function ThemeSelectionModal({ open, onClose, currentTheme, onSelect, theme: t }) {
  if (!open) return null

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: t.bg,
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '60px 16px 16px',
          borderBottom: `1px solid ${t.cardBorder}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: t.accent,
            cursor: 'pointer',
            fontSize: '16px',
          }}
        >
          Cancel
        </button>
        <h2 style={{ color: t.text, fontSize: '17px', fontWeight: '600', margin: 0 }}>
          Choose Layout
        </h2>
        <div style={{ width: '60px' }} />
      </div>

      {/* Theme Grid */}
      <div style={{ flex: 1, padding: '24px 20px', overflowY: 'auto' }}>
        <p
          style={{
            color: t.textMuted,
            fontSize: '14px',
            marginBottom: '20px',
            textAlign: 'center',
          }}
        >
          Select your preferred theme. This will change the appearance across all screens.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {Object.entries(themes).map(([key, value]) => (
            <button
              key={key}
              onClick={() => {
                onSelect(key)
                onClose()
              }}
              style={{
                padding: '0',
                borderRadius: '20px',
                border:
                  currentTheme === key ? `3px solid ${value.accent}` : `2px solid ${t.cardBorder}`,
                background: 'none',
                cursor: 'pointer',
                overflow: 'hidden',
                boxShadow: currentTheme === key ? `0 0 25px ${value.accentGlow}` : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              {/* Mini Phone Preview */}
              <div
                style={{
                  height: '140px',
                  background: value.bg,
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '12px',
                }}
              >
                {/* Mini Status Bar */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '8px',
                    color: value.text,
                    marginBottom: '8px',
                  }}
                >
                  <span>9:41</span>
                  <div
                    style={{
                      width: '40px',
                      height: '12px',
                      background: '#000',
                      borderRadius: '6px',
                    }}
                  />
                  <span>100%</span>
                </div>

                {/* Mini Content Preview */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div
                    style={{
                      height: '10px',
                      width: '60%',
                      background: value.text,
                      borderRadius: '3px',
                      opacity: 0.8,
                    }}
                  />
                  <div
                    style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', flex: 1 }}
                  >
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        style={{
                          background: value.cardBg,
                          borderRadius: '6px',
                          border: `1px solid ${value.cardBorder}`,
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Mini Nav Bar */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-around',
                    paddingTop: '8px',
                    borderTop: `1px solid ${value.cardBorder}`,
                  }}
                >
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: i === 1 ? value.accent : value.textMuted,
                      }}
                    />
                  ))}
                </div>

                {/* Selected Check */}
                {currentTheme === key && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: value.accent,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: `0 2px 8px ${value.accentGlow}`,
                    }}
                  >
                    {Icons.check('#fff')}
                  </div>
                )}
              </div>

              {/* Theme Info */}
              <div
                style={{
                  padding: '12px',
                  background: value.isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.8)',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    marginBottom: '4px',
                  }}
                >
                  {value.isDark ? Icons.moon(value.accent) : Icons.sun(value.accent)}
                  <span style={{ color: value.text, fontSize: '14px', fontWeight: '600' }}>
                    {value.name}
                  </span>
                </div>
                <span style={{ color: value.textMuted, fontSize: '11px' }}>
                  {value.description}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// Confirm Dialog
function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  theme: t,
  isLoading = false,
}) {
  if (!open) return null

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        style={{
          background: t.isDark ? t.screenBg : '#fff',
          borderRadius: '20px',
          padding: '24px',
          width: '100%',
          maxWidth: '300px',
          textAlign: 'center',
          border: `1px solid ${t.cardBorder}`,
        }}
      >
        <div style={{ marginBottom: '16px' }}>
          {isLoading ? (
            <div
              style={{
                width: '48px',
                height: '48px',
                border: `3px solid ${t.cardBorder}`,
                borderTopColor: t.danger,
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto',
              }}
            />
          ) : (
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke={t.danger}
              strokeWidth="1.5"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          )}
        </div>
        <h3 style={{ color: t.text, fontSize: '18px', fontWeight: '600', margin: '0 0 8px' }}>
          {title}
        </h3>
        <p style={{ color: t.textMuted, fontSize: '14px', margin: '0 0 24px', lineHeight: '1.5' }}>
          {message}
        </p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={onClose}
            disabled={isLoading}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '12px',
              border: `1px solid ${t.cardBorder}`,
              background: t.cardBg,
              color: t.text,
              fontSize: '15px',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.5 : 1,
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '12px',
              border: 'none',
              background: t.danger,
              color: '#fff',
              fontSize: '15px',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

// CSS keyframes for spinner (injected once)
if (typeof document !== 'undefined' && !document.getElementById('phone-settings-spinner-style')) {
  const style = document.createElement('style')
  style.id = 'phone-settings-spinner-style'
  style.textContent = '@keyframes spin { to { transform: rotate(360deg); } }'
  document.head.appendChild(style)
}

// Automations Modal Component
function AutomationsModal({ open, onClose, theme: t }) {
  const [rules, setRules] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingRule, setEditingRule] = useState(null)

  // Form state
  const [ruleName, setRuleName] = useState('')
  const [messageBody, setMessageBody] = useState('')
  const [sendTime, setSendTime] = useState('09:00')

  useEffect(() => {
    if (open) {
      loadRules()
    }
  }, [open])

  const loadRules = async () => {
    try {
      const data = await automationService.getAutomationRules()
      setRules(data)
    } catch (err) {
      console.error('Failed to load automation rules:', err)
    }
  }

  const handleToggleRule = async (ruleId, isActive) => {
    try {
      await automationService.toggleAutomationRule(ruleId, isActive)
      setRules((prev) => prev.map((r) => (r.id === ruleId ? { ...r, is_active: isActive } : r)))
      toast.success(isActive ? 'Automation enabled' : 'Automation disabled')
    } catch {
      toast.error('Failed to update automation')
    }
  }

  const handleDeleteRule = async (ruleId) => {
    try {
      await automationService.deleteAutomationRule(ruleId)
      setRules((prev) => prev.filter((r) => r.id !== ruleId))
      toast.success('Automation deleted')
    } catch {
      toast.error('Failed to delete automation')
    }
  }

  const handleSaveRule = async () => {
    if (!ruleName.trim() || !messageBody.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      const rule = {
        id: editingRule?.id,
        name: ruleName.trim(),
        message_body: messageBody.trim(),
        send_time: sendTime,
        trigger_type: 'birthday_month',
        is_active: editingRule?.is_active ?? true,
      }

      await automationService.saveAutomationRule(rule)
      await loadRules()

      setShowAddModal(false)
      setEditingRule(null)
      setRuleName('')
      setMessageBody('')
      setSendTime('09:00')

      toast.success(editingRule ? 'Automation updated' : 'Automation created')
    } catch {
      toast.error('Failed to save automation')
    }
  }

  const openEditModal = (rule) => {
    setEditingRule(rule)
    setRuleName(rule.name)
    setMessageBody(rule.message_body)
    setSendTime(rule.send_time || '09:00')
    setShowAddModal(true)
  }

  const openNewModal = () => {
    setEditingRule(null)
    setRuleName('')
    setMessageBody(
      'Happy Birthday, {name}! Stop by the store this month for a special birthday gift on us.'
    )
    setSendTime('09:00')
    setShowAddModal(true)
  }

  if (!open) return null

  // Add/Edit Modal
  if (showAddModal) {
    return (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: t.bg,
          zIndex: 60,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '60px 16px 16px',
            borderBottom: `1px solid ${t.cardBorder}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <button
            onClick={() => {
              setShowAddModal(false)
              setEditingRule(null)
            }}
            style={{
              background: 'none',
              border: 'none',
              color: t.accent,
              cursor: 'pointer',
              fontSize: '16px',
            }}
          >
            Cancel
          </button>
          <h2 style={{ color: t.text, fontSize: '17px', fontWeight: '600', margin: 0 }}>
            {editingRule ? 'Edit Automation' : 'New Automation'}
          </h2>
          <button
            onClick={handleSaveRule}
            style={{
              background: 'none',
              border: 'none',
              color: t.accent,
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
            }}
          >
            Save
          </button>
        </div>

        {/* Form */}
        <div style={{ flex: 1, padding: '24px 20px', overflowY: 'auto' }}>
          {/* Info Banner */}
          <div
            style={{
              background: t.cardBg,
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '24px',
              border: `1px solid ${t.cardBorder}`,
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start',
            }}
          >
            {Icons.gift(t.accent)}
            <div>
              <div
                style={{ color: t.text, fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}
              >
                Birthday Month Automation
              </div>
              <div style={{ color: t.textMuted, fontSize: '12px', lineHeight: '1.4' }}>
                Messages will be sent to contacts during their birthday month. Use {'{name}'} to
                personalize.
              </div>
            </div>
          </div>

          {/* Rule Name */}
          <div style={{ marginBottom: '20px' }}>
            <label
              style={{
                display: 'block',
                color: t.textMuted,
                fontSize: '13px',
                marginBottom: '8px',
                fontWeight: '500',
              }}
            >
              Automation Name *
            </label>
            <input
              type="text"
              value={ruleName}
              onChange={(e) => setRuleName(e.target.value)}
              placeholder="Birthday Voucher"
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: '12px',
                border: `1px solid ${t.cardBorder}`,
                background: t.searchBg,
                color: t.text,
                fontSize: '16px',
                outline: 'none',
              }}
            />
          </div>

          {/* Message Body */}
          <div style={{ marginBottom: '20px' }}>
            <label
              style={{
                display: 'block',
                color: t.textMuted,
                fontSize: '13px',
                marginBottom: '8px',
                fontWeight: '500',
              }}
            >
              Message *
            </label>
            <textarea
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
              placeholder="Happy Birthday, {name}! Stop by the store this month..."
              rows={4}
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: '12px',
                border: `1px solid ${t.cardBorder}`,
                background: t.searchBg,
                color: t.text,
                fontSize: '16px',
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'inherit',
              }}
            />
            <span
              style={{ color: t.textMuted, fontSize: '11px', marginTop: '4px', display: 'block' }}
            >
              Variables: {'{name}'}, {'{firstName}'}
            </span>
          </div>

          {/* Send Time */}
          <div style={{ marginBottom: '20px' }}>
            <label
              style={{
                display: 'block',
                color: t.textMuted,
                fontSize: '13px',
                marginBottom: '8px',
                fontWeight: '500',
              }}
            >
              Send Time
            </label>
            <input
              type="time"
              value={sendTime}
              onChange={(e) => setSendTime(e.target.value)}
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: '12px',
                border: `1px solid ${t.cardBorder}`,
                background: t.searchBg,
                color: t.text,
                fontSize: '16px',
                outline: 'none',
              }}
            />
            <span
              style={{ color: t.textMuted, fontSize: '11px', marginTop: '4px', display: 'block' }}
            >
              Messages will be queued to send at this time
            </span>
          </div>
        </div>
      </div>
    )
  }

  // Main Automations List
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: t.bg,
        zIndex: 55,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '60px 16px 16px',
          borderBottom: `1px solid ${t.cardBorder}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: t.accent,
            cursor: 'pointer',
            fontSize: '16px',
          }}
        >
          Back
        </button>
        <h2 style={{ color: t.text, fontSize: '17px', fontWeight: '600', margin: 0 }}>
          Automations
        </h2>
        <button
          onClick={openNewModal}
          style={{
            background: 'none',
            border: 'none',
            color: t.accent,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {Icons.plus(t.accent)}
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
        {rules.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ marginBottom: '16px' }}>{Icons.gift(t.textMuted)}</div>
            <p style={{ color: t.text, fontSize: '17px', fontWeight: '600', margin: '0 0 8px' }}>
              No Automations Yet
            </p>
            <p
              style={{
                color: t.textMuted,
                fontSize: '14px',
                margin: '0 0 24px',
                lineHeight: '1.5',
              }}
            >
              Create a birthday automation to automatically send messages to contacts during their
              birthday month.
            </p>
            <button
              onClick={openNewModal}
              style={{
                padding: '14px 28px',
                borderRadius: '12px',
                border: 'none',
                background: t.accent,
                color: '#fff',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: `0 4px 15px ${t.accentGlow}`,
              }}
            >
              Create Automation
            </button>
          </div>
        ) : (
          <div>
            {rules.map((rule) => (
              <div
                key={rule.id}
                style={{
                  background: t.cardBg,
                  borderRadius: '16px',
                  border: `1px solid ${t.cardBorder}`,
                  marginBottom: '12px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                  }}
                >
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      background: rule.is_active ? `${t.accent}22` : t.cardBg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {Icons.gift(rule.is_active ? t.accent : t.textMuted)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        color: t.text,
                        fontSize: '16px',
                        fontWeight: '600',
                        marginBottom: '4px',
                      }}
                    >
                      {rule.name}
                    </div>
                    <div style={{ color: t.textMuted, fontSize: '13px' }}>
                      Birthday Month • {rule.send_time || '09:00'}
                    </div>
                  </div>
                  <Toggle
                    enabled={rule.is_active}
                    onChange={(val) => handleToggleRule(rule.id, val)}
                    theme={t}
                  />
                </div>
                <div
                  style={{
                    padding: '12px 16px',
                    borderTop: `1px solid ${t.cardBorder}`,
                    background: t.isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)',
                  }}
                >
                  <p
                    style={{
                      color: t.textMuted,
                      fontSize: '13px',
                      margin: 0,
                      lineHeight: '1.4',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {rule.message_body}
                  </p>
                </div>
                <div
                  style={{
                    padding: '8px 16px',
                    borderTop: `1px solid ${t.cardBorder}`,
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '8px',
                  }}
                >
                  <button
                    onClick={() => openEditModal(rule)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: `1px solid ${t.cardBorder}`,
                      background: 'transparent',
                      color: t.accent,
                      fontSize: '13px',
                      fontWeight: '500',
                      cursor: 'pointer',
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteRule(rule.id)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: 'none',
                      background: `${t.danger}22`,
                      color: t.danger,
                      fontSize: '13px',
                      fontWeight: '500',
                      cursor: 'pointer',
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Subscription Modal Component
function SubscriptionModal({ open, onClose, theme: t }) {
  if (!open) return null

  // Mock subscription data
  const currentTier = 'free'
  const usage = {
    aiGenerations: { used: 45, limit: 50 },
    videoRenders: { used: 2, limit: 5 },
    contacts: { used: 100, limit: 500 },
  }

  const tiers = {
    free: { name: 'Free', price: '$0/mo', color: t.textMuted },
    pro: { name: 'Pro', price: '$19/mo', color: t.accent },
    enterprise: { name: 'Enterprise', price: '$99/mo', color: '#f59e0b' },
  }

  const usagePercent = (used, limit) => Math.min(Math.round((used / limit) * 100), 100)

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: t.bg,
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '60px 16px 16px',
          borderBottom: `1px solid ${t.cardBorder}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: t.accent,
            cursor: 'pointer',
            fontSize: '16px',
          }}
        >
          Close
        </button>
        <h2 style={{ color: t.text, fontSize: '17px', fontWeight: '600', margin: 0 }}>
          Subscription
        </h2>
        <div style={{ width: '50px' }} />
      </div>

      <div style={{ flex: 1, padding: '24px 20px', overflowY: 'auto' }}>
        {/* Current Plan */}
        <div
          style={{
            padding: '20px',
            borderRadius: '16px',
            background: t.cardBg,
            border: `1px solid ${t.cardBorder}`,
            marginBottom: '24px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              display: 'inline-block',
              padding: '6px 16px',
              borderRadius: '20px',
              background: `${tiers[currentTier].color}22`,
              color: tiers[currentTier].color,
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '8px',
            }}
          >
            {tiers[currentTier].name}
          </div>
          <p style={{ color: t.text, fontSize: '24px', fontWeight: '700', margin: '8px 0' }}>
            {tiers[currentTier].price}
          </p>
          <p style={{ color: t.textMuted, fontSize: '13px', margin: 0 }}>
            Current billing period ends Feb 28, 2026
          </p>
        </div>

        {/* Usage Section */}
        <h3 style={{ color: t.text, fontSize: '16px', fontWeight: '600', margin: '0 0 16px' }}>
          Usage This Month
        </h3>

        {Object.entries(usage).map(([key, { used, limit }]) => {
          const percent = usagePercent(used, limit)
          const isWarning = percent >= 80
          return (
            <div
              key={key}
              style={{
                padding: '16px',
                borderRadius: '12px',
                background: t.cardBg,
                border: `1px solid ${t.cardBorder}`,
                marginBottom: '12px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                }}
              >
                <span style={{ color: t.text, fontSize: '14px', fontWeight: '500' }}>
                  {key === 'aiGenerations'
                    ? 'AI Generations'
                    : key === 'videoRenders'
                      ? 'Video Renders'
                      : 'Contacts'}
                </span>
                <span
                  style={{
                    color: isWarning ? '#f59e0b' : t.textMuted,
                    fontSize: '14px',
                    fontWeight: '500',
                  }}
                >
                  {used} / {limit}
                </span>
              </div>
              <div
                style={{
                  height: '8px',
                  borderRadius: '4px',
                  background: `${t.accent}22`,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${percent}%`,
                    borderRadius: '4px',
                    background: isWarning ? 'linear-gradient(90deg, #f59e0b, #ef4444)' : t.accent,
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            </div>
          )
        })}

        {/* Upgrade Button */}
        <button
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: '12px',
            border: 'none',
            background: `linear-gradient(135deg, ${t.accent}, ${t.accent}dd)`,
            color: '#fff',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            marginTop: '16px',
          }}
        >
          Upgrade to Pro
        </button>
      </div>
    </div>
  )
}

// Sync Status Modal Component
function SyncModal({ open, onClose, theme: t }) {
  if (!open) return null

  const syncStatus = {
    lastSync: new Date(Date.now() - 120000).toISOString(), // 2 min ago
    pendingChanges: 0,
    isOnline: true,
  }

  const formatLastSync = (isoString) => {
    const diff = Date.now() - new Date(isoString).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins} min ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
    return new Date(isoString).toLocaleDateString()
  }

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: t.bg,
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '60px 16px 16px',
          borderBottom: `1px solid ${t.cardBorder}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: t.accent,
            cursor: 'pointer',
            fontSize: '16px',
          }}
        >
          Close
        </button>
        <h2 style={{ color: t.text, fontSize: '17px', fontWeight: '600', margin: 0 }}>
          Sync Status
        </h2>
        <div style={{ width: '50px' }} />
      </div>

      <div style={{ flex: 1, padding: '24px 20px', overflowY: 'auto' }}>
        {/* Status Card */}
        <div
          style={{
            padding: '24px',
            borderRadius: '16px',
            background: t.cardBg,
            border: `1px solid ${t.cardBorder}`,
            marginBottom: '24px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: `${t.success}22`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke={t.success}
              strokeWidth="2"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <p style={{ color: t.text, fontSize: '18px', fontWeight: '600', margin: '0 0 8px' }}>
            All Synced
          </p>
          <p style={{ color: t.textMuted, fontSize: '14px', margin: 0 }}>
            Last synced: {formatLastSync(syncStatus.lastSync)}
          </p>
        </div>

        {/* Status Details */}
        <div
          style={{
            padding: '16px',
            borderRadius: '12px',
            background: t.cardBg,
            border: `1px solid ${t.cardBorder}`,
            marginBottom: '12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ color: t.text, fontSize: '14px' }}>Connection</span>
          <span
            style={{
              color: syncStatus.isOnline ? t.success : t.danger,
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            {syncStatus.isOnline ? 'Online' : 'Offline'}
          </span>
        </div>

        <div
          style={{
            padding: '16px',
            borderRadius: '12px',
            background: t.cardBg,
            border: `1px solid ${t.cardBorder}`,
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ color: t.text, fontSize: '14px' }}>Pending Changes</span>
          <span style={{ color: t.textMuted, fontSize: '14px', fontWeight: '500' }}>
            {syncStatus.pendingChanges}
          </span>
        </div>

        {/* Sync Now Button */}
        <button
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: '12px',
            border: `1px solid ${t.cardBorder}`,
            background: t.cardBg,
            color: t.text,
            fontSize: '16px',
            fontWeight: '500',
            cursor: 'pointer',
          }}
        >
          Sync Now
        </button>
      </div>
    </div>
  )
}

export default function PhoneSettingsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()

  const [theme, setTheme] = useState('cyanDark')
  const [showThemeModal, , { setTrue: openThemeModal, setFalse: closeThemeModal }] =
    useToggle(false)
  const [showLogoutConfirm, , { setTrue: openLogoutConfirm, setFalse: closeLogoutConfirm }] =
    useToggle(false)
  const [showDeleteConfirm, , { setTrue: openDeleteConfirm, setFalse: closeDeleteConfirm }] =
    useToggle(false)
  const [
    showAutomationsModal,
    ,
    { setTrue: openAutomationsModal, setFalse: closeAutomationsModal },
  ] = useToggle(false)
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)
  const [showSyncModal, setShowSyncModal] = useState(false)

  // Loading states
  const [isExporting, , { setTrue: startExporting, setFalse: stopExporting }] = useToggle(false)
  const [isDeleting, , { setTrue: startDeleting, setFalse: stopDeleting }] = useToggle(false)

  // Settings state with persistence (shared with SettingsPage)
  const [settings, setSettings] = useLocalStorage('app-settings', DEFAULT_SETTINGS)

  // Load theme from persisted settings on mount
  useEffect(() => {
    const savedTheme = settings?.appearance?.colorTheme
    if (savedTheme && themes[savedTheme]) {
      setTheme(savedTheme)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Helper to update nested settings
  const updateSetting = useCallback(
    (category, key, value) => {
      setSettings((prev) => {
        const updated = {
          ...prev,
          [category]: {
            ...prev[category],
            [key]: value,
          },
        }
        return updated
      })
      toast.success('Setting saved')
    },
    [setSettings]
  )

  // Handle theme change with persistence and event dispatch
  const handleThemeChange = useCallback(
    (themeKey) => {
      // Update local state
      setTheme(themeKey)

      // Determine layout theme for PhoneLayout (cyan or purple)
      const layoutTheme = themeKey.includes('purple') ? 'purple' : 'cyan'

      // Update persisted settings
      setSettings((prev) => ({
        ...prev,
        appearance: {
          ...prev.appearance,
          colorTheme: themeKey,
          layoutTheme: layoutTheme,
        },
      }))

      // Dispatch event for PhoneLayout to react
      window.dispatchEvent(new CustomEvent('layout-theme-changed'))

      toast.success('Theme updated')
    },
    [setSettings]
  )

  const t = themes[theme]

  // Navigation items with routes
  const navItems = [
    {
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
      label: 'Home',
      path: '/dashboard',
    },
    {
      icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
      label: 'Chats',
      path: '/conversations',
    },
    {
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
      label: 'Contacts',
      path: '/contacts',
    },
    {
      icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
      label: 'Settings',
      path: '/settings',
    },
  ]

  const handleLogout = useCallback(async () => {
    await logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }, [logout, navigate])

  const handleExportData = useCallback(async () => {
    startExporting()

    // Simulate gathering data
    await new Promise((r) => setTimeout(r, 1500))

    const exportData = {
      profile: JSON.parse(localStorage.getItem('user-profile') || '{}'),
      settings: settings,
      theme,
      exportedAt: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `messagehub-data-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    stopExporting()
    toast.success('Data exported successfully')
  }, [settings, theme, startExporting, stopExporting])

  const handleDeleteAccount = useCallback(async () => {
    startDeleting()

    // Simulate API call
    await new Promise((r) => setTimeout(r, 2000))

    // Clear all local data
    localStorage.clear()

    stopDeleting()
    closeDeleteConfirm()

    toast.success('Account deleted')
    logout()
    navigate('/login')
  }, [logout, navigate, startDeleting, stopDeleting, closeDeleteConfirm])

  return (
    <div
      style={{
        minHeight: '100vh',
        height: '100vh',
        background: t.bg,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Theme Selection Modal */}
      <ThemeSelectionModal
        open={showThemeModal}
        onClose={closeThemeModal}
        currentTheme={theme}
        onSelect={handleThemeChange}
        theme={t}
      />

      {/* Automations Modal */}
      <AutomationsModal open={showAutomationsModal} onClose={closeAutomationsModal} theme={t} />
      <SubscriptionModal
        open={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        theme={t}
      />
      <SyncModal open={showSyncModal} onClose={() => setShowSyncModal(false)} theme={t} />

      {/* Confirm Dialogs */}
      <ConfirmDialog
        open={showLogoutConfirm}
        onClose={closeLogoutConfirm}
        onConfirm={() => {
          closeLogoutConfirm()
          handleLogout()
        }}
        title="Log Out"
        message={`Are you sure you want to log out${user?.email ? ` from ${user.email}` : ''}? You'll need to sign in again to access your account.`}
        confirmText="Log Out"
        theme={t}
      />
      <ConfirmDialog
        open={showDeleteConfirm}
        onClose={closeDeleteConfirm}
        onConfirm={handleDeleteAccount}
        title="Delete Account"
        message="This action is permanent and cannot be undone. All your data, messages, and contacts will be permanently removed."
        confirmText={isDeleting ? 'Deleting...' : 'Delete'}
        theme={t}
        isLoading={isDeleting}
      />

      {/* Main Content */}
      {!showThemeModal && (
        <>
          {/* Header */}
          <div style={{ padding: '8px 20px 16px', paddingTop: 'env(safe-area-inset-top, 16px)' }}>
            <h1
              style={{
                color: t.text,
                fontSize: '32px',
                fontWeight: '700',
                margin: 0,
                letterSpacing: '-0.5px',
              }}
            >
              Settings
            </h1>
          </div>

          {/* Settings Sections */}
          <div style={{ height: 'calc(100% - 185px)', overflowY: 'auto', padding: '0 20px' }}>
            {/* Appearance Section */}
            <div
              style={{
                marginBottom: '24px',
                background: t.cardBg,
                borderRadius: '16px',
                border: `1px solid ${t.cardBorder}`,
                overflow: 'hidden',
              }}
            >
              <div style={{ padding: '12px 16px 8px', borderBottom: `1px solid ${t.cardBorder}` }}>
                <span
                  style={{
                    color: t.textMuted,
                    fontSize: '13px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  Appearance
                </span>
              </div>
              <SettingsRow
                icon={Icons.palette}
                label="App Layout"
                value={themes[theme].name}
                onClick={openThemeModal}
                theme={t}
              />
            </div>

            {/* Notifications Section */}
            <div
              style={{
                marginBottom: '24px',
                background: t.cardBg,
                borderRadius: '16px',
                border: `1px solid ${t.cardBorder}`,
                overflow: 'hidden',
              }}
            >
              <div style={{ padding: '12px 16px 8px', borderBottom: `1px solid ${t.cardBorder}` }}>
                <span
                  style={{
                    color: t.textMuted,
                    fontSize: '13px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  Notifications
                </span>
              </div>
              <SettingsToggleRow
                icon={Icons.bell}
                label="Push Notifications"
                description="Receive message alerts"
                enabled={settings.notifications.push}
                onChange={(val) => updateSetting('notifications', 'push', val)}
                theme={t}
              />
              <SettingsToggleRow
                icon={(c) => (
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={c}
                    strokeWidth="2"
                  >
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <path d="M15.54 8.46a5 5 0 010 7.07" />
                    <path d="M19.07 4.93a10 10 0 010 14.14" />
                  </svg>
                )}
                label="Sound"
                enabled={settings.notifications.sound}
                onChange={(val) => updateSetting('notifications', 'sound', val)}
                theme={t}
              />
              <SettingsToggleRow
                icon={(c) => (
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={c}
                    strokeWidth="2"
                  >
                    <path d="M5.5 12H2v4h3.5" />
                    <path d="M8 10v8" />
                    <path d="M12 8v12" />
                    <path d="M16 10v8" />
                    <path d="M18.5 12H22v4h-3.5" />
                  </svg>
                )}
                label="Message Preview"
                enabled={settings.notifications.messagePreview}
                onChange={(val) => updateSetting('notifications', 'messagePreview', val)}
                theme={t}
              />
            </div>

            {/* Privacy Section */}
            <div
              style={{
                marginBottom: '24px',
                background: t.cardBg,
                borderRadius: '16px',
                border: `1px solid ${t.cardBorder}`,
                overflow: 'hidden',
              }}
            >
              <div style={{ padding: '12px 16px 8px', borderBottom: `1px solid ${t.cardBorder}` }}>
                <span
                  style={{
                    color: t.textMuted,
                    fontSize: '13px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  Privacy
                </span>
              </div>
              <SettingsToggleRow
                icon={(c) => (
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={c}
                    strokeWidth="2"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
                label="Read Receipts"
                description="Let others know you've read their messages"
                enabled={settings.privacy.showReadReceipts}
                onChange={(val) => updateSetting('privacy', 'showReadReceipts', val)}
                theme={t}
              />
              <SettingsRow
                icon={Icons.shield}
                label="Blocked Contacts"
                onClick={() => {}}
                theme={t}
              />
            </div>

            {/* Account Section */}
            <div
              style={{
                marginBottom: '24px',
                background: t.cardBg,
                borderRadius: '16px',
                border: `1px solid ${t.cardBorder}`,
                overflow: 'hidden',
              }}
            >
              <div style={{ padding: '12px 16px 8px', borderBottom: `1px solid ${t.cardBorder}` }}>
                <span
                  style={{
                    color: t.textMuted,
                    fontSize: '13px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  Account
                </span>
              </div>
              <SettingsRow icon={Icons.user} label="Edit Profile" onClick={() => {}} theme={t} />
              <SettingsRow
                icon={Icons.creditCard}
                label="Subscription Plan"
                value="Free"
                onClick={() => setShowSubscriptionModal(true)}
                theme={t}
              />
              <SettingsRow
                icon={Icons.cloud}
                label="Sync Status"
                value="Synced"
                onClick={() => setShowSyncModal(true)}
                theme={t}
              />
              <SettingsRow
                icon={Icons.automation}
                label="Automations"
                onClick={openAutomationsModal}
                theme={t}
              />
              <SettingsRow
                icon={Icons.database}
                label="Storage & Data"
                onClick={() => {}}
                theme={t}
              />
              <SettingsRow
                icon={Icons.download}
                label={isExporting ? 'Exporting...' : 'Export Data'}
                onClick={isExporting ? undefined : handleExportData}
                theme={t}
              />
            </div>

            {/* Support Section */}
            <div
              style={{
                marginBottom: '24px',
                background: t.cardBg,
                borderRadius: '16px',
                border: `1px solid ${t.cardBorder}`,
                overflow: 'hidden',
              }}
            >
              <div style={{ padding: '12px 16px 8px', borderBottom: `1px solid ${t.cardBorder}` }}>
                <span
                  style={{
                    color: t.textMuted,
                    fontSize: '13px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  Support
                </span>
              </div>
              <SettingsRow
                icon={Icons.helpCircle}
                label="Help Center"
                onClick={() => {}}
                theme={t}
              />
              <SettingsRow
                icon={Icons.info}
                label="About MessageHub"
                value="v1.0.0"
                onClick={() => {}}
                theme={t}
              />
            </div>

            {/* Danger Zone */}
            <div
              style={{
                marginBottom: '24px',
                background: t.cardBg,
                borderRadius: '16px',
                border: `1px solid ${t.danger}44`,
                overflow: 'hidden',
              }}
            >
              <div style={{ padding: '12px 16px 8px', borderBottom: `1px solid ${t.cardBorder}` }}>
                <span
                  style={{
                    color: t.danger,
                    fontSize: '13px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  Danger Zone
                </span>
              </div>
              <SettingsRow
                icon={Icons.logOut}
                label="Log Out"
                onClick={openLogoutConfirm}
                theme={t}
                showArrow={false}
                danger
              />
              <SettingsRow
                icon={Icons.trash}
                label="Delete Account"
                onClick={openDeleteConfirm}
                theme={t}
                showArrow={false}
                danger
              />
            </div>
          </div>

          {/* Bottom Navigation */}
          <div
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              background: t.navBg,
              backdropFilter: 'blur(20px)',
              borderTop: `1px solid ${t.cardBorder}`,
              display: 'flex',
              justifyContent: 'space-around',
              alignItems: 'flex-start',
              paddingTop: '12px',
              paddingBottom: 'env(safe-area-inset-bottom, 20px)',
            }}
          >
            {navItems.map((item, i) => {
              const isActive = location.pathname === item.path
              return (
                <button
                  key={i}
                  onClick={() => navigate(item.path)}
                  style={{
                    background: 'none',
                    border: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                    opacity: isActive ? 1 : 0.5,
                  }}
                >
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={isActive ? t.accent : t.text}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d={item.icon} />
                    </svg>
                  </div>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: isActive ? '600' : '400',
                      color: isActive ? t.accent : t.textMuted,
                    }}
                  >
                    {item.label}
                  </span>
                  {isActive && (
                    <div
                      style={{
                        width: '4px',
                        height: '4px',
                        borderRadius: '50%',
                        background: t.accent,
                        boxShadow: `0 0 8px ${t.accent}`,
                      }}
                    />
                  )}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
