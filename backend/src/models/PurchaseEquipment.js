import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const PurchaseEquipment = sequelize.define(
  "PurchaseEquipment",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    purchaseRequestId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "compras",
        key: "id"
      },
      field: "purchase_request_id"
    },
    nombre: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    photosCount: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      field: "photos_count"
    },
    photoUrls: {
      type: DataTypes.JSON,
      allowNull: true,
      field: "photo_urls"
    }
  },
  {
    tableName: "purchase_equipments",
    timestamps: true
  }
);

export default PurchaseEquipment;
