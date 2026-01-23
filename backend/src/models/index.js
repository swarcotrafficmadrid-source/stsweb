import sequelize from "../config/db.js";
import User from "./User.js";
import FailureReport from "./FailureReport.js";
import FailureEquipment from "./FailureEquipment.js";
import SpareRequest from "./SpareRequest.js";
import SpareItem from "./SpareItem.js";
import PurchaseRequest from "./PurchaseRequest.js";
import PurchaseEquipment from "./PurchaseEquipment.js";
import AssistanceRequest from "./AssistanceRequest.js";
import TicketStatus from "./TicketStatus.js";
import TicketComment from "./TicketComment.js";
import Webhook from "./Webhook.js";
import ApiKey from "./ApiKey.js";

User.hasMany(FailureReport, { foreignKey: "userId" });
FailureReport.hasMany(FailureEquipment, { foreignKey: "failureId" });
User.hasMany(SpareRequest, { foreignKey: "userId" });
SpareRequest.hasMany(SpareItem, { foreignKey: "spareRequestId" });
User.hasMany(PurchaseRequest, { foreignKey: "userId" });
PurchaseRequest.hasMany(PurchaseEquipment, { foreignKey: "purchaseRequestId" });
User.hasMany(AssistanceRequest, { foreignKey: "userId" });
User.hasMany(TicketStatus, { foreignKey: "changedBy" });
User.hasMany(TicketComment, { foreignKey: "userId" });

FailureReport.belongsTo(User, { foreignKey: "userId" });
FailureEquipment.belongsTo(FailureReport, { foreignKey: "failureId" });
SpareRequest.belongsTo(User, { foreignKey: "userId" });
SpareItem.belongsTo(SpareRequest, { foreignKey: "spareRequestId" });
PurchaseRequest.belongsTo(User, { foreignKey: "userId" });
PurchaseEquipment.belongsTo(PurchaseRequest, { foreignKey: "purchaseRequestId" });
AssistanceRequest.belongsTo(User, { foreignKey: "userId" });
TicketStatus.belongsTo(User, { as: "ChangedByUser", foreignKey: "changedBy" });
TicketStatus.belongsTo(User, { as: "AssignedToUser", foreignKey: "assignedTo" });
TicketComment.belongsTo(User, { foreignKey: "userId" });

export {
  sequelize,
  User,
  FailureReport,
  FailureEquipment,
  SpareRequest,
  SpareItem,
  PurchaseRequest,
  PurchaseEquipment,
  AssistanceRequest,
  TicketStatus,
  TicketComment,
  Webhook,
  ApiKey
};
