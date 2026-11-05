import { Request, Response, NextFunction } from "express";

export interface AppError extends Error {
  statusCode?: number;
  title?: string;
  detail?: string;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const title = err.title || (statusCode >= 500 ? "Error Interno del Servidor" : "Error en la Solicitud");
  const detail = err.detail || err.message || "Ocurrió un error inesperado al procesar la solicitud.";

  // Log estructurado en consola
  if (statusCode >= 500) {
    console.error(`💥 [ERROR 500] ${req.method} ${req.originalUrl}:`, err);
  } else {
    console.warn(`⚠️ [CLIENT ERROR ${statusCode}] ${req.method} ${req.originalUrl}: ${detail}`);
  }

  return res.status(statusCode).json({
    type: `https://turnoclinica.com/errors/${statusCode}`,
    title,
    status: statusCode,
    detail,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
  });
};
