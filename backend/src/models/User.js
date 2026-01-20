import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const User = sequelize.define(
  "User",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    usuario: { type: DataTypes.STRING(64), allowNull: false, unique: true },
    nombre: { type: DataTypes.STRING(120), allowNull: false },
    email: { type: DataTypes.STRING(120), allowNull: false, unique: true },
    passwordHash: { type: DataTypes.STRING(255), allowNull: false },
    rol: { type: DataTypes.STRING(32), allowNull: false, defaultValue: "Técnico" },
    activo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
  },
  {
    tableName: "usuarios",
    timestamps: true
  }
);

export default User;
