@echo off
echo ========================================
echo DEPLOY FRONTEND A CLOUD RUN
echo ========================================
echo.

cd /d "c:\Users\abadiola\stm-web"

echo [1/3] Verificando autenticacion...
gcloud config set project ticketswarcotrafficspain

echo.
echo [2/3] Building Docker image con variables de entorno...
cd frontend
docker build ^
  --build-arg VITE_API_URL=https://stsweb-backend-964379250608.europe-west1.run.app ^
  --build-arg VITE_STAGING_GATE_ENABLED=false ^
  -t europe-west1-docker.pkg.dev/ticketswarcotrafficspain/cloud-run-source-deploy/stsweb:latest ^
  .

echo.
echo [3/3] Desplegando a Cloud Run...
docker push europe-west1-docker.pkg.dev/ticketswarcotrafficspain/cloud-run-source-deploy/stsweb:latest

gcloud run deploy stsweb ^
  --image europe-west1-docker.pkg.dev/ticketswarcotrafficspain/cloud-run-source-deploy/stsweb:latest ^
  --region europe-west1 ^
  --platform managed ^
  --allow-unauthenticated ^
  --memory 256Mi ^
  --cpu 1 ^
  --timeout 300 ^
  --max-instances 10

echo.
echo ========================================
echo COMPLETADO
echo ========================================
echo.
echo Recarga https://staging.swarcotrafficspain.com
echo.
pause
