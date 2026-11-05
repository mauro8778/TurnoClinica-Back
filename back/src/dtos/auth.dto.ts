import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(100),
  email: z.string().email("Email inválido"),
  birthdate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha debe ser YYYY-MM-DD"),
  nDni: z.string().min(6, "El DNI debe tener al menos 6 caracteres").max(20),
  username: z.string().min(3, "El usuario debe tener al menos 3 caracteres").max(50),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres").max(100),
  phone: z.string().optional(),
  role: z.enum(["patient", "doctor", "admin"]).optional().default("patient"),
});

export const loginSchema = z.object({
  username: z.string().min(1, "El usuario es requerido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

export type RegisterDto = z.infer<typeof registerSchema>;
export type LoginDto = z.infer<typeof loginSchema>;
