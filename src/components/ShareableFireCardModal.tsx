import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Download,
  Share2,
  RefreshCw,
  Shield,
  Sparkles,
  Check,
  Flame,
  Globe,
  Award,
  TrendingUp,
  Smartphone,
  Square,
  Copy,
} from 'lucide-react';
import { Persona } from '../types';

declare global {
  interface Window {
    htmlToImage?: {
      toPng: (
        node: HTMLElement,
        options?: {
          quality?: number;
          pixelRatio?: number;
          cacheBust?: boolean;
          backgroundColor?: string;
          width?: number;
          height?: number;
          skipFonts?: boolean;
          style?: Partial<CSSStyleDeclaration>;
        }
      ) => Promise<string>;
      toBlob: (
        node: HTMLElement,
        options?: {
          quality?: number;
          pixelRatio?: number;
          cacheBust?: boolean;
          backgroundColor?: string;
          width?: number;
          height?: number;
          skipFonts?: boolean;
          style?: Partial<CSSStyleDeclaration>;
        }
      ) => Promise<Blob | null>;
    };
  }
}

export interface ShareFireCardPayload {
  persona?: Persona;
  badgeTitle?: string;
  badgeEmoji?: string;
  yearsSaved?: number;
  fireProgressPercent?: number;
  topCountry?: string;
  topCity?: string;
  topCountryFlag?: string;
  monthlyBurnUSD?: number;
  domesticMonthlyBurnUSD?: number;
  currentNetWorthUSD?: number;
  targetFireNestEggUSD?: number;
  nomadRunwayMonths?: number;
  fiberMbps?: number;
  swrPercent?: number;
  headlineMode?: 'years-saved' | 'fi-percent' | 'nomad-runway';
  userName?: string;
}

interface ShareableFireCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: ShareFireCardPayload | null;
}

export interface FireMilestoneOption {
  id: string;
  title: string;
  emoji: string;
  pillText: string;
  defaultHeadlineMode: 'years-saved' | 'fi-percent' | 'nomad-runway';
}

export const FIRE_MILESTONE_PRESETS: FireMilestoneOption[] = [
  {
    id: 'arbitrage-architect',
    title: 'Arbitrage Architect',
    emoji: '⚡',
    pillText: '⚡ ARBITRAGE ARCHITECT',
    defaultHeadlineMode: 'years-saved',
  },
  {
    id: 'fire-pathfinder',
    title: 'FIRE Pathfinder',
    emoji: '🌿',
    pillText: '🌿 FIRE PATHFINDER',
    defaultHeadlineMode: 'years-saved',
  },
  {
    id: 'coast-fire-nomad',
    title: 'Coast FIRE Nomad',
    emoji: '🌊',
    pillText: '🌊 COAST FIRE NOMAD',
    defaultHeadlineMode: 'fi-percent',
  },
  {
    id: 'runway-sovereign',
    title: 'Runway Sovereign',
    emoji: '👑',
    pillText: '👑 RUNWAY SOVEREIGN',
    defaultHeadlineMode: 'nomad-runway',
  },
  {
    id: '100-fi',
    title: '100% FI',
    emoji: '🔥',
    pillText: '🔥 100% FI SOVEREIGN',
    defaultHeadlineMode: 'fi-percent',
  },
];

async function ensureHtmlToImageLoaded(): Promise<NonNullable<Window['htmlToImage']>> {
  if (typeof window !== 'undefined' && window.htmlToImage) {
    return window.htmlToImage;
  }

  return new Promise((resolve, reject) => {
    const existingScript = document.querySelector(
      'script[src*="html-to-image"]'
    ) as HTMLScriptElement | null;

    if (existingScript && window.htmlToImage) {
      resolve(window.htmlToImage);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/html-to-image@1.11.11/dist/html-to-image.js';
    script.crossOrigin = 'anonymous';
    script.onload = () => {
      if (window.htmlToImage) {
        resolve(window.htmlToImage);
      } else {
        reject(new Error('htmlToImage failed to initialize on window.'));
      }
    };
    script.onerror = () => reject(new Error('Failed to load html-to-image from CDN.'));
    document.head.appendChild(script);
  });
}

function dataUrlToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(',');
  const mimeMatch = parts[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/png';
  const binary = atob(parts[1]);
  const array = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    array[i] = binary.charCodeAt(i);
  }
  return new Blob([array], { type: mime });
}

