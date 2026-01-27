import { useRef, useCallback, useEffect, useState } from 'react'
import { usePhoneTheme } from '@/context/PhoneThemeContext'
import { useStudioState } from './hooks/useStudioState'
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
} from './components/modals'

/**
 * AIStudio - Main orchestrator component for the AI-powered design studio
 *
 * This is the entry point for the modular AI Studio feature.
 * It coordinates all sub-components and manages shared state.
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

  // Centralized state management
  const state = useStudioState({ defaultPlatform: 'instagram-post' })

  // Load project if passed in props (only on mount)
  useEffect(() => {
    if (openProject) {
      state.loadProject(openProject)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Export handler
  const handleExport = useCallback(async () => {
    if (!canvasRef.current) return

    try {
      const dataUrl = await canvasRef.current.exportAsDataUrl('image/png', 1.0)
      if (dataUrl) {
        // Open export options modal
        state.openModal('export')
      }
    } catch (error) {
      console.error('Export failed:', error)
    }
  }, [state])

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
        state.closeModal('export')
        onExport?.(dataUrl)
      }
    } catch (error) {
      console.error('Download failed:', error)
    }
  }, [state, onExport])

  // Send as campaign handler
  const handleSendAsCampaign = useCallback(async () => {
    if (!canvasRef.current) return

    try {
      const dataUrl = await canvasRef.current.exportAsDataUrl('image/png', 1.0)
      if (dataUrl) {
        state.closeModal('export')
        onSendAsCampaign?.(dataUrl)
      }
    } catch (error) {
      console.error('Send as campaign failed:', error)
    }
  }, [state, onSendAsCampaign])

  // Save project handler
  const handleSaveClick = useCallback(() => {
    setSaveNameInput(state.projectName || '')
    setSaveDialogOpen(true)
  }, [state.projectName])

  const handleSaveConfirm = useCallback(async () => {
    const name = saveNameInput.trim() || 'Untitled Design'
    const result = await state.saveProject(name)
    if (result) {
      setSaveDialogOpen(false)
    }
  }, [saveNameInput, state])

  // Primary text drag handlers
  const handlePrimaryTextDrag = useCallback(
    (position) => {
      state.setTextOverlay({ x: position.x, y: position.y })
    },
    [state]
  )

  // Layer drag handler
  const handleLayerDrag = useCallback(
    (layerId, position) => {
      state.updateLayer(layerId, { data: { x: position.x, y: position.y } }, true) // Skip history during drag
    },
    [state]
  )

  const handleLayerDragEnd = useCallback(
    (layerId) => {
      // Push to history after drag ends
      const layer = state.layers.find((l) => l.id === layerId)
      if (layer) {
        state.updateLayer(layerId, { data: layer.data })
      }
    },
    [state]
  )

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Undo: Ctrl+Z / Cmd+Z
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        state.undo()
      }
      // Redo: Ctrl+Shift+Z / Cmd+Shift+Z or Ctrl+Y
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault()
        state.redo()
      }
      // Escape: Close modals or studio
      if (e.key === 'Escape') {
        if (
          state.modals.export ||
          state.modals.templates ||
          state.modals.platforms ||
          state.modals.videoExport
        ) {
          state.closeAllModals()
        } else {
          onClose?.()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [state, onClose])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        background: theme.bg,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <StudioHeader
        currentPreset={state.currentPreset}
        exportWidth={state.exportWidth}
        exportHeight={state.exportHeight}
        onPlatformClick={() => state.openModal('platforms')}
        onUndo={state.undo}
        onRedo={state.redo}
        canUndo={state.canUndo}
        canRedo={state.canRedo}
        onSave={handleSaveClick}
        onExport={handleExport}
        onClose={onClose}
      />

      {/* Main content area */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Desktop: Left Sidebar */}
        {!isMobile && (
          <StudioSidebar
            // Upload
            imageFile={state.imageFile}
            onImageUpload={state.setImageFile}
            // AI - Copy generation
            prompt={state.prompt}
            onPromptChange={state.setPrompt}
            onGenerate={state.generate}
            isGenerating={state.isGenerating}
            onAnalyzeImage={state.analyzeImage}
            isAnalyzing={state.isAnalyzing}
            // AI - Background generation (Phase 2)
            backgroundPrompt={state.backgroundPrompt}
            onBackgroundPromptChange={state.setBackgroundPrompt}
            onGenerateBackground={state.generateBackground}
            isGeneratingBackground={state.isGeneratingBackground}
            generatedBackground={state.generatedBackground}
            // AI - Subject processing (Phase 2)
            onRemoveBackground={state.removeBackground}
            isRemovingBackground={state.isRemovingBackground}
            subjectImage={state.subjectImage}
            // AI - Typography (Phase 2)
            onSuggestTypography={state.suggestTypography}
            isSuggestingTypography={state.isSuggestingTypography}
            // AI - Auto-level (Phase 2)
            onAutoLevel={state.autoLevel}
            isAutoLeveling={state.isAutoLeveling}
            // AI - Video generation (Phase 3)
            videoModel={state.videoModel}
            onVideoModelChange={state.setVideoModel}
            videoPrompt={state.videoPrompt}
            onVideoPromptChange={state.setVideoPrompt}
            onGenerateVideo={state.generateVideo}
            isGeneratingVideo={state.isGeneratingVideo}
            videoGenerationProgress={state.videoGenerationProgress}
            generatedVideoUrl={state.generatedVideoUrl}
            videoError={state.videoError}
            // Video overlays (Phase 3)
            videoOverlays={state.videoOverlays}
            selectedOverlayId={state.selectedOverlayId}
            onSelectOverlay={state.selectOverlay}
            onAddVideoOverlay={state.addVideoOverlay}
            onUpdateVideoOverlay={state.updateVideoOverlay}
            onRemoveVideoOverlay={state.removeVideoOverlay}
            videoDuration={state.videoDuration}
            // Video rendering (Phase 3)
            onRenderFinalVideo={state.renderFinalVideo}
            isRenderingVideo={state.isRenderingVideo}
            onOpenVideoExport={() => state.openModal('videoExport')}
            // Templates
            templates={state.marketingTemplates}
            activeTemplateId={state.activeTemplateId}
            onTemplateSelect={state.selectTemplate}
            onOpenTemplateLibrary={() => state.openModal('templates')}
            // Background
            background={state.background}
            onBackgroundChange={state.setBackground}
            // Text
            textOverlay={state.textOverlay}
            onTextChange={state.setTextOverlay}
          />
        )}

        {/* Canvas Area */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: theme.bg,
            padding: '20px',
            overflow: 'hidden',
          }}
        >
          <StudioCanvas
            ref={canvasRef}
            width={state.canvasWidth}
            height={state.canvasHeight}
            exportWidth={state.exportWidth}
            exportHeight={state.exportHeight}
            background={state.background}
            imageFile={state.imageFile}
            layers={state.sortedLayers}
            primaryTextOverlay={state.textOverlay}
            activeTemplate={state.activeTemplate}
            selectedLayerId={state.selectedLayerId}
            onLayerSelect={state.selectLayer}
            onPrimaryTextDrag={handlePrimaryTextDrag}
            onLayerDrag={handleLayerDrag}
            onLayerDragEnd={handleLayerDragEnd}
            style={{
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            }}
          />
        </div>

        {/* Desktop: Right Sidebar (Layers Panel) */}
        {!isMobile && (
          <StudioLayersPanel
            primaryText={state.textOverlay?.text}
            layers={state.layers}
            selectedLayerId={state.selectedLayerId}
            onSelectLayer={state.selectLayer}
            onToggleVisibility={state.toggleLayerVisibility}
            onRemoveLayer={state.removeLayer}
            onAddTextLayer={() => state.addTextLayer()}
            hasImage={!!state.imageFile}
            onResizeCanvas={() => state.openModal('platforms')}
            onResetAll={state.resetAll}
          />
        )}
      </div>

      {/* Mobile: Bottom Controls */}
      {isMobile && (
        <StudioMobileControls
          // Upload
          imageFile={state.imageFile}
          onImageUpload={state.setImageFile}
          // AI - Copy generation
          prompt={state.prompt}
          onPromptChange={state.setPrompt}
          onGenerate={state.generate}
          isGenerating={state.isGenerating}
          onAnalyzeImage={state.analyzeImage}
          isAnalyzing={state.isAnalyzing}
          // AI - Background generation (Phase 2)
          backgroundPrompt={state.backgroundPrompt}
          onBackgroundPromptChange={state.setBackgroundPrompt}
          onGenerateBackground={state.generateBackground}
          isGeneratingBackground={state.isGeneratingBackground}
          generatedBackground={state.generatedBackground}
          // AI - Subject processing (Phase 2)
          onRemoveBackground={state.removeBackground}
          isRemovingBackground={state.isRemovingBackground}
          subjectImage={state.subjectImage}
          // AI - Auto-level (Phase 2)
          onAutoLevel={state.autoLevel}
          isAutoLeveling={state.isAutoLeveling}
          // AI - Typography (Phase 2)
          onSuggestTypography={state.suggestTypography}
          isSuggestingTypography={state.isSuggestingTypography}
          // AI - Video generation (Phase 3)
          videoModel={state.videoModel}
          onVideoModelChange={state.setVideoModel}
          videoPrompt={state.videoPrompt}
          onVideoPromptChange={state.setVideoPrompt}
          onGenerateVideo={state.generateVideo}
          isGeneratingVideo={state.isGeneratingVideo}
          videoGenerationProgress={state.videoGenerationProgress}
          generatedVideoUrl={state.generatedVideoUrl}
          videoError={state.videoError}
          // Video overlays (Phase 3)
          videoOverlays={state.videoOverlays}
          selectedOverlayId={state.selectedOverlayId}
          onSelectOverlay={state.selectOverlay}
          onAddVideoOverlay={state.addVideoOverlay}
          onUpdateVideoOverlay={state.updateVideoOverlay}
          onRemoveVideoOverlay={state.removeVideoOverlay}
          videoDuration={state.videoDuration}
          // Video rendering (Phase 3)
          onOpenVideoExport={() => state.openModal('videoExport')}
          isRenderingVideo={state.isRenderingVideo}
          // Text
          textOverlay={state.textOverlay}
          onTextChange={state.setTextOverlay}
          // Templates
          templates={state.marketingTemplates}
          templateCategories={state.templateCategories}
          activeTemplateId={state.activeTemplateId}
          onTemplateSelect={state.selectTemplate}
          onClearTemplate={state.clearTemplate}
          // Platform
          platformPresets={state.platformPresets}
          selectedPlatform={state.selectedPlatform}
          currentPreset={state.currentPreset}
          exportWidth={state.exportWidth}
          exportHeight={state.exportHeight}
          onPlatformSelect={(id) => state.setSelectedPlatform(id)}
        />
      )}

      {/* Modals */}
      <ExportOptionsModal
        isOpen={state.modals.export}
        onClose={() => state.closeModal('export')}
        onDownload={handleDownload}
        onSendAsCampaign={handleSendAsCampaign}
        onContinueEditing={() => state.closeModal('export')}
      />

      <TemplateBrowserModal
        isOpen={state.modals.templates}
        onClose={() => state.closeModal('templates')}
        templates={state.marketingTemplates}
        categories={state.templateCategories}
        onSelect={(template) => {
          state.selectTemplate(template)
          state.closeModal('templates')
        }}
      />

      <PlatformPickerModal
        isOpen={state.modals.platforms}
        onClose={() => state.closeModal('platforms')}
        presets={state.platformPresets}
        selectedPlatformId={state.selectedPlatform}
        onSelect={(id) => {
          state.setSelectedPlatform(id)
          state.closeModal('platforms')
        }}
      />

      <VideoExportModal
        isOpen={state.modals.videoExport}
        onClose={() => state.closeModal('videoExport')}
        isRendering={state.isRenderingVideo}
        renderProgress={state.renderProgress}
        finalVideoUrl={state.finalVideoUrl}
        generatedVideoUrl={state.generatedVideoUrl}
        onRenderWithOverlays={state.renderFinalVideo}
        onDownload={() => {
          state.closeModal('videoExport')
        }}
        onSendAsCampaign={(videoUrl) => {
          onSendAsCampaign?.(videoUrl)
        }}
        hasOverlays={state.videoOverlays?.length > 0}
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
            {state.saveError && (
              <div style={{ color: '#ef4444', fontSize: '13px', marginBottom: '12px' }}>
                {state.saveError}
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
                disabled={state.isSaving}
                style={{
                  padding: '10px 24px',
                  borderRadius: '10px',
                  border: 'none',
                  background: `linear-gradient(135deg, ${theme.gradientStart}, ${theme.gradientEnd})`,
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: state.isSaving ? 'not-allowed' : 'pointer',
                  opacity: state.isSaving ? 0.7 : 1,
                }}
              >
                {state.isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AIStudio
