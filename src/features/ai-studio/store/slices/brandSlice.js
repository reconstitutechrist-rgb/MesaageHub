/**
 * Brand Slice - Manages brand kit state for consistent design identity
 *
 * Allows users to save and apply brand colors, fonts, and logos
 */

/**
 * Default brand kit structure
 */
export const DEFAULT_BRAND_KIT = {
  id: null,
  name: 'My Brand',
  colors: {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    accent: '#f59e0b',
    text: '#ffffff',
    background: '#1a1a2e',
  },
  fonts: {
    heading: '-apple-system, BlinkMacSystemFont, sans-serif',
    body: '-apple-system, BlinkMacSystemFont, sans-serif',
  },
  logo: null, // Base64 or URL
  contactOverlay: {
    enabled: false,
    text: 'Text me at',
    phoneNumber: '',
    position: 'bottom-right', // bottom-left, bottom-center, bottom-right
  },
}

/**
 * Preset brand color palettes for quick selection
 */
export const BRAND_PRESETS = [
  {
    id: 'modern-blue',
    name: 'Modern Blue',
    colors: {
      primary: '#3b82f6',
      secondary: '#1d4ed8',
      accent: '#f59e0b',
      text: '#ffffff',
      background: '#0f172a',
    },
  },
  {
    id: 'vibrant-purple',
    name: 'Vibrant Purple',
    colors: {
      primary: '#8b5cf6',
      secondary: '#7c3aed',
      accent: '#ec4899',
      text: '#ffffff',
      background: '#1e1b4b',
    },
  },
  {
    id: 'fresh-green',
    name: 'Fresh Green',
    colors: {
      primary: '#22c55e',
      secondary: '#16a34a',
      accent: '#facc15',
      text: '#ffffff',
      background: '#052e16',
    },
  },
  {
    id: 'bold-red',
    name: 'Bold Red',
    colors: {
      primary: '#ef4444',
      secondary: '#dc2626',
      accent: '#fbbf24',
      text: '#ffffff',
      background: '#1c1917',
    },
  },
  {
    id: 'elegant-gold',
    name: 'Elegant Gold',
    colors: {
      primary: '#d4af37',
      secondary: '#b8860b',
      accent: '#ffffff',
      text: '#1a1a2e',
      background: '#1a1a2e',
    },
  },
  {
    id: 'clean-minimal',
    name: 'Clean Minimal',
    colors: {
      primary: '#000000',
      secondary: '#374151',
      accent: '#3b82f6',
      text: '#000000',
      background: '#ffffff',
    },
  },
]

/**
 * Available font options
 */
export const FONT_OPTIONS = [
  { id: 'system', name: 'System Default', value: '-apple-system, BlinkMacSystemFont, sans-serif' },
  { id: 'inter', name: 'Inter', value: 'Inter, sans-serif' },
  { id: 'roboto', name: 'Roboto', value: 'Roboto, sans-serif' },
  { id: 'poppins', name: 'Poppins', value: 'Poppins, sans-serif' },
  { id: 'montserrat', name: 'Montserrat', value: 'Montserrat, sans-serif' },
  { id: 'playfair', name: 'Playfair Display', value: 'Playfair Display, serif' },
  { id: 'oswald', name: 'Oswald', value: 'Oswald, sans-serif' },
  { id: 'lato', name: 'Lato', value: 'Lato, sans-serif' },
]

/**
 * Contact overlay position options
 */
export const OVERLAY_POSITIONS = [
  { id: 'bottom-left', name: 'Bottom Left' },
  { id: 'bottom-center', name: 'Bottom Center' },
  { id: 'bottom-right', name: 'Bottom Right' },
]

/**
 * Brand slice for Zustand store
 */
export const createBrandSlice = (set, get) => ({
  // State
  activeBrandKit: { ...DEFAULT_BRAND_KIT },
  savedBrandKits: [],
  isBrandKitLoading: false,
  brandKitError: null,

  // Set active brand kit
  setActiveBrandKit: (brandKit) => {
    set({ activeBrandKit: { ...DEFAULT_BRAND_KIT, ...brandKit } })
  },

  // Update brand colors
  updateBrandColors: (colorUpdates) => {
    const { activeBrandKit } = get()
    set({
      activeBrandKit: {
        ...activeBrandKit,
        colors: { ...activeBrandKit.colors, ...colorUpdates },
      },
    })
  },

  // Update brand fonts
  updateBrandFonts: (fontUpdates) => {
    const { activeBrandKit } = get()
    set({
      activeBrandKit: {
        ...activeBrandKit,
        fonts: { ...activeBrandKit.fonts, ...fontUpdates },
      },
    })
  },

  // Set brand logo
  setBrandLogo: (logoData) => {
    const { activeBrandKit } = get()
    set({
      activeBrandKit: {
        ...activeBrandKit,
        logo: logoData,
      },
    })
  },

  // Update contact overlay settings
  updateContactOverlay: (overlayUpdates) => {
    const { activeBrandKit } = get()
    set({
      activeBrandKit: {
        ...activeBrandKit,
        contactOverlay: { ...activeBrandKit.contactOverlay, ...overlayUpdates },
      },
    })
  },

  // Apply a preset brand palette
  applyBrandPreset: (presetId) => {
    const preset = BRAND_PRESETS.find((p) => p.id === presetId)
    if (preset) {
      const { activeBrandKit } = get()
      set({
        activeBrandKit: {
          ...activeBrandKit,
          colors: { ...preset.colors },
        },
      })
    }
  },

  // Set saved brand kits (from database)
  setSavedBrandKits: (brandKits) => {
    set({ savedBrandKits: brandKits })
  },

  // Add a brand kit to saved list
  addSavedBrandKit: (brandKit) => {
    const { savedBrandKits } = get()
    set({ savedBrandKits: [...savedBrandKits, brandKit] })
  },

  // Remove a brand kit from saved list
  removeSavedBrandKit: (brandKitId) => {
    const { savedBrandKits } = get()
    set({ savedBrandKits: savedBrandKits.filter((kit) => kit.id !== brandKitId) })
  },

  // Update a saved brand kit
  updateSavedBrandKit: (brandKitId, updates) => {
    const { savedBrandKits } = get()
    set({
      savedBrandKits: savedBrandKits.map((kit) =>
        kit.id === brandKitId ? { ...kit, ...updates } : kit
      ),
    })
  },

  // Set loading state
  setBrandKitLoading: (isLoading) => {
    set({ isBrandKitLoading: isLoading })
  },

  // Set error state
  setBrandKitError: (error) => {
    set({ brandKitError: error })
  },

  // Get brand color for use in canvas
  getBrandColor: (colorKey) => {
    const { activeBrandKit } = get()
    return activeBrandKit.colors[colorKey] || DEFAULT_BRAND_KIT.colors[colorKey]
  },

  // Get brand font for use in canvas
  getBrandFont: (fontKey) => {
    const { activeBrandKit } = get()
    return activeBrandKit.fonts[fontKey] || DEFAULT_BRAND_KIT.fonts[fontKey]
  },

  // Check if a color matches brand colors
  isOnBrandColor: (color) => {
    const { activeBrandKit } = get()
    return Object.values(activeBrandKit.colors).includes(color)
  },

  // Reset brand state
  resetBrandState: () => {
    set({
      activeBrandKit: { ...DEFAULT_BRAND_KIT },
      savedBrandKits: [],
      isBrandKitLoading: false,
      brandKitError: null,
    })
  },
})
