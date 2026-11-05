import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { envs } from "../config/envs";
import { UserRole } from "../entities/User";
import { redisClient } from "../config/redis";

export interface AuthenticatedUser {
  id: number;
  email: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export const authenticateJwt = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      status: 401,
      title: "No Autorizado",
      detail: "Se requiere un token de acceso válido (Bearer token)",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Comprobar si el token está revocado en Redis (logout)
    try {
      const isBlacklisted = await redisClient.get(`blacklist:${token}`);
      if (isBlacklisted) {
        return res.status(401).json({
          status: 401,
          title: "Token Revocado",
          detail: "La sesión ha expirado o ha sido cerrada",
        });
      }
    } catch {
      // Si redis no responde, continúa con la verificación criptográfica del token
    }

    const payload = jwt.verify(token, envs.JWT_SECRET) as AuthenticatedUser;
    req.user = payload;
    next();
  } catch (error: any) {
    return res.status(401).json({
      status: 401,
      title: "Token Inválido o Expirado",
      detail: error.message || "El token proporcionado no es válido",
    });
  }
};

export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ status: 401, detail: "Usuario no autenticado" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        status: 403,
        title: "Acceso Prohibido",
        detail: `Esta acción requiere uno de los siguientes roles: ${allowedRoles.join(", ")}`,
      });
    }

    next();
  };
};
