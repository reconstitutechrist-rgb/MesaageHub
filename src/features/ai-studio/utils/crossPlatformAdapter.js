/**
 * Cross-Platform Adapter Utility
 *
 * Handles smart resizing of designs across multiple social media platforms,
 * respecting safe zones and maintaining visual integrity.
 */

import { platformPresets } from '@/lib/platformTemplates'

// ============================================
// SAFE ZONE DEFINITIONS
// ============================================

/**
 * Safe zones define areas where important content should be placed
 * to avoid cropping on different platforms/devices.
 *
 * Values are percentages from edges (0-100 scale)
 */
export const PLATFORM_SAFE_ZONES = {
  // Instagram has different safe zones for posts vs stories
  'instagram-post': {
    top: 5,
    bottom: 5,
    left: 5,
    right: 5,
    description: 'Minimal safe zone for square posts',
  },
  'instagram-story': {
    top: 14, // Account for status bar and app UI
    bottom: 20, // Account for swipe up, stickers area
    left: 5,
    right: 5,
    description: 'Avoid top/bottom for Stories UI elements',
  },

  // TikTok has UI overlays
  tiktok: {
    top: 15, // For app bar
    bottom: 25, // For comments, buttons, description
    left: 5,
    right: 20, // For like/comment/share buttons
    description: 'Avoid right side and bottom for TikTok UI',
  },

  // Facebook variations
  'facebook-post': {
    top: 5,
    bottom: 10,
    left: 5,
    right: 5,
    description: 'Standard Facebook post safe zone',
  },
  'facebook-post-square': {
    top: 5,
    bottom: 5,
    left: 5,
    right: 5,
    description: 'Square Facebook post',
  },
  'facebook-story': {
    top: 12,
    bottom: 18,
    left: 5,
    right: 5,
    description: 'Facebook Stories safe zone',
  },

  // Other platforms
  pinterest: {
    top: 5,
    bottom: 15, // For pin title overlay
    left: 5,
    right: 5,
    description: 'Pinterest pin with title space',
  },
  twitter: {
    top: 5,
    bottom: 5,
    left: 5,
    right: 5,
    description: 'Twitter/X landscape post',
  },
  'youtube-thumbnail': {
    top: 5,
    bottom: 20, // For timestamp overlay
    left: 5,
    right: 20, // For duration badge
    description: 'YouTube thumbnail with timestamp area',
  },
  linkedin: {
    top: 5,
    bottom: 5,
    left: 5,
    right: 5,
    description: 'LinkedIn post safe zone',
  },

  // Default fallback
  custom: {
    top: 5,
    bottom: 5,
    left: 5,
    right: 5,
    description: 'Default safe zone',
  },
}

// ============================================
// PLATFORM GROUPINGS FOR BATCH EXPORT
// ============================================

export const PLATFORM_GROUPS = {
  'social-all': {
    label: 'All Social Media',
    platforms: ['instagram-post', 'instagram-story', 'facebook-post', 'tiktok', 'twitter'],
  },
  'instagram-full': {
    label: 'Instagram Complete',
    platforms: ['instagram-post', 'instagram-story'],
  },
  stories: {
    label: 'All Stories',
    platforms: ['instagram-story', 'facebook-story', 'tiktok'],
  },
  'feed-posts': {
    label: 'Feed Posts',
    platforms: ['instagram-post', 'facebook-post-square', 'twitter', 'linkedin'],
  },
  ecommerce: {
    label: 'E-Commerce',
    platforms: ['instagram-post', 'pinterest', 'facebook-post'],
  },
}

// ============================================
// SCALING STRATEGIES
// ============================================

export const ScalingStrategy = {
  FIT: 'fit', // Fit entire design, may have letterboxing
  FILL: 'fill', // Fill canvas, may crop edges
  SMART: 'smart', // Intelligently reposition elements
}

// ============================================
// ADAPTER FUNCTIONS
// ============================================

/**
 * Get safe zone for a platform
 */
export function getSafeZone(platformId) {
  return PLATFORM_SAFE_ZONES[platformId] || PLATFORM_SAFE_ZONES.custom
}

