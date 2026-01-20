import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Router } from "express";
import { User } from "../models/index.js";
import { sendMail } from "../utils/mailer.js";
import crypto from "crypto";

const router = Router();

router.post("/register", async (req, res) => {
  const usuarioRaw = (req.body.usuario || "").trim();
  const nombreRaw = (req.body.nombre || "").trim();
  const emailRaw = (req.body.email || "").trim();
  const password = req.body.password;

  const usuario = usuarioRaw;
  const nombre = nombreRaw;
  const email = emailRaw;

  if (!usuario || !nombre || !email || !password) {
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

export default router;
