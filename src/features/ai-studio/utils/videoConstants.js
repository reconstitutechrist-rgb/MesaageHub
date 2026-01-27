/**
 * Video-related constants for AI Studio Phase 3
 */

// Video model definitions
export const VIDEO_MODELS = {
  'veo-3.1': {
    id: 'veo-3.1',
    name: 'Veo 3.1',
    provider: 'Google',
    description: '4K cinematic clips with native audio',
    features: ['4K resolution', 'Native audio', 'Cinematic quality'],
    maxDuration: 8,
    supportedAspectRatios: ['16:9', '9:16', '1:1'],
  },
  'sora-2': {
    id: 'sora-2',
    name: 'Sora 2',
    provider: 'OpenAI',
    description: 'Complex physics and extended duration',
    features: ['Complex physics', 'Extended duration', 'Realistic motion'],
    maxDuration: 20,
    supportedAspectRatios: ['16:9', '9:16', '1:1'],
  },
}

// Default video model
export const DEFAULT_VIDEO_MODEL = 'veo-3.1'

// Video generation styles
export const VIDEO_STYLES = [
  { id: 'cinematic', name: 'Cinematic', description: 'Professional film-like quality' },
  { id: 'dynamic', name: 'Dynamic', description: 'Fast-paced, energetic' },
  { id: 'calm', name: 'Calm', description: 'Slow, peaceful, serene' },
]

// Default video duration in seconds
export const DEFAULT_VIDEO_DURATION = 8

// Video overlay animation types
export const OVERLAY_ANIMATIONS = [
  { id: 'none', name: 'None', description: 'No animation' },
  { id: 'fade-in', name: 'Fade In', description: 'Gradually appears' },
  { id: 'slide-up', name: 'Slide Up', description: 'Slides in from bottom' },
  { id: 'scale', name: 'Scale', description: 'Grows from center' },
]

// Default overlay styles
export const DEFAULT_OVERLAY_STYLE = {
  color: '#ffffff',
  fontSize: 48,
  fontWeight: 'bold',
  shadow: true,
}

// Default overlay position (center)
export const DEFAULT_OVERLAY_POSITION = {
  x: 50, // percentage
  y: 50, // percentage
}

// Overlay font size presets
export const FONT_SIZE_PRESETS = [
  { id: 'small', name: 'Small', value: 32 },
  { id: 'medium', name: 'Medium', value: 42 },
  { id: 'large', name: 'Large', value: 56 },
  { id: 'xlarge', name: 'Extra Large', value: 72 },
]

// Font weight presets
export const FONT_WEIGHT_PRESETS = [
  { id: 'normal', name: 'Normal', value: '400' },
  { id: 'medium', name: 'Medium', value: '500' },
  { id: 'semibold', name: 'Semi-Bold', value: '600' },
  { id: 'bold', name: 'Bold', value: '700' },
  { id: 'extrabold', name: 'Extra Bold', value: '800' },
]

// Video export formats
export const VIDEO_EXPORT_FORMATS = [
  { id: 'mp4', name: 'MP4', description: 'Universal compatibility' },
  { id: 'webm', name: 'WebM', description: 'Web-optimized' },
]

// Video export resolutions
export const VIDEO_EXPORT_RESOLUTIONS = [
  { id: '1080p', name: '1080p HD', width: 1920, height: 1080 },
  { id: '4k', name: '4K Ultra HD', width: 3840, height: 2160 },
]

// Polling configuration
export const VIDEO_POLLING_CONFIG = {
  initialDelay: 3000, // 3 seconds
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 1.2,
  maxAttempts: 60,
}

// Progress milestones for UX
export const PROGRESS_MILESTONES = {
  STARTED: 5,
  PROCESSING: 25,
  RENDERING: 50,
  ENCODING: 75,
  FINALIZING: 90,
  COMPLETE: 100,
}

export default {
  VIDEO_MODELS,
  DEFAULT_VIDEO_MODEL,
  VIDEO_STYLES,
  DEFAULT_VIDEO_DURATION,
  OVERLAY_ANIMATIONS,
  DEFAULT_OVERLAY_STYLE,
  DEFAULT_OVERLAY_POSITION,
  FONT_SIZE_PRESETS,
  FONT_WEIGHT_PRESETS,
  VIDEO_EXPORT_FORMATS,
  VIDEO_EXPORT_RESOLUTIONS,
  VIDEO_POLLING_CONFIG,
  PROGRESS_MILESTONES,
}
