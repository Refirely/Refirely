import React from 'react';
import { useApp } from '../context/AppContext';
import { Country } from '../types';
import { SHORT_TERM_VISA_DATABASE } from '../data/shortTermVisas';
import { CountryFlag } from './CountryFlag';
import { Plus, X, ArrowRight, Check, Sun, Shield, HeartHandshake, FileCheck, SlidersHorizontal, Scale } from 'lucide-react';

export const CompareStudio: React.FC = () => {
  const {
    countries,
    comparedCountryIds,
    toggleCompareCountry,
    clearComparedCountries,
    navigateToCountry,
    discreetLifestyleEnabled,
    setDiscreetLifestyleEnabled,
  } = useApp();

  const comparedCountries = countries.filter(c => comparedCountryIds.includes(c.id));
  const availableCountriesToAdd = countries.filter(c => !comparedCountryIds.includes(c.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <Scale className="w-6 h-6 text-teal-700" />
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Country Comparison Studio
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Evaluate up to 4 retirement destinations side-by-side across 20+ empirical parameters.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setDiscreetLifestyleEnabled(!discreetLifestyleEnabled)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 ${
              discreetLifestyleEnabled
                ? 'bg-amber-500 text-slate-950 border-amber-400'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Lifestyle Metrics: {discreetLifestyleEnabled ? 'ON' : 'OFF'}</span>
          </button>

          {comparedCountries.length > 0 && (
            <button
              onClick={clearComparedCountries}
              className="text-xs text-slate-500 hover:text-slate-800 underline"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Add country bar if under 4 */}
      {comparedCountries.length < 4 && availableCountriesToAdd.length > 0 && (
        <div className="my-6 p-4 rounded-xl bg-orange-50/70 border border-orange-200 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-medium text-orange-950">
            Select another country to add to the matrix ({comparedCountries.length}/4 selected):
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            {availableCountriesToAdd.slice(0, 6).map(c => (
              <button
                key={c.id}
                onClick={() => toggleCompareCountry(c.id)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-white text-slate-700 hover:text-orange-950 border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors shadow-2xs"
              >
                <CountryFlag countryCode={c.code} countryName={c.name} fallbackEmoji={c.flag} size="sm" />
                <span>{c.name}</span>
                <Plus className="w-3 h-3 text-orange-600 ml-0.5" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {comparedCountries.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200 my-8">
          <Scale className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">No countries in comparison matrix</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
            Select "Compare" on any country card in the directory or pick from the recommended havens below.
          </p>
          <div className="flex justify-center gap-2 flex-wrap">
            {countries.slice(0, 3).map(c => (
              <button
                key={c.id}
                onClick={() => toggleCompareCountry(c.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-800"
              >
                <CountryFlag countryCode={c.code} countryName={c.name} fallbackEmoji={c.flag} size="sm" />
                <span>Add {c.name}</span>
              </button>
            ))}
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
                  {comparedCountries.map(c => (
                    <th key={c.id} className="py-4 px-4 min-w-[210px] align-top">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <CountryFlag countryCode={c.code} countryName={c.name} fallbackEmoji={c.flag} size="lg" className="rounded-xs shadow-xs ring-1 ring-slate-200" />
                          <div>
                            <span className="text-base font-bold text-slate-900 block leading-tight">
                              {c.name}
                            </span>
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
                  ))}
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
