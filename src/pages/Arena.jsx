import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '@/api/apiClient';
import { useLocation, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import ProblemCard from '@/components/arena/ProblemCard';
import ArenaBattle from '@/components/arena/ArenaBattle';
import ArenaResult from '@/components/arena/ArenaResult';
import { ArenaEntryFlow } from '@/components/arena/entry';
import { Loader2, Trophy, Zap, Sparkles, Swords, Target, Users, User, Clock, Lock } from 'lucide-react';
import { Button } from "@/components/ui/button";

// Session storage keys
const ARENA_SESSION_KEY = 'arena_active_session';

// Arena mode durations (updated: lighter experience)
const ARENA_MODES = {
  quick: { duration: 5, label: 'Quick', labelId: 'Quick', description: '4-5 menit' },
  standard: { duration: 15, label: 'Standard', labelId: 'Standard', description: '15 menit' }
};

export default function Arena() {
  const [profile, setProfile] = useState(null);
  // Separate problem lists per mode
  const [quickProblems, setQuickProblems] = useState([]);
  const [standardProblems, setStandardProblems] = useState([]);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [currentSession, setCurrentSession] = useState(null);
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingMode, setGeneratingMode] = useState(null); // 'quick' or 'standard'
  const [view, setView] = useState('selection'); // 'selection' | 'entry' | 'battle' | 'result'
  const [gameMode, setGameMode] = useState(null); // null = mode selection, 'solo' = solo mode
  const [arenaTab, setArenaTab] = useState('quick'); // 'quick' or 'standard' - swipe tabs
  const [entryFlowData, setEntryFlowData] = useState(null);
  const [isRestoringSession, setIsRestoringSession] = useState(false);
  // Independent active problem tracking per mode
  const [activeQuickProblem, setActiveQuickProblem] = useState(null);
  const [activeStandardProblem, setActiveStandardProblem] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Save session state to sessionStorage whenever it changes
  const saveSessionState = useCallback(() => {
    if (currentSession && (view === 'entry' || view === 'battle')) {
      const sessionState = {
        selectedProblem,
        currentSession,
        view,
        gameMode,
        entryFlowData,
        savedAt: Date.now()
      };
      sessionStorage.setItem(ARENA_SESSION_KEY, JSON.stringify(sessionState));
    }
  }, [selectedProblem, currentSession, view, gameMode, entryFlowData]);

  // Clear session state
  const clearSessionState = useCallback(() => {
    sessionStorage.removeItem(ARENA_SESSION_KEY);
    // Also clear battle and entry flow state
    sessionStorage.removeItem('arena_battle_state');
    sessionStorage.removeItem('arena_entry_flow_state');
  }, []);

  // Restore session state from sessionStorage
  const restoreSessionState = useCallback(() => {
    try {
      const savedState = sessionStorage.getItem(ARENA_SESSION_KEY);
      if (savedState) {
        const state = JSON.parse(savedState);
        // Check if session is not too old (max 30 minutes)
        const maxAge = 30 * 60 * 1000; // 30 minutes
        if (Date.now() - state.savedAt < maxAge) {
          setSelectedProblem(state.selectedProblem);
          setCurrentSession(state.currentSession);
          setView(state.view);
          setGameMode(state.gameMode);
          setEntryFlowData(state.entryFlowData);
          return true;
        } else {
          // Session too old, clear it
          clearSessionState();
        }
      }
    } catch (error) {
      console.error('Error restoring session state:', error);
      clearSessionState();
    }
    return false;
  }, [clearSessionState]);

  // Save state whenever relevant values change
  useEffect(() => {
    saveSessionState();
  }, [saveSessionState]);

  // Save state before page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveSessionState();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [saveSessionState]);

  useEffect(() => {
    const override = location.state?.profileOverride;
    if (override) setProfile(override);
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);

    try {
      // Check if user is authenticated
      if (!apiClient.auth.isAuthenticated()) {
        navigate('/login?redirect=/arena');
        return;
      }

      const user = await apiClient.auth.me();

      const profiles = await apiClient.entities.UserProfile.filter({ created_by: user.email });
      if (profiles.length === 0 || !profiles[0].calibration_completed) {
        navigate(createPageUrl('Calibration'));
        return;
      }

      setProfile(profiles[0]);

      // Try to restore previous session
      const restored = restoreSessionState();
      if (restored) {
        setIsRestoringSession(true);
        setTimeout(() => setIsRestoringSession(false), 100);
      }

      const allProblems = await apiClient.api.problems.list({ is_active: true });
      const relevantProblems = allProblems.filter(p =>
        p.difficulty >= profiles[0].current_difficulty - 1 &&
        p.difficulty <= profiles[0].current_difficulty + 2
      );

      // Separate problems by mode
      const quick = relevantProblems.filter(p => p.duration_type === 'quick');
      const standard = relevantProblems.filter(p => p.duration_type !== 'quick');

      setQuickProblems(quick);
      setStandardProblems(standard);
    } catch (error) {
      console.error('Error loading arena data:', error);
      navigate('/login?redirect=/arena');
      return;
    }

    setIsLoading(false);
  };

  const generateProblem = async (mode = 'standard') => {
    const modeConfig = ARENA_MODES[mode];
    const isQuick = mode === 'quick';

    // Check if this mode already has an active problem
    if (isQuick && activeQuickProblem) {
      return; // Don't generate - complete existing first
    }
    if (!isQuick && activeStandardProblem) {
      return; // Don't generate - complete existing first
    }

    setIsGenerating(true);
    setGeneratingMode(mode);
    try {
      const newProblem = await apiClient.api.problems.generate(profile, {
        durationMinutes: modeConfig.duration
      });

      // Add to appropriate list
      if (isQuick) {
        setQuickProblems(prev => [newProblem, ...prev]);
        setActiveQuickProblem(newProblem);
      } else {
        setStandardProblems(prev => [newProblem, ...prev]);
        setActiveStandardProblem(newProblem);
      }
    } finally {
      setIsGenerating(false);
      setGeneratingMode(null);
    }
  };

  const startProblem = async (problem) => {
    setSelectedProblem(problem);
    const session = await apiClient.api.arena.start(problem.problem_id);
    setCurrentSession(session);
    // Start with entry flow first (3-minute high-impact entry)
    setView('entry');
  };

  // Handle entry flow completion - transition to main battle
  const handleEntryFlowComplete = (flowData) => {
    setEntryFlowData(flowData);
    setView('battle');
  };

  // Skip entry flow (for dev/testing)
  const handleSkipEntryFlow = () => {
    setEntryFlowData(null);
    setView('battle');
  };

  const handleSubmit = async (solution, timeElapsed, conversationMessages = []) => {
    setIsLoading(true);

    try {
      const response = await apiClient.api.arena.submit(
        currentSession._id,
        solution,
        timeElapsed,
        conversationMessages.length > 0 ? { conversation: conversationMessages } : null
      );

      setProfile(response.updated_profile);
      setResult({
        xp_earned: response.xp_earned,
        xp_breakdown: response.xp_breakdown,
        level_up_achieved: response.evaluation.level_up_achieved,
        criteria_met: response.evaluation.criteria_met,
        ai_evaluation: response.evaluation.evaluation,
        ai_insight: response.evaluation.insight,
        time_spent_seconds: timeElapsed,
        exchange_count: conversationMessages.filter(m => m.role === 'user').length
      });
      setView('result');
      clearSessionState();

      // Clear active tracking based on mode
      if (selectedProblem?.duration_type === 'quick') {
        setActiveQuickProblem(null);
      } else {
        setActiveStandardProblem(null);
      }
    } catch (error) {
      console.error('Submit error:', error);
    }

    setIsLoading(false);
  };

  const handleAbandon = async () => {
    if (currentSession) {
      await apiClient.api.arena.abandon(currentSession._id);
    }
    clearSessionState();

    // Clear active tracking based on mode
    if (selectedProblem?.duration_type === 'quick') {
      setActiveQuickProblem(null);
    } else {
      setActiveStandardProblem(null);
    }

    setView('selection');
    setSelectedProblem(null);
    setCurrentSession(null);
  };

  const handleContinue = () => {
    // Clear session state when continuing to next arena
    clearSessionState();
    setView('selection');
    setSelectedProblem(null);
    setCurrentSession(null);
    setResult(null);
    loadData();
  };

  if (isLoading && view === 'selection') {
    return (
      <div className="min-h-screen nx-page relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none nx-bg-wires opacity-[0.55]" />
        <div className="absolute inset-0 pointer-events-none nx-bg-dots opacity-[0.2]" />
        <motion.div
          className="nx-stage flex flex-col items-center justify-center min-h-screen gap-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="nx-panel nx-sharp px-8 py-8 text-center">
            <div className="nx-crosshair -top-3 -left-3" />
            <div className="nx-crosshair -bottom-3 -right-3" />
            <div className="w-16 h-16 border-[3px] border-[var(--ink)] bg-[var(--acid-orange)] flex items-center justify-center mx-auto">
              <Swords className="w-8 h-8 text-[var(--ink)]" />
            </div>
            <p className="mt-4 text-[var(--ink-2)] font-semibold">Loading arena...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  // Entry Flow View - 3-minute high-impact entry sequence
  if (view === 'entry' && selectedProblem) {
    return (
      <ArenaEntryFlow
        problem={selectedProblem}
        session={currentSession}
        profile={profile}
        onComplete={handleEntryFlowComplete}
        onSkip={handleSkipEntryFlow}
      />
    );
  }

  if (view === 'battle' && selectedProblem) {
    return (
      <ArenaBattle
        problem={selectedProblem}
        session={currentSession}
        profile={profile}
        onSubmit={handleSubmit}
        onAbandon={handleAbandon}
        entryFlowData={entryFlowData}
      />
    );
  }

  if (view === 'result' && result) {
    return (
      <ArenaResult
        result={result}
        problem={selectedProblem}
        onContinue={handleContinue}
        onRetry={handleContinue}
      />
    );
  }

  const totalXp = (profile?.xp_risk_taker || 0) + (profile?.xp_analyst || 0) +
    (profile?.xp_builder || 0) + (profile?.xp_strategist || 0);

  // Mode Selection Screen
  if (gameMode === null) {
    return (
      <div className="min-h-screen nx-page relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none nx-bg-wires opacity-[0.55]" />
        <div className="absolute inset-0 pointer-events-none nx-bg-dots opacity-[0.2]" />
        <div className="absolute -top-24 -right-24 w-[520px] h-[520px] nx-blob border-[3px] border-[var(--ink)] bg-[var(--acid-orange)] opacity-[0.10]" />
        <div className="absolute -bottom-24 -left-28 w-[560px] h-[560px] nx-blob border-[3px] border-[var(--ink)] bg-[var(--acid-cyan)] opacity-[0.10]" />

        <div className="nx-stage relative pt-24 md:pt-28">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2.5 px-4 py-2 border-2 border-[var(--ink)] bg-[var(--acid-yellow)] mb-5">
              <div className="w-2 h-2 bg-[var(--ink)]" />
              <span className="text-xs font-black tracking-wider uppercase nx-mono">Choose Mode</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-[var(--ink)] mb-3 tracking-[-0.06em]">
              NovaX Arena
            </h1>
            <p className="text-[var(--ink-2)] text-lg">Pilih arena untuk memulai tantangan</p>
          </motion.div>

          {/* Mode Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Solo Mode */}
            <motion.button
              onClick={() => setGameMode('solo')}
              className="group relative nx-panel nx-sharp p-8 text-left transition-transform duration-100 [transition-timing-function:steps(4,end)] hover:-translate-x-1 hover:-translate-y-1"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="relative">
                <div className="nx-crosshair -top-3 -left-3" />
                <div className="nx-crosshair -bottom-3 -right-3" />
                <div className="w-16 h-16 bg-[var(--acid-orange)] border-[3px] border-[var(--ink)] flex items-center justify-center mb-6 transition-transform duration-100 [transition-timing-function:steps(4,end)] group-hover:-translate-x-1 group-hover:-translate-y-1">
                  <User className="w-8 h-8 text-[var(--ink)]" />
                </div>

                <h3 className="text-2xl font-black text-[var(--ink)] mb-3 tracking-[-0.04em]">
                  Solo Arena
                </h3>
                <p className="text-[var(--ink-2)] mb-6 leading-relaxed">
                  Hadapi masalah secara mandiri. Generate problem yang sesuai dengan level dan archetype-mu. Tingkatkan skill step-by-step.
                </p>

                <div className="flex items-center gap-2 text-[var(--ink)] font-semibold">
                  <span>Mulai Solo</span>
                  <Swords className="w-4 h-4 transition-transform duration-100 [transition-timing-function:steps(4,end)] group-hover:translate-x-1" />
                </div>
              </div>
            </motion.button>

            {/* Multiplayer Mode */}
            <motion.button
              onClick={() => setGameMode('multiplayer')}
              className="group relative nx-panel nx-sharp p-8 text-left transition-transform duration-100 [transition-timing-function:steps(4,end)] hover:-translate-x-1 hover:-translate-y-1"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="relative">
                <div className="nx-crosshair -top-3 -left-3" />
                <div className="nx-crosshair -bottom-3 -right-3" />
                <div className="w-16 h-16 bg-[var(--acid-cyan)] border-[3px] border-[var(--ink)] flex items-center justify-center mb-6 transition-transform duration-100 [transition-timing-function:steps(4,end)] group-hover:-translate-x-1 group-hover:-translate-y-1">
                  <Users className="w-8 h-8 text-[var(--ink)]" />
                </div>

                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-2xl font-black text-[var(--ink)] tracking-[-0.04em]">
                    Multiplayer
                  </h3>
                  <span className="px-2.5 py-1 bg-[var(--acid-magenta)]/20 border-2 border-[var(--ink)] text-xs font-black text-[var(--ink)] uppercase tracking-wider nx-mono">
                    Soon
                  </span>
                </div>
                <p className="text-[var(--ink-2)] mb-6 leading-relaxed">
                  Compete atau collaborate dengan player lain dalam real-time battle. Uji skill-mu melawan sesama warrior.
                </p>

                <div className="flex items-center gap-2 text-[var(--ink)] font-semibold">
                  <span>Lihat Preview</span>
                  <Clock className="w-4 h-4 transition-transform duration-100 [transition-timing-function:steps(4,end)] group-hover:translate-x-1" />
                </div>
              </div>
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  // Multiplayer Coming Soon Screen
  if (gameMode === 'multiplayer') {
    return (
      <div className="min-h-screen nx-page relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 pointer-events-none nx-bg-wires opacity-[0.55]" />
        <div className="absolute inset-0 pointer-events-none nx-bg-dots opacity-[0.2]" />
        <div className="absolute -top-24 -left-24 w-[520px] h-[520px] nx-blob border-[3px] border-[var(--ink)] bg-[var(--acid-magenta)] opacity-[0.10]" />
        <div className="absolute -bottom-24 -right-24 w-[520px] h-[520px] nx-blob border-[3px] border-[var(--ink)] bg-[var(--acid-lime)] opacity-[0.10]" />

        <div className="relative z-10 nx-stage max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="nx-panel nx-sharp px-8 py-8">
              <div className="nx-crosshair -top-3 -left-3" />
              <div className="nx-crosshair -bottom-3 -right-3" />
              <div className="relative inline-block mb-8">
                <div className="w-24 h-24 bg-[var(--acid-cyan)] border-[3px] border-[var(--ink)] flex items-center justify-center mx-auto">
                  <Users className="w-12 h-12 text-[var(--ink)]" />
                </div>
                <div className="absolute -bottom-3 -right-3 w-11 h-11 bg-[var(--paper)] border-[3px] border-[var(--ink)] flex items-center justify-center">
                  <Lock className="w-5 h-5 text-[var(--ink)]" />
                </div>
              </div>

              <h2 className="text-4xl md:text-5xl font-black text-[var(--ink)] mb-4 tracking-[-0.06em]">
                Coming <span className="underline decoration-[var(--acid-magenta)] decoration-[4px] underline-offset-4">Soon</span>
              </h2>
              <p className="text-[var(--ink-2)] mb-8 max-w-md mx-auto">
                Mode Multiplayer sedang dalam pengembangan. Bersiaplah untuk berkompetisi dengan player lain!
              </p>

              <div className="grid grid-cols-2 gap-4 mb-10 max-w-sm mx-auto">
                <div className="nx-panel-static nx-sharp p-4">
                  <Swords className="w-6 h-6 text-[var(--ink)] mx-auto mb-2" />
                  <p className="text-sm nx-ink-muted">1v1 Battle</p>
                </div>
                <div className="nx-panel-static nx-sharp p-4">
                  <Users className="w-6 h-6 text-[var(--ink)] mx-auto mb-2" />
                  <p className="text-sm nx-ink-muted">Team Mode</p>
                </div>
                <div className="nx-panel-static nx-sharp p-4">
                  <Trophy className="w-6 h-6 text-[var(--ink)] mx-auto mb-2" />
                  <p className="text-sm nx-ink-muted">Ranked Match</p>
                </div>
                <div className="nx-panel-static nx-sharp p-4">
                  <Zap className="w-6 h-6 text-[var(--ink)] mx-auto mb-2" />
                  <p className="text-sm nx-ink-muted">Quick Match</p>
                </div>
              </div>

              <Button onClick={() => setGameMode(null)} variant="outline" size="lg" className="group">
                <Swords className="w-4 h-4 mr-2 transition-transform duration-100 [transition-timing-function:steps(4,end)] group-hover:-translate-x-1" />
                Kembali ke Mode Selection
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Solo Mode - Original Arena Content
  return (
    <div className="min-h-screen bg-black relative">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-orange-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-violet-600/8 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => setGameMode(null)}
                className="w-10 h-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-gradient-to-r from-orange-500/15 to-red-500/10 border border-orange-500/25">
                <User className="w-3.5 h-3.5 text-orange-400" />
                <span className="text-xs font-semibold text-orange-400 tracking-wider uppercase font-mono">Solo Arena</span>
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              NovaX Arena
            </h1>
            <p className="text-zinc-500">
              Hadapi masalah. Belajar. Naik level.
            </p>
          </motion.div>

          {profile && (
            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-xl px-5 py-3.5 flex items-center gap-3 hover:border-zinc-700 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-orange-500/15 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-white font-mono font-bold text-xl leading-none">
                    Level {profile.current_difficulty}
                  </p>
                  <p className="text-xs text-zinc-500 mt-0.5">Current</p>
                </div>
              </div>
              <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-xl px-5 py-3.5 flex items-center gap-3 hover:border-zinc-700 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-yellow-500/15 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-white font-mono font-bold text-xl leading-none">{totalXp}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">Total XP</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Swipe Tabs - Quick / Standard */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <div className="inline-flex bg-zinc-900 rounded-xl p-1 border border-zinc-800">
            <button
              onClick={() => setArenaTab('quick')}
              className={`relative px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${arenaTab === 'quick'
                  ? 'text-black'
                  : 'text-zinc-400 hover:text-white'
                }`}
            >
              {arenaTab === 'quick' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-lg"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Quick
                <span className="text-xs opacity-70">4-5 min</span>
              </span>
            </button>
            <button
              onClick={() => setArenaTab('standard')}
              className={`relative px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${arenaTab === 'standard'
                  ? 'text-black'
                  : 'text-zinc-400 hover:text-white'
                }`}
            >
              {arenaTab === 'standard' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Standard
                <span className="text-xs opacity-70">15 min</span>
              </span>
            </button>
          </div>
        </motion.div>

        {/* Generate Button for Current Tab */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            onClick={() => generateProblem(arenaTab)}
            disabled={isGenerating || (arenaTab === 'quick' ? !!activeQuickProblem : !!activeStandardProblem)}
            variant={arenaTab === 'quick' ? 'outline' : 'gradient'}
            size="lg"
            className={`group ${arenaTab === 'quick'
              ? (activeQuickProblem ? 'border-zinc-600 text-zinc-500' : 'border-emerald-500/30 hover:border-emerald-500/50 text-emerald-400')
              : ''}`}
          >
            {isGenerating && generatingMode === arenaTab ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (arenaTab === 'quick' ? activeQuickProblem : activeStandardProblem) ? (
              <>
                {arenaTab === 'quick' ? <Zap className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                <span>Selesaikan dulu</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate {arenaTab === 'quick' ? 'Quick' : 'Standard'} Problem</span>
              </>
            )}
          </Button>
        </motion.div>

        {/* Problems Grid - Show based on current tab */}
        <AnimatePresence mode="wait">
          {arenaTab === 'quick' ? (
            <motion.div
              key="quick-problems"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              {quickProblems.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {quickProblems.map((problem, index) => (
                    <motion.div
                      key={problem.id || problem.problem_id}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                    >
                      <ProblemCard problem={problem} onStart={startProblem} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-2xl p-16 text-center">
                  <div className="w-20 h-20 bg-emerald-500/10 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                    <Zap className="w-10 h-10 text-emerald-500" />
                  </div>
                  <p className="text-xl text-zinc-400 mb-2 font-medium">
                    Belum ada Quick problem
                  </p>
                  <p className="text-zinc-600 mb-6 max-w-md mx-auto">
                    Generate problem ringan untuk sesi 4-5 menit
                  </p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="standard-problems"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {standardProblems.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {standardProblems.map((problem, index) => (
                    <motion.div
                      key={problem.id || problem.problem_id}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                    >
                      <ProblemCard problem={problem} onStart={startProblem} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-2xl p-16 text-center">
                  <div className="w-20 h-20 bg-orange-500/10 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                    <Target className="w-10 h-10 text-orange-500" />
                  </div>
                  <p className="text-xl text-zinc-400 mb-2 font-medium">
                    Belum ada Standard problem
                  </p>
                  <p className="text-zinc-600 mb-6 max-w-md mx-auto">
                    Generate problem standar untuk sesi 15 menit
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
