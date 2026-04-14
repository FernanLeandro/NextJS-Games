"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Pencil, ArrowLeft, GameController, Calendar, Buildings, House, Info } from "@phosphor-icons/react";

interface Console {
    id: number;
    name: string;
    image: string | null;
    manufacturer: string;
    releaseDate: Date | string;
    description: string;
}

interface ConsoleShowProps {
    console: Console;
}

export default function ConsoleShow({ console: consoleData }: ConsoleShowProps) {
    const router = useRouter();

    const getImageSrc = (image: string | null) => {
        const defaultImg = "/imgs/No_image_available.svg";
        if (!image || typeof image !== "string" || image.trim() === "" || image === "no-image.png") return defaultImg;
        const trimmed = image.trim();
        if (/^(http|https):\/\//i.test(trimmed) || trimmed.startsWith("blob:")) return trimmed;
        if (trimmed.startsWith("/")) return trimmed;
        return `/${trimmed.replace(/^\/+/, "")}`;
    };

    const formatDate = (date: Date | string) => {
        return new Date(date).toLocaleDateString("es-ES", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    return (
        <div className="w-full pb-20">
            {/* Header / Navigation */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-12">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="h-12 w-12 sm:h-14 sm:w-14 flex items-center justify-center rounded-2xl border border-white/5 bg-white/[0.02] text-gray-500 hover:text-neon-green hover:border-neon-green/50 transition-all shadow-xl"
                        title="Regresar"
                    >
                        <ArrowLeft size={24} weight="bold" />
                    </button>
                    <div>
                        <h1 className="text-2xl sm:text-3xl md:text-5xl font-black text-white uppercase tracking-tighter italic glow-text">
                            {consoleData.name}
                        </h1>
                        <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.4em] font-black text-neon-green/60 mt-1">
                            Especificaciones de Hardware // ID-{consoleData.id.toString().padStart(4, '0')}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row w-full xl:w-auto gap-4">
                    <Link href="/" className="h-12 sm:h-14 w-full sm:w-auto justify-center px-6 sm:px-8 flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.02] text-[10px] sm:text-xs font-black uppercase text-gray-400 hover:text-white hover:bg-white/[0.05] transition-all">
                        <House size={20} />
                        Terminal
                    </Link>
                    <button
                        onClick={() => router.push(`/consolas/${consoleData.id}/edit`)}
                        className="h-12 sm:h-14 w-full sm:w-auto justify-center px-6 sm:px-8 flex items-center gap-3 rounded-2xl bg-neon-green text-deep-black text-[10px] sm:text-xs font-black uppercase shadow-[0_0_30px_rgba(57,255,20,0.3)] hover:shadow-neon-green/50 transition-all"
                    >
                        <Pencil size={20} weight="bold" />
                        Modificar
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[450px_1fr] gap-12 items-start">
                {/* Left Side: Media */}
                <div className="space-y-8">
                    <div className="relative group aspect-video rounded-[2.5rem] sm:rounded-[3rem] p-1 bg-gradient-to-b from-neon-green/40 to-transparent shadow-2xl">
                        <div className="absolute inset-0 bg-neon-green/10 blur-3xl opacity-20" />
                        <div className="relative h-full w-full overflow-hidden rounded-[2.3rem] sm:rounded-[2.8rem] bg-surface-dark border border-white/5 flex items-center justify-center p-6 sm:p-8">
                            <img
                                src={getImageSrc(consoleData.image)}
                                alt={consoleData.name}
                                className="max-w-full max-h-full object-contain transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-deep-black/40 via-transparent to-transparent opacity-60" />
                        </div>
                    </div>

                    <div className="glass-card rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 border-l-4 border-l-neon-green">
                        <div className="flex items-center gap-3 mb-6">
                            <Info size={24} className="text-neon-green" weight="fill" />
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white">Estado del Archivo</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-500">
                                <span>Verificado por el Sistema</span>
                                <span className="text-neon-green">SI</span>
                            </div>
                            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full w-full bg-neon-green shadow-[0_0_10px_#39ff14]" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Data */}
                <div className="space-y-8">
                    <div className="glass-card rounded-[3rem] p-6 md:p-10 space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-neon-green/60 block">Fabricante</label>
                                <div className="flex items-center gap-3 text-white">
                                    <Buildings size={20} className="text-gray-600" />
                                    <span className="text-xl font-bold">{consoleData.manufacturer}</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-neon-green/60 block">Arquitectura / Tipo</label>
                                <div className="flex items-center gap-3 text-white">
                                    <GameController size={20} className="text-gray-600" />
                                    <span className="text-xl font-bold">Consola de Sobremesa</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-neon-green/60 block">Fecha de Lanzamiento</label>
                                <div className="flex items-center gap-3 text-white">
                                    <Calendar size={20} className="text-gray-600" />
                                    <span className="text-xl font-bold">{formatDate(consoleData.releaseDate)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-white/5 space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-neon-green/60 block">Descripción Técnica</label>
                            <p className="text-gray-400 text-lg leading-relaxed font-medium">
                                {consoleData.description}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
