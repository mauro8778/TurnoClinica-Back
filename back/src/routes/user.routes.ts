import { Router } from "express";
import { getUsers, getUserById } from "../controllers/user.controller";
import { postRegister, postLogin } from "../controllers/auth.controller";
import { authenticateJwt } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { registerSchema, loginSchema } from "../dtos/auth.dto";
import { authRateLimiter } from "../middlewares/rateLimiter.middleware";

const router = Router();

// Rutas de compatibilidad con versión anterior
router.post("/register", authRateLimiter, validate(registerSchema), postRegister);
router.post("/login", authRateLimiter, validate(loginSchema), postLogin);

// Rutas RESTful de usuarios
router.get("/", authenticateJwt, getUsers);
router.get("/:id", authenticateJwt, getUserById);

export default router;
