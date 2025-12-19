import React from 'react';
import { motion } from 'framer-motion';
import { Clock, AlertTriangle, Target, ChevronRight, Zap } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function ProblemCard({ problem, onStart }) {
  const getDifficultyConfig = (difficulty) => {
    if (difficulty <= 3) {
      return {
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/15',
        border: 'border-emerald-500/30',
        label: 'Easy',
        gradient: 'from-emerald-500 to-green-600'
      };
    } else if (difficulty <= 6) {
      return {
        color: 'text-yellow-400',
        bg: 'bg-yellow-500/15',
        border: 'border-yellow-500/30',
        label: 'Medium',
        gradient: 'from-yellow-500 to-orange-500'
      };
    } else {
      return {
        color: 'text-red-400',
        bg: 'bg-red-500/15',
        border: 'border-red-500/30',
        label: 'Hard',
        gradient: 'from-red-500 to-rose-600'
      };
    }
  };

  const difficulty = getDifficultyConfig(problem.difficulty);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="group relative h-full"
    >
      {/* Hover glow effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500/0 via-orange-500/0 to-red-500/0 rounded-2xl blur-lg opacity-0 group-hover:opacity-30 group-hover:from-orange-500/20 group-hover:to-red-500/20 transition-all duration-500" />

      <div className="relative h-full bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-2xl p-6 hover:border-orange-500/30 transition-all duration-300 flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0 pr-3">
            <span className="text-zinc-600 font-mono text-xs">{problem.problem_id}</span>
            <h3 className="text-xl font-bold text-white mt-1 group-hover:text-orange-400 transition-colors line-clamp-2">
              {problem.title}
            </h3>
          </div>
          <div className={cn(
            "flex flex-col items-center justify-center w-14 h-14 rounded-xl shrink-0",
            difficulty.bg,
            difficulty.border,
            "border"
          )}>
            <span className={cn("text-2xl font-bold font-mono leading-none", difficulty.color)}>
              {problem.difficulty}
            </span>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wide mt-0.5">
              {difficulty.label}
            </span>
          </div>
        </div>

        {/* Context preview */}
        <p className="text-zinc-400 text-sm mb-4 line-clamp-2 flex-grow">
          {problem.context}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-4 text-xs text-zinc-500 mb-4">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-800/50 rounded-lg">
            <Clock className="w-3.5 h-3.5 text-zinc-400" />
            <span>{problem.estimated_time_minutes || 25} menit</span>
          </div>
          {/* Show role label instead of archetype */}
          {(problem.role_label || problem.archetype_focus) && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-violet-500/15 border border-violet-500/30 rounded-lg">
              <Target className="w-3.5 h-3.5 text-violet-400" />
              <span className="capitalize text-violet-400 font-medium">
                {(problem.role_label || problem.archetype_focus)?.replace(/_/g, ' ')}
              </span>
            </div>
          )}
        </div>

        {/* Constraints preview */}
        {problem.constraints && problem.constraints.length > 0 && (
          <div className="flex items-start gap-2.5 mb-4 p-3 bg-zinc-950/60 rounded-xl border border-zinc-800/50">
            <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-zinc-400">
              <span className="text-orange-400 font-semibold">Constraints:</span>
              <span className="ml-1.5">{problem.constraints.slice(0, 2).join(', ')}</span>
              {problem.constraints.length > 2 && (
                <span className="text-zinc-500"> +{problem.constraints.length - 2} lagi</span>
              )}
            </div>
          </div>
        )}

        {/* Action */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onStart(problem)}
          className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-black font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30"
        >
          <Zap className="w-4 h-4" />
          <span>Ambil Masalah Ini</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </motion.button>
      </div>
    </motion.div>
  );
}