/**
 * Calculate safe zone bounds in pixels
 */
export function getSafeZoneBounds(platformId, width, height) {
  const safeZone = getSafeZone(platformId)

  return {
    top: Math.round((safeZone.top / 100) * height),
    bottom: Math.round((safeZone.bottom / 100) * height),
    left: Math.round((safeZone.left / 100) * width),
    right: Math.round((safeZone.right / 100) * width),
    // Usable area
    usableWidth: width - Math.round(((safeZone.left + safeZone.right) / 100) * width),
    usableHeight: height - Math.round(((safeZone.top + safeZone.bottom) / 100) * height),
    usableX: Math.round((safeZone.left / 100) * width),
    usableY: Math.round((safeZone.top / 100) * height),
  }
}

/**
 * Check if a layer position is within the safe zone
 * Note: canvasWidth/Height params kept for API consistency but not needed since positions are percentages
 */
export function isInSafeZone(layer, platformId, _canvasWidth, _canvasHeight) {
  const safeZone = getSafeZone(platformId)

  // Layer position is in percentages (0-100)
  const layerX = layer.data?.x ?? 50
  const layerY = layer.data?.y ?? 50

  return (
    layerX >= safeZone.left &&
    layerX <= 100 - safeZone.right &&
    layerY >= safeZone.top &&
    layerY <= 100 - safeZone.bottom
  )
}

/**
 * Adjust layer position to fit within safe zone
 */
export function adjustToSafeZone(layer, platformId) {
  const safeZone = getSafeZone(platformId)

  const x = layer.data?.x ?? 50
  const y = layer.data?.y ?? 50

  const adjustedX = Math.max(safeZone.left + 2, Math.min(98 - safeZone.right, x))
  const adjustedY = Math.max(safeZone.top + 2, Math.min(98 - safeZone.bottom, y))

  return {
    ...layer,
    data: {
      ...layer.data,
      x: adjustedX,
      y: adjustedY,
    },
  }
}

/**
 * Calculate text scale factor for different aspect ratios
 */
export function calculateTextScale(sourcePreset, targetPreset) {
  const sourceArea = sourcePreset.width * sourcePreset.height
  const targetArea = targetPreset.width * targetPreset.height

  // Base scale on area ratio, with dampening
  const areaRatio = Math.sqrt(targetArea / sourceArea)

  // Consider aspect ratio differences
  const sourceAspect = sourcePreset.width / sourcePreset.height
  const targetAspect = targetPreset.width / targetPreset.height

  // Reduce text size more for extreme aspect ratio changes
  const aspectDiff = Math.abs(sourceAspect - targetAspect)
  const aspectFactor = 1 - aspectDiff * 0.15

  return Math.min(1.5, Math.max(0.5, areaRatio * aspectFactor))
}

/**
 * Adapt a layer for a target platform
 */
export function adaptLayer(
  layer,
  sourcePlatform,
  targetPlatform,
  strategy = ScalingStrategy.SMART
) {
  const sourcePreset = platformPresets[sourcePlatform] || platformPresets['instagram-post']
  const targetPreset = platformPresets[targetPlatform] || platformPresets['instagram-post']

  if (sourcePlatform === targetPlatform) {
    return layer
  }

  // Start with a copy
  let adaptedLayer = JSON.parse(JSON.stringify(layer))

  // Calculate scaling
  const textScale = calculateTextScale(sourcePreset, targetPreset)

  // Adjust based on layer type
  switch (layer.type) {
    case 'text':
    case 'badge':
    case 'cta':
    case 'price':
    case 'countdown':
    case 'stock':
      // Scale font size
      if (adaptedLayer.data.fontSize) {
        adaptedLayer.data.fontSize = Math.round(adaptedLayer.data.fontSize * textScale)
      }

      // Adjust position for safe zones if using smart strategy
      if (strategy === ScalingStrategy.SMART) {
        adaptedLayer = adjustToSafeZone(adaptedLayer, targetPlatform)
      }
      break

    case 'image':
      // Images may need repositioning for different aspect ratios
      if (strategy === ScalingStrategy.SMART) {
        adaptedLayer = adjustToSafeZone(adaptedLayer, targetPlatform)
      }
      break

    case 'qrcode':
      // QR codes should remain legible
      if (adaptedLayer.data.size) {
        adaptedLayer.data.size = Math.max(80, Math.round(adaptedLayer.data.size * textScale))
      }
      if (strategy === ScalingStrategy.SMART) {
        adaptedLayer = adjustToSafeZone(adaptedLayer, targetPlatform)
      }
      break
  }

  return adaptedLayer
}

