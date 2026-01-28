import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '@/api/apiClient';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import CalibrationQuestion from '@/components/calibration/CalibrationQuestion';
import OnboardingArena from '@/components/calibration/OnboardingArena';
import {
  AGE_GROUPS,
  getQuestionsByAgeGroup
} from '@/components/calibration/calibrationQuestionsByAge';

// Age options for selection
const IconChevron = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round" {...props}>
    <path d="M14 6l-6 6 6 6" />
  </svg>
);

const IconGlobe = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18" />
    <path d="M12 3a15 15 0 0 1 0 18" />
    <path d="M12 3a15 15 0 0 0 0 18" />
  </svg>
);

const IconSpark = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round" {...props}>
    <path d="M12 3l2.5 5.5L20 11l-5.5 2.5L12 19l-2.5-5.5L4 11l5.5-2.5L12 3z" />
  </svg>
);

const IconSquare = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round" {...props}>
    <rect x="5" y="5" width="14" height="14" />
  </svg>
);

const IconTriangle = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round" {...props}>
    <path d="M12 4l8 16H4z" />
  </svg>
);

const IconHex = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round" {...props}>
    <path d="M7 3h10l5 9-5 9H7l-5-9 5-9z" />
  </svg>
);

const IconSpinner = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="round" {...props}>
    <path d="M12 3a9 9 0 0 1 9 9" />
  </svg>
);

