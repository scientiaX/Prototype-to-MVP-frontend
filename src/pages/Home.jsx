import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import apiClient from '@/api/apiClient';
import { Button } from "@/components/ui/button";
import {
  ChevronRight,
  Target,
  Flame,
  Shield,
  TrendingUp,
  Sparkles,
  Zap,
  Users,
  BarChart3,
  ArrowRight,
  Play
} from 'lucide-react';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [language, setLanguage] = useState('en'); // Default English until onboarding
  const navigate = useNavigate();

  // Typewriter effect state
  const learningWords = ['Real World Simulation', 'Real World Problems', 'Mistakes', 'Decisions', 'Reflection'];
  const learningColors = [
    'from-cyan-400 to-blue-400',
    'from-orange-400 to-amber-400',
    'from-rose-400 to-pink-400',
    'from-violet-400 to-purple-400',
    'from-teal-400 to-cyan-400'
  ];
  const [wordIndex, setWordIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  // Cursor blink effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 350); // 0.7s / 2 = 0.35s for toggle
    return () => clearInterval(cursorInterval);
  }, []);

  // Typewriter effect
  useEffect(() => {
    const currentWord = learningWords[wordIndex];

    if (isTyping) {
      // Typing phase
      if (displayText.length < currentWord.length) {
        const timeout = setTimeout(() => {
          setDisplayText(currentWord.slice(0, displayText.length + 1));
        }, 50); // 50ms per character
        return () => clearTimeout(timeout);
      } else {
        // Done typing, wait for 3 blinks (2.1 seconds)
        const timeout = setTimeout(() => {
          setIsTyping(false);
        }, 2100);
        return () => clearTimeout(timeout);
      }
    } else {
      // Deleting phase
      if (displayText.length > 0) {
        const timeout = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1));
        }, 30); // 30ms per character delete
        return () => clearTimeout(timeout);
      } else {
        // Done deleting, move to next word
        setWordIndex((prev) => (prev + 1) % learningWords.length);
        setIsTyping(true);
      }
    }
  }, [displayText, isTyping, wordIndex]);

  const checkAuth = async () => {
    const authenticated = await apiClient.auth.isAuthenticated();
    setIsAuthenticated(authenticated);

    if (authenticated) {
      const user = await apiClient.auth.me();
      const profiles = await apiClient.entities.UserProfile.filter({ created_by: user.email });
      const userProfile = profiles[0];
      setHasProfile(userProfile?.calibration_completed || false);
      // Set language from profile if exists, otherwise keep English
      if (userProfile?.language) {
        setLanguage(userProfile.language);
      }
    }
  };

  const handleStart = () => {
    if (!isAuthenticated) {
      apiClient.auth.redirectToLogin(createPageUrl('Calibration'));
    } else if (hasProfile) {
      navigate(createPageUrl('Arena'));
    } else {
      navigate(createPageUrl('Calibration'));
    }
  };

  // Content based on language
  const content = {
    en: {
      badge: 'Novax Trial',
      headline1: 'NovaX',
      headline2: 'Arena',
      description: 'Real-world experiential learning',
      descriptionHighlight: 'in your hands.',
      ctaCalibrate: 'Start Calibration',
      ctaArena: 'Enter Arena',
      notLoggedIn: 'more fun than watching, more effective than reading',
      calibrationTime: '5-7 min calibration',
      readyBattle: 'Ready to battle',
      liveStats: 'Live Stats',
      realTimeActivity: 'Real-time arena activity',
      quote: 'No comfort zone. Only growth zone.',
      sectionTitle: 'Confrontation-Based System',
      sectionSubtitle: 'Backed by science. Every element designed for growth through pressure.',
      warning: 'This is not a platform to feel comfortable. If you are looking for validation, this is not the place.',
      features: [
        { title: 'Adaptive Matching', description: 'AI matches problems to your archetype and capability level' },
        { title: 'XP = Difficulty', description: 'Progress based on growth in challenges and real capabilities. not grinding' },
        { title: 'Scar Badges', description: 'Badges prove you fought and grew, not just participated' }
      ]
    },
    id: {
      badge: 'Novax Trial',
      headline1: 'NovaX',
      headline2: 'Arena',
      description: 'Belajar yang sebenarnya terjadi lewat konfrontasi masalah nyata.',
      descriptionHighlight: 'Bukan materi. Bukan teori. Bukan validasi.',
      ctaCalibrate: 'Mulai Kalibrasi',
      ctaArena: 'Masuk Arena',
      notLoggedIn: 'Login dulu',
      calibrationTime: '5-7 menit kalibrasi',
      readyBattle: 'Ready to battle',
      liveStats: 'Live Stats',
      realTimeActivity: 'Real-time arena activity',
      quote: 'No comfort zone. Only growth zone.',
      sectionTitle: 'Confrontation Based System',
      sectionSubtitle: 'Backed by science. Setiap elemen dirancang untuk growth melalui pressure.',
      warning: 'Dibangun oleh pelajar untuk pelajar. Berkompetisi dengan sehat dan disrupsi dunia.',
      features: [
        { title: 'Adaptive Matching', description: 'AI mencocokkan masalah dengan archetype dan level-capability mu' },
        { title: 'XP = Difficulty', description: 'Progression berbasis challenge dan growth capability nyata, bukan grinding' },
        { title: 'Scar Badges', description: 'Badge adalah bukti kamu bertarung dan berkembang, bukan partisipasi' }
      ]
    }
  };

  const t = content[language] || content.en;

  const features = [
    {
      icon: Target,
      title: t.features[0].title,
      description: t.features[0].description,
      gradient: "from-orange-500 to-red-600",
      glow: "shadow-orange-500/30"
    },
    {
      icon: TrendingUp,
      title: t.features[1].title,
      description: t.features[1].description,
      gradient: "from-emerald-500 to-green-600",
      glow: "shadow-emerald-500/30"
    },
    {
      icon: Shield,
      title: t.features[2].title,
      description: t.features[2].description,
      gradient: "from-violet-500 to-purple-600",
      glow: "shadow-violet-500/30"
    }
  ];

  const stats = [
    { value: "247", label: "Active Battles", icon: Zap, color: "text-yellow-400" },
    { value: "7.2", label: "Avg Difficulty", icon: BarChart3, color: "text-orange-400" },
    { value: "1.2k", label: "Warriors", icon: Users, color: "text-cyan-400" }
  ];

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Primary Glow */}
        <motion.div
          className="absolute top-[-30%] right-[-15%] w-[900px] h-[900px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(249, 115, 22, 0.15) 0%, rgba(234, 88, 12, 0.08) 40%, transparent 70%)'
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.8, 1, 0.8]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Secondary Glow */}
        <motion.div
          className="absolute bottom-[-40%] left-[-20%] w-[700px] h-[700px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 60%)'
          }}
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.6, 0.8, 0.6]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />

        {/* Dot Pattern Background */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(rgba(255,255,255,0.12) 2px, transparent 2px)`,
            backgroundSize: '28px 28px'
          }}
        />

        {/* Floating particles */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-orange-400/40 rounded-full"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + (i % 3) * 20}%`
            }}
            animate={{
              y: [-20, 20, -20],
              opacity: [0.2, 0.6, 0.2]
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="max-w-6xl mx-auto px-6 md:px-8">
          <div className="min-h-[65vh] flex flex-col pt-8 pb-16">
            {/* Top Row - Headline and Learning From Card */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-8">
              {/* Left - Main Content */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="flex-1 max-w-xl"
              >
                {/* Badge */}
                <motion.div
                  className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-gradient-to-r from-orange-500/15 to-red-500/10 border border-orange-500/25 mb-8"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                  <span className="text-xs font-semibold text-orange-400 tracking-wider uppercase font-mono">Novax Trial</span>
                </motion.div>

                {/* Headline */}
                <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-[0.95] tracking-tight">
                  <span className="text-white">NovaX</span>{' '}
                  <span className="text-gradient-fire">Arena</span>
                </h1>

                {/* Description */}
                <p className="text-lg md:text-xl text-zinc-400 mb-10 max-w-lg leading-relaxed">
                  {t.description}{' '}
                  <span className="text-orange-400 font-medium">{t.descriptionHighlight}</span>
                </p>

                {/* CTA */}
                <div className="flex flex-wrap items-center gap-4">
                  <Button
                    onClick={handleStart}
                    variant="gradient"
                    size="xl"
                    className="group"
                  >
                    {hasProfile ? t.ctaArena : t.ctaCalibrate}
                    <ArrowRight className="w-5 h-5 ml-1 group-hover:translate-x-1.5 transition-transform duration-300" />
                  </Button>

                  <button
                    onClick={() => document.getElementById('demo-section')?.scrollIntoView({ behavior: 'smooth' })}
                    className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors px-4 py-2.5 rounded-xl border border-zinc-700/50 hover:border-zinc-600"
                  >
                    <Play className="w-4 h-4" />
                    <span className="text-sm font-medium">Watch Demo</span>
                  </button>

                  {isAuthenticated && (
                    <div className="flex items-center gap-2.5 text-sm text-zinc-500 bg-zinc-900/50 px-4 py-2.5 rounded-xl border border-zinc-800/50">
                      <span className="text-lg">
                        {hasProfile ? '⚔️' : '🎯'}
                      </span>
                      <span>
                        {hasProfile ? t.readyBattle : t.calibrationTime}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Bottom Row - Learning From Typewriter */}
            <motion.div
              className="mt-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
            >
              {/* Typewriter Input Visual */}
              <div className="flex items-center justify-center w-full px-2">
                <div className="relative inline-flex items-center px-4 py-2 md:px-6 md:py-3 bg-transparent border border-zinc-700/50 rounded-full w-full md:w-auto justify-center">
                  <span className="text-zinc-500 text-sm md:text-lg mr-1 md:mr-2">Learning From</span>
                  <div className="relative">
                    <span className={`text-sm md:text-lg font-medium bg-gradient-to-r ${learningColors[wordIndex]} bg-clip-text text-transparent`}>
                      {displayText}
                    </span>
                    <span className={`text-orange-500 font-light ${showCursor ? 'opacity-100' : 'opacity-0'}`}>|</span>
                  </div>
                </div>
              </div>

              {/* 3-Step Journey - vertical on mobile, horizontal on desktop */}
              <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-sm md:text-base justify-center mt-6">
                <span className="text-zinc-300">
                  <span className="text-violet-400 font-medium">Write</span> your dreams
                </span>
                <span className="text-zinc-600 hidden md:inline">→</span>
                <span className="text-zinc-600 md:hidden">↓</span>
                <span className="text-zinc-300">
                  <span className="text-orange-400 font-medium">Face</span> problems
                </span>
                <span className="text-zinc-600 hidden md:inline">→</span>
                <span className="text-zinc-600 md:hidden">↓</span>
                <span className="text-zinc-300">
                  <span className="text-emerald-400 font-medium">Build</span> capabilities
                </span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Demo Section */}
        <section id="demo-section" className="max-w-6xl mx-auto px-6 md:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            {/* Headline */}
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Real problems are <span className="text-red-400">expensive</span>. NovaX is <span className="text-emerald-400">affordable</span>.
              </h2>
              <p className="text-zinc-500 max-w-2xl mx-auto">
                Experience real-world challenges without real-world consequences. Learn faster, fail safely, grow stronger.
              </p>
            </div>

            {/* Content Grid */}
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              {/* Left - Video */}
              <div className="relative rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 aspect-video">
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                  title="NovaX Arena Demo"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              {/* Right - Explanation */}
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                    <Target className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg mb-1">Real Mistakes, No Real Cost</h3>
                    <p className="text-zinc-400 text-sm">Making mistakes in the real world costs money, time, and reputation. Here, you learn from mistakes for free.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
                    <Zap className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg mb-1">AI-Powered Pressure</h3>
                    <p className="text-zinc-400 text-sm">Our AI adapts to your skill level and pushes you just enough to grow without overwhelming you.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg mb-1">Measurable Growth</h3>
                    <p className="text-zinc-400 text-sm">Track your progress with XP, capability badges and artifacts that prove your real improvement.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Punchline */}
            <motion.div
              className="mt-16 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-2xl md:text-4xl font-bold text-white">
                Get proof of your <span className="text-gradient-fire">real capabilities</span>, not grades.
              </p>
              <p className="mt-4 text-zinc-400 text-sm">
                <span className="text-cyan-400 font-medium">More fun</span> than watching, <span className="text-violet-400 font-medium">more effective</span> than reading.
              </p>
            </motion.div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="max-w-6xl mx-auto px-6 md:px-8 py-24">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            {/* Section Header */}
            <div className="text-center mb-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl md:text-5xl text-white font-bold mb-4">
                  Confrontation Based <span className="text-gradient-magic">System</span>
                </h2>
                <p className="text-zinc-500 max-w-xl mx-auto text-lg">
                  Backed by science. Each element is designed for growth through pressure..
                </p>
              </motion.div>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              {features.map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, duration: 0.5 }}
                  className="group relative"
                >
                  {/* Card Hover Glow */}
                  <div className={`absolute -inset-0.5 bg-gradient-to-r ${feature.gradient} rounded-2xl blur-lg opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />

                  <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl p-8 hover:border-zinc-700 transition-all duration-300 h-full">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-lg ${feature.glow} group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="w-7 h-7 text-black" />
                    </div>

                    <h3 className="text-white font-bold text-xl mb-3">
                      {feature.title}
                    </h3>

                    <p className="text-zinc-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Warning Banner */}
            <motion.div
              className="mt-20"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="relative overflow-hidden bg-gradient-to-r from-zinc-900 via-zinc-900/95 to-zinc-900 border border-red-500/20 rounded-2xl p-8 text-center max-w-3xl mx-auto">
                {/* Red glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-red-500/20 rounded-full blur-3xl" />

                <div className="relative z-10">
                  <p className="text-lg text-zinc-400">
                    <span className="text-red-400 font-semibold">⚠️ Important:</span>{' '}
                    Built by students for students. Competing healthily and<span className="text-white font-medium"> disrupting the world.</span>
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </section>
      </div>
    </div>
  );
}
