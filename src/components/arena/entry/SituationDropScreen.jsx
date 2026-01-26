import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User, Briefcase, TrendingUp } from 'lucide-react';

/**
 * SituationDropScreen - Screen 1 (0-20s)
 * Purpose: Memberikan konteks tanpa analisis
 * - 3-5 baris situasi konkret
 * - Tidak ada pertanyaan
 * - Tidak ada input
 * - Auto-advance atau tap to continue
 */
export default function SituationDropScreen({
    problem,
    roleLabel,
    onContinue,
    timeRemaining
}) {
    const [textRevealed, setTextRevealed] = useState(0);
    const [canContinue, setCanContinue] = useState(false);

    // Typewriter effect - reveal text progressively
    useEffect(() => {
        const words = problem?.context?.split(' ') || [];
        const timer = setInterval(() => {
            setTextRevealed(prev => {
                if (prev >= words.length) {
                    clearInterval(timer);
                    return prev;
                }
                return prev + 1;
            });
        }, 80); // 80ms per word

        return () => clearInterval(timer);
    }, [problem?.context]);

    // Enable continue after 3 seconds minimum
    useEffect(() => {
        const timer = setTimeout(() => {
            setCanContinue(true);
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    // Auto-advance after timeout or when text fully revealed
    useEffect(() => {
        if (timeRemaining <= 0) {
            onContinue();
        }
    }, [timeRemaining, onContinue]);

    const words = problem?.context?.split(' ') || [];
    const revealedText = words.slice(0, textRevealed).join(' ');
    const remainingText = words.slice(textRevealed).join(' ');

    // Get role icon
    const getRoleIcon = () => {
        const role = roleLabel?.toLowerCase() || '';
        if (role.includes('ceo') || role.includes('founder')) {
            return <Briefcase className="w-5 h-5" />;
        }
        if (role.includes('product') || role.includes('pm')) {
            return <TrendingUp className="w-5 h-5" />;
        }
        return <User className="w-5 h-5" />;
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col items-center justify-center p-6"
        >
            <div className="max-w-xl w-full">
                {/* Role Badge */}
                {roleLabel && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex items-center gap-2 mb-8 justify-center"
                    >
                        <div className="flex items-center gap-2 px-4 py-2 bg-[var(--paper)] border-[3px] border-[var(--ink)] shadow-[4px_4px_0_var(--ink)] nx-sharp">
                            <span className="text-[var(--ink)]">
                                {getRoleIcon()}
                            </span>
                            <span className="text-[var(--ink)] font-bold text-sm uppercase tracking-wider">
                                {roleLabel.replace(/_/g, ' ')}
                            </span>
                        </div>
                    </motion.div>
                )}

                {/* Context Text with Typewriter Effect */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-center mb-12"
                >
                    <p className="text-2xl md:text-3xl text-[var(--ink)] leading-relaxed font-light">
                        <span className="opacity-100">{revealedText}</span>
                        <span className="opacity-20">{remainingText ? ` ${remainingText}` : ''}</span>
                        {textRevealed < words.length && (
                            <motion.span
                                animate={{ opacity: [1, 0, 1] }}
                                transition={{ duration: 0.8, repeat: Infinity }}
                                className="inline-block w-0.5 h-8 bg-[var(--acid-orange)] ml-1 align-middle"
                            />
                        )}
                    </p>
                </motion.div>

                {/* Continue hint */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: canContinue ? 1 : 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-center"
                >
                    <button
                        onClick={canContinue ? onContinue : undefined}
                        disabled={!canContinue}
                        className="group inline-flex items-center gap-2 text-[var(--ink-2)] hover:text-[var(--acid-orange)] transition-colors"
                    >
                        <span className="text-sm">Tap untuk lanjut</span>
                        <motion.span
                            animate={{ y: [0, 5, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        >
                            ▼
                        </motion.span>
                    </button>
                </motion.div>

                {/* Progress indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="fixed bottom-8 left-1/2 -translate-x-1/2 w-48"
                >
                    <div className="h-2 bg-[var(--paper)] border-[2px] border-[var(--ink)] nx-sharp overflow-hidden">
                        <motion.div
                            className="h-full bg-[var(--acid-orange)]"
                            initial={{ width: '0%' }}
                            animate={{ width: `${((20 - timeRemaining) / 20) * 100}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>
                    <p className="text-center text-[var(--ink-3)] text-xs mt-2 font-mono">
                        {timeRemaining}s
                    </p>
                </motion.div>
            </div>
        </motion.div>
    );
}
