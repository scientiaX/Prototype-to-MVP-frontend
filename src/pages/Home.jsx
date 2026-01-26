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
  const [activeSignal, setActiveSignal] = useState(0);
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
      signals: [
        { kicker: "SIGNAL 01", line: "When effectiveness meets convenience." },
        { kicker: "SIGNAL 02", line: "No comfort loop. Only feedback loops." },
        { kicker: "SIGNAL 03", line: "Progress is recorded. Not imagined." },
        { kicker: "SIGNAL 04", line: "Pressure creates signal. Signal creates skill." }
      ],
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
      signals: [
        { kicker: "SIGNAL 01", line: "Saat efektivitas bertemu kenyamanan." },
        { kicker: "SIGNAL 02", line: "Bukan loop nyaman. Hanya loop umpan balik." },
        { kicker: "SIGNAL 03", line: "Progres itu dicatat. Bukan dibayangkan." },
        { kicker: "SIGNAL 04", line: "Tekanan menciptakan sinyal. Sinyal menciptakan skill." }
      ],
      features: [
        { icon: Target, title: "Adaptive Matching", description: "AI mencocokkan masalah dengan arketipe + levelmu." },
        { icon: TrendingUp, title: "XP = Kesulitan", description: "Progres dari tekanan, bukan grinding." },
        { icon: Shield, title: "Scar Badges", description: "Badge bukti kamu selamat dari konflik." }
      ]
    }
  }[lang];

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll("[data-nx-signal-step]"));
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const stepAttr = entry.target.getAttribute("data-nx-signal-step");
          const nextStep = Number(stepAttr);
          if (!Number.isFinite(nextStep)) return;
          setActiveSignal(nextStep);
        });
      },
      { root: null, rootMargin: "-45% 0px -45% 0px", threshold: 0.01 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [lang]);

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
                      lang === "en" ? "bg-[rgba(231,234,240,0.08)] text-[var(--ink)]" : "bg-transparent text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[rgba(231,234,240,0.04)]"
                    )}
                  >
                    EN
                  </button>
                  <button
                    onClick={() => setLang("id")}
                    className={cn(
                      "border border-[rgba(231,234,240,0.18)] px-3 py-1.5 nx-mono text-[10px] tracking-[0.22em] transition-colors duration-150",
                      lang === "id" ? "bg-[rgba(231,234,240,0.08)] text-[var(--ink)]" : "bg-transparent text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[rgba(231,234,240,0.04)]"
                    )}
                  >
                    ID
                  </button>
                </div>
              </div>

              <div className="mt-7">
                <div className="relative">
                  <h1 className="relative text-[44px] md:text-[72px] font-black leading-[0.9] tracking-[-0.06em]">
                    <span className="text-[var(--ink)]">{t.headline1}</span>{" "}
                    <span className="px-2 bg-[rgba(255,106,61,0.18)] border border-[rgba(255,106,61,0.35)]">{t.headline2}</span>
                  </h1>
                </div>

                <p className="mt-5 text-[16px] md:text-[18px] nx-ink-muted max-w-xl">
                  {t.subtitle}{" "}
                  <span className="font-semibold text-[var(--ink)] underline decoration-[var(--acid-orange)] decoration-[3px] underline-offset-4">
                    {t.subtitleHighlight}
                  </span>
                </p>

                <div className="mt-7 flex flex-wrap items-center gap-4">
                  <Button onClick={handleStart} variant="gradient" size="xl" className="group">
                    {hasProfile ? t.ctaArena : t.ctaCalibrate}
                    <ArrowRight className="w-5 h-5 ml-2 transition-transform duration-150 group-hover:translate-x-1" />
                  </Button>
                  <div className="nx-mono text-[10px] text-[var(--ink-2)] border border-[rgba(231,234,240,0.18)] px-3 py-2 bg-[rgba(231,234,240,0.03)]">
                    {hasProfile ? t.readyBattle : t.calibrationTime}
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
                    <div key={f.title} className="border border-[rgba(231,234,240,0.16)] bg-[rgba(231,234,240,0.03)] px-4 py-3">
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

      <div className="nx-stage relative pt-0">
        <div className="grid lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-4">
            <div className="sticky top-[92px] nx-panel nx-sharp px-5 py-5">
              <div className="space-y-2">
                {t.signals.map((s, index) => (
                  <div key={s.kicker} className="flex items-center gap-3">
                    <div
                      className={cn(
                        "h-[10px] w-[10px] border border-[rgba(231,234,240,0.22)]",
                        index === activeSignal
                          ? "bg-[var(--acid-lime)] border-[rgba(51,209,122,0.55)]"
                          : "bg-[rgba(231,234,240,0.04)]"
                      )}
                    />
                    <div className="flex-1">
                      <div
                        className={cn(
                          "nx-mono text-[10px] uppercase tracking-[0.22em]",
                          index === activeSignal ? "text-[var(--ink)]" : "text-[var(--ink-2)]"
                        )}
                      >
                        {s.kicker}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="space-y-6">
              {t.signals.map((s, index) => (
                <section
                  key={s.line}
                  data-nx-signal-step={index}
                  className="min-h-[72vh] flex items-center"
                >
                  <motion.div
                    className={cn(
                      "nx-panel nx-sharp px-6 py-7 md:px-8 md:py-9 w-full",
                      index === activeSignal
                        ? "bg-[rgba(231,234,240,0.03)] border-[rgba(51,209,122,0.35)]"
                        : "bg-transparent border-[rgba(231,234,240,0.12)]"
                    )}
                    initial={false}
                    animate={{
                      opacity: index === activeSignal ? 1 : 0.55,
                      y: index === activeSignal ? 0 : 6
                    }}
                    transition={{ duration: 0.16, ease: [0.9, 0.02, 0.2, 0.98] }}
                  >
                    <div className="nx-mono text-[10px] text-[var(--ink-2)] uppercase tracking-[0.22em]">{s.kicker}</div>
                    <div className="mt-3 text-[30px] md:text-[44px] font-black leading-[1.02] tracking-[-0.05em] text-[var(--ink)]">
                      {s.line}
                    </div>
                    <div className="mt-5 h-px w-full bg-[rgba(231,234,240,0.1)]" />
                  </motion.div>
                </section>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
