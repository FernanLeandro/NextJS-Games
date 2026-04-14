import { notFound, redirect } from "next/navigation";
import { stackServerApp } from "@/stack/server";
import { PrismaClient } from "@/app/generated/prisma";
import { PrismaNeon } from "@prisma/adapter-neon";
import ConsoleShow from "@/components/ConsoleShow";
import SideBar from "@/components/SideBar";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient({
    adapter: new PrismaNeon({
        connectionString: process.env.DATABASE_URL!,
    }),
});

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function ConsoleShowPage({ params }: PageProps) {
    const user = await stackServerApp.getUser();
    if (!user) {
        redirect("/");
    }

    const { id } = await params;
    const consoleId = parseInt(id);

    if (isNaN(consoleId)) {
        notFound();
    }

    const consoleData = await prisma.console.findUnique({
        where: { id: consoleId },
    });

    if (!consoleData) {
        notFound();
    }

    // Serialize dates for Client Component
    const serializableConsole = {
        ...consoleData,
        releaseDate: consoleData.releaseDate.toISOString(),
    };

    return (
        <SideBar currentPath="/consolas">
            <div className="container mx-auto px-4 py-12">
                <ConsoleShow console={serializableConsole as any} />
            </div>
        </SideBar>
    );
}
