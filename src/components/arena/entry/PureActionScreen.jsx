import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

/**
 * ============================================
 * FRIKSI #1: PURE ACTION SCREEN
 * ============================================
 * 
 * User memilih simbol/ikon TANPA tahu maknanya.
 * Sistem assign makna SETELAH aksi.
 * 
 * Prinsip: "Player boleh bertindak sebelum paham"
 * Beban makna ada di SISTEM, bukan user.
 */
export default function PureActionScreen({
    onSelect,
    timeRemaining = 15,
    questionText = "Pilih satu."
}) {
    const [selectedChoice, setSelectedChoice] = useState(null);
    const [isSelecting, setIsSelecting] = useState(false);

    // Pure choices - NO meaningful labels, just symbols
    // The meaning is assigned AFTER the user selects
    const pureChoices = [
        { id: 'A', symbol: '🔺', color: 'from-red-500 to-orange-500' },
        { id: 'B', symbol: '🔷', color: 'from-blue-500 to-cyan-500' },
        { id: 'C', symbol: '🟡', color: 'from-yellow-500 to-amber-500' }
    ];

    const handleSelect = async (choice) => {
        if (isSelecting) return;

        setSelectedChoice(choice);
        setIsSelecting(true);

        // Brief animation delay before moving on
        setTimeout(() => {
            onSelect(choice);
        }, 600);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-black flex flex-col items-center justify-center p-6"
        >
            <div className="max-w-lg w-full text-center">
                {/* Timer (subtle) */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mb-8"
                >
                    <span className="text-zinc-600 text-xs font-mono">{timeRemaining}s</span>
                </motion.div>

                {/* Question - intentionally vague */}
                <motion.h2
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl font-bold text-white mb-4"
                >
                    {questionText}
                </motion.h2>

                {/* Subtext - removes pressure */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-zinc-500 text-sm mb-12"
                >
                    Tidak ada yang salah. Ikuti intuisimu.
                </motion.p>

                {/* Pure choice buttons - just symbols, no context */}
                <div className="flex gap-6 justify-center">
                    {pureChoices.map((choice, index) => (
                        <motion.button
                            key={choice.id}
                            initial={{ opacity: 0, scale: 0.8, y: 20 }}
                            animate={{
                                opacity: 1,
                                scale: selectedChoice?.id === choice.id ? 1.15 : 1,
                                y: 0
                            }}
                            transition={{
                                delay: 0.3 + index * 0.1,
                                type: 'spring',
                                damping: 15
                            }}
                            onClick={() => handleSelect(choice)}
                            disabled={isSelecting}
                            className={`
                                w-28 h-28 text-5xl rounded-2xl 
                                transition-all duration-300 
                                flex items-center justify-center
                                ${selectedChoice?.id === choice.id
                                    ? `bg-gradient-to-br ${choice.color} shadow-lg shadow-white/20`
                                    : 'bg-zinc-900 hover:bg-zinc-800 hover:scale-105'
                                }
                                ${isSelecting && selectedChoice?.id !== choice.id ? 'opacity-30' : ''}
                                border-2 ${selectedChoice?.id === choice.id ? 'border-white' : 'border-zinc-800'}
                            `}
                        >
                            <motion.span
                                animate={{
                                    scale: selectedChoice?.id === choice.id ? [1, 1.2, 1] : 1
                                }}
                                transition={{ duration: 0.3 }}
                            >
                                {choice.symbol}
                            </motion.span>
                        </motion.button>
                    ))}
                </div>

                {/* Selection feedback */}
                {selectedChoice && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-8"
                    >
                        <span className="text-zinc-400 text-sm">
                            Memproses pilihanmu...
                        </span>
                    </motion.div>
                )}

                {/* Helper text (very subtle) */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="text-zinc-700 text-xs mt-12"
                >
                    Arti pilihanmu akan terungkap setelah memilih
                </motion.p>
            </div>
        </motion.div>
    );
}
