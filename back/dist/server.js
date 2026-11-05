"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const hpp_1 = __importDefault(require("hpp"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const index_routes_1 = __importDefault(require("./routes/index.routes"));
const envs_1 = require("./config/envs");
const swagger_1 = require("./config/swagger");
const rateLimiter_middleware_1 = require("./middlewares/rateLimiter.middleware");
const errorHandler_middleware_1 = require("./middlewares/errorHandler.middleware");
const server = (0, express_1.default)();
// 1. Headers de Seguridad HTTP (Protección OWASP contra XSS, clickjacking, etc.)
server.use((0, helmet_1.default)({
    contentSecurityPolicy: false, // Habilitado para renderizar Swagger UI
    crossOriginEmbedderPolicy: false,
}));
// 2. Parser JSON optimizado con límite estricto de payload (Anti-DoS)
server.use(express_1.default.json({ limit: "1mb" }));
server.use(express_1.default.urlencoded({ extended: true, limit: "1mb" }));
// 3. Prevención de Ataques de Contaminación de Parámetros HTTP (HPP Protection)
server.use((0, hpp_1.default)());
// 3. Documentación Interactiva Swagger / OpenAPI 3.0
server.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.swaggerSpec, {
    customSiteTitle: "TurnoClínica API Docs",
    swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        filter: true,
    },
}));
server.use("/docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.swaggerSpec, {
    customSiteTitle: "TurnoClínica API Docs",
    swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        filter: true,
    },
}));
server.get("/docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swagger_1.swaggerSpec);
});
// 3. CORS para alta disponibilidad y multi-entorno
const allowedOrigins = envs_1.envs.CORS_ORIGIN.split(",").map((o) => o.trim());
server.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Permitir peticiones sin origin (ej: mobile apps, postman, curl) o en la lista permitida
        if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
            callback(null, true);
        }
        else {
            callback(null, true); // En dev permitimos orígenes locales
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Idempotency-Key"],
    credentials: true,
}));
// 4. Rate Limiting Global
server.use(rateLimiter_middleware_1.globalRateLimiter);
// 5. Rutas de la API
server.use(index_routes_1.default);
// 6. Manejador Global de Errores (RFC 7807)
server.use(errorHandler_middleware_1.errorHandler);
exports.default = server;
