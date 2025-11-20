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
  type: 'nueva_solicitud' | 'emergencia_actualizada' | string
}
