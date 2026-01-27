import { useState, useMemo, useCallback, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/components/providers/AuthProvider'
import { useLocalStorage, useDebounce } from '@/hooks'
import { toast } from 'sonner'
import { initialContacts } from '@/data/mockData'
import { themes } from '@/constants/phoneThemes'

// SVG Icons
const Icons = {
  search: (color) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  ),
  plus: (color) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  phone: (color) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
    </svg>
  ),
  message: (color) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  ),
  x: (color) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  trash: (color) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
    </svg>
  ),
  ban: (color) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
    </svg>
  ),
  unban: (color) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12h8" />
    </svg>
  ),
  check: (color) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  alert: (color) => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  user: (color) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  mail: (color) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  ),
  moreVertical: (color) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <circle cx="12" cy="12" r="1" />
      <circle cx="12" cy="5" r="1" />
      <circle cx="12" cy="19" r="1" />
    </svg>
  ),
  chevronDown: (color) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M6 9l6 6 6-6" />
    </svg>
  ),
  edit: (color) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
}

// Helper functions
const getInitials = (name) =>
  name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
const getAvatarColor = (name, colors) => colors[name.charCodeAt(0) % colors.length]
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
const isValidPhone = (phone) =>
  /^[\d\s\-+()]+$/.test(phone) && phone.replace(/\D/g, '').length >= 10

// Preferred method options
const PREFERRED_METHODS = [
  { value: 'phone', label: 'Phone / SMS' },
  { value: 'email', label: 'Email' },
]

