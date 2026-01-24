# 📖 MANUAL DE USUARIO - SISTEMA STM WEB

**Sistema de Tickets y Mantenimiento**  
**SWARCO Traffic Spain**  
**Versión 3.0 - Enero 2026**

---

## 👥 PARA QUIÉN ES ESTE MANUAL

Este manual está diseñado para:
- ✅ Usuarios finales (empleados de SWARCO)
- ✅ Reportadores de incidencias
- ✅ Personal que crea tickets de mantenimiento
- ✅ Consultores de estado de tickets

---

## 🚀 ACCESO AL SISTEMA

### URL de Acceso:

```
🌐 Web: https://staging.swarcotrafficspain.com
📱 Mobile: Descargar app desde Play Store / App Store (próximamente)
```

### Credenciales:

Contactar con el administrador del sistema para obtener:
- ✉️ Email corporativo
- 🔒 Contraseña inicial (se recomienda cambiar tras primer acceso)

---

## 📱 PASO 1: INICIAR SESIÓN

### En la Web:

1. **Abrir navegador** (Chrome, Firefox, Safari, Edge)
2. **Ir a:** `https://staging.swarcotrafficspain.com`
3. **Ver pantalla de login:**

```
┌─────────────────────────────────────┐
│                                     │
│        SWARCO TRAFFIC SPAIN         │
│     Sistema de Tickets (STM)        │
│                                     │
│   Email:  [________________]        │
│                                     │
│   Contraseña: [________________]    │
│                                     │
│          [ Iniciar Sesión ]         │
│                                     │
│   ¿Olvidaste tu contraseña?         │
│                                     │
└─────────────────────────────────────┘
```

4. **Introducir email:** `tu-email@swarcotrafficspain.com`
5. **Introducir contraseña:** Tu contraseña proporcionada
6. **Click en "Iniciar Sesión"**

### ✅ Login Exitoso:

Serás redirigido al **Dashboard** (Panel Principal)

### ❌ Errores Comunes:

| Error | Causa | Solución |
|-------|-------|----------|
| "Email o contraseña incorrectos" | Datos mal introducidos | Verificar y reintentar |
| "Demasiados intentos" | Rate limiting activado | Esperar 15 minutos |
| Pantalla en blanco | Error de red / navegador | F5 para recargar |
| "Token inválido" | Sesión expirada | Volver a hacer login |

---

## 🏠 PASO 2: DASHBOARD (PANEL PRINCIPAL)

### Vista del Dashboard:

```
┌───────────────────────────────────────────────────────────────┐
│  SWARCO STM                      [🔔]  [👤 Tu Nombre]  [Salir] │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  📊 RESUMEN                                                   │
│                                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ TOTAL    │  │ PENDIENTE│  │ PROGRESO │  │ COMPLETO │    │
│  │   45     │  │    12    │  │    8     │  │    25    │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
│                                                               │
│  📋 MIS TICKETS                       [ + Nuevo Ticket ]     │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ #1025 - Semáforo C/Mayor 45 averiado       🔴 ALTA     │ │
│  │ Estado: Pendiente | Creado: 23/01/2026                  │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ #1024 - Panel informativo apagado          🟡 MEDIA    │ │
│  │ Estado: En Progreso | Asignado a: Juan S.               │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

### Elementos del Dashboard:

1. **📊 Resumen de Tickets:**
   - Total de tickets creados
   - Pendientes de asignación
   - En progreso
   - Completados

2. **📋 Lista de Tickets:**
   - Muestra tus tickets más recientes
   - Click en cualquier ticket para ver detalles

3. **+ Nuevo Ticket:**
   - Botón para crear nuevo ticket de mantenimiento

4. **🔔 Notificaciones:**
   - Alertas de actualizaciones en tus tickets

5. **👤 Perfil:**
   - Ver y editar tu perfil
   - Cerrar sesión

---

## ➕ PASO 3: CREAR UN NUEVO TICKET

### Proceso Completo:

1. **Click en botón "+ Nuevo Ticket"**

2. **Rellenar formulario:**

```
┌─────────────────────────────────────────────────────────────┐
│  CREAR NUEVO TICKET                                    [X]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Título: *                                                  │
│  [__________________________________________________]       │
│  Ej: "Semáforo averiado en C/ Mayor 45"                    │
│                                                             │
│  Descripción: *                                             │
│  [__________________________________________________]       │
│  [__________________________________________________]       │
│  [__________________________________________________]       │
│  Describe el problema con detalle                           │
│                                                             │
│  Prioridad: *                                               │
│  ( ) Baja    ( ) Media    (•) Alta    ( ) Crítica          │
│                                                             │
│  Ubicación:                                                 │
│  [__________________________________________________]       │
│  [📍 Capturar mi ubicación actual]                          │
│                                                             │
│  Fotos (opcional):                                          │
│  [📷 Adjuntar fotos]                                        │
│                                                             │
│           [ Cancelar ]        [ Crear Ticket ]              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Campos Obligatorios (*):

| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| **Título** | Resumen breve del problema | "Semáforo averiado C/ Mayor 45" |
| **Descripción** | Explicación detallada | "Semáforo en rojo permanente, no cambia. Ubicado frente al número 45. Afecta al tráfico desde las 08:00." |
| **Prioridad** | Urgencia del problema | Alta (si afecta al tráfico) |

### Prioridades Explicadas:

```
🟢 BAJA:     Mantenimiento preventivo, estética, no urgente
🟡 MEDIA:    Problema que debe resolverse pronto pero no es crítico
🔴 ALTA:     Afecta funcionamiento o seguridad
🔴 CRÍTICA:  Peligro inmediato, requiere atención urgente
```

### Capturar Ubicación:

**Opción 1: Automática (Recomendado)**
1. Click en "📍 Capturar mi ubicación actual"
2. Permitir acceso a ubicación en navegador
3. Sistema captura coordenadas GPS automáticamente

**Opción 2: Manual**
1. Escribir dirección completa
2. Ej: "Calle Mayor 45, 28013 Madrid, España"

### Adjuntar Fotos:

1. Click en "📷 Adjuntar fotos"
2. Seleccionar hasta 5 fotos desde tu dispositivo
3. Formatos aceptados: JPG, PNG (máx 5MB cada una)

### Crear el Ticket:

3. **Click en "Crear Ticket"**
4. **Confirmación:**

```
✅ Ticket #1026 creado correctamente

Tu ticket ha sido enviado al equipo SAT.
Recibirás notificaciones sobre su estado.

[Ver Ticket]  [Crear Otro]
```

---

## 👀 PASO 4: VER DETALLES DE UN TICKET

### Acceder a Detalles:

1. Desde Dashboard, **click en cualquier ticket**
2. Se abre vista detallada:

