// Middleware para verificar que el usuario es parte del equipo SAT
export function requireSAT(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "No autenticado" });
  }
  
  if (req.user.userRole !== "sat_admin" && req.user.userRole !== "sat_technician") {
    return res.status(403).json({ error: "Acceso denegado. Solo personal SAT." });
  }
  
  next();
}

export function requireSATAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "No autenticado" });
  }
  
  if (req.user.userRole !== "sat_admin") {
    return res.status(403).json({ error: "Acceso denegado. Solo administradores SAT." });
  }
  
  next();
}
