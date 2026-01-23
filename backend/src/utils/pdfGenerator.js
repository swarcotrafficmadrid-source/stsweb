import PDFDocument from "pdfkit";
import { promisify } from "util";

// Colores corporativos SWARCO
const COLORS = {
  blue: "#006BAB",
  orange: "#F29200",
  darkGray: "#333333",
  lightGray: "#666666",
  border: "#CCCCCC"
};

export async function generateTicketPDF(ticket, statusHistory, comments, type) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });

      const chunks = [];
      doc.on("data", chunk => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      // Header con logo y datos fiscales
      addHeader(doc, type);
      
      // Información del ticket
      addTicketInfo(doc, ticket, type);
      
      // Detalles del cliente
      addClientInfo(doc, ticket);
      
      // Timeline de estados
      addTimeline(doc, statusHistory);
      
      // Comentarios
      if (comments && comments.length > 0) {
        addComments(doc, comments);
      }
      
      // Footer
      addFooter(doc);

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

function addHeader(doc, type) {
  // Línea superior azul
  doc.rect(0, 0, doc.page.width, 10).fill(COLORS.blue);
  
  doc.moveDown(2);
  
  // Título
  doc.fontSize(24).fillColor(COLORS.blue).font("Helvetica-Bold");
  doc.text("SWARCO TRAFFIC SPAIN", { align: "center" });
  
  doc.moveDown(0.5);
  doc.fontSize(12).fillColor(COLORS.lightGray).font("Helvetica");
  doc.text("The better way, every day.", { align: "center" });
  
  doc.moveDown(1);
  
  // Tipo de informe
  const typeLabels = {
    failure: "INFORME TÉCNICO - INCIDENCIA",
    spare: "SOLICITUD DE REPUESTOS",
    purchase: "SOLICITUD DE COMPRA",
    assistance: "SOLICITUD DE ASISTENCIA"
  };
  
  doc.fontSize(14).fillColor(COLORS.orange).font("Helvetica-Bold");
  doc.text(typeLabels[type] || "INFORME TÉCNICO", { align: "center" });
  
  doc.moveDown(2);
  
  // Línea separadora
  doc.strokeColor(COLORS.border).lineWidth(1);
  doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke();
  
  doc.moveDown(1);
}

function addTicketInfo(doc, ticket, type) {
  const prefixes = { failure: "INC", spare: "REP", purchase: "COM", assistance: "ASI" };
  const ticketNumber = `${prefixes[type]}-${String(ticket.id).padStart(6, "0")}`;
  
  doc.fontSize(11).fillColor(COLORS.darkGray).font("Helvetica-Bold");
  doc.text("NÚMERO DE TICKET:", 50);
  doc.font("Helvetica").fontSize(16).fillColor(COLORS.blue);
  doc.text(ticketNumber, 200, doc.y - 16);
  
  doc.moveDown(1);
  
  doc.fontSize(10).fillColor(COLORS.darkGray).font("Helvetica");
  doc.text(`Fecha de creación: ${new Date(ticket.createdAt).toLocaleString("es-ES")}`, 50);
  doc.text(`Última actualización: ${new Date(ticket.updatedAt).toLocaleString("es-ES")}`, 50);
  
  doc.moveDown(1.5);
}

function addClientInfo(doc, ticket) {
  // Título de sección
  doc.fontSize(12).fillColor(COLORS.blue).font("Helvetica-Bold");
  doc.text("DATOS DEL CLIENTE", 50);
  doc.moveDown(0.5);
  
  // Recuadro
  const startY = doc.y;
  doc.rect(50, startY, doc.page.width - 100, 80).stroke(COLORS.border);
  
  doc.fontSize(10).fillColor(COLORS.darkGray).font("Helvetica");
  doc.y = startY + 10;
  
  doc.text(`Nombre: ${ticket.User.nombre} ${ticket.User.apellidos}`, 60);
  doc.text(`Empresa: ${ticket.User.empresa}`, 60);
  doc.text(`Email: ${ticket.User.email}`, 60);
  doc.text(`Teléfono: ${ticket.User.telefono}`, 60);
  
  doc.y = startY + 90;
  doc.moveDown(1);
}

function addTimeline(doc, statusHistory) {
  if (!statusHistory || statusHistory.length === 0) return;
  
  // Título de sección
  doc.fontSize(12).fillColor(COLORS.blue).font("Helvetica-Bold");
  doc.text("HISTORIAL DE ESTADOS", 50);
  doc.moveDown(0.5);
  
  const statusLabels = {
    pending: "Pendiente",
    assigned: "Asignado",
    in_progress: "En progreso",
    waiting: "Esperando",
    resolved: "Resuelto",
    closed: "Cerrado"
  };
  
  statusHistory.forEach((status, index) => {
    // Comprobar si necesitamos una nueva página
    if (doc.y > doc.page.height - 150) {
      doc.addPage();
      doc.y = 50;
    }
    
    const startY = doc.y;
    
    // Círculo de timeline
    doc.circle(60, startY + 8, 4);
    if (index === statusHistory.length - 1) {
      doc.fill(COLORS.orange);
    } else {
      doc.fill(COLORS.border);
    }
    
    // Línea vertical (excepto en el último)
    if (index < statusHistory.length - 1) {
      doc.strokeColor(COLORS.border).lineWidth(1);
      doc.moveTo(60, startY + 12).lineTo(60, startY + 50).stroke();
    }
    
    // Información del estado
    doc.fontSize(10).fillColor(COLORS.darkGray).font("Helvetica-Bold");
    doc.text(statusLabels[status.status] || status.status, 75, startY);
    
    doc.font("Helvetica").fontSize(9).fillColor(COLORS.lightGray);
    doc.text(new Date(status.createdAt).toLocaleString("es-ES"), 75);
    
    if (status.ChangedByUser) {
      doc.text(`Por: ${status.ChangedByUser.nombre} ${status.ChangedByUser.apellidos}`, 75);
    }
    
    if (status.comment) {
      doc.fontSize(9).fillColor(COLORS.darkGray);
      doc.text(status.comment, 75, doc.y, { width: doc.page.width - 125 });
    }
    
    doc.moveDown(1.5);
  });
  
  doc.moveDown(1);
}

function addComments(doc, comments) {
  // Comprobar espacio
  if (doc.y > doc.page.height - 200) {
    doc.addPage();
    doc.y = 50;
  }
  
  // Título de sección
  doc.fontSize(12).fillColor(COLORS.blue).font("Helvetica-Bold");
  doc.text("COMENTARIOS Y COMUNICACIONES", 50);
  doc.moveDown(0.5);
  
  comments.forEach((comment) => {
    // Comprobar si necesitamos una nueva página
    if (doc.y > doc.page.height - 150) {
      doc.addPage();
      doc.y = 50;
    }
    
    const startY = doc.y;
    
    // Recuadro del comentario
    const commentHeight = Math.min(
      doc.heightOfString(comment.message, { width: doc.page.width - 120 }) + 40,
      100
    );
    
    doc.rect(50, startY, doc.page.width - 100, commentHeight)
      .stroke(COLORS.border);
    
    // Header del comentario
    doc.fontSize(9).fillColor(COLORS.darkGray).font("Helvetica-Bold");
    doc.text(
      `${comment.User.nombre} ${comment.User.apellidos}${comment.isInternal ? " (Interno)" : ""}`,
      60,
      startY + 10
    );
    
    doc.font("Helvetica").fontSize(8).fillColor(COLORS.lightGray);
    doc.text(new Date(comment.createdAt).toLocaleString("es-ES"), 60);
    
    // Mensaje
    doc.fontSize(9).fillColor(COLORS.darkGray).font("Helvetica");
    doc.text(comment.message, 60, startY + 35, {
      width: doc.page.width - 120,
      lineGap: 2
    });
    
    doc.y = startY + commentHeight + 10;
  });
}

function addFooter(doc) {
  const pageCount = doc.bufferedPageRange().count;
  
  for (let i = 0; i < pageCount; i++) {
    doc.switchToPage(i);
    
    // Línea superior del footer
    doc.strokeColor(COLORS.border).lineWidth(0.5);
    doc.moveTo(50, doc.page.height - 80)
      .lineTo(doc.page.width - 50, doc.page.height - 80)
      .stroke();
    
    // Datos fiscales
    doc.fontSize(8).fillColor(COLORS.lightGray).font("Helvetica");
    doc.text(
      "SWARCO TRAFFIC SPAIN SA",
      50,
      doc.page.height - 70,
      { align: "center", width: doc.page.width - 100 }
    );
    doc.text(
      "NIF: A87304655",
      50,
      doc.page.height - 58,
      { align: "center", width: doc.page.width - 100 }
    );
    doc.text(
      "C/ Francisco Gervás, 12 - 28108 Alcobendas, Madrid",
      50,
      doc.page.height - 46,
      { align: "center", width: doc.page.width - 100 }
    );
    
    // Número de página
    doc.fontSize(8).fillColor(COLORS.lightGray);
    doc.text(
      `Página ${i + 1} de ${pageCount}`,
      0,
      doc.page.height - 30,
      { align: "center" }
    );
  }
}
