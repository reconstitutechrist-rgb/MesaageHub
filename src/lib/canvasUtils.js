/**
 * Canvas Utilities - Common drawing functions for the AI Studio canvas editor
 */

/**
 * Draw a background on the canvas (solid color or gradient)
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {object|null} background - Background config { type: 'solid' | 'gradient', value: string | string[] }
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {string} fallbackColor - Default background color if no background specified
 */
export function drawBackground(ctx, background, width, height, fallbackColor = '#f1f5f9') {
  if (background) {
    if (background.type === 'gradient' && Array.isArray(background.value)) {
      const gradient = ctx.createLinearGradient(0, 0, width, height)
      gradient.addColorStop(0, background.value[0])
      gradient.addColorStop(1, background.value[1])
      ctx.fillStyle = gradient
    } else {
      ctx.fillStyle = background.value
    }
  } else {
    ctx.fillStyle = fallbackColor
  }
  ctx.fillRect(0, 0, width, height)
}

/**
 * Draw text with optional shadow on the canvas
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {object} textData - Text configuration
 * @param {string} textData.text - The text content
 * @param {number} textData.x - X position
 * @param {number} textData.y - Y position
 * @param {string} textData.color - Text color
 * @param {number} textData.fontSize - Font size in pixels
 * @param {string} [textData.fontWeight='bold'] - Font weight
 * @param {string} [textData.fontFamily] - Font family
 * @param {string} [textData.textAlign='center'] - Text alignment
 * @param {object} [textData.shadow] - Shadow configuration
 */
export function drawText(ctx, textData) {
  if (!textData.text) return

  const {
    text,
    x,
    y,
    color = '#ffffff',
    fontSize = 48,
    fontWeight = 'bold',
    fontFamily = '-apple-system, BlinkMacSystemFont, sans-serif',
    textAlign = 'center',
    shadow = { color: 'rgba(0,0,0,0.5)', blur: 8, offsetX: 2, offsetY: 2 },
  } = textData

  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`
  ctx.fillStyle = color
  ctx.textAlign = textAlign

  if (shadow) {
    ctx.shadowColor = shadow.color
    ctx.shadowBlur = shadow.blur
    ctx.shadowOffsetX = shadow.offsetX || 0
    ctx.shadowOffsetY = shadow.offsetY || 0
  }

  ctx.fillText(text, x, y)

  // Reset shadow
  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 0
}

/**
 * Draw an image scaled to fit the canvas
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {HTMLImageElement} img - Image element to draw
 * @param {number} canvasWidth - Canvas width
 * @param {number} canvasHeight - Canvas height
 * @param {string} [fit='contain'] - How to fit the image: 'contain', 'cover', or 'fill'
 */
export function drawImage(ctx, img, canvasWidth, canvasHeight, fit = 'contain') {
  if (!img || !img.complete) return

  let drawX = 0
  let drawY = 0
  let drawWidth = canvasWidth
  let drawHeight = canvasHeight

  if (fit === 'contain' || fit === 'cover') {
    const imgRatio = img.width / img.height
    const canvasRatio = canvasWidth / canvasHeight

    if (fit === 'contain') {
      if (imgRatio > canvasRatio) {
        // Image is wider - fit to width
        drawWidth = canvasWidth
        drawHeight = canvasWidth / imgRatio
        drawY = (canvasHeight - drawHeight) / 2
      } else {
        // Image is taller - fit to height
        drawHeight = canvasHeight
        drawWidth = canvasHeight * imgRatio
        drawX = (canvasWidth - drawWidth) / 2
      }
    } else {
      // cover - fill the canvas, possibly cropping
      if (imgRatio > canvasRatio) {
        drawHeight = canvasHeight
        drawWidth = canvasHeight * imgRatio
        drawX = (canvasWidth - drawWidth) / 2
      } else {
        drawWidth = canvasWidth
        drawHeight = canvasWidth / imgRatio
        drawY = (canvasHeight - drawHeight) / 2
      }
    }
  }

  ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight)
}

/**
 * Draw template elements on the canvas
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {object} template - Template with elements array
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 */
export function drawTemplateElements(ctx, template, width, height) {
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

/**
 * Draw a grid pattern (for empty canvas state)
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {string} lineColor - Grid line color
 * @param {number} gridSize - Size of grid cells
 */
export function drawGrid(ctx, width, height, lineColor = 'rgba(0,0,0,0.05)', gridSize = 20) {
  ctx.strokeStyle = lineColor
  ctx.lineWidth = 1

  for (let x = 0; x <= width; x += gridSize) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.stroke()
  }

  for (let y = 0; y <= height; y += gridSize) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
  }
}

/**
 * Draw a selection indicator around a layer
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {object} bounds - { x, y, width, height } of the selection
 * @param {string} color - Selection border color
 */
export function drawSelectionIndicator(ctx, bounds, color = '#00bcd4') {
  const padding = 10
  ctx.strokeStyle = color
  ctx.lineWidth = 2
  ctx.setLineDash([5, 5])
  ctx.strokeRect(
    bounds.x - padding,
    bounds.y - padding,
    bounds.width + padding * 2,
    bounds.height + padding * 2
  )
  ctx.setLineDash([])
}

/**
 * Get text metrics for hit detection
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {object} textData - Text configuration
 * @returns {object} - { x, y, width, height } bounds of the text
 */
export function getTextBounds(ctx, textData) {
  const {
    text,
    x,
    y,
    fontSize = 48,
    fontWeight = 'bold',
    fontFamily = '-apple-system, BlinkMacSystemFont, sans-serif',
    textAlign = 'center',
  } = textData

  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`
  const metrics = ctx.measureText(text)
  const width = metrics.width
  const height = fontSize // Approximate height

  let boundsX = x
  if (textAlign === 'center') {
    boundsX = x - width / 2
  } else if (textAlign === 'right') {
    boundsX = x - width
  }

  return {
    x: boundsX,
    y: y - height / 2,
    width,
    height,
  }
}

