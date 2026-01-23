# ====================================
# SCRIPT DE DEPLOYMENT COMPLETO v2.1
# ====================================
# PowerShell Script para Windows
# 
# PREREQUISITOS:
# - gcloud CLI instalado
# - Node.js y npm instalados
# - Credenciales de GCP configuradas
# 
# USO: .\deploy-v2.1.ps1
# ====================================

$ErrorActionPreference = "Stop"

Write-Host "╔═══════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                   ║" -ForegroundColor Cyan
Write-Host "║     🚀 DEPLOYMENT PORTAL SAT v2.1 🚀              ║" -ForegroundColor Cyan
Write-Host "║                                                   ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Variables
$PROJECT_ID = "swarco-ops"
$REGION = "europe-west1"
$BACKEND_SERVICE = "stsweb-backend"
$FRONTEND_SERVICE = "stsweb"

Write-Host "📋 Configuración:" -ForegroundColor Blue
Write-Host "   Project: $PROJECT_ID"
Write-Host "   Region: $REGION"
Write-Host "   Backend: $BACKEND_SERVICE"
Write-Host "   Frontend: $FRONTEND_SERVICE"
Write-Host ""

# Función para pausar
function Pause {
    Write-Host ""
    Write-Host "Presiona ENTER para continuar o Ctrl+C para cancelar..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    Write-Host ""
}

# ====================================
# PASO 1: VERIFICAR PREREQUISITOS
# ====================================
Write-Host "════════════════════════════════════════════════════" -ForegroundColor Blue
Write-Host "PASO 1/6: Verificando prerequisitos..." -ForegroundColor Blue
Write-Host "════════════════════════════════════════════════════" -ForegroundColor Blue
Write-Host ""

# Verificar gcloud
try {
    $gcloudVersion = gcloud --version 2>&1
    Write-Host "✅ gcloud CLI instalado" -ForegroundColor Green
} catch {
    Write-Host "❌ gcloud CLI no encontrado" -ForegroundColor Red
    Write-Host "Instalar desde: https://cloud.google.com/sdk/docs/install"
    exit 1
}

# Verificar node
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js instalado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js no encontrado" -ForegroundColor Red
    exit 1
}

# Verificar npm
try {
    $npmVersion = npm --version
    Write-Host "✅ npm instalado: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm no encontrado" -ForegroundColor Red
    exit 1
}

# Verificar proyecto de GCP
$currentProject = gcloud config get-value project 2>$null
Write-Host ""
Write-Host "Proyecto actual de GCP: $currentProject" -ForegroundColor Yellow
Write-Host ""

if ($currentProject -ne $PROJECT_ID) {
    Write-Host "⚠️  El proyecto no coincide. ¿Cambiar a $PROJECT_ID?" -ForegroundColor Yellow
    Pause
    gcloud config set project $PROJECT_ID
}

Write-Host "✅ Prerequisitos verificados" -ForegroundColor Green
Pause

# ====================================
# PASO 2: INSTALAR DEPENDENCIAS
# ====================================
Write-Host ""
Write-Host "════════════════════════════════════════════════════" -ForegroundColor Blue
Write-Host "PASO 2/6: Instalando dependencias..." -ForegroundColor Blue
Write-Host "════════════════════════════════════════════════════" -ForegroundColor Blue
Write-Host ""

# Backend
Write-Host "📦 Instalando dependencias del backend..." -ForegroundColor Yellow
Push-Location backend
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Backend dependencies instaladas" -ForegroundColor Green
} else {
    Write-Host "❌ Error instalando dependencias del backend" -ForegroundColor Red
    Pop-Location
    exit 1
}

# Verificar Sharp
Write-Host ""
Write-Host "🗜️  Verificando Sharp (compresión de imágenes)..." -ForegroundColor Yellow
$sharpInstalled = npm list sharp 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Sharp instalado correctamente" -ForegroundColor Green
} else {
    Write-Host "❌ Sharp no encontrado" -ForegroundColor Red
    Pop-Location
    exit 1
}

Pop-Location

# Frontend
Write-Host ""
Write-Host "📦 Instalando dependencias del frontend..." -ForegroundColor Yellow
Push-Location frontend
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Frontend dependencies instaladas" -ForegroundColor Green
} else {
    Write-Host "❌ Error instalando dependencias del frontend" -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location

Write-Host ""
Write-Host "✅ Todas las dependencias instaladas" -ForegroundColor Green
Pause

# ====================================
# PASO 3: MIGRAR BASE DE DATOS
# ====================================
Write-Host ""
Write-Host "════════════════════════════════════════════════════" -ForegroundColor Blue
Write-Host "PASO 3/6: Migrando base de datos..." -ForegroundColor Blue
Write-Host "════════════════════════════════════════════════════" -ForegroundColor Blue
Write-Host ""

Write-Host "⚠️  IMPORTANTE: Esto creará 2 tablas nuevas:" -ForegroundColor Yellow
Write-Host "   - webhooks"
Write-Host "   - api_keys"
Write-Host ""
Write-Host "¿Continuar con la migración?" -ForegroundColor Yellow
Pause

Push-Location backend
npm run migrate

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Migración completada exitosamente" -ForegroundColor Green
} else {
    Write-Host "❌ Error en la migración" -ForegroundColor Red
    Write-Host ""
    Write-Host "Si las tablas ya existen, puedes continuar." -ForegroundColor Yellow
    Write-Host "¿Continuar de todos modos? (S/N)" -ForegroundColor Yellow
    $response = Read-Host
    if ($response -ne "S" -and $response -ne "s") {
        Pop-Location
        exit 1
    }
}
Pop-Location

