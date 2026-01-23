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
import { requireSAT, requireSATAdmin } from "../middleware/requireSAT.js";
import { sendMail } from "../utils/mailer.js";
import { generateTicketPDF } from "../utils/pdfGenerator.js";
import { webhookStatusChanged } from "../utils/webhooks.js";
import * as models from "../models/index.js";

const router = Router();

// Obtener todos los tickets (dashboard SAT)
router.get("/tickets/all", requireAuth, requireSAT, async (req, res) => {
  try {
    const { type, status, limit = 50, offset = 0 } = req.query;

    const queries = [];

    // Incidencias
    if (!type || type === "failure") {
      queries.push(
        FailureReport.findAll({
          include: [
            { model: User, attributes: ["id", "nombre", "apellidos", "email", "empresa"] },
            { model: FailureEquipment }
          ],
          limit: parseInt(limit),
          offset: parseInt(offset),
          order: [["createdAt", "DESC"]]
        }).then(items => items.map(item => ({ ...item.toJSON(), type: "failure" })))
      );
    }

    // Repuestos
    if (!type || type === "spare") {
      queries.push(
        SpareRequest.findAll({
          include: [
            { model: User, attributes: ["id", "nombre", "apellidos", "email", "empresa"] },
            { model: SpareItem }
          ],
          limit: parseInt(limit),
          offset: parseInt(offset),
          order: [["createdAt", "DESC"]]
        }).then(items => items.map(item => ({ ...item.toJSON(), type: "spare" })))
      );
    }

    // Compras
    if (!type || type === "purchase") {
      queries.push(
        PurchaseRequest.findAll({
          include: [
            { model: User, attributes: ["id", "nombre", "apellidos", "email", "empresa"] }
          ],
          limit: parseInt(limit),
          offset: parseInt(offset),
          order: [["createdAt", "DESC"]]
        }).then(items => items.map(item => ({ ...item.toJSON(), type: "purchase" })))
      );
    }

    // Asistencias
    if (!type || type === "assistance") {
      queries.push(
        AssistanceRequest.findAll({
          include: [
            { model: User, attributes: ["id", "nombre", "apellidos", "email", "empresa"] }
          ],
          limit: parseInt(limit),
          offset: parseInt(offset),
          order: [["createdAt", "DESC"]]
        }).then(items => items.map(item => ({ ...item.toJSON(), type: "assistance" })))
      );
    }

    const results = await Promise.all(queries);
    const allTickets = results.flat();

    // Obtener estados actuales de todos los tickets
    const ticketStatusMap = {};
    for (const ticket of allTickets) {
      const latestStatus = await TicketStatus.findOne({
        where: { ticketId: ticket.id, ticketType: ticket.type },
        order: [["createdAt", "DESC"]],
        include: [
          { model: User, as: "ChangedByUser", attributes: ["nombre", "apellidos"] },
          { model: User, as: "AssignedToUser", attributes: ["nombre", "apellidos"] }
        ]
      });
      ticketStatusMap[`${ticket.type}-${ticket.id}`] = latestStatus;
    }

    // Agregar estado a cada ticket
    const ticketsWithStatus = allTickets.map(ticket => ({
      ...ticket,
      currentStatus: ticketStatusMap[`${ticket.type}-${ticket.id}`]
    }));

    // Filtrar por estado si se especificó
    const filteredTickets = status
      ? ticketsWithStatus.filter(t => t.currentStatus?.status === status)
      : ticketsWithStatus;

    // Ordenar por fecha de creación (más reciente primero)
    filteredTickets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      tickets: filteredTickets,
      total: filteredTickets.length
    });
  } catch (err) {
    console.error("Error fetching SAT tickets:", err);
    res.status(500).json({ error: "Error al obtener tickets" });
  }
});

