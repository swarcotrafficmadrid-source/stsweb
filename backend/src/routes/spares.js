import { Router } from "express";
import { SpareRequest } from "../models/index.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  const items = await SpareRequest.findAll({ where: { userId: req.user.id } });
  return res.json(items);
});

router.post("/", requireAuth, async (req, res) => {
  const { repuesto, cantidad, descripcion } = req.body;
  if (!repuesto) {
    return res.status(400).json({ error: "Datos incompletos" });
  }
  const item = await SpareRequest.create({
    userId: req.user.id,
    repuesto,
    cantidad: cantidad || 1,
    descripcion: descripcion || ""
  });
  return res.json(item);
});

export default router;
