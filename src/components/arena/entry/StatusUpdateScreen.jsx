import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Circle, CheckCircle } from 'lucide-react';

/**
 * StatusUpdateScreen - Screen 5 (90-120s)
 * Purpose: Memberikan rasa progres tanpa skor
 * - Status berpikir muncul (forming / developing / consistent)
 * - Tanpa angka
 * - Tanpa skor
 * - User merasa: "Ini bergerak."
 */
export default function StatusUpdateScreen({
    progressStatus,
    onContinue,
    timeRemaining
}) {
    const [animationStep, setAnimationStep] = useState(0);
    const [canContinue, setCanContinue] = useState(false);

    // Status stages
    const stages = [
        { id: 'forming', label: 'Forming...', description: 'Sedang membentuk pola pikir' },
        { id: 'developing', label: 'Developing', description: 'Pola mulai terbentuk' },
        { id: 'consistent', label: 'Consistent', description: 'Pemikiran mulai konsisten' },
        { id: 'stabilized', label: 'Stabilized', description: 'Keputusan stabil' }
    ];

    // Get current stage index
    const getCurrentStageIndex = () => {
        const index = stages.findIndex(s => s.id === progressStatus);
        return index >= 0 ? index : 0;
    };

    // Animate through stages up to current
    useEffect(() => {
        const currentIndex = getCurrentStageIndex();
        let step = 0;

        const timer = setInterval(() => {
            if (step <= currentIndex) {
                setAnimationStep(step);
                step++;
            } else {
                clearInterval(timer);
            }
        }, 600);

        return () => clearInterval(timer);
    }, [progressStatus]);

    // Enable continue after animation
    useEffect(() => {
        const timer = setTimeout(() => {
            setCanContinue(true);
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    // Auto-advance
    useEffect(() => {
        if (timeRemaining <= 0) {
            onContinue();
        }
    }, [timeRemaining, onContinue]);

    const currentStageIndex = getCurrentStageIndex();

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-black flex flex-col items-center justify-center p-6"
        >
            <div className="max-w-md w-full">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/15 border border-blue-500/30 mb-4">
                        <TrendingUp className="w-4 h-4 text-blue-400" />
                        <span className="text-blue-400 font-semibold text-sm uppercase tracking-wider">Status</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white">Cara Berpikirmu</h2>
                </motion.div>

                {/* Progress stages */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-4 mb-12"
                >
                    {stages.map((stage, index) => {
                        const isActive = index === currentStageIndex;
                        const isPast = index < currentStageIndex;
                        const isAnimated = index <= animationStep;

                        return (
                            <motion.div
                                key={stage.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{
                                    opacity: isAnimated ? 1 : 0.3,
                                    x: 0,
                                    scale: isActive ? 1.02 : 1
                                }}
                                transition={{ delay: index * 0.15, duration: 0.3 }}
                                className={`flex items-center gap-4 p-4 rounded-xl transition-all ${isActive
                                        ? 'bg-orange-500/15 border border-orange-500/40'
                                        : isPast
                                            ? 'bg-zinc-900/50 border border-zinc-800'
                                            : 'bg-zinc-950 border border-zinc-900'
                                    }`}
                            >
                                {/* Status indicator */}
                                <div className="flex-shrink-0">
                                    {isPast ? (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: 'spring', damping: 10 }}
                                        >
                                            <CheckCircle className="w-6 h-6 text-green-400" />
                                        </motion.div>
                                    ) : isActive ? (
                                        <motion.div
                                            animate={{ scale: [1, 1.2, 1] }}
                                            transition={{ duration: 1.5, repeat: Infinity }}
                                            className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center"
                                        >
                                            <div className="w-2 h-2 bg-black rounded-full" />
                                        </motion.div>
                                    ) : (
                                        <Circle className="w-6 h-6 text-zinc-700" />
                                    )}
                                </div>

                                {/* Label and description */}
                                <div className="flex-1">
                                    <p className={`font-semibold ${isActive ? 'text-orange-400' : isPast ? 'text-zinc-300' : 'text-zinc-600'
                                        }`}>
                                        {stage.label}
                                    </p>
                                    {isActive && (
                                        <motion.p
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="text-zinc-500 text-sm mt-1"
                                        >
                                            {stage.description}
                                        </motion.p>
                                    )}
                                </div>

                                {/* Connector line (except last) */}
                                {index < stages.length - 1 && (
                                    <div className="absolute left-8 top-full h-4 w-0.5 bg-zinc-800" />
                                )}
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* Motivational message */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                    className="text-center mb-8"
                >
                    <p className="text-zinc-400 italic">
                        "Kamu sedang membentuk pola berpikir. Terus lanjut."
                    </p>
                </motion.div>

                {/* Continue button */}
                {canContinue && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <button
                            onClick={onContinue}
                            className="w-full py-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold transition-all"
                        >
                            Lanjut ke Refleksi →
                        </button>
                    </motion.div>
                )}

                {/* Timer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="fixed bottom-8 left-1/2 -translate-x-1/2"
                >
                    <span className="text-zinc-600 text-xs font-mono">{timeRemaining}s</span>
                </motion.div>
            </div>
        </motion.div>
    );
}
