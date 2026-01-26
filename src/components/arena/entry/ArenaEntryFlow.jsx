import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    useEntryFlowManager,
    ENTRY_SCREENS,
    SCREEN_TIMING
} from './EntryFlowManager';
import apiClient from '@/api/apiClient';
import SituationDropScreen from './SituationDropScreen';
import ForcedChoiceScreen from './ForcedChoiceScreen';
import DecisionLockScreen from './DecisionLockScreen';
import ConsequenceRevealScreen from './ConsequenceRevealScreen';
import StatusUpdateScreen from './StatusUpdateScreen';
import FirstReflectionScreen from './FirstReflectionScreen';

/**
 * ArenaEntryFlow - Main Entry Flow Container
 * Orchestrates the 6-screen sequence for the first 180 seconds
 * Based on arena_first_3_minutes_high_impact_entry_design.md
 */
export default function ArenaEntryFlow({
    problem,
    session,
    profile,
    onComplete,
    onSkip
}) {
    const entryFlow = useEntryFlowManager(problem, profile);
    const screenDurationMs = SCREEN_TIMING[entryFlow.currentScreen] || 0;
    const screenDurationSeconds = Math.max(1, Math.ceil(screenDurationMs / 1000));
    const [systemOverlay, setSystemOverlay] = useState(null);
    const [countdownEndsAt, setCountdownEndsAt] = useState(null);
    const [countdownSecondsLeft, setCountdownSecondsLeft] = useState(0);
    const orchestrationRef = useRef({
        initialized: false,
        pollingTimer: null,
        countdownTimer: null,
        lastTrackAt: 0,
        clearedThisOverlay: false
    });

    useEffect(() => {
        orchestrationRef.current.initialized = false;
        orchestrationRef.current.clearedThisOverlay = false;
        setSystemOverlay(null);
        setCountdownEndsAt(null);
        setCountdownSecondsLeft(0);

        if (!session?._id || !problem?.problem_id || !profile?.user_id) return;

        (async () => {
            try {
                await apiClient.api.arena.initSession(session._id, problem.problem_id, profile.user_id);
                orchestrationRef.current.initialized = true;
            } catch (e) {
                orchestrationRef.current.initialized = false;
            }
        })();
    }, [session?._id, problem?.problem_id, profile?.user_id]);

    const clearSystemOverlay = useCallback(async (responseType = 'started_typing') => {
        if (!session?._id) return;
        if (orchestrationRef.current.clearedThisOverlay) return;
        orchestrationRef.current.clearedThisOverlay = true;
        setSystemOverlay(null);
        setCountdownEndsAt(null);
        setCountdownSecondsLeft(0);
        try {
            await apiClient.api.arena.respondToIntervention(session._id, responseType);
        } catch (e) {
        }
    }, [session?._id]);

    const handleSystemAction = useCallback(async (action) => {
        if (!action || action.action === 'none') return;

        if (action.action === 'show_warning') {
            orchestrationRef.current.clearedThisOverlay = false;
            setSystemOverlay({ type: 'warning', message: action.message || '' });
            return;
        }

        if (action.action === 'comprehension_check') {
            orchestrationRef.current.clearedThisOverlay = false;
            setSystemOverlay({
                type: 'check',
                message: action.message || '',
                options: Array.isArray(action.options) ? action.options : ['understood', 'not_understood']
            });
            return;
        }

        if (action.action === 'start_countdown') {
            const seconds = Math.max(1, Number(action.seconds || 20));
            orchestrationRef.current.clearedThisOverlay = false;
            setSystemOverlay({ type: 'countdown', message: action.message || '' });
            setCountdownEndsAt(Date.now() + seconds * 1000);
            setCountdownSecondsLeft(seconds);
            return;
        }

        if (action.action === 'change_question') {
            orchestrationRef.current.clearedThisOverlay = false;
            setSystemOverlay({ type: 'prompt', message: action.new_question || '' });
            setCountdownEndsAt(null);
            setCountdownSecondsLeft(0);
            return;
        }

        if (action.action === 'clear_intervention') {
            setSystemOverlay(null);
            setCountdownEndsAt(null);
            setCountdownSecondsLeft(0);
            orchestrationRef.current.clearedThisOverlay = false;
        }
    }, []);

    useEffect(() => {
        if (orchestrationRef.current.pollingTimer) {
            clearInterval(orchestrationRef.current.pollingTimer);
            orchestrationRef.current.pollingTimer = null;
        }

        if (!session?._id) return;
        if (!orchestrationRef.current.initialized) return;

        const shouldPoll = entryFlow.currentScreen === ENTRY_SCREENS.FIRST_REFLECTION;
        if (!shouldPoll) return;

        orchestrationRef.current.pollingTimer = setInterval(async () => {
            try {
                const action = await apiClient.api.arena.getNextAction(session._id);
                await handleSystemAction(action);
            } catch (e) {
            }
        }, 2500);

        return () => {
            if (orchestrationRef.current.pollingTimer) {
                clearInterval(orchestrationRef.current.pollingTimer);
                orchestrationRef.current.pollingTimer = null;
            }
        };
    }, [session?._id, entryFlow.currentScreen, handleSystemAction]);

    useEffect(() => {
        if (orchestrationRef.current.countdownTimer) {
            clearInterval(orchestrationRef.current.countdownTimer);
            orchestrationRef.current.countdownTimer = null;
        }
        if (!session?._id) return;
        if (!countdownEndsAt) return;

        orchestrationRef.current.countdownTimer = setInterval(async () => {
            const left = Math.max(0, Math.ceil((countdownEndsAt - Date.now()) / 1000));
            setCountdownSecondsLeft(left);
            if (left > 0) return;

            if (orchestrationRef.current.countdownTimer) {
                clearInterval(orchestrationRef.current.countdownTimer);
                orchestrationRef.current.countdownTimer = null;
            }

            try {
                const result = await apiClient.api.arena.respondToIntervention(session._id, 'not_understood');
                await handleSystemAction(result);
            } catch (e) {
            } finally {
                setCountdownEndsAt(null);
                setCountdownSecondsLeft(0);
            }
        }, 200);

        return () => {
            if (orchestrationRef.current.countdownTimer) {
                clearInterval(orchestrationRef.current.countdownTimer);
                orchestrationRef.current.countdownTimer = null;
            }
        };
    }, [session?._id, countdownEndsAt, handleSystemAction]);

    const trackActivity = useCallback((eventType) => {
        if (!session?._id || !orchestrationRef.current.initialized) return;

        const now = Date.now();
        if (now - orchestrationRef.current.lastTrackAt < 500) return;
        orchestrationRef.current.lastTrackAt = now;

        apiClient.api.arena.trackKeystroke(session._id, { event_type: eventType, timestamp: now }).catch(() => { });

        if (systemOverlay || countdownEndsAt) {
            clearSystemOverlay('started_typing');
        }
    }, [session?._id, systemOverlay, countdownEndsAt, clearSystemOverlay]);

    useEffect(() => {
        if (!session?._id) return;
        if (!orchestrationRef.current.initialized) return;
        if (entryFlow.currentScreen !== ENTRY_SCREENS.FIRST_REFLECTION) return;

        const q = String(entryFlow.reflectionQuestion || '');
        apiClient.api.arena.trackKeystroke(session._id, {
            event_type: 'question_shown',
            timestamp: Date.now(),
            question_id: 'entry_reflection',
            question_text: q,
            requires_typing: true
        }).catch(() => { });
    }, [session?._id, entryFlow.currentScreen, entryFlow.reflectionQuestion]);

    // Handle entry flow completion
    useEffect(() => {
        if (entryFlow.isComplete) {
            const entryData = entryFlow.getEntryFlowData();
            onComplete(entryData);
        }
    }, [entryFlow.isComplete, onComplete, entryFlow]);

    // Render current screen
    const renderScreen = () => {
        switch (entryFlow.currentScreen) {
            case ENTRY_SCREENS.SITUATION_DROP:
                return (
                    <SituationDropScreen
                        problem={problem}
                        roleLabel={problem?.role_label}
                        onContinue={() => {
                            trackActivity('continue');
                            entryFlow.nextScreen();
                        }}
                        timeRemaining={entryFlow.timeRemaining}
                        durationSeconds={screenDurationSeconds}
                    />
                );

            case ENTRY_SCREENS.FORCED_CHOICE:
                return (
                    <ForcedChoiceScreen
                        choices={entryFlow.choices}
                        selectedChoice={entryFlow.selectedChoice}
                        onSelectChoice={(choice) => {
                            trackActivity('select_choice');
                            entryFlow.selectChoice(choice);
                        }}
                        onContinue={() => {
                            trackActivity('continue');
                            entryFlow.nextScreen();
                        }}
                        timeRemaining={entryFlow.timeRemaining}
                        durationSeconds={screenDurationSeconds}
                        isLoading={entryFlow.isLoadingChoices}
                    />
                );

            case ENTRY_SCREENS.DECISION_LOCK:
                return (
                    <DecisionLockScreen
                        selectedChoice={entryFlow.selectedChoice}
                        isLocked={entryFlow.isLocked}
                        onLockDecision={entryFlow.lockDecision}
                        isLoading={entryFlow.isLoadingConsequences}
                    />
                );

            case ENTRY_SCREENS.CONSEQUENCE_REVEAL:
                return (
                    <ConsequenceRevealScreen
                        consequences={entryFlow.consequences}
                        insightMessage={entryFlow.insightMessage}
                        selectedChoice={entryFlow.selectedChoice}
                        onContinue={() => {
                            trackActivity('continue');
                            entryFlow.nextScreen();
                        }}
                        timeRemaining={entryFlow.timeRemaining}
                        durationSeconds={screenDurationSeconds}
                        isLoading={entryFlow.isLoadingConsequences}
                    />
                );

            case ENTRY_SCREENS.STATUS_UPDATE:
                return (
                    <StatusUpdateScreen
                        progressStatus={entryFlow.progressStatus}
                        onContinue={() => {
                            trackActivity('continue');
                            entryFlow.nextScreen();
                        }}
                        timeRemaining={entryFlow.timeRemaining}
                        durationSeconds={screenDurationSeconds}
                    />
                );

            case ENTRY_SCREENS.FIRST_REFLECTION:
                return (
                    <FirstReflectionScreen
                        selectedChoice={entryFlow.selectedChoice}
                        reflectionQuestion={entryFlow.reflectionQuestion}
                        onSubmit={(payload) => {
                            trackActivity('submit_reflection');
                            entryFlow.submitReflection(payload);
                        }}
                        onSkip={(payload) => {
                            trackActivity('skip_reflection');
                            entryFlow.submitReflection(payload);
                        }}
                        onActivity={() => trackActivity('typing')}
                        timeRemaining={entryFlow.timeRemaining}
                        durationSeconds={screenDurationSeconds}
                    />
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen nx-page relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none nx-bg-wires opacity-[0.55]" />
            <div className="absolute inset-0 pointer-events-none nx-bg-dots opacity-[0.2]" />
            {/* Skip button (dev/testing only or for returning users) */}
            {process.env.NODE_ENV === 'development' && (
                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2 }}
                    onClick={onSkip}
                    className="fixed top-4 right-4 z-50 px-3 py-2 text-xs bg-[var(--paper)] text-[var(--ink)] font-semibold border-[3px] border-[var(--ink)] shadow-[4px_4px_0_var(--ink)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-100 [transition-timing-function:steps(4,end)] nx-sharp"
                >
                    Skip Entry Flow
                </motion.button>
            )}

            {/* Progress bar */}
            <div className="fixed top-0 left-0 right-0 z-40">
                <div className="h-2 bg-[var(--paper)] border-b-[3px] border-[var(--ink)] nx-sharp">
                    <motion.div
                        className="h-full bg-[var(--acid-orange)]"
                        initial={{ width: '0%' }}
                        animate={{ width: `${entryFlow.progress}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>
            </div>

            {/* Total elapsed timer (discrete) */}
            <div className="fixed top-4 left-4 z-50">
                <span className="text-[var(--ink-3)] text-xs font-mono">
                    {Math.floor(entryFlow.totalElapsed / 60)}:{String(entryFlow.totalElapsed % 60).padStart(2, '0')}
                </span>
            </div>

            {countdownEndsAt && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
                    <div className="px-4 py-2 bg-[var(--acid-yellow)] text-[var(--ink)] font-mono font-black border-[3px] border-[var(--ink)] shadow-[6px_6px_0_var(--ink)] nx-sharp">
                        {countdownSecondsLeft}s
                    </div>
                </div>
            )}

            {/* Screen content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={entryFlow.currentScreen}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="relative z-10"
                >
                    {renderScreen()}
                </motion.div>
            </AnimatePresence>

            {systemOverlay && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[min(560px,calc(100vw-32px))]">
                    <div className="nx-panel nx-sharp border-[3px] border-[var(--ink)] shadow-[10px_10px_0_var(--ink)] px-5 py-4 bg-[var(--paper)]">
                        <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                                <div className="text-[var(--ink)] font-black text-xs tracking-widest uppercase mb-1">
                                    {systemOverlay.type === 'warning' ? 'SYSTEM WARNING' :
                                        systemOverlay.type === 'check' ? 'COMPREHENSION CHECK' :
                                            systemOverlay.type === 'countdown' ? 'COUNTDOWN' : 'SYSTEM'}
                                </div>
                                <div className="text-[var(--ink)] text-sm font-semibold leading-relaxed break-words">
                                    {systemOverlay.message}
                                </div>
                            </div>
                            {systemOverlay.type === 'countdown' && (
                                <div className="flex-shrink-0 text-[var(--ink)] font-mono font-black text-2xl">
                                    {countdownSecondsLeft}s
                                </div>
                            )}
                        </div>

                        {systemOverlay.type === 'warning' && (
                            <div className="mt-4 flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => clearSystemOverlay('started_typing')}
                                    className="px-4 py-2 bg-[var(--paper-2)] text-[var(--ink)] font-bold text-sm border-[3px] border-[var(--ink)] shadow-[6px_6px_0_var(--ink)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-100 [transition-timing-function:steps(4,end)] nx-sharp"
                                >
                                    Oke
                                </button>
                            </div>
                        )}

                        {systemOverlay.type === 'check' && (
                            <div className="mt-4 grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={async () => {
                                        try {
                                            const result = await apiClient.api.arena.respondToIntervention(session._id, 'understood');
                                            await handleSystemAction(result);
                                        } catch (e) {
                                        }
                                    }}
                                    className="px-4 py-2 bg-[var(--paper-2)] text-[var(--ink)] font-bold text-sm border-[3px] border-[var(--ink)] shadow-[6px_6px_0_var(--ink)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-100 [transition-timing-function:steps(4,end)] nx-sharp"
                                >
                                    Paham
                                </button>
                                <button
                                    type="button"
                                    onClick={async () => {
                                        try {
                                            const result = await apiClient.api.arena.respondToIntervention(session._id, 'not_understood');
                                            await handleSystemAction(result);
                                        } catch (e) {
                                        }
                                    }}
                                    className="px-4 py-2 bg-[var(--ink)] text-[var(--paper)] font-bold text-sm border-[3px] border-[var(--ink)] shadow-[6px_6px_0_var(--ink)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-100 [transition-timing-function:steps(4,end)] nx-sharp"
                                >
                                    Ganti prompt
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
