import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { CountryThumbnail } from './CountryThumbnail';
import { CountryFlag } from './CountryFlag';
import { getCountryTravelLeisureScore } from '../data/countryTravelMobility';
import {
  CONTINENT_FILTER_OPTIONS,
  ContinentFilter,
  getCountryContinentLabel,
  matchesContinentFilter,
} from '../utils/continents';
import {
  Compass, Sparkles, Flame, ArrowRight, Heart,
  ShieldCheck, Sun, Globe, Users, CheckCircle2,
  SlidersHorizontal, ChevronRight,
  LogIn, UserPlus, RotateCcw, Wallet, HeartPulse, Plane, Layers
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const {
    countries,
    navigateToCountry,
    setCurrentView,
    openAuthModal,
    isAuthenticated,
    currentUserId,
    isCountrySaved,
    toggleSaveCountry,
    isCountryCompared,
    toggleCompareCountry,
    setSelectedRegion,
    setSelectedClimate,
    setSearchQuery,
  } = useApp();

  // -------------------------------------------------------------
  // 1. Unified Interactive Match Engine & Verified Haven Directory State
  // -------------------------------------------------------------
  const [matchBudget, setMatchBudget] = useState<number>(2800);
  const [strictBudgetFilter, setStrictBudgetFilter] = useState<boolean>(false);
  const [matchPriority, setMatchPriority] = useState<'value' | 'healthcare' | 'safety' | 'leisure'>('leisure');
  const [previewContinent, setPreviewContinent] = useState<ContinentFilter>('All');

  // Continent counts across all countries
  const continentCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const opt of CONTINENT_FILTER_OPTIONS) {
      counts[opt.value] = countries.filter(c => matchesContinentFilter(c, opt.value)).length;
    }
    return counts;
  }, [countries]);

  // Compute match score, filter by continent and strict budget, and sort by live match fit
  const sortedMatchedCountries = useMemo(() => {
    const scored = countries.map(country => {
      let score = 68; // baseline

      // Budget match (up to 16 pts)
      const diff = matchBudget - country.costOfLiving.monthlyBudgetCoupleUSD;
      if (diff >= 400) {
        score += 16; // comfortably under budget
      } else if (diff >= 0) {
        score += 13; // within budget
      } else if (diff >= -450) {
        score += 6; // slightly over
      } else {
        score -= 8;
      }

      // Priority factor (up to 15 pts)
      const travelScore = getCountryTravelLeisureScore(country);
      if (matchPriority === 'value') {
        if (country.costOfLiving.monthlyBudgetCoupleUSD <= 2000) score += 15;
        else if (country.costOfLiving.monthlyBudgetCoupleUSD <= 2800) score += 11;
        else score += 5;
      } else if (matchPriority === 'healthcare') {
        score += (country.lifestyle.healthcareScore / 100) * 15;
      } else if (matchPriority === 'safety') {
        score += (country.lifestyle.safetyScore / 100) * 15;
      } else if (matchPriority === 'leisure') {
        score += (travelScore / 100) * 15;
      }

      const normalizedScore = Math.min(99, Math.max(68, Math.round(score)));
      return { country, matchScore: normalizedScore, travelScore };
    });

    // Apply Continent and Strict Budget filters
    const filtered = scored.filter(({ country }) => {
      if (!matchesContinentFilter(country, previewContinent)) {
        return false;
      }
      if (strictBudgetFilter && country.costOfLiving.monthlyBudgetCoupleUSD > matchBudget) {
        return false;
      }
      return true;
    });

    // Always rank by live Match Score (with Priority metric tie-breaker)
    filtered.sort((a, b) => {
      if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
      if (matchPriority === 'value') {
        return a.country.costOfLiving.monthlyBudgetCoupleUSD - b.country.costOfLiving.monthlyBudgetCoupleUSD;
      }
      if (matchPriority === 'healthcare') {
        return b.country.lifestyle.healthcareScore - a.country.lifestyle.healthcareScore;
      }
      if (matchPriority === 'safety') {
        return b.country.lifestyle.safetyScore - a.country.lifestyle.safetyScore;
      }
      return b.travelScore - a.travelScore;
    });

    return filtered;
  }, [
    countries,
    matchBudget,
    strictBudgetFilter,
    matchPriority,
    previewContinent,
  ]);

  const displayedCountries = sortedMatchedCountries.slice(0, 12);
  const remainingCountriesCount = Math.max(0, sortedMatchedCountries.length - displayedCountries.length);

  const handleResetMatchEngine = () => {
    setMatchBudget(2800);
    setStrictBudgetFilter(false);
    setMatchPriority('leisure');
    setPreviewContinent('All');
  };

  const handleOpenAdvancedExplorer = () => {
    setSelectedRegion(previewContinent);
    setSelectedClimate('All');
    setSearchQuery('');
    setCurrentView('explore');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // -------------------------------------------------------------
  // 2. Interactive FIRE Calculator State (similar to dashboard)
  // -------------------------------------------------------------
  const [currentNetWorth, setCurrentNetWorth] = useState<number>(250000);
  const [targetMonthlyExpenseAbroad, setTargetMonthlyExpenseAbroad] = useState<number>(2400);
  const [domesticMonthlyExpense, setDomesticMonthlyExpense] = useState<number>(4800);
  const [annualSavings, setAnnualSavings] = useState<number>(25000);
  const [safeWithdrawalRate, setSafeWithdrawalRate] = useState<number>(4.0); // 4% rule
  const [expectedGrowthRate] = useState<number>(7.0); // 7% real return

  // FIRE calculations
  const annualExpenseAbroad = targetMonthlyExpenseAbroad * 12;
  const annualExpenseDomestic = domesticMonthlyExpense * 12;
  const swrDecimal = Math.max(0.01, safeWithdrawalRate / 100);

  const fireNestEggAbroad = Math.round(annualExpenseAbroad / swrDecimal);
  const fireNestEggDomestic = Math.round(annualExpenseDomestic / swrDecimal);
  const capitalSaved = fireNestEggDomestic - fireNestEggAbroad;
  const capitalSavedPercent = Math.round((capitalSaved / fireNestEggDomestic) * 100);

  // Time to reach FIRE nest egg function
  const calculateYearsToFire = (targetNestEgg: number, currentSavings: number, annualContribution: number, rate: number) => {
    if (currentSavings >= targetNestEgg) return 0;
    if (annualContribution <= 0 && rate <= 0) return 99;
    const r = rate / 100;
    let balance = currentSavings;
    let years = 0;
    while (balance < targetNestEgg && years < 60) {
      balance = balance * (1 + r) + annualContribution;
      years++;
    }
    return years;
  };

  const yearsToFireAbroad = calculateYearsToFire(fireNestEggAbroad, currentNetWorth, annualSavings, expectedGrowthRate);
  const yearsToFireDomestic = calculateYearsToFire(fireNestEggDomestic, currentNetWorth, annualSavings, expectedGrowthRate);
  const yearsSaved = Math.max(0, yearsToFireDomestic - yearsToFireAbroad);
  const fireProgressPercent = Math.min(100, Math.round((currentNetWorth / Math.max(1, fireNestEggAbroad)) * 100));
  const fireProgressDomesticPercent = Math.min(100, Math.round((currentNetWorth / Math.max(1, fireNestEggDomestic)) * 100));
  const swrMultiplier = +(100 / safeWithdrawalRate).toFixed(1);

  // Top 4 matching countries dynamically synced with the user's FIRE Calculator inputs
  const fireMatchedCountries = useMemo(() => {
    const useSingleBasis = targetMonthlyExpenseAbroad < 1350;

    const evaluated = countries.map(country => {
      const referenceMonthlyCost = useSingleBasis
        ? country.costOfLiving.monthlyBudgetSingleUSD
        : country.costOfLiving.monthlyBudgetCoupleUSD;
      const countryNestEgg = Math.round((referenceMonthlyCost * 12) / swrDecimal);
      const fundedPercent = Math.min(100, Math.round((currentNetWorth / Math.max(1, countryNestEgg)) * 100));
      const yearsToFireInCountry = calculateYearsToFire(
        countryNestEgg,
        currentNetWorth,
        annualSavings,
        expectedGrowthRate
      );
      const budgetDelta = targetMonthlyExpenseAbroad - referenceMonthlyCost;
      const qualityScore =
        (country.lifestyle.healthcareScore +
          country.lifestyle.safetyScore +
          getCountryTravelLeisureScore(country)) /
        3;

      // Rank countries that fit comfortably within or near targetMonthlyExpenseAbroad
      let fitRank = qualityScore;
      if (budgetDelta >= 0 && budgetDelta <= 700) {
        fitRank += 40; // Sweet-spot match under user's target monthly budget
      } else if (budgetDelta > 700) {
        fitRank += 28; // Well under user's target budget
      } else if (budgetDelta >= -250) {
        fitRank += 12; // Slightly above budget
      } else {
        fitRank -= Math.abs(budgetDelta) / 20;
      }

      return {
        country,
        referenceMonthlyCost,
        budgetModeLabel: useSingleBasis ? 'Solo' : 'Couple',
        countryNestEgg,
        fundedPercent,
        yearsToFireInCountry,
        fitRank,
      };
    });

    evaluated.sort((a, b) => b.fitRank - a.fitRank);
    return evaluated.slice(0, 4);
  }, [
    countries,
    targetMonthlyExpenseAbroad,
    swrDecimal,
    currentNetWorth,
    annualSavings,
    expectedGrowthRate,
  ]);

  const scrollToSection = (id: string) => {
    const targetId = id === 'countries-grid' ? 'haven-matcher' : id;
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-20 overflow-x-hidden">

      {/* ============================================================ */}
      {/* 1. CINEMATIC HERO SECTION                                      */}
      {/* ============================================================ */}
      <section className="relative min-h-[580px] lg:min-h-[640px] flex items-center bg-slate-950 text-white overflow-hidden border-b border-indigo-950">
        {/* Background Visual: Iconic Nature & Touristic Alpine Emerald Lake Panorama */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2200&q=85"
            alt="Iconic mountain valley, sunlit lake, and nature haven panorama"
            className="w-full h-full object-cover object-center scale-105 filter brightness-[0.60] contrast-[1.08]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/92 via-indigo-950/65 to-slate-950/25" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/45" />
          {/* Ambient Multi-Color Glow Orbs */}
          <div className="pointer-events-none absolute -top-24 left-1/4 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-teal-500/15 blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-3xl space-y-6"
          >
            {/* Trust badge kicker */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-orange-500/25 via-indigo-500/25 to-teal-500/25 border border-amber-400/35 text-amber-200 text-xs font-bold backdrop-blur-md shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>{countries.length} Verified Global Havens · Updated for 2026</span>
            </div>

            {/* Impactful Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.12] text-white">
              Escape the Grind.{' '}
              <span className="bg-gradient-to-r from-amber-300 via-orange-400 to-teal-300 bg-clip-text text-transparent">
                Retire Years Earlier
              </span>{' '}
              Where Wealth Multiplies.
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-slate-200/90 font-normal leading-relaxed max-w-2xl">
              Factual, empirical data across {countries.length} countries. Model your financial freedom with our interactive FIRE calculator, explore verified visa thresholds, and discover your personalized haven match.
            </p>

            {/* Primary Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3.5">
              <motion.button
                type="button"
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => scrollToSection('haven-matcher')}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-400 hover:to-amber-500 text-slate-950 font-black text-sm sm:text-base shadow-lg shadow-orange-500/30 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>Interactive Match Engine ({countries.length} Havens)</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </motion.button>

              <motion.button
                type="button"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => scrollToSection('fire-calculator')}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-900/80 to-teal-900/80 hover:from-indigo-800 hover:to-teal-800 text-white font-bold text-sm sm:text-base border border-indigo-400/30 backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer shadow-md"
              >
                <Flame className="w-4 h-4 text-amber-400" />
                <span>Simulate FIRE Geo-Arbitrage</span>
              </motion.button>

              <motion.button
                type="button"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleOpenAdvancedExplorer}
                className="px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm sm:text-base border border-white/20 backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Globe className="w-4 h-4 text-teal-300" />
                <span>Explore Havens</span>
              </motion.button>
            </div>

            {/* Multi-Colored Social Proof Metric Tiles */}
            <div className="pt-6 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-3.5 text-xs">
              <div className="p-3.5 rounded-2xl bg-indigo-950/55 border border-indigo-400/25 backdrop-blur-md">
                <div className="text-xl sm:text-2xl font-black text-indigo-300 font-mono">{countries.length}</div>
                <div className="text-slate-300 font-medium">Verified Havens</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-amber-950/45 border border-amber-400/25 backdrop-blur-md">
                <div className="text-xl sm:text-2xl font-black text-amber-300 font-mono">55+</div>
                <div className="text-slate-300 font-medium">Living Parameters</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-emerald-950/50 border border-emerald-400/25 backdrop-blur-md">
                <div className="text-xl sm:text-2xl font-black text-emerald-300 font-mono">8.4 Yrs</div>
                <div className="text-slate-300 font-medium">Avg Earlier FIRE</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-teal-950/50 border border-teal-400/25 backdrop-blur-md">
                <div className="text-xl sm:text-2xl font-black text-teal-300 font-mono">100%</div>
                <div className="text-slate-300 font-medium">Free &amp; Ad-Free</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. CORE VALUE PILLARS                                          */}
      {/* ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-2.5 mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-xs font-extrabold text-indigo-700 uppercase tracking-widest">
            <Compass className="w-3.5 h-3.5 text-indigo-600" />
            <span>Built For Real Planners</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Everything You Need to{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-teal-600 to-amber-600 bg-clip-text text-transparent">
              Relocate Abroad with Clarity
            </span>
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            No vague sales pitches or sponsored real estate ads. Raw empirical metrics verified against government sources.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Indigo / Violet */}
          <motion.div
            whileHover={{ y: -6 }}
            transition={{ type: 'spring', stiffness: 320, damping: 24 }}
            className="relative overflow-hidden p-6 rounded-3xl bg-gradient-to-br from-indigo-50/80 via-white to-violet-50/60 border border-indigo-200/80 shadow-sm hover:shadow-xl hover:shadow-indigo-950/5 transition-shadow space-y-3.5"
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-500/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900">Live Haven Match Scoring</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Input your desired monthly budget, continent, and lifestyle priorities. Get mathematically ranked country recommendations across all {countries.length} havens.
            </p>
            <div className="pt-2">
              <button
                onClick={() => scrollToSection('haven-matcher')}
                className="text-xs font-extrabold text-indigo-700 hover:text-indigo-900 inline-flex items-center gap-1 group cursor-pointer"
              >
                <span>Try Match Engine below</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>

          {/* Card 2: Amber / Orange */}
          <motion.div
            whileHover={{ y: -6 }}
            transition={{ type: 'spring', stiffness: 320, damping: 24 }}
            className="relative overflow-hidden p-6 rounded-3xl bg-gradient-to-br from-amber-50/80 via-white to-orange-50/60 border border-amber-200/80 shadow-sm hover:shadow-xl hover:shadow-amber-950/5 transition-shadow space-y-3.5"
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500" />
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center font-bold shadow-md shadow-orange-500/20">
              <Flame className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900">FIRE Geo-Arbitrage Engine</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Calculate exact safe withdrawal rates (3.0%–5.0%) abroad. Understand how living on $2,200/mo vs $5,000/mo slashes your needed nest egg in half.
            </p>
            <div className="pt-2">
              <button
                onClick={() => scrollToSection('fire-calculator')}
                className="text-xs font-extrabold text-orange-700 hover:text-orange-900 inline-flex items-center gap-1 group cursor-pointer"
              >
                <span>Calculate your FIRE</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>

          {/* Card 3: Emerald / Teal */}
          <motion.div
            whileHover={{ y: -6 }}
            transition={{ type: 'spring', stiffness: 320, damping: 24 }}
            className="relative overflow-hidden p-6 rounded-3xl bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/60 border border-emerald-200/80 shadow-sm hover:shadow-xl hover:shadow-teal-950/5 transition-shadow space-y-3.5"
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white flex items-center justify-center font-bold shadow-md shadow-teal-500/20">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900">Vetted Visas &amp; Mobility</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              D7 Passive Income, Non-Lucrative Visas, Pensionado schemes, and Schengen rules. Plus travel ease and mobility ratings for couple and solo retirees.
            </p>
            <div className="pt-2">
              <button
                onClick={handleOpenAdvancedExplorer}
                className="text-xs font-extrabold text-teal-700 hover:text-teal-900 inline-flex items-center gap-1 group cursor-pointer"
              >
                <span>Open Advanced Haven Explorer</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. UNIFIED INTERACTIVE MATCH ENGINE & VERIFIED HAVEN DIRECTORY */}
      {/* ============================================================ */}
      <section id="haven-matcher" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div
          id="countries-grid"
          className="relative overflow-hidden p-6 sm:p-10 rounded-[2rem] bg-gradient-to-br from-indigo-50/90 via-white to-teal-50/85 text-slate-900 shadow-xl shadow-indigo-950/5 border border-indigo-200/80"
        >
          {/* Decorative Multi-Color Top Accent Ribbon & Ambient Glow Orbs */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 via-indigo-500 via-50% to-amber-500" />
          <div className="pointer-events-none absolute -top-28 -left-24 w-96 h-96 rounded-full bg-indigo-400/15 blur-3xl" />
          <div className="pointer-events-none absolute top-1/3 -right-28 w-96 h-96 rounded-full bg-teal-400/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 left-1/3 w-96 h-96 rounded-full bg-amber-300/15 blur-3xl" />

          {/* Header & Multi-Colored Badges */}
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-5 mb-8">
            <div className="max-w-3xl space-y-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-teal-600 text-white text-xs font-bold shadow-sm shadow-indigo-500/20">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                  <span>Interactive Match Engine</span>
                </div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-slate-700 text-xs font-semibold border border-indigo-200/80 shadow-2xs">
                  <Globe className="w-3.5 h-3.5 text-teal-600" />
                  <span>Top 12 Curated Matches · {countries.length} Global Retirement Havens</span>
                </div>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Find Your{' '}
                <span className="bg-gradient-to-r from-indigo-600 via-teal-600 to-amber-600 bg-clip-text text-transparent">
                  Ideal Retirement Haven
                </span>
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Tune your target monthly couple budget, primary lifestyle priority, and preferred continent to preview your top 12 live-ranked destinations—then launch the full <strong className="text-slate-900 font-semibold">Explore Havens</strong> studio for climate filters, custom sorting, and 55+ deep metrics.
              </p>
            </div>

            <motion.button
              type="button"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleOpenAdvancedExplorer}
              className="self-start lg:self-end px-5 py-3 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 hover:from-indigo-700 hover:via-violet-700 hover:to-teal-700 text-white shadow-lg shadow-indigo-950/15 text-xs sm:text-sm font-bold transition-all flex items-center gap-2.5 shrink-0 cursor-pointer border border-white/10"
            >
              <Compass className="w-4 h-4 text-amber-400" />
              <span>Explore All {countries.length} Havens</span>
              <ArrowRight className="w-4 h-4 text-teal-300" />
            </motion.button>
          </div>

          {/* Interactive Match Console (Elevated Multi-Color Control Deck) */}
          <div className="relative z-10 p-5 sm:p-7 rounded-3xl bg-white/95 backdrop-blur-xl border border-indigo-100/90 shadow-lg shadow-indigo-950/5 mb-8 space-y-6">
            
            {/* Row 1: Two-Column Core Match Parameters (Budget + Priority) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* Control 1: Monthly Couple Budget (5 cols) */}
              <div className="lg:col-span-5 p-5 rounded-2xl bg-gradient-to-br from-emerald-50/80 via-teal-50/40 to-white border border-emerald-200/80 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-emerald-950 flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-emerald-600 text-white shadow-xs">
                        <Wallet className="w-3.5 h-3.5" />
                      </span>
                      <span>Monthly Couple Budget</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <motion.span
                        key={matchBudget}
                        initial={{ scale: 0.92, opacity: 0.7 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 420, damping: 22 }}
                        className="font-mono tabular-nums px-3 py-1 rounded-xl bg-emerald-950 text-emerald-300 font-black text-sm shadow-xs"
                      >
                        ${matchBudget.toLocaleString()}/mo
                      </motion.span>
                      <button
                        type="button"
                        onClick={() => setStrictBudgetFilter(prev => !prev)}
                        title="Toggle between scoring all countries by budget fit vs strictly hiding countries above this budget"
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer border ${
                          strictBudgetFilter
                            ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-xs'
                            : 'bg-white text-slate-600 border-emerald-200 hover:bg-emerald-100/60 hover:text-emerald-950'
                        }`}
                      >
                        {strictBudgetFilter ? 'Strict ≤ Budget' : 'Score All'}
                      </button>
                    </div>
                  </div>

                  {/* Custom Progress + Range Input */}
                  <div className="space-y-2 pt-1">
                    <input
                      type="range"
                      min={1000}
                      max={5000}
                      step={50}
                      value={matchBudget}
                      onChange={e => setMatchBudget(Number(e.target.value))}
                      className="w-full h-2.5 bg-emerald-200/80 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                    />
                    <div className="flex justify-between text-[11px] text-emerald-800/80 font-mono font-semibold">
                      <span>$1,000 (Frugal)</span>
                      <span>$2,800 (Balanced)</span>
                      <span>$5,000+ (Luxury)</span>
                    </div>
                  </div>
                </div>

                {/* Quick Budget Presets */}
                <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between gap-1.5 flex-wrap">
                  <span className="text-[11px] font-bold text-emerald-900/70">Quick Tiers:</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[
                      { label: '$1.5k Lean', val: 1500 },
                      { label: '$2.4k Sweet Spot', val: 2400 },
                      { label: '$3.2k Comfort', val: 3200 },
                      { label: '$4.5k Plush', val: 4500 },
                    ].map(preset => {
                      const isPresetActive = matchBudget === preset.val;
                      return (
                        <button
                          key={preset.val}
                          type="button"
                          onClick={() => setMatchBudget(preset.val)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                            isPresetActive
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-white/90 text-emerald-900 hover:bg-emerald-100 border border-emerald-200/80'
                          }`}
                        >
                          {preset.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Control 2: Primary Priority Multi-Color Interactive Cards (7 cols) */}
              <div className="lg:col-span-7 p-5 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-violet-50/40 to-amber-50/40 border border-indigo-200/80 flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-indigo-950 flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-xs">
                      <Sparkles className="w-3.5 h-3.5" />
                    </span>
                    <span>Primary Relocation Priority</span>
                  </label>
                  <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-100/80 px-2.5 py-0.5 rounded-full">
                    Dynamically weights your live match rankings
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    {
                      id: 'value' as const,
                      label: 'Low Cost',
                      sub: 'Max Geo-Arbitrage',
                      icon: Wallet,
                      activeGrad: 'from-emerald-600 to-teal-600 text-white border-emerald-500 shadow-md shadow-emerald-600/20',
                      idleStyle: 'bg-white/90 hover:bg-emerald-50/90 text-slate-800 border-emerald-200/80',
                      iconColor: 'text-emerald-600',
                    },
                    {
                      id: 'healthcare' as const,
                      label: 'Healthcare',
                      sub: 'Hospitals & Care',
                      icon: HeartPulse,
                      activeGrad: 'from-rose-600 to-pink-600 text-white border-rose-500 shadow-md shadow-rose-600/20',
                      idleStyle: 'bg-white/90 hover:bg-rose-50/90 text-slate-800 border-rose-200/80',
                      iconColor: 'text-rose-600',
                    },
                    {
                      id: 'safety' as const,
                      label: 'Top Safety',
                      sub: 'Peace & Stability',
                      icon: ShieldCheck,
                      activeGrad: 'from-indigo-600 to-blue-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20',
                      idleStyle: 'bg-white/90 hover:bg-indigo-50/90 text-slate-800 border-indigo-200/80',
                      iconColor: 'text-indigo-600',
                    },
                    {
                      id: 'leisure' as const,
                      label: 'Travel & Leisure',
                      sub: 'Culture & Mobility',
                      icon: Plane,
                      activeGrad: 'from-amber-500 to-orange-600 text-white border-amber-500 shadow-md shadow-orange-600/20',
                      idleStyle: 'bg-white/90 hover:bg-amber-50/90 text-slate-800 border-amber-200/80',
                      iconColor: 'text-amber-600',
                    },
                  ].map(item => {
                    const Icon = item.icon;
                    const isSelected = matchPriority === item.id;
                    return (
                      <motion.button
                        key={item.id}
                        type="button"
                        whileHover={{ y: -2, scale: 1.01 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setMatchPriority(item.id)}
                        className={`relative p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                          isSelected ? `bg-gradient-to-br ${item.activeGrad}` : item.idleStyle
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`p-2 rounded-lg ${
                              isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 ' + item.iconColor
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </span>
                          {isSelected && (
                            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white">
                              Active
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-extrabold leading-tight">{item.label}</div>
                          <div
                            className={`text-[10px] font-medium mt-0.5 ${
                              isSelected ? 'text-white/85' : 'text-slate-500'
                            }`}
                          >
                            {item.sub}
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Row 2: Continent & Region Filter Ribbon + Reset Controls */}
            <div className="pt-5 border-t border-indigo-100/80 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-2.5 flex-1">
                <div className="flex items-center justify-between sm:justify-start gap-3">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-teal-600" />
                    <span>Continent &amp; Region Filter</span>
                  </label>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200/80">
                    {sortedMatchedCountries.length} matching destinations
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {CONTINENT_FILTER_OPTIONS.map(option => {
                    const active = previewContinent === option.value;
                    const count = continentCounts[option.value] ?? 0;
                    return (
                      <motion.button
                        key={option.value}
                        type="button"
                        whileHover={{ y: -1.5 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => setPreviewContinent(option.value)}
                        className={`relative px-3.5 py-2 text-xs rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 ${
                          active
                            ? 'bg-gradient-to-r from-indigo-600 via-violet-600 to-teal-600 text-white shadow-md shadow-indigo-600/20'
                            : 'bg-slate-100/90 text-slate-700 hover:bg-indigo-50 hover:text-indigo-950 border border-slate-200/70'
                        }`}
                      >
                        <span>{option.label}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono font-extrabold ${
                            active
                              ? 'bg-white/20 text-white'
                              : 'bg-white text-slate-600 border border-slate-200/60'
                          }`}
                        >
                          {count}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Reset & Quick Explore Actions */}
              <div className="flex items-center gap-2.5 self-start lg:self-end shrink-0">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleResetMatchEngine}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200/80 hover:border-rose-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Filters</span>
                </motion.button>
              </div>
            </div>

          </div>

          {/* Results Header Strip */}
          <div className="relative z-10 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-950 bg-indigo-100/80 border border-indigo-200/80 px-3 py-1 rounded-full">
                  Top {displayedCountries.length} Live Matches (of {sortedMatchedCountries.length})
                </span>
                {previewContinent !== 'All' && (
                  <span className="px-3 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-teal-600 text-white text-xs font-bold shadow-2xs">
                    Region: {previewContinent}
                  </span>
                )}
                {strictBudgetFilter && (
                  <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold">
                    Strict ≤ ${matchBudget.toLocaleString()}/mo
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleOpenAdvancedExplorer}
                className="text-indigo-700 hover:text-teal-700 text-xs sm:text-sm font-extrabold inline-flex items-center gap-1.5 cursor-pointer self-start sm:self-auto transition-colors group"
              >
                <span>Need Climate Filters or Custom Sorting? Open Explore Havens</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>

            {/* Empty State if filters are too restrictive */}
            {displayedCountries.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-12 rounded-3xl bg-white/95 border border-indigo-100 text-center space-y-4 shadow-md"
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto text-indigo-600">
                  <Compass className="w-6 h-6" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">
                  No destinations match this strict budget &amp; region combination
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  Try increasing your Monthly Couple Budget slider, switching from &ldquo;Strict ≤ Budget&rdquo; to &ldquo;Score All&rdquo;, or selecting &ldquo;All Continents&rdquo;.
                </p>
                <button
                  type="button"
                  onClick={handleResetMatchEngine}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700 text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
                >
                  Reset Match Engine Filters
                </button>
              </motion.div>
            ) : (
              /* Buttery-Smooth Animated 12-Card Top Match Grid */
              <motion.div
                layout
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
              >
                <AnimatePresence mode="popLayout">
                  {displayedCountries.map(({ country, matchScore, travelScore }, idx) => {
                    const saved = isCountrySaved(country.id);
                    const compared = isCountryCompared(country.id);
                    const continentLabel = getCountryContinentLabel(country);
                    const isUnderBudget = country.costOfLiving.monthlyBudgetCoupleUSD <= matchBudget;

                    // Multi-colored top accent bar per card rank/continent
                    const cardAccentGradients = [
                      'from-emerald-500 via-teal-500 to-cyan-500',
                      'from-indigo-500 via-violet-500 to-purple-500',
                      'from-amber-500 via-orange-500 to-rose-500',
                      'from-teal-500 via-indigo-500 to-amber-500',
                    ];
                    const accentGrad = cardAccentGradients[idx % cardAccentGradients.length];

                    return (
                      <motion.div
                        layout
                        key={country.id}
                        initial={{ opacity: 0, y: 20, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.92 }}
                        transition={{
                          type: 'spring',
                          stiffness: 300,
                          damping: 26,
                          delay: idx * 0.025,
                        }}
                        whileHover={{ y: -6 }}
                        onClick={() => navigateToCountry(country.id)}
                        className="group relative bg-white rounded-2xl border border-indigo-100/90 overflow-hidden hover:border-indigo-300 transition-shadow cursor-pointer flex flex-col justify-between shadow-sm hover:shadow-xl hover:shadow-indigo-950/10"
                      >
                        {/* Top Multi-Colored Accent Bar */}
                        <div className={`h-1.5 w-full bg-gradient-to-r ${accentGrad}`} />

                        <div>
                          {/* Photo Header */}
                          <div className="h-44 relative overflow-hidden">
                            <CountryThumbnail
                              country={country}
                              hideLandmarkLabel
                              className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-105"
                            />

                            {/* Top-left Rank & Continent pill */}
                            <div className="absolute top-3 left-3 flex items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded-full bg-indigo-600/90 backdrop-blur-md text-white text-[10px] font-black shadow-xs">
                                #{idx + 1}
                              </span>
                              <span className="px-2.5 py-0.5 rounded-full bg-slate-950/75 backdrop-blur-md text-white text-[11px] font-semibold border border-white/15">
                                {continentLabel}
                              </span>
                            </div>

                            {/* Top-right Match Score & Save Heart */}
                            <div className="absolute top-3 right-3 flex items-center gap-1.5">
                              <div
                                className={`px-2.5 py-1 rounded-full backdrop-blur-md text-xs font-black flex items-center gap-1 shadow-md border ${
                                  matchScore >= 90
                                    ? 'bg-emerald-950/85 text-emerald-300 border-emerald-400/30'
                                    : matchScore >= 82
                                    ? 'bg-indigo-950/85 text-amber-300 border-indigo-400/30'
                                    : 'bg-slate-950/80 text-amber-200 border-white/15'
                                }`}
                              >
                                <Sparkles className="w-3 h-3 text-amber-400" />
                                <span>{matchScore}% Match</span>
                              </div>
                              <button
                                type="button"
                                onClick={e => {
                                  e.stopPropagation();
                                  toggleSaveCountry(country.id);
                                }}
                                title={saved ? 'Remove from Saved' : 'Save to Favorites'}
                                className={`p-1.5 rounded-full backdrop-blur-md transition-all cursor-pointer ${
                                  saved
                                    ? 'bg-rose-500 text-white scale-110 shadow-sm'
                                    : 'bg-slate-950/70 text-slate-200 hover:text-white hover:bg-rose-500/80'
                                }`}
                              >
                                <Heart className="w-3.5 h-3.5 fill-current" />
                              </button>
                            </div>

                            {/* Bottom Country Flag & Name */}
                            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <CountryFlag
                                  countryName={country.name}
                                  countryCode={country.code}
                                  fallbackEmoji={country.flag}
                                  className="w-6 h-6 shadow-md rounded shrink-0"
                                />
                                <span className="font-extrabold text-white text-base drop-shadow-md truncate">
                                  {country.name}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Content details */}
                          <div className="p-4 space-y-3">
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div
                                className={`p-2.5 rounded-xl border ${
                                  isUnderBudget
                                    ? 'bg-emerald-50/70 border-emerald-200/80'
                                    : 'bg-amber-50/70 border-amber-200/80'
                                }`}
                              >
                                <span
                                  className={`font-semibold block text-[10px] uppercase tracking-wider ${
                                    isUnderBudget ? 'text-emerald-700' : 'text-amber-700'
                                  }`}
                                >
                                  Couple Budget
                                </span>
                                <span
                                  className={`font-mono tabular-nums font-extrabold text-sm ${
                                    isUnderBudget ? 'text-emerald-950' : 'text-amber-950'
                                  }`}
                                >
                                  ${country.costOfLiving.monthlyBudgetCoupleUSD.toLocaleString()}/mo
                                </span>
                              </div>
                              <div className="p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-200/70">
                                <span className="text-indigo-700 font-semibold block text-[10px] uppercase tracking-wider">
                                  Travel &amp; Leisure
                                </span>
                                <span className="font-mono tabular-nums font-extrabold text-indigo-950 text-sm">
                                  {travelScore}/100
                                </span>
                              </div>
                            </div>

                            <p className="text-xs text-slate-600 line-clamp-1 leading-relaxed font-medium">
                              {country.tagline}
                            </p>

                            <div className="text-xs text-slate-600 space-y-1.5 border-t border-slate-100 pt-2.5">
                              <div className="flex items-center justify-between gap-1.5 text-slate-700">
                                <span className="inline-flex items-center gap-1">
                                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                                  <span>Safety</span>
                                  <strong className="font-mono font-bold text-slate-900">
                                    {country.lifestyle.safetyScore}
                                  </strong>
                                </span>
                                <span className="text-slate-300">·</span>
                                <span className="inline-flex items-center gap-1">
                                  <HeartPulse className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                  <span>Health</span>
                                  <strong className="font-mono font-bold text-slate-900">
                                    {country.lifestyle.healthcareScore}
                                  </strong>
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 text-slate-700">
                                <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                <span className="truncate">
                                  <strong className="font-mono font-bold text-slate-900">
                                    {country.climate.annualSunnyDays}
                                  </strong>{' '}
                                  sunny days ·{' '}
                                  <span className="px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200/70 font-semibold text-[10px]">
                                    {country.climate.category}
                                  </span>
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                                <span className="font-semibold text-teal-800 truncate">
                                  Visa:{' '}
                                  {country.visa.minimumIncomeUSD > 0
                                    ? `$${country.visa.minimumIncomeUSD.toLocaleString()}/mo min`
                                    : 'Accessible'}
                                </span>
                                <span className="text-slate-400 font-medium shrink-0">{country.capital}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Card Footer with Compare & Dossier CTA */}
                        <div className="p-4 pt-0 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              toggleCompareCountry(country.id);
                            }}
                            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer shrink-0 ${
                              compared
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/70 hover:text-indigo-950'
                            }`}
                          >
                            {compared ? 'In Matrix' : '+ Compare'}
                          </button>
                          <div className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-slate-900 to-indigo-950 group-hover:from-indigo-600 group-hover:to-teal-600 text-white text-xs font-bold text-center transition-all flex items-center justify-center gap-1.5 shadow-2xs">
                            <span>View Dossier</span>
                            <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Lighter Themed Matching Havens & Sign Up Conversion Portal */}
            {sortedMatchedCountries.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45 }}
                className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-indigo-50/50 to-teal-50/60 text-slate-900 p-6 sm:p-8 shadow-xl shadow-indigo-950/5 border border-indigo-200/90 mt-6"
              >
                {/* Decorative Top Accent Ribbon & Ambient Glows */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 via-indigo-500 via-50% to-amber-500" />
                <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full bg-teal-400/15 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-indigo-500/15 blur-3xl" />

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 lg:gap-8">
                  <div className="space-y-3.5 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100/90 border border-indigo-200/90 text-indigo-950 text-xs font-bold shadow-2xs">
                        <Layers className="w-3.5 h-3.5 text-indigo-600" />
                        <span>
                          {remainingCountriesCount > 0
                            ? `+${remainingCountriesCount} More Matching Havens Waiting in Full Directory`
                            : `Unlock Full 55+ Parameter Intelligence Across All ${countries.length} Havens`}
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100/80 border border-emerald-200/80 text-emerald-900 text-[11px] font-bold">
                        <Sparkles className="w-3 h-3 text-emerald-600" />
                        100% Free · No Card Required
                      </span>
                    </div>

                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
                      Still Confused?{' '}
                      <span className="bg-gradient-to-r from-indigo-600 via-teal-600 to-amber-600 bg-clip-text text-transparent">
                        Let Us Do the Hard Work for You.
                      </span>
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                      Creating an international relocation plan shouldn&apos;t require dozens of messy spreadsheets. Create your free account in seconds and our Algorithmic Retirement Haven Matcher will automatically find your ideal destinations based on your citizenship, personal financial status, and lifestyle preferences — completely 100% FREE. Or browse our complete directory with custom filters.
                    </p>

                    <div className="flex flex-wrap items-center gap-2 pt-0.5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/95 border border-indigo-200/70 text-indigo-900 text-[11px] font-semibold shadow-2xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        Custom Financial Analysis
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/95 border border-teal-200/70 text-teal-900 text-[11px] font-semibold shadow-2xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        Visa Feasibility by Nationality
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/95 border border-amber-200/70 text-amber-900 text-[11px] font-semibold shadow-2xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        Climate, Safety &amp; Healthcare Fit
                      </span>
                    </div>
                  </div>

                  {/* Actions Column with Signup CTA and Explore All Havens */}
                  <div className="flex flex-col items-stretch lg:items-end gap-3 shrink-0 lg:min-w-[290px]">
                    {(!isAuthenticated || currentUserId === 'guest') ? (
                      <>
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => openAuthModal('signup')}
                          className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-400 hover:to-amber-500 text-slate-950 text-xs sm:text-sm font-black shadow-lg shadow-orange-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                          <UserPlus className="w-4 h-4 text-slate-950" />
                          <span>Sign Up Free — Get Matched</span>
                          <ArrowRight className="w-4 h-4 text-slate-950" />
                        </motion.button>

                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleOpenAdvancedExplorer}
                          className="px-5 py-3 rounded-2xl bg-slate-900 hover:bg-indigo-950 text-white text-xs sm:text-sm font-bold shadow-md shadow-slate-950/10 transition-all cursor-pointer flex items-center justify-center gap-2 border border-slate-800"
                        >
                          <Compass className="w-4 h-4 text-teal-300" />
                          <span>Explore All {countries.length} Havens</span>
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        </motion.button>

                        <div className="flex items-center justify-center lg:justify-end gap-1.5 text-[11px] text-slate-500 font-medium">
                          <span>Already a member?</span>
                          <button
                            type="button"
                            onClick={() => openAuthModal('login')}
                            className="font-extrabold text-indigo-700 hover:text-indigo-950 underline cursor-pointer"
                          >
                            Sign In
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleOpenAdvancedExplorer}
                          className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-400 hover:to-amber-500 text-slate-950 text-xs sm:text-sm font-black shadow-lg shadow-orange-500/25 transition-all cursor-pointer flex items-center justify-center gap-2.5"
                        >
                          <Compass className="w-4 h-4 text-slate-950" />
                          <span>
                            Explore All {countries.length} Havens in Directory
                          </span>
                          <ArrowRight className="w-4 h-4 text-slate-950" />
                        </motion.button>

                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setCurrentView('dashboard');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="px-5 py-2.5 rounded-xl bg-white hover:bg-indigo-50/80 text-indigo-900 text-xs font-bold border border-indigo-200 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-2xs"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Go to Member Dashboard</span>
                        </motion.button>
                      </>
                    )}

                    <span className="text-[11px] text-slate-500 text-center lg:text-right font-medium">
                      Auto-transfers your active filters ({previewContinent})
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. INTERACTIVE FIRE CALCULATOR SHOWCASE                         */}
      {/* ============================================================ */}
      <section id="fire-calculator" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="relative overflow-hidden p-6 sm:p-10 rounded-[2rem] bg-gradient-to-br from-amber-50/75 via-white to-emerald-50/75 border border-amber-200/80 shadow-xl shadow-amber-950/5">
          {/* Decorative Multi-Color Top Ribbon & Ambient Orbs */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 via-50% to-emerald-500" />
          <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-amber-400/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-emerald-400/15 blur-3xl" />

          <div className="relative z-10 max-w-3xl mb-8 space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white text-xs font-bold shadow-xs">
              <Flame className="w-3.5 h-3.5 text-amber-100" />
              <span>International Geo-Arbitrage Engine</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Calculate Your{' '}
              <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-emerald-600 bg-clip-text text-transparent">
                FIRE Timeline Abroad
              </span>
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Living in an overseas haven with a high standard of living can reduce your required retirement portfolio by 40% to 65%, enabling you to retire a decade sooner.
            </p>
          </div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Multi-Colored Interactive Inputs */}
            <div className="lg:col-span-6 space-y-5 bg-white/95 backdrop-blur-xl p-6 rounded-3xl border border-amber-200/80 shadow-md">
              
              <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-200/70 space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-extrabold text-indigo-950 uppercase tracking-wider">Current Invested Assets</label>
                  <motion.span
                    key={currentNetWorth}
                    initial={{ scale: 0.92 }}
                    animate={{ scale: 1 }}
                    className="font-mono font-black px-2.5 py-0.5 rounded-lg bg-indigo-950 text-indigo-200 text-sm"
                  >
                    ${currentNetWorth.toLocaleString()}
                  </motion.span>
                </div>
                <input
                  type="range"
                  min="20000"
                  max="1500000"
                  step="10000"
                  value={currentNetWorth}
                  onChange={e => setCurrentNetWorth(Number(e.target.value))}
                  className="w-full h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-[11px] text-indigo-700/80 font-mono">
                  <span>$20k</span>
                  <span>$500k</span>
                  <span>$1.5M+</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-extrabold text-amber-950 uppercase tracking-wider">Target Monthly Budget Abroad</label>
                  <motion.span
                    key={targetMonthlyExpenseAbroad}
                    initial={{ scale: 0.92 }}
                    animate={{ scale: 1 }}
                    className="font-mono font-black px-2.5 py-0.5 rounded-lg bg-amber-500 text-slate-950 text-sm"
                  >
                    ${targetMonthlyExpenseAbroad.toLocaleString()}/mo
                  </motion.span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="4500"
                  step="100"
                  value={targetMonthlyExpenseAbroad}
                  onChange={e => setTargetMonthlyExpenseAbroad(Number(e.target.value))}
                  className="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                />
                <div className="flex justify-between text-[11px] text-amber-800/80 font-mono">
                  <span>$500 (Ultra-Lean)</span>
                  <span>$2,400 (Algarve / Spain)</span>
                  <span>$4,500 (Fat FIRE)</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-extrabold text-slate-800 uppercase tracking-wider">Current Domestic Monthly Cost (At Home)</label>
                  <span className="font-mono font-black px-2.5 py-0.5 rounded-lg bg-slate-800 text-white text-sm">
                    ${domesticMonthlyExpense.toLocaleString()}/mo
                  </span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="8000"
                  step="100"
                  value={domesticMonthlyExpense}
                  onChange={e => setDomesticMonthlyExpense(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-700"
                />
                <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                  <span>$500</span>
                  <span>$4,000 (Global Avg)</span>
                  <span>$8,000</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <label className="font-extrabold text-emerald-950">Annual Savings</label>
                    <span className="font-mono font-black text-emerald-800">
                      ${annualSavings >= 1000 ? `${(annualSavings / 1000).toFixed(0)}k` : annualSavings.toLocaleString()}/yr
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1000"
                    max="100000"
                    step="1000"
                    value={annualSavings}
                    onChange={e => setAnnualSavings(Number(e.target.value))}
                    className="w-full h-2 bg-emerald-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                  <div className="flex justify-between text-[10px] text-emerald-700 font-mono">
                    <span>$1k</span>
                    <span>$50k</span>
                    <span>$100k</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-200/80 space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <label className="font-extrabold text-teal-950">Safe Withdrawal (SWR)</label>
                    <span className="font-mono font-black text-teal-900">
                      {safeWithdrawalRate.toFixed(1)}% <span className="text-[10px] font-semibold text-teal-700">({swrMultiplier}x)</span>
                    </span>
                  </div>
                  <input
                    type="range"
                    min="3.0"
                    max="5.0"
                    step="0.1"
                    value={safeWithdrawalRate}
                    onChange={e => setSafeWithdrawalRate(Number(e.target.value))}
                    className="w-full h-2 bg-teal-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                  />
                  <div className="flex justify-between text-[10px] text-teal-700 font-mono">
                    <span>3.0% (33.3x)</span>
                    <span>4.0% (25x)</span>
                    <span>5.0% (20x)</span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-50/60 to-teal-50/60 border border-indigo-200/60 text-[11px] text-slate-600 leading-relaxed">
                <span className="font-bold text-indigo-950">How SWR works:</span> Nest Egg = Annual Spending ÷ SWR. A <span className="font-semibold text-slate-800">lower SWR</span> (e.g., 3.0%) means withdrawing a smaller slice of your portfolio each year for safety, which requires a <span className="font-semibold text-slate-800">larger nest egg ({swrMultiplier}x annual expenses)</span> and more years to save.
              </div>

            </div>

            {/* Right Column: Comparative Results */}
            <div className="lg:col-span-6 space-y-5">
              
              {/* Highlight Comparison Cards */}
              <div className="grid grid-cols-2 gap-4">
                <motion.div
                  whileHover={{ y: -3 }}
                  className="relative overflow-hidden p-5 rounded-3xl bg-gradient-to-br from-amber-50 via-orange-50/80 to-white border border-amber-300/90 shadow-sm space-y-1"
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
                  <span className="text-xs font-extrabold text-orange-800 uppercase tracking-wide">
                    Nest Egg Needed Abroad
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-orange-950 font-mono tabular-nums">
                    ${fireNestEggAbroad.toLocaleString()}
                  </div>
                  <div className="text-xs text-orange-700 font-medium">
                    ${annualExpenseAbroad.toLocaleString()}/yr × {swrMultiplier} ({safeWithdrawalRate.toFixed(1)}% SWR)
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ y: -3 }}
                  className="relative overflow-hidden p-5 rounded-3xl bg-gradient-to-br from-slate-100 via-slate-50 to-white border border-slate-300/80 shadow-sm space-y-1"
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-slate-500 to-indigo-500" />
                  <span className="text-xs font-extrabold text-slate-600 uppercase tracking-wide">
                    Nest Egg Needed at Home
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-slate-800 font-mono tabular-nums">
                    ${fireNestEggDomestic.toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    ${annualExpenseDomestic.toLocaleString()}/yr × {swrMultiplier} ({safeWithdrawalRate.toFixed(1)}% SWR)
                  </div>
                </motion.div>
              </div>

              {/* Geo-Arbitrage Savings Banner */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 text-white shadow-lg shadow-teal-950/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-100">
                    {capitalSaved >= 0 ? 'Capital Required Slashed' : 'Target Lifestyle Comparison'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-xs font-extrabold backdrop-blur-md">
                    {capitalSaved >= 0
                      ? `${capitalSavedPercent}% Less Capital`
                      : `${Math.abs(capitalSavedPercent)}% Higher Target`}
                  </span>
                </div>
                <div className="text-2xl sm:text-3xl font-black">
                  {capitalSaved >= 0
                    ? `Save $${capitalSaved.toLocaleString()} in Required Net Worth`
                    : `+$${Math.abs(capitalSaved).toLocaleString()} Additional Nest Egg vs. Home`}
                </div>
                <p className="text-xs text-emerald-50/90 leading-relaxed">
                  With ${currentNetWorth.toLocaleString()} invested today, you have already funded{' '}
                  <span className="font-extrabold text-amber-300">{fireProgressPercent}%</span> of your abroad retirement goal (vs.{' '}
                  <span className="font-extrabold text-white">{fireProgressDomesticPercent}%</span> of your domestic goal).
                </p>
              </div>

              {/* Years to Retirement Comparison */}
              <div className="p-6 rounded-3xl bg-white/95 backdrop-blur-xl border border-indigo-100 shadow-md space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                    Years to Financial Freedom
                  </span>
                  <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-300 text-xs font-extrabold text-orange-800">
                    {yearsToFireAbroad === 0 && yearsToFireDomestic === 0
                      ? 'Ready Today (Abroad & At Home)!'
                      : yearsToFireAbroad === 0
                      ? `Ready Abroad Today! (${yearsSaved} ${yearsSaved === 1 ? 'Yr' : 'Yrs'} Sooner Than Home)`
                      : yearsSaved > 0
                      ? `Retire ${yearsSaved} ${yearsSaved === 1 ? 'Year' : 'Years'} Sooner Abroad!`
                      : yearsToFireAbroad === yearsToFireDomestic
                      ? `Same Timeline (${yearsToFireAbroad} ${yearsToFireAbroad === 1 ? 'Year' : 'Years'} to Goal)`
                      : `Home Goal Reached ${yearsToFireAbroad - yearsToFireDomestic} ${
                          yearsToFireAbroad - yearsToFireDomestic === 1 ? 'Yr' : 'Yrs'
                        } Sooner`}
                  </span>
                </div>

                {/* Row 1: Retirement Abroad Timeline & Funding Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700">
                      Retire Abroad <span className="text-slate-400 font-normal">(${targetMonthlyExpenseAbroad.toLocaleString()}/mo · ${fireNestEggAbroad.toLocaleString()} goal)</span>
                    </span>
                    <span className="font-extrabold text-orange-600 font-mono">
                      {yearsToFireAbroad === 0
                        ? '0 Years (100% Funded Today!)'
                        : `${yearsToFireAbroad} ${yearsToFireAbroad === 1 ? 'Year' : 'Years'} (${fireProgressPercent}% Funded)`}
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${fireProgressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Row 2: Retirement At Home Timeline & Funding Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-600">
                      Retire at Home <span className="text-slate-400 font-normal">(${domesticMonthlyExpense.toLocaleString()}/mo · ${fireNestEggDomestic.toLocaleString()} goal)</span>
                    </span>
                    <span className="font-bold text-indigo-700 font-mono">
                      {yearsToFireDomestic === 0
                        ? '0 Years (100% Funded Today!)'
                        : `${yearsToFireDomestic} ${yearsToFireDomestic === 1 ? 'Year' : 'Years'} (${fireProgressDomesticPercent}% Funded)`}
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-400 to-slate-500 rounded-full transition-all duration-500"
                      style={{ width: `${fireProgressDomesticPercent}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <button
                    onClick={() => setCurrentView('dashboard')}
                    className="text-xs font-extrabold text-indigo-700 hover:text-teal-700 inline-flex items-center gap-1.5 cursor-pointer group"
                  >
                    <span>Open Detailed Financial Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </button>
                  <span className="text-[11px] text-slate-400">
                    Assumes {expectedGrowthRate}% annual return + ${(annualSavings / 1000).toFixed(0)}k/yr savings
                  </span>
                </div>
              </div>

            </div>

          </div>

          {/* Live Matching Retirement Havens for the User's FIRE Parameters + Signup CTA */}
          <div className="relative z-10 mt-10 pt-8 border-t border-amber-200/70 space-y-6">
            <div className="p-5 sm:p-7 rounded-3xl bg-gradient-to-br from-teal-50/85 via-white to-indigo-50/85 border border-teal-200/80 shadow-md space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-teal-600 to-indigo-600 text-white text-[11px] font-bold uppercase tracking-wider mb-2 shadow-2xs">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Live FIRE-Ready Destination Matches</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                    Top 4 Havens Matching Your ${targetMonthlyExpenseAbroad.toLocaleString()}/mo Target &amp; {safeWithdrawalRate.toFixed(1)}% SWR
                  </h3>
                </div>
                <span className="text-xs font-bold text-indigo-900 bg-white px-3.5 py-1.5 rounded-xl border border-indigo-200/80 shadow-2xs self-start sm:self-auto">
                  Ranked by budget fit, healthcare, safety &amp; portfolio readiness
                </span>
              </div>

              {/* 4 Matching Countries Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {fireMatchedCountries.map(({
                  country,
                  referenceMonthlyCost,
                  budgetModeLabel,
                  countryNestEgg,
                  fundedPercent,
                  yearsToFireInCountry,
                }, idx) => {
                  const topBarColors = [
                    'from-emerald-500 via-teal-500 to-cyan-500',
                    'from-indigo-500 via-violet-500 to-purple-500',
                    'from-amber-500 via-orange-500 to-rose-500',
                    'from-teal-500 via-indigo-500 to-amber-500',
                  ];
                  return (
                    <motion.div
                      key={country.id}
                      layout
                      whileHover={{ y: -5 }}
                      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                      onClick={() => navigateToCountry(country.id)}
                      className="group rounded-2xl bg-white border border-indigo-100 hover:border-indigo-300 transition-shadow cursor-pointer flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-xl hover:shadow-indigo-950/10"
                    >
                      <div className={`h-1.5 w-full bg-gradient-to-r ${topBarColors[idx % topBarColors.length]}`} />

                      {/* Scenic Header */}
                      <CountryThumbnail
                        country={country}
                        className="h-28"
                        hideLandmarkLabel
                      >
                        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-slate-900/75 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider border border-white/15 truncate">
                            {getCountryContinentLabel(country)}
                          </span>
                          <span
                            className={`text-[11px] font-extrabold px-2 py-0.5 rounded-md shrink-0 shadow-xs ${
                              yearsToFireInCountry === 0
                                ? 'bg-emerald-500 text-white'
                                : 'bg-amber-400 text-slate-950'
                            }`}
                          >
                            {yearsToFireInCountry === 0 ? 'FIRE Ready!' : `${yearsToFireInCountry} Yrs`}
                          </span>
                        </div>

                        <div className="absolute bottom-2.5 left-3 right-3 flex items-center gap-2">
                          <CountryFlag
                            countryCode={country.code}
                            countryName={country.name}
                            fallbackEmoji={country.flag}
                            className="w-5 h-5 rounded-xs shadow-xs shrink-0 ring-1 ring-white/30"
                          />
                          <div className="min-w-0">
                            <h4 className="text-sm font-extrabold text-white truncate drop-shadow-xs">
                              {country.name}
                            </h4>
                            <span className="text-[10px] font-medium text-slate-200 block truncate">
                              {country.climate.category}
                            </span>
                          </div>
                        </div>
                      </CountryThumbnail>

                      {/* Card Body */}
                      <div className="p-4 flex-1 flex flex-col justify-between gap-3.5">
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                                {budgetModeLabel} Budget
                              </span>
                              <span className="font-mono font-extrabold text-sm text-emerald-950 tabular-nums mt-0.5 block">
                                ${referenceMonthlyCost.toLocaleString()}/mo
                              </span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-200/80">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 block">
                                FIRE Nest Egg
                              </span>
                              <span className="font-mono font-extrabold text-sm text-indigo-950 tabular-nums mt-0.5 block">
                                ${(countryNestEgg / 1000).toFixed(0)}k
                              </span>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="font-semibold text-slate-600">Current Assets Cover</span>
                              <span
                                className={`font-mono font-extrabold tabular-nums ${
                                  fundedPercent >= 100 ? 'text-emerald-700' : 'text-indigo-700'
                                }`}
                              >
                                {fundedPercent}%
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                  fundedPercent >= 100
                                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                                    : 'bg-gradient-to-r from-indigo-500 to-teal-500'
                                }`}
                                style={{ width: `${fundedPercent}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-600">
                            Health <strong className="font-mono text-slate-900">{country.lifestyle.healthcareScore}</strong> · Safety <strong className="font-mono text-slate-900">{country.lifestyle.safetyScore}</strong>
                          </span>
                          <span className="inline-flex items-center gap-0.5 font-extrabold text-indigo-700 group-hover:text-teal-700 transition-colors">
                            <span>Dossier</span>
                            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Lighter Themed Freedom Countdown & Advanced FIRE Conversion Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-amber-50/50 to-orange-50/60 text-slate-900 p-6 sm:p-8 shadow-xl shadow-amber-950/5 border border-amber-200/90 flex flex-col lg:flex-row lg:items-center justify-between gap-6 lg:gap-8">
              {/* Decorative Top Accent Ribbon & Ambient Glows */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 via-50% to-emerald-500" />
              <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full bg-amber-400/15 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-emerald-500/15 blur-3xl" />

              <div className="relative z-10 space-y-3.5 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100/90 border border-amber-300/80 text-amber-950 text-xs font-bold shadow-2xs">
                    <Flame className="w-3.5 h-3.5 text-orange-600 animate-pulse" />
                    <span>Turn Your Numbers Into a Freedom Countdown</span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100/80 border border-emerald-200/80 text-emerald-900 text-[11px] font-bold">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    100% Free · No Credit Card Required
                  </span>
                </div>

                <h4 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
                  Don&rsquo;t Just Guess Your Retirement Date—
                  <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-emerald-600 bg-clip-text text-transparent">
                    Lock In Your Exact Overseas Freedom Blueprint.
                  </span>
                </h4>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  Still wondering how many years or months away you truly are from financial independence? Sign up free to save your portfolio numbers and let our algorithmic engine model your live FIRE trajectory across all {countries.length} destinations. We calculate your exact safe withdrawal rate, multi-asset portfolio runway, and inflation impact in your local currency — completely FREE.
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/95 border border-amber-200/70 text-amber-950 text-[11px] font-semibold shadow-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                    Multi-Asset Runway Modeling
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/95 border border-emerald-200/70 text-emerald-950 text-[11px] font-semibold shadow-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    Universal Local Currency Support
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/95 border border-indigo-200/70 text-indigo-950 text-[11px] font-semibold shadow-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    Visa Solvency &amp; SWR Stress Testing
                  </span>
                </div>
              </div>

              {/* Actions Column with Signup CTA and Explore All Havens */}
              <div className="relative z-10 flex flex-col items-stretch lg:items-end gap-3 shrink-0 lg:min-w-[290px]">
                {(!isAuthenticated || currentUserId === 'guest') ? (
                  <>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => openAuthModal('signup')}
                      className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-400 hover:to-amber-500 text-slate-950 text-xs sm:text-sm font-black shadow-lg shadow-orange-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <UserPlus className="w-4 h-4 text-slate-950" />
                      <span>Sign Up Free — Track Your FIRE</span>
                      <ArrowRight className="w-4 h-4 text-slate-950" />
                    </motion.button>

                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleOpenAdvancedExplorer}
                      className="px-5 py-3 rounded-2xl bg-slate-900 hover:bg-indigo-950 text-white text-xs sm:text-sm font-bold shadow-md shadow-slate-950/10 transition-all cursor-pointer flex items-center justify-center gap-2 border border-slate-800"
                    >
                      <Compass className="w-4 h-4 text-teal-300" />
                      <span>Explore All {countries.length} Havens</span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </motion.button>

                    <div className="flex items-center justify-center lg:justify-end gap-1.5 text-[11px] text-slate-500 font-medium">
                      <span>Already a member?</span>
                      <button
                        type="button"
                        onClick={() => openAuthModal('login')}
                        className="font-extrabold text-orange-700 hover:text-orange-950 underline cursor-pointer"
                      >
                        Sign In
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setCurrentView('dashboard');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-400 hover:to-amber-500 text-slate-950 text-xs sm:text-sm font-black shadow-lg shadow-orange-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Flame className="w-4 h-4 text-slate-950" />
                      <span>Open Member FIRE Dashboard</span>
                      <ArrowRight className="w-4 h-4 text-slate-950" />
                    </motion.button>

                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleOpenAdvancedExplorer}
                      className="px-5 py-3 rounded-2xl bg-white hover:bg-amber-50/80 text-amber-950 text-xs sm:text-sm font-bold border border-amber-200 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-2xs"
                    >
                      <Compass className="w-4 h-4 text-orange-600" />
                      <span>Explore All {countries.length} Havens</span>
                    </motion.button>
                  </>
                )}

                <span className="text-[11px] text-slate-500 text-center lg:text-right font-medium">
                  Instant portfolio simulation · 100% Free
                </span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ============================================================ */}
      {/* 6. REAL EXPAT VOICES & SOCIAL PROOF                            */}
      {/* ============================================================ */}
      <section className="bg-gradient-to-b from-indigo-50/40 via-white to-teal-50/40 border-y border-indigo-100/80 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="text-center max-w-2xl mx-auto space-y-2.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-xs font-extrabold text-amber-800 uppercase tracking-widest">
              <Users className="w-3.5 h-3.5 text-amber-600" />
              <span>Boots on the Ground</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Hear from{' '}
              <span className="bg-gradient-to-r from-indigo-600 via-teal-600 to-amber-600 bg-clip-text text-transparent">
                Expats Who Already Made the Leap
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Honest reflections from early retirees living comfortably abroad.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              whileHover={{ y: -6 }}
              transition={{ type: 'spring', stiffness: 320, damping: 24 }}
              className="relative overflow-hidden p-6 rounded-3xl bg-white border border-amber-200/80 shadow-sm hover:shadow-xl hover:shadow-amber-950/5 space-y-4"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500" />
              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80"
                  alt="Sarah and David"
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-orange-500/30"
                />
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">Sarah &amp; David M.</h4>
                  <span className="text-xs text-slate-500">Relocated to Algarve, Portugal (2023)</span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic">
                &ldquo;Our monthly living cost dropped from $6,200 in Seattle to $2,700 in Lagos. Private health insurance is $92/month each with zero deductible surprises. We retired 7 years earlier than our 401(k) suggested.&rdquo;
              </p>
              <div className="pt-1 text-xs font-extrabold text-orange-700 bg-orange-50 px-3 py-1 rounded-full w-fit border border-orange-200/70">
                <span>D7 Passive Income Visa · $2,700/mo Couple</span>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -6 }}
              transition={{ type: 'spring', stiffness: 320, damping: 24 }}
              className="relative overflow-hidden p-6 rounded-3xl bg-white border border-emerald-200/80 shadow-sm hover:shadow-xl hover:shadow-emerald-950/5 space-y-4"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
                  alt="Mark R."
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-500/30"
                />
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">Mark R.</h4>
                  <span className="text-xs text-slate-500">Relocated to Chiang Mai, Thailand (2022)</span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic">
                &ldquo;Solo retirement here is unbelievably easy. A modern condo with mountain views, daily Thai food, high-speed fiber, and world-class hospital visits for $1,600/month. ReFIREly’s travel mobility guide was spot on.&rdquo;
              </p>
              <div className="pt-1 text-xs font-extrabold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full w-fit border border-emerald-200/70">
                <span>Long Stay O-A Scheme · $1,600/mo Solo</span>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -6 }}
              transition={{ type: 'spring', stiffness: 320, damping: 24 }}
              className="relative overflow-hidden p-6 rounded-3xl bg-white border border-indigo-200/80 shadow-sm hover:shadow-xl hover:shadow-indigo-950/5 space-y-4"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />
              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                  alt="Elena & Carlos"
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-500/30"
                />
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">Elena &amp; Carlos T.</h4>
                  <span className="text-xs text-slate-500">Relocated to Atenas, Costa Rica (2024)</span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic">
                &ldquo;We wanted eternal spring weather and community meetups. The Pensionado visa process took 4 months, and CAJA health coverage is straightforward. We walk everywhere and host weekly expat game nights.&rdquo;
              </p>
              <div className="pt-1 text-xs font-extrabold text-indigo-800 bg-indigo-50 px-3 py-1 rounded-full w-fit border border-indigo-200/70">
                <span>Pensionado Visa · $2,350/mo Couple</span>
              </div>
            </motion.div>
          </div>

        </div>
      </section>

      {/* ============================================================ */}
      {/* 7. HIGH-CONVERSION PORTAL SIGN-UP CALL TO ACTION               */}
      {/* ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 lg:p-16 rounded-[2rem] bg-gradient-to-br from-slate-900 via-indigo-950 to-teal-950 text-white shadow-2xl relative overflow-hidden border border-indigo-500/30">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-indigo-400 to-teal-400" />
          {/* Ambient glow circles */}
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-80 h-80 bg-indigo-500/25 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 border border-white/20 text-amber-300 text-xs font-bold backdrop-blur-md">
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span>Free Membership · Zero Spam</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Ready to Turn Your{' '}
              <span className="bg-gradient-to-r from-amber-300 via-orange-300 to-teal-300 bg-clip-text text-transparent">
                Overseas Dream
              </span>{' '}
              into an Actionable Blueprint?
            </h2>

            <p className="text-base sm:text-lg text-indigo-100/90 font-medium leading-relaxed">
              Create your account to save customized haven shortlists, export printable PDF dossiers, simulate multi-currency portfolios, and connect with fellow retirees in local meetups.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <motion.button
                type="button"
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => openAuthModal('signup')}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-sm sm:text-base shadow-xl shadow-amber-500/25 transition-all flex items-center gap-2.5 cursor-pointer"
              >
                <UserPlus className="w-5 h-5 text-slate-950" />
                <span>Create Free Member Account</span>
              </motion.button>

              {!isAuthenticated && (
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => openAuthModal('login')}
                  className="px-6 py-4 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-sm sm:text-base border border-white/25 backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <LogIn className="w-5 h-5" />
                  <span>Existing Member Sign In</span>
                </motion.button>
              )}
            </div>

            {/* Checklist of Member Features */}
            <div className="pt-6 border-t border-white/15 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-indigo-100 font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{countries.length} Country PDF Dossier Downloads</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Cloud FIRE Portfolio &amp; Net Worth Sync</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Direct Member Messaging &amp; Expat Meetups</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Custom Relocation Checklists &amp; Visa Reminders</span>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};
