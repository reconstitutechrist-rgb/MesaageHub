import { useRef, useCallback, useEffect, useState } from 'react'
import { usePhoneTheme } from '@/context/PhoneThemeContext'
import { triggerHaptic } from './utils/haptics'
import { StudioHeader } from './components/StudioHeader'
import { StudioCanvas } from './components/StudioCanvas'
import { StudioSidebar } from './components/StudioSidebar'
import { StudioLayersPanel } from './components/StudioLayersPanel'
import { StudioMobileControls } from './components/StudioMobileControls'
import {
  ExportOptionsModal,
  TemplateBrowserModal,
  PlatformPickerModal,
  VideoExportModal,
  MultiPlatformExportModal,
  VariantGeneratorModal,
} from './components/modals'
import {
  // State selectors
  useCurrentPreset,
  useCanvasDimensions,
  useCanUndo,
  useCanRedo,
  useModals,
  useProjectName,
  useIsSaving,
  useSaveError,
  useMarketingTemplates,
  useTemplateCategories,
  usePlatformPresets,
  useSelectedPlatform,
  useActiveTemplate,
  useIsRenderingVideo,
  useRenderProgress,
  useFinalVideoUrl,
  useGeneratedVideoUrl,
  useVideoOverlays,
  // Action selectors
  useLayerActions,
  useUIActions,
  useCanvasActions,
  useVideoActions,
} from './store/selectors'

/**
 * AIStudio - Main orchestrator component for the AI-powered design studio
 *
 * This is the entry point for the modular AI Studio feature.
 * Child components use Zustand store directly for their state.
 * This component handles:
 * - Export/download functionality
 * - Keyboard shortcuts
 * - Modal orchestration
 * - Save dialog
 */
