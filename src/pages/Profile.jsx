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
  risk_taker: { icon: Zap, label: 'Risk Taker', color: 'var(--danger-400)', bg: 'rgba(244, 63, 94, 0.15)' },
  analyst: { icon: Brain, label: 'Analyst', color: 'var(--accent-400)', bg: 'rgba(6, 182, 212, 0.15)' },
  builder: { icon: Wrench, label: 'Builder', color: 'var(--success-400)', bg: 'rgba(16, 185, 129, 0.15)' },
  strategist: { icon: Target, label: 'Strategist', color: 'var(--violet-400)', bg: 'rgba(139, 92, 246, 0.15)' }
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--black)' }}>
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--primary-500)' }} />
          <span style={{ color: 'var(--gray-400)' }}>Loading profile...</span>
        </div>
      </div>
    );
  }

  const archetype = archetypeConfig[profile.primary_archetype] || archetypeConfig.analyst;
  const Icon = archetype.icon;
  const totalXp = (profile.xp_risk_taker || 0) + (profile.xp_analyst || 0) +
    (profile.xp_builder || 0) + (profile.xp_strategist || 0);

  const stats = [
    { icon: Trophy, value: profile.current_difficulty, label: 'Current Level', color: 'var(--primary-400)' },
    { icon: Zap, value: totalXp, label: 'Total XP', color: 'var(--warning-400)' },
    { icon: TrendingUp, value: profile.highest_difficulty_conquered || 0, label: 'Highest Conquered', color: 'var(--success-400)' },
    { icon: Target, value: profile.total_arenas_completed || 0, label: 'Arenas Completed', color: 'var(--accent-400)' }
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--black)' }}>
      <div className="container py-8 max-w-4xl">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div
            className="w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ background: archetype.bg }}
          >
            <Icon className="w-12 h-12" style={{ color: archetype.color }} />
          </div>

          <h1
            className="font-bold mb-2"
            style={{ color: archetype.color, fontSize: 'var(--heading-page)' }}
          >
            {archetype.label}
          </h1>

          <p style={{ color: 'var(--gray-500)' }}>
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
              className="card p-5 text-center"
            >
              <stat.icon className="w-5 h-5 mx-auto mb-3" style={{ color: stat.color }} />
              <p className="text-2xl font-bold text-white font-mono mb-1">{stat.value}</p>
              <p className="text-xs" style={{ color: 'var(--gray-500)' }}>{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Archetype Radar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="card p-8 mb-8"
        >
          <h2 className="text-white font-bold text-lg mb-6">Archetype Distribution</h2>
          <ArchetypeRadar profile={profile} />

          {/* XP Breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6" style={{ borderTop: '1px solid var(--gray-800)' }}>
            {Object.entries(archetypeConfig).map(([key, config]) => {
              const xp = profile[`xp_${key}`] || 0;
              return (
                <div key={key} className="text-center">
                  <p className="font-mono text-xl font-bold" style={{ color: config.color }}>{xp}</p>
                  <p className="text-xs" style={{ color: 'var(--gray-600)' }}>{config.label}</p>
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
          className="card p-8 mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <Award className="w-5 h-5" style={{ color: 'var(--primary-400)' }} />
            <h2 className="text-white font-bold text-lg">Badges (Scars)</h2>
          </div>
          <BadgeDisplay achievements={achievements} />
        </motion.div>

        {/* Portfolio Artifacts */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="card p-8"
        >
          <h2 className="text-white font-bold text-lg mb-6">Portfolio Artifacts</h2>

          {artifacts.length > 0 ? (
            <div className="space-y-4">
              {artifacts.map((artifact) => (
                <div
                  key={artifact.id}
                  className="p-5 rounded-xl"
                  style={{ background: 'var(--gray-900)', border: '1px solid var(--gray-800)' }}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1 min-w-0">
                      <span className="font-mono text-xs" style={{ color: 'var(--gray-600)' }}>
                        {artifact.problem_id}
                      </span>
                      <h3 className="text-white font-semibold truncate">{artifact.problem_title}</h3>
                    </div>
                    <span
                      className="badge shrink-0"
                      style={{
                        background: artifact.difficulty <= 3 ? 'rgba(16, 185, 129, 0.15)' :
                          artifact.difficulty <= 6 ? 'rgba(245, 158, 11, 0.15)' :
                            'rgba(244, 63, 94, 0.15)',
                        color: artifact.difficulty <= 3 ? 'var(--success-400)' :
                          artifact.difficulty <= 6 ? 'var(--warning-400)' :
                            'var(--danger-400)'
                      }}
                    >
                      Difficulty {artifact.difficulty}
                    </span>
                  </div>

                  <p style={{ color: 'var(--gray-400)' }} className="text-sm mb-2">
                    Conquered as{' '}
                    <span style={{ color: 'var(--primary-400)' }} className="capitalize">
                      {artifact.archetype_role?.replace('_', ' ')}
                    </span>
                  </p>

                  {artifact.insight && (
                    <p className="text-sm italic" style={{ color: 'var(--gray-500)' }}>
                      "{artifact.insight}"
                    </p>
                  )}

                  {artifact.level_up_verified && (
                    <div className="flex items-center gap-1.5 mt-3">
                      <TrendingUp className="w-3.5 h-3.5" style={{ color: 'var(--success-400)' }} />
                      <span className="text-xs" style={{ color: 'var(--success-400)' }}>
                        Level Up Verified
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div
                className="w-14 h-14 rounded-xl mx-auto mb-4 flex items-center justify-center"
                style={{ background: 'var(--gray-800)' }}
              >
                <Trophy className="w-7 h-7" style={{ color: 'var(--gray-600)' }} />
              </div>
              <p style={{ color: 'var(--gray-500)' }}>
                Belum ada artifact. Selesaikan arena untuk mengumpulkannya.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
