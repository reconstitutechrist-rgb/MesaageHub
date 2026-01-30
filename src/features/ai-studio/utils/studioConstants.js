/**
 * AI Studio Constants
 *
 * Centralized configuration for colors, tabs, and other UI constants.
 */

// Solid background colors for canvas
export const SOLID_COLORS = [
  '#1a1a2e',
  '#ffffff',
  '#000000',
  '#ef4444',
  '#f59e0b',
  '#22c55e',
  '#3b82f6',
  '#a855f7',
]

// Text overlay color options
export const TEXT_COLORS = [
  '#ffffff',
  '#000000',
  '#ef4444',
  '#f59e0b',
  '#22c55e',
  '#3b82f6',
  '#a855f7',
]

// Mobile control tabs
export const MOBILE_TABS = {
  UPLOAD: 'upload',
  AI: 'ai',
  TEXT: 'text',
  TEMPLATES: 'templates',
  SIZE: 'size',
}

// Desktop sidebar tabs (for AI Studio mode)
export const STUDIO_TABS = {
  IMAGE: 'image',
  VIDEO: 'video',
}

// Default text overlay state
export const DEFAULT_TEXT_OVERLAY = {
  text: '',
  x: 50, // percentage
  y: 50, // percentage
  color: '#ffffff',
  fontSize: 48,
  isDragging: false,
}

// Canvas dimension constraints
export const CANVAS_CONSTRAINTS = {
  MAX_DISPLAY_WIDTH: 600,
  MAX_DISPLAY_HEIGHT: 500,
  MOBILE_MARGIN: 32,
  MOBILE_BOTTOM_PADDING: 360,
}

// Layer z-index defaults
export const LAYER_Z_INDEX = {
  BACKGROUND: 0,
  IMAGE: 10,
  TEXT_START: 100,
}

// History limits for undo/redo
export const HISTORY_LIMIT = 50

// Default fallback colors based on theme
export const FALLBACK_COLORS = {
  dark: '#1a1a2e',
  light: '#f1f5f9',
}

// Export quality settings
export const EXPORT_SETTINGS = {
  format: 'image/png',
  quality: 1.0,
  thumbnailWidth: 300,
  thumbnailHeight: 300,
}

// Retail scenario background presets for AI generation
export const RETAIL_SCENARIOS = [
  {
    id: 'glass-shelf',
    name: 'Glass Shelf',
    prompt:
      'Minimalist glass shelf with soft studio lighting, clean white background, professional product photography setup',
    category: 'minimal',
  },
  {
    id: 'boutique-counter',
    name: 'Boutique Counter',
    prompt:
      'Luxury boutique counter with marble surface, elegant gold accents, soft ambient lighting, high-end retail environment',
    category: 'luxury',
  },
  {
    id: 'clothing-rack',
    name: 'Clothing Rack',
    prompt:
      'Modern clothing rack with neutral gray background, fashion boutique setting, soft diffused lighting',
    category: 'fashion',
  },
  {
    id: 'product-pedestal',
    name: 'Product Pedestal',
    prompt:
      'White product pedestal with gradient backdrop, clean studio setup, professional e-commerce photography lighting',
    category: 'minimal',
  },
  {
    id: 'lifestyle-table',
    name: 'Lifestyle Table',
    prompt:
      'Rustic wooden table with lifestyle props, warm natural lighting, cozy aesthetic, artisan marketplace feel',
    category: 'lifestyle',
  },
  {
    id: 'neon-display',
    name: 'Neon Display',
    prompt:
      'Neon-lit display case with urban aesthetic, vibrant colors, modern streetwear shop atmosphere, trendy retail space',
    category: 'urban',
  },
  {
    id: 'beach-setting',
    name: 'Beach Setting',
    prompt:
      'Sandy beach with soft sunset lighting, tropical vacation vibes, summer retail promotion background',
    category: 'seasonal',
  },
  {
    id: 'holiday-decor',
    name: 'Holiday Decor',
    prompt:
      'Festive holiday background with twinkling lights, red and gold accents, warm cozy atmosphere, gift-giving season',
    category: 'seasonal',
  },
  {
    id: 'tech-showcase',
    name: 'Tech Showcase',
    prompt:
      'Sleek dark surface with subtle blue lighting, modern tech product showcase, futuristic minimalist aesthetic',
    category: 'tech',
  },
  {
    id: 'outdoor-nature',
    name: 'Outdoor Nature',
    prompt:
      'Natural outdoor setting with soft bokeh greenery, organic and eco-friendly product background, sustainable lifestyle',
    category: 'lifestyle',
  },
  {
    id: 'coffee-shop',
    name: 'Coffee Shop',
    prompt:
      'Cozy coffee shop counter with warm wood tones, artisan cafe atmosphere, inviting lifestyle setting',
    category: 'lifestyle',
  },
  {
    id: 'gym-fitness',
    name: 'Gym & Fitness',
    prompt:
      'Modern gym environment with athletic equipment, energetic fitness atmosphere, sports and wellness products',
    category: 'fitness',
  },
]

