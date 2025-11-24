import { logger } from './logger'

export interface AmbulanciaRealtime {
  id: number
  placa: string
  ubicacion: {
    latitud: number
    longitud: number
  }
  tipoAmbulancia: 'BASICA' | 'MEDICALIZADA'
  disponibilidad: boolean
  distancia?: number
}

export interface WebSocketMessage {
  type: string
  data: any
  timestamp?: number
}

class WebSocketClient {
  private ws: WebSocket | null = null
  private url: string
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 3000
  private listeners: Map<string, Function[]> = new Map()
  private messageQueue: WebSocketMessage[] = []
  private isConnecting = false

  constructor(url?: string) {
    const baseUrl = url || (import.meta.env as any).VITE_API_URL?.replace('http', 'ws').replace('/api', '') || 'ws://localhost:8000'
    this.url = baseUrl
    logger.info('WebSocketClient', 'WebSocket client inicializado', { url: this.url })
  }

  /**
   * Conectar al WebSocket
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        logger.info('WebSocketClient', 'Ya conectado al WebSocket')
        resolve()
        return
      }

      if (this.isConnecting) {
        logger.debug('WebSocketClient', 'Conexión ya en progreso...')
        return
      }

      this.isConnecting = true

      try {
        logger.info('WebSocketClient', 'Intentando conectar al WebSocket...', { url: this.url })
        this.ws = new WebSocket(this.url)

        this.ws.onopen = () => {
          logger.success('WebSocketClient', 'Conectado al WebSocket exitosamente')
          this.reconnectAttempts = 0
          this.isConnecting = false
          this.flushMessageQueue()
          this.emit('connected', {})
          resolve()
        }

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data)
            logger.debug('WebSocketClient', 'Mensaje recibido del WebSocket', {
              type: message.type,
              dataKeys: typeof message.data === 'object' ? Object.keys(message.data).slice(0, 5) : typeof message.data,
            })
            this.emit(message.type, message.data)
          } catch (err) {
            logger.error('WebSocketClient', 'Error parseando mensaje WebSocket', err as Error, {
              rawData: event.data.substring(0, 100),
            })
          }
        }

        this.ws.onerror = (event) => {
          logger.error('WebSocketClient', 'Error en WebSocket', new Error('WebSocket error'), {
            readyState: this.ws?.readyState,
            event,
          })
          this.isConnecting = false
          reject(event)
        }

        this.ws.onclose = () => {
          logger.warn('WebSocketClient', 'WebSocket desconectado')
          this.isConnecting = false
          this.attemptReconnect()
        }
      } catch (err) {
        logger.error('WebSocketClient', 'Error creando WebSocket', err as Error)
        this.isConnecting = false
        reject(err)
      }
    })
  }

  /**
   * Desconectar del WebSocket
   */
  disconnect(): void {
    logger.info('WebSocketClient', 'Desconectando del WebSocket...')
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  /**
   * Enviar mensaje al WebSocket
   */
  send(type: string, data: any): void {
    const message: WebSocketMessage = {
      type,
      data,
      timestamp: Date.now(),
    }

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        logger.debug('WebSocketClient', `Enviando mensaje: ${type}`, {
          dataKeys: typeof data === 'object' ? Object.keys(data).slice(0, 5) : typeof data,
        })
        this.ws.send(JSON.stringify(message))
      } catch (err) {
        logger.error('WebSocketClient', `Error enviando mensaje ${type}`, err as Error)
      }
    } else {
      logger.warn('WebSocketClient', `WebSocket no conectado. Encolando mensaje: ${type}`)
      this.messageQueue.push(message)
    }
  }

  /**
   * Escuchar eventos específicos
   */
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)?.push(callback)
    logger.debug('WebSocketClient', `Listener agregado para evento: ${event}`)
  }

  /**
   * Remover listener
   */
  off(event: string, callback: Function): void {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
        logger.debug('WebSocketClient', `Listener removido para evento: ${event}`)
      }
    }
  }

  /**
   * Emitir evento
   */
  private emit(event: string, data: any): void {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(data)
        } catch (err) {
          logger.error('WebSocketClient', `Error en callback de evento ${event}`, err as Error)
        }
      })
    }
  }

  /**
   * Intentar reconectar
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      const delay = this.reconnectDelay * this.reconnectAttempts
      logger.warn('WebSocketClient', `Reintentando conexión en ${delay}ms (intento ${this.reconnectAttempts}/${this.maxReconnectAttempts})`)

      setTimeout(() => {
        this.connect().catch((err) => {
          logger.error('WebSocketClient', 'Error al reconectar', err as Error)
        })
      }, delay)
    } else {
      logger.error('WebSocketClient', 'Se alcanzó el máximo de intentos de reconexión')
      this.emit('reconnect_failed', {})
    }
  }

  /**
   * Enviar mensajes encolados
   */
  private flushMessageQueue(): void {
    if (this.messageQueue.length > 0) {
      logger.info('WebSocketClient', `Enviando ${this.messageQueue.length} mensajes encolados`)
      while (this.messageQueue.length > 0) {
        const message = this.messageQueue.shift()
        if (message) {
          this.send(message.type, message.data)
        }
      }
    }
  }

  /**
   * Obtener estado de conexión
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN
  }

  /**
   * Obtener estado legible
   */
  getStatus(): string {
    if (!this.ws) return 'disconnected'
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting'
      case WebSocket.OPEN:
        return 'connected'
      case WebSocket.CLOSING:
        return 'closing'
      case WebSocket.CLOSED:
        return 'closed'
      default:
        return 'unknown'
    }
  }
}

export const wsClient = new WebSocketClient()
