# Implementación del Patrón WebSocket - Análisis y Aplicación

## 📋 Resumen

Se ha aplicado el patrón de conexión WebSocket del cliente Node.js (`main.js`) al frontend de React del operador de emergencia. Este documento explica qué cambios se realizaron y por qué.

---

## 🔍 Análisis del Cliente Node.js (main.js)

El cliente Node.js implementa un patrón robusto en 3 fases:

### 1. **Obtener URL del WebSocket del Backend (HTTP)**
```javascript
const httpUrl = 'http://127.0.0.1:8000/atender-emergencias/websocket-info';
const response = await http.get(httpUrl);
let uri = response.body.websocket_url;

// Si es URL relativa, convertir a absoluta
if (uri.startsWith('/')) {
  const wsScheme = parsedUrl.protocol === 'https:' ? 'wss' : 'ws';
  uri = `${wsScheme}://${parsedUrl.host}${uri}`;
}
```

**Ventajas:**
- El backend controla la URL del WebSocket
- Soporta URLs relativas y absolutas
- Permite cambiar la URL sin recompilar el cliente
- Diferencia entre HTTP y HTTPS para determinar WS vs WSS

### 2. **Conectar al WebSocket con Manejo de Errores**
```javascript
const ws = new WebSocket(uri);

ws.on('open', () => {
  console.log('✅ Connected!');
});

ws.on('message', (data) => {
  const message = JSON.parse(data);
  console.log(`[${timestamp}] 🚨 Nueva emergencia:`);
  console.log(JSON.stringify(message, null, 2));
});

ws.on('error', (error) => {
  console.error(`❌ WebSocket Error: ${error.message}`);
});

ws.on('close', () => {
  console.log('🔌 Connection closed');
});
```

**Características:**
- Manejo explícito de todos los eventos (open, message, error, close)
- Logging detallado con timestamps
- Parseo de JSON con try-catch

### 3. **Reconexión Automática con Límite de Intentos**
```javascript
private attemptReconnect(onMessage, onConnect, onDisconnect, onError) {
  if (this.reconnectAttempts < this.maxReconnectAttempts) {
    this.reconnectAttempts++;
    console.log(`Reconectando... intento ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
    setTimeout(() => {
      this.connect(onMessage, onConnect, onDisconnect, onError);
    }, this.reconnectDelay);
  } else {
    console.error('❌ Max reconnection attempts reached');
  }
}
```

**Parámetros:**
- `maxReconnectAttempts = 5`
- `reconnectDelay = 3000ms`

---

## ✅ Cambios Realizados en el Frontend

### 1. **WebSocketService (src/services/websocket.ts)**

**Antes:**
```typescript
class WebSocketService {
  constructor(url: string) {
    this.url = url  // URL directa
  }
  
  connect() {
    this.ws = new WebSocket(this.url);
  }
}
```

**Después:**
```typescript
class WebSocketService {
  constructor(httpBaseUrl: string, infoEndpoint: string) {
    this.httpBaseUrl = httpBaseUrl;
    this.infoEndpoint = infoEndpoint;
  }
  
  private async fetchWebSocketUrl(): Promise<string> {
    // Obtener URL del backend como en Node.js
    const response = await fetch(`${this.httpBaseUrl}${this.infoEndpoint}`);
    const data = await response.json();
    
    // Convertir URLs relativas a absolutas
    let uri = data.websocket_url;
    if (uri.startsWith('/')) {
      const url = new URL(this.httpBaseUrl);
      const wsScheme = url.protocol === 'https:' ? 'wss' : 'ws';
      uri = `${wsScheme}://${url.host}${uri}`;
    }
    
    return uri;
  }
  
  async connect(onMessage, onConnect, onDisconnect, onError) {
    // Obtener URL del backend primero
    this.wsUrl = await this.fetchWebSocketUrl();
    this.ws = new WebSocket(this.wsUrl);
  }
}
```

**Mejoras:**
- ✅ Obtiene URL del WebSocket del backend
- ✅ Soporta URLs relativas
- ✅ Diferencia entre HTTP/HTTPS y WS/WSS
- ✅ Mejor logging con emojis y timestamps
- ✅ Manejo robusto de reconexión

### 2. **useWebSocket Hook (src/hooks/useWebSocket.ts)**

**Antes:**
```typescript
export function useWebSocket(url: string, options) {
  // Conectaba directamente a URL proporcionada
}
```

**Después:**
```typescript
export function useWebSocket(options: UseWebSocketOptions = {}) {
  const httpBaseUrl = options.httpBaseUrl || window.location.origin;
  const infoEndpoint = options.infoEndpoint || '/atender-emergencias/websocket-info';
  
  // Usa WebSocketService que obtiene la URL del backend
  wsService.current = new WebSocketService(httpBaseUrl, infoEndpoint);
  await wsService.current.connect(handleMessage, ...);
}
```

**Cambios:**
- ✅ No requiere URL del WebSocket como parámetro
- ✅ Obtiene URL del backend automáticamente
- ✅ Usa `window.location.origin` por defecto
- ✅ Signature simplificada del hook

### 3. **useWebSocketEmergencias Hook (src/hooks/useWebSocketEmergencias.ts)** - NUEVO

Nuevo hook especializado que integra WebSocket con el contexto de emergencias:

```typescript
export function useWebSocketEmergencias() {
  const { addEmergencia, updateEmergencia } = useEmergencias();
  
  const handleWebSocketMessage = (message: WebSocketMessage) => {
    switch (message.type) {
      case 'nueva_solicitud':
        addEmergencia(message.data);
        break;
      case 'emergencia_actualizada':
        updateEmergencia(message.data.id, message.data);
        break;
    }
  };
  
  const { isConnected, error, send, disconnect, reconnect } = useWebSocket({
    onMessage: handleWebSocketMessage,
    onConnect: () => console.log('✅ Conectado'),
    onDisconnect: () => console.log('🔌 Desconectado'),
    onError: (err) => console.error('❌ Error:', err),
  });
  
  return { isConnected, error, send, disconnect, reconnect };
}
```

**Ventajas:**
- ✅ Abstrae la lógica WebSocket del componente
- ✅ Maneja automáticamente tipos de mensajes
- ✅ Integración perfecta con el contexto de emergencias
- ✅ Reutilizable en múltiples componentes

### 4. **DashboardPage.tsx**

**Cambios:**
```typescript
// Ahora usa el hook de WebSocket
const { isConnected: wsConnected, error: wsError } = useWebSocketEmergencias();