export function AIStudio({
  onClose,
  onExport,
  onSendAsCampaign,
  isMobile = false,
  openProject = null,
}) {
  const { theme } = usePhoneTheme()
  const canvasRef = useRef(null)
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [saveNameInput, setSaveNameInput] = useState('')
  const [exportError, setExportError] = useState(null)

  // Get only what AIStudio needs from store (not drilling down)
  const currentPreset = useCurrentPreset()
  const { exportWidth, exportHeight } = useCanvasDimensions()
  const canUndo = useCanUndo()
  const canRedo = useCanRedo()
  const modals = useModals()
  const projectName = useProjectName()
  const isSaving = useIsSaving()
  const saveError = useSaveError()
  const marketingTemplates = useMarketingTemplates()
  const templateCategories = useTemplateCategories()
  const platformPresets = usePlatformPresets()
  const selectedPlatform = useSelectedPlatform()
  const activeTemplate = useActiveTemplate()
  const isRenderingVideo = useIsRenderingVideo()
  const renderProgress = useRenderProgress()
  const finalVideoUrl = useFinalVideoUrl()
  const generatedVideoUrl = useGeneratedVideoUrl()
  const videoOverlays = useVideoOverlays()

  // Get actions from store
  const { undo, redo } = useLayerActions()
  const { openModal, closeModal, closeAllModals, saveProject, loadProject } = useUIActions()
  const { setSelectedPlatform, setActiveTemplate } = useCanvasActions()
  const { renderFinalVideo } = useVideoActions()

  // Load project if passed in props (only on mount)
  useEffect(() => {
    if (openProject) {
      loadProject(openProject)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auto-clear export error after 3 seconds
  useEffect(() => {
    if (!exportError) return
    const timer = setTimeout(() => setExportError(null), 3000)
    return () => clearTimeout(timer)
  }, [exportError])

  // Export handler
  const handleExport = useCallback(async () => {
    if (!canvasRef.current) return

    try {
      const dataUrl = await canvasRef.current.exportAsDataUrl('image/png', 1.0)
      if (dataUrl) {
        // Open export options modal
        openModal('export')
      }
    } catch (error) {
      console.error('Export failed:', error)
    }
  }, [openModal])

  // Download handler
  const handleDownload = useCallback(async () => {
    if (!canvasRef.current) return

    try {
      const dataUrl = await canvasRef.current.exportAsDataUrl('image/png', 1.0)
      if (dataUrl) {
        const link = document.createElement('a')
        link.download = `design-${Date.now()}.png`
        link.href = dataUrl
        link.click()
        closeModal('export')
        onExport?.(dataUrl)
        triggerHaptic('success')
      }
    } catch (error) {
      console.error('Download failed:', error)
      triggerHaptic('error')
      setExportError('Download failed. Please try again.')
    }
  }, [closeModal, onExport])

  // Send as campaign handler
  const handleSendAsCampaign = useCallback(async () => {
    if (!canvasRef.current) return

    try {
      const dataUrl = await canvasRef.current.exportAsDataUrl('image/png', 1.0)
      if (dataUrl) {
        closeModal('export')
        onSendAsCampaign?.(dataUrl)
        triggerHaptic('success')
      }
    } catch (error) {
      console.error('Send as campaign failed:', error)
      triggerHaptic('error')
      setExportError('Export failed. Please try again.')
    }
  }, [closeModal, onSendAsCampaign])

  // Multi-platform export handler
  const handleMultiPlatformExport = useCallback(() => {
    closeModal('export')
    openModal('multiPlatformExport')
  }, [closeModal, openModal])

  // Handle individual platform export from multi-platform modal
  const handlePlatformExport = useCallback(async (exportConfig) => {
    if (!canvasRef.current) return

    try {
      const dataUrl = await canvasRef.current.exportAsDataUrl('image/png', 1.0)
      if (dataUrl) {
        // Download the exported image with platform-specific filename
        const link = document.createElement('a')
        link.download = `${exportConfig.filename}.png`
        link.href = dataUrl
        link.click()
      }
    } catch (error) {
      console.error('Platform export failed:', error)
    }
  }, [])

  // Save project handler
  const handleSaveClick = useCallback(() => {
    setSaveNameInput(projectName || '')
    setSaveDialogOpen(true)
  }, [projectName])

  const handleSaveConfirm = useCallback(async () => {
    const name = saveNameInput.trim() || 'Untitled Design'
    const result = await saveProject(name)
    if (result) {
      setSaveDialogOpen(false)
    }
  }, [saveNameInput, saveProject])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Undo: Ctrl+Z / Cmd+Z
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
      }
      // Redo: Ctrl+Shift+Z / Cmd+Shift+Z or Ctrl+Y
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault()
        redo()
      }
      // Escape: Close modals or studio
      if (e.key === 'Escape') {
        if (
          modals.export ||
          modals.templates ||
          modals.platforms ||
          modals.videoExport ||
          modals.multiPlatformExport ||
          modals.variants
        ) {
          closeAllModals()
        } else {
          onClose?.()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo, modals, closeAllModals, onClose])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        background: theme.bg,
        display: 'flex',
        flexDirection: 'column',
        paddingTop: 'env(safe-area-inset-top, 0px)',
      }}
    >
      {/* Export Error Toast */}
      {exportError && (
        <div
          style={{
            position: 'absolute',
            top: '72px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 2100,
            padding: '10px 20px',
            borderRadius: '10px',
            background: '#ef4444',
            color: '#fff',
            fontSize: '13px',
            fontWeight: '500',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          }}
        >
          {exportError}
        </div>
      )}

      {/* Header */}
      <StudioHeader
        isMobile={isMobile}
        currentPreset={currentPreset}
        exportWidth={exportWidth}
        exportHeight={exportHeight}
        onPlatformClick={() => openModal('platforms')}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        onSave={handleSaveClick}
        onExport={handleExport}
        onClose={onClose}
        onVariants={() => openModal('variants')}
        onSendAsCampaign={onSendAsCampaign ? handleSendAsCampaign : undefined}
      />

      {/* Main content area */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Desktop: Left Sidebar - gets state from store */}
        {!isMobile && <StudioSidebar />}

        {/* Canvas Area */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: theme.bg,
            padding: isMobile ? '8px' : '20px',
            overflow: 'hidden',
          }}
        >
          {/* StudioCanvas gets state from store */}
          <StudioCanvas
            ref={canvasRef}
            style={{
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            }}
          />
        </div>

        {/* Desktop: Right Sidebar (Layers Panel) - gets state from store */}
        {!isMobile && <StudioLayersPanel />}
      </div>

      {/* Mobile: Bottom Controls - gets state from store */}
      {isMobile && <StudioMobileControls />}

      {/* Modals */}
      <ExportOptionsModal
        isOpen={modals.export}
        onClose={() => closeModal('export')}
        onDownload={handleDownload}
        onSendAsCampaign={handleSendAsCampaign}
        onMultiPlatformExport={handleMultiPlatformExport}
        onContinueEditing={() => closeModal('export')}
        isMobile={isMobile}
      />

      <MultiPlatformExportModal
        isOpen={modals.multiPlatformExport}
        onClose={() => closeModal('multiPlatformExport')}
        onExport={handlePlatformExport}
      />

      <TemplateBrowserModal
        isOpen={modals.templates}
        onClose={() => closeModal('templates')}
        templates={marketingTemplates}
        categories={templateCategories}
        activeTemplateId={activeTemplate?.id}
        onSelect={(template) => {
          setActiveTemplate(template)
          closeModal('templates')
        }}
        isMobile={isMobile}
      />

      <PlatformPickerModal
        isOpen={modals.platforms}
        onClose={() => closeModal('platforms')}
        presets={platformPresets}
        selectedPlatformId={selectedPlatform}
        onSelect={(id) => {
          setSelectedPlatform(id)
          closeModal('platforms')
        }}
        isMobile={isMobile}
      />

      <VideoExportModal
        isOpen={modals.videoExport}
        onClose={() => closeModal('videoExport')}
        isRendering={isRenderingVideo}
        renderProgress={renderProgress}
        finalVideoUrl={finalVideoUrl}
        generatedVideoUrl={generatedVideoUrl}
        onRenderWithOverlays={renderFinalVideo}
        onDownload={() => {
          closeModal('videoExport')
        }}
        onSendAsCampaign={(videoUrl) => {
          onSendAsCampaign?.(videoUrl)
        }}
        hasOverlays={videoOverlays?.length > 0}
      />

      <VariantGeneratorModal
        isOpen={modals.variants}
        onClose={() => closeModal('variants')}
        onApplyVariant={() => closeModal('variants')}
      />

      {/* Save Project Dialog */}
      {saveDialogOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
          }}
          onClick={() => setSaveDialogOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: theme.cardBg,
              border: `1px solid ${theme.cardBorder}`,
              borderRadius: '16px',
              padding: '24px',
              width: '90%',
              maxWidth: '360px',
              backdropFilter: 'blur(20px)',
            }}
          >
            <h3
              style={{ color: theme.text, margin: '0 0 16px', fontSize: '18px', fontWeight: '600' }}
            >
              Save Project
            </h3>
            <input
              type="text"
              value={saveNameInput}
              onChange={(e) => setSaveNameInput(e.target.value)}
              placeholder="Project name..."
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '10px',
                border: `1px solid ${theme.cardBorder}`,
                background: theme.navBg,
                color: theme.text,
                fontSize: '16px',
                outline: 'none',
                marginBottom: '16px',
              }}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveConfirm()
              }}
            />
            {saveError && (
              <div style={{ color: '#ef4444', fontSize: '13px', marginBottom: '12px' }}>
                {saveError}
              </div>
            )}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setSaveDialogOpen(false)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '10px',
                  border: `1px solid ${theme.cardBorder}`,
                  background: 'transparent',
                  color: theme.textMuted,
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveConfirm}
                disabled={isSaving}
                style={{
                  padding: '10px 24px',
                  borderRadius: '10px',
                  border: 'none',
                  background: `linear-gradient(135deg, ${theme.gradientStart}, ${theme.gradientEnd})`,
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  opacity: isSaving ? 0.7 : 1,
                }}
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AIStudio
