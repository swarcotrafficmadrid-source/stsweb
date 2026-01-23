import { Router } from "express";
import { requireApiKey, requirePermission } from "../middleware/apiAuth.js";
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

const router = Router();

// ==================== TICKETS ====================

// Listar todos los tickets
router.get("/tickets", requireApiKey, async (req, res) => {
  try {
    const { type, status, limit = 100, offset = 0 } = req.query;

    const options = {
      limit: Math.min(parseInt(limit), 500), // Máximo 500
      offset: parseInt(offset),
      include: [{ model: User, attributes: ["id", "nombre", "apellidos", "empresa", "email"] }],
      order: [["createdAt", "DESC"]]
    };

    let tickets = [];

    if (!type || type === "all") {
      const [failures, spares, purchases, assistance] = await Promise.all([
        FailureReport.findAll(options),
        SpareRequest.findAll(options),
        PurchaseRequest.findAll(options),
        AssistanceRequest.findAll(options)
      ]);
      tickets = [
        ...failures.map(t => ({ ...t.toJSON(), type: "failure" })),
        ...spares.map(t => ({ ...t.toJSON(), type: "spare" })),
        ...purchases.map(t => ({ ...t.toJSON(), type: "purchase" })),
        ...assistance.map(t => ({ ...t.toJSON(), type: "assistance" }))
      ];
    } else {
      switch (type) {
        case "failure":
          tickets = await FailureReport.findAll(options);
          break;
        case "spare":
          tickets = await SpareRequest.findAll(options);
          break;
        case "purchase":
          tickets = await PurchaseRequest.findAll(options);
          break;
        case "assistance":
          tickets = await AssistanceRequest.findAll(options);
          break;
        default:
          return res.status(400).json({ error: "Tipo inválido" });
      }
      tickets = tickets.map(t => ({ ...t.toJSON(), type }));
    }

    res.json({
      total: tickets.length,
      limit: options.limit,
      offset: options.offset,
      data: tickets
    });

  } catch (error) {
    console.error("Error en GET /tickets:", error);
    res.status(500).json({ error: "Error al obtener tickets" });
  }
});

// Obtener ticket específico
router.get("/tickets/:type/:id", requireApiKey, async (req, res) => {
  try {
    const { type, id } = req.params;

    let ticket;
    const includeOptions = {
      include: [
        { model: User, attributes: ["id", "nombre", "apellidos", "empresa", "email"] }
      ]
    };

    switch (type) {
      case "failure":
        ticket = await FailureReport.findByPk(id, {
          ...includeOptions,
          include: [...includeOptions.include, { model: FailureEquipment }]
        });
        break;
      case "spare":
        ticket = await SpareRequest.findByPk(id, {
          ...includeOptions,
          include: [...includeOptions.include, { model: SpareItem }]
        });
        break;
      case "purchase":
        ticket = await PurchaseRequest.findByPk(id, {
          ...includeOptions,
          include: [...includeOptions.include, { model: PurchaseEquipment }]
        });
        break;
      case "assistance":
        ticket = await AssistanceRequest.findByPk(id, includeOptions);
        break;
      default:
        return res.status(400).json({ error: "Tipo inválido" });
    }

    if (!ticket) {
      return res.status(404).json({ error: "Ticket no encontrado" });
    }

    // Obtener estados y comentarios
    const [statuses, comments] = await Promise.all([
      TicketStatus.findAll({
        where: { ticketId: id, ticketType: type },
        order: [["createdAt", "ASC"]]
      }),
      TicketComment.findAll({
        where: { ticketId: id, ticketType: type, isInternal: false },
        order: [["createdAt", "ASC"]],
        include: [{ model: User, attributes: ["id", "nombre", "apellidos"] }]
      })
    ]);

    res.json({
      ...ticket.toJSON(),
      type,
      statuses,
      comments
    });

  } catch (error) {
    console.error("Error en GET /tickets/:type/:id:", error);
    res.status(500).json({ error: "Error al obtener ticket" });
  }
});