// Retail scenario categories for filtering
export const RETAIL_SCENARIO_CATEGORIES = [
  { id: 'all', name: 'All Scenes' },
  { id: 'minimal', name: 'Minimal' },
  { id: 'luxury', name: 'Luxury' },
  { id: 'fashion', name: 'Fashion' },
  { id: 'lifestyle', name: 'Lifestyle' },
  { id: 'urban', name: 'Urban' },
  { id: 'seasonal', name: 'Seasonal' },
  { id: 'tech', name: 'Tech' },
  { id: 'fitness', name: 'Fitness' },
]

// ============================================
// PHASE 3: LIGHTING PRESETS
// ============================================

// Lighting presets for intelligent subject re-lighting
export const LIGHTING_PRESETS = [
  {
    id: 'natural-daylight',
    name: 'Natural Daylight',
    icon: 'sun',
    description: 'Soft, balanced natural light',
    settings: {
      temperature: 5600, // Kelvin
      intensity: 1.0,
      direction: 'top',
      shadowSoftness: 0.7,
      highlightIntensity: 0.3,
      ambientFill: 0.4,
    },
  },
  {
    id: 'studio-soft',
    name: 'Studio Soft',
    icon: 'aperture',
    description: 'Professional studio softbox lighting',
    settings: {
      temperature: 5200,
      intensity: 1.1,
      direction: 'front-top',
      shadowSoftness: 0.9,
      highlightIntensity: 0.4,
      ambientFill: 0.5,
    },
  },
  {
    id: 'sunset-glow',
    name: 'Sunset Glow',
    icon: 'sunset',
    description: 'Warm golden hour lighting',
    settings: {
      temperature: 3200,
      intensity: 0.9,
      direction: 'side-low',
      shadowSoftness: 0.6,
      highlightIntensity: 0.5,
      ambientFill: 0.3,
      tint: '#ff9500',
    },
  },
  {
    id: 'neon-accent',
    name: 'Neon Accent',
    icon: 'zap',
    description: 'Vibrant neon edge lighting',
    settings: {
      temperature: 7000,
      intensity: 1.2,
      direction: 'rim',
      shadowSoftness: 0.3,
      highlightIntensity: 0.8,
      ambientFill: 0.2,
      tint: '#00d4ff',
      secondaryTint: '#ff00ff',
    },
  },
  {
    id: 'dramatic-contrast',
    name: 'Dramatic',
    icon: 'contrast',
    description: 'High contrast cinematic lighting',
    settings: {
      temperature: 4800,
      intensity: 1.3,
      direction: 'side',
      shadowSoftness: 0.2,
      highlightIntensity: 0.7,
      ambientFill: 0.15,
    },
  },
  {
    id: 'cool-blue',
    name: 'Cool Blue',
    icon: 'moon',
    description: 'Cool moonlight/tech aesthetic',
    settings: {
      temperature: 8000,
      intensity: 0.85,
      direction: 'top-back',
      shadowSoftness: 0.5,
      highlightIntensity: 0.4,
      ambientFill: 0.35,
      tint: '#4a90d9',
    },
  },
]

// Object removal brush sizes
export const BRUSH_SIZES = [
  { id: 'small', size: 20, label: 'S' },
  { id: 'medium', size: 40, label: 'M' },
  { id: 'large', size: 80, label: 'L' },
  { id: 'xlarge', size: 120, label: 'XL' },
]

// Variant generation options
export const VARIANT_TYPES = [
  {
    id: 'headlines',
    name: 'Headline Variations',
    description: 'Generate alternative headlines and copy',
    icon: 'type',
  },
  {
    id: 'colors',
    name: 'Color Schemes',
    description: 'Create complementary color palettes',
    icon: 'palette',
  },
  {
    id: 'layouts',
    name: 'Layout Options',
    description: 'Rearrange element positions',
    icon: 'layout',
  },
]

// Default variant count options
export const VARIANT_COUNTS = [3, 5, 7]
