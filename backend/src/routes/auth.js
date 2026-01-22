import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Router } from "express";
import { User } from "../models/index.js";
import { sendMail } from "../utils/mailer.js";
import { requireAuth } from "../middleware/auth.js";
import crypto from "crypto";

const router = Router();

router.post("/register", async (req, res) => {
  const nombreRaw = (req.body.nombre || "").trim();
  const apellidosRaw = (req.body.apellidos || "").trim();
  const emailRaw = (req.body.email || "").trim();
  const empresaRaw = (req.body.empresa || "").trim();
  const paisRaw = (req.body.pais || "").trim();
  const telefonoRaw = (req.body.telefono || "").trim();
  const cargoRaw = (req.body.cargo || "").trim();
  const password = req.body.password;

  const nombre = nombreRaw;
  const apellidos = apellidosRaw;
  const email = emailRaw;
  const usuario = emailRaw;
  const empresa = empresaRaw;
  const pais = paisRaw;
  const telefono = telefonoRaw;
  const cargo = cargoRaw;

  const emailOk = /.+@.+\..+/.test(email);
  if (!nombre || !apellidos || !email || !empresa || !pais || !telefono || !cargo || !password || !emailOk) {
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
      apellidos,
      email,
      empresa,
      pais,
      telefono,
      cargo,
      passwordHash: hash,
      emailVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpiresAt: verificationExpires
    });

    const verifyBase = process.env.VERIFY_BASE_URL || "http://localhost:3000";
    const verifyUrl = `${verifyBase}/activate?token=${verificationToken}`;
    const mailResult = await sendMail({
      to: user.email,
      subject: "Activa tu cuenta en SWARCO Traffic Spain",
      text: `Hola ${user.nombre},\n\nGracias por registrarte en el Portal SWARCO Traffic Spain.\n\nRevisa y valida tus datos aquí:\n${verifyUrl}\n\nSi no solicitaste este registro, ignora este mensaje.\n`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #485258;">
          <h2 style="color: #006BAB; margin-bottom: 8px;">Portal SWARCO Traffic Spain</h2>
          <p>Hola ${user.nombre},</p>
          <p>Gracias por registrarte. Por favor revisa tus datos y valida tu cuenta:</p>
          <p><a href="${verifyUrl}" style="background: #006BAB; color: white; padding: 10px 16px; text-decoration: none; border-radius: 999px; display: inline-block;">Revisar y activar cuenta</a></p>
          <p style="font-size: 12px; color: #B5BEC2;">Si no solicitaste este registro, ignora este mensaje.</p>
        </div>
      `
    });

    if (mailResult?.ok) {
      await user.update({ emailWelcomeSentAt: new Date() });
    }

    return res.json({ id: user.id, mailSent: mailResult?.ok, mailReason: mailResult?.reason || null });
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

router.get("/me", requireAuth, async (req, res) => {
  const user = await User.findByPk(req.user.id);
  if (!user) {
    return res.status(404).json({ error: "Usuario no encontrado" });
  }
  return res.json({
    id: user.id,
    nombre: user.nombre,
    apellidos: user.apellidos || "",
    email: user.email,
    empresa: user.empresa || "",
    pais: user.pais || "",
    telefono: user.telefono || "",
    cargo: user.cargo || ""
  });
});

router.put("/me", requireAuth, async (req, res) => {
  const nombre = (req.body.nombre || "").trim();
  const apellidos = (req.body.apellidos || "").trim();
  const empresa = (req.body.empresa || "").trim();
  const pais = (req.body.pais || "").trim();
  const telefono = (req.body.telefono || "").trim();
  const cargo = (req.body.cargo || "").trim();

  if (!nombre || !apellidos || !empresa || !pais || !telefono || !cargo) {
    return res.status(400).json({ error: "Datos incompletos" });
  }

  const user = await User.findByPk(req.user.id);
  if (!user) {
    return res.status(404).json({ error: "Usuario no encontrado" });
  }

  await user.update({ nombre, apellidos, empresa, pais, telefono, cargo });

  return res.json({
    ok: true,
    user: {
      id: user.id,
      nombre: user.nombre,
      apellidos: user.apellidos || "",
      email: user.email,
      empresa: user.empresa || "",
      pais: user.pais || "",
      telefono: user.telefono || "",
      cargo: user.cargo || ""
    }
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

router.get("/verify-info", async (req, res) => {
  const token = (req.query.token || "").toString();
  if (!token) {
    return res.status(400).json({ error: "Token inválido" });
  }
  const user = await User.findOne({ where: { emailVerificationToken: token } });
  if (!user || !user.emailVerificationExpiresAt) {
    return res.status(400).json({ error: "Token inválido" });
  }
  if (user.emailVerificationExpiresAt.getTime() < Date.now()) {
    return res.status(400).json({ error: "Token expirado" });
  }
  return res.json({
    nombre: user.nombre,
    apellidos: user.apellidos || "",
    email: user.email,
    empresa: user.empresa || "",
    pais: user.pais || "",
    telefono: user.telefono || "",
    cargo: user.cargo || ""
  });
});

router.post("/verify-confirm", async (req, res) => {
  const token = (req.body.token || "").toString();
  const nombre = (req.body.nombre || "").trim();
  const apellidos = (req.body.apellidos || "").trim();
  const empresa = (req.body.empresa || "").trim();
  const pais = (req.body.pais || "").trim();
  const telefono = (req.body.telefono || "").trim();
  const cargo = (req.body.cargo || "").trim();

  if (!token || !nombre || !apellidos || !empresa || !pais || !telefono || !cargo) {
    return res.status(400).json({ error: "Datos incompletos" });
  }
  const user = await User.findOne({ where: { emailVerificationToken: token } });
  if (!user || !user.emailVerificationExpiresAt) {
    return res.status(400).json({ error: "Token inválido" });
  }
  if (user.emailVerificationExpiresAt.getTime() < Date.now()) {
    return res.status(400).json({ error: "Token expirado" });
  }

  await user.update({
    nombre,
    apellidos,
    empresa,
    pais,
    telefono,
    cargo,
    emailVerified: true,
    emailVerificationToken: null,
    emailVerificationExpiresAt: null
  });

  return res.json({ ok: true });
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

  const resetBase = process.env.RESET_BASE_URL || "http://localhost:3000/reset";
  const resetUrl = `${resetBase}?token=${resetToken}`;
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
  const resetBase = process.env.RESET_BASE_URL || "http://localhost:3000/reset";
  return res.redirect(`${resetBase}?token=${token}`);
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
  return res.json({ ok: true, message: "Contraseña actualizada. Ya puedes iniciar sesión." });
});

export default router;
