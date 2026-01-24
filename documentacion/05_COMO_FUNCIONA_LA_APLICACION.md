# 🎓 CÓMO FUNCIONA LA APLICACIÓN - SISTEMA STM WEB

**Explicación Simple y Clara**  
**SWARCO Traffic Spain**  
**Versión 3.0 - Enero 2026**

---

## 🌟 ¿QUÉ ES EL SISTEMA STM WEB?

El **Sistema STM Web** es una aplicación para **gestionar tickets de mantenimiento** en SWARCO Traffic Spain.

Imagina que tienes un problema con un semáforo o una señal de tráfico. Con esta aplicación puedes:

1. **Reportar el problema** (crear un ticket)
2. **Ver el estado** de tu reporte
3. **Comunicarte** con los técnicos que lo reparan
4. **Recibir notificaciones** cuando se resuelva

Es como tener un "WhatsApp" dedicado a reportar problemas de tráfico. 📱

---

## 🧩 PARTES DEL SISTEMA

El sistema tiene **3 partes principales**:

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   TÚ (Usuario)                                              │
│   │                                                         │
│   ├──► 1. FRONTEND (Lo que ves)                            │
│   │      - Pantalla de login                                │
│   │      - Formularios para crear tickets                   │
│   │      - Dashboard con tus tickets                        │
│   │                                                         │
│   │    ↓ Envía información                                  │
│   │                                                         │
│   ├──► 2. BACKEND (El cerebro)                             │
│   │      - Procesa tu información                           │
│   │      - Verifica que seas un usuario válido              │
│   │      - Guarda los tickets                               │
│   │      - Envía notificaciones                             │
│   │                                                         │
│   │    ↓ Guarda datos                                       │
│   │                                                         │
│   └──► 3. BASE DE DATOS (La memoria)                       │
│          - Guarda todos los tickets                         │
│          - Guarda usuarios y contraseñas                    │
│          - Guarda historial de cambios                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 PASO 1: LOGIN (INICIO DE SESIÓN)

### ¿Qué pasa cuando haces login?

```
Tú escribes:
┌──────────────────┐
│ Email: tu@mail   │
│ Password: ****   │
│  [ Entrar ]      │
└──────────────────┘
        │
        ▼
Frontend dice:
"Voy a verificar si este usuario existe"
        │
        ▼
Backend dice:
"Déjame buscar en la base de datos..."
        │
        ▼
Base de Datos dice:
"¡Sí existe! Su contraseña coincide ✅"
        │
        ▼
Backend genera un "TOKEN" (como una tarjeta de acceso):
"Aquí está tu token: eyJhbGciOiJIUzI1NiIs..."
        │
        ▼
Frontend guarda el token:
"Perfecto, ahora puedo entrar al sistema"
        │
        ▼
Te redirige al Dashboard 🏠
```

### ¿Qué es un TOKEN?

Un **token** es como una **tarjeta de acceso** a un edificio:

- Solo tú la tienes
- Expira después de 24 horas (como un pase temporal)
- La necesitas para acceder a todas las secciones
- Si la pierdes, tienes que hacer login de nuevo

**Técnicamente se llama:** JWT (JSON Web Token)

---

## 🎫 PASO 2: CREAR UN TICKET

### ¿Qué pasa cuando creas un ticket?

