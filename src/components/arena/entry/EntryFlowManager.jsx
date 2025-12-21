import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Entry Flow Screens - 180 second high-impact entry sequence
 * Based on arena_first_3_minutes_high_impact_entry_design.md
 */
export const ENTRY_SCREENS = {
    SITUATION_DROP: 'situation_drop',     // 0-20s: Context only, no input
    FORCED_CHOICE: 'forced_choice',       // 20-45s: 2-3 concrete options
    DECISION_LOCK: 'decision_lock',       // 45-60s: Lock button, micro-win
    CONSEQUENCE_REVEAL: 'consequence',    // 60-90s: Consequence reveal
    STATUS_UPDATE: 'status_update',       // 90-120s: Progress status
    FIRST_REFLECTION: 'reflection',       // 120-180s: First typing
    COMPLETED: 'completed'                // Entry flow done, go to main arena
};

/**
 * Screen timing configuration (in milliseconds)
 */
export const SCREEN_TIMING = {
    [ENTRY_SCREENS.SITUATION_DROP]: 20000,    // 20 seconds
    [ENTRY_SCREENS.FORCED_CHOICE]: 25000,     // 25 seconds (20-45s)
    [ENTRY_SCREENS.DECISION_LOCK]: 15000,     // 15 seconds (45-60s)
    [ENTRY_SCREENS.CONSEQUENCE_REVEAL]: 30000, // 30 seconds (60-90s)
    [ENTRY_SCREENS.STATUS_UPDATE]: 30000,     // 30 seconds (90-120s)
    [ENTRY_SCREENS.FIRST_REFLECTION]: 60000   // 60 seconds (120-180s)
};

/**
 * Screen order for sequential flow
 */
export const SCREEN_ORDER = [
    ENTRY_SCREENS.SITUATION_DROP,
    ENTRY_SCREENS.FORCED_CHOICE,
    ENTRY_SCREENS.DECISION_LOCK,
    ENTRY_SCREENS.CONSEQUENCE_REVEAL,
    ENTRY_SCREENS.STATUS_UPDATE,
    ENTRY_SCREENS.FIRST_REFLECTION,
    ENTRY_SCREENS.COMPLETED
];

/**
 * Default choice options (fallback if API fails)
 */
export const DEFAULT_CHOICES = [
    {
        id: 'aggressive',
        text: 'Ambil langkah agresif',
        icon: '🔥',
        hint: 'Risiko tinggi, reward potensial tinggi'
    },
    {
        id: 'conservative',
        text: 'Pertahankan posisi aman',
        icon: '🛡️',
        hint: 'Lebih aman tapi lambat'
    },
    {
        id: 'collaborative',
        text: 'Cari bantuan eksternal',
        icon: '🤝',
        hint: 'Butuh networking dan trust'
    }
];

/**
 * Entry Flow State Manager Hook
 * Manages the 180-second high-impact entry sequence
 */
