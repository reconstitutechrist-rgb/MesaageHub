import { useState, useRef, useEffect, useMemo, memo, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/components/providers/AuthProvider'
import { MediaAttachmentSheet } from '@/components/common/MediaAttachmentSheet'
import { VirtualList } from '@/components/common/VirtualList'
import { useToggle, useWindowSize } from '@/hooks'
import { useScheduledMessages, useCancelScheduledMessage } from '@/hooks/queries'
import { toast } from 'sonner'
import { themes } from '@/constants/phoneThemes'

// SVG Icons
const Icons = {
  search: (color) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  ),
  scheduled: (color, size = 18) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  checkCircle: (color, size = 16) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  alertCircle: (color, size = 16) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  trash: (color) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),
  edit: (color) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  back: (color) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  ),
  phone: (color) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
    </svg>
  ),
  video: (color) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  ),
  plus: (color) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  mic: (color) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
      <path d="M19 10v2a7 7 0 01-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  ),
  send: (color) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={color}>
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </svg>
  ),
  paperclip: (color) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
    </svg>
  ),
  clock: (color) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  template: (color) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="9" y1="21" x2="9" y2="9" />
    </svg>
  ),
  megaphone: (color) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M3 11l18-5v12L3 13v-2z" />
      <path d="M11.6 16.8a3 3 0 11-5.8-1.6" />
    </svg>
  ),
  users: (_color) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  x: (color) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  check: (color) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  ),
  stop: (color) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={color}>
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  ),
}

// Message templates
const messageTemplates = [
  { id: 1, name: 'Greeting', text: "Hi {name}! Hope you're doing well." },
  { id: 2, name: 'Follow Up', text: 'Hey {name}, just following up on our conversation.' },
  { id: 3, name: 'Promo', text: 'Special offer just for you, {name}! Limited time only.' },
  {
    id: 4,
    name: 'Reminder',
    text: 'Hi {name}, this is a friendly reminder about your appointment.',
  },
]

// Mock conversations data
const mockConversations = [
  {
    id: 1,
    name: 'Alice Anderson',
    phone: '+1 (555) 123-4567',
    lastMessage: 'Hey! Are we still on for lunch tomorrow?',
    time: '2:34 PM',
    unread: 2,
    online: true,
    messages: [
      { id: 1, text: 'Hi there!', sent: false, time: '2:30 PM' },
      { id: 2, text: 'Hey Alice! How are you?', sent: true, time: '2:31 PM', status: 'read' },
      {
        id: 3,
        text: "I'm doing great! Just finished that project we talked about.",
        sent: false,
        time: '2:32 PM',
      },
      {
        id: 4,
        text: "That's awesome! Can't wait to see it",
        sent: true,
        time: '2:33 PM',
        status: 'delivered',
      },
      { id: 5, text: 'Hey! Are we still on for lunch tomorrow?', sent: false, time: '2:34 PM' },
    ],
  },
  {
    id: 2,
    name: 'Bob Baker',
    phone: '+1 (555) 234-5678',
    lastMessage: 'Thanks for the update!',
    time: '1:15 PM',
    unread: 0,
    online: false,
    messages: [
      {
        id: 1,
        text: 'Hey Bob, just wanted to let you know the meeting is moved to 3pm',
        sent: true,
        time: '1:10 PM',
        status: 'read',
      },
      { id: 2, text: 'Thanks for the update!', sent: false, time: '1:15 PM' },
    ],
  },
  {
    id: 3,
    name: 'Carol Chen',
    phone: '+1 (555) 345-6789',
    lastMessage: 'The documents are ready for review',
    time: '12:45 PM',
    unread: 1,
    online: true,
    messages: [
      {
        id: 1,
        text: 'Hi Carol, did you get a chance to review those docs?',
        sent: true,
        time: '12:30 PM',
        status: 'read',
      },
      { id: 2, text: 'Yes! I just finished going through them', sent: false, time: '12:40 PM' },
      { id: 3, text: 'The documents are ready for review', sent: false, time: '12:45 PM' },
    ],
  },
  {
    id: 4,
    name: 'David Davis',
    phone: '+1 (555) 456-7890',
    lastMessage: 'See you at the game!',
    time: '11:30 AM',
    unread: 0,
    online: false,
    messages: [
      { id: 1, text: 'Hey man, you coming to the game tonight?', sent: false, time: '11:20 AM' },
      { id: 2, text: "Wouldn't miss it!", sent: true, time: '11:25 AM', status: 'read' },
      { id: 3, text: 'See you at the game!', sent: false, time: '11:30 AM' },
    ],
  },
  {
    id: 5,
    name: 'Marketing Campaign',
    phone: 'Campaign - 45 recipients',
    lastMessage: 'Summer Sale - 50% off everything!',
    time: 'Yesterday',
    unread: 0,
    online: false,
    isCampaign: true,
    messages: [
      {
        id: 1,
        text: 'Summer Sale - 50% off everything! Shop now at example.com',
        sent: true,
        time: 'Yesterday',
        status: 'delivered',
      },
    ],
  },
]

