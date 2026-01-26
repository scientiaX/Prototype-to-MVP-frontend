import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, MessageCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import apiClient from '@/api/apiClient';

// Import screen manager and screens
import {
  useArenaScreenManager,
  SCREENS,
  VISUAL_STATES,
  INTERACTION_TYPES
} from './ArenaScreenManager';
import SituationScreen from './screens/SituationScreen';
import ActionScreen from './screens/ActionScreen';
import FeedbackScreen from './screens/FeedbackScreen';
import { useMicroToast, ProgressChip } from './MicroToast';

// Session storage key for battle state
const BATTLE_STATE_KEY = 'arena_battle_state';

/**
 * ArenaBattle - Main Arena Component
 * Refactored to use Sequential Screen Model from Experience Layer
 */
export default function ArenaBattle({ problem, session, onSubmit, onAbandon, profile }) {
  // Screen manager hook
  const screenManager = useArenaScreenManager(SCREENS.SITUATION);
  const { showToast, ToastContainer } = useMicroToast();

  // Core state - with session storage restoration
  const [timeElapsed, setTimeElapsed] = useState(() => {
    try {
      const saved = sessionStorage.getItem(BATTLE_STATE_KEY);
      if (saved) {
        const state = JSON.parse(saved);
        if (state.sessionId === session?._id) {
          return state.timeElapsed || 0;
        }
      }
    } catch (e) { }
    return 0;
  });

  const [currentQuestion, setCurrentQuestion] = useState(() => {
    try {
      const saved = sessionStorage.getItem(BATTLE_STATE_KEY);
      if (saved) {
        const state = JSON.parse(saved);
        if (state.sessionId === session?._id) {
          return state.currentQuestion || '';
        }
      }
    } catch (e) { }
    return '';
  });

  const [progressStatus, setProgressStatus] = useState(() => {
    try {
      const saved = sessionStorage.getItem(BATTLE_STATE_KEY);
      if (saved) {
        const state = JSON.parse(saved);
        if (state.sessionId === session?._id) {
          return state.progressStatus || 'forming';
        }
      }
    } catch (e) { }
    return 'forming';
  });

  const [exchangeHistory, setExchangeHistory] = useState(() => {
    try {
      const saved = sessionStorage.getItem(BATTLE_STATE_KEY);
      if (saved) {
        const state = JSON.parse(saved);
        if (state.sessionId === session?._id) {
          return state.exchangeHistory || [];
        }
      }
    } catch (e) { }
    return [];
  });

  const [isLoading, setIsLoading] = useState(false);
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

  // Feedback state
  const [feedbackType, setFeedbackType] = useState('decision_stabilized');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  // Restore screen state from session storage
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(BATTLE_STATE_KEY);
      if (saved) {
        const state = JSON.parse(saved);
        if (state.sessionId === session?._id && state.currentScreen) {
          // Restore screen if we have saved state
          if (state.currentScreen === SCREENS.ACTION && state.currentQuestion) {
            screenManager.goToScreen(SCREENS.ACTION);
          }
        }
      }
    } catch (e) {
      console.error('Error restoring battle screen state:', e);
    }
  }, [session?._id]);

  // Save battle state to sessionStorage whenever it changes
  const saveBattleState = useCallback(() => {
    if (session?._id) {
      const battleState = {
        sessionId: session._id,
        timeElapsed,
        currentQuestion,
        progressStatus,
        exchangeHistory,
        currentScreen: screenManager.currentScreen,
        savedAt: Date.now()
      };
      sessionStorage.setItem(BATTLE_STATE_KEY, JSON.stringify(battleState));
    }
  }, [session?._id, timeElapsed, currentQuestion, progressStatus, exchangeHistory, screenManager.currentScreen]);

  // Save state whenever relevant values change
  useEffect(() => {
    saveBattleState();
  }, [saveBattleState]);

  // Save state before page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveBattleState();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [saveBattleState]);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
      if (screenManager.setVisualState) screenManager.setVisualState(VISUAL_STATES.URGENT);
      return;
    }

    if (action.action === 'comprehension_check') {
      orchestrationRef.current.clearedThisOverlay = false;
      setSystemOverlay({
        type: 'check',
        message: action.message || '',
        options: Array.isArray(action.options) ? action.options : ['understood', 'not_understood']
      });
      if (screenManager.setVisualState) screenManager.setVisualState(VISUAL_STATES.CRITICAL);
      return;
    }

    if (action.action === 'start_countdown') {
      const seconds = Math.max(1, Number(action.seconds || 30));
      orchestrationRef.current.clearedThisOverlay = false;
      setSystemOverlay({ type: 'countdown', message: action.message || '' });
      setCountdownEndsAt(Date.now() + seconds * 1000);
      setCountdownSecondsLeft(seconds);
      if (screenManager.setVisualState) screenManager.setVisualState(VISUAL_STATES.CRITICAL);
      return;
    }

    if (action.action === 'change_question') {
      const nextQ = action.new_question || currentQuestion;
      setCurrentQuestion(nextQ);
      if (session?._id && orchestrationRef.current.initialized) {
        apiClient.api.arena.trackKeystroke(session._id, {
          event_type: 'question_shown',
          timestamp: Date.now(),
          question_id: `battle_sys_${exchangeHistory.length}`,
          question_text: nextQ,
          requires_typing: true
        }).catch(() => { });
      }
      setSystemOverlay(null);
      setCountdownEndsAt(null);
      setCountdownSecondsLeft(0);
      orchestrationRef.current.clearedThisOverlay = false;
      if (screenManager.setVisualState) screenManager.setVisualState(VISUAL_STATES.FOCUSED);
      return;
    }

    if (action.action === 'clear_intervention') {
      setSystemOverlay(null);
      setCountdownEndsAt(null);
      setCountdownSecondsLeft(0);
      orchestrationRef.current.clearedThisOverlay = false;
      if (screenManager.setVisualState) screenManager.setVisualState(VISUAL_STATES.FOCUSED);
    }
  }, [currentQuestion, screenManager]);

  useEffect(() => {
    if (orchestrationRef.current.pollingTimer) {
      clearInterval(orchestrationRef.current.pollingTimer);
      orchestrationRef.current.pollingTimer = null;
    }

    if (!session?._id) return;
    if (!orchestrationRef.current.initialized) return;
    if (screenManager.currentScreen !== SCREENS.ACTION) return;

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
  }, [session?._id, screenManager.currentScreen, handleSystemAction]);

  useEffect(() => {
    if (orchestrationRef.current.countdownTimer) {
      clearInterval(orchestrationRef.current.countdownTimer);
      orchestrationRef.current.countdownTimer = null;
    }
    if (!session?._id) return;
    if (!countdownEndsAt) return;
    if (screenManager.currentScreen !== SCREENS.ACTION) return;

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
  }, [session?._id, countdownEndsAt, screenManager.currentScreen, handleSystemAction]);

  const handleUserActivity = useCallback(() => {
    screenManager.recordActivity();

    if (session?._id && orchestrationRef.current.initialized) {
      const now = Date.now();
      if (now - orchestrationRef.current.lastTrackAt > 800) {
        orchestrationRef.current.lastTrackAt = now;
        apiClient.api.arena.trackKeystroke(session._id, { timestamp: now }).catch(() => { });
      }
    }

    if (systemOverlay || countdownEndsAt) {
      clearSystemOverlay('started_typing');
    }
  }, [screenManager, session?._id, systemOverlay, countdownEndsAt, clearSystemOverlay]);

  // Generate initial question when entering action screen
  useEffect(() => {
    if (screenManager.currentScreen === SCREENS.ACTION && !currentQuestion) {
      generateInitialQuestion();
    }
  }, [screenManager.currentScreen]);

  const generateInitialQuestion = async () => {
    setIsLoading(true);
    try {
      // Add timeout to prevent indefinite wait
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}/api/mentor/question`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: profile?.user_id,
          problem_id: problem.problem_id,
          context: 'initial',
          visual_state: screenManager.visualState
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        setCurrentQuestion(data.question);
        if (session?._id && orchestrationRef.current.initialized) {
          apiClient.api.arena.trackKeystroke(session._id, {
            event_type: 'question_shown',
            timestamp: Date.now(),
            question_id: `battle_${exchangeHistory.length}_0`,
            question_text: data.question,
            requires_typing: true
          }).catch(() => { });
        }
      } else {
        setCurrentQuestion("Apa langkah pertama yang akan kamu ambil?");
      }
    } catch (error) {
      console.error('Question generation error:', error);
      setCurrentQuestion("Apa langkah pertama yang akan kamu ambil?");
    }
    setIsLoading(false);
  };

  // Handle user submission from ActionScreen
  const handleActionSubmit = async (submission) => {
    setIsLoading(true);
    screenManager.recordActivity();

    // Add to history
    const newExchange = {
      question: currentQuestion,
      answer: submission.content || submission.option,
      type: submission.type,
      timestamp: Date.now()
    };
    setExchangeHistory(prev => [...prev, newExchange]);

    try {
      // Add timeout to prevent indefinite wait
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout

      // Get follow-up from AI
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}/api/mentor/follow-up`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problem_id: problem.problem_id,
          user_response: submission.content || JSON.stringify(submission),
          exchange_count: exchangeHistory.length + 1,
          user_id: profile?.user_id,
          visual_state: screenManager.visualState
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();

        // Update progress status
        updateProgressStatus(exchangeHistory.length + 1);

        // Check if should conclude
        if (data.should_conclude) {
          setIsLoading(false);
          await handleConclude();
          return;
        }

        // Show toast once (stays 3 seconds like ML Savage notification)
        showToast('tradeoff_locked', 'Decision Recorded', 3000);

        // Show FeedbackScreen for 3 seconds
        setFeedbackMessage(data.feedback || 'Good reasoning');
        setIsLoading(false);
        screenManager.goToScreen(SCREENS.FEEDBACK);

        // After 3 seconds, transition to next question with dynamic interaction type
        setTimeout(() => {
          const nextQ = data.question || "Apa langkah selanjutnya?";
          setCurrentQuestion(nextQ);
          if (session?._id && orchestrationRef.current.initialized) {
            apiClient.api.arena.trackKeystroke(session._id, {
              event_type: 'question_shown',
              timestamp: Date.now(),
              question_id: `battle_${exchangeHistory.length + 1}_0`,
              question_text: nextQ,
              requires_typing: true
            }).catch(() => { });
          }

          // Use backend-provided interaction type if available
          if (data.interaction_type && screenManager.setInteractionType) {
            screenManager.setInteractionType(data.interaction_type);
          }

          // Set AI-generated options if provided for OPTION_SELECT
          if (data.options && data.interaction_type === 'OPTION_SELECT' && screenManager.setDynamicOptions) {
            screenManager.setDynamicOptions(data.options);
          }

          // Update visual state from backend contextual signals
          if (data.suggested_visual_state && screenManager.setVisualState) {
            screenManager.setVisualState(data.suggested_visual_state);
          }

          // Show social comparison toast (event-based, ~30% from backend)
          if (data.social_comparison?.text) {
            setTimeout(() => {
              showToast('social_comparison', data.social_comparison.text, 4000);
            }, 500);
          }

          // Show micro feedback toast (event-based, ~40% from backend)
          if (data.micro_feedback?.text) {
            setTimeout(() => {
              showToast('micro_feedback', data.micro_feedback.text, 2000);
            }, 1000);
          }

          screenManager.goToScreen(SCREENS.ACTION);
        }, 3000);

      } else {
        // API error - use fallback
        setCurrentQuestion("Apa pertimbangan utamamu dalam keputusan ini?");
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Submit error:', error);
      // Fallback question on error
      setCurrentQuestion("Jelaskan lebih lanjut keputusanmu.");
      setIsLoading(false);
    }
  };

  // Update progress status based on exchanges
  const updateProgressStatus = (count) => {
    if (count >= 5) {
      setProgressStatus('stabilized');
    } else if (count >= 3) {
      setProgressStatus('consistent');
    } else if (count >= 1) {
      setProgressStatus('developing');
    } else {
      setProgressStatus('forming');
    }
  };

  // Handle session conclusion
  const handleConclude = async () => {
    setIsLoading(true);

    // Prepare final submission
    const finalAnswer = exchangeHistory.map(e => e.answer).join('\n\n');

    // Call parent onSubmit
    await onSubmit(finalAnswer, timeElapsed, exchangeHistory);

    setIsLoading(false);
  };

  // Handle hint request
  const handleRequestHint = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}/api/mentor/hint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problem_id: problem.problem_id,
          partial_answer: '',
          exchange_count: exchangeHistory.length
        })
      });

      if (response.ok) {
        const data = await response.json();
        showToast('hint', data.hint);
      }
    } catch (error) {
      showToast('hint', 'Coba pikirkan trade-off utamanya');
    }
  };

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className={cn("min-h-screen relative", screenManager.styles.container)}>
      {/* Toast Container */}
      <ToastContainer />

      {/* Header - Always visible - z-[100] to be above main nav */}
      <div className={cn(
        "fixed top-0 left-0 right-0 z-[100] px-6 py-3 flex items-center justify-between",
        "bg-[var(--paper)] border-b-[3px] border-[var(--ink)]"
      )}>
        <div className="flex items-center gap-4">
          <span className="text-[var(--ink-2)] font-mono text-xs">{problem.problem_id}</span>
          <ProgressChip status={progressStatus} />
        </div>

        <div className="flex items-center gap-4">
          {/* Exchange counter */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 nx-sharp border-[2px] border-[var(--ink)] bg-[var(--paper-2)] text-[var(--ink)]">
            <MessageCircle className="w-4 h-4" />
            <span className="font-mono text-sm">{exchangeHistory.length}</span>
          </div>

          {/* Timer - CONDITIONAL: only show when urgent/critical per Arena docs */}
          {(screenManager.visualState === 'urgent' || screenManager.visualState === 'critical') && (
            <div className={cn(
              "flex items-center gap-2 px-4 py-2 nx-sharp font-mono",
              screenManager.styles.timer
            )}>
              <Clock className="w-4 h-4" />
              {countdownEndsAt ? `${countdownSecondsLeft}s` : formatTime(timeElapsed)}
            </div>
          )}

          {/* Abandon */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onAbandon}
            className="text-[var(--ink-2)] hover:text-[var(--acid-orange)]"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Screen Content */}
      <div className="pt-16">
        <AnimatePresence mode="wait">
          {screenManager.currentScreen === SCREENS.SITUATION && (
            <SituationScreen
              key="situation"
              problem={problem}
              styles={screenManager.styles}
              roleLabel={problem.role_label}
              onStart={() => screenManager.goToScreen(SCREENS.ACTION)}
            />
          )}

          {screenManager.currentScreen === SCREENS.ACTION && (
            <ActionScreen
              key="action"
              problem={problem}
              styles={screenManager.styles}
              tone={screenManager.tone}
              visualState={screenManager.visualState}
              interactionType={screenManager.interactionType}
              currentQuestion={currentQuestion}
              exchangeCount={exchangeHistory.length}
              onSubmit={handleActionSubmit}
              onActivity={handleUserActivity}
              onRequestHint={handleRequestHint}
              options={screenManager.dynamicOptions}
            />
          )}

          {screenManager.currentScreen === SCREENS.FEEDBACK && (
            <FeedbackScreen
              key="feedback"
              styles={screenManager.styles}
              feedbackType={feedbackType}
              feedbackMessage={feedbackMessage}
              progressStatus={progressStatus}
              onContinue={() => screenManager.goToScreen(SCREENS.ACTION)}
              autoAdvance={0}
              showContinue={false}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-[var(--ink)]/40 flex items-center justify-center z-50">
          <div className="w-8 h-8 border-[3px] border-[var(--ink)] border-t-transparent nx-sharp animate-spin" />
        </div>
      )}

      {systemOverlay && screenManager.currentScreen === SCREENS.ACTION && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[min(560px,calc(100vw-32px))]">
          <div className={cn(
            "nx-panel nx-sharp border-[3px] border-[var(--ink)] shadow-[10px_10px_0_var(--ink)] px-5 py-4",
            systemOverlay.type === 'warning' ? "bg-[var(--acid-yellow)]" :
              systemOverlay.type === 'check' ? "bg-[var(--acid-orange)]" :
                "bg-[var(--paper)]"
          )}>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="text-[var(--ink)] font-black text-xs tracking-widest uppercase mb-1">
                  {systemOverlay.type === 'warning' ? 'SYSTEM WARNING' :
                    systemOverlay.type === 'check' ? 'COMPREHENSION CHECK' : 'COUNTDOWN'}
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
                  className="px-4 py-2 bg-[var(--paper)] text-[var(--ink)] font-bold text-sm border-[3px] border-[var(--ink)] shadow-[6px_6px_0_var(--ink)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-100 [transition-timing-function:steps(4,end)] nx-sharp"
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
                  className="px-4 py-2 bg-[var(--paper)] text-[var(--ink)] font-bold text-sm border-[3px] border-[var(--ink)] shadow-[6px_6px_0_var(--ink)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-100 [transition-timing-function:steps(4,end)] nx-sharp"
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
                  Ganti pertanyaan
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
