# Guía de Uso - WebSocket en Frontend

## 🎯 Casos de Uso

### Caso 1: Dashboard Operador (Implementado)

El dashboard usa `useWebSocketEmergencias` que:
1. Se conecta automáticamente al iniciar
2. Recibe nuevas emergencias en tiempo real
3. Actualiza la lista automáticamente
4. Muestra estado de conexión

```typescript
// src/pages/DashboardPage.tsx
const { isConnected: wsConnected, error: wsError } = useWebSocketEmergencias();

// Ahora wsConnected se actualiza automáticamente
// Las emergencias se agregan a través de addEmergencia()
```

---

### Caso 2: Componente Personalizado

Crear un componente que escuche WebSocket:

```typescript
import { useWebSocket } from '../hooks';

export function MiComponente() {
  const { isConnected, error, send, reconnect } = useWebSocket({
    onMessage: (msg) => {
      console.log('Mensaje recibido:', msg);
      // Procesar mensaje personalizado
    },
    onConnect: () => {
      console.log('Conectado al servidor');
      // Enviar comando inicial si es necesario
      send({ type: 'init', operador_id: '123' });
    },
    onError: (err) => {
      console.error('Error:', err);
      // Mostrar notificación al usuario
    }
  });

  return (
    <div>
      <div className={isConnected ? 'text-green-600' : 'text-red-600'}>
        {isConnected ? '✅ Conectado' : '❌ Desconectado'}
      </div>
      {error && <div className="text-red-600">{error}</div>}
      <button onClick={reconnect}>Reconectar</button>
      <button onClick={() => send({ type: 'test' })}>Enviar Test</button>
    </div>
  );
}
```

---

### Caso 3: Contexto Específico de Dominio

Para manejar lógica específica de emergencias:

```typescript
import { useWebSocketEmergencias } from '../hooks';
import { useEmergencias } from '../context/EmergenciaContext';

export function EmergenciaMonitor() {
  const { isConnected, error } = useWebSocketEmergencias();
  const { emergencias } = useEmergencias();

  const pendientes = emergencias.filter(e => e.estado === 'pendiente');
  const enProgreso = emergencias.filter(e => e.estado === 'en_progreso');

  return (
    <div>
      <h2>Monitor de Emergencias</h2>
      <div>
        Estado: {isConnected ? '✅ Activo' : '❌ Inactivo'}
      </div>
      <div>
        Pendientes: {pendientes.length}
      </div>
      <div>
        En Progreso: {enProgreso.length}
      </div>
      {error && <Alert>{error}</Alert>}
    </div>
  );
}
```

---

## 🔌 API del Hook `useWebSocket`

### Signature

```typescript
function useWebSocket(options?: UseWebSocketOptions): UseWebSocketReturn
```

### Parámetros

```typescript
interface UseWebSocketOptions {
  // Callbacks de eventos
  onMessage?: (message: WebSocketMessage) => void
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (error: string) => void

  // Configuración del servidor
  httpBaseUrl?: string  // Default: window.location.origin
  infoEndpoint?: string // Default: '/atender-emergencias/websocket-info'
}
```

### Retorno

```typescript
interface UseWebSocketReturn {
  isConnected: boolean          // Estado de conexión
  error: string | null          // Error actual (si hay)
  send: (data: unknown) => void // Enviar mensaje
  disconnect: () => void        // Desconectar
  reconnect: () => Promise<void> // Reconectar
}
```

---

## 🔌 API del Hook `useWebSocketEmergencias`

### Signature

```typescript
function useWebSocketEmergencias(): UseWebSocketReturn
```

### Comportamiento Automático

1. **Al conectar:**
   - Se conecta al WebSocket del backend
   - Comienza a escuchar emergencias

2. **Al recibir mensaje `nueva_solicitud`:**
   - Agrega emergencia al contexto
   - Dispone una notificación opcional
   - Actualiza la UI automáticamente

3. **Al recibir mensaje `emergencia_actualizada`:**
   - Actualiza emergencia existente
   - Refleja cambios en tiempo real
   - Mantiene sincronización con backend

---

## 📊 Estados de Conexión

```typescript
// Conectando
wsConnected === false

// Conectado
wsConnected === true
// Los eventos WebSocket se manejan

// Desconectado
wsConnected === false
error !== null
// Intenta reconectar automáticamente (hasta 5 veces)

// Error permanente
wsConnected === false
error === 'Max reconnection attempts reached'
// Requiere intervención del usuario
```

---

## 📡 Tipos de Mensajes

### Formato General

```typescript
interface WebSocketMessage {
  type: string              // Tipo de evento
  data?: unknown           // Datos asociados (depende del tipo)
  [key: string]: unknown   // Propiedades adicionales
}
```

### Mensajes Predefinidos

#### 1. Nueva Solicitud de Emergencia

```json
{
  "type": "nueva_solicitud",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "numero_emergencia": "EMG-001",
    "solicitante": {
      "nombre": "Juan",
      "apellido": "Pérez",
      "numeroDocumento": "1234567890",
      "tipoDocumento": "CC"
    },
    "ubicacion": {
      "direccion": "Calle 123 #45-67",
      "ciudad": "Bogotá",
      "latitud": 4.7110,
      "longitud": -74.0721
    },
    "descripcion": "Accidente de tráfico",
    "prioridad": "alta",
    "estado": "pendiente",
    "fechaHora": "2025-11-16T16:30:00Z"
  }
}
```

#### 2. Emergencia Actualizada

```json
{
  "type": "emergencia_actualizada",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "estado": "en_progreso",
    "operador_asignado": "OP-001"
  }
}
```

