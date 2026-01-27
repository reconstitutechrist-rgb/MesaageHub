import { useState } from 'react'
import { usePhoneTheme } from '@/context/PhoneThemeContext'
import { StudioIcons } from '../utils/StudioIcons'
import { TEXT_COLORS } from '../utils/studioConstants'
import { VideoGenerationPanel } from './VideoGenerationPanel'
import { VideoOverlayEditor } from './VideoOverlayEditor'

/**
 * StudioMobileControls - Mobile tabbed control panel
 *
 * Bottom panel with tabs for:
 * - Upload: File input for images
 * - AI: Copy generation, background generation, subject processing
 * - Templates: Category filter and template grid
 * - Text: Input, color picker, font size slider, AI typography
 * - Size: Platform presets grid
 */
export function StudioMobileControls({
  // Upload
  imageFile,
  onImageUpload,

  // AI - Copy generation
  prompt,
  onPromptChange,
  onGenerate,
  isGenerating,
  onAnalyzeImage,
  isAnalyzing,

  // AI - Background generation (Phase 2)
  backgroundPrompt,
  onBackgroundPromptChange,
  onGenerateBackground,
  isGeneratingBackground,
  generatedBackground,

  // AI - Subject processing (Phase 2)
  onRemoveBackground,
  isRemovingBackground,
  subjectImage,

  // AI - Auto-level (Phase 2)
  onAutoLevel,
  isAutoLeveling,

  // AI - Typography (Phase 2)
  onSuggestTypography,
  isSuggestingTypography,

  // Text
  textOverlay,
  onTextChange,

  // Templates
  templates = [],
  templateCategories = [],
  activeTemplateId,
  onTemplateSelect,
  onClearTemplate,

  // Platform
  platformPresets = {},
  selectedPlatform,
  currentPreset,
  exportWidth,
  exportHeight,
  onPlatformSelect,

  // AI - Video generation (Phase 3)
  videoModel,
  onVideoModelChange,
  videoPrompt,
  onVideoPromptChange,
  onGenerateVideo,
  isGeneratingVideo,
  videoGenerationProgress,
  generatedVideoUrl,
  videoError,
  // Video overlays (Phase 3)
  videoOverlays,
  selectedOverlayId,
  onSelectOverlay,
  onAddVideoOverlay,
  onUpdateVideoOverlay,
  onRemoveVideoOverlay,
  videoDuration,
  // Video rendering (Phase 3)
  onOpenVideoExport,
  isRenderingVideo,
}) {
  const { theme } = usePhoneTheme()
  const [activeTab, setActiveTab] = useState('upload')
  const [templateCategory, setTemplateCategory] = useState('all')

  // Filter templates by category
  const filteredTemplates =
    templateCategory === 'all'
      ? templates
      : templates.filter((t) => t.category === templateCategory)

  const tabs = [
    { id: 'upload', icon: StudioIcons.upload, label: 'Upload' },
    { id: 'ai', icon: StudioIcons.sparkles, label: 'AI' },
    { id: 'video', icon: StudioIcons.video, label: 'Video' },
    { id: 'templates', icon: StudioIcons.layers, label: 'Templates' },
    { id: 'text', icon: StudioIcons.type, label: 'Text' },
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
      {/* Control Panel Content */}
      <div
        style={{
          height: '180px',
          overflowY: 'auto',
          padding: '16px',
          borderBottom: `1px solid ${theme.cardBorder}`,
        }}
      >
        {/* Upload Tab */}
        {activeTab === 'upload' && (
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
              onChange={(e) => e.target.files?.[0] && onImageUpload(e.target.files[0])}
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
        )}

        {/* AI Magic Tab */}
        {activeTab === 'ai' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Copy Generation */}
            <input
              type="text"
              placeholder="Describe your marketing content..."
              value={prompt}
              onChange={(e) => onPromptChange(e.target.value)}
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
              onClick={onGenerate}
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

            {/* Analyze Image Button */}
            {imageFile && (
              <button
                onClick={onAnalyzeImage}
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

            {/* Background Generation (Phase 2) */}
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
                onChange={(e) => onBackgroundPromptChange?.(e.target.value)}
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
                onClick={onGenerateBackground}
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

            {/* Subject Processing (Phase 2) */}
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
                  onClick={onRemoveBackground}
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
                    onClick={onAutoLevel}
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

        {/* Video Tab (Phase 3) */}
        {activeTab === 'video' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <VideoGenerationPanel
              videoModel={videoModel}
              onModelChange={onVideoModelChange}
              videoPrompt={videoPrompt}
              onPromptChange={onVideoPromptChange}
              onGenerate={onGenerateVideo}
              isGenerating={isGeneratingVideo}
              progress={videoGenerationProgress}
              generatedVideoUrl={generatedVideoUrl}
              videoError={videoError}
            />

            {/* Video Overlays - only show after video is generated */}
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
                    onClick={() => onAddVideoOverlay?.()}
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

                {/* Compact overlay list for mobile */}
                {videoOverlays?.slice(0, 2).map((overlay) => (
                  <VideoOverlayEditor
                    key={overlay.id}
                    overlay={overlay}
                    videoDuration={videoDuration || 8}
                    onUpdate={onUpdateVideoOverlay}
                    onRemove={onRemoveVideoOverlay}
                    isSelected={selectedOverlayId === overlay.id}
                    onSelect={onSelectOverlay}
                  />
                ))}

                {videoOverlays?.length > 2 && (
                  <div
                    style={{
                      fontSize: '11px',
                      color: theme.textMuted,
                      textAlign: 'center',
                      marginTop: '8px',
                    }}
                  >
                    +{videoOverlays.length - 2} more overlays
                  </div>
                )}

                {/* Export button */}
                <button
                  onClick={onOpenVideoExport}
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

        {/* Text Tab */}
        {activeTab === 'text' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input
              type="text"
              placeholder="Enter text..."
              value={textOverlay?.text || ''}
              onChange={(e) => onTextChange({ text: e.target.value })}
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
                  onClick={() => onTextChange({ color })}
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
                onChange={(e) => onTextChange({ fontSize: parseInt(e.target.value) })}
                style={{ flex: 1, accentColor: theme.accent }}
              />
            </div>
            {/* AI Typography Placement (Phase 2) */}
            {textOverlay?.text && (
              <button
                onClick={onSuggestTypography}
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

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', overflowX: 'auto' }}>
              {templateCategories.slice(0, 4).map((cat) => (
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
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {filteredTemplates.slice(0, 6).map((template) => (
                <button
                  key={template.id}
                  onClick={() => onTemplateSelect(template)}
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
                onClick={onClearTemplate}
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
                .slice(0, 6)
                .map(([id, preset]) => (
                  <button
                    key={id}
                    onClick={() => onPlatformSelect(id, preset)}
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

      {/* Tab Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          padding: '8px 0',
          paddingBottom: 'env(safe-area-inset-bottom, 8px)',
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
              padding: '8px 12px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              opacity: activeTab === tab.id ? 1 : 0.5,
              minWidth: '64px',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: activeTab === tab.id ? `${theme.accent}22` : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {tab.icon(activeTab === tab.id ? theme.accent : theme.textMuted, 20)}
            </div>
            <span
              style={{
                fontSize: '10px',
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
