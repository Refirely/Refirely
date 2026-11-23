import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Check,
  Lock,
  TrendingUp,
  Globe,
  Stamp,
  Flame,
  RotateCcw,
  Users,
  User,
  Briefcase,
  Palmtree,
  Sunrise,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ExternalLink,
  Award,
  LineChart,
  Wallet,
  HeartPulse,
  ShieldCheck,
  Coins,
  FileBadge,
  Wifi,
  Coffee,
  Plane,
  Sun,
  Heart,
  BadgeDollarSign,
  Waves,
  Mountain,
  CloudSun,
  type LucideIcon,
} from 'lucide-react';
import { useApp, type AppView } from '../context/AppContext';
import { CountryFlag } from './CountryFlag';
import {
  DEFAULT_FREEDOM_QUIZ_STATE,
  FREEDOM_PRIORITY_OPTIONS,
  FREEDOM_QUIZ_UPDATED_EVENT,
  FreedomEscapePlan,
  FreedomPriorityId,
  FreedomQuizState,
  computeFreedomMapResults,
  loadFreedomQuizState,
  markPendingFreedomQuizHydration,
  normalizeFreedomQuizState,
  pickNewestFreedomQuizState,
} from '../utils/freedomMapQuiz';

interface FreedomMapHeroQuizProps {
  onScrollTo: (sectionId: string) => void;
  onNavigateView: (view: AppView) => void;
  onOpenExplorer: () => void;
}

const NEST_EGG_PRESETS: Array<{
  label: string;
  sub: string;
  value: number;
  activeGrad: string;
  idleStyle: string;
  subColor: string;
}> = [
  {
    label: '$25k',
    sub: 'Starter',
    value: 25000,
    activeGrad: 'from-teal-600 to-emerald-600 text-white border-teal-500 shadow-md shadow-teal-600/20',
    idleStyle: 'bg-white/95 hover:bg-teal-50/90 text-slate-900 border-teal-200/85',
    subColor: 'text-teal-700',
  },
  {
    label: '$100k',
    sub: 'Builder',
    value: 100000,
    activeGrad: 'from-sky-600 to-blue-600 text-white border-sky-500 shadow-md shadow-sky-600/20',
    idleStyle: 'bg-white/95 hover:bg-sky-50/90 text-slate-900 border-sky-200/85',
    subColor: 'text-sky-700',
  },
  {
    label: '$250k',
    sub: 'Coast Ready',
    value: 250000,
    activeGrad: 'from-indigo-600 to-violet-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20',
    idleStyle: 'bg-white/95 hover:bg-indigo-50/90 text-slate-900 border-indigo-200/85',
    subColor: 'text-indigo-700',
  },
  {
    label: '$500k',
    sub: 'Geo-FIRE',
    value: 500000,
    activeGrad: 'from-purple-600 to-fuchsia-600 text-white border-purple-500 shadow-md shadow-purple-600/20',
    idleStyle: 'bg-white/95 hover:bg-purple-50/90 text-slate-900 border-purple-200/85',
    subColor: 'text-purple-700',
  },
  {
    label: '$1M+',
    sub: 'Fat / Full FIRE',
    value: 1000000,
    activeGrad: 'from-amber-500 to-orange-600 text-white border-amber-500 shadow-md shadow-orange-600/20',
    idleStyle: 'bg-white/95 hover:bg-amber-50/90 text-slate-900 border-amber-200/85',
    subColor: 'text-amber-700',
  },
];

const ESCAPE_PLAN_OPTIONS: Array<{
  id: FreedomEscapePlan;
  title: string;
  subtitle: string;
  badge: string;
  icon: LucideIcon;
  activeGrad: string;
  idleStyle: string;
  iconBgIdle: string;
  badgeColorIdle: string;
}> = [
  {
    id: 'full_fire',
    title: 'Full FIRE / Passive Income',
    subtitle: 'Living off investments, dividends, or pensions',
    badge: 'Retirement & Passive Visas',
    icon: Sunrise,
    activeGrad: 'from-emerald-600 to-teal-600 text-white border-emerald-500 shadow-lg shadow-emerald-600/25',
    idleStyle: 'bg-gradient-to-br from-white via-white to-emerald-50/60 hover:to-emerald-100/70 text-slate-900 border-emerald-200/90',
    iconBgIdle: 'bg-emerald-100/90 text-emerald-700',
    badgeColorIdle: 'text-emerald-700 bg-emerald-50 border-emerald-200/80',
  },
  {
    id: 'coast_fire',
    title: 'Coast FIRE / Remote Work',
    subtitle: 'Earning location-independent income while investments grow',
    badge: 'Digital Nomad Visas',
    icon: Briefcase,
    activeGrad: 'from-indigo-600 to-violet-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/25',
    idleStyle: 'bg-gradient-to-br from-white via-white to-indigo-50/60 hover:to-indigo-100/70 text-slate-900 border-indigo-200/90',
    iconBgIdle: 'bg-indigo-100/90 text-indigo-700',
    badgeColorIdle: 'text-indigo-700 bg-indigo-50 border-indigo-200/80',
  },
  {
    id: 'mini_retirement',
    title: 'Mini-Retirement / Sabbatical',
    subtitle: 'Taking 1–3 years off to travel and reset',
    badge: 'Long-Stay & Flexible Paths',
    icon: Palmtree,
    activeGrad: 'from-amber-500 to-orange-600 text-white border-amber-500 shadow-lg shadow-orange-600/25',
    idleStyle: 'bg-gradient-to-br from-white via-white to-amber-50/65 hover:to-amber-100/70 text-slate-900 border-amber-200/90',
    iconBgIdle: 'bg-amber-100/90 text-amber-700',
    badgeColorIdle: 'text-amber-800 bg-amber-50 border-amber-200/80',
  },
];

interface PriorityVisualStyle {
  icon: LucideIcon;
  activeGrad: string;
  idleStyle: string;
  iconBoxIdle: string;
}

