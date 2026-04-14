import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { PrismaClient } from "@/app/generated/prisma";
import { PrismaNeon } from "@prisma/adapter-neon";
import fs from "fs/promises";
import path from "path";
import { consoleSchema } from "@/lib/validations/console";
import { handleRequestError } from "@/lib/utils/error-handler";
import { deleteUpload } from "@/lib/utils/file-manager";

const prisma = new PrismaClient({
  adapter: new PrismaNeon({
    connectionString: process.env.DATABASE_URL!,
  }),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

function sanitizeFileName(name: string) {
  return name.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9._-]/g, "");
}

async function saveImageFile(file: any): Promise<string | null> {
  if (
    !file ||
    typeof file !== "object" ||
    typeof file.size !== "number" ||
    file.size === 0 ||
    typeof file.name !== "string" ||
    typeof file.arrayBuffer !== "function"
  ) {
    return null;
  }

  const fileName = `console-${Date.now()}-${sanitizeFileName(file.name)}`;
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
  const destination = path.join(UPLOADS_DIR, fileName);
  await fs.writeFile(destination, Buffer.from(await file.arrayBuffer()));
  return `/uploads/${fileName}`;
}

async function parseConsoleRequest(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  let payload: any;

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    payload = {
      name: formData.get("name"),
      image: formData.get("image"),
      imageFile: formData.get("image_file"),
      manufacturer: formData.get("manufacturer"),
      releaseDate: formData.get("releaseDate"),
      description: formData.get("description"),
    };
  } else {
    payload = await request.json();
  }

  let image: string | null | undefined;
  const maybeImageFile = payload.imageFile;
  if (
    maybeImageFile &&
    typeof maybeImageFile === "object" &&
    typeof maybeImageFile.arrayBuffer === "function"
  ) {
    image = await saveImageFile(maybeImageFile);
  } else if (typeof payload.image === "string" && payload.image.trim() !== "") {
    image = payload.image.trim();
  }

  return {
    ...payload,
    image: image || payload.image,
  };
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const consoleObj = await prisma.console.findUnique({
      where: { id: parseInt(id) },
    });

    if (!consoleObj) {
      return NextResponse.json(
        { error: "Consola no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(consoleObj);
  } catch (error) {
    console.error("Error fetching console:", error);
    return NextResponse.json(
      { error: "Error al obtener la consola" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const consoleId = parseInt(id);
    const rawPayload = await parseConsoleRequest(request);

    // Obtener la consola actual para revisar la imagen antigua
    const currentConsole = await prisma.console.findUnique({
      where: { id: consoleId }
    });

    if (!currentConsole) {
      return NextResponse.json({ error: "Consola no encontrada" }, { status: 404 });
    }

    // Validación parcial o completa con Zod
    const validatedData = consoleSchema.parse(rawPayload);

    const updatedConsole = await prisma.console.update({
      where: { id: consoleId },
      data: {
        name: validatedData.name,
        manufacturer: validatedData.manufacturer,
        releaseDate: validatedData.releaseDate,
        description: validatedData.description,
        image: validatedData.image || undefined,
      },
    });

    // Si se subió una nueva imagen y existía una antigua, borrar la antigua
    const newImage = validatedData.image;
    if (newImage && currentConsole.image && newImage !== currentConsole.image) {
      await deleteUpload(currentConsole.image);
    }

    revalidatePath("/dashboard");
    revalidatePath("/consolas");
    revalidatePath("/games");

    return NextResponse.json(updatedConsole);
  } catch (error) {
    return handleRequestError(error);
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    // Opcional: Verificar si hay juegos asociados antes de borrar
    const gamesCount = await prisma.game.count({
      where: { console_id: parseInt(id) }
    });

    if (gamesCount > 0) {
      return NextResponse.json(
        { error: `No se puede eliminar. Esta consola tiene ${gamesCount} juegos asociados.` },
        { status: 400 }
      );
    }

    // Obtener la imagen antes de borrar el registro
    const consoleObj = await prisma.console.findUnique({
      where: { id: parseInt(id) }
    });

    await prisma.console.delete({
      where: { id: parseInt(id) },
    });

    // Borrar el archivo físico si existía
    if (consoleObj?.image) {
      await deleteUpload(consoleObj.image);
    }

    revalidatePath("/dashboard");
    revalidatePath("/consolas");
    revalidatePath("/games");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting console:", error);
    return NextResponse.json(
      { error: "Error al eliminar la consola" },
      { status: 500 }
    );
  }
}
