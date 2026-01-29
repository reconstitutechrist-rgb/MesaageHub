/**
 * Layer Slice - Manages canvas layers with undo/redo support
 *
 * Migrated from useLayerManager hook
 */

import { HISTORY_LIMIT } from '../../utils/studioConstants'

/**
 * Layer types supported by the canvas editor
 */
export const LayerType = {
  TEXT: 'text',
  IMAGE: 'image',
  BACKGROUND: 'background',
}

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

    // Offset position slightly for visibility
    if (newLayer.type === LayerType.TEXT) {
      newLayer.data.x = Math.min(100, newLayer.data.x + 5)
      newLayer.data.y = Math.min(100, newLayer.data.y + 5)
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
