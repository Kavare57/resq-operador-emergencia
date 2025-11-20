# Guía de Contribución

¡Gracias por tu interés en contribuir a ResQ! Este documento proporciona pautas y directrices para contribuir al proyecto.

## 🚀 Cómo Contribuir

### 1. Fork y Clonar

```bash
git clone https://github.com/williampenaranda/resq-operador-emergencia.git
cd resq-operador-emergencia
```

### 2. Crear una Rama

```bash
git checkout -b feature/mi-nueva-funcionalidad
```

Nombres de rama recomendados:
- `feature/descripcion` - Para nuevas características
- `fix/descripcion` - Para arreglo de bugs
- `docs/descripcion` - Para cambios en documentación
- `refactor/descripcion` - Para refactorización de código

### 3. Realizar Cambios

- Sigue el estilo de código existente
- Añade tests para nuevas funcionalidades
- Actualiza la documentación si es necesario
- Asegúrate de que el código pase linting: `npm run lint`

### 4. Commit

```bash
git commit -m "feat: descripción clara del cambio"
```

Usa los siguientes prefijos:
- `feat:` - Nueva funcionalidad
- `fix:` - Arreglo de bug
- `docs:` - Cambios de documentación
- `style:` - Cambios de formato
- `refactor:` - Refactorización sin cambios funcionales
- `test:` - Cambios en tests
- `chore:` - Cambios en build o dependencias

### 5. Push y Pull Request

```bash
git push origin feature/mi-nueva-funcionalidad
```

Abre un Pull Request en GitHub con una descripción clara de:
- Qué cambios se realizaron
- Por qué se realizaron
- Cómo se pueden probar

## 📋 Estándares de Código

### TypeScript
- Siempre incluye tipos explícitos
- Evita `any`
- Usa interfaces para tipos complejos

### React
- Componentes funcionales con hooks
- Prop types documentados
- Separación de lógica y presentación

### CSS
- Usa Tailwind CSS para estilos
- Evita CSS en línea
- Mantén consistencia con la paleta de colores

## 🧪 Testing

Para nuevas características:
```bash
npm run lint
```

## 📝 Documentación

- Actualiza README.md si cambias funcionalidades
- Documenta funciones complejas
- Incluye ejemplos en comentarios

## 🐛 Reportar Bugs

Abre un issue con:
- Descripción clara del problema
- Pasos para reproducir
- Comportamiento esperado vs actual
- Screenshots si aplica
- Tu entorno (SO, navegador, versión de Node)

## 💡 Sugerencias de Mejora

- Abre un issue para discutir cambios mayores primero
- Describe claramente la mejora propuesta
- Explica beneficios

## 📞 Preguntas

- Abre una issue con la etiqueta `question`
- Sé lo más descriptivo posible

## ✅ Checklist antes de enviar PR

- [ ] He actualizado la rama `main`
- [ ] He corrido `npm run lint` exitosamente
- [ ] He probado los cambios localmente
- [ ] He actualizado la documentación si es necesario
- [ ] He añadido comentarios en código complejo
- [ ] Mis commits son claros y descriptivos

## 📄 Código de Conducta

Por favor respeta:
- Sé respetuoso en todas las comunicaciones
- No tolera acoso de ningún tipo
- Sé inclusivo y abierto a diferentes opiniones
- Enfócate en lo que es mejor para el proyecto

## 🙏 Agradecimientos

¡Agradecemos tu contribución! Todas las contribuciones son valiosas, grandes o pequeñas.

---

**Mantendores del proyecto:**
- **Ernesto Quintana** (@Kavare57)
