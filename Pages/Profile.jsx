import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import apiClient from '@/api/apiClient';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import ArchetypeRadar from '@/components/profile/ArchetypeRadar';
import BadgeDisplay from '@/components/profile/BadgeDisplay';
import { getTranslation } from '@/components/utils/translations';
import { Loader2, Zap, Target, Brain, Wrench, Trophy, TrendingUp, Clock } from 'lucide-react';
import { cn } from "@/lib/utils";

const archetypeConfig = {
  risk_taker: { icon: Zap, label: 'Risk Taker', color: 'text-red-500' },
  analyst: { icon: Brain, label: 'Analyst', color: 'text-blue-500' },
  builder: { icon: Wrench, label: 'Builder', color: 'text-green-500' },
  strategist: { icon: Target, label: 'Strategist', color: 'text-purple-500' }
};

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [artifacts, setArtifacts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const t = getTranslation(profile?.language || 'en');

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
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  const archetype = archetypeConfig[profile.primary_archetype] || archetypeConfig.analyst;
  const Icon = archetype.icon;
  const totalXp = (profile.xp_risk_taker || 0) + (profile.xp_analyst || 0) +
    (profile.xp_builder || 0) + (profile.xp_strategist || 0);

  return (
    <div className="min-h-screen bg-black p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className={cn(
            "inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4",
            "bg-zinc-900 border-2 border-zinc-800"
          )}>
            <Icon className={cn("w-10 h-10", archetype.color)} />
          </div>
          <h1 className={cn("text-3xl font-bold", archetype.color)}>
            {archetype.label}
          </h1>
          <p className="text-zinc-500 mt-1 capitalize">
            {profile.domain?.replace('_', ' ')} • {profile.aspiration?.replace('_', ' ')}
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-center"
          >
            <Trophy className="w-5 h-5 text-orange-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{profile.current_difficulty}</p>
            <p className="text-zinc-500 text-xs">{t.profile.currentLevel}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-center"
          >
            <Zap className="w-5 h-5 text-yellow-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{totalXp}</p>
            <p className="text-zinc-500 text-xs">{t.profile.totalXp}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-center"
          >
            <TrendingUp className="w-5 h-5 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{profile.highest_difficulty_conquered || 0}</p>
            <p className="text-zinc-500 text-xs">{t.profile.highestConquered}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-center"
          >
            <Target className="w-5 h-5 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{profile.total_arenas_completed || 0}</p>
            <p className="text-zinc-500 text-xs">{t.profile.arenasCompleted}</p>
          </motion.div>
        </div>

        {/* Archetype Radar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-8"
        >
          <h2 className="text-white font-semibold mb-4">{t.profile.archetypeDistribution}</h2>
          <ArchetypeRadar profile={profile} />

          {/* XP breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            {Object.entries(archetypeConfig).map(([key, config]) => {
              const xp = profile[`xp_${key}`] || 0;
              return (
                <div key={key} className="text-center">
                  <p className={cn("font-mono text-lg font-bold", config.color)}>{xp}</p>
                  <p className="text-zinc-600 text-xs">{config.label}</p>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Badges / Achievements */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-8"
        >
          <h2 className="text-white font-semibold mb-4">{t.profile.badges}</h2>
          <BadgeDisplay achievements={achievements} />
        </motion.div>

        {/* Portfolio Artifacts */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6"
        >
          <h2 className="text-white font-semibold mb-4">{t.profile.portfolio}</h2>

          {artifacts.length > 0 ? (
            <div className="space-y-4">
              {artifacts.map((artifact) => (
                <div
                  key={artifact.id}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="text-zinc-600 font-mono text-xs">{artifact.problem_id}</span>
                      <h3 className="text-white font-semibold">{artifact.problem_title}</h3>
                    </div>
                    <div className="text-right">
                      <span className={cn(
                        "inline-block px-2 py-1 rounded text-xs font-mono",
                        artifact.difficulty <= 3 ? "bg-green-500/20 text-green-500" :
                          artifact.difficulty <= 6 ? "bg-yellow-500/20 text-yellow-500" :
                            "bg-red-500/20 text-red-500"
                      )}>
                        {t.profile.difficulty} {artifact.difficulty}
                      </span>
                    </div>
                  </div>

                  <p className="text-zinc-400 text-sm mb-2">
                    {t.profile.conqueredAs} <span className="text-orange-500 capitalize">{artifact.archetype_role?.replace('_', ' ')}</span>
                  </p>

                  {artifact.insight && (
                    <p className="text-zinc-500 text-sm italic">
                      "{artifact.insight}"
                    </p>
                  )}

                  {artifact.level_up_verified && (
                    <div className="flex items-center gap-1 mt-2">
                      <TrendingUp className="w-3 h-3 text-green-500" />
                      <span className="text-green-500 text-xs">{t.profile.levelUpVerified}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-zinc-600 text-center py-8">
              {t.profile.noArtifacts}
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
