import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function handleZodError(error: ZodError) {
  const formattedErrors = error.issues.map((err) => ({
    field: err.path.join("."),
    message: err.message,
  }));

  return NextResponse.json(
    {
      error: "Error de validación",
      details: formattedErrors,
    },
    { status: 400 }
  );
}

export function handleRequestError(error: unknown) {
  if (error instanceof ZodError) {
    return handleZodError(error);
  }

  const message = error instanceof Error ? error.message : "Error interno del servidor";
  console.error("API Error:", error);
  
  return NextResponse.json(
    { error: message },
    { status: 500 }
  );
}
