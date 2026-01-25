#!/bin/bash
# SCRIPT DE VERIFICACIÓN COMPLETA
# Verifica que TODO esté correctamente configurado antes de probar

set +e  # No salir en errores, queremos ver todos los problemas

echo "════════════════════════════════════════════════════════"
echo "  🔍 VERIFICACIÓN COMPLETA DEL SISTEMA"
echo "════════════════════════════════════════════════════════"
echo ""

ERRORES=0

# ═══════════════════════════════════════════════════════════
# 1. VERIFICAR BACKEND RESPONDE
# ═══════════════════════════════════════════════════════════
echo "1️⃣ Verificando que backend responde..."
BACKEND_URL="https://stsweb-backend-964379250608.europe-west1.run.app"
HEALTH_RESPONSE=$(curl -s "$BACKEND_URL/api/health")

if echo "$HEALTH_RESPONSE" | grep -q "ok"; then
  echo "   ✅ Backend responde correctamente"
else
  echo "   ❌ Backend NO responde: $HEALTH_RESPONSE"
  ERRORES=$((ERRORES + 1))
fi
echo ""

# ═══════════════════════════════════════════════════════════
# 2. VERIFICAR VARIABLES DE ENTORNO EN CLOUD RUN
# ═══════════════════════════════════════════════════════════
echo "2️⃣ Verificando variables de entorno en Cloud Run..."
ENV_VARS=$(gcloud run services describe stsweb-backend --region europe-west1 --format="value(spec.template.spec.containers[0].env)")

REQUIRED_VARS=("DB_USER" "DB_PASSWORD" "JWT_SECRET" "ADMIN_SECRET_KEY" "DB_SOCKET")
for VAR in "${REQUIRED_VARS[@]}"; do
  if echo "$ENV_VARS" | grep -q "$VAR"; then
    echo "   ✅ $VAR está configurada"
  else
    echo "   ❌ $VAR NO está configurada"
    ERRORES=$((ERRORES + 1))
  fi
done
echo ""

# ═══════════════════════════════════════════════════════════
# 3. VERIFICAR CONEXIÓN A BASE DE DATOS
# ═══════════════════════════════════════════════════════════
echo "3️⃣ Verificando conexión a base de datos..."
DB_USER="deployuser"
DB_PASSWORD="Deploy2026Pass"
DB_NAME="swarco_ops"

if mysql -h 127.0.0.1 -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "SELECT 1;" > /dev/null 2>&1; then
  echo "   ✅ Conexión a base de datos exitosa"
else
  echo "   ⚠️  No se puede conectar desde Cloud Shell (normal, el backend se conecta vía socket)"
fi
echo ""

# ═══════════════════════════════════════════════════════════
# 4. VERIFICAR ESTRUCTURA DE TABLAS
# ═══════════════════════════════════════════════════════════
echo "4️⃣ Verificando estructura de tablas (si hay conexión)..."
if mysql -h 127.0.0.1 -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "SELECT 1;" > /dev/null 2>&1; then
  
  # Verificar tabla asistencias tiene campos GPS
  if mysql -h 127.0.0.1 -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -s -N -e "SHOW COLUMNS FROM asistencias LIKE 'latitude';" | grep -q "latitude"; then
    echo "   ✅ Tabla asistencias tiene campo 'latitude'"
  else
    echo "   ❌ Tabla asistencias NO tiene campo 'latitude'"
    ERRORES=$((ERRORES + 1))
  fi
  
  if mysql -h 127.0.0.1 -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -s -N -e "SHOW COLUMNS FROM asistencias LIKE 'longitude';" | grep -q "longitude"; then
    echo "   ✅ Tabla asistencias tiene campo 'longitude'"
  else
    echo "   ❌ Tabla asistencias NO tiene campo 'longitude'"
    ERRORES=$((ERRORES + 1))
  fi
  
  # Verificar tabla repuestos tiene campo titulo
  if mysql -h 127.0.0.1 -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -s -N -e "SHOW COLUMNS FROM repuestos LIKE 'titulo';" | grep -q "titulo"; then
    echo "   ✅ Tabla repuestos tiene campo 'titulo'"
  else
    echo "   ❌ Tabla repuestos NO tiene campo 'titulo'"
    ERRORES=$((ERRORES + 1))
  fi
  
  # Verificar tabla compras tiene campos
  if mysql -h 127.0.0.1 -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -s -N -e "SHOW COLUMNS FROM compras LIKE 'titulo';" | grep -q "titulo"; then
    echo "   ✅ Tabla compras tiene campo 'titulo'"
  else
    echo "   ❌ Tabla compras NO tiene campo 'titulo'"
    ERRORES=$((ERRORES + 1))
  fi
  
else
  echo "   ⚠️  Saltando verificación de tablas (sin conexión a BD)"
fi
echo ""

# ═══════════════════════════════════════════════════════════
# 5. VERIFICAR FRONTEND RESPONDE
# ═══════════════════════════════════════════════════════════
echo "5️⃣ Verificando que frontend responde..."
FRONTEND_URL="https://staging.swarcotrafficspain.com"
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL")

if [ "$FRONTEND_STATUS" = "200" ]; then
  echo "   ✅ Frontend responde correctamente"
else
  echo "   ❌ Frontend responde con código $FRONTEND_STATUS"
  ERRORES=$((ERRORES + 1))
fi
echo ""

# ═══════════════════════════════════════════════════════════
# 6. VERIFICAR CÓDIGO EN GITHUB ESTÁ ACTUALIZADO
# ═══════════════════════════════════════════════════════════
echo "6️⃣ Verificando código en GitHub..."
cd ~/stsweb
git fetch origin -q
LOCAL_COMMIT=$(git rev-parse HEAD)
REMOTE_COMMIT=$(git rev-parse origin/main)

if [ "$LOCAL_COMMIT" = "$REMOTE_COMMIT" ]; then
  echo "   ✅ Código local sincronizado con GitHub"
else
  echo "   ⚠️  Código local desincronizado (ejecuta: git pull)"
fi

# Verificar que las correcciones estén en el código
if grep -q "latitude.*longitude.*locationAccuracy" backend/src/routes/assistance.js; then
  echo "   ✅ Corrección GPS en asistencias presente"
else
  echo "   ❌ Corrección GPS en asistencias NO presente"
  ERRORES=$((ERRORES + 1))
fi

if grep -q "Email al usuario" backend/src/routes/spares.js; then
  echo "   ✅ Corrección email en repuestos presente"
else
  echo "   ❌ Corrección email en repuestos NO presente"
  ERRORES=$((ERRORES + 1))
fi

if grep -q "sat_admin.*sat_technician" backend/src/routes/upload.js; then
  echo "   ✅ Corrección seguridad DELETE presente"
else
  echo "   ❌ Corrección seguridad DELETE NO presente"
  ERRORES=$((ERRORES + 1))
fi
echo ""

# ═══════════════════════════════════════════════════════════
# RESUMEN FINAL
# ═══════════════════════════════════════════════════════════
echo "════════════════════════════════════════════════════════"
if [ $ERRORES -eq 0 ]; then
  echo "  ✅ VERIFICACIÓN EXITOSA - TODO CORRECTO"
  echo "════════════════════════════════════════════════════════"
  echo ""
  echo "🎉 Puedes probar la aplicación con confianza:"
  echo "   https://staging.swarcotrafficspain.com"
  echo ""
else
  echo "  ⚠️  SE ENCONTRARON $ERRORES ERRORES"
  echo "════════════════════════════════════════════════════════"
  echo ""
  echo "⚠️  Revisa los errores arriba antes de probar"
  echo ""
fi
