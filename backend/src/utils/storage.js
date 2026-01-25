import { Storage } from "@google-cloud/storage";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";

// Inicializar Google Cloud Storage
let storage;
let bucket;

try {
  // Si hay credenciales en variable de entorno
  if (process.env.GOOGLE_CLOUD_STORAGE_KEY) {
    const credentials = JSON.parse(
      Buffer.from(process.env.GOOGLE_CLOUD_STORAGE_KEY, "base64").toString()
    );
    storage = new Storage({ credentials });
  } else {
    // En desarrollo local o Cloud Run con permisos automáticos
    storage = new Storage();
  }
  
  const bucketName = process.env.STORAGE_BUCKET_NAME || "swarco-tickets-files";
  bucket = storage.bucket(bucketName);
  
  console.log(`[OK] Google Cloud Storage configurado: ${bucketName}`);
} catch (error) {
  console.error("[WARNING] Error al configurar Google Cloud Storage:", error.message);
}

/**
 * Validar tipo de archivo
 */
function validateFileType(mimetype, allowedTypes) {
  return allowedTypes.includes(mimetype);
}

/**
 * Validar tamaño de archivo
 */
function validateFileSize(size, maxSizeMB) {
  const maxBytes = maxSizeMB * 1024 * 1024;
  return size <= maxBytes;
}

/**
 * Subir archivo a Google Cloud Storage
 * @param {Buffer} fileBuffer - Buffer del archivo
 * @param {string} originalName - Nombre original del archivo
 * @param {string} mimetype - Tipo MIME del archivo
 * @param {string} folder - Carpeta destino (ej: "failures", "spares")
 * @returns {Promise<{url: string, fileName: string, path: string}>}
 */
export async function uploadFile(fileBuffer, originalName, mimetype, folder = "general") {
  if (!bucket) {
    throw new Error("Google Cloud Storage no está configurado");
  }

  // Validaciones
  const isImage = mimetype.startsWith("image/");
  const isVideo = mimetype.startsWith("video/");

  if (!isImage && !isVideo) {
    throw new Error("Tipo de archivo no permitido. Solo imágenes y videos.");
  }

  // Validar tipos específicos
  const allowedImages = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  const allowedVideos = ["video/mp4", "video/webm", "video/quicktime"];
  
  if (isImage && !validateFileType(mimetype, allowedImages)) {
    throw new Error("Formato de imagen no permitido. Use: JPG, PNG, GIF, WEBP");
  }
  
  if (isVideo && !validateFileType(mimetype, allowedVideos)) {
    throw new Error("Formato de video no permitido. Use: MP4, WEBM, MOV");
  }

  // Validar tamaños
  const maxImageSize = 5; // 5MB
  const maxVideoSize = 50; // 50MB
  
  if (isImage && !validateFileSize(fileBuffer.length, maxImageSize)) {
    throw new Error(`Imagen muy grande. Máximo: ${maxImageSize}MB`);
  }
  
  if (isVideo && !validateFileSize(fileBuffer.length, maxVideoSize)) {
    throw new Error(`Video muy grande. Máximo: ${maxVideoSize}MB`);
  }

  // Comprimir imágenes automáticamente con sharp
  let processedBuffer = fileBuffer;
  let thumbnailBuffer = null;
  
  if (isImage) {
    try {
      // Comprimir imagen principal (máx 1920x1080, calidad 85%)
      processedBuffer = await sharp(fileBuffer)
        .resize(1920, 1080, {
          fit: "inside",
          withoutEnlargement: true
        })
        .jpeg({ quality: 85, progressive: true })
        .toBuffer();
      
      // Generar thumbnail (300x300)
      thumbnailBuffer = await sharp(fileBuffer)
        .resize(300, 300, {
          fit: "cover"
        })
        .jpeg({ quality: 80 })
        .toBuffer();
      
      const reduction = Math.round((1 - processedBuffer.length / fileBuffer.length) * 100);
      console.log(`[OK] Imagen optimizada: ${(fileBuffer.length / 1024).toFixed(0)}KB a ${(processedBuffer.length / 1024).toFixed(0)}KB (-${reduction}%)`);
    } catch (err) {
      console.error("[WARNING] Error al comprimir imagen, usando original:", err.message);
      processedBuffer = fileBuffer;
    }
  }

  // Generar nombre único
  const ext = path.extname(originalName);
  const timestamp = Date.now();
  const uuid = uuidv4().slice(0, 8);
  const fileName = `${timestamp}-${uuid}${ext}`;
  const filePath = `${folder}/${fileName}`;

  // Subir archivo principal
  const file = bucket.file(filePath);

  await file.save(processedBuffer, {
    metadata: {
      contentType: isImage ? "image/jpeg" : mimetype,
      metadata: {
        originalName,
        uploadedAt: new Date().toISOString(),
        compressed: isImage
      }
    }
  });

  // Subir thumbnail si existe
  let thumbnailUrl = null;
  if (thumbnailBuffer) {
    const thumbFileName = `${timestamp}-${uuid}-thumb${ext}`;
    const thumbPath = `${folder}/thumbnails/${thumbFileName}`;
    const thumbFile = bucket.file(thumbPath);
    
    await thumbFile.save(thumbnailBuffer, {
      metadata: {
        contentType: "image/jpeg",
        metadata: {
          originalName,
          isThumbnail: true
        }
      }
    });

    // Siempre usar URL firmada para thumbnail
    const [thumbSignedUrl] = await thumbFile.getSignedUrl({
      action: "read",
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 días
    });
    thumbnailUrl = thumbSignedUrl;
  }

  // Siempre usar URL firmada (no intentar hacer público)
  const [signedUrl] = await file.getSignedUrl({
    action: "read",
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 días
  });
  
  return { 
    url: signedUrl, 
    fileName, 
    path: filePath,
    thumbnailUrl,
    originalSize: fileBuffer.length,
    compressedSize: processedBuffer.length
  };
}

