import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { sequelize } from "../models/index.js";

const router = Router();

// Middleware para verificar que es super admin
function requireSuperAdmin(req, res, next) {
  if (req.user.userRole !== "sat_admin") {
    return res.status(403).json({ error: "Acceso denegado" });
  }
  next();
}

// Listar todas las tablas
router.get("/tables", requireAuth, requireSuperAdmin, async (req, res) => {
  try {
    const [tables] = await sequelize.query("SHOW TABLES");
    const tableNames = tables.map(t => Object.values(t)[0]);
    res.json({ tables: tableNames });
  } catch (error) {
    console.error("Error listing tables:", error);
    res.status(500).json({ error: "Error al listar tablas" });
  }
});

// Ver registros de una tabla
router.get("/table/:tableName", requireAuth, requireSuperAdmin, async (req, res) => {
  try {
    const { tableName } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    // Validar nombre de tabla (prevenir SQL injection)
    const [tables] = await sequelize.query("SHOW TABLES");
    const tableNames = tables.map(t => Object.values(t)[0]);
    if (!tableNames.includes(tableName)) {
      return res.status(404).json({ error: "Tabla no encontrada" });
    }

    // Obtener estructura de la tabla
    const [columns] = await sequelize.query(`SHOW COLUMNS FROM ${tableName}`);

    // Obtener total de registros
    const [[{ total }]] = await sequelize.query(`SELECT COUNT(*) as total FROM ${tableName}`);

    // Obtener registros
    const [rows] = await sequelize.query(
      `SELECT * FROM ${tableName} ORDER BY id DESC LIMIT ${limit} OFFSET ${offset}`
    );

    res.json({
      tableName,
      columns,
      rows,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error("Error fetching table data:", error);
    res.status(500).json({ error: "Error al obtener datos de la tabla" });
  }
});

// Eliminar registro por ID
router.delete("/table/:tableName/:id", requireAuth, requireSuperAdmin, async (req, res) => {
  try {
    const { tableName, id } = req.params;

    // Validar nombre de tabla
    const [tables] = await sequelize.query("SHOW TABLES");
    const tableNames = tables.map(t => Object.values(t)[0]);
    if (!tableNames.includes(tableName)) {
      return res.status(404).json({ error: "Tabla no encontrada" });
    }

    // Eliminar registro
    await sequelize.query(`DELETE FROM ${tableName} WHERE id = ?`, {
      replacements: [id]
    });

    res.json({ success: true, message: "Registro eliminado" });
  } catch (error) {
    console.error("Error deleting record:", error);
    res.status(500).json({ error: "Error al eliminar registro" });
  }
});

// Ejecutar consulta SQL personalizada (solo SELECT)
router.post("/query", requireAuth, requireSuperAdmin, async (req, res) => {
  try {
    const { query } = req.body;

    // Solo permitir SELECT
    if (!query.trim().toLowerCase().startsWith("select")) {
      return res.status(400).json({ error: "Solo se permiten consultas SELECT" });
    }

    const [results] = await sequelize.query(query);
    res.json({ results, count: results.length });
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(400).json({ error: error.message });
  }
});

// Obtener estadísticas generales
router.get("/stats", requireAuth, requireSuperAdmin, async (req, res) => {
  try {
    const [[usuarios]] = await sequelize.query("SELECT COUNT(*) as total FROM usuarios");
    const [[averias]] = await sequelize.query("SELECT COUNT(*) as total FROM averias");
    const [[repuestos]] = await sequelize.query("SELECT COUNT(*) as total FROM repuestos");
    const [[compras]] = await sequelize.query("SELECT COUNT(*) as total FROM compras");
    const [[asistencias]] = await sequelize.query("SELECT COUNT(*) as total FROM asistencias");

    res.json({
      usuarios: usuarios.total,
      averias: averias.total,
      repuestos: repuestos.total,
      compras: compras.total,
      asistencias: asistencias.total
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: "Error al obtener estadísticas" });
  }
});

export default router;
