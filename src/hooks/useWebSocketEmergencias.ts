import { useWebSocket } from './useWebSocket'
import { WebSocketMessage, InfoAmbulanciasMessage, AmbulanciaUbicacion } from '../types/websocket'
import { Emergencia } from '../types'
import { useCallback, useState } from 'react'

interface UseWebSocketEmergenciasOptions {
  addEmergencia?: (emergencia: Emergencia) => void
  updateEmergencia?: (id: string, emergencia: Emergencia) => void
}

/**
 * Hook que conecta WebSocket con el contexto de Emergencias
 * Aplica el patrón del cliente Node.js
 */
export function useWebSocketEmergencias(options: UseWebSocketEmergenciasOptions = {}) {
  const { addEmergencia, updateEmergencia } = options
  const [ambulanciasUbicaciones, setAmbulanciasUbicaciones] = useState<Map<number, AmbulanciaUbicacion>>(new Map())

  // Obtener id_operador del localStorage
  const getOperadorId = useCallback(() => {
    const userData = localStorage.getItem('user')
    const token = localStorage.getItem('access_token')
    
    if (token) {
      try {
        // Decodificar el JWT para obtener el ID
        const parts = token.split('.')
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]))
          // El token contiene 'id' que es el id_usuario (numérico)
          if (payload.id && typeof payload.id === 'number') {
            console.log('🔑 ID del operador desde token:', payload.id)
            return String(payload.id)
          }
        }
      } catch (err) {
        console.error('❌ Error decodificando token:', err)
      }
    }
    
    // Fallback: intentar obtener del user en localStorage
    if (userData) {
      try {
        const user = JSON.parse(userData)
        if (user.id) {
          // Convertir a número si es string
          const id = typeof user.id === 'string' ? parseInt(user.id) : user.id
          if (!isNaN(id)) {
            console.log('👤 ID del operador desde user:', id)
            return String(id)
          }
        }
      } catch (err) {
        console.error('❌ Error parseando user:', err)
      }
    }
    
    console.warn('⚠️ No se pudo obtener ID del operador, usando 1 por defecto')
    return '1'
  }, [])

  const handleWebSocketMessage = useCallback((message: WebSocketMessage) => {
    console.log('📨 Mensaje WebSocket recibido:', message)
    console.log('📨 Tipo de mensaje:', message.type)
    console.log('📨 Keys del mensaje:', Object.keys(message))

    switch (message.type) {
      case 'nueva_solicitud':
        if (message.data && addEmergencia) {
          console.log('🚨 Nueva emergencia recibida:', message.data)
          addEmergencia(message.data as Emergencia)
        }
        break

      case 'emergencia_actualizada':
        if (message.data && updateEmergencia) {
          console.log('✏️ Emergencia actualizada:', message.data)
          const emergencia = message.data as Emergencia
          if (emergencia.id) {
            updateEmergencia(String(emergencia.id), emergencia)
          }
        }
        break

      case 'info_ambulancias':
        console.log('🚑 Mensaje info_ambulancias recibido!')
        console.log('🚑 Contenido completo:', JSON.stringify(message, null, 2))
        const infoMsg = message as unknown as InfoAmbulanciasMessage
        if (infoMsg.ambulancias) {
          console.log('🚑 Ubicaciones de ambulancias actualizadas:', infoMsg.ambulancias.length)
          console.log('🚑 Ambulancias:', infoMsg.ambulancias)
          const newMap = new Map<number, AmbulanciaUbicacion>()
          infoMsg.ambulancias.forEach(amb => {
            console.log(`  - Ambulancia ${amb.id}: lat=${amb.latitud}, lng=${amb.longitud}`)
            newMap.set(amb.id, amb)
          })
          setAmbulanciasUbicaciones(newMap)
          console.log('🚑 Map actualizado, tamaño:', newMap.size)
        } else {
          console.warn('⚠️ Mensaje info_ambulancias sin array de ambulancias')
        }
        break

      default:
        console.log('ℹ️ Mensaje desconocido:', message.type)
    }
  }, [addEmergencia, updateEmergencia])

  const { isConnected, error, send, disconnect, reconnect } = useWebSocket({
    onMessage: handleWebSocketMessage,
    onConnect: () => {
      const operadorId = getOperadorId()
      console.log(`✅ Conectado a WebSocket de emergencias con id_operador: ${operadorId}`)
    },
    onDisconnect: () => console.log('🔌 Desconectado de WebSocket'),
    onError: (err) => console.error('❌ Error WebSocket:', err),
    queryParams: {
      id_operador: getOperadorId()
    }
  })

  return {
    isConnected,
    error,
    send,
    disconnect,
    reconnect,
    ambulanciasUbicaciones,
  }
}
