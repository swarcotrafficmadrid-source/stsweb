# 🔧 MANUAL ADMINISTRADOR Y SAT - SISTEMA STM WEB

**Sistema de Tickets y Mantenimiento**  
**SWARCO Traffic Spain**  
**Versión 3.0 - Enero 2026**

---

## 👷 PARA QUIÉN ES ESTE MANUAL

Este manual está diseñado para:
- ✅ Administradores del sistema
- ✅ Técnicos SAT (Servicio de Asistencia Técnica)
- ✅ Supervisores de operaciones
- ✅ Personal con permisos elevados

---

## 🚀 ACCESO CON PERMISOS ELEVADOS

### Roles y Permisos:

| Rol | Permisos | Acceso |
|-----|----------|--------|
| **admin** | Todos los permisos | Panel Admin completo, Analytics, Users, Config |
| **sat** | Gestión tickets, asignaciones | Panel SAT, ver todos tickets, asignar, comentar |
| **user** | Básico | Solo sus propios tickets |

### Login Administrador/SAT:

```
URL: https://staging.swarcotrafficspain.com
Email: admin@swarcotrafficspain.com (admin)
       sat@swarcotrafficspain.com (SAT)
Password: (Proporcionada por IT)
```

---

## 📊 DASHBOARD ADMINISTRADOR

### Vista Extendida:

```
┌───────────────────────────────────────────────────────────────┐
│  SWARCO STM - PANEL ADMINISTRADOR         [🔔] [👤] [⚙️] [Salir]│
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  📊 MÉTRICAS EN TIEMPO REAL                                   │
│                                                               │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐│
│  │ TOTAL      │ │ PENDIENTES │ │ EN CURSO   │ │ HOY        ││
│  │   452      │ │    28      │ │    15      │ │    8       ││
│  │ +12 esta   │ │ -3 hoy     │ │ +2 hoy     │ │ nuevos     ││
│  │ semana     │ │            │ │            │ │            ││
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘│
│                                                               │
│  📈 GRÁFICOS                                                  │
│                                                               │
│  Tickets por día (últimos 7 días)                            │
│  [═══════════════════════════════════]                       │
│                                                               │
│  Tickets por prioridad                 Tickets por estado    │
│  🔴 Crítica:  5 (2%)                  ⭕ Pendiente:   28     │
│  🔴 Alta:    35 (15%)                 🔵 En Progreso: 15     │
│  🟡 Media:  102 (45%)                 ✅ Completado: 380     │
│  🟢 Baja:    85 (38%)                 ❌ Cancelado:  29      │
│                                                               │
│  👥 EQUIPO SAT                                                │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Juan Pérez SAT     | 8 asignados | 3 completados hoy   │ │
│  │ María López SAT    | 5 asignados | 5 completados hoy   │ │
│  │ Carlos Ruiz SAT    | 12 asignados| 2 completados hoy   │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  🔴 ALERTAS                                                   │
│  • 2 tickets críticos sin asignar                             │
│  • 5 tickets llevan >24h pendientes                           │
│  • 1 técnico SAT con sobrecarga (>15 tickets)                │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

---

## 🎫 GESTIÓN AVANZADA DE TICKETS

### Ver Todos los Tickets:

**Acceso:** Panel Admin → "Todos los Tickets"

**Filtros Avanzados:**

```
┌─────────────────────────────────────────────────────────────┐
│  GESTIÓN DE TICKETS                                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🔍 Búsqueda avanzada                                       │
│                                                             │
│  Texto:        [_____________________]                      │
│  Estado:       [ Todos ▾ ]                                  │
│  Prioridad:    [ Todas ▾ ]                                  │
│  Asignado a:   [ Todos los SAT ▾ ]                          │
│  Creado por:   [ Todos los usuarios ▾ ]                     │
│  Fecha desde:  [__/__/____]  hasta: [__/__/____]            │
│  Ubicación:    [_____________________]                      │
│                                                             │
│  [Buscar]  [Limpiar filtros]  [Exportar Excel]              │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ #  | Título        | Estado    | Prioridad | Asignado││ │
│  ├───────────────────────────────────────────────────────┤ │
│  │1025| Semáforo C/Ma | Pendiente | 🔴 Alta   | [Asignar]││
│  │1024| Panel informa | En Progres| 🟡 Media  | Juan S. ││ │
│  │1023| Señal caída   | Completado| 🔴 Alta   | María L.││ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  Mostrando 1-20 de 452 tickets   [< 1 2 3 ... 23 >]        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Asignar Ticket a Técnico SAT:

