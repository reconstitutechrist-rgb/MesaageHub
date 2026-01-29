/**
 * AI Studio Zustand Store
 *
 * Combines all slices into a single store with selective subscriptions
 * for optimal performance.
 */

import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

// Import slices
import { createLayerSlice } from './slices/layerSlice'
import { createCanvasSlice } from './slices/canvasSlice'
import { createAISlice } from './slices/aiSlice'
import { createVideoSlice } from './slices/videoSlice'
import { createUISlice } from './slices/uiSlice'
import { createTextOverlaySlice } from './slices/textOverlaySlice'

// Re-export layer utilities
export {
  LayerType,
  createTextLayer,
  createImageLayer,
  createBackgroundLayer,
  textOverlayToLayer,
  layerToTextOverlay,
} from './slices/layerSlice'

// Re-export dimension calculator
export { computeCanvasDimensions } from './slices/canvasSlice'

/**
 * Main studio store
 *
 * Uses subscribeWithSelector middleware for granular subscriptions
 */
export const useStudioStore = create(
  subscribeWithSelector((...args) => {
    const [_set, get] = args

    return {
      // Combine all slices
      ...createLayerSlice(...args),
      ...createCanvasSlice(...args),
      ...createAISlice(...args),
      ...createVideoSlice(...args),
      ...createUISlice(...args),
      ...createTextOverlaySlice(...args),

      // Global reset - resets all state
      resetAll: () => {
        const state = get()
        state.resetLayerState()
        state.resetCanvasState()
        state.resetAIState()
        state.resetVideoState()
        state.resetUIState()
        state.resetTextOverlay()
      },
    }
  })
)

/**
 * Non-reactive store access for imperative code
 *
 * Use this when you need to read/write state outside of React
 * (e.g., in event handlers, async functions)
 */
export const getStudioState = () => useStudioStore.getState()

/**
 * Subscribe to store changes
 *
 * @example
 * const unsubscribe = subscribeToStudio(
 *   (state) => state.layers,
 *   (layers) => console.log('Layers changed:', layers)
 * )
 */
export const subscribeToStudio = (selector, callback) => {
  return useStudioStore.subscribe(selector, callback)
}

export default useStudioStore
