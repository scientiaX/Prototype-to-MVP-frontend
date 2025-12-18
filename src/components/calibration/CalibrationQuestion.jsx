import React from 'react';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";
import { Check } from 'lucide-react';

export default function CalibrationQuestion({
  question,
  options,
  onSelect,
  currentIndex,
  totalQuestions,
  selectedValue
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-2xl mx-auto relative z-10"
    >
      {/* Progress indicator */}
      <div className="flex items-center gap-2 mb-10">
        {Array.from({ length: totalQuestions }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-all duration-500 relative overflow-hidden",
              i < currentIndex ? "bg-gradient-to-r from-orange-500 to-red-500" :
                i === currentIndex ? "bg-white" : "bg-zinc-800"
            )}
          >
            {i === currentIndex && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-orange-500/50 to-transparent"
                animate={{ x: [-100, 200] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Question number */}
      <motion.div
        className="flex items-center gap-3 mb-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <span className="text-zinc-500 text-sm font-mono bg-zinc-900/50 px-3 py-1.5 rounded-lg border border-zinc-800">
          {String(currentIndex + 1).padStart(2, '0')} / {String(totalQuestions).padStart(2, '0')}
        </span>
        <div className="h-px flex-1 bg-gradient-to-r from-zinc-800 to-transparent" />
      </motion.div>

      {/* Question text */}
      <motion.h2
        className="text-2xl md:text-4xl font-bold text-white mb-10 leading-tight"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {question}
      </motion.h2>

      {/* Options */}
      <div className="space-y-3">
        {options.map((option, idx) => (
          <motion.button
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + idx * 0.08 }}
            whileHover={{ x: 8, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(option.value)}
            className={cn(
              "group w-full text-left p-5 rounded-xl border transition-all duration-300 relative overflow-hidden",
              selectedValue === option.value
                ? "border-orange-500 bg-gradient-to-r from-orange-500/15 to-red-500/10 text-white"
                : "border-zinc-800 bg-zinc-900/50 text-zinc-300 hover:border-orange-500/50 hover:bg-zinc-900/80"
            )}
          >
            {/* Hover glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 to-transparent opacity-0 group-hover:opacity-10 transition-opacity" />

            <div className="relative z-10 flex items-center gap-4">
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all",
                selectedValue === option.value
                  ? "bg-orange-500 text-black"
                  : "bg-zinc-800 text-orange-500 group-hover:bg-orange-500/20"
              )}>
                {selectedValue === option.value ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <span className="font-mono font-semibold text-sm">
                    {String.fromCharCode(65 + idx)}
                  </span>
                )}
              </div>
              <span className="text-lg">{option.label}</span>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