#### 3. Mensajes Personalizados

```json
{
  "type": "custom_event",
  "custom_field": "custom_value"
}
```

---

## 🎨 Ejemplo Completo

### Componente que muestra estado de emergencias

```typescript
import React, { useState } from 'react';
import { useWebSocketEmergencias } from '../hooks';
import { useEmergencias } from '../context/EmergenciaContext';

export function EmergenciasList() {
  const { isConnected, error, reconnect } = useWebSocketEmergencias();
  const { emergencias } = useEmergencias();
  const [filtro, setFiltro] = useState('pendiente');

  const emergenciasFiltradas = emergencias.filter(
    e => e.estado === filtro
  );

  return (
    <div className="p-4">
      {/* Estado de conexión */}
      <div className={`p-2 mb-4 rounded ${isConnected ? 'bg-green-100' : 'bg-red-100'}`}>
        <p className={isConnected ? 'text-green-800' : 'text-red-800'}>
          {isConnected ? '✅ Conectado' : '❌ Desconectado'}
        </p>
        {error && (
          <button
            onClick={reconnect}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Reconectar
          </button>
        )}
      </div>

      {/* Selector de filtro */}
      <select
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        className="mb-4 p-2 border rounded"
      >
        <option value="pendiente">Pendientes</option>
        <option value="en_progreso">En Progreso</option>
        <option value="resuelta">Resueltas</option>
      </select>

      {/* Lista de emergencias */}
      <div className="space-y-2">
        {emergenciasFiltradas.map((e) => (
          <div key={e.id} className="p-3 border rounded bg-gray-50">
            <p className="font-bold">{e.numero_emergencia}</p>
            <p className="text-sm">{e.ubicacion?.direccion}</p>
            <p className="text-sm text-gray-600">{e.descripcion}</p>
            <div className="mt-2 flex justify-between">
              <span className={`px-2 py-1 rounded text-xs text-white
                ${e.prioridad === 'alta' ? 'bg-red-500' :
                  e.prioridad === 'media' ? 'bg-yellow-500' :
                  'bg-green-500'}`}>
                {e.prioridad}
              </span>
              <span className={`px-2 py-1 rounded text-xs text-white
                ${e.estado === 'pendiente' ? 'bg-blue-500' :
                  e.estado === 'en_progreso' ? 'bg-orange-500' :
                  'bg-green-500'}`}>
                {e.estado}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Estado vacío */}
      {emergenciasFiltradas.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No hay emergencias {filtro}
        </div>
      )}
    </div>
  );
}
```

---

## 🚨 Manejo de Errores

### Escenarios Comunes

#### Error de Conexión Inicial

```typescript
const { isConnected, error, reconnect } = useWebSocket({
  onError: (err) => {
    console.error('Error inicial:', err);
    // El hook reintentará automáticamente
  }
});

// Mostrar al usuario después de múltiples intentos
if (!isConnected && error) {
  return (
    <div className="alert alert-error">
      <p>Error de conexión: {error}</p>
      <button onClick={reconnect}>Reintentar</button>
    </div>
  );
}
```

#### Desconexión del Servidor

```typescript
const { isConnected, reconnect } = useWebSocketEmergencias();

useEffect(() => {
  if (!isConnected) {
    console.log('Desconectado del servidor');
    // El hook intentará reconectar automáticamente
  }
}, [isConnected]);
```

#### Mensaje Inválido

```typescript
const { isConnected } = useWebSocket({
  onMessage: (msg) => {
    try {
      if (msg.type === 'nueva_solicitud' && msg.data) {
        // Procesar emergencia
      } else {
        console.warn('Tipo de mensaje desconocido:', msg.type);
      }
    } catch (err) {
      console.error('Error procesando mensaje:', err);
    }
  }
});
```

---

## 📊 Monitoreo y Debug

### Logging Automático

El hook imprime logs en consola:

```
📡 HTTP Request: GET /atender-emergencias/websocket-info
Status: 200
Response: { websocket_url: "/ws/emergencias" }

🔗 WebSocket URL obtenida del backend: ws://localhost:8000/ws/emergencias
🔗 Conectando a WebSocket: ws://localhost:8000/ws/emergencias

✅ WebSocket conectado!

[16:30:45] 🚨 Mensaje recibido:
{
  "type": "nueva_solicitud",
  "data": { ... }
}

🔌 WebSocket desconectado
🔄 Reconectando... intento 1/5
```

### Verificar Conexión en DevTools

```javascript
// En la consola del navegador:
// Abrir DevTools → Console

// Ver estado del hook en tiempo real
// (los logs del hook se mostrarán aquí)
```

---

## ✅ Checklist de Implementación

- [ ] Backend proporciona endpoint `/atender-emergencias/websocket-info`
- [ ] Backend proporciona WebSocket en URL especificada
- [ ] Frontend importa `useWebSocketEmergencias` en Dashboard
- [ ] WebSocket conecta al iniciar Dashboard
- [ ] Nuevas emergencias aparecen en tiempo real
- [ ] Indicador de conexión visible para el usuario
- [ ] Reconexión automática funciona
- [ ] Logs en consola muestran eventos
- [ ] No hay errores TypeScript/JavaScript
- [ ] Probado en navegador con DevTools abierto

---

## 🔗 Enlaces Útiles

- Documentación WebSocket: https://developer.mozilla.org/en-US/docs/Web/API/WebSocket
- React Hooks: https://react.dev/reference/react
- TypeScript Interfaces: https://www.typescriptlang.org/docs/handbook/2/objects.html
- WEBSOCKET_IMPLEMENTATION.md (este archivo padre)