**Opción 1: Asignación Individual**

1. **Click en "Asignar"** junto al ticket
2. **Seleccionar técnico SAT:**

```
┌─────────────────────────────────────────┐
│  ASIGNAR TICKET #1025                   │
├─────────────────────────────────────────┤
│                                         │
│  Técnico SAT:                           │
│  ( ) Juan Pérez (8 tickets actuales)   │
│  (•) María López (5 tickets actuales)  │
│  ( ) Carlos Ruiz (12 tickets actuales) │
│                                         │
│  Nota para el técnico (opcional):       │
│  [_________________________________]    │
│                                         │
│  [✓] Enviar notificación email          │
│  [✓] Enviar notificación push           │
│                                         │
│     [ Cancelar ]  [ Asignar ]           │
│                                         │
└─────────────────────────────────────────┘
```

3. **Click en "Asignar"**
4. **Confirmación:**

```
✅ Ticket #1025 asignado a María López

Email de notificación enviado.
El técnico ha sido alertado.

[Ver Ticket]
```

**Opción 2: Asignación Masiva**

1. **Seleccionar múltiples tickets** (checkbox)
2. **Click en "Acciones en lote"**
3. **Seleccionar "Asignar a..."**
4. **Elegir técnico SAT**
5. **Confirmar asignación masiva**

### Reasignar Ticket:

Si un técnico está sobrecargado o no disponible:

1. **Abrir ticket**
2. **Click en "Reasignar"**
3. **Seleccionar nuevo técnico**
4. **Añadir motivo de reasignación (opcional)**
5. **Confirmar**

### Cambiar Estado de Ticket:

**Estados disponibles:**

```
⭕ Pendiente     → Ticket creado, esperando asignación
🔵 En Progreso   → Técnico SAT trabajando en ello
✅ Completado    → Problema resuelto
❌ Cancelado     → Ticket anulado (duplicado, error, etc.)
⏸️ En Espera     → Esperando información o materiales
```

**Cambiar estado:**

1. **Abrir ticket**
2. **Click en estado actual**
3. **Seleccionar nuevo estado:**

```
┌─────────────────────────────────────────┐
│  CAMBIAR ESTADO - TICKET #1025          │
├─────────────────────────────────────────┤
│                                         │
│  Estado actual: Pendiente               │
│                                         │
│  Nuevo estado:                          │
│  ( ) Pendiente                          │
│  (•) En Progreso                        │
│  ( ) Completado                         │
│  ( ) Cancelado                          │
│  ( ) En Espera                          │
│                                         │
│  Comentario (obligatorio):              │
│  [_________________________________]    │
│  [_________________________________]    │
│                                         │
│     [ Cancelar ]  [ Actualizar ]        │
│                                         │
└─────────────────────────────────────────┘
```

4. **Añadir comentario explicativo**
5. **Click en "Actualizar"**

### Cambiar Prioridad:

**Importante:** Solo admin y SAT supervisores pueden cambiar prioridad

1. **Abrir ticket**
2. **Click en prioridad actual**
3. **Seleccionar nueva prioridad**
4. **Añadir justificación**
5. **Confirmar**

---

## 👥 GESTIÓN DE USUARIOS

### Ver Todos los Usuarios:

**Acceso:** Panel Admin → "Usuarios"

