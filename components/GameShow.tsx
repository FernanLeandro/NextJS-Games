"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Pencil, ArrowLeft, GameController, Calendar, Tag, Buildings, House } from "@phosphor-icons/react";

interface Game {
    id: number;
    title: string;
    cover: string | null;
    developer: string;
    releaseDate: Date | string;
    price: number;
    genre: string;
    description: string;
    console_id: number;
    console: {
        id: number;
        name: string;
        image: string;
        releaseDate: Date | string;
        manufacturer: string;
        description: string;
    };
}

interface GameShowProps {
    game: Game;
}

export default function GameShow({ game }: GameShowProps) {
    const router = useRouter();

    const getCoverSrc = (cover: string | null) => {
        const defaultImg = "/imgs/No_image_available.svg";
        if (!cover || typeof cover !== "string" || cover.trim() === "") return defaultImg;
        const trimmed = cover.trim();
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

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("es-ES", {
            style: "currency",
            currency: "EUR",
        }).format(price);
    };

    return (
        <div className="w-full pb-20">
            {/* Header / Navigation */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="h-14 w-14 flex items-center justify-center rounded-2xl border border-white/5 bg-white/[0.02] text-gray-500 hover:text-neon-green hover:border-neon-green/50 transition-all shadow-xl"
                        title="Regresar"
                    >
                        <ArrowLeft size={24} weight="bold" />
                    </button>
                    <div>
                        <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter italic glow-text">
                            {game.title}
                        </h1>
                        <p className="text-[10px] uppercase tracking-[0.4em] font-black text-neon-green/60 mt-1">
                            Detalles del Objeto // ID-{game.id.toString().padStart(4, '0')}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-4">
                    <Link href="/" className="h-14 w-full sm:w-auto justify-center px-8 flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.02] text-xs font-black uppercase text-gray-400 hover:text-white hover:bg-white/[0.05] transition-all">
                        <House size={20} />
                        Terminal
                    </Link>
                    <button
                        onClick={() => router.push(`/games/${game.id}/edit`)}
                        className="h-14 w-full sm:w-auto justify-center px-8 flex items-center gap-3 rounded-2xl bg-neon-green text-deep-black text-xs font-black uppercase shadow-[0_0_30px_rgba(57,255,20,0.3)] hover:shadow-neon-green/50 transition-all"
                    >
                        <Pencil size={20} weight="bold" />
                        Modificar
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-12 items-start">
                {/* Left Side: Media */}
                <div className="space-y-8">
                    <div className="relative group aspect-[3/4] rounded-[3rem] p-1 bg-gradient-to-b from-neon-green/40 to-transparent shadow-2xl">
                        <div className="absolute inset-0 bg-neon-green/10 blur-3xl opacity-20" />
                        <div className="relative h-full w-full overflow-hidden rounded-[2.8rem] bg-surface-dark border border-white/5">
                            <img
                                src={getCoverSrc(game.cover)}
                                alt={game.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-deep-black via-transparent to-transparent opacity-60" />
                        </div>
                    </div>

                    <div className="glass-card rounded-[2.5rem] p-8 border-l-4 border-l-neon-green">
                        <div className="flex items-center gap-3 mb-6">
                            <Tag size={24} className="text-neon-green" weight="fill" />
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white">Adquisición</h3>
                        </div>
                        <p className="text-4xl md:text-5xl font-black text-white glow-text mb-2">
                            {formatPrice(game.price)}
                        </p>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Valor de mercado actual</p>
                    </div>
                </div>

                {/* Right Side: Data */}
                <div className="space-y-8">
                    {/* Primary Info */}
                    <div className="glass-card rounded-[3rem] p-6 md:p-10 space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-neon-green/60 block">Desarrollador</label>
                                <div className="flex items-center gap-3 text-white">
                                    <Buildings size={20} className="text-gray-600" />
                                    <span className="text-xl font-bold">{game.developer}</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-neon-green/60 block">Plataforma</label>
                                <div className="flex items-center gap-3 text-white">
                                    <GameController size={20} className="text-gray-600" />
                                    <span className="text-xl font-bold">{game.console?.name || "Desconocida"}</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-neon-green/60 block">Género</label>
                                <div className="flex items-center gap-3 text-white">
                                    <Tag size={20} className="text-gray-600" />
                                    <span className="text-xl font-bold">{game.genre}</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-neon-green/60 block">Despliegue</label>
                                <div className="flex items-center gap-3 text-white">
                                    <Calendar size={20} className="text-gray-600" />
                                    <span className="text-xl font-bold">{formatDate(game.releaseDate)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-white/5 space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-neon-green/60 block">Sinopsis del Sistema</label>
                            <p className="text-gray-400 text-lg leading-relaxed font-medium">
                                {game.description}
                            </p>
                        </div>
                    </div>

                    {/* Console Hardware Info */}
                    <div className="glass-card rounded-[3rem] p-6 md:p-10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <GameController size={120} weight="fill" />
                        </div>
                        <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter mb-8 italic">
                            Especificaciones // <span className="text-neon-green">{game.console?.name || "Desconocida"}</span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                                <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2">Fabricante</p>
                                <p className="text-white font-bold">{game.console?.manufacturer || "Desconocido"}</p>
                            </div>
                            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                                <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2">Año de Lanzamiento</p>
                                <p className="text-white font-bold">{game.console?.releaseDate ? new Date(game.console.releaseDate).getFullYear() : "N/A"}</p>
                            </div>
                        </div>
                        {game.console?.description && (
                            <p className="mt-8 text-sm text-gray-500 leading-relaxed max-w-2xl">
                                {game.console.description}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}