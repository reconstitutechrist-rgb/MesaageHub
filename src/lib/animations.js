/**
 * Shared Framer Motion animation variants
 *
 * Used across the app for consistent page transitions, modal animations, and overlays.
 */

// Page route transitions (fade + slight slide)
export const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
}

export const pageTransition = {
  type: 'tween',
  ease: 'easeInOut',
  duration: 0.2,
}

// Fullscreen modal slide-up (from bottom)
export const modalSlideUp = {
  initial: { y: '100%' },
  animate: { y: 0 },
  exit: { y: '100%' },
}

export const modalSlideTransition = {
  type: 'spring',
  damping: 25,
  stiffness: 300,
}

// Centered dialog (scale + fade)
export const modalFade = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
}

export const modalFadeTransition = {
  type: 'tween',
  ease: 'easeOut',
  duration: 0.15,
}

// Backdrop overlay fade
export const overlayVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

export const overlayTransition = {
  duration: 0.2,
}