```
┌─────────────────────────────────────────────────────────────┐
│  GESTIÓN DE USUARIOS                       [ + Nuevo Usuario]│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🔍 Buscar: [___________________]  Rol: [ Todos ▾ ]         │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Nombre      | Email             | Rol   | Activo | ⚙️││ │
│  ├───────────────────────────────────────────────────────┤ │
│  │ Admin User  | admin@...com      | Admin | ✅     |Edit││
│  │ Juan Pérez  | juan.p@...com     | SAT   | ✅     |Edit││
│  │ María López | maria.l@...com    | SAT   | ✅     |Edit││
│  │ Carlos Ruiz | carlos.r@...com   | SAT   | ✅     |Edit││
│  │ Ana García  | ana.g@...com      | User  | ✅     |Edit││
│  │ Luis Martín | luis.m@...com     | User  | ❌     |Edit││
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  Mostrando 1-20 de 156 usuarios   [< 1 2 3 ... 8 >]        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Crear Nuevo Usuario:

1. **Click en "+ Nuevo Usuario"**
2. **Rellenar formulario:**

```
┌─────────────────────────────────────────────────────────────┐
│  CREAR NUEVO USUARIO                                   [X]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Información Personal                                       │
│                                                             │
│  Nombre completo: *                                         │
│  [__________________________________________________]       │
│                                                             │
│  Email: *                                                   │
│  [__________________________________________________]       │
│  (Debe ser email corporativo @swarcotrafficspain.com)       │
│                                                             │
│  Teléfono:                                                  │
│  [__________________________________________________]       │
│                                                             │
│  Departamento:                                              │
│  [__________________________________________________]       │
│                                                             │
│  Rol: *                                                     │
│  ( ) User - Usuario básico (solo sus tickets)              │
│  ( ) SAT - Técnico de campo (gestión tickets)              │
│  ( ) Admin - Administrador (todos los permisos)            │
│                                                             │
│  Contraseña temporal: *                                     │
│  [__________________________________________________]       │
│  [🔄 Generar contraseña aleatoria]                          │
│                                                             │
│  [✓] Enviar email con credenciales                          │
│  [✓] Forzar cambio de contraseña en primer login           │
│                                                             │
│           [ Cancelar ]        [ Crear Usuario ]             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

3. **Click en "Crear Usuario"**
4. **Email automático enviado al usuario con credenciales**

### Editar Usuario Existente:

1. **Click en "Edit" junto al usuario**
2. **Modificar campos necesarios:**
   - Nombre
   - Email
   - Teléfono
   - Departamento
   - **Cambiar rol** (User ↔ SAT ↔ Admin)
   - Activar/Desactivar cuenta

3. **Click en "Guardar Cambios"**

### Desactivar Usuario:

**Importante:** No eliminar usuarios, solo desactivarlos (para mantener historial)

1. **Editar usuario**
2. **Toggle "Cuenta Activa" a OFF**
3. **Guardar**

**Efecto:**
- ❌ Usuario no puede hacer login
- ✅ Historial de tickets se mantiene
- ✅ Se puede reactivar en el futuro

### Resetear Contraseña:

**Opción 1: Auto-Reset por Email**

1. **Click en "Edit" junto al usuario**
2. **Click en "Enviar link de reseteo"**
3. **Usuario recibe email con link temporal**

**Opción 2: Reseteo Manual por Admin**

1. **Editar usuario**
2. **Click en "Resetear contraseña"**
3. **Introducir nueva contraseña temporal**
4. **Marcar "Forzar cambio en próximo login"**
5. **Guardar y enviar por canal seguro al usuario**

---

## 📈 ANALYTICS Y REPORTES

### Dashboard de Métricas:

**Acceso:** Panel Admin → "Analytics"