/**
 * Create a high-resolution export canvas from a display canvas
 * @param {HTMLCanvasElement} displayCanvas - The source display canvas
 * @param {number} exportWidth - Target export width
 * @param {number} exportHeight - Target export height
 * @param {function} drawCallback - Function to redraw content at export scale, receives (ctx, scaleX, scaleY)
 * @returns {HTMLCanvasElement} - The export canvas
 */
export function createExportCanvas(displayCanvas, exportWidth, exportHeight, drawCallback) {
  const exportCanvas = document.createElement('canvas')
  exportCanvas.width = exportWidth
  exportCanvas.height = exportHeight
  const ctx = exportCanvas.getContext('2d')

  const scaleX = exportWidth / displayCanvas.width
  const scaleY = exportHeight / displayCanvas.height

  drawCallback(ctx, scaleX, scaleY, exportWidth, exportHeight)

  return exportCanvas
}

/**
 * Convert canvas to data URL
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @param {string} format - Image format ('image/png', 'image/jpeg')
 * @param {number} quality - Quality for JPEG (0-1)
 * @returns {string} - Data URL
 */
export function canvasToDataUrl(canvas, format = 'image/png', quality = 0.92) {
  return canvas.toDataURL(format, quality)
}

/**
 * Convert canvas to Blob
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @param {string} format - Image format
 * @param {number} quality - Quality for JPEG
 * @returns {Promise<Blob>} - Blob promise
 */
export function canvasToBlob(canvas, format = 'image/png', quality = 0.92) {
  return new Promise((resolve) => {
    canvas.toBlob(resolve, format, quality)
  })
}

/**
 * Load an image from a File or Blob
 * @param {File|Blob} file - Image file
 * @returns {Promise<HTMLImageElement>} - Loaded image element
 */
export function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = (err) => {
      URL.revokeObjectURL(url)
      reject(err)
    }
    img.src = url
  })
}

/**
 * Load an image from a URL
 * @param {string} url - Image URL
 * @returns {Promise<HTMLImageElement>} - Loaded image element
 */
export function loadImageFromUrl(url) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = url
  })
}

// ============================================
// PROMOTIONAL ELEMENT DRAWING FUNCTIONS
// ============================================

