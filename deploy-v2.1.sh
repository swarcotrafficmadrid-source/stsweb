#!/bin/bash

# ====================================
# SCRIPT DE DEPLOYMENT COMPLETO v2.1
# ====================================
# Ejecutar desde la raíz del proyecto
# 
# PREREQUISITOS:
# - gcloud CLI instalado y configurado
# - Credenciales de GCP configuradas
# - Variables de entorno en .env
# 
# USO: bash deploy-v2.1.sh
# ====================================

set -e  # Salir si hay errores

echo "╔═══════════════════════════════════════════════════╗"
echo "║                                                   ║"
echo "║     🚀 DEPLOYMENT PORTAL SAT v2.1 🚀              ║"
echo "║                                                   ║"
echo "╚═══════════════════════════════════════════════════╝"
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables
PROJECT_ID="swarco-ops"
REGION="europe-west1"
BACKEND_SERVICE="stsweb-backend"
FRONTEND_SERVICE="stsweb"

echo ""
echo "${BLUE}📋 Configuración:${NC}"
echo "   Project: $PROJECT_ID"
echo "   Region: $REGION"
echo "   Backend: $BACKEND_SERVICE"
echo "   Frontend: $FRONTEND_SERVICE"
echo ""

# Función para pausar
pause() {
    read -p "Presiona ENTER para continuar o Ctrl+C para cancelar..."
}

# ====================================
# PASO 1: VERIFICAR PREREQUISITOS
# ====================================
echo "${BLUE}════════════════════════════════════════════════════${NC}"
echo "${BLUE}PASO 1/6: Verificando prerequisitos...${NC}"
echo "${BLUE}════════════════════════════════════════════════════${NC}"
echo ""

# Verificar gcloud
if ! command -v gcloud &> /dev/null; then
    echo "${RED}❌ gcloud CLI no encontrado${NC}"
    echo "Instalar desde: https://cloud.google.com/sdk/docs/install"
    exit 1
fi
echo "${GREEN}✅ gcloud CLI instalado${NC}"

# Verificar node
if ! command -v node &> /dev/null; then
    echo "${RED}❌ Node.js no encontrado${NC}"
    exit 1
fi
echo "${GREEN}✅ Node.js instalado: $(node --version)${NC}"

# Verificar npm
if ! command -v npm &> /dev/null; then
    echo "${RED}❌ npm no encontrado${NC}"
    exit 1
fi
echo "${GREEN}✅ npm instalado: $(npm --version)${NC}"

# Verificar proyecto de GCP
CURRENT_PROJECT=$(gcloud config get-value project 2>/dev/null)
echo ""
echo "${YELLOW}Proyecto actual de GCP: $CURRENT_PROJECT${NC}"
echo ""

if [ "$CURRENT_PROJECT" != "$PROJECT_ID" ]; then
    echo "${YELLOW}⚠️  El proyecto no coincide. ¿Cambiar a $PROJECT_ID?${NC}"
    pause
    gcloud config set project $PROJECT_ID
fi

echo ""
echo "${GREEN}✅ Prerequisitos verificados${NC}"
echo ""
pause

# ====================================
# PASO 2: INSTALAR DEPENDENCIAS
# ====================================
echo ""
echo "${BLUE}════════════════════════════════════════════════════${NC}"
echo "${BLUE}PASO 2/6: Instalando dependencias...${NC}"
echo "${BLUE}════════════════════════════════════════════════════${NC}"
echo ""

# Backend
echo "${YELLOW}📦 Instalando dependencias del backend...${NC}"
cd backend
npm install
if [ $? -eq 0 ]; then
    echo "${GREEN}✅ Backend dependencies instaladas${NC}"
else
    echo "${RED}❌ Error instalando dependencias del backend${NC}"
    exit 1
fi

# Sharp (crítico para v2.1)
echo ""
echo "${YELLOW}🗜️  Verificando Sharp (compresión de imágenes)...${NC}"
if npm list sharp &> /dev/null; then
    echo "${GREEN}✅ Sharp instalado correctamente${NC}"
else
    echo "${RED}❌ Sharp no encontrado${NC}"
    exit 1
fi

# Frontend
echo ""
echo "${YELLOW}📦 Instalando dependencias del frontend...${NC}"
cd ../frontend
npm install
if [ $? -eq 0 ]; then
    echo "${GREEN}✅ Frontend dependencies instaladas${NC}"
else
    echo "${RED}❌ Error instalando dependencias del frontend${NC}"
    exit 1
fi

cd ..
echo ""
echo "${GREEN}✅ Todas las dependencias instaladas${NC}"
echo ""
pause

# ====================================
# PASO 3: MIGRAR BASE DE DATOS
# ====================================
echo ""
echo "${BLUE}════════════════════════════════════════════════════${NC}"
echo "${BLUE}PASO 3/6: Migrando base de datos...${NC}"
echo "${BLUE}════════════════════════════════════════════════════${NC}"
echo ""

echo "${YELLOW}⚠️  IMPORTANTE: Esto creará 2 tablas nuevas:${NC}"
echo "   - webhooks"
echo "   - api_keys"
echo ""
echo "${YELLOW}¿Continuar con la migración?${NC}"
pause

