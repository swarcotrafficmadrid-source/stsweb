import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireSAT } from "../middleware/requireSAT.js";
import { 
  FailureReport, 
  SpareRequest, 
  PurchaseRequest, 
  AssistanceRequest,
  TicketStatus,
  TicketComment,
  User,
  sequelize
} from "../models/index.js";
import { Op } from "sequelize";

const router = Router();

// Dashboard general de métricas (solo SAT)
router.get("/dashboard", requireAuth, requireSAT, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const where = {};
    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    // Contadores totales
    const [
      totalFailures,
      totalSpares,
      totalPurchases,
      totalAssistance,
      totalUsers
    ] = await Promise.all([
      FailureReport.count({ where }),
      SpareRequest.count({ where }),
      PurchaseRequest.count({ where }),
      AssistanceRequest.count({ where }),
      User.count({ where: { userRole: "client" } })
    ]);

    const totalTickets = totalFailures + totalSpares + totalPurchases + totalAssistance;

    // Tickets por estado
    const ticketsByStatus = await TicketStatus.findAll({
      attributes: [
        "status",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"]
      ],
      where,
      group: ["status"],
      raw: true
    });

    // Tickets por tipo
    const ticketsByType = {
      failures: totalFailures,
      spares: totalSpares,
      purchases: totalPurchases,
      assistance: totalAssistance
    };

    // Actividad reciente (últimos 7 días por día)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const activityByDay = await FailureReport.findAll({
      attributes: [
        [sequelize.fn("DATE", sequelize.col("createdAt")), "date"],
        [sequelize.fn("COUNT", sequelize.col("id")), "count"]
      ],
      where: {
        createdAt: {
          [Op.gte]: sevenDaysAgo
        }
      },
      group: [sequelize.fn("DATE", sequelize.col("createdAt"))],
      order: [[sequelize.fn("DATE", sequelize.col("createdAt")), "ASC"]],
      raw: true
    });

    // Top usuarios por tickets
    const topUsers = await User.findAll({
      attributes: [
        "id",
        "nombre",
        "apellidos",
        "empresa",
        [sequelize.literal("(SELECT COUNT(*) FROM fallas WHERE userId = User.id)"), "ticketCount"]
      ],
      where: { userRole: "client" },
      order: [[sequelize.literal("ticketCount"), "DESC"]],
      limit: 10,
      raw: true
    });

    res.json({
      summary: {
        totalTickets,
        totalFailures,
        totalSpares,
        totalPurchases,
        totalAssistance,
        totalUsers
      },
      ticketsByStatus,
      ticketsByType,
      activityByDay,
      topUsers
    });

  } catch (error) {
    console.error("Error en analytics dashboard:", error);
    res.status(500).json({ error: "Error al obtener métricas" });
  }
});

// Métricas de tiempo de resolución
router.get("/resolution-time", requireAuth, requireSAT, async (req, res) => {
  try {
    const { ticketType, startDate, endDate } = req.query;

    const where = {
      status: "resolved"
    };

    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    if (ticketType) {
      where.ticketType = ticketType;
    }

    // Obtener todos los tickets resueltos con su primer status y último status
    const resolvedTickets = await TicketStatus.findAll({
      attributes: [
        "ticketId",
        "ticketType",
        [sequelize.fn("MIN", sequelize.col("createdAt")), "startTime"],
        [sequelize.fn("MAX", sequelize.col("createdAt")), "resolvedTime"]
      ],
      where,
      group: ["ticketId", "ticketType"],
      raw: true
    });

    // Calcular tiempos de resolución
    const resolutionTimes = resolvedTickets.map(ticket => {
      const start = new Date(ticket.startTime);
      const end = new Date(ticket.resolvedTime);
      const hours = (end - start) / (1000 * 60 * 60);
      return {
        ticketId: ticket.ticketId,
        ticketType: ticket.ticketType,
        resolutionHours: Math.round(hours * 10) / 10
      };
    });

    // Calcular promedio
    const avgResolutionTime = resolutionTimes.length > 0
      ? resolutionTimes.reduce((sum, t) => sum + t.resolutionHours, 0) / resolutionTimes.length
      : 0;

    res.json({
      averageResolutionTime: Math.round(avgResolutionTime * 10) / 10,
      totalResolved: resolutionTimes.length,
      resolutionTimes: resolutionTimes.slice(0, 100) // Limitar a 100 más recientes
    });

  } catch (error) {
    console.error("Error en resolution-time:", error);
    res.status(500).json({ error: "Error al calcular tiempos de resolución" });
  }
});

// Métricas de actividad de usuarios
router.get("/user-activity", requireAuth, requireSAT, async (req, res) => {
  try {
    const { userId, startDate, endDate } = req.query;

    const where = {};
    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }
    if (userId) {
      where.userId = userId;
    }

    const [failures, spares, purchases, assistance, comments] = await Promise.all([
      FailureReport.count({ where }),
      SpareRequest.count({ where }),
      PurchaseRequest.count({ where }),
      AssistanceRequest.count({ where }),
      TicketComment.count({ where })
    ]);

    res.json({
      failures,
      spares,
      purchases,
      assistance,
      comments,
      total: failures + spares + purchases + assistance + comments
    });

  } catch (error) {
    console.error("Error en user-activity:", error);
    res.status(500).json({ error: "Error al obtener actividad de usuario" });
  }
});

// Exportar reporte (CSV)
router.get("/export", requireAuth, requireSAT, async (req, res) => {
  try {
    const { type, startDate, endDate } = req.query;

    if (!type || !["failures", "spares", "purchases", "assistance"].includes(type)) {
      return res.status(400).json({ error: "Tipo de reporte inválido" });
    }

    const where = {};
    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    let data;
    let headers;

    switch (type) {
      case "failures":
        data = await FailureReport.findAll({
          where,
          include: [{ model: User, attributes: ["nombre", "apellidos", "empresa"] }],
          order: [["createdAt", "DESC"]]
        });
        headers = "ID,Título,Empresa,Usuario,Fecha,Estado\n";
        break;
      
      case "spares":
        data = await SpareRequest.findAll({
          where,
          include: [{ model: User, attributes: ["nombre", "apellidos", "empresa"] }],
          order: [["createdAt", "DESC"]]
        });
        headers = "ID,Título,Empresa,Usuario,Fecha\n";
        break;
      
      case "purchases":
        data = await PurchaseRequest.findAll({
          where,
          include: [{ model: User, attributes: ["nombre", "apellidos", "empresa"] }],
          order: [["createdAt", "DESC"]]
        });
        headers = "ID,Título,Empresa,Usuario,Fecha\n";
        break;
      
      case "assistance":
        data = await AssistanceRequest.findAll({
          where,
          include: [{ model: User, attributes: ["nombre", "apellidos", "empresa"] }],
          order: [["createdAt", "DESC"]]
        });
        headers = "ID,Tipo,Empresa,Usuario,Fecha\n";
        break;
    }

    // Generar CSV
    let csv = headers;
    data.forEach(item => {
      const row = [
        item.id,
        item.titulo || item.tipo || "-",
        item.User?.empresa || "-",
        `${item.User?.nombre || ""} ${item.User?.apellidos || ""}`.trim(),
        new Date(item.createdAt).toLocaleDateString("es-ES")
      ];
      csv += row.map(cell => `"${cell}"`).join(",") + "\n";
    });

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${type}-report-${Date.now()}.csv"`);
    res.send("\uFEFF" + csv); // BOM para Excel

  } catch (error) {
    console.error("Error al exportar:", error);
    res.status(500).json({ error: "Error al generar reporte" });
  }
});

export default router;
