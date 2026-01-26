import React from 'react';
import { motion } from 'framer-motion';
import { Award, Asterisk, Zap, Target, TrendingUp, Shield } from 'lucide-react';
import { cn } from "@/lib/utils";

const badgeConfig = {
  first_blood: {
    icon: Zap,
    label: 'First Blood',
    tone: 'secondary'
  },
  difficulty_jump: {
    icon: TrendingUp,
    label: 'Difficulty Jump',
    tone: 'primary'
  },
  risk_confronted: {
    icon: Target,
    label: 'Risk Confronted',
    tone: 'secondary'
  },
  streak_breaker: {
    icon: Shield,
    label: 'Streak Breaker',
    tone: 'neutral'
  },
  domain_master: {
    icon: Award,
    label: 'Domain Master',
    tone: 'primary'
  }
};

export default function BadgeDisplay({ achievements }) {
  const getToneClasses = (tone) => {
    if (tone === 'primary') {
      return {
        color: 'text-[var(--acid-lime)]',
        bg: 'bg-[rgba(51,209,122,0.12)]',
        border: 'border-[rgba(51,209,122,0.35)]'
      };
    }
    if (tone === 'secondary') {
      return {
        color: 'text-[var(--acid-orange)]',
        bg: 'bg-[rgba(255,106,61,0.12)]',
        border: 'border-[rgba(255,106,61,0.35)]'
      };
    }
    return {
      color: 'text-[var(--ink)]',
      bg: 'bg-[rgba(231,234,240,0.04)]',
      border: 'border-[rgba(231,234,240,0.18)]'
    };
  };

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
        const tone = getToneClasses(config.tone);
        
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
                <Asterisk className="w-4 h-4 text-[#0b0b0c]" />
              </div>
            )}
            
            <div className="flex items-center gap-3 mb-2">
              <div className={cn("w-10 h-10 border nx-sharp flex items-center justify-center", tone.bg, tone.border)}>
                <Icon className={cn("w-5 h-5", tone.color)} />
              </div>
              <div>
                <p className={cn("font-black text-sm tracking-[-0.02em]", tone.color)}>
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