```
┌─────────────────────────────────────────────────────────────┐
│  ANALYTICS - SISTEMA STM                                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📊 MÉTRICAS GENERALES                                      │
│                                                             │
│  Período: [ Última semana ▾ ]  [Personalizar fechas]       │
│                                                             │
│  ┌────────────────────────────────────────────────────────┐│
│  │                                                         ││
│  │  Total Tickets:           452                           ││
│  │  Nuevos (período):         28                           ││
│  │  Completados (período):    35                           ││
│  │  Pendientes:               28                           ││
│  │  En Progreso:              15                           ││
│  │  Cancelados:                3                           ││
│  │                                                         ││
│  │  Tiempo Promedio Resolución: 4.2 horas                 ││
│  │  Tasa Completados:         89%                          ││
│  │  Satisfacción Usuario:     4.5/5.0 ⭐                   ││
│  │                                                         ││
│  └────────────────────────────────────────────────────────┘│
│                                                             │
│  📈 GRÁFICOS                                                │
│                                                             │
│  Tickets creados por día:                                   │
│  [═══════════════════════════════════════════════════════] │
│                                                             │
│  Tickets por categoría:                    Por ubicación:   │
│  🚦 Semáforos:       45%                   Madrid:    60%  │
│  🚧 Señalización:    30%                   Barcelona: 25%  │
│  💡 Iluminación:     15%                   Otras:     15%  │
│  🔧 Otros:           10%                                    │
│                                                             │
│  👥 RENDIMIENTO EQUIPO SAT                                  │
│                                                             │
│  ┌────────────────────────────────────────────────────────┐│
│  │ Técnico      | Asignados | Completados | Tiempo Prom. ││
│  ├────────────────────────────────────────────────────────┤│
│  │ Juan Pérez   |    45     |     42      |   3.8h      ││ │
│  │ María López  |    38     |     36      |   4.1h      ││ │
│  │ Carlos Ruiz  |    52     |     48      |   5.2h      ││ │
│  │ Ana Martín   |    31     |     30      |   3.5h      ││ │
│  └────────────────────────────────────────────────────────┘│
│                                                             │
│  [📥 Exportar Excel]  [📄 Generar PDF]  [📧 Enviar Report] │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Reportes Disponibles:

**1. Reporte de Tickets por Período**
```
Contenido:
- Total creados, completados, pendientes
- Gráfico de tendencia
- Desglose por prioridad y estado
- Top 10 ubicaciones con más tickets

Formato: Excel, PDF
```

**2. Reporte de Rendimiento SAT**
```
Contenido:
- Tickets asignados vs completados por técnico
- Tiempo promedio de resolución
- Tasa de éxito
- Tickets pendientes por técnico

Formato: Excel, PDF
```

**3. Reporte de SLA (Service Level Agreement)**
```
Contenido:
- Cumplimiento de tiempos según prioridad
- Tickets que excedieron SLA
- Porcentaje de cumplimiento
- Análisis de causas de retraso

Formato: Excel, PDF
```

**4. Reporte de Satisfacción**
```
Contenido:
- Valoraciones de usuarios (si implementado)
- Comentarios y feedback
- NPS (Net Promoter Score)
- Áreas de mejora

Formato: Excel, PDF
```

### Generar Reporte Personalizado:

1. **Analytics → "Generar Reporte"**
2. **Seleccionar tipo de reporte**
3. **Configurar filtros:**
   - Rango de fechas
   - Técnicos SAT específicos
   - Prioridades
   - Estados
   - Ubicaciones

4. **Click en "Generar"**
5. **Descargar o enviar por email**

---

## ⚙️ CONFIGURACIÓN DEL SISTEMA

### Acceso a Configuración:

**Solo Admin:** Panel Admin → Icono ⚙️

```
┌─────────────────────────────────────────────────────────────┐
│  CONFIGURACIÓN DEL SISTEMA                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🔧 GENERAL                                                 │
│                                                             │
│  Nombre del sistema:                                        │
│  [STM Web - SWARCO Traffic Spain__________________]         │
│                                                             │
│  Email de contacto:                                         │
│  [soporte@swarcotrafficspain.com__________________]         │
│                                                             │
│  Zona horaria:                                              │
│  [Europe/Madrid ▾]                                          │
│                                                             │
│  Idioma predeterminado:                                     │
│  [Español ▾]                                                │
│                                                             │
│  🔔 NOTIFICACIONES                                          │
│                                                             │
│  [✓] Enviar email cuando ticket es creado                   │
│  [✓] Enviar email cuando ticket es asignado                 │
│  [✓] Enviar email cuando cambia estado                      │
│  [ ] Enviar resumen diario a administradores                │
│  [ ] Enviar resumen semanal a stakeholders                  │
│                                                             │
│  🎫 TICKETS                                                 │
│                                                             │
│  Auto-asignación:                                           │
│  [✓] Asignar automáticamente tickets críticos al SAT       │
│      disponible con menos carga                             │
│                                                             │
│  Prioridades permitidas:                                    │
│  [✓] Baja  [✓] Media  [✓] Alta  [✓] Crítica                │
│                                                             │
│  SLA (Service Level Agreement):                             │
│  Crítica: [30___] minutos                                   │
│  Alta:    [2____] horas                                     │
│  Media:   [8____] horas                                     │
│  Baja:    [48___] horas                                     │
│                                                             │
│  🤖 CHATBOT IA                                              │
│                                                             │
│  [✓] Habilitar chatbot                                      │
│                                                             │
│  Modelo:                                                    │
│  [GPT-4 ▾]                                                  │
│                                                             │
│  Límite mensajes por usuario:                               │
│  [30___] mensajes por hora                                  │
│                                                             │
│  🛡️ SEGURIDAD                                               │
│                                                             │
│  Expiración token JWT:                                      │
│  [24___] horas                                              │
│                                                             │
│  Rate limiting login:                                       │
│  [5____] intentos cada [15___] minutos                      │
│                                                             │
│  Contraseña mínima:                                         │
│  [8____] caracteres                                         │
│  [✓] Requiere mayúsculas                                    │
│  [✓] Requiere números                                       │
│  [✓] Requiere caracteres especiales                         │
│                                                             │
│           [ Cancelar ]        [ Guardar Configuración ]     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Configuraciones Críticas:

