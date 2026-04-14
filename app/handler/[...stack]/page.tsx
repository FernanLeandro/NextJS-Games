import { StackHandler } from "@stackframe/stack";
import BackHomeButton from "@/components/BackHome";

export default function Handler() {
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

      {/* Auth Card */}
      <div className="relative z-10 w-full max-w-md px-4">
        <div className="rounded-[2.5rem] border border-neon-green/20 bg-black/70 backdrop-blur-xl p-8 shadow-[0_0_60px_rgba(57,255,20,0.05)]">
          
          {/* Top accent line */}
          <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-neon-green/50 to-transparent mb-8" />

          <StackHandler fullPage={false} />
          
          {/* Bottom nav */}
          <div className="mt-6 pt-6 border-t border-white/5 flex justify-center">
            <BackHomeButton />
          </div>

          {/* Bottom accent line */}
          <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-neon-green/20 to-transparent mt-8" />
        </div>

        <p className="text-center mt-6 text-[9px] uppercase tracking-[0.4em] text-white/10 font-bold">
          GameNext.js // Sistema de Autenticación Segura
        </p>
      </div>
    </div>
  );
}
