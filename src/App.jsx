import { useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { ToastProvider } from '@/components/providers/ToastProvider'
import { CallProvider } from '@/components/providers/CallProvider'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { AppRoutes } from '@/config/routes'

function ThemeManager({ children }) {
  useEffect(() => {
    try {
      // Load saved settings
      const saved = localStorage.getItem('app-settings')
      if (saved) {
        const settings = JSON.parse(saved)
        const colorTheme = settings.appearance?.colorTheme || 'default'

        // Remove all theme classes
        document.body.classList.remove('theme-blue', 'theme-green', 'theme-purple', 'theme-orange')

        // Add current theme class
        if (colorTheme !== 'default') {
          document.body.classList.add(`theme-${colorTheme}`)
        }
      }
    } catch (e) {
      console.error('Failed to load theme settings', e)
    }
  }, [])

  return children
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeManager>
          <ThemeProvider defaultTheme="system" storageKey="messagehub-theme">
            <AuthProvider>
              <ToastProvider>
                <CallProvider>
                  <AppRoutes />
                </CallProvider>
              </ToastProvider>
            </AuthProvider>
          </ThemeProvider>
        </ThemeManager>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
