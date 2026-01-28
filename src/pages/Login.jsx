import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';
import { ArrowRight, KeySquare, Loader2, Lock, Mail, User } from 'lucide-react';
import apiClient from '@/api/apiClient';
import { getTranslation } from '@/components/utils/translations';
import { cn } from "@/lib/utils";

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
        <div className="min-h-screen nx-page relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none nx-bg-wires opacity-[0.7]" />
            <div className="absolute inset-0 pointer-events-none nx-bg-dots opacity-[0.22]" />

            <div className="nx-stage relative">
                <div className="grid lg:grid-cols-12 gap-6 items-start">
                    <div className="lg:col-span-5">
                        <div className="nx-panel nx-sharp px-6 py-6">
                            <div className="nx-crosshair -top-3 -left-3" />
                            <div className="nx-crosshair -bottom-3 -right-3" />
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h1 className="mt-2 text-3xl md:text-4xl font-black tracking-[-0.06em] leading-[0.95]">
                                        {t.login.title}{" "}
                                        <span className="bg-[rgba(51,209,122,0.14)] border border-[rgba(51,209,122,0.35)] px-1">
                                            {t.login.titleHighlight}
                                        </span>
                                    </h1>
                                    <p className="mt-3 nx-ink-muted max-w-sm">
                                        {t.login.subtitle}
                                    </p>
                                </div>
                                <div className="w-14 h-14 border border-[rgba(231,234,240,0.18)] bg-[rgba(231,234,240,0.04)] flex items-center justify-center">
                                    <KeySquare className="w-7 h-7 text-[var(--ink)]" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.18, ease: [0.9, 0.02, 0.2, 0.98] }}
                        className="lg:col-span-7 lg:pt-6"
                    >
                        <div className="nx-panel nx-sharp px-6 py-6 md:px-8 md:py-8">
                            <div className="nx-crosshair -top-3 -right-3" />
                            <div className="nx-crosshair -bottom-3 -left-3" />

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name (only for register) */}
                        {isRegister && (
                            <div>
                                <label className="block text-sm font-bold text-[var(--ink)] mb-2">
                                    {t.login.nameLabel}
                                </label>
                                <div className="relative">
                                    <div className={cn(
                                        "absolute left-4 top-1/2 -translate-y-1/2 transition-transform duration-100 [transition-timing-function:steps(4,end)]",
                                        focused === 'name' ? "text-[var(--ink)] -translate-x-0.5" : "text-[var(--ink-3)]"
                                    )}>
                                        <User className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        onFocus={() => setFocused('name')}
                                        onBlur={() => setFocused(null)}
                                        className="w-full pl-12 pr-4 py-3.5 bg-[rgba(231,234,240,0.03)] border border-[rgba(231,234,240,0.18)] text-[var(--ink)] placeholder-[rgba(231,234,240,0.38)] focus:outline-none focus:border-[rgba(51,209,122,0.45)] transition-colors duration-150"
                                        placeholder={t.login.namePlaceholder}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-bold text-[var(--ink)] mb-2">
                                {t.login.emailLabel}
                            </label>
                            <div className="relative">
                                <div className={cn(
                                    "absolute left-4 top-1/2 -translate-y-1/2 transition-transform duration-100 [transition-timing-function:steps(4,end)]",
                                    focused === 'email' ? "text-[var(--ink)] -translate-x-0.5" : "text-[var(--ink-3)]"
                                )}>
                                        <Mail className="w-5 h-5" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onFocus={() => setFocused('email')}
                                    onBlur={() => setFocused(null)}
                                    className="w-full pl-12 pr-4 py-3.5 bg-[rgba(231,234,240,0.03)] border border-[rgba(231,234,240,0.18)] text-[var(--ink)] placeholder-[rgba(231,234,240,0.38)] focus:outline-none focus:border-[rgba(51,209,122,0.45)] transition-colors duration-150"
                                    placeholder={t.login.emailPlaceholder}
                                    autoFocus={!isRegister}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-bold text-[var(--ink)] mb-2">
                                {t.login.passwordLabel}
                            </label>
                            <div className="relative">
                                <div className={cn(
                                    "absolute left-4 top-1/2 -translate-y-1/2 transition-transform duration-100 [transition-timing-function:steps(4,end)]",
                                    focused === 'password' ? "text-[var(--ink)] -translate-x-0.5" : "text-[var(--ink-3)]"
                                )}>
                                        <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onFocus={() => setFocused('password')}
                                    onBlur={() => setFocused(null)}
                                    className="w-full pl-12 pr-4 py-3.5 bg-[rgba(231,234,240,0.03)] border border-[rgba(231,234,240,0.18)] text-[var(--ink)] placeholder-[rgba(231,234,240,0.38)] focus:outline-none focus:border-[rgba(51,209,122,0.45)] transition-colors duration-150"
                                    placeholder={t.login.passwordPlaceholder}
                                />
                            </div>
                        </div>

                        {error && (
                            <p className="text-[var(--ink)] text-sm bg-[rgba(255,106,61,0.14)] border border-[rgba(255,106,61,0.35)] px-4 py-2">{error}</p>
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
                                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-150" />
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 pt-6 border-t-2 border-[var(--ink)]">
                        <button
                            type="button"
                            onClick={() => {
                                setIsRegister(!isRegister);
                                setError('');
                            }}
                            className="w-full text-center text-sm font-semibold text-[var(--ink-2)] hover:text-[var(--ink)] transition-colors duration-150"
                        >
                            {isRegister ? t.login.switchToLogin : t.login.switchToRegister}
                        </button>
                        <p className="text-center text-xs text-[var(--ink-3)] mt-4 nx-mono">
                            {t.login.footer}
                        </p>
                    </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
