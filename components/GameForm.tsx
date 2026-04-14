"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
    CloudArrowUp, 
    ArrowLeft, 
    Check, 
    X, 
    Hash,
    CurrencyEur,
    Palette,
    Buildings,
    Calendar,
    TextAlignLeft,
    Tag
} from "@phosphor-icons/react";
import { gameSchema } from "@/lib/validations/game";
import { ZodError } from "zod";

interface Console {
    id: number;
    name: string;
    manufacturer: string;
}

interface GameFormData {
    title: string;
    cover: string;
    developer: string;
    releaseDate: string;
    price: string;
    genre: string;
    description: string;
    console_id: number;
}

interface GameFormProps {
    initialData?: Partial<GameFormData>;
    submitButtonText: string;
    gameId?: number;
}

export default function GameForm({ initialData, submitButtonText, gameId }: GameFormProps) {
    const router = useRouter();
    const [formData, setFormData] = useState<GameFormData>({
        title: initialData?.title || "",
        cover: initialData?.cover || "",
        developer: initialData?.developer || "",
        releaseDate: initialData?.releaseDate || "",
        price: initialData?.price?.toString() || "",
        genre: initialData?.genre || "",
        description: initialData?.description || "",
        console_id: initialData?.console_id || 0,
    });

    const [consoles, setConsoles] = useState<Console[]>([]);
    const [isLoadingConsoles, setIsLoadingConsoles] = useState(true);
    const [loadConsolesError, setLoadConsolesError] = useState<string | null>(null);
    const [selectedCoverFile, setSelectedCoverFile] = useState<File | null>(null);
    const [coverPreview, setCoverPreview] = useState<string>(initialData?.cover || "");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState<React.ReactNode>("");

    useEffect(() => {
        const loadConsoles = async () => {
            setIsLoadingConsoles(true);
            try {
                const response = await fetch("/api/consoles", {
                    headers: { Accept: "application/json" },
                });
                if (!response.ok) throw new Error(`Status ${response.status}`);
                const data = await response.json();
                setConsoles(data);
            } catch (err) {
                setLoadConsolesError("Error al cargar protocolos de hardware");
            } finally {
                setIsLoadingConsoles(false);
            }
        };
        loadConsoles();
    }, []);

    useEffect(() => {
        if (!selectedCoverFile) return;
        const objectUrl = URL.createObjectURL(selectedCoverFile);
        setCoverPreview(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [selectedCoverFile]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === "console_id" ? Number(value) : value
        }));
        // Limpiar error del campo al escribir
        if (fieldErrors[name]) {
            setFieldErrors(prev => {
                const next = { ...prev };
                delete next[name];
                return next;
            });
        }
    };

    const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        setSelectedCoverFile(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setFieldErrors({});

        // Validación en el cliente con Zod
        try {
            gameSchema.parse({
                ...formData,
                cover: selectedCoverFile ? "file-pending" : (formData.cover || null)
            });
        } catch (err) {
            if (err instanceof ZodError) {
                const errors: Record<string, string> = {};
                err.issues.forEach((e) => {
                    if (e.path[0]) errors[e.path[0].toString()] = e.message;
                });
                setFieldErrors(errors);
                setError("Por favor, corrige los campos resaltados.");
                setIsLoading(false);
                return;
            }
        }

        const formDataToSend = new FormData();
        formDataToSend.append("title", formData.title.trim());
        formDataToSend.append("developer", formData.developer.trim());
        formDataToSend.append("releaseDate", formData.releaseDate);
        formDataToSend.append("price", String(Number(formData.price)));
        formDataToSend.append("genre", formData.genre.trim());
        formDataToSend.append("description", formData.description.trim());
        formDataToSend.append("console_id", String(formData.console_id));

        if (selectedCoverFile) formDataToSend.append("cover_file", selectedCoverFile);
        if (formData.cover && formData.cover.trim() !== "") formDataToSend.append("cover", formData.cover.trim());

        try {
            const url = gameId ? `/api/games/${gameId}` : "/api/games";
            const response = await fetch(url, {
                method: gameId ? "PUT" : "POST",
                body: formDataToSend,
            });
            
            const data = await response.json();

            if (response.ok) {
                setSuccessMessage(gameId ? (
                    <>Sincronización de <strong className="text-white">{formData.title}</strong> completada. El registro ha sido actualizado en la red central.</>
                ) : (
                    <>Nuevo registro detectado: <strong className="text-white">{formData.title}</strong> ha sido inyectado en el sistema con éxito.</>
                ));
                setShowSuccessModal(true);
            } else {
                if (data.details) {
                    const errors: Record<string, string> = {};
                    data.details.forEach((d: any) => {
                        errors[d.field] = d.message;
                    });
                    setFieldErrors(errors);
                }
                setError(data.error || "Fallo en la sincronización de datos");
            }
        } catch (err) {
            setError("Error crítico de red detectado");
        } finally {
            setIsLoading(false);
        }
    };

    const getCoverSrc = (cover: string | null) => {
        if (!cover || typeof cover !== "string" || cover.trim() === "") return "/imgs/No_image_available.svg";
        const trimmed = cover.trim();
        if (/^(http|https):\/\//i.test(trimmed) || trimmed.startsWith("blob:")) return trimmed;
        return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
    };

    return (
        <div className="w-full pb-20">
            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-2xl p-4">
                    <div className="w-full max-w-lg rounded-[3rem] border border-neon-green/30 bg-surface-dark p-8 sm:p-12 shadow-[0_0_50px_rgba(57,255,20,0.1)] text-center">
                        <div className="flex justify-center mb-8">
                            <div className="h-20 w-20 rounded-full bg-neon-green/10 border border-neon-green/20 flex items-center justify-center shadow-[0_0_20px_rgba(57,255,20,0.2)]">
                                <Check size={40} className="text-neon-green" weight="bold" />
                            </div>
                        </div>
                        <h2 className="text-3xl sm:text-5xl font-black text-neon-green uppercase tracking-tighter mb-6 italic glow-text">Éxito</h2>
                        <p className="text-gray-400 mb-10 text-lg leading-relaxed">
                            {successMessage}
                        </p>
                        <div className="flex justify-center">
                            <button 
                                onClick={() => router.push("/games")} 
                                className="w-full sm:w-auto px-12 py-5 rounded-2xl bg-neon-green text-deep-black text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(57,255,20,0.2)] hover:shadow-neon-green/40 transition-all"
                            >
                                Continuar
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Header section with Cyber aesthetics */}
            <div className="flex justify-between items-center mb-12">
                <div>
                    <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter italic glow-text">
                        {gameId ? 'Modificar Registro' : 'Nuevo Registro'}
                    </h1>
                    <p className="text-[10px] uppercase tracking-[0.4em] font-black text-neon-green/60 mt-1">
                        Sincronización // Database Access Point
                    </p>
                </div>
                <button
                    onClick={() => router.back()}
                    className="h-14 w-14 flex items-center justify-center rounded-2xl border border-white/5 bg-white/[0.02] text-gray-500 hover:text-white transition-all shadow-xl"
                >
                    <X size={24} weight="bold" />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-10">
                {error && (
                    <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-black uppercase tracking-widest animate-pulse">
                        ¡Alerta!: {error}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-12 items-start">
                    {/* Media Section */}
                    <div className="space-y-6">
                        <div className={`group relative aspect-[3/4] rounded-[2.5rem] p-1 bg-gradient-to-b ${fieldErrors.cover ? 'from-red-500/40' : 'from-white/10'} to-transparent`}>
                            <div className="relative h-full w-full overflow-hidden rounded-[2.3rem] bg-black border border-white/5">
                                <img
                                    src={coverPreview ? getCoverSrc(coverPreview) : getCoverSrc(formData.cover)}
                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                    alt="Vista previa"
                                    onError={(e) => e.currentTarget.src = "/imgs/No_image_available.svg"}
                                />
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <CloudArrowUp size={48} className="text-neon-green mb-2" />
                                    <p className="text-[10px] font-black uppercase text-neon-green">Subir Media</p>
                                </div>
                                <input
                                    type="file"
                                    onChange={handleCoverFileChange}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                            </div>
                        </div>
                        {fieldErrors.cover && <p className="text-[9px] font-black text-red-500 uppercase text-center">{fieldErrors.cover}</p>}
                        <p className="text-center text-[9px] font-bold text-gray-600 uppercase tracking-widest">
                            Soportado: JPG, PNG, WEBP // Máx 5MB
                        </p>
                    </div>

                    {/* Data Fields */}
                    <div className="glass-card rounded-[3rem] p-6 md:p-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6 sm:gap-x-10 sm:gap-y-8">
                            {/* Titulo */}
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-neon-green/80">
                                    <Hash size={14} /> Título del Sistema
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="Nombre del despliegue..."
                                    className={`cyber-input w-full bg-[#050505] border ${fieldErrors.title ? 'border-red-500/50' : 'border-white/10'} rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-neon-green focus:shadow-[0_0_15px_rgba(57,255,20,0.1)] transition-all`}
                                />
                                {fieldErrors.title && <p className="text-[9px] font-black text-red-500 uppercase px-2">{fieldErrors.title}</p>}
                            </div>

                            {/* Consola */}
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-neon-green/80">
                                    <Tag size={14} /> Protocolo de Hardware
                                </label>
                                <select
                                    name="console_id"
                                    value={formData.console_id}
                                    onChange={handleChange}
                                    className={`cyber-input w-full bg-[#050505] border ${fieldErrors.console_id ? 'border-red-500/50' : 'border-white/10'} rounded-2xl py-4 px-6 text-white appearance-none focus:outline-none focus:border-neon-green transition-all`}
                                >
                                    <option value={0} disabled>Seleccionar Dispositivo...</option>
                                    {consoles.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                                {fieldErrors.console_id && <p className="text-[9px] font-black text-red-500 uppercase px-2">{fieldErrors.console_id}</p>}
                            </div>

                            {/* Desarrollador */}
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-neon-green/80">
                                    <Buildings size={14} /> Nucleo Desarrollador
                                </label>
                                <input
                                    type="text"
                                    name="developer"
                                    value={formData.developer}
                                    onChange={handleChange}
                                    className={`cyber-input w-full bg-[#050505] border ${fieldErrors.developer ? 'border-red-500/50' : 'border-white/10'} rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-neon-green transition-all`}
                                />
                                {fieldErrors.developer && <p className="text-[9px] font-black text-red-500 uppercase px-2">{fieldErrors.developer}</p>}
                            </div>

                            {/* Género */}
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-neon-green/80">
                                    <Palette size={14} /> Categoría de Datos
                                </label>
                                <input
                                    type="text"
                                    name="genre"
                                    value={formData.genre}
                                    onChange={handleChange}
                                    className={`cyber-input w-full bg-[#050505] border ${fieldErrors.genre ? 'border-red-500/50' : 'border-white/10'} rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-neon-green transition-all`}
                                />
                                {fieldErrors.genre && <p className="text-[9px] font-black text-red-500 uppercase px-2">{fieldErrors.genre}</p>}
                            </div>

                            {/* Fecha */}
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-neon-green/80">
                                    <Calendar size={14} /> Fecha de Despliegue
                                </label>
                                <input
                                    type="date"
                                    name="releaseDate"
                                    value={formData.releaseDate}
                                    onChange={handleChange}
                                    className={`cyber-input w-full bg-[#050505] border ${fieldErrors.releaseDate ? 'border-red-500/50' : 'border-white/10'} rounded-2xl py-4 px-6 text-white color-scheme-dark focus:outline-none focus:border-neon-green transition-all`}
                                />
                                {fieldErrors.releaseDate && <p className="text-[9px] font-black text-red-500 uppercase px-2">{fieldErrors.releaseDate}</p>}
                            </div>

                            {/* Precio */}
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-neon-green/80">
                                    <CurrencyEur size={14} /> Unidades de Valor
                                </label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    step="0.01"
                                    className={`cyber-input w-full bg-[#050505] border ${fieldErrors.price ? 'border-red-500/50' : 'border-white/10'} rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-neon-green transition-all`}
                                />
                                {fieldErrors.price && <p className="text-[9px] font-black text-red-500 uppercase px-2">{fieldErrors.price}</p>}
                            </div>
                        </div>

                        {/* Descripcion */}
                        <div className="mt-10 pt-10 border-t border-white/5 space-y-4">
                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-neon-green/80">
                                <TextAlignLeft size={14} /> Bitácora de Descripción
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={6}
                                className={`cyber-input w-full bg-[#050505] border ${fieldErrors.description ? 'border-red-500/50' : 'border-white/10'} rounded-3xl py-6 px-8 text-white resize-none focus:outline-none focus:border-neon-green transition-all`}
                            />
                            {fieldErrors.description && <p className="text-[9px] font-black text-red-500 uppercase px-2">{fieldErrors.description}</p>}
                        </div>

                        {/* Form Actions */}
                        <div className="flex flex-col-reverse sm:flex-row gap-4 justify-end mt-12">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="w-full sm:w-auto px-6 sm:px-10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full sm:w-auto px-8 sm:px-12 py-5 rounded-2xl bg-neon-green text-deep-black text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(57,255,20,0.2)] hover:shadow-neon-green/40 transition-all disabled:opacity-50"
                            >
                                {isLoading ? 'Cargando...' : submitButtonText}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}

