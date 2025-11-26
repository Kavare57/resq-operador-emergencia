# Guía de Desarrollo

Instrucciones detalladas para configurar el entorno de desarrollo.

## 📋 Requisitos Previos

- **Node.js** 18.0.0 o superior
- **npm** 8.0.0 o superior (incluido con Node.js)
- **Git** 2.30.0 o superior
- **Editor recomendado:** VS Code con extensiones:
  - ES7+ React/Redux/React-Native snippets
  - Tailwind CSS IntelliSense
  - TypeScript Vue Plugin (Volar)

## 🔧 Configuración Inicial

### 1. Clonar el Repositorio

```bash
git clone https://github.com/williampenaranda/resq-operador-emergencia.git
cd resq-operador-emergencia
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Variables de Entorno

```bash
cp .env.example .env
```

Edita `.env` con tu configuración local:

```env
# Desarrollo local
VITE_API_URL=http://localhost:8000
VITE_WEBSOCKET_URL=ws://localhost:8000/ws

# Usa el LiveKit cloud o local si tienes uno
VITE_LIVEKIT_URL=wss://resq-poyiq9j7.livekit.cloud
```

### 4. Verificar Instalación

```bash
npm run lint
```

## 🚀 Desarrollo

### Iniciar Servidor de Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en: `http://localhost:3000`

El servidor tiene:
- ♻️ **Hot Module Replacement (HMR)** - Recarga en tiempo real
- 🐛 **Source Maps** - Debugging fácil
- ⚡ **Fast Refresh** - Los cambios en React se reflejan al instante

### Estructura de Directorios Durante Desarrollo

```
src/
├── components/
│   ├── common/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Navigation.tsx
│   └── dashboard/
│       ├── EmergenciaCard.tsx
│       ├── ColaEmergencias.tsx
│       └── EstadisticasPanel.tsx
├── pages/
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   └── LlamadaPage.tsx
├── context/
│   ├── AuthContext.tsx
│   ├── AuthProvider.tsx
│   ├── EmergenciaContext.tsx
│   └── EmergenciaProvider.tsx
├── hooks/
│   ├── useApi.ts
│   ├── useAuth.ts
│   ├── useWebSocket.ts
│   └── useEmergencias.ts
├── services/
│   ├── api.ts
│   ├── emergenciaService.ts
│   ├── loginService.ts
│   └── websocket.ts
├── types/
│   ├── auth.ts
│   ├── emergencia.ts
│   ├── operador.ts
│   └── api.ts
├── utils/
│   ├── tokenUtils.ts
│   ├── formatters.ts
│   └── validators.ts
├── App.tsx
├── main.tsx
└── index.css
```

## 🧪 Linting y Formateo

### Verificar Código

```bash
npm run lint
```

El proyecto usa **ESLint** con:
- TypeScript support
- React best practices
- Unused import detection

### Arreglar Errores Automáticamente

```bash
npm run lint -- --fix
```

## 🔄 Flujo de Desarrollo Típico

### 1. Crear Nueva Funcionalidad

```bash
# Crear rama
git checkout -b feature/nueva-funcionalidad

# Hacer cambios
# Los cambios se reflejan en tiempo real con HMR

# Ver console de navegador (F12) para mensajes
```

### 2. Trabajar con TypeScript

```tsx
// Asegúrate de incluir tipos
interface Props {
  id: string;
  onClose: () => void;
}

export const MyComponent: React.FC<Props> = ({ id, onClose }) => {
  // ...
};
```

### 3. Comunicación con Backend

```tsx
// En services/api.ts
export const fetchEmergencias = async () => {
  const response = await axios.get('/emergencias');
  return response.data;
};

// En componentes
const { data } = useApi('/emergencias');
```

### 4. WebSocket en Tiempo Real

```tsx
// En hooks/useWebSocket.ts
const ws = useWebSocket('ws://localhost:8000/ws');

ws.on('nueva_emergencia', (data) => {
  // Manejar nueva emergencia
});
```

## 🔍 Debugging

### Browser DevTools

1. Abre la consola del navegador (F12)
2. Vue React DevTools extension (recomendado)
3. Redux DevTools si usas Redux

### Errores Comunes

#### "Cannot find module"
```bash
npm install
```

#### "VITE_* is undefined"
Verifica que `.env` existe y tiene las variables necesarias

#### WebSocket no conecta
```bash
# Verifica que el backend está corriendo
# y VITE_WEBSOCKET_URL es correcto
```

## 📦 Build para Producción

```bash
npm run build
```

Genera carpeta `dist/` con:
- JavaScript minificado
- CSS optimizado
- Assets optimizados

Para probar localmente:
```bash
npm run preview
```

## 🔐 Seguridad

### Tokens JWT

```tsx
// Se almacenan en localStorage
localStorage.setItem('token', jwtToken);

// Se incluyen automáticamente en headers
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
```

### Variables Sensitivas

- NUNCA commits `.env` files
- NUNCA pongas secretos en el código
- Usa `.env` y `.env.example`

## 📚 Recursos Útiles

### Documentación
- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com)
- [Vite Guide](https://vitejs.dev)
- [React Router](https://reactrouter.com)

### Herramientas
- [VS Code](https://code.visualstudio.com)
- [GitKraken](https://www.gitkraken.com) - Git UI
- [Postman](https://www.postman.com) - API testing

## 🚨 Troubleshooting

### Problema: "Port 5173 already in use"
```bash
# Matar proceso
lsof -i :5173
kill -9 <PID>

# O usar puerto diferente
npm run dev -- --port 5174
```

### Problema: "Module not found"
```bash
# Limpiar cache
rm -rf node_modules package-lock.json
npm install
```

### Problema: "HMR not working"
```bash
# Reiniciar servidor
# Ctrl+C para parar
npm run dev
```

## 📝 Notas

- Los cambios se reflejan al instante con HMR
- Los tipos TypeScript se validan en tiempo de desarrollo
- ESLint se ejecuta automáticamente en algunos IDEs
- Los errores de linting bloquean el build para producción

¡Happy coding! 🚀
