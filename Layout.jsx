import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import apiClient from '@/api/apiClient';
import {
  Swords,
  User,
  Trophy,
  Home,
  LogOut,
  Menu,
  X,
  Flame
} from 'lucide-react';
import { cn } from "@/lib/utils";

export default function Layout({ children, currentPageName }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const auth = await apiClient.auth.isAuthenticated();
    setIsAuthenticated(auth);
  };

  const handleLogout = () => {
    apiClient.auth.logout();
    window.location.href = createPageUrl('Home');
  };

  const navItems = [
    { name: 'Home', icon: Home, page: 'Home' },
    { name: 'Arena', icon: Swords, page: 'Arena' },
    { name: 'Profile', icon: User, page: 'Profile' },
    { name: 'Leaderboard', icon: Trophy, page: 'Leaderboard' }
  ];

  const hideNav = currentPageName === 'Calibration';

  if (hideNav) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--black)' }}>
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--black)' }}>
      {/* Desktop Navigation */}
      <nav className="hidden md:block fixed top-0 left-0 right-0 z-50 glass">
        <div className="container">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to={createPageUrl('Home')} className="flex items-center gap-3 group">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-105 glow-fire"
                style={{ background: 'var(--gradient-fire)' }}
              >
                <Flame className="w-5 h-5 text-black" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-white text-lg leading-none">NOVAX</span>
                <span className="text-xs font-mono" style={{ color: 'var(--gray-500)' }}>ARENA</span>
              </div>
            </Link>

            {/* Nav Links */}
            <div className="flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPageName === item.page;
                return (
                  <Link
                    key={item.page}
                    to={createPageUrl(item.page)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive
                        ? "text-white"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    )}
                    style={isActive ? {
                      background: 'rgba(249, 115, 22, 0.12)',
                      color: 'var(--primary-400)'
                    } : {}}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Auth */}
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm transition-all duration-200 rounded-lg hover:bg-white/5"
                style={{ color: 'var(--gray-400)' }}
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Top Bar */}
      <nav className="md:hidden fixed top-0 left-0 right-0 z-50 glass">
        <div className="flex items-center justify-between h-14 px-4">
          <Link to={createPageUrl('Home')} className="flex items-center gap-2">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center glow-fire"
              style={{ background: 'var(--gradient-fire)' }}
            >
              <Flame className="w-5 h-5 text-black" />
            </div>
            <span className="font-bold text-white">NOVAX</span>
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg transition-colors"
            style={{ color: 'var(--gray-400)' }}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="border-t px-4 py-4 space-y-1" style={{
            background: 'var(--gray-900)',
            borderColor: 'var(--gray-800)'
          }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPageName === item.page;
              return (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-all"
                  )}
                  style={isActive ? {
                    background: 'rgba(249, 115, 22, 0.12)',
                    color: 'var(--primary-400)'
                  } : {
                    color: 'var(--gray-300)'
                  }}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            {isAuthenticated && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
                style={{ color: 'var(--danger-400)' }}
              >
                <LogOut className="w-5 h-5" />
                <span>Keluar</span>
              </button>
            )}
          </div>
        )}
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t" style={{ borderColor: 'var(--gray-800)' }}>
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPageName === item.page;
            return (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 py-2 px-4 rounded-xl transition-all duration-200"
                )}
                style={isActive ? {
                  color: 'var(--primary-400)'
                } : {
                  color: 'var(--gray-500)'
                }}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Main Content */}
      <main className="page-wrapper">
        {children}
      </main>
    </div>
  );
}
