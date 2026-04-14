"use client";
import { Eye, Pencil, Trash } from "@phosphor-icons/react";

interface Console {
  id: number;
  name: string;
  image: string | null;
  manufacturer: string;
  releaseDate: Date | string;
  description: string;
}

interface ConsoleCardProps {
  console: Console;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (console: Console) => void;
  accentColor?: string;
}

export default function ConsoleCard({ console: consoleData, onView, onEdit, onDelete, accentColor = "#39ff14" }: ConsoleCardProps) {
  const getImageSrc = (image: string | null) => {
    if (!image || image === "no-image.png") return "/imgs/No_image_available.svg";
    return image.startsWith("http") || image.startsWith("/") ? image : `/${image}`;
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long"
    });
  };

  return (
    <div className="group relative overflow-hidden glass-card rounded-[2rem] p-4 transition-all duration-500 hover:glow-border hover:-translate-y-2">
      {/* Console Image */}
      <div className="relative aspect-video overflow-hidden rounded-2xl bg-deep-black">
        <img
          src={getImageSrc(consoleData.image)}
          alt={consoleData.name}
          className="h-full w-full object-contain p-4 transition-transform duration-700 group-hover:scale-110"
          onError={(e) => {
            e.currentTarget.src = "/imgs/No_image_available.svg";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-deep-black via-transparent to-transparent opacity-40" />

        {/* Manufacturer Tag */}
        <div
          className="absolute left-3 top-3 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg"
          style={{ backgroundColor: accentColor, boxShadow: `0 0 10px ${accentColor}80` }}
        >
          {consoleData.manufacturer}
        </div>
      </div>

      {/* Content */}
      <div className="mt-4 px-1 sm:px-2">
        <h3 className="truncate text-lg sm:text-xl font-black text-white uppercase tracking-tighter transition-colors group-hover:text-neon-green" title={consoleData.name}>
          {consoleData.name}
        </h3>
        <p className="mt-1 flex items-center gap-2 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-500">
          <span>{formatDate(consoleData.releaseDate)}</span>
        </p>

        <p className="mt-3 text-[11px] sm:text-xs text-gray-400 line-clamp-2 leading-relaxed">
          {consoleData.description}
        </p>

        {/* Actions */}
        <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-4 opacity-100 transition-opacity duration-300 lg:opacity-0 lg:group-hover:opacity-100">
          <button
            onClick={() => onView(consoleData.id)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-gray-400 transition-all hover:bg-neon-green hover:text-deep-black shadow-lg"
            title="Ver"
          >
            <Eye size={20} weight="bold" />
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(consoleData.id)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-warning transition-all hover:bg-warning hover:text-white"
              title="Editar"
            >
              <Pencil size={20} weight="bold" />
            </button>
            <button
              onClick={() => onDelete(consoleData)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-error transition-all hover:bg-error hover:text-white"
              title="Eliminar"
            >
              <Trash size={20} weight="bold" />
            </button>
          </div>
        </div>
      </div>

      {/* Decorative Glow */}
      <div className="absolute -inset-1 z-[-1] rounded-[2rem] bg-neon-green opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-5" />
    </div>
  );
}
