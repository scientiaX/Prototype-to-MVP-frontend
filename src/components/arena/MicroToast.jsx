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
 * Manages queue of toasts
 */
export function useMicroToast() {
    const [toasts, setToasts] = useState([]);

    const showToast = (type, message, duration = 2000) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, type, message, duration }]);
    };

    const dismissToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    const ToastContainer = () => (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 space-y-2">
            <AnimatePresence>
                {toasts.map(toast => (
                    <MicroToast
                        key={toast.id}
                        type={toast.type}
                        message={toast.message}
                        duration={toast.duration}
                        onDismiss={() => dismissToast(toast.id)}
                    />
                ))}
            </AnimatePresence>
        </div>
    );

    return { showToast, ToastContainer };
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
