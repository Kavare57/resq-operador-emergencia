import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User } from '../types'
import jwtDecode from 'jwt-decode'

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('access_token')
    const storedUser = localStorage.getItem('user')

    if (storedToken && storedUser) {
      try {
        // Verify token is not expired
        const decoded = jwtDecode<{ exp?: number }>(storedToken)
        const isExpired = decoded.exp ? decoded.exp * 1000 < Date.now() : true

        if (!isExpired) {
          setToken(storedToken)
          setUser(JSON.parse(storedUser))
        } else {
          localStorage.removeItem('access_token')
          localStorage.removeItem('user')
        }
      } catch (error) {
        console.error('Failed to parse stored token:', error)
        localStorage.removeItem('access_token')
        localStorage.removeItem('user')
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (_email: string, _password: string) => {
    // This will be called with the API client
    // For now, it's a placeholder
    setIsLoading(true)
    try {
      // API call will be made through the apiClient
      // Response will be set through setAuthResponse
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
  }

  // Note: setAuthResponse would be used by API interceptors to sync auth state
  // Currently kept for future reference

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!token && !!user,
    login,
    logout,
    setUser,
    setToken: (newToken: string | null) => {
      setToken(newToken)
      if (newToken) {
        localStorage.setItem('access_token', newToken)
      } else {
        localStorage.removeItem('access_token')
      }
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export { AuthContext, type AuthContextType, type AuthContextType as setAuthResponse }
