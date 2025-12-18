import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '@/api/apiClient';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import CalibrationQuestion from '@/components/calibration/CalibrationQuestion';
import CalibrationResult from '@/components/calibration/CalibrationResult';
import { Loader2, Globe, Flame, Sparkles, Check } from 'lucide-react';
import { getTranslation } from '../components/utils/translations';
import { Button } from "@/components/ui/button";

const getCalibrationQuestions = (lang) => {
  const t = getTranslation(lang);
  return [
    {
      id: 'domain',
      question: t.calibration.questions.domain.question,
      options: [
        { value: 'business', label: t.calibration.questions.domain.options.business },
        { value: 'tech', label: t.calibration.questions.domain.options.tech },
        { value: 'creative', label: t.calibration.questions.domain.options.creative },
        { value: 'leadership', label: t.calibration.questions.domain.options.leadership }
      ]
    },
    {
      id: 'aspiration',
      question: t.calibration.questions.aspiration.question,
      options: [
        { value: 'founder', label: t.calibration.questions.aspiration.options.founder },
        { value: 'expert', label: t.calibration.questions.aspiration.options.expert },
        { value: 'leader', label: t.calibration.questions.aspiration.options.leader },
        { value: 'innovator', label: t.calibration.questions.aspiration.options.innovator }
      ]
    },
    {
      id: 'thinking_style',
      question: t.calibration.questions.thinking_style.question,
      options: [
        { value: 'fast', label: t.calibration.questions.thinking_style.options.fast },
        { value: 'accurate', label: t.calibration.questions.thinking_style.options.accurate },
        { value: 'explorative', label: t.calibration.questions.thinking_style.options.explorative }
      ]
    },
    {
      id: 'stuck_experience',
      question: t.calibration.questions.stuck_experience.question,
      options: [
        { value: 'decision', label: t.calibration.questions.stuck_experience.options.decision },
        { value: 'execution', label: t.calibration.questions.stuck_experience.options.execution },
        { value: 'direction', label: t.calibration.questions.stuck_experience.options.direction },
        { value: 'resource', label: t.calibration.questions.stuck_experience.options.resource }
      ]
    },
    {
      id: 'avoided_risk',
      question: t.calibration.questions.avoided_risk.question,
      options: [
        { value: 'financial', label: t.calibration.questions.avoided_risk.options.financial },
        { value: 'reputation', label: t.calibration.questions.avoided_risk.options.reputation },
        { value: 'time', label: t.calibration.questions.avoided_risk.options.time },
        { value: 'relationship', label: t.calibration.questions.avoided_risk.options.relationship }
      ]
    },
    {
      id: 'regret',
      question: t.calibration.questions.regret.question,
      options: [
        { value: 'too_slow', label: t.calibration.questions.regret.options.too_slow },
        { value: 'too_reckless', label: t.calibration.questions.regret.options.too_reckless }
      ]
    }
  ];
};

