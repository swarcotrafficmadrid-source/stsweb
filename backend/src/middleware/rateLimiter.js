// Rate limiter simple sin dependencias externas
const requests = new Map();

// Función para limpiar rate limits (útil para desarrollo/testing)
export function clearRateLimits(email = null) {
  if (email) {
    const key = `email:${email.toLowerCase().trim()}`;
    requests.delete(key);
    console.log(`🧹 Rate limit limpiado para: ${email}`);
  } else {
    requests.clear();
    console.log("🧹 Todos los rate limits limpiados");
  }
}

// Rate limiter genérico por IP
// REACTIVADO con límites razonables y mejoras
export function rateLimiter(options = {}) {
  const windowMs = options.windowMs || 15 * 60 * 1000; // 15 minutos
  const max = options.max || 200; // Aumentado a 200 requests por ventana
  const message = options.message || "Demasiadas solicitudes. Intenta de nuevo más tarde.";

  return (req, res, next) => {
    const key = `ip:${req.ip || req.connection.remoteAddress || 'unknown'}`;
    const now = Date.now();
    
    if (!requests.has(key)) {
      requests.set(key, []);
    }
    
    const timestamps = requests.get(key);
    const validTimestamps = timestamps.filter(time => now - time < windowMs);
    
    if (validTimestamps.length >= max) {
      const oldestTimestamp = validTimestamps[0];
      const timeRemaining = Math.ceil((windowMs - (now - oldestTimestamp)) / 1000 / 60);
      console.warn(`⚠️ Rate limit alcanzado para ${key}: ${validTimestamps.length}/${max} requests`);
      return res.status(429).json({ 
        error: message,
        timeRemaining: timeRemaining,
        retryAfter: Math.ceil((windowMs - (now - oldestTimestamp)) / 1000)
      });
    }
    
    validTimestamps.push(now);
    requests.set(key, validTimestamps);
    
    // Limpieza periódica más agresiva (cada 100 requests aproximadamente)
    if (Math.random() < 0.1) {
      const cleanupStart = Date.now();
      let cleaned = 0;
      for (const [k, v] of requests.entries()) {
        const valid = v.filter(time => now - time < windowMs);
        if (valid.length === 0) {
          requests.delete(k);
          cleaned++;
        } else {
          requests.set(k, valid);
        }
      }
      if (cleaned > 0) {
        console.log(`🧹 Rate limiter cleanup: ${cleaned} entradas eliminadas en ${Date.now() - cleanupStart}ms`);
      }
    }
    
    next();
  };
}

// Rate limiter por email (para login y registro)
// REACTIVADO con límites razonables y mejoras
export function emailRateLimiter(options = {}) {
  const windowMs = options.windowMs || 15 * 60 * 1000;
  const max = options.max || 10; // Aumentado a 10 intentos
  const message = options.message || "Demasiados intentos. Intenta de nuevo más tarde.";
  const emailField = options.emailField || "identifier";

  return (req, res, next) => {
    const email = req.body?.[emailField] || req.body?.email;
    if (!email) {
      // Si no hay email, usar IP como fallback
      const key = `ip:${req.ip || req.connection.remoteAddress || 'unknown'}`;
      const now = Date.now();
      
      if (!requests.has(key)) {
        requests.set(key, []);
      }
      
      const timestamps = requests.get(key);
      const validTimestamps = timestamps.filter(time => now - time < windowMs);
      
      if (validTimestamps.length >= max) {
        const oldestTimestamp = validTimestamps[0];
        const timeRemaining = Math.ceil((windowMs - (now - oldestTimestamp)) / 1000 / 60);
        console.warn(`⚠️ Rate limit alcanzado para ${key}: ${validTimestamps.length}/${max} intentos`);
        return res.status(429).json({ 
          error: message,
          timeRemaining: timeRemaining,
          retryAfter: Math.ceil((windowMs - (now - oldestTimestamp)) / 1000)
        });
      }
      
      validTimestamps.push(now);
      requests.set(key, validTimestamps);
      return next();
    }

    const key = `email:${email.toLowerCase().trim()}`;
    const now = Date.now();
    
    if (!requests.has(key)) {
      requests.set(key, []);
    }
    
    const timestamps = requests.get(key);
    const validTimestamps = timestamps.filter(time => now - time < windowMs);
    
    if (validTimestamps.length >= max) {
      const oldestTimestamp = validTimestamps[0];
      const timeRemaining = Math.ceil((windowMs - (now - oldestTimestamp)) / 1000 / 60);
      console.warn(`⚠️ Rate limit alcanzado para email ${key}: ${validTimestamps.length}/${max} intentos`);
      return res.status(429).json({ 
        error: message,
        timeRemaining: timeRemaining,
        retryAfter: Math.ceil((windowMs - (now - oldestTimestamp)) / 1000)
      });
    }
    
    validTimestamps.push(now);
    requests.set(key, validTimestamps);
    
    // Limpieza periódica
    if (Math.random() < 0.1) {
      let cleaned = 0;
      for (const [k, v] of requests.entries()) {
        const valid = v.filter(time => now - time < windowMs);
        if (valid.length === 0) {
          requests.delete(k);
          cleaned++;
        } else {
          requests.set(k, valid);
        }
      }
      if (cleaned > 0) {
        console.log(`🧹 Rate limiter cleanup: ${cleaned} entradas eliminadas`);
      }
    }
    
    next();
  };
}

// Rate limiters específicos con límites razonables
export const loginLimiter = emailRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutos (ventana más larga)
  max: 10, // 10 intentos por email en 15 minutos
  emailField: "identifier",
  message: "Demasiados intentos de login para este email. Intenta de nuevo en unos minutos."
});

// Rate limiter para registro: por email (más justo que por IP)
export const registerLimiter = emailRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 5, // 5 intentos de registro por email por hora (más restrictivo)
  emailField: "email",
  message: "Demasiados intentos de registro para este email. Intenta de nuevo en 1 hora o usa otro email."
});

// Rate limiter para API general - límites generosos para no bloquear uso normal
export const apiLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 200, // 200 requests por IP en 15 minutos (muy generoso)
  message: "Demasiadas solicitudes. Intenta de nuevo más tarde."
});
