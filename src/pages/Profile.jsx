import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import apiClient from '@/api/apiClient';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import ArchetypeRadar from '@/components/profile/ArchetypeRadar';
import BadgeDisplay from '@/components/profile/BadgeDisplay';
import MonthlyProgress from '@/components/profile/MonthlyProgress';
import { cn } from "@/lib/utils";

const IconBars = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round" {...props}>
    <path d="M5 18V9" />
    <path d="M12 18V6" />
    <path d="M19 18v-4" />
  </svg>
);

const IconGauge = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round" {...props}>
    <path d="M4 16a8 8 0 0 1 16 0" />
    <path d="M12 12l3-4" />
    <path d="M7 16h10" />
  </svg>
);

const IconTarget = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="8" />
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v2M22 12h-2M12 22v-2M2 12h2" />
  </svg>
);

const IconBolt = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round" {...props}>
    <path d="M13 2L5 14h6l-1 8 9-14h-6z" />
  </svg>
);

const IconUser = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c2-4 14-4 16 0" />
  </svg>
);

const IconShield = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round" {...props}>
    <path d="M12 3l7 3v6c0 5-3.5 7.5-7 9-3.5-1.5-7-4-7-9V6l7-3z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

const IconArchive = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round" {...props}>
    <rect x="3" y="4" width="18" height="4" />
    <rect x="5" y="8" width="14" height="12" />
    <path d="M9 12h6" />
  </svg>
);

const IconTrend = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round" {...props}>
    <path d="M4 16l6-6 4 4 6-7" />
    <path d="M18 7h4v4" />
  </svg>
);

const IconSpinner = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="round" {...props}>
    <path d="M12 3a9 9 0 0 1 9 9" />
  </svg>
);

