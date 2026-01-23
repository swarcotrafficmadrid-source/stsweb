import sequelize from "../config/db.js";
import User from "./User.js";
import FailureReport from "./FailureReport.js";
import FailureEquipment from "./FailureEquipment.js";
import SpareRequest from "./SpareRequest.js";
import SpareItem from "./SpareItem.js";
import PurchaseRequest from "./PurchaseRequest.js";
import AssistanceRequest from "./AssistanceRequest.js";

User.hasMany(FailureReport, { foreignKey: "userId" });
FailureReport.hasMany(FailureEquipment, { foreignKey: "failureId" });
User.hasMany(SpareRequest, { foreignKey: "userId" });
SpareRequest.hasMany(SpareItem, { foreignKey: "spareRequestId" });
User.hasMany(PurchaseRequest, { foreignKey: "userId" });
User.hasMany(AssistanceRequest, { foreignKey: "userId" });

FailureReport.belongsTo(User, { foreignKey: "userId" });
FailureEquipment.belongsTo(FailureReport, { foreignKey: "failureId" });
SpareRequest.belongsTo(User, { foreignKey: "userId" });
SpareItem.belongsTo(SpareRequest, { foreignKey: "spareRequestId" });
PurchaseRequest.belongsTo(User, { foreignKey: "userId" });
AssistanceRequest.belongsTo(User, { foreignKey: "userId" });

export {
  sequelize,
  User,
  FailureReport,
  FailureEquipment,
  SpareRequest,
  SpareItem,
  PurchaseRequest,
  AssistanceRequest
};