```
1️⃣ Rellenas el formulario:
┌─────────────────────────────────────┐
│ Título: Semáforo averiado           │
│ Descripción: No cambia de rojo...   │
│ Prioridad: Alta                     │
│ Ubicación: [📍 GPS capturado]       │
│ Fotos: [📷 3 imágenes]              │
│                                     │
│        [ Crear Ticket ]             │
└─────────────────────────────────────┘
        │
        ▼

2️⃣ Frontend empaqueta la información:
{
  "titulo": "Semáforo averiado",
  "descripcion": "No cambia de rojo...",
  "prioridad": "alta",
  "ubicacion": "40.4168, -3.7038",
  "fotos": [...]
}
        │
        ▼

3️⃣ Frontend envía al Backend (con tu TOKEN):
"Aquí va la información del ticket + mi token para demostrar que soy yo"
        │
        ▼

4️⃣ Backend verifica:
- ¿El token es válido? ✅
- ¿Los datos son correctos? ✅
- ¿Todos los campos obligatorios están? ✅
        │
        ▼

5️⃣ Backend guarda en Base de Datos:
INSERT INTO tickets (titulo, descripcion, prioridad, ubicacion...)
VALUES ("Semáforo averiado", "No cambia de rojo...", "alta", ...)
        │
        ▼

6️⃣ Base de Datos asigna un número:
"OK, este es el ticket #1025"
        │
        ▼

7️⃣ Backend notifica:
- Envía email al equipo SAT
- Actualiza las métricas
- Crea entrada en historial
        │
        ▼

8️⃣ Frontend muestra confirmación:
"✅ Ticket #1025 creado correctamente"
```

---

## 👀 PASO 3: VER TUS TICKETS

### ¿Cómo funciona el Dashboard?

```
1️⃣ Entras al Dashboard:
Frontend dice: "Voy a pedir todos los tickets de este usuario"
        │
        ▼

2️⃣ Frontend hace una petición:
GET /api/tickets
Headers: { Authorization: Bearer [tu_token] }
        │
        ▼

3️⃣ Backend verifica tu token:
"¿Este token es válido? Sí ✅"
"¿De qué usuario es? ID = 5"
        │
        ▼

4️⃣ Backend consulta Base de Datos:
SELECT * FROM tickets WHERE created_by = 5
        │
        ▼

5️⃣ Base de Datos retorna los tickets:
[
  { id: 1025, titulo: "Semáforo averiado", estado: "pendiente" },
  { id: 1024, titulo: "Panel apagado", estado: "en_progreso" },
  ...
]
        │
        ▼

6️⃣ Backend formatea la respuesta:
{
  "tickets": [...],
  "total": 45,
  "page": 1,
  "pages": 3
}
        │
        ▼

7️⃣ Frontend muestra en pantalla:
┌──────────────────────────────────────┐
│ 📋 MIS TICKETS                       │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ #1025 - Semáforo averiado 🔴    │ │
│ │ Estado: Pendiente                │ │
│ └──────────────────────────────────┘ │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ #1024 - Panel apagado 🟡        │ │
│ │ Estado: En Progreso              │ │
│ └──────────────────────────────────┘ │
└──────────────────────────────────────┘
```

---

## 💬 PASO 4: COMENTAR EN UN TICKET

### ¿Cómo funcionan los comentarios?

```
1️⃣ Escribes un comentario:
┌──────────────────────────────────────┐
│ Comentario: El problema persiste...  │
│                                      │
│          [ Enviar ]                  │
└──────────────────────────────────────┘
        │
        ▼

2️⃣ Frontend envía:
POST /api/tickets/1025/comments
Body: { "comment": "El problema persiste..." }
        │
        ▼

3️⃣ Backend guarda en Base de Datos:
INSERT INTO ticket_comments
(ticket_id, user_id, comment)
VALUES (1025, 5, "El problema persiste...")
        │
        ▼

4️⃣ Backend notifica a los involucrados:
- Email al técnico SAT asignado
- Notificación push (si está configurado)
        │
        ▼

5️⃣ Comentario aparece instantáneamente:
┌──────────────────────────────────────┐
│ 💬 COMENTARIOS                       │
│                                      │
│ María García - 23/01/2026 10:30      │
│ El problema persiste...              │
│                                      │
│ Juan SAT - 23/01/2026 09:00          │
│ Voy en camino al lugar.              │
└──────────────────────────────────────┘
```

---

## 🤖 PASO 5: CHATBOT IA

### ¿Cómo funciona el Chatbot?

El chatbot usa **Inteligencia Artificial (OpenAI GPT-4)** para responder preguntas.

