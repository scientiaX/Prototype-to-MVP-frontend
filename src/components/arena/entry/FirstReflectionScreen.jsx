import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, ArrowRight, Sparkles, SkipForward, Gift, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * ============================================
 * FRIKSI #5: OPTIONAL REFLECTION SCREEN
 * ============================================
 * 
 * Refleksi OPSIONAL dengan hidden power.
 * - Skip = kehilangan bonus insight
 * - Submit = membuka jalur insight tersembunyi
 * 
 * Prinsip: "Refleksi adalah replay, bukan ujian"
 */
export default function FirstReflectionScreen({
    selectedChoice,
    reflectionQuestion,
    onSubmit,
    onSkip, // NEW: handler for skip
    timeRemaining
}) {
    const [text, setText] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [showSkip, setShowSkip] = useState(false);
    const [showHiddenPowerHint, setShowHiddenPowerHint] = useState(false);

    // Lowered minimum for less friction
    const minChars = 10; // Reduced from 20
    const maxChars = 200; // Increased from 150

    const isValid = text.length >= minChars && text.length <= maxChars;
    const canSkip = text.length === 0 || text.length < minChars;

    // Show skip button after delay
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowSkip(true);
        }, 3000); // Show skip after 3 seconds

        return () => clearTimeout(timer);
    }, []);

    // Show hidden power hint when user starts typing
    useEffect(() => {
        if (text.length > 0 && !showHiddenPowerHint) {
            setShowHiddenPowerHint(true);
        }
    }, [text, showHiddenPowerHint]);

    const handleSubmit = () => {
        if (isValid) {
            onSubmit({
                text,
                skipped: false,
                unlocks_bonus: true // Flag for backend to unlock bonus insight
            });
        }
    };

    const handleSkip = () => {
        if (onSkip) {
            onSkip({
                skipped: true,
                text: text.trim() || null, // Send partial text if any
                unlocks_bonus: false
            });
        }
    };

    // Default question if none provided
    const question = reflectionQuestion ||
        `Satu kalimat: kenapa kamu memilih "${selectedChoice?.text || 'pilihan tadi'}"?`;

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
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/15 border border-violet-500/30 mb-4">
                        <MessageSquare className="w-4 h-4 text-violet-400" />
                        <span className="text-violet-400 font-semibold text-sm uppercase tracking-wider">
                            Refleksi Singkat
                        </span>
                        {/* Optional badge */}
                        <span className="text-zinc-500 text-xs">(opsional)</span>
                    </div>
                </motion.div>

                {/* Question */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mb-8"
                >
                    <p className="text-2xl text-white font-light text-center leading-relaxed">
                        "{question}"
                    </p>
                </motion.div>

                {/* Input area */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mb-6"
                >
                    <div className={cn(
                        "relative rounded-xl border-2 transition-all duration-300",
                        isFocused
                            ? "border-violet-500 bg-zinc-900/80"
                            : "border-zinc-800 bg-zinc-900/50"
                    )}>
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value.slice(0, maxChars))}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            placeholder="Tulis jawaban singkatmu... (opsional)"
                            rows={3}
                            className="w-full bg-transparent p-4 text-white placeholder-zinc-600 resize-none focus:outline-none text-lg"
                        />

                        {/* Character counter */}
                        <div className="absolute bottom-3 right-3 flex items-center gap-2">
                            <span className={cn(
                                "text-xs font-mono",
                                text.length < minChars ? "text-zinc-500"
                                    : text.length > maxChars * 0.9 ? "text-orange-400"
                                        : "text-green-400"
                            )}>
                                {text.length}/{maxChars}
                            </span>
                        </div>
                    </div>

                    {/* Hint text - now shows hidden power */}
                    <div className="mt-3 flex items-center justify-center gap-2">
                        <AnimatePresence>
                            {showHiddenPowerHint && text.length >= minChars && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="flex items-center gap-2 text-violet-400 text-xs"
                                >
                                    <Gift className="w-3 h-3" />
                                    <span>Refleksi membuka insight bonus!</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>

                {/* Action buttons */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="space-y-3"
                >
                    {/* Primary: Submit (enabled when valid) */}
                    <button
                        onClick={handleSubmit}
                        disabled={!isValid}
                        className={cn(
                            "w-full py-5 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all",
                            isValid
                                ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:from-violet-600 hover:to-purple-700"
                                : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                        )}
                    >
                        <Sparkles className="w-5 h-5" />
                        MASUK ARENA
                        {isValid && <Gift className="w-5 h-5" />}
                    </button>

                    {/* Secondary: Skip (appears after 3 seconds) */}
                    <AnimatePresence>
                        {showSkip && (
                            <motion.button
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                onClick={handleSkip}
                                className="w-full py-3 rounded-xl text-zinc-500 hover:text-zinc-300 text-sm flex items-center justify-center gap-2 transition-all hover:bg-zinc-900"
                            >
                                <SkipForward className="w-4 h-4" />
                                Lewati untuk sekarang
                            </motion.button>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Hidden power hint at bottom */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2 }}
                    className="mt-8 text-center"
                >
                    <p className="text-zinc-700 text-xs flex items-center justify-center gap-1">
                        <Lightbulb className="w-3 h-3" />
                        Refleksi membuka jalur insight tersembunyi
                    </p>
                </motion.div>

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
