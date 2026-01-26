import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, HelpCircle, Lock, ArrowRight, Check, X, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
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
    const [spectrumValue, setSpectrumValue] = useState(50);
    const [selectedChips, setSelectedChips] = useState([]);
    const inputRef = useRef(null);

    // Character limits - NO minimums (AI handles short responses by digging deeper)
    const charLimits = {
        [INTERACTION_TYPES.TEXT_COMMIT]: { min: 0, max: 500 },
        [INTERACTION_TYPES.PATCH]: { min: 0, max: 300 },
        [INTERACTION_TYPES.OPTION_SELECT]: { min: 0, max: 150 },
        [INTERACTION_TYPES.EXTENDED_REFLECTION]: { min: 0, max: 1000 }
    };

    const limits = charLimits[interactionType] || charLimits[INTERACTION_TYPES.TEXT_COMMIT];

    useEffect(() => {
        setSpectrumValue(50);
        setSelectedChips([]);
    }, [interactionType]);

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
                                    "w-full p-4 nx-sharp border-[3px] border-[var(--ink)] bg-[var(--paper)] shadow-[6px_6px_0_var(--ink)] text-left transition-all duration-100 [transition-timing-function:steps(4,end)] hover:translate-x-[-2px] hover:translate-y-[-2px]",
                                    selectedOption === i
                                        ? "bg-[var(--paper-2)]"
                                        : ""
                                )}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "w-6 h-6 nx-sharp border-[2px] border-[var(--ink)] flex items-center justify-center",
                                        selectedOption === i ? "bg-[var(--acid-orange)]" : "bg-[var(--paper-2)]"
                                    )}>
                                        {selectedOption === i && <Check className="w-4 h-4 text-[var(--ink)]" />}
                                    </div>
                                    <span className="text-[var(--ink)]">{opt.text}</span>
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
                                <label className="text-[var(--ink-2)] text-xs mb-2 block">
                                    Alasan singkat (opsional, max 150 karakter)
                                </label>
                                <Input
                                    value={input}
                                    onChange={handleInputChange}
                                    maxLength={150}
                                    placeholder="Kenapa memilih ini?"
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
                        <h3 className="text-xl font-bold text-[var(--ink)] mb-4">TASK</h3>
                        <p className="text-[var(--ink-2)] text-lg mb-8 max-w-md mx-auto">
                            {taskInstruction || "Selesaikan tugas ini sebelum melanjutkan."}
                        </p>
                        <Button
                            onClick={handleSubmit}
                            variant="gradient"
                            className="px-8 py-4 text-lg font-bold nx-sharp"
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
                        <div className="nx-panel-static nx-sharp p-4">
                            <p className="text-[var(--ink-2)] text-sm mb-2">Keputusan sebelumnya:</p>
                            <p className="text-[var(--ink-2)] line-through">{patchContent}</p>
                        </div>

                        {/* Editable area */}
                        <Textarea
                            ref={inputRef}
                            value={input}
                            onChange={handleInputChange}
                            placeholder="Revisi atau tambahan..."
                            className={cn(
                                "min-h-[120px] resize-none"
                            )}
                            maxLength={limits.max}
                        />
                        <div className="flex justify-end text-xs text-[var(--ink-2)]">
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
                                "min-h-[200px] resize-none"
                            )}
                            maxLength={limits.max}
                        />
                        <div className="flex justify-end text-xs text-[var(--ink-2)]">
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
                                    "flex flex-col items-center gap-2 p-6 nx-sharp border-[3px] border-[var(--ink)] shadow-[6px_6px_0_var(--ink)] transition-all duration-100 [transition-timing-function:steps(4,end)] hover:translate-x-[-2px] hover:translate-y-[-2px]",
                                    selectedOption === i
                                        ? "bg-[var(--acid-orange)]"
                                        : "bg-[var(--paper)] hover:bg-[var(--paper-2)]"
                                )}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <span className="text-4xl">{opt.emoji}</span>
                                <span className="text-xs text-[var(--ink-2)]">{opt.label}</span>
                            </motion.button>
                        ))}
                    </div>
                );

            case INTERACTION_TYPES.SPECTRUM:
                // Slider for tendency - swipe-like experience
                const spectrumLabels = options.length >= 2
                    ? { left: options[0], right: options[1] }
                    : { left: 'Tidak yakin', right: 'Sangat yakin' };
                return (
                    <div className="py-8 px-4">
                        <div className="flex justify-between text-sm text-[var(--ink-2)] mb-4">
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
                            className="w-full h-3 bg-[var(--wire-2)] nx-sharp appearance-none cursor-pointer accent-[var(--acid-orange)]"
                        />
                        <div className="text-center mt-4">
                            <span className={cn(
                                "text-2xl font-bold",
                                spectrumValue < 30 ? "text-[var(--acid-magenta)]" :
                                    spectrumValue > 70 ? "text-[var(--acid-lime)]" : "text-[var(--acid-orange)]"
                            )}>
                                {spectrumValue}%
                            </span>
                        </div>
                        <div className="flex justify-center mt-6">
                            <Button
                                onClick={() => onSubmit({ type: interactionType, value: spectrumValue })}
                                variant="gradient"
                                className="px-8 nx-sharp"
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
                return (
                    <div className="py-6">
                        <p className="text-[var(--ink-2)] text-sm mb-4 text-center">Pilih yang sesuai (bisa lebih dari 1)</p>
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
                                            "px-4 py-2 nx-sharp border-[2px] border-[var(--ink)] text-sm transition-all duration-100 [transition-timing-function:steps(4,end)]",
                                            isSelected
                                                ? "bg-[var(--acid-orange)] text-[var(--ink)]"
                                                : "bg-[var(--paper)] text-[var(--ink)] hover:bg-[var(--paper-2)]"
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
                                    variant="gradient"
                                    className="px-8 nx-sharp"
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
                                "min-h-[140px] resize-none"
                            )}
                            maxLength={limits.max}
                        />
                        <div className="flex justify-end text-xs text-[var(--ink-2)]">
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
                    <div className="text-[var(--ink-2)] text-sm">
                        Exchange #{exchangeCount + 1}
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onRequestHint}
                        className="text-[var(--ink-2)] hover:text-[var(--acid-cyan)]"
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
                        "nx-panel nx-sharp p-5 mb-6",
                        visualState === VISUAL_STATES.CRITICAL ? "bg-[var(--acid-yellow)]" : ""
                    )}
                >
                    <p className={`text-sm font-medium mb-2 ${styles.accent}`}>
                        {tone.style === 'reflective' ? '💬' :
                            tone.style === 'direct' ? '🎯' :
                                tone.style === 'short' ? '⚡' : '🔥'} MENTOR
                    </p>
                    <p className="text-[var(--ink)] text-lg leading-relaxed italic">
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
                                "w-full py-4 text-lg font-bold nx-sharp flex items-center justify-center gap-2",
                                isSubmitDisabled() && "opacity-50 cursor-not-allowed"
                            )}
                            variant={
                                visualState === VISUAL_STATES.CRITICAL || visualState === VISUAL_STATES.URGENT
                                    ? "danger"
                                    : visualState === VISUAL_STATES.FOCUSED
                                        ? "gradient"
                                        : "default"
                            }
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
