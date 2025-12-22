import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import apiClient from '@/api/apiClient';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getTranslation } from '@/components/utils/translations';
import { Trophy, Zap, TrendingUp, Target, Brain, Wrench, Crown } from 'lucide-react';
import { cn } from "@/lib/utils";

const archetypeConfig = {
  risk_taker: { icon: Zap, label: 'Risk Taker', color: 'text-red-500', bgColor: 'bg-red-500/10' },
  analyst: { icon: Brain, label: 'Analyst', color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
  builder: { icon: Wrench, label: 'Builder', color: 'text-green-500', bgColor: 'bg-green-500/10' },
  strategist: { icon: Target, label: 'Strategist', color: 'text-purple-500', bgColor: 'bg-purple-500/10' }
};

export default function Leaderboard() {
  const [profiles, setProfiles] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('growth');
  const [archetypeFilter, setArchetypeFilter] = useState('all');

  const t = getTranslation(userProfile?.language || 'en');

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    const user = await apiClient.auth.me();
    setCurrentUser(user);

    // Get user's profile to determine language
    const userProfiles = await apiClient.entities.UserProfile.filter({ created_by: user.email });
    if (userProfiles.length > 0) {
      setUserProfile(userProfiles[0]);
    }

    const allProfiles = await apiClient.api.profiles.getLeaderboard();
    setProfiles(allProfiles);
  };

  const getGrowthScore = (profile) => {
    // Growth = XP delta + difficulty jumps in last 2 weeks
    const totalXp = (profile.xp_risk_taker || 0) + (profile.xp_analyst || 0) +
      (profile.xp_builder || 0) + (profile.xp_strategist || 0);
    return totalXp;
  };

  const getReliabilityScore = (profile) => {
    // Reliability = consistency in high difficulty
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

  const rankColors = ['text-yellow-500', 'text-zinc-400', 'text-amber-600'];

  return (
    <div className="min-h-screen bg-black p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">{t.leaderboard.title}</h1>
          <p className="text-zinc-500">{t.leaderboard.subtitle}</p>
        </div>

        {/* Mode Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="w-full bg-zinc-900 p-1 rounded-lg">
            <TabsTrigger
              value="growth"
              className="flex-1 data-[state=active]:bg-orange-500 data-[state=active]:text-black"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              {t.leaderboard.growth}
            </TabsTrigger>
            <TabsTrigger
              value="reliability"
              className="flex-1 data-[state=active]:bg-orange-500 data-[state=active]:text-black"
            >
              <Trophy className="w-4 h-4 mr-2" />
              {t.leaderboard.reliability}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Archetype Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setArchetypeFilter('all')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              archetypeFilter === 'all'
                ? "bg-white text-black"
                : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800"
            )}
          >
            {t.leaderboard.all}
          </button>
          {Object.entries(archetypeConfig).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <button
                key={key}
                onClick={() => setArchetypeFilter(key)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2",
                  archetypeFilter === key
                    ? `${config.bgColor} ${config.color}`
                    : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800"
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

            return (
              <motion.div
                key={profile.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-xl border transition-all",
                  isCurrentUser
                    ? "bg-orange-500/10 border-orange-500/30"
                    : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700"
                )}
              >
                {/* Rank */}
                <div className="w-12 text-center">
                  {index < 3 ? (
                    <Crown className={cn("w-6 h-6 mx-auto", rankColors[index])} />
                  ) : (
                    <span className="text-zinc-500 font-mono text-lg">{index + 1}</span>
                  )}
                </div>

                {/* Archetype Icon */}
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  archetype.bgColor
                )}>
                  <Icon className={cn("w-5 h-5", archetype.color)} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "font-semibold truncate",
                    isCurrentUser ? "text-orange-500" : "text-white"
                  )}>
                    {isCurrentUser ? t.leaderboard.you : `Player ${profile.id.slice(-4)}`}
                  </p>
                  <p className="text-zinc-500 text-sm">
                    Level {profile.current_difficulty} • {profile.total_arenas_completed || 0} {t.leaderboard.arenas}
                  </p>
                </div>

                {/* Score */}
                <div className="text-right">
                  <p className={cn(
                    "text-xl font-bold font-mono",
                    index < 3 ? rankColors[index] : "text-white"
                  )}>
                    {score}
                  </p>
                  <p className="text-zinc-600 text-xs">
                    {activeTab === 'growth' ? t.leaderboard.xp : 'Reliability'}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {filteredProfiles.length === 0 && (
          <div className="text-center py-16">
            <p className="text-zinc-500">{t.leaderboard.noData}</p>
          </div>
        )}

        {/* Info */}
        <div className="mt-8 p-4 bg-zinc-900/30 border border-zinc-800 rounded-lg">
          <p className="text-zinc-500 text-sm">
            <span className="text-orange-500 font-semibold">{t.leaderboard.note}</span>{' '}
            {activeTab === 'growth'
              ? t.leaderboard.growthNote
              : t.leaderboard.reliabilityNote
            }
          </p>
        </div>
      </div>
    </div>
  );
}