const PRIORITY_CARD_STYLES: Record<FreedomPriorityId, PriorityVisualStyle> = {
  // Core & Financial
  'budget-asc': {
    icon: Wallet,
    activeGrad: 'from-emerald-600 to-teal-600 text-white border-emerald-500 shadow-md shadow-emerald-600/20',
    idleStyle: 'bg-white/95 hover:bg-emerald-50/90 text-slate-900 border-emerald-200/85',
    iconBoxIdle: 'bg-emerald-50 text-emerald-600',
  },
  'nomad-burn-asc': {
    icon: Flame,
    activeGrad: 'from-orange-500 to-amber-600 text-white border-orange-500 shadow-md shadow-orange-600/20',
    idleStyle: 'bg-white/95 hover:bg-orange-50/90 text-slate-900 border-orange-200/85',
    iconBoxIdle: 'bg-orange-50 text-orange-600',
  },
  'healthcare-desc': {
    icon: HeartPulse,
    activeGrad: 'from-rose-600 to-pink-600 text-white border-rose-500 shadow-md shadow-rose-600/20',
    idleStyle: 'bg-white/95 hover:bg-rose-50/90 text-slate-900 border-rose-200/85',
    iconBoxIdle: 'bg-rose-50 text-rose-600',
  },
  'safety-desc': {
    icon: ShieldCheck,
    activeGrad: 'from-indigo-600 to-blue-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20',
    idleStyle: 'bg-white/95 hover:bg-indigo-50/90 text-slate-900 border-indigo-200/85',
    iconBoxIdle: 'bg-indigo-50 text-indigo-600',
  },
  'visa-difficulty-asc': {
    icon: Stamp,
    activeGrad: 'from-teal-600 to-cyan-600 text-white border-teal-500 shadow-md shadow-teal-600/20',
    idleStyle: 'bg-white/95 hover:bg-teal-50/90 text-slate-900 border-teal-200/85',
    iconBoxIdle: 'bg-teal-50 text-teal-600',
  },
  'visa-income-asc': {
    icon: Coins,
    activeGrad: 'from-amber-500 to-orange-500 text-white border-amber-500 shadow-md shadow-amber-600/20',
    idleStyle: 'bg-white/95 hover:bg-amber-50/90 text-slate-900 border-amber-200/85',
    iconBoxIdle: 'bg-amber-50 text-amber-600',
  },

  // Lifestyle & Nomad
  'dnv-friendly': {
    icon: FileBadge,
    activeGrad: 'from-indigo-600 to-violet-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20',
    idleStyle: 'bg-white/95 hover:bg-violet-50/90 text-slate-900 border-violet-200/85',
    iconBoxIdle: 'bg-violet-50 text-violet-600',
  },
  'internet-speed-desc': {
    icon: Wifi,
    activeGrad: 'from-cyan-600 to-teal-600 text-white border-cyan-500 shadow-md shadow-cyan-600/20',
    idleStyle: 'bg-white/95 hover:bg-cyan-50/90 text-slate-900 border-cyan-200/85',
    iconBoxIdle: 'bg-cyan-50 text-cyan-600',
  },
  'coworking-friendly': {
    icon: Coffee,
    activeGrad: 'from-amber-500 to-orange-600 text-white border-amber-500 shadow-md shadow-orange-600/20',
    idleStyle: 'bg-white/95 hover:bg-amber-50/90 text-slate-900 border-amber-200/85',
    iconBoxIdle: 'bg-amber-50 text-amber-600',
  },
  'travel-leisure-desc': {
    icon: Plane,
    activeGrad: 'from-sky-600 to-blue-600 text-white border-sky-500 shadow-md shadow-sky-600/20',
    idleStyle: 'bg-white/95 hover:bg-sky-50/90 text-slate-900 border-sky-200/85',
    iconBoxIdle: 'bg-sky-50 text-sky-600',
  },
  'sunny-desc': {
    icon: Sun,
    activeGrad: 'from-orange-500 to-rose-500 text-white border-orange-500 shadow-md shadow-orange-600/20',
    idleStyle: 'bg-white/95 hover:bg-orange-50/90 text-slate-900 border-orange-200/85',
    iconBoxIdle: 'bg-orange-50 text-orange-600',
  },
  'dating-nightlife-desc': {
    icon: Heart,
    activeGrad: 'from-pink-600 to-rose-600 text-white border-pink-500 shadow-md shadow-pink-600/20',
    idleStyle: 'bg-white/95 hover:bg-pink-50/90 text-slate-900 border-pink-200/85',
    iconBoxIdle: 'bg-pink-50 text-pink-600',
  },
  'female-ratio-desc': {
    icon: Users,
    activeGrad: 'from-fuchsia-600 to-purple-600 text-white border-fuchsia-500 shadow-md shadow-fuchsia-600/20',
    idleStyle: 'bg-white/95 hover:bg-fuchsia-50/90 text-slate-900 border-fuchsia-200/85',
    iconBoxIdle: 'bg-fuchsia-50 text-fuchsia-600',
  },

  // Climate & Tax
  'zero-tax': {
    icon: BadgeDollarSign,
    activeGrad: 'from-emerald-600 to-green-600 text-white border-emerald-500 shadow-md shadow-emerald-600/20',
    idleStyle: 'bg-white/95 hover:bg-emerald-50/90 text-slate-900 border-emerald-200/85',
    iconBoxIdle: 'bg-emerald-50 text-emerald-600',
  },
  'climate-mediterranean': {
    icon: Waves,
    activeGrad: 'from-blue-600 to-cyan-600 text-white border-blue-500 shadow-md shadow-blue-600/20',
    idleStyle: 'bg-white/95 hover:bg-blue-50/90 text-slate-900 border-blue-200/85',
    iconBoxIdle: 'bg-blue-50 text-blue-600',
  },
  'climate-tropical': {
    icon: Palmtree,
    activeGrad: 'from-teal-600 to-emerald-600 text-white border-teal-500 shadow-md shadow-teal-600/20',
    idleStyle: 'bg-white/95 hover:bg-teal-50/90 text-slate-900 border-teal-200/85',
    iconBoxIdle: 'bg-teal-50 text-teal-600',
  },
  'climate-highlands': {
    icon: Mountain,
    activeGrad: 'from-violet-600 to-indigo-600 text-white border-violet-500 shadow-md shadow-violet-600/20',
    idleStyle: 'bg-white/95 hover:bg-violet-50/90 text-slate-900 border-violet-200/85',
    iconBoxIdle: 'bg-violet-50 text-violet-600',
  },
  'climate-temperate': {
    icon: CloudSun,
    activeGrad: 'from-sky-600 to-indigo-600 text-white border-sky-500 shadow-md shadow-sky-600/20',
    idleStyle: 'bg-white/95 hover:bg-sky-50/90 text-slate-900 border-sky-200/85',
    iconBoxIdle: 'bg-sky-50 text-sky-600',
  },
};

const GROUP_STYLES: Record<
  'Core & Financial' | 'Lifestyle & Nomad' | 'Climate & Tax',
  { container: string; headerText: string; badgeBg: string; dotColor: string }
> = {
  'Core & Financial': {
    container: 'bg-gradient-to-br from-emerald-50/55 via-white to-indigo-50/45 border-emerald-200/75',
    headerText: 'text-emerald-800',
    badgeBg: 'bg-emerald-100/80 text-emerald-800',
    dotColor: 'bg-emerald-500',
  },
  'Lifestyle & Nomad': {
    container: 'bg-gradient-to-br from-indigo-50/55 via-white to-rose-50/45 border-indigo-200/75',
    headerText: 'text-indigo-800',
    badgeBg: 'bg-indigo-100/80 text-indigo-800',
    dotColor: 'bg-indigo-500',
  },
  'Climate & Tax': {
    container: 'bg-gradient-to-br from-amber-50/60 via-white to-teal-50/45 border-amber-200/75',
    headerText: 'text-amber-800',
    badgeBg: 'bg-amber-100/80 text-amber-900',
    dotColor: 'bg-amber-500',
  },
};

const STEP_PROGRESS: Record<1 | 2 | 3 | 4, number> = {
  1: 20,
  2: 45,
  3: 70,
  4: 90,
};

const STEP_META: Record<
  1 | 2 | 3 | 4,
  {
    label: string;
    short: string;
    activePill: string;
    activeNum: string;
    donePill: string;
  }
> = {
  1: {
    label: 'Your Nest Egg',
    short: 'Savings',
    activePill: 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-indigo-500 shadow-sm shadow-indigo-500/20',
    activeNum: 'bg-white/25 text-white',
    donePill: 'bg-indigo-50 text-indigo-800 border-indigo-200/80 hover:bg-indigo-100/80',
  },
  2: {
    label: 'Your Monthly Burn Rate',
    short: 'Budget',
    activePill: 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white border-teal-500 shadow-sm shadow-teal-500/20',
    activeNum: 'bg-white/25 text-white',
    donePill: 'bg-teal-50 text-teal-800 border-teal-200/80 hover:bg-teal-100/80',
  },
  3: {
    label: 'Your Escape Plan',
    short: 'Plan',
    activePill: 'bg-gradient-to-r from-amber-500 to-orange-600 text-white border-amber-500 shadow-sm shadow-orange-500/20',
    activeNum: 'bg-white/25 text-white',
    donePill: 'bg-amber-50 text-amber-900 border-amber-200/80 hover:bg-amber-100/80',
  },
  4: {
    label: 'Your Ideal Environment',
    short: 'Vibe',
    activePill: 'bg-gradient-to-r from-rose-600 via-pink-600 to-indigo-600 text-white border-rose-500 shadow-sm shadow-rose-500/20',
    activeNum: 'bg-white/25 text-white',
    donePill: 'bg-rose-50 text-rose-800 border-rose-200/80 hover:bg-rose-100/80',
  },
};

const PRIORITY_GROUPS: Array<'Core & Financial' | 'Lifestyle & Nomad' | 'Climate & Tax'> = [
  'Core & Financial',
  'Lifestyle & Nomad',
  'Climate & Tax',
];

function formatNestEggDisplay(value: number): string {
  if (value >= 1000000) {
    return value === 1000000 ? '$1M+' : `$${(value / 1000000).toFixed(2).replace(/\.00$/, '')}M`;
  }
  return `$${value.toLocaleString()}`;
}

