import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import apiClient from '@/api/apiClient';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import ArchetypeRadar from '@/components/profile/ArchetypeRadar';
import BadgeDisplay from '@/components/profile/BadgeDisplay';
import { Loader2, Zap, Target, Brain, Wrench, Trophy, TrendingUp, Award, User, Sparkles } from 'lucide-react';
import { cn } from "@/lib/utils";

const archetypeConfig = {
  risk_taker: { icon: Zap, label: 'Risk Taker', color: 'text-red-400', bg: 'bg-red-500/15', border: 'border-red-500/30', gradient: 'from-red-500 to-orange-600' },
  analyst: { icon: Brain, label: 'Analyst', color: 'text-cyan-400', bg: 'bg-cyan-500/15', border: 'border-cyan-500/30', gradient: 'from-cyan-500 to-blue-600' },
  builder: { icon: Wrench, label: 'Builder', color: 'text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30', gradient: 'from-emerald-500 to-green-600' },
  strategist: { icon: Target, label: 'Strategist', color: 'text-violet-400', bg: 'bg-violet-500/15', border: 'border-violet-500/30', gradient: 'from-violet-500 to-purple-600' }
};

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [artifacts, setArtifacts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const user = await apiClient.auth.me();

    const profiles = await apiClient.entities.UserProfile.filter({ created_by: user.email });
    if (profiles.length === 0 || !profiles[0].calibration_completed) {
      navigate(createPageUrl('Calibration'));
      return;
    }

    setProfile(profiles[0]);

    const userAchievements = await apiClient.api.user.getAchievements(user.email);
    const userArtifacts = await apiClient.api.user.getArtifacts(user.email);

    setAchievements(userAchievements);
    setArtifacts(userArtifacts);
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <motion.div
              className="absolute inset-0 rounded-2xl bg-violet-500/30"
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
          <p className="text-zinc-400 font-medium">Loading profile...</p>
        </motion.div>
      </div>
    );
  }

  const archetype = archetypeConfig[profile.primary_archetype] || archetypeConfig.analyst;
  const Icon = archetype.icon;
  const totalXp = (profile.xp_risk_taker || 0) + (profile.xp_analyst || 0) +
    (profile.xp_builder || 0) + (profile.xp_strategist || 0);

  const stats = [
    { icon: Trophy, value: profile.current_difficulty, label: 'Current Level', color: 'text-orange-400', bg: 'bg-orange-500/15' },
    { icon: Zap, value: totalXp, label: 'Total XP', color: 'text-yellow-400', bg: 'bg-yellow-500/15' },
    { icon: TrendingUp, value: profile.highest_difficulty_conquered || 0, label: 'Highest Conquered', color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
    { icon: Target, value: profile.total_arenas_completed || 0, label: 'Arenas Completed', color: 'text-cyan-400', bg: 'bg-cyan-500/15' }
  ];

  return (
    <div className="min-h-screen bg-black relative">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-15%] left-[50%] -translate-x-1/2 w-[800px] h-[400px] bg-violet-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 md:px-8 py-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          {/* Archetype Icon */}
          <div className="relative inline-block mb-6">
            <motion.div
              className={cn("w-28 h-28 rounded-3xl flex items-center justify-center bg-gradient-to-br", archetype.gradient, "shadow-lg")}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              <Icon className="w-14 h-14 text-white" />
            </motion.div>
            <motion.div
              className="absolute -bottom-2 -right-2 w-8 h-8 bg-zinc-900 border border-zinc-700 rounded-xl flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Sparkles className="w-4 h-4 text-violet-400" />
            </motion.div>
          </div>

          <h1 className={cn("text-4xl md:text-5xl font-bold mb-3", archetype.color)}>
            {archetype.label}
          </h1>

          <p className="text-zinc-500 capitalize text-lg">
            {profile.domain?.replace('_', ' ')} • {profile.aspiration?.replace('_', ' ')}
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.1 }}
              className="group bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-2xl p-5 text-center hover:border-zinc-700 transition-all duration-300"
            >
              <div className={cn("w-11 h-11 rounded-xl mx-auto mb-3 flex items-center justify-center transition-transform group-hover:scale-110", stat.bg)}>
                <stat.icon className={cn("w-5 h-5", stat.color)} />
              </div>
              <p className="text-3xl font-bold text-white font-mono mb-1">{stat.value}</p>
              <p className="text-xs text-zinc-500">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Archetype Radar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-2xl p-8 mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center">
              <Target className="w-5 h-5 text-violet-400" />
            </div>
            <h2 className="text-white font-bold text-xl">Archetype Distribution</h2>
          </div>

          <ArchetypeRadar profile={profile} />

          {/* XP Breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-zinc-800">
            {Object.entries(archetypeConfig).map(([key, config]) => {
              const xp = profile[`xp_${key}`] || 0;
              const ConfigIcon = config.icon;
              return (
                <div key={key} className="text-center group">
                  <div className={cn("w-8 h-8 rounded-lg mx-auto mb-2 flex items-center justify-center transition-all group-hover:scale-110", config.bg)}>
                    <ConfigIcon className={cn("w-4 h-4", config.color)} />
                  </div>
                  <p className={cn("font-mono text-2xl font-bold", config.color)}>{xp}</p>
                  <p className="text-xs text-zinc-600">{config.label}</p>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-2xl p-8 mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-orange-500/15 flex items-center justify-center">
              <Award className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h2 className="text-white font-bold text-xl">Badges (Scars)</h2>
              <p className="text-sm text-zinc-500">Proof of your battles</p>
            </div>
          </div>
          <BadgeDisplay achievements={achievements} />
        </motion.div>

        {/* Portfolio Artifacts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-2xl p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-white font-bold text-xl">Portfolio Artifacts</h2>
              <p className="text-sm text-zinc-500">Problems you've conquered</p>
            </div>
          </div>

          {artifacts.length > 0 ? (
            <div className="space-y-4">
              {artifacts.map((artifact, index) => (
                <motion.div
                  key={artifact.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className="bg-zinc-950/50 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-all group"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1 min-w-0">
                      <span className="font-mono text-xs text-zinc-600">
                        {artifact.problem_id}
                      </span>
                      <h3 className="text-white font-semibold truncate group-hover:text-orange-400 transition-colors">{artifact.problem_title}</h3>
                    </div>
                    <span className={cn(
                      "shrink-0 px-3 py-1.5 rounded-lg text-xs font-mono font-medium",
                      artifact.difficulty <= 3 ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" :
                        artifact.difficulty <= 6 ? "bg-yellow-500/15 text-yellow-400 border border-yellow-500/20" :
                          "bg-red-500/15 text-red-400 border border-red-500/20"
                    )}>
                      Difficulty {artifact.difficulty}
                    </span>
                  </div>

                  <p className="text-zinc-400 text-sm mb-2">
                    Conquered as{' '}
                    <span className="text-orange-400 capitalize font-medium">
                      {artifact.archetype_role?.replace('_', ' ')}
                    </span>
                  </p>

                  {artifact.insight && (
                    <p className="text-sm italic text-zinc-500 bg-zinc-800/30 rounded-lg px-3 py-2 mt-3">
                      "{artifact.insight}"
                    </p>
                  )}

                  {artifact.level_up_verified && (
                    <div className="flex items-center gap-1.5 mt-3">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-xs text-emerald-400 font-medium">
                        Level Up Verified
                      </span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-zinc-800 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <Trophy className="w-8 h-8 text-zinc-600" />
              </div>
              <p className="text-lg text-zinc-400 font-medium mb-2">
                Belum ada artifact
              </p>
              <p className="text-zinc-600 max-w-sm mx-auto">
                Selesaikan arena untuk mengumpulkan bukti pertempuranmu
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
