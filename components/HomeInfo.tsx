"use client";
import Link from 'next/link';

import Image from "next/image";
import { Fingerprint, UserPlus } from '@phosphor-icons/react';

export default function HomeInfo() {
  return (
    <div className="min-h-screen bg-deep-black flex items-center justify-center relative overflow-hidden">

      {/* Background image with neon green filter */}
      <div
        className="absolute inset-0 bg-[url('/imgs/bg-home.jpeg')] bg-cover bg-center"
        style={{ filter: "hue-rotate(210deg) saturate(2) brightness(0.4)" }}
      />

      {/* Neon green radial glow overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(57,255,20,0.08)_0%,_transparent_70%)]" />

      {/* Scan lines effect */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(57,255,20,0.05) 2px, rgba(57,255,20,0.05) 4px)" }}
      />

      {/* Dark vignette at edges */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_40%,_rgba(0,0,0,0.8)_100%)]" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-md px-6">

        {/* Logo */}
        <div className="mb-2 relative">
          <div className="absolute -inset-4 bg-neon-green/5 blur-3xl rounded-full" />
          <Image
            src="/imgs/logonextjs.png"
            alt="GameNext.js Logo"
            width={380}
            height={190}
            className="relative drop-shadow-[0_0_25px_rgba(57,255,20,0.4)]"
            style={{ mixBlendMode: "screen" }}
          />
        </div>

        {/* Decorative tag line */}
        <p className="text-[10px] uppercase tracking-[0.5em] font-black text-neon-green/60 mb-6">
          Sistema de Gestión // Biblioteca Digital
        </p>

        {/* Description */}
        <p className="text-sm text-gray-400 leading-relaxed mb-10 max-w-sm">
          <strong className="text-white">GameNext.js</strong> es una plataforma moderna para gestionar y organizar
          tu biblioteca de videojuegos. Autenticación segura, rendimiento rápido y
          datos gestionados en la nube.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <Link
            href="handler/sign-in"
            className="flex items-center justify-center gap-3 w-full sm:w-auto px-10 py-4 rounded-2xl bg-neon-green text-deep-black text-xs font-black uppercase tracking-widest shadow-[0_0_30px_rgba(57,255,20,0.3)] hover:shadow-[0_0_40px_rgba(57,255,20,0.5)] transition-all"
          >
            <Fingerprint size={20} weight="bold" />
            Iniciar Sesión
          </Link>

          <Link
            href="handler/sign-up"
            className="flex items-center justify-center gap-3 w-full sm:w-auto px-10 py-4 rounded-2xl border border-neon-green/30 text-xs font-black uppercase tracking-widest text-neon-green hover:border-neon-green hover:shadow-[0_0_20px_rgba(57,255,20,0.15)] transition-all"
          >
            <UserPlus size={20} weight="bold" />
            Registrarse
          </Link>
        </div>

        {/* Bottom Label */}
        <p className="mt-16 text-[9px] uppercase tracking-[0.4em] text-white/10 font-bold">
          Powered by Next.js + Prisma + Neon
        </p>
      </div>
    </div>
  );
}