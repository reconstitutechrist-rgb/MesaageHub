/**
 * Text Overlay Slice - Manages legacy primary text overlay state
 *
 * This is maintained for backward compatibility with the primary
 * text overlay that exists outside of the layer system.
 */

import { DEFAULT_TEXT_OVERLAY } from '../../utils/studioConstants'

/**
 * Text Overlay slice for Zustand store
 */
export const createTextOverlaySlice = (set, _get) => ({
  // Primary text overlay state
  textOverlay: { ...DEFAULT_TEXT_OVERLAY },

  // Update text overlay
  setTextOverlay: (updates) => {
    set((state) => ({
      textOverlay: { ...state.textOverlay, ...updates },
    }))
  },

  // Reset text overlay (called by global reset)
  resetTextOverlay: () => {
    set({ textOverlay: { ...DEFAULT_TEXT_OVERLAY } })
  },
})