/**
 * Draw a badge (e.g., "50% OFF", "NEW", "HOT")
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {object} layer - Badge layer data
 * @param {number} canvasWidth - Canvas width
 * @param {number} canvasHeight - Canvas height
 */
export function drawBadge(ctx, layer, canvasWidth, canvasHeight) {
  const { data } = layer
  const x = (data.x / 100) * canvasWidth
  const y = (data.y / 100) * canvasHeight
  const size = data.width || 100
  const halfSize = size / 2

  ctx.save()

  // Apply rotation if set
  if (data.rotation) {
    ctx.translate(x, y)
    ctx.rotate((data.rotation * Math.PI) / 180)
    ctx.translate(-x, -y)
  }

  // Draw badge based on style
  const style = data.style || 'circle'

  if (style === 'circle') {
    ctx.beginPath()
    ctx.arc(x, y, halfSize, 0, Math.PI * 2)
    ctx.fillStyle = data.background || '#ef4444'
    ctx.fill()
  } else if (style === 'tag') {
    const padding = 16
    ctx.font = `${data.fontWeight || '700'} ${data.fontSize || 24}px -apple-system, sans-serif`
    const textWidth = ctx.measureText(data.label || '').width
    const tagWidth = textWidth + padding * 2
    const tagHeight = (data.fontSize || 24) + padding

    ctx.fillStyle = data.background || '#ef4444'
    ctx.beginPath()
    ctx.roundRect(x - tagWidth / 2, y - tagHeight / 2, tagWidth, tagHeight, 4)
    ctx.fill()
  } else if (style === 'burst') {
    // Star burst shape
    ctx.fillStyle = data.background || '#ef4444'
    ctx.beginPath()
    const points = 12
    const outerRadius = halfSize
    const innerRadius = halfSize * 0.6
    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius
      const angle = (i * Math.PI) / points - Math.PI / 2
      const px = x + radius * Math.cos(angle)
      const py = y + radius * Math.sin(angle)
      if (i === 0) ctx.moveTo(px, py)
      else ctx.lineTo(px, py)
    }
    ctx.closePath()
    ctx.fill()
  } else if (style === 'ribbon' || style === 'banner') {
    const padding = 24
    ctx.font = `${data.fontWeight || '700'} ${data.fontSize || 24}px -apple-system, sans-serif`
    const textWidth = ctx.measureText(data.label || '').width
    const ribbonWidth = textWidth + padding * 2
    const ribbonHeight = (data.fontSize || 24) + 16

    if (style === 'banner' && data.rotation !== 0) {
      ctx.translate(x, y)
      ctx.rotate(-15 * (Math.PI / 180))
      ctx.translate(-x, -y)
    }

    ctx.fillStyle = data.background || '#ef4444'
    ctx.fillRect(x - ribbonWidth / 2, y - ribbonHeight / 2, ribbonWidth, ribbonHeight)
  }

  // Draw label text
  if (data.label) {
    ctx.font = `${data.fontWeight || '700'} ${data.fontSize || 24}px -apple-system, sans-serif`
    ctx.fillStyle = data.textColor || '#ffffff'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(data.label, x, y)
  }

  ctx.restore()
}

/**
 * Draw a CTA button
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {object} layer - CTA layer data
 * @param {number} canvasWidth - Canvas width
 * @param {number} canvasHeight - Canvas height
 */
