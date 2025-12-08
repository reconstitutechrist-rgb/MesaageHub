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
      } catch (_e) {
        localStorage.removeItem(STORAGE_KEYS.USER)
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (_credentials) => {
    // TODO: Implement login logic with Base44 SDK
    // const response = await base44Client.auth.login(credentials)
    // setUser(response.user)
    // setIsAuthenticated(true)
    // localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user))
    return { success: true }
  }

  const logout = async () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem(STORAGE_KEYS.USER)
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
  }

  const register = async (_userData) => {
    // TODO: Implement registration logic
    // const response = await base44Client.auth.register(userData)
    return { success: true }
  }

  const updateProfile = (profileData) => {
    const updatedUser = { ...user, ...profileData }
    setUser(updatedUser)
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser))
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

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
