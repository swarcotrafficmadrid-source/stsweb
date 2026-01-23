# ✅ Checklist de Deployment v2.1

## Pre-Deployment

### Verificaciones Locales:
- [x] Código sin errores de linting
- [x] Todas las dependencias instaladas
- [x] Scripts de migración creados
- [x] Documentación completa
- [ ] Variables de entorno configuradas (.env)
- [ ] Credenciales de GCP configuradas
- [ ] Cloud Storage bucket creado

### Archivos Críticos:
- [x] `backend/package.json` → Sharp agregado
- [x] `backend/src/models/Webhook.js` → Creado
- [x] `backend/src/models/ApiKey.js` → Creado
- [x] `backend/src/scripts/migrateDatabase.js` → Actualizado
- [x] `backend/src/scripts/createApiKey.js` → Creado
- [x] Todos los routes actualizados con webhooks

---

## Deployment Paso a Paso

### OPCIÓN 1: Script Automático (Recomendado)

```bash
# Dar permisos de ejecución
chmod +x deploy-v2.1.sh

# Ejecutar
./deploy-v2.1.sh
```

**Tiempo estimado:** 20-30 minutos

---

### OPCIÓN 2: Manual

#### 1️⃣ Instalar Dependencias (5 min)

```bash
# Backend
cd backend
npm install
npm list sharp  # Verificar que Sharp esté instalado

# Frontend
cd ../frontend
npm install
```

**Verificación:**
```bash
✅ node_modules/sharp debe existir
✅ No debe haber errores de instalación
```

---

#### 2️⃣ Migrar Base de Datos (5 min)

```bash
cd backend
npm run migrate
```

**Debe crear:**
- ✅ Tabla `webhooks`
- ✅ Tabla `api_keys`
- ✅ Campos en `assistance_requests` (photos_count, photo_urls)
- ✅ Campos en `fallas_equipos` (photoUrls, videoUrl)
- ✅ Campo en `spare_items` (photo_urls)
- ✅ Tabla `purchase_equipments`

**Verificación:**
```sql
-- En Cloud SQL
SHOW TABLES LIKE '%webhook%';  -- Debe mostrar 'webhooks'
SHOW TABLES LIKE '%api_key%';  -- Debe mostrar 'api_keys'
DESCRIBE webhooks;
DESCRIBE api_keys;
```

---

#### 3️⃣ Verificar Sistema (2 min)

```bash
cd backend
npm run verify
```

**Debe verificar:**
- ✅ Conexión a BD
- ✅ JWT secret configurado
- ✅ Cloud Storage accesible
- ✅ Todas las tablas existen
- ✅ Variables de entorno críticas

**Si falla algo:**
- Revisar `.env`
- Verificar credenciales de GCP
- Verificar bucket de Cloud Storage

---

#### 4️⃣ Deploy Backend (10 min)

```bash
cd backend

gcloud run deploy stsweb-backend \
  --source . \
  --region europe-west1 \
  --platform managed \
  --allow-unauthenticated \
  --memory 512Mi \
  --timeout 300
```

**Verificación:**
```bash
# Obtener URL
gcloud run services describe stsweb-backend \
  --region europe-west1 \
  --format 'value(status.url)'

# Probar
curl https://stsweb-backend-XXX.run.app/api/health
# Debe retornar: {"ok":true}

# Probar webhooks
curl https://stsweb-backend-XXX.run.app/api/webhooks/events
# Debe retornar JSON con eventos
```

---

#### 5️⃣ Deploy Frontend (10 min)

```bash
cd frontend

gcloud run deploy stsweb \
  --source . \
  --region europe-west1 \
  --platform managed \
  --allow-unauthenticated \
  --memory 256Mi \
  --timeout 300
```

**Verificación:**
```bash
# Obtener URL
gcloud run services describe stsweb \
  --region europe-west1 \
  --format 'value(status.url)'

# Abrir en navegador
open https://stsweb-XXX.run.app
```

---

## Post-Deployment

### 1️⃣ Crear Primera API Key (2 min)

```bash
cd backend
npm run create-api-key "Jira Integration" "read,write"
```

**Guardar la API Key generada en un lugar seguro.**

---

### 2️⃣ Configurar Primer Webhook (5 min)

1. Ir a Panel SAT
2. Click en tab "Webhooks"
3. Click "Nuevo Webhook"
4. Configurar:
   - Nombre: "Test Webhook"
   - URL: `https://webhook.site/unique-id` (para testing)
   - Eventos: `ticket.created`
5. Guardar
6. Click botón "Test"
7. Verificar en webhook.site que llegó el ping

---

### 3️⃣ Testing Completo (15 min)

#### Test 1: Compresión de Imágenes
```
1. Login como cliente
2. Crear ticket de incidencia
3. Subir foto grande (>2 MB)
4. Verificar en logs del backend:
   "✅ Imagen optimizada: 3500KB → 1200KB (-66%)"
5. Verificar que la foto se ve correcta
```

#### Test 2: Thumbnails
```
1. Panel SAT → Ver ticket con fotos
2. Galería debe cargar MUY rápido (<1 segundo)
3. Click en foto → debe abrir lightbox
4. Imagen completa debe verse nítida
```

#### Test 3: Webhooks
```
1. Crear ticket nuevo
2. Verificar en webhook.site que llegó evento
3. Payload debe incluir:
   {
     "event": "ticket.created",
     "timestamp": "...",
     "data": { "ticketId": ... }
   }
```

