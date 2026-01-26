import nodemailer from "nodemailer";
import { google } from "googleapis";

function getTransporter() {
  const host = process.env.SMTP_HOST;
  if (!host) {
    return null;
  }
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
  const secure = String(process.env.SMTP_SECURE || "").toLowerCase() === "true";
  const user = process.env.SMTP_USER || "";
  const pass = process.env.SMTP_PASS || "";

  const auth = user && pass ? { user, pass } : undefined;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth,
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 10000
  });
}

function parseServiceAccount() {
  const raw = process.env.GMAIL_SERVICE_ACCOUNT_JSON || "";
  if (!raw) {
    console.error("❌ GMAIL_SERVICE_ACCOUNT_JSON no está configurado");
    return null;
  }
  try {
    let jsonString;
    if (raw.trim().startsWith("{")) {
      jsonString = raw;
    } else {
      jsonString = Buffer.from(raw, "base64").toString("utf8");
    }
    
    const serviceAccount = JSON.parse(jsonString);
    
    // Verificar campos requeridos
    if (!serviceAccount.client_email || !serviceAccount.private_key) {
      console.error("❌ Service account JSON incompleto - faltan client_email o private_key");
      return null;
    }
    
    // Arreglar el private_key si tiene \n como string literal
    if (serviceAccount.private_key && typeof serviceAccount.private_key === "string") {
      // Reemplazar todos los tipos de saltos de línea
      serviceAccount.private_key = serviceAccount.private_key
        .replace(/\\n/g, "\n")           // \n como string literal
        .replace(/\\r\\n/g, "\n")        // \r\n como string literal
        .replace(/\\r/g, "\n")           // \r como string literal
        .replace(/\r\n/g, "\n")          // \r\n real
        .replace(/\r/g, "\n");           // \r real
      
      // Asegurar que empiece y termine correctamente
      if (!serviceAccount.private_key.includes("-----BEGIN")) {
        console.warn("⚠️ private_key no tiene formato PEM estándar");
      }
      
      // Limpiar espacios extra al inicio y final
      serviceAccount.private_key = serviceAccount.private_key.trim();
    }
    
    console.log("✅ Service account parseado correctamente:", {
      client_email: serviceAccount.client_email,
      project_id: serviceAccount.project_id
    });
    
    return serviceAccount;
  } catch (err) {
    console.error("❌ Error parseando GMAIL_SERVICE_ACCOUNT_JSON:", err.message);
    return null;
  }
}

function getMailReason(err) {
  const msg = (err?.message || "").toLowerCase();
  const code = (err?.code || "").toString().toUpperCase();
  if (code.includes("ECONN") || code.includes("ETIMEDOUT") || code.includes("ENOTFOUND") || code.includes("ESOCKET")) {
    return "conexion";
  }
  if (msg.includes("invalid") || msg.includes("recipient") || msg.includes("mailbox") || msg.includes("address")) {
    return "correo";
  }
  if (msg.includes("timeout") || msg.includes("timed out")) {
    return "conexion";
  }
  return "error";
}

