import { redirect } from "next/navigation";
import { stackServerApp } from "@/stack/server";
import ConsoleForm from "@/components/ConsoleForm";
import SideBar from "@/components/SideBar";
import { PrismaClient } from "@/app/generated/prisma";
import { PrismaNeon } from "@prisma/adapter-neon";

const prisma = new PrismaClient({
    adapter: new PrismaNeon({
        connectionString: process.env.DATABASE_URL!,
    }),
});

interface EditConsolePageProps {
    params: Promise<{ id: string }>;
}

export default async function EditConsolePage({ params }: EditConsolePageProps) {
    const user = await stackServerApp.getUser();
    if (!user) {
        redirect("/");
    }

    const { id } = await params;
    const consoleData = await prisma.console.findUnique({
        where: { id: parseInt(id) },
    });

    if (!consoleData) {
        redirect("/consolas");
    }

    const serializableData = {
        name: consoleData.name,
        manufacturer: consoleData.manufacturer,
        releaseDate: consoleData.releaseDate.toISOString().split("T")[0],
        description: consoleData.description,
        image: consoleData.image,
    };

    return (
        <SideBar currentPath="/consolas">
            <div className="container mx-auto px-4 py-12">
                <ConsoleForm
                    submitButtonText="Actualizar Hardware"
                    consoleId={consoleData.id}
                    initialData={serializableData}
                />
            </div>
        </SideBar>
    );
}
