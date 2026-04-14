import ConsolesInfo from "@/components/ConsolesInfo";
import { stackServerApp } from "@/stack/server";
import { redirect } from "next/navigation";
import SideBar from "@/components/SideBar";

export const dynamic = "force-dynamic";

export default async function ConsolesPage() {
    const user = await stackServerApp.getUser();
    if (!user) {
        redirect("/");
    }

    return (
        <div>
            <SideBar currentPath="/consolas">
                <div className="flex justify-between items-center mb-6">
                    <ConsolesInfo />
                </div>
            </SideBar>
        </div>
    );
}
