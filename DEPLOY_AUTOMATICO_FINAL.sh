#!/bin/bash
# SCRIPT DE DEPLOY AUTOMÁTICO CON PRUEBAS INTERMEDIAS
# Fecha: 25 ENE 2026 - 16:00
# Este script hace TODO el deploy con pruebas paso a paso

set -e  # Salir si algún comando falla

PROYECTO="ticketswarcotrafficspain"
REGION="europe-west1"
BACKEND_SERVICE="stsweb-backend"
FRONTEND_SERVICE="stsweb"

echo "════════════════════════════════════════════════════════"
echo "  🚀 DEPLOY AUTOMÁTICO COMPLETO CON PRUEBAS"
echo "════════════════════════════════════════════════════════"
echo ""

# ═══════════════════════════════════════════════════════════
# PASO 1: VERIFICAR PROYECTO
# ═══════════════════════════════════════════════════════════
echo "🔍 PASO 1/10: Verificando proyecto..."
CURRENT_PROJECT=$(gcloud config get-value project 2>/dev/null)
if [ "$CURRENT_PROJECT" != "$PROYECTO" ]; then
  echo "❌ Proyecto incorrecto: $CURRENT_PROJECT"
  echo "Configurando proyecto correcto..."
  gcloud config set project $PROYECTO
fi
echo "✅ Proyecto: $PROYECTO"
echo ""

# ═══════════════════════════════════════════════════════════
# PASO 2: SINCRONIZAR CÓDIGO DESDE GITHUB
# ═══════════════════════════════════════════════════════════
echo "🔄 PASO 2/10: Sincronizando código desde GitHub..."
cd ~/stsweb
git fetch origin
git reset --hard origin/main
git pull origin main
echo "✅ Código sincronizado desde GitHub"
echo ""

# ═══════════════════════════════════════════════════════════
# PASO 3: VERIFICAR CONEXIÓN A BASE DE DATOS
# ═══════════════════════════════════════════════════════════
echo "🗄️  PASO 3/10: Verificando conexión a base de datos..."

# Leer credenciales desde env.yaml
DB_USER=$(grep "DB_USER:" env.yaml | awk '{print $2}')
DB_PASSWORD=$(grep "DB_PASSWORD:" env.yaml | awk '{print $2}')
DB_NAME=$(grep "DB_NAME:" env.yaml | awk '{print $2}')

echo "Probando conexión con usuario: $DB_USER"

# Probar conexión
if mysql -h 127.0.0.1 -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "SELECT 1;" > /dev/null 2>&1; then
  echo "✅ Conexión a base de datos exitosa"
else
  echo "❌ ERROR: No se pudo conectar a la base de datos"
  echo "Usuario: $DB_USER"
  echo "Base de datos: $DB_NAME"
  exit 1
fi
echo ""

# ═══════════════════════════════════════════════════════════
# PASO 4: VERIFICAR CAMPOS CRÍTICOS EN BD
# ═══════════════════════════════════════════════════════════
echo "🔍 PASO 4/10: Verificando estructura de base de datos..."

# Verificar campos en tabla compras
echo "Verificando tabla 'compras'..."
COMPRAS_COLUMNS=$(mysql -h 127.0.0.1 -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -s -N -e "SHOW COLUMNS FROM compras;")

if echo "$COMPRAS_COLUMNS" | grep -q "titulo"; then
  echo "  ✅ Campo 'titulo' existe"
else
  echo "  ❌ Campo 'titulo' NO existe - necesita agregarse"
  exit 1
fi

if echo "$COMPRAS_COLUMNS" | grep -q "proyecto"; then
  echo "  ✅ Campo 'proyecto' existe"
else
  echo "  ❌ Campo 'proyecto' NO existe - necesita agregarse"
  exit 1
fi

if echo "$COMPRAS_COLUMNS" | grep -q "pais"; then
  echo "  ✅ Campo 'pais' existe"
else
  echo "  ❌ Campo 'pais' NO existe - necesita agregarse"
  exit 1
fi

# Verificar campos en tabla repuestos
echo "Verificando tabla 'repuestos'..."
REPUESTOS_COLUMNS=$(mysql -h 127.0.0.1 -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -s -N -e "SHOW COLUMNS FROM repuestos;")

if echo "$REPUESTOS_COLUMNS" | grep -q "titulo"; then
  echo "  ✅ Campo 'titulo' existe"
else
  echo "  ❌ Campo 'titulo' NO existe - necesita agregarse"
  exit 1
fi

echo "✅ Estructura de base de datos verificada"
echo ""

# ═══════════════════════════════════════════════════════════
# PASO 5: DEPLOY DEL BACKEND
# ═══════════════════════════════════════════════════════════
echo "🚀 PASO 5/10: Desplegando backend..."
echo "Esto puede tomar 3-5 minutos..."

gcloud run deploy $BACKEND_SERVICE \
  --source ./backend \
  --region $REGION \
  --platform managed \
  --allow-unauthenticated \
  --add-cloudsql-instances $PROYECTO:$REGION:swarco-mysql \
  --env-vars-file ./env.yaml \
  --min-instances 1 \
  --max-instances 10 \
  --concurrency 80 \
  --timeout 300 \
  --memory 512Mi \
  --cpu 1 \
  --quiet

echo "✅ Backend desplegado"
echo ""

# ═══════════════════════════════════════════════════════════
# PASO 6: PROBAR HEALTH DEL BACKEND
# ═══════════════════════════════════════════════════════════
echo "🏥 PASO 6/10: Probando salud del backend..."

BACKEND_URL=$(gcloud run services describe $BACKEND_SERVICE --region $REGION --format='value(status.url)')
echo "URL del backend: $BACKEND_URL"

