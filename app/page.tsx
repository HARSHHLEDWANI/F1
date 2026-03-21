import Link from "next/link";
import { ChevronRight, Activity, Users, Map, Cpu } from "lucide-react";

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Hero Header */}
      <header className="mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold tracking-widest uppercase mb-4">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          Live Telemetry Active
        </div>
        <h1 className="text-5xl md:text-8xl font-black tracking-tighter italic mb-4">
          F1 <span className="text-f1-red text-red-600">PREDICTOR</span>
        </h1>
        <p className="text-neutral-400 max-w-xl text-lg leading-relaxed">
          The next generation of Formula 1 analytics. Real-time telemetry, 
          AI-driven strategy, and deep-dive technical insights.
        </p>
      </header>

      {/* Main Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 auto-rows-[200px]">
        
        {/* Large Feature: AI Prediction Engine */}
        <div className="md:col-span-2 md:row-span-2 glass-card rounded-3xl p-8 relative overflow-hidden group flex flex-col justify-end">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <Cpu size={180} />
          </div>
          <div className="relative z-10">
            <div className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded w-fit mb-4">ENGINE V3.2</div>
            <h2 className="text-3xl font-bold mb-4">Race Intelligence</h2>
            <p className="text-neutral-400 mb-6 max-w-sm text-sm">
              Predict pit windows, tire degradation, and win probabilities 
              using our 2026 neural simulation model.
            </p>
            <Link href="/prediction" className="btn-tactile inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform">
              Launch Predictor <ChevronRight size={18} />
            </Link>
          </div>
        </div>

        {/* Medium Feature: Live Standings */}
        <div className="md:col-span-2 glass-card rounded-3xl p-6 flex flex-col justify-between hover:border-red-500/30 transition-colors">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <Activity size={18} className="text-red-500" />
              <h3 className="text-xl font-bold tracking-tight">Driver Standings</h3>
            </div>
            <span className="text-[10px] font-mono text-neutral-500 border border-white/10 px-2 py-1 rounded">RACE 04/24</span>
          </div>
          <div className="mt-4 space-y-2">
            {[
              { pos: '01', name: 'VERSTAPPEN', pts: '392', color: 'bg-blue-600' },
              { pos: '02', name: 'NORRIS', pts: '312', color: 'bg-orange-500' },
              { pos: '03', name: 'LECLERC', pts: '284', color: 'bg-red-600' }
            ].map((d) => (
              <div key={d.pos} className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/5 group hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-neutral-500 text-xs">{d.pos}</span>
                  <div className={`w-1 h-4 ${d.color} rounded-full`} />
                  <span className="font-bold text-sm tracking-wide group-hover:translate-x-1 transition-transform">{d.name}</span>
                </div>
                <span className="font-mono text-neutral-400 text-xs">{d.pts} PTS</span>
              </div>
            ))}
          </div>
        </div>

        {/* Small Feature: Constructors */}
        <div className="glass-card rounded-3xl p-6 hover:border-blue-500/30 transition-colors group">
          <Users size={24} className="mb-4 text-blue-500" />
          <h3 className="text-lg font-bold mb-1">Teams</h3>
          <p className="text-xs text-neutral-500 mb-4">Technical specs & aero updates.</p>
          <Link href="/teams" className="text-xs font-bold uppercase tracking-widest text-white/50 group-hover:text-white transition-colors">View All →</Link>
        </div>

        {/* Small Feature: Circuits */}
        <div className="glass-card rounded-3xl p-6 hover:border-green-500/30 transition-colors group">
          <Map size={24} className="mb-4 text-green-500" />
          <h3 className="text-lg font-bold mb-1">Tracks</h3>
          <p className="text-xs text-neutral-500 mb-4">24 Global circuits. 3D heatmaps.</p>
          <Link href="/tracks" className="text-xs font-bold uppercase tracking-widest text-white/50 group-hover:text-white transition-colors">Explore →</Link>
        </div>

      </div>

      {/* Ribbon Stats */}
      <div className="mt-12 pt-8 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-8">
        {[
          { label: 'Total Races', val: '24' },
          { label: 'Active Teams', val: '10' },
          { label: 'Grid Drivers', val: '20' },
          { label: 'API Latency', val: '14ms' },
        ].map((s) => (
          <div key={s.label}>
            <p className="text-neutral-500 text-[10px] uppercase tracking-[0.2em] mb-1">{s.label}</p>
            <p className="text-3xl font-mono font-bold italic tracking-tighter">{s.val}</p>
          </div>
        ))}
      </div>
    </div>
  );
}