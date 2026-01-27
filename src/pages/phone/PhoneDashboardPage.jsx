import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/components/providers/AuthProvider'
import { mediaLibraryService } from '@/services/MediaLibraryService'
import { ComposeModal } from '@/components/common/ComposeModal'
import { useWindowSize } from '@/hooks/useWindowSize'
import { AIStudio } from '@/features/ai-studio'

// 4 Theme Options
const themes = {
  cyanDark: {
    name: 'Cyan Glow',
    bg: 'linear-gradient(145deg, #0a1628 0%, #0d1f35 50%, #0a1628 100%)',
    cardBg: 'rgba(6, 182, 212, 0.08)',
    cardBorder: 'rgba(6, 182, 212, 0.2)',
    accent: '#06b6d4',
    accentGlow: 'rgba(6, 182, 212, 0.4)',
    gradientStart: '#06b6d4',
    gradientEnd: '#0891b2',
    text: '#e2e8f0',
    textMuted: '#94a3b8',
    searchBg: 'rgba(6, 182, 212, 0.1)',
    navBg: 'rgba(6, 182, 212, 0.05)',
    isDark: true,
  },
  purpleDark: {
    name: 'Purple Glow',
    bg: 'linear-gradient(145deg, #1a0a28 0%, #2d1045 50%, #1a0a28 100%)',
    cardBg: 'rgba(168, 85, 247, 0.08)',
    cardBorder: 'rgba(168, 85, 247, 0.2)',
    accent: '#a855f7',
    accentGlow: 'rgba(168, 85, 247, 0.4)',
    gradientStart: '#a855f7',
    gradientEnd: '#9333ea',
    text: '#f3e8ff',
    textMuted: '#c4b5fd',
    searchBg: 'rgba(168, 85, 247, 0.1)',
    navBg: 'rgba(168, 85, 247, 0.05)',
    isDark: true,
  },
  cyanLight: {
    name: 'Soft Cyan',
    bg: 'linear-gradient(145deg, #ffffff 0%, #f0fdfa 50%, #ffffff 100%)',
    cardBg: 'rgba(6, 182, 212, 0.06)',
    cardBorder: 'rgba(6, 182, 212, 0.15)',
    accent: '#0891b2',
    accentGlow: 'rgba(6, 182, 212, 0.25)',
    gradientStart: '#06b6d4',
    gradientEnd: '#0891b2',
    text: '#164e63',
    textMuted: '#64748b',
    searchBg: 'rgba(6, 182, 212, 0.08)',
    navBg: 'rgba(255, 255, 255, 0.9)',
    isDark: false,
  },
  purpleLight: {
    name: 'Soft Purple',
    bg: 'linear-gradient(145deg, #ffffff 0%, #faf5ff 50%, #ffffff 100%)',
    cardBg: 'rgba(168, 85, 247, 0.06)',
    cardBorder: 'rgba(168, 85, 247, 0.15)',
    accent: '#9333ea',
    accentGlow: 'rgba(168, 85, 247, 0.25)',
    gradientStart: '#a855f7',
    gradientEnd: '#9333ea',
    text: '#581c87',
    textMuted: '#64748b',
    searchBg: 'rgba(168, 85, 247, 0.08)',
    navBg: 'rgba(255, 255, 255, 0.9)',
    isDark: false,
  },
}

