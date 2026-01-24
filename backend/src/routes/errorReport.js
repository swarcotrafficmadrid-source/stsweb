import { Router } from "express";
import { sendMail } from "../utils/mailer.js";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { message, stack, url, userAgent, timestamp, context } = req.body;

    // Enviar email a soporte
    await sendMail({
      to: "sfr.support@swarco.com",
      subject: `[ERROR] Error en Frontend - Portal SWARCO Traffic Spain`,
      text: `
Error detectado en el frontend:

Mensaje: ${message}
URL: ${url}
Navegador: ${userAgent}
Fecha: ${timestamp}

Contexto:
${JSON.stringify(context, null, 2)}

Stack trace:
${stack}
      `,
      html: `
        <h2 style="color: #F29200;">[ERROR] Error en Frontend</h2>
        <p><strong>Mensaje:</strong> ${message}</p>
        <p><strong>URL:</strong> ${url}</p>
        <p><strong>Navegador:</strong> ${userAgent}</p>
        <p><strong>Fecha:</strong> ${timestamp}</p>
        
        <h3>Contexto:</h3>
        <pre style="background: #f5f5f5; padding: 10px; border-radius: 5px;">${JSON.stringify(context, null, 2)}</pre>
        
        <h3>Stack trace:</h3>
        <pre style="background: #f5f5f5; padding: 10px; border-radius: 5px;">${stack}</pre>
      `
    });

    res.json({ ok: true });
  } catch (err) {
    console.error("Error sending frontend error report:", err);
    res.status(500).json({ error: "Error al enviar reporte" });
  }
});

export default router;
