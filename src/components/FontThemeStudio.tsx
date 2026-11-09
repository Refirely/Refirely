import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Type,
  Check,
  Sparkles,
  X,
  Eye,
  Sliders,
  RotateCcw,
  ChevronUp,
  Star,
  MapPin,
  Shield,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { db, auth } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface FontPairingPreset {
  id: string;
  name: string;
  badge: string;
  vibe: string;
  spaceSavingGain: string;
  displayFont: string;
  displayCss: string;
  bodyFont: string;
  bodyCss: string;
  monoFont: string;
  monoCss: string;
  headingTracking: string;
  bodyTracking: string;
  description: string;
  recommended?: boolean;
  isPreviousDefault?: boolean;
}

export const FONT_PAIRING_PRESETS: FontPairingPreset[] = [
  {
    id: 'outfit-figtree',
    name: 'Outfit + Figtree',
    badge: 'Live Website Default · Curvy & Compact',
    vibe: 'Modern Geometric-Rounded & Crisp UI',
    spaceSavingGain: '~9% narrower width',
    displayFont: 'Outfit',
    displayCss: '"Outfit", ui-sans-serif, system-ui, sans-serif',
    bodyFont: 'Figtree',
    bodyCss: '"Figtree", ui-sans-serif, system-ui, sans-serif',
    monoFont: 'JetBrains Mono',
    monoCss: '"JetBrains Mono", ui-monospace, monospace',
    headingTracking: '-0.015em',
    bodyTracking: '-0.005em',
    description:
      'Softly rounded geometric bowls in Outfit give headings a modern, approachable curve while fitting ~9% more characters per line than Plus Jakarta Sans. Figtree keeps small 11px–13px card descriptions and Insider Tips effortless to read.',
    recommended: true,
  },
  {
    id: 'urbanist-nunito',
    name: 'Urbanist + Nunito Sans',
    badge: 'Most Space-Efficient & Soft Rounded',
    vibe: 'Sleek Circular Curves & High-Density Fit',
    spaceSavingGain: '~12% narrower width',
    displayFont: 'Urbanist',
    displayCss: '"Urbanist", ui-sans-serif, system-ui, sans-serif',
    bodyFont: 'Nunito Sans',
    bodyCss: '"Nunito Sans", ui-sans-serif, system-ui, sans-serif',
    monoFont: 'JetBrains Mono',
    monoCss: '"JetBrains Mono", ui-monospace, monospace',
    headingTracking: '-0.012em',
    bodyTracking: '-0.004em',
    description:
      'Urbanist combines smooth circular curves with slightly condensed proportions—ideal for fitting long venue names and multi-city tabs on a single line. Nunito Sans adds warm, softly rounded terminals for long-form reading.',
  },
  {
    id: 'bricolage-dmsans',
    name: 'Bricolage Grotesque + DM Sans',
    badge: 'Stylish Editorial Curves',
    vibe: 'Expressive Curvy Headings & Clean Body',
    spaceSavingGain: '~8% narrower width',
    displayFont: 'Bricolage Grotesque',
    displayCss: '"Bricolage Grotesque", ui-sans-serif, system-ui, sans-serif',
    bodyFont: 'DM Sans',
    bodyCss: '"DM Sans", ui-sans-serif, system-ui, sans-serif',
    monoFont: 'JetBrains Mono',
    monoCss: '"JetBrains Mono", ui-monospace, monospace',
    headingTracking: '-0.018em',
    bodyTracking: '-0.005em',
    description:
      'Bricolage Grotesque brings distinctive, stylish curves to hero headlines and country titles while staying compact horizontally. DM Sans provides rounded, high-legibility body text.',
  },
  {
    id: 'quicksand-figtree',
    name: 'Quicksand + Figtree',
    badge: 'Warm Rounded Terminals',
    vibe: 'Friendly Curvy Display & Compact Cards',
    spaceSavingGain: '~6% narrower body',
    displayFont: 'Quicksand',
    displayCss: '"Quicksand", ui-sans-serif, system-ui, sans-serif',
    bodyFont: 'Figtree',
    bodyCss: '"Figtree", ui-sans-serif, system-ui, sans-serif',
    monoFont: 'JetBrains Mono',
    monoCss: '"JetBrains Mono", ui-monospace, monospace',
    headingTracking: '-0.015em',
    bodyTracking: '-0.005em',
    description:
      'Quicksand features genuinely rounded stroke endings and circular letterforms for a warm, lifestyle-oriented feel, paired with compact Figtree body copy so dense data cards stay tidy.',
  },
  {
    id: 'sora-manrope',
    name: 'Sora + Manrope',
    badge: 'Fintech & Nomad Precision',
    vibe: 'Modern Curved Bowls & Semi-Condensed Body',
    spaceSavingGain: '~10% narrower body',
    displayFont: 'Sora',
    displayCss: '"Sora", ui-sans-serif, system-ui, sans-serif',
    bodyFont: 'Manrope',
    bodyCss: '"Manrope", ui-sans-serif, system-ui, sans-serif',
    monoFont: 'JetBrains Mono',
    monoCss: '"JetBrains Mono", ui-monospace, monospace',
    headingTracking: '-0.02em',
    bodyTracking: '-0.005em',
    description:
      'Sora blends crisp modern curves with generous open counters, while Manrope’s semi-condensed, softly rounded geometry packs maximum information into tables, calculators, and itinerary cards.',
  },
  {
    id: 'jakarta-inter',
    name: 'Plus Jakarta Sans + Inter',
    badge: 'Previous Theme Default',
    vibe: 'Wide Geometric Headings & Neutral UI Sans',
    spaceSavingGain: 'Baseline (0%)',
    displayFont: 'Plus Jakarta Sans',
    displayCss: '"Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif',
    bodyFont: 'Inter',
    bodyCss: '"Inter", ui-sans-serif, system-ui, sans-serif',
    monoFont: 'JetBrains Mono',
    monoCss: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    headingTracking: '0em',
    bodyTracking: '0em',
    description:
      'The previous theme setup: Plus Jakarta Sans for headings (wider horizontal letterforms) paired with standard Inter for body copy and system monospace for numbers.',
    isPreviousDefault: true,
  },
];

