import { sequelize } from "../models/index.js";
import { Storage } from "@google-cloud/storage";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

/**
 * Script para verificar que todo el sistema esté configurado correctamente
 * 
 * Comando: node src/scripts/verifySystem.js
 */

async function verify() {
  console.log("🔍 Verificando configuración del sistema...\n");
  
  let errors = 0;
  let warnings = 0;

  // 1. Verificar Base de Datos
  console.log("1️⃣  Verificando conexión a Base de Datos...");
  try {
    await sequelize.authenticate();
    console.log("   ✅ Conexión exitosa");
    console.log(`   📊 Host: ${process.env.DB_HOST}`);
    console.log(`   📊 Database: ${process.env.DB_NAME}\n`);
  } catch (error) {
    console.error("   ❌ Error de conexión:", error.message);
    console.error("   💡 Verificar variables: DB_HOST, DB_USER, DB_PASSWORD\n");
    errors++;
  }

  // 2. Verificar JWT Secret
  console.log("2️⃣  Verificando JWT Secret...");
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 32) {
    console.log("   ✅ JWT Secret configurado\n");
  } else {
    console.error("   ❌ JWT Secret falta o es muy corto (mín 32 caracteres)");
    console.error("   💡 Configurar variable: JWT_SECRET\n");
    errors++;
  }

  // 3. Verificar Google Cloud Storage
  console.log("3️⃣  Verificando Google Cloud Storage...");
  try {
    let storage;
    if (process.env.GOOGLE_CLOUD_STORAGE_KEY) {
      const credentials = JSON.parse(
        Buffer.from(process.env.GOOGLE_CLOUD_STORAGE_KEY, "base64").toString()
      );
      storage = new Storage({ credentials });
    } else {
      storage = new Storage();
    }
    
    const bucketName = process.env.STORAGE_BUCKET_NAME || "swarco-tickets-files";
    const bucket = storage.bucket(bucketName);
    const [exists] = await bucket.exists();
    
    if (exists) {
      console.log("   ✅ Bucket accesible");
      console.log(`   📦 Bucket: ${bucketName}`);
      
      // Verificar permisos de escritura
      const testFile = bucket.file("test-file.txt");
      await testFile.save("test");
      await testFile.delete();
      console.log("   ✅ Permisos de lectura/escritura OK\n");
    } else {
      console.error(`   ❌ Bucket '${bucketName}' no existe`);
      console.error("   💡 Crear con: gsutil mb -l europe-west1 gs://swarco-tickets-files\n");
      errors++;
    }
  } catch (error) {
    console.error("   ❌ Error con Cloud Storage:", error.message);
    console.error("   💡 Verificar variables: STORAGE_BUCKET_NAME, GOOGLE_CLOUD_STORAGE_KEY\n");
    errors++;
  }

  // 4. Verificar Email (Gmail API)
  console.log("4️⃣  Verificando configuración de Email...");
  if (process.env.MAIL_PROVIDER === "gmail_api") {
    if (process.env.GMAIL_SERVICE_ACCOUNT_JSON && process.env.GMAIL_IMPERSONATE) {
      console.log("   ✅ Gmail API configurado");
      console.log(`   📧 From: ${process.env.GMAIL_FROM || "noreply@swarco.com"}\n`);
    } else {
      console.error("   ❌ Faltan variables de Gmail API");
      console.error("   💡 Configurar: GMAIL_SERVICE_ACCOUNT_JSON, GMAIL_IMPERSONATE\n");
      errors++;
    }
  } else {
    console.log("   ⚠️  Gmail API no configurado (emails no se enviarán)");
    console.log("   💡 Configurar MAIL_PROVIDER=gmail_api\n");
    warnings++;
  }

  // 5. Verificar Tablas de Base de Datos
  console.log("5️⃣  Verificando tablas de la base de datos...");
  try {
    const [results] = await sequelize.query("SHOW TABLES");
    const tables = results.map(r => Object.values(r)[0]);
    
    const requiredTables = [
      "usuarios",
      "fallas",
      "fallas_equipos",
      "repuestos",
      "spare_items",
      "compras",
      "purchase_equipments",
      "assistance_requests",
      "ticket_statuses",
      "ticket_comments"
    ];

    const missing = requiredTables.filter(t => !tables.includes(t));
    
    if (missing.length === 0) {
      console.log(`   ✅ Todas las tablas existen (${tables.length} tablas)`);
      
      // Verificar campos nuevos
      console.log("\n   📋 Verificando campos nuevos:");
      
      // assistance_requests
      const [assistanceCols] = await sequelize.query("SHOW COLUMNS FROM assistance_requests");
      const hasPhotosCount = assistanceCols.some(c => c.Field === "photos_count");
      const hasPhotoUrls = assistanceCols.some(c => c.Field === "photo_urls");
      
      if (hasPhotosCount && hasPhotoUrls) {
        console.log("   ✅ assistance_requests: campos de fotos OK");
      } else {
        console.error("   ❌ assistance_requests: faltan campos de fotos");
        console.error("   💡 Ejecutar: npm run migrate");
        errors++;
      }
      
      // purchase_equipments
      if (tables.includes("purchase_equipments")) {
        console.log("   ✅ purchase_equipments: tabla existe");
      } else {
        console.error("   ❌ purchase_equipments: tabla NO existe");
        console.error("   💡 Ejecutar: npm run migrate");
        errors++;
      }
      
      console.log("");
    } else {
      console.error(`   ❌ Faltan tablas: ${missing.join(", ")}`);
      console.error("   💡 Ejecutar servidor con DB_SYNC_ALTER=true para crear tablas\n");
      errors++;
    }
  } catch (error) {
    console.error("   ❌ Error al verificar tablas:", error.message, "\n");
    errors++;
  }

  // 6. Verificar Variables de Entorno Críticas
  console.log("6️⃣  Verificando variables de entorno...");
  const requiredVars = [
    "DB_HOST",
    "DB_NAME",
    "DB_USER",
    "DB_PASSWORD",
    "JWT_SECRET",
    "STORAGE_BUCKET_NAME"
  ];

  const missingVars = requiredVars.filter(v => !process.env[v]);
  
  if (missingVars.length === 0) {
    console.log(`   ✅ Todas las variables críticas configuradas\n`);
  } else {
    console.error(`   ❌ Faltan variables: ${missingVars.join(", ")}`);
    console.error("   💡 Verificar archivo .env\n");
    errors++;
  }

  // 7. Verificar Puerto
  console.log("7️⃣  Verificando configuración del servidor...");
  const port = process.env.PORT || 8080;
  console.log(`   ✅ Puerto: ${port}`);
  console.log(`   ✅ Entorno: ${process.env.NODE_ENV || "development"}\n`);

  // Resumen final
  console.log("═══════════════════════════════════════════════════════");
  console.log("📊 RESUMEN DE VERIFICACIÓN\n");
  
  if (errors === 0 && warnings === 0) {
    console.log("✅ ¡TODO ESTÁ PERFECTO!");
    console.log("🚀 El sistema está listo para producción\n");
  } else if (errors === 0) {
    console.log(`⚠️  Sistema funcional con ${warnings} advertencia(s)`);
    console.log("✅ Puedes continuar, pero revisa las advertencias\n");
  } else {
    console.log(`❌ Encontrados ${errors} error(es) y ${warnings} advertencia(s)`);
    console.log("⛔ Debes corregir los errores antes de deployar\n");
  }
  
  console.log("═══════════════════════════════════════════════════════\n");

  process.exit(errors > 0 ? 1 : 0);
}

verify();
