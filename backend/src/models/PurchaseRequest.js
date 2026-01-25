import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const PurchaseRequest = sequelize.define(
  "PurchaseRequest",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    titulo: { type: DataTypes.STRING(120), allowNull: true },
    proyecto: { type: DataTypes.STRING(120), allowNull: true },
    pais: { type: DataTypes.STRING(120), allowNull: true },
    equipo: { type: DataTypes.STRING(120), allowNull: false },
    cantidad: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    descripcion: { type: DataTypes.TEXT, allowNull: true },
    estado: { type: DataTypes.STRING(20), allowNull: false, defaultValue: "Pendiente" }
  },
  {
    tableName: "compras",
    timestamps: true
  }
);

export default PurchaseRequest;
