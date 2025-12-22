import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '@/api/apiClient';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import ProblemCard from '@/components/arena/ProblemCard';
import ArenaBattle from '@/components/arena/ArenaBattle';
import ArenaResult from '@/components/arena/ArenaResult';
import ProblemGeneratorModal from '@/components/arena/ProblemGeneratorModal';
import { getTranslation } from '@/components/utils/translations';
import { Loader2, RefreshCw, Trophy, Zap, Settings } from 'lucide-react';
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
  const [view, setView] = useState('selection'); // selection, battle, result
  const navigate = useNavigate();

  const t = getTranslation(profile?.language || 'en');

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
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
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

  return (
    <div className="min-h-screen bg-black p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">{t.arena.title}</h1>
            <p className="text-zinc-500 mt-1">{t.arena.subtitle}</p>
          </div>

          {profile && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 rounded-lg">
                <Trophy className="w-4 h-4 text-orange-500" />
                <span className="text-white font-mono">{t.arena.level} {profile.current_difficulty}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 rounded-lg">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span className="text-white font-mono">
                  {(profile.xp_risk_taker || 0) + (profile.xp_analyst || 0) +
                    (profile.xp_builder || 0) + (profile.xp_strategist || 0)} XP
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Generate buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <Button
            onClick={() => generateProblem()}
            disabled={isGenerating}
            className="bg-orange-500 hover:bg-orange-600 text-black font-bold flex-1 sm:flex-initial"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t.arena.generating}
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                {t.arena.quickGenerate}
              </>
            )}
          </Button>

          <Button
            onClick={() => setShowGeneratorModal(true)}
            disabled={isGenerating}
            variant="outline"
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 flex-1 sm:flex-initial"
          >
            <Settings className="w-4 h-4 mr-2" />
            {t.arena.customGenerate}
          </Button>
        </div>

        {/* Problems grid */}
        {problems.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {problems.map((problem, index) => (
                <motion.div
                  key={problem.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
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
          <div className="text-center py-16">
            <p className="text-zinc-500 mb-4">{t.arena.noProblem}</p>
            <Button
              onClick={generateProblem}
              disabled={isGenerating}
              className="bg-orange-500 hover:bg-orange-600 text-black font-bold"
            >
              {t.arena.generateFirst}
            </Button>
          </div>
        )}
      </div>

      {/* Problem Generator Modal */}
      <ProblemGeneratorModal
        isOpen={showGeneratorModal}
        onClose={() => setShowGeneratorModal(false)}
        onGenerate={generateProblem}
        profile={profile}
      />
    </div>
  );
}
