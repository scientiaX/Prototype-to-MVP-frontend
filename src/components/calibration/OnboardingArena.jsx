import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Zap, ArrowRight, ChevronLeft, Sparkles } from 'lucide-react';
import apiClient from '@/api/apiClient';

/**
 * OnboardingArena - Arena PBL untuk onboarding
 * 
 * Flow:
 * 1. Problem Mikro (20 detik baca)
 * 2. Decision (3 pilihan)
 * 3. Consequence Mikro
 * 4. Insight Mikro
 * 5. Dopamine Loop (XP + progress)
 * 6. Bridge ke Arena Harian
 */

export default function OnboardingArena({
    domain,
    ageGroup,
    language,
    onComplete,
    onBack
}) {
    // Steps: loading -> situation -> choice -> lock -> consequence -> insight -> complete
    const [step, setStep] = useState('loading');
    const [problem, setProblem] = useState(null);
    const [choices, setChoices] = useState([]);
    const [selectedChoice, setSelectedChoice] = useState(null);
    const [consequence, setConsequence] = useState('');
    const [insight, setInsight] = useState('');
    const [xpEarned, setXpEarned] = useState(0);
    const [decisions, setDecisions] = useState([]);
    const [decisionStartTime, setDecisionStartTime] = useState(null);
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState(null);
    const [canChangeChoice, setCanChangeChoice] = useState(true);
    const autoAdvanceRef = useRef(null);
    const decisionsRef = useRef([]);

    // Load problem on mount
    useEffect(() => {
        loadProblem();
    }, [domain, ageGroup, language]);

    const loadProblem = async () => {
        try {
            setStep('loading');
            setError(null);
            setSelectedChoice(null);
            setConsequence('');
            setInsight('');
            setDecisions([]);
            decisionsRef.current = [];
            setDecisionStartTime(null);
            setCanChangeChoice(true);

            const result = await apiClient.api.onboardingArena.generateProblem(
                domain,
                language,
                ageGroup,
                false // Use curated pool, not AI
            );

            setProblem(result.problem);
            setChoices(result.choices);
            setStep('situation');
        } catch (err) {
            console.error('Failed to load problem:', err);
            setError(language === 'en'
                ? 'Failed to load problem. Please try again.'
                : 'Gagal memuat masalah. Silakan coba lagi.');
            setStep('error');
        }
    };

    const clearAutoAdvance = useCallback(() => {
        if (autoAdvanceRef.current) {
            clearTimeout(autoAdvanceRef.current);
            autoAdvanceRef.current = null;
        }
    }, []);

    const advanceToChoice = useCallback(() => {
        clearAutoAdvance();
        setStep('choice');
        setDecisionStartTime(Date.now());
    }, [clearAutoAdvance]);

    useEffect(() => {
        clearAutoAdvance();
        if (step === 'situation') {
            autoAdvanceRef.current = setTimeout(() => {
                advanceToChoice();
            }, 2500);
        }
        if (step === 'consequence') {
            autoAdvanceRef.current = setTimeout(() => {
                setStep('insight');
            }, 1200);
        }
        if (step === 'insight') {
            autoAdvanceRef.current = setTimeout(() => {
                handleComplete();
            }, 1200);
        }
        return () => clearAutoAdvance();
    }, [step, clearAutoAdvance, advanceToChoice]);

    const handleChoiceSelect = (choice) => {
        setSelectedChoice(choice);
        setStep('lock');
    };

    const handleLockChoice = async () => {
        try {
            if (!selectedChoice) return;

            // Calculate time to decide
            const timeToDecide = Date.now() - decisionStartTime;

            // Record decision
            const decision = {
                problem_id: problem.id,
                choice_id: selectedChoice.id,
                archetype_signal: selectedChoice.archetype_signal,
                time_to_decide: timeToDecide
            };

            setDecisions(prev => {
                const next = [...prev, decision];
                decisionsRef.current = next;
                return next;
            });

            // Get consequence
            const result = await apiClient.api.onboardingArena.getConsequence(
                selectedChoice.id,
                selectedChoice.archetype_signal,
                language
            );

            setConsequence(result.consequence);
            setInsight(result.insight);
            setStep('consequence');
        } catch (err) {
            console.error('Failed to get consequence:', err);
            // Continue anyway with fallback
            setConsequence(language === 'en'
                ? 'Your choice has been noted.'
                : 'Pilihanmu sudah dicatat.');
            setStep('consequence');
        }
    };

    const handleComplete = async () => {
        try {
            setStep('completing');

            // Complete onboarding and calibrate
            const result = await apiClient.api.onboardingArena.complete(
                domain,
                language,
                ageGroup,
                decisionsRef.current
            );

            setProfile(result.profile);
            setXpEarned(result.xp_earned || 5);
            setStep('complete');

        } catch (err) {
            console.error('Failed to complete onboarding:', err);
            // Still move to complete step
            setXpEarned(5);
            setStep('complete');
        }
    };

    const handleEnterArena = () => {
        onComplete(profile);
    };

    // Translation helper
    const t = (id, en) => language === 'en' ? en : id;

    return (
        <div className="w-full max-w-2xl mx-auto relative z-10">
            <AnimatePresence mode="wait">
                {/* LOADING */}
                {step === 'loading' && (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center py-20"
                    >
                        <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mb-6">
                            <Loader2 className="w-8 h-8 text-white animate-spin" />
                        </div>
                        <p className="text-zinc-400">
                            {t('Menyiapkan tantangan...', 'Preparing challenge...')}
                        </p>
                    </motion.div>
                )}

                {/* ERROR */}
                {step === 'error' && (
                    <motion.div
                        key="error"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="text-center py-20"
                    >
                        <p className="text-red-400 mb-6">{error}</p>
                        <button
                            onClick={loadProblem}
                            className="px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors"
                        >
                            {t('Coba Lagi', 'Try Again')}
                        </button>
                    </motion.div>
                )}

                {/* SITUATION */}
                {step === 'situation' && problem && (
                    <motion.div
                        key="situation"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -30 }}
                        className="space-y-6"
                    >
                        {/* Back button */}
                        <button
                            onClick={onBack}
                            className="flex items-center gap-1 text-zinc-500 hover:text-orange-400 transition-colors text-sm font-medium"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            {t('Kembali', 'Back')}
                        </button>

                        <button
                            type="button"
                            onClick={advanceToChoice}
                            className="w-full text-left"
                        >
                            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6">
                            {/* Role badge */}
                            <div className="flex items-center gap-2 mb-4">
                                <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm font-medium">
                                    {problem.role}
                                </span>
                                <span className="text-zinc-500 text-sm">•</span>
                                <span className="text-zinc-500 text-sm">
                                    {t('Arena Pembukaan', 'Opening Arena')}
                                </span>
                            </div>

                            {/* Title */}
                            <h2 className="text-2xl font-bold text-white mb-4">
                                {problem.title}
                            </h2>

                            {/* Context */}
                            <p className="text-zinc-300 leading-relaxed mb-4">
                                {problem.context}
                            </p>

                            {/* Objective */}
                            <div className="bg-zinc-800/50 rounded-xl p-4">
                                <p className="text-orange-400 font-medium">
                                    {problem.objective}
                                </p>
                            </div>
                            </div>
                        </button>

                        <div className="max-w-xs mx-auto">
                            <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-orange-500 to-red-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: '100%' }}
                                    transition={{ duration: 2.5 }}
                                />
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* CHOICE */}
                {step === 'choice' && problem && (
                    <motion.div
                        key="choice"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -30 }}
                        className="space-y-6"
                    >
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-white mb-2">
                                {t('Pilih cepat.', 'Pick fast.')}
                            </h2>
                            <p className="text-zinc-500">
                                {t('Tidak ada yang sempurna. Yang penting: commit.', 'No perfect choice. Just commit.')}
                            </p>
                        </div>

                        <div className="space-y-3">
                            {choices.map((choice, idx) => (
                                <motion.button
                                    key={choice.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.07 }}
                                    whileHover={{ scale: 1.02, x: 8 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleChoiceSelect(choice)}
                                    className="w-full group bg-zinc-900/80 border border-zinc-800 hover:border-orange-500/50 rounded-xl p-5 text-left transition-all flex items-center gap-4"
                                >
                                    <div className="text-3xl">{choice.icon}</div>
                                    <div className="flex-1">
                                        <p className="text-white font-medium group-hover:text-orange-400 transition-colors">
                                            {choice.text}
                                        </p>
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-zinc-600 group-hover:text-orange-400 transition-colors" />
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* LOCK */}
                {step === 'lock' && selectedChoice && (
                    <motion.div
                        key="lock"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -30 }}
                        className="space-y-6"
                    >
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-white mb-2">
                                {t('Kunci pilihan.', 'Lock it in.')}
                            </h2>
                            <p className="text-zinc-500">
                                {t('Sekali kunci, lanjut.', 'Once locked, we move.')}
                            </p>
                        </div>

                        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 flex items-center gap-4">
                            <div className="text-4xl">{selectedChoice.icon}</div>
                            <div className="flex-1">
                                <p className="text-white font-semibold">{selectedChoice.text}</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleLockChoice}
                                className="w-full px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl shadow-lg shadow-orange-500/30"
                            >
                                {t('KUNCI PILIHAN', 'LOCK CHOICE')}
                            </motion.button>

                            {canChangeChoice && (
                                <button
                                    onClick={() => {
                                        setCanChangeChoice(false);
                                        setSelectedChoice(null);
                                        setStep('choice');
                                    }}
                                    className="w-full px-8 py-3 bg-zinc-900/60 border border-zinc-800 text-zinc-300 font-semibold rounded-xl hover:border-zinc-700 transition-colors"
                                >
                                    {t('Ubah sekali', 'Change once')}
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* CONSEQUENCE */}
                {step === 'consequence' && (
                    <motion.div
                        key="consequence"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="text-center py-16"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", duration: 0.5 }}
                            className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-8"
                        >
                            <Zap className="w-10 h-10 text-white" />
                        </motion.div>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-xl text-zinc-300 max-w-md mx-auto"
                        >
                            {consequence}
                        </motion.p>

                        {/* Loading indicator for next step */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1 }}
                            className="mt-8"
                        >
                            <div className="w-32 h-1 bg-zinc-800 rounded-full mx-auto overflow-hidden">
                                <motion.div
                                    className="h-full bg-orange-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: '100%' }}
                                    transition={{ duration: 2 }}
                                />
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* INSIGHT */}
                {step === 'insight' && (
                    <motion.div
                        key="insight"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -30 }}
                        className="text-center py-12"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", duration: 0.5 }}
                            className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-8"
                        >
                            <Sparkles className="w-8 h-8 text-white" />
                        </motion.div>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-lg text-zinc-300 max-w-lg mx-auto mb-2"
                        >
                            {insight}
                        </motion.p>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="text-zinc-500 text-sm mb-8"
                        >
                            {t('— Insight dari pilihanmu', '— Insight from your choice')}
                        </motion.p>

                        <motion.button
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.9 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleComplete}
                            className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl shadow-lg shadow-orange-500/30"
                        >
                            {t('Selesai', 'Finish')}
                        </motion.button>
                    </motion.div>
                )}

                {/* COMPLETING */}
                {step === 'completing' && (
                    <motion.div
                        key="completing"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center py-20"
                    >
                        <Loader2 className="w-10 h-10 text-orange-500 animate-spin mb-6" />
                        <p className="text-zinc-400">
                            {t('Mengkalibrasi profil...', 'Calibrating profile...')}
                        </p>
                    </motion.div>
                )}

                {/* COMPLETE - Bridge */}
                {step === 'complete' && (
                    <motion.div
                        key="complete"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center py-12"
                    >
                        {/* XP earned */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", duration: 0.8 }}
                            className="mb-8"
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-full text-lg font-bold">
                                <Zap className="w-5 h-5" />
                                +{xpEarned} XP
                            </div>
                        </motion.div>

                        {/* Message */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="mb-8"
                        >
                            <h2 className="text-2xl font-bold text-white mb-2">
                                {t('Arena pembukaan selesai.', 'Opening arena complete.')}
                            </h2>
                            <p className="text-zinc-400">
                                {t('Arena 5 menit siap. Masuk kapan saja.', 'The 5-minute arena is ready. Enter anytime.')}
                            </p>
                        </motion.div>

                        {profile?.total_arenas_completed !== undefined && profile?.total_arenas_completed !== null && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.35 }}
                                className="text-zinc-500 text-sm mb-8"
                            >
                                {t(`Total arena selesai: ${profile.total_arenas_completed}`, `Total arenas completed: ${profile.total_arenas_completed}`)}
                            </motion.p>
                        )}

                        {/* Progress bar (thin, neutral) */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="max-w-xs mx-auto mb-8"
                        >
                            <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-orange-500 to-red-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: '100%' }}
                                    transition={{ duration: 1, delay: 0.5 }}
                                />
                            </div>
                        </motion.div>

                        {/* Enter Arena button */}
                        <motion.button
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleEnterArena}
                            className="px-10 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-lg rounded-xl shadow-lg shadow-orange-500/30"
                        >
                            {t('Masuk Arena', 'Enter Arena')}
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
