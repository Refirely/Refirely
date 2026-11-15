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
  Smartphone,
  Square,
  Landmark,
} from 'lucide-react';
import { Persona } from '../types';
import { getWorldCountryFlag, DEFAULT_FINANCIAL_PORTFOLIO } from '../data/userAccounts';
import { CountryFlag } from './CountryFlag';
import { useApp } from '../context/AppContext';
import { calculateUnifiedFireMetrics, getCountryFireFeasibilityList } from '../utils/fireCalculations';

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
  const { userProfile, updateUserProfile, countries } = useApp();
  const cardRef = useRef<HTMLDivElement>(null);

  // 1. Format Switcher: 'story' (9:16 -> 1080x1920) vs 'post' (1:1 -> 1080x1080)
  const [format, setFormat] = useState<'story' | 'post'>('story');

  // 2. Privacy Mode (Checked by default per specification)
  const [privacyMode, setPrivacyMode] = useState<boolean>(true);

  // 3. Featured Country Selector state (defaults to initialData.topCountry or userProfile.targetCountry)
  const [selectedCountry, setSelectedCountry] = useState<string>(() => {
    return initialData?.topCountry || userProfile.targetCountry || 'Portugal';
  });

  const existingPortfolioTotal = useMemo(() => {
    const inv = userProfile.finances?.investments || DEFAULT_FINANCIAL_PORTFOLIO.investments;
    return (inv.savingsUSD || 0) + (inv.stocksMutualFundsUSD || 0) + (inv.realEstateUSD || 0) + (inv.goldUSD || 0) + (inv.othersUSD || 0);
  }, [userProfile.finances]);

  const [modalCorpusUSD, setModalCorpusUSD] = useState<number>(() => {
    return initialData?.currentNetWorthUSD || existingPortfolioTotal || 250000;
  });

  // Sync selectedCountry and modalCorpusUSD when modal opens with new initialData
  useEffect(() => {
    if (isOpen) {
      setSelectedCountry(initialData?.topCountry || userProfile.targetCountry || 'Portugal');
      const currentTotal = (userProfile.finances?.investments?.savingsUSD || 0) +
        (userProfile.finances?.investments?.stocksMutualFundsUSD || 0) +
        (userProfile.finances?.investments?.realEstateUSD || 0) +
        (userProfile.finances?.investments?.goldUSD || 0) +
        (userProfile.finances?.investments?.othersUSD || 0);
      setModalCorpusUSD(initialData?.currentNetWorthUSD || currentTotal || 250000);
    }
  }, [isOpen, initialData?.topCountry, initialData?.currentNetWorthUSD, userProfile.finances, userProfile.targetCountry]);

  // Effective profile for studio calculations incorporating modalCorpusUSD and selectedCountry
  const effectiveProfileForStudio = useMemo(() => {
    const baseFinances = userProfile.finances || DEFAULT_FINANCIAL_PORTFOLIO;
    const currentTotal = (baseFinances.investments?.savingsUSD || 0) +
      (baseFinances.investments?.stocksMutualFundsUSD || 0) +
      (baseFinances.investments?.realEstateUSD || 0) +
      (baseFinances.investments?.goldUSD || 0) +
      (baseFinances.investments?.othersUSD || 0);

    const overrideStock = currentTotal === 0 && modalCorpusUSD > 0
      ? modalCorpusUSD
      : baseFinances.investments?.stocksMutualFundsUSD !== undefined && baseFinances.investments.stocksMutualFundsUSD > 0
      ? baseFinances.investments.stocksMutualFundsUSD
      : modalCorpusUSD;

    return {
      ...userProfile,
      targetCountry: selectedCountry,
      finances: {
        ...baseFinances,
        investments: {
          ...(baseFinances.investments || DEFAULT_FINANCIAL_PORTFOLIO.investments),
          stocksMutualFundsUSD: overrideStock,
        },
      },
    };
  }, [userProfile, selectedCountry, modalCorpusUSD]);

  // Compute live unified FIRE metrics based on effectiveProfileForStudio & selectedCountry
  const unifiedMetrics = useMemo(() => {
    return calculateUnifiedFireMetrics(effectiveProfileForStudio, countries, selectedCountry);
  }, [effectiveProfileForStudio, countries, selectedCountry]);

  const feasibilityList = useMemo(() => {
    return getCountryFireFeasibilityList(effectiveProfileForStudio, countries);
  }, [effectiveProfileForStudio, countries]);

  const handleSaveAndSyncProfile = () => {
    updateUserProfile({
      targetCountry: selectedCountry,
      finances: {
        ...DEFAULT_FINANCIAL_PORTFOLIO,
        ...(userProfile.finances || {}),
        investments: {
          ...(userProfile.finances?.investments || DEFAULT_FINANCIAL_PORTFOLIO.investments),
          stocksMutualFundsUSD: modalCorpusUSD,
        },
      },
    });
    showToast(`✅ Saved & Synced! Corpus ($${Math.round(modalCorpusUSD).toLocaleString()}) & Target Haven (${selectedCountry}) updated across website.`);
  };

  // 4. Active Persona ('retiree' vs 'nomad'), initialized from localStorage or payload
  const [activePersona, setActivePersona] = useState<Persona>(() => {
    if (initialData?.persona) return initialData.persona;
    try {
      const saved = localStorage.getItem('refirely_persona');
      if (saved === 'nomad' || saved === 'retiree') return saved;
    } catch {}
    return 'retiree';
  });

  // 5. Hook Index (0, 1, 2)
  const [hookIndex, setHookIndex] = useState<number>(0);

  // 6. Badge Title & Headline Focus
  const [badgeTitle, setBadgeTitle] = useState<string>(
    initialData?.badgeTitle || unifiedMetrics.recommendedBadgeTitle
  );
  const [badgeEmoji, setBadgeEmoji] = useState<string>(
    initialData?.badgeEmoji || unifiedMetrics.recommendedBadgeEmoji
  );
  const [headlineMode, setHeadlineMode] = useState<'years-saved' | 'fi-percent' | 'nomad-runway'>(
    initialData?.headlineMode || (unifiedMetrics.isCompleteFire ? 'fi-percent' : 'years-saved')
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

      const computed = calculateUnifiedFireMetrics(
        userProfile,
        countries,
        initialData?.topCountry || userProfile.targetCountry || 'Portugal'
      );

      if (initialData?.badgeTitle) {
        setBadgeTitle(initialData.badgeTitle);
        setBadgeEmoji(initialData.badgeEmoji || computed.recommendedBadgeEmoji);
      } else {
        setBadgeTitle(computed.recommendedBadgeTitle);
        setBadgeEmoji(computed.recommendedBadgeEmoji);
      }

      if (initialData?.headlineMode) {
        setHeadlineMode(initialData.headlineMode);
      } else if (computed.isCompleteFire) {
        setHeadlineMode('fi-percent');
      } else if (resolvedPersona === 'nomad') {
        setHeadlineMode('nomad-runway');
      } else {
        setHeadlineMode('years-saved');
      }
    }
  }, [isOpen, initialData, userProfile, countries]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4200);
  };

  // Resolved Live Metrics from unifiedMetrics
  const yearsSaved = unifiedMetrics.yearsSaved;
  const fireProgressPercent = unifiedMetrics.fireProgressPercent;
  const topCountry = unifiedMetrics.targetCountryName;
  const topCountryFlag = unifiedMetrics.targetCountryFlag;
  const topCity = unifiedMetrics.targetCityName;
  const topLocationDisplay =
    topCity && !topCountry.toLowerCase().includes(topCity.toLowerCase())
      ? `${topCity}, ${topCountry}`
      : topCountry;
  const monthlyBurnUSD = unifiedMetrics.monthlyBurnUSD;
  const domesticMonthlyBurnUSD = unifiedMetrics.domesticMonthlyBurnUSD;
  const burnSavingsPct = unifiedMetrics.burnSavingsPct;
  const nomadRunwayMonths = unifiedMetrics.nomadRunwayMonths;
  const targetFireNestEggUSD = unifiedMetrics.targetFireNestEggUSD;
  const swrPercent = unifiedMetrics.swrPercent;
  const fiberMbps = initialData?.fiberMbps || 250;

  // Dynamic Persona-Based Hook Arrays with Country Flag included when referencing a country
  const hooks = useMemo(() => {
    if (activePersona === 'nomad') {
      return [
        `My savings fund ${nomadRunwayMonths} months of living & creating in ${topCountryFlag} ${topCountry}. How long is YOUR global runway? Test it free at:`,
        `Zero Schengen overstays. Full slow-travel freedom in ${topCountryFlag} ${topCountry} & beyond. Plan your multi-stop visa & living route at:`,
        `Trading high rent for fiber internet, sunshine, and lower taxes in ${topCountryFlag} ${topLocationDisplay}. Find your next remote hub at:`,
      ];
    }
    return [
      `My nest egg buys ${yearsSaved} extra years of freedom in ${topCountryFlag} ${topCountry}. How early could YOU retire abroad? Calculate your FIRE roadmap at:`,
      `Same savings. Half the monthly burn in ${topCountryFlag} ${topLocationDisplay}. Zero cubicle stress. Discover where your wealth multiplies at:`,
      `I just unlocked my ${badgeTitle} badge for ${topCountryFlag} ${topCountry} on ReFIREly. See which of 209 global havens matches your FIRE number at:`,
    ];
  }, [
    activePersona,
    yearsSaved,
    nomadRunwayMonths,
    topCountry,
    topCountryFlag,
    topLocationDisplay,
    badgeTitle,
  ]);

  const activeHookText = hooks[hookIndex % hooks.length];

  const handleShuffleHook = () => {
    setHookIndex(prev => (prev + 1) % hooks.length);
  };

  // Hero Headline based on headlineMode (includes country flag when specific country is highlighted)
  const heroHeadline = useMemo(() => {
    if (headlineMode === 'nomad-runway') {
      return `${nomadRunwayMonths} Months of Global Freedom in ${topCountryFlag} ${topCountry}`;
    }
    if (headlineMode === 'fi-percent') {
      return fireProgressPercent >= 100
        ? `100% Financially Independent in ${topCountryFlag} ${topCountry}`
        : `${fireProgressPercent}% to Financial Independence in ${topCountryFlag} ${topCountry}`;
    }
    return `Retiring ${yearsSaved} ${yearsSaved === 1 ? 'Year' : 'Years'} Earlier in ${topCountryFlag} ${topCountry}`;
  }, [headlineMode, nomadRunwayMonths, topCountry, topCountryFlag, fireProgressPercent, yearsSaved]);

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
        backgroundColor: '#f8fafc',
      });
    } catch {
      // Fallback with skipFonts: true if browser extension or CORS blocks external font rules
      return await htmlToImage.toPng(cardRef.current, {
        pixelRatio: 2,
        cacheBust: true,
        skipFonts: true,
        width: baseWidth,
        height: baseHeight,
        backgroundColor: '#f8fafc',
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
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/45 backdrop-blur-md overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          onClick={e => e.stopPropagation()}
          className="relative w-full max-w-5xl rounded-3xl bg-gradient-to-br from-indigo-50/95 via-white to-rose-50/95 border border-indigo-200/90 text-slate-900 shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col"
        >
          {/* Top Multi-Color Accent Gradient Bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500 shrink-0" />

          {/* Modal Header */}
          <div className="px-5 sm:px-7 py-4 border-b border-indigo-100 bg-white/80 backdrop-blur-md flex items-center justify-between gap-4 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-rose-500 flex items-center justify-center text-white font-black shadow-md shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2
                    className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900 truncate"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    Shareable FIRE Badge &amp; Freedom Card Studio
                  </h2>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-[11px] font-bold text-indigo-800">
                    <CountryFlag
                      countryName={topCountry}
                      fallbackEmoji={topCountryFlag}
                      size="xs"
                      className="rounded-xs"
                    />
                    <span>{topLocationDisplay}</span>
                  </span>
                  <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    {fireProgressPercent}% FI ({unifiedMetrics.uncappedFireProgressPct}% Funded) · Live Sync
                  </span>
                </div>
                <p className="text-xs text-slate-600 truncate">
                  Live synced with your User Dashboard &amp; 5-scheme investments. Switch country or toggle Real Estate/Gold instantly.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200/80 transition-colors cursor-pointer shrink-0"
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
                className="mx-5 sm:mx-7 mt-3 px-4 py-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-bold flex items-center gap-2 shrink-0 shadow-xs"
              >
                <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>{toastMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Body: Left Controls + Right Live High-Res Card Preview */}
          <div className="p-5 sm:p-7 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN: Controls & Customization */}
            <div className="lg:col-span-6 space-y-4">
              {/* 1. Featured Country Selector & Asset Toggles */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/60 border border-indigo-200/90 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-950 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Featured Country &amp; Corpus Settings</span>
                  </span>
                  <span className="text-[11px] font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                    Corpus: ${Math.round(unifiedMetrics.effectiveFireCorpusUSD / 1000).toLocaleString()}k
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-extrabold uppercase text-slate-600 block mb-1">
                      Target Haven Country
                    </label>
                    <select
                      value={selectedCountry}
                      onChange={e => setSelectedCountry(e.target.value)}
                      className="w-full px-2.5 py-2 text-xs font-bold border border-indigo-200 rounded-xl bg-white text-indigo-950 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    >
                      {!countries.some(c => c.name.toLowerCase() === selectedCountry.toLowerCase()) && selectedCountry && (
                        <option value={selectedCountry}>🌍 {selectedCountry}</option>
                      )}
                      {countries.map(c => {
                        const feat = feasibilityList.achieved.find(item => item.country.id === c.id) ||
                          feasibilityList.close.find(item => item.country.id === c.id) ||
                          feasibilityList.far.find(item => item.country.id === c.id);
                        const pct = feat ? feat.fundedPercent : 0;
                        const statusBadge = pct >= 100 ? `🟢 Achieved (${pct}%)` : pct >= 70 ? `🟡 Close (${pct}%)` : `🔴 Far (${pct}%)`;
                        return (
                          <option key={`studio-country-${c.id}`} value={c.name}>
                            {c.flag} {c.name} (${c.costOfLiving.monthlyBudgetSingleUSD.toLocaleString()}/mo) · {statusBadge}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold uppercase text-slate-600 block mb-1">
                      FIRE Asset Inclusions
                    </label>
                    <div className="flex items-center gap-2 pt-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          const nextHome = !(userProfile.finances?.includePrimaryHomeInFire ?? true);
                          updateUserProfile({
                            finances: {
                              ...DEFAULT_FINANCIAL_PORTFOLIO,
                              ...(userProfile.finances || {}),
                              includePrimaryHomeInFire: nextHome,
                            },
                          });
                        }}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer whitespace-nowrap ${
                          (userProfile.finances?.includePrimaryHomeInFire ?? true)
                            ? 'bg-indigo-100 text-indigo-950 border-indigo-300'
                            : 'bg-white text-slate-500 border-slate-200'
                        }`}
                      >
                        {(userProfile.finances?.includePrimaryHomeInFire ?? true) ? '✓ Real Estate' : 'RE Excluded'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const nextGold = !(userProfile.finances?.includeGoldInFire ?? true);
                          updateUserProfile({
                            finances: {
                              ...DEFAULT_FINANCIAL_PORTFOLIO,
                              ...(userProfile.finances || {}),
                              includeGoldInFire: nextGold,
                            },
                          });
                        }}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer whitespace-nowrap ${
                          (userProfile.finances?.includeGoldInFire ?? true)
                            ? 'bg-amber-100 text-amber-950 border-amber-300'
                            : 'bg-white text-slate-500 border-slate-200'
                        }`}
                      >
                        {(userProfile.finances?.includeGoldInFire ?? true) ? '✓ Gold' : 'Gold Excluded'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>



              {/* 2. Format Switcher Tabs */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold uppercase tracking-wider text-indigo-950 block">
                  Card Aspect Ratio &amp; Export Resolution
                </label>
                <div className="grid grid-cols-2 gap-2.5 p-1.5 rounded-2xl bg-indigo-50/70 border border-indigo-200/80">
                  <button
                    type="button"
                    onClick={() => setFormat('story')}
                    className={`py-2.5 px-3.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap ${
                      format === 'story'
                        ? 'bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-indigo-950 hover:bg-white/80'
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
                        ? 'bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-indigo-950 hover:bg-white/80'
                    }`}
                  >
                    <Square className="w-4 h-4 shrink-0" />
                    <span>Social Post (1:1)</span>
                  </button>
                </div>
              </div>

              {/* 3. Privacy Mode Checkbox (Checked by Default) */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-50/90 via-indigo-50/60 to-violet-50/80 border border-sky-200/90 space-y-1.5 shadow-2xs">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={privacyMode}
                    onChange={e => setPrivacyMode(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded accent-indigo-600 cursor-pointer shrink-0"
                  />
                  <div className="space-y-1">
                    <span className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>
                        Privacy Mode (Hide exact dollar balances — show Years Saved &amp; % Progress only)
                      </span>
                    </span>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {privacyMode
                        ? 'Active: Your exact portfolio & monthly burn dollar amounts are hidden. Only percentages, target haven, and years saved are shown.'
                        : 'Unlocked: Displaying exact monthly living burn ($/mo) and portfolio targets on the card.'}
                    </p>
                  </div>
                </label>
              </div>

              {/* 4. Persona & Viewer Call-to-Action Hook Shuffler */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50/70 via-white to-rose-50/70 border border-purple-200/80 space-y-3 shadow-2xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-purple-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    <span>Persona &amp; Viral Call-to-Action Hook</span>
                  </span>

                  {/* Persona Switcher */}
                  <div className="inline-flex p-0.5 rounded-xl bg-purple-100/80 border border-purple-200 text-[11px]">
                    <button
                      type="button"
                      onClick={() => {
                        setActivePersona('retiree');
                        setHookIndex(0);
                        setHeadlineMode('years-saved');
                      }}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer whitespace-nowrap ${
                        activePersona === 'retiree'
                          ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-indigo-950'
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
                          ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-rose-950'
                      }`}
                    >
                      ⚡ Nomad
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white border border-purple-200/80 text-xs text-slate-700 leading-relaxed italic shadow-2xs">
                  &ldquo;{activeHookText}&rdquo;{' '}
                  <strong className="text-indigo-700 not-italic font-extrabold">Refirely.com</strong>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-[11px] text-slate-500 font-mono">
                    Hook {(hookIndex % hooks.length) + 1} of {hooks.length} (
                    {activePersona === 'nomad' ? 'Nomad' : 'Retiree'} Pack)
                  </span>
                  <button
                    type="button"
                    onClick={handleShuffleHook}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-50 via-purple-50 to-rose-50 hover:from-indigo-100 hover:to-rose-100 border border-indigo-200 text-indigo-900 text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-2xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
                    <span>🔄 Shuffle Hook</span>
                  </button>
                </div>
              </div>

              {/* 5. Milestone Badge & Hero Headline Selector */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/60 via-white to-sky-50/60 border border-indigo-200/80 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-indigo-950 block">
                    Featured Milestone Badge &amp; Hero Stat
                  </label>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700">
                    <CountryFlag
                      countryName={topCountry}
                      fallbackEmoji={topCountryFlag}
                      size="xs"
                      className="rounded-xs"
                    />
                    <span>{topCountry}</span>
                  </span>
                </div>

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
                            ? 'bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:text-indigo-900'
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
                        ? 'bg-indigo-100/90 border-indigo-400 text-indigo-950'
                        : 'bg-white border-slate-200 text-slate-600 hover:text-indigo-900'
                    }`}
                  >
                    Headline: {yearsSaved} Yrs Saved
                  </button>
                  <button
                    type="button"
                    onClick={() => setHeadlineMode('fi-percent')}
                    className={`py-1.5 px-2.5 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer whitespace-nowrap ${
                      headlineMode === 'fi-percent'
                        ? 'bg-purple-100/90 border-purple-400 text-purple-950'
                        : 'bg-white border-slate-200 text-slate-600 hover:text-purple-900'
                    }`}
                  >
                    Headline: {fireProgressPercent}% to FI
                  </button>
                  <button
                    type="button"
                    onClick={() => setHeadlineMode('nomad-runway')}
                    className={`py-1.5 px-2.5 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer whitespace-nowrap ${
                      headlineMode === 'nomad-runway'
                        ? 'bg-rose-100/90 border-rose-400 text-rose-950'
                        : 'bg-white border-slate-200 text-slate-600 hover:text-rose-900'
                    }`}
                  >
                    Headline: {nomadRunwayMonths}m Runway
                  </button>
                </div>
              </div>

              {/* 6. Export & Native Mobile Share Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  disabled={isExporting}
                  onClick={handleDownloadPng}
                  className="py-3.5 px-5 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black text-xs sm:text-sm shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 whitespace-nowrap"
                >
                  <Download className="w-4 h-4 text-white shrink-0" />
                  <span>{isExporting ? 'Rendering 2x PNG...' : '⬇️ Download Image (PNG)'}</span>
                </button>

                <button
                  type="button"
                  disabled={isExporting}
                  onClick={handleShareToSocial}
                  className="py-3.5 px-5 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white font-black text-xs sm:text-sm shadow-md shadow-rose-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 whitespace-nowrap"
                >
                  <Share2 className="w-4 h-4 text-white shrink-0" />
                  <span>📤 Share to Social</span>
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN: Live Scaled Card Preview (1080x1920 or 1080x1080 at 2x pixelRatio) */}
            <div className="lg:col-span-6 flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50/70 via-white to-rose-50/70 rounded-3xl border border-indigo-200/80 p-4 sm:p-6 min-h-[420px] shadow-inner">
              <div className="text-[11px] font-mono text-slate-600 mb-3 flex flex-wrap items-center justify-center gap-2">
                <span>
                  Live Preview ({isStory ? 'Instagram Story 9:16 · 1080×1920' : 'Social Post 1:1 · 1080×1080'})
                </span>
                <span>·</span>
                <span className="text-emerald-700 font-bold">
                  {fireProgressPercent}% FI ({unifiedMetrics.uncappedFireProgressPct}% Funded)
                </span>
                <span>·</span>
                <span className="text-indigo-700 font-bold">
                  {privacyMode ? '🔒 Privacy Mode ON' : '🔓 Dollar Figures Visible'}
                </span>
              </div>

              {/* Outer wrapper sized to the scaled preview dimensions */}
              <div
                style={{
                  width: `${Math.round(baseWidth * previewScale)}px`,
                  height: `${Math.round(baseHeight * previewScale)}px`,
                }}
                className="relative flex items-start justify-start overflow-hidden rounded-2xl shadow-xl ring-1 ring-indigo-200/90"
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
                  {/* Luminous Multi-Colored Light Theme with Country Flag Integration   */}
                  {/* ================================================================= */}
                  <div
                    ref={cardRef}
                    style={{
                      width: `${baseWidth}px`,
                      height: `${baseHeight}px`,
                      fontFamily: "'Inter', sans-serif",
                      background:
                        'radial-gradient(circle at 14% 14%, rgba(99, 102, 241, 0.18) 0%, transparent 44%), radial-gradient(circle at 88% 18%, rgba(236, 72, 153, 0.16) 0%, transparent 45%), radial-gradient(circle at 82% 84%, rgba(14, 165, 233, 0.18) 0%, transparent 48%), linear-gradient(145deg, #eef2ff 0%, #ffffff 48%, #fdf2f8 100%)',
                    }}
                    className={`relative overflow-hidden text-slate-900 flex flex-col justify-between ${
                      isStory ? 'p-11' : 'p-7'
                    }`}
                  >
                    {/* Subtle Multi-Color Rim Frame */}
                    <div
                      className="pointer-events-none absolute inset-3 rounded-3xl border border-indigo-200/80"
                      style={{
                        boxShadow: 'inset 0 0 50px rgba(99, 102, 241, 0.06)',
                      }}
                    />

                    {/* 1. TOP HEADER: Local ReFIREly Logo Asset + Dynamic Milestone Pill */}
                    <div className="relative z-10 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src="/assets/aistudio/refirely-icon.png"
                          alt="ReFIREly Logo"
                          crossOrigin="anonymous"
                          className={`${
                            isStory ? 'w-12 h-12' : 'w-10 h-10'
                          } rounded-2xl object-contain bg-white p-1 border border-indigo-200 shadow-sm`}
                        />
                        <div>
                          <div
                            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                            className={`${
                              isStory ? 'text-2xl' : 'text-xl'
                            } font-extrabold tracking-tight leading-none flex items-center`}
                          >
                            <span className="text-slate-900">Re</span>
                            <span className="text-indigo-600">FIRE</span>
                            <span className="text-rose-500">ly</span>
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-700/80 block mt-0.5">
                            Global Freedom &amp; Geoarbitrage
                          </span>
                        </div>
                      </div>

                      {/* Dynamic Milestone Pill Badge */}
                      <div
                        style={{
                          background: 'linear-gradient(135deg, #eef2ff 0%, #f3e8ff 50%, #ffe4e6 100%)',
                        }}
                        className="px-3.5 py-1.5 rounded-full border border-indigo-300/80 text-indigo-950 text-xs font-extrabold tracking-wider uppercase shadow-xs"
                      >
                        {badgeEmoji} {badgeTitle.toUpperCase()}
                      </div>
                    </div>

                    {/* 2. CENTER HERO METRIC */}
                    <div className={`relative z-10 ${isStory ? 'space-y-6 my-auto' : 'space-y-3.5 my-auto'}`}>
                      {/* Eyebrow Kicker + Country Flag Haven Pill */}
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-indigo-200 text-[11px] font-extrabold uppercase tracking-wider text-indigo-700 shadow-2xs">
                          <Flame className="w-3.5 h-3.5 text-rose-500" />
                          <span>
                            {activePersona === 'nomad'
                              ? 'Verified Digital Nomad Runway'
                              : fireProgressPercent >= 100
                              ? '100% Complete FIRE Achieved'
                              : 'Verified Geoarbitrage FIRE Roadmap'}
                          </span>
                        </div>

                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-50 via-purple-50 to-rose-50 border border-purple-200 text-[11px] font-extrabold text-purple-950 shadow-2xs">
                          <span>{topCountryFlag}</span>
                          <span>{topLocationDisplay}</span>
                        </div>
                      </div>

                      {/* Bold Hero Achievement Headline */}
                      <h1
                        style={{
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          lineHeight: 1.12,
                        }}
                        className={`${
                          isStory ? 'text-4xl' : 'text-2xl'
                        } font-extrabold tracking-tight text-slate-900`}
                      >
                        {heroHeadline}
                      </h1>

                      {/* Visual Progress Bar Card */}
                      <div
                        style={{
                          background: 'rgba(255, 255, 255, 0.9)',
                        }}
                        className={`rounded-2xl border border-indigo-200/90 shadow-sm ${
                          isStory ? 'p-5 space-y-3.5' : 'p-3.5 space-y-2'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-indigo-900 uppercase tracking-wider">
                            {activePersona === 'nomad'
                              ? 'Global Freedom Runway Index'
                              : fireProgressPercent >= 100
                              ? '100% FI Sovereign Progress'
                              : 'Financial Independence Progress'}
                          </span>
                          <span className="font-mono text-base font-extrabold text-purple-700 tabular-nums">
                            {activePersona === 'nomad'
                              ? `${nomadRunwayMonths} Months (${(nomadRunwayMonths / 12).toFixed(1)} Yrs)`
                              : fireProgressPercent >= 100
                              ? `🔥 100% FI (${unifiedMetrics.uncappedFireProgressPct}% Funded)`
                              : `${fireProgressPercent}% to FI`}
                          </span>
                        </div>

                        {/* Progress Track */}
                        <div className="w-full h-3.5 rounded-full bg-indigo-100/90 overflow-hidden p-0.5 border border-indigo-200/70">
                          <div
                            style={{
                              width: `${
                                activePersona === 'nomad'
                                  ? Math.min(100, Math.round((nomadRunwayMonths / 24) * 100))
                                  : Math.min(100, fireProgressPercent)
                              }%`,
                              background:
                                'linear-gradient(90deg, #4f46e5 0%, #9333ea 52%, #ec4899 100%)',
                            }}
                            className="h-full rounded-full"
                          />
                        </div>

                        {/* Target Haven Highlight with Country Flag */}
                        <div className="pt-1 flex items-center justify-between text-xs text-slate-700">
                          <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                            <Globe className="w-3.5 h-3.5 text-indigo-600" />
                            <span>
                              Target Haven:{' '}
                              <strong className="text-indigo-950 font-extrabold">
                                {topCountryFlag} {topLocationDisplay}
                              </strong>
                              {privacyMode
                                ? ` • ${burnSavingsPct}% Lower Burn vs. Home`
                                : ` • Est. Monthly Burn: $${monthlyBurnUSD.toLocaleString()}`}
                            </span>
                          </span>
                        </div>
                      </div>

                      {/* Supporting Multi-Colored Pastel KPI Grid (Adapts to Privacy Mode) */}
                      <div className="grid grid-cols-3 gap-3">
                        <div
                          style={{
                            background: 'linear-gradient(135deg, #eef2ff 0%, #f5f3ff 100%)',
                          }}
                          className={`rounded-2xl border border-indigo-200/90 shadow-2xs ${
                            isStory ? 'p-4' : 'p-2.5'
                          }`}
                        >
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 block">
                            {activePersona === 'nomad' ? 'Global Runway' : 'Years Saved'}
                          </span>
                          <span
                            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                            className={`${
                              isStory ? 'text-2xl' : 'text-lg'
                            } font-extrabold text-indigo-950 font-mono tabular-nums mt-0.5 block`}
                          >
                            {activePersona === 'nomad'
                              ? `${nomadRunwayMonths} Mos`
                              : `+${yearsSaved} Yrs`}
                          </span>
                        </div>

                        <div
                          style={{
                            background: 'linear-gradient(135deg, #fff1f2 0%, #fdf2f8 100%)',
                          }}
                          className={`rounded-2xl border border-rose-200/90 shadow-2xs ${
                            isStory ? 'p-4' : 'p-2.5'
                          }`}
                        >
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-700 block">
                            {privacyMode ? 'Burn Reduction' : 'Monthly Burn'}
                          </span>
                          <span
                            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                            className={`${
                              isStory ? 'text-2xl' : 'text-lg'
                            } font-extrabold text-rose-950 font-mono tabular-nums mt-0.5 block`}
                          >
                            {privacyMode
                              ? `-${burnSavingsPct}%`
                              : `$${monthlyBurnUSD.toLocaleString()}`}
                          </span>
                        </div>

                        <div
                          style={{
                            background: 'linear-gradient(135deg, #f0f9ff 0%, #ecfeff 100%)',
                          }}
                          className={`rounded-2xl border border-sky-200/90 shadow-2xs ${
                            isStory ? 'p-4' : 'p-2.5'
                          }`}
                        >
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-700 block">
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
                            } font-extrabold text-sky-950 font-mono tabular-nums mt-0.5 block`}
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
                        background:
                          'linear-gradient(135deg, rgba(238, 242, 255, 0.95) 0%, rgba(250, 245, 255, 0.95) 50%, rgba(255, 241, 242, 0.95) 100%)',
                      }}
                      className={`relative z-10 rounded-2xl border border-indigo-300/90 ${
                        isStory ? 'p-5' : 'p-3.5'
                      } flex items-center justify-between gap-4 shadow-sm`}
                    >
                      <p
                        className={`${
                          isStory ? 'text-xs' : 'text-[11px]'
                        } text-slate-800 font-semibold leading-snug flex-1`}
                      >
                        {activeHookText}
                      </p>

                      {/* Prominent High-Contrast Multi-Color URL Pill */}
                      <div
                        style={{
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          background: 'linear-gradient(90deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%)',
                        }}
                        className={`shrink-0 ${
                          isStory ? 'px-4 py-2.5 text-sm' : 'px-3.5 py-2 text-xs'
                        } rounded-full text-white font-black tracking-tight shadow-sm`}
                      >
                        Refirely.com
                      </div>
                    </div>
                  </div>

                  {/* Editable Corpus / Investable Assets Input + Save Button */}
                  <div className="pt-3 border-t border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="w-full sm:w-auto flex-1">
                      <label className="text-[10px] font-extrabold uppercase text-slate-600 block mb-1">
                        Total Investable Assets / FIRE Corpus (USD $)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-xs font-bold text-slate-500">$</span>
                        <input
                          type="number"
                          min="0"
                          step="5000"
                          value={modalCorpusUSD}
                          onChange={e => setModalCorpusUSD(Number(e.target.value) || 0)}
                          className="w-full pl-7 pr-3 py-1.5 text-xs font-bold font-mono border border-indigo-200 rounded-xl bg-white text-indigo-950 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                    <div className="w-full sm:w-auto pt-1 sm:pt-4">
                      <button
                        type="button"
                        onClick={handleSaveAndSyncProfile}
                        className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-700 hover:to-indigo-700 text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                      >
                        <span>💾 Save &amp; Update Profile</span>
                      </button>
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
