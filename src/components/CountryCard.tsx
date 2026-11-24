import React from 'react';
import { motion } from 'motion/react';
import { Country } from '../types';
import { useApp } from '../context/AppContext';
import { CountryThumbnail } from './CountryThumbnail';
import { CountryFlag } from './CountryFlag';
import { generateCountryDossierPdf } from '../utils/exportCountryDossierPdf';
import { getCountryTravelLeisureScore, getCountryTravelMobility } from '../data/countryTravelMobility';
import { getCountryUrl } from '../utils/seo';
import {
  Sun,
  Heart,
  ShieldCheck,
  ArrowRight,
  Check,
  Download,
  Compass,
  HeartPulse,
  Wallet,
  Sparkles,
  FileBadge,
  Users,
  Wifi,
  Laptop,
  Flame,
} from 'lucide-react';
import { getCountryNomadProfile } from '../data/countryNomadProfiles';

interface CountryCardProps {
  country: Country;
  index?: number;
}

export const CountryCard: React.FC<CountryCardProps> = ({ country, index = 0 }) => {
  const {
    navigateToCountry,
    isCountrySaved,
    toggleSaveCountry,
    isCountryCompared,
    toggleCompareCountry,
    sortBy,
    threads,
    meetups,
    journalEntries,
    userProfile,
    isAuthenticated,
    budgetMax,
    trackDossierDownload,
    currentPersona,
  } = useApp();

  const saved = isCountrySaved(country.id);
  const compared = isCountryCompared(country.id);
  const travelLeisureScore = getCountryTravelLeisureScore(country);
  const mobility = getCountryTravelMobility(country);
  const countryUrl = getCountryUrl(country.id);
  const nomadProfile = getCountryNomadProfile(country);
  const retireeFireNestEgg = Math.round(country.costOfLiving.monthlyBudgetCoupleUSD * 12 * 25);
  const isCoupleUnderFilter = country.costOfLiving.monthlyBudgetCoupleUSD <= budgetMax;

  const handleSpaCountryClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    navigateToCountry(country.id);
  };

  const handleQuickExportPdf = (e: React.MouseEvent) => {
    e.stopPropagation();
    trackDossierDownload(country.id, country.name, 'Quick Country Card Dossier');
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
        includeHealthcareAndInsurance: true,
        includeCostAndBudget: true,
        includeHousingAndRentals: true,
        includeFIREModeling: true,
        includeFoodAndGastronomy: true,
        includeTravelAndMobility: true,
        includeClimateAndTowns: true,
        includeDemographicsAndLifestyle: true,
        includeDiscreetNightlife: true,
        includeRelocationFaqs: true,
        includeCommunityAndMeetups: true,
      },
    });
  };

  // Clean, understated secondary metric line that adapts to active sort without loud boxes
  const renderKeySummaryRow = () => {
    if (sortBy === 'travel-leisure-desc') {
      return (
        <div className="flex items-center justify-between gap-2 text-[11px] text-slate-600 pt-1.5 border-t border-slate-100">
          <span className="flex items-center gap-1 font-medium text-slate-600 truncate">
            <Compass className="w-3 h-3 text-teal-600 shrink-0" />
            <span>Travel &amp; Leisure</span>
          </span>
          <span className="font-mono tabular-nums font-semibold text-slate-800 shrink-0">
            {travelLeisureScore}/100{' '}
            <span className="text-[10px] font-sans font-normal text-slate-500">
              · Transit {mobility.domesticTransit.publicTransitScore}
            </span>
          </span>
        </div>
      );
    }

    if (sortBy === 'dating-nightlife-desc') {
      return (
        <div className="flex items-center justify-between gap-2 text-[11px] text-slate-600 pt-1.5 border-t border-slate-100">
          <span className="flex items-center gap-1 font-medium text-slate-600 truncate">
            <Sparkles className="w-3 h-3 text-slate-500 shrink-0" />
            <span>Dating &amp; Nightlife</span>
          </span>
          <span className="font-mono tabular-nums font-semibold text-slate-800 shrink-0">
            {country.demographics.datingRating}/5 · Night {country.adultEntertainment.nightlifeScore}/5
          </span>
        </div>
      );
    }

    if (sortBy === 'female-ratio-desc') {
      return (
        <div className="flex items-center justify-between gap-2 text-[11px] text-slate-600 pt-1.5 border-t border-slate-100">
          <span className="flex items-center gap-1 font-medium text-slate-600 truncate">
            <Users className="w-3 h-3 text-slate-500 shrink-0" />
            <span>Female Ratio</span>
          </span>
          <span className="font-mono tabular-nums font-semibold text-slate-800 shrink-0">
            {country.demographics.femalesPer100Males.toFixed(1)}♀ : 100♂
          </span>
        </div>
      );
    }

    if (
      currentPersona === 'nomad' ||
      sortBy === 'coworking-friendly' ||
      sortBy === 'internet-speed-desc' ||
      sortBy === 'dnv-friendly' ||
      sortBy === 'nomad-burn-asc'
    ) {
      return (
        <div className="flex items-center justify-between gap-2 text-[11px] text-slate-600 pt-1.5 border-t border-slate-100">
          <span className="flex items-center gap-1 font-medium text-slate-600 min-w-0 truncate">
            <Wifi className="w-3 h-3 text-teal-600 shrink-0" />
            <span className="truncate">
              {nomadProfile.verifiedInternetMbps} Mbps · {nomadProfile.coworkingDensity.split(' ')[0]}
            </span>
          </span>
          <span className="font-mono tabular-nums font-semibold text-slate-800 shrink-0">
            6m ${(nomadProfile.sixMonthRunwayUSD / 1000).toFixed(0)}k
          </span>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-between gap-2 text-[11px] text-slate-600 pt-1.5 border-t border-slate-100">
        <span className="flex items-center gap-1 font-medium text-slate-600 min-w-0 truncate">
          <Flame className="w-3 h-3 text-amber-600 shrink-0" />
          <span className="truncate">
            FIRE 25x{' '}
            <strong className="font-mono tabular-nums text-slate-900">
              ${(retireeFireNestEgg / 1000).toFixed(0)}k
            </strong>
          </span>
        </span>
        <span className="text-[10px] font-medium text-slate-500 shrink-0 whitespace-nowrap">
          ~{country.visa.processingMonths}m · {country.lifestyle.englishProficiency} EN
        </span>
      </div>
    );
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{
        duration: 0.22,
        ease: [0.16, 1, 0.3, 1],
        delay: Math.min(index * 0.015, 0.16),
      }}
      whileHover={{ y: -3 }}
      className="group relative bg-white rounded-xl border border-slate-200/90 hover:border-slate-300 transition-all shadow-2xs hover:shadow-md flex flex-col justify-between overflow-hidden"
    >
      <div>
        {/* Compact 4-Across Scenic Destination Header */}
        <div
          onClick={() => navigateToCountry(country.id)}
          className="cursor-pointer relative overflow-hidden"
        >
          <CountryThumbnail
            country={country}
            className="h-28 sm:h-32 transition-transform duration-500 ease-out group-hover:scale-105"
          >
            {/* Quiet Scrim Metadata Top-Left */}
            <div className="absolute top-2 left-2.5 right-10 z-10 flex items-center gap-1.5 text-[10px] font-medium text-white/90 drop-shadow-xs truncate">
              <span className="px-1.5 py-0.5 rounded bg-slate-950/60 backdrop-blur-xs truncate">
                {country.region} · {country.climate.category}
              </span>
            </div>

            {/* Save Button Top-Right */}
            <div className="absolute top-2 right-2 z-10">
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  toggleSaveCountry(country.id);
                }}
                className={`p-1.5 rounded-full backdrop-blur-xs transition-colors cursor-pointer ${
                  saved
                    ? 'bg-rose-600 text-white'
                    : 'text-white/90 bg-slate-950/50 hover:text-white hover:bg-rose-600/90'
                }`}
                title={saved ? 'Remove from saved shortlist' : 'Save country to shortlist'}
                aria-label={`Save ${country.name}`}
              >
                <Heart className={`w-3.5 h-3.5 ${saved ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Bottom-Left Flag, Country Name & Capital */}
            <div className="absolute bottom-2 left-2.5 right-2.5 flex items-end gap-2">
              <CountryFlag
                countryCode={country.code}
                countryName={country.name}
                fallbackEmoji={country.flag}
                size="md"
                className="w-7 h-5 rounded-xs shadow-sm shrink-0 ring-1 ring-white/25"
              />
              <div className="min-w-0 flex-1">
                <h3 className="text-[15px] font-bold text-white group-hover:text-amber-100 transition-colors tracking-tight truncate drop-shadow-xs leading-tight">
                  <a
                    href={countryUrl}
                    onClick={handleSpaCountryClick}
                    className="focus:outline-none"
                  >
                    {country.name}
                  </a>
                </h3>
                <p className="text-[11px] text-slate-200/95 truncate font-normal leading-tight mt-0.5">
                  {country.capital}
                </p>
              </div>
            </div>
          </CountryThumbnail>
        </div>

        {/* Clean, Restrained Card Body */}
        <div className="p-3 pb-2.5 space-y-2.5">
          {/* Crisp 1-Line Tagline */}
          <p className="text-[11px] text-slate-500 line-clamp-1 leading-snug">
            {country.tagline}
          </p>

          {/* Clean Matte 2x2 Parameter Grid (Zero Shiny Gradients) */}
          <div className="grid grid-cols-2 gap-1.5">
            {/* Metric 1: Monthly Cost */}
            {currentPersona === 'retiree' ? (
              <div className="px-2 py-1.5 rounded-lg bg-slate-50/90 border border-slate-200/75">
                <div className="flex items-center justify-between text-[10px] font-medium text-slate-500">
                  <span>Cost / mo</span>
                  <Wallet
                    className={`w-3 h-3 shrink-0 ${
                      isCoupleUnderFilter ? 'text-emerald-600' : 'text-amber-600'
                    }`}
                  />
                </div>
                <div className="font-mono tabular-nums text-slate-900 font-bold text-xs mt-0.5 truncate">
                  ${country.costOfLiving.monthlyBudgetSingleUSD.toLocaleString()}
                  <span className="text-slate-400 font-normal mx-0.5">/</span>
                  ${country.costOfLiving.monthlyBudgetCoupleUSD.toLocaleString()}
                </div>
              </div>
            ) : (
              <div className="px-2 py-1.5 rounded-lg bg-slate-50/90 border border-slate-200/75">
                <div className="flex items-center justify-between text-[10px] font-medium text-slate-500">
                  <span>Nomad Burn</span>
                  <Flame className="w-3 h-3 text-amber-600 shrink-0" />
                </div>
                <div className="font-mono tabular-nums text-slate-900 font-bold text-xs mt-0.5">
                  ${nomadProfile.monthlyNomadBurnUSD.toLocaleString()}
                  <span className="text-[10px] font-sans font-normal text-slate-400">/mo</span>
                </div>
              </div>
            )}

            {/* Metric 2: Healthcare */}
            <div className="px-2 py-1.5 rounded-lg bg-slate-50/90 border border-slate-200/75">
              <div className="flex items-center justify-between text-[10px] font-medium text-slate-500">
                <span>Healthcare</span>
                <HeartPulse className="w-3 h-3 text-rose-500 shrink-0" />
              </div>
              <div className="font-mono tabular-nums text-slate-900 font-bold text-xs mt-0.5">
                {country.lifestyle.healthcareScore}
                <span className="text-slate-400 font-normal text-[10px]">/100</span>
              </div>
            </div>

            {/* Metric 3: Sunshine */}
            <div className="px-2 py-1.5 rounded-lg bg-slate-50/90 border border-slate-200/75">
              <div className="flex items-center justify-between text-[10px] font-medium text-slate-500">
                <span>Sunshine</span>
                <Sun className="w-3 h-3 text-amber-500 shrink-0" />
              </div>
              <div className="font-mono tabular-nums text-slate-900 font-bold text-xs mt-0.5">
                {country.climate.annualSunnyDays}
                <span className="text-slate-400 font-sans font-normal text-[10px] ml-0.5">days</span>
              </div>
            </div>

            {/* Metric 4: Safety */}
            <div className="px-2 py-1.5 rounded-lg bg-slate-50/90 border border-slate-200/75">
              <div className="flex items-center justify-between text-[10px] font-medium text-slate-500">
                <span>Safety</span>
                <ShieldCheck className="w-3 h-3 text-indigo-600 shrink-0" />
              </div>
              <div className="font-mono tabular-nums text-slate-900 font-bold text-xs mt-0.5">
                {country.lifestyle.safetyScore}
                <span className="text-slate-400 font-normal text-[10px]">/100</span>
              </div>
            </div>
          </div>

          {/* Clean Visa Pathway & Income Row */}
          <div className="space-y-1.5 pt-0.5">
            {currentPersona === 'retiree' ? (
              <div className="flex items-center justify-between gap-2 text-[11px]">
                <div className="flex items-center gap-1.5 min-w-0">
                  <FileBadge className="w-3 h-3 text-teal-600 shrink-0" />
                  <span
                    className="text-slate-700 font-semibold truncate"
                    title={country.visa.retirementVisaName}
                  >
                    {country.visa.retirementVisaName}
                  </span>
                </div>
                <span className="font-mono tabular-nums text-slate-900 font-bold shrink-0">
                  ${country.visa.minimumIncomeUSD.toLocaleString()}/m
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-2 text-[11px]">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Laptop className="w-3 h-3 text-indigo-600 shrink-0" />
                  <span
                    className="text-slate-700 font-semibold truncate"
                    title={nomadProfile.remoteWorkVisaName}
                  >
                    {nomadProfile.remoteWorkVisaName}
                  </span>
                </div>
                <span className="font-mono tabular-nums text-slate-900 font-bold shrink-0">
                  {nomadProfile.remoteWorkVisaIncomeUSD > 0
                    ? `$${nomadProfile.remoteWorkVisaIncomeUSD.toLocaleString()}/m`
                    : 'No Min'}
                </span>
              </div>
            )}

            {/* Concise Secondary Highlight Row */}
            {renderKeySummaryRow()}
          </div>
        </div>
      </div>

      {/* Crisp Compact Footer Fitted for 4-Across */}
      <div className="px-3 py-2 bg-slate-50/75 border-t border-slate-100 flex items-center justify-between gap-1.5">
        <button
          type="button"
          onClick={() => toggleCompareCountry(country.id)}
          className={`flex items-center gap-1 text-[11px] font-semibold py-1 px-2 rounded-lg transition-colors cursor-pointer border whitespace-nowrap shrink-0 ${
            compared
              ? 'bg-amber-600 text-white border-amber-600'
              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-900'
          }`}
          title="Compare side-by-side with other countries"
        >
          <span
            className={`w-3 h-3 rounded-xs flex items-center justify-center border ${
              compared ? 'border-white/80 bg-white/20 text-white' : 'border-slate-300'
            }`}
          >
            {compared && <Check className="w-2 h-2 stroke-[3]" />}
          </span>
          <span>{compared ? 'Added' : 'Compare'}</span>
        </button>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleQuickExportPdf}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 transition-colors py-1 px-2 rounded-lg whitespace-nowrap cursor-pointer"
            title={`Download complete 35-page ${country.name} master retirement dossier PDF`}
          >
            <Download className="w-3 h-3 text-slate-500" />
            <span>PDF</span>
          </button>

          <a
            href={countryUrl}
            onClick={handleSpaCountryClick}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-white bg-slate-900 hover:bg-indigo-700 transition-colors py-1 px-2.5 rounded-lg whitespace-nowrap shrink-0"
          >
            <span>Dossier</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>
      </div>
    </motion.article>
  );
};
