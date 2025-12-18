import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Target, Zap, Brain, Wrench, ArrowRight, Sparkles, AlertTriangle } from 'lucide-react';
import { getTranslation } from '../utils/translations';
import { cn } from "@/lib/utils";

const getArchetypeConfig = (lang) => {
  const isEnglish = lang === 'en';
  return {
    risk_taker: {
      icon: Zap,
      label: "Risk Taker",
      color: "text-red-400",
      bgColor: "bg-red-500/15",
      borderColor: "border-red-500/30",
      gradient: "from-red-500 to-orange-600",
      description: isEnglish
        ? "You tend to take big risks. The system will test how calculated your courage is."
        : "Kamu cenderung mengambil risiko besar. Sistemnya akan menguji seberapa terukur keberanianmu."
    },
    analyst: {
      icon: Brain,
      label: "Analyst",
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/15",
      borderColor: "border-cyan-500/30",
      gradient: "from-cyan-500 to-blue-600",
      description: isEnglish
        ? "You like data and precision. The system will force you to decide with incomplete data."
        : "Kamu suka data dan ketelitian. Sistemnya akan memaksa kamu memutuskan dengan data tidak lengkap."
    },
    builder: {
      icon: Wrench,
      label: "Builder",
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/15",
      borderColor: "border-emerald-500/30",
      gradient: "from-emerald-500 to-green-600",
      description: isEnglish
        ? "You focus on execution. The system will test how adaptive your solutions are."
        : "Kamu fokus pada eksekusi. Sistemnya akan menguji seberapa adaptif solusimu."
    },
    strategist: {
      icon: Target,
      label: "Strategist",
      color: "text-violet-400",
      bgColor: "bg-violet-500/15",
      borderColor: "border-violet-500/30",
      gradient: "from-violet-500 to-purple-600",
      description: isEnglish
        ? "You think long-term. The system will test the firmness of your decisions under pressure."
        : "Kamu berpikir jangka panjang. Sistemnya akan menguji ketegasan keputusanmu di bawah tekanan."
    }
  };
};

export default function CalibrationResult({ profile, language, onEnterArena }) {
  const t = getTranslation(language || profile.language);
  const archetypeConfig = getArchetypeConfig(language || profile.language);
  const archetype = archetypeConfig[profile.primary_archetype] || archetypeConfig.analyst;
  const Icon = archetype.icon;
  const isEnglish = (language || profile.language) === 'en';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-2xl mx-auto text-center relative z-10"
    >
      {/* Archetype Badge */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.2, type: "spring", duration: 0.8 }}
        className="relative inline-block mb-8"
      >
        <div className={cn(
          "w-28 h-28 rounded-3xl flex items-center justify-center bg-gradient-to-br shadow-lg",
          archetype.gradient
        )}>
          <Icon className="w-14 h-14 text-white" />
        </div>
        <motion.div
          className="absolute -top-2 -right-2 w-8 h-8 bg-zinc-900 border border-zinc-700 rounded-xl flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Sparkles className="w-4 h-4 text-violet-400" />
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <p className="text-zinc-500 text-sm font-mono mb-3 tracking-widest">
          {isEnglish ? 'INITIAL ARCHETYPE' : 'ARKETIPE AWAL'}
        </p>
        <h1 className={cn("text-5xl font-bold mb-5", archetype.color)}>
          {archetype.label}
        </h1>
        <p className="text-zinc-400 mb-10 max-w-md mx-auto text-lg leading-relaxed">
          {archetype.description}
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-2 gap-4 mb-8"
      >
        <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-colors">
          <p className="text-zinc-500 text-xs font-mono mb-2 tracking-wide">
            {t.calibration.result.startingDifficulty.toUpperCase()}
          </p>
          <p className="text-3xl font-bold text-white font-mono">
            Level {profile.current_difficulty}
          </p>
        </div>
        <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-colors">
          <p className="text-zinc-500 text-xs font-mono mb-2 tracking-wide">
            {t.calibration.result.riskAppetite.toUpperCase()}
          </p>
          <p className="text-3xl font-bold text-orange-400 font-mono">
            {Math.round(profile.risk_appetite * 100)}%
          </p>
        </div>
      </motion.div>

      {/* Warning */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-zinc-900/50 border border-orange-500/20 rounded-2xl p-5 mb-10 text-left relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl" />
        <div className="relative z-10 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
          <p className="text-zinc-400 text-sm leading-relaxed">
            <span className="text-orange-400 font-semibold">
              {isEnglish ? 'Note:' : 'Catatan:'}
            </span>{' '}
            {isEnglish
              ? 'Archetype is not a permanent label. The system will evolve it based on your real behavior in the arena. No shortcuts. No grind.'
              : 'Archetype bukan label permanen. Sistem akan mengubahnya berdasarkan perilaku nyata di arena. Tidak ada jalan pintas. Tidak ada grind.'}
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Button
          onClick={onEnterArena}
          variant="gradient"
          size="xl"
          className="group"
        >
          {t.calibration.result.enterArena}
          <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Button>
      </motion.div>
    </motion.div>
  );
}