async function sendViaGmailApi({ to, subject, text, html }) {
  console.log("📧 Intentando enviar email vía Gmail API...");
  console.log("   To:", to);
  console.log("   Subject:", subject);
  
  // Verificar variables de entorno primero
  const hasServiceAccount = !!process.env.GMAIL_SERVICE_ACCOUNT_JSON;
  const impersonate = process.env.GMAIL_IMPERSONATE;
  const from = process.env.GMAIL_FROM || impersonate;
  
  console.log("   🔍 Diagnóstico:", {
    hasServiceAccount: hasServiceAccount,
    hasImpersonate: !!impersonate,
    impersonate: impersonate,
    from: from,
    provider: process.env.MAIL_PROVIDER
  });

  if (!hasServiceAccount) {
    console.error("❌ GMAIL_SERVICE_ACCOUNT_JSON no está configurado en variables de entorno");
    return { ok: false, reason: "config", error: "GMAIL_SERVICE_ACCOUNT_JSON no configurado" };
  }
  
  const serviceAccount = parseServiceAccount();
  if (!serviceAccount) {
    console.error("❌ Service account no se pudo parsear - revisa el formato JSON");
    return { ok: false, reason: "config", error: "Service account inválido" };
  }
  
  if (!impersonate) {
    console.error("❌ GMAIL_IMPERSONATE no configurado");
    return { ok: false, reason: "config", error: "GMAIL_IMPERSONATE no configurado" };
  }
  
  if (!from) {
    console.error("❌ GMAIL_FROM no configurado");
    return { ok: false, reason: "config", error: "GMAIL_FROM no configurado" };
  }

  console.log("   From:", from);
  console.log("   Impersonate:", impersonate);
  console.log("   Service Account Email:", serviceAccount.client_email);

  try {
    console.log("   🔐 Creando JWT auth...");
    console.log("   🔍 Validando private_key:", {
      hasKey: !!serviceAccount.private_key,
      keyLength: serviceAccount.private_key?.length || 0,
      startsWithBegin: serviceAccount.private_key?.startsWith("-----BEGIN") || false,
      endsWithEnd: serviceAccount.private_key?.endsWith("-----END") || false,
      hasNewlines: serviceAccount.private_key?.includes("\n") || false
    });
    
    const auth = new google.auth.JWT({
      email: serviceAccount.client_email,
      key: serviceAccount.private_key,
      scopes: ["https://www.googleapis.com/auth/gmail.send"],
      subject: impersonate
    });

    console.log("   ✅ JWT auth creado");

    // Intentar obtener token para verificar autenticación
    try {
      const token = await auth.getAccessToken();
      console.log("   ✅ Token obtenido exitosamente");
    } catch (tokenErr) {
      console.error("   ❌ Error obteniendo token:", {
        message: tokenErr.message,
        code: tokenErr.code
      });
      
      if (tokenErr.message?.includes("invalid_grant")) {
        console.error("   💡 SOLUCIÓN: Verifica que el service account tenga 'Domain-wide delegation' habilitado");
        console.error("   💡 SOLUCIÓN: Verifica que el usuario impersonado tenga permisos de delegación");
      } else if (tokenErr.message?.includes("delegation denied")) {
        console.error("   💡 SOLUCIÓN: El usuario", impersonate, "no tiene permisos de delegación");
        console.error("   💡 SOLUCIÓN: Ve a Google Workspace Admin > Security > API Controls > Domain-wide Delegation");
      }
      
      return { ok: false, reason: "auth", error: tokenErr.message };
    }

    const gmail = google.gmail({ version: "v1", auth });
    const body = html || text || "";
    const isHtml = Boolean(html);
    const contentType = isHtml ? "text/html" : "text/plain";

    const fromName = "SWARCO Traffic Spain";
    const rawMessage = [
      `From: ${fromName} <${from}>`,
      `To: ${to}`,
      `Subject: ${subject}`,
      "MIME-Version: 1.0",
      `Content-Type: ${contentType}; charset=UTF-8`,
      "",
      body
    ].join("\r\n");

    const encodedMessage = Buffer.from(rawMessage)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    console.log("   📤 Enviando mensaje a Gmail API...");
    
    const result = await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw: encodedMessage }
    });
    
    console.log("   ✅ Email enviado exitosamente:", result.data?.id || "OK");
    return { ok: true, messageId: result.data?.id };
  } catch (err) {
    console.error("❌ Gmail API error completo:", {
      message: err.message,
      code: err.code,
      response: err.response?.data,
      status: err.response?.status,
      stack: err.stack?.split("\n").slice(0, 10).join("\n")
    });
    
    // Errores comunes de Gmail API con soluciones
    let errorDetail = err.message;
    if (err.message?.includes("DECODER") || err.message?.includes("1E08010C") || err.message?.includes("unsupported")) {
      console.error("   💡 SOLUCIÓN: Error de decodificación del private_key.");
      console.error("   💡 SOLUCIÓN: El private_key debe estar en formato PEM (texto plano, no base64).");
      console.error("   💡 SOLUCIÓN: Debe empezar con '-----BEGIN PRIVATE KEY-----' y terminar con '-----END PRIVATE KEY-----'.");
      console.error("   💡 SOLUCIÓN: Los saltos de línea deben ser reales (\\n), no literales (\\\\n).");
      console.error("   💡 SOLUCIÓN: Verifica que GMAIL_SERVICE_ACCOUNT_JSON tenga el formato correcto.");
      errorDetail = "DECODER error - private_key mal formateado. Debe ser PEM válido.";
    } else if (err.message?.includes("invalid_grant")) {
      console.error("   💡 SOLUCIÓN: Token inválido o expirado.");
      console.error("   💡 SOLUCIÓN: Verifica que el service account tenga 'Domain-wide delegation' habilitado");
      console.error("   💡 SOLUCIÓN: Verifica que el private_key esté correctamente formateado");
      errorDetail = "invalid_grant - Verifica domain-wide delegation";
    } else if (err.message?.includes("insufficient permission") || err.message?.includes("403")) {
      console.error("   💡 SOLUCIÓN: El service account no tiene permisos.");
      console.error("   💡 SOLUCIÓN: Ve a Google Cloud Console > IAM > Service Accounts");
      console.error("   💡 SOLUCIÓN: Habilita 'Domain-wide delegation' y agrega el scope: https://www.googleapis.com/auth/gmail.send");
      errorDetail = "insufficient_permission - Verifica permisos del service account";
    } else if (err.message?.includes("delegation denied")) {
      console.error("   💡 SOLUCIÓN: El usuario impersonado no tiene permisos de delegación.");
      console.error("   💡 SOLUCIÓN: Ve a Google Workspace Admin > Security > API Controls");
      console.error("   💡 SOLUCIÓN: Agrega el Client ID del service account con el scope: https://www.googleapis.com/auth/gmail.send");
      errorDetail = "delegation_denied - Verifica permisos de delegación";
    } else if (err.message?.includes("401") || err.message?.includes("Unauthorized")) {
      console.error("   💡 SOLUCIÓN: Autenticación falló.");
      console.error("   💡 SOLUCIÓN: Verifica que el service account JSON sea válido");
      errorDetail = "unauthorized - Verifica credenciales";
    }
    
    return { ok: false, reason: getMailReason(err), error: errorDetail };
  }
}

