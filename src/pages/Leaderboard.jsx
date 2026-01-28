import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '@/api/apiClient';
import { cn } from "@/lib/utils";

const IconBars = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round" {...props}>
    <path d="M5 18V9" />
    <path d="M12 18V6" />
    <path d="M19 18v-4" />
  </svg>
);

const IconPulse = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round" {...props}>
    <path d="M3 12h4l2-4 4 8 2-4h6" />
  </svg>
);

const IconCluster = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round" {...props}>
    <circle cx="6" cy="6" r="3" />
    <circle cx="18" cy="6" r="3" />
    <circle cx="12" cy="18" r="3" />
    <path d="M8.5 7.5l2.5 7" />
    <path d="M15.5 7.5l-2.5 7" />
  </svg>
);

const IconFrame = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round" {...props}>
    <rect x="4" y="4" width="16" height="16" />
    <path d="M8 8h8v8H8z" />
  </svg>
);

const IconCompass = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="8" />
    <path d="M14.5 9.5l-1.5 5-5 1.5 1.5-5 5-1.5z" />
  </svg>
);

const IconUsers = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round" {...props}>
    <circle cx="7" cy="9" r="3" />
    <circle cx="17" cy="9" r="3" />
    <path d="M3 20c1.5-3 8.5-3 10 0" />
    <path d="M11 20c1.2-2 6.8-2 8 0" />
  </svg>
);

const IconInfo = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 10v6" />
    <path d="M12 7h.01" />
  </svg>
);

const IconClose = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round" {...props}>
    <path d="M6 6l12 12" />
    <path d="M18 6l-12 12" />
  </svg>
);

