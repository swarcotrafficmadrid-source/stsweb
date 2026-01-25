import { Router } from "express";
import { SpareRequest, SpareItem } from "../models/index.js";
import { requireAuth } from "../middleware/auth.js";
import { sendMail } from "../utils/mailer.js";
import { webhookTicketCreated } from "../utils/webhooks.js";
import * as models from "../models/index.js";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  const items = await SpareRequest.findAll({
    where: { userId: req.user.id },
    include: [{ model: SpareItem }]
  });
  return res.json(items);
});

router.post("/", requireAuth, async (req, res) => {
  const { titulo, descripcion, spares } = req.body;
  if (!titulo || !descripcion || !spares || !Array.isArray(spares) || spares.length === 0) {
    return res.status(400).json({ error: "Datos incompletos" });
  }

  const spareRequest = await SpareRequest.create({
    userId: req.user.id,
    titulo,
    descripcion
  });

  for (const spare of spares) {
    await SpareItem.create({
      spareRequestId: spareRequest.id,
      title: spare.title || "",
      description: spare.description || "",
      generalDescription: spare.generalDescription || "",
      company: spare.company || null,
      proyecto: spare.proyecto || "",
      pais: spare.pais || "",
      provincia: spare.provincia || "",
      refCode: spare.refCode || "",
      serial: spare.serial || "",
      cantidad: spare.cantidad || 1,
      photosCount: spare.photosCount || 0,
      photoUrls: spare.photoUrls || null
    });
  }

  const requestNumber = `REP-${String(spareRequest.id).padStart(6, "0")}`;
  
  // Email a soporte
  try {
    const sparesText = spares.map((s, idx) => `
Repuesto ${idx + 1}:
- Proyecto: ${s.proyecto || "-"}
- País: ${s.pais || "-"}
- Provincia: ${s.provincia || "-"}
- Compañía: ${s.company || "-"}
- Ref: ${s.refCode || "-"}
- Serial: ${s.serial || "-"}
- Cantidad: ${s.cantidad || 1}
- Descripción: ${s.description || "-"}
${s.photosCount > 0 ? `- Fotos adjuntas: ${s.photosCount}` : ""}
    `).join("\n");

    await sendMail({
      to: "sfr.support@swarco.com",
      subject: `Nueva solicitud de repuestos ${requestNumber}`,
      text: `Nueva solicitud de repuestos

Número: ${requestNumber}
Usuario: ${req.user.email}
Título: ${titulo}
Descripción general: ${descripcion}

${sparesText}`,
      html: `
        <h2 style="color: #006BAB;">Nueva solicitud de repuestos</h2>
        <p><strong>Número:</strong> ${requestNumber}</p>
        <p><strong>Usuario:</strong> ${req.user.email}</p>
        <p><strong>Título:</strong> ${titulo}</p>
        <p><strong>Descripción general:</strong> ${descripcion}</p>
        <h3>Repuestos:</h3>
        ${spares.map((s, idx) => `
          <div style="border: 1px solid #ddd; padding: 10px; margin: 10px 0;">
            <h4>Repuesto ${idx + 1}</h4>
            <p><strong>Proyecto:</strong> ${s.proyecto || "-"}</p>
            <p><strong>País:</strong> ${s.pais || "-"}</p>
            <p><strong>Provincia:</strong> ${s.provincia || "-"}</p>
            <p><strong>Compañía:</strong> ${s.company || "-"}</p>
            <p><strong>Ref:</strong> ${s.refCode || "-"}</p>
            <p><strong>Serial:</strong> ${s.serial || "-"}</p>
            <p><strong>Cantidad:</strong> ${s.cantidad || 1}</p>
            <p><strong>Descripción:</strong> ${s.description || "-"}</p>
            ${s.photosCount > 0 ? `<p><strong>Fotos adjuntas:</strong> ${s.photosCount}</p>` : ""}
          </div>
        `).join("")}
      `
    });
  } catch (err) {
    console.error("Error sending spare request email:", err);
  }

  // Email al usuario
  try {
    await sendMail({
      to: req.user.email,
      subject: `Solicitud de repuesto recibida ${requestNumber}`,
      text: `Hola,

Tu solicitud de repuesto ha sido recibida y está siendo procesada.

Número de solicitud: ${requestNumber}
Título: ${titulo}

Nuestro equipo se pondrá en contacto contigo pronto.

Saludos,
Equipo SWARCO Traffic Spain`,
      html: `
        <h2 style="color: #006BAB;">Solicitud recibida</h2>
        <p>Tu solicitud de repuesto ha sido recibida y está siendo procesada.</p>
        <p><strong>Número de solicitud:</strong> ${requestNumber}</p>
        <p><strong>Título:</strong> ${titulo}</p>
        <p>Nuestro equipo se pondrá en contacto contigo pronto.</p>
        <p>Saludos,<br>Equipo SWARCO Traffic Spain</p>
      `
    });
  } catch (err) {
    console.error("Error sending user confirmation email:", err);
  }

  // Disparar webhook
  webhookTicketCreated({ ...spareRequest.toJSON(), type: "spare", requestNumber }, models).catch(err => 
    console.error("Error webhook:", err)
  );

  return res.json({ id: spareRequest.id, requestNumber });
});

export default router;
