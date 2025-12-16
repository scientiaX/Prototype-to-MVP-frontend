import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import ProblemCard from '@/components/arena/ProblemCard';
import ArenaBattle from '@/components/arena/ArenaBattle';
import ArenaResult from '@/components/arena/ArenaResult';
import ProblemGeneratorModal from '@/components/arena/ProblemGeneratorModal';
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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const user = await base44.auth.me();
    
    // Check if calibrated
    const profiles = await base44.entities.UserProfile.filter({ created_by: user.email });
    if (profiles.length === 0 || !profiles[0].calibration_completed) {
      navigate(createPageUrl('Calibration'));
      return;
    }
    
    setProfile(profiles[0]);
    
    // Load available problems for user's difficulty range
    const allProblems = await base44.entities.Problem.filter({ is_active: true });
    const relevantProblems = allProblems.filter(p => 
      p.difficulty >= profiles[0].current_difficulty - 1 && 
      p.difficulty <= profiles[0].current_difficulty + 2
    );
    
    setProblems(relevantProblems);
    setIsLoading(false);
  };

  const generateProblem = async (customization = null) => {
    setIsGenerating(true);
    
    let prompt;
    
    if (customization) {
      // Custom generation with user parameters
      const domainText = customization.domains.join(', ');
      const problemTypeText = customization.problemType 
        ? `Focus on ${customization.problemType} scenario.` 
        : '';
      const contextText = customization.customContext 
        ? `\n\nUser context: ${customization.customContext}` 
        : '';
      const constraintsText = customization.specificConstraints
        ? `\n\nSpecific constraints to include: ${customization.specificConstraints}`
        : '';
      
      prompt = `Generate a challenging real-world problem for someone with:
- Profile archetype: ${profile.primary_archetype}
- Current level: ${profile.current_difficulty}
- Risk appetite: ${profile.risk_appetite}
- Thinking style: ${profile.thinking_style}

USER CUSTOMIZATION:
- Domains: ${domainText}
- Target difficulty: ${customization.minDifficulty}-${customization.maxDifficulty}
- Time limit: ${customization.timeLimit} minutes
${problemTypeText}${contextText}${constraintsText}

Create a REAL-WORLD problem that:
1. Has incomplete data
2. Requires a decisive action (not just analysis)
3. Has clear trade-offs that hurt
4. Cannot be solved with a "safe" answer
5. Reflects the user's specified domains and constraints
6. Is challenging but solvable within the time limit

The difficulty should be between ${customization.minDifficulty} and ${customization.maxDifficulty}.
If multiple domains are specified, create a problem that intersects them (e.g., tech + business = technical product decision with business impact).

CRITICAL: This is for a platform that confronts users with hard choices. Don't soften the problem. Make it realistic and uncomfortable.

Respond in Indonesian.`;
    } else {
      // Quick generation based on profile
      prompt = `Generate a business/strategy problem for someone with:
- Domain: ${profile.domain}
- Archetype: ${profile.primary_archetype}
- Current difficulty level: ${profile.current_difficulty}
- Risk appetite: ${profile.risk_appetite}
- Thinking style: ${profile.thinking_style}

Create a REAL-WORLD problem that:
1. Has incomplete data
2. Requires a decisive action
3. Has clear trade-offs
4. Cannot be solved with a "safe" answer

The problem should be solvable in 20-30 minutes.

Respond in Indonesian.`;
    }

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          problem_id: { type: "string" },
          title: { type: "string" },
          context: { type: "string" },
          objective: { type: "string" },
          constraints: { type: "array", items: { type: "string" } },
          difficulty: { type: "integer" },
          level_up_criteria: { type: "array", items: { type: "string" } },
          domain: { type: "string" },
          archetype_focus: { type: "string" },
          estimated_time_minutes: { type: "integer" }
        }
      }
    });

    // Save to database
    const newProblem = await base44.entities.Problem.create({
      ...response,
      is_active: true
    });
    
    setProblems(prev => [newProblem, ...prev]);
    setIsGenerating(false);
  };

  const startProblem = async (problem) => {
    setSelectedProblem(problem);
    
    // Create arena session
    const session = await base44.entities.ArenaSession.create({
      problem_id: problem.problem_id,
      status: 'in_progress',
      started_at: new Date().toISOString(),
      difficulty_at_start: profile.current_difficulty,
      archetype_at_start: profile.primary_archetype
    });
    
    setCurrentSession(session);
    setView('battle');
  };

  const handleSubmit = async (solution, timeElapsed) => {
    setIsLoading(true);
    
    // AI Evaluation
    const evaluationPrompt = `Kamu adalah mentor yang menguji keputusan. Evaluasi solusi berikut:

MASALAH:
${selectedProblem.title}
${selectedProblem.context}

OBJECTIVE:
${selectedProblem.objective}

CONSTRAINTS:
${selectedProblem.constraints?.join(', ')}

KRITERIA NAIK LEVEL:
${selectedProblem.level_up_criteria?.join(', ')}

SOLUSI USER:
${solution}

WAKTU: ${Math.floor(timeElapsed / 60)} menit

Evaluasi dengan tajam dan singkat. Tentukan:
1. Apakah user menghadapi risiko inti atau bermain aman?
2. Apakah trade-off dijelaskan eksplisit?
3. Apakah ada keputusan nyata atau hanya deskripsi?

Berikan evaluasi yang konfrontatif, bukan memuji.`;

    const evaluation = await base44.integrations.Core.InvokeLLM({
      prompt: evaluationPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          evaluation: { type: "string" },
          insight: { type: "string" },
          criteria_met: { type: "array", items: { type: "string" } },
          level_up_achieved: { type: "boolean" },
          quality_score: { type: "number" },
          xp_risk_taker: { type: "integer" },
          xp_analyst: { type: "integer" },
          xp_builder: { type: "integer" },
          xp_strategist: { type: "integer" }
        }
      }
    });

    // Calculate XP based on difficulty jump
    let totalXp = 0;
    const xpBreakdown = {
      risk_taker: evaluation.xp_risk_taker || 0,
      analyst: evaluation.xp_analyst || 0,
      builder: evaluation.xp_builder || 0,
      strategist: evaluation.xp_strategist || 0
    };
    
    // XP only increases if difficulty increased
    if (selectedProblem.difficulty > profile.current_difficulty && evaluation.level_up_achieved) {
      const difficultyDelta = selectedProblem.difficulty - profile.current_difficulty;
      const multiplier = evaluation.quality_score || 1;
      totalXp = Math.round(difficultyDelta * multiplier * 10);
      
      // Distribute XP to archetypes
      Object.keys(xpBreakdown).forEach(key => {
        xpBreakdown[key] = Math.round(xpBreakdown[key] * multiplier);
      });
    }

    // Update session
    await base44.entities.ArenaSession.update(currentSession.id, {
      status: 'evaluated',
      submitted_at: new Date().toISOString(),
      solution_text: solution,
      xp_earned: totalXp,
      xp_breakdown: xpBreakdown,
      level_up_achieved: evaluation.level_up_achieved,
      criteria_met: evaluation.criteria_met,
      ai_evaluation: evaluation.evaluation,
      ai_insight: evaluation.insight,
      time_spent_seconds: timeElapsed
    });

    // Update profile
    const newProfile = {
      ...profile,
      xp_risk_taker: (profile.xp_risk_taker || 0) + (xpBreakdown.risk_taker || 0),
      xp_analyst: (profile.xp_analyst || 0) + (xpBreakdown.analyst || 0),
      xp_builder: (profile.xp_builder || 0) + (xpBreakdown.builder || 0),
      xp_strategist: (profile.xp_strategist || 0) + (xpBreakdown.strategist || 0),
      total_arenas_completed: (profile.total_arenas_completed || 0) + 1
    };
    
    if (evaluation.level_up_achieved && selectedProblem.difficulty > profile.current_difficulty) {
      newProfile.current_difficulty = selectedProblem.difficulty;
      newProfile.highest_difficulty_conquered = Math.max(
        profile.highest_difficulty_conquered || 0, 
        selectedProblem.difficulty
      );
      
      // Create achievement
      await base44.entities.Achievement.create({
        achievement_id: `ACH-${Date.now()}`,
        title: `Conquered Level ${selectedProblem.difficulty}`,
        description: `Menyelesaikan ${selectedProblem.title} di difficulty ${selectedProblem.difficulty}`,
        archetype_at_achievement: profile.primary_archetype,
        difficulty_level: selectedProblem.difficulty,
        problem_id: selectedProblem.problem_id,
        achieved_at: new Date().toISOString(),
        badge_type: 'difficulty_jump',
        is_highest: selectedProblem.difficulty > (profile.highest_difficulty_conquered || 0)
      });
      
      // Create artifact
      await base44.entities.Artifact.create({
        problem_id: selectedProblem.problem_id,
        problem_title: selectedProblem.title,
        difficulty: selectedProblem.difficulty,
        archetype_role: profile.primary_archetype,
        solution_summary: solution.substring(0, 500),
        insight: evaluation.insight,
        level_up_verified: true,
        arena_session_id: currentSession.id,
        conquered_at: new Date().toISOString()
      });
    }
    
    // Update archetype based on highest XP
    const xpValues = {
      risk_taker: newProfile.xp_risk_taker,
      analyst: newProfile.xp_analyst,
      builder: newProfile.xp_builder,
      strategist: newProfile.xp_strategist
    };
    newProfile.primary_archetype = Object.entries(xpValues).reduce((a, b) => 
      xpValues[a[0]] > xpValues[b[0]] ? a : b
    )[0];
    
    await base44.entities.UserProfile.update(profile.id, newProfile);
    setProfile(newProfile);

    setResult({
      xp_earned: totalXp,
      xp_breakdown: xpBreakdown,
      level_up_achieved: evaluation.level_up_achieved,
      criteria_met: evaluation.criteria_met,
      ai_evaluation: evaluation.evaluation,
      ai_insight: evaluation.insight,
      time_spent_seconds: timeElapsed
    });
    
    setView('result');
    setIsLoading(false);
  };

  const handleAbandon = async () => {
    if (currentSession) {
      await base44.entities.ArenaSession.update(currentSession.id, {
        status: 'abandoned'
      });
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
            <h1 className="text-3xl font-bold text-white">Problem Arena</h1>
            <p className="text-zinc-500 mt-1">Pilih masalah. Hadapi. Naik level.</p>
          </div>
          
          {profile && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 rounded-lg">
                <Trophy className="w-4 h-4 text-orange-500" />
                <span className="text-white font-mono">Level {profile.current_difficulty}</span>
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
                Generating...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Quick Generate
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
            Custom Generate
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
            <p className="text-zinc-500 mb-4">Belum ada masalah tersedia untuk levelmu.</p>
            <Button
              onClick={generateProblem}
              disabled={isGenerating}
              className="bg-orange-500 hover:bg-orange-600 text-black font-bold"
            >
              Generate Masalah Pertama
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
