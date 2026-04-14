import { redirect } from "next/navigation";
import { stackServerApp } from "@/stack/server";
import ConsoleForm from "@/components/ConsoleForm";
import SideBar from "@/components/SideBar";

export default async function AddConsolePage() {
    const user = await stackServerApp.getUser();
    if (!user) {
        redirect("/");
    }

    return (
        <SideBar currentPath="/consolas">
            <div className="container mx-auto px-4 py-12">
                <ConsoleForm
                    submitButtonText="Inyectar Hardware"
                />
            </div>
        </SideBar>
    );
}
