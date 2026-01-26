import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    useEntryFlowManager,
    ENTRY_SCREENS,
    SCREEN_TIMING
} from './EntryFlowManager';
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
                        onContinue={entryFlow.nextScreen}
                        timeRemaining={entryFlow.timeRemaining}
                        durationSeconds={screenDurationSeconds}
                    />
                );

            case ENTRY_SCREENS.FORCED_CHOICE:
                return (
                    <ForcedChoiceScreen
                        choices={entryFlow.choices}
                        selectedChoice={entryFlow.selectedChoice}
                        onSelectChoice={entryFlow.selectChoice}
                        onContinue={entryFlow.nextScreen}
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
                        onContinue={entryFlow.nextScreen}
                        timeRemaining={entryFlow.timeRemaining}
                        durationSeconds={screenDurationSeconds}
                        isLoading={entryFlow.isLoadingConsequences}
                    />
                );

            case ENTRY_SCREENS.STATUS_UPDATE:
                return (
                    <StatusUpdateScreen
                        progressStatus={entryFlow.progressStatus}
                        onContinue={entryFlow.nextScreen}
                        timeRemaining={entryFlow.timeRemaining}
                        durationSeconds={screenDurationSeconds}
                    />
                );

            case ENTRY_SCREENS.FIRST_REFLECTION:
                return (
                    <FirstReflectionScreen
                        selectedChoice={entryFlow.selectedChoice}
                        reflectionQuestion={entryFlow.reflectionQuestion}
                        onSubmit={entryFlow.submitReflection}
                        onSkip={entryFlow.submitReflection}
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
        </div>
    );
}
