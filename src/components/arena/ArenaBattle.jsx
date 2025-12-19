import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Clock, AlertTriangle, Send, X, MessageCircle, Zap, Timer, CheckCircle, HelpCircle, User, Bot, Loader2 } from 'lucide-react';
import { cn } from "@/lib/utils";
import apiClient from '@/api/apiClient';
import AdaptiveAIMentor from './AdaptiveAIMentor';

/**
 * Enhanced ArenaBattle Component with Multi-Step Conversation
 * 
 * Flow:
 * 1. AI asks initial question
 * 2. User responds
 * 3. AI asks follow-up/stress-test
 * 4. User responds
 * 5. Repeat until AI decides to conclude (or min 3 exchanges)
 * 6. Final evaluation and XP calculation
 */
export default function ArenaBattle({ problem, session, onSubmit, onAbandon, profile }) {
  // Conversation state
  const [messages, setMessages] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [conversationPhase, setConversationPhase] = useState('initial'); // initial, follow_up, stress_test, conclusion
  const [exchangeCount, setExchangeCount] = useState(0);
  const MIN_EXCHANGES = 3; // Minimum back-and-forth before conclusion

  // Timer state
  const [timeElapsed, setTimeElapsed] = useState(0);

  // Intervention state
  const [mentorStage, setMentorStage] = useState(null);
  const [mentorMessage, setMentorMessage] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Session state  
  const [sessionInitialized, setSessionInitialized] = useState(false);
  const [serverTimeouts, setServerTimeouts] = useState(null);
  const [pressureLevel, setPressureLevel] = useState(1);
  const [isConcluding, setIsConcluding] = useState(false);

  // Refs
  const timerRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const lastInputRef = useRef(Date.now());
  const pollingRef = useRef(null);
  const countdownTimerRef = useRef(null);
  const messagesEndRef = useRef(null);

  // ==========================================
  // INITIALIZATION
  // ==========================================

  useEffect(() => {
    // Start timer
    timerRef.current = setInterval(() => {
      setTimeElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);

    // Initialize session
    initializeSession();

    return () => {
      clearInterval(timerRef.current);
      clearInterval(pollingRef.current);
      clearInterval(countdownTimerRef.current);
    };
  }, []);

  // Auto-scroll to bottom when new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const initializeSession = async () => {
    try {
      // Initialize orchestrator session
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
      }
    } catch (error) {
      console.error('Failed to initialize:', error);
    }

    setSessionInitialized(true);

    // Start polling for interventions
    startInterventionPolling();

    // Generate initial AI question
    await generateInitialQuestion();
  };

  const startInterventionPolling = () => {
    pollingRef.current = setInterval(async () => {
      if (mentorStage || isAIThinking) return;

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}/api/arena/next-action/${session._id}`
        );

        if (response.ok) {
          const action = await response.json();
          handleServerAction(action);
        }
      } catch (error) {
        // Silent fail
      }
    }, 5000);
  };

  const handleServerAction = (action) => {
    switch (action.action) {
      case 'show_warning':
        setMentorStage('warning');
        setMentorMessage(action.message);
        setTimeout(() => setMentorStage(null), 6000);
        break;
      case 'comprehension_check':
        setMentorStage('comprehension_check');
        setMentorMessage(action.message);
        break;
      case 'add_pressure':
        setPressureLevel(prev => Math.min(5, prev + 1));
        break;
    }
  };

  // ==========================================
  // CONVERSATION FLOW
  // ==========================================

  const generateInitialQuestion = async () => {
    setIsAIThinking(true);

    // Add context message first
    const contextMessage = {
      id: Date.now(),
      role: 'system',
      type: 'context',
      content: `Kamu sekarang berperan sebagai **${(problem.role_label || 'decision maker').replace(/_/g, ' ')}**. 
      
Saya akan memandumu melalui beberapa pertanyaan untuk memahami bagaimana kamu akan menghadapi situasi ini. Jawab dengan jujur berdasarkan instinct dan logikamu.`
    };

    setMessages([contextMessage]);

    try {
      const question = await apiClient.api.mentor.generateQuestion(problem.problem_id, 'initial');

      const aiMessage = {
        id: Date.now() + 1,
        role: 'ai',
        type: 'question',
        content: question || "Apa langkah pertama yang akan kamu ambil dalam situasi ini?"
      };

      setMessages(prev => [...prev, aiMessage]);
      setConversationPhase('initial');
    } catch (error) {
      const fallbackMessage = {
        id: Date.now() + 1,
        role: 'ai',
        type: 'question',
        content: "Apa langkah pertama yang akan kamu ambil dalam situasi ini?"
      };
      setMessages(prev => [...prev, fallbackMessage]);
    }

    setIsAIThinking(false);
  };

  const handleSendMessage = async () => {
    if (!currentInput.trim() || isAIThinking) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      type: 'answer',
      content: currentInput.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentInput('');
    lastInputRef.current = Date.now();
    setExchangeCount(prev => prev + 1);

    // Track keystroke/activity to server
    try {
      await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}/api/arena/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: session._id,
          keystroke_data: { timestamp: Date.now(), message_sent: true }
        })
      });
    } catch (e) { }

    // Clear any active intervention
    if (mentorStage) {
      setMentorStage(null);
      clearInterval(countdownTimerRef.current);
    }

    // Generate AI response
    await generateAIResponse(userMessage.content);
  };

  const generateAIResponse = async (userResponse) => {
    setIsAIThinking(true);

    const newExchangeCount = exchangeCount + 1;

    try {
      // Determine what type of AI response to generate based on phase
      let aiContent;
      let shouldConclude = false;

      if (newExchangeCount >= MIN_EXCHANGES) {
        // After minimum exchanges, there's a chance to conclude
        // This would ideally be determined by the AI, but we'll use a simple heuristic
        const totalContentLength = messages
          .filter(m => m.role === 'user')
          .reduce((sum, m) => sum + m.content.length, 0) + userResponse.length;

        // If user has provided substantial content, we can start conclusion
        if (totalContentLength > 500 || newExchangeCount >= 5) {
          shouldConclude = true;
        }
      }

      if (shouldConclude) {
        // Final stress test before conclusion
        if (conversationPhase !== 'stress_test') {
          setConversationPhase('stress_test');

          const stressTestQuestion = await generateStressTestQuestion(userResponse);

          const aiMessage = {
            id: Date.now(),
            role: 'ai',
            type: 'stress_test',
            content: stressTestQuestion
          };

          setMessages(prev => [...prev, aiMessage]);
        } else {
          // Already did stress test, now conclude
          await concludeArena();
          return;
        }
      } else {
        // Generate follow-up question
        setConversationPhase('follow_up');

        const followUpQuestion = await generateFollowUpQuestion(userResponse);

        const aiMessage = {
          id: Date.now(),
          role: 'ai',
          type: 'follow_up',
          content: followUpQuestion
        };

        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error('AI response error:', error);

      // Fallback question
      const fallbackQuestions = [
        "Menarik. Bisa jelaskan lebih detail tentang reasoning-mu?",
        "Apa trade-off terbesar dari keputusan ini?",
        "Bagaimana kamu akan menangani kalau asumsimu ternyata salah?",
        "Siapa yang paling mungkin menolak keputusan ini?"
      ];

      const aiMessage = {
        id: Date.now(),
        role: 'ai',
        type: 'follow_up',
        content: fallbackQuestions[Math.floor(Math.random() * fallbackQuestions.length)]
      };

      setMessages(prev => [...prev, aiMessage]);
    }

    setIsAIThinking(false);
  };

  const generateFollowUpQuestion = async (userResponse) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}/api/mentor/follow-up`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problem_id: problem.problem_id,
          user_response: userResponse,
          conversation_history: messages.map(m => ({ role: m.role, content: m.content }))
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.question;
      }
    } catch (error) { }

    // Fallback - generate locally
    const fallbacks = [
      "Apa yang akan terjadi jika plan A gagal?",
      "Bagaimana ini akan mempengaruhi stakeholder lain?",
      "Apa risiko tersembunyi yang mungkin kamu belum pertimbangkan?",
      "Kalau kamu harus menjelaskan ini ke board dalam 30 detik, apa yang akan kamu sampaikan?"
    ];
    return fallbacks[exchangeCount % fallbacks.length];
  };

  const generateStressTestQuestion = async (userResponse) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}/api/mentor/stress-test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problem_id: problem.problem_id,
          user_response: userResponse
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.question;
      }
    } catch (error) { }

    // Fallback
    return "Terakhir: Bagaimana kalau semua asumsi terbesarmu ternyata salah? Apa plan B-mu?";
  };

  const concludeArena = async () => {
    setIsConcluding(true);
    setIsAIThinking(true);

    // Add conclusion message
    const conclusionMessage = {
      id: Date.now(),
      role: 'ai',
      type: 'conclusion',
      content: "Terima kasih atas semua jawabanmu. Saya sekarang akan mengevaluasi pendekatan dan keputusanmu..."
    };

    setMessages(prev => [...prev, conclusionMessage]);

    // Compile all user responses
    const allResponses = messages
      .filter(m => m.role === 'user')
      .map(m => m.content)
      .join('\n\n---\n\n');

    // Clear timers
    clearInterval(timerRef.current);
    clearInterval(pollingRef.current);
    clearInterval(countdownTimerRef.current);

    // Submit for evaluation
    onSubmit(allResponses, timeElapsed, messages);
  };

  // ==========================================
  // USER ASKING FOR HELP
  // ==========================================

  const handleAskForHelp = async () => {
    if (isAIThinking) return;

    setIsAIThinking(true);

    const helpRequest = {
      id: Date.now(),
      role: 'user',
      type: 'help_request',
      content: "Saya butuh bantuan untuk memahami situasi ini lebih baik."
    };

    setMessages(prev => [...prev, helpRequest]);

    try {
      const hint = await apiClient.api.mentor.generateQuestion(problem.problem_id, 'hint');

      const helpResponse = {
        id: Date.now() + 1,
        role: 'ai',
        type: 'hint',
        content: hint || "Coba pikirkan: Apa satu keputusan kunci yang harus diambil terlebih dahulu sebelum yang lain?"
      };

      setMessages(prev => [...prev, helpResponse]);
    } catch (error) {
      const fallbackHint = {
        id: Date.now() + 1,
        role: 'ai',
        type: 'hint',
        content: "Coba breakdown masalahnya: Apa satu hal yang HARUS diputuskan terlebih dahulu?"
      };
      setMessages(prev => [...prev, fallbackHint]);
    }

    setIsAIThinking(false);
  };

  const handleInterventionResponse = async (responseType) => {
    try {
      await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}/api/arena/intervention-response`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: session._id,
          response_type: responseType
        })
      });
    } catch (error) { }

    setMentorStage(null);
    clearInterval(countdownTimerRef.current);
  };

  // ==========================================
  // UTILITY
  // ==========================================

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const getPressureColor = () => {
    if (pressureLevel <= 2) return 'text-green-400';
    if (pressureLevel <= 3) return 'text-yellow-400';
    if (pressureLevel <= 4) return 'text-orange-400';
    return 'text-red-400';
  };

  const getPhaseLabel = () => {
    switch (conversationPhase) {
      case 'initial': return 'Eksplorasi';
      case 'follow_up': return 'Pendalaman';
      case 'stress_test': return 'Stress Test';
      case 'conclusion': return 'Evaluasi';
      default: return '';
    }
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-black/90 backdrop-blur-sm border-b border-zinc-800 p-4 z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-zinc-600 font-mono text-xs">{problem.problem_id}</span>
                {problem.role_label && (
                  <span className="px-2 py-0.5 bg-violet-500/15 text-violet-400 text-xs font-medium rounded">
                    {problem.role_label.replace(/_/g, ' ').toUpperCase()}
                  </span>
                )}
                <span className="px-2 py-0.5 bg-orange-500/15 text-orange-400 text-xs font-medium rounded">
                  {getPhaseLabel()}
                </span>
              </div>
              <h1 className="text-lg font-bold text-white">{problem.title}</h1>
            </div>
            <div className="flex items-center gap-3">
              {/* Exchange counter */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 text-zinc-400">
                <MessageCircle className="w-4 h-4" />
                <span className="font-mono text-sm">{exchangeCount}/{MIN_EXCHANGES}+</span>
              </div>

              {/* Timer */}
              <div className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg bg-zinc-900",
                timeElapsed > (serverTimeouts?.warning || 120) ? "text-orange-400" : "text-white"
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
        </div>
      </div>

      {/* Problem Context - Collapsible */}
      <div className="border-b border-zinc-800">
        <details className="max-w-4xl mx-auto">
          <summary className="p-4 cursor-pointer text-zinc-400 hover:text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-medium">Lihat Konteks Masalah</span>
          </summary>
          <div className="px-4 pb-4 space-y-3">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
              <p className="text-zinc-300 text-sm">{problem.context}</p>
            </div>
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
              <h3 className="text-orange-500 text-xs font-semibold mb-1">OBJECTIVE</h3>
              <p className="text-white text-sm">{problem.objective}</p>
            </div>
          </div>
        </details>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex gap-3",
                message.role === 'user' ? "justify-end" : "justify-start"
              )}
            >
              {message.role !== 'user' && (
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                  message.type === 'system' ? "bg-zinc-800" : "bg-orange-500/20"
                )}>
                  <Bot className={cn(
                    "w-4 h-4",
                    message.type === 'system' ? "text-zinc-400" : "text-orange-500"
                  )} />
                </div>
              )}

              <div className={cn(
                "max-w-[80%] rounded-2xl px-4 py-3",
                message.role === 'user'
                  ? "bg-orange-500 text-black"
                  : message.type === 'system'
                    ? "bg-zinc-800/50 text-zinc-400"
                    : message.type === 'stress_test'
                      ? "bg-red-500/20 border border-red-500/30 text-white"
                      : message.type === 'hint'
                        ? "bg-blue-500/20 border border-blue-500/30 text-white"
                        : message.type === 'conclusion'
                          ? "bg-green-500/20 border border-green-500/30 text-white"
                          : "bg-zinc-900 border border-zinc-800 text-white"
              )}>
                {message.type === 'stress_test' && (
                  <span className="text-red-400 text-xs font-semibold block mb-1">⚡ STRESS TEST</span>
                )}
                {message.type === 'hint' && (
                  <span className="text-blue-400 text-xs font-semibold block mb-1">💡 HINT</span>
                )}
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>

              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </motion.div>
          ))}

          {/* AI Thinking indicator */}
          {isAIThinking && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-orange-500" />
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2 text-zinc-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      {!isConcluding && (
        <div className="sticky bottom-0 bg-black/90 backdrop-blur-sm border-t border-zinc-800 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={handleAskForHelp}
                disabled={isAIThinking}
                className="shrink-0 border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                title="Minta bantuan"
              >
                <HelpCircle className="w-5 h-5" />
              </Button>

              <Textarea
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                placeholder="Ketik jawabanmu di sini..."
                className="min-h-[60px] max-h-[200px] bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={isAIThinking}
              />

              <Button
                onClick={handleSendMessage}
                disabled={!currentInput.trim() || isAIThinking}
                className="shrink-0 bg-orange-500 hover:bg-orange-600 text-black"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex items-center justify-between mt-2 text-xs text-zinc-600">
              <span>Tekan Enter untuk kirim, Shift+Enter untuk baris baru</span>
              <span>{currentInput.length} karakter</span>
            </div>
          </div>
        </div>
      )}

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
      <div className="fixed bottom-20 left-4 flex items-center gap-2">
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
