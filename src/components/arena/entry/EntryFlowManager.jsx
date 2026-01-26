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

// Session storage key for entry flow state
const ENTRY_FLOW_STATE_KEY = 'arena_entry_flow_state';

/**
 * Entry Flow State Manager Hook
 * Manages the 180-second high-impact entry sequence
 */
export const useEntryFlowManager = (problem, profile) => {
    // Try to restore saved state
    const getSavedState = useCallback(() => {
        try {
            const saved = sessionStorage.getItem(ENTRY_FLOW_STATE_KEY);
            if (saved) {
                const state = JSON.parse(saved);
                // Check if saved state is for the same problem
                if (state.problemId === problem?.problem_id) {
                    return state;
                }
            }
        } catch (e) {
            console.error('Error reading entry flow state:', e);
        }
        return null;
    }, [problem?.problem_id]);

    const savedState = getSavedState();

    // Current screen state - restore from session if available
    const [currentScreen, setCurrentScreen] = useState(
        savedState?.currentScreen || ENTRY_SCREENS.SITUATION_DROP
    );
    const [flowStartTime, setFlowStartTime] = useState(savedState?.flowStartTime || Date.now());
    const [screenStartTime, setScreenStartTime] = useState(savedState?.screenStartTime || Date.now());
    const [clockTick, setClockTick] = useState(Date.now());

    // User decision state - restore from session if available
    const [choices, setChoices] = useState(savedState?.choices || []);
    const [selectedChoice, setSelectedChoice] = useState(savedState?.selectedChoice || null);
    const [isLocked, setIsLocked] = useState(savedState?.isLocked || false);
    const [consequences, setConsequences] = useState(savedState?.consequences || []);
    const [insightMessage, setInsightMessage] = useState(savedState?.insightMessage || '');
    const [progressStatus, setProgressStatus] = useState(savedState?.progressStatus || 'forming');
    const [reflectionText, setReflectionText] = useState(savedState?.reflectionText || '');
    const [reflectionQuestion, setReflectionQuestion] = useState(savedState?.reflectionQuestion || '');

    // Loading states
    const [isLoadingChoices, setIsLoadingChoices] = useState(false);
    const [isLoadingConsequences, setIsLoadingConsequences] = useState(false);

    // Save entry flow state to sessionStorage
    const saveEntryFlowState = useCallback(() => {
        if (problem?.problem_id && currentScreen !== ENTRY_SCREENS.COMPLETED) {
            const entryFlowState = {
                problemId: problem.problem_id,
                currentScreen,
                flowStartTime,
                screenStartTime,
                choices,
                selectedChoice,
                isLocked,
                consequences,
                insightMessage,
                progressStatus,
                reflectionText,
                reflectionQuestion,
                savedAt: Date.now()
            };
            sessionStorage.setItem(ENTRY_FLOW_STATE_KEY, JSON.stringify(entryFlowState));
        }
    }, [problem?.problem_id, currentScreen, flowStartTime, screenStartTime, choices, selectedChoice, isLocked, consequences, insightMessage, progressStatus, reflectionText, reflectionQuestion]);

    // Save state whenever relevant values change
    useEffect(() => {
        saveEntryFlowState();
    }, [saveEntryFlowState]);

    // Save state before page unload
    useEffect(() => {
        const handleBeforeUnload = () => {
            saveEntryFlowState();
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [saveEntryFlowState]);

    // Tick clock for timeRemaining + totalElapsed calculations (timestamp-based, no drift)
    useEffect(() => {
        const interval = setInterval(() => setClockTick(Date.now()), 400);
        return () => clearInterval(interval);
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
        const elapsed = clockTick - screenStartTime;
        return Math.max(0, Math.ceil((timing - elapsed) / 1000));
    }, [currentScreen, screenStartTime, clockTick]);

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
    const submitReflection = useCallback((payload) => {
        const text = typeof payload === 'string'
            ? payload
            : typeof payload?.text === 'string'
                ? payload.text
                : '';
        setReflectionText(text);
        nextScreen(); // Go to COMPLETED
    }, [nextScreen]);

    // Check if entry flow is complete
    const isComplete = currentScreen === ENTRY_SCREENS.COMPLETED;

    // Get entry flow data for main arena
    const getEntryFlowData = useCallback(() => {
        const totalElapsed = Math.max(0, Math.floor((clockTick - flowStartTime) / 1000));
        return {
            selectedChoice,
            consequences,
            insightMessage,
            reflectionText,
            reflectionQuestion,
            totalTimeSeconds: totalElapsed,
            progressStatus
        };
    }, [selectedChoice, consequences, insightMessage, reflectionText, reflectionQuestion, progressStatus, clockTick, flowStartTime]);

    return {
        // State
        currentScreen,
        totalElapsed: Math.max(0, Math.floor((clockTick - flowStartTime) / 1000)),
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