Pause

# ====================================
# PASO 4: VERIFICAR SISTEMA
# ====================================
Write-Host ""
Write-Host "════════════════════════════════════════════════════" -ForegroundColor Blue
Write-Host "PASO 4/6: Verificando sistema..." -ForegroundColor Blue
Write-Host "════════════════════════════════════════════════════" -ForegroundColor Blue
Write-Host ""

Push-Location backend
npm run verify

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Sistema verificado" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "⚠️  Algunas verificaciones fallaron" -ForegroundColor Yellow
    Write-Host "¿Continuar de todos modos? (S/N)" -ForegroundColor Yellow
    $response = Read-Host
    if ($response -ne "S" -and $response -ne "s") {
        Pop-Location
        exit 1
    }
}
Pop-Location

Pause

# ====================================
# PASO 5: DEPLOY BACKEND
# ====================================
Write-Host ""
Write-Host "════════════════════════════════════════════════════" -ForegroundColor Blue
Write-Host "PASO 5/6: Deployando BACKEND a Cloud Run..." -ForegroundColor Blue
Write-Host "════════════════════════════════════════════════════" -ForegroundColor Blue
Write-Host ""

Write-Host "Esto tomará 3-5 minutos..." -ForegroundColor Yellow
Write-Host ""

Push-Location backend

gcloud run deploy $BACKEND_SERVICE `
  --source . `
  --region $REGION `
  --platform managed `
  --allow-unauthenticated `
  --memory 512Mi `
  --cpu 1 `
  --timeout 300 `
  --max-instances 10 `
  --set-env-vars="NODE_ENV=production"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Backend deployado exitosamente" -ForegroundColor Green
    $backendUrl = gcloud run services describe $BACKEND_SERVICE --region $REGION --format 'value(status.url)'
    Write-Host ""
    Write-Host "Backend URL: $backendUrl" -ForegroundColor Green
} else {
    Write-Host "❌ Error deployando backend" -ForegroundColor Red
    Pop-Location
    exit 1
}

Pop-Location
Pause

# ====================================
# PASO 6: DEPLOY FRONTEND
# ====================================
Write-Host ""
Write-Host "════════════════════════════════════════════════════" -ForegroundColor Blue
Write-Host "PASO 6/6: Deployando FRONTEND a Cloud Run..." -ForegroundColor Blue
Write-Host "════════════════════════════════════════════════════" -ForegroundColor Blue
Write-Host ""

Write-Host "Esto tomará 3-5 minutos..." -ForegroundColor Yellow
Write-Host ""

Push-Location frontend

gcloud run deploy $FRONTEND_SERVICE `
  --source . `
  --region $REGION `
  --platform managed `
  --allow-unauthenticated `
  --memory 256Mi `
  --cpu 1 `
  --timeout 300 `
  --max-instances 10

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Frontend deployado exitosamente" -ForegroundColor Green
    $frontendUrl = gcloud run services describe $FRONTEND_SERVICE --region $REGION --format 'value(status.url)'
    Write-Host ""
    Write-Host "Frontend URL: $frontendUrl" -ForegroundColor Green
} else {
    Write-Host "❌ Error deployando frontend" -ForegroundColor Red
    Pop-Location
    exit 1
}

Pop-Location

# ====================================
# RESUMEN FINAL
# ====================================
Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                                                   ║" -ForegroundColor Green
Write-Host "║     🎊 DEPLOYMENT COMPLETADO EXITOSAMENTE 🎊      ║" -ForegroundColor Green
Write-Host "║                                                   ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "✅ Backend deployado" -ForegroundColor Green
Write-Host "   URL: $backendUrl"
Write-Host ""
Write-Host "✅ Frontend deployado" -ForegroundColor Green
Write-Host "   URL: $frontendUrl"
Write-Host ""
Write-Host "📋 Próximos pasos:" -ForegroundColor Blue
Write-Host ""
Write-Host "1. Crear API Key para integraciones:"
Write-Host "   cd backend"
Write-Host "   npm run create-api-key `"Jira`" `"read,write`"" -ForegroundColor Yellow
Write-Host ""
Write-Host "2. Configurar webhooks:"
Write-Host "   Ir a: $frontendUrl"
Write-Host "   Panel SAT → Webhooks → Nuevo Webhook"
Write-Host ""
Write-Host "3. Ver analytics:"
Write-Host "   Ir a: $frontendUrl"
Write-Host "   Panel SAT → Analytics"
Write-Host ""
Write-Host "4. Testing completo:"
Write-Host "   - Crear ticket con fotos"
Write-Host "   - Verificar compresión en logs"
Write-Host "   - Ver galería (debe cargar rápido)"
Write-Host "   - Probar webhook"
Write-Host ""
Write-Host "🎉 ¡Sistema v2.1 en producción!" -ForegroundColor Green
Write-Host ""

Write-Host "Presiona ENTER para finalizar..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
