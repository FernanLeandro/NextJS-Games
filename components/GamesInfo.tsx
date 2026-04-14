export const dynamic = "force-dynamic";

import { PrismaClient } from "@/app/generated/prisma";
import { PrismaNeon } from "@prisma/adapter-neon";
import GamesTable from "./GamesTable";

const prisma = new PrismaClient({
    adapter: new PrismaNeon({
        connectionString: process.env.DATABASE_URL!,
    }),
});

export default async function GamesInfo() {
    const games = await prisma.game.findMany({
        include: {
            console: true,
        },
        orderBy: {
            title: 'asc'
        }
    });

    const serializableGames = games.map(game => ({
        ...game,
        releaseDate: game.releaseDate.toISOString(),
        console: game.console ? {
            ...game.console,
            releaseDate: game.console.releaseDate.toISOString(),
        } : null,
    }));

    return (
        <div className="w-full">
            <h1 className="text-6xl font-black text-neon-green uppercase tracking-tighter mb-12 glow-text italic">
                Digital Archive
            </h1>
            <GamesTable initialGames={serializableGames as any} />
        </div>
    );
}