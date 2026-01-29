// Main component
export { AIStudio } from './AIStudio'

// Sub-components
export { StudioCanvas } from './components/StudioCanvas'
export { StudioHeader } from './components/StudioHeader'
export { StudioSidebar } from './components/StudioSidebar'
export { StudioLayersPanel } from './components/StudioLayersPanel'
export { StudioMobileControls } from './components/StudioMobileControls'

// Modals
export { ExportOptionsModal } from './components/modals/ExportOptionsModal'
export { TemplateBrowserModal } from './components/modals/TemplateBrowserModal'
export { PlatformPickerModal } from './components/modals/PlatformPickerModal'
export { VideoExportModal } from './components/modals/VideoExportModal'

// Store (Zustand)
export { useStudioStore, getStudioState, subscribeToStudio } from './store'
export * from './store/selectors'

// Utils
export * from './utils/studioConstants'
export { StudioIcons } from './utils/StudioIcons'
