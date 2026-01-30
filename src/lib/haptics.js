/**
 * Haptic feedback utility
 *
 * Uses @capacitor/haptics when available (native mobile),
 * falls back to Web Vibration API (Android Chrome),
 * or silently no-ops on unsupported platforms (desktop, iOS Safari web).
 *
 * Usage:
 *   import { triggerHaptic } from '@/lib/haptics'
 *   triggerHaptic('light')   // layer tap
 *   triggerHaptic('medium')  // drag end
 *   triggerHaptic('success') // generation complete
 *   triggerHaptic('error')   // error occurred
 */

// Vibration duration maps for Web Vibration API fallback (ms)
const VIBRATION_PATTERNS = {
  light: [10],
  medium: [25],
  heavy: [50],
  success: [15, 50, 15],
  error: [50, 30, 50, 30, 50],
}

// Lazy-loaded Capacitor Haptics plugin
let capacitorHaptics = null
let capacitorChecked = false

async function getCapacitorHaptics() {
  if (capacitorChecked) return capacitorHaptics

  capacitorChecked = true
  try {
    // Use variable to prevent Vite/Rollup from resolving at build time
    const moduleName = '@capacitor/haptics'
    const module = await import(/* @vite-ignore */ moduleName)
    capacitorHaptics = module.Haptics
    return capacitorHaptics
  } catch {
    // @capacitor/haptics not installed or not in native context
    return null
  }
}

// Capacitor impact style mapping
const CAPACITOR_STYLES = {
  light: 'Light',
  medium: 'Medium',
  heavy: 'Heavy',
}

/**
 * Trigger haptic feedback
 * @param {'light'|'medium'|'heavy'|'success'|'error'} type
 */
export async function triggerHaptic(type = 'light') {
  try {
    const haptics = await getCapacitorHaptics()

    if (haptics) {
      if (type === 'success') {
        await haptics.notification({ type: 'SUCCESS' })
      } else if (type === 'error') {
        await haptics.notification({ type: 'ERROR' })
      } else {
        const style = CAPACITOR_STYLES[type] || 'Medium'
        await haptics.impact({ style })
      }
      return
    }

    // Web Vibration API fallback
    if (navigator?.vibrate) {
      const pattern = VIBRATION_PATTERNS[type] || VIBRATION_PATTERNS.light
      navigator.vibrate(pattern)
    }
  } catch {
    // Silently fail - haptics are non-critical
  }
}

export default triggerHaptic