/**
 * Adapt all layers for a target platform
 */
export function adaptDesign(
  layers,
  sourcePlatform,
  targetPlatform,
  strategy = ScalingStrategy.SMART
) {
  return layers.map((layer) => adaptLayer(layer, sourcePlatform, targetPlatform, strategy))
}

/**
 * Generate export configurations for multiple platforms
 */
export function generateMultiPlatformExports(layers, sourcePlatform, targetPlatforms) {
  return targetPlatforms.map((targetPlatform) => {
    const targetPreset = platformPresets[targetPlatform]
    const adaptedLayers = adaptDesign(layers, sourcePlatform, targetPlatform)

    return {
      platform: targetPlatform,
      preset: targetPreset,
      layers: adaptedLayers,
      filename: `${targetPlatform}-${Date.now()}`,
      dimensions: {
        width: targetPreset.width,
        height: targetPreset.height,
      },
    }
  })
}

/**
 * Estimate export time for batch export
 */
export function estimateExportTime(platformCount, hasAILayers = false) {
  const baseTimePerPlatform = 500 // ms
  const aiLayerMultiplier = hasAILayers ? 2 : 1

  return platformCount * baseTimePerPlatform * aiLayerMultiplier
}

/**
 * Get recommended platforms based on source platform
 */
export function getRecommendedPlatforms(sourcePlatform) {
  const sourcePreset = platformPresets[sourcePlatform]
  if (!sourcePreset) return []

  const sourceAspect = sourcePreset.width / sourcePreset.height

  // Find platforms with similar or complementary aspect ratios
  return Object.entries(platformPresets)
    .filter(([id]) => id !== sourcePlatform && id !== 'custom')
    .map(([id, preset]) => {
      const targetAspect = preset.width / preset.height
      const aspectDiff = Math.abs(sourceAspect - targetAspect)

      // Score based on similarity (lower is better)
      const score = aspectDiff

      return {
        id,
        preset,
        score,
        isRecommended: aspectDiff < 0.5,
      }
    })
    .sort((a, b) => a.score - b.score)
}

/**
 * Check if a design will need significant adjustments for a platform
 */
export function checkAdaptationComplexity(layers, sourcePlatform, targetPlatform) {
  const sourcePreset = platformPresets[sourcePlatform]
  const targetPreset = platformPresets[targetPlatform]

  if (!sourcePreset || !targetPreset) return 'unknown'

  const sourceAspect = sourcePreset.width / sourcePreset.height
  const targetAspect = targetPreset.width / targetPreset.height
  const aspectDiff = Math.abs(sourceAspect - targetAspect)

  // Count layers that may need adjustment
  const layersNeedingAdjustment = layers.filter(
    (layer) => !isInSafeZone(layer, targetPlatform, targetPreset.width, targetPreset.height)
  ).length

  if (aspectDiff < 0.2 && layersNeedingAdjustment === 0) return 'simple'
  if (aspectDiff < 0.5 && layersNeedingAdjustment <= 2) return 'moderate'
  return 'complex'
}

export default {
  PLATFORM_SAFE_ZONES,
  PLATFORM_GROUPS,
  ScalingStrategy,
  getSafeZone,
  getSafeZoneBounds,
  isInSafeZone,
  adjustToSafeZone,
  calculateTextScale,
  adaptLayer,
  adaptDesign,
  generateMultiPlatformExports,
  estimateExportTime,
  getRecommendedPlatforms,
  checkAdaptationComplexity,
}
