/**
 * Layer Slice - Manages canvas layers with undo/redo support
 *
 * Migrated from useLayerManager hook
 */

import { HISTORY_LIMIT } from '../../utils/studioConstants'
import {
  PromotionalElementType,
  DEFAULT_BADGE,
  DEFAULT_CTA,
  DEFAULT_PRICE,
  DEFAULT_COUNTDOWN,
  DEFAULT_STOCK,
  DEFAULT_QR_CODE,
  DEFAULT_PRODUCT_TAG,
  BADGE_PRESETS,
  CTA_PRESETS,
} from '../../utils/promotionalElements'

/**
 * Layer types supported by the canvas editor
 */
export const LayerType = {
  TEXT: 'text',
  IMAGE: 'image',
  BACKGROUND: 'background',
  // Promotional element types
  BADGE: 'badge',
  COUNTDOWN: 'countdown',
  PRICE: 'price',
  CTA: 'cta',
  QR_CODE: 'qrcode',
  STOCK_INDICATOR: 'stock',
  PRODUCT_TAG: 'product-tag',
}

// Re-export promotional element type for convenience
export { PromotionalElementType }

/**
 * Create a new text layer with default values
 */
export function createTextLayer(overrides = {}) {
  const { data: dataOverrides, ...restOverrides } = overrides
  return {
    id: `text-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: LayerType.TEXT,
    name: 'Text Layer',
    visible: true,
    locked: false,
    zIndex: 100,
    ...restOverrides,
    data: {
      text: 'New Text',
      x: 50,
      y: 50,
      color: '#ffffff',
      fontSize: 48,
      fontWeight: 'bold',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
      textAlign: 'center',
      shadow: {
        color: 'rgba(0,0,0,0.5)',
        blur: 8,
        offsetX: 2,
        offsetY: 2,
      },
      ...dataOverrides,
    },
  }
}

/**
 * Create a new image layer with default values
 */
export function createImageLayer(overrides = {}) {
  const { data: dataOverrides, ...restOverrides } = overrides
  return {
    id: `image-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: LayerType.IMAGE,
    name: 'Image Layer',
    visible: true,
    locked: false,
    zIndex: 50,
    ...restOverrides,
    data: {
      src: null,
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      fit: 'contain',
      ...dataOverrides,
    },
  }
}

/**
 * Create a background layer
 */
export function createBackgroundLayer(overrides = {}) {
  const { data: dataOverrides, ...restOverrides } = overrides
  return {
    id: 'background',
    type: LayerType.BACKGROUND,
    name: 'Background',
    visible: true,
    locked: true,
    zIndex: 0,
    ...restOverrides,
    data: {
      type: 'solid',
      value: '#f1f5f9',
      ...dataOverrides,
    },
  }
}

// ============================================
// PROMOTIONAL ELEMENT LAYER FACTORIES
// ============================================

/**
 * Create a badge layer (e.g., "50% OFF", "NEW", "HOT")
 */
export function createBadgeLayer(overrides = {}) {
  const { data: dataOverrides, ...restOverrides } = overrides
  const preset = dataOverrides?.presetId
    ? BADGE_PRESETS.find((p) => p.id === dataOverrides.presetId) || BADGE_PRESETS[0]
    : BADGE_PRESETS[0]

  return {
    id: `badge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: LayerType.BADGE,
    name: preset.label || 'Badge',
    visible: true,
    locked: false,
    zIndex: 150,
    ...restOverrides,
    data: {
      ...DEFAULT_BADGE,
      ...preset,
      presetId: preset.id,
      ...dataOverrides,
    },
  }
}

/**
 * Create a CTA button layer (e.g., "Shop Now", "Buy Today")
 */
export function createCTALayer(overrides = {}) {
  const { data: dataOverrides, ...restOverrides } = overrides
  const preset = dataOverrides?.presetId
    ? CTA_PRESETS.find((p) => p.id === dataOverrides.presetId) || CTA_PRESETS[0]
    : CTA_PRESETS[0]

  return {
    id: `cta-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: LayerType.CTA,
    name: preset.label || 'CTA Button',
    visible: true,
    locked: false,
    zIndex: 140,
    ...restOverrides,
    data: {
      ...DEFAULT_CTA,
      ...preset,
      presetId: preset.id,
      ...dataOverrides,
    },
  }
}

/**
 * Create a price display layer (was/now pricing)
 */