// Obtener detalles de un ticket específico
router.get("/ticket/:type/:id", requireAuth, requireSAT, async (req, res) => {
  try {
    const { type, id } = req.params;
    let ticket;

    switch (type) {
      case "failure":
        ticket = await FailureReport.findByPk(id, {
          include: [
            { model: User, attributes: ["id", "nombre", "apellidos", "email", "empresa", "telefono"] },
            { model: FailureEquipment }
          ]
        });
        break;
      case "spare":
        ticket = await SpareRequest.findByPk(id, {
          include: [
            { model: User, attributes: ["id", "nombre", "apellidos", "email", "empresa", "telefono"] },
            { model: SpareItem }
          ]
        });
        break;
      case "purchase":
        ticket = await PurchaseRequest.findByPk(id, {
          include: [
            { model: User, attributes: ["id", "nombre", "apellidos", "email", "empresa", "telefono"] },
            { model: PurchaseEquipment }
          ]
        });
        break;
      case "assistance":
        ticket = await AssistanceRequest.findByPk(id, {
          include: [
            { model: User, attributes: ["id", "nombre", "apellidos", "email", "empresa", "telefono"] }
          ]
        });
        break;
      default:
        return res.status(400).json({ error: "Tipo de ticket inválido" });
    }

    if (!ticket) {
      return res.status(404).json({ error: "Ticket no encontrado" });
    }

    // Obtener historial de estados
    const statusHistory = await TicketStatus.findAll({
      where: { ticketId: id, ticketType: type },
      order: [["createdAt", "ASC"]],
      include: [
        { model: User, as: "ChangedByUser", attributes: ["nombre", "apellidos"] },
        { model: User, as: "AssignedToUser", attributes: ["nombre", "apellidos"] }
      ]
    });

    // Obtener comentarios
    const comments = await TicketComment.findAll({
      where: { ticketId: id, ticketType: type },
      order: [["createdAt", "ASC"]],
      include: [
        { model: User, attributes: ["id", "nombre", "apellidos", "userRole"] }
      ]
    });

    res.json({
      ticket: { ...ticket.toJSON(), type },
      statusHistory,
      comments
    });
  } catch (err) {
    console.error("Error fetching ticket details:", err);
    res.status(500).json({ error: "Error al obtener detalles del ticket" });
  }
});

// Cambiar estado de un ticket
router.post("/ticket/:type/:id/status", requireAuth, requireSAT, async (req, res) => {
  try {
    const { type, id } = req.params;
    const { status, assignedTo, comment } = req.body;

    if (!status) {
      return res.status(400).json({ error: "Estado requerido" });
    }

    // Crear nuevo registro de estado
    const newStatus = await TicketStatus.create({
      ticketId: parseInt(id),
      ticketType: type,
      status,
      assignedTo: assignedTo || null,
      changedBy: req.user.id,
      comment: comment || null
    });

    // Obtener el ticket para notificar al cliente
    let ticket, ticketNumber;
    switch (type) {
      case "failure":
        ticket = await FailureReport.findByPk(id, { include: [User] });
        ticketNumber = `INC-${String(id).padStart(6, "0")}`;
        break;
      case "spare":
        ticket = await SpareRequest.findByPk(id, { include: [User] });
        ticketNumber = `REP-${String(id).padStart(6, "0")}`;
        break;
      case "purchase":
        ticket = await PurchaseRequest.findByPk(id, { include: [User] });
        ticketNumber = `COM-${String(id).padStart(6, "0")}`;
        break;
      case "assistance":
        ticket = await AssistanceRequest.findByPk(id, { include: [User] });
        ticketNumber = `ASI-${String(id).padStart(6, "0")}`;
        break;
    }

    // Enviar email al cliente notificando el cambio
    if (ticket && ticket.User) {
      const statusNames = {
        pending: "Pendiente",
        assigned: "Asignado",
        in_progress: "En progreso",
        waiting: "Esperando",
        resolved: "Resuelto",
        closed: "Cerrado"
      };

      await sendMail({
        to: ticket.User.email,
        subject: `Actualización de tu solicitud ${ticketNumber}`,
        text: `Hola ${ticket.User.nombre},

Tu solicitud ${ticketNumber} ha sido actualizada.

Nuevo estado: ${statusNames[status]}
${comment ? `\nComentario: ${comment}` : ""}

Puedes ver el estado completo en tu panel de cliente.

Saludos,
Equipo SWARCO Traffic Spain`,
        html: `
          <h2 style="color: #006BAB;">Actualización de solicitud</h2>
          <p>Hola ${ticket.User.nombre},</p>
          <p>Tu solicitud <strong>${ticketNumber}</strong> ha sido actualizada.</p>
          <p><strong>Nuevo estado:</strong> <span style="color: #F29200;">${statusNames[status]}</span></p>
          ${comment ? `<p><strong>Comentario:</strong> ${comment}</p>` : ""}
          <p>Puedes ver el estado completo en tu panel de cliente.</p>
          <p>Saludos,<br>Equipo SWARCO Traffic Spain</p>
        `
      }).catch(err => console.error("Error sending status update email:", err));
    }

    // Disparar webhook de cambio de estado
    webhookStatusChanged(parseInt(id), type, null, status, models).catch(err => 
      console.error("Error webhook:", err)
    );

    res.json({ success: true, status: newStatus });
  } catch (err) {
    console.error("Error updating ticket status:", err);
    res.status(500).json({ error: "Error al actualizar estado" });
  }
});

