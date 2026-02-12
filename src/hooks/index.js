// Utility hooks
export { useDebounce } from './useDebounce'
export { useInterestMatch } from './useInterestMatch'
export { useLocalStorage } from './useLocalStorage'
export { useMediaQuery, useIsMobile, useIsTablet, useIsDesktop } from './useMediaQuery'
export { useClickOutside } from './useClickOutside'
export { useKeyboardShortcut, SHORTCUTS } from './useKeyboardShortcut'
export { useToggle } from './useToggle'
export { usePrevious } from './usePrevious'
export { useWindowSize } from './useWindowSize'
export {
  useLayerManager,
  LayerType,
  createTextLayer,
  createImageLayer,
  createBackgroundLayer,
  textOverlayToLayer,
  layerToTextOverlay,
} from './useLayerManager'
export { useCanvasEditor } from './useCanvasEditor'
export { useCanvasWorker } from './useCanvasWorker'

// TanStack Query hooks - use these for data fetching
export * from './queries'

// Legacy hooks (deprecated - use TanStack Query hooks instead)
export { useFetch } from './useFetch'
export { useAsync } from './useAsync'
