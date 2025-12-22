import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '@/api/apiClient';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import CalibrationQuestion from '@/components/calibration/CalibrationQuestion';
import CalibrationResult from '@/components/calibration/CalibrationResult';
import { Loader2 } from 'lucide-react';
import { getTranslation } from '../components/utils/translations';

// Mapping: Domain -> Relevant Aspirations
const ASPIRATION_BY_DOMAIN = {
  business: ['founder', 'ceo', 'investor', 'freelancer'],
  tech: ['expert', 'product_lead', 'cto', 'innovator'],
  creative: ['creator', 'artist', 'expert', 'founder'],
  leadership: ['leader', 'cxo', 'founder', 'strategist']
};

// Mapping: Domain + Aspiration -> Relevant Stuck Experiences
const STUCK_BY_CONTEXT = {
  // Business contexts
  'business_founder': ['decision', 'scaling', 'resource', 'delegation'],
  'business_ceo': ['delegation', 'scaling', 'decision', 'overwhelm'],
  'business_investor': ['decision', 'direction', 'confidence', 'overwhelm'],
  'business_freelancer': ['resource', 'confidence', 'motivation', 'direction'],
  // Tech contexts
  'tech_expert': ['direction', 'execution', 'perfectionism', 'overwhelm'],
  'tech_product_lead': ['decision', 'execution', 'delegation', 'scaling'],
  'tech_cto': ['delegation', 'scaling', 'direction', 'overwhelm'],
  'tech_innovator': ['direction', 'confidence', 'resource', 'execution'],
  // Creative contexts
  'creative_creator': ['motivation', 'confidence', 'direction', 'resource'],
  'creative_artist': ['motivation', 'confidence', 'perfectionism', 'direction'],
  'creative_expert': ['direction', 'perfectionism', 'execution', 'motivation'],
  'creative_founder': ['resource', 'confidence', 'scaling', 'decision'],
  // Leadership contexts
  'leadership_leader': ['delegation', 'decision', 'execution', 'motivation'],
  'leadership_cxo': ['delegation', 'scaling', 'decision', 'overwhelm'],
  'leadership_founder': ['decision', 'scaling', 'resource', 'delegation'],
  'leadership_strategist': ['direction', 'decision', 'execution', 'overwhelm']
};

// Mapping: Domain + Aspiration -> Relevant Avoided Risks
const RISK_BY_CONTEXT = {
  // Business contexts
  'business_founder': ['financial', 'time', 'opportunity', 'reputation'],
  'business_ceo': ['reputation', 'career', 'financial', 'relationship'],
  'business_investor': ['financial', 'opportunity', 'time', 'reputation'],
  'business_freelancer': ['financial', 'time', 'reputation', 'disappointment'],
  // Tech contexts
  'tech_expert': ['reputation', 'time', 'career', 'disappointment'],
  'tech_product_lead': ['time', 'reputation', 'career', 'relationship'],
  'tech_cto': ['reputation', 'career', 'relationship', 'health'],
  'tech_innovator': ['time', 'reputation', 'opportunity', 'financial'],
  // Creative contexts
  'creative_creator': ['reputation', 'disappointment', 'time', 'financial'],
  'creative_artist': ['disappointment', 'reputation', 'financial', 'time'],
  'creative_expert': ['reputation', 'time', 'disappointment', 'career'],
  'creative_founder': ['financial', 'reputation', 'time', 'opportunity'],
  // Leadership contexts
  'leadership_leader': ['relationship', 'reputation', 'career', 'disappointment'],
  'leadership_cxo': ['reputation', 'career', 'relationship', 'health'],
  'leadership_founder': ['financial', 'reputation', 'relationship', 'opportunity'],
  'leadership_strategist': ['time', 'opportunity', 'reputation', 'career']
};

// Default fallbacks
const DEFAULT_STUCK = ['decision', 'execution', 'direction', 'resource'];
const DEFAULT_RISK = ['financial', 'reputation', 'time', 'relationship'];

