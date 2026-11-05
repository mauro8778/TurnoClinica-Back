import { Router } from "express";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import appointmentRoutes from "./appointment.routes";
import triageRoutes from "./triage.routes";
import { redisClient } from "../config/redis";
import { AppDataSource } from "../config/data-source";

const router = Router();

// Health Check para Balanceadores de Carga (Nginx, AWS ALB, Kubernetes)
router.get("/health", async (req, res) => {
  const dbStatus = AppDataSource.isInitialized ? "healthy" : "down";
  let redisStatus = "healthy";
  try {
    await redisClient.ping();
  } catch {
    redisStatus = "degraded/down";
  }

  const statusCode = dbStatus === "healthy" ? 200 : 503;

  return res.status(statusCode).json({
    status: statusCode === 200 ? "OK" : "SERVICE_UNAVAILABLE",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      database: dbStatus,
      redis: redisStatus,
    },
  });
});

// Rutas modulares
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/appointments", appointmentRoutes);
router.use("/appoiment", appointmentRoutes); // Retrocompatibilidad para clientes existentes
router.use("/triage", triageRoutes);

export default router;
