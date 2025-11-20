import { apiClient } from './api'
import { Ambulancia, User, PaginatedResponse } from '../types'

export const operadorService = {
  // Obtener perfil del operador actual
  obtenerPerfil: async () => {
    return apiClient.get<User>('/operadores/perfil')
  },

  // Actualizar estado del operador
  actualizarEstado: async (estado: 'activo' | 'en_descanso' | 'inactivo') => {
    return apiClient.put('/operadores/estado', { estado })
  },

  // Obtener ambulancias disponibles
  obtenerAmbulancias: async () => {
    return apiClient.get<Ambulancia[]>('/ambulancias')
  },

  // Obtener ambulancias en servicio del operador
  obtenerAmbulanciasEnServicio: async () => {
    return apiClient.get<Ambulancia[]>('/ambulancias?estado=en_servicio')
  },

  // Obtener operadores
  obtenerOperadores: async (page = 1, pageSize = 10) => {
    return apiClient.get<PaginatedResponse<User>>(
      `/operadores?page=${page}&page_size=${pageSize}`
    )
  },

  // Obtener estadísticas del operador
  obtenerEstadisticas: async () => {
    return apiClient.get('/operadores/estadisticas')
  },
}
