import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Router } from "express";
import { User } from "../models/index.js";
import { sendMail } from "../utils/mailer.js";
import { requireAuth } from "../middleware/auth.js";
import { loginLimiter, registerLimiter } from "../middleware/rateLimiter.js";
import crypto from "crypto";

const router = Router();

router.post("/register", registerLimiter, async (req, res) => {
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

  // Validación más detallada
  const emailOk = /.+@.+\..+/.test(email);
  const missingFields = [];
  if (!nombre || nombre.length === 0) missingFields.push("nombre");
  if (!apellidos || apellidos.length === 0) missingFields.push("apellidos");
  if (!email || email.length === 0) missingFields.push("email");
  if (!empresa || empresa.length === 0) missingFields.push("empresa");
  if (!pais || pais.length === 0) missingFields.push("pais");
  if (!telefono || telefono.length === 0) missingFields.push("telefono");
  if (!cargo || cargo.length === 0) missingFields.push("cargo");
  if (!password || password.length === 0) missingFields.push("password");
  if (!emailOk) missingFields.push("email (formato inválido)");

  if (missingFields.length > 0) {
    return res.status(400).json({ 
      error: "Datos incompletos o inválidos",
      missingFields: missingFields 
    });
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
    // Crear usuario NO verificado - requiere verificación de email
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
      emailVerificationToken: verificationToken,
      emailVerificationExpiresAt: verificationExpires,
      activo: true  // Usuario activo pero requiere verificación de email
    });

    // Intentar establecer emailVerified: false si la columna existe
    try {
      await user.update({ 
        emailVerified: false,  // NO verificado - requiere verificación
        emailWelcomeSentAt: new Date()
      });
      console.log("✅ Usuario creado - requiere verificación de email");
    } catch (err) {
      // Si la columna no existe, ignorar el error
      if (!err.message.includes("emailVerified")) {
        throw err; // Re-lanzar si es otro error
      }
      console.log("✅ Usuario creado (columna emailVerified no existe, usando solo activo)");
    }

    // Enviar correo en background (no bloquea la respuesta)
    const verifyBase = process.env.VERIFY_BASE_URL || "http://localhost:3000";
    const verifyUrl = `${verifyBase}/activate?token=${verificationToken}`;
    
    // Enviar correo sin await - no esperar respuesta
    sendMail({
      to: user.email,
      subject: "Bienvenido - Portal SWARCO Traffic Spain",
      text: `Hola ${user.nombre},\n\nGracias por registrarte en el Portal SWARCO Traffic Spain.\n\nPara completar tu registro y activar tu cuenta, debes verificar tu dirección de email haciendo clic en el siguiente enlace:\n${verifyUrl}\n\nEste enlace es válido por 24 horas.\n\nUna vez verificado tu email, podrás iniciar sesión y acceder a todas las funcionalidades del portal.\n\nSaludos,\nEquipo SWARCO Traffic Spain\nwww.swarco.com`,
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
                        Gracias por registrarte en nuestro portal de soporte. Para completar tu registro y activar tu cuenta, <strong>debes verificar tu dirección de email</strong> haciendo clic en el botón de abajo.
                      </p>
                      <p style="margin: 0 0 20px 0; color: #555555; font-size: 15px; line-height: 1.6;">
                        Una vez verificado tu email, podrás iniciar sesión y acceder a todas las funcionalidades del portal.
                      </p>
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding: 20px 0;">
                            <a href="${verifyUrl}" style="background-color: #006BAB; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 50px; font-size: 16px; font-weight: 600; display: inline-block;">Verificar mi email</a>
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
    }).then(mailResult => {
      if (mailResult?.ok) {
        console.log("✅ Email de bienvenida enviado exitosamente a:", user.email);
      } else {
        console.warn("⚠️ Email de bienvenida NO se pudo enviar (no crítico):", {
          userId: user.id,
          email: user.email,
          reason: mailResult?.reason || "unknown"
        });
      }
    }).catch(err => {
      console.error("❌ Error enviando email de bienvenida (no crítico):", err.message);
    });

    return res.json({ 
      id: user.id, 
      mailSent: true, // Siempre true porque no esperamos respuesta
      message: "Usuario registrado. Por favor, verifica tu email para activar tu cuenta. Revisa tu bandeja de entrada.",
      requiresVerification: true
    });
  } catch (err) {
    console.error("Error en registro:", err);
    
    // Manejar errores específicos de Sequelize
    if (err.name === "SequelizeUniqueConstraintError") {
      const field = err.errors?.[0]?.path || "campo";
      if (field === "email" || field === "usuarios.email") {
        return res.status(409).json({ error: "Email ya registrado" });
      }
      if (field === "usuario" || field === "usuarios.usuario") {
        return res.status(409).json({ error: "Usuario ya registrado" });
      }
      return res.status(409).json({ error: `El ${field} ya está en uso` });
    }
    
    // Manejar errores de validación
    if (err.name === "SequelizeValidationError") {
      const messages = err.errors?.map(e => e.message).join(", ") || "Error de validación";
      return res.status(400).json({ error: messages });
    }
    
    // Manejar errores de base de datos
    if (err.name === "SequelizeDatabaseError") {
      console.error("Error de base de datos:", err.message);
      return res.status(500).json({ error: "Error de base de datos. Por favor, intenta más tarde." });
    }
    
    // Error genérico
    return res.status(500).json({ error: "Error al crear usuario. Por favor, intenta más tarde." });
  }
});

