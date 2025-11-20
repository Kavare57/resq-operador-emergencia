import { apiClient } from './api'
import { Emergencia, PaginatedResponse } from '../types'

export const emergenciaService = {
  // Obtener todas las emergencias
  obtenerEmergencias: async (page = 1, pageSize = 10) => {
    return apiClient.get<PaginatedResponse<Emergencia>>(
      `/emergencias?page=${page}&page_size=${pageSize}`
    )
  },

  // Obtener emergencia por ID
  obtenerEmergencia: async (id: string) => {
    return apiClient.get<Emergencia>(`/emergencias/${id}`)
  },

  // Obtener emergencias pendientes
  obtenerEmergenciasPendientes: async () => {
    return apiClient.get<Emergencia[]>('/emergencias?estado=pendiente')
  },

  // Obtener emergencias en progreso
  obtenerEmergenciasEnProgreso: async () => {
    return apiClient.get<Emergencia[]>('/emergencias?estado=en_progreso')
  },

  // Asignar emergencia a operador
  asignarEmergencia: async (emergenciaId: string, operadorId: string) => {
    return apiClient.put(`/emergencias/${emergenciaId}/asignar`, {
      operador_id: operadorId,
    })
  },

  // Actualizar estado de emergencia
  actualizarEstado: async (id: string, estado: string) => {
    return apiClient.put(`/emergencias/${id}/estado`, {
      estado,
    })
  },

  // Crear nueva emergencia
  crearEmergencia: async (data: Partial<Emergencia>) => {
    return apiClient.post<Emergencia>('/emergencias', data)
  },

  // Asignar ambulancia
  asignarAmbulancia: async (emergenciaId: string, ambulanciaId: string) => {
    return apiClient.put(`/emergencias/${emergenciaId}/asignar-ambulancia`, {
      ambulancia_id: ambulanciaId,
    })
  },
}
