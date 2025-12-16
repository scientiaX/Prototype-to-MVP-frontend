import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Target, Zap, Brain, Wrench, ArrowRight } from 'lucide-react';

const archetypeConfig = {
  risk_taker: {
    icon: Zap,
    label: "Risk Taker",
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
    description: "Kamu cenderung mengambil risiko besar. Sistemnya akan menguji seberapa terukur keberanianmu."
  },
  analyst: {
    icon: Brain,
    label: "Analyst",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    description: "Kamu suka data dan ketelitian. Sistemnya akan memaksa kamu memutuskan dengan data tidak lengkap."
  },
  builder: {
    icon: Wrench,
    label: "Builder",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/30",
    description: "Kamu fokus pada eksekusi. Sistemnya akan menguji seberapa adaptif solusimu."
  },
  strategist: {
    icon: Target,
    label: "Strategist",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
    description: "Kamu berpikir jangka panjang. Sistemnya akan menguji ketegasan keputusanmu di bawah tekanan."
  }
};

export default function CalibrationResult({ profile, onEnterArena }) {
  const archetype = archetypeConfig[profile.primary_archetype] || archetypeConfig.analyst;
  const Icon = archetype.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-2xl mx-auto text-center"
    >
      {/* Archetype Badge */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring" }}
        className={`inline-flex items-center justify-center w-24 h-24 rounded-2xl ${archetype.bgColor} ${archetype.borderColor} border-2 mb-6`}
      >
        <Icon className={`w-12 h-12 ${archetype.color}`} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <p className="text-zinc-500 text-sm font-mono mb-2">INITIAL ARCHETYPE</p>
        <h1 className={`text-4xl font-bold ${archetype.color} mb-4`}>
          {archetype.label}
        </h1>
        <p className="text-zinc-400 mb-8 max-w-md mx-auto">
          {archetype.description}
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-2 gap-4 mb-8"
      >
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
          <p className="text-zinc-500 text-xs font-mono mb-1">STARTING DIFFICULTY</p>
          <p className="text-2xl font-bold text-white">
            Level {profile.current_difficulty}
          </p>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
          <p className="text-zinc-500 text-xs font-mono mb-1">RISK APPETITE</p>
          <p className="text-2xl font-bold text-orange-500">
            {Math.round(profile.risk_appetite * 100)}%
          </p>
        </div>
      </motion.div>

      {/* Warning */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-zinc-900/30 border border-zinc-800 rounded-lg p-4 mb-8 text-left"
      >
        <p className="text-zinc-500 text-sm">
          <span className="text-orange-500 font-bold">Peringatan:</span> Archetype bukan label permanen. 
          Sistem akan mengubahnya berdasarkan perilaku nyata di arena. 
          Tidak ada jalan pintas. Tidak ada grind.
        </p>
      </motion.div>

      <Button 
        onClick={onEnterArena}
        className="bg-orange-500 hover:bg-orange-600 text-black font-bold px-8 py-6 text-lg"
      >
        Masuk Arena
        <ArrowRight className="ml-2 w-5 h-5" />
      </Button>
    </motion.div>
  );
}
