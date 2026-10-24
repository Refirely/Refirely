import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ClimateCategory, SortByType } from '../types';
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
  Compass, Sparkles, Flame, ArrowRight, ArrowDown, Heart,
  ShieldCheck, Sun, Globe, Users, CheckCircle2,
  SlidersHorizontal, ChevronRight,
  LogIn, UserPlus, RotateCcw
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const {
    countries,
    navigateToCountry,
    setCurrentView,
    openAuthModal,
    isAuthenticated,
    isCountrySaved,
    toggleSaveCountry,
    isCountryCompared,
    toggleCompareCountry,
    setSelectedRegion,
    setSelectedClimate,
    setSearchQuery,
    setSortBy,
  } = useApp();

  // -------------------------------------------------------------
  // 1. Unified Interactive Match Engine & Verified Haven Directory State
  // -------------------------------------------------------------
  const [matchBudget, setMatchBudget] = useState<number>(2800);
  const [strictBudgetFilter, setStrictBudgetFilter] = useState<boolean>(false);
  const [matchClimate, setMatchClimate] = useState<ClimateCategory | 'Any'>('Any');
  const [matchPriority, setMatchPriority] = useState<'value' | 'healthcare' | 'safety' | 'leisure'>('leisure');
  const [previewContinent, setPreviewContinent] = useState<ContinentFilter>('All');
  const [previewSort, setPreviewSort] = useState<'match-desc' | SortByType>('match-desc');
  const [visibleCount, setVisibleCount] = useState<number>(12);

  // Continent counts across all countries
  const continentCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const opt of CONTINENT_FILTER_OPTIONS) {
      counts[opt.value] = countries.filter(c => matchesContinentFilter(c, opt.value)).length;
    }
    return counts;
  }, [countries]);

  // Compute match score, filter by continent/climate/search/budget, and sort
  const sortedMatchedCountries = useMemo(() => {
    const scored = countries.map(country => {
      let score = 70; // baseline

      // Budget match (25 pts)
      const diff = matchBudget - country.costOfLiving.monthlyBudgetCoupleUSD;
      if (diff >= 300) {
        score += 25; // comfortably under budget
      } else if (diff >= 0) {
        score += 22; // within budget
      } else if (diff >= -500) {
        score += 14; // slightly over
      } else {
        score -= 8;
      }

      // Climate match (25 pts)
      if (matchClimate === 'Any' || country.climate.category === matchClimate) {
        score += 25;
      }

      // Priority factor (25 pts)
      const travelScore = getCountryTravelLeisureScore(country);
      if (matchPriority === 'value') {
        if (country.costOfLiving.monthlyBudgetCoupleUSD <= 2200) score += 25;
        else if (country.costOfLiving.monthlyBudgetCoupleUSD <= 3000) score += 16;
        else score += 8;
      } else if (matchPriority === 'healthcare') {
        score += (country.lifestyle.healthcareScore / 100) * 25;
      } else if (matchPriority === 'safety') {
        score += (country.lifestyle.safetyScore / 100) * 25;
      } else if (matchPriority === 'leisure') {
        score += (travelScore / 100) * 25;
      }

      const normalizedScore = Math.min(99, Math.max(68, Math.round(score)));
      return { country, matchScore: normalizedScore, travelScore };
    });

    // Apply Continent, Climate, and Strict Budget filters
    const filtered = scored.filter(({ country }) => {
      if (!matchesContinentFilter(country, previewContinent)) {
        return false;
      }
      if (matchClimate !== 'Any' && country.climate.category !== matchClimate) {
        return false;
      }
      if (strictBudgetFilter && country.costOfLiving.monthlyBudgetCoupleUSD > matchBudget) {
        return false;
      }
      return true;
    });

    // Sort according to active sort option
    filtered.sort((a, b) => {
      switch (previewSort) {
        case 'match-desc':
          if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
          return b.travelScore - a.travelScore;
        case 'alpha-asc':
          return a.country.name.localeCompare(b.country.name);
        case 'alpha-desc':
          return b.country.name.localeCompare(a.country.name);
        case 'budget-asc':
          return a.country.costOfLiving.monthlyBudgetCoupleUSD - b.country.costOfLiving.monthlyBudgetCoupleUSD;
        case 'travel-leisure-desc':
          return b.travelScore - a.travelScore;
        case 'healthcare-desc':
          return b.country.lifestyle.healthcareScore - a.country.lifestyle.healthcareScore;
        case 'safety-desc':
          return b.country.lifestyle.safetyScore - a.country.lifestyle.safetyScore;
        case 'sunny-desc':
          return b.country.climate.annualSunnyDays - a.country.climate.annualSunnyDays;
        case 'visa-income-asc':
          return a.country.visa.minimumIncomeUSD - b.country.visa.minimumIncomeUSD;
        case 'recommended':
        default: {
          const scoreA =
            (a.country.lifestyle.healthcareScore + a.country.lifestyle.safetyScore) / 2 -
            a.country.costOfLiving.monthlyBudgetCoupleUSD / 100;
          const scoreB =
            (b.country.lifestyle.healthcareScore + b.country.lifestyle.safetyScore) / 2 -
            b.country.costOfLiving.monthlyBudgetCoupleUSD / 100;
          return scoreB - scoreA;
        }
      }
    });

    return filtered;
  }, [
    countries,
    matchBudget,
    strictBudgetFilter,
    matchClimate,
    matchPriority,
    previewContinent,
    previewSort,
  ]);

  const displayedCountries = sortedMatchedCountries.slice(0, visibleCount);
  const hasMoreCountries = visibleCount < sortedMatchedCountries.length;
  const remainingCountriesCount = Math.max(0, sortedMatchedCountries.length - visibleCount);

  const handleLoadMore = (increment: number = 12) => {
    setVisibleCount(prev => Math.min(sortedMatchedCountries.length, prev + increment));
  };

  const handleResetMatchEngine = () => {
    setMatchBudget(2800);
    setStrictBudgetFilter(false);
    setMatchClimate('Any');
    setMatchPriority('leisure');
    setPreviewContinent('All');
    setPreviewSort('match-desc');
    setVisibleCount(12);
  };

  const handleOpenAdvancedExplorer = () => {
    setSelectedRegion(previewContinent);
    setSelectedClimate(matchClimate === 'Any' ? 'All' : matchClimate);
    setSearchQuery('');
    if (previewSort !== 'match-desc') {
      setSortBy(previewSort);
    }
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
      <section className="relative min-h-[580px] lg:min-h-[640px] flex items-center bg-slate-950 text-white overflow-hidden border-b border-slate-800">
        {/* Background Visual: Iconic Nature & Touristic Alpine Emerald Lake Panorama */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2200&q=85"
            alt="Iconic mountain valley, sunlit lake, and nature haven panorama"
            className="w-full h-full object-cover object-center scale-105 filter brightness-[0.62] contrast-[1.08]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/70 to-slate-950/25" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/45" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="max-w-3xl space-y-6">
            
            {/* Trust badge kicker */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/20 border border-orange-400/30 text-orange-300 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-orange-400" />
              <span>{countries.length} Verified Global Havens · Updated for 2026</span>
            </div>

            {/* Impactful Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] text-white">
              Escape the Grind.{' '}
              <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-200 bg-clip-text text-transparent">
                Retire Years Earlier
              </span>{' '}
              Where Wealth Multiplies.
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-2xl">
              Factual, empirical data across {countries.length} countries. Model your financial freedom with our interactive FIRE calculator, explore verified visa thresholds, and discover your personalized haven match.
            </p>

            {/* Primary Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3.5">
              <button
                onClick={() => scrollToSection('haven-matcher')}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm sm:text-base shadow-lg shadow-orange-500/25 transition-all transform hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-200" />
                <span>Interactive Match Engine ({countries.length} Havens)</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => scrollToSection('fire-calculator')}
                className="px-6 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/90 text-slate-100 font-semibold text-sm sm:text-base border border-slate-700 backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Flame className="w-4 h-4 text-orange-400" />
                <span>Simulate FIRE Geo-Arbitrage</span>
              </button>

              <button
                onClick={handleOpenAdvancedExplorer}
                className="px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 font-medium text-sm sm:text-base border border-white/10 backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Globe className="w-4 h-4 text-teal-300" />
                <span>Advanced Explorer</span>
              </button>
            </div>

            {/* Social proof metric chips */}
            <div className="pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-slate-300 text-xs">
              <div>
                <div className="text-xl sm:text-2xl font-black text-white">{countries.length}</div>
                <div className="text-slate-400">Verified Havens</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-amber-400">55+</div>
                <div className="text-slate-400">Living Parameters</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-emerald-400">8.4 Yrs</div>
                <div className="text-slate-400">Avg Earlier FIRE</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-sky-400">100%</div>
                <div className="text-slate-400">Free &amp; Ad-Free</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. CORE VALUE PILLARS                                          */}
      {/* ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-12">
          <div className="text-xs font-bold text-orange-600 uppercase tracking-widest flex items-center justify-center gap-1.5">
            <Compass className="w-4 h-4 text-orange-500" />
            <span>Built For Real Planners</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Everything You Need to Relocate Abroad with Clarity
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            No vague sales pitches or sponsored real estate ads. Raw empirical metrics verified against government sources.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow space-y-3">
            <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">AI Haven Match Scoring</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Input your desired monthly budget, weather preferences, continent, and safety priorities. Get mathematically ranked country recommendations across all {countries.length} havens.
            </p>
            <div className="pt-2">
              <button
                onClick={() => scrollToSection('haven-matcher')}
                className="text-xs font-bold text-orange-600 hover:text-orange-700 inline-flex items-center gap-1 group cursor-pointer"
              >
                <span>Try Match Engine below</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Flame className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">FIRE Geo-Arbitrage Engine</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Calculate exact safe withdrawal rates (3.5%–4%) abroad. Understand how living on $2,200/mo vs $5,000/mo slashes your needed nest egg in half.
            </p>
            <div className="pt-2">
              <button
                onClick={() => scrollToSection('fire-calculator')}
                className="text-xs font-bold text-amber-700 hover:text-amber-800 inline-flex items-center gap-1 group cursor-pointer"
              >
                <span>Calculate your FIRE</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow space-y-3">
            <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Vetted Visas &amp; Mobility</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              D7 Passive Income, Non-Lucrative Visas, Pensionado schemes, and Schengen rules. Plus travel ease and mobility ratings for couple and solo retirees.
            </p>
            <div className="pt-2">
              <button
                onClick={handleOpenAdvancedExplorer}
                className="text-xs font-bold text-teal-700 hover:text-teal-800 inline-flex items-center gap-1 group cursor-pointer"
              >
                <span>Open Advanced Haven Explorer</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. UNIFIED INTERACTIVE MATCH ENGINE & VERIFIED HAVEN DIRECTORY */}
      {/* ============================================================ */}
      <section id="haven-matcher" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div id="countries-grid" className="p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white shadow-xl border border-slate-800">
          
          {/* Header & Badges */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-8">
            <div className="max-w-3xl space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 text-xs font-semibold border border-orange-500/30">
                  <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                  <span>Interactive Match Engine</span>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/90 text-teal-300 text-xs font-semibold border border-slate-700">
                  <Globe className="w-3.5 h-3.5 text-teal-400" />
                  <span>Explore {countries.length} Global Retirement Havens · Verified Haven Directory</span>
                </div>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                Find Your Ideal Haven &amp; Explore {countries.length} Verified Destinations
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Simulate live match rankings across all {countries.length} destinations based on your target budget, preferred climate, continent, and top relocation priority—or sort by any empirical directory metric.
              </p>
            </div>

            <button
              onClick={handleOpenAdvancedExplorer}
              className="self-start lg:self-end px-4 py-2.5 rounded-xl bg-orange-500/15 hover:bg-orange-500 text-orange-300 hover:text-white border border-orange-500/30 text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Advanced Explorer (55+ Parameters)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Interactive Parameters & Directory Filters Console (Match Engine Style) */}
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80 mb-8 backdrop-blur-md space-y-6">
            
            {/* Row 1: Core Match Parameters (Budget, Climate, Priority) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Control 1: Budget */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-xs font-bold text-slate-300">Monthly Couple Budget</label>
                  <div className="flex items-center gap-2">
                    <span className="text-orange-400 font-extrabold text-sm">${matchBudget.toLocaleString()}/mo</span>
                    <button
                      type="button"
                      onClick={() => {
                        setStrictBudgetFilter(prev => !prev);
                        setVisibleCount(12);
                      }}
                      title="Toggle between scoring all countries by budget fit vs strictly hiding countries above this budget"
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-colors cursor-pointer ${
                        strictBudgetFilter
                          ? 'bg-orange-500 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {strictBudgetFilter ? 'Strict ≤ Budget' : 'Score All'}
                    </button>
                  </div>
                </div>
                <input
                  type="range"
                  min={1000}
                  max={5000}
                  step={50}
                  value={matchBudget}
                  onChange={e => {
                    setMatchBudget(Number(e.target.value));
                    if (strictBudgetFilter) setVisibleCount(12);
                  }}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>$1,000 (Frugal)</span>
                  <span>$2,800 (Moderate)</span>
                  <span>$5,000+ (Luxury)</span>
                </div>
              </div>

              {/* Control 2: Climate */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 block">Preferred Climate</label>
                <select
                  value={matchClimate}
                  onChange={e => {
                    setMatchClimate(e.target.value as ClimateCategory | 'Any');
                    setVisibleCount(12);
                  }}
                  className="w-full px-3 py-2.5 bg-slate-700/90 border border-slate-600 rounded-xl text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
                >
                  <option value="Any">Any Climate (All {countries.length} Havens)</option>
                  <option value="Mediterranean">Mediterranean (Mild &amp; Sunny)</option>
                  <option value="Tropical">Tropical (Warm &amp; Lush)</option>
                  <option value="Subtropical">Subtropical (Warm &amp; Breezy)</option>
                  <option value="Temperate">Temperate (Four Seasons)</option>
                  <option value="Highlands / Mild">Highlands / Mild (Eternal Spring)</option>
                </select>
                <div className="text-[11px] text-slate-400">
                  Filters &amp; weights havens by your ideal year-round weather
                </div>
              </div>

              {/* Control 3: Priority */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 block">Primary Priority</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMatchPriority('value')}
                    className={`px-3 py-2 text-xs rounded-xl font-semibold transition-colors text-left cursor-pointer ${
                      matchPriority === 'value'
                        ? 'bg-orange-500 text-white font-bold'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    Low Cost
                  </button>
                  <button
                    type="button"
                    onClick={() => setMatchPriority('healthcare')}
                    className={`px-3 py-2 text-xs rounded-xl font-semibold transition-colors text-left cursor-pointer ${
                      matchPriority === 'healthcare'
                        ? 'bg-orange-500 text-white font-bold'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    Healthcare
                  </button>
                  <button
                    type="button"
                    onClick={() => setMatchPriority('safety')}
                    className={`px-3 py-2 text-xs rounded-xl font-semibold transition-colors text-left cursor-pointer ${
                      matchPriority === 'safety'
                        ? 'bg-orange-500 text-white font-bold'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    Top Safety
                  </button>
                  <button
                    type="button"
                    onClick={() => setMatchPriority('leisure')}
                    className={`px-3 py-2 text-xs rounded-xl font-semibold transition-colors text-left cursor-pointer ${
                      matchPriority === 'leisure'
                        ? 'bg-orange-500 text-white font-bold'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    Travel &amp; Leisure
                  </button>
                </div>
              </div>

            </div>

            {/* Row 2: Continent Filters & Directory Sort / Search Controls (in Match Engine Style) */}
            <div className="pt-5 border-t border-slate-700/70 space-y-4">
              
              {/* Continent Filter Buttons */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-orange-400" />
                    <span>Continent &amp; Region Filter</span>
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {sortedMatchedCountries.length} matching destinations
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {CONTINENT_FILTER_OPTIONS.map(option => {
                    const active = previewContinent === option.value;
                    const count = continentCounts[option.value] ?? 0;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setPreviewContinent(option.value);
                          setVisibleCount(12);
                        }}
                        className={`px-3 py-1.5 text-xs rounded-xl font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                          active
                            ? 'bg-orange-500 text-white font-bold shadow-xs'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        <span>{option.label}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                            active ? 'bg-orange-600/80 text-white' : 'bg-slate-800/80 text-slate-400'
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sort Dropdown and Reset Row */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-1">
                
                {/* Sort Dropdown */}
                <div className="md:col-span-9 space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-orange-400" />
                    <span>Sort Directory Rankings By</span>
                  </label>
                  <select
                    value={previewSort}
                    onChange={e => {
                      setPreviewSort(e.target.value as 'match-desc' | SortByType);
                      setVisibleCount(12);
                    }}
                    className="w-full px-3 py-2 bg-slate-700/90 border border-slate-600 rounded-xl text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
                  >
                    <option value="match-desc">AI Match Score (Best Fit for Your Parameters)</option>
                    <option value="travel-leisure-desc">Travel &amp; Leisure Score (High to Low)</option>
                    <option value="alpha-asc">Alphabetical (A – Z)</option>
                    <option value="alpha-desc">Alphabetical (Z – A)</option>
                    <option value="budget-asc">Monthly Budget (Lowest First)</option>
                    <option value="healthcare-desc">Healthcare Quality (Highest First)</option>
                    <option value="safety-desc">Safety &amp; Peace Index (Highest First)</option>
                    <option value="sunny-desc">Sunny Days per Year (Most Sunshine)</option>
                    <option value="visa-income-asc">Visa Income (Lowest Requirement)</option>
                    <option value="recommended">ReFIREly Composite Haven Rank</option>
                  </select>
                </div>

                {/* Reset Controls */}
                <div className="md:col-span-3 flex flex-col justify-end">
                  <button
                    type="button"
                    onClick={handleResetMatchEngine}
                    className="w-full px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 hover:text-white border border-slate-600 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-orange-400" />
                    <span>Reset All</span>
                  </button>
                </div>

              </div>

            </div>

          </div>

          {/* Results Header Strip */}
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold uppercase tracking-wider text-slate-200">
                  Showing {displayedCountries.length} of {sortedMatchedCountries.length} Verified Havens
                </span>
                {previewContinent !== 'All' && (
                  <span className="px-2 py-0.5 rounded-md bg-orange-500/20 text-orange-300 border border-orange-500/30 font-semibold">
                    {previewContinent}
                  </span>
                )}
                {matchClimate !== 'Any' && (
                  <span className="px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-300 border border-teal-500/30 font-semibold">
                    {matchClimate}
                  </span>
                )}
              </div>

              <button
                onClick={handleOpenAdvancedExplorer}
                className="text-orange-400 hover:text-orange-300 font-semibold inline-flex items-center gap-1 cursor-pointer self-start sm:self-auto"
              >
                <span>Explore All {countries.length} with Advanced Filters</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Empty State if filters are too restrictive */}
            {displayedCountries.length === 0 ? (
              <div className="p-12 rounded-2xl bg-slate-800/60 border border-slate-700/80 text-center space-y-3">
                <Compass className="w-10 h-10 text-orange-400 mx-auto" />
                <h3 className="text-base font-bold text-white">No destinations match this exact filter combination</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Try switching Preferred Climate to &ldquo;Any Climate&rdquo;, selecting &ldquo;All Continents&rdquo;, or resetting your search parameters.
                </p>
                <button
                  type="button"
                  onClick={handleResetMatchEngine}
                  className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Reset Match Engine Filters
                </button>
              </div>
            ) : (
              /* 12-Card Incremental Grid in Interactive Match Engine Style */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {displayedCountries.map(({ country, matchScore, travelScore }) => {
                  const saved = isCountrySaved(country.id);
                  const compared = isCountryCompared(country.id);
                  const continentLabel = getCountryContinentLabel(country);

                  return (
                    <div
                      key={country.id}
                      onClick={() => navigateToCountry(country.id)}
                      className="group bg-slate-800/90 rounded-2xl border border-slate-700/80 overflow-hidden hover:border-orange-500/70 transition-all cursor-pointer flex flex-col justify-between hover:shadow-xl hover:-translate-y-1"
                    >
                      <div>
                        {/* Photo Header */}
                        <div className="h-44 relative overflow-hidden">
                          <CountryThumbnail country={country} hideLandmarkLabel className="h-full w-full" />

                          {/* Top-left Continent pill */}
                          <div className="absolute top-3 left-3 flex items-center gap-1.5">
                            <span className="px-2.5 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md text-slate-200 text-[11px] font-semibold border border-slate-700/70">
                              {continentLabel}
                            </span>
                          </div>

                          {/* Top-right Match Score & Save Heart */}
                          <div className="absolute top-3 right-3 flex items-center gap-1.5">
                            <div className="px-2.5 py-1 rounded-full bg-slate-900/85 backdrop-blur-md text-amber-300 text-xs font-black flex items-center gap-1 shadow-md">
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
                              className={`p-1.5 rounded-full backdrop-blur-md transition-colors cursor-pointer ${
                                saved
                                  ? 'bg-rose-500 text-white'
                                  : 'bg-slate-900/80 text-slate-300 hover:text-white'
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
                            <div className="p-2 rounded-lg bg-slate-900/60">
                              <span className="text-slate-400 block text-[11px]">Couple Budget</span>
                              <span className="font-bold text-white text-sm">
                                ${country.costOfLiving.monthlyBudgetCoupleUSD.toLocaleString()}/mo
                              </span>
                            </div>
                            <div className="p-2 rounded-lg bg-slate-900/60">
                              <span className="text-slate-400 block text-[11px]">Travel &amp; Leisure</span>
                              <span className="font-bold text-orange-400 text-sm">
                                {travelScore}/100
                              </span>
                            </div>
                          </div>

                          <p className="text-xs text-slate-400 line-clamp-1 leading-relaxed">
                            {country.tagline}
                          </p>

                          <div className="text-xs text-slate-300 space-y-1 border-t border-slate-700/60 pt-2.5">
                            <div className="flex items-center gap-1.5 text-slate-300">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              <span>
                                Safety {country.lifestyle.safetyScore}/100 · Health {country.lifestyle.healthcareScore}/100
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-300">
                              <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              <span>
                                {country.climate.annualSunnyDays} sunny days · {country.climate.category}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                              <span className="truncate">
                                Visa: {country.visa.minimumIncomeUSD > 0 ? `$${country.visa.minimumIncomeUSD.toLocaleString()}/mo min` : 'Accessible'}
                              </span>
                              <span className="text-slate-500 shrink-0">{country.capital}</span>
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
                          className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer shrink-0 ${
                            compared
                              ? 'bg-orange-500 text-white border-orange-500'
                              : 'bg-slate-900/70 text-slate-300 border-slate-700 hover:border-slate-500 hover:text-white'
                          }`}
                        >
                          {compared ? 'In Matrix' : 'Compare'}
                        </button>
                        <div className="flex-1 py-2 px-3 rounded-xl bg-orange-500/15 group-hover:bg-orange-500 text-orange-300 group-hover:text-white text-xs font-bold text-center transition-colors flex items-center justify-center gap-1.5">
                          <span>View Dossier</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination / Load More (12 or 16) & Advanced Explore Havens CTA */}
            {sortedMatchedCountries.length > 0 && (
              <div className="pt-6 mt-4 border-t border-slate-800/90 text-center space-y-4">
                <div className="max-w-xs mx-auto space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-400 font-semibold">
                    <span>
                      Showing {displayedCountries.length} of {sortedMatchedCountries.length} Havens
                    </span>
                    <span className="text-orange-400">
                      {Math.round((displayedCountries.length / sortedMatchedCountries.length) * 100)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/70">
                    <div
                      className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all duration-300"
                      style={{
                        width: `${(displayedCountries.length / sortedMatchedCountries.length) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                  {hasMoreCountries ? (
                    <button
                      type="button"
                      onClick={() => handleLoadMore(12)}
                      className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs sm:text-sm font-bold shadow-lg shadow-orange-500/20 transition-all cursor-pointer flex items-center gap-2"
                    >
                      <span>Load 12 More Havens (+{Math.min(12, remainingCountriesCount)})</span>
                      <ArrowDown className="w-4 h-4 text-amber-200" />
                    </button>
                  ) : (
                    <div className="text-xs font-bold text-slate-300 bg-slate-800/90 border border-slate-700 px-4 py-2.5 rounded-xl">
                      All {sortedMatchedCountries.length} matching havens are displayed
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleOpenAdvancedExplorer}
                    className="px-6 py-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-orange-300 hover:text-white text-xs sm:text-sm font-bold border border-orange-500/40 shadow-2xs transition-all cursor-pointer flex items-center gap-2"
                  >
                    <Compass className="w-4 h-4 text-orange-400" />
                    <span>Explore Havens · Advanced Filtering (55+ Parameters)</span>
                    <ArrowRight className="w-4 h-4 text-orange-400" />
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. INTERACTIVE FIRE CALCULATOR SHOWCASE                         */}
      {/* ============================================================ */}
      <section id="fire-calculator" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="p-6 sm:p-10 rounded-3xl bg-white border border-slate-200/90 shadow-md">
          
          <div className="max-w-3xl mb-8 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold">
              <Flame className="w-3.5 h-3.5 text-amber-600" />
              <span>International Geo-Arbitrage Engine</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Calculate Your FIRE Timeline Abroad
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Living in an overseas haven with a high standard of living can reduce your required retirement portfolio by 40% to 65%, enabling you to retire a decade sooner.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Interactive Inputs */}
            <div className="lg:col-span-6 space-y-5 bg-slate-50 p-6 rounded-2xl border border-slate-200/80">
              
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-bold text-slate-800">Current Invested Assets</label>
                  <span className="font-extrabold text-slate-900 text-sm">${currentNetWorth.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="20000"
                  max="1500000"
                  step="10000"
                  value={currentNetWorth}
                  onChange={e => setCurrentNetWorth(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                />
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>$20k</span>
                  <span>$500k</span>
                  <span>$1.5M+</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-bold text-slate-800">Target Monthly Budget Abroad</label>
                  <span className="font-extrabold text-orange-600 text-sm">${targetMonthlyExpenseAbroad.toLocaleString()}/mo</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="4500"
                  step="100"
                  value={targetMonthlyExpenseAbroad}
                  onChange={e => setTargetMonthlyExpenseAbroad(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                />
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>$500 (Ultra-Lean)</span>
                  <span>$2,400 (Algarve / Spain)</span>
                  <span>$4,500 (Fat FIRE)</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-bold text-slate-800">Current Domestic Monthly Cost (At Home)</label>
                  <span className="font-extrabold text-slate-700 text-sm">${domesticMonthlyExpense.toLocaleString()}/mo</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="8000"
                  step="100"
                  value={domesticMonthlyExpense}
                  onChange={e => setDomesticMonthlyExpense(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-600"
                />
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>$500</span>
                  <span>$4,000 (Global Avg)</span>
                  <span>$8,000</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <label className="font-bold text-slate-800">Annual Savings</label>
                    <span className="font-extrabold text-slate-900">
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
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>$1k</span>
                    <span>$50k</span>
                    <span>$100k</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <label className="font-bold text-slate-800">Safe Withdrawal Rate (SWR)</label>
                    <span className="font-extrabold text-slate-900">
                      {safeWithdrawalRate.toFixed(1)}% <span className="text-[11px] font-semibold text-slate-500">({swrMultiplier}x yr cost)</span>
                    </span>
                  </div>
                  <input
                    type="range"
                    min="3.0"
                    max="5.0"
                    step="0.1"
                    value={safeWithdrawalRate}
                    onChange={e => setSafeWithdrawalRate(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>3.0% (Safer · 33.3x)</span>
                    <span>4.0% (Standard · 25x)</span>
                    <span>5.0% (Higher · 20x)</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200/80 text-[11px] text-slate-600 leading-relaxed">
                <span className="font-bold text-slate-800">How SWR works:</span> Nest Egg = Annual Spending ÷ SWR. A <span className="font-semibold text-slate-800">lower SWR</span> (e.g., 3.0%) means withdrawing a smaller slice of your portfolio each year for safety, which requires a <span className="font-semibold text-slate-800">larger nest egg ({swrMultiplier}x annual expenses)</span> and more years to save.
              </div>

            </div>

            {/* Right Column: Comparative Results */}
            <div className="lg:col-span-6 space-y-5">
              
              {/* Highlight Comparison Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-orange-50 border border-orange-200/90 space-y-1">
                  <span className="text-xs font-semibold text-orange-800 uppercase tracking-wide">
                    Nest Egg Needed Abroad
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-orange-950">
                    ${fireNestEggAbroad.toLocaleString()}
                  </div>
                  <div className="text-xs text-orange-700 font-medium">
                    ${annualExpenseAbroad.toLocaleString()}/yr × {swrMultiplier} ({safeWithdrawalRate.toFixed(1)}% SWR)
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-100 border border-slate-200 space-y-1">
                  <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                    Nest Egg Needed at Home
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-slate-800">
                    ${fireNestEggDomestic.toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    ${annualExpenseDomestic.toLocaleString()}/yr × {swrMultiplier} ({safeWithdrawalRate.toFixed(1)}% SWR)
                  </div>
                </div>
              </div>

              {/* Geo-Arbitrage Savings Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-100">
                    {capitalSaved >= 0 ? 'Capital Required Slashed' : 'Target Lifestyle Comparison'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-800/80 text-emerald-200 text-xs font-extrabold">
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
                <p className="text-xs text-emerald-100 leading-relaxed">
                  With ${currentNetWorth.toLocaleString()} invested today, you have already funded{' '}
                  <span className="font-extrabold text-white">{fireProgressPercent}%</span> of your abroad retirement goal (vs.{' '}
                  <span className="font-extrabold text-white">{fireProgressDomesticPercent}%</span> of your domestic goal).
                </p>
              </div>

              {/* Years to Retirement Comparison */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Years to Financial Freedom
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-xs font-extrabold text-orange-700">
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
                    <span className="font-semibold text-slate-700">
                      Retire Abroad <span className="text-slate-400 font-normal">(${targetMonthlyExpenseAbroad.toLocaleString()}/mo · ${fireNestEggAbroad.toLocaleString()} goal)</span>
                    </span>
                    <span className="font-extrabold text-orange-600">
                      {yearsToFireAbroad === 0
                        ? '0 Years (100% Funded Today!)'
                        : `${yearsToFireAbroad} ${yearsToFireAbroad === 1 ? 'Year' : 'Years'} (${fireProgressPercent}% Funded)`}
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-500 rounded-full transition-all duration-500"
                      style={{ width: `${fireProgressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Row 2: Retirement At Home Timeline & Funding Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-600">
                      Retire at Home <span className="text-slate-400 font-normal">(${domesticMonthlyExpense.toLocaleString()}/mo · ${fireNestEggDomestic.toLocaleString()} goal)</span>
                    </span>
                    <span className="font-bold text-slate-700">
                      {yearsToFireDomestic === 0
                        ? '0 Years (100% Funded Today!)'
                        : `${yearsToFireDomestic} ${yearsToFireDomestic === 1 ? 'Year' : 'Years'} (${fireProgressDomesticPercent}% Funded)`}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-slate-400 rounded-full transition-all duration-500"
                      style={{ width: `${fireProgressDomesticPercent}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <button
                    onClick={() => setCurrentView('dashboard')}
                    className="text-xs font-bold text-orange-600 hover:text-orange-700 inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Open Detailed Financial Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] text-slate-400">
                    Assumes {expectedGrowthRate}% annual return + ${(annualSavings / 1000).toFixed(0)}k/yr savings
                  </span>
                </div>
              </div>

            </div>

          </div>

          {/* Live Matching Retirement Havens for the User's FIRE Parameters + Signup CTA */}
          <div className="mt-10 pt-8 border-t border-slate-200/90 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-orange-600 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                  <span>Live FIRE-Ready Destination Matches</span>
                </div>
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-0.5">
                  Top 4 Havens Matching Your ${targetMonthlyExpenseAbroad.toLocaleString()}/mo Target &amp; {safeWithdrawalRate.toFixed(1)}% SWR
                </h3>
              </div>
              <span className="text-xs text-slate-500">
                Ranked by budget fit, healthcare quality, safety &amp; portfolio readiness
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
              }) => (
                <div
                  key={country.id}
                  onClick={() => navigateToCountry(country.id)}
                  className="group p-4 rounded-2xl bg-slate-50 hover:bg-orange-50/40 border border-slate-200/90 hover:border-orange-300 transition-all cursor-pointer flex flex-col justify-between gap-3 shadow-2xs"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <CountryFlag
                          countryCode={country.code}
                          countryName={country.name}
                          fallbackEmoji={country.flag}
                          className="w-6 h-6 rounded-xs shadow-2xs shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-orange-700 truncate">
                            {country.name}
                          </h4>
                          <span className="text-[11px] text-slate-500 block truncate">
                            {getCountryContinentLabel(country)} · {country.climate.category}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`text-[11px] font-extrabold px-2 py-0.5 rounded-md shrink-0 ${
                          yearsToFireInCountry === 0
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-orange-100 text-orange-800 border border-orange-200'
                        }`}
                      >
                        {yearsToFireInCountry === 0 ? 'FIRE Ready!' : `${yearsToFireInCountry} Yrs`}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 rounded-xl bg-white border border-slate-200/80">
                        <span className="text-[10px] text-slate-400 block">{budgetModeLabel} Budget</span>
                        <span className="font-mono font-bold text-slate-900">
                          ${referenceMonthlyCost.toLocaleString()}/mo
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-white border border-slate-200/80">
                        <span className="text-[10px] text-slate-400 block">FIRE Nest Egg</span>
                        <span className="font-mono font-bold text-orange-700">
                          ${(countryNestEgg / 1000).toFixed(0)}k
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-500">Current Assets Cover</span>
                        <span className="font-bold text-slate-800">{fundedPercent}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            fundedPercent >= 100 ? 'bg-emerald-500' : 'bg-orange-500'
                          }`}
                          style={{ width: `${fundedPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between text-xs font-bold text-orange-600 group-hover:text-orange-700">
                    <span>Health {country.lifestyle.healthcareScore} · Safety {country.lifestyle.safetyScore}</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              ))}
            </div>

            {/* Catchy Signup & Advanced FIRE Tracking Call-to-Action Banner */}
            <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950 text-white border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-5 shadow-md">
              <div className="space-y-1.5 max-w-2xl">
                <div className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-orange-400" />
                  <span>Turn Your Numbers Into a Freedom Countdown</span>
                </div>
                <h4 className="text-base sm:text-xl font-extrabold text-white">
                  Don&rsquo;t Just Guess Your Retirement Date—Lock In Your Exact Overseas Freedom Blueprint.
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Sign up free to track your live FIRE portfolio with advanced parameters: multi-asset allocation (stocks, real estate, gold, cash), loan &amp; EMI paydown timelines, real inflation stress-testing, and visa solvency grades across all {countries.length} countries.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => openAuthModal('signup')}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-orange-500/25 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4 text-amber-100" />
                  <span>Sign Up &amp; Track Your FIRE Free</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentView('dashboard')}
                  className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
                >
                  Advanced FIRE Dashboard
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ============================================================ */}
      {/* 6. REAL EXPAT VOICES & SOCIAL PROOF                            */}
      {/* ============================================================ */}
      <section className="bg-slate-100/70 border-y border-slate-200/90 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="text-xs font-bold text-orange-600 uppercase tracking-widest flex items-center justify-center gap-1.5">
              <Users className="w-4 h-4 text-orange-500" />
              <span>Boots on the Ground</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Hear from Expats Who Already Made the Leap
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Honest reflections from early retirees living comfortably abroad.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80"
                  alt="Sarah and David"
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-orange-500/20"
                />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Sarah &amp; David M.</h4>
                  <span className="text-xs text-slate-500">Relocated to Algarve, Portugal (2023)</span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic">
                &ldquo;Our monthly living cost dropped from $6,200 in Seattle to $2,700 in Lagos. Private health insurance is $92/month each with zero deductible surprises. We retired 7 years earlier than our 401(k) suggested.&rdquo;
              </p>
              <div className="pt-1 text-xs font-bold text-orange-600 flex items-center gap-1">
                <span>D7 Passive Income Visa · $2,700/mo Couple</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
                  alt="Mark R."
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-500/20"
                />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Mark R.</h4>
                  <span className="text-xs text-slate-500">Relocated to Chiang Mai, Thailand (2022)</span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic">
                &ldquo;Solo retirement here is unbelievably easy. A modern condo with mountain views, daily Thai food, high-speed fiber, and world-class hospital visits for $1,600/month. ReFIREly’s travel mobility guide was spot on.&rdquo;
              </p>
              <div className="pt-1 text-xs font-bold text-emerald-700 flex items-center gap-1">
                <span>Long Stay O-A Scheme · $1,600/mo Solo</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                  alt="Elena & Carlos"
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-teal-500/20"
                />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Elena &amp; Carlos T.</h4>
                  <span className="text-xs text-slate-500">Relocated to Atenas, Costa Rica (2024)</span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic">
                &ldquo;We wanted eternal spring weather and community meetups. The Pensionado visa process took 4 months, and CAJA health coverage is straightforward. We walk everywhere and host weekly expat game nights.&rdquo;
              </p>
              <div className="pt-1 text-xs font-bold text-teal-700 flex items-center gap-1">
                <span>Pensionado Visa · $2,350/mo Couple</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ============================================================ */}
      {/* 7. HIGH-CONVERSION PORTAL SIGN-UP CALL TO ACTION               */}
      {/* ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 lg:p-16 rounded-3xl bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 text-white shadow-xl relative overflow-hidden">
          
          {/* Subtle background circles */}
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-80 h-80 bg-orange-700/30 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold backdrop-blur-md">
              <Compass className="w-3.5 h-3.5 text-white" />
              <span>Free Membership · Zero Spam</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Ready to Turn Your Overseas Dream into an Actionable Blueprint?
            </h2>

            <p className="text-base sm:text-lg text-orange-100 font-medium leading-relaxed">
              Create your account to save customized haven shortlists, export printable PDF dossiers, simulate multi-currency portfolios, and connect with fellow retirees in local meetups.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={() => openAuthModal('signup')}
                className="px-8 py-4 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-extrabold text-sm sm:text-base shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center gap-2.5 cursor-pointer"
              >
                <UserPlus className="w-5 h-5 text-orange-400" />
                <span>Create Free Member Account</span>
              </button>

              {!isAuthenticated && (
                <button
                  onClick={() => openAuthModal('login')}
                  className="px-6 py-4 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-sm sm:text-base border border-white/30 backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <LogIn className="w-5 h-5" />
                  <span>Existing Member Sign In</span>
                </button>
              )}
            </div>

            {/* Checklist of Member Features */}
            <div className="pt-6 border-t border-white/20 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-orange-50 font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                <span>{countries.length} Country PDF Dossier Downloads</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                <span>Cloud FIRE Portfolio &amp; Net Worth Sync</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                <span>Direct Member Messaging &amp; Expat Meetups</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                <span>Custom Relocation Checklists &amp; Visa Reminders</span>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};