export const FreedomMapHeroQuiz: React.FC<FreedomMapHeroQuizProps> = ({
  onScrollTo,
  onNavigateView,
  onOpenExplorer,
}) => {
  const {
    countries,
    isAuthenticated,
    currentUserId,
    userProfile,
    saveFreedomMapQuiz,
    loginWithGoogle,
    openAuthModal,
    navigateToCountry,
    setCurrentView,
    openBadgeModal,
  } = useApp();

  const isGuestUser = !isAuthenticated || currentUserId === 'guest';

  // Restore newest synced quiz state from Firestore userProfile or localStorage without overwriting timestamps on mount
  const [quiz, setQuiz] = useState<FreedomQuizState>(() => {
    const initial = pickNewestFreedomQuizState(
      !isGuestUser ? userProfile.freedomMapQuiz : null,
      loadFreedomQuizState()
    );
    return initial || DEFAULT_FREEDOM_QUIZ_STATE;
  });

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [phase, setPhase] = useState<'quiz' | 'calculating' | 'reveal'>(() => {
    const initial = pickNewestFreedomQuizState(
      !isGuestUser ? userProfile.freedomMapQuiz : null,
      loadFreedomQuizState()
    );
    return initial?.completedReveal ? 'reveal' : 'quiz';
  });
  const [hasInteractedStep1, setHasInteractedStep1] = useState(false);
  const [calcStage, setCalcStage] = useState(0);
  const [unlockedTab, setUnlockedTab] = useState<'matches' | 'visa' | 'inflation'>('matches');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [direction, setDirection] = useState<1 | -1>(1);

  const calcTimerRef = useRef<number | null>(null);
  const calcStageTimerRef = useRef<number | null>(null);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  // Hydrate when cloud-synced userProfile.freedomMapQuiz arrives (e.g. signing in on another computer/browser)
  useEffect(() => {
    if (isGuestUser) return;
    const cloudQuiz = normalizeFreedomQuizState(userProfile.freedomMapQuiz);
    if (!cloudQuiz) return;

    setQuiz(prev => {
      const newest = pickNewestFreedomQuizState(cloudQuiz, prev);
      if (!newest) return prev;
      if (
        prev.updatedAt === newest.updatedAt &&
        prev.nestEggUSD === newest.nestEggUSD &&
        prev.monthlyBudgetUSD === newest.monthlyBudgetUSD &&
        prev.household === newest.household &&
        prev.escapePlan === newest.escapePlan &&
        prev.completedReveal === newest.completedReveal &&
        prev.priorities.join(',') === newest.priorities.join(',')
      ) {
        return prev;
      }
      return newest;
    });

    if (cloudQuiz.completedReveal && phaseRef.current !== 'calculating') {
      setPhase('reveal');
    }
  }, [isGuestUser, currentUserId, userProfile.freedomMapQuiz]);

  // Listen for live updates from Dashboard / Haven Matcher / logout clear
  useEffect(() => {
    const handleExternalUpdate = (e: Event) => {
      const custom = e as CustomEvent<FreedomQuizState | null>;
      if (custom.detail === null) {
        setQuiz(DEFAULT_FREEDOM_QUIZ_STATE);
        setPhase('quiz');
        setStep(1);
        return;
      }
      const incoming = normalizeFreedomQuizState(custom.detail);
      if (!incoming) return;
      setQuiz(prev => {
        if (prev.updatedAt === incoming.updatedAt) return prev;
        return incoming;
      });
      if (incoming.completedReveal && phaseRef.current !== 'calculating') {
        setPhase('reveal');
      }
    };
    window.addEventListener(FREEDOM_QUIZ_UPDATED_EVENT, handleExternalUpdate);
    return () => window.removeEventListener(FREEDOM_QUIZ_UPDATED_EVENT, handleExternalUpdate);
  }, []);

  useEffect(() => {
    return () => {
      if (calcTimerRef.current) window.clearTimeout(calcTimerRef.current);
      if (calcStageTimerRef.current) window.clearInterval(calcStageTimerRef.current);
    };
  }, []);

  const updateQuizFromUser = (
    updater: (prev: FreedomQuizState) => FreedomQuizState,
    options?: { immediate?: boolean }
  ) => {
    setQuiz(prev => {
      const next: FreedomQuizState = {
        ...updater(prev),
        updatedAt: new Date().toISOString(),
      };
      saveFreedomMapQuiz(next, options);
      return next;
    });
  };

  const results = useMemo(
    () => computeFreedomMapResults(countries, quiz),
    [countries, quiz]
  );

  const goToStep = (nextStep: 1 | 2 | 3 | 4) => {
    setDirection(nextStep >= step ? 1 : -1);
    setStep(nextStep);
    setPhase('quiz');
  };

  const handleTogglePriority = (priorityId: FreedomPriorityId) => {
    updateQuizFromUser(prev => {
      const exists = prev.priorities.includes(priorityId);
      if (exists) {
        return {
          ...prev,
          priorities: prev.priorities.filter(p => p !== priorityId),
        };
      }
      if (prev.priorities.length >= 2) {
        return {
          ...prev,
          priorities: [prev.priorities[1], priorityId],
        };
      }
      return {
        ...prev,
        priorities: [...prev.priorities, priorityId],
      };
    });
  };

  const handleRevealMatches = () => {
    const finalized: FreedomQuizState = {
      ...quiz,
      completedReveal: true,
      updatedAt: new Date().toISOString(),
    };
    setQuiz(finalized);
    saveFreedomMapQuiz(finalized, { immediate: true });
    setPhase('calculating');
    setCalcStage(0);

    if (calcTimerRef.current) window.clearTimeout(calcTimerRef.current);
    if (calcStageTimerRef.current) window.clearInterval(calcStageTimerRef.current);

    calcStageTimerRef.current = window.setInterval(() => {
      setCalcStage(prev => (prev < 2 ? prev + 1 : prev));
    }, 480);

    calcTimerRef.current = window.setTimeout(() => {
      if (calcStageTimerRef.current) window.clearInterval(calcStageTimerRef.current);
      setPhase('reveal');
    }, 1500);
  };

  const handleContinueWithGoogle = async () => {
    setAuthError(null);
    setIsGoogleLoading(true);
    markPendingFreedomQuizHydration({
      ...quiz,
      completedReveal: true,
    });
    try {
      const res = await loginWithGoogle();
      if (!res.success && res.error) {
        setAuthError(res.error);
      }
    } catch (err: any) {
      setAuthError(err?.message || 'Unable to complete Google sign-in. Please try again.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleEmailSignupFallback = () => {
    markPendingFreedomQuizHydration({
      ...quiz,
      completedReveal: true,
    });
    openAuthModal('signup');
  };

  const handleResetQuiz = () => {
    updateQuizFromUser(prev => ({ ...prev, completedReveal: false }), { immediate: true });
    setStep(1);
    setPhase('quiz');
    setDirection(-1);
  };

  const progressPercent =
    phase === 'quiz'
      ? STEP_PROGRESS[step]
      : phase === 'calculating'
        ? 96
        : isGuestUser
          ? 85
          : 100;

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-sky-50/95 via-indigo-50/80 to-amber-50/65 text-slate-950 border-b border-indigo-200/80">
      {/* Multi-Colored Sunlit Ambient Glow Orbs */}
      <div className="pointer-events-none absolute -top-28 left-1/4 w-[30rem] h-[30rem] rounded-full bg-indigo-300/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 right-1/4 w-[28rem] h-[28rem] rounded-full bg-teal-300/25 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -left-24 w-80 h-80 rounded-full bg-amber-300/25 blur-3xl" />
      <div className="pointer-events-none absolute top-16 -right-24 w-72 h-72 rounded-full bg-rose-300/20 blur-3xl" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-7 pb-10 md:pt-11 md:pb-14">
        {/* ============================================================ */}
        {/* 1. ABOVE-THE-FOLD PUNCHY HERO HEADER                         */}
        {/* ============================================================ */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-3xl mx-auto space-y-3 mb-6 md:mb-8"
        >
          {/* Clean Unboxed Eyebrow Metadata */}
          <div className="inline-flex flex-wrap items-center justify-center gap-2 text-[11px] sm:text-xs font-extrabold tracking-[0.14em] uppercase text-indigo-700">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>{countries.length} COUNTRIES • LIVE VISA &amp; RUNWAY DATA</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-[3.05rem] font-black tracking-tight leading-[1.09] text-slate-950 text-balance">
            Find out where you can{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-teal-600 to-amber-600 bg-clip-text text-transparent">
              retire—or work remotely
            </span>
            —today.
          </h1>

          <p className="text-sm sm:text-base md:text-[1.05rem] text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
            Stop guessing your FIRE number. Enter your monthly budget and savings to unlock your exact financial runway, matching visas, and top destinations in 30 seconds.
          </p>
        </motion.div>

        {/* ============================================================ */}
        {/* 2. MULTI-COLORED LUMINOUS 4-STEP FREEDOM MAP WIDGET          */}
        {/* ============================================================ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-3xl bg-gradient-to-br from-white via-indigo-50/25 to-teal-50/35 backdrop-blur-md border border-indigo-200/90 shadow-xl shadow-indigo-950/10 overflow-hidden"
        >
          {/* Multi-Colored Signature Top Accent Ribbon */}
          <div className="h-1.5 w-full bg-gradient-to-r from-indigo-600 via-teal-500 via-55% to-amber-500" />

          {/* Progress Bar Header */}
          <div className="px-5 sm:px-8 pt-5 pb-4 border-b border-indigo-100/90 bg-gradient-to-r from-indigo-50/60 via-white/95 to-amber-50/55">
            <div className="flex items-center justify-between gap-3 mb-2.5">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs font-extrabold uppercase tracking-wider bg-gradient-to-r from-indigo-700 via-teal-700 to-amber-700 bg-clip-text text-transparent">
                  {phase === 'quiz' && `Step ${step} of 4 · ${STEP_META[step].label}`}
                  {phase === 'calculating' && 'Calculating Your Freedom Map'}
                  {phase === 'reveal' &&
                    (isGuestUser
                      ? '🎉 Your Freedom Profile is 85% Complete!'
                      : 'Freedom Map Unlocked · 100% Complete')}
                </span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {phase === 'reveal' && (
                  <button
                    type="button"
                    onClick={handleResetQuiz}
                    className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-indigo-700 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Adjust Answers</span>
                  </button>
                )}
                <span className="text-xs font-mono font-extrabold tabular-nums px-2.5 py-0.5 rounded-lg bg-gradient-to-r from-indigo-600 to-teal-600 text-white shadow-2xs">
                  {progressPercent}%
                </span>
              </div>
            </div>

            {/* Smooth Multi-Color Animated Progress Track */}
            <div className="h-2.5 w-full rounded-full bg-slate-200/70 overflow-hidden p-0.5">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-indigo-600 via-teal-500 via-60% to-amber-500"
                initial={false}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>

            {/* Multi-Colored Interactive Step Breadcrumbs */}
            {phase === 'quiz' && (
              <div className="mt-3.5 grid grid-cols-4 gap-1.5 sm:gap-2">
                {([1, 2, 3, 4] as const).map(s => {
                  const isActive = step === s;
                  const isDone = step > s;
                  const meta = STEP_META[s];
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => goToStep(s)}
                      className={`text-left px-2.5 py-2 rounded-xl text-[11px] font-extrabold border transition-all cursor-pointer truncate flex items-center gap-1.5 ${
                        isActive
                          ? meta.activePill
                          : isDone
                            ? meta.donePill
                            : 'bg-white/80 border-slate-200/80 text-slate-500 hover:text-slate-800 hover:bg-white'
                      }`}
                    >
                      <span
                        className={`w-4 h-4 rounded-full text-[10px] font-mono font-black flex items-center justify-center shrink-0 ${
                          isActive
                            ? meta.activeNum
                            : isDone
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {isDone ? <Check className="w-2.5 h-2.5" /> : s}
                      </span>
                      <span className="truncate hidden sm:inline">{meta.label}</span>
                      <span className="truncate sm:hidden">{meta.short}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* ============================================================ */}
          {/* CARD BODY: QUIZ STEPS / CALCULATING / GATED REVEAL           */}
          {/* ============================================================ */}
          <div className="p-5 sm:p-8">
            <AnimatePresence mode="wait" initial={false}>
              {/* -------------------------------------------------------- */}
              {/* STEP 1: YOUR NEST EGG (20%)                              */}
              {/* -------------------------------------------------------- */}
              {phase === 'quiz' && step === 1 && (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, x: direction * 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction * -20 }}
                  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-6"
                >
                  <div className="space-y-1.5">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
                      How much do you currently have saved or invested?
                    </h2>
                    <p className="text-sm text-slate-600">
                      Include cash, stocks, index funds, or retirement accounts. Rough estimates work great.
                    </p>
                  </div>

                  {/* Multi-Colored Luminous Slider & Preset Cards */}
                  <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-indigo-50/80 via-white to-amber-50/55 border border-indigo-200/80 space-y-5 shadow-2xs">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-700">
                        Current Nest Egg
                      </span>
                      <div className="text-3xl sm:text-4xl font-black font-mono tabular-nums bg-gradient-to-r from-indigo-700 via-violet-600 to-teal-600 bg-clip-text text-transparent">
                        {formatNestEggDisplay(quiz.nestEggUSD)}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <input
                        type="range"
                        aria-label="Current savings or investments"
                        min={0}
                        max={1500000}
                        step={5000}
                        value={Math.min(1500000, quiz.nestEggUSD)}
                        onChange={e => {
                          setHasInteractedStep1(true);
                          updateQuizFromUser(prev => ({
                            ...prev,
                            nestEggUSD: Number(e.target.value),
                          }));
                        }}
                        className="w-full h-2.5 rounded-lg appearance-none cursor-pointer accent-indigo-600 bg-gradient-to-r from-teal-100 via-indigo-100 to-amber-100"
                      />
                      <div className="flex justify-between text-[11px] font-mono tabular-nums text-slate-500 font-semibold">
                        <span>$0</span>
                        <span>$250k</span>
                        <span>$500k</span>
                        <span>$1M+</span>
                        <span>$1.5M</span>
                      </div>
                    </div>

                    {/* Multi-Colored Quick-Select Preset Cards */}
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
                      {NEST_EGG_PRESETS.map(preset => {
                        const isSelected =
                          preset.value === 1000000
                            ? quiz.nestEggUSD >= 1000000
                            : quiz.nestEggUSD === preset.value;
                        return (
                          <motion.button
                            key={preset.label}
                            type="button"
                            whileHover={{ y: -2, scale: 1.01 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => {
                              setHasInteractedStep1(true);
                              updateQuizFromUser(prev => ({ ...prev, nestEggUSD: preset.value }));
                            }}
                            className={`min-h-[54px] px-3 py-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                              isSelected ? `bg-gradient-to-br ${preset.activeGrad}` : preset.idleStyle
                            }`}
                          >
                            <span className="text-sm font-mono font-black tabular-nums leading-none">
                              {preset.label}
                            </span>
                            <span
                              className={`text-[10px] font-bold leading-tight ${
                                isSelected ? 'text-white/85' : preset.subColor
                              }`}
                            >
                              {preset.sub}
                            </span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Primary CTA + Micro-Trust Copy */}
                  <div className="space-y-3 pt-1">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.01, y: -1 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => goToStep(2)}
                      className="w-full min-h-[54px] px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-teal-600 hover:from-indigo-500 hover:to-teal-500 text-white font-black text-base shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
                    >
                      <span>
                        {hasInteractedStep1
                          ? 'Next: Monthly Lifestyle'
                          : 'Calculate My Freedom Map'}
                      </span>
                      <ArrowRight className="w-5 h-5" />
                    </motion.button>
                    <p className="text-xs font-semibold text-slate-500 text-center">
                      Free forever • No credit card • Takes 30 seconds
                    </p>
                  </div>
                </motion.div>
              )}

              {/* -------------------------------------------------------- */}
              {/* STEP 2: YOUR MONTHLY BURN RATE (45%)                     */}
              {/* -------------------------------------------------------- */}
              {phase === 'quiz' && step === 2 && (
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0, x: direction * 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction * -20 }}
                  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-6"
                >
                  <div className="space-y-1.5">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
                      What is your ideal monthly living budget?
                    </h2>
                    <p className="text-sm text-slate-600">
                      For context:{' '}
                      <button
                        type="button"
                        onClick={() => updateQuizFromUser(prev => ({ ...prev, monthlyBudgetUSD: 1800 }))}
                        className="font-bold text-teal-700 hover:text-teal-900 underline decoration-teal-300 underline-offset-2 cursor-pointer"
                      >
                        $1,800/mo
                      </button>{' '}
                      lives comfortably in Chiang Mai;{' '}
                      <button
                        type="button"
                        onClick={() => updateQuizFromUser(prev => ({ ...prev, monthlyBudgetUSD: 3200 }))}
                        className="font-bold text-amber-700 hover:text-amber-900 underline decoration-amber-300 underline-offset-2 cursor-pointer"
                      >
                        $3,200/mo
                      </button>{' '}
                      covers Lisbon.
                    </p>
                  </div>

                  {/* Multi-Colored Household Mode Toggle */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-indigo-50/75 via-white to-teal-50/75 border border-indigo-200/80">
                    <div>
                      <div className="text-xs font-extrabold uppercase tracking-wider text-indigo-800">
                        Household Size
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Adjusts country cost-of-living and visa thresholds automatically.
                      </p>
                    </div>
                    <div className="grid grid-cols-2 p-1 rounded-xl bg-white border border-indigo-200/80 shadow-2xs shrink-0 gap-1">
                      <button
                        type="button"
                        onClick={() => updateQuizFromUser(prev => ({ ...prev, household: 'solo' }))}
                        className={`min-h-[42px] px-4 py-2 rounded-lg text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          quiz.household === 'solo'
                            ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm'
                            : 'text-slate-600 hover:text-slate-950 hover:bg-indigo-50/60'
                        }`}
                      >
                        <User className="w-4 h-4" />
                        <span>Solo</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => updateQuizFromUser(prev => ({ ...prev, household: 'couple' }))}
                        className={`min-h-[42px] px-4 py-2 rounded-lg text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          quiz.household === 'couple'
                            ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-sm'
                            : 'text-slate-600 hover:text-slate-950 hover:bg-teal-50/60'
                        }`}
                      >
                        <Users className="w-4 h-4" />
                        <span>Couple / Family</span>
                      </button>
                    </div>
                  </div>

                  {/* Luminous Teal/Emerald/Amber Monthly Budget Slider */}
                  <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-teal-50/85 via-white to-emerald-50/60 border border-teal-200/85 space-y-4">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-teal-800">
                        Monthly Living Budget ({quiz.household === 'couple' ? 'Couple / Family' : 'Solo'})
                      </span>
                      <div className="text-3xl sm:text-4xl font-black font-mono tabular-nums bg-gradient-to-r from-teal-700 via-emerald-600 to-indigo-600 bg-clip-text text-transparent">
                        ${quiz.monthlyBudgetUSD.toLocaleString()}
                        <span className="text-base font-bold text-slate-400">/mo</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <input
                        type="range"
                        aria-label="Ideal monthly living budget"
                        min={1000}
                        max={10000}
                        step={100}
                        value={quiz.monthlyBudgetUSD}
                        onChange={e =>
                          updateQuizFromUser(prev => ({
                            ...prev,
                            monthlyBudgetUSD: Number(e.target.value),
                          }))
                        }
                        className="w-full h-2.5 rounded-lg appearance-none cursor-pointer accent-teal-600 bg-gradient-to-r from-emerald-100 via-teal-100 to-amber-100"
                      />
                      <div className="flex justify-between text-[11px] font-mono tabular-nums text-slate-500 font-semibold">
                        <span>$1,000/mo</span>
                        <span>$3,000/mo</span>
                        <span>$5,500/mo</span>
                        <span>$8,000/mo</span>
                        <span>$10,000/mo</span>
                      </div>
                    </div>

                    {/* Live Instant Context Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-teal-200/70 text-xs font-semibold text-slate-600">
                      <span>
                        Annual spend:{' '}
                        <strong className="font-mono tabular-nums text-slate-900">
                          ${(quiz.monthlyBudgetUSD * 12).toLocaleString()}/yr
                        </strong>
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-100/80 text-emerald-800 font-extrabold">
                        Live preview: {results.qualifyingCount} matching havens in budget
                      </span>
                    </div>
                  </div>

                  {/* Step Actions */}
                  <div className="flex items-center justify-between gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => goToStep(1)}
                      className="min-h-[48px] px-4 sm:px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.01, y: -1 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => goToStep(3)}
                      className="flex-1 sm:flex-none min-h-[50px] px-6 sm:px-8 py-3 rounded-2xl bg-gradient-to-r from-teal-600 via-emerald-600 to-indigo-600 hover:from-teal-500 hover:to-indigo-500 text-white font-black text-sm sm:text-base shadow-lg shadow-teal-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Next: Your Timeline</span>
                      <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* -------------------------------------------------------- */}
              {/* STEP 3: YOUR ESCAPE PLAN (70%)                           */}
              {/* -------------------------------------------------------- */}
              {phase === 'quiz' && step === 3 && (
                <motion.div
                  key="step-3"
                  initial={{ opacity: 0, x: direction * 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction * -20 }}
                  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-6"
                >
                  <div className="space-y-1.5">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
                      How do you plan to fund your move?
                    </h2>
                    <p className="text-sm text-slate-600">
                      This filters out countries with strict passive-income or remote-work visa rules.
                    </p>
                  </div>

                  {/* 3 Multi-Colored Interactive Escape Plan Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                    {ESCAPE_PLAN_OPTIONS.map(option => {
                      const Icon = option.icon;
                      const isSelected = quiz.escapePlan === option.id;
                      return (
                        <motion.button
                          key={option.id}
                          type="button"
                          whileHover={{ y: -2, scale: 1.01 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() =>
                            updateQuizFromUser(prev => ({ ...prev, escapePlan: option.id }))
                          }
                          className={`group relative text-left p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-4 ${
                            isSelected ? `bg-gradient-to-br ${option.activeGrad}` : option.idleStyle
                          }`}
                        >
                          <div className="space-y-3">
                            <div className="flex items-center justify-between gap-2">
                              <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                                  isSelected ? 'bg-white/20 text-white' : option.iconBgIdle
                                }`}
                              >
                                <Icon className="w-5 h-5" />
                              </div>
                              {isSelected ? (
                                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/20 text-white flex items-center gap-1">
                                  <Check className="w-3 h-3" />
                                  <span>Active</span>
                                </span>
                              ) : (
                                <div className="w-5 h-5 rounded-full border-2 border-slate-300 bg-white" />
                              )}
                            </div>

                            <div>
                              <h3
                                className={`text-base font-black leading-snug ${
                                  isSelected ? 'text-white' : 'text-slate-950'
                                }`}
                              >
                                {option.title}
                              </h3>
                              <p
                                className={`text-xs sm:text-sm mt-1 leading-relaxed ${
                                  isSelected ? 'text-white/90' : 'text-slate-600'
                                }`}
                              >
                                {option.subtitle}
                              </p>
                            </div>
                          </div>

                          <div
                            className={`pt-2 border-t text-[11px] font-extrabold ${
                              isSelected ? 'border-white/20 text-white/95' : 'border-slate-100'
                            }`}
                          >
                            <span
                              className={
                                isSelected
                                  ? 'text-white'
                                  : `inline-block px-2 py-0.5 rounded-md border ${option.badgeColorIdle}`
                              }
                            >
                              {option.badge}
                            </span>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Step Actions */}
                  <div className="flex items-center justify-between gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => goToStep(2)}
                      className="min-h-[48px] px-4 sm:px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.01, y: -1 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => goToStep(4)}
                      className="flex-1 sm:flex-none min-h-[50px] px-6 sm:px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-black text-sm sm:text-base shadow-lg shadow-orange-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Next: Pick Your Vibe</span>
                      <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* -------------------------------------------------------- */}
              {/* STEP 4: YOUR IDEAL ENVIRONMENT (90%) — COMPACT MULTI-COLOR */}
              {/* -------------------------------------------------------- */}
              {phase === 'quiz' && step === 4 && (
                <motion.div
                  key="step-4"
                  initial={{ opacity: 0, x: direction * 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction * -20 }}
                  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-3.5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h2 className="text-lg sm:text-xl font-black text-slate-950 tracking-tight">
                        What matters most in your next home base?
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-600">
                        Pick up to 2 priorities to rank your top country matches across all Explore Havens filters.
                      </p>
                    </div>
                    <span className="text-xs font-mono font-extrabold tabular-nums text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-600 px-3 py-1 rounded-xl shadow-sm shrink-0 self-start sm:self-auto">
                      {quiz.priorities.length} / 2 selected
                    </span>
                  </div>

                  {/* Compact Multi-Colored Preference Card Groups */}
                  <div className="space-y-2.5">
                    {PRIORITY_GROUPS.map(groupName => {
                      const groupItems = FREEDOM_PRIORITY_OPTIONS.filter(
                        opt => opt.group === groupName
                      );
                      const gStyle = GROUP_STYLES[groupName];
                      const gridCols =
                        groupName === 'Climate & Tax'
                          ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'
                          : groupName === 'Lifestyle & Nomad'
                            ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
                            : 'grid-cols-2 sm:grid-cols-3';
                      return (
                        <div
                          key={groupName}
                          className={`p-2.5 sm:p-3 rounded-2xl border space-y-2 ${gStyle.container}`}
                        >
                          <div className="flex items-center justify-between gap-2 px-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className={`w-2 h-2 rounded-full ${gStyle.dotColor}`} />
                              <span
                                className={`text-[10px] font-extrabold uppercase tracking-wider ${gStyle.headerText}`}
                              >
                                {groupName}
                              </span>
                            </div>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${gStyle.badgeBg}`}
                            >
                              {groupItems.length}
                            </span>
                          </div>

                          <div className={`grid ${gridCols} gap-1.5 sm:gap-2`}>
                            {groupItems.map(opt => {
                              const selectedIndex = quiz.priorities.indexOf(opt.id);
                              const isSelected = selectedIndex !== -1;
                              const visual = PRIORITY_CARD_STYLES[opt.id];
                              const Icon = visual.icon;
                              return (
                                <motion.button
                                  key={opt.id}
                                  type="button"
                                  title={opt.shortHint}
                                  whileHover={{ y: -1, scale: 1.01 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => handleTogglePriority(opt.id)}
                                  className={`relative min-h-[40px] px-2.5 py-1.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                                    isSelected
                                      ? `bg-gradient-to-br ${visual.activeGrad}`
                                      : visual.idleStyle
                                  }`}
                                >
                                  <span
                                    className={`p-1.5 rounded-lg shrink-0 transition-colors ${
                                      isSelected
                                        ? 'bg-white/20 text-white'
                                        : visual.iconBoxIdle
                                    }`}
                                  >
                                    <Icon className="w-3.5 h-3.5" />
                                  </span>
                                  <span className="text-[11px] font-extrabold leading-tight flex-1 min-w-0 line-clamp-2">
                                    {opt.label}
                                  </span>
                                  {isSelected && (
                                    <span className="text-[9px] font-black font-mono px-1.5 py-0.5 rounded-md bg-white/25 text-white shrink-0">
                                      #{selectedIndex + 1}
                                    </span>
                                  )}
                                </motion.button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Final Submit CTA */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2 border-t border-indigo-100">
                    <button
                      type="button"
                      onClick={() => goToStep(3)}
                      className="min-h-[44px] px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.01, y: -1 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={handleRevealMatches}
                      className="flex-1 sm:flex-none min-h-[48px] px-7 sm:px-9 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-teal-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-black text-sm sm:text-base shadow-lg shadow-teal-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Reveal My Matching Countries ✨</span>
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* -------------------------------------------------------- */}
              {/* 1.5-SECOND ANIMATED CALCULATION SCREEN                   */}
              {/* -------------------------------------------------------- */}
              {phase === 'calculating' && (
                <motion.div
                  key="calculating"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                  className="py-12 sm:py-16 text-center max-w-lg mx-auto space-y-5"
                >
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-indigo-600 via-teal-500 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
                      Scanning {countries.length} tax treaties, visa thresholds, and cost-of-living indexes...
                    </h2>
                    <p className="text-sm text-slate-600 font-medium">
                      {calcStage === 0 && 'Evaluating 4% Safe Withdrawal & geo-arbitrage runway...'}
                      {calcStage === 1 && 'Matching residency & Digital Nomad visa income floors...'}
                      {calcStage >= 2 && 'Ranking your top destinations & running 10-year inflation stress tests...'}
                    </p>
                  </div>
                  <div className="max-w-xs mx-auto h-2.5 rounded-full bg-slate-100 overflow-hidden p-0.5">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-600 via-teal-500 to-amber-500"
                      initial={{ width: '12%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 1.45, ease: 'easeInOut' }}
                    />
                  </div>
                </motion.div>
              )}

              {/* -------------------------------------------------------- */}
              {/* 3. THE GATED REVEAL SCREEN (OR UNLOCKED MEMBER REPORT)   */}
              {/* -------------------------------------------------------- */}
              {phase === 'reveal' && (
                <motion.div
                  key="reveal"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-6"
                >
                  {/* Top Endowed Progress Banner */}
                  <div
                    className={`rounded-2xl p-4 sm:p-5 border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isGuestUser
                        ? 'bg-gradient-to-r from-amber-50/95 via-rose-50/60 to-indigo-50/90 border-amber-200/90'
                        : 'bg-gradient-to-r from-emerald-50/95 via-teal-50/80 to-indigo-50/80 border-emerald-200'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2 text-sm sm:text-base font-black text-slate-950">
                        <span>
                          {isGuestUser
                            ? '🎉 Your Freedom Profile is 85% Complete!'
                            : '🎉 Your Full Freedom Map & Visa Report is Unlocked!'}
                        </span>
                        {!isGuestUser && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-800 bg-emerald-100/90 border border-emerald-200 px-2 py-0.5 rounded-md">
                            <Check className="w-3 h-3" />
                            <span>Saved to your profile</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 font-medium">
                        Calculated for{' '}
                        <strong className="font-mono tabular-nums text-indigo-800">
                          {formatNestEggDisplay(quiz.nestEggUSD)}
                        </strong>{' '}
                        saved ·{' '}
                        <strong className="font-mono tabular-nums text-teal-800">
                          ${quiz.monthlyBudgetUSD.toLocaleString()}/mo
                        </strong>{' '}
                        ({quiz.household === 'couple' ? 'Couple / Family' : 'Solo'})
                      </p>
                    </div>
                    {!isGuestUser && (
                      <button
                        type="button"
                        onClick={() => onNavigateView('dashboard')}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-500 hover:to-teal-500 text-white text-xs sm:text-sm font-extrabold shadow-sm flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                      >
                        <span>Open My Dashboard</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* 3 MULTI-COLORED VISIBLE UNBLURRED TEASER METRIC CARDS */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Card 1: Estimated Financial Runway (Indigo / Violet) */}
                    <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/90 via-white to-violet-50/60 border border-indigo-200/85 flex flex-col justify-between gap-2 shadow-2xs">
                      <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-indigo-700">
                        <span>Estimated Financial Runway</span>
                        <span className="p-1.5 rounded-lg bg-indigo-100 text-indigo-600">
                          <TrendingUp className="w-4 h-4" />
                        </span>
                      </div>
                      <div className="text-xl sm:text-2xl font-black font-mono tabular-nums text-indigo-950 leading-snug">
                        {results.runwayLabel}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {results.runwaySubLabel}
                      </p>
                    </div>

                    {/* Card 2: Countries You Qualify For Today (Teal / Emerald) */}
                    <div className="p-5 rounded-2xl bg-gradient-to-br from-teal-50/90 via-white to-emerald-50/65 border border-teal-200/85 flex flex-col justify-between gap-2 shadow-2xs">
                      <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-teal-700">
                        <span>Countries You Qualify For Today</span>
                        <span className="p-1.5 rounded-lg bg-teal-100 text-teal-600">
                          <Globe className="w-4 h-4" />
                        </span>
                      </div>
                      <div className="text-2xl sm:text-3xl font-black font-mono tabular-nums text-teal-700">
                        {results.qualifyingCount}{' '}
                        <span className="text-base font-extrabold text-slate-700">Countries</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Out of {countries.length} global havens scanned across visa income &amp; living cost thresholds.
                      </p>
                    </div>

                    {/* Card 3: #1 Top Match (Amber / Rose / Emerald) */}
                    {results.topMatch && (
                      <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50/90 via-white to-rose-50/55 border border-amber-200/90 flex flex-col justify-between gap-2 shadow-2xs">
                        <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-amber-800">
                          <span>#1 Top Match</span>
                          <span className="font-mono tabular-nums text-white bg-gradient-to-r from-emerald-600 to-teal-600 px-2 py-0.5 rounded-md shadow-2xs">
                            {results.topMatch.matchPercent}% Match
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <CountryFlag
                            countryName={results.topMatch.country.name}
                            fallbackEmoji={results.topMatch.country.flag}
                            size="md"
                            className="shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="text-lg sm:text-xl font-black text-slate-950 truncate">
                              {results.topMatch.country.name}
                            </div>
                            <div className="text-xs font-bold text-indigo-700 truncate">
                              {results.topMatch.visaLabel}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-600 pt-1.5 border-t border-amber-200/60">
                          <span>
                            Est.{' '}
                            <strong className="font-mono tabular-nums text-slate-900">
                              ${results.topMatch.monthlyCostUSD.toLocaleString()}/mo
                            </strong>
                          </span>
                          {!isGuestUser ? (
                            <button
                              type="button"
                              onClick={() => navigateToCountry(results.topMatch!.country.id)}
                              className="font-extrabold text-indigo-700 hover:underline inline-flex items-center gap-1 cursor-pointer"
                            >
                              <span>Open Dossier</span>
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          ) : (
                            <span className="font-bold text-emerald-700">
                              {results.topMatch.matchPercent}% Lifestyle Match
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ======================================================== */}
                  {/* GUEST VIEW: BLURRED MATCHES #2-#4 + TABS + SIGNUP CARD   */}
                  {/* ======================================================== */}
                  {isGuestUser ? (
                    <div className="relative rounded-2xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50/45 via-slate-50/60 to-amber-50/45 p-4 sm:p-6 overflow-hidden">
                      {/* Blurred Tabs + Match Cards #2, #3, #4 underneath */}
                      <div
                        aria-hidden="true"
                        className="blur-[6px] opacity-70 pointer-events-none select-none space-y-5"
                      >
                        <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-slate-200">
                          <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-extrabold">
                            Top Matches #2–#4
                          </div>
                          <div className="px-4 py-2 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-extrabold flex items-center gap-1.5">
                            <Stamp className="w-3.5 h-3.5 text-teal-600" />
                            <span>Visa Income Check</span>
                          </div>
                          <div className="px-4 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-extrabold flex items-center gap-1.5">
                            <LineChart className="w-3.5 h-3.5 text-amber-600" />
                            <span>10-Year Inflation Stress Test</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {results.blurredMatches.map((match, idx) => (
                            <div
                              key={match.country.id}
                              className="p-4 rounded-2xl bg-white border border-indigo-100 space-y-3"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-black text-indigo-700">
                                  #{idx + 2} Match
                                </span>
                                <span className="text-xs font-mono font-bold text-teal-700">
                                  {match.matchPercent}% Fit
                                </span>
                              </div>
                              <div className="flex items-center gap-2.5">
                                <CountryFlag
                                  countryName={match.country.name}
                                  fallbackEmoji={match.country.flag}
                                  size="sm"
                                />
                                <div>
                                  <div className="font-black text-slate-900">
                                    {match.country.name}
                                  </div>
                                  <div className="text-xs text-slate-500">
                                    {match.visaLabel}
                                  </div>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                                <div>
                                  <div className="text-slate-400">Monthly Cost</div>
                                  <div className="font-mono font-bold text-slate-900">
                                    ${match.monthlyCostUSD.toLocaleString()}/mo
                                  </div>
                                </div>
                                <div>
                                  <div className="text-slate-400">10-Yr Stress</div>
                                  <div className="font-mono font-bold text-amber-700">
                                    ${match.inflation10YrLowUSD.toLocaleString()}/mo
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200 space-y-1.5">
                            <div className="text-xs font-black text-teal-900">
                              Visa Income Check — Official Thresholds
                            </div>
                            <div className="text-xs text-slate-600">
                              Compares your 4% SWR &amp; monthly budget against embassy income rules for all {results.qualifyingCount} qualifying countries.
                            </div>
                          </div>
                          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1.5">
                            <div className="text-xs font-black text-amber-900">
                              10-Year Inflation Stress Test (3% vs 5%)
                            </div>
                            <div className="text-xs text-slate-600">
                              Projects future rent, private healthcare, and grocery burn across your shortlist through 2036.
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* CENTERED SIGNUP OVERLAY CARD */}
                      <div className="relative z-10 -mt-56 sm:-mt-52 md:-mt-48 mb-2 flex justify-center">
                        <div className="w-full max-w-xl rounded-3xl bg-white/98 backdrop-blur-md border-2 border-indigo-200 shadow-2xl shadow-indigo-950/15 p-6 sm:p-8 text-center space-y-5">
                          <div className="w-11 h-11 mx-auto rounded-2xl bg-gradient-to-br from-indigo-600 via-teal-500 to-amber-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
                            <Lock className="w-5 h-5" />
                          </div>

                          <div className="space-y-2">
                            <h3 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight leading-snug text-balance">
                              Unlock your full {results.qualifyingCount}-country Freedom Map &amp; Visa Report.
                            </h3>
                            <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
                              Create a free Refirely account in one click to save your runway, compare top destinations side-by-side, and see exact visa income requirements.
                            </p>
                          </div>

                          {authError && (
                            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-center justify-center gap-2">
                              <AlertCircle className="w-4 h-4 shrink-0" />
                              <span>{authError}</span>
                            </div>
                          )}

                          {/* Primary 1-Click Google OAuth CTA */}
                          <div className="space-y-2.5">
                            <motion.button
                              type="button"
                              whileHover={{ scale: 1.01, y: -1 }}
                              whileTap={{ scale: 0.99 }}
                              disabled={isGoogleLoading}
                              onClick={handleContinueWithGoogle}
                              className="w-full min-h-[54px] px-6 py-3.5 rounded-2xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 hover:from-slate-800 hover:to-indigo-900 disabled:opacity-70 text-white font-black text-sm sm:text-base shadow-lg shadow-indigo-950/25 transition-all flex items-center justify-center gap-3 cursor-pointer"
                            >
                              {isGoogleLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin text-teal-400" />
                              ) : (
                                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                                  <path
                                    fill="#4285F4"
                                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                                  />
                                  <path
                                    fill="#34A853"
                                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24z"
                                  />
                                  <path
                                    fill="#FBBC05"
                                    d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14z"
                                  />
                                  <path
                                    fill="#EA4335"
                                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96z"
                                  />
                                </svg>
                              )}
                              <span>
                                {isGoogleLoading
                                  ? 'Signing in & Unlocking Your Map...'
                                  : 'Continue with Google'}
                              </span>
                              {!isGoogleLoading && <ArrowRight className="w-4 h-4 text-amber-300" />}
                            </motion.button>

                            <button
                              type="button"
                              onClick={handleEmailSignupFallback}
                              className="text-xs font-bold text-indigo-700 hover:text-indigo-900 underline underline-offset-4 cursor-pointer"
                            >
                              Or sign up free with Email &amp; Password
                            </button>
                          </div>

                          {/* 3 Clean Checkmark Value Bullets */}
                          <ul className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-2 text-left text-xs font-semibold text-slate-700">
                            <li className="flex items-start gap-1.5">
                              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                              <span>Save &amp; tweak unlimited FIRE scenarios</span>
                            </li>
                            <li className="flex items-start gap-1.5">
                              <Check className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                              <span>Unlock full visa &amp; tax checklists for all {countries.length} countries</span>
                            </li>
                            <li className="flex items-start gap-1.5">
                              <Check className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                              <span>Generate your shareable Freedom Badge</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* ======================================================== */
                    /* AUTHENTICATED VIEW: FULL UNLOCKED REPORT + LIVE TABS     */
                    /* ======================================================== */
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setUnlockedTab('matches')}
                            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                              unlockedTab === 'matches'
                                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm'
                                : 'bg-indigo-50/70 text-indigo-800 hover:bg-indigo-100'
                            }`}
                          >
                            Top Matches (#1–#6)
                          </button>
                          <button
                            type="button"
                            onClick={() => setUnlockedTab('visa')}
                            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
                              unlockedTab === 'visa'
                                ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-sm'
                                : 'bg-teal-50/70 text-teal-800 hover:bg-teal-100'
                            }`}
                          >
                            <Stamp className="w-3.5 h-3.5" />
                            <span>Visa Income Check</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setUnlockedTab('inflation')}
                            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
                              unlockedTab === 'inflation'
                                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-sm'
                                : 'bg-amber-50/70 text-amber-900 hover:bg-amber-100'
                            }`}
                          >
                            <LineChart className="w-3.5 h-3.5" />
                            <span>10-Year Inflation Stress Test</span>
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => openBadgeModal()}
                          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 text-amber-900 border border-amber-200 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
                        >
                          <Award className="w-3.5 h-3.5 text-amber-600" />
                          <span>Freedom Badge</span>
                        </button>
                      </div>

                      {unlockedTab === 'matches' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                          {results.topMatches.slice(0, 6).map((match, idx) => (
                            <motion.button
                              key={match.country.id}
                              type="button"
                              whileHover={{ y: -2, scale: 1.01 }}
                              whileTap={{ scale: 0.99 }}
                              onClick={() => navigateToCountry(match.country.id)}
                              className="text-left p-4 rounded-2xl bg-gradient-to-br from-white via-white to-indigo-50/45 hover:to-teal-50/60 border border-indigo-200/80 hover:border-indigo-400 transition-all cursor-pointer space-y-2.5 group shadow-2xs"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-black text-indigo-700">
                                  #{idx + 1} Match
                                </span>
                                <span className="text-xs font-mono font-extrabold tabular-nums text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded-md">
                                  {match.matchPercent}% Fit
                                </span>
                              </div>
                              <div className="flex items-center gap-2.5">
                                <CountryFlag
                                  countryName={match.country.name}
                                  fallbackEmoji={match.country.flag}
                                  size="sm"
                                />
                                <div className="min-w-0">
                                  <div className="font-black text-slate-950 truncate group-hover:text-indigo-700 transition-colors">
                                    {match.country.name}
                                  </div>
                                  <div className="text-xs text-slate-500 truncate">
                                    {match.visaLabel}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                                <span className="font-mono font-extrabold tabular-nums text-slate-900">
                                  ${match.monthlyCostUSD.toLocaleString()}/mo
                                </span>
                                <span className="text-[11px] font-bold text-teal-700">
                                  {match.monthlySavingsVsBudgetUSD >= 0
                                    ? `Saves $${match.monthlySavingsVsBudgetUSD.toLocaleString()}/mo`
                                    : `+$${Math.abs(match.monthlySavingsVsBudgetUSD).toLocaleString()}/mo`}
                                </span>
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      )}

                      {unlockedTab === 'visa' && (
                        <div className="overflow-x-auto rounded-2xl border border-teal-200/80">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-teal-50/70 text-teal-900 uppercase text-[10px] font-extrabold tracking-wider">
                              <tr>
                                <th className="px-4 py-3">Destination</th>
                                <th className="px-4 py-3">Primary Visa Path</th>
                                <th className="px-4 py-3">Min Income / Mo</th>
                                <th className="px-4 py-3">Tax Regime</th>
                                <th className="px-4 py-3 text-right">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                              {results.topMatches.slice(0, 6).map(match => (
                                <tr
                                  key={match.country.id}
                                  onClick={() => navigateToCountry(match.country.id)}
                                  className="hover:bg-teal-50/40 cursor-pointer"
                                >
                                  <td className="px-4 py-3 font-extrabold text-slate-950 flex items-center gap-2">
                                    <CountryFlag
                                      countryName={match.country.name}
                                      fallbackEmoji={match.country.flag}
                                      size="xs"
                                    />
                                    <span>{match.country.name}</span>
                                  </td>
                                  <td className="px-4 py-3 font-semibold text-indigo-700">
                                    {match.visaLabel}
                                  </td>
                                  <td className="px-4 py-3 font-mono font-bold tabular-nums text-slate-900">
                                    {match.visaIncomeReqUSD > 0
                                      ? `$${match.visaIncomeReqUSD.toLocaleString()}/mo`
                                      : 'Flexible / Savings'}
                                  </td>
                                  <td className="px-4 py-3 text-slate-600 max-w-[180px] truncate">
                                    {match.taxSummary}
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                    <span
                                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-extrabold ${
                                        match.visaQualifies
                                          ? 'bg-emerald-50 text-emerald-700'
                                          : 'bg-amber-50 text-amber-800'
                                      }`}
                                    >
                                      <CheckCircle2 className="w-3 h-3" />
                                      <span>{match.visaQualifies ? 'Qualifies' : 'Stretch'}</span>
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {unlockedTab === 'inflation' && (
                        <div className="overflow-x-auto rounded-2xl border border-amber-200/80">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-amber-50/75 text-amber-900 uppercase text-[10px] font-extrabold tracking-wider">
                              <tr>
                                <th className="px-4 py-3">Destination</th>
                                <th className="px-4 py-3">2026 Cost / Mo</th>
                                <th className="px-4 py-3">2036 @ 3% Inflation</th>
                                <th className="px-4 py-3">2036 @ 5% Stress</th>
                                <th className="px-4 py-3 text-right">Budget Buffer</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                              {results.topMatches.slice(0, 6).map(match => {
                                const stillUnderAt3 = match.inflation10YrLowUSD <= quiz.monthlyBudgetUSD;
                                return (
                                  <tr
                                    key={match.country.id}
                                    onClick={() => navigateToCountry(match.country.id)}
                                    className="hover:bg-amber-50/40 cursor-pointer"
                                  >
                                    <td className="px-4 py-3 font-extrabold text-slate-950 flex items-center gap-2">
                                      <CountryFlag
                                        countryName={match.country.name}
                                        fallbackEmoji={match.country.flag}
                                        size="xs"
                                      />
                                      <span>{match.country.name}</span>
                                    </td>
                                    <td className="px-4 py-3 font-mono font-bold tabular-nums text-slate-900">
                                      ${match.monthlyCostUSD.toLocaleString()}/mo
                                    </td>
                                    <td className="px-4 py-3 font-mono font-bold tabular-nums text-teal-700">
                                      ${match.inflation10YrLowUSD.toLocaleString()}/mo
                                    </td>
                                    <td className="px-4 py-3 font-mono font-bold tabular-nums text-amber-700">
                                      ${match.inflation10YrHighUSD.toLocaleString()}/mo
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                      <span
                                        className={`px-2 py-0.5 rounded-md font-extrabold ${
                                          stillUnderAt3
                                            ? 'bg-emerald-50 text-emerald-700'
                                            : 'bg-amber-50 text-amber-800'
                                        }`}
                                      >
                                        {stillUnderAt3 ? 'Resilient' : 'Plan +Buffer'}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Subtle Secondary Navigation Strip Below Widget for Power Visitors */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-bold text-slate-600">
          <button
            type="button"
            onClick={() => onNavigateView('visa-check')}
            className="inline-flex items-center gap-1.5 hover:text-teal-700 transition-colors cursor-pointer py-1"
          >
            <Stamp className="w-3.5 h-3.5 text-teal-600" />
            <span>Global Visa Check (155+ Official Links)</span>
          </button>
          <span aria-hidden="true" className="text-slate-300 hidden sm:inline">•</span>
          <button
            type="button"
            onClick={onOpenExplorer}
            className="inline-flex items-center gap-1.5 hover:text-indigo-700 transition-colors cursor-pointer py-1"
          >
            <Globe className="w-3.5 h-3.5 text-indigo-600" />
            <span>Explore All {countries.length} Havens</span>
          </button>
          <span aria-hidden="true" className="text-slate-300 hidden sm:inline">•</span>
          <button
            type="button"
            onClick={() => onScrollTo('fire-calculator')}
            className="inline-flex items-center gap-1.5 hover:text-amber-700 transition-colors cursor-pointer py-1"
          >
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>FIRE Geo-Arbitrage Simulator</span>
          </button>
        </div>
      </div>
    </section>
  );
};
