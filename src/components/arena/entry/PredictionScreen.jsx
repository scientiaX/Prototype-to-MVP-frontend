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

    const getColorClasses = (color, isSelected) => {
        const colors = {
            green: {
                selected: 'border-green-500 bg-green-500/20 text-green-400',
                hover: 'hover:border-green-500/50 hover:bg-green-500/10'
            },
            yellow: {
                selected: 'border-yellow-500 bg-yellow-500/20 text-yellow-400',
                hover: 'hover:border-yellow-500/50 hover:bg-yellow-500/10'
            },
            red: {
                selected: 'border-red-500 bg-red-500/20 text-red-400',
                hover: 'hover:border-red-500/50 hover:bg-red-500/10'
            },
            default: {
                selected: 'border-orange-500 bg-orange-500/20 text-orange-400',
                hover: 'hover:border-orange-500/50 hover:bg-orange-500/10'
            }
        };

        const colorSet = colors[color] || colors.default;
        return isSelected ? colorSet.selected : colorSet.hover;
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-black flex flex-col items-center justify-center p-6"
        >
            <div className="max-w-lg w-full">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/15 border border-amber-500/30 mb-4">
                        <Zap className="w-4 h-4 text-amber-400" />
                        <span className="text-amber-400 font-semibold text-sm uppercase tracking-wider">
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
                    <p className="text-zinc-400 text-sm mb-2">{contextText}</p>
                    <h2 className="text-2xl font-bold text-white">
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
                                "w-full p-4 rounded-xl border-2 text-left transition-all duration-300",
                                selectedPrediction?.id === option.id
                                    ? getColorClasses(option.color, true)
                                    : cn(
                                        "border-zinc-800 text-white",
                                        !isSubmitting && getColorClasses(option.color, false)
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
                                    "w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all",
                                    "bg-gradient-to-r from-amber-500 to-orange-600 text-black",
                                    "hover:from-amber-600 hover:to-orange-700",
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
                            className="mt-6 flex items-center justify-center gap-2 text-zinc-600 text-sm"
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
                    className="text-zinc-700 text-xs text-center mt-8"
                >
                    Tebakan != skor. Ini tentang membangun intuisi.
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
