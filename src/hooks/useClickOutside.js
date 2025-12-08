import { useEffect, useRef } from 'react'

export function useClickOutside(handler, enabled = true) {
  const ref = useRef(null)

  useEffect(() => {
    if (!enabled) return

    const listener = (event) => {
      const el = ref.current
      if (!el || el.contains(event.target)) {
        return
      }
      handler(event)
    }

    document.addEventListener('mousedown', listener)
    document.addEventListener('touchstart', listener)

    return () => {
      document.removeEventListener('mousedown', listener)
      document.removeEventListener('touchstart', listener)
    }
  }, [handler, enabled])

  return ref
}