// Confirm Dialog Component
function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  theme: t,
  variant = 'danger',
}) {
  if (!open) return null
  const isDestructive = variant === 'danger'

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
          {Icons.alert(isDestructive ? t.danger : t.accent)}
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
              background: isDestructive ? t.danger : t.accent,
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

// Add Contact Modal
function AddContactModal({ open, onClose, onAdd, theme: t }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [birthday, setBirthday] = useState('')
  const [interests, setInterests] = useState('')
  const [preferredMethod, setPreferredMethod] = useState('phone')
  const [showMethodDropdown, setShowMethodDropdown] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const newErrors = {}
    if (!name.trim()) newErrors.name = 'Name is required'
    if (!phone.trim()) newErrors.phone = 'Phone is required'
    else if (!isValidPhone(phone)) newErrors.phone = 'Invalid phone number'
    if (email && !isValidEmail(email)) newErrors.email = 'Invalid email format'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    const parsedInterests = interests
      .split(',')
      .map((i) => i.trim().toLowerCase())
      .filter(Boolean)
    onAdd({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      birthday: birthday || null,
      interests: parsedInterests,
      preferredMethod,
    })
    setName('')
    setPhone('')
    setEmail('')
    setBirthday('')
    setInterests('')
    setPreferredMethod('phone')
    setErrors({})
    onClose()
  }

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
          New Contact
        </h2>
        <button
          onClick={handleSubmit}
          style={{
            background: 'none',
            border: 'none',
            color: t.accent,
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600',
          }}
        >
          Done
        </button>
      </div>

      {/* Form */}
      <div style={{ padding: '24px 20px', flex: 1, overflowY: 'auto' }}>
        {/* Avatar Preview */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
          <div
            style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: name
                ? `linear-gradient(135deg, ${getAvatarColor(name || 'A', t.avatarColors)}, ${getAvatarColor(name || 'A', t.avatarColors)}88)`
                : t.cardBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '36px',
              fontWeight: '600',
              border: `2px solid ${t.cardBorder}`,
            }}
          >
            {name ? getInitials(name) : Icons.user(t.textMuted)}
          </div>
        </div>

        {/* Name Field */}
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
            Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            style={{
              width: '100%',
              padding: '14px 16px',
              borderRadius: '12px',
              border: `1px solid ${errors.name ? t.danger : t.cardBorder}`,
              background: t.searchBg,
              color: t.text,
              fontSize: '16px',
              outline: 'none',
            }}
          />
          {errors.name && (
            <span style={{ color: t.danger, fontSize: '12px', marginTop: '4px', display: 'block' }}>
              {errors.name}
            </span>
          )}
        </div>

        {/* Phone Field */}
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
            Phone Number *
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 (555) 123-4567"
            style={{
              width: '100%',
              padding: '14px 16px',
              borderRadius: '12px',
              border: `1px solid ${errors.phone ? t.danger : t.cardBorder}`,
              background: t.searchBg,
              color: t.text,
              fontSize: '16px',
              outline: 'none',
            }}
          />
          {errors.phone && (
            <span style={{ color: t.danger, fontSize: '12px', marginTop: '4px', display: 'block' }}>
              {errors.phone}
            </span>
          )}
        </div>

        {/* Email Field */}
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
            Email (Optional)
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john@example.com"
            style={{
              width: '100%',
              padding: '14px 16px',
              borderRadius: '12px',
              border: `1px solid ${errors.email ? t.danger : t.cardBorder}`,
              background: t.searchBg,
              color: t.text,
              fontSize: '16px',
              outline: 'none',
            }}
          />
          {errors.email && (
            <span style={{ color: t.danger, fontSize: '12px', marginTop: '4px', display: 'block' }}>
              {errors.email}
            </span>
          )}
        </div>

        {/* Birthday Field */}
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
            Birthday (Optional)
          </label>
          <input
            type="date"
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
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
            Used for birthday automation messages
          </span>
        </div>

        {/* Interests Field */}
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
            Interests (Optional)
          </label>
          <input
            type="text"
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            placeholder="gold, silver, rings (comma separated)"
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
            Used for bulk messaging campaigns
          </span>
        </div>

        {/* Preferred Contact Method Field */}
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
            Preferred Contact Method
          </label>
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setShowMethodDropdown(!showMethodDropdown)}
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: '12px',
                border: `1px solid ${t.cardBorder}`,
                background: t.searchBg,
                color: t.text,
                fontSize: '16px',
                outline: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <span>{PREFERRED_METHODS.find((m) => m.value === preferredMethod)?.label}</span>
              {Icons.chevronDown(t.textMuted)}
            </button>
            {showMethodDropdown && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: '4px',
                  background: t.isDark ? t.screenBg : '#fff',
                  borderRadius: '12px',
                  border: `1px solid ${t.cardBorder}`,
                  overflow: 'hidden',
                  zIndex: 10,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                }}
              >
                {PREFERRED_METHODS.map((method) => (
                  <button
                    key={method.value}
                    type="button"
                    onClick={() => {
                      setPreferredMethod(method.value)
                      setShowMethodDropdown(false)
                    }}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      background: preferredMethod === method.value ? t.cardBg : 'transparent',
                      border: 'none',
                      borderBottom: `1px solid ${t.cardBorder}`,
                      color: preferredMethod === method.value ? t.accent : t.text,
                      fontSize: '16px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>{method.label}</span>
                    {preferredMethod === method.value && Icons.check(t.accent)}
                  </button>
                ))}
              </div>
            )}
          </div>
          <span
            style={{ color: t.textMuted, fontSize: '11px', marginTop: '4px', display: 'block' }}
          >
            How bulk messages will be sent to this contact
          </span>
        </div>
      </div>
    </div>
  )
}

