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
- ✅ **Cola de emergencias** - Visualización en tiempo real de solicitudes
- ✅ **Videollamadas** - Integración con LiveKit para comunicación
- ✅ **Gestión de recursos** - Asignación de ambulancias y equipos
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
├── components/          # Componentes reutilizables
│   ├── common/         # Componentes comunes (Header, Footer, etc)
│   └── dashboard/      # Componentes del dashboard
├── pages/              # Páginas principales
│   ├── LoginPage.tsx
│   └── DashboardPage.tsx
├── context/            # Context API para estado global
│   ├── AuthContext.tsx
│   └── EmergenciaContext.tsx
├── hooks/              # Hooks personalizados
│   ├── useApi.ts
│   ├── useWebSocket.ts
│   └── useWebSocketEmergencias.ts
├── services/           # Servicios de API y externos
│   ├── api.ts
│   ├── emergenciaService.ts
│   ├── loginService.ts
│   ├── operadorService.ts
│   └── websocket.ts
├── types/              # Tipos TypeScript
├── utils/              # Funciones utilitarias
├── App.tsx             # Componente principal
├── main.tsx            # Punto de entrada
└── index.css           # Estilos globales
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

## 🔗 API Endpoints

### Autenticación
- `POST /auth/login` - Login de operador
- `POST /auth/refresh` - Refrescar token

### Emergencias
- `GET /emergencias` - Listar emergencias
- `POST /emergencias/{id}/asignar` - Asignar ambulancia
- `PUT /emergencias/{id}/estado` - Actualizar estado

### Operadores
- `GET /operadores/me` - Datos del operador actual
- `GET /operadores/{id}` - Datos de un operador

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

### Cambios Recientes
- Refactor de estructura de directorios
- Mejoría en manejo de WebSocket
- Integración con LiveKit para videollamadas

### Problemas Conocidos
- livekit_client 2.5.3 tiene issues en Android (Flutter)
- WebSocket puede desconectarse en conexiones lentas

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
