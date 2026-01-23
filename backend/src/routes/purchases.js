import { Router } from "express";
import { PurchaseRequest, PurchaseEquipment } from "../models/index.js";
import { requireAuth } from "../middleware/auth.js";
import { sendMail } from "../utils/mailer.js";
import { webhookTicketCreated } from "../utils/webhooks.js";
import * as models from "../models/index.js";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  const items = await PurchaseRequest.findAll({ where: { userId: req.user.id } });
  return res.json(items);
});

router.post("/", requireAuth, async (req, res) => {
  const { titulo, proyecto, pais, equipments } = req.body;
  if (!titulo || !proyecto || !pais || !equipments || !Array.isArray(equipments) || equipments.length === 0) {
    return res.status(400).json({ error: "Datos incompletos" });
  }

  const equipmentsList = equipments.map(eq => `${eq.nombre} (x${eq.cantidad})${eq.descripcion ? `: ${eq.descripcion}` : ""}`).join(", ");
  
  const purchaseRequest = await PurchaseRequest.create({
    userId: req.user.id,
    equipo: equipmentsList,
    cantidad: equipments.reduce((sum, eq) => sum + (eq.cantidad || 0), 0),
    descripcion: `Proyecto: ${proyecto} | País: ${pais} | ${titulo}`
  });

  // Crear registros individuales de equipos
  for (const eq of equipments) {
    await PurchaseEquipment.create({
      purchaseRequestId: purchaseRequest.id,
      nombre: eq.nombre.trim(),
      cantidad: eq.cantidad || 1,
      descripcion: eq.descripcion?.trim() || null,
      photosCount: eq.photosCount || 0,
      photoUrls: eq.photoUrls || null
    });
  }

  const requestNumber = `COM-${String(purchaseRequest.id).padStart(6, "0")}`;
  
  // Email a soporte
  try {
    const equipmentsText = equipments.map((eq, idx) => `
Equipo ${idx + 1}:
- Nombre: ${eq.nombre}
- Cantidad: ${eq.cantidad}
${eq.descripcion ? `- Descripción: ${eq.descripcion}` : ""}
${eq.photosCount > 0 ? `- Fotos adjuntas: ${eq.photosCount}` : ""}
    `).join("\n");

    await sendMail({
      to: "sfr.support@swarco.com",
      subject: `Nueva solicitud de compra ${requestNumber}`,
      text: `Nueva solicitud de compra

Número: ${requestNumber}
Usuario: ${req.user.email}
Título: ${titulo}
Proyecto: ${proyecto}
País: ${pais}

Equipos solicitados:
${equipmentsText}`,
      html: `
        <h2 style="color: #006BAB;">Nueva solicitud de compra</h2>
        <p><strong>Número:</strong> ${requestNumber}</p>
        <p><strong>Usuario:</strong> ${req.user.email}</p>
        <p><strong>Título:</strong> ${titulo}</p>
        <p><strong>Proyecto:</strong> ${proyecto}</p>
        <p><strong>País:</strong> ${pais}</p>
        <h3>Equipos solicitados:</h3>
        ${equipments.map((eq, idx) => `
          <div style="border: 1px solid #ddd; padding: 10px; margin: 10px 0;">
            <h4>Equipo ${idx + 1}</h4>
            <p><strong>Nombre:</strong> ${eq.nombre}</p>
            <p><strong>Cantidad:</strong> ${eq.cantidad}</p>
            ${eq.descripcion ? `<p><strong>Descripción:</strong> ${eq.descripcion}</p>` : ""}
            ${eq.photosCount > 0 ? `<p><strong>Fotos adjuntas:</strong> ${eq.photosCount}</p>` : ""}
          </div>
        `).join("")}
      `
    });

    // Email al cliente
    await sendMail({
      to: req.user.email,
      subject: `Solicitud de compra recibida ${requestNumber}`,
      text: `Hola,

Tu solicitud de compra ha sido recibida y está siendo procesada.

Número de solicitud: ${requestNumber}
Proyecto: ${proyecto}
País: ${pais}

Nuestro equipo se pondrá en contacto contigo pronto.

Saludos,
Equipo SWARCO Traffic Spain`,
      html: `
        <h2 style="color: #006BAB;">Solicitud recibida</h2>
        <p>Tu solicitud de compra ha sido recibida y está siendo procesada.</p>
        <p><strong>Número de solicitud:</strong> ${requestNumber}</p>
        <p><strong>Proyecto:</strong> ${proyecto}</p>
        <p><strong>País:</strong> ${pais}</p>
        <p>Nuestro equipo se pondrá en contacto contigo pronto.</p>
        <p>Saludos,<br>Equipo SWARCO Traffic Spain</p>
      `
    });
  } catch (err) {
    console.error("Error sending purchase request email:", err);
  }

  // Disparar webhook
  webhookTicketCreated({ ...purchaseRequest.toJSON(), type: "purchase", requestNumber }, models).catch(err => 
    console.error("Error webhook:", err)
  );

  return res.json({ id: purchaseRequest.id, requestNumber });
});

export default router;
