import React, { useState, useMemo } from 'react';
import {
  CountryCurrencyMacro,
  formatDualCurrency,
} from '../data/userAccounts';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  Award,
  BarChart3,
  Layers,
} from 'lucide-react';

export interface FireTrajectoryPoint {
  year: number;
  age: number;
  projectedCorpusUSD: number;
  cumulativeContributionsUSD: number;
  compoundingGainsUSD: number;
  fireTargetUSD: number;
  targetHavenCorpusUSD: number;
  milestonesDeductedUSD: number;
  annualSipInvestedUSD: number;
  freedEmiBonusUSD: number;
  fundingRatioPct: number;
  cumulativeSipPrincipalUSD?: number;
  sipPortfolioValueUSD?: number;
  sipReturnsUSD?: number;
  isSipActiveInYear?: boolean;
}

export interface FireProgressChartProps {
  currentYear: number;
  currentAge: number;
  targetFireAge: number;
  selectedBasisCountry: string;
  targetHavenCountryName: string;
  costBasisMode: 'residing' | 'target-haven';
  countryMacro: CountryCurrencyMacro;
  expectedReturnPct: number;
  inflationPct: number;
  sipStepUpPct: number;
  investments: {
    savingsUSD: number;
    stocksMutualFundsUSD: number;
    realEstateUSD: number;
    goldUSD: number;
    othersUSD: number;
  };
  liquidAssetsUSD: number;
  totalGrossAssetsUSD: number;
  startingCorpusTodayUSD: number;
  coastFireTargetTodayUSD: number;
  leanFireTargetTodayUSD: number;
  standardFireTargetTodayUSD: number;
  fatFireTargetTodayUSD: number;
  comprehensiveFireNumberTodayUSD: number;
  totalFutureGoalsTodayUSD: number;
  crossoverYear: number | null;
  crossoverAge: number | null;
  trajectory: FireTrajectoryPoint[];
}

type ChartViewMode = 'combined' | 'comparison' | 'timeline';
type HorizonYears = 10 | 15 | 20 | 25;

