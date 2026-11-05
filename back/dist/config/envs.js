"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PORT = exports.envs = void 0;
require("dotenv/config");
const zod_1 = require("zod");
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(["development", "production", "test"]).default("development"),
    PORT: zod_1.z.string().default("3001").transform((val) => parseInt(val, 10)),
    // Database PostgreSQL
    DB_TYPE: zod_1.z.literal("postgres").default("postgres"),
    DB_HOST: zod_1.z.string().default("localhost"),
    DB_PORT: zod_1.z.string().default("5432").transform((val) => parseInt(val, 10)),
    DB_USERNAME: zod_1.z.string().default("postgres"),
    DB_PASSWORD: zod_1.z.string().default("postgres"),
    DB_DATABASE: zod_1.z.string().default("turnoclinica"),
    // Redis
    REDIS_HOST: zod_1.z.string().default("localhost"),
    REDIS_PORT: zod_1.z.string().default("6379").transform((val) => parseInt(val, 10)),
    REDIS_PASSWORD: zod_1.z.string().optional(),
    // JWT
    JWT_SECRET: zod_1.z.string().default("dev_super_secret_jwt_key_change_in_production_12345"),
    JWT_EXPIRES_IN: zod_1.z.string().default("1h"),
    JWT_REFRESH_SECRET: zod_1.z.string().default("dev_super_secret_refresh_jwt_key_change_in_production_67890"),
    JWT_REFRESH_EXPIRES_IN: zod_1.z.string().default("7d"),
    // Email Service (SMTP)
    SMTP_HOST: zod_1.z.string().default("smtp.gmail.com"),
    SMTP_PORT: zod_1.z.string().default("587").transform((val) => parseInt(val, 10)),
    SMTP_USER: zod_1.z.string().optional().default(""),
    SMTP_PASS: zod_1.z.string().optional().default(""),
    EMAIL_FROM: zod_1.z.string().default("CLINICA OSORIO <no-reply@clinicaosorio.com>"),
    // AI Triage (Google Gemini API)
    GEMINI_API_KEY: zod_1.z.string().optional().default(""),
    // App Domain / CORS
    CORS_ORIGIN: zod_1.z.string().default("http://localhost:5173,http://localhost:3000"),
});
const parsedEnv = envSchema.safeParse(process.env);
if (!parsedEnv.success) {
    console.error("❌ Invalid environment variables configuration:", parsedEnv.error.format());
    process.exit(1);
}
exports.envs = parsedEnv.data;
exports.PORT = exports.envs.PORT;
