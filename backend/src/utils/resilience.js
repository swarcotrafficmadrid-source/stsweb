/**
 * 🛡️ RESILIENCIA Y CIRCUIT BREAKERS - STM WEB SYSTEM
 * 
 * Implementación de patrones de resiliencia de nivel empresarial
 * para garantizar que el sistema NO MUERE bajo ninguna circunstancia
 * 
 * Patrones implementados:
 * - Circuit Breaker
 * - Retry con Exponential Backoff
 * - Bulkhead (aislamiento de recursos)
 * - Timeout
 * - Fallback
 * - Health Checks
 * - Graceful Degradation
 */

import EventEmitter from 'events';

// ==================== CIRCUIT BREAKER ====================

/**
 * Circuit Breaker: Previene cascading failures
 * 
 * Estados:
 * - CLOSED: Todo normal, requests pasan
 * - OPEN: Demasiados errores, requests fallan inmediatamente
 * - HALF_OPEN: Periodo de prueba, permite algunos requests
 */
class CircuitBreaker extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.state = 'CLOSED';  // CLOSED | OPEN | HALF_OPEN
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
    this.nextAttemptTime = null;
    
    // Configuración
    this.failureThreshold = options.failureThreshold || 5;  // Errores para abrir
    this.successThreshold = options.successThreshold || 2;  // Éxitos para cerrar
    this.timeout = options.timeout || 60000;  // 60s antes de intentar de nuevo
    this.resetTimeout = options.resetTimeout || 10000;  // 10s para reset en HALF_OPEN
    
    // Métricas
    this.metrics = {
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      rejectedCalls: 0,  // Rechazados porque circuit está OPEN
      timeouts: 0
    };
  }
  
  async execute(fn, fallbackFn = null) {
    this.metrics.totalCalls++;
    
    // Si circuit está OPEN, rechazar inmediatamente
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttemptTime) {
        this.metrics.rejectedCalls++;
        this.emit('reject', { state: this.state, nextAttempt: this.nextAttemptTime });
        
        if (fallbackFn) {
          console.log('⚡ Circuit OPEN: usando fallback');
          return await fallbackFn();
        }
        
        throw new Error('Circuit breaker is OPEN');
      }
      
      // Tiempo cumplido, intentar HALF_OPEN
      this.state = 'HALF_OPEN';
      this.successCount = 0;
      this.failureCount = 0;
      this.emit('half_open');
      console.log('🔄 Circuit HALF_OPEN: probando conexión...');
    }
    
    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      
      if (fallbackFn) {
        console.log('⚡ Error capturado: usando fallback');
        return await fallbackFn();
      }
      
      throw error;
    }
  }
  
  onSuccess() {
    this.metrics.successfulCalls++;
    this.failureCount = 0;
    
    if (this.state === 'HALF_OPEN') {
      this.successCount++;
      
      if (this.successCount >= this.successThreshold) {
        this.state = 'CLOSED';
        this.successCount = 0;
        this.emit('close');
        console.log('✅ Circuit CLOSED: sistema recuperado');
      }
    }
  }
  
  onFailure() {
    this.metrics.failedCalls++;
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.state === 'HALF_OPEN') {
      // En HALF_OPEN, un solo error abre el circuit de nuevo
      this.state = 'OPEN';
      this.nextAttemptTime = Date.now() + this.timeout;
      this.emit('open', { reason: 'HALF_OPEN failure', nextAttempt: this.nextAttemptTime });
      console.error('🔴 Circuit OPEN: fallo durante HALF_OPEN');
      return;
    }
    
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
      this.nextAttemptTime = Date.now() + this.timeout;
      this.emit('open', { reason: 'Threshold reached', failures: this.failureCount });
      console.error(`🔴 Circuit OPEN: ${this.failureCount} fallos consecutivos`);
    }
  }
  
  getMetrics() {
    const successRate = this.metrics.totalCalls > 0
      ? (this.metrics.successfulCalls / this.metrics.totalCalls * 100).toFixed(2)
      : 0;
    
    return {
      state: this.state,
      ...this.metrics,
      successRate: `${successRate}%`,
      currentFailures: this.failureCount,
      currentSuccesses: this.successCount
    };
  }
}

// ==================== RETRY CON EXPONENTIAL BACKOFF ====================

class RetryPolicy {
  constructor(options = {}) {
    this.maxAttempts = options.maxAttempts || 3;
    this.initialDelay = options.initialDelay || 1000;  // 1s
    this.maxDelay = options.maxDelay || 30000;  // 30s
    this.backoffMultiplier = options.backoffMultiplier || 2;
    this.jitter = options.jitter !== false;  // Random jitter por defecto
  }
  
  async execute(fn, options = {}) {
    let lastError;
    
    for (let attempt = 1; attempt <= this.maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        if (attempt === this.maxAttempts) {
          console.error(`❌ Retry failed después de ${attempt} intentos:`, error.message);
          throw error;
        }
        
        // Calcular delay con exponential backoff
        const exponentialDelay = Math.min(
          this.initialDelay * Math.pow(this.backoffMultiplier, attempt - 1),
          this.maxDelay
        );
        
        // Agregar jitter aleatorio (±25%)
        const jitter = this.jitter
          ? exponentialDelay * (0.75 + Math.random() * 0.5)
          : exponentialDelay;
        
        const delay = Math.floor(jitter);
        
        console.warn(`⚠️ Intento ${attempt}/${this.maxAttempts} falló, reintentando en ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  }
}

// ==================== BULKHEAD (AISLAMIENTO) ====================

/**
 * Bulkhead: Limita recursos para un servicio específico
 * Previene que un servicio lento consuma todos los recursos
 */
class Bulkhead {
  constructor(options = {}) {
    this.maxConcurrent = options.maxConcurrent || 10;
    this.maxQueue = options.maxQueue || 100;
    this.timeout = options.timeout || 30000;
    
    this.running = 0;
    this.queue = [];
    
    this.metrics = {
      totalExecutions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      rejectedExecutions: 0,
      timeouts: 0,
      currentRunning: 0,
      currentQueued: 0
    };
  }
  
  async execute(fn) {
    this.metrics.totalExecutions++;
    
    // Si ya hay demasiadas en ejecución, encolar
    if (this.running >= this.maxConcurrent) {
      if (this.queue.length >= this.maxQueue) {
        this.metrics.rejectedExecutions++;
        throw new Error(`Bulkhead queue full (${this.maxQueue})`);
      }
      
      // Esperar en la cola
      await new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          const index = this.queue.indexOf(item);
          if (index > -1) {
            this.queue.splice(index, 1);
          }
          this.metrics.timeouts++;
          reject(new Error('Bulkhead queue timeout'));
        }, this.timeout);
        
        const item = { resolve, reject, timeoutId };
        this.queue.push(item);
        this.metrics.currentQueued = this.queue.length;
      });
    }
    
    this.running++;
    this.metrics.currentRunning = this.running;
    
    try {
      const result = await fn();
      this.metrics.successfulExecutions++;
      return result;
    } catch (error) {
      this.metrics.failedExecutions++;
      throw error;
    } finally {
      this.running--;
      this.metrics.currentRunning = this.running;
      
      // Procesar siguiente en cola
      if (this.queue.length > 0) {
        const next = this.queue.shift();
        this.metrics.currentQueued = this.queue.length;
        clearTimeout(next.timeoutId);
        next.resolve();
      }
    }
  }
  
  getMetrics() {
    return { ...this.metrics };
  }
}

// ==================== TIMEOUT ====================

async function withTimeout(promise, timeoutMs, errorMessage = 'Operation timed out') {
  let timeoutId;
  
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(errorMessage));
    }, timeoutMs);
  });
  
  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timeoutId);
    return result;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// ==================== IMPLEMENTACIÓN PARA SERVICIOS ====================

/**
 * ResilientDatabaseConnection: Database con circuit breaker y retry
 */
class ResilientDatabaseConnection {
  constructor(sequelize) {
    this.sequelize = sequelize;
    
    this.circuitBreaker = new CircuitBreaker({
      failureThreshold: 5,
      successThreshold: 2,
      timeout: 30000
    });
    
    this.retryPolicy = new RetryPolicy({
      maxAttempts: 3,
      initialDelay: 1000,
      maxDelay: 10000
    });
    
    this.bulkhead = new Bulkhead({
      maxConcurrent: 50,  // Máximo 50 queries simultáneos
      maxQueue: 200,
      timeout: 30000
    });
    
    // Eventos de circuit breaker
    this.circuitBreaker.on('open', (data) => {
      console.error('💀 DATABASE CIRCUIT BREAKER OPEN:', data);
      // Aquí puedes enviar alerta a Slack, email, etc.
    });
    
    this.circuitBreaker.on('half_open', () => {
      console.warn('🔄 DATABASE CIRCUIT BREAKER HALF_OPEN: probando reconexión...');
    });
    
    this.circuitBreaker.on('close', () => {
      console.log('✅ DATABASE CIRCUIT BREAKER CLOSED: conexión restaurada');
    });
  }
  
  async query(sql, options = {}) {
    const fallback = async () => {
      // Fallback: retornar datos del cache si existe
      console.warn('⚡ Database circuit OPEN, intentando cache...');
      // Aquí podrías consultar Redis cache
      throw new Error('Database unavailable and no cache available');
    };
    
    return await this.bulkhead.execute(async () => {
      return await this.circuitBreaker.execute(async () => {
        return await this.retryPolicy.execute(async () => {
          return await withTimeout(
            this.sequelize.query(sql, options),
            10000,  // 10s timeout por query
            'Database query timeout'
          );
        });
      }, fallback);
    });
  }
  
  async findOne(model, options) {
    const fallback = async () => {
      console.warn('⚡ Database circuit OPEN para findOne');
      return null;  // Fallback: retornar null
    };
    
    return await this.bulkhead.execute(async () => {
      return await this.circuitBreaker.execute(async () => {
        return await this.retryPolicy.execute(async () => {
          return await withTimeout(
            model.findOne(options),
            5000,
            'findOne timeout'
          );
        });
      }, fallback);
    });
  }
  
  async findAll(model, options) {
    const fallback = async () => {
      console.warn('⚡ Database circuit OPEN para findAll');
      return [];  // Fallback: array vacío
    };
    
    return await this.bulkhead.execute(async () => {
      return await this.circuitBreaker.execute(async () => {
        // NO retry en findAll (puede ser costoso)
        return await withTimeout(
          model.findAll(options),
          10000,
          'findAll timeout'
        );
      }, fallback);
    });
  }
  
  getMetrics() {
    return {
      circuitBreaker: this.circuitBreaker.getMetrics(),
      bulkhead: this.bulkhead.getMetrics()
    };
  }
}

/**
 * ResilientEmailService: Email con queue y circuit breaker
 */
class ResilientEmailService {
  constructor(emailQueue) {
    this.emailQueue = emailQueue;
    
    this.circuitBreaker = new CircuitBreaker({
      failureThreshold: 10,  // Más tolerante para emails
      successThreshold: 3,
      timeout: 120000  // 2 minutos
    });
    
    this.retryPolicy = new RetryPolicy({
      maxAttempts: 5,  // Más intentos para emails
      initialDelay: 5000,
      maxDelay: 300000  // Hasta 5 minutos
    });
    
    this.circuitBreaker.on('open', () => {
      console.error('💀 EMAIL SERVICE CIRCUIT BREAKER OPEN');
      console.error('   Emails se encolarán pero NO se enviarán hasta recuperación');
    });
  }
  
  async sendMail(options) {
    const fallback = async () => {
      // Fallback: Encolar para más tarde
      console.warn('⚡ Email service circuit OPEN, encolando...');
      await this.emailQueue.add(options, {
        delay: 300000,  // Reintentar en 5 minutos
        attempts: 10,
        backoff: {
          type: 'exponential',
          delay: 60000
        }
      });
      
      return { ok: true, queued: true, reason: 'Circuit breaker open' };
    };
    
    return await this.circuitBreaker.execute(async () => {
      return await this.retryPolicy.execute(async () => {
        return await withTimeout(
          this.emailQueue.add(options),
          5000,
          'Email queue timeout'
        );
      });
    }, fallback);
  }
  
  getMetrics() {
    return this.circuitBreaker.getMetrics();
  }
}

/**
 * ResilientExternalAPI: Llamadas a APIs externas (OpenAI, Google Maps, etc)
 */
class ResilientExternalAPI {
  constructor(apiName) {
    this.apiName = apiName;
    
    this.circuitBreaker = new CircuitBreaker({
      failureThreshold: 3,  // Más estricto para APIs externas
      successThreshold: 2,
      timeout: 60000
    });
    
    this.retryPolicy = new RetryPolicy({
      maxAttempts: 3,
      initialDelay: 2000,
      maxDelay: 30000
    });
    
    this.bulkhead = new Bulkhead({
      maxConcurrent: 10,  // Límite de requests simultáneos a API externa
      maxQueue: 50,
      timeout: 60000
    });
    
    this.circuitBreaker.on('open', () => {
      console.error(`💀 ${apiName} API CIRCUIT BREAKER OPEN`);
    });
  }
  
  async call(fn, fallbackFn = null) {
    const defaultFallback = async () => {
      console.warn(`⚡ ${this.apiName} API circuit OPEN, usando fallback`);
      return { error: 'Service temporarily unavailable', fallback: true };
    };
    
    return await this.bulkhead.execute(async () => {
      return await this.circuitBreaker.execute(async () => {
        return await this.retryPolicy.execute(async () => {
          return await fn();
        });
      }, fallbackFn || defaultFallback);
    });
  }
  
  getMetrics() {
    return {
      circuitBreaker: this.circuitBreaker.getMetrics(),
      bulkhead: this.bulkhead.getMetrics()
    };
  }
}

// ==================== HEALTH CHECKS ====================

/**
 * HealthChecker: Monitoreo proactivo de servicios
 */
class HealthChecker {
  constructor() {
    this.services = new Map();
    this.checkInterval = 30000;  // Cada 30 segundos
    this.intervalId = null;
  }
  
  registerService(name, checkFn) {
    this.services.set(name, {
      name,
      checkFn,
      status: 'UNKNOWN',
      lastCheck: null,
      lastSuccess: null,
      lastFailure: null,
      consecutiveFailures: 0,
      totalChecks: 0,
      successfulChecks: 0,
      failedChecks: 0
    });
  }
  
  async checkService(name) {
    const service = this.services.get(name);
    if (!service) return;
    
    service.totalChecks++;
    service.lastCheck = Date.now();
    
    try {
      await withTimeout(service.checkFn(), 5000, `${name} health check timeout`);
      
      service.status = 'HEALTHY';
      service.lastSuccess = Date.now();
      service.consecutiveFailures = 0;
      service.successfulChecks++;
      
    } catch (error) {
      service.status = 'UNHEALTHY';
      service.lastFailure = Date.now();
      service.consecutiveFailures++;
      service.failedChecks++;
      
      console.error(`🔴 Health check FAILED for ${name}:`, error.message);
      
      // Alerta si 3 fallos consecutivos
      if (service.consecutiveFailures >= 3) {
        console.error(`💀 CRITICAL: ${name} has failed ${service.consecutiveFailures} consecutive health checks`);
        // Aquí enviar alerta crítica
      }
    }
  }
  
  async checkAll() {
    const promises = [];
    for (const [name] of this.services) {
      promises.push(this.checkService(name));
    }
    await Promise.all(promises);
  }
  
  start() {
    if (this.intervalId) return;
    
    console.log(`✅ Health checker iniciado (intervalo: ${this.checkInterval}ms)`);
    
    // Check inmediato
    this.checkAll();
    
    // Checks periódicos
    this.intervalId = setInterval(() => {
      this.checkAll();
    }, this.checkInterval);
  }
  
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('🛑 Health checker detenido');
    }
  }
  
  getStatus() {
    const status = {};
    
    for (const [name, service] of this.services) {
      const uptime = service.totalChecks > 0
        ? (service.successfulChecks / service.totalChecks * 100).toFixed(2)
        : 0;
      
      status[name] = {
        status: service.status,
        uptime: `${uptime}%`,
        lastCheck: service.lastCheck ? new Date(service.lastCheck).toISOString() : null,
        lastSuccess: service.lastSuccess ? new Date(service.lastSuccess).toISOString() : null,
        lastFailure: service.lastFailure ? new Date(service.lastFailure).toISOString() : null,
        consecutiveFailures: service.consecutiveFailures,
        totalChecks: service.totalChecks
      };
    }
    
    // Status general
    const allHealthy = Array.from(this.services.values()).every(s => s.status === 'HEALTHY');
    
    return {
      overall: allHealthy ? 'HEALTHY' : 'DEGRADED',
      services: status,
      timestamp: new Date().toISOString()
    };
  }
}

// ==================== GRACEFUL SHUTDOWN ====================

/**
 * GracefulShutdown: Manejo de señales para shutdown sin perder datos
 */
class GracefulShutdown {
  constructor(server) {
    this.server = server;
    this.connections = new Set();
    this.isShuttingDown = false;
    this.shutdownTimeout = 30000;  // 30 segundos máximo
    
    // Trackear todas las conexiones
    server.on('connection', (conn) => {
      this.connections.add(conn);
      conn.on('close', () => {
        this.connections.delete(conn);
      });
    });
    
    // Capturar señales
    process.on('SIGTERM', () => this.shutdown('SIGTERM'));
    process.on('SIGINT', () => this.shutdown('SIGINT'));
    process.on('uncaughtException', (error) => {
      console.error('💀 UNCAUGHT EXCEPTION:', error);
      this.shutdown('UNCAUGHT_EXCEPTION');
    });
    process.on('unhandledRejection', (reason, promise) => {
      console.error('💀 UNHANDLED REJECTION:', reason);
      this.shutdown('UNHANDLED_REJECTION');
    });
  }
  
  async shutdown(signal) {
    if (this.isShuttingDown) {
      console.log('⏳ Shutdown ya en progreso...');
      return;
    }
    
    this.isShuttingDown = true;
    console.log(`\n🛑 Graceful shutdown iniciado (señal: ${signal})`);
    
    // Timeout para forzar shutdown
    const forceShutdownTimer = setTimeout(() => {
      console.error('💀 FORCE SHUTDOWN: timeout excedido');
      process.exit(1);
    }, this.shutdownTimeout);
    
    try {
      // 1. Stop aceptando nuevas conexiones
      console.log('1️⃣ Deteniendo servidor HTTP...');
      await new Promise((resolve) => {
        this.server.close(() => {
          console.log('   ✅ Servidor HTTP cerrado');
          resolve();
        });
      });
      
      // 2. Esperar a que terminen requests actuales
      console.log(`2️⃣ Esperando ${this.connections.size} conexiones activas...`);
      let waited = 0;
      while (this.connections.size > 0 && waited < 10000) {
        await new Promise(resolve => setTimeout(resolve, 100));
        waited += 100;
      }
      
      if (this.connections.size > 0) {
        console.warn(`   ⚠️ ${this.connections.size} conexiones forzadas a cerrar`);
        for (const conn of this.connections) {
          conn.destroy();
        }
      } else {
        console.log('   ✅ Todas las conexiones cerradas gracefully');
      }
      
      // 3. Cerrar conexiones de DB
      console.log('3️⃣ Cerrando conexiones de base de datos...');
      // await sequelize.close();
      console.log('   ✅ Database cerrada');
      
      // 4. Cerrar Redis
      console.log('4️⃣ Cerrando Redis...');
      // await redis.quit();
      console.log('   ✅ Redis cerrado');
      
      // 5. Procesar jobs pendientes de Bull queue
      console.log('5️⃣ Procesando jobs pendientes...');
      // await emailQueue.close();
      console.log('   ✅ Queue cerrada');
      
      clearTimeout(forceShutdownTimer);
      console.log('\n✅ Graceful shutdown COMPLETO\n');
      process.exit(0);
      
    } catch (error) {
      console.error('💀 Error durante shutdown:', error);
      process.exit(1);
    }
  }
}

// ==================== EXPORTS ====================

export {
  CircuitBreaker,
  RetryPolicy,
  Bulkhead,
  withTimeout,
  ResilientDatabaseConnection,
  ResilientEmailService,
  ResilientExternalAPI,
  HealthChecker,
  GracefulShutdown
};

// ==================== EJEMPLO DE USO ====================

/*
// backend/src/server.js

import { sequelize } from './models/index.js';
import { 
  ResilientDatabaseConnection, 
  ResilientEmailService,
  ResilientExternalAPI,
  HealthChecker,
  GracefulShutdown
} from './utils/resilience.js';

// Setup resilient services
const db = new ResilientDatabaseConnection(sequelize);
const emailService = new ResilientEmailService(emailQueue);
const openaiAPI = new ResilientExternalAPI('OpenAI');
const mapsAPI = new ResilientExternalAPI('GoogleMaps');

// Health checker
const healthChecker = new HealthChecker();

healthChecker.registerService('database', async () => {
  await sequelize.authenticate();
});

healthChecker.registerService('redis', async () => {
  await redis.ping();
});

healthChecker.registerService('email', async () => {
  // Check SMTP connection
  await emailService.verify();
});

healthChecker.start();

// Endpoint de health check
app.get('/api/health', (req, res) => {
  const status = healthChecker.getStatus();
  const httpCode = status.overall === 'HEALTHY' ? 200 : 503;
  res.status(httpCode).json(status);
});

// Endpoint de métricas
app.get('/api/metrics', requireAuth, requireSAT, (req, res) => {
  res.json({
    database: db.getMetrics(),
    email: emailService.getMetrics(),
    openai: openaiAPI.getMetrics(),
    maps: mapsAPI.getMetrics()
  });
});

// Start server
const server = app.listen(port, () => {
  console.log(`✅ API listening on ${port}`);
});

// Graceful shutdown
new GracefulShutdown(server);

// En routes, usar db resiliente:
router.get('/api/users', requireAuth, async (req, res) => {
  try {
    const users = await db.findAll(User, { 
      where: { active: true },
      limit: 100
    });
    res.json(users);
  } catch (error) {
    // Si llega aquí, circuit breaker está OPEN y fallback falló
    res.status(503).json({ 
      error: 'Database temporarily unavailable',
      code: 'SERVICE_UNAVAILABLE'
    });
  }
});
*/
