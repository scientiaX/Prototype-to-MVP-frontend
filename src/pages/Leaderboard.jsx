import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import apiClient from '@/api/apiClient';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Zap, TrendingUp, Target, Brain, Wrench, Crown, Medal } from 'lucide-react';
import { cn } from "@/lib/utils";

const archetypeConfig = {
  risk_taker: { icon: Zap, label: 'Risk Taker', color: 'var(--danger-400)', bg: 'rgba(244, 63, 94, 0.15)' },
  analyst: { icon: Brain, label: 'Analyst', color: 'var(--accent-400)', bg: 'rgba(6, 182, 212, 0.15)' },
  builder: { icon: Wrench, label: 'Builder', color: 'var(--success-400)', bg: 'rgba(16, 185, 129, 0.15)' },
  strategist: { icon: Target, label: 'Strategist', color: 'var(--violet-400)', bg: 'rgba(139, 92, 246, 0.15)' }
};

const rankStyles = [
  { color: 'var(--warning-400)', bg: 'rgba(251, 191, 36, 0.15)' },  // Gold
  { color: 'var(--gray-300)', bg: 'rgba(161, 161, 170, 0.15)' },     // Silver
  { color: '#CD7F32', bg: 'rgba(205, 127, 50, 0.15)' }              // Bronze
];

export default function Leaderboard() {
  const [profiles, setProfiles] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('growth');
  const [archetypeFilter, setArchetypeFilter] = useState('all');

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    const user = await apiClient.auth.me();
    setCurrentUser(user);
    const allProfiles = await apiClient.api.profiles.getLeaderboard();
    setProfiles(allProfiles);
  };

  const getGrowthScore = (profile) => {
    return (profile.xp_risk_taker || 0) + (profile.xp_analyst || 0) +
      (profile.xp_builder || 0) + (profile.xp_strategist || 0);
  };

  const getReliabilityScore = (profile) => {
    return (profile.highest_difficulty_conquered || 0) * 10 + (profile.total_arenas_completed || 0);
  };

  const sortedProfiles = [...profiles].sort((a, b) => {
    if (activeTab === 'growth') {
      return getGrowthScore(b) - getGrowthScore(a);
    }
    return getReliabilityScore(b) - getReliabilityScore(a);
  });

  const filteredProfiles = archetypeFilter === 'all'
    ? sortedProfiles
    : sortedProfiles.filter(p => p.primary_archetype === archetypeFilter);

  return (
    <div className="min-h-screen" style={{ background: 'var(--black)' }}>
      <div className="container py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="badge badge-primary mb-4 mx-auto">
            <Medal className="w-3.5 h-3.5" />
            <span>Rankings</span>
          </div>
          <h1
            className="text-white font-bold mb-3"
            style={{ fontSize: 'var(--heading-page)' }}
          >
            Leaderboard
          </h1>
          <p style={{ color: 'var(--gray-500)' }}>
            Bukan ranking kepintaran. Ranking konfrontasi.
          </p>
        </div>

        {/* Mode Tabs */}
        <div className="card p-1.5 mb-6">
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => setActiveTab('growth')}
              className={cn(
                "flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-all"
              )}
              style={activeTab === 'growth' ? {
                background: 'var(--gradient-fire)',
                color: 'var(--black)'
              } : {
                color: 'var(--gray-400)'
              }}
            >
              <TrendingUp className="w-4 h-4" />
              Growth (2 Minggu)
            </button>
            <button
              onClick={() => setActiveTab('reliability')}
              className={cn(
                "flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-all"
              )}
              style={activeTab === 'reliability' ? {
                background: 'var(--gradient-fire)',
                color: 'var(--black)'
              } : {
                color: 'var(--gray-400)'
              }}
            >
              <Trophy className="w-4 h-4" />
              All-Time Reliability
            </button>
          </div>
        </div>

        {/* Archetype Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setArchetypeFilter('all')}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={archetypeFilter === 'all' ? {
              background: 'var(--white)',
              color: 'var(--black)'
            } : {
              background: 'var(--gray-800)',
              color: 'var(--gray-400)'
            }}
          >
            Semua
          </button>
          {Object.entries(archetypeConfig).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <button
                key={key}
                onClick={() => setArchetypeFilter(key)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={archetypeFilter === key ? {
                  background: config.bg,
                  color: config.color
                } : {
                  background: 'var(--gray-800)',
                  color: 'var(--gray-400)'
                }}
              >
                <Icon className="w-4 h-4" />
                {config.label}
              </button>
            );
          })}
        </div>

        {/* Leaderboard List */}
        <div className="space-y-3">
          {filteredProfiles.map((profile, index) => {
            const archetype = archetypeConfig[profile.primary_archetype] || archetypeConfig.analyst;
            const Icon = archetype.icon;
            const score = activeTab === 'growth' ? getGrowthScore(profile) : getReliabilityScore(profile);
            const isCurrentUser = profile.created_by === currentUser?.email;
            const isTopThree = index < 3;

            return (
              <motion.div
                key={profile.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className="card flex items-center gap-4 p-4"
                style={isCurrentUser ? {
                  background: 'rgba(249, 115, 22, 0.08)',
                  borderColor: 'rgba(249, 115, 22, 0.3)'
                } : {}}
              >
                {/* Rank */}
                <div className="w-12 text-center shrink-0">
                  {isTopThree ? (
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center mx-auto"
                      style={{ background: rankStyles[index].bg }}
                    >
                      <Crown className="w-5 h-5" style={{ color: rankStyles[index].color }} />
                    </div>
                  ) : (
                    <span className="font-mono text-lg" style={{ color: 'var(--gray-500)' }}>
                      {index + 1}
                    </span>
                  )}
                </div>

                {/* Archetype Icon */}
                <div
                  className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: archetype.bg }}
                >
                  <Icon className="w-5 h-5" style={{ color: archetype.color }} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p
                    className="font-semibold truncate"
                    style={{ color: isCurrentUser ? 'var(--primary-400)' : 'var(--white)' }}
                  >
                    {isCurrentUser ? 'Kamu' : `Player ${profile.id.slice(-4)}`}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--gray-500)' }}>
                    Level {profile.current_difficulty} • {profile.total_arenas_completed || 0} arenas
                  </p>
                </div>

                {/* Score */}
                <div className="text-right shrink-0">
                  <p
                    className="text-xl font-bold font-mono"
                    style={{ color: isTopThree ? rankStyles[index].color : 'var(--white)' }}
                  >
                    {score}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--gray-600)' }}>
                    {activeTab === 'growth' ? 'XP' : 'Reliability'}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {filteredProfiles.length === 0 && (
          <div className="card p-16 text-center">
            <p style={{ color: 'var(--gray-500)' }}>Belum ada data untuk ditampilkan.</p>
          </div>
        )}

        {/* Info Note */}
        <div
          className="card p-5 mt-8"
          style={{ borderColor: 'rgba(249, 115, 22, 0.2)' }}
        >
          <p className="text-sm" style={{ color: 'var(--gray-500)' }}>
            <span style={{ color: 'var(--primary-400)' }} className="font-semibold">📊 Note:</span>{' '}
            {activeTab === 'growth'
              ? 'Growth leaderboard di-reset setiap 2 minggu. Berdasarkan lonjakan difficulty dan XP delta.'
              : 'All-Time Reliability tidak pernah reset. Berdasarkan konsistensi menghadapi masalah berat.'
            }
          </p>
        </div>
      </div>
    </div>
  );
}
