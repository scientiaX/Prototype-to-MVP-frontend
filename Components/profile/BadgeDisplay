import React from 'react';
import { motion } from 'framer-motion';
import { Award, Zap, Target, TrendingUp, Shield } from 'lucide-react';
import { cn } from "@/lib/utils";

const badgeConfig = {
  first_blood: {
    icon: Zap,
    label: 'First Blood',
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30'
  },
  difficulty_jump: {
    icon: TrendingUp,
    label: 'Difficulty Jump',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30'
  },
  risk_confronted: {
    icon: Target,
    label: 'Risk Confronted',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30'
  },
  streak_breaker: {
    icon: Shield,
    label: 'Streak Breaker',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30'
  },
  domain_master: {
    icon: Award,
    label: 'Domain Master',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30'
  }
};

export default function BadgeDisplay({ achievements }) {
  if (!achievements || achievements.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-zinc-600 text-sm">Belum ada badge. Taklukkan masalah untuk mendapatkannya.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {achievements.map((achievement, index) => {
        const config = badgeConfig[achievement.badge_type] || badgeConfig.difficulty_jump;
        const Icon = config.icon;
        
        return (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              "relative p-4 rounded-xl border-2",
              config.bgColor,
              config.borderColor,
              achievement.is_highest && "ring-2 ring-yellow-500"
            )}
          >
            {achievement.is_highest && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                <span className="text-black text-xs font-bold">★</span>
              </div>
            )}
            
            <div className="flex items-center gap-3 mb-2">
              <Icon className={cn("w-6 h-6", config.color)} />
              <div>
                <p className={cn("font-semibold text-sm", config.color)}>
                  {config.label}
                </p>
                <p className="text-zinc-500 text-xs">
                  Lv.{achievement.difficulty_level}
                </p>
              </div>
            </div>
            
            <p className="text-zinc-400 text-xs line-clamp-2">
              {achievement.title}
            </p>
            
            <p className="text-zinc-600 text-xs mt-2 capitalize">
              {achievement.archetype_at_achievement?.replace('_', ' ')}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}