// Dynamic question generator
const getDynamicQuestion = (questionIndex, answers, lang) => {
  const t = getTranslation(lang);
  const questions = t.calibration.questions;

  const questionOrder = ['domain', 'aspiration', 'thinking_style', 'stuck_experience', 'avoided_risk', 'regret'];
  const questionId = questionOrder[questionIndex];

  switch (questionId) {
    case 'domain':
      return {
        id: 'domain',
        question: questions.domain.question,
        options: Object.entries(questions.domain.options).map(([value, label]) => ({ value, label }))
      };

    case 'aspiration': {
      const domain = answers.domain || 'business';
      const relevantAspirations = ASPIRATION_BY_DOMAIN[domain] || ASPIRATION_BY_DOMAIN.business;
      return {
        id: 'aspiration',
        question: questions.aspiration.question,
        options: relevantAspirations.map(value => ({
          value,
          label: questions.aspiration.options[value]
        }))
      };
    }

    case 'thinking_style':
      return {
        id: 'thinking_style',
        question: questions.thinking_style.question,
        options: Object.entries(questions.thinking_style.options).map(([value, label]) => ({ value, label }))
      };

    case 'stuck_experience': {
      const contextKey = `${answers.domain}_${answers.aspiration}`;
      const relevantStuck = STUCK_BY_CONTEXT[contextKey] || DEFAULT_STUCK;
      return {
        id: 'stuck_experience',
        question: questions.stuck_experience.question,
        options: relevantStuck.map(value => ({
          value,
          label: questions.stuck_experience.options[value]
        }))
      };
    }

    case 'avoided_risk': {
      const contextKey = `${answers.domain}_${answers.aspiration}`;
      const relevantRisks = RISK_BY_CONTEXT[contextKey] || DEFAULT_RISK;
      return {
        id: 'avoided_risk',
        question: questions.avoided_risk.question,
        options: relevantRisks.map(value => ({
          value,
          label: questions.avoided_risk.options[value]
        }))
      };
    }

    case 'regret':
      return {
        id: 'regret',
        question: questions.regret.question,
        options: Object.entries(questions.regret.options).map(([value, label]) => ({ value, label }))
      };

    default:
      return null;
  }
};

const TOTAL_QUESTIONS = 6;

function calculateProfile(answers) {
  let risk_appetite = 0.5;
  let decision_speed = 0.5;
  let ambiguity_tolerance = 0.5;
  let experience_depth = 0.5;

  // Thinking style affects decision speed
  if (answers.thinking_style === 'fast') {
    decision_speed = 0.8;
    risk_appetite += 0.1;
  } else if (answers.thinking_style === 'accurate') {
    decision_speed = 0.3;
    ambiguity_tolerance -= 0.1;
  } else if (answers.thinking_style === 'explorative') {
    ambiguity_tolerance = 0.7;
    decision_speed = 0.5;
  }

  // Regret pattern affects risk appetite
  if (answers.regret === 'too_slow') {
    risk_appetite -= 0.15;
  } else {
    risk_appetite += 0.15;
  }

  // Avoided risk affects profile
  if (answers.avoided_risk === 'financial') {
    risk_appetite -= 0.1;
  } else if (answers.avoided_risk === 'reputation') {
    ambiguity_tolerance -= 0.1;
  } else if (answers.avoided_risk === 'time') {
    decision_speed += 0.1;
  }

  // Aspiration affects experience depth
  if (answers.aspiration === 'expert') {
    experience_depth = 0.7;
  } else if (answers.aspiration === 'founder') {
    risk_appetite += 0.1;
  }

  // Normalize values
  risk_appetite = Math.max(0.1, Math.min(0.9, risk_appetite));
  decision_speed = Math.max(0.1, Math.min(0.9, decision_speed));
  ambiguity_tolerance = Math.max(0.1, Math.min(0.9, ambiguity_tolerance));
  experience_depth = Math.max(0.1, Math.min(0.9, experience_depth));

  // Calculate starting difficulty (1-5) based on overall scores
  const avgScore = (risk_appetite + decision_speed + ambiguity_tolerance + experience_depth) / 4;
  let starting_difficulty = Math.ceil(avgScore * 5);
  starting_difficulty = Math.max(1, Math.min(5, starting_difficulty));

  // Determine archetype
  let primary_archetype = 'analyst';
  const scores = {
    risk_taker: risk_appetite + (decision_speed * 0.5),
    analyst: (1 - risk_appetite) + experience_depth,
    builder: decision_speed + (1 - ambiguity_tolerance) * 0.5,
    strategist: ambiguity_tolerance + experience_depth
  };

  primary_archetype = Object.entries(scores).reduce((a, b) =>
    scores[a[0]] > scores[b[0]] ? a : b
  )[0];

  return {
    risk_appetite,
    decision_speed,
    ambiguity_tolerance,
    experience_depth,
    current_difficulty: starting_difficulty,
    primary_archetype,
    xp_risk_taker: 0,
    xp_analyst: 0,
    xp_builder: 0,
    xp_strategist: 0,
    total_arenas_completed: 0,
    highest_difficulty_conquered: 0,
    calibration_completed: true,
    domain: answers.domain,
    aspiration: answers.aspiration,
    thinking_style: answers.thinking_style,
    last_stuck_experience: answers.stuck_experience,
    avoided_risk: answers.avoided_risk,
    common_regret: answers.regret
  };
}

