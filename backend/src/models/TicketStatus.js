import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

// Historial de cambios de estado de tickets
const TicketStatus = sequelize.define("ticket_status", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  ticketId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: "ticket_id"
  },
  ticketType: {
    type: DataTypes.ENUM("failure", "spare", "purchase", "assistance"),
    allowNull: false,
    field: "ticket_type"
  },
  status: {
    type: DataTypes.ENUM(
      "pending",      // Pendiente
      "assigned",     // Asignado
      "in_progress",  // En progreso
      "waiting",      // Esperando respuesta/repuestos
      "resolved",     // Resuelto
      "closed"        // Cerrado
    ),
    allowNull: false,
    defaultValue: "pending"
  },
  assignedTo: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: "assigned_to"
  },
  changedBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: "changed_by"
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true,
  tableName: "ticket_statuses"
});

export default TicketStatus;