export function createPriceLayer(overrides = {}) {
  const { data: dataOverrides, ...restOverrides } = overrides
  return {
    id: `price-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: LayerType.PRICE,
    name: 'Price Display',
    visible: true,
    locked: false,
    zIndex: 130,
    ...restOverrides,
    data: {
      ...DEFAULT_PRICE,
      ...dataOverrides,
    },
  }
}

/**
 * Create a countdown timer layer
 */
export function createCountdownLayer(overrides = {}) {
  const { data: dataOverrides, ...restOverrides } = overrides
  return {
    id: `countdown-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: LayerType.COUNTDOWN,
    name: 'Countdown Timer',
    visible: true,
    locked: false,
    zIndex: 145,
    ...restOverrides,
    data: {
      ...DEFAULT_COUNTDOWN,
      // Default to 24 hours from now if no endDate provided
      endDate: dataOverrides?.endDate || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      ...dataOverrides,
    },
  }
}

/**
 * Create a stock indicator layer (e.g., "Only 5 left!")
 */
export function createStockIndicatorLayer(overrides = {}) {
  const { data: dataOverrides, ...restOverrides } = overrides
  return {
    id: `stock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: LayerType.STOCK_INDICATOR,
    name: 'Stock Indicator',
    visible: true,
    locked: false,
    zIndex: 135,
    ...restOverrides,
    data: {
      ...DEFAULT_STOCK,
      ...dataOverrides,
    },
  }
}

/**
 * Create a QR code layer
 */
export function createQRCodeLayer(overrides = {}) {
  const { data: dataOverrides, ...restOverrides } = overrides
  return {
    id: `qrcode-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: LayerType.QR_CODE,
    name: 'QR Code',
    visible: true,
    locked: false,
    zIndex: 125,
    ...restOverrides,
    data: {
      ...DEFAULT_QR_CODE,
      ...dataOverrides,
    },
  }
}

/**
 * Create a product tag layer (shoppable hotspot)
 */
