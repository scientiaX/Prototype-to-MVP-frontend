import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import apiClient from '@/api/apiClient';
import { getTranslation } from '@/components/utils/translations';
import {
  Swords,
  User,
  Trophy,
  Home,
  LogOut,
  Menu,
  X,
  Flame,
  ChevronRight
} from 'lucide-react';
import { cn } from "@/lib/utils";

export default function Layout({ children, currentPageName }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userLanguage, setUserLanguage] = useState('en');
  const navigate = useNavigate();

  const t = getTranslation(userLanguage);

  useEffect(() => {
    checkAuth();

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const checkAuth = async () => {
    const auth = await apiClient.auth.isAuthenticated();
    setIsAuthenticated(auth);

    if (auth) {
      try {
        const user = await apiClient.auth.me();
        const profiles = await apiClient.entities.UserProfile.filter({ created_by: user.email });
        if (profiles.length > 0 && profiles[0].language) {
          setUserLanguage(profiles[0].language);
        }
      } catch (e) {
        // Ignore errors, use default language
      }
    }
  };

  const handleLogout = () => {
    apiClient.auth.clearAllData(); // Clear ALL stored data
    window.location.href = '/login';
  };

  // Pages that require authentication
  const protectedPages = ['Arena', 'Profile'];

  // Handle navigation click - check auth for protected pages
  const handleNavClick = (e, page) => {
    if (protectedPages.includes(page) && !isAuthenticated) {
      e.preventDefault();
      // Redirect to login with redirect parameter
      navigate(`/login?redirect=${createPageUrl(page)}`);
    }
  };

  const navItems = [
    { name: t.nav.home, icon: Home, page: 'Home' },
    { name: t.nav.arena, icon: Swords, page: 'Arena' },
    { name: t.nav.profile, icon: User, page: 'Profile' },
    { name: t.nav.leaderboard, icon: Trophy, page: 'Leaderboard' }
  ];

  const hideNav = currentPageName === 'Calibration';

  if (hideNav) {
    return (
      <div className="min-h-screen bg-black">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Desktop Navigation */}
      <nav
        className={cn(
          "hidden md:block fixed top-0 left-0 right-0 z-navbar transition-all duration-300",
          scrolled
            ? "glass-navbar shadow-lg"
            : "bg-transparent"
        )}
      >
        <div className="max-w-6xl mx-auto px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to={createPageUrl('Home')} className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-orange-500 to-red-600 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <Flame className="w-5 h-5 text-black" />
                </div>
                <div className="absolute inset-0 rounded-xl bg-orange-500/40 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-white text-lg leading-none tracking-tight">NOVAX</span>
                <span className="text-[10px] font-mono text-zinc-500 tracking-[0.2em]">ARENA</span>
              </div>
            </Link>

            {/* Nav Links */}
            <div className="flex items-center gap-1 bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-1.5 border border-zinc-800/50">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPageName === item.page;
                return (
                  <Link
                    key={item.page}
                    to={createPageUrl(item.page)}
                    onClick={(e) => handleNavClick(e, item.page)}
                    className={cn(
                      "relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                      isActive
                        ? "text-white"
                        : "text-zinc-400 hover:text-white"
                    )}
                  >
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl border border-orange-500/30" />
                    )}
                    <Icon className={cn("w-4 h-4 relative z-10", isActive && "text-orange-400")} />
                    <span className="relative z-10">{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Logout */}
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-400 hover:text-red-400 transition-all duration-200 rounded-xl hover:bg-red-500/10 border border-transparent hover:border-red-500/20"
              >
                <LogOut className="w-4 h-4" />
                <span>{t.nav.logout}</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Top Bar */}
      <nav className="md:hidden fixed top-0 left-0 right-0 z-navbar glass-navbar">
        <div className="flex items-center justify-between h-14 px-4">
          <Link to={createPageUrl('Home')} className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-br from-orange-500 to-red-600">
              <Flame className="w-5 h-5 text-black" />
            </div>
            <span className="font-bold text-white tracking-tight">NOVAX</span>
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={cn(
              "p-2.5 rounded-xl transition-all duration-200",
              mobileMenuOpen
                ? "bg-orange-500/15 text-orange-400"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800"
            )}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        <div
          className={cn(
            "absolute top-full left-0 right-0 glass overflow-hidden transition-all duration-300",
            mobileMenuOpen
              ? "max-h-[400px] opacity-100 border-b border-zinc-800"
              : "max-h-0 opacity-0"
          )}
        >
          <div className="px-4 py-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPageName === item.page;
              return (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  onClick={(e) => {
                    setMobileMenuOpen(false);
                    handleNavClick(e, item.page);
                  }}
                  className={cn(
                    "flex items-center justify-between px-4 py-3.5 rounded-xl text-base font-medium transition-all",
                    isActive
                      ? "bg-gradient-to-r from-orange-500/15 to-red-500/10 text-orange-400 border border-orange-500/20"
                      : "text-zinc-300 hover:bg-zinc-800/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4 text-orange-400" />}
                </Link>
              );
            })}

            {isAuthenticated && (
              <>
                <div className="h-px bg-zinc-800 my-2" />
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>{t.nav.logout}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-navbar glass-navbar border-t border-zinc-800/50">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPageName === item.page;
            return (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                onClick={(e) => handleNavClick(e, item.page)}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-1 py-2 px-5 rounded-xl transition-all duration-200"
                )}
              >
                {isActive && (
                  <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full" />
                )}
                <div className={cn(
                  "p-1.5 rounded-lg transition-all",
                  isActive ? "bg-orange-500/15" : ""
                )}>
                  <Icon className={cn(
                    "w-5 h-5 transition-colors",
                    isActive ? "text-orange-400" : "text-zinc-500"
                  )} />
                </div>
                <span className={cn(
                  "text-[10px] font-medium transition-colors",
                  isActive ? "text-orange-400" : "text-zinc-500"
                )}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Backdrop for mobile menu */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="pt-20 md:pt-24 pb-24 md:pb-8">
        {children}
      </main>
    </div>
  );
}
