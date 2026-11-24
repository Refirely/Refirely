import React, { useState, useMemo, useEffect } from 'react';
import { motion, MotionConfig } from 'motion/react';
import { useApp } from '../context/AppContext';
import { CountryThumbnail } from './CountryThumbnail';
import { CountryFlag } from './CountryFlag';
import { getCountryTravelLeisureScore } from '../data/countryTravelMobility';
import { getCountryContinentLabel } from '../utils/continents';
import { getCountryNomadProfile } from '../data/countryNomadProfiles';
import { GlobalHavenFeasibilityWidget } from './GlobalHavenFeasibilityWidget';
import { NomadHavenRunwayWidget } from './NomadHavenRunwayWidget';
import { DEFAULT_FINANCIAL_PORTFOLIO } from '../data/userAccounts';
import {
  Compass,
  Sparkles,
  Flame,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  LogIn,
  UserPlus,
  Wallet,
  Zap,
  Laptop,
  Globe,
  Stamp,
  Scale,
  HelpCircle,
} from 'lucide-react';

export const FireCalculatorPage: React.FC = () => {
  const {
    countries,
    navigateToCountry,
    setCurrentView,
    openAuthModal,
    isAuthenticated,
    currentUserId,
    setSelectedRegion,
    setSelectedClimate,
    setSearchQuery,
    setSortBy,
    currentPersona,
    openShareFireCardModal,
    userProfile,
  } = useApp();

  const isGuestUser = !isAuthenticated || currentUserId === 'guest';

  // -------------------------------------------------------------
  // 1. Interactive FIRE Calculator State
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
  const capitalSavedPercent = Math.round((capitalSaved / Math.max(1, fireNestEggDomestic)) * 100);

  const calculateYearsToFire = (
    targetNestEgg: number,
    currentSavings: number,
    annualContribution: number,
    rate: number
  ) => {
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

  const yearsToFireAbroad = calculateYearsToFire(
    fireNestEggAbroad,
    currentNetWorth,
    annualSavings,
    expectedGrowthRate
  );
  const yearsToFireDomestic = calculateYearsToFire(
    fireNestEggDomestic,
    currentNetWorth,
    annualSavings,
    expectedGrowthRate
  );
  const yearsSaved = Math.max(0, yearsToFireDomestic - yearsToFireAbroad);
  const fireProgressPercent = Math.min(
    100,
    Math.round((currentNetWorth / Math.max(1, fireNestEggAbroad)) * 100)
  );
  const fireProgressDomesticPercent = Math.min(
    100,
    Math.round((currentNetWorth / Math.max(1, fireNestEggDomestic)) * 100)
  );
  const swrMultiplier = +(100 / safeWithdrawalRate).toFixed(1);

  // Top 4 matching countries dynamically synced with the user's FIRE Calculator inputs
  const fireMatchedCountries = useMemo(() => {
    const useSingleBasis = targetMonthlyExpenseAbroad < 1350;

    const evaluated = countries.map(country => {
      const referenceMonthlyCost = useSingleBasis
        ? country.costOfLiving.monthlyBudgetSingleUSD
        : country.costOfLiving.monthlyBudgetCoupleUSD;
      const countryNestEgg = Math.round((referenceMonthlyCost * 12) / swrDecimal);
      const fundedPercent = Math.min(
        100,
        Math.round((currentNetWorth / Math.max(1, countryNestEgg)) * 100)
      );
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

      let fitRank = qualityScore;
      if (budgetDelta >= 0 && budgetDelta <= 700) {
        fitRank += 40;
      } else if (budgetDelta > 700) {
        fitRank += 28;
      } else if (budgetDelta >= -250) {
        fitRank += 12;
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

  // -------------------------------------------------------------
  // 2. Duo-Calculator Tab State & Nomad Runway Calculation
  // -------------------------------------------------------------
  const [calculatorTab, setCalculatorTab] = useState<'fire' | 'nomad'>(
    currentPersona === 'nomad' ? 'nomad' : 'fire'
  );

  useEffect(() => {
    setCalculatorTab(currentPersona === 'nomad' ? 'nomad' : 'fire');
  }, [currentPersona]);

  const [nomadSavings, setNomadSavings] = useState<number>(36000);
  const [nomadMonthlyBurn, setNomadMonthlyBurn] = useState<number>(1850);
  const [nomadRemoteIncome, setNomadRemoteIncome] = useState<number>(850);

  const nomadNetBurn = Math.max(0, nomadMonthlyBurn - nomadRemoteIncome);
  const nomadRunwayMonths = nomadNetBurn <= 0 ? 999 : Math.floor(nomadSavings / nomadNetBurn);
  const nomadRunwayYears = (nomadRunwayMonths / 12).toFixed(1);
  const nomadSixMonthRunwayRequired = nomadNetBurn * 6;
  const nomadTwelveMonthRunwayRequired = nomadNetBurn * 12;

  const nomadMatchedCountries = useMemo(() => {
    const list = countries.map(country => {
      const nomadProfile = getCountryNomadProfile(country);
      const burnDelta = nomadMonthlyBurn - nomadProfile.monthlyNomadBurnUSD;
      let fitScore = nomadProfile.hasCuratedData ? 40 : 10;
      if (burnDelta >= 0 && burnDelta <= 500) {
        fitScore += 35;
      } else if (burnDelta > 500) {
        fitScore += 25;
      } else if (burnDelta >= -300) {
        fitScore += 15;
      } else {
        fitScore -= Math.abs(burnDelta) / 25;
      }
      fitScore += Math.min(25, nomadProfile.verifiedInternetMbps / 10);
      return {
        country,
        nomadProfile,
        fitScore,
      };
    });
    list.sort((a, b) => b.fitScore - a.fitScore);
    return list.slice(0, 4);
  }, [countries, nomadMonthlyBurn]);

  const handleOpenAdvancedExplorer = () => {
    setSelectedRegion('All');
    setSelectedClimate('All');
    setSearchQuery('');
    setSortBy(calculatorTab === 'nomad' ? 'internet-speed-desc' : 'budget-asc');
    setCurrentView('explore');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenDashboardOrAuth = () => {
    if (isGuestUser) {
      openAuthModal('signup');
      return;
    }
    setCurrentView('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="pt-5 md:pt-8 pb-16 md:pb-24 space-y-10 md:space-y-14 overflow-x-clip bg-gradient-to-b from-amber-50/35 via-white to-teal-50/30">
        {/* ============================================================ */}
        {/* 1. INTERNATIONAL GEO-ARBITRAGE ENGINE (PRIMARY TOP MODULE)   */}
        {/* ============================================================ */}
        <section id="fire-calculator" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
          <div className="relative overflow-hidden p-4 md:p-10 rounded-2xl md:rounded-[2rem] bg-gradient-to-br from-amber-50/75 via-white to-emerald-50/75 border border-amber-200/80 shadow-xl shadow-amber-950/5">
            {/* Decorative Multi-Color Top Ribbon & Ambient Orbs */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 via-50% to-emerald-500" />
            <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-amber-400/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-emerald-400/15 blur-3xl" />

            <div className="relative z-10 max-w-4xl mb-5 md:mb-8 space-y-2.5 md:space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 md:px-3.5 md:py-1.5 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white text-[11px] md:text-xs font-bold shadow-xs">
                  <Flame className="w-3.5 h-3.5 text-amber-100" />
                  <span>International Geo-Arbitrage Engine</span>
                </div>
                <span className="hidden md:inline text-xs font-bold text-slate-500">
                  Dual-Persona FIRE &amp; Runway Simulator · {countries.length} Countries
                </span>
              </div>

              {/* Duo-Calculator Segmented Tab Switcher */}
              <div className="pt-1 flex flex-wrap items-center gap-2.5">
                <div className="grid grid-cols-2 w-full md:w-auto md:inline-flex p-1 rounded-2xl bg-slate-900/10 border border-slate-300/80 backdrop-blur-md shadow-xs">
                  <button
                    type="button"
                    onClick={() => setCalculatorTab('fire')}
                    className={`px-3 md:px-5 py-2 md:py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 md:gap-2 ${
                      calculatorTab === 'fire'
                        ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white shadow-md'
                        : 'text-slate-700 hover:text-slate-950 hover:bg-white/60'
                    }`}
                  >
                    <Flame className="w-4 h-4 text-amber-200 shrink-0" />
                    <span className="md:hidden">FIRE Plan</span>
                    <span className="hidden md:inline">Tab 1: FIRE Target &amp; Nest Egg</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalculatorTab('nomad')}
                    className={`px-3 md:px-5 py-2 md:py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 md:gap-2 ${
                      calculatorTab === 'nomad'
                        ? 'bg-gradient-to-r from-indigo-600 via-teal-600 to-emerald-600 text-white shadow-md'
                        : 'text-slate-700 hover:text-slate-950 hover:bg-white/60'
                    }`}
                  >
                    <Zap className="w-4 h-4 text-amber-300 shrink-0" />
                    <span className="md:hidden">Nomad Runway</span>
                    <span className="hidden md:inline">Tab 2: Nomad Runway &amp; Burn</span>
                  </button>
                </div>
              </div>

              <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                {calculatorTab === 'fire' ? (
                  <>
                    Calculate Your{' '}
                    <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-emerald-600 bg-clip-text text-transparent">
                      FIRE Timeline Abroad
                    </span>
                  </>
                ) : (
                  <>
                    Calculate Your{' '}
                    <span className="bg-gradient-to-r from-teal-600 via-indigo-600 to-emerald-600 bg-clip-text text-transparent">
                      Nomad Runway &amp; Monthly Burn
                    </span>
                  </>
                )}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {calculatorTab === 'fire'
                  ? 'Living in an overseas haven with a high standard of living can reduce your required retirement portfolio by 40% to 65%, enabling you to retire a decade sooner.'
                  : 'Determine exactly how many months or years of global freedom your liquid savings buy across top digital nomad havens, factoring in turnkey rent, coworking, and remote client retainers.'}
              </p>
            </div>

            {calculatorTab === 'fire' ? (
              <>
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Left Column: Multi-Colored Interactive Inputs */}
                  <div className="lg:col-span-6 space-y-5 bg-white/95 backdrop-blur-xl p-6 rounded-3xl border border-amber-200/80 shadow-md">
                    <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-200/70 space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <label className="font-extrabold text-indigo-950 uppercase tracking-wider">
                          Current Invested Assets
                        </label>
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
                        <label className="font-extrabold text-amber-950 uppercase tracking-wider">
                          Target Monthly Budget Abroad
                        </label>
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
                        <label className="font-extrabold text-slate-800 uppercase tracking-wider">
                          Current Domestic Monthly Cost (At Home)
                        </label>
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
                            {safeWithdrawalRate.toFixed(1)}%{' '}
                            <span className="text-[10px] font-semibold text-teal-700">({swrMultiplier}x)</span>
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

                    <div className="hidden md:block p-3.5 rounded-2xl bg-gradient-to-r from-indigo-50/60 to-teal-50/60 border border-indigo-200/60 text-[11px] text-slate-600 leading-relaxed">
                      <span className="font-bold text-indigo-950">How SWR works:</span> Nest Egg = Annual Spending ÷ SWR. A{' '}
                      <span className="font-semibold text-slate-800">lower SWR</span> (e.g., 3.0%) means withdrawing a smaller slice of your portfolio each year for safety, which requires a{' '}
                      <span className="font-semibold text-slate-800">larger nest egg ({swrMultiplier}x annual expenses)</span> and more years to save.
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
                            Retire Abroad{' '}
                            <span className="text-slate-400 font-normal">
                              (${targetMonthlyExpenseAbroad.toLocaleString()}/mo · ${fireNestEggAbroad.toLocaleString()} goal)
                            </span>
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
                            Retire at Home{' '}
                            <span className="text-slate-400 font-normal">
                              (${domesticMonthlyExpense.toLocaleString()}/mo · ${fireNestEggDomestic.toLocaleString()} goal)
                            </span>
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

                      <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() =>
                              openShareFireCardModal({
                                persona: currentPersona,
                                badgeTitle:
                                  fireProgressPercent >= 100
                                    ? '100% FI'
                                    : yearsSaved >= 5
                                    ? 'Arbitrage Architect'
                                    : 'FIRE Pathfinder',
                                badgeEmoji: fireProgressPercent >= 100 ? '🔥' : '⚡',
                                yearsSaved: Math.max(1, yearsSaved || 8),
                                fireProgressPercent,
                                topCountry: fireMatchedCountries[0]?.country.name || 'Portugal',
                                topCountryFlag: fireMatchedCountries[0]?.country.flag,
                                topCity:
                                  fireMatchedCountries[0]?.country.topCities?.[0]?.name ||
                                  fireMatchedCountries[0]?.country.capital ||
                                  'Lisbon',
                                monthlyBurnUSD: targetMonthlyExpenseAbroad,
                                domesticMonthlyBurnUSD: domesticMonthlyExpense,
                                currentNetWorthUSD: currentNetWorth,
                                targetFireNestEggUSD: fireNestEggAbroad,
                                swrPercent: safeWithdrawalRate,
                                headlineMode: yearsSaved > 0 ? 'years-saved' : 'fi-percent',
                              })
                            }
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-50 via-purple-50 to-rose-50 hover:from-indigo-100 hover:via-purple-100 hover:to-rose-100 text-indigo-950 border border-indigo-200/90 text-xs font-extrabold shadow-2xs transition-all inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                          >
                            <span>🏅 Create Shareable FIRE Card</span>
                          </button>

                          <button
                            type="button"
                            onClick={handleOpenDashboardOrAuth}
                            className="text-xs font-extrabold text-indigo-700 hover:text-teal-700 inline-flex items-center gap-1.5 cursor-pointer group whitespace-nowrap"
                          >
                            <span>
                              {isGuestUser
                                ? 'Sign Up for Full Portfolio Dashboard'
                                : 'Open Detailed Financial Dashboard'}
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                          </button>
                        </div>
                        <span className="text-[11px] text-slate-400">
                          Assumes {expectedGrowthRate}% annual return + ${(annualSavings / 1000).toFixed(0)}k/yr savings
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Global Haven FIRE Feasibility Matrix (Desktop Only) */}
                <div className="hidden md:block mt-8 mb-8">
                  <GlobalHavenFeasibilityWidget
                    userProfile={{
                      ...userProfile,
                      finances: {
                        ...DEFAULT_FINANCIAL_PORTFOLIO,
                        ...(userProfile.finances || {}),
                        investments: {
                          ...(userProfile.finances?.investments || DEFAULT_FINANCIAL_PORTFOLIO.investments),
                          stocksMutualFundsUSD: currentNetWorth,
                        },
                      },
                    }}
                    countries={countries}
                    onSelectCountry={cName =>
                      navigateToCountry(
                        countries.find(c => c.name.toLowerCase() === cName.toLowerCase())?.id || 'portugal'
                      )
                    }
                  />
                </div>

                {/* Live Matching Retirement Havens for the User's FIRE Parameters */}
                <div className="relative z-10 mt-6 md:mt-10 pt-5 md:pt-8 border-t border-amber-200/70 space-y-5 md:space-y-6">
                  <div className="p-4 md:p-7 rounded-2xl md:rounded-3xl bg-gradient-to-br from-teal-50/85 via-white to-indigo-50/85 border border-teal-200/80 shadow-md space-y-4 md:space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-teal-600 to-indigo-600 text-white text-[11px] font-bold uppercase tracking-wider mb-2 shadow-2xs">
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          <span>Live FIRE-Ready Destination Matches</span>
                        </div>
                        <h2 className="text-base md:text-xl font-extrabold text-slate-900 tracking-tight">
                          <span className="md:hidden">Top 2</span>
                          <span className="hidden md:inline">Top 4</span> Havens Matching Your $
                          {targetMonthlyExpenseAbroad.toLocaleString()}/mo Target &amp; {safeWithdrawalRate.toFixed(1)}% SWR
                        </h2>
                      </div>
                      <span className="hidden md:inline-block text-xs font-bold text-indigo-900 bg-white px-3.5 py-1.5 rounded-xl border border-indigo-200/80 shadow-2xs self-start sm:self-auto">
                        Ranked by budget fit, healthcare, safety &amp; portfolio readiness
                      </span>
                    </div>

                    {/* 4 Matching Countries Grid (2 on Mobile, 4 on Desktop) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {fireMatchedCountries.map(
                        (
                          {
                            country,
                            referenceMonthlyCost,
                            budgetModeLabel,
                            countryNestEgg,
                            fundedPercent,
                            yearsToFireInCountry,
                          },
                          idx
                        ) => {
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
                              className={`${idx >= 2 ? 'hidden md:flex' : 'flex'} group rounded-2xl bg-white border border-indigo-100 hover:border-indigo-300 transition-shadow cursor-pointer flex-col justify-between overflow-hidden shadow-xs hover:shadow-xl hover:shadow-indigo-950/10`}
                            >
                              <div className={`h-1.5 w-full bg-gradient-to-r ${topBarColors[idx % topBarColors.length]}`} />

                              <CountryThumbnail country={country} className="h-32" hideLandmarkLabel>
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
                                    <h3 className="text-sm font-extrabold text-white truncate drop-shadow-xs">
                                      {country.name}
                                    </h3>
                                    <span className="text-[10px] font-medium text-slate-200 block truncate">
                                      {country.climate.category}
                                    </span>
                                  </div>
                                </div>
                              </CountryThumbnail>

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
                                    Health <strong className="font-mono text-slate-900">{country.lifestyle.healthcareScore}</strong> · Safety{' '}
                                    <strong className="font-mono text-slate-900">{country.lifestyle.safetyScore}</strong>
                                  </span>
                                  <span className="inline-flex items-center gap-0.5 font-extrabold text-indigo-700 group-hover:text-teal-700 transition-colors">
                                    <span>Dossier</span>
                                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                                  </span>
                                </div>
                              </div>
                            </motion.div>
                          );
                        }
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* TAB 2: NOMAD RUNWAY & BURN CALCULATOR */
              <>
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Left Column: Interactive Inputs for Nomads & Creators */}
                  <div className="lg:col-span-6 space-y-5 bg-white/95 backdrop-blur-xl p-6 rounded-3xl border border-teal-200/80 shadow-md">
                    <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-200/80 space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <label className="font-extrabold text-teal-950 uppercase tracking-wider flex items-center gap-1.5">
                          <Wallet className="w-3.5 h-3.5 text-teal-600" />
                          <span>Liquid Cash Buffer / Savings</span>
                        </label>
                        <motion.span
                          key={nomadSavings}
                          initial={{ scale: 0.92 }}
                          animate={{ scale: 1 }}
                          className="font-mono font-black px-2.5 py-0.5 rounded-lg bg-teal-950 text-teal-200 text-sm"
                        >
                          ${nomadSavings.toLocaleString()}
                        </motion.span>
                      </div>
                      <input
                        type="range"
                        min="5000"
                        max="200000"
                        step="2500"
                        value={nomadSavings}
                        onChange={e => setNomadSavings(Number(e.target.value))}
                        className="w-full h-2 bg-teal-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                      />
                      <div className="flex justify-between text-[11px] text-teal-800/80 font-mono">
                        <span>$5,000</span>
                        <span>$75,000</span>
                        <span>$200,000+</span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <label className="font-extrabold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                          <Flame className="w-3.5 h-3.5 text-amber-600" />
                          <span>Short-Term Living &amp; Coworking Burn</span>
                        </label>
                        <motion.span
                          key={nomadMonthlyBurn}
                          initial={{ scale: 0.92 }}
                          animate={{ scale: 1 }}
                          className="font-mono font-black px-2.5 py-0.5 rounded-lg bg-amber-500 text-slate-950 text-sm"
                        >
                          ${nomadMonthlyBurn.toLocaleString()}/mo
                        </motion.span>
                      </div>
                      <input
                        type="range"
                        min="700"
                        max="4500"
                        step="50"
                        value={nomadMonthlyBurn}
                        onChange={e => setNomadMonthlyBurn(Number(e.target.value))}
                        className="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                      />
                      <div className="flex justify-between text-[11px] text-amber-800/80 font-mono">
                        <span>$700 (Lean SE Asia)</span>
                        <span>$1,850 (Standard Nomad Hub)</span>
                        <span>$4,500 (Luxury Lisbon/Tokyo)</span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <label className="font-extrabold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                          <Laptop className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Remote Work / Freelance Inflow</span>
                        </label>
                        <motion.span
                          key={nomadRemoteIncome}
                          initial={{ scale: 0.92 }}
                          animate={{ scale: 1 }}
                          className="font-mono font-black px-2.5 py-0.5 rounded-lg bg-indigo-950 text-indigo-200 text-sm"
                        >
                          +${nomadRemoteIncome.toLocaleString()}/mo
                        </motion.span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="6000"
                        step="100"
                        value={nomadRemoteIncome}
                        onChange={e => setNomadRemoteIncome(Number(e.target.value))}
                        className="w-full h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                      <div className="flex justify-between text-[11px] text-indigo-800/80 font-mono">
                        <span>$0 (Full Sabbatical)</span>
                        <span>$1,500 (Part-Time Gig)</span>
                        <span>$6,000+ (Full Remote Job)</span>
                      </div>
                    </div>

                    <div className="hidden md:block p-3.5 rounded-2xl bg-gradient-to-r from-teal-50/60 to-indigo-50/60 border border-teal-200/60 text-[11px] text-slate-600 leading-relaxed space-y-1">
                      <div className="font-bold text-teal-950 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-teal-600" />
                        <span>The Nomad Runway Formula:</span>
                      </div>
                      <p>
                        Net Burn = Short-term Rent &amp; Coworking ($<strong>{nomadMonthlyBurn.toLocaleString()}</strong>) - Remote Inflow ($
                        <strong>{nomadRemoteIncome.toLocaleString()}</strong>) ={' '}
                        <strong className="text-slate-900">${nomadNetBurn.toLocaleString()}/mo</strong>. Dividing liquid savings by net burn reveals your real calendar survival runway before needing to take on additional clients.
                      </p>
                    </div>
                  </div>

                  {/* Right Column: Comparative Nomad Runway Results */}
                  <div className="lg:col-span-6 space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <motion.div
                        whileHover={{ y: -3 }}
                        className="relative overflow-hidden p-5 rounded-3xl bg-gradient-to-br from-teal-50 via-emerald-50/80 to-white border border-teal-300/90 shadow-sm space-y-1"
                      >
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-emerald-500" />
                        <span className="text-xs font-extrabold text-teal-800 uppercase tracking-wide">
                          Total Calendar Runway
                        </span>
                        <div className="text-2xl sm:text-3xl font-black text-teal-950 font-mono tabular-nums">
                          {nomadNetBurn === 0 ? '∞ Infinite' : `${nomadRunwayMonths} Mos`}
                        </div>
                        <div className="text-xs text-teal-700 font-medium">
                          {nomadNetBurn === 0
                            ? 'Cashflow positive abroad!'
                            : `~${nomadRunwayYears} years at current cash burn`}
                        </div>
                      </motion.div>

                      <motion.div
                        whileHover={{ y: -3 }}
                        className="relative overflow-hidden p-5 rounded-3xl bg-gradient-to-br from-indigo-50 via-sky-50/80 to-white border border-indigo-200/90 shadow-sm space-y-1"
                      >
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-sky-500" />
                        <span className="text-xs font-extrabold text-indigo-800 uppercase tracking-wide">
                          Net Monthly Cash Burn
                        </span>
                        <div className="text-2xl sm:text-3xl font-black text-indigo-950 font-mono tabular-nums">
                          ${nomadNetBurn.toLocaleString()}/mo
                        </div>
                        <div className="text-xs text-indigo-700 font-medium">
                          ${nomadMonthlyBurn.toLocaleString()} burn - ${nomadRemoteIncome.toLocaleString()} inflow
                        </div>
                      </motion.div>
                    </div>

                    <div className="p-6 rounded-3xl bg-gradient-to-r from-teal-600 via-indigo-600 to-violet-700 text-white shadow-lg shadow-indigo-950/10 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-teal-200">
                          Runway Safety Thresholds
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-xs font-extrabold backdrop-blur-md">
                          {nomadSavings >= nomadTwelveMonthRunwayRequired
                            ? '12+ Months Safe'
                            : nomadSavings >= nomadSixMonthRunwayRequired
                            ? '6+ Months Viable'
                            : 'Lean Buffer'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                        <div className="p-3 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md">
                          <span className="text-teal-200 text-[10px] font-bold uppercase block">
                            6-Month Runway Target
                          </span>
                          <div className="text-lg font-black font-mono text-white mt-0.5">
                            ${nomadSixMonthRunwayRequired.toLocaleString()}
                          </div>
                          <span className="text-[11px] text-teal-100/80">
                            {nomadSavings >= nomadSixMonthRunwayRequired
                              ? '✅ Fully Funded'
                              : `+$${(nomadSixMonthRunwayRequired - nomadSavings).toLocaleString()} needed`}
                          </span>
                        </div>
                        <div className="p-3 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md">
                          <span className="text-indigo-200 text-[10px] font-bold uppercase block">
                            12-Month Runway Target
                          </span>
                          <div className="text-lg font-black font-mono text-white mt-0.5">
                            ${nomadTwelveMonthRunwayRequired.toLocaleString()}
                          </div>
                          <span className="text-[11px] text-indigo-100/80">
                            {nomadSavings >= nomadTwelveMonthRunwayRequired
                              ? '✅ Fully Funded'
                              : `+$${(nomadTwelveMonthRunwayRequired - nomadSavings).toLocaleString()} needed`}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 rounded-3xl bg-white/95 backdrop-blur-xl border border-teal-100 shadow-md space-y-4">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-extrabold text-slate-900 uppercase tracking-wider">
                          Cash Runway Depletion Bar
                        </span>
                        <span className="font-mono font-bold text-teal-800">
                          {nomadNetBurn === 0 ? 'Zero Cash Burn' : `${nomadRunwayMonths} Months of Freedom`}
                        </span>
                      </div>

                      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
                        <div
                          className="h-full bg-gradient-to-r from-teal-500 via-indigo-500 to-amber-500 rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(100, nomadNetBurn === 0 ? 100 : Math.round((nomadRunwayMonths / 24) * 100))}%`,
                          }}
                        />
                      </div>

                      <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                        <span>0 Mos</span>
                        <span>6 Mos (Standard)</span>
                        <span>12 Mos (Comfort)</span>
                        <span>24+ Mos</span>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() =>
                              openShareFireCardModal({
                                persona: 'nomad',
                                badgeTitle: nomadRunwayMonths >= 24 ? 'Runway Sovereign' : 'Coast FIRE Nomad',
                                badgeEmoji: nomadRunwayMonths >= 24 ? '👑' : '🌊',
                                yearsSaved: Math.max(1, yearsSaved || 8),
                                fireProgressPercent,
                                topCountry: nomadMatchedCountries[0]?.country.name || 'Portugal',
                                topCountryFlag: nomadMatchedCountries[0]?.country.flag,
                                topCity:
                                  nomadMatchedCountries[0]?.nomadProfile.topNomadCities?.[0] ||
                                  nomadMatchedCountries[0]?.country.capital ||
                                  'Lisbon',
                                monthlyBurnUSD: nomadMonthlyBurn,
                                domesticMonthlyBurnUSD: domesticMonthlyExpense,
                                currentNetWorthUSD: nomadSavings,
                                nomadRunwayMonths: nomadNetBurn === 0 ? 60 : nomadRunwayMonths,
                                fiberMbps: nomadMatchedCountries[0]?.nomadProfile.verifiedInternetMbps || 250,
                                headlineMode: 'nomad-runway',
                              })
                            }
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-50 via-purple-50 to-rose-50 hover:from-indigo-100 hover:via-purple-100 hover:to-rose-100 text-indigo-950 border border-indigo-200/90 text-xs font-extrabold shadow-2xs transition-all inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                          >
                            <span>🏅 Create Shareable FIRE Card</span>
                          </button>

                          <button
                            type="button"
                            onClick={handleOpenAdvancedExplorer}
                            className="text-xs font-extrabold text-teal-700 hover:text-indigo-700 inline-flex items-center gap-1.5 cursor-pointer group whitespace-nowrap"
                          >
                            <span>Explore Digital Nomad Visa Havens</span>
                            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                          </button>
                        </div>
                        <span className="text-[11px] text-slate-400">
                          Based on ${nomadMonthlyBurn.toLocaleString()}/mo short-term living
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Digital Nomad Runway & Haven Sustainability Matrix (Desktop Only) */}
                <div className="hidden md:block mt-8 mb-8">
                  <NomadHavenRunwayWidget
                    userProfile={{
                      ...userProfile,
                      finances: {
                        ...DEFAULT_FINANCIAL_PORTFOLIO,
                        ...(userProfile.finances || {}),
                      },
                    }}
                    countries={countries}
                    liquidSavingsUSD={nomadSavings}
                    onSelectCountry={cName =>
                      navigateToCountry(
                        countries.find(c => c.name.toLowerCase() === cName.toLowerCase())?.id || 'portugal'
                      )
                    }
                  />
                </div>

                {/* Live Matching Nomad & Remote Destinations */}
                <div className="relative z-10 mt-6 md:mt-10 pt-5 md:pt-8 border-t border-teal-200/70 space-y-5 md:space-y-6">
                  <div className="p-4 md:p-7 rounded-2xl md:rounded-3xl bg-gradient-to-br from-indigo-50/85 via-white to-teal-50/85 border border-teal-200/80 shadow-md space-y-4 md:space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-teal-600 via-indigo-600 to-amber-600 text-white text-[11px] font-bold uppercase tracking-wider mb-2 shadow-2xs">
                          <Zap className="w-3.5 h-3.5 text-amber-300" />
                          <span>Live Nomad-Ready Destination Matches</span>
                        </div>
                        <h2 className="text-base md:text-xl font-extrabold text-slate-900 tracking-tight">
                          <span className="md:hidden">Top 2</span>
                          <span className="hidden md:inline">Top 4</span> Hubs Matching Your $
                          {nomadMonthlyBurn.toLocaleString()}/mo Turnkey Living Burn
                        </h2>
                      </div>
                      <span className="hidden md:inline-block text-xs font-bold text-teal-900 bg-white px-3.5 py-1.5 rounded-xl border border-teal-200/80 shadow-2xs self-start sm:self-auto">
                        Ranked by verified fiber speed, coworking density &amp; visa terms
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {nomadMatchedCountries.map(({ country, nomadProfile }, idx) => {
                        const topBarColors = [
                          'from-teal-500 via-indigo-500 to-emerald-500',
                          'from-indigo-500 via-violet-500 to-purple-500',
                          'from-amber-500 via-orange-500 to-rose-500',
                          'from-emerald-500 via-teal-500 to-cyan-500',
                        ];
                        return (
                          <motion.div
                            key={country.id}
                            layout
                            whileHover={{ y: -5 }}
                            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                            onClick={() => navigateToCountry(country.id)}
                            className={`${idx >= 2 ? 'hidden md:flex' : 'flex'} group rounded-2xl bg-white border border-teal-100 hover:border-teal-300 transition-shadow cursor-pointer flex-col justify-between overflow-hidden shadow-xs hover:shadow-xl hover:shadow-teal-950/10`}
                          >
                            <div className={`h-1.5 w-full bg-gradient-to-r ${topBarColors[idx % topBarColors.length]}`} />

                            <CountryThumbnail
                              country={country}
                              className="h-32 transition-transform duration-500 group-hover:scale-105"
                              hideLandmarkLabel
                            >
                              <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5">
                                <span className="px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-md text-[10px] font-bold text-teal-200 border border-teal-500/30">
                                  {nomadProfile.verifiedInternetMbps} Mbps Fiber
                                </span>
                              </div>
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent flex items-end p-3">
                                <div className="flex items-center gap-2">
                                  <CountryFlag
                                    countryCode={country.code}
                                    countryName={country.name}
                                    fallbackEmoji={country.flag}
                                    className="w-5 h-3.5 rounded shadow-xs shrink-0"
                                  />
                                  <span className="font-extrabold text-white text-sm tracking-tight drop-shadow-sm truncate">
                                    {country.name}
                                  </span>
                                </div>
                              </div>
                            </CountryThumbnail>

                            <div className="p-4 flex-1 flex flex-col justify-between gap-3.5">
                              <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div className="p-2.5 rounded-xl bg-teal-50/70 border border-teal-200/80">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 block">
                                      Turnkey Burn
                                    </span>
                                    <span className="font-mono font-extrabold text-sm text-teal-950 tabular-nums mt-0.5 block">
                                      ${nomadProfile.monthlyNomadBurnUSD.toLocaleString()}/mo
                                    </span>
                                  </div>
                                  <div className="p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-200/80">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 block">
                                      6-Mo Runway
                                    </span>
                                    <span className="font-mono font-extrabold text-sm text-indigo-950 tabular-nums mt-0.5 block">
                                      ${(nomadProfile.sixMonthRunwayUSD / 1000).toFixed(0)}k
                                    </span>
                                  </div>
                                </div>

                                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1 text-xs">
                                  <div className="flex items-center justify-between text-[11px]">
                                    <span className="font-bold text-slate-800 truncate" title={nomadProfile.remoteWorkVisaName}>
                                      {nomadProfile.remoteWorkVisaName}
                                    </span>
                                  </div>
                                  <div className="text-[10px] text-slate-500 font-medium">
                                    {nomadProfile.remoteWorkVisaIncomeUSD > 0
                                      ? `Min. $${nomadProfile.remoteWorkVisaIncomeUSD.toLocaleString()}/mo income`
                                      : 'Liquid Solvency / Zero Monthly Mandate'}
                                  </div>
                                </div>
                              </div>

                              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                                <span className="font-semibold text-slate-600">
                                  Coworking:{' '}
                                  <strong className="text-teal-900">{nomadProfile.coworkingDensity.split(' ')[0]}</strong>
                                </span>
                                <span className="inline-flex items-center gap-0.5 font-extrabold text-teal-700 group-hover:text-indigo-700 transition-colors">
                                  <span>Nomad Dossier</span>
                                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Freedom Countdown & Advanced FIRE Conversion Banner */}
            <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-white via-amber-50/50 to-orange-50/60 text-slate-900 p-5 md:p-8 shadow-xl shadow-amber-950/5 border border-amber-200/90 flex flex-col lg:flex-row lg:items-center justify-between gap-4 md:gap-6 lg:gap-8 mt-6 md:mt-8">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 via-50% to-emerald-500" />
              <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full bg-amber-400/15 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-emerald-500/15 blur-3xl" />

              <div className="relative z-10 space-y-2.5 md:space-y-3.5 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="hidden md:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100/90 border border-amber-300/80 text-amber-950 text-xs font-bold shadow-2xs">
                    <Flame className="w-3.5 h-3.5 text-orange-600 animate-pulse" />
                    <span>Turn Your Numbers Into a Freedom Countdown</span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100/80 border border-emerald-200/80 text-emerald-900 text-[11px] font-bold">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    100% Free · No Credit Card Required
                  </span>
                </div>

                <h2 className="text-lg md:text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
                  Don&rsquo;t Just Guess Your Retirement Date—
                  <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-emerald-600 bg-clip-text text-transparent">
                    Lock In Your Exact Overseas Freedom Blueprint.
                  </span>
                </h2>

                <p className="md:hidden text-xs text-slate-600 leading-relaxed">
                  Save your FIRE numbers free and track your exact countdown across {countries.length} havens in your local currency.
                </p>

                <p className="hidden md:block text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  Still wondering how many years or months away you truly are from financial independence? Sign up free to save your portfolio numbers and let our algorithmic engine model your live FIRE trajectory across all {countries.length} destinations. We calculate your exact safe withdrawal rate, multi-asset portfolio runway, and inflation impact in your local currency — completely FREE.
                </p>

                <div className="hidden md:flex flex-wrap items-center gap-2 pt-0.5">
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

              <div className="relative z-10 flex flex-col items-stretch lg:items-end gap-2.5 md:gap-3 shrink-0 lg:min-w-[290px]">
                {isGuestUser ? (
                  <>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => openAuthModal('signup')}
                      className="min-h-[46px] px-6 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-400 hover:to-amber-500 text-slate-950 text-xs sm:text-sm font-black shadow-lg shadow-orange-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <UserPlus className="w-4 h-4 text-slate-950" />
                      <span>Sign Up Free — Track Your FIRE</span>
                      <ArrowRight className="w-4 h-4 text-slate-950" />
                    </motion.button>

                    <button
                      type="button"
                      onClick={() => openAuthModal('login')}
                      className="md:hidden min-h-[44px] px-5 py-2.5 rounded-2xl bg-white hover:bg-amber-50 text-slate-900 text-xs font-extrabold border border-amber-200 shadow-2xs transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <LogIn className="w-4 h-4 text-orange-600" />
                      <span>Already a Member? Log In</span>
                    </button>

                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleOpenAdvancedExplorer}
                      className="hidden md:flex px-5 py-3 rounded-2xl bg-slate-900 hover:bg-indigo-950 text-white text-xs sm:text-sm font-bold shadow-md shadow-slate-950/10 transition-all cursor-pointer items-center justify-center gap-2 border border-slate-800"
                    >
                      <Compass className="w-4 h-4 text-teal-300" />
                      <span>Explore All {countries.length} Havens</span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </motion.button>

                    <div className="hidden md:flex items-center justify-center lg:justify-end gap-1.5 text-[11px] text-slate-500 font-medium">
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

                <span className="hidden md:inline text-[11px] text-slate-500 text-center lg:text-right font-medium">
                  Instant portfolio simulation · 100% Free
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 2. SEO METHODOLOGY & GEO-ARBITRAGE FAQ + NEXT-STEP LINKS     */}
        {/* ============================================================ */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="rounded-3xl bg-white border border-slate-200/80 p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-indigo-700">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>FIRE Abroad Methodology &amp; FAQ</span>
                </div>
                <h2 className="text-lg md:text-2xl font-extrabold text-slate-900 tracking-tight">
                  How International Geo-Arbitrage Accelerates Financial Independence
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleOpenAdvancedExplorer}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-800 hover:text-indigo-900 text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Globe className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Explore {countries.length} Havens</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentView('compare');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-800 hover:text-indigo-900 text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Scale className="w-3.5 h-3.5 text-violet-600" />
                  <span>Compare Countries</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentView('visa-check');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-3.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-900 text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Stamp className="w-3.5 h-3.5 text-teal-700" />
                  <span>Global Visa Check</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <article className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-2">
                <h3 className="text-sm font-extrabold text-slate-900">
                  Why does geo-arbitrage cut my FIRE nest egg by 40%–65%?
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Every $1,000/month trimmed from recurring living costs reduces your 4% SWR retirement target by $300,000. Earning or investing in a strong currency while enjoying lower housing, dining, and private healthcare costs abroad compresses both your target nest egg and accumulation years.
                </p>
              </article>

              <article className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-2">
                <h3 className="text-sm font-extrabold text-slate-900">
                  Should I model 4.0% SWR or a safer 3.5% SWR abroad?
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  The classic 4.0% rule (25× annual spending) was built for 30-year horizons. Early retirees relocating in their 30s, 40s, or early 50s often stress-test at 3.25%–3.5% SWR (28.6×–30.8×) to absorb FX swings, visa renewals, and long-term inflation safely.
                </p>
              </article>

              <article className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-2">
                <h3 className="text-sm font-extrabold text-slate-900">
                  How does Nomad Runway differ from full FIRE?
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Full FIRE replaces 100% of spending from portfolio withdrawals forever. Digital Nomad Runway measures how many months your liquid cash buffer sustains short-term furnished housing and coworking burn after offsetting remote client retainers or part-time income.
                </p>
              </article>
            </div>
          </div>
        </section>
      </div>
    </MotionConfig>
  );
};
