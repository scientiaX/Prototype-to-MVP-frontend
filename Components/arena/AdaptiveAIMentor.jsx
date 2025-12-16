import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { AlertCircle, Brain, Timer } from 'lucide-react';
import { cn } from "@/lib/utils";

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
          className="bg-zinc-900 border-2 border-orange-500 rounded-2xl w-full p-6 shadow-2xl"
          layoutId="mentor-dialog"
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            {isThinking ? (
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Brain className="w-5 h-5 text-orange-500 animate-pulse" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-orange-500" />
              </div>
            )}
            <div>
              <h3 className="text-orange-500 font-semibold">AI Mentor</h3>
              {countdown > 0 && stage === 'countdown' && (
                <div className="flex items-center gap-2 mt-1">
                  <Timer className="w-3 h-3 text-red-500" />
                  <span className="text-red-500 text-xs font-mono">
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
                  <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-zinc-400 text-sm">Menganalisis...</span>
              </div>
            ) : (
              <p className="text-zinc-300 leading-relaxed italic">
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
                    className="bg-green-500 hover:bg-green-600 text-black font-semibold"
                  >
                    Ya, paham
                  </Button>
                  <Button
                    onClick={onNotUnderstandClick}
                    variant="outline"
                    className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                  >
                    Tidak paham
                  </Button>
                </div>
              )}

              {stage === 'countdown' && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                  <p className="text-red-500 text-xs text-center">
                    Pertanyaan akan diganti dalam <strong>{countdown} detik</strong>
                  </p>
                </div>
              )}

              {stage === 'over_analysis_warning' && (
                <div className="text-center">
                  <p className="text-zinc-500 text-xs">
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