const DISPLAY_FONT_OPTIONS = [
  { label: 'Outfit (Modern Rounded & Compact)', css: '"Outfit", ui-sans-serif, system-ui, sans-serif' },
  { label: 'Urbanist (Sleek Circular & Narrow)', css: '"Urbanist", ui-sans-serif, system-ui, sans-serif' },
  { label: 'Bricolage Grotesque (Stylish Curvy Editorial)', css: '"Bricolage Grotesque", ui-sans-serif, system-ui, sans-serif' },
  { label: 'Quicksand (Soft Rounded Terminals)', css: '"Quicksand", ui-sans-serif, system-ui, sans-serif' },
  { label: 'Sora (Crisp Modern Curves)', css: '"Sora", ui-sans-serif, system-ui, sans-serif' },
  { label: 'Figtree (Friendly Geometric Sans)', css: '"Figtree", ui-sans-serif, system-ui, sans-serif' },
  { label: 'Plus Jakarta Sans (Previous Heading Font)', css: '"Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif' },
];

const BODY_FONT_OPTIONS = [
  { label: 'Figtree (Rounded, Crisp & Compact)', css: '"Figtree", ui-sans-serif, system-ui, sans-serif' },
  { label: 'DM Sans (Clean Rounded Geometric)', css: '"DM Sans", ui-sans-serif, system-ui, sans-serif' },
  { label: 'Nunito Sans (Soft Rounded Humanist)', css: '"Nunito Sans", ui-sans-serif, system-ui, sans-serif' },
  { label: 'Manrope (Semi-Condensed Modern Sans)', css: '"Manrope", ui-sans-serif, system-ui, sans-serif' },
  { label: 'Urbanist (Narrow Geometric Sans)', css: '"Urbanist", ui-sans-serif, system-ui, sans-serif' },
  { label: 'Outfit (Soft Geometric Sans)', css: '"Outfit", ui-sans-serif, system-ui, sans-serif' },
  { label: 'Inter (Previous Body Font)', css: '"Inter", ui-sans-serif, system-ui, sans-serif' },
];

const STORAGE_KEY = 'refirely_typography_theme_v1';

interface SavedFontConfig {
  presetId: string;
  displayCss: string;
  bodyCss: string;
  monoCss: string;
  headingTracking: string;
  bodyTracking: string;
  updatedAt?: string;
}

