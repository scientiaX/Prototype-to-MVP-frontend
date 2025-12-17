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
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl"
      >
        {/* Level up indicator */}
        {level_up_achieved ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-green-500/20 border border-green-500/50 rounded-full">
              <TrendingUp className="w-6 h-6 text-green-500" />
              <span className="text-green-500 font-bold text-lg">LEVEL UP</span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-zinc-800/50 border border-zinc-700 rounded-full">
              <Minus className="w-6 h-6 text-zinc-500" />
              <span className="text-zinc-400 font-bold text-lg">STAGNASI</span>
            </div>
          </motion.div>
        )}

        {/* Problem completed */}
        <div className="text-center mb-8">
          <span className="text-zinc-600 font-mono text-sm">{problem.problem_id}</span>
          <h1 className="text-2xl font-bold text-white mt-1">{problem.title}</h1>
          <div className="flex items-center justify-center gap-4 mt-3 text-zinc-500 text-sm">
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

        {/* XP Breakdown */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-6">
          <h2 className="text-zinc-400 text-sm font-semibold mb-4">XP EARNED</h2>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(xp_breakdown || {}).map(([archetype, xp]) => (
              <div 
                key={archetype}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg",
                  xp > 0 ? "bg-green-500/10 border border-green-500/30" : "bg-zinc-900"
                )}
              >
                <span className="text-zinc-300 capitalize">
                  {archetypeLabels[archetype] || archetype}
                </span>
                <span className={cn(
                  "font-bold font-mono",
                  xp > 0 ? "text-green-500" : "text-zinc-600"
                )}>
                  {xp > 0 ? `+${xp}` : '0'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Criteria met */}
        {criteria_met && criteria_met.length > 0 && (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-6">
            <h2 className="text-zinc-400 text-sm font-semibold mb-4">KRITERIA TERPENUHI</h2>
            <div className="space-y-2">
              {criteria_met.map((criteria, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-zinc-300 text-sm">{criteria}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Evaluation */}
        {ai_evaluation && (
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-6 mb-6">
            <h2 className="text-orange-500 text-sm font-semibold mb-3">EVALUASI MENTOR</h2>
            <p className="text-zinc-300 italic">"{ai_evaluation}"</p>
          </div>
        )}

        {/* Insight */}
        {ai_insight && (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-8">
            <h2 className="text-zinc-400 text-sm font-semibold mb-3">INSIGHT</h2>
            <p className="text-zinc-300 text-sm">{ai_insight}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={onRetry}
            className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Coba Masalah Lain
          </Button>
          <Button
            onClick={onContinue}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-black font-bold"
          >
            Lanjut ke Arena
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
