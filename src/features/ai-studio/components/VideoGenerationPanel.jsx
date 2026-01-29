/**
 * VideoGenerationPanel - Controls for AI video generation
 * Includes model selector, prompt input, and generate button with progress
 */

import { usePhoneTheme } from '@/context/PhoneThemeContext'
import { VideoModelSelector } from './VideoModelSelector'
import { StudioIcons } from '../utils/StudioIcons'

export function VideoGenerationPanel({
  // Model selection
  videoModel,
  onModelChange,
  // Prompt
  videoPrompt,
  onPromptChange,
  // Generation
  onGenerate,
  isGenerating,
  progress,
  // Result
  generatedVideoUrl,
  videoError,
}) {
  const { theme } = usePhoneTheme()

  const canGenerate = videoPrompt?.trim() && !isGenerating

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Model Selector */}
      <VideoModelSelector
        selectedModel={videoModel}
        onModelChange={onModelChange}
        disabled={isGenerating}
      />

      {/* Prompt Input */}
      <div>
        <label
          style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: '500',
            color: theme.textMuted,
            marginBottom: '6px',
          }}
        >
          Describe your video
        </label>
        <textarea
          value={videoPrompt}
          onChange={(e) => onPromptChange(e.target.value)}
          placeholder="e.g., A sleek smartphone floating over a gradient background with soft particles..."
          disabled={isGenerating}
          style={{
            width: '100%',
            minHeight: '80px',
            padding: '10px 12px',
            borderRadius: '8px',
            border: `1px solid ${theme.cardBorder}`,
            background: theme.bg,
            color: theme.text,
            fontSize: '13px',
            fontFamily: 'inherit',
            resize: 'vertical',
            outline: 'none',
            opacity: isGenerating ? 0.5 : 1,
          }}
        />
      </div>

      {/* Generate Button */}
      <button
        onClick={onGenerate}
        disabled={!canGenerate}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          padding: '12px 16px',
          borderRadius: '8px',
          border: 'none',
          background: canGenerate ? theme.accent : theme.cardBg,
          color: canGenerate ? '#fff' : theme.textMuted,
          cursor: canGenerate ? 'pointer' : 'not-allowed',
          fontWeight: '600',
          fontSize: '14px',
          transition: 'all 0.2s ease',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {isGenerating ? (
          <>
            {/* Progress ring */}
            <div
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                border: '2px solid rgba(255,255,255,0.3)',
                borderTopColor: '#fff',
                animation: 'spin 1s linear infinite',
              }}
            />
            <span>Generating... {Math.round(progress)}%</span>
          </>
        ) : (
          <>
            {StudioIcons.video('#fff', 18)}
            <span>Generate Video</span>
          </>
        )}

        {/* Progress bar background */}
        {isGenerating && (
          <div
            style={{
              position: 'absolute',
              left: 0,
              bottom: 0,
              height: '3px',
              width: `${progress}%`,
              background: 'rgba(255,255,255,0.5)',
              transition: 'width 0.3s ease',
            }}
          />
        )}
      </button>

      {/* Error message */}
      {videoError && (
        <div
          style={{
            padding: '10px 12px',
            borderRadius: '8px',
            background: '#ef444415',
            border: '1px solid #ef4444',
            color: '#ef4444',
            fontSize: '12px',
          }}
        >
          {videoError}
        </div>
      )}

      {/* Success indicator */}
      {generatedVideoUrl && !isGenerating && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 12px',
            borderRadius: '8px',
            background: '#22c55e15',
            border: '1px solid #22c55e',
            color: '#22c55e',
            fontSize: '12px',
          }}
        >
          {StudioIcons.check('#22c55e', 16)}
          <span>Video generated successfully!</span>
        </div>
      )}

      {/* CSS for spinner animation */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default VideoGenerationPanel
