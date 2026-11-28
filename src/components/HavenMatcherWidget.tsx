import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { Country, ClimateCategory, UserFinancialPortfolio } from '../types';
import { DEFAULT_FINANCIAL_PORTFOLIO, WORLD_COUNTRIES, getWorldCountryFlag } from '../data/userAccounts';
import { getCountryNomadProfile, CountryNomadProfile } from '../data/countryNomadProfiles';
import { CountryFlag } from './CountryFlag';
import {
  DEFAULT_FREEDOM_QUIZ_STATE,
  FREEDOM_PRIORITY_OPTIONS,
  FREEDOM_QUIZ_UPDATED_EVENT,
  FreedomCountryMatch,
  FreedomEscapePlan,
  FreedomPriorityId,
  FreedomQuizState,
  computeFreedomMapResults,
  loadFreedomQuizState,
  mapFreedomPrioritiesToClimate,
  mapFreedomQuizToPersona,
  normalizeFreedomQuizState,
  pickNewestFreedomQuizState,
} from '../utils/freedomMapQuiz';
import {
  Sparkles,
  ArrowRight,
  Heart,
  Check,
  Scale,
  Sun,
  DollarSign,
  Shield,
  SlidersHorizontal,
  Globe,
  Languages,
  TrendingUp,
  CheckCircle2,
  Search,
  Users,
  User,
  Coins,
  EyeOff,
  RotateCcw,
  Zap,
  Compass,
  Wifi,
  Coffee,
  Briefcase,
  Stamp,
  Flame,
  Wallet,
  HeartPulse,
  ShieldCheck,
  FileBadge,
  Plane,
  BadgeDollarSign,
  Waves,
  Palmtree,
  Mountain,
  CloudSun,
  Sunrise,
  LineChart,
  ChevronDown,
  ChevronUp,
  Info,
  type LucideIcon,
} from 'lucide-react';
import { CONTINENT_FILTER_OPTIONS, matchesContinentFilter } from '../utils/continents';

// European Union / EEA / Swiss nationality set for optional freedom-of-movement visa modifier
const EU_EEA_SWISS_COUNTRIES = new Set([
  'Austria', 'Belgium', 'Bulgaria', 'Croatia', 'Cyprus', 'Czech Republic',
  'Denmark', 'Estonia', 'Finland', 'France', 'Germany', 'Greece', 'Hungary',
  'Iceland', 'Ireland', 'Italy', 'Latvia', 'Liechtenstein', 'Lithuania',
  'Luxembourg', 'Malta', 'Netherlands', 'Norway', 'Poland', 'Portugal',
  'Romania', 'Slovakia', 'Slovenia', 'Spain', 'Sweden', 'Switzerland',
]);

const EU_HAVEN_IDS = new Set([
  'portugal', 'spain', 'greece', 'italy', 'france', 'cyprus', 'malta',
  'croatia', 'slovenia', 'ireland', 'bulgaria', 'hungary', 'austria',
  'switzerland', 'czech-republic', 'romania', 'poland', 'estonia', 'slovakia',
]);

const IBERO_LATAM_COUNTRIES = new Set([
  'Argentina', 'Bolivia', 'Brazil', 'Chile', 'Colombia', 'Costa Rica', 'Cuba',
  'Dominican Republic', 'Ecuador', 'El Salvador', 'Guatemala', 'Honduras',
  'Mexico', 'Nicaragua', 'Panama', 'Paraguay', 'Peru', 'Philippines',
  'Puerto Rico', 'Uruguay', 'Venezuela',
]);

const COMMONWEALTH_CANZUK_COUNTRIES = new Set([
  'United Kingdom', 'Canada', 'Australia', 'New Zealand', 'India', 'Singapore',
  'Malaysia', 'South Africa', 'Mauritius', 'Barbados', 'Bahamas', 'Fiji',
  'Saint Kitts and Nevis', 'Jamaica', 'Saint Lucia', 'Grenada', 'Antigua and Barbuda',
  'Bermuda', 'Cayman Islands', 'Seychelles',
]);

export type NomadWorkspaceFilter =
  | 'any'
  | 'world-class'
  | 'laptop-cafes'
  | 'strict-dnv-fit';

export type MatcherSortOption =
  | 'unified-rank'
  | 'cost-asc'
  | 'visa-income-asc'
  | 'internet-desc'
  | 'healthcare-desc'
  | 'safety-desc';

const NEST_EGG_PRESETS: Array<{
  label: string;
  value: number;
  activeGrad: string;
  idleStyle: string;
}> = [
  {
    label: '$25k',
    value: 25000,
    activeGrad: 'from-teal-600 to-emerald-600 text-white border-teal-500 shadow-xs',
    idleStyle: 'bg-white hover:bg-teal-50 text-slate-800 border-teal-200',
  },
  {
    label: '$100k',
    value: 100000,
    activeGrad: 'from-sky-600 to-blue-600 text-white border-sky-500 shadow-xs',
    idleStyle: 'bg-white hover:bg-sky-50 text-slate-800 border-sky-200',
  },
  {
    label: '$250k',
    value: 250000,
    activeGrad: 'from-indigo-600 to-violet-600 text-white border-indigo-500 shadow-xs',
    idleStyle: 'bg-white hover:bg-indigo-50 text-slate-800 border-indigo-200',
  },
  {
    label: '$500k',
    value: 500000,
    activeGrad: 'from-purple-600 to-fuchsia-600 text-white border-purple-500 shadow-xs',
    idleStyle: 'bg-white hover:bg-purple-50 text-slate-800 border-purple-200',
  },
  {
    label: '$1M+',
    value: 1000000,
    activeGrad: 'from-amber-500 to-orange-600 text-white border-amber-500 shadow-xs',
    idleStyle: 'bg-white hover:bg-amber-50 text-slate-800 border-amber-200',
  },
];

const ESCAPE_PLAN_CARDS: Array<{
  id: FreedomEscapePlan;
  title: string;
  shortDesc: string;
  icon: LucideIcon;
  activeGrad: string;
  idleStyle: string;
  iconIdle: string;
}> = [
  {
    id: 'full_fire',
    title: 'Full FIRE / Passive Income',
    shortDesc: 'Investments, dividends & pensions',
    icon: Sunrise,
    activeGrad: 'from-emerald-600 to-teal-600 text-white border-emerald-500 shadow-sm',
    idleStyle: 'bg-white hover:bg-emerald-50/80 text-slate-900 border-emerald-200',
    iconIdle: 'bg-emerald-100 text-emerald-700',
  },
  {
    id: 'coast_fire',
    title: 'Coast FIRE / Remote Work',
    shortDesc: 'Location-independent income + growth',
    icon: Briefcase,
    activeGrad: 'from-indigo-600 to-violet-600 text-white border-indigo-500 shadow-sm',
    idleStyle: 'bg-white hover:bg-indigo-50/80 text-slate-900 border-indigo-200',
    iconIdle: 'bg-indigo-100 text-indigo-700',
  },
  {
    id: 'mini_retirement',
    title: 'Mini-Retirement / Sabbatical',
    shortDesc: '1–3 year reset & flexible stays',
    icon: Palmtree,
    activeGrad: 'from-amber-500 to-orange-600 text-white border-amber-500 shadow-sm',
    idleStyle: 'bg-white hover:bg-amber-50/80 text-slate-900 border-amber-200',
    iconIdle: 'bg-amber-100 text-amber-700',
  },
];

interface PriorityCardVisual {
  icon: LucideIcon;
  activeGrad: string;
  idleStyle: string;
  iconBoxIdle: string;
}

