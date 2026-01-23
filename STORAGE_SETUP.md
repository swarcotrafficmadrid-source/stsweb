# 📦 Configuración de Google Cloud Storage

## Paso 1: Crear un Bucket en Google Cloud

```bash
# Autenticarse en Google Cloud
gcloud auth login

# Seleccionar el proyecto
gcloud config set project ticketswarcotrafficspain

# Crear bucket para archivos
gsutil mb -l europe-west1 gs://swarco-tickets-files

# Configurar CORS (permitir uploads desde frontend)
echo '[
  {
    "origin": ["*"],
    "method": ["GET", "POST", "DELETE"],
    "responseHeader": ["Content-Type"],
    "maxAgeSeconds": 3600
  }
]' > cors.json

gsutil cors set cors.json gs://swarco-tickets-files

# Configurar lifecycle (eliminar archivos de más de 90 días)
echo '{
  "lifecycle": {
    "rule": [
      {
        "action": {"type": "Delete"},
        "condition": {"age": 90}
      }
    ]
  }
}' > lifecycle.json

gsutil lifecycle set lifecycle.json gs://swarco-tickets-files
```

---

## Paso 2: Crear Service Account

```bash
# Crear service account
gcloud iam service-accounts create swarco-storage \
  --display-name="SWARCO Storage Service Account"

# Dar permisos de Storage Object Admin
gcloud projects add-iam-policy-binding ticketswarcotrafficspain \
  --member="serviceAccount:swarco-storage@ticketswarcotrafficspain.iam.gserviceaccount.com" \
  --role="roles/storage.objectAdmin"

# Generar clave JSON
gcloud iam service-accounts keys create storage-key.json \
  --iam-account=swarco-storage@ticketswarcotrafficspain.iam.gserviceaccount.com

# Convertir a base64 (para variable de entorno)
cat storage-key.json | base64 -w 0 > storage-key-base64.txt
```

---

## Paso 3: Configurar Variables de Entorno

### Para Cloud Run (Backend):

```bash
# Configurar variable de entorno en Cloud Run
gcloud run services update stsweb-backend \
  --region europe-west1 \
  --set-env-vars STORAGE_BUCKET_NAME=swarco-tickets-files,GOOGLE_CLOUD_STORAGE_KEY=$(cat storage-key-base64.txt)
```

### Para desarrollo local:

Agregar en `.env`:
```bash
STORAGE_BUCKET_NAME=swarco-tickets-files
GOOGLE_CLOUD_STORAGE_KEY=<contenido_de_storage-key-base64.txt>
STORAGE_PUBLIC=false
```

---

## Paso 4: Verificar Instalación

```bash
# Test de conexión
curl https://stsweb-backend-964379250608.europe-west1.run.app/api/upload/health

# Debería retornar:
# {
#   "status": "ok",
#   "storage": "connected",
#   "bucket": "swarco-tickets-files"
# }
```

---

## Paso 5: Instalar Dependencias

```bash
cd backend
npm install @google-cloud/storage multer uuid
```

---

## Estructura de Carpetas en el Bucket

```
swarco-tickets-files/
├── failures/           # Fotos y videos de incidencias
│   ├── 1706012345-a1b2c3d4.jpg
│   ├── 1706012346-e5f6g7h8.mp4
│   └── ...
├── spares/            # Fotos de repuestos
│   ├── 1706012347-i9j0k1l2.jpg
│   └── ...
├── purchases/         # Fotos de compras
│   ├── 1706012348-m3n4o5p6.jpg
│   └── ...
├── assistance/        # Fotos de asistencias
│   ├── 1706012349-q7r8s9t0.jpg
│   └── ...
└── temp/              # Archivos temporales (se eliminan automáticamente)
```

---

## Límites y Restricciones

### Tipos de Archivo Permitidos:

**Imágenes:**
- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WEBP (.webp)

**Videos:**
- MP4 (.mp4)
- WEBM (.webm)
- QuickTime (.mov)

### Tamaños Máximos:
- Imágenes: **5 MB**
- Videos: **50 MB**
- Request completo: **50 MB**

### Límites de Rate:
- **20 uploads individuales** por minuto por usuario
- **10 uploads múltiples** por minuto por usuario

---

## Seguridad

### URLs Firmadas:
- Todos los archivos usan URLs firmadas
- Validez: **7 días** por defecto
- Se regeneran automáticamente al acceder

### Control de Acceso:
- ✅ Solo usuarios autenticados pueden subir
- ✅ Solo dueños del ticket pueden ver archivos
- ✅ Personal SAT puede ver todos los archivos
- ✅ URLs expiran automáticamente

---

## Costos Estimados

Para **1,000 tickets/mes** con promedio de **3 fotos** por ticket:

- **Almacenamiento:** ~15 GB/mes = **$0.30/mes**
- **Transferencia:** ~45 GB/mes = **$4.50/mes**
- **Operaciones API:** ~50,000 ops/mes = **$0.02/mes**

**Total estimado: ~$5/mes**

---

## Troubleshooting

### Error: "Google Cloud Storage no está configurado"
- Verificar que `STORAGE_BUCKET_NAME` y `GOOGLE_CLOUD_STORAGE_KEY` estén configurados
- Verificar que la service account tenga permisos

### Error: "Archivo muy grande"
- Verificar tamaño del archivo (máx 5MB fotos, 50MB videos)
- Comprimir imagen antes de subir

### Error: "Bucket does not exist"
- Crear el bucket con `gsutil mb -l europe-west1 gs://swarco-tickets-files`

### Error: "Permission denied"
- Verificar IAM roles de la service account
- Agregar rol `roles/storage.objectAdmin`

---

## Comandos Útiles

```bash
# Ver archivos en el bucket
gsutil ls gs://swarco-tickets-files/

# Ver detalles de un archivo
gsutil stat gs://swarco-tickets-files/failures/archivo.jpg

# Eliminar archivo
gsutil rm gs://swarco-tickets-files/failures/archivo.jpg

# Ver uso de espacio
gsutil du -sh gs://swarco-tickets-files/

# Listar archivos recientes
gsutil ls -l gs://swarco-tickets-files/** | sort -k2 -r | head -20
```

---

## Mantenimiento

### Limpieza Manual:
```bash
# Eliminar archivos de más de 90 días
gsutil -m rm gs://swarco-tickets-files/**/$(date -d '90 days ago' +%Y%m%d)*
```

### Backup:
```bash
# Hacer backup de todo el bucket
gsutil -m cp -r gs://swarco-tickets-files gs://swarco-tickets-backup
```

---

**Última actualización:** 2026-01-23
**Versión:** 1.0

*¿Preguntas? → sfr.support@swarco.com*
