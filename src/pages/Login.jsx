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
            <div className="absolute inset-0 pointer-events-none nx-bg-wires opacity-[0.55]" />
            <div className="absolute inset-0 pointer-events-none nx-bg-stripes opacity-[0.14]" />
            <div className="absolute inset-0 pointer-events-none nx-bg-dots opacity-[0.18]" />

            <div className="nx-stage relative py-16 md:py-20">
                <div className="grid lg:grid-cols-12 gap-10 items-start">
                    <div className="lg:col-span-5 lg:pt-4">
                        <div className="space-y-8">
                            <div className="nx-panel-static nx-sharp px-7 py-8 md:px-9 md:py-10">
                                <div className="nx-crosshair -top-3 -left-3" />
                                <div className="nx-crosshair -bottom-3 -right-3" />
                                <h1 className="text-4xl md:text-5xl font-black tracking-[-0.06em] leading-[0.95]">
                                    {t.login.title}{" "}
                                    <span className="bg-[rgba(51,209,122,0.12)] border border-[rgba(51,209,122,0.32)] px-1.5">
                                        {t.login.titleHighlight}
                                    </span>
                                </h1>
                                <p className="mt-4 text-base md:text-lg nx-ink-muted max-w-sm">
                                    {t.login.subtitle}
                                </p>
                            </div>
                            <div className="nx-panel-static nx-sharp px-7 py-6 md:px-9 md:py-7 flex items-center gap-4">
                                <div className="w-11 h-11 border border-[rgba(231,234,240,0.18)] bg-[rgba(231,234,240,0.04)] flex items-center justify-center">
                                    <KeySquare className="w-5 h-5 text-[var(--ink)]" />
                                </div>
                                <p className="text-xs md:text-sm nx-mono nx-ink-faint">
                                    {t.login.footer}
                                </p>
                            </div>
                        </div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.18, ease: [0.9, 0.02, 0.2, 0.98] }}
                        className="lg:col-span-7"
                    >
                        <div className="nx-panel nx-sharp px-7 py-8 md:px-10 md:py-10">
                            <div className="nx-crosshair -top-3 -right-3" />
                            <div className="nx-crosshair -bottom-3 -left-3" />
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-11 h-11 border border-[rgba(231,234,240,0.18)] bg-[rgba(231,234,240,0.04)] flex items-center justify-center">
                                    <KeySquare className="w-5 h-5 text-[var(--ink)]" />
                                </div>
                                <div className="divider-horizontal flex-1" />
                            </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
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
                                        className="w-full pl-12 pr-4 py-4 bg-[rgba(231,234,240,0.02)] border border-[rgba(231,234,240,0.16)] text-[var(--ink)] placeholder-[rgba(231,234,240,0.38)] focus:outline-none focus:border-[rgba(174,182,194,0.9)] transition-colors duration-150"
                                        placeholder={t.login.namePlaceholder}
                                    />
                                </div>
                            </div>
                        )}

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
                                    className="w-full pl-12 pr-4 py-4 bg-[rgba(231,234,240,0.02)] border border-[rgba(231,234,240,0.16)] text-[var(--ink)] placeholder-[rgba(231,234,240,0.38)] focus:outline-none focus:border-[rgba(174,182,194,0.9)] transition-colors duration-150"
                                    placeholder={t.login.emailPlaceholder}
                                    autoFocus={!isRegister}
                                />
                            </div>
                        </div>

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
                                    className="w-full pl-12 pr-4 py-4 bg-[rgba(231,234,240,0.02)] border border-[rgba(231,234,240,0.16)] text-[var(--ink)] placeholder-[rgba(231,234,240,0.38)] focus:outline-none focus:border-[rgba(174,182,194,0.9)] transition-colors duration-150"
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
                            className="w-full mt-4 h-16 text-base md:text-lg font-black tracking-[0.04em] uppercase border-2 border-[var(--ink)] shadow-[6px_6px_0_var(--ink)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-100 [transition-timing-function:steps(4,end)] group"
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

                    <div className="mt-8 pt-8 border-t border-[rgba(231,234,240,0.14)]">
                        <button
                            type="button"
                            onClick={() => {
                                setIsRegister(!isRegister);
                                setError('');
                            }}
                            className="w-full text-left text-sm font-semibold text-[var(--ink-2)] hover:text-[var(--ink)] transition-colors duration-150"
                        >
                            {isRegister ? t.login.switchToLogin : t.login.switchToRegister}
                        </button>
                    </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
