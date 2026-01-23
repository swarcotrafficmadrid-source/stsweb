# 🚀 Ecosistema Integral SAT - SWARCO Traffic Spain

## 📋 Descripción General

Plataforma completa de gestión de Servicio de Asistencia Técnica (SAT) que conecta a **clientes**, **personal de oficina (SAT)** y **técnicos de campo** para la gestión eficiente de incidencias, repuestos, compras y asistencias técnicas.

---

## ✨ Características Principales

### 👥 Portal del Cliente
- ✅ Registro y autenticación segura (JWT)
- ✅ Multi-idioma (ES, EN, IT, FR, DE, PT, etc.)
- ✅ 4 tipos de solicitudes:
  - **Incidencias** - Reportar fallos en equipos
  - **Repuestos** - Solicitar piezas de repuesto
  - **Compras** - Solicitar nuevos equipos
  - **Asistencias** - Programar asistencias (remota, telefónica, visita)
- ✅ Timeline visual del estado de cada ticket
- ✅ Sistema de mensajes bidireccional con SAT
- ✅ Seguimiento en tiempo real

### 🎫 Panel SAT Interno
- ✅ Dashboard con estadísticas en tiempo real
- ✅ Vista unificada de todos los tickets
- ✅ Filtros por tipo y estado
- ✅ Gestión de estados:
  - Pendiente → Asignado → En progreso → Esperando → Resuelto → Cerrado
- ✅ Sistema de comentarios (internos y públicos)
- ✅ Timeline completo de cada ticket
- ✅ Asignación de técnicos
- ✅ Generación de PDFs profesionales

### 📄 Generación de PDFs
- ✅ Informes técnicos con branding SWARCO
- ✅ Logo y datos fiscales (NIF: A87304655)
- ✅ Dirección: C/ Francisco Gervás, 12, Alcobendas
- ✅ Timeline completo del ticket
- ✅ Historial de comentarios
- ✅ Formato profesional A4

### 🔐 Seguridad y Robustez
- ✅ Rate limiting (protección contra ataques)
- ✅ Headers de seguridad HTTP
- ✅ Validación y sanitización de inputs
- ✅ Error reporting automático a `sfr.support@swarco.com`
- ✅ Error boundary en frontend
- ✅ Retry automático en fallos de red
- ✅ Sistema de roles (client, sat_admin, sat_technician)

### 📧 Notificaciones Automáticas
- ✅ Email al crear tickets
- ✅ Email al cambiar estados
- ✅ Email en nuevos comentarios
- ✅ Notificaciones a cliente y equipo SAT

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                     GOOGLE CLOUD RUN                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────┐              ┌─────────────────┐       │
│  │   FRONTEND     │              │    BACKEND      │       │
│  │   (React)      │◄────────────►│   (Node.js)     │       │
│  │   - Portal     │              │   - Express     │       │
│  │   - Panel SAT  │              │   - Sequelize   │       │
│  └────────────────┘              └─────────────────┘       │
│                                           │                  │
│                                           ▼                  │
│                                  ┌─────────────────┐        │
│                                  │   CLOUD SQL     │        │
│                                  │   (MySQL)       │        │
│                                  │   - Users       │        │
│                                  │   - Tickets     │        │
│                                  │   - Timeline    │        │
│                                  │   - Comments    │        │
│                                  └─────────────────┘        │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  EXTERNAL SERVICES                                          │
│  - Gmail API (notifications)                                │
│  - Google Translate API (i18n)                              │
│  - Cloud Build (CI/CD)                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Tipos de Usuarios

### 1. **Cliente** (`client`)
- Crear tickets (incidencias, repuestos, compras, asistencias)
- Ver estado de sus tickets
- Comunicarse con equipo SAT
- Recibir notificaciones

### 2. **Administrador SAT** (`sat_admin`)
- Todo lo anterior +
- Gestionar todos los tickets
- Cambiar estados
- Asignar técnicos
- Crear notas internas
- Generar PDFs
- Ver estadísticas completas

