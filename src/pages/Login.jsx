import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';
import { Mail, User, ArrowRight, Flame, Sparkles } from 'lucide-react';
import apiClient from '@/api/apiClient';

export default function Login() {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [focused, setFocused] = useState(null);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const handleLogin = (e) => {
        e.preventDefault();

        if (!email || !name) {
            alert('Please enter both email and name');
            return;
        }

        apiClient.auth.setUser({ email, name });

        const redirectTo = searchParams.get('redirect') || '/calibration';
        navigate(redirectTo);
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
                            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-orange-500/30">
                                <Flame className="w-10 h-10 text-black" />
                            </div>
                            <motion.div
                                className="absolute -top-1 -right-1 w-6 h-6 bg-violet-500/20 rounded-full flex items-center justify-center"
                                animate={{
                                    scale: [1, 1.2, 1],
                                    opacity: [0.7, 1, 0.7]
                                }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <Sparkles className="w-3 h-3 text-violet-400" />
                            </motion.div>
                        </motion.div>

                        <h1 className="text-2xl font-bold text-white mb-2">
                            Welcome to <span className="text-gradient-fire">Arena</span>
                        </h1>
                        <p className="text-zinc-500">
                            Enter your details to continue
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleLogin} className="space-y-5 relative z-10">
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2.5">
                                Email
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
                                    className="w-full pl-12 pr-4 py-4 bg-zinc-800/80 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-200 hover:border-zinc-600"
                                    placeholder="your@email.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2.5">
                                Name
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
                                    className="w-full pl-12 pr-4 py-4 bg-zinc-800/80 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-200 hover:border-zinc-600"
                                    placeholder="Your Name"
                                    required
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            variant="gradient"
                            size="xl"
                            className="w-full mt-3 group"
                        >
                            Continue to Arena
                            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-zinc-800">
                        <p className="text-center text-xs text-zinc-600">
                            Development mode • No password required
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
