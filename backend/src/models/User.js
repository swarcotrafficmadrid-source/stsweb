import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const User = sequelize.define(
  "User",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    usuario: { type: DataTypes.STRING(64), allowNull: false, unique: true },
    nombre: { type: DataTypes.STRING(120), allowNull: false },
    apellidos: { type: DataTypes.STRING(160), allowNull: true },
    email: { type: DataTypes.STRING(120), allowNull: false, unique: true },
    passwordHash: { type: DataTypes.STRING(255), allowNull: false },
    empresa: { type: DataTypes.STRING(160), allowNull: true },
    pais: { type: DataTypes.STRING(120), allowNull: true },
    telefono: { type: DataTypes.STRING(40), allowNull: true },
    cargo: { type: DataTypes.STRING(120), allowNull: true },
    emailVerified: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    emailVerificationToken: { type: DataTypes.STRING(128), allowNull: true },
    emailVerificationExpiresAt: { type: DataTypes.DATE, allowNull: true },
    emailWelcomeSentAt: { type: DataTypes.DATE, allowNull: true },
    resetPasswordToken: { type: DataTypes.STRING(128), allowNull: true },
    resetPasswordExpiresAt: { type: DataTypes.DATE, allowNull: true },
    rol: { type: DataTypes.STRING(32), allowNull: false, defaultValue: "Técnico" },
    userRole: { type: DataTypes.ENUM("client", "sat_admin", "sat_technician"), allowNull: false, defaultValue: "client", field: "user_role", comment: "Role del sistema: client, sat_admin, sat_technician" },
    activo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
  },
  {
    tableName: "usuarios",
    timestamps: true
  }
);

export default User;
