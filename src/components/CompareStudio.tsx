import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Country } from '../types';
import { SHORT_TERM_VISA_DATABASE } from '../data/shortTermVisas';
import { CountryFlag } from './CountryFlag';
import { CountryRadarChart, SLOT_THEMES } from './CountryRadarChart';
import { HavenMatcherPromoCard } from './HavenMatcherPromoCard';
import { Plus, X, ArrowRight, Check, Sun, Shield, HeartHandshake, FileCheck, SlidersHorizontal, Scale, Search, Award, Lock, Sparkles, Loader2, AlertCircle, Radar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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
    isAuthenticated,
    currentUserId,
    loginWithGoogle,
    openAuthModal,
  } = useApp();

  const isGuestUser = !isAuthenticated || currentUserId === 'guest';

  const [selectorSearch, setSelectorSearch] = useState('');
  const [compareGateOpen, setCompareGateOpen] = useState(false);
  const [emailGatePending, setEmailGatePending] = useState(false);
  const [pendingCountryToAdd, setPendingCountryToAdd] = useState<Country | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [unlockedBanner, setUnlockedBanner] = useState<string | null>(null);

  const handleToggleCompareWithGate = (countryId: string) => {
    // Always allow removing an already-selected country
    if (comparedCountryIds.includes(countryId)) {
      toggleCompareCountry(countryId);
      return;
    }

    // Gate adding a 3rd (or 4th) country for guests
    if (isGuestUser && comparedCountryIds.length >= 2) {
      const targetCountry = countries.find(c => c.id === countryId) || null;
      setPendingCountryToAdd(targetCountry);
      setAuthError(null);
      setCompareGateOpen(true);
      return;
    }

    toggleCompareCountry(countryId);
  };

  const handleOpenThirdCountryGate = () => {
    setPendingCountryToAdd(null);
    setAuthError(null);
    setCompareGateOpen(true);
  };

  // Auto-unlock & add pending 3rd country the moment guest signs in via Google or Email
  useEffect(() => {
    if (!isGuestUser && (compareGateOpen || emailGatePending || pendingCountryToAdd)) {
      if (
        pendingCountryToAdd &&
        !comparedCountryIds.includes(pendingCountryToAdd.id) &&
        comparedCountryIds.length < 4
      ) {
        toggleCompareCountry(pendingCountryToAdd.id);
        setUnlockedBanner(
          `4-Country Radar unlocked! ${pendingCountryToAdd.name} was added to your comparison — you can now compare up to 4 havens side-by-side.`
        );
      } else {
        setUnlockedBanner(
          '4-Country Radar unlocked! Select any 3rd and 4th countries above or inside the radar header to compare side-by-side.'
        );
      }
      setCompareGateOpen(false);
      setEmailGatePending(false);
      setPendingCountryToAdd(null);
      setAuthError(null);
    }
  }, [isGuestUser, compareGateOpen, emailGatePending, pendingCountryToAdd, comparedCountryIds, toggleCompareCountry]);

  const handleContinueWithGoogleGate = async () => {
    setAuthError(null);
    setIsGoogleLoading(true);
    try {
      const result = await loginWithGoogle();
      if (!result.success && result.error) {
        setAuthError(result.error);
      }
    } catch {
      setAuthError('Could not complete Google sign-in. Please try again or use Email.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleEmailFallbackGate = () => {
    // Close this popup while preserving unlock intent & pendingCountryToAdd so email signup auto-completes on return
    setCompareGateOpen(false);
    setEmailGatePending(true);
    openAuthModal('signup');
  };

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
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs sm:text-sm font-extrabold text-slate-900">
                  Select another country to add to the matrix ({comparedCountries.length}/4 selected):
                </span>
                {isGuestUser && comparedCountries.length >= 2 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100/90 border border-amber-300/80 text-[10px] font-bold text-amber-900">
                    <Lock className="w-2.5 h-2.5" />
                    <span>3rd &amp; 4th slots unlock free with Google</span>
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-600 block mt-0.5">
                {isGuestUser && comparedCountries.length >= 2
                  ? `Showing ${availableCountriesToAdd.length} destinations — click any country to unlock 3 & 4-country radar comparison free.`
                  : `Showing ${availableCountriesToAdd.length} available retirement destinations — click any country to add it to your side-by-side matrix.`}
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
              {availableCountriesToAdd.map(c => {
                const isGatedAdd = isGuestUser && comparedCountries.length >= 2;
                return (
                  <motion.button
                    key={c.id}
                    whileHover={{ y: -2, scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleToggleCompareWithGate(c.id)}
                    className="inline-flex items-center justify-between gap-1.5 px-2.5 py-1.5 text-xs font-semibold bg-white text-slate-700 hover:text-indigo-950 border border-indigo-200/70 rounded-xl hover:bg-gradient-to-r hover:from-indigo-50/70 hover:to-teal-50/70 hover:border-indigo-300 transition-all shadow-2xs text-left group cursor-pointer"
                  >
                    <span className="inline-flex items-center gap-1.5 min-w-0">
                      <CountryFlag countryCode={c.code} countryName={c.name} fallbackEmoji={c.flag} size="sm" />
                      <span className="truncate">{c.name}</span>
                    </span>
                    {isGatedAdd ? (
                      <Lock className="w-3 h-3 text-amber-600 shrink-0 group-hover:scale-110 transition-transform" />
                    ) : (
                      <Plus className="w-3.5 h-3.5 text-indigo-600 shrink-0 group-hover:scale-110 transition-transform" />
                    )}
                  </motion.button>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-600 py-2">
              No countries match "{selectorSearch}". Try clearing the search filter above.
            </p>
          )}
        </div>
      )}

      {/* Unlocked Confirmation Banner after Guest Signs In */}
      <AnimatePresence>
        {unlockedBanner && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-4 px-4 py-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold text-emerald-900 shadow-2xs"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5" />
              </span>
              <span>{unlockedBanner}</span>
            </div>
            <button
              type="button"
              onClick={() => setUnlockedBanner(null)}
              className="p-1 rounded-lg text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer shrink-0"
              aria-label="Dismiss message"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* D3 Multi-Country Lifestyle & Economic Radar Chart (Synced 1-to-1 with Matrix) */}
      <CountryRadarChart
        countries={countries}
        comparedCountries={comparedCountries}
        discreetLifestyleEnabled={true}
        onToggleCompareCountry={handleToggleCompareWithGate}
        onReplaceCompareCountry={replaceCompareCountry}
        onNavigateToCountry={navigateToCountry}
        isGuestUser={isGuestUser}
        onRequestThirdCountryGate={handleOpenThirdCountryGate}
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

                {/* Permanent Lifestyle & Adult Entertainment Section */}
                <tr className="bg-amber-50/50 font-semibold text-amber-900">
                  <td colSpan={comparedCountries.length + 1} className="py-2.5 px-4 uppercase text-[11px] tracking-wider">
                    Lifestyle, Nightlife &amp; Entertainment Dynamics
                  </td>
                </tr>

                <tr>
                  <td className="py-3 px-4 font-medium text-slate-900">Nightlife Vibrancy</td>
                  {comparedCountries.map(c => (
                    <td key={c.id} className="py-3 px-4 font-medium text-slate-800">
                      {c.adultEntertainment.nightlifeVibrancy} ({c.adultEntertainment.nightlifeScore}/5)
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

              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Algorithmic Haven Matcher Comparison Sign-Up Promo Card (Hidden if logged in) */}
      <HavenMatcherPromoCard
        variant="compare"
        comparedCountryNames={comparedCountries.map(c => c.name)}
        className="mt-8"
      />

      {/* Gated 3rd/4th Country Radar Comparison Google Sign-In/Sign-Up Popup Modal (Shown Only for Guests) */}
      <AnimatePresence>
        {compareGateOpen && isGuestUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setCompareGateOpen(false);
              setPendingCountryToAdd(null);
            }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              onClick={e => e.stopPropagation()}
              className="relative w-full max-w-lg rounded-3xl bg-white border border-indigo-200/90 shadow-2xl shadow-indigo-950/25 overflow-hidden"
            >
              {/* Multi-Colored Top Ribbon */}
              <div className="h-1.5 w-full bg-gradient-to-r from-teal-500 via-indigo-600 via-55% to-amber-500" />

              <button
                type="button"
                onClick={() => {
                  setCompareGateOpen(false);
                  setPendingCountryToAdd(null);
                }}
                className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close sign-in popup"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="p-6 sm:p-7 space-y-5">
                {/* Contextual Header & Copy */}
                <div className="text-center space-y-2.5">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-teal-50 via-indigo-50 to-amber-50 border border-indigo-200/80 text-[11px] font-extrabold uppercase tracking-wider text-indigo-800">
                    <Radar className="w-3.5 h-3.5 text-teal-600" />
                    <span>Unlock 3 &amp; 4-Country Radar Comparison</span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight leading-snug">
                    {pendingCountryToAdd ? (
                      <>
                        Add{' '}
                        <span className="bg-gradient-to-r from-teal-600 via-indigo-600 to-amber-600 bg-clip-text text-transparent">
                          {pendingCountryToAdd.name}
                        </span>{' '}
                        &amp; compare up to 4 havens at once.
                      </>
                    ) : (
                      <>
                        Two is just a preview. Compare{' '}
                        <span className="bg-gradient-to-r from-teal-600 via-indigo-600 to-amber-600 bg-clip-text text-transparent">
                          3 or 4 countries
                        </span>{' '}
                        side-by-side.
                      </>
                    )}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
                    {pendingCountryToAdd ? (
                      <>
                        Sign in free with Google in one click to drop{' '}
                        <strong className="text-slate-900">{pendingCountryToAdd.name}</strong> right onto your Multi-Country Lifestyle &amp; Economic Radar—and stack up to{' '}
                        <strong className="text-slate-900">4 destinations</strong> across 55+ live cost, visa, healthcare, and tax metrics.
                      </>
                    ) : (
                      <>
                        Sign up free with Google in one click to overlay{' '}
                        <strong className="text-slate-900">3 or 4 destinations</strong> simultaneously on the Multi-Country Lifestyle &amp; Economic Radar—spot the clear cost, visa, tax, and healthcare winner in seconds.
                      </>
                    )}
                  </p>
                </div>

                {/* Live Active vs Locked Slot Preview Strip */}
                <div className="flex flex-wrap items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-slate-50 border border-slate-200/90">
                  {comparedCountries.slice(0, 2).map((c, idx) => {
                    const theme = SLOT_THEMES[idx % SLOT_THEMES.length];
                    return (
                      <span
                        key={`gate-active-${c.id}`}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-800 shadow-2xs"
                      >
                        <span className={`w-2 h-2 rounded-full ${theme.dotBg} shrink-0`} />
                        <CountryFlag
                          countryCode={c.code}
                          countryName={c.name}
                          fallbackEmoji={c.flag}
                          size="sm"
                        />
                        <span>{c.name}</span>
                      </span>
                    );
                  })}

                  <span className="text-xs font-black text-slate-400 px-0.5">+</span>

                  {pendingCountryToAdd ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-300 text-xs font-extrabold text-amber-900 shadow-2xs">
                      <CountryFlag
                        countryCode={pendingCountryToAdd.code}
                        countryName={pendingCountryToAdd.name}
                        fallbackEmoji={pendingCountryToAdd.flag}
                        size="sm"
                      />
                      <span>{pendingCountryToAdd.name}</span>
                      <Sparkles className="w-3 h-3 text-amber-600 shrink-0" />
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 border border-dashed border-amber-400 text-xs font-extrabold text-amber-900">
                      <Sparkles className="w-3 h-3 text-amber-600 shrink-0" />
                      <span>3rd &amp; 4th Havens</span>
                    </span>
                  )}
                </div>

                {/* Teaser Stat Chips */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2.5 rounded-2xl bg-gradient-to-br from-teal-50/90 to-white border border-teal-200/80 text-center">
                    <div className="font-mono text-base sm:text-lg font-black text-teal-900 tabular-nums">
                      3–4
                    </div>
                    <div className="text-[10px] font-bold text-teal-700 uppercase tracking-wider">
                      Radar Overlays
                    </div>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-gradient-to-br from-indigo-50/90 to-white border border-indigo-200/80 text-center">
                    <div className="font-mono text-base sm:text-lg font-black text-indigo-900 tabular-nums">
                      55+
                    </div>
                    <div className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">
                      Live Metrics
                    </div>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-50/90 to-white border border-amber-200/80 text-center">
                    <div className="font-mono text-base sm:text-lg font-black text-amber-900 tabular-nums">
                      $0
                    </div>
                    <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                      Free Forever
                    </div>
                  </div>
                </div>

                {/* Error Banner */}
                {authError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{authError}</span>
                  </div>
                )}

                {/* Primary 1-Click Google OAuth CTA */}
                <div className="space-y-2.5">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.01, y: -1 }}
                    whileTap={{ scale: 0.99 }}
                    disabled={isGoogleLoading}
                    onClick={handleContinueWithGoogleGate}
                    className="w-full min-h-[50px] px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-teal-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-black text-sm sm:text-base shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60 transition-all"
                  >
                    {isGoogleLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Unlocking 4-country radar...</span>
                      </>
                    ) : (
                      <>
                        <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center shrink-0 shadow-2xs">
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" aria-hidden="true">
                            <path
                              fill="#4285F4"
                              d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.44a5.5 5.5 0 0 1-2.39 3.61v3h3.87c2.26-2.08 3.57-5.15 3.57-8.64Z"
                            />
                            <path
                              fill="#34A853"
                              d="M12 24c3.24 0 5.95-1.07 7.93-2.91l-3.87-3c-1.07.72-2.44 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.95H1.3v3.09A12 12 0 0 0 12 24Z"
                            />
                            <path
                              fill="#FBBC05"
                              d="M5.29 14.29A7.2 7.2 0 0 1 4.91 12c0-.8.14-1.57.38-2.29V6.62H1.3A12 12 0 0 0 0 12c0 1.94.46 3.77 1.3 5.38l3.99-3.09Z"
                            />
                            <path
                              fill="#EA4335"
                              d="M12 4.75c1.76 0 3.34.61 4.58 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.3 6.62l3.99 3.09C6.23 6.86 8.88 4.75 12 4.75Z"
                            />
                          </svg>
                        </span>
                        <span>
                          {pendingCountryToAdd
                            ? `Continue with Google & Add ${pendingCountryToAdd.name}`
                            : 'Continue with Google & Unlock 4-Country Compare'}
                        </span>
                      </>
                    )}
                  </motion.button>

                  <button
                    type="button"
                    onClick={handleEmailFallbackGate}
                    className="w-full py-2 text-xs font-bold text-slate-600 hover:text-indigo-700 transition-colors cursor-pointer text-center"
                  >
                    Or sign in / sign up free with Email &amp; Password
                  </button>
                </div>

                {/* Clean Value Bullets */}
                <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-semibold text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Stay right on this radar</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span>Compare up to 4 havens</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>100% free • No card</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
