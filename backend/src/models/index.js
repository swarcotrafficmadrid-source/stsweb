import sequelize from "../config/db.js";
import User from "./User.js";
import FailureReport from "./FailureReport.js";
import FailureEquipment from "./FailureEquipment.js";
import SpareRequest from "./SpareRequest.js";
import PurchaseRequest from "./PurchaseRequest.js";

User.hasMany(FailureReport, { foreignKey: "userId" });
FailureReport.hasMany(FailureEquipment, { foreignKey: "failureId" });
User.hasMany(SpareRequest, { foreignKey: "userId" });
User.hasMany(PurchaseRequest, { foreignKey: "userId" });

FailureReport.belongsTo(User, { foreignKey: "userId" });
FailureEquipment.belongsTo(FailureReport, { foreignKey: "failureId" });
SpareRequest.belongsTo(User, { foreignKey: "userId" });
PurchaseRequest.belongsTo(User, { foreignKey: "userId" });

export {
  sequelize,
  User,
  FailureReport,
  FailureEquipment,
  SpareRequest,
  PurchaseRequest
};
