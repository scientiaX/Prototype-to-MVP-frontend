import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, TrendingUp, AlertTriangle, ArrowRight, Zap, Target, Brain, Users, Shield } from 'lucide-react';
import { Button } from "@/components/ui/button";

/**
 * FeedbackScreen - Micro feedback display
 * From Experience Layer: "Feedback micro screen"
 * Shows progress indicators and toast-style feedback
 * 
 * FRIKSI #3: Now includes EXTERNALIZED feedback types
 * - externalized_trap: "Skenario ini memang menipu"
 * - model_critique: "Model berpikir ini mengabaikan..."
 * - archetype_framing: "Sebagai Analyst, wajar kalau..."
 * - normalize: "87% orang memilih yang sama"
 */
export default function FeedbackScreen({
    styles,
    feedbackType,
    feedbackMessage,
    progressStatus,
    onContinue,
    showContinue = true,
    autoAdvance = 2000,
    // NEW: Externalized feedback props
    archetypeInfo = null,
    isExternalized = false
}) {
    const [visible, setVisible] = useState(true);

    // Auto-advance after delay if specified
    useEffect(() => {
        if (autoAdvance && onContinue) {
            const timer = setTimeout(() => {
                onContinue();
            }, autoAdvance);
            return () => clearTimeout(timer);
        }
    }, [autoAdvance, onContinue]);

    // Feedback icons and styles - includes EXTERNALIZED types
    const getFeedbackConfig = () => {
        switch (feedbackType) {
            // === EXISTING TYPES ===
            case 'assumption_found':
                return {
                    icon: <Zap className="w-8 h-8" />,
                    color: 'text-yellow-400',
                    bg: 'bg-yellow-500/10',
                    border: 'border-yellow-500/30',
                    prefix: null
                };
            case 'tradeoff_locked':
                return {
                    icon: <Check className="w-8 h-8" />,
                    color: 'text-green-400',
                    bg: 'bg-green-500/10',
                    border: 'border-green-500/30',
                    prefix: null
                };
            case 'reasoning_improved':
                return {
                    icon: <TrendingUp className="w-8 h-8" />,
                    color: 'text-blue-400',
                    bg: 'bg-blue-500/10',
                    border: 'border-blue-500/30',
                    prefix: null
                };
            case 'warning':
                return {
                    icon: <AlertTriangle className="w-8 h-8" />,
                    color: 'text-orange-400',
                    bg: 'bg-orange-500/10',
                    border: 'border-orange-500/30',
                    prefix: null
                };

            // === NEW: EXTERNALIZED FAILURE TYPES (Friksi #3) ===
            case 'externalized_trap':
            case 'trap':
                return {
                    icon: <Target className="w-8 h-8" />,
                    color: 'text-amber-400',
                    bg: 'bg-amber-500/10',
                    border: 'border-amber-500/30',
                    prefix: '🎯 Jebakan Terdeteksi'
                };
            case 'model_critique':
            case 'model':
                return {
                    icon: <Brain className="w-8 h-8" />,
                    color: 'text-purple-400',
                    bg: 'bg-purple-500/10',
                    border: 'border-purple-500/30',
                    prefix: '🧠 Model Berpikir'
                };
            case 'archetype_framing':
            case 'archetype':
                return {
                    icon: <Shield className="w-8 h-8" />,
                    color: 'text-indigo-400',
                    bg: 'bg-indigo-500/10',
                    border: 'border-indigo-500/30',
                    prefix: archetypeInfo?.label ? `👤 Gaya ${archetypeInfo.label}` : '👤 Gaya Berpikir'
                };
            case 'normalize':
                return {
                    icon: <Users className="w-8 h-8" />,
                    color: 'text-cyan-400',
                    bg: 'bg-cyan-500/10',
                    border: 'border-cyan-500/30',
                    prefix: '📊 Pola Umum'
                };

            default:
                return {
                    icon: <Check className="w-8 h-8" />,
                    color: 'text-green-400',
                    bg: 'bg-green-500/10',
                    border: 'border-green-500/30',
                    prefix: null
                };
        }
    };

    const config = getFeedbackConfig();

    // Get progress status chip
    const getProgressChip = () => {
        switch (progressStatus) {
            case 'forming':
                return { text: 'Forming', color: 'bg-zinc-700 text-zinc-300' };
            case 'developing':
                return { text: 'Developing', color: 'bg-blue-500/20 text-blue-400' };
            case 'consistent':
                return { text: 'Consistent', color: 'bg-green-500/20 text-green-400' };
            case 'stabilized':
                return { text: 'Decision Stabilized', color: 'bg-orange-500/20 text-orange-400' };
            default:
                return { text: 'Processing', color: 'bg-zinc-700 text-zinc-300' };
        }
    };

    const progress = getProgressChip();

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`min-h-screen flex items-center justify-center p-6 ${styles.container}`}
        >
            <div className="max-w-md w-full">
                {/* Main Feedback Card */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', damping: 15 }}
                    className={`rounded-2xl p-8 border ${config.border} ${config.bg} text-center`}
                >
                    {/* Externalized Prefix Label (Friksi #3) */}
                    {config.prefix && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-4"
                        >
                            <span className={`text-sm font-semibold ${config.color} opacity-80`}>
                                {config.prefix}
                            </span>
                        </motion.div>
                    )}

                    {/* Icon */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1, type: 'spring' }}
                        className={`w-16 h-16 rounded-full ${config.bg} border ${config.border} flex items-center justify-center mx-auto mb-4`}
                    >
                        <span className={config.color}>{config.icon}</span>
                    </motion.div>

                    {/* Message */}
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className={`text-lg font-medium ${config.color} mb-2`}
                    >
                        {feedbackMessage}
                    </motion.p>

                    {/* Archetype Info for externalized feedback */}
                    {isExternalized && archetypeInfo && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.25 }}
                            className="mt-3 mb-2"
                        >
                            <span className="text-xs text-zinc-500">
                                Kekuatan: {archetypeInfo.strength} • Tantangan: {archetypeInfo.weakness}
                            </span>
                        </motion.div>
                    )}

                    {/* Progress Status Chip */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="inline-block"
                    >
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${progress.color}`}>
                            {progress.text}
                        </span>
                    </motion.div>
                </motion.div>

                {/* Continue Button (if not auto-advance) */}
                {showContinue && !autoAdvance && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="mt-8"
                    >
                        <Button
                            onClick={onContinue}
                            className={`w-full ${styles.button} py-4 text-lg font-bold`}
                        >
                            Lanjut
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}
