// Rate limiter simple sin dependencias externas
const requests = new Map();

// Rate limiter genérico por IP
export function rateLimiter(options = {}) {
  const windowMs = options.windowMs || 15 * 60 * 1000;
  const max = options.max || 100;
  const message = options.message || "Demasiadas solicitudes. Intenta de nuevo más tarde.";

  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    if (!requests.has(key)) {
      requests.set(key, []);
    }
    
    const timestamps = requests.get(key);
    const validTimestamps = timestamps.filter(time => now - time < windowMs);
    
    if (validTimestamps.length >= max) {
      return res.status(429).json({ error: message });
    }
    
    validTimestamps.push(now);
    requests.set(key, validTimestamps);
    
    // Limpieza periódica
    if (Math.random() < 0.01) {
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

// Rate limiter por email (para login específicamente)
export function emailRateLimiter(options = {}) {
  const windowMs = options.windowMs || 15 * 60 * 1000;
  const max = options.max || 5;
  const message = options.message || "Demasiados intentos. Intenta de nuevo más tarde.";
  const emailField = options.emailField || "identifier"; // Campo del body que contiene el email

  return (req, res, next) => {
    const email = req.body?.[emailField] || req.body?.email;
    if (!email) {
      return next(); // Si no hay email, pasar al siguiente middleware
    }

    const key = `email:${email.toLowerCase()}`;
    const now = Date.now();
    
    if (!requests.has(key)) {
      requests.set(key, []);
    }
    
    const timestamps = requests.get(key);
    const validTimestamps = timestamps.filter(time => now - time < windowMs);
    
    if (validTimestamps.length >= max) {
      return res.status(429).json({ error: message });
    }
    
    validTimestamps.push(now);
    requests.set(key, validTimestamps);
    
    next();
  };
}

// Rate limiters específicos
export const loginLimiter = emailRateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutos (antes 15)
  max: 10, // 10 intentos por email
  emailField: "identifier",
  message: "Demasiados intentos de login para este email. Intenta de nuevo en 5 minutos."
});

export const registerLimiter = rateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 5, // 5 registros por IP por hora
  message: "Demasiados intentos de registro. Intenta de nuevo en 1 hora."
});

export const apiLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 200, // 200 requests por 15 minutos = ~13 por minuto
  message: "Demasiadas solicitudes. Intenta de nuevo más tarde."
});
