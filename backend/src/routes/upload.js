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
  },
  fileFilter: (req, file, cb) => {
    // Log para debugging
    console.log("[MULTER] Archivo recibido:", {
      fieldname: file.fieldname,
      originalname: file.originalname,
      mimetype: file.mimetype,
      encoding: file.encoding
    });
    cb(null, true);
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
      console.log("[UPLOAD] Iniciando upload:", {
        hasFile: !!req.file,
        hasUser: !!req.user,
        userId: req.user?.id,
        folder: req.body?.folder
      });

      if (!req.file) {
        console.error("[UPLOAD] Error: No se proporcionó archivo");
        return res.status(400).json({ error: "No se proporcionó ningún archivo" });
      }

      const { folder = "general" } = req.body;
      const { buffer, originalname, mimetype, size } = req.file;

      console.log("[UPLOAD] Archivo recibido:", {
        originalname,
        mimetype,
        size: `${(size / 1024).toFixed(2)}KB`,
        folder
      });

      // Subir a Google Cloud Storage
      const result = await uploadFile(buffer, originalname, mimetype, folder);

      console.log("[UPLOAD] ✅ Archivo subido exitosamente:", {
        fileName: result.fileName,
        path: result.path,
        urlLength: result.url?.length || 0
      });

      res.json({
        success: true,
        file: {
          url: result.url,
          fileName: result.fileName,
          path: result.path,
          originalName: originalname,
          size: buffer.length,
          type: mimetype,
          thumbnailUrl: result.thumbnailUrl
        }
      });
    } catch (error) {
      console.error("[UPLOAD] ❌ Error completo:", {
        message: error.message,
        stack: error.stack?.split("\n").slice(0, 5).join("\n"),
        hasFile: !!req.file,
        fileName: req.file?.originalname
      });
      res.status(500).json({ 
        error: error.message || "Error al subir el archivo",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined
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
