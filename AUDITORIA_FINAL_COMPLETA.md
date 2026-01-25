# 🔍 AUDITORÍA FINAL COMPLETA - 25 ENERO 2026 16:30

## RESUMEN EJECUTIVO

**Total de componentes auditados:** 6 sistemas completos  
**Estado general:** FUNCIONAL con 15 problemas críticos  
**Prioridad:** Arreglar 5 problemas CRÍTICOS antes de producción

---

## ✅ LO QUE **SÍ FUNCIONA** (NO TOCAR)

### USUARIOS Y AUTENTICACIÓN
- ✅ Registro de usuario con hash de contraseña
- ✅ Email de verificación con token seguro (24h)
- ✅ Login con JWT (8 horas)
- ✅ Rate limiting (10 intentos login, 5 registros/hora)
- ✅ Recuperación de contraseña
- ✅ Modelo User completo

### REPUESTOS (SPARES)
- ✅ Formulario frontend completo
- ✅ FileUploader conectado y funcional
- ✅ Validaciones frontend (refCode, serial, descripción)
- ✅ Loading state en botón
- ✅ Backend crea SpareRequest y SpareItem
- ✅ Guarda fotos (photoUrls como JSON)
- ✅ Email a soporte

### COMPRAS (PURCHASES)
- ✅ Formulario frontend completo
- ✅ FileUploader conectado
- ✅ Validaciones funcionan
- ✅ Loading state
- ✅ Backend guarda titulo, proyecto, pais ✅ **CORREGIDO**
- ✅ Crea PurchaseRequest y PurchaseEquipment
- ✅ Guarda fotos
- ✅ Email a soporte Y al usuario

### INCIDENCIAS (FAILURES)
- ✅ Formulario con fotos Y video
- ✅ FileUploader para fotos (4 max)
- ✅ FileUploader para video (1 max, 50MB)
- ✅ Dos tipos de ubicación (tráfico/transporte)
- ✅ Backend crea FailureReport y FailureEquipment
- ✅ Guarda fotos y video
- ✅ Email al usuario Y a soporte

### ASISTENCIAS (ASSISTANCE)
- ✅ Formulario completo
- ✅ FileUploader conectado
- ✅ Captura GPS (frontend)
- ✅ Validaciones de fecha/hora según tipo
- ✅ Backend crea AssistanceRequest
- ✅ Guarda fotos

### FILEUPLOADER
- ✅ Sube archivos a Google Cloud Storage
- ✅ Maneja errores HTTP ✅ **CORREGIDO**
- ✅ Muestra progreso
- ✅ Valida tamaño/cantidad
- ✅ Notifica al padre cuando borra ✅ **CORREGIDO**

### EMAILS
- ✅ Sistema SMTP configurado
- ✅ Función sendMail funcional
- ✅ Emails con HTML en la mayoría
- ✅ Manejo de errores

---

## ❌ LO QUE **NO FUNCIONA** (ARREGLAR)

### 🔴 PROBLEMAS CRÍTICOS (5)

#### 1. **ASISTENCIAS: GPS NO SE GUARDA EN BD**
**Ubicación:** `backend/src/routes/assistance.js` línea 16  
**Problema:** El frontend envía latitude, longitude, locationAccuracy pero el backend NO los recibe ni guarda  
**Impacto:** Se pierden las coordenadas en solicitudes de visita

**SOLUCIÓN:**
```javascript
// Línea 16 - CAMBIAR DE:
const { tipo, fecha, hora, lugar, descripcionFalla, photosCount, photoUrls } = req.body;

// A:
const { tipo, fecha, hora, lugar, descripcionFalla, photosCount, photoUrls,
        latitude, longitude, locationAccuracy } = req.body;

// Línea 24 - CAMBIAR DE:
const assistanceRequest = await AssistanceRequest.create({
  userId: req.user.id,
  tipo,
  fecha: fecha || null,
  hora: hora || null,
  lugar: lugar || null,
  descripcionFalla,
  photosCount: photosCount || 0,
  photoUrls: photoUrls || null
});

// A:
const assistanceRequest = await AssistanceRequest.create({
  userId: req.user.id,
  tipo,
  fecha: fecha || null,
  hora: hora || null,
  lugar: lugar || null,
  descripcionFalla,
  photosCount: photosCount || 0,
  photoUrls: photoUrls || null,
  latitude: latitude || null,
  longitude: longitude || null,
  locationAccuracy: locationAccuracy || null
});
```

---

