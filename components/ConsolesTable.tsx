"use client";
import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GameController } from "@phosphor-icons/react";
import ConsoleCard from "./ConsoleCard";

interface Console {
    id: number;
    name: string;
    image: string | null;
    manufacturer: string;
    releaseDate: Date | string;
    description: string;
}

const ITEMS_PER_PAGE = 8;

const MFR_COLORS: Record<string, string> = {
    "Sony": "#003087",
    "Nintendo": "#E60012",
    "Microsoft": "#107C10",
    "Sega": "#0089CF",
};

export default function ConsolesTable({ initialConsoles }: { initialConsoles: Console[] }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedMfr, setSelectedMfr] = useState("");
    const router = useRouter();
    const searchParams = useSearchParams();

    const pageFromQuery = Number(searchParams.get("page") ?? "1");
    const currentPage = Number.isNaN(pageFromQuery) || pageFromQuery < 1 ? 1 : Math.floor(pageFromQuery);

    const mfrOptions = useMemo(() => {
        const unique = Array.from(new Set(initialConsoles.map((c) => c.manufacturer)));
        return unique.sort((a, b) => a.localeCompare(b));
    }, [initialConsoles]);

    const filteredConsoles = useMemo(() => {
        return initialConsoles.filter((c) => {
            if (selectedMfr && c.manufacturer !== selectedMfr) return false;
            const term = searchTerm.toLowerCase();
            return (
                c.name.toLowerCase().includes(term) ||
                c.manufacturer.toLowerCase().includes(term) ||
                c.description.toLowerCase().includes(term)
            );
        });
    }, [searchTerm, selectedMfr, initialConsoles]);

    const totalPages = Math.max(1, Math.ceil(filteredConsoles.length / ITEMS_PER_PAGE));
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginated = filteredConsoles.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const updatePage = useCallback((page: number) => {
        const params = new URLSearchParams(searchParams.toString());
        if (page <= 1) params.delete("page");
        else params.set("page", String(page));
        const query = params.toString();
        const path = `${window.location.pathname}${query ? `?${query}` : ""}`;
        router.replace(path, { scroll: false });
    }, [searchParams, router]);

    useEffect(() => {
        if (currentPage > totalPages) updatePage(totalPages);
    }, [currentPage, totalPages, updatePage]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        updatePage(1);
    };

    const [deleteCandidate, setDeleteCandidate] = useState<Console | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleEdit = (id: number) => router.push(`/consolas/${id}/edit`);
    const handleView = (id: number) => router.push(`/consolas/${id}`);
    const handleDelete = (c: Console) => {
        setDeleteCandidate(c);
        setError(null);
    };

    const confirmDelete = async () => {
        if (!deleteCandidate) return;
        setIsDeleting(true);
        setError(null);
        try {
            const response = await fetch(`/api/consoles/${deleteCandidate.id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                router.refresh(); // Actualizar datos de servidor
                setDeleteCandidate(null);
            } else {
                const data = await response.json();
                setError(data.error || "Error al eliminar la consola");
            }
        } catch (error) {
            setError("Error de red al intentar eliminar");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-12 w-full min-w-0 pb-20">
            {/* Buscador y Filtros */}
            <div className="flex flex-col gap-6">
                <div className="relative group w-full max-w-2xl">
                    <div className="absolute -inset-0.5 bg-neon-green/20 rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-1000"></div>
                    <input
                        type="text"
                        placeholder="Buscar hardware en el sistema..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="relative w-full bg-surface-dark border border-white/10 rounded-2xl py-4 px-6 sm:py-5 sm:px-8 text-white placeholder-gray-600 focus:outline-none focus:border-neon-green/50 transition-all shadow-2xl"
                    />
                </div>
                
                <div className="flex flex-col gap-4">
                    <div className="text-[10px] uppercase tracking-[0.4em] font-black text-neon-green px-1 glow-text">Fabricante</div>
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={() => { setSelectedMfr(""); updatePage(1); }}
                            className={`px-6 py-2.5 sm:px-8 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${selectedMfr === "" ? "bg-neon-green text-deep-black border-neon-green shadow-lg" : "bg-transparent border-white/10 text-gray-500 hover:text-white"}`}
                        >
                            Todos
                        </button>
                        {mfrOptions.map((mfr) => (
                            <button
                                key={mfr}
                                onClick={() => { setSelectedMfr(mfr); updatePage(1); }}
                                className={`px-6 py-2.5 sm:px-8 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${selectedMfr === mfr ? "bg-neon-green text-deep-black border-neon-green shadow-lg" : "bg-transparent border-white/10 text-gray-500 hover:text-white"}`}
                            >
                                {mfr}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Grid */}
            {paginated.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-10">
                    {paginated.map((c) => (
                        <ConsoleCard 
                            key={c.id}
                            console={c}
                            onView={handleView}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            accentColor={MFR_COLORS[c.manufacturer] || "#39ff14"}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-40 glass-card rounded-[3rem] border-dashed border-2 border-neon-green/10">
                    <GameController size={120} weight="fill" className="text-neon-green/10 mb-6" />
                    <p className="text-gray-700 font-black uppercase tracking-[0.5em] text-sm">Hardware no detectado</p>
                </div>
            )}

            {/* Modal de Eliminación */}
            {deleteCandidate && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-2xl p-4">
                    <div className="w-full max-w-lg rounded-[3rem] border border-red-500/30 bg-surface-dark p-6 sm:p-12 text-center shadow-2xl">
                        <h2 className="text-3xl sm:text-4xl font-black text-red-500 uppercase tracking-tighter mb-6 italic glow-text-red">Desvincular</h2>
                        <p className="text-gray-400 mb-8 text-lg leading-relaxed">
                            ¿Eliminar la consola <strong className="text-white">{deleteCandidate.name}</strong> del archivo central?
                        </p>
                        {error && <p className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-bold uppercase">{error}</p>}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button onClick={() => setDeleteCandidate(null)} className="w-full sm:w-auto px-10 py-4 rounded-2xl text-xs font-black uppercase text-gray-500 hover:text-white">CANCELAR</button>
                            <button onClick={confirmDelete} className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-red-600 text-white text-xs font-black uppercase shadow-lg duration-300 hover:bg-red-500">
                                {isDeleting ? 'PROCESANDO...' : 'CONFIRMAR'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Paginación */}
            {filteredConsoles.length > ITEMS_PER_PAGE && (
                <div className="flex flex-col sm:flex-row justify-between items-center gap-8 mt-24 border-t border-white/5 pt-12">
                    <div className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-700">
                        Hardware <span className="text-neon-green">{currentPage}</span> / {totalPages}
                    </div>
                    <div className="flex gap-4">
                        <button onClick={() => updatePage(currentPage - 1)} disabled={currentPage === 1} className="h-14 w-14 sm:h-16 sm:w-16 flex items-center justify-center rounded-2xl border border-white/5 bg-white/[0.02] text-white disabled:opacity-10 hover:border-neon-green transition-all">«</button>
                        <button onClick={() => updatePage(currentPage + 1)} disabled={currentPage === totalPages} className="h-14 w-14 sm:h-16 sm:w-16 flex items-center justify-center rounded-2xl border border-white/5 bg-white/[0.02] text-white disabled:opacity-10 hover:border-neon-green transition-all">»</button>
                    </div>
                </div>
            )}

        </div>
    );
}
