import { useEffect, useState } from 'react'
import { CyanPhoneLayout } from './CyanPhoneLayout'
import { PurplePhoneLayout } from './PurplePhoneLayout'

// Layout theme options
// eslint-disable-next-line react-refresh/only-export-components
export const LAYOUT_THEMES = {
  CYAN: 'cyan',
  PURPLE: 'purple',
}

export function PhoneLayout() {
  const [layoutTheme, setLayoutTheme] = useState(LAYOUT_THEMES.CYAN)

  // Load layout preference from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('app-settings')
      if (saved) {
        const settings = JSON.parse(saved)
        const savedLayout = settings.appearance?.layoutTheme
        if (savedLayout && Object.values(LAYOUT_THEMES).includes(savedLayout)) {
          setLayoutTheme(savedLayout)
        }
      }
    } catch (e) {
      console.error('Failed to load layout theme setting', e)
    }
  }, [])

  // Listen for layout theme changes
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const saved = localStorage.getItem('app-settings')
        if (saved) {
          const settings = JSON.parse(saved)
          const savedLayout = settings.appearance?.layoutTheme
          if (savedLayout && Object.values(LAYOUT_THEMES).includes(savedLayout)) {
            setLayoutTheme(savedLayout)
          }
        }
      } catch (e) {
        console.error('Failed to load layout theme setting', e)
      }
    }

    // Listen for custom event dispatched when settings change
    window.addEventListener('layout-theme-changed', handleStorageChange)
    // Also listen for storage changes from other tabs
    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('layout-theme-changed', handleStorageChange)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  // Render the appropriate layout based on theme
  switch (layoutTheme) {
    case LAYOUT_THEMES.PURPLE:
      return <PurplePhoneLayout />
    case LAYOUT_THEMES.CYAN:
    default:
      return <CyanPhoneLayout />
  }
}
