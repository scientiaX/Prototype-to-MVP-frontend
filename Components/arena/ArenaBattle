import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Clock, AlertTriangle, Send, X, MessageCircle } from 'lucide-react';
import { cn } from "@/lib/utils";
import { base44 } from '@/api/base44Client';
import AdaptiveAIMentor from './AdaptiveAIMentor';

export default function ArenaBattle({ problem, session, onSubmit, onAbandon, profile }) {
  const [solution, setSolution] = useState('');
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [mentorStage, setMentorStage] = useState(null); // null, 'over_analysis_warning', 'comprehension_check', 'countdown'
  const [mentorMessage, setMentorMessage] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [isThinking, setIsThinking] = useState(false);
  const [questionHistory, setQuestionHistory] = useState([]);
  
  const timerRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const lastKeystrokeRef = useRef(Date.now());
  const pauseTimerRef = useRef(null);
  const countdownTimerRef = useRef(null);
  const interventionCountRef = useRef(0);

  // Adaptive timing based on archetype
  const getPauseThreshold = () => {
    if (profile?.primary_archetype === 'analyst') return 60; // 60s for analysts
    if (profile?.primary_archetype === 'risk_taker') return 120; // 120s for risk takers
    return 90; // 90s default
  };

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);

    // Initial question
    generateInitialQuestion();

    return () => {
      clearInterval(timerRef.current);
      clearInterval(pauseTimerRef.current);
      clearInterval(countdownTimerRef.current);
    };
  }, []);

  // Pause detection
  useEffect(() => {
    pauseTimerRef.current = setInterval(() => {
      const timeSinceLastKey = Date.now() - lastKeystrokeRef.current;
      const threshold = getPauseThreshold() * 1000;

      if (timeSinceLastKey > threshold && solution.length < 50 && !mentorStage) {
        handlePauseDetected();
      }
    }, 5000);

    return () => clearInterval(pauseTimerRef.current);
  }, [solution, mentorStage, profile]);

  const generateInitialQuestion = async () => {
    setIsThinking(true);
    
    const prompt = `Kamu adalah mentor Socratic. User baru mulai problem:

PROBLEM: ${problem.title}
CONTEXT: ${problem.context}
OBJECTIVE: ${problem.objective}

User archetype: ${profile?.primary_archetype}
Thinking style: ${profile?.thinking_style}

Generate 1 pertanyaan pembuka yang:
1. Memaksa user breakdown masalah inti
2. Tidak terlalu luas, tidak terlalu sempit
3. Socratic - buat user berpikir sendiri
4. 1 kalimat saja

Contoh: "Apa satu hal yang paling kamu takutkan kalau keputusan ini salah?"

Output hanya pertanyaan dalam Bahasa Indonesia.`;

    const response = await base44.integrations.Core.InvokeLLM({ prompt });
    setCurrentQuestion(response);
    setQuestionHistory([response]);
    setIsThinking(false);
  };

  const handlePauseDetected = () => {
    interventionCountRef.current += 1;

    if (interventionCountRef.current === 1) {
      // First pause: over-analysis warning
      triggerOverAnalysisWarning();
    } else if (interventionCountRef.current === 2) {
      // Second pause: comprehension check
      triggerComprehensionCheck();
    }
  };

  const triggerOverAnalysisWarning = async () => {
    setIsThinking(true);
    setMentorStage('over_analysis_warning');

    const archetype = profile?.primary_archetype || 'analyst';
    const warnings = {
      analyst: "Kamu over-thinking. Data tidak akan lebih lengkap 10 menit lagi. Putuskan dengan informasi yang ada.",
      risk_taker: "Sudah {0} detik tidak menulis apa-apa. Ambil keputusan, koreksi nanti.",
      builder: "Eksekusi dimulai dari keputusan pertama. Tulis sesuatu, polish nanti.",
      strategist: "Pola sudah terlihat. Jangan tunggu perfect clarity yang tidak akan datang."
    };

    const threshold = getPauseThreshold();
    const message = warnings[archetype].replace('{0}', threshold);
    
    setMentorMessage(message);
    setIsThinking(false);

    // Auto close after 5 seconds
    setTimeout(() => {
      setMentorStage(null);
    }, 5000);
  };

  const triggerComprehensionCheck = async () => {
    setIsThinking(true);
    setMentorStage('comprehension_check');

    const message = `Kamu belum mulai menulis. Apakah pertanyaan ini terlalu kabur? "${currentQuestion}"`;
    setMentorMessage(message);
    setIsThinking(false);
  };

  const handleUnderstandClick = () => {
    // User claims to understand but still not answering
    setMentorStage('countdown');
    setCountdown(30);
    setMentorMessage("Oke. Kamu punya 30 detik untuk mulai menulis atau pertanyaan akan diganti agar lebih spesifik.");

    countdownTimerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownTimerRef.current);
          evolveQuestion();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleNotUnderstandClick = () => {
    // User doesn't understand - evolve question immediately
    setMentorStage(null);
    evolveQuestion();
  };

  const evolveQuestion = async () => {
    setIsThinking(true);
    setMentorStage(null);
    clearInterval(countdownTimerRef.current);

    const prompt = `User stuck dengan pertanyaan: "${currentQuestion}"

Problem context: ${problem.context}
Objective: ${problem.objective}
User's response so far: ${solution || 'belum menulis apa-apa'}

User archetype: ${profile?.primary_archetype}

Generate pertanyaan baru yang:
1. Lebih spesifik dan mengarahkan (leading)
2. Breakdown pertanyaan sebelumnya jadi lebih konkret
3. Menstimulasi dengan contoh atau skenario mini
4. 1-2 kalimat

Contoh evolution:
Dari: "Apa risiko terbesarnya?"
Jadi: "Kalau 6 bulan dari sekarang ternyata keputusan ini salah, apa kerugian konkret yang harus kamu tanggung?"

Output hanya pertanyaan baru dalam Bahasa Indonesia.`;

    const response = await base44.integrations.Core.InvokeLLM({ prompt });
    setCurrentQuestion(response);
    setQuestionHistory(prev => [...prev, response]);
    setIsThinking(false);
    interventionCountRef.current = 0; // Reset intervention count
  };

  const handleSolutionChange = (e) => {
    setSolution(e.target.value);
    lastKeystrokeRef.current = Date.now();

    // Close mentor popup if user starts typing
    if (mentorStage) {
      setMentorStage(null);
      clearInterval(countdownTimerRef.current);
    }
  };

  const handleManualMentorTrigger = async () => {
    if (isThinking || mentorStage) return;
    
    setIsThinking(true);
    setMentorStage('over_analysis_warning');

    const prompt = `User meminta bantuan mentor saat working on problem.

Current question: ${currentQuestion}
User's response: ${solution || 'belum menulis'}

Berikan 1 pertanyaan Socratic yang:
- Challenge assumption user
- Atau poke blind spot yang mungkin terlewat
- Atau hint untuk deeper thinking

1 kalimat saja, dalam Bahasa Indonesia.`;

    const response = await base44.integrations.Core.InvokeLLM({ prompt });
    setMentorMessage(response);
    setIsThinking(false);

    setTimeout(() => setMentorStage(null), 8000);
  };

  const handleSubmit = () => {
    if (solution.trim().length < 100) {
      setMentorStage('over_analysis_warning');
      setMentorMessage("Solusi terlalu pendek. Minimal 100 karakter untuk menjelaskan keputusan dan reasoning-mu.");
      setTimeout(() => setMentorStage(null), 5000);
      return;
    }
    
    clearInterval(timerRef.current);
    clearInterval(pauseTimerRef.current);
    clearInterval(countdownTimerRef.current);
    onSubmit(solution, timeElapsed);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-black p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-zinc-600 font-mono text-xs">{problem.problem_id}</span>
            <h1 className="text-xl md:text-2xl font-bold text-white">{problem.title}</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg bg-zinc-900 text-white">
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
                  "w-3 h-3 rounded-sm",
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
          
          {currentQuestion && (
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-orange-500/5 border border-orange-500/20 rounded-lg p-3 mb-4"
            >
              <p className="text-orange-500 text-xs font-semibold mb-1">Jawab pertanyaan ini:</p>
              <p className="text-zinc-300 text-sm italic">"{currentQuestion}"</p>
            </motion.div>
          )}
          
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
    </div>
  );
}