export const FireProgressChart: React.FC<FireProgressChartProps> = ({
  currentYear,
  currentAge,
  targetFireAge,
  selectedBasisCountry,
  targetHavenCountryName,
  costBasisMode,
  countryMacro,
  expectedReturnPct,
  inflationPct,
  sipStepUpPct,
  investments,
  liquidAssetsUSD,
  totalGrossAssetsUSD,
  startingCorpusTodayUSD,
  coastFireTargetTodayUSD,
  leanFireTargetTodayUSD,
  fatFireTargetTodayUSD,
  comprehensiveFireNumberTodayUSD,
  totalFutureGoalsTodayUSD,
  crossoverYear,
  crossoverAge,
  trajectory,
}) => {
  const [viewMode, setViewMode] = useState<ChartViewMode>('combined');
  const [horizonYears, setHorizonYears] = useState<HorizonYears>(20);
  const [selectedCheckpointYear, setSelectedCheckpointYear] = useState<number | null>(null);

  // Comparison Bars for Chart 1 (Current Assets vs. Target Retirement Corpus Benchmarks)
  const comparisonBars = useMemo(() => {
    return [
      {
        id: 'liquid',
        name: 'Liquid Assets Today',
        shortLabel: 'Liquid Assets',
        amountUSD: liquidAssetsUSD,
        fill: '#0284c7', // sky-600
      },
      {
        id: 'net-fire',
        name: 'Current Net FIRE Corpus',
        shortLabel: 'Net FIRE Corpus',
        amountUSD: startingCorpusTodayUSD,
        fill: '#0d9488', // teal-600
      },
      {
        id: 'coast-fire',
        name: `Coast FIRE (Age ${targetFireAge})`,
        shortLabel: 'Coast FIRE',
        amountUSD: coastFireTargetTodayUSD,
        fill: '#6366f1', // indigo-500
      },
      {
        id: 'lean-fire',
        name: 'Lean FIRE Target (80%)',
        shortLabel: 'Lean FIRE',
        amountUSD: leanFireTargetTodayUSD + totalFutureGoalsTodayUSD,
        fill: '#f59e0b', // amber-500
      },
      {
        id: 'target-fire',
        name: 'Target Retirement Corpus',
        shortLabel: 'Target Corpus',
        amountUSD: comprehensiveFireNumberTodayUSD,
        fill: '#ea580c', // orange-600
      },
      {
        id: 'fat-fire',
        name: 'Fat FIRE Target (135%)',
        shortLabel: 'Fat FIRE',
        amountUSD: fatFireTargetTodayUSD + totalFutureGoalsTodayUSD,
        fill: '#9333ea', // purple-600
      },
    ];
  }, [
    liquidAssetsUSD,
    startingCorpusTodayUSD,
    targetFireAge,
    coastFireTargetTodayUSD,
    leanFireTargetTodayUSD,
    totalFutureGoalsTodayUSD,
    comprehensiveFireNumberTodayUSD,
    fatFireTargetTodayUSD,
  ]);

  const visibleTimeline = useMemo(
    () => trajectory.slice(0, horizonYears + 1),
    [trajectory, horizonYears]
  );

  // Key milestone checkpoints along the timeline
  const checkpointNodes = useMemo(() => {
    const t = visibleTimeline;
    if (!t.length) return [];
    const yr0 = t[0];
    const yr5 = t[Math.min(5, t.length - 1)];
    const targetAgeOffset = Math.max(1, targetFireAge - currentAge);
    const yrTarget =
      t.find(n => n.year === crossoverYear) ||
      t[Math.min(targetAgeOffset, t.length - 1)];
    const yrEnd = t[t.length - 1];

    return [
      { label: 'Today (Year 0)', data: yr0 },
      { label: `+5 Years (${yr5.year})`, data: yr5 },
      {
        label: crossoverYear
          ? `FIRE Crossover (${crossoverYear})`
          : `Target Age (${yrTarget.year})`,
        data: yrTarget,
      },
      { label: `Year +${horizonYears} (${yrEnd.year})`, data: yrEnd },
    ];
  }, [visibleTimeline, targetFireAge, currentAge, crossoverYear, horizonYears]);

  const activeInspectionNode = useMemo(() => {
    if (selectedCheckpointYear !== null) {
      const found = visibleTimeline.find(n => n.year === selectedCheckpointYear);
      if (found) return found;
    }
    if (crossoverYear) {
      const cross = visibleTimeline.find(n => n.year === crossoverYear);
      if (cross) return cross;
    }
    return visibleTimeline[Math.min(10, visibleTimeline.length - 1)] || visibleTimeline[0];
  }, [selectedCheckpointYear, visibleTimeline, crossoverYear]);

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
    <div className="space-y-5">
      {/* Visual Path Sub-Header & View/Horizon Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-600 to-emerald-600 text-white flex items-center justify-center shadow-2xs shrink-0">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
              Visual Path: Current Assets vs. Target Corpus &amp; {horizonYears}-Year Growth Trajectory
            </h3>
            <p className="text-[11px] text-slate-500">
              Live visual projection synced with your calculator inputs above ({costBasisMode === 'residing' ? selectedBasisCountry : targetHavenCountryName} basis).
            </p>
          </div>
        </div>

        {/* View Mode & Horizon Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Horizon Selector */}
          <div className="inline-flex items-center gap-1 bg-slate-100 border border-slate-200 p-1 rounded-xl text-xs font-semibold">
            <span className="text-[11px] text-slate-500 px-1.5">Horizon:</span>
            {([10, 15, 20, 25] as HorizonYears[]).map(yr => (
              <button
                key={yr}
                type="button"
                onClick={() => setHorizonYears(yr)}
                className={`px-2 py-1 rounded-lg font-mono text-[11px] cursor-pointer transition-all ${
                  horizonYears === yr
                    ? 'bg-slate-900 text-white font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {yr}Y
              </button>
            ))}
          </div>

          {/* View Mode Segmented Control */}
          <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setViewMode('combined')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
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
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
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
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                viewMode === 'timeline'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Growth Timeline
            </button>
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
                <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-teal-600" />
                  <span>Current Assets vs. Target Retirement Corpus</span>
                </h4>
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
                  data={comparisonBars}
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
                    x={startingCorpusTodayUSD}
                    stroke="#0d9488"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                  />
                  <Bar dataKey="amountUSD" radius={[0, 8, 8, 0]} barSize={24}>
                    {comparisonBars.map(entry => (
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
                  {formatDualCurrency(totalGrossAssetsUSD, countryMacro, true)}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px]">
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/70">
                  <span className="text-slate-500 block">Savings</span>
                  <span className="font-mono font-bold text-slate-900">
                    ${Math.round((investments.savingsUSD || 0) / 1000)}k
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/70">
                  <span className="text-slate-500 block">Stocks/MF</span>
                  <span className="font-mono font-bold text-emerald-800">
                    ${Math.round((investments.stocksMutualFundsUSD || 0) / 1000)}k
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/70">
                  <span className="text-slate-500 block">Real Estate</span>
                  <span className="font-mono font-bold text-indigo-800">
                    ${Math.round((investments.realEstateUSD || 0) / 1000)}k
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/70">
                  <span className="text-slate-500 block">Gold</span>
                  <span className="font-mono font-bold text-amber-800">
                    ${Math.round((investments.goldUSD || 0) / 1000)}k
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/70">
                  <span className="text-slate-500 block">Others</span>
                  <span className="font-mono font-bold text-purple-800">
                    ${Math.round((investments.othersUSD || 0) / 1000)}k
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
                <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-orange-600" />
                  <span>
                    {horizonYears}-Year Timeline Growth Projection ({currentYear}–
                    {currentYear + horizonYears})
                  </span>
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Tracks projected portfolio growth ({expectedReturnPct}%/yr return +{' '}
                  {sipStepUpPct}%/yr SIP step-up) vs. inflation-adjusted retirement corpus ({inflationPct}%/yr inflation).
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
                      `${yr} (Age ${currentAge + (Number(yr) - currentYear)})`
                    }
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickFormatter={formatAxisValue}
                  />
                  <Tooltip
                    formatter={((value: any, name: any) => {
                      const labelMap: Record<string, string> = {
                        projectedCorpusUSD: 'Projected Net Assets',
                        cumulativeContributionsUSD: 'Cumulative Principal + SIPs',
                        fireTargetUSD: `Inflation-Adj Target Corpus (${
                          costBasisMode === 'residing' ? selectedBasisCountry : targetHavenCountryName
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
                        currentAge + (Number(yr) - currentYear)
                      }`
                    }
                    contentStyle={{
                      borderRadius: '12px',
                      fontSize: '12px',
                      borderColor: '#cbd5e1',
                      boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
                    }}
                  />
                  {crossoverYear &&
                    crossoverYear <= currentYear + horizonYears && (
                      <ReferenceLine
                        x={crossoverYear}
                        stroke="#10b981"
                        strokeDasharray="4 4"
                        strokeWidth={2}
                        label={{
                          value: `FIRE in ${crossoverYear} (Age ${crossoverAge})`,
                          position: 'top',
                          fill: '#047857',
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      />
                    )}
                  <Area
                    type="monotone"
                    dataKey="projectedCorpusUSD"
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
                    dataKey="fireTargetUSD"
                    stroke="#ea580c"
                    strokeWidth={2.25}
                    strokeDasharray="6 3"
                    dot={false}
                  />
                  {costBasisMode === 'residing' &&
                    selectedBasisCountry.toLowerCase() !==
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
                <div className="flex items-center gap-2 flex-wrap">
                  <Award className="w-4 h-4 text-teal-600 shrink-0" />
                  <span className="font-bold text-slate-800">
                    Snapshot {activeInspectionNode.year} (Age {activeInspectionNode.age}):
                  </span>
                  <span className="text-slate-600">
                    Assets{' '}
                    <strong className="font-mono text-teal-800">
                      {formatDualCurrency(activeInspectionNode.projectedCorpusUSD, countryMacro, true)}
                    </strong>{' '}
                    vs. Target{' '}
                    <strong className="font-mono text-orange-800">
                      {formatDualCurrency(activeInspectionNode.fireTargetUSD, countryMacro, true)}
                    </strong>
                  </span>
                  {activeInspectionNode.isSipActiveInYear !== undefined && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        activeInspectionNode.isSipActiveInYear
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {activeInspectionNode.isSipActiveInYear
                        ? `SIP Active: ${formatDualCurrency(Math.round(activeInspectionNode.annualSipInvestedUSD / 12), countryMacro, false)}/mo`
                        : 'SIP Ceased (Retired / Post-Earning)'}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-slate-700 font-mono font-bold flex-wrap">
                  {activeInspectionNode.sipReturnsUSD !== undefined && activeInspectionNode.sipReturnsUSD > 0 && (
                    <span className="text-purple-800 text-[11px]">
                      SIP Gains: +{formatDualCurrency(activeInspectionNode.sipReturnsUSD, countryMacro, true)}
                    </span>
                  )}
                  <span>
                    Compounding Gains:{' '}
                    <span className="text-emerald-700">
                      +{formatDualCurrency(activeInspectionNode.compoundingGainsUSD, countryMacro, true)}
                    </span>{' '}
                    · {activeInspectionNode.fundingRatioPct}% Funded
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Timeline Checkpoint Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {checkpointNodes.map((cp, idx) => {
          const isSelected = activeInspectionNode?.year === cp.data.year;
          const isFunded = cp.data.projectedCorpusUSD >= cp.data.fireTargetUSD;
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
                  {formatDualCurrency(cp.data.projectedCorpusUSD, countryMacro, true)}
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  Goal: ${Math.round(cp.data.fireTargetUSD / 1000)}k
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