export function drawCTA(ctx, layer, canvasWidth, canvasHeight) {
  const { data } = layer
  const x = (data.x / 100) * canvasWidth
  const y = (data.y / 100) * canvasHeight
  const fontSize = data.fontSize || 16
  const padding = { x: 24, y: 12 }
  const borderRadius = data.borderRadius || 8

  ctx.save()

  // Measure text to determine button size
  ctx.font = `${data.fontWeight || '600'} ${fontSize}px -apple-system, sans-serif`
  const textWidth = ctx.measureText(data.label || 'Shop Now').width
  const buttonWidth = textWidth + padding.x * 2
  const buttonHeight = fontSize + padding.y * 2

  const buttonX = x - buttonWidth / 2
  const buttonY = y - buttonHeight / 2

  // Draw button background
  ctx.beginPath()
  ctx.roundRect(buttonX, buttonY, buttonWidth, buttonHeight, borderRadius)

  if (data.style === 'gradient' && data.background?.startsWith('linear-gradient')) {
    // Parse gradient and create canvas gradient
    const gradient = ctx.createLinearGradient(buttonX, buttonY, buttonX + buttonWidth, buttonY)
    gradient.addColorStop(0, '#ec4899')
    gradient.addColorStop(1, '#f59e0b')
    ctx.fillStyle = gradient
  } else if (data.style === 'outline') {
    ctx.fillStyle = 'transparent'
    ctx.strokeStyle = data.borderColor || data.textColor || '#3b82f6'
    ctx.lineWidth = 2
    ctx.stroke()
  } else {
    ctx.fillStyle = data.background || '#3b82f6'
  }

  if (data.style !== 'outline') {
    ctx.fill()
  }

  // Draw shadow for solid/gradient buttons
  if (data.style !== 'outline') {
    ctx.shadowColor = 'rgba(0,0,0,0.2)'
    ctx.shadowBlur = 8
    ctx.shadowOffsetY = 4
  }

  // Draw label
  ctx.fillStyle = data.textColor || '#ffffff'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(data.label || 'Shop Now', x, y)

  ctx.restore()
}

/**
 * Draw a price display
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {object} layer - Price layer data
 * @param {number} canvasWidth - Canvas width
 * @param {number} canvasHeight - Canvas height
 */
export function drawPrice(ctx, layer, canvasWidth, canvasHeight) {
  const { data } = layer
  const x = (data.x / 100) * canvasWidth
  const y = (data.y / 100) * canvasHeight
  const fontSize = data.fontSize || 32
  const currency = data.currency || '$'

  ctx.save()
  ctx.textAlign = 'center'

  // Draw original price (strikethrough)
  if (data.originalPrice && data.showOriginal !== false) {
    const originalText = `${currency}${data.originalPrice.toFixed(2)}`
    ctx.font = `400 ${fontSize * 0.6}px -apple-system, sans-serif`
    ctx.fillStyle = data.originalColor || '#9ca3af'

    const originalWidth = ctx.measureText(originalText).width
    ctx.fillText(originalText, x, y - fontSize * 0.5)

    // Strikethrough line
    ctx.strokeStyle = data.originalColor || '#9ca3af'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(x - originalWidth / 2 - 5, y - fontSize * 0.5)
    ctx.lineTo(x + originalWidth / 2 + 5, y - fontSize * 0.5)
    ctx.stroke()
  }

  // Draw sale price
  const saleText = `${currency}${(data.salePrice || 0).toFixed(2)}`
  ctx.font = `700 ${fontSize}px -apple-system, sans-serif`
  ctx.fillStyle = data.saleColor || '#ef4444'
  ctx.fillText(saleText, x, y + fontSize * 0.3)

  ctx.restore()
}

/**
 * Draw a countdown timer
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {object} layer - Countdown layer data
 * @param {number} canvasWidth - Canvas width
 * @param {number} canvasHeight - Canvas height
 */