// Edit Contact Modal
function EditContactModal({ open, onClose, contact, onSave, theme: t }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [birthday, setBirthday] = useState('')
  const [interests, setInterests] = useState('')
  const [preferredMethod, setPreferredMethod] = useState('phone')
  const [showMethodDropdown, setShowMethodDropdown] = useState(false)
  const [errors, setErrors] = useState({})

  // Populate fields when contact changes or modal opens
  useEffect(() => {
    if (open && contact) {
      setName(contact.name || '')
      setPhone(contact.phone || '')
      setEmail(contact.email || '')
      setBirthday(contact.birthday || '')
      setInterests(contact.interests?.join(', ') || '')
      setPreferredMethod(contact.preferredMethod || 'phone')
      setErrors({})
    }
  }, [open, contact])

  const validate = () => {
    const newErrors = {}
    if (!name.trim()) newErrors.name = 'Name is required'
    if (!phone.trim()) newErrors.phone = 'Phone is required'
    else if (!isValidPhone(phone)) newErrors.phone = 'Invalid phone number'
    if (email && !isValidEmail(email)) newErrors.email = 'Invalid email format'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    const parsedInterests = interests
      .split(',')
      .map((i) => i.trim().toLowerCase())
      .filter(Boolean)
    onSave({
      ...contact,
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      birthday: birthday || null,
      interests: parsedInterests,
      preferredMethod,
    })
  }

  if (!open || !contact) return null

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
          Edit Contact
        </h2>
        <button
          onClick={handleSubmit}
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
      <div style={{ padding: '24px 20px', flex: 1, overflowY: 'auto' }}>
        {/* Avatar Preview */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
          <div
            style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: name
                ? `linear-gradient(135deg, ${getAvatarColor(name || 'A', t.avatarColors)}, ${getAvatarColor(name || 'A', t.avatarColors)}88)`
                : t.cardBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '36px',
              fontWeight: '600',
              border: `2px solid ${t.cardBorder}`,
            }}
          >
            {name ? getInitials(name) : Icons.user(t.textMuted)}
          </div>
        </div>

        {/* Name Field */}
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
            Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            style={{
              width: '100%',
              padding: '14px 16px',
              borderRadius: '12px',
              border: `1px solid ${errors.name ? t.danger : t.cardBorder}`,
              background: t.searchBg,
              color: t.text,
              fontSize: '16px',
              outline: 'none',
            }}
          />
          {errors.name && (
            <span style={{ color: t.danger, fontSize: '12px', marginTop: '4px', display: 'block' }}>
              {errors.name}
            </span>
          )}
        </div>

        {/* Phone Field */}
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
            Phone Number *
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 (555) 123-4567"
            style={{
              width: '100%',
              padding: '14px 16px',
              borderRadius: '12px',
              border: `1px solid ${errors.phone ? t.danger : t.cardBorder}`,
              background: t.searchBg,
              color: t.text,
              fontSize: '16px',
              outline: 'none',
            }}
          />
          {errors.phone && (
            <span style={{ color: t.danger, fontSize: '12px', marginTop: '4px', display: 'block' }}>
              {errors.phone}
            </span>
          )}
        </div>

        {/* Email Field */}
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
            Email (Optional)
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john@example.com"
            style={{
              width: '100%',
              padding: '14px 16px',
              borderRadius: '12px',
              border: `1px solid ${errors.email ? t.danger : t.cardBorder}`,
              background: t.searchBg,
              color: t.text,
              fontSize: '16px',
              outline: 'none',
            }}
          />
          {errors.email && (
            <span style={{ color: t.danger, fontSize: '12px', marginTop: '4px', display: 'block' }}>
              {errors.email}
            </span>
          )}
        </div>

        {/* Birthday Field */}
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
            Birthday (Optional)
          </label>
          <input
            type="date"
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
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
            Used for birthday automation messages
          </span>
        </div>

        {/* Interests Field */}
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
            Interests (Optional)
          </label>
          <input
            type="text"
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            placeholder="gold, silver, rings (comma separated)"
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
            Used for bulk messaging campaigns
          </span>
        </div>

        {/* Preferred Contact Method Field */}
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
            Preferred Contact Method
          </label>
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setShowMethodDropdown(!showMethodDropdown)}
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: '12px',
                border: `1px solid ${t.cardBorder}`,
                background: t.searchBg,
                color: t.text,
                fontSize: '16px',
                outline: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <span>{PREFERRED_METHODS.find((m) => m.value === preferredMethod)?.label}</span>
              {Icons.chevronDown(t.textMuted)}
            </button>
            {showMethodDropdown && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: '4px',
                  background: t.isDark ? t.screenBg : '#fff',
                  borderRadius: '12px',
                  border: `1px solid ${t.cardBorder}`,
                  overflow: 'hidden',
                  zIndex: 10,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                }}
              >
                {PREFERRED_METHODS.map((method) => (
                  <button
                    key={method.value}
                    type="button"
                    onClick={() => {
                      setPreferredMethod(method.value)
                      setShowMethodDropdown(false)
                    }}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      background: preferredMethod === method.value ? t.cardBg : 'transparent',
                      border: 'none',
                      borderBottom: `1px solid ${t.cardBorder}`,
                      color: preferredMethod === method.value ? t.accent : t.text,
                      fontSize: '16px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>{method.label}</span>
                    {preferredMethod === method.value && Icons.check(t.accent)}
                  </button>
                ))}
              </div>
            )}
          </div>
          <span
            style={{ color: t.textMuted, fontSize: '11px', marginTop: '4px', display: 'block' }}
          >
            How bulk messages will be sent to this contact
          </span>
        </div>
      </div>
    </div>
  )
}

