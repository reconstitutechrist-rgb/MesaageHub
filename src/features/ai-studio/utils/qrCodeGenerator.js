/**
 * QR Code Generator Utility
 *
 * Generates QR codes for SMS links, product URLs, and custom data.
 * Uses a canvas-based approach for rendering QR codes.
 */

// QR Code error correction levels
export const ErrorCorrectionLevel = {
  L: 'L', // ~7% error correction
  M: 'M', // ~15% error correction
  Q: 'Q', // ~25% error correction
  H: 'H', // ~30% error correction
}

// QR Code presets for common use cases
export const QR_PRESETS = [
  {
    id: 'sms-inquiry',
    name: 'SMS Inquiry',
    template: 'sms:{phone}?body={message}',
    defaultMessage: "Hi! I saw your promotion and I'm interested in learning more.",
    icon: 'message',
  },
  {
    id: 'sms-order',
    name: 'SMS Order',
    template: 'sms:{phone}?body={message}',
    defaultMessage: "Hi! I'd like to place an order.",
    icon: 'shopping-cart',
  },
  {
    id: 'product-link',
    name: 'Product Link',
    template: '{url}',
    icon: 'link',
  },
  {
    id: 'website',
    name: 'Website',
    template: '{url}',
    icon: 'globe',
  },
  {
    id: 'phone-call',
    name: 'Phone Call',
    template: 'tel:{phone}',
    icon: 'phone',
  },
  {
    id: 'email',
    name: 'Email',
    template: 'mailto:{email}?subject={subject}&body={body}',
    icon: 'mail',
  },
]

/**
 * Generate SMS URI for QR code
 */
export function generateSMSUri(phoneNumber, message = '') {
  const cleanPhone = phoneNumber.replace(/[^0-9+]/g, '')
  const encodedMessage = encodeURIComponent(message)
  return `sms:${cleanPhone}?body=${encodedMessage}`
}

/**
 * Generate tel URI for QR code
 */
export function generateTelUri(phoneNumber) {
  const cleanPhone = phoneNumber.replace(/[^0-9+]/g, '')
  return `tel:${cleanPhone}`
}

/**
 * Generate mailto URI for QR code
 */
export function generateMailtoUri(email, subject = '', body = '') {
  const params = []
  if (subject) params.push(`subject=${encodeURIComponent(subject)}`)
  if (body) params.push(`body=${encodeURIComponent(body)}`)
  const queryString = params.length > 0 ? `?${params.join('&')}` : ''
  return `mailto:${email}${queryString}`
}

/**
 * Generate QR code data from preset
 */
export function generateQRDataFromPreset(presetId, variables = {}) {
  const preset = QR_PRESETS.find((p) => p.id === presetId)
  if (!preset) return variables.url || variables.data || ''

  let data = preset.template

  // Replace template variables
  Object.entries(variables).forEach(([key, value]) => {
    data = data.replace(`{${key}}`, encodeURIComponent(value || ''))
  })

  // Handle special cases
  if (presetId === 'sms-inquiry' || presetId === 'sms-order') {
    const message = variables.message || preset.defaultMessage || ''
    return generateSMSUri(variables.phone || '', message)
  }

  return data
}

/**
 * QR Code Matrix Generator
 * Simple implementation for generating QR code data matrices
 */
class QRCodeMatrix {
  constructor(data, errorCorrectionLevel = 'M') {
    this.data = data
    this.errorCorrectionLevel = errorCorrectionLevel
    this.matrix = null
    this.size = 0
  }

  // Generate a simple QR-like pattern (simplified implementation)
  // For production, use a proper QR library like qrcode or qr.js
  generate() {
    const dataLength = this.data.length
    // Calculate size based on data length (simplified)
    this.size = Math.max(21, Math.ceil(Math.sqrt(dataLength * 8)) + 10)
    if (this.size % 2 === 0) this.size++

    this.matrix = Array(this.size)
      .fill(null)
      .map(() => Array(this.size).fill(false))

    // Add finder patterns (corners)
    this.addFinderPattern(0, 0)
    this.addFinderPattern(this.size - 7, 0)
    this.addFinderPattern(0, this.size - 7)

    // Add timing patterns
    this.addTimingPatterns()

    // Add alignment pattern (for larger codes)
    if (this.size >= 25) {
      this.addAlignmentPattern(this.size - 9, this.size - 9)
    }

    // Encode data (simplified - creates a visual pattern based on data)
    this.encodeData()

    return this.matrix
  }

  addFinderPattern(x, y) {
    // Outer border
    for (let i = 0; i < 7; i++) {
      this.matrix[y][x + i] = true
      this.matrix[y + 6][x + i] = true
      this.matrix[y + i][x] = true
      this.matrix[y + i][x + 6] = true
    }
    // Inner square
    for (let i = 2; i < 5; i++) {
      for (let j = 2; j < 5; j++) {
        this.matrix[y + i][x + j] = true
      }
    }
  }

