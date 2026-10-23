import React, { useState } from 'react';
import { Country, CommunityThread, ExpatMeetup } from '../types';
import { useApp } from '../context/AppContext';
import { CountryRadarComparison } from './CountryRadarComparison';
import { VisaRequirementsTable } from './VisaRequirementsTable';
import { ShortTermVisaOptions } from './ShortTermVisaOptions';
import { AnnualRetirementBudgetCalculator } from './AnnualRetirementBudgetCalculator';
import { CountryFaqHurdles } from './CountryFaqHurdles';
import { CountryTravelAndMobility } from './CountryTravelAndMobility';
import { CountryDossierPdfModal } from './CountryDossierPdfModal';
import { CountryFlag } from './CountryFlag';
import { getFullCountryUrl } from '../utils/seo';
import {
  ArrowLeft, Heart, Scale, Sun, DollarSign, Shield,
  FileCheck, Users, MapPin, CheckCircle2, AlertCircle,
  MessageCircle, Calendar, Sparkles, ChevronRight, Share2,
  SlidersHorizontal, Stethoscope, Compass, ExternalLink, BookOpen,
  Download, FileText
} from 'lucide-react';

interface CountryDossierProps {
  country: Country;
}

export const CountryDossier: React.FC<CountryDossierProps> = ({ country }) => {
  const {
    setCurrentView,
    isCountrySaved,
    toggleSaveCountry,
    isCountryCompared,
    toggleCompareCountry,
    threads,
    meetups,
    startDmWithPeer,
    discreetLifestyleEnabled,
    setDiscreetLifestyleEnabled,
    journalEntries,
    userProfile,
    isAuthenticated,
    openAuthModal,
  } = useApp();

  // Active section tab
  const [activeTab, setActiveTab] = useState<'overview' | 'visa' | 'cost' | 'travel' | 'faq' | 'climate' | 'lifestyle' | 'cities' | 'community'>('overview');
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const saved = isCountrySaved(country.id);
  const compared = isCountryCompared(country.id);

  const handleCopyCountryLink = () => {
    const shareUrl = getFullCountryUrl(country.id);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Country specific threads and meetups
  const countryThreads = threads.filter(t => t.countryId === country.id);
  const countryMeetups = meetups.filter(m => m.countryId === country.id);

  // Local expat representatives to connect with
  const localExpats = [
    {
      name: country.id === 'portugal' ? 'Arthur Sterling' : country.id === 'thailand' ? 'David Chen' : country.id === 'spain' ? 'Elena Rostova' : 'Michael Thorne',
      origin: 'United States',
      yearsInCountry: '4 years living locally',
      city: country.topCities[0]?.name || country.capital,
      note: `Happy to share tips on renting, immigration appointments, and local healthcare in ${country.name}.`,
    },
    {
      name: country.id === 'portugal' ? 'Margaret O’Connor' : country.id === 'thailand' ? 'Frank Gallagher' : country.id === 'spain' ? 'Carlos Mendonza' : 'Claire Dupont',
      origin: 'United Kingdom / Canada',
      yearsInCountry: '2 years living locally',
      city: country.topCities[1]?.name || country.capital,
      note: `Ask me anything about daily expenses, language learning, and expat social groups in ${country.name}!`,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      
      {/* Breadcrumb Navigation & Top Action Bar */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <a
            href="/?view=explore"
            onClick={e => {
              if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && e.button === 0) {
                e.preventDefault();
                setCurrentView('explore');
              }
            }}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Destinations</span>
          </a>

          {/* Clean unboxed breadcrumbs */}
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
            <a
              href="/?view=explore"
              onClick={e => {
                if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && e.button === 0) {
                  e.preventDefault();
                  setCurrentView('explore');
                }
              }}
              className="hover:text-slate-800 transition-colors"
            >
              Explore
            </a>
            <span aria-hidden="true">/</span>
            <span>{country.region}</span>
            <span aria-hidden="true">/</span>
            <span className="text-slate-900 font-semibold">{country.name}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Share / Copy Dedicated Country URL Button */}
            <button
              onClick={handleCopyCountryLink}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer ${
                copiedLink
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
              title={`Copy direct link to ${country.name} dossier (${getFullCountryUrl(country.id)})`}
            >
              {copiedLink ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Share Link</span>
                </>
              )}
            </button>

            {/* Export Full Dossier PDF Button */}
            <button
              onClick={() => setIsPdfModalOpen(true)}
              className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-orange-600 via-amber-600 to-purple-600 hover:from-orange-700 hover:to-purple-700 text-white transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
              title={`Export complete ${country.name} retirement dossier as a formatted PDF`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Dossier PDF</span>
            </button>

            {journalEntries[country.id] ? (
              <button
                onClick={() => setCurrentView('dashboard')}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-orange-50 text-orange-900 border border-orange-200 hover:bg-orange-100 transition-colors flex items-center gap-1.5 shadow-2xs"
                title="View your private notes for this country in the Country Journal"
              >
                <BookOpen className="w-3.5 h-3.5 text-orange-700" />
                <span>Journal: {journalEntries[country.id].interestLevel}</span>
              </button>
            ) : (
              <button
                onClick={() => setCurrentView('dashboard')}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-2xs"
                title="Log private notes and interest level in Country Journal"
              >
                <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                <span>Add to Journal</span>
              </button>
            )}

            <button
              onClick={() => toggleCompareCountry(country.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-xl border transition-colors flex items-center gap-1.5 ${
                compared
                  ? 'bg-purple-700 text-white border-purple-700'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>{compared ? 'In Compare Matrix' : 'Add to Compare'}</span>
            </button>

            <button
              onClick={() => toggleSaveCountry(country.id)}
              className={`p-2 rounded-xl border transition-colors ${
                saved
                  ? 'bg-rose-50 text-rose-600 border-rose-200'
                  : 'bg-white text-slate-600 border-slate-300 hover:text-rose-600'
              }`}
              title={saved ? "Saved in your shortlist" : "Save to shortlist"}
            >
              <Heart className={`w-4 h-4 ${saved ? 'fill-rose-600' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Hero Dossier Header - Saffron Dawn & Lavender Luminous Palette */}
      <div className="bg-gradient-to-b from-orange-50/90 via-purple-50/35 to-white text-slate-900 py-10 border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <CountryFlag
                  countryCode={country.code}
                  countryName={country.name}
                  fallbackEmoji={country.flag}
                  size="2xl"
                  className="w-12 h-8 sm:w-14 sm:h-9.5 rounded-xs shrink-0"
                />
                <div>
                  <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                    {country.name} Retirement Guide
                  </h1>
                  {/* Clean unboxed metadata with typographic separators */}
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                    <span className="font-semibold text-orange-900">Capital: {country.capital}</span>
                    <span aria-hidden="true">·</span>
                    <span>Currency: {country.currency}</span>
                    <span aria-hidden="true">·</span>
                    <span>Language: {country.language}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-purple-700 font-medium">English: {country.lifestyle.englishProficiency}</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-slate-600 max-w-3xl leading-relaxed mt-2">
                {country.tagline}
              </p>
            </div>

            {/* Quick KPI Strip - Saffron & Purple Luminous Cards */}
            <div className="flex items-center gap-4 sm:gap-6 bg-white border border-orange-200/80 rounded-2xl px-5 py-4 shrink-0 shadow-xs">
              <div>
                <span className="text-[11px] text-orange-800 font-semibold block">Single Living</span>
                <span className="font-mono tabular-nums text-xl font-extrabold text-orange-950">
                  ${country.costOfLiving.monthlyBudgetSingleUSD.toLocaleString()}
                  <span className="text-xs font-sans font-normal text-slate-400 ml-1">/mo</span>
                </span>
              </div>
              <div className="w-px h-9 bg-slate-200" />
              <div>
                <span className="text-[11px] text-purple-800 font-semibold block">Healthcare Score</span>
                <span className="font-mono tabular-nums text-xl font-extrabold text-purple-950">
                  {country.lifestyle.healthcareScore}/100
                </span>
              </div>
              <div className="w-px h-9 bg-slate-200" />
              <div>
                <span className="text-[11px] text-amber-800 font-semibold block">Sunny Days</span>
                <span className="font-mono tabular-nums text-xl font-extrabold text-amber-900">
                  {country.climate.annualSunnyDays} d/yr
                </span>
              </div>
            </div>

          </div>

          {/* Section Navigation Tabs (Segmented controls) */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-8 pb-1 border-t border-orange-100/80 mt-8 text-xs font-medium">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'visa', label: 'Visas & Rules' },
              { id: 'cost', label: 'Budget Calc' },
              { id: 'travel', label: 'Travel & Leisure' },
              { id: 'faq', label: 'FAQ & Hurdles' },
              { id: 'climate', label: 'Climate' },
              { id: 'lifestyle', label: 'Lifestyle & Dating' },
              { id: 'cities', label: 'Top Towns' },
              { id: 'community', label: `Community (${countryThreads.length + countryMeetups.length})` },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl whitespace-nowrap shrink-0 transition-all font-semibold shadow-2xs ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-orange-600 via-amber-600 to-purple-600 text-white font-bold shadow-xs'
                    : 'bg-white text-slate-700 hover:text-orange-950 hover:bg-orange-50 border border-slate-200/90'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">

        {/* TAB 1: OVERVIEW & HIGHLIGHTS */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            
            {/* Overview paragraph & quick card */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <h2 className="text-xl font-bold text-slate-900">Country Dossier Overview</h2>
                <button
                  onClick={() => setIsPdfModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-900 border border-orange-200 text-xs font-bold transition-colors self-start sm:self-auto cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-orange-600" />
                  <span>Preview & Export Complete {country.name} PDF</span>
                </button>
              </div>
              <p className="text-slate-700 leading-relaxed text-sm sm:text-base">
                {country.overview}
              </p>

              {/* Empirical Core Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-100">
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-xs text-slate-500">Safety Index</span>
                  <div className="font-mono tabular-nums text-xl font-bold text-slate-900 mt-1">
                    {country.lifestyle.safetyScore}/100
                  </div>
                  <span className="text-[11px] text-slate-400 mt-0.5 block">Global Peace metric</span>
                </div>

                <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-xs text-slate-500">Walkability Score</span>
                  <div className="font-mono tabular-nums text-xl font-bold text-slate-900 mt-1">
                    {country.lifestyle.walkabilityScore}/100
                  </div>
                  <span className="text-[11px] text-slate-400 mt-0.5 block">Town center accessibility</span>
                </div>

                <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-xs text-slate-500">Expat Community</span>
                  <div className="text-sm font-bold text-slate-900 mt-1 truncate" title={country.lifestyle.expatCommunitySize}>
                    {country.lifestyle.expatCommunitySize}
                  </div>
                  <span className="text-[11px] text-slate-400 mt-0.5 block">Active resident base</span>
                </div>

                <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-xs text-slate-500">Tax Treatment</span>
                  <div className="text-sm font-bold text-teal-700 mt-1 truncate" title={country.visa.taxStatus}>
                    Special Expat Regime
                  </div>
                  <span className="text-[11px] text-slate-400 mt-0.5 block">Favorable treaties</span>
                </div>
              </div>
            </div>

            {/* Recharts Radar Comparison: Country vs. Global Benchmark */}
            <CountryRadarComparison country={country} />

            {/* Pros & Cons Balanced Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center gap-2 mb-4 text-emerald-800">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-base font-bold text-slate-900">Retirement Advantages</h3>
                </div>
                <ul className="space-y-2.5 text-sm text-slate-700">
                  {country.pros.map((pro, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 shrink-0" />
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center gap-2 mb-4 text-amber-800">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                  <h3 className="text-base font-bold text-slate-900">Trade-offs & Considerations</h3>
                </div>
                <ul className="space-y-2.5 text-sm text-slate-700">
                  {country.cons.map((con, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-2 shrink-0" />
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Pre-Retirement FAQ & Relocation Hurdles Callout */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
                  <FileCheck className="w-5 h-5 text-teal-700" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Pre-Retirement Hurdles & Knowledge Base: Banking, Taxes & Language
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5 max-w-2xl leading-relaxed">
                    Review concrete requirements for opening local bank accounts, cross-border tax residency rules (183-day thresholds), Medicare limitations, and practical tips for handling administrative bureaucracy in {country.name}.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('faq')}
                className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-2xs"
              >
                <span>Explore Relocation FAQ</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Meet Fellow Expats Teaser - Saffron & Lavender Luminous Gradient */}
            <div className="bg-gradient-to-r from-orange-50/90 via-purple-50/40 to-blue-50/50 border border-orange-200/80 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">Connect with {country.name} Expats</h3>
                <p className="text-slate-600 text-sm mt-1 max-w-xl leading-relaxed">
                  Chat directly with fellow retirees already living in {country.name} or join upcoming meetups in Cascais, Chiang Mai, or Medellín.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('community')}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 via-amber-600 to-purple-600 text-white font-bold text-xs hover:from-orange-700 hover:to-purple-700 transition-all whitespace-nowrap shrink-0 shadow-2xs"
              >
                View Community & Meetups
              </button>
            </div>

          </div>
        )}

        {/* TAB 2: VISA & RESIDENCY RULES */}
        {activeTab === 'visa' && (
          <div className="space-y-6">
            
            {/* Primary Visa Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-orange-800">Official Visa Classification</span>
                  <h2 className="text-2xl font-bold text-slate-900 mt-1">
                    {country.visa.retirementVisaName}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Permitted to work locally: {country.visa.allowedToWork ? 'Yes (Remote / Investment)' : 'Strictly passive income only (No local employment)'}
                  </p>
                </div>

                <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-lg p-3 shrink-0">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Min. Passive Income</span>
                    <span className="font-mono tabular-nums text-lg font-bold text-slate-900">
                      ${country.visa.minimumIncomeUSD.toLocaleString()}
                      <span className="text-xs font-sans text-slate-500 font-normal">/mo</span>
                    </span>
                  </div>
                  <div className="w-px h-8 bg-slate-200" />
                  <div>
                    <span className="text-[11px] text-slate-400 block">Processing Time</span>
                    <span className="font-mono tabular-nums text-lg font-bold text-slate-900">
                      ~{country.visa.processingMonths} mos
                    </span>
                  </div>
                </div>
              </div>

              {/* Roadmap to PR / Citizenship */}
              <div className="my-6 p-4 rounded-lg bg-orange-50/70 border border-orange-200 flex items-start gap-3">
                <FileCheck className="w-5 h-5 text-orange-700 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-orange-950 block">Path to Permanent Residency & Citizenship</span>
                  <p className="text-xs text-orange-900 mt-0.5 leading-relaxed">
                    {country.visa.pathwayToPR}
                  </p>
                </div>
              </div>

              {/* Mandatory Checklist / Requirements */}
              <h3 className="text-base font-bold text-slate-900 mb-3">Key Qualification Requirements</h3>
              <div className="space-y-2.5">
                {country.visa.keyRequirements.map((req, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs sm:text-sm text-slate-700">
                    <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-900 font-mono text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{req}</span>
                  </div>
                ))}
              </div>

              {/* Tax Regime Information */}
              <div className="mt-8 pt-6 border-t border-slate-100">
                <h3 className="text-base font-bold text-slate-900 mb-2">Retiree Tax Landscape</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-amber-50/70 border border-amber-100 p-4 rounded-lg">
                  <strong className="text-amber-900 block mb-1">Fiscal Status & Treaties:</strong>
                  {country.visa.taxStatus}
                </p>
              </div>
            </div>

            {/* Dedicated Structured Visa Eligibility, Duration & Financial Matrix */}
            <VisaRequirementsTable country={country} />

            {/* Short-Stay, Trial & Alternative Visa Pathways */}
            <ShortTermVisaOptions country={country} />

            {/* Cross-link to Relocation & Hurdles FAQ */}
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-amber-950 flex items-center gap-2">
                  <span>Questions about Opening Bank Accounts, FATCA, or 183-Day Tax Rules?</span>
                </h4>
                <p className="text-xs text-amber-900/80 mt-1">
                  Read detailed answers on avoiding double taxation, healthcare coverage transitions, and legal fixers in our relocation FAQ.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('faq')}
                className="px-3.5 py-2 rounded-lg bg-amber-900 text-white font-semibold text-xs hover:bg-amber-950 transition-colors whitespace-nowrap shrink-0"
              >
                View Relocation & Hurdles FAQ →
              </button>
            </div>

          </div>
        )}

        {/* TAB 3: ANNUAL RETIREMENT BUDGET CALCULATOR */}
        {activeTab === 'cost' && (
          <div className="space-y-8">
            <AnnualRetirementBudgetCalculator country={country} />
          </div>
        )}

        {/* TAB 4: TRAVEL, FAMOUS RETIREMENT ACTIVITIES & DOMESTIC MOBILITY */}
        {activeTab === 'travel' && (
          <CountryTravelAndMobility country={country} />
        )}

        {/* TAB 5: PRE-RETIREMENT FAQS & RELOCATION HURDLES */}
        {activeTab === 'faq' && (
          <div className="space-y-8">
            <CountryFaqHurdles country={country} />
          </div>
        )}

        {/* TAB 4: CLIMATE & WEATHER */}
        {activeTab === 'climate' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-2">Climate & Meteorological Profile</h2>
              <p className="text-xs text-slate-500 mb-6">
                Objective climate data for {country.name} to help you plan outdoor living and seasonal travel.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="p-5 rounded-xl bg-amber-50/60 border border-amber-100">
                  <div className="flex items-center gap-2 text-amber-700">
                    <Sun className="w-5 h-5" />
                    <span className="text-xs font-bold uppercase tracking-wider">Annual Sunshine</span>
                  </div>
                  <div className="font-mono tabular-nums text-3xl font-extrabold text-slate-900 mt-2">
                    {country.climate.annualSunnyDays}
                    <span className="text-sm font-sans font-normal text-slate-500 ml-1">days / year</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-2">
                    Ranked among top sunny destinations worldwide.
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-purple-50/60 border border-purple-100">
                  <div className="flex items-center gap-2 text-purple-700">
                    <Compass className="w-5 h-5" />
                    <span className="text-xs font-bold uppercase tracking-wider">Average Temperature</span>
                  </div>
                  <div className="font-mono tabular-nums text-3xl font-extrabold text-slate-900 mt-2">
                    {country.climate.averageTempC}°C
                    <span className="text-sm font-sans font-normal text-slate-500 ml-1">
                      ({Math.round((country.climate.averageTempC * 9) / 5 + 32)}°F)
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-2">
                    Category: {country.climate.category}
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2 text-slate-700">
                    <SlidersHorizontal className="w-5 h-5" />
                    <span className="text-xs font-bold uppercase tracking-wider">Relative Humidity</span>
                  </div>
                  <div className="font-mono tabular-nums text-3xl font-extrabold text-slate-900 mt-2">
                    {country.climate.humidityPercent}%
                  </div>
                  <p className="text-xs text-slate-600 mt-2">
                    Annual average ambient relative humidity.
                  </p>
                </div>
              </div>

              {/* Seasonal Calendar Summary */}
              <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-xs font-bold text-slate-700 block mb-1">Peak Ideal Weather Months</span>
                  <span className="text-sm font-medium text-orange-900 font-semibold">{country.climate.bestMonths}</span>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-xs font-bold text-slate-700 block mb-1">Rainfall & Wet Season</span>
                  <span className="text-sm font-medium text-slate-700">{country.climate.rainyMonths}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: DEMOGRAPHICS, DATING & NIGHTLIFE */}
        {activeTab === 'lifestyle' && (
          <div className="space-y-6">
            
            {/* Demographics Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-2">Demographics & Social Atmosphere</h2>
              <p className="text-xs text-slate-500 mb-6">
                Factual population metrics and local social dynamics for {country.name}.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-xs text-slate-500 block">Median National Age</span>
                  <span className="font-mono tabular-nums text-2xl font-bold text-slate-900 mt-1 block">
                    {country.demographics.medianAge} yrs
                  </span>
                </div>

                <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-xs text-slate-500 block">Females per 100 Males</span>
                  <span className="font-mono tabular-nums text-2xl font-bold text-purple-700 mt-1 block">
                    {country.demographics.femalesPer100Males.toFixed(1)} : 100
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5 block">
                    Ratio {(country.demographics.femalesPer100Males / 100).toFixed(2)} F : 1 M
                  </span>
                </div>

                <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-xs text-slate-500 block">Youth Population (&lt;30)</span>
                  <span className="font-mono tabular-nums text-2xl font-bold text-purple-700 mt-1 block">
                    {country.demographics.youngPopulationPercent}%
                  </span>
                </div>

                <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-xs text-slate-500 block">Dating Openness Score</span>
                  <span className="font-mono tabular-nums text-2xl font-bold text-amber-700 mt-1 block">
                    {country.demographics.datingRating} / 5
                  </span>
                </div>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-slate-700">
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                  <strong className="text-slate-900 block mb-1">Dating Culture Dynamics:</strong>
                  {country.demographics.datingCultureSummary}
                </div>
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                  <strong className="text-slate-900 block mb-1">Everyday Social Atmosphere:</strong>
                  {country.demographics.socialAtmosphere}
                </div>
              </div>
            </div>

            {/* Nightlife & Adult Entertainment Section (with discreet toggle) */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Nightlife, Venues & Adult Entertainment</h3>
                  <span className="text-xs text-slate-500">Empirical regulatory status and entertainment density</span>
                </div>

                <button
                  onClick={() => setDiscreetLifestyleEnabled(!discreetLifestyleEnabled)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                    discreetLifestyleEnabled
                      ? 'bg-amber-500 text-slate-950 border-amber-400'
                      : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  {discreetLifestyleEnabled ? 'Hide Details' : 'Show Details'}
                </button>
              </div>

              {discreetLifestyleEnabled ? (
                <div className="space-y-4 mt-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-xs text-slate-500 block">Nightlife Vibrancy</span>
                      <span className="text-sm font-bold text-slate-900 mt-1 block">
                        {country.adultEntertainment.nightlifeVibrancy}
                      </span>
                    </div>

                    <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-xs text-slate-500 block">Adult Venue Score</span>
                      <span className="font-mono tabular-nums text-lg font-bold text-slate-900 mt-1 block">
                        {country.adultEntertainment.adultEntertainmentScore} / 5
                      </span>
                    </div>

                    <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-xs text-slate-500 block">Regulatory Framework</span>
                      <span className="text-xs font-medium text-slate-700 mt-1 block">
                        {country.adultEntertainment.legalStatus}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 text-xs sm:text-sm text-slate-700 space-y-3">
                    <p>{country.adultEntertainment.overview}</p>
                    <div>
                      <strong className="text-slate-900 block mb-1">Key Entertainment Zones:</strong>
                      <div className="flex flex-wrap gap-2">
                        {country.adultEntertainment.topVenuesOrDistricts.map((d, i) => (
                          <span key={i} className="px-2.5 py-1 rounded bg-slate-200/70 text-slate-800 text-xs font-medium">
                            {d}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 border-t border-slate-200 pt-2">
                      <strong className="text-slate-700">Safety Guidance:</strong> {country.adultEntertainment.safetyGuidance}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-lg bg-slate-50 border border-slate-200 text-center">
                  <p className="text-xs text-slate-600 mb-3">
                    Nightlife and adult entertainment indicators are currently softened. Click "Show Details" above to view complete regulatory status and district metrics.
                  </p>
                  <button
                    onClick={() => setDiscreetLifestyleEnabled(true)}
                    className="px-4 py-1.5 text-xs font-medium rounded-lg bg-slate-900 text-white hover:bg-slate-800"
                  >
                    Reveal Nightlife & Lifestyle Data
                  </button>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 6: TOP EXPAT TOWNS */}
        {activeTab === 'cities' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-2">Premier Expat Towns & Regions</h2>
              <p className="text-xs text-slate-500 mb-6">
                Explore the top retirement hubs across {country.name}, from coastal beach havens to cultural mountain valleys.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {country.topCities.map((city, idx) => (
                  <div key={idx} className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <h3 className="text-base font-bold text-slate-900">{city.name}</h3>
                        <span className="font-mono tabular-nums text-xs font-semibold text-orange-900 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                          ~${city.monthlyCostUSD}/mo
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-600 mb-3">
                        {city.vibe}
                      </p>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {city.highlight}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs">
                      <span className="text-slate-400">Regional Tier</span>
                      <button
                        onClick={() => {
                          if (!isAuthenticated) {
                            openAuthModal('login');
                            return;
                          }
                          startDmWithPeer(`Resident of ${city.name}`, country.name, city.name, `Hi! I saw ${city.name} on ReFirely and would love to ask about living there.`);
                        }}
                        className="text-orange-700 font-semibold hover:underline cursor-pointer"
                      >
                        Ask a Local
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: COMMUNITY & CONNECT */}
        {activeTab === 'community' && (
          <div className="space-y-8">
            
            {/* Direct Connect with Local Expats Box */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Connect with Fellow Retirees in {country.name}</h2>
                  <p className="text-xs text-slate-500">
                    Reach out directly for firsthand answers on leases, healthcare, and expat friendship circles.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                {localExpats.map((expat, idx) => (
                  <div key={idx} className="p-5 rounded-xl border border-slate-200 bg-slate-50 flex items-start justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{expat.name}</h4>
                      {/* Clean unboxed metadata with typographic separators */}
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5 mb-2">
                        <span>{expat.city}</span>
                        <span aria-hidden="true">·</span>
                        <span>{expat.yearsInCountry}</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        "{expat.note}"
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        if (!isAuthenticated) {
                          openAuthModal('login');
                          return;
                        }
                        startDmWithPeer(expat.name, country.name, expat.city, `Hello ${expat.name}! I am exploring retirement in ${country.name} and would love to ask your advice.`);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-orange-600 via-amber-600 to-purple-600 text-white font-semibold text-xs hover:from-orange-700 hover:to-purple-700 transition-all shrink-0 flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Chat</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Meetups in Country */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8">
              <div className="flex items-center justify-between gap-4 mb-4">
                <h3 className="text-lg font-bold text-slate-900">Expat Meetups in {country.name}</h3>
                <button
                  onClick={() => setCurrentView('meetups')}
                  className="text-xs font-semibold text-orange-700 hover:text-orange-800 hover:underline"
                >
                  View All Platform Meetups →
                </button>
              </div>

              {countryMeetups.length > 0 ? (
                <div className="space-y-3">
                  {countryMeetups.map(meetup => (
                    <div key={meetup.id} className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                          <Calendar className="w-3.5 h-3.5 text-orange-600" />
                          <span>{meetup.date} ({meetup.time})</span>
                          <span aria-hidden="true">·</span>
                          <span>{meetup.city}</span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900">{meetup.title}</h4>
                        <p className="text-xs text-slate-600 mt-1">{meetup.location}</p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs font-mono tabular-nums text-slate-600">
                          {meetup.attendeesCount} attending
                        </span>
                        <button
                          onClick={() => useApp().toggleRsvpMeetup(meetup.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                            meetup.isRsvped
                              ? 'bg-purple-600 text-white'
                              : 'bg-slate-900 text-white hover:bg-slate-800'
                          }`}
                        >
                          {meetup.isRsvped ? 'RSVP Confirmed ✓' : 'RSVP Free'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  No scheduled meetups in {country.name} this month. Check out our Community Hub to propose one!
                </p>
              )}
            </div>

            {/* Forum Discussions */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8">
              <div className="flex items-center justify-between gap-4 mb-4">
                <h3 className="text-lg font-bold text-slate-900">Discussion Threads on {country.name}</h3>
                <button
                  onClick={() => setCurrentView('community')}
                  className="text-xs font-semibold text-orange-700 hover:text-orange-800 hover:underline"
                >
                  Go to Community Hub →
                </button>
              </div>

              {countryThreads.length > 0 ? (
                <div className="space-y-3">
                  {countryThreads.map(thread => (
                    <div key={thread.id} className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                        <span>{thread.category}</span>
                        <span aria-hidden="true">·</span>
                        <span>{thread.authorName}</span>
                        <span aria-hidden="true">·</span>
                        <span>{thread.createdAt}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 hover:text-orange-700 cursor-pointer" onClick={() => setCurrentView('community')}>
                        {thread.title}
                      </h4>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                        {thread.content}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  Be the first to start a discussion thread for {country.name}!
                </p>
              )}
            </div>

          </div>
        )}

      </main>

      {/* Complete Country Dossier PDF Export & Preview Studio Modal */}
      <CountryDossierPdfModal
        country={country}
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        userProfile={userProfile}
        isAuthenticated={isAuthenticated}
        journalEntry={journalEntries[country.id]}
        threads={countryThreads}
        meetups={countryMeetups}
        discreetLifestyleEnabled={discreetLifestyleEnabled}
      />
    </div>
  );
};
