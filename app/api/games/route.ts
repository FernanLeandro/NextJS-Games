import { NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma";
import { PrismaNeon } from "@prisma/adapter-neon";
import fs from "fs/promises";
import path from "path";
import { gameSchema } from "@/lib/validations/game";
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

async function saveCoverFile(file: any): Promise<string | null> {
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

  const fileName = `${Date.now()}-${sanitizeFileName(file.name)}`;
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
  const destination = path.join(UPLOADS_DIR, fileName);
  await fs.writeFile(destination, Buffer.from(await file.arrayBuffer()));
  return `/uploads/${fileName}`;
}

async function parseGameRequest(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  let payload: any;

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    payload = {
      title: formData.get("title"),
      cover: formData.get("cover"),
      coverFile: formData.get("cover_file"),
      developer: formData.get("developer"),
      releaseDate: formData.get("releaseDate"),
      price: formData.get("price"),
      genre: formData.get("genre"),
      description: formData.get("description"),
      console_id: formData.get("console_id"),
    };
  } else {
    payload = await request.json();
  }

  let cover: string | null | undefined;
  const maybeCoverFile = payload.coverFile;
  if (
    maybeCoverFile &&
    typeof maybeCoverFile === "object" &&
    typeof maybeCoverFile.arrayBuffer === "function"
  ) {
    cover = await saveCoverFile(maybeCoverFile);
  } else if (typeof payload.cover === "string" && payload.cover.trim() !== "") {
    cover = payload.cover.trim();
  }

  return {
    ...payload,
    cover: cover || payload.cover,
  };
}

export async function GET() {
  try {
    const games = await prisma.game.findMany({
      include: {
        console: true,
      },
      orderBy: {
        title: "asc",
      },
    });

    return NextResponse.json(games);
  } catch (error) {
    console.error("Error fetching games:", error);
    return NextResponse.json(
      { error: "Error al obtener los juegos" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const rawPayload = await parseGameRequest(request);

    // Validación con Zod
    const validatedData = gameSchema.parse(rawPayload);

    const game = await prisma.game.create({
      data: {
        title: validatedData.title,
        developer: validatedData.developer,
        releaseDate: validatedData.releaseDate,
        price: validatedData.price,
        genre: validatedData.genre,
        description: validatedData.description,
        console_id: validatedData.console_id,
        cover: validatedData.cover || "no-cover.png",
      },
      include: {
        console: true,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/games");

    return NextResponse.json(game, { status: 201 });
  } catch (error) {
    return handleRequestError(error);
  }
}