export const ShareableFireCardModal: React.FC<ShareableFireCardModalProps> = ({
  isOpen,
  onClose,
  initialData,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  // 1. Format Switcher: 'story' (9:16 -> 1080x1920) vs 'post' (1:1 -> 1080x1080)
  const [format, setFormat] = useState<'story' | 'post'>('story');

  // 2. Privacy Mode (Checked by default per specification)
  const [privacyMode, setPrivacyMode] = useState<boolean>(true);

  // 3. Active Persona ('retiree' vs 'nomad'), initialized from localStorage or payload
  const [activePersona, setActivePersona] = useState<Persona>(() => {
    if (initialData?.persona) return initialData.persona;
    try {
      const saved = localStorage.getItem('refirely_persona');
      if (saved === 'nomad' || saved === 'retiree') return saved;
    } catch {}
    return 'retiree';
  });

  // 4. Hook Index (0, 1, 2)
  const [hookIndex, setHookIndex] = useState<number>(0);

  // 5. Badge Title & Headline Focus
  const [badgeTitle, setBadgeTitle] = useState<string>(
    initialData?.badgeTitle || 'Arbitrage Architect'
  );
  const [badgeEmoji, setBadgeEmoji] = useState<string>(initialData?.badgeEmoji || '⚡');
  const [headlineMode, setHeadlineMode] = useState<'years-saved' | 'fi-percent' | 'nomad-runway'>(
    initialData?.headlineMode || 'years-saved'
  );

  // Export & Share status
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync state when modal opens with new initialData
  useEffect(() => {
    if (isOpen) {
      const storedPersona = (() => {
        try {
          const s = localStorage.getItem('refirely_persona');
          return s === 'nomad' || s === 'retiree' ? (s as Persona) : null;
        } catch {
          return null;
        }
      })();
      const resolvedPersona = initialData?.persona || storedPersona || 'retiree';
      setActivePersona(resolvedPersona);
      setPrivacyMode(true);
      setHookIndex(0);

      if (initialData?.badgeTitle) {
        setBadgeTitle(initialData.badgeTitle);
        setBadgeEmoji(initialData.badgeEmoji || (resolvedPersona === 'nomad' ? '⚡' : '🌿'));
      } else {
        setBadgeTitle(resolvedPersona === 'nomad' ? 'Coast FIRE Nomad' : 'Arbitrage Architect');
        setBadgeEmoji(resolvedPersona === 'nomad' ? '⚡' : '🌿');
      }

      if (initialData?.headlineMode) {
        setHeadlineMode(initialData.headlineMode);
      } else if (resolvedPersona === 'nomad') {
        setHeadlineMode('nomad-runway');
      } else if ((initialData?.yearsSaved ?? 8) > 0) {
        setHeadlineMode('years-saved');
      } else {
        setHeadlineMode('fi-percent');
      }
    }
  }, [isOpen, initialData]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4200);
  };

  // Resolved Metrics with sensible defaults
  const yearsSaved = Math.max(1, initialData?.yearsSaved ?? 8);
  const fireProgressPercent = Math.min(100, Math.max(5, initialData?.fireProgressPercent ?? 74));
  const topCountry = initialData?.topCountry || 'Portugal';
  const topCity = initialData?.topCity || (topCountry === 'Portugal' ? 'Lisbon' : topCountry === 'Spain' ? 'Valencia' : topCountry === 'Thailand' ? 'Chiang Mai' : 'Coastal Hub');
  const topLocationDisplay = topCity && !topCountry.toLowerCase().includes(topCity.toLowerCase())
    ? `${topCity}, ${topCountry}`
    : topCountry;
  const monthlyBurnUSD = initialData?.monthlyBurnUSD || 2100;
  const domesticMonthlyBurnUSD = initialData?.domesticMonthlyBurnUSD || 4800;
  const burnSavingsPct = Math.max(
    25,
    Math.min(75, Math.round(((domesticMonthlyBurnUSD - monthlyBurnUSD) / Math.max(1, domesticMonthlyBurnUSD)) * 100))
  );
  const nomadRunwayMonths = Math.max(6, initialData?.nomadRunwayMonths ?? 24);
  const currentNetWorthUSD = initialData?.currentNetWorthUSD || 445000;
  const targetFireNestEggUSD = initialData?.targetFireNestEggUSD || 600000;
  const swrPercent = initialData?.swrPercent || 4.0;
  const fiberMbps = initialData?.fiberMbps || 250;

  // Dynamic Persona-Based Hook Arrays (Section 3 of Spec)
  const hooks = useMemo(() => {
    if (activePersona === 'nomad') {
      return [
        `My savings fund ${nomadRunwayMonths} months of living & creating in ${topCountry}. How long is YOUR global runway? Test it free at:`,
        `Zero Schengen overstays. Full slow-travel freedom. Plan your multi-stop visa & living route at:`,
        `Trading high rent for fiber internet, sunshine, and lower taxes. Find your next remote hub at:`,
      ];
    }
    return [
      `My nest egg buys ${yearsSaved} extra years of freedom in ${topCountry}. How early could YOU retire abroad? Calculate your FIRE roadmap at:`,
      `Same savings. Half the monthly burn. Zero cubicle stress. Discover where your wealth multiplies at:`,
      `I just unlocked my ${badgeTitle} badge on ReFIREly. See which of 209 global havens matches your FIRE number at:`,
    ];
  }, [activePersona, yearsSaved, nomadRunwayMonths, topCountry, badgeTitle]);

  const activeHookText = hooks[hookIndex % hooks.length];

  const handleShuffleHook = () => {
    setHookIndex(prev => (prev + 1) % hooks.length);
  };

  // Hero Headline based on headlineMode
  const heroHeadline = useMemo(() => {
    if (headlineMode === 'nomad-runway') {
      return `${nomadRunwayMonths} Months of Global Freedom in ${topCountry}`;
    }
    if (headlineMode === 'fi-percent') {
      return fireProgressPercent >= 100
        ? `100% Financially Independent via Geoarbitrage`
        : `${fireProgressPercent}% to Financial Independence`;
    }
    return `Retiring ${yearsSaved} ${yearsSaved === 1 ? 'Year' : 'Years'} Earlier via Geoarbitrage`;
  }, [headlineMode, nomadRunwayMonths, topCountry, fireProgressPercent, yearsSaved]);

  // Capture PNG Data URL at 2x pixelRatio (1080x1920 for 9:16 Story, 1080x1080 for 1:1 Post)
  const generateCardPngDataUrl = async (): Promise<string> => {
    if (!cardRef.current) {
      throw new Error('Card preview element is not mounted.');
    }
    const htmlToImage = await ensureHtmlToImageLoaded();
    const baseWidth = 540;
    const baseHeight = format === 'story' ? 960 : 540;

    try {
      return await htmlToImage.toPng(cardRef.current, {
        pixelRatio: 2, // 540x960 @ 2x = 1080x1920; 540x540 @ 2x = 1080x1080
        cacheBust: true,
        width: baseWidth,
        height: baseHeight,
        backgroundColor: '#041f1e',
      });
    } catch {
      // Fallback with skipFonts: true if browser extension or CORS blocks external font rules
      return await htmlToImage.toPng(cardRef.current, {
        pixelRatio: 2,
        cacheBust: true,
        skipFonts: true,
        width: baseWidth,
        height: baseHeight,
        backgroundColor: '#041f1e',
      });
    }
  };

  // Section 5.1: Download Image (PNG)
  const handleDownloadPng = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      const dataUrl = await generateCardPngDataUrl();
      const link = document.createElement('a');
      link.download = 'refirely-fire-badge.png';
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast(
        `Downloaded refirely-fire-badge.png (${format === 'story' ? '1080×1920 Story' : '1080×1080 Post'} @ 2x Retina)!`
      );
    } catch (err) {
      console.error('Error generating FIRE card PNG:', err);
      showToast('Could not generate PNG image. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Section 5.2: Share to Social (Native Web Share API with files, or Clipboard Fallback)
  const handleShareToSocial = async () => {
    if (isExporting) return;
    setIsExporting(true);
    const shareCaption = `${activeHookText} https://refirely.com`;

    try {
      const dataUrl = await generateCardPngDataUrl();
      const blob = dataUrlToBlob(dataUrl);
      const pngFile = new File([blob], 'refirely-fire-badge.png', { type: 'image/png' });

      if (
        typeof navigator !== 'undefined' &&
        typeof navigator.share === 'function' &&
        (!navigator.canShare || navigator.canShare({ files: [pngFile] }))
      ) {
        await navigator.share({
          files: [pngFile],
          title: 'My Refirely FIRE Roadmap',
          text: 'Check out my early retirement geoarbitrage plan on https://refirely.com',
        });
        showToast('Shared your ReFIREly Freedom Card!');
        setIsExporting(false);
        return;
      }

      // If file sharing is not supported on desktop browser, try text/url share or copy caption + auto-download
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(
          `Check out my early retirement geoarbitrage plan on https://refirely.com — ${shareCaption}`
        );
      }
      // Also trigger PNG download so desktop user has the image ready to drop into Instagram/X/LinkedIn
      const link = document.createElement('a');
      link.download = 'refirely-fire-badge.png';
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast(
        'Promotional caption + https://refirely.com link copied to clipboard & PNG downloaded!'
      );
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        setIsExporting(false);
        return;
      }
      try {
        if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(
            `Check out my early retirement geoarbitrage plan on https://refirely.com — ${shareCaption}`
          );
        }
        showToast('Promotional caption + https://refirely.com link copied to clipboard!');
      } catch {
        showToast('Share ready — visit https://refirely.com');
      }
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  // Base dimensions of the card node (rendered at 2x pixelRatio -> 1080x1920 or 1080x1080)
  const isStory = format === 'story';
  const baseWidth = 540;
  const baseHeight = isStory ? 960 : 540;
  // Visual scale inside the modal preview container so it fits cleanly on desktop & mobile viewports
  const previewScale = isStory ? 0.52 : 0.72;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-md overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          onClick={e => e.stopPropagation()}
          className="relative w-full max-w-5xl rounded-3xl bg-slate-900/95 border border-emerald-500/30 text-white shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col"
        >
          {/* Top Accent Gradient Bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-emerald-400 via-amber-400 to-teal-400 shrink-0" />

          {/* Modal Header */}
          <div className="px-5 sm:px-7 py-4 border-b border-white/10 flex items-center justify-between gap-4 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-amber-500 flex items-center justify-center text-slate-950 font-black shadow-md shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2
                    className="text-base sm:text-lg font-extrabold tracking-tight text-white truncate"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    Shareable FIRE Badge &amp; Freedom Card Studio
                  </h2>
                  <span className="text-[11px] font-mono font-bold text-amber-300">
                    {isStory ? '1080×1920 HD' : '1080×1080 HD'} · 2x Retina PNG
                  </span>
                </div>
                <p className="text-xs text-slate-300 truncate">
                  Customize your milestone badge, toggle privacy mode, shuffle viral hooks, and export high-resolution social cards.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Toast Notification Banner */}
          <AnimatePresence>
            {toastMessage && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mx-5 sm:mx-7 mt-3 px-4 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs font-bold flex items-center gap-2 shrink-0"
              >
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{toastMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Body: Left Controls + Right Live High-Res Card Preview */}
          <div className="p-5 sm:p-7 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN: Controls & Customization */}
            <div className="lg:col-span-6 space-y-5">
              {/* 1. Format Switcher Tabs */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                  1. Card Aspect Ratio &amp; Export Resolution
                </label>
                <div className="grid grid-cols-2 gap-2.5 p-1 rounded-2xl bg-slate-950/80 border border-white/10">
                  <button
                    type="button"
                    onClick={() => setFormat('story')}
                    className={`py-2.5 px-3.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap ${
                      format === 'story'
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 shrink-0" />
                    <span>Instagram Story (9:16)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormat('post')}
                    className={`py-2.5 px-3.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap ${
                      format === 'post'
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Square className="w-4 h-4 shrink-0" />
                    <span>Social Post (1:1)</span>
                  </button>
                </div>
              </div>

              {/* 2. Privacy Mode Checkbox (Checked by Default) */}
              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 space-y-1.5">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={privacyMode}
                    onChange={e => setPrivacyMode(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded accent-emerald-500 cursor-pointer shrink-0"
                  />
                  <div className="space-y-1">
                    <span className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>
                        Privacy Mode (Hide exact dollar balances — show Years Saved &amp; % Progress only)
                      </span>
                    </span>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {privacyMode
                        ? 'Active: Your exact portfolio & monthly burn dollar amounts are hidden. Only percentages, target haven, and years saved are shown.'
                        : 'Unlocked: Displaying exact monthly living burn ($/mo) and portfolio targets on the card.'}
                    </p>
                  </div>
                </label>
              </div>

              {/* 3. Persona & Viewer Call-to-Action Hook Shuffler */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/10 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>2. Persona &amp; Viral Call-to-Action Hook</span>
                  </span>

                  {/* Persona Switcher */}
                  <div className="inline-flex p-0.5 rounded-xl bg-slate-900 border border-white/15 text-[11px]">
                    <button
                      type="button"
                      onClick={() => {
                        setActivePersona('retiree');
                        setHookIndex(0);
                        setHeadlineMode('years-saved');
                      }}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer whitespace-nowrap ${
                        activePersona === 'retiree'
                          ? 'bg-emerald-500 text-slate-950'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      🌿 Retiree
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActivePersona('nomad');
                        setHookIndex(0);
                        setHeadlineMode('nomad-runway');
                      }}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer whitespace-nowrap ${
                        activePersona === 'nomad'
                          ? 'bg-amber-400 text-slate-950'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      ⚡ Nomad
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-slate-200 leading-relaxed italic">
                  &ldquo;{activeHookText}&rdquo; <strong className="text-amber-300 not-italic">Refirely.com</strong>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-[11px] text-slate-400 font-mono">
                    Hook {(hookIndex % hooks.length) + 1} of {hooks.length} ({activePersona === 'nomad' ? 'Nomad' : 'Retiree'} Pack)
                  </span>
                  <button
                    type="button"
                    onClick={handleShuffleHook}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-emerald-500/20 hover:from-amber-500/30 hover:to-emerald-500/30 border border-amber-400/40 text-amber-200 text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-amber-300" />
                    <span>🔄 Shuffle Hook</span>
                  </button>
                </div>
              </div>

              {/* 4. Milestone Badge & Hero Headline Selector */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/10 space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                  3. Featured Milestone Badge &amp; Hero Stat
                </label>

                <div className="flex flex-wrap gap-1.5">
                  {FIRE_MILESTONE_PRESETS.map(preset => {
                    const isSelected = badgeTitle.toLowerCase() === preset.title.toLowerCase();
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          setBadgeTitle(preset.title);
                          setBadgeEmoji(preset.emoji);
                          setHeadlineMode(preset.defaultHeadlineMode);
                        }}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer whitespace-nowrap ${
                          isSelected
                            ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-sm'
                            : 'bg-slate-900 text-slate-300 border-white/10 hover:border-white/25 hover:text-white'
                        }`}
                      >
                        {preset.emoji} {preset.title}
                      </button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setHeadlineMode('years-saved')}
                    className={`py-1.5 px-2.5 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer whitespace-nowrap ${
                      headlineMode === 'years-saved'
                        ? 'bg-emerald-500/25 border-emerald-400 text-emerald-200'
                        : 'bg-slate-900 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    Headline: {yearsSaved} Yrs Saved
                  </button>
                  <button
                    type="button"
                    onClick={() => setHeadlineMode('fi-percent')}
                    className={`py-1.5 px-2.5 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer whitespace-nowrap ${
                      headlineMode === 'fi-percent'
                        ? 'bg-emerald-500/25 border-emerald-400 text-emerald-200'
                        : 'bg-slate-900 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    Headline: {fireProgressPercent}% to FI
                  </button>
                  <button
                    type="button"
                    onClick={() => setHeadlineMode('nomad-runway')}
                    className={`py-1.5 px-2.5 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer whitespace-nowrap ${
                      headlineMode === 'nomad-runway'
                        ? 'bg-emerald-500/25 border-emerald-400 text-emerald-200'
                        : 'bg-slate-900 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    Headline: {nomadRunwayMonths}m Runway
                  </button>
                </div>
              </div>

              {/* 5. Export & Native Mobile Share Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  disabled={isExporting}
                  onClick={handleDownloadPng}
                  className="py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 hover:from-emerald-300 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 whitespace-nowrap"
                >
                  <Download className="w-4 h-4 text-slate-950 shrink-0" />
                  <span>{isExporting ? 'Rendering 2x PNG...' : '⬇️ Download Image (PNG)'}</span>
                </button>

                <button
                  type="button"
                  disabled={isExporting}
                  onClick={handleShareToSocial}
                  className="py-3.5 px-5 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 whitespace-nowrap"
                >
                  <Share2 className="w-4 h-4 text-slate-950 shrink-0" />
                  <span>📤 Share to Social</span>
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN: Live Scaled Card Preview (1080x1920 or 1080x1080 at 2x pixelRatio) */}
            <div className="lg:col-span-6 flex flex-col items-center justify-center bg-slate-950/90 rounded-3xl border border-white/10 p-4 sm:p-6 min-h-[420px]">
              <div className="text-[11px] font-mono text-slate-400 mb-3 flex items-center gap-2">
                <span>Live Preview ({isStory ? 'Instagram Story 9:16 · 1080×1920' : 'Social Post 1:1 · 1080×1080'})</span>
                <span>·</span>
                <span className="text-emerald-400 font-bold">
                  {privacyMode ? '🔒 Privacy Mode ON' : '🔓 Dollar Figures Visible'}
                </span>
              </div>

              {/* Outer wrapper sized to the scaled preview dimensions */}
              <div
                style={{
                  width: `${Math.round(baseWidth * previewScale)}px`,
                  height: `${Math.round(baseHeight * previewScale)}px`,
                }}
                className="relative flex items-start justify-start overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/15"
              >
                <div
                  style={{
                    width: `${baseWidth}px`,
                    height: `${baseHeight}px`,
                    transform: `scale(${previewScale})`,
                    transformOrigin: 'top left',
                  }}
                >
                  {/* ================================================================= */}
                  {/* EXPORTED CARD NODE (Captured at 2x pixelRatio -> 1080x1920 / 1080) */}
                  {/* ================================================================= */}
                  <div
                    ref={cardRef}
                    style={{
                      width: `${baseWidth}px`,
                      height: `${baseHeight}px`,
                      fontFamily: "'Inter', sans-serif",
                      background:
                        'radial-gradient(circle at 18% 15%, rgba(16, 185, 129, 0.28) 0%, transparent 45%), radial-gradient(circle at 85% 80%, rgba(245, 158, 11, 0.22) 0%, transparent 48%), linear-gradient(145deg, #031c1a 0%, #072d29 45%, #0c192c 100%)',
                    }}
                    className={`relative overflow-hidden text-white flex flex-col justify-between ${
                      isStory ? 'p-11' : 'p-7'
                    }`}
                  >
                    {/* Subtle geometric fintech grid & gold rim */}
                    <div
                      className="pointer-events-none absolute inset-3 rounded-3xl border border-amber-300/20"
                      style={{
                        boxShadow: 'inset 0 0 60px rgba(16, 185, 129, 0.08)',
                      }}
                    />

                    {/* 1. TOP HEADER: Local ReFIREly Logo Asset + Dynamic Milestone Pill */}
                    <div className="relative z-10 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src="/assets/aistudio/refirely-icon.png"
                          alt="ReFIREly Logo"
                          crossOrigin="anonymous"
                          className={`${isStory ? 'w-12 h-12' : 'w-10 h-10'} rounded-2xl object-contain bg-white/10 p-1 border border-amber-300/30 shadow-md`}
                        />
                        <div>
                          <div
                            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                            className={`${isStory ? 'text-2xl' : 'text-xl'} font-extrabold tracking-tight leading-none flex items-center`}
                          >
                            <span className="text-white">Re</span>
                            <span className="text-amber-400">FIRE</span>
                            <span className="text-emerald-300">ly</span>
                          </div>
                          <span className="text-[10px] font-semibold uppercase tracking-widest text-emerald-200/80 block mt-0.5">
                            Global Freedom &amp; Geoarbitrage
                          </span>
                        </div>
                      </div>

                      {/* Dynamic Milestone Pill Badge */}
                      <div
                        style={{
                          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.22), rgba(16, 185, 129, 0.25))',
                        }}
                        className="px-3.5 py-1.5 rounded-full border border-amber-300/50 text-amber-200 text-xs font-extrabold tracking-wider uppercase shadow-md"
                      >
                        {badgeEmoji} {badgeTitle.toUpperCase()}
                      </div>
                    </div>

                    {/* 2. CENTER HERO METRIC */}
                    <div className={`relative z-10 ${isStory ? 'space-y-7 my-auto' : 'space-y-3.5 my-auto'}`}>
                      {/* Eyebrow Kicker */}
                      <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-300">
                        <Flame className="w-4 h-4 text-amber-400" />
                        <span>
                          {activePersona === 'nomad'
                            ? 'Verified Digital Nomad Runway Roadmap'
                            : 'Verified Geoarbitrage FIRE Roadmap'}
                        </span>
                      </div>

                      {/* Bold Hero Achievement Headline */}
                      <h1
                        style={{
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          lineHeight: 1.12,
                        }}
                        className={`${
                          isStory ? 'text-4xl' : 'text-2xl'
                        } font-extrabold tracking-tight text-white`}
                      >
                        {heroHeadline}
                      </h1>

                      {/* Visual Progress Bar Card */}
                      <div
                        style={{
                          background: 'rgba(255, 255, 255, 0.06)',
                        }}
                        className={`rounded-2xl border border-white/15 ${
                          isStory ? 'p-5 space-y-3.5' : 'p-3.5 space-y-2'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-emerald-200 uppercase tracking-wider">
                            {activePersona === 'nomad'
                              ? 'Global Freedom Runway Index'
                              : 'Financial Independence Progress'}
                          </span>
                          <span className="font-mono text-base font-extrabold text-amber-300 tabular-nums">
                            {activePersona === 'nomad'
                              ? `${nomadRunwayMonths} Months (${(nomadRunwayMonths / 12).toFixed(1)} Yrs)`
                              : `${fireProgressPercent}% to FI`}
                          </span>
                        </div>

                        {/* Progress Track */}
                        <div className="w-full h-3.5 rounded-full bg-slate-950/80 overflow-hidden p-0.5 border border-white/10">
                          <div
                            style={{
                              width: `${
                                activePersona === 'nomad'
                                  ? Math.min(100, Math.round((nomadRunwayMonths / 24) * 100))
                                  : Math.min(100, fireProgressPercent)
                              }%`,
                              background: 'linear-gradient(90deg, #10b981 0%, #f59e0b 65%, #fde047 100%)',
                            }}
                            className="h-full rounded-full"
                          />
                        </div>

                        {/* Target Haven Highlight */}
                        <div className="pt-1 flex items-center justify-between text-xs text-slate-200">
                          <span className="font-semibold text-white flex items-center gap-1.5">
                            <Globe className="w-3.5 h-3.5 text-emerald-400" />
                            <span>
                              Top Match: <strong className="text-amber-300">{topLocationDisplay}</strong>
                              {privacyMode
                                ? ` • ${burnSavingsPct}% Lower Burn vs. Home`
                                : ` • Est. Monthly Burn: $${monthlyBurnUSD.toLocaleString()}`}
                            </span>
                          </span>
                        </div>
                      </div>

                      {/* Supporting KPI Grid (Adapts to Privacy Mode) */}
                      <div className="grid grid-cols-3 gap-3">
                        <div
                          style={{ background: 'rgba(16, 185, 129, 0.12)' }}
                          className={`rounded-2xl border border-emerald-400/30 ${
                            isStory ? 'p-4' : 'p-2.5'
                          }`}
                        >
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 block">
                            {activePersona === 'nomad' ? 'Global Runway' : 'Years Saved'}
                          </span>
                          <span
                            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                            className={`${
                              isStory ? 'text-2xl' : 'text-lg'
                            } font-extrabold text-white font-mono tabular-nums mt-0.5 block`}
                          >
                            {activePersona === 'nomad' ? `${nomadRunwayMonths} Mos` : `+${yearsSaved} Yrs`}
                          </span>
                        </div>

                        <div
                          style={{ background: 'rgba(245, 158, 11, 0.12)' }}
                          className={`rounded-2xl border border-amber-400/30 ${
                            isStory ? 'p-4' : 'p-2.5'
                          }`}
                        >
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 block">
                            {privacyMode ? 'Burn Reduction' : 'Monthly Burn'}
                          </span>
                          <span
                            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                            className={`${
                              isStory ? 'text-2xl' : 'text-lg'
                            } font-extrabold text-amber-200 font-mono tabular-nums mt-0.5 block`}
                          >
                            {privacyMode ? `-${burnSavingsPct}%` : `$${monthlyBurnUSD.toLocaleString()}`}
                          </span>
                        </div>

                        <div
                          style={{ background: 'rgba(255, 255, 255, 0.06)' }}
                          className={`rounded-2xl border border-white/15 ${
                            isStory ? 'p-4' : 'p-2.5'
                          }`}
                        >
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block">
                            {privacyMode
                              ? activePersona === 'nomad'
                                ? 'Fiber Speed'
                                : 'Safe SWR'
                              : 'FIRE Target'}
                          </span>
                          <span
                            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                            className={`${
                              isStory ? 'text-2xl' : 'text-lg'
                            } font-extrabold text-white font-mono tabular-nums mt-0.5 block`}
                          >
                            {privacyMode
                              ? activePersona === 'nomad'
                                ? `${fiberMbps} Mbps`
                                : `${swrPercent.toFixed(1)}%`
                              : `$${Math.round(targetFireNestEggUSD / 1000)}k`}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 3. BOTTOM VIRAL CALL-TO-ACTION FOOTER (Mandatory on every card) */}
                    <div
                      style={{
                        background: 'linear-gradient(135deg, rgba(4, 47, 46, 0.92), rgba(15, 23, 42, 0.95))',
                      }}
                      className={`relative z-10 rounded-2xl border border-amber-400/35 ${
                        isStory ? 'p-5' : 'p-3.5'
                      } flex items-center justify-between gap-4 shadow-lg`}
                    >
                      <p
                        className={`${
                          isStory ? 'text-xs' : 'text-[11px]'
                        } text-slate-100 font-medium leading-snug flex-1`}
                      >
                        {activeHookText}
                      </p>

                      {/* Prominent High-Contrast URL Pill */}
                      <div
                        style={{
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          background: 'linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #10b981 100%)',
                        }}
                        className={`shrink-0 ${
                          isStory ? 'px-4 py-2.5 text-sm' : 'px-3.5 py-2 text-xs'
                        } rounded-full text-slate-950 font-black tracking-tight shadow-md`}
                      >
                        Refirely.com
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
