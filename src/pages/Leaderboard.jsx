import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import apiClient from '@/api/apiClient';
import { Trophy, Zap, TrendingUp, Target, Brain, Wrench, Crown, Medal } from 'lucide-react';
import { cn } from "@/lib/utils";

const archetypeConfig = {
  risk_taker: { icon: Zap, label: 'Risk Taker', color: 'text-red-400', bg: 'bg-red-500/15' },
  analyst: { icon: Brain, label: 'Analyst', color: 'text-cyan-400', bg: 'bg-cyan-500/15' },
  builder: { icon: Wrench, label: 'Builder', color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
  strategist: { icon: Target, label: 'Strategist', color: 'text-violet-400', bg: 'bg-violet-500/15' }
};

const rankColors = [
  'text-yellow-400', // Gold
  'text-zinc-300',   // Silver  
  'text-amber-600'   // Bronze
];

const rankBgs = [
  'bg-yellow-400/15',
  'bg-zinc-300/15',
  'bg-amber-600/15'
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
    <div className="min-h-screen bg-black">
      <div className="max-w-4xl mx-auto px-6 md:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/15 border border-orange-500/30 mb-4">
            <Medal className="w-3.5 h-3.5 text-orange-400" />
            <span className="text-xs font-semibold text-orange-400 tracking-wider uppercase font-mono">Rankings</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Leaderboard
          </h1>
          <p className="text-zinc-500">
            Bukan ranking kepintaran. Ranking konfrontasi.
          </p>
        </div>

        {/* Mode Tabs */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-1.5 mb-6">
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => setActiveTab('growth')}
              className={cn(
                "flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-all",
                activeTab === 'growth'
                  ? "bg-gradient-to-r from-orange-500 to-red-600 text-black"
                  : "text-zinc-400 hover:text-white"
              )}
            >
              <TrendingUp className="w-4 h-4" />
              Growth (2 Minggu)
            </button>
            <button
              onClick={() => setActiveTab('reliability')}
              className={cn(
                "flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-all",
                activeTab === 'reliability'
                  ? "bg-gradient-to-r from-orange-500 to-red-600 text-black"
                  : "text-zinc-400 hover:text-white"
              )}
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
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              archetypeFilter === 'all'
                ? "bg-white text-black"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            )}
          >
            Semua
          </button>
          {Object.entries(archetypeConfig).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <button
                key={key}
                onClick={() => setArchetypeFilter(key)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  archetypeFilter === key
                    ? `${config.bg} ${config.color}`
                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                )}
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
                className={cn(
                  "bg-zinc-900 border rounded-xl flex items-center gap-4 p-4 transition-all hover:border-zinc-700",
                  isCurrentUser
                    ? "border-orange-500/30 bg-orange-500/5"
                    : "border-zinc-800"
                )}
              >
                {/* Rank */}
                <div className="w-12 text-center shrink-0">
                  {isTopThree ? (
                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mx-auto", rankBgs[index])}>
                      <Crown className={cn("w-5 h-5", rankColors[index])} />
                    </div>
                  ) : (
                    <span className="font-mono text-lg text-zinc-500">
                      {index + 1}
                    </span>
                  )}
                </div>

                {/* Archetype Icon */}
                <div className={cn("w-11 h-11 rounded-lg flex items-center justify-center shrink-0", archetype.bg)}>
                  <Icon className={cn("w-5 h-5", archetype.color)} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "font-semibold truncate",
                    isCurrentUser ? "text-orange-400" : "text-white"
                  )}>
                    {isCurrentUser ? 'Kamu' : `Player ${profile.id.slice(-4)}`}
                  </p>
                  <p className="text-sm text-zinc-500">
                    Level {profile.current_difficulty} • {profile.total_arenas_completed || 0} arenas
                  </p>
                </div>

                {/* Score */}
                <div className="text-right shrink-0">
                  <p className={cn(
                    "text-xl font-bold font-mono",
                    isTopThree ? rankColors[index] : "text-white"
                  )}>
                    {score}
                  </p>
                  <p className="text-xs text-zinc-600">
                    {activeTab === 'growth' ? 'XP' : 'Reliability'}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {filteredProfiles.length === 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-16 text-center">
            <p className="text-zinc-500">Belum ada data untuk ditampilkan.</p>
          </div>
        )}

        {/* Info Note */}
        <div className="bg-zinc-900/50 border border-orange-500/20 rounded-xl p-5 mt-8">
          <p className="text-sm text-zinc-500">
            <span className="text-orange-400 font-semibold">📊 Note:</span>{' '}
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
