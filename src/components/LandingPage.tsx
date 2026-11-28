import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence, MotionConfig } from 'motion/react';
import { useApp } from '../context/AppContext';
import { CountryThumbnail } from './CountryThumbnail';
import { CountryFlag } from './CountryFlag';
import { getCountryTravelLeisureScore } from '../data/countryTravelMobility';
import {
  getCountryContinentLabel,
} from '../utils/continents';
import {
  Compass, Sparkles, Flame, ArrowRight, Heart,
  ShieldCheck, Sun, Globe, Users, CheckCircle2,
  SlidersHorizontal, ChevronRight,
  LogIn, UserPlus, RotateCcw, Wallet, HeartPulse, Plane, Layers,
  Zap, Wifi, Laptop, Coffee, FileBadge, Search, X, Stamp, Calendar
} from 'lucide-react';
import { getCountryNomadProfile } from '../data/countryNomadProfiles';
import type { AppView } from '../context/AppContext';
import {
  RelocationEcosystemShowcase,
  PortalBlueprintInfographic,
} from './LandingInfographics';
import { FreedomMapHeroQuiz } from './FreedomMapHeroQuiz';

export type NomadMatchPriority =
  | 'high_speed_internet'
  | 'coworking_cafe'
  | 'nomad_visa'
  | 'low_burn'
  | 'community_vibe'
  | 'safety_walkability';

