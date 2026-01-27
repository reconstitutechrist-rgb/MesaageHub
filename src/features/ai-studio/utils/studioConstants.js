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
