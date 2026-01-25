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
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = URL.createObjectURL(file)
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
