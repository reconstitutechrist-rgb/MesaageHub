import { useState, useRef, useEffect, useCallback } from 'react'
import { MarketingAIModal } from './MarketingAIModal'
import { mediaLibraryService } from '@/services/MediaLibraryService'

/**
 * MediaAttachmentSheet - Bottom sheet for attaching media to messages
 * Provides options: Take Photo, Photo Library, AI Studio
 */

// Icon components
const Icons = {
  camera: (color = '#000') => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  ),
  image: (color = '#000') => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  ),
  sparkles: (color = '#000') => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3v1m0 16v1m-8-9H3m18 0h-1M5.6 5.6l.7.7m12.4 12.4l.7.7M5.6 18.4l.7-.7M18 5.6l.7.7" />
      <path d="M12 8l1.5 3.5L17 13l-3.5 1.5L12 18l-1.5-3.5L7 13l3.5-1.5L12 8z" />
    </svg>
  ),
  x: (color = '#000') => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  check: (color = '#000') => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  play: (color = '#000') => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={color} stroke="none">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  ),
}

export function MediaAttachmentSheet({
  open,
  onClose,
  onMediaSelected,
  theme,
  userId = 'demo-user',
}) {
  const [view, setView] = useState('menu') // 'menu' | 'library' | 'ai-studio' | 'camera'
  const [mediaLibrary, setMediaLibrary] = useState([])
  const [selectedMedia, setSelectedMedia] = useState([])
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)

  // Default theme if not provided
  const t = theme || {
    bg: '#ffffff',
    cardBg: '#f8f9fa',
    text: '#1a1a2e',
    textSecondary: '#6b7280',
    accent: '#00bcd4',
    border: '#e5e7eb',
    isDark: false,
  }

  // Load media library function
  const loadMediaLibrary = useCallback(async () => {
    setLoading(true)
    const result = await mediaLibraryService.getMediaLibrary(userId)
    if (result.success) {
      setMediaLibrary(result.data)
    }
    setLoading(false)
  }, [userId])

  // Load media library when opening library view
  useEffect(() => {
    if (view === 'library') {
      loadMediaLibrary()
    }
  }, [view, loadMediaLibrary])

  // Reset on close
  useEffect(() => {
    if (!open) {
      setView('menu')
      setSelectedMedia([])
    }
  }, [open])

  const handleCameraCapture = () => {
    cameraInputRef.current?.click()
  }

  const handleCameraChange = async (e) => {
    const file = e.target.files?.[0]
    if (file) {
      // Upload to library
      const result = await mediaLibraryService.uploadMedia(file, 'camera', userId)
      if (result.success && onMediaSelected) {
        onMediaSelected([result.data])
      }
      onClose()
    }
  }

  const handleFileUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      setLoading(true)
      const uploaded = []
      for (const file of files) {
        const result = await mediaLibraryService.uploadMedia(file, 'upload', userId)
        if (result.success) {
          uploaded.push(result.data)
        }
      }
      if (uploaded.length > 0 && onMediaSelected) {
        onMediaSelected(uploaded)
      }
      setLoading(false)
      onClose()
    }
  }

  const toggleMediaSelection = (media) => {
    setSelectedMedia((prev) => {
      const exists = prev.find((m) => m.id === media.id)
      if (exists) {
        return prev.filter((m) => m.id !== media.id)
      }
      return [...prev, media]
    })
  }

  const handleConfirmSelection = () => {
    if (selectedMedia.length > 0 && onMediaSelected) {
      onMediaSelected(selectedMedia)
    }
    onClose()
  }

  const handleAIStudioComplete = (file) => {
    // File from AI Studio is already saved to library by the modal
    if (file && onMediaSelected) {
      onMediaSelected([
        {
          id: `ai-${Date.now()}`,
          url: URL.createObjectURL(file),
          type: 'image',
          source: 'ai-studio',
          file_name: file.name,
        },
      ])
    }
    setView('menu')
    onClose()
  }

  if (!open) return null

  // Render AI Studio modal
  if (view === 'ai-studio') {
    return (
      <MarketingAIModal
        open={true}
        onOpenChange={(isOpen) => {
          if (!isOpen) setView('menu')
        }}
        onImageGenerated={handleAIStudioComplete}
      />
    )
  }

  return (
    <>
      {/* Hidden file inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={handleCameraChange}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 100,
        }}
      />

      {/* Sheet */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          background: t.bg,
          borderTopLeftRadius: '20px',
          borderTopRightRadius: '20px',
          zIndex: 101,
          maxHeight: view === 'library' ? '70%' : 'auto',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideUp 0.3s ease-out',
        }}
      >
        {/* Handle bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            padding: '12px 0 8px',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '4px',
              borderRadius: '2px',
              background: t.border,
            }}
          />
        </div>

        {view === 'menu' && (
          <>
            {/* Menu Title */}
            <div
              style={{
                padding: '8px 20px 16px',
                fontSize: '18px',
                fontWeight: '600',
                color: t.text,
              }}
            >
              Add Attachment
            </div>

            {/* Menu Options */}
            <div style={{ padding: '0 16px 24px' }}>
              {/* Take Photo */}
              <button
                onClick={handleCameraCapture}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  width: '100%',
                  padding: '16px',
                  background: t.cardBg,
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  marginBottom: '8px',
                }}
              >
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: '#10b981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {Icons.camera('#fff')}
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div
                    style={{
                      fontSize: '16px',
                      fontWeight: '500',
                      color: t.text,
                    }}
                  >
                    Take Photo
                  </div>
                  <div
                    style={{
                      fontSize: '13px',
                      color: t.textSecondary,
                    }}
                  >
                    Capture with camera
                  </div>
                </div>
              </button>

              {/* Photo Library */}
              <button
                onClick={() => setView('library')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  width: '100%',
                  padding: '16px',
                  background: t.cardBg,
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  marginBottom: '8px',
                }}
              >
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: '#8b5cf6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {Icons.image('#fff')}
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div
                    style={{
                      fontSize: '16px',
                      fontWeight: '500',
                      color: t.text,
                    }}
                  >
                    Photo Library
                  </div>
                  <div
                    style={{
                      fontSize: '13px',
                      color: t.textSecondary,
                    }}
                  >
                    Choose from saved media
                  </div>
                </div>
              </button>

              {/* AI Studio */}
              <button
                onClick={() => setView('ai-studio')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  width: '100%',
                  padding: '16px',
                  background: t.cardBg,
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: `linear-gradient(135deg, ${t.accent}, #8b5cf6)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {Icons.sparkles('#fff')}
                </div>
                <div style={{ textAlign: 'left', flex: 1 }}>
                  <div
                    style={{
                      fontSize: '16px',
                      fontWeight: '500',
                      color: t.text,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    AI Studio
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: '600',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: t.accent,
                        color: '#fff',
                      }}
                    >
                      NEW
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: '13px',
                      color: t.textSecondary,
                    }}
                  >
                    Create AI marketing content
                  </div>
                </div>
              </button>

              {/* Upload from Device - alternative */}
              <button
                onClick={handleFileUpload}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '14px',
                  marginTop: '16px',
                  background: 'transparent',
                  border: `1px dashed ${t.border}`,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  color: t.textSecondary,
                  fontSize: '14px',
                }}
              >
                Or upload from device...
              </button>
            </div>
          </>
        )}

        {view === 'library' && (
          <>
            {/* Library Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 16px 16px',
              }}
            >
              <button
                onClick={() => setView('menu')}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px',
                  color: t.text,
                }}
              >
                {Icons.x(t.text)}
              </button>
              <span
                style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: t.text,
                }}
              >
                Media Library
              </span>
              {selectedMedia.length > 0 ? (
                <button
                  onClick={handleConfirmSelection}
                  style={{
                    background: t.accent,
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    cursor: 'pointer',
                    color: '#fff',
                    fontWeight: '500',
                  }}
                >
                  Add ({selectedMedia.length})
                </button>
              ) : (
                <div style={{ width: '80px' }} />
              )}
            </div>

            {/* Media Grid */}
            <div
              style={{
                flex: 1,
                overflow: 'auto',
                padding: '0 8px 24px',
              }}
            >
              {loading ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '40px',
                    color: t.textSecondary,
                  }}
                >
                  Loading...
                </div>
              ) : mediaLibrary.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '40px',
                    color: t.textSecondary,
                  }}
                >
                  <div style={{ marginBottom: '8px' }}>No media yet</div>
                  <button
                    onClick={handleFileUpload}
                    style={{
                      background: t.accent,
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px 20px',
                      cursor: 'pointer',
                    }}
                  >
                    Upload First Media
                  </button>
                </div>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '4px',
                  }}
                >
                  {mediaLibrary.map((media) => {
                    const isSelected = selectedMedia.find((m) => m.id === media.id)
                    return (
                      <button
                        key={media.id}
                        onClick={() => toggleMediaSelection(media)}
                        style={{
                          position: 'relative',
                          aspectRatio: '1',
                          border: isSelected ? `3px solid ${t.accent}` : 'none',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          cursor: 'pointer',
                          padding: 0,
                          background: t.cardBg,
                        }}
                      >
                        <img
                          src={media.thumbnail_url || media.url}
                          alt=""
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                        {media.type === 'video' && (
                          <div
                            style={{
                              position: 'absolute',
                              bottom: '4px',
                              left: '4px',
                              background: 'rgba(0,0,0,0.6)',
                              borderRadius: '4px',
                              padding: '2px 6px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            {Icons.play('#fff')}
                          </div>
                        )}
                        {media.source === 'ai-studio' && (
                          <div
                            style={{
                              position: 'absolute',
                              top: '4px',
                              right: '4px',
                              background: 'linear-gradient(135deg, #00bcd4, #8b5cf6)',
                              borderRadius: '4px',
                              padding: '2px 4px',
                            }}
                          >
                            {Icons.sparkles('#fff')}
                          </div>
                        )}
                        {isSelected && (
                          <div
                            style={{
                              position: 'absolute',
                              top: '4px',
                              left: '4px',
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              background: t.accent,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {Icons.check('#fff')}
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Animation keyframes */}
      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  )
}

export default MediaAttachmentSheet
