"use client";
import { UserButton } from "@stackframe/stack";
import Link from "next/link";
import { 
    SquaresFour, 
    Joystick, 
    Plus, 
    Gear, 
    List, 
    GameController,
} from "@phosphor-icons/react";

export default function SideBar({
    currentPath = "/dashboard",
    children
 }: { 
    currentPath: string;
    children: React.ReactNode
}) {
    const navigation = [
        { name: "Dashboard", href: "/dashboard", icon: SquaresFour },
        { name: "Games", href: "/games", icon: Joystick },
        { name: "Add Game", href: "/games/add", icon: Plus },
        { name: "Consolas", href: "/consolas", icon: GameController },
        { name: "Add Console", href: "/consolas/add", icon: Plus },
        { name: "Settings", href: "/settings", icon: Gear },
    ];
    return (
        <div className="drawer lg:drawer-open">
            <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
            <div className="drawer-content w-full">
                <nav className="navbar w-full bg-deep-black border-b border-neon-green/20">
                    <label htmlFor="my-drawer-4" aria-label="open sidebar" className="btn btn-square btn-ghost text-neon-green hover:bg-neon-green/10">
                        <List size={28} />
                    </label>
                    <div className="px-4 flex gap-2 justify-center items-center font-bold text-neon-green glow-text">
                        <GameController size={28} />
                        <span className="tracking-widest">GAMENEXT.JS</span>
                    </div>
                    <div className="ms-auto flex items-center pr-2">
                        <UserButton showUserInfo={false} />
                    </div>
                </nav>
                {/* Page content here */}
                <div className="p-4 w-full min-w-0 bg-deep-black min-h-[calc(100vh-64px)]">{children}</div>
            </div>

            <div className="drawer-side z-20">
                <label htmlFor="my-drawer-4" aria-label="close sidebar" className="drawer-overlay"></label>
                <div className="flex min-h-full flex-col items-start bg-surface-dark border-r border-neon-green/20 is-drawer-close:w-16 is-drawer-open:w-64 transition-all duration-300">
                    <div className="menu w-full grow space-y-4 p-4">
                        {navigation.map((item, key) => {
                            const IconComponent = item.icon;
                            const isActive = currentPath === item.href;
                            return (
                                <Link
                                    href={item.href}
                                    key={key}
                                    data-tip={item.name}
                                    className={`flex gap-x-3 items-center py-3 px-4 rounded-xl transition-all duration-300 is-drawer-close:tooltip is-drawer-close:tooltip-right ${isActive
                                        ? "bg-neon-green/20 text-neon-green glow-border shadow-[0_0_15px_rgba(57,255,20,0.3)]"
                                        : "hover:bg-neon-green/10 text-gray-400 hover:text-neon-green"
                                        }`}
                                >
                                    <IconComponent className={`size-6 ${isActive ? "glow-text" : ""}`} weight={isActive ? "fill" : "regular"} />
                                    <span className="text-sm font-bold tracking-wide is-drawer-close:hidden uppercase">{item.name}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}