### 3. **Técnico SAT** (`sat_technician`)
- Ver tickets asignados
- Actualizar estados
- Agregar comentarios
- Generar PDFs

---

## 🚀 Cómo Usar

### Para Crear un Usuario SAT

#### Opción 1: API (Recomendado)
```bash
curl -X POST https://stsweb-backend-XXXXX.run.app/api/admin/create-sat-user \
  -H "Content-Type: application/json" \
  -d '{
    "adminKey": "TU_CLAVE_SECRETA",
    "email": "admin@swarco.com",
    "password": "Admin123!",
    "nombre": "Juan",
    "apellidos": "García",
    "role": "sat_admin"
  }'
```

#### Opción 2: Script (Backend local)
```bash
cd backend
npm run create-sat-user admin@swarco.com Admin123! Juan "García López" sat_admin
```

### Para Acceder al Panel SAT
1. Ir a: `https://staging.swarcotrafficspain.com`
2. Iniciar sesión con credenciales SAT
3. Navegar a `#sat` o agregar `/sat` en la URL
4. Ver dashboard completo

### Para Crear un Ticket (Cliente)
1. Registrarse en el portal
2. Verificar email
3. Iniciar sesión
4. Seleccionar tipo de solicitud:
   - **Incidencias**: Para reportar fallos
   - **Repuestos**: Para solicitar piezas
   - **Compras**: Para nuevos equipos
   - **Asistencias**: Para programar soporte
5. Completar formulario con validación en tiempo real
6. Revisar y confirmar
7. Recibir número de ticket único (INC-000001, REP-000001, etc.)

### Para Gestionar Tickets (SAT)
1. Acceder al Panel SAT
2. Ver dashboard con estadísticas
3. Filtrar por tipo/estado
4. Clic en ticket para ver detalles
5. Cambiar estado y agregar comentarios
6. Generar PDF del informe
7. Cliente recibe notificación automática

---

## 📊 Estados de Tickets

| Estado | Descripción | Color | Emoji |
|--------|-------------|-------|-------|
| **Pendiente** | Ticket recién creado | Amarillo | ⏳ |
| **Asignado** | Asignado a un técnico | Azul | 👤 |
| **En progreso** | Técnico trabajando | Morado | 🔄 |
| **Esperando** | Esperando respuesta/repuestos | Naranja | ⏸️ |
| **Resuelto** | Problema solucionado | Verde | ✅ |
| **Cerrado** | Ticket finalizado | Gris | 🔒 |

---

## 🔢 Números de Ticket

- **INC-XXXXXX**: Incidencias
- **REP-XXXXXX**: Repuestos
- **COM-XXXXXX**: Compras
- **ASI-XXXXXX**: Asistencias

Formato: 6 dígitos con ceros a la izquierda (ej: INC-000001)

---

## 📧 Emails Automáticos

### Se envían emails en:
1. **Nuevo ticket** → Cliente y SAT
2. **Cambio de estado** → Cliente
3. **Nuevo comentario SAT** → Cliente
4. **Nuevo comentario cliente** → SAT
5. **Error del sistema** → `sfr.support@swarco.com`

### Configuración SMTP
Variables en `.env`:
```env
MAIL_PROVIDER=gmail_api
GMAIL_SERVICE_ACCOUNT_JSON=base64_encoded_json
GMAIL_IMPERSONATE=email@swarco.com
GMAIL_FROM=noreply@swarco.com
```

---

## 🗄️ Estructura de Base de Datos

### Tablas Principales
- **usuarios**: Usuarios del sistema
- **failure_reports**: Incidencias
- **failure_equipments**: Equipos con fallo
- **spare_requests**: Solicitudes de repuestos
- **spare_items**: Ítems de repuestos
- **purchase_requests**: Solicitudes de compra
- **assistance_requests**: Solicitudes de asistencia
- **ticket_statuses**: Historial de estados
- **ticket_comments**: Comentarios y mensajes

