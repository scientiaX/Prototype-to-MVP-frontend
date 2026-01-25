import React from 'react';
import { motion } from 'framer-motion';
import { Clock, AlertTriangle, Target, ChevronRight, Zap } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function ProblemCard({ problem, onStart }) {
  const getDifficultyConfig = (difficulty) => {
    if (difficulty <= 3) {
      return {
        color: 'text-emerald-700',
        bg: 'bg-emerald-400/20',
        border: 'border-emerald-700',
        label: 'Easy',
        gradient: 'from-emerald-500 to-green-600'
      };
    } else if (difficulty <= 6) {
      return {
        color: 'text-yellow-700',
        bg: 'bg-yellow-400/25',
        border: 'border-yellow-700',
        label: 'Medium',
        gradient: 'from-yellow-500 to-orange-500'
      };
    } else {
      return {
        color: 'text-red-700',
        bg: 'bg-red-400/20',
        border: 'border-red-700',
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
      <div className="relative h-full nx-panel nx-sharp p-6 flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0 pr-3">
            <span className="nx-mono text-xs nx-ink-faint">{problem.problem_id}</span>
            <h3 className="text-xl font-black text-[var(--ink)] mt-1 line-clamp-2">
              {problem.title}
            </h3>
          </div>
          <div className={cn(
            "flex flex-col items-center justify-center w-14 h-14 shrink-0 border-[3px]",
            difficulty.bg,
            difficulty.border,
            "nx-sharp"
          )}>
            <span className={cn("text-2xl font-bold font-mono leading-none", difficulty.color)}>
              {problem.difficulty}
            </span>
            <span className="text-[10px] nx-mono nx-ink-muted uppercase tracking-wide mt-0.5">
              {difficulty.label}
            </span>
          </div>
        </div>

        {/* Context preview */}
        <p className="nx-ink-muted text-sm mb-4 line-clamp-2 flex-grow">
          {problem.context}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-4 text-xs nx-ink-muted mb-4">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[var(--paper-2)] border-2 border-[var(--ink)] nx-sharp">
            <Clock className="w-3.5 h-3.5 text-[var(--ink)]" />
            <span>{problem.estimated_time_minutes || 25} menit</span>
          </div>
          {/* Show role label instead of archetype */}
          {(problem.role_label || problem.archetype_focus) && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[var(--acid-cyan)]/20 border-2 border-[var(--ink)] nx-sharp">
              <Target className="w-3.5 h-3.5 text-[var(--ink)]" />
              <span className="capitalize text-[var(--ink)] font-semibold">
                {(problem.role_label || problem.archetype_focus)?.replace(/_/g, ' ')}
              </span>
            </div>
          )}
        </div>

        {/* Constraints preview */}
        {problem.constraints && problem.constraints.length > 0 && (
          <div className="flex items-start gap-2.5 mb-4 p-3 bg-[var(--paper-2)] border-2 border-[var(--ink)] nx-sharp">
            <AlertTriangle className="w-4 h-4 text-[var(--acid-orange)] mt-0.5 flex-shrink-0" />
            <div className="text-xs nx-ink-muted">
              <span className="text-[var(--ink)] font-semibold">Constraints:</span>
              <span className="ml-1.5">{problem.constraints.slice(0, 2).join(', ')}</span>
              {problem.constraints.length > 2 && (
                <span className="nx-ink-faint"> +{problem.constraints.length - 2} lagi</span>
              )}
            </div>
          </div>
        )}

        {/* Action */}
        <Button onClick={() => onStart(problem)} variant="gradient" size="lg" className="w-full group">
          <Zap className="w-4 h-4" />
          <span>Ambil Masalah Ini</span>
          <ChevronRight className="w-4 h-4 transition-transform duration-100 [transition-timing-function:steps(4,end)] group-hover:translate-x-1" />
        </Button>
      </div>
    </motion.div>
  );
}
