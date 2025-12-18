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
      gradient: "var(--gradient-fire)",
      glow: "glow-fire"
    },
    {
      icon: TrendingUp,
      title: "XP = Difficulty",
      description: "Progression berbasis challenge, bukan grinding",
      gradient: "var(--gradient-success)",
      glow: "glow-success"
    },
    {
      icon: Shield,
      title: "Scar Badges",
      description: "Badge adalah bukti kamu bertarung, bukan partisipasi",
      gradient: "var(--gradient-magic)",
      glow: "glow-magic"
    }
  ];

  const stats = [
    { value: "247", label: "Active Battles", icon: Zap },
    { value: "7.2", label: "Avg Difficulty", icon: BarChart3 },
    { value: "1.2k", label: "Warriors", icon: Users }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'var(--black)' }}>
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full blur-3xl opacity-20"
          style={{ background: 'var(--primary-600)' }}
        />
        <div
          className="absolute bottom-[-30%] left-[-15%] w-[600px] h-[600px] rounded-full blur-3xl opacity-10"
          style={{ background: 'var(--violet-600)' }}
        />
        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), 
                             linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="container">
          <div className="min-h-[85vh] flex items-center py-20">
            <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center w-full">
              {/* Left - Content */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                {/* Badge */}
                <div className="badge badge-primary mb-8">
                  <Flame className="w-3.5 h-3.5" />
                  <span>Novax Arena</span>
                </div>

                {/* Headline */}
                <h1
                  className="font-bold mb-6 leading-[0.95] tracking-tight"
                  style={{ fontSize: 'var(--heading-hero)' }}
                >
                  <span className="text-white block">Problem</span>
                  <span className="text-gradient-fire block">Arena</span>
                </h1>

                {/* Description */}
                <p
                  className="mb-10 max-w-lg leading-relaxed"
                  style={{ color: 'var(--gray-400)', fontSize: 'var(--text-lg)' }}
                >
                  Belajar yang sebenarnya terjadi lewat{' '}
                  <span style={{ color: 'var(--primary-400)' }}>konfrontasi masalah nyata</span>.
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

                  <span className="text-sm" style={{ color: 'var(--gray-500)' }}>
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
                <div
                  className="card-glass p-8 relative overflow-hidden"
                  style={{ borderColor: 'rgba(249, 115, 22, 0.2)' }}
                >
                  {/* Decorative */}
                  <div
                    className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl opacity-20"
                    style={{ background: 'var(--primary-500)' }}
                  />

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h3 className="text-white font-bold text-lg">Live Stats</h3>
                        <p className="text-sm" style={{ color: 'var(--gray-500)' }}>Real-time arena</p>
                      </div>
                      <Sparkles className="w-5 h-5" style={{ color: 'var(--violet-400)' }} />
                    </div>

                    <div className="space-y-6">
                      {stats.map((stat, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className="icon-box"
                              style={{ background: 'var(--gray-800)' }}
                            >
                              <stat.icon className="w-5 h-5" style={{ color: 'var(--gray-400)' }} />
                            </div>
                            <span style={{ color: 'var(--gray-400)' }}>{stat.label}</span>
                          </div>
                          <span className="font-mono font-bold text-2xl text-white">
                            {stat.value}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div
                      className="mt-8 pt-6 border-t"
                      style={{ borderColor: 'var(--gray-800)' }}
                    >
                      <p className="text-sm italic" style={{ color: 'var(--gray-600)' }}>
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
        <section className="container section-lg">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            {/* Section Header */}
            <div className="mb-16">
              <h2
                className="text-white font-bold mb-4"
                style={{ fontSize: 'var(--heading-page)' }}
              >
                Sistem Berbasis <span className="text-gradient-magic">Konfrontasi</span>
              </h2>
              <p style={{ color: 'var(--gray-500)', maxWidth: '600px' }}>
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
                  className="card p-8 group"
                >
                  <div
                    className={`icon-box-lg mb-6 ${feature.glow} transition-transform group-hover:scale-110`}
                    style={{ background: feature.gradient }}
                  >
                    <feature.icon className="w-7 h-7 text-black" />
                  </div>

                  <h3 className="text-white font-bold text-xl mb-3">
                    {feature.title}
                  </h3>

                  <p style={{ color: 'var(--gray-400)' }}>
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Warning */}
            <div
              className="mt-16 card p-6 text-center max-w-2xl mx-auto"
              style={{
                borderColor: 'rgba(244, 63, 94, 0.2)',
                background: 'rgba(244, 63, 94, 0.05)'
              }}
            >
              <p style={{ color: 'var(--gray-400)' }}>
                <span style={{ color: 'var(--danger-400)' }}>⚠️ Warning:</span>{' '}
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
