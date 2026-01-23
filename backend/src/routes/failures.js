import { Router } from "express";
import { FailureReport, FailureEquipment } from "../models/index.js";
import { requireAuth } from "../middleware/auth.js";
import { rateLimit } from "../middleware/rateLimit.js";
import { sendMail } from "../utils/mailer.js";
import { webhookTicketCreated } from "../utils/webhooks.js";
import * as models from "../models/index.js";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  const items = await FailureReport.findAll({ where: { userId: req.user.id } });
  return res.json(items);
});

router.post("/", requireAuth, rateLimit({ windowMs: 86_400_000, max: 10 }), async (req, res) => {
  const {
    titulo,
    descripcion,
    prioridad,
    company,
    refCode,
    serial,
    locationType,
    locationVia,
    locationSentido,
    locationPk,
    locationProvince,
    locationStation,
    photosCount,
    videoName,
    equipments
  } = req.body;
  const clean = (value, max) => {
    const text = (value || "").toString().trim();
    return text ? text.slice(0, max) : "";
  };
  const safeTitulo = clean(titulo, 120);
  const safeDescripcion = clean(descripcion, 4000);
  const safeVideoName = clean(videoName, 120);
  const safePhotosCount = Number.isFinite(photosCount) ? photosCount : null;

  if (!safeTitulo || !safeDescripcion) {
    return res.status(400).json({ error: "Datos incompletos" });
  }
  if (safePhotosCount !== null && (safePhotosCount < 0 || safePhotosCount > 4)) {
    return res.status(400).json({ error: "Número de fotos inválido" });
  }

  const list = Array.isArray(equipments) && equipments.length
    ? equipments
    : [
        {
          company,
          refCode,
          serial,
          locationType,
          locationVia,
          locationSentido,
          locationPk,
          locationProvince,
          locationStation
        }
      ];

  const equipmentRows = [];
  for (const raw of list) {
    const safeTitle = clean(raw.title, 120);
    const safeDesc = clean(raw.description, 4000);
    const safeCompany = clean(raw.company, 80);
    const safeRef = clean(raw.refCode, 20).toUpperCase();
    const safeSerial = clean(raw.serial, 20);
    const safeLocationType = clean(raw.locationType, 20);
    const safeVia = clean(raw.locationVia, 80);
    const safeSentido = clean(raw.locationSentido, 80);
    const safePk = clean(raw.locationPk, 40);
    const safeProvince = clean(raw.locationProvince, 80);
    const safeStation = clean(raw.locationStation, 120);

    if (safeRef && !/^(PN|MM|REF)\d{3}[A-Z]$/i.test(safeRef)) {
      return res.status(400).json({ error: "Referencia inválida" });
    }
    if (safeSerial && !/^\d{6}$/.test(safeSerial)) {
      return res.status(400).json({ error: "Serial inválido" });
    }
    if (safeLocationType && !["trafico", "transporte"].includes(safeLocationType)) {
      return res.status(400).json({ error: "Tipo de ubicación inválido" });
    }
    if (!safeTitle || !safeDesc || !safeRef || !safeSerial) {
      return res.status(400).json({ error: "Datos incompletos" });
    }

    equipmentRows.push({
      title: safeTitle,
      description: safeDesc,
      company: safeCompany || null,
      refCode: safeRef || null,
      serial: safeSerial || null,
      locationType: safeLocationType || null,
      locationVia: safeLocationType === "trafico" ? safeVia || null : null,
      locationSentido: safeLocationType === "trafico" ? safeSentido || null : null,
      locationPk: safeLocationType === "trafico" ? safePk || null : null,
      locationProvince: safeLocationType === "transporte" ? safeProvince || null : null,
      locationStation: safeLocationType === "transporte" ? safeStation || null : null,
      photosCount: safePhotosCount,
      videoName: safeVideoName || null,
      photoUrls: raw.photoUrls || null,
      videoUrl: raw.videoUrl || null
    });
  }

  const item = await FailureReport.create({
    userId: req.user.id,
    titulo: safeTitulo,
    descripcion: safeDescripcion,
    prioridad: prioridad || "Media"
  });
  if (equipmentRows.length) {
    await FailureEquipment.bulkCreate(
      equipmentRows.map((row) => ({ ...row, failureId: item.id }))
    );
  }
  const ticketNumber = `INC-${String(item.id).padStart(6, "0")}`;
  const supportTo = "sfr.support@swarco.com";
  try {
    await sendMail({
      to: req.user.email,
      subject: `Ticket ${ticketNumber} creado`,
      text: `Tu ticket ha sido creado.\n\nNúmero: ${ticketNumber}\nTítulo: ${titulo}\nPrioridad: ${item.prioridad}\n\n${descripcion}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #485258;">
          <h2 style="color: #006BAB; margin-bottom: 6px;">Ticket creado</h2>
          <p>Tu ticket ha sido creado correctamente.</p>
          <p><strong>Número:</strong> ${ticketNumber}</p>
          <p><strong>Título:</strong> ${titulo}</p>
          <p><strong>Prioridad:</strong> ${item.prioridad}</p>
          <pre style="background: #F5F7F8; padding: 12px; border-radius: 8px; white-space: pre-wrap;">${descripcion}</pre>
        </div>
      `
    });
  } catch {
    // No bloquear si falla el correo al cliente.
  }
  try {
    await sendMail({
      to: supportTo,
      subject: `Ticket ${ticketNumber} creado`,
      text: `Se creó un ticket.\nNúmero: ${ticketNumber}\n\n${safeDescripcion}`
    });
  } catch {
    // No bloquear si falla el correo a soporte.
  }

  // Disparar webhook
  webhookTicketCreated({ ...item.toJSON(), type: "failure", requestNumber: ticketNumber }, models).catch(err => 
    console.error("Error webhook:", err)
  );

  return res.json({ ...item.toJSON(), ticketNumber });
});

export default router;
