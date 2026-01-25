/**
 * Sistema de migraciones automáticas
 * Ejecuta todas las migraciones pendientes al iniciar el servidor
 */

import * as migration001 from "./001_add_missing_fields.js";

const migrations = [
  { id: "001", name: "add_missing_fields", module: migration001 }
];

export async function runMigrations(sequelize) {
  console.log("\n🔄 Ejecutando migraciones de base de datos...\n");

  for (const migration of migrations) {
    try {
      console.log(`[${migration.id}] ${migration.name}...`);
      await migration.module.up(sequelize);
    } catch (error) {
      console.error(`❌ Error en migración ${migration.id}:`, error.message);
      // No detenemos el servidor, solo logueamos el error
    }
  }

  console.log("\n✅ Migraciones completadas\n");
}
