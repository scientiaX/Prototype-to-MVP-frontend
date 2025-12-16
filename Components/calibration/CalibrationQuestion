import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
      className="w-full max-w-2xl mx-auto"
    >
      {/* Progress indicator */}
      <div className="flex items-center gap-2 mb-8">
        {Array.from({ length: totalQuestions }).map((_, i) => (
          <div 
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-all duration-300",
              i < currentIndex ? "bg-orange-500" : 
              i === currentIndex ? "bg-white" : "bg-zinc-800"
            )}
          />
        ))}
      </div>

      {/* Question number */}
      <div className="text-zinc-600 text-sm font-mono mb-2">
        {String(currentIndex + 1).padStart(2, '0')} / {String(totalQuestions).padStart(2, '0')}
      </div>

      {/* Question text */}
      <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 leading-tight">
        {question}
      </h2>

      {/* Options */}
      <div className="space-y-3">
        {options.map((option, idx) => (
          <motion.button
            key={idx}
            whileHover={{ x: 8 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(option.value)}
            className={cn(
              "w-full text-left p-4 rounded-lg border transition-all duration-200",
              "hover:border-orange-500/50 hover:bg-zinc-900/50",
              selectedValue === option.value 
                ? "border-orange-500 bg-orange-500/10 text-white" 
                : "border-zinc-800 bg-zinc-900/30 text-zinc-300"
            )}
          >
            <span className="text-orange-500 font-mono mr-3">
              {String.fromCharCode(65 + idx)}.
            </span>
            {option.label}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