```
┌─────────────────────────────────────────────────────────────┐
│  ← Volver                                    Ticket #1025   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🔴 ALTA - PENDIENTE                                        │
│                                                             │
│  Semáforo C/Mayor 45 averiado                               │
│                                                             │
│  📝 Descripción:                                            │
│  Semáforo en rojo permanente, no cambia. Ubicado frente    │
│  al número 45. Afecta al tráfico desde las 08:00.          │
│                                                             │
│  📍 Ubicación:                                              │
│  Calle Mayor 45, 28013 Madrid                               │
│  [Ver en mapa]                                              │
│                                                             │
│  📷 Fotos: [3 imágenes]                                     │
│  [📷] [📷] [📷]                                             │
│                                                             │
│  ℹ️ Información:                                            │
│  Creado por: María García                                   │
│  Fecha: 23/01/2026 08:15                                    │
│  Asignado a: Sin asignar                                    │
│                                                             │
│  💬 COMENTARIOS (2)                                         │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Juan SAT - 23/01/2026 09:00                           │ │
│  │ He visto el ticket, me dirijo al lugar ahora.         │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ María García - 23/01/2026 09:05                       │ │
│  │ Gracias, sigue causando retenciones importantes.      │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  Añadir comentario:                                         │
│  [__________________________________________________]       │
│  [Enviar]                                                   │
│                                                             │
│  🤖 ASISTENTE IA                                            │
│  ¿Necesitas ayuda? Pregúntame cualquier cosa.              │
│  [Iniciar chat]                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Acciones Disponibles:

1. **Ver en mapa:** Abre Google Maps con la ubicación exacta
2. **Ver fotos:** Click en miniatura para ampliar
3. **Añadir comentario:** Comunicarte con el equipo SAT
4. **Chatbot IA:** Obtener ayuda o información

---

## 💬 PASO 5: COMENTAR EN TICKETS

### Añadir un Comentario:

1. **Scroll hasta sección "Añadir comentario"**
2. **Escribir tu mensaje:**
   ```
   Ejemplo: "El problema persiste a las 14:00, sigue en rojo fijo"
   ```
3. **Click en "Enviar"**
4. **El comentario aparece inmediatamente**

### Buenas Prácticas:

✅ **SÍ hacer:**
- Proporcionar actualizaciones del estado
- Agradecer al equipo SAT
- Incluir nueva información relevante
- Ser claro y conciso

❌ **NO hacer:**
- Spam o mensajes innecesarios
- Información personal sensible
- Lenguaje inapropiado
- Duplicar información ya proporcionada

---

## 🤖 PASO 6: USAR EL CHATBOT IA

### ¿Qué es el Chatbot?

Un asistente inteligente que responde preguntas sobre:
- ✅ Estado de tu ticket
- ✅ Procedimientos y políticas
- ✅ Información técnica
- ✅ Tiempos estimados de resolución

### Cómo Usar:

1. **Click en "🤖 Iniciar chat"** en cualquier ticket
2. **Escribe tu pregunta:**

```
┌─────────────────────────────────────────────────────────────┐
│  ASISTENTE IA - TICKET #1025                          [X]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🤖 ¡Hola! ¿En qué puedo ayudarte con este ticket?         │
│                                                             │
│  Tú: ¿Cuánto suele tardar en repararse un semáforo?        │
│                                                             │
│  🤖 Según nuestro historial, la reparación de un semáforo  │
│     averiado suele tomar entre 2-4 horas desde que el      │
│     técnico llega al lugar. Para tickets de prioridad      │
│     ALTA como el tuyo, el tiempo de respuesta promedio     │
│     es de 1-2 horas.                                        │
│                                                             │
│     ¿Puedo ayudarte con algo más?                           │
│                                                             │
│  [_______________________________________________]           │
│  [Enviar]                                                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Preguntas Frecuentes al Chatbot:

```
"¿Cuál es el estado de mi ticket?"
"¿Cuándo vendrá el técnico?"
"¿Qué significa estado 'En Progreso'?"
"¿Cómo cambio la prioridad?"
"¿Puedo cancelar el ticket?"
"¿Quién está asignado a mi ticket?"
```

### Limitaciones:

- ⏱️ Cooldown de 1 segundo entre mensajes
- 📊 Máximo 30 mensajes por hora
- 🤖 No puede modificar tickets (solo informar)

---

## 🔔 PASO 7: NOTIFICACIONES

### Tipos de Notificaciones:

Recibirás notificaciones cuando:

```
✅ Tu ticket es asignado a un técnico SAT
✅ El estado de tu ticket cambia (Pendiente → En Progreso → Completado)
✅ Alguien comenta en tu ticket
✅ El técnico SAT actualiza información
✅ Tu ticket es marcado como completado
```

### Ver Notificaciones:

1. **Click en icono 🔔 (esquina superior derecha)**
2. **Lista de notificaciones:**

