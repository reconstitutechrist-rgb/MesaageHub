/**
 * Canvas Logic Utilities
 *
 * Centralized pure functions for dimension calculations.
 * Separated to break circular dependencies between slices and selectors.
 */
import { platformPresets } from '@/lib/platformTemplates'
import { CANVAS_CONSTRAINTS } from './studioConstants'

// Re-export safe zone utilities for convenience
export {
  PLATFORM_SAFE_ZONES,
  getSafeZone,
  getSafeZoneBounds,
  isInSafeZone,
  adjustToSafeZone,
} from './crossPlatformAdapter'

/**
 * Scale dimensions to fit within max constraints while maintaining aspect ratio
 */
export function scaleToFit(width, height, maxWidth, maxHeight) {
  const scaleX = maxWidth / width
  const scaleY = maxHeight / height
  const scale = Math.min(scaleX, scaleY, 1) // Don't scale up

  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
    scale,
  }
}

/**
 * Compute canvas dimensions from platform
 * Pure function for use in store and selectors
 */
export function computeCanvasDimensions(platform) {
  const preset = platformPresets[platform] || platformPresets['instagram-post']
  const { MAX_DISPLAY_WIDTH, MAX_DISPLAY_HEIGHT } = CANVAS_CONSTRAINTS
  const scaled = scaleToFit(preset.width, preset.height, MAX_DISPLAY_WIDTH, MAX_DISPLAY_HEIGHT)

  return {
    currentPreset: preset,
    exportWidth: preset.width,
    exportHeight: preset.height,
    canvasWidth: scaled.width,
    canvasHeight: scaled.height,
  }
}
