import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { FailureEquipment, SpareItem, PurchaseEquipment } from "../models/index.js";
import crypto from "crypto";

const router = Router();

/**
 * Generar código QR para un equipo
 * El QR contiene un hash único que identifica el equipo
 */
router.post("/generate", requireAuth, async (req, res) => {
  try {
    const { equipmentType, equipmentId, serial, refCode } = req.body;

    if (!equipmentType || !equipmentId) {
      return res.status(400).json({ error: "equipmentType y equipmentId requeridos" });
    }

    // Generar hash único basado en el equipo
    const data = `${equipmentType}-${equipmentId}-${serial || ""}-${refCode || ""}`;
    const qrHash = crypto.createHash("sha256").update(data).digest("hex").substring(0, 16);

    // Formato del QR: SWARCO-[TYPE]-[HASH]
    const qrCode = `SWARCO-${equipmentType.toUpperCase()}-${qrHash}`;

    // Retornar datos del QR
    res.json({
      qrCode,
      equipmentType,
      equipmentId,
      serial,
      refCode,
      generatedAt: new Date().toISOString(),
      // URL para generar imagen QR (puede usar una librería externa)
      qrImageUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrCode)}`
    });

  } catch (error) {
    console.error("Error generando QR:", error);
    res.status(500).json({ error: "Error al generar QR" });
  }
});

/**
 * Escanear/Validar código QR
 * Retorna información del equipo asociado
 */
router.post("/scan", requireAuth, async (req, res) => {
  try {
    const { qrCode } = req.body;

    if (!qrCode || !qrCode.startsWith("SWARCO-")) {
      return res.status(400).json({ error: "Código QR inválido" });
    }

    // Parsear QR: SWARCO-[TYPE]-[HASH]
    const parts = qrCode.split("-");
    if (parts.length !== 3) {
      return res.status(400).json({ error: "Formato de QR inválido" });
    }

    const [, type] = parts;
    
    // Buscar el equipo en la base de datos
    // Por ahora retornamos info básica, luego podemos hacer búsqueda por serial/refCode
    res.json({
      valid: true,
      qrCode,
      equipmentType: type.toLowerCase(),
      scannedAt: new Date().toISOString(),
      message: "QR válido. Equipo reconocido por SWARCO."
    });

  } catch (error) {
    console.error("Error escaneando QR:", error);
    res.status(500).json({ error: "Error al escanear QR" });
  }
});

/**
 * Buscar equipo por serial o refCode
 * Útil después de escanear QR para autocompletar
 */
router.get("/equipment/:serialOrRef", requireAuth, async (req, res) => {
  try {
    const { serialOrRef } = req.params;

    // Buscar en todas las tablas de equipos
    const [failureEq, spareItem, purchaseEq] = await Promise.all([
      FailureEquipment.findOne({
        where: {
          serial: serialOrRef
        }
      }),
      SpareItem.findOne({
        where: {
          serial: serialOrRef
        }
      }),
      PurchaseEquipment.findOne({
        where: {
          nombre: serialOrRef // purchase usa nombre, no serial
        }
      })
    ]);

    const equipment = failureEq || spareItem || purchaseEq;

    if (!equipment) {
      return res.status(404).json({ 
        error: "Equipo no encontrado",
        searched: serialOrRef
      });
    }

    res.json({
      found: true,
      equipment: equipment.toJSON(),
      type: failureEq ? "failure" : spareItem ? "spare" : "purchase"
    });

  } catch (error) {
    console.error("Error buscando equipo:", error);
    res.status(500).json({ error: "Error al buscar equipo" });
  }
});

/**
 * Obtener historial de un equipo (por serial)
 */
router.get("/history/:serial", requireAuth, async (req, res) => {
  try {
    const { serial } = req.params;

    // Buscar en todas las tablas
    const [failures, spares] = await Promise.all([
      FailureEquipment.findAll({
        where: { serial },
        order: [["createdAt", "DESC"]],
        limit: 20
      }),
      SpareItem.findAll({
        where: { serial },
        order: [["createdAt", "DESC"]],
        limit: 20
      })
    ]);

    const history = [
      ...failures.map(f => ({ ...f.toJSON(), type: "failure" })),
      ...spares.map(s => ({ ...s.toJSON(), type: "spare" }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      serial,
      totalRecords: history.length,
      history
    });

  } catch (error) {
    console.error("Error obteniendo historial:", error);
    res.status(500).json({ error: "Error al obtener historial" });
  }
});

export default router;
