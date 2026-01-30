import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { themes } from '@/constants/phoneThemes'

/**
 * Phone UI Theme System
 *
 * 4 theme variants with CSS custom properties for the phone-style UI.
 * Separate from next-themes (dark/light mode) - this handles the accent color schemes.
 */

const THEME_STORAGE_KEY = 'app-settings'
const DEFAULT_THEME = 'cyanDark'

const PhoneThemeContext = createContext(null)

/**
 * Inject CSS custom properties for the current theme
 */
function injectThemeCSS(themeKey) {
  const theme = themes[themeKey] || themes[DEFAULT_THEME]
  const root = document.documentElement

  // Smooth transition when switching themes
  root.style.setProperty('transition', 'background-color 0.3s ease, color 0.3s ease')
  setTimeout(() => root.style.removeProperty('transition'), 350)

  root.style.setProperty('--phone-bg', theme.bg)
  root.style.setProperty('--phone-card-bg', theme.cardBg)
  root.style.setProperty('--phone-card-border', theme.cardBorder)
  root.style.setProperty('--phone-accent', theme.accent)
  root.style.setProperty('--phone-accent-glow', theme.accentGlow)
  root.style.setProperty('--phone-gradient-start', theme.gradientStart)
  root.style.setProperty('--phone-gradient-end', theme.gradientEnd)
  root.style.setProperty('--phone-text', theme.text)
  root.style.setProperty('--phone-text-muted', theme.textMuted)
  root.style.setProperty('--phone-search-bg', theme.searchBg)
  root.style.setProperty('--phone-nav-bg', theme.navBg)
  root.style.setProperty('--phone-is-dark', theme.isDark ? '1' : '0')
}

/**
 * Read the current theme from localStorage
 */
function getStoredTheme() {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY)
    if (saved) {
      const settings = JSON.parse(saved)
      const themeKey = settings.appearance?.colorTheme
      if (themeKey && themes[themeKey]) {
        return themeKey
      }
    }
  } catch (e) {
    console.error('Failed to read phone theme from storage:', e)
  }
  return DEFAULT_THEME
}

/**
 * Save the theme to localStorage
 */
function saveThemeToStorage(themeKey) {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY)
    const settings = saved ? JSON.parse(saved) : {}
    settings.appearance = settings.appearance || {}
    settings.appearance.colorTheme = themeKey
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(settings))
  } catch (e) {
    console.error('Failed to save phone theme to storage:', e)
  }
}

export function PhoneThemeProvider({ children }) {
  const [themeKey, setThemeKey] = useState(() => getStoredTheme())

  // Apply CSS variables on mount and theme change
  useEffect(() => {
    injectThemeCSS(themeKey)
  }, [themeKey])

  // Listen for cross-tab theme changes
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === THEME_STORAGE_KEY) {
        const newTheme = getStoredTheme()
        setThemeKey(newTheme)
      }
    }

    // Listen for custom event from other components that change theme
    const handleThemeChanged = (e) => {
      if (e.detail?.theme && themes[e.detail.theme]) {
        setThemeKey(e.detail.theme)
      }
    }

    window.addEventListener('storage', handleStorage)
    window.addEventListener('layout-theme-changed', handleThemeChanged)

    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('layout-theme-changed', handleThemeChanged)
    }
  }, [])

  // Change theme and persist
  const setTheme = useCallback((newThemeKey) => {
    if (themes[newThemeKey]) {
      setThemeKey(newThemeKey)
      saveThemeToStorage(newThemeKey)
      // Dispatch event for other components
      window.dispatchEvent(
        new CustomEvent('layout-theme-changed', {
          detail: { theme: newThemeKey },
        })
      )
    }
  }, [])

  // Get current theme object
  const theme = useMemo(() => themes[themeKey] || themes[DEFAULT_THEME], [themeKey])

  // Context value
  const value = useMemo(
    () => ({
      themeKey,
      theme,
      setTheme,
      themes,
      isDark: theme.isDark,
    }),
    [themeKey, theme, setTheme]
  )

  return <PhoneThemeContext.Provider value={value}>{children}</PhoneThemeContext.Provider>
}

/**
 * Hook to access phone theme
 *
 * @returns {{
 *   themeKey: string,
 *   theme: object,
 *   setTheme: (key: string) => void,
 *   themes: object,
 *   isDark: boolean
 * }}
 */
// eslint-disable-next-line react-refresh/only-export-components
export function usePhoneTheme() {
  const context = useContext(PhoneThemeContext)
  if (!context) {
    // Return fallback during initialization to prevent crash on first render
    return {
      themeKey: 'cyanDark',
      theme: themes['cyanDark'],
      setTheme: () => {},
      themes,
      isDark: true,
    }
  }
  return context
}
