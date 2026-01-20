import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { sequelize } from "./models/index.js";
import authRoutes from "./routes/auth.js";
import failuresRoutes from "./routes/failures.js";
import sparesRoutes from "./routes/spares.js";
import purchasesRoutes from "./routes/purchases.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => res.json({ ok: true }));
app.use("/api/auth", authRoutes);
app.use("/api/failures", failuresRoutes);
app.use("/api/spares", sparesRoutes);
app.use("/api/purchases", purchasesRoutes);

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
