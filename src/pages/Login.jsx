import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';
import { LogIn } from 'lucide-react';
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

        // Set user in localStorage
        apiClient.auth.setUser({ email, name });

        // Redirect to intended page or calibration
        const redirectTo = searchParams.get('redirect') || '/calibration';
        navigate(redirectTo);
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center px-6">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-red-500/5" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 w-full max-w-md"
            >
                <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">
                            Login to <span className="text-orange-500">Arena</span>
                        </h1>
                        <p className="text-zinc-400 text-sm">
                            Enter your details to continue
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder="your@email.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                                Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder="Your Name"
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-orange-500 hover:bg-orange-600 text-black font-bold py-3 rounded-lg"
                        >
                            <LogIn className="w-5 h-5 mr-2" />
                            Continue
                        </Button>
                    </form>

                    <p className="text-zinc-600 text-xs text-center mt-6">
                        This is a mock login for development purposes
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
