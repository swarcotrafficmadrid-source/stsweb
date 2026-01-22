import dotenv from "dotenv";
import { Sequelize } from "sequelize";

dotenv.config();

const socketPath = process.env.DB_SOCKET;
const host = socketPath ? "localhost" : process.env.DB_HOST;
const port = socketPath ? undefined : (process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306);

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host,
    port,
    dialect: "mariadb",
    logging: false,
    ...(socketPath ? { dialectOptions: { socketPath } } : {})
  }
);

export default sequelize;
