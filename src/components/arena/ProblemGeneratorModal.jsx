import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { X, Sparkles, AlertTriangle, Settings } from 'lucide-react';
import { cn } from "@/lib/utils";

const DOMAINS = [
  { value: 'business', label: 'Business & Strategy' },
  { value: 'tech', label: 'Technology & Product' },
  { value: 'leadership', label: 'Leadership & Management' },
  { value: 'marketing', label: 'Marketing & Growth' },
  { value: 'operations', label: 'Operations & Execution' },
  { value: 'finance', label: 'Finance & Resource Management' }
];

const PROBLEM_TYPES = [
  { value: 'decision', label: 'High-Stakes Decision' },
  { value: 'crisis', label: 'Crisis Management' },
  { value: 'tradeoff', label: 'Impossible Trade-off' },
  { value: 'ambiguity', label: 'Navigate Ambiguity' },
  { value: 'conflict', label: 'Handle Conflict' },
  { value: 'resource', label: 'Resource Constraint' }
];

export default function ProblemGeneratorModal({ 
  isOpen, 
  onClose, 
  onGenerate,
  profile 
}) {
  const [customization, setCustomization] = useState({
    domains: [profile?.domain || 'business'],
    minDifficulty: Math.max(1, (profile?.current_difficulty || 1) - 1),
    maxDifficulty: Math.min(10, (profile?.current_difficulty || 1) + 3),
    problemType: '',
    customContext: '',
    specificConstraints: '',
    timeLimit: 25
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDomainToggle = (domain) => {
    setCustomization(prev => ({
      ...prev,
      domains: prev.domains.includes(domain)
        ? prev.domains.filter(d => d !== domain)
        : [...prev.domains, domain]
    }));
  };

  const handleGenerate = async () => {
    if (customization.domains.length === 0) {
      alert('Pilih minimal satu domain');
      return;
    }

    setIsGenerating(true);
    await onGenerate(customization);
    setIsGenerating(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[rgba(11,11,12,0.6)]"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto nx-panel nx-sharp"
        >
          {/* Header */}
          <div className="sticky top-0 bg-[var(--paper)] border-b-[3px] border-[var(--ink)] p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 bg-[var(--acid-orange)] border-[2px] border-[var(--ink)] shadow-[4px_4px_0_var(--ink)] nx-sharp flex items-center justify-center">
                <Settings className="w-6 h-6 text-[var(--ink)]" />
              </span>
              <div>
                <h2 className="text-xl font-bold text-[var(--ink)]">Customize Problem</h2>
                <p className="text-[var(--ink-2)] text-sm">Tentukan parameter tantanganmu</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-[var(--ink-2)] hover:text-[var(--ink)] transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Domains */}
            <div>
              <Label className="text-[var(--ink)] text-sm font-semibold mb-3 block">
                Domain Masalah *
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {DOMAINS.map((domain) => (
                  <button
                    key={domain.value}
                    onClick={() => handleDomainToggle(domain.value)}
                    className={cn(
                      "p-3 nx-sharp border-[2px] border-[var(--ink)] text-sm font-bold transition-all duration-100 [transition-timing-function:steps(4,end)]",
                      customization.domains.includes(domain.value)
                        ? "bg-[var(--acid-orange)] text-[var(--ink)]"
                        : "bg-[var(--paper)] text-[var(--ink)] hover:bg-[var(--paper-2)]"
                    )}
                  >
                    {domain.label}
                  </button>
                ))}
              </div>
              <p className="text-[var(--ink-3)] text-xs mt-2">
                Pilih 1-3 domain. Masalah akan digabungkan jika pilih lebih dari satu.
              </p>
            </div>

            {/* Difficulty Range */}
            <div>
              <Label className="text-[var(--ink)] text-sm font-semibold mb-3 block">
                Difficulty Range
              </Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[var(--ink-2)] text-xs mb-2 block">Min Level</Label>
                  <Input
                    type="number"
                    min="1"
                    max={customization.maxDifficulty}
                    value={customization.minDifficulty}
                    onChange={(e) => setCustomization(prev => ({
                      ...prev,
                      minDifficulty: Math.max(1, Math.min(10, parseInt(e.target.value) || 1))
                    }))}
                  />
                </div>
                <div>
                  <Label className="text-[var(--ink-2)] text-xs mb-2 block">Max Level</Label>
                  <Input
                    type="number"
                    min={customization.minDifficulty}
                    max="10"
                    value={customization.maxDifficulty}
                    onChange={(e) => setCustomization(prev => ({
                      ...prev,
                      maxDifficulty: Math.max(1, Math.min(10, parseInt(e.target.value) || 10))
                    }))}
                  />
                </div>
              </div>
              <div className="flex gap-1 mt-3">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex-1 h-2 nx-sharp transition-all",
                      i >= customization.minDifficulty - 1 && i < customization.maxDifficulty
                        ? i < 3 ? "bg-[var(--acid-lime)]"
                          : i < 6 ? "bg-[var(--acid-yellow)]"
                          : "bg-[var(--acid-orange)]"
                        : "bg-[var(--wire)]"
                    )}
                  />
                ))}
              </div>
              <p className="text-[var(--ink-3)] text-xs mt-2">
                Current level-mu: {profile?.current_difficulty || 1}. Sistem merekomendasikan {Math.max(1, (profile?.current_difficulty || 1) - 1)}-{Math.min(10, (profile?.current_difficulty || 1) + 3)}.
              </p>
            </div>

            {/* Problem Type */}
            <div>
              <Label className="text-[var(--ink)] text-sm font-semibold mb-3 block">
                Tipe Masalah (Optional)
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {PROBLEM_TYPES.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setCustomization(prev => ({
                      ...prev,
                      problemType: prev.problemType === type.value ? '' : type.value
                    }))}
                    className={cn(
                      "p-3 nx-sharp border-[2px] border-[var(--ink)] text-sm font-bold transition-all duration-100 [transition-timing-function:steps(4,end)] text-left",
                      customization.problemType === type.value
                        ? "bg-[var(--acid-orange)] text-[var(--ink)]"
                        : "bg-[var(--paper)] text-[var(--ink)] hover:bg-[var(--paper-2)]"
                    )}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Context */}
            <div>
              <Label className="text-[var(--ink)] text-sm font-semibold mb-3 block">
                Custom Context (Optional)
              </Label>
              <Textarea
                value={customization.customContext}
                onChange={(e) => setCustomization(prev => ({
                  ...prev,
                  customContext: e.target.value
                }))}
                placeholder="e.g., 'Saya sedang membangun startup di industri logistics' atau 'Tim saya fully remote dengan 15 orang'"
                className="min-h-[80px] resize-none"
              />
              <p className="text-[var(--ink-3)] text-xs mt-2">
                Berikan konteks spesifik tentang situasimu untuk masalah yang lebih personal.
              </p>
            </div>

            {/* Specific Constraints */}
            <div>
              <Label className="text-[var(--ink)] text-sm font-semibold mb-3 block">
                Constraints yang Ingin Dihadapi (Optional)
              </Label>
              <Textarea
                value={customization.specificConstraints}
                onChange={(e) => setCustomization(prev => ({
                  ...prev,
                  specificConstraints: e.target.value
                }))}
                placeholder="e.g., 'Budget sangat terbatas', 'Data tidak lengkap', 'Timeline sangat ketat', 'Tim tidak berpengalaman'"
                className="min-h-[80px] resize-none"
              />
              <p className="text-[var(--ink-3)] text-xs mt-2">
                Tentukan constraint spesifik yang ingin kamu latih untuk hadapi.
              </p>
            </div>

            {/* Time Limit */}
            <div>
              <Label className="text-[var(--ink)] text-sm font-semibold mb-3 block">
                Estimasi Waktu Penyelesaian (menit)
              </Label>
              <Input
                type="number"
                min="15"
                max="60"
                step="5"
                value={customization.timeLimit}
                onChange={(e) => setCustomization(prev => ({
                  ...prev,
                  timeLimit: Math.max(15, Math.min(60, parseInt(e.target.value) || 25))
                }))}
                className="w-32"
              />
              <p className="text-[var(--ink-3)] text-xs mt-2">
                Masalah akan disesuaikan dengan target waktu ini (15-60 menit).
              </p>
            </div>

            {/* Warning */}
            <div className="bg-[var(--acid-yellow)] border-[3px] border-[var(--ink)] shadow-[6px_6px_0_var(--ink)] nx-sharp p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-[var(--ink)] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[var(--ink)] font-bold text-sm">Peringatan</p>
                <p className="text-[var(--ink-2)] text-xs mt-1">
                  Semakin spesifik parameter, semakin personal masalahnya. Tapi ingat: 
                  sistem tetap akan menguji kemampuan nyata, bukan memberikan kenyamanan.
                  Jangan pilih difficulty terlalu rendah untuk "farming" XP.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-[var(--paper)] border-t-[3px] border-[var(--ink)] p-6 flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isGenerating}
              className="flex-1"
            >
              Batal
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || customization.domains.length === 0}
              variant="gradient"
              className="flex-1"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Problem
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
