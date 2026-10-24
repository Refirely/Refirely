import React from 'react';
import { motion } from 'motion/react';
import { Country } from '../types';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { DollarSign, Sun, Activity, Sparkles } from 'lucide-react';

interface CountryRadarComparisonProps {
  country: Country;
}

export const CountryRadarComparison: React.FC<CountryRadarComparisonProps> = ({ country }) => {
  // Global haven averages calculated across destinations
  const GLOBAL_AVG_BUDGET = 1750;
  const GLOBAL_AVG_SUNNY_DAYS = 285;
  const GLOBAL_AVG_HEALTHCARE = 88;

  // Normalized 0-100 values
  const costAffordability = Math.round(
    Math.max(
      20,
      Math.min(100, 100 - ((country.costOfLiving.monthlyBudgetSingleUSD - 900) / 2200) * 80)
    )
  );
  const climateScore = Math.round(Math.min(99, (country.climate.annualSunnyDays / 330) * 100));
  const healthcareScore = country.lifestyle.healthcareScore;
  const safetyScore = country.lifestyle.safetyScore;
  const infrastructureScore = country.lifestyle.walkabilityScore;
  const visaSimplicity = Math.round((6 - country.visa.difficultyRating) * 20);

  const radarData = [
    {
      subject: 'Cost Affordability',
      [country.name]: costAffordability,
      'Global Average': 65,
      fullMark: 100,
    },
    {
      subject: 'Climate & Sun',
      [country.name]: climateScore,
      'Global Average': 72,
      fullMark: 100,
    },
    {
      subject: 'Healthcare Quality',
      [country.name]: healthcareScore,
      'Global Average': 75,
      fullMark: 100,
    },
    {
      subject: 'Safety & Peace',
      [country.name]: safetyScore,
      'Global Average': 74,
      fullMark: 100,
    },
    {
      subject: 'Infrastructure & Walk',
      [country.name]: infrastructureScore,
      'Global Average': 70,
      fullMark: 100,
    },
    {
      subject: 'Visa Simplicity',
      [country.name]: visaSimplicity,
      'Global Average': 70,
      fullMark: 100,
    },
  ];

  const budgetDelta = country.costOfLiving.monthlyBudgetSingleUSD - GLOBAL_AVG_BUDGET;
  const sunnyDelta = country.climate.annualSunnyDays - GLOBAL_AVG_SUNNY_DAYS;
  const healthDelta = country.lifestyle.healthcareScore - GLOBAL_AVG_HEALTHCARE;

  return (
    <div className="relative overflow-hidden bg-white rounded-3xl border border-indigo-100/90 p-6 sm:p-8 shadow-sm">
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-teal-400 to-amber-500" />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-indigo-100/80">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-indigo-700 mb-0.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Multi-Axis Telemetry
          </span>
          <h3 className="text-lg sm:text-xl font-extrabold bg-gradient-to-r from-slate-900 via-indigo-950 to-teal-900 bg-clip-text text-transparent">
            Empirical Benchmark: {country.name} vs. Global Average
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Six-axis comparative radar analyzing cost of living, climate, healthcare, safety, and infrastructure against international averages.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mt-6">
        {/* Radar Chart (7 cols on desktop) */}
        <div className="lg:col-span-7 h-[340px] sm:h-[370px] w-full flex items-center justify-center bg-gradient-to-br from-slate-50/80 via-indigo-50/30 to-teal-50/30 rounded-2xl border border-indigo-100/70 p-2">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
              <PolarGrid stroke="#cbd5e1" strokeDasharray="3 3" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: '#1e1b4b', fontSize: 11, fontWeight: 700 }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                stroke="#cbd5e1"
                tick={{ fill: '#64748b', fontSize: 9 }}
              />
              <Radar
                name={country.name}
                dataKey={country.name}
                stroke="#4f46e5"
                fill="#14b8a6"
                fillOpacity={0.35}
                strokeWidth={2.5}
              />
              <Radar
                name="Global Haven Average"
                dataKey="Global Average"
                stroke="#f59e0b"
                fill="#f59e0b"
                fillOpacity={0.14}
                strokeDasharray="4 4"
                strokeWidth={2}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#4f46e5',
                  borderRadius: '12px',
                  color: '#ffffff',
                  fontSize: '12px',
                }}
              />
              <Legend
                wrapperStyle={{
                  fontSize: '12px',
                  paddingTop: '12px',
                  fontWeight: 600,
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Breakdown of Key Dimensions: Cost, Climate, Infrastructure (5 cols on desktop) */}
        <div className="lg:col-span-5 space-y-3.5 text-xs">
          {/* Dimension 1: Cost of Living */}
          <motion.div
            whileHover={{ y: -2 }}
            className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/40 border border-emerald-200/80 shadow-2xs"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-500" />
            <div className="flex items-center justify-between mb-1">
              <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                <span>Cost of Living</span>
              </span>
              <span
                className={`font-mono tabular-nums font-bold text-[11px] px-2.5 py-0.5 rounded-full ${
                  budgetDelta <= 0
                    ? 'bg-emerald-100/80 text-emerald-900 border border-emerald-300'
                    : 'bg-amber-100/80 text-amber-900 border border-amber-300'
                }`}
              >
                {budgetDelta <= 0
                  ? `$${Math.abs(budgetDelta)}/mo below avg`
                  : `+$${budgetDelta}/mo above avg`}
              </span>
            </div>
            <div className="flex items-baseline justify-between text-slate-600 mt-2">
              <span>{country.name} Monthly Budget:</span>
              <span className="font-mono tabular-nums font-extrabold text-emerald-950">
                ${country.costOfLiving.monthlyBudgetSingleUSD.toLocaleString()} / mo
              </span>
            </div>
            <div className="flex items-baseline justify-between text-slate-400 text-[11px] mt-0.5">
              <span>Global Haven Benchmark:</span>
              <span className="font-mono tabular-nums">~${GLOBAL_AVG_BUDGET.toLocaleString()} / mo</span>
            </div>
          </motion.div>

          {/* Dimension 2: Climate & Sunshine */}
          <motion.div
            whileHover={{ y: -2 }}
            className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-amber-50/80 via-white to-orange-50/40 border border-amber-200/80 shadow-2xs"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500" />
            <div className="flex items-center justify-between mb-1">
              <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>Climate &amp; Sunshine</span>
              </span>
              <span
                className={`font-mono tabular-nums font-bold text-[11px] px-2.5 py-0.5 rounded-full ${
                  sunnyDelta >= 0
                    ? 'bg-amber-100/80 text-amber-900 border border-amber-300'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {sunnyDelta >= 0 ? `+${sunnyDelta} sunny days` : `${sunnyDelta} sunny days`}
              </span>
            </div>
            <div className="flex items-baseline justify-between text-slate-600 mt-2">
              <span>{country.name} Sunshine:</span>
              <span className="font-mono tabular-nums font-extrabold text-amber-900">
                {country.climate.annualSunnyDays} days / yr
              </span>
            </div>
            <div className="flex items-baseline justify-between text-slate-400 text-[11px] mt-0.5">
              <span>Global Haven Benchmark:</span>
              <span className="font-mono tabular-nums">~{GLOBAL_AVG_SUNNY_DAYS} days / yr</span>
            </div>
          </motion.div>

          {/* Dimension 3: Infrastructure & Healthcare */}
          <motion.div
            whileHover={{ y: -2 }}
            className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-indigo-50/80 via-white to-violet-50/40 border border-indigo-200/80 shadow-2xs"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-violet-500" />
            <div className="flex items-center justify-between mb-1">
              <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-indigo-600" />
                <span>Infrastructure &amp; Healthcare</span>
              </span>
              <span
                className={`font-mono tabular-nums font-bold text-[11px] px-2.5 py-0.5 rounded-full ${
                  healthDelta >= 0
                    ? 'bg-indigo-100/80 text-indigo-900 border border-indigo-300'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {healthDelta >= 0 ? `+${healthDelta} pts healthcare` : `${healthDelta} pts healthcare`}
              </span>
            </div>
            <div className="flex items-baseline justify-between text-slate-600 mt-2">
              <span>Healthcare Quality Index:</span>
              <span className="font-mono tabular-nums font-extrabold text-indigo-950">
                {country.lifestyle.healthcareScore} / 100
              </span>
            </div>
            <div className="flex items-baseline justify-between text-slate-600 mt-1">
              <span>Walkability &amp; Transit Score:</span>
              <span className="font-mono tabular-nums font-bold text-slate-800">
                {country.lifestyle.walkabilityScore} / 100
              </span>
            </div>
            <div className="flex items-baseline justify-between text-slate-400 text-[11px] mt-0.5">
              <span>Global Benchmark Averages:</span>
              <span className="font-mono tabular-nums">~88 health / ~81 infra</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
