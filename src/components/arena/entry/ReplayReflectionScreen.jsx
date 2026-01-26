import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, ArrowRight, Check, RefreshCw, History, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * ============================================
 * FRIKSI #5: REPLAY REFLECTION SCREEN
 * ============================================
 * 
 * Replay-style reflection: lihat ulang keputusan dengan info baru.
 * Bukan menulis panjang, tapi memilih ulang.
 * 
 * Prinsip: "Refleksi adalah replay, bukan ujian"
 */
export default function ReplayReflectionScreen({
    previousDecisions = [],
    newInfo,
    alternativeChoices = [],
    onReselect, // User decides to change
    onKeep,     // User keeps original decision
    timeRemaining
}) {
    const [selectedAction, setSelectedAction] = useState(null); // 'keep' or 'change'
    const [showNewInfo, setShowNewInfo] = useState(false);
    const [showOptions, setShowOptions] = useState(false);

    // Previous decision to review
    const previousDecision = previousDecisions[0] || {
        text: 'Keputusan sebelumnya',
        approach: 'UNKNOWN'
    };

    // Staged reveal
    useEffect(() => {
        const timer1 = setTimeout(() => setShowNewInfo(true), 1000);
        const timer2 = setTimeout(() => setShowOptions(true), 2500);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, []);

    const handleAction = (action) => {
        setSelectedAction(action);

        // Brief delay for animation
        setTimeout(() => {
            if (action === 'keep') {
                onKeep({
                    decision: previousDecision,
                    reflected: true,
                    changed: false
                });
            } else {
                onReselect({
                    decision: previousDecision,
                    reflected: true,
                    changed: true
                });
            }
        }, 500);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col items-center justify-center p-6"
        >
            <div className="max-w-lg w-full">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--acid-cyan)] border-[3px] border-[var(--ink)] shadow-[4px_4px_0_var(--ink)] nx-sharp mb-4">
                        <History className="w-4 h-4 text-[var(--ink)]" />
                        <span className="text-[var(--ink)] font-bold text-sm uppercase tracking-wider">
                            Replay Mode
                        </span>
                    </div>
                    <h2 className="text-xl text-[var(--ink)] font-light">
                        Dengan info baru ini...
                    </h2>
                </motion.div>

                {/* Previous Decision Card */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="nx-panel nx-sharp p-5 mb-6"
                >
                    <div className="flex items-center gap-2 mb-3">
                        <RotateCcw className="w-4 h-4 text-[var(--ink-3)]" />
                        <span className="text-[var(--ink-3)] text-sm">Keputusanmu tadi:</span>
                    </div>
                    <p className="text-[var(--acid-orange)] font-bold text-lg">
                        {previousDecision.text}
                    </p>
                    {previousDecision.approach && (
                        <span className="inline-block mt-2 px-2 py-1 bg-[var(--paper-2)] border-[2px] border-[var(--ink)] nx-sharp text-[var(--ink)] text-xs font-semibold">
                            Gaya: {previousDecision.approach}
                        </span>
                    )}
                </motion.div>

                {/* New Info Reveal */}
                <AnimatePresence>
                    {showNewInfo && (
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ type: 'spring', damping: 15 }}
                            className="nx-panel nx-sharp p-5 mb-8"
                        >
                            <div className="flex items-center gap-2 mb-3">
                                <Lightbulb className="w-4 h-4 text-[var(--ink)]" />
                                <span className="text-[var(--ink)] text-sm font-bold">Info Baru:</span>
                            </div>
                            <p className="text-[var(--ink)] text-lg leading-relaxed">
                                {newInfo || "Ternyata ada faktor yang belum kamu pertimbangkan sebelumnya."}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Action Options */}
                <AnimatePresence>
                    {showOptions && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-3"
                        >
                            {/* Question */}
                            <p className="text-center text-[var(--ink-2)] mb-4">
                                Apakah keputusanmu berubah?
                            </p>

                            {/* Keep Original */}
                            <motion.button
                                onClick={() => handleAction('keep')}
                                disabled={selectedAction !== null}
                                className={cn(
                                    "w-full py-4 font-semibold text-lg flex items-center justify-center gap-3 transition-all duration-100 [transition-timing-function:steps(4,end)] border-[3px] border-[var(--ink)] shadow-[8px_8px_0_var(--ink)] nx-sharp",
                                    selectedAction === 'keep'
                                        ? "bg-[var(--acid-lime)] text-[var(--ink)] translate-x-[-2px] translate-y-[-2px]"
                                        : selectedAction === 'change'
                                            ? "opacity-30 bg-[var(--paper)] text-[var(--ink-3)]"
                                            : "bg-[var(--paper)] text-[var(--ink)] hover:bg-[var(--paper-2)] hover:translate-x-[-2px] hover:translate-y-[-2px]"
                                )}
                                whileHover={selectedAction === null ? { scale: 1.02 } : {}}
                                whileTap={selectedAction === null ? { scale: 0.98 } : {}}
                            >
                                <Check className="w-5 h-5" />
                                Tetap dengan keputusan ini
                            </motion.button>

                            {/* Change Decision */}
                            <motion.button
                                onClick={() => handleAction('change')}
                                disabled={selectedAction !== null}
                                className={cn(
                                    "w-full py-4 font-semibold text-lg flex items-center justify-center gap-3 transition-all duration-100 [transition-timing-function:steps(4,end)] border-[3px] border-[var(--ink)] shadow-[8px_8px_0_var(--ink)] nx-sharp",
                                    selectedAction === 'change'
                                        ? "bg-[var(--acid-orange)] text-[var(--ink)] translate-x-[-2px] translate-y-[-2px]"
                                        : selectedAction === 'keep'
                                            ? "opacity-30 bg-[var(--paper)] text-[var(--ink-3)]"
                                            : "bg-[var(--paper)] text-[var(--ink)] hover:bg-[var(--paper-2)] hover:translate-x-[-2px] hover:translate-y-[-2px]"
                                )}
                                whileHover={selectedAction === null ? { scale: 1.02 } : {}}
                                whileTap={selectedAction === null ? { scale: 0.98 } : {}}
                            >
                                <RefreshCw className="w-5 h-5" />
                                Ubah keputusan
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Selection feedback */}
                <AnimatePresence>
                    {selectedAction && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-6 text-center"
                        >
                            <p className="text-[var(--ink-2)] text-sm">
                                {selectedAction === 'keep'
                                    ? "Konsistensi adalah kekuatan. Melanjutkan..."
                                    : "Beradaptasi dengan info baru. Mengulang pilihan..."
                                }
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Helper text */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 3 }}
                    className="text-[var(--ink-3)] text-xs text-center mt-8"
                >
                    Tidak ada jawaban yang salah. Ini tentang proses berpikir.
                </motion.p>

                {/* Timer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="fixed bottom-8 left-1/2 -translate-x-1/2"
                >
                    <span className="text-[var(--ink-3)] text-xs font-mono">{timeRemaining}s</span>
                </motion.div>
            </div>
        </motion.div>
    );
}
