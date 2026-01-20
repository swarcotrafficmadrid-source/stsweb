import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const FailureReport = sequelize.define(
  "FailureReport",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    titulo: { type: DataTypes.STRING(120), allowNull: false },
    descripcion: { type: DataTypes.TEXT, allowNull: false },
    prioridad: { type: DataTypes.STRING(20), allowNull: false, defaultValue: "Media" },
    estado: { type: DataTypes.STRING(20), allowNull: false, defaultValue: "Abierto" }
  },
  {
    tableName: "fallas",
    timestamps: true
  }
);

export default FailureReport;
