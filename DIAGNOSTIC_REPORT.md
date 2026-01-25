# REPORTE DE DIAGNÓSTICO - Backend no arranca

## PROBLEMA
Backend crashea con: `SyntaxError: Unexpected token '}' at file:///app/src/server.js:29`

## VERIFICACIONES REALIZADAS

### 1. Código en Git (CORRECTO ✅)
- Último commit: `af98f0f REWRITE: server.js limpio sin caracteres especiales`
- Rama actual: `main`
- Estado: Sin cambios pendientes
- Contenido línea 29: `if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'undefined') {` (VÁLIDO)

### 2. Archivo local (CORRECTO ✅)
- server.js reescrito completamente en ASCII puro
- Sin emojis, sin acentos, sin caracteres especiales
- Sintaxis validada

### 3. package.json (CORRECTO ✅)
- compression: ^1.7.4 incluido
- ioredis: ^5.3.2 incluido
- Todas las dependencias presentes

## HIPÓTESIS DEL PROBLEMA

### Hipótesis 1: Cloud Run usa rama equivocada ⚠️
Cloud Run puede estar configurado para desplegar desde una rama diferente a `main`.

### Hipótesis 2: Cache de Cloud Build 🔄
Google Cloud Build puede estar usando cache de builds anteriores y no reconstruyendo desde cero.

### Hipótesis 3: Configuración de source deploy ❓
La configuración de "cloud-run-source-deploy" puede estar apuntando a un commit específico viejo.

## SOLUCIONES PROPUESTAS

### Solución A: Verificar configuración de Cloud Run
1. Ir a Cloud Run Console
2. Click en "stsweb-backend"
3. Click en "Fuente" (Source)
4. Verificar:
   - ¿Qué repositorio está conectado?
   - ¿Qué rama usa?
   - ¿Qué commit está usando?

### Solución B: Forzar rebuild sin cache
1. Editar e implementar nueva revisión
2. En "Configuración" -> "Variables de entorno"
3. Agregar: `FORCE_REBUILD=true` o cambiar valor existente
4. Esto forzará un rebuild completo

### Solución C: Deploy manual con gcloud (RECOMENDADO)
Si tienes gcloud CLI instalado:
```bash
cd c:\Users\abadiola\stm-web\backend
gcloud builds submit --tag gcr.io/ticketswarcotrafficspain/stsweb-backend
gcloud run deploy stsweb-backend \
  --image gcr.io/ticketswarcotrafficspain/stsweb-backend \
  --region europe-west1 \
  --allow-unauthenticated
```

### Solución D: Desconectar y reconectar repositorio
1. En Cloud Run, desconectar el repositorio actual
2. Volver a conectar desde cero
3. Seleccionar rama main explícitamente
4. Deploy desde cero

## PRÓXIMOS PASOS RECOMENDADOS
1. PRIMERO: Verificar qué está en la pestaña "Fuente" de Cloud Run
2. SEGUNDO: Ver si Cloud Run apunta a commit af98f0f (el último)
3. TERCERO: Si apunta a commit viejo, forzar actualización
