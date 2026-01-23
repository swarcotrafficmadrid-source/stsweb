import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const FailureEquipment = sequelize.define(
  "FailureEquipment",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    failureId: { type: DataTypes.INTEGER, allowNull: false },
    title: { type: DataTypes.STRING(120), allowNull: true },
    description: { type: DataTypes.TEXT, allowNull: true },
    company: { type: DataTypes.STRING(80), allowNull: true },
    refCode: { type: DataTypes.STRING(20), allowNull: true },
    serial: { type: DataTypes.STRING(20), allowNull: true },
    locationType: { type: DataTypes.STRING(20), allowNull: true },
    locationVia: { type: DataTypes.STRING(80), allowNull: true },
    locationSentido: { type: DataTypes.STRING(80), allowNull: true },
    locationPk: { type: DataTypes.STRING(40), allowNull: true },
    locationProvince: { type: DataTypes.STRING(80), allowNull: true },
    locationStation: { type: DataTypes.STRING(120), allowNull: true },
    photosCount: { type: DataTypes.INTEGER, allowNull: true },
    videoName: { type: DataTypes.STRING(120), allowNull: true },
    photoUrls: { type: DataTypes.JSON, allowNull: true },
    videoUrl: { type: DataTypes.STRING(500), allowNull: true }
  },
  {
    tableName: "fallas_equipos",
    timestamps: true
  }
);

export default FailureEquipment;
