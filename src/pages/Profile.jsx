import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import apiClient from '@/api/apiClient';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import ArchetypeRadar from '@/components/profile/ArchetypeRadar';
import BadgeDisplay from '@/components/profile/BadgeDisplay';
import { Loader2, Zap, Target, Brain, Wrench, Trophy, TrendingUp, Award } from 'lucide-react';
import { cn } from "@/lib/utils";

const archetypeConfig = {
  risk_taker: { icon: Zap, label: 'Risk Taker', color: 'text-red-400', bg: 'bg-red-500/15' },
  analyst: { icon: Brain, label: 'Analyst', color: 'text-cyan-400', bg: 'bg-cyan-500/15' },
  builder: { icon: Wrench, label: 'Builder', color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
  strategist: { icon: Target, label: 'Strategist', color: 'text-violet-400', bg: 'bg-violet-500/15' }
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
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
          <span className="text-zinc-400">Loading profile...</span>
        </div>
      </div>
    );
  }

  const archetype = archetypeConfig[profile.primary_archetype] || archetypeConfig.analyst;
  const Icon = archetype.icon;
  const totalXp = (profile.xp_risk_taker || 0) + (profile.xp_analyst || 0) +
    (profile.xp_builder || 0) + (profile.xp_strategist || 0);

  const stats = [
    { icon: Trophy, value: profile.current_difficulty, label: 'Current Level', color: 'text-orange-400' },
    { icon: Zap, value: totalXp, label: 'Total XP', color: 'text-yellow-400' },
    { icon: TrendingUp, value: profile.highest_difficulty_conquered || 0, label: 'Highest Conquered', color: 'text-emerald-400' },
    { icon: Target, value: profile.total_arenas_completed || 0, label: 'Arenas Completed', color: 'text-cyan-400' }
  ];

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-4xl mx-auto px-6 md:px-8 py-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className={cn("w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-6", archetype.bg)}>
            <Icon className={cn("w-12 h-12", archetype.color)} />
          </div>

          <h1 className={cn("text-3xl md:text-4xl font-bold mb-2", archetype.color)}>
            {archetype.label}
          </h1>

          <p className="text-zinc-500 capitalize">
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
              transition={{ delay: i * 0.1 }}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 text-center hover:border-zinc-700 transition-all"
            >
              <stat.icon className={cn("w-5 h-5 mx-auto mb-3", stat.color)} />
              <p className="text-2xl font-bold text-white font-mono mb-1">{stat.value}</p>
              <p className="text-xs text-zinc-500">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Archetype Radar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 mb-8"
        >
          <h2 className="text-white font-bold text-lg mb-6">Archetype Distribution</h2>
          <ArchetypeRadar profile={profile} />

          {/* XP Breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-zinc-800">
            {Object.entries(archetypeConfig).map(([key, config]) => {
              const xp = profile[`xp_${key}`] || 0;
              return (
                <div key={key} className="text-center">
                  <p className={cn("font-mono text-xl font-bold", config.color)}>{xp}</p>
                  <p className="text-xs text-zinc-600">{config.label}</p>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <Award className="w-5 h-5 text-orange-400" />
            <h2 className="text-white font-bold text-lg">Badges (Scars)</h2>
          </div>
          <BadgeDisplay achievements={achievements} />
        </motion.div>

        {/* Portfolio Artifacts */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8"
        >
          <h2 className="text-white font-bold text-lg mb-6">Portfolio Artifacts</h2>

          {artifacts.length > 0 ? (
            <div className="space-y-4">
              {artifacts.map((artifact) => (
                <div
                  key={artifact.id}
                  className="bg-zinc-950 border border-zinc-800 rounded-xl p-5"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1 min-w-0">
                      <span className="font-mono text-xs text-zinc-600">
                        {artifact.problem_id}
                      </span>
                      <h3 className="text-white font-semibold truncate">{artifact.problem_title}</h3>
                    </div>
                    <span className={cn(
                      "shrink-0 px-3 py-1 rounded-full text-xs font-mono",
                      artifact.difficulty <= 3 ? "bg-emerald-500/15 text-emerald-400" :
                        artifact.difficulty <= 6 ? "bg-yellow-500/15 text-yellow-400" :
                          "bg-red-500/15 text-red-400"
                    )}>
                      Difficulty {artifact.difficulty}
                    </span>
                  </div>

                  <p className="text-zinc-400 text-sm mb-2">
                    Conquered as{' '}
                    <span className="text-orange-400 capitalize">
                      {artifact.archetype_role?.replace('_', ' ')}
                    </span>
                  </p>

                  {artifact.insight && (
                    <p className="text-sm italic text-zinc-500">
                      "{artifact.insight}"
                    </p>
                  )}

                  {artifact.level_up_verified && (
                    <div className="flex items-center gap-1.5 mt-3">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-xs text-emerald-400">
                        Level Up Verified
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-14 h-14 bg-zinc-800 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <Trophy className="w-7 h-7 text-zinc-600" />
              </div>
              <p className="text-zinc-500">
                Belum ada artifact. Selesaikan arena untuk mengumpulkannya.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
