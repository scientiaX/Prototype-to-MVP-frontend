import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '@/api/apiClient';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import CalibrationQuestion from '@/components/calibration/CalibrationQuestion';
import CalibrationResult from '@/components/calibration/CalibrationResult';
import { Loader2, Globe, Flame, Sparkles, Check, User, Lock, Calendar } from 'lucide-react';
import { getTranslation } from '../components/utils/translations';
import { Button } from "@/components/ui/button";
import {
  AGE_GROUPS,
  getAgeGroupFromAge,
  getQuestionsByAgeGroup
} from '@/components/calibration/calibrationQuestionsByAge';

// Age options for selection
const AGE_OPTIONS = [
  { value: 'smp', label: '12-15 tahun (SMP)', emoji: '📚', ageGroup: AGE_GROUPS.SMP },
  { value: 'sma', label: '16-18 tahun (SMA/SMK)', emoji: '🎓', ageGroup: AGE_GROUPS.SMA },
  { value: 'adult', label: '19+ tahun', emoji: '💼', ageGroup: AGE_GROUPS.ADULT }
];

function calculateProfile(answers, ageGroup) {
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

  // Adjust experience depth based on age
  if (ageGroup === AGE_GROUPS.SMP) {
    experience_depth = 0.3;
  } else if (ageGroup === AGE_GROUPS.SMA) {
    experience_depth = 0.5;
  } else {
    experience_depth = 0.7;
  }

  risk_appetite = Math.max(0.1, Math.min(0.9, risk_appetite));
  decision_speed = Math.max(0.1, Math.min(0.9, decision_speed));
  ambiguity_tolerance = Math.max(0.1, Math.min(0.9, ambiguity_tolerance));
  experience_depth = Math.max(0.1, Math.min(0.9, experience_depth));

  const avgScore = (risk_appetite + decision_speed + ambiguity_tolerance + experience_depth) / 4;
  let starting_difficulty = Math.ceil(avgScore * 5);

  // Adjust difficulty by age
  if (ageGroup === AGE_GROUPS.SMP) {
    starting_difficulty = Math.min(3, starting_difficulty);
  } else if (ageGroup === AGE_GROUPS.SMA) {
    starting_difficulty = Math.min(5, starting_difficulty);
  }

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
    age_group: ageGroup,
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
  // Views: auth -> language -> age -> questions -> result
  const [view, setView] = useState('auth');
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [selectedAgeGroup, setSelectedAgeGroup] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [profile, setProfile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [existingProfile, setExistingProfile] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Auth state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const navigate = useNavigate();

  // Get questions based on age group and language
  const CALIBRATION_QUESTIONS = selectedAgeGroup && selectedLanguage
    ? getQuestionsByAgeGroup(selectedAgeGroup, selectedLanguage)
    : [];

  useEffect(() => {
    checkExistingProfile();
  }, []);

  const checkExistingProfile = async () => {
    setIsCheckingAuth(true);
    try {
      const user = await apiClient.auth.me();
      if (user) {
        const profiles = await apiClient.entities.UserProfile.filter({ created_by: user.email });
        if (profiles.length > 0 && profiles[0].calibration_completed) {
          // Already calibrated, go to home
          navigate(createPageUrl('Home'));
          return;
        }
      }
    } catch (error) {
      // Not logged in, continue with auth
    }
    setIsCheckingAuth(false);
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');

    if (!username.trim()) {
      setAuthError('Masukkan nama');
      return;
    }

    // For now, just proceed. In production, this would check/create user
    try {
      // Check if user exists by trying to login or register
      await apiClient.auth.login({ username: username.trim(), password: password || 'default' });

      // Check if profile exists
      const user = await apiClient.auth.me();
      const profiles = await apiClient.entities.UserProfile.filter({ created_by: user.email });

      if (profiles.length > 0 && profiles[0].calibration_completed) {
        navigate(createPageUrl('Home'));
        return;
      }

      // Continue to language selection
      setView('language');
    } catch (error) {
      // New user, continue to calibration
      setView('language');
    }
  };

  const handleLanguageSelect = (lang) => {
    setSelectedLanguage(lang);
    setTimeout(() => {
      setView('age');
    }, 300);
  };

  const handleAgeSelect = (ageOption) => {
    setSelectedAgeGroup(ageOption.ageGroup);
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
    try {
      // Calculate profile locally with age adjustment
      const calculatedProfile = calculateProfile(finalAnswers, selectedAgeGroup);

      // Save to backend
      const savedProfile = await apiClient.api.profiles.calibrate({
        ...finalAnswers,
        age_group: selectedAgeGroup
      }, selectedLanguage);

      setProfile(savedProfile || calculatedProfile);
      setView('result');
    } catch (error) {
      console.error('Calibration error:', error);
      // Use local calculation as fallback
      const calculatedProfile = calculateProfile(finalAnswers, selectedAgeGroup);
      setProfile(calculatedProfile);
      setView('result');
    }
    setIsProcessing(false);
  };

  const handleEnterArena = () => {
    navigate(createPageUrl('Arena'));
  };

  // Loading state
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  // Processing state
  if (isProcessing) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6 relative overflow-hidden">
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

        <motion.div className="relative z-10" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30">
            <Loader2 className="w-10 h-10 text-black animate-spin" />
          </div>
        </motion.div>

        <motion.div className="text-center" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
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
      </div>

      <AnimatePresence mode="wait">
        {/* AUTH VIEW */}
        {view === 'auth' && (
          <motion.div
            key="auth"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="w-full max-w-md relative z-10"
          >
            <div className="text-center mb-10">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.8 }}
                className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-500/30"
              >
                <Flame className="w-10 h-10 text-black" />
              </motion.div>
              <h1 className="text-3xl font-bold text-white mb-2">Selamat Datang</h1>
              <p className="text-zinc-500">Masukkan namamu untuk mulai</p>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Nama kamu"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-4 pl-12 pr-4 text-white placeholder-zinc-600 focus:border-orange-500 focus:outline-none transition-colors"
                  autoFocus
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password (opsional)"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-4 pl-12 pr-4 text-white placeholder-zinc-600 focus:border-orange-500 focus:outline-none transition-colors"
                />
              </div>

              {authError && (
                <p className="text-red-500 text-sm">{authError}</p>
              )}

              <Button type="submit" variant="gradient" className="w-full py-4 text-lg">
                Lanjut
              </Button>
            </form>
          </motion.div>
        )}

        {/* LANGUAGE VIEW */}
        {view === 'language' && (
          <motion.div
            key="language"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="w-full max-w-2xl relative z-10"
          >
            <div className="text-center mb-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.8 }}
                className="w-24 h-24 bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-orange-500/30"
              >
                <Globe className="w-12 h-12 text-black" />
              </motion.div>
              <h1 className="text-4xl md:text-5xl text-white font-bold mb-4">Choose Your Language</h1>
              <p className="text-xl text-zinc-400">Pilih Bahasamu</p>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleLanguageSelect('en')}
                className="group bg-zinc-900/80 border border-zinc-800 hover:border-orange-500/50 rounded-2xl p-8 text-left transition-all"
              >
                <div className="text-5xl mb-5">🇬🇧</div>
                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-orange-400 transition-colors">English</h3>
                <p className="text-zinc-500">Continue in English</p>
              </motion.button>

              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleLanguageSelect('id')}
                className="group bg-zinc-900/80 border border-zinc-800 hover:border-orange-500/50 rounded-2xl p-8 text-left transition-all"
              >
                <div className="text-5xl mb-5">🇮🇩</div>
                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-orange-400 transition-colors">Bahasa Indonesia</h3>
                <p className="text-zinc-500">Lanjutkan dalam Bahasa Indonesia</p>
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* AGE SELECTION VIEW */}
        {view === 'age' && (
          <motion.div
            key="age"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="w-full max-w-xl relative z-10"
          >
            <div className="text-center mb-10">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.8 }}
                className="w-20 h-20 bg-gradient-to-br from-violet-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-violet-500/30"
              >
                <Calendar className="w-10 h-10 text-white" />
              </motion.div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {selectedLanguage === 'en' ? 'How old are you?' : 'Berapa usiamu?'}
              </h1>
              <p className="text-zinc-500">
                {selectedLanguage === 'en'
                  ? 'This helps us personalize your experience'
                  : 'Ini membantu kami menyesuaikan pengalamanmu'}
              </p>
            </div>

            <div className="space-y-4">
              {AGE_OPTIONS.map((option, idx) => (
                <motion.button
                  key={option.value}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ scale: 1.02, x: 8 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAgeSelect(option)}
                  className="w-full group bg-zinc-900/80 border border-zinc-800 hover:border-violet-500/50 rounded-xl p-5 text-left transition-all flex items-center gap-4"
                >
                  <div className="text-3xl">{option.emoji}</div>
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-violet-400 transition-colors">
                      {option.label}
                    </h3>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* RESULT VIEW */}
        {view === 'result' && (
          <CalibrationResult
            key="result"
            profile={profile}
            language={selectedLanguage}
            onEnterArena={handleEnterArena}
          />
        )}

        {/* QUESTIONS VIEW */}
        {view === 'questions' && CALIBRATION_QUESTIONS.length > 0 && CALIBRATION_QUESTIONS[currentQuestion] && (
          <CalibrationQuestion
            key={currentQuestion}
            question={CALIBRATION_QUESTIONS[currentQuestion].question}
            options={CALIBRATION_QUESTIONS[currentQuestion].options}
            onSelect={handleSelect}
            currentIndex={currentQuestion}
            totalQuestions={CALIBRATION_QUESTIONS.length}
            selectedValue={answers[CALIBRATION_QUESTIONS[currentQuestion].id]}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
