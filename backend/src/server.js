import express from "express";
import cors from "cors";
import compression from "compression";
import dotenv from "dotenv";

import { sequelize } from "./models/index.js";
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
import { errorHandler } from "./middleware/errorHandler.js";
import { authLimiter, apiLimiter, adminLimiter } from "./middleware/rateLimiter.js";
import { sanitizeBody } from "./middleware/validator.js";

dotenv.config();

if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'undefined') {
  console.error('CRITICAL: JWT_SECRET not configured');
  process.exit(1);
}

if (process.env.JWT_SECRET.length < 32) {
  console.error('WARNING: JWT_SECRET should be at least 32 characters');
}

if (!process.env.DB_HOST || !process.env.DB_NAME) {
  console.error('CRITICAL: Database variables not configured');
  process.exit(1);
}

console.log('Environment variables validated');

const app = express();

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  next();
});

const allowedOrigins = [
  'https://staging.swarcotrafficspain.com',
  'https://swarcotrafficspain.com',
  'https://stsweb-wjcs5aw2ka-ew.a.run.app',
  'http://localhost:3000',
  'http://localhost:5173'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn('CORS rejected: ' + origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(compression({
  level: 6,
  threshold: 1024
}));

app.use(express.json({ limit: "10mb" }));
app.use(sanitizeBody);

app.get("/api/health", (req, res) => res.json({ ok: true }));
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/failures", apiLimiter, failuresRoutes);
app.use("/api/spares", apiLimiter, sparesRoutes);
app.use("/api/purchases", apiLimiter, purchasesRoutes);
app.use("/api/assistance", apiLimiter, assistanceRoutes);
app.use("/api/i18n", apiLimiter, i18nRoutes);
app.use("/api/error-report", errorReportRoutes);
app.use("/api/sat", apiLimiter, satRoutes);
app.use("/api/client", apiLimiter, clientRoutes);
app.use("/api/admin", adminLimiter, adminRoutes);
app.use("/api/upload", apiLimiter, uploadRoutes);
app.use("/api/webhooks", apiLimiter, webhookRoutes);
app.use("/api/analytics", apiLimiter, analyticsRoutes);
app.use("/api/public", publicApiRoutes);
app.use("/api/qr", apiLimiter, qrRoutes);
app.use("/api/chatbot", apiLimiter, chatbotRoutes);

app.use(errorHandler);

const port = process.env.PORT || 8080;

async function start() {
  const maxRetries = 5;
  let attempt = 0;
  
  while (attempt < maxRetries) {
    try {
      console.log('Connecting to database (attempt ' + (attempt + 1) + '/' + maxRetries + ')...');
      await sequelize.authenticate();
      console.log('Database connected');
      
      const alter = String(process.env.DB_SYNC_ALTER || "").toLowerCase() === "true";
      await sequelize.sync({ alter });
      
      app.listen(port, () => {
        console.log('API listening on port ' + port);
        console.log('System v3.0 started successfully');
      });
      
      return;
      
    } catch (error) {
      attempt++;
      console.error('Database connection error (attempt ' + attempt + '/' + maxRetries + '): ' + error.message);
      
      if (attempt >= maxRetries) {
        console.error('Could not connect to database after ' + maxRetries + ' attempts');
        process.exit(1);
      }
      
      const waitTime = Math.min(1000 * Math.pow(2, attempt), 10000);
      console.log('Waiting ' + waitTime + 'ms before retry...');
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
}

start();
