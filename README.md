# ResQ - Operador de Emergencia (Web)

Dashboard web para operadores del Centro Regulador de Urgencias (CRUE) del sistema **ResQ**.

## 📋 Descripción

ResQ Operador de Emergencia es una interfaz web diseñada para que los operadores de emergencia puedan:
- Recibir y gestionar solicitudes de ambulancia en tiempo real
- Comunicarse con solicitantes a través de videollamadas
- Asignar recursos y ambulancias a emergencias
- Monitorear el estado de las solicitudes en tiempo real

## 🎯 Características Principales

- ✅ **Autenticación segura** - Login con JWT y sesiones protegidas
- ✅ **Dashboard interactivo** - Interfaz moderna con Tailwind CSS
- ✅ **Cola de emergencias en tiempo real** - Websocket para actualizaciones instantáneas
- ✅ **Videollamadas LiveKit** - Comunicación segura con solicitantes
- ✅ **Valoración de emergencias** - Formulario de evaluación integrado
- ✅ **Sistema de despacho de ambulancias** - Mapa interactivo con ubicaciones y distancias
- ✅ **Gestión de recursos** - Asignación automática de ambulancias más cercanas
- ✅ **Responsive Design** - Funciona en desktop, tablet y móvil

## 🛠️ Stack Tecnológico

### Frontend
- **React 18** - Interfaz de usuario
- **TypeScript** - Tipado estático
- **Vite** - Herramienta de construcción rápida
- **Tailwind CSS** - Estilos utility-first
- **React Router v6** - Enrutamiento
- **Axios** - Cliente HTTP

### Desarrollo
- **ESLint** - Linting de código
- **TypeScript** - Compilador y tipado
- **PostCSS** - Procesamiento de CSS

### Backend (API Externa)
- FastAPI (Python)
- WebSockets para actualizaciones en tiempo real
- LiveKit para videollamadas

## 📦 Instalación

### Requisitos Previos
- Node.js 18+ 
- npm o yarn

### Pasos

1. **Clonar el repositorio**
```bash
git clone https://github.com/williampenaranda/resq-operador-emergencia.git
cd resq-operador-emergencia
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
```

Edita `.env` con tus configuraciones:
```env
VITE_API_URL=http://localhost:8000
VITE_WEBSOCKET_URL=ws://localhost:8000/ws
VITE_LIVEKIT_URL=wss://resq-poyiq9j7.livekit.cloud
```

4. **Iniciar desarrollo**
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 🚀 Desarrollo

### Comandos Disponibles

```bash
# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build

# Preview de producción localmente
npm run preview

# Verificar código (linting)
npm run lint
```

### Estructura del Proyecto

```
src/
├── components/              # Componentes reutilizables
│   ├── common/             # Componentes comunes (Header, Footer, etc)
│   ├── dashboard/          # Dashboard con emergencias en vivo
│   ├── despacho/           # Sistema de despacho de ambulancias
│   │   ├── DespachadorAmbulancia.tsx  # Interfaz principal de despacho
│   │   └── MapaAmbulancia.tsx         # Mapa interactivo con Leaflet
│   └── sala/               # Componentes de sala LiveKit
│       ├── LlamadaLiveKit.tsx         # Videollamada con solicitante
│       ├── FormularioValoracion.tsx   # Evaluación de emergencia
│       ├── SolicitudEmergencia.tsx    # Datos de la solicitud
│       └── FormularioValoracionEnLlamada.tsx
├── pages/                   # Páginas principales
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── SalaLiveKitPage.tsx
│   └── DespachadorPage.tsx
├── context/                 # Context API para estado global
│   ├── AuthContext.tsx
│   └── EmergenciaContext.tsx
├── hooks/                   # Hooks personalizados
│   └── useWebSocketEmergencias.ts
├── services/                # Servicios de API y externos
│   ├── api.ts              # Cliente Axios con interceptores
│   ├── websocketClient.ts  # Gestor de conexiones WebSocket
│   ├── logger.ts           # Sistema de logging
│   ├── emergenciaService.ts
│   ├── loginService.ts
│   ├── operadorService.ts
│   └── ambulanciaService.ts
├── types/                   # Tipos TypeScript
├── utils/                   # Funciones utilitarias
├── App.tsx                  # Componente principal
├── main.tsx                 # Punto de entrada
└── index.css                # Estilos globales
```

## 🔐 Autenticación

La aplicación utiliza JWT para autenticación:

1. El usuario se autentica en `/login`
2. El backend retorna un JWT token
3. El token se almacena en localStorage
4. Las peticiones posteriores incluyen el token en el header `Authorization: Bearer <token>`

