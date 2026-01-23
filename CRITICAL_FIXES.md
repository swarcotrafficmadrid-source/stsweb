# 🔧 FIXES CRÍTICOS - Implementar AHORA

**Prioridad:** 🔴 URGENTE  
**Tiempo estimado:** 30 minutos

---

## FIX #1: localStorage seguro (modo incógnito)

**Archivo:** `frontend/src/App.jsx`

**Buscar línea 85:**
```javascript
const [token, setToken] = useState(localStorage.getItem("token"));
```

**Reemplazar por:**
```javascript
const [token, setToken] = useState(() => {
  try {
    return localStorage.getItem("token");
  } catch (e) {
    console.warn("localStorage no disponible, usando sessionStorage");
    return sessionStorage.getItem("token");
  }
});
```

**Buscar línea 499 (dentro de Login onSuccess):**
```javascript
onSuccess={(tokenValue) => { setToken(tokenValue); localStorage.setItem("token", tokenValue); }}
```

**Reemplazar por:**
```javascript
onSuccess={(tokenValue) => {
  setToken(tokenValue);
  try {
    localStorage.setItem("token", tokenValue);
  } catch (e) {
    sessionStorage.setItem("token", tokenValue);
  }
}}
```

---

## FIX #2: JWT_SECRET validation

**Archivo:** `backend/src/server.js`

**Agregar después de línea 26:**
```javascript
dotenv.config();

// Validar variables críticas
if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'undefined') {
  console.error('❌ CRITICAL: JWT_SECRET no está configurado');
  process.exit(1);
}

if (!process.env.DB_HOST || !process.env.DB_NAME) {
  console.error('❌ CRITICAL: Variables de BD no configuradas');
  process.exit(1);
}

console.log('✅ Variables de entorno validadas');
```

---

## FIX #3: Google Maps API Key segura

**Archivo:** `frontend/src/components/TicketsMap.jsx`

