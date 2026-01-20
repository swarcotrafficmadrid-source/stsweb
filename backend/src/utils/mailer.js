import nodemailer from "nodemailer";

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
    auth
  });
}

export async function sendMail({ to, subject, text, html }) {
  const transporter = getTransporter();
  if (!transporter) {
    return false;
  }

  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  if (!from) {
    return false;
  }

  try {
    await transporter.sendMail({
      from,
      to,
      subject,
      text,
      html
    });
    return true;
  } catch (err) {
    console.error("SMTP error:", err.message);
    return false;
  }
}
