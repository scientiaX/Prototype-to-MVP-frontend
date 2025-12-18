import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import apiClient from '@/api/apiClient';
import { Button } from "@/components/ui/button";
import {
  Target,
  ArrowRight,
  Skull,
  Shield,
  TrendingUp,
  Sparkles,
  Flame
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

  return (
    <div className="min-h-screen bg-black overflow-hidden relative">
      {/* Modern Asymmetric Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-red-500/5" />
      <div className="absolute top-[-10%] right-[-5%] w-[1000px] h-[1000px] bg-orange-500/15 rounded-full blur-3xl opacity-30" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[800px] h-[800px] bg-purple-500/10 rounded-full blur-3xl opacity-20" />

      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
        backgroundSize: '100px 100px'
      }} />

      <div className="relative z-10">
        {/* Hero Section - Asymmetric Layout */}
        <div className="min-h-[85vh] flex items-center" style={{ paddingTop: 'var(--space-section)', paddingBottom: 'var(--space-element)' }}>
          <div className="w-full max-w-[1600px] mx-auto px-8 md:px-12 lg:px-16">
            <div className="grid lg:grid-cols-12 gap-12 items-center">
              {/* Left Column - Text Content */}
              <div className="lg:col-span-7">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  {/* Badge */}
                  <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full mb-8 glass-card">
                    <Flame className="w-4 h-4 text-orange-500 animate-glow-pulse" />
                    <span className="text-zinc-400 text-xs font-mono font-bold tracking-[0.2em] uppercase">Novax Trial</span>
                  </div>

                  {/* Oversized Title */}
                  <h1 className="font-black tracking-tight mb-6" style={{
                    fontSize: 'var(--text-hero)',
                    lineHeight: '0.9',
                    letterSpacing: '-0.02em'
                  }}>
                    <span className="block text-white">PROBLEM</span>
                    <span className="block gradient-text-primary-animated">ARENA</span>
                  </h1>

                  {/* Subtitle - Asymmetrically Positioned */}
                  <div className="ml-2 mb-12 max-w-xl">
                    <p className="text-zinc-400 leading-relaxed mb-2" style={{ fontSize: 'var(--text-body-lg)' }}>
                      Belajar terjadi lewat <span className="text-orange-500 font-bold">masalah nyata</span>.
                    </p>
                    <p className="text-zinc-600 text-base">
                      Bukan materi. Bukan teori. Bukan validasi.
                    </p>
                  </div>

                  {/* CTA - Left Aligned */}
                  <div className="flex flex-col sm:flex-row items-start gap-4">
                    <Button
                      onClick={handleStart}
                      variant="gradient"
                      size="xl"
                      className="group text-base px-10"
                    >
                      {hasProfile ? 'Masuk Arena' : 'Mulai Kalibrasi'}
                      <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>

                    <div className="flex items-center gap-2 px-4 py-3">
                      <span className="text-zinc-600 text-sm">
                        {isAuthenticated
                          ? hasProfile
                            ? '⚔️ Siap bertarung?'
                            : '5-7 menit kalibrasi'
                          : '🔑 Login dulu'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Right Column - Floating Stats Card */}
              <div className="lg:col-span-5">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="glass-card rounded-2xl p-8 border-2 border-orange-500/20"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="text-white font-bold text-xl mb-1">Live Stats</h3>
                      <p className="text-zinc-500 text-sm">Real-time performance</p>
                    </div>
                    <Sparkles className="w-6 h-6 text-purple-500" />
                  </div>

                  <div className="space-y-6">
                    <div>
                      <div className="flex items-baseline justify-between mb-2">
                        <span className="text-zinc-400 text-sm">Active Battles</span>
                        <span className="text-white font-bold text-3xl gradient-text-primary">247</span>
                      </div>
                      <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-orange-500 to-red-500 w-[73%]" />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-baseline justify-between mb-2">
                        <span className="text-zinc-400 text-sm">Avg Difficulty</span>
                        <span className="text-white font-bold text-3xl gradient-text-accent">7.2</span>
                      </div>
                      <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 w-[72%]" />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-zinc-800">
                      <p className="text-zinc-600 text-xs italic">
                        "No comfort zone. Only growth zone."
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section - Bento Grid */}
        <div style={{ paddingTop: 'var(--space-section)', paddingBottom: 'var(--space-section)' }}>
          <div className="w-full max-w-[1600px] mx-auto px-8 md:px-12 lg:px-16">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {/* Section Header */}
              <div className="mb-16">
                <h2 className="text-white font-bold mb-3" style={{ fontSize: 'var(--text-heading)' }}>
                  Sistem Berbasis <span className="gradient-text-secondary">Konfrontasi</span>
                </h2>
                <p className="text-zinc-500 max-w-2xl" style={{ fontSize: 'var(--text-body-lg)' }}>
                  Bukan gamifikasi kosmetik. Setiap elemen dirancang untuk growth lewat pressure.
                </p>
              </div>

              {/* Bento Grid - Irregular Sizes */}
              <div className="grid md:grid-cols-12 gap-6">
                {/* Feature 1 - Large */}
                <div className="md:col-span-7 glass-card rounded-2xl p-10 group hover:border-orange-500/30 transition-all duration-300 overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10">
                    <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-6 glow-orange transition-all group-hover:scale-110" style={{ background: 'var(--gradient-primary)' }}>
                      <Target className="w-8 h-8 text-black" />
                    </div>
                    <h3 className="text-white font-bold text-2xl mb-4">Adaptive Matchmaking</h3>
                    <p className="text-zinc-400 leading-relaxed text-base max-w-md">
                      Sistem AI mencocokkan archetype kognitif dan level kesulitan. Orang ↔ Masalah.
                      Tidak ada random. Tidak ada autopilot.
                    </p>
                  </div>
                </div>

                {/* Feature 2 - Medium */}
                <div className="md:col-span-5 glass-card rounded-2xl p-10 group hover:border-green-500/30 transition-all duration-300 overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10">
                    <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-6 glow-green transition-all group-hover:scale-110" style={{ background: 'var(--gradient-success)' }}>
                      <TrendingUp className="w-8 h-8 text-black" />
                    </div>
                    <h3 className="text-white font-bold text-2xl mb-4">XP = Difficulty</h3>
                    <p className="text-zinc-400 leading-relaxed text-base">
                      XP hanya naik jika difficulty naik. No grind. No shortcuts. Pure skill progression.
                    </p>
                  </div>
                </div>

                {/* Feature 3 - Medium */}
                <div className="md:col-span-5 glass-card rounded-2xl p-10 group hover:border-purple-500/30 transition-all duration-300 overflow-hidden relative md:row-span-1">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10">
                    <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-6 transition-all group-hover:scale-110" style={{ background: 'var(--gradient-secondary)', boxShadow: 'var(--glow-purple)' }}>
                      <Shield className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-white font-bold text-2xl mb-4">Scar Badges</h3>
                    <p className="text-zinc-400 leading-relaxed text-base">
                      Badge = bukti kamu hadapi risiko nyata. Bukan kosmetik. Bukan partisipasi trophy.
                    </p>
                  </div>
                </div>

                {/* Warning Box */}
                <div className="md:col-span-7 glass-card rounded-2xl p-10 border-2 border-red-500/20 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent" />
                  <div className="relative z-10">
                    <Skull className="w-12 h-12 text-red-500 mb-4 opacity-50" />
                    <p className="text-zinc-400 text-lg leading-relaxed">
                      <span className="text-red-400 font-bold">⚠️ Warning:</span> Ini bukan platform untuk merasa nyaman.
                      Jika kamu mencari validasi atau safe space, ini <span className="text-white font-semibold">bukan tempatnya</span>.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
