import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import apiClient from "@/api/apiClient";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Home() {
  const IconArrow = (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round" {...props}>
      <path d="M5 12h12" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );

  const IconTarget = (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v2M22 12h-2M12 22v-2M2 12h2" />
    </svg>
  );

  const IconTrend = (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round" {...props}>
      <path d="M4 16l6-6 4 4 6-7" />
      <path d="M18 7h4v4" />
    </svg>
  );

  const IconShield = (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round" {...props}>
      <path d="M12 3l7 3v6c0 5-3.5 7.5-7 9-3.5-1.5-7-4-7-9V6l7-3z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const authenticated = await apiClient.auth.isAuthenticated();
    setIsAuthenticated(authenticated);

    if (authenticated) {
      const user = await apiClient.auth.me();
      const profiles = await apiClient.entities.UserProfile.filter({ created_by: user.email });
      const userProfile = profiles[0];
      setHasProfile(userProfile?.calibration_completed || false);
    }
  };

  const handleStart = () => {
    if (!isAuthenticated) {
      apiClient.auth.redirectToLogin(createPageUrl("Calibration"));
      return;
    }
    if (hasProfile) {
      navigate(createPageUrl("Arena"));
      return;
    }
    navigate(createPageUrl("Calibration"));
  };

  const [lang, setLang] = useState("en");

  const t = {
    en: {
      badge: "Novax Trial",
      headline1: "NovaX",
      headline2: "Arena",
      subtitle: "Real-world experiential learning",
      subtitleHighlight: "in your hands.",
      ctaCalibrate: "Start Calibration",
      ctaArena: "Enter Arena",
      readyBattle: "Ready to battle",
      quote: "Growth engine environment.",
      features: [
        { icon: IconTarget, title: "Adaptive Personalization", description: "AI matches problems to your archetype + capability level." },
        { icon: IconTrend, title: "XP = Difficulty", description: "Progress comes from pressure, not grinding." },
        { icon: IconShield, title: "Scar Badges", description: "Badges prove conflict survived, not only participation." }
      ]
    },
    id: {
      badge: "Novax Trial",
      headline1: "NovaX",
      headline2: "Arena",
      subtitle: "Belajar dari pengalaman dunia nyata",
      subtitleHighlight: "di tanganmu.",
      ctaCalibrate: "Mulai Kalibrasi",
      ctaArena: "Masuk Arena",
      readyBattle: "Siap bertempur",
      quote: "Tidak ada zona nyaman. Hanya zona pertumbuhan.",
      features: [
        { icon: IconTarget, title: "Adaptive Matching", description: "AI mencocokkan masalah dengan arketipe + levelmu." },
        { icon: IconTrend, title: "XP = Kesulitan", description: "Progres dari tekanan, bukan grinding." },
        { icon: IconShield, title: "Scar Badges", description: "Badge bukti kamu selamat dari konflik." }
      ]
    }
  }[lang];

  return (
    <div className="nx-page relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none nx-bg-wires opacity-[0.7]" />
      <div className="absolute inset-0 pointer-events-none nx-bg-dots opacity-[0.24]" />

      <div className="nx-stage relative pt-10 md:pt-14">
        <div className="nx-asym-grid">
          <div className="nx-panel nx-panel-rail nx-sharp px-5 py-6">
            <div className="nx-crosshair -top-3 -left-3" />
            <div className="nx-crosshair -bottom-3 -right-3" />
            <div className="nx-vert text-[42px] font-black tracking-[-0.06em] leading-none">
              <span className="text-[var(--ink)]">INTUITIVE</span>
            </div>
            <div className="mt-4 nx-mono text-[10px] text-[var(--ink-2)] uppercase tracking-[0.22em]">
              PROBLEM-BASED-LEARNING
            </div>
          </div>

          <motion.div
            className="nx-panel nx-panel-core nx-sharp px-7 py-8 md:px-9 md:py-10"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, ease: [0.9, 0.02, 0.2, 0.98] }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="border border-[rgba(230,237,243,0.2)] bg-[rgba(230,237,243,0.04)] px-3 py-1.5 nx-mono text-[10px] uppercase tracking-[0.2em]">
                  {t.badge}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setLang("en")}
                  className={cn(
                    "border border-[rgba(230,237,243,0.2)] px-3 py-1.5 nx-mono text-[10px] tracking-[0.22em] transition-colors duration-150",
                    lang === "en"
                      ? "bg-[rgba(230,237,243,0.08)] text-[var(--ink)]"
                      : "bg-transparent text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[rgba(230,237,243,0.04)]"
                  )}
                >
                  EN
                </button>
                <button
                  onClick={() => setLang("id")}
                  className={cn(
                    "border border-[rgba(230,237,243,0.2)] px-3 py-1.5 nx-mono text-[10px] tracking-[0.22em] transition-colors duration-150",
                    lang === "id"
                      ? "bg-[rgba(230,237,243,0.08)] text-[var(--ink)]"
                      : "bg-transparent text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[rgba(230,237,243,0.04)]"
                  )}
                >
                  ID
                </button>
              </div>
            </div>

            <div className="mt-10 grid md:grid-cols-12 gap-6 items-start">
              <div className="md:col-span-7">
                <h1 className="text-[42px] md:text-[66px] font-black leading-[0.92] tracking-[-0.06em]">
                  <span className="text-[var(--ink)]">{t.headline1}</span>{" "}
                  <span className="px-2 bg-[rgba(255,122,69,0.18)] border border-[rgba(255,122,69,0.4)]">
                    {t.headline2}
                  </span>
                </h1>

                <p className="mt-5 text-[15px] md:text-[17px] nx-ink-muted max-w-xl">
                  {t.subtitle}{" "}
                  <span className="font-semibold text-[var(--ink)] underline decoration-[var(--acid-orange)] decoration-[3px] underline-offset-4">
                    {t.subtitleHighlight}
                  </span>
                </p>
              </div>

              <div className="md:col-span-5">
                <div className="nx-panel-static nx-sharp px-5 py-5">
                  <Button onClick={handleStart} variant="gradient" size="xl" className="group w-full justify-between">
                    <span>{hasProfile ? t.ctaArena : t.ctaCalibrate}</span>
                    <IconArrow className="w-5 h-5 transition-transform duration-150 group-hover:translate-x-1" />
                  </Button>
                  <div className="mt-3 nx-mono text-[10px] text-[var(--ink-2)] border border-[rgba(230,237,243,0.2)] px-3 py-2 bg-[rgba(230,237,243,0.03)] text-center">
                    {hasProfile ? t.readyBattle : t.calibrationTime}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="nx-panel nx-panel-glass nx-sharp px-6 py-6">
            <div className="text-[18px] font-black leading-[1.05]">{t.quote}</div>
            <div className="mt-4 space-y-3">
              {t.features.map((f) => {
                const FeatureIcon = f.icon;
                return (
                  <div
                    key={f.title}
                    className="border border-[rgba(230,237,243,0.16)] bg-[rgba(230,237,243,0.03)] px-4 py-3"
                  >
                    <div className="flex items-center gap-2">
                      <FeatureIcon className="w-4 h-4" />
                      <div className="font-bold">{f.title}</div>
                    </div>
                    <div className="mt-1 text-[13px] nx-ink-muted">{f.description}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
