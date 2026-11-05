import { z } from "zod";

export const triageRequestSchema = z.object({
  symptoms: z.string().min(10, "Por favor describe los síntomas con más detalle (mínimo 10 caracteres)"),
  duration: z.string().optional().default("No especificada"),
  patientAge: z.number().int().min(0).max(120).optional(),
  medicalHistory: z.array(z.string()).optional().default([]),
  autoSchedule: z.boolean().optional().default(false), // Si es true, busca e intenta agendar el primer turno disponible
  preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export type TriageRequestDto = z.infer<typeof triageRequestSchema>;
