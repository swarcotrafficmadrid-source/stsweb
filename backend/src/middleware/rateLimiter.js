// Rate limiter simple sin dependencias externas
const requests = new Map();

export function rateLimiter(options = {}) {
  const windowMs = options.windowMs || 15 * 60 * 1000; // 15 minutos
  const max = options.max || 100; // 100 requests
  const message = options.message || "Demasiadas solicitudes. Intenta de nuevo más tarde.";

  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    if (!requests.has(key)) {
      requests.set(key, []);
    }
    
    const timestamps = requests.get(key);
    
    // Limpiar timestamps antiguos
    const validTimestamps = timestamps.filter(time => now - time < windowMs);
    
    if (validTimestamps.length >= max) {
      return res.status(429).json({ error: message });
    }
    
    validTimestamps.push(now);
    requests.set(key, validTimestamps);
    
    // Limpieza periódica de memoria
    if (Math.random() < 0.01) { // 1% de probabilidad
      for (const [k, v] of requests.entries()) {
        const valid = v.filter(time => now - time < windowMs);
        if (valid.length === 0) {
          requests.delete(k);
        } else {
          requests.set(k, valid);
        }
      }
    }
    
    next();
  };
}

// Rate limiters específicos
export const authLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 intentos (temporal para testing)
  message: "Demasiados intentos de autenticación. Intenta de nuevo en 15 minutos."
});

export const apiLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Demasiadas solicitudes. Intenta de nuevo más tarde."
});

// ✅ SEGURIDAD: Rate limiter ESTRICTO para admin (evita brute force)
export const adminLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,  // 15 minutos
  max: 10,  // Solo 10 requests por admin cada 15 minutos
  message: "Demasiados intentos de administración. Contacta con soporte."
});