## 🔌 WebSocket

La aplicación se conecta a WebSocket para recibir actualizaciones en tiempo real:
- Nuevas solicitudes de emergencia
- Cambios de estado en solicitudes
- Notificaciones de operadores

## 📞 LiveKit Integration

Para videollamadas con solicitantes:
- Se usa LiveKit Cloud (wss://resq-poyiq9j7.livekit.cloud)
- Los tokens se generan en el backend
- La conexión es manejada por la librería livekit_client

## 🎨 Temas y Colores

El proyecto usa una paleta de colores personalizada en `src/core/constants/colors.ts`:
- Primary: Azul ResQ
- Secondary: Tonos neutrales
- Success/Warning/Error: Estados

## 🎯 Flujo de Trabajo

El operador de emergencia sigue este flujo:

1. **Autenticación** - Login con credenciales
2. **Dashboard** - Visualiza emergencias en tiempo real (WebSocket)
3. **Llamada con Solicitante** - Se conecta vía LiveKit para evaluar la emergencia
4. **Valoración** - Completa el formulario de evaluación (síntomas, localización, etc.)
5. **Despacho de Ambulancia** - Sistema de mapa interactivo:
   - Muestra ambulancias disponibles
   - Calcula distancia automática (Haversine)
   - Selecciona la más cercana
   - Asigna operadores (ambulancia y emergencia)
6. **Seguimiento** - Monitorea el estado de la orden de despacho

## 🔗 API Endpoints

### Autenticación
- `POST /auth/login` - Login de operador

### Emergencias
- `GET /emergencias` - Listar emergencias (WebSocket para actualizaciones)
- `POST /valoraciones` - Registrar valoración de emergencia
- `POST /despachar-ambulancia` - Emitir orden de despacho
- `PUT /salas` - Unirse a sala de videollamada

### Ambulancias
- `GET /ambulancias` - Listar ambulancias disponibles
- `GET /ambulancias/{id}` - Detalles de una ambulancia

### Operadores
- `GET /operadores/me` - Datos del operador actual

## 🗺️ Características del Sistema de Despacho

- **Mapa Interactivo** - Visualización con Leaflet
- **Iconos Personalizados** - Emergencias (naranja 🚨) y Ambulancias (azul 🚑)
- **Cálculo de Distancias** - Fórmula Haversine para distancia real
- **Auto-selección** - Ambulancia más cercana seleccionada automáticamente
- **Panel de Información** - Detalles de ambulancia seleccionada
- **Despacho en Uno Click** - Asignación rápida de recursos


## 🚨 Troubleshooting

### "VITE_API_URL is not defined"
Asegúrate de crear el archivo `.env` con las variables necesarias.

### WebSocket no conecta
Verifica que `VITE_WEBSOCKET_URL` sea correcto y el backend esté corriendo.

### Videollamadas no funcionan
Comprueba que:
- LiveKit Cloud esté disponible
- El token sea válido
- Los permisos de micrófono estén otorgados

## 📝 Notas de Desarrollo

### Cambios Recientes (v1.1.0)
- ✨ Sistema completo de despacho de ambulancias
- ✨ Integración de mapa interactivo con Leaflet
- ✨ Cálculo automático de distancias (Haversine)
- ✨ Auto-selección de ambulancia más cercana
- ✨ Componentes de valoración en llamada
- ✨ Sistema de WebSocket mejorado
- ✨ Logging centralizado para debugging
- 🔧 Refactorización de servicios API
- 📦 Nuevos tipos TypeScript para entidades

### Problemas Conocidos
- livekit_client 2.5.3 tiene issues en Android (Flutter)
- WebSocket puede desconectarse en conexiones lentas
- En redes con alta latencia, el mapa puede tardar en renderizar

## 🤝 Contribuciones

Para contribuir:
1. Fork el repositorio
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es parte de ResQ y está bajo licencia privada.

## 👥 Autores

- **Ernesto Quintana** - Desarrollo principal

## 📞 Soporte

Para reportar bugs o solicitar features, abre un issue en GitHub.

## 🔗 Enlaces Relacionados

- [Backend ResQ](https://github.com/williampenaranda/backend-resq)
- [App Mobile ResQ (Flutter)](https://github.com/williampenaranda/ResQ)
- [Documentación de LiveKit](https://docs.livekit.io)
- [Documentación de React](https://react.dev)

## 📊 Estado del Proyecto

**Versión:** 0.1.0  
**Estado:** En Desarrollo 🚧  
**Última actualización:** Noviembre 2025
