# 🚀 Guía de Inicio Rápido - Sistema de Archivos

## ⏱️ Setup en 30 Minutos

### Paso 1: Instalar Dependencias (5 min)

```bash
# Backend
cd backend
npm install

# Verificar que se instalaron las nuevas dependencias:
# - @google-cloud/storage
# - multer
# - uuid
```

---

### Paso 2: Crear Bucket en Google Cloud Storage (10 min)

```bash
# Autenticarse
gcloud auth login

# Seleccionar proyecto
gcloud config set project ticketswarcotrafficspain

# Crear bucket
gsutil mb -l europe-west1 gs://swarco-tickets-files

# Configurar CORS (copiar y pegar todo el bloque)
echo '[
  {
    "origin": ["*"],
    "method": ["GET", "POST", "DELETE"],
    "responseHeader": ["Content-Type"],
    "maxAgeSeconds": 3600
  }
]' > cors.json && gsutil cors set cors.json gs://swarco-tickets-files

# Limpiar archivo temporal
rm cors.json
```

---

### Paso 3: Crear Service Account (5 min)

```bash
# Crear service account
gcloud iam service-accounts create swarco-storage \
  --display-name="SWARCO Storage"

# Dar permisos
gcloud projects add-iam-policy-binding ticketswarcotrafficspain \
  --member="serviceAccount:swarco-storage@ticketswarcotrafficspain.iam.gserviceaccount.com" \
  --role="roles/storage.objectAdmin"

# Generar clave
gcloud iam service-accounts keys create storage-key.json \
  --iam-account=swarco-storage@ticketswarcotrafficspain.iam.gserviceaccount.com

# Convertir a base64
cat storage-key.json | base64 -w 0 > storage-key-base64.txt

# Copiar contenido (se usará en el siguiente paso)
cat storage-key-base64.txt
```

---

### Paso 4: Configurar Variables de Entorno (3 min)

Para **Cloud Run** (Backend):

```bash
# Configurar todas las variables de golpe
gcloud run services update stsweb-backend \
  --region europe-west1 \
  --set-env-vars STORAGE_BUCKET_NAME=swarco-tickets-files \
  --set-env-vars GOOGLE_CLOUD_STORAGE_KEY=$(cat storage-key-base64.txt)
```

Para **Desarrollo Local** (crear/editar `.env`):

```bash
# Agregar estas líneas al archivo backend/.env
STORAGE_BUCKET_NAME=swarco-tickets-files
GOOGLE_CLOUD_STORAGE_KEY=<pegar_contenido_de_storage-key-base64.txt>
STORAGE_PUBLIC=false
```

---

### Paso 5: Migrar Base de Datos (2 min)

```bash
cd backend
npm run migrate

# Debería mostrar:
# ✅ Campo 'photos_count' agregado
# ✅ Campo 'photo_urls' agregado
# ✅ Tabla 'purchase_equipments' creada
# 🎉 ¡Migración completada con éxito!
```

---

### Paso 6: Verificar Sistema (2 min)

```bash
cd backend
npm run verify

# Debería mostrar:
# ✅ Conexión exitosa
# ✅ JWT Secret configurado
# ✅ Bucket accesible
# ✅ Permisos de lectura/escritura OK
# ✅ Gmail API configurado
# ✅ TODO ESTÁ PERFECTO!
```

---

### Paso 7: Deploy Backend (3 min)

```bash
cd backend
gcloud run deploy stsweb-backend \
  --source . \
  --region europe-west1 \
  --allow-unauthenticated \
  --platform managed \
  --project ticketswarcotrafficspain
```

Esperar a que termine el deploy (~2-3 min)

---

### Paso 8: Probar Upload (2 min)

```bash
# Test de health check
curl https://stsweb-backend-964379250608.europe-west1.run.app/api/upload/health

# Debería retornar:
# {
#   "status": "ok",
#   "storage": "connected",
#   "bucket": "swarco-tickets-files"
# }
```

---

### Paso 9: Deploy Frontend (2 min)

```bash
cd frontend
gcloud run deploy stsweb \
  --source . \
  --region europe-west1 \
  --allow-unauthenticated \
  --platform managed \
  --project ticketswarcotrafficspain
```

---

### Paso 10: ¡Probar en Vivo! (5 min)

1. Ir a https://staging.swarcotrafficspain.com
2. Login con usuario de prueba
3. Ir a "Incidencias"
4. Subir 2-3 fotos
5. Enviar formulario
6. ✅ Verificar que aparece confirmación
7. ✅ Ir a Panel SAT (#sat)
8. ✅ Ver el ticket
9. ✅ Click en foto → Debe abrir en tamaño completo
10. ✅ Generar PDF → Debe descargar

---

## ✅ Checklist Rápido

```
□ npm install (backend)
□ Bucket creado en GCS
□ Service account creada
□ Variables de entorno configuradas
□ npm run migrate ejecutado exitosamente
□ npm run verify retorna "TODO ESTÁ PERFECTO!"
□ Backend deployado
□ Frontend deployado
□ Health check retorna "connected"
□ Upload de prueba funciona
```

---

## 🆘 Troubleshooting Rápido

### Error: "Bucket does not exist"
```bash
gsutil mb -l europe-west1 gs://swarco-tickets-files
```

### Error: "Permission denied"
```bash
gcloud projects add-iam-policy-binding ticketswarcotrafficspain \
  --member="serviceAccount:swarco-storage@ticketswarcotrafficspain.iam.gserviceaccount.com" \
  --role="roles/storage.objectAdmin"
```

### Error: "Table already exists" en migrate
```bash
# Es normal si ya corriste migrate antes, ignorar y continuar
```

### Error: "Upload failed" en frontend
```bash
# Verificar health check primero
curl https://stsweb-backend-.../api/upload/health

# Si retorna error, verificar variables de entorno en Cloud Run
gcloud run services describe stsweb-backend --region europe-west1
```

---

## 📞 Soporte

- **Email:** sfr.support@swarco.com
- **Documentación completa:** `STORAGE_SETUP.md`
- **Status:** `IMPLEMENTATION_STATUS.md`

---

**Tiempo total: ~30 minutos**

*¡Listo para subir archivos! 🎉*
