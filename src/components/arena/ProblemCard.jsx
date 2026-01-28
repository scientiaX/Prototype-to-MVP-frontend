import React from 'react';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function ProblemCard({ problem, onStart }) {
  const IconClock = (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v6l4 2" />
    </svg>
  );

  const IconAlert = (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round" {...props}>
      <path d="M12 3l9 16H3z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );

  const IconTarget = (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v2M22 12h-2M12 22v-2M2 12h2" />
    </svg>
  );

  const IconChevron = (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round" {...props}>
      <path d="M9 6l6 6-6 6" />
    </svg>
  );

  const IconBolt = (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round" {...props}>
      <path d="M13 2L5 14h6l-1 8 9-14h-6z" />
    </svg>
  );

  const getDifficultyConfig = (difficulty) => {
    if (difficulty <= 3) {
      return {
        color: 'text-[var(--acid-lime)]',
        bg: 'bg-[rgba(51,209,122,0.12)]',
        border: 'border-[rgba(51,209,122,0.55)]',
        label: 'Easy',
      };
    } else if (difficulty <= 6) {
      return {
        color: 'text-[var(--ink)]',
        bg: 'bg-[rgba(231,234,240,0.04)]',
        border: 'border-[rgba(231,234,240,0.22)]',
        label: 'Medium',
      };
    } else {
      return {
        color: 'text-[var(--acid-orange)]',
        bg: 'bg-[rgba(255,106,61,0.12)]',
        border: 'border-[rgba(255,106,61,0.55)]',
        label: 'Hard',
      };
    }
  };

  const difficulty = getDifficultyConfig(problem.difficulty);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="group relative h-full"
    >
      <div className="relative h-full nx-panel nx-panel-core nx-sharp p-6 flex flex-col">
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
            <IconClock className="w-3.5 h-3.5 text-[var(--ink)]" />
            <span>{problem.estimated_time_minutes || 25} menit</span>
          </div>
          {/* Show role label instead of archetype */}
          {(problem.role_label || problem.archetype_focus) && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[var(--acid-cyan)]/20 border-2 border-[var(--ink)] nx-sharp">
              <IconTarget className="w-3.5 h-3.5 text-[var(--ink)]" />
              <span className="capitalize text-[var(--ink)] font-semibold">
                {(problem.role_label || problem.archetype_focus)?.replace(/_/g, ' ')}
              </span>
            </div>
          )}
        </div>

        {/* Constraints preview */}
        {problem.constraints && problem.constraints.length > 0 && (
          <div className="flex items-start gap-2.5 mb-4 p-3 bg-[var(--paper-2)] border-2 border-[var(--ink)] nx-sharp">
            <IconAlert className="w-4 h-4 text-[var(--acid-orange)] mt-0.5 flex-shrink-0" />
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
          <IconBolt className="w-4 h-4" />
          <span>Ambil Masalah Ini</span>
          <IconChevron className="w-4 h-4 transition-transform duration-100 [transition-timing-function:steps(4,end)] group-hover:translate-x-1" />
        </Button>
      </div>
    </motion.div>
  );
}
