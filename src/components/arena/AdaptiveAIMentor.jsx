import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { AlertCircle, Brain, Timer } from 'lucide-react';

export default function AdaptiveAIMentor({ 
  stage,
  message,
  countdown,
  onUnderstandClick,
  onNotUnderstandClick,
  isThinking
}) {
  if (!stage) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={stage}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="fixed bottom-24 right-6 z-40 max-w-md"
      >
        <motion.div 
          className="nx-panel nx-sharp w-full p-6"
          layoutId="mentor-dialog"
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            {isThinking ? (
              <div className="w-10 h-10 nx-sharp border-[2px] border-[var(--ink)] bg-[var(--acid-orange)] shadow-[3px_3px_0_var(--ink)] flex items-center justify-center">
                <Brain className="w-5 h-5 text-[var(--ink)] animate-pulse" />
              </div>
            ) : (
              <div className="w-10 h-10 nx-sharp border-[2px] border-[var(--ink)] bg-[var(--acid-yellow)] shadow-[3px_3px_0_var(--ink)] flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-[var(--ink)]" />
              </div>
            )}
            <div>
              <h3 className="text-[var(--ink)] font-bold">AI Mentor</h3>
              {countdown > 0 && stage === 'countdown' && (
                <div className="flex items-center gap-2 mt-1">
                  <Timer className="w-3 h-3 text-[var(--ink)]" />
                  <span className="text-[var(--ink)] text-xs font-mono bg-[var(--acid-yellow)] border border-[var(--ink)] px-1 nx-sharp">
                    {countdown}s until question changes
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Message */}
          <div className="mb-6">
            {isThinking ? (
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-[var(--acid-orange)] border border-[var(--ink)] nx-sharp animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-[var(--acid-orange)] border border-[var(--ink)] nx-sharp animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-[var(--acid-orange)] border border-[var(--ink)] nx-sharp animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-[var(--ink-2)] text-sm">Menganalisis...</span>
              </div>
            ) : (
              <p className="text-[var(--ink-2)] leading-relaxed italic">
                "{message}"
              </p>
            )}
          </div>

          {/* Action buttons */}
          {!isThinking && (
            <div className="space-y-3">
              {stage === 'comprehension_check' && (
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={onUnderstandClick}
                    variant="success"
                  >
                    Ya, paham
                  </Button>
                  <Button
                    onClick={onNotUnderstandClick}
                    variant="outline"
                  >
                    Tidak paham
                  </Button>
                </div>
              )}

              {stage === 'countdown' && (
                <div className="bg-[var(--acid-magenta)] border-[3px] border-[var(--ink)] shadow-[4px_4px_0_var(--ink)] nx-sharp p-3">
                  <p className="text-[var(--ink)] text-xs text-center font-bold">
                    Pertanyaan akan diganti dalam <strong>{countdown} detik</strong>
                  </p>
                </div>
              )}

              {stage === 'over_analysis_warning' && (
                <div className="text-center">
                  <p className="text-[var(--ink-3)] text-xs">
                    Pop-up akan hilang otomatis. Mulai mengetik untuk melanjutkan.
                  </p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
