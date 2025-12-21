import React from 'react';
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
    isLoading
}) {
    const isUrgent = timeRemaining <= 10;

    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="min-h-screen bg-black flex flex-col items-center justify-center p-6"
        >
            <div className="max-w-lg w-full">
                {/* Timer - becomes urgent when low */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                        "flex items-center justify-center gap-2 mb-8 px-4 py-2 rounded-full mx-auto w-fit",
                        isUrgent
                            ? "bg-red-500/20 border border-red-500/50"
                            : "bg-zinc-800/50 border border-zinc-700"
                    )}
                >
                    <Clock className={cn(
                        "w-4 h-4",
                        isUrgent ? "text-red-400 animate-pulse" : "text-zinc-400"
                    )} />
                    <span className={cn(
                        "font-mono font-bold",
                        isUrgent ? "text-red-400" : "text-zinc-300"
                    )}>
                        {timeRemaining}s
                    </span>
                </motion.div>

                {/* Question */}
                <motion.h2
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-2xl md:text-3xl font-bold text-white text-center mb-8"
                >
                    Apa yang kamu lakukan <span className="text-orange-400">SEKARANG</span>?
                </motion.h2>

                {/* Loading state */}
                {isLoading ? (
                    <div className="flex flex-col items-center gap-4 py-12">
                        <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-zinc-500 text-sm">Mempersiapkan pilihan...</p>
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
                                    "w-full p-5 rounded-xl border-2 text-left transition-all duration-300",
                                    selectedChoice?.id === choice.id
                                        ? "border-orange-500 bg-orange-500/10 scale-[1.02]"
                                        : "border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900/50"
                                )}
                            >
                                <div className="flex items-start gap-4">
                                    {/* Icon */}
                                    <span className="text-3xl">{choice.icon}</span>

                                    <div className="flex-1">
                                        {/* Choice text */}
                                        <p className={cn(
                                            "font-semibold text-lg mb-1",
                                            selectedChoice?.id === choice.id ? "text-orange-400" : "text-white"
                                        )}>
                                            {choice.text}
                                        </p>

                                        {/* Hint */}
                                        <p className="text-zinc-500 text-sm">
                                            {choice.hint}
                                        </p>
                                    </div>

                                    {/* Selection indicator */}
                                    <div className={cn(
                                        "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1",
                                        selectedChoice?.id === choice.id
                                            ? "border-orange-500 bg-orange-500"
                                            : "border-zinc-600"
                                    )}>
                                        {selectedChoice?.id === choice.id && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="w-2.5 h-2.5 bg-black rounded-full"
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
                            className="w-full py-4 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-black font-bold text-lg hover:from-orange-600 hover:to-red-700 transition-all"
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
                        className="mt-6 flex items-center justify-center gap-2 text-red-400"
                    >
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Pilih sekarang!</span>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}