---

## 🎨 Branding SWARCO

### Colores Corporativos
- **Azul SWARCO**: `#006BAB`
- **Naranja SWARCO**: `#F29200`
- **Gris oscuro**: `#333333`
- **Gris claro**: `#666666`

### Eslogan (NO traducir)
> "The better way, every day."

### Datos Fiscales
- **Empresa**: SWARCO TRAFFIC SPAIN SA
- **NIF**: A87304655
- **Dirección**: C/ Francisco Gervás, 12 - 28108 Alcobendas, Madrid

---

## 🔧 Deployment

### Backend
```bash
gcloud run deploy stsweb-backend \
  --source . \
  --region europe-west1 \
  --allow-unauthenticated
```

### Frontend
```bash
gcloud run deploy stsweb \
  --source . \
  --region europe-west1 \
  --allow-unauthenticated
```

### CI/CD Automático
- Push a `main` → Deploy automático
- Cloud Build configurado
- Triggers activos para frontend y backend

---

## 📈 Métricas y Monitoreo

### Dashboard SAT muestra:
- Total de tickets
- Tickets por tipo (incidencias, repuestos, compras, asistencias)
- Tickets por estado (pendiente, asignado, en progreso, etc.)
- Tickets recientes
- Actividad en tiempo real

---

## 🔐 Seguridad

### Implementada
✅ Rate limiting (5 auth attempts, 100 API requests / 15min)
✅ HTTPS forzado
✅ Headers de seguridad (XSS, clickjacking, MIME)
✅ JWT con expiración
✅ Passwords hasheados (bcrypt, 10 rounds)
✅ Validación de inputs
✅ Sanitización contra XSS
✅ Error boundaries

### Variables de Entorno Sensibles
```env
JWT_SECRET=your_secret_here
ADMIN_SECRET_KEY=your_admin_key_here
DB_PASSWORD=your_db_password
GMAIL_SERVICE_ACCOUNT_JSON=base64_json
```

---

## 📞 Soporte

### Emails Automáticos
- **Soporte general**: `sfr.support@swarco.com`
- **Errores del sistema**: `sfr.support@swarco.com`

### URLs
- **Producción (Staging)**: `https://staging.swarcotrafficspain.com`
- **Panel SAT**: `https://staging.swarcotrafficspain.com/#sat`
- **Backend API**: `https://stsweb-backend-964379250608.europe-west1.run.app`

---

## 🎉 Estado del Proyecto

**✅ COMPLETADO - ECOSISTEMA SAT FULL-STACK**

| Funcionalidad | Estado |
|---------------|--------|
| Portal Cliente | ✅ 100% |
| Panel SAT | ✅ 100% |
| Timeline | ✅ 100% |
| PDFs | ✅ 100% |
| Comentarios | ✅ 100% |
| Emails | ✅ 100% |
| Seguridad | ✅ 100% |
| Admin Tools | ✅ 100% |
| Multi-idioma | ✅ 100% |

---

## 📝 Notas Importantes

1. **Usuarios SAT** deben crearse manualmente con el script o API
2. **Clientes** pueden auto-registrarse (requiere activación por email)
3. **PDFs** se generan on-demand desde el Panel SAT
4. **Comentarios internos** solo visibles para equipo SAT
5. **Timeline** visible para cliente y SAT (con diferentes vistas)

---

## 🚀 Próximas Funcionalidades (Roadmap)

### Fase 5 (Opcional)
- 📱 App móvil para técnicos
- 📷 Escaneo de códigos QR
- 📍 Geolocalización de visitas
- 🔗 Integración con Jira/ERP
- 📊 Webhooks personalizados
- 📈 Analytics avanzados
- 🤖 Chatbot de soporte

---

**Desarrollado con ❤️ por el equipo SWARCO Traffic Spain**

*"The better way, every day."*