const getInitials = (name) =>
  name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
const getAvatarColor = (name, colors) => colors[name.charCodeAt(0) % colors.length]

// Memoized Conversation Item Component - prevents re-renders of all items when one changes
const ConversationItem = memo(function ConversationItem({ conversation, theme: t, onSelect }) {
  return (
    <div
      onClick={() => onSelect(conversation.id)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 8px',
        borderRadius: '16px',
        cursor: 'pointer',
        borderBottom: `1px solid ${t.cardBorder}`,
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: conversation.isCampaign
            ? `linear-gradient(135deg, ${t.accent}, ${t.accentDark})`
            : `linear-gradient(135deg, ${getAvatarColor(conversation.name, t.avatarColors)}, ${getAvatarColor(conversation.name, t.avatarColors)}88)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: conversation.isCampaign ? '20px' : '18px',
          fontWeight: '600',
          position: 'relative',
          flexShrink: 0,
        }}
      >
        {conversation.isCampaign ? Icons.megaphone('#fff') : getInitials(conversation.name)}
        {conversation.online && !conversation.isCampaign && (
          <div
            style={{
              position: 'absolute',
              bottom: '2px',
              right: '2px',
              width: '14px',
              height: '14px',
              background: '#22c55e',
              borderRadius: '50%',
              border: `3px solid ${t.screenBg}`,
              boxShadow: '0 0 8px #22c55e',
            }}
          />
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '4px',
          }}
        >
          <span
            style={{
              color: t.text,
              fontSize: '16px',
              fontWeight: conversation.unread > 0 ? '700' : '600',
            }}
          >
            {conversation.name}
          </span>
          <span
            style={{
              color: conversation.unread > 0 ? t.accent : t.textMuted,
              fontSize: '12px',
              fontWeight: conversation.unread > 0 ? '600' : '400',
            }}
          >
            {conversation.time}
          </span>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <p
            style={{
              color: conversation.unread > 0 ? t.text : t.textMuted,
              fontSize: '14px',
              margin: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontWeight: conversation.unread > 0 ? '500' : '400',
              maxWidth: conversation.unread > 0 ? '200px' : '230px',
            }}
          >
            {conversation.lastMessage}
          </p>
          {conversation.unread > 0 && (
            <div
              style={{
                minWidth: '22px',
                height: '22px',
                borderRadius: '11px',
                background: t.accent,
                color: '#fff',
                fontSize: '12px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 6px',
                boxShadow: `0 0 10px ${t.accentGlow}`,
              }}
            >
              {conversation.unread}
            </div>
          )}
        </div>
      </div>
    </div>
  )
})

// Phone Keyboard Component
function PhoneKeyboard({ onKeyPress, onBackspace, onSend, theme: t, inputValue }) {
  const [activeKey, setActiveKey] = useState(null)
  const [isShift, toggleShift, { setFalse: resetShift }] = useToggle(false)
  const [isSymbols, toggleSymbols] = useToggle(false)

  const letterRows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
  ]
  const symbolRows = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    ['-', '/', ':', ';', '(', ')', '$', '&', '@', '"'],
    ['.', ',', '?', '!', "'", '#', '%', '*'],
  ]
  const rows = isSymbols ? symbolRows : letterRows

  const handleKeyPress = (key) => {
    setActiveKey(key)
    onKeyPress(isShift && !isSymbols ? key : key.toLowerCase())
    if (isShift && !isSymbols) resetShift()
    setTimeout(() => setActiveKey(null), 100)
  }

  return (
    <div
      style={{
        background: t.keyboardBg,
        backdropFilter: 'blur(20px)',
        padding: '8px 3px 20px',
        borderTop: `1px solid ${t.cardBorder}`,
      }}
    >
      {rows.map((row, rowIndex) => (
        <div
          key={rowIndex}
          style={{ display: 'flex', justifyContent: 'center', gap: '5px', marginBottom: '8px' }}
        >
          {rowIndex === 2 && !isSymbols && (
            <button
              onClick={toggleShift}
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '8px',
                border: 'none',
                background: isShift ? t.accent : t.keyBg,
                color: isShift ? '#fff' : t.text,
                fontSize: '16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 1px 3px rgba(0,0,0,${t.isDark ? '0.3' : '0.1'})`,
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
            </button>
          )}
          {row.map((key) => (
            <button
              key={key}
              onClick={() => handleKeyPress(key)}
              style={{
                width: rowIndex === 0 ? '32px' : '35px',
                height: '42px',
                borderRadius: '8px',
                border: 'none',
                background: activeKey === key ? t.keyActive : t.keyBg,
                color: t.text,
                fontSize: '18px',
                fontWeight: '500',
                cursor: 'pointer',
                boxShadow: `0 1px 3px rgba(0,0,0,${t.isDark ? '0.3' : '0.1'})`,
                transform: activeKey === key ? 'scale(1.1)' : 'scale(1)',
                transition: 'all 0.1s ease',
              }}
            >
              {isShift && !isSymbols ? key : key.toLowerCase()}
            </button>
          ))}
          {rowIndex === 2 && (
            <button
              onClick={onBackspace}
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '8px',
                border: 'none',
                background: t.keyBg,
                color: t.text,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 1px 3px rgba(0,0,0,${t.isDark ? '0.3' : '0.1'})`,
              }}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 4H8l-7 8 7 8h13a2 2 0 002-2V6a2 2 0 00-2-2z" />
                <line x1="18" y1="9" x2="12" y2="15" />
                <line x1="12" y1="9" x2="18" y2="15" />
              </svg>
            </button>
          )}
        </div>
      ))}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '5px' }}>
        <button
          onClick={toggleSymbols}
          style={{
            width: '55px',
            height: '42px',
            borderRadius: '8px',
            border: 'none',
            background: t.keyBg,
            color: t.textMuted,
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: `0 1px 3px rgba(0,0,0,${t.isDark ? '0.3' : '0.1'})`,
          }}
        >
          {isSymbols ? 'ABC' : '123'}
        </button>
        <button
          onClick={() => onKeyPress(' ')}
          style={{
            flex: 1,
            maxWidth: '180px',
            height: '42px',
            borderRadius: '8px',
            border: 'none',
            background: t.keyBg,
            color: t.textMuted,
            fontSize: '14px',
            cursor: 'pointer',
            boxShadow: `0 1px 3px rgba(0,0,0,${t.isDark ? '0.3' : '0.1'})`,
          }}
        >
          space
        </button>
        <button
          onClick={onSend}
          disabled={!inputValue.trim()}
          style={{
            width: '70px',
            height: '42px',
            borderRadius: '8px',
            border: 'none',
            background: inputValue.trim() ? t.accent : t.keyBg,
            color: inputValue.trim() ? '#fff' : t.textMuted,
            fontSize: '14px',
            fontWeight: '600',
            cursor: inputValue.trim() ? 'pointer' : 'default',
            boxShadow: inputValue.trim()
              ? `0 4px 15px ${t.accentGlow}`
              : `0 1px 3px rgba(0,0,0,${t.isDark ? '0.3' : '0.1'})`,
          }}
        >
          Send
        </button>
      </div>
    </div>
  )
}

// Compose Modal Component
function ComposeModal({ open, onClose, theme: t, contacts, mode, onSend }) {
  const [message, setMessage] = useState('')
  const [recipients, setRecipients] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showTemplates, toggleTemplates, { setFalse: hideTemplates }] = useToggle(false)
  const [scheduledDate, setScheduledDate] = useState('')
  const [isRecording, , { setTrue: startRecording, setFalse: stopRecording }] = useToggle(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [attachments, setAttachments] = useState([])
  const fileInputRef = useRef(null)
  const recordingInterval = useRef(null)

  // Cleanup recording interval on unmount to prevent memory leak
  useEffect(() => {
    return () => {
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current)
      }
    }
  }, [])

  const filteredContacts = useMemo(() => {
    if (!searchQuery) return contacts.slice(0, 5)
    return contacts
      .filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, 5)
  }, [contacts, searchQuery])

  const handleStartRecording = () => {
    startRecording()
    setRecordingTime(0)
    recordingInterval.current = setInterval(() => setRecordingTime((t) => t + 1), 1000)
  }

  const handleStopRecording = () => {
    stopRecording()
    clearInterval(recordingInterval.current)
    setAttachments((prev) => [
      ...prev,
      {
        type: 'voice',
        name: `Voice note (${Math.floor(recordingTime / 60)}:${(recordingTime % 60).toString().padStart(2, '0')})`,
      },
    ])
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    setAttachments((prev) => [...prev, ...files.map((f) => ({ type: 'file', name: f.name }))])
  }

  const handleTemplateSelect = (template) => {
    setMessage(template.text)
    hideTemplates()
  }

  const handleSendMessage = () => {
    if (!message.trim() || recipients.length === 0) return
    onSend({ message, recipients, scheduledDate, attachments, mode })
    setMessage('')
    setRecipients([])
    setScheduledDate('')
    setAttachments([])
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
      <div style={{ padding: '60px 16px 16px', borderBottom: `1px solid ${t.cardBorder}` }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
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
            {mode === 'campaign' ? 'New Campaign' : 'New Message'}
          </h2>
          <button
            onClick={handleSendMessage}
            disabled={!message.trim() || recipients.length === 0}
            style={{
              background: 'none',
              border: 'none',
              color: message.trim() && recipients.length > 0 ? t.accent : t.textMuted,
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
            }}
          >
            Send
          </button>
        </div>

        {/* Recipients */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            alignItems: 'center',
            marginBottom: '12px',
          }}
        >
          <span style={{ color: t.textMuted, fontSize: '14px' }}>To:</span>
          {recipients.map((r) => (
            <span
              key={r.id}
              style={{
                background: t.cardBg,
                border: `1px solid ${t.cardBorder}`,
                borderRadius: '16px',
                padding: '4px 10px',
                fontSize: '13px',
                color: t.text,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {r.name}
              <button
                onClick={() => setRecipients((prev) => prev.filter((p) => p.id !== r.id))}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                }}
              >
                {Icons.x(t.textMuted)}
              </button>
            </span>
          ))}
        </div>

        {/* Contact Search */}
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '10px',
              border: `1px solid ${t.cardBorder}`,
              background: t.searchBg,
              color: t.text,
              fontSize: '15px',
              outline: 'none',
            }}
          />
          {searchQuery && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                background: t.isDark ? t.screenBg : '#fff',
                border: `1px solid ${t.cardBorder}`,
                borderRadius: '10px',
                marginTop: '4px',
                zIndex: 10,
                overflow: 'hidden',
              }}
            >
              {filteredContacts.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => {
                    setRecipients((prev) =>
                      prev.find((p) => p.id === contact.id) ? prev : [...prev, contact]
                    )
                    setSearchQuery('')
                  }}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'none',
                    border: 'none',
                    borderBottom: `1px solid ${t.cardBorder}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${getAvatarColor(contact.name, t.avatarColors)}, ${getAvatarColor(contact.name, t.avatarColors)}88)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontSize: '13px',
                      fontWeight: '600',
                    }}
                  >
                    {getInitials(contact.name)}
                  </div>
                  <div>
                    <div style={{ color: t.text, fontSize: '14px', fontWeight: '500' }}>
                      {contact.name}
                    </div>
                    <div style={{ color: t.textMuted, fontSize: '12px' }}>{contact.phone}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Message Area */}
      <div style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={
            mode === 'campaign'
              ? 'Type your campaign message... Use {name} for personalization'
              : 'Type your message...'
          }
          style={{
            width: '100%',
            height: '120px',
            padding: '12px',
            borderRadius: '12px',
            border: `1px solid ${t.cardBorder}`,
            background: t.searchBg,
            color: t.text,
            fontSize: '15px',
            outline: 'none',
            resize: 'none',
            lineHeight: '1.5',
          }}
        />

        {/* Attachments */}
        {attachments.length > 0 && (
          <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {attachments.map((att, i) => (
              <div
                key={i}
                style={{
                  background: t.cardBg,
                  border: `1px solid ${t.cardBorder}`,
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '12px',
                  color: t.text,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                {att.type === 'voice' ? Icons.mic(t.accent) : Icons.paperclip(t.accent)}
                {att.name}
                <button
                  onClick={() => setAttachments((prev) => prev.filter((_, idx) => idx !== i))}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  {Icons.x(t.textMuted)}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Scheduled Time */}
        {scheduledDate && (
          <div
            style={{
              marginTop: '12px',
              background: `${t.accent}22`,
              border: `1px solid ${t.accent}44`,
              borderRadius: '8px',
              padding: '10px 12px',
              fontSize: '13px',
              color: t.accent,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {Icons.clock(t.accent)}
            Scheduled for {new Date(scheduledDate).toLocaleString()}
            <button
              onClick={() => setScheduledDate('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: 'auto' }}
            >
              {Icons.x(t.accent)}
            </button>
          </div>
        )}

        {/* Templates Dropdown */}
        {showTemplates && (
          <div
            style={{
              marginTop: '12px',
              background: t.cardBg,
              border: `1px solid ${t.cardBorder}`,
              borderRadius: '12px',
              overflow: 'hidden',
            }}
          >
            {messageTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => handleTemplateSelect(template)}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'none',
                  border: 'none',
                  borderBottom: `1px solid ${t.cardBorder}`,
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    color: t.text,
                    fontSize: '14px',
                    fontWeight: '500',
                    marginBottom: '4px',
                  }}
                >
                  {template.name}
                </div>
                <div style={{ color: t.textMuted, fontSize: '12px' }}>{template.text}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Toolbar */}
      <div
        style={{
          padding: '12px 16px',
          borderTop: `1px solid ${t.cardBorder}`,
          background: t.navBg,
          backdropFilter: 'blur(20px)',
        }}
      >
        {isRecording ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: '#ef4444',
                animation: 'pulse 1s infinite',
              }}
            />
            <span style={{ color: '#ef4444', fontSize: '14px', fontWeight: '600' }}>
              {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
            </span>
            <button
              onClick={handleStopRecording}
              style={{
                marginLeft: 'auto',
                padding: '8px 16px',
                borderRadius: '20px',
                border: 'none',
                background: '#ef4444',
                color: '#fff',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {Icons.stop('#fff')} Stop
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              multiple
              accept="image/*,video/*"
              onChange={handleFileSelect}
            />
            <button
              onClick={handleStartRecording}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: `1px solid ${t.cardBorder}`,
                background: t.cardBg,
                color: t.text,
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {Icons.mic(t.accent)} Voice
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: `1px solid ${t.cardBorder}`,
                background: t.cardBg,
                color: t.text,
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {Icons.paperclip(t.accent)} Attach
            </button>
            <button
              onClick={toggleTemplates}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: `1px solid ${t.cardBorder}`,
                background: showTemplates ? t.accent : t.cardBg,
                color: showTemplates ? '#fff' : t.text,
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {Icons.template(showTemplates ? '#fff' : t.accent)} Templates
            </button>
            <button
              onClick={() => {
                const date = prompt('Enter date/time (YYYY-MM-DDTHH:MM)')
                if (date) setScheduledDate(date)
              }}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: `1px solid ${t.cardBorder}`,
                background: scheduledDate ? t.accent : t.cardBg,
                color: scheduledDate ? '#fff' : t.text,
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {Icons.clock(scheduledDate ? '#fff' : t.accent)} Schedule
            </button>
          </div>
        )}
      </div>
      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
    </div>
  )
}

export default function PhoneChatsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()

  const [theme, setTheme] = useState('cyanDark')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedChat, setSelectedChat] = useState(null)
  const [conversations, setConversations] = useState(mockConversations)
  const [inputValue, setInputValue] = useState('')
  const [showKeyboard, , { setTrue: openKeyboard, setFalse: hideKeyboard }] = useToggle(false)
  const [showCompose, , { setTrue: openComposeModal, setFalse: closeComposeModal }] =
    useToggle(false)
  const [composeMode, setComposeMode] = useState('direct')
  const [showMediaSheet, , { setTrue: openMediaSheet, setFalse: closeMediaSheet }] =
    useToggle(false)
  const [chatAttachments, setChatAttachments] = useState([])
  const messagesEndRef = useRef(null)

  // Tab state for Chats vs Scheduled
  const [activeTab, setActiveTab] = useState('chats')

  // TanStack Query for scheduled messages with caching
  const { data: scheduledMessages = [], isLoading: loadingScheduled } = useScheduledMessages(
    {},
    { enabled: activeTab === 'scheduled' }
  )

  // Mutation for canceling scheduled messages
  const cancelMessageMutation = useCancelScheduledMessage()

  // Window size for virtual list height calculation
  const { height: windowHeight } = useWindowSize()

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

  const filteredConversations = useMemo(() => {
    if (!searchQuery) return conversations
    return conversations.filter(
      (c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [conversations, searchQuery])

  // Memoized render function for VirtualList
  const renderConversationItem = useCallback(
    (conversation) => (
      <ConversationItem conversation={conversation} theme={t} onSelect={setSelectedChat} />
    ),
    [t]
  )

  // Calculate virtual list height (window height minus header/tabs/search area)
  const chatListHeight = Math.max(windowHeight - 260, 300)

  const selectedConversation = conversations.find((c) => c.id === selectedChat)
  const totalUnread = conversations.reduce((sum, c) => sum + c.unread, 0)

  // Mock contacts for compose
  const mockContacts = conversations
    .filter((c) => !c.isCampaign)
    .map((c) => ({ id: c.id, name: c.name, phone: c.phone }))

  useEffect(() => {
    if (selectedChat) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [selectedChat, selectedConversation?.messages])

  // Note: Scheduled messages are now loaded automatically by TanStack Query
  // when activeTab === 'scheduled' (via the enabled option in useScheduledMessages)

  const handleCancelScheduledMessage = (messageId) => {
    cancelMessageMutation.mutate(messageId, {
      onSuccess: () => toast.success('Scheduled message cancelled'),
      onError: () => toast.error('Failed to cancel message'),
    })
  }

  const formatScheduledTime = (isoString) => {
    const date = new Date(isoString)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const isTomorrow = date.toDateString() === tomorrow.toDateString()

    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    if (isToday) return `Today at ${timeStr}`
    if (isTomorrow) return `Tomorrow at ${timeStr}`
    return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${timeStr}`
  }

  const getStatusIcon = (status, large = false) => {
    const size = large ? 24 : 16
    switch (status) {
      case 'sent':
        return Icons.checkCircle('#fff', size)
      case 'failed':
        return Icons.alertCircle('#fff', size)
      case 'pending':
      case 'processing':
      default:
        return Icons.scheduled('#fff', size)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'sent':
        return '#22c55e'
      case 'failed':
        return '#ef4444'
      default:
        return t.accent
    }
  }

  const handleSendMessage = () => {
    if ((!inputValue.trim() && chatAttachments.length === 0) || !selectedChat) return
    const newMessage = {
      id: Date.now(),
      text: inputValue.trim(),
      sent: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
      attachments: chatAttachments.length > 0 ? [...chatAttachments] : undefined,
    }
    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedChat
          ? {
              ...c,
              messages: [...c.messages, newMessage],
              lastMessage:
                chatAttachments.length > 0 && !inputValue.trim()
                  ? '📎 Attachment'
                  : inputValue.trim(),
              time: 'Just now',
              unread: 0,
            }
          : c
      )
    )
    setInputValue('')
    setChatAttachments([])
  }

  const handleComposeSend = ({
    message,
    recipients,
    scheduledDate,
    attachments: _attachments,
    mode,
  }) => {
    // In real app, this would call TwilioService
    if (mode === 'campaign') {
      const newCampaign = {
        id: Date.now(),
        name: `Campaign to ${recipients.length} recipients`,
        phone: `Campaign - ${recipients.length} recipients`,
        lastMessage: message,
        time: scheduledDate
          ? `Scheduled: ${new Date(scheduledDate).toLocaleDateString()}`
          : 'Just now',
        unread: 0,
        online: false,
        isCampaign: true,
        messages: [{ id: 1, text: message, sent: true, time: 'Just now', status: 'sent' }],
      }
      setConversations((prev) => [newCampaign, ...prev])
    }
  }

  const handleBack = () => {
    setSelectedChat(null)
    hideKeyboard()
    setInputValue('')
  }

  const handleOpenCompose = (mode) => {
    setComposeMode(mode)
    openComposeModal()
  }

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
      {/* Compose Modal */}
      <ComposeModal
        open={showCompose}
        onClose={closeComposeModal}
        theme={t}
        contacts={mockContacts}
        mode={composeMode}
        onSend={handleComposeSend}
      />

      {/* INBOX VIEW */}
      {!selectedChat && !showCompose && (
        <>
          <div style={{ padding: '8px 20px 16px', paddingTop: 'env(safe-area-inset-top, 16px)' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
              }}
            >
              <h1
                style={{
                  color: t.text,
                  fontSize: '32px',
                  fontWeight: '700',
                  margin: 0,
                  letterSpacing: '-0.5px',
                }}
              >
                {activeTab === 'chats' ? 'Chats' : 'Scheduled'}{' '}
                {activeTab === 'chats' && totalUnread > 0 && (
                  <span
                    style={{
                      marginLeft: '10px',
                      fontSize: '16px',
                      fontWeight: '600',
                      color: t.accent,
                    }}
                  >
                    ({totalUnread})
                  </span>
                )}
              </h1>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleOpenCompose('campaign')}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    border: 'none',
                    background: t.cardBg,
                    color: t.accent,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  title="New Campaign"
                >
                  {Icons.megaphone(t.accent)}
                </button>
                <button
                  onClick={() => handleOpenCompose('direct')}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    border: 'none',
                    background: t.cardBg,
                    color: t.accent,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  title="New Message"
                >
                  {Icons.edit(t.accent)}
                </button>
              </div>
            </div>

            {/* Tab Buttons */}
            <div
              style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '16px',
              }}
            >
              <button
                onClick={() => setActiveTab('chats')}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  borderRadius: '10px',
                  border: `1px solid ${activeTab === 'chats' ? t.accent : t.cardBorder}`,
                  background: activeTab === 'chats' ? `${t.accent}22` : t.cardBg,
                  color: activeTab === 'chats' ? t.accent : t.textMuted,
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                Chats
                {totalUnread > 0 && (
                  <span
                    style={{
                      minWidth: '18px',
                      height: '18px',
                      borderRadius: '9px',
                      background: t.accent,
                      color: '#fff',
                      fontSize: '11px',
                      fontWeight: '700',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0 5px',
                    }}
                  >
                    {totalUnread}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('scheduled')}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  borderRadius: '10px',
                  border: `1px solid ${activeTab === 'scheduled' ? t.accent : t.cardBorder}`,
                  background: activeTab === 'scheduled' ? `${t.accent}22` : t.cardBg,
                  color: activeTab === 'scheduled' ? t.accent : t.textMuted,
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                {Icons.scheduled(activeTab === 'scheduled' ? t.accent : t.textMuted)}
                Scheduled
              </button>
            </div>

            {activeTab === 'chats' && (
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
                  placeholder="Search messages..."
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
              </div>
            )}
          </div>

          {/* Chats Tab Content - Using VirtualList for performance with large lists */}
          {activeTab === 'chats' && (
            <div style={{ padding: '0 12px' }}>
              <VirtualList
                items={filteredConversations}
                height={chatListHeight}
                itemHeight={85}
                renderItem={renderConversationItem}
              />
            </div>
          )}

          {/* Scheduled Tab Content */}
          <div
            style={{
              height: 'calc(100% - 260px)',
              overflowY: 'auto',
              padding: '0 12px',
              display: activeTab === 'scheduled' ? 'block' : 'none',
            }}
          >
            {activeTab === 'scheduled' && (
              <>
                {loadingScheduled ? (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      padding: '40px 20px',
                      color: t.textMuted,
                    }}
                  >
                    Loading scheduled messages...
                  </div>
                ) : scheduledMessages.length === 0 ? (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '60px 20px',
                      textAlign: 'center',
                    }}
                  >
                    <div
                      style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        background: t.cardBg,
                        border: `1px solid ${t.cardBorder}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '16px',
                      }}
                    >
                      {Icons.scheduled(t.textMuted)}
                    </div>
                    <h3
                      style={{
                        color: t.text,
                        fontSize: '18px',
                        fontWeight: '600',
                        margin: '0 0 8px',
                      }}
                    >
                      No Scheduled Messages
                    </h3>
                    <p
                      style={{
                        color: t.textMuted,
                        fontSize: '14px',
                        margin: 0,
                        maxWidth: '240px',
                        lineHeight: '1.5',
                      }}
                    >
                      Birthday automation messages will appear here when scheduled.
                    </p>
                  </div>
                ) : (
                  scheduledMessages.map((msg) => (
                    <div
                      key={msg.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '14px 8px',
                        borderRadius: '16px',
                        cursor: 'pointer',
                        borderBottom: `1px solid ${t.cardBorder}`,
                      }}
                    >
                      {/* Avatar - matching chat list size (56px) */}
                      <div
                        style={{
                          width: '56px',
                          height: '56px',
                          borderRadius: '50%',
                          background: `linear-gradient(135deg, ${getStatusColor(msg.status)}, ${getStatusColor(msg.status)}88)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          position: 'relative',
                        }}
                      >
                        {getStatusIcon(msg.status, true)}
                        {/* Status indicator dot */}
                        {msg.status === 'pending' && (
                          <div
                            style={{
                              position: 'absolute',
                              bottom: '2px',
                              right: '2px',
                              width: '14px',
                              height: '14px',
                              background: t.accent,
                              borderRadius: '50%',
                              border: `3px solid ${t.screenBg}`,
                              boxShadow: `0 0 8px ${t.accentGlow}`,
                            }}
                          />
                        )}
                      </div>

                      {/* Message Info - matching chat list structure */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '4px',
                          }}
                        >
                          <span
                            style={{
                              color: t.text,
                              fontSize: '16px',
                              fontWeight: '600',
                            }}
                          >
                            {msg.contact_name || msg.phone}
                          </span>
                          <span
                            style={{
                              color: getStatusColor(msg.status),
                              fontSize: '12px',
                              fontWeight: '500',
                            }}
                          >
                            {formatScheduledTime(msg.scheduled_for)}
                          </span>
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <p
                            style={{
                              color: t.textMuted,
                              fontSize: '14px',
                              margin: 0,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              fontWeight: '400',
                              maxWidth: msg.status === 'pending' ? '180px' : '230px',
                            }}
                          >
                            {msg.message_body}
                          </p>

                          {/* Status badge / Cancel button */}
                          {msg.status === 'pending' ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleCancelScheduledMessage(msg.id)
                              }}
                              style={{
                                background: 'none',
                                border: `1px solid ${t.cardBorder}`,
                                borderRadius: '8px',
                                padding: '4px 10px',
                                fontSize: '12px',
                                color: '#ef4444',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              {Icons.trash('#ef4444')}
                              Cancel
                            </button>
                          ) : (
                            <div
                              style={{
                                minWidth: 'auto',
                                padding: '2px 10px',
                                borderRadius: '11px',
                                background: `${getStatusColor(msg.status)}22`,
                                color: getStatusColor(msg.status),
                                fontSize: '11px',
                                fontWeight: '600',
                                textTransform: 'capitalize',
                              }}
                            >
                              {msg.status}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </>
            )}
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
              const badge = item.label === 'Chats' ? totalUnread : 0
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
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
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
                    {badge > 0 && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '-4px',
                          right: '-8px',
                          minWidth: '18px',
                          height: '18px',
                          borderRadius: '9px',
                          background: '#ef4444',
                          color: '#fff',
                          fontSize: '10px',
                          fontWeight: '700',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '0 4px',
                        }}
                      >
                        {badge}
                      </div>
                    )}
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

      {/* CHAT VIEW */}
      {selectedChat && selectedConversation && (
        <>
          <div
            style={{
              padding: '8px 16px 12px',
              borderBottom: `1px solid ${t.cardBorder}`,
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <button
              onClick={handleBack}
              style={{
                background: 'none',
                border: 'none',
                color: t.accent,
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {Icons.back(t.accent)}
            </button>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: selectedConversation.isCampaign
                  ? `linear-gradient(135deg, ${t.accent}, ${t.accentDark})`
                  : `linear-gradient(135deg, ${getAvatarColor(selectedConversation.name, t.avatarColors)}, ${getAvatarColor(selectedConversation.name, t.avatarColors)}88)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '14px',
                fontWeight: '600',
                position: 'relative',
              }}
            >
              {selectedConversation.isCampaign
                ? Icons.megaphone('#fff')
                : getInitials(selectedConversation.name)}
              {selectedConversation.online && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '0',
                    right: '0',
                    width: '10px',
                    height: '10px',
                    background: '#22c55e',
                    borderRadius: '50%',
                    border: `2px solid ${t.screenBg}`,
                  }}
                />
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: t.text, fontSize: '16px', fontWeight: '600' }}>
                {selectedConversation.name}
              </div>
              <div style={{ color: t.textMuted, fontSize: '12px' }}>
                {selectedConversation.online ? 'Active now' : selectedConversation.phone}
              </div>
            </div>
            {!selectedConversation.isCampaign && (
              <>
                <button
                  style={{
                    background: 'none',
                    border: 'none',
                    color: t.accent,
                    cursor: 'pointer',
                    padding: '8px',
                  }}
                >
                  {Icons.phone(t.accent)}
                </button>
                <button
                  style={{
                    background: 'none',
                    border: 'none',
                    color: t.accent,
                    cursor: 'pointer',
                    padding: '8px',
                  }}
                >
                  {Icons.video(t.accent)}
                </button>
              </>
            )}
          </div>

          <div
            style={{
              height: showKeyboard ? 'calc(100% - 340px)' : 'calc(100% - 170px)',
              overflowY: 'auto',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            {selectedConversation.messages.map((message) => (
              <div
                key={message.id}
                style={{
                  display: 'flex',
                  justifyContent: message.sent ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    maxWidth: '75%',
                    padding: '12px 16px',
                    borderRadius: message.sent ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                    background: message.sent ? t.sentBubble : t.receivedBubble,
                    color: message.sent ? '#fff' : t.text,
                    fontSize: '15px',
                    lineHeight: '1.4',
                    boxShadow: message.sent ? `0 4px 15px ${t.accentGlow}` : 'none',
                  }}
                >
                  {message.text}
                  <div
                    style={{
                      fontSize: '11px',
                      marginTop: '4px',
                      opacity: 0.7,
                      textAlign: 'right',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      gap: '4px',
                    }}
                  >
                    {message.time}
                    {message.sent && message.status === 'read' && (
                      <>
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          style={{ marginLeft: '-8px' }}
                        >
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      </>
                    )}
                    {message.sent && message.status === 'delivered' && (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              paddingBottom: 'env(safe-area-inset-bottom, 0px)',
            }}
          >
            {/* Attachment Preview */}
            {chatAttachments.length > 0 && (
              <div
                style={{
                  padding: '8px 12px',
                  background: t.navBg,
                  backdropFilter: 'blur(20px)',
                  borderBottom: `1px solid ${t.cardBorder}`,
                  display: 'flex',
                  gap: '8px',
                  overflowX: 'auto',
                }}
              >
                {chatAttachments.map((att, i) => (
                  <div
                    key={i}
                    style={{
                      position: 'relative',
                      width: '60px',
                      height: '60px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src={att.url}
                      alt=""
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                    <button
                      onClick={() =>
                        setChatAttachments((prev) => prev.filter((_, idx) => idx !== i))
                      }
                      style={{
                        position: 'absolute',
                        top: '2px',
                        right: '2px',
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: 'rgba(0,0,0,0.6)',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {Icons.x('#fff')}
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div
              style={{
                padding: '8px 12px',
                background: t.navBg,
                backdropFilter: 'blur(20px)',
                borderTop: `1px solid ${t.cardBorder}`,
                display: 'flex',
                alignItems: 'flex-end',
                gap: '8px',
              }}
            >
              <button
                onClick={openMediaSheet}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  border: 'none',
                  background: t.cardBg,
                  color: t.accent,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {Icons.plus(t.accent)}
              </button>
              <div
                onClick={openKeyboard}
                style={{
                  flex: 1,
                  minHeight: '36px',
                  maxHeight: '100px',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  background: t.searchBg,
                  border: `1px solid ${t.cardBorder}`,
                  color: inputValue ? t.text : t.textMuted,
                  fontSize: '15px',
                  cursor: 'text',
                  display: 'flex',
                  alignItems: 'center',
                  overflowY: 'auto',
                  wordBreak: 'break-word',
                }}
              >
                {inputValue || 'Message...'}
                {showKeyboard && (
                  <span
                    style={{
                      width: '2px',
                      height: '18px',
                      background: t.accent,
                      marginLeft: '1px',
                      animation: 'blink 1s infinite',
                    }}
                  />
                )}
              </div>
              {inputValue ? (
                <button
                  onClick={handleSendMessage}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    border: 'none',
                    background: t.accent,
                    color: '#fff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: `0 4px 15px ${t.accentGlow}`,
                  }}
                >
                  {Icons.send('#fff')}
                </button>
              ) : (
                <button
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    border: 'none',
                    background: t.cardBg,
                    color: t.accent,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {Icons.mic(t.accent)}
                </button>
              )}
            </div>
            {showKeyboard && (
              <PhoneKeyboard
                onKeyPress={(k) => setInputValue((p) => p + k)}
                onBackspace={() => setInputValue((p) => p.slice(0, -1))}
                onSend={handleSendMessage}
                theme={t}
                inputValue={inputValue}
              />
            )}

            {/* Media Attachment Sheet */}
            <MediaAttachmentSheet
              open={showMediaSheet}
              onClose={closeMediaSheet}
              onMediaSelected={(media) => {
                setChatAttachments((prev) => [...prev, ...media])
                closeMediaSheet()
              }}
              theme={t}
              userId={user?.id || 'demo-user'}
            />
          </div>
        </>
      )}
      <style>{`@keyframes blink { 0%, 50% { opacity: 1; } 51%, 100% { opacity: 0; } }`}</style>
    </div>
  )
}
