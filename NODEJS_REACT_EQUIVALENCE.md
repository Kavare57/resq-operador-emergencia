# Equivalencia: Cliente Node.js ↔ Frontend React

Una guía visual mostrando cómo se mapea cada parte del cliente Node.js al frontend React.

---

## 📊 Comparación Directa

### Node.js Client vs React Frontend

```
╔════════════════════════════════════════╦════════════════════════════════════════╗
║          NODE.JS CLIENT                ║         REACT FRONTEND                 ║
║          (main.js)                     ║    (src/services + src/hooks)          ║
╠════════════════════════════════════════╬════════════════════════════════════════╣
║ 1. Obtener URL del WebSocket          ║ 1. Obtener URL del WebSocket           ║
║    http.get(/atender-emergencias/    ║    fetch(/atender-emergencias/        ║
║            websocket-info)           ║           websocket-info)             ║
║    ↓                                  ║    ↓                                   ║
║ WebSocketService.fetchWebSocketUrl() ║ WebSocketService.fetchWebSocketUrl()   ║
╠════════════════════════════════════════╬════════════════════════════════════════╣
║ 2. Convertir URLs Relativas           ║ 2. Convertir URLs Relativas            ║
║    if (uri.startsWith('/')) {        ║    if (uri.startsWith('/')) {         ║
║      wsScheme = protocol === 'https' ║      wsScheme = protocol === 'https'  ║
║                ? 'wss' : 'ws'        ║                 ? 'wss' : 'ws'       ║
║      uri = `${wsScheme}://...`      ║      uri = `${wsScheme}://...`       ║
║    }                                 ║    }                                  ║
║    ↓                                  ║    ↓                                   ║
║ WebSocketService.fetchWebSocketUrl() ║ WebSocketService.fetchWebSocketUrl()   ║
╠════════════════════════════════════════╬════════════════════════════════════════╣
║ 3. Conectar WebSocket                 ║ 3. Conectar WebSocket                  ║
║    ws = new WebSocket(uri)           ║    ws = new WebSocket(uri)            ║
║    ws.on('open', ...)                ║    ws.onopen = ...                     ║
║    ws.on('message', ...)             ║    ws.onmessage = ...                  ║
║    ws.on('error', ...)               ║    ws.onerror = ...                    ║
║    ws.on('close', ...)               ║    ws.onclose = ...                    ║
║    ↓                                  ║    ↓                                   ║
║ WebSocketService.connect()            ║ WebSocketService.connect()             ║
╠════════════════════════════════════════╬════════════════════════════════════════╣
║ 4. Recibir Mensajes                   ║ 4. Recibir Mensajes                    ║
║    ws.on('message', (data) => {      ║    ws.onmessage = (event) => {        ║
║      const message = JSON.parse(data) ║      const message = JSON.parse(      ║
║      console.log(message)             ║        event.data)                    ║
║      // Procesar emergencia           ║      onMessage(message)               ║
║    })                                 ║    }                                   ║
║    ↓                                  ║    ↓                                   ║
║ async main()                          ║ useWebSocketEmergencias()              ║
║ → handleWebSocketMessage()            ║ → handleWebSocketMessage()             ║
╠════════════════════════════════════════╬════════════════════════════════════════╣
║ 5. Reconexión Automática              ║ 5. Reconexión Automática               ║
║    if (reconnectAttempts <           ║    if (reconnectAttempts <            ║
║        maxReconnectAttempts) {       ║        maxReconnectAttempts) {        ║
║      reconnectAttempts++             ║      reconnectAttempts++              ║
║      setTimeout(() => {              ║      setTimeout(() => {               ║
║        connect(...)                  ║        connect(...)                   ║
║      }, reconnectDelay)              ║      }, reconnectDelay)               ║
║    }                                 ║    }                                  ║
║    ↓                                  ║    ↓                                   ║
║ attemptReconnect()                    ║ attemptReconnect()                     ║
║ maxAttempts: 5                        ║ maxAttempts: 5                         ║
║ delay: 3000ms                         ║ delay: 3000ms                          ║
╠════════════════════════════════════════╬════════════════════════════════════════╣
║ 6. Manejo de Errores                  ║ 6. Manejo de Errores                   ║
║    ws.on('error', (error) => {       ║    ws.onerror = (error) => {          ║
║      console.error(error)             ║      console.error(error)              ║
║      process.exit(1)                  ║      onError(errorMsg)                 ║
║    })                                 ║    }                                   ║
║    ↓                                  ║    ↓                                   ║
║ main()                                ║ useWebSocket()                         ║
║ try/catch wrapper                     ║ error state + onError callback         ║
╠════════════════════════════════════════╬════════════════════════════════════════╣
║ 7. Procesamiento de Mensajes          ║ 7. Procesamiento de Mensajes           ║
║                                       ║                                        ║
║    const message = JSON.parse(data)  ║    switch (message.type) {            ║
║    console.log(message)               ║      case 'nueva_solicitud':          ║
║    // Solo log                        ║        addEmergencia(message.data)   ║
║                                       ║        break                          ║
║                                       ║      case 'emergencia_actualizada':   ║
║                                       ║        updateEmergencia(...)          ║
║                                       ║        break                          ║
║                                       ║    }                                   ║
║    ↓                                  ║    ↓                                   ║
║ async main()                          ║ useWebSocketEmergencias()              ║
║ (Output únicamente a console)         ║ (Integración con contexto React)       ║
╚════════════════════════════════════════╩════════════════════════════════════════╝
```

---

## 🔄 Flujo de Ejecución

### Node.js
```
1. main()
   ├─ http.get(/atender-emergencias/websocket-info)
   ├─ Response: { websocket_url: "/ws/emergencias" }
   ├─ Convertir URL: /ws/emergencias → ws://localhost:8000/ws/emergencias
   ├─ WebSocket.new(uri)
   ├─ ws.on('open')
   │  └─ console.log('✅ Connected!')
   ├─ ws.on('message')
   │  └─ Parsear y loguear mensaje
   ├─ ws.on('error')
   │  └─ console.error(), process.exit(1)
   ├─ ws.on('close')
   │  └─ attemptReconnect()
   │     └─ setTimeout → reconnect()
   └─ process.on('SIGINT')
      └─ ws.close(), process.exit(0)
