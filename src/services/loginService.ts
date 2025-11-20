import { apiClient } from './api'
import { AuthResponse, LoginCredentials } from '../types'

export const loginService = {
  // Login
  login: async (credentials: LoginCredentials) => {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials)

    // Store tokens and user data
    if (response.success && response.data) {
      localStorage.setItem('access_token', response.data.access_token)
      // Crear usuario básico desde el email
      const userData = {
        email: credentials.email || '',
        nombre: (credentials.email || '').split('@')[0],
        apellido: '',
        rol: 'operador' as const,
        estado: 'activo' as const,
      }
      localStorage.setItem('user', JSON.stringify(userData))
    }

    return response
  },

  // Logout
  logout: () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
  },

  // Get stored token
  getToken: () => {
    return localStorage.getItem('access_token')
  },

  // Get stored user
  getStoredUser: () => {
    const userJson = localStorage.getItem('user')
    return userJson ? JSON.parse(userJson) : null
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('access_token')
  },
}
