# 🚀 Deploy Ahora - Comandos Copy/Paste

**⏱️ Tiempo total: 30 minutos**

---

## ✅ Pre-requisitos

- [x] Código completado (YA ESTÁ)
- [x] Acceso a Google Cloud
- [x] gcloud CLI instalado

---

## 📋 COPIAR Y PEGAR - Paso a Paso

### 1️⃣ Instalar Dependencias (2 min)

```bash
cd backend
npm install
```

---

### 2️⃣ Crear Bucket (1 min)

```bash
gsutil mb -l europe-west1 gs://swarco-tickets-files
```

---

### 3️⃣ Configurar CORS (30 seg)

```bash
echo '[{"origin":["*"],"method":["GET","POST","DELETE"],"responseHeader":["Content-Type"],"maxAgeSeconds":3600}]' | gsutil cors set /dev/stdin gs://swarco-tickets-files
```

---

### 4️⃣ Crear Service Account (2 min)

```bash
gcloud iam service-accounts create swarco-storage --display-name="SWARCO Storage"

gcloud projects add-iam-policy-binding ticketswarcotrafficspain --member="serviceAccount:swarco-storage@ticketswarcotrafficspain.iam.gserviceaccount.com" --role="roles/storage.objectAdmin"

gcloud iam service-accounts keys create storage-key.json --iam-account=swarco-storage@ticketswarcotrafficspain.iam.gserviceaccount.com

cat storage-key.json | base64 -w 0 > storage-key-base64.txt
```

---

### 5️⃣ Configurar Variables en Cloud Run (1 min)

```bash
gcloud run services update stsweb-backend --region europe-west1 --set-env-vars STORAGE_BUCKET_NAME=swarco-tickets-files,GOOGLE_CLOUD_STORAGE_KEY=$(cat storage-key-base64.txt)
```

---

### 6️⃣ Migrar Base de Datos (2 min)

**OPCIÓN A - Desde local (si tienes acceso a BD):**
```bash
cd backend
npm run migrate
```

**OPCIÓN B - Desde Cloud Shell:**
```bash
# Conectar a Cloud SQL
gcloud sql connect swarco-mysql --user=swarco

# Ejecutar estas queries SQL:
```sql
-- 1. assistance_requests
ALTER TABLE assistance_requests 
ADD COLUMN photos_count INT DEFAULT 0,
ADD COLUMN photo_urls JSON;

-- 2. fallas_equipos
ALTER TABLE fallas_equipos 
ADD COLUMN photoUrls JSON,
ADD COLUMN videoUrl VARCHAR(500);

-- 3. spare_items
ALTER TABLE spare_items 
ADD COLUMN photo_urls JSON;

-- 4. purchase_equipments (tabla nueva)
CREATE TABLE IF NOT EXISTS purchase_equipments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  purchase_request_id INT NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  cantidad INT DEFAULT 1,
  descripcion TEXT,
  photos_count INT DEFAULT 0,
  photo_urls JSON,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (purchase_request_id) REFERENCES compras(id) ON DELETE CASCADE
);
```
```bash
# Salir
exit
```

---

### 7️⃣ Deploy Backend (3 min)

```bash
cd backend
gcloud run deploy stsweb-backend --source . --region europe-west1 --allow-unauthenticated --platform managed --project ticketswarcotrafficspain
```

Esperar ~2-3 minutos...

---

### 8️⃣ Deploy Frontend (3 min)

```bash
cd ../frontend
gcloud run deploy stsweb --source . --region europe-west1 --allow-unauthenticated --platform managed --project ticketswarcotrafficspain
```

Esperar ~2-3 minutos...

---

### 9️⃣ Verificar (1 min)

```bash
# Health check general
curl https://stsweb-backend-964379250608.europe-west1.run.app/api/health

# Health check de upload
curl https://stsweb-backend-964379250608.europe-west1.run.app/api/upload/health
```

**Debe retornar:**
```json
{
  "status": "ok",
  "storage": "connected",
  "bucket": "swarco-tickets-files"
}
```

---

### 🔟 Probar en Vivo (5 min)

1. Abrir: https://staging.swarcotrafficspain.com
2. Login: `aitor.badiola@swarco.com` / `Swarco2024!`
3. Ir a "Incidencias"
4. Subir 2 fotos
5. Completar formulario
6. ✅ Enviar
7. Ir a Panel SAT (#sat)
8. Click en el ticket
9. ✅ Ver fotos en galería
10. ✅ Click en foto → Lightbox

---

## ✅ Checklist Rápido

```
□ npm install
□ Bucket creado
□ Service account creada
□ Variables en Cloud Run
□ Migración ejecutada
□ Backend deployado
□ Frontend deployado
□ Health check OK
□ Upload de prueba OK
□ Galería funciona
```

---

## 🐛 Si Algo Falla

### Error: "Bucket does not exist"
```bash
gsutil mb -l europe-west1 gs://swarco-tickets-files
```

### Error: "Permission denied"
```bash
gcloud projects add-iam-policy-binding ticketswarcotrafficspain --member="serviceAccount:swarco-storage@ticketswarcotrafficspain.iam.gserviceaccount.com" --role="roles/storage.objectAdmin"
```

### Error: "Column already exists" en migración
```
✅ Normal, significa que ya se ejecutó antes. Continuar.
```

### Upload falla en frontend:
```bash
# Ver logs del backend
gcloud run services logs read stsweb-backend --region europe-west1 --limit 50

# Verificar variables de entorno
gcloud run services describe stsweb-backend --region europe-west1 | grep -A 10 "env:"
```

---

## ⚡ Deploy Express (Sin Cloud Storage)

Si solo quieres deployar para probar sin archivos:

```bash
# 1. Migrar BD
cd backend
npm run migrate

# 2. Deploy backend
gcloud run deploy stsweb-backend --source . --region europe-west1

# 3. Deploy frontend  
cd ../frontend
gcloud run deploy stsweb --source . --region europe-west1

# ✅ Listo (upload no funcionará, pero el resto sí)
```

---

## 📊 Progreso del Deploy

```
[████████████████████] 100% - ✅ Código completo
[░░░░░░░░░░░░░░░░░░░░]   0% - ⏳ Cloud Storage
[░░░░░░░░░░░░░░░░░░░░]   0% - ⏳ Migración BD
[░░░░░░░░░░░░░░░░░░░░]   0% - ⏳ Deploy
[░░░░░░░░░░░░░░░░░░░░]   0% - ⏳ Testing

Tiempo restante: 30 min
```

---

## 🎯 Siguiente Paso

👉 **Ejecutar comandos de arriba en orden**  
👉 **O seguir QUICK_START.md para más detalles**

---

**¿Listo para deployar? ¡Copia y pega! 🚀**
