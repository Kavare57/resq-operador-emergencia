import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios'
import { ApiResponse } from '../types'
import { logger } from './logger'

// Usar variable de entorno o fallback a localhost
const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000'

logger.info('ApiClient', 'Inicializando ApiClient', { baseUrl: API_BASE_URL })

// Función para decodificar JWT
function decodeToken(token: string): any {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      throw new Error('Token inválido')
    }
    
    const decoded = JSON.parse(atob(parts[1]))
    return decoded
  } catch (err) {
    logger.error('ApiClient', 'Error decodificando token', err)
    return null
  }
}

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
          logger.debug('ApiClient', `Agregando token a header: ${config.method?.toUpperCase()} ${config.url}`)
        } else {
          logger.warn('ApiClient', `No hay token para: ${config.method?.toUpperCase()} ${config.url}`)
        }
        
        // Log del payload para debugging
        if (config.data) {
          logger.debug('ApiClient', `Payload enviado en ${config.method?.toUpperCase()} ${config.url}:`, {
            data: config.data,
            dataType: typeof config.data,
            dataKeys: typeof config.data === 'object' ? Object.keys(config.data) : 'no-es-objeto'
          })
        }
        
        return config
      },
      (error) => {
        logger.error('ApiClient', 'Error en interceptor de request', error)
        return Promise.reject(error)
      }
    )

    // Response interceptor to handle errors
    this.axiosInstance.interceptors.response.use(
      (response) => {
        logger.debug('ApiClient', `Respuesta exitosa: ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`, {
          status: response.status,
          dataKeys: response.data ? Object.keys(response.data).slice(0, 5) : 'sin-data',
        })
        return response
      },
      (error: AxiosError) => {
        const url = error.response?.config?.url || 'URL desconocida'
        const status = error.response?.status || 'sin-status'
        const errorDetail = (error.response?.data as any)?.detail || (error.response?.data as any)?.message || 'Sin detalle'
        
        logger.error('ApiClient', `Error HTTP: ${status} ${error.response?.config?.method?.toUpperCase()} ${url}`, error, {
          status,
          url,
          method: error.response?.config?.method,
          errorData: error.response?.data,
          errorDetail: errorDetail,
        })
        
        if (error.response?.status === 401) {
          logger.warn('ApiClient', 'Token expirado o inválido - redirigiendo a login')
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
      logger.debug('ApiClient', `GET request iniciado: ${url}`)
      const response: AxiosResponse = await this.axiosInstance.get(url)
      
      logger.debug('ApiClient', `GET response recibida: ${url}`, {
        status: response.status,
        hasSuccess: 'success' in response.data,
        isArray: Array.isArray(response.data),
      })
      
      // Si la respuesta es directamente un array o un objeto sin 'success'
      if (Array.isArray(response.data) || (!('success' in response.data) && response.status === 200)) {
        logger.success('ApiClient', `GET exitoso (respuesta directa): ${url}`, {
          itemCount: Array.isArray(response.data) ? response.data.length : 'objeto',
        })
        return {
          success: true,
          data: response.data as T,
        }
      }
      
      // Si la respuesta ya es un ApiResponse
      if ('success' in response.data) {
        logger.success('ApiClient', `GET exitoso (ApiResponse): ${url}`, {
          success: response.data.success,
          hasData: !!response.data.data,
        })
        return response.data as ApiResponse<T>
      }
      
      // Fallback
      logger.info('ApiClient', `GET fallback: ${url}`)
      return {
        success: true,
        data: response.data as T,
      }
    } catch (error) {
      logger.error('ApiClient', `GET falló: ${url}`, error)
      return this.handleError(error)
    }
  }

  async post<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
    try {
      logger.debug('ApiClient', `POST request iniciado: ${url}`, { dataKeys: data ? Object.keys(data as any).slice(0, 5) : 'sin-data' })
      const response = await this.axiosInstance.post(url, data)
      
      logger.debug('ApiClient', `POST response recibida: ${url}`, { status: response.status })
      
      // Log detallado de la respuesta para debugging
      if (url === '/valorar-emergencia') {
        console.log('🚑 [APICLIENT] ========== RESPUESTA COMPLETA DE /valorar-emergencia ==========')
        console.log('🚑 [APICLIENT] response.status:', response.status)
        console.log('🚑 [APICLIENT] response.data:', response.data)
        console.log('🚑 [APICLIENT] response.data type:', typeof response.data)
        console.log('🚑 [APICLIENT] response.data keys:', response.data ? Object.keys(response.data) : 'no data')
        console.log('🚑 [APICLIENT] response.data.emergencia:', (response.data as any)?.emergencia)
        console.log('🚑 [APICLIENT] response.data.id_ambulancia_cercana:', (response.data as any)?.id_ambulancia_cercana)
        console.log('🚑 [APICLIENT] JSON.stringify(response.data):', JSON.stringify(response.data, null, 2))
      }
      
      // El backend retorna directamente los datos sin envolver en ApiResponse
      // Entonces lo envolvemos aquí
      if (response.status === 200 || response.status === 201) {
        logger.success('ApiClient', `POST exitoso: ${url}`, { status: response.status })
        return {
          success: true,
          data: response.data as T,
        }
      }
      
      logger.warn('ApiClient', `POST respuesta inesperada: ${url}`, { status: response.status })
      return {
        success: false,
        error: 'Error desconocido',
        message: 'Respuesta inesperada del servidor',
      }
    } catch (error) {
      logger.error('ApiClient', `POST falló: ${url}`, error)
      return this.handleError(error)
    }
  }

  async put<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
    try {
      logger.debug('ApiClient', `PUT request iniciado: ${url}`, { dataKeys: data ? Object.keys(data as any).slice(0, 5) : 'sin-data' })
      const response = await this.axiosInstance.put(url, data)
      
      logger.debug('ApiClient', `PUT response recibida: ${url}`, {
        status: response.status,
        hasSuccess: 'success' in response.data,
        responseKeys: response.data ? Object.keys(response.data).slice(0, 5) : 'sin-data',
      })
      
      // Si la respuesta ya es un ApiResponse
      if ('success' in response.data) {
        logger.success('ApiClient', `PUT exitoso (ApiResponse): ${url}`, { success: response.data.success })
        return response.data as ApiResponse<T>
      }
      
      // Si la respuesta es directamente los datos sin envolver
      if (response.status === 200) {
        logger.success('ApiClient', `PUT exitoso (respuesta directa): ${url}`)
        return {
          success: true,
          data: response.data as T,
        }
      }
      
      logger.warn('ApiClient', `PUT respuesta inesperada: ${url}`, { status: response.status })
      return {
        success: false,
        error: 'Error desconocido',
        message: 'Respuesta inesperada del servidor',
      }
    } catch (error) {
      logger.error('ApiClient', `PUT falló: ${url}`, error)
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
      const message = error.response?.data?.message || 'Error en la solicitud'
      const errorMsg = error.response?.data?.error || error.message
      
      logger.error('ApiClient', `Error Axios: ${message}`, error, {
        status: error.response?.status,
        url: error.response?.config?.url,
        errorMsg,
      })
      
      return {
        success: false,
        error: errorMsg,
        message,
      }
    }
    
    logger.error('ApiClient', 'Error desconocido en handleError', error as Error)
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
    return apiClient.get('/emergencias')
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

