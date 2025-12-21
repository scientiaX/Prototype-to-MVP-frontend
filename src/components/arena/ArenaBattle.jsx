import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, MessageCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

/**
 * ArenaBattle - Main Arena Component
 * Refactored to use Sequential Screen Model from Experience Layer
 */
export default function ArenaBattle({ problem, session, onSubmit, onAbandon, profile }) {
  // Screen manager hook
  const screenManager = useArenaScreenManager(SCREENS.SITUATION);
  const { showToast, ToastContainer } = useMicroToast();

  // Core state
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [progressStatus, setProgressStatus] = useState('forming');
  const [exchangeHistory, setExchangeHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Feedback state
  const [feedbackType, setFeedbackType] = useState('decision_stabilized');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Generate initial question when entering action screen
  useEffect(() => {
    if (screenManager.currentScreen === SCREENS.ACTION && !currentQuestion) {
      generateInitialQuestion();
    }
  }, [screenManager.currentScreen]);

  const generateInitialQuestion = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}/api/mentor/question`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: profile?.user_id,
          problem_id: problem.problem_id,
          context: 'initial',
          visual_state: screenManager.visualState
        })
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentQuestion(data.question);
      } else {
        setCurrentQuestion("Apa langkah pertama yang akan kamu ambil?");
      }
    } catch (error) {
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
        })
      });

      if (response.ok) {
        const data = await response.json();

        // Update progress status
        updateProgressStatus(exchangeHistory.length + 1);

        // Show micro feedback
        showToast('tradeoff_locked', 'Decision recorded');

        // Check if should conclude
        if (data.should_conclude) {
          await handleConclude();
          return;
        }

        // Set feedback for feedback screen
        setFeedbackType('reasoning_improved');
        setFeedbackMessage(data.feedback || 'Good reasoning');

        // Go to feedback screen briefly
        screenManager.goToScreen(SCREENS.FEEDBACK);

        // Set next question
        setTimeout(() => {
          setCurrentQuestion(data.question);
          screenManager.onValidSubmit();
        }, 1500);

      }
    } catch (error) {
      console.error('Submit error:', error);
      showToast('warning', 'Network error');
    }

    setIsLoading(false);
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

      {/* Header - Always visible */}
      <div className={cn(
        "fixed top-0 left-0 right-0 z-40 px-6 py-3 flex items-center justify-between",
        "bg-black/80 backdrop-blur-sm border-b border-zinc-800/50"
      )}>
        <div className="flex items-center gap-4">
          <span className="text-zinc-600 font-mono text-xs">{problem.problem_id}</span>
          <ProgressChip status={progressStatus} />
        </div>

        <div className="flex items-center gap-4">
          {/* Exchange counter */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 text-zinc-400">
            <MessageCircle className="w-4 h-4" />
            <span className="font-mono text-sm">{exchangeHistory.length}</span>
          </div>

          {/* Timer */}
          <div className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg font-mono",
            screenManager.styles.timer
          )}>
            <Clock className="w-4 h-4" />
            {formatTime(timeElapsed)}
          </div>

          {/* Abandon */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onAbandon}
            className="text-zinc-500 hover:text-red-500"
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
              onActivity={screenManager.recordActivity}
              onRequestHint={handleRequestHint}
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
              autoAdvance={1500}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
