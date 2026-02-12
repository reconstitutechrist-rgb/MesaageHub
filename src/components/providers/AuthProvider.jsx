import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { STORAGE_KEYS } from '@/lib/constants'
import { loginRateLimiter } from '@/lib/rateLimiter'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Transform Supabase user to app user format
  const transformUser = useCallback((supabaseUser) => {
    if (!supabaseUser) return null
    return {
      id: supabaseUser.id,
      email: supabaseUser.email,
      name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0],
      avatar: supabaseUser.user_metadata?.avatar_url || null,
      created_at: supabaseUser.created_at,
    }
  }, [])

  // Initialize auth state
  useEffect(() => {
    let subscription = null

    const initAuth = async () => {
      // Get existing session from Supabase
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user) {
        const appUser = transformUser(session.user)
        setUser(appUser)
        setIsAuthenticated(true)
      }

      // Listen for auth state changes
      const {
        data: { subscription: authSubscription },
      } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          const appUser = transformUser(session.user)
          setUser(appUser)
          setIsAuthenticated(true)
        } else {
          setUser(null)
          setIsAuthenticated(false)
        }
      })

      subscription = authSubscription

      setIsLoading(false)
    }

    initAuth()

    // Cleanup subscription on unmount
    return () => {
      subscription?.unsubscribe()
    }
  }, [transformUser])

  // Login function with rate limiting
  const login = async (credentials) => {
    // Check rate limit before attempting login
    const rateLimitKey = `login:${credentials.email}`
    if (!loginRateLimiter.isAllowed(rateLimitKey)) {
      const waitTime = Math.ceil(loginRateLimiter.getTimeUntilReset(rateLimitKey) / 1000)
      return {
        success: false,
        error: `Too many login attempts. Please try again in ${waitTime} seconds.`,
      }
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      // Reset rate limit on successful login
      loginRateLimiter.reset(rateLimitKey)
      const appUser = transformUser(data.user)
      setUser(appUser)
      setIsAuthenticated(true)
      return { success: true }
    } catch {
      return { success: false, error: 'Login failed' }
    }
  }

  // Register function
  const register = async (userData) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
          },
        },
      })

      if (error) {
        return { success: false, error: error.message }
      }

      // Check if email confirmation is required
      if (data.user && !data.session) {
        return {
          success: true,
          message: 'Please check your email to confirm your account',
        }
      }

      const appUser = transformUser(data.user)
      setUser(appUser)
      setIsAuthenticated(true)
      return { success: true }
    } catch {
      return { success: false, error: 'Registration failed' }
    }
  }

  // Logout function
  const logout = async () => {
    await supabase.auth.signOut()

    // Clear local state and storage
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem(STORAGE_KEYS.USER)
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
    sessionStorage.removeItem(STORAGE_KEYS.USER)
  }

  // Update profile function
  const updateProfile = async (profileData) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: profileData,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      const appUser = transformUser(data.user)
      setUser(appUser)
      return { success: true }
    } catch {
      return { success: false, error: 'Profile update failed' }
    }
  }

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    register,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
