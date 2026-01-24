/**
 * Rate Limiter con Redis (Distribuido, Sin Memory Leaks)
 * Reemplaza el rate limiter in-memory que causaba OOM kills
 */

import Redis from 'ioredis';

// Configurar conexión a Redis
const redisUrl = process.env.REDIS_URL;

let redis;
if (redisUrl) {
  try {
    redis = new Redis(redisUrl, {
      connectTimeout: 10000,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3
    });

    redis.on('connect', () => {
      console.log('✅ Redis conectado (rate limiter distribuido activo)');
    });

    redis.on('error', (err) => {
      console.error('❌ Redis error:', err.message);
    });
  } catch (error) {
    console.error('❌ Error inicializando Redis:', error.message);
    redis = null;
  }
} else {
  console.warn('⚠️ REDIS_URL no configurado - usando fallback in-memory (NO RECOMENDADO en producción)');
}

/**
 * Rate limiter middleware con Redis
 * @param {Object} options - Configuración
 * @param {number} options.windowMs - Ventana de tiempo en ms
 * @param {number} options.max - Máximo de requests permitidos
 * @param {string} options.message - Mensaje de error
 */
export function rateLimiter(options = {}) {
  const windowMs = options.windowMs || 15 * 60 * 1000; // 15 minutos default
  const max = options.max || 100;
  const message = options.message || 'Demasiadas solicitudes. Intenta de nuevo más tarde.';

  // Fallback in-memory si Redis no está disponible
  const inMemoryStore = new Map();

  return async (req, res, next) => {
    try {
      const key = `ratelimit:${req.ip}`;

      if (redis && redis.status === 'ready') {
        // ✅ Usar Redis (distribuido, sin memory leaks)
        const current = await redis.incr(key);
        
        if (current === 1) {
          // Primera request en esta ventana, configurar expiración
          await redis.pexpire(key, windowMs);
        }

        if (current > max) {
          return res.status(429).json({ error: message });
        }
      } else {
        // ⚠️ Fallback in-memory (solo para desarrollo/emergencias)
        const now = Date.now();
        const record = inMemoryStore.get(req.ip) || { count: 0, resetTime: now + windowMs };

        if (now > record.resetTime) {
          record.count = 0;
          record.resetTime = now + windowMs;
        }

        record.count++;

        if (record.count > max) {
          return res.status(429).json({ error: message });
        }

        inMemoryStore.set(req.ip, record);

        // Cleanup periódico del in-memory store (prevenir memory leak)
        if (Math.random() < 0.01) {
          for (const [ip, data] of inMemoryStore.entries()) {
            if (now > data.resetTime) {
              inMemoryStore.delete(ip);
            }
          }
        }
      }

      next();
    } catch (error) {
      console.error('Rate limiter error:', error);
      // En caso de error, permitir el request (fail open)
      next();
    }
  };
}

// Presets configurados
export const authLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Demasiados intentos de inicio de sesión. Intenta de nuevo en 15 minutos."
});

export const apiLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Demasiadas solicitudes. Intenta de nuevo más tarde."
});

export const adminLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Demasiados intentos de administración. Contacta con soporte."
});

// Cleanup al cerrar la aplicación
process.on('SIGTERM', async () => {
  if (redis) {
    await redis.quit();
  }
});
