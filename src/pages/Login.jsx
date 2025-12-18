import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';
import { LogIn, Mail, User, ArrowRight, Flame } from 'lucide-react';
import apiClient from '@/api/apiClient';

export default function Login() {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
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
        <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--black)' }}>
            {/* Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl opacity-10"
                    style={{ background: 'var(--primary-600)' }}
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 w-full max-w-md"
            >
                <div className="card p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div
                            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 glow-fire"
                            style={{ background: 'var(--gradient-fire)' }}
                        >
                            <Flame className="w-8 h-8 text-black" />
                        </div>

                        <h1 className="text-2xl font-bold text-white mb-2">
                            Welcome to <span className="text-gradient-fire">Arena</span>
                        </h1>
                        <p style={{ color: 'var(--gray-500)' }}>
                            Enter your details to continue
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label
                                className="block text-sm font-medium mb-2"
                                style={{ color: 'var(--gray-300)' }}
                            >
                                Email
                            </label>
                            <div className="relative">
                                <Mail
                                    className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
                                    style={{ color: 'var(--gray-500)' }}
                                />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input pl-12"
                                    placeholder="your@email.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                className="block text-sm font-medium mb-2"
                                style={{ color: 'var(--gray-300)' }}
                            >
                                Name
                            </label>
                            <div className="relative">
                                <User
                                    className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
                                    style={{ color: 'var(--gray-500)' }}
                                />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="input pl-12"
                                    placeholder="Your Name"
                                    required
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            variant="gradient"
                            size="lg"
                            className="w-full mt-2"
                        >
                            Continue
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </form>

                    <p className="text-center mt-6 text-xs" style={{ color: 'var(--gray-600)' }}>
                        Mock login for development
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