```
┌─────────────────────────────────────────────┐
│  NOTIFICACIONES                       [X]   │
├─────────────────────────────────────────────┤
│                                             │
│  • Ticket #1025 asignado a Juan SAT         │
│    Hace 2 horas                             │
│                                             │
│  • Nuevo comentario en Ticket #1024         │
│    Hace 5 horas                             │
│                                             │
│  • Ticket #1023 completado                  │
│    Hace 1 día                               │
│                                             │
│  [ Marcar todas como leídas ]               │
│                                             │
└─────────────────────────────────────────────┘
```

3. **Click en notificación** para ir directamente al ticket

---

## 🔍 PASO 8: BUSCAR Y FILTRAR TICKETS

### Barra de Búsqueda:

```
┌─────────────────────────────────────────────────────────────┐
│  🔍 Buscar tickets...                                       │
│  [_____________________________________________] [Buscar]   │
│                                                             │
│  Filtros:                                                   │
│  Estado:    [ Todos ▾ ]                                     │
│  Prioridad: [ Todas ▾ ]                                     │
│  Fecha:     [ Última semana ▾ ]                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Filtros Disponibles:

**Por Estado:**
- Todos
- Pendiente
- En Progreso
- Completado
- Cancelado

**Por Prioridad:**
- Todas
- Baja
- Media
- Alta
- Crítica

**Por Fecha:**
- Hoy
- Última semana
- Último mes
- Último año
- Rango personalizado

### Búsqueda por Texto:

Puedes buscar por:
- Número de ticket: `#1025`
- Palabras clave: `semáforo`
- Ubicación: `Calle Mayor`
- Descripción: `averiado`

---

## 👤 PASO 9: PERFIL DE USUARIO

### Acceder a tu Perfil:

1. **Click en tu nombre** (esquina superior derecha)
2. **Seleccionar "Mi Perfil"**

```
┌─────────────────────────────────────────────────────────────┐
│  MI PERFIL                                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  👤 Información Personal                                    │
│                                                             │
│  Nombre:     [María García____________]                     │
│  Email:      maria.garcia@swarcotrafficspain.com            │
│  Teléfono:   [+34 600 000 000________]                      │
│  Departamento: [Operaciones__________]                      │
│                                                             │
│  🔒 Cambiar Contraseña                                      │
│                                                             │
│  Contraseña actual:  [_________________]                    │
│  Nueva contraseña:   [_________________]                    │
│  Repetir contraseña: [_________________]                    │
│                                                             │
│  🔔 Preferencias de Notificaciones                          │
│                                                             │
│  [✓] Email cuando mi ticket es asignado                     │
│  [✓] Email cuando cambia el estado                          │
│  [✓] Email cuando recibo comentarios                        │
│  [ ] Email resumen diario                                   │
│                                                             │
│           [ Cancelar ]        [ Guardar Cambios ]           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Cambiar Contraseña:

1. Introducir contraseña actual
2. Introducir nueva contraseña (mínimo 8 caracteres)
3. Repetir nueva contraseña
4. Click en "Guardar Cambios"

**Requisitos de contraseña:**
- ✅ Mínimo 8 caracteres
- ✅ Al menos 1 mayúscula
- ✅ Al menos 1 número
- ✅ Al menos 1 carácter especial (@, #, $, etc.)

---

## 🚪 PASO 10: CERRAR SESIÓN

### Salir del Sistema:

1. **Click en tu nombre** (esquina superior derecha)
2. **Seleccionar "Cerrar Sesión"**
3. **Confirmación:**

```
¿Estás seguro de que quieres cerrar sesión?

