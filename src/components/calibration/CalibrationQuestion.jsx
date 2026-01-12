import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";
import { Check, ChevronLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function CalibrationQuestion({
  question,
  options,
  onSelect,
  onBack,
  canGoBack = true,
  currentIndex,
  totalQuestions,
  selectedValue,
  // New props for text input support
  hasTextInput = false,
  textInputLabel = '',
  textInputPlaceholder = ''
}) {
  const [textProof, setTextProof] = useState('');
  const [selectedOption, setSelectedOption] = useState(selectedValue || null);

  const handleOptionClick = (value) => {
    setSelectedOption(value);
    // If no text input required, submit immediately
    if (!hasTextInput) {
      onSelect(value);
    }
  };

  const handleSubmit = () => {
    if (selectedOption) {
      // Pass both the selected value and the text proof
      onSelect(selectedOption, textProof);
    }
  };

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

      {/* Question number with back button */}
      <motion.div
        className="flex items-center gap-3 mb-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {canGoBack && onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-zinc-500 hover:text-orange-400 transition-colors text-sm font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
            Kembali
          </button>
        )}
        <span className="text-zinc-500 text-sm font-mono bg-zinc-900/50 px-3 py-1.5 rounded-lg border border-zinc-800">
          {String(currentIndex + 1).padStart(2, '0')} / {String(totalQuestions).padStart(2, '0')}
        </span>
        <div className="h-px flex-1 bg-gradient-to-r from-zinc-800 to-transparent" />
      </motion.div>

      {/* Question text */}
      <motion.h2
        className="text-2xl md:text-3xl font-bold text-white mb-8 leading-tight"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {question}
      </motion.h2>

      {/* Options */}
      <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2">
        {options.map((option, idx) => (
          <motion.button
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + idx * 0.05 }}
            whileHover={{ x: 4, scale: 1.005 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleOptionClick(option.value)}
            className={cn(
              "group w-full text-left p-4 rounded-xl border transition-all duration-300 relative overflow-hidden",
              (selectedOption === option.value || selectedValue === option.value)
                ? "border-orange-500 bg-gradient-to-r from-orange-500/15 to-red-500/10 text-white"
                : "border-zinc-800 bg-zinc-900/50 text-zinc-300 hover:border-orange-500/50 hover:bg-zinc-900/80"
            )}
          >
            {/* Hover glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 to-transparent opacity-0 group-hover:opacity-10 transition-opacity" />

            <div className="relative z-10 flex items-center gap-3">
              <div className={cn(
                "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all",
                (selectedOption === option.value || selectedValue === option.value)
                  ? "bg-orange-500 text-black"
                  : "bg-zinc-800 text-orange-500 group-hover:bg-orange-500/20"
              )}>
                {(selectedOption === option.value || selectedValue === option.value) ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <span className="font-mono font-semibold text-xs">
                    {String.fromCharCode(65 + idx)}
                  </span>
                )}
              </div>
              <span className="text-base">{option.label}</span>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Text Input for Proof (if hasTextInput is true) */}
      {hasTextInput && selectedOption && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6"
        >
          <label className="block text-zinc-400 text-sm mb-2">
            {textInputLabel}
          </label>
          <textarea
            value={textProof}
            onChange={(e) => setTextProof(e.target.value)}
            placeholder={textInputPlaceholder}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-4 text-white placeholder-zinc-600 focus:border-orange-500 focus:outline-none transition-colors resize-none"
            rows={3}
          />
          <p className="text-zinc-600 text-xs mt-2">
            Opsional, tapi membantu AI memahami level kamu dengan lebih akurat
          </p>

          <Button
            onClick={handleSubmit}
            variant="gradient"
            className="w-full mt-4 py-4"
            disabled={!selectedOption}
          >
            Lanjut
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