export const FontThemeStudio: React.FC = () => {
  const { isOwnerAdmin, userProfile } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets');

  // Default to the chosen Outfit + Figtree setting immediately across the live website
  const [selectedPresetId, setSelectedPresetId] = useState<string>('outfit-figtree');
  const [displayCss, setDisplayCss] = useState<string>(FONT_PAIRING_PRESETS[0].displayCss);
  const [bodyCss, setBodyCss] = useState<string>(FONT_PAIRING_PRESETS[0].bodyCss);
  const [monoCss, setMonoCss] = useState<string>(FONT_PAIRING_PRESETS[0].monoCss);
  const [headingTracking, setHeadingTracking] = useState<string>('-0.015em');
  const [bodyTracking, setBodyTracking] = useState<string>('-0.005em');

  const [isSavingGlobal, setIsSavingGlobal] = useState(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);

  // 1. Load cached font preference and sync global admin-published font from Firestore for all visitors
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: SavedFontConfig = JSON.parse(raw);
        if (parsed.displayCss && parsed.bodyCss) {
          setSelectedPresetId(parsed.presetId || 'outfit-figtree');
          setDisplayCss(parsed.displayCss);
          setBodyCss(parsed.bodyCss);
          setMonoCss(parsed.monoCss || FONT_PAIRING_PRESETS[0].monoCss);
          setHeadingTracking(parsed.headingTracking || '-0.015em');
          setBodyTracking(parsed.bodyTracking || '-0.005em');
        }
      }
    } catch {
      // ignore local storage errors
    }

    // Fetch global admin-saved typography setting from Firestore (/platformSettings/typography)
    let isMounted = true;
    const fetchGlobalTypography = async () => {
      try {
        const snap = await getDoc(doc(db, 'platformSettings', 'typography'));
        if (snap.exists() && isMounted) {
          const data = snap.data() as SavedFontConfig;
          if (data.displayCss && data.bodyCss) {
            setSelectedPresetId(data.presetId || 'outfit-figtree');
            setDisplayCss(data.displayCss);
            setBodyCss(data.bodyCss);
            setMonoCss(data.monoCss || FONT_PAIRING_PRESETS[0].monoCss);
            setHeadingTracking(data.headingTracking || '-0.015em');
            setBodyTracking(data.bodyTracking || '-0.005em');

            try {
              localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({
                  presetId: data.presetId || 'outfit-figtree',
                  displayCss: data.displayCss,
                  bodyCss: data.bodyCss,
                  monoCss: data.monoCss || FONT_PAIRING_PRESETS[0].monoCss,
                  headingTracking: data.headingTracking || '-0.015em',
                  bodyTracking: data.bodyTracking || '-0.005em',
                  updatedAt: data.updatedAt,
                })
              );
            } catch {
              // ignore
            }
          }
        }
      } catch {
        // Fallback silently to default Outfit + Figtree or localStorage if offline
      }
    };

    fetchGlobalTypography();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Apply CSS custom properties globally to document root for all users & pages
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--active-font-display', displayCss);
    root.style.setProperty('--active-font-sans', bodyCss);
    root.style.setProperty('--active-font-mono', monoCss);
    root.style.setProperty('--active-heading-tracking', headingTracking);
    root.style.setProperty('--active-body-tracking', bodyTracking);
  }, [displayCss, bodyCss, monoCss, headingTracking, bodyTracking]);

  const persistGlobalFontSetting = async (config: SavedFontConfig, showBanner = true) => {
    setIsSavingGlobal(true);
    const nowIso = new Date().toISOString();

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          ...config,
          updatedAt: nowIso,
        })
      );
    } catch {
      // ignore storage errors
    }

    // If authenticated in Firebase as Admin, persist to global /platformSettings/typography document
    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'platformSettings', 'typography'), {
          id: 'typography',
          presetId: config.presetId,
          displayCss: config.displayCss,
          bodyCss: config.bodyCss,
          monoCss: config.monoCss,
          headingTracking: config.headingTracking,
          bodyTracking: config.bodyTracking,
          updatedBy: auth.currentUser.email || userProfile.email || 'admin',
          updatedAt: nowIso,
        });
      } catch {
        // Local persistence still succeeds even if cloud write is skipped
      }
    }

    setIsSavingGlobal(false);
    if (showBanner) {
      const presetObj = FONT_PAIRING_PRESETS.find(p => p.id === config.presetId);
      setSaveSuccessNotice(
        `Saved & applied "${presetObj ? presetObj.name : 'Custom Typography'}" globally across the live website.`
      );
      setTimeout(() => setSaveSuccessNotice(null), 4000);
    }
  };

  const handleSelectPreset = (preset: FontPairingPreset) => {
    setSelectedPresetId(preset.id);
    setDisplayCss(preset.displayCss);
    setBodyCss(preset.bodyCss);
    setMonoCss(preset.monoCss);
    setHeadingTracking(preset.headingTracking);
    setBodyTracking(preset.bodyTracking);

    // Automatically save when admin picks a preset
    persistGlobalFontSetting(
      {
        presetId: preset.id,
        displayCss: preset.displayCss,
        bodyCss: preset.bodyCss,
        monoCss: preset.monoCss,
        headingTracking: preset.headingTracking,
        bodyTracking: preset.bodyTracking,
      },
      true
    );
  };

  const handleSaveCurrentCustomConfig = () => {
    persistGlobalFontSetting(
      {
        presetId: selectedPresetId,
        displayCss,
        bodyCss,
        monoCss,
        headingTracking,
        bodyTracking,
      },
      true
    );
  };

  // CRITICAL: Hide all font editing controls from non-admin users while keeping the global font active
  if (!isOwnerAdmin) {
    return null;
  }

  const activePreset =
    FONT_PAIRING_PRESETS.find(p => p.id === selectedPresetId) || FONT_PAIRING_PRESETS[0];

  return (
    <>
      {/* Admin-Only Bottom-Left Live Font Switcher Bar */}
      <div className="fixed bottom-5 left-5 sm:bottom-6 sm:left-6 z-40 flex items-center gap-2">
        <div className="flex items-center gap-1.5 p-1.5 rounded-full bg-white/95 backdrop-blur-md border border-indigo-200/90 shadow-lg">
          <button
            type="button"
            onClick={() => setIsOpen(prev => !prev)}
            className="flex items-center gap-2 pl-3 pr-3.5 py-1.5 rounded-full bg-gradient-to-r from-slate-900 via-indigo-950 to-teal-950 hover:from-indigo-900 hover:to-teal-900 text-white text-xs font-extrabold cursor-pointer transition-all shadow-2xs"
            title="Admin-Only Global Website Font & Typography Studio"
          >
            <Shield className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span>Admin Font Studio: {activePreset.name}</span>
            <ChevronUp
              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Quick 1-Click Admin Preset Cycle Pills */}
          <div className="hidden xl:flex items-center gap-1 pr-1">
            {FONT_PAIRING_PRESETS.slice(0, 4).map(preset => {
              const isSelected = selectedPresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  style={{ fontFamily: preset.displayCss }}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-indigo-100 text-indigo-950 border border-indigo-300'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                  title={`Apply ${preset.name} globally across the website`}
                >
                  {preset.displayFont}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Interactive Admin-Only Font Studio Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-2 sm:p-4 bg-slate-950/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.97 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-5xl max-h-[88vh] rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Studio Header */}
              <div className="px-5 sm:px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-teal-950 text-white flex flex-wrap items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center text-amber-300">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-heading text-base sm:text-lg font-extrabold text-white">
                        Admin Global Font &amp; Typography Studio
                      </h2>
                      <span className="px-2 py-0.5 rounded-md bg-amber-400/20 border border-amber-300/40 text-amber-200 text-[10px] font-mono font-bold">
                        Admin Only · Hidden from Normal Users
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-teal-400/20 border border-teal-300/40 text-teal-200 text-[10px] font-mono font-bold">
                        Active Default: {activePreset.name}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">
                      Only administrators can view or change these settings. Saving applies your chosen font style across the entire live website for all visitors.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSaveCurrentCustomConfig}
                    disabled={isSavingGlobal}
                    className="px-3.5 py-1.5 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>
                      {isSavingGlobal ? 'Saving Globally...' : 'Save & Apply Everywhere'}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Close &amp; View Site</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    aria-label="Close Font Studio"
                    className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Save Confirmation Toast Banner */}
              {saveSuccessNotice && (
                <div className="px-5 sm:px-6 py-2.5 bg-emerald-600 text-white text-xs font-extrabold flex items-center justify-between gap-2 shrink-0">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{saveSuccessNotice}</span>
                  </span>
                  <span className="text-[11px] font-mono text-emerald-100">
                    Synced for All Live Website Visitors
                  </span>
                </div>
              )}

              {/* Sub-Navigation: Mode Switcher + Space Efficiency */}
              <div className="px-5 sm:px-6 py-3 bg-slate-50 border-b border-slate-200/90 flex flex-wrap items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-1.5 bg-slate-200/70 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setActiveTab('presets')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-all ${
                      activeTab === 'presets'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>1. Curated Modern &amp; Rounded Presets (6)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('custom')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-all ${
                      activeTab === 'custom'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Sliders className="w-3.5 h-3.5 text-teal-600" />
                    <span>2. Theme Font Roles Breakdown &amp; Custom Mix</span>
                  </button>
                </div>

                {/* Compactness / Letter Spacing Quick Toggle */}
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-[11px] font-bold text-slate-500">Space Efficiency:</span>
                  {[
                    { label: 'Compact (-2%)', hTrack: '-0.022em', bTrack: '-0.01em' },
                    { label: 'Balanced (-1%)', hTrack: '-0.015em', bTrack: '-0.005em' },
                    { label: 'Standard (0%)', hTrack: '0em', bTrack: '0em' },
                  ].map(opt => {
                    const isCurrent = headingTracking === opt.hTrack;
                    return (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => {
                          setHeadingTracking(opt.hTrack);
                          setBodyTracking(opt.bTrack);
                          persistGlobalFontSetting(
                            {
                              presetId: selectedPresetId,
                              displayCss,
                              bodyCss,
                              monoCss,
                              headingTracking: opt.hTrack,
                              bodyTracking: opt.bTrack,
                            },
                            true
                          );
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${
                          isCurrent
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Scrollable Studio Body */}
              <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
                {activeTab === 'presets' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {FONT_PAIRING_PRESETS.map(preset => {
                      const isSelected = selectedPresetId === preset.id;
                      return (
                        <div
                          key={preset.id}
                          onClick={() => handleSelectPreset(preset)}
                          className={`rounded-2xl border p-4 flex flex-col justify-between gap-3 cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-indigo-50/40 border-2 border-indigo-600 shadow-md ring-2 ring-indigo-500/20'
                              : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-xs'
                          }`}
                        >
                          <div className="space-y-2.5">
                            {/* Top Badges */}
                            <div className="flex items-center justify-between gap-1.5">
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                                  preset.recommended
                                    ? 'bg-teal-100 text-teal-900 border border-teal-300'
                                    : preset.isPreviousDefault
                                    ? 'bg-slate-100 text-slate-700 border border-slate-300'
                                    : 'bg-indigo-50 text-indigo-900 border border-indigo-200'
                                }`}
                              >
                                {preset.badge}
                              </span>
                              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono text-[10px] font-bold">
                                {preset.spaceSavingGain}
                              </span>
                            </div>

                            {/* Font Pairing Name Rendered in Its Own Display Face */}
                            <div>
                              <h3
                                style={{
                                  fontFamily: preset.displayCss,
                                  letterSpacing: preset.headingTracking,
                                }}
                                className="text-lg font-extrabold text-slate-900 leading-tight"
                              >
                                {preset.name}
                              </h3>
                              <p className="text-[11px] font-semibold text-indigo-700">
                                {preset.vibe}
                              </p>
                            </div>

                            {/* Live Mini Card Specimen Rendered in This Preset's Exact Fonts */}
                            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 space-y-1.5">
                              <div className="flex items-center justify-between text-[10px]">
                                <span
                                  style={{ fontFamily: preset.bodyCss }}
                                  className="font-bold text-teal-800 flex items-center gap-1"
                                >
                                  <MapPin className="w-2.5 h-2.5 text-teal-600" />
                                  <span>Cais do Sodré, Lisbon</span>
                                </span>
                                <span
                                  style={{ fontFamily: preset.monoCss }}
                                  className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-900 font-bold"
                                >
                                  ★ 4.9 (3.8k) · $25/day
                                </span>
                              </div>

                              <p
                                style={{
                                  fontFamily: preset.displayCss,
                                  letterSpacing: preset.headingTracking,
                                }}
                                className="text-xs font-extrabold text-slate-900 leading-snug"
                              >
                                Second Home Lisboa &amp; Copenhagen Coffee Lab
                              </p>

                              <p
                                style={{
                                  fontFamily: preset.bodyCss,
                                  letterSpacing: preset.bodyTracking,
                                }}
                                className="text-[11px] text-slate-600 leading-snug"
                              >
                                💡 <strong className="text-sky-900">Tip:</strong> Book a trial day pass on Thursday to join their weekly Cultural Hour drinks with founders and remote engineers.
                              </p>
                            </div>

                            <p className="text-[11px] text-slate-500 leading-snug">
                              {preset.description}
                            </p>
                          </div>

                          {/* Action Button */}
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              handleSelectPreset(preset);
                            }}
                            className={`w-full py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-indigo-600 text-white shadow-2xs'
                                : 'bg-slate-100 hover:bg-indigo-50 text-slate-800 hover:text-indigo-900'
                            }`}
                          >
                            {isSelected ? (
                              <>
                                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                <span>Saved &amp; Active Everywhere</span>
                              </>
                            ) : (
                              <span>Save &amp; Apply {preset.name}</span>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* Tab 2: Full Breakdown of Theme Font Roles + Custom Mix-and-Match */
                  <div className="space-y-6">
                    <div className="rounded-2xl border border-slate-200 overflow-hidden">
                      <div className="px-4 py-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
                        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                          All Font Roles &amp; Styles Used in the ReFirely Theme
                        </h3>
                        <span className="text-[11px] text-slate-500">
                          3 Semantic CSS Variables · Applied Globally
                        </span>
                      </div>
                      <div className="divide-y divide-slate-200 text-xs">
                        <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-3 items-center bg-white">
                          <div>
                            <span className="font-extrabold text-slate-900 block">
                              1. Display &amp; Headings (`--font-display`)
                            </span>
                            <span className="text-[11px] text-slate-500">
                              Used on: `h1`, `h2`, `h3`, `h4`, `.font-heading`, Hero Titles, Country Names &amp; Venue Card Titles
                            </span>
                          </div>
                          <div>
                            <span className="text-[11px] text-slate-500 block">Previous Font:</span>
                            <span className="font-semibold text-slate-700">
                              Plus Jakarta Sans (600, 700, 800)
                            </span>
                          </div>
                          <div>
                            <span className="text-[11px] text-slate-500 block">Currently Active:</span>
                            <span className="font-extrabold text-indigo-700">
                              {activePreset.displayFont} ({headingTracking} tracking)
                            </span>
                          </div>
                          <div>
                            <select
                              aria-label="Choose Display Font"
                              value={displayCss}
                              onChange={e => {
                                const nextDisplay = e.target.value;
                                setDisplayCss(nextDisplay);
                                setSelectedPresetId('custom');
                                persistGlobalFontSetting(
                                  {
                                    presetId: 'custom',
                                    displayCss: nextDisplay,
                                    bodyCss,
                                    monoCss,
                                    headingTracking,
                                    bodyTracking,
                                  },
                                  true
                                );
                              }}
                              className="w-full px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-900"
                            >
                              {DISPLAY_FONT_OPTIONS.map(opt => (
                                <option key={opt.label} value={opt.css}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-3 items-center bg-white">
                          <div>
                            <span className="font-extrabold text-slate-900 block">
                              2. Body, UI &amp; Cards (`--font-sans`)
                            </span>
                            <span className="text-[11px] text-slate-500">
                              Used on: `body`, paragraphs, Insider Tips (`💡 Tip:`), navigation tabs, filters, and form inputs
                            </span>
                          </div>
                          <div>
                            <span className="text-[11px] text-slate-500 block">Previous Font:</span>
                            <span className="font-semibold text-slate-700">
                              Inter (400, 500, 600, 700)
                            </span>
                          </div>
                          <div>
                            <span className="text-[11px] text-slate-500 block">Currently Active:</span>
                            <span className="font-extrabold text-teal-700">
                              {activePreset.bodyFont} ({bodyTracking} tracking)
                            </span>
                          </div>
                          <div>
                            <select
                              aria-label="Choose Body Font"
                              value={bodyCss}
                              onChange={e => {
                                const nextBody = e.target.value;
                                setBodyCss(nextBody);
                                setSelectedPresetId('custom');
                                persistGlobalFontSetting(
                                  {
                                    presetId: 'custom',
                                    displayCss,
                                    bodyCss: nextBody,
                                    monoCss,
                                    headingTracking,
                                    bodyTracking,
                                  },
                                  true
                                );
                              }}
                              className="w-full px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-900"
                            >
                              {BODY_FONT_OPTIONS.map(opt => (
                                <option key={opt.label} value={opt.css}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-3 items-center bg-white">
                          <div>
                            <span className="font-extrabold text-slate-900 block">
                              3. Numbers &amp; Financial Telemetry (`--font-mono`)
                            </span>
                            <span className="text-[11px] text-slate-500">
                              Used on: `.font-mono`, 4% FIRE nest eggs, monthly burn, star ratings, and visa day counters
                            </span>
                          </div>
                          <div>
                            <span className="text-[11px] text-slate-500 block">Previous Font:</span>
                            <span className="font-semibold text-slate-700">
                              System UI Monospace
                            </span>
                          </div>
                          <div>
                            <span className="text-[11px] text-slate-500 block">Currently Active:</span>
                            <span className="font-extrabold text-violet-700 font-mono">
                              JetBrains Mono (tabular-nums)
                            </span>
                          </div>
                          <div>
                            <span className="px-2.5 py-1 rounded-lg bg-violet-50 border border-violet-200 text-violet-900 font-mono text-[11px] font-bold inline-block">
                              $1,450/mo · 300 Mbps · ★ 4.9
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Live Side-by-Side Website Component Specimen Preview */}
                <div className="rounded-2xl bg-slate-50 border border-slate-200/90 p-4 sm:p-5 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                      Live Interactive Specimen Preview ({activePreset.name})
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSelectPreset(FONT_PAIRING_PRESETS[0])}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset to Default (Outfit + Figtree)</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                    {/* Left: Hero & Dossier Typography Sample */}
                    <div className="lg:col-span-7 p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                      <span className="text-[11px] font-bold text-teal-700">
                        Global Retirement (FIRE) &amp; Digital Nomad Haven Guide
                      </span>
                      <h4 className="font-heading text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
                        Where Your Freedom Goes Further Across 209 Global Havens
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        Compare turnkey monthly living burn, 4% safe withdrawal nest eggs, Digital Nomad Visas (DNV), fiber internet speeds, and neighborhood apartment rents with rounded, high-legibility typography that fits more insight into every card.
                      </p>
                      <div className="pt-1 flex flex-wrap items-center gap-3 text-xs font-mono font-bold text-slate-800">
                        <span className="px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-200 text-teal-900">
                          Portugal D7 / D8 · $2,150/mo
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-900">
                          Thailand DTV · $1,250/mo
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-sky-50 border border-sky-200 text-sky-900">
                          Colombia Nomad · $1,380/mo
                        </span>
                      </div>
                    </div>

                    {/* Right: Actual Scout Itinerary Card Sample */}
                    <div className="lg:col-span-5 p-3.5 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-2xs">
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-900 text-[10px] font-extrabold">
                          💻 Coworking &amp; Tech Hub
                        </span>
                        <span className="px-1.5 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-slate-900 font-mono text-[10px] font-extrabold flex items-center gap-1">
                          <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                          <span>4.9 (3.8k)</span>
                        </span>
                      </div>
                      <h5 className="font-heading text-sm font-extrabold text-slate-900 leading-snug">
                        Second Home Lisboa (Mercado da Ribeira) &amp; Copenhagen Coffee Lab
                      </h5>
                      <p className="text-[11px] text-slate-600 leading-snug">
                        Work surrounded by 2,000+ indoor plants above Time Out Market with 500 Mbps symmetrical fiber and specialty Nordic roasts.
                      </p>
                      <div className="px-2.5 py-1.5 rounded-lg bg-sky-50/70 border border-sky-200/80 text-[10.5px] text-sky-950 leading-snug">
                        <span className="font-extrabold text-sky-800">💡 Tip: </span>
                        <span>
                          Book a trial day pass on Thursday to join their weekly Cultural Hour drinks with founders and remote engineers.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
