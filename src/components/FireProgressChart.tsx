import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  DEFAULT_FINANCIAL_PORTFOLIO,
  getWorldCountryFlag,
  getCountryCurrencyMacro,
  formatLocalCurrency,
  formatDualCurrency,
} from '../data/userAccounts';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  Target,
  Flame,
  BarChart3,
  Layers,
  Award,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Globe,
  DollarSign,
  Sliders,
} from 'lucide-react';

type ChartViewMode = 'combined' | 'comparison' | 'timeline';
type HorizonYears = 10 | 15 | 20 | 25;

export const FireProgressChart: React.FC = () => {
  const { userProfile, countries, updateUserProfile } = useApp();
  const currentYear = 2026;

  const finances = useMemo(() => {
    const base = userProfile.finances || DEFAULT_FINANCIAL_PORTFOLIO;
    return {
      ...DEFAULT_FINANCIAL_PORTFOLIO,
      ...base,
      investments: {
        ...DEFAULT_FINANCIAL_PORTFOLIO.investments,
        ...(base.investments || {}),
      },
      loans: base.loans || DEFAULT_FINANCIAL_PORTFOLIO.loans || [],
      sideIncomes: base.sideIncomes || DEFAULT_FINANCIAL_PORTFOLIO.sideIncomes || [],
      futureExpenses: base.futureExpenses || DEFAULT_FINANCIAL_PORTFOLIO.futureExpenses || [],
    };
  }, [userProfile.finances]);

  const residingCountryName =
    userProfile.residingCountry || userProfile.originCountry || 'United States';
  const targetHavenCountryName = userProfile.targetCountry || 'Portugal';

  const countryMacro = useMemo(
    () => getCountryCurrencyMacro(residingCountryName),
    [residingCountryName]
  );

  const residingDossier = countries.find(
    c => c.name.toLowerCase() === residingCountryName.toLowerCase()
  );
  const targetHavenDossier = countries.find(
    c => c.name.toLowerCase() === targetHavenCountryName.toLowerCase()
  );

  // Interactive Controls
  const [viewMode, setViewMode] = useState<ChartViewMode>('combined');
  const [horizonYears, setHorizonYears] = useState<HorizonYears>(20);
  const [costBasis, setCostBasis] = useState<'residing' | 'target-haven'>('residing');
  const [includeRealEstate, setIncludeRealEstate] = useState<boolean>(
    Boolean(finances.includePrimaryHomeInFire)
  );
  const [selectedCheckpointYear, setSelectedCheckpointYear] = useState<number | null>(null);

  const handleToggleRealEstate = () => {
    const nextVal = !includeRealEstate;
    setIncludeRealEstate(nextVal);
    updateUserProfile({
      finances: {
        ...finances,
        includePrimaryHomeInFire: nextVal,
      },
    });
  };

  // Compute Current Assets vs Target Retirement Corpus & Timeline Projection
  const chartData = useMemo(() => {
    const savings = Math.round(finances.investments.savingsUSD || 0);
    const stocks = Math.round(finances.investments.stocksMutualFundsUSD || 0);
    const realEstate = Math.round(finances.investments.realEstateUSD || 0);
    const gold = Math.round(finances.investments.goldUSD || 0);
    const others = Math.round(finances.investments.othersUSD || 0);

    const liquidAssetsUSD = savings + stocks + gold + others;
    const grossAssetsUSD = liquidAssetsUSD + realEstate;

    const loansList = finances.loans || [];
    const totalLoansUSD = Math.round(
      loansList.reduce((sum, l) => sum + (l.outstandingPrincipalUSD || 0), 0)
    );
    const totalMonthlyEmiUSD = Math.round(
      loansList.reduce((sum, l) => sum + (l.monthlyEmiUSD || 0), 0)
    );

    const currentNetCorpusUSD = Math.max(
      0,
      (includeRealEstate ? grossAssetsUSD : liquidAssetsUSD) - totalLoansUSD
    );

    const currentAge = finances.currentAge || 42;
    const targetFireAge = finances.targetFireAge || 50;
    const monthlySipUSD = Math.round(finances.monthlySipUSD ?? 2500);
    const sipStepUpPct = finances.annualSipStepUpPercent ?? 8;
    const expectedReturnPct =
      finances.expectedReturnRatePercent ?? countryMacro.defaultReturnPercent;
    const inflationPct =
      finances.inflationRatePercent ?? countryMacro.defaultInflationPercent;
    const swrPct = 4.0;
    const swrDecimal = swrPct / 100;

    // Passive side income continuing in retirement
    const passiveRetirementMonthlyUSD = (finances.sideIncomes || [])
      .filter(s => s.continuesInRetirement)
      .reduce((sum, s) => sum + (s.monthlyAmountUSD || 0), 0);

    const residingMonthlyExpenseUSD =
      finances.monthlyCurrentExpensesUSD ??
      residingDossier?.costOfLiving.monthlyBudgetCoupleUSD ??
      3200;

    const targetHavenMonthlyExpenseUSD =
      targetHavenDossier?.costOfLiving.monthlyBudgetCoupleUSD ?? 2400;

    const activeMonthlyExpenseUSD =
      costBasis === 'residing' ? residingMonthlyExpenseUSD : targetHavenMonthlyExpenseUSD;

    const netMonthlyWithdrawalNeedUSD = Math.max(
      300,
      activeMonthlyExpenseUSD - passiveRetirementMonthlyUSD
    );
    const netTargetHavenWithdrawalNeedUSD = Math.max(
      300,
      targetHavenMonthlyExpenseUSD - passiveRetirementMonthlyUSD
    );

    // Target Corpus Calculations (Today's Purchasing Power)
    const leanFireCorpusTodayUSD = Math.round(
      (Math.max(300, activeMonthlyExpenseUSD * 0.8 - passiveRetirementMonthlyUSD) * 12) /
        swrDecimal
    );
    const standardFireCorpusTodayUSD = Math.round(
      (netMonthlyWithdrawalNeedUSD * 12) / swrDecimal
    );
    const fatFireCorpusTodayUSD = Math.round(
      (Math.max(300, activeMonthlyExpenseUSD * 1.35 - passiveRetirementMonthlyUSD) * 12) /
        swrDecimal
    );
    const targetHavenFireCorpusTodayUSD = Math.round(
      (netTargetHavenWithdrawalNeedUSD * 12) / swrDecimal
    );

    // Future Milestone Expenses (Education, Marriage, Healthcare/Insurance, etc.)
    const inflationDec = inflationPct / 100;
    const nominalReturnDec = expectedReturnPct / 100;
    const realReturnDec = (1 + nominalReturnDec) / (1 + inflationDec) - 1;

    const enrichedGoals = (finances.futureExpenses || []).map(g => {
      const yearsAway = Math.max(0, g.targetYear - currentYear);
      const inflatedCostUSD = Math.round(
        g.estimatedCostTodayUSD * Math.pow(1 + inflationDec, yearsAway)
      );
      return {
        ...g,
        yearsAway,
        inflatedCostUSD,
      };
    });

    const futureGoalsPresentValueUSD = enrichedGoals.reduce(
      (sum, g) => sum + g.estimatedCostTodayUSD,
      0
    );

    const targetRetirementCorpusTodayUSD =
      standardFireCorpusTodayUSD + futureGoalsPresentValueUSD;
    const targetHavenTotalCorpusTodayUSD =
      targetHavenFireCorpusTodayUSD + futureGoalsPresentValueUSD;

    const yearsToTargetAge = Math.max(1, targetFireAge - currentAge);
    const coastFireCorpusTodayUSD = Math.round(
      targetRetirementCorpusTodayUSD /
        Math.pow(1 + Math.max(0.01, realReturnDec), yearsToTargetAge)
    );

    const progressPercent = Math.min(
      150,
      Math.max(
        0,
        Math.round((currentNetCorpusUSD / Math.max(1, targetRetirementCorpusTodayUSD)) * 100)
      )
    );

    const corpusGapTodayUSD = Math.max(
      0,
      targetRetirementCorpusTodayUSD - currentNetCorpusUSD
    );
    const corpusSurplusTodayUSD = Math.max(
      0,
      currentNetCorpusUSD - targetRetirementCorpusTodayUSD
    );

    // 1. Comparison Bar Chart Data: Current Assets vs Target Retirement Corpus Benchmarks
    const comparisonBars = [
      {
        id: 'liquid-assets',
        name: 'Liquid Assets Today',
        shortLabel: 'Liquid Assets',
        amountUSD: liquidAssetsUSD,
        category: 'Current Assets',
        fill: '#0284c7',
        description: 'Savings + Stocks/MFs + Gold + Other Liquid Schemes',
      },
      {
        id: 'current-net-corpus',
        name: 'Current Net FIRE Assets',
        shortLabel: 'Current Net Assets',
        amountUSD: currentNetCorpusUSD,
        category: 'Current Assets',
        fill: '#0d9488',
        description: includeRealEstate
          ? 'Gross 5-Scheme Assets minus Active Loan Principal'
          : 'Liquid Assets minus Active Loan Principal (Excl. Home)',
      },
      {
        id: 'coast-fire',
        name: `Coast FIRE Benchmark (Age ${targetFireAge})`,
        shortLabel: 'Coast FIRE Goal',
        amountUSD: coastFireCorpusTodayUSD,
        category: 'Target Benchmark',
        fill: '#6366f1',
        description: 'Assets needed today for compounding alone to hit target by retirement age',
      },
      {
        id: 'lean-fire',
        name: 'Lean FIRE Target (80% Lifestyle)',
        shortLabel: 'Lean FIRE',
        amountUSD: leanFireCorpusTodayUSD + futureGoalsPresentValueUSD,
        category: 'Target Benchmark',
        fill: '#8b5cf6',
        description: 'Essential retirement living corpus + future family milestones',
      },
      {
        id: 'target-corpus',
        name: `Target Retirement Corpus (${costBasis === 'residing' ? residingCountryName : targetHavenCountryName})`,
        shortLabel: 'Target Corpus',
        amountUSD: targetRetirementCorpusTodayUSD,
        category: 'Primary Goal',
        fill: '#ea580c',
        description: `25x annual expenses (${swrPct}% SWR) + ${enrichedGoals.length} future milestones`,
      },
      {
        id: 'fat-fire',
        name: 'Fat FIRE Target (135% Luxury)',
        shortLabel: 'Fat FIRE',
        amountUSD: fatFireCorpusTodayUSD + futureGoalsPresentValueUSD,
        category: 'Target Benchmark',
        fill: '#d97706',
        description: 'Abundant luxury retirement buffer + all milestone goals',
      },
    ];

    // 2. Timeline-Based Growth Projection (25-Year Year-by-Year Simulation)
    const timeline: {
      year: number;
      age: number;
      yearLabel: string;
      projectedAssetsUSD: number;
      targetCorpusUSD: number;
      targetHavenCorpusUSD: number;
      cumulativeContributionsUSD: number;
      compoundingGainsUSD: number;
      annualSipUSD: number;
      milestonesOutflowUSD: number;
      fundingRatioPct: number;
      gapOrSurplusUSD: number;
    }[] = [];

    let simCorpus = currentNetCorpusUSD;
    let cumulativeContributions = currentNetCorpusUSD;
    let simMonthlySip = monthlySipUSD;
    let crossoverYear: number | null =
      currentNetCorpusUSD >= targetRetirementCorpusTodayUSD ? currentYear : null;
    let crossoverAge: number | null =
      currentNetCorpusUSD >= targetRetirementCorpusTodayUSD ? currentAge : null;
    let yearsToFireExact =
      currentNetCorpusUSD >= targetRetirementCorpusTodayUSD ? 0 : -1;

    for (let yrOffset = 0; yrOffset <= 25; yrOffset++) {
      const yr = currentYear + yrOffset;
      const age = currentAge + yrOffset;

      const inflatedAnnualNeed =
        netMonthlyWithdrawalNeedUSD * 12 * Math.pow(1 + inflationDec, yrOffset);
      const inflatedHavenAnnualNeed =
        netTargetHavenWithdrawalNeedUSD * 12 * Math.pow(1 + inflationDec, yrOffset);

      const remainingGoalsUSD = enrichedGoals
        .filter(g => g.targetYear > yr)
        .reduce((sum, g) => sum + g.inflatedCostUSD, 0);

      const dynamicTargetCorpusUSD = Math.round(
        inflatedAnnualNeed / swrDecimal + remainingGoalsUSD
      );
      const dynamicHavenCorpusUSD = Math.round(
        inflatedHavenAnnualNeed / swrDecimal + remainingGoalsUSD
      );

      const yearMilestonesUSD = enrichedGoals
        .filter(g => g.targetYear === yr)
        .reduce((sum, g) => sum + g.inflatedCostUSD, 0);

      const freedEmiMonthlyUSD = loansList
        .filter(l => yrOffset >= l.remainingYears)
        .reduce((sum, l) => sum + (l.monthlyEmiUSD || 0), 0);

      const annualContributionUSD = Math.round(
        (simMonthlySip + freedEmiMonthlyUSD) * 12
      );

      if (yrOffset > 0) {
        const prevCorpus = simCorpus;
        simCorpus = Math.max(
          0,
          Math.round(
            prevCorpus * (1 + nominalReturnDec) +
              annualContributionUSD -
              yearMilestonesUSD
          )
        );
        cumulativeContributions = Math.max(
          0,
          Math.round(
            cumulativeContributions + annualContributionUSD - yearMilestonesUSD
          )
        );

        if (crossoverYear === null && simCorpus >= dynamicTargetCorpusUSD) {
          crossoverYear = yr;
          crossoverAge = age;
          const prevGap = Math.max(0, dynamicTargetCorpusUSD - prevCorpus);
          const yearGain = Math.max(1, simCorpus - prevCorpus);
          const fraction = Math.min(1, prevGap / yearGain);
          yearsToFireExact = Math.round((yrOffset - 1 + fraction) * 10) / 10;
        }

        simMonthlySip = simMonthlySip * (1 + sipStepUpPct / 100);
      } else {
        simCorpus = Math.max(0, simCorpus - yearMilestonesUSD);
        cumulativeContributions = Math.max(
          0,
          cumulativeContributions - yearMilestonesUSD
        );
        if (simCorpus >= dynamicTargetCorpusUSD) {
          crossoverYear = yr;
          crossoverAge = age;
          yearsToFireExact = 0;
        }
      }

      const compoundingGainsUSD = Math.max(
        0,
        simCorpus - cumulativeContributions
      );
      const fundingRatioPct = Math.min(
        250,
        Math.round((simCorpus / Math.max(1, dynamicTargetCorpusUSD)) * 100)
      );

      timeline.push({
        year: yr,
        age,
        yearLabel: `${yr} (Age ${age})`,
        projectedAssetsUSD: simCorpus,
        targetCorpusUSD: dynamicTargetCorpusUSD,
        targetHavenCorpusUSD: dynamicHavenCorpusUSD,
        cumulativeContributionsUSD: cumulativeContributions,
        compoundingGainsUSD,
        annualSipUSD: yrOffset === 0 ? monthlySipUSD * 12 : annualContributionUSD,
        milestonesOutflowUSD: yearMilestonesUSD,
        fundingRatioPct,
        gapOrSurplusUSD: simCorpus - dynamicTargetCorpusUSD,
      });
    }

    if (yearsToFireExact < 0) {
      yearsToFireExact = 25.5;
    }

    return {
      savings,
      stocks,
      realEstate,
      gold,
      others,
      liquidAssetsUSD,
      grossAssetsUSD,
      totalLoansUSD,
      totalMonthlyEmiUSD,
      currentNetCorpusUSD,
      currentAge,
      targetFireAge,
      monthlySipUSD,
      sipStepUpPct,
      expectedReturnPct,
      inflationPct,
      leanFireCorpusTodayUSD,
      standardFireCorpusTodayUSD,
      fatFireCorpusTodayUSD,
      coastFireCorpusTodayUSD,
      futureGoalsPresentValueUSD,
      targetRetirementCorpusTodayUSD,
      targetHavenTotalCorpusTodayUSD,
      progressPercent,
      corpusGapTodayUSD,
      corpusSurplusTodayUSD,
      comparisonBars,
      timeline,
      crossoverYear,
      crossoverAge,
      yearsToFireExact,
    };
  }, [
    finances,
    countryMacro,
    residingDossier,
    targetHavenDossier,
    costBasis,
    includeRealEstate,
  ]);

  const visibleTimeline = useMemo(
    () => chartData.timeline.slice(0, horizonYears + 1),
    [chartData.timeline, horizonYears]
  );

  // Key milestone checkpoints for quick inspection
  const checkpointNodes = useMemo(() => {
    const todayNode = chartData.timeline[0];
    const fiveYrNode = chartData.timeline[Math.min(5, chartData.timeline.length - 1)];
    const crossoverNode =
      chartData.timeline.find(t => t.year === chartData.crossoverYear) ||
      chartData.timeline[Math.min(10, chartData.timeline.length - 1)];
    const horizonEndNode =
      chartData.timeline[Math.min(horizonYears, chartData.timeline.length - 1)];

    return [
      { label: 'Today (Starting Baseline)', badge: 'Current State', data: todayNode },
      { label: '5-Year Compounding Mark', badge: '+5 Years', data: fiveYrNode },
      {
        label: chartData.crossoverYear
          ? `FIRE Crossover (${chartData.crossoverYear})`
          : '10-Year Projection',
        badge: chartData.crossoverYear ? 'FI Achieved' : '+10 Years',
        data: crossoverNode,
      },
      {
        label: `${horizonYears}-Year Horizon (${horizonEndNode.year})`,
        badge: `Age ${horizonEndNode.age}`,
        data: horizonEndNode,
      },
    ];
  }, [chartData.timeline, chartData.crossoverYear, horizonYears]);

  const activeInspectionNode = useMemo(() => {
    if (selectedCheckpointYear !== null) {
      const found = chartData.timeline.find(t => t.year === selectedCheckpointYear);
      if (found) return found;
    }
    return (
      chartData.timeline.find(t => t.year === chartData.crossoverYear) ||
      chartData.timeline[0]
    );
  }, [selectedCheckpointYear, chartData.timeline, chartData.crossoverYear]);

  const formatAxisValue = (val: number) => {
    if (val >= 1_000_000) {
      return `$${(val / 1_000_000).toFixed(1)}M`;
    }
    if (val >= 1_000) {
      return `$${Math.round(val / 1_000)}k`;
    }
    return `$${val}`;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
      {/* Top Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-600 via-emerald-600 to-orange-600 text-white flex items-center justify-center shadow-xs">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
              FIRE Progress & Retirement Corpus Trajectory
            </h2>
            <span className="text-xs font-mono font-bold text-teal-800">
              · {chartData.progressPercent}% Funded Today
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Visual comparison of your current investable assets against target retirement corpus benchmarks and a {horizonYears}-year compounding timeline in{' '}
            <strong className="text-slate-700">
              {getWorldCountryFlag(residingCountryName)} {residingCountryName} ({countryMacro.currencyCode})
            </strong>{' '}
            &amp; USD.
          </p>
        </div>

        {/* Interactive View Switcher & Cost Basis Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Segmented Control */}
          <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setViewMode('combined')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'combined'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Split View
            </button>
            <button
              type="button"
              onClick={() => setViewMode('comparison')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'comparison'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Assets vs. Target
            </button>
            <button
              type="button"
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'timeline'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Growth Timeline
            </button>
          </div>

          {/* Cost Basis Switcher */}
          <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setCostBasis('residing')}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                costBasis === 'residing'
                  ? 'bg-slate-900 text-white font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {getWorldCountryFlag(residingCountryName)} Residing Goal
            </button>
            <button
              type="button"
              onClick={() => setCostBasis('target-haven')}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                costBasis === 'target-haven'
                  ? 'bg-orange-600 text-white font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {getWorldCountryFlag(targetHavenCountryName)} {targetHavenCountryName} Haven
            </button>
          </div>
        </div>
      </div>

      {/* Progress Gauge Bar & Top Summary Strip */}
      <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/90 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Metric 1: Current Net Assets */}
          <div className="p-4 rounded-xl bg-white border border-slate-200/80">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
              <span>Current Net FIRE Assets</span>
              <DollarSign className="w-4 h-4 text-teal-600" />
            </div>
            <p className="text-lg font-extrabold font-mono text-slate-900 mt-1">
              {formatDualCurrency(chartData.currentNetCorpusUSD, countryMacro, true)}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Liquid: {formatDualCurrency(chartData.liquidAssetsUSD, countryMacro, true)} · Loans: -{formatDualCurrency(chartData.totalLoansUSD, countryMacro, true)}
            </p>
          </div>

          {/* Metric 2: Target Retirement Corpus */}
          <div className="p-4 rounded-xl bg-white border border-slate-200/80">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
              <span>Target Retirement Corpus</span>
              <Target className="w-4 h-4 text-orange-600" />
            </div>
            <p className="text-lg font-extrabold font-mono text-orange-950 mt-1">
              {formatDualCurrency(chartData.targetRetirementCorpusTodayUSD, countryMacro, true)}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Living Corpus: {formatDualCurrency(chartData.standardFireCorpusTodayUSD, countryMacro, true)} + Goals: {formatDualCurrency(chartData.futureGoalsPresentValueUSD, countryMacro, true)}
            </p>
          </div>

          {/* Metric 3: Corpus Gap / Surplus */}
          <div className="p-4 rounded-xl bg-white border border-slate-200/80">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
              <span>
                {chartData.corpusGapTodayUSD > 0
                  ? 'Remaining Corpus Gap'
                  : 'Retirement Corpus Surplus'}
              </span>
              <Flame
                className={`w-4 h-4 ${
                  chartData.corpusGapTodayUSD > 0 ? 'text-amber-600' : 'text-emerald-600'
                }`}
              />
            </div>
            <p
              className={`text-lg font-extrabold font-mono mt-1 ${
                chartData.corpusGapTodayUSD > 0 ? 'text-amber-900' : 'text-emerald-800'
              }`}
            >
              {chartData.corpusGapTodayUSD > 0
                ? formatDualCurrency(chartData.corpusGapTodayUSD, countryMacro, true)
                : `+${formatDualCurrency(chartData.corpusSurplusTodayUSD, countryMacro, true)}`}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              {chartData.currentNetCorpusUSD >= chartData.coastFireCorpusTodayUSD
                ? `Coast FIRE passed (${formatDualCurrency(chartData.coastFireCorpusTodayUSD, countryMacro, true)})`
                : `${formatDualCurrency(Math.max(0, chartData.coastFireCorpusTodayUSD - chartData.currentNetCorpusUSD), countryMacro, true)} to Coast FIRE`}
            </p>
          </div>

          {/* Metric 4: Projected FIRE Crossover */}
          <div className="p-4 rounded-xl bg-white border border-slate-200/80">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
              <span>Projected FIRE Crossover</span>
              <Clock className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-lg font-extrabold font-mono text-purple-950 mt-1">
              {chartData.yearsToFireExact === 0
                ? `Achieved (${currentYear})`
                : chartData.crossoverYear
                ? `Year ${chartData.crossoverYear} (Age ${chartData.crossoverAge})`
                : '25+ Years'}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              {chartData.yearsToFireExact === 0
                ? 'Assets exceed target retirement corpus'
                : `~${chartData.yearsToFireExact} yrs at ${chartData.expectedReturnPct}% return & ${formatDualCurrency(chartData.monthlySipUSD, countryMacro, true)}/mo SIP`}
            </p>
          </div>
        </div>

        {/* Visual Progress Bar with Milestone Markers */}
        <div className="space-y-1.5 pt-1">
          <div className="flex flex-wrap items-center justify-between text-xs">
            <span className="font-bold text-slate-800">
              Overall Financial Independence Progress:{' '}
              <span className="font-mono text-teal-800">{chartData.progressPercent}%</span> of Target Corpus Accumulated
            </span>
            <div className="flex items-center gap-4 text-[11px] text-slate-600">
              <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeRealEstate}
                  onChange={handleToggleRealEstate}
                  className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                <span className="font-medium">
                  Include Real Estate Equity ({formatDualCurrency(chartData.realEstate, countryMacro, true)})
                </span>
              </label>
              <span aria-hidden="true">·</span>
              <div className="inline-flex items-center gap-1">
                <span className="text-slate-500">Horizon:</span>
                {([10, 15, 20, 25] as HorizonYears[]).map(yr => (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => setHorizonYears(yr)}
                    className={`px-2 py-0.5 rounded font-mono text-[11px] cursor-pointer transition-colors ${
                      horizonYears === yr
                        ? 'bg-slate-900 text-white font-bold'
                        : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {yr}Y
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="h-3.5 w-full rounded-full bg-slate-200/90 overflow-hidden relative">
            <div
              className="h-full rounded-full bg-gradient-to-r from-teal-600 via-emerald-500 to-orange-500 transition-all duration-500"
              style={{ width: `${Math.min(100, chartData.progressPercent)}%` }}
            />
          </div>

          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>$0 (0%)</span>
            <span>
              Coast FIRE:{' '}
              {Math.min(
                100,
                Math.round(
                  (chartData.coastFireCorpusTodayUSD /
                    Math.max(1, chartData.targetRetirementCorpusTodayUSD)) *
                    100
                )
              )}
              %
            </span>
            <span>
              Lean FIRE:{' '}
              {Math.min(
                100,
                Math.round(
                  ((chartData.leanFireCorpusTodayUSD + chartData.futureGoalsPresentValueUSD) /
                    Math.max(1, chartData.targetRetirementCorpusTodayUSD)) *
                    100
                )
              )}
              %
            </span>
            <span className="font-bold text-orange-800">
              100% Target ({formatDualCurrency(chartData.targetRetirementCorpusTodayUSD, countryMacro, true)})
            </span>
          </div>
        </div>
      </div>

      {/* MAIN RECHARTS VISUALIZATION GRID */}
      <div
        className={`grid grid-cols-1 ${
          viewMode === 'combined' ? 'xl:grid-cols-12' : 'grid-cols-1'
        } gap-6`}
      >
        {/* CHART 1: CURRENT ASSETS VS. TARGET RETIREMENT CORPUS BENCHMARKS */}
        {(viewMode === 'combined' || viewMode === 'comparison') && (
          <div
            className={`${
              viewMode === 'combined' ? 'xl:col-span-5' : 'w-full'
            } p-5 rounded-2xl border border-slate-200 bg-white flex flex-col justify-between space-y-4`}
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-teal-600" />
                  <span>Current Assets vs. Target Retirement Corpus</span>
                </h3>
                <span className="text-[11px] font-mono text-slate-500">
                  Today&apos;s Value ({currentYear})
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Direct benchmark comparison between your current liquid &amp; net investable assets and each retirement corpus tier.
              </p>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData.comparisonBars}
                  layout="vertical"
                  margin={{ top: 8, right: 24, left: 12, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickFormatter={formatAxisValue}
                  />
                  <YAxis
                    type="category"
                    dataKey="shortLabel"
                    width={118}
                    tick={{ fontSize: 11, fill: '#1e293b', fontWeight: 600 }}
                  />
                  <Tooltip
                    formatter={((value: any, _name: any, props: any) => [
                      formatDualCurrency(Number(value), countryMacro, true),
                      props?.payload?.name || 'Amount',
                    ]) as any}
                    contentStyle={{
                      borderRadius: '12px',
                      fontSize: '12px',
                      borderColor: '#cbd5e1',
                      boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
                    }}
                  />
                  <ReferenceLine
                    x={chartData.currentNetCorpusUSD}
                    stroke="#0d9488"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                  />
                  <Bar dataKey="amountUSD" radius={[0, 8, 8, 0]} barSize={24}>
                    {chartData.comparisonBars.map(entry => (
                      <Cell key={entry.id} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* 5-Scheme Current Asset Composition Strip */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
                <span>Current 5-Scheme Gross Asset Composition</span>
                <span className="font-mono text-slate-900">
                  {formatDualCurrency(chartData.grossAssetsUSD, countryMacro, true)}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px]">
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/70">
                  <span className="text-slate-500 block">Savings</span>
                  <span className="font-mono font-bold text-slate-900">
                    ${Math.round(chartData.savings / 1000)}k
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/70">
                  <span className="text-slate-500 block">Stocks/MF</span>
                  <span className="font-mono font-bold text-emerald-800">
                    ${Math.round(chartData.stocks / 1000)}k
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/70">
                  <span className="text-slate-500 block">Real Estate</span>
                  <span className="font-mono font-bold text-indigo-800">
                    ${Math.round(chartData.realEstate / 1000)}k
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/70">
                  <span className="text-slate-500 block">Gold</span>
                  <span className="font-mono font-bold text-amber-800">
                    ${Math.round(chartData.gold / 1000)}k
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/70">
                  <span className="text-slate-500 block">Others</span>
                  <span className="font-mono font-bold text-purple-800">
                    ${Math.round(chartData.others / 1000)}k
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CHART 2: TIMELINE-BASED GROWTH PROJECTION & TARGET CROSSOVER */}
        {(viewMode === 'combined' || viewMode === 'timeline') && (
          <div
            className={`${
              viewMode === 'combined' ? 'xl:col-span-7' : 'w-full'
            } p-5 rounded-2xl border border-slate-200 bg-white flex flex-col justify-between space-y-4`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-orange-600" />
                  <span>
                    {horizonYears}-Year Timeline Growth Projection ({currentYear}–
                    {currentYear + horizonYears})
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Tracks projected portfolio growth ({chartData.expectedReturnPct}%/yr return +{' '}
                  {chartData.sipStepUpPct}%/yr SIP step-up) vs. inflation-adjusted retirement corpus ({chartData.inflationPct}%/yr inflation).
                </p>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold shrink-0">
                <span className="flex items-center gap-1.5 text-teal-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-600 inline-block" />
                  Projected Assets
                </span>
                <span className="flex items-center gap-1.5 text-sky-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block" />
                  Principal + SIPs
                </span>
                <span className="flex items-center gap-1.5 text-orange-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" />
                  Target Corpus
                </span>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={visibleTimeline}
                  margin={{ top: 12, right: 20, left: 8, bottom: 4 }}
                  onClick={(state: any) => {
                    if (state && state.activeLabel) {
                      setSelectedCheckpointYear(Number(state.activeLabel));
                    }
                  }}
                >
                  <defs>
                    <linearGradient id="fireProgressAssetsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0d9488" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#0d9488" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="fireProgressContribGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0284c7" stopOpacity={0.22} />
                      <stop offset="95%" stopColor="#0284c7" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="year"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickFormatter={yr =>
                      `${yr} (Age ${chartData.currentAge + (Number(yr) - currentYear)})`
                    }
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickFormatter={formatAxisValue}
                  />
                  <Tooltip
                    formatter={((value: any, name: any) => {
                      const labelMap: Record<string, string> = {
                        projectedAssetsUSD: 'Projected Net Assets',
                        cumulativeContributionsUSD: 'Cumulative Principal + SIPs',
                        targetCorpusUSD: `Inflation-Adj Target Corpus (${
                          costBasis === 'residing' ? residingCountryName : targetHavenCountryName
                        })`,
                        targetHavenCorpusUSD: `Target Haven Corpus (${targetHavenCountryName})`,
                      };
                      return [
                        formatDualCurrency(Number(value), countryMacro, true),
                        labelMap[name] || name,
                      ];
                    }) as any}
                    labelFormatter={yr =>
                      `Year ${yr} · Age ${
                        chartData.currentAge + (Number(yr) - currentYear)
                      }`
                    }
                    contentStyle={{
                      borderRadius: '12px',
                      fontSize: '12px',
                      borderColor: '#cbd5e1',
                      boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
                    }}
                  />
                  {chartData.crossoverYear &&
                    chartData.crossoverYear <= currentYear + horizonYears && (
                      <ReferenceLine
                        x={chartData.crossoverYear}
                        stroke="#10b981"
                        strokeDasharray="4 4"
                        strokeWidth={2}
                        label={{
                          value: `FIRE in ${chartData.crossoverYear} (Age ${chartData.crossoverAge})`,
                          position: 'top',
                          fill: '#047857',
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      />
                    )}
                  <Area
                    type="monotone"
                    dataKey="projectedAssetsUSD"
                    stroke="#0d9488"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#fireProgressAssetsGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="cumulativeContributionsUSD"
                    stroke="#0284c7"
                    strokeWidth={1.75}
                    strokeDasharray="3 3"
                    fillOpacity={1}
                    fill="url(#fireProgressContribGrad)"
                  />
                  <Line
                    type="monotone"
                    dataKey="targetCorpusUSD"
                    stroke="#ea580c"
                    strokeWidth={2.25}
                    strokeDasharray="6 3"
                    dot={false}
                  />
                  {costBasis === 'residing' &&
                    residingCountryName.toLowerCase() !==
                      targetHavenCountryName.toLowerCase() && (
                      <Line
                        type="monotone"
                        dataKey="targetHavenCorpusUSD"
                        stroke="#9333ea"
                        strokeWidth={1.5}
                        strokeDasharray="2 3"
                        dot={false}
                      />
                    )}
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Interactive Year Inspection Bar */}
            {activeInspectionNode && (
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-teal-600 shrink-0" />
                  <span className="font-bold text-slate-800">
                    Snapshot {activeInspectionNode.year} (Age {activeInspectionNode.age}):
                  </span>
                  <span className="text-slate-600">
                    Assets{' '}
                    <strong className="font-mono text-teal-800">
                      {formatDualCurrency(activeInspectionNode.projectedAssetsUSD, countryMacro, true)}
                    </strong>{' '}
                    vs. Target{' '}
                    <strong className="font-mono text-orange-800">
                      {formatDualCurrency(activeInspectionNode.targetCorpusUSD, countryMacro, true)}
                    </strong>
                  </span>
                </div>
                <span className="font-mono font-bold text-slate-700">
                  Compounding Gains:{' '}
                  <span className="text-emerald-700">
                    +{formatDualCurrency(activeInspectionNode.compoundingGainsUSD, countryMacro, true)}
                  </span>{' '}
                  · {activeInspectionNode.fundingRatioPct}% Funded
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Timeline Checkpoint Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
        {checkpointNodes.map((cp, idx) => {
          const isSelected = activeInspectionNode?.year === cp.data.year;
          const isFunded = cp.data.projectedAssetsUSD >= cp.data.targetCorpusUSD;
          return (
            <button
              key={`${cp.label}-${idx}`}
              type="button"
              onClick={() => setSelectedCheckpointYear(cp.data.year)}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'border-teal-500 bg-teal-50/40 shadow-2xs'
                  : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500 font-semibold">
                <span className="truncate">{cp.label}</span>
                <span
                  className={`font-mono font-bold ${
                    isFunded ? 'text-emerald-700' : 'text-orange-700'
                  }`}
                >
                  {cp.data.fundingRatioPct}%
                </span>
              </div>
              <div className="mt-1.5 flex items-baseline justify-between gap-2">
                <span className="text-xs font-extrabold font-mono text-slate-900">
                  {formatDualCurrency(cp.data.projectedAssetsUSD, countryMacro, true)}
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  Goal: ${Math.round(cp.data.targetCorpusUSD / 1000)}k
                </span>
              </div>
              <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    isFunded ? 'bg-emerald-600' : 'bg-teal-600'
                  }`}
                  style={{ width: `${Math.min(100, cp.data.fundingRatioPct)}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
