import React, { useEffect, useState, useRef } from 'react';
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
    durationSeconds = 30,
    isLoading,
    // NEW: Prediction comparison props (Friksi #4)
    userPrediction = null,
    actualOutcome = null // 'positive', 'mixed', 'challenging'
}) {
    const [revealedIndex, setRevealedIndex] = useState(-1);
    const [showInsight, setShowInsight] = useState(false);
    const [showPredictionResult, setShowPredictionResult] = useState(false);
    const [canContinue, setCanContinue] = useState(false);
    const didContinueRef = useRef(false);

    // Check if prediction was accurate
    const predictionAccurate = userPrediction && actualOutcome &&
        userPrediction.id === actualOutcome;

    // Reveal consequences one by one
    useEffect(() => {
        if (isLoading) return;

        const revealTimers = [];
        const durationMs = Math.max(1000, Number(durationSeconds) * 1000);
        const totalPhases = Math.max(1, (consequences?.length || 0) + 2);
        const stepMs = Math.max(800, Math.min(2200, Math.round((durationMs * 0.75) / totalPhases)));
        const initialDelayMs = Math.max(600, Math.min(1500, Math.round(durationMs * 0.08)));

        // Reveal each consequence with delay
        (consequences || []).forEach((_, index) => {
            const timer = setTimeout(() => {
                setRevealedIndex(index);
            }, initialDelayMs + index * stepMs);
            revealTimers.push(timer);
        });

        // Show insight after all consequences
        const insightDelayMs = initialDelayMs + (consequences?.length || 0) * stepMs + Math.max(500, Math.min(1200, Math.round(stepMs * 0.55)));
        const insightTimer = setTimeout(() => {
            setShowInsight(true);
        }, insightDelayMs);
        revealTimers.push(insightTimer);

        // Enable continue after insight
        const continueDelayMs = insightDelayMs + Math.max(700, Math.min(2200, Math.round(stepMs * 0.8)));
        const continueTimer = setTimeout(() => {
            setCanContinue(true);
        }, continueDelayMs);
        revealTimers.push(continueTimer);

        return () => revealTimers.forEach(t => clearTimeout(t));
    }, [consequences, isLoading, durationSeconds]);

    // Auto-advance when time runs out
    useEffect(() => {
        if (didContinueRef.current) return;
        if (timeRemaining <= 0 && !isLoading) {
            didContinueRef.current = true;
            onContinue();
        }
    }, [timeRemaining, isLoading, onContinue]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col items-center justify-center p-6"
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
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--acid-orange)] border-[3px] border-[var(--ink)] shadow-[4px_4px_0_var(--ink)] nx-sharp mb-4"
                    >
                        <Zap className="w-5 h-5 text-[var(--ink)]" />
                        <span className="text-[var(--ink)] font-bold uppercase tracking-wider">Konsekuensi</span>
                    </motion.div>
                </motion.div>

                {/* Loading state */}
                {isLoading ? (
                    <div className="flex flex-col items-center gap-4 py-12">
                        <div className="w-10 h-10 border-[3px] border-[var(--ink)] border-t-transparent nx-sharp animate-spin" />
                        <p className="text-[var(--ink-2)] text-sm">Menghitung dampak keputusan...</p>
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
                                            className="nx-panel nx-sharp p-5"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 bg-[var(--paper-2)] border-[2px] border-[var(--ink)] nx-sharp flex items-center justify-center flex-shrink-0">
                                                    <X className="w-4 h-4 text-[var(--ink)]" />
                                                </div>
                                                <p className="text-[var(--ink)] text-lg leading-relaxed">
                                                    {consequence}
                                                </p>
                                            </div>
                                        </motion.div>
                                    )
                                ))}
                            </AnimatePresence>
                        </div>

                        {/* Risk/Complexity Indicators */}
                        <AnimatePresence>
                            {revealedIndex >= consequences.length - 1 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="flex flex-wrap justify-center gap-3 mb-6"
                                >
                                    <span className="px-3 py-1.5 bg-[var(--paper)] border-[2px] border-[var(--ink)] nx-sharp text-[var(--ink)] text-sm font-semibold">
                                        Risiko ↑
                                    </span>
                                    <span className="px-3 py-1.5 bg-[var(--paper)] border-[2px] border-[var(--ink)] nx-sharp text-[var(--ink)] text-sm font-semibold">
                                        Kompleksitas ↑
                                    </span>
                                    <span className="px-3 py-1.5 bg-[var(--paper)] border-[2px] border-[var(--ink)] nx-sharp text-[var(--ink)] text-sm font-semibold">
                                        Tekanan ↑
                                    </span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Insight message */}
                        <AnimatePresence>
                            {showInsight && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-center mb-6"
                                >
                                    <p className="text-[var(--ink-2)] text-lg italic">
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
                                        "p-4 mb-6 border-[3px] border-[var(--ink)] shadow-[6px_6px_0_var(--ink)] nx-sharp",
                                        predictionAccurate
                                            ? "bg-[var(--acid-lime)]"
                                            : "bg-[var(--paper)]"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        {predictionAccurate ? (
                                            <CheckCircle className="w-6 h-6 text-[var(--ink)] flex-shrink-0" />
                                        ) : (
                                            <Target className="w-6 h-6 text-[var(--ink)] flex-shrink-0" />
                                        )}
                                        <div>
                                            <p className={cn(
                                                "text-sm font-medium",
                                                predictionAccurate ? "text-[var(--ink)]" : "text-[var(--ink)]"
                                            )}>
                                                {predictionAccurate
                                                    ? "🎯 Tebakanmu tepat!"
                                                    : "🤔 Hasilnya berbeda dari dugaanmu"
                                                }
                                            </p>
                                            <p className="text-xs text-[var(--ink-2)] mt-1">
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
                                        className="w-full py-4 bg-[var(--acid-orange)] text-[var(--ink)] font-semibold border-[3px] border-[var(--ink)] shadow-[8px_8px_0_var(--ink)] hover:translate-x-[-3px] hover:translate-y-[-3px] transition-all duration-100 [transition-timing-function:steps(4,end)] nx-sharp"
                                    >
                                        Lanjut →
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </>
                )}

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
