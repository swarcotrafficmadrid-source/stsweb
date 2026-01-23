# ✅ Checklist de Pruebas - Portal SWARCO Traffic Spain

## 🎯 Pruebas Prioritarias (Primera Sesión)

### 1. Autenticación ✅
- [ ] Login con usuario SAT (`aitor.badiola@swarco.com`)
- [ ] Verificar que redirige al dashboard después del login
- [ ] Logout funciona correctamente
- [ ] Cambio de idioma funciona

---

### 2. Panel SAT - Dashboard 📊
- [ ] Acceder a `/#sat` muestra el dashboard
- [ ] Estadísticas muestran números correctos
- [ ] Gráficos/tarjetas de resumen cargan correctamente
- [ ] Filtros por tipo de ticket funcionan
- [ ] Filtros por estado funcionan

---

### 3. Panel SAT - Lista de Tickets 📋
- [ ] Lista de tickets carga correctamente
- [ ] Paginación funciona (si hay muchos tickets)
- [ ] Búsqueda/filtro de tickets funciona
- [ ] Click en un ticket abre el detalle
- [ ] Números de ticket tienen formato correcto (INC-000001, etc.)

---

### 4. Panel SAT - Detalle de Ticket 🔍
- [ ] Información del cliente se muestra correctamente
- [ ] Detalles del ticket son visibles
- [ ] Timeline visual muestra los cambios de estado
- [ ] Sección de comentarios carga correctamente
- [ ] Fotos/archivos adjuntos se ven bien

---

### 5. Panel SAT - Gestión de Estados 🔄
- [ ] Cambiar estado del ticket funciona
- [ ] Lista de técnicos carga correctamente
- [ ] Asignar técnico a ticket funciona
- [ ] Agregar comentario interno funciona
- [ ] Agregar comentario público funciona
- [ ] Cliente recibe email al cambiar estado (verificar bandeja)
- [ ] Cliente recibe email al agregar comentario público

---

### 6. Panel SAT - Generación de PDFs 📄
- [ ] Botón "Generar PDF" está visible
- [ ] Click genera y descarga PDF correctamente
- [ ] PDF contiene logo SWARCO
- [ ] PDF contiene datos fiscales (NIF: A87304655)
- [ ] PDF contiene dirección correcta
- [ ] PDF contiene timeline del ticket
- [ ] PDF contiene comentarios
- [ ] PDF tiene formato profesional

---

## 🧪 Pruebas Secundarias (Opcional - Segunda Sesión)

### 7. Portal Cliente - Registro 📝
- [ ] Crear cuenta nueva funciona
- [ ] Email de verificación llega correctamente
- [ ] Link de verificación funciona
- [ ] Login con nueva cuenta funciona

---

### 8. Portal Cliente - Crear Incidencia 🚨
- [ ] Formulario carga correctamente
- [ ] Selección de empresa funciona
- [ ] Campos de panel (Ref, Serial) validan correctamente
- [ ] Ubicación (Tráfico/Transporte) funciona
- [ ] Subir 1-4 fotos funciona
- [ ] Subir 1 video (máx 1min) funciona
- [ ] Agregar múltiples equipos funciona
- [ ] Botón "Aceptar" (antes "Revisar ticket") funciona
- [ ] Modal de confirmación se muestra
- [ ] Ticket se crea correctamente
- [ ] Cliente recibe email de confirmación
- [ ] SAT recibe email resumido

---

### 9. Portal Cliente - Solicitar Repuestos 🔧
- [ ] Formulario carga correctamente
- [ ] Campos proyecto y país funcionan
- [ ] Ubicación (país y provincia) funciona
- [ ] Agregar múltiples repuestos funciona
- [ ] Subir fotos funciona
- [ ] Ticket se crea correctamente
- [ ] Emails se envían correctamente

---

### 10. Portal Cliente - Solicitar Compras 💰
- [ ] Formulario carga correctamente
- [ ] Campos proyecto y país funcionan
- [ ] Agregar múltiples equipos funciona
- [ ] Ticket se crea correctamente
- [ ] Emails se envían correctamente

---

### 11. Portal Cliente - Solicitar Asistencia 🛠️
#### Asistencia Remota:
- [ ] Tipo "Remota" selecciona correctamente
- [ ] Calendario muestra fechas disponibles
- [ ] Horarios (8:00-15:00, cada 30min) funcionan
- [ ] Campo descripción de falla funciona
- [ ] Ticket se crea correctamente

