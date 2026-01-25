import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/components/providers/AuthProvider'
import { mediaLibraryService } from '@/services/MediaLibraryService'
import { aiService } from '@/services/AIService'
import { ComposeModal } from '@/components/common/ComposeModal'
import { useWindowSize } from '@/hooks/useWindowSize'
import { useLayerManager, LayerType } from '@/hooks/useLayerManager'
import {
  platformPresets,
  platformCategories,
  marketingTemplates,
  templateCategories,
  gradientPresets,
  scaleToFit,
} from '@/lib/platformTemplates'

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

// Full Screen AI Studio
function AIStudioFullScreen({ theme: t, onClose, onExport, onSendAsCampaign }) {
  const { width, height } = useWindowSize()
  const isMobile = width < 768
  const canvasRef = useRef(null)
  const [image, setImage] = useState(null)
  const [activeTab, setActiveTab] = useState('image')
  const [mobileControlTab, setMobileControlTab] = useState('upload') // upload, ai, text, templates
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [showExportOptions, setShowExportOptions] = useState(false)
  const [savedMediaAsset, setSavedMediaAsset] = useState(null)
  const [textOverlay, setTextOverlay] = useState({
    text: '',
    x: 400,
    y: 300,
    color: '#ffffff',
    fontSize: 48,
    isDragging: false,
  })
  const [_selectedTemplate, _setSelectedTemplate] = useState(null)

  // Multi-layer support for additional text layers
  const {
    layers: additionalLayers,
    selectedLayerId,
    addTextLayer,
    removeLayer,
    updateLayer: _updateLayer,
    selectLayer,
    clearSelection: _clearSelection,
    toggleLayerVisibility,
  } = useLayerManager([])

  // Platform preset state
  const [selectedPlatform, setSelectedPlatform] = useState('instagram-post')
  const [showPlatformPicker, setShowPlatformPicker] = useState(false)
  const currentPreset = platformPresets[selectedPlatform]

  // Calculate canvas display dimensions based on selected platform
  // The actual export will use full resolution, but display is scaled to fit
  const maxDisplayWidth = isMobile ? width - 32 : 600
  const maxDisplayHeight = isMobile ? height - 360 : 500
  const scaledDimensions = scaleToFit(
    currentPreset.width,
    currentPreset.height,
    maxDisplayWidth,
    maxDisplayHeight
  )

  // Use scaled dimensions for display, but store full resolution for export
  const canvasWidth = scaledDimensions.width
  const canvasHeight = scaledDimensions.height
  const exportWidth = currentPreset.width
  const exportHeight = currentPreset.height

  // Marketing template state
  const [activeMarketingTemplate, setActiveMarketingTemplate] = useState(null)
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false)
  const [templateCategory, setTemplateCategory] = useState('all')
  const [canvasBackground, setCanvasBackground] = useState(null) // { type: 'solid' | 'gradient', value: string | string[] }

  const textColors = ['#ffffff', '#000000', '#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7']

  // Filter marketing templates by category
  const filteredTemplates =
    templateCategory === 'all'
      ? marketingTemplates
      : marketingTemplates.filter((t) => t.category === templateCategory)

  // Draw background (solid, gradient, or default)
  const drawBackground = (ctx, width, height) => {
    if (canvasBackground) {
      if (canvasBackground.type === 'gradient' && Array.isArray(canvasBackground.value)) {
        const gradient = ctx.createLinearGradient(0, 0, width, height)
        gradient.addColorStop(0, canvasBackground.value[0])
        gradient.addColorStop(1, canvasBackground.value[1])
        ctx.fillStyle = gradient
      } else {
        ctx.fillStyle = canvasBackground.value
      }
    } else {
      ctx.fillStyle = t.isDark ? '#1a1a2e' : '#f1f5f9'
    }
    ctx.fillRect(0, 0, width, height)
  }

  // Draw template elements on canvas
  const drawTemplateElements = (ctx, template, width, height) => {
    if (!template || !template.elements) return

    template.elements.forEach((element) => {
      if (element.type === 'background') {
        if (element.style === 'gradient' && element.colors) {
          const gradient = ctx.createLinearGradient(0, 0, width, height)
          gradient.addColorStop(0, element.colors[0])
          gradient.addColorStop(1, element.colors[1])
          ctx.fillStyle = gradient
          ctx.fillRect(0, 0, width, height)
        } else if (element.style === 'solid' && element.color) {
          ctx.fillStyle = element.color
          ctx.fillRect(0, 0, width, height)
        }
      } else if (element.type === 'text') {
        const fontSize = (element.fontSize / 1080) * width // Scale font relative to canvas
        ctx.font = `${element.fontWeight || 'bold'} ${fontSize}px -apple-system, BlinkMacSystemFont, sans-serif`
        ctx.fillStyle = element.color || '#ffffff'
        ctx.textAlign = 'center'
        ctx.shadowColor = 'rgba(0,0,0,0.3)'
        ctx.shadowBlur = 4

        // Calculate position
        const x =
          element.position?.x === 'center'
            ? width / 2
            : (parseFloat(element.position?.x) / 100) * width
        const y = (parseFloat(element.position?.y) / 100) * height

        ctx.fillText(element.content, x, y)
        ctx.shadowBlur = 0
      }
    })
  }

  useEffect(() => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    // Draw background first
    drawBackground(ctx, canvas.width, canvas.height)

    // If we have an active marketing template (and no image), draw it
    if (activeMarketingTemplate && !image) {
      drawTemplateElements(ctx, activeMarketingTemplate, canvas.width, canvas.height)
    } else if (image) {
      // Draw uploaded image
      const img = new Image()
      img.src = URL.createObjectURL(image)
      img.onload = () => {
        const scale = Math.min(canvas.width / img.width, canvas.height / img.height)
        const x = (canvas.width - img.width * scale) / 2
        const y = (canvas.height - img.height * scale) / 2
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale)
        drawText(ctx)
      }
    } else if (!activeMarketingTemplate) {
      // Draw grid pattern when no image or template
      ctx.strokeStyle = t.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'
      ctx.lineWidth = 1
      const gridSize = isMobile ? 30 : 40
      for (let i = 0; i < canvas.width; i += gridSize) {
        ctx.beginPath()
        ctx.moveTo(i, 0)
        ctx.lineTo(i, canvas.height)
        ctx.stroke()
      }
      for (let i = 0; i < canvas.height; i += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, i)
        ctx.lineTo(canvas.width, i)
        ctx.stroke()
      }
    }

    // Always draw text overlay on top
    drawText(ctx)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    image,
    textOverlay,
    t,
    canvasWidth,
    canvasHeight,
    isMobile,
    activeMarketingTemplate,
    canvasBackground,
    additionalLayers,
    selectedLayerId,
  ])

  const drawText = (ctx) => {
    // Draw primary text overlay
    if (textOverlay.text) {
      ctx.font = `bold ${textOverlay.fontSize}px -apple-system, BlinkMacSystemFont, sans-serif`
      ctx.fillStyle = textOverlay.color
      ctx.shadowColor = 'rgba(0,0,0,0.5)'
      ctx.shadowBlur = 8
      ctx.shadowOffsetX = 2
      ctx.shadowOffsetY = 2
      ctx.textAlign = 'center'
      ctx.fillText(textOverlay.text, textOverlay.x, textOverlay.y)
      ctx.shadowBlur = 0
    }

    // Draw additional text layers
    additionalLayers.forEach((layer) => {
      if (layer.type !== LayerType.TEXT || !layer.visible || !layer.data.text) return

      const x = (layer.data.x / 100) * canvasWidth
      const y = (layer.data.y / 100) * canvasHeight

      ctx.font = `${layer.data.fontWeight || 'bold'} ${layer.data.fontSize}px -apple-system, BlinkMacSystemFont, sans-serif`
      ctx.fillStyle = layer.data.color
      ctx.shadowColor = 'rgba(0,0,0,0.5)'
      ctx.shadowBlur = 8
      ctx.shadowOffsetX = 2
      ctx.shadowOffsetY = 2
      ctx.textAlign = 'center'
      ctx.fillText(layer.data.text, x, y)
      ctx.shadowBlur = 0

      // Draw selection indicator if selected
      if (layer.id === selectedLayerId) {
        const metrics = ctx.measureText(layer.data.text)
        ctx.strokeStyle = t.accent
        ctx.lineWidth = 2
        ctx.setLineDash([5, 5])
        ctx.strokeRect(
          x - metrics.width / 2 - 10,
          y - layer.data.fontSize / 2 - 10,
          metrics.width + 20,
          layer.data.fontSize + 20
        )
        ctx.setLineDash([])
      }
    })
  }

  const handleGenerate = async () => {
    if (!prompt) return
    setIsGenerating(true)
    try {
      const result = await aiService.generateMarketingCopy(prompt)

      if (result.success) {
        setTextOverlay((prev) => ({
          ...prev,
          text: result.data.headline,
          color: result.data.suggestedColor || prev.color,
        }))
      } else {
        // Fallback to simple uppercase if service fails
        setTextOverlay((prev) => ({
          ...prev,
          text: prompt.toUpperCase(),
        }))
      }
    } catch {
      // Fallback on error
      setTextOverlay((prev) => ({
        ...prev,
        text: prompt.toUpperCase(),
      }))
    } finally {
      setIsGenerating(false)
    }
  }

  const handleMouseDown = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY
    if (Math.sqrt(Math.pow(x - textOverlay.x, 2) + Math.pow(y - textOverlay.y, 2)) < 150) {
      setTextOverlay((prev) => ({ ...prev, isDragging: true }))
    }
  }

  const handleMouseMove = (e) => {
    if (!textOverlay.isDragging) return
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    setTextOverlay((prev) => ({
      ...prev,
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
    }))
  }

  const handleExport = async () => {
    // Create a high-resolution export canvas at full platform dimensions
    const exportCanvas = document.createElement('canvas')
    exportCanvas.width = exportWidth
    exportCanvas.height = exportHeight
    const exportCtx = exportCanvas.getContext('2d')

    // Scale up from display canvas to export resolution
    const scaleX = exportWidth / canvasWidth
    const scaleY = exportHeight / canvasHeight

    // Draw background
    if (canvasBackground) {
      if (canvasBackground.type === 'gradient' && Array.isArray(canvasBackground.value)) {
        const gradient = exportCtx.createLinearGradient(0, 0, exportWidth, exportHeight)
        gradient.addColorStop(0, canvasBackground.value[0])
        gradient.addColorStop(1, canvasBackground.value[1])
        exportCtx.fillStyle = gradient
      } else {
        exportCtx.fillStyle = canvasBackground.value
      }
    } else {
      exportCtx.fillStyle = t.isDark ? '#1a1a2e' : '#f1f5f9'
    }
    exportCtx.fillRect(0, 0, exportWidth, exportHeight)

    // Draw marketing template if active (and no image)
    if (activeMarketingTemplate && !image) {
      drawTemplateElements(exportCtx, activeMarketingTemplate, exportWidth, exportHeight)
    }

    // Draw image if present
    if (image) {
      const img = new Image()
      img.src = URL.createObjectURL(image)
      await new Promise((resolve) => {
        img.onload = () => {
          const scale = Math.min(exportWidth / img.width, exportHeight / img.height)
          const x = (exportWidth - img.width * scale) / 2
          const y = (exportHeight - img.height * scale) / 2
          exportCtx.drawImage(img, x, y, img.width * scale, img.height * scale)
          resolve()
        }
      })
    }

    // Draw text overlay at scaled position
    if (textOverlay.text) {
      const scaledFontSize = textOverlay.fontSize * scaleX
      exportCtx.font = `bold ${scaledFontSize}px -apple-system, BlinkMacSystemFont, sans-serif`
      exportCtx.fillStyle = textOverlay.color
      exportCtx.shadowColor = 'rgba(0,0,0,0.5)'
      exportCtx.shadowBlur = 8 * scaleX
      exportCtx.shadowOffsetX = 2 * scaleX
      exportCtx.shadowOffsetY = 2 * scaleY
      exportCtx.textAlign = 'center'
      exportCtx.fillText(textOverlay.text, textOverlay.x * scaleX, textOverlay.y * scaleY)
    }

    // Draw additional text layers at scaled positions
    additionalLayers.forEach((layer) => {
      if (layer.type !== LayerType.TEXT || !layer.visible || !layer.data.text) return

      const x = (layer.data.x / 100) * exportWidth
      const y = (layer.data.y / 100) * exportHeight
      const scaledFontSize = layer.data.fontSize * scaleX

      exportCtx.font = `${layer.data.fontWeight || 'bold'} ${scaledFontSize}px -apple-system, BlinkMacSystemFont, sans-serif`
      exportCtx.fillStyle = layer.data.color
      exportCtx.shadowColor = 'rgba(0,0,0,0.5)'
      exportCtx.shadowBlur = 8 * scaleX
      exportCtx.shadowOffsetX = 2 * scaleX
      exportCtx.shadowOffsetY = 2 * scaleY
      exportCtx.textAlign = 'center'
      exportCtx.fillText(layer.data.text, x, y)
    })

    const dataUrl = exportCanvas.toDataURL('image/png')
    const platformLabel = currentPreset.label.toLowerCase().replace(/\s+/g, '-')
    const templateName = activeMarketingTemplate ? `-${activeMarketingTemplate.id}` : ''
    const fileName = `ai-studio-${platformLabel}${templateName}-${Date.now()}.png`

    // Save to media library
    if (onExport) {
      const savedAsset = await onExport(dataUrl, fileName)
      if (savedAsset) {
        setSavedMediaAsset(savedAsset)
        setShowExportOptions(true)
        return
      }
    }

    // Fallback: direct download
    exportCanvas.toBlob((blob) => {
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = fileName
      a.click()
    })
  }

  const handleDownload = () => {
    canvasRef.current.toBlob((blob) => {
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `ai-studio-${Date.now()}.png`
      a.click()
    })
    setShowExportOptions(false)
  }

  const handleSendCampaign = () => {
    if (savedMediaAsset && onSendAsCampaign) {
      onSendAsCampaign(savedMediaAsset)
    }
    setShowExportOptions(false)
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: t.isDark ? 'rgba(0,0,0,0.95)' : 'rgba(255,255,255,0.98)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
        overflow: 'hidden',
        borderRadius: 'inherit',
      }}
    >
      {/* Header - Compact on mobile */}
      <div
        style={{
          padding: isMobile ? '12px 16px' : '16px 24px',
          paddingTop: isMobile ? 'env(safe-area-inset-top, 12px)' : '16px',
          borderBottom: `1px solid ${t.cardBorder}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: t.navBg,
          backdropFilter: 'blur(20px)',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={onClose}
            style={{
              width: '44px',
              height: '44px',
              background: t.cardBg,
              border: `1px solid ${t.cardBorder}`,
              borderRadius: '12px',
              color: t.text,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {Icons.arrowLeft(t.text)}
          </button>
          <h1
            style={{
              color: t.text,
              fontSize: isMobile ? '18px' : '24px',
              fontWeight: '700',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span
              style={{
                background: `linear-gradient(135deg, ${t.gradientStart}, ${t.gradientEnd})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              AI Studio
            </span>
            {!isMobile && (
              <span
                style={{
                  fontSize: '10px',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  background: t.cardBg,
                  border: `1px solid ${t.cardBorder}`,
                  color: t.accent,
                  fontWeight: '600',
                }}
              >
                BETA
              </span>
            )}
          </h1>
        </div>
        {!isMobile && (
          <div
            style={{
              display: 'flex',
              gap: '4px',
              background: t.cardBg,
              padding: '4px',
              borderRadius: '12px',
              border: `1px solid ${t.cardBorder}`,
            }}
          >
            {[
              { id: 'image', icon: Icons.image },
              { id: 'video', icon: Icons.video },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '8px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  background: activeTab === tab.id ? t.accent : 'transparent',
                  color: activeTab === tab.id ? '#fff' : t.textMuted,
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                {tab.icon(activeTab === tab.id ? '#fff' : t.textMuted, 18)} {tab.id}
              </button>
            ))}
          </div>
        )}
        <button
          onClick={handleExport}
          style={{
            padding: isMobile ? '12px 20px' : '10px 24px',
            borderRadius: '12px',
            border: 'none',
            background: `linear-gradient(135deg, ${t.gradientStart}, ${t.gradientEnd})`,
            color: '#fff',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: `0 4px 20px ${t.accentGlow}`,
            minHeight: '44px',
          }}
        >
          {Icons.download('#fff')} {isMobile ? '' : 'Export'}
        </button>
      </div>

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          overflow: 'hidden',
        }}
      >
        {/* Desktop Left Sidebar */}
        {!isMobile && (
          <div
            style={{
              width: '320px',
              borderRight: `1px solid ${t.cardBorder}`,
              background: t.navBg,
              backdropFilter: 'blur(20px)',
              padding: '20px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
            }}
          >
            <div>
              <h3
                style={{
                  color: t.text,
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                {Icons.image(t.accent, 18)} Upload Media
              </h3>
              <label
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '32px',
                  borderRadius: '16px',
                  border: `2px dashed ${t.cardBorder}`,
                  background: t.cardBg,
                  cursor: 'pointer',
                }}
              >
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={(e) => e.target.files?.[0] && setImage(e.target.files[0])}
                  style={{ display: 'none' }}
                />
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${t.gradientStart}33, ${t.gradientEnd}33)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {Icons.upload(t.accent)}
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ color: t.text, fontSize: '14px', fontWeight: '600', margin: 0 }}>
                    {image ? image.name : 'Drop your image here'}
                  </p>
                  <p style={{ color: t.textMuted, fontSize: '12px', margin: '4px 0 0' }}>
                    PNG, JPG up to 10MB
                  </p>
                </div>
              </label>
            </div>
            <div>
              <h3
                style={{
                  color: t.text,
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                {Icons.sparkles(t.accent, 18)} AI Magic
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input
                  type="text"
                  placeholder="Describe your marketing content..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  style={{
                    padding: '14px 16px',
                    borderRadius: '12px',
                    border: `1px solid ${t.cardBorder}`,
                    background: t.searchBg,
                    color: t.text,
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt}
                  style={{
                    padding: '14px',
                    borderRadius: '12px',
                    border: 'none',
                    background:
                      isGenerating || !prompt
                        ? t.cardBg
                        : `linear-gradient(135deg, ${t.gradientStart}, ${t.gradientEnd})`,
                    color: isGenerating || !prompt ? t.textMuted : '#fff',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: isGenerating || !prompt ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  {isGenerating ? (
                    <>
                      <div
                        style={{
                          width: '18px',
                          height: '18px',
                          border: `2px solid ${t.textMuted}`,
                          borderTopColor: 'transparent',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite',
                        }}
                      />
                      Generating...
                    </>
                  ) : (
                    <>{Icons.sparkles('#fff', 18)} Generate with AI</>
                  )}
                </button>
              </div>
            </div>
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '12px',
                }}
              >
                <h3
                  style={{
                    color: t.text,
                    fontSize: '14px',
                    fontWeight: '600',
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  {Icons.grid(t.accent, 18)} Templates
                </h3>
                <button
                  onClick={() => setShowTemplateLibrary(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: t.accent,
                    fontSize: '12px',
                    fontWeight: '500',
                    cursor: 'pointer',
                  }}
                >
                  See all
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {marketingTemplates.slice(0, 4).map((template) => (
                  <button
                    key={template.id}
                    onClick={() => {
                      setActiveMarketingTemplate(template)
                      // Clear custom background when applying template
                      setCanvasBackground(null)
                      // Reset text to template's main text if no custom text
                      const mainText = template.elements?.find(
                        (e) => e.type === 'text' && e.fontSize > 60
                      )
                      if (mainText && !textOverlay.text) {
                        setTextOverlay((prev) => ({
                          ...prev,
                          text: mainText.content,
                          color: mainText.color || '#ffffff',
                        }))
                      }
                    }}
                    style={{
                      padding: '12px 8px',
                      borderRadius: '12px',
                      border:
                        activeMarketingTemplate?.id === template.id
                          ? `2px solid ${t.accent}`
                          : `1px solid ${t.cardBorder}`,
                      background:
                        activeMarketingTemplate?.id === template.id
                          ? `${t.accent}15`
                          : 'transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    {/* Template Preview */}
                    <div
                      style={{
                        width: '100%',
                        height: '48px',
                        borderRadius: '8px',
                        background:
                          template.elements?.[0]?.style === 'gradient'
                            ? `linear-gradient(135deg, ${template.elements[0].colors?.[0]}, ${template.elements[0].colors?.[1]})`
                            : template.elements?.[0]?.color || '#333',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                      }}
                    >
                      <span
                        style={{
                          color: '#fff',
                          fontSize: '10px',
                          fontWeight: '700',
                          textAlign: 'center',
                          padding: '4px',
                        }}
                      >
                        {template.elements?.find((e) => e.type === 'text')?.content?.slice(0, 12) ||
                          template.name}
                      </span>
                    </div>
                    <span style={{ color: t.text, fontSize: '11px', fontWeight: '500' }}>
                      {template.name}
                    </span>
                  </button>
                ))}
              </div>
              {activeMarketingTemplate && (
                <button
                  onClick={() => {
                    setActiveMarketingTemplate(null)
                    setCanvasBackground(null)
                  }}
                  style={{
                    width: '100%',
                    marginTop: '8px',
                    padding: '8px',
                    borderRadius: '8px',
                    border: `1px solid ${t.cardBorder}`,
                    background: 'transparent',
                    color: t.textMuted,
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  Clear Template
                </button>
              )}
            </div>

            {/* Background Colors */}
            <div>
              <h3
                style={{
                  color: t.text,
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                {Icons.layers(t.accent, 18)} Background
              </h3>
              <div style={{ marginBottom: '12px' }}>
                <span
                  style={{
                    color: t.textMuted,
                    fontSize: '12px',
                    marginBottom: '8px',
                    display: 'block',
                  }}
                >
                  Solid Colors
                </span>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {[
                    '#1a1a2e',
                    '#ffffff',
                    '#000000',
                    '#ef4444',
                    '#f59e0b',
                    '#22c55e',
                    '#3b82f6',
                    '#a855f7',
                  ].map((color) => (
                    <button
                      key={color}
                      onClick={() => setCanvasBackground({ type: 'solid', value: color })}
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        border:
                          canvasBackground?.value === color
                            ? `2px solid ${t.accent}`
                            : `1px solid ${t.cardBorder}`,
                        background: color,
                        cursor: 'pointer',
                      }}
                    />
                  ))}
                </div>
              </div>
              <div>
                <span
                  style={{
                    color: t.textMuted,
                    fontSize: '12px',
                    marginBottom: '8px',
                    display: 'block',
                  }}
                >
                  Gradients
                </span>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {gradientPresets.slice(0, 6).map((gradient) => (
                    <button
                      key={gradient.id}
                      onClick={() =>
                        setCanvasBackground({ type: 'gradient', value: gradient.colors })
                      }
                      title={gradient.label}
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        border:
                          JSON.stringify(canvasBackground?.value) ===
                          JSON.stringify(gradient.colors)
                            ? `2px solid ${t.accent}`
                            : `1px solid ${t.cardBorder}`,
                        background: `linear-gradient(135deg, ${gradient.colors[0]}, ${gradient.colors[1]})`,
                        cursor: 'pointer',
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div>
              <h3
                style={{
                  color: t.text,
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                {Icons.type(t.accent, 18)} Text Overlay
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input
                  type="text"
                  placeholder="Enter text..."
                  value={textOverlay.text}
                  onChange={(e) => setTextOverlay((prev) => ({ ...prev, text: e.target.value }))}
                  style={{
                    padding: '14px 16px',
                    borderRadius: '12px',
                    border: `1px solid ${t.cardBorder}`,
                    background: t.searchBg,
                    color: t.text,
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
                <div>
                  <span
                    style={{
                      color: t.textMuted,
                      fontSize: '12px',
                      marginBottom: '8px',
                      display: 'block',
                    }}
                  >
                    Text Color
                  </span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {textColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setTextOverlay((prev) => ({ ...prev, color }))}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          border:
                            textOverlay.color === color
                              ? `3px solid ${t.accent}`
                              : `2px solid ${t.isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`,
                          background: color,
                          cursor: 'pointer',
                          boxShadow:
                            textOverlay.color === color ? `0 0 12px ${t.accentGlow}` : 'none',
                        }}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <span
                    style={{
                      color: t.textMuted,
                      fontSize: '12px',
                      marginBottom: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    Font Size <span style={{ color: t.text }}>{textOverlay.fontSize}px</span>
                  </span>
                  <input
                    type="range"
                    min="24"
                    max="120"
                    value={textOverlay.fontSize}
                    onChange={(e) =>
                      setTextOverlay((prev) => ({ ...prev, fontSize: parseInt(e.target.value) }))
                    }
                    style={{ width: '100%', accentColor: t.accent }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Canvas Area */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: t.isDark ? '#0a0a0f' : '#e2e8f0',
            padding: isMobile ? '12px' : '40px',
            position: 'relative',
            overflow: 'auto',
          }}
        >
          <div
            style={{
              position: 'relative',
              boxShadow: isMobile ? `0 0 40px ${t.accentGlow}` : `0 0 100px ${t.accentGlow}`,
              borderRadius: isMobile ? '12px' : '16px',
              overflow: 'hidden',
            }}
          >
            <canvas
              ref={canvasRef}
              width={canvasWidth}
              height={canvasHeight}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onTouchStart={(e) => {
                const touch = e.touches[0]
                handleMouseDown({ clientX: touch.clientX, clientY: touch.clientY })
              }}
              onTouchMove={(e) => {
                const touch = e.touches[0]
                handleMouseMove({ clientX: touch.clientX, clientY: touch.clientY })
              }}
              onTouchEnd={() => setTextOverlay((prev) => ({ ...prev, isDragging: false }))}
              onMouseUp={() => setTextOverlay((prev) => ({ ...prev, isDragging: false }))}
              onMouseLeave={() => setTextOverlay((prev) => ({ ...prev, isDragging: false }))}
              style={{
                cursor: textOverlay.isDragging ? 'grabbing' : 'grab',
                borderRadius: isMobile ? '12px' : '16px',
              }}
            />
            {textOverlay.text && !isMobile && (
              <div
                style={{
                  position: 'absolute',
                  top: '16px',
                  left: '16px',
                  background: 'rgba(0,0,0,0.7)',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  color: '#fff',
                  fontSize: '12px',
                  backdropFilter: 'blur(10px)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {Icons.info('#fff')} Drag text to reposition
              </div>
            )}
          </div>
          {!isMobile && (
            <>
              {/* Platform Selector Button */}
              <button
                onClick={() => setShowPlatformPicker(true)}
                style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  background: t.cardBg,
                  padding: '10px 16px',
                  borderRadius: '10px',
                  border: `1px solid ${t.cardBorder}`,
                  color: t.text,
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backdropFilter: 'blur(10px)',
                }}
              >
                {Icons.grid(t.accent, 16)}
                {currentPreset.label}
                <span style={{ color: t.textMuted, fontSize: '11px' }}>
                  {currentPreset.aspectRatio}
                </span>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={t.textMuted}
                  strokeWidth="2"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {/* Export Resolution Display */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '20px',
                  right: '20px',
                  background: t.cardBg,
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: `1px solid ${t.cardBorder}`,
                  color: t.textMuted,
                  fontSize: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  gap: '2px',
                }}
              >
                <span style={{ color: t.text, fontWeight: '500' }}>
                  Export: {exportWidth} x {exportHeight} px
                </span>
                <span style={{ fontSize: '10px' }}>
                  Preview: {canvasWidth} x {canvasHeight} px
                </span>
              </div>
            </>
          )}
        </div>

        {/* Mobile Bottom Controls */}
        {isMobile && (
          <div
            style={{
              background: t.navBg,
              borderTop: `1px solid ${t.cardBorder}`,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Control Panel Content */}
            <div
              style={{
                height: '180px',
                overflowY: 'auto',
                padding: '16px',
                borderBottom: `1px solid ${t.cardBorder}`,
              }}
            >
              {/* Upload Tab */}
              {mobileControlTab === 'upload' && (
                <label
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '24px',
                    borderRadius: '16px',
                    border: `2px dashed ${t.cardBorder}`,
                    background: t.cardBg,
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={(e) => e.target.files?.[0] && setImage(e.target.files[0])}
                    style={{ display: 'none' }}
                  />
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${t.gradientStart}33, ${t.gradientEnd}33)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {Icons.upload(t.accent)}
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ color: t.text, fontSize: '14px', fontWeight: '600', margin: 0 }}>
                      {image ? image.name : 'Tap to upload image'}
                    </p>
                    <p style={{ color: t.textMuted, fontSize: '12px', margin: '4px 0 0' }}>
                      PNG, JPG up to 10MB
                    </p>
                  </div>
                </label>
              )}

              {/* AI Magic Tab */}
              {mobileControlTab === 'ai' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input
                    type="text"
                    placeholder="Describe your marketing content..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    style={{
                      padding: '14px 16px',
                      borderRadius: '12px',
                      border: `1px solid ${t.cardBorder}`,
                      background: t.searchBg,
                      color: t.text,
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating || !prompt}
                    style={{
                      padding: '14px',
                      borderRadius: '12px',
                      border: 'none',
                      background:
                        isGenerating || !prompt
                          ? t.cardBg
                          : `linear-gradient(135deg, ${t.gradientStart}, ${t.gradientEnd})`,
                      color: isGenerating || !prompt ? t.textMuted : '#fff',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: isGenerating || !prompt ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      minHeight: '48px',
                    }}
                  >
                    {isGenerating ? (
                      'Generating...'
                    ) : (
                      <>{Icons.sparkles('#fff', 18)} Generate with AI</>
                    )}
                  </button>
                </div>
              )}

              {/* Text Tab */}
              {mobileControlTab === 'text' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input
                    type="text"
                    placeholder="Enter text..."
                    value={textOverlay.text}
                    onChange={(e) => setTextOverlay((prev) => ({ ...prev, text: e.target.value }))}
                    style={{
                      padding: '14px 16px',
                      borderRadius: '12px',
                      border: `1px solid ${t.cardBorder}`,
                      background: t.searchBg,
                      color: t.text,
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    {textColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setTextOverlay((prev) => ({ ...prev, color }))}
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          border:
                            textOverlay.color === color
                              ? `3px solid ${t.accent}`
                              : `2px solid ${t.isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`,
                          background: color,
                          cursor: 'pointer',
                        }}
                      />
                    ))}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ color: t.textMuted, fontSize: '12px' }}>
                      Size: {textOverlay.fontSize}px
                    </span>
                    <input
                      type="range"
                      min="24"
                      max="80"
                      value={textOverlay.fontSize}
                      onChange={(e) =>
                        setTextOverlay((prev) => ({ ...prev, fontSize: parseInt(e.target.value) }))
                      }
                      style={{ flex: 1, accentColor: t.accent }}
                    />
                  </div>
                </div>
              )}

              {/* Templates Tab (Mobile) */}
              {mobileControlTab === 'templates' && (
                <div>
                  <div
                    style={{ display: 'flex', gap: '6px', marginBottom: '12px', overflowX: 'auto' }}
                  >
                    {templateCategories.slice(0, 4).map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setTemplateCategory(cat.id)}
                        style={{
                          padding: '5px 12px',
                          borderRadius: '14px',
                          border: 'none',
                          background: templateCategory === cat.id ? t.accent : t.cardBg,
                          color: templateCategory === cat.id ? '#fff' : t.textMuted,
                          fontSize: '11px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                  <div
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}
                  >
                    {filteredTemplates.slice(0, 6).map((template) => (
                      <button
                        key={template.id}
                        onClick={() => {
                          setActiveMarketingTemplate(template)
                          setCanvasBackground(null)
                          const mainText = template.elements?.find(
                            (e) => e.type === 'text' && e.fontSize > 60
                          )
                          if (mainText) {
                            setTextOverlay((prev) => ({
                              ...prev,
                              text: mainText.content,
                              color: mainText.color || '#ffffff',
                            }))
                          }
                        }}
                        style={{
                          padding: '6px',
                          borderRadius: '10px',
                          border:
                            activeMarketingTemplate?.id === template.id
                              ? `2px solid ${t.accent}`
                              : `1px solid ${t.cardBorder}`,
                          background:
                            activeMarketingTemplate?.id === template.id
                              ? `${t.accent}15`
                              : 'transparent',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <div
                          style={{
                            width: '100%',
                            height: '40px',
                            borderRadius: '6px',
                            background:
                              template.elements?.[0]?.style === 'gradient'
                                ? `linear-gradient(135deg, ${template.elements[0].colors?.[0]}, ${template.elements[0].colors?.[1]})`
                                : template.elements?.[0]?.color || '#333',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <span style={{ color: '#fff', fontSize: '8px', fontWeight: '700' }}>
                            {template.elements
                              ?.find((e) => e.type === 'text')
                              ?.content?.slice(0, 8) || ''}
                          </span>
                        </div>
                        <span style={{ color: t.text, fontSize: '9px', fontWeight: '500' }}>
                          {template.name}
                        </span>
                      </button>
                    ))}
                  </div>
                  {activeMarketingTemplate && (
                    <button
                      onClick={() => {
                        setActiveMarketingTemplate(null)
                        setCanvasBackground(null)
                      }}
                      style={{
                        width: '100%',
                        marginTop: '8px',
                        padding: '6px',
                        borderRadius: '8px',
                        border: `1px solid ${t.cardBorder}`,
                        background: 'transparent',
                        color: t.textMuted,
                        fontSize: '11px',
                        cursor: 'pointer',
                      }}
                    >
                      Clear Template
                    </button>
                  )}
                </div>
              )}

              {/* Size/Platform Tab */}
              {mobileControlTab === 'size' && (
                <div>
                  <div style={{ marginBottom: '12px' }}>
                    <span style={{ color: t.textMuted, fontSize: '12px' }}>
                      Current:{' '}
                      <span style={{ color: t.text, fontWeight: '600' }}>
                        {currentPreset.label}
                      </span>
                      <span style={{ marginLeft: '8px', color: t.accent }}>
                        {exportWidth} × {exportHeight}
                      </span>
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {Object.entries(platformPresets)
                      .filter(([id]) => id !== 'custom')
                      .slice(0, 6) // Show top 6 presets on mobile
                      .map(([id, preset]) => (
                        <button
                          key={id}
                          onClick={() => {
                            setSelectedPlatform(id)
                            const newScaled = scaleToFit(
                              preset.width,
                              preset.height,
                              maxDisplayWidth,
                              maxDisplayHeight
                            )
                            setTextOverlay((prev) => ({
                              ...prev,
                              x: newScaled.width / 2,
                              y: newScaled.height / 2,
                            }))
                          }}
                          style={{
                            padding: '12px 10px',
                            borderRadius: '10px',
                            border:
                              selectedPlatform === id
                                ? `2px solid ${t.accent}`
                                : `1px solid ${t.cardBorder}`,
                            background: selectedPlatform === id ? `${t.accent}15` : 'transparent',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            gap: '4px',
                          }}
                        >
                          <span
                            style={{
                              color: selectedPlatform === id ? t.accent : t.text,
                              fontSize: '12px',
                              fontWeight: '600',
                            }}
                          >
                            {preset.label}
                          </span>
                          <span style={{ color: t.textMuted, fontSize: '10px' }}>
                            {preset.aspectRatio}
                          </span>
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* Tab Bar */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-around',
                padding: '8px 0',
                paddingBottom: 'env(safe-area-inset-bottom, 8px)',
              }}
            >
              {[
                { id: 'upload', icon: Icons.upload, label: 'Upload' },
                { id: 'templates', icon: Icons.layers, label: 'Templates' },
                { id: 'text', icon: Icons.type, label: 'Text' },
                { id: 'size', icon: Icons.grid, label: 'Size' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setMobileControlTab(tab.id)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '8px 12px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    opacity: mobileControlTab === tab.id ? 1 : 0.5,
                    minWidth: '64px',
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: mobileControlTab === tab.id ? `${t.accent}22` : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {tab.icon(mobileControlTab === tab.id ? t.accent : t.textMuted, 20)}
                  </div>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: mobileControlTab === tab.id ? '600' : '400',
                      color: mobileControlTab === tab.id ? t.accent : t.textMuted,
                    }}
                  >
                    {tab.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Desktop Right Sidebar */}
        {!isMobile && (
          <div
            style={{
              width: '280px',
              borderLeft: `1px solid ${t.cardBorder}`,
              background: t.navBg,
              backdropFilter: 'blur(20px)',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
            }}
          >
            <div>
              <h3
                style={{
                  color: t.text,
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                {Icons.layers(t.accent, 18)} Layers
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {/* Primary Text Layer (legacy) */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    borderRadius: '12px',
                    background: t.cardBg,
                    border: `1px solid ${t.cardBorder}`,
                    opacity: textOverlay.text ? 1 : 0.5,
                  }}
                >
                  {Icons.type(t.textMuted, 18)}
                  <span style={{ color: t.text, fontSize: '13px', flex: 1 }}>
                    {textOverlay.text
                      ? textOverlay.text.substring(0, 20) +
                        (textOverlay.text.length > 20 ? '...' : '')
                      : 'Text Layer'}
                  </span>
                  {textOverlay.text ? Icons.eye(t.textMuted) : Icons.eyeOff(t.textMuted)}
                </div>

                {/* Additional Text Layers */}
                {additionalLayers
                  .filter((l) => l.type === LayerType.TEXT)
                  .map((layer) => (
                    <div
                      key={layer.id}
                      onClick={() => selectLayer(layer.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        borderRadius: '12px',
                        background: selectedLayerId === layer.id ? `${t.accent}20` : t.cardBg,
                        border: `1px solid ${selectedLayerId === layer.id ? t.accent : t.cardBorder}`,
                        opacity: layer.visible ? 1 : 0.5,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {Icons.type(t.textMuted, 18)}
                      <span style={{ color: t.text, fontSize: '13px', flex: 1 }}>
                        {layer.data.text
                          ? layer.data.text.substring(0, 20) +
                            (layer.data.text.length > 20 ? '...' : '')
                          : layer.name}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleLayerVisibility(layer.id)
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px',
                        }}
                      >
                        {layer.visible ? Icons.eye(t.textMuted) : Icons.eyeOff(t.textMuted)}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          removeLayer(layer.id)
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px',
                          color: '#ef4444',
                        }}
                      >
                        {Icons.x('#ef4444', 16)}
                      </button>
                    </div>
                  ))}

                {/* Image Layer */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    borderRadius: '12px',
                    background: t.cardBg,
                    border: `1px solid ${t.cardBorder}`,
                    opacity: image ? 1 : 0.5,
                  }}
                >
                  {Icons.image(t.textMuted, 18)}
                  <span style={{ color: t.text, fontSize: '13px', flex: 1 }}>Image Layer</span>
                  {image ? Icons.eye(t.textMuted) : Icons.eyeOff(t.textMuted)}
                </div>

                {/* Background Layer */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    borderRadius: '12px',
                    background: t.cardBg,
                    border: `1px solid ${t.cardBorder}`,
                  }}
                >
                  {Icons.grid(t.textMuted, 18)}
                  <span style={{ color: t.text, fontSize: '13px', flex: 1 }}>Background</span>
                  {Icons.eye(t.textMuted)}
                </div>

                {/* Add Text Layer Button */}
                <button
                  onClick={() =>
                    addTextLayer('New Text', { x: 50, y: 50 + additionalLayers.length * 10 })
                  }
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '12px',
                    borderRadius: '12px',
                    background: 'transparent',
                    border: `1px dashed ${t.cardBorder}`,
                    color: t.accent,
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {Icons.plus(t.accent, 16)} Add Text Layer
                </button>
              </div>
            </div>
            <div>
              <h3
                style={{ color: t.text, fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}
              >
                Quick Actions
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { name: 'Resize Canvas', icon: Icons.maximize },
                  { name: 'Add Filter', icon: Icons.sliders },
                  { name: 'Crop Image', icon: Icons.scissors },
                  { name: 'Reset All', icon: Icons.refreshCw },
                ].map((action, i) => (
                  <button
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      borderRadius: '12px',
                      background: 'transparent',
                      border: `1px solid ${t.cardBorder}`,
                      color: t.text,
                      fontSize: '13px',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    {action.icon(t.textMuted, 18)} {action.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Export Options Modal */}
      {showExportOptions && (
        <>
          <div
            onClick={() => setShowExportOptions(false)}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.6)',
              zIndex: 1001,
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: t.isDark ? '#1a1a2e' : '#ffffff',
              borderRadius: '24px',
              padding: isMobile ? '20px' : '24px',
              zIndex: 1002,
              width: isMobile ? 'calc(100% - 32px)' : '320px',
              maxWidth: '320px',
              boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${t.gradientStart}, ${t.gradientEnd})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}
              >
                {Icons.check('#fff', 28)}
              </div>
              <h3 style={{ color: t.text, fontSize: '18px', fontWeight: '700', margin: '0 0 8px' }}>
                Saved to Media Library!
              </h3>
              <p style={{ color: t.textMuted, fontSize: '14px', margin: 0 }}>
                What would you like to do next?
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={handleDownload}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  padding: '16px',
                  borderRadius: '12px',
                  border: `1px solid ${t.cardBorder}`,
                  background: t.cardBg,
                  color: t.text,
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  minHeight: '48px',
                }}
              >
                {Icons.download(t.accent, 20)} Download Image
              </button>
              <button
                onClick={handleSendCampaign}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  padding: '16px',
                  borderRadius: '12px',
                  border: 'none',
                  background: `linear-gradient(135deg, ${t.gradientStart}, ${t.gradientEnd})`,
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: `0 4px 20px ${t.accentGlow}`,
                  minHeight: '48px',
                }}
              >
                {Icons.megaphone('#fff', 20)} Send as Campaign
              </button>
              <button
                onClick={() => setShowExportOptions(false)}
                style={{
                  padding: '14px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'transparent',
                  color: t.textMuted,
                  fontSize: '14px',
                  cursor: 'pointer',
                  minHeight: '44px',
                }}
              >
                Continue Editing
              </button>
            </div>
          </div>
        </>
      )}

      {/* Template Library Modal */}
      {showTemplateLibrary && (
        <>
          <div
            onClick={() => setShowTemplateLibrary(false)}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.6)',
              zIndex: 1001,
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: t.isDark ? '#1a1a2e' : '#ffffff',
              borderRadius: '24px',
              padding: '24px',
              zIndex: 1002,
              width: isMobile ? 'calc(100% - 32px)' : '500px',
              maxWidth: '500px',
              maxHeight: '80vh',
              overflow: 'hidden',
              boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ color: t.text, fontSize: '18px', fontWeight: '700', margin: '0 0 4px' }}>
                Marketing Templates
              </h3>
              <p style={{ color: t.textMuted, fontSize: '13px', margin: 0 }}>
                Choose a pre-designed template to get started quickly
              </p>
            </div>

            {/* Category Filter */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
              {templateCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setTemplateCategory(cat.id)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '16px',
                    border: 'none',
                    background: templateCategory === cat.id ? t.accent : t.cardBg,
                    color: templateCategory === cat.id ? '#fff' : t.textMuted,
                    fontSize: '12px',
                    fontWeight: '500',
                    cursor: 'pointer',
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Templates Grid */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px',
                paddingRight: '8px',
              }}
            >
              {filteredTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => {
                    setActiveMarketingTemplate(template)
                    setCanvasBackground(null)
                    setShowTemplateLibrary(false)
                    // Set main text from template
                    const mainText = template.elements?.find(
                      (e) => e.type === 'text' && e.fontSize > 60
                    )
                    if (mainText) {
                      setTextOverlay((prev) => ({
                        ...prev,
                        text: mainText.content,
                        color: mainText.color || '#ffffff',
                      }))
                    }
                  }}
                  style={{
                    padding: '12px',
                    borderRadius: '16px',
                    border:
                      activeMarketingTemplate?.id === template.id
                        ? `2px solid ${t.accent}`
                        : `1px solid ${t.cardBorder}`,
                    background:
                      activeMarketingTemplate?.id === template.id ? `${t.accent}10` : t.cardBg,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    gap: '10px',
                    textAlign: 'left',
                  }}
                >
                  {/* Template Preview */}
                  <div
                    style={{
                      width: '100%',
                      height: '100px',
                      borderRadius: '10px',
                      background:
                        template.elements?.[0]?.style === 'gradient'
                          ? `linear-gradient(135deg, ${template.elements[0].colors?.[0]}, ${template.elements[0].colors?.[1]})`
                          : template.elements?.[0]?.color || '#333',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      padding: '8px',
                    }}
                  >
                    {template.elements
                      ?.filter((e) => e.type === 'text')
                      .slice(0, 2)
                      .map((textEl, idx) => (
                        <span
                          key={idx}
                          style={{
                            color: textEl.color || '#fff',
                            fontSize: Math.min(textEl.fontSize / 6, 16),
                            fontWeight: textEl.fontWeight || 'bold',
                            textAlign: 'center',
                            lineHeight: 1.2,
                          }}
                        >
                          {textEl.content}
                        </span>
                      ))}
                  </div>
                  <div>
                    <span
                      style={{
                        color: t.text,
                        fontSize: '13px',
                        fontWeight: '600',
                        display: 'block',
                      }}
                    >
                      {template.name}
                    </span>
                    <span
                      style={{ color: t.textMuted, fontSize: '11px', textTransform: 'capitalize' }}
                    >
                      {template.category}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowTemplateLibrary(false)}
              style={{
                marginTop: '16px',
                padding: '14px',
                borderRadius: '12px',
                border: 'none',
                background: t.cardBg,
                color: t.textMuted,
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </>
      )}

      {/* Platform Picker Modal */}
      {showPlatformPicker && (
        <>
          <div
            onClick={() => setShowPlatformPicker(false)}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.6)',
              zIndex: 1001,
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: t.isDark ? '#1a1a2e' : '#ffffff',
              borderRadius: '24px',
              padding: '24px',
              zIndex: 1002,
              width: isMobile ? 'calc(100% - 32px)' : '420px',
              maxWidth: '420px',
              maxHeight: '80vh',
              overflow: 'auto',
              boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
            }}
          >
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ color: t.text, fontSize: '18px', fontWeight: '700', margin: '0 0 4px' }}>
                Choose Platform
              </h3>
              <p style={{ color: t.textMuted, fontSize: '13px', margin: 0 }}>
                Select the social platform to optimize your canvas size
              </p>
            </div>

            {platformCategories.map((category) => {
              const presets = Object.entries(platformPresets)
                .filter(([, p]) => p.category === category.id)
                .map(([id, p]) => ({ id, ...p }))

              if (presets.length === 0) return null

              return (
                <div key={category.id} style={{ marginBottom: '20px' }}>
                  <h4
                    style={{
                      color: t.textMuted,
                      fontSize: '12px',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      marginBottom: '10px',
                    }}
                  >
                    {category.label}
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {presets.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => {
                          setSelectedPlatform(preset.id)
                          setShowPlatformPicker(false)
                          // Reset text position for new canvas size
                          const newScaled = scaleToFit(
                            preset.width,
                            preset.height,
                            maxDisplayWidth,
                            maxDisplayHeight
                          )
                          setTextOverlay((prev) => ({
                            ...prev,
                            x: newScaled.width / 2,
                            y: newScaled.height / 2,
                          }))
                        }}
                        style={{
                          padding: '14px 12px',
                          borderRadius: '12px',
                          border:
                            selectedPlatform === preset.id
                              ? `2px solid ${t.accent}`
                              : `1px solid ${t.cardBorder}`,
                          background: selectedPlatform === preset.id ? `${t.accent}15` : t.cardBg,
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                          gap: '6px',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            width: '100%',
                          }}
                        >
                          <span
                            style={{
                              color: selectedPlatform === preset.id ? t.accent : t.text,
                              fontSize: '14px',
                              fontWeight: '600',
                            }}
                          >
                            {preset.label}
                          </span>
                          {selectedPlatform === preset.id && (
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill={t.accent}
                              style={{ marginLeft: 'auto' }}
                            >
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                            </svg>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span
                            style={{
                              color: t.textMuted,
                              fontSize: '11px',
                            }}
                          >
                            {preset.width} × {preset.height}
                          </span>
                          <span
                            style={{
                              color: t.textMuted,
                              fontSize: '11px',
                              padding: '2px 6px',
                              background: t.cardBg,
                              borderRadius: '4px',
                            }}
                          >
                            {preset.aspectRatio}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}

            <button
              onClick={() => setShowPlatformPicker(false)}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                border: 'none',
                background: t.cardBg,
                color: t.textMuted,
                fontSize: '14px',
                cursor: 'pointer',
                marginTop: '8px',
              }}
            >
              Cancel
            </button>
          </div>
        </>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default function PhoneDashboardPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user: _user } = useAuth()

  const [theme, _setTheme] = useState('cyanDark')
  const [showAIStudio, setShowAIStudio] = useState(false)
  const [mediaLibrary, setMediaLibrary] = useState([])
  const [showComposeModal, setShowComposeModal] = useState(false)
  const [composeAttachment, setComposeAttachment] = useState(null)
  const t = themes[theme]

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
        <AIStudioFullScreen
          theme={t}
          onClose={() => setShowAIStudio(false)}
          onExport={handleAIStudioExport}
          onSendAsCampaign={handleSendAsCampaign}
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
          onClick={() => setShowAIStudio(true)}
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
