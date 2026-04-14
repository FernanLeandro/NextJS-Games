import { PrismaClient } from "@/app/generated/prisma";
import { PrismaNeon } from "@prisma/adapter-neon";
import { stackServerApp } from "@/stack/server";
import { redirect } from "next/navigation";
import SideBar from "@/components/SideBar";
import DashboardCharts from "@/components/DashboardCharts";

const prisma = new PrismaClient({
    adapter: new PrismaNeon({
        connectionString: process.env.DATABASE_URL!,
    }),
});

export default async function DashboardsPage(
    {
        children
    }: {
        children: React.ReactNode;
    }) {
    const user = await stackServerApp.getUser();
    if (!user) {
        redirect("/");
    }

    const games = await prisma.game.findMany({
        include: {
            console: true,
        },
        orderBy: {
            title: "asc",
        },
    });

    const chartGames = games.map((game) => ({
        id: game.id,
        title: game.title,
        console: {
            name: game.console?.name ?? "Sin consola",
        },
        releaseDate: game.releaseDate.toISOString(),
    }));

    return (
        <div>
            <SideBar currentPath="/dashboard">
                <div className="space-y-8">
                    <div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-neon-green uppercase tracking-tighter italic glow-text">
                            Command Center
                        </h1>
                        <p className="text-[10px] uppercase tracking-[0.4em] font-black text-white/30 mt-2">
                            Análisis en tiempo real // Distribución de sistemas y cronología de despliegues
                        </p>
                    </div>
                    <DashboardCharts games={chartGames} />
                    {children}
                </div>
            </SideBar>
        </div>
    )
}