// Sala Services (LiveKit)
export const salaService = {
  obtenerSalasActivas: async () => {
    return apiClient.get('/salas/activas')
  },

  unirseASala: async (nombreSala: string) => {
    // Validar que nombreSala es un string válido
    if (!nombreSala || typeof nombreSala !== 'string' || nombreSala.trim() === '') {
      logger.error('SalaService', 'nombreSala inválido:', { nombreSala, type: typeof nombreSala })
      throw new Error('Nombre de sala inválido')
    }
    
    const nombreSalaTrim = nombreSala.trim()
    
    // Obtener el ID del operador del localStorage
    const userData = localStorage.getItem('user')
    const user = userData ? JSON.parse(userData) : null
    
    // Por defecto usar 1 como ID (operador por defecto en la base de datos)
    let idOperador = 1
    
    // Si existe user.id y es un número válido, intentar usarlo
    if (user?.id) {
      if (typeof user.id === 'number' && user.id > 0) {
        idOperador = user.id
      } else if (typeof user.id === 'string') {
        const parsed = parseInt(user.id, 10)
        if (!isNaN(parsed) && parsed > 0) {
          idOperador = parsed
        }
      }
    }
    
    logger.debug('SalaService', 'Uniendo a sala con ID de operador:', { idOperador, nombreSala: nombreSalaTrim })
    
    const payload = {
      id_operador: idOperador,
      room: nombreSalaTrim,
    }
    
    logger.debug('SalaService', 'Payload a enviar a PUT /salas:', {
      payload,
      payloadKeys: Object.keys(payload),
      idOperadorType: typeof idOperador,
      idOperadorValue: idOperador,
      idOperadorIsInteger: Number.isInteger(idOperador),
      roomType: typeof nombreSalaTrim,
      roomValue: nombreSalaTrim,
      roomLength: nombreSalaTrim.length,
    })
    
    try {
      const result = await apiClient.put('/salas', payload)
      logger.debug('SalaService', 'Respuesta exitosa de unirse a sala:', result.data)
      return result
    } catch (error) {
      logger.error('SalaService', 'Error al unirse a sala:', {
        error,
        payload,
        errorData: (error as any)?.response?.data,
        errorStatus: (error as any)?.response?.status,
      })
      throw error
    }
  },
}

// Valoración de Emergencias
export const valoracionService = {
  valorarEmergencia: async (data: {
    solicitud_id: number
    tipoAmbulancia: 'BASICA' | 'MEDICALIZADA'
    nivelPrioridad: 'BAJA' | 'MEDIA' | 'ALTA'
    descripcion: string
    id_operador: number
    solicitante_id: number
  }) => {
    return apiClient.post('/valorar-emergencia', data)
  },
}

// Servicios de Ambulancias
export const ambulanciaService = {
  obtenerAmbulancia: async (tipoAmbulancia?: 'BASICA' | 'MEDICALIZADA') => {
    // Llamar sin parámetros y filtrar en frontend
    return apiClient.get(`/ambulancias`)
  },

  despacharAmbulancia: async (data: {
    emergencia_id: number
    ambulancia_id: number
    operador_ambulancia_id: number
    operador_emergencia_id: number
  }) => {
    logger.debug('AmbulanciaService', 'Despachando ambulancia con datos:', {
      data,
      dataKeys: Object.keys(data),
      emergencia_idType: typeof data.emergencia_id,
      ambulancia_idType: typeof data.ambulancia_id,
      operador_ambulancia_idType: typeof data.operador_ambulancia_id,
      operador_emergencia_idType: typeof data.operador_emergencia_id,
    })
    
    return apiClient.post('/despachar-ambulancia', data)
  },
}
