import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Router } from "express";
import { User } from "../models/index.js";
import { sendMail } from "../utils/mailer.js";
import crypto from "crypto";

const router = Router();

router.post("/register", async (req, res) => {
  const nombreRaw = (req.body.nombre || "").trim();
  const emailRaw = (req.body.email || "").trim();
  const password = req.body.password;

  const nombre = nombreRaw;
  const email = emailRaw;
  const usuario = emailRaw;

  if (!nombre || !email || !password) {
    return res.status(400).json({ error: "Datos incompletos" });
  }

  const existsEmail = await User.findOne({ where: { email } });
  if (existsEmail) {
    return res.status(409).json({ error: "Email ya registrado" });
  }
  const existsUser = await User.findOne({ where: { usuario } });
  if (existsUser) {
    return res.status(409).json({ error: "Usuario ya registrado" });
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationExpires = new Date(Date.now() + 1000 * 60 * 60 * 24);
    const user = await User.create({
      usuario,
      nombre,
      email,
      passwordHash: hash,
      emailVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpiresAt: verificationExpires
    });

    const verifyBase = process.env.VERIFY_BASE_URL || "http://localhost:8080";
    const verifyUrl = `${verifyBase}/api/auth/verify?token=${verificationToken}`;
    const mailSent = await sendMail({
      to: user.email,
      subject: "Activa tu cuenta en SWARCO Ops Portal",
      text: `Hola ${user.nombre},\n\nActiva tu cuenta aquí:\n${verifyUrl}\n\nSi no solicitaste este registro, ignora este mensaje.\n`,
      html: `<p>Hola ${user.nombre},</p><p>Activa tu cuenta aquí:</p><p><a href="${verifyUrl}">Activar cuenta</a></p><p>Si no solicitaste este registro, ignora este mensaje.</p>`
    });

    if (mailSent) {
      await user.update({ emailWelcomeSentAt: new Date() });
    }

    return res.json({ id: user.id, mailSent });
  } catch (err) {
    return res.status(409).json({ error: "Usuario o email duplicado" });
  }
});

router.post("/login", async (req, res) => {
  const { identifier, password } = req.body;
  if (!identifier || !password) {
    return res.status(400).json({ error: "Datos incompletos" });
  }

  const user = await User.findOne({
    where: { email: identifier }
  }) || await User.findOne({ where: { usuario: identifier } });

  if (!user) {
    return res.status(401).json({ error: "Credenciales inválidas" });
  }
  if (!user.emailVerified) {
    return res.status(403).json({ error: "Cuenta no verificada" });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return res.status(401).json({ error: "Credenciales inválidas" });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, rol: user.rol },
    process.env.JWT_SECRET,
    { expiresIn: "8h" }
  );

  return res.json({
    token,
    user: { id: user.id, email: user.email, usuario: user.usuario, rol: user.rol }
  });
});

router.get("/verify", async (req, res) => {
  const token = (req.query.token || "").toString();
  if (!token) {
    return res.status(400).send("Token inválido");
  }

  const user = await User.findOne({ where: { emailVerificationToken: token } });
  if (!user || !user.emailVerificationExpiresAt) {
    return res.status(400).send("Token inválido");
  }
  if (user.emailVerificationExpiresAt.getTime() < Date.now()) {
    return res.status(400).send("Token expirado");
  }

  await user.update({
    emailVerified: true,
    emailVerificationToken: null,
    emailVerificationExpiresAt: null
  });

  return res.send("Cuenta verificada. Ya puedes iniciar sesión.");
});

router.post("/forgot", async (req, res) => {
  const email = (req.body.email || "").trim();
  if (!email) {
    return res.status(400).json({ error: "Datos incompletos" });
  }

  const user = await User.findOne({ where: { email } });
  if (!user) {
    return res.json({ ok: true });
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetExpires = new Date(Date.now() + 1000 * 60 * 60);
  await user.update({
    resetPasswordToken: resetToken,
    resetPasswordExpiresAt: resetExpires
  });

  const resetBase = process.env.RESET_BASE_URL || "http://localhost:8080";
  const resetUrl = `${resetBase}/api/auth/reset?token=${resetToken}`;
  await sendMail({
    to: user.email,
    subject: "Recupera tu contraseña - SWARCO Traffic Spain",
    text: `Hola ${user.nombre},\n\nPara restablecer tu contraseña, entra aquí:\n${resetUrl}\n\nSi no solicitaste este cambio, ignora este mensaje.\n`,
    html: `<p>Hola ${user.nombre},</p><p>Para restablecer tu contraseña, entra aquí:</p><p><a href="${resetUrl}">Restablecer contraseña</a></p><p>Si no solicitaste este cambio, ignora este mensaje.</p>`
  });

  return res.json({ ok: true });
});

router.get("/reset", async (req, res) => {
  const token = (req.query.token || "").toString();
  if (!token) {
    return res.status(400).send("Token inválido");
  }
  return res.send(`
    <html>
      <head><meta charset="utf-8"><title>Restablecer contraseña</title></head>
      <body style="font-family: Arial, sans-serif; padding: 24px;">
        <h2>Restablecer contraseña</h2>
        <form method="POST" action="/api/auth/reset">
          <input type="hidden" name="token" value="${token}" />
          <div style="margin-bottom: 12px;">
            <label>Nueva contraseña</label><br/>
            <input type="password" name="password" style="padding:8px; width: 280px;" required />
          </div>
          <button type="submit" style="padding:8px 16px;">Guardar</button>
        </form>
      </body>
    </html>
  `);
});

router.post("/reset", async (req, res) => {
  const token = (req.body.token || "").toString();
  const password = req.body.password;
  if (!token || !password) {
    return res.status(400).send("Datos incompletos");
  }
  const user = await User.findOne({ where: { resetPasswordToken: token } });
  if (!user || !user.resetPasswordExpiresAt) {
    return res.status(400).send("Token inválido");
  }
  if (user.resetPasswordExpiresAt.getTime() < Date.now()) {
    return res.status(400).send("Token expirado");
  }
  const hash = await bcrypt.hash(password, 10);
  await user.update({
    passwordHash: hash,
    resetPasswordToken: null,
    resetPasswordExpiresAt: null
  });
  return res.send("Contraseña actualizada. Ya puedes iniciar sesión.");
});

export default router;
