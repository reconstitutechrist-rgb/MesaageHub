/**
 * Promotional Elements Utility
 *
 * Defines promotional element types, presets, and helper functions
 * for retail marketing overlays (badges, countdowns, prices, CTAs).
 */

// ============================================
// ELEMENT TYPE DEFINITIONS
// ============================================

export const PromotionalElementType = {
  BADGE: 'badge',
  COUNTDOWN: 'countdown',
  PRICE: 'price',
  CTA: 'cta',
  QR_CODE: 'qrcode',
  STOCK_INDICATOR: 'stock',
  PRODUCT_TAG: 'product-tag',
}

// ============================================
// BADGE PRESETS
// ============================================

export const BADGE_PRESETS = [
  {
    id: 'sale-50',
    label: '50% OFF',
    style: 'circle',
    background: '#ef4444',
    textColor: '#ffffff',
    icon: null,
  },
  {
    id: 'sale-25',
    label: '25% OFF',
    style: 'circle',
    background: '#f59e0b',
    textColor: '#ffffff',
    icon: null,
  },
  {
    id: 'bogo',
    label: 'BOGO',
    style: 'ribbon',
    background: '#22c55e',
    textColor: '#ffffff',
    icon: null,
  },
  {
    id: 'new',
    label: 'NEW',
    style: 'tag',
    background: '#3b82f6',
    textColor: '#ffffff',
    icon: null,
  },
  {
    id: 'hot',
    label: 'HOT',
    style: 'burst',
    background: '#ef4444',
    textColor: '#ffffff',
    icon: '🔥',
  },
  {
    id: 'limited',
    label: 'LIMITED',
    style: 'banner',
    background: '#a855f7',
    textColor: '#ffffff',
    icon: '⏰',
  },
  {
    id: 'bestseller',
    label: 'BESTSELLER',
    style: 'ribbon',
    background: '#eab308',
    textColor: '#000000',
    icon: '⭐',
  },
  {
    id: 'free-shipping',
    label: 'FREE SHIPPING',
    style: 'banner',
    background: '#06b6d4',
    textColor: '#ffffff',
    icon: '📦',
  },
  {
    id: 'flash-sale',
    label: 'FLASH SALE',
    style: 'burst',
    background: '#ec4899',
    textColor: '#ffffff',
    icon: '⚡',
  },
  {
    id: 'clearance',
    label: 'CLEARANCE',
    style: 'tag',
    background: '#dc2626',
    textColor: '#ffffff',
    icon: null,
  },
]

// ============================================
// BADGE STYLES
// ============================================

export const BADGE_STYLES = {
  circle: {
    borderRadius: '50%',
    padding: '20px',
    aspectRatio: '1',
  },
  ribbon: {
    borderRadius: '0',
    padding: '8px 24px',
    clipPath: 'polygon(0 0, 100% 0, 95% 50%, 100% 100%, 0 100%, 5% 50%)',
  },
  tag: {
    borderRadius: '4px',
    padding: '8px 16px',
  },
  burst: {
    borderRadius: '0',
    padding: '24px',
    clipPath:
      'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
  },
  banner: {
    borderRadius: '0',
    padding: '10px 32px',
    transform: 'rotate(-15deg)',
  },
}

// ============================================
// CTA BUTTON PRESETS
// ============================================