#### Asistencia Telefónica:
- [ ] Tipo "Telefónica" selecciona correctamente
- [ ] Calendario y horarios funcionan igual que remota
- [ ] Ticket se crea correctamente

#### Asistencia con Visita:
- [ ] Tipo "Visita" selecciona correctamente
- [ ] Campo "Lugar" funciona
- [ ] Calendario selecciona fecha
- [ ] Ticket se crea correctamente

---

### 12. Portal Cliente - Mi Cuenta 👤
- [ ] Tab "Inicio" muestra botones de acción rápida
- [ ] Tab "Mi cuenta" muestra datos del usuario
- [ ] Editar datos funciona correctamente
- [ ] Tab "Mis Solicitudes" muestra tickets del usuario
- [ ] Pestañas de cada tipo de ticket funcionan
- [ ] Click en ticket abre timeline

---

### 13. Portal Cliente - Timeline de Ticket 📅
- [ ] Timeline visual se muestra correctamente
- [ ] Estados tienen colores correctos
- [ ] Comentarios públicos son visibles
- [ ] Cliente puede agregar comentarios
- [ ] SAT recibe email cuando cliente comenta
- [ ] Comentarios internos NO son visibles para cliente

---

### 14. Multi-idioma 🌍
- [ ] Selector de idioma está visible
- [ ] Cambiar a inglés funciona
- [ ] Cambiar a italiano funciona
- [ ] Cambiar a francés funciona
- [ ] Cambiar a alemán funciona
- [ ] Cambiar a portugués funciona
- [ ] Eslogan "The better way, every day." NO se traduce
- [ ] Emails se envían en idioma correcto

---

### 15. Seguridad 🔒
- [ ] Rate limiting funciona (intentar login 6 veces = bloqueo 15min)
- [ ] Token JWT expira correctamente
- [ ] Rutas protegidas redirigen a login
- [ ] Cliente NO puede acceder a /sat
- [ ] Técnico puede acceder a /sat
- [ ] Admin puede acceder a todo

---

### 16. Responsive Design 📱
- [ ] Portal funciona en móvil (< 768px)
- [ ] Portal funciona en tablet (768px - 1024px)
- [ ] Portal funciona en desktop (> 1024px)
- [ ] Menús y navegación funcionan en móvil
- [ ] Formularios son usables en móvil

---

### 17. Performance ⚡
- [ ] Página carga en < 3 segundos
- [ ] Imágenes optimizadas cargan rápido
- [ ] No hay errores en consola del navegador
- [ ] No hay warnings críticos en consola

---

### 18. Emails 📧
- [ ] Emails NO van a spam
- [ ] Emails tienen formato profesional
- [ ] Emails contienen logo SWARCO
- [ ] Emails tienen colores corporativos
- [ ] Links en emails funcionan correctamente

---

## 🐛 Problemas Conocidos

1. **Rate Limiting bloqueó login inicial**
   - ✅ Solucionado: Esperar 15 minutos
   - ✅ Preventivo: Implementado correctamente

2. **Campo `user_role` no existía en BD**
   - ✅ Solucionado: Agregado manualmente via SQL

3. **Dominio DNS en propagación**
   - ⏳ En proceso: CNAME configurado, esperando propagación

---

## 📊 Prioridades de Testing

### 🔴 Crítico (Probar AHORA):
1. Login SAT
2. Ver dashboard
3. Ver lista de tickets
4. Ver detalle de ticket
5. Cambiar estado de ticket
6. Generar PDF

### 🟡 Importante (Probar DESPUÉS):
7. Timeline cliente
8. Comentarios bidireccionales
9. Crear nuevos tickets (todos los tipos)
10. Emails

### 🟢 Opcional (Si hay tiempo):
11. Multi-idioma
12. Responsive
13. Performance

---

## 📝 Notas

- Después de cada prueba, anotar cualquier bug o mejora
- Tomar capturas de pantalla si algo falla
- Verificar logs del backend en caso de errores
- Probar con diferentes navegadores (Chrome, Firefox, Safari)

---

**Última actualización:** 2026-01-23
**Versión:** 1.0

*¡Vamos a probar el sistema completo! 🚀*
