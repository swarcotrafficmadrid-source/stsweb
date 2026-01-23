import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireSAT } from "../middleware/requireSAT.js";
import { Webhook } from "../models/index.js";
import crypto from "crypto";

const router = Router();

// Listar todos los webhooks (solo SAT)
router.get("/", requireAuth, requireSAT, async (req, res) => {
  try {
    const webhooks = await Webhook.findAll({
      order: [["createdAt", "DESC"]]
    });
    res.json(webhooks);
  } catch (error) {
    console.error("Error al obtener webhooks:", error);
    res.status(500).json({ error: "Error al obtener webhooks" });
  }
});

// Crear nuevo webhook (solo SAT)
router.post("/", requireAuth, requireSAT, async (req, res) => {
  try {
    const { name, url, events, secret } = req.body;

    if (!name || !url || !events || events.length === 0) {
      return res.status(400).json({ 
        error: "Faltan campos requeridos: name, url, events" 
      });
    }

    // Validar URL
    try {
      new URL(url);
    } catch (err) {
      return res.status(400).json({ error: "URL inválida" });
    }

    // Generar secret automático si no se provee
    const webhookSecret = secret || crypto.randomBytes(32).toString("hex");

    const webhook = await Webhook.create({
      name,
      url,
      events,
      secret: webhookSecret,
      active: true
    });

    res.status(201).json(webhook);
  } catch (error) {
    console.error("Error al crear webhook:", error);
    res.status(500).json({ error: "Error al crear webhook" });
  }
});

// Actualizar webhook (solo SAT)
router.put("/:id", requireAuth, requireSAT, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, url, events, active, secret } = req.body;

    const webhook = await Webhook.findByPk(id);
    if (!webhook) {
      return res.status(404).json({ error: "Webhook no encontrado" });
    }

    const updates = {};
    if (name) updates.name = name;
    if (url) {
      try {
        new URL(url);
        updates.url = url;
      } catch (err) {
        return res.status(400).json({ error: "URL inválida" });
      }
    }
    if (events) updates.events = events;
    if (typeof active === "boolean") updates.active = active;
    if (secret !== undefined) updates.secret = secret;

    await webhook.update(updates);
    res.json(webhook);
  } catch (error) {
    console.error("Error al actualizar webhook:", error);
    res.status(500).json({ error: "Error al actualizar webhook" });
  }
});

// Eliminar webhook (solo SAT)
router.delete("/:id", requireAuth, requireSAT, async (req, res) => {
  try {
    const { id } = req.params;

    const webhook = await Webhook.findByPk(id);
    if (!webhook) {
      return res.status(404).json({ error: "Webhook no encontrado" });
    }

    await webhook.destroy();
    res.json({ message: "Webhook eliminado" });
  } catch (error) {
    console.error("Error al eliminar webhook:", error);
    res.status(500).json({ error: "Error al eliminar webhook" });
  }
});

// Probar webhook (solo SAT)
router.post("/:id/test", requireAuth, requireSAT, async (req, res) => {
  try {
    const { id } = req.params;

    const webhook = await Webhook.findByPk(id);
    if (!webhook) {
      return res.status(404).json({ error: "Webhook no encontrado" });
    }

    const testPayload = {
      event: "test.ping",
      timestamp: new Date().toISOString(),
      data: {
        message: "Test webhook from SWARCO SAT",
        webhookId: webhook.id,
        webhookName: webhook.name
      }
    };

    const headers = {
      "Content-Type": "application/json",
      "User-Agent": "SWARCO-SAT-Webhooks/1.0"
    };

    if (webhook.secret) {
      const signature = crypto
        .createHmac("sha256", webhook.secret)
        .update(JSON.stringify(testPayload))
        .digest("hex");
      headers["X-Webhook-Signature"] = signature;
    }

    const response = await fetch(webhook.url, {
      method: "POST",
      headers,
      body: JSON.stringify(testPayload),
      timeout: 10000
    });

    if (response.ok) {
      res.json({ 
        success: true, 
        message: "Webhook test exitoso",
        statusCode: response.status
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: `Error HTTP ${response.status}: ${response.statusText}`,
        statusCode: response.status
      });
    }

  } catch (error) {
    console.error("Error al probar webhook:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Obtener eventos disponibles
router.get("/events", requireAuth, requireSAT, (req, res) => {
  res.json({
    events: [
      { value: "ticket.created", label: "Ticket Creado" },
      { value: "ticket.updated", label: "Ticket Actualizado" },
      { value: "ticket.statusChanged", label: "Estado Cambiado" },
      { value: "comment.added", label: "Comentario Agregado" },
      { value: "file.uploaded", label: "Archivo Subido" },
      { value: "*", label: "Todos los Eventos" }
    ]
  });
});

export default router;
