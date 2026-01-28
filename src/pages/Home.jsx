import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import apiClient from "@/api/apiClient";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Target, TrendingUp } from "lucide-react";
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
        { icon: Target, title: "Adaptive Matching", description: "AI matches problems to your archetype + capability level." },
        { icon: TrendingUp, title: "XP = Difficulty", description: "Progress comes from pressure, not grinding." },
        { icon: Shield, title: "Scar Badges", description: "Badges prove conflict survived, not participation." }
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
        { icon: Target, title: "Adaptive Matching", description: "AI mencocokkan masalah dengan arketipe + levelmu." },
        { icon: TrendingUp, title: "XP = Kesulitan", description: "Progres dari tekanan, bukan grinding." },
        { icon: Shield, title: "Scar Badges", description: "Badge bukti kamu selamat dari konflik." }
      ]
    }
  }[lang];

  return (
    <div className="nx-page relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none nx-bg-wires opacity-[0.7]" />
      <div className="absolute inset-0 pointer-events-none nx-bg-dots opacity-[0.24]" />

      <div className="nx-stage relative">
        <div className="grid lg:grid-cols-12 gap-6 items-start">
          <div className="hidden lg:block lg:col-span-2">
            <div className="nx-panel nx-sharp px-4 py-5">
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
                  <div className="border border-[rgba(231,234,240,0.18)] bg-[rgba(231,234,240,0.04)] px-3 py-1.5 nx-mono text-[10px] uppercase tracking-[0.2em]">
                    {t.badge}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setLang("en")}
                    className={cn(
                      "border border-[rgba(231,234,240,0.18)] px-3 py-1.5 nx-mono text-[10px] tracking-[0.22em] transition-colors duration-150",
                      lang === "en"
                        ? "bg-[rgba(231,234,240,0.08)] text-[var(--ink)]"
                        : "bg-transparent text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[rgba(231,234,240,0.04)]"
                    )}
                  >
                    EN
                  </button>
                  <button
                    onClick={() => setLang("id")}
                    className={cn(
                      "border border-[rgba(231,234,240,0.18)] px-3 py-1.5 nx-mono text-[10px] tracking-[0.22em] transition-colors duration-150",
                      lang === "id"
                        ? "bg-[rgba(231,234,240,0.08)] text-[var(--ink)]"
                        : "bg-transparent text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[rgba(231,234,240,0.04)]"
                    )}
                  >
                    ID
                  </button>
                </div>
              </div>

              <div className="mt-8 grid md:grid-cols-12 gap-6 items-start">
                <div className="md:col-span-8">
                  <h1 className="text-[44px] md:text-[72px] font-black leading-[0.9] tracking-[-0.06em]">
                    <span className="text-[var(--ink)]">{t.headline1}</span>{" "}
                    <span className="px-2 bg-[rgba(255,106,61,0.18)] border border-[rgba(255,106,61,0.35)]">
                      {t.headline2}
                    </span>
                  </h1>

                  <p className="mt-5 text-[16px] md:text-[18px] nx-ink-muted max-w-xl">
                    {t.subtitle}{" "}
                    <span className="font-semibold text-[var(--ink)] underline decoration-[var(--acid-orange)] decoration-[3px] underline-offset-4">
                      {t.subtitleHighlight}
                    </span>
                  </p>
                </div>

                <div className="md:col-span-4">
                  <div className="border border-[rgba(231,234,240,0.16)] bg-[rgba(231,234,240,0.02)] px-5 py-5">
                    <Button onClick={handleStart} variant="gradient" size="xl" className="group w-full justify-between">
                      <span>{hasProfile ? t.ctaArena : t.ctaCalibrate}</span>
                      <ArrowRight className="w-5 h-5 transition-transform duration-150 group-hover:translate-x-1" />
                    </Button>
                    <div className="mt-3 nx-mono text-[10px] text-[var(--ink-2)] border border-[rgba(231,234,240,0.18)] px-3 py-2 bg-[rgba(231,234,240,0.03)] text-center">
                      {hasProfile ? t.readyBattle : t.calibrationTime}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="lg:col-span-3 lg:pt-6">
            <div className="nx-panel nx-sharp px-5 py-5">
              <div className="text-[18px] font-black leading-[1.05]">{t.quote}</div>
              <div className="mt-4 space-y-3">
                {t.features.map((f) => {
                  const FeatureIcon = f.icon;
                  return (
                    <div
                      key={f.title}
                      className="border border-[rgba(231,234,240,0.16)] bg-[rgba(231,234,240,0.03)] px-4 py-3"
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
    </div>
  );
}