const PRIORITY_CARD_STYLES: Record<FreedomPriorityId, PriorityCardVisual> = {
  'budget-asc': {
    icon: Wallet,
    activeGrad: 'from-emerald-600 to-teal-600 text-white border-emerald-500 shadow-xs',
    idleStyle: 'bg-white/95 hover:bg-emerald-50/90 text-slate-900 border-emerald-200/85',
    iconBoxIdle: 'bg-emerald-50 text-emerald-600',
  },
  'nomad-burn-asc': {
    icon: Flame,
    activeGrad: 'from-orange-500 to-amber-600 text-white border-orange-500 shadow-xs',
    idleStyle: 'bg-white/95 hover:bg-orange-50/90 text-slate-900 border-orange-200/85',
    iconBoxIdle: 'bg-orange-50 text-orange-600',
  },
  'healthcare-desc': {
    icon: HeartPulse,
    activeGrad: 'from-rose-600 to-pink-600 text-white border-rose-500 shadow-xs',
    idleStyle: 'bg-white/95 hover:bg-rose-50/90 text-slate-900 border-rose-200/85',
    iconBoxIdle: 'bg-rose-50 text-rose-600',
  },
  'safety-desc': {
    icon: ShieldCheck,
    activeGrad: 'from-indigo-600 to-blue-600 text-white border-indigo-500 shadow-xs',
    idleStyle: 'bg-white/95 hover:bg-indigo-50/90 text-slate-900 border-indigo-200/85',
    iconBoxIdle: 'bg-indigo-50 text-indigo-600',
  },
  'visa-difficulty-asc': {
    icon: Stamp,
    activeGrad: 'from-teal-600 to-cyan-600 text-white border-teal-500 shadow-xs',
    idleStyle: 'bg-white/95 hover:bg-teal-50/90 text-slate-900 border-teal-200/85',
    iconBoxIdle: 'bg-teal-50 text-teal-600',
  },
  'visa-income-asc': {
    icon: Coins,
    activeGrad: 'from-amber-500 to-orange-500 text-white border-amber-500 shadow-xs',
    idleStyle: 'bg-white/95 hover:bg-amber-50/90 text-slate-900 border-amber-200/85',
    iconBoxIdle: 'bg-amber-50 text-amber-600',
  },
  'dnv-friendly': {
    icon: FileBadge,
    activeGrad: 'from-indigo-600 to-violet-600 text-white border-indigo-500 shadow-xs',
    idleStyle: 'bg-white/95 hover:bg-violet-50/90 text-slate-900 border-violet-200/85',
    iconBoxIdle: 'bg-violet-50 text-violet-600',
  },
  'internet-speed-desc': {
    icon: Wifi,
    activeGrad: 'from-cyan-600 to-teal-600 text-white border-cyan-500 shadow-xs',
    idleStyle: 'bg-white/95 hover:bg-cyan-50/90 text-slate-900 border-cyan-200/85',
    iconBoxIdle: 'bg-cyan-50 text-cyan-600',
  },
  'coworking-friendly': {
    icon: Coffee,
    activeGrad: 'from-amber-500 to-orange-600 text-white border-amber-500 shadow-xs',
    idleStyle: 'bg-white/95 hover:bg-amber-50/90 text-slate-900 border-amber-200/85',
    iconBoxIdle: 'bg-amber-50 text-amber-600',
  },
  'travel-leisure-desc': {
    icon: Plane,
    activeGrad: 'from-sky-600 to-blue-600 text-white border-sky-500 shadow-xs',
    idleStyle: 'bg-white/95 hover:bg-sky-50/90 text-slate-900 border-sky-200/85',
    iconBoxIdle: 'bg-sky-50 text-sky-600',
  },
  'sunny-desc': {
    icon: Sun,
    activeGrad: 'from-orange-500 to-rose-500 text-white border-orange-500 shadow-xs',
    idleStyle: 'bg-white/95 hover:bg-orange-50/90 text-slate-900 border-orange-200/85',
    iconBoxIdle: 'bg-orange-50 text-orange-600',
  },
  'dating-nightlife-desc': {
    icon: Heart,
    activeGrad: 'from-pink-600 to-rose-600 text-white border-pink-500 shadow-xs',
    idleStyle: 'bg-white/95 hover:bg-pink-50/90 text-slate-900 border-pink-200/85',
    iconBoxIdle: 'bg-pink-50 text-pink-600',
  },
  'female-ratio-desc': {
    icon: Users,
    activeGrad: 'from-fuchsia-600 to-purple-600 text-white border-fuchsia-500 shadow-xs',
    idleStyle: 'bg-white/95 hover:bg-fuchsia-50/90 text-slate-900 border-fuchsia-200/85',
    iconBoxIdle: 'bg-fuchsia-50 text-fuchsia-600',
  },
  'zero-tax': {
    icon: BadgeDollarSign,
    activeGrad: 'from-emerald-600 to-green-600 text-white border-emerald-500 shadow-xs',
    idleStyle: 'bg-white/95 hover:bg-emerald-50/90 text-slate-900 border-emerald-200/85',
    iconBoxIdle: 'bg-emerald-50 text-emerald-600',
  },
  'climate-mediterranean': {
    icon: Waves,
    activeGrad: 'from-blue-600 to-cyan-600 text-white border-blue-500 shadow-xs',
    idleStyle: 'bg-white/95 hover:bg-blue-50/90 text-slate-900 border-blue-200/85',
    iconBoxIdle: 'bg-blue-50 text-blue-600',
  },
  'climate-tropical': {
    icon: Palmtree,
    activeGrad: 'from-teal-600 to-emerald-600 text-white border-teal-500 shadow-xs',
    idleStyle: 'bg-white/95 hover:bg-teal-50/90 text-slate-900 border-teal-200/85',
    iconBoxIdle: 'bg-teal-50 text-teal-600',
  },
  'climate-highlands': {
    icon: Mountain,
    activeGrad: 'from-violet-600 to-indigo-600 text-white border-violet-500 shadow-xs',
    idleStyle: 'bg-white/95 hover:bg-violet-50/90 text-slate-900 border-violet-200/85',
    iconBoxIdle: 'bg-violet-50 text-violet-600',
  },
  'climate-temperate': {
    icon: CloudSun,
    activeGrad: 'from-sky-600 to-indigo-600 text-white border-sky-500 shadow-xs',
    idleStyle: 'bg-white/95 hover:bg-sky-50/90 text-slate-900 border-sky-200/85',
    iconBoxIdle: 'bg-sky-50 text-sky-600',
  },
};

const GROUP_STYLES: Record<
  'Core & Financial' | 'Lifestyle & Nomad' | 'Climate & Tax',
  { container: string; headerText: string; dotColor: string }
> = {
  'Core & Financial': {
    container: 'bg-gradient-to-br from-emerald-50/50 via-white to-indigo-50/40 border-emerald-200/75',
    headerText: 'text-emerald-800',
    dotColor: 'bg-emerald-500',
  },
  'Lifestyle & Nomad': {
    container: 'bg-gradient-to-br from-indigo-50/50 via-white to-rose-50/40 border-indigo-200/75',
    headerText: 'text-indigo-800',
    dotColor: 'bg-indigo-500',
  },
  'Climate & Tax': {
    container: 'bg-gradient-to-br from-amber-50/55 via-white to-teal-50/40 border-amber-200/75',
    headerText: 'text-amber-800',
    dotColor: 'bg-amber-500',
  },
};

const PRIORITY_GROUPS: Array<'Core & Financial' | 'Lifestyle & Nomad' | 'Climate & Tax'> = [
  'Core & Financial',
  'Lifestyle & Nomad',
  'Climate & Tax',
];

function formatNestEggCompact(value: number): string {
  if (value >= 1000000) {
    return value === 1000000 ? '$1M+' : `$${(value / 1000000).toFixed(2).replace(/\.00$/, '')}M`;
  }
  return `$${value.toLocaleString()}`;
}

function formatGrade(score: number): 'A+' | 'A' | 'B+' | 'B' | 'C' {
  if (score >= 90) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B+';
  if (score >= 60) return 'B';
  return 'C';
}

function getGradeBadgeClass(grade: 'A+' | 'A' | 'B+' | 'B' | 'C'): string {
  switch (grade) {
    case 'A+':
      return 'bg-emerald-50 text-emerald-800 border-emerald-300';
    case 'A':
      return 'bg-teal-50 text-teal-800 border-teal-300';
    case 'B+':
      return 'bg-blue-50 text-blue-800 border-blue-200';
    case 'B':
      return 'bg-amber-50 text-amber-800 border-amber-200';
    default:
      return 'bg-rose-50 text-rose-800 border-rose-200';
  }
}