export const LandingPage: React.FC = () => {
  const {
    countries,
    navigateToCountry,
    setCurrentView,
    openAuthModal,
    isAuthenticated,
    currentUserId,
    isCountrySaved,
    toggleSaveCountry,
    isCountryCompared,
    toggleCompareCountry,
    setSelectedRegion,
    setSelectedClimate,
    setSearchQuery,
    setSortBy,
    currentPersona,
    setCurrentPersona,
    openBadgeModal,
  } = useApp();

  // -------------------------------------------------------------
  // 1. Flagship Top 12 Retirement Havens & Top 12 Digital Nomad Countries (Independent of Budget)
  // -------------------------------------------------------------
  const [matchSearchQuery, setMatchSearchQuery] = useState<string>('');
  const [mobileShowMoreMatches, setMobileShowMoreMatches] = useState<boolean>(false);
  const [mobileStickyDismissed, setMobileStickyDismissed] = useState<boolean>(false);
  const isGuestUser = !isAuthenticated || currentUserId === 'guest';

  // Authoritative world-renowned Top 12 Retirement Havens & Top 12 Digital Nomad Countries
  // Users can filter by budget, region, climate, and 55+ parameters in Explore Havens
  const CURATED_TOP_RETIREE_HAVEN_IDS = useMemo(
    () => [
      'portugal',
      'spain',
      'costa-rica',
      'panama',
      'thailand',
      'malaysia',
      'mexico',
      'greece',
      'italy',
      'france',
      'ecuador',
      'uruguay',
    ],
    []
  );

  const CURATED_TOP_NOMAD_HAVEN_IDS = useMemo(
    () => [
      'spain',
      'portugal',
      'thailand',
      'indonesia',
      'mexico',
      'malaysia',
      'costa-rica',
      'colombia',
      'croatia',
      'greece',
      'vietnam',
      'united-arab-emirates',
    ],
    []
  );

  // Compute quality-of-life & infrastructure scores (independent of budget)
  const sortedMatchedCountries = useMemo(() => {
    const scored = countries.map(country => {
      const travelScore = getCountryTravelLeisureScore(country);
      const nomadProfile = getCountryNomadProfile(country);

      if (currentPersona === 'nomad') {
        const curatedNomadIdx = CURATED_TOP_NOMAD_HAVEN_IDS.indexOf(country.id);
        if (curatedNomadIdx !== -1) {
          // Flagship Top 12 Nomad Countries get top authoritative index (98% down to 92%)
          const curatedScore = 98 - Math.floor(curatedNomadIdx / 2);
          return {
            country,
            matchScore: curatedScore,
            travelScore,
            nomadProfile,
            curatedRank: curatedNomadIdx,
          };
        }

        // Non-budget quality scoring for remaining nomad destinations (when searching)
        let score = 58;
        if (nomadProfile.hasCuratedData) score += 10;
        if (nomadProfile.coworkingDensity === 'World-Class Nomad Hub') score += 8;
        else if (nomadProfile.coworkingDensity === 'Abundant & Vibrant') score += 5;

        const speedPts = Math.min(12, (nomadProfile.verifiedInternetMbps / 250) * 12);
        const safetyPts = (country.lifestyle.safetyScore / 100) * 8;
        score += speedPts + safetyPts;

        const normalizedScore = Math.min(91, Math.max(65, Math.round(score)));
        return {
          country,
          matchScore: normalizedScore,
          travelScore,
          nomadProfile,
          curatedRank: 999,
        };
      }

      // Retiree Mode: Flagship Top 12 Retirement Havens (independent of budget)
      const curatedRetireeIdx = CURATED_TOP_RETIREE_HAVEN_IDS.indexOf(country.id);
      if (curatedRetireeIdx !== -1) {
        const curatedScore = 98 - Math.floor(curatedRetireeIdx / 2);
        return {
          country,
          matchScore: curatedScore,
          travelScore,
          nomadProfile,
          curatedRank: curatedRetireeIdx,
        };
      }

      // Non-budget quality scoring for remaining retirement destinations (Healthcare, Safety, Leisure, Visa)
      const healthPts = (country.lifestyle.healthcareScore / 100) * 34;
      const safetyPts = (country.lifestyle.safetyScore / 100) * 28;
      const leisurePts = (travelScore / 100) * 22;
      const visaPts =
        country.visa.difficultyRating <= 2 ? 7 : country.visa.difficultyRating <= 3 ? 4 : 1;
      const rawScore = healthPts + safetyPts + leisurePts + visaPts;
      const normalizedScore = Math.min(91, Math.max(65, Math.round(rawScore)));

      return {
        country,
        matchScore: normalizedScore,
        travelScore,
        nomadProfile,
        curatedRank: 999,
      };
    });

    const normalizedQuery = matchSearchQuery.trim().toLowerCase();

    const getSearchMatchRank = (
      country: typeof countries[number],
      nomadProfile: ReturnType<typeof getCountryNomadProfile>
    ): number => {
      if (!normalizedQuery) return 1;
      const nameLower = country.name.toLowerCase();
      if (nameLower === normalizedQuery) return 5;
      if (nameLower.startsWith(normalizedQuery)) return 4;
      if (nameLower.includes(normalizedQuery)) return 3;

      const capitalMatch = country.capital.toLowerCase().includes(normalizedQuery);
      const codeMatch = country.code.toLowerCase() === normalizedQuery;
      const topCityMatch = (country.topCities || []).some(c =>
        c.name.toLowerCase().includes(normalizedQuery)
      );
      const nomadCityMatch = nomadProfile.topNomadCities.some(c =>
        c.toLowerCase().includes(normalizedQuery)
      );
      if (capitalMatch || codeMatch || topCityMatch || nomadCityMatch) return 2;

      const regionMatch = country.region.toLowerCase().includes(normalizedQuery);
      const continentMatch = getCountryContinentLabel(country)
        .toLowerCase()
        .includes(normalizedQuery);
      const taglineMatch = country.tagline.toLowerCase().includes(normalizedQuery);
      const visaMatch =
        country.visa.retirementVisaName.toLowerCase().includes(normalizedQuery) ||
        nomadProfile.remoteWorkVisaName.toLowerCase().includes(normalizedQuery);
      if (regionMatch || continentMatch || taglineMatch || visaMatch) return 1;

      return 0;
    };

    const filtered = normalizedQuery
      ? scored.filter(({ country, nomadProfile }) => getSearchMatchRank(country, nomadProfile) > 0)
      : scored;

    filtered.sort((a, b) => {
      if (normalizedQuery) {
        const rankA = getSearchMatchRank(a.country, a.nomadProfile);
        const rankB = getSearchMatchRank(b.country, b.nomadProfile);
        if (rankB !== rankA) return rankB - rankA;
      }

      // Keep exact curated Top 12 flagship order when not searching
      if (a.curatedRank !== b.curatedRank) return a.curatedRank - b.curatedRank;
      if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;

      if (currentPersona === 'nomad') {
        return b.nomadProfile.verifiedInternetMbps - a.nomadProfile.verifiedInternetMbps;
      }

      return b.travelScore - a.travelScore;
    });

    return filtered;
  }, [
    countries,
    currentPersona,
    matchSearchQuery,
    CURATED_TOP_RETIREE_HAVEN_IDS,
    CURATED_TOP_NOMAD_HAVEN_IDS,
  ]);

  const displayedCountries = sortedMatchedCountries.slice(0, 12);
  const remainingCountriesCount = Math.max(0, sortedMatchedCountries.length - displayedCountries.length);

  const handleResetMatchEngine = () => {
    setMatchSearchQuery('');
  };

  const handleOpenAdvancedExplorer = () => {
    setSelectedRegion('All');
    setSelectedClimate('All');
    setSearchQuery(matchSearchQuery.trim());
    if (currentPersona === 'nomad') {
      setSortBy('internet-speed-desc');
    } else {
      setSortBy('travel-leisure-desc');
    }
    setCurrentView('explore');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (id: string) => {
    if (id === 'fire-calculator') {
      handleNavigateView('fire-calculator');
      return;
    }
    const targetId = id === 'countries-grid' ? 'haven-matcher' : id;
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNavigateView = (view: AppView) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <MotionConfig reducedMotion="user">
    <div className="space-y-8 md:space-y-20 pb-28 md:pb-20 overflow-x-clip bg-gradient-to-b from-sky-50/40 via-white to-teal-50/35">

      {/* ============================================================ */}
      {/* 1. ABOVE-THE-FOLD FREEDOM MAP HERO & 4-STEP GATED QUIZ       */}
      {/* ============================================================ */}
      <FreedomMapHeroQuiz
        onScrollTo={scrollToSection}
        onNavigateView={handleNavigateView}
        onOpenExplorer={handleOpenAdvancedExplorer}
      />

      {/* ============================================================ */}
      {/* 2. MOBILE QUICK SIGN-UP CARD (< md) + ECOSYSTEM SHOWCASE      */}
      {/* ============================================================ */}
      {isGuestUser && (
        <section className="md:hidden max-w-7xl mx-auto px-4">
          <div className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-white via-indigo-50/60 to-amber-50/50 border border-indigo-200/90 shadow-md space-y-3">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-indigo-500 to-teal-500" />
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700">
                  Free Member Access
                </span>
                <h2 className="text-base font-extrabold text-slate-900 leading-snug">
                  Save Shortlists &amp; Get Your Custom Haven Match
                </h2>
              </div>
              <span className="text-xs font-extrabold text-emerald-700 shrink-0">
                100% Free
              </span>
            </div>
            <div className="grid grid-cols-1 gap-1.5 text-xs text-slate-700 font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span>Personalized visa &amp; budget matches by passport</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>Save FIRE plans, scout trips &amp; join expat meetups</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-0.5">
              <button
                type="button"
                onClick={() => openAuthModal('signup')}
                className="min-h-[44px] px-3 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-slate-950 font-black text-xs shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Create Free Account</span>
              </button>
              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="min-h-[44px] px-3 py-2.5 rounded-xl bg-white text-slate-800 font-bold text-xs border border-slate-200 shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-indigo-600" />
                <span>Member Log In</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Built For Real Planners: Everything You Need to Relocate Abroad with Clarity (incl. Visa Check, Scout & Hop, Expats, Meetups, Profile Badges) */}
      <RelocationEcosystemShowcase
        countriesCount={countries.length}
        isGuestUser={isGuestUser}
        onScrollTo={scrollToSection}
        onNavigateView={handleNavigateView}
        onOpenExplorer={handleOpenAdvancedExplorer}
        onOpenBadges={() => openBadgeModal('all')}
        onOpenAuth={openAuthModal}
      />

      {/* ============================================================ */}
      {/* 3. UNIFIED INTERACTIVE MATCH ENGINE & VERIFIED HAVEN DIRECTORY */}
      {/* ============================================================ */}
      <section id="haven-matcher" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div
          id="countries-grid"
          className="relative overflow-hidden p-4 md:p-10 rounded-2xl md:rounded-[2rem] bg-gradient-to-br from-indigo-50/90 via-white to-teal-50/85 text-slate-900 shadow-xl shadow-indigo-950/5 border border-indigo-200/80"
        >
          {/* Decorative Multi-Color Top Accent Ribbon & Ambient Glow Orbs */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 via-indigo-500 via-50% to-amber-500" />
          <div className="pointer-events-none absolute -top-28 -left-24 w-96 h-96 rounded-full bg-indigo-400/15 blur-3xl" />
          <div className="pointer-events-none absolute top-1/3 -right-28 w-96 h-96 rounded-full bg-teal-400/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 left-1/3 w-96 h-96 rounded-full bg-amber-300/15 blur-3xl" />

          {/* Compact, Single-Tier Header + Inline Persona Switch, Quick Search & Explore CTA */}
          <div className="relative z-10 flex flex-col gap-4 pb-5 mb-5 border-b border-indigo-100/90">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-teal-600 text-white text-[11px] font-bold shadow-xs">
                    <Globe className="w-3.5 h-3.5 text-amber-300" />
                    <span>
                      {currentPersona === 'retiree'
                        ? `Top 12 Global Retirement Havens · ${countries.length} Countries Indexed`
                        : `Top 12 Digital Nomad Countries · ${countries.length} Countries Indexed`}
                    </span>
                  </span>
                </div>
                <h2 className="text-xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {currentPersona === 'retiree' ? (
                    <>
                      World’s Top{' '}
                      <span className="bg-gradient-to-r from-indigo-600 via-teal-600 to-amber-600 bg-clip-text text-transparent">
                        Retirement Havens
                      </span>
                    </>
                  ) : (
                    <>
                      World’s Top{' '}
                      <span className="bg-gradient-to-r from-teal-600 via-indigo-600 to-amber-600 bg-clip-text text-transparent">
                        Digital Nomad Countries
                      </span>
                    </>
                  )}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600">
                  {currentPersona === 'retiree'
                    ? 'Curated for healthcare, safety, residency visas, and expat quality of life — filter by budget, climate & 55+ metrics in Explore Havens.'
                    : 'Curated for fiber internet, coworking hubs, Digital Nomad Visas, and community — filter by budget, speed & climate in Explore Havens.'}
                </p>
              </div>

              {/* Single-Instance Persona Switch + Explore All CTA */}
              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <div className="inline-flex p-1 rounded-xl bg-slate-900/95 border border-indigo-300/40 shadow-sm">
                  <button
                    type="button"
                    onClick={() => setCurrentPersona('retiree')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                      currentPersona === 'retiree'
                        ? 'bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 text-slate-950 font-black shadow-2xs'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <span>🌿 Top Retirement</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentPersona('nomad')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                      currentPersona === 'nomad'
                        ? 'bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 text-slate-950 font-black shadow-2xs'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <span>⚡ Top Nomad</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleOpenAdvancedExplorer}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 hover:from-indigo-700 hover:to-teal-700 text-white shadow-sm text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
                  <span>Filter by Budget &amp; Climate ({countries.length})</span>
                  <ArrowRight className="w-3.5 h-3.5 text-teal-300" />
                </button>
              </div>
            </div>

            {/* Compact Single-Line Instant Country Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
              <div className="relative flex-1 flex items-center">
                <Search className="w-4 h-4 text-indigo-500 absolute left-3.5 pointer-events-none" />
                <input
                  id="match-engine-country-search"
                  type="text"
                  value={matchSearchQuery}
                  onChange={e => setMatchSearchQuery(e.target.value)}
                  placeholder={
                    currentPersona === 'nomad'
                      ? `Quick-search any of ${countries.length} countries or nomad hubs (Spain, Thailand, Bali, Croatia)...`
                      : `Quick-search any of ${countries.length} countries or cities (Portugal, Spain, Costa Rica, Panama)...`
                  }
                  className="w-full pl-9 pr-20 py-2 rounded-xl bg-white/95 border border-indigo-200/90 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none transition-all shadow-2xs"
                />
                {matchSearchQuery.trim() !== '' && (
                  <button
                    type="button"
                    onClick={() => setMatchSearchQuery('')}
                    className="absolute right-2 px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                    <span>Clear</span>
                  </button>
                )}
              </div>
              {matchSearchQuery.trim() !== '' && (
                <span className="text-xs font-extrabold text-indigo-900 bg-indigo-50 border border-indigo-200/80 px-3 py-1.5 rounded-xl shrink-0">
                  Showing {displayedCountries.length} of {sortedMatchedCountries.length} matches
                </span>
              )}
            </div>
          </div>

          {/* Country Cards Grid */}
          <div className="relative z-10 space-y-4 md:space-y-6">

            {/* Empty State if search returns zero matches */}
            {displayedCountries.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-12 rounded-3xl bg-white/95 border border-indigo-100 text-center space-y-4 shadow-md"
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto text-indigo-600">
                  <Compass className="w-6 h-6" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">
                  No {currentPersona === 'nomad' ? 'nomad hubs' : 'destinations'} match &ldquo;{matchSearchQuery.trim()}&rdquo;
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  Try searching for another country name, capital city, or expat hub (such as Portugal, Spain, Thailand, Costa Rica, or Malaysia), or open Explore Havens to browse all {countries.length} countries.
                </p>
                <button
                  type="button"
                  onClick={handleResetMatchEngine}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700 text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
                >
                  Clear Search
                </button>
              </motion.div>
            ) : (
              /* Buttery-Smooth Animated 12-Card Top Curated Grid */
              <motion.div
                layout
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
              >
                <AnimatePresence mode="popLayout">
                  {displayedCountries.map(({ country, matchScore, travelScore, nomadProfile }, idx) => {
                    const saved = isCountrySaved(country.id);
                    const compared = isCountryCompared(country.id);
                    const continentLabel = getCountryContinentLabel(country);

                    // Multi-colored top accent bar per card rank/continent
                    const cardAccentGradients = [
                      'from-emerald-500 via-teal-500 to-cyan-500',
                      'from-indigo-500 via-violet-500 to-purple-500',
                      'from-amber-500 via-orange-500 to-rose-500',
                      'from-teal-500 via-indigo-500 to-amber-500',
                    ];
                    const accentGrad = cardAccentGradients[idx % cardAccentGradients.length];
                    const hideCardOnMobile = idx >= (mobileShowMoreMatches ? 8 : 4);

                    return (
                      <motion.div
                        layout
                        key={country.id}
                        initial={{ opacity: 0, y: 20, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.92 }}
                        transition={{
                          type: 'spring',
                          stiffness: 300,
                          damping: 26,
                          delay: idx * 0.025,
                        }}
                        whileHover={{ y: -6 }}
                        onClick={() => navigateToCountry(country.id)}
                        className={`${hideCardOnMobile ? 'hidden md:flex' : 'flex'} group relative bg-white rounded-2xl border border-indigo-100/90 overflow-hidden hover:border-indigo-300 transition-shadow cursor-pointer flex-col justify-between shadow-sm hover:shadow-xl hover:shadow-indigo-950/10`}
                      >
                        {/* Top Multi-Colored Accent Bar */}
                        <div className={`h-1.5 w-full bg-gradient-to-r ${accentGrad}`} />

                        <div>
                          {/* Photo Header */}
                          <div className="h-32 md:h-44 relative overflow-hidden">
                            <CountryThumbnail
                              country={country}
                              hideLandmarkLabel
                              className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-105"
                            />

                            {/* Top-left Rank & Continent / Fiber pill */}
                            <div className="absolute top-2.5 md:top-3 left-2.5 md:left-3 flex flex-wrap items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded-full bg-indigo-600/90 backdrop-blur-md text-white text-[10px] font-black shadow-xs">
                                #{idx + 1}
                              </span>
                              <span className="hidden md:inline-block px-2.5 py-0.5 rounded-full bg-slate-950/75 backdrop-blur-md text-white text-[11px] font-semibold border border-white/15">
                                {continentLabel}
                              </span>
                              {currentPersona === 'nomad' && (
                                <span className="px-2 py-0.5 rounded-full bg-teal-950/85 backdrop-blur-md text-teal-300 text-[10px] font-extrabold border border-teal-400/30 flex items-center gap-1">
                                  <Wifi className="w-2.5 h-2.5 text-teal-400" />
                                  <span>{nomadProfile.verifiedInternetMbps} Mbps</span>
                                </span>
                              )}
                            </div>

                            {/* Top-right Quality Score & Save Heart */}
                            <div className="absolute top-2.5 md:top-3 right-2.5 md:right-3 flex items-center gap-1.5">
                              <div
                                className={`px-2.5 py-1 rounded-full backdrop-blur-md text-xs font-black flex items-center gap-1 shadow-md border ${
                                  matchScore >= 90
                                    ? 'bg-emerald-950/85 text-emerald-300 border-emerald-400/30'
                                    : matchScore >= 82
                                    ? 'bg-indigo-950/85 text-amber-300 border-indigo-400/30'
                                    : 'bg-slate-950/80 text-amber-200 border-white/15'
                                }`}
                              >
                                <Sparkles className="w-3 h-3 text-amber-400" />
                                <span>{matchScore}% {currentPersona === 'nomad' ? 'Nomad' : 'Haven'}</span>
                              </div>
                              <button
                                type="button"
                                onClick={e => {
                                  e.stopPropagation();
                                  toggleSaveCountry(country.id);
                                }}
                                title={saved ? 'Remove from Saved' : 'Save to Favorites'}
                                className={`p-1.5 rounded-full backdrop-blur-md transition-all cursor-pointer ${
                                  saved
                                    ? 'bg-rose-500 text-white scale-110 shadow-sm'
                                    : 'bg-slate-950/70 text-slate-200 hover:text-white hover:bg-rose-500/80'
                                }`}
                              >
                                <Heart className="w-3.5 h-3.5 fill-current" />
                              </button>
                            </div>

                            {/* Bottom Country Flag & Name */}
                            <div className="absolute bottom-2.5 md:bottom-3 left-3 right-3 flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <CountryFlag
                                  countryName={country.name}
                                  countryCode={country.code}
                                  fallbackEmoji={country.flag}
                                  className="w-6 h-6 shadow-md rounded shrink-0"
                                />
                                <span className="font-extrabold text-white text-base drop-shadow-md truncate">
                                  {country.name}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Content details: Dynamic Retiree vs Digital Nomad View */}
                          {currentPersona === 'retiree' ? (
                            <div className="p-3 md:p-4 space-y-2 md:space-y-3">
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="p-2 md:p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                                  <span className="font-semibold block text-[10px] uppercase tracking-wider text-slate-500">
                                    Est. Couple Cost
                                  </span>
                                  <span className="font-mono tabular-nums font-extrabold text-sm text-slate-900">
                                    ${country.costOfLiving.monthlyBudgetCoupleUSD.toLocaleString()}/mo
                                  </span>
                                </div>
                                <div className="p-2 md:p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-200/70">
                                  <span className="text-indigo-700 font-semibold block text-[10px] uppercase tracking-wider">
                                    Travel &amp; Leisure
                                  </span>
                                  <span className="font-mono tabular-nums font-extrabold text-indigo-950 text-sm">
                                    {travelScore}/100
                                  </span>
                                </div>
                              </div>

                              <p className="hidden md:block text-xs text-slate-600 line-clamp-1 leading-relaxed font-medium">
                                {country.tagline}
                              </p>

                              <div className="text-xs text-slate-600 space-y-1.5 border-t border-slate-100 pt-2 md:pt-2.5">
                                <div className="flex items-center justify-between gap-1.5 text-slate-700">
                                  <span className="inline-flex items-center gap-1">
                                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                                    <span>Safety</span>
                                    <strong className="font-mono font-bold text-slate-900">
                                      {country.lifestyle.safetyScore}
                                    </strong>
                                  </span>
                                  <span className="text-slate-300">·</span>
                                  <span className="inline-flex items-center gap-1">
                                    <HeartPulse className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                    <span>Health</span>
                                    <strong className="font-mono font-bold text-slate-900">
                                      {country.lifestyle.healthcareScore}
                                    </strong>
                                  </span>
                                </div>
                                <div className="hidden md:flex items-center gap-1.5 text-slate-700">
                                  <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                  <span className="truncate">
                                    <strong className="font-mono font-bold text-slate-900">
                                      {country.climate.annualSunnyDays}
                                    </strong>{' '}
                                    sunny days ·{' '}
                                    <span className="px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200/70 font-semibold text-[10px]">
                                      {country.climate.category}
                                    </span>
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                                  <span className="font-semibold text-teal-800 truncate">
                                    Visa:{' '}
                                    {country.visa.minimumIncomeUSD > 0
                                      ? `$${country.visa.minimumIncomeUSD.toLocaleString()}/mo min`
                                      : 'Accessible'}
                                  </span>
                                  <span className="text-slate-400 font-medium shrink-0">{country.capital}</span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="p-3 md:p-4 space-y-2 md:space-y-3">
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="p-2 md:p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                                  <span className="font-semibold block text-[10px] uppercase tracking-wider text-slate-500">
                                    Est. Nomad Cost
                                  </span>
                                  <span className="font-mono tabular-nums font-extrabold text-sm text-slate-900">
                                    ${nomadProfile.monthlyNomadBurnUSD.toLocaleString()}/mo
                                  </span>
                                </div>
                                <div className="p-2 md:p-2.5 rounded-xl bg-teal-50/80 border border-teal-200/80">
                                  <span className="text-teal-800 font-semibold block text-[10px] uppercase tracking-wider truncate">
                                    Verified Fiber
                                  </span>
                                  <span className="font-mono tabular-nums font-extrabold text-teal-950 text-sm">
                                    {nomadProfile.verifiedInternetMbps} Mbps
                                  </span>
                                </div>
                              </div>

                              <p className="hidden md:block text-xs text-slate-600 line-clamp-1 leading-relaxed font-medium" title={nomadProfile.topNomadCities.join(' · ')}>
                                <span className="font-bold text-slate-800">Hubs:</span>{' '}
                                {nomadProfile.topNomadCities.slice(0, 2).join(' · ')}
                              </p>

                              <div className="text-xs text-slate-600 space-y-1.5 border-t border-slate-100 pt-2 md:pt-2.5">
                                <div className="hidden md:flex items-center justify-between gap-1.5 text-slate-700">
                                  <span className="inline-flex items-center gap-1 truncate">
                                    <Coffee className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                    <strong className="font-bold text-slate-900 truncate">
                                      {nomadProfile.coworkingDensity === 'World-Class Nomad Hub'
                                        ? 'World-Class Hub'
                                        : nomadProfile.coworkingDensity}
                                    </strong>
                                  </span>
                                  <span className="px-1.5 py-0.5 rounded bg-teal-50 text-teal-900 border border-teal-200/70 font-bold text-[10px] shrink-0">
                                    {nomadProfile.cafeWorkCulture === 'Legendary Laptop Friendly'
                                      ? 'Laptop Cafes ★'
                                      : 'Cafes Welcome'}
                                  </span>
                                </div>

                                <div className="flex items-center justify-between gap-1.5 text-slate-700">
                                  <span className="inline-flex items-center gap-1">
                                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                                    <span>Safety</span>
                                    <strong className="font-mono font-bold text-slate-900">
                                      {country.lifestyle.safetyScore}
                                    </strong>
                                  </span>
                                  <span className="text-slate-300">·</span>
                                  <span className="inline-flex items-center gap-1">
                                    <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                    <strong className="font-mono font-bold text-slate-900">
                                      {country.climate.annualSunnyDays}d
                                    </strong>
                                    <span>sun</span>
                                  </span>
                                  <span className="text-slate-300">·</span>
                                  <span className="text-[11px] font-semibold text-indigo-700">
                                    EN: {country.lifestyle.englishProficiency === 'Very High' ? 'V.High' : country.lifestyle.englishProficiency}
                                  </span>
                                </div>

                                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5 gap-2">
                                  <span className="font-semibold text-indigo-900 truncate" title={nomadProfile.remoteWorkVisaName}>
                                    {nomadProfile.remoteWorkVisaName}
                                  </span>
                                  <span className="text-teal-800 font-mono font-bold shrink-0">
                                    {nomadProfile.remoteWorkVisaIncomeUSD > 0
                                      ? `$${nomadProfile.remoteWorkVisaIncomeUSD.toLocaleString()}/mo`
                                      : '$0 Min'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Card Footer with Compare & Dossier CTA */}
                        <div className="p-3 pt-0 md:p-4 md:pt-0 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              toggleCompareCountry(country.id);
                            }}
                            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer shrink-0 ${
                              compared
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/70 hover:text-indigo-950'
                            }`}
                          >
                            {compared ? 'In Matrix' : '+ Compare'}
                          </button>
                          <div className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-slate-900 to-indigo-950 group-hover:from-indigo-600 group-hover:to-teal-600 text-white text-xs font-bold text-center transition-all flex items-center justify-center gap-1.5 shadow-2xs">
                            <span>{currentPersona === 'nomad' ? 'Nomad Dossier' : 'View Dossier'}</span>
                            <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Mobile-only Compact Show More / Explore All Bar (< md) */}
            {displayedCountries.length > 4 && (
              <div className="flex md:hidden items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setMobileShowMoreMatches(prev => !prev)}
                  className="flex-1 min-h-[42px] px-3 py-2 rounded-xl bg-white border border-indigo-200 text-indigo-900 text-xs font-extrabold shadow-2xs cursor-pointer"
                >
                  {mobileShowMoreMatches ? 'Show Fewer' : 'Show 4 More Havens'}
                </button>
                <button
                  type="button"
                  onClick={handleOpenAdvancedExplorer}
                  className="flex-1 min-h-[42px] px-3 py-2 rounded-xl bg-slate-900 text-white text-xs font-extrabold shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>All {countries.length} Havens</span>
                  <ArrowRight className="w-3.5 h-3.5 text-teal-300" />
                </button>
              </div>
            )}

            {/* Lighter Themed Matching Havens & Sign Up Conversion Portal */}
            {sortedMatchedCountries.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45 }}
                className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-white via-indigo-50/50 to-teal-50/60 text-slate-900 p-5 md:p-8 shadow-xl shadow-indigo-950/5 border border-indigo-200/90 mt-4 md:mt-6"
              >
                {/* Decorative Top Accent Ribbon & Ambient Glows */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 via-indigo-500 via-50% to-amber-500" />
                <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full bg-teal-400/15 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-indigo-500/15 blur-3xl" />

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 md:gap-6 lg:gap-8">
                  <div className="space-y-2.5 md:space-y-3.5 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="hidden md:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100/90 border border-indigo-200/90 text-indigo-950 text-xs font-bold shadow-2xs">
                        <Layers className="w-3.5 h-3.5 text-indigo-600" />
                        <span>
                          {remainingCountriesCount > 0
                            ? `+${remainingCountriesCount} More Matching ${currentPersona === 'nomad' ? 'Nomad Hubs' : 'Havens'} Waiting in Full Directory`
                            : `Unlock Full 55+ Parameter Intelligence Across All ${countries.length} Havens`}
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100/80 border border-emerald-200/80 text-emerald-900 text-[11px] font-bold">
                        <Sparkles className="w-3 h-3 text-emerald-600" />
                        100% Free · No Card Required
                      </span>
                    </div>

                    <h3 className="text-lg md:text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
                      Still Confused?{' '}
                      <span className="bg-gradient-to-r from-indigo-600 via-teal-600 to-amber-600 bg-clip-text text-transparent">
                        Let Us Do the Hard Work for You.
                      </span>
                    </h3>

                    {/* Concise Mobile Copy (< md) */}
                    <p className="md:hidden text-xs text-slate-600 leading-relaxed">
                      Sign up free in 30 seconds to rank all {countries.length} havens by your passport, budget &amp; visa eligibility.
                    </p>

                    {/* Desktop Copy (unchanged >= md) */}
                    <p className="hidden md:block text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                      {currentPersona === 'nomad'
                        ? 'Planning your next remote work base or slow-travel circuit shouldn’t require dozens of messy spreadsheets. Create your free account in seconds and our Algorithmic Nomad & Haven Matcher will automatically rank destinations based on your passport, monthly burn, internet & coworking needs, and visa eligibility — completely 100% FREE.'
                        : 'Creating an international relocation plan shouldn’t require dozens of messy spreadsheets. Create your free account in seconds and our Algorithmic Retirement Haven Matcher will automatically find your ideal destinations based on your citizenship, personal financial status, and lifestyle preferences — completely 100% FREE. Or browse our complete directory with custom filters.'}
                    </p>

                    <div className="hidden md:flex flex-wrap items-center gap-2 pt-0.5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/95 border border-indigo-200/70 text-indigo-900 text-[11px] font-semibold shadow-2xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        {currentPersona === 'nomad' ? 'Turnkey Burn & Runway Fit' : 'Custom Financial Analysis'}
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/95 border border-teal-200/70 text-teal-900 text-[11px] font-semibold shadow-2xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        {currentPersona === 'nomad' ? 'Digital Nomad Visa by Passport' : 'Visa Feasibility by Nationality'}
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/95 border border-amber-200/70 text-amber-900 text-[11px] font-semibold shadow-2xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        {currentPersona === 'nomad' ? 'Fiber Speed & Coworking Density' : 'Climate, Safety & Healthcare Fit'}
                      </span>
                    </div>
                  </div>

                  {/* Actions Column with Signup CTA and Explore All Havens */}
                  <div className="flex flex-col items-stretch lg:items-end gap-2.5 md:gap-3 shrink-0 lg:min-w-[290px]">
                    {(!isAuthenticated || currentUserId === 'guest') ? (
                      <>
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => openAuthModal('signup')}
                          className="min-h-[46px] px-6 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-400 hover:to-amber-500 text-slate-950 text-xs sm:text-sm font-black shadow-lg shadow-orange-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                          <UserPlus className="w-4 h-4 text-slate-950" />
                          <span>Sign Up Free — Get Matched</span>
                          <ArrowRight className="w-4 h-4 text-slate-950" />
                        </motion.button>

                        <button
                          type="button"
                          onClick={() => openAuthModal('login')}
                          className="md:hidden min-h-[44px] px-5 py-2.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-900 text-xs font-extrabold border border-indigo-200 shadow-2xs transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                          <LogIn className="w-4 h-4 text-indigo-600" />
                          <span>Already a Member? Log In</span>
                        </button>

                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleOpenAdvancedExplorer}
                          className="hidden md:flex px-5 py-3 rounded-2xl bg-slate-900 hover:bg-indigo-950 text-white text-xs sm:text-sm font-bold shadow-md shadow-slate-950/10 transition-all cursor-pointer items-center justify-center gap-2 border border-slate-800"
                        >
                          <Compass className="w-4 h-4 text-teal-300" />
                          <span>Explore All {countries.length} Havens</span>
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        </motion.button>

                        <div className="hidden md:flex items-center justify-center lg:justify-end gap-1.5 text-[11px] text-slate-500 font-medium">
                          <span>Already a member?</span>
                          <button
                            type="button"
                            onClick={() => openAuthModal('login')}
                            className="font-extrabold text-indigo-700 hover:text-indigo-950 underline cursor-pointer"
                          >
                            Sign In
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleOpenAdvancedExplorer}
                          className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-400 hover:to-amber-500 text-slate-950 text-xs sm:text-sm font-black shadow-lg shadow-orange-500/25 transition-all cursor-pointer flex items-center justify-center gap-2.5"
                        >
                          <Compass className="w-4 h-4 text-slate-950" />
                          <span>
                            Explore All {countries.length} Havens in Directory
                          </span>
                          <ArrowRight className="w-4 h-4 text-slate-950" />
                        </motion.button>

                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setCurrentView('dashboard');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="px-5 py-2.5 rounded-xl bg-white hover:bg-indigo-50/80 text-indigo-900 text-xs font-bold border border-indigo-200 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-2xs"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Go to Member Dashboard</span>
                        </motion.button>
                      </>
                    )}

                    <span className="hidden md:inline text-[11px] text-slate-500 text-center lg:text-right font-medium">
                      Filter by budget, continent, climate &amp; 55+ metrics in Explore Havens
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

        </div>
      </section>

      {/* ============================================================ */}
      {/* 6. REAL EXPAT VOICES & SOCIAL PROOF                            */}
      {/* ============================================================ */}
      <section className="bg-gradient-to-b from-indigo-50/55 via-sky-50/35 to-teal-50/55 border-y border-indigo-200/70 py-10 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 md:space-y-10">

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="max-w-2xl space-y-2">
              <div className="flex items-center gap-2 text-xs font-extrabold text-amber-800">
                <Users className="w-4 h-4 text-amber-600" />
                <span>Boots on the Ground</span>
                <span aria-hidden="true" className="text-amber-300">·</span>
                <span className="text-slate-600">Verified Member Stories</span>
              </div>
              <h2 className="text-xl md:text-3xl font-extrabold text-slate-950 tracking-tight text-balance">
                Hear from{' '}
                <span className="bg-gradient-to-r from-indigo-600 via-teal-600 to-amber-600 bg-clip-text text-transparent">
                  Expats Who Already Made the Leap
                </span>
              </h2>
              <p className="hidden md:block text-sm text-slate-600">
                Honest reflections from early retirees and remote workers living comfortably abroad.
              </p>
            </div>

            <div className="hidden md:flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => handleNavigateView('community')}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-indigo-50 text-indigo-800 font-bold text-xs border border-indigo-200 shadow-2xs inline-flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap"
              >
                <Users className="w-3.5 h-3.5 text-indigo-600" />
                <span>Browse Expat Profiles</span>
              </button>
              <button
                type="button"
                onClick={() => handleNavigateView('meetups')}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold text-xs shadow-sm inline-flex items-center gap-1.5 cursor-pointer transition-all whitespace-nowrap"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Join Local Meetups</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              whileHover={{ y: -5 }}
              transition={{ type: 'spring', stiffness: 320, damping: 24 }}
              className="relative overflow-hidden p-5 md:p-6 rounded-2xl md:rounded-3xl bg-gradient-to-br from-white via-amber-50/40 to-orange-50/45 border border-amber-200/85 shadow-sm hover:shadow-xl hover:shadow-amber-950/5 space-y-3.5 flex flex-col justify-between"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500" />
              <div className="space-y-3.5">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white font-black text-sm flex items-center justify-center shadow-sm shrink-0">
                    <span>SM</span>
                    <span className="absolute -bottom-1 -right-1 rounded-md overflow-hidden shadow-xs ring-2 ring-white">
                      <CountryFlag countryCode="PT" size="xs" />
                    </span>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-950 text-sm">Sarah &amp; David M.</h4>
                    <span className="text-xs text-slate-600">Algarve, Portugal · Relocated 2023</span>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  &ldquo;Our monthly living cost dropped from $6,200 in Seattle to $2,700 in Lagos. Private health insurance is $92/month each with zero deductible surprises. We retired 7 years earlier than our 401(k) suggested.&rdquo;
                </p>
              </div>
              <div className="pt-3 border-t border-amber-200/60 flex items-center justify-between text-xs font-bold text-orange-800">
                <span>D7 Passive Income Visa</span>
                <span className="font-mono tabular-nums">$2,700/mo Couple</span>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              transition={{ type: 'spring', stiffness: 320, damping: 24 }}
              className="hidden md:flex flex-col justify-between relative overflow-hidden p-6 rounded-3xl bg-gradient-to-br from-white via-emerald-50/40 to-teal-50/45 border border-emerald-200/85 shadow-sm hover:shadow-xl hover:shadow-emerald-950/5 space-y-4"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
              <div className="space-y-3.5">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white font-black text-sm flex items-center justify-center shadow-sm shrink-0">
                    <span>MR</span>
                    <span className="absolute -bottom-1 -right-1 rounded-md overflow-hidden shadow-xs ring-2 ring-white">
                      <CountryFlag countryCode="TH" size="xs" />
                    </span>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-950 text-sm">Mark R.</h4>
                    <span className="text-xs text-slate-600">Chiang Mai, Thailand · Relocated 2022</span>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  &ldquo;Solo retirement here is unbelievably easy. A modern condo with mountain views, daily Thai food, high-speed fiber, and world-class hospital visits for $1,600/month. ReFIREly’s visa &amp; mobility guide was spot on.&rdquo;
                </p>
              </div>
              <div className="pt-3 border-t border-emerald-200/60 flex items-center justify-between text-xs font-bold text-emerald-800">
                <span>Long Stay O-A Scheme</span>
                <span className="font-mono tabular-nums">$1,600/mo Solo</span>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              transition={{ type: 'spring', stiffness: 320, damping: 24 }}
              className="hidden md:flex flex-col justify-between relative overflow-hidden p-6 rounded-3xl bg-gradient-to-br from-white via-indigo-50/45 to-violet-50/45 border border-indigo-200/85 shadow-sm hover:shadow-xl hover:shadow-indigo-950/5 space-y-4"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />
              <div className="space-y-3.5">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white font-black text-sm flex items-center justify-center shadow-sm shrink-0">
                    <span>EC</span>
                    <span className="absolute -bottom-1 -right-1 rounded-md overflow-hidden shadow-xs ring-2 ring-white">
                      <CountryFlag countryCode="CR" size="xs" />
                    </span>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-950 text-sm">Elena &amp; Carlos T.</h4>
                    <span className="text-xs text-slate-600">Atenas, Costa Rica · Relocated 2024</span>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  &ldquo;We wanted eternal spring weather and community meetups. The Pensionado visa process took 4 months, and CAJA health coverage is straightforward. We walk everywhere and host weekly expat game nights.&rdquo;
                </p>
              </div>
              <div className="pt-3 border-t border-indigo-200/60 flex items-center justify-between text-xs font-bold text-indigo-800">
                <span>Pensionado Visa</span>
                <span className="font-mono tabular-nums">$2,350/mo Couple</span>
              </div>
            </motion.div>
          </div>

        </div>
      </section>

      {/* ============================================================ */}
      {/* 7. SUNLIT HIGH-CONVERSION PORTAL SIGN-UP CALL TO ACTION       */}
      {/* ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 md:p-10 lg:p-14 rounded-2xl md:rounded-[2rem] bg-gradient-to-br from-indigo-50/95 via-sky-50/90 to-amber-50/85 text-slate-950 shadow-xl shadow-indigo-950/5 relative overflow-hidden border border-indigo-200/90">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-teal-500 to-amber-500" />
          {/* Soft pastel ambient glow circles */}
          <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 bg-teal-300/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-80 h-80 bg-indigo-300/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4 md:space-y-6">
              <div className="flex items-center gap-2 text-xs font-extrabold text-indigo-800">
                <Compass className="w-4 h-4 text-teal-600" />
                <span>Free Membership</span>
                <span aria-hidden="true" className="text-indigo-300">·</span>
                <span className="text-amber-800">Zero Spam · No Credit Card</span>
              </div>

              <h2 className="text-2xl md:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-slate-950 text-balance">
                Ready to Turn Your{' '}
                <span className="bg-gradient-to-r from-indigo-600 via-teal-600 to-amber-600 bg-clip-text text-transparent">
                  Overseas Dream
                </span>{' '}
                into an Actionable Blueprint?
              </h2>

              <p className="md:hidden text-xs text-slate-700 font-medium leading-relaxed">
                Save haven shortlists, verify visas, download PDF dossiers, and plan your FIRE timeline free.
              </p>

              <p className="hidden md:block text-base sm:text-lg text-slate-700 font-medium leading-relaxed">
                Create your free account to save customized haven shortlists, export printable PDF dossiers, check global visa rules, map Scout &amp; Hop trips, earn profile badges, and join local expat meetups.
              </p>

              <div className="pt-1 md:pt-2 flex flex-col md:flex-row md:flex-wrap items-stretch md:items-center gap-3 md:gap-3.5">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => openAuthModal('signup')}
                  className="w-full md:w-auto min-h-[48px] px-6 md:px-7 py-3.5 md:py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-teal-600 hover:from-indigo-500 hover:to-teal-500 text-white font-black text-sm sm:text-base shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2.5 cursor-pointer whitespace-nowrap"
                >
                  <UserPlus className="w-5 h-5 text-amber-300" />
                  <span>Create Free Member Account</span>
                </motion.button>

                {!isAuthenticated && (
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => openAuthModal('login')}
                    className="w-full md:w-auto min-h-[46px] px-6 py-3.5 md:py-4 rounded-2xl bg-white hover:bg-indigo-50 text-slate-900 font-bold text-sm sm:text-base border border-indigo-200 shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                  >
                    <LogIn className="w-5 h-5 text-indigo-600" />
                    <span>Existing Member Sign In</span>
                  </motion.button>
                )}

                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleNavigateView('visa-check')}
                  className="w-full md:w-auto min-h-[46px] px-5 py-3.5 md:py-4 rounded-2xl bg-teal-50 hover:bg-teal-100 text-teal-900 font-extrabold text-sm border border-teal-300/90 transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                >
                  <Stamp className="w-4 h-4 text-teal-700" />
                  <span>Try Global Visa Check</span>
                </motion.button>
              </div>

              {/* Checklist of Member Features (Desktop Only) */}
              <div className="hidden md:grid pt-5 border-t border-indigo-200/75 grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-700 font-semibold">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Global Visa Check &amp; Bilateral Treaties</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>{countries.length} Country PDF Dossier Downloads</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Scout &amp; Hop Planner + Profile Badges</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Direct Member Messaging &amp; Expat Meetups</span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Relocation Readiness Blueprint Infographic */}
            <div className="hidden lg:block lg:col-span-5">
              <PortalBlueprintInfographic
                countriesCount={countries.length}
                onNavigateView={handleNavigateView}
                onOpenBadges={() => openBadgeModal('all')}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mobile-Only Sleek Thumb-Zone Sticky Sign-Up / Log-In Bar for Guests (< md) */}
      {isGuestUser && !mobileStickyDismissed && (
        <div className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white/95 backdrop-blur-xl border-t border-indigo-200/90 shadow-[0_-8px_24px_rgba(15,23,42,0.12)] px-3 pt-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))]">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => openAuthModal('signup')}
              className="flex-1 min-h-[42px] px-3 py-2 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-slate-950 font-black text-xs shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-4 h-4 shrink-0" />
              <span>Sign Up Free</span>
            </button>
            <button
              type="button"
              onClick={() => openAuthModal('login')}
              className="min-h-[42px] px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-extrabold text-xs border border-slate-200 flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            >
              <LogIn className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span>Log In</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileStickyDismissed(true)}
              aria-label="Dismiss sign-up bar"
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
    </MotionConfig>
  );
};
