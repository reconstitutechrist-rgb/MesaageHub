import { useRef, useCallback, useEffect, useState } from 'react'

/**
 * Hook to offload canvas computations to a Web Worker
 *
 * Handles:
 * - Hit testing with cached layer bounds
 * - Layer sorting by zIndex
 * - Batch position calculations
 * - Export coordinate transformations
 *
 * @returns {object} - Worker interface methods and state
 */
export function useCanvasWorker() {
  const workerRef = useRef(null)
  const callbacksRef = useRef(new Map())
  const messageIdRef = useRef(0)
  const [isReady, setIsReady] = useState(false)

  // Initialize worker
  useEffect(() => {
    try {
      workerRef.current = new Worker(new URL('../workers/canvasWorker.js', import.meta.url), {
        type: 'module',
      })

      workerRef.current.onmessage = (e) => {
        const { id, result } = e.data
        const callback = callbacksRef.current.get(id)
        if (callback) {
          callback(result)
          callbacksRef.current.delete(id)
        }
      }

      workerRef.current.onerror = (error) => {
        console.error('Canvas worker error:', error)
      }

      setIsReady(true)
    } catch (error) {
      // Web Workers not supported or worker failed to load
      console.warn('Canvas worker unavailable, falling back to main thread:', error)
      setIsReady(false)
    }

    return () => {
      workerRef.current?.terminate()
    }
  }, [])

  /**
   * Send a message to the worker and get a promise for the result
   */
  const sendMessage = useCallback((type, payload) => {
    return new Promise((resolve) => {
      if (!workerRef.current) {
        // Fallback: run on main thread
        resolve(null)
        return
      }

      const id = messageIdRef.current++
      callbacksRef.current.set(id, resolve)
      workerRef.current.postMessage({ type, payload, id })
    })
  }, [])

  /**
   * Hit test layers at a given point
   * Returns the ID of the topmost visible layer at that point, or null
   *
   * @param {number} x - X coordinate in canvas pixels
   * @param {number} y - Y coordinate in canvas pixels
   * @param {Array} layerBounds - Pre-calculated layer bounds
   * @param {number} padding - Hit detection padding (default: 20)
   * @returns {Promise<string|null>} - Layer ID or null
   */
  const hitTest = useCallback(
    async (x, y, layerBounds, padding = 20) => {
      if (!isReady || !layerBounds?.length) return null

      const result = await sendMessage('hitTest', { x, y, layerBounds, padding })
      return result
    },
    [isReady, sendMessage]
  )

  /**
   * Calculate pixel positions for all layers from percentage values
   *
   * @param {Array} layers - Array of layer objects
   * @param {number} canvasWidth - Canvas width in pixels
   * @param {number} canvasHeight - Canvas height in pixels
   * @returns {Promise<Array>} - Array of { id, x, y }
   */
  const calculatePositions = useCallback(
    async (layers, canvasWidth, canvasHeight) => {
      if (!isReady) return null

      const result = await sendMessage('calculatePositions', {
        layers,
        canvasWidth,
        canvasHeight,
      })
      return result
    },
    [isReady, sendMessage]
  )

  /**
   * Sort layers by zIndex and return ordered IDs
   *
   * @param {Array} layers - Array of layer objects
   * @returns {Promise<Array>} - Sorted array of layer IDs
   */
  const sortLayers = useCallback(
    async (layers) => {
      if (!isReady) return null

      const result = await sendMessage('sortLayers', { layers })
      return result
    },
    [isReady, sendMessage]
  )

  /**
   * Calculate export coordinates for all layers
   *
   * @param {Array} layers - Array of layer objects
   * @param {number} srcWidth - Source canvas width
   * @param {number} srcHeight - Source canvas height
   * @param {number} exportWidth - Export canvas width
   * @param {number} exportHeight - Export canvas height
   * @returns {Promise<Array>} - Array of { id, x, y, fontSize, shadow }
   */
  const calculateExportCoords = useCallback(
    async (layers, srcWidth, srcHeight, exportWidth, exportHeight) => {
      if (!isReady) return null

      const result = await sendMessage('calculateExportCoords', {
        layers,
        srcWidth,
        srcHeight,
        exportWidth,
        exportHeight,
      })
      return result
    },
    [isReady, sendMessage]
  )

  /**
   * Calculate approximate bounds for all layers
   * Useful when you don't need precise text measurement
   *
   * @param {Array} layers - Array of layer objects
   * @param {number} canvasWidth - Canvas width in pixels
   * @param {number} canvasHeight - Canvas height in pixels
   * @returns {Promise<Array>} - Array of { id, bounds, visible, locked, zIndex }
   */
  const calculateBounds = useCallback(
    async (layers, canvasWidth, canvasHeight) => {
      if (!isReady) return null

      const result = await sendMessage('calculateAllBounds', {
        layers,
        canvasWidth,
        canvasHeight,
      })
      return result
    },
    [isReady, sendMessage]
  )

  return {
    isReady,
    hitTest,
    calculatePositions,
    sortLayers,
    calculateExportCoords,
    calculateBounds,
  }
}
