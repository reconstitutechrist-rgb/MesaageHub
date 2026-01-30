import { useEffect, useRef } from 'react'
import { usePhoneTheme } from '@/context/PhoneThemeContext'
import { gradientPresets, platformPresets } from '@/lib/platformTemplates'
import { StudioIcons } from '../utils/StudioIcons'
import { triggerHaptic } from '../utils/haptics'
import {
  SOLID_COLORS,
  TEXT_COLORS,
  RETAIL_SCENARIOS,
  LIGHTING_PRESETS,
} from '../utils/studioConstants'
import { VideoGenerationPanel } from './VideoGenerationPanel'
import { VideoOverlayEditor } from './VideoOverlayEditor'
import { BrandKitPanel } from './BrandKitPanel'
import { PromotionalElementsPanel } from './PromotionalElementsPanel'
import { ObjectRemovalPanel } from './ObjectRemovalPanel'
import { AnalyticsPanel } from './AnalyticsPanel'
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
  useIsSuggestingTypography,
  useIsAutoLeveling,
  useSelectedLightingPreset,
  useIsApplyingRelighting,
  useVideoModel,
  useVideoPrompt,
  useIsGeneratingVideo,
  useVideoGenerationProgress,
  useGeneratedVideoUrl,
  useVideoError,
  useVideoOverlays,
  useIsRenderingVideo,
  useActiveTemplate,
  useBackground,
  useTextOverlay,
  useMarketingTemplates,
  useRecentDesigns,
  useLastGenerationError,
  // Action selectors
  useCanvasActions,
  useAIActions,
  useVideoActions,
  useUIActions,
  useTextOverlayActions,
} from '../store/selectors'

/**
 * StudioSidebar - Desktop left sidebar with all studio controls
 *
 * Uses Zustand store for all state and actions.
 *
 * Sections:
 * 1. Upload Media
 * 2. AI Magic
 * 3. Templates
 * 4. Background Colors
 * 5. Text Overlay
 */
