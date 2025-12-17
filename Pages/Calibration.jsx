import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import CalibrationQuestion from '@/components/calibration/CalibrationQuestion';
import CalibrationResult from '@/components/calibration/CalibrationResult';
import { Loader2 } from 'lucide-react';

const CALIBRATION_QUESTIONS = [
  {
    id: 'domain',
    question: "Bidang apa yang paling menarik perhatianmu saat ini?",
    options: [
      { value: 'business', label: 'Bisnis & Entrepreneurship' },
      { value: 'tech', label: 'Teknologi & Product' },
      { value: 'creative', label: 'Kreatif & Design' },
      { value: 'leadership', label: 'Leadership & Management' }
    ]
  },
  {
    id: 'aspiration',
    question: "Dalam 2 tahun ke depan, kamu ingin dikenal sebagai apa?",
    options: [
      { value: 'founder', label: 'Founder yang membangun sesuatu dari nol' },
      { value: 'expert', label: 'Expert yang menguasai bidangnya' },
      { value: 'leader', label: 'Leader yang menggerakkan tim besar' },
      { value: 'innovator', label: 'Innovator yang mengubah cara kerja' }
    ]
  },
  {
    id: 'thinking_style',
    question: "Bagaimana kamu biasanya mengambil keputusan?",
    options: [
      { value: 'fast', label: 'Cepat - Ambil keputusan, koreksi nanti' },
      { value: 'accurate', label: 'Akurat - Kumpulkan data dulu, baru putuskan' },
      { value: 'explorative', label: 'Eksploratif - Coba banyak opsi sebelum commit' }
    ]
  },
  {
    id: 'stuck_experience',
    question: "Kapan terakhir kamu merasa stuck dan tidak bisa maju?",
    options: [
      { value: 'decision', label: 'Saat harus memilih antara dua pilihan sulit' },
      { value: 'execution', label: 'Saat tahu harus apa tapi tidak bisa eksekusi' },
      { value: 'direction', label: 'Saat tidak tahu arah yang benar' },
      { value: 'resource', label: 'Saat kekurangan resource atau dukungan' }
    ]
  },
  {
    id: 'avoided_risk',
    question: "Risiko apa yang paling sering kamu hindari?",
    options: [
      { value: 'financial', label: 'Risiko finansial - kehilangan uang' },
      { value: 'reputation', label: 'Risiko reputasi - terlihat gagal' },
      { value: 'time', label: 'Risiko waktu - membuang waktu untuk hal salah' },
      { value: 'relationship', label: 'Risiko relasi - mengecewakan orang lain' }
    ]
  },
  {
    id: 'regret',
    question: "Penyesalan mana yang lebih sering kamu rasakan?",
    options: [
      { value: 'too_slow', label: 'Terlalu lambat mengambil peluang' },
      { value: 'too_reckless', label: 'Terlalu nekat tanpa pertimbangan matang' }
    ]
  }
];

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

  useEffect(() => {
    checkExistingProfile();
  }, []);

  const checkExistingProfile = async () => {
    const user = await base44.auth.me();
    const profiles = await base44.entities.UserProfile.filter({ created_by: user.email });
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
    const calculatedProfile = {
      ...calculateProfile(finalAnswers),
      language: selectedLanguage
    };
    
    const user = await base44.auth.me();
    const existingProfiles = await base44.entities.UserProfile.filter({ created_by: user.email });
    
    if (existingProfiles.length > 0) {
      await base44.entities.UserProfile.update(existingProfiles[0].id, calculatedProfile);
    } else {
      await base44.entities.UserProfile.create(calculatedProfile);
    }
    
    setProfile(calculatedProfile);
    setView('result');
    setIsProcessing(false);
  };

  const handleEnterArena = () => {
    navigate(createPageUrl('Arena'));
  };

  if (existingProfile) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Kamu sudah ter-kalibrasi.</h2>
          <p className="text-zinc-400 mb-6">Langsung masuk ke arena atau lihat progress kamu.</p>
          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => navigate(createPageUrl('Arena'))}
              className="bg-orange-500 hover:bg-orange-600 text-black font-bold px-6 py-3 rounded-lg"
            >
              Masuk Arena
            </button>
            <button 
              onClick={() => navigate(createPageUrl('Profile'))}
              className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold px-6 py-3 rounded-lg"
            >
              Lihat Profile
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
        <p className="text-zinc-400 ml-4">Mengkalibrasi profil...</p>
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
            onEnterArena={handleEnterArena} 
          />
        ) : (
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
