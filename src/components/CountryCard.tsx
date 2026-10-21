import React from 'react';
import { Country } from '../types';
import { useApp } from '../context/AppContext';
import { CountryThumbnail } from './CountryThumbnail';
import { generateCountryDossierPdf } from '../utils/exportCountryDossierPdf';
import { Sun, Heart, ShieldCheck, ArrowRight, Check, Download } from 'lucide-react';

interface CountryCardProps {
  country: Country;
}

export const CountryCard: React.FC<CountryCardProps> = ({ country }) => {
  const {
    navigateToCountry,
    isCountrySaved,
    toggleSaveCountry,
    isCountryCompared,
    toggleCompareCountry,
    discreetLifestyleEnabled,
    threads,
    meetups,
    journalEntries,
    userProfile,
    isAuthenticated,
  } = useApp();

  const saved = isCountrySaved(country.id);
  const compared = isCountryCompared(country.id);

  const handleQuickExportPdf = (e: React.MouseEvent) => {
    e.stopPropagation();
    generateCountryDossierPdf({
      country,
      userProfile,
      isAuthenticated,
      journalEntry: journalEntries[country.id],
      threads: threads.filter(t => t.countryId === country.id),
      meetups: meetups.filter(m => m.countryId === country.id),
      options: {
        includeExecutiveSummary: true,
        includePersonalReadinessAndJournal: true,
        includeVisaAndLegal: true,
        includeShortTermVisas: true,
        includeCostAndBudget: true,
        includeClimateAndTowns: true,
        includeDemographicsAndLifestyle: true,
        includeDiscreetNightlife: discreetLifestyleEnabled,
        includeRelocationFaqs: true,
        includeCommunityAndMeetups: true,
      },
    });
  };

  return (
    <article className="group bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-all shadow-xs hover:shadow-md flex flex-col justify-between overflow-hidden">
      
      <div>
        {/* Scenic Destination Thumbnail & Background Header */}
        <div
          onClick={() => navigateToCountry(country.id)}
          className="cursor-pointer relative"
        >
          <CountryThumbnail country={country} className="h-44 sm:h-48">
            {/* Save Action Button Top-Right */}
            <div className="absolute top-2.5 right-2.5 z-10">
              <button
                onClick={e => {
                  e.stopPropagation();
                  toggleSaveCountry(country.id);
                }}
                className={`p-2 rounded-lg backdrop-blur-xs transition-colors ${
                  saved
                    ? 'text-rose-400 bg-slate-950/65 hover:bg-slate-950/80'
                    : 'text-white/85 bg-slate-950/45 hover:text-rose-400 hover:bg-slate-950/70'
                }`}
                title={saved ? 'Remove from saved shortlist' : 'Save country to shortlist'}
                aria-label={`Save ${country.name}`}
              >
                <Heart className={`w-4 h-4 ${saved ? 'fill-rose-500 text-rose-500' : ''}`} />
              </button>
            </div>

            {/* Bottom-Left Country Title & Clean Unboxed Metadata over Measured Scrim */}
            <div className="absolute bottom-3.5 left-4 right-4 flex items-end justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-3xl leading-none drop-shadow-xs shrink-0" role="img" aria-label={country.name}>
                  {country.flag}
                </span>
                <div className="min-w-0">
                  <h3 className="text-xl font-bold text-white group-hover:text-orange-300 transition-colors tracking-wide truncate">
                    {country.name}
                  </h3>
                  {/* Clean unboxed metadata with typographic separators */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-200/90 mt-0.5 truncate">
                    <span>{country.region}</span>
                    <span aria-hidden="true">·</span>
                    <span>{country.climate.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{country.capital}</span>
                  </div>
                </div>
              </div>
            </div>
          </CountryThumbnail>
        </div>

        {/* Card Body */}
        <div className="p-5 pb-4">
          {/* Tagline */}
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
            {country.tagline}
          </p>

          {/* Empirical Metrics Matrix (Clean tabular numerals) */}
          <div className="grid grid-cols-2 gap-2.5 py-3 border-y border-slate-100 text-xs">
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Monthly Living (Single)</div>
              <div className="font-mono tabular-nums text-slate-900 font-bold text-base mt-0.5">
                ${country.costOfLiving.monthlyBudgetSingleUSD.toLocaleString()}
                <span className="text-[11px] font-sans font-normal text-slate-400 ml-1">/mo</span>
              </div>
            </div>

            <div>
              <div className="text-[11px] text-slate-400 font-medium">Healthcare Tier</div>
              <div className="font-mono tabular-nums text-purple-700 font-bold text-base mt-0.5 flex items-center gap-1">
                <span>{country.lifestyle.healthcareScore}/100</span>
                <span className="text-[11px] font-sans font-normal text-slate-400">Score</span>
              </div>
            </div>

            <div>
              <div className="text-[11px] text-slate-400 font-medium">Annual Sunshine</div>
              <div className="font-mono tabular-nums text-slate-800 font-semibold mt-0.5 flex items-center gap-1">
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>{country.climate.annualSunnyDays} days</span>
              </div>
            </div>

            <div>
              <div className="text-[11px] text-slate-400 font-medium">Safety Score</div>
              <div className="font-mono tabular-nums text-slate-800 font-semibold mt-0.5 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>{country.lifestyle.safetyScore}/100</span>
              </div>
            </div>
          </div>

          {/* Visa & Requirements highlight */}
          <div className="mt-3.5 space-y-1.5">
            <div className="flex items-baseline justify-between text-xs">
              <span className="text-slate-500 font-medium truncate max-w-[170px]" title={country.visa.retirementVisaName}>
                {country.visa.retirementVisaName}
              </span>
              <span className="font-mono tabular-nums text-slate-700 font-semibold shrink-0">
                Min. ${country.visa.minimumIncomeUSD}/mo
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Process: ~{country.visa.processingMonths} mos</span>
              <span>English: {country.lifestyle.englishProficiency}</span>
            </div>

            {/* Demographic Gender Ratio (Females per 100 Males) */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Females per 100 Males</span>
              <span className="font-mono tabular-nums text-slate-800 font-semibold">
                {country.demographics.femalesPer100Males.toFixed(1)} <span className="text-slate-400 font-normal">/ 100 ♂</span>
                <span className="text-[11px] text-orange-700 font-medium ml-1.5">
                  ({(country.demographics.femalesPer100Males / 100).toFixed(2)}:1)
                </span>
              </span>
            </div>
          </div>

          {/* Optional Discreet Lifestyle & Nightlife summary */}
          {discreetLifestyleEnabled && (
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs bg-slate-50/70 -mx-5 px-5 py-2">
              <div>
                <span className="text-slate-400 text-[10px] block">Nightlife & Social</span>
                <span className="font-medium text-slate-700">{country.adultEntertainment.nightlifeVibrancy}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 text-[10px] block">Youth Under 30</span>
                <span className="font-mono tabular-nums font-semibold text-slate-700">{country.demographics.youngPopulationPercent}%</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Card Footer: Compare selector, Quick PDF Export & Dossier CTA */}
      <div className="px-5 py-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
        {/* Compare Checkbox */}
        <button
          onClick={() => toggleCompareCountry(country.id)}
          className={`flex items-center gap-1.5 text-xs font-medium py-1 px-2 rounded-md transition-colors ${
            compared
              ? 'bg-orange-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
          title="Compare side-by-side with other countries"
        >
          <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
            compared ? 'border-orange-600 bg-orange-600 text-white' : 'border-slate-400'
          }`}>
            {compared && <Check className="w-2.5 h-2.5 stroke-[3]" />}
          </div>
          <span className="whitespace-nowrap">Compare</span>
        </button>

        <div className="flex items-center gap-1.5">
          {/* Quick Export Full Country Dossier PDF */}
          <button
            onClick={handleQuickExportPdf}
            className="inline-flex items-center gap-1 text-xs font-semibold text-purple-800 hover:text-purple-950 bg-purple-50 hover:bg-purple-100/80 border border-purple-200/80 transition-colors py-1 px-2 rounded-md whitespace-nowrap cursor-pointer"
            title={`Download complete ${country.name} retirement dossier PDF`}
          >
            <Download className="w-3 h-3 text-purple-700" />
            <span>PDF</span>
          </button>

          {/* Deep Dive Page CTA */}
          <button
            onClick={() => navigateToCountry(country.id)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-orange-700 hover:text-orange-950 transition-colors py-1 px-2 rounded-md hover:bg-orange-50 whitespace-nowrap"
          >
            <span>Explore Dossier</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

    </article>
  );
};
