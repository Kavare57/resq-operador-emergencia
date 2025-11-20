import { useWebSocket } from './useWebSocket'
import { useEmergencias } from '../context/EmergenciaContext'
import { WebSocketMessage } from '../types/websocket'
import { Emergencia } from '../types'
import { useCallback } from 'react'

/**
 * Hook que conecta WebSocket con el contexto de Emergencias
 * Aplica el patrón del cliente Node.js
 */
export function useWebSocketEmergencias() {
  const { addEmergencia, updateEmergencia } = useEmergencias()

  const handleWebSocketMessage = useCallback((message: WebSocketMessage) => {
    console.log('📨 Mensaje WebSocket recibido:', message)

    switch (message.type) {
      case 'nueva_solicitud':
        if (message.data) {
          console.log('🚨 Nueva emergencia recibida:', message.data)
          addEmergencia(message.data as Emergencia)
        }
        break

      case 'emergencia_actualizada':
        if (message.data) {
          console.log('✏️ Emergencia actualizada:', message.data)
          const emergencia = message.data as Emergencia
          if (emergencia.id) {
            updateEmergencia(String(emergencia.id), emergencia)
          }
        }
        break

      default:
        console.log('ℹ️ Mensaje desconocido:', message.type)
    }
  }, [addEmergencia, updateEmergencia])

  const { isConnected, error, send, disconnect, reconnect } = useWebSocket({
    onMessage: handleWebSocketMessage,
    onConnect: () => console.log('✅ Conectado a WebSocket de emergencias'),
    onDisconnect: () => console.log('🔌 Desconectado de WebSocket'),
    onError: (err) => console.error('❌ Error WebSocket:', err),
  })

  return {
    isConnected,
    error,
    send,
    disconnect,
    reconnect,
  }
}
