import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Country,
  CommunityThread,
  ExpatMeetup,
  CountryJournalEntry,
  UserProfile,
} from '../types';
import { useApp } from '../context/AppContext';
import {
  DossierExportOptions,
  generateCountryDossierPdf,
  getStructuredVisaRows,
  getShortTermVisasForCountry,
  preloadDossierBrandAssets,
} from '../utils/exportCountryDossierPdf';
import { getFaqsForCountry } from '../data/countryFaqs';
import { getCountryHealthcareProfile } from '../data/countryHealthcare';
import { getCountryTravelMobility } from '../data/countryTravelMobility';
import { getCountryHousingProfile } from '../data/countryHousingAndRentals';
import { getCountryGastronomyProfile } from '../data/countryFoodAndGastronomy';
import { CountryFlag } from './CountryFlag';
import { BrandLogo } from './BrandLogo';
import {
  X,
  Download,
  FileText,
  CheckCircle2,
  SlidersHorizontal,
  Sparkles,
  Stethoscope,
  Printer,
  Check,
  ShieldAlert,
  Home,
  UtensilsCrossed,
  TrendingUp,
  MapPin,
  Flame,
} from 'lucide-react';

interface CountryDossierPdfModalProps {
  country: Country;
  isOpen: boolean;
  onClose: () => void;
  userProfile?: UserProfile;
  isAuthenticated?: boolean;
  journalEntry?: CountryJournalEntry;
  threads: CommunityThread[];
  meetups: ExpatMeetup[];
  discreetLifestyleEnabled: boolean;
}