const AGE_OPTIONS = [
  { value: 'smp', label: '12-15 tahun (SMP)', icon: IconSquare, ageGroup: AGE_GROUPS.SMP },
  { value: 'sma', label: '16-18 tahun (SMA/SMK)', icon: IconTriangle, ageGroup: AGE_GROUPS.SMA },
  { value: 'adult', label: '19+ tahun', icon: IconHex, ageGroup: AGE_GROUPS.ADULT }
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
    navigate(createPageUrl('Arena'), { state: { profileOverride: profile || null } });
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
      <div className="min-h-screen nx-page flex items-center justify-center">
        <IconSpinner className="w-8 h-8 text-[var(--acid-orange)] animate-spin" />
      </div>
    );
  }

  const steps = ['language', 'age', 'domain', 'onboarding_arena'];
  const currentStepIndex = Math.max(0, steps.indexOf(view));

  return (
    <div className="min-h-screen nx-page relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none nx-bg-wires opacity-[0.75]" />
      <div className="absolute inset-0 pointer-events-none nx-bg-dots opacity-[0.22]" />

      <div className="nx-stage relative flex items-center justify-center min-h-screen">
        <div className="w-full max-w-5xl grid md:grid-cols-[56px_1fr] gap-6 items-start">
          <div className="hidden md:flex flex-col items-center pt-6">
            <div className="w-[2px] flex-1 bg-[rgba(231,234,240,0.10)]" />
            <div className="flex flex-col items-center gap-5 py-5">
              {steps.map((s, idx) => {
                const isActive = idx === currentStepIndex;
                const isDone = idx < currentStepIndex;
                return (
                  <div
                    key={s}
                    className={
                      isActive
                        ? 'w-3 h-3 bg-[var(--acid-lime)]'
                        : isDone
                          ? 'w-2.5 h-2.5 bg-[rgba(231,234,240,0.24)]'
                          : 'w-2.5 h-2.5 bg-[rgba(231,234,240,0.12)]'
                    }
                  />
                );
              })}
            </div>
            <div className="w-[2px] flex-1 bg-[rgba(231,234,240,0.10)]" />
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
                        className="w-24 h-24 nx-sharp border border-[rgba(231,234,240,0.22)] bg-[rgba(231,234,240,0.03)]"
                      />
                      <div className="absolute inset-0 nx-sharp border border-[rgba(231,234,240,0.10)] bg-[rgba(231,234,240,0.02)]" />
                    </div>
                    <motion.div
                      className="absolute -top-1 -right-1 w-8 h-8 bg-[rgba(231,234,240,0.06)] nx-sharp border border-[rgba(231,234,240,0.18)] flex items-center justify-center"
                      animate={{
                        scale: [1, 1.15, 1],
                        opacity: [0.7, 1, 0.7]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <IconSpark className="w-4 h-4 text-[var(--ink)]" />
                    </motion.div>
                  </motion.div>
                  <h1 className="text-4xl md:text-5xl text-[var(--ink)] font-bold mb-4">Choose Your Language</h1>
                  <p className="text-xl text-[var(--ink-2)]">Pilih Bahasamu</p>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleLanguageSelect('en')}
                    className="group relative nx-panel nx-sharp p-8 text-left transition-colors hover:border-[rgba(51,209,122,0.35)] hover:bg-[rgba(231,234,240,0.02)]"
                  >
                    <div className="w-12 h-12 border border-[rgba(230,237,243,0.2)] bg-[rgba(230,237,243,0.04)] flex items-center justify-center mb-5">
                      <IconGlobe className="w-6 h-6 text-[var(--ink)]" />
                    </div>
                    <h3 className="text-2xl font-bold text-[var(--ink)] mb-2">English</h3>
                    <p className="text-[var(--ink-2)]">Continue in English</p>
                  </motion.button>

                  <motion.button
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleLanguageSelect('id')}
                    className="group relative nx-panel nx-sharp p-8 text-left transition-colors hover:border-[rgba(51,209,122,0.35)] hover:bg-[rgba(231,234,240,0.02)]"
                  >
                    <div className="w-12 h-12 border border-[rgba(230,237,243,0.2)] bg-[rgba(230,237,243,0.04)] flex items-center justify-center mb-5">
                      <IconGlobe className="w-6 h-6 text-[var(--ink)]" />
                    </div>
                    <h3 className="text-2xl font-bold text-[var(--ink)] mb-2">Bahasa Indonesia</h3>
                    <p className="text-[var(--ink-2)]">Lanjutkan dalam Bahasa Indonesia</p>
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
                <button
                  onClick={() => setView('language')}
                  className="flex items-center gap-1 text-[var(--ink-2)] hover:text-[var(--ink)] transition-colors text-sm font-medium mb-6"
                >
                  <IconChevron className="w-4 h-4" />
                  {selectedLanguage === 'en' ? 'Back' : 'Kembali'}
                </button>

                <div className="text-center mb-10">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", duration: 0.8 }}
                    className="w-20 h-20 bg-[rgba(231,234,240,0.04)] nx-sharp border border-[rgba(231,234,240,0.18)] flex items-center justify-center mx-auto mb-6"
                  >
                    <IconSpark className="w-10 h-10 text-[var(--ink)]" />
                  </motion.div>
                  <h1 className="text-3xl font-bold text-[var(--ink)] mb-2">
                    {selectedLanguage === 'en' ? 'How old are you?' : 'Berapa usiamu?'}
                  </h1>
                  <p className="text-[var(--ink-2)]">
                    {selectedLanguage === 'en'
                      ? 'This helps us personalize your experience'
                      : 'Ini membantu kami menyesuaikan pengalamanmu'}
                  </p>
                </div>

                <div className="space-y-4">
                  {AGE_OPTIONS.map((option, idx) => {
                    const AgeIcon = option.icon;
                    return (
                      <motion.button
                        key={option.value}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        whileHover={{ scale: 1.02, x: 8 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleAgeSelect(option)}
                        className="w-full group nx-panel nx-sharp p-5 text-left transition-colors flex items-center gap-4 hover:border-[rgba(51,209,122,0.35)] hover:bg-[rgba(231,234,240,0.02)]"
                      >
                        <div className="w-12 h-12 border border-[rgba(231,234,240,0.18)] bg-[rgba(231,234,240,0.04)] flex items-center justify-center">
                          <AgeIcon className="w-6 h-6 text-[var(--ink)]" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-[var(--ink)] transition-colors">
                            {option.label}
                          </h3>
                        </div>
                      </motion.button>
                    );
                  })}
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
                  language={selectedLanguage}
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
      </div>
    </div>
  );
}
