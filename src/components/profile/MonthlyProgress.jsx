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
        <div className="nx-panel-static nx-sharp p-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[var(--ink)]" />
                    <span className="text-sm text-[var(--ink-2)]">Progres {monthName}</span>
                </div>
                <span className="text-sm nx-mono text-[var(--ink)] font-bold">
                    {currentCount}/{monthlyTarget}
                </span>
            </div>

            <div className="relative h-3 bg-[var(--paper-2)] border-2 border-[var(--ink)] overflow-hidden mb-4">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="absolute inset-y-0 left-0 bg-[var(--acid-orange)]"
                />
            </div>

            <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-[var(--ink-2)]">
                    <Flame className="w-3.5 h-3.5 text-[var(--ink)]" />
                    <span>
                        Streak:{" "}
                        <span
                            className={cn(
                                "font-semibold",
                                currentStreak >= 7 ? "text-[var(--acid-orange)]" : "text-[var(--ink)]"
                            )}
                        >
                            {currentStreak} hari
                        </span>
                    </span>
                </div>

                {longestStreak > 0 && (
                    <div className="flex items-center gap-1.5 text-[var(--ink-2)]">
                        <TrendingUp className="w-3.5 h-3.5 text-[var(--ink)]" />
                        <span>Terpanjang: <span className="font-semibold text-[var(--ink)]">{longestStreak}</span></span>
                    </div>
                )}
            </div>
        </div>
    );
}
