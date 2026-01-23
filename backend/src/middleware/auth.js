import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  
  if (!token) {
    return res.status(401).json({ 
      error: "Token requerido",
      code: "NO_TOKEN" 
    });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    return next();
  } catch (err) {
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
