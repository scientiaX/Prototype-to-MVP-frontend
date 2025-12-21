import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Zap, TrendingUp, AlertTriangle, Lightbulb } from 'lucide-react';

/**
 * MicroToast - Minimal feedback notifications
 * From Experience Layer: "Toast singkat (1-2 detik), Ikon kecil + teks 2-3 kata"
 */

// Toast types with icons and colors
const TOAST_CONFIG = {
    assumption_found: {
        icon: Lightbulb,
        color: 'text-yellow-400',
        bg: 'bg-yellow-500/15',
        border: 'border-yellow-500/30'
    },
    tradeoff_locked: {
        icon: Check,
        color: 'text-green-400',
        bg: 'bg-green-500/15',
        border: 'border-green-500/30'
    },
    reasoning_improved: {
        icon: TrendingUp,
        color: 'text-blue-400',
        bg: 'bg-blue-500/15',
        border: 'border-blue-500/30'
    },
    decision_stabilized: {
        icon: Check,
        color: 'text-orange-400',
        bg: 'bg-orange-500/15',
        border: 'border-orange-500/30'
    },
    warning: {
        icon: AlertTriangle,
        color: 'text-red-400',
        bg: 'bg-red-500/15',
        border: 'border-red-500/30'
    },
    hint: {
        icon: Lightbulb,
        color: 'text-blue-400',
        bg: 'bg-blue-500/15',
        border: 'border-blue-500/30'
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
                    className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 
            flex items-center gap-2 px-4 py-2 rounded-full 
            ${config.bg} border ${config.border} shadow-lg`}
                >
                    <Icon className={`w-4 h-4 ${config.color}`} />
                    <span className={`text-sm font-medium ${config.color}`}>{message}</span>
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
                    className={`fixed top-20 left-1/2 -translate-x-1/2 z-[90] 
                        flex items-center gap-2 px-4 py-2 rounded-full 
                        ${TOAST_CONFIG[toast.type]?.bg || 'bg-zinc-800'} 
                        border ${TOAST_CONFIG[toast.type]?.border || 'border-zinc-700'} 
                        shadow-lg`}
                >
                    {React.createElement(TOAST_CONFIG[toast.type]?.icon || Check, {
                        className: `w-4 h-4 ${TOAST_CONFIG[toast.type]?.color || 'text-white'}`
                    })}
                    <span className={`text-sm font-medium ${TOAST_CONFIG[toast.type]?.color || 'text-white'}`}>
                        {toast.message}
                    </span>
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
        forming: { text: 'Forming', color: 'bg-zinc-700 text-zinc-400' },
        developing: { text: 'Developing', color: 'bg-blue-500/20 text-blue-400' },
        consistent: { text: 'Consistent', color: 'bg-green-500/20 text-green-400' },
        stabilized: { text: 'Stabilized', color: 'bg-orange-500/20 text-orange-400' }
    };

    const config = statusConfig[status] || statusConfig.forming;

    return (
        <motion.span
            key={status}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`px-3 py-1 rounded-full text-xs font-medium ${config.color}`}
        >
            {config.text}
        </motion.span>
    );
}

export default MicroToast;
