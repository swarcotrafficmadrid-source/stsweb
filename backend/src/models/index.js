import sequelize from "../config/db.js";
import User from "./User.js";
import FailureReport from "./FailureReport.js";
import SpareRequest from "./SpareRequest.js";
import PurchaseRequest from "./PurchaseRequest.js";

User.hasMany(FailureReport, { foreignKey: "userId" });
User.hasMany(SpareRequest, { foreignKey: "userId" });
User.hasMany(PurchaseRequest, { foreignKey: "userId" });

FailureReport.belongsTo(User, { foreignKey: "userId" });
SpareRequest.belongsTo(User, { foreignKey: "userId" });
PurchaseRequest.belongsTo(User, { foreignKey: "userId" });

export {
  sequelize,
  User,
  FailureReport,
  SpareRequest,
  PurchaseRequest
};