**⚠️ IMPORTANTE:** Cambios en estas configuraciones afectan todo el sistema

- **JWT Expiration:** Tiempo de sesión de usuarios
- **Rate Limiting:** Protección contra ataques de fuerza bruta
- **SLA Times:** Compromisos de tiempo de respuesta
- **Auto-Assignment:** Asignación automática de tickets

---

## 🚨 GESTIÓN DE ALERTAS

### Alertas Automáticas:

El sistema genera alertas cuando:

```
🔴 CRÍTICO:
- Ticket crítico sin asignar por >30 minutos
- Técnico SAT no responde por >1 hora
- Sistema caído o errores masivos

🟡 ADVERTENCIA:
- Ticket excede SLA en 50%
- Técnico SAT con >15 tickets asignados
- >10 tickets pendientes sin asignar

🔵 INFO:
- Ticket completado
- Nuevo usuario registrado
- Cambio en configuración del sistema
```

### Ver Alertas:

**Acceso:** Icono 🔔 (esquina superior derecha)

```
┌─────────────────────────────────────────────────────────────┐
│  ALERTAS DEL SISTEMA                                   [X]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🔴 CRÍTICAS (2)                                            │
│                                                             │
│  • Ticket #1030 crítico sin asignar (45 min)                │
│    [Ver Ticket]  [Asignar Ahora]                            │
│                                                             │
│  • Ticket #1028 excede SLA en 120%                          │
│    [Ver Ticket]  [Contactar SAT]                            │
│                                                             │
│  🟡 ADVERTENCIAS (5)                                        │
│                                                             │
│  • Carlos Ruiz tiene 18 tickets asignados                   │
│    [Ver Detalle]  [Reasignar Tickets]                       │
│                                                             │
│  • 12 tickets pendientes sin asignar                        │
│    [Ver Todos]  [Asignar en Lote]                           │
│                                                             │
│  🔵 INFORMACIÓN (15)                                        │
│                                                             │
│  • 8 tickets completados hoy                                │
│  • Nuevo usuario registrado: Ana Martín                     │
│  • Backup automático completado                             │
│                                                             │
│  [ Marcar todas como leídas ]  [ Configurar Alertas ]      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Configurar Alertas:

1. **Alertas → "Configurar"**
2. **Seleccionar tipos de alerta a recibir**
3. **Configurar umbrales:**
   - Tiempo máximo sin asignar
   - Porcentaje de exceso SLA
   - Máximo tickets por técnico

4. **Seleccionar canal de notificación:**
   - Email
   - Push notification
   - SMS (si configurado)
   - Webhook (integración externa)

5. **Guardar configuración**

---

## 📞 FUNCIONES TÉCNICO SAT

### Panel SAT Simplificado:

Los técnicos SAT ven una versión simplificada enfocada en **sus tickets asignados**:

```
┌───────────────────────────────────────────────────────────────┐
│  PANEL SAT - Juan Pérez                [🔔]  [👤]  [Salir]   │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  📊 MIS MÉTRICAS HOY                                          │
│                                                               │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐│
│  │ ASIGNADOS  │ │ COMPLETADOS│ │ PENDIENTES │ │ PROMEDIO   ││
│  │     8      │ │     3      │ │     5      │ │   3.5h     ││
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘│
│                                                               │
│  🎯 MIS TICKETS ACTIVOS                                       │
│                                                               │
│  Ordenar por: [Prioridad ▾]  Filtrar: [Todos ▾]              │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ #1025 🔴 Semáforo C/Mayor 45 averiado        PENDIENTE  │ │
│  │ Asignado hace: 2h | SLA: -30 min ⚠️                     │ │
│  │ [Ver] [Iniciar] [Comentar] [📍 Mapa]                    │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ #1024 🟡 Panel informativo apagado         EN PROGRESO  │ │
│  │ Iniciado hace: 1h | SLA: OK ✅                           │ │
│  │ [Ver] [Completar] [Añadir Fotos]                        │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  🗺️ MAPA DE TICKETS                                          │
│  [Mapa interactivo mostrando ubicaciones de tickets activos] │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

