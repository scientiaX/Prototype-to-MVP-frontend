import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Zap, Target, TrendingUp, Crown, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * SavageNotification - ML-style appreciation notifications
 * Appears during arena events like risky choices, fast decisions, streak milestones
 */

const notificationConfig = {
    risky_choice: {
        icon: Flame,
        title: '🔥 BERANI!',
        color: 'from-red-500 to-orange-500',
        bgColor: 'bg-red-500/20',
        borderColor: 'border-red-500/50'
    },
    fast_decision: {
        icon: Zap,
        title: '⚡ KILAT!',
        color: 'from-yellow-400 to-amber-500',
        bgColor: 'bg-yellow-500/20',
        borderColor: 'border-yellow-500/50'
    },
    rare_path: {
        icon: Target,
        title: '🎯 LANGKA!',
        color: 'from-purple-500 to-violet-500',
        bgColor: 'bg-purple-500/20',
        borderColor: 'border-purple-500/50'
    },
    streak_3: {
        icon: TrendingUp,
        title: '🔥 3 HARI BERUNTUN!',
        color: 'from-orange-500 to-red-500',
        bgColor: 'bg-orange-500/20',
        borderColor: 'border-orange-500/50'
    },
    streak_7: {
        icon: Crown,
        title: '👑 SEMINGGU KONSISTEN!',
        color: 'from-yellow-500 to-orange-500',
        bgColor: 'bg-yellow-500/20',
        borderColor: 'border-yellow-500/50'
    },
    streak_14: {
        icon: Sparkles,
        title: '✨ UNSTOPPABLE!',
        color: 'from-cyan-400 to-blue-500',
        bgColor: 'bg-cyan-500/20',
        borderColor: 'border-cyan-500/50'
    },
    streak_30: {
        icon: Crown,
        title: '🏆 LEGENDARY!',
        color: 'from-amber-400 to-yellow-500',
        bgColor: 'bg-amber-500/20',
        borderColor: 'border-amber-500/50'
    }
};

export default function SavageNotification({
    type,
    message,
    show,
    onDismiss,
    duration = 3000
}) {
    const [visible, setVisible] = useState(false);

    const config = notificationConfig[type] || notificationConfig.risky_choice;
    const Icon = config.icon;

    useEffect(() => {
        if (show) {
            setVisible(true);

            // Auto dismiss
            const timer = setTimeout(() => {
                setVisible(false);
                setTimeout(() => onDismiss?.(), 300);
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [show, duration, onDismiss]);

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ x: 100, opacity: 0, scale: 0.8 }}
                    animate={{ x: 0, opacity: 1, scale: 1 }}
                    exit={{ x: 100, opacity: 0, scale: 0.8 }}
                    transition={{ type: 'spring', damping: 15, stiffness: 300 }}
                    className="fixed top-20 right-4 z-[100] max-w-sm"
                >
                    {/* Glow effect */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className={cn(
                            "absolute -inset-1 rounded-2xl blur-lg",
                            `bg-gradient-to-r ${config.color}`
                        )}
                    />

                    {/* Main notification */}
                    <div className={cn(
                        "relative rounded-xl border p-4 backdrop-blur-sm",
                        config.bgColor,
                        config.borderColor
                    )}>
                        <div className="flex items-center gap-3">
                            {/* Icon with pulse */}
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 0.5, repeat: 2 }}
                                className={cn(
                                    "w-12 h-12 rounded-xl flex items-center justify-center",
                                    `bg-gradient-to-br ${config.color}`
                                )}
                            >
                                <Icon className="w-6 h-6 text-white" />
                            </motion.div>

                            {/* Text */}
                            <div>
                                <motion.p
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="font-bold text-white text-lg"
                                >
                                    {config.title}
                                </motion.p>
                                {message && (
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.2 }}
                                        className="text-zinc-300 text-sm mt-0.5"
                                    >
                                        {message}
                                    </motion.p>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// Hook for managing savage notifications
export function useSavageNotification() {
    const [notification, setNotification] = useState(null);

    const showNotification = (type, message = null) => {
        setNotification({ type, message, show: true });
    };

    const dismissNotification = () => {
        setNotification(null);
    };

    // Check streak milestones
    const checkStreakMilestone = (currentStreak) => {
        if (currentStreak === 30) showNotification('streak_30');
        else if (currentStreak === 14) showNotification('streak_14');
        else if (currentStreak === 7) showNotification('streak_7');
        else if (currentStreak === 3) showNotification('streak_3');
    };

    return {
        notification,
        showNotification,
        dismissNotification,
        checkStreakMilestone
    };
}
