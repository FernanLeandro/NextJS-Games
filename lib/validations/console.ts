import { z } from "zod";

export const consoleSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre de la consola es obligatorio")
    .max(100, "El nombre no puede exceder los 100 caracteres"),
  manufacturer: z
    .string()
    .min(1, "El fabricante es obligatorio")
    .max(100, "El fabricante es muy largo"),
  releaseDate: z.preprocess((arg) => {
    if (typeof arg === "string" || arg instanceof Date) return new Date(arg);
    return arg;
  }, z.date({ message: "Fecha de lanzamiento inválida" })),
  description: z
    .string()
    .min(10, "La descripción debe tener al menos 10 caracteres"),
  image: z.string().optional().nullable(),
});

export type ConsoleInput = z.infer<typeof consoleSchema>;