// Contact Action Menu
function ContactActionMenu({ contact, onClose, onEdit, onDelete, onBlock, theme: t }) {
  if (!contact) return null

  return (
    <div
      style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 80 }}
      onClick={onClose}
    >
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: t.isDark ? t.screenBg : '#fff',
          borderRadius: '20px 20px 0 0',
          padding: '8px 0 34px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            width: '36px',
            height: '4px',
            background: t.cardBorder,
            borderRadius: '2px',
            margin: '0 auto 16px',
          }}
        />
        <div
          style={{
            padding: '0 20px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${getAvatarColor(contact.name, t.avatarColors)}, ${getAvatarColor(contact.name, t.avatarColors)}88)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '18px',
              fontWeight: '600',
            }}
          >
            {getInitials(contact.name)}
          </div>
          <div>
            <div style={{ color: t.text, fontSize: '17px', fontWeight: '600' }}>{contact.name}</div>
            <div style={{ color: t.textMuted, fontSize: '14px' }}>{contact.phone}</div>
          </div>
        </div>
        <div style={{ borderTop: `1px solid ${t.cardBorder}` }}>
          <button
            onClick={() => {
              onEdit(contact)
              onClose()
            }}
            style={{
              width: '100%',
              padding: '16px 20px',
              background: 'none',
              border: 'none',
              borderBottom: `1px solid ${t.cardBorder}`,
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
            }}
          >
            {Icons.edit(t.accent)}
            <span style={{ color: t.text, fontSize: '16px' }}>Edit Contact</span>
          </button>
          <button
            onClick={() => {
              onBlock(contact)
              onClose()
            }}
            style={{
              width: '100%',
              padding: '16px 20px',
              background: 'none',
              border: 'none',
              borderBottom: `1px solid ${t.cardBorder}`,
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
            }}
          >
            {contact.isBlocked ? Icons.unban(t.accent) : Icons.ban(t.danger)}
            <span style={{ color: contact.isBlocked ? t.accent : t.danger, fontSize: '16px' }}>
              {contact.isBlocked ? 'Unblock Contact' : 'Block Contact'}
            </span>
          </button>
          <button
            onClick={() => {
              onDelete(contact)
              onClose()
            }}
            style={{
              width: '100%',
              padding: '16px 20px',
              background: 'none',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
            }}
          >
            {Icons.trash(t.danger)}
            <span style={{ color: t.danger, fontSize: '16px' }}>Delete Contact</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default function PhoneContactsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user: _user } = useAuth()

  const [theme, setTheme] = useState('cyanDark')
  const [searchQuery, setSearchQuery] = useState('')
  const [contacts, setContacts] = useLocalStorage('contacts', initialContacts)
  const [activeTab, setActiveTab] = useState('all')
  const [selectedContact, setSelectedContact] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showActionMenu, setShowActionMenu] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)
  const [showBlockConfirm, setShowBlockConfirm] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingContact, setEditingContact] = useState(null)

  const t = themes[theme]

  // Load theme from localStorage and listen for changes
  useEffect(() => {
    const loadTheme = () => {
      try {
        const saved = localStorage.getItem('app-settings')
        if (saved) {
          const settings = JSON.parse(saved)
          const savedTheme = settings.appearance?.colorTheme
          if (savedTheme && themes[savedTheme]) {
            setTheme(savedTheme)
          }
        }
      } catch (e) {
        console.error('Failed to load theme', e)
      }
    }

    loadTheme()
    window.addEventListener('layout-theme-changed', loadTheme)
    window.addEventListener('storage', loadTheme)

    return () => {
      window.removeEventListener('layout-theme-changed', loadTheme)
      window.removeEventListener('storage', loadTheme)
    }
  }, [])

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
  const debouncedSearch = useDebounce(searchQuery, 300)

  // Filter contacts
  const filteredContacts = useMemo(() => {
    let filtered = [...contacts]

    // Search filter
    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase()
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.phone.includes(query) ||
          c.email.toLowerCase().includes(query)
      )
    }

    // Tab filter
    if (activeTab === 'blocked') {
      filtered = filtered.filter((c) => c.isBlocked)
    } else {
      filtered = filtered.filter((c) => !c.isBlocked)
    }

    // Sort alphabetically
    return filtered.sort((a, b) => a.name.localeCompare(b.name))
  }, [contacts, debouncedSearch, activeTab])

  // Group contacts by first letter
  const groupedContacts = useMemo(() => {
    const groups = {}
    filteredContacts.forEach((contact) => {
      const letter = contact.name[0].toUpperCase()
      if (!groups[letter]) groups[letter] = []
      groups[letter].push(contact)
    })
    return groups
  }, [filteredContacts])

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
  const availableLetters = Object.keys(groupedContacts)
  const blockedCount = contacts.filter((c) => c.isBlocked).length

  const scrollToLetter = (letter) => {
    const element = document.getElementById(`section-${letter}`)
    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // Handlers
  const handleAddContact = useCallback(
    (newContact) => {
      const contact = {
        id: `c${Date.now()}`,
        ...newContact,
        avatar: null,
        status: 'offline',
        lastSeen: null,
        isBlocked: false,
        engagementScore: 0,
      }
      setContacts((prev) => [...prev, contact])
      toast.success(`${contact.name} added to contacts`)
    },
    [setContacts]
  )

  const handleDeleteContact = useCallback(() => {
    if (!showDeleteConfirm) return
    const contactName = showDeleteConfirm.name
    setContacts((prev) => prev.filter((c) => c.id !== showDeleteConfirm.id))
    setShowDeleteConfirm(null)
    toast.success(`${contactName} removed from contacts`)
  }, [showDeleteConfirm, setContacts])

  const handleBlockContact = useCallback(() => {
    if (!showBlockConfirm) return
    const wasBlocked = showBlockConfirm.isBlocked
    const contactName = showBlockConfirm.name
    setContacts((prev) =>
      prev.map((c) => (c.id === showBlockConfirm.id ? { ...c, isBlocked: !c.isBlocked } : c))
    )
    setShowBlockConfirm(null)
    toast.success(wasBlocked ? `${contactName} unblocked` : `${contactName} blocked`)
  }, [showBlockConfirm, setContacts])

  const handleEditContact = useCallback((contact) => {
    setEditingContact(contact)
    setShowEditModal(true)
  }, [])

  const handleSaveContact = useCallback(
    (updatedContact) => {
      setContacts((prev) => prev.map((c) => (c.id === updatedContact.id ? updatedContact : c)))
      setShowEditModal(false)
      setEditingContact(null)
      toast.success(`${updatedContact.name} updated`)
    },
    [setContacts]
  )

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
      {/* Add Contact Modal */}
      <AddContactModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddContact}
        theme={t}
      />

      {/* Edit Contact Modal */}
      <EditContactModal
        open={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setEditingContact(null)
        }}
        contact={editingContact}
        onSave={handleSaveContact}
        theme={t}
      />

      {/* Action Menu */}
      <ContactActionMenu
        contact={showActionMenu}
        onClose={() => setShowActionMenu(null)}
        onEdit={handleEditContact}
        onDelete={(c) => setShowDeleteConfirm(c)}
        onBlock={(c) => setShowBlockConfirm(c)}
        theme={t}
      />

      {/* Confirm Dialogs */}
      <ConfirmDialog
        open={!!showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(null)}
        onConfirm={handleDeleteContact}
        title="Delete Contact"
        message={`Are you sure you want to delete ${showDeleteConfirm?.name}? This action cannot be undone.`}
        confirmText="Delete"
        theme={t}
        variant="danger"
      />
      <ConfirmDialog
        open={!!showBlockConfirm}
        onClose={() => setShowBlockConfirm(null)}
        onConfirm={handleBlockContact}
        title={showBlockConfirm?.isBlocked ? 'Unblock Contact' : 'Block Contact'}
        message={
          showBlockConfirm?.isBlocked
            ? `Unblock ${showBlockConfirm?.name}? They will be able to contact you again.`
            : `Block ${showBlockConfirm?.name}? They won't be able to contact you.`
        }
        confirmText={showBlockConfirm?.isBlocked ? 'Unblock' : 'Block'}
        theme={t}
        variant={showBlockConfirm?.isBlocked ? 'normal' : 'danger'}
      />

      {/* Header */}
      {!showAddModal && (
        <>
          <div style={{ padding: '8px 20px 16px', paddingTop: 'env(safe-area-inset-top, 16px)' }}>
            <h1
              style={{
                color: t.text,
                fontSize: '32px',
                fontWeight: '700',
                margin: '0 0 16px 0',
                letterSpacing: '-0.5px',
              }}
            >
              Contacts
            </h1>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <button
                onClick={() => setActiveTab('all')}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '12px',
                  border: 'none',
                  background: activeTab === 'all' ? t.accent : t.cardBg,
                  color: activeTab === 'all' ? '#fff' : t.text,
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                All ({contacts.filter((c) => !c.isBlocked).length})
              </button>
              <button
                onClick={() => setActiveTab('blocked')}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '12px',
                  border: 'none',
                  background: activeTab === 'blocked' ? t.danger : t.cardBg,
                  color: activeTab === 'blocked' ? '#fff' : t.text,
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Blocked ({blockedCount})
              </button>
            </div>

            {/* Search Bar */}
            <div
              style={{
                background: t.searchBg,
                borderRadius: '12px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                border: `1px solid ${t.cardBorder}`,
              }}
            >
              {Icons.search(t.textMuted)}
              <input
                type="text"
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  color: t.text,
                  fontSize: '16px',
                  width: '100%',
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    background: t.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: t.textMuted,
                    fontSize: '12px',
                  }}
                >
                  x
                </button>
              )}
            </div>
          </div>

          {/* Contact List */}
          <div
            style={{
              height: 'calc(100% - 270px)',
              overflowY: 'auto',
              padding: '0 20px',
              position: 'relative',
            }}
          >
            {Object.entries(groupedContacts).map(([letter, contactsInGroup]) => (
              <div key={letter} id={`section-${letter}`}>
                <div
                  style={{
                    color: t.accent,
                    fontSize: '14px',
                    fontWeight: '700',
                    padding: '12px 0 8px',
                    position: 'sticky',
                    top: 0,
                    background: t.isDark
                      ? `linear-gradient(180deg, ${t.screenBg} 0%, ${t.screenBg}ee 80%, transparent 100%)`
                      : `linear-gradient(180deg, ${t.screenBg} 0%, ${t.screenBg}ee 80%, transparent 100%)`,
                    zIndex: 10,
                    letterSpacing: '1px',
                  }}
                >
                  {letter}
                </div>

                {contactsInGroup.map((contact) => (
                  <div
                    key={contact.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      padding: '14px',
                      marginBottom: '8px',
                      background: selectedContact === contact.id ? t.cardBg : 'transparent',
                      borderRadius: '16px',
                      border: `1px solid ${selectedContact === contact.id ? t.cardBorder : 'transparent'}`,
                      cursor: 'pointer',
                    }}
                    onClick={() =>
                      setSelectedContact(selectedContact === contact.id ? null : contact.id)
                    }
                  >
                    <div
                      style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${getAvatarColor(contact.name, t.avatarColors)}, ${getAvatarColor(contact.name, t.avatarColors)}88)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: '18px',
                        fontWeight: '600',
                        boxShadow: `0 4px 15px ${getAvatarColor(contact.name, t.avatarColors)}40`,
                        position: 'relative',
                        opacity: contact.isBlocked ? 0.5 : 1,
                      }}
                    >
                      {getInitials(contact.name)}
                      {contact.isBlocked && (
                        <div
                          style={{
                            position: 'absolute',
                            inset: 0,
                            borderRadius: '50%',
                            background: 'rgba(0,0,0,0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {Icons.ban('#fff')}
                        </div>
                      )}
                    </div>

                    <div style={{ flex: 1, opacity: contact.isBlocked ? 0.5 : 1 }}>
                      <div
                        style={{
                          color: t.text,
                          fontSize: '16px',
                          fontWeight: '600',
                          marginBottom: '4px',
                        }}
                      >
                        {contact.name}
                      </div>
                      <div style={{ color: t.textMuted, fontSize: '13px' }}>{contact.phone}</div>
                    </div>

                    {selectedContact === contact.id ? (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: t.accent,
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: `0 4px 15px ${t.accentGlow}`,
                          }}
                        >
                          {Icons.phone('#fff')}
                        </button>
                        <button
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: t.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                            border: `1px solid ${t.cardBorder}`,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {Icons.message(t.accent)}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setShowActionMenu(contact)
                          }}
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: t.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                            border: `1px solid ${t.cardBorder}`,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {Icons.moreVertical(t.textMuted)}
                        </button>
                      </div>
                    ) : (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={t.textMuted}
                        strokeWidth="2"
                      >
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            ))}

            {filteredContacts.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: t.textMuted }}>
                {Icons.search(t.textMuted)}
                <p style={{ fontSize: '16px', margin: '16px 0 0' }}>
                  {activeTab === 'blocked' ? 'No blocked contacts' : 'No contacts found'}
                </p>
                <p style={{ fontSize: '13px', margin: '8px 0 0', opacity: 0.7 }}>
                  {activeTab === 'blocked'
                    ? 'Blocked contacts will appear here'
                    : 'Try a different search term'}
                </p>
              </div>
            )}
          </div>

          {/* Alphabet Scroll */}
          <div
            style={{
              position: 'absolute',
              right: '4px',
              top: '230px',
              bottom: '100px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '8px 0',
            }}
          >
            {alphabet.map((letter) => (
              <button
                key={letter}
                onClick={() => scrollToLetter(letter)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: availableLetters.includes(letter) ? t.accent : t.textMuted,
                  fontSize: '10px',
                  fontWeight: '600',
                  cursor: availableLetters.includes(letter) ? 'pointer' : 'default',
                  opacity: availableLetters.includes(letter) ? 1 : 0.3,
                  padding: '0',
                  lineHeight: '1',
                }}
              >
                {letter}
              </button>
            ))}
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

          {/* Add Contact FAB */}
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              position: 'absolute',
              bottom: '100px',
              right: '20px',
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${t.accent}, ${t.accent}cc)`,
              border: 'none',
              boxShadow: `0 8px 30px ${t.accentGlow}`,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {Icons.plus('#fff')}
          </button>
        </>
      )}
    </div>
  )
}
