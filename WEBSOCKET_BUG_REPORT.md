# 🔴 REPORTE DE PROBLEMA - WebSocket Endpoint `/ws/emergencias`

## Resumen del Problema
El endpoint WebSocket `/ws/emergencias` cierra la conexión inmediatamente después de aceptarla, sin mantenerla abierta para recibir nuevas solicitudes en tiempo real.

---

## 📊 Análisis Técnico

### Flujo Actual (PROBLEMÁTICO):
```
1. Cliente conecta a ws://192.168.1.6:8000/ws/emergencias
2. Servidor acepta conexión ✅
3. Servidor envía mensaje de bienvenida: {"type": "connection", "message": "Conectado!..."}
4. Servidor entra en while True esperando datos del cliente
5. Cliente no envía nada (es servidor-push, no bidireccional) ❌
6. Servidor ejecuta: await websocket.receive_text()
7. Cliente no envía datos, entonces receive_text() genera excepción
8. La excepción es atrapada en except Exception: break
9. Loop se rompe y conexión se cierra
10. Cliente intenta reconectar → CICLO INFINITO
```

### Logs del Backend (problema evidenciado):
```
127.0.0.1:56308 - "WebSocket /ws/emergencias" [accepted]
INFO:     connection open
INFO:     connection closed
INFO:     127.0.0.1:56312 - "WebSocket /ws/emergencias" [accepted]
INFO:     connection open
INFO:     connection closed
```

---

## 🔍 Raíz del Problema

**Líneas problemáticas en `src/api/websocket.py` (líneas 110-118):**

```python
while True:
    try:
        data = await websocket.receive_text()  # ← AQUÍ ESTÁ EL PROBLEMA
        # El cliente NUNCA va a enviar texto
        # Esto genera una excepción cuando se desconecta
    except Exception:
        break  # ← Cierra el loop
```

### Por qué falla:

1. **El patrón es incorrecto**: El endpoint espera que el cliente envíe mensajes constantemente (bidireccional)
2. **El uso previsto es unidireccional**: Solo el servidor debe enviar notificaciones al cliente cuando hay nuevas solicitudes
3. **Sin timeout definido**: Si el cliente nunca envía nada, `receive_text()` espera indefinidamente
4. **Manejo de excepciones genérico**: `except Exception: break` atrapa cualquier excepción y cierra la conexión

---

## ✅ Soluciones Propuestas

### Opción 1: Permitir conexiones pasivas (RECOMENDADO)
El servidor debería:
- Aceptar la conexión
- Enviar el mensaje de bienvenida
- Esperar sin cerrar la conexión aunque no reciba datos
- Tener un mecanismo para mantener la conexión viva (keep-alive/ping-pong)
- Enviar notificaciones cuando lleguen nuevas solicitudes de emergencia

```python
@websocket_router.websocket("/emergencias")
async def websocket_emergencia(websocket: WebSocket):
    await manager_emergencias.connect(websocket)
    try:
        # Enviar mensaje de bienvenida
        await manager_emergencias.send_personal_message(
            json.dumps({
                "type": "connection",
                "message": "Conectado! listo para recibir emergencias"
            }),
            websocket
        )
        
        # Mantener la conexión abierta sin esperar mensajes del cliente
        # Solo enviar notificaciones cuando hay nuevas solicitudes
        try:
            while True:
                # Usar un timeout para no bloquear indefinidamente
                # o usar asyncio.sleep para mantener la conexión activa
                await asyncio.sleep(60)  # Verificar cada 60 segundos
        except Exception:
            pass
                
    except WebSocketDisconnect:
        manager_emergencias.disconnect(websocket)
```

### Opción 2: Implementar mecanismo de Ping-Pong
- Cliente envía `ping` cada 30-60 segundos
- Servidor responde con `pong`
- Esto mantiene la conexión activa

Requeriría cambios en el cliente también.

### Opción 3: Usar eventos/broadcast adecuadamente
Integrar el WebSocket con el sistema de eventos del backend para que:
- Cuando se reciba una nueva solicitud de emergencia
- Se notifique a TODOS los clientes conectados al WebSocket
- Sin necesidad de que el cliente envíe nada

---

## 🎯 Impacto

- ❌ **Actual**: Las conexiones duran < 1 segundo
- ✅ **Esperado**: Las conexiones deben durar hasta que el cliente se desconecte manualmente
- ❌ **Cliente sufre**: Ciclo infinito de reconexiones
- ❌ **Terminal saturado**: Logs constantemente llenos de reconexiones

---

## 📋 Checklist para el Backend

- [ ] Cambiar la lógica de `while True` en `/ws/emergencias`
- [ ] Permitir conexiones pasivas (sin esperar texto del cliente)
- [ ] Implementar keep-alive si es necesario
- [ ] Probar que la conexión se mantiene abierta indefinidamente
- [ ] Validar que se envían notificaciones cuando llegan nuevas solicitudes
- [ ] Documentar el protocolo esperado para los clientes

---

## 📞 Para el Contacto

**A**: Encargado del Backend  
**Asunto**: Bug crítico - WebSocket `/ws/emergencias` cierra inmediatamente  
**Prioridad**: 🔴 Alta (bloquea funcionalidad en tiempo real del operador)

---

**Reportado por**: Sistema Frontend (ResQ Operador)  
**Fecha**: 2025-11-16  
**Estado**: ⏸️ BLOQUEANTE - Se desactivó WebSocket temporalmente, usando polling en su lugar