export function drawCountdown(ctx, layer, canvasWidth, canvasHeight) {
  const { data } = layer
  const x = (data.x / 100) * canvasWidth
  const y = (data.y / 100) * canvasHeight
  const fontSize = data.fontSize || 24

  // Calculate time remaining
  const endDate = new Date(data.endDate)
  const now = new Date()
  const diff = Math.max(0, endDate.getTime() - now.getTime())

  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  const pad = (n) => String(n).padStart(2, '0')
  const timeString = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`

  ctx.save()

  const style = data.style || 'boxes'

  if (style === 'boxes') {
    const boxSize = fontSize * 1.5
    const gap = 8
    const totalWidth = boxSize * 3 + gap * 2
    const startX = x - totalWidth / 2

    const parts = [pad(hours), pad(minutes), pad(seconds)]
    const labels = ['HRS', 'MIN', 'SEC']

    parts.forEach((part, i) => {
      const boxX = startX + i * (boxSize + gap)

      // Draw box background
      ctx.fillStyle = data.background || '#1a1a2e'
      ctx.beginPath()
      ctx.roundRect(boxX, y - boxSize / 2, boxSize, boxSize, 6)
      ctx.fill()

      // Draw number
      ctx.font = `700 ${fontSize}px -apple-system, sans-serif`
      ctx.fillStyle = data.textColor || '#ffffff'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(part, boxX + boxSize / 2, y)

      // Draw label
      if (data.showLabels !== false) {
        ctx.font = `500 ${fontSize * 0.4}px -apple-system, sans-serif`
        ctx.fillStyle = data.accentColor || '#ef4444'
        ctx.fillText(labels[i], boxX + boxSize / 2, y + boxSize / 2 + fontSize * 0.4)
      }
    })
  } else {
    // Inline style
    ctx.font = `700 ${fontSize}px -apple-system, sans-serif`
    ctx.fillStyle = data.textColor || '#ffffff'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(timeString, x, y)
  }

  ctx.restore()
}

/**
 * Draw a stock indicator
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {object} layer - Stock indicator layer data
 * @param {number} canvasWidth - Canvas width
 * @param {number} canvasHeight - Canvas height
 */
export function drawStockIndicator(ctx, layer, canvasWidth, canvasHeight) {
  const { data } = layer
  const x = (data.x / 100) * canvasWidth
  const y = (data.y / 100) * canvasHeight
  const fontSize = data.fontSize || 14

  ctx.save()

  const template = data.template || 'Only {count} left!'
  const message = template.replace('{count}', data.count || 0)

  // Background pill
  ctx.font = `600 ${fontSize}px -apple-system, sans-serif`
  const textWidth = ctx.measureText(message).width
  const pillPadding = { x: 12, y: 6 }
  const pillWidth = textWidth + pillPadding.x * 2
  const pillHeight = fontSize + pillPadding.y * 2

  ctx.fillStyle = data.urgencyColor || '#ef4444'
  ctx.beginPath()
  ctx.roundRect(x - pillWidth / 2, y - pillHeight / 2, pillWidth, pillHeight, pillHeight / 2)
  ctx.fill()

  // Text
  ctx.fillStyle = data.textColor || '#ffffff'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(message, x, y)

  ctx.restore()
}

/**
 * Draw a QR code
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {object} layer - QR code layer data
 * @param {number} canvasWidth - Canvas width
 * @param {number} canvasHeight - Canvas height
 * @param {HTMLImageElement|null} qrImage - Pre-generated QR code image
 */
export function drawQRCode(ctx, layer, canvasWidth, canvasHeight, qrImage = null) {
  const { data } = layer
  const x = (data.x / 100) * canvasWidth
  const y = (data.y / 100) * canvasHeight
  const size = data.size || 120

  ctx.save()

  if (qrImage && qrImage.complete) {
    // Draw the pre-generated QR image
    ctx.drawImage(qrImage, x - size / 2, y - size / 2, size, size)
  } else {
    // Draw placeholder
    ctx.fillStyle = data.background || '#ffffff'
    ctx.fillRect(x - size / 2, y - size / 2, size, size)

    ctx.strokeStyle = data.foreground || '#000000'
    ctx.lineWidth = 2
    ctx.strokeRect(x - size / 2 + 4, y - size / 2 + 4, size - 8, size - 8)

    ctx.font = `600 ${size / 4}px -apple-system, sans-serif`
    ctx.fillStyle = data.foreground || '#000000'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('QR', x, y)
  }

  ctx.restore()
}

/**
 * Draw a product tag hotspot (dot + tooltip with product info)
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {object} layer - Product tag layer data
 * @param {number} canvasWidth - Canvas width
 * @param {number} canvasHeight - Canvas height
 */
export function drawProductTag(ctx, layer, canvasWidth, canvasHeight) {
  const { data } = layer
  const x = (data.x / 100) * canvasWidth
  const y = (data.y / 100) * canvasHeight
  const fontSize = data.fontSize || 12
  const dotRadius = 8
  const dotColor = data.dotColor || '#3b82f6'

  ctx.save()

  // Draw pulsing outer ring
  ctx.beginPath()
  ctx.arc(x, y, dotRadius + 4, 0, Math.PI * 2)
  ctx.fillStyle = dotColor + '40'
  ctx.fill()

  // Draw solid dot
  ctx.beginPath()
  ctx.arc(x, y, dotRadius, 0, Math.PI * 2)
  ctx.fillStyle = dotColor
  ctx.fill()

  // Draw inner highlight
  ctx.beginPath()
  ctx.arc(x - 2, y - 2, 3, 0, Math.PI * 2)
  ctx.fillStyle = '#ffffff80'
  ctx.fill()

  // Draw tooltip if product has a name or price
  const hasName = !!data.productName
  const hasPrice = data.productPrice !== null && data.productPrice !== undefined

  if (hasName || hasPrice) {
    const tooltipBg = data.tooltipBg || '#1a1a2e'
    const tooltipTextColor = data.tooltipTextColor || '#ffffff'
    const padding = { x: 10, y: 6 }

    ctx.font = `600 ${fontSize}px -apple-system, sans-serif`
    const nameWidth = hasName ? ctx.measureText(data.productName).width : 0

    let priceText = ''
    let priceWidth = 0
    if (hasPrice) {
      priceText = `$${Number(data.productPrice).toFixed(2)}`
      ctx.font = `700 ${fontSize}px -apple-system, sans-serif`
      priceWidth = ctx.measureText(priceText).width
    }

    const gap = hasName && priceText ? 8 : 0
    const contentWidth = nameWidth + gap + priceWidth
    const tooltipWidth = contentWidth + padding.x * 2
    const tooltipHeight = fontSize + padding.y * 2

    // Position tooltip below the dot
    const tooltipX = x - tooltipWidth / 2
    const tooltipY = y + dotRadius + 8

    // Draw tooltip background with shadow
    ctx.shadowColor = 'rgba(0,0,0,0.3)'
    ctx.shadowBlur = 6
    ctx.shadowOffsetY = 2
    ctx.fillStyle = tooltipBg
    ctx.beginPath()
    ctx.roundRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight, 6)
    ctx.fill()

    // Reset shadow
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
    ctx.shadowOffsetY = 0

    // Draw tooltip arrow
    ctx.fillStyle = tooltipBg
    ctx.beginPath()
    ctx.moveTo(x - 5, tooltipY)
    ctx.lineTo(x, tooltipY - 5)
    ctx.lineTo(x + 5, tooltipY)
    ctx.closePath()
    ctx.fill()

    // Draw product name
    let textX = tooltipX + padding.x
    const textY = tooltipY + tooltipHeight / 2
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'

    if (hasName) {
      ctx.font = `600 ${fontSize}px -apple-system, sans-serif`
      ctx.fillStyle = tooltipTextColor
      ctx.fillText(data.productName, textX, textY)
      textX += nameWidth + gap
    }

    // Draw price badge
    if (priceText) {
      ctx.font = `700 ${fontSize}px -apple-system, sans-serif`
      ctx.fillStyle = dotColor
      ctx.fillText(priceText, textX, textY)
    }
  }

  ctx.restore()
}

/**
 * Draw any promotional layer based on its type
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {object} layer - Layer data
 * @param {number} canvasWidth - Canvas width
 * @param {number} canvasHeight - Canvas height
 * @param {object} extras - Additional assets (e.g., qrImages map)
 */
export function drawPromotionalLayer(ctx, layer, canvasWidth, canvasHeight, extras = {}) {
  if (!layer.visible) return

  switch (layer.type) {
    case 'badge':
      drawBadge(ctx, layer, canvasWidth, canvasHeight)
      break
    case 'cta':
      drawCTA(ctx, layer, canvasWidth, canvasHeight)
      break
    case 'price':
      drawPrice(ctx, layer, canvasWidth, canvasHeight)
      break
    case 'countdown':
      drawCountdown(ctx, layer, canvasWidth, canvasHeight)
      break
    case 'stock':
      drawStockIndicator(ctx, layer, canvasWidth, canvasHeight)
      break
    case 'qrcode':
      drawQRCode(ctx, layer, canvasWidth, canvasHeight, extras.qrImages?.[layer.id])
      break
    case 'product-tag':
      drawProductTag(ctx, layer, canvasWidth, canvasHeight)
      break
    default:
      // Unknown promotional type
      break
  }
}