function calculateProfile(answers) {
  let risk_appetite = 0.5;
  let decision_speed = 0.5;
  let ambiguity_tolerance = 0.5;
  let experience_depth = 0.5;

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

  if (answers.regret === 'too_slow') {
    risk_appetite -= 0.15;
  } else {
    risk_appetite += 0.15;
  }

  if (answers.avoided_risk === 'financial') {
    risk_appetite -= 0.1;
  } else if (answers.avoided_risk === 'reputation') {
    ambiguity_tolerance -= 0.1;
  } else if (answers.avoided_risk === 'time') {
    decision_speed += 0.1;
  }

  if (answers.aspiration === 'expert') {
    experience_depth = 0.7;
  } else if (answers.aspiration === 'founder') {
    risk_appetite += 0.1;
  }

  risk_appetite = Math.max(0.1, Math.min(0.9, risk_appetite));
  decision_speed = Math.max(0.1, Math.min(0.9, decision_speed));
  ambiguity_tolerance = Math.max(0.1, Math.min(0.9, ambiguity_tolerance));
  experience_depth = Math.max(0.1, Math.min(0.9, experience_depth));

  const avgScore = (risk_appetite + decision_speed + ambiguity_tolerance + experience_depth) / 4;
  let starting_difficulty = Math.ceil(avgScore * 5);
  starting_difficulty = Math.max(1, Math.min(5, starting_difficulty));

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
  const [view, setView] = useState('language');
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [profile, setProfile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [existingProfile, setExistingProfile] = useState(null);
  const navigate = useNavigate();

  const CALIBRATION_QUESTIONS = selectedLanguage ? getCalibrationQuestions(selectedLanguage) : [];

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
    const questionId = CALIBRATION_QUESTIONS[currentQuestion].id;
    setAnswers(prev => ({ ...prev, [questionId]: value }));

    setTimeout(() => {
      if (currentQuestion < CALIBRATION_QUESTIONS.length - 1) {
        setCurrentQuestion(prev => prev + 1);
      } else {
        processCalibration({ ...answers, [questionId]: value });
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
      <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(249, 115, 22, 0.1) 0%, transparent 60%)'
            }}
            animate={{ scale: [1, 1.1, 1], opacity: [0.6, 0.8, 0.6] }}
            transition={{ duration: 6, repeat: Infinity }}
          />
        </div>

        <motion.div
          className="relative z-10 text-center max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="relative inline-block mb-8">
            <motion.div
              className="w-24 h-24 bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-orange-500/30"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", duration: 0.8 }}
            >
              <Flame className="w-12 h-12 text-black" />
            </motion.div>
            <motion.div
              className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Check className="w-5 h-5 text-white" />
            </motion.div>
          </div>

          <h2 className="text-3xl font-bold text-white mb-4">
            {existingProfile.language === 'en' ? 'Already Calibrated' : 'Sudah Terkalibrasi'}
          </h2>
          <p className="text-zinc-400 mb-10 text-lg">
            {existingProfile.language === 'en'
              ? 'Your warrior profile is ready. Enter the arena!'
              : 'Profil petarungmu sudah siap. Masuk ke arena!'}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => navigate(createPageUrl('Arena'))}
              variant="gradient"
              size="xl"
            >
              {t.arena.title}
            </Button>
            <Button
              onClick={() => navigate(createPageUrl('Profile'))}
              variant="outline"
              size="lg"
            >
              {t.profile.title}
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6 relative overflow-hidden">
        {/* Background pulse */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(249, 115, 22, 0.15) 0%, transparent 60%)'
            }}
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>

        <motion.div
          className="relative z-10"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30">
            <Loader2 className="w-10 h-10 text-black animate-spin" />
          </div>
        </motion.div>

        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-xl text-white font-medium mb-2">
            {selectedLanguage === 'en' ? 'Calibrating...' : 'Mengkalibrasi...'}
          </p>
          <p className="text-zinc-500">
            {selectedLanguage === 'en' ? 'Building your warrior profile' : 'Membangun profil petarungmu'}
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(249, 115, 22, 0.08) 0%, rgba(234, 88, 12, 0.04) 40%, transparent 70%)'
          }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.6, 0.9, 0.6] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-[20%] right-[15%] w-[300px] h-[300px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.06) 0%, transparent 60%)'
          }}
          animate={{ y: [-10, 10, -10] }}
          transition={{ duration: 5, repeat: Infinity }}
        />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), 
                             linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      <AnimatePresence mode="wait">
        {view === 'language' ? (
          <motion.div
            key="language"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-2xl relative z-10"
          >
            <div className="text-center mb-12">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", duration: 0.8 }}
                className="relative inline-block mb-8"
              >
                <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-orange-500/30">
                  <Globe className="w-12 h-12 text-black" />
                </div>
                <motion.div
                  className="absolute -top-1 -right-1 w-6 h-6 bg-violet-500/20 rounded-full flex items-center justify-center"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="w-3 h-3 text-violet-400" />
                </motion.div>
              </motion.div>

              <h1 className="text-4xl md:text-5xl text-white font-bold mb-4">
                Choose Your Language
              </h1>
              <p className="text-xl text-zinc-400">
                Pilih Bahasamu
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleLanguageSelect('en')}
                className="group bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 hover:border-orange-500/50 rounded-2xl p-8 text-left transition-all duration-300"
              >
                <div className="text-5xl mb-5">🇬🇧</div>
                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-orange-400 transition-colors">English</h3>
                <p className="text-zinc-500">Continue in English</p>
              </motion.button>

              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleLanguageSelect('id')}
                className="group bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 hover:border-orange-500/50 rounded-2xl p-8 text-left transition-all duration-300"
              >
                <div className="text-5xl mb-5">🇮🇩</div>
                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-orange-400 transition-colors">Bahasa Indonesia</h3>
                <p className="text-zinc-500">Lanjutkan dalam Bahasa Indonesia</p>
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
        ) : CALIBRATION_QUESTIONS.length > 0 && CALIBRATION_QUESTIONS[currentQuestion] ? (
          <CalibrationQuestion
            key={currentQuestion}
            question={CALIBRATION_QUESTIONS[currentQuestion].question}
            options={CALIBRATION_QUESTIONS[currentQuestion].options}
            onSelect={handleSelect}
            currentIndex={currentQuestion}
            totalQuestions={CALIBRATION_QUESTIONS.length}
            selectedValue={answers[CALIBRATION_QUESTIONS[currentQuestion].id]}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