```

### React
```
1. useWebSocketEmergencias()
   ├─ useWebSocket()
   │  ├─ WebSocketService.fetchWebSocketUrl()
   │  │  └─ fetch(/atender-emergencias/websocket-info)
   │  │     └─ Response: { websocket_url: "/ws/emergencias" }
   │  ├─ Convertir URL (igual que Node.js)
   │  ├─ WebSocket.new(uri)
   │  ├─ ws.onopen → setIsConnected(true), onConnect()
   │  ├─ ws.onmessage → onMessage(msg)
   │  ├─ ws.onerror → setError(err), onError(err)
   │  └─ ws.onclose → setIsConnected(false), attemptReconnect()
   │
   ├─ handleWebSocketMessage(msg)
   │  └─ switch(msg.type)
   │     ├─ case 'nueva_solicitud'
   │     │  └─ addEmergencia(msg.data) → actualizar contexto
   │     ├─ case 'emergencia_actualizada'
   │     │  └─ updateEmergencia() → actualizar contexto
   │     └─ default
   │        └─ console.log('Unknown type')
   │
   └─ return { isConnected, error, send, disconnect, reconnect }
      └─ Usar en componentes React (ej: DashboardPage)
         └─ Mostrar estado + lista de emergencias
```

---

## 📝 Equivalencia de Variables

| Concepto | Node.js | React |
|----------|---------|-------|
| URL HTTP | `httpUrl` | `httpBaseUrl + infoEndpoint` |
| URL WebSocket | `uri` | `this.wsUrl` |
| Conexión WebSocket | `ws` | `this.ws` en WebSocketService |
| Estado conectado | Implícito en callbacks | `isConnected` state |
| Intentos reconexión | `reconnectAttempts` | `reconnectAttempts` ref |
| Max reconexiones | `maxReconnectAttempts = 5` | `maxReconnectAttempts = 5` |
| Delay reconexión | `reconnectDelay = 3000` | `reconnectDelay = 3000` |
| Mensaje recibido | Evento `'message'` | Event handler `onmessage` |
| Error | Evento `'error'` | Event handler `onerror` |
| Cierre conexión | Evento `'close'` | Event handler `onclose` |

---

## 🎯 Casos de Uso

### Node.js: Monitorear emergencias en terminal
```javascript
// main.js
node main.js

Output:
============================================================
📡 HTTP Request: GET /atender-emergencias/websocket-info
============================================================
Status: 200
Response:
{
  "websocket_url": "/ws/emergencias"
}
============================================================

