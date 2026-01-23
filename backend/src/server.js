import express from "express";
import cors from "cors";
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
import { errorHandler } from "./middleware/errorHandler.js";
import { authLimiter, apiLimiter } from "./middleware/rateLimiter.js";
import { sanitizeBody } from "./middleware/validator.js";

dotenv.config();

const app = express();

// Security headers
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  next();
});

app.use(cors());
app.use(express.json({ limit: "10mb" })); // Límite de tamaño de request
app.use(sanitizeBody); // Sanitizar inputs

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
app.use("/api/admin", adminRoutes); // Sin rate limiting para admin ops

// Error handler global (debe ir al final)
app.use(errorHandler);

const port = process.env.PORT || 8080;

async function start() {
  await sequelize.authenticate();
  const alter = String(process.env.DB_SYNC_ALTER || "").toLowerCase() === "true";
  await sequelize.sync({ alter });
  app.listen(port, () => {
    console.log(`API listening on ${port}`);
  });
}

start();
