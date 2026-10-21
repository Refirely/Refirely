import React from 'react';
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
import { DollarSign, Sun, Activity, ShieldCheck, Compass, Info } from 'lucide-react';

interface CountryRadarComparisonProps {
  country: Country;
}

export const CountryRadarComparison: React.FC<CountryRadarComparisonProps> = ({ country }) => {
  // Global haven averages calculated across the 15 destinations
  const GLOBAL_AVG_BUDGET = 1750;
  const GLOBAL_AVG_SUNNY_DAYS = 285;
  const GLOBAL_AVG_HEALTHCARE = 88;
  const GLOBAL_AVG_SAFETY = 83;
  const GLOBAL_AVG_WALKABILITY = 81;

  // Normalized 0-100 values
  const costAffordability = Math.round(
    Math.max(20, Math.min(100, 100 - ((country.costOfLiving.monthlyBudgetSingleUSD - 900) / 2200) * 80))
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
  const infraDelta = country.lifestyle.walkabilityScore - GLOBAL_AVG_WALKABILITY;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            Empirical Benchmark: {country.name} vs. Global Average
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Six-axis comparative radar analyzing cost of living, climate, healthcare, safety, and infrastructure against international averages.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mt-6">
        
        {/* Radar Chart (7 cols on desktop) */}
        <div className="lg:col-span-7 h-[340px] sm:h-[370px] w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
              <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: '#334155', fontSize: 11, fontWeight: 600 }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                stroke="#cbd5e1"
                tick={{ fill: '#94a3b8', fontSize: 9 }}
              />
              <Radar
                name={country.name}
                dataKey={country.name}
                stroke="#0d9488"
                fill="#0d9488"
                fillOpacity={0.4}
                strokeWidth={2}
              />
              <Radar
                name="Global Haven Average"
                dataKey="Global Average"
                stroke="#94a3b8"
                fill="#94a3b8"
                fillOpacity={0.15}
                strokeDasharray="4 4"
                strokeWidth={1.5}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '12px',
                }}
              />
              <Legend
                wrapperStyle={{
                  fontSize: '12px',
                  paddingTop: '12px',
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Breakdown of Key Dimensions: Cost, Climate, Infrastructure (5 cols on desktop) */}
        <div className="lg:col-span-5 space-y-3.5 text-xs">
          
          {/* Dimension 1: Cost of Living */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-teal-700" />
                <span>Cost of Living</span>
              </span>
              <span
                className={`font-mono tabular-nums font-semibold text-[11px] px-2 py-0.5 rounded ${
                  budgetDelta <= 0
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}
              >
                {budgetDelta <= 0
                  ? `$${Math.abs(budgetDelta)}/mo below avg`
                  : `+$${budgetDelta}/mo above avg`}
              </span>
            </div>
            <div className="flex items-baseline justify-between text-slate-600 mt-2">
              <span>{country.name} Monthly Budget:</span>
              <span className="font-mono tabular-nums font-bold text-slate-900">
                ${country.costOfLiving.monthlyBudgetSingleUSD.toLocaleString()} / mo
              </span>
            </div>
            <div className="flex items-baseline justify-between text-slate-400 text-[11px] mt-0.5">
              <span>Global Haven Benchmark:</span>
              <span className="font-mono tabular-nums">~${GLOBAL_AVG_BUDGET.toLocaleString()} / mo</span>
            </div>
          </div>

          {/* Dimension 2: Climate & Sunshine */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>Climate & Sunshine</span>
              </span>
              <span
                className={`font-mono tabular-nums font-semibold text-[11px] px-2 py-0.5 rounded ${
                  sunnyDelta >= 0
                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {sunnyDelta >= 0 ? `+${sunnyDelta} sunny days` : `${sunnyDelta} sunny days`}
              </span>
            </div>
            <div className="flex items-baseline justify-between text-slate-600 mt-2">
              <span>{country.name} Sunshine:</span>
              <span className="font-mono tabular-nums font-bold text-amber-700">
                {country.climate.annualSunnyDays} days / yr
              </span>
            </div>
            <div className="flex items-baseline justify-between text-slate-400 text-[11px] mt-0.5">
              <span>Global Haven Benchmark:</span>
              <span className="font-mono tabular-nums">~{GLOBAL_AVG_SUNNY_DAYS} days / yr</span>
            </div>
          </div>

          {/* Dimension 3: Infrastructure & Healthcare */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-rose-600" />
                <span>Infrastructure & Healthcare</span>
              </span>
              <span
                className={`font-mono tabular-nums font-semibold text-[11px] px-2 py-0.5 rounded ${
                  healthDelta >= 0
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {healthDelta >= 0 ? `+${healthDelta} pts healthcare` : `${healthDelta} pts healthcare`}
              </span>
            </div>
            <div className="flex items-baseline justify-between text-slate-600 mt-2">
              <span>Healthcare Quality Index:</span>
              <span className="font-mono tabular-nums font-bold text-slate-900">
                {country.lifestyle.healthcareScore} / 100
              </span>
            </div>
            <div className="flex items-baseline justify-between text-slate-600 mt-1">
              <span>Walkability & Transit Score:</span>
              <span className="font-mono tabular-nums font-semibold text-slate-800">
                {country.lifestyle.walkabilityScore} / 100
              </span>
            </div>
            <div className="flex items-baseline justify-between text-slate-400 text-[11px] mt-0.5">
              <span>Global Benchmark Averages:</span>
              <span className="font-mono tabular-nums">~88 health / ~81 infra</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
