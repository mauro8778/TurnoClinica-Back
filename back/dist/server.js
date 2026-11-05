"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const index_routes_1 = __importDefault(require("./routes/index.routes"));
const envs_1 = require("./config/envs");
const rateLimiter_middleware_1 = require("./middlewares/rateLimiter.middleware");
const errorHandler_middleware_1 = require("./middlewares/errorHandler.middleware");
const server = (0, express_1.default)();
// 1. Headers de Seguridad HTTP (Protección XSS, clickjacking, etc.)
server.use((0, helmet_1.default)());
// 2. Parser JSON optimizado
server.use(express_1.default.json({ limit: "1mb" }));
server.use(express_1.default.urlencoded({ extended: true, limit: "1mb" }));
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
