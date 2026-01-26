import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, TrendingUp, AlertTriangle, Lightbulb } from 'lucide-react';

/**
 * MicroToast - Minimal feedback notifications
 * From Experience Layer: "Toast singkat (1-2 detik), Ikon kecil + teks 2-3 kata"
 */

// Toast types with icons and colors
const TOAST_CONFIG = {
    assumption_found: {
        icon: Lightbulb,
        accentBg: 'bg-[var(--acid-yellow)]'
    },
    tradeoff_locked: {
        icon: Check,
        accentBg: 'bg-[var(--acid-lime)]'
    },
    reasoning_improved: {
        icon: TrendingUp,
        accentBg: 'bg-[var(--acid-cyan)]'
    },
    decision_stabilized: {
        icon: Check,
        accentBg: 'bg-[var(--acid-orange)]'
    },
    warning: {
        icon: AlertTriangle,
        accentBg: 'bg-[var(--acid-magenta)]'
    },
    hint: {
        icon: Lightbulb,
        accentBg: 'bg-[var(--acid-cyan)]'
    }
};

export function MicroToast({ type, message, duration = 2000, onDismiss }) {
    const [visible, setVisible] = useState(true);
    const config = TOAST_CONFIG[type] || TOAST_CONFIG.decision_stabilized;
    const Icon = config.icon;

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
            onDismiss?.();
        }, duration);
        return () => clearTimeout(timer);
    }, [duration, onDismiss]);

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 bg-[var(--paper)] border-[3px] border-[var(--ink)] shadow-[6px_6px_0_var(--ink)] nx-sharp"
                >
                    <span className={`w-6 h-6 ${config.accentBg} border-[2px] border-[var(--ink)] nx-sharp flex items-center justify-center`}>
                        <Icon className="w-4 h-4 text-[var(--ink)]" />
                    </span>
                    <span className="text-sm font-bold text-[var(--ink)]">{message}</span>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

/**
 * Toast Manager Hook
 * Manages queue of toasts - max 1 at a time to prevent spam
 */
export function useMicroToast() {
    const [toast, setToast] = useState(null);
    const timeoutRef = React.useRef(null);

    const showToast = (type, message, duration = 2000) => {
        // Clear existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Only 1 toast at a time
        const id = Date.now();
        setToast({ id, type, message, duration });

        // Auto dismiss
        timeoutRef.current = setTimeout(() => {
            setToast(null);
        }, duration);
    };

    const dismissToast = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setToast(null);
    };

    // Position below header (top-20 = 80px)
    const ToastContainer = () => (
        <AnimatePresence>
            {toast && (
                <motion.div
                    key={toast.id}
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    className="fixed top-20 left-1/2 -translate-x-1/2 z-[90] flex items-center gap-2 px-4 py-2 bg-[var(--paper)] border-[3px] border-[var(--ink)] shadow-[6px_6px_0_var(--ink)] nx-sharp"
                >
                    <span className={`w-6 h-6 ${TOAST_CONFIG[toast.type]?.accentBg || 'bg-[var(--paper-2)]'} border-[2px] border-[var(--ink)] nx-sharp flex items-center justify-center`}>
                        {React.createElement(TOAST_CONFIG[toast.type]?.icon || Check, {
                            className: "w-4 h-4 text-[var(--ink)]"
                        })}
                    </span>
                    <span className="text-sm font-bold text-[var(--ink)]">{toast.message}</span>
                </motion.div>
            )}
        </AnimatePresence>
    );

    return { showToast, ToastContainer, dismissToast };
}

/**
 * Progress Chip - Status indicator
 * From Experience Layer: "Status chip: forming → consistent"
 */
export function ProgressChip({ status }) {
    const statusConfig = {
        forming: { text: 'Forming', bg: 'bg-[var(--paper-2)]' },
        developing: { text: 'Developing', bg: 'bg-[var(--acid-cyan)]' },
        consistent: { text: 'Consistent', bg: 'bg-[var(--acid-lime)]' },
        stabilized: { text: 'Stabilized', bg: 'bg-[var(--acid-orange)]' }
    };

    const config = statusConfig[status] || statusConfig.forming;

    return (
        <motion.span
            key={status}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`px-3 py-1 text-xs font-bold ${config.bg} text-[var(--ink)] border-[2px] border-[var(--ink)] nx-sharp`}
        >
            {config.text}
        </motion.span>
    );
}

export default MicroToast;
