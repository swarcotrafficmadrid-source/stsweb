import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const SpareItem = sequelize.define("spare_item", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  spareRequestId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: "spare_request_id"
  },
  title: {
    type: DataTypes.STRING,
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  generalDescription: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: "general_description"
  },
  company: {
    type: DataTypes.STRING,
    allowNull: true
  },
  proyecto: {
    type: DataTypes.STRING,
    allowNull: true
  },
  pais: {
    type: DataTypes.STRING,
    allowNull: true
  },
  provincia: {
    type: DataTypes.STRING,
    allowNull: true
  },
  refCode: {
    type: DataTypes.STRING,
    allowNull: true,
    field: "ref_code"
  },
  serial: {
    type: DataTypes.STRING,
    allowNull: true
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 1
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
}, {
  timestamps: true,
  tableName: "spare_items"
});

export default SpareItem;
