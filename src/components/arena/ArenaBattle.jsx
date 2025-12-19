import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Clock, AlertTriangle, Send, X, MessageCircle, Zap, Timer, HelpCircle, Loader2 } from 'lucide-react';
import { cn } from "@/lib/utils";
import AdaptiveAIMentor from './AdaptiveAIMentor';

/**
 * ArenaBattle Component - Original Design with Dynamic AI Questions
 * 
 * Design: Single textarea with dynamic question box that AI updates
 * Flow: AI asks → User answers → AI asks follow-up → ... → Conclusion
 * Communication: WebSocket for real-time updates
 */
export default function ArenaBattle({ problem, session, onSubmit, onAbandon, profile }) {
  // Core state
  const [solution, setSolution] = useState('');
  const [timeElapsed, setTimeElapsed] = useState(0);

  // Dynamic question state - This is where AI questions appear
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionType, setQuestionType] = useState('initial'); // initial, follow_up, stress_test, clarification
  const [questionHistory, setQuestionHistory] = useState([]);
  const [exchangeCount, setExchangeCount] = useState(0);

  // AI/Processing state
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [aiMessage, setAiMessage] = useState(''); // Small guidance messages

  // Intervention state
  const [mentorStage, setMentorStage] = useState(null);
  const [mentorMessage, setMentorMessage] = useState('');
  const [countdown, setCountdown] = useState(0);

  // WebSocket state
  const [wsConnected, setWsConnected] = useState(false);
  const wsRef = useRef(null);

  // Timer refs
  const timerRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const lastKeystrokeRef = useRef(Date.now());
  const countdownTimerRef = useRef(null);

  // ==========================================
  // WEBSOCKET CONNECTION
  // ==========================================

  useEffect(() => {
    // Start timer
    timerRef.current = setInterval(() => {
      setTimeElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);

    // Connect WebSocket
    connectWebSocket();

    // Generate initial question
    generateInitialQuestion();

    return () => {
      clearInterval(timerRef.current);
      clearInterval(countdownTimerRef.current);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const connectWebSocket = () => {
    const wsUrl = `${(import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001').replace('http', 'ws')}/ws/arena`;

    try {
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        setWsConnected(true);
        // Join session
        wsRef.current.send(JSON.stringify({
          type: 'join_session',
          session_id: session._id
        }));
      };

      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected');
        setWsConnected(false);
        // Attempt reconnect after 3 seconds
        setTimeout(connectWebSocket, 3000);
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      // Fallback to REST polling if WebSocket fails
      setWsConnected(false);
    }
  };

  const handleWebSocketMessage = (data) => {
    switch (data.type) {
      case 'session_joined':
        console.log('Session joined:', data.session_id);
        break;

      case 'intervention':
      case 'ai_action':
        if (data.action?.action === 'show_warning' || data.intervention_type === 'warning') {
          setMentorStage('warning');
          setMentorMessage(data.message || data.action?.message);
          setTimeout(() => setMentorStage(null), 6000);
        } else if (data.action?.action === 'comprehension_check') {
          setMentorStage('comprehension_check');
          setMentorMessage(data.action?.message);
        } else if (data.action?.action === 'change_question') {
          updateQuestion(data.action.new_question, 'clarification');
        }
        break;

      case 'new_question':
        updateQuestion(data.question, data.question_type);
        setIsAIProcessing(false);
        break;

      case 'hint':
        setAiMessage(data.message);
        setTimeout(() => setAiMessage(''), 10000);
        break;

      case 'response_processed':
        if (data.delegate_to_agent) {
          // Session is concluding
          setAiMessage('Mengevaluasi semua jawaban...');
        }
        break;

      case 'session_complete':
        // Session is done, trigger onSubmit
        onSubmit(solution, timeElapsed, questionHistory);
        break;
    }
  };

  const sendWebSocketMessage = (message) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      return true;
    }
    return false;
  };

  // ==========================================
  // QUESTION MANAGEMENT
  // ==========================================

  const generateInitialQuestion = async () => {
    setIsAIProcessing(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}/api/mentor/question`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: profile.user_id,
          problem_id: problem.problem_id,
          context: 'initial'
        })
      });

      if (response.ok) {
        const data = await response.json();
        updateQuestion(data.question, 'initial');
      } else {
        updateQuestion("Apa langkah pertama yang akan kamu ambil untuk menghadapi situasi ini?", 'initial');
      }
    } catch (error) {
      console.error('Failed to generate initial question:', error);
      updateQuestion("Apa langkah pertama yang akan kamu ambil untuk menghadapi situasi ini?", 'initial');
    }

    setIsAIProcessing(false);
  };

  const updateQuestion = (question, type) => {
    setCurrentQuestion(question);
    setQuestionType(type);
    setQuestionHistory(prev => [...prev, { question, type, timestamp: Date.now() }]);
  };

  // ==========================================
  // USER INTERACTION
  // ==========================================

  const handleSolutionChange = (e) => {
    setSolution(e.target.value);
    lastKeystrokeRef.current = Date.now();

    // Clear any warning if user starts typing
    if (mentorStage === 'warning') {
      setMentorStage(null);
    }

    // Send keystroke via WebSocket (debounced by WebSocket service)
    sendWebSocketMessage({
      type: 'keystroke',
      data: { timestamp: Date.now(), length: e.target.value.length }
    });
  };

  const handleSubmitAnswer = async () => {
    if (!solution.trim() || isAIProcessing) return;

    setIsAIProcessing(true);
    const newExchangeCount = exchangeCount + 1;
    setExchangeCount(newExchangeCount);

    // Store the current answer for reference
    const currentAnswer = solution.trim();

    try {
      // Always use REST API for reliability (WebSocket for real-time tracking only)
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}/api/mentor/follow-up`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problem_id: problem.problem_id,
          user_response: currentAnswer,
          exchange_count: newExchangeCount
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Follow-up response:', data);

        // Check if AI wants to conclude (after minimum exchanges)
        if (newExchangeCount >= 3 && data.should_conclude) {
          // Conclude session
          onSubmit(currentAnswer, timeElapsed, questionHistory);
          return;
        }

        // Update with new question
        if (data.question) {
          updateQuestion(data.question, data.type || 'follow_up');
          setSolution(''); // Clear for next answer
        } else {
          // Fallback question if none returned
          const fallbacks = [
            "Menarik. Bisa jelaskan lebih detail tentang reasoning-mu?",
            "Apa trade-off terbesar dari pendekatan ini?",
            "Bagaimana kalau asumsi utamamu ternyata salah?"
          ];
          updateQuestion(fallbacks[newExchangeCount % fallbacks.length], 'follow_up');
          setSolution('');
        }
      } else {
        console.error('Follow-up API error:', response.status);
        // Still provide a follow-up question on error
        updateQuestion("Apa langkah selanjutnya setelah keputusan ini?", 'follow_up');
        setSolution('');
      }
    } catch (error) {
      console.error('Failed to get follow-up:', error);
      // Fallback question on network error
      updateQuestion("Jelaskan lebih lanjut tentang reasoning-mu.", 'follow_up');
      setSolution('');
    }

    setIsAIProcessing(false);
  };

  const handleAskForHelp = async () => {
    if (isAIProcessing) return;

    // Try WebSocket first
    const success = sendWebSocketMessage({
      type: 'request_hint',
      partial_answer: solution
    });

    if (!success) {
      // Fallback to REST
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}/api/mentor/hint`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            problem_id: problem.problem_id,
            partial_answer: solution
          })
        });

        if (response.ok) {
          const data = await response.json();
          setAiMessage(data.hint);
          setTimeout(() => setAiMessage(''), 10000);
        }
      } catch (error) {
        setAiMessage("Coba pikirkan: apa yang HARUS diputuskan terlebih dahulu?");
        setTimeout(() => setAiMessage(''), 8000);
      }
    }
  };

  const handleInterventionResponse = (responseType) => {
    sendWebSocketMessage({
      type: 'intervention_response',
      response_type: responseType
    });

    if (responseType === 'not_understood') {
      // AI will send a simpler question
      setAiMessage("Saya akan berikan pertanyaan yang lebih spesifik...");
    }

    setMentorStage(null);
  };

  // ==========================================
  // UTILITY
  // ==========================================

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const getQuestionTypeLabel = () => {
    switch (questionType) {
      case 'initial': return 'Mulai';
      case 'follow_up': return 'Menggali';
      case 'stress_test': return 'Tekanan';
      case 'clarification': return 'Klarifikasi';
      default: return '';
    }
  };

  const getQuestionTypeColor = () => {
    switch (questionType) {
      case 'stress_test': return 'border-red-500/50 bg-red-500/10';
      case 'clarification': return 'border-blue-500/50 bg-blue-500/10';
      default: return 'border-orange-500/50 bg-orange-500/10';
    }
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
                  {problem.role_label.replace(/_/g, ' ').toUpperCase()}
                </span>
              )}
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-white">{problem.title}</h1>
          </div>
          <div className="flex items-center gap-4">
            {/* Exchange counter */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 text-zinc-400">
              <MessageCircle className="w-4 h-4" />
              <span className="font-mono text-sm">{exchangeCount}</span>
            </div>

            {/* Timer */}
            <div className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg bg-zinc-900",
              timeElapsed > 120 ? "text-orange-400" : "text-white"
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

        {/* Dynamic AI Question Box - This is where AI questions/guidance appear */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={cn(
              "rounded-xl p-5 mb-6 border-2",
              getQuestionTypeColor()
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-orange-500 text-xs font-bold uppercase tracking-wide">
                {questionType === 'stress_test' ? '⚡ CHALLENGE: ' : '💬 MENTOR: '}
              </h3>
              <span className="text-xs text-zinc-500">{getQuestionTypeLabel()}</span>
            </div>

            {isAIProcessing ? (
              <div className="flex items-center gap-2 text-zinc-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm italic">AI sedang menyiapkan pertanyaan...</span>
              </div>
            ) : (
              <p className="text-white text-lg leading-relaxed italic">"{currentQuestion}"</p>
            )}
          </motion.div>
        </AnimatePresence>

        {/* AI Small Message (hints, guidance) */}
        <AnimatePresence>
          {aiMessage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-4"
            >
              <p className="text-blue-400 text-sm">💡 {aiMessage}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Solution Input */}
        <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6 mb-6">
          <div className="flex items-start justify-between mb-3">
            <h2 className="text-white text-sm font-semibold">JAWABANMU</h2>
            {questionHistory.length > 1 && (
              <span className="text-zinc-600 text-xs">
                Pertanyaan ke-{questionHistory.length}
              </span>
            )}
          </div>

          <Textarea
            value={solution}
            onChange={handleSolutionChange}
            placeholder="Tulis jawabanmu di sini... Jelaskan reasoning dan keputusanmu."
            className="min-h-[200px] bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600 resize-none mb-4"
            disabled={isAIProcessing}
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleAskForHelp}
                disabled={isAIProcessing}
                className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
              >
                <HelpCircle className="w-4 h-4 mr-1" />
                Butuh Hint?
              </Button>
              <span className="text-zinc-500 text-sm">{solution.length} karakter</span>
            </div>

            <Button
              onClick={handleSubmitAnswer}
              disabled={!solution.trim() || isAIProcessing}
              className="bg-orange-500 hover:bg-orange-600 text-black font-bold"
            >
              {isAIProcessing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              {exchangeCount >= 2 ? 'Kirim & Lanjutkan' : 'Kirim Jawaban'}
            </Button>
          </div>
        </div>

        {/* Question History - Collapsed */}
        {questionHistory.length > 1 && (
          <details className="bg-zinc-950/50 border border-zinc-800 rounded-lg p-4">
            <summary className="text-zinc-500 text-xs font-semibold cursor-pointer">
              PERTANYAAN SEBELUMNYA ({questionHistory.length - 1})
            </summary>
            <div className="mt-3 space-y-2">
              {questionHistory.slice(0, -1).map((q, i) => (
                <p key={i} className="text-zinc-600 text-xs line-through">
                  {q.question}
                </p>
              ))}
            </div>
          </details>
        )}
      </div>

      {/* Adaptive AI Mentor Popup */}
      <AdaptiveAIMentor
        stage={mentorStage}
        message={mentorMessage}
        countdown={countdown}
        onUnderstandClick={() => handleInterventionResponse('understood')}
        onNotUnderstandClick={() => handleInterventionResponse('not_understood')}
        isThinking={false}
      />

      {/* Connection Status */}
      <div className="fixed bottom-6 left-6 flex items-center gap-2">
        <div className={cn(
          "w-2 h-2 rounded-full",
          wsConnected ? "bg-green-500" : "bg-yellow-500 animate-pulse"
        )} />
        <span className="text-xs text-zinc-600">
          {wsConnected ? "Live" : "Connecting..."}
        </span>
      </div>
    </div>
  );
}
