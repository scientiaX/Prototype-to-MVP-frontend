import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Clock, AlertTriangle, Send, X, MessageCircle, Zap, Timer, CheckCircle, HelpCircle } from 'lucide-react';
import { cn } from "@/lib/utils";
import apiClient from '@/api/apiClient';
import AdaptiveAIMentor from './AdaptiveAIMentor';

/**
 * Enhanced ArenaBattle Component
 * 
 * Features:
 * - Server-driven 3-tier intervention system
 * - Real-time keystroke tracking
 * - Adaptive timeouts based on orchestrator
 * - Visual pressure indicators
 */
export default function ArenaBattle({ problem, session, onSubmit, onAbandon, profile }) {
  // Core state
  const [solution, setSolution] = useState('');
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionHistory, setQuestionHistory] = useState([]);

  // Intervention state (now server-driven)
  const [mentorStage, setMentorStage] = useState(null);
  const [mentorMessage, setMentorMessage] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [isThinking, setIsThinking] = useState(false);

  // Session state
  const [sessionInitialized, setSessionInitialized] = useState(false);
  const [serverTimeouts, setServerTimeouts] = useState(null);
  const [pressureLevel, setPressureLevel] = useState(1);

  // Refs
  const timerRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const lastKeystrokeRef = useRef(Date.now());
  const pollingRef = useRef(null);
  const countdownTimerRef = useRef(null);
  const keystrokeTrackRef = useRef([]);

  // ==========================================
  // SESSION INITIALIZATION
  // ==========================================

  useEffect(() => {
    // Start timer
    timerRef.current = setInterval(() => {
      setTimeElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);

    // Initialize orchestrator session
    initializeOrchestratorSession();

    // Generate initial question
    generateInitialQuestion();

    return () => {
      clearInterval(timerRef.current);
      clearInterval(pollingRef.current);
      clearInterval(countdownTimerRef.current);
    };
  }, []);

  const initializeOrchestratorSession = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}/api/arena/init-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: session._id,
          problem_id: problem.problem_id,
          user_id: profile.user_id
        })
      });

      if (response.ok) {
        const data = await response.json();
        setServerTimeouts(data.timeouts);
        setSessionInitialized(true);

        // Start polling for AI actions
        startActionPolling();
      }
    } catch (error) {
      console.error('Failed to initialize orchestrator session:', error);
      // Fallback: still mark as initialized to allow user to work
      setSessionInitialized(true);
    }
  };

  // ==========================================
  // SERVER-DRIVEN INTERVENTION POLLING
  // ==========================================

  const startActionPolling = () => {
    pollingRef.current = setInterval(async () => {
      if (mentorStage) return; // Don't poll during active intervention

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}/api/arena/next-action/${session._id}`
        );

        if (response.ok) {
          const action = await response.json();
          handleServerAction(action);
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 3000); // Poll every 3 seconds
  };

  const handleServerAction = (action) => {
    switch (action.action) {
      case 'show_warning':
        setMentorStage('warning');
        setMentorMessage(action.message);
        // Auto-dismiss after 6 seconds
        setTimeout(() => {
          if (mentorStage === 'warning') setMentorStage(null);
        }, 6000);
        break;

      case 'comprehension_check':
        setMentorStage('comprehension_check');
        setMentorMessage(action.message);
        break;

      case 'start_countdown':
        setMentorStage('countdown');
        setMentorMessage(action.message);
        startCountdown(action.seconds);
        break;

      case 'change_question':
        setCurrentQuestion(action.new_question);
        setQuestionHistory(prev => [...prev, action.new_question]);
        setMentorStage(null);
        break;

      case 'add_pressure':
        setPressureLevel(prev => Math.min(5, prev + 1));
        break;

      case 'none':
      default:
        // No action needed
        break;
    }
  };

  // ==========================================
  // COUNTDOWN TIMER
  // ==========================================

  const startCountdown = (seconds) => {
    setCountdown(seconds);

    countdownTimerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownTimerRef.current);
          // Time's up - server will handle question change
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // ==========================================
  // KEYSTROKE TRACKING
  // ==========================================

  const trackKeystroke = useCallback(async () => {
    if (!sessionInitialized) return;

    const now = Date.now();
    keystrokeTrackRef.current.push(now);
    lastKeystrokeRef.current = now;

    // Debounced tracking - send to server every 2 seconds
    // This is handled by the server through the last_keystroke update
    try {
      await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}/api/arena/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: session._id,
          keystroke_data: {
            timestamp: now,
            solution_length: solution.length
          }
        })
      });
    } catch (error) {
      // Silent fail - don't interrupt user
    }
  }, [session._id, sessionInitialized, solution.length]);

  // Debounced keystroke tracker
  const debouncedTrack = useRef(null);

  const handleSolutionChange = (e) => {
    setSolution(e.target.value);

    // Clear intervention if user starts typing
    if (mentorStage && mentorStage !== 'countdown') {
      respondToIntervention('started_typing');
    }

    // Debounce keystroke tracking
    if (debouncedTrack.current) {
      clearTimeout(debouncedTrack.current);
    }
    debouncedTrack.current = setTimeout(() => {
      trackKeystroke();
    }, 1000);
  };

  // ==========================================
  // INTERVENTION RESPONSES
  // ==========================================

  const respondToIntervention = async (responseType) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}/api/arena/intervention-response`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: session._id,
          response_type: responseType
        })
      });

      if (response.ok) {
        const result = await response.json();
        handleServerAction(result);
      }
    } catch (error) {
      console.error('Intervention response error:', error);
    }

    if (responseType === 'started_typing') {
      setMentorStage(null);
      clearInterval(countdownTimerRef.current);
    }
  };

  const handleUnderstandClick = () => {
    respondToIntervention('understood');
  };

  const handleNotUnderstandClick = () => {
    respondToIntervention('not_understood');
  };

  // ==========================================
  // QUESTION GENERATION
  // ==========================================

  const generateInitialQuestion = async () => {
    setIsThinking(true);

    try {
      const question = await apiClient.api.mentor.generateQuestion(problem.problem_id, 'initial');
      setCurrentQuestion(question);
      setQuestionHistory([question]);
    } catch (error) {
      console.error('Failed to generate initial question:', error);
      // Fallback question
      setCurrentQuestion("Apa langkah pertama yang akan kamu ambil?");
    }

    setIsThinking(false);
  };

  const handleManualMentorTrigger = async () => {
    if (isThinking || mentorStage) return;

    setIsThinking(true);
    setMentorStage('warning');

    try {
      const question = await apiClient.api.mentor.generateQuestion(problem.problem_id, 'pause');
      setMentorMessage(question);
    } catch (error) {
      setMentorMessage("Apa yang membuatmu ragu? Tulis apa yang kamu pikirkan.");
    }

    setIsThinking(false);
    setTimeout(() => setMentorStage(null), 8000);
  };

  // ==========================================
  // SUBMISSION
  // ==========================================

  const handleSubmit = () => {
    if (solution.trim().length < 100) {
      setMentorStage('warning');
      setMentorMessage("Solusi terlalu pendek. Minimal 100 karakter untuk menjelaskan keputusan dan reasoning-mu.");
      setTimeout(() => setMentorStage(null), 5000);
      return;
    }

    clearInterval(timerRef.current);
    clearInterval(pollingRef.current);
    clearInterval(countdownTimerRef.current);
    onSubmit(solution, timeElapsed);
  };

  // ==========================================
  // UTILITY
  // ==========================================

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Get pressure color based on level
  const getPressureColor = () => {
    if (pressureLevel <= 2) return 'text-green-400';
    if (pressureLevel <= 3) return 'text-yellow-400';
    if (pressureLevel <= 4) return 'text-orange-400';
    return 'text-red-400';
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="min-h-screen bg-black p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-zinc-600 font-mono text-xs">{problem.problem_id}</span>
              {problem.role_label && (
                <span className="px-2 py-0.5 bg-violet-500/15 text-violet-400 text-xs font-medium rounded">
                  {problem.role_label.replace('_', ' ').toUpperCase()}
                </span>
              )}
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-white">{problem.title}</h1>
          </div>
          <div className="flex items-center gap-4">
            {/* Pressure Indicator */}
            <div className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900",
              getPressureColor()
            )}>
              <Zap className="w-4 h-4" />
              <span className="font-mono text-sm">{pressureLevel}</span>
            </div>

            {/* Timer */}
            <div className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg bg-zinc-900",
              timeElapsed > (serverTimeouts?.warning || 60) ? "text-orange-400" : "text-white"
            )}>
              <Clock className="w-5 h-5" />
              {formatTime(timeElapsed)}
            </div>

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

        {/* Difficulty indicator */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-zinc-500 text-sm">Difficulty</span>
          <div className="flex gap-1">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-3 h-3 rounded-sm transition-all",
                  i < problem.difficulty
                    ? problem.difficulty <= 3 ? "bg-green-500"
                      : problem.difficulty <= 6 ? "bg-yellow-500"
                        : "bg-red-500"
                    : "bg-zinc-800"
                )}
              />
            ))}
          </div>
          <span className="text-zinc-400 font-mono ml-2">{problem.difficulty}/10</span>

          {/* Server timeout indicator */}
          {serverTimeouts && (
            <div className="ml-4 flex items-center gap-1 text-xs text-zinc-600">
              <Timer className="w-3 h-3" />
              <span>Warning: {serverTimeouts.warning}s</span>
            </div>
          )}
        </div>

        {/* Problem Context */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-6">
          <h2 className="text-zinc-400 text-sm font-semibold mb-3">KONTEKS MASALAH</h2>
          <p className="text-white leading-relaxed">{problem.context}</p>
        </div>

        {/* Objective */}
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-6 mb-6">
          <h2 className="text-orange-500 text-sm font-semibold mb-3">YANG HARUS KAMU PUTUSKAN</h2>
          <p className="text-white leading-relaxed">{problem.objective}</p>
        </div>

        {/* Constraints */}
        {problem.constraints && problem.constraints.length > 0 && (
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <h2 className="text-red-500 text-sm font-semibold">CONSTRAINTS</h2>
            </div>
            <ul className="space-y-2">
              {problem.constraints.map((constraint, i) => (
                <li key={i} className="text-zinc-300 text-sm flex items-start gap-2">
                  <span className="text-red-500">•</span>
                  {constraint}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Solution Input */}
        <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6 mb-6">
          <div className="flex items-start justify-between mb-3">
            <h2 className="text-white text-sm font-semibold">SOLUSIMU</h2>
            {questionHistory.length > 1 && (
              <span className="text-zinc-600 text-xs">
                Pertanyaan ke-{questionHistory.length}
              </span>
            )}
          </div>

          {/* Current Question */}
          <AnimatePresence mode="wait">
            {currentQuestion && (
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="bg-orange-500/5 border border-orange-500/20 rounded-lg p-3 mb-4"
              >
                <p className="text-orange-500 text-xs font-semibold mb-1">Jawab pertanyaan ini:</p>
                <p className="text-zinc-300 text-sm italic">"{currentQuestion}"</p>
              </motion.div>
            )}
          </AnimatePresence>

          <Textarea
            value={solution}
            onChange={handleSolutionChange}
            placeholder="Tulis jawabanmu di sini..."
            className="min-h-[250px] bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600 resize-none"
          />

          <div className="flex items-center justify-between mt-4">
            <span className={cn(
              "text-sm",
              solution.length < 100 ? "text-zinc-500" : "text-green-500"
            )}>
              {solution.length} karakter {solution.length < 100 && `(min 100)`}
            </span>
            <Button
              onClick={handleSubmit}
              disabled={solution.length < 100}
              className="bg-orange-500 hover:bg-orange-600 text-black font-bold"
            >
              <Send className="w-4 h-4 mr-2" />
              Submit Solusi
            </Button>
          </div>
        </div>

        {/* Question History */}
        {questionHistory.length > 1 && (
          <div className="bg-zinc-950/50 border border-zinc-800 rounded-lg p-4">
            <h3 className="text-zinc-500 text-xs font-semibold mb-2">PERTANYAAN SEBELUMNYA</h3>
            <div className="space-y-2">
              {questionHistory.slice(0, -1).map((q, i) => (
                <p key={i} className="text-zinc-600 text-xs line-through">
                  {q}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Adaptive AI Mentor Popup */}
      <AdaptiveAIMentor
        stage={mentorStage}
        message={mentorMessage}
        countdown={countdown}
        onUnderstandClick={handleUnderstandClick}
        onNotUnderstandClick={handleNotUnderstandClick}
        isThinking={isThinking}
      />

      {/* Floating mentor button */}
      {!mentorStage && (
        <button
          onClick={handleManualMentorTrigger}
          disabled={isThinking}
          className="fixed bottom-6 right-6 w-14 h-14 bg-orange-500 hover:bg-orange-600 rounded-full flex items-center justify-center shadow-lg transition-all disabled:opacity-50"
        >
          <MessageCircle className="w-6 h-6 text-black" />
        </button>
      )}

      {/* Session Status Indicator */}
      <div className="fixed bottom-6 left-6 flex items-center gap-2">
        <div className={cn(
          "w-2 h-2 rounded-full",
          sessionInitialized ? "bg-green-500" : "bg-yellow-500 animate-pulse"
        )} />
        <span className="text-xs text-zinc-600">
          {sessionInitialized ? "Connected" : "Connecting..."}
        </span>
      </div>
    </div>
  );
}
