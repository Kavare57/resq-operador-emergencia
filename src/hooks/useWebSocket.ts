import { useEffect, useRef, useCallback, useState } from 'react'
import WebSocketService from '../services/websocket'
import { WebSocketMessage } from '../types/websocket'

interface UseWebSocketOptions {
  onMessage?: (message: WebSocketMessage) => void
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (error: string) => void
  httpBaseUrl?: string
  infoEndpoint?: string
}

/**
 * Hook para usar WebSocket con manejo automático de reconexión
 * Aplica el patrón del cliente Node.js: obtiene la URL del WebSocket del backend
 */
export function useWebSocket(options: UseWebSocketOptions = {}) {
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const wsService = useRef<WebSocketService | null>(null)

  // Detectar el host correcto desde el navegador
  const httpBaseUrl = options.httpBaseUrl || (() => {
    if (typeof window !== 'undefined') {
      // Usar el mismo host/puerto del navegador pero convertir a http/https
      const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:'
      return `${protocol}//${window.location.hostname}:8000`
    }
    return 'http://localhost:8000'
  })()
  
  const infoEndpoint = options.infoEndpoint || '/atender-emergencias/websocket-info'

  const handleMessage = useCallback(
    (message: WebSocketMessage) => {
      console.log(`[${new Date().toISOString().split('T')[1].split('.')[0]}] 🚨 Nueva emergencia:`)
      console.log(JSON.stringify(message, null, 2))
      options.onMessage?.(message)
    },
    [options]
  )

  const handleConnect = useCallback(() => {
    console.log('✅ WebSocket conectado!')
    setIsConnected(true)
    setError(null)
    options.onConnect?.()
  }, [options])

  const handleDisconnect = useCallback(() => {
    console.log('🔌 WebSocket desconectado')
    setIsConnected(false)
    options.onDisconnect?.()
  }, [options])

  const handleError = useCallback(
    (errorMsg: string) => {
      console.error(`❌ Error WebSocket: ${errorMsg}`)
      setError(errorMsg)
      options.onError?.(errorMsg)
    },
    [options]
  )

  const connect = useCallback(async () => {
    if (wsService.current?.isConnected()) {
      console.log('WebSocket ya está conectado')
      return
    }

    wsService.current = new WebSocketService(httpBaseUrl, infoEndpoint)

    try {
      await wsService.current.connect(handleMessage, handleConnect, handleDisconnect, handleError)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error conectando WebSocket'
      handleError(errorMsg)
    }
  }, [httpBaseUrl, infoEndpoint, handleMessage, handleConnect, handleDisconnect, handleError])

  const disconnect = useCallback(() => {
    wsService.current?.disconnect()
    setIsConnected(false)
  }, [])

  const send = useCallback((data: unknown) => {
    wsService.current?.send(data)
  }, [])

  useEffect(() => {
    connect()

    return () => {
      disconnect()
    }
  }, [])

  return {
    isConnected,
    error,
    send,
    disconnect,
    reconnect: connect,
  }
}
