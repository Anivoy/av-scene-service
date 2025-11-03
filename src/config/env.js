import { config } from "dotenv";
config();

const serverConfig = Object.freeze({
  PORT: parseInt(process.env.PORT || "5087"),
  MODE: process.env.NODE_ENV || "production",
  DB_HOST: process.env.DB_HOST,
  DB_PORT: parseInt(process.env.DB_PORT || "5432"),
  DB_USER: process.env.DB_USER,
  DB_PASS: process.env.DB_PASS,
  DB_NAME: process.env.DB_NAME,
  DB_SCHEMA: process.env.DB_SCHEMA
});

const rateLimitConfig = Object.freeze({
  GLOBAL_LIMIT_WINDOW: parseInt(process.env.GLOBAL_LIMIT_WINDOW || `${15 * 60 * 1000}`), // 15 minutes
  GLOBAL_LIMIT_MAX: parseInt(process.env.GLOBAL_LIMIT_MAX || "100")
})
export {
  serverConfig,
  rateLimitConfig
}