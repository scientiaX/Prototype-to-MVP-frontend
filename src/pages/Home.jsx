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
  BarChart3
} from 'lucide-react';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
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
      setHasProfile(profiles.length > 0 && profiles[0].calibration_completed);
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

  const features = [
    {
      icon: Target,
      title: "Adaptive Matching",
      description: "AI mencocokkan masalah dengan archetype dan level-mu",
      iconBg: "bg-gradient-to-br from-orange-500 to-red-600",
      glowClass: "glow-fire"
    },
    {
      icon: TrendingUp,
      title: "XP = Difficulty",
      description: "Progression berbasis challenge, bukan grinding",
      iconBg: "bg-gradient-to-br from-emerald-500 to-green-600",
      glowClass: "glow-success"
    },
    {
      icon: Shield,
      title: "Scar Badges",
      description: "Badge adalah bukti kamu bertarung, bukan partisipasi",
      iconBg: "bg-gradient-to-br from-violet-500 to-purple-600",
      glowClass: "glow-magic"
    }
  ];

  const stats = [
    { value: "247", label: "Active Battles", icon: Zap },
    { value: "7.2", label: "Avg Difficulty", icon: BarChart3 },
    { value: "1.2k", label: "Warriors", icon: Users }
  ];

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-orange-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-[-30%] left-[-15%] w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-3xl" />
        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), 
                             linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="max-w-6xl mx-auto px-6 md:px-8">
          <div className="min-h-[85vh] flex items-center py-20">
            <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center w-full">
              {/* Left - Content */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/15 border border-orange-500/30 mb-8">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span className="text-xs font-semibold text-orange-400 tracking-wider uppercase font-mono">Novax Arena</span>
                </div>

                {/* Headline */}
                <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-[0.95] tracking-tight">
                  <span className="text-white block">Problem</span>
                  <span className="text-gradient-fire block">Arena</span>
                </h1>

                {/* Description */}
                <p className="text-lg text-zinc-400 mb-10 max-w-lg leading-relaxed">
                  Belajar yang sebenarnya terjadi lewat{' '}
                  <span className="text-orange-400 font-medium">konfrontasi masalah nyata</span>.
                  Bukan materi. Bukan teori. Bukan validasi.
                </p>

                {/* CTA */}
                <div className="flex flex-wrap items-center gap-4">
                  <Button
                    onClick={handleStart}
                    variant="gradient"
                    size="xl"
                    className="group"
                  >
                    {hasProfile ? 'Masuk Arena' : 'Mulai Kalibrasi'}
                    <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Button>

                  <span className="text-sm text-zinc-500">
                    {isAuthenticated
                      ? hasProfile ? '⚔️ Ready to battle' : '🎯 5-7 menit'
                      : '🔑 Login dulu'}
                  </span>
                </div>
              </motion.div>

              {/* Right - Stats Card */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="lg:justify-self-end w-full max-w-md"
              >
                <div className="bg-zinc-900/80 backdrop-blur-xl border border-orange-500/20 rounded-2xl p-8 relative overflow-hidden">
                  {/* Decorative */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/20 rounded-full blur-2xl" />

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h3 className="text-white font-bold text-lg">Live Stats</h3>
                        <p className="text-sm text-zinc-500">Real-time arena</p>
                      </div>
                      <Sparkles className="w-5 h-5 text-violet-400" />
                    </div>

                    <div className="space-y-6">
                      {stats.map((stat, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                              <stat.icon className="w-5 h-5 text-zinc-400" />
                            </div>
                            <span className="text-zinc-400">{stat.label}</span>
                          </div>
                          <span className="font-mono font-bold text-2xl text-white">
                            {stat.value}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-8 pt-6 border-t border-zinc-800">
                      <p className="text-sm italic text-zinc-600">
                        "No comfort zone. Only growth zone."
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="max-w-6xl mx-auto px-6 md:px-8 py-20">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            {/* Section Header */}
            <div className="mb-16">
              <h2 className="text-3xl md:text-4xl text-white font-bold mb-4">
                Sistem Berbasis <span className="text-gradient-magic">Konfrontasi</span>
              </h2>
              <p className="text-zinc-500 max-w-xl">
                Bukan gamifikasi kosmetik. Setiap elemen dirancang untuk growth melalui pressure.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              {features.map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 hover:border-zinc-700 transition-all duration-300 hover:-translate-y-1 group"
                >
                  <div className={`w-14 h-14 rounded-xl ${feature.iconBg} ${feature.glowClass} flex items-center justify-center mb-6 transition-transform group-hover:scale-110`}>
                    <feature.icon className="w-7 h-7 text-black" />
                  </div>

                  <h3 className="text-white font-bold text-xl mb-3">
                    {feature.title}
                  </h3>

                  <p className="text-zinc-400">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Warning */}
            <div className="mt-16 bg-zinc-900/50 border border-red-500/20 rounded-2xl p-6 text-center max-w-2xl mx-auto">
              <p className="text-zinc-400">
                <span className="text-red-400 font-medium">⚠️ Warning:</span>{' '}
                Ini bukan platform untuk merasa nyaman.
                Jika mencari validasi, ini <span className="text-white font-medium">bukan tempatnya</span>.
              </p>
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
}
