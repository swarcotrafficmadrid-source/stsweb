import { Router } from "express";
import { FailureReport } from "../models/index.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  const items = await FailureReport.findAll({ where: { userId: req.user.id } });
  return res.json(items);
});

router.post("/", requireAuth, async (req, res) => {
  const { titulo, descripcion, prioridad } = req.body;
  if (!titulo || !descripcion) {
    return res.status(400).json({ error: "Datos incompletos" });
  }
  const item = await FailureReport.create({
    userId: req.user.id,
    titulo,
    descripcion,
    prioridad: prioridad || "Media"
  });
  return res.json(item);
});

export default router;
