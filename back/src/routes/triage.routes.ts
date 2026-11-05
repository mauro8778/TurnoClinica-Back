import { Router } from "express";
import { assessTriage, getTriageHistory } from "../controllers/triage.controller";
import { validate } from "../middlewares/validate.middleware";
import { triageRequestSchema } from "../dtos/triage.dto";
import { authenticateJwt } from "../middlewares/auth.middleware";
import { triageRateLimiter } from "../middlewares/rateLimiter.middleware";

const router = Router();

// Evaluación de triaje clínico con IA
router.post("/assess", authenticateJwt, triageRateLimiter, validate(triageRequestSchema), assessTriage);

// Historial clínico de triaje del paciente
router.get("/history", authenticateJwt, getTriageHistory);

export default router;
