import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { usePhoneTheme } from '@/context/PhoneThemeContext'
import { StudioIcons } from '../utils/StudioIcons'
import { TEXT_COLORS } from '../utils/studioConstants'
import { VideoGenerationPanel } from './VideoGenerationPanel'
import { VideoOverlayEditor } from './VideoOverlayEditor'
import { PromotionalElementsPanel } from './PromotionalElementsPanel'
import { BrandKitPanel } from './BrandKitPanel'
import { ProductTaggingPanel } from './ProductTaggingPanel'
import {
  // State selectors
  useImageFile,
  usePrompt,
  useIsGenerating,
  useIsAnalyzing,
  useBackgroundPrompt,
  useIsGeneratingBackground,
  useGeneratedBackground,
  useIsRemovingBackground,
  useSubjectImage,
  useIsAutoLeveling,
  useIsSuggestingTypography,
  useTextOverlay,
  useMarketingTemplates,
  useTemplateCategories,
  useActiveTemplate,
  usePlatformPresets,
  useSelectedPlatform,
  useCurrentPreset,
  useCanvasDimensions,
  useVideoModel,
  useVideoPrompt,
  useIsGeneratingVideo,
  useVideoGenerationProgress,
  useGeneratedVideoUrl,
  useVideoError,
  useVideoOverlays,
  useIsRenderingVideo,
  useRecentDesigns,
  // Action selectors
  useCanvasActions,
  useAIActions,
  useVideoActions,
  useUIActions,
  useTextOverlayActions,
} from '../store/selectors'

/**
 * StudioMobileControls - Mobile tabbed control panel
 *
 * Uses Zustand store for all state and actions.
 *
 * Bottom panel with scrollable tabs for:
 * - Upload, AI, Text, Promo, Brand, Tags, Video, Templates, Size
 * - Expandable content panel with drag handle
 */
