import { Router } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/index.js";

const router = Router();

// Ruta protegida para crear usuarios SAT (solo con admin key)
router.post("/create-sat-user", async (req, res) => {
  try {
    const { adminKey, email, password, nombre, apellidos, role = "sat_admin" } = req.body;

    // Verificar admin key
    const expectedKey = process.env.ADMIN_SECRET_KEY || "CHANGE_THIS_IN_PRODUCTION";
    if (adminKey !== expectedKey) {
      return res.status(403).json({ error: "Clave de administrador inválida" });
    }

    // Validar datos
    if (!email || !password || !nombre || !apellidos) {
      return res.status(400).json({ error: "Datos incompletos" });
    }

    if (!["sat_admin", "sat_technician"].includes(role)) {
      return res.status(400).json({ error: "Rol inválido" });
    }

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      // Actualizar su rol a SAT y su contraseña
      const hash = await bcrypt.hash(password, 10);
      existingUser.passwordHash = hash;
      existingUser.userRole = role;
      existingUser.emailVerified = true;
      existingUser.activo = true;
      await existingUser.save();
      
      return res.json({
        success: true,
        message: "Usuario actualizado a rol SAT (con nueva contraseña)",
        user: {
          id: existingUser.id,
          email: existingUser.email,
          nombre: existingUser.nombre,
          apellidos: existingUser.apellidos,
          userRole: existingUser.userRole
        }
      });
    }

    // Crear nuevo usuario SAT
    const hash = await bcrypt.hash(password, 10);
    
    const user = await User.create({
      usuario: email,
      nombre,
      apellidos,
      email,
      passwordHash: hash,
      empresa: "SWARCO Traffic Spain",
      pais: "España",
      telefono: "+34 000 000 000",
      cargo: role === "sat_admin" ? "Administrador SAT" : "Técnico SAT",
      userRole: role,
      emailVerified: true,
      activo: true
    });

    res.json({
      success: true,
      message: "Usuario SAT creado exitosamente",
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        apellidos: user.apellidos,
        userRole: user.userRole
      },
      accessUrl: "https://staging.swarcotrafficspain.com/#sat"
    });
  } catch (error) {
    console.error("Error creating SAT user:", error);
    res.status(500).json({ error: "Error al crear usuario SAT" });
  }
});

// Ruta para listar usuarios SAT (solo con admin key)
router.post("/list-sat-users", async (req, res) => {
  try {
    const { adminKey } = req.body;

    const expectedKey = process.env.ADMIN_SECRET_KEY || "CHANGE_THIS_IN_PRODUCTION";
    if (adminKey !== expectedKey) {
      return res.status(403).json({ error: "Clave de administrador inválida" });
    }

    const satUsers = await User.findAll({
      where: {
        userRole: ["sat_admin", "sat_technician"]
      },
      attributes: ["id", "email", "nombre", "apellidos", "userRole", "activo", "createdAt"],
      order: [["createdAt", "DESC"]]
    });

    res.json({
      success: true,
      users: satUsers
    });
  } catch (error) {
    console.error("Error listing SAT users:", error);
    res.status(500).json({ error: "Error al listar usuarios SAT" });
  }
});

export default router;
