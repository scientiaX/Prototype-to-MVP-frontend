import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import apiClient from '@/api/apiClient';
import { getTranslation } from '@/components/utils/translations';
import {
  IconSwords,
  IconUser,
  IconTrophy,
  IconHome,
  IconLogOut,
  IconMenu,
  IconX,
  IconChevronRight
} from '@/components/ui/raw-icons';
import { cn } from "@/lib/utils";

export default function Layout({ children, currentPageName }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userLanguage, setUserLanguage] = useState('en');
  const navigate = useNavigate();

  const t = getTranslation(userLanguage);

  useEffect(() => {
    checkAuth();
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
    { name: t.nav.home, icon: IconHome, page: 'Home' },
    { name: t.nav.arena, icon: IconSwords, page: 'Arena' },
    { name: t.nav.profile, icon: IconUser, page: 'Profile' },
    { name: t.nav.leaderboard, icon: IconTrophy, page: 'Leaderboard' }
  ];

  const hideNav = currentPageName === 'Calibration';

  if (hideNav) {
    return (
      <div className="min-h-screen nx-page">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen nx-page">
      {/* Desktop Navigation */}
      <nav className="hidden md:block fixed top-0 left-0 right-0 z-navbar">
        <div className="mx-auto max-w-6xl px-8 py-3">
          <div className="nx-panel nx-sharp px-4 py-3 flex items-center justify-between">
            {/* Logo */}
            <Link to={createPageUrl('Home')} className="flex items-center gap-3 group">
              <div className="relative">
                <img
                  src="/favicon.png"
                  alt="NovaX"
                  className="w-10 h-10 nx-sharp border-2 border-[var(--ink)] transition-all duration-100 [transition-timing-function:steps(4,end)] group-hover:-translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-[var(--ink)] text-lg leading-none tracking-tight">NOVAX</span>
                <span className="text-[10px] nx-mono text-[var(--ink-3)] tracking-[0.28em]">ARENA</span>
              </div>
            </Link>

            {/* Nav Links */}
            <div className="flex items-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPageName === item.page;
                return (
                  <Link
                    key={item.page}
                    to={createPageUrl(item.page)}
                    onClick={(e) => handleNavClick(e, item.page)}
                    className={cn(
                      "relative px-3 py-2 text-sm font-semibold transition-all duration-100 [transition-timing-function:steps(4,end)]",
                      isActive
                        ? "text-[var(--ink)]"
                        : "text-[var(--ink-2)] hover:text-[var(--ink)]"
                    )}
                  >
                    {isActive && (
                      <div className="absolute inset-0 nx-blob border-2 border-[var(--ink)] bg-[var(--acid-lime)] opacity-80" />
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      {item.name}
                    </span>
                  </Link>
                );
              })}
            </div>

            {/* Logout */}
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-[var(--ink-2)] hover:text-[var(--ink)] transition-all duration-100 [transition-timing-function:steps(4,end)] border-2 border-transparent hover:border-[var(--ink)]"
              >
                <IconLogOut className="w-4 h-4" />
                <span>{t.nav.logout}</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Top Bar */}
      <nav className="md:hidden fixed top-0 left-0 right-0 z-navbar px-4 pt-3">
        <div className="nx-panel nx-sharp flex items-center justify-between px-4 py-3">
          <Link to={createPageUrl('Home')} className="flex items-center gap-2">
            <img
              src="/favicon.png"
              alt="NovaX"
              className="w-9 h-9 nx-sharp border-2 border-[var(--ink)]"
            />
            <span className="font-bold text-[var(--ink)] tracking-tight">NOVAX</span>
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={cn(
              "p-2 transition-all duration-100 [transition-timing-function:steps(4,end)] border-2 border-[var(--ink)] shadow-[4px_4px_0_var(--ink)]",
              mobileMenuOpen
                ? "bg-[var(--acid-magenta)] text-[var(--ink)]"
                : "bg-[var(--paper)] text-[var(--ink)] hover:translate-x-[-1px] hover:translate-y-[-1px]"
            )}
          >
            {mobileMenuOpen ? <IconX className="w-5 h-5" /> : <IconMenu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        <div
          className={cn(
            "absolute top-full left-4 right-4 overflow-hidden transition-all duration-100 [transition-timing-function:steps(5,end)]",
            mobileMenuOpen
              ? "max-h-[460px] opacity-100"
              : "max-h-0 opacity-0"
          )}
        >
          <div className="nx-panel nx-sharp px-4 py-4 space-y-1">
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
                    "flex items-center justify-between px-4 py-3 border-2 border-transparent transition-all duration-100 [transition-timing-function:steps(4,end)]",
                    isActive
                      ? "bg-[var(--acid-lime)] text-[var(--ink)] border-[var(--ink)]"
                      : "text-[var(--ink)] hover:border-[var(--ink)] hover:translate-x-[-1px] hover:translate-y-[-1px]"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </div>
                  {isActive && <IconChevronRight className="w-4 h-4" />}
                </Link>
              );
            })}

            {isAuthenticated && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 mt-2 border-2 border-[var(--ink)] bg-[var(--acid-magenta)] text-[var(--ink)] shadow-[6px_6px_0_var(--ink)] transition-transform duration-100 [transition-timing-function:steps(4,end)] hover:translate-x-[-2px] hover:translate-y-[-2px]"
              >
                <IconLogOut className="w-5 h-5" />
                <span className="font-semibold">{t.nav.logout}</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-navbar px-4 pb-3">
        <div className="nx-panel nx-sharp flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPageName === item.page;
            return (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                onClick={(e) => handleNavClick(e, item.page)}
                className="relative flex flex-col items-center justify-center gap-1 py-2 px-5 border-2 border-transparent transition-all duration-100 [transition-timing-function:steps(4,end)] hover:border-[var(--ink)]"
              >
                {isActive && (
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-10 h-1 bg-[var(--acid-orange)] border border-[var(--ink)]" />
                )}
                <div className={cn("p-1", isActive ? "bg-[var(--acid-lime)] border border-[var(--ink)]" : "")}>
                  <Icon className="w-5 h-5 text-[var(--ink)]" />
                </div>
                <span className={cn("text-[10px] font-semibold", isActive ? "text-[var(--ink)]" : "text-[var(--ink-2)]")}>
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
          className="md:hidden fixed inset-0 bg-[rgba(11,11,12,0.45)] z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="pt-24 md:pt-24 pb-24 md:pb-8">
        {children}
      </main>
    </div>
  );
}
