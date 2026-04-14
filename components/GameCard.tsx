"use client";
import { Eye, Pencil, Trash } from "@phosphor-icons/react";

interface Console {
  id?: number;
  name: string;
  image?: string;
  releaseDate?: Date | string;
  manufacturer?: string;
  description?: string;
}

interface Game {
  id: number;
  title: string;
  cover: string | null;
  developer: string;
  releaseDate: Date | string;
  price: number;
  genre: string;
  description?: string;
  console_id?: number;
  console: Console;
}

interface GameCardProps {
  game: Game;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (game: Game) => void;
  getConsoleColor: (name: string) => string;
}

export default function GameCard({ game, onView, onEdit, onDelete, getConsoleColor }: GameCardProps) {
  const getCoverSrc = (cover: string | null) => {
    if (!cover) return "/imgs/No_image_available.svg";
    return cover.startsWith("http") || cover.startsWith("/") ? cover : `/${cover}`;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  const consoleColor = getConsoleColor(game.console.name);

  return (
    <div className="group relative overflow-hidden glass-card rounded-[2rem] p-4 transition-all duration-500 hover:glow-border hover:-translate-y-2">
      {/* Game Image */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-deep-black">
        <img
          src={getCoverSrc(game.cover)}
          alt={game.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={(e) => {
            e.currentTarget.src = "/imgs/No_image_available.svg";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-deep-black via-transparent to-transparent opacity-60" />
        
        {/* Console Tag */}
        <div 
          className="absolute left-3 top-3 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg"
          style={{ backgroundColor: consoleColor, boxShadow: `0 0 10px ${consoleColor}80` }}
        >
          {game.console.name}
        </div>

        {/* Price Tag */}
        <div className="absolute bottom-3 right-3 rounded-xl bg-neon-green/90 px-3 py-1.5 text-xs font-black text-deep-black shadow-[0_0_15px_rgba(57,255,20,0.5)]">
          {formatPrice(game.price)}
        </div>
      </div>

      {/* Content */}
      <div className="mt-4 px-2">
        <h3 className="truncate text-lg font-bold text-white transition-colors group-hover:text-neon-green" title={game.title}>
          {game.title}
        </h3>
        <p className="mt-1 flex items-center gap-2 text-xs font-medium text-gray-500">
          <span className="truncate">{game.developer}</span>
          <span className="h-1 w-1 rounded-full bg-gray-600" />
          <span className="shrink-0">{game.genre}</span>
        </p>

        {/* Actions Overlay/Bottom */}
        <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <button
            onClick={() => onView(game.id)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-gray-400 transition-all hover:bg-neon-green hover:text-deep-black shadow-lg"
            title="Ver"
          >
            <Eye size={20} weight="bold" />
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(game.id)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-warning transition-all hover:bg-warning hover:text-white"
              title="Editar"
            >
              <Pencil size={20} weight="bold" />
            </button>
            <button
              onClick={() => onDelete(game)}
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
