# 🚀 Publicar en GitHub

Instrucciones paso a paso para publicar este repositorio en GitHub.

## Paso 1: Crear Repositorio en GitHub

1. Ve a https://github.com/new
2. Completa los campos:
   - **Repository name:** `resq-operador-emergencia`
   - **Description:** "Dashboard web para operadores del Centro Regulador de Urgencias (CRUE)"
   - **Public** (selecciona según preferencia)
   - ⚠️ **NO** inicialices con README (ya tenemos uno)
   - ⚠️ **NO** inicialices con .gitignore (ya tenemos uno)
   - ⚠️ **NO** inicialices con licencia (ya tenemos una)
3. Click en "Create repository"

## Paso 2: Conectar Repositorio Local con GitHub

```bash
# Ir al directorio del proyecto
cd C:\Users\USER\Desktop\resq-operador-emergencia

# Agregar remoto (reemplaza Kavare57 con tu usuario si es diferente)
git remote add origin https://github.com/Kavare57/resq-operador-emergencia.git

# Renombrar rama a 'main' (opcional pero recomendado)
git branch -M main

# Hacer push inicial
git push -u origin main
```

## Paso 3: Verificar en GitHub

1. Recarga la página del repositorio
2. Verifica que todos los archivos están presentes
3. El README debe mostrarse automáticamente

## Paso 4: Configuración Recomendada en GitHub

### Settings → General
- ✅ Habilitar "Discussions" si deseas comunicación
- ✅ Habilitar "Sponsorships" si aplica

### Settings → Branches
1. Click "Add rule"
2. Branch name pattern: `main`
3. Configura protecciones:
   - ✅ Require pull request reviews before merging
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - ✅ Include administrators

### Settings → Secrets and variables (para CI/CD)
1. Click "New repository secret"
2. Agregar variables de entorno para builds:
   - `VITE_API_URL`
   - `VITE_WEBSOCKET_URL`
   - `VITE_LIVEKIT_URL`

### Settings → Pages (para GitHub Pages)
1. Source: Deploy from a branch
2. Branch: gh-pages (si deseas deployar la app)
3. Crea archivo `.github/workflows/build.yml` para builds automáticos

## Paso 5: Topics (Etiquetas)

En la página principal del repositorio, agrega topics:
- `react`
- `typescript`
- `vite`
- `emergency-dispatch`
- `tailwindcss`
- `websocket`
- `livekit`
- `resq`

## Paso 6: Descripción Corta

En la página principal, agrega descripción:
"Dashboard web para operadores de emergencias con videollamadas en tiempo real"

## 🔗 Configuración de Colaboradores

Para agregar colaboradores:
1. Settings → Collaborators
2. Click "Add people"
3. Busca por username de GitHub
4. Selecciona rol (Collaborator, Maintainer, etc)

## 📋 Checklist Final

- [ ] Repositorio creado en GitHub
- [ ] Remoto conectado localmente
- [ ] Push inicial exitoso
- [ ] Todos los archivos visibles en GitHub
- [ ] README se muestra correctamente
- [ ] .gitignore está funcionando
- [ ] Ramas protegidas configuradas
- [ ] Topics agregados
- [ ] Descripción completada
- [ ] Colaboradores invitados (si aplica)

## 🚨 Troubleshooting

### "fatal: remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/Kavare57/resq-operador-emergencia.git
```

### "Permission denied (publickey)"
- Verifica tus keys SSH: `ssh -T git@github.com`
- Si falta configuración, genera nueva key:
```bash
ssh-keygen -t ed25519 -C "equintanap@unicartagena.edu.co"
```

### Push rechazado
```bash
# Fuerza el push (úsalo con cuidado)
git push -u origin main --force
```

## 📚 Documentación Útil

- [GitHub Docs - Creating a Repository](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-new-repository)
- [GitHub Docs - Branch Protection Rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches)
- [GitHub Docs - Managing Collaborators](https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-personal-account-on-github/managing-access-to-your-personal-repositories)

---

**¡Tu repositorio estará listo en GitHub en minutos!** 🎉
