// Validación y sanitización de inputs
export function sanitizeInput(input) {
  if (typeof input !== "string") return input;
  // Prevenir XSS básico
  return input
    .replace(/[<>]/g, "")
    .trim();
}

export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function validatePassword(password) {
  // Mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número, 1 carácter especial
  if (password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  if (!/[^A-Za-z0-9]/.test(password)) return false;
  return true;
}

export function sanitizeBody(req, res, next) {
  if (req.body && typeof req.body === "object") {
    for (const key in req.body) {
      if (typeof req.body[key] === "string") {
        req.body[key] = sanitizeInput(req.body[key]);
      } else if (Array.isArray(req.body[key])) {
        req.body[key] = req.body[key].map(item => {
          if (typeof item === "string") return sanitizeInput(item);
          if (typeof item === "object") {
            for (const k in item) {
              if (typeof item[k] === "string") {
                item[k] = sanitizeInput(item[k]);
              }
            }
          }
          return item;
        });
      }
    }
  }
  next();
}
