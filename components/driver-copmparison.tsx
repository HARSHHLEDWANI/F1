"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sword, Zap, Shield, Target, Gauge } from 'lucide-react';

const drivers = [
  { id: 1, name: "Max Verstappen", team: "Red Bull", stats: { pace: 99, aero: 95, tire: 92, qualy: 98 }, color: "text-blue-500", bg: "bg-blue-500/10" },
  { id: 2, name: "Lando Norris", team: "McLaren", stats: { pace: 96, aero: 94, tire: 90, qualy: 97 }, color: "text-orange-500", bg: "bg-orange-500/10" },
  { id: 3, name: "Lewis Hamilton", team: "Ferrari", stats: { pace: 95, aero: 92, tire: 98, qualy: 94 }, color: "text-red-600", bg: "bg-red-600/10" },
];

export default function DriverComparison() {
  const [d1, setD1] = useState(drivers[0]);
  const [d2, setD2] = useState(drivers[1]);

  const StatRow = ({ label, icon: Icon, val1, val2 }: any) => {
    const total = val1 + val2;
    const p1 = (val1 / total) * 100;
    
    return (
      <div className="space-y-2 mb-6">
        <div className="flex justify-between items-center text-[10px] font-bold tracking-widest uppercase text-neutral-500">
          <span className={d1.color}>{val1}</span>
          <div className="flex items-center gap-1">
            <Icon size={12} /> {label}
          </div>
          <span className={d2.color}>{val2}</span>
        </div>
        <div className="h-1.5 w-full bg-neutral-800 rounded-full flex overflow-hidden border border-white/5">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${p1}%` }}
            className={`h-full ${d1.bg.replace('/10', '')} border-r border-black/20`}
          />
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${100 - p1}%` }}
            className={`h-full ${d2.bg.replace('/10', '')}`}
          />
        </div>
      </div>
    );
  };

  return (
    <section className="glass-card rounded-[2rem] p-8 mt-8 border border-white/5 overflow-hidden relative">
      <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
        
        {/* Driver 1 Selector */}
        <div className={`flex-1 w-full p-6 rounded-2xl ${d1.bg} border border-white/5 transition-all`}>
          <p className="text-[10px] font-bold text-neutral-500 mb-1">CHALLENGER A</p>
          <select 
            className="bg-transparent text-2xl font-black italic w-full outline-none appearance-none cursor-pointer"
            onChange={(e) => setD1(drivers.find(d => d.id === Number(e.target.value))!)}
            value={d1.id}
          >
            {drivers.map(d => <option key={d.id} value={d.id} className="bg-black">{d.name}</option>)}
          </select>
          <p className={`text-sm font-medium ${d1.color}`}>{d1.team}</p>
        </div>

        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10 shadow-2xl">
            <Sword className="text-neutral-400 rotate-45" size={20} />
          </div>
          <div className="h-12 w-[1px] bg-gradient-to-b from-white/10 to-transparent mt-2" />
        </div>

        {/* Driver 2 Selector */}
        <div className={`flex-1 w-full p-6 rounded-2xl ${d2.bg} border border-white/5 transition-all text-right`}>
          <p className="text-[10px] font-bold text-neutral-500 mb-1">CHALLENGER B</p>
          <select 
            className="bg-transparent text-2xl font-black italic w-full outline-none appearance-none cursor-pointer text-right"
            onChange={(e) => setD2(drivers.find(d => d.id === Number(e.target.value))!)}
            value={d2.id}
          >
            {drivers.map(d => <option key={d.id} value={d.id} className="bg-black text-right">{d.name}</option>)}
          </select>
          <p className={`text-sm font-medium ${d2.color}`}>{d2.team}</p>
        </div>
      </div>

      {/* Stats Comparison Area */}
      <div className="mt-12 max-w-2xl mx-auto">
        <StatRow label="Race Pace" icon={Zap} val1={d1.stats.pace} val2={d2.stats.pace} />
        <StatRow label="Qualifying" icon={Target} val1={d1.stats.qualy} val2={d2.stats.qualy} />
        <StatRow label="Aero Efficiency" icon={Gauge} val1={d1.stats.aero} val2={d2.stats.aero} />
        <StatRow label="Tyre Management" icon={Shield} val1={d1.stats.tire} val2={d2.stats.tire} />
      </div>

      {/* Decorative Background Text */}
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-[12rem] font-black italic text-white/[0.02] pointer-events-none select-none uppercase leading-none">
        VS
      </div>
    </section>
  );
}