### Workflow Técnico SAT:

**1. Recibir Asignación:**
```
- Notificación email/push
- Ticket aparece en "Mis Tickets"
- Click en [Ver] para detalles
```

**2. Iniciar Trabajo:**
```
- Click en [Iniciar]
- Estado cambia: Pendiente → En Progreso
- Timer SLA comienza a contar
```

**3. Durante Reparación:**
```
- Añadir comentarios con actualizaciones
- Subir fotos del proceso
- Solicitar materiales si necesario (cambiar a "En Espera")
```

**4. Completar Ticket:**
```
- Click en [Completar]
- Rellenar formulario de cierre:
  * Resumen de trabajo realizado
  * Materiales utilizados
  * Tiempo invertido
  * Fotos del resultado final
- Cambiar estado a "Completado"
```

**5. Confirmación:**
```
✅ Ticket #1025 marcado como completado

Tiempo total: 2h 45min
Usuario notificado por email.

[Ver Siguiente Ticket]
```

---

## 🗺️ MAPA DE TICKETS

### Vista de Mapa:

**Acceso:** Panel SAT → "Mapa de Tickets"

Muestra todos los tickets activos geolocalizados:

```
┌─────────────────────────────────────────────────────────────┐
│  MAPA DE TICKETS                                       [X]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [🗺️ Mapa interactivo de Google Maps]                      │
│                                                             │
│  📍 Marcadores:                                             │
│  🔴 = Crítico/Alta prioridad                                │
│  🟡 = Media prioridad                                       │
│  🟢 = Baja prioridad                                        │
│  🔵 = En progreso                                           │
│                                                             │
│  Filtros:                                                   │
│  [✓] Pendientes  [✓] En Progreso  [ ] Completados          │
│  [✓] Mis tickets [ ] Todos los tickets                      │
│                                                             │
│  [ Click en marcador para ver detalles del ticket ]         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Funcionalidad:**
- Click en marcador → Ver detalles ticket
- Optimizar ruta entre varios tickets
- Filtrar por estado, prioridad, asignación
- Exportar ubicaciones a GPS externo

---

## 🔒 MEJORES PRÁCTICAS DE SEGURIDAD

### Para Administradores:

✅ **SÍ hacer:**
- Revisar logs de acceso semanalmente
- Rotar contraseñas cada 3 meses
- Habilitar autenticación de dos factores (si disponible)
- Hacer backups manuales antes de cambios importantes
- Documentar todos los cambios en configuración
- Revisar usuarios activos mensualmente

❌ **NO hacer:**
- Compartir credenciales de admin
- Dejar sesión abierta en computadoras públicas
- Dar permisos de admin innecesariamente
- Ignorar alertas de seguridad
- Modificar configuración sin backup previo

### Para Técnicos SAT:

✅ **SÍ hacer:**
- Cerrar sesión al terminar turno
- Actualizar estado de tickets en tiempo real
- Subir fotos como evidencia
- Reportar problemas o errores del sistema

❌ **NO hacer:**
- Compartir credenciales con colegas
- Acceder desde dispositivos no autorizados
- Modificar tickets de otros técnicos sin autorización
- Eliminar información del sistema

---

## 📚 COMANDOS RÁPIDOS (ATAJOS)

### Atajos de Teclado:

```
Admin/SAT Dashboard:
- Ctrl + N: Nuevo ticket
- Ctrl + F: Buscar tickets
- Ctrl + A: Ver alertas
- Ctrl + M: Abrir mapa
- Ctrl + R: Recargar dashboard

