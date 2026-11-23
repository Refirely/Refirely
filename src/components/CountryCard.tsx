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

const CARD_ACCENT_THEMES = [
  {
    topBar: 'from-emerald-500 via-teal-500 to-cyan-500',
    borderHover: 'hover:border-teal-300 hover:shadow-teal-950/10',
    regionPill: 'bg-teal-950/80 text-teal-200 border-teal-400/30',
    ctaBtn: 'from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 shadow-teal-600/15',
  },
  {
    topBar: 'from-indigo-500 via-violet-500 to-purple-500',
    borderHover: 'hover:border-indigo-300 hover:shadow-indigo-950/10',
    regionPill: 'bg-indigo-950/80 text-indigo-200 border-indigo-400/30',
    ctaBtn: 'from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-indigo-600/15',
  },
  {
    topBar: 'from-amber-500 via-orange-500 to-rose-500',
    borderHover: 'hover:border-amber-300 hover:shadow-amber-950/10',
    regionPill: 'bg-amber-950/80 text-amber-200 border-amber-400/30',
    ctaBtn: 'from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-orange-600/15',
  },
  {
    topBar: 'from-teal-500 via-indigo-500 to-amber-500',
    borderHover: 'hover:border-violet-300 hover:shadow-violet-950/10',
    regionPill: 'bg-violet-950/80 text-violet-200 border-violet-400/30',
    ctaBtn: 'from-indigo-600 via-teal-600 to-emerald-600 hover:from-indigo-700 hover:to-emerald-700 shadow-indigo-600/15',
  },
];

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

  // Pick a deterministic multi-colored theme based on index or country id
  const fallbackHash = country.id.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const themeIndex = typeof index === 'number' ? index : fallbackHash;
  const theme = CARD_ACCENT_THEMES[themeIndex % CARD_ACCENT_THEMES.length];

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

  // Single compact dynamic highlight row so card height stays sleek and >=35% shorter
  const renderCompactHighlightRow = () => {
    if (sortBy === 'travel-leisure-desc') {
      return (
        <div className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-50/90 to-teal-50/70 border border-emerald-200/80 flex items-center justify-between gap-2 text-[11px]">
          <span className="font-bold text-emerald-900 flex items-center gap-1.5 truncate">
            <Compass className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Travel &amp; Leisure</span>
          </span>
          <span className="font-mono tabular-nums font-extrabold text-emerald-950 shrink-0">
            {travelLeisureScore}/100{' '}
            <span className="text-[10px] font-sans font-semibold text-emerald-700">
              · Transit {mobility.domesticTransit.publicTransitScore} · Solo ♀ {mobility.soloFemale.femaleSafetyScore}
            </span>
          </span>
        </div>
      );
    }

    if (sortBy === 'dating-nightlife-desc') {
      const avgScore = ((country.demographics.datingRating + country.adultEntertainment.nightlifeScore) / 2).toFixed(1);
      return (
        <div className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-violet-50/90 to-fuchsia-50/70 border border-violet-200/80 flex items-center justify-between gap-2 text-[11px]">
          <span className="font-bold text-violet-900 flex items-center gap-1.5 truncate">
            <Sparkles className="w-3.5 h-3.5 text-purple-600 shrink-0" />
            <span className="truncate">Dating {country.demographics.datingRating}/5 · Night {country.adultEntertainment.nightlifeScore}/5</span>
          </span>
          <span className="font-mono tabular-nums font-extrabold text-purple-950 bg-white/90 border border-purple-200 px-1.5 py-0.5 rounded-md text-[10px] shrink-0">
            {avgScore}/5 Avg
          </span>
        </div>
      );
    }

    if (sortBy === 'female-ratio-desc') {
      return (
        <div className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-50/90 to-amber-50/70 border border-rose-200/80 flex items-center justify-between gap-2 text-[11px]">
          <span className="font-bold text-rose-900 flex items-center gap-1.5 truncate">
            <Users className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            <span>Female Ratio</span>
          </span>
          <span className="font-mono tabular-nums font-extrabold text-rose-950 shrink-0">
            {country.demographics.femalesPer100Males.toFixed(1)}♀ : 100♂{' '}
            <span className="text-[10px] font-sans font-semibold text-rose-700">
              · Dating {country.demographics.datingRating}/5
            </span>
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
        <div className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-teal-50/85 via-sky-50/60 to-white border border-teal-200/80 flex items-center justify-between gap-2 text-[11px]">
          <span className="font-bold text-slate-800 flex items-center gap-1.5 min-w-0 truncate">
            <Wifi className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span className="truncate">
              {nomadProfile.verifiedInternetMbps} Mbps · {nomadProfile.coworkingDensity.split(' ')[0]} Hub
            </span>
          </span>
          <span className="font-mono tabular-nums font-extrabold text-teal-950 bg-white border border-teal-200/90 px-1.5 py-0.5 rounded-md text-[10px] shrink-0">
            6-Mo ${(nomadProfile.sixMonthRunwayUSD / 1000).toFixed(0)}k
          </span>
        </div>
      );
    }

    // Default Retiree concise key line: FIRE 25x Nest Egg + Approval time + English
    return (
      <div className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-50/85 via-orange-50/50 to-white border border-amber-200/80 flex items-center justify-between gap-2 text-[11px]">
        <span className="font-bold text-slate-800 flex items-center gap-1.5 min-w-0 truncate">
          <Flame className="w-3.5 h-3.5 text-orange-600 shrink-0" />
          <span className="truncate">
            FIRE 25x:{' '}
            <strong className="font-mono tabular-nums text-orange-950">
              ${(retireeFireNestEgg / 1000).toFixed(0)}k
            </strong>
          </span>
        </span>
        <span className="text-[10px] font-semibold text-slate-600 shrink-0 whitespace-nowrap">
          ~{country.visa.processingMonths}m visa · <strong className="text-indigo-700">{country.lifestyle.englishProficiency} EN</strong>
        </span>
      </div>
    );
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 26,
        delay: Math.min(index * 0.02, 0.2),
      }}
      whileHover={{ y: -4 }}
      className={`group relative bg-white rounded-2xl border border-slate-200/90 ${theme.borderHover} transition-shadow shadow-sm hover:shadow-lg flex flex-col justify-between overflow-hidden`}
    >
      {/* Top Multi-Colored Gradient Accent Ribbon */}
      <div className={`h-1 w-full bg-gradient-to-r ${theme.topBar}`} />

      <div>
        {/* Compact Scenic Destination Thumbnail */}
        <div
          onClick={() => navigateToCountry(country.id)}
          className="cursor-pointer relative overflow-hidden"
        >
          <CountryThumbnail
            country={country}
            className="h-32 sm:h-36 transition-transform duration-700 ease-out group-hover:scale-105"
          >
            {/* Top-Left Region & Climate Badges */}
            <div className="absolute top-2.5 left-2.5 z-10 flex flex-wrap items-center gap-1">
              <span
                className={`px-2 py-0.5 rounded-full backdrop-blur-md text-[10px] font-bold border shadow-2xs ${theme.regionPill}`}
              >
                {country.region}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-slate-950/70 backdrop-blur-md text-amber-300 border border-amber-400/25 text-[10px] font-semibold flex items-center gap-1 shadow-2xs">
                <Sun className="w-2.5 h-2.5 text-amber-400" />
                <span>{country.climate.category}</span>
              </span>
            </div>

            {/* Save Action Button Top-Right */}
            <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1">
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.9 }}
                onClick={e => {
                  e.stopPropagation();
                  toggleSaveCountry(country.id);
                }}
                className={`p-1.5 rounded-full backdrop-blur-md transition-colors cursor-pointer shadow-sm ${
                  saved
                    ? 'bg-rose-500 text-white shadow-rose-500/30'
                    : 'text-white/90 bg-slate-950/55 hover:text-white hover:bg-rose-500/85'
                }`}
                title={saved ? 'Remove from saved shortlist' : 'Save country to shortlist'}
                aria-label={`Save ${country.name}`}
              >
                <Heart className={`w-3.5 h-3.5 ${saved ? 'fill-current' : ''}`} />
              </motion.button>
            </div>

            {/* Bottom-Left Country Title & Key Cost over Scrim */}
            <div className="absolute bottom-2.5 left-3 right-3 flex items-end justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <CountryFlag
                  countryCode={country.code}
                  countryName={country.name}
                  fallbackEmoji={country.flag}
                  size="lg"
                  className="w-8 h-5.5 rounded-sm shadow-md shrink-0 ring-1 ring-white/25"
                />
                <div className="min-w-0">
                  <h3 className="text-lg font-extrabold text-white group-hover:text-amber-200 transition-colors tracking-tight truncate drop-shadow-sm leading-tight">
                    <a
                      href={countryUrl}
                      onClick={handleSpaCountryClick}
                      className="focus:outline-none"
                    >
                      {country.name}
                    </a>
                  </h3>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-200/95 truncate font-medium">
                    <span className="truncate">{country.capital}</span>
                    <span aria-hidden="true">·</span>
                    {currentPersona === 'retiree' ? (
                      <span className="text-emerald-300 font-semibold shrink-0">
                        ${country.costOfLiving.monthlyBudgetCoupleUSD.toLocaleString()}/mo couple
                      </span>
                    ) : (
                      <span className="text-amber-300 font-semibold shrink-0">
                        ${nomadProfile.monthlyNomadBurnUSD.toLocaleString()}/mo · {nomadProfile.verifiedInternetMbps} Mbps
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CountryThumbnail>
        </div>

        {/* Compact High-Signal Card Body */}
        <div className="p-3.5 pb-3 space-y-2.5">
          {/* Crisp 1-Line Tagline */}
          <p className="text-[11px] text-slate-600 line-clamp-1 font-medium">
            {country.tagline}
          </p>

          {/* 4-Color Essential Metrics Matrix */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Tile 1: Monthly Living */}
            {currentPersona === 'retiree' ? (
              <div
                className={`px-2.5 py-1.5 rounded-xl border transition-colors ${
                  isCoupleUnderFilter
                    ? 'bg-gradient-to-br from-emerald-50/90 via-teal-50/45 to-white border-emerald-200/80'
                    : 'bg-gradient-to-br from-amber-50/80 to-white border-amber-200/80'
                }`}
              >
                <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-emerald-800">
                  <span>Single / Couple</span>
                  <Wallet className="w-3 h-3 text-emerald-600 shrink-0" />
                </div>
                <div className="font-mono tabular-nums text-emerald-950 font-extrabold text-[13px] mt-0.5 flex items-baseline gap-1">
                  <span>${country.costOfLiving.monthlyBudgetSingleUSD.toLocaleString()}</span>
                  <span className="text-slate-400 font-normal">/</span>
                  <span className="text-teal-800">${country.costOfLiving.monthlyBudgetCoupleUSD.toLocaleString()}</span>
                </div>
              </div>
            ) : (
              <div className="px-2.5 py-1.5 rounded-xl border bg-gradient-to-br from-amber-50/90 via-orange-50/45 to-white border-amber-200/80">
                <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-amber-800">
                  <span>Nomad Burn</span>
                  <Flame className="w-3 h-3 text-amber-600 shrink-0" />
                </div>
                <div className="font-mono tabular-nums text-amber-950 font-extrabold text-[13px] mt-0.5 flex items-baseline gap-1">
                  <span>${nomadProfile.monthlyNomadBurnUSD.toLocaleString()}</span>
                  <span className="text-[10px] font-sans font-normal text-slate-400">/mo</span>
                </div>
              </div>
            )}

            {/* Tile 2: Healthcare Index */}
            <div className="px-2.5 py-1.5 rounded-xl bg-gradient-to-br from-rose-50/85 via-purple-50/45 to-white border border-rose-200/80">
              <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-rose-800">
                <span>Healthcare</span>
                <HeartPulse className="w-3 h-3 text-rose-500 shrink-0" />
              </div>
              <div className="font-mono tabular-nums text-purple-950 font-extrabold text-[13px] mt-0.5 flex items-baseline gap-1.5">
                <span>{country.lifestyle.healthcareScore}/100</span>
                <span className="text-[9px] font-sans font-bold px-1 py-0.2 rounded bg-rose-100/80 text-rose-800">
                  {country.lifestyle.healthcareScore >= 80 ? 'Premier' : 'Solid'}
                </span>
              </div>
            </div>

            {/* Tile 3: Annual Sunshine */}
            <div className="px-2.5 py-1.5 rounded-xl bg-gradient-to-br from-amber-50/85 via-orange-50/45 to-white border border-amber-200/80">
              <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-amber-800">
                <span>Sunshine</span>
                <Sun className="w-3 h-3 text-amber-500 shrink-0" />
              </div>
              <div className="font-mono tabular-nums text-amber-950 font-extrabold text-[13px] mt-0.5 flex items-baseline gap-1">
                <span>{country.climate.annualSunnyDays}</span>
                <span className="text-[10px] font-sans font-semibold text-amber-800/80">days/yr</span>
              </div>
            </div>

            {/* Tile 4: Safety Score */}
            <div className="px-2.5 py-1.5 rounded-xl bg-gradient-to-br from-indigo-50/85 via-sky-50/45 to-white border border-indigo-200/80">
              <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-indigo-800">
                <span>Safety</span>
                <ShieldCheck className="w-3 h-3 text-indigo-600 shrink-0" />
              </div>
              <div className="font-mono tabular-nums text-indigo-950 font-extrabold text-[13px] mt-0.5 flex items-baseline gap-1.5">
                <span>{country.lifestyle.safetyScore}/100</span>
                <span className="text-[9px] font-sans font-bold px-1 py-0.2 rounded bg-indigo-100/80 text-indigo-800">
                  {country.lifestyle.safetyScore >= 82 ? 'High' : 'Verified'}
                </span>
              </div>
            </div>
          </div>

          {/* Primary Visa Pathway + Min Income */}
          {currentPersona === 'retiree' ? (
            <div className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-teal-50/75 via-indigo-50/45 to-slate-50 border border-teal-200/75 flex items-center justify-between gap-2 text-[11px]">
              <div className="flex items-center gap-1.5 min-w-0">
                <FileBadge className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span className="text-slate-800 font-bold truncate" title={country.visa.retirementVisaName}>
                  {country.visa.retirementVisaName}
                </span>
              </div>
              <span className="px-1.5 py-0.5 rounded-md bg-white border border-teal-200/80 font-mono tabular-nums text-teal-900 font-extrabold text-[10px] shrink-0">
                ${country.visa.minimumIncomeUSD.toLocaleString()}/mo
              </span>
            </div>
          ) : (
            <div className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-50/75 via-teal-50/45 to-slate-50 border border-indigo-200/75 flex items-center justify-between gap-2 text-[11px]">
              <div className="flex items-center gap-1.5 min-w-0">
                <Laptop className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span className="text-slate-800 font-bold truncate" title={nomadProfile.remoteWorkVisaName}>
                  {nomadProfile.remoteWorkVisaName}
                </span>
              </div>
              <span className="px-1.5 py-0.5 rounded-md bg-white border border-indigo-200/80 font-mono tabular-nums text-indigo-900 font-extrabold text-[10px] shrink-0">
                {nomadProfile.remoteWorkVisaIncomeUSD > 0
                  ? `$${nomadProfile.remoteWorkVisaIncomeUSD.toLocaleString()}/mo`
                  : 'Zero Min.'}
              </span>
            </div>
          )}

          {/* Single Compact Key-Stat / Active-Sort Highlight Row */}
          {renderCompactHighlightRow()}
        </div>
      </div>

      {/* Compact Card Footer */}
      <div className="px-3.5 py-2.5 bg-gradient-to-r from-slate-50/95 via-indigo-50/35 to-teal-50/40 border-t border-slate-200/75 flex items-center justify-between gap-2">
        {/* Compare Button */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => toggleCompareCountry(country.id)}
          className={`flex items-center gap-1.5 text-[11px] font-bold py-1.5 px-2.5 rounded-xl transition-all cursor-pointer border ${
            compared
              ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white border-amber-500 shadow-xs'
              : 'bg-white text-slate-700 border-slate-200/90 hover:border-indigo-300 hover:text-indigo-950'
          }`}
          title="Compare side-by-side with other countries"
        >
          <div
            className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
              compared ? 'border-white/80 bg-white/20 text-white' : 'border-slate-400'
            }`}
          >
            {compared && <Check className="w-2.5 h-2.5 stroke-[3]" />}
          </div>
          <span className="whitespace-nowrap">{compared ? 'Comparing' : 'Compare'}</span>
        </motion.button>

        <div className="flex items-center gap-1.5">
          {/* Quick Export Full Country Dossier PDF */}
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleQuickExportPdf}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-800 hover:text-purple-950 bg-purple-50/90 hover:bg-purple-100 border border-purple-200/90 transition-colors py-1.5 px-2 rounded-xl whitespace-nowrap cursor-pointer shadow-2xs"
            title={`Download complete 35-page ${country.name} master retirement dossier PDF`}
          >
            <Download className="w-3 h-3 text-purple-700" />
            <span>PDF</span>
          </motion.button>

          {/* Deep Dive Page CTA */}
          <a
            href={countryUrl}
            onClick={handleSpaCountryClick}
            className={`inline-flex items-center gap-1 text-[11px] font-bold text-white bg-gradient-to-r ${theme.ctaBtn} transition-all py-1.5 px-2.5 rounded-xl shadow-xs whitespace-nowrap`}
          >
            <span>Explore Dossier</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>
      </div>
    </motion.article>
  );
};