🔗 Connecting to WebSocket: ws://localhost:8000/ws/emergencias

(Presiona Ctrl+C para salir)

✅ Connected!
[16:30:45] 🚨 Nueva emergencia recibida:
{
  "type": "nueva_solicitud",
  "data": { ... }
}
------------------------------------------------------------
```

### React: Integrar en Dashboard
```typescript
// DashboardPage.tsx
const { isConnected, error } = useWebSocketEmergencias();

// En el DOM:
<div className={isConnected ? 'text-green-600' : 'text-red-600'}>
  {isConnected ? '✅ Conectado' : '❌ Desconectado'}
</div>

// Emergencias se agregan automáticamente a través de addEmergencia()
```

---

## 🔄 Transiciones de Estado

### Estado de Conexión (Node.js + React)

```
DESCONECTADO
    ↓
    • HTTP GET a /atender-emergencias/websocket-info
    • Obtener URL del WebSocket
    ↓
CONSTRUYENDO CONEXIÓN
    ↓
    • new WebSocket(uri)
    • Esperar evento 'open'
    ↓
CONECTADO ✅
    ├─ Recibir mensajes
    ├─ Procesar emergencias
    └─ Esperar error o cierre
    ↓
DESCONECTADO ❌ (error o cierre)
    ├─ ¿Intentos < 5?
    │  ├─ Sí: ESPERANDO (3000ms)
    │  │       └─ Volver a DESCONECTADO (reintentar)
    │  └─ No: FALLO PERMANENTE
    │         └─ Requiere intervención del usuario
```

---

## 💾 Almacenamiento de Datos

### Node.js
```javascript
// Solo output a consola
// No hay almacenamiento persistente
console.log(message);
```

### React
```typescript
// Almacenamiento en contexto de emergencias
const { addEmergencia, updateEmergencia } = useEmergencias();

// Nueva emergencia
addEmergencia(message.data);  // Agregada a Redux/Context

// Actualización
updateEmergencia(id, updates); // Actualizada en contexto

// Los datos se reflejan en componentes React automáticamente
```

---

## 📡 Tipos de Mensajes

### Formato (Idéntico en ambos)

```json
{
  "type": "nueva_solicitud",
  "data": {
    "id": "123",
    "numero_emergencia": "EMG-001",
    "solicitante": {},
    "ubicacion": {},
    "descripcion": "...",
    "prioridad": "alta",
    "estado": "pendiente",
    "fechaHora": "2025-11-16T16:30:00Z"
  }
}
```

### Procesamiento

| Tipo | Node.js | React |
|------|---------|-------|
| `nueva_solicitud` | Log a consola | `addEmergencia()` |
| `emergencia_actualizada` | Log a consola | `updateEmergencia()` |
| Otros | Log a consola | Log a consola |

---

## 🔗 Archivos Relacionados

### Node.js
- `main.js` - Cliente original

### React
- `src/services/websocket.ts` - Servicio WebSocket
- `src/hooks/useWebSocket.ts` - Hook genérico
- `src/hooks/useWebSocketEmergencias.ts` - Hook especializado
- `src/pages/DashboardPage.tsx` - Consumidor
- `src/context/EmergenciaContext.tsx` - Almacenamiento de estado

---

## ✅ Compatibilidad

✅ **Mismo protocolo WebSocket**  
✅ **Mismo endpoint HTTP** para obtener URL  
✅ **Mismo formato de mensajes**  
✅ **Mismo manejo de reconexión**  
✅ **Mismo logging**  
✅ **Diferencia:** React integra con UI/estado en lugar de solo loguear  

---

## 🎓 Aprendizajes Clave

1. **Obtener URL del backend** es más flexible que hardcodearla
2. **URLs relativas** se convierten automáticamente a absolutas
3. **HTTP/HTTPS detection** para elegir WS/WSS
4. **Reconexión automática** con límite de intentos
5. **Logging detallado** facilita debugging
6. **Context React** permite compartir estado entre componentes
7. **Hooks personalizados** centralizan la lógica de dominio
8. **TypeScript** proporciona seguridad de tipos

---

## 📚 Referencias

- Cliente original: `main.js`
- Frontend: ResQ - Operador de Emergencia
- Documentación: 
  - `WEBSOCKET_IMPLEMENTATION.md`
  - `WEBSOCKET_USAGE_GUIDE.md`
