import PDFDocument from "pdfkit";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const COLORS = {
  blue: "#006BAB",
  orange: "#F29200",
  darkGray: "#333333",
  lightGray: "#666666"
};

function generateReadmePDF() {
  const doc = new PDFDocument({
    size: "A4",
    margins: { top: 50, bottom: 50, left: 50, right: 50 }
  });

  const outputPath = join(__dirname, "../../../README_SAT_ECOSYSTEM.pdf");
  const stream = fs.createWriteStream(outputPath);
  doc.pipe(stream);

  // Header
  doc.rect(0, 0, doc.page.width, 15).fill(COLORS.blue);
  doc.moveDown(2);

  doc.fontSize(28).fillColor(COLORS.blue).font("Helvetica-Bold");
  doc.text("🚀 Ecosistema Integral SAT", { align: "center" });
  
  doc.moveDown(0.3);
  doc.fontSize(18).fillColor(COLORS.orange);
  doc.text("SWARCO Traffic Spain", { align: "center" });
  
  doc.moveDown(0.5);
  doc.fontSize(12).fillColor(COLORS.lightGray).font("Helvetica");
  doc.text("The better way, every day.", { align: "center" });
  
  doc.moveDown(2);

  // Descripción
  addSection(doc, "📋 Descripción General");
  addText(doc, "Plataforma completa de gestión de Servicio de Asistencia Técnica (SAT) que conecta a clientes, personal de oficina (SAT) y técnicos de campo para la gestión eficiente de incidencias, repuestos, compras y asistencias técnicas.");

  // Características
  addSection(doc, "✨ Características Principales");
  
  addSubsection(doc, "👥 Portal del Cliente");
  addBullet(doc, "Registro y autenticación segura (JWT)");
  addBullet(doc, "Multi-idioma (ES, EN, IT, FR, DE, PT, etc.)");
  addBullet(doc, "4 tipos de solicitudes:");
  addBullet(doc, "  • Incidencias - Reportar fallos en equipos", 1);
  addBullet(doc, "  • Repuestos - Solicitar piezas de repuesto", 1);
  addBullet(doc, "  • Compras - Solicitar nuevos equipos", 1);
  addBullet(doc, "  • Asistencias - Programar soporte", 1);
  addBullet(doc, "Timeline visual del estado de cada ticket");
  addBullet(doc, "Sistema de mensajes bidireccional con SAT");

  doc.addPage();
  
  addSubsection(doc, "🎫 Panel SAT Interno");
  addBullet(doc, "Dashboard con estadísticas en tiempo real");
  addBullet(doc, "Vista unificada de todos los tickets");
  addBullet(doc, "Filtros por tipo y estado");
  addBullet(doc, "Gestión de estados:");
  addBullet(doc, "  Pendiente → Asignado → En progreso → Esperando → Resuelto → Cerrado", 1);
  addBullet(doc, "Sistema de comentarios (internos y públicos)");
  addBullet(doc, "Asignación de técnicos");
  addBullet(doc, "Generación de PDFs profesionales");

  addSubsection(doc, "📄 Generación de PDFs");
  addBullet(doc, "Informes técnicos con branding SWARCO");
  addBullet(doc, "Logo y datos fiscales (NIF: A87304655)");
  addBullet(doc, "Dirección: C/ Francisco Gervás, 12, Alcobendas");
  addBullet(doc, "Timeline completo del ticket");
  addBullet(doc, "Formato profesional A4");

  doc.addPage();

  addSubsection(doc, "🔐 Seguridad y Robustez");
  addBullet(doc, "Rate limiting (protección contra ataques)");
  addBullet(doc, "Headers de seguridad HTTP");
  addBullet(doc, "Validación y sanitización de inputs");
  addBullet(doc, "Error reporting automático a sfr.support@swarco.com");
  addBullet(doc, "Error boundary en frontend");
  addBullet(doc, "Sistema de roles (client, sat_admin, sat_technician)");

  // Tipos de Usuario
  addSection(doc, "🎯 Tipos de Usuarios");
  
  addSubsection(doc, "1. Cliente (client)");
  addBullet(doc, "Crear tickets (incidencias, repuestos, compras, asistencias)");
  addBullet(doc, "Ver estado de sus tickets");
  addBullet(doc, "Comunicarse con equipo SAT");
  addBullet(doc, "Recibir notificaciones");

  addSubsection(doc, "2. Administrador SAT (sat_admin)");
  addBullet(doc, "Todo lo anterior +");
  addBullet(doc, "Gestionar todos los tickets");
  addBullet(doc, "Cambiar estados y asignar técnicos");
  addBullet(doc, "Crear notas internas");
  addBullet(doc, "Generar PDFs y ver estadísticas");

  doc.addPage();

  // Cómo Usar
  addSection(doc, "🚀 Cómo Usar");
  
  addSubsection(doc, "Para Crear un Usuario SAT");
  addText(doc, "Ejecuta este comando (reemplaza los valores):");
  
  doc.fontSize(8).font("Courier");
  doc.fillColor(COLORS.darkGray);
  doc.text(`
curl -X POST https://stsweb-backend-XXX.run.app/api/admin/create-sat-user \\
  -H "Content-Type: application/json" \\
  -d '{
    "adminKey": "CHANGE_THIS_IN_PRODUCTION",
    "email": "admin@swarco.com",
    "password": "Admin123!",
    "nombre": "Juan",
    "apellidos": "García",
    "role": "sat_admin"
  }'
  `, { width: doc.page.width - 100 });
  
  doc.moveDown(1);

  addSubsection(doc, "Para Acceder al Panel SAT");
  addBullet(doc, "1. Ir a: https://staging.swarcotrafficspain.com");
  addBullet(doc, "2. Iniciar sesión con credenciales SAT");
  addBullet(doc, "3. Navegar a #sat en la URL");
  addBullet(doc, "4. Ver dashboard completo");

  doc.addPage();

  // Estados de Tickets
  addSection(doc, "📊 Estados de Tickets");
  
  const estados = [
    { nombre: "Pendiente", desc: "Ticket recién creado", emoji: "⏳" },
    { nombre: "Asignado", desc: "Asignado a un técnico", emoji: "👤" },
    { nombre: "En progreso", desc: "Técnico trabajando", emoji: "🔄" },
    { nombre: "Esperando", desc: "Esperando respuesta/repuestos", emoji: "⏸️" },
    { nombre: "Resuelto", desc: "Problema solucionado", emoji: "✅" },
    { nombre: "Cerrado", desc: "Ticket finalizado", emoji: "🔒" }
  ];

  estados.forEach(estado => {
    doc.fontSize(10).font("Helvetica-Bold").fillColor(COLORS.darkGray);
    doc.text(`${estado.emoji} ${estado.nombre}`, 60);
    doc.font("Helvetica").fontSize(9).fillColor(COLORS.lightGray);
    doc.text(estado.desc, 60);
    doc.moveDown(0.5);
  });

  // Números de Ticket
  addSection(doc, "🔢 Números de Ticket");
  addBullet(doc, "INC-XXXXXX: Incidencias");
  addBullet(doc, "REP-XXXXXX: Repuestos");
  addBullet(doc, "COM-XXXXXX: Compras");
  addBullet(doc, "ASI-XXXXXX: Asistencias");
  addText(doc, "Formato: 6 dígitos con ceros a la izquierda (ej: INC-000001)");

  doc.addPage();

  // URLs Importantes
  addSection(doc, "📱 URLs Importantes");
  addBullet(doc, "Portal Web: https://staging.swarcotrafficspain.com");
  addBullet(doc, "Panel SAT: https://staging.swarcotrafficspain.com/#sat");
  addBullet(doc, "Backend API: https://stsweb-backend-964379250608.europe-west1.run.app");

  // Branding
  addSection(doc, "🎨 Branding SWARCO");
  addSubsection(doc, "Colores Corporativos");
  addBullet(doc, "Azul SWARCO: #006BAB");
  addBullet(doc, "Naranja SWARCO: #F29200");
  
  doc.moveDown(0.5);
  addSubsection(doc, "Datos Fiscales");
  addBullet(doc, "Empresa: SWARCO TRAFFIC SPAIN SA");
  addBullet(doc, "NIF: A87304655");
  addBullet(doc, "Dirección: C/ Francisco Gervás, 12 - 28108 Alcobendas, Madrid");

  // Footer
  doc.moveDown(3);
  doc.fontSize(10).fillColor(COLORS.blue).font("Helvetica-Bold");
  doc.text("✅ ECOSISTEMA SAT COMPLETO - 100% OPERATIVO", { align: "center" });
  
  doc.moveDown(1);
  doc.fontSize(9).fillColor(COLORS.lightGray).font("Helvetica-Oblique");
  doc.text('"The better way, every day."', { align: "center" });

  // Número de páginas en footer
  const pageCount = doc.bufferedPageRange().count;
  for (let i = 0; i < pageCount; i++) {
    doc.switchToPage(i);
    doc.fontSize(8).fillColor(COLORS.lightGray);
    doc.text(
      `Página ${i + 1} de ${pageCount}`,
      0,
      doc.page.height - 30,
      { align: "center" }
    );
  }

  doc.end();

  stream.on("finish", () => {
    console.log("✅ PDF generado exitosamente:");
    console.log(`   ${outputPath}\n`);
  });
}

function addSection(doc, title) {
  if (doc.y > doc.page.height - 100) {
    doc.addPage();
  }
  doc.moveDown(1);
  doc.fontSize(16).fillColor(COLORS.blue).font("Helvetica-Bold");
  doc.text(title);
  doc.moveDown(0.5);
}

function addSubsection(doc, title) {
  if (doc.y > doc.page.height - 80) {
    doc.addPage();
  }
  doc.moveDown(0.5);
  doc.fontSize(12).fillColor(COLORS.orange).font("Helvetica-Bold");
  doc.text(title);
  doc.moveDown(0.3);
}

function addText(doc, text) {
  doc.fontSize(10).fillColor(COLORS.darkGray).font("Helvetica");
  doc.text(text, { align: "justify" });
  doc.moveDown(0.5);
}

function addBullet(doc, text, indent = 0) {
  if (doc.y > doc.page.height - 60) {
    doc.addPage();
  }
  doc.fontSize(9).fillColor(COLORS.darkGray).font("Helvetica");
  const x = 60 + (indent * 20);
  doc.text(`• ${text}`, x, doc.y, { width: doc.page.width - x - 60 });
  doc.moveDown(0.2);
}

// Ejecutar
generateReadmePDF();
