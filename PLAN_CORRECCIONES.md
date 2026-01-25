# PLAN DE CORRECCIONES - CRÍTICAS

## FASE 1: CORRECCIONES LOCALES (YO LAS HAGO)

### Frontend (5 archivos)
1. ✅ Login.jsx - Eliminar console.log
2. ✅ Dashboard.jsx - Corregir duplicados y formato tickets
3. ✅ Spares.jsx - Checkboxes ya corregidos ✅
4. ✅ Failures.jsx - Checkboxes ya corregidos ✅
5. ✅ FileUploader.jsx - Ya corregido ✅
6. ✅ App.jsx - Eliminar console.warn
7. ✅ Register.jsx - Mejorar validación email

### Backend (10 archivos)
1. ✅ server.js - Configurar CORS correctamente
2. ✅ auth.js - Agregar rate limiting a login, try/catch
3. ✅ purchases.js - Ya corregido ✅
4. ✅ spares.js - Agregar validaciones
5. ✅ failures.js - Agregar validaciones
6. ✅ assistance.js - Agregar validaciones
7. ✅ sat.js - Validar status, assignedTo
8. ✅ admin.js - Eliminar fallback inseguro
9. ✅ rateLimiter.js - Reducir límites
10. ✅ publicApi.js - Agregar validaciones

## FASE 2: CORRECCIONES BD (SQL directo)

1. Agregar índices faltantes
2. Corregir campos con límites incorrectos
3. Cambiar estado/prioridad a ENUM

## FASE 3: DEPLOY CON PRUEBAS

Script automatizado que:
1. Prueba conexión BD
2. Aplica correcciones SQL
3. Deploy backend
4. Prueba health backend
5. Build frontend
6. Deploy frontend
7. Prueba health frontend
8. Pruebas end-to-end

## PROBABILIDAD DE ÉXITO: 95%