[Cancelar]  [Cerrar Sesión]
```

4. **Serás redirigido a la pantalla de login**

### Importante:

- 🔒 Tu sesión expira automáticamente tras 24 horas de inactividad
- 💾 Guarda cualquier trabajo en progreso antes de salir
- 🔐 Siempre cierra sesión en computadoras compartidas

---

## ❓ PREGUNTAS FRECUENTES (FAQ)

### ¿Cuánto tarda en atenderse mi ticket?

Depende de la prioridad:
- 🔴 **Crítica:** 15-30 minutos
- 🔴 **Alta:** 1-2 horas
- 🟡 **Media:** 4-8 horas
- 🟢 **Baja:** 1-3 días

### ¿Puedo editar un ticket después de crearlo?

No directamente, pero puedes:
- ✅ Añadir comentarios con nueva información
- ✅ Contactar al administrador para modificaciones importantes

### ¿Puedo cancelar un ticket?

Sí, solo si:
- El ticket está en estado "Pendiente"
- No ha sido asignado aún a un técnico
- Contacta al administrador si ya está asignado

### ¿Puedo ver tickets de otros usuarios?

Solo si:
- Eres del mismo departamento (según permisos)
- Eres administrador o SAT
- Los tickets son públicos (configuración del sistema)

### ¿Qué hago si olvidé mi contraseña?

1. En pantalla de login, click en "¿Olvidaste tu contraseña?"
2. Introduce tu email
3. Recibirás un link de restablecimiento por email
4. Sigue las instrucciones del email

### ¿Funciona en móvil?

✅ **SÍ**, el sistema es responsive:
- Navegador móvil (Chrome, Safari, etc.)
- App nativa (próximamente en Play Store / App Store)

### ¿Puedo usar el sistema sin conexión?

❌ **NO**, el sistema requiere conexión a internet para:
- Sincronizar datos
- Capturar ubicación GPS
- Enviar notificaciones
- Chatbot IA

### ¿Los datos están seguros?

✅ **SÍ**, implementamos:
- 🔒 Cifrado HTTPS (SSL/TLS)
- 🔐 Autenticación JWT
- 🛡️ Backups diarios automáticos
- 🚫 Rate limiting contra ataques

---

## 🆘 SOPORTE Y AYUDA

### ¿Necesitas ayuda?

**Opción 1: Chatbot IA**
- Disponible 24/7 en cualquier ticket
- Respuesta inmediata a preguntas frecuentes

**Opción 2: Email**
- Email: soporte@swarcotrafficspain.com
- Tiempo de respuesta: 4-8 horas hábiles

**Opción 3: Teléfono**
- Tel: +34 XXX XXX XXX (horario de oficina)
- Lunes a Viernes 8:00-18:00

**Opción 4: Ticket de Soporte**
- Crea un ticket con categoría "Soporte Técnico"
- Incluye capturas de pantalla del problema

---

## 📚 GLOSARIO

| Término | Definición |
|---------|------------|
| **Ticket** | Solicitud de mantenimiento o reporte de incidencia |
| **SAT** | Servicio de Asistencia Técnica (técnicos de campo) |
| **Dashboard** | Panel principal con resumen de tickets |
| **JWT** | Token de autenticación para mantener sesión segura |
| **Rate Limiting** | Límite de peticiones para prevenir abuso |
| **Prioridad** | Nivel de urgencia de un ticket |
| **Estado** | Situación actual del ticket (pendiente, en progreso, etc.) |
| **Asignado** | Técnico SAT responsable de resolver el ticket |
| **GPS** | Coordenadas de ubicación del problema |

---

## ✅ CHECKLIST RÁPIDO

### Para crear un ticket exitoso:

- [ ] Login en el sistema
- [ ] Click en "+ Nuevo Ticket"
- [ ] Título claro y descriptivo
- [ ] Descripción detallada del problema
- [ ] Prioridad correcta seleccionada
- [ ] Ubicación capturada (GPS o manual)
- [ ] Fotos adjuntas (si es posible)
- [ ] Revisar antes de enviar
- [ ] Click en "Crear Ticket"
- [ ] Anotar número de ticket para seguimiento

---

## 📞 CONTACTO

**Sistema:** STM Web - SWARCO Traffic Spain  
**URL:** https://staging.swarcotrafficspain.com  
**Soporte:** soporte@swarcotrafficspain.com  
**Versión:** 3.0 (Enero 2026)

---

**¡Gracias por usar el Sistema STM Web!**

Este manual se actualiza periódicamente. Última actualización: 24/01/2026