export function StudioMobileControls() {
  const { theme } = usePhoneTheme()
  const [activeTab, setActiveTab] = useState('upload')
  const [templateCategory, setTemplateCategory] = useState('all')
  const [panelHeight, setPanelHeight] = useState(180)
  const [isExpanded, setIsExpanded] = useState(false)
  const dragStartRef = useRef(null)
  const dragStartHeightRef = useRef(180)

  const MIN_HEIGHT = 120
  const MAX_HEIGHT = Math.min(400, typeof window !== 'undefined' ? window.innerHeight * 0.45 : 400)

  // Get state from Zustand store
  const imageFile = useImageFile()
  const prompt = usePrompt()
  const isGenerating = useIsGenerating()
  const isAnalyzing = useIsAnalyzing()
  const backgroundPrompt = useBackgroundPrompt()
  const isGeneratingBackground = useIsGeneratingBackground()
  const generatedBackground = useGeneratedBackground()
  const isRemovingBackground = useIsRemovingBackground()
  const subjectImage = useSubjectImage()
  const isAutoLeveling = useIsAutoLeveling()
  const isSuggestingTypography = useIsSuggestingTypography()
  const textOverlay = useTextOverlay()
  const templates = useMarketingTemplates()
  const templateCategoriesData = useTemplateCategories()
  const activeTemplate = useActiveTemplate()
  const platformPresets = usePlatformPresets()
  const selectedPlatform = useSelectedPlatform()
  const currentPreset = useCurrentPreset()
  const { exportWidth, exportHeight } = useCanvasDimensions()
  const videoModel = useVideoModel()
  const videoPrompt = useVideoPrompt()
  const isGeneratingVideo = useIsGeneratingVideo()
  const videoGenerationProgress = useVideoGenerationProgress()
  const generatedVideoUrl = useGeneratedVideoUrl()
  const videoError = useVideoError()
  const videoOverlays = useVideoOverlays()
  const isRenderingVideo = useIsRenderingVideo()
  const recentDesigns = useRecentDesigns()

  // Get actions from Zustand store
  const { setImageFile, setSelectedPlatform, setActiveTemplate, clearTemplate } = useCanvasActions()
  const {
    setPrompt,
    generate,
    analyzeImage,
    setBackgroundPrompt,
    generateBackground,
    removeBackground,
    autoLevel,
    suggestTypography,
  } = useAIActions()
  const { setVideoModel, setVideoPrompt, generateVideo, addVideoOverlay } = useVideoActions()
  const { openModal, loadProject, loadRecentDesigns } = useUIActions()
  const { setTextOverlay } = useTextOverlayActions()

  // Load recent designs on mount
  useEffect(() => {
    loadRecentDesigns()
  }, [loadRecentDesigns])

  // Helpers
  const formatRelativeDate = (dateStr) => {
    if (!dateStr) return ''
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h`
    const days = Math.floor(hrs / 24)
    return `${days}d`
  }

  // Derived state
  const activeTemplateId = activeTemplate?.id
  const templatesList = useMemo(() => Object.values(templates || {}), [templates])
  const templateCategories = useMemo(
    () => Object.values(templateCategoriesData || {}),
    [templateCategoriesData]
  )

  // Filter templates by category
  const filteredTemplates = useMemo(
    () =>
      templateCategory === 'all'
        ? templatesList
        : templatesList.filter((t) => t.category === templateCategory),
    [templatesList, templateCategory]
  )

  // Panel drag handlers
  const handleDragMove = useCallback(
    (e) => {
      if (dragStartRef.current === null) return
      const clientY = e.touches ? e.touches[0].clientY : e.clientY
      const delta = dragStartRef.current - clientY
      const newHeight = Math.max(
        MIN_HEIGHT,
        Math.min(MAX_HEIGHT, dragStartHeightRef.current + delta)
      )
      setPanelHeight(newHeight)
      setIsExpanded(newHeight > 200)
    },
    [MAX_HEIGHT]
  )

  const handleDragEnd = useCallback(() => {
    dragStartRef.current = null
    document.removeEventListener('mousemove', handleDragMove)
    document.removeEventListener('mouseup', handleDragEnd)
  }, [handleDragMove])

  // Cleanup document listeners on unmount
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleDragMove)
      document.removeEventListener('mouseup', handleDragEnd)
    }
  }, [handleDragMove, handleDragEnd])

  const handleDragStart = useCallback(
    (e) => {
      const clientY = e.touches ? e.touches[0].clientY : e.clientY
      dragStartRef.current = clientY
      dragStartHeightRef.current = panelHeight
      // Attach to document for mouse so drag tracks beyond the handle
      if (!e.touches) {
        document.addEventListener('mousemove', handleDragMove)
        document.addEventListener('mouseup', handleDragEnd)
      }
    },
    [panelHeight, handleDragMove, handleDragEnd]
  )

  const toggleExpand = useCallback(() => {
    if (isExpanded) {
      setPanelHeight(MIN_HEIGHT)
      setIsExpanded(false)
    } else {
      setPanelHeight(MAX_HEIGHT)
      setIsExpanded(true)
    }
  }, [isExpanded, MAX_HEIGHT])

  const tabs = [
    { id: 'upload', icon: StudioIcons.upload, label: 'Upload' },
    { id: 'ai', icon: StudioIcons.sparkles, label: 'AI' },
    { id: 'text', icon: StudioIcons.type, label: 'Text' },
    { id: 'shop', icon: StudioIcons.badge, label: 'Shop' },
    { id: 'video', icon: StudioIcons.video, label: 'Video' },
    { id: 'templates', icon: StudioIcons.layers, label: 'Templates' },
    { id: 'size', icon: StudioIcons.grid, label: 'Size' },
  ]

  return (
    <div
      style={{
        background: theme.navBg,
        borderTop: `1px solid ${theme.cardBorder}`,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Drag Handle */}
      <div
        onTouchStart={handleDragStart}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
        onMouseDown={handleDragStart}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '6px 0',
          cursor: 'ns-resize',
          touchAction: 'none',
          position: 'relative',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '4px',
            borderRadius: '2px',
            background: theme.cardBorder,
          }}
        />
        <button
          onClick={toggleExpand}
          style={{
            position: 'absolute',
            right: '12px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {isExpanded
            ? StudioIcons.chevronDown(theme.textMuted, 16)
            : StudioIcons.chevronUp(theme.textMuted, 16)}
        </button>
      </div>

      {/* Control Panel Content */}
      <div
        style={{
          height: `${panelHeight}px`,
          overflowY: 'auto',
          padding: '0 16px 12px',
          borderBottom: `1px solid ${theme.cardBorder}`,
          transition: dragStartRef.current !== null ? 'none' : 'height 0.2s ease',
        }}
      >
        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Recent Designs */}
            {recentDesigns.length > 0 && (
              <div>
                <span
                  style={{
                    color: theme.textMuted,
                    fontSize: '11px',
                    fontWeight: '500',
                    marginBottom: '6px',
                    display: 'block',
                  }}
                >
                  Recent Designs
                </span>
                <div
                  style={{
                    display: 'flex',
                    gap: '6px',
                    overflowX: 'auto',
                    paddingBottom: '4px',
                  }}
                >
                  {recentDesigns.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => loadProject(project)}
                      title={project.name}
                      style={{
                        flexShrink: 0,
                        width: '68px',
                        padding: '6px',
                        borderRadius: '8px',
                        border: `1px solid ${theme.cardBorder}`,
                        background: theme.cardBg,
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <div
                        style={{
                          width: '100%',
                          height: '36px',
                          borderRadius: '4px',
                          background: project.background?.value
                            ? project.background.type === 'gradient'
                              ? `linear-gradient(135deg, ${project.background.value[0]}, ${project.background.value[1]})`
                              : project.background.value
                            : theme.cardBorder,
                        }}
                      />
                      <span
                        style={{
                          color: theme.text,
                          fontSize: '9px',
                          fontWeight: '500',
                          width: '100%',
                          textAlign: 'center',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {project.name}
                      </span>
                      {project.updated_at && (
                        <span
                          style={{
                            color: theme.textMuted,
                            fontSize: '8px',
                            width: '100%',
                            textAlign: 'center',
                          }}
                        >
                          {formatRelativeDate(project.updated_at)}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <label
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                padding: '24px',
                borderRadius: '16px',
                border: `2px dashed ${theme.cardBorder}`,
                background: theme.cardBg,
                cursor: 'pointer',
              }}
            >
              <input
                type="file"
                accept="image/*,video/*"
                onChange={(e) => e.target.files?.[0] && setImageFile(e.target.files[0])}
                style={{ display: 'none' }}
              />
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${theme.gradientStart}33, ${theme.gradientEnd}33)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {StudioIcons.upload(theme.accent)}
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: theme.text, fontSize: '14px', fontWeight: '600', margin: 0 }}>
                  {imageFile ? imageFile.name : 'Tap to upload image'}
                </p>
                <p style={{ color: theme.textMuted, fontSize: '12px', margin: '4px 0 0' }}>
                  PNG, JPG up to 10MB
                </p>
              </div>
            </label>
          </div>
        )}

        {/* AI Magic Tab */}
        {activeTab === 'ai' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input
              type="text"
              placeholder="Describe your marketing content..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              style={{
                padding: '12px 14px',
                borderRadius: '12px',
                border: `1px solid ${theme.cardBorder}`,
                background: theme.searchBg,
                color: theme.text,
                fontSize: '14px',
                outline: 'none',
              }}
            />
            <button
              onClick={generate}
              disabled={isGenerating || !prompt}
              style={{
                padding: '12px',
                borderRadius: '12px',
                border: 'none',
                background:
                  isGenerating || !prompt
                    ? theme.cardBg
                    : `linear-gradient(135deg, ${theme.gradientStart}, ${theme.gradientEnd})`,
                color: isGenerating || !prompt ? theme.textMuted : '#fff',
                fontSize: '13px',
                fontWeight: '600',
                cursor: isGenerating || !prompt ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              {isGenerating ? (
                'Generating...'
              ) : (
                <>{StudioIcons.sparkles('#fff', 16)} Generate Copy</>
              )}
            </button>

            {imageFile && (
              <button
                onClick={analyzeImage}
                disabled={isAnalyzing}
                style={{
                  padding: '10px',
                  borderRadius: '10px',
                  border: `1px solid ${theme.cardBorder}`,
                  background: isAnalyzing ? theme.cardBg : `${theme.accent}15`,
                  color: isAnalyzing ? theme.textMuted : theme.accent,
                  fontSize: '12px',
                  fontWeight: '500',
                  cursor: isAnalyzing ? 'not-allowed' : 'pointer',
                }}
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze Image'}
              </button>
            )}

            <div style={{ borderTop: `1px solid ${theme.cardBorder}`, paddingTop: '12px' }}>
              <span
                style={{
                  color: theme.textMuted,
                  fontSize: '11px',
                  marginBottom: '8px',
                  display: 'block',
                }}
              >
                AI Background
              </span>
              <input
                type="text"
                placeholder="Describe background..."
                value={backgroundPrompt || ''}
                onChange={(e) => setBackgroundPrompt(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: `1px solid ${theme.cardBorder}`,
                  background: theme.searchBg,
                  color: theme.text,
                  fontSize: '13px',
                  outline: 'none',
                  marginBottom: '8px',
                  boxSizing: 'border-box',
                }}
              />
              <button
                onClick={generateBackground}
                disabled={isGeneratingBackground || !backgroundPrompt}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '10px',
                  border: 'none',
                  background:
                    isGeneratingBackground || !backgroundPrompt
                      ? theme.cardBg
                      : `linear-gradient(135deg, ${theme.gradientStart}, ${theme.gradientEnd})`,
                  color: isGeneratingBackground || !backgroundPrompt ? theme.textMuted : '#fff',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: isGeneratingBackground || !backgroundPrompt ? 'not-allowed' : 'pointer',
                }}
              >
                {isGeneratingBackground ? 'Generating...' : 'Generate Background'}
              </button>
              {generatedBackground && (
                <div
                  style={{
                    padding: '6px',
                    borderRadius: '6px',
                    background: `${theme.accent}15`,
                    color: theme.accent,
                    fontSize: '11px',
                    textAlign: 'center',
                    marginTop: '6px',
                  }}
                >
                  AI background applied
                </div>
              )}
            </div>

            {imageFile && (
              <div
                style={{
                  borderTop: `1px solid ${theme.cardBorder}`,
                  paddingTop: '12px',
                  display: 'flex',
                  gap: '8px',
                  flexWrap: 'wrap',
                }}
              >
                <button
                  onClick={removeBackground}
                  disabled={isRemovingBackground}
                  style={{
                    flex: 1,
                    minWidth: '120px',
                    padding: '10px',
                    borderRadius: '10px',
                    border: `1px solid ${theme.cardBorder}`,
                    background: isRemovingBackground ? theme.cardBg : `${theme.accent}15`,
                    color: isRemovingBackground ? theme.textMuted : theme.accent,
                    fontSize: '11px',
                    fontWeight: '500',
                    cursor: isRemovingBackground ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isRemovingBackground ? 'Removing...' : 'Remove BG'}
                </button>
                {(subjectImage || imageFile) && generatedBackground && (
                  <button
                    onClick={autoLevel}
                    disabled={isAutoLeveling}
                    style={{
                      flex: 1,
                      minWidth: '120px',
                      padding: '10px',
                      borderRadius: '10px',
                      border: `1px solid ${theme.cardBorder}`,
                      background: isAutoLeveling ? theme.cardBg : `${theme.accent}15`,
                      color: isAutoLeveling ? theme.textMuted : theme.accent,
                      fontSize: '11px',
                      fontWeight: '500',
                      cursor: isAutoLeveling ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {isAutoLeveling ? 'Leveling...' : 'Auto-Level'}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Text Tab */}
        {activeTab === 'text' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input
              type="text"
              placeholder="Enter text..."
              value={textOverlay?.text || ''}
              onChange={(e) => setTextOverlay({ text: e.target.value })}
              style={{
                padding: '14px 16px',
                borderRadius: '12px',
                border: `1px solid ${theme.cardBorder}`,
                background: theme.searchBg,
                color: theme.text,
                fontSize: '14px',
                outline: 'none',
              }}
            />
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              {TEXT_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setTextOverlay({ color })}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    border:
                      textOverlay?.color === color
                        ? `3px solid ${theme.accent}`
                        : `2px solid ${theme.isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`,
                    background: color,
                    cursor: 'pointer',
                  }}
                />
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ color: theme.textMuted, fontSize: '12px' }}>
                Size: {textOverlay?.fontSize || 48}px
              </span>
              <input
                type="range"
                min="24"
                max="80"
                value={textOverlay?.fontSize || 48}
                onChange={(e) => setTextOverlay({ fontSize: parseInt(e.target.value) })}
                style={{ flex: 1, accentColor: theme.accent }}
              />
            </div>
            {textOverlay?.text && (
              <button
                onClick={suggestTypography}
                disabled={isSuggestingTypography}
                style={{
                  padding: '10px',
                  borderRadius: '10px',
                  border: `1px solid ${theme.cardBorder}`,
                  background: isSuggestingTypography ? theme.cardBg : `${theme.accent}15`,
                  color: isSuggestingTypography ? theme.textMuted : theme.accent,
                  fontSize: '12px',
                  fontWeight: '500',
                  cursor: isSuggestingTypography ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                {isSuggestingTypography ? (
                  'Suggesting...'
                ) : (
                  <>{StudioIcons.sparkles(theme.accent, 14)} AI Placement</>
                )}
              </button>
            )}
          </div>
        )}

        {/* Shop Tab (Promo + Brand + Tags consolidated) */}
        {activeTab === 'shop' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <PromotionalElementsPanel />
            <BrandKitPanel />
            <ProductTaggingPanel />
          </div>
        )}

        {/* Video Tab */}
        {activeTab === 'video' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <VideoGenerationPanel
              videoModel={videoModel}
              onModelChange={setVideoModel}
              videoPrompt={videoPrompt}
              onPromptChange={setVideoPrompt}
              onGenerate={generateVideo}
              isGenerating={isGeneratingVideo}
              progress={videoGenerationProgress}
              generatedVideoUrl={generatedVideoUrl}
              videoError={videoError}
            />

            {generatedVideoUrl && (
              <div style={{ borderTop: `1px solid ${theme.cardBorder}`, paddingTop: '12px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                  }}
                >
                  <span style={{ fontSize: '11px', fontWeight: '500', color: theme.textMuted }}>
                    Overlays
                  </span>
                  <button
                    onClick={() => addVideoOverlay()}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      border: 'none',
                      background: theme.accent,
                      color: '#fff',
                      fontSize: '11px',
                      cursor: 'pointer',
                    }}
                  >
                    + Add Text
                  </button>
                </div>

                {videoOverlays?.map((overlay) => (
                  <VideoOverlayEditor key={overlay.id} overlay={overlay} />
                ))}

                <button
                  onClick={() => openModal('videoExport')}
                  disabled={isRenderingVideo}
                  style={{
                    width: '100%',
                    marginTop: '12px',
                    padding: '12px',
                    borderRadius: '10px',
                    border: 'none',
                    background: isRenderingVideo
                      ? theme.cardBg
                      : `linear-gradient(135deg, ${theme.gradientStart}, ${theme.gradientEnd})`,
                    color: isRenderingVideo ? theme.textMuted : '#fff',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: isRenderingVideo ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  {StudioIcons.download('#fff', 16)} Export Video
                </button>
              </div>
            )}
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div>
            <div
              style={{
                display: 'flex',
                gap: '6px',
                marginBottom: '12px',
                overflowX: 'auto',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              {templateCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setTemplateCategory(cat.id)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '14px',
                    border: 'none',
                    background: templateCategory === cat.id ? theme.accent : theme.cardBg,
                    color: templateCategory === cat.id ? '#fff' : theme.textMuted,
                    fontSize: '11px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {filteredTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setActiveTemplate(template)}
                  style={{
                    padding: '6px',
                    borderRadius: '10px',
                    border:
                      activeTemplateId === template.id
                        ? `2px solid ${theme.accent}`
                        : `1px solid ${theme.cardBorder}`,
                    background:
                      activeTemplateId === template.id ? `${theme.accent}15` : 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      height: '40px',
                      borderRadius: '6px',
                      background:
                        template.elements?.[0]?.style === 'gradient'
                          ? `linear-gradient(135deg, ${template.elements[0].colors?.[0]}, ${template.elements[0].colors?.[1]})`
                          : template.elements?.[0]?.color || '#333',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span style={{ color: '#fff', fontSize: '8px', fontWeight: '700' }}>
                      {template.elements?.find((e) => e.type === 'text')?.content?.slice(0, 8) ||
                        ''}
                    </span>
                  </div>
                  <span style={{ color: theme.text, fontSize: '9px', fontWeight: '500' }}>
                    {template.name}
                  </span>
                </button>
              ))}
            </div>
            {activeTemplateId && (
              <button
                onClick={clearTemplate}
                style={{
                  width: '100%',
                  marginTop: '8px',
                  padding: '6px',
                  borderRadius: '8px',
                  border: `1px solid ${theme.cardBorder}`,
                  background: 'transparent',
                  color: theme.textMuted,
                  fontSize: '11px',
                  cursor: 'pointer',
                }}
              >
                Clear Template
              </button>
            )}
          </div>
        )}

        {/* Size/Platform Tab */}
        {activeTab === 'size' && (
          <div>
            <div style={{ marginBottom: '12px' }}>
              <span style={{ color: theme.textMuted, fontSize: '12px' }}>
                Current:{' '}
                <span style={{ color: theme.text, fontWeight: '600' }}>
                  {currentPreset?.label || 'Custom'}
                </span>
                <span style={{ marginLeft: '8px', color: theme.accent }}>
                  {exportWidth} × {exportHeight}
                </span>
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {Object.entries(platformPresets)
                .filter(([id]) => id !== 'custom')
                .map(([id, preset]) => (
                  <button
                    key={id}
                    onClick={() => setSelectedPlatform(id)}
                    style={{
                      padding: '12px 10px',
                      borderRadius: '10px',
                      border:
                        selectedPlatform === id
                          ? `2px solid ${theme.accent}`
                          : `1px solid ${theme.cardBorder}`,
                      background: selectedPlatform === id ? `${theme.accent}15` : 'transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      gap: '4px',
                    }}
                  >
                    <span
                      style={{
                        color: selectedPlatform === id ? theme.accent : theme.text,
                        fontSize: '12px',
                        fontWeight: '600',
                      }}
                    >
                      {preset.label}
                    </span>
                    <span style={{ color: theme.textMuted, fontSize: '10px' }}>
                      {preset.aspectRatio}
                    </span>
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Tab Bar - horizontally scrollable */}
      <div
        style={{
          display: 'flex',
          padding: '8px 0',
          paddingBottom: 'env(safe-area-inset-bottom, 8px)',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 8px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              opacity: activeTab === tab.id ? 1 : 0.5,
              minWidth: '56px',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                background: activeTab === tab.id ? `${theme.accent}22` : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {tab.icon(activeTab === tab.id ? theme.accent : theme.textMuted, 18)}
            </div>
            <span
              style={{
                fontSize: '9px',
                fontWeight: activeTab === tab.id ? '600' : '400',
                color: activeTab === tab.id ? theme.accent : theme.textMuted,
              }}
            >
              {tab.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default StudioMobileControls
