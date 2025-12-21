import React, { useEffect, useState } from 'react';
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

    // Time remaining for current screen
    const [screenTimeRemaining, setScreenTimeRemaining] = useState(20);

    // Update time remaining based on current screen
    useEffect(() => {
        const timing = SCREEN_TIMING[entryFlow.currentScreen];
        if (!timing) return;

        // Reset time for new screen
        setScreenTimeRemaining(Math.ceil(timing / 1000));

        // Countdown timer
        const timer = setInterval(() => {
            setScreenTimeRemaining(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [entryFlow.currentScreen]);

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
                        timeRemaining={screenTimeRemaining}
                    />
                );

            case ENTRY_SCREENS.FORCED_CHOICE:
                return (
                    <ForcedChoiceScreen
                        choices={entryFlow.choices}
                        selectedChoice={entryFlow.selectedChoice}
                        onSelectChoice={entryFlow.selectChoice}
                        onContinue={entryFlow.nextScreen}
                        timeRemaining={screenTimeRemaining}
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
                        timeRemaining={screenTimeRemaining}
                        isLoading={entryFlow.isLoadingConsequences}
                    />
                );

            case ENTRY_SCREENS.STATUS_UPDATE:
                return (
                    <StatusUpdateScreen
                        progressStatus={entryFlow.progressStatus}
                        onContinue={entryFlow.nextScreen}
                        timeRemaining={screenTimeRemaining}
                    />
                );

            case ENTRY_SCREENS.FIRST_REFLECTION:
                return (
                    <FirstReflectionScreen
                        selectedChoice={entryFlow.selectedChoice}
                        reflectionQuestion={entryFlow.reflectionQuestion}
                        onSubmit={entryFlow.submitReflection}
                        timeRemaining={screenTimeRemaining}
                    />
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-black">
            {/* Skip button (dev/testing only or for returning users) */}
            {process.env.NODE_ENV === 'development' && (
                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2 }}
                    onClick={onSkip}
                    className="fixed top-4 right-4 z-50 px-3 py-1.5 text-xs text-zinc-600 hover:text-zinc-400 bg-zinc-900 rounded-lg border border-zinc-800 transition-colors"
                >
                    Skip Entry Flow
                </motion.button>
            )}

            {/* Progress bar */}
            <div className="fixed top-0 left-0 right-0 z-40">
                <div className="h-1 bg-zinc-900">
                    <motion.div
                        className="h-full bg-gradient-to-r from-orange-500 to-red-500"
                        initial={{ width: '0%' }}
                        animate={{ width: `${entryFlow.progress}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>
            </div>

            {/* Total elapsed timer (discrete) */}
            <div className="fixed top-4 left-4 z-50">
                <span className="text-zinc-700 text-xs font-mono">
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
                >
                    {renderScreen()}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
