import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { CountryCard } from './CountryCard';
import { CountryFlag } from './CountryFlag';
import { WorldHavenMap } from './WorldHavenMap';
import { HavenMatcherPromoCard } from './HavenMatcherPromoCard';
import { getCountryNomadProfile } from '../data/countryNomadProfiles';
import {
  Search, SlidersHorizontal, Compass, RotateCcw,
  Sun, Shield, DollarSign, Scale, ArrowRight, Map, X,
  Sparkles, Globe2, HeartHandshake, ChevronDown, Check, ArrowUp, ChevronRight,
  UserPlus, LogIn, Lock, Loader2, AlertCircle, CheckCircle2,
  Wifi, Coffee, Flame, HeartPulse, ShieldCheck, FileBadge, Coins,
  Plane, Heart, Users, ArrowDownAZ, ArrowUpZA, Laptop, Waves, Mountain, CloudSun, Palmtree
} from 'lucide-react';
import type { SortByType } from '../types';

const REGION_CHIPS: Array<{
  value: string;
  idle: string;
  active: string;
}> = [
  {
    value: 'All',
    idle: 'bg-slate-100/90 text-slate-800 border-slate-200/90 hover:bg-slate-200/70',
    active: 'bg-gradient-to-r from-slate-800 to-indigo-700 text-white border-indigo-700 shadow-xs',
  },
  {
    value: 'Europe',
    idle: 'bg-indigo-50/90 text-indigo-900 border-indigo-200/90 hover:bg-indigo-100/80',
    active: 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-indigo-600 shadow-xs',
  },
  {
    value: 'Americas',
    idle: 'bg-emerald-50/90 text-emerald-900 border-emerald-200/90 hover:bg-emerald-100/80',
    active: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-600 shadow-xs',
  },
  {
    value: 'North & Central America',
    idle: 'bg-teal-50/90 text-teal-900 border-teal-200/90 hover:bg-teal-100/80',
    active: 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white border-teal-600 shadow-xs',
  },
  {
    value: 'South America',
    idle: 'bg-lime-50/90 text-lime-900 border-lime-200/90 hover:bg-lime-100/80',
    active: 'bg-gradient-to-r from-lime-600 to-emerald-600 text-white border-lime-600 shadow-xs',
  },
  {
    value: 'Southeast Asia',
    idle: 'bg-amber-50/90 text-amber-900 border-amber-200/90 hover:bg-amber-100/80',
    active: 'bg-gradient-to-r from-amber-500 to-orange-600 text-white border-amber-500 shadow-xs',
  },
  {
    value: 'Asia & Middle East',
    idle: 'bg-orange-50/90 text-orange-900 border-orange-200/90 hover:bg-orange-100/80',
    active: 'bg-gradient-to-r from-orange-500 to-rose-600 text-white border-orange-500 shadow-xs',
  },
  {
    value: 'Africa',
    idle: 'bg-rose-50/90 text-rose-900 border-rose-200/90 hover:bg-rose-100/80',
    active: 'bg-gradient-to-r from-rose-600 to-pink-600 text-white border-rose-600 shadow-xs',
  },
  {
    value: 'Oceania',
    idle: 'bg-sky-50/90 text-sky-900 border-sky-200/90 hover:bg-sky-100/80',
    active: 'bg-gradient-to-r from-sky-600 to-blue-600 text-white border-sky-600 shadow-xs',
  },
];

const CLIMATE_CHOCO_CHIPS: Array<{
  value: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  idle: string;
  active: string;
}> = [
  {
    value: 'All',
    label: 'All Zones',
    icon: Globe2,
    idle: 'bg-slate-100/90 text-slate-800 border-slate-200/90 hover:bg-slate-200/70',
    active: 'bg-gradient-to-r from-slate-800 to-amber-600 text-white border-slate-800 shadow-xs',
  },
  {
    value: 'Mediterranean',
    label: 'Mediterranean',
    icon: Sun,
    idle: 'bg-amber-50/95 text-amber-900 border-amber-200/90 hover:bg-amber-100/80',
    active: 'bg-gradient-to-r from-amber-500 to-orange-600 text-white border-amber-500 shadow-xs',
  },
  {
    value: 'Tropical',
    label: 'Tropical',
    icon: Palmtree,
    idle: 'bg-emerald-50/95 text-emerald-900 border-emerald-200/90 hover:bg-emerald-100/80',
    active: 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-emerald-500 shadow-xs',
  },
  {
    value: 'Subtropical',
    label: 'Subtropical',
    icon: Waves,
    idle: 'bg-cyan-50/95 text-cyan-900 border-cyan-200/90 hover:bg-cyan-100/80',
    active: 'bg-gradient-to-r from-cyan-600 to-sky-600 text-white border-cyan-600 shadow-xs',
  },
  {
    value: 'Temperate',
    label: 'Temperate',
    icon: CloudSun,
    idle: 'bg-indigo-50/95 text-indigo-900 border-indigo-200/90 hover:bg-indigo-100/80',
    active: 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-indigo-600 shadow-xs',
  },
  {
    value: 'Highlands / Mild',
    label: 'Highlands / Mild',
    icon: Mountain,
    idle: 'bg-violet-50/95 text-violet-900 border-violet-200/90 hover:bg-violet-100/80',
    active: 'bg-gradient-to-r from-violet-600 to-purple-600 text-white border-violet-600 shadow-xs',
  },
];

