import React from 'react';
import { motion } from 'framer-motion';
import { Clock, AlertTriangle, Target } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function ProblemCard({ problem, onStart }) {
  const difficultyColor = problem.difficulty <= 3 ? 'text-green-500' : 
                          problem.difficulty <= 6 ? 'text-yellow-500' : 'text-red-500';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-all"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <span className="text-zinc-600 font-mono text-xs">{problem.problem_id}</span>
          <h3 className="text-xl font-bold text-white mt-1">{problem.title}</h3>
        </div>
        <div className={cn("text-2xl font-bold font-mono", difficultyColor)}>
          {problem.difficulty}
        </div>
      </div>

      {/* Context preview */}
      <p className="text-zinc-400 text-sm mb-4 line-clamp-2">
        {problem.context}
      </p>

      {/* Meta */}
      <div className="flex items-center gap-4 text-xs text-zinc-500 mb-4">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>{problem.estimated_time_minutes || 25} menit</span>
        </div>
        <div className="flex items-center gap-1">
          <Target className="w-3 h-3" />
          <span className="capitalize">{problem.archetype_focus?.replace('_', ' ')}</span>
        </div>
      </div>

      {/* Constraints preview */}
      {problem.constraints && problem.constraints.length > 0 && (
        <div className="flex items-start gap-2 mb-4 p-3 bg-zinc-950 rounded-lg">
          <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-zinc-400">
            <span className="text-orange-500 font-semibold">Constraints:</span>
            <span className="ml-1">{problem.constraints.slice(0, 2).join(', ')}</span>
            {problem.constraints.length > 2 && <span> +{problem.constraints.length - 2} lagi</span>}
          </div>
        </div>
      )}

      {/* Action */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onStart(problem)}
        className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-black font-bold rounded-lg transition-colors"
      >
        Ambil Masalah Ini
      </motion.button>
    </motion.div>
  );
}