export const HavenMatcherWidget: React.FC = () => {
  const {
    countries,
    userProfile,
    updateUserProfile,
    saveFreedomMapQuiz,
    navigateToCountry,
    isCountrySaved,
    toggleSaveCountry,
    isCountryCompared,
    toggleCompareCountry,
    openEditProfile,
    ignoredCountryIds,
    toggleIgnoreCountry,
    isCountryIgnored,
    restoreCountry,
    currentPersona,
    setCurrentPersona,
  } = useApp();

  // Active user finances
  const finances: UserFinancialPortfolio = useMemo(() => {
    return userProfile.finances || DEFAULT_FINANCIAL_PORTFOLIO;
  }, [userProfile.finances]);

  const savings = finances.investments?.savingsUSD || 0;
  const stocks = finances.investments?.stocksMutualFundsUSD || 0;
  const realEstate = finances.investments?.realEstateUSD || 0;
  const gold = finances.investments?.goldUSD || 0;
  const others = finances.investments?.othersUSD || 0;
  const liabilities = finances.totalLiabilitiesUSD || 0;
  const totalNetWorth = Math.max(0, savings + stocks + realEstate + gold + others - liabilities);
  const stocksAndSavingsLiquid = savings + stocks;
  const monthlySalary = finances.monthlySalaryUSD || Math.round((finances.currentSalaryUSD || 0) / 12);
  const passiveMonthlyIncome = finances.additionalMonthlyPassiveUSD || 0;

  // ===========================================================================
  // 1. UNIFIED HOMEPAGE FREEDOM MAP PARAMETERS (SINGLE SOURCE OF TRUTH)
  // ===========================================================================
  const buildFallbackQuizFromProfile = (): FreedomQuizState => {
    const profileNestEgg = stocksAndSavingsLiquid > 0 ? stocksAndSavingsLiquid : totalNetWorth > 0 ? totalNetWorth : DEFAULT_FREEDOM_QUIZ_STATE.nestEggUSD;
    return {
      nestEggUSD: Math.max(0, Math.min(1500000, profileNestEgg)),
      monthlyBudgetUSD: Math.max(1000, Math.min(10000, userProfile.monthlyBudgetUSD || DEFAULT_FREEDOM_QUIZ_STATE.monthlyBudgetUSD)),
      household: 'solo',
      escapePlan: currentPersona === 'retiree' ? 'full_fire' : 'coast_fire',
      priorities: DEFAULT_FREEDOM_QUIZ_STATE.priorities,
      completedReveal: true,
      updatedAt: new Date().toISOString(),
    };
  };

  const [quizState, setQuizState] = useState<FreedomQuizState>(() => {
    return (
      pickNewestFreedomQuizState(userProfile.freedomMapQuiz, loadFreedomQuizState()) ||
      buildFallbackQuizFromProfile()
    );
  });

  // Hydrate immediately whenever cloud-synced userProfile.freedomMapQuiz arrives from another browser/device
  useEffect(() => {
    const cloudQuiz = normalizeFreedomQuizState(userProfile.freedomMapQuiz);
    if (!cloudQuiz) return;
    setQuizState(prev => {
      const newest = pickNewestFreedomQuizState(cloudQuiz, prev);
      if (!newest) return prev;
      if (
        prev.updatedAt === newest.updatedAt &&
        prev.nestEggUSD === newest.nestEggUSD &&
        prev.monthlyBudgetUSD === newest.monthlyBudgetUSD &&
        prev.household === newest.household &&
        prev.escapePlan === newest.escapePlan &&
        prev.priorities.join(',') === newest.priorities.join(',')
      ) {
        return prev;
      }
      return newest;
    });
  }, [userProfile.freedomMapQuiz]);

  // Listen for live updates if changed from Homepage Freedom Map Quiz
  useEffect(() => {
    const handleExternalUpdate = (e: Event) => {
      const custom = e as CustomEvent<FreedomQuizState | null>;
      if (!custom.detail) return;
      const incoming = normalizeFreedomQuizState(custom.detail);
      if (incoming) {
        setQuizState(prev =>
          prev.updatedAt === incoming.updatedAt ? prev : incoming
        );
      }
    };
    window.addEventListener(FREEDOM_QUIZ_UPDATED_EVENT, handleExternalUpdate);
    return () => window.removeEventListener(FREEDOM_QUIZ_UPDATED_EVENT, handleExternalUpdate);
  }, []);

  const updateUnifiedQuiz = (updater: (prev: FreedomQuizState) => FreedomQuizState) => {
    setQuizState(prev => {
      const next: FreedomQuizState = {
        ...updater(prev),
        completedReveal: true,
        updatedAt: new Date().toISOString(),
      };
      saveFreedomMapQuiz(next);
      return next;
    });
  };

  const handleTogglePriority = (priorityId: FreedomPriorityId) => {
    updateUnifiedQuiz(prev => {
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

  const handleSelectEscapePlan = (plan: FreedomEscapePlan) => {
    updateUnifiedQuiz(prev => ({ ...prev, escapePlan: plan }));
    const mappedPersona = mapFreedomQuizToPersona(plan);
    if (mappedPersona !== currentPersona) {
      setCurrentPersona(mappedPersona);
    }
  };

  const isNomadMode = quizState.escapePlan !== 'full_fire';

  // ===========================================================================
  // 2. OPTIONAL EXTRA DASHBOARD MODIFIERS (ALL UNCHECKED BY DEFAULT!)
  // Leaving all 4 unchecked guarantees 100% identical country order & Match %
  // with the Homepage Freedom Map Quiz. Users can opt-in to any extra filter.
  // ===========================================================================
  const [enableNationalityModifier, setEnableNationalityModifier] = useState<boolean>(false);
  const [enableLanguageModifier, setEnableLanguageModifier] = useState<boolean>(false);
  const [enableClimateOverride, setEnableClimateOverride] = useState<boolean>(false);
  const [enableAdvancedFinancialRules, setEnableAdvancedFinancialRules] = useState<boolean>(false);
  const [showPrioritiesPanel, setShowPrioritiesPanel] = useState<boolean>(true);
  const [showModifiersPanel, setShowModifiersPanel] = useState<boolean>(false);

  // Optional modifier values (only applied when their checkbox above is checked)
  const [interactiveNationality, setInteractiveNationality] = useState<string>(userProfile.originCountry || 'United States');
  const [interactiveClimate, setInteractiveClimate] = useState<ClimateCategory | 'Any'>(userProfile.preferredClimate || 'Any');
  const [safeWithdrawalRate, setSafeWithdrawalRate] = useState<number>(finances.safeWithdrawalRatePercent || 4.0);
  const [nomadRemoteIncomeUSD, setNomadRemoteIncomeUSD] = useState<number>(() => {
    const combined = monthlySalary + passiveMonthlyIncome;
    return combined > 0 ? Math.min(8000, Math.max(500, Math.round(combined / 100) * 100)) : 3500;
  });
  const [minInternetSpeedMbps, setMinInternetSpeedMbps] = useState<number>(50);
  const [nomadWorkspaceFilter, setNomadWorkspaceFilter] = useState<NomadWorkspaceFilter>('any');

  const activeModifierCount =
    (enableNationalityModifier ? 1 : 0) +
    (enableLanguageModifier ? 1 : 0) +
    (enableClimateOverride ? 1 : 0) +
    (enableAdvancedFinancialRules ? 1 : 0);

  const handleResetToHomepageLogic = () => {
    setEnableNationalityModifier(false);
    setEnableLanguageModifier(false);
    setEnableClimateOverride(false);
    setEnableAdvancedFinancialRules(false);
    setNomadWorkspaceFilter('any');
    setMatcherSortBy('unified-rank');
  };

  // Scope, Sort, Continent & Search Controls
  const [scopeTab, setScopeTab] = useState<'top' | 'shortlist' | 'target' | 'all' | 'ignored'>('top');
  const [recentlyDiscardedCountry, setRecentlyDiscardedCountry] = useState<{ id: string; name: string } | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [matcherSortBy, setMatcherSortBy] = useState<MatcherSortOption>('unified-rank');
  const [savedBannerMsg, setSavedBannerMsg] = useState<string | null>(null);

  const climateOptions: (ClimateCategory | 'Any')[] = [
    'Any',
    'Mediterranean',
    'Tropical',
    'Subtropical',
    'Temperate',
    'Highlands / Mild',
  ];

  // ===========================================================================
  // 3. UNIFIED COMPUTATION ENGINE (100% IDENTICAL BASE TO HOMEPAGE QUIZ)
  // ===========================================================================
  const freedomResults = useMemo(
    () => computeFreedomMapResults(countries, quizState),
    [countries, quizState]
  );

  // Optional nationality bilateral treaty helper (only active if checkbox checked)
  const computeNationalityModifier = (country: Country, visaLabel: string) => {
    const nat = interactiveNationality.trim();
    const isUserEuCitizen = EU_EEA_SWISS_COUNTRIES.has(nat);
    const isDestinationEu = EU_HAVEN_IDS.has(country.id);
    const isDestinationOwnCountry = country.name.toLowerCase() === nat.toLowerCase();

    if (isDestinationOwnCountry) {
      return { delta: 6, note: `Citizen of ${country.name} — Zero visa required (+6 pts)` };
    }
    if (isUserEuCitizen && isDestinationEu) {
      return { delta: 6, note: `EU/EEA Freedom of Movement for ${nat} passport (+6 pts)` };
    }
    if (nat === 'India' && country.id === 'nepal') {
      return { delta: 6, note: `Indo-Nepal Treaty — Visa-free residency (+6 pts)` };
    }
    if (
      nat === 'India' &&
      ['mauritius', 'thailand', 'malaysia', 'sri-lanka', 'indonesia', 'singapore', 'philippines', 'vietnam', 'cambodia', 'united-arab-emirates', 'seychelles', 'fiji'].includes(country.id)
    ) {
      return { delta: 4, note: `Fast-track Visa / e-Visa corridor for ${nat} nationals (+4 pts)` };
    }
    if (nat === 'United States' && ['albania', 'georgia'].includes(country.id)) {
      return { delta: 5, note: `365-day visa-free stay for US passport (+5 pts)` };
    }
    if (
      nat === 'United States' &&
      ['panama', 'mexico', 'costa-rica', 'belize', 'barbados', 'bahamas', 'curacao', 'el-salvador', 'aruba', 'cayman-islands', 'bermuda'].includes(country.id)
    ) {
      return { delta: 4, note: `Preferred US bilateral corridor & time-zone alignment (+4 pts)` };
    }
    if (IBERO_LATAM_COUNTRIES.has(nat) && ['spain', 'portugal'].includes(country.id)) {
      return { delta: 5, note: `Fast-track 2-yr EU Citizenship path for ${nat} nationals (+5 pts)` };
    }
    if (COMMONWEALTH_CANZUK_COUNTRIES.has(nat) && ['australia', 'new-zealand', 'malta', 'cyprus', 'mauritius', 'barbados', 'malaysia'].includes(country.id)) {
      return { delta: 3, note: `Commonwealth reciprocal familiarity for ${nat} nationals (+3 pts)` };
    }
    return { delta: 0, note: `Standard ${visaLabel} process for ${nat} passport (0 pts)` };
  };

  // Enrich every country from freedomResults.allRanked with optional modifier deltas (0 when unchecked!)
  interface EnrichedHavenMatch {
    baseMatch: FreedomCountryMatch;
    nomadProfile: CountryNomadProfile;
    homepageRank: number;
    effectiveScore: number;
    overallGrade: 'A+' | 'A' | 'B+' | 'B' | 'C';
    overallBadgeClass: string;
    modifierDelta: number;
    modifierNotes: string[];
    runwayYearsAtHaven: number;
    swrMonthlyAtNestEgg: number;
  }

  const allRankedAnalyses: EnrichedHavenMatch[] = useMemo(() => {
    const swrRate = enableAdvancedFinancialRules ? safeWithdrawalRate : 4.0;
    const swrMonthlyAtNestEgg = Math.round((quizState.nestEggUSD * (swrRate / 100)) / 12);
    const userLangs = userProfile.languagesKnown || [{ id: 'en', language: 'English', proficiency: 'Native' }];
    const speaksEnglish = userLangs.some(l => l.language.toLowerCase() === 'english');

    const enriched: EnrichedHavenMatch[] = freedomResults.allRanked.map((baseMatch, idx) => {
      const { country } = baseMatch;
      const nomadProfile = getCountryNomadProfile(country);
      let modifierDelta = 0;
      const modifierNotes: string[] = [];

      // Optional Modifier 1: Passport / Nationality Treaty Bonus
      if (enableNationalityModifier) {
        const natRes = computeNationalityModifier(country, baseMatch.visaLabel);
        modifierDelta += natRes.delta;
        modifierNotes.push(natRes.note);
      }

      // Optional Modifier 2: Known Languages & English Fluency
      if (enableLanguageModifier) {
        const countryLangLower = country.language.toLowerCase();
        const matchedLang = userLangs.find(
          l =>
            countryLangLower.includes(l.language.toLowerCase()) ||
            l.language.toLowerCase().includes(countryLangLower.split(' ')[0].replace(/[^a-z]/g, ''))
        );
        if (matchedLang) {
          modifierDelta += 4;
          modifierNotes.push(`Speaks local language (${matchedLang.language}) (+4 pts)`);
        } else if (speaksEnglish && country.lifestyle.englishProficiency === 'Very High') {
          modifierDelta += 3;
          modifierNotes.push(`Very High English fluency nationwide (+3 pts)`);
        } else if (speaksEnglish && country.lifestyle.englishProficiency === 'High') {
          modifierDelta += 1;
          modifierNotes.push(`High English fluency in expat hubs (+1 pt)`);
        } else if (country.lifestyle.englishProficiency === 'Low') {
          modifierDelta -= 3;
          modifierNotes.push(`Local language (${country.language}) recommended (-3 pts)`);
        }
      }

      // Optional Modifier 3: Custom Climate Zone Override
      if (enableClimateOverride && interactiveClimate !== 'Any') {
        if (country.climate.category === interactiveClimate) {
          modifierDelta += 5;
          modifierNotes.push(`Exact ${interactiveClimate} climate match (+5 pts)`);
        } else {
          modifierDelta -= 4;
          modifierNotes.push(`${country.climate.category} differs from ${interactiveClimate} (-4 pts)`);
        }
      }

      // Optional Modifier 4: Advanced Solvency / Remote Income / Fiber Speed Rules
      if (enableAdvancedFinancialRules) {
        if (nomadProfile.verifiedInternetMbps < minInternetSpeedMbps) {
          modifierDelta -= 5;
          modifierNotes.push(
            `Fiber ${nomadProfile.verifiedInternetMbps} Mbps below ${minInternetSpeedMbps} Mbps min (-5 pts)`
          );
        } else if (nomadProfile.verifiedInternetMbps >= Math.max(150, minInternetSpeedMbps)) {
          modifierDelta += 2;
          modifierNotes.push(`Fast ${nomadProfile.verifiedInternetMbps} Mbps verified fiber (+2 pts)`);
        }
        if (isNomadMode && baseMatch.visaIncomeReqUSD > 0) {
          if (nomadRemoteIncomeUSD >= baseMatch.visaIncomeReqUSD) {
            modifierDelta += 3;
            modifierNotes.push(`Remote income ($${nomadRemoteIncomeUSD.toLocaleString()}/mo) clears DNV floor (+3 pts)`);
          } else {
            modifierDelta -= 4;
            modifierNotes.push(`Remote income short of $${baseMatch.visaIncomeReqUSD.toLocaleString()}/mo DNV floor (-4 pts)`);
          }
        }
      }

      const effectiveScore =
        activeModifierCount === 0
          ? baseMatch.matchPercent
          : Math.max(45, Math.min(99, baseMatch.matchPercent + modifierDelta));

      const overallGrade = formatGrade(effectiveScore);
      const annualCost = Math.max(1, baseMatch.monthlyCostUSD * 12);
      const runwayYearsAtHaven = Math.round((quizState.nestEggUSD / annualCost) * 10) / 10;

      return {
        baseMatch,
        nomadProfile,
        homepageRank: idx + 1,
        effectiveScore,
        overallGrade,
        overallBadgeClass: getGradeBadgeClass(overallGrade),
        modifierDelta,
        modifierNotes,
        runwayYearsAtHaven,
        swrMonthlyAtNestEgg,
      };
    });

    // If zero optional modifiers & unified-rank sort, keep 100% EXACT homepage order!
    if (matcherSortBy === 'unified-rank' && activeModifierCount === 0) {
      return enriched;
    }

    return [...enriched].sort((a, b) => {
      if (matcherSortBy === 'cost-asc') {
        if (a.baseMatch.monthlyCostUSD !== b.baseMatch.monthlyCostUSD) {
          return a.baseMatch.monthlyCostUSD - b.baseMatch.monthlyCostUSD;
        }
        return b.effectiveScore - a.effectiveScore;
      }
      if (matcherSortBy === 'visa-income-asc') {
        if (a.baseMatch.visaIncomeReqUSD !== b.baseMatch.visaIncomeReqUSD) {
          return a.baseMatch.visaIncomeReqUSD - b.baseMatch.visaIncomeReqUSD;
        }
        return b.effectiveScore - a.effectiveScore;
      }
      if (matcherSortBy === 'internet-desc') {
        if (b.nomadProfile.verifiedInternetMbps !== a.nomadProfile.verifiedInternetMbps) {
          return b.nomadProfile.verifiedInternetMbps - a.nomadProfile.verifiedInternetMbps;
        }
        return b.effectiveScore - a.effectiveScore;
      }
      if (matcherSortBy === 'healthcare-desc') {
        if (b.baseMatch.country.lifestyle.healthcareScore !== a.baseMatch.country.lifestyle.healthcareScore) {
          return b.baseMatch.country.lifestyle.healthcareScore - a.baseMatch.country.lifestyle.healthcareScore;
        }
        return b.effectiveScore - a.effectiveScore;
      }
      if (matcherSortBy === 'safety-desc') {
        if (b.baseMatch.country.lifestyle.safetyScore !== a.baseMatch.country.lifestyle.safetyScore) {
          return b.baseMatch.country.lifestyle.safetyScore - a.baseMatch.country.lifestyle.safetyScore;
        }
        return b.effectiveScore - a.effectiveScore;
      }
      // Unified rank with optional modifiers applied
      if (a.baseMatch.visaQualifies !== b.baseMatch.visaQualifies) {
        return a.baseMatch.visaQualifies ? -1 : 1;
      }
      if (b.effectiveScore !== a.effectiveScore) return b.effectiveScore - a.effectiveScore;
      return a.baseMatch.monthlyCostUSD - b.baseMatch.monthlyCostUSD;
    });
  }, [
    freedomResults.allRanked,
    quizState.nestEggUSD,
    enableNationalityModifier,
    enableLanguageModifier,
    enableClimateOverride,
    enableAdvancedFinancialRules,
    interactiveNationality,
    interactiveClimate,
    safeWithdrawalRate,
    nomadRemoteIncomeUSD,
    minInternetSpeedMbps,
    isNomadMode,
    activeModifierCount,
    matcherSortBy,
    userProfile.languagesKnown,
  ]);

  // Apply scope, workspace filter (only when advanced financial rules checked), continent, ignore, search
  const displayedAnalyses = useMemo(() => {
    let list = allRankedAnalyses.map((item, idx) => ({
      ...item,
      displayRank: idx + 1,
    }));

    if (scopeTab === 'ignored') {
      list = list.filter(item => ignoredCountryIds.includes(item.baseMatch.country.id));
    } else {
      list = list.filter(item => !ignoredCountryIds.includes(item.baseMatch.country.id));

      if (scopeTab === 'shortlist') {
        const saved = list.filter(item => userProfile.savedCountryIds.includes(item.baseMatch.country.id));
        list = saved.length > 0 ? saved : list.slice(0, 10);
      } else if (scopeTab === 'target') {
        const target = list.filter(
          item => item.baseMatch.country.name.toLowerCase() === userProfile.targetCountry.toLowerCase()
        );
        list = target.length > 0 ? target : list.slice(0, 1);
      }
    }

    if (enableAdvancedFinancialRules && scopeTab !== 'ignored' && scopeTab !== 'target') {
      if (nomadWorkspaceFilter === 'world-class') {
        list = list.filter(
          item =>
            item.nomadProfile.coworkingDensity === 'World-Class Nomad Hub' ||
            item.nomadProfile.coworkingDensity === 'Abundant & Vibrant'
        );
      } else if (nomadWorkspaceFilter === 'laptop-cafes') {
        list = list.filter(
          item =>
            item.nomadProfile.cafeWorkCulture === 'Legendary Laptop Friendly' ||
            item.nomadProfile.cafeWorkCulture === 'Widely Welcomed'
        );
      } else if (nomadWorkspaceFilter === 'strict-dnv-fit') {
        list = list.filter(
          item => item.baseMatch.visaIncomeReqUSD === 0 || nomadRemoteIncomeUSD >= item.baseMatch.visaIncomeReqUSD
        );
      }
    }

    if (selectedRegion !== 'All') {
      list = list.filter(item => matchesContinentFilter(item.baseMatch.country, selectedRegion));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        item =>
          item.baseMatch.country.name.toLowerCase().includes(q) ||
          item.baseMatch.country.capital.toLowerCase().includes(q) ||
          item.baseMatch.visaLabel.toLowerCase().includes(q) ||
          item.nomadProfile.topNomadCities.some(city => city.toLowerCase().includes(q)) ||
          item.baseMatch.country.language.toLowerCase().includes(q)
      );
    }

    if (scopeTab === 'top' && !searchQuery.trim() && selectedRegion === 'All' && (!enableAdvancedFinancialRules || nomadWorkspaceFilter === 'any')) {
      return list.slice(0, 10);
    }

    return list;
  }, [
    allRankedAnalyses,
    scopeTab,
    enableAdvancedFinancialRules,
    nomadWorkspaceFilter,
    nomadRemoteIncomeUSD,
    selectedRegion,
    searchQuery,
    userProfile.savedCountryIds,
    userProfile.targetCountry,
    ignoredCountryIds,
  ]);

  const handleSaveScenarioToProfile = () => {
    const finalizedQuiz: FreedomQuizState = {
      ...quizState,
      completedReveal: true,
      updatedAt: new Date().toISOString(),
    };
    saveFreedomMapQuiz(finalizedQuiz, { immediate: true });
    const topMatchName = freedomResults.topMatch?.country.name || userProfile.targetCountry;
    const top4Ids = freedomResults.topMatches.slice(0, 4).map(m => m.country.id);
    const mergedSaved = Array.from(new Set([...top4Ids, ...(userProfile.savedCountryIds || [])]));
    const mappedClimate = enableClimateOverride
      ? interactiveClimate
      : mapFreedomPrioritiesToClimate(quizState.priorities);

    updateUserProfile({
      monthlyBudgetUSD: quizState.monthlyBudgetUSD,
      targetCountry: topMatchName,
      savedCountryIds: mergedSaved,
      preferredClimate: mappedClimate !== 'Any' ? mappedClimate : userProfile.preferredClimate,
      originCountry: enableNationalityModifier ? interactiveNationality : userProfile.originCountry,
      relocationStatus: quizState.escapePlan === 'full_fire' ? 'Early Retired (FIRE)' : 'Exploring Options',
      freedomMapQuiz: finalizedQuiz,
      finances: {
        ...finances,
        monthlyCurrentExpensesUSD: quizState.monthlyBudgetUSD,
        monthlyRetirementExpensesUSD: quizState.monthlyBudgetUSD,
        safeWithdrawalRatePercent: enableAdvancedFinancialRules ? safeWithdrawalRate : 4.0,
        investments: {
          savingsUSD: Math.round(quizState.nestEggUSD * 0.25),
          stocksMutualFundsUSD: Math.round(quizState.nestEggUSD * 0.75),
          realEstateUSD: 0,
          goldUSD: 0,
          othersUSD: 0,
        },
        updatedAt: new Date().toISOString().split('T')[0],
      },
    });
    setCurrentPersona(mapFreedomQuizToPersona(quizState.escapePlan));
    setSavedBannerMsg('Saved & cloud-synced across all your devices, profile, and homepage Freedom Map!');
    window.setTimeout(() => setSavedBannerMsg(null), 3500);
  };

  return (
    <section className="relative overflow-hidden rounded-3xl border border-indigo-200/85 bg-gradient-to-br from-sky-50/75 via-white to-teal-50/75 p-5 sm:p-7 shadow-md space-y-5">
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-600 via-teal-500 via-55% to-amber-500" />
      <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-teal-400/12 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-indigo-400/12 blur-3xl" />

      {/* ===================================================================== */}
      {/* TOP HEADER & HOMEPAGE PARITY STATUS                                   */}
      {/* ===================================================================== */}
      <div className="relative flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-4 border-b border-indigo-100">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 via-teal-500 to-amber-500 flex items-center justify-center text-white shadow-sm shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-slate-950 tracking-tight">
                Haven Matcher{' '}
                <span className="bg-gradient-to-r from-indigo-600 via-teal-600 to-amber-600 bg-clip-text text-transparent">
                  AI Recommendation &amp; Financial Potential Engine
                </span>
              </h2>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                  activeModifierCount === 0
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-amber-50 text-amber-900 border-amber-200'
                }`}
              >
                {activeModifierCount === 0
                  ? `✓ Synced 1:1 with Homepage Ranking · ${countries.length} Havens`
                  : `${activeModifierCount} Optional Modifier${activeModifierCount > 1 ? 's' : ''} Active`}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Powered by the exact same 4-step Freedom Map logic used on the homepage — showing your exact financial runway, qualifying visa pathways, and transparent scoring breakdown for every country.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleSaveScenarioToProfile}
            className="px-3.5 py-2 text-xs font-extrabold rounded-xl bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-500 hover:to-teal-500 text-white shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Save Preferences to Profile</span>
          </button>
          <button
            type="button"
            onClick={() => openEditProfile('finances')}
            className="px-3.5 py-2 text-xs font-bold rounded-xl bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <DollarSign className="w-3.5 h-3.5 text-amber-600" />
            <span>Portfolio Ledger</span>
          </button>
        </div>
      </div>

      {savedBannerMsg && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{savedBannerMsg}</span>
        </div>
      )}

      {/* ===================================================================== */}
      {/* LIVE FREEDOM MAP KPI SUMMARY STRIP (IDENTICAL TO HOMEPAGE)            */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-50/90 via-white to-violet-50/60 border border-indigo-200/80">
          <span className="text-[10px] font-extrabold text-indigo-700 uppercase tracking-wider block">
            Estimated Financial Runway
          </span>
          <div className="font-mono tabular-nums font-black text-sm sm:text-base text-indigo-950 mt-0.5 truncate">
            {freedomResults.runwayShortLabel}
          </div>
          <span className="text-[10px] text-slate-600 block truncate mt-0.5">
            {formatNestEggCompact(quizState.nestEggUSD)} saved · ${freedomResults.safeMonthlyWithdrawalUSD.toLocaleString()}/mo @ 4% SWR
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-teal-50/90 via-white to-emerald-50/60 border border-teal-200/80">
          <span className="text-[10px] font-extrabold text-teal-700 uppercase tracking-wider block">
            Countries You Qualify For
          </span>
          <div className="font-mono tabular-nums font-black text-sm sm:text-base text-teal-800 mt-0.5">
            {freedomResults.qualifyingCount} of {countries.length} Countries
          </div>
          <span className="text-[10px] text-slate-600 block truncate mt-0.5">
            ${quizState.monthlyBudgetUSD.toLocaleString()}/mo ({quizState.household === 'couple' ? 'Couple / Family' : 'Solo'})
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-50/90 via-white to-orange-50/60 border border-amber-200/80">
          <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wider block">
            #1 Top Ranked Match
          </span>
          <div className="font-black text-sm sm:text-base text-slate-950 mt-0.5 truncate flex items-center gap-1.5">
            {allRankedAnalyses[0] && (
              <>
                <CountryFlag
                  countryName={allRankedAnalyses[0].baseMatch.country.name}
                  fallbackEmoji={allRankedAnalyses[0].baseMatch.country.flag}
                  size="xs"
                />
                <span className="truncate">{allRankedAnalyses[0].baseMatch.country.name}</span>
                <span className="font-mono text-xs text-emerald-700">
                  {allRankedAnalyses[0].effectiveScore}%
                </span>
              </>
            )}
          </div>
          <span className="text-[10px] text-slate-600 block truncate mt-0.5">
            {allRankedAnalyses[0]?.baseMatch.visaLabel}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-rose-50/85 via-white to-indigo-50/55 border border-rose-200/80">
          <span className="text-[10px] font-extrabold text-rose-700 uppercase tracking-wider block">
            Active Priorities (Up to 2)
          </span>
          <div className="font-extrabold text-xs text-slate-900 mt-1 truncate">
            {quizState.priorities.length > 0
              ? quizState.priorities
                  .map(id => FREEDOM_PRIORITY_OPTIONS.find(p => p.id === id)?.label || id)
                  .join(' · ')
              : 'Lowest Cost · Healthcare'}
          </div>
          <span className="text-[10px] text-indigo-700 font-semibold block truncate mt-0.5">
            Escape Plan:{' '}
            {quizState.escapePlan === 'full_fire'
              ? 'Full FIRE / Passive'
              : quizState.escapePlan === 'coast_fire'
                ? 'Coast FIRE / Remote'
                : 'Mini-Retirement'}
          </span>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* UNIFIED 4-STEP HOMEPAGE PARAMETERS CONTROL CONSOLE                    */}
      {/* ===================================================================== */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white/95 border border-indigo-200/80 shadow-2xs space-y-4 text-xs">
        {/* Row 1: Step 1 (Nest Egg) + Step 2 (Monthly Budget & Household) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Parameter 1: Nest Egg */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-50/75 via-white to-amber-50/45 border border-indigo-200/75 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-800">
                1. Nest Egg (Saved / Invested)
              </span>
              <span className="font-mono tabular-nums font-black text-base text-indigo-700">
                {formatNestEggCompact(quizState.nestEggUSD)}
              </span>
            </div>
            <input
              type="range"
              aria-label="Nest Egg Saved or Invested"
              min={0}
              max={1500000}
              step={5000}
              value={Math.min(1500000, quizState.nestEggUSD)}
              onChange={e =>
                updateUnifiedQuiz(prev => ({ ...prev, nestEggUSD: Number(e.target.value) }))
              }
              className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-indigo-600 bg-indigo-100"
            />
            <div className="grid grid-cols-5 gap-1.5">
              {NEST_EGG_PRESETS.map(preset => {
                const isSelected =
                  preset.value === 1000000
                    ? quizState.nestEggUSD >= 1000000
                    : quizState.nestEggUSD === preset.value;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() =>
                      updateUnifiedQuiz(prev => ({ ...prev, nestEggUSD: preset.value }))
                    }
                    className={`py-1.5 px-1 rounded-lg border font-mono text-[11px] font-extrabold transition-all cursor-pointer ${
                      isSelected ? `bg-gradient-to-r ${preset.activeGrad}` : preset.idleStyle
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Parameter 2: Monthly Living Budget + Solo/Couple Toggle */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-teal-50/75 via-white to-emerald-50/50 border border-teal-200/75 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-teal-800">
                2. Monthly Budget &amp; Household
              </span>
              <div className="flex items-center gap-2">
                <div className="inline-flex p-0.5 rounded-lg bg-white border border-teal-200">
                  <button
                    type="button"
                    onClick={() => updateUnifiedQuiz(prev => ({ ...prev, household: 'solo' }))}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-extrabold flex items-center gap-1 cursor-pointer transition-all ${
                      quizState.household === 'solo'
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <User className="w-3 h-3" />
                    <span>Solo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => updateUnifiedQuiz(prev => ({ ...prev, household: 'couple' }))}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-extrabold flex items-center gap-1 cursor-pointer transition-all ${
                      quizState.household === 'couple'
                        ? 'bg-teal-600 text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Users className="w-3 h-3" />
                    <span>Couple</span>
                  </button>
                </div>
                <span className="font-mono tabular-nums font-black text-base text-teal-700">
                  ${quizState.monthlyBudgetUSD.toLocaleString()}/mo
                </span>
              </div>
            </div>
            <input
              type="range"
              aria-label="Ideal Monthly Living Budget"
              min={1000}
              max={10000}
              step={100}
              value={quizState.monthlyBudgetUSD}
              onChange={e =>
                updateUnifiedQuiz(prev => ({ ...prev, monthlyBudgetUSD: Number(e.target.value) }))
              }
              className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-teal-600 bg-teal-100"
            />
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
              <span>$1,000/mo</span>
              <span className="text-teal-700 font-bold">
                Annual: ${(quizState.monthlyBudgetUSD * 12).toLocaleString()}/yr
              </span>
              <span>$10,000/mo</span>
            </div>
          </div>
        </div>

        {/* Row 2: Parameter 3 — Escape Plan */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-800">
              3. Escape Plan (Filters Passive vs. Remote-Work Visa Pathways)
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {ESCAPE_PLAN_CARDS.map(opt => {
              const Icon = opt.icon;
              const isSelected = quizState.escapePlan === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectEscapePlan(opt.id)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                    isSelected ? `bg-gradient-to-br ${opt.activeGrad}` : opt.idleStyle
                  }`}
                >
                  <span
                    className={`p-2 rounded-lg shrink-0 ${
                      isSelected ? 'bg-white/20 text-white' : opt.iconIdle
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-extrabold leading-tight truncate">{opt.title}</div>
                    <div
                      className={`text-[10px] truncate mt-0.5 ${
                        isSelected ? 'text-white/85' : 'text-slate-500'
                      }`}
                    >
                      {opt.shortDesc}
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-white shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 3: Parameter 4 — Ideal Environment Priorities (Exact Same 18 Multi-Colored Mini Cards) */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setShowPrioritiesPanel(v => !v)}
              className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-rose-700 cursor-pointer"
            >
              <span>4. Ideal Environment Priorities (Pick up to 2 — Same as Homepage Step 4)</span>
              <span className="font-mono px-2 py-0.5 rounded-md bg-gradient-to-r from-indigo-600 to-rose-600 text-white text-[10px]">
                {quizState.priorities.length}/2
              </span>
              {showPrioritiesPanel ? (
                <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              )}
            </button>
            <span className="text-[11px] text-slate-500">
              {quizState.priorities
                .map((id, i) => `#${i + 1} ${FREEDOM_PRIORITY_OPTIONS.find(p => p.id === id)?.label || id}`)
                .join(' · ')}
            </span>
          </div>

          {showPrioritiesPanel && (
            <div className="space-y-2 pt-1">
              {PRIORITY_GROUPS.map(groupName => {
                const groupItems = FREEDOM_PRIORITY_OPTIONS.filter(opt => opt.group === groupName);
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
                    className={`p-2.5 rounded-2xl border space-y-1.5 ${gStyle.container}`}
                  >
                    <div className="flex items-center gap-1.5 px-0.5">
                      <span className={`w-2 h-2 rounded-full ${gStyle.dotColor}`} />
                      <span className={`text-[10px] font-extrabold uppercase tracking-wider ${gStyle.headerText}`}>
                        {groupName}
                      </span>
                    </div>
                    <div className={`grid ${gridCols} gap-1.5`}>
                      {groupItems.map(opt => {
                        const selectedIndex = quizState.priorities.indexOf(opt.id);
                        const isSelected = selectedIndex !== -1;
                        const visual = PRIORITY_CARD_STYLES[opt.id];
                        const Icon = visual.icon;
                        return (
                          <motion.button
                            key={opt.id}
                            type="button"
                            title={opt.shortHint}
                            whileHover={{ y: -1 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleTogglePriority(opt.id)}
                            className={`min-h-[38px] px-2.5 py-1.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                              isSelected ? `bg-gradient-to-br ${visual.activeGrad}` : visual.idleStyle
                            }`}
                          >
                            <span
                              className={`p-1 rounded-md shrink-0 ${
                                isSelected ? 'bg-white/20 text-white' : visual.iconBoxIdle
                              }`}
                            >
                              <Icon className="w-3.5 h-3.5" />
                            </span>
                            <span className="text-[11px] font-extrabold leading-tight flex-1 min-w-0 line-clamp-2">
                              {opt.label}
                            </span>
                            {isSelected && (
                              <span className="text-[9px] font-black font-mono px-1.5 py-0.5 rounded bg-white/25 text-white shrink-0">
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
          )}
        </div>

        {/* =================================================================== */}
        {/* OPTIONAL EXTRA DASHBOARD MODIFIERS (UNCHECKED BY DEFAULT!)          */}
        {/* =================================================================== */}
        <div className="pt-3 border-t border-slate-200/80 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setShowModifiersPanel(v => !v)}
              className="flex items-center gap-2 text-xs font-extrabold text-slate-700 hover:text-indigo-700 cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
              <span>Optional Extra Dashboard Modifiers</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {activeModifierCount === 0
                  ? 'All Unchecked · Exact Homepage Order'
                  : `${activeModifierCount} Checked`}
              </span>
              {showModifiersPanel ? (
                <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {activeModifierCount > 0 && (
              <button
                type="button"
                onClick={handleResetToHomepageLogic}
                className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-extrabold flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Uncheck All (Restore Homepage Ranking)</span>
              </button>
            )}
          </div>

          {/* Always-visible compact opt-in checkbox strip (all unchecked by default) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            <label
              className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                enableNationalityModifier
                  ? 'bg-purple-50 border-purple-300 text-purple-950'
                  : 'bg-slate-50/70 border-slate-200 text-slate-600 hover:bg-slate-100/70'
              }`}
            >
              <input
                type="checkbox"
                checked={enableNationalityModifier}
                onChange={e => {
                  setEnableNationalityModifier(e.target.checked);
                  if (e.target.checked) setShowModifiersPanel(true);
                }}
                className="rounded accent-purple-600 w-3.5 h-3.5 cursor-pointer"
              />
              <span className="text-[11px] font-bold leading-tight">
                Passport / Nationality Treaties
              </span>
            </label>

            <label
              className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                enableLanguageModifier
                  ? 'bg-teal-50 border-teal-300 text-teal-950'
                  : 'bg-slate-50/70 border-slate-200 text-slate-600 hover:bg-slate-100/70'
              }`}
            >
              <input
                type="checkbox"
                checked={enableLanguageModifier}
                onChange={e => setEnableLanguageModifier(e.target.checked)}
                className="rounded accent-teal-600 w-3.5 h-3.5 cursor-pointer"
              />
              <span className="text-[11px] font-bold leading-tight">
                Known Languages &amp; English Weight
              </span>
            </label>

            <label
              className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                enableClimateOverride
                  ? 'bg-amber-50 border-amber-300 text-amber-950'
                  : 'bg-slate-50/70 border-slate-200 text-slate-600 hover:bg-slate-100/70'
              }`}
            >
              <input
                type="checkbox"
                checked={enableClimateOverride}
                onChange={e => {
                  setEnableClimateOverride(e.target.checked);
                  if (e.target.checked) setShowModifiersPanel(true);
                }}
                className="rounded accent-amber-600 w-3.5 h-3.5 cursor-pointer"
              />
              <span className="text-[11px] font-bold leading-tight">
                Custom Climate Zone Override
              </span>
            </label>

            <label
              className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                enableAdvancedFinancialRules
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-950'
                  : 'bg-slate-50/70 border-slate-200 text-slate-600 hover:bg-slate-100/70'
              }`}
            >
              <input
                type="checkbox"
                checked={enableAdvancedFinancialRules}
                onChange={e => {
                  setEnableAdvancedFinancialRules(e.target.checked);
                  if (e.target.checked) setShowModifiersPanel(true);
                }}
                className="rounded accent-indigo-600 w-3.5 h-3.5 cursor-pointer"
              />
              <span className="text-[11px] font-bold leading-tight">
                Remote Income, SWR &amp; Min Fiber
              </span>
            </label>
          </div>

          {/* Expandable controls for checked optional modifiers */}
          {showModifiersPanel && activeModifierCount > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              {enableNationalityModifier && (
                <div className="space-y-1">
                  <label className="font-bold text-[11px] text-purple-900 block">
                    Passport / Nationality
                  </label>
                  <select
                    value={interactiveNationality}
                    onChange={e => setInteractiveNationality(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs border border-purple-200 rounded-lg bg-white font-medium text-slate-800"
                  >
                    {WORLD_COUNTRIES.map(c => (
                      <option key={`opt-nat-${c.code}-${c.name}`} value={c.name}>
                        {c.flag} {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {enableClimateOverride && (
                <div className="space-y-1">
                  <label className="font-bold text-[11px] text-amber-900 block">
                    Preferred Climate Zone
                  </label>
                  <select
                    value={interactiveClimate}
                    onChange={e => setInteractiveClimate(e.target.value as ClimateCategory | 'Any')}
                    className="w-full px-2.5 py-1.5 text-xs border border-amber-200 rounded-lg bg-white font-medium text-slate-800"
                  >
                    {climateOptions.map(c => (
                      <option key={c} value={c}>
                        {c === 'Any' ? 'Any Climate Category' : c}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {enableAdvancedFinancialRules && (
                <>
                  <div className="space-y-1">
                    <label className="font-bold text-[11px] text-indigo-900 flex justify-between">
                      <span>Remote Income (DNV)</span>
                      <span className="font-mono">${nomadRemoteIncomeUSD.toLocaleString()}/mo</span>
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={8000}
                      step={100}
                      value={nomadRemoteIncomeUSD}
                      onChange={e => setNomadRemoteIncomeUSD(Number(e.target.value))}
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-[11px] text-indigo-900 flex justify-between">
                      <span>Min Verified Fiber</span>
                      <span className="font-mono">{minInternetSpeedMbps}+ Mbps</span>
                    </label>
                    <input
                      type="range"
                      min={25}
                      max={225}
                      step={25}
                      value={minInternetSpeedMbps}
                      onChange={e => setMinInternetSpeedMbps(Number(e.target.value))}
                      className="w-full accent-violet-600 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-[11px] text-indigo-900 flex justify-between">
                      <span>Safe Withdrawal Rate</span>
                      <span className="font-mono">{safeWithdrawalRate.toFixed(2)}%</span>
                    </label>
                    <input
                      type="range"
                      min={3.0}
                      max={5.0}
                      step={0.25}
                      value={safeWithdrawalRate}
                      onChange={e => setSafeWithdrawalRate(parseFloat(e.target.value))}
                      className="w-full accent-teal-600 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-[11px] text-indigo-900 block">
                      Workspace / Visa Filter
                    </label>
                    <select
                      value={nomadWorkspaceFilter}
                      onChange={e => setNomadWorkspaceFilter(e.target.value as NomadWorkspaceFilter)}
                      className="w-full px-2.5 py-1.5 text-xs border border-indigo-200 rounded-lg bg-white font-medium text-slate-800"
                    >
                      <option value="any">All Destinations</option>
                      <option value="strict-dnv-fit">Strict Remote Income Fit</option>
                      <option value="world-class">World-Class Coworking</option>
                      <option value="laptop-cafes">Laptop-Friendly Cafes</option>
                    </select>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* SCOPE TABS, SORT, CONTINENT FILTER & SEARCH BAR                       */}
      {/* ===================================================================== */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 pt-1">
        <div className="inline-flex flex-wrap rounded-xl border border-slate-200 p-1 bg-white/90 text-xs font-semibold gap-1">
          <button
            type="button"
            onClick={() => setScopeTab('top')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              scopeTab === 'top'
                ? 'bg-gradient-to-r from-indigo-600 to-teal-600 text-white shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Top 10 Matches
          </button>
          <button
            type="button"
            onClick={() => setScopeTab('shortlist')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              scopeTab === 'shortlist'
                ? 'bg-gradient-to-r from-indigo-600 to-teal-600 text-white shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            My Shortlist ({userProfile.savedCountryIds.length})
          </button>
          <button
            type="button"
            onClick={() => setScopeTab('target')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              scopeTab === 'target'
                ? 'bg-gradient-to-r from-indigo-600 to-teal-600 text-white shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Target Haven ({userProfile.targetCountry})
          </button>
          <button
            type="button"
            onClick={() => setScopeTab('all')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              scopeTab === 'all'
                ? 'bg-gradient-to-r from-indigo-600 to-teal-600 text-white shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All {Math.max(0, countries.length - ignoredCountryIds.length)} Ranked
          </button>
          <button
            type="button"
            onClick={() => setScopeTab('ignored')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              scopeTab === 'ignored'
                ? 'bg-gradient-to-r from-amber-600 to-rose-600 text-white shadow-2xs font-bold'
                : 'text-slate-600 hover:text-amber-800'
            }`}
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span>Discarded ({ignoredCountryIds.length})</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={matcherSortBy}
            onChange={e => setMatcherSortBy(e.target.value as MatcherSortOption)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold cursor-pointer"
            aria-label="Sort ranked havens"
          >
            <option value="unified-rank">Sort: Unified Homepage Rank (Default)</option>
            <option value="cost-asc">Sort: Lowest Monthly Cost</option>
            <option value="visa-income-asc">Sort: Lowest Visa Income Req</option>
            <option value="internet-desc">Sort: Fastest Fiber Internet (Mbps)</option>
            <option value="healthcare-desc">Sort: Highest Healthcare Score</option>
            <option value="safety-desc">Sort: Highest Safety Score</option>
          </select>

          <select
            value={selectedRegion}
            onChange={e => setSelectedRegion(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium cursor-pointer"
            aria-label="Filter by continent"
          >
            {CONTINENT_FILTER_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.value === 'All' ? '🌍 All Continents / Any' : opt.label}
              </option>
            ))}
          </select>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search country, visa, city..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs w-44 sm:w-48 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            />
          </div>
        </div>
      </div>

      {/* Undo Discarded Toast */}
      {recentlyDiscardedCountry && (
        <div className="p-3 sm:p-4 rounded-2xl bg-amber-50/95 border border-amber-300 text-amber-950 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <EyeOff className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              <strong>{recentlyDiscardedCountry.name}</strong> has been discarded from recommendations. The next best matching haven moved up.
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              restoreCountry(recentlyDiscardedCountry.id);
              setRecentlyDiscardedCountry(null);
            }}
            className="px-3 py-1.5 rounded-xl bg-white border border-amber-300 hover:bg-amber-100 text-amber-950 font-bold text-xs cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
            <span>Undo</span>
          </button>
        </div>
      )}

      {/* Empty States */}
      {displayedAnalyses.length === 0 && (
        <div className="text-center py-10 px-6 bg-white/90 rounded-3xl border border-dashed border-slate-300">
          <p className="text-sm font-bold text-slate-800">
            {scopeTab === 'ignored'
              ? 'No discarded havens yet.'
              : 'No destinations match your current filter combination.'}
          </p>
          {scopeTab !== 'ignored' && (
            <button
              type="button"
              onClick={() => {
                setSelectedRegion('All');
                setSearchQuery('');
                handleResetToHomepageLogic();
              }}
              className="mt-3 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* RANKED COUNTRY CARDS WITH TRANSPARENT "WHY RANKED HERE" BREAKDOWN     */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {displayedAnalyses.map(item => {
          const {
            baseMatch,
            nomadProfile,
            displayRank,
            effectiveScore,
            overallGrade,
            overallBadgeClass,
            modifierDelta,
            modifierNotes,
            runwayYearsAtHaven,
          } = item;
          const { country, scoreBreakdown } = baseMatch;

          const saved = isCountrySaved(country.id);
          const compared = isCountryCompared(country.id);
          const isTarget = country.name.toLowerCase() === userProfile.targetCountry.toLowerCase();

          return (
            <div
              key={country.id}
              className={`rounded-2xl border p-5 flex flex-col justify-between transition-all shadow-2xs bg-white ${
                isTarget
                  ? 'border-amber-400 ring-2 ring-amber-500/15'
                  : 'border-indigo-200/80 hover:border-indigo-300'
              }`}
            >
              <div>
                {/* Top Card Header */}
                <div className="flex items-start justify-between gap-3 pb-3.5 border-b border-slate-100">
                  <div className="flex items-center gap-3 min-w-0">
                    <CountryFlag
                      countryCode={country.code}
                      countryName={country.name}
                      fallbackEmoji={country.flag}
                      size="xl"
                      className="w-9 h-6 rounded-xs shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-md bg-gradient-to-r from-indigo-700 to-teal-700 text-white font-mono text-[10px] font-black uppercase tracking-wider">
                          Rank #{displayRank}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${
                            baseMatch.visaQualifies
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          {baseMatch.visaQualifies ? '✓ Qualifies Today' : 'Stretch Path'}
                        </span>
                        {isTarget && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-gradient-to-r from-amber-500 to-orange-600 text-white">
                            Target Haven
                          </span>
                        )}
                        {saved && !isTarget && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            Shortlisted
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-black text-slate-950 mt-1 leading-tight truncate">
                        {country.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">
                        {country.capital} · {country.region} ·{' '}
                        <span className="text-indigo-700 font-semibold">{baseMatch.visaLabel}</span>
                      </p>
                    </div>
                  </div>

                  {/* Unified Match Score & Grade */}
                  <div className="text-right shrink-0">
                    <div className="flex items-center justify-end gap-1.5">
                      <span className="font-mono tabular-nums text-2xl font-black text-slate-950">
                        {effectiveScore}%
                      </span>
                      <span className={`px-2 py-0.5 rounded-lg text-xs font-extrabold border ${overallBadgeClass}`}>
                        {overallGrade}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 block font-bold uppercase tracking-wider mt-0.5">
                      {activeModifierCount === 0
                        ? 'Homepage Match %'
                        : `Base ${baseMatch.matchPercent}% ${modifierDelta >= 0 ? `+${modifierDelta}` : modifierDelta}`}
                    </span>
                  </div>
                </div>

                {/* 4 Key Metrics Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-3.5">
                  <div className="p-2.5 rounded-xl bg-teal-50/60 border border-teal-200/70">
                    <span className="text-[10px] font-bold text-teal-700 uppercase block">
                      {quizState.household === 'couple' ? 'Couple Cost' : 'Monthly Cost'}
                    </span>
                    <div className="font-mono font-black text-xs text-slate-950 mt-0.5">
                      ${baseMatch.monthlyCostUSD.toLocaleString()}/mo
                    </div>
                    <span className="text-[10px] font-semibold text-teal-800 block mt-0.5 truncate">
                      {baseMatch.monthlySavingsVsBudgetUSD >= 0
                        ? `Saves $${baseMatch.monthlySavingsVsBudgetUSD.toLocaleString()}/mo`
                        : `+$${Math.abs(baseMatch.monthlySavingsVsBudgetUSD).toLocaleString()} over`}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-indigo-50/60 border border-indigo-200/70">
                    <span className="text-[10px] font-bold text-indigo-700 uppercase block">Visa Income Floor</span>
                    <div className="font-mono font-black text-xs text-slate-950 mt-0.5">
                      {baseMatch.visaIncomeReqUSD > 0
                        ? `$${baseMatch.visaIncomeReqUSD.toLocaleString()}/mo`
                        : 'Savings / $0'}
                    </div>
                    <span className="text-[10px] font-semibold text-indigo-800 block mt-0.5 truncate">
                      Tier {country.visa.difficultyRating}/5 Ease
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-amber-50/65 border border-amber-200/70">
                    <span className="text-[10px] font-bold text-amber-800 uppercase block">2036 Inflation (3%)</span>
                    <div className="font-mono font-black text-xs text-slate-950 mt-0.5">
                      ${baseMatch.inflation10YrLowUSD.toLocaleString()}/mo
                    </div>
                    <span className="text-[10px] font-semibold text-amber-800 block mt-0.5 truncate">
                      5% stress: ${baseMatch.inflation10YrHighUSD.toLocaleString()}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200/70">
                    <span className="text-[10px] font-bold text-emerald-700 uppercase block">Haven Runway</span>
                    <div className="font-mono font-black text-xs text-slate-950 mt-0.5">
                      {runwayYearsAtHaven >= 25 ? '25+ Yrs (FIRE)' : `${runwayYearsAtHaven} Yrs`}
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-800 block mt-0.5 truncate">
                      Fiber: {nomadProfile.verifiedInternetMbps} Mbps
                    </span>
                  </div>
                </div>

                {/* TRANSPARENT SCORING LOGIC — WHY THIS COUNTRY WAS RECOMMENDED */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-50 via-white to-indigo-50/35 border border-indigo-100 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-800 flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Why Ranked #{displayRank} — Exact Scoring Logic</span>
                    </span>
                    <span className="text-[10px] font-mono font-bold text-slate-500">
                      Base {scoreBreakdown.baseScore} + Budget {scoreBreakdown.budgetPoints >= 0 ? `+${scoreBreakdown.budgetPoints}` : scoreBreakdown.budgetPoints} + Plan +{scoreBreakdown.escapePlanPoints} + Priorities +{scoreBreakdown.priorityPoints}
                      {scoreBreakdown.curatedBoost > 0 ? ` + Curated +${scoreBreakdown.curatedBoost}` : ''}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    {/* Factor 1: Budget & Runway */}
                    <div className="p-2.5 rounded-xl bg-white border border-emerald-100">
                      <div className="flex items-center justify-between font-extrabold text-emerald-800">
                        <span>1. Budget Fit</span>
                        <span className="font-mono">
                          {scoreBreakdown.budgetPoints >= 0 ? `+${scoreBreakdown.budgetPoints}` : scoreBreakdown.budgetPoints} pts
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-600 mt-0.5 leading-snug">
                        {scoreBreakdown.budgetReason}
                      </p>
                    </div>

                    {/* Factor 2: Escape Plan & Visa */}
                    <div className="p-2.5 rounded-xl bg-white border border-indigo-100">
                      <div className="flex items-center justify-between font-extrabold text-indigo-800">
                        <span>2. Escape Plan &amp; Visa</span>
                        <span className="font-mono">+{scoreBreakdown.escapePlanPoints} pts</span>
                      </div>
                      <p className="text-[10px] text-slate-600 mt-0.5 leading-snug">
                        {scoreBreakdown.escapePlanReason}
                      </p>
                    </div>

                    {/* Factor 3: Ideal Environment Priorities */}
                    <div className="p-2.5 rounded-xl bg-white border border-rose-100">
                      <div className="flex items-center justify-between font-extrabold text-rose-800">
                        <span>3. Your Selected Priorities</span>
                        <span className="font-mono">+{scoreBreakdown.priorityPoints} pts</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {scoreBreakdown.priorityDetails.map(d => (
                          <span
                            key={d.id}
                            className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-50 text-rose-900 border border-rose-200/80"
                          >
                            {d.label}: <strong className="font-mono">{d.score}/100</strong>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Factor 4: Quality of Life & Optional Modifiers */}
                    <div className="p-2.5 rounded-xl bg-white border border-amber-100">
                      <div className="flex items-center justify-between font-extrabold text-amber-800">
                        <span>4. Lifestyle &amp; Tax Snapshot</span>
                        <span className="font-mono text-[10px]">
                          {activeModifierCount > 0
                            ? `${modifierDelta >= 0 ? `+${modifierDelta}` : modifierDelta} mod`
                            : `${country.climate.annualSunnyDays}d sun`}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-600 mt-0.5 leading-snug">
                        Health {country.lifestyle.healthcareScore}/100 · Safety {country.lifestyle.safetyScore}/100 · {baseMatch.taxSummary.split('.')[0]}
                      </p>
                      {modifierNotes.length > 0 && (
                        <p className="text-[10px] font-semibold text-indigo-700 mt-0.5 leading-snug">
                          Modifiers: {modifierNotes.join(' · ')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => toggleSaveCountry(country.id)}
                    className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                      saved
                        ? 'bg-rose-50 text-rose-600 border-rose-200'
                        : 'bg-white text-slate-500 border-slate-200 hover:text-rose-600'
                    }`}
                    title={saved ? 'Remove from shortlist' : 'Save to shortlist'}
                  >
                    <Heart className={`w-3.5 h-3.5 ${saved ? 'fill-rose-600' : ''}`} />
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleCompareCountry(country.id)}
                    className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                      compared
                        ? 'bg-teal-700 text-white border-teal-700'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                    title="Compare in matrix"
                  >
                    <Scale className="w-3.5 h-3.5 inline mr-1" />
                    <span>{compared ? 'Compared' : 'Compare'}</span>
                  </button>

                  {scopeTab === 'ignored' || isCountryIgnored(country.id) ? (
                    <button
                      type="button"
                      onClick={() => restoreCountry(country.id)}
                      className="px-2.5 py-1 rounded-lg border text-xs font-bold bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Restore</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        toggleIgnoreCountry(country.id);
                        setRecentlyDiscardedCountry({ id: country.id, name: country.name });
                        window.setTimeout(() => setRecentlyDiscardedCountry(null), 5000);
                      }}
                      className="px-2 py-1 rounded-lg border text-xs bg-white text-slate-500 hover:text-amber-800 hover:bg-amber-50 hover:border-amber-300 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-[11px] font-medium hidden sm:inline">Discard</span>
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => navigateToCountry(country.id)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1 transition-colors cursor-pointer border text-indigo-800 hover:bg-indigo-50 border-indigo-200"
                >
                  <span>Full Dossier</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