export default function Calibration() {
  const [view, setView] = useState('language'); // 'language', 'questions', 'result'
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [profile, setProfile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [existingProfile, setExistingProfile] = useState(null);
  const navigate = useNavigate();

  // Get current question dynamically based on answers
  const currentQuestionData = selectedLanguage
    ? getDynamicQuestion(currentQuestion, answers, selectedLanguage)
    : null;

  useEffect(() => {
    checkExistingProfile();
  }, []);

  const checkExistingProfile = async () => {
    const user = await apiClient.auth.me();
    const profiles = await apiClient.entities.UserProfile.filter({ created_by: user.email });
    if (profiles.length > 0 && profiles[0].calibration_completed) {
      setExistingProfile(profiles[0]);
    }
  };

  const handleLanguageSelect = (lang) => {
    setSelectedLanguage(lang);
    setTimeout(() => {
      setView('questions');
    }, 300);
  };

  const handleSelect = (value) => {
    const questionId = currentQuestionData?.id;
    if (!questionId) return;

    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);

    setTimeout(() => {
      if (currentQuestion < TOTAL_QUESTIONS - 1) {
        setCurrentQuestion(prev => prev + 1);
      } else {
        processCalibration(newAnswers);
      }
    }, 300);
  };

  const processCalibration = async (finalAnswers) => {
    setIsProcessing(true);

    const profile = await apiClient.api.profiles.calibrate(finalAnswers, selectedLanguage);

    setProfile(profile);
    setView('result');
    setIsProcessing(false);
  };

  const handleEnterArena = () => {
    navigate(createPageUrl('Arena'));
  };

  if (existingProfile) {
    const t = getTranslation(existingProfile.language);
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            {existingProfile.language === 'en' ? 'You are already calibrated.' : 'Kamu sudah ter-kalibrasi.'}
          </h2>
          <p className="text-zinc-400 mb-6">
            {existingProfile.language === 'en'
              ? 'Go straight to the arena or check your progress.'
              : 'Langsung masuk ke arena atau lihat progress kamu.'}
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate(createPageUrl('Arena'))}
              className="bg-orange-500 hover:bg-orange-600 text-black font-bold px-6 py-3 rounded-lg"
            >
              {t.arena.title}
            </button>
            <button
              onClick={() => navigate(createPageUrl('Profile'))}
              className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold px-6 py-3 rounded-lg"
            >
              {t.profile.title}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="w-12 h-12 text-orange-500" />
        </motion.div>
        <p className="text-zinc-400 ml-4">
          {selectedLanguage === 'en' ? 'Calibrating profile...' : 'Mengkalibrasi profil...'}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-red-500/5 pointer-events-none" />

      <AnimatePresence mode="wait">
        {view === 'language' ? (
          <motion.div
            key="language"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-2xl relative z-10"
          >
            <div className="text-center mb-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-20 h-20 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6"
              >
                <span className="text-4xl">🌐</span>
              </motion.div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Choose Your Language
              </h1>
              <p className="text-zinc-400 text-lg">
                Pilih Bahasamu
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleLanguageSelect('en')}
                className="bg-zinc-900 hover:bg-zinc-800 border-2 border-zinc-800 hover:border-orange-500 rounded-xl p-8 transition-all text-left"
              >
                <div className="text-4xl mb-4">🇬🇧</div>
                <h3 className="text-2xl font-bold text-white mb-2">English</h3>
                <p className="text-zinc-500 text-sm">Continue in English</p>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleLanguageSelect('id')}
                className="bg-zinc-900 hover:bg-zinc-800 border-2 border-zinc-800 hover:border-orange-500 rounded-xl p-8 transition-all text-left"
              >
                <div className="text-4xl mb-4">🇮🇩</div>
                <h3 className="text-2xl font-bold text-white mb-2">Bahasa Indonesia</h3>
                <p className="text-zinc-500 text-sm">Lanjutkan dalam Bahasa Indonesia</p>
              </motion.button>
            </div>
          </motion.div>
        ) : view === 'result' ? (
          <CalibrationResult
            key="result"
            profile={profile}
            language={selectedLanguage}
            onEnterArena={handleEnterArena}
          />
        ) : currentQuestionData ? (
          <CalibrationQuestion
            key={`${currentQuestion}-${answers.domain || ''}-${answers.aspiration || ''}`}
            question={currentQuestionData.question}
            options={currentQuestionData.options}
            onSelect={handleSelect}
            currentIndex={currentQuestion}
            totalQuestions={TOTAL_QUESTIONS}
            selectedValue={answers[currentQuestionData.id]}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
