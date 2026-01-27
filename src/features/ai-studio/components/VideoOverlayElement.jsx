/**
 * VideoOverlayElement - Animated overlay element using framer-motion
 * Renders text or image at position with timing-based visibility and animations
 */

import { motion, AnimatePresence } from 'framer-motion'

// Animation variants for different overlay animations
const animationVariants = {
  none: {
    initial: { opacity: 1 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  'fade-in': {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } },
    exit: { opacity: 0, transition: { duration: 0.3 } },
  },
  'slide-up': {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
  },
  scale: {
    initial: { opacity: 0, scale: 0.5 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } },
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.3 } },
  },
}

export function VideoOverlayElement({ overlay, isSelected, onClick, currentTime }) {
  const { type, content, position, timing, animation = 'fade-in', style = {} } = overlay

  // Check if overlay should be visible
  const isVisible = currentTime >= timing.start && currentTime <= timing.end

  // Get animation variant
  const variant = animationVariants[animation] || animationVariants['fade-in']

  // Build text styles
  const textStyles = {
    color: style.color || '#ffffff',
    fontSize: `${style.fontSize || 48}px`,
    fontWeight: style.fontWeight || 'bold',
    textShadow: style.shadow ? '2px 2px 8px rgba(0,0,0,0.5), 0 0 20px rgba(0,0,0,0.3)' : 'none',
    textAlign: 'center',
    maxWidth: '80%',
    wordWrap: 'break-word',
    lineHeight: 1.2,
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key={overlay.id}
          initial={variant.initial}
          animate={variant.animate}
          exit={variant.exit}
          onClick={(e) => {
            e.stopPropagation()
            onClick?.()
          }}
          style={{
            position: 'absolute',
            left: `${position.x}%`,
            top: `${position.y}%`,
            transform: 'translate(-50%, -50%)',
            cursor: onClick ? 'pointer' : 'default',
            pointerEvents: onClick ? 'auto' : 'none',
            zIndex: isSelected ? 10 : 1,
          }}
        >
          {/* Selection indicator */}
          {isSelected && (
            <div
              style={{
                position: 'absolute',
                inset: '-8px',
                border: '2px dashed #3b82f6',
                borderRadius: '4px',
                pointerEvents: 'none',
              }}
            />
          )}

          {/* Content based on type */}
          {type === 'text' && <div style={textStyles}>{content}</div>}

          {type === 'image' && (
            <img
              src={content}
              alt="Overlay"
              style={{
                maxWidth: style.maxWidth || '200px',
                maxHeight: style.maxHeight || '200px',
                objectFit: 'contain',
                filter: style.shadow ? 'drop-shadow(2px 2px 8px rgba(0,0,0,0.5))' : 'none',
              }}
            />
          )}

          {type === 'logo' && (
            <img
              src={content}
              alt="Logo"
              style={{
                maxWidth: style.maxWidth || '150px',
                maxHeight: style.maxHeight || '80px',
                objectFit: 'contain',
                filter: style.shadow ? 'drop-shadow(2px 2px 8px rgba(0,0,0,0.5))' : 'none',
              }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default VideoOverlayElement
