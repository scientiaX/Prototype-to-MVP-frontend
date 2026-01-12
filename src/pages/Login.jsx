import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';
import { User, Lock, Mail, ArrowRight, Flame, Sparkles, Loader2 } from 'lucide-react';
import apiClient from '@/api/apiClient';
import { getTranslation } from '@/components/utils/translations';

export default function Login() {
    const [isRegister, setIsRegister] = useState(true); // Default to register for new users
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [focused, setFocused] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Default to English for login page
    const t = getTranslation('en');

    const validateEmail = (email) => {
        return /^\S+@\S+\.\S+$/.test(email);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (isRegister && !name.trim()) {
            setError(t.login.errorName);
            return;
        }

        if (!email.trim() || !validateEmail(email)) {
            setError(t.login.errorEmail);
            return;
        }

        if (!password.trim()) {
            setError(t.login.errorPassword);
            return;
        }

        setLoading(true);

        try {
            if (isRegister) {
                await apiClient.auth.register(email.trim(), password, name.trim());
            } else {
                await apiClient.auth.login(email.trim(), password);
            }

            const redirectTo = searchParams.get('redirect') || '/calibration';
            navigate(redirectTo);
        } catch (err) {
            console.error('Auth error:', err);
            const errorMsg = err.response?.data?.error || err.message || 'Authentication failed';

            if (errorMsg.includes('already registered') || errorMsg.includes('Email already')) {
                setError(t.login.errorEmailTaken);
            } else if (errorMsg.includes('Invalid email or password')) {
                setError('Invalid email or password');
            } else {
                setError(errorMsg);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Central glow */}
                <motion.div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full"
                    style={{
                        background: 'radial-gradient(circle, rgba(249, 115, 22, 0.12) 0%, rgba(234, 88, 12, 0.06) 40%, transparent 70%)'
                    }}
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.6, 0.9, 0.6]
                    }}
                    transition={{
                        duration: 6,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />

                {/* Secondary accent */}
                <motion.div
                    className="absolute top-[20%] right-[10%] w-[300px] h-[300px] rounded-full"
                    style={{
                        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 60%)'
                    }}
                    animate={{
                        y: [-20, 20, -20],
                        opacity: [0.4, 0.7, 0.4]
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />

                {/* Grid pattern */}
                <div
                    className="absolute inset-0 opacity-[0.02]"
                    style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), 
                             linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
                        backgroundSize: '60px 60px'
                    }}
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 w-full max-w-md"
            >
                {/* Card glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/15 to-red-500/10 rounded-3xl blur-xl opacity-60" />

                <div className="relative bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8 shadow-2xl">
                    {/* Decorative corner */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl" />

                    {/* Header */}
                    <div className="text-center mb-8 relative z-10">
                        <motion.div
                            className="relative inline-block mb-6"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                        >
                            <div className="relative">
                                <img
                                    src="/favicon.png"
                                    alt="NovaX"
                                    className="w-20 h-20 rounded-2xl shadow-lg shadow-orange-500/30"
                                />
                                <div className="absolute inset-0 rounded-2xl bg-orange-500/20 blur-lg opacity-50" />
                            </div>
                        </motion.div>

                        <h1 className="text-2xl font-bold text-white mb-2">
                            {t.login.title} <span className="text-gradient-fire">{t.login.titleHighlight}</span>
                        </h1>
                        <p className="text-zinc-500">
                            {t.login.subtitle}
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                        {/* Name (only for register) */}
                        {isRegister && (
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">
                                    {t.login.nameLabel}
                                </label>
                                <div className="relative group">
                                    <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${focused === 'name' ? 'text-orange-400' : 'text-zinc-500'}`}>
                                        <User className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        onFocus={() => setFocused('name')}
                                        onBlur={() => setFocused(null)}
                                        className="w-full pl-12 pr-4 py-3.5 bg-zinc-800/80 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-200 hover:border-zinc-600"
                                        placeholder={t.login.namePlaceholder}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                                {t.login.emailLabel}
                            </label>
                            <div className="relative group">
                                <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${focused === 'email' ? 'text-orange-400' : 'text-zinc-500'}`}>
                                    <Mail className="w-5 h-5" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onFocus={() => setFocused('email')}
                                    onBlur={() => setFocused(null)}
                                    className="w-full pl-12 pr-4 py-3.5 bg-zinc-800/80 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-200 hover:border-zinc-600"
                                    placeholder={t.login.emailPlaceholder}
                                    autoFocus={!isRegister}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                                {t.login.passwordLabel}
                            </label>
                            <div className="relative group">
                                <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${focused === 'password' ? 'text-orange-400' : 'text-zinc-500'}`}>
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onFocus={() => setFocused('password')}
                                    onBlur={() => setFocused(null)}
                                    className="w-full pl-12 pr-4 py-3.5 bg-zinc-800/80 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-200 hover:border-zinc-600"
                                    placeholder={t.login.passwordPlaceholder}
                                />
                            </div>
                        </div>

                        {error && (
                            <p className="text-red-500 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">{error}</p>
                        )}

                        <Button
                            type="submit"
                            variant="gradient"
                            size="xl"
                            className="w-full mt-2 group"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Loading...
                                </>
                            ) : (
                                <>
                                    {isRegister ? t.login.registerButton : t.login.loginButton}
                                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-zinc-800">
                        <button
                            type="button"
                            onClick={() => {
                                setIsRegister(!isRegister);
                                setError('');
                            }}
                            className="w-full text-center text-sm text-zinc-400 hover:text-orange-400 transition-colors"
                        >
                            {isRegister ? t.login.switchToLogin : t.login.switchToRegister}
                        </button>
                        <p className="text-center text-xs text-zinc-600 mt-4">
                            {t.login.footer}
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