// Agregar comentario a un ticket
router.post("/ticket/:type/:id/comment", requireAuth, requireSAT, async (req, res) => {
  try {
    const { type, id } = req.params;
    const { message, isInternal } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Mensaje requerido" });
    }

    const comment = await TicketComment.create({
      ticketId: parseInt(id),
      ticketType: type,
      userId: req.user.id,
      message: message.trim(),
      isInternal: isInternal === true
    });

    // Si no es interno, notificar al cliente
    if (!isInternal) {
      let ticket, ticketNumber;
      switch (type) {
        case "failure":
          ticket = await FailureReport.findByPk(id, { include: [User] });
          ticketNumber = `INC-${String(id).padStart(6, "0")}`;
          break;
        case "spare":
          ticket = await SpareRequest.findByPk(id, { include: [User] });
          ticketNumber = `REP-${String(id).padStart(6, "0")}`;
          break;
        case "purchase":
          ticket = await PurchaseRequest.findByPk(id, { include: [User] });
          ticketNumber = `COM-${String(id).padStart(6, "0")}`;
          break;
        case "assistance":
          ticket = await AssistanceRequest.findByPk(id, { include: [User] });
          ticketNumber = `ASI-${String(id).padStart(6, "0")}`;
          break;
      }

      if (ticket && ticket.User) {
        await sendMail({
          to: ticket.User.email,
          subject: `Nuevo mensaje en tu solicitud ${ticketNumber}`,
          text: `Hola ${ticket.User.nombre},

Has recibido un nuevo mensaje en tu solicitud ${ticketNumber}:

${message}

Puedes responder desde tu panel de cliente.

Saludos,
Equipo SWARCO Traffic Spain`,
          html: `
            <h2 style="color: #006BAB;">Nuevo mensaje en tu solicitud</h2>
            <p>Hola ${ticket.User.nombre},</p>
            <p>Has recibido un nuevo mensaje en tu solicitud <strong>${ticketNumber}</strong>:</p>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
              ${message}
            </div>
            <p>Puedes responder desde tu panel de cliente.</p>
            <p>Saludos,<br>Equipo SWARCO Traffic Spain</p>
          `
        }).catch(err => console.error("Error sending comment notification:", err));
      }
    }

    const commentWithUser = await TicketComment.findByPk(comment.id, {
      include: [{ model: User, attributes: ["id", "nombre", "apellidos", "userRole"] }]
    });

    res.json({ success: true, comment: commentWithUser });
  } catch (err) {
    console.error("Error adding comment:", err);
    res.status(500).json({ error: "Error al agregar comentario" });
  }
});

// Obtener lista de técnicos para asignación
router.get("/technicians", requireAuth, requireSATAdmin, async (req, res) => {
  try {
    const technicians = await User.findAll({
      where: { userRole: "sat_technician", activo: true },
      attributes: ["id", "nombre", "apellidos", "email"]
    });

    res.json(technicians);
  } catch (err) {
    console.error("Error fetching technicians:", err);
    res.status(500).json({ error: "Error al obtener técnicos" });
  }
});

