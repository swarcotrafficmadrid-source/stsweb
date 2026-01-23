import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

// Comentarios en tickets (comunicación cliente-SAT)
const TicketComment = sequelize.define("ticket_comment", {
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
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: "user_id"
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  isInternal: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: "is_internal",
    comment: "true = nota interna SAT, false = visible para cliente"
  },
  attachments: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: "Array de URLs de archivos adjuntos"
  }
}, {
  timestamps: true,
  tableName: "ticket_comments"
});

export default TicketComment;
