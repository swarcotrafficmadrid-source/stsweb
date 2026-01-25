/**
 * Migración automática: Agrega campos faltantes e índices
 * Se ejecuta automáticamente al iniciar el backend
 */

export async function up(sequelize) {
  const queryInterface = sequelize.getQueryInterface();

  console.log("🔄 Ejecutando migración: Agregar campos faltantes...");

  try {
    // 1. Agregar campos faltantes a repuestos
    try {
      await queryInterface.addColumn("repuestos", "titulo", {
        type: sequelize.Sequelize.STRING(120),
        allowNull: true,
        after: "userId"
      });
      console.log("✅ Campo 'titulo' agregado a tabla 'repuestos'");
    } catch (err) {
      if (err.original?.code === "ER_DUP_FIELDNAME") {
        console.log("⚠️  Campo 'titulo' ya existe en 'repuestos'");
      } else {
        throw err;
      }
    }

    // 2. Agregar campos faltantes a compras
    try {
      await queryInterface.addColumn("compras", "titulo", {
        type: sequelize.Sequelize.STRING(120),
        allowNull: true,
        after: "userId"
      });
      console.log("✅ Campo 'titulo' agregado a tabla 'compras'");
    } catch (err) {
      if (err.original?.code === "ER_DUP_FIELDNAME") {
        console.log("⚠️  Campo 'titulo' ya existe en 'compras'");
      } else {
        throw err;
      }
    }

    try {
      await queryInterface.addColumn("compras", "proyecto", {
        type: sequelize.Sequelize.STRING(120),
        allowNull: true,
        after: "titulo"
      });
      console.log("✅ Campo 'proyecto' agregado a tabla 'compras'");
    } catch (err) {
      if (err.original?.code === "ER_DUP_FIELDNAME") {
        console.log("⚠️  Campo 'proyecto' ya existe en 'compras'");
      } else {
        throw err;
      }
    }

    try {
      await queryInterface.addColumn("compras", "pais", {
        type: sequelize.Sequelize.STRING(120),
        allowNull: true,
        after: "proyecto"
      });
      console.log("✅ Campo 'pais' agregado a tabla 'compras'");
    } catch (err) {
      if (err.original?.code === "ER_DUP_FIELDNAME") {
        console.log("⚠️  Campo 'pais' ya existe en 'compras'");
      } else {
        throw err;
      }
    }

    // 3. Crear índices críticos
    const indexes = [
      { table: "usuarios", name: "idx_users_email", column: "email" },
      { table: "usuarios", name: "idx_users_usuario", column: "usuario" },
      { table: "fallas", name: "idx_fallas_userId", column: "userId" },
      { table: "repuestos", name: "idx_repuestos_userId", column: "userId" },
      { table: "compras", name: "idx_compras_userId", column: "userId" },
      { table: "ticket_statuses", name: "idx_ticket_status_status", column: "status" }
    ];

    for (const idx of indexes) {
      try {
        await queryInterface.addIndex(idx.table, [idx.column], {
          name: idx.name
        });
        console.log(`✅ Índice '${idx.name}' creado en '${idx.table}'`);
      } catch (err) {
        if (err.original?.code === "ER_DUP_KEYNAME") {
          console.log(`⚠️  Índice '${idx.name}' ya existe`);
        } else {
          console.error(`❌ Error creando índice '${idx.name}':`, err.message);
        }
      }
    }

    // 4. Crear índices compuestos
    try {
      await queryInterface.addIndex("ticket_statuses", ["ticketId", "ticketType"], {
        name: "idx_ticket_status_ticket"
      });
      console.log("✅ Índice compuesto 'idx_ticket_status_ticket' creado");
    } catch (err) {
      if (err.original?.code === "ER_DUP_KEYNAME") {
        console.log("⚠️  Índice 'idx_ticket_status_ticket' ya existe");
      }
    }

    try {
      await queryInterface.addIndex("ticket_comments", ["ticketId", "ticketType"], {
        name: "idx_ticket_comments_ticket"
      });
      console.log("✅ Índice compuesto 'idx_ticket_comments_ticket' creado");
    } catch (err) {
      if (err.original?.code === "ER_DUP_KEYNAME") {
        console.log("⚠️  Índice 'idx_ticket_comments_ticket' ya existe");
      }
    }

    console.log("🎉 Migración completada exitosamente");
    return true;

  } catch (error) {
    console.error("❌ Error en migración:", error);
    throw error;
  }
}

export async function down(sequelize) {
  // No implementamos rollback por ahora
  console.log("⚠️  Rollback no implementado");
}