cd backend
npm run migrate

if [ $? -eq 0 ]; then
    echo ""
    echo "${GREEN}✅ Migración completada exitosamente${NC}"
else
    echo "${RED}❌ Error en la migración${NC}"
    echo ""
    echo "${YELLOW}Si las tablas ya existen, puedes continuar.${NC}"
    echo "¿Continuar de todos modos? (y/n)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

cd ..
echo ""
pause

# ====================================
# PASO 4: VERIFICAR SISTEMA
# ====================================
echo ""
echo "${BLUE}════════════════════════════════════════════════════${NC}"
echo "${BLUE}PASO 4/6: Verificando sistema...${NC}"
echo "${BLUE}════════════════════════════════════════════════════${NC}"
echo ""

cd backend
npm run verify

if [ $? -eq 0 ]; then
    echo ""
    echo "${GREEN}✅ Sistema verificado${NC}"
else
    echo ""
    echo "${YELLOW}⚠️  Algunas verificaciones fallaron${NC}"
    echo "¿Continuar de todos modos? (y/n)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

cd ..
echo ""
pause

# ====================================
# PASO 5: DEPLOY BACKEND
# ====================================
echo ""
echo "${BLUE}════════════════════════════════════════════════════${NC}"
echo "${BLUE}PASO 5/6: Deployando BACKEND a Cloud Run...${NC}"
echo "${BLUE}════════════════════════════════════════════════════${NC}"
echo ""

echo "${YELLOW}Esto tomará 3-5 minutos...${NC}"
echo ""

cd backend

gcloud run deploy $BACKEND_SERVICE \
  --source . \
  --region $REGION \
  --platform managed \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --timeout 300 \
  --max-instances 10 \
  --set-env-vars="NODE_ENV=production"

if [ $? -eq 0 ]; then
    echo ""
    echo "${GREEN}✅ Backend deployado exitosamente${NC}"
    BACKEND_URL=$(gcloud run services describe $BACKEND_SERVICE --region $REGION --format 'value(status.url)')
    echo ""
    echo "${GREEN}Backend URL: $BACKEND_URL${NC}"
else
    echo "${RED}❌ Error deployando backend${NC}"
    exit 1
fi

cd ..
echo ""
pause

# ====================================
# PASO 6: DEPLOY FRONTEND
# ====================================
echo ""
echo "${BLUE}════════════════════════════════════════════════════${NC}"
echo "${BLUE}PASO 6/6: Deployando FRONTEND a Cloud Run...${NC}"
echo "${BLUE}════════════════════════════════════════════════════${NC}"
echo ""

echo "${YELLOW}Esto tomará 3-5 minutos...${NC}"
echo ""

cd frontend

# Actualizar VITE_API_URL si es necesario
if [ ! -z "$BACKEND_URL" ]; then
    echo "${YELLOW}Configurando VITE_API_URL=$BACKEND_URL${NC}"
fi

gcloud run deploy $FRONTEND_SERVICE \
  --source . \
  --region $REGION \
  --platform managed \
  --allow-unauthenticated \
  --memory 256Mi \
  --cpu 1 \
  --timeout 300 \
  --max-instances 10

if [ $? -eq 0 ]; then
    echo ""
    echo "${GREEN}✅ Frontend deployado exitosamente${NC}"
    FRONTEND_URL=$(gcloud run services describe $FRONTEND_SERVICE --region $REGION --format 'value(status.url)')
    echo ""
    echo "${GREEN}Frontend URL: $FRONTEND_URL${NC}"
else
    echo "${RED}❌ Error deployando frontend${NC}"
    exit 1
fi

cd ..

# ====================================
# RESUMEN FINAL
# ====================================
echo ""
echo "╔═══════════════════════════════════════════════════╗"
echo "║                                                   ║"
echo "║     🎊 DEPLOYMENT COMPLETADO EXITOSAMENTE 🎊      ║"
echo "║                                                   ║"
echo "╚═══════════════════════════════════════════════════╝"
echo ""
echo "${GREEN}✅ Backend deployado${NC}"
echo "   URL: $BACKEND_URL"
echo ""
echo "${GREEN}✅ Frontend deployado${NC}"
echo "   URL: $FRONTEND_URL"
echo ""
echo "${BLUE}📋 Próximos pasos:${NC}"
echo ""
echo "1. Crear API Key para integraciones:"
echo "   ${YELLOW}cd backend && npm run create-api-key \"Jira\" \"read,write\"${NC}"
echo ""
echo "2. Configurar webhooks:"
echo "   Ir a: $FRONTEND_URL"
echo "   Panel SAT → Webhooks → Nuevo Webhook"
echo ""
echo "3. Ver analytics:"
echo "   Ir a: $FRONTEND_URL"
echo "   Panel SAT → Analytics"
echo ""
echo "4. Testing completo:"
echo "   - Crear ticket con fotos"
echo "   - Verificar compresión en logs"
echo "   - Ver galería (debe cargar rápido)"
echo "   - Probar webhook"
echo ""
echo "${GREEN}🎉 ¡Sistema v2.1 en producción!${NC}"
echo ""
