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
  language = 'en',
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
              "h-1.5 flex-1 nx-sharp transition-colors duration-200",
              i < currentIndex ? "bg-[rgba(51,209,122,0.7)]" :
                i === currentIndex ? "bg-[rgba(231,234,240,0.34)]" : "bg-[rgba(231,234,240,0.12)]"
            )}
          >
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
            className="flex items-center gap-1 text-[var(--ink-2)] hover:text-[var(--acid-orange)] transition-colors text-sm font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
            {language === 'en' ? 'Back' : 'Kembali'}
          </button>
        )}
        <span className="text-[var(--ink-2)] text-sm font-mono bg-[var(--paper-2)] px-3 py-1.5 nx-sharp border-[2px] border-[var(--ink)]">
          {String(currentIndex + 1).padStart(2, '0')} / {String(totalQuestions).padStart(2, '0')}
        </span>
        <div className="h-px flex-1 bg-[rgba(231,234,240,0.12)]" />
      </motion.div>

      {/* Question text */}
      <motion.h2
        className="text-2xl md:text-3xl font-bold text-[var(--ink)] mb-8 leading-tight"
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
              "group w-full text-left p-4 nx-sharp border border-[rgba(231,234,240,0.18)] transition-colors duration-150",
              (selectedOption === option.value || selectedValue === option.value)
                ? "bg-[rgba(51,209,122,0.08)] border-[rgba(51,209,122,0.45)] text-[var(--ink)]"
                : "bg-[rgba(231,234,240,0.02)] text-[var(--ink)] hover:bg-[rgba(231,234,240,0.04)] hover:border-[rgba(231,234,240,0.28)]"
            )}
          >
            <div className="relative z-10 flex items-center gap-3">
              <div className={cn(
                "w-7 h-7 nx-sharp border border-[rgba(231,234,240,0.22)] flex items-center justify-center shrink-0 transition-colors",
                (selectedOption === option.value || selectedValue === option.value)
                  ? "bg-[rgba(51,209,122,0.18)] border-[rgba(51,209,122,0.55)] text-[var(--ink)]"
                  : "bg-[rgba(231,234,240,0.04)] text-[var(--ink)]"
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
      {
        hasTextInput && selectedOption && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6"
          >
            <label className="block text-[var(--ink-2)] text-sm mb-2">
              {textInputLabel}
            </label>
            <textarea
              value={textProof}
              onChange={(e) => setTextProof(e.target.value)}
              placeholder={textInputPlaceholder}
              className="w-full nx-sharp border border-[rgba(231,234,240,0.18)] bg-[rgba(231,234,240,0.02)] p-4 text-[var(--ink)] placeholder:text-[var(--ink-3)] focus:border-[rgba(51,209,122,0.45)] focus:outline-none transition-colors resize-none"
              rows={3}
            />
            <p className="text-[var(--ink-2)] text-xs mt-2">
              {language === 'en'
                ? 'Optional, but helps AI understand your level accurately'
                : 'Opsional, tapi membantu AI memahami level kamu dengan lebih akurat'}
            </p>

            <Button
              onClick={handleSubmit}
              variant="gradient"
              className="w-full mt-4 py-4"
              disabled={!selectedOption}
            >
              {language === 'en' ? 'Continue' : 'Lanjut'}
            </Button>
          </motion.div>
        )
      }
    </motion.div >
  );
}