Dentro de Ticket:
- Ctrl + E: Editar ticket
- Ctrl + C: Añadir comentario
- Ctrl + S: Guardar cambios
- Esc: Cerrar modal

Navegación:
- Alt + H: Home/Dashboard
- Alt + T: Todos los tickets
- Alt + U: Usuarios
- Alt + A: Analytics
- Alt + S: Configuración
```

---

## 🆘 RESOLUCIÓN DE PROBLEMAS

### Problema: Usuario no puede hacer login

**Diagnóstico:**
1. ¿Cuenta está activa? → Verificar en panel Usuarios
2. ¿Contraseña correcta? → Resetear contraseña
3. ¿Rate limiting? → Esperar 15 min o desbloquear IP

**Solución:**
```
1. Admin → Usuarios → Buscar usuario
2. Verificar "Estado: Activo"
3. Si inactivo → Activar cuenta
4. Click "Resetear contraseña"
5. Enviar nueva contraseña al usuario
```

### Problema: Técnico SAT no ve sus tickets asignados

**Diagnóstico:**
1. ¿Tickets realmente asignados a él?
2. ¿Filtros activos ocultando tickets?
3. ¿Problema de permisos?

**Solución:**
```
1. Admin → Todos los Tickets
2. Filtrar por "Asignado a: [Técnico]"
3. Verificar que tickets existen
4. Si no aparecen en panel SAT → Limpiar caché navegador
5. Si persiste → Verificar rol = "sat" (no "user")
```

### Problema: Rate limiter bloqueando usuarios legítimos

**Diagnóstico:**
- Demasiados intentos de login fallidos
- Stress test o ataque reciente

**Solución INMEDIATA:**
```bash
# En Cloud Shell:
gcloud run services update stsweb-backend \
  --region europe-west1 \
  --update-env-vars "RESET_TIME=$(date +%s)"

# Esto reinicia el rate limiter en memoria
```

**Solución PERMANENTE:**
```
Migrar rate limiter a Redis
(Ver sección de mejoras futuras en Informe Técnico)
```

### Problema: Sistema lento o no responde

**Diagnóstico:**
1. ¿Cloud Run instancias activas?
2. ¿Base de datos respondiendo?
3. ¿Tráfico inusual?

**Verificación:**
```bash
# Health check backend
curl https://stsweb-backend-964379250608.europe-west1.run.app/api/health

# Debe retornar: {"ok":true}
```

**Solución:**
```
1. Cloud Console → Cloud Run
2. Ver métricas de CPU y memoria
3. Si saturado → Aumentar max instancias
4. Si BD lenta → Verificar conexiones activas
5. Si persiste → Revisar logs en Cloud Logging
```

---

## 📖 GLOSARIO TÉCNICO

| Término | Definición |
|---------|------------|
| **Cloud Run** | Plataforma serverless de Google Cloud para contenedores |
| **JWT** | JSON Web Token, sistema de autenticación |
| **Rate Limiting** | Límite de peticiones para prevenir abuso |
| **SLA** | Service Level Agreement, tiempo comprometido de respuesta |
| **SAT** | Servicio de Asistencia Técnica |
| **Revision** | Versión deployada de un servicio en Cloud Run |
| **Health Check** | Endpoint que verifica que el servicio está funcionando |
| **Rollback** | Revertir a una versión anterior del servicio |

---

## 📞 CONTACTO SOPORTE TÉCNICO

**Sistema:** STM Web - SWARCO Traffic Spain  
**Cloud:** Google Cloud Platform  
**Región:** europe-west1  

**Emergencias Sistema (24/7):**
- Email: admin@swarcotrafficspain.com
- Cloud Console: https://console.cloud.google.com/run?project=ticketswarcotrafficspain

**Soporte Usuarios:**
- Email: soporte@swarcotrafficspain.com  
- Tiempo respuesta: 4-8 horas hábiles

---

**Fin del Manual de Administrador y SAT**

**Última actualización:** 24/01/2026 01:00 UTC  
**Versión:** 3.0  
**Revisión:** 1.0
