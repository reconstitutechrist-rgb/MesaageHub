/**
 * VideoPlayer - Preview player with overlay rendering using framer-motion
 */

import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react'
import { usePhoneTheme } from '@/context/PhoneThemeContext'
import { StudioIcons } from '../utils/StudioIcons'
import { VideoOverlayElement } from './VideoOverlayElement'

export const VideoPlayer = forwardRef(function VideoPlayer(
  {
    videoUrl,
    overlays = [],
    isPlaying,
    onPlayPause,
    currentTime,
    onTimeUpdate,
    duration,
    onDurationChange,
    selectedOverlayId,
    onOverlaySelect,
    style = {},
  },
  ref
) {
  const { theme } = usePhoneTheme()
  const videoRef = useRef(null)
  const containerRef = useRef(null)

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    play: () => videoRef.current?.play(),
    pause: () => videoRef.current?.pause(),
    seek: (time) => {
      if (videoRef.current) {
        videoRef.current.currentTime = time
      }
    },
    getCurrentTime: () => videoRef.current?.currentTime || 0,
    getDuration: () => videoRef.current?.duration || 0,
  }))

  // Sync play/pause state
  useEffect(() => {
    if (!videoRef.current) return

    if (isPlaying) {
      videoRef.current.play().catch(console.error)
    } else {
      videoRef.current.pause()
    }
  }, [isPlaying])

  // Handle video events
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      onTimeUpdate?.(videoRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      onDurationChange?.(videoRef.current.duration)
    }
  }

  const handleEnded = () => {
    onPlayPause?.(false)
    if (videoRef.current) {
      videoRef.current.currentTime = 0
      onTimeUpdate?.(0)
    }
  }

  // Filter visible overlays based on current time
  const visibleOverlays = overlays.filter(
    (overlay) => currentTime >= overlay.timing.start && currentTime <= overlay.timing.end
  )

  if (!videoUrl) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '12px',
          padding: '40px',
          background: theme.bgSecondary,
          borderRadius: '12px',
          color: theme.textSecondary,
          ...style,
        }}
      >
        {StudioIcons.video(theme.textSecondary, 48)}
        <span style={{ fontSize: '14px' }}>Generate a video to preview</span>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        borderRadius: '12px',
        overflow: 'hidden',
        background: '#000',
        ...style,
      }}
    >
      {/* Video element */}
      <video
        ref={videoRef}
        src={videoUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          display: 'block',
        }}
        playsInline
      />

      {/* Overlay layer */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
        }}
      >
        {visibleOverlays.map((overlay) => (
          <VideoOverlayElement
            key={overlay.id}
            overlay={overlay}
            isSelected={selectedOverlayId === overlay.id}
            onClick={() => onOverlaySelect?.(overlay.id)}
            currentTime={currentTime}
          />
        ))}
      </div>

      {/* Play/Pause overlay button */}
      <button
        onClick={() => onPlayPause?.(!isPlaying)}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'rgba(0,0,0,0.6)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: isPlaying ? 0 : 0.9,
          transition: 'opacity 0.2s ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = isPlaying ? 0 : 0.9)}
      >
        {isPlaying ? StudioIcons.pause('#fff', 28) : StudioIcons.play('#fff', 28)}
      </button>

      {/* Progress bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '8px 12px',
          background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {/* Time display */}
          <span style={{ fontSize: '11px', color: '#fff', minWidth: '40px' }}>
            {formatTime(currentTime)}
          </span>

          {/* Progress slider */}
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={(e) => {
              const time = parseFloat(e.target.value)
              if (videoRef.current) {
                videoRef.current.currentTime = time
              }
              onTimeUpdate?.(time)
            }}
            style={{
              flex: 1,
              height: '4px',
              WebkitAppearance: 'none',
              appearance: 'none',
              background: `linear-gradient(to right, ${theme.accent} ${(currentTime / (duration || 1)) * 100}%, rgba(255,255,255,0.3) ${(currentTime / (duration || 1)) * 100}%)`,
              borderRadius: '2px',
              cursor: 'pointer',
            }}
          />

          {/* Duration display */}
          <span style={{ fontSize: '11px', color: '#fff', minWidth: '40px' }}>
            {formatTime(duration)}
          </span>
        </div>
      </div>
    </div>
  )
})

// Format seconds to mm:ss
function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export default VideoPlayer
