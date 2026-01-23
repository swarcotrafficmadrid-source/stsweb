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
      subject: "Confirma tu registro - Portal SWARCO Traffic Spain",
      text: `Hola ${user.nombre},\n\nGracias por registrarte en el Portal SWARCO Traffic Spain.\n\nPara activar tu cuenta, haz clic en el siguiente enlace:\n${verifyUrl}\n\nEste enlace es válido por 24 horas.\n\nSi no solicitaste este registro, puedes ignorar este correo.\n\nSaludos,\nEquipo SWARCO Traffic Spain\nwww.swarco.com`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background-color: #006BAB; padding: 30px 40px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">Portal SWARCO Traffic Spain</h1>
                      <p style="margin: 8px 0 0 0; color: #ffffff; font-size: 14px; opacity: 0.9;">The better way, every day.</p>
                    </td>
                  </tr>
                  <!-- Body -->
                  <tr>
                    <td style="padding: 40px;">
                      <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.5;">Hola <strong>${user.nombre}</strong>,</p>
                      <p style="margin: 0 0 20px 0; color: #555555; font-size: 15px; line-height: 1.6;">
                        Gracias por registrarte en nuestro portal de soporte. Para completar tu registro y activar tu cuenta, por favor confirma tu correo electrónico.
                      </p>
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding: 20px 0;">
                            <a href="${verifyUrl}" style="background-color: #006BAB; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 50px; font-size: 16px; font-weight: 600; display: inline-block;">Confirmar mi cuenta</a>
                          </td>
                        </tr>
                      </table>
                      <p style="margin: 20px 0 0 0; color: #777777; font-size: 14px; line-height: 1.5;">
                        Este enlace es válido por <strong>24 horas</strong>.
                      </p>
                      <p style="margin: 20px 0 0 0; color: #777777; font-size: 13px; line-height: 1.5;">
                        Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:<br>
                        <a href="${verifyUrl}" style="color: #006BAB; word-break: break-all;">${verifyUrl}</a>
                      </p>
                    </td>
                  </tr>
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 30px 40px; text-align: center; border-top: 1px solid #e0e0e0;">
                      <p style="margin: 0 0 8px 0; color: #999999; font-size: 12px;">
                        Si no solicitaste este registro, puedes ignorar este correo de forma segura.
                      </p>
                      <p style="margin: 8px 0; color: #666666; font-size: 13px; font-weight: 600;">
                        SWARCO Traffic Spain
                      </p>
                      <p style="margin: 0; color: #999999; font-size: 12px;">
                        <a href="https://www.swarco.com" style="color: #006BAB; text-decoration: none;">www.swarco.com</a>
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
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
    subject: "Recuperación de contraseña - Portal SWARCO Traffic Spain",
    text: `Hola ${user.nombre},\n\nHemos recibido una solicitud para restablecer la contraseña de tu cuenta.\n\nPara crear una nueva contraseña, haz clic en el siguiente enlace:\n${resetUrl}\n\nEste enlace es válido por 1 hora.\n\nSi no solicitaste este cambio, puedes ignorar este correo y tu contraseña permanecerá sin cambios.\n\nSaludos,\nEquipo SWARCO Traffic Spain\nwww.swarco.com`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="background-color: #006BAB; padding: 30px 40px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">Portal SWARCO Traffic Spain</h1>
                    <p style="margin: 8px 0 0 0; color: #ffffff; font-size: 14px; opacity: 0.9;">The better way, every day.</p>
                  </td>
                </tr>
                <!-- Body -->
                <tr>
                  <td style="padding: 40px;">
                    <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.5;">Hola <strong>${user.nombre}</strong>,</p>
                    <p style="margin: 0 0 20px 0; color: #555555; font-size: 15px; line-height: 1.6;">
                      Hemos recibido una solicitud para restablecer la contraseña de tu cuenta.
                    </p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 20px 0;">
                          <a href="${resetUrl}" style="background-color: #006BAB; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 50px; font-size: 16px; font-weight: 600; display: inline-block;">Restablecer contraseña</a>
                        </td>
                      </tr>
                    </table>
                    <p style="margin: 20px 0 0 0; color: #777777; font-size: 14px; line-height: 1.5;">
                      Este enlace es válido por <strong>1 hora</strong>.
                    </p>
                    <p style="margin: 20px 0 0 0; color: #777777; font-size: 13px; line-height: 1.5;">
                      Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:<br>
                      <a href="${resetUrl}" style="color: #006BAB; word-break: break-all;">${resetUrl}</a>
                    </p>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8f9fa; padding: 30px 40px; text-align: center; border-top: 1px solid #e0e0e0;">
                    <p style="margin: 0 0 8px 0; color: #999999; font-size: 12px;">
                      Si no solicitaste este cambio, puedes ignorar este correo y tu contraseña permanecerá sin cambios.
                    </p>
                    <p style="margin: 8px 0; color: #666666; font-size: 13px; font-weight: 600;">
                      SWARCO Traffic Spain
                    </p>
                    <p style="margin: 0; color: #999999; font-size: 12px;">
                      <a href="https://www.swarco.com" style="color: #006BAB; text-decoration: none;">www.swarco.com</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
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