  addTimingPatterns() {
    for (let i = 8; i < this.size - 8; i++) {
      const value = i % 2 === 0
      this.matrix[6][i] = value
      this.matrix[i][6] = value
    }
  }

  addAlignmentPattern(x, y) {
    for (let i = -2; i <= 2; i++) {
      for (let j = -2; j <= 2; j++) {
        const isOuter = Math.abs(i) === 2 || Math.abs(j) === 2
        const isCenter = i === 0 && j === 0
        this.matrix[y + i][x + j] = isOuter || isCenter
      }
    }
  }

  encodeData() {
    // Simple hash-based encoding for visual representation
    // This creates a deterministic pattern based on the data string
    const hash = this.simpleHash(this.data)

    let bit = 0
    for (let y = this.size - 1; y >= 9; y--) {
      for (let x = this.size - 1; x >= 9; x--) {
        // Skip if already set (finder/timing patterns)
        if (this.matrix[y][x]) continue

        // Use hash bits to determine module state
        const hashBit = (hash >> (bit % 32)) & 1
        const dataBit = this.data.charCodeAt(bit % this.data.length) & 1
        this.matrix[y][x] = (hashBit ^ dataBit ^ ((x + y) % 2)) === 1

        bit++
      }
    }
  }

  simpleHash(str) {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32bit integer
    }
    return Math.abs(hash)
  }
}

/**
 * Generate QR code as data URL
 */
export function generateQRCodeDataURL(data, options = {}) {
  const {
    size = 200,
    foreground = '#000000',
    background = '#ffffff',
    errorCorrectionLevel = 'M',
    includeMargin = true,
    marginSize = 4,
  } = options

  if (!data) {
    return createPlaceholderQR(size, foreground, background)
  }

  const qr = new QRCodeMatrix(data, errorCorrectionLevel)
  const matrix = qr.generate()
  const moduleCount = matrix.length

  // Calculate module size
  const margin = includeMargin ? marginSize : 0
  const moduleSize = Math.floor(size / (moduleCount + margin * 2))
  const actualSize = moduleSize * (moduleCount + margin * 2)

  // Create canvas
  const canvas = document.createElement('canvas')
  canvas.width = actualSize
  canvas.height = actualSize
  const ctx = canvas.getContext('2d')

  // Fill background
  ctx.fillStyle = background
  ctx.fillRect(0, 0, actualSize, actualSize)

  // Draw modules
  ctx.fillStyle = foreground
  for (let y = 0; y < moduleCount; y++) {
    for (let x = 0; x < moduleCount; x++) {
      if (matrix[y][x]) {
        ctx.fillRect((x + margin) * moduleSize, (y + margin) * moduleSize, moduleSize, moduleSize)
      }
    }
  }

  return canvas.toDataURL('image/png')
}

/**
 * Create a placeholder QR code image
 */
function createPlaceholderQR(size, foreground, background) {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')

  // Background
  ctx.fillStyle = background
  ctx.fillRect(0, 0, size, size)

  // Border
  ctx.strokeStyle = foreground
  ctx.lineWidth = 2
  ctx.strokeRect(10, 10, size - 20, size - 20)

  // QR icon placeholder
  ctx.fillStyle = foreground
  ctx.font = `${size / 4}px Arial`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('QR', size / 2, size / 2)

  return canvas.toDataURL('image/png')
}

/**
 * Generate QR code for canvas rendering
 */
export async function renderQRCodeToCanvas(canvas, data, options = {}) {
  const dataURL = generateQRCodeDataURL(data, options)

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve(canvas)
    }
    img.onerror = reject
    img.src = dataURL
  })
}

/**
 * Validate QR code data
 */
export function validateQRData(data) {
  if (!data || typeof data !== 'string') {
    return { valid: false, error: 'Data is required' }
  }

  if (data.length > 2953) {
    return { valid: false, error: 'Data exceeds maximum length (2953 characters)' }
  }

  return { valid: true, error: null }
}

/**
 * Get recommended size for QR code based on data length
 */
export function getRecommendedQRSize(dataLength) {
  if (dataLength <= 50) return 120
  if (dataLength <= 100) return 150
  if (dataLength <= 200) return 180
  return 200
}

export default {
  ErrorCorrectionLevel,
  QR_PRESETS,
  generateSMSUri,
  generateTelUri,
  generateMailtoUri,
  generateQRDataFromPreset,
  generateQRCodeDataURL,
  renderQRCodeToCanvas,
  validateQRData,
  getRecommendedQRSize,
}
