import { usePhoneTheme } from '@/context/PhoneThemeContext'
import { gradientPresets } from '@/lib/platformTemplates'
import { StudioIcons } from '../utils/StudioIcons'
import { SOLID_COLORS, TEXT_COLORS } from '../utils/studioConstants'
import { VideoGenerationPanel } from './VideoGenerationPanel'
import { VideoOverlayEditor } from './VideoOverlayEditor'

/**
 * StudioSidebar - Desktop left sidebar with all studio controls
 *
 * Sections:
 * 1. Upload Media
 * 2. AI Magic
 * 3. Templates
 * 4. Background Colors
 * 5. Text Overlay
 */
export function StudioSidebar({
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

  // AI - Typography (Phase 2)
  onSuggestTypography,
  isSuggestingTypography,

  // AI - Auto-level (Phase 2)
  onAutoLevel,
  isAutoLeveling,

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
  onRenderFinalVideo: _onRenderFinalVideo,
  isRenderingVideo,
  onOpenVideoExport,

  // Templates
  templates = [],
  activeTemplateId,
  onTemplateSelect,
  onClearTemplate,
  onOpenTemplateLibrary,

  // Background
  background,
  onBackgroundChange,

  // Text
  textOverlay,
  onTextChange,
}) {
  const { theme } = usePhoneTheme()

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
            onChange={(e) => e.target.files?.[0] && onImageUpload(e.target.files[0])}
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
            onChange={(e) => onPromptChange(e.target.value)}
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
            onClick={onGenerate}
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
              onClick={onAnalyzeImage}
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
          <input
            type="text"
            placeholder="Describe background... (marble desk, beach sunset)"
            value={backgroundPrompt || ''}
            onChange={(e) => onBackgroundPromptChange?.(e.target.value)}
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
            onClick={onGenerateBackground}
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
              onClick={onRemoveBackground}
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
                onClick={onAutoLevel}
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
          </div>
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
          <div style={{ marginTop: '16px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '8px',
              }}
            >
              <span style={{ fontSize: '12px', fontWeight: '500', color: theme.textSecondary }}>
                Video Overlays
              </span>
              <button
                onClick={() => onAddVideoOverlay?.()}
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
            </div>

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
            onClick={onOpenTemplateLibrary}
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
          {templates.slice(0, 4).map((template) => (
            <button
              key={template.id}
              onClick={() => onTemplateSelect(template)}
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
            onClick={onClearTemplate}
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
                onClick={() => onBackgroundChange({ type: 'solid', value: color })}
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
                onClick={() => onBackgroundChange({ type: 'gradient', value: gradient.colors })}
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
                  onClick={() => onTextChange({ color })}
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
              onChange={(e) => onTextChange({ fontSize: parseInt(e.target.value) })}
              style={{ width: '100%', accentColor: theme.accent }}
            />
          </div>

          {/* AI Typography Placement (Phase 2) */}
          {textOverlay?.text && (
            <button
              onClick={onSuggestTypography}
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

      {/* Keyframe for spinner */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default StudioSidebar
