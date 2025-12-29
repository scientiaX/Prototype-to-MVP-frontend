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
  ArrowRight
} from 'lucide-react';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [language, setLanguage] = useState('en'); // Default English until onboarding
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

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
      description: 'Real learning happens through confronting real problems.',
      descriptionHighlight: 'Not materials. Not theory. Not validation.',
      ctaCalibrate: 'Start Calibration',
      ctaArena: 'Enter Arena',
      notLoggedIn: 'Login first',
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
        { title: 'XP = Difficulty', description: 'Progression based on real challenge and growth, not grinding' },
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

        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), 
                             linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
            backgroundSize: '80px 80px'
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
          <div className="min-h-[85vh] flex items-center py-20">
            <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center w-full">
              {/* Left - Content */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
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
                  <span className="text-white block">NovaX</span>
                  <span className="text-gradient-fire block">Arena</span>
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

                  <div className="flex items-center gap-2.5 text-sm text-zinc-500 bg-zinc-900/50 px-4 py-2.5 rounded-xl border border-zinc-800/50">
                    <span className="text-lg">
                      {isAuthenticated
                        ? hasProfile ? '⚔️' : '🎯'
                        : '🔑'}
                    </span>
                    <span>
                      {isAuthenticated
                        ? hasProfile ? t.readyBattle : t.calibrationTime
                        : t.notLoggedIn}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Right - Learning From Slider Card */}
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="lg:justify-self-end w-full max-w-md"
              >
                <div className="relative group">
                  {/* Card Glow Effect */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500" />

                  <div className="relative bg-zinc-900/90 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-8 overflow-hidden">
                    {/* Decorative Corner */}
                    <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-orange-500/10 to-transparent rounded-full blur-2xl" />

                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-white font-bold text-xl mb-1">Learning From</h3>
                          <p className="text-sm text-zinc-500">How warriors grow stronger</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center">
                          <Sparkles className="w-5 h-5 text-violet-400" />
                        </div>
                      </div>

                      {/* Auto-sliding Cards */}
                      <div className="relative h-[200px] overflow-hidden rounded-xl">
                        <style>
                          {`
                            @keyframes slideUp {
                              0%, 16% { transform: translateY(0); opacity: 1; }
                              20%, 36% { transform: translateY(-100%); opacity: 1; }
                              40%, 56% { transform: translateY(-200%); opacity: 1; }
                              60%, 76% { transform: translateY(-300%); opacity: 1; }
                              80%, 96% { transform: translateY(-400%); opacity: 1; }
                              100% { transform: translateY(-500%); opacity: 1; }
                            }
                            .slide-container {
                              animation: slideUp 15s ease-in-out infinite;
                            }
                          `}
                        </style>
                        <div className="slide-container">
                          {/* Slide 1 - Real World Simulation */}
                          <div className="h-[200px] p-5 bg-gradient-to-br from-cyan-500/10 to-blue-500/5 border border-cyan-500/20 rounded-xl flex flex-col justify-center">
                            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center mb-4">
                              <Target className="w-6 h-6 text-cyan-400" />
                            </div>
                            <h4 className="text-white font-semibold text-lg mb-2">Real World Simulation</h4>
                            <p className="text-zinc-400 text-sm leading-relaxed">Menghadapi skenario nyata yang terjadi di industri dan bisnis sesungguhnya.</p>
                          </div>

                          {/* Slide 2 - Real World Problem */}
                          <div className="h-[200px] p-5 bg-gradient-to-br from-orange-500/10 to-red-500/5 border border-orange-500/20 rounded-xl flex flex-col justify-center">
                            <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center mb-4">
                              <Flame className="w-6 h-6 text-orange-400" />
                            </div>
                            <h4 className="text-white font-semibold text-lg mb-2">Real World Problem</h4>
                            <p className="text-zinc-400 text-sm leading-relaxed">Masalah autentik tanpa jawaban baku. Belajar berpikir, bukan menghafal.</p>
                          </div>

                          {/* Slide 3 - Kesalahan */}
                          <div className="h-[200px] p-5 bg-gradient-to-br from-red-500/10 to-pink-500/5 border border-red-500/20 rounded-xl flex flex-col justify-center">
                            <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center mb-4">
                              <Shield className="w-6 h-6 text-red-400" />
                            </div>
                            <h4 className="text-white font-semibold text-lg mb-2">Kesalahan</h4>
                            <p className="text-zinc-400 text-sm leading-relaxed">Gagal adalah guru terbaik. Setiap error membuka insight baru untuk berkembang.</p>
                          </div>

                          {/* Slide 4 - Keputusan */}
                          <div className="h-[200px] p-5 bg-gradient-to-br from-violet-500/10 to-purple-500/5 border border-violet-500/20 rounded-xl flex flex-col justify-center">
                            <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center mb-4">
                              <TrendingUp className="w-6 h-6 text-violet-400" />
                            </div>
                            <h4 className="text-white font-semibold text-lg mb-2">Keputusan</h4>
                            <p className="text-zinc-400 text-sm leading-relaxed">Berlatih mengambil keputusan di bawah tekanan dengan konsekuensi nyata.</p>
                          </div>

                          {/* Slide 5 - Refleksi */}
                          <div className="h-[200px] p-5 bg-gradient-to-br from-emerald-500/10 to-green-500/5 border border-emerald-500/20 rounded-xl flex flex-col justify-center">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-4">
                              <Sparkles className="w-6 h-6 text-emerald-400" />
                            </div>
                            <h4 className="text-white font-semibold text-lg mb-2">Refleksi</h4>
                            <p className="text-zinc-400 text-sm leading-relaxed">Memproses pengalaman jadi wisdom. Feedback loop yang memperkuat mental.</p>
                          </div>

                          {/* Duplicate first slide for seamless loop */}
                          <div className="h-[200px] p-5 bg-gradient-to-br from-cyan-500/10 to-blue-500/5 border border-cyan-500/20 rounded-xl flex flex-col justify-center">
                            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center mb-4">
                              <Target className="w-6 h-6 text-cyan-400" />
                            </div>
                            <h4 className="text-white font-semibold text-lg mb-2">Real World Simulation</h4>
                            <p className="text-zinc-400 text-sm leading-relaxed">Menghadapi skenario nyata yang terjadi di industri dan bisnis sesungguhnya.</p>
                          </div>
                        </div>
                      </div>

                      {/* Slide Indicators */}
                      <div className="flex justify-center gap-2 mt-4">
                        {[0, 1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className="w-1.5 h-1.5 rounded-full bg-zinc-600"
                          />
                        ))}
                      </div>

                      <div className="mt-6 pt-5 border-t border-zinc-800">
                        <p className="text-sm italic text-zinc-600 text-center">
                          "No comfort zone. Only growth zone."
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
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
                    Built by students for students. Competing healthily and<span className="text-white font-medium"> disrupting the world.</span>.
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
