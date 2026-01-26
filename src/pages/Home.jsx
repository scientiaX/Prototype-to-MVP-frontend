import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import apiClient from "@/api/apiClient";
import { Button } from "@/components/ui/button";
import {
  IconArrowRight,
  IconShield,
  IconTarget,
  IconTrendingUp
} from "@/components/ui/raw-icons";
import { cn } from "@/lib/utils";

export default function Home() {
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
      calibrationTime: "5-7 min calibration",
      readyBattle: "Ready to battle",
      quote: "No comfort zone. Only growth zone.",
      features: [
        { icon: IconTarget, title: "Adaptive Matching", description: "AI matches problems to your archetype + capability level." },
        { icon: IconTrendingUp, title: "XP = Difficulty", description: "Progress comes from pressure, not grinding." },
        { icon: IconShield, title: "Scar Badges", description: "Badges prove conflict survived, not participation." }
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
      calibrationTime: "5-7 menit kalibrasi",
      readyBattle: "Siap bertempur",
      quote: "Tidak ada zona nyaman. Hanya zona pertumbuhan.",
      features: [
        { icon: IconTarget, title: "Adaptive Matching", description: "AI mencocokkan masalah dengan arketipe + levelmu." },
        { icon: IconTrendingUp, title: "XP = Kesulitan", description: "Progres dari tekanan, bukan grinding." },
        { icon: IconShield, title: "Scar Badges", description: "Badge bukti kamu selamat dari konflik." }
      ]
    }
  }[lang];

  return (
    <div className="nx-page relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none nx-bg-wires opacity-[0.55]" />
      <div className="absolute inset-0 pointer-events-none nx-bg-dots opacity-[0.22]" />
      <div className="absolute -top-24 -right-24 w-[420px] h-[420px] nx-blob border-[3px] border-[var(--ink)] bg-[var(--acid-magenta)] opacity-[0.12]" />
      <div className="absolute -bottom-24 -left-28 w-[520px] h-[520px] nx-blob border-[3px] border-[var(--ink)] bg-[var(--acid-cyan)] opacity-[0.10]" />

      <div className="nx-stage relative">
        <div className="grid lg:grid-cols-12 gap-6 items-start">
          <div className="hidden lg:block lg:col-span-2">
            <div className="nx-panel nx-sharp px-4 py-5 rotate-[-2deg]">
              <div className="nx-crosshair -top-3 -left-3" />
              <div className="nx-crosshair -bottom-3 -right-3" />
              <div className="nx-vert text-[42px] font-black tracking-[-0.06em] leading-none">
                <span className="text-[var(--ink)]">INTUITIVE</span>
              </div>
              <div className="mt-4 nx-mono text-[10px] text-[var(--ink-2)] uppercase tracking-[0.22em]">
                PROBLEM-BASED-LEARNING
              </div>
            </div>
          </div>

          <motion.div
            className="lg:col-span-7"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, ease: [0.9, 0.02, 0.2, 0.98] }}
          >
            <div className="relative nx-panel nx-sharp px-6 py-7 md:px-8 md:py-9">
              <div className="nx-crosshair -top-3 -right-3" />
              <div className="nx-crosshair -bottom-3 -left-3" />

              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="border-2 border-[var(--ink)] bg-[var(--acid-yellow)] px-3 py-1.5 nx-mono text-[10px] uppercase tracking-[0.2em]">
                    {t.badge}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setLang("en")}
                    className={cn(
                      "border-2 border-[var(--ink)] px-3 py-1.5 nx-mono text-[10px] tracking-[0.22em] transition-transform duration-100 [transition-timing-function:steps(4,end)]",
                      lang === "en" ? "bg-[var(--acid-lime)]" : "bg-[var(--paper)] hover:-translate-y-0.5"
                    )}
                  >
                    EN
                  </button>
                  <button
                    onClick={() => setLang("id")}
                    className={cn(
                      "border-2 border-[var(--ink)] px-3 py-1.5 nx-mono text-[10px] tracking-[0.22em] transition-transform duration-100 [transition-timing-function:steps(4,end)]",
                      lang === "id" ? "bg-[var(--acid-cyan)]" : "bg-[var(--paper)] hover:-translate-y-0.5"
                    )}
                  >
                    ID
                  </button>
                </div>
              </div>

              <div className="mt-7">
                <div className="relative">
                  <div className="absolute -top-6 -left-1 text-[64px] md:text-[96px] font-black text-[rgba(11,11,12,0.06)] leading-none select-none">
                    {t.headline1}
                  </div>
                  <h1 className="relative text-[44px] md:text-[72px] font-black leading-[0.9] tracking-[-0.06em]">
                    <span className="text-[var(--ink)]">{t.headline1}</span>{" "}
                    <span className="px-2 bg-[var(--acid-orange)] border-2 border-[var(--ink)]">{t.headline2}</span>
                  </h1>
                </div>

                <p className="mt-5 text-[16px] md:text-[18px] nx-ink-muted max-w-xl">
                  {t.subtitle}{" "}
                  <span className="font-semibold text-[var(--ink)] underline decoration-[var(--acid-magenta)] decoration-[3px] underline-offset-4">
                    {t.subtitleHighlight}
                  </span>
                </p>

                <div className="mt-7 flex flex-wrap items-center gap-4">
                  <Button onClick={handleStart} variant="gradient" size="xl" className="group">
                    {hasProfile ? t.ctaArena : t.ctaCalibrate}
                    <IconArrowRight className="w-5 h-5 ml-2 transition-transform duration-100 [transition-timing-function:steps(4,end)] group-hover:translate-x-1" />
                  </Button>
                  <div className="nx-mono text-[10px] text-[var(--ink-2)] border-2 border-[var(--ink)] px-3 py-2 bg-[var(--paper)]">
                    {hasProfile ? t.readyBattle : t.calibrationTime}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="lg:col-span-3 lg:pt-6">
            <div className="nx-panel nx-sharp px-5 py-5 -rotate-[1deg]">
              <div className="text-[18px] font-black leading-[1.05]">{t.quote}</div>
              <div className="mt-4 space-y-3">
                {t.features.map((f) => {
                  const FeatureIcon = f.icon;
                  return (
                    <div key={f.title} className="border-2 border-[var(--ink)] bg-[var(--paper-2)] px-4 py-3">
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
    </div>
  );
}
