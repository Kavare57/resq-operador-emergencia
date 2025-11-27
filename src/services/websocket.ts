import { WebSocketMessage } from '../types/websocket'

interface WebSocketInfoResponse {
  websocket_url: string
}

class WebSocketService {
  private ws: WebSocket | null = null
  private wsUrl: string = ''
  private httpBaseUrl: string
  private reconnectAttempts = 0
  private maxReconnectAttempts = 10
  private reconnectDelay = 3000
  private infoEndpoint: string
  private isManuallyDisconnected = false
  private queryParams: Record<string, string> = {}

  constructor(httpBaseUrl: string, infoEndpoint: string = '/atender-emergencias/websocket-info', queryParams?: Record<string, string>) {
    this.httpBaseUrl = httpBaseUrl
    this.infoEndpoint = infoEndpoint
    this.queryParams = queryParams || {}
  }

  /**
   * Obtiene la URL del WebSocket del backend (patrón del cliente Node.js)
   */
  private async fetchWebSocketUrl(): Promise<string> {
    try {
      // Normalizar httpBaseUrl e infoEndpoint para evitar doble slash
      const normalizedBaseUrl = this.httpBaseUrl.replace(/\/$/, '')
      const normalizedEndpoint = this.infoEndpoint.startsWith('/') 
        ? this.infoEndpoint 
        : `/${this.infoEndpoint}`
      
      const response = await fetch(`${normalizedBaseUrl}${normalizedEndpoint}`)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      const data = (await response.json()) as WebSocketInfoResponse
      
      if (!data.websocket_url) {
        throw new Error('No websocket_url in response')
      }

      let uri = data.websocket_url

      // Normalizar la URL para eliminar dobles slashes (excepto después del protocolo)
      uri = uri.replace(/([^:]\/)\/+/g, '$1')

      // Si viene una ruta relativa, construir URL absoluta
      if (uri.startsWith('/')) {
        const url = new URL(this.httpBaseUrl)
        const wsScheme = url.protocol === 'https:' ? 'wss' : 'ws'
        const host = url.hostname
        const port = url.port ? `:${url.port}` : ''
        uri = `${wsScheme}://${host}${port}${uri}`
      }

      console.log(`📡 WebSocket URL obtenida del backend: ${uri}`)
      return uri
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error fetching WebSocket URL'
      console.error(`❌ Error fetching WebSocket info: ${errorMsg}`)
      throw new Error(errorMsg)
    }
  }

  async connect(
    onMessage: (message: WebSocketMessage) => void,
    onConnect?: () => void,
    onDisconnect?: () => void,
    onError?: (error: string) => void
  ): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        // Siempre obtener la URL del backend (patrón del cliente Node.js main.js)
        // En desarrollo y producción se usa el mismo endpoint
        if (!this.wsUrl) {
          this.wsUrl = await this.fetchWebSocketUrl()
        }
        let uri = this.wsUrl

        // Agregar query params si existen
        if (Object.keys(this.queryParams).length > 0) {
          const params = new URLSearchParams(this.queryParams)
          uri = `${uri}?${params.toString()}`
          console.log(`🔗 Query params agregados:`, this.queryParams)
        }

        console.log(`🔗 Conectando a WebSocket: ${uri}`)
        console.log(`📍 Desde origen: ${typeof window !== 'undefined' ? window.location.origin : 'Node.js'}`)
        if (this.queryParams.id_operador) {
          console.log(`👤 Conectando con id_operador: ${this.queryParams.id_operador}`)
        }
        
        this.ws = new WebSocket(uri)

        // Agregar timeout para detectar si falla rápido
        const connectTimeout = setTimeout(() => {
          if (this.ws?.readyState === WebSocket.CONNECTING) {
            console.error('⏱️ Timeout conectando al WebSocket después de 10 segundos')
          }
        }, 10000)

        this.ws.onopen = () => {
          clearTimeout(connectTimeout)
          console.log('✅ WebSocket conectado exitosamente!')
          if (this.queryParams.id_operador) {
            console.log(`✅ Operador ${this.queryParams.id_operador} conectado y listo para recibir alertas de emergencias`)
          }
          this.reconnectAttempts = 0
          onConnect?.()
          resolve()
        }

        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data) as WebSocketMessage
            const timestamp = new Date().toISOString().split('T')[1].split('.')[0]
            console.log(`[${timestamp}] 🚨 Mensaje recibido:`)
            console.log(message)
            onMessage(message)
          } catch (err) {
            console.error('❌ Error parseando mensaje WebSocket:', err)
          }
        }

        this.ws.onerror = (event) => {
          const errorMsg = `❌ WebSocket Error: ${event instanceof Event ? event.type : String(event)}`
          console.error(errorMsg)
          console.error('Detalles del error:', event)
          onError?.(errorMsg)
          reject(new Error(errorMsg))
        }

        this.ws.onclose = () => {
          console.log('🔌 Conexión WebSocket cerrada')
          onDisconnect?.()
          
          // Solo reconectar si no fue desconexión manual
          if (!this.isManuallyDisconnected) {
            this.attemptReconnect(onMessage, onConnect, onDisconnect, onError)
          }
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error'
        console.error(`❌ Error: ${errorMsg}`)
        onError?.(errorMsg)
        reject(new Error(errorMsg))
      }
    })
  }

  private attemptReconnect(
    onMessage: (message: WebSocketMessage) => void,
    onConnect?: () => void,
    onDisconnect?: () => void,
    onError?: (error: string) => void
  ) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(
        `🔄 Reconectando... intento ${this.reconnectAttempts}/${this.maxReconnectAttempts}`
      )
      setTimeout(() => {
        this.connect(onMessage, onConnect, onDisconnect, onError).catch((err) => {
          console.error('❌ Reconexión fallida:', err)
        })
      }, this.reconnectDelay)
    } else {
      console.error('❌ Máximo de intentos de reconexión alcanzado')
      onError?.('Máximo de intentos de reconexión alcanzado')
    }
  }

  send(data: unknown) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
      console.log('📤 Mensaje enviado:', data)
    } else {
      console.warn('⚠️ WebSocket no está conectado')
    }
  }

  disconnect() {
    this.isManuallyDisconnected = true
    if (this.ws) {
      this.ws.close()
      this.ws = null
      console.log('🛑 WebSocket desconectado')
    }
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN
  }
}

export default WebSocketService