export const CountryDossierPdfModal: React.FC<CountryDossierPdfModalProps> = ({
  country,
  isOpen,
  onClose,
  userProfile,
  isAuthenticated,
  journalEntry,
  threads,
  meetups,
  discreetLifestyleEnabled,
}) => {
  const { trackDossierDownload } = useApp();
  const [options, setOptions] = useState<DossierExportOptions>({
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
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      preloadDossierBrandAssets();
    }
  }, [isOpen]);

  const faqs = useMemo(() => getFaqsForCountry(country), [country]);
  const shortVisas = useMemo(() => getShortTermVisasForCountry(country), [country]);
  const structuredVisaRows = useMemo(() => getStructuredVisaRows(country), [country]);
  const hc = useMemo(() => getCountryHealthcareProfile(country), [country]);
  const mobility = useMemo(() => getCountryTravelMobility(country), [country]);
  const housing = useMemo(() => getCountryHousingProfile(country), [country]);
  const gastronomy = useMemo(() => getCountryGastronomyProfile(country), [country]);

  // Calculate dynamic page count based on selected sections (35 pages when all sections enabled)
  const estimatedPageCount = useMemo(() => {
    let pages = 5; // Page 1 Cover + Page 2 Master TOC + Page 33 Roadmap Pt1 + Page 34 Roadmap Pt2 + Page 35 Governance/Seal
    if (options.includeExecutiveSummary) pages += 2; // Ch 01 & 01B (2 pages)
    if (options.includeVisaAndLegal) pages += 2; // Ch 02 & 02B (2 pages)
    if (options.includeShortTermVisas) pages += 1; // Ch 03 (1 page)
    if (options.includeHealthcareAndInsurance) pages += 4; // Ch 04, 05, 06 & 06B (4 pages)
    if (options.includeCostAndBudget) pages += 2; // Ch 07 & 07B (2 pages)
    if (options.includeHousingAndRentals) pages += 2; // Ch 08 & 08B (2 pages)
    if (options.includeFIREModeling) pages += 1; // Ch 09 (1 page)
    if (options.includeFoodAndGastronomy) pages += 3; // Ch 10, 10B & 10C (3 pages)
    if (options.includeTravelAndMobility) pages += 5; // Ch 11, 11B, 12, 13 & 13B (5 pages)
    if (options.includeClimateAndTowns) pages += 2; // Ch 14 & 15 (2 pages)
    if (options.includeDemographicsAndLifestyle) pages += 2; // Ch 16 & 16B (2 pages)
    if (options.includeRelocationFaqs) pages += faqs.length > 4 ? 3 : 2; // Ch 17, 17B & 17C (3 pages)
    if (options.includeCommunityAndMeetups) pages += 1; // Ch 18 (1 page)
    return pages;
  }, [options, faqs.length]);

  if (!isOpen) return null;

  const toggleOption = (key: keyof DossierExportOptions) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
    setExportSuccess(false);
  };

  const selectAllOptions = () => {
    setOptions({
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
    });
  };

  const handleDownloadPdf = async () => {
    setIsGenerating(true);
    setExportSuccess(false);
    try {
      await generateCountryDossierPdf({
        country,
        userProfile,
        isAuthenticated,
        journalEntry,
        threads,
        meetups,
        options,
      });
      trackDossierDownload(country.id, country.name, 'Comprehensive 35-Page PDF Dossier');
      setExportSuccess(true);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBrowserPrint = () => {
    window.print();
  };

  const activeSectionsCount = Object.values(options).filter(Boolean).length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdf-export-modal-title"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        className="relative bg-white rounded-3xl max-w-6xl w-full max-h-[94vh] flex flex-col shadow-2xl border border-indigo-200/80 overflow-hidden"
      >
        {/* Top Multi-Color Gradient Ribbon */}
        <div className="h-2 w-full bg-gradient-to-r from-teal-400 via-indigo-500 via-55% to-amber-500 shrink-0" />

        {/* Top Modal Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-teal-50/85 via-indigo-50/70 to-amber-50/80 border-b border-indigo-200/70 flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-teal-500 via-indigo-600 to-amber-500 text-white flex items-center justify-center shadow-sm shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2
                  id="pdf-export-modal-title"
                  className="text-base sm:text-lg font-extrabold bg-gradient-to-r from-slate-900 via-indigo-950 to-teal-900 bg-clip-text text-transparent"
                >
                  {country.flag} {country.name} — Official {estimatedPageCount}-Page Master Dossier Studio
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-gradient-to-r from-teal-500/15 via-indigo-500/15 to-amber-500/15 text-indigo-950 border border-indigo-300/80">
                  <Sparkles className="w-3 h-3 text-indigo-600" />
                  {estimatedPageCount}-Page Publication · 22 Chapters
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Complete website intelligence in one vector PDF: 6-axis radar, 10-point visa matrix, 4-page healthcare &amp; insurance, budget calculator, housing &amp; rental enclaves, food &amp; gastronomy traditions, mobility personas, FAQs &amp; 12-month execution roadmap.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleBrowserPrint}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-indigo-200/80 bg-white text-slate-700 hover:bg-indigo-50/50 text-xs font-bold transition-colors shadow-2xs cursor-pointer"
              title="Print current view"
            >
              <Printer className="w-3.5 h-3.5 text-indigo-600" />
              <span>Print Sheet</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleDownloadPdf}
              disabled={isGenerating || activeSectionsCount === 0}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 via-indigo-600 to-amber-500 hover:from-teal-600 hover:to-amber-600 disabled:opacity-50 text-white text-xs sm:text-sm font-extrabold shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>
                {isGenerating
                  ? `Compiling ${estimatedPageCount}-Page Master Dossier...`
                  : exportSuccess
                  ? `Downloaded ${estimatedPageCount}-Page PDF ✓ (Re-Download)`
                  : `Download ${estimatedPageCount}-Page ${country.name} Dossier PDF`}
              </span>
            </motion.button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white/80 transition-colors cursor-pointer"
              aria-label="Close PDF Export Studio"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Body: Left Configuration Sidebar + Right Live Document Preview */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          {/* Left Column: Section Customizer (4 cols) */}
          <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-indigo-100 bg-gradient-to-b from-slate-50/90 via-indigo-50/25 to-teal-50/20 p-5 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                  Included Dossier Modules ({activeSectionsCount}/15)
                </h3>
              </div>
              <button
                onClick={selectAllOptions}
                className="text-[11px] font-bold text-indigo-700 hover:text-teal-700 hover:underline cursor-pointer"
              >
                Select All 15 Modules
              </button>
            </div>

            <div className="space-y-2">
              {[
                {
                  key: 'includeExecutiveSummary' as const,
                  label: '1. Executive Profile, 6-Axis Radar & SWOT (2p)',
                  desc: 'Overview prose, 8 core KPIs, radar telemetry & pros/cons (Ch 01 & 01B).',
                  accent: 'border-teal-300 bg-teal-50/40',
                  checkBg: 'from-teal-500 to-emerald-600',
                },
                {
                  key: 'includePersonalReadinessAndJournal' as const,
                  label: '2. Personal Readiness & Journal Notes',
                  desc: 'Your 4% FIRE benchmark and confidential journal notes.',
                  accent: 'border-indigo-300 bg-indigo-50/40',
                  checkBg: 'from-indigo-500 to-violet-600',
                },
                {
                  key: 'includeVisaAndLegal' as const,
                  label: '3. Visa, PR & 10-Point Legal Matrix (2p)',
                  desc: `${country.visa.retirementVisaName} thresholds, PR timeline & tax rules (Ch 02 & 02B).`,
                  accent: 'border-violet-300 bg-violet-50/40',
                  checkBg: 'from-violet-500 to-purple-600',
                },
                {
                  key: 'includeShortTermVisas' as const,
                  label: `4. Short-Stay & Trial Visas (${shortVisas.length} Options, 1p)`,
                  desc: 'Tourist waivers, digital nomad permits & 3 decision frameworks (Ch 03).',
                  accent: 'border-amber-300 bg-amber-50/40',
                  checkBg: 'from-amber-500 to-orange-600',
                },
                {
                  key: 'includeHealthcareAndInsurance' as const,
                  label: '5. Healthcare, Emergency & Insurance (4p)',
                  desc: `Routine care, ${hc.emergencyServices.emergencyNumberPrimary} ER triage, 3 insurance tiers & cash tariffs (Ch 04, 05, 06 & 06B).`,
                  accent: 'border-teal-300 bg-teal-50/40',
                  checkBg: 'from-teal-500 to-indigo-600',
                },
                {
                  key: 'includeCostAndBudget' as const,
                  label: '6. Cost of Living & Budget Calculator (2p)',
                  desc: 'Dual-currency expenses, 3 lifestyle tiers & budget matrix (Ch 07 & 07B).',
                  accent: 'border-indigo-300 bg-indigo-50/40',
                  checkBg: 'from-indigo-500 to-violet-600',
                },
                {
                  key: 'includeHousingAndRentals' as const,
                  label: '7. Housing Markets, Leases & Caution Zones (2p)',
                  desc: `${housing.safeExpatNeighborhoods.length} prime city enclaves, tenant broker fees, statutory leases & safety (Ch 08 & 08B).`,
                  accent: 'border-emerald-300 bg-emerald-50/40',
                  checkBg: 'from-emerald-500 to-teal-600',
                },
                {
                  key: 'includeFIREModeling' as const,
                  label: '8. FIRE Financial Modeling & SWR (1p)',
                  desc: '4.0% vs 3.5% safe withdrawal rates & geo-arbitrage capital longevity (Ch 09).',
                  accent: 'border-amber-300 bg-amber-50/40',
                  checkBg: 'from-amber-500 to-orange-600',
                },
                {
                  key: 'includeFoodAndGastronomy' as const,
                  label: '9. Food Heritage, Daily Routine Meals & Dining (3p)',
                  desc: `${gastronomy.nationalDishes.length} signature dishes, local meal rhythms, veg/vegan ease & hygiene (Ch 10, 10B & 10C).`,
                  accent: 'border-rose-300 bg-rose-50/40',
                  checkBg: 'from-rose-500 to-amber-600',
                },
                {
                  key: 'includeTravelAndMobility' as const,
                  label: '10. Travel, Activities & Mobility Personas (5p)',
                  desc: `${mobility.retireeActivities.length} pursuits, transit, Couples, Solo & Solo Female guides (Ch 11–13B).`,
                  accent: 'border-amber-300 bg-amber-50/40',
                  checkBg: 'from-amber-500 to-rose-500',
                },
                {
                  key: 'includeClimateAndTowns' as const,
                  label: `11. Climate Cycles & Top Expat Towns (${country.topCities.length} Hubs, 2p)`,
                  desc: '3-season weather guide and regional hub comparisons (Ch 14 & 15).',
                  accent: 'border-teal-300 bg-teal-50/40',
                  checkBg: 'from-teal-500 to-emerald-600',
                },
                {
                  key: 'includeDemographicsAndLifestyle' as const,
                  label: '12. Demographics & Dating Culture (1p)',
                  desc: 'Median age, F:M gender ratio, and social integration dynamics (Ch 16).',
                  accent: 'border-violet-300 bg-violet-50/40',
                  checkBg: 'from-violet-500 to-fuchsia-600',
                },
                {
                  key: 'includeDiscreetNightlife' as const,
                  label: '13. Senior Nightlife & Adult Entertainment (1p)',
                  desc: 'Evening social venues, districts, scores & safety rules (Ch 16B).',
                  accent: 'border-rose-300 bg-rose-50/40',
                  checkBg: 'from-rose-500 to-amber-500',
                },
                {
                  key: 'includeRelocationFaqs' as const,
                  label: `14. Readiness Checklist & FAQs (${faqs.length} Guides, 3p)`,
                  desc: '4-pillar readiness checklist, banking, 183-day tax & leases (Ch 17–17C).',
                  accent: 'border-indigo-300 bg-indigo-50/40',
                  checkBg: 'from-indigo-600 to-teal-500',
                },
                {
                  key: 'includeCommunityAndMeetups' as const,
                  label: '15. Expat Mentors, Meetups & Forum (1p)',
                  desc: `${meetups.length} meetups, ${threads.length} discussions, and local mentors (Ch 18).`,
                  accent: 'border-amber-300 bg-amber-50/40',
                  checkBg: 'from-amber-500 to-orange-600',
                },
              ].map(item => {
                const checked = Boolean(options[item.key]);
                return (
                  <motion.label
                    key={item.key}
                    whileHover={{ x: 2 }}
                    onClick={() => toggleOption(item.key)}
                    className={`p-3 rounded-2xl border text-left cursor-pointer transition-all flex items-start gap-3 select-none ${
                      checked
                        ? `bg-white ${item.accent} shadow-2xs`
                        : 'bg-slate-100/60 border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div
                      className={`mt-0.5 w-4 h-4 rounded-md flex items-center justify-center shrink-0 transition-all ${
                        checked
                          ? `bg-gradient-to-br ${item.checkBg} text-white shadow-2xs`
                          : 'bg-white border border-slate-300'
                      }`}
                    >
                      {checked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-extrabold text-slate-900 block leading-snug">
                        {item.label}
                      </span>
                      <span className="text-[11px] text-slate-500 block mt-0.5 leading-snug">
                        {item.desc}
                      </span>
                    </div>
                  </motion.label>
                );
              })}
            </div>

            {/* File metadata summary box */}
            <div className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-teal-50/90 via-indigo-50/70 to-amber-50/80 border border-indigo-200/80 space-y-2 shadow-2xs">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 via-indigo-500 to-amber-500" />
              <div className="flex items-center justify-between text-xs pt-0.5">
                <span className="font-extrabold text-indigo-950">Publication Volume</span>
                <span className="font-mono font-extrabold text-indigo-900 bg-white px-2.5 py-0.5 rounded-full border border-indigo-200 text-[11px]">
                  {estimatedPageCount} Pages · A4 Vector PDF
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Includes multi-colored prestige cover page, 22-chapter master blueprint, running headers, neighborhood enclaves, gastronomy tasting guides, tabular financial &amp; healthcare matrices, and 12-month execution roadmap.
              </p>
              {exportSuccess && (
                <div className="pt-2 flex items-center gap-1.5 text-xs font-extrabold text-emerald-700">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{estimatedPageCount}-Page Master PDF saved to your device!</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Live Formatted Document Preview (8 cols) */}
          <div className="lg:col-span-8 bg-slate-200/70 p-4 sm:p-8 overflow-y-auto">
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl border border-indigo-200/90 overflow-hidden text-slate-900">
              {/* Top Multi-Colored 4-Segment Brand Ribbon matching PDF Cover */}
              <div className="h-2.5 w-full bg-gradient-to-r from-teal-500 via-indigo-600 via-55% to-amber-500" />

              <div className="p-6 sm:p-10 space-y-8">
                {/* Page 1: Dedicated Prestige Cover Page Preview */}
                <div className="relative overflow-hidden p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-white via-indigo-50/20 to-teal-50/20 border border-indigo-200/90 shadow-xs text-center space-y-5">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-400 via-indigo-500 via-60% to-amber-500" />

                  {/* Official ReFIREly Website Logo */}
                  <div className="flex flex-col items-center pt-1">
                    <BrandLogo variant="full" size="lg" />
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-950/80 mt-2">
                      Global Relocation Intelligence · FIRE Analytics · Healthcare &amp; Visa Atlas
                    </p>
                    <div className="w-36 h-1 mt-2 rounded-full bg-gradient-to-r from-teal-400 via-indigo-500 to-amber-500" />
                  </div>

                  {/* Edition Pill & Country Hero Title */}
                  <div className="space-y-2 pt-1">
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-50 text-indigo-800 border border-indigo-200">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      Official Master Retirement Dossier · {estimatedPageCount}-Page Edition
                    </span>

                    <div className="flex items-center justify-center gap-3 pt-1">
                      <CountryFlag
                        countryCode={country.code}
                        countryName={country.name}
                        fallbackEmoji={country.flag}
                        size="2xl"
                        className="w-11 h-7.5 sm:w-13 sm:h-9 rounded-xs shrink-0 shadow-2xs"
                      />
                      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight uppercase">
                        {country.name} ({country.code})
                      </h1>
                    </div>

                    <p className="text-xs font-extrabold text-teal-800">
                      Region: {country.region} · Capital: {country.capital} · Currency: {country.currency} ({country.currencySymbol}) · Language: {country.language}
                    </p>

                    <p className="text-xs sm:text-sm text-indigo-950/80 italic max-w-xl mx-auto leading-relaxed">
                      "{country.tagline}"
                    </p>
                  </div>

                  {/* 4-Pillar Multi-Colored Benchmark Strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 text-center">
                    <div className="p-2.5 rounded-xl bg-teal-50/70 border border-teal-200 border-t-2 border-t-teal-500">
                      <span className="text-[10px] font-extrabold uppercase text-teal-800 block">
                        Monthly Budget
                      </span>
                      <span className="font-mono font-extrabold text-xs sm:text-sm text-slate-900 mt-0.5 block">
                        ${country.costOfLiving.monthlyBudgetSingleUSD.toLocaleString()} / $
                        {country.costOfLiving.monthlyBudgetCoupleUSD.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-500 block">Single / Couple</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-200 border-t-2 border-t-indigo-600">
                      <span className="text-[10px] font-extrabold uppercase text-indigo-800 block">
                        Primary Visa
                      </span>
                      <span className="font-mono font-extrabold text-xs sm:text-sm text-slate-900 mt-0.5 block">
                        ${country.visa.minimumIncomeUSD.toLocaleString()}/mo
                      </span>
                      <span className="text-[10px] text-slate-500 truncate block">
                        {country.visa.retirementVisaName}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-violet-50/70 border border-violet-200 border-t-2 border-t-violet-600">
                      <span className="text-[10px] font-extrabold uppercase text-violet-800 block">
                        Health &amp; Safety
                      </span>
                      <span className="font-mono font-extrabold text-xs sm:text-sm text-slate-900 mt-0.5 block">
                        {country.lifestyle.healthcareScore} / {country.lifestyle.safetyScore}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        ER: {hc.emergencyServices.emergencyNumberPrimary} · ~${country.costOfLiving.healthcareMonthlyUSD}/mo
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 border-t-2 border-t-amber-500">
                      <span className="text-[10px] font-extrabold uppercase text-amber-800 block">
                        Annual Climate
                      </span>
                      <span className="font-mono font-extrabold text-xs sm:text-sm text-slate-900 mt-0.5 block">
                        {country.climate.annualSunnyDays} Days
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        Avg. {country.climate.averageTempC}°C Year-Round
                      </span>
                    </div>
                  </div>

                  {/* Provenance & Licensing Certificate Preview */}
                  <div className="p-3.5 rounded-xl bg-gradient-to-r from-teal-50/80 via-indigo-50/60 to-amber-50/70 border border-indigo-200/80 text-left flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-700">
                    <div className="flex items-center gap-2">
                      <BrandLogo variant="icon" size="sm" />
                      <span className="font-extrabold text-indigo-950">
                        Provenance &amp; Audit Certificate:
                      </span>
                      <span>
                        Prepared for {userProfile?.name || 'Valued ReFIREly Member'} ·{' '}
                        {new Date().toLocaleDateString()}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] font-extrabold text-indigo-900 bg-white px-2.5 py-0.5 rounded-full border border-indigo-200">
                      {estimatedPageCount}-Page Master Edition
                    </span>
                  </div>
                </div>

                {/* Preview Section 1: Executive Summary & 6-Axis Radar */}
                {options.includeExecutiveSummary && (
                  <section className="space-y-3">
                    <div className="border-l-4 border-teal-500 bg-gradient-to-r from-teal-50/90 to-indigo-50/40 px-3.5 py-2 rounded-r-xl">
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                        Chapters 01 &amp; 01B · Executive Profile, 6-Axis Radar Telemetry &amp; SWOT (Pages 3–4)
                      </h3>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                      {country.overview}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80">
                        <h4 className="text-xs font-extrabold text-emerald-950 mb-2">
                          Key Advantages (Pros)
                        </h4>
                        <ul className="space-y-1 text-xs text-slate-700">
                          {country.pros.map((p, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-emerald-700 font-bold">+</span>
                              <span>{p}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80">
                        <h4 className="text-xs font-extrabold text-amber-950 mb-2">
                          Practical Trade-offs (Cons)
                        </h4>
                        <ul className="space-y-1 text-xs text-slate-700">
                          {country.cons.map((c, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-amber-700 font-bold">-</span>
                              <span>{c}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </section>
                )}

                {/* Preview Section 2: Personal Readiness & Journal */}
                {options.includePersonalReadinessAndJournal && (isAuthenticated || journalEntry) && (
                  <section className="space-y-3">
                    <div className="border-l-4 border-violet-600 bg-gradient-to-r from-violet-50/90 to-indigo-50/40 px-3.5 py-2 rounded-r-xl">
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                        Personal Financial Readiness &amp; Confidential Country Journal
                      </h3>
                    </div>
                    {journalEntry ? (
                      <div className="p-4 rounded-xl bg-violet-50/40 border border-violet-200 text-xs space-y-1.5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-bold text-slate-900">
                            Interest Level:{' '}
                            <span className="text-violet-800">{journalEntry.interestLevel}</span>
                          </span>
                          <span className="font-mono text-slate-600">
                            Timeline: {journalEntry.scoutingTimeline || 'Flexible'} · Visited:{' '}
                            {journalEntry.visitedBefore ? 'Yes' : 'No'}
                          </span>
                        </div>
                        <p className="text-slate-700 italic">"{journalEntry.privateNotes}"</p>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-600">
                        Includes your personalized income and 4% SWR net worth comparison against{' '}
                        {country.name}'s living costs and visa thresholds.
                      </p>
                    )}
                  </section>
                )}

                {/* Preview Section 3: Visa & Legal Matrix */}
                {options.includeVisaAndLegal && (
                  <section className="space-y-3">
                    <div className="border-l-4 border-indigo-600 bg-gradient-to-r from-indigo-50/90 to-violet-50/40 px-3.5 py-2 rounded-r-xl">
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                        Chapters 02 &amp; 02B · Visa Architecture &amp; 10-Point Consular Matrix (Pages 5–6)
                      </h3>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                      <div>
                        <strong className="text-slate-900">Pathway to PR &amp; Citizenship: </strong>
                        <span className="text-slate-700">{country.visa.pathwayToPR}</span>
                      </div>
                      <div>
                        <strong className="text-slate-900">Retiree Tax Landscape: </strong>
                        <span className="text-slate-700">{country.visa.taxStatus}</span>
                      </div>
                    </div>
                    <div className="overflow-x-auto border border-indigo-100 rounded-xl">
                      <table className="w-full text-left text-[11px] divide-y divide-slate-200">
                        <thead className="bg-indigo-950 text-white">
                          <tr>
                            <th className="py-2 px-3">Dimension</th>
                            <th className="py-2 px-3">Official Requirement</th>
                            <th className="py-2 px-3">Implementation Notes</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {structuredVisaRows.slice(0, 6).map((row, idx) => (
                            <tr key={idx} className="bg-white">
                              <td className="py-1.5 px-3 font-bold text-slate-900">{row[0]}</td>
                              <td className="py-1.5 px-3 text-indigo-700 font-semibold">{row[1]}</td>
                              <td className="py-1.5 px-3 text-slate-500">{row[2]}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                )}

                {/* Preview Section 4: Short-Term Visas */}
                {options.includeShortTermVisas && (
                  <section className="space-y-3">
                    <div className="border-l-4 border-amber-500 bg-gradient-to-r from-amber-50/90 to-orange-50/40 px-3.5 py-2 rounded-r-xl">
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                        Chapter 03 · Short-Stay, Scouting &amp; Trial Visas ({shortVisas.length} Pathways · Page 7)
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {shortVisas.map(v => (
                        <div
                          key={v.id}
                          className="p-3 rounded-xl border border-amber-200/80 bg-amber-50/30 text-xs"
                        >
                          <span className="font-bold text-slate-900 block">{v.name}</span>
                          <span className="text-[11px] text-amber-800 font-mono font-bold">
                            {v.duration} · {v.estimatedCost}
                          </span>
                          <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">{v.idealFor}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Preview Section 5: Dedicated 4-Page Healthcare, Emergency & Insurance Pillar */}
                {options.includeHealthcareAndInsurance && (
                  <section className="space-y-3">
                    <div className="border-l-4 border-teal-500 bg-gradient-to-r from-teal-50/90 via-indigo-50/60 to-rose-50/50 px-3.5 py-2 rounded-r-xl flex items-center justify-between">
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                        Chapters 04, 05, 06 &amp; 06B · Healthcare, Emergency &amp; Insurance Guide (Pages 8–11)
                      </h3>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-teal-100 text-teal-900">
                        4 Dedicated Pages
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                      <div className="p-3 rounded-xl bg-teal-50/60 border border-teal-200">
                        <div className="flex items-center gap-1.5 font-extrabold text-teal-900 mb-1">
                          <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                          <span>Pillar 1: Routine Care</span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-snug">
                          Ease: <strong>{hc.routineCare.easeScore}/100</strong> ({hc.routineCare.easeVerdict}). Private GP wait: {hc.routineCare.gpWaitTimePrivate}.
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-200">
                        <div className="flex items-center gap-1.5 font-extrabold text-rose-900 mb-1">
                          <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                          <span>Pillar 2: Emergency ({hc.emergencyServices.emergencyNumberPrimary})</span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-snug">
                          Reliability: <strong>{hc.emergencyServices.responseReliabilityScore}/100</strong>. Includes ER deposit/GOP rules &amp; medevac readiness.
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-200">
                        <div className="flex items-center gap-1.5 font-extrabold text-indigo-900 mb-1">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Pillar 3: Insurance &amp; Tariffs</span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-snug">
                          3 age-banded insurance tiers, Medicare portability, pre-existing strategy &amp; 6 cash procedure benchmarks.
                        </p>
                      </div>
                    </div>
                  </section>
                )}

                {/* Preview Section 6: Cost of Living & Budget Calculator Matrix */}
                {options.includeCostAndBudget && (
                  <section className="space-y-3">
                    <div className="border-l-4 border-indigo-600 bg-gradient-to-r from-indigo-50/90 to-amber-50/50 px-3.5 py-2 rounded-r-xl">
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                        Chapters 07 &amp; 07B · Cost of Living &amp; Budget Calculator Matrix (Pages 12–13)
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                      <div className="p-2.5 rounded-xl bg-teal-50/50 border border-teal-200">
                        <span className="text-[10px] font-bold text-teal-800 block">1-Bed Center Rent</span>
                        <span className="font-mono font-extrabold text-slate-900">
                          ${country.costOfLiving.rent1BedCenterUSD}/mo
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-indigo-50/50 border border-indigo-200">
                        <span className="text-[10px] font-bold text-indigo-800 block">1-Bed Outside Center</span>
                        <span className="font-mono font-extrabold text-slate-900">
                          ${country.costOfLiving.rent1BedOutsideUSD}/mo
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-violet-50/50 border border-violet-200">
                        <span className="text-[10px] font-bold text-violet-800 block">Utilities &amp; Fiber</span>
                        <span className="font-mono font-extrabold text-slate-900">
                          ${country.costOfLiving.utilitiesMonthlyUSD}/mo
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-amber-50/50 border border-amber-200">
                        <span className="text-[10px] font-bold text-amber-800 block">Private Healthcare</span>
                        <span className="font-mono font-extrabold text-slate-900">
                          ${country.costOfLiving.healthcareMonthlyUSD}/mo
                        </span>
                      </div>
                    </div>
                  </section>
                )}

                {/* Preview Section 7: Housing & Rental Market */}
                {options.includeHousingAndRentals && (
                  <section className="space-y-3">
                    <div className="border-l-4 border-emerald-600 bg-gradient-to-r from-emerald-50/90 to-teal-50/50 px-3.5 py-2 rounded-r-xl flex items-center justify-between">
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                        Chapters 08 &amp; 08B · Housing &amp; Rental Market, Leases &amp; Caution Zones (Pages 14–15)
                      </h3>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900">
                        2 Dedicated Pages
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                      <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200">
                        <div className="flex items-center gap-1.5 font-extrabold text-emerald-900 mb-1">
                          <Home className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Neighborhood Tiers</span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-snug">
                          {housing.safeExpatNeighborhoods.length} prime city enclaves profiled with 1-bed/2-bed rents, transit, and expat enclave ratings.
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-teal-50/50 border border-teal-200">
                        <div className="flex items-center gap-1.5 font-extrabold text-teal-900 mb-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                          <span>Tenant Broker Fees</span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-snug">
                          Tenant fee: <strong>{housing.brokerAndFees.whoPaysBrokerFee}</strong>. Commission: {housing.brokerAndFees.typicalBrokerCommission}.
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-200">
                        <div className="flex items-center gap-1.5 font-extrabold text-amber-900 mb-1">
                          <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                          <span>Caution Districts</span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-snug">
                          {housing.areasToAvoidOrCaution.length} districts with specific nighttime and acoustic safety rules for expats.
                        </p>
                      </div>
                    </div>
                  </section>
                )}

                {/* Preview Section 8: FIRE Financial Modeling */}
                {options.includeFIREModeling && (
                  <section className="space-y-3">
                    <div className="border-l-4 border-amber-500 bg-gradient-to-r from-amber-50/90 to-orange-50/50 px-3.5 py-2 rounded-r-xl">
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                        Chapter 09 · FIRE Financial Modeling &amp; Geo-Arbitrage Economics (Page 16)
                      </h3>
                    </div>
                    <div className="p-3.5 rounded-xl bg-amber-50/40 border border-amber-200 text-xs space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-bold text-slate-900">
                          Single 4.0% SWR Capital: <strong className="text-amber-900 font-mono">${(country.costOfLiving.monthlyBudgetSingleUSD * 12 * 25).toLocaleString()}</strong>
                        </span>
                        <span className="font-bold text-slate-900">
                          Couple 4.0% SWR Capital: <strong className="text-amber-900 font-mono">${(country.costOfLiving.monthlyBudgetCoupleUSD * 12 * 25).toLocaleString()}</strong>
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        Comprehensive geo-arbitrage capital preservation modeling comparing 4.0% and conservative 3.5% safe withdrawal rates against dual-currency budgets.
                      </p>
                    </div>
                  </section>
                )}

                {/* Preview Section 9: Food & Gastronomy */}
                {options.includeFoodAndGastronomy && (
                  <section className="space-y-3">
                    <div className="border-l-4 border-rose-500 bg-gradient-to-r from-rose-50/90 to-amber-50/50 px-3.5 py-2 rounded-r-xl flex items-center justify-between">
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                        Chapters 10, 10B &amp; 10C · Food &amp; Gastronomy Heritage (Pages 17–19)
                      </h3>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-100 text-rose-900">
                        3 Dedicated Pages
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                      <div className="p-3 rounded-xl bg-rose-50/50 border border-rose-200">
                        <div className="flex items-center gap-1.5 font-extrabold text-rose-900 mb-1">
                          <UtensilsCrossed className="w-3.5 h-3.5 text-rose-600" />
                          <span>Daily Meal Rhythms</span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-snug">
                          {gastronomy.routines.map(r => r.mealName).join(' · ')} routines, typical local breakfasts, and sociable lunches.
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-200">
                        <div className="flex items-center gap-1.5 font-extrabold text-amber-900 mb-1">
                          <Flame className="w-3.5 h-3.5 text-amber-600" />
                          <span>Signature National Dishes</span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-snug">
                          {gastronomy.nationalDishes.slice(0, 3).map(d => d.name).join(', ')} with flavor profiles and authentic tasting spots.
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-teal-50/50 border border-teal-200">
                        <div className="flex items-center gap-1.5 font-extrabold text-teal-900 mb-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                          <span>Dietary &amp; Hygiene</span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-snug">
                          Veg rating: <strong>{gastronomy.dietaryRestrictions.vegetarianRating}</strong>. Hygiene: <strong>{gastronomy.costsAndHygiene.eatingOutHygieneScore}/100</strong>. Tap: {gastronomy.costsAndHygiene.waterSafety}.
                        </p>
                      </div>
                    </div>
                  </section>
                )}

                {/* Preview Section 10: Travel, Activities & Mobility Personas */}
                {options.includeTravelAndMobility && (
                  <section className="space-y-3">
                    <div className="border-l-4 border-amber-500 bg-gradient-to-r from-amber-50/90 to-teal-50/50 px-3.5 py-2 rounded-r-xl">
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                        Chapters 11, 11B, 12, 13 &amp; 13B · {mobility.retireeActivities.length} Retiree Pursuits, Transit &amp; 3 Safety Personas (Pages 20–24)
                      </h3>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Includes full activity descriptions, 7-day weekly expat schedule, domestic train/bus/highway telemetry, and dedicated chapters for <strong>Couples ({mobility.couples.safetyRating}/100)</strong>, <strong>Solo Retirees ({mobility.solo.safetyRating}/100)</strong>, and <strong>Solo Female Retirees ({mobility.soloFemale.femaleSafetyScore}/100)</strong>.
                    </p>
                  </section>
                )}

                {/* Preview Section 11: Climate & Top Expat Towns */}
                {options.includeClimateAndTowns && (
                  <section className="space-y-3">
                    <div className="border-l-4 border-teal-500 bg-gradient-to-r from-teal-50/90 to-indigo-50/50 px-3.5 py-2 rounded-r-xl">
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                        Chapters 14 &amp; 15 · 3-Season Climate Guide &amp; Top Expat Towns ({country.topCities.length} Hubs · Pages 25–26)
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {country.topCities.map((city, i) => (
                        <div
                          key={i}
                          className="p-3 rounded-xl border border-indigo-100 bg-indigo-50/30 text-xs"
                        >
                          <div className="flex items-center justify-between font-bold text-slate-900">
                            <span>{city.name}</span>
                            <span className="font-mono text-teal-800">${city.monthlyCostUSD}/mo</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1">{city.vibe}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Preview Section 12: Demographics & Dating Culture */}
                {options.includeDemographicsAndLifestyle && (
                  <section className="space-y-3">
                    <div className="border-l-4 border-violet-600 bg-gradient-to-r from-violet-50/90 to-rose-50/40 px-3.5 py-2 rounded-r-xl">
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                        Chapter 16 · Demographics, Social Dynamics &amp; Dating Culture (Page 27)
                      </h3>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      <strong>Median Age:</strong> {country.demographics.medianAge} yrs ·{' '}
                      <strong>F:M Ratio:</strong> {country.demographics.femalesPer100Males.toFixed(1)} : 100 ·{' '}
                      <strong>Youth (&lt;30):</strong> {country.demographics.youngPopulationPercent}% ·{' '}
                      <strong>Dating Rating:</strong> {country.demographics.datingRating}/5.{' '}
                      {country.demographics.socialAtmosphere}
                    </p>
                  </section>
                )}

                {/* Preview Section 13: Senior Nightlife Vibrancy & Entertainment */}
                {options.includeDiscreetNightlife && (
                  <section className="space-y-3">
                    <div className="border-l-4 border-rose-500 bg-gradient-to-r from-rose-50/90 to-amber-50/40 px-3.5 py-2 rounded-r-xl">
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                        Chapter 16B · Senior Nightlife Vibrancy &amp; Adult Entertainment Districts (Page 28)
                      </h3>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      <strong>Nightlife Score:</strong> {country.adultEntertainment.nightlifeScore}/5 ({country.adultEntertainment.nightlifeVibrancy}) ·{' '}
                      <strong>Legal Framework:</strong> {country.adultEntertainment.legalStatus}. Profiles top entertainment districts, acoustic standards, and senior safety rules.
                    </p>
                  </section>
                )}

                {/* Preview Section 14: Pre-Retirement Hurdles & FAQs */}
                {options.includeRelocationFaqs && (
                  <section className="space-y-3">
                    <div className="border-l-4 border-indigo-600 bg-gradient-to-r from-indigo-50/90 to-teal-50/50 px-3.5 py-2 rounded-r-xl">
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                        Chapters 17, 17B &amp; 17C · 4-Pillar Readiness Checklist &amp; {faqs.length} Detailed Hurdle Guides (Pages 29–31)
                      </h3>
                    </div>
                    <div className="space-y-2">
                      {faqs.slice(0, 4).map((f, i) => (
                        <div
                          key={f.id}
                          className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 text-xs"
                        >
                          <span className="font-bold text-slate-900 block">
                            Q{i + 1}: {f.question}
                          </span>
                          <span className="text-[11px] text-slate-600 block mt-0.5">
                            {f.shortSummary}
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Preview Section 15: Community, 12-Month Roadmap & Legal Governance */}
                <section className="space-y-3">
                  <div className="border-l-4 border-emerald-600 bg-gradient-to-r from-emerald-50/90 to-teal-50/50 px-3.5 py-2 rounded-r-xl">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                      Chapters 18, 19, 19B &amp; 20 · Community Mentors, 12-Month Master Roadmap &amp; Legal Seal (Pages 32–{estimatedPageCount})
                    </h3>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 via-indigo-950 to-teal-950 text-slate-200 text-xs space-y-2">
                    <div className="text-[11px] font-extrabold text-teal-300 uppercase tracking-wider">
                      Official ReFIREly Global Intelligence Notice · 35-Page Master Volume
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      This {estimatedPageCount}-page master dossier is compiled for private informational, educational, and scouting benchmarking purposes across 22 chapters. All content is the proprietary copyright of ReFIREly (ReFIREly.com).
                    </p>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