router.post("/login", loginLimiter, async (req, res) => {
  try {
    const { identifier, password } = req.body;
    console.log("[LOGIN] Intento de login:", { identifier: identifier?.substring(0, 10) + "..." });
    
    if (!identifier || !password) {
      console.log("[LOGIN] Error: Datos incompletos");
      return res.status(400).json({ error: "Datos incompletos" });
    }

    const user = await User.findOne({
      where: { email: identifier }
    }) || await User.findOne({ where: { usuario: identifier } });

    if (!user) {
      console.log("[LOGIN] Error: Usuario no encontrado para:", identifier);
      return res.status(401).json({ error: "Credenciales inválidas" });
    }
    
    console.log("[LOGIN] Usuario encontrado:", { 
      id: user.id, 
      email: user.email, 
      activo: user.activo,
      userRole: user.userRole 
    });
    
    // Verificar si el usuario está activo
    if (user.activo === false) {
      console.log("[LOGIN] Error: Usuario inactivo");
      return res.status(403).json({ error: "Cuenta inactiva" });
    }
    
    // Verificar si el email está verificado (si la columna existe)
    try {
      const emailVerified = user.emailVerified;
      if (emailVerified === false) {
        console.log("[LOGIN] Error: Email no verificado para:", user.email);
        return res.status(403).json({ 
          error: "Email no verificado. Por favor, verifica tu email antes de iniciar sesión.",
          requiresVerification: true
        });
      }
    } catch (err) {
      // Si la columna no existe, continuar (compatibilidad con BD sin emailVerified)
      console.log("[LOGIN] Columna emailVerified no existe, continuando sin verificación");
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      console.log("[LOGIN] Error: Contraseña incorrecta");
      return res.status(401).json({ error: "Credenciales inválidas" });
    }
    
    console.log("[LOGIN] ✅ Login exitoso para:", user.email);

    const token = jwt.sign(
      { id: user.id, email: user.email, nombre: user.nombre, apellidos: user.apellidos, rol: user.rol, userRole: user.userRole },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    return res.json({
      token,
      user: { id: user.id, email: user.email, usuario: user.usuario, nombre: user.nombre, apellidos: user.apellidos, rol: user.rol, userRole: user.userRole }
    });
  } catch (err) {
    console.error("Error en login:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
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
    return res.status(400).json({ error: "Token inválido" });
  }

  const user = await User.findOne({ where: { emailVerificationToken: token } });
  if (!user || !user.emailVerificationExpiresAt) {
    return res.status(400).json({ error: "Token inválido o ya utilizado" });
  }
  if (user.emailVerificationExpiresAt.getTime() < Date.now()) {
    return res.status(400).json({ error: "Token expirado. Por favor, solicita un nuevo enlace de verificación." });
  }

  // Actualizar emailVerified si la columna existe
  try {
    await user.update({
      emailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpiresAt: null
    });
    console.log("✅ Email verificado exitosamente para:", user.email);
  } catch (err) {
    // Si la columna emailVerified no existe, solo limpiar el token
    if (err.message.includes("emailVerified")) {
      await user.update({
        emailVerificationToken: null,
        emailVerificationExpiresAt: null
      });
      console.log("✅ Token de verificación limpiado (columna emailVerified no existe)");
    } else {
      throw err;
    }
  }

  return res.json({ 
    success: true,
    message: "Cuenta verificada exitosamente. Ya puedes iniciar sesión.",
    email: user.email
  });
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

// Endpoint para reenviar email de verificación
router.post("/resend-verification", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email requerido" });
    }

    const user = await User.findOne({ where: { email: email.toLowerCase().trim() } });
    if (!user) {
      // Por seguridad, no revelar si el email existe o no
      return res.json({ 
        success: true,
        message: "Si el email existe y no está verificado, se enviará un nuevo enlace de verificación."
      });
    }

    // Si ya está verificado, no hacer nada
    try {
      if (user.emailVerified === true) {
        return res.json({ 
          success: true,
          message: "Este email ya está verificado. Puedes iniciar sesión."
        });
      }
    } catch (err) {
      // Si la columna no existe, continuar
    }

    // Generar nuevo token de verificación
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationExpires = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 horas

    await user.update({
      emailVerificationToken: verificationToken,
      emailVerificationExpiresAt: verificationExpires
    });

    // Enviar email de verificación
    const verifyBase = process.env.VERIFY_BASE_URL || "http://localhost:3000";
    const verifyUrl = `${verifyBase}/activate?token=${verificationToken}`;

    const mailResult = await sendMail({
      to: user.email,
      subject: "Verifica tu email - Portal SWARCO Traffic Spain",
      text: `Hola ${user.nombre},\n\nHas solicitado un nuevo enlace de verificación para tu cuenta en el Portal SWARCO Traffic Spain.\n\nPara verificar tu email y activar tu cuenta, haz clic en el siguiente enlace:\n${verifyUrl}\n\nEste enlace es válido por 24 horas.\n\nSi no solicitaste este enlace, puedes ignorar este correo.\n\nSaludos,\nEquipo SWARCO Traffic Spain\nwww.swarco.com`,
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
                  <tr>
                    <td style="background-color: #006BAB; padding: 30px 40px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">Verifica tu Email</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 40px;">
                      <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.5;">Hola <strong>${user.nombre}</strong>,</p>
                      <p style="margin: 0 0 20px 0; color: #555555; font-size: 15px; line-height: 1.6;">
                        Has solicitado un nuevo enlace de verificación para tu cuenta.
                      </p>
                      <p style="margin: 0 0 20px 0; color: #555555; font-size: 15px; line-height: 1.6;">
                        Para verificar tu email y activar tu cuenta, haz clic en el botón de abajo:
                      </p>
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding: 20px 0;">
                            <a href="${verifyUrl}" style="background-color: #006BAB; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 50px; font-size: 16px; font-weight: 600; display: inline-block;">Verificar mi email</a>
                          </td>
                        </tr>
                      </table>
                      <p style="margin: 20px 0 0 0; color: #777777; font-size: 14px; line-height: 1.5;">
                        Este enlace es válido por <strong>24 horas</strong>.
                      </p>
                      <p style="margin: 20px 0 0 0; color: #777777; font-size: 13px; line-height: 1.5;">
                        Si no solicitaste este enlace, puedes ignorar este correo de forma segura.
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
      return res.json({ 
        success: true,
        message: "Email de verificación reenviado. Revisa tu bandeja de entrada."
      });
    } else {
      return res.status(500).json({ 
        success: false,
        error: "No se pudo enviar el email de verificación. Intenta más tarde."
      });
    }
  } catch (err) {
    console.error("Error reenviando verificación:", err);
    return res.status(500).json({ error: "Error al procesar la solicitud" });
  }
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

// Endpoint para limpiar rate limit de registro (solo desarrollo)
router.post("/clear-rate-limit", async (req, res) => {
  try {
    const { email } = req.body;
    
    // Solo permitir en desarrollo o con admin key
    const isDev = process.env.NODE_ENV === "development";
    const adminKey = req.body.adminKey;
    const expectedKey = process.env.ADMIN_SECRET_KEY;
    
    if (!isDev && adminKey !== expectedKey) {
      return res.status(403).json({ error: "No autorizado" });
    }
    
    if (email) {
      const { clearRateLimits } = await import("../middleware/rateLimiter.js");
      clearRateLimits(email);
      return res.json({ success: true, message: `Rate limit limpiado para ${email}` });
    } else {
      const { clearRateLimits } = await import("../middleware/rateLimiter.js");
      clearRateLimits();
      return res.json({ success: true, message: "Todos los rate limits limpiados" });
    }
  } catch (err) {
    console.error("Error limpiando rate limit:", err);
    return res.status(500).json({ error: err.message });
  }
});

// Endpoint de prueba para verificar envío de emails
router.post("/test-email", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email requerido" });
    }

    console.log("🧪 TEST EMAIL - Enviando email de prueba a:", email);
    
    // Diagnóstico de configuración
    const config = {
      MAIL_PROVIDER: process.env.MAIL_PROVIDER || "no configurado",
      hasGmailServiceAccount: !!process.env.GMAIL_SERVICE_ACCOUNT_JSON,
      GMAIL_IMPERSONATE: process.env.GMAIL_IMPERSONATE || "no configurado",
      GMAIL_FROM: process.env.GMAIL_FROM || "no configurado",
      hasSMTPHost: !!process.env.SMTP_HOST,
      SMTP_USER: process.env.SMTP_USER || "no configurado"
    };
    
    console.log("   🔍 Configuración:", config);
    
    const mailResult = await sendMail({
      to: email,
      subject: "Email de Prueba - Portal SWARCO",
      text: "Este es un email de prueba. Si recibes esto, el sistema de emails está funcionando correctamente.",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #006BAB;">Email de Prueba</h2>
          <p>Este es un email de prueba. Si recibes esto, el sistema de emails está funcionando correctamente.</p>
          <p><strong>Fecha:</strong> ${new Date().toLocaleString()}</p>
        </div>
      `
    });

    if (mailResult?.ok) {
      return res.json({ 
        success: true, 
        message: "Email de prueba enviado exitosamente",
        messageId: mailResult.messageId,
        config: config
      });
    } else {
      return res.status(500).json({ 
        success: false, 
        message: "No se pudo enviar el email de prueba",
        reason: mailResult?.reason || "unknown",
        error: mailResult?.error || "Error desconocido",
        config: config,
        details: "Revisa los logs del servidor para más detalles"
      });
    }
  } catch (err) {
    console.error("Error en test-email:", err);
    return res.status(500).json({ 
      success: false, 
      error: err.message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined
    });
  }
});

// Endpoint para cambiar rol de usuario a administrador SAT
router.post("/make-admin", async (req, res) => {
  try {
    const { adminKey, email, role = "sat_admin" } = req.body;
    
    // Verificar admin key
    const expectedKey = process.env.ADMIN_SECRET_KEY;
    if (!expectedKey) {
      return res.status(500).json({ error: "Configuración del servidor incorrecta" });
    }
    if (adminKey !== expectedKey) {
      return res.status(403).json({ error: "Clave de administrador inválida" });
    }
    
    // Validar email
    if (!email) {
      return res.status(400).json({ error: "Email requerido" });
    }
    
    // Validar rol
    if (!["sat_admin", "sat_technician"].includes(role)) {
      return res.status(400).json({ error: "Rol inválido. Debe ser 'sat_admin' o 'sat_technician'" });
    }
    
    // Buscar usuario
    const user = await User.findOne({ where: { email: email.toLowerCase().trim() } });
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    
    // Actualizar rol
    await user.update({
      userRole: role,
      emailVerified: true,
      activo: true
    });
    
    return res.json({
      success: true,
      message: `Usuario actualizado a ${role}`,
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        apellidos: user.apellidos,
        userRole: user.userRole
      }
    });
  } catch (err) {
    console.error("Error cambiando rol:", err);
    return res.status(500).json({ error: err.message });
  }
});

// Endpoint de test completo del sistema
router.get("/test-system", async (req, res) => {
  try {
    const { User } = await import("../models/index.js");
    
    const tests = {
      database: false,
      email: false,
      userCreation: false
    };
    
    // Test 1: Base de datos
    try {
      const testUser = await User.findOne({ limit: 1 });
      tests.database = true;
      tests.databaseMessage = "Conexión a BD OK";
    } catch (err) {
      tests.databaseError = err.message;
    }
    
    // Test 2: Email (solo verificar configuración)
    const hasGmailConfig = !!process.env.GMAIL_SERVICE_ACCOUNT_JSON;
    const hasSMTPConfig = !!process.env.SMTP_HOST;
    tests.email = hasGmailConfig || hasSMTPConfig;
    tests.emailConfig = {
      gmail: hasGmailConfig,
      smtp: hasSMTPConfig,
      provider: process.env.MAIL_PROVIDER || "no configurado",
      impersonate: process.env.GMAIL_IMPERSONATE || "no configurado"
    };
    
    // Test 3: Verificar estructura de tabla usuarios
    try {
      const testUser = await User.findOne({ limit: 1 });
      if (testUser) {
        const hasEmailVerified = 'emailVerified' in testUser.dataValues;
        tests.userCreation = {
          canQuery: true,
          hasEmailVerifiedColumn: hasEmailVerified,
          message: hasEmailVerified 
            ? "Columna emailVerified existe" 
            : "Columna emailVerified NO existe (usar solo activo)"
        };
      } else {
        tests.userCreation = { canQuery: true, message: "Tabla vacía" };
      }
    } catch (err) {
      tests.userCreation = { error: err.message };
    }
    
    return res.json({
      ok: true,
      timestamp: new Date().toISOString(),
      tests: tests,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasJWTSecret: !!process.env.JWT_SECRET,
        hasDBConfig: !!(process.env.DB_HOST && process.env.DB_NAME),
        dbHost: process.env.DB_HOST ? "configurado" : "no configurado",
        dbName: process.env.DB_NAME || "no configurado"
      }
    });
  } catch (err) {
    return res.status(500).json({ 
      error: err.message, 
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined 
    });
  }
});

export default router;
