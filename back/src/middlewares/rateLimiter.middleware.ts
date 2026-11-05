import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { redisClient } from "../config/redis";

/**
 * Rate Limiter Global para protección contra DDoS y ataques de fuerza bruta.
 * Capacidad: Diseñado para escalar a 1M usuarios/día (~15M req/día)
 */
export const globalRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 300, // 300 peticiones por minuto por IP para rutas generales
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    title: "Demasiadas Peticiones",
    detail: "Has superado el límite de peticiones permitido. Por favor, intenta de nuevo en un minuto.",
  },
  store: new RedisStore({
    // @ts-ignore
    sendCommand: (...args: string[]) => redisClient.call(...args),
    prefix: "rl:global:",
  }),
  // Fallback si Redis está caído
  passOnStoreError: true,
});

/**
 * Rate Limiter Estricto para Login y Registro
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20, // 20 intentos por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    title: "Límite de Intentos de Autenticación",
    detail: "Demasiados intentos de acceso desde esta IP. Intenta nuevamente en 15 minutos.",
  },
  store: new RedisStore({
    // @ts-ignore
    sendCommand: (...args: string[]) => redisClient.call(...args),
    prefix: "rl:auth:",
  }),
  passOnStoreError: true,
});

/**
 * Rate Limiter para Triaje con Inteligencia Artificial
 * Previene consumo excesivo de la API de LLM
 */
export const triageRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10, // 10 consultas de triaje por minuto por usuario/IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    title: "Límite de Consultas de Triaje IA",
    detail: "Demasiadas evaluaciones médicas solicitadas en poco tiempo.",
  },
  store: new RedisStore({
    // @ts-ignore
    sendCommand: (...args: string[]) => redisClient.call(...args),
    prefix: "rl:triage:",
  }),
  passOnStoreError: true,
});
