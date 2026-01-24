import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { STORAGE_KEYS } from '@/lib/constants'

const AuthContext = createContext(null)

// Demo mode user for development without Supabase
const DEMO_USER = {
  id: 'demo-user-id',
  email: 'demo@messagehub.app',
  name: 'Demo User',
  avatar: null,
  created_at: new Date().toISOString(),
}

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
      if (isSupabaseConfigured && supabase) {
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
      } else {
        // Demo mode: check localStorage
        const storedUser = localStorage.getItem(STORAGE_KEYS.USER)
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser)
            setUser(parsedUser)
            setIsAuthenticated(true)
          } catch {
            localStorage.removeItem(STORAGE_KEYS.USER)
          }
        }
      }

      setIsLoading(false)
    }

    initAuth()

    // Cleanup subscription on unmount
    return () => {
      subscription?.unsubscribe()
    }
  }, [transformUser])

  // Login function
  const login = async (credentials) => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        })

        if (error) {
          return { success: false, error: error.message }
        }

        const appUser = transformUser(data.user)
        setUser(appUser)
        setIsAuthenticated(true)
        return { success: true }
      } catch {
        return { success: false, error: 'Login failed' }
      }
    } else {
      // Demo mode: accept any credentials
      const demoUser = {
        ...DEMO_USER,
        email: credentials.email,
        name: credentials.email.split('@')[0],
      }
      setUser(demoUser)
      setIsAuthenticated(true)
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(demoUser))
      return { success: true }
    }
  }

  // Register function
  const register = async (userData) => {
    if (isSupabaseConfigured && supabase) {
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
    } else {
      // Demo mode: simulate registration
      const demoUser = {
        ...DEMO_USER,
        name: userData.name,
        email: userData.email,
      }
      setUser(demoUser)
      setIsAuthenticated(true)
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(demoUser))
      return { success: true }
    }
  }

  // Logout function
  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut()
    }

    // Clear local state
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem(STORAGE_KEYS.USER)
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
  }

  // Update profile function
  const updateProfile = async (profileData) => {
    if (isSupabaseConfigured && supabase) {
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
    } else {
      // Demo mode: update local storage
      const updatedUser = { ...user, ...profileData }
      setUser(updatedUser)
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser))
      return { success: true }
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
    isSupabaseConfigured, // Expose for UI to show demo mode indicator
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
