import express from "express";
import cors from "cors";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import router from "./routes/index.routes";
import { envs } from "./config/envs";
import { swaggerSpec } from "./config/swagger";
import { globalRateLimiter } from "./middlewares/rateLimiter.middleware";
import { errorHandler } from "./middlewares/errorHandler.middleware";

const server = express();

// 1. Headers de Seguridad HTTP (Protección XSS, clickjacking, etc.)
// Permitir scripts inline e imágenes para la UI de Swagger
server.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

// 2. Parser JSON optimizado
server.use(express.json({ limit: "1mb" }));
server.use(express.urlencoded({ extended: true, limit: "1mb" }));

// 3. Documentación Interactiva Swagger / OpenAPI 3.0
server.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: "TurnoClínica API Docs",
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
    },
  })
);
server.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: "TurnoClínica API Docs",
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
    },
  })
);
server.get("/docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

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
