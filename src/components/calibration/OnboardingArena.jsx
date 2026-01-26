import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Zap, ArrowRight, ChevronLeft, Sparkles } from 'lucide-react';
import apiClient from '@/api/apiClient';

const DOMAIN_ROLE_POOL = {
    tech: ['developer', 'tech_lead', 'engineer'],
    business: ['founder', 'entrepreneur', 'operator'],
    creative: ['content_creator', 'designer', 'creator'],
    finance: ['investor', 'analyst', 'planner'],
    gaming: ['esports_player', 'team_captain', 'strategist'],
    social: ['community_builder', 'moderator', 'organizer'],
    science: ['researcher', 'lab_lead', 'analyst'],
    leadership: ['team_lead', 'manager', 'lead'],
    product: ['product_manager', 'pm', 'builder'],
    explore: ['learner', 'generalist', 'explorer']
};

const ARCHETYPE_CHOICES = {
    id: {
        risk_taker: { id: 'rt', icon: '🔥', text: 'Gas dulu. Ambil langkah berani sekarang.' },
        analyst: { id: 'an', icon: '🧠', text: 'Kumpulkan 1 data cepat sebelum jalan.' },
        builder: { id: 'bu', icon: '🔧', text: 'Eksekusi versi kecil (draft) dalam 10 menit.' },
        strategist: { id: 'st', icon: '🧭', text: 'Pilih langkah yang aman buat next 24 jam.' }
    },
    en: {
        risk_taker: { id: 'rt', icon: '🔥', text: 'Go now. Take the bold move.' },
        analyst: { id: 'an', icon: '🧠', text: 'Get one quick data point first.' },
        builder: { id: 'bu', icon: '🔧', text: 'Execute a tiny draft in 10 minutes.' },
        strategist: { id: 'st', icon: '🧭', text: 'Choose the move that protects the next 24h.' }
    }
};

const MICRO_SITUATIONS = {
    tech: {
        id: [
            { title: 'Demo 30 menit lagi', context: 'Ada bug kecil muncul tepat sebelum demo. Kalau di-fix sekarang, ada risiko bikin bug baru.' },
            { title: 'PR numpuk', context: 'Ada 5 PR menunggu review. Satu di antaranya kemungkinan bikin crash.' },
            { title: 'Incident kecil', context: 'User complain: fitur A kadang freeze 3 detik. Belum jelas root cause.' }
        ],
        en: [
            { title: 'Demo in 30 minutes', context: 'A small bug shows up right before a demo. Fixing now may introduce a new bug.' },
            { title: 'PR backlog', context: 'Five PRs are waiting. One of them might cause a crash.' },
            { title: 'Minor incident', context: 'Users report feature A sometimes freezes for 3 seconds. Root cause is unclear.' }
        ]
    },
    business: {
        id: [
            { title: '3 calon user', context: 'Kamu dapat 3 calon user hari ini. Waktumu cuma cukup untuk follow-up 1.' },
            { title: 'Harga dipertanyakan', context: 'Calon pembeli bilang harga kamu terlalu mahal, tapi mereka tertarik.' },
            { title: 'Partner ngajak cepat', context: 'Ada partner potensial minta keputusan dalam 24 jam.' }
        ],
        en: [
            { title: '3 potential users', context: 'You got 3 potential users today. You only have time to follow up with 1.' },
            { title: 'Pricing pushback', context: 'A prospect says your price is too high, but they are interested.' },
            { title: 'Partner wants fast', context: 'A potential partner wants an answer within 24 hours.' }
        ]
    },
    creative: {
        id: [
            { title: 'Brief dadakan', context: 'Ada ide konten mendadak. Kalau dibuat cepat, bisa ikut tren hari ini.' },
            { title: 'Revisi dari klien', context: 'Klien minta revisi besar. Deadline tetap.' },
            { title: 'Kualitas vs kuantitas', context: 'Kamu bisa rilis 2 konten biasa atau 1 konten yang kamu banggakan.' }
        ],
        en: [
            { title: 'Last-minute brief', context: 'A new content idea appears. If you move fast, you can ride today’s trend.' },
            { title: 'Client revision', context: 'Client asks for a big revision. Deadline stays.' },
            { title: 'Quality vs quantity', context: 'You can release 2 average pieces or 1 piece you’re proud of.' }
        ]
    }
};

