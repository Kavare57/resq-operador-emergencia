# Política de Seguridad

## Reportar Vulnerabilidades

Si descubres una vulnerabilidad de seguridad, **POR FAVOR NO** la reportes públicamente en GitHub Issues.

En cambio, envía un correo a: `security@resq-app.com` (o usa el email del responsable)

Incluye:
- Descripción detallada de la vulnerabilidad
- Pasos para reproducir
- Impacto potencial
- Cualquier prueba de concepto (PoC) si tienes

## Seguridad en Desarrollo

### 🔐 Tokens JWT

- Nunca hardcodear tokens en el código
- Siempre usar variables de entorno para secretos
- Los tokens se guardan en localStorage (considera sessionStorage para mayor seguridad)
- Implementar renovación automática de tokens

### 🛡️ CORS

- Validar que las peticiones provengan de orígenes permitidos
- Configurar CORS en el backend apropiadamente

### 🔗 Variables de Entorno

```env
# ✅ CORRECTO - Variables sensibles en .env
VITE_API_URL=http://localhost:8000

# ❌ INCORRECTO - Hardcodear secretos
const API_KEY = "sk_live_xxxxxx";
```

### 📝 Dependencias

- Mantener dependencias actualizadas
- Revisar `npm audit` regularmente
- Usar versiones específicas en producción

```bash
npm audit
npm audit fix
```

### 🔒 Comunicación Segura

- Usar HTTPS en producción
- Usar WSS (WebSocket Secure) para WebSockets
- Validar certificados SSL

## Mejores Prácticas

### ✅ Debe Hacer

- Usar HTTPS/WSS en producción
- Validar entrada de usuarios
- Usar tokens JWT con expiración
- Mantener dependencias actualizadas
- Hacer logging de eventos de seguridad
- Usar Content Security Policy (CSP)

### ❌ No Debe Hacer

- Almacenar contraseñas en plain text
- Loguear información sensitiva (tokens, passwords)
- Permitir XSS (cross-site scripting)
- Permitir CSRF (cross-site request forgery)
- Exponer información de error sensitiva
- Hardcodear API keys o secretos

## Checklist de Seguridad Antes de Producción

- [ ] Todos los secretos están en variables de entorno
- [ ] HTTPS está habilitado
- [ ] CORS está configurado correctamente
- [ ] Tokens JWT tienen expiración
- [ ] Validación de entrada está implementada
- [ ] Logs no contienen información sensitiva
- [ ] Dependencies están actualizadas
- [ ] npm audit no muestra vulnerabilidades críticas
- [ ] CSP headers están configurados
- [ ] HSTS está habilitado

## Respuesta a Incidentes

Si se descubre una vulnerabilidad:

1. **Confirmar** - Verificar que es válida
2. **Aislar** - Limitar el acceso si es necesario
3. **Notificar** - Contactar al equipo de seguridad
4. **Parchar** - Crear y testear fix
5. **Publicar** - Releazar actualización
6. **Comunicar** - Informar a usuarios si fue crítica

## Referencias

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8949)
- [React Security](https://snyk.io/learn/react-security/)
- [Node.js Security](https://nodejs.org/en/docs/guides/security/)

## Soporte

Para preguntas de seguridad o clarificaciones, contacta al equipo de desarrollo.
