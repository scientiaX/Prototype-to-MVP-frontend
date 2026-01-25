import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Arena Visual States
 * Defined in arena_experience_layer_intuitive_high_impact_ux.md
 */
export const VISUAL_STATES = {
    CALM: 'calm',
    FOCUSED: 'focused',
    URGENT: 'urgent',
    CRITICAL: 'critical'
};

/**
 * Arena Screens
 * Sequential Screen Model - 1 screen = 1 decision
 */
export const SCREENS = {
    SITUATION: 'situation',
    ACTION: 'action',
    FEEDBACK: 'feedback'
};

/**
 * Interaction Types from arena_engine_specification
 */
export const INTERACTION_TYPES = {
    TEXT_COMMIT: 'text_commit',       // 300-500 chars decision
    PATCH: 'patch',                   // Edit existing decision
    OPTION_SELECT: 'option_select',   // Choose 1 of 2-3 options
    TASK_EXECUTE: 'task_execute',     // Do an action
    EXTENDED_REFLECTION: 'extended'   // Conditional long text
};

/**
 * Visual State CSS Classes
 */
export const getVisualStateClasses = (state) => {
    const base = 'transition-all duration-500';

    switch (state) {
        case VISUAL_STATES.CALM:
            return {
                container: `${base} bg-zinc-950`,
                accent: 'text-zinc-400',
                border: 'border-zinc-800',
                button: 'bg-zinc-800 hover:bg-zinc-700 text-white',
                timer: 'hidden'
            };
        case VISUAL_STATES.FOCUSED:
            return {
                container: `${base} bg-zinc-900`,
                accent: 'text-orange-400',
                border: 'border-orange-500/30',
                button: 'bg-orange-500 hover:bg-orange-600 text-black',
                timer: 'text-zinc-400'
            };
        case VISUAL_STATES.URGENT:
            return {
                container: `${base} bg-zinc-900`,
                accent: 'text-red-500',
                border: 'border-red-500/50',
                button: 'bg-red-500 hover:bg-red-600 text-white animate-pulse',
                timer: 'text-red-500 animate-pulse'
            };
        case VISUAL_STATES.CRITICAL:
            return {
                container: `${base} bg-black`,
                accent: 'text-red-600',
                border: 'border-red-600',
                button: 'bg-red-600 hover:bg-red-700 text-white',
                timer: 'text-red-600 text-2xl font-bold'
            };
        default:
            return getVisualStateClasses(VISUAL_STATES.CALM);
    }
};

/**
 * AI Language Tones per Visual State
 */
export const AI_TONES = {
    [VISUAL_STATES.CALM]: {
        style: 'reflective',
        examples: [
            'Menarik, coba pikirkan...',
            'Apa yang jadi pertimbanganmu?',
            'Hmm, bisa jelaskan lebih?'
        ]
    },
    [VISUAL_STATES.FOCUSED]: {
        style: 'direct',
        examples: [
            'Apa keputusanmu?',
            'Langkah konkretnya?',
            'Pilih dan jelaskan.'
        ]
    },
    [VISUAL_STATES.URGENT]: {
        style: 'short',
        examples: [
            'Putuskan sekarang.',
            'Waktu terbatas.',
            'Kunci pilihanmu.'
        ]
    },
    [VISUAL_STATES.CRITICAL]: {
        style: 'firm',
        examples: [
            'Waktu habis. Kunci.',
            'Sekarang atau tidak sama sekali.',
            'Final.'
        ]
    }
};

/**
 * State Transition Configuration
 */
export const STATE_TRANSITIONS = {
    // Calm → Focused: User starts typing
    toFocused: {
        from: [VISUAL_STATES.CALM],
        trigger: 'user_typing'
    },
    // Focused → Urgent: Idle >60s OR stagnation
    toUrgent: {
        from: [VISUAL_STATES.FOCUSED],
        trigger: 'idle_60s',
        idleThreshold: 60000
    },
    // Urgent → Critical: Idle >30s after urgent
    toCritical: {
        from: [VISUAL_STATES.URGENT],
        trigger: 'idle_30s',
        idleThreshold: 30000
    },
    // Any → Calm: Valid submission
    toCalm: {
        from: [VISUAL_STATES.FOCUSED, VISUAL_STATES.URGENT, VISUAL_STATES.CRITICAL],
        trigger: 'valid_submit'
    }
};

/**
 * ArenaScreenManager Hook
 * Central controller for sequential screen flow and visual states
 */
export const useArenaScreenManager = (initialScreen = SCREENS.SITUATION) => {
    const [currentScreen, setCurrentScreen] = useState(initialScreen);
    const [visualState, setVisualState] = useState(VISUAL_STATES.CALM);
    const [interactionType, setInteractionType] = useState(INTERACTION_TYPES.TEXT_COMMIT);
    const [exchangeCount, setExchangeCount] = useState(0);
    const [dynamicOptions, setDynamicOptions] = useState(null); // AI-generated options

    const lastActivityRef = useRef(Date.now());
    const idleTimerRef = useRef(null);

    // Track user activity
    const recordActivity = useCallback(() => {
        lastActivityRef.current = Date.now();

        // Transition to Focused if in Calm and user starts typing
        if (visualState === VISUAL_STATES.CALM) {
            setVisualState(VISUAL_STATES.FOCUSED);
        }
    }, [visualState]);

    // Check for idle state transitions
    useEffect(() => {
        const checkIdle = () => {
            const idleTime = Date.now() - lastActivityRef.current;

            if (visualState === VISUAL_STATES.FOCUSED && idleTime > 60000) {
                setVisualState(VISUAL_STATES.URGENT);
            } else if (visualState === VISUAL_STATES.URGENT && idleTime > 30000) {
                setVisualState(VISUAL_STATES.CRITICAL);
            }
        };

        idleTimerRef.current = setInterval(checkIdle, 5000);
        return () => clearInterval(idleTimerRef.current);
    }, [visualState]);

    // Screen transitions
    const goToScreen = useCallback((screen) => {
        setCurrentScreen(screen);
    }, []);

    const nextScreen = useCallback(() => {
        switch (currentScreen) {
            case SCREENS.SITUATION:
                setCurrentScreen(SCREENS.ACTION);
                break;
            case SCREENS.ACTION:
                setCurrentScreen(SCREENS.FEEDBACK);
                break;
            case SCREENS.FEEDBACK:
                setCurrentScreen(SCREENS.ACTION);
                setExchangeCount(prev => prev + 1);
                break;
        }
    }, [currentScreen]);

    // Handle valid submission
    const onValidSubmit = useCallback(() => {
        setVisualState(VISUAL_STATES.CALM);
        lastActivityRef.current = Date.now();
        nextScreen();
    }, [nextScreen]);

    // Reset to calm
    const resetState = useCallback(() => {
        setVisualState(VISUAL_STATES.CALM);
        setCurrentScreen(SCREENS.SITUATION);
        setExchangeCount(0);
        setDynamicOptions(null);
        lastActivityRef.current = Date.now();
    }, []);

    return {
        currentScreen,
        visualState,
        interactionType,
        exchangeCount,
        dynamicOptions,
        styles: getVisualStateClasses(visualState),
        tone: AI_TONES[visualState],

        // Actions
        goToScreen,
        nextScreen,
        recordActivity,
        onValidSubmit,
        resetState,
        setInteractionType,
        setVisualState,
        setDynamicOptions
    };
};

export default useArenaScreenManager;
