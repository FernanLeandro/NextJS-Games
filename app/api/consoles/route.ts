import { NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma";
import { PrismaNeon } from "@prisma/adapter-neon";
import fs from "fs/promises";
import path from "path";
import { consoleSchema } from "@/lib/validations/console";
import { handleRequestError } from "@/lib/utils/error-handler";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient({
  adapter: new PrismaNeon({
    connectionString: process.env.DATABASE_URL!,
  }),
});

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

export async function GET() {
  try {
    const consoles = await prisma.console.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(consoles);
  } catch (error) {
    console.error("Error fetching consoles:", error);
    return NextResponse.json(
      { error: "Error al obtener las consolas" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const rawPayload = await parseConsoleRequest(request);

    // Validación con Zod
    const validatedData = consoleSchema.parse(rawPayload);

    const consoleObj = await prisma.console.create({
      data: {
        name: validatedData.name,
        manufacturer: validatedData.manufacturer,
        releaseDate: validatedData.releaseDate,
        description: validatedData.description,
        image: validatedData.image || "no-image.png",
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/consolas");

    return NextResponse.json(consoleObj, { status: 201 });
  } catch (error) {
    return handleRequestError(error);
  }
}