const SORT_CHOCO_CHIPS: Array<{
  value: SortByType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  idle: string;
  active: string;
}> = [
  {
    value: 'recommended',
    label: 'Curated Match',
    icon: Sparkles,
    idle: 'bg-indigo-50/90 text-indigo-900 border-indigo-200/90 hover:bg-indigo-100/80',
    active: 'bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 text-white border-indigo-600 shadow-xs',
  },
  {
    value: 'budget-asc',
    label: 'Lowest Cost',
    icon: DollarSign,
    idle: 'bg-emerald-50/90 text-emerald-900 border-emerald-200/90 hover:bg-emerald-100/80',
    active: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-600 shadow-xs',
  },
  {
    value: 'nomad-burn-asc',
    label: 'Nomad Burn',
    icon: Flame,
    idle: 'bg-amber-50/90 text-amber-900 border-amber-200/90 hover:bg-amber-100/80',
    active: 'bg-gradient-to-r from-amber-500 to-orange-600 text-white border-amber-500 shadow-xs',
  },
  {
    value: 'dnv-friendly',
    label: 'Nomad Visa',
    icon: Laptop,
    idle: 'bg-sky-50/90 text-sky-900 border-sky-200/90 hover:bg-sky-100/80',
    active: 'bg-gradient-to-r from-sky-600 to-blue-600 text-white border-sky-600 shadow-xs',
  },
  {
    value: 'internet-speed-desc',
    label: 'Fastest Fiber',
    icon: Wifi,
    idle: 'bg-cyan-50/90 text-cyan-900 border-cyan-200/90 hover:bg-cyan-100/80',
    active: 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white border-cyan-600 shadow-xs',
  },
  {
    value: 'coworking-friendly',
    label: 'Coworking',
    icon: Coffee,
    idle: 'bg-orange-50/90 text-orange-900 border-orange-200/90 hover:bg-orange-100/80',
    active: 'bg-gradient-to-r from-orange-500 to-amber-600 text-white border-orange-500 shadow-xs',
  },
  {
    value: 'healthcare-desc',
    label: 'Healthcare',
    icon: HeartPulse,
    idle: 'bg-rose-50/90 text-rose-900 border-rose-200/90 hover:bg-rose-100/80',
    active: 'bg-gradient-to-r from-rose-600 to-pink-600 text-white border-rose-600 shadow-xs',
  },
  {
    value: 'safety-desc',
    label: 'Safety Score',
    icon: ShieldCheck,
    idle: 'bg-blue-50/90 text-blue-900 border-blue-200/90 hover:bg-blue-100/80',
    active: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-600 shadow-xs',
  },
  {
    value: 'visa-difficulty-asc',
    label: 'Easiest Visa',
    icon: FileBadge,
    idle: 'bg-teal-50/90 text-teal-900 border-teal-200/90 hover:bg-teal-100/80',
    active: 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white border-teal-600 shadow-xs',
  },
  {
    value: 'visa-income-asc',
    label: 'Lowest Visa Min',
    icon: Coins,
    idle: 'bg-lime-50/90 text-lime-900 border-lime-200/90 hover:bg-lime-100/80',
    active: 'bg-gradient-to-r from-lime-600 to-emerald-600 text-white border-lime-600 shadow-xs',
  },
  {
    value: 'sunny-desc',
    label: 'Most Sunshine',
    icon: Sun,
    idle: 'bg-yellow-50/90 text-amber-900 border-amber-200/90 hover:bg-yellow-100/80',
    active: 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white border-amber-500 shadow-xs',
  },
  {
    value: 'travel-leisure-desc',
    label: 'Travel & Leisure',
    icon: Plane,
    idle: 'bg-violet-50/90 text-violet-900 border-violet-200/90 hover:bg-violet-100/80',
    active: 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-violet-600 shadow-xs',
  },
  {
    value: 'dating-nightlife-desc',
    label: 'Dating & Nightlife',
    icon: Heart,
    idle: 'bg-fuchsia-50/90 text-fuchsia-900 border-fuchsia-200/90 hover:bg-fuchsia-100/80',
    active: 'bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white border-fuchsia-600 shadow-xs',
  },
  {
    value: 'female-ratio-desc',
    label: 'Female Ratio',
    icon: Users,
    idle: 'bg-pink-50/90 text-pink-900 border-pink-200/90 hover:bg-pink-100/80',
    active: 'bg-gradient-to-r from-pink-600 to-rose-600 text-white border-pink-600 shadow-xs',
  },
  {
    value: 'alpha-asc',
    label: 'A – Z',
    icon: ArrowDownAZ,
    idle: 'bg-slate-100/90 text-slate-700 border-slate-200/90 hover:bg-slate-200/70',
    active: 'bg-gradient-to-r from-slate-700 to-slate-900 text-white border-slate-800 shadow-xs',
  },
  {
    value: 'alpha-desc',
    label: 'Z – A',
    icon: ArrowUpZA,
    idle: 'bg-slate-100/90 text-slate-700 border-slate-200/90 hover:bg-slate-200/70',
    active: 'bg-gradient-to-r from-slate-700 to-slate-900 text-white border-slate-800 shadow-xs',
  },
];

