import { DataTypes } from "sequelize";

export default function (sequelize) {
  const Webhook = sequelize.define(
    "Webhook",
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
      url: {
        type: DataTypes.STRING(500),
        allowNull: false
      },
      events: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: []
        // ["ticket.created", "ticket.updated", "ticket.statusChanged", "comment.added"]
      },
      secret: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      lastTriggeredAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      failureCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      }
    },
    {
      tableName: "webhooks",
      timestamps: true
    }
  );

  return Webhook;
}
