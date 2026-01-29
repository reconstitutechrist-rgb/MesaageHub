/**
 * Canvas Web Worker
 *
 * Handles heavy computations for the canvas editor:
 * - Hit testing with pre-calculated bounds
 * - Layer sorting
 * - Batch position calculations
 * - Export coordinate transformations
 */

/**
 * Message handler for incoming work requests
 */
self.onmessage = function (e) {
  const { type, payload, id } = e.data

  let result
  try {
    switch (type) {
      case 'hitTest':
        result = hitTestLayers(payload)
        break
      case 'calculatePositions':
        result = calculateLayerPositions(payload)
        break
      case 'sortLayers':
        result = sortLayersByZIndex(payload)
        break
      case 'calculateExportCoords':
        result = calculateExportCoordinates(payload)
        break
      case 'calculateAllBounds':
        result = calculateAllLayerBounds(payload)
        break
      default:
        result = { error: `Unknown message type: ${type}` }
    }
  } catch (error) {
    result = { error: error.message }
  }

  self.postMessage({ id, type, result })
}

/**
 * Hit test layers to find which layer is at a given point
 * Uses pre-calculated bounds from main thread
 *
 * @param {object} payload
 * @param {number} payload.x - X coordinate to test
 * @param {number} payload.y - Y coordinate to test
 * @param {Array} payload.layerBounds - Array of { id, bounds: { x, y, width, height }, visible, locked }
 * @param {number} payload.padding - Hit detection padding
 * @returns {string|null} - ID of hit layer or null
 */
function hitTestLayers({ x, y, layerBounds, padding = 20 }) {
  // Check layers in reverse order (top first, highest zIndex)
  for (let i = layerBounds.length - 1; i >= 0; i--) {
    const layer = layerBounds[i]
    if (!layer.visible || layer.locked || !layer.bounds) continue

    const bounds = layer.bounds
    if (
      x >= bounds.x - padding &&
      x <= bounds.x + bounds.width + padding &&
      y >= bounds.y - padding &&
      y <= bounds.y + bounds.height + padding
    ) {
      return layer.id
    }
  }

  return null
}

/**
 * Calculate pixel positions for all layers from percentage values
 *
 * @param {object} payload
 * @param {Array} payload.layers - Array of layer objects with data.x and data.y as percentages
 * @param {number} payload.canvasWidth - Canvas width in pixels
 * @param {number} payload.canvasHeight - Canvas height in pixels
 * @returns {Array} - Array of { id, x, y } with pixel positions
 */
function calculateLayerPositions({ layers, canvasWidth, canvasHeight }) {
  return layers.map((layer) => {
    if (!layer.data) return { id: layer.id, x: 0, y: 0 }

    return {
      id: layer.id,
      x: (layer.data.x / 100) * canvasWidth,
      y: (layer.data.y / 100) * canvasHeight,
    }
  })
}

/**
 * Sort layers by zIndex for rendering order
 *
 * @param {object} payload
 * @param {Array} payload.layers - Array of layer objects
 * @returns {Array} - Sorted array of layer IDs
 */
function sortLayersByZIndex({ layers }) {
  const sorted = [...layers].sort((a, b) => a.zIndex - b.zIndex)
  return sorted.map((layer) => layer.id)
}

/**
 * Calculate export coordinates for all layers
 * Transforms from source canvas to export canvas dimensions
 *
 * @param {object} payload
 * @param {Array} payload.layers - Array of layer objects
 * @param {number} payload.srcWidth - Source canvas width
 * @param {number} payload.srcHeight - Source canvas height
 * @param {number} payload.exportWidth - Export canvas width
 * @param {number} payload.exportHeight - Export canvas height
 * @returns {Array} - Array of { id, x, y, fontSize } with scaled values
 */
function calculateExportCoordinates({ layers, srcWidth, srcHeight, exportWidth, exportHeight }) {
  const scaleX = exportWidth / srcWidth
  const scaleY = exportHeight / srcHeight

  return layers.map((layer) => {
    if (!layer.data) return { id: layer.id }

    const result = {
      id: layer.id,
    }

    // Convert percentage to export pixels
    if (layer.data.x !== undefined) {
      result.x = (layer.data.x / 100) * exportWidth
    }
    if (layer.data.y !== undefined) {
      result.y = (layer.data.y / 100) * exportHeight
    }

    // Scale font size
    if (layer.data.fontSize !== undefined) {
      result.fontSize = layer.data.fontSize * scaleX
    }

    // Scale shadow if present
    if (layer.data.shadow) {
      result.shadow = {
        ...layer.data.shadow,
        blur: layer.data.shadow.blur * scaleX,
        offsetX: layer.data.shadow.offsetX * scaleX,
        offsetY: layer.data.shadow.offsetY * scaleY,
      }
    }

    return result
  })
}

/**
 * Calculate bounds for all layers
 * Note: This uses approximate text bounds since we don't have canvas context
 * The main thread should call measureText and send actual bounds for accurate hit testing
 *
 * @param {object} payload
 * @param {Array} payload.layers - Array of layer objects
 * @param {number} payload.canvasWidth - Canvas width in pixels
 * @param {number} payload.canvasHeight - Canvas height in pixels
 * @returns {Array} - Array of { id, bounds, visible, locked }
 */
function calculateAllLayerBounds({ layers, canvasWidth, canvasHeight }) {
  return layers.map((layer) => {
    if (!layer.data || layer.type !== 'text') {
      return {
        id: layer.id,
        bounds: null,
        visible: layer.visible,
        locked: layer.locked,
        zIndex: layer.zIndex,
      }
    }

    const x = (layer.data.x / 100) * canvasWidth
    const y = (layer.data.y / 100) * canvasHeight
    const fontSize = layer.data.fontSize || 48

    // Approximate text width (average 0.6 chars per fontSize)
    const text = layer.data.text || ''
    const approxWidth = text.length * fontSize * 0.6
    const height = fontSize

    // Adjust for text alignment
    let boundsX = x
    const textAlign = layer.data.textAlign || 'center'
    if (textAlign === 'center') {
      boundsX = x - approxWidth / 2
    } else if (textAlign === 'right') {
      boundsX = x - approxWidth
    }

    return {
      id: layer.id,
      bounds: {
        x: boundsX,
        y: y - height / 2,
        width: approxWidth,
        height: height,
      },
      visible: layer.visible,
      locked: layer.locked,
      zIndex: layer.zIndex,
    }
  })
}
