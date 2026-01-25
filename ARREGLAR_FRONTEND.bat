@echo off
echo ========================================
echo ARREGLANDO FRONTEND
echo ========================================
echo.

cd /d "c:\Users\abadiola\stm-web\frontend"

echo [1/3] Instalando dependencias...
call npm install

echo.
echo [2/3] Construyendo frontend con backend correcto...
call npm run build

echo.
echo [3/3] Desplegando a Firebase...
cd ..
call firebase deploy --only hosting

echo.
echo ========================================
echo COMPLETADO
echo ========================================
echo.
echo Recarga https://staging.swarcotrafficspain.com
echo.
pause
