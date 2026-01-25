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
        <p className="nx-ink-muted text-sm">Belum ada badge. Taklukkan masalah untuk mendapatkannya.</p>
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
              "relative nx-panel-static nx-sharp p-4"
            )}
          >
            {achievement.is_highest && (
              <div className="absolute -top-3 -right-3 w-8 h-8 bg-[var(--acid-yellow)] border-[3px] border-[var(--ink)] nx-sharp flex items-center justify-center">
                <span className="text-[var(--ink)] text-xs font-black">★</span>
              </div>
            )}
            
            <div className="flex items-center gap-3 mb-2">
              <div className={cn("w-10 h-10 border-2 border-[var(--ink)] nx-sharp flex items-center justify-center", config.bgColor)}>
                <Icon className={cn("w-5 h-5", config.color)} />
              </div>
              <div>
                <p className={cn("font-black text-sm tracking-[-0.02em]", config.color)}>
                  {config.label}
                </p>
                <p className="nx-ink-faint text-xs nx-mono">
                  Lv.{achievement.difficulty_level}
                </p>
              </div>
            </div>
            
            <p className="nx-ink-muted text-xs line-clamp-2">
              {achievement.title}
            </p>
            
            <p className="nx-ink-faint text-xs mt-2 capitalize">
              {achievement.archetype_at_achievement?.replace('_', ' ')}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}