**Buscar línea ~110:**
```javascript
src={`https://www.google.com/maps/embed/v1/view?key=AIzaSyBFw0Qyda5XUrriSA1CqC7cWdDacm0E1TE&center=${centerLat},${centerLng}&zoom=10`}
```

**Reemplazar por:**
```javascript
src={`https://www.google.com/maps/embed/v1/view?key=${import.meta.env.VITE_GOOGLE_MAPS_KEY || 'AIzaSyBFw0Qyda5XUrriSA1CqC7cWdDacm0E1TE'}&center=${centerLat},${centerLng}&zoom=10`}
```

**Crear archivo:** `.env` en `frontend/`:
```bash
VITE_GOOGLE_MAPS_KEY=your_restricted_api_key_here
```

---

## FIX #4: Token expirado específico

**Archivo:** `backend/src/middleware/auth.js`

**Reemplazar TODO el contenido:**
```javascript
import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  
  if (!token) {
    return res.status(401).json({ 
      error: "Token requerido",
      code: "NO_TOKEN" 
    });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    return next();
  } catch (err) {
    // Distinguir entre token expirado vs inválido
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: "Token expirado. Por favor, inicia sesión nuevamente.",
        code: "TOKEN_EXPIRED",
        expiredAt: err.expiredAt
      });
    }
    
    return res.status(401).json({ 
      error: "Token inválido",
      code: "INVALID_TOKEN" 
    });
  }
}
```

---

## FIX #5: BD connection retry

**Archivo:** `backend/src/server.js`

**Reemplazar función `start()` (líneas 66-75):**
```javascript
async function start() {
  const maxRetries = 5;
  let attempt = 0;
  
  while (attempt < maxRetries) {
    try {
      console.log(`🔄 Intentando conectar a BD (intento ${attempt + 1}/${maxRetries})...`);
      await sequelize.authenticate();
      console.log('✅ Conectado a la base de datos');
      
      const alter = String(process.env.DB_SYNC_ALTER || "").toLowerCase() === "true";
      await sequelize.sync({ alter });
      
      app.listen(port, () => {
        console.log(`✅ API listening on ${port}`);
      });
      
      return; // Éxito, salir del loop
      
    } catch (error) {
      attempt++;
      console.error(`❌ Error conectando a BD (intento ${attempt}/${maxRetries}):`, error.message);
      
      if (attempt >= maxRetries) {
        console.error('💀 No se pudo conectar a BD después de', maxRetries, 'intentos');
        process.exit(1);
      }
      
      // Esperar antes de reintentar (exponential backoff)
      const waitTime = Math.min(1000 * Math.pow(2, attempt), 10000);
      console.log(`⏳ Esperando ${waitTime}ms antes de reintentar...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
}

start();
```

---

## FIX #6: Timeout en Mobile

**Archivo:** `mobile/src/screens/LoginScreen.js`

**Después de línea 5:**
```javascript
const API_URL = 'https://stsweb-backend-964379250608.europe-west1.run.app';

// Configurar axios con timeout
axios.defaults.timeout = 15000; // 15 segundos
axios.defaults.timeoutErrorMessage = 'La solicitud tardó demasiado. Verifica tu conexión.';
```

**Aplicar lo mismo en:**
- `mobile/src/screens/DashboardScreen.js`
- `mobile/src/screens/CreateTicketScreen.js`
- `mobile/src/screens/TicketDetailScreen.js`

---

## FIX #7: FileUploader tamaño ANTES de subir

**Archivo:** `frontend/src/components/FileUploader.jsx`

**Buscar la función `handleFileChange` y agregar AL INICIO:**
```javascript
function handleFileChange(e) {
  const selected = Array.from(e.target.files);
  
  // Validar tamaño ANTES de procesar
  const MAX_SIZE = type === 'video' ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
  for (const file of selected) {
    if (file.size > MAX_SIZE) {
      setError(type === 'video' 
        ? `Video demasiado grande: ${(file.size / 1024 / 1024).toFixed(1)}MB (máx 50MB)`
        : `Imagen demasiado grande: ${(file.size / 1024 / 1024).toFixed(1)}MB (máx 5MB)`
      );
      return; // Detener inmediatamente
    }
  }
  
  // ... resto del código existente
```

---

## FIX #8: Chatbot rate limiting

**Archivo:** `frontend/src/components/ChatbotWidget.jsx`

**Agregar al inicio del componente (después de useState):**
```javascript
const [lastMessageTime, setLastMessageTime] = useState(0);
const MESSAGE_COOLDOWN = 1000; // 1 segundo entre mensajes
```

**Modificar `handleSend`:**
```javascript
async function handleSend(e) {
  e?.preventDefault();
  
  if (!inputMessage.trim() || loading) return;
  
  // Rate limiting del lado del cliente
  const now = Date.now();
  if (now - lastMessageTime < MESSAGE_COOLDOWN) {
    return; // Ignorar mensaje muy rápido
  }
  setLastMessageTime(now);
  
  // ... resto del código existente
```

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN:

```
[ ] Fix #1: localStorage seguro
[ ] Fix #2: JWT_SECRET validation  
[ ] Fix #3: Google Maps API Key
[ ] Fix #4: Token expirado específico
[ ] Fix #5: BD connection retry
[ ] Fix #6: Timeout en Mobile
[ ] Fix #7: FileUploader validación temprana
[ ] Fix #8: Chatbot rate limiting
```

---

## 🚀 DEPLOY DESPUÉS DE FIXES:

```bash
# 1. Commit changes
git add .
git commit -m "fix: Critical security and robustness improvements"
git push

# 2. Re-deploy backend
cd backend
gcloud run deploy stsweb-backend --source . --region europe-west1

# 3. Re-deploy frontend  
cd ../frontend
gcloud run deploy stsweb --source . --region europe-west1
```

**Tiempo total:** 30 min código + 15 min deploy = **45 minutos**

---

## ✅ VERIFICACIÓN POST-FIX:

1. Probar en modo incógnito (debe funcionar con sessionStorage)
2. Dejar token expirar y verificar mensaje específico
3. Matar conexión de BD y verificar retry
4. Subir archivo >5MB y verificar error inmediato
5. Spammear chatbot y verificar que ignora mensajes rápidos

---

**Prioridad:** 🔴 CRÍTICA  
**Implementar:** ANTES de dar acceso a usuarios reales  
**Riesgo si no se implementa:** Usuarios bloqueados + vulnerabilidades
