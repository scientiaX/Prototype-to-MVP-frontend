import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '@/api/apiClient';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import ProblemCard from '@/components/arena/ProblemCard';
import ArenaBattle from '@/components/arena/ArenaBattle';
import ArenaResult from '@/components/arena/ArenaResult';
import ProblemGeneratorModal from '@/components/arena/ProblemGeneratorModal';
import { Loader2, RefreshCw, Trophy, Zap, Sparkles, Plus } from 'lucide-react';
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
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
          <span className="text-zinc-400">Loading arena...</span>
        </div>
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
    <div className="min-h-screen bg-black">
      <div className="max-w-6xl mx-auto px-6 md:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/15 border border-orange-500/30 mb-4">
              <Sparkles className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-xs font-semibold text-orange-400 tracking-wider uppercase font-mono">Arena Mode</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Problem Arena
            </h1>
            <p className="text-zinc-500">
              Pilih masalah. Hadapi. Naik level.
            </p>
          </div>

          {profile && (
            <div className="flex items-center gap-4">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-3 flex items-center gap-3">
                <Trophy className="w-5 h-5 text-orange-400" />
                <div>
                  <p className="text-white font-mono font-bold text-lg">
                    Level {profile.current_difficulty}
                  </p>
                  <p className="text-xs text-zinc-500">Current</p>
                </div>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-3 flex items-center gap-3">
                <Zap className="w-5 h-5 text-yellow-400" />
                <div>
                  <p className="text-white font-mono font-bold text-lg">{totalXp}</p>
                  <p className="text-xs text-zinc-500">Total XP</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Generate Buttons */}
        <div className="flex flex-wrap gap-3 mb-10">
          <Button
            onClick={() => generateProblem()}
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
                <RefreshCw className="w-4 h-4" />
                Quick Generate
              </>
            )}
          </Button>

          <Button
            onClick={() => setShowGeneratorModal(true)}
            disabled={isGenerating}
            variant="outline"
            size="lg"
          >
            <Plus className="w-4 h-4" />
            Custom Problem
          </Button>
        </div>

        {/* Problems Grid */}
        {problems.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {problems.map((problem, index) => (
                <motion.div
                  key={problem.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
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
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-16 text-center">
            <div className="w-16 h-16 bg-zinc-800 rounded-2xl mx-auto mb-6 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-zinc-500" />
            </div>
            <p className="text-lg text-zinc-400 mb-2">
              Belum ada masalah untuk level-mu
            </p>
            <p className="text-zinc-600 mb-6">
              Generate masalah pertama untuk mulai bertarung
            </p>
            <Button
              onClick={generateProblem}
              disabled={isGenerating}
              variant="gradient"
            >
              Generate Masalah Pertama
            </Button>
          </div>
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
