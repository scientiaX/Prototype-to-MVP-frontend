import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { 
  Zap, 
  Target, 
  Trophy, 
  ArrowRight, 
  Skull,
  Shield,
  TrendingUp
} from 'lucide-react';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const authenticated = await base44.auth.isAuthenticated();
    setIsAuthenticated(authenticated);
    
    if (authenticated) {
      const user = await base44.auth.me();
      const profiles = await base44.entities.UserProfile.filter({ created_by: user.email });
      setHasProfile(profiles.length > 0 && profiles[0].calibration_completed);
    }
  };

  const handleStart = () => {
    if (!isAuthenticated) {
      base44.auth.redirectToLogin(createPageUrl('Calibration'));
    } else if (hasProfile) {
      navigate(createPageUrl('Arena'));
    } else {
      navigate(createPageUrl('Calibration'));
    }
  };

  return (
    <div className="min-h-screen bg-black overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-red-500/5" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-orange-500/10 rounded-full blur-3xl opacity-30" />
      
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
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-zinc-900/50 border border-zinc-800 rounded-full mb-6">
                <Skull className="w-5 h-5 text-orange-500" />
                <span className="text-zinc-400 text-sm font-mono">NOVAX TRIAL</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-4">
                Problem <span className="text-orange-500">Arena</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-zinc-400 max-w-2xl mx-auto">
                Belajar terjadi lewat masalah nyata.
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
                className="bg-orange-500 hover:bg-orange-600 text-black font-bold px-8 py-6 text-lg rounded-xl"
              >
                {hasProfile ? 'Masuk Arena' : 'Mulai Kalibrasi'}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              
              <p className="text-zinc-600 text-sm mt-4">
                {isAuthenticated 
                  ? hasProfile 
                    ? 'Siap untuk konfrontasi berikutnya?' 
                    : '5-7 pertanyaan singkat untuk menentukan starting point'
                  : 'Login untuk memulai perjalanan'}
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
              <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6">
                <Target className="w-8 h-8 text-orange-500 mb-4" />
                <h3 className="text-white font-semibold mb-2">Matchmaking</h3>
                <p className="text-zinc-500 text-sm">
                  Orang ↔ Masalah. Sistem mencocokkan level dan archetype-mu dengan masalah yang tepat.
                </p>
              </div>
              
              <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6">
                <TrendingUp className="w-8 h-8 text-green-500 mb-4" />
                <h3 className="text-white font-semibold mb-2">XP Berbasis Kesulitan</h3>
                <p className="text-zinc-500 text-sm">
                  XP hanya naik jika difficulty naik. Tidak ada grind. Tidak ada jalan pintas.
                </p>
              </div>
              
              <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6">
                <Shield className="w-8 h-8 text-red-500 mb-4" />
                <h3 className="text-white font-semibold mb-2">Scar-Based Badges</h3>
                <p className="text-zinc-500 text-sm">
                  Badge bukan kosmetik. Badge adalah bukti kamu menghadapi risiko nyata.
                </p>
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
            <p className="text-zinc-700 text-sm">
              ⚠️ Ini bukan platform untuk merasa nyaman. 
              Jika kamu mencari validasi, ini bukan tempatnya.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
