# 📡 API REST Pública - SWARCO SAT

**Versión:** 1.0  
**Base URL:** `https://stsweb-backend-964379250608.europe-west1.run.app/api/public`  
**Autenticación:** API Key  

---

## 🔐 Autenticación

Todas las peticiones requieren una API Key en el header:

```http
X-API-Key: your-api-key-here
```

### Obtener API Key:

```bash
# Contactar a sfr.support@swarco.com para solicitar una API Key
# O crear desde el Panel SAT → Webhooks → API Keys
```

---

## 📊 Endpoints Disponibles

### 🎫 **Tickets**

#### 1. Listar Tickets

```http
GET /api/public/tickets
```

**Query Parameters:**
- `type` (opcional): `failure`, `spare`, `purchase`, `assistance`, `all`
- `limit` (opcional): Número de resultados (default: 100, máx: 500)
- `offset` (opcional): Offset para paginación (default: 0)

**Ejemplo:**
```bash
curl -H "X-API-Key: your-key" \
  "https://stsweb-backend-.../api/public/tickets?type=failure&limit=50"
```

**Respuesta:**
```json
{
  "total": 50,
  "limit": 50,
  "offset": 0,
  "data": [
    {
      "id": 123,
      "type": "failure",
      "titulo": "Panel sin conectividad",
      "prioridad": "Alta",
      "createdAt": "2026-01-23T10:30:00Z",
      "User": {
        "id": 45,
        "nombre": "Juan",
        "apellidos": "García",
        "empresa": "Autopistas del Norte",
        "email": "juan@autopistas.es"
      }
    }
  ]
}
```

---

#### 2. Obtener Ticket Específico

```http
GET /api/public/tickets/:type/:id
```

**Parámetros:**
- `type`: `failure`, `spare`, `purchase`, `assistance`
- `id`: ID del ticket

**Ejemplo:**
```bash
curl -H "X-API-Key: your-key" \
  "https://stsweb-backend-.../api/public/tickets/failure/123"
```

**Respuesta:**
```json
{
  "id": 123,
  "type": "failure",
  "titulo": "Panel sin conectividad",
  "descripcionGeneral": "El panel no responde",
  "prioridad": "Alta",
  "createdAt": "2026-01-23T10:30:00Z",
  "failure_equipments": [
    {
      "id": 456,
      "description": "Panel principal",
      "refCode": "PN123A",
      "serial": "123456",
      "photoUrls": ["https://storage..."],
      "videoUrl": "https://storage..."
    }
  ],
  "User": {...},
  "statuses": [
    {
      "status": "pending",
      "createdAt": "2026-01-23T10:30:00Z"
    },
    {
      "status": "in_progress",
      "createdAt": "2026-01-23T11:00:00Z"
    }
  ],
  "comments": [...]
}
```

---

#### 3. Crear Ticket

```http
POST /api/public/tickets/:type
```

**Requiere permiso:** `write`

**Parámetros:**
- `type`: `failure`, `spare`, `purchase`, `assistance`

**Body (ejemplo para failure):**
```json
{
  "userId": 45,
  "titulo": "Panel sin conectividad",
  "descripcionGeneral": "El panel no responde desde esta mañana",
  "prioridad": "Alta",
  "equipments": [
    {
      "description": "Panel principal",
      "company": "SWARCO",
      "refCode": "PN123A",
      "serial": "123456",
      "locationType": "trafico",
      "locationVia": "A-1",
      "locationPk": "25.5"
    }
  ]
}
```

**Respuesta:**
```json
{
  "id": 124,
  "type": "failure",
  "message": "Ticket creado exitosamente"
}
```

---

#### 4. Agregar Comentario

```http
POST /api/public/tickets/:type/:id/comment
```

**Requiere permiso:** `write`

**Body:**
```json
{
  "userId": 45,
  "message": "Actualización: El problema persiste"
}
```

**Respuesta:**
```json
{
  "id": 789,
  "ticketId": 123,
  "ticketType": "failure",
  "userId": 45,
  "message": "Actualización: El problema persiste",
  "createdAt": "2026-01-23T12:00:00Z"
}
```

---

### 👥 **Usuarios**

#### 1. Listar Usuarios

```http
GET /api/public/users
```

**Query Parameters:**
- `limit` (opcional): default 100, máx 500
- `offset` (opcional): default 0

**Ejemplo:**
```bash
curl -H "X-API-Key: your-key" \
  "https://stsweb-backend-.../api/public/users?limit=20"
```

**Respuesta:**
```json
{
  "total": 20,
  "data": [
    {
      "id": 45,
      "nombre": "Juan",
      "apellidos": "García",
      "empresa": "Autopistas del Norte",
      "email": "juan@autopistas.es",
      "telefono": "+34 666 555 444",
      "pais": "España"
    }
  ]
}
```

---

#### 2. Obtener Usuario

```http
GET /api/public/users/:id
```

**Ejemplo:**
```bash
curl -H "X-API-Key: your-key" \
  "https://stsweb-backend-.../api/public/users/45"
```

---

### 📚 **Documentación**

#### Obtener Info de la API

```http
GET /api/public/docs
```

**Sin autenticación requerida**

Retorna la documentación completa de la API en formato JSON.

---

## 🔗 Integración con Jira

### Ejemplo: Crear Issue en Jira desde Webhook

**1. Configurar Webhook en Panel SAT:**

```json
{
  "name": "Jira Integration",
  "url": "https://tu-servidor.com/jira-webhook",
  "events": ["ticket.created"],
  "secret": "your-secret-key"
}
```

**2. En tu servidor, recibir webhook:**

```javascript
// Node.js + Express
app.post("/jira-webhook", async (req, res) => {
  const { event, data } = req.body;
  
  if (event === "ticket.created") {
    // Crear issue en Jira
    const jiraIssue = await createJiraIssue({
      summary: `SWARCO Ticket ${data.ticketNumber}`,
      description: `Ticket creado en sistema SAT`,
      project: "SUPPORT",
      issueType: "Bug"
    });
    
    console.log("Jira issue created:", jiraIssue.key);
  }
  
  res.json({ received: true });
});
```

---

## 🔗 Integración con ERP

### Ejemplo: Sincronizar Purchases con ERP

```javascript
// Obtener todas las compras del último mes
const startDate = new Date();
startDate.setMonth(startDate.getMonth() - 1);

const response = await fetch(
  `https://stsweb-backend-.../api/public/tickets?type=purchase&limit=500`,
  {
    headers: {
      "X-API-Key": "your-key"
    }
  }
);

const { data: purchases } = await response.json();

// Sincronizar con tu ERP
for (const purchase of purchases) {
  await syncToERP({
    externalId: purchase.id,
    customer: purchase.User.empresa,
    items: purchase.PurchaseEquipments,
    status: purchase.status,
    createdAt: purchase.createdAt
  });
}
```

---

## 🎣 Webhooks

### Eventos Disponibles:

| Evento | Cuándo se Dispara |
|--------|-------------------|
| `ticket.created` | Al crear un ticket nuevo |
| `ticket.updated` | Al actualizar datos del ticket |
| `ticket.statusChanged` | Al cambiar estado del ticket |
| `comment.added` | Al agregar comentario |
| `file.uploaded` | Al subir archivo |
| `*` | Todos los eventos |

### Formato del Payload:

```json
{
  "event": "ticket.created",
  "timestamp": "2026-01-23T10:30:00Z",
  "data": {
    "ticketId": 123,
    "ticketType": "failure",
    "ticketNumber": "INC-000123",
    "userId": 45,
    "createdAt": "2026-01-23T10:30:00Z"
  }
}
```

### Verificar Firma:

```javascript
const crypto = require("crypto");

function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(JSON.stringify(payload))
    .digest("hex");
  
  return signature === expectedSignature;
}

