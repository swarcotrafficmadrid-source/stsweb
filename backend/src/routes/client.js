import { Router } from "express";
import { 
  FailureReport,
  FailureEquipment,
  SpareRequest,
  SpareItem,
  PurchaseRequest,
  PurchaseEquipment,
  AssistanceRequest,
  TicketStatus,
  TicketComment,
  User 
} from "../models/index.js";
import { requireAuth } from "../middleware/auth.js";
import { sendMail } from "../utils/mailer.js";

const router = Router();

// Obtener timeline de un ticket (solo del usuario)
router.get("/ticket/:type/:id/timeline", requireAuth, async (req, res) => {
  try {
    const { type, id } = req.params;
    let ticket;

    // Verificar que el ticket pertenezca al usuario
    switch (type) {
      case "failure":
        ticket = await FailureReport.findOne({ 
          where: { id, userId: req.user.id },
          include: [{ model: FailureEquipment }]
        });
        break;
      case "spare":
        ticket = await SpareRequest.findOne({ 
          where: { id, userId: req.user.id },
          include: [{ model: SpareItem }]
        });
        break;
      case "purchase":
        ticket = await PurchaseRequest.findOne({ 
          where: { id, userId: req.user.id },
          include: [{ model: PurchaseEquipment }]
        });
        break;
      case "assistance":
        ticket = await AssistanceRequest.findOne({ where: { id, userId: req.user.id } });
        break;
      default:
        return res.status(400).json({ error: "Tipo de ticket inválido" });
    }

    if (!ticket) {
      return res.status(404).json({ error: "Ticket no encontrado o no tienes acceso" });
    }

    // Obtener historial de estados
    const statusHistory = await TicketStatus.findAll({
      where: { ticketId: id, ticketType: type },
      order: [["createdAt", "ASC"]]
    });

    // Obtener comentarios (solo los no internos)
    const comments = await TicketComment.findAll({
      where: { ticketId: id, ticketType: type, isInternal: false },
      order: [["createdAt", "ASC"]],
      include: [
        { model: User, attributes: ["id", "nombre", "apellidos", "userRole"] }
      ]
    });

    // Preparar URLs de fotos según el tipo
    let photoUrls = [];
    let videoUrl = null;

    if (type === "failure" && ticket.failure_equipments) {
      photoUrls = ticket.failure_equipments.flatMap(eq => eq.photoUrls || []);
      const videos = ticket.failure_equipments.map(eq => eq.videoUrl).filter(Boolean);
      videoUrl = videos.length > 0 ? videos[0] : null;
    } else if (type === "spare" && ticket.spare_items) {
      photoUrls = ticket.spare_items.flatMap(item => item.photoUrls || []);
    } else if (type === "purchase" && ticket.PurchaseEquipments) {
      photoUrls = ticket.PurchaseEquipments.flatMap(eq => eq.photoUrls || []);
    } else if (type === "assistance" && ticket.photoUrls) {
      photoUrls = ticket.photoUrls;
    }

    res.json({
      statusHistory,
      comments,
      ticket: {
        ...ticket.toJSON(),
        photoUrls,
        videoUrl
      }
    });
  } catch (err) {
    console.error("Error fetching timeline:", err);
    res.status(500).json({ error: "Error al obtener timeline" });
  }
});

// Agregar comentario a un ticket (solo del usuario)
router.post("/ticket/:type/:id/comment", requireAuth, async (req, res) => {
  try {
    const { type, id } = req.params;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Mensaje requerido" });
    }

    // Verificar que el ticket pertenezca al usuario
    let ticket;
    switch (type) {
      case "failure":
        ticket = await FailureReport.findOne({ where: { id, userId: req.user.id } });
        break;
      case "spare":
        ticket = await SpareRequest.findOne({ where: { id, userId: req.user.id } });
        break;
      case "purchase":
        ticket = await PurchaseRequest.findOne({ where: { id, userId: req.user.id } });
        break;
      case "assistance":
        ticket = await AssistanceRequest.findOne({ where: { id, userId: req.user.id } });
        break;
      default:
        return res.status(400).json({ error: "Tipo de ticket inválido" });
    }

    if (!ticket) {
      return res.status(404).json({ error: "Ticket no encontrado o no tienes acceso" });
    }

    // Crear comentario
    const comment = await TicketComment.create({
      ticketId: parseInt(id),
      ticketType: type,
      userId: req.user.id,
      message: message.trim(),
      isInternal: false
    });

    // Notificar al equipo SAT
    const prefixes = { failure: "INC", spare: "REP", purchase: "COM", assistance: "ASI" };
    const ticketNumber = `${prefixes[type]}-${String(id).padStart(6, "0")}`;

    await sendMail({
      to: "sfr.support@swarco.com",
      subject: `Nuevo mensaje del cliente en ${ticketNumber}`,
      text: `El cliente ha dejado un nuevo mensaje en el ticket ${ticketNumber}:

Usuario: ${req.user.nombre} ${req.user.apellidos} (${req.user.email})

Mensaje:
${message}

Accede al Panel SAT para responder:
https://staging.swarcotrafficspain.com/#sat`,
      html: `
        <h2 style="color: #006BAB;">Nuevo mensaje del cliente</h2>
        <p>El cliente ha dejado un nuevo mensaje en el ticket <strong>${ticketNumber}</strong>:</p>
        <p><strong>Usuario:</strong> ${req.user.nombre} ${req.user.apellidos} (${req.user.email})</p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
          ${message}
        </div>
        <p>
          <a href="https://staging.swarcotrafficspain.com/#sat" 
             style="background: #006BAB; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Acceder al Panel SAT
          </a>
        </p>
      `
    }).catch(err => console.error("Error sending notification:", err));

    const commentWithUser = await TicketComment.findByPk(comment.id, {
      include: [{ model: User, attributes: ["id", "nombre", "apellidos", "userRole"] }]
    });

    res.json({ success: true, comment: commentWithUser });
  } catch (err) {
    console.error("Error adding comment:", err);
    res.status(500).json({ error: "Error al agregar comentario" });
  }
});

export default router;
