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
  type: 'nueva_solicitud' | 'emergencia_actualizada' | 'info_ambulancias' | string
}

export interface AmbulanciaUbicacion {
  id: number
  latitud: number
  longitud: number
}

export interface InfoAmbulanciasMessage extends WebSocketMessage {
  type: 'info_ambulancias'
  emergencia_id: number
  ambulancias: AmbulanciaUbicacion[]
  timestamp: number
}
