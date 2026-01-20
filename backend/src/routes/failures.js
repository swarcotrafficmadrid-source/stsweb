import { Router } from "express";
import { FailureReport } from "../models/index.js";
import { requireAuth } from "../middleware/auth.js";
import { sendMail } from "../utils/mailer.js";

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
  const notifyTo = process.env.SMTP_NOTIFY_TO || req.user.email;
  if (notifyTo) {
    try {
      await sendMail({
        to: notifyTo,
        subject: `Nueva incidencia #${item.id}`,
        text: `Usuario: ${req.user.email}\nTítulo: ${titulo}\nPrioridad: ${item.prioridad}\n\n${descripcion}`
      });
    } catch {
      // No bloquear si falla el correo.
    }
  }
  return res.json(item);
});

export default router;