// SVG Icons
const Icons = {
  megaphone: (color, size = 24) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 11l18-5v12L3 13v-2z" />
      <path d="M11.6 16.8a3 3 0 11-5.8-1.6" />
    </svg>
  ),
  users: (color, size = 24) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  ),
  messageCircle: (color, size = 24) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
    </svg>
  ),
  mail: (color, size = 24) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  ),
  rocket: (color, size = 24) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z" />
      <path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  ),
  check: (color, size = 24) => (
    <svg
      width={size}
      height={size}
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
  fileText: (color, size = 24) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  plus: (color, size = 24) => (
    <svg
      width={size}
      height={size}
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
  x: (color, size = 24) => (
    <svg
      width={size}
      height={size}
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
  upload: (color, size = 24) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  ),
  barChart: (color, size = 24) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="18" y1="20" x2="18" y2="4" />
      <line x1="6" y1="20" x2="6" y2="16" />
    </svg>
  ),
  tag: (color, size = 24) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  ),
  sparkles: (color, size = 24) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
      <path d="M5 19l.5 1.5L7 21l-1.5.5L5 23l-.5-1.5L3 21l1.5-.5L5 19z" />
      <path d="M19 11l.5 1.5L21 13l-1.5.5L19 15l-.5-1.5L17 13l1.5-.5L19 11z" />
    </svg>
  ),
  bell: (color, size = 24) => (
    <svg
      width={size}
      height={size}
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
  smartphone: (color, size = 24) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
    </svg>
  ),
  grid: (color, size = 24) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  ),
  type: (color, size = 24) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="4 7 4 4 20 4 20 7" />
      <line x1="9" y1="20" x2="15" y2="20" />
      <line x1="12" y1="4" x2="12" y2="20" />
    </svg>
  ),
  image: (color, size = 24) => (
    <svg
      width={size}
      height={size}
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
  video: (color, size = 24) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  ),
  layers: (color, size = 24) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  ),
  maximize: (color, size = 24) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" />
    </svg>
  ),
  sliders: (color, size = 24) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" y1="21" x2="4" y2="14" />
      <line x1="4" y1="10" x2="4" y2="3" />
      <line x1="12" y1="21" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12" y2="3" />
      <line x1="20" y1="21" x2="20" y2="16" />
      <line x1="20" y1="12" x2="20" y2="3" />
      <line x1="1" y1="14" x2="7" y2="14" />
      <line x1="9" y1="8" x2="15" y2="8" />
      <line x1="17" y1="16" x2="23" y2="16" />
    </svg>
  ),
  scissors: (color, size = 24) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <line x1="20" y1="4" x2="8.12" y2="15.88" />
      <line x1="14.47" y1="14.48" x2="20" y2="20" />
      <line x1="8.12" y1="8.12" x2="12" y2="12" />
    </svg>
  ),
  refreshCw: (color, size = 24) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
    </svg>
  ),
  eye: (color, size = 16) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  eyeOff: (color, size = 16) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ),
  download: (color, size = 18) => (
    <svg
      width={size}
      height={size}
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
  arrowLeft: (color, size = 24) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  ),
  arrowRight: (color, size = 18) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  ),
  info: (color, size = 14) => (
    <svg
      width={size}
      height={size}
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
}

const userData = {
  name: 'William',
  stats: { campaigns: 12, contacts: 156, messages: 1247, unread: 8 },
  recentCampaigns: [
    { id: 1, name: 'Summer Sale', status: 'active', sent: 45, delivered: 44 },
    { id: 2, name: 'New Product Launch', status: 'completed', sent: 120, delivered: 118 },
    { id: 3, name: 'Holiday Special', status: 'draft', sent: 0, delivered: 0 },
  ],
}

