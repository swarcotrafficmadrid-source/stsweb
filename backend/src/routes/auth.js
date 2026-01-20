import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Router } from "express";
import { User } from "../models/index.js";

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
    const user = await User.create({
      usuario,
      nombre,
      email,
      passwordHash: hash
    });

    return res.json({ id: user.id });
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

export default router;
