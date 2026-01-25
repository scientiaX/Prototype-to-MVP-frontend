import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, HelpCircle, Lock, ArrowRight, Check, X, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { INTERACTION_TYPES, VISUAL_STATES } from '../ArenaScreenManager';
import { cn } from "@/lib/utils";

/**
 * ActionScreen - Handles all interaction types
 * From Experience Layer: "Action screen" - 1 decision per screen
 * Interaction types from Arena Engine Spec
 */
export default function ActionScreen({
    problem,
    styles,
    tone,
    visualState,
    interactionType,
    currentQuestion,
    exchangeCount,
    onSubmit,
    onActivity,
    onRequestHint,
    options = [],
    taskInstruction = '',
    patchContent = ''
}) {
    const [input, setInput] = useState('');
    const [selectedOption, setSelectedOption] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [charCount, setCharCount] = useState(0);
    const inputRef = useRef(null);

    // Character limits - NO minimums (AI handles short responses by digging deeper)
    const charLimits = {
        [INTERACTION_TYPES.TEXT_COMMIT]: { min: 0, max: 500 },
        [INTERACTION_TYPES.PATCH]: { min: 0, max: 300 },
        [INTERACTION_TYPES.OPTION_SELECT]: { min: 0, max: 150 },
        [INTERACTION_TYPES.EXTENDED_REFLECTION]: { min: 0, max: 1000 }
    };

    const limits = charLimits[interactionType] || charLimits[INTERACTION_TYPES.TEXT_COMMIT];

    // Track activity on input change
    const handleInputChange = (e) => {
        const value = e.target.value;
        setInput(value);
        setCharCount(value.length);
        onActivity?.();
    };

    // Handle submit based on interaction type
    const handleSubmit = async () => {
        if (isSubmitting) return;

        // Validate based on type
        if (interactionType === INTERACTION_TYPES.OPTION_SELECT) {
            if (selectedOption === null) return;
            setIsSubmitting(true);
            await onSubmit({ type: interactionType, option: selectedOption, reason: input });
        } else if (interactionType === INTERACTION_TYPES.TASK_EXECUTE) {
            setIsSubmitting(true);
            await onSubmit({ type: interactionType, completed: true });
        } else {
            if (input.trim().length < limits.min) return;
            setIsSubmitting(true);
            await onSubmit({ type: interactionType, content: input.trim() });
        }

        setIsSubmitting(false);
        setInput('');
        setSelectedOption(null);
    };

    // Get submit button text based on state
    const getSubmitText = () => {
        if (isSubmitting) return <Loader2 className="w-4 h-4 animate-spin" />;

        switch (visualState) {
            case VISUAL_STATES.URGENT:
                return 'KUNCI SEKARANG';
            case VISUAL_STATES.CRITICAL:
                return 'FINAL';
            default:
                return 'Kunci Keputusan';
        }
    };

    // Render based on interaction type
    const renderInteraction = () => {
        switch (interactionType) {
            case INTERACTION_TYPES.OPTION_SELECT:
                return (
                    <div className="space-y-3">
                        {options.map((opt, i) => (
                            <motion.button
                                key={i}
                                onClick={() => {
                                    setSelectedOption(i);
                                    onActivity?.();
                                }}
                                className={cn(
                                    "w-full p-4 rounded-xl border text-left transition-all",
                                    selectedOption === i
                                        ? `${styles.border} bg-orange-500/10`
                                        : "border-zinc-800 hover:border-zinc-700"
                                )}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                                        selectedOption === i ? styles.border : "border-zinc-600"
                                    )}>
                                        {selectedOption === i && <Check className="w-4 h-4 text-orange-400" />}
                                    </div>
                                    <span className="text-white">{opt.text}</span>
                                </div>
                            </motion.button>
                        ))}

                        {/* Optional reason for choice */}
                        {selectedOption !== null && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mt-4"
                            >
                                <label className="text-zinc-500 text-xs mb-2 block">
                                    Alasan singkat (opsional, max 150 karakter)
                                </label>
                                <input
                                    type="text"
                                    value={input}
                                    onChange={handleInputChange}
                                    maxLength={150}
                                    placeholder="Kenapa memilih ini?"
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white"
                                />
                            </motion.div>
                        )}
                    </div>
                );

            case INTERACTION_TYPES.TASK_EXECUTE:
                return (
                    <motion.div
                        className="text-center py-12"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <div className={`text-6xl mb-6 ${styles.accent}`}>📋</div>
                        <h3 className="text-xl font-bold text-white mb-4">TASK</h3>
                        <p className="text-zinc-300 text-lg mb-8 max-w-md mx-auto">
                            {taskInstruction || "Selesaikan tugas ini sebelum melanjutkan."}
                        </p>
                        <Button
                            onClick={handleSubmit}
                            className={`${styles.button} px-8 py-4 text-lg font-bold`}
                        >
                            <Check className="w-5 h-5 mr-2" />
                            SELESAI TASK
                        </Button>
                    </motion.div>
                );

            case INTERACTION_TYPES.PATCH:
                return (
                    <div className="space-y-4">
                        {/* Original content (dimmed, non-editable) */}
                        <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800">
                            <p className="text-zinc-500 text-sm mb-2">Keputusan sebelumnya:</p>
                            <p className="text-zinc-400 line-through">{patchContent}</p>
                        </div>

                        {/* Editable area */}
                        <Textarea
                            ref={inputRef}
                            value={input}
                            onChange={handleInputChange}
                            placeholder="Revisi atau tambahan..."
                            className={cn(
                                "min-h-[120px] bg-zinc-950 text-white resize-none",
                                styles.border
                            )}
                            maxLength={limits.max}
                        />
                        <div className="flex justify-end text-xs text-zinc-500">
                            <span className={charCount > limits.max * 0.9 ? 'text-orange-400' : ''}>
                                {charCount}/{limits.max}
                            </span>
                        </div>
                    </div>
                );

            case INTERACTION_TYPES.EXTENDED_REFLECTION:
                return (
                    <div className="space-y-4">
                        <Textarea
                            ref={inputRef}
                            value={input}
                            onChange={handleInputChange}
                            placeholder="Jelaskan lebih detail..."
                            className={cn(
                                "min-h-[200px] bg-zinc-950 text-white resize-none",
                                styles.border
                            )}
                            maxLength={limits.max}
                        />
                        <div className="flex justify-end text-xs text-zinc-500">
                            <span className={charCount > limits.max * 0.9 ? 'text-orange-400' : ''}>
                                {charCount}/{limits.max}
                            </span>
                        </div>
                    </div>
                );

            // ==========================================
            // GAME-LIKE LOW-FRICTION INTERACTIONS
            // ==========================================

            case INTERACTION_TYPES.QUICK_CHOICE:
                // Quick emoji/icon buttons - instant tap, no typing
                const quickOptions = options.length > 0 ? options : [
                    { emoji: '👍', label: 'Setuju' },
                    { emoji: '🤔', label: 'Ragu' },
                    { emoji: '👎', label: 'Tidak' }
                ];
                return (
                    <div className="flex justify-center gap-6 py-8">
                        {quickOptions.map((opt, i) => (
                            <motion.button
                                key={i}
                                onClick={() => {
                                    setSelectedOption(i);
                                    onActivity?.();
                                    // Auto-submit on tap for quick choice
                                    setTimeout(() => {
                                        onSubmit({ type: interactionType, choice: opt.label || opt.emoji, index: i });
                                    }, 300);
                                }}
                                className={cn(
                                    "flex flex-col items-center gap-2 p-6 rounded-2xl border-2 transition-all",
                                    selectedOption === i
                                        ? "border-orange-500 bg-orange-500/20 scale-110"
                                        : "border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800/50"
                                )}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <span className="text-4xl">{opt.emoji}</span>
                                <span className="text-xs text-zinc-400">{opt.label}</span>
                            </motion.button>
                        ))}
                    </div>
                );

            case INTERACTION_TYPES.SPECTRUM:
                // Slider for tendency - swipe-like experience
                const [spectrumValue, setSpectrumValue] = useState(50);
                const spectrumLabels = options.length >= 2
                    ? { left: options[0], right: options[1] }
                    : { left: 'Tidak yakin', right: 'Sangat yakin' };
                return (
                    <div className="py-8 px-4">
                        <div className="flex justify-between text-sm text-zinc-400 mb-4">
                            <span>{spectrumLabels.left}</span>
                            <span>{spectrumLabels.right}</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={spectrumValue}
                            onChange={(e) => {
                                setSpectrumValue(parseInt(e.target.value));
                                onActivity?.();
                            }}
                            className="w-full h-3 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-orange-500"
                        />
                        <div className="text-center mt-4">
                            <span className={cn(
                                "text-2xl font-bold",
                                spectrumValue < 30 ? "text-red-400" :
                                    spectrumValue > 70 ? "text-green-400" : "text-orange-400"
                            )}>
                                {spectrumValue}%
                            </span>
                        </div>
                        <div className="flex justify-center mt-6">
                            <Button
                                onClick={() => onSubmit({ type: interactionType, value: spectrumValue })}
                                className={`${styles.button} px-8`}
                            >
                                Konfirmasi
                            </Button>
                        </div>
                    </div>
                );

            case INTERACTION_TYPES.CHIP_SELECT:
                // Tappable word chips - no typing needed
                const chips = options.length > 0 ? options : [
                    'Prioritas utama',
                    'Bisa ditunda',
                    'Risiko tinggi',
                    'Butuh data lagi',
                    'Siap eksekusi'
                ];
                const [selectedChips, setSelectedChips] = useState([]);
                return (
                    <div className="py-6">
                        <p className="text-zinc-500 text-sm mb-4 text-center">Pilih yang sesuai (bisa lebih dari 1)</p>
                        <div className="flex flex-wrap justify-center gap-3">
                            {chips.map((chip, i) => {
                                const chipText = typeof chip === 'string' ? chip : chip.text;
                                const isSelected = selectedChips.includes(i);
                                return (
                                    <motion.button
                                        key={i}
                                        onClick={() => {
                                            if (isSelected) {
                                                setSelectedChips(prev => prev.filter(x => x !== i));
                                            } else {
                                                setSelectedChips(prev => [...prev, i]);
                                            }
                                            onActivity?.();
                                        }}
                                        className={cn(
                                            "px-4 py-2 rounded-full border text-sm transition-all",
                                            isSelected
                                                ? "border-orange-500 bg-orange-500/20 text-orange-300"
                                                : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
                                        )}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        {chipText}
                                    </motion.button>
                                );
                            })}
                        </div>
                        {selectedChips.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex justify-center mt-6"
                            >
                                <Button
                                    onClick={() => {
                                        const selected = selectedChips.map(i =>
                                            typeof chips[i] === 'string' ? chips[i] : chips[i].text
                                        );
                                        onSubmit({ type: interactionType, chips: selected });
                                    }}
                                    className={`${styles.button} px-8`}
                                >
                                    Lanjut
                                </Button>
                            </motion.div>
                        )}
                    </div>
                );

            // Default: TEXT_COMMIT
            default:
                return (
                    <div className="space-y-4">
                        <Textarea
                            ref={inputRef}
                            value={input}
                            onChange={handleInputChange}
                            placeholder="Jawab di sini..."
                            className={cn(
                                "min-h-[140px] bg-zinc-950 text-white resize-none",
                                styles.border
                            )}
                            maxLength={limits.max}
                        />
                        <div className="flex justify-end text-xs text-zinc-500">
                            <span className={charCount > limits.max * 0.9 ? 'text-orange-400' : ''}>
                                {charCount}/{limits.max}
                            </span>
                        </div>
                    </div>
                );
        }
    };

    const isSubmitDisabled = () => {
        if (isSubmitting) return true;
        if (interactionType === INTERACTION_TYPES.OPTION_SELECT) return selectedOption === null;
        if (interactionType === INTERACTION_TYPES.TASK_EXECUTE) return false;
        return input.trim().length < limits.min;
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className={`min-h-screen p-6 ${styles.container}`}
        >
            <div className="max-w-2xl mx-auto">
                {/* Exchange counter */}
                <div className="flex items-center justify-between mb-6">
                    <div className="text-zinc-600 text-sm">
                        Exchange #{exchangeCount + 1}
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onRequestHint}
                        className="text-zinc-500 hover:text-blue-400"
                    >
                        <HelpCircle className="w-4 h-4 mr-1" />
                        Hint
                    </Button>
                </div>

                {/* AI Question/Prompt */}
                <motion.div
                    key={currentQuestion}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                        "rounded-xl p-5 mb-6 border-2",
                        styles.border,
                        visualState === VISUAL_STATES.CRITICAL ? 'bg-red-500/10' : 'bg-zinc-900/50'
                    )}
                >
                    <p className={`text-sm font-medium mb-2 ${styles.accent}`}>
                        {tone.style === 'reflective' ? '💬' :
                            tone.style === 'direct' ? '🎯' :
                                tone.style === 'short' ? '⚡' : '🔥'} MENTOR
                    </p>
                    <p className="text-white text-lg leading-relaxed italic">
                        "{currentQuestion}"
                    </p>
                </motion.div>

                {/* Interaction Area */}
                {renderInteraction()}

                {/* Submit Button */}
                {interactionType !== INTERACTION_TYPES.TASK_EXECUTE && (
                    <motion.div className="mt-6">
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitDisabled()}
                            className={cn(
                                "w-full py-4 text-lg font-bold rounded-xl flex items-center justify-center gap-2",
                                styles.button,
                                isSubmitDisabled() && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            <Lock className="w-5 h-5" />
                            {getSubmitText()}
                        </Button>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}
