import { sendMail } from "../utils/mailer.js";

// Global error handler con reporte automático a soporte
export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Error interno del servidor";
  
  // Log del error
  console.error(`[ERROR ${statusCode}] ${message}`, {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    user: req.user?.email || "anonymous",
    stack: err.stack
  });

  // Si es un error grave (500), enviar email a soporte
  if (statusCode >= 500) {
    sendMail({
      to: "sfr.support@swarco.com",
      subject: `⚠️ Error en Portal SWARCO Traffic Spain`,
      text: `
Error detectado en el sistema:

Mensaje: ${message}
Estado: ${statusCode}
URL: ${req.originalUrl}
Método: ${req.method}
Usuario: ${req.user?.email || "Anónimo"}
IP: ${req.ip}
Fecha: ${new Date().toISOString()}

Stack trace:
${err.stack}
      `,
      html: `
        <h2 style="color: #F29200;">⚠️ Error en Portal SWARCO Traffic Spain</h2>
        <p><strong>Mensaje:</strong> ${message}</p>
        <p><strong>Estado:</strong> ${statusCode}</p>
        <p><strong>URL:</strong> ${req.originalUrl}</p>
        <p><strong>Método:</strong> ${req.method}</p>
        <p><strong>Usuario:</strong> ${req.user?.email || "Anónimo"}</p>
        <p><strong>IP:</strong> ${req.ip}</p>
        <p><strong>Fecha:</strong> ${new Date().toISOString()}</p>
        <h3>Stack trace:</h3>
        <pre style="background: #f5f5f5; padding: 10px; border-radius: 5px;">${err.stack}</pre>
      `
    }).catch(mailErr => console.error("Error sending error report:", mailErr));
  }

  // Responder al cliente con un mensaje amigable
  res.status(statusCode).json({
    error: statusCode >= 500 ? "Ocurrió un error. Nuestro equipo ha sido notificado." : message,
    code: statusCode
  });
}

// Async error wrapper para rutas
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