// Crear ticket (requiere permiso write)
router.post("/tickets/:type", requireApiKey, requirePermission("write"), async (req, res) => {
  try {
    const { type } = req.params;
    const data = req.body;

    // Validar que userId existe
    if (!data.userId) {
      return res.status(400).json({ error: "userId requerido" });
    }

    const user = await User.findByPk(data.userId);
    if (!user) {
      return res.status(400).json({ error: "Usuario no encontrado" });
    }

    let ticket;

    switch (type) {
      case "failure":
        if (!data.titulo || !data.equipments) {
          return res.status(400).json({ error: "Faltan campos requeridos" });
        }
        ticket = await FailureReport.create({
          userId: data.userId,
          titulo: data.titulo,
          descripcionGeneral: data.descripcionGeneral,
          prioridad: data.prioridad || "media"
        });
        // Crear equipments
        if (data.equipments && data.equipments.length > 0) {
          for (const eq of data.equipments) {
            await FailureEquipment.create({
              failureId: ticket.id,
              ...eq
            });
          }
        }
        break;

      case "spare":
        if (!data.titulo || !data.items) {
          return res.status(400).json({ error: "Faltan campos requeridos" });
        }
        ticket = await SpareRequest.create({
          userId: data.userId,
          titulo: data.titulo,
          descripcionGeneral: data.descripcionGeneral
        });
        // Crear items
        if (data.items && data.items.length > 0) {
          for (const item of data.items) {
            await SpareItem.create({
              spareRequestId: ticket.id,
              ...item
            });
          }
        }
        break;

      case "purchase":
        if (!data.titulo || !data.equipments) {
          return res.status(400).json({ error: "Faltan campos requeridos" });
        }
        ticket = await PurchaseRequest.create({
          userId: data.userId,
          titulo: data.titulo,
          proyecto: data.proyecto,
          pais: data.pais
        });
        // Crear equipments
        if (data.equipments && data.equipments.length > 0) {
          for (const eq of data.equipments) {
            await PurchaseEquipment.create({
              purchaseRequestId: ticket.id,
              ...eq
            });
          }
        }
        break;

      case "assistance":
        if (!data.tipo) {
          return res.status(400).json({ error: "Tipo de asistencia requerido" });
        }
        ticket = await AssistanceRequest.create({
          userId: data.userId,
          tipo: data.tipo,
          fecha: data.fecha,
          hora: data.hora,
          lugar: data.lugar,
          descripcionFalla: data.descripcionFalla
        });
        break;

      default:
        return res.status(400).json({ error: "Tipo inválido" });
    }

    res.status(201).json({
      id: ticket.id,
      type,
      message: "Ticket creado exitosamente"
    });

  } catch (error) {
    console.error("Error en POST /tickets/:type:", error);
    res.status(500).json({ error: "Error al crear ticket" });
  }
});

// Agregar comentario (requiere permiso write)
router.post("/tickets/:type/:id/comment", requireApiKey, requirePermission("write"), async (req, res) => {
  try {
    const { type, id } = req.params;
    const { message, userId } = req.body;

    if (!message || !userId) {
      return res.status(400).json({ error: "message y userId requeridos" });
    }

    const comment = await TicketComment.create({
      ticketId: parseInt(id),
      ticketType: type,
      userId,
      message,
      isInternal: false
    });

    res.status(201).json(comment);

  } catch (error) {
    console.error("Error en POST /tickets/:type/:id/comment:", error);
    res.status(500).json({ error: "Error al agregar comentario" });
  }
});

// ==================== USUARIOS ====================

// Listar usuarios
router.get("/users", requireApiKey, async (req, res) => {
  try {
    const { limit = 100, offset = 0 } = req.query;

    const users = await User.findAll({
      attributes: ["id", "nombre", "apellidos", "empresa", "email", "telefono", "pais"],
      where: { userRole: "client" },
      limit: Math.min(parseInt(limit), 500),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]]
    });

    res.json({
      total: users.length,
      data: users
    });

  } catch (error) {
    console.error("Error en GET /users:", error);
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
});

// Obtener usuario específico
router.get("/users/:id", requireApiKey, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: ["id", "nombre", "apellidos", "empresa", "email", "telefono", "pais", "cargo"]
    });

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json(user);

  } catch (error) {
    console.error("Error en GET /users/:id:", error);
    res.status(500).json({ error: "Error al obtener usuario" });
  }
});

// ==================== DOCUMENTACIÓN ====================

// Documentación de la API
router.get("/docs", (req, res) => {
  res.json({
    version: "1.0.0",
    name: "SWARCO SAT API",
    description: "API REST para integración con sistemas externos (Jira, ERP, etc.)",
    authentication: {
      type: "API Key",
      header: "X-API-Key",
      example: "X-API-Key: your-api-key-here"
    },
    endpoints: {
      tickets: {
        list: "GET /api/public/tickets?type=failure&limit=100&offset=0",
        get: "GET /api/public/tickets/:type/:id",
        create: "POST /api/public/tickets/:type",
        comment: "POST /api/public/tickets/:type/:id/comment"
      },
      users: {
        list: "GET /api/public/users?limit=100&offset=0",
        get: "GET /api/public/users/:id"
      }
    },
    ticketTypes: ["failure", "spare", "purchase", "assistance"],
    permissions: ["read", "write", "delete"]
  });
});

export default router;