export function StudioSidebar() {
  const { theme } = usePhoneTheme()

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
  const isSuggestingTypography = useIsSuggestingTypography()
  const isAutoLeveling = useIsAutoLeveling()
  const selectedLightingPreset = useSelectedLightingPreset()
  const isApplyingRelighting = useIsApplyingRelighting()
  const videoModel = useVideoModel()
  const videoPrompt = useVideoPrompt()
  const isGeneratingVideo = useIsGeneratingVideo()
  const videoGenerationProgress = useVideoGenerationProgress()
  const generatedVideoUrl = useGeneratedVideoUrl()
  const videoError = useVideoError()
  const videoOverlays = useVideoOverlays()
  const isRenderingVideo = useIsRenderingVideo()
  const activeTemplate = useActiveTemplate()
  const background = useBackground()
  const textOverlay = useTextOverlay()
  const templates = useMarketingTemplates()
  const recentDesigns = useRecentDesigns()
  const lastGenerationError = useLastGenerationError()

  // Get actions from Zustand store
  const { setImageFile, setBackground, setActiveTemplate, clearTemplate } = useCanvasActions()
  const {
    setPrompt,
    generate,
    analyzeImage,
    setBackgroundPrompt,
    setSubjectImage,
    generateBackground,
    removeBackground,
    suggestTypography,
    autoLevel,
    setSelectedLightingPreset,
    applyRelighting,
  } = useAIActions()
  const { setVideoModel, setVideoPrompt, generateVideo, addVideoOverlay } = useVideoActions()
  const { openModal, loadProject, loadRecentDesigns } = useUIActions()
  const { setTextOverlay } = useTextOverlayActions()

  // Haptic feedback on AI generation completion
  const wasGeneratingRef = useRef(false)
  const wasGeneratingBgRef = useRef(false)

  useEffect(() => {
    if (wasGeneratingRef.current && !isGenerating) {
      triggerHaptic(lastGenerationError === 'generation' ? 'error' : 'success')
    }
    wasGeneratingRef.current = isGenerating
  }, [isGenerating, lastGenerationError])

  useEffect(() => {
    if (wasGeneratingBgRef.current && !isGeneratingBackground) {
      triggerHaptic(lastGenerationError === 'background' ? 'error' : 'success')
    }
    wasGeneratingBgRef.current = isGeneratingBackground
  }, [isGeneratingBackground, lastGenerationError])

  // Load recent designs on mount
  useEffect(() => {
    loadRecentDesigns()
  }, [loadRecentDesigns])

  // Helpers
  const formatRelativeDate = (dateStr) => {
    if (!dateStr) return ''
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    const days = Math.floor(hrs / 24)
    return `${days}d ago`
  }

  // Derived state
  const activeTemplateId = activeTemplate?.id
  const templatesList = Object.values(templates || {})

  return (
    <div
      style={{
        width: '320px',
        borderRight: `1px solid ${theme.cardBorder}`,
        background: theme.navBg,
        backdropFilter: 'blur(20px)',
        padding: '20px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
      }}
    >
      {/* Upload Media Section */}
      <div>
        <h3
          style={{
            color: theme.text,
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {StudioIcons.image(theme.accent, 18)} Upload Media
        </h3>
        <label
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            padding: '32px',
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
              width: '56px',
              height: '56px',
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
              {imageFile ? imageFile.name : 'Drop your image here'}
            </p>
            <p style={{ color: theme.textMuted, fontSize: '12px', margin: '4px 0 0' }}>
              PNG, JPG up to 10MB
            </p>
          </div>
        </label>
      </div>

      {/* Recent Designs Section */}
      {recentDesigns.length > 0 && (
        <div>
          <h3
            style={{
              color: theme.text,
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {StudioIcons.clock(theme.accent, 18)} Recent Designs
          </h3>
          <div
            style={{
              display: 'flex',
              gap: '8px',
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
                  width: '80px',
                  padding: '8px',
                  borderRadius: '10px',
                  border: `1px solid ${theme.cardBorder}`,
                  background: theme.cardBg,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: '48px',
                    borderRadius: '6px',
                    background: project.background?.value
                      ? project.background.type === 'gradient'
                        ? `linear-gradient(135deg, ${project.background.value[0]}, ${project.background.value[1]})`
                        : project.background.value
                      : theme.cardBorder,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {project.text_overlay?.text && (
                    <span
                      style={{
                        color: project.text_overlay.color || '#fff',
                        fontSize: '8px',
                        fontWeight: '700',
                        textAlign: 'center',
                        overflow: 'hidden',
                        padding: '2px',
                      }}
                    >
                      {project.text_overlay.text.slice(0, 12)}
                    </span>
                  )}
                </div>
                <span
                  style={{
                    color: theme.text,
                    fontSize: '10px',
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
                <span
                  style={{
                    color: theme.textMuted,
                    fontSize: '8px',
                    width: '100%',
                    textAlign: 'center',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {platformPresets[project.platform_preset]?.label || ''}
                  {project.updated_at ? ` · ${formatRelativeDate(project.updated_at)}` : ''}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Brand Kit Section */}
      <BrandKitPanel />

      {/* Promotional Elements Section */}
      <PromotionalElementsPanel />

      {/* Product Tagging Section */}
      <ProductTaggingPanel />

      {/* AI Magic Section */}
      <div>
        <h3
          style={{
            color: theme.text,
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {StudioIcons.sparkles(theme.accent, 18)} AI Magic
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input
            type="text"
            placeholder="Describe your marketing content..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
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
          <button
            onClick={generate}
            disabled={isGenerating || !prompt}
            style={{
              padding: '14px',
              borderRadius: '12px',
              border: 'none',
              background:
                isGenerating || !prompt
                  ? theme.cardBg
                  : `linear-gradient(135deg, ${theme.gradientStart}, ${theme.gradientEnd})`,
              color: isGenerating || !prompt ? theme.textMuted : '#fff',
              fontSize: '14px',
              fontWeight: '600',
              cursor: isGenerating || !prompt ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            {isGenerating ? (
              <>
                <div
                  style={{
                    width: '18px',
                    height: '18px',
                    border: `2px solid ${theme.textMuted}`,
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                  }}
                />
                Generating...
              </>
            ) : (
              <>{StudioIcons.sparkles('#fff', 18)} Generate with AI</>
            )}
          </button>

          {/* Analyze Image Button - only show when image is uploaded */}
          {imageFile && (
            <button
              onClick={analyzeImage}
              disabled={isAnalyzing}
              style={{
                padding: '12px',
                borderRadius: '12px',
                border: `1px solid ${theme.cardBorder}`,
                background: isAnalyzing ? theme.cardBg : `${theme.accent}15`,
                color: isAnalyzing ? theme.textMuted : theme.accent,
                fontSize: '13px',
                fontWeight: '500',
                cursor: isAnalyzing ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              {isAnalyzing ? (
                <>
                  <div
                    style={{
                      width: '16px',
                      height: '16px',
                      border: `2px solid ${theme.textMuted}`,
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                    }}
                  />
                  Analyzing Image...
                </>
              ) : (
                <>{StudioIcons.image(theme.accent, 16)} Analyze Image for Copy</>
              )}
            </button>
          )}
        </div>
      </div>

      {/* AI Background Generation Section (Phase 2) */}
      <div>
        <h3
          style={{
            color: theme.text,
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {StudioIcons.layers(theme.accent, 18)} AI Background
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Retail Scenarios Quick Select */}
          <div>
            <span
              style={{
                color: theme.textMuted,
                fontSize: '11px',
                marginBottom: '6px',
                display: 'block',
              }}
            >
              Retail Scenes
            </span>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {RETAIL_SCENARIOS.slice(0, 6).map((scenario) => (
                <button
                  key={scenario.id}
                  onClick={() => setBackgroundPrompt(scenario.prompt)}
                  title={scenario.prompt}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '8px',
                    border: `1px solid ${theme.cardBorder}`,
                    background:
                      backgroundPrompt === scenario.prompt ? `${theme.accent}15` : theme.cardBg,
                    color: backgroundPrompt === scenario.prompt ? theme.accent : theme.textMuted,
                    fontSize: '11px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {scenario.name}
                </button>
              ))}
            </div>
          </div>
          <input
            type="text"
            placeholder="Describe background... (marble desk, beach sunset)"
            value={backgroundPrompt || ''}
            onChange={(e) => setBackgroundPrompt(e.target.value)}
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
          <button
            onClick={generateBackground}
            disabled={isGeneratingBackground || !backgroundPrompt}
            style={{
              padding: '14px',
              borderRadius: '12px',
              border: 'none',
              background:
                isGeneratingBackground || !backgroundPrompt
                  ? theme.cardBg
                  : `linear-gradient(135deg, ${theme.gradientStart}, ${theme.gradientEnd})`,
              color: isGeneratingBackground || !backgroundPrompt ? theme.textMuted : '#fff',
              fontSize: '14px',
              fontWeight: '600',
              cursor: isGeneratingBackground || !backgroundPrompt ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            {isGeneratingBackground ? (
              <>
                <div
                  style={{
                    width: '18px',
                    height: '18px',
                    border: `2px solid ${theme.textMuted}`,
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                  }}
                />
                Generating Background...
              </>
            ) : (
              <>{StudioIcons.sparkles('#fff', 18)} Generate Background</>
            )}
          </button>
          {generatedBackground && (
            <div
              style={{
                padding: '8px',
                borderRadius: '8px',
                background: `${theme.accent}15`,
                color: theme.accent,
                fontSize: '12px',
                textAlign: 'center',
              }}
            >
              AI background applied
            </div>
          )}
        </div>
      </div>

      {/* Subject Processing Section (Phase 2) */}
      {imageFile && (
        <div>
          <h3
            style={{
              color: theme.text,
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {StudioIcons.image(theme.accent, 18)} Subject Processing
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* Remove Background Button */}
            <button
              onClick={removeBackground}
              disabled={isRemovingBackground}
              style={{
                padding: '12px',
                borderRadius: '12px',
                border: `1px solid ${theme.cardBorder}`,
                background: isRemovingBackground ? theme.cardBg : `${theme.accent}15`,
                color: isRemovingBackground ? theme.textMuted : theme.accent,
                fontSize: '13px',
                fontWeight: '500',
                cursor: isRemovingBackground ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              {isRemovingBackground ? (
                <>
                  <div
                    style={{
                      width: '16px',
                      height: '16px',
                      border: `2px solid ${theme.textMuted}`,
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                    }}
                  />
                  Removing Background...
                </>
              ) : (
                <>{StudioIcons.layers(theme.accent, 16)} Remove Background</>
              )}
            </button>

            {/* Auto-Level Button - only show when both subject and generated background exist */}
            {(subjectImage || imageFile) && generatedBackground && (
              <button
                onClick={autoLevel}
                disabled={isAutoLeveling}
                style={{
                  padding: '12px',
                  borderRadius: '12px',
                  border: `1px solid ${theme.cardBorder}`,
                  background: isAutoLeveling ? theme.cardBg : `${theme.accent}15`,
                  color: isAutoLeveling ? theme.textMuted : theme.accent,
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: isAutoLeveling ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                {isAutoLeveling ? (
                  <>
                    <div
                      style={{
                        width: '16px',
                        height: '16px',
                        border: `2px solid ${theme.textMuted}`,
                        borderTopColor: 'transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                      }}
                    />
                    Auto-Leveling...
                  </>
                ) : (
                  <>{StudioIcons.sparkles(theme.accent, 16)} Auto-Level Colors</>
                )}
              </button>
            )}

            {subjectImage && (
              <div
                style={{
                  padding: '8px',
                  borderRadius: '8px',
                  background: `${theme.accent}15`,
                  color: theme.accent,
                  fontSize: '12px',
                  textAlign: 'center',
                }}
              >
                Background removed
              </div>
            )}

            {/* Lighting Presets (Phase 3) - show when subject exists */}
            {(subjectImage || imageFile) && (
              <div style={{ marginTop: '12px' }}>
                <span
                  style={{
                    color: theme.textMuted,
                    fontSize: '11px',
                    marginBottom: '8px',
                    display: 'block',
                  }}
                >
                  Re-Lighting Presets
                </span>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {LIGHTING_PRESETS.map((preset) => {
                    const isSelected = selectedLightingPreset?.id === preset.id
                    return (
                      <button
                        key={preset.id}
                        onClick={() => {
                          setSelectedLightingPreset(preset)
                          applyRelighting(preset.settings)
                        }}
                        disabled={isApplyingRelighting}
                        title={preset.description}
                        style={{
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: isSelected
                            ? `2px solid ${theme.accent}`
                            : `1px solid ${theme.cardBorder}`,
                          background: isSelected ? `${theme.accent}15` : theme.cardBg,
                          color: isSelected ? theme.accent : theme.textMuted,
                          fontSize: '11px',
                          fontWeight: '500',
                          cursor: isApplyingRelighting ? 'wait' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          opacity: isApplyingRelighting ? 0.6 : 1,
                        }}
                      >
                        {preset.icon === 'sun' &&
                          StudioIcons.sun(isSelected ? theme.accent : theme.textMuted, 14)}
                        {preset.icon === 'aperture' &&
                          StudioIcons.aperture(isSelected ? theme.accent : theme.textMuted, 14)}
                        {preset.icon === 'sunset' &&
                          StudioIcons.sunset(isSelected ? theme.accent : theme.textMuted, 14)}
                        {preset.icon === 'zap' &&
                          StudioIcons.zap(isSelected ? theme.accent : theme.textMuted, 14)}
                        {preset.icon === 'contrast' &&
                          StudioIcons.contrast(isSelected ? theme.accent : theme.textMuted, 14)}
                        {preset.icon === 'moon' &&
                          StudioIcons.moon(isSelected ? theme.accent : theme.textMuted, 14)}
                        {preset.name}
                      </button>
                    )
                  })}
                </div>
                {isApplyingRelighting && (
                  <div
                    style={{
                      marginTop: '8px',
                      padding: '8px',
                      borderRadius: '8px',
                      background: theme.cardBg,
                      color: theme.textMuted,
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                  >
                    <div
                      style={{
                        width: '14px',
                        height: '14px',
                        border: `2px solid ${theme.textMuted}`,
                        borderTopColor: 'transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                      }}
                    />
                    Applying lighting...
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Object Removal Panel (Phase 3) */}
          {subjectImage && (
            <ObjectRemovalPanel
              imageBase64={subjectImage}
              onImageUpdate={(newBase64) => setSubjectImage(newBase64)}
            />
          )}
        </div>
      )}

      {/* AI Video Generation Section (Phase 3) */}
      <div>
        <h3
          style={{
            color: theme.text,
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {StudioIcons.video(theme.accent, 18)} AI Video
        </h3>

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

        {/* Video Overlays - only show after video is generated */}
        {generatedVideoUrl && (
          <div style={{ marginTop: '16px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '8px',
              }}
            >
              <span style={{ fontSize: '12px', fontWeight: '500', color: theme.textMuted }}>
                Video Overlays
              </span>
              <button
                onClick={() => addVideoOverlay()}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  background: theme.accent,
                  color: '#fff',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                {StudioIcons.plus('#fff', 14)} Add Text
              </button>
            </div>

            {/* Overlay list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {videoOverlays?.map((overlay) => (
                <VideoOverlayEditor key={overlay.id} overlay={overlay} />
              ))}
            </div>

            {/* Export button */}
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
                fontSize: '14px',
                fontWeight: '600',
                cursor: isRenderingVideo ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              {StudioIcons.download('#fff', 18)} Export Video
            </button>
          </div>
        )}
      </div>

      {/* Templates Section */}
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px',
          }}
        >
          <h3
            style={{
              color: theme.text,
              fontSize: '14px',
              fontWeight: '600',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {StudioIcons.grid(theme.accent, 18)} Templates
          </h3>
          <button
            onClick={() => openModal('templates')}
            style={{
              background: 'none',
              border: 'none',
              color: theme.accent,
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer',
            }}
          >
            See all
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {templatesList.slice(0, 4).map((template) => (
            <button
              key={template.id}
              onClick={() => setActiveTemplate(template)}
              style={{
                padding: '12px 8px',
                borderRadius: '12px',
                border:
                  activeTemplateId === template.id
                    ? `2px solid ${theme.accent}`
                    : `1px solid ${theme.cardBorder}`,
                background: activeTemplateId === template.id ? `${theme.accent}15` : 'transparent',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {/* Template Preview */}
              <div
                style={{
                  width: '100%',
                  height: '48px',
                  borderRadius: '8px',
                  background:
                    template.elements?.[0]?.style === 'gradient'
                      ? `linear-gradient(135deg, ${template.elements[0].colors?.[0]}, ${template.elements[0].colors?.[1]})`
                      : template.elements?.[0]?.color || '#333',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                <span
                  style={{
                    color: '#fff',
                    fontSize: '10px',
                    fontWeight: '700',
                    textAlign: 'center',
                    padding: '4px',
                  }}
                >
                  {template.elements?.find((e) => e.type === 'text')?.content?.slice(0, 12) ||
                    template.name}
                </span>
              </div>
              <span style={{ color: theme.text, fontSize: '11px', fontWeight: '500' }}>
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
              padding: '8px',
              borderRadius: '8px',
              border: `1px solid ${theme.cardBorder}`,
              background: 'transparent',
              color: theme.textMuted,
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            Clear Template
          </button>
        )}
      </div>

      {/* Background Colors Section */}
      <div>
        <h3
          style={{
            color: theme.text,
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {StudioIcons.layers(theme.accent, 18)} Background
        </h3>

        {/* Solid Colors */}
        <div style={{ marginBottom: '12px' }}>
          <span
            style={{
              color: theme.textMuted,
              fontSize: '12px',
              marginBottom: '8px',
              display: 'block',
            }}
          >
            Solid Colors
          </span>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {SOLID_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => setBackground({ type: 'solid', value: color })}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  border:
                    background?.value === color
                      ? `2px solid ${theme.accent}`
                      : `1px solid ${theme.cardBorder}`,
                  background: color,
                  cursor: 'pointer',
                }}
              />
            ))}
          </div>
        </div>

        {/* Gradients */}
        <div>
          <span
            style={{
              color: theme.textMuted,
              fontSize: '12px',
              marginBottom: '8px',
              display: 'block',
            }}
          >
            Gradients
          </span>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {gradientPresets.slice(0, 6).map((gradient) => (
              <button
                key={gradient.id}
                onClick={() => setBackground({ type: 'gradient', value: gradient.colors })}
                title={gradient.label}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  border:
                    JSON.stringify(background?.value) === JSON.stringify(gradient.colors)
                      ? `2px solid ${theme.accent}`
                      : `1px solid ${theme.cardBorder}`,
                  background: `linear-gradient(135deg, ${gradient.colors[0]}, ${gradient.colors[1]})`,
                  cursor: 'pointer',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Text Overlay Section */}
      <div>
        <h3
          style={{
            color: theme.text,
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {StudioIcons.type(theme.accent, 18)} Text Overlay
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Text Input */}
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

          {/* Text Color */}
          <div>
            <span
              style={{
                color: theme.textMuted,
                fontSize: '12px',
                marginBottom: '8px',
                display: 'block',
              }}
            >
              Text Color
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              {TEXT_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setTextOverlay({ color })}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    border:
                      textOverlay?.color === color
                        ? `3px solid ${theme.accent}`
                        : `2px solid ${theme.isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`,
                    background: color,
                    cursor: 'pointer',
                    boxShadow:
                      textOverlay?.color === color ? `0 0 12px ${theme.accentGlow}` : 'none',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Font Size */}
          <div>
            <span
              style={{
                color: theme.textMuted,
                fontSize: '12px',
                marginBottom: '8px',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              Font Size <span style={{ color: theme.text }}>{textOverlay?.fontSize || 48}px</span>
            </span>
            <input
              type="range"
              min="24"
              max="120"
              value={textOverlay?.fontSize || 48}
              onChange={(e) => setTextOverlay({ fontSize: parseInt(e.target.value) })}
              style={{ width: '100%', accentColor: theme.accent }}
            />
          </div>

          {/* AI Typography Placement (Phase 2) */}
          {textOverlay?.text && (
            <button
              onClick={suggestTypography}
              disabled={isSuggestingTypography}
              style={{
                padding: '12px',
                borderRadius: '12px',
                border: `1px solid ${theme.cardBorder}`,
                background: isSuggestingTypography ? theme.cardBg : `${theme.accent}15`,
                color: isSuggestingTypography ? theme.textMuted : theme.accent,
                fontSize: '13px',
                fontWeight: '500',
                cursor: isSuggestingTypography ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              {isSuggestingTypography ? (
                <>
                  <div
                    style={{
                      width: '16px',
                      height: '16px',
                      border: `2px solid ${theme.textMuted}`,
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                    }}
                  />
                  Suggesting Placement...
                </>
              ) : (
                <>{StudioIcons.sparkles(theme.accent, 16)} AI Typography Placement</>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Performance Analytics */}
      <AnalyticsPanel />

      {/* Keyframe for spinner */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default StudioSidebar
