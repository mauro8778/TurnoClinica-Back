import express from "express";
import cors from "cors";
import helmet from "helmet";
import router from "./routes/index.routes";
import { envs } from "./config/envs";
import { globalRateLimiter } from "./middlewares/rateLimiter.middleware";
import { errorHandler } from "./middlewares/errorHandler.middleware";

const server = express();

// 1. Headers de Seguridad HTTP (Protección XSS, clickjacking, etc.)
server.use(helmet());

// 2. Parser JSON optimizado
server.use(express.json({ limit: "1mb" }));
server.use(express.urlencoded({ extended: true, limit: "1mb" }));

// 3. CORS para alta disponibilidad y multi-entorno
const allowedOrigins = envs.CORS_ORIGIN.split(",").map((o) => o.trim());

server.use(
  cors({
    origin: (origin, callback) => {
      // Permitir peticiones sin origin (ej: mobile apps, postman, curl) o en la lista permitida
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
        callback(null, true);
      } else {
        callback(null, true); // En dev permitimos orígenes locales
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Idempotency-Key"],
    credentials: true,
  })
);

// 4. Rate Limiting Global
server.use(globalRateLimiter);

// 5. Rutas de la API
server.use(router);

// 6. Manejador Global de Errores (RFC 7807)
server.use(errorHandler);

export default server;
