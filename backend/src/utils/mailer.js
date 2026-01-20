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
    return null;
  }
  try {
    if (raw.trim().startsWith("{")) {
      return JSON.parse(raw);
    }
    const decoded = Buffer.from(raw, "base64").toString("utf8");
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

async function sendViaGmailApi({ to, subject, text, html }) {
  const serviceAccount = parseServiceAccount();
  const impersonate = process.env.GMAIL_IMPERSONATE;
  const from = process.env.GMAIL_FROM || impersonate;

  if (!serviceAccount || !impersonate || !from) {
    return false;
  }

  const auth = new google.auth.JWT({
    email: serviceAccount.client_email,
    key: serviceAccount.private_key,
    scopes: ["https://www.googleapis.com/auth/gmail.send"],
    subject: impersonate
  });

  const gmail = google.gmail({ version: "v1", auth });
  const body = html || text || "";
  const isHtml = Boolean(html);
  const contentType = isHtml ? "text/html" : "text/plain";

  const rawMessage = [
    `From: ${from}`,
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

  try {
    await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw: encodedMessage }
    });
    return true;
  } catch (err) {
    console.error("Gmail API error:", err.message);
    return false;
  }
}

export async function sendMail({ to, subject, text, html }) {
  const provider = (process.env.MAIL_PROVIDER || "smtp").toLowerCase();
  if (provider === "gmail_api") {
    return sendViaGmailApi({ to, subject, text, html });
  }

  const transporter = getTransporter();
  if (!transporter) {
    return false;
  }

  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  if (!from) {
    return false;
  }

  const timeoutMs = 6000;
  const timeoutPromise = new Promise((resolve) => {
    setTimeout(() => resolve(false), timeoutMs);
  });

  try {
    const sendPromise = transporter
      .sendMail({ from, to, subject, text, html })
      .then(() => true)
      .catch((err) => {
        console.error("SMTP error:", err.message);
        return false;
      });

    return await Promise.race([sendPromise, timeoutPromise]);
  } catch (err) {
    console.error("SMTP error:", err.message);
    return false;
  }
}
