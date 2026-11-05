import { z } from "zod";

export const createAppointmentSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido (debe ser YYYY-MM-DD)"),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Formato de hora inválido (debe ser HH:MM en 24h)"),
  description: z.string().min(3, "La descripción debe tener al menos 3 caracteres"),
  userId: z.number().int().positive().optional(),
  doctorId: z.number().int().positive().optional(),
  triageAssessmentId: z.number().int().positive().optional(),
  status: z.enum(["pending", "confirmed", "cancelled", "completed"]).optional().default("confirmed"),
});

export const queryAppointmentSchema = z.object({
  page: z.string().optional().transform((val) => (val ? Math.max(1, parseInt(val, 10)) : 1)),
  limit: z.string().optional().transform((val) => (val ? Math.min(100, Math.max(1, parseInt(val, 10))) : 20)),
  date: z.string().optional(),
  status: z.string().optional(),
  doctorId: z.string().optional().transform((val) => (val ? parseInt(val, 10) : undefined)),
});

export type CreateAppointmentDto = z.infer<typeof createAppointmentSchema>;
export type QueryAppointmentDto = z.infer<typeof queryAppointmentSchema>;
