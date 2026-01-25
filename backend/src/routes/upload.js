import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../middleware/auth.js";
import { rateLimit } from "../middleware/rateLimit.js";
import { uploadFile, deleteFile } from "../utils/storage.js";

const router = Router();

// Configurar multer para usar memoria (no guardar en disco)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB máximo
    files: 5 // Máximo 5 archivos por request
  }
});

/**
 * Endpoint para subir un archivo individual
 * POST /api/upload
 */
router.post(
  "/",
  requireAuth,
  rateLimit({ windowMs: 60000, max: 20 }), // 20 uploads por minuto
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No se proporcionó ningún archivo" });
      }

      const { folder = "general" } = req.body;
      const { buffer, originalname, mimetype } = req.file;

      // Subir a Google Cloud Storage
      const result = await uploadFile(buffer, originalname, mimetype, folder);

      res.json({
        success: true,
        file: {
          url: result.url,
          fileName: result.fileName,
          path: result.path,
          originalName: originalname,
          size: buffer.length,
          type: mimetype
        }
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ 
        error: error.message || "Error al subir el archivo" 
      });
    }
  }
);

/**
 * Endpoint para subir múltiples archivos
 * POST /api/upload/multiple
 */
router.post(
  "/multiple",
  requireAuth,
  rateLimit({ windowMs: 60000, max: 10 }), // 10 uploads múltiples por minuto
  upload.array("files", 5), // Máximo 5 archivos
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: "No se proporcionaron archivos" });
      }

      const { folder = "general" } = req.body;
      const uploadedFiles = [];
      const errors = [];

      // Procesar cada archivo
      for (const file of req.files) {
        try {
          const result = await uploadFile(
            file.buffer,
            file.originalname,
            file.mimetype,
            folder
          );

          uploadedFiles.push({
            url: result.url,
            fileName: result.fileName,
            path: result.path,
            originalName: file.originalname,
            size: file.size,
            type: file.mimetype
          });
        } catch (error) {
          errors.push({
            fileName: file.originalname,
            error: error.message
          });
        }
      }

      res.json({
        success: uploadedFiles.length > 0,
        files: uploadedFiles,
        errors: errors.length > 0 ? errors : undefined,
        summary: {
          uploaded: uploadedFiles.length,
          failed: errors.length,
          total: req.files.length
        }
      });
    } catch (error) {
      console.error("Error uploading multiple files:", error);
      res.status(500).json({ 
        error: error.message || "Error al subir los archivos" 
      });
    }
  }
);

/**
 * Endpoint para eliminar un archivo
 * DELETE /api/upload/:path
 */
router.delete(
  "/:folder/:fileName",
  requireAuth,
  async (req, res) => {
    try {
      const { folder, fileName } = req.params;
      const filePath = `${folder}/${fileName}`;

      // Solo SAT admin/technician pueden eliminar archivos
      // Los clientes NO pueden eliminar archivos una vez subidos
      if (req.user.userRole !== "sat_admin" && req.user.userRole !== "sat_technician") {
        return res.status(403).json({ error: "No tienes permisos para eliminar archivos" });
      }

      const success = await deleteFile(filePath);

      if (success) {
        res.json({ success: true, message: "Archivo eliminado correctamente" });
      } else {
        res.status(404).json({ error: "Archivo no encontrado o no se pudo eliminar" });
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      res.status(500).json({ 
        error: error.message || "Error al eliminar el archivo" 
      });
    }
  }
);

/**
 * Endpoint de salud para verificar conexión con Cloud Storage
 * GET /api/upload/health
 */
router.get("/health", async (req, res) => {
  try {
    // Intentar listar archivos para verificar conexión
    const { listFiles } = await import("../utils/storage.js");
    await listFiles("", 1);
    
    res.json({ 
      status: "ok", 
      storage: "connected",
      bucket: process.env.STORAGE_BUCKET_NAME || "swarco-tickets-files"
    });
  } catch (error) {
    res.status(503).json({ 
      status: "error", 
      storage: "disconnected",
      error: error.message 
    });
  }
});

export default router;