// Legacy AIStudioFullScreen was here - now using src/features/ai-studio/AIStudio.jsx
export default function PhoneDashboardPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user: _user } = useAuth()
  const { width } = useWindowSize()
  const isMobile = width < 768

  const [theme, setTheme] = useState('cyanDark')
  const [showAIStudio, setShowAIStudio] = useState(false)
  const [projectToOpen, setProjectToOpen] = useState(null)
  const [mediaLibrary, setMediaLibrary] = useState([])
  const [showComposeModal, setShowComposeModal] = useState(false)
  const [composeAttachment, setComposeAttachment] = useState(null)
  const t = themes[theme]

  // Check if navigating from MediaLibrary with a project to open
  useEffect(() => {
    if (location.state?.openProject) {
      setProjectToOpen(location.state.openProject)
      setShowAIStudio(true)
      // Clear the navigation state so refreshing doesn't re-open
      window.history.replaceState({}, document.title)
    }
  }, [location.state])

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

  // Load media library on mount
  useEffect(() => {
    loadMediaLibrary()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadMediaLibrary = async () => {
    const result = await mediaLibraryService.getMediaLibrary(_user?.id || 'demo-user', { limit: 6 })
    if (result.success) {
      setMediaLibrary(result.data)
    }
  }

  // Handle AI Studio export - save to media library
  const handleAIStudioExport = async (dataUrl, fileName) => {
    const result = await mediaLibraryService.uploadFromDataUrl(
      dataUrl,
      fileName,
      'ai-studio',
      _user?.id || 'demo-user'
    )
    if (result.success) {
      loadMediaLibrary() // Refresh the library
      return result.data
    }
    return null
  }

  // Handle sending as campaign from AI Studio
  const handleSendAsCampaign = (mediaAsset) => {
    setComposeAttachment(mediaAsset)
    setShowComposeModal(true)
    setShowAIStudio(false)
  }

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

  // Updated stats with Unread Messages instead of Delivered %
  const statItems = [
    {
      label: 'Campaigns',
      value: userData.stats.campaigns,
      icon: Icons.megaphone,
      color: '#a855f7',
    },
    { label: 'Contacts', value: userData.stats.contacts, icon: Icons.users, color: '#3b82f6' },
    {
      label: 'Messages',
      value: userData.stats.messages.toLocaleString(),
      icon: Icons.messageCircle,
      color: '#22c55e',
    },
    { label: 'Unread', value: userData.stats.unread, icon: Icons.mail, color: '#ef4444' },
  ]
  const quickActions = [
    { icon: Icons.plus, label: 'New Campaign' },
    { icon: Icons.upload, label: 'Import' },
    { icon: Icons.barChart, label: 'Analytics' },
  ]
  const getCampaignIcon = (s) =>
    s === 'active' ? Icons.rocket : s === 'completed' ? Icons.check : Icons.fileText
  const getCampaignColor = (s) =>
    s === 'active' ? '#22c55e' : s === 'completed' ? '#3b82f6' : '#9ca3af'

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
      {showAIStudio && (
        <AIStudio
          onClose={() => {
            setShowAIStudio(false)
            setProjectToOpen(null)
          }}
          onExport={handleAIStudioExport}
          onSendAsCampaign={handleSendAsCampaign}
          isMobile={isMobile}
          openProject={projectToOpen}
        />
      )}

      {/* Compose Modal for Campaign */}
      <ComposeModal
        open={showComposeModal}
        onClose={() => {
          setShowComposeModal(false)
          setComposeAttachment(null)
        }}
        theme={t}
        contacts={userData.recentCampaigns.map((c) => ({ id: c.id, name: c.name, phone: '' }))}
        mode="campaign"
        initialAttachments={
          composeAttachment
            ? [
                {
                  type: 'image',
                  name: composeAttachment.file_name || 'AI Studio Export',
                  url: composeAttachment.url,
                  id: composeAttachment.id,
                },
              ]
            : []
        }
        onSend={() => {
          setShowComposeModal(false)
          setComposeAttachment(null)
        }}
      />

      <div style={{ padding: '16px 20px 16px', paddingTop: 'env(safe-area-inset-top, 16px)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ color: t.textMuted, fontSize: '14px', margin: '0 0 4px' }}>Welcome back,</p>
            <h1 style={{ color: t.text, fontSize: '28px', fontWeight: '700', margin: 0 }}>
              {userData.name}
            </h1>
          </div>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${t.gradientStart}, ${t.gradientEnd})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '18px',
              fontWeight: '600',
              boxShadow: `0 4px 20px ${t.accentGlow}`,
            }}
          >
            {userData.name[0]}
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px', paddingBottom: '100px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            marginBottom: '20px',
          }}
        >
          {statItems.map((stat, i) => (
            <div
              key={i}
              style={{
                padding: '16px',
                borderRadius: '16px',
                background: t.cardBg,
                border: `1px solid ${t.cardBorder}`,
              }}
            >
              <div style={{ marginBottom: '12px' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    background: `${stat.color}22`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {stat.icon(stat.color, 20)}
                </div>
              </div>
              <p
                style={{
                  color: t.text,
                  fontSize: '24px',
                  fontWeight: '700',
                  margin: '0 0 4px',
                }}
              >
                {stat.value}
              </p>
              <p style={{ color: t.textMuted, fontSize: '12px', margin: 0 }}>{stat.label}</p>
            </div>
          ))}
        </div>

        <div
          onClick={() => {
            console.log('Opening AI Studio')
            setShowAIStudio(true)
          }}
          style={{
            padding: '20px',
            borderRadius: '20px',
            background: `linear-gradient(135deg, ${t.gradientStart}22, ${t.gradientEnd}22)`,
            border: `1px solid ${t.accent}44`,
            marginBottom: '20px',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '-50%',
              right: '-50%',
              width: '100%',
              height: '100%',
              background: `radial-gradient(circle, ${t.accentGlow} 0%, transparent 70%)`,
              opacity: 0.5,
            }}
          />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '16px',
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: `linear-gradient(135deg, ${t.gradientStart}, ${t.gradientEnd})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 8px 30px ${t.accentGlow}`,
                }}
              >
                {Icons.sparkles('#fff', 28)}
              </div>
              <span
                style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  background: t.accent,
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: '700',
                }}
              >
                NEW
              </span>
            </div>
            <h3 style={{ color: t.text, fontSize: '20px', fontWeight: '700', margin: '0 0 8px' }}>
              AI Studio
            </h3>
            <p
              style={{
                color: t.textMuted,
                fontSize: '13px',
                margin: '0 0 16px',
                lineHeight: '1.5',
              }}
            >
              Create stunning marketing images & videos with AI-powered tools
            </p>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: t.accent,
                fontSize: '14px',
                fontWeight: '600',
              }}
            >
              Open Studio {Icons.arrowRight(t.accent)}
            </div>
          </div>
        </div>

        {/* Media Library Section */}
        <div style={{ marginBottom: '20px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px',
            }}
          >
            <h3 style={{ color: t.text, fontSize: '16px', fontWeight: '600', margin: 0 }}>
              My Media
            </h3>
            <button
              onClick={() => navigate('/media-library')}
              style={{
                background: 'none',
                border: 'none',
                color: t.accent,
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              See all
            </button>
          </div>
          {mediaLibrary.length === 0 ? (
            <div
              style={{
                padding: '24px',
                borderRadius: '16px',
                background: t.cardBg,
                border: `1px solid ${t.cardBorder}`,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>📷</div>
              <p style={{ color: t.textMuted, fontSize: '13px', margin: 0 }}>
                No media yet. Create your first with AI Studio!
              </p>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '8px',
              }}
            >
              {mediaLibrary.slice(0, 6).map((media) => (
                <button
                  key={media.id}
                  onClick={() => navigate('/media-library')}
                  style={{
                    position: 'relative',
                    aspectRatio: '1',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
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
                  {media.source === 'ai-studio' && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        width: '20px',
                        height: '20px',
                        borderRadius: '4px',
                        background: `linear-gradient(135deg, ${t.gradientStart}, ${t.gradientEnd})`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {Icons.sparkles('#fff', 12)}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px',
            }}
          >
            <h3 style={{ color: t.text, fontSize: '16px', fontWeight: '600', margin: 0 }}>
              Recent Campaigns
            </h3>
            <button
              style={{
                background: 'none',
                border: 'none',
                color: t.accent,
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              See all
            </button>
          </div>
          {userData.recentCampaigns.map((campaign) => (
            <div
              key={campaign.id}
              style={{
                padding: '16px',
                borderRadius: '16px',
                background: t.cardBg,
                border: `1px solid ${t.cardBorder}`,
                marginBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: `${getCampaignColor(campaign.status)}22`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {getCampaignIcon(campaign.status)(getCampaignColor(campaign.status), 20)}
              </div>
              <div style={{ flex: 1 }}>
                <p
                  style={{
                    color: t.text,
                    fontSize: '14px',
                    fontWeight: '600',
                    margin: '0 0 4px',
                  }}
                >
                  {campaign.name}
                </p>
                <p style={{ color: t.textMuted, fontSize: '12px', margin: 0 }}>
                  {campaign.sent > 0 ? `${campaign.delivered}/${campaign.sent} delivered` : 'Draft'}
                </p>
              </div>
              <span
                style={{
                  padding: '4px 10px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: '600',
                  textTransform: 'capitalize',
                  background: `${getCampaignColor(campaign.status)}22`,
                  color: getCampaignColor(campaign.status),
                }}
              >
                {campaign.status}
              </span>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ color: t.text, fontSize: '16px', fontWeight: '600', margin: '0 0 12px' }}>
            Quick Actions
          </h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            {quickActions.map((action, i) => (
              <button
                key={i}
                style={{
                  flex: 1,
                  padding: '16px 12px',
                  borderRadius: '16px',
                  background: t.cardBg,
                  border: `1px solid ${t.cardBorder}`,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    background: `${t.accent}22`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {action.icon(t.accent, 20)}
                </div>
                <span style={{ color: t.text, fontSize: '11px', fontWeight: '500' }}>
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

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
    </div>
  )
}
