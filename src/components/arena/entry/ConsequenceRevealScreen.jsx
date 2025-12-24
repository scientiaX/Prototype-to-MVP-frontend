import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, X, AlertCircle, Target, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * ConsequenceRevealScreen - Screen 4 (60-90s)
 * Purpose: Tamparan pertama – "Pilihan gue ada biayanya"
 * - 1-2 konsekuensi langsung
 * - Salah satu hal penting hilang/terkompromi
 * - Bahasa singkat dan tegas
 * - Dramatic reveal animation
 * 
 * FRIKSI #4: Now includes prediction comparison
 * Shows whether user's prediction was accurate
 */
export default function ConsequenceRevealScreen({
    consequences,
    insightMessage,
    selectedChoice,
    onContinue,
    timeRemaining,
    isLoading,
    // NEW: Prediction comparison props (Friksi #4)
    userPrediction = null,
    actualOutcome = null // 'positive', 'mixed', 'challenging'
}) {
    const [revealedIndex, setRevealedIndex] = useState(-1);
    const [showInsight, setShowInsight] = useState(false);
    const [showPredictionResult, setShowPredictionResult] = useState(false);
    const [canContinue, setCanContinue] = useState(false);

    // Check if prediction was accurate
    const predictionAccurate = userPrediction && actualOutcome &&
        userPrediction.id === actualOutcome;

    // Reveal consequences one by one
    useEffect(() => {
        if (isLoading) return;

        const revealTimers = [];

        // Reveal each consequence with delay
        consequences.forEach((_, index) => {
            const timer = setTimeout(() => {
                setRevealedIndex(index);
            }, 1500 + index * 2000); // First at 1.5s, then every 2s
            revealTimers.push(timer);
        });

        // Show insight after all consequences
        const insightTimer = setTimeout(() => {
            setShowInsight(true);
        }, 1500 + consequences.length * 2000 + 1000);
        revealTimers.push(insightTimer);

        // Enable continue after insight
        const continueTimer = setTimeout(() => {
            setCanContinue(true);
        }, 1500 + consequences.length * 2000 + 2500);
        revealTimers.push(continueTimer);

        return () => revealTimers.forEach(t => clearTimeout(t));
    }, [consequences, isLoading]);

    // Auto-advance when time runs out
    useEffect(() => {
        if (timeRemaining <= 0 && !isLoading) {
            onContinue();
        }
    }, [timeRemaining, isLoading, onContinue]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-black flex flex-col items-center justify-center p-6"
        >
            <div className="max-w-lg w-full">
                {/* Header with dramatic effect */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', damping: 10 }}
                    className="text-center mb-10"
                >
                    <motion.div
                        initial={{ rotate: 0 }}
                        animate={{ rotate: [0, -5, 5, 0] }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-500/20 border border-red-500/40 mb-4"
                    >
                        <Zap className="w-5 h-5 text-red-400" />
                        <span className="text-red-400 font-bold uppercase tracking-wider">Konsekuensi</span>
                    </motion.div>
                </motion.div>

                {/* Loading state */}
                {isLoading ? (
                    <div className="flex flex-col items-center gap-4 py-12">
                        <div className="w-10 h-10 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-zinc-500 text-sm">Menghitung dampak keputusan...</p>
                    </div>
                ) : (
                    <>
                        {/* Consequences list */}
                        <div className="space-y-4 mb-8">
                            <AnimatePresence>
                                {consequences.map((consequence, index) => (
                                    index <= revealedIndex && (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -30, scale: 0.95 }}
                                            animate={{ opacity: 1, x: 0, scale: 1 }}
                                            transition={{ type: 'spring', damping: 15 }}
                                            className="bg-red-500/10 border border-red-500/30 rounded-xl p-5"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                                                    <X className="w-4 h-4 text-red-400" />
                                                </div>
                                                <p className="text-white text-lg leading-relaxed">
                                                    {consequence}
                                                </p>
                                            </div>
                                        </motion.div>
                                    )
                                ))}
                            </AnimatePresence>
                        </div>

                        {/* Insight message */}
                        <AnimatePresence>
                            {showInsight && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-center mb-6"
                                >
                                    <p className="text-zinc-400 text-lg italic">
                                        "{insightMessage}"
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* FRIKSI #4: Prediction Result */}
                        <AnimatePresence>
                            {showInsight && userPrediction && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ delay: 0.5, type: 'spring', damping: 15 }}
                                    className={cn(
                                        "rounded-xl p-4 mb-6 border",
                                        predictionAccurate
                                            ? "bg-green-500/10 border-green-500/30"
                                            : "bg-zinc-800/50 border-zinc-700"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        {predictionAccurate ? (
                                            <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                                        ) : (
                                            <Target className="w-6 h-6 text-zinc-400 flex-shrink-0" />
                                        )}
                                        <div>
                                            <p className={cn(
                                                "text-sm font-medium",
                                                predictionAccurate ? "text-green-400" : "text-zinc-300"
                                            )}>
                                                {predictionAccurate
                                                    ? "🎯 Tebakanmu tepat!"
                                                    : "🤔 Hasilnya berbeda dari dugaanmu"
                                                }
                                            </p>
                                            <p className="text-xs text-zinc-500 mt-1">
                                                {predictionAccurate
                                                    ? "Kamu mulai memahami pola skenario ini."
                                                    : "Ini pembelajaran baru: realitas sering berbeda dari ekspektasi."
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Continue button */}
                        <AnimatePresence>
                            {canContinue && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <button
                                        onClick={onContinue}
                                        className="w-full py-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold transition-all"
                                    >
                                        Lanjut →
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </>
                )}

                {/* Timer (subtle) */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="fixed bottom-8 left-1/2 -translate-x-1/2"
                >
                    <span className="text-zinc-600 text-xs font-mono">{timeRemaining}s</span>
                </motion.div>
            </div>

            {/* Screen shake effect on first consequence */}
            {revealedIndex === 0 && (
                <motion.div
                    initial={{ x: 0 }}
                    animate={{ x: [0, -5, 5, -3, 3, 0] }}
                    transition={{ duration: 0.4 }}
                    className="fixed inset-0 pointer-events-none"
                />
            )}
        </motion.div>
    );
}
