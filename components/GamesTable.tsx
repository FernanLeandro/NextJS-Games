"use client";
import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Joystick } from "@phosphor-icons/react";
import GameCard from "./GameCard";

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

const ITEMS_PER_PAGE = 12;

const CONSOLE_COLORS = [
    "#39ff14",
    "#10b981",
    "#059669",
    "#34d399",
    "#047857",
    "#064e3b",
    "#065f46"
];

export default function GamesTable({ initialGames }: { initialGames: Game[] }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedConsole, setSelectedConsole] = useState("");
    const router = useRouter();
    const searchParams = useSearchParams();

    const pageFromQuery = Number(searchParams.get("page") ?? "1");
    const currentPage = Number.isNaN(pageFromQuery) || pageFromQuery < 1 ? 1 : Math.floor(pageFromQuery);

    const consoleOptions = useMemo(() => {
        const uniqueConsoles = Array.from(
            new Set(initialGames.map((game) => game.console?.name ?? "Sin consola"))
        );
        return uniqueConsoles.sort((a, b) => a.localeCompare(b));
    }, [initialGames]);

    const consoleColorMap = useMemo(() => {
        return consoleOptions.reduce<Record<string, string>>((map, name, index) => {
            map[name] = CONSOLE_COLORS[index % CONSOLE_COLORS.length];
            return map;
        }, {});
    }, [consoleOptions]);

    const filteredGames = useMemo(() => {
        return initialGames.filter((game) => {
            if (selectedConsole && (game.console?.name ?? "") !== selectedConsole) {
                return false;
            }

            const term = searchTerm.toLowerCase();
            return (
                game.title.toLowerCase().includes(term) ||
                game.developer.toLowerCase().includes(term) ||
                game.genre.toLowerCase().includes(term) ||
                (game.console?.name ?? "").toLowerCase().includes(term)
            );
        });
    }, [searchTerm, selectedConsole, initialGames]);

    const totalPages = Math.max(1, Math.ceil(filteredGames.length / ITEMS_PER_PAGE));
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedGames = filteredGames.slice(
        startIndex,
        startIndex + ITEMS_PER_PAGE
    );

    const updatePage = useCallback((page: number) => {
        const params = new URLSearchParams(searchParams.toString());
        if (page <= 1) {
            params.delete("page");
        } else {
            params.set("page", String(page));
        }
        const query = params.toString();
        const path = `${window.location.pathname}${query ? `?${query}` : ""}`;
        router.replace(path, { scroll: false });
    }, [searchParams, router]);

    useEffect(() => {
        if (currentPage > totalPages) {
            updatePage(totalPages);
        }
    }, [currentPage, totalPages, updatePage]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        updatePage(1);
    };

    const [deleteCandidate, setDeleteCandidate] = useState<{ id: number; title: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleConsoleSelect = (consoleName: string) => {
        setSelectedConsole(consoleName);
        updatePage(1);
    };

    const handlePreviousPage = () => {
        updatePage(Math.max(currentPage - 1, 1));
    };

    const handleNextPage = () => {
        updatePage(Math.min(currentPage + 1, totalPages));
    };

    const handleEdit = (id: number) => {
        router.push(`/games/${id}/edit`);
    };

    const handleDelete = (candidate: { id: number; title: string }) => {
        setDeleteCandidate(candidate);
    };

    const closeDeleteModal = () => {
        if (!isDeleting) {
            setDeleteCandidate(null);
        }
    };

    const confirmDelete = async () => {
        if (!deleteCandidate) return;
        setIsDeleting(true);
        try {
            const response = await fetch(`/api/games/${deleteCandidate.id}`, {
                method: 'DELETE',
                cache: 'no-store',
            });
            if (response.ok) {
                router.replace('/games');
            } else {
                const result = await response.json().catch(() => null);
                alert(result?.error || 'Error al eliminar el juego');
            }
        } catch (error) {
            console.error('Error deleting game:', error);
            alert('Error al eliminar el juego');
        } finally {
            setIsDeleting(false);
            setDeleteCandidate(null);
        }
    };

    const handleView = (id: number) => {
        router.push(`/games/${id}`);
    };

    return (
        <div className="space-y-12 w-full min-w-0 pb-20">
            {/* Barra de búsqueda - Cyber Style */}
            <div className="flex flex-col gap-6">
                <div className="relative group w-full max-w-2xl">
                    <div className="absolute -inset-0.5 bg-neon-green/20 rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                    <input
                        type="text"
                        placeholder="Buscar en la red neuronal..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="relative w-full bg-surface-dark border border-white/10 rounded-2xl py-5 px-8 text-white placeholder-gray-600 focus:outline-none focus:border-neon-green/50 focus:ring-1 focus:ring-neon-green/50 transition-all shadow-2xl"
                    />
                </div>
                
                <div className="flex flex-col gap-4">
                    <div className="text-[10px] uppercase tracking-[0.4em] font-black text-neon-green px-1 glow-text">Filtro de Plataforma</div>
                    <div className="flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={() => handleConsoleSelect("")}
                            className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all duration-300 ${selectedConsole === "" ? "bg-neon-green text-deep-black border-neon-green shadow-[0_0_20px_rgba(57,255,20,0.5)]" : "bg-transparent border-white/10 text-gray-500 hover:border-neon-green/50 hover:text-neon-green"}`}
                        >
                            Sistemas Operativos
                        </button>
                        {consoleOptions.map((consoleName) => {
                            const isSelected = selectedConsole === consoleName;
                            return (
                                <button
                                    key={consoleName}
                                    type="button"
                                    onClick={() => handleConsoleSelect(consoleName)}
                                    className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all duration-300 ${isSelected ? "bg-neon-green text-deep-black border-neon-green shadow-[0_0_20px_rgba(57,255,20,0.5)]" : "bg-transparent border-white/10 text-gray-500 hover:border-neon-green/50 hover:text-neon-green"}`}
                                >
                                    {consoleName}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Grid de Juegos */}
            {paginatedGames.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                    {paginatedGames.map((game) => (
                        <GameCard 
                            key={game.id}
                            game={game}
                            onView={handleView}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            getConsoleColor={(name) => consoleColorMap[name] || "#39ff14"}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-40 glass-card rounded-[3rem] border-dashed border-2 border-neon-green/10">
                    <div className="text-neon-green/10 mb-6">
                        <Joystick size={120} weight="fill" />
                    </div>
                    <p className="text-gray-700 font-black uppercase tracking-[0.5em] text-sm">Sin señales en el radar</p>
                </div>
            )}

            {/* Modals */}
            {deleteCandidate && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-2xl p-4">
                    <div className="w-full max-w-lg rounded-[3rem] border border-red-500/30 bg-surface-dark p-12 shadow-[0_0_50px_rgba(239,44,44,0.1)]">
                        <h2 className="text-5xl font-black text-red-500 uppercase tracking-tighter mb-6 italic glow-text-red">Eliminar</h2>
                        <p className="text-gray-400 mb-10 text-lg leading-relaxed">
                            ¿Estás absolutamente seguro de eliminar a <strong className="text-white">{deleteCandidate.title}</strong>? Esta acción no se puede revertir.
                        </p>
                        <div className="flex gap-6 justify-end">
                            <button onClick={closeDeleteModal} className="px-10 py-4 rounded-2xl text-xs font-black uppercase text-gray-500 hover:text-white transition-colors">Abortar</button>
                            <button onClick={confirmDelete} className="px-10 py-4 rounded-2xl bg-red-600 text-white text-xs font-black uppercase shadow-[0_0_30px_rgba(220,38,38,0.4)] hover:bg-red-500 hover:shadow-red-500/60 transition-all">{isDeleting ? 'Borrando...' : 'Confirmar'}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Paginación */}
            {filteredGames.length > 0 && (
                <div className="flex flex-col sm:flex-row justify-between items-center gap-8 mt-24 border-t border-white/5 pt-12">
                    <div className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-700">
                        Sector <span className="text-neon-green">{currentPage}</span> / {totalPages || 1} — <span className="text-gray-800">{filteredGames.length} Unidades</span>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={handlePreviousPage}
                            disabled={currentPage === 1}
                            className="h-16 w-16 flex items-center justify-center rounded-2xl border border-white/5 bg-white/[0.02] text-white disabled:opacity-10 hover:border-neon-green hover:text-neon-green transition-all shadow-xl"
                        >
                            «
                        </button>
                        <button
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="h-16 w-16 flex items-center justify-center rounded-2xl border border-white/5 bg-white/[0.02] text-white disabled:opacity-10 hover:border-neon-green hover:text-neon-green transition-all shadow-xl"
                        >
                            »
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