```
1️⃣ Escribes una pregunta:
┌──────────────────────────────────────┐
│ 🤖 ASISTENTE IA                      │
│                                      │
│ Tú: ¿Cuánto tarda en repararse?      │
│                                      │
│         [ Enviar ]                   │
└──────────────────────────────────────┘
        │
        ▼

2️⃣ Frontend envía al Backend:
POST /api/chatbot/message
Body: {
  "message": "¿Cuánto tarda en repararse?",
  "ticketId": 1025
}
        │
        ▼

3️⃣ Backend prepara el contexto:
"Este es el ticket #1025: Semáforo averiado, prioridad alta"
"Usuario pregunta: ¿Cuánto tarda en repararse?"
        │
        ▼

4️⃣ Backend envía a OpenAI GPT-4:
"Pregunta del usuario sobre ticket de semáforo averiado..."
        │
        ▼

5️⃣ GPT-4 genera respuesta inteligente:
"Según el historial, reparar un semáforo toma 2-4 horas..."
        │
        ▼

6️⃣ Backend formatea la respuesta:
{
  "reply": "Según el historial...",
  "suggestions": [
    "¿Cuándo vendrá el técnico?",
    "¿Qué significa estado 'En Progreso'?"
  ]
}
        │
        ▼

7️⃣ Frontend muestra la respuesta:
┌──────────────────────────────────────┐
│ 🤖 Según el historial, reparar un   │
│ semáforo toma 2-4 horas desde que    │
│ el técnico llega. Para prioridad     │
│ ALTA, el tiempo de respuesta es      │
│ 1-2 horas.                           │
│                                      │
│ ¿Puedo ayudarte con algo más?        │
└──────────────────────────────────────┘
```

**Importante:** El chatbot tiene límites:
- Máximo 30 mensajes por hora
- Cooldown de 1 segundo entre mensajes
- Solo responde, no puede modificar tickets

---

## 🔔 PASO 6: NOTIFICACIONES

### ¿Cómo funcionan las notificaciones?

El sistema te avisa cuando algo importante pasa con tu ticket:

```
EVENTO EN EL SISTEMA:
"Ticket #1025 ha sido asignado a Juan SAT"
        │
        ▼

Backend detecta el cambio:
- Estado cambió de "Pendiente" → "Asignado"
- Usuario creador del ticket: María García (ID: 5)
        │
        ▼

Backend busca preferencias del usuario:
¿María quiere recibir notificaciones por email? ✅
¿María quiere notificaciones push? ✅
        │
        ▼

Backend envía notificaciones:

📧 EMAIL:
To: maria.garcia@swarcotrafficspain.com
Subject: Actualización en Ticket #1025
Body: "Tu ticket 'Semáforo averiado' ha sido asignado a Juan SAT..."

🔔 PUSH (en la web):
┌──────────────────────────────────────┐
│ 🔔 Nuevo                             │
│                                      │
│ Ticket #1025 asignado a Juan SAT     │
│ Hace 2 minutos                       │
└──────────────────────────────────────┘
        │
        ▼

Frontend actualiza:
- Ícono 🔔 muestra badge con número: "1"
- Lista de notificaciones se actualiza
- Ticket cambia de color en dashboard
```

---

## 🗺️ PASO 7: GEOLOCALIZACIÓN (GPS)

### ¿Cómo captura la ubicación?

Cuando creas un ticket, el sistema puede capturar automáticamente dónde estás:

```
1️⃣ Click en "📍 Capturar ubicación":
Frontend usa la API del navegador:
navigator.geolocation.getCurrentPosition(...)
        │
        ▼

2️⃣ Navegador pide permiso:
┌──────────────────────────────────────┐
│ ⚠️  staging.swarcotrafficspain.com   │
│     quiere acceder a tu ubicación    │
│                                      │
│   [ Bloquear ]    [ Permitir ]       │
└──────────────────────────────────────┘
        │
        ▼ (si permites)

3️⃣ GPS del dispositivo obtiene coordenadas:
Latitud: 40.4168
Longitud: -3.7038
Precisión: ±10 metros
        │
        ▼

4️⃣ Frontend guarda coordenadas:
"40.4168, -3.7038"
        │
        ▼

5️⃣ Frontend usa Google Maps API:
"¿Qué dirección corresponde a 40.4168, -3.7038?"
        │
        ▼

6️⃣ Google Maps responde:
"Calle Mayor 45, 28013 Madrid, España"
        │
        ▼

7️⃣ Se muestra en el formulario:
┌──────────────────────────────────────┐
│ Ubicación:                           │
│ ✅ Calle Mayor 45, 28013 Madrid      │
│ [📍 Ver en mapa]                     │
└──────────────────────────────────────┘
```

**Cuando el ticket se guarda:**
- Las coordenadas GPS van a la base de datos
- Técnicos SAT pueden ver en un mapa interactivo
- Se puede navegar directamente con Google Maps

---

## 🛡️ PASO 8: SEGURIDAD (Rate Limiting)

### ¿Cómo te protege el sistema?

El sistema tiene **límites** para prevenir abusos:

```
RATE LIMITING (Límite de peticiones)
═══════════════════════════════════

Imagina que alguien intenta hackear el sistema:

Hacker: intento 1 de login con password "123"
Sistema: ❌ Contraseña incorrecta

Hacker: intento 2 con password "456"
Sistema: ❌ Contraseña incorrecta

Hacker: intento 3 con password "789"
Sistema: ❌ Contraseña incorrecta

Hacker: intento 4 con password "abc"
Sistema: ❌ Contraseña incorrecta

Hacker: intento 5 con password "xyz"
Sistema: ❌ Contraseña incorrecta

Hacker: intento 6 con password "qwe"
Sistema: 🛑 BLOQUEADO
"Demasiados intentos. Espera 15 minutos."
        │
        ▼

Durante 15 minutos:
❌ No puede intentar login
❌ Incluso con la contraseña correcta
✅ Después de 15 min, el contador se resetea
```

**Límites implementados:**

| Acción | Límite | Ventana de Tiempo |
|--------|--------|-------------------|
| Login | 5 intentos | 15 minutos |
| Crear Ticket | 10 tickets | 1 hora |
| Chatbot | 30 mensajes | 1 hora |
| API General | 100 requests | 15 minutos |

---

## 🌐 PASO 9: CLOUD (LA NUBE)

### ¿Dónde "vive" la aplicación?

La aplicación NO está en una computadora física, está en **Google Cloud** (la nube).

```
        ☁️  GOOGLE CLOUD PLATFORM  ☁️
┌─────────────────────────────────────────┐
│                                         │
│  📦 Cloud Run (Contenedores)            │
│  ├── Frontend (React app)               │
│  │   - Siempre disponible 24/7          │
│  │   - Escala automáticamente           │
│  │                                      │
│  └── Backend (Node.js)                  │
│      - Procesa peticiones                │
│      - Escala según tráfico              │
│                                         │
│  💾 Cloud SQL (Base de Datos)           │
│  - MariaDB con todos los datos          │
│  - Backups automáticos diarios          │
│  - Alta disponibilidad                  │
│                                         │
│  🔒 Cloud IAM (Seguridad)               │
│  - Permisos y accesos controlados       │
│                                         │
│  📊 Cloud Monitoring (Monitoreo)        │
│  - Logs de errores                      │
│  - Métricas de performance              │
│                                         │
└─────────────────────────────────────────┘

         ▲              ▲
         │              │
    [Internet]     [Internet]
         │              │
         ▼              ▼
    
    👤 Usuario      👤 Usuario
    (España)        (Barcelona)
```

**Ventajas de estar en la nube:**

✅ **Disponible 24/7:** Nunca se apaga
✅ **Rápido:** Servidores de Google muy potentes
✅ **Escalable:** Si 100 personas entran al mismo tiempo, funciona igual
✅ **Seguro:** Backups automáticos, no se pierde información
✅ **Global:** Accesible desde cualquier parte del mundo

---

## 🔄 PASO 10: FLUJO COMPLETO DE UN TICKET

### Del Problema a la Solución:

