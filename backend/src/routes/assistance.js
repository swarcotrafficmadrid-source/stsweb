import { Router } from "express";
import { AssistanceRequest } from "../models/index.js";
import { requireAuth } from "../middleware/auth.js";
import { sendMail } from "../utils/mailer.js";
import { webhookTicketCreated } from "../utils/webhooks.js";
import * as models from "../models/index.js";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  const items = await AssistanceRequest.findAll({ where: { userId: req.user.id } });
  return res.json(items);
});

router.post("/", requireAuth, async (req, res) => {
  const { tipo, fecha, hora, lugar, descripcionFalla, photosCount, photoUrls } = req.body;
  if (!tipo || !descripcionFalla) {
    return res.status(400).json({ error: "Datos incompletos" });
  }

  const assistanceRequest = await AssistanceRequest.create({
    userId: req.user.id,
    tipo,
    fecha: fecha || null,
    hora: hora || null,
    lugar: lugar || null,
    descripcionFalla,
    photosCount: photosCount || 0,
    photoUrls: photoUrls || null
  });

  const requestNumber = `ASI-${String(assistanceRequest.id).padStart(6, "0")}`;
  
  const tipoTexto = {
    remota: "Remota",
    telefonica: "Telefónica",
    visita: "Visita"
  }[tipo] || tipo;

  // Email a soporte
  try {
    let detalles = `Tipo: ${tipoTexto}\n`;
    if (fecha) detalles += `Fecha: ${fecha}\n`;
    if (hora) detalles += `Hora: ${hora}\n`;
    if (lugar) detalles += `Lugar: ${lugar}\n`;
    detalles += `\nDescripción de la falla:\n${descripcionFalla}`;

    const photosInfo = photosCount > 0 ? `\nFotos adjuntas: ${photosCount}` : "";
    
    await sendMail({
      to: "sfr.support@swarco.com",
      subject: `Nueva solicitud de asistencia ${requestNumber}`,
      text: `Nueva solicitud de asistencia

Número: ${requestNumber}
Usuario: ${req.user.email}

${detalles}${photosInfo}`,
      html: `
        <h2 style="color: #006BAB;">Nueva solicitud de asistencia</h2>
        <p><strong>Número:</strong> ${requestNumber}</p>
        <p><strong>Usuario:</strong> ${req.user.email}</p>
        <p><strong>Tipo:</strong> ${tipoTexto}</p>
        ${fecha ? `<p><strong>Fecha:</strong> ${fecha}</p>` : ""}
        ${hora ? `<p><strong>Hora:</strong> ${hora}</p>` : ""}
        ${lugar ? `<p><strong>Lugar:</strong> ${lugar}</p>` : ""}
        ${photosCount > 0 ? `<p><strong>Fotos adjuntas:</strong> ${photosCount}</p>` : ""}
        <h3>Descripción de la falla:</h3>
        <p style="white-space: pre-wrap;">${descripcionFalla}</p>
      `
    });

    // Email al cliente
    await sendMail({
      to: req.user.email,
      subject: `Solicitud de asistencia recibida ${requestNumber}`,
      text: `Hola,

Tu solicitud de asistencia ha sido recibida y está siendo procesada.

Número de solicitud: ${requestNumber}
Tipo: ${tipoTexto}
${fecha ? `Fecha: ${fecha}` : ""}
${hora ? `Hora: ${hora}` : ""}

Nuestro equipo se pondrá en contacto contigo pronto.

Saludos,
Equipo SWARCO Traffic Spain`,
      html: `
        <h2 style="color: #006BAB;">Solicitud recibida</h2>
        <p>Tu solicitud de asistencia ha sido recibida y está siendo procesada.</p>
        <p><strong>Número de solicitud:</strong> ${requestNumber}</p>
        <p><strong>Tipo:</strong> ${tipoTexto}</p>
        ${fecha ? `<p><strong>Fecha:</strong> ${fecha}</p>` : ""}
        ${hora ? `<p><strong>Hora:</strong> ${hora}</p>` : ""}
        <p>Nuestro equipo se pondrá en contacto contigo pronto.</p>
        <p>Saludos,<br>Equipo SWARCO Traffic Spain</p>
      `
    });
  } catch (err) {
    console.error("Error sending assistance request email:", err);
  }

  // Disparar webhook
  webhookTicketCreated({ ...assistanceRequest.toJSON(), type: "assistance", requestNumber }, models).catch(err => 
    console.error("Error webhook:", err)
  );

  return res.json({ id: assistanceRequest.id, requestNumber });
});

export default router;