/**
 * Eliminar archivo de Google Cloud Storage
 * @param {string} filePath - Ruta del archivo en el bucket
 */
export async function deleteFile(filePath) {
  if (!bucket) {
    throw new Error("Google Cloud Storage no está configurado");
  }

  try {
    await bucket.file(filePath).delete();
    console.log(`[OK] Archivo eliminado: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`[ERROR] Error al eliminar archivo ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Obtener URL firmada para un archivo existente
 * @param {string} filePath - Ruta del archivo en el bucket
 * @param {number} expirationDays - Días de validez (default: 7)
 */
export async function getSignedUrl(filePath, expirationDays = 7) {
  if (!bucket) {
    throw new Error("Google Cloud Storage no está configurado");
  }

  const file = bucket.file(filePath);
  const [exists] = await file.exists();
  
  if (!exists) {
    throw new Error("Archivo no encontrado");
  }

  const [signedUrl] = await file.getSignedUrl({
    action: "read",
    expires: Date.now() + expirationDays * 24 * 60 * 60 * 1000
  });

  return signedUrl;
}

/**
 * Listar archivos en una carpeta
 * @param {string} folder - Carpeta a listar
 * @param {number} limit - Límite de resultados
 */
export async function listFiles(folder = "", limit = 100) {
  if (!bucket) {
    throw new Error("Google Cloud Storage no está configurado");
  }

  const [files] = await bucket.getFiles({
    prefix: folder,
    maxResults: limit
  });

  return files.map(file => ({
    name: file.name,
    size: file.metadata.size,
    contentType: file.metadata.contentType,
    created: file.metadata.timeCreated,
    updated: file.metadata.updated
  }));
}

/**
 * Eliminar archivos huérfanos (sin referencias en BD)
 * Esta función debería ejecutarse periódicamente como cron job
 */
export async function cleanupOrphanFiles(validPaths) {
  if (!bucket) {
    throw new Error("Google Cloud Storage no está configurado");
  }

  const [allFiles] = await bucket.getFiles();
  const deletedFiles = [];

  for (const file of allFiles) {
    if (!validPaths.includes(file.name)) {
      await file.delete();
      deletedFiles.push(file.name);
    }
  }

  console.log(`[CLEAN] Limpieza completada. Archivos eliminados: ${deletedFiles.length}`);
  return deletedFiles;
}

export default {
  uploadFile,
  deleteFile,
  getSignedUrl,
  listFiles,
  cleanupOrphanFiles
};
