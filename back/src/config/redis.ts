import Redis, { RedisOptions } from "ioredis";
import { envs } from "./envs";

export const redisConfig: RedisOptions = {
  host: envs.REDIS_HOST,
  port: envs.REDIS_PORT,
  password: envs.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null, // Required by BullMQ
  enableReadyCheck: false,
  retryStrategy(times) {
    const delay = Math.min(times * 100, 3000);
    return delay;
  },
  lazyConnect: true,
};

export const redisClient = new Redis(redisConfig);

let isConnected = false;

redisClient.on("connect", () => {
  isConnected = true;
  console.log("⚡ Redis conectado exitosamente");
});

redisClient.on("error", (err) => {
  isConnected = false;
  console.warn("⚠️ Advertencia Redis:", err.message);
});

export const getRedisClient = async (): Promise<Redis> => {
  if (redisClient.status === "wait" || redisClient.status === "close") {
    try {
      await redisClient.connect();
    } catch (err: any) {
      console.warn("⚠️ No se pudo conectar a Redis inmediatamente:", err.message);
    }
  }
  return redisClient;
};

/**
 * Bloqueo Distribuido (Distributed Lock / Mutex)
 * Evita race conditions y doble reserva de turnos cuando miles de usuarios intentan
 * reservar el mismo slot simultáneamente.
 */
export async function acquireDistributedLock(
  lockKey: string,
  ttlSeconds: number = 10
): Promise<string | null> {
  const lockToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
  try {
    const client = await getRedisClient();
    // SET lockKey lockToken NX EX ttlSeconds
    const result = await client.set(`lock:${lockKey}`, lockToken, "EX", ttlSeconds, "NX");
    return result === "OK" ? lockToken : null;
  } catch (error) {
    console.warn("Aviso de bloqueo distribuido (Redis offline, fallback local):", error);
    // Si Redis no está disponible en dev local, permitimos avanzar pero registramos el evento
    return lockToken;
  }
}

export async function releaseDistributedLock(
  lockKey: string,
  lockToken: string
): Promise<boolean> {
  // Script Lua para liberación atómica (solo libera si el token coincide)
  const luaScript = `
    if redis.call("get", KEYS[1]) == ARGV[1] then
      return redis.call("del", KEYS[1])
    else
      return 0
    end
  `;
  try {
    const client = await getRedisClient();
    const result = await client.eval(luaScript, 1, `lock:${lockKey}`, lockToken);
    return result === 1;
  } catch (error) {
    return false;
  }
}

/**
 * Helpers de Caché (Cache-Aside Pattern)
 */
export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const client = await getRedisClient();
    const data = await client.get(`cache:${key}`);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export async function setCache(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
  try {
    const client = await getRedisClient();
    await client.set(`cache:${key}`, JSON.stringify(value), "EX", ttlSeconds);
  } catch {
    // Falla silenciosa si redis está offline para no interrumpir el flujo HTTP
  }
}

export async function deleteCache(pattern: string): Promise<void> {
  try {
    const client = await getRedisClient();
    const keys = await client.keys(`cache:${pattern}`);
    if (keys.length > 0) {
      await client.del(...keys);
    }
  } catch {
    // Ignorar en fallback
  }
}
