#!/bin/bash
# ========================================
# DEPLOY COMPLETO AUTOMÁTICO
# ========================================
# Este script hace TODO:
# 1. Deploy backend (con migraciones automáticas)
# 2. Deploy frontend (con variables correctas)
# ========================================

set -e  # Detener si hay errores

echo "========================================"
echo "DEPLOY AUTOMÁTICO COMPLETO"
echo "========================================"
echo ""

# Configurar proyecto
echo "[0/3] Configurando proyecto..."
gcloud config set project ticketswarcotrafficspain

# ========================================
# PASO 1: DEPLOY BACKEND
# ========================================
echo ""
echo "[1/3] Desplegando BACKEND..."
echo "  - Se ejecutarán migraciones automáticas"
echo "  - Se agregarán campos faltantes a BD"
echo "  - Se crearán índices"
echo ""

cd ~/stsweb

gcloud run deploy stsweb-backend \
  --source ./backend \
  --region europe-west1 \
  --platform managed \
  --allow-unauthenticated \
  --add-cloudsql-instances ticketswarcotrafficspain:europe-west1:swarco-mysql \
  --env-vars-file ./env.yaml \
  --min-instances 1 \
  --max-instances 10 \
  --concurrency 80 \
  --timeout 300 \
  --memory 512Mi \
  --cpu 1

echo ""
echo "✅ Backend desplegado"
echo ""

# Esperar 10 segundos para que el backend inicie y ejecute migraciones
echo "⏳ Esperando 10 segundos para que backend inicie..."
sleep 10

# ========================================
# PASO 2: VERIFICAR BACKEND
# ========================================
echo ""
echo "[2/3] Verificando backend..."

BACKEND_URL="https://stsweb-backend-964379250608.europe-west1.run.app"
HEALTH_CHECK=$(curl -s "$BACKEND_URL/api/health" || echo '{"ok":false}')

if echo "$HEALTH_CHECK" | grep -q '"ok":true'; then
  echo "✅ Backend funcionando correctamente"
else
  echo "❌ WARNING: Backend no responde correctamente"
  echo "   Respuesta: $HEALTH_CHECK"
  echo "   Continuando de todas formas..."
fi

# ========================================
# PASO 3: DEPLOY FRONTEND
# ========================================
echo ""
echo "[3/3] Desplegando FRONTEND..."
echo "  - Configurando URL del backend"
echo "  - Building con variables de entorno"
echo ""

cd ~/stsweb/frontend

# Crear .env.production para asegurar que Vite use la URL correcta
cat > .env.production << EOF
VITE_API_URL=$BACKEND_URL
VITE_STAGING_GATE_ENABLED=false
EOF

echo "✅ Archivo .env.production creado"

# Instalar dependencias (si no están)
if [ ! -d "node_modules" ]; then
  echo "📦 Instalando dependencias..."
  npm install
fi

# Build
echo "🔨 Building frontend..."
npm run build

# Verificar que el build tiene la URL correcta
if grep -r "stsweb-backend" dist/ > /dev/null 2>&1; then
  echo "✅ Build contiene URL del backend"
else
  echo "⚠️  WARNING: URL del backend no encontrada en build"
fi

# Deploy
cd ~/stsweb
echo "🚀 Desplegando a Cloud Run..."

gcloud run deploy stsweb \
  --source ./frontend \
  --region europe-west1 \
  --platform managed \
  --allow-unauthenticated \
  --memory 256Mi \
  --cpu 1 \
  --timeout 300 \
  --max-instances 10

echo ""
echo "✅ Frontend desplegado"

# ========================================
# VERIFICACIÓN FINAL
# ========================================
echo ""
echo "========================================"
echo "VERIFICACIÓN FINAL"
echo "========================================"
echo ""

echo "1. Backend health check:"
curl -s "$BACKEND_URL/api/health" | head -c 200
echo ""

echo ""
echo "2. Frontend:"
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://stsweb-964379250608.europe-west1.run.app")
if [ "$FRONTEND_STATUS" = "200" ]; then
  echo "✅ Frontend responde: $FRONTEND_STATUS"
else
  echo "⚠️  Frontend responde: $FRONTEND_STATUS"
fi

echo ""
echo "========================================"
echo "DEPLOY COMPLETADO"
echo "========================================"
echo ""
echo "✅ Backend: $BACKEND_URL"
echo "✅ Frontend: https://staging.swarcotrafficspain.com"
echo ""
echo "🔍 Ver logs del backend:"
echo "   gcloud logging read \"resource.type=cloud_run_revision AND resource.labels.service_name=stsweb-backend\" --limit 50"
echo ""
echo "📋 Próximos pasos:"
echo "   1. Abre https://staging.swarcotrafficspain.com"
echo "   2. Login: aitor.badiola@swarco.com / Aitor/85"
echo "   3. Prueba crear tickets (incidencias, repuestos, compras)"
echo ""
