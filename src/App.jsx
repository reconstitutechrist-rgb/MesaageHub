import { useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient } from '@/lib/queryClient'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { ToastProvider } from '@/components/providers/ToastProvider'
import { CallProvider } from '@/components/providers/CallProvider'
import { PhoneThemeProvider } from '@/context/PhoneThemeContext'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { AppRoutes } from '@/config/routes'
import { syncService } from '@/services/SyncService'
import { automationService } from '@/services/AutomationService'

function ThemeManager({ children }) {
  useEffect(() => {
    // Initialize sync service (for mobile/Capacitor only)
    syncService.initialize().catch(() => {
      // SyncService requires Capacitor - ignore in web mode
    })

    // Start birthday automation (queue + send scheduled messages)
    const cleanupAutomation = automationService.runStartupAutomation()

    return () => {
      syncService.destroy()
      cleanupAutomation()
    }
  }, [])

  useEffect(() => {
    try {
      // Load saved settings
      const saved = localStorage.getItem('app-settings')
      if (saved) {
        const settings = JSON.parse(saved)
        const colorTheme = settings.appearance?.colorTheme || 'default'
        const fontSize = settings.appearance?.fontSize || 'medium'
        const compactMode = settings.appearance?.compactMode || false

        // Remove all theme classes
        document.body.classList.remove(
          'theme-blue',
          'theme-green',
          'theme-purple',
          'theme-orange',
          'theme-pink',
          'theme-cyan',
          'theme-red'
        )

        // Add current theme class
        if (colorTheme !== 'default') {
          document.body.classList.add(`theme-${colorTheme}`)
        }

        // Apply font size
        document.body.classList.remove('font-size-small', 'font-size-medium', 'font-size-large')
        document.body.classList.add(`font-size-${fontSize}`)

        // Apply compact mode
        if (compactMode) {
          document.body.classList.add('compact-mode')
        } else {
          document.body.classList.remove('compact-mode')
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
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ThemeManager>
            <ThemeProvider defaultTheme="system" storageKey="messagehub-theme">
              <PhoneThemeProvider>
                <AuthProvider>
                  <ToastProvider>
                    <CallProvider>
                      <AppRoutes />
                    </CallProvider>
                  </ToastProvider>
                </AuthProvider>
              </PhoneThemeProvider>
            </ThemeProvider>
          </ThemeManager>
        </BrowserRouter>
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App