export function createProductTagLayer(overrides = {}) {
  const { data: dataOverrides, ...restOverrides } = overrides
  return {
    id: `product-tag-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: LayerType.PRODUCT_TAG,
    name: dataOverrides?.productName || 'Product Tag',
    visible: true,
    locked: false,
    zIndex: 155,
    ...restOverrides,
    data: {
      ...DEFAULT_PRODUCT_TAG,
      ...dataOverrides,
    },
  }
}

/**
 * Create a promotional element layer by type
 */
export function createPromotionalLayer(elementType, overrides = {}) {
  switch (elementType) {
    case PromotionalElementType.BADGE:
    case LayerType.BADGE:
      return createBadgeLayer(overrides)
    case PromotionalElementType.CTA:
    case LayerType.CTA:
      return createCTALayer(overrides)
    case PromotionalElementType.PRICE:
    case LayerType.PRICE:
      return createPriceLayer(overrides)
    case PromotionalElementType.COUNTDOWN:
    case LayerType.COUNTDOWN:
      return createCountdownLayer(overrides)
    case PromotionalElementType.STOCK_INDICATOR:
    case LayerType.STOCK_INDICATOR:
      return createStockIndicatorLayer(overrides)
    case PromotionalElementType.QR_CODE:
    case LayerType.QR_CODE:
      return createQRCodeLayer(overrides)
    case PromotionalElementType.PRODUCT_TAG:
    case LayerType.PRODUCT_TAG:
      return createProductTagLayer(overrides)
    default:
      console.warn(`Unknown promotional element type: ${elementType}`)
      return null
  }
}

/**
 * Convert a legacy textOverlay object to a layer format
 */
export function textOverlayToLayer(textOverlay) {
  return createTextLayer({
    id: 'text-layer-1',
    name: 'Text Layer',
    data: {
      text: textOverlay.text || '',
      x: textOverlay.x,
      y: textOverlay.y,
      color: textOverlay.color || '#ffffff',
      fontSize: textOverlay.fontSize || 48,
    },
  })
}

/**
 * Convert a layer back to legacy textOverlay format
 */
export function layerToTextOverlay(layer) {
  if (layer.type !== LayerType.TEXT) {
    return { text: '', x: 50, y: 50, color: '#ffffff', fontSize: 48, isDragging: false }
  }
  return {
    text: layer.data.text,
    x: layer.data.x,
    y: layer.data.y,
    color: layer.data.color,
    fontSize: layer.data.fontSize,
    isDragging: false,
  }
}

/**
 * Layer slice for Zustand store
 */
export const createLayerSlice = (set, get) => ({
  // State
  layers: [],
  selectedLayerId: null,

  // History for undo/redo (internal)
  _history: [[]],
  _historyIndex: 0,

  // Push to history (internal helper)
  _pushToHistory: (newLayers) => {
    const { _history, _historyIndex } = get()
    // Truncate any redo states
    const truncated = _history.slice(0, _historyIndex + 1)
    // Deep clone
    const cloned = JSON.parse(JSON.stringify(newLayers))
    const updated = [...truncated, cloned]
    // Enforce limit
    if (updated.length > HISTORY_LIMIT) {
      updated.shift()
      set({ _history: updated, _historyIndex: updated.length - 1 })
    } else {
      set({ _history: updated, _historyIndex: updated.length - 1 })
    }
  },

  // Add a new layer
  addLayer: (layer) => {
    const newLayers = [...get().layers, layer]
    set({ layers: newLayers, selectedLayerId: layer.id })
    get()._pushToHistory(newLayers)
  },

  // Add a new text layer with optional initial text
  addTextLayer: (text = 'New Text', options = {}) => {
    const layer = createTextLayer({
      zIndex: Math.max(100, ...get().layers.map((l) => l.zIndex)) + 1,
      data: { text, ...options },
    })
    get().addLayer(layer)
    return layer
  },

  // Add a badge layer (e.g., "50% OFF", "NEW")
  addBadgeLayer: (presetId = 'sale-50', options = {}) => {
    const layer = createBadgeLayer({
      zIndex: Math.max(100, ...get().layers.map((l) => l.zIndex)) + 1,
      data: { presetId, ...options },
    })
    get().addLayer(layer)
    return layer
  },

  // Add a CTA button layer
  addCTALayer: (presetId = 'shop-now', options = {}) => {
    const layer = createCTALayer({
      zIndex: Math.max(100, ...get().layers.map((l) => l.zIndex)) + 1,
      data: { presetId, ...options },
    })
    get().addLayer(layer)
    return layer
  },

  // Add a price display layer
  addPriceLayer: (originalPrice = 99.99, salePrice = 49.99, options = {}) => {
    const layer = createPriceLayer({
      zIndex: Math.max(100, ...get().layers.map((l) => l.zIndex)) + 1,
      data: { originalPrice, salePrice, ...options },
    })
    get().addLayer(layer)
    return layer
  },

  // Add a countdown timer layer
  addCountdownLayer: (endDate = null, options = {}) => {
    const layer = createCountdownLayer({
      zIndex: Math.max(100, ...get().layers.map((l) => l.zIndex)) + 1,
      data: {
        endDate: endDate || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        ...options,
      },
    })
    get().addLayer(layer)
    return layer
  },

  // Add a stock indicator layer
  addStockIndicatorLayer: (count = 5, options = {}) => {
    const layer = createStockIndicatorLayer({
      zIndex: Math.max(100, ...get().layers.map((l) => l.zIndex)) + 1,
      data: { count, ...options },
    })
    get().addLayer(layer)
    return layer
  },

  // Add a QR code layer
  addQRCodeLayer: (data = '', options = {}) => {
    const layer = createQRCodeLayer({
      zIndex: Math.max(100, ...get().layers.map((l) => l.zIndex)) + 1,
      data: { data, ...options },
    })
    get().addLayer(layer)
    return layer
  },

  // Add a product tag layer (shoppable hotspot)
  addProductTagLayer: (product = {}, options = {}) => {
    const layer = createProductTagLayer({
      zIndex: Math.max(100, ...get().layers.map((l) => l.zIndex)) + 1,
      data: {
        productId: product.id || null,
        productName: product.name || '',
        productPrice: product.price || null,
        productUrl: product.productUrl || '',
        productSku: product.sku || '',
        ...options,
      },
    })
    get().addLayer(layer)
    return layer
  },

  // Add any promotional layer by type
  addPromotionalLayer: (elementType, options = {}) => {
    const layer = createPromotionalLayer(elementType, {
      zIndex: Math.max(100, ...get().layers.map((l) => l.zIndex)) + 1,
      data: options,
    })
    if (layer) {
      get().addLayer(layer)
    }
    return layer
  },

  // Remove a layer by ID
  removeLayer: (layerId) => {
    const { layers, selectedLayerId } = get()
    const newLayers = layers.filter((l) => l.id !== layerId)
    set({
      layers: newLayers,
      selectedLayerId: selectedLayerId === layerId ? null : selectedLayerId,
    })
    get()._pushToHistory(newLayers)
  },

  // Update a layer's properties
  updateLayer: (layerId, updates, skipHistory = false) => {
    const newLayers = get().layers.map((layer) => {
      if (layer.id !== layerId) return layer
      return {
        ...layer,
        ...updates,
        data: updates.data ? { ...layer.data, ...updates.data } : layer.data,
      }
    })
    set({ layers: newLayers })
    if (!skipHistory) {
      get()._pushToHistory(newLayers)
    }
  },

  // Update the selected layer's data
  updateSelectedLayer: (dataUpdates) => {
    const { selectedLayerId, updateLayer } = get()
    if (!selectedLayerId) return
    updateLayer(selectedLayerId, { data: dataUpdates })
  },

  // Select a layer
  selectLayer: (layerId) => {
    set({ selectedLayerId: layerId })
  },

  // Clear selection
  clearSelection: () => {
    set({ selectedLayerId: null })
  },

  // Toggle layer visibility
  toggleLayerVisibility: (layerId) => {
    const layer = get().layers.find((l) => l.id === layerId)
    if (layer) {
      get().updateLayer(layerId, { visible: !layer.visible })
    }
  },

  // Toggle layer lock
  toggleLayerLock: (layerId) => {
    const layer = get().layers.find((l) => l.id === layerId)
    if (layer) {
      get().updateLayer(layerId, { locked: !layer.locked })
    }
  },

  // Move a layer up in z-order
  moveLayerUp: (layerId) => {
    const { layers } = get()
    const sorted = [...layers].sort((a, b) => a.zIndex - b.zIndex)
    const index = sorted.findIndex((l) => l.id === layerId)
    if (index === sorted.length - 1) return // Already at top

    const currentLayer = sorted[index]
    const layerAbove = sorted[index + 1]

    const newLayers = layers.map((l) => {
      if (l.id === currentLayer.id) return { ...l, zIndex: layerAbove.zIndex }
      if (l.id === layerAbove.id) return { ...l, zIndex: currentLayer.zIndex }
      return l
    })
    set({ layers: newLayers })
    get()._pushToHistory(newLayers)
  },

  // Move a layer down in z-order
  moveLayerDown: (layerId) => {
    const { layers } = get()
    const sorted = [...layers].sort((a, b) => a.zIndex - b.zIndex)
    const index = sorted.findIndex((l) => l.id === layerId)
    if (index === 0) return // Already at bottom

    const currentLayer = sorted[index]
    const layerBelow = sorted[index - 1]

    const newLayers = layers.map((l) => {
      if (l.id === currentLayer.id) return { ...l, zIndex: layerBelow.zIndex }
      if (l.id === layerBelow.id) return { ...l, zIndex: currentLayer.zIndex }
      return l
    })
    set({ layers: newLayers })
    get()._pushToHistory(newLayers)
  },

  // Duplicate a layer
  duplicateLayer: (layerId) => {
    const { layers, addLayer } = get()
    const layer = layers.find((l) => l.id === layerId)
    if (!layer) return null

    const newLayer = {
      ...layer,
      id: `${layer.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: `${layer.name} Copy`,
      zIndex: Math.max(...layers.map((l) => l.zIndex)) + 1,
      data: { ...layer.data },
    }

    // Offset position slightly for visibility based on layer type
    const positionableTypes = [
      LayerType.TEXT,
      LayerType.BADGE,
      LayerType.CTA,
      LayerType.PRICE,
      LayerType.COUNTDOWN,
      LayerType.STOCK_INDICATOR,
      LayerType.QR_CODE,
      LayerType.PRODUCT_TAG,
    ]

    if (positionableTypes.includes(newLayer.type)) {
      newLayer.data.x = Math.min(100, (newLayer.data.x || 50) + 5)
      newLayer.data.y = Math.min(100, (newLayer.data.y || 50) + 5)
    }

    addLayer(newLayer)
    return newLayer
  },

  // Clear all layers
  clearLayers: () => {
    set({ layers: [], selectedLayerId: null })
    get()._pushToHistory([])
  },

  // Set all layers at once (for bulk operations or restoration)
  setAllLayers: (newLayers, skipHistory = false) => {
    set({ layers: newLayers })
    if (!skipHistory) {
      get()._pushToHistory(newLayers)
    }
  },

  // Undo last action
  undo: () => {
    const { _history, _historyIndex } = get()
    if (_historyIndex > 0) {
      const newIndex = _historyIndex - 1
      const previousState = JSON.parse(JSON.stringify(_history[newIndex]))
      set({ layers: previousState, _historyIndex: newIndex })
    }
  },

  // Redo last undone action
  redo: () => {
    const { _history, _historyIndex } = get()
    if (_historyIndex < _history.length - 1) {
      const newIndex = _historyIndex + 1
      const nextState = JSON.parse(JSON.stringify(_history[newIndex]))
      set({ layers: nextState, _historyIndex: newIndex })
    }
  },

  // Reset layer state (called by global reset)
  resetLayerState: () => {
    set({
      layers: [],
      selectedLayerId: null,
      _history: [[]],
      _historyIndex: 0,
    })
  },
})