export async function sendMail({ to, subject, text, html }) {
  console.log("📬 sendMail llamado:", { to, subject, provider: process.env.MAIL_PROVIDER });
  
  const provider = (process.env.MAIL_PROVIDER || "smtp").toLowerCase();
  
  if (provider === "gmail_api") {
    console.log("   Usando Gmail API");
    const result = await sendViaGmailApi({ to, subject, text, html });
    
    // Si Gmail API falla, intentar SMTP como fallback
    if (!result.ok && (result.reason === "config" || result.reason === "auth")) {
      console.warn("   ⚠️ Gmail API falló, intentando SMTP como fallback...");
      return await sendViaSMTP({ to, subject, text, html });
    }
    
    return result;
  }

  return await sendViaSMTP({ to, subject, text, html });
}

async function sendViaSMTP({ to, subject, text, html }) {
  console.log("   Usando SMTP");
  const transporter = getTransporter();
  if (!transporter) {
    console.error("❌ No se pudo crear transporter SMTP - SMTP_HOST no configurado");
    return { ok: false, reason: "conexion", error: "SMTP_HOST no configurado" };
  }

  const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER;
  if (!fromEmail) {
    console.error("❌ SMTP_FROM o SMTP_USER no configurado");
    return { ok: false, reason: "conexion", error: "SMTP_FROM no configurado" };
  }

  const from = `SWARCO Traffic Spain <${fromEmail}>`;
  console.log("   SMTP config:", {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.SMTP_USER,
    from: fromEmail
  });

  const timeoutMs = 10000; // Aumentado a 10 segundos
  const timeoutPromise = new Promise((resolve) => {
    setTimeout(() => {
      console.error("❌ SMTP timeout después de", timeoutMs, "ms");
      resolve({ ok: false, reason: "conexion", error: "Timeout" });
    }, timeoutMs);
  });

  try {
    const sendPromise = transporter
      .sendMail({ from, to, subject, text, html })
      .then((info) => {
        console.log("✅ SMTP email enviado:", info.messageId);
        return { ok: true, messageId: info.messageId };
      })
      .catch((err) => {
        console.error("❌ SMTP error completo:", {
          message: err.message,
          code: err.code,
          command: err.command,
          response: err.response
        });
        return { ok: false, reason: getMailReason(err), error: err.message };
      });

    return await Promise.race([sendPromise, timeoutPromise]);
  } catch (err) {
    console.error("❌ SMTP error inesperado:", err.message);
    return { ok: false, reason: getMailReason(err), error: err.message };
  }
}
