import { DataTypes } from "sequelize";

export default function (sequelize) {
  const ApiKey = sequelize.define(
    "ApiKey",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      key: {
        type: DataTypes.STRING(64),
        allowNull: false,
        unique: true
      },
      permissions: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: ["read"]
        // ["read", "write", "delete"]
      },
      active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      lastUsedAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: true
      }
    },
    {
      tableName: "api_keys",
      timestamps: true
    }
  );

  return ApiKey;
}
