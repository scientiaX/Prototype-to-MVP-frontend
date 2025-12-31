import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '@/api/apiClient';
import { Trophy, Zap, TrendingUp, Target, Brain, Wrench, Crown, Medal, Sparkles, Users, X } from 'lucide-react';
import { cn } from "@/lib/utils";

const archetypeConfig = {
  risk_taker: { icon: Zap, label: 'Risk Taker', color: 'text-red-400', bg: 'bg-red-500/15' },
  analyst: { icon: Brain, label: 'Analyst', color: 'text-cyan-400', bg: 'bg-cyan-500/15' },
  builder: { icon: Wrench, label: 'Builder', color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
  strategist: { icon: Target, label: 'Strategist', color: 'text-violet-400', bg: 'bg-violet-500/15' }
};

const rankConfig = [
  { color: 'text-yellow-400', bg: 'bg-yellow-400/15', border: 'border-yellow-400/30', gradient: 'from-yellow-500 to-amber-600' },
  { color: 'text-zinc-300', bg: 'bg-zinc-300/15', border: 'border-zinc-400/30', gradient: 'from-zinc-400 to-zinc-500' },
  { color: 'text-amber-600', bg: 'bg-amber-600/15', border: 'border-amber-600/30', gradient: 'from-amber-600 to-orange-700' }
];

export default function Leaderboard() {
  const [profiles, setProfiles] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('growth');
  const [archetypeFilter, setArchetypeFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState(null);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    setIsLoading(true);
    try {
      // Try to get current user if authenticated (optional)
      try {
        if (apiClient.auth.isAuthenticated()) {
          const user = await apiClient.auth.me();
          setCurrentUser(user);
        }
      } catch (e) {
        // User not logged in, that's fine - leaderboard is public
        setCurrentUser(null);
      }

      // Leaderboard is public - no auth required
      const allProfiles = await apiClient.api.profiles.getLeaderboard();
      setProfiles(allProfiles || []);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      setProfiles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getGrowthScore = (profile) => {
    return (profile.xp_risk_taker || 0) + (profile.xp_analyst || 0) +
      (profile.xp_builder || 0) + (profile.xp_strategist || 0);
  };

  const getAllTimeXP = (profile) => {
    return (profile.xp_risk_taker || 0) + (profile.xp_analyst || 0) +
      (profile.xp_builder || 0) + (profile.xp_strategist || 0);
  };

  const sortedProfiles = [...profiles].sort((a, b) => {
    if (activeTab === 'growth') {
      return getGrowthScore(b) - getGrowthScore(a);
    }
    return getAllTimeXP(b) - getAllTimeXP(a);
  });

  const filteredProfiles = archetypeFilter === 'all'
    ? sortedProfiles
    : sortedProfiles.filter(p => p.primary_archetype === archetypeFilter);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center">
              <Trophy className="w-8 h-8 text-black" />
            </div>
            <motion.div
              className="absolute inset-0 rounded-2xl bg-yellow-500/30"
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
          <p className="text-zinc-400 font-medium">Loading rankings...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[30%] w-[500px] h-[500px] bg-yellow-600/8 rounded-full blur-3xl" />
        <div className="absolute bottom-[-20%] right-[20%] w-[400px] h-[400px] bg-orange-600/6 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 md:px-8 py-8">
        {/* Header */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-500/15 to-amber-500/10 border border-yellow-500/25 mb-4">
            <Medal className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-xs font-semibold text-yellow-400 tracking-wider uppercase font-mono">Rankings</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-3">
            Leaderboard
          </h1>
          <p className="text-zinc-500 text-lg">
            Bukan ranking kepintaran. Ranking konfrontasi.
          </p>
        </motion.div>

        {/* Mode Tabs */}
        <motion.div
          className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-2xl p-2 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setActiveTab('growth')}
              className={cn(
                "relative flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-medium transition-all duration-300",
                activeTab === 'growth'
                  ? "text-black"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
              )}
            >
              {activeTab === 'growth' && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl"
                  layoutId="activeTab"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <TrendingUp className="w-4 h-4 relative z-10" />
              <span className="relative z-10">Growth (2 Minggu)</span>
            </button>
            <button
              onClick={() => setActiveTab('reliability')}
              className={cn(
                "relative flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-medium transition-all duration-300",
                activeTab === 'reliability'
                  ? "text-black"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
              )}
            >
              {activeTab === 'reliability' && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl"
                  layoutId="activeTab"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <Trophy className="w-4 h-4 relative z-10" />
              <span className="relative z-10">All-Time</span>
            </button>
          </div>
        </motion.div>

        {/* Archetype Filter */}
        <motion.div
          className="flex flex-wrap gap-2 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <button
            onClick={() => setArchetypeFilter('all')}
            className={cn(
              "px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
              archetypeFilter === 'all'
                ? "bg-white text-black"
                : "bg-zinc-800/80 text-zinc-400 hover:bg-zinc-700 hover:text-white"
            )}
          >
            <span className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Semua
            </span>
          </button>
          {Object.entries(archetypeConfig).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <button
                key={key}
                onClick={() => setArchetypeFilter(key)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  archetypeFilter === key
                    ? `${config.bg} ${config.color} border border-current`
                    : "bg-zinc-800/80 text-zinc-400 hover:bg-zinc-700 hover:text-white"
                )}
              >
                <Icon className="w-4 h-4" />
                {config.label}
              </button>
            );
          })}
        </motion.div>

        {/* Leaderboard List */}
        <div className="space-y-3">
          {filteredProfiles.map((profile, index) => {
            const archetype = archetypeConfig[profile.primary_archetype] || archetypeConfig.analyst;
            const Icon = archetype.icon;
            const score = activeTab === 'growth' ? getGrowthScore(profile) : getAllTimeXP(profile);
            const isCurrentUser = profile.user_id === currentUser?.id || profile.email === currentUser?.email;
            const isTopThree = index < 3;
            const rank = rankConfig[index] || null;
            const displayName = profile.name || 'Anonymous';

            return (
              <motion.div
                key={profile.id || profile.user_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.03 }}
                onClick={() => setSelectedProfile(profile)}
                className={cn(
                  "group bg-zinc-900/80 backdrop-blur-sm border rounded-2xl flex items-center gap-4 p-4 transition-all duration-300 cursor-pointer",
                  isCurrentUser
                    ? "border-orange-500/40 bg-orange-500/5 hover:bg-orange-500/10"
                    : "border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/50"
                )}
              >
                {/* Rank */}
                <div className="w-14 text-center shrink-0">
                  {isTopThree ? (
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mx-auto bg-gradient-to-br", rank.gradient, "shadow-lg")}>
                      <Crown className="w-6 h-6 text-black" />
                    </div>
                  ) : (
                    <span className="font-mono text-xl text-zinc-500 font-bold">
                      {index + 1}
                    </span>
                  )}
                </div>

                {/* Archetype Icon */}
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110", archetype.bg)}>
                  <Icon className={cn("w-6 h-6", archetype.color)} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "font-semibold truncate text-lg",
                    isCurrentUser ? "text-orange-400" : "text-white"
                  )}>
                    {isCurrentUser ? 'Kamu' : displayName}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-zinc-500">
                    <span>Level {profile.current_difficulty}</span>
                    <span className="w-1 h-1 rounded-full bg-zinc-600" />
                    <span>{profile.total_arenas_completed || 0} arenas</span>
                  </div>
                </div>

                {/* Score */}
                <div className="text-right shrink-0">
                  <p className={cn(
                    "text-2xl font-bold font-mono",
                    isTopThree && rank ? rank.color : "text-white"
                  )}>
                    {score}
                  </p>
                  <p className="text-xs text-zinc-600 uppercase tracking-wide">
                    XP
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {filteredProfiles.length === 0 && (
          <motion.div
            className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-2xl p-16 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-16 h-16 bg-zinc-800 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <Users className="w-8 h-8 text-zinc-600" />
            </div>
            <p className="text-lg text-zinc-400">Belum ada data untuk ditampilkan.</p>
          </motion.div>
        )}

        {/* Info Note */}
        <motion.div
          className="mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="relative overflow-hidden bg-zinc-900/50 border border-orange-500/20 rounded-2xl p-6">
            <div className="absolute top-0 left-0 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl" />
            <div className="relative z-10 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-500/15 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4 text-orange-400" />
              </div>
              <p className="text-sm text-zinc-400">
                <span className="text-orange-400 font-semibold">Note: </span>
                {activeTab === 'growth'
                  ? 'Growth leaderboard di-reset setiap 2 minggu. Berdasarkan lonjakan difficulty dan XP delta.'
                  : 'All-Time tidak pernah reset.'
                }
              </p>
            </div>
          </div>
        </motion.div>

        {/* Profile Modal */}
        <AnimatePresence>
          {selectedProfile && (
            <motion.div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProfile(null)}
            >
              <motion.div
                className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-md w-full overflow-hidden"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="relative bg-gradient-to-r from-orange-500/20 to-red-500/20 p-6">
                  <button
                    onClick={() => setSelectedProfile(null)}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-zinc-800/80 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-4">
                    {(() => {
                      const arch = archetypeConfig[selectedProfile.primary_archetype] || archetypeConfig.analyst;
                      const ArchIcon = arch.icon;
                      return (
                        <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center", arch.bg)}>
                          <ArchIcon className={cn("w-8 h-8", arch.color)} />
                        </div>
                      );
                    })()}
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {selectedProfile.name || 'Anonymous'}
                      </h3>
                      <p className={cn("text-sm font-medium", (archetypeConfig[selectedProfile.primary_archetype] || archetypeConfig.analyst).color)}>
                        {(archetypeConfig[selectedProfile.primary_archetype] || archetypeConfig.analyst).label}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-6">
                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white font-mono">
                        {selectedProfile.current_difficulty || 1}
                      </p>
                      <p className="text-xs text-zinc-500 uppercase">Level</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-400 font-mono">
                        {(selectedProfile.xp_risk_taker || 0) + (selectedProfile.xp_analyst || 0) +
                          (selectedProfile.xp_builder || 0) + (selectedProfile.xp_strategist || 0)}
                      </p>
                      <p className="text-xs text-zinc-500 uppercase">Total XP</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white font-mono">
                        {selectedProfile.total_arenas_completed || 0}
                      </p>
                      <p className="text-xs text-zinc-500 uppercase">Arenas</p>
                    </div>
                  </div>

                  {/* XP Breakdown */}
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-zinc-400">XP Breakdown</p>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(archetypeConfig).map(([key, config]) => {
                        const xpKey = `xp_${key}`;
                        const xpValue = selectedProfile[xpKey] || 0;
                        const ArchetypeIcon = config.icon;
                        return (
                          <div key={key} className={cn("flex items-center gap-2 p-3 rounded-xl", config.bg)}>
                            <ArchetypeIcon className={cn("w-4 h-4", config.color)} />
                            <span className="text-sm text-zinc-300">{config.label}</span>
                            <span className={cn("ml-auto font-mono font-bold", config.color)}>{xpValue}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Highest Difficulty */}
                  {selectedProfile.highest_difficulty_conquered > 0 && (
                    <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl">
                      <span className="text-sm text-zinc-400">Highest Difficulty Conquered</span>
                      <span className="text-lg font-bold text-yellow-400 font-mono">
                        Level {selectedProfile.highest_difficulty_conquered}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
