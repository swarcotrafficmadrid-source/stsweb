import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const SpareRequest = sequelize.define(
  "SpareRequest",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    repuesto: { type: DataTypes.STRING(120), allowNull: false },
    cantidad: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    descripcion: { type: DataTypes.TEXT, allowNull: true },
    estado: { type: DataTypes.STRING(20), allowNull: false, defaultValue: "Pendiente" }
  },
  {
    tableName: "repuestos",
    timestamps: true
  }
);

export default SpareRequest;