const archetypeConfig = {
  risk_taker: { icon: IconBolt, label: 'Risk Taker' },
  analyst: { icon: IconBars, label: 'Analyst' },
  builder: { icon: IconTarget, label: 'Builder' },
  strategist: { icon: IconGauge, label: 'Strategist' }
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
    try {
      // Check if user is authenticated
      if (!apiClient.auth.isAuthenticated()) {
        navigate('/login?redirect=/profile');
        return;
      }

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
    } catch (error) {
      console.error('Error loading profile:', error);
      // If authentication failed, redirect to login
      navigate('/login?redirect=/profile');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen nx-page relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 pointer-events-none nx-bg-wires opacity-[0.7]" />
        <div className="absolute inset-0 pointer-events-none nx-bg-dots opacity-[0.22]" />
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="nx-panel nx-sharp px-8 py-8 text-center">
            <div className="nx-crosshair -top-3 -left-3" />
            <div className="nx-crosshair -bottom-3 -right-3" />
            <div className="w-16 h-16 border border-[rgba(230,237,243,0.2)] bg-[rgba(230,237,243,0.04)] flex items-center justify-center mx-auto">
              <IconUser className="w-8 h-8 text-[var(--ink)]" />
            </div>
            <p className="mt-4 text-[var(--ink-2)] font-semibold">Loading profile...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  const archetype = archetypeConfig[profile.primary_archetype] || archetypeConfig.analyst;
  const Icon = archetype.icon;
  const totalXp = (profile.xp_risk_taker || 0) + (profile.xp_analyst || 0) +
    (profile.xp_builder || 0) + (profile.xp_strategist || 0);

  const stats = [
    { icon: IconGauge, value: profile.current_difficulty, label: 'Current Level', accent: 'bg-[rgba(45,255,138,0.14)] border-[rgba(45,255,138,0.35)]' },
    { icon: IconBolt, value: totalXp, label: 'Total XP', accent: 'bg-[rgba(230,237,243,0.04)] border-[rgba(230,237,243,0.2)]' },
    { icon: IconBars, value: profile.highest_difficulty_conquered || 0, label: 'Highest Conquered', accent: 'bg-[rgba(255,122,69,0.14)] border-[rgba(255,122,69,0.35)]' },
    { icon: IconTarget, value: profile.total_arenas_completed || 0, label: 'Arenas Completed', accent: 'bg-[rgba(230,237,243,0.04)] border-[rgba(230,237,243,0.2)]' }
  ];

  return (
    <div className="min-h-screen nx-page relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none nx-bg-wires opacity-[0.7]" />
      <div className="absolute inset-0 pointer-events-none nx-bg-dots opacity-[0.22]" />

      <div className="nx-stage relative pt-24 md:pt-28">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          {/* Archetype Icon */}
          <div className="relative inline-block mb-6">
            <motion.div
              className={cn(
                "w-28 h-28 nx-sharp border border-[rgba(231,234,240,0.18)] bg-[rgba(231,234,240,0.04)] flex items-center justify-center"
              )}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              <Icon className="w-14 h-14 text-[var(--ink)]" />
            </motion.div>
          </div>

          <h1 className={cn("text-4xl md:text-5xl font-bold mb-3 text-[var(--ink)]")}>
            {archetype.label}
          </h1>

          <p className="nx-ink-muted capitalize text-lg">
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
              className="group nx-panel nx-sharp p-5 text-center"
            >
              <div className={cn("w-11 h-11 border mx-auto mb-3 flex items-center justify-center", stat.accent)}>
                <stat.icon className="w-5 h-5 text-[var(--ink)]" />
              </div>
              <p className="text-3xl font-bold text-[var(--ink)] nx-mono mb-1">{stat.value}</p>
              <p className="text-xs nx-ink-muted">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Monthly Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="mb-10"
        >
          <MonthlyProgress
            monthlyArenas={profile.monthly_arenas || []}
            currentStreak={profile.current_streak || 0}
            longestStreak={profile.longest_streak || 0}
          />
        </motion.div>

        {/* Archetype Radar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="nx-panel nx-sharp p-8 mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 border border-[rgba(231,234,240,0.18)] bg-[rgba(231,234,240,0.04)] flex items-center justify-center nx-sharp">
              <IconTarget className="w-5 h-5 text-[var(--ink)]" />
            </div>
            <h2 className="text-[var(--ink)] font-black text-xl tracking-[-0.04em]">Archetype Distribution</h2>
          </div>

          <ArchetypeRadar profile={profile} />

          {/* XP Breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t-2 border-[var(--ink)]">
            {Object.entries(archetypeConfig).map(([key, config]) => {
              const xp = profile[`xp_${key}`] || 0;
              const ConfigIcon = config.icon;
              const isPrimary = key === profile.primary_archetype;
              return (
                <div key={key} className="text-center group">
                  <div className={cn(
                    "w-8 h-8 border mx-auto mb-2 flex items-center justify-center",
                    isPrimary ? "bg-[rgba(51,209,122,0.14)] border-[rgba(51,209,122,0.35)]" : "bg-[rgba(231,234,240,0.04)] border-[rgba(231,234,240,0.18)]"
                  )}>
                    <ConfigIcon className="w-4 h-4 text-[var(--ink)]" />
                  </div>
                  <p className={cn("font-mono text-2xl font-bold", isPrimary ? "text-[var(--acid-lime)]" : "text-[var(--ink)]")}>{xp}</p>
                  <p className="text-xs nx-ink-muted">{config.label}</p>
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
          className="nx-panel nx-sharp p-8 mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 border border-[rgba(231,234,240,0.18)] bg-[rgba(231,234,240,0.04)] flex items-center justify-center nx-sharp">
              <IconShield className="w-5 h-5 text-[var(--ink)]" />
            </div>
            <div>
              <h2 className="text-[var(--ink)] font-black text-xl tracking-[-0.04em]">Badges/Achievements</h2>
              <p className="text-sm nx-ink-muted">Proof of your battles</p>
            </div>
          </div>
          <BadgeDisplay achievements={achievements} />
        </motion.div>

        {/* Portfolio Artifacts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="nx-panel nx-sharp p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 border border-[rgba(231,234,240,0.18)] bg-[rgba(231,234,240,0.04)] flex items-center justify-center nx-sharp">
              <IconArchive className="w-5 h-5 text-[var(--ink)]" />
            </div>
            <div>
              <h2 className="text-[var(--ink)] font-black text-xl tracking-[-0.04em]">Portfolio Artifacts</h2>
              <p className="text-sm nx-ink-muted">Problems you've conquered</p>
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
                  className="nx-panel-static nx-sharp p-5 group"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1 min-w-0">
                      <span className="nx-mono text-xs nx-ink-faint">
                        {artifact.problem_id}
                      </span>
                      <h3 className="text-[var(--ink)] font-black truncate tracking-[-0.02em]">{artifact.problem_title}</h3>
                    </div>
                    <span className={cn(
                      "shrink-0 px-3 py-1.5 nx-sharp text-xs nx-mono font-bold border-2 border-[var(--ink)]",
                      artifact.difficulty <= 3 ? "bg-[var(--acid-lime)]/40 text-[var(--ink)]" :
                        artifact.difficulty <= 6 ? "bg-[var(--acid-yellow)]/50 text-[var(--ink)]" :
                          "bg-[var(--acid-orange)]/25 text-[var(--ink)]"
                    )}>
                      Difficulty {artifact.difficulty}
                    </span>
                  </div>

                  <p className="nx-ink-muted text-sm mb-2">
                    Conquered as{' '}
                    <span className="text-[var(--ink)] capitalize font-semibold underline decoration-[var(--acid-orange)] decoration-[3px] underline-offset-4">
                      {artifact.archetype_role?.replace('_', ' ')}
                    </span>
                  </p>

                  {artifact.insight && (
                    <p className="text-sm italic nx-ink-muted bg-[var(--paper-2)] border-2 border-[var(--ink)] nx-sharp px-3 py-2 mt-3">
                      "{artifact.insight}"
                    </p>
                  )}

                  {artifact.level_up_verified && (
                    <div className="flex items-center gap-1.5 mt-3">
                      <IconTrend className="w-3.5 h-3.5 text-[var(--ink)]" />
                      <span className="text-xs text-[var(--ink)] font-semibold">
                        Level Up Verified
                      </span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-[rgba(231,234,240,0.04)] border border-[rgba(231,234,240,0.18)] mx-auto mb-4 flex items-center justify-center nx-sharp">
              <IconArchive className="w-8 h-8 text-[var(--ink)]" />
              </div>
              <p className="text-lg text-[var(--ink)] font-semibold mb-2">
                Belum ada artifact
              </p>
              <p className="nx-ink-muted max-w-sm mx-auto">
                Selesaikan arena untuk mengumpulkan bukti pertempuranmu
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