#### Test 4: Analytics
```
1. Panel SAT → Analytics
2. Debe mostrar:
   - Total de tickets
   - Gráfico de estados
   - Actividad 7 días
   - Top usuarios
3. Click "Exportar CSV" → debe descargar
```

#### Test 5: API REST
```bash
# Usar la API Key creada
curl -H "X-API-Key: your-key-here" \
  "https://stsweb-backend-XXX.run.app/api/public/tickets?limit=5"

# Debe retornar JSON con tickets
```

---

## Verificación Final

### ✅ Checklist de Funcionalidades:

#### Sistema de Archivos (v2.0):
- [ ] Subir fotos funciona
- [ ] Subir videos funciona
- [ ] Galería muestra fotos
- [ ] Lightbox abre correctamente
- [ ] Timeline muestra archivos
- [ ] Comentarios funcionan

#### Optimización (v2.1):
- [ ] Fotos se comprimen automáticamente
- [ ] Thumbnails se generan
- [ ] Galería carga rápido (<1 seg)
- [ ] Skeleton loaders se muestran
- [ ] Logs de compresión aparecen

#### Webhooks (v2.1):
- [ ] Panel de webhooks accesible
- [ ] Crear webhook funciona
- [ ] Test de webhook funciona
- [ ] Webhook se dispara al crear ticket
- [ ] Firma HMAC correcta

#### Analytics (v2.1):
- [ ] Dashboard de analytics accesible
- [ ] Métricas se muestran correctamente
- [ ] Gráficos funcionan
- [ ] Exportar CSV funciona

#### API REST (v2.1):
- [ ] Endpoints responden
- [ ] Autenticación por API Key funciona
- [ ] GET tickets funciona
- [ ] GET usuarios funciona
- [ ] Documentación accesible

---

## Rollback Plan

Si algo sale mal:

### Rollback de Backend:
```bash
# Ver revisiones
gcloud run revisions list \
  --service stsweb-backend \
  --region europe-west1

# Rollback a revisión anterior
gcloud run services update-traffic stsweb-backend \
  --region europe-west1 \
  --to-revisions REVISION_NAME=100
```

### Rollback de Frontend:
```bash
gcloud run services update-traffic stsweb \
  --region europe-west1 \
  --to-revisions REVISION_NAME=100
```

### Rollback de Base de Datos:
```sql
-- Eliminar tablas nuevas si causan problemas
DROP TABLE IF EXISTS webhooks;
DROP TABLE IF EXISTS api_keys;

-- Eliminar campos nuevos
ALTER TABLE assistance_requests DROP COLUMN photos_count;
ALTER TABLE assistance_requests DROP COLUMN photo_urls;
-- etc...
```

---

## Troubleshooting

### Problema: Sharp no se instala
```bash
# Limpiar y reinstalar
cd backend
rm -rf node_modules package-lock.json
npm install
```

### Problema: Migración falla
```bash
# Verificar conexión a BD
cd backend
npm run verify

# Ejecutar queries manualmente si es necesario
# Ver: backend/src/scripts/migrateDatabase.js
```

### Problema: Deploy falla por timeout
```bash
# Aumentar timeout
gcloud run deploy stsweb-backend \
  --source . \
  --timeout 600  # 10 minutos
```

### Problema: Webhook no se dispara
```bash
# Verificar logs
gcloud run logs read stsweb-backend \
  --region europe-west1 \
  --limit 50

# Buscar: "Error webhook" o "Webhook disparado"
```

### Problema: API Key no funciona
```bash
# Listar API Keys en BD
cd backend
node -e "
import { sequelize, ApiKey } from './src/models/index.js';
await sequelize.authenticate();
const keys = await ApiKey.findAll();
console.log(keys);
process.exit(0);
"
```

---

## Monitoreo Post-Deployment

### Métricas a Vigilar:

1. **Cloud Run (Backend):**
   - Request count
   - Request latency
   - Error rate
   - Memory usage

2. **Cloud Storage:**
   - Storage usado
   - Bandwidth
   - Request count

3. **Cloud SQL:**
   - Connections
   - Query time
   - Storage

### Dashboards:
- https://console.cloud.google.com/run
- https://console.cloud.google.com/storage
- https://console.cloud.google.com/sql

---

## Próximos Pasos

Después del deployment exitoso:

1. **Configurar Integración con Jira** (2 horas)
   - Ver: `API_REST_DOCUMENTATION.md`
   - Crear webhook bidireccional

2. **Setup de Reportes Automáticos** (1 hora)
   - Configurar cron job
   - Enviar CSV diario por email

3. **Capacitación del Equipo** (2 horas)
   - Panel SAT nuevo (Analytics, Webhooks)
   - Crear API Keys
   - Configurar webhooks

4. **Testing con Usuarios Reales** (1 semana)
   - Monitorear logs
   - Recopilar feedback
   - Ajustes finales

---

## Contacto

**Si necesitas ayuda:**
- Email: sfr.support@swarco.com
- Docs: Ver archivos `*.md` en la raíz
- Logs: `gcloud run logs read stsweb-backend`

---

## ✅ Estado del Deployment

```
[ ] Pre-verificaciones completadas
[ ] Dependencias instaladas
[ ] Base de datos migrada
[ ] Sistema verificado
[ ] Backend deployado
[ ] Frontend deployado
[ ] API Key creada
[ ] Webhook configurado
[ ] Testing completo
[ ] Monitoreo configurado
```

**Cuando todos los checkboxes estén marcados: 🎉 ¡Deployment Completo!**

---

**Última actualización:** 2026-01-23  
**Versión:** 2.1 Enterprise Integration  
**Estado:** ✅ Ready for Production
