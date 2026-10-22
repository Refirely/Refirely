import React, { useState, useMemo, useEffect } from 'react';
import {
  Country,
  CommunityThread,
  ExpatMeetup,
  CountryJournalEntry,
  UserProfile,
} from '../types';
import {
  DossierExportOptions,
  generateCountryDossierPdf,
  getStructuredVisaRows,
  getShortTermVisasForCountry,
  preloadDossierBrandAssets,
} from '../utils/exportCountryDossierPdf';
import { getFaqsForCountry } from '../data/countryFaqs';
import { CountryFlag } from './CountryFlag';
import {
  X,
  Download,
  FileText,
  CheckCircle2,
  SlidersHorizontal,
  Sparkles,
  Shield,
  DollarSign,
  Sun,
  MapPin,
  Users,
  BookOpen,
  HelpCircle,
  Printer,
  Check,
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
  const [options, setOptions] = useState<DossierExportOptions>({
    includeExecutiveSummary: true,
    includePersonalReadinessAndJournal: true,
    includeVisaAndLegal: true,
    includeShortTermVisas: true,
    includeCostAndBudget: true,
    includeTravelAndMobility: true,
    includeClimateAndTowns: true,
    includeDemographicsAndLifestyle: true,
    includeDiscreetNightlife: discreetLifestyleEnabled,
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
      includeCostAndBudget: true,
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
    <div
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdf-export-modal-title"
    >
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[94vh] flex flex-col shadow-2xl border border-orange-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Top Modal Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-orange-50 via-purple-50/60 to-blue-50/70 border-b border-orange-200/80 flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-600 via-amber-500 to-purple-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="pdf-export-modal-title" className="text-base sm:text-lg font-extrabold text-slate-900">
                  {country.flag} {country.name} — Official 22-Page Master Dossier Studio
                </h2>
                <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-100 text-orange-900 border border-orange-200">
                  22-Page Premium Publication · {activeSectionsCount} Chapters
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Institutional-grade master dossier: Cover page, chapter blueprint, 10-point consular matrix, 4% FIRE models, travel pursuits, 12-month roadmap, and legal/copyright disclaimer.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleBrowserPrint}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors shadow-2xs"
              title="Print current view"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print Sheet</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isGenerating || activeSectionsCount === 0}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 via-amber-600 to-purple-600 hover:from-orange-700 hover:to-purple-700 disabled:opacity-50 text-white text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>
                {isGenerating
                  ? 'Compiling 22-Page Dossier...'
                  : exportSuccess
                  ? 'Downloaded 22-Page PDF ✓ (Re-Download)'
                  : `Download 22-Page ${country.name} Dossier PDF`}
              </span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white/80 transition-colors"
              aria-label="Close PDF Export Studio"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Body: Left Configuration Sidebar + Right Live Document Preview */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          
          {/* Left Column: Section Customizer (4 cols) */}
          <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-slate-200 bg-slate-50/80 p-5 overflow-y-auto space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4 text-orange-600" />
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                  Included Dossier Sections
                </h3>
              </div>
              <button
                onClick={selectAllOptions}
                className="text-[11px] font-semibold text-orange-700 hover:text-orange-900 hover:underline"
              >
                Select All 11 Sections
              </button>
            </div>

            <div className="space-y-2">
              {[
                {
                  key: 'includeExecutiveSummary' as const,
                  label: '1. Executive Summary & Pros/Cons',
                  desc: 'Overview prose, 8 core KPIs, and strategic trade-offs.',
                },
                {
                  key: 'includePersonalReadinessAndJournal' as const,
                  label: '2. Personal Readiness & Journal',
                  desc: 'Your 4% FIRE benchmark and confidential journal notes.',
                },
                {
                  key: 'includeVisaAndLegal' as const,
                  label: '3. Visa, PR & 10-Point Legal Matrix',
                  desc: `${country.visa.retirementVisaName} thresholds, PR timeline, and tax treaties.`,
                },
                {
                  key: 'includeShortTermVisas' as const,
                  label: `4. Short-Stay & Trial Visas (${shortVisas.length})`,
                  desc: 'Tourist waivers, digital nomad permits, and scouting stays.',
                },
                {
                  key: 'includeCostAndBudget' as const,
                  label: '5. Cost of Living & 4% FIRE Budgets',
                  desc: 'Single/couple itemized expenses & Lean/Standard/Luxury tiers.',
                },
                {
                  key: 'includeTravelAndMobility' as const,
                  label: '6. Travel, Activities & Domestic Mobility',
                  desc: 'Retiree pursuits, transit ease, couples, solo & solo female safety.',
                },
                {
                  key: 'includeClimateAndTowns' as const,
                  label: `7. Healthcare, Climate & Top Towns (${country.topCities.length})`,
                  desc: 'Medical access, seasonal weather, and top expat hubs.',
                },
                {
                  key: 'includeDemographicsAndLifestyle' as const,
                  label: '8. Demographics & Social Culture',
                  desc: 'Median age, F:M gender ratio, and dating culture dynamics.',
                },
                {
                  key: 'includeDiscreetNightlife' as const,
                  label: '9. Nightlife & Adult Entertainment',
                  desc: 'Optional discreet entertainment districts, scores & safety.',
                },
                {
                  key: 'includeRelocationFaqs' as const,
                  label: `10. Relocation Hurdles & FAQs (${faqs.length})`,
                  desc: 'Banking, NIF/tax IDs, 183-day rules, Medicare & leases.',
                },
                {
                  key: 'includeCommunityAndMeetups' as const,
                  label: `11. Expat Contacts, Meetups & Forum`,
                  desc: `${meetups.length} meetups, ${threads.length} discussions, and local mentors.`,
                },
              ].map(item => {
                const checked = options[item.key];
                return (
                  <label
                    key={item.key}
                    onClick={() => toggleOption(item.key)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-start gap-3 select-none ${
                      checked
                        ? 'bg-white border-orange-300 shadow-2xs'
                        : 'bg-slate-100/60 border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div
                      className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center border shrink-0 transition-colors ${
                        checked
                          ? 'bg-orange-600 border-orange-600 text-white'
                          : 'bg-white border-slate-300'
                      }`}
                    >
                      {checked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-slate-900 block leading-snug">
                        {item.label}
                      </span>
                      <span className="text-[11px] text-slate-500 block mt-0.5 leading-snug">
                        {item.desc}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>

            {/* File metadata summary box */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-orange-50 via-amber-50/50 to-purple-50 border border-orange-200/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-orange-950">Document Format</span>
                <span className="font-mono font-bold text-purple-900 bg-white px-2 py-0.5 rounded border border-purple-200 text-[11px]">
                  A4 Vector PDF
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Includes automatic pagination, running headers, tabular financial matrices, and step-by-step relocation checklists.
              </p>
              {exportSuccess && (
                <div className="pt-2 flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>PDF generated and saved to your device!</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Live Formatted Document Preview (8 cols) */}
          <div className="lg:col-span-8 bg-slate-200/70 p-4 sm:p-8 overflow-y-auto">
            <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg border border-slate-300 overflow-hidden text-slate-900">
              
              {/* Top Tricolor Brand Ribbon matching ReFIREly Logo (Navy, Flame Orange, Palm Green) */}
              <div className="h-2 w-full flex">
                <div className="w-[42%] bg-[#17253b]" />
                <div className="w-[33%] bg-orange-600" />
                <div className="w-[25%] bg-[#5d8c3e]" />
              </div>

              <div className="p-6 sm:p-10 space-y-8">
                
                {/* Page 1: Dedicated Prestige Cover Page Preview */}
                <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-300 shadow-xs text-center space-y-5">
                  {/* Official ReFIREly Website Logo */}
                  <div className="flex flex-col items-center">
                    <img
                      src="/assets/aistudio/refirely-logo.png"
                      alt="ReFIREly"
                      className="h-12 sm:h-16 w-auto object-contain"
                    />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-2">
                      Global Relocation Intelligence · FIRE Analytics · Expat Atlas
                    </p>
                    <div className="w-28 h-0.5 flex mt-2 rounded-full overflow-hidden">
                      <div className="w-1/3 bg-[#17253b]" />
                      <div className="w-1/3 bg-orange-600" />
                      <div className="w-1/3 bg-[#5d8c3e]" />
                    </div>
                  </div>

                  {/* Edition Pill & Country Hero Title */}
                  <div className="space-y-2 pt-1">
                    <span className="inline-flex items-center px-3.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-orange-50 text-orange-700 border border-orange-200">
                      Official Country Retirement Dossier · Page 1 Cover
                    </span>

                    <div className="flex items-center justify-center gap-3 pt-1">
                      <CountryFlag
                        countryCode={country.code}
                        countryName={country.name}
                        fallbackEmoji={country.flag}
                        size="2xl"
                        className="w-11 h-7.5 sm:w-13 sm:h-9 rounded-xs shrink-0 shadow-2xs"
                      />
                      <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17253b] tracking-tight uppercase">
                        {country.name} ({country.code})
                      </h1>
                    </div>

                    <p className="text-xs font-bold text-blue-900">
                      Region: {country.region} · Capital: {country.capital} · Currency: {country.currency} ({country.currencySymbol}) · Language: {country.language}
                    </p>

                    <p className="text-xs sm:text-sm text-slate-600 italic max-w-xl mx-auto leading-relaxed">
                      "{country.tagline}"
                    </p>
                  </div>

                  {/* 4-Pillar Key Benchmark Strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 text-center">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 border-t-2 border-t-orange-600">
                      <span className="text-[10px] font-bold uppercase text-slate-500 block">Monthly Budget</span>
                      <span className="font-mono font-extrabold text-xs sm:text-sm text-[#17253b] mt-0.5 block">
                        ${country.costOfLiving.monthlyBudgetSingleUSD.toLocaleString()} / ${country.costOfLiving.monthlyBudgetCoupleUSD.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-500 block">Single / Couple</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 border-t-2 border-t-[#17253b]">
                      <span className="text-[10px] font-bold uppercase text-slate-500 block">Primary Visa</span>
                      <span className="font-mono font-extrabold text-xs sm:text-sm text-[#17253b] mt-0.5 block">
                        ${country.visa.minimumIncomeUSD.toLocaleString()}/mo
                      </span>
                      <span className="text-[10px] text-slate-500 truncate block">{country.visa.retirementVisaName}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 border-t-2 border-t-[#5d8c3e]">
                      <span className="text-[10px] font-bold uppercase text-slate-500 block">Health & Safety</span>
                      <span className="font-mono font-extrabold text-xs sm:text-sm text-[#17253b] mt-0.5 block">
                        {country.lifestyle.healthcareScore} / {country.lifestyle.safetyScore}
                      </span>
                      <span className="text-[10px] text-slate-500 block">Clinical & Peace Index</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 border-t-2 border-t-amber-600">
                      <span className="text-[10px] font-bold uppercase text-slate-500 block">Annual Climate</span>
                      <span className="font-mono font-extrabold text-xs sm:text-sm text-[#17253b] mt-0.5 block">
                        {country.climate.annualSunnyDays} Days
                      </span>
                      <span className="text-[10px] text-slate-500 block">Avg. {country.climate.averageTempC}°C Year-Round</span>
                    </div>
                  </div>

                  {/* Provenance & Licensing Certificate Preview */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-left flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600">
                    <div className="flex items-center gap-2">
                      <img
                        src="/assets/aistudio/refirely-icon.png"
                        alt=""
                        className="w-5 h-5 object-contain shrink-0"
                      />
                      <span className="font-bold text-[#17253b]">
                        Provenance & Audit Certificate:
                      </span>
                      <span>
                        Prepared for {userProfile?.name || 'Valued ReFIREly Member'} · {new Date().toLocaleDateString()}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] font-bold text-orange-800 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                      Single Individual License
                    </span>
                  </div>
                </div>

                {/* Preview Section 1: Executive Summary */}
                {options.includeExecutiveSummary && (
                  <section className="space-y-3">
                    <div className="border-l-4 border-orange-600 bg-orange-50/70 px-3.5 py-2 rounded-r-lg">
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                        Section 1 · Executive Overview & Strategic Assessment
                      </h3>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                      {country.overview}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200/80">
                        <h4 className="text-xs font-bold text-emerald-950 mb-2">Key Advantages (Pros)</h4>
                        <ul className="space-y-1 text-xs text-slate-700">
                          {country.pros.map((p, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-emerald-700 font-bold">+</span>
                              <span>{p}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200/80">
                        <h4 className="text-xs font-bold text-amber-950 mb-2">Practical Trade-offs (Cons)</h4>
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
                    <div className="border-l-4 border-purple-600 bg-purple-50/70 px-3.5 py-2 rounded-r-lg">
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                        Section 2 · Personal Financial Readiness & Confidential Journal
                      </h3>
                    </div>
                    {journalEntry ? (
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-bold text-slate-900">
                            Interest Level: <span className="text-orange-800">{journalEntry.interestLevel}</span>
                          </span>
                          <span className="font-mono text-slate-600">
                            Timeline: {journalEntry.scoutingTimeline || 'Flexible'} · Visited: {journalEntry.visitedBefore ? 'Yes' : 'No'}
                          </span>
                        </div>
                        <p className="text-slate-700 italic">"{journalEntry.privateNotes}"</p>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-600">
                        Includes your personalized income and 4% SWR net worth comparison against {country.name}'s living costs and visa thresholds.
                      </p>
                    )}
                  </section>
                )}

                {/* Preview Section 3: Visa & Legal Matrix */}
                {options.includeVisaAndLegal && (
                  <section className="space-y-3">
                    <div className="border-l-4 border-orange-600 bg-orange-50/70 px-3.5 py-2 rounded-r-lg">
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                        Section 3 · Visa, Residency & 10-Point Consular Matrix ({country.visa.retirementVisaName})
                      </h3>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                      <div>
                        <strong className="text-slate-900">Pathway to PR & Citizenship: </strong>
                        <span className="text-slate-700">{country.visa.pathwayToPR}</span>
                      </div>
                      <div>
                        <strong className="text-slate-900">Retiree Tax Landscape: </strong>
                        <span className="text-slate-700">{country.visa.taxStatus}</span>
                      </div>
                    </div>
                    <div className="overflow-x-auto border border-slate-200 rounded-xl">
                      <table className="w-full text-left text-[11px] divide-y divide-slate-200">
                        <thead className="bg-slate-900 text-white">
                          <tr>
                            <th className="py-2 px-3">Dimension</th>
                            <th className="py-2 px-3">Official Requirement</th>
                            <th className="py-2 px-3">Notes</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {structuredVisaRows.slice(0, 6).map((row, idx) => (
                            <tr key={idx} className="bg-white">
                              <td className="py-1.5 px-3 font-bold text-slate-900">{row[0]}</td>
                              <td className="py-1.5 px-3 text-slate-700">{row[1]}</td>
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
                    <div className="border-l-4 border-purple-600 bg-purple-50/70 px-3.5 py-2 rounded-r-lg">
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                        Section 4 · Short-Stay, Scouting & Trial Visas ({shortVisas.length} Pathways)
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {shortVisas.map(v => (
                        <div key={v.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 text-xs">
                          <span className="font-bold text-slate-900 block">{v.name}</span>
                          <span className="text-[11px] text-orange-800 font-mono font-semibold">
                            {v.duration} · {v.estimatedCost}
                          </span>
                          <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">{v.idealFor}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Preview Section 5: Cost of Living & FIRE */}
                {options.includeCostAndBudget && (
                  <section className="space-y-3">
                    <div className="border-l-4 border-orange-600 bg-orange-50/70 px-3.5 py-2 rounded-r-lg">
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                        Section 5 · Cost of Living & 4% FIRE Nest Egg Matrix
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                        <span className="text-[10px] text-slate-500 block">1-Bed Center Rent</span>
                        <span className="font-mono font-bold text-slate-900">${country.costOfLiving.rent1BedCenterUSD}/mo</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                        <span className="text-[10px] text-slate-500 block">1-Bed Outside Center</span>
                        <span className="font-mono font-bold text-slate-900">${country.costOfLiving.rent1BedOutsideUSD}/mo</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                        <span className="text-[10px] text-slate-500 block">Utilities & Fiber</span>
                        <span className="font-mono font-bold text-slate-900">${country.costOfLiving.utilitiesMonthlyUSD}/mo</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                        <span className="text-[10px] text-slate-500 block">Private Healthcare</span>
                        <span className="font-mono font-bold text-slate-900">${country.costOfLiving.healthcareMonthlyUSD}/mo</span>
                      </div>
                    </div>
                  </section>
                )}

                {/* Preview Section 6: Climate & Top Expat Towns */}
                {options.includeClimateAndTowns && (
                  <section className="space-y-3">
                    <div className="border-l-4 border-amber-500 bg-amber-50/70 px-3.5 py-2 rounded-r-lg">
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                        Section 6 · Healthcare, Climate & Top Expat Towns ({country.topCities.length} Hubs)
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {country.topCities.map((city, i) => (
                        <div key={i} className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 text-xs">
                          <div className="flex items-center justify-between font-bold text-slate-900">
                            <span>{city.name}</span>
                            <span className="font-mono text-orange-800">${city.monthlyCostUSD}/mo</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1">{city.vibe}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Preview Section 7 & 8: Demographics & Lifestyle */}
                {options.includeDemographicsAndLifestyle && (
                  <section className="space-y-3">
                    <div className="border-l-4 border-purple-600 bg-purple-50/70 px-3.5 py-2 rounded-r-lg">
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                        Section 7 · Demographics, Social Culture {options.includeDiscreetNightlife ? '& Nightlife' : ''}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      <strong>Median Age:</strong> {country.demographics.medianAge} yrs · <strong>F:M Ratio:</strong> {country.demographics.femalesPer100Males.toFixed(1)} : 100 · <strong>Youth (&lt;30):</strong> {country.demographics.youngPopulationPercent}% · <strong>Dating Rating:</strong> {country.demographics.datingRating}/5. {country.demographics.socialAtmosphere}
                    </p>
                  </section>
                )}

                {/* Preview Section 9: Pre-Retirement Hurdles & FAQs */}
                {options.includeRelocationFaqs && (
                  <section className="space-y-3">
                    <div className="border-l-4 border-orange-600 bg-orange-50/70 px-3.5 py-2 rounded-r-lg">
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                        Section 8 · Pre-Retirement Hurdles & Relocation FAQs ({faqs.length} Detailed Guides)
                      </h3>
                    </div>
                    <div className="space-y-2">
                      {faqs.map((f, i) => (
                        <div key={f.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 text-xs">
                          <span className="font-bold text-slate-900 block">
                            Q{i + 1}: {f.question}
                          </span>
                          <span className="text-[11px] text-slate-600 block mt-0.5">{f.shortSummary}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Preview Section 10: Community & Meetups */}
                {options.includeCommunityAndMeetups && (
                  <section className="space-y-3">
                    <div className="border-l-4 border-blue-700 bg-blue-50/70 px-3.5 py-2 rounded-r-lg">
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                        Section 10 · Community Discussions ({threads.length}) & Expat Meetups ({meetups.length})
                      </h3>
                    </div>
                    <p className="text-xs text-slate-600">
                      Includes resident expat mentor profiles, {meetups.length} scheduled local meetups, and {threads.length} community forum threads with top replies.
                    </p>
                  </section>
                )}

                {/* Preview Section 11: 12-Month Master Relocation Execution Roadmap */}
                <section className="space-y-3">
                  <div className="border-l-4 border-emerald-600 bg-emerald-50/70 px-3.5 py-2 rounded-r-lg">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                      Section 11 · 12-Month Master Relocation Execution Roadmap (Page 21)
                    </h3>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                    <p className="text-slate-700">
                      Phase-by-phase chronological execution timeline from T-12 Months (Document Apostille & Financial Auditing) down to T-0 (Arrival & Tax Inscription) and Month 3 (Long-Term Lease & Community Inscription).
                    </p>
                  </div>
                </section>

                {/* Preview Section 12: Dedicated Legal Disclaimer & Copyright Notice */}
                <section className="space-y-3">
                  <div className="border-l-4 border-slate-700 bg-slate-100 px-3.5 py-2 rounded-r-lg">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                      Section 12 · Regulatory Legal Disclaimer & Copyright Notice (Page 22)
                    </h3>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-900 text-slate-200 text-xs space-y-2">
                    <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                      Official ReFIREly Global Intelligence Notice
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      This 22-page dossier is for private informational, educational, and scouting benchmarking purposes. It is not licensed legal, immigration, or tax advice. All content is the proprietary copyright of ReFIREly. Commercial resale, republication, and unauthorized re-distribution are strictly prohibited.
                    </p>
                  </div>
                </section>

              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