```
DÍA 1 - 08:00 AM
══════════════════════════════════════════════════════════

📱 Usuario reporta problema:
"Semáforo en Calle Mayor 45 está en rojo permanente"

Frontend → Backend → Base de Datos
✅ Ticket #1025 creado

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DÍA 1 - 08:05 AM
══════════════════════════════════════════════════════════

🔔 Sistema envía notificación:
"Nuevo ticket #1025 - Prioridad ALTA"

📧 Email automático a equipo SAT
📲 Notificación push en app móvil SAT

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DÍA 1 - 08:15 AM
══════════════════════════════════════════════════════════

👨‍🔧 Supervisor SAT revisa:
"Ticket #1025 - Alta prioridad"

Asigna a: Juan Pérez SAT
Backend actualiza:
- Estado: Pendiente → Asignado
- Assigned_to: Juan Pérez (ID: 10)

🔔 Usuario recibe notificación:
"Tu ticket ha sido asignado a Juan Pérez"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DÍA 1 - 09:00 AM
══════════════════════════════════════════════════════════

👨‍🔧 Juan SAT ve el ticket en su móvil:
"Semáforo Calle Mayor 45 - Alta prioridad"

Click en "📍 Ver en mapa"
Google Maps abre con ubicación exacta

Juan comenta:
"He visto el ticket, me dirijo al lugar"

Backend guarda comentario
🔔 Usuario recibe notificación del comentario

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DÍA 1 - 09:30 AM
══════════════════════════════════════════════════════════

👨‍🔧 Juan llega al lugar:
Click en "Iniciar trabajo"

Backend actualiza:
- Estado: Asignado → En Progreso
- Timestamp inicio: 09:30

🔔 Usuario recibe notificación:
"Juan Pérez ha iniciado la reparación"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DÍA 1 - 11:15 AM
══════════════════════════════════════════════════════════

👨‍🔧 Juan termina reparación:
Click en "Completar"

Rellenó formulario:
- Resumen: "Reemplazado módulo de control defectuoso"
- Materiales: "Módulo XYZ-123"
- Fotos: [antes] [proceso] [después]

Backend actualiza:
- Estado: En Progreso → Completado
- Timestamp fin: 11:15
- Tiempo total: 1h 45min

🔔 Usuario recibe notificación:
"✅ Tu ticket #1025 ha sido completado"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DÍA 1 - 11:20 AM
══════════════════════════════════════════════════════════

📱 Usuario verifica:
"Semáforo funcionando correctamente ✅"

Deja comentario:
"Gracias, funciona perfecto"

(Opcionalmente puede valorar el servicio 5/5 ⭐)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RESUMEN:
- Tiempo total: 3 horas 15 minutos
- SLA cumplido: ✅ (objetivo <4h para prioridad Alta)
- Usuario satisfecho: ✅
- Ticket archivado en historial
```

---

## 📊 DATOS Y ESTADÍSTICAS

### ¿Cómo se generan los reportes?

```
1️⃣ Administrador pide reporte:
"Quiero ver tickets de la última semana"
        │
        ▼

2️⃣ Frontend envía petición:
GET /api/analytics/stats?period=last_week
        │
        ▼

3️⃣ Backend consulta Base de Datos:
SELECT 
  COUNT(*) as total,
  SUM(CASE WHEN status='completado' THEN 1 ELSE 0 END) as completados,
  AVG(TIMESTAMPDIFF(HOUR, created_at, updated_at)) as tiempo_promedio
FROM tickets
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY status, priority
        │
        ▼

4️⃣ Base de Datos retorna:
{
  total: 128,
  completados: 115,
  pendientes: 8,
  en_progreso: 5,
  tiempo_promedio: 4.2 horas,
  ...
}
        │
        ▼

5️⃣ Backend calcula métricas adicionales:
- Tasa de completados: 115/128 = 89.8%
- Tickets por técnico
- Cumplimiento SLA
- Tendencias
        │
        ▼

6️⃣ Frontend muestra gráficos:
┌──────────────────────────────────────┐
│ 📊 ANALYTICS                         │
│                                      │
│ Total: 128                           │
│ Completados: 115 (89.8%) ✅          │
│                                      │
│ [Gráfico de barras]                  │
│ [Gráfico de línea temporal]          │
│ [Tabla de técnicos SAT]              │
│                                      │
│ [📥 Exportar Excel]                  │
└──────────────────────────────────────┘
```