// En tu endpoint:
app.post("/webhook", (req, res) => {
  const signature = req.headers["x-webhook-signature"];
  const isValid = verifyWebhookSignature(req.body, signature, "your-secret");
  
  if (!isValid) {
    return res.status(401).json({ error: "Invalid signature" });
  }
  
  // Procesar webhook...
});
```

---

## 🔒 Permisos

### Tipos de Permisos:

| Permiso | Acceso |
|---------|--------|
| `read` | Leer tickets y usuarios |
| `write` | Crear tickets y comentarios |
| `delete` | Eliminar tickets (admin) |

---

## ⚡ Rate Limiting

- **Límite:** 100 requests / minuto
- **Header de respuesta:** `X-RateLimit-Remaining`

Si excedes el límite:
```json
{
  "error": "Rate limit exceeded. Try again in 60 seconds."
}
```

---

## 🐛 Códigos de Error

| Código | Significado |
|--------|-------------|
| `401` | API Key inválida o faltante |
| `403` | Sin permisos para esta acción |
| `404` | Recurso no encontrado |
| `429` | Rate limit excedido |
| `500` | Error del servidor |

---

## 💡 Ejemplos de Integración

### Jira Cloud:

```javascript
// Sincronizar tickets bidireccional
async function syncWithJira() {
  // 1. Obtener tickets de SAT
  const satTickets = await fetchSATTickets();
  
  // 2. Para cada ticket, verificar si existe en Jira
  for (const ticket of satTickets) {
    const jiraIssue = await findJiraIssue(ticket.id);
    
    if (!jiraIssue) {
      // Crear en Jira
      await createJiraIssue(ticket);
    } else {
      // Actualizar en Jira
      await updateJiraIssue(jiraIssue.key, ticket);
    }
  }
  
  // 3. Webhook de Jira → SAT (cuando cambia estado)
  // Configurar en Jira: Settings → System → Webhooks
  // URL: https://tu-servidor.com/jira-to-sat
}
```

### SAP ERP:

```javascript
// Exportar compras a SAP
async function exportToSAP() {
  const purchases = await fetch(
    "https://stsweb-backend-.../api/public/tickets?type=purchase",
    { headers: { "X-API-Key": "your-key" } }
  ).then(r => r.json());
  
  for (const purchase of purchases.data) {
    await sapClient.createPurchaseOrder({
      customerId: purchase.User.id,
      items: purchase.PurchaseEquipments.map(eq => ({
        material: eq.nombre,
        quantity: eq.cantidad,
        description: eq.descripcion
      }))
    });
  }
}
```

### Odoo:

```python
# Python + Odoo API
import requests

# Obtener tickets de SAT
response = requests.get(
    "https://stsweb-backend-.../api/public/tickets?type=spare",
    headers={"X-API-Key": "your-key"}
)

tickets = response.json()["data"]

# Crear en Odoo
for ticket in tickets:
    odoo.execute_kw(
        db, uid, password,
        'helpdesk.ticket', 'create',
        [{
            'name': ticket['titulo'],
            'partner_id': ticket['User']['id'],
            'description': ticket['descripcionGeneral']
        }]
    )
```

---

## 📊 Webhooks Bidireccionales

### SAT → Jira

```javascript
// Configurar en Panel SAT
{
  "name": "Jira Sync",
  "url": "https://your-server.com/sat-to-jira",
  "events": ["ticket.created", "ticket.statusChanged"]
}

// En tu servidor
app.post("/sat-to-jira", async (req, res) => {
  const { event, data } = req.body;
  
  if (event === "ticket.created") {
    await jira.createIssue({
      summary: `SAT-${data.ticketNumber}`,
      customFields: { satTicketId: data.ticketId }
    });
  }
  
  res.json({ success: true });
});
```

### Jira → SAT

```javascript
// Configurar webhook en Jira
// Cuando cambia estado en Jira → actualizar SAT

app.post("/jira-to-sat", async (req, res) => {
  const { issue } = req.body;
  const satTicketId = issue.fields.customfield_satId;
  
  // Agregar comentario en SAT
  await fetch(
    `https://stsweb-backend-.../api/public/tickets/failure/${satTicketId}/comment`,
    {
      method: "POST",
      headers: {
        "X-API-Key": "your-key",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userId: 1, // ID de usuario de sistema
        message: `Estado actualizado en Jira: ${issue.fields.status.name}`
      })
    }
  );
  
  res.json({ success: true });
});
```

---

## 🛡️ Seguridad

### Buenas Prácticas:

1. **Nunca exponer API Keys** en código frontend
2. **Rotar keys regularmente** (cada 90 días)
3. **Usar HTTPS** siempre
4. **Verificar firma** de webhooks
5. **Validar payloads** antes de procesar
6. **Logs de auditoría** de todas las llamadas

### Verificación de Firma de Webhook:

```javascript
import crypto from "crypto";

function verifyWebhook(payload, signature, secret) {
  const expectedSig = crypto
    .createHmac("sha256", secret)
    .update(JSON.stringify(payload))
    .digest("hex");
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSig)
  );
}
```

---

## 📈 Analytics API

### Dashboard Metrics

```http
GET /api/analytics/dashboard
```

**Requiere:** Token JWT (no API Key)

**Respuesta:**
```json
{
  "summary": {
    "totalTickets": 1523,
    "totalFailures": 845,
    "totalSpares": 312,
    "totalPurchases": 256,
    "totalAssistance": 110
  },
  "ticketsByStatus": [...],
  "activityByDay": [...],
  "topUsers": [...]
}
```

### Resolution Time

```http
GET /api/analytics/resolution-time?ticketType=failure
```

**Respuesta:**
```json
{
  "averageResolutionTime": 18.5,
  "totalResolved": 423,
  "resolutionTimes": [...]
}
```

### Export to CSV

```http
GET /api/analytics/export?type=failures&startDate=2026-01-01&endDate=2026-01-31
```

Descarga CSV con todos los tickets del período.

---

## 🧪 Testing

### cURL Examples:

```bash
# Test de autenticación
curl -H "X-API-Key: test-key" \
  https://stsweb-backend-.../api/public/docs

