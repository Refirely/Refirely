import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Country, Region, ClimateCategory, SortByType } from '../types';
import { CountryThumbnail } from './CountryThumbnail';
import { CountryFlag } from './CountryFlag';
import { getCountryTravelLeisureScore, getCountryTravelMobility } from '../data/countryTravelMobility';
import {
  Compass, Sparkles, Flame, ArrowRight, ArrowDown, DollarSign, Heart,
  ShieldCheck, Sun, Globe, Users, Scale, CheckCircle2, TrendingUp,
  SlidersHorizontal, Plane, FileText, ChevronRight, Check, MapPin,
  Award, RefreshCw, LogIn, UserPlus, BookOpen, Layers
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const {
    countries,
    navigateToCountry,
    setCurrentView,
    openAuthModal,
    isAuthenticated,
    userProfile,
    isCountrySaved,
    toggleSaveCountry,
    isCountryCompared,
    toggleCompareCountry,
  } = useApp();

  // -------------------------------------------------------------
  // 1. AI Haven Matcher Interactive Preview State
  // -------------------------------------------------------------
  const [matchBudget, setMatchBudget] = useState<number>(2500);
  const [matchClimate, setMatchClimate] = useState<ClimateCategory | 'Any'>('Mediterranean');
  const [matchPriority, setMatchPriority] = useState<'value' | 'healthcare' | 'safety' | 'leisure'>('leisure');

  // Compute top 3 matching countries based on landing parameters
  const topMatches = useMemo(() => {
    return countries
      .map(country => {
        let score = 70; // baseline

        // Budget match (30 pts)
        const diff = matchBudget - country.costOfLiving.monthlyBudgetCoupleUSD;
        if (diff >= 0) {
          score += 25; // comfortably under budget
        } else if (diff >= -500) {
          score += 15; // slightly over
        } else {
          score -= 10;
        }

        // Climate match (25 pts)
        if (matchClimate === 'Any' || country.climate.category === matchClimate) {
          score += 25;
        }

        // Priority factor (25 pts)
        const travelScore = getCountryTravelLeisureScore(country);
        if (matchPriority === 'value') {
          if (country.costOfLiving.monthlyBudgetCoupleUSD <= 2200) score += 25;
          else if (country.costOfLiving.monthlyBudgetCoupleUSD <= 3000) score += 15;
        } else if (matchPriority === 'healthcare') {
          score += (country.lifestyle.healthcareScore / 100) * 25;
        } else if (matchPriority === 'safety') {
          score += (country.lifestyle.safetyScore / 100) * 25;
        } else if (matchPriority === 'leisure') {
          score += (travelScore / 100) * 25;
        }

        const normalizedScore = Math.min(99, Math.max(68, Math.round(score)));
        return { country, matchScore: normalizedScore };
      })
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 3);
  }, [countries, matchBudget, matchClimate, matchPriority]);

  // -------------------------------------------------------------
  // 2. Interactive FIRE Calculator State (similar to dashboard)
  // -------------------------------------------------------------
  const [currentNetWorth, setCurrentNetWorth] = useState<number>(250000);
  const [targetMonthlyExpenseAbroad, setTargetMonthlyExpenseAbroad] = useState<number>(2400);
  const [domesticMonthlyExpense, setDomesticMonthlyExpense] = useState<number>(4800);
  const [annualSavings, setAnnualSavings] = useState<number>(25000);
  const [safeWithdrawalRate, setSafeWithdrawalRate] = useState<number>(4.0); // 4% rule
  const [expectedGrowthRate, setExpectedGrowthRate] = useState<number>(7.0); // 7% real return

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
  const fireProgressPercent = Math.min(100, Math.round((currentNetWorth / fireNestEggAbroad) * 100));

  // -------------------------------------------------------------
  // 3. Curated Country Grid Preview State (16 items initially, Live Sorting, Load More +16)
  // -------------------------------------------------------------
  const [previewSort, setPreviewSort] = useState<SortByType>('travel-leisure-desc');
  const [previewRegion, setPreviewRegion] = useState<string>('All');
  const [visibleCount, setVisibleCount] = useState<number>(16);

  // Filter and sort the 100 countries reactively
  const sortedPreviewCountries = useMemo(() => {
    let list = [...countries];

    if (previewRegion !== 'All') {
      list = list.filter(c => c.region === previewRegion);
    }

    list.sort((a, b) => {
      switch (previewSort) {
        case 'budget-asc':
          return a.costOfLiving.monthlyBudgetCoupleUSD - b.costOfLiving.monthlyBudgetCoupleUSD;
        case 'travel-leisure-desc':
          return getCountryTravelLeisureScore(b) - getCountryTravelLeisureScore(a);
        case 'healthcare-desc':
          return b.lifestyle.healthcareScore - a.lifestyle.healthcareScore;
        case 'safety-desc':
          return b.lifestyle.safetyScore - a.lifestyle.safetyScore;
        case 'sunny-desc':
          return b.climate.annualSunnyDays - a.climate.annualSunnyDays;
        case 'visa-income-asc':
          return a.visa.minimumIncomeUSD - b.visa.minimumIncomeUSD;
        case 'recommended':
        default: {
          const scoreA = (a.lifestyle.healthcareScore + a.lifestyle.safetyScore) / 2 - (a.costOfLiving.monthlyBudgetCoupleUSD / 100);
          const scoreB = (b.lifestyle.healthcareScore + b.lifestyle.safetyScore) / 2 - (b.costOfLiving.monthlyBudgetCoupleUSD / 100);
          return scoreB - scoreA;
        }
      }
    });

    return list;
  }, [countries, previewSort, previewRegion]);

  const displayedCountries = sortedPreviewCountries.slice(0, visibleCount);
  const hasMoreCountries = visibleCount < sortedPreviewCountries.length;

  const handleLoadMore = () => {
    setVisibleCount(prev => Math.min(sortedPreviewCountries.length, prev + 16));
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
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
        {/* Background Visual with subtle pan effect & rich vignette */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=2000&q=85"
            alt="Mediterranean coastal haven"
            className="w-full h-full object-cover object-center scale-105 filter brightness-[0.42] contrast-[1.12]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/80 to-slate-950/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/60" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="max-w-3xl space-y-6">
            
            {/* Trust badge kicker */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/20 border border-orange-400/30 text-orange-300 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-orange-400" />
              <span>100 Verified Global Havens · Updated for 2026</span>
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
              Factual, empirical data across 100 countries. Model your financial freedom with our interactive FIRE calculator, explore verified visa thresholds, and discover your personalized haven match.
            </p>

            {/* Primary Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3.5">
              <button
                onClick={() => scrollToSection('haven-matcher')}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm sm:text-base shadow-lg shadow-orange-500/25 transition-all transform hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-200" />
                <span>AI Haven Matcher</span>
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
                onClick={() => scrollToSection('countries-grid')}
                className="px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 font-medium text-sm sm:text-base border border-white/10 backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Globe className="w-4 h-4 text-teal-300" />
                <span>Browse 100 Havens</span>
              </button>
            </div>

            {/* Social proof metric chips */}
            <div className="pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-slate-300 text-xs">
              <div>
                <div className="text-xl sm:text-2xl font-black text-white">100</div>
                <div className="text-slate-400">Verified Havens</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-amber-400">28+</div>
                <div className="text-slate-400">Living Metrics</div>
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
              Input your net worth, desired monthly budget, weather preferences, and safety priorities. Get mathematically ranked country recommendations.
            </p>
            <div className="pt-2">
              <button
                onClick={() => scrollToSection('haven-matcher')}
                className="text-xs font-bold text-orange-600 hover:text-orange-700 inline-flex items-center gap-1 group cursor-pointer"
              >
                <span>Try Matcher below</span>
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
            <h3 className="text-lg font-bold text-slate-900">Vetted Visas & Mobility</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              D7 Passive Income, Non-Lucrative Visas, Pensionado schemes, and Schengen rules. Plus travel ease and mobility ratings for couple and solo retirees.
            </p>
            <div className="pt-2">
              <button
                onClick={() => scrollToSection('countries-grid')}
                className="text-xs font-bold text-teal-700 hover:text-teal-800 inline-flex items-center gap-1 group cursor-pointer"
              >
                <span>Browse country dossiers</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. INTERACTIVE AI HAVEN MATCH SUGGESTIONS SPOTLIGHT            */}
      {/* ============================================================ */}
      <section id="haven-matcher" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white shadow-xl border border-slate-800">
          
          <div className="max-w-3xl mb-8 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-orange-400" />
              <span>Interactive Match Engine</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Find Your Ideal Haven in 3 Clicks
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Simulate live rankings across all 100 destinations based on your target budget, climate, and top relocation priority.
            </p>
          </div>

          {/* Interactive Parameters Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-5 sm:p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80 mb-8 backdrop-blur-md">
            
            {/* Control 1: Budget */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Monthly Couple Budget</span>
                <span className="text-orange-400 font-extrabold text-sm">${matchBudget.toLocaleString()}/mo</span>
              </label>
              <input
                type="range"
                min="1400"
                max="5000"
                step="100"
                value={matchBudget}
                onChange={e => setMatchBudget(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>$1,400 (Frugal)</span>
                <span>$2,500 (Moderate)</span>
                <span>$5,000+ (Luxury)</span>
              </div>
            </div>

            {/* Control 2: Climate */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">Preferred Climate</label>
              <select
                value={matchClimate}
                onChange={e => setMatchClimate(e.target.value as ClimateCategory | 'Any')}
                className="w-full px-3 py-2 bg-slate-700/90 border border-slate-600 rounded-xl text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="Any">Any Climate</option>
                <option value="Mediterranean">Mediterranean (Mild & Sunny)</option>
                <option value="Tropical">Tropical (Warm & Lush)</option>
                <option value="Subtropical">Subtropical (Warm & Breezy)</option>
                <option value="Temperate">Temperate (Four Seasons)</option>
                <option value="Highlands / Mild">Highlands / Mild (Eternal Spring)</option>
              </select>
            </div>

            {/* Control 3: Priority */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">Primary Priority</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMatchPriority('value')}
                  className={`px-3 py-2 text-xs rounded-xl font-semibold transition-colors text-left ${
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
                  className={`px-3 py-2 text-xs rounded-xl font-semibold transition-colors text-left ${
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
                  className={`px-3 py-2 text-xs rounded-xl font-semibold transition-colors text-left ${
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
                  className={`px-3 py-2 text-xs rounded-xl font-semibold transition-colors text-left ${
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

          {/* Results: Top 3 Match Cards */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold uppercase tracking-wider text-slate-300">
                Top Haven Matches for Your Profile
              </span>
              <button
                onClick={() => setCurrentView('explore')}
                className="text-orange-400 hover:text-orange-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>View All 100 in Explorer</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {topMatches.map(({ country, matchScore }, index) => {
                const travelScore = getCountryTravelLeisureScore(country);
                return (
                  <div
                    key={country.id}
                    onClick={() => navigateToCountry(country.id)}
                    className="group bg-slate-800/90 rounded-2xl border border-slate-700/80 overflow-hidden hover:border-orange-500/70 transition-all cursor-pointer flex flex-col justify-between hover:shadow-xl hover:-translate-y-1"
                  >
                    <div>
                      {/* Photo Header */}
                      <div className="h-44 relative">
                        <CountryThumbnail country={country} className="h-full w-full" />
                        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-slate-900/85 backdrop-blur-md text-amber-300 text-xs font-black flex items-center gap-1 shadow-md">
                          <Sparkles className="w-3 h-3 text-amber-400" />
                          <span>{matchScore}% Match</span>
                        </div>
                        <div className="absolute bottom-3 left-3 flex items-center gap-2">
                          <CountryFlag countryName={country.name} countryCode={country.code} fallbackEmoji={country.flag} className="w-6 h-6 shadow-md rounded" />
                          <span className="font-extrabold text-white text-base drop-shadow-md">
                            {country.name}
                          </span>
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

                        <div className="text-xs text-slate-300 space-y-1 border-t border-slate-700/60 pt-2.5">
                          <div className="flex items-center gap-1.5 text-slate-300">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>Safety {country.lifestyle.safetyScore}/100 · Health {country.lifestyle.healthcareScore}/100</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-300">
                            <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span>{country.climate.annualSunnyDays} sunny days · {country.climate.category}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 pt-0">
                      <div className="w-full py-2 px-3 rounded-xl bg-orange-500/15 group-hover:bg-orange-500 text-orange-300 group-hover:text-white text-xs font-bold text-center transition-colors flex items-center justify-center gap-1.5">
                        <span>View Country Dossier</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
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
                  min="1200"
                  max="4500"
                  step="100"
                  value={targetMonthlyExpenseAbroad}
                  onChange={e => setTargetMonthlyExpenseAbroad(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                />
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>$1,200 (Lean FIRE)</span>
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
                  min="2500"
                  max="8000"
                  step="100"
                  value={domesticMonthlyExpense}
                  onChange={e => setDomesticMonthlyExpense(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-600"
                />
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>$2,500</span>
                  <span>$4,800 (US/UK Avg)</span>
                  <span>$8,000</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <label className="font-bold text-slate-800">Annual Savings</label>
                    <span className="font-extrabold text-slate-900">${(annualSavings / 1000).toFixed(0)}k/yr</span>
                  </div>
                  <input
                    type="range"
                    min="5000"
                    max="80000"
                    step="2500"
                    value={annualSavings}
                    onChange={e => setAnnualSavings(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <label className="font-bold text-slate-800">Safe Withdrawal</label>
                    <span className="font-extrabold text-slate-900">{safeWithdrawalRate.toFixed(1)}%</span>
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
                </div>
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
                    At {safeWithdrawalRate}% SWR (${targetMonthlyExpenseAbroad.toLocaleString()}/mo)
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
                    At {safeWithdrawalRate}% SWR (${domesticMonthlyExpense.toLocaleString()}/mo)
                  </div>
                </div>
              </div>

              {/* Geo-Arbitrage Savings Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-100">
                    Capital Required Slashed
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-800/80 text-emerald-200 text-xs font-extrabold">
                    {capitalSavedPercent}% Less Capital
                  </span>
                </div>
                <div className="text-2xl sm:text-3xl font-black">
                  Save ${capitalSaved.toLocaleString()} in Required Net Worth
                </div>
                <p className="text-xs text-emerald-100 leading-relaxed">
                  By moving to a verified haven, your existing net worth of ${currentNetWorth.toLocaleString()} already covers {fireProgressPercent}% of your full retirement requirement.
                </p>
              </div>

              {/* Years to Retirement Comparison */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Years to Financial Freedom
                  </span>
                  <span className="text-xs font-extrabold text-orange-600">
                    {yearsSaved > 0 ? `Retire ${yearsSaved} Years Sooner Abroad!` : 'Ready Today!'}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">Retirement Abroad:</span>
                    <span className="font-bold text-slate-900">{yearsToFireAbroad === 0 ? 'Achieved Now' : `${yearsToFireAbroad} Years`}</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-500 rounded-full transition-all duration-500"
                      style={{ width: `${fireProgressPercent}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    onClick={() => setCurrentView('dashboard')}
                    className="text-xs font-bold text-orange-600 hover:text-orange-700 inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Open Detailed Financial Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] text-slate-400">Includes real inflation & loan tracking</span>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. CURATED COUNTRY GRID PREVIEW (24-30 Havens, Live Sorting)   */}
      {/* ============================================================ */}
      <section id="countries-grid" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20 space-y-6">
        
        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <div className="text-xs font-bold text-orange-600 uppercase tracking-widest flex items-center gap-1.5 mb-1">
              <Globe className="w-4 h-4 text-orange-500" />
              <span>Explore 100 Global Retirement Havens</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Verified Haven Directory
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
              Showing {displayedCountries.length} of {sortedPreviewCountries.length} destinations. Select any sort option to instantly update the rankings.
            </p>
          </div>

          {/* Single-Line Sort & Region Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Region Filter */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              {['All', 'Europe', 'Americas', 'Southeast Asia'].map(region => (
                <button
                  key={region}
                  onClick={() => {
                    setPreviewRegion(region);
                    setVisibleCount(16);
                  }}
                  className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    previewRegion === region
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {region}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-slate-400" />
              <select
                value={previewSort}
                onChange={e => {
                  setPreviewSort(e.target.value as SortByType);
                  setVisibleCount(16);
                }}
                className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 shadow-2xs focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
              >
                <option value="travel-leisure-desc">Travel &amp; Leisure Score (High to Low)</option>
                <option value="budget-asc">Monthly Budget (Lowest First)</option>
                <option value="healthcare-desc">Healthcare Quality (Highest First)</option>
                <option value="safety-desc">Safety &amp; Peace Index (Highest First)</option>
                <option value="sunny-desc">Sunny Days per Year (Most Sunshine)</option>
                <option value="visa-income-asc">Visa Income (Lowest Requirement)</option>
                <option value="recommended">ReFIREly Composite Haven Rank</option>
              </select>
            </div>
          </div>
        </div>

        {/* The Responsive Haven Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayedCountries.map(country => {
            const travelScore = getCountryTravelLeisureScore(country);
            const mobility = getCountryTravelMobility(country);
            const saved = isCountrySaved(country.id);
            const compared = isCountryCompared(country.id);

            return (
              <div
                key={country.id}
                onClick={() => navigateToCountry(country.id)}
                className="group bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between hover:-translate-y-1"
              >
                <div>
                  {/* Photo Header */}
                  <div className="h-44 relative overflow-hidden">
                    <CountryThumbnail country={country} className="h-full w-full" />
                    
                    {/* Top overlay badges */}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-semibold">
                        {country.region}
                      </span>
                    </div>

                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          toggleSaveCountry(country.id);
                        }}
                        title={saved ? 'Remove from Saved' : 'Save to Favorites'}
                        className={`p-1.5 rounded-full backdrop-blur-md transition-colors ${
                          saved ? 'bg-rose-500 text-white' : 'bg-slate-900/70 text-slate-300 hover:text-white'
                        }`}
                      >
                        <Heart className="w-3.5 h-3.5 fill-current" />
                      </button>
                    </div>

                    {/* Bottom Title */}
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CountryFlag countryName={country.name} countryCode={country.code} fallbackEmoji={country.flag} className="w-5 h-5 rounded shadow" />
                        <span className="font-extrabold text-white text-base drop-shadow-md">
                          {country.name}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-amber-300 bg-slate-950/80 px-2 py-0.5 rounded-md">
                        ${country.costOfLiving.monthlyBudgetCoupleUSD.toLocaleString()}/mo
                      </span>
                    </div>
                  </div>

                  {/* Body Metrics */}
                  <div className="p-4 space-y-2.5">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="text-slate-500 block text-[10px] uppercase font-semibold">Travel &amp; Leisure</span>
                        <span className="font-extrabold text-orange-600 text-xs flex items-center gap-1">
                          <Plane className="w-3 h-3 text-orange-500" />
                          <span>{travelScore}/100</span>
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="text-slate-500 block text-[10px] uppercase font-semibold">Healthcare</span>
                        <span className="font-extrabold text-emerald-700 text-xs flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          <span>{country.lifestyle.healthcareScore}/100</span>
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {country.tagline}
                    </div>

                    <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Visa: {country.visa.minimumIncomeUSD > 0 ? `$${country.visa.minimumIncomeUSD}/mo min` : 'Accessible'}</span>
                      <span>{country.climate.annualSunnyDays} Sunny Days</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="p-4 pt-0 flex items-center justify-between gap-2 border-t border-slate-100 mt-2">
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      toggleCompareCountry(country.id);
                    }}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                      compared
                        ? 'bg-orange-500 text-white border-orange-500'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {compared ? 'In Matrix' : 'Compare'}
                  </button>
                  <span className="text-xs font-bold text-orange-600 group-hover:text-orange-700 inline-flex items-center gap-1">
                    <span>View Dossier</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Load More Button & Progress Bar */}
        <div className="pt-6 pb-2 text-center space-y-3">
          <div className="max-w-xs mx-auto space-y-1.5">
            <div className="flex justify-between text-xs text-slate-500 font-semibold">
              <span>Showing {displayedCountries.length} of {sortedPreviewCountries.length} Havens</span>
              <span>{Math.round((displayedCountries.length / sortedPreviewCountries.length) * 100)}%</span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 rounded-full transition-all duration-300"
                style={{ width: `${(displayedCountries.length / sortedPreviewCountries.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {hasMoreCountries ? (
              <button
                onClick={handleLoadMore}
                className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer flex items-center gap-2"
              >
                <span>Load More Havens (+16)</span>
                <ArrowDown className="w-4 h-4 text-orange-400" />
              </button>
            ) : (
              <div className="text-xs font-bold text-slate-500 bg-slate-100 px-4 py-2 rounded-xl">
                All {sortedPreviewCountries.length} Havens in this category are displayed
              </div>
            )}

            <button
              onClick={() => {
                setCurrentView('explore');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-6 py-3 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-900 text-xs sm:text-sm font-bold border border-orange-200 shadow-2xs transition-all cursor-pointer flex items-center gap-2"
            >
              <span>Open Advanced Explorer (28+ Filters)</span>
              <ArrowRight className="w-4 h-4 text-orange-600" />
            </button>
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
                <span>100 Country PDF Dossier Downloads</span>
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