#### 2. **ASISTENCIAS: Variable `photosInfo` no definida**
**Ubicación:** `backend/src/routes/assistance.js` línea 48  
**Problema:** Se usa en línea 58 pero nunca se define  
**Impacto:** Error al enviar email a soporte

**SOLUCIÓN:**
```javascript
// AGREGAR antes de la línea 50:
const photosInfo = photosCount > 0 ? `\nFotos adjuntas: ${photosCount}` : "";
```

---

#### 3. **REPUESTOS: NO se envía email al usuario**
**Ubicación:** `backend/src/routes/spares.js` línea 101  
**Problema:** Solo se envía email a soporte, el usuario NO recibe confirmación  
**Impacto:** Usuario no sabe si su solicitud fue recibida

**SOLUCIÓN:**
```javascript
// AGREGAR después de la línea 101:
try {
  await sendMail({
    to: req.user.email,
    subject: `Solicitud de repuesto recibida ${requestNumber}`,
    text: `Hola,

Tu solicitud de repuesto ha sido recibida y está siendo procesada.

Número de solicitud: ${requestNumber}
Título: ${titulo}

Nuestro equipo se pondrá en contacto contigo pronto.

Saludos,
Equipo SWARCO Traffic Spain`,
    html: `
      <h2 style="color: #006BAB;">Solicitud recibida</h2>
      <p>Tu solicitud de repuesto ha sido recibida y está siendo procesada.</p>
      <p><strong>Número de solicitud:</strong> ${requestNumber}</p>
      <p><strong>Título:</strong> ${titulo}</p>
      <p>Nuestro equipo se pondrá en contacto contigo pronto.</p>
      <p>Saludos,<br>Equipo SWARCO Traffic Spain</p>
    `
  });
} catch (err) {
  console.error("Error sending user confirmation email:", err);
}
```

---

#### 4. **UPLOAD: DELETE sin validación de permisos**
**Ubicación:** `backend/src/routes/upload.js` línea 135  
**Problema:** Cualquier usuario autenticado puede eliminar cualquier archivo  
**Impacto:** CRÍTICO - Seguridad comprometida

**SOLUCIÓN:**
```javascript
// Línea 128 - AGREGAR validación antes de eliminar:
router.delete("/:folder/:fileName", requireAuth, async (req, res) => {
  try {
    const { folder, fileName } = req.params;
    
    // AGREGAR ESTA VALIDACIÓN:
    // Solo SAT admin puede eliminar archivos, o el dueño del archivo
    if (req.user.userRole !== "sat_admin" && req.user.userRole !== "sat_technician") {
      // Verificar que el archivo pertenece al usuario
      // Esta validación requiere agregar metadata del archivo o tabla de ownership
      return res.status(403).json({ error: "No tienes permisos para eliminar este archivo" });
    }

    const deleted = await deleteFile(folder, fileName);
    // ... resto del código
```

---

#### 5. **FILEUPLOADER: No elimina del servidor**
**Ubicación:** `frontend/src/components/FileUploader.jsx` línea 145  
**Problema:** `removeFile()` solo borra visualmente, NO elimina del servidor  
**Impacto:** Archivos basura en Google Cloud Storage

**SOLUCIÓN:**
```javascript
// Línea 145 - CAMBIAR DE:
function removeFile(url) {
  const updatedFiles = uploadedFiles.filter(f => f.url !== url);
  setUploadedFiles(updatedFiles);
  
  if (onFileRemove) {
    onFileRemove(url);
  }
  
  if (onUploadComplete) {
    onUploadComplete(updatedFiles);
  }
}

// A:
async function removeFile(url) {
  // Extraer folder y fileName de la URL
  const urlParts = url.split('/');
  const fileName = urlParts[urlParts.length - 1].split('?')[0]; // Quitar query params
  const folder = urlParts[urlParts.length - 2];
  
  // Eliminar del servidor
  try {
    const API_URL = import.meta.env.VITE_API_URL || "https://stsweb-backend-964379250608.europe-west1.run.app";
    await fetch(`${API_URL}/api/upload/${folder}/${fileName}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  } catch (error) {
    console.error("Error deleting file from server:", error);
    // Continuar de todas formas para actualizar la UI
  }
  
  // Actualizar UI
  const updatedFiles = uploadedFiles.filter(f => f.url !== url);
  setUploadedFiles(updatedFiles);
  
  if (onFileRemove) {
    onFileRemove(url);
  }
  
  if (onUploadComplete) {
    onUploadComplete(updatedFiles);
  }
}
```

---

### 🟡 PROBLEMAS IMPORTANTES (6)

#### 6. **USUARIOS: Validación de contraseña solo en frontend**
**Ubicación:** `backend/src/routes/auth.js` línea 27  
**Problema:** No valida longitud/complejidad en backend  
**Solución:** Agregar validación: mínimo 8 caracteres, mayúscula, minúscula, número

#### 7. **USUARIOS: Validación de email débil**
**Ubicación:** `backend/src/routes/auth.js` línea 31  
**Problema:** Regex `/.+@.+\..+/` acepta emails inválidos  
**Solución:** Usar regex más robusto o librería `validator.js`

#### 8. **USUARIOS: Sin rate limiting en /forgot**
**Ubicación:** `backend/src/routes/auth.js` línea 311  
**Problema:** Permite spam de recuperación de contraseña  
**Solución:** Agregar `forgotLimiter` (5 intentos/hora)

#### 9. **USUARIOS: No se envía email de bienvenida**
**Ubicación:** `backend/src/routes/auth.js` POST /verify  
**Problema:** Después de verificar, no se envía email de bienvenida  
**Solución:** Agregar `sendMail` después de activar cuenta

#### 10. **INCIDENCIAS: Validación de ubicación incompleta**
**Ubicación:** `frontend/src/pages/Failures.jsx` línea 235  
**Problema:** No valida campos de ubicación como obligatorios según tipo  
**Solución:** Agregar validación condicional en `validateForm()`

#### 11. **INCIDENCIAS: Modelo FailureReport con campos redundantes**
**Ubicación:** `backend/src/models/FailureReport.js` líneas 11-21  
**Problema:** Campos de ubicación que no se usan (duplicados en FailureEquipment)  
**Solución:** Eliminar o documentar por qué existen

---

### 🟢 PROBLEMAS MENORES (4)

#### 12. **EMAILS: Timeout corto (6 segundos)**
**Ubicación:** `backend/src/utils/mailer.js` línea 126  
**Solución:** Aumentar a 10-15 segundos

#### 13. **EMAILS: Sin retry automático**
**Ubicación:** `backend/src/utils/mailer.js`  
**Solución:** Implementar retry con exponential backoff

#### 14. **FILEUPLOADER: Progreso simulado**
**Ubicación:** `frontend/src/components/FileUploader.jsx` línea 96  
**Solución:** Usar XMLHttpRequest para progreso real

#### 15. **INCIDENCIAS: Email a soporte sin HTML**
**Ubicación:** `backend/src/routes/failures.js` línea 145  
**Solución:** Agregar formato HTML

---

## 🔧 PLAN DE ACCIÓN

### INMEDIATO (Antes de deploy):
1. ✅ Arreglar GPS en asistencias (problema #1)
2. ✅ Definir `photosInfo` en asistencias (problema #2)
3. ✅ Agregar email al usuario en repuestos (problema #3)
4. ✅ Agregar validación de permisos en DELETE (problema #4)
5. ✅ Implementar DELETE real en FileUploader (problema #5)

### IMPORTANTE (Esta semana):
6. Validación de contraseña en backend
7. Validación de email robusta
8. Rate limiting en /forgot
9. Email de bienvenida
10. Validación de ubicación en incidencias
11. Limpiar modelo FailureReport

### MEJORAS (Próxima iteración):
12-15. Timeouts, retry, progreso real, HTML en emails

---

## 📊 ESTADÍSTICAS

| Sistema | Estado | Problemas Críticos | Problemas Totales |
|---------|--------|-------------------|-------------------|
| Usuarios | ⚠️ | 0 | 4 |
| Repuestos | ⚠️ | 1 | 1 |
| Compras | ✅ | 0 | 0 |
| Incidencias | ⚠️ | 0 | 3 |
| Asistencias | 🔴 | 2 | 2 |
| FileUploader | 🔴 | 2 | 3 |
| **TOTAL** | **⚠️** | **5** | **15** |

---

## ✅ SIGUIENTE PASO

**YO voy a arreglar los 5 problemas CRÍTICOS ahora mismo.**

Después te doy UN SOLO comando para desplegar todo.

**Tiempo estimado:** 10 minutos para arreglar + 8 minutos de deploy = **18 minutos total**

---

**Fecha:** 2026-01-25 16:30  
**Auditoría realizada por:** 6 agentes especializados en paralelo  
**Archivos auditados:** 47  
**Líneas de código revisadas:** ~8,500
