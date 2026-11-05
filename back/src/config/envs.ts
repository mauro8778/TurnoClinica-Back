import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().default("3001").transform((val) => parseInt(val, 10)),
  
  // Database PostgreSQL
  DB_TYPE: z.literal("postgres").default("postgres"),
  DB_HOST: z.string().default("localhost"),
  DB_PORT: z.string().default("5432").transform((val) => parseInt(val, 10)),
  DB_USERNAME: z.string().default("postgres"),
  DB_PASSWORD: z.string().default("postgres"),
  DB_DATABASE: z.string().default("turnoclinica"),
  
  // Redis
  REDIS_HOST: z.string().default("localhost"),
  REDIS_PORT: z.string().default("6379").transform((val) => parseInt(val, 10)),
  REDIS_PASSWORD: z.string().optional(),
  
  // JWT
  JWT_SECRET: z.string().default("dev_super_secret_jwt_key_change_in_production_12345"),
  JWT_EXPIRES_IN: z.string().default("1h"),
  JWT_REFRESH_SECRET: z.string().default("dev_super_secret_refresh_jwt_key_change_in_production_67890"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  
  // Email Service (SMTP)
  SMTP_HOST: z.string().default("smtp.gmail.com"),
  SMTP_PORT: z.string().default("587").transform((val) => parseInt(val, 10)),
  SMTP_USER: z.string().optional().default(""),
  SMTP_PASS: z.string().optional().default(""),
  EMAIL_FROM: z.string().default("CLINICA OSORIO <no-reply@clinicaosorio.com>"),
  
  // AI Triage (Google Gemini API)
  GEMINI_API_KEY: z.string().optional().default(""),
  
  // App Domain / CORS
  CORS_ORIGIN: z.string().default("http://localhost:5173,http://localhost:3000"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("❌ Invalid environment variables configuration:", parsedEnv.error.format());
  process.exit(1);
}

export const envs = parsedEnv.data;
export const PORT = envs.PORT;
