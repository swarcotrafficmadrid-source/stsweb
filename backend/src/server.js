import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { sequelize } from "./models/index.js";
import { runMigrations } from "./migrations/index.js";
import authRoutes from "./routes/auth.js";
import failuresRoutes from "./routes/failures.js";
import sparesRoutes from "./routes/spares.js";
import purchasesRoutes from "./routes/purchases.js";
import assistanceRoutes from "./routes/assistance.js";
import i18nRoutes from "./routes/i18n.js";
import errorReportRoutes from "./routes/errorReport.js";
import satRoutes from "./routes/sat.js";
import adminRoutes from "./routes/admin.js";
import clientRoutes from "./routes/client.js";
import uploadRoutes from "./routes/upload.js";
import webhookRoutes from "./routes/webhooks.js";
import analyticsRoutes from "./routes/analytics.js";
import publicApiRoutes from "./routes/publicApi.js";
import qrRoutes from "./routes/qr.js";
import chatbotRoutes from "./routes/chatbot.js";
import databaseRoutes from "./routes/database.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { apiLimiter } from "./middleware/rateLimiter.js";
import { sanitizeBody } from "./middleware/validator.js";

dotenv.config();

// Validar variables críticas al inicio
if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'undefined') {
  console.error('[CRITICAL] JWT_SECRET no esta configurado');
  process.exit(1);
}

// Validar variables de BD - aceptar DB_HOST o DB_SOCKET (para Cloud SQL)
const hasDBHost = !!process.env.DB_HOST;
const hasDBSocket = !!process.env.DB_SOCKET;
if ((!hasDBHost && !hasDBSocket) || !process.env.DB_NAME) {
  console.error('[CRITICAL] Variables de BD no configuradas');
  console.error('   Verifica: DB_HOST o DB_SOCKET (para Cloud SQL), DB_NAME, DB_USER, DB_PASSWORD');
  process.exit(1);
}

console.log('[OK] Variables de entorno validadas');

const app = express();

// Security headers
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  next();
});

// CORS más permisivo - permitir múltiples orígenes
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "https://staging.swarcotrafficspain.com",
  "https://stsweb-964379250608.europe-west1.run.app",
  "http://localhost:5173",
  "http://localhost:3000"
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Permitir requests sin origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Si el origin está en la lista, permitirlo
    if (allowedOrigins.some(allowed => origin.includes(allowed.replace(/https?:\/\//, '')))) {
      return callback(null, true);
    }
    
    // En desarrollo, permitir cualquier origin
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // En producción, solo permitir orígenes conocidos
    callback(null, true); // Temporalmente permitir todos para debugging
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-API-Key"]
}));
app.use(express.json({ limit: "10mb" })); // Límite de tamaño de request
app.use(sanitizeBody); // Sanitizar inputs

app.get("/api/health", async (req, res) => {
  try {
    const dbHealthy = await sequelize.authenticate().then(() => true).catch(() => false);
    return res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      database: dbHealthy ? "connected" : "disconnected",
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
      },
      nodeVersion: process.version
    });
  } catch (err) {
    return res.status(503).json({
      status: "degraded",
      timestamp: new Date().toISOString(),
      error: err.message
    });
  }
});
app.use("/api/auth", authRoutes); // Rate limiting aplicado por endpoint dentro de auth.js
app.use("/api/failures", apiLimiter, failuresRoutes);
app.use("/api/spares", apiLimiter, sparesRoutes);
app.use("/api/purchases", apiLimiter, purchasesRoutes);
app.use("/api/assistance", apiLimiter, assistanceRoutes);
app.use("/api/i18n", i18nRoutes); // Sin rate limiting - endpoint de traducción necesita muchas requests
app.use("/api/error-report", errorReportRoutes);
app.use("/api/sat", apiLimiter, satRoutes);
app.use("/api/client", apiLimiter, clientRoutes);
app.use("/api/admin", adminRoutes); // Sin rate limiting para admin ops
app.use("/api/upload", apiLimiter, uploadRoutes);
app.use("/api/webhooks", apiLimiter, webhookRoutes);
app.use("/api/analytics", apiLimiter, analyticsRoutes);
app.use("/api/public", publicApiRoutes); // API pública (autenticación por API Key)
app.use("/api/qr", apiLimiter, qrRoutes);
app.use("/api/chatbot", apiLimiter, chatbotRoutes);
app.use("/api/database", databaseRoutes); // Panel de admin de BD (sin rate limiting)

// Error handler global (debe ir al final)
app.use(errorHandler);

const port = process.env.PORT || 8080;

async function start() {
  const maxRetries = 5;
  let attempt = 0;
  
  while (attempt < maxRetries) {
    try {
      console.log('[DB] Intentando conectar a BD (intento ' + (attempt + 1) + '/' + maxRetries + ')...');
      await sequelize.authenticate();
      console.log('[DB] Conectado a la base de datos');
      
      // Ejecutar migraciones automáticas
      await runMigrations(sequelize);
      
      const alter = String(process.env.DB_SYNC_ALTER || "").toLowerCase() === "true";
      await sequelize.sync({ alter });
      
      app.listen(port, '0.0.0.0', () => {
        console.log('[OK] API listening on 0.0.0.0:' + port);
        console.log('[OK] Sistema v3.0 iniciado correctamente');
      });
      
      return; // Exito, salir del loop
      
    } catch (error) {
      attempt++;
      console.error('[ERROR] Error conectando a BD (intento ' + attempt + '/' + maxRetries + '): ' + error.message);
      
      if (attempt >= maxRetries) {
        console.error('[FATAL] No se pudo conectar a BD despues de ' + maxRetries + ' intentos');
        console.error('[WARN] Iniciando servidor sin BD - algunas funciones no estarán disponibles');
        // En lugar de salir, iniciar el servidor de todas formas
        app.listen(port, '0.0.0.0', () => {
          console.log('[OK] API listening on 0.0.0.0:' + port + ' (sin BD)');
          console.log('[WARN] Servidor iniciado pero BD no disponible');
        });
        return;
      }
      
      // Esperar antes de reintentar (exponential backoff)
      const waitTime = Math.min(1000 * Math.pow(2, attempt), 10000);
      console.log('[WAIT] Esperando ' + waitTime + 'ms antes de reintentar...');
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
}

start();
