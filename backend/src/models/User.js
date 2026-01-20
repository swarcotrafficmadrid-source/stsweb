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
    emailVerified: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    emailVerificationToken: { type: DataTypes.STRING(128), allowNull: true },
    emailVerificationExpiresAt: { type: DataTypes.DATE, allowNull: true },
    emailWelcomeSentAt: { type: DataTypes.DATE, allowNull: true },
    rol: { type: DataTypes.STRING(32), allowNull: false, defaultValue: "Técnico" },
    activo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
  },
  {
    tableName: "usuarios",
    timestamps: true
  }
);

export default User;
