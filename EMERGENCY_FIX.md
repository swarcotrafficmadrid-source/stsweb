# FIX DE EMERGENCIA - Backend Muerto

## Problema
Backend no responde (timeout 5s). Causa: `rateLimiterRedis.js` esperando REDIS_URL que no existe.

## Solución Aplicada
Revertir temporalmente a `rateLimiter.js` (in-memory) hasta configurar Redis.

## Cambio
`backend/src/server.js` línea 24:
```javascript
// ANTES (Redis - causa crash):
import { authLimiter, apiLimiter, adminLimiter } from "./middleware/rateLimiterRedis.js";

// AHORA (In-memory - funciona):
import { authLimiter, apiLimiter, adminLimiter } from "./middleware/rateLimiter.js";
```

## Deploy
```bash
cd backend
gcloud run deploy stsweb-backend \
  --source . \
  --region europe-west1 \
  --allow-unauthenticated
```

## Próximos Pasos
1. Configurar Redis correctamente
2. Volver a `rateLimiterRedis.js`
