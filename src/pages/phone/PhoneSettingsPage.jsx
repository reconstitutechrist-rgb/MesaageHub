import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/components/providers/AuthProvider'

// 4 Theme Options
const themes = {
  cyanDark: {
    name: 'Cyan Glow',
    description: 'Dark theme with cyan accents',
    bg: 'linear-gradient(145deg, #0a1628 0%, #0d1f35 50%, #0a1628 100%)',
    cardBg: 'rgba(6, 182, 212, 0.08)',
    cardBorder: 'rgba(6, 182, 212, 0.2)',
    accent: '#06b6d4',
    accentGlow: 'rgba(6, 182, 212, 0.4)',
    text: '#e2e8f0',
    textMuted: '#94a3b8',
    searchBg: 'rgba(6, 182, 212, 0.1)',
    navBg: 'rgba(6, 182, 212, 0.05)',
    isDark: true,
    screenBg: '#0a1628',
    danger: '#ef4444',
    success: '#22c55e',
    preview: { bg: '#0a1628', accent: '#06b6d4' },
  },
  purpleDark: {
    name: 'Purple Glow',
    description: 'Dark theme with purple accents',
    bg: 'linear-gradient(145deg, #1a0a28 0%, #2d1045 50%, #1a0a28 100%)',
    cardBg: 'rgba(168, 85, 247, 0.08)',
    cardBorder: 'rgba(168, 85, 247, 0.2)',
    accent: '#a855f7',
    accentGlow: 'rgba(168, 85, 247, 0.4)',
    text: '#f3e8ff',
    textMuted: '#c4b5fd',
    searchBg: 'rgba(168, 85, 247, 0.1)',
    navBg: 'rgba(168, 85, 247, 0.05)',
    isDark: true,
    screenBg: '#1a0a28',
    danger: '#ef4444',
    success: '#22c55e',
    preview: { bg: '#1a0a28', accent: '#a855f7' },
  },
  cyanLight: {
    name: 'Soft Cyan',
    description: 'Light theme with cyan accents',
    bg: 'linear-gradient(145deg, #ffffff 0%, #f0fdfa 50%, #ffffff 100%)',
    cardBg: 'rgba(6, 182, 212, 0.06)',
    cardBorder: 'rgba(6, 182, 212, 0.15)',
    accent: '#0891b2',
    accentGlow: 'rgba(6, 182, 212, 0.25)',
    text: '#164e63',
    textMuted: '#64748b',
    searchBg: 'rgba(6, 182, 212, 0.08)',
    navBg: 'rgba(255, 255, 255, 0.9)',
    isDark: false,
    screenBg: '#f0fdfa',
    danger: '#dc2626',
    success: '#16a34a',
    preview: { bg: '#f0fdfa', accent: '#0891b2' },
  },
  purpleLight: {
    name: 'Soft Purple',
    description: 'Light theme with purple accents',
    bg: 'linear-gradient(145deg, #ffffff 0%, #faf5ff 50%, #ffffff 100%)',
    cardBg: 'rgba(168, 85, 247, 0.06)',
    cardBorder: 'rgba(168, 85, 247, 0.15)',
    accent: '#9333ea',
    accentGlow: 'rgba(168, 85, 247, 0.25)',
    text: '#581c87',
    textMuted: '#64748b',
    searchBg: 'rgba(168, 85, 247, 0.08)',
    navBg: 'rgba(255, 255, 255, 0.9)',
    isDark: false,
    screenBg: '#faf5ff',
    danger: '#dc2626',
    success: '#16a34a',
    preview: { bg: '#faf5ff', accent: '#9333ea' },
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
function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmText, theme: t }) {
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
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '12px',
              border: `1px solid ${t.cardBorder}`,
              background: t.cardBg,
              color: t.text,
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '12px',
              border: 'none',
              background: t.danger,
              color: '#fff',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function PhoneSettingsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()

  const [theme, setTheme] = useState('cyanDark')
  const [showThemeModal, setShowThemeModal] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Settings state
  const [notifications, setNotifications] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [vibration, setVibration] = useState(true)
  const [readReceipts, setReadReceipts] = useState(true)

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

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const handleExportData = () => {
    const exportData = {
      theme,
      settings: { notifications, soundEnabled, vibration, readReceipts },
      exportedAt: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `messagehub-settings-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: t.isDark ? '#1a1a2e' : '#f1f5f9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Theme Switcher (External) */}
      <div
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          display: 'flex',
          gap: '8px',
          zIndex: 100,
          flexWrap: 'wrap',
          maxWidth: '320px',
          justifyContent: 'flex-end',
        }}
      >
        {Object.entries(themes).map(([key, value]) => (
          <button
            key={key}
            onClick={() => setTheme(key)}
            style={{
              padding: '8px 14px',
              borderRadius: '20px',
              border: theme === key ? `2px solid ${value.accent}` : '2px solid transparent',
              background:
                theme === key
                  ? value.isDark
                    ? value.cardBg
                    : 'rgba(255,255,255,0.9)'
                  : value.isDark
                    ? 'rgba(255,255,255,0.1)'
                    : 'rgba(0,0,0,0.05)',
              color: value.accent,
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: '600',
              boxShadow: theme === key ? `0 0 20px ${value.accentGlow}` : 'none',
            }}
          >
            {value.name}
          </button>
        ))}
      </div>

      {/* Phone Frame */}
      <div
        style={{
          width: '375px',
          height: '812px',
          borderRadius: '50px',
          background: t.isDark ? '#000' : '#1a1a1a',
          padding: '12px',
          boxShadow: `0 0 0 2px ${t.isDark ? '#333' : '#e5e7eb'}, 0 0 0 4px ${t.isDark ? '#1a1a1a' : '#d1d5db'}, 0 25px 80px rgba(0,0,0,${t.isDark ? '0.5' : '0.2'}), 0 0 60px ${t.accentGlow}`,
          position: 'relative',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '40px',
            background: t.bg,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {/* Status Bar */}
          <div
            style={{
              height: '50px',
              padding: '14px 28px 0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              color: t.text,
              fontSize: '14px',
              fontWeight: '600',
            }}
          >
            <span>9:41</span>
            <div
              style={{
                width: '125px',
                height: '35px',
                background: '#000',
                borderRadius: '20px',
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)',
                top: '8px',
              }}
            />
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <svg width="18" height="12" viewBox="0 0 18 12" fill={t.text}>
                <rect x="0" y="8" width="3" height="4" rx="1" />
                <rect x="5" y="5" width="3" height="7" rx="1" />
                <rect x="10" y="2" width="3" height="10" rx="1" />
                <rect x="15" y="0" width="3" height="12" rx="1" />
              </svg>
              <svg width="16" height="12" viewBox="0 0 16 12" fill={t.text}>
                <path d="M8 10.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" transform="translate(0,-2)" />
                <path
                  d="M4.5 8a5 5 0 017 0"
                  stroke={t.text}
                  strokeWidth="1.5"
                  fill="none"
                  strokeLinecap="round"
                />
                <path
                  d="M1.5 5a9 9 0 0113 0"
                  stroke={t.text}
                  strokeWidth="1.5"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div
                  style={{
                    width: '24px',
                    height: '11px',
                    border: `1.5px solid ${t.text}`,
                    borderRadius: '3px',
                    padding: '1.5px',
                  }}
                >
                  <div
                    style={{
                      width: '80%',
                      height: '100%',
                      background: t.accent,
                      borderRadius: '1px',
                    }}
                  />
                </div>
                <div
                  style={{
                    width: '2px',
                    height: '5px',
                    background: t.text,
                    borderRadius: '0 1px 1px 0',
                    marginLeft: '1px',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Theme Selection Modal */}
          <ThemeSelectionModal
            open={showThemeModal}
            onClose={() => setShowThemeModal(false)}
            currentTheme={theme}
            onSelect={setTheme}
            theme={t}
          />

          {/* Confirm Dialogs */}
          <ConfirmDialog
            open={showLogoutConfirm}
            onClose={() => setShowLogoutConfirm(false)}
            onConfirm={() => {
              setShowLogoutConfirm(false)
              handleLogout()
            }}
            title="Log Out"
            message={`Are you sure you want to log out${user?.email ? ` from ${user.email}` : ''}? You'll need to sign in again to access your account.`}
            confirmText="Log Out"
            theme={t}
          />
          <ConfirmDialog
            open={showDeleteConfirm}
            onClose={() => setShowDeleteConfirm(false)}
            onConfirm={() => {
              setShowDeleteConfirm(false)
            }}
            title="Delete Account"
            message="This action is permanent and cannot be undone. All your data, messages, and contacts will be permanently removed."
            confirmText="Delete"
            theme={t}
          />

          {/* Main Content */}
          {!showThemeModal && (
            <>
              {/* Header */}
              <div style={{ padding: '8px 20px 16px' }}>
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
                  <div
                    style={{ padding: '12px 16px 8px', borderBottom: `1px solid ${t.cardBorder}` }}
                  >
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
                    onClick={() => setShowThemeModal(true)}
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
                  <div
                    style={{ padding: '12px 16px 8px', borderBottom: `1px solid ${t.cardBorder}` }}
                  >
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
                    enabled={notifications}
                    onChange={setNotifications}
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
                    enabled={soundEnabled}
                    onChange={setSoundEnabled}
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
                    label="Vibration"
                    enabled={vibration}
                    onChange={setVibration}
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
                  <div
                    style={{ padding: '12px 16px 8px', borderBottom: `1px solid ${t.cardBorder}` }}
                  >
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
                    enabled={readReceipts}
                    onChange={setReadReceipts}
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
                  <div
                    style={{ padding: '12px 16px 8px', borderBottom: `1px solid ${t.cardBorder}` }}
                  >
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
                  <SettingsRow
                    icon={Icons.user}
                    label="Edit Profile"
                    onClick={() => {}}
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
                    label="Export Data"
                    onClick={handleExportData}
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
                  <div
                    style={{ padding: '12px 16px 8px', borderBottom: `1px solid ${t.cardBorder}` }}
                  >
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
                  <div
                    style={{ padding: '12px 16px 8px', borderBottom: `1px solid ${t.cardBorder}` }}
                  >
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
                    onClick={() => setShowLogoutConfirm(true)}
                    theme={t}
                    showArrow={false}
                    danger
                  />
                  <SettingsRow
                    icon={Icons.trash}
                    label="Delete Account"
                    onClick={() => setShowDeleteConfirm(true)}
                    theme={t}
                    showArrow={false}
                    danger
                  />
                </div>
              </div>

              {/* Bottom Navigation */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '85px',
                  background: t.navBg,
                  backdropFilter: 'blur(20px)',
                  borderTop: `1px solid ${t.cardBorder}`,
                  display: 'flex',
                  justifyContent: 'space-around',
                  alignItems: 'flex-start',
                  paddingTop: '12px',
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

        {/* Home Indicator */}
        <div
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '134px',
            height: '5px',
            background: t.isDark ? '#fff' : '#000',
            borderRadius: '10px',
            opacity: 0.3,
          }}
        />
      </div>
    </div>
  )
}
