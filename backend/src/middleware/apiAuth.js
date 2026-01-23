import { ApiKey } from "../models/index.js";

/**
 * Middleware para autenticar requests con API Key
 * Header: X-API-Key: your-api-key-here
 */
export async function requireApiKey(req, res, next) {
  try {
    const apiKey = req.headers["x-api-key"];

    if (!apiKey) {
      return res.status(401).json({ 
        error: "API Key requerida. Incluir en header: X-API-Key" 
      });
    }

    const key = await ApiKey.findOne({
      where: {
        key: apiKey,
        active: true
      }
    });

    if (!key) {
      return res.status(401).json({ 
        error: "API Key inválida o inactiva" 
      });
    }

    // Verificar expiración
    if (key.expiresAt && new Date() > new Date(key.expiresAt)) {
      return res.status(401).json({ 
        error: "API Key expirada" 
      });
    }

    // Actualizar último uso
    key.update({ lastUsedAt: new Date() }).catch(() => {});

    // Agregar info de API key al request
    req.apiKey = key;
    req.apiPermissions = key.permissions || [];

    next();
  } catch (error) {
    console.error("Error en API auth:", error);
    res.status(500).json({ error: "Error de autenticación" });
  }
}

/**
 * Verificar permiso específico
 */
export function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.apiPermissions || !req.apiPermissions.includes(permission)) {
      return res.status(403).json({ 
        error: `Permiso requerido: ${permission}` 
      });
    }
    next();
  };
}