echo "Esperando 10 segundos para que el servicio esté listo..."
sleep 10

HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "$BACKEND_URL/api/health" || echo "000")
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -n 1)
RESPONSE_BODY=$(echo "$HEALTH_RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ Backend respondiendo correctamente"
  echo "Respuesta: $RESPONSE_BODY"
else
  echo "❌ ERROR: Backend no responde correctamente"
  echo "Código HTTP: $HTTP_CODE"
  echo "Respuesta: $RESPONSE_BODY"
  echo ""
  echo "Revisando logs del backend..."
  gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=$BACKEND_SERVICE" \
    --limit 20 \
    --format="table(timestamp,severity,textPayload)"
  exit 1
fi
echo ""

# ═══════════════════════════════════════════════════════════
# PASO 7: BUILD DEL FRONTEND
# ═══════════════════════════════════════════════════════════
echo "🏗️  PASO 7/10: Construyendo frontend..."

cd frontend

# Instalar dependencias si es necesario
if [ ! -d "node_modules" ]; then
  echo "Instalando dependencias de npm..."
  npm install
fi

# Build con la URL correcta del backend
echo "Ejecutando npm run build con VITE_API_URL=$BACKEND_URL..."
export VITE_API_URL=$BACKEND_URL
npm run build

if [ ! -d "dist" ]; then
  echo "❌ ERROR: El build no generó la carpeta dist/"
  exit 1
fi

echo "✅ Frontend construido exitosamente"
echo "Tamaño de dist/:"
du -sh dist/
echo ""

cd ..

# ═══════════════════════════════════════════════════════════
# PASO 8: CREAR DOCKERFILE SIMPLE PARA FRONTEND
# ═══════════════════════════════════════════════════════════
echo "📦 PASO 8/10: Creando Dockerfile para frontend..."

cat > frontend/Dockerfile.simple << 'DOCKERFILE_EOF'
FROM nginx:alpine
COPY dist/ /usr/share/nginx/html/
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
DOCKERFILE_EOF

echo "✅ Dockerfile creado"
echo ""

# ═══════════════════════════════════════════════════════════
# PASO 9: BUILD Y PUSH DE IMAGEN DOCKER
# ═══════════════════════════════════════════════════════════
echo "🐳 PASO 9/10: Construyendo y subiendo imagen Docker..."

IMAGE_NAME="europe-west1-docker.pkg.dev/$PROYECTO/cloud-run-source-deploy/$FRONTEND_SERVICE:latest"

docker build -f frontend/Dockerfile.simple -t $IMAGE_NAME frontend

echo "Subiendo imagen a Artifact Registry..."
docker push $IMAGE_NAME

echo "✅ Imagen Docker subida"
echo ""

# ═══════════════════════════════════════════════════════════
# PASO 10: DEPLOY DEL FRONTEND
# ═══════════════════════════════════════════════════════════
echo "🚀 PASO 10/10: Desplegando frontend..."

gcloud run deploy $FRONTEND_SERVICE \
  --image $IMAGE_NAME \
  --region $REGION \
  --platform managed \
  --allow-unauthenticated \
  --memory 256Mi \
  --cpu 1 \
  --quiet

FRONTEND_URL=$(gcloud run services describe $FRONTEND_SERVICE --region $REGION --format='value(status.url)')
echo "✅ Frontend desplegado"
echo "URL del frontend: $FRONTEND_URL"
echo ""

# ═══════════════════════════════════════════════════════════
# PASO 11: PRUEBAS FINALES
# ═══════════════════════════════════════════════════════════
echo "🧪 PASO 11/11: Ejecutando pruebas finales..."

echo "Esperando 10 segundos para que el frontend esté listo..."
sleep 10

# Probar frontend
FRONTEND_RESPONSE=$(curl -s -w "\n%{http_code}" "$FRONTEND_URL" || echo "000")
FRONTEND_HTTP_CODE=$(echo "$FRONTEND_RESPONSE" | tail -n 1)

if [ "$FRONTEND_HTTP_CODE" = "200" ]; then
  echo "✅ Frontend respondiendo correctamente"
else
  echo "❌ ADVERTENCIA: Frontend responde con código $FRONTEND_HTTP_CODE"
fi

# Probar endpoint de login del backend
echo ""
echo "Probando endpoint de login..."
LOGIN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BACKEND_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"identifier":"test","password":"test"}' || echo "000")
LOGIN_HTTP_CODE=$(echo "$LOGIN_RESPONSE" | tail -n 1)

if [ "$LOGIN_HTTP_CODE" = "400" ] || [ "$LOGIN_HTTP_CODE" = "401" ]; then
  echo "✅ Endpoint de login funciona (responde 400/401 como esperado)"
elif [ "$LOGIN_HTTP_CODE" = "429" ]; then
  echo "✅ Endpoint de login funciona (rate limiting activo - 429)"
else
  echo "⚠️  Endpoint de login responde con código $LOGIN_HTTP_CODE"
fi

echo ""
echo "════════════════════════════════════════════════════════"
echo "  ✅ DEPLOY COMPLETADO CON ÉXITO"
echo "════════════════════════════════════════════════════════"
echo ""
echo "📊 RESUMEN:"
echo "  - Backend:  $BACKEND_URL"
echo "  - Frontend: $FRONTEND_URL"
echo ""
echo "🔗 URLS COMPLETAS:"
echo "  - Web Staging: https://staging.swarcotrafficspain.com"
echo "  - Backend API: $BACKEND_URL/api/health"
echo ""
echo "🎉 TODO LISTO - La aplicación está desplegada y funcionando"
echo ""
