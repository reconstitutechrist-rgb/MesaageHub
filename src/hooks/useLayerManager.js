import { useState, useCallback, useMemo } from 'react'

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
 * @param {Partial<object>} overrides - Properties to override defaults
 * @returns {object} - New text layer object
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
 * @param {Partial<object>} overrides - Properties to override defaults
 * @returns {object} - New image layer object
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
 * @param {Partial<object>} overrides - Properties to override defaults
 * @returns {object} - New background layer object
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
 * @param {object} textOverlay - Legacy text overlay { text, x, y, color, fontSize, isDragging }
 * @returns {object} - Layer object
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
 * @param {object} layer - Text layer object
 * @returns {object} - Legacy textOverlay format
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
 * Hook for managing canvas layers
 * @param {object[]} initialLayers - Initial layers array
 * @returns {object} - Layer management methods and state
 */
export function useLayerManager(initialLayers = []) {
  const [layers, setLayers] = useState(initialLayers)
  const [selectedLayerId, setSelectedLayerId] = useState(null)

  /**
   * Get layers sorted by zIndex for rendering
   */
  const sortedLayers = useMemo(() => {
    return [...layers].sort((a, b) => a.zIndex - b.zIndex)
  }, [layers])

  /**
   * Get the currently selected layer
   */
  const selectedLayer = useMemo(() => {
    return layers.find((l) => l.id === selectedLayerId) || null
  }, [layers, selectedLayerId])

  /**
   * Add a new layer
   */
  const addLayer = useCallback((layer) => {
    setLayers((prev) => [...prev, layer])
    setSelectedLayerId(layer.id)
  }, [])

  /**
   * Add a new text layer with optional initial text
   */
  const addTextLayer = useCallback(
    (text = 'New Text', options = {}) => {
      const layer = createTextLayer({
        data: { text, ...options },
      })
      addLayer(layer)
      return layer
    },
    [addLayer]
  )

  /**
   * Remove a layer by ID
   */
  const removeLayer = useCallback(
    (layerId) => {
      setLayers((prev) => prev.filter((l) => l.id !== layerId))
      if (selectedLayerId === layerId) {
        setSelectedLayerId(null)
      }
    },
    [selectedLayerId]
  )

  /**
   * Update a layer's properties
   */
  const updateLayer = useCallback((layerId, updates) => {
    setLayers((prev) =>
      prev.map((layer) => {
        if (layer.id !== layerId) return layer
        return {
          ...layer,
          ...updates,
          data: updates.data ? { ...layer.data, ...updates.data } : layer.data,
        }
      })
    )
  }, [])

  /**
   * Update the selected layer's data
   */
  const updateSelectedLayer = useCallback(
    (dataUpdates) => {
      if (!selectedLayerId) return
      updateLayer(selectedLayerId, { data: dataUpdates })
    },
    [selectedLayerId, updateLayer]
  )

  /**
   * Select a layer
   */
  const selectLayer = useCallback((layerId) => {
    setSelectedLayerId(layerId)
  }, [])

  /**
   * Clear selection
   */
  const clearSelection = useCallback(() => {
    setSelectedLayerId(null)
  }, [])

  /**
   * Toggle layer visibility
   */
  const toggleLayerVisibility = useCallback(
    (layerId) => {
      updateLayer(layerId, { visible: !layers.find((l) => l.id === layerId)?.visible })
    },
    [layers, updateLayer]
  )

  /**
   * Toggle layer lock
   */
  const toggleLayerLock = useCallback(
    (layerId) => {
      updateLayer(layerId, { locked: !layers.find((l) => l.id === layerId)?.locked })
    },
    [layers, updateLayer]
  )

  /**
   * Move a layer up in z-order
   */
  const moveLayerUp = useCallback((layerId) => {
    setLayers((prev) => {
      const sorted = [...prev].sort((a, b) => a.zIndex - b.zIndex)
      const index = sorted.findIndex((l) => l.id === layerId)
      if (index === sorted.length - 1) return prev // Already at top

      const currentLayer = sorted[index]
      const layerAbove = sorted[index + 1]

      return prev.map((l) => {
        if (l.id === currentLayer.id) return { ...l, zIndex: layerAbove.zIndex }
        if (l.id === layerAbove.id) return { ...l, zIndex: currentLayer.zIndex }
        return l
      })
    })
  }, [])

  /**
   * Move a layer down in z-order
   */
  const moveLayerDown = useCallback((layerId) => {
    setLayers((prev) => {
      const sorted = [...prev].sort((a, b) => a.zIndex - b.zIndex)
      const index = sorted.findIndex((l) => l.id === layerId)
      if (index === 0) return prev // Already at bottom

      const currentLayer = sorted[index]
      const layerBelow = sorted[index - 1]

      return prev.map((l) => {
        if (l.id === currentLayer.id) return { ...l, zIndex: layerBelow.zIndex }
        if (l.id === layerBelow.id) return { ...l, zIndex: currentLayer.zIndex }
        return l
      })
    })
  }, [])

  /**
   * Duplicate a layer
   */
  const duplicateLayer = useCallback(
    (layerId) => {
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
    [layers, addLayer]
  )

  /**
   * Clear all layers
   */
  const clearLayers = useCallback(() => {
    setLayers([])
    setSelectedLayerId(null)
  }, [])

  /**
   * Set all layers at once (for bulk operations or restoration)
   */
  const setAllLayers = useCallback((newLayers) => {
    setLayers(newLayers)
  }, [])

  /**
   * Get all text layers
   */
  const textLayers = useMemo(() => {
    return layers.filter((l) => l.type === LayerType.TEXT)
  }, [layers])

  /**
   * Get all image layers
   */
  const imageLayers = useMemo(() => {
    return layers.filter((l) => l.type === LayerType.IMAGE)
  }, [layers])

  return {
    // State
    layers,
    sortedLayers,
    selectedLayerId,
    selectedLayer,
    textLayers,
    imageLayers,

    // Layer operations
    addLayer,
    addTextLayer,
    removeLayer,
    updateLayer,
    updateSelectedLayer,
    selectLayer,
    clearSelection,
    duplicateLayer,
    clearLayers,
    setAllLayers,

    // Layer properties
    toggleLayerVisibility,
    toggleLayerLock,
    moveLayerUp,
    moveLayerDown,
  }
}
