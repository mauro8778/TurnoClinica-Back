import { Router } from "express";
import {
  createAppointment,
  cancelAppointment,
  getAppointments,
  getAppointmentById,
} from "../controllers/appointment.controller";
import { validate } from "../middlewares/validate.middleware";
import { createAppointmentSchema, queryAppointmentSchema } from "../dtos/appointment.dto";
import { authenticateJwt } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", validate(queryAppointmentSchema, "query"), getAppointments);
router.get("/:id", getAppointmentById);

// Agendar turno con validación Zod y bloqueo atómico contra colisiones
router.post("/agendar", authenticateJwt, validate(createAppointmentSchema), createAppointment);

// Cancelar turno
router.put("/cancelar/:id", authenticateJwt, cancelAppointment);

export default router;
