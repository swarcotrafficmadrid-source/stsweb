import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const AssistanceRequest = sequelize.define("assistance_request", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: "user_id"
  },
  tipo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fecha: {
    type: DataTypes.STRING,
    allowNull: true
  },
  hora: {
    type: DataTypes.STRING,
    allowNull: true
  },
  lugar: {
    type: DataTypes.STRING,
    allowNull: true
  },
  descripcionFalla: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: "descripcion_falla"
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
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true
  },
  locationAccuracy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: "location_accuracy"
  }
}, {
  timestamps: true,
  tableName: "assistance_requests"
});

export default AssistanceRequest;
