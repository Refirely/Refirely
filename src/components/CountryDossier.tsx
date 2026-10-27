import React, { useState } from 'react';
import { Country } from '../types';
import { useApp } from '../context/AppContext';
import { CountryRadarComparison } from './CountryRadarComparison';
import { VisaRequirementsTable } from './VisaRequirementsTable';
import { ShortTermVisaOptions } from './ShortTermVisaOptions';
import { AnnualRetirementBudgetCalculator } from './AnnualRetirementBudgetCalculator';
import { CountryFaqHurdles } from './CountryFaqHurdles';
import { CountryTravelAndMobility } from './CountryTravelAndMobility';
import { CountryHealthcareTab } from './CountryHealthcareTab';
import { CountryFinancesAndTaxesTab } from './CountryFinancesAndTaxesTab';
import { CountryLifestyleAndDatingSection } from './CountryLifestyleAndDatingSection';
import { CountryDossierPdfModal } from './CountryDossierPdfModal';
import { CountryFlag } from './CountryFlag';
import { HavenMatcherPromoCard } from './HavenMatcherPromoCard';
import { getFullCountryUrl } from '../utils/seo';
import { trackAnalyticsEvent } from '../utils/analytics';
import {
  ArrowLeft,
  Heart,
  Scale,
  Sun,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  Calendar,
  ChevronRight,
  Share2,
  SlidersHorizontal,
  Stethoscope,
  Compass,
  BookOpen,
  Download,
  FileText,
  Sparkles,
  MapPin,
  Users,
  Shield,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CountryDossierProps {
  country: Country;
}

const TOWN_CARD_ACCENTS = [
  {
    ribbon: 'from-teal-400 via-emerald-500 to-cyan-500',
    bg: 'from-teal-50/60 via-white to-emerald-50/40',
    border: 'border-teal-200/80 hover:border-teal-300',
    badge: 'bg-teal-50 text-teal-900 border-teal-200',
    btn: 'from-teal-600 to-emerald-600',
  },
  {
    ribbon: 'from-indigo-500 via-violet-500 to-purple-500',
    bg: 'from-indigo-50/60 via-white to-violet-50/40',
    border: 'border-indigo-200/80 hover:border-indigo-300',
    badge: 'bg-indigo-50 text-indigo-900 border-indigo-200',
    btn: 'from-indigo-600 to-violet-600',
  },
  {
    ribbon: 'from-amber-400 via-orange-500 to-rose-500',
    bg: 'from-amber-50/60 via-white to-orange-50/40',
    border: 'border-amber-200/80 hover:border-amber-300',
    badge: 'bg-amber-50 text-amber-900 border-amber-200',
    btn: 'from-amber-500 to-orange-600',
  },
];

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
    toggleRsvpMeetup,
  } = useApp();

  // Active section tab
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'visa'
    | 'healthcare'
    | 'finances'
    | 'cost'
    | 'travel'
    | 'faq'
    | 'lifestyle'
    | 'cities'
    | 'community'
  >('overview');
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
      name:
        country.id === 'portugal'
          ? 'Arthur Sterling'
          : country.id === 'thailand'
          ? 'David Chen'
          : country.id === 'spain'
          ? 'Elena Rostova'
          : 'Michael Thorne',
      origin: 'United States',
      yearsInCountry: '4 years living locally',
      city: country.topCities[0]?.name || country.capital,
      note: `Happy to share tips on renting, immigration appointments, and local healthcare in ${country.name}.`,
    },
    {
      name:
        country.id === 'portugal'
          ? 'Margaret O’Connor'
          : country.id === 'thailand'
          ? 'Frank Gallagher'
          : country.id === 'spain'
          ? 'Carlos Mendonza'
          : 'Claire Dupont',
      origin: 'United Kingdom / Canada',
      yearsInCountry: '2 years living locally',
      city: country.topCities[1]?.name || country.capital,
      note: `Ask me anything about daily expenses, language learning, and expat social groups in ${country.name}!`,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-indigo-50/20 to-slate-50 pb-20">
      {/* Breadcrumb Navigation & Top Action Bar */}
      <div className="bg-white/90 backdrop-blur-md border-b border-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <a
            href="/?view=explore"
            onClick={e => {
              if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && e.button === 0) {
                e.preventDefault();
                setCurrentView('explore');
              }
            }}
            className="inline-flex items-center gap-2 text-xs font-bold text-indigo-900 hover:text-teal-700 transition-colors"
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
              className="hover:text-indigo-800 transition-colors"
            >
              Explore
            </a>
            <span aria-hidden="true">/</span>
            <span>{country.region}</span>
            <span aria-hidden="true">/</span>
            <span className="text-indigo-950 font-bold">{country.name}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Share / Copy Dedicated Country URL Button */}
            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleCopyCountryLink}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer ${
                copiedLink
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                  : 'bg-white border-indigo-200/80 text-slate-700 hover:bg-indigo-50/50'
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
                  <Share2 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Share Link</span>
                </>
              )}
            </motion.button>

            {/* Export Full Dossier PDF Button */}
            <motion.button
              whileHover={{ y: -1, scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setIsPdfModalOpen(true)}
              className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-teal-500 via-indigo-600 to-amber-500 hover:from-teal-600 hover:to-amber-600 text-white transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
              title={`Export complete 29-page ${country.name} master retirement dossier as a formatted PDF`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export 29-Page Dossier PDF</span>
            </motion.button>

            {journalEntries[country.id] ? (
              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setCurrentView('dashboard')}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                title="View your private notes for this country in the Country Journal"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-700" />
                <span>Journal: {journalEntries[country.id].interestLevel}</span>
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setCurrentView('dashboard')}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-white border border-indigo-200/80 text-slate-700 hover:bg-indigo-50/50 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                title="Log private notes and interest level in Country Journal"
              >
                <BookOpen className="w-3.5 h-3.5 text-violet-600" />
                <span>Add to Journal</span>
              </motion.button>
            )}

            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => toggleCompareCountry(country.id)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
                compared
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-white border-indigo-200/80 text-slate-700 hover:bg-indigo-50/50'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>{compared ? 'In Compare Matrix' : 'Add to Compare'}</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => toggleSaveCountry(country.id)}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                saved
                  ? 'bg-rose-50 text-rose-600 border-rose-200 shadow-2xs'
                  : 'bg-white text-slate-600 border-indigo-200/80 hover:text-rose-600'
              }`}
              title={saved ? 'Saved in your shortlist' : 'Save to shortlist'}
            >
              <Heart className={`w-4 h-4 ${saved ? 'fill-rose-600' : ''}`} />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Hero Dossier Header - Multi-Colored Luminous Palette & Ambient Glow */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-50/90 via-white to-amber-50/85 text-slate-900 py-10 border-b border-indigo-200/80 shadow-xs">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 via-indigo-500 via-50% to-amber-500" />
        <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full bg-indigo-400/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-teal-400/15 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3.5">
                <CountryFlag
                  countryCode={country.code}
                  countryName={country.name}
                  fallbackEmoji={country.flag}
                  size="2xl"
                  className="w-12 h-8 sm:w-14 sm:h-9.5 rounded-xs shrink-0 shadow-xs"
                />
                <div>
                  <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                    {country.name}{' '}
                    <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-teal-600 bg-clip-text text-transparent">
                      Retirement Guide
                    </span>
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 mt-1">
                    <span className="font-bold text-indigo-900">Capital: {country.capital}</span>
                    <span aria-hidden="true">·</span>
                    <span>Currency: {country.currency}</span>
                    <span aria-hidden="true">·</span>
                    <span>Language: {country.language}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-teal-800 font-bold">
                      English: {country.lifestyle.englishProficiency}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-slate-600 max-w-3xl leading-relaxed mt-2">
                {country.tagline}
              </p>
            </div>

            {/* Quick KPI Strip - Multi-Colored Luminous Cards */}
            <div className="flex items-center gap-4 sm:gap-6 bg-white/95 backdrop-blur-xs border border-indigo-200/80 rounded-2xl px-5 py-4 shrink-0 shadow-sm">
              <div>
                <span className="text-[11px] text-emerald-800 font-bold uppercase tracking-wider block">
                  Single Living
                </span>
                <span className="font-mono tabular-nums text-xl font-extrabold text-emerald-950">
                  ${country.costOfLiving.monthlyBudgetSingleUSD.toLocaleString()}
                  <span className="text-xs font-sans font-normal text-slate-400 ml-1">/mo</span>
                </span>
              </div>
              <div className="w-px h-9 bg-indigo-100" />
              <button
                onClick={() => setActiveTab('healthcare')}
                className="text-left group cursor-pointer"
                title="Click to open full Healthcare, Emergency & Insurance guide"
              >
                <span className="text-[11px] text-indigo-800 font-bold uppercase tracking-wider block group-hover:underline">
                  Healthcare Score →
                </span>
                <span className="font-mono tabular-nums text-xl font-extrabold text-indigo-950">
                  {country.lifestyle.healthcareScore}/100
                </span>
              </button>
              <div className="w-px h-9 bg-indigo-100" />
              <div>
                <span className="text-[11px] text-amber-800 font-bold uppercase tracking-wider block">
                  Sunny Days
                </span>
                <span className="font-mono tabular-nums text-xl font-extrabold text-amber-900">
                  {country.climate.annualSunnyDays} d/yr
                </span>
              </div>
            </div>
          </div>

          {/* Under Country Description & Above Tabs: Catchy Haven Matcher Signup Card */}
          <div className="pt-6">
            <HavenMatcherPromoCard variant="dossier" countryName={country.name} />
          </div>

          {/* Section Navigation Tabs (Animated Segmented Controls — Full Visibility & Responsive Wrap) */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-6 pb-1 border-t border-indigo-100/80 mt-6 text-xs font-medium">
            {[
              { id: 'overview', label: 'Overview', title: 'Country Overview, Climate & Core Metrics' },
              { id: 'visa', label: 'Visas', title: 'Visas, Residency & Qualification Rules' },
              { id: 'healthcare', label: 'Healthcare', title: 'Healthcare Access, Emergency & Insurance' },
              { id: 'finances', label: 'Finances & Tax', title: 'National & Private Banks, Remittances & Expat Taxes' },
              { id: 'cost', label: 'Budget', title: 'Interactive Annual Retirement Budget Calculator' },
              { id: 'travel', label: 'Travel', title: 'Travel, Leisure & Domestic Mobility' },
              { id: 'faq', label: 'FAQ', title: 'Relocation FAQs & Practical Hurdles' },
              {
                id: 'lifestyle',
                label: 'Lifestyle & Dating',
                title: 'Culture, Dating Expectations, Dos & Don’ts & Scam Protection',
              },
              {
                id: 'community',
                label: 'Expat cities & Community',
                title: `Top Expat Cities, Mentors, Forum Discussions & Meetups (${
                  country.topCities.length + countryThreads.length + countryMeetups.length
                })`,
              },
            ].map(tab => {
              const isActive =
                activeTab === tab.id || (tab.id === 'community' && activeTab === 'cities');
              return (
                <motion.button
                  key={tab.id}
                  title={tab.title}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    setActiveTab(tab.id as typeof activeTab);
                    trackAnalyticsEvent('dossier_tab_select', {
                      country_id: country.id,
                      country_name: country.name,
                      tab_id: tab.id,
                      tab_label: tab.label,
                    });
                  }}
                  className={`relative px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl whitespace-nowrap transition-all font-bold cursor-pointer ${
                    isActive
                      ? 'text-white shadow-sm shadow-indigo-500/20'
                      : 'bg-white text-slate-700 hover:text-indigo-950 hover:bg-indigo-50/80 border border-indigo-200/70 shadow-2xs'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="dossierActiveTabPill"
                      transition={{ type: 'spring', stiffness: 360, damping: 28 }}
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-teal-500 via-indigo-600 to-violet-600"
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area with Smooth Animated Tab Transitions */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
          >
            {/* TAB 1: OVERVIEW & HIGHLIGHTS */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Overview paragraph & quick card */}
                <div className="relative overflow-hidden bg-white rounded-3xl border border-indigo-100/90 p-6 sm:p-8 shadow-sm">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-400 via-indigo-500 to-amber-500" />
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 block mb-0.5">
                        Executive Haven Summary
                      </span>
                      <h2 className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-slate-900 via-indigo-950 to-teal-900 bg-clip-text text-transparent">
                        Country Dossier Overview
                      </h2>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setIsPdfModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-teal-50 via-indigo-50 to-amber-50 hover:from-teal-100 hover:to-amber-100 text-indigo-950 border border-indigo-200/80 text-xs font-bold transition-all self-start sm:self-auto cursor-pointer shadow-2xs"
                    >
                      <FileText className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Preview &amp; Export 29-Page {country.name} PDF</span>
                    </motion.button>
                  </div>
                  <p className="text-slate-700 leading-relaxed text-sm sm:text-base">
                    {country.overview}
                  </p>

                  {/* Empirical Core Metrics Grid - 4-Color Luminous Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-indigo-100/80">
                    <motion.div
                      whileHover={{ y: -3 }}
                      transition={{ type: 'spring', stiffness: 360, damping: 24 }}
                      className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-emerald-50/90 via-teal-50/50 to-white border border-emerald-200/80 shadow-2xs"
                    >
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-500" />
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block">
                        Safety Index
                      </span>
                      <div className="font-mono tabular-nums text-2xl font-extrabold text-emerald-950 mt-1">
                        {country.lifestyle.safetyScore}/100
                      </div>
                      <span className="text-[11px] text-emerald-700/80 font-medium mt-0.5 block">
                        Global Peace metric
                      </span>
                    </motion.div>

                    <motion.div
                      whileHover={{ y: -3 }}
                      transition={{ type: 'spring', stiffness: 360, damping: 24 }}
                      className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-indigo-50/90 via-blue-50/50 to-white border border-indigo-200/80 shadow-2xs"
                    >
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-blue-500" />
                      <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-800 block">
                        Walkability Score
                      </span>
                      <div className="font-mono tabular-nums text-2xl font-extrabold text-indigo-950 mt-1">
                        {country.lifestyle.walkabilityScore}/100
                      </div>
                      <span className="text-[11px] text-indigo-700/80 font-medium mt-0.5 block">
                        Town center accessibility
                      </span>
                    </motion.div>

                    <motion.div
                      whileHover={{ y: -3 }}
                      transition={{ type: 'spring', stiffness: 360, damping: 24 }}
                      className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-violet-50/90 via-purple-50/50 to-white border border-violet-200/80 shadow-2xs"
                    >
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-purple-500" />
                      <span className="text-[11px] font-bold uppercase tracking-wider text-violet-800 block">
                        Expat Community
                      </span>
                      <div
                        className="text-sm sm:text-base font-extrabold text-violet-950 mt-1.5 truncate"
                        title={country.lifestyle.expatCommunitySize}
                      >
                        {country.lifestyle.expatCommunitySize}
                      </div>
                      <span className="text-[11px] text-violet-700/80 font-medium mt-0.5 block">
                        Active resident base
                      </span>
                    </motion.div>

                    <motion.div
                      whileHover={{ y: -3 }}
                      transition={{ type: 'spring', stiffness: 360, damping: 24 }}
                      className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-amber-50/90 via-orange-50/50 to-white border border-amber-200/80 shadow-2xs"
                    >
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500" />
                      <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 block">
                        Tax Treatment
                      </span>
                      <div
                        className="text-sm sm:text-base font-extrabold text-amber-950 mt-1.5 truncate"
                        title={country.visa.taxStatus}
                      >
                        Special Expat Regime
                      </div>
                      <span className="text-[11px] text-amber-700/80 font-medium mt-0.5 block">
                        Favorable treaties
                      </span>
                    </motion.div>
                  </div>
                </div>

                {/* Recharts Radar Comparison: Country vs. Global Benchmark */}
                <CountryRadarComparison country={country} />

                {/* Pros & Cons Balanced Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <motion.div
                    whileHover={{ y: -3 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                    className="relative overflow-hidden bg-gradient-to-br from-emerald-50/60 via-white to-teal-50/40 rounded-3xl border border-emerald-200/90 p-6 sm:p-7 shadow-xs"
                  >
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500" />
                    <div className="flex items-center gap-2.5 mb-4">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-2xs">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                        Retirement Advantages
                      </h3>
                    </div>
                    <ul className="space-y-3 text-sm text-slate-700">
                      {country.pros.map((pro, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <span className="w-2 h-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 mt-2 shrink-0" />
                          <span className="leading-relaxed">{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>

                  <motion.div
                    whileHover={{ y: -3 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                    className="relative overflow-hidden bg-gradient-to-br from-amber-50/60 via-white to-rose-50/40 rounded-3xl border border-amber-200/90 p-6 sm:p-7 shadow-xs"
                  >
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500" />
                    <div className="flex items-center gap-2.5 mb-4">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-rose-500 text-white flex items-center justify-center shadow-2xs">
                        <AlertCircle className="w-4 h-4" />
                      </div>
                      <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                        Trade-offs &amp; Considerations
                      </h3>
                    </div>
                    <ul className="space-y-3 text-sm text-slate-700">
                      {country.cons.map((con, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <span className="w-2 h-2 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 mt-2 shrink-0" />
                          <span className="leading-relaxed">{con}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                </div>

                {/* Climate & Meteorological Profile (Integrated under Overview) */}
                <div className="relative overflow-hidden bg-white rounded-3xl border border-indigo-100/90 p-6 sm:p-8 shadow-sm">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-teal-500 to-indigo-500" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 block mb-0.5">
                    Atmospheric &amp; Seasonal Profile
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-slate-900 via-indigo-950 to-teal-900 bg-clip-text text-transparent mb-1">
                    Climate &amp; Weather Overview
                  </h2>
                  <p className="text-xs text-slate-500 mb-6">
                    Objective climate data for {country.name} to help you plan outdoor living and seasonal travel.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <motion.div
                      whileHover={{ y: -4 }}
                      transition={{ type: 'spring', stiffness: 340, damping: 24 }}
                      className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br from-amber-50/90 via-orange-50/50 to-white border border-amber-200/80 shadow-xs"
                    >
                      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500" />
                      <div className="flex items-center gap-2 text-amber-800">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-2xs">
                          <Sun className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-extrabold uppercase tracking-wider">
                          Annual Sunshine
                        </span>
                      </div>
                      <div className="font-mono tabular-nums text-3xl font-extrabold text-amber-950 mt-3">
                        {country.climate.annualSunnyDays}
                        <span className="text-sm font-sans font-normal text-slate-500 ml-1">
                          days / year
                        </span>
                      </div>
                      <p className="text-xs text-amber-900/80 mt-2 font-medium">
                        Ranked among top sunny destinations worldwide.
                      </p>
                    </motion.div>

                    <motion.div
                      whileHover={{ y: -4 }}
                      transition={{ type: 'spring', stiffness: 340, damping: 24 }}
                      className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br from-indigo-50/90 via-violet-50/50 to-white border border-indigo-200/80 shadow-xs"
                    >
                      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />
                      <div className="flex items-center gap-2 text-indigo-900">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center shadow-2xs">
                          <Compass className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-extrabold uppercase tracking-wider">
                          Average Temperature
                        </span>
                      </div>
                      <div className="font-mono tabular-nums text-3xl font-extrabold text-indigo-950 mt-3">
                        {country.climate.averageTempC}°C
                        <span className="text-sm font-sans font-normal text-slate-500 ml-1">
                          ({Math.round((country.climate.averageTempC * 9) / 5 + 32)}°F)
                        </span>
                      </div>
                      <p className="text-xs text-indigo-900/80 mt-2 font-medium">
                        Category: {country.climate.category}
                      </p>
                    </motion.div>

                    <motion.div
                      whileHover={{ y: -4 }}
                      transition={{ type: 'spring', stiffness: 340, damping: 24 }}
                      className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br from-teal-50/90 via-cyan-50/50 to-white border border-teal-200/80 shadow-xs"
                    >
                      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-400 via-emerald-500 to-cyan-500" />
                      <div className="flex items-center gap-2 text-teal-900">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 text-white flex items-center justify-center shadow-2xs">
                          <SlidersHorizontal className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-extrabold uppercase tracking-wider">
                          Relative Humidity
                        </span>
                      </div>
                      <div className="font-mono tabular-nums text-3xl font-extrabold text-teal-950 mt-3">
                        {country.climate.humidityPercent}%
                      </div>
                      <p className="text-xs text-teal-900/80 mt-2 font-medium">
                        Annual average ambient relative humidity.
                      </p>
                    </motion.div>
                  </div>

                  {/* Seasonal Calendar Summary */}
                  <div className="mt-8 pt-6 border-t border-indigo-100/80 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-r from-emerald-50/70 to-teal-50/50 border border-emerald-200/80">
                      <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-b from-emerald-400 to-teal-500" />
                      <span className="text-xs font-bold text-emerald-900 block mb-1 pl-2">
                        Peak Ideal Weather Months
                      </span>
                      <span className="text-sm font-extrabold text-emerald-950 pl-2 block">
                        {country.climate.bestMonths}
                      </span>
                    </div>
                    <div className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-r from-indigo-50/70 to-blue-50/50 border border-indigo-200/80">
                      <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-b from-indigo-400 to-blue-500" />
                      <span className="text-xs font-bold text-indigo-900 block mb-1 pl-2">
                        Rainfall &amp; Wet Season
                      </span>
                      <span className="text-sm font-extrabold text-indigo-950 pl-2 block">
                        {country.climate.rainyMonths}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Healthcare, Emergency & Insurance Snapshot Callout */}
                <div className="relative overflow-hidden bg-gradient-to-r from-teal-50/90 via-white to-indigo-50/80 border border-teal-200/90 rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 via-cyan-500 to-indigo-500" />
                  <div className="flex items-start gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-teal-500 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Stethoscope className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm sm:text-base font-extrabold text-slate-900">
                          Healthcare Access, Emergency Services &amp; Expat Insurance
                        </h4>
                        <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-teal-100/80 text-teal-900 border border-teal-200">
                          Score: {country.lifestyle.healthcareScore}/100 · ~$
                          {country.costOfLiving.healthcareMonthlyUSD}/mo
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                        {country.lifestyle.healthcareSummary}{' '}
                        {country.lifestyle.publicHealthcareAccess}
                      </p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.03, x: 2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setActiveTab('healthcare')}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-700 hover:to-indigo-700 text-white font-bold text-xs transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <span>Healthcare &amp; Insurance Guide</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </motion.button>
                </div>

                {/* Pre-Retirement FAQ & Relocation Hurdles Callout */}
                <div className="relative overflow-hidden bg-gradient-to-r from-indigo-50/80 via-white to-amber-50/80 border border-indigo-200/80 rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-amber-500" />
                  <div className="flex items-start gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-600 to-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <FileCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-extrabold text-slate-900">
                        Pre-Retirement Hurdles &amp; Knowledge Base: Banking, Taxes &amp; Leases
                      </h4>
                      <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                        Review concrete requirements for opening local bank accounts, cross-border tax residency rules (183-day thresholds), language bureaucracy, and rental lease protocols in {country.name}.
                      </p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.03, x: 2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setActiveTab('faq')}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-amber-500 text-white font-bold text-xs transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <span>Explore Relocation FAQ</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </motion.button>
                </div>

                {/* Meet Fellow Expats Teaser */}
                <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-teal-950 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-md text-white">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-400 via-indigo-400 to-amber-400" />
                  <div className="pointer-events-none absolute -top-20 -right-20 w-64 h-64 rounded-full bg-teal-400/15 blur-3xl" />
                  <div className="relative">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/10 text-teal-300 border border-white/15 mb-2">
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      Verified Local Network
                    </span>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                      Connect with {country.name} Expats
                    </h3>
                    <p className="text-indigo-200/90 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
                      Chat directly with fellow retirees already living in {country.name} or join upcoming meetups in {country.topCities[0]?.name || country.capital}.
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.04, y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setActiveTab('community')}
                    className="relative px-5 py-3 rounded-xl bg-gradient-to-r from-teal-400 via-indigo-500 to-amber-500 text-white font-extrabold text-xs transition-all whitespace-nowrap shrink-0 shadow-md cursor-pointer"
                  >
                    Explore Expat Cities &amp; Community →
                  </motion.button>
                </div>
              </div>
            )}

            {/* TAB 2: VISA & RESIDENCY RULES */}
            {activeTab === 'visa' && (
              <div className="space-y-6">
                {/* Primary Visa Card */}
                <div className="relative overflow-hidden bg-white rounded-3xl border border-indigo-100/90 p-6 sm:p-8 shadow-sm">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-400 via-indigo-500 to-amber-500" />
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-indigo-100/80">
                    <div>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-800 border border-indigo-200">
                        <Shield className="w-3 h-3 text-indigo-600" />
                        Official Visa Classification
                      </span>
                      <h2 className="text-2xl font-extrabold bg-gradient-to-r from-slate-900 via-indigo-950 to-teal-900 bg-clip-text text-transparent mt-1.5">
                        {country.visa.retirementVisaName}
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">
                        Permitted to work locally:{' '}
                        <strong className="text-slate-800">
                          {country.visa.allowedToWork
                            ? 'Yes (Remote / Investment)'
                            : 'Strictly passive income only (No local employment)'}
                        </strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-4 bg-gradient-to-r from-emerald-50/80 via-indigo-50/50 to-amber-50/70 border border-indigo-200/80 rounded-2xl p-3.5 shrink-0 shadow-2xs">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                          Min. Passive Income
                        </span>
                        <span className="font-mono tabular-nums text-lg font-extrabold text-emerald-950">
                          ${country.visa.minimumIncomeUSD.toLocaleString()}
                          <span className="text-xs font-sans text-slate-500 font-normal">/mo</span>
                        </span>
                      </div>
                      <div className="w-px h-8 bg-indigo-200/80" />
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-800 block">
                          Processing Time
                        </span>
                        <span className="font-mono tabular-nums text-lg font-extrabold text-indigo-950">
                          ~{country.visa.processingMonths} mos
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Roadmap to PR / Citizenship */}
                  <div className="my-6 p-4 rounded-2xl bg-gradient-to-r from-teal-50/90 via-indigo-50/60 to-amber-50/70 border border-teal-200/80 flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                      <FileCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-extrabold text-indigo-950 block">
                        Path to Permanent Residency &amp; Citizenship
                      </span>
                      <p className="text-xs text-slate-700 mt-0.5 leading-relaxed">
                        {country.visa.pathwayToPR}
                      </p>
                    </div>
                  </div>

                  {/* Mandatory Checklist / Requirements */}
                  <h3 className="text-base font-extrabold text-slate-900 mb-3">
                    Key Qualification Requirements
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {country.visa.keyRequirements.map((req, idx) => {
                      const badgeGradients = [
                        'from-teal-500 to-emerald-600',
                        'from-indigo-500 to-violet-600',
                        'from-amber-500 to-orange-600',
                        'from-rose-500 to-pink-600',
                      ];
                      return (
                        <motion.div
                          key={idx}
                          whileHover={{ y: -2 }}
                          transition={{ type: 'spring', stiffness: 360, damping: 24 }}
                          className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50/90 hover:bg-white border border-slate-200/80 hover:border-indigo-200 text-xs sm:text-sm text-slate-700 shadow-2xs transition-colors"
                        >
                          <span
                            className={`w-6 h-6 rounded-lg bg-gradient-to-br ${
                              badgeGradients[idx % badgeGradients.length]
                            } text-white font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 shadow-2xs`}
                          >
                            {idx + 1}
                          </span>
                          <span className="leading-relaxed">{req}</span>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Tax Regime Information */}
                  <div className="mt-8 pt-6 border-t border-indigo-100/80">
                    <h3 className="text-base font-extrabold text-slate-900 mb-2">
                      Retiree Tax Landscape
                    </h3>
                    <div className="relative overflow-hidden text-xs sm:text-sm text-slate-700 leading-relaxed bg-gradient-to-r from-amber-50/80 via-orange-50/50 to-indigo-50/50 border border-amber-200/80 p-4 rounded-2xl">
                      <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-b from-amber-400 via-orange-500 to-indigo-500" />
                      <strong className="text-amber-950 block mb-1 pl-2">
                        Fiscal Status &amp; Treaties:
                      </strong>
                      <p className="pl-2">{country.visa.taxStatus}</p>
                    </div>
                  </div>
                </div>

                {/* Dedicated Structured Visa Eligibility, Duration & Financial Matrix */}
                <VisaRequirementsTable country={country} />

                {/* Short-Stay, Trial & Alternative Visa Pathways */}
                <ShortTermVisaOptions country={country} />

                {/* Cross-link to Healthcare Insurance & Relocation Hurdles FAQ */}
                <div className="relative overflow-hidden bg-gradient-to-r from-teal-50/90 via-indigo-50/70 to-amber-50/80 border border-indigo-200/80 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 via-indigo-500 to-amber-500" />
                  <div>
                    <h4 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
                      <span>
                        Need Compliant Visa Health Insurance or Banking / 183-Day Tax Guidance?
                      </span>
                    </h4>
                    <p className="text-xs text-slate-600 mt-1">
                      Review mandatory consular health insurance policies in the Healthcare tab, or explore banking, FATCA, and tax treaties in our Relocation FAQ.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setActiveTab('healthcare')}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-bold text-xs shadow-2xs cursor-pointer"
                    >
                      Visa Health Insurance Guide →
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setActiveTab('finances')}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-xs shadow-2xs cursor-pointer"
                    >
                      Finances, Banking &amp; Expat Taxes →
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setActiveTab('faq')}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-xs shadow-2xs cursor-pointer"
                    >
                      Relocation &amp; Hurdles FAQ →
                    </motion.button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2.5: HEALTHCARE ACCESS, EMERGENCY SERVICES & INSURANCE */}
            {activeTab === 'healthcare' && (
              <CountryHealthcareTab
                country={country}
                onNavigateTab={tab => setActiveTab(tab)}
              />
            )}

            {/* TAB 2.75: FINANCES, NATIONAL & PRIVATE BANKS, REMITTANCES & EXPAT TAXES */}
            {activeTab === 'finances' && (
              <CountryFinancesAndTaxesTab
                country={country}
                onNavigateTab={tab => setActiveTab(tab)}
              />
            )}

            {/* TAB 3: ANNUAL RETIREMENT BUDGET CALCULATOR */}
            {activeTab === 'cost' && (
              <div className="space-y-8">
                <AnnualRetirementBudgetCalculator
                  country={country}
                  onNavigateToHealthcare={() => setActiveTab('healthcare')}
                />
              </div>
            )}

            {/* TAB 4: TRAVEL, FAMOUS RETIREMENT ACTIVITIES & DOMESTIC MOBILITY */}
            {activeTab === 'travel' && <CountryTravelAndMobility country={country} />}

            {/* TAB 5: PRE-RETIREMENT FAQS & RELOCATION HURDLES */}
            {activeTab === 'faq' && (
              <div className="space-y-8">
                <CountryFaqHurdles
                  country={country}
                  onNavigateToHealthcare={() => setActiveTab('healthcare')}
                />
              </div>
            )}

            {/* TAB 7: DEMOGRAPHICS, DATING & NIGHTLIFE */}
            {activeTab === 'lifestyle' && (
              <div className="space-y-6">
                {/* Demographics Card */}
                <div className="relative overflow-hidden bg-white rounded-3xl border border-indigo-100/90 p-6 sm:p-8 shadow-sm">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-amber-500" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-violet-700 block mb-0.5">
                    Social Fabric &amp; Community Dynamics
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-slate-900 via-indigo-950 to-violet-900 bg-clip-text text-transparent mb-1">
                    Demographics &amp; Social Atmosphere
                  </h2>
                  <p className="text-xs text-slate-500 mb-6">
                    Factual population metrics and local social dynamics for {country.name}.
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    <motion.div
                      whileHover={{ y: -3 }}
                      className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-indigo-50/90 to-white border border-indigo-200/80 shadow-2xs"
                    >
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-blue-500" />
                      <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-800 block">
                        Median National Age
                      </span>
                      <span className="font-mono tabular-nums text-2xl font-extrabold text-indigo-950 mt-1 block">
                        {country.demographics.medianAge} yrs
                      </span>
                    </motion.div>

                    <motion.div
                      whileHover={{ y: -3 }}
                      className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-violet-50/90 to-white border border-violet-200/80 shadow-2xs"
                    >
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500" />
                      <span className="text-[11px] font-bold uppercase tracking-wider text-violet-800 block">
                        Females per 100 Males
                      </span>
                      <span className="font-mono tabular-nums text-2xl font-extrabold text-violet-950 mt-1 block">
                        {country.demographics.femalesPer100Males.toFixed(1)} : 100
                      </span>
                      <span className="text-[11px] text-violet-700 mt-0.5 block">
                        Ratio {(country.demographics.femalesPer100Males / 100).toFixed(2)} F : 1 M
                      </span>
                    </motion.div>

                    <motion.div
                      whileHover={{ y: -3 }}
                      className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-teal-50/90 to-white border border-teal-200/80 shadow-2xs"
                    >
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 to-emerald-500" />
                      <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800 block">
                        Youth Population (&lt;30)
                      </span>
                      <span className="font-mono tabular-nums text-2xl font-extrabold text-teal-950 mt-1 block">
                        {country.demographics.youngPopulationPercent}%
                      </span>
                    </motion.div>

                    <motion.div
                      whileHover={{ y: -3 }}
                      className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-amber-50/90 to-white border border-amber-200/80 shadow-2xs"
                    >
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-rose-500" />
                      <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 block">
                        Dating Openness Score
                      </span>
                      <span className="font-mono tabular-nums text-2xl font-extrabold text-amber-950 mt-1 block">
                        {country.demographics.datingRating} / 5
                      </span>
                    </motion.div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-slate-700">
                    <div className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-rose-50/50 via-white to-amber-50/40 border border-rose-200/70">
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-400 to-amber-400" />
                      <strong className="text-slate-900 font-extrabold block mb-1">
                        Dating Culture Dynamics:
                      </strong>
                      <p className="leading-relaxed">{country.demographics.datingCultureSummary}</p>
                    </div>
                    <div className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-teal-50/50 via-white to-indigo-50/40 border border-teal-200/70">
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 to-indigo-500" />
                      <strong className="text-slate-900 font-extrabold block mb-1">
                        Everyday Social Atmosphere:
                      </strong>
                      <p className="leading-relaxed">{country.demographics.socialAtmosphere}</p>
                    </div>
                  </div>
                </div>

                {/* Deep-Dive Dating Style, Partner Expectations, Normal vs Not Normal, Dos/Don'ts & Scam Protection */}
                <CountryLifestyleAndDatingSection country={country} />

                {/* Nightlife & Adult Entertainment Section (with discreet toggle) */}
                <div className="relative overflow-hidden bg-white rounded-3xl border border-indigo-100/90 p-6 sm:p-8 shadow-sm">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-rose-500 to-violet-600" />
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-lg font-extrabold text-slate-900">
                        Nightlife, Venues &amp; Adult Entertainment
                      </h3>
                      <span className="text-xs text-slate-500">
                        Empirical regulatory status and entertainment density
                      </span>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setDiscreetLifestyleEnabled(!discreetLifestyleEnabled)}
                      className={`px-3.5 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        discreetLifestyleEnabled
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-amber-400 shadow-xs'
                          : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {discreetLifestyleEnabled ? 'Hide Details' : 'Show Details'}
                    </motion.button>
                  </div>

                  {discreetLifestyleEnabled ? (
                    <div className="space-y-4 mt-6">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/80 to-white border border-amber-200/80">
                          <span className="text-xs font-bold text-amber-800 block">
                            Nightlife Vibrancy
                          </span>
                          <span className="text-sm font-extrabold text-slate-900 mt-1 block">
                            {country.adultEntertainment.nightlifeVibrancy}
                          </span>
                        </div>

                        <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-50/80 to-white border border-rose-200/80">
                          <span className="text-xs font-bold text-rose-800 block">
                            Adult Venue Score
                          </span>
                          <span className="font-mono tabular-nums text-lg font-extrabold text-rose-950 mt-1 block">
                            {country.adultEntertainment.adultEntertainmentScore} / 5
                          </span>
                        </div>

                        <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-50/80 to-white border border-violet-200/80">
                          <span className="text-xs font-bold text-violet-800 block">
                            Regulatory Framework
                          </span>
                          <span className="text-xs font-bold text-slate-800 mt-1 block">
                            {country.adultEntertainment.legalStatus}
                          </span>
                        </div>
                      </div>

                      <div className="p-5 rounded-2xl bg-slate-50/90 border border-slate-200/80 text-xs sm:text-sm text-slate-700 space-y-3">
                        <p className="leading-relaxed">{country.adultEntertainment.overview}</p>
                        <div>
                          <strong className="text-slate-900 block mb-1.5">
                            Key Entertainment Zones:
                          </strong>
                          <div className="flex flex-wrap gap-2">
                            {country.adultEntertainment.topVenuesOrDistricts.map((d, i) => (
                              <span
                                key={i}
                                className="px-3 py-1 rounded-xl bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-200/80 text-indigo-950 text-xs font-bold"
                              >
                                {d}
                              </span>
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 border-t border-slate-200 pt-2.5">
                          <strong className="text-slate-800">Safety Guidance:</strong>{' '}
                          {country.adultEntertainment.safetyGuidance}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-50 via-indigo-50/40 to-amber-50/40 border border-indigo-100 text-center">
                      <p className="text-xs text-slate-600 mb-3">
                        Nightlife and adult entertainment indicators are currently softened. Click "Show Details" above to view complete regulatory status and district metrics.
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setDiscreetLifestyleEnabled(true)}
                        className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-amber-500 text-white shadow-xs cursor-pointer"
                      >
                        Reveal Nightlife &amp; Lifestyle Data
                      </motion.button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 8: EXPAT CITIES & COMMUNITY (COMBINED TOWNS, MENTORS, MEETUPS & FORUM) */}
            {(activeTab === 'community' || activeTab === 'cities') && (
              <div className="space-y-8">
                {/* Premier Expat Towns & Regions */}
                <div className="relative overflow-hidden bg-white rounded-3xl border border-indigo-100/90 p-6 sm:p-8 shadow-sm">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-400 via-indigo-500 to-amber-500" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 block mb-0.5">
                    Regional Micro-Markets
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-slate-900 via-indigo-950 to-teal-900 bg-clip-text text-transparent mb-1">
                    Premier Expat Cities, Towns &amp; Regions in {country.name}
                  </h2>
                  <p className="text-xs text-slate-500 mb-6">
                    Explore the top retirement hubs across {country.name}, from coastal beach havens to cultural mountain valleys, and connect with local residents below.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {country.topCities.map((city, idx) => {
                      const theme = TOWN_CARD_ACCENTS[idx % TOWN_CARD_ACCENTS.length];
                      return (
                        <motion.div
                          key={idx}
                          whileHover={{ y: -5 }}
                          transition={{ type: 'spring', stiffness: 340, damping: 24 }}
                          className={`relative overflow-hidden p-5 rounded-2xl border bg-gradient-to-br ${theme.bg} ${theme.border} flex flex-col justify-between shadow-xs`}
                        >
                          <div
                            className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${theme.ribbon}`}
                          />
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-2.5 pt-1">
                              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-1.5">
                                <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
                                <span>{city.name}</span>
                              </h3>
                              <span
                                className={`font-mono tabular-nums text-xs font-extrabold px-2.5 py-0.5 rounded-full border ${theme.badge}`}
                              >
                                ~${city.monthlyCostUSD}/mo
                              </span>
                            </div>
                            <p className="text-xs font-bold text-indigo-950 mb-2">{city.vibe}</p>
                            <p className="text-xs text-slate-600 leading-relaxed">
                              {city.highlight}
                            </p>
                          </div>

                          <div className="mt-5 pt-3.5 border-t border-slate-200/70 flex items-center justify-between text-xs">
                            <span className="text-slate-500 font-semibold">
                              Hub #{idx + 1} in {country.name}
                            </span>
                            <motion.button
                              whileHover={{ scale: 1.04 }}
                              whileTap={{ scale: 0.96 }}
                              onClick={() => {
                                if (!isAuthenticated) {
                                  openAuthModal('login');
                                  return;
                                }
                                startDmWithPeer(
                                  `Resident of ${city.name}`,
                                  country.name,
                                  city.name,
                                  `Hi! I saw ${city.name} on ReFirely and would love to ask about living there.`
                                );
                              }}
                              className={`px-3 py-1 rounded-lg bg-gradient-to-r ${theme.btn} text-white font-bold text-[11px] shadow-2xs cursor-pointer`}
                            >
                              Ask a Local →
                            </motion.button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* Direct Connect with Local Expats Box */}
                <div className="relative overflow-hidden bg-white rounded-3xl border border-indigo-100/90 p-6 sm:p-8 shadow-sm">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-400 via-indigo-500 to-amber-500" />
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 block mb-0.5">
                        Direct Peer-to-Peer Mentorship
                      </span>
                      <h2 className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-slate-900 via-indigo-950 to-teal-900 bg-clip-text text-transparent">
                        Connect with Fellow Retirees in {country.name}
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Reach out directly for firsthand answers on leases, healthcare, and expat friendship circles.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                    {localExpats.map((expat, idx) => (
                      <motion.div
                        key={idx}
                        whileHover={{ y: -3 }}
                        transition={{ type: 'spring', stiffness: 340, damping: 24 }}
                        className="relative overflow-hidden p-5 rounded-2xl border border-indigo-100 bg-gradient-to-br from-white via-indigo-50/30 to-teal-50/30 flex items-start justify-between gap-4 shadow-2xs"
                      >
                        <div
                          className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
                            idx % 2 === 0
                              ? 'from-teal-400 via-emerald-500 to-indigo-500'
                              : 'from-indigo-500 via-violet-500 to-amber-500'
                          }`}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-indigo-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                              {expat.name.charAt(0)}
                            </div>
                            <div>
                              <h4 className="text-sm font-extrabold text-slate-900">
                                {expat.name}
                              </h4>
                              <div className="flex items-center gap-2 text-[11px] text-indigo-700 font-semibold">
                                <span>{expat.city}</span>
                                <span aria-hidden="true">·</span>
                                <span>{expat.yearsInCountry}</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed mt-3 italic">
                            "{expat.note}"
                          </p>
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                          onClick={() => {
                            if (!isAuthenticated) {
                              openAuthModal('login');
                              return;
                            }
                            startDmWithPeer(
                              expat.name,
                              country.name,
                              expat.city,
                              `Hello ${expat.name}! I am exploring retirement in ${country.name} and would love to ask your advice.`
                            );
                          }}
                          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-teal-500 via-indigo-600 to-amber-500 text-white font-bold text-xs transition-all shrink-0 flex items-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Chat</span>
                        </motion.button>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Upcoming Meetups in Country */}
                <div className="relative overflow-hidden bg-white rounded-3xl border border-indigo-100/90 p-6 sm:p-8 shadow-sm">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-amber-500" />
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                      <Users className="w-5 h-5 text-indigo-600" />
                      <span>Expat Meetups in {country.name}</span>
                    </h3>
                    <button
                      onClick={() => setCurrentView('meetups')}
                      className="text-xs font-bold text-indigo-700 hover:text-indigo-900 hover:underline cursor-pointer"
                    >
                      View All Platform Meetups →
                    </button>
                  </div>

                  {countryMeetups.length > 0 ? (
                    <div className="space-y-3">
                      {countryMeetups.map(meetup => (
                        <motion.div
                          key={meetup.id}
                          whileHover={{ y: -2 }}
                          className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-r from-slate-50 via-indigo-50/40 to-amber-50/30 border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-b from-teal-400 via-indigo-500 to-amber-500" />
                          <div className="pl-2">
                            <div className="flex items-center gap-2 text-xs text-indigo-800 font-semibold mb-1">
                              <Calendar className="w-3.5 h-3.5 text-amber-600" />
                              <span>
                                {meetup.date} ({meetup.time})
                              </span>
                              <span aria-hidden="true">·</span>
                              <span>{meetup.city}</span>
                            </div>
                            <h4 className="text-sm font-extrabold text-slate-900">
                              {meetup.title}
                            </h4>
                            <p className="text-xs text-slate-600 mt-1">{meetup.location}</p>
                          </div>

                          <div className="flex items-center gap-3 shrink-0 pl-2 sm:pl-0">
                            <span className="text-xs font-mono tabular-nums font-bold text-indigo-900 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200/70">
                              {meetup.attendeesCount} attending
                            </span>
                            <motion.button
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => toggleRsvpMeetup(meetup.id)}
                              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                                meetup.isRsvped
                                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white'
                                  : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white'
                              }`}
                            >
                              {meetup.isRsvped ? 'RSVP Confirmed ✓' : 'RSVP Free'}
                            </motion.button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">
                      No scheduled meetups in {country.name} this month. Check out our Community Hub to propose one!
                    </p>
                  )}
                </div>

                {/* Forum Discussions */}
                <div className="relative overflow-hidden bg-white rounded-3xl border border-indigo-100/90 p-6 sm:p-8 shadow-sm">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500" />
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <h3 className="text-lg font-extrabold text-slate-900">
                      Discussion Threads on {country.name}
                    </h3>
                    <button
                      onClick={() => setCurrentView('community')}
                      className="text-xs font-bold text-indigo-700 hover:text-indigo-900 hover:underline cursor-pointer"
                    >
                      Go to Community Hub →
                    </button>
                  </div>

                  {countryThreads.length > 0 ? (
                    <div className="space-y-3">
                      {countryThreads.map(thread => (
                        <motion.div
                          key={thread.id}
                          whileHover={{ y: -2 }}
                          onClick={() => setCurrentView('community')}
                          className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-r from-slate-50 via-white to-indigo-50/30 border border-slate-200 hover:border-indigo-300 transition-all cursor-pointer"
                        >
                          <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-b from-amber-400 to-indigo-500" />
                          <div className="pl-2">
                            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                              <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-800 font-bold text-[10px] border border-indigo-200/70">
                                {thread.category}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span className="font-semibold text-slate-700">
                                {thread.authorName}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span>{thread.createdAt}</span>
                            </div>
                            <h4 className="text-sm font-extrabold text-slate-900 hover:text-indigo-700">
                              {thread.title}
                            </h4>
                            <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                              {thread.content}
                            </p>
                          </div>
                        </motion.div>
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
          </motion.div>
        </AnimatePresence>
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
