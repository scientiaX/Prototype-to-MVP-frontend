import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

/**
 * ============================================
 * FRIKSI #1: MEANING REVEAL SCREEN
 * ============================================
 * 
 * System assigns meaning AFTER user selects.
 * "Kamu memilih pendekatan AGRESIF. Ini artinya..."
 * 
 * Prinsip: Beban makna di SISTEM, bukan user.
 * User bertindak dulu, pemahaman menyusul.
 */

// Default meaning mappings - can be overridden by backend
const DEFAULT_MEANING_MAP = {
    'A': {
        approach: 'AGRESIF',
        description: 'Kamu cenderung mengutamakan kecepatan dan hasil cepat.',
        traits: ['Berani mengambil risiko', 'Action-oriented', 'Kompetitif'],
        icon: '🔥'
    },
    'B': {
        approach: 'ANALITIK',
        description: 'Kamu cenderung mempertimbangkan data dan bukti sebelum bertindak.',
        traits: ['Teliti', 'Sistematis', 'Hati-hati'],
        icon: '🧠'
    },
    'C': {
        approach: 'KOLABORATIF',
        description: 'Kamu cenderung mencari kesepakatan dan membangun harmoni.',
        traits: ['Empatis', 'Komunikatif', 'Diplomatis'],
        icon: '🤝'
    }
};

export default function MeaningRevealScreen({
    selectedChoice,
    assignedMeaning = null, // Can be passed from backend
    onContinue,
    timeRemaining = 20
}) {
    const [revealStage, setRevealStage] = useState(0);
    const [canContinue, setCanContinue] = useState(false);

    // Use assigned meaning or default
    const meaning = assignedMeaning || DEFAULT_MEANING_MAP[selectedChoice?.id] || DEFAULT_MEANING_MAP['A'];

    // Staged reveal animation
    useEffect(() => {
        const timers = [
            setTimeout(() => setRevealStage(1), 500),   // Show approach name
            setTimeout(() => setRevealStage(2), 1500),  // Show description
            setTimeout(() => setRevealStage(3), 2500),  // Show traits
            setTimeout(() => setCanContinue(true), 3500) // Enable continue
        ];

        return () => timers.forEach(t => clearTimeout(t));
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-black flex flex-col items-center justify-center p-6"
        >
            <div className="max-w-lg w-full text-center">
                {/* Selected symbol */}
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', damping: 10 }}
                    className="text-7xl mb-8"
                >
                    {selectedChoice?.symbol || '🔺'}
                </motion.div>

                {/* Reveal header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mb-6"
                >
                    <p className="text-zinc-500 text-sm mb-1">Pilihanmu mengindikasikan:</p>
                </motion.div>

                {/* Stage 1: Approach Name */}
                {revealStage >= 1 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: 'spring', damping: 15 }}
                        className="mb-6"
                    >
                        <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/40">
                            <span className="text-2xl">{meaning.icon}</span>
                            <span className="text-2xl font-bold text-orange-400">
                                {meaning.approach}
                            </span>
                        </div>
                    </motion.div>
                )}

                {/* Stage 2: Description */}
                {revealStage >= 2 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <p className="text-zinc-300 text-lg leading-relaxed">
                            {meaning.description}
                        </p>
                    </motion.div>
                )}

                {/* Stage 3: Traits */}
                {revealStage >= 3 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-wrap justify-center gap-2 mb-8"
                    >
                        {meaning.traits?.map((trait, i) => (
                            <motion.span
                                key={trait}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className="px-3 py-1 rounded-full bg-zinc-800 text-zinc-300 text-sm"
                            >
                                {trait}
                            </motion.span>
                        ))}
                    </motion.div>
                )}

                {/* Continue button */}
                {canContinue && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <button
                            onClick={() => onContinue({ choice: selectedChoice, meaning })}
                            className="w-full py-4 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-black font-bold text-lg hover:from-orange-600 hover:to-red-700 transition-all flex items-center justify-center gap-2"
                        >
                            <Sparkles className="w-5 h-5" />
                            Lanjut dengan Gaya Ini
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </motion.div>
                )}

                {/* Reassurance text */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2 }}
                    className="text-zinc-600 text-xs mt-8"
                >
                    Ini bukan label permanen. Ini titik awal untuk memahami gaya berpikirmu.
                </motion.p>

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
