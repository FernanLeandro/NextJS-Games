import { z } from "zod";

export const gameSchema = z.object({
  title: z
    .string()
    .min(1, "El título es obligatorio")
    .max(100, "El título no puede exceder los 100 caracteres"),
  developer: z
    .string()
    .min(1, "El desarrollador es obligatorio")
    .max(100, "El nombre del desarrollador es muy largo"),
  releaseDate: z.preprocess((arg) => {
    if (typeof arg === "string" || arg instanceof Date) return new Date(arg);
    return arg;
  }, z.date({ message: "Fecha de lanzamiento inválida" })),
  price: z.preprocess(
    (val) => parseFloat(String(val)),
    z.number().positive({ message: "El precio debe ser un número positivo" })
  ),
  genre: z
    .string()
    .min(1, "El género es obligatorio"),
  description: z
    .string()
    .min(10, "La descripción debe tener al menos 10 caracteres"),
  console_id: z.preprocess(
    (val) => parseInt(String(val), 10),
    z.number().int().positive("Debes seleccionar una consola válida")
  ),
  cover: z.string().optional().nullable(),
});

export type GameInput = z.infer<typeof gameSchema>;
