import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

export const validate = (schema: ZodSchema<any>, source: "body" | "query" | "params" = "body") => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = await schema.parseAsync(req[source]);
      req[source] = parsed;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          type: "https://turnoclinica.com/errors/validation-error",
          title: "Error de Validación de Datos",
          status: 400,
          detail: "Los datos enviados no cumplen con el formato requerido",
          errors: error.issues.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        });
      }
      next(error);
    }
  };
};
