import bcrypt from "bcryptjs";
import { User, sequelize } from "../models/index.js";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno
dotenv.config({ path: join(__dirname, "../../../.env") });

async function createSATUser(email, password, nombre, apellidos, role = "sat_admin") {
  try {
    await sequelize.authenticate();
    console.log("✓ Conectado a la base de datos");

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      console.log(`⚠️  El usuario ${email} ya existe`);
      
      // Actualizar su rol a SAT si no lo es
      if (existingUser.userRole !== role) {
        existingUser.userRole = role;
        existingUser.emailVerified = true;
        await existingUser.save();
        console.log(`✓ Usuario actualizado a rol: ${role}`);
      }
      
      return existingUser;
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
      emailVerified: true, // Pre-verificado
      activo: true
    });

    console.log(`✓ Usuario SAT creado exitosamente:`);
    console.log(`  Email: ${email}`);
    console.log(`  Rol: ${role}`);
    console.log(`  Password: ${password}`);
    
    return user;
  } catch (error) {
    console.error("❌ Error creando usuario SAT:", error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Ejecutar script
const args = process.argv.slice(2);

if (args.length < 4) {
  console.log(`
📋 Uso: node createSATUser.js <email> <password> <nombre> <apellidos> [role]

Ejemplos:
  node createSATUser.js admin@swarco.com Admin123! Juan "García López"
  node createSATUser.js tech@swarco.com Tech123! María "Rodríguez" sat_technician

Roles disponibles:
  - sat_admin (por defecto)
  - sat_technician
  `);
  process.exit(1);
}

const [email, password, nombre, apellidos, role = "sat_admin"] = args;

createSATUser(email, password, nombre, apellidos, role)
  .then(() => {
    console.log("\n✅ ¡Listo! Ya puedes acceder al Panel SAT en:");
    console.log("   https://staging.swarcotrafficspain.com/#sat\n");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Error:", error.message);
    process.exit(1);
  });
