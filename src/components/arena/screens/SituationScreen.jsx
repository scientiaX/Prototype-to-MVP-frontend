import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Target, Clock, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";

/**
 * SituationScreen - Problem briefing display
 * From Experience Layer: "Situation screen" - first in sequential flow
 * User sees context before any action
 */
export default function SituationScreen({
    problem,
    styles,
    onStart,
    roleLabel
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`min-h-screen p-6 ${styles.container}`}
        >
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-[var(--ink-2)] font-mono text-xs">{problem.problem_id}</span>
                        {roleLabel && (
                            <span className="px-2 py-0.5 bg-[var(--paper-2)] text-[var(--ink)] text-xs font-medium nx-sharp border-[2px] border-[var(--ink)]">
                                {roleLabel.replace(/_/g, ' ').toUpperCase()}
                            </span>
                        )}
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-[var(--ink)] mb-2">
                        {problem.title}
                    </h1>
                </div>

                {/* Difficulty */}
                <div className="flex items-center gap-2 mb-6">
                    <span className="text-[var(--ink-2)] text-sm">Difficulty</span>
                    <div className="flex gap-1">
                        {Array.from({ length: 10 }).map((_, i) => (
                            <div
                                key={i}
                                className={`w-2 h-2 nx-sharp ${i < problem.difficulty
                                        ? problem.difficulty <= 3 ? "bg-green-500"
                                            : problem.difficulty <= 6 ? "bg-yellow-500"
                                                : "bg-red-500"
                                        : "bg-[var(--wire-2)]"
                                    }`}
                            />
                        ))}
                    </div>
                    <span className="text-[var(--ink-2)] font-mono text-xs">{problem.difficulty}/10</span>
                </div>

                {/* Context Card */}
                <motion.div
                    className="nx-panel nx-sharp p-6 mb-4"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="flex items-center gap-2 mb-3">
                        <Target className={`w-4 h-4 ${styles.accent}`} />
                        <h2 className={`text-sm font-semibold ${styles.accent}`}>SITUASI</h2>
                    </div>
                    <p className="text-[var(--ink)] leading-relaxed">{problem.context}</p>
                </motion.div>

                {/* Objective Card */}
                <motion.div
                    className="nx-panel nx-sharp p-6 mb-4 bg-[var(--acid-orange)]"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="flex items-center gap-2 mb-3">
                        <Target className="w-4 h-4 text-[var(--ink)]" />
                        <h2 className="text-sm font-semibold text-[var(--ink)]">YANG HARUS DIPUTUSKAN</h2>
                    </div>
                    <p className="text-[var(--ink)] leading-relaxed">{problem.objective}</p>
                </motion.div>

                {/* Constraints */}
                {problem.constraints && problem.constraints.length > 0 && (
                    <motion.div
                        className="nx-panel nx-sharp p-6 mb-6 bg-[var(--paper-2)]"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <AlertTriangle className="w-4 h-4 text-[var(--acid-magenta)]" />
                            <h2 className="text-sm font-semibold text-[var(--ink)]">BATASAN</h2>
                        </div>
                        <ul className="space-y-2">
                            {problem.constraints.map((c, i) => (
                                <li key={i} className="text-[var(--ink)] text-sm flex items-start gap-2">
                                    <span className="text-[var(--acid-magenta)]">•</span>
                                    {c}
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                )}

                {/* Start Button */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-center"
                >
                    <Button
                        onClick={onStart}
                        variant="gradient"
                        className="font-bold px-8 py-6 text-lg nx-sharp"
                    >
                        Mulai Memutuskan
                        <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                    <p className="text-[var(--ink-2)] text-sm mt-3">
                        Kamu punya waktu terbatas. Gunakan dengan bijak.
                    </p>
                </motion.div>
            </div>
        </motion.div>
    );
}
