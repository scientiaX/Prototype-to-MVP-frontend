import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, TrendingUp, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * MonthlyProgress - Shows monthly arena completion progress
 * Subtle progress bar that shows movement over time
 */
export default function MonthlyProgress({
    monthlyArenas = [],
    currentStreak = 0,
    longestStreak = 0
}) {
    // Get current month data
    const currentMonth = new Date().toISOString().slice(0, 7); // "2026-01"
    const currentMonthData = monthlyArenas.find(m => m.month === currentMonth);
    const currentCount = currentMonthData?.count || 0;

    // Target: 20 arenas per month for full progress
    const monthlyTarget = 20;
    const progressPercent = Math.min((currentCount / monthlyTarget) * 100, 100);

    // Get month name
    const monthName = new Date().toLocaleDateString('id-ID', { month: 'long' });

    return (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-zinc-500" />
                    <span className="text-sm text-zinc-400">Progres {monthName}</span>
                </div>
                <span className="text-sm font-mono text-white">
                    {currentCount}/{monthlyTarget}
                </span>
            </div>

            {/* Progress Bar */}
            <div className="relative h-2 bg-zinc-800 rounded-full overflow-hidden mb-4">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                />
                {/* Glow effect */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-full blur-sm"
                    style={{ width: `${progressPercent}%` }}
                />
            </div>

            {/* Streak Info (subtle) */}
            <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-zinc-500">
                    <Flame className="w-3.5 h-3.5" />
                    <span>Streak: <span className={cn(
                        "font-medium",
                        currentStreak >= 7 ? "text-orange-400" : "text-zinc-400"
                    )}>{currentStreak} hari</span></span>
                </div>

                {longestStreak > 0 && (
                    <div className="flex items-center gap-1.5 text-zinc-600">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>Terpanjang: {longestStreak}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
