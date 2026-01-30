import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/components/providers/AuthProvider'
import {
  useMediaLibrary,
  useBatchDeleteMedia,
  useProjectsList,
  useDeleteProject,
} from '@/hooks/queries'
import { triggerHaptic } from '@/lib/haptics'
import { themes } from '@/constants/phoneThemes'

// SVG Icons
const Icons = {
  back: (color) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  ),
  trash: (color) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),
  check: (color) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  play: (color) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={color} stroke="none">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  ),
  sparkles: (color) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M12 3v1m0 16v1m-8-9H3m18 0h-1M5.6 5.6l.7.7m12.4 12.4l.7.7M5.6 18.4l.7-.7M18 5.6l.7.7" />
      <path d="M12 8l1.5 3.5L17 13l-3.5 1.5L12 18l-1.5-3.5L7 13l3.5-1.5L12 8z" />
    </svg>
  ),
  x: (color) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  download: (color) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
}

// Filter tabs
const filterTabs = [
  { id: 'all', label: 'All' },
  { id: 'images', label: 'Images' },
  { id: 'videos', label: 'Videos' },
  { id: 'projects', label: 'Projects' },
]

export default function MediaLibraryPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const userId = user?.id || 'demo-user'

  const [theme, setTheme] = useState('cyanDark')
  const [activeFilter, setActiveFilter] = useState('all')
  const [selectMode, setSelectMode] = useState(false)
  const [selectedItems, setSelectedItems] = useState([])
  const [previewItem, setPreviewItem] = useState(null)

  const t = themes[theme]

  // TanStack Query hooks for data fetching with caching
  const { data: mediaItems = [], isLoading: mediaLoading } = useMediaLibrary(userId)

  const { data: projectsResult, isLoading: projectsLoading } = useProjectsList(userId)

  const projects = projectsResult?.data || []

  // Mutations for delete operations
  const batchDeleteMutation = useBatchDeleteMedia()
  const deleteProjectMutation = useDeleteProject()

  // Combined loading state
  const loading = mediaLoading || projectsLoading

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

  const filteredMedia = useMemo(() => {
    if (activeFilter === 'projects') return [] // Projects shown separately
    switch (activeFilter) {
      case 'images':
        return mediaItems.filter((m) => m.type === 'image')
      case 'videos':
        return mediaItems.filter((m) => m.type === 'video')
      default:
        return mediaItems
    }
  }, [mediaItems, activeFilter])

  const handleOpenProject = (project) => {
    // Navigate to AI Studio with project data
    navigate('/dashboard', { state: { openProject: project } })
  }

  const handleDeleteProject = (projectId) => {
    if (!confirm('Delete this project?')) return
    deleteProjectMutation.mutate({ projectId, userId })
  }

  const toggleSelectItem = (item) => {
    setSelectedItems((prev) => {
      const exists = prev.find((i) => i.id === item.id)
      if (exists) {
        return prev.filter((i) => i.id !== item.id)
      }
      return [...prev, item]
    })
  }

  const handleDeleteSelected = () => {
    if (selectedItems.length === 0) return
    if (!confirm(`Delete ${selectedItems.length} item(s)?`)) return

    batchDeleteMutation.mutate(
      { items: selectedItems, userId },
      {
        onSuccess: () => {
          setSelectedItems([])
          setSelectMode(false)
        },
      }
    )
  }

  const handleDownload = (item) => {
    const link = document.createElement('a')
    link.href = item.url
    link.download = item.file_name || 'download'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

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
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
      label: 'Contacts',
      path: '/contacts',
    },
    {
      icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
      label: 'Settings',
      path: '/settings',
    },
  ]

  return (
    <div
      style={{
        minHeight: '100vh',
        height: '100vh',
        background: t.bg,
        transition: 'background-color 0.3s ease',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '8px 16px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            marginLeft: '-8px',
          }}
        >
          {Icons.back(t.accent)}
        </button>
        <h1 style={{ flex: 1, color: t.text, fontSize: '20px', fontWeight: '700', margin: 0 }}>
          Media Library
        </h1>
        {selectMode ? (
          <button
            onClick={() => {
              setSelectMode(false)
              setSelectedItems([])
            }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: t.accent,
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            Cancel
          </button>
        ) : (
          <button
            onClick={() => setSelectMode(true)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: t.accent,
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            Select
          </button>
        )}
      </div>

      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          paddingBottom: '100px',
          contain: 'layout style paint',
        }}
      >
        {/* Filter Tabs */}
        <div
          style={{
            display: 'flex',
            padding: '0 16px 12px',
            gap: '8px',
            overflowX: 'auto',
          }}
        >
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: 'none',
                background: activeFilter === tab.id ? t.accent : t.cardBg,
                color: activeFilter === tab.id ? '#fff' : t.text,
                fontSize: '13px',
                fontWeight: '500',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Media Grid / Projects Grid */}
        <div style={{ flex: 1, overflow: 'auto', padding: '0 8px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: t.textMuted }}>
              Loading...
            </div>
          ) : activeFilter === 'projects' ? (
            // Projects Grid
            projects.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', color: t.textMuted }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>🎨</div>
                <div>No saved projects</div>
                <div style={{ fontSize: '12px', marginTop: '8px' }}>
                  Create designs in AI Studio and save them here
                </div>
              </div>
            ) : (
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '8px' }}
              >
                {projects.map((project) => (
                  <div
                    key={project.id}
                    style={{
                      display: 'flex',
                      background: t.cardBg,
                      border: `1px solid ${t.cardBorder}`,
                      borderRadius: '12px',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Project Thumbnail */}
                    <button
                      onClick={() => handleOpenProject(project)}
                      style={{
                        width: '80px',
                        height: '80px',
                        background: project.thumbnail_url
                          ? `url(${project.thumbnail_url}) center/cover`
                          : `linear-gradient(135deg, ${t.accent}33, ${t.accent}11)`,
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {!project.thumbnail_url && Icons.sparkles(t.accent)}
                    </button>

                    {/* Project Info */}
                    <button
                      onClick={() => handleOpenProject(project)}
                      style={{
                        flex: 1,
                        padding: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        gap: '4px',
                        textAlign: 'left',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <div
                        style={{
                          color: t.text,
                          fontSize: '14px',
                          fontWeight: '600',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {project.name}
                      </div>
                      <div style={{ color: t.textMuted, fontSize: '12px' }}>
                        {project.platform_preset?.replace(/-/g, ' ') || 'Custom'}
                      </div>
                      <div style={{ color: t.textMuted, fontSize: '11px' }}>
                        {new Date(project.updated_at).toLocaleDateString()}
                      </div>
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteProject(project.id)
                      }}
                      style={{
                        width: '44px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        opacity: 0.6,
                      }}
                    >
                      {Icons.trash(t.textMuted)}
                    </button>
                  </div>
                ))}
              </div>
            )
          ) : filteredMedia.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: t.textMuted }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>📷</div>
              <div>No media found</div>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '4px',
              }}
            >
              {filteredMedia.map((item) => {
                const isSelected = selectedItems.find((i) => i.id === item.id)
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (selectMode) {
                        toggleSelectItem(item)
                      } else {
                        setPreviewItem(item)
                      }
                    }}
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
                      src={item.thumbnail_url || item.url}
                      alt=""
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                    {item.type === 'video' && (
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'rgba(0,0,0,0.3)',
                        }}
                      >
                        {Icons.play('#fff')}
                      </div>
                    )}
                    {item.source === 'ai-studio' && (
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
                    {selectMode && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '4px',
                          left: '4px',
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: isSelected ? t.accent : 'rgba(255,255,255,0.8)',
                          border: isSelected ? 'none' : `2px solid ${t.textMuted}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {isSelected && Icons.check('#fff')}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Select Mode Actions */}
        {selectMode && selectedItems.length > 0 && (
          <div
            style={{
              padding: '12px 16px',
              background: t.navBg,
              backdropFilter: 'blur(20px)',
              borderTop: `1px solid ${t.cardBorder}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ color: t.text, fontSize: '14px' }}>{selectedItems.length} selected</span>
            <button
              onClick={handleDeleteSelected}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '20px',
                border: 'none',
                background: '#ef4444',
                color: '#fff',
                fontSize: '13px',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              {Icons.trash('#fff')} Delete
            </button>
          </div>
        )}
      </div>

      {/* Bottom Nav */}
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
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => {
              triggerHaptic('light')
              navigate(item.path)
            }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke={t.textMuted}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d={item.icon} />
            </svg>
            <span style={{ fontSize: '10px', color: t.textMuted }}>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Preview Modal */}
      {previewItem && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.9)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={() => setPreviewItem(null)}
        >
          <button
            onClick={() => setPreviewItem(null)}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '50%',
              padding: '12px',
              cursor: 'pointer',
            }}
          >
            {Icons.x('#fff')}
          </button>
          <img
            src={previewItem.url}
            alt=""
            style={{
              maxWidth: '90%',
              maxHeight: '70%',
              objectFit: 'contain',
              borderRadius: '8px',
            }}
            onClick={(e) => e.stopPropagation()}
          />
          <div
            style={{
              marginTop: '20px',
              display: 'flex',
              gap: '16px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => handleDownload(previewItem)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                borderRadius: '24px',
                border: 'none',
                background: t.accent,
                color: '#fff',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              {Icons.download('#fff')} Download
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
