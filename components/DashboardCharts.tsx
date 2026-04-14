"use client";
import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

type GameChartProps = {
  games: {
    id: number;
    title: string;
    console: { name: string };
    releaseDate: string;
  }[];
};

export default function DashboardCharts({ games }: GameChartProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateMobile = () => setIsMobile(window.innerWidth <= 640);
    updateMobile();
    window.addEventListener("resize", updateMobile);
    return () => window.removeEventListener("resize", updateMobile);
  }, []);

  const gamesByConsole = games.reduce<Record<string, number>>((acc, game) => {
    const consoleName = game.console?.name ?? "Sin consola";
    acc[consoleName] = (acc[consoleName] ?? 0) + 1;
    return acc;
  }, {});

  const gamesByYear = games.reduce<Record<string, number>>((acc, game) => {
    const year = new Date(game.releaseDate).getFullYear().toString();
    acc[year] = (acc[year] ?? 0) + 1;
    return acc;
  }, {});

  const radarData = Object.entries(gamesByConsole).map(([name, value]) => ({ 
    subject: name, 
    A: value, 
    fullMark: Math.max(...Object.values(gamesByConsole)) + 1 
  }));

  const areaData = Object.entries(gamesByYear)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([year, count]) => ({ year, count }));

  return (
    <div className="space-y-10">
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card rounded-3xl p-6 border-l-4 border-l-neon-green">
          <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">Total Unidades</p>
          <p className="text-4xl font-black text-white glow-text">{games.length}</p>
        </div>
        <div className="glass-card rounded-3xl p-6 border-l-4 border-l-emerald-500">
          <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">Sistemas Activos</p>
          <p className="text-4xl font-black text-white glow-text">{Object.keys(gamesByConsole).length}</p>
        </div>
        <div className="glass-card rounded-3xl p-6 border-l-4 border-l-cyan-500">
          <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">Rango Temporal</p>
          <p className="text-4xl font-black text-white glow-text">
            {Object.keys(gamesByYear).length > 0 ? `${Math.min(...Object.keys(gamesByYear).map(Number))} - ${Math.max(...Object.keys(gamesByYear).map(Number))}` : "N/A"}
          </p>
        </div>
      </div>

      <div className="grid gap-10 xl:grid-cols-2">
        {/* Radar Chart Section */}
        <section className="glass-card rounded-[32px] p-8 shadow-2xl group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
             <div className="w-20 h-20 border-2 border-neon-green rounded-full animate-ping" />
          </div>
          <div className="mb-8">
            <h2 className="text-3xl font-black text-neon-green glow-text uppercase tracking-widest italic">Radar de Sistemas</h2>
            <p className="text-xs text-gray-600 mt-2 font-bold uppercase tracking-widest">Análisis de espectro de consolas</p>
          </div>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#1f2937" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 'bold' }} />
                <PolarRadiusAxis angle={30} domain={[0, 'auto']} axisLine={false} tick={false} />
                <Radar
                  name="Juegos"
                  dataKey="A"
                  stroke="#39ff14"
                  fill="#39ff14"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#000', border: '1px solid #39ff14', borderRadius: '12px', fontSize: '10px' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Area Chart Section */}
        <section className="glass-card rounded-[32px] p-8 shadow-2xl group">
          <div className="mb-8">
            <h2 className="text-3xl font-black text-neon-green glow-text uppercase tracking-widest italic">Pulsos Temporales</h2>
            <p className="text-xs text-gray-600 mt-2 font-bold uppercase tracking-widest">Cronología de lanzamientos detectados</p>
          </div>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#39ff14" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#39ff14" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#111827" vertical={false} />
                <XAxis 
                  dataKey="year" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#4b5563', fontSize: 12, fontWeight: 'bold' }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#4b5563', fontSize: 12, fontWeight: 'bold' }}
                />
                <Tooltip 
                   contentStyle={{ backgroundColor: '#000', border: '1px solid #39ff14', borderRadius: '12px', fontSize: '10px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#39ff14" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorCount)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </div>
  );
}
