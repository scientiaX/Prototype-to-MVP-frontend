import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Check, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * DecisionLockScreen - Screen 3 (45-60s)
 * Purpose: Menciptakan rasa tindakan nyata (micro-win pertama)
 * - Tombol eksplisit: "KUNCI KEPUTUSAN"
 * - Tidak bisa undo
 * - Visual konfirmasi singkat
 */
export default function DecisionLockScreen({
    selectedChoice,
    isLocked,
    onLockDecision,
    isLoading
}) {
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [isLocking, setIsLocking] = useState(false);

    const handleLock = async () => {
        setIsLocking(true);
        await onLockDecision();
        setIsLocking(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-black flex flex-col items-center justify-center p-6"
        >
            <div className="max-w-md w-full">
                {/* Selected choice display */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <p className="text-zinc-500 text-sm mb-4 uppercase tracking-wider">Kamu memilih</p>

                    <motion.div
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        className="bg-zinc-900 border-2 border-orange-500/50 rounded-xl p-6 inline-block"
                    >
                        <span className="text-4xl mb-3 block">{selectedChoice?.icon}</span>
                        <p className="text-white text-xl font-bold">{selectedChoice?.text}</p>
                    </motion.div>
                </motion.div>

                {/* Warning */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center justify-center gap-2 text-amber-400 mb-8"
                >
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm font-medium">Keputusan tidak bisa diubah</span>
                </motion.div>

                {/* Lock Button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    {!isLocked ? (
                        <motion.button
                            onClick={handleLock}
                            disabled={isLocking || isLoading}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={cn(
                                "w-full py-5 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all",
                                isLocking || isLoading
                                    ? "bg-zinc-800 text-zinc-500 cursor-wait"
                                    : "bg-gradient-to-r from-orange-500 to-red-600 text-black hover:from-orange-600 hover:to-red-700"
                            )}
                        >
                            {isLocking || isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
                                    Mengunci...
                                </>
                            ) : (
                                <>
                                    <Lock className="w-5 h-5" />
                                    KUNCI KEPUTUSAN
                                </>
                            )}
                        </motion.button>
                    ) : (
                        /* Locked confirmation animation */
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-center"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', damping: 10 }}
                                className="w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center mx-auto mb-4"
                            >
                                <Check className="w-10 h-10 text-green-400" />
                            </motion.div>
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="text-green-400 font-bold text-xl"
                            >
                                Keputusan Terkunci ✓
                            </motion.p>
                        </motion.div>
                    )}
                </motion.div>

                {/* Micro-win celebration (subtle) */}
                <AnimatePresence>
                    {isLocked && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ delay: 0.5 }}
                            className="mt-8 text-center"
                        >
                            <p className="text-zinc-500 text-sm">
                                Langkah pertama selesai. Lihat apa yang terjadi selanjutnya...
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Background pulse effect when locked */}
                <AnimatePresence>
                    {isLocked && (
                        <motion.div
                            initial={{ scale: 0, opacity: 0.5 }}
                            animate={{ scale: 3, opacity: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1 }}
                            className="fixed inset-0 pointer-events-none flex items-center justify-center"
                        >
                            <div className="w-32 h-32 rounded-full bg-green-500/30" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
