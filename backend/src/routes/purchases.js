import { Router } from "express";
import { PurchaseRequest } from "../models/index.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  const items = await PurchaseRequest.findAll({ where: { userId: req.user.id } });
  return res.json(items);
});

router.post("/", requireAuth, async (req, res) => {
  const { equipo, cantidad, descripcion } = req.body;
  if (!equipo) {
    return res.status(400).json({ error: "Datos incompletos" });
  }
  const item = await PurchaseRequest.create({
    userId: req.user.id,
    equipo,
    cantidad: cantidad || 1,
    descripcion: descripcion || ""
  });
  return res.json(item);
});

export default router;
