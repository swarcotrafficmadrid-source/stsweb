import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  
  // Log para debugging (solo en rutas de upload)
  if (req.path?.includes("/upload")) {
    console.log("[AUTH] Verificando autenticación para upload:", {
      hasHeader: !!req.headers.authorization,
      hasToken: !!token,
      path: req.path,
      method: req.method
    });
  }
  
  if (!token) {
    if (req.path?.includes("/upload")) {
      console.error("[AUTH] ❌ No hay token en request de upload");
    }
    return res.status(401).json({ 
      error: "Token requerido",
      code: "NO_TOKEN" 
    });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    
    if (req.path?.includes("/upload")) {
      console.log("[AUTH] ✅ Token válido para upload:", {
        userId: payload.id,
        email: payload.email
      });
    }
    
    return next();
  } catch (err) {
    if (req.path?.includes("/upload")) {
      console.error("[AUTH] ❌ Error verificando token:", {
        name: err.name,
        message: err.message
      });
    }
    
    // Distinguir entre token expirado vs inválido
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: "Token expirado. Por favor, inicia sesión nuevamente.",
        code: "TOKEN_EXPIRED",
        expiredAt: err.expiredAt
      });
    }
    
    return res.status(401).json({ 
      error: "Token inválido",
      code: "INVALID_TOKEN" 
    });
  }
}
