"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    CloudArrowUp,
    X,
    Hash,
    Buildings,
    Calendar,
    TextAlignLeft,
    Check
} from "@phosphor-icons/react";
import { consoleSchema } from "@/lib/validations/console";
import { ZodError } from "zod";

interface ConsoleFormData {
    name: string;
    image: string;
    manufacturer: string;
    releaseDate: string;
    description: string;
}

interface ConsoleFormProps {
    initialData?: Partial<ConsoleFormData>;
    submitButtonText: string;
    consoleId?: number;
}

export default function ConsoleForm({ initialData, submitButtonText, consoleId }: ConsoleFormProps) {
    const router = useRouter();
    const [formData, setFormData] = useState<ConsoleFormData>({
        name: initialData?.name || "",
        image: initialData?.image || "",
        manufacturer: initialData?.manufacturer || "",
        releaseDate: initialData?.releaseDate || "",
        description: initialData?.description || "",
    });

    const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>(initialData?.image || "");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState<React.ReactNode>("");

    useEffect(() => {
        if (!selectedImageFile) return;
        const objectUrl = URL.createObjectURL(selectedImageFile);
        setImagePreview(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [selectedImageFile]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (fieldErrors[name]) {
            setFieldErrors(prev => {
                const next = { ...prev };
                delete next[name];
                return next;
            });
        }
    };

    const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        setSelectedImageFile(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setFieldErrors({});

        try {
            consoleSchema.parse({
                ...formData,
                image: selectedImageFile ? "file-pending" : (formData.image || null)
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
        formDataToSend.append("name", formData.name.trim());
        formDataToSend.append("manufacturer", formData.manufacturer.trim());
        formDataToSend.append("releaseDate", formData.releaseDate);
        formDataToSend.append("description", formData.description.trim());

        if (selectedImageFile) formDataToSend.append("image_file", selectedImageFile);
        if (formData.image && formData.image.trim() !== "") formDataToSend.append("image", formData.image.trim());

        try {
            const url = consoleId ? `/api/consoles/${consoleId}` : "/api/consoles";
            const response = await fetch(url, {
                method: consoleId ? "PUT" : "POST",
                body: formDataToSend,
            });

            const data = await response.json();

            if (response.ok) {
                setSuccessMessage(consoleId ? (
                    <>Sincronización de <strong className="text-white">{formData.name}</strong> completada. Hardware actualizado en la red central.</>
                ) : (
                    <>Nuevo hardware detectado: <strong className="text-white">{formData.name}</strong> ha sido integrado en el sistema.</>
                ));
                setShowSuccessModal(true);
            } else {
                if (data.details) {
                    const errors: Record<string, string> = {};
                    data.details.forEach((d: any) => { errors[d.field] = d.message; });
                    setFieldErrors(errors);
                }
                setError(data.error || "Fallo en la sincronización de hardware");
            }
        } catch (err) {
            setError("Error crítico de red detectado");
        } finally {
            setIsLoading(false);
        }
    };

    const getImageSrc = (image: string | null) => {
        if (!image || typeof image !== "string" || image.trim() === "" || image === "no-image.png") return "/imgs/No_image_available.svg";
        const trimmed = image.trim();
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
                        <p className="text-gray-400 mb-10 text-lg leading-relaxed">{successMessage}</p>
                        <div className="flex justify-center">
                            <button onClick={() => router.push("/consolas")} className="w-full sm:w-auto px-12 py-5 rounded-2xl bg-neon-green text-deep-black text-[10px] font-black uppercase tracking-[0.2em] shadow-lg hover:shadow-neon-green/40 duration-300">Continuar</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center mb-12">
                <div>
                    <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter italic glow-text">
                        {consoleId ? 'Modificar Consola' : 'Nueva Consola'}
                    </h1>
                    <p className="text-[10px] uppercase tracking-[0.4em] font-black text-neon-green/60 mt-1">Sincronización de Hardware // System Entry</p>
                </div>
                <button onClick={() => router.back()} className="h-14 w-14 flex items-center justify-center rounded-2xl border border-white/5 bg-white/[0.02] text-gray-500 hover:text-white transition-all shadow-xl">
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
                    {/* Media Preview */}
                    <div className="space-y-6">
                        <div className={`group relative aspect-square rounded-[2.5rem] p-1 bg-gradient-to-b ${fieldErrors.image ? 'from-red-500/40' : 'from-white/10'} to-transparent`}>
                            <div className="relative h-full w-full overflow-hidden rounded-[2.3rem] bg-black border border-white/5">
                                <img
                                    src={imagePreview ? getImageSrc(imagePreview) : getImageSrc(formData.image)}
                                    className="w-full h-full object-contain p-6 opacity-80 group-hover:opacity-100 transition-opacity"
                                    alt="Vista previa"
                                    onError={(e) => e.currentTarget.src = "/imgs/No_image_available.svg"}
                                />
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <CloudArrowUp size={48} className="text-neon-green mb-2" />
                                    <p className="text-[10px] font-black uppercase text-neon-green">Cargar Hardware</p>
                                </div>
                                <input type="file" onChange={handleImageFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                            </div>
                        </div>
                        {fieldErrors.image && <p className="text-[9px] font-black text-red-500 uppercase text-center">{fieldErrors.image}</p>}
                    </div>

                    {/* Form Fields */}
                    <div className="glass-card rounded-[2.5rem] sm:rounded-[3rem] p-6 sm:p-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-neon-green/80"><Hash size={14} /> Nombre del Hardware</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Ej: PlayStation 5" className={`cyber-input w-full bg-[#050505] border ${fieldErrors.name ? 'border-red-500/50' : 'border-white/10'} rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-neon-green transition-all`} />
                                {fieldErrors.name && <p className="text-[9px] font-black text-red-500 uppercase px-2">{fieldErrors.name}</p>}
                            </div>

                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-neon-green/80"><Buildings size={14} /> Fabricante</label>
                                <input type="text" name="manufacturer" value={formData.manufacturer} onChange={handleChange} placeholder="Ej: Sony Interactive Entertainment" className={`cyber-input w-full bg-[#050505] border ${fieldErrors.manufacturer ? 'border-red-500/50' : 'border-white/10'} rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-neon-green transition-all`} />
                                {fieldErrors.manufacturer && <p className="text-[9px] font-black text-red-500 uppercase px-2">{fieldErrors.manufacturer}</p>}
                            </div>

                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-neon-green/80"><Calendar size={14} /> Fecha de Lanzamiento</label>
                                <input type="date" name="releaseDate" value={formData.releaseDate} onChange={handleChange} className={`cyber-input w-full bg-[#050505] border ${fieldErrors.releaseDate ? 'border-red-500/50' : 'border-white/10'} rounded-2xl py-4 px-6 text-white color-scheme-dark focus:outline-none focus:border-neon-green transition-all`} />
                                {fieldErrors.releaseDate && <p className="text-[9px] font-black text-red-500 uppercase px-2">{fieldErrors.releaseDate}</p>}
                            </div>
                        </div>

                        <div className="mt-8 sm:mt-10 pt-8 sm:pt-10 border-t border-white/5 space-y-4">
                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-neon-green/80"><TextAlignLeft size={14} /> Especificaciones / Descripción</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} rows={6} className={`cyber-input w-full bg-[#050505] border ${fieldErrors.description ? 'border-red-500/50' : 'border-white/10'} rounded-3xl py-6 px-8 text-white resize-none focus:outline-none focus:border-neon-green transition-all`} />
                            {fieldErrors.description && <p className="text-[9px] font-black text-red-500 uppercase px-2">{fieldErrors.description}</p>}
                        </div>

                        <div className="flex flex-col-reverse sm:flex-row gap-4 justify-end mt-10 sm:mt-12">
                            <button type="button" onClick={() => router.back()} className="w-full sm:w-auto px-10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-all">Cancelar</button>
                            <button type="submit" disabled={isLoading} className="w-full sm:w-auto px-12 py-5 rounded-2xl bg-neon-green text-deep-black text-[10px] font-black uppercase tracking-[0.2em] shadow-lg hover:shadow-neon-green/40 transition-all disabled:opacity-50">
                                {isLoading ? 'CARGANDO...' : submitButtonText}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
