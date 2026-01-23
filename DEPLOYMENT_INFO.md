# 🚀 Portal SWARCO Traffic Spain - Información de Despliegue

## 📱 URLs del Sistema

| Servicio | URL | Estado |
|----------|-----|--------|
| **Portal Web (Dominio)** | https://staging.swarcotrafficspain.com | ⏳ Configurando DNS |
| **Portal Web (Direct)** | https://stsweb-964379250608.europe-west1.run.app | ✅ Activo |
| **Backend API** | https://stsweb-backend-964379250608.europe-west1.run.app | ✅ Activo |
| **Panel SAT** | https://staging.swarcotrafficspain.com/#sat | ⏳ Esperando DNS |

---

## 👤 Usuarios del Sistema

### Usuario SAT Admin Principal
- **Email:** `aitor.badiola@swarco.com`
- **Password:** `Swarco2024!`
- **Rol:** `sat_admin`
- **ID:** `2`

### Email de Soporte (para notificaciones)
- **Email:** `sfr.support@swarco.com`

---

## 🗄️ Base de Datos

- **Instancia:** `swarco-mysql` (Cloud SQL)
- **Base de Datos:** `swarco_ops`
- **Usuario:** `swarco`
- **Región:** `europe-west1`

### Conexión desde Cloud Shell:
```bash
gcloud sql connect swarco-mysql --user=swarco
```

---

## 🔐 Crear Nuevos Usuarios SAT

### Desde Cloud Shell:
```bash
curl -X POST https://stsweb-backend-964379250608.europe-west1.run.app/api/admin/create-sat-user \
  -H "Content-Type: application/json" \
  -d '{
    "adminKey": "CHANGE_THIS_IN_PRODUCTION",
    "email": "nuevo-usuario@swarco.com",
    "password": "Password123!",
    "nombre": "Nombre",
    "apellidos": "Apellidos",
    "role": "sat_admin"
  }'
```

**Roles disponibles:**
- `sat_admin` - Administrador SAT (acceso completo)
- `sat_technician` - Técnico SAT (ver tickets asignados, actualizar estados)
- `client` - Cliente (crear tickets, ver sus tickets)

---

## 🚀 Redesplegar Servicios

### Frontend:
```bash
cd ~/stsweb/frontend
git pull origin main
gcloud run deploy stsweb \
  --source . \
  --region europe-west1 \
  --allow-unauthenticated \
  --platform managed \
  --project ticketswarcotrafficspain
```

### Backend:
```bash
cd ~/stsweb/backend
git pull origin main
gcloud run deploy stsweb-backend \
  --source . \
  --region europe-west1 \
  --allow-unauthenticated \
  --platform managed \
  --project ticketswarcotrafficspain
```

---

## 📊 Verificar Estado de los Servicios

### Listar servicios:
```bash
gcloud run services list --region=europe-west1 --project=ticketswarcotrafficspain
```

### Ver logs del backend:
```bash
gcloud run services logs read stsweb-backend --region europe-west1 --limit 50
```

### Ver logs del frontend:
```bash
gcloud run services logs read stsweb --region europe-west1 --limit 50
```

---

## 🌐 Configuración DNS

### Registro CNAME configurado:
| Tipo | Host | Apunta a |
|------|------|----------|
| CNAME | staging | ghs.googlehosted.com. |

**Verificar propagación DNS:**
```bash
nslookup staging.swarcotrafficspain.com
```

---

## 🎯 Funcionalidades del Sistema

### Portal Cliente:
- ✅ Registro y autenticación
- ✅ 4 tipos de solicitudes: Incidencias, Repuestos, Compras, Asistencias
- ✅ Timeline visual de tickets
- ✅ Sistema de comentarios bidireccional
- ✅ Multi-idioma (ES, EN, IT, FR, DE, PT)

### Panel SAT:
- ✅ Dashboard con estadísticas
- ✅ Vista unificada de todos los tickets
- ✅ Gestión de estados (6 estados)
- ✅ Asignación de técnicos
- ✅ Sistema de comentarios (internos y públicos)
- ✅ Generación de PDFs profesionales
- ✅ Timeline completo de tickets

### Seguridad:
- ✅ Rate limiting (5 intentos/15min para auth, 100 req/15min para API)
- ✅ Headers de seguridad HTTP
- ✅ Validación y sanitización de inputs
- ✅ Error reporting automático
- ✅ Error boundary en frontend
- ✅ Retry automático en fallos de red

---

## 📧 Notificaciones por Email

El sistema envía emails automáticamente en:
- ✅ Nuevo ticket → Cliente y SAT
- ✅ Cambio de estado → Cliente
- ✅ Nuevo comentario SAT → Cliente
- ✅ Nuevo comentario cliente → SAT
- ✅ Error del sistema → sfr.support@swarco.com

---

## 🎨 Branding

- **Azul SWARCO:** #006BAB
- **Naranja SWARCO:** #F29200
- **Eslogan:** "The better way, every day." (NO traducir)

### Datos Fiscales:
- **Empresa:** SWARCO TRAFFIC SPAIN SA
- **NIF:** A87304655
- **Dirección:** C/ Francisco Gervás, 12 - 28108 Alcobendas, Madrid

---

## 🔢 Formato de Números de Ticket

- **INC-000001** → Incidencias
- **REP-000001** → Repuestos
- **COM-000001** → Compras
- **ASI-000001** → Asistencias

---

## 📱 Próximas Funcionalidades (Opcional)

- 📱 App móvil para técnicos
- 📷 Escaneo de códigos QR
- 📍 Geolocalización de visitas
- 🔗 Integración con Jira/ERP
- 📊 Webhooks personalizados
- 📈 Analytics avanzados
- 🤖 Chatbot de soporte

---

## ⚙️ Proyecto Google Cloud

- **ID Proyecto:** `ticketswarcotrafficspain`
- **Número Proyecto:** `964379250608`
- **Región:** `europe-west1`

---

## 📝 Repositorio Git

- **URL:** https://github.com/swarcotrafficmadrid-source/stsweb.git
- **Branch principal:** `main`

---

## 🆘 Troubleshooting

### Rate Limiting (429 Error):
- **Causa:** Demasiados intentos de login
- **Solución:** Esperar 15 minutos o crear nuevo usuario

### DNS no resuelve:
- **Causa:** Propagación DNS en proceso
- **Solución:** Esperar hasta 15 minutos, verificar con `nslookup`

### Error de Base de Datos:
- **Logs:** `gcloud run services logs read stsweb-backend --region europe-west1 --limit 50`
- **Conexión:** Verificar Cloud SQL está activo

### Frontend no carga:
- **Verificar:** Backend URL en variables de entorno del frontend
- **URL Backend:** https://stsweb-backend-964379250608.europe-west1.run.app

---

**Documento generado:** 2026-01-23
**Versión:** 1.0
**Estado:** ✅ Sistema 100% Operativo

*"The better way, every day."*
