import { sequelize } from "../models/index.js";
import dotenv from "dotenv";

dotenv.config();

/**
 * Script para migrar la base de datos agregando los campos de archivos
 * 
 * EJECUTAR ESTE SCRIPT ANTES DE DEPLOYAR LA NUEVA VERSIÓN
 * 
 * Comando: node src/scripts/migrateDatabase.js
 */

async function migrate() {
  console.log("🚀 Iniciando migración de base de datos...\n");

  try {
    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log("✅ Conexión establecida con la base de datos\n");

    // Obtener QueryInterface para ejecutar queries SQL
    const queryInterface = sequelize.getQueryInterface();

    console.log("📋 Migraciones a ejecutar:\n");

    // NUEVAS TABLAS v2.1 - Integración Empresarial
    
    // Tabla de webhooks
    console.log("0️⃣  Creando tabla 'webhooks'...");
    try {
      await queryInterface.createTable("webhooks", {
        id: {
          type: sequelize.Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true
        },
        name: {
          type: sequelize.Sequelize.STRING(100),
          allowNull: false
        },
        url: {
          type: sequelize.Sequelize.STRING(500),
          allowNull: false
        },
        events: {
          type: sequelize.Sequelize.JSON,
          allowNull: false
        },
        secret: {
          type: sequelize.Sequelize.STRING(100),
          allowNull: true
        },
        active: {
          type: sequelize.Sequelize.BOOLEAN,
          defaultValue: true
        },
        lastTriggeredAt: {
          type: sequelize.Sequelize.DATE,
          allowNull: true
        },
        failureCount: {
          type: sequelize.Sequelize.INTEGER,
          defaultValue: 0
        },
        createdAt: {
          type: sequelize.Sequelize.DATE,
          allowNull: false,
          defaultValue: sequelize.Sequelize.literal("CURRENT_TIMESTAMP")
        },
        updatedAt: {
          type: sequelize.Sequelize.DATE,
          allowNull: false,
          defaultValue: sequelize.Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")
        }
      });
      console.log("   ✅ Tabla 'webhooks' creada");
    } catch (err) {
      if (err.message.includes("already exists")) {
        console.log("   ⚠️  Tabla 'webhooks' ya existe");
      } else {
        throw err;
      }
    }

    // Tabla de API keys
    console.log("0️⃣  Creando tabla 'api_keys'...");
    try {
      await queryInterface.createTable("api_keys", {
        id: {
          type: sequelize.Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true
        },
        name: {
          type: sequelize.Sequelize.STRING(100),
          allowNull: false
        },
        key: {
          type: sequelize.Sequelize.STRING(64),
          allowNull: false,
          unique: true
        },
        permissions: {
          type: sequelize.Sequelize.JSON,
          allowNull: false
        },
        active: {
          type: sequelize.Sequelize.BOOLEAN,
          defaultValue: true
        },
        lastUsedAt: {
          type: sequelize.Sequelize.DATE,
          allowNull: true
        },
        expiresAt: {
          type: sequelize.Sequelize.DATE,
          allowNull: true
        },
        createdAt: {
          type: sequelize.Sequelize.DATE,
          allowNull: false,
          defaultValue: sequelize.Sequelize.literal("CURRENT_TIMESTAMP")
        },
        updatedAt: {
          type: sequelize.Sequelize.DATE,
          allowNull: false,
          defaultValue: sequelize.Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")
        }
      });
      console.log("   ✅ Tabla 'api_keys' creada\n");
    } catch (err) {
      if (err.message.includes("already exists")) {
        console.log("   ⚠️  Tabla 'api_keys' ya existe\n");
      } else {
        throw err;
      }
    }

    // 1. Agregar campos a assistance_requests
    console.log("1️⃣  Actualizando tabla 'assistance_requests'...");
    try {
      await queryInterface.addColumn("assistance_requests", "photos_count", {
        type: sequelize.Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
      });
      console.log("   ✅ Campo 'photos_count' agregado");
    } catch (err) {
      if (err.message.includes("Duplicate column")) {
        console.log("   ⚠️  Campo 'photos_count' ya existe");
      } else {
        throw err;
      }
    }

    try {
      await queryInterface.addColumn("assistance_requests", "photo_urls", {
        type: sequelize.Sequelize.JSON,
        allowNull: true
      });
      console.log("   ✅ Campo 'photo_urls' agregado\n");
    } catch (err) {
      if (err.message.includes("Duplicate column")) {
        console.log("   ⚠️  Campo 'photo_urls' ya existe\n");
      } else {
        throw err;
      }
    }

    // 2. Agregar campos a fallas_equipos (failure_equipments)
    console.log("2️⃣  Actualizando tabla 'fallas_equipos'...");
    try {
      await queryInterface.addColumn("fallas_equipos", "photoUrls", {
        type: sequelize.Sequelize.JSON,
        allowNull: true
      });
      console.log("   ✅ Campo 'photoUrls' agregado");
    } catch (err) {
      if (err.message.includes("Duplicate column")) {
        console.log("   ⚠️  Campo 'photoUrls' ya existe");
      } else {
        throw err;
      }
    }

    try {
      await queryInterface.addColumn("fallas_equipos", "videoUrl", {
        type: sequelize.Sequelize.STRING(500),
        allowNull: true
      });
      console.log("   ✅ Campo 'videoUrl' agregado\n");
    } catch (err) {
      if (err.message.includes("Duplicate column")) {
        console.log("   ⚠️  Campo 'videoUrl' ya existe\n");
      } else {
        throw err;
      }
    }

    // 3. Agregar campos a spare_items
    console.log("3️⃣  Actualizando tabla 'spare_items'...");
    try {
      await queryInterface.addColumn("spare_items", "photo_urls", {
        type: sequelize.Sequelize.JSON,
        allowNull: true
      });
      console.log("   ✅ Campo 'photo_urls' agregado\n");
    } catch (err) {
      if (err.message.includes("Duplicate column")) {
        console.log("   ⚠️  Campo 'photo_urls' ya existe\n");
      } else {
        throw err;
      }
    }

    // 4. Crear tabla purchase_equipments
    console.log("4️⃣  Creando tabla 'purchase_equipments'...");
    try {
      await queryInterface.createTable("purchase_equipments", {
        id: {
          type: sequelize.Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true
        },
        purchase_request_id: {
          type: sequelize.Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "compras",
            key: "id"
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE"
        },
        nombre: {
          type: sequelize.Sequelize.STRING(255),
          allowNull: false
        },
        cantidad: {
          type: sequelize.Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 1
        },
        descripcion: {
          type: sequelize.Sequelize.TEXT,
          allowNull: true
        },
        photos_count: {
          type: sequelize.Sequelize.INTEGER,
          allowNull: true,
          defaultValue: 0
        },
        photo_urls: {
          type: sequelize.Sequelize.JSON,
          allowNull: true
        },
        createdAt: {
          type: sequelize.Sequelize.DATE,
          allowNull: false,
          defaultValue: sequelize.Sequelize.literal("CURRENT_TIMESTAMP")
        },
        updatedAt: {
          type: sequelize.Sequelize.DATE,
          allowNull: false,
          defaultValue: sequelize.Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")
        }
      });
      console.log("   ✅ Tabla 'purchase_equipments' creada\n");
    } catch (err) {
      if (err.message.includes("already exists")) {
        console.log("   ⚠️  Tabla 'purchase_equipments' ya existe\n");
      } else {
        throw err;
      }
    }

    console.log("🎉 ¡Migración completada con éxito!\n");
    console.log("📊 Resumen:");
    console.log("   V2.0 - Sistema de Archivos:");
    console.log("   - assistance_requests: +2 campos (photos_count, photo_urls)");
    console.log("   - fallas_equipos: +2 campos (photoUrls, videoUrl)");
    console.log("   - spare_items: +1 campo (photo_urls)");
    console.log("   - purchase_equipments: +tabla nueva");
    console.log("\n   V2.1 - Integración Empresarial:");
    console.log("   - webhooks: +tabla nueva");
    console.log("   - api_keys: +tabla nueva");
    console.log("\n✅ Base de datos lista para producción v2.1");

  } catch (error) {
    console.error("\n❌ Error durante la migración:", error.message);
    console.error("\n💡 Soluciones:");
    console.error("   1. Verificar que la BD esté accesible");
    console.error("   2. Verificar credenciales en .env");
    console.error("   3. Verificar que las tablas base existan");
    process.exit(1);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

migrate();
