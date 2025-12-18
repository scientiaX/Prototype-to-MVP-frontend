import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import apiClient from '@/api/apiClient';
import { Button } from "@/components/ui/button";
import {
  Zap,
  Target,
  Trophy,
  ArrowRight,
  Skull,
  Shield,
  TrendingUp,
  Sparkles
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
      {/* Enhanced Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-red-500/10" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-orange-500/20 rounded-full blur-3xl opacity-20 animate-float" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl opacity-20" />

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Hero Section */}
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="max-w-4xl mx-auto text-center">
            {/* Logo/Brand */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full mb-6 glass-card">
                <Skull className="w-5 h-5 text-orange-500 animate-glow-pulse" />
                <span className="text-zinc-400 text-sm font-mono font-semibold tracking-wider">NOVAX TRIAL</span>
                <Sparkles className="w-4 h-4 text-purple-500" />
              </div>

              <h1 className="text-5xl md:text-7xl font-bold text-white mb-4">
                Problem <span className="gradient-text-primary-animated">Arena</span>
              </h1>

              <p className="text-xl md:text-2xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                Belajar terjadi lewat <span className="text-orange-500 font-semibold">masalah nyata</span>.
                <br />
                <span className="text-zinc-600">Bukan materi. Bukan teori.</span>
              </p>
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Button
                onClick={handleStart}
                variant="gradient"
                size="xl"
                className="group"
              >
                {hasProfile ? 'Masuk Arena' : 'Mulai Kalibrasi'}
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>

              <p className="text-zinc-600 text-sm mt-4 font-medium">
                {isAuthenticated
                  ? hasProfile
                    ? '⚔️ Siap untuk konfrontasi berikutnya?'
                    : '🎯 5-7 pertanyaan singkat untuk menentukan starting point'
                  : '🔑 Login untuk memulai perjalanan'}
              </p>
            </motion.div>
          </div>
        </div>

        {/* Features */}
        <div className="px-6 pb-16">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="grid md:grid-cols-3 gap-6"
            >
              <div className="glass-card rounded-xl p-6 group overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 glow-orange" style={{ background: 'var(--gradient-primary)' }}>
                    <Target className="w-6 h-6 text-black" />
                  </div>
                  <h3 className="text-white font-bold mb-2 text-lg">Matchmaking</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">
                    Orang ↔ Masalah. Sistem mencocokkan level dan archetype-mu dengan masalah yang tepat.
                  </p>
                </div>
              </div>

              <div className="glass-card rounded-xl p-6 group overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 glow-green" style={{ background: 'var(--gradient-success)' }}>
                    <TrendingUp className="w-6 h-6 text-black" />
                  </div>
                  <h3 className="text-white font-bold mb-2 text-lg">XP Berbasis Kesulitan</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">
                    XP hanya naik jika difficulty naik. Tidak ada grind. Tidak ada jalan pintas.
                  </p>
                </div>
              </div>

              <div className="glass-card rounded-xl p-6 group overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ background: 'var(--gradient-secondary)', boxShadow: 'var(--glow-purple)' }}>
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-white font-bold mb-2 text-lg">Scar-Based Badges</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">
                    Badge bukan kosmetik. Badge adalah bukti kamu menghadapi risiko nyata.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Warning */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="px-6 pb-8"
        >
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-block px-6 py-3 rounded-full glass-card border-red-500/20">
              <p className="text-zinc-700 text-sm font-medium">
                ⚠️ Ini bukan platform untuk merasa nyaman.
                Jika kamu mencari validasi, ini bukan tempatnya.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
