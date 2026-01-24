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
    dialect: "mysql",
    logging: false,
    // ✅ OPTIMIZACIÓN: Pool de conexiones aumentado 10x
    pool: {
      max: 50,        // 50 conexiones máximas (antes: 5 default)
      min: 5,         // 5 conexiones mínimas siempre activas
      acquire: 30000, // 30s timeout para adquirir conexión
      idle: 10000,    // 10s antes de cerrar conexión idle
      evict: 60000    // Verificar conexiones idle cada 60s
    },
    ...(socketPath ? { dialectOptions: { socketPath } } : {})
  }
);

export default sequelize;
