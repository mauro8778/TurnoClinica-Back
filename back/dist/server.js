"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const indexRoutes_1 = __importDefault(require("./routes/indexRoutes"));
const cors_1 = __importDefault(require("cors"));
const server = (0, express_1.default)();
server.use(express_1.default.json());
const corsOptions = {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};
server.use((0, cors_1.default)(corsOptions));
server.use(indexRoutes_1.default);
exports.default = server;