// Generar PDF de un ticket
router.get("/ticket/:type/:id/pdf", requireAuth, requireSAT, async (req, res) => {
  try {
    const { type, id } = req.params;
    let ticket;

    switch (type) {
      case "failure":
        ticket = await FailureReport.findByPk(id, {
          include: [
            { model: User, attributes: ["id", "nombre", "apellidos", "email", "empresa", "telefono"] },
            { model: FailureEquipment }
          ]
        });
        break;
      case "spare":
        ticket = await SpareRequest.findByPk(id, {
          include: [
            { model: User, attributes: ["id", "nombre", "apellidos", "email", "empresa", "telefono"] },
            { model: SpareItem }
          ]
        });
        break;
      case "purchase":
        ticket = await PurchaseRequest.findByPk(id, {
          include: [
            { model: User, attributes: ["id", "nombre", "apellidos", "email", "empresa", "telefono"] },
            { model: PurchaseEquipment }
          ]
        });
        break;
      case "assistance":
        ticket = await AssistanceRequest.findByPk(id, {
          include: [
            { model: User, attributes: ["id", "nombre", "apellidos", "email", "empresa", "telefono"] }
          ]
        });
        break;
      default:
        return res.status(400).json({ error: "Tipo de ticket inválido" });
    }

    if (!ticket) {
      return res.status(404).json({ error: "Ticket no encontrado" });
    }

    // Obtener historial de estados
    const statusHistory = await TicketStatus.findAll({
      where: { ticketId: id, ticketType: type },
      order: [["createdAt", "ASC"]],
      include: [
        { model: User, as: "ChangedByUser", attributes: ["nombre", "apellidos"] }
      ]
    });

    // Obtener comentarios (solo los no internos para el PDF)
    const comments = await TicketComment.findAll({
      where: { ticketId: id, ticketType: type, isInternal: false },
      order: [["createdAt", "ASC"]],
      include: [
        { model: User, attributes: ["nombre", "apellidos"] }
      ]
    });

    // Generar PDF
    const pdfBuffer = await generateTicketPDF(
      { ...ticket.toJSON(), type },
      statusHistory.map(s => s.toJSON()),
      comments.map(c => c.toJSON()),
      type
    );

    // Enviar PDF
    const prefixes = { failure: "INC", spare: "REP", purchase: "COM", assistance: "ASI" };
    const ticketNumber = `${prefixes[type]}-${String(id).padStart(6, "0")}`;
    
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="Informe_${ticketNumber}.pdf"`);
    res.send(pdfBuffer);
  } catch (err) {
    console.error("Error generating PDF:", err);
    res.status(500).json({ error: "Error al generar PDF" });
  }
});

// Estadísticas del dashboard SAT
router.get("/stats", requireAuth, requireSAT, async (req, res) => {
  try {
    const failures = await FailureReport.count();
    const spares = await SpareRequest.count();
    const purchases = await PurchaseRequest.count();
    const assistance = await AssistanceRequest.count();

    // Contar por estado (usando el último estado de cada ticket)
    const allTicketIds = [
      ...(await FailureReport.findAll({ attributes: ["id"] })).map(t => ({ id: t.id, type: "failure" })),
      ...(await SpareRequest.findAll({ attributes: ["id"] })).map(t => ({ id: t.id, type: "spare" })),
      ...(await PurchaseRequest.findAll({ attributes: ["id"] })).map(t => ({ id: t.id, type: "purchase" })),
      ...(await AssistanceRequest.findAll({ attributes: ["id"] })).map(t => ({ id: t.id, type: "assistance" }))
    ];

    const statusCounts = {
      pending: 0,
      assigned: 0,
      in_progress: 0,
      waiting: 0,
      resolved: 0,
      closed: 0
    };

    for (const ticket of allTicketIds) {
      const latestStatus = await TicketStatus.findOne({
        where: { ticketId: ticket.id, ticketType: ticket.type },
        order: [["createdAt", "DESC"]]
      });
      
      const status = latestStatus?.status || "pending";
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    }

    res.json({
      totalTickets: failures + spares + purchases + assistance,
      byType: {
        failures,
        spares,
        purchases,
        assistance
      },
      byStatus: statusCounts
    });
  } catch (err) {
    console.error("Error fetching SAT stats:", err);
    res.status(500).json({ error: "Error al obtener estadísticas" });
  }
});

export default router;
