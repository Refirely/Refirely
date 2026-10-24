import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Country } from '../types';
import { SHORT_TERM_VISA_DATABASE } from '../data/shortTermVisas';
import { CountryFlag } from './CountryFlag';
import { CountryRadarChart, SLOT_THEMES } from './CountryRadarChart';
import { Plus, X, ArrowRight, Check, Sun, Shield, HeartHandshake, FileCheck, SlidersHorizontal, Scale, Search, Award } from 'lucide-react';
import { motion } from 'motion/react';

const TOP_RETIREMENT_HAVEN_IDS = [
  'portugal',
  'spain',
  'costa-rica',
  'panama',
  'mexico',
  'thailand',
  'malaysia',
  'greece',
  'italy',
  'vietnam',
  'philippines',
  'colombia',
];

export const CompareStudio: React.FC = () => {
  const {
    countries,
    comparedCountryIds,
    toggleCompareCountry,
    replaceCompareCountry,
    clearComparedCountries,
    navigateToCountry,
    discreetLifestyleEnabled,
    setDiscreetLifestyleEnabled,
  } = useApp();

  const [selectorSearch, setSelectorSearch] = useState('');

  const comparedCountries = useMemo(
    () =>
      comparedCountryIds
        .map(id => countries.find(c => c.id === id))
        .filter((c): c is Country => Boolean(c)),
    [countries, comparedCountryIds]
  );

  const availableCountriesToAdd = useMemo(() => {
    return countries
      .filter(c => !comparedCountryIds.includes(c.id))
      .filter(c => {
        if (!selectorSearch.trim()) return true;
        const q = selectorSearch.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          c.region.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [countries, comparedCountryIds, selectorSearch]);

  const topRetirementHavens = useMemo(() => {
    const havenSet = TOP_RETIREMENT_HAVEN_IDS
      .map(id => countries.find(c => c.id === id))
      .filter((c): c is Country => Boolean(c));

    if (havenSet.length >= 8) return havenSet;

    return [...countries]
      .sort(
        (a, b) =>
          b.lifestyle.healthcareScore +
          b.lifestyle.safetyScore -
          (a.lifestyle.healthcareScore + a.lifestyle.safetyScore)
      )
      .slice(0, 12);
  }, [countries]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header and Controls - Multi-Colored Luminous Banner */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 26 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-50/90 via-white to-teal-50/85 border border-indigo-200/80 p-6 sm:p-8 shadow-md mb-6"
      >
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 via-indigo-500 via-50% to-amber-500" />
        <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-indigo-400/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-teal-400/15 blur-3xl" />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-teal-500 text-white flex items-center justify-center shadow-sm shadow-indigo-500/20">
                <Scale className="w-5 h-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                Country{' '}
                <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-teal-600 bg-clip-text text-transparent">
                  Comparison Studio
                </span>
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1.5">
              Evaluate up to 4 retirement destinations side-by-side across 55+ empirical parameters &amp; synchronized D3 radar telemetry.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setDiscreetLifestyleEnabled(!discreetLifestyleEnabled)}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer ${
                discreetLifestyleEnabled
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-amber-400 shadow-sm'
                  : 'bg-white border-indigo-200 text-indigo-950 hover:bg-indigo-50'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Lifestyle Metrics: {discreetLifestyleEnabled ? 'ON' : 'OFF'}</span>
            </motion.button>

            {comparedCountries.length > 0 && (
              <button
                onClick={clearComparedCountries}
                className="text-xs font-semibold text-rose-600 hover:text-rose-800 underline cursor-pointer"
              >
                Clear All
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Add country selector grid with all countries if under 4 */}
      {comparedCountries.length < 4 && (
        <div className="my-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-50/80 via-white to-indigo-50/70 border border-amber-200/80 space-y-3.5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs sm:text-sm font-extrabold text-slate-900 block">
                Select another country to add to the matrix ({comparedCountries.length}/4 selected):
              </span>
              <span className="text-[11px] text-slate-600">
                Showing {availableCountriesToAdd.length} available retirement destinations — click any country to add it to your side-by-side matrix.
              </span>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-indigo-600/70 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={selectorSearch}
                onChange={e => setSelectorSearch(e.target.value)}
                placeholder="Filter countries or regions..."
                className="w-full pl-8 pr-7 py-1.5 text-xs bg-white border border-indigo-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
              />
              {selectorSearch && (
                <button
                  onClick={() => setSelectorSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {availableCountriesToAdd.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-72 overflow-y-auto pr-1 pt-0.5">
              {availableCountriesToAdd.map(c => (
                <motion.button
                  key={c.id}
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => toggleCompareCountry(c.id)}
                  className="inline-flex items-center justify-between gap-1.5 px-2.5 py-1.5 text-xs font-semibold bg-white text-slate-700 hover:text-indigo-950 border border-indigo-200/70 rounded-xl hover:bg-gradient-to-r hover:from-indigo-50/70 hover:to-teal-50/70 hover:border-indigo-300 transition-all shadow-2xs text-left group cursor-pointer"
                >
                  <span className="inline-flex items-center gap-1.5 min-w-0">
                    <CountryFlag countryCode={c.code} countryName={c.name} fallbackEmoji={c.flag} size="sm" />
                    <span className="truncate">{c.name}</span>
                  </span>
                  <Plus className="w-3.5 h-3.5 text-indigo-600 shrink-0 group-hover:scale-110 transition-transform" />
                </motion.button>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-600 py-2">
              No countries match "{selectorSearch}". Try clearing the search filter above.
            </p>
          )}
        </div>
      )}

      {/* D3 Multi-Country Lifestyle & Economic Radar Chart (Synced 1-to-1 with Matrix) */}
      <CountryRadarChart
        countries={countries}
        comparedCountries={comparedCountries}
        discreetLifestyleEnabled={discreetLifestyleEnabled}
        onToggleCompareCountry={toggleCompareCountry}
        onReplaceCompareCountry={replaceCompareCountry}
        onNavigateToCountry={navigateToCountry}
      />

      {/* Empty State with Top Retirement Havens */}
      {comparedCountries.length === 0 ? (
        <div className="p-6 sm:p-10 bg-white rounded-xl border border-slate-200 my-8 shadow-2xs">
          <div className="text-center max-w-xl mx-auto mb-8">
            <div className="w-12 h-12 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center mx-auto mb-3">
              <Scale className="w-6 h-6 text-teal-700" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900">
              Start Your Side-by-Side Retirement Comparison
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
              Select any destination from the full <strong>{countries.length}-country directory grid</strong> above, click <strong>"Compare"</strong> on any country card in the Explore directory, or choose from our curated <strong>Top Global Retirement Havens</strong> below.
            </p>
          </div>

          <div className="border-t border-slate-100 pt-6">
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-600" />
                <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800">
                  Top Global Retirement Havens
                </h4>
              </div>
              <span className="text-[11px] text-slate-500">
                Ranked by healthcare, safety, visa accessibility & cost of living
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {topRetirementHavens.map(c => (
                <div
                  key={c.id}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-teal-500/60 bg-slate-50/60 hover:bg-white transition-all flex flex-col justify-between gap-3 group shadow-2xs"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <CountryFlag countryCode={c.code} countryName={c.name} fallbackEmoji={c.flag} size="md" />
                        <div className="min-w-0">
                          <h5 className="text-sm font-bold text-slate-900 truncate">
                            {c.name}
                          </h5>
                          <span className="text-[11px] text-slate-500 block">
                            {c.region}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md shrink-0">
                        ${c.costOfLiving.monthlyBudgetSingleUSD.toLocaleString()}/mo
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 mt-3 text-[11px] text-slate-600">
                      <div className="bg-white px-2 py-1 rounded border border-slate-200/70">
                        <span className="text-slate-400 block text-[10px]">Healthcare</span>
                        <span className="font-mono font-bold text-slate-800">{c.lifestyle.healthcareScore}/100</span>
                      </div>
                      <div className="bg-white px-2 py-1 rounded border border-slate-200/70">
                        <span className="text-slate-400 block text-[10px]">Safety Index</span>
                        <span className="font-mono font-bold text-slate-800">{c.lifestyle.safetyScore}/100</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleCompareCountry(c.id)}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-teal-700 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add {c.name}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Comparison Table Container with Tabular figures */
        <div className="mt-6 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm divide-y divide-slate-200">
              
              {/* Table Header: Country Cards */}
              <thead className="bg-slate-50 text-slate-900 font-semibold">
                <tr>
                  <th className="py-4 px-4 w-48 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-100/50">
                    Empirical Parameter
                  </th>
                  {comparedCountries.map((c, idx) => {
                    const slotTheme = SLOT_THEMES[idx % SLOT_THEMES.length];
                    return (
                      <th key={c.id} className="py-4 px-4 min-w-[210px] align-top">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <CountryFlag countryCode={c.code} countryName={c.name} fallbackEmoji={c.flag} size="lg" className="rounded-xs" />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`w-2.5 h-2.5 rounded-full ${slotTheme.dotBg} shrink-0`}
                                  title={`Radar Overlay Slot ${idx + 1}`}
                                />
                                <span className="text-base font-bold text-slate-900 block leading-tight">
                                  {c.name}
                                </span>
                              </div>
                              <span className="text-xs font-normal text-slate-500">{c.region}</span>
                            </div>
                          </div>

                          <button
                            onClick={() => toggleCompareCountry(c.id)}
                            className="text-slate-400 hover:text-rose-600 p-1"
                            title={`Remove ${c.name} from comparison`}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <button
                          onClick={() => navigateToCountry(c.id)}
                          className="text-xs text-orange-700 hover:text-orange-900 font-semibold inline-flex items-center gap-1 mt-1"
                        >
                          <span>View Full Dossier</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-xs">
                
                {/* Section: Financials & Cost */}
                <tr className="bg-orange-50/40 font-semibold text-slate-700">
                  <td colSpan={comparedCountries.length + 1} className="py-2.5 px-4 uppercase text-[11px] tracking-wider text-orange-950 font-bold">
                    Economic & Cost Indicators
                  </td>
                </tr>

                <tr>
                  <td className="py-3 px-4 font-medium text-slate-900">Single Monthly Budget</td>
                  {comparedCountries.map(c => (
                    <td key={c.id} className="py-3 px-4 font-mono tabular-nums font-bold text-slate-900">
                      ${c.costOfLiving.monthlyBudgetSingleUSD.toLocaleString()} / mo
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="py-3 px-4 font-medium text-slate-900">Couple Monthly Budget</td>
                  {comparedCountries.map(c => (
                    <td key={c.id} className="py-3 px-4 font-mono tabular-nums text-slate-700">
                      ${c.costOfLiving.monthlyBudgetCoupleUSD.toLocaleString()} / mo
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="py-3 px-4 font-medium text-slate-900">Rent (1-Bed Center)</td>
                  {comparedCountries.map(c => (
                    <td key={c.id} className="py-3 px-4 font-mono tabular-nums text-slate-700">
                      ${c.costOfLiving.rent1BedCenterUSD} / mo
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="py-3 px-4 font-medium text-slate-900">Rent (Outside Center)</td>
                  {comparedCountries.map(c => (
                    <td key={c.id} className="py-3 px-4 font-mono tabular-nums text-slate-700">
                      ${c.costOfLiving.rent1BedOutsideUSD} / mo
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="py-3 px-4 font-medium text-slate-900">Meal (Inexpensive Diner)</td>
                  {comparedCountries.map(c => (
                    <td key={c.id} className="py-3 px-4 font-mono tabular-nums text-slate-700">
                      ${c.costOfLiving.mealInexpensiveUSD.toFixed(2)}
                    </td>
                  ))}
                </tr>

                {/* Section: Visa & Immigration */}
                <tr className="bg-purple-50/40 font-semibold text-slate-700">
                  <td colSpan={comparedCountries.length + 1} className="py-2.5 px-4 uppercase text-[11px] tracking-wider text-purple-950 font-bold">
                    Visa & Legal Framework
                  </td>
                </tr>

                <tr>
                  <td className="py-3 px-4 font-medium text-slate-900">Retirement Visa Name</td>
                  {comparedCountries.map(c => (
                    <td key={c.id} className="py-3 px-4 font-medium text-slate-800">
                      {c.visa.retirementVisaName}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="py-3 px-4 font-medium text-slate-900">Min. Monthly Income Required</td>
                  {comparedCountries.map(c => (
                    <td key={c.id} className="py-3 px-4 font-mono tabular-nums font-bold text-slate-900">
                      ${c.visa.minimumIncomeUSD.toLocaleString()} / mo
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="py-3 px-4 font-medium text-slate-900">Processing Timeline</td>
                  {comparedCountries.map(c => (
                    <td key={c.id} className="py-3 px-4 font-mono tabular-nums text-slate-700">
                      ~{c.visa.processingMonths} months
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="py-3 px-4 font-medium text-slate-900">Pathway to Permanent Residency</td>
                  {comparedCountries.map(c => (
                    <td key={c.id} className="py-3 px-4 text-slate-700">
                      {c.visa.pathwayToPR}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="py-3 px-4 font-medium text-slate-900">Tax Treatment on Foreign Pension</td>
                  {comparedCountries.map(c => (
                    <td key={c.id} className="py-3 px-4 text-xs text-slate-600 leading-relaxed">
                      {c.visa.taxStatus}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="py-3 px-4 font-medium text-slate-900">
                    <div>
                      <span>Short-Stay & Trial Visas</span>
                      <span className="block text-[10px] text-slate-400 font-normal">Snowbirding & Scouting</span>
                    </div>
                  </td>
                  {comparedCountries.map(c => {
                    const shorts = SHORT_TERM_VISA_DATABASE[c.id] || [];
                    return (
                      <td key={c.id} className="py-3 px-4 text-xs text-slate-700 leading-relaxed align-top">
                        <ul className="space-y-1">
                          {shorts.map(s => (
                            <li key={s.id} className="text-[11px] leading-snug">
                              <span className="font-semibold text-slate-900 block">{s.name}</span>
                              <span className="text-slate-500 font-mono text-[10px]">{s.duration}</span>
                            </li>
                          ))}
                        </ul>
                      </td>
                    );
                  })}
                </tr>

                {/* Section: Healthcare & Quality of Life */}
                <tr className="bg-orange-50/40 font-semibold text-slate-700">
                  <td colSpan={comparedCountries.length + 1} className="py-2.5 px-4 uppercase text-[11px] tracking-wider text-orange-950 font-bold">
                    Healthcare & Safety
                  </td>
                </tr>

                <tr>
                  <td className="py-3 px-4 font-medium text-slate-900">Healthcare Quality Index</td>
                  {comparedCountries.map(c => (
                    <td key={c.id} className="py-3 px-4 font-mono tabular-nums font-bold text-purple-700">
                      {c.lifestyle.healthcareScore} / 100
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="py-3 px-4 font-medium text-slate-900">Private Health Insurance</td>
                  {comparedCountries.map(c => (
                    <td key={c.id} className="py-3 px-4 font-mono tabular-nums text-slate-700">
                      ~${c.costOfLiving.healthcareMonthlyUSD} / mo
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="py-3 px-4 font-medium text-slate-900">Public Healthcare Access</td>
                  {comparedCountries.map(c => (
                    <td key={c.id} className="py-3 px-4 text-xs text-slate-600">
                      {c.lifestyle.publicHealthcareAccess}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="py-3 px-4 font-medium text-slate-900">Safety Index</td>
                  {comparedCountries.map(c => (
                    <td key={c.id} className="py-3 px-4 font-mono tabular-nums font-semibold text-slate-800">
                      {c.lifestyle.safetyScore} / 100
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="py-3 px-4 font-medium text-slate-900">English Proficiency</td>
                  {comparedCountries.map(c => (
                    <td key={c.id} className="py-3 px-4 font-semibold text-slate-700">
                      {c.lifestyle.englishProficiency}
                    </td>
                  ))}
                </tr>

                {/* Section: Climate */}
                <tr className="bg-amber-50/40 font-semibold text-slate-700">
                  <td colSpan={comparedCountries.length + 1} className="py-2.5 px-4 uppercase text-[11px] tracking-wider text-amber-950 font-bold">
                    Climate & Weather
                  </td>
                </tr>

                <tr>
                  <td className="py-3 px-4 font-medium text-slate-900">Climate Category</td>
                  {comparedCountries.map(c => (
                    <td key={c.id} className="py-3 px-4 text-slate-800 font-medium">
                      {c.climate.category}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="py-3 px-4 font-medium text-slate-900">Annual Sunny Days</td>
                  {comparedCountries.map(c => (
                    <td key={c.id} className="py-3 px-4 font-mono tabular-nums font-bold text-amber-700">
                      {c.climate.annualSunnyDays} days
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="py-3 px-4 font-medium text-slate-900">Average Temperature</td>
                  {comparedCountries.map(c => (
                    <td key={c.id} className="py-3 px-4 font-mono tabular-nums text-slate-800">
                      {c.climate.averageTempC}°C ({Math.round((c.climate.averageTempC * 9)/5 + 32)}°F)
                    </td>
                  ))}
                </tr>

                {/* Section: Demographics & Lifestyle */}
                <tr className="bg-purple-50/40 font-semibold text-slate-700">
                  <td colSpan={comparedCountries.length + 1} className="py-2.5 px-4 uppercase text-[11px] tracking-wider text-purple-950 font-bold">
                    Demographics & Social Culture
                  </td>
                </tr>

                <tr>
                  <td className="py-3 px-4 font-medium text-slate-900">Median Age</td>
                  {comparedCountries.map(c => (
                    <td key={c.id} className="py-3 px-4 font-mono tabular-nums text-slate-700">
                      {c.demographics.medianAge} years
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="py-3 px-4 font-medium text-slate-900">Females per 100 Males (F:M Ratio)</td>
                  {comparedCountries.map(c => (
                    <td key={c.id} className="py-3 px-4 font-mono tabular-nums font-bold text-purple-700">
                      {c.demographics.femalesPer100Males.toFixed(1)} / 100 ♂ ({(c.demographics.femalesPer100Males / 100).toFixed(2)}:1)
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="py-3 px-4 font-medium text-slate-900">Youth Under 30 Population</td>
                  {comparedCountries.map(c => (
                    <td key={c.id} className="py-3 px-4 font-mono tabular-nums font-semibold text-purple-700">
                      {c.demographics.youngPopulationPercent}%
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="py-3 px-4 font-medium text-slate-900">Dating Openness Rating</td>
                  {comparedCountries.map(c => (
                    <td key={c.id} className="py-3 px-4 font-mono tabular-nums text-slate-800">
                      {c.demographics.datingRating} / 5
                    </td>
                  ))}
                </tr>

                {/* Optional Discreet Lifestyle Section */}
                {discreetLifestyleEnabled && (
                  <>
                    <tr className="bg-amber-50/50 font-semibold text-amber-900">
                      <td colSpan={comparedCountries.length + 1} className="py-2.5 px-4 uppercase text-[11px] tracking-wider">
                        Lifestyle & Adult Entertainment Parameters
                      </td>
                    </tr>

                    <tr>
                      <td className="py-3 px-4 font-medium text-slate-900">Nightlife Vibrancy</td>
                      {comparedCountries.map(c => (
                        <td key={c.id} className="py-3 px-4 font-medium text-slate-800">
                          {c.adultEntertainment.nightlifeVibrancy}
                        </td>
                      ))}
                    </tr>

                    <tr>
                      <td className="py-3 px-4 font-medium text-slate-900">Adult Entertainment Score</td>
                      {comparedCountries.map(c => (
                        <td key={c.id} className="py-3 px-4 font-mono tabular-nums text-slate-800">
                          {c.adultEntertainment.adultEntertainmentScore} / 5
                        </td>
                      ))}
                    </tr>

                    <tr>
                      <td className="py-3 px-4 font-medium text-slate-900">Regulatory Framework</td>
                      {comparedCountries.map(c => (
                        <td key={c.id} className="py-3 px-4 text-xs text-slate-600">
                          {c.adultEntertainment.legalStatus}
                        </td>
                      ))}
                    </tr>
                  </>
                )}

              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
