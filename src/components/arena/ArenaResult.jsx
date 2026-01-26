import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Award,
  Clock,
  Target,
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import { cn } from "@/lib/utils";

const archetypeLabels = {
  risk_taker: 'Risk Taker',
  analyst: 'Analyst',
  builder: 'Builder',
  strategist: 'Strategist'
};

export default function ArenaResult({
  result,
  problem,
  onContinue,
  onRetry
}) {
  const {
    xp_earned,
    xp_breakdown,
    level_up_achieved,
    criteria_met,
    ai_evaluation,
    ai_insight,
    time_spent_seconds
  } = result;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="min-h-screen nx-page nx-bg-wires flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl nx-panel nx-sharp p-6"
      >
        {/* Level up indicator */}
        {level_up_achieved ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-[var(--acid-lime)] border-[3px] border-[var(--ink)] nx-sharp shadow-[4px_4px_0_var(--ink)]">
              <TrendingUp className="w-6 h-6 text-[var(--ink)]" />
              <span className="text-[var(--ink)] font-bold text-lg">LEVEL UP</span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-[var(--paper-2)] border-[3px] border-[var(--ink)] nx-sharp shadow-[4px_4px_0_var(--ink)]">
              <Minus className="w-6 h-6 text-[var(--ink)]" />
              <span className="text-[var(--ink)] font-bold text-lg">STAGNASI</span>
            </div>
          </motion.div>
        )}

        {/* Problem completed */}
        <div className="text-center mb-8">
          <span className="text-[var(--ink-2)] font-mono text-sm">{problem.problem_id}</span>
          <h1 className="text-2xl font-bold text-[var(--ink)] mt-1">{problem.title}</h1>
          <div className="flex items-center justify-center gap-4 mt-3 text-[var(--ink-2)] text-sm">
            <div className="flex items-center gap-1">
              <Target className="w-4 h-4" />
              <span>Difficulty {problem.difficulty}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{formatTime(time_spent_seconds)}</span>
            </div>
          </div>
        </div>

        {/* XP Breakdown - Courage First (Friksi #2) */}
        <div className="nx-panel-static nx-sharp p-6 mb-6">
          <h2 className="text-[var(--ink)] text-sm font-semibold mb-4">XP EARNED</h2>

          {/* COURAGE XP - Shows First */}
          {xp_breakdown?.courage > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4"
            >
              <div className="flex items-center justify-between p-4 nx-sharp bg-[var(--acid-yellow)] border-[3px] border-[var(--ink)] shadow-[4px_4px_0_var(--ink)]">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🔥</span>
                  <div>
                    <span className="text-[var(--ink)] font-semibold">Courage XP</span>
                    <p className="text-xs text-[var(--ink-2)]">Reward untuk keberanian mencoba</p>
                  </div>
                </div>
                <span className="font-bold font-mono text-xl text-[var(--ink)]">
                  +{xp_breakdown.courage}
                </span>
              </div>

              {/* Courage breakdown details */}
              {xp_breakdown.courage_breakdown && (
                <div className="mt-2 grid grid-cols-2 gap-2 pl-4">
                  {Object.entries(xp_breakdown.courage_breakdown).map(([key, value]) => (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="text-xs text-[var(--ink-2)] flex justify-between"
                    >
                      <span className="capitalize">{key.replace('_', ' ')}</span>
                      <span className="text-[var(--ink-2)]">+{value}</span>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Archetype XP - Shows Second */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: xp_breakdown?.courage > 0 ? 0.5 : 0 }}
            className="grid grid-cols-2 gap-4"
          >
            {Object.entries(xp_breakdown || {})
              .filter(([key]) => !['courage', 'courage_breakdown'].includes(key))
              .map(([archetype, xp]) => (
                <div
                  key={archetype}
                  className={cn(
                    "flex items-center justify-between p-3 nx-sharp border-[2px] border-[var(--ink)]",
                    xp > 0 ? "bg-[var(--acid-lime)]" : "bg-[var(--paper-2)]"
                  )}
                >
                  <span className="text-[var(--ink)] capitalize">
                    {archetypeLabels[archetype] || archetype}
                  </span>
                  <span className={cn(
                    "font-bold font-mono",
                    xp > 0 ? "text-[var(--ink)]" : "text-[var(--ink-2)]"
                  )}>
                    {xp > 0 ? `+${xp}` : '0'}
                  </span>
                </div>
              ))}
          </motion.div>
        </div>


        {/* Criteria met */}
        {criteria_met && criteria_met.length > 0 && (
          <div className="nx-panel-static nx-sharp p-6 mb-6">
            <h2 className="text-[var(--ink)] text-sm font-semibold mb-4">KRITERIA TERPENUHI</h2>
            <div className="space-y-2">
              {criteria_met.map((criteria, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[var(--acid-lime)] nx-sharp border border-[var(--ink)]" />
                  <span className="text-[var(--ink)] text-sm">{criteria}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Evaluation */}
        {ai_evaluation && (
          <div className="nx-panel-static nx-sharp p-6 mb-6 border-[3px] border-[var(--ink)] bg-[var(--paper-2)]">
            <h2 className="text-[var(--ink)] text-sm font-semibold mb-3">EVALUASI MENTOR</h2>
            <p className="text-[var(--ink)] italic">"{ai_evaluation}"</p>
          </div>
        )}

        {/* Insight */}
        {ai_insight && (
          <div className="nx-panel-static nx-sharp p-6 mb-6">
            <h2 className="text-[var(--ink)] text-sm font-semibold mb-3">INSIGHT</h2>
            <p className="text-[var(--ink)] text-sm">{ai_insight}</p>
          </div>
        )}

        {/* Social Comparison Stats - Savage style */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="nx-panel-static nx-sharp p-5 mb-8 bg-[var(--paper-2)]"
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xl">📊</span>
            <span className="text-[var(--ink)] font-semibold text-sm">PERBANDINGAN</span>
          </div>
          <p className="text-[var(--ink)] text-sm leading-relaxed">
            {xp_earned > 15
              ? "🔥 Kamu mengambil risiko di atas rata-rata user lain. Berani!"
              : xp_earned > 5
                ? "⚡ Keputusanmu seimbang antara risiko dan keamanan."
                : "🛡️ Kamu memilih pendekatan lebih aman dari 64% user lain."
            }
          </p>
          <p className="text-[var(--ink-2)] text-xs mt-2 italic">
            Berdasarkan pilihan user di problem serupa
          </p>
        </motion.div>

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={onRetry}
            className="flex-1"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Coba Masalah Lain
          </Button>
          <Button
            variant="gradient"
            onClick={onContinue}
            className="flex-1 font-bold"
          >
            Lanjut ke Arena
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
