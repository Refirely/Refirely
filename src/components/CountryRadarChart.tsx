import React, { useState, useMemo } from 'react';
import { scaleLinear } from 'd3-scale';
import { motion } from 'motion/react';
import { Country } from '../types';
import { CountryFlag } from './CountryFlag';
import {
  Radar,
  Trophy,
  Sparkles,
  X,
  Plus,
  Eye,
} from 'lucide-react';

interface CountryRadarChartProps {
  countries: Country[];
  comparedCountries: Country[];
  discreetLifestyleEnabled: boolean;
  onToggleCompareCountry: (countryId: string) => void;
  onReplaceCompareCountry: (oldId: string, newId: string) => void;
  onNavigateToCountry?: (countryId: string) => void;
}

interface CountryMetricScore {
  country: Country;
  slotIndex: number;
  score: number;
  raw: string;
}

interface RadarDimension {
  key: string;
  label: string;
  shortLabel: string;
  category: 'Economic' | 'Lifestyle' | 'Mobility';
  description: string;
  entries: CountryMetricScore[];
}

export const SLOT_THEMES = [
  {
    name: 'Teal',
    stroke: '#0d9488',
    fill: 'rgba(13, 148, 136, 0.20)',
    fillSpotlight: 'rgba(13, 148, 136, 0.32)',
    dotBg: 'bg-teal-500',
    barBg: 'bg-teal-600',
    badgeBg: 'bg-teal-50 text-teal-800 border-teal-200',
    cardBg: 'bg-teal-50/70 border-teal-200/90',
    cardActiveRing: 'ring-2 ring-teal-500 border-teal-500 bg-teal-50',
    headerPillBg: 'bg-teal-950/80 border-teal-500/40',
    scoreText: 'text-teal-700',
    svgTextFill: 'fill-teal-700',
    darkPillBg: 'bg-teal-950/90 border-teal-500/40 text-teal-200',
  },
  {
    name: 'Indigo',
    stroke: '#4f46e5',
    fill: 'rgba(79, 70, 229, 0.17)',
    fillSpotlight: 'rgba(79, 70, 229, 0.30)',
    dotBg: 'bg-indigo-500',
    barBg: 'bg-indigo-600',
    badgeBg: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    cardBg: 'bg-indigo-50/70 border-indigo-200/90',
    cardActiveRing: 'ring-2 ring-indigo-500 border-indigo-500 bg-indigo-50',
    headerPillBg: 'bg-indigo-950/80 border-indigo-400/40',
    scoreText: 'text-indigo-700',
    svgTextFill: 'fill-indigo-700',
    darkPillBg: 'bg-indigo-950/90 border-indigo-400/40 text-indigo-200',
  },
  {
    name: 'Amber',
    stroke: '#d97706',
    fill: 'rgba(217, 119, 6, 0.17)',
    fillSpotlight: 'rgba(217, 119, 6, 0.30)',
    dotBg: 'bg-amber-500',
    barBg: 'bg-amber-600',
    badgeBg: 'bg-amber-50 text-amber-900 border-amber-200',
    cardBg: 'bg-amber-50/70 border-amber-200/90',
    cardActiveRing: 'ring-2 ring-amber-500 border-amber-500 bg-amber-50',
    headerPillBg: 'bg-amber-950/80 border-amber-400/40',
    scoreText: 'text-amber-700',
    svgTextFill: 'fill-amber-700',
    darkPillBg: 'bg-amber-950/90 border-amber-400/40 text-amber-200',
  },
  {
    name: 'Rose',
    stroke: '#e11d48',
    fill: 'rgba(225, 29, 72, 0.15)',
    fillSpotlight: 'rgba(225, 29, 72, 0.28)',
    dotBg: 'bg-rose-500',
    barBg: 'bg-rose-600',
    badgeBg: 'bg-rose-50 text-rose-800 border-rose-200',
    cardBg: 'bg-rose-50/70 border-rose-200/90',
    cardActiveRing: 'ring-2 ring-rose-500 border-rose-500 bg-rose-50',
    headerPillBg: 'bg-rose-950/80 border-rose-400/40',
    scoreText: 'text-rose-700',
    svgTextFill: 'fill-rose-700',
    darkPillBg: 'bg-rose-950/90 border-rose-400/40 text-rose-200',
  },
];

export const CountryRadarChart: React.FC<CountryRadarChartProps> = ({
  countries,
  comparedCountries,
  discreetLifestyleEnabled,
  onToggleCompareCountry,
  onReplaceCompareCountry,
  onNavigateToCountry,
}) => {
  const [hoveredAxisKey, setHoveredAxisKey] = useState<string | null>(null);
  const [spotlightCountryId, setSpotlightCountryId] = useState<string | null>(null);

  const sortedCountries = useMemo(
    () => [...countries].sort((a, b) => a.name.localeCompare(b.name)),
    [countries]
  );

  const uncomparedCountries = useMemo(
    () =>
      sortedCountries.filter(
        c => !comparedCountries.some(active => active.id === c.id)
      ),
    [sortedCountries, comparedCountries]
  );

  // D3 linear scales to normalize heterogeneous economic & lifestyle metrics onto a 0-100 index
  const dimensions: RadarDimension[] = useMemo(() => {
    if (comparedCountries.length === 0) return [];

    // 1. Affordability / Cost Efficiency (Couple Monthly Budget: lower cost = higher score)
    const budgetScale = scaleLinear().domain([4800, 1100]).range([24, 98]).clamp(true);

    // 2. Visa Accessibility (Min Monthly Income + Processing Months: lower barrier = higher score)
    const visaIncomeScale = scaleLinear().domain([4200, 800]).range([28, 96]).clamp(true);
    const visaSpeedScale = scaleLinear().domain([8, 1]).range([35, 96]).clamp(true);

    // 3. Climate & Sunshine (Annual Sunny Days + Ideal Temp proximity to 23C)
    const sunScale = scaleLinear().domain([110, 325]).range([35, 98]).clamp(true);

    const getEnglishScore = (level: string): number => {
      const normalized = level.toLowerCase();
      if (normalized.includes('native') || normalized.includes('very high')) return 95;
      if (normalized.includes('high')) return 84;
      if (normalized.includes('moderate')) return 68;
      return 50;
    };

    const computeVisaScore = (c: Country) => {
      const incScore = visaIncomeScale(c.visa.minimumIncomeUSD);
      const spdScore = visaSpeedScale(c.visa.processingMonths);
      return Math.round(incScore * 0.65 + spdScore * 0.35);
    };

    const computeClimateScore = (c: Country) => {
      const sun = sunScale(c.climate.annualSunnyDays);
      const tempPenalty = Math.min(20, Math.abs(c.climate.averageTempC - 23) * 1.4);
      return Math.round(Math.max(30, Math.min(98, sun - tempPenalty * 0.35)));
    };

    const computeSocialScore = (c: Country) => {
      const eng = getEnglishScore(c.lifestyle.englishProficiency);
      const dating = (c.demographics.datingRating / 5) * 100;
      const youth = Math.min(95, Math.max(40, c.demographics.youngPopulationPercent * 1.7));
      return Math.round(eng * 0.45 + dating * 0.35 + youth * 0.2);
    };

    const baseDimensions: RadarDimension[] = [
      {
        key: 'affordability',
        label: 'Cost Efficiency',
        shortLabel: 'Cost Index',
        category: 'Economic',
        description: 'Normalized purchasing power based on monthly couple retirement budget',
        entries: comparedCountries.map((c, idx) => ({
          country: c,
          slotIndex: idx,
          score: Math.round(budgetScale(c.costOfLiving.monthlyBudgetCoupleUSD)),
          raw: `$${c.costOfLiving.monthlyBudgetCoupleUSD.toLocaleString()}/mo`,
        })),
      },
      {
        key: 'healthcare',
        label: 'Healthcare Quality',
        shortLabel: 'Healthcare',
        category: 'Lifestyle',
        description: 'Hospital infrastructure, specialist availability & clinical standards',
        entries: comparedCountries.map((c, idx) => ({
          country: c,
          slotIndex: idx,
          score: Math.round(c.lifestyle.healthcareScore),
          raw: `${c.lifestyle.healthcareScore}/100`,
        })),
      },
      {
        key: 'safety',
        label: 'Safety & Stability',
        shortLabel: 'Safety',
        category: 'Lifestyle',
        description: 'Personal security index, low violent crime & civic stability',
        entries: comparedCountries.map((c, idx) => ({
          country: c,
          slotIndex: idx,
          score: Math.round(c.lifestyle.safetyScore),
          raw: `${c.lifestyle.safetyScore}/100`,
        })),
      },
      {
        key: 'visa',
        label: 'Visa Accessibility',
        shortLabel: 'Visa Ease',
        category: 'Mobility',
        description: 'Minimum passive income threshold & residency approval timeline',
        entries: comparedCountries.map((c, idx) => ({
          country: c,
          slotIndex: idx,
          score: computeVisaScore(c),
          raw: `$${c.visa.minimumIncomeUSD.toLocaleString()}/mo min`,
        })),
      },
      {
        key: 'climate',
        label: 'Climate & Sunshine',
        shortLabel: 'Sunshine',
        category: 'Lifestyle',
        description: 'Annual sunny days and year-round ambient temperature comfort',
        entries: comparedCountries.map((c, idx) => ({
          country: c,
          slotIndex: idx,
          score: computeClimateScore(c),
          raw: `${c.climate.annualSunnyDays} sunny days`,
        })),
      },
      {
        key: 'social',
        label: 'Expat & Social Ease',
        shortLabel: 'Social & English',
        category: 'Lifestyle',
        description: 'English proficiency, social openness & demographic vitality',
        entries: comparedCountries.map((c, idx) => ({
          country: c,
          slotIndex: idx,
          score: computeSocialScore(c),
          raw: `${c.lifestyle.englishProficiency} English`,
        })),
      },
    ];

    if (discreetLifestyleEnabled) {
      baseDimensions.push({
        key: 'nightlife',
        label: 'Nightlife & Vibrancy',
        shortLabel: 'Nightlife',
        category: 'Lifestyle',
        description: 'Evening entertainment density, social venues & adult lifestyle openness',
        entries: comparedCountries.map((c, idx) => ({
          country: c,
          slotIndex: idx,
          score: Math.round(
            Math.min(98, Math.max(25, c.adultEntertainment.adultEntertainmentScore * 19))
          ),
          raw: `${c.adultEntertainment.nightlifeVibrancy} (${c.adultEntertainment.adultEntertainmentScore}/5)`,
        })),
      });
    }

    return baseDimensions;
  }, [comparedCountries, discreetLifestyleEnabled]);

  // Composite average scores for each active country
  const compositeScores = useMemo(() => {
    if (!dimensions.length) return [];
    return comparedCountries.map((c, idx) => {
      const sum = dimensions.reduce((acc, dim) => {
        const entry = dim.entries[idx];
        return acc + (entry ? entry.score : 0);
      }, 0);
      return {
        country: c,
        slotIndex: idx,
        composite: Math.round(sum / dimensions.length),
      };
    });
  }, [comparedCountries, dimensions]);

  const rankedComposites = useMemo(
    () => [...compositeScores].sort((a, b) => b.composite - a.composite),
    [compositeScores]
  );

  // SVG Geometry & D3 Radial Scale
  const svgSize = 430;
  const center = svgSize / 2;
  const maxRadius = 136;
  const gridLevels = [20, 40, 60, 80, 100];

  const radialScale = useMemo(
    () => scaleLinear().domain([0, 100]).range([0, maxRadius]).clamp(true),
    [maxRadius]
  );

  const angleStep = dimensions.length > 0 ? (Math.PI * 2) / dimensions.length : 0;

  const getCoordinates = (score: number, index: number, radiusOverride?: number) => {
    const r = radiusOverride !== undefined ? radiusOverride : radialScale(score);
    // Start at top (-PI / 2) and move clockwise
    const angle = index * angleStep - Math.PI / 2;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
      angle,
    };
  };

  if (comparedCountries.length === 0) return null;

  const activeDimension =
    dimensions.find(d => d.key === hoveredAxisKey) || dimensions[0];

  return (
    <div className="my-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm overflow-hidden">
      {/* Top Studio Header Bar — Synchronized with all up to 4 Compared Countries */}
      <div className="px-5 py-4 sm:px-6 sm:py-5 bg-gradient-to-r from-slate-900 via-teal-950 to-indigo-950 text-white border-b border-slate-800">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-teal-500/15 border border-teal-400/30 text-teal-300 text-[11px] font-mono uppercase tracking-wider">
                <Radar className="w-3.5 h-3.5" />
                <span>
                  D3 Multi-Axis Performance Telemetry · {comparedCountries.length}/4 Countries Synced
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-white">
                Multi-Country Lifestyle & Economic Radar
              </h2>
              <p className="text-xs text-slate-300 max-w-2xl">
                Synchronized 1-to-1 with the Empirical Parameter matrix below across {dimensions.length} D3-normalized retirement vectors. Swap, add, or remove up to 4 countries in either view.
              </p>
            </div>

            {spotlightCountryId && (
              <button
                onClick={() => setSpotlightCountryId(null)}
                className="self-start md:self-center inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-teal-200 border border-white/15 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Show All {comparedCountries.length} Overlays</span>
              </button>
            )}
          </div>

          {/* Synchronized 4-Slot Country Selector Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 bg-slate-950/60 p-2.5 rounded-xl border border-white/10">
            {comparedCountries.map((country, idx) => {
              const theme = SLOT_THEMES[idx % SLOT_THEMES.length];
              return (
                <div
                  key={country.id}
                  className={`flex items-center justify-between gap-1.5 rounded-lg px-2.5 py-1.5 border ${theme.headerPillBg}`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${theme.dotBg} shrink-0`}
                    />
                    <CountryFlag
                      countryCode={country.code}
                      countryName={country.name}
                      fallbackEmoji={country.flag}
                      size="sm"
                    />
                    <select
                      value={country.id}
                      onChange={e => onReplaceCompareCountry(country.id, e.target.value)}
                      aria-label={`Change Slot ${idx + 1} Country`}
                      className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer w-full truncate pr-1"
                    >
                      <option value={country.id} className="bg-slate-900 text-white">
                        {country.name} ({country.region})
                      </option>
                      {uncomparedCountries.map(c => (
                        <option
                          key={`slot-${idx}-${c.id}`}
                          value={c.id}
                          className="bg-slate-900 text-white"
                        >
                          {c.name} ({c.region})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={() => onToggleCompareCountry(country.id)}
                    title={`Remove ${country.name} from comparison`}
                    className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-rose-300 transition-colors shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}

            {/* Empty Add Slot(s) up to 4 */}
            {comparedCountries.length < 4 && (
              <div className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 border border-dashed border-slate-600 bg-slate-900/50 hover:border-teal-400/60 transition-colors">
                <Plus className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <select
                  value=""
                  onChange={e => {
                    if (e.target.value) {
                      onToggleCompareCountry(e.target.value);
                    }
                  }}
                  aria-label="Add another country to comparison"
                  className="bg-transparent text-xs font-semibold text-slate-300 focus:outline-none cursor-pointer w-full"
                >
                  <option value="" className="bg-slate-900 text-slate-400">
                    + Add Country ({comparedCountries.length}/4)...
                  </option>
                  {uncomparedCountries.map(c => (
                    <option
                      key={`add-slot-${c.id}`}
                      value={c.id}
                      className="bg-slate-900 text-white"
                    >
                      {c.name} ({c.region})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Grid: Left = D3 SVG Radar Chart, Right = Dimension Telemetry & Multi-Country Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
        {/* Left Column: D3 Radar Visualization (7 cols) */}
        <div className="lg:col-span-7 p-4 sm:p-6 flex flex-col items-center justify-between bg-gradient-to-b from-slate-50/70 via-white to-slate-50/40">
          {/* Interactive Legend & Composite Score Cards (1 to 4 countries) */}
          <div
            className={`w-full grid gap-2.5 mb-2 ${
              comparedCountries.length === 1
                ? 'grid-cols-1'
                : 'grid-cols-1 sm:grid-cols-2'
            }`}
          >
            {compositeScores.map(({ country, slotIndex, composite }) => {
              const theme = SLOT_THEMES[slotIndex % SLOT_THEMES.length];
              const isSpotlight = spotlightCountryId === country.id;
              const isDimmed =
                spotlightCountryId !== null && spotlightCountryId !== country.id;

              return (
                <div
                  key={country.id}
                  onClick={() =>
                    setSpotlightCountryId(prev =>
                      prev === country.id ? null : country.id
                    )
                  }
                  title="Click to spotlight this country on the radar chart"
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                    isSpotlight
                      ? theme.cardActiveRing
                      : `${theme.cardBg} ${isDimmed ? 'opacity-55' : 'hover:shadow-2xs'}`
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <CountryFlag
                      countryCode={country.code}
                      countryName={country.name}
                      fallbackEmoji={country.flag}
                      size="md"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${theme.dotBg} shrink-0`}
                        />
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            onNavigateToCountry?.(country.id);
                          }}
                          className="text-sm font-extrabold text-slate-900 hover:underline truncate"
                        >
                          {country.name}
                        </button>
                      </div>
                      <span className="text-[11px] text-slate-600 block truncate font-mono">
                        ${country.costOfLiving.monthlyBudgetCoupleUSD.toLocaleString()}/mo couple
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 block">
                      Composite
                    </span>
                    <span
                      className={`text-lg font-mono font-extrabold tabular-nums ${theme.scoreText}`}
                    >
                      {composite}
                      <span className="text-xs font-normal text-slate-500">/100</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive D3 Radar SVG */}
          <div className="relative w-full max-w-[450px] aspect-square flex items-center justify-center my-1">
            <svg
              viewBox={`0 0 ${svgSize} ${svgSize}`}
              className="w-full h-full overflow-visible select-none"
              role="img"
              aria-label={`Radar chart comparing ${comparedCountries
                .map(c => c.name)
                .join(', ')}`}
            >
              <defs>
                <radialGradient id="radarGridBg" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#f8fafc" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#f1f5f9" stopOpacity="0.3" />
                </radialGradient>
              </defs>

              {/* Background Concentric Polygons (20, 40, 60, 80, 100) */}
              {gridLevels.map(level => {
                const r = radialScale(level);
                const ringPoints = dimensions
                  .map((_, i) => {
                    const { x, y } = getCoordinates(level, i, r);
                    return `${x.toFixed(1)},${y.toFixed(1)}`;
                  })
                  .join(' ');

                return (
                  <g key={`grid-${level}`}>
                    <polygon
                      points={ringPoints}
                      fill={level === 100 ? 'url(#radarGridBg)' : 'none'}
                      stroke={level === 100 ? '#cbd5e1' : '#e2e8f0'}
                      strokeWidth={level === 100 ? 1.5 : 1}
                      strokeDasharray={level < 100 ? '3 3' : undefined}
                    />
                    <text
                      x={center + 4}
                      y={center - r + 10}
                      className="fill-slate-400 font-mono text-[9px]"
                    >
                      {level}
                    </text>
                  </g>
                );
              })}

              {/* Radial Axis Spokes & Outer Labels */}
              {dimensions.map((dim, i) => {
                const outer = getCoordinates(100, i, maxRadius);
                const labelPos = getCoordinates(100, i, maxRadius + 36);
                const isHovered = hoveredAxisKey === dim.key;

                const dx = labelPos.x - center;
                const textAnchor =
                  Math.abs(dx) < 15 ? 'middle' : dx > 0 ? 'start' : 'end';

                return (
                  <g
                    key={`axis-${dim.key}`}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredAxisKey(dim.key)}
                  >
                    <line
                      x1={center}
                      y1={center}
                      x2={outer.x}
                      y2={outer.y}
                      stroke={isHovered ? '#0f172a' : '#cbd5e1'}
                      strokeWidth={isHovered ? 2 : 1}
                    />

                    {/* Axis Short Label */}
                    <text
                      x={labelPos.x}
                      y={labelPos.y - 5}
                      textAnchor={textAnchor}
                      className={`text-[11px] font-bold transition-colors ${
                        isHovered ? 'fill-slate-950' : 'fill-slate-700'
                      }`}
                    >
                      {dim.shortLabel}
                    </text>

                    {/* Multi-Country Score Readout under Axis Label */}
                    <text
                      x={labelPos.x}
                      y={labelPos.y + 9}
                      textAnchor={textAnchor}
                      className="text-[9.5px] font-mono font-bold"
                    >
                      {dim.entries.map((entry, idx) => {
                        const theme = SLOT_THEMES[idx % SLOT_THEMES.length];
                        return (
                          <React.Fragment key={`lbl-${dim.key}-${entry.country.id}`}>
                            {idx > 0 && <tspan className="fill-slate-400">·</tspan>}
                            <tspan className={theme.svgTextFill}>{entry.score}</tspan>
                          </React.Fragment>
                        );
                      })}
                    </text>
                  </g>
                );
              })}

              {/* Country Radar Polygons (up to 4) */}
              {comparedCountries.map((country, slotIdx) => {
                const theme = SLOT_THEMES[slotIdx % SLOT_THEMES.length];
                const isSpotlight = spotlightCountryId === country.id;
                const isDimmed =
                  spotlightCountryId !== null && spotlightCountryId !== country.id;

                const points = dimensions
                  .map((dim, axisIdx) => {
                    const score = dim.entries[slotIdx]?.score || 0;
                    const { x, y } = getCoordinates(score, axisIdx);
                    return `${x.toFixed(1)},${y.toFixed(1)}`;
                  })
                  .join(' ');

                return (
                  <motion.polygon
                    key={`poly-${country.id}`}
                    initial={false}
                    animate={{
                      points,
                      opacity: isDimmed ? 0.22 : 1,
                    }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    fill={isSpotlight ? theme.fillSpotlight : theme.fill}
                    stroke={theme.stroke}
                    strokeWidth={isSpotlight ? 3 : 2.25}
                    strokeLinejoin="round"
                    className="cursor-pointer"
                    onClick={() =>
                      setSpotlightCountryId(prev =>
                        prev === country.id ? null : country.id
                      )
                    }
                  />
                );
              })}

              {/* Interactive Vertex Nodes for All Active Countries */}
              {comparedCountries.map((country, slotIdx) => {
                const theme = SLOT_THEMES[slotIdx % SLOT_THEMES.length];
                const isDimmed =
                  spotlightCountryId !== null && spotlightCountryId !== country.id;

                return dimensions.map((dim, axisIdx) => {
                  const score = dim.entries[slotIdx]?.score || 0;
                  const pos = getCoordinates(score, axisIdx);
                  const isHovered = hoveredAxisKey === dim.key;

                  return (
                    <motion.circle
                      key={`vertex-${country.id}-${dim.key}`}
                      initial={false}
                      animate={{
                        cx: pos.x,
                        cy: pos.y,
                        r: isHovered ? 5.5 : 4,
                        opacity: isDimmed ? 0.25 : 1,
                      }}
                      transition={{ duration: 0.3 }}
                      fill={theme.stroke}
                      stroke="#ffffff"
                      strokeWidth={1.75}
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredAxisKey(dim.key)}
                    />
                  );
                });
              })}
            </svg>
          </div>

          {/* Active Dimension Callout Footer Bar (Shows All Active Countries) */}
          {activeDimension && (
            <div className="w-full p-3.5 rounded-xl bg-slate-900 text-white space-y-2.5 border border-slate-800">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span className="text-xs font-extrabold uppercase tracking-wider text-teal-300">
                    {activeDimension.label}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-slate-300">
                    {activeDimension.category}
                  </span>
                </div>
                <span className="text-[11px] text-slate-300">
                  {activeDimension.description}
                </span>
              </div>

              <div
                className={`grid gap-2 font-mono text-xs ${
                  comparedCountries.length <= 2
                    ? 'grid-cols-1 sm:grid-cols-2'
                    : 'grid-cols-1 sm:grid-cols-2'
                }`}
              >
                {activeDimension.entries.map(entry => {
                  const theme = SLOT_THEMES[entry.slotIndex % SLOT_THEMES.length];
                  return (
                    <div
                      key={`callout-${entry.country.id}`}
                      className={`px-2.5 py-1.5 rounded-lg border flex items-center justify-between gap-2 ${theme.darkPillBg}`}
                    >
                      <span className="font-bold text-white truncate">
                        {entry.country.name}
                      </span>
                      <span className="shrink-0">
                        {entry.raw} · <strong className="text-white">{entry.score} pts</strong>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Multi-Country Dimension Breakdown & Advantage Matrix (5 cols) */}
        <div className="lg:col-span-5 p-4 sm:p-6 flex flex-col justify-between bg-white">
          <div>
            <div className="flex items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                  Relative Metric Advantage ({comparedCountries.length} {comparedCountries.length === 1 ? 'Country' : 'Countries'})
                </h3>
                <p className="text-[11px] text-slate-500">
                  Normalized 0–100 D3 scale with underlying empirical figures
                </p>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                Hover row to inspect
              </span>
            </div>

            <div className="space-y-3">
              {dimensions.map(dim => {
                const sortedEntries = [...dim.entries].sort(
                  (a, b) => b.score - a.score
                );
                const topEntry = sortedEntries[0];
                const runnerUp = sortedEntries[1];
                const isTie =
                  runnerUp && topEntry && topEntry.score === runnerUp.score;
                const leadMargin =
                  runnerUp && topEntry ? topEntry.score - runnerUp.score : 0;
                const isHovered = hoveredAxisKey === dim.key;
                const topTheme = topEntry
                  ? SLOT_THEMES[topEntry.slotIndex % SLOT_THEMES.length]
                  : SLOT_THEMES[0];

                return (
                  <div
                    key={dim.key}
                    onMouseEnter={() => setHoveredAxisKey(dim.key)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isHovered
                        ? 'bg-slate-50 border-slate-300 shadow-2xs'
                        : 'bg-white border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-bold text-slate-900">
                        {dim.label}
                      </span>
                      {comparedCountries.length > 1 && topEntry && (
                        isTie ? (
                          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                            Top Tie ({topEntry.score} pts)
                          </span>
                        ) : (
                          <span
                            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${topTheme.badgeBg}`}
                          >
                            {topEntry.country.name} +{leadMargin} pts
                          </span>
                        )
                      )}
                    </div>

                    {/* Progress Bars for all active comparedCountries (1 to 4) */}
                    <div className="space-y-1.5">
                      {dim.entries.map(entry => {
                        const theme =
                          SLOT_THEMES[entry.slotIndex % SLOT_THEMES.length];
                        const isDimmed =
                          spotlightCountryId !== null &&
                          spotlightCountryId !== entry.country.id;

                        return (
                          <div
                            key={`bar-${dim.key}-${entry.country.id}`}
                            className={`flex items-center gap-2 text-[11px] transition-opacity ${
                              isDimmed ? 'opacity-40' : 'opacity-100'
                            }`}
                          >
                            <span className="w-24 truncate font-medium text-slate-700 flex items-center gap-1.5 shrink-0">
                              <span
                                className={`w-2 h-2 rounded-full ${theme.dotBg} shrink-0`}
                              />
                              <span className="truncate">{entry.country.name}</span>
                            </span>
                            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <motion.div
                                initial={false}
                                animate={{ width: `${entry.score}%` }}
                                transition={{ duration: 0.4 }}
                                className={`h-full ${theme.barBg} rounded-full`}
                              />
                            </div>
                            <span className="w-24 text-right font-mono text-[10px] text-slate-600 tabular-nums shrink-0 truncate">
                              {entry.raw}
                            </span>
                            <span
                              className={`w-7 text-right font-mono font-bold tabular-nums shrink-0 ${theme.scoreText}`}
                            >
                              {entry.score}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Verdict & Multi-Country Composite Standings */}
          {rankedComposites.length > 0 && (
            <div className="mt-5 pt-4 border-t border-slate-100">
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-teal-50/80 via-slate-50 to-indigo-50/80 border border-slate-200/80 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Trophy className="w-4 h-4 text-amber-700" />
                </div>
                <div className="text-xs leading-relaxed text-slate-700 w-full">
                  <span className="font-extrabold text-slate-900 block mb-1">
                    {rankedComposites.length === 1
                      ? `${rankedComposites[0].country.name} Benchmark Score: ${rankedComposites[0].composite}/100`
                      : `Overall Composite Leader: ${rankedComposites[0].country.name} (${rankedComposites[0].composite}/100)`}
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                    {rankedComposites.map((item, rankIdx) => {
                      const theme = SLOT_THEMES[item.slotIndex % SLOT_THEMES.length];
                      return (
                        <span
                          key={`rank-${item.country.id}`}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-semibold border ${theme.badgeBg}`}
                        >
                          <span>#{rankIdx + 1}</span>
                          <span>{item.country.name}</span>
                          <span>({item.composite})</span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
