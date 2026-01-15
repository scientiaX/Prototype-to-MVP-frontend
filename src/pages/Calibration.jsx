import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '@/api/apiClient';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import CalibrationQuestion from '@/components/calibration/CalibrationQuestion';
import OnboardingArena from '@/components/calibration/OnboardingArena';
import { Loader2, Sparkles, ChevronLeft, Calendar } from 'lucide-react';
import {
  AGE_GROUPS,
  getQuestionsByAgeGroup
} from '@/components/calibration/calibrationQuestionsByAge';

// Age options for selection
const AGE_OPTIONS = [
  { value: 'smp', label: '12-15 tahun (SMP)', emoji: '📚', ageGroup: AGE_GROUPS.SMP },
  { value: 'sma', label: '16-18 tahun (SMA/SMK)', emoji: '🎓', ageGroup: AGE_GROUPS.SMA },
  { value: 'adult', label: '19+ tahun', emoji: '💼', ageGroup: AGE_GROUPS.ADULT }
];

export default function Calibration() {
  // Views: language -> age -> domain -> onboarding_arena
  const [view, setView] = useState('language');
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [selectedAgeGroup, setSelectedAgeGroup] = useState(null);
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const navigate = useNavigate();

  // Get domain question only (first question from calibration questions)
  const getDomainQuestion = () => {
    if (!selectedAgeGroup || !selectedLanguage) return null;
    const questions = getQuestionsByAgeGroup(selectedAgeGroup, selectedLanguage, {});
    return questions.find(q => q.id === 'domain') || questions[0];
  };

  const domainQuestion = getDomainQuestion();

  useEffect(() => {
    checkExistingProfile();
  }, []);

  const checkExistingProfile = async () => {
    setIsCheckingAuth(true);
    try {
      const user = await apiClient.auth.me();
      if (user) {
        // User is logged in - check if they have a profile
        try {
          const profiles = await apiClient.entities.UserProfile.filter({ created_by: user.email });
          if (profiles.length > 0 && profiles[0].calibration_completed) {
            // Already calibrated, go to home
            navigate(createPageUrl('Home'));
            return;
          }
        } catch (profileError) {
          // Profile not found (404) is OK for new users - they need to calibrate
          console.log('No profile found, proceeding with calibration');
        }
        // User is logged in but hasn't completed calibration - continue to language selection
      } else {
        // Not logged in, redirect to login page
        navigate('/login');
        return;
      }
    } catch (error) {
      // Not logged in (auth.me failed), redirect to login page
      console.log('Auth check failed, redirecting to login:', error.message);
      navigate('/login');
      return;
    }
    setIsCheckingAuth(false);
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
      setView('domain');
    }, 300);
  };

  const handleDomainSelect = (value) => {
    setSelectedDomain(value);
    setTimeout(() => {
      setView('onboarding_arena');
    }, 300);
  };

  const handleOnboardingComplete = (profile) => {
    // Profile has been saved by OnboardingArena, go straight to arena
    navigate(createPageUrl('Arena'));
  };

  const handleBackFromDomain = () => {
    setView('age');
  };

  const handleBackFromArena = () => {
    setView('domain');
  };

  // Loading state
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
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
                className="relative inline-block mb-8"
              >
                <div className="relative">
                  <img
                    src="/favicon.png"
                    alt="NovaX"
                    className="w-24 h-24 rounded-3xl shadow-lg shadow-orange-500/30"
                  />
                  <div className="absolute inset-0 rounded-3xl bg-orange-500/20 blur-xl opacity-60" />
                </div>
                <motion.div
                  className="absolute -top-1 -right-1 w-8 h-8 bg-violet-500/20 rounded-full flex items-center justify-center"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="w-4 h-4 text-violet-400" />
                </motion.div>
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
            {/* Back button */}
            <button
              onClick={() => setView('language')}
              className="flex items-center gap-1 text-zinc-500 hover:text-orange-400 transition-colors text-sm font-medium mb-6"
            >
              <ChevronLeft className="w-4 h-4" />
              {selectedLanguage === 'en' ? 'Back' : 'Kembali'}
            </button>

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

        {/* DOMAIN SELECTION VIEW */}
        {view === 'domain' && domainQuestion && (
          <motion.div
            key="domain"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="w-full max-w-xl relative z-10"
          >
            <CalibrationQuestion
              question={domainQuestion.question}
              options={domainQuestion.options}
              onSelect={handleDomainSelect}
              onBack={handleBackFromDomain}
              canGoBack={true}
              currentIndex={0}
              totalQuestions={1}
              selectedValue={selectedDomain}
              hasTextInput={false}
            />
          </motion.div>
        )}

        {/* ONBOARDING ARENA VIEW */}
        {view === 'onboarding_arena' && (
          <OnboardingArena
            key="arena"
            domain={selectedDomain}
            ageGroup={selectedAgeGroup}
            language={selectedLanguage}
            onComplete={handleOnboardingComplete}
            onBack={handleBackFromArena}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
