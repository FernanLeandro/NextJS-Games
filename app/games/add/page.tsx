import { redirect } from "next/navigation";
import { stackServerApp } from "@/stack/server";
import GameForm from "@/components/GameForm";

export default async function AddGamePage() {
    const user = await stackServerApp.getUser();
    if (!user) {
        redirect("/");
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <GameForm
                submitButtonText="Agregar Juego"
            />
        </div>
    );
}