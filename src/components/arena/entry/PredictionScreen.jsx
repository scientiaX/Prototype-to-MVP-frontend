import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Zap, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * ============================================
 * FRIKSI #4: PREDICTION SCREEN
 * ============================================
 * 
 * User memprediksi hasil SEBELUM sistem reveal.
 * Reward datang dari tebakan itu sendiri.
 * 
 * Prinsip: "Reward kecil dan cepat menjaga engagement"
 * Kepuasan datang dari *tebakan*, bukan kebenaran.
 */
export default function PredictionScreen({
    selectedChoice,
    predictionOptions = [],
    onPredict,
    timeRemaining = 15,
    contextText = "Dengan pilihanmu tadi..."
}) {
    const [selectedPrediction, setSelectedPrediction] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showHint, setShowHint] = useState(false);

    // Default prediction options if none provided
    const defaultOptions = [
        {
            id: 'positive',
            text: 'Hasilnya akan menguntungkan',
            icon: '✨',
            color: 'green'
        },
        {
            id: 'mixed',
            text: 'Ada trade-off yang harus dibayar',
            icon: '⚖️',
            color: 'yellow'
        },
        {
            id: 'challenging',
            text: 'Akan ada tantangan besar',
            icon: '🔥',
            color: 'red'
        }
    ];

    const options = predictionOptions.length > 0 ? predictionOptions : defaultOptions;

    // Show hint after delay
    useEffect(() => {
        const timer = setTimeout(() => setShowHint(true), 5000);
        return () => clearTimeout(timer);
    }, []);

    const handleSelect = (option) => {
        if (isSubmitting) return;
        setSelectedPrediction(option);
    };

    const handleSubmit = async () => {
        if (!selectedPrediction || isSubmitting) return;

        setIsSubmitting(true);

        // Brief animation before calling callback
        setTimeout(() => {
            onPredict({
                prediction: selectedPrediction,
                choice: selectedChoice,
                timestamp: Date.now()
            });
        }, 500);
    };

    const getSelectedBg = (color) => {
        switch (color) {
            case 'green':
                return 'bg-[var(--acid-lime)]';
            case 'yellow':
                return 'bg-[var(--acid-yellow)]';
            case 'red':
                return 'bg-[var(--acid-orange)]';
            default:
                return 'bg-[var(--paper-2)]';
        }
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
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--acid-yellow)] border-[3px] border-[var(--ink)] shadow-[4px_4px_0_var(--ink)] nx-sharp mb-4">
                        <Zap className="w-4 h-4 text-[var(--ink)]" />
                        <span className="text-[var(--ink)] font-bold text-sm uppercase tracking-wider">
                            Prediksi
                        </span>
                    </div>
                </motion.div>

                {/* Context */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-center mb-6"
                >
                    <p className="text-[var(--ink-2)] text-sm mb-2">{contextText}</p>
                    <h2 className="text-2xl font-bold text-[var(--ink)]">
                        Menurutmu, apa yang akan terjadi?
                    </h2>
                </motion.div>

                {/* Prediction options */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-3 mb-8"
                >
                    {options.map((option, index) => (
                        <motion.button
                            key={option.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + index * 0.1 }}
                            onClick={() => handleSelect(option)}
                            disabled={isSubmitting}
                            className={cn(
                                "w-full p-4 text-left border-[3px] border-[var(--ink)] shadow-[8px_8px_0_var(--ink)] transition-all duration-100 [transition-timing-function:steps(4,end)] nx-sharp",
                                selectedPrediction?.id === option.id
                                    ? cn(getSelectedBg(option.color), "translate-x-[-2px] translate-y-[-2px]")
                                    : cn(
                                        "bg-[var(--paper)] text-[var(--ink)] hover:bg-[var(--paper-2)] hover:translate-x-[-2px] hover:translate-y-[-2px]"
                                    ),
                                isSubmitting && selectedPrediction?.id !== option.id && "opacity-30"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">{option.icon}</span>
                                <span className="text-lg">{option.text}</span>
                            </div>
                        </motion.button>
                    ))}
                </motion.div>

                {/* Submit button */}
                <AnimatePresence>
                    {selectedPrediction && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                        >
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className={cn(
                                    "w-full py-4 font-bold text-lg flex items-center justify-center gap-3 border-[3px] border-[var(--ink)] shadow-[8px_8px_0_var(--ink)] transition-all duration-100 [transition-timing-function:steps(4,end)] nx-sharp",
                                    "bg-[var(--acid-yellow)] text-[var(--ink)] hover:translate-x-[-3px] hover:translate-y-[-3px]",
                                    isSubmitting && "opacity-50"
                                )}
                            >
                                <Sparkles className="w-5 h-5" />
                                {isSubmitting ? "Memverifikasi..." : "Kunci Prediksi"}
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Hint */}
                <AnimatePresence>
                    {showHint && !selectedPrediction && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="mt-6 flex items-center justify-center gap-2 text-[var(--ink-2)] text-sm"
                        >
                            <HelpCircle className="w-4 h-4" />
                            <span>Tidak ada yang salah. Ikuti intuisimu.</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Reassurance */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="text-[var(--ink-3)] text-xs text-center mt-8"
                >
                    Tebakan != skor. Ini tentang membangun intuisi.
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