# Listar tickets
curl -H "X-API-Key: your-key" \
  "https://stsweb-backend-.../api/public/tickets?limit=10"

# Obtener ticket específico
curl -H "X-API-Key: your-key" \
  https://stsweb-backend-.../api/public/tickets/failure/123

# Crear ticket
curl -X POST \
  -H "X-API-Key: your-key" \
  -H "Content-Type: application/json" \
  -d '{"userId":45,"titulo":"Test","equipments":[]}' \
  https://stsweb-backend-.../api/public/tickets/failure
```

### Postman Collection:

Importar esta colección en Postman:

```json
{
  "info": {
    "name": "SWARCO SAT API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/"
  },
  "auth": {
    "type": "apikey",
    "apikey": [
      { "key": "key", "value": "X-API-Key" },
      { "key": "value", "value": "{{apiKey}}" },
      { "key": "in", "value": "header" }
    ]
  },
  "variable": [
    { "key": "baseUrl", "value": "https://stsweb-backend-964379250608.europe-west1.run.app/api/public" },
    { "key": "apiKey", "value": "your-api-key-here" }
  ],
  "item": [
    {
      "name": "List Tickets",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/tickets?type=failure&limit=10"
      }
    },
    {
      "name": "Get Ticket",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/tickets/failure/123"
      }
    }
  ]
}
```

---

## 💼 Casos de Uso Reales

### 1. Dashboard Externo

```javascript
// Mostrar métricas de SAT en tu dashboard corporativo
async function getSATMetrics() {
  const tickets = await fetch(
    "https://stsweb-backend-.../api/public/tickets?type=all&limit=1000",
    { headers: { "X-API-Key": process.env.SAT_API_KEY } }
  ).then(r => r.json());
  
  return {
    open: tickets.data.filter(t => t.status !== "closed").length,
    closed: tickets.data.filter(t => t.status === "closed").length,
    critical: tickets.data.filter(t => t.prioridad === "Alta").length
  };
}
```

### 2. Notificaciones a Slack

```javascript
// Webhook que notifica a Slack cuando se crea un ticket crítico
app.post("/sat-webhook", async (req, res) => {
  const { event, data } = req.body;
  
  if (event === "ticket.created" && data.priority === "Alta") {
    await fetch("https://hooks.slack.com/services/YOUR/WEBHOOK/URL", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: `🚨 Ticket Crítico: ${data.ticketNumber}`,
        attachments: [{
          color: "danger",
          fields: [
            { title: "Tipo", value: data.ticketType, short: true },
            { title: "Cliente", value: data.customer, short: true }
          ]
        }]
      })
    });
  }
  
  res.json({ ok: true });
});
```

### 3. Reporte Diario Automático

```javascript
// Cron job que envía reporte diario por email
cron.schedule("0 9 * * *", async () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  const tickets = await fetch(
    `https://stsweb-backend-.../api/public/tickets`,
    { headers: { "X-API-Key": process.env.SAT_API_KEY } }
  ).then(r => r.json());
  
  const created = tickets.data.filter(t => 
    new Date(t.createdAt) >= yesterday
  );
  
  await sendEmail({
    to: "manager@company.com",
    subject: "Reporte Diario SAT",
    text: `Tickets creados ayer: ${created.length}`
  });
});
```

---

## 📞 Soporte

- **Email:** sfr.support@swarco.com
- **Documentación:** https://staging.swarcotrafficspain.com/api/docs
- **Status:** https://status.swarco.com

---

## 🔄 Changelog de la API

### v1.0 (2026-01-23)
- ✅ Endpoints de tickets (GET, POST)
- ✅ Endpoints de usuarios (GET)
- ✅ Sistema de webhooks
- ✅ Autenticación por API Key
- ✅ Rate limiting
- ✅ Exportar a CSV

---

**Desarrollado por SWARCO Traffic Spain**  
*"The better way, every day."*