function pickLanguage(language) {
    return language === 'en' ? 'en' : 'id';
}

function pickFrom(list, seed) {
    if (!list || list.length === 0) return null;
    const idx = Math.abs(seed) % list.length;
    return list[idx];
}

function summarizePattern(decisions = []) {
    const counts = { risk_taker: 0, analyst: 0, builder: 0, strategist: 0 };
    for (const d of decisions) {
        if (d?.archetype_signal && counts[d.archetype_signal] !== undefined) counts[d.archetype_signal] += 1;
    }
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const [top, topCount] = sorted[0];
    const [second, secondCount] = sorted[1];
    return { top, topCount, second, secondCount, counts };
}

function generateMicroProblem({ domain, language, roundIndex, decisions }) {
    const lang = pickLanguage(language);
    const safeDomain = DOMAIN_ROLE_POOL[domain] ? domain : 'business';
    const rolePool = DOMAIN_ROLE_POOL[safeDomain] || DOMAIN_ROLE_POOL.business;
    const role = pickFrom(rolePool, roundIndex + (decisions?.length || 0)) || 'builder';

    const situationPool = MICRO_SITUATIONS[safeDomain]?.[lang] || MICRO_SITUATIONS.business[lang];
    const base = pickFrom(situationPool, roundIndex * 7 + (decisions?.length || 0)) || situationPool[0];

    const last = decisions?.[decisions.length - 1] || null;
    const lastSignal = last?.archetype_signal || null;
    const lastText = lang === 'en'
        ? 'Based on your last move, a new constraint appears.'
        : 'Dari langkahmu barusan, ada constraint baru muncul.';

    const context = lastSignal
        ? `${base.context} ${lastText}`
        : base.context;

    const objective = lang === 'en'
        ? 'Pick your next move (fast).'
        : 'Pilih langkah berikutnya (cepat).';

    const pattern = summarizePattern(decisions);
    const preferred = pattern.topCount > 0 ? pattern.top : null;
    const order = preferred === 'analyst'
        ? ['analyst', 'strategist', 'builder', 'risk_taker']
        : preferred === 'risk_taker'
            ? ['risk_taker', 'builder', 'strategist', 'analyst']
            : preferred === 'builder'
                ? ['builder', 'risk_taker', 'analyst', 'strategist']
                : ['strategist', 'analyst', 'builder', 'risk_taker'];

    const pick3 = [order[0], order[1], order[2]];
    const choices = pick3.map(signal => ({
        ...ARCHETYPE_CHOICES[lang][signal],
        archetype_signal: signal
    }));

    return {
        problem: {
            id: `onboard_${safeDomain}_${roundIndex}_${Date.now()}`,
            title: base.title,
            context,
            objective,
            role
        },
        choices
    };
}

