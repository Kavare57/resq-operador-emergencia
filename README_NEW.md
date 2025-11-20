# ResQ Emergency Operator Dashboard

Dashboard moderno para operadores de emergencia con React, Vite, TypeScript y Tailwind CSS.

## Características

- ✅ Autenticación JWT
- ✅ Dashboard en tiempo real
- ✅ Cola de emergencias
- ✅ Estado de operadores
- ✅ Gestión de asignaciones
- ✅ Interfaz moderna y responsiva
- ✅ Temas personalizables
- ✅ Cliente API con interceptadores

## Estructura del Proyecto

```
src/
├── components/
│   ├── common/                    # Componentes reutilizables
│   │   ├── Badge.tsx
│   │   ├── Card.tsx
│   │   ├── Error.tsx
│   │   ├── Loading.tsx
│   │   ├── NavBar.tsx
│   │   └── index.ts
│   └── dashboard/                # Componentes específicos del dashboard
│       ├── EmergenciaQueue.tsx
│       ├── OperatorStatus.tsx
│       └── index.ts
├── context/
│   └── AuthContext.tsx           # Contexto de autenticación
├── hooks/
│   ├── useApi.ts                 # Hooks personalizados para API
│   └── index.ts
├── pages/
│   ├── LoginPage.tsx
│   └── DashboardPage.tsx
├── services/
│   └── api.ts                    # Cliente API
├── types/
│   └── index.ts                  # Tipos TypeScript
├── utils/
│   └── helpers.ts                # Funciones auxiliares
├── App.tsx
├── main.tsx
└── index.css
```

## Instalación

1. **Clonar el repositorio**
```bash
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

Edita `.env` con tu configuración:
```
VITE_API_URL=http://localhost:8000/api
```

## Desarrollo

Iniciar el servidor de desarrollo:
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## Build

Compilar para producción:
```bash
npm run build
```

Preview de la build:
```bash
npm run preview
```

## Linting

Verificar el código:
```bash
npm run lint
```

## Tipos de Datos

### User (Operador)
```typescript
interface User {
  id: string
  email: string
  nombre: string
  apellido: string
  rol: 'operador' | 'admin' | 'supervisor'
  estado: 'activo' | 'inactivo' | 'en_descanso'
}
```

### Emergencia
```typescript
interface Emergencia {
  id: string
  numero_emergencia: string
  descripcion: string
  ubicacion: Ubicacion
  tipo: string
  prioridad: 'baja' | 'media' | 'alta' | 'crítica'
  estado: 'pendiente' | 'asignada' | 'en_progreso' | 'resuelta' | 'cancelada'
  fecha_creacion: string
  solicitante: Solicitante
  operador_asignado?: User
  ambulancias_asignadas: Ambulancia[]
}
```

### Ambulancia
```typescript
interface Ambulancia {
  id: string
  numero_unidad: string
  estado: 'disponible' | 'en_camino' | 'en_escena' | 'en_transporte'
  operador: User
  ubicacion: Ubicacion
  tipo: 'basica' | 'intermedia' | 'avanzada'
}
```

## Componentes

### Componentes Comunes
- **Badge**: Etiquetas de estado y prioridad
- **Card**: Contenedor de contenido
- **Error**: Pantalla de error con reintentos
- **Loading**: Indicador de carga
- **NavBar**: Barra de navegación superior

### Componentes del Dashboard
- **EmergenciaQueue**: Cola de emergencias ordenada por prioridad
- **OperatorStatus**: Estado de operadores en servicio

## Hooks Personalizados

### useApi
Hook para solicitudes GET:
```typescript
const { data, loading, error, fetchData } = useApi<T>('/endpoint')
```

### useMutation
Hook para solicitudes POST, PUT, PATCH, DELETE:
```typescript
const { data, loading, error, mutate } = useMutation<T>()
await mutate('post', '/endpoint', { data })
```

## Funciones Auxiliares

- `formatDate()`: Formato de fecha y hora
- `getStatusColor()`: Color según estado
- `getPriorityColor()`: Color según prioridad
- `translateStatus()`: Traducción de estados
- `calculateTimeDifference()`: Diferencia de tiempo relativa

## Paleta de Colores

- **Primario**: Blue (#0ea5e9)
- **Secundario**: Slate (#475569)
- **Éxito**: Green (#10b981)
- **Advertencia**: Amber (#f59e0b)
- **Error**: Red (#ef4444)
- **Info**: Blue (#3b82f6)

## Autenticación

La autenticación se maneja mediante JWT. El token se almacena en `localStorage` como `access_token`.

El contexto `AuthContext` proporciona:
- `user`: Usuario autenticado
- `token`: Token JWT
- `isAuthenticated`: Estado de autenticación
- `isLoading`: Estado de carga
- `login()`: Función de login
- `logout()`: Función de logout

## API Cliente

El cliente API (`apiClient`) maneja:
- Interceptores de solicitud (agregar token)
- Interceptores de respuesta (manejo de errores 401)
- Métodos: GET, POST, PUT, PATCH, DELETE
- Manejo automático de errores

Endpoints:
- `POST /auth/login`: Login de usuario
- `GET /emergencias`: Obtener lista de emergencias
- `PUT /emergencias/{id}/asignar`: Asignar emergencia
- `PUT /emergencias/{id}/estado`: Actualizar estado

## Tecnologías

- **React** 18.3.1
- **Vite** 5.0.8
- **TypeScript** 5.3.3
- **Tailwind CSS** 3.4.1
- **React Router** 6.20.0
- **Axios** 1.6.2
- **JWT Decode** 3.1.2

## Configuración de Tailwind

Los colores están definidos en `tailwind.config.js`. Para personalizar, edita los valores en `theme.extend.colors`.

## ESLint

El proyecto incluye ESLint configurado. Para resolver problemas:
```bash
npm run lint
```

## Contribuir

1. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
2. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
3. Push a la rama (`git push origin feature/AmazingFeature`)
4. Abre un Pull Request

## Licencia

Este proyecto es parte de ResQ - Sistema de Gestión de Emergencias.

## Soporte

Para reportar problemas o sugerencias, contacta al equipo de desarrollo.
