import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Wallet,
  ChevronDown,
  ChevronUp,
  Lock,
  CheckCircle2,
  Clock,
  Flame,
  UserPlus,
  LogIn,
} from 'lucide-react';
import { Country, UserProfile } from '../types';
import { CountryFlag } from './CountryFlag';
import { getCountryNomadProfile } from '../data/countryNomadProfiles';
import { useApp } from '../context/AppContext';

interface NomadHavenRunwayWidgetProps {
  userProfile: UserProfile;
  countries: Country[];
  liquidSavingsUSD: number;
  investedAssetsUSD?: number;
  personaMode?: 'retiree' | 'nomad';
  onSelectCountry?: (countryName: string) => void;
}

export interface NomadHavenRunwayItem {
  country: Country;
  monthlyBurnUSD: number;
  runwayMonths: number;
  status: 'long-term' | 'medium-term' | 'depleting';
}

export const NomadHavenRunwayWidget: React.FC<NomadHavenRunwayWidgetProps> = ({
  countries,
  liquidSavingsUSD,
  investedAssetsUSD,
  personaMode,
  onSelectCountry,
}) => {
  const { isAuthenticated, currentUserId, openAuthModal, currentPersona } = useApp();
  const isGuestUser = !isAuthenticated || currentUserId === 'guest';
  const activePersona = personaMode || currentPersona;

  const [showDepletingCountries, setShowDepletingCountries] = useState<boolean>(false);

  const runwayData = useMemo(() => {
    const savings = Math.max(1000, liquidSavingsUSD);

    const items: NomadHavenRunwayItem[] = countries.map(c => {
      const monthlyBurn = Math.max(800, c.costOfLiving.monthlyBudgetSingleUSD || 1500);
      const months = Math.round((savings / monthlyBurn) * 10) / 10;

      let status: 'long-term' | 'medium-term' | 'depleting' = 'depleting';
      if (months >= 24) status = 'long-term';
      else if (months >= 6) status = 'medium-term';

      return {
        country: c,
        monthlyBurnUSD: monthlyBurn,
        runwayMonths: months,
        status,
      };
    });

    const longTerm = items
      .filter(i => i.status === 'long-term')
      .sort((a, b) => b.runwayMonths - a.runwayMonths);
    const mediumTerm = items
      .filter(i => i.status === 'medium-term')
      .sort((a, b) => b.runwayMonths - a.runwayMonths);
    const depleting = items
      .filter(i => i.status === 'depleting')
      .sort((a, b) => b.runwayMonths - a.runwayMonths);

    const totalUnlocked = longTerm.length + mediumTerm.length;
    const unlockedPercent =
      countries.length > 0 ? Math.round((totalUnlocked / countries.length) * 100) : 0;

    return {
      longTerm,
      mediumTerm,
      depleting,
      savings,
      totalUnlocked,
      unlockedPercent,
    };
  }, [countries, liquidSavingsUSD]);

  const savingsDisplay = `$${Math.round(runwayData.savings / 1000).toLocaleString()}k`;
  const assetsDisplay =
    investedAssetsUSD && investedAssetsUSD > 0
      ? `$${Math.round(investedAssetsUSD / 1000).toLocaleString()}k`
      : null;

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-5">
      {/* Header & Live Unlocked Country Counters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center shrink-0">
              <Wallet className="w-4 h-4" />
            </div>
            <h3
              className="text-sm sm:text-base font-extrabold text-slate-900"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Digital Nomad Runway &amp; Haven Sustainability Matrix ({savingsDisplay} Liquid Buffer)
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold uppercase tracking-wider">
              {activePersona === 'retiree'
                ? 'Retiree & Nomad Liquid Runway'
                : 'Digital Nomad Runway'}
            </span>
            {isGuestUser && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200 text-[10px] font-bold">
                <Lock className="w-3 h-3 text-indigo-600" />
                <span>Stats Live · Login to Reveal Countries</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Dividing your {savingsDisplay} liquid cash buffer
            {assetsDisplay ? ` (from your ${assetsDisplay} portfolio balance)` : ''} by turnkey
            monthly living expenses reveals how many of the {countries.length} global havens you
            have unlocked for 6 to 24+ months of work-free runway.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
            {runwayData.longTerm.length} 24+ Mo Sustainable
          </span>
          <span className="px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-800 text-xs font-bold">
            {runwayData.mediumTerm.length} 6-23 Mo Runway
          </span>
        </div>
      </div>

      {/* Live Balance-Based Country Unlock Statistics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 rounded-2xl bg-slate-50/70 border border-slate-200/80">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            Total Havens Unlocked (6+ Mos)
          </span>
          <div className="text-base sm:text-lg font-black font-mono text-slate-900 mt-0.5">
            {runwayData.totalUnlocked} / {countries.length}{' '}
            <span className="text-xs font-bold text-teal-700">
              ({runwayData.unlockedPercent}%)
            </span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-emerald-50/40 border border-emerald-200/70">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
            24+ Months Sustainable
          </span>
          <div className="text-base sm:text-lg font-black font-mono text-emerald-900 mt-0.5 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{runwayData.longTerm.length} Countries</span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-sky-50/40 border border-sky-200/70">
          <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 block">
            6 – 23 Months Runway
          </span>
          <div className="text-base sm:text-lg font-black font-mono text-sky-900 mt-0.5 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-sky-600 shrink-0" />
            <span>{runwayData.mediumTerm.length} Countries</span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-slate-50/70 border border-slate-200/80">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
            &lt;6 Months High-Burn
          </span>
          <div className="text-base sm:text-lg font-black font-mono text-slate-800 mt-0.5 flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{runwayData.depleting.length} Countries</span>
          </div>
        </div>
      </div>

      {isGuestUser ? (
        /* ============================================================== */
        /* GUEST LOCKED PREVIEW MODE (Stats Visible, Country Names Gated) */
        /* ============================================================== */
        <div className="relative rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Locked Column 1: Long-Term Sustainable Havens (24+ Months Runway) */}
            <div className="p-4 rounded-2xl bg-emerald-50/35 border border-emerald-200/70 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                  <span>Long-Term Sustainability (24+ Mos Runway)</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-100/80 text-emerald-900 text-xs font-mono font-bold">
                  {runwayData.longTerm.length} Unlocked
                </span>
              </div>

              <div className="space-y-2 opacity-80 pointer-events-none select-none">
                {runwayData.longTerm.length === 0 ? (
                  <p className="text-xs text-emerald-800 italic py-2 text-center">
                    No havens currently offer 24+ months of runway with this liquid buffer.
                    Increase your balance/assets slider above to unlock 24+ month havens!
                  </p>
                ) : (
                  <>
                    {runwayData.longTerm.slice(0, 3).map((item, idx) => {
                      const np = getCountryNomadProfile(item.country);
                      return (
                        <div
                          key={`locked-long-${idx}`}
                          className="p-2.5 rounded-xl bg-white border border-emerald-200/70 flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-6 h-6 rounded-md bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
                              <Lock className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-slate-800 truncate flex items-center gap-1.5">
                                <span>Locked Sustainable Haven #{idx + 1}</span>
                                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                  {item.country.region}
                                </span>
                              </h4>
                              <p className="text-[10px] text-slate-500 truncate">
                                Turnkey: ${item.monthlyBurnUSD.toLocaleString()}/mo · Internet:{' '}
                                {np.verifiedInternetMbps || 150} Mbps · Log in to reveal country
                              </p>
                            </div>
                          </div>
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-mono font-black shrink-0">
                            {Math.round(item.runwayMonths)} Mos
                          </span>
                        </div>
                      );
                    })}
                    {runwayData.longTerm.length > 3 && (
                      <div className="p-2 rounded-xl bg-white/90 border border-emerald-200/70 text-center text-[11px] font-bold text-emerald-800">
                        +{runwayData.longTerm.length - 3} more 24+ month sustainable countries
                        unlocked — Log in to reveal all
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Locked Column 2: Medium-Term Runway Havens (6 to 23 Months) */}
            <div className="p-4 rounded-2xl bg-sky-50/35 border border-sky-200/70 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-sky-900 flex items-center gap-1.5">
                  <span>Medium Runway (6 - 23 Mos)</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-sky-100/80 text-sky-900 text-xs font-mono font-bold">
                  {runwayData.mediumTerm.length} Unlocked
                </span>
              </div>

              <div className="space-y-2 opacity-80 pointer-events-none select-none">
                {runwayData.mediumTerm.length === 0 ? (
                  <p className="text-xs text-sky-800 italic py-2 text-center">
                    No havens currently in the 6-23 month runway band.
                  </p>
                ) : (
                  <>
                    {runwayData.mediumTerm.slice(0, 3).map((item, idx) => {
                      const np = getCountryNomadProfile(item.country);
                      return (
                        <div
                          key={`locked-med-${idx}`}
                          className="p-2.5 rounded-xl bg-white border border-sky-200/70 flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-6 h-6 rounded-md bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700 shrink-0">
                              <Lock className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-slate-800 truncate flex items-center gap-1.5">
                                <span>Locked Medium-Runway Hub #{idx + 1}</span>
                                <span className="text-[10px] font-semibold text-sky-800 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">
                                  {item.country.region}
                                </span>
                              </h4>
                              <p className="text-[10px] text-slate-500 truncate">
                                Turnkey: ${item.monthlyBurnUSD.toLocaleString()}/mo · Internet:{' '}
                                {np.verifiedInternetMbps || 150} Mbps · Log in to reveal country
                              </p>
                            </div>
                          </div>
                          <span className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-900 border border-sky-200 text-xs font-mono font-black shrink-0">
                            {Math.round(item.runwayMonths)} Mos
                          </span>
                        </div>
                      );
                    })}
                    {runwayData.mediumTerm.length > 3 && (
                      <div className="p-2 rounded-xl bg-white/90 border border-sky-200/70 text-center text-[11px] font-bold text-sky-800">
                        +{runwayData.mediumTerm.length - 3} more 6–23 month runway countries
                        unlocked — Log in to reveal all
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Clean Light Conversion Bar */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50/70 via-white to-teal-50/70 border border-indigo-200/80 text-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="text-xs font-extrabold flex items-center gap-1.5 text-indigo-900">
                <Lock className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>
                  {runwayData.totalUnlocked} Countries Unlocked with Your {savingsDisplay} Buffer
                  ({runwayData.longTerm.length} Long-Term · {runwayData.mediumTerm.length} Medium
                  Runway) — Log In to View All Countries!
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-snug">
                Adjust your balance or invested assets above to see how many countries unlock in
                real time, then sign up free or log in to reveal every country name, fiber speed,
                and interactive dossier.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => openAuthModal('signup')}
                className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer whitespace-nowrap inline-flex items-center gap-1.5 shadow-2xs transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Sign Up Free</span>
              </button>
              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="px-3 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold text-xs cursor-pointer whitespace-nowrap inline-flex items-center gap-1.5 transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Log In</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ============================================================== */
        /* LOGGED-IN FULL INTERACTIVE COUNTRY RUNWAY MATRIX               */
        /* ============================================================== */
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Long-Term Sustainable Havens (24+ Months Runway) */}
            <div className="p-4 rounded-2xl bg-emerald-50/35 border border-emerald-200/70 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                  <span>Long-Term Sustainability (24+ Mos Runway)</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-100/80 text-emerald-900 text-xs font-mono font-bold">
                  {runwayData.longTerm.length}
                </span>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {runwayData.longTerm.length === 0 ? (
                  <p className="text-xs text-emerald-800 italic py-2 text-center">
                    No havens currently offer 24+ months of runway with this liquid buffer.
                    Increase cash savings or choose lower-cost nomad hubs!
                  </p>
                ) : (
                  runwayData.longTerm.map(item => {
                    const np = getCountryNomadProfile(item.country);
                    return (
                      <div
                        key={`long-nomad-${item.country.id}`}
                        onClick={() => onSelectCountry && onSelectCountry(item.country.name)}
                        className="p-2.5 rounded-xl bg-white border border-emerald-200/70 hover:border-emerald-400 transition-all flex items-center justify-between gap-3 cursor-pointer group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <CountryFlag
                            countryName={item.country.name}
                            fallbackEmoji={item.country.flag}
                            size="sm"
                            className="rounded-xs shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-emerald-700 transition-colors">
                              {item.country.name}
                            </h4>
                            <p className="text-[10px] text-slate-500 truncate">
                              Turnkey: ${item.monthlyBurnUSD.toLocaleString()}/mo · Internet:{' '}
                              {np.verifiedInternetMbps || 150} Mbps
                            </p>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-mono font-black shrink-0">
                          {Math.round(item.runwayMonths)} Mos
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Medium-Term Runway Havens (6 to 23 Months) */}
            <div className="p-4 rounded-2xl bg-sky-50/35 border border-sky-200/70 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-sky-900 flex items-center gap-1.5">
                  <span>Medium Runway (6 - 23 Mos)</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-sky-100/80 text-sky-900 text-xs font-mono font-bold">
                  {runwayData.mediumTerm.length}
                </span>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {runwayData.mediumTerm.length === 0 ? (
                  <p className="text-xs text-sky-800 italic py-2 text-center">
                    No havens currently in the 6-23 month runway band.
                  </p>
                ) : (
                  runwayData.mediumTerm.map(item => {
                    const np = getCountryNomadProfile(item.country);
                    return (
                      <div
                        key={`med-nomad-${item.country.id}`}
                        onClick={() => onSelectCountry && onSelectCountry(item.country.name)}
                        className="p-2.5 rounded-xl bg-white border border-sky-200/70 hover:border-sky-400 transition-all flex items-center justify-between gap-3 cursor-pointer group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <CountryFlag
                            countryName={item.country.name}
                            fallbackEmoji={item.country.flag}
                            size="sm"
                            className="rounded-xs shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-sky-700 transition-colors">
                              {item.country.name}
                            </h4>
                            <p className="text-[10px] text-slate-500 truncate">
                              Turnkey: ${item.monthlyBurnUSD.toLocaleString()}/mo · Internet:{' '}
                              {np.verifiedInternetMbps || 150} Mbps
                            </p>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-900 border border-sky-200 text-xs font-mono font-black shrink-0">
                          {Math.round(item.runwayMonths)} Mos
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Toggle On-Demand for Rapid Depleting Countries (<6 Months) */}
          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowDepletingCountries(prev => !prev)}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>
                {showDepletingCountries
                  ? 'Hide High Burn / Rapid Depletion Havens (<6 Months)'
                  : `Show High Burn Havens (${runwayData.depleting.length} Countries <6 Mo Runway)`}
              </span>
              {showDepletingCountries ? (
                <ChevronUp className="w-4 h-4 text-slate-600" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-600" />
              )}
            </button>

            <AnimatePresence>
              {showDepletingCountries && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 overflow-hidden"
                >
                  {runwayData.depleting.map(item => (
                    <div
                      key={`dep-nomad-${item.country.id}`}
                      onClick={() => onSelectCountry && onSelectCountry(item.country.name)}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-all flex items-center justify-between gap-2 cursor-pointer group"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <CountryFlag
                          countryName={item.country.name}
                          fallbackEmoji={item.country.flag}
                          size="sm"
                          className="rounded-xs shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-800 truncate group-hover:text-indigo-700 transition-colors">
                            {item.country.name}
                          </h4>
                          <p className="text-[10px] text-slate-500 truncate">
                            ${item.monthlyBurnUSD.toLocaleString()}/mo
                          </p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-slate-200/70 text-slate-800 text-[10px] font-mono font-bold shrink-0">
                        {Math.round(item.runwayMonths)} Mos
                      </span>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </>
      )}
    </div>
  );
};