export const DirectoryExplorer: React.FC = () => {
  const {
    filteredCountries,
    countries,
    navigateToCountry,
    searchQuery,
    setSearchQuery,
    selectedRegion,
    setSelectedRegion,
    budgetMax,
    setBudgetMax,
    selectedClimate,
    setSelectedClimate,
    visaDifficultyMax,
    setVisaDifficultyMax,
    visaIncomeMax,
    setVisaIncomeMax,
    sortBy,
    setSortBy,
    resetFilters,
    comparedCountryIds,
    setCurrentView,
    currentPersona,
    setCurrentPersona,
    isAuthenticated,
    currentUserId,
    openAuthModal,
    loginWithGoogle,
  } = useApp();

  const [showMap, setShowMap] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [loadMoreGateOpen, setLoadMoreGateOpen] = useState(false);
  const [pendingLoadMoreMode, setPendingLoadMoreMode] = useState<'desktop' | 'mobile' | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [justUnlockedBatch, setJustUnlockedBatch] = useState<number | null>(null);

  // Progressive 24-country pagination on desktop (6 on mobile < md)
  const PAGE_SIZE = 24;
  const MOBILE_PAGE_SIZE = 6;
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);
  const [mobileVisibleCount, setMobileVisibleCount] = useState<number>(MOBILE_PAGE_SIZE);

  // Reset pagination whenever active filters or search change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
    setMobileVisibleCount(MOBILE_PAGE_SIZE);
  }, [searchQuery, selectedRegion, budgetMax, selectedClimate, visaDifficultyMax, visaIncomeMax, sortBy]);

  const effectiveSliceCount = Math.max(visibleCount, mobileVisibleCount);
  const displayedCountries = filteredCountries.slice(0, effectiveSliceCount);
  const hasMore = visibleCount < filteredCountries.length;
  const remainingCount = Math.max(0, filteredCountries.length - visibleCount);
  const nextBatchCount = Math.min(PAGE_SIZE, remainingCount);

  const mobileShownCount = Math.min(mobileVisibleCount, filteredCountries.length);
  const mobileHasMore = mobileVisibleCount < filteredCountries.length;
  const mobileRemainingCount = Math.max(0, filteredCountries.length - mobileVisibleCount);
  const mobileNextBatchCount = Math.min(MOBILE_PAGE_SIZE, mobileRemainingCount);
  const isGuestUser = !isAuthenticated || currentUserId === 'guest';

  // Auto-load the requested batch the instant a guest finishes Google or Email sign-in, staying right on Explore Havens
  useEffect(() => {
    if (!isGuestUser && pendingLoadMoreMode) {
      if (pendingLoadMoreMode === 'desktop') {
        const added = Math.min(PAGE_SIZE, Math.max(0, filteredCountries.length - visibleCount));
        setVisibleCount(prev => prev + PAGE_SIZE);
        setJustUnlockedBatch(added || PAGE_SIZE);
      } else {
        const added = Math.min(MOBILE_PAGE_SIZE, Math.max(0, filteredCountries.length - mobileVisibleCount));
        setMobileVisibleCount(prev => prev + MOBILE_PAGE_SIZE);
        setJustUnlockedBatch(added || MOBILE_PAGE_SIZE);
      }
      setLoadMoreGateOpen(false);
      setPendingLoadMoreMode(null);
      setAuthError(null);
      const timer = window.setTimeout(() => setJustUnlockedBatch(null), 5000);
      return () => window.clearTimeout(timer);
    }
  }, [isGuestUser, pendingLoadMoreMode, filteredCountries.length, visibleCount, mobileVisibleCount]);

  const handleLoadMore = () => {
    if (isGuestUser) {
      setAuthError(null);
      setPendingLoadMoreMode('desktop');
      setLoadMoreGateOpen(true);
      return;
    }
    setVisibleCount(prev => prev + PAGE_SIZE);
  };

  const handleMobileLoadMore = () => {
    if (isGuestUser) {
      setAuthError(null);
      setPendingLoadMoreMode('mobile');
      setLoadMoreGateOpen(true);
      return;
    }
    setMobileVisibleCount(prev => prev + MOBILE_PAGE_SIZE);
  };

  const handleContinueWithGoogleGate = async () => {
    setAuthError(null);
    setIsGoogleLoading(true);
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

  const handleEmailFallbackGate = () => {
    setLoadMoreGateOpen(false);
    openAuthModal('signup');
  };

  // Most searched countries (resolved from live country directory) + high-intent keywords shown before user types
  const mostSearchedCountries = useMemo(() => {
    const targetNames =
      currentPersona === 'nomad'
        ? ['Spain', 'Thailand', 'Portugal', 'Indonesia', 'Colombia', 'Malaysia', 'Mexico', 'Croatia']
        : ['Portugal', 'Spain', 'Thailand', 'Costa Rica', 'Malaysia', 'Panama', 'Mexico', 'Greece'];
    return targetNames
      .map(name => countries.find(c => c.name.toLowerCase() === name.toLowerCase()))
      .filter((c): c is NonNullable<typeof c> => Boolean(c));
  }, [countries, currentPersona]);

  const mostSearchedKeywords =
    currentPersona === 'nomad'
      ? [
          { label: 'Digital Nomad Visa', color: 'bg-indigo-50 text-indigo-900 border-indigo-200/90 hover:bg-indigo-100/80', activeColor: 'bg-indigo-600 text-white border-indigo-600' },
          { label: 'World-Class Nomad Hub', color: 'bg-teal-50 text-teal-900 border-teal-200/90 hover:bg-teal-100/80', activeColor: 'bg-teal-600 text-white border-teal-600' },
          { label: '0% tax', color: 'bg-rose-50 text-rose-900 border-rose-200/90 hover:bg-rose-100/80', activeColor: 'bg-rose-600 text-white border-rose-600' },
          { label: 'Bali', color: 'bg-violet-50 text-violet-900 border-violet-200/90 hover:bg-violet-100/80', activeColor: 'bg-violet-600 text-white border-violet-600' },
        ]
      : [
          { label: 'Mediterranean', color: 'bg-amber-50 text-amber-900 border-amber-200/90 hover:bg-amber-100/80', activeColor: 'bg-amber-600 text-white border-amber-600' },
          { label: 'Pensionado', color: 'bg-sky-50 text-sky-900 border-sky-200/90 hover:bg-sky-100/80', activeColor: 'bg-sky-600 text-white border-sky-600' },
          { label: 'D7 Passive Income', color: 'bg-indigo-50 text-indigo-900 border-indigo-200/90 hover:bg-indigo-100/80', activeColor: 'bg-indigo-600 text-white border-indigo-600' },
          { label: '0% tax', color: 'bg-rose-50 text-rose-900 border-rose-200/90 hover:bg-rose-100/80', activeColor: 'bg-rose-600 text-white border-rose-600' },
        ];

  // Auto-loaded countries as the user types in the Explore Lens search bar
  const autoLoadedSearchCountries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    // First use filteredCountries, and if a region/slider filter hid direct country name matches, include them too
    const seenIds = new Set<string>();
    const results: Array<{
      country: typeof countries[number];
      nomadProfile: ReturnType<typeof getCountryNomadProfile>;
      matchedContext: string;
      isHiddenByOtherFilters: boolean;
      rank: number;
    }> = [];

    const evaluateCountry = (c: typeof countries[number], isFilteredIn: boolean) => {
      if (seenIds.has(c.id)) return;
      const nomadProf = getCountryNomadProfile(c);
      const nameLower = c.name.toLowerCase();
      let rank = 0;
      let matchedContext = c.capital;

      if (nameLower === q) {
        rank = 5;
        matchedContext = `${c.capital} · ${c.region}`;
      } else if (nameLower.startsWith(q)) {
        rank = 4;
        matchedContext = `${c.capital} · ${c.region}`;
      } else if (nameLower.includes(q)) {
        rank = 3;
        matchedContext = `${c.capital} · ${c.region}`;
      } else {
        const matchedTopCity = c.topCities.find(tc => tc.name.toLowerCase().includes(q));
        const matchedNomadCity = nomadProf.topNomadCities.find(nc => nc.toLowerCase().includes(q));
        if (c.capital.toLowerCase().includes(q)) {
          rank = 2;
          matchedContext = `Capital: ${c.capital}`;
        } else if (matchedTopCity) {
          rank = 2;
          matchedContext = `Hub: ${matchedTopCity.name}`;
        } else if (matchedNomadCity) {
          rank = 2;
          matchedContext = `Hub: ${matchedNomadCity}`;
        } else if (isFilteredIn) {
          rank = 1;
          matchedContext =
            currentPersona === 'nomad' ? nomadProf.remoteWorkVisaName : c.visa.retirementVisaName;
        }
      }

      if (rank > 0) {
        seenIds.add(c.id);
        results.push({
          country: c,
          nomadProfile: nomadProf,
          matchedContext,
          isHiddenByOtherFilters: !isFilteredIn,
          rank,
        });
      }
    };

    filteredCountries.forEach(c => evaluateCountry(c, true));
    countries.forEach(c => evaluateCountry(c, false));

    return results.sort((a, b) => {
      if (a.isHiddenByOtherFilters !== b.isHiddenByOtherFilters) {
        return a.isHiddenByOtherFilters ? 1 : -1;
      }
      if (b.rank !== a.rank) return b.rank - a.rank;
      return a.country.name.localeCompare(b.country.name);
    });
  }, [searchQuery, filteredCountries, countries, currentPersona]);

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedRegion !== 'All' ||
    budgetMax < 3500 ||
    selectedClimate !== 'All' ||
    visaDifficultyMax < 5 ||
    visaIncomeMax < 3500;

  return (
    <div className="space-y-5 md:space-y-10 pb-20">
      
      {/* Unified Factual Global Relocation Intelligence & Multi-Color Filter Console */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-50/75 via-indigo-50/45 to-amber-50/65 pt-5 pb-6 md:pt-8 md:pb-12 border-b border-slate-200/80">
        {/* Animated Ambient Multi-Colored Glow Orbs */}
        <motion.div
          animate={{ x: [0, 25, 0], y: [0, -15, 0], scale: [1, 1.06, 1] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-24 -left-24 w-96 h-96 bg-teal-300/20 rounded-full blur-3xl pointer-events-none"
        />
        <motion.div
          animate={{ x: [0, -20, 0], y: [0, 20, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-12 right-0 w-96 h-96 bg-indigo-300/20 rounded-full blur-3xl pointer-events-none"
        />
        <motion.div
          animate={{ x: [0, 15, 0], y: [0, 12, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-24 left-1/3 w-96 h-96 bg-amber-300/20 rounded-full blur-3xl pointer-events-none"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-4 md:space-y-6">
          
          {/* Unified Header Row */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 md:gap-6"
          >
            <div className="space-y-1.5 md:space-y-2.5 max-w-3xl">
              <div className="inline-flex items-center gap-2 text-[11px] md:text-xs font-bold uppercase tracking-widest text-teal-800">
                <Compass className="w-4 h-4 text-teal-600 animate-spin" style={{ animationDuration: '18s' }} />
                <span>Factual Global Relocation Intelligence</span>
              </div>

              <h1 className="text-2xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
                {currentPersona === 'retiree' ? (
                  <>
                    Choose the Right Country to Retire with{' '}
                    <span className="bg-gradient-to-r from-teal-600 via-indigo-600 to-amber-600 bg-clip-text text-transparent">
                      Confidence
                    </span>
                    .
                  </>
                ) : (
                  <>
                    Discover the World&apos;s Best{' '}
                    <span className="bg-gradient-to-r from-teal-600 via-indigo-600 to-amber-600 bg-clip-text text-transparent">
                      Nomad Hubs &amp; Remote Havens
                    </span>
                    .
                  </>
                )}
              </h1>

              <p className="hidden md:block text-sm sm:text-base text-slate-600 leading-relaxed">
                {currentPersona === 'retiree'
                  ? `Search, filter, and compare visa pathways, real couple budgets, climate zones, healthcare standards, and community life across ${countries.length} verified havens in one unified console.`
                  : `Explore turnkey coliving and furnished rentals, verified high-speed fiber internet, vibrant coworking spaces, and Digital Nomad Visas (DNV) across ${countries.length} global destinations.`}
              </p>
            </div>

            {/* Multi-Colored Live Intelligence Highlights (Desktop Only) */}
            <div className="hidden md:grid grid-cols-3 gap-2.5 sm:gap-3 shrink-0">
              <motion.div
                whileHover={{ y: -2 }}
                className="px-3.5 py-2.5 rounded-2xl bg-white/90 backdrop-blur-md border border-teal-200/80 shadow-xs"
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 block">
                  Global Index
                </span>
                <span className="font-mono text-lg sm:text-xl font-extrabold text-slate-900 tabular-nums">
                  {countries.length}
                </span>
                <span className="text-[11px] text-slate-500 block">Verified Havens</span>
              </motion.div>

              <motion.div
                whileHover={{ y: -2 }}
                className="px-3.5 py-2.5 rounded-2xl bg-white/90 backdrop-blur-md border border-indigo-200/80 shadow-xs"
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 block">
                  Deep Metrics
                </span>
                <span className="font-mono text-lg sm:text-xl font-extrabold text-slate-900 tabular-nums">
                  30+
                </span>
                <span className="text-[11px] text-slate-500 block">Empirical Factors</span>
              </motion.div>

              <motion.div
                whileHover={{ y: -2 }}
                className="px-3.5 py-2.5 rounded-2xl bg-white/90 backdrop-blur-md border border-amber-200/80 shadow-xs"
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">
                  Live Matches
                </span>
                <motion.span
                  key={filteredCountries.length}
                  initial={{ scale: 0.85, opacity: 0.5 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="font-mono text-lg sm:text-xl font-extrabold text-amber-600 tabular-nums block"
                >
                  {filteredCountries.length}
                </motion.span>
                <span className="text-[11px] text-slate-500 block">Ready to Explore</span>
              </motion.div>
            </div>
          </motion.div>

          {/* Unified Interactive Search & Multi-Color Filter Console */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease: 'easeOut' }}
            className="relative overflow-hidden bg-white/95 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-900/5 p-3.5 md:p-7 space-y-3.5 md:space-y-6"
          >
            {/* Top Multi-Colored Gradient Accent Ribbon */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-teal-500 via-indigo-500 to-amber-500" />
            
            {/* Filter Console Header: Active Persona Lens Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 md:gap-3 pb-2.5 md:pb-3 border-b border-slate-100">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="hidden md:flex text-xs font-black uppercase tracking-wider text-slate-700 items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                  Explore Lens:
                </span>
                <div className="grid grid-cols-2 w-full md:w-auto md:inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200/90 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setCurrentPersona('retiree')}
                    className={`px-3 md:px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      currentPersona === 'retiree'
                        ? 'bg-white text-emerald-950 font-black shadow-xs border border-emerald-200/80'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>🌿 Early Retiree</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentPersona('nomad')}
                    className={`px-3 md:px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      currentPersona === 'nomad'
                        ? 'bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 text-slate-950 font-black shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span className="md:hidden">⚡ Digital Nomad</span>
                    <span className="hidden md:inline">⚡ Digital Nomad / Creator</span>
                  </button>
                </div>
              </div>
              <span className="hidden md:inline text-[11px] font-semibold text-slate-500">
                {currentPersona === 'retiree'
                  ? 'Showing couple lease baseline & retirement visas'
                  : 'Showing 1-mo turnkey burn, verified fiber speeds & remote visas'}
              </span>
            </div>

            {/* Zone 1: Single Unified Search Bar + Action Buttons + Popular Multi-Color Chips */}
            <div className="space-y-2.5 md:space-y-3">
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2.5 md:gap-3">
                {/* Single Unified Search Box */}
                <div className="relative flex-1 group">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-indigo-600 text-white flex items-center justify-center absolute left-2.5 top-1/2 -translate-y-1/2 shadow-xs pointer-events-none">
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    aria-label="Search destinations by country name, climate type, or visa keyword"
                    placeholder="Search country, climate, or visa (D7, 0% tax)..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-20 md:pr-24 py-2.5 md:py-3.5 bg-slate-50/90 hover:bg-white focus:bg-white text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm font-medium rounded-xl md:rounded-2xl border border-slate-200/90 focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-2xs"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="p-1 rounded-lg bg-slate-200/70 hover:bg-slate-300 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                        title="Clear search query"
                        aria-label="Clear search"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono text-[11px] font-bold">
                      {filteredCountries.length}/{countries.length}
                    </span>
                  </div>
                </div>

                {/* Mobile-only Compact Filter Toggle Row (< md) */}
                <div className="flex md:hidden items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setMobileFiltersOpen(prev => !prev)}
                    className="min-h-[38px] px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-950 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{mobileFiltersOpen ? 'Hide Filters' : 'Filters & Sort'}</span>
                  </button>
                  <span className="text-[11px] font-bold text-slate-500">
                    {filteredCountries.length} of {countries.length} havens
                  </span>
                </div>

                {/* Right Action Bar: Compare & Interactive Spatial Atlas Toggle (Desktop / Expanded Mobile) */}
                <div className={`${mobileFiltersOpen ? 'flex' : 'hidden'} md:flex flex-wrap items-center gap-2.5 shrink-0`}>
                  {comparedCountryIds.length >= 2 && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setCurrentView('compare')}
                      className="px-4 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-xs sm:text-sm hover:from-amber-600 hover:to-orange-700 transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                    >
                      <Scale className="w-4 h-4" />
                      <span>Compare ({comparedCountryIds.length})</span>
                    </motion.button>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowMap(!showMap)}
                    className={`px-4 py-3 text-xs sm:text-sm font-bold rounded-2xl border transition-all flex items-center gap-2 shadow-2xs cursor-pointer ${
                      showMap
                        ? 'bg-gradient-to-r from-teal-600 via-indigo-600 to-violet-600 text-white border-transparent shadow-sm'
                        : 'bg-gradient-to-r from-teal-50/90 via-indigo-50/70 to-amber-50/90 text-slate-800 border-teal-200/90 hover:border-indigo-300'
                    }`}
                  >
                    <Map className={`w-4 h-4 ${showMap ? 'text-white' : 'text-teal-600'}`} />
                    <span>{showMap ? 'Hide Spatial Atlas' : 'Interactive World Atlas'}</span>
                  </motion.button>
                </div>
              </div>

              {/* Dynamic Strip Below Search Bar: Auto-Loaded Countries While Typing OR Most Searched Countries & Keywords When Idle */}
              {searchQuery.trim() !== '' ? (
                <div className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-teal-50/80 via-indigo-50/65 to-sky-50/80 border border-indigo-200/80 space-y-2.5 shadow-2xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold uppercase tracking-wider text-indigo-950 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                        <span>
                          Auto-Loaded Search Results ({autoLoadedSearchCountries.length}{' '}
                          {autoLoadedSearchCountries.length === 1 ? 'Country' : 'Countries'})
                        </span>
                      </span>
                      {filteredCountries.length !== autoLoadedSearchCountries.length &&
                        autoLoadedSearchCountries.length > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100/90 text-amber-900 border border-amber-300/80 font-bold text-[10px]">
                            Click any country to include across all regions/filters
                          </span>
                        )}
                    </div>
                    <span className="text-slate-500 font-medium hidden sm:inline">
                      Click a country to spotlight its card below or open its full Dossier
                    </span>
                  </div>

                  {autoLoadedSearchCountries.length > 0 ? (
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5">
                      {autoLoadedSearchCountries.slice(0, 12).map(
                        ({ country, nomadProfile, matchedContext, isHiddenByOtherFilters }) => {
                          const isExactMatch =
                            searchQuery.trim().toLowerCase() === country.name.toLowerCase();
                          return (
                            <div
                              key={country.id}
                              className={`inline-flex items-center gap-2 pl-2.5 pr-1.5 py-1.5 rounded-xl border text-xs font-bold shrink-0 transition-all shadow-2xs ${
                                isExactMatch
                                  ? 'bg-gradient-to-r from-teal-600 via-indigo-600 to-violet-600 text-white border-indigo-500'
                                  : isHiddenByOtherFilters
                                  ? 'bg-amber-50/90 hover:bg-amber-100/80 text-slate-800 border-amber-300/90'
                                  : 'bg-white/95 hover:bg-indigo-50/90 text-slate-800 border-indigo-200/80'
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  if (isHiddenByOtherFilters) {
                                    resetFilters();
                                  }
                                  setSearchQuery(country.name);
                                }}
                                className="inline-flex items-center gap-1.5 cursor-pointer text-left"
                                title={`Filter Explore Havens to ${country.name}`}
                              >
                                <CountryFlag
                                  countryName={country.name}
                                  countryCode={country.code}
                                  fallbackEmoji={country.flag}
                                  className="w-4 h-4 rounded-xs shrink-0"
                                />
                                <span>{country.name}</span>
                                <span
                                  className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md hidden md:inline ${
                                    isExactMatch
                                      ? 'bg-white/20 text-white'
                                      : 'bg-slate-100 text-slate-600'
                                  }`}
                                >
                                  {matchedContext}
                                </span>
                                <span
                                  className={`text-[10px] font-mono font-extrabold px-1.5 py-0.5 rounded-md ${
                                    isExactMatch
                                      ? 'bg-white/20 text-white'
                                      : 'bg-emerald-50 text-emerald-800 border border-emerald-200/80'
                                  }`}
                                >
                                  $
                                  {(currentPersona === 'nomad'
                                    ? nomadProfile.monthlyNomadBurnUSD
                                    : country.costOfLiving.monthlyBudgetCoupleUSD
                                  ).toLocaleString()}
                                  /mo
                                </span>
                              </button>
                              <button
                                type="button"
                                onClick={() => navigateToCountry(country.id)}
                                className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold transition-colors cursor-pointer inline-flex items-center gap-0.5 ${
                                  isExactMatch
                                    ? 'bg-white text-indigo-950 hover:bg-indigo-50'
                                    : 'bg-indigo-100/90 hover:bg-indigo-600 text-indigo-950 hover:text-white'
                                }`}
                                title={`Open full ${country.name} dossier`}
                              >
                                <span>Dossier</span>
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            </div>
                          );
                        }
                      )}
                    </div>
                  ) : (
                    <div className="text-xs font-semibold text-rose-700 bg-rose-50/90 border border-rose-200/80 rounded-xl px-3 py-2 flex items-center justify-between gap-2">
                      <span>No countries or keywords matched &ldquo;{searchQuery.trim()}&rdquo;.</span>
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="text-[11px] font-extrabold underline cursor-pointer"
                      >
                        Clear search
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mr-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-teal-600" />
                    <span>Most Searched:</span>
                  </span>
                  {mostSearchedCountries.map((country, idx) => {
                    const pillPalettes = [
                      'bg-teal-50/90 text-teal-950 border-teal-200/90 hover:bg-teal-100/80',
                      'bg-indigo-50/90 text-indigo-950 border-indigo-200/90 hover:bg-indigo-100/80',
                      'bg-sky-50/90 text-sky-950 border-sky-200/90 hover:bg-sky-100/80',
                      'bg-violet-50/90 text-violet-950 border-violet-200/90 hover:bg-violet-100/80',
                      'bg-emerald-50/90 text-emerald-950 border-emerald-200/90 hover:bg-emerald-100/80',
                    ];
                    const palette = pillPalettes[idx % pillPalettes.length];
                    return (
                      <motion.button
                        key={country.id}
                        type="button"
                        whileHover={{ y: -1.5 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => setSearchQuery(country.name)}
                        className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 border cursor-pointer inline-flex items-center gap-1.5 shadow-2xs ${palette}`}
                      >
                        <CountryFlag
                          countryName={country.name}
                          countryCode={country.code}
                          fallbackEmoji={country.flag}
                          className="w-3.5 h-3.5 rounded-xs shrink-0"
                        />
                        <span>{country.name}</span>
                      </motion.button>
                    );
                  })}
                  {mostSearchedKeywords.map(kw => {
                    const isActive = searchQuery.toLowerCase() === kw.label.toLowerCase();
                    return (
                      <motion.button
                        key={kw.label}
                        type="button"
                        whileHover={{ y: -1.5 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => setSearchQuery(isActive ? '' : kw.label)}
                        className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all whitespace-nowrap shrink-0 border cursor-pointer ${
                          isActive ? `${kw.activeColor} shadow-xs` : kw.color
                        }`}
                      >
                        {kw.label}
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Collapsible Filter Stack on Mobile (< md); Always Visible on Desktop (>= md) */}
            <div className={`${mobileFiltersOpen ? 'block' : 'hidden'} md:block space-y-5 md:space-y-6`}>
            {/* Hairline Divider */}
            <div className="border-t border-slate-200/80" />

            {/* Zone 2: Multi-Colored Choco-Chip Selectors — Region, Climate Zone, and Sort By */}
            <div className="space-y-2.5">
              {/* Row A: Multi-Colored Region & Continent Choco Chips */}
              <div className="flex flex-wrap items-center gap-1.5 bg-gradient-to-r from-slate-50/90 via-indigo-50/35 to-teal-50/35 border border-slate-200/80 rounded-2xl p-2.5 sm:px-3.5 sm:py-2.5">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 mr-1 shrink-0 flex items-center gap-1.5 px-1">
                  <Globe2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Region:</span>
                </span>
                <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
                  {REGION_CHIPS.map(chip => {
                    const isSelected = selectedRegion === chip.value;
                    return (
                      <motion.button
                        key={chip.value}
                        type="button"
                        whileHover={{ y: -1, scale: 1.02 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => setSelectedRegion(chip.value)}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-full border transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                          isSelected ? chip.active : chip.idle
                        }`}
                      >
                        {chip.value}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Row B: Multi-Colored Climate Zone Choco Chips */}
              <div className="flex flex-wrap items-center gap-1.5 bg-gradient-to-r from-amber-50/65 via-white to-emerald-50/55 border border-amber-200/75 rounded-2xl p-2.5 sm:px-3.5 sm:py-2.5">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-900 mr-1 shrink-0 flex items-center gap-1.5 px-1">
                  <Sun className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Climate Zone:</span>
                </span>
                <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
                  {CLIMATE_CHOCO_CHIPS.map(chip => {
                    const isSelected = selectedClimate === chip.value;
                    const Icon = chip.icon;
                    return (
                      <motion.button
                        key={chip.value}
                        type="button"
                        whileHover={{ y: -1, scale: 1.02 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => setSelectedClimate(chip.value)}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-full border transition-all whitespace-nowrap shrink-0 cursor-pointer inline-flex items-center gap-1.5 ${
                          isSelected ? chip.active : chip.idle
                        }`}
                      >
                        <Icon className={`w-3 h-3 shrink-0 ${isSelected ? 'text-white' : ''}`} />
                        <span>{chip.label}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Row C: Multi-Colored Sort By Choco Chips + Reset Action */}
              <div className="flex flex-wrap items-center gap-1.5 bg-gradient-to-r from-indigo-50/65 via-violet-50/45 to-rose-50/50 border border-indigo-200/75 rounded-2xl p-2.5 sm:px-3.5 sm:py-2.5">
                <div className="flex items-center justify-between w-full sm:w-auto gap-2 mr-1 shrink-0 px-1">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-950 flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>Sort By:</span>
                  </span>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={resetFilters}
                    className="sm:hidden px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200/90 flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </motion.button>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
                  {SORT_CHOCO_CHIPS.map(chip => {
                    const isSelected = sortBy === chip.value;
                    const Icon = chip.icon;
                    return (
                      <motion.button
                        key={chip.value}
                        type="button"
                        whileHover={{ y: -1, scale: 1.02 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => setSortBy(chip.value)}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-full border transition-all whitespace-nowrap shrink-0 cursor-pointer inline-flex items-center gap-1.5 ${
                          isSelected ? chip.active : chip.idle
                        }`}
                      >
                        <Icon className={`w-3 h-3 shrink-0 ${isSelected ? 'text-white' : ''}`} />
                        <span>{chip.label}</span>
                      </motion.button>
                    );
                  })}
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={resetFilters}
                    className="hidden sm:inline-flex group px-3 py-1 rounded-full text-[11px] font-bold bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200/90 hover:border-rose-600 items-center gap-1.5 transition-all shadow-2xs cursor-pointer shrink-0 ml-auto"
                    title="Reset all filters to default"
                  >
                    <RotateCcw className="w-3 h-3 group-hover:-rotate-90 transition-transform duration-300" />
                    <span>Reset All</span>
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Zone 3: 3 Balanced Multi-Colored Granular Slider Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              
              {/* Card 1: Max Monthly Budget (Emerald / Teal Theme) */}
              <motion.div
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
                className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-50/75 via-teal-50/50 to-white border border-emerald-200/80 shadow-2xs flex flex-col justify-between gap-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                    <span className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-700 flex items-center justify-center">
                      <DollarSign className="w-3.5 h-3.5" />
                    </span>
                    <span>Couple Budget</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-white border border-emerald-200/90 font-mono tabular-nums text-[11px] font-extrabold text-emerald-800 shadow-2xs">
                    {budgetMax >= 3500 ? 'Any ($3.5k+)' : `≤ $${budgetMax.toLocaleString()}/mo`}
                  </span>
                </div>
                <input
                  type="range"
                  min={1000}
                  max={3500}
                  step={50}
                  value={budgetMax}
                  onChange={e => setBudgetMax(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-emerald-800/70 font-mono font-semibold">
                  <span>$1,000</span>
                  <span>$2,250</span>
                  <span>$3,500+</span>
                </div>
              </motion.div>

              {/* Card 2: Visa Complexity (Indigo / Violet Theme) */}
              <motion.div
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
                className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-50/75 via-violet-50/45 to-white border border-indigo-200/80 shadow-2xs flex flex-col justify-between gap-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                    <span className="w-6 h-6 rounded-lg bg-indigo-500/15 text-indigo-700 flex items-center justify-center">
                      <Shield className="w-3.5 h-3.5" />
                    </span>
                    <span>Visa Ease</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-white border border-indigo-200/90 font-mono tabular-nums text-[11px] font-extrabold text-indigo-800 shadow-2xs">
                    {visaDifficultyMax === 5 ? 'Any Tier (1–5)' : `Tier ≤ ${visaDifficultyMax}`}
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={visaDifficultyMax}
                  onChange={e => setVisaDifficultyMax(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-indigo-800/70 font-semibold">
                  <span>1 (Easiest)</span>
                  <span>3 (Moderate)</span>
                  <span>5 (Strict)</span>
                </div>
              </motion.div>

              {/* Card 3: Max Visa Income Requirement (Sky / Cyan Theme) */}
              <motion.div
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
                className="p-3.5 rounded-2xl bg-gradient-to-br from-sky-50/80 via-cyan-50/45 to-white border border-sky-200/80 shadow-2xs flex flex-col justify-between gap-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-sky-950 flex items-center gap-1.5">
                    <span className="w-6 h-6 rounded-lg bg-sky-500/15 text-sky-700 flex items-center justify-center">
                      <Scale className="w-3.5 h-3.5" />
                    </span>
                    <span>Visa Income Req.</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-white border border-sky-200/90 font-mono tabular-nums text-[11px] font-extrabold text-sky-800 shadow-2xs">
                    {visaIncomeMax >= 3500 ? 'Any Income' : `≤ $${visaIncomeMax.toLocaleString()}/mo`}
                  </span>
                </div>
                <input
                  type="range"
                  min={700}
                  max={3500}
                  step={100}
                  value={visaIncomeMax}
                  onChange={e => setVisaIncomeMax(Number(e.target.value))}
                  className="w-full accent-sky-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-sky-800/70 font-mono font-semibold">
                  <span>$700</span>
                  <span>$2,100</span>
                  <span>$3,500+</span>
                </div>
              </motion.div>

            </div>

            {/* Zone 4: Status Strip, Active Filter Chips & Discreet Lifestyle Toggle */}
            <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-2 text-slate-600">
                <span>
                  Showing <strong className="font-mono font-extrabold text-slate-900">{filteredCountries.length}</strong> of{' '}
                  <strong className="font-mono font-extrabold text-slate-900">{countries.length}</strong> verified retirement havens
                </span>

                {hasActiveFilters && (
                  <button
                    onClick={resetFilters}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 font-semibold text-[11px] transition-colors cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                    <span>Clear active filters</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <HeartHandshake className="w-3.5 h-3.5 text-violet-600" />
                <span className="text-[11px] text-slate-600 font-semibold">Dating &amp; Lifestyle Dynamics:</span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-violet-100 text-violet-900 border border-violet-200 shadow-2xs">
                  Active &amp; Visible Everywhere
                </span>
              </div>
            </div>
            </div>

          </motion.div>

        </div>
      </section>

      {/* Main Directory Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5 md:space-y-6">
        
        {/* Mobile-Only Prominent Quick Sign-Up / Log-In Banner for Guests (< md) */}
        {isGuestUser && (
          <div className="md:hidden relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-white via-indigo-50/70 to-amber-50/60 border border-indigo-200/90 shadow-sm space-y-2.5">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-orange-500 via-indigo-500 to-teal-500" />
            <div>
              <p className="text-sm font-extrabold text-slate-900 leading-snug">
                Want Personalized Matches Instead of Scrolling?
              </p>
              <p className="text-xs text-slate-600 mt-0.5">
                Sign up free in 30s to save shortlists &amp; rank havens by your passport &amp; budget.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => openAuthModal('signup')}
                className="min-h-[42px] px-3 py-2 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-slate-950 font-black text-xs shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Sign Up Free</span>
              </button>
              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="min-h-[42px] px-3 py-2 rounded-xl bg-white text-slate-800 font-bold text-xs border border-slate-200 shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-indigo-600" />
                <span>Log In</span>
              </button>
            </div>
          </div>
        )}

        {/* Interactive Spatial Map Component (Animated Expand/Collapse) */}
        <AnimatePresence>
          {showMap && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <WorldHavenMap />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quiet visual teaser card when spatial map is hidden (Desktop Only) */}
        {!showMap && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2 }}
            className="hidden md:flex relative overflow-hidden p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-teal-50/90 via-indigo-50/70 to-amber-50/85 border border-teal-200/80 flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-sm"
          >
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-teal-400 via-indigo-500 to-amber-500" />
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 via-indigo-600 to-amber-500 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                <Globe2 className="w-5 h-5" />
              </div>
              <div>
                <p className="font-extrabold text-slate-900 flex flex-wrap items-center gap-2 text-sm">
                  <span>Interactive 3D Google Earth World Atlas</span>
                  <span className="text-[10px] font-mono font-bold text-teal-900 bg-teal-100/90 border border-teal-200 px-2 py-0.5 rounded-md">
                    {countries.length} destinations
                  </span>
                </p>
                <p className="text-slate-600 text-xs mt-0.5">
                  Rotate the 3D globe, zoom up to 9x, and select any country marker or territory for instant cost, healthcare, and visa previews.
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowMap(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 via-indigo-600 to-amber-600 hover:from-teal-700 hover:via-indigo-700 hover:to-amber-700 text-white font-bold text-xs transition-all shrink-0 self-start sm:self-auto shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>Open 3D World Atlas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </motion.button>
          </motion.div>
        )}

        {/* Directory Grid */}
        <div>
          {filteredCountries.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-16 text-center bg-white rounded-3xl border border-slate-200/90 shadow-xs"
            >
              <Compass className="w-10 h-10 text-indigo-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900">No destinations match your current filters</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                Try increasing your monthly budget slider, broadening visa complexity, or selecting "All" regions.
              </p>
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Reset All Filters
              </button>
            </motion.div>
          ) : (
            <div className="space-y-6 md:space-y-8">
              <motion.div
                layout
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
              >
                <AnimatePresence mode="popLayout">
                  {displayedCountries.map((country, idx) => {
                    const showOnMobile = idx < mobileVisibleCount;
                    const showOnDesktop = idx < visibleCount;
                    const visibilityClass =
                      showOnMobile && showOnDesktop
                        ? 'block'
                        : showOnMobile && !showOnDesktop
                        ? 'block md:hidden'
                        : !showOnMobile && showOnDesktop
                        ? 'hidden md:block'
                        : 'hidden';
                    return (
                      <div key={country.id} className={visibilityClass}>
                        <CountryCard country={country} index={idx} />
                      </div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>

              {/* Progressive Pagination Controls & Catchy Haven Matcher Signup Section */}
              <div className="space-y-6 md:space-y-8 pt-2 md:pt-4">

                {/* Instant Unlocked Feedback Banner right after Google/Email sign-in */}
                <AnimatePresence>
                  {justUnlockedBatch !== null && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 border border-emerald-200/90 shadow-xs flex items-center justify-between gap-3 text-xs font-bold text-emerald-950"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>
                          All {countries.length} global havens unlocked! Loaded +{justUnlockedBatch} more destinations right here.
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setJustUnlockedBatch(null)}
                        className="p-1 rounded-lg hover:bg-emerald-100 text-emerald-700 cursor-pointer"
                        aria-label="Dismiss notification"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Mobile-only 6-Card Pagination Toolbar (< md) */}
                <div className="flex md:hidden p-3.5 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-sm flex-col gap-3">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span className="font-extrabold text-slate-900">
                      Showing {mobileShownCount} of {filteredCountries.length} havens
                    </span>
                    <button
                      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                      className="p-2 rounded-xl border border-slate-200 text-slate-600 cursor-pointer"
                      title="Back to Top"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {mobileHasMore && (
                    <button
                      type="button"
                      onClick={handleMobileLoadMore}
                      className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 via-indigo-600 to-teal-700 text-white font-extrabold text-xs shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isGuestUser ? <Lock className="w-3.5 h-3.5" /> : <ChevronDown className="w-4 h-4" />}
                      <span>Load {mobileNextBatchCount} More Havens ({mobileRemainingCount} left)</span>
                    </button>
                  )}
                </div>

                {/* Desktop 24 More Havens Action Toolbar (>= md) */}
                <div className="hidden md:flex p-4 sm:p-5 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-sm flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                    <span className="font-extrabold text-slate-900">
                      Showing {Math.min(visibleCount, filteredCountries.length)} of {filteredCountries.length} havens
                    </span>
                    <div className="w-28 sm:w-40 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                      <div
                        className="h-full bg-gradient-to-r from-teal-500 via-indigo-500 to-amber-500 transition-all duration-300 rounded-full"
                        style={{
                          width: `${Math.min(100, Math.round((Math.min(visibleCount, filteredCountries.length) / filteredCountries.length) * 100))}%`,
                        }}
                      />
                    </div>
                    <span className="text-slate-400 font-mono text-[11px]">
                      ({Math.round((Math.min(visibleCount, filteredCountries.length) / filteredCountries.length) * 100)}% visible)
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                    {hasMore ? (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleLoadMore}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 via-indigo-600 to-teal-700 hover:from-teal-700 hover:via-indigo-700 hover:to-teal-800 text-white font-extrabold text-xs shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
                      >
                        {isGuestUser ? (
                          <Lock className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-4 h-4 animate-bounce" />
                        )}
                        <span>Load 24 More Havens</span>
                        <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-md font-mono">
                          +{nextBatchCount} ({remainingCount} left)
                        </span>
                      </motion.button>
                    ) : (
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-100 px-4 py-2 rounded-xl border border-slate-200">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>All {filteredCountries.length} destinations displayed</span>
                      </div>
                    )}

                    <button
                      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                      className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer shrink-0"
                      title="Back to Top"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Catchy Matcher Signup Promotion Card */}
                <HavenMatcherPromoCard variant="explore" />

              </div>
            </div>
          )}
        </div>

      </div>

      {/* Gated "Load More Havens" Google Sign-In Popup Modal (Shown Only for Guests) */}
      <AnimatePresence>
        {loadMoreGateOpen && isGuestUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setLoadMoreGateOpen(false);
              setPendingLoadMoreMode(null);
            }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              onClick={e => e.stopPropagation()}
              className="relative w-full max-w-lg rounded-3xl bg-white border border-indigo-200/90 shadow-2xl shadow-indigo-950/25 overflow-hidden"
            >
              {/* Multi-Colored Top Ribbon */}
              <div className="h-1.5 w-full bg-gradient-to-r from-indigo-600 via-teal-500 via-55% to-amber-500" />

              <button
                type="button"
                onClick={() => {
                  setLoadMoreGateOpen(false);
                  setPendingLoadMoreMode(null);
                }}
                className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close sign-in popup"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="p-6 sm:p-7 space-y-5">
                {/* Curiosity Eyebrow & Stats */}
                <div className="text-center space-y-2.5">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-50 via-teal-50 to-amber-50 border border-indigo-200/80 text-[11px] font-extrabold uppercase tracking-wider text-indigo-800">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>
                      {pendingLoadMoreMode === 'mobile' ? mobileRemainingCount : remainingCount} More Hidden Havens Waiting
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight leading-snug">
                    Don&apos;t miss the hidden gems beyond the top{' '}
                    <span className="bg-gradient-to-r from-indigo-600 via-teal-600 to-amber-600 bg-clip-text text-transparent">
                      {pendingLoadMoreMode === 'mobile' ? mobileShownCount : Math.min(visibleCount, filteredCountries.length)}
                    </span>
                    .
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
                    Sign in free with Google in one click to unlock all{' '}
                    <strong className="text-slate-900">{filteredCountries.length}</strong> matching havens right here—plus unlimited comparisons, 35-page PDF dossiers, and live FIRE runway syncing.
                  </p>
                </div>

                {/* Teaser Stat Chips */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2.5 rounded-2xl bg-gradient-to-br from-indigo-50/90 to-white border border-indigo-200/80 text-center">
                    <div className="font-mono text-base sm:text-lg font-black text-indigo-900 tabular-nums">
                      {countries.length}
                    </div>
                    <div className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">
                      Total Havens
                    </div>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-gradient-to-br from-teal-50/90 to-white border border-teal-200/80 text-center">
                    <div className="font-mono text-base sm:text-lg font-black text-teal-900 tabular-nums">
                      +{pendingLoadMoreMode === 'mobile' ? mobileRemainingCount : remainingCount}
                    </div>
                    <div className="text-[10px] font-bold text-teal-700 uppercase tracking-wider">
                      Ready to Load
                    </div>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-50/90 to-white border border-amber-200/80 text-center">
                    <div className="font-mono text-base sm:text-lg font-black text-amber-900 tabular-nums">
                      $0
                    </div>
                    <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                      Free Forever
                    </div>
                  </div>
                </div>

                {/* Error Banner */}
                {authError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
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
                    onClick={handleContinueWithGoogleGate}
                    className="w-full min-h-[50px] px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-teal-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-black text-sm sm:text-base shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60 transition-all"
                  >
                    {isGoogleLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Unlocking all havens...</span>
                      </>
                    ) : (
                      <>
                        <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center shrink-0 shadow-2xs">
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" aria-hidden="true">
                            <path
                              fill="#4285F4"
                              d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.44a5.5 5.5 0 0 1-2.39 3.61v3h3.87c2.26-2.08 3.57-5.15 3.57-8.64Z"
                            />
                            <path
                              fill="#34A853"
                              d="M12 24c3.24 0 5.95-1.07 7.93-2.91l-3.87-3c-1.07.72-2.44 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.95H1.3v3.09A12 12 0 0 0 12 24Z"
                            />
                            <path
                              fill="#FBBC05"
                              d="M5.29 14.29A7.2 7.2 0 0 1 4.91 12c0-.8.14-1.57.38-2.29V6.62H1.3A12 12 0 0 0 0 12c0 1.94.46 3.77 1.3 5.38l3.99-3.09Z"
                            />
                            <path
                              fill="#EA4335"
                              d="M12 4.75c1.76 0 3.34.61 4.58 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.3 6.62l3.99 3.09C6.23 6.86 8.88 4.75 12 4.75Z"
                            />
                          </svg>
                        </span>
                        <span>Continue with Google &amp; Load More</span>
                      </>
                    )}
                  </motion.button>

                  <button
                    type="button"
                    onClick={handleEmailFallbackGate}
                    className="w-full py-2 text-xs font-bold text-slate-600 hover:text-indigo-700 transition-colors cursor-pointer text-center"
                  >
                    Or sign in / sign up free with Email &amp; Password
                  </button>
                </div>

                {/* Clean Value Bullets */}
                <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-semibold text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Stay right on this page</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span>Save &amp; compare shortlists</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>100% free • No card</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