---

## 🔧 TECNOLOGÍAS USADAS

### Para entenderlo mejor:

**Frontend (Lo que ves):**
```
React = Librería para crear interfaces modernas
  └── Como un conjunto de piezas LEGO para construir la web

Vite = Herramienta para compilar el código rápido
  └── Como un "horno" que prepara la aplicación

Tailwind CSS = Estilos visuales
  └── Como una "caja de pinturas" para hacer bonita la web
```

**Backend (El cerebro):**
```
Node.js = Entorno para ejecutar JavaScript en servidor
  └── Como el "motor" que hace funcionar todo

Express.js = Framework web
  └── Como las "rutas" por donde viaja la información

Sequelize = ORM (Object-Relational Mapping)
  └── Como un "traductor" entre el código y la base de datos
```

**Base de Datos (La memoria):**
```
MariaDB = Sistema de base de datos
  └── Como un "archivador gigante" organizado en tablas
```

**Cloud (La nube):**
```
Google Cloud Run = Plataforma serverless
  └── Como "alquilar" servidores sin tener que comprarlos

Cloud SQL = Base de datos gestionada
  └── Google se encarga del mantenimiento automáticamente
```

---

## 🎯 RESUMEN FINAL

### El sistema funciona así:

```
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   1. Haces LOGIN → Backend verifica → Token generado          ║
║                                                               ║
║   2. Creas TICKET → Frontend envía → Backend guarda en BD     ║
║                                                               ║
║   3. SAT ASIGNADO → Backend notifica → Email + Push           ║
║                                                               ║
║   4. SAT REPARA → Actualiza estado → Usuario notificado       ║
║                                                               ║
║   5. COMPLETADO → Ticket archivado → Estadísticas actualizadas║
║                                                               ║
║   Todo esto pasa en SEGUNDOS y está en la NUBE ☁️             ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
```

### Ventajas del Sistema:

✅ **Rápido:** Responde en menos de 1 segundo
✅ **Seguro:** Tokens, rate limiting, HTTPS
✅ **Confiable:** Backups automáticos, sin pérdida de datos
✅ **Escalable:** Puede manejar 100+ usuarios simultáneos
✅ **Inteligente:** Chatbot IA para ayuda instantánea
✅ **Móvil:** Funciona en PC, tablet, smartphone
✅ **24/7:** Siempre disponible

---

## 🤔 PREGUNTAS FRECUENTES

**P: ¿Por qué a veces tarda un poco en cargar?**
R: Porque los servidores Cloud Run "duermen" si no hay tráfico. La primera petición los "despierta" (tarda ~2-3 segundos). Después va rápido.

**P: ¿Qué pasa si se cae Internet?**
R: No puedes usar la app (necesita Internet). Pero cuando vuelvas, todos tus datos estarán guardados en la nube.

**P: ¿Pueden los técnicos ver mi ubicación exacta?**
R: Sí, eso es intencional. Necesitan saber DÓNDE está el problema para ir a repararlo.

**P: ¿Mis contraseñas están seguras?**
R: Sí, están "hasheadas" con bcrypt. Ni los administradores pueden ver tu contraseña real.

**P: ¿Puedo eliminar un ticket?**
R: No directamente. Los tickets se "cancelan" pero no se eliminan (para mantener historial). Contacta a un admin si necesitas eliminarlo.

**P: ¿El chatbot IA es gratis?**
R: Para usuarios, sí. La empresa paga a OpenAI por el servicio (coste por mensaje).

---

**¡Fin de la Explicación!**

**Ahora entiendes cómo funciona el Sistema STM Web de principio a fin.** 🎓

---

**Documento creado:** 24/01/2026  
**Última actualización:** 24/01/2026 01:45 UTC  
**Versión:** 3.0  
**Para:** Todos los usuarios (explicación simplificada)
