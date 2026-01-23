import { sequelize, ApiKey } from "../models/index.js";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

/**
 * Script para crear API Keys para integración externa
 * 
 * USO:
 * node src/scripts/createApiKey.js "Jira Integration" read,write
 * node src/scripts/createApiKey.js "ERP System" read,write,delete 365
 * 
 * Argumentos:
 * 1. Nombre de la API Key (requerido)
 * 2. Permisos separados por coma: read,write,delete (requerido)
 * 3. Días hasta expiración (opcional, default: sin expiración)
 */

async function createApiKey() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error(`
❌ USO INCORRECTO

Uso: node src/scripts/createApiKey.js "Nombre" "permisos" [días]

Ejemplos:
  node src/scripts/createApiKey.js "Jira Integration" "read,write"
  node src/scripts/createApiKey.js "ERP System" "read,write,delete" 365
  node src/scripts/createApiKey.js "Read Only" "read" 30

Permisos disponibles: read, write, delete
    `);
    process.exit(1);
  }

  const name = args[0];
  const permissionsStr = args[1];
  const expirationDays = args[2] ? parseInt(args[2]) : null;

  const permissions = permissionsStr.split(",").map(p => p.trim());
  const validPermissions = ["read", "write", "delete"];
  
  for (const perm of permissions) {
    if (!validPermissions.includes(perm)) {
      console.error(`❌ Permiso inválido: ${perm}`);
      console.error(`Permisos válidos: ${validPermissions.join(", ")}`);
      process.exit(1);
    }
  }

  try {
    await sequelize.authenticate();
    console.log("✅ Conectado a la base de datos\n");

    // Generar API Key única
    const apiKey = crypto.randomBytes(32).toString("hex");

    // Calcular fecha de expiración
    let expiresAt = null;
    if (expirationDays) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expirationDays);
    }

    // Crear registro
    const key = await ApiKey.create({
      name,
      key: apiKey,
      permissions,
      active: true,
      expiresAt
    });

    console.log("╔═══════════════════════════════════════════════════════╗");
    console.log("║                                                       ║");
    console.log("║           ✅ API KEY CREADA EXITOSAMENTE              ║");
    console.log("║                                                       ║");
    console.log("╚═══════════════════════════════════════════════════════╝\n");

    console.log("📋 INFORMACIÓN:\n");
    console.log(`   ID: ${key.id}`);
    console.log(`   Nombre: ${name}`);
    console.log(`   Permisos: ${permissions.join(", ")}`);
    console.log(`   Expira: ${expiresAt ? expiresAt.toLocaleDateString("es-ES") : "Nunca"}`);
    console.log("");
    console.log("🔑 API KEY (COPIAR AHORA - NO SE VOLVERÁ A MOSTRAR):\n");
    console.log(`   ${apiKey}\n`);
    console.log("📡 USO:\n");
    console.log(`   curl -H "X-API-Key: ${apiKey}" \\`);
    console.log(`     "https://stsweb-backend-.../api/public/tickets"\n`);
    console.log("⚠️  IMPORTANTE:");
    console.log("   - Guarda esta key en un lugar seguro");
    console.log("   - No la compartas en código público");
    console.log("   - Rótala cada 90 días por seguridad\n");

  } catch (error) {
    console.error("\n❌ Error al crear API Key:", error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

createApiKey();