export const useEntryFlowManager = (problem, profile) => {
    // Current screen state
    const [currentScreen, setCurrentScreen] = useState(ENTRY_SCREENS.SITUATION_DROP);
    const [screenStartTime, setScreenStartTime] = useState(Date.now());
    const [totalElapsed, setTotalElapsed] = useState(0);

    // User decision state
    const [choices, setChoices] = useState([]);
    const [selectedChoice, setSelectedChoice] = useState(null);
    const [isLocked, setIsLocked] = useState(false);
    const [consequences, setConsequences] = useState([]);
    const [insightMessage, setInsightMessage] = useState('');
    const [progressStatus, setProgressStatus] = useState('forming');
    const [reflectionText, setReflectionText] = useState('');
    const [reflectionQuestion, setReflectionQuestion] = useState('');

    // Loading states
    const [isLoadingChoices, setIsLoadingChoices] = useState(false);
    const [isLoadingConsequences, setIsLoadingConsequences] = useState(false);

    // Timer refs
    const timerRef = useRef(null);
    const elapsedTimerRef = useRef(null);

    // Track total elapsed time
    useEffect(() => {
        elapsedTimerRef.current = setInterval(() => {
            setTotalElapsed(prev => prev + 1);
        }, 1000);

        return () => clearInterval(elapsedTimerRef.current);
    }, []);

    // Get current screen index
    const getCurrentScreenIndex = useCallback(() => {
        return SCREEN_ORDER.indexOf(currentScreen);
    }, [currentScreen]);

    // Progress percentage (0-100)
    const getProgress = useCallback(() => {
        const index = getCurrentScreenIndex();
        if (index === -1) return 0;
        return Math.round((index / (SCREEN_ORDER.length - 1)) * 100);
    }, [getCurrentScreenIndex]);

    // Time remaining for current screen
    const getTimeRemaining = useCallback(() => {
        const timing = SCREEN_TIMING[currentScreen];
        if (!timing) return 0;
        const elapsed = Date.now() - screenStartTime;
        return Math.max(0, Math.ceil((timing - elapsed) / 1000));
    }, [currentScreen, screenStartTime]);

    // Navigate to next screen
    const nextScreen = useCallback(() => {
        const currentIndex = getCurrentScreenIndex();
        const nextIndex = currentIndex + 1;

        if (nextIndex < SCREEN_ORDER.length) {
            const next = SCREEN_ORDER[nextIndex];
            setCurrentScreen(next);
            setScreenStartTime(Date.now());
        }
    }, [getCurrentScreenIndex]);

    // Go to specific screen
    const goToScreen = useCallback((screen) => {
        if (SCREEN_ORDER.includes(screen)) {
            setCurrentScreen(screen);
            setScreenStartTime(Date.now());
        }
    }, []);

    // Fetch choices from API
    const fetchChoices = useCallback(async () => {
        setIsLoadingChoices(true);
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}/api/arena/entry/generate-choices`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        problem_id: problem?.problem_id,
                        user_id: profile?.user_id,
                        context: problem?.context,
                        objective: problem?.objective
                    })
                }
            );

            if (response.ok) {
                const data = await response.json();
                setChoices(data.choices || DEFAULT_CHOICES);
                setReflectionQuestion(data.reflection_question || `Kenapa kamu memilih opsi tersebut?`);
            } else {
                setChoices(DEFAULT_CHOICES);
                setReflectionQuestion('Kenapa kamu memilih opsi tersebut?');
            }
        } catch (error) {
            console.error('Failed to fetch choices:', error);
            setChoices(DEFAULT_CHOICES);
            setReflectionQuestion('Kenapa kamu memilih opsi tersebut?');
        }
        setIsLoadingChoices(false);
    }, [problem, profile]);

    // Fetch consequences based on choice
    const fetchConsequences = useCallback(async (choiceId) => {
        setIsLoadingConsequences(true);
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}/api/arena/entry/generate-consequence`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        problem_id: problem?.problem_id,
                        choice_id: choiceId,
                        choice_text: selectedChoice?.text,
                        user_id: profile?.user_id,
                        context: problem?.context
                    })
                }
            );

            if (response.ok) {
                const data = await response.json();
                setConsequences(data.consequences || ['Keputusanmu memiliki dampak yang akan terlihat nanti.']);
                setInsightMessage(data.insight || 'Setiap keputusan punya biaya.');
            } else {
                setConsequences(['Keputusanmu akan membawa perubahan signifikan.']);
                setInsightMessage('Setiap keputusan punya biaya.');
            }
        } catch (error) {
            console.error('Failed to fetch consequences:', error);
            setConsequences(['Keputusanmu akan membawa perubahan signifikan.']);
            setInsightMessage('Setiap keputusan punya biaya.');
        }
        setIsLoadingConsequences(false);
    }, [problem, profile, selectedChoice]);

    // Select a choice (before locking)
    const selectChoice = useCallback((choice) => {
        if (!isLocked) {
            setSelectedChoice(choice);
        }
    }, [isLocked]);

    // Lock decision (micro-win moment)
    const lockDecision = useCallback(async () => {
        if (selectedChoice && !isLocked) {
            setIsLocked(true);
            // Fetch consequences after locking
            await fetchConsequences(selectedChoice.id);
            // Auto advance to consequence reveal
            nextScreen();
        }
    }, [selectedChoice, isLocked, fetchConsequences, nextScreen]);

    // Update progress status based on flow state
    const updateProgressStatus = useCallback(() => {
        const index = getCurrentScreenIndex();
        if (index <= 2) {
            setProgressStatus('forming');
        } else if (index <= 4) {
            setProgressStatus('developing');
        } else {
            setProgressStatus('consistent');
        }
    }, [getCurrentScreenIndex]);

    // Update progress when screen changes
    useEffect(() => {
        updateProgressStatus();
    }, [currentScreen, updateProgressStatus]);

    // Fetch choices when entering forced choice screen
    useEffect(() => {
        if (currentScreen === ENTRY_SCREENS.FORCED_CHOICE && choices.length === 0) {
            fetchChoices();
        }
    }, [currentScreen, choices.length, fetchChoices]);

    // Submit reflection and complete entry flow
    const submitReflection = useCallback((text) => {
        setReflectionText(text);
        nextScreen(); // Go to COMPLETED
    }, [nextScreen]);

    // Check if entry flow is complete
    const isComplete = currentScreen === ENTRY_SCREENS.COMPLETED;

    // Get entry flow data for main arena
    const getEntryFlowData = useCallback(() => {
        return {
            selectedChoice,
            consequences,
            insightMessage,
            reflectionText,
            reflectionQuestion,
            totalTimeSeconds: totalElapsed,
            progressStatus
        };
    }, [selectedChoice, consequences, insightMessage, reflectionText, reflectionQuestion, totalElapsed, progressStatus]);

    return {
        // State
        currentScreen,
        totalElapsed,
        choices,
        selectedChoice,
        isLocked,
        consequences,
        insightMessage,
        progressStatus,
        reflectionText,
        reflectionQuestion,
        isComplete,

        // Loading states
        isLoadingChoices,
        isLoadingConsequences,

        // Computed
        progress: getProgress(),
        timeRemaining: getTimeRemaining(),
        screenIndex: getCurrentScreenIndex(),

        // Actions
        nextScreen,
        goToScreen,
        selectChoice,
        lockDecision,
        submitReflection,
        getEntryFlowData
    };
};

export default useEntryFlowManager;