export const CTA_PRESETS = [
  {
    id: 'shop-now',
    label: 'Shop Now',
    style: 'solid',
    background: '#3b82f6',
    textColor: '#ffffff',
  },
  {
    id: 'buy-today',
    label: 'Buy Today',
    style: 'solid',
    background: '#22c55e',
    textColor: '#ffffff',
  },
  {
    id: 'learn-more',
    label: 'Learn More',
    style: 'outline',
    background: 'transparent',
    textColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  {
    id: 'get-deal',
    label: 'Get This Deal',
    style: 'gradient',
    background: 'linear-gradient(135deg, #ec4899, #f59e0b)',
    textColor: '#ffffff',
  },
  {
    id: 'order-now',
    label: 'Order Now',
    style: 'solid',
    background: '#ef4444',
    textColor: '#ffffff',
  },
  {
    id: 'text-us',
    label: 'Text Us',
    style: 'solid',
    background: '#8b5cf6',
    textColor: '#ffffff',
  },
  {
    id: 'claim-offer',
    label: 'Claim Offer',
    style: 'gradient',
    background: 'linear-gradient(135deg, #22c55e, #06b6d4)',
    textColor: '#ffffff',
  },
  {
    id: 'view-details',
    label: 'View Details',
    style: 'outline',
    background: 'transparent',
    textColor: '#ffffff',
    borderColor: '#ffffff',
  },
]

// ============================================
// CTA BUTTON STYLES
// ============================================

export const CTA_STYLES = {
  solid: {
    border: 'none',
    borderRadius: '8px',
    padding: '12px 24px',
    fontWeight: '600',
  },
  outline: {
    border: '2px solid',
    borderRadius: '8px',
    padding: '10px 22px',
    fontWeight: '600',
  },
  gradient: {
    border: 'none',
    borderRadius: '8px',
    padding: '12px 24px',
    fontWeight: '600',
  },
  pill: {
    border: 'none',
    borderRadius: '50px',
    padding: '12px 32px',
    fontWeight: '600',
  },
  square: {
    border: 'none',
    borderRadius: '0',
    padding: '14px 28px',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
}

// ============================================
// PRICE DISPLAY PRESETS
// ============================================

export const PRICE_STYLES = {
  standard: {
    layout: 'horizontal',
    showOriginal: true,
    showPercentOff: false,
  },
  stacked: {
    layout: 'vertical',
    showOriginal: true,
    showPercentOff: true,
  },
  minimal: {
    layout: 'horizontal',
    showOriginal: false,
    showPercentOff: false,
  },
  detailed: {
    layout: 'vertical',
    showOriginal: true,
    showPercentOff: true,
    showSavings: true,
  },
}

// ============================================
// STOCK INDICATOR PRESETS
// ============================================

export const STOCK_INDICATORS = [
  {
    id: 'low-stock',
    template: 'Only {count} left!',
    threshold: 10,
    urgencyColor: '#ef4444',
  },
  {
    id: 'selling-fast',
    template: 'Selling Fast!',
    threshold: 20,
    urgencyColor: '#f59e0b',
  },
  {
    id: 'in-stock',
    template: 'In Stock',
    threshold: 100,
    urgencyColor: '#22c55e',
  },
  {
    id: 'limited-quantity',
    template: 'Limited Quantity',
    threshold: 5,
    urgencyColor: '#dc2626',
  },
]

// ============================================
// COUNTDOWN TIMER PRESETS
// ============================================

export const COUNTDOWN_STYLES = {
  boxes: {
    layout: 'boxes',
    showLabels: true,
    separator: ':',
  },
  inline: {
    layout: 'inline',
    showLabels: false,
    separator: ' : ',
  },
  minimal: {
    layout: 'inline',
    showLabels: false,
    separator: ':',
  },
  detailed: {
    layout: 'boxes',
    showLabels: true,
    showDays: true,
  },
}

// ============================================
// DEFAULT ELEMENT PROPERTIES
// ============================================

export const DEFAULT_BADGE = {
  type: PromotionalElementType.BADGE,
  presetId: 'sale-50',
  label: '50% OFF',
  style: 'circle',
  background: '#ef4444',
  textColor: '#ffffff',
  fontSize: 24,
  fontWeight: '700',
  x: 10,
  y: 10,
  width: 100,
  height: 100,
  rotation: 0,
  opacity: 1,
}

export const DEFAULT_CTA = {
  type: PromotionalElementType.CTA,
  presetId: 'shop-now',
  label: 'Shop Now',
  style: 'solid',
  background: '#3b82f6',
  textColor: '#ffffff',
  fontSize: 16,
  fontWeight: '600',
  x: 50,
  y: 85,
  width: 'auto',
  height: 'auto',
  rotation: 0,
  opacity: 1,
  borderRadius: 8,
}

export const DEFAULT_PRICE = {
  type: PromotionalElementType.PRICE,
  originalPrice: 99.99,
  salePrice: 49.99,
  currency: '$',
  style: 'standard',
  originalColor: '#9ca3af',
  saleColor: '#ef4444',
  fontSize: 32,
  x: 50,
  y: 70,
  rotation: 0,
  opacity: 1,
}

export const DEFAULT_COUNTDOWN = {
  type: PromotionalElementType.COUNTDOWN,
  endDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
  style: 'boxes',
  background: '#1a1a2e',
  textColor: '#ffffff',
  accentColor: '#ef4444',
  fontSize: 24,
  showLabels: true,
  x: 50,
  y: 90,
  rotation: 0,
  opacity: 1,
}

export const DEFAULT_STOCK = {
  type: PromotionalElementType.STOCK_INDICATOR,
  count: 5,
  template: 'Only {count} left!',
  urgencyColor: '#ef4444',
  textColor: '#ffffff',
  fontSize: 14,
  x: 50,
  y: 75,
  rotation: 0,
  opacity: 1,
}

export const DEFAULT_QR_CODE = {
  type: PromotionalElementType.QR_CODE,
  data: '',
  size: 120,
  foreground: '#000000',
  background: '#ffffff',
  errorCorrectionLevel: 'M',
  includeMargin: true,
  x: 85,
  y: 85,
  rotation: 0,
  opacity: 1,
}

export const DEFAULT_PRODUCT_TAG = {
  type: PromotionalElementType.PRODUCT_TAG,
  productId: null,
  productName: '',
  productPrice: null,
  productUrl: '',
  productSku: '',
  dotColor: '#3b82f6',
  tooltipBg: '#1a1a2e',
  tooltipTextColor: '#ffffff',
  fontSize: 12,
  x: 50,
  y: 50,
  rotation: 0,
  opacity: 1,
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Calculate percentage off from original and sale price
 */
export function calculatePercentOff(originalPrice, salePrice) {
  if (!originalPrice || originalPrice <= 0) return 0
  const discount = ((originalPrice - salePrice) / originalPrice) * 100
  return Math.round(discount)
}

/**
 * Calculate savings amount
 */
export function calculateSavings(originalPrice, salePrice) {
  return Math.max(0, originalPrice - salePrice)
}

/**
 * Format price with currency symbol
 */
export function formatPrice(price, currency = '$', decimals = 2) {
  return `${currency}${price.toFixed(decimals)}`
}

/**
 * Calculate countdown time remaining
 */
export function getTimeRemaining(endDate) {
  const total = new Date(endDate).getTime() - Date.now()

  if (total <= 0) {
    return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0, expired: true }
  }

  const seconds = Math.floor((total / 1000) % 60)
  const minutes = Math.floor((total / 1000 / 60) % 60)
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24)
  const days = Math.floor(total / (1000 * 60 * 60 * 24))

  return { total, days, hours, minutes, seconds, expired: false }
}

/**
 * Format countdown for display
 */
export function formatCountdown(endDate, showDays = false) {
  const { days, hours, minutes, seconds, expired } = getTimeRemaining(endDate)

  if (expired) return 'EXPIRED'

  const pad = (n) => String(n).padStart(2, '0')

  if (showDays && days > 0) {
    return `${days}d ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
  }

  const totalHours = days * 24 + hours
  return `${pad(totalHours)}:${pad(minutes)}:${pad(seconds)}`
}

/**
 * Get stock indicator message
 */
export function getStockMessage(count, template = 'Only {count} left!') {
  return template.replace('{count}', count.toString())
}

/**
 * Get urgency level based on stock count
 */
export function getUrgencyLevel(count) {
  if (count <= 3) return 'critical'
  if (count <= 10) return 'high'
  if (count <= 20) return 'medium'
  return 'low'
}

/**
 * Get urgency color based on level
 */
export function getUrgencyColor(level) {
  const colors = {
    critical: '#dc2626',
    high: '#ef4444',
    medium: '#f59e0b',
    low: '#22c55e',
  }
  return colors[level] || colors.low
}

/**
 * Create a promotional element layer from preset
 */
export function createElementFromPreset(type, presetId, position = {}) {
  const x = position.x ?? 50
  const y = position.y ?? 50

  switch (type) {
    case PromotionalElementType.BADGE: {
      const preset = BADGE_PRESETS.find((p) => p.id === presetId) || BADGE_PRESETS[0]
      return {
        ...DEFAULT_BADGE,
        ...preset,
        presetId: preset.id,
        x,
        y,
      }
    }
    case PromotionalElementType.CTA: {
      const preset = CTA_PRESETS.find((p) => p.id === presetId) || CTA_PRESETS[0]
      return {
        ...DEFAULT_CTA,
        ...preset,
        presetId: preset.id,
        x,
        y,
      }
    }
    case PromotionalElementType.PRICE:
      return { ...DEFAULT_PRICE, x, y }
    case PromotionalElementType.COUNTDOWN:
      return { ...DEFAULT_COUNTDOWN, x, y }
    case PromotionalElementType.STOCK_INDICATOR:
      return { ...DEFAULT_STOCK, x, y }
    case PromotionalElementType.QR_CODE:
      return { ...DEFAULT_QR_CODE, x, y }
    case PromotionalElementType.PRODUCT_TAG:
      return { ...DEFAULT_PRODUCT_TAG, x, y }
    default:
      return null
  }
}

/**
 * Get element category for UI grouping
 */
export function getElementCategory(type) {
  const categories = {
    [PromotionalElementType.BADGE]: 'highlight',
    [PromotionalElementType.COUNTDOWN]: 'urgency',
    [PromotionalElementType.PRICE]: 'pricing',
    [PromotionalElementType.CTA]: 'action',
    [PromotionalElementType.QR_CODE]: 'interactive',
    [PromotionalElementType.STOCK_INDICATOR]: 'urgency',
    [PromotionalElementType.PRODUCT_TAG]: 'commerce',
  }
  return categories[type] || 'other'
}

export default {
  PromotionalElementType,
  BADGE_PRESETS,
  BADGE_STYLES,
  CTA_PRESETS,
  CTA_STYLES,
  PRICE_STYLES,
  STOCK_INDICATORS,
  COUNTDOWN_STYLES,
  DEFAULT_BADGE,
  DEFAULT_CTA,
  DEFAULT_PRICE,
  DEFAULT_COUNTDOWN,
  DEFAULT_STOCK,
  DEFAULT_QR_CODE,
  DEFAULT_PRODUCT_TAG,
  calculatePercentOff,
  calculateSavings,
  formatPrice,
  getTimeRemaining,
  formatCountdown,
  getStockMessage,
  getUrgencyLevel,
  getUrgencyColor,
  createElementFromPreset,
  getElementCategory,
}
