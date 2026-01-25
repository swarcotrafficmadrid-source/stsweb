@echo off
echo ========================================
echo DEPLOY BACKEND A CLOUD RUN
echo ========================================
echo.

cd /d "c:\Users\abadiola\stm-web"

echo [1/2] Verificando autenticacion...
gcloud config set project ticketswarcotrafficspain

echo.
echo [2/2] Desplegando backend...
gcloud run deploy stsweb-backend ^
  --source ./backend ^
  --region europe-west1 ^
  --platform managed ^
  --allow-unauthenticated ^
  --add-cloudsql-instances ticketswarcotrafficspain:europe-west1:swarco-mysql ^
  --env-vars-file ./env.yaml ^
  --min-instances 1 ^
  --max-instances 10 ^
  --concurrency 80 ^
  --timeout 300 ^
  --memory 512Mi ^
  --cpu 1

echo.
echo ========================================
echo VERIFICANDO DEPLOY
echo ========================================
curl https://stsweb-backend-964379250608.europe-west1.run.app/api/health

echo.
echo ========================================
echo COMPLETADO
echo ========================================
pause
