import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios'
import { ApiResponse } from '../types'

// Usar variable de entorno o fallback a localhost
const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000'

console.log('API Base URL:', API_BASE_URL) // Para debug

class ApiClient {
  private axiosInstance: AxiosInstance

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor to add token
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor to handle errors
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expired or invalid - logout
          localStorage.removeItem('access_token')
          localStorage.removeItem('user')
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    )
  }

  async get<T>(url: string): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.axiosInstance.get(url)
      return response.data
    } catch (error) {
      return this.handleError(error)
    }
  }

  async post<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.post(url, data)
      // El backend retorna directamente los datos sin envolver en ApiResponse
      // Entonces lo envolvemos aquí
      if (response.status === 200) {
        return {
          success: true,
          data: response.data as T,
        }
      }
      return {
        success: false,
        error: 'Error desconocido',
        message: 'Respuesta inesperada del servidor',
      }
    } catch (error) {
      return this.handleError(error)
    }
  }

  async put<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.axiosInstance.put(url, data)
      return response.data
    } catch (error) {
      return this.handleError(error)
    }
  }

  async patch<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.axiosInstance.patch(url, data)
      return response.data
    } catch (error) {
      return this.handleError(error)
    }
  }

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.axiosInstance.delete(url)
      return response.data
    } catch (error) {
      return this.handleError(error)
    }
  }

  private handleError(error: unknown): ApiResponse<never> {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        message: error.response?.data?.message || 'Error en la solicitud',
      }
    }
    return {
      success: false,
      error: 'Error desconocido',
      message: 'Ocurrió un error inesperado',
    }
  }
}

export const apiClient = new ApiClient()

// Emergency Services
export const emergenciaService = {
  obtenerEmergencias: async () => {
    return apiClient.get('/solicitudes')
  },

  asignarEmergencia: async (id: string, operador_id: string) => {
    return apiClient.put(`/emergencias/${id}/asignar`, {
      operador_id,
    })
  },

  actualizarEstado: async (id: string, estado: string) => {
    return apiClient.put(`/emergencias/${id}/estado`, {
      estado,
    })
  },
}

export const authService = {
  login: async (email: string, password: string) => {
    return apiClient.post('/auth/login', {
      identificador: email,
      contrasena: password,
    })
  },

  logout: () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
  },

  getToken: () => localStorage.getItem('access_token'),
}
