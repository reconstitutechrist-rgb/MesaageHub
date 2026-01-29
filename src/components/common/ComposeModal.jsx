import { useState, useRef, useMemo, useEffect } from 'react'
import { MediaAttachmentSheet } from './MediaAttachmentSheet'

/**
 * ComposeModal - Shared component for composing messages and campaigns
 * Used by PhoneChatsPage and PhoneDashboardPage (AI Studio)
 */

// SVG Icons
const Icons = {
  x: (color) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
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
  stop: (color) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={color}>
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  ),
  image: (color) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
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

// Helper functions
function getInitials(name) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function getAvatarColor(name, colors) {
  const hash = name.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0)
  return colors[hash % colors.length]
}

export function ComposeModal({
  open,
  onClose,
  theme,
  contacts = [],
  mode = 'direct',
  onSend,
  initialAttachments = [],
  initialMessage = '',
}) {
  const t = theme || {
    bg: '#ffffff',
    cardBg: '#f8f9fa',
    cardBorder: '#e5e7eb',
    accent: '#00bcd4',
    text: '#1a1a2e',
    textMuted: '#6b7280',
    searchBg: '#f3f4f6',
    navBg: '#ffffff',
    isDark: false,
    avatarColors: ['#06b6d4', '#0891b2', '#0e7490', '#155e75'],
    screenBg: '#f0fdfa',
  }

  const [message, setMessage] = useState(initialMessage)
  const [recipients, setRecipients] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showTemplates, setShowTemplates] = useState(false)
  const [scheduledDate, setScheduledDate] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [attachments, setAttachments] = useState(initialAttachments)
  const [showMediaSheet, setShowMediaSheet] = useState(false)
  const fileInputRef = useRef(null)
  const recordingInterval = useRef(null)

  // Cleanup recording interval on unmount or modal close
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
    setIsRecording(true)
    setRecordingTime(0)
    recordingInterval.current = setInterval(() => setRecordingTime((t) => t + 1), 1000)
  }

  const handleStopRecording = () => {
    setIsRecording(false)
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
    setAttachments((prev) => [
      ...prev,
      ...files.map((f) => ({ type: 'file', name: f.name, url: URL.createObjectURL(f) })),
    ])
  }

  const handleMediaSelected = (mediaItems) => {
    setAttachments((prev) => [
      ...prev,
      ...mediaItems.map((m) => ({
        type: m.type === 'video' ? 'video' : 'image',
        name: m.file_name || 'Media',
        url: m.url,
        id: m.id,
      })),
    ])
    setShowMediaSheet(false)
  }

  const handleTemplateSelect = (template) => {
    setMessage(template.text)
    setShowTemplates(false)
  }

  const handleSendMessage = () => {
    if (!message.trim() || recipients.length === 0) return
    onSend?.({ message, recipients, scheduledDate, attachments, mode })
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
                  padding: att.url ? '4px' : '8px 12px',
                  fontSize: '12px',
                  color: t.text,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  overflow: 'hidden',
                }}
              >
                {att.url && (att.type === 'image' || att.type === 'video') ? (
                  <img
                    src={att.url}
                    alt=""
                    style={{
                      width: '60px',
                      height: '60px',
                      objectFit: 'cover',
                      borderRadius: '4px',
                    }}
                  />
                ) : (
                  <>
                    {att.type === 'voice' ? Icons.mic(t.accent) : Icons.paperclip(t.accent)}
                    <span
                      style={{
                        maxWidth: '100px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {att.name}
                    </span>
                  </>
                )}
                <button
                  onClick={() => setAttachments((prev) => prev.filter((_, idx) => idx !== i))}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: att.url ? '4px' : 0,
                  }}
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
              onClick={() => setShowMediaSheet(true)}
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
              {Icons.image(t.accent)} Media
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
              {Icons.paperclip(t.accent)} File
            </button>
            <button
              onClick={() => setShowTemplates(!showTemplates)}
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

      {/* Media Attachment Sheet */}
      <MediaAttachmentSheet
        open={showMediaSheet}
        onClose={() => setShowMediaSheet(false)}
        onMediaSelected={handleMediaSelected}
        theme={t}
      />

      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
    </div>
  )
}

export default ComposeModal