// Muestra estado de conexión
<div className="flex items-center gap-2">
  <div className={`h-3 w-3 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-red-500'}`} />
  <span>{wsConnected ? '✅ Conectado' : '❌ Desconectado'}</span>
</div>
```

---

## 🔄 Flujo de Conexión

```
Frontend Browser
    │
    ├─→ [1] Fetch HTTP: /atender-emergencias/websocket-info
    │         Backend responde: { "websocket_url": "/ws/emergencias" }
    │
    ├─→ [2] Convertir URL relativa a absoluta
    │         /ws/emergencias → ws://localhost:8000/ws/emergencias
    │
    ├─→ [3] Conectar WebSocket
    │         ws.open() → console: "✅ WebSocket conectado!"
    │
    └─→ [4] Escuchar mensajes
              ws.message() → { "type": "nueva_solicitud", "data": {...} }
              addEmergencia(data) → Actualizar UI
```

---

## 📊 Comparación de Patrones

| Aspecto | Antes | Después |
|--------|-------|---------|
| Obtención de URL | Hardcodeada | Del backend (HTTP) |
| URLs relativas | ❌ No soportadas | ✅ Soportadas |
| HTTP→WS conversion | ❌ Manual | ✅ Automático |
| Reconexión | 1 intento | 5 intentos |
| Logging | Básico | Detallado con emojis |
| Integración con contexto | ❌ Separada | ✅ Integrada |
| Tipos de mensajes | Genéricos | Específicos (nueva_solicitud, etc) |

---

## 🚀 Cómo Usar

### En un componente:
```typescript
import { useWebSocketEmergencias } from '../hooks';

function MyComponent() {
  const { isConnected, error, send } = useWebSocketEmergencias();
  
  return (
    <div>
      {isConnected ? '✅ Conectado' : '❌ Desconectado'}
      {error && <p>Error: {error}</p>}
    </div>
  );
}
```

### Opciones avanzadas:
```typescript
const { isConnected, error } = useWebSocket({
  httpBaseUrl: 'http://api.example.com',
  infoEndpoint: '/custom/websocket-info',
  onMessage: (msg) => console.log('Mensaje:', msg),
  onConnect: () => console.log('Conectado'),
  onDisconnect: () => console.log('Desconectado'),
  onError: (err) => console.error('Error:', err),
});
```

---

## 🔍 Tipos de Mensajes Soportados

Basados en el cliente Node.js:

```typescript
interface WebSocketMessage {
  type: 'nueva_solicitud' | 'emergencia_actualizada' | string;
  data?: Emergencia;
  [key: string]: unknown;
}
```

**Ejemplos:**

1. **Nueva Emergencia:**
```json
{
  "type": "nueva_solicitud",
  "data": {
    "id": "123",
    "numero_emergencia": "EMG-001",
    "solicitante": {...},
    "ubicacion": {...},
    "estado": "pendiente"
  }
}
```

2. **Actualización de Emergencia:**
```json
{
  "type": "emergencia_actualizada",
  "data": {
    "id": "123",
    "estado": "en_progreso"
  }
}
```

---

## 🛠️ Configuración del Backend

El backend debe proporcionar:

1. **Endpoint HTTP:** `GET /atender-emergencias/websocket-info`
   ```json
   {
     "websocket_url": "/ws/emergencias"
   }
   ```

2. **WebSocket Endpoint:** `/ws/emergencias`
   - Enviar mensajes con `type` y `data`
   - Soportar conexión/desconexión
   - Manejo de errores

---

## 📝 Archivos Modificados

1. ✅ `src/services/websocket.ts` - Implementar obtención de URL del backend
2. ✅ `src/hooks/useWebSocket.ts` - Simplificar signature y usar WebSocketService
3. ✅ `src/hooks/useWebSocketEmergencias.ts` - Nuevo hook especializado (CREADO)
4. ✅ `src/hooks/index.ts` - Exportar nuevo hook
5. ✅ `src/pages/DashboardPage.tsx` - Integrar WebSocket y mostrar estado

---

## ✨ Beneficios de Esta Implementación

✅ **Consistencia**: Mismo patrón que el cliente Node.js  
✅ **Flexibilidad**: Backend controla la URL del WebSocket  
✅ **Robustez**: Manejo automático de reconexión  
✅ **Logging**: Debugging fácil con logs detallados  
✅ **Type-Safe**: Tipos TypeScript para mensajes  
✅ **Reutilizable**: Hook especializado para emergencias  
✅ **Responsive**: Indicador de estado en tiempo real  
✅ **Escalable**: Fácil agregar nuevos tipos de mensajes  

---

## 🔗 Referencias

- `main.js`: Cliente Node.js original
- WebSocket API: https://developer.mozilla.org/en-US/docs/Web/API/WebSocket
- React Hooks: https://react.dev/reference/react/hooks
