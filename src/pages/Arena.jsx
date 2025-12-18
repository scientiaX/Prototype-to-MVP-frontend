import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '@/api/apiClient';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import ProblemCard from '@/components/arena/ProblemCard';
import ArenaBattle from '@/components/arena/ArenaBattle';
import ArenaResult from '@/components/arena/ArenaResult';
import ProblemGeneratorModal from '@/components/arena/ProblemGeneratorModal';
import { Loader2, RefreshCw, Trophy, Zap, Sparkles, Plus, Swords, Target } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function Arena() {
  const [profile, setProfile] = useState(null);
  const [problems, setProblems] = useState([]);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [currentSession, setCurrentSession] = useState(null);
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showGeneratorModal, setShowGeneratorModal] = useState(false);
  const [view, setView] = useState('selection');
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const user = await apiClient.auth.me();

    const profiles = await apiClient.entities.UserProfile.filter({ created_by: user.email });
    if (profiles.length === 0 || !profiles[0].calibration_completed) {
      navigate(createPageUrl('Calibration'));
      return;
    }

    setProfile(profiles[0]);

    const allProblems = await apiClient.api.problems.list({ is_active: true });
    const relevantProblems = allProblems.filter(p =>
      p.difficulty >= profiles[0].current_difficulty - 1 &&
      p.difficulty <= profiles[0].current_difficulty + 2
    );

    setProblems(relevantProblems);
    setIsLoading(false);
  };

  const generateProblem = async (customization = null) => {
    setIsGenerating(true);
    const newProblem = await apiClient.api.problems.generate(profile, customization);
    setProblems(prev => [newProblem, ...prev]);
    setIsGenerating(false);
  };

  const startProblem = async (problem) => {
    setSelectedProblem(problem);
    const session = await apiClient.api.arena.start(problem.problem_id);
    setCurrentSession(session);
    setView('battle');
  };

  const handleSubmit = async (solution, timeElapsed) => {
    setIsLoading(true);
    const response = await apiClient.api.arena.submit(currentSession._id, solution, timeElapsed);
    setProfile(response.updated_profile);
    setResult({
      xp_earned: response.xp_earned,
      xp_breakdown: response.xp_breakdown,
      level_up_achieved: response.evaluation.level_up_achieved,
      criteria_met: response.evaluation.criteria_met,
      ai_evaluation: response.evaluation.evaluation,
      ai_insight: response.evaluation.insight,
      time_spent_seconds: timeElapsed
    });
    setView('result');
    setIsLoading(false);
  };

  const handleAbandon = async () => {
    if (currentSession) {
      await apiClient.api.arena.abandon(currentSession._id);
    }
    setView('selection');
    setSelectedProblem(null);
    setCurrentSession(null);
  };

  const handleContinue = () => {
    setView('selection');
    setSelectedProblem(null);
    setCurrentSession(null);
    setResult(null);
    loadData();
  };

  if (isLoading && view === 'selection') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
              <Swords className="w-8 h-8 text-black" />
            </div>
            <motion.div
              className="absolute inset-0 rounded-2xl bg-orange-500/30"
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
          <p className="text-zinc-400 font-medium">Loading arena...</p>
        </motion.div>
      </div>
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
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-gradient-to-r from-orange-500/15 to-red-500/10 border border-orange-500/25 mb-4">
              <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
              <span className="text-xs font-semibold text-orange-400 tracking-wider uppercase font-mono">Arena Mode</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Problem Arena
            </h1>
            <p className="text-zinc-500">
              Pilih masalah. Hadapi. Naik level.
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

        {/* Generate Buttons */}
        <motion.div
          className="flex flex-wrap gap-3 mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            onClick={() => generateProblem(null)}
            disabled={isGenerating}
            variant="gradient"
            size="lg"
            className="group"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                Quick Generate
              </>
            )}
          </Button>

          <Button
            onClick={() => setShowGeneratorModal(true)}
            disabled={isGenerating}
            variant="outline"
            size="lg"
            className="group"
          >
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
            Custom Problem
          </Button>
        </motion.div>

        {/* Problems Grid */}
        {problems.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {problems.map((problem, index) => (
                <motion.div
                  key={problem.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  layout
                >
                  <ProblemCard
                    problem={problem}
                    onStart={startProblem}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div
            className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-2xl p-16 text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="w-20 h-20 bg-zinc-800 rounded-2xl mx-auto mb-6 flex items-center justify-center">
              <Target className="w-10 h-10 text-zinc-600" />
            </div>
            <p className="text-xl text-zinc-400 mb-2 font-medium">
              Belum ada masalah untuk level-mu
            </p>
            <p className="text-zinc-600 mb-8 max-w-md mx-auto">
              Generate masalah pertama untuk mulai bertarung dan menguji kemampuanmu
            </p>
            <Button
              onClick={() => generateProblem(null)}
              disabled={isGenerating}
              variant="gradient"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Masalah Pertama
                </>
              )}
            </Button>
          </motion.div>
        )}
      </div>

      <ProblemGeneratorModal
        isOpen={showGeneratorModal}
        onClose={() => setShowGeneratorModal(false)}
        onGenerate={generateProblem}
        profile={profile}
      />
    </div>
  );
}
