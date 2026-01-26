import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * ForcedChoiceScreen - Screen 2 (20-45s)
 * Purpose: Memaksa aksi tanpa berpikir panjang
 * - 2-3 opsi konkret
 * - Semua opsi tampak masuk akal
 * - Tidak ada opsi aman sempurna
 * - Visual urgency dengan countdown
 */
export default function ForcedChoiceScreen({
    choices,
    selectedChoice,
    onSelectChoice,
    onContinue,
    timeRemaining,
    durationSeconds = 25,
    isLoading
}) {
    const urgentThreshold = Math.max(3, Math.round(Number(durationSeconds) * 0.25));
    const isUrgent = timeRemaining <= urgentThreshold;
    const didAutoRef = useRef(false);

    useEffect(() => {
        if (didAutoRef.current) return;
        if (isLoading) return;
        if (timeRemaining > 0) return;
        if (!Array.isArray(choices) || choices.length === 0) return;

        didAutoRef.current = true;
        if (!selectedChoice) onSelectChoice(choices[0]);
        onContinue();
    }, [timeRemaining, isLoading, choices, selectedChoice, onSelectChoice, onContinue]);

    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="min-h-screen flex flex-col items-center justify-center p-6"
        >
            <div className="max-w-lg w-full">
                {/* Timer - becomes urgent when low */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                        "flex items-center justify-center gap-2 mb-8 px-4 py-2 mx-auto w-fit border-[3px] border-[var(--ink)] shadow-[4px_4px_0_var(--ink)] transition-all duration-100 [transition-timing-function:steps(4,end)] nx-sharp",
                        isUrgent
                            ? "bg-[var(--acid-orange)]"
                            : "bg-[var(--paper)]"
                    )}
                >
                    <Clock className={cn(
                        "w-4 h-4",
                        isUrgent ? "text-[var(--ink)] animate-pulse" : "text-[var(--ink-2)]"
                    )} />
                    <span className={cn(
                        "font-mono font-bold",
                        isUrgent ? "text-[var(--ink)]" : "text-[var(--ink)]"
                    )}>
                        {isUrgent ? 'NOW' : 'DECIDE'}
                    </span>
                </motion.div>

                {/* Question */}
                <motion.h2
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-2xl md:text-3xl font-bold text-[var(--ink)] text-center mb-8"
                >
                    Apa yang kamu lakukan <span className="text-[var(--acid-orange)]">SEKARANG</span>?
                </motion.h2>

                {/* Loading state */}
                {isLoading ? (
                    <div className="flex flex-col items-center gap-4 py-12">
                        <div className="w-10 h-10 border-[3px] border-[var(--ink)] border-t-transparent nx-sharp animate-spin" />
                        <p className="text-[var(--ink-2)] text-sm">Mempersiapkan pilihan...</p>
                    </div>
                ) : (
                    /* Choice Options */
                    <div className="space-y-4">
                        {choices.map((choice, index) => (
                            <motion.button
                                key={choice.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 + index * 0.1 }}
                                onClick={() => onSelectChoice(choice)}
                                className={cn(
                                    "w-full p-5 text-left border-[3px] border-[var(--ink)] shadow-[10px_10px_0_var(--ink)] transition-all duration-100 [transition-timing-function:steps(4,end)] nx-sharp",
                                    selectedChoice?.id === choice.id
                                        ? "bg-[var(--paper-2)] translate-x-[-2px] translate-y-[-2px]"
                                        : "bg-[var(--paper)] hover:bg-[var(--paper-2)] hover:translate-x-[-2px] hover:translate-y-[-2px]"
                                )}
                            >
                                <div className="flex items-start gap-4">
                                    {/* Icon */}
                                    <span className="text-3xl">{choice.icon}</span>

                                    <div className="flex-1">
                                        {/* Choice text */}
                                        <p className={cn(
                                            "font-semibold text-lg mb-1",
                                            selectedChoice?.id === choice.id ? "text-[var(--acid-orange)]" : "text-[var(--ink)]"
                                        )}>
                                            {choice.text}
                                        </p>

                                        {/* Hint */}
                                        <p className="text-[var(--ink-2)] text-sm">
                                            {choice.hint}
                                        </p>
                                    </div>

                                    {/* Selection indicator */}
                                    <div className={cn(
                                        "w-6 h-6 border-[2px] border-[var(--ink)] flex items-center justify-center flex-shrink-0 mt-1 nx-sharp",
                                        selectedChoice?.id === choice.id
                                            ? "bg-[var(--acid-orange)]"
                                            : "bg-[var(--paper)]"
                                    )}>
                                        {selectedChoice?.id === choice.id && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="w-2.5 h-2.5 bg-[var(--ink)] nx-sharp"
                                            />
                                        )}
                                    </div>
                                </div>
                            </motion.button>
                        ))}
                    </div>
                )}

                {/* Continue button - only shows when choice selected */}
                {selectedChoice && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-8"
                    >
                        <button
                            onClick={onContinue}
                            className="w-full py-4 bg-[var(--acid-orange)] text-[var(--ink)] font-bold text-lg border-[3px] border-[var(--ink)] shadow-[8px_8px_0_var(--ink)] hover:translate-x-[-3px] hover:translate-y-[-3px] transition-all duration-100 [transition-timing-function:steps(4,end)] nx-sharp"
                        >
                            Pilih Ini →
                        </button>
                    </motion.div>
                )}

                {/* Warning if no selection and urgent */}
                {!selectedChoice && isUrgent && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    className="mt-6 flex items-center justify-center gap-2 text-[var(--ink)]"
                    >
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Pilih sekarang!</span>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}
