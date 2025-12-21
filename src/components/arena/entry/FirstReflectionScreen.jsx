import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * FirstReflectionScreen - Screen 6 (120-180s)
 * Purpose: Refleksi ringan – pertama kalinya mengetik
 * - Pertanyaan spesifik tentang pilihan tadi
 * - Jawaban pendek (20-150 karakter)
 * - First typing moment
 */
export default function FirstReflectionScreen({
    selectedChoice,
    reflectionQuestion,
    onSubmit,
    timeRemaining
}) {
    const [text, setText] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    const minChars = 20;
    const maxChars = 150;

    const isValid = text.length >= minChars && text.length <= maxChars;

    const handleSubmit = () => {
        if (isValid) {
            onSubmit(text);
        }
    };

    // Default question if none provided
    const question = reflectionQuestion || `Kenapa kamu memilih "${selectedChoice?.text}" daripada opsi lain?`;

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
                        <span className="text-violet-400 font-semibold text-sm uppercase tracking-wider">Refleksi Singkat</span>
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

                {/* Input area - First typing moment */}
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
                            placeholder="Tulis jawaban singkatmu..."
                            rows={4}
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

                    {/* Hint text */}
                    <p className="text-zinc-600 text-xs mt-2 text-center">
                        Min {minChars} karakter • Max {maxChars} karakter
                    </p>
                </motion.div>

                {/* Submit button */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                >
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
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </motion.div>

                {/* Encouragement for short text */}
                {text.length > 0 && text.length < minChars && (
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center text-zinc-500 text-sm mt-4"
                    >
                        Tambahkan {minChars - text.length} karakter lagi...
                    </motion.p>
                )}

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
