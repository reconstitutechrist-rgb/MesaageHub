import { useEffect, useCallback } from 'react'

export function useKeyboardShortcut(keys, callback, options = {}) {
  const { enabled = true, preventDefault = true, target = document } = options

  const handleKeyDown = useCallback(
    (event) => {
      if (!enabled) return

      const keysArray = Array.isArray(keys) ? keys : [keys]

      const matchesShortcut = keysArray.some((shortcut) => {
        const parts = shortcut.toLowerCase().split('+')
        const key = parts[parts.length - 1]
        const modifiers = parts.slice(0, -1)

        const keyMatches = event.key.toLowerCase() === key || event.code.toLowerCase() === key

        const modifiersMatch =
          modifiers.every((mod) => {
            switch (mod) {
              case 'ctrl':
              case 'control':
                return event.ctrlKey
              case 'shift':
                return event.shiftKey
              case 'alt':
                return event.altKey
              case 'meta':
              case 'cmd':
              case 'command':
                return event.metaKey
              default:
                return false
            }
          }) &&
          (modifiers.length === 0 ||
          (modifiers.includes('ctrl') || modifiers.includes('control')
            ? event.ctrlKey
            : !event.ctrlKey) ||
          modifiers.includes('shift')
            ? event.shiftKey
            : !event.shiftKey)

        return keyMatches && modifiersMatch
      })

      if (matchesShortcut) {
        if (preventDefault) {
          event.preventDefault()
        }
        callback(event)
      }
    },
    [keys, callback, enabled, preventDefault]
  )

  useEffect(() => {
    const targetElement = target === document ? document : target.current

    if (!targetElement) return

    targetElement.addEventListener('keydown', handleKeyDown)

    return () => {
      targetElement.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown, target])
}

// Common shortcuts helper
export const SHORTCUTS = {
  SEARCH: ['ctrl+k', 'meta+k'],
  ESCAPE: ['escape'],
  ENTER: ['enter'],
  NEW_MESSAGE: ['ctrl+n', 'meta+n'],
  CLOSE: ['escape'],
}
