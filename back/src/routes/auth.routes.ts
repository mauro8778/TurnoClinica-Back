import { Router } from "express";
import { postRegister, postLogin, getProfile } from "../controllers/auth.controller";
import { validate } from "../middlewares/validate.middleware";
import { registerSchema, loginSchema } from "../dtos/auth.dto";
import { authRateLimiter } from "../middlewares/rateLimiter.middleware";
import { authenticateJwt } from "../middlewares/auth.middleware";

const router = Router();

router.post("/register", authRateLimiter, validate(registerSchema), postRegister);
router.post("/login", authRateLimiter, validate(loginSchema), postLogin);
router.get("/me", authenticateJwt, getProfile);

export default router;
