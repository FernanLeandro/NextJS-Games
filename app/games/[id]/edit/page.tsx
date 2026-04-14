import { notFound, redirect } from "next/navigation";
import { stackServerApp } from "@/stack/server";
import { PrismaClient } from "@/app/generated/prisma";
import { PrismaNeon } from "@prisma/adapter-neon";
import GameForm from "@/components/GameForm";

const prisma = new PrismaClient({
    adapter: new PrismaNeon({
        connectionString: process.env.DATABASE_URL!,
    }),
});

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function EditGamePage({ params }: PageProps) {
    const user = await stackServerApp.getUser();
    if (!user) {
        redirect("/");
    }

    const { id } = await params;
    const gameId = parseInt(id);

    if (isNaN(gameId)) {
        notFound();
    }

    const game = await prisma.game.findUnique({
        where: { id: gameId },
        include: {
            console: true,
        },
    });

    if (!game) {
        notFound();
    }

    const initialData = {
        title: game.title,
        cover: game.cover || "",
        developer: game.developer,
        releaseDate: game.releaseDate.toISOString().split('T')[0], // YYYY-MM-DD for input[type="date"]
        price: game.price.toString(),
        genre: game.genre,
        description: game.description,
        console_id: game.console_id,
    };

    return (
        <div className="container mx-auto px-4 py-12">
            <GameForm
                initialData={initialData}
                submitButtonText="Actualizar Juego"
                gameId={gameId}
            />
        </div>
    );
}