function generateFeedback({ language, decisions, choice }) {
    const lang = pickLanguage(language);
    const pattern = summarizePattern(decisions);
    const quick = decisions.length > 0 && Number(decisions[decisions.length - 1]?.time_to_decide || 0) > 0
        ? Number(decisions[decisions.length - 1].time_to_decide) < 6000
        : false;

    const consequenceMap = {
        id: {
            risk_taker: quick ? 'Cepat dan berani. Ada risiko, tapi momentum kepake.' : 'Berani. Kamu terima ketidakpastian untuk maju.',
            analyst: quick ? 'Analisis singkat. Cukup buat langkah berikutnya.' : 'Kamu cari kepastian dulu. Lebih aman, tapi waktu jalan.',
            builder: quick ? 'Eksekusi kecil dulu. Ada hasil yang bisa dipakai.' : 'Kamu bikin versi kecil. Progress nyata, walau belum sempurna.',
            strategist: quick ? 'Langkah aman buat besok. Kamu jaga opsi tetap terbuka.' : 'Kamu pilih yang menjaga opsi. Stabil, minim drama.'
        },
        en: {
            risk_taker: quick ? 'Fast and bold. Risky, but you keep momentum.' : 'Bold. You accept uncertainty to move.',
            analyst: quick ? 'A quick check. Enough to take the next step.' : 'You seek certainty first. Safer, but time passes.',
            builder: quick ? 'Small execution first. You get something usable.' : 'You build a tiny version. Real progress, not perfect.',
            strategist: quick ? 'A safe move for tomorrow. Options stay open.' : 'You protect options. Stable, low drama.'
        }
    };

    const topLabel = lang === 'en'
        ? ({ risk_taker: 'bold', analyst: 'careful', builder: 'execution', strategist: 'long-term' }[pattern.top] || 'balanced')
        : ({ risk_taker: 'berani', analyst: 'teliti', builder: 'eksekusi', strategist: 'long-term' }[pattern.top] || 'seimbang');

    const insight = lang === 'en'
        ? `So far you lean ${topLabel}. Keep it, but don’t overuse it.`
        : `Sejauh ini kamu condong ke gaya ${topLabel}. Bagus, asal jangan kebablasan.`;

    return {
        consequence: consequenceMap[lang][choice.archetype_signal] || (lang === 'en' ? 'Noted.' : 'Dicatat.'),
        insight
    };
}

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
    const [firstTapAt, setFirstTapAt] = useState(null);
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState(null);
    const [canChangeChoice, setCanChangeChoice] = useState(true);
    const [changeOfMindCount, setChangeOfMindCount] = useState(0);
    const decisionsRef = useRef([]);
    const profileRef = useRef(null);
    const [roundIndex, setRoundIndex] = useState(0);
    const totalRoundsRef = useRef(8);
    const [totalRounds, setTotalRounds] = useState(8);
    const onboardingSessionIdRef = useRef(null);
    const [adaptiveTimeouts, setAdaptiveTimeouts] = useState(null);
    const [nudgeMessage, setNudgeMessage] = useState('');
    const [simplifyPrompt, setSimplifyPrompt] = useState(null);
    const pollingRef = useRef(null);
    const nudgeHideRef = useRef(null);

    // Load problem on mount
    useEffect(() => {
        loadProblem({ resetAll: true });
    }, [domain, ageGroup, language]);

    const loadProblem = async ({ resetAll = false, roundIndexOverride = null } = {}) => {
        try {
            setStep('loading');
            setError(null);
            setSelectedChoice(null);
            setConsequence('');
            setInsight('');
            setDecisionStartTime(null);
            setFirstTapAt(null);
            setChangeOfMindCount(0);
            setNudgeMessage('');
            setSimplifyPrompt(null);

            if (resetAll) {
                const nextTotal = 6 + Math.floor(Math.random() * 4);
                totalRoundsRef.current = nextTotal;
                setTotalRounds(nextTotal);
                setDecisions([]);
                decisionsRef.current = [];
                setProfile(null);
                setXpEarned(0);
                setRoundIndex(0);
                onboardingSessionIdRef.current = null;
                setAdaptiveTimeouts(null);
            }

            const lang = pickLanguage(language);
            const effectiveRoundIndex = resetAll ? 0 : (roundIndexOverride ?? roundIndex);
            setCanChangeChoice(effectiveRoundIndex === 0);
            const last = decisionsRef.current?.[decisionsRef.current.length - 1] || null;
            const lastText = lang === 'en'
                ? 'Based on your last move, a new constraint appears.'
                : 'Dari langkahmu barusan, ada constraint baru muncul.';

            let generated = null;
            try {
                const ai = await apiClient.api.onboardingArena.generateProblem(
                    domain,
                    language,
                    ageGroup,
                    true
                );

                const aiChoicesRaw = Array.isArray(ai?.choices) ? ai.choices : [];
                if (ai?.problem && aiChoicesRaw.length >= 2) {
                    const mergedContext = last?.archetype_signal
                        ? `${ai.problem.context} ${lastText}`
                        : ai.problem.context;

                    const normalizedChoices = aiChoicesRaw.slice(0, 3).map((c, idx) => {
                        const signal = c?.archetype_signal || ['risk_taker', 'analyst', 'builder', 'strategist'][idx] || 'strategist';
                        const fallback = ARCHETYPE_CHOICES[lang][signal] || ARCHETYPE_CHOICES[lang].strategist;
                        return {
                            id: String(c?.id || fallback.id),
                            text: c?.text || fallback.text,
                            icon: c?.icon || fallback.icon,
                            archetype_signal: signal
                        };
                    });

                    generated = {
                        problem: {
                            id: String(ai.problem.id || `onboard_${domain}_${effectiveRoundIndex}_${Date.now()}`),
                            title: ai.problem.title,
                            context: mergedContext,
                            objective: ai.problem.objective || (lang === 'en' ? 'Pick your next move (fast).' : 'Pilih langkah berikutnya (cepat).'),
                            role: ai.problem.role || 'learner'
                        },
                        choices: normalizedChoices
                    };
                }
            } catch (e) {
                generated = null;
            }

            if (!generated) {
                generated = generateMicroProblem({
                    domain,
                    language,
                    roundIndex: effectiveRoundIndex,
                    decisions: decisionsRef.current
                });
            }

            if (resetAll || !onboardingSessionIdRef.current) {
                try {
                    const init = await apiClient.api.onboardingArena.initSession(domain, language, ageGroup, {
                        problem_id: generated.problem.id,
                        title: generated.problem.title,
                        context: generated.problem.context,
                        objective: generated.problem.objective,
                        difficulty: 3,
                        role_label: generated.problem.role
                    });
                    onboardingSessionIdRef.current = init?.session_id || null;
                    setAdaptiveTimeouts(init?.timeouts || null);
                } catch (e) {
                    onboardingSessionIdRef.current = null;
                    setAdaptiveTimeouts(null);
                }
            }

            setProblem(generated.problem);
            setChoices(generated.choices);
            setStep('situation');
        } catch (err) {
            console.error('Failed to load problem:', err);
            setError(language === 'en'
                ? 'Failed to load problem. Please try again.'
                : 'Gagal memuat masalah. Silakan coba lagi.');
            setStep('error');
        }
    };

    const markActive = useCallback(async (eventType) => {
        const sessionId = onboardingSessionIdRef.current;
        if (!sessionId) return;
        try {
            await apiClient.api.onboardingArena.track(sessionId, { event_type: eventType, timestamp: Date.now() });
            await apiClient.api.onboardingArena.respondToIntervention(sessionId, 'active');
        } catch (e) {
        }
    }, []);

    const advanceToChoice = useCallback(() => {
        setStep('choice');
        setDecisionStartTime(Date.now());
        setFirstTapAt(null);
        markActive('enter_choice');
    }, [markActive]);

    const shouldShowInsightThisRound = useCallback(() => {
        const isLastRound = roundIndex + 1 >= totalRoundsRef.current;
        const decisionsCount = decisionsRef.current.length;
        if (isLastRound) return true;
        if (decisionsCount <= 0) return false;
        return decisionsCount % 3 === 0;
    }, [roundIndex]);

    const commitChoice = useCallback(async (choice, opts = {}) => {
        try {
            if (!choice) return;
            if (!problem) return;

            const now = Date.now();
            const timeToDecide = decisionStartTime ? (now - decisionStartTime) : 0;
            const timeToFirstTap = (decisionStartTime && firstTapAt)
                ? Math.max(0, firstTapAt - decisionStartTime)
                : timeToDecide;

            const decision = {
                problem_id: problem.id,
                choice_id: choice.id,
                archetype_signal: choice.archetype_signal,
                time_to_first_tap: timeToFirstTap,
                time_to_lock: timeToDecide,
                time_to_decide: timeToDecide,
                change_of_mind_count: changeOfMindCount,
                forced: !!opts.forced,
                decided_at: now
            };

            const nextDecisions = [...decisionsRef.current, decision];
            decisionsRef.current = nextDecisions;
            setDecisions(nextDecisions);

            const sessionId = onboardingSessionIdRef.current;
            if (sessionId) {
                try {
                    const recorded = await apiClient.api.onboardingArena.recordDecision(sessionId, decision, {
                        problem_id: problem.id,
                        title: problem.title,
                        context: problem.context,
                        objective: problem.objective,
                        difficulty: 3,
                        role_label: problem.role
                    });
                    if (recorded?.timeouts) setAdaptiveTimeouts(recorded.timeouts);
                } catch (e) {
                }
            }

            const feedback = generateFeedback({
                language,
                decisions: nextDecisions,
                choice
            });

            setConsequence(feedback.consequence);
            setInsight(feedback.insight);
            setStep('consequence');
        } catch (err) {
            console.error('Failed to get consequence:', err);
            setConsequence(language === 'en'
                ? 'Your choice has been noted.'
                : 'Pilihanmu sudah dicatat.');
            setStep('consequence');
        }
    }, [problem, decisionStartTime, firstTapAt, language, changeOfMindCount]);

    const handleChoiceSelect = (choice) => {
        if (!firstTapAt) setFirstTapAt(Date.now());
        markActive('tap_choice');
        setSelectedChoice(choice);
        if (roundIndex === 0) {
            setStep('lock');
            return;
        }
        commitChoice(choice);
    };

    const handleLockChoice = async () => {
        markActive('lock_choice');
        await commitChoice(selectedChoice);
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

            let nextProfile = result.profile;

            try {
                const currentTotal = Number(nextProfile?.total_arenas_completed ?? 0);
                const ensuredTotal = Math.max(currentTotal, 1);
                if (ensuredTotal !== currentTotal) {
                    const user = await apiClient.auth.me();
                    const updated = await apiClient.api.profiles.update(user.email, {
                        total_arenas_completed: ensuredTotal
                    });
                    nextProfile = updated || nextProfile;
                }
            } catch (e) {
                // ignore profile sync failure
            }

            profileRef.current = nextProfile;
            setProfile(nextProfile);
            setXpEarned(result.xp_earned || 5);
            setStep('complete');

        } catch (err) {
            console.error('Failed to complete onboarding:', err);
            // Still move to complete step
            setXpEarned(5);
            setStep('complete');
        }
    };

    const handleInsightContinue = async () => {
        if (roundIndex + 1 < totalRoundsRef.current) {
            const nextIndex = roundIndex + 1;
            setRoundIndex(nextIndex);
            await loadProblem({ roundIndexOverride: nextIndex });
            return;
        }
        await handleComplete();
    };

    const handleConsequenceContinue = async () => {
        if (shouldShowInsightThisRound()) {
            setStep('insight');
            return;
        }
        await handleInsightContinue();
    };

    const handleEnterArena = () => {
        onComplete(profileRef.current || profile);
    };

    // Translation helper
    const t = (id, en) => language === 'en' ? en : id;

    useEffect(() => {
        if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
        }
        if (nudgeHideRef.current) {
            clearTimeout(nudgeHideRef.current);
            nudgeHideRef.current = null;
        }

        if (step !== 'choice') {
            setNudgeMessage('');
            setSimplifyPrompt(null);
            return;
        }

        const sessionId = onboardingSessionIdRef.current;
        if (!sessionId) return;

        pollingRef.current = setInterval(async () => {
            try {
                const action = await apiClient.api.onboardingArena.getNextAction(sessionId, language);
                if (!action || action.action === 'none') return;

                if (action.action === 'show_nudge') {
                    setNudgeMessage(action.message || '');
                    if (nudgeHideRef.current) clearTimeout(nudgeHideRef.current);
                    nudgeHideRef.current = setTimeout(() => setNudgeMessage(''), 4000);
                    return;
                }

                if (action.action === 'offer_simplify') {
                    setSimplifyPrompt(action);
                    return;
                }

                if (action.action === 'force_pick') {
                    const recommended = action.recommended_archetype;
                    const pick = (choices || []).find(c => c?.archetype_signal === recommended) || (choices || [])[0];
                    if (!pick) return;
                    setFirstTapAt(Date.now());
                    await apiClient.api.onboardingArena.respondToIntervention(sessionId, 'timeout');
                    await commitChoice(pick, { forced: true });
                }
            } catch (e) {
            }
        }, 2500);

        return () => {
            if (pollingRef.current) {
                clearInterval(pollingRef.current);
                pollingRef.current = null;
            }
        };
    }, [step, language, choices, commitChoice]);

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
                        <div className="w-16 h-16 bg-[var(--acid-orange)] border-[3px] border-[var(--ink)] shadow-[6px_6px_0_var(--ink)] nx-sharp flex items-center justify-center mb-6">
                            <Loader2 className="w-8 h-8 text-[var(--ink)] animate-spin" />
                        </div>
                        <p className="text-[var(--ink-2)]">
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
                        <p className="text-red-700 mb-6">{error}</p>
                        <button
                            onClick={loadProblem}
                            className="px-6 py-3 bg-[var(--acid-orange)] text-[var(--ink)] font-bold border-[3px] border-[var(--ink)] shadow-[6px_6px_0_var(--ink)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-100 [transition-timing-function:steps(4,end)] nx-sharp"
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
                            className="flex items-center gap-1 text-[var(--ink-2)] hover:text-[var(--ink)] transition-colors text-sm font-medium"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            {t('Kembali', 'Back')}
                        </button>

                        <button
                            type="button"
                            onClick={advanceToChoice}
                            className="w-full text-left"
                        >
                            <div className="nx-panel nx-sharp p-6">
                            {/* Role badge */}
                            <div className="flex items-center gap-2 mb-4">
                                <span className="px-3 py-1 bg-[var(--acid-orange)] text-[var(--ink)] border-[2px] border-[var(--ink)] nx-sharp text-sm font-bold">
                                    {problem.role}
                                </span>
                                <span className="text-[var(--ink-3)] text-sm">•</span>
                                <span className="text-[var(--ink-3)] text-sm">
                                    {t(`Arena Pembukaan • ${roundIndex + 1}/${totalRounds}`, `Opening Arena • ${roundIndex + 1}/${totalRounds}`)}
                                </span>
                            </div>

                            {/* Title */}
                            <h2 className="text-2xl font-bold text-[var(--ink)] mb-4">
                                {problem.title}
                            </h2>

                            {/* Context */}
                            <p className="text-[var(--ink-2)] leading-relaxed mb-4">
                                {problem.context}
                            </p>

                            {/* Objective */}
                            <div className="bg-[var(--paper-2)] border-[2px] border-[var(--ink)] nx-sharp p-4">
                                <p className="text-[var(--ink)] font-semibold">
                                    {problem.objective}
                                </p>
                            </div>
                            </div>
                        </button>

                        <div className="max-w-xs mx-auto">
                            <div className="h-2 bg-[var(--paper)] border-[2px] border-[var(--ink)] nx-sharp overflow-hidden">
                                <motion.div
                                    className="h-full bg-[var(--acid-orange)]"
                                    initial={false}
                                    animate={{ width: `${Math.round(((roundIndex + 1) / Math.max(1, totalRounds)) * 100)}%` }}
                                    transition={{ type: 'spring', stiffness: 120, damping: 22 }}
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
                        {nudgeMessage && (
                            <motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                className="mx-auto max-w-md px-4 py-3 bg-[var(--paper)] border-[3px] border-[var(--ink)] shadow-[6px_6px_0_var(--ink)] nx-sharp text-[var(--ink)] text-sm text-center"
                            >
                                {nudgeMessage}
                            </motion.div>
                        )}

                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-[var(--ink)] mb-2">
                                {t('Pilih cepat.', 'Pick fast.')}
                            </h2>
                            <p className="text-[var(--ink-2)]">
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
                                    className="w-full group nx-panel nx-sharp p-5 text-left transition-colors flex items-center gap-4 hover:border-[var(--acid-orange)] hover:bg-[var(--paper-2)]"
                                >
                                    <div className="text-3xl">{choice.icon}</div>
                                    <div className="flex-1">
                                        <p className="text-[var(--ink)] font-semibold group-hover:text-[var(--acid-orange)] transition-colors">
                                            {choice.text}
                                        </p>
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-[var(--ink-3)] group-hover:text-[var(--acid-orange)] transition-colors" />
                                </motion.button>
                            ))}
                        </div>

                        {simplifyPrompt && (
                            <motion.div
                                key="simplify_prompt"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(11,11,12,0.6)] p-6"
                                onClick={() => {}}
                            >
                                <div className="w-full max-w-md nx-panel nx-sharp p-6">
                                    <p className="text-[var(--ink)] font-bold mb-2">
                                        {simplifyPrompt.message || t('Mau versi ringkas?', 'Want a shorter version?')}
                                    </p>
                                    <p className="text-[var(--ink-2)] text-sm mb-6">
                                        {t('Kamu tetap pilih 1 opsi. Ini cuma biar cepat kebaca.', 'You still pick 1 option. This just makes it faster to read.')}
                                    </p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                setSimplifyPrompt(null);
                                                await markActive('simplify');
                                                const sessionId = onboardingSessionIdRef.current;
                                                if (sessionId) {
                                                    try {
                                                        await apiClient.api.onboardingArena.respondToIntervention(sessionId, 'simplify');
                                                    } catch (e) {
                                                    }
                                                }
                                                setProblem(prev => {
                                                    if (!prev) return prev;
                                                    const ctx = String(prev.context || '');
                                                    const trimmed = ctx.length > 140 ? `${ctx.slice(0, 140).trim()}…` : ctx;
                                                    return { ...prev, context: trimmed };
                                                });
                                            }}
                                            className="px-4 py-3 bg-[var(--acid-orange)] text-[var(--ink)] font-bold border-[3px] border-[var(--ink)] shadow-[6px_6px_0_var(--ink)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-100 [transition-timing-function:steps(4,end)] nx-sharp"
                                        >
                                            {t('Ringkas', 'Shorten')}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                setSimplifyPrompt(null);
                                                await markActive('continue');
                                                const sessionId = onboardingSessionIdRef.current;
                                                if (sessionId) {
                                                    try {
                                                        await apiClient.api.onboardingArena.respondToIntervention(sessionId, 'continue');
                                                    } catch (e) {
                                                    }
                                                }
                                            }}
                                            className="px-4 py-3 bg-[var(--paper)] text-[var(--ink)] font-semibold border-[3px] border-[var(--ink)] shadow-[6px_6px_0_var(--ink)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-100 [transition-timing-function:steps(4,end)] nx-sharp"
                                        >
                                            {t('Lanjut pilih', 'Keep it')}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
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
                            <h2 className="text-2xl font-bold text-[var(--ink)] mb-2">
                                {t('Kunci pilihan.', 'Lock it in.')}
                            </h2>
                            <p className="text-[var(--ink-2)]">
                                {t('Sekali kunci, lanjut.', 'Once locked, we move.')}
                            </p>
                        </div>

                        <div className="nx-panel nx-sharp p-6 flex items-center gap-4">
                            <div className="text-4xl">{selectedChoice.icon}</div>
                            <div className="flex-1">
                                <p className="text-[var(--ink)] font-semibold">{selectedChoice.text}</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleLockChoice}
                                className="w-full px-8 py-4 bg-[var(--acid-orange)] text-[var(--ink)] font-bold border-[3px] border-[var(--ink)] shadow-[6px_6px_0_var(--ink)] hover:translate-x-[-3px] hover:translate-y-[-3px] transition-all duration-100 [transition-timing-function:steps(4,end)] nx-sharp"
                            >
                                {t('KUNCI PILIHAN', 'LOCK CHOICE')}
                            </motion.button>

                            {canChangeChoice && (
                                <button
                                    onClick={() => {
                                        setCanChangeChoice(false);
                                        setChangeOfMindCount(prev => prev + 1);
                                        setSelectedChoice(null);
                                        setStep('choice');
                                    }}
                                    className="w-full px-8 py-3 bg-[var(--paper)] text-[var(--ink)] font-semibold border-[3px] border-[var(--ink)] shadow-[6px_6px_0_var(--ink)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-100 [transition-timing-function:steps(4,end)] nx-sharp"
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
                            className="w-20 h-20 bg-[var(--acid-yellow)] border-[3px] border-[var(--ink)] shadow-[6px_6px_0_var(--ink)] nx-sharp flex items-center justify-center mx-auto mb-8"
                        >
                            <Zap className="w-10 h-10 text-[var(--ink)]" />
                        </motion.div>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-xl text-[var(--ink-2)] max-w-md mx-auto"
                        >
                            {consequence}
                        </motion.p>

                        <motion.button
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.9 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleConsequenceContinue}
                            className="mt-10 px-8 py-4 bg-[var(--acid-orange)] text-[var(--ink)] font-bold border-[3px] border-[var(--ink)] shadow-[6px_6px_0_var(--ink)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-100 [transition-timing-function:steps(4,end)] nx-sharp"
                        >
                            {t('Lanjut', 'Continue')}
                        </motion.button>
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
                            className="w-16 h-16 bg-[var(--acid-magenta)] border-[3px] border-[var(--ink)] shadow-[6px_6px_0_var(--ink)] nx-sharp flex items-center justify-center mx-auto mb-8"
                        >
                            <Sparkles className="w-8 h-8 text-[var(--ink)]" />
                        </motion.div>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-lg text-[var(--ink-2)] max-w-lg mx-auto mb-2"
                        >
                            {insight}
                        </motion.p>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="text-[var(--ink-3)] text-sm mb-8"
                        >
                            {t('— Insight dari pilihanmu', '— Insight from your choice')}
                        </motion.p>

                        <motion.button
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.9 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleInsightContinue}
                            className="px-8 py-4 bg-[var(--acid-orange)] text-[var(--ink)] font-bold border-[3px] border-[var(--ink)] shadow-[6px_6px_0_var(--ink)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-100 [transition-timing-function:steps(4,end)] nx-sharp"
                        >
                            {roundIndex + 1 < totalRoundsRef.current ? t('Lanjut', 'Next') : t('Selesai', 'Finish')}
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
                        <Loader2 className="w-10 h-10 text-[var(--acid-orange)] animate-spin mb-6" />
                        <p className="text-[var(--ink-2)]">
                            {t('Menyusun arena berikutnya...', 'Preparing your next arena...')}
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
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--acid-lime)] text-[var(--ink)] border-[3px] border-[var(--ink)] shadow-[4px_4px_0_var(--ink)] nx-sharp text-lg font-bold">
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
                            <h2 className="text-2xl font-bold text-[var(--ink)] mb-2">
                                {t('Arena pembukaan selesai.', 'Opening arena complete.')}
                            </h2>
                            <p className="text-[var(--ink-2)]">
                                {t('Arena 5 menit siap. Masuk kapan saja.', 'The 5-minute arena is ready. Enter anytime.')}
                            </p>
                        </motion.div>

                        {profile?.total_arenas_completed !== undefined && profile?.total_arenas_completed !== null && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.35 }}
                            className="text-[var(--ink-3)] text-sm mb-8"
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
                            <div className="h-2 bg-[var(--paper)] border-[2px] border-[var(--ink)] nx-sharp overflow-hidden">
                                <motion.div
                                    className="h-full bg-[var(--acid-orange)]"
                                    initial={false}
                                    animate={{ width: '100%' }}
                                    transition={{ type: 'spring', stiffness: 120, damping: 22 }}
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
                            className="px-10 py-4 bg-[var(--acid-orange)] text-[var(--ink)] font-bold text-lg border-[3px] border-[var(--ink)] shadow-[8px_8px_0_var(--ink)] hover:translate-x-[-3px] hover:translate-y-[-3px] transition-all duration-100 [transition-timing-function:steps(4,end)] nx-sharp"
                        >
                            {t('Masuk Arena', 'Enter Arena')}
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