const archetypeConfig = {
  risk_taker: { icon: IconPulse, label: 'Risk Taker', color: 'text-[var(--ink)]', bg: 'bg-[rgba(91,220,255,0.12)]' },
  analyst: { icon: IconBars, label: 'Analyst', color: 'text-[var(--ink)]', bg: 'bg-[rgba(91,220,255,0.12)]' },
  builder: { icon: IconFrame, label: 'Builder', color: 'text-[var(--ink)]', bg: 'bg-[rgba(123,107,255,0.14)]' },
  strategist: { icon: IconCompass, label: 'Strategist', color: 'text-[var(--ink)]', bg: 'bg-[rgba(123,107,255,0.14)]' }
};

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
            <div className="w-16 h-16 border border-[rgba(91,220,255,0.35)] bg-[rgba(91,220,255,0.12)] flex items-center justify-center mx-auto">
              <IconBars className="w-8 h-8 text-[var(--ink)]" />
            </div>
            <p className="mt-4 text-[var(--ink-2)] font-semibold">Loading rankings...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen nx-page relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none nx-bg-wires opacity-[0.7]" />
      <div className="absolute inset-0 pointer-events-none nx-bg-dots opacity-[0.22]" />

      <div className="nx-stage relative pt-24 md:pt-28">
        {/* Header */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-flex items-center gap-2.5 px-4 py-2 border border-[rgba(91,220,255,0.35)] bg-[rgba(91,220,255,0.12)] mb-4">
            <IconBars className="w-3.5 h-3.5 text-[var(--ink)]" />
            <span className="text-xs font-black text-[var(--ink)] tracking-wider uppercase nx-mono">Rankings</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-[var(--ink)] mb-3 tracking-[-0.06em]">
            Leaderboard
          </h1>
        </motion.div>

        {/* Mode Tabs */}
        <motion.div
          className="nx-panel nx-sharp p-2 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setActiveTab('growth')}
              className={cn(
                "relative flex items-center justify-center gap-2 py-3.5 px-4 nx-sharp text-sm font-semibold transition-colors duration-150",
                activeTab === 'growth'
                  ? "text-[var(--ink)]"
                  : "text-[var(--ink-2)] hover:text-[var(--ink)]"
              )}
            >
              {activeTab === 'growth' && (
                <motion.div
                  className="absolute left-3 right-3 -bottom-0.5 h-[2px] bg-[var(--acid-lime)]"
                  layoutId="activeTab"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <IconPulse className="w-4 h-4 relative z-10" />
              <span className="relative z-10">Growth (2 Weeks)</span>
            </button>
            <button
              onClick={() => setActiveTab('reliability')}
              className={cn(
                "relative flex items-center justify-center gap-2 py-3.5 px-4 nx-sharp text-sm font-semibold transition-colors duration-150",
                activeTab === 'reliability'
                  ? "text-[var(--ink)]"
                  : "text-[var(--ink-2)] hover:text-[var(--ink)]"
              )}
            >
              {activeTab === 'reliability' && (
                <motion.div
                  className="absolute left-3 right-3 -bottom-0.5 h-[2px] bg-[var(--acid-orange)]"
                  layoutId="activeTab"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <IconBars className="w-4 h-4 relative z-10" />
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
              "px-4 py-2.5 nx-sharp text-sm font-semibold transition-colors duration-150 border border-[rgba(231,234,240,0.18)]",
              archetypeFilter === 'all'
                ? "bg-[rgba(51,209,122,0.14)] border-[rgba(51,209,122,0.35)] text-[var(--ink)]"
                : "bg-transparent text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[rgba(231,234,240,0.04)]"
            )}
          >
            <span className="flex items-center gap-2">
              <IconUsers className="w-4 h-4" />
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
                  "flex items-center gap-2 px-4 py-2.5 nx-sharp text-sm font-semibold transition-colors duration-150 border border-[rgba(231,234,240,0.18)]",
                  archetypeFilter === key
                    ? `bg-[rgba(231,234,240,0.04)] ${config.color}`
                    : "bg-transparent text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[rgba(231,234,240,0.04)]"
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
            const displayName = profile.name || 'Anonymous';

            return (
              <motion.div
                key={profile.id || profile.user_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.03 }}
                onClick={() => setSelectedProfile(profile)}
                className={cn(
                  "group nx-panel-static nx-sharp flex items-center gap-4 p-4 cursor-pointer transition-transform duration-150 hover:-translate-y-0.5",
                  isCurrentUser
                    ? "bg-[var(--acid-orange)]/10"
                    : ""
                )}
              >
                {/* Rank */}
                <div className="w-14 text-center shrink-0">
                  <div className={cn(
                    "w-12 h-12 nx-sharp border flex items-center justify-center mx-auto",
                    isTopThree ? "bg-[rgba(51,209,122,0.14)] border-[rgba(51,209,122,0.35)]" : "bg-[rgba(231,234,240,0.04)] border-[rgba(231,234,240,0.18)]"
                  )}>
                    <span className={cn(
                      "nx-mono text-lg font-bold",
                      isTopThree ? "text-[var(--ink)]" : "text-[var(--ink-2)]"
                    )}>
                      {index + 1}
                    </span>
                  </div>
                </div>

                {/* Archetype Icon */}
                <div className={cn("w-12 h-12 nx-sharp border border-[rgba(231,234,240,0.18)] flex items-center justify-center shrink-0", archetype.bg)}>
                  <Icon className={cn("w-6 h-6", archetype.color)} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "font-black truncate text-lg tracking-[-0.02em]",
                    isCurrentUser ? "text-[var(--ink)]" : "text-[var(--ink)]"
                  )}>
                    {isCurrentUser ? 'Kamu' : displayName}
                  </p>
                  <div className="flex items-center gap-2 text-sm nx-ink-muted">
                    <span>Level {profile.current_difficulty}</span>
                    <span className="w-1 h-1 bg-[var(--ink)]" />
                    <span>{profile.total_arenas_completed || 0} arenas</span>
                  </div>
                </div>

                {/* Score */}
                <div className="text-right shrink-0">
                  <p className={cn(
                    "text-2xl font-bold font-mono",
                    "text-[var(--ink)]"
                  )}>
                    {score}
                  </p>
                  <p className="text-xs nx-ink-faint uppercase tracking-wide">
                    XP
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {filteredProfiles.length === 0 && (
          <motion.div
            className="nx-panel nx-sharp p-16 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-16 h-16 bg-[var(--paper-2)] border-[3px] border-[var(--ink)] mx-auto mb-4 flex items-center justify-center nx-sharp">
              <IconUsers className="w-8 h-8 text-[var(--ink)]" />
            </div>
            <p className="text-lg nx-ink-muted">Belum ada data untuk ditampilkan.</p>
          </motion.div>
        )}

        {/* Info Note */}
        <motion.div
          className="mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="nx-panel nx-sharp p-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 nx-sharp border border-[rgba(91,220,255,0.3)] bg-[rgba(91,220,255,0.12)] flex items-center justify-center shrink-0 mt-0.5">
                <IconInfo className="w-4 h-4 text-[var(--ink)]" />
              </div>
              <p className="text-sm nx-ink-muted">
                <span className="text-[var(--ink)] font-semibold">Note: </span>
                {activeTab === 'growth'
                  ? 'Growth leaderboard | Based on XP delta.'
                  : 'All-Time.'
                }
              </p>
            </div>
          </div>
        </motion.div>

        {/* Profile Modal */}
        <AnimatePresence>
          {selectedProfile && (
            <motion.div
              className="fixed inset-0 bg-[rgba(11,11,12,0.6)] flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProfile(null)}
            >
              <motion.div
                className="nx-panel nx-sharp max-w-md w-full overflow-hidden"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="relative bg-[rgba(231,234,240,0.03)] border-b border-[rgba(231,234,240,0.18)] p-6">
                  <button
                    onClick={() => setSelectedProfile(null)}
                    className="absolute top-4 right-4 w-10 h-10 nx-sharp border-2 border-[var(--ink)] bg-[var(--paper)] flex items-center justify-center text-[var(--ink)] transition-transform duration-100 [transition-timing-function:steps(4,end)] hover:-translate-x-0.5 hover:-translate-y-0.5"
                  >
                    <IconClose className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-4">
                    {(() => {
                      const arch = archetypeConfig[selectedProfile.primary_archetype] || archetypeConfig.analyst;
                      const ArchIcon = arch.icon;
                      return (
                        <div className={cn("w-16 h-16 nx-sharp border-[3px] border-[var(--ink)] flex items-center justify-center", arch.bg)}>
                          <ArchIcon className={cn("w-8 h-8", arch.color)} />
                        </div>
                      );
                    })()}
                    <div>
                      <h3 className="text-xl font-black text-[var(--ink)]">
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
                      <p className="text-2xl font-bold text-[var(--ink)] font-mono">
                        {selectedProfile.current_difficulty || 1}
                      </p>
                      <p className="text-xs nx-ink-faint uppercase">Level</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-[var(--acid-lime)] font-mono">
                        {(selectedProfile.xp_risk_taker || 0) + (selectedProfile.xp_analyst || 0) +
                          (selectedProfile.xp_builder || 0) + (selectedProfile.xp_strategist || 0)}
                      </p>
                      <p className="text-xs nx-ink-faint uppercase">Total XP</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-[var(--ink)] font-mono">
                        {selectedProfile.total_arenas_completed || 0}
                      </p>
                      <p className="text-xs nx-ink-faint uppercase">Arenas</p>
                    </div>
                  </div>

                  {/* XP Breakdown */}
                  <div className="space-y-3">
                    <p className="text-sm font-semibold nx-ink-muted">XP Breakdown</p>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(archetypeConfig).map(([key, config]) => {
                        const xpKey = `xp_${key}`;
                        const xpValue = selectedProfile[xpKey] || 0;
                        const ArchetypeIcon = config.icon;
                        return (
                          <div key={key} className={cn("flex items-center gap-2 p-3 nx-sharp border-2 border-[var(--ink)]", config.bg)}>
                            <ArchetypeIcon className={cn("w-4 h-4", config.color)} />
                            <span className="text-sm text-[var(--ink)] font-semibold">{config.label}</span>
                            <span className={cn("ml-auto font-mono font-bold", config.color)}>{xpValue}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Highest Difficulty */}
                  {selectedProfile.highest_difficulty_conquered > 0 && (
                    <div className="flex items-center justify-between p-4 bg-[var(--paper-2)] border-2 border-[var(--ink)] nx-sharp">
                      <span className="text-sm nx-ink-muted">Highest Difficulty Conquered</span>
                      <span className="text-lg font-bold text-[var(--acid-lime)] font-mono">
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
