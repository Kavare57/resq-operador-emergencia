/**
 * Tipos compartidos para WebSocket
 */

import { Emergencia } from './index'

export interface WebSocketMessage<T = unknown> {
  type: string
  message?: string
  data?: T
  [key: string]: unknown
}

export interface WebSocketEmergenciaMessage extends WebSocketMessage<Emergencia> {
  type: 'nueva_solicitud' | 'emergencia_actualizada' | 'info_ambulancias' | 'ubicacion_ambulancia' | string
}

export interface AmbulanciaUbicacion {
  id: number
  latitud: number
  longitud: number
}

export interface UbicacionAmbulanciaMessage extends WebSocketMessage {
  tipo: 'ubicacion_ambulancia'
  latitud: number
  longitud: number
  id_ambulancia?: number
}

export interface InfoAmbulanciasMessage extends WebSocketMessage {
  type: 'info_ambulancias'
  emergencia_id: number
  ambulancias: AmbulanciaUbicacion[]
  timestamp: number
}
