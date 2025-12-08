import { createContext, useContext, useState, useEffect } from 'react'
import { STORAGE_KEYS } from '@/lib/constants'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check for existing session on mount
    const storedUser = localStorage.getItem(STORAGE_KEYS.USER)
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
        setIsAuthenticated(true)
      } catch (e) {
        localStorage.removeItem(STORAGE_KEYS.USER)
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (credentials) => {
    // Implement login logic with Base44 SDK
    try {
      // const response = await base44Client.auth.login(credentials)
      // setUser(response.user)
      // setIsAuthenticated(true)
      // localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user))
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const logout = async () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem(STORAGE_KEYS.USER)
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
  }

  const register = async (userData) => {
    // Implement registration logic
    try {
      // const response = await base44Client.auth.register(userData)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    register,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
