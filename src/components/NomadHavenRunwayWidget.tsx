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
      // Estimated nomad monthly burn (single digital nomad budget: rent + coworking + living)
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
    <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-teal-50/90 via-white to-indigo-50/80 border border-teal-200/90 shadow-sm space-y-5">
      {/* Header & Live Unlocked Country Counters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-600 to-indigo-600 text-white flex items-center justify-center shadow-2xs shrink-0">
              <Wallet className="w-4 h-4" />
            </div>
            <h3
              className="text-sm sm:text-base font-extrabold text-slate-900"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Digital Nomad Runway &amp; Haven Sustainability Matrix ({savingsDisplay} Liquid Buffer)
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-900 border border-indigo-200 text-[10px] font-extrabold uppercase tracking-wider">
              {activePersona === 'retiree'
                ? 'Retiree & Nomad Liquid Runway'
                : 'Digital Nomad Runway'}
            </span>
            {isGuestUser && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-extrabold">
                <Lock className="w-3 h-3 text-amber-700" />
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
          <span className="px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold">
            🟢 {runwayData.longTerm.length} 24+ Mo Sustainable
          </span>
          <span className="px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold">
            🟡 {runwayData.mediumTerm.length} 6-23 Mo Runway
          </span>
        </div>
      </div>

      {/* Live Balance-Based Country Unlock Statistics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 rounded-2xl bg-white border border-teal-200/80 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            Total Havens Unlocked (6+ Mos)
          </span>
          <div className="text-base sm:text-lg font-black font-mono text-teal-950 mt-0.5">
            {runwayData.totalUnlocked} / {countries.length}{' '}
            <span className="text-xs font-bold text-teal-700">
              ({runwayData.unlockedPercent}%)
            </span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
            24+ Months Sustainable
          </span>
          <div className="text-base sm:text-lg font-black font-mono text-emerald-950 mt-0.5 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{runwayData.longTerm.length} Countries</span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
            6 – 23 Months Runway
          </span>
          <div className="text-base sm:text-lg font-black font-mono text-amber-950 mt-0.5 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{runwayData.mediumTerm.length} Countries</span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-rose-50/70 border border-rose-200/80 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 block">
            &lt;6 Months High-Burn
          </span>
          <div className="text-base sm:text-lg font-black font-mono text-rose-950 mt-0.5 flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{runwayData.depleting.length} Countries</span>
          </div>
        </div>
      </div>

      {isGuestUser ? (
        /* ============================================================== */
        /* GUEST LOCKED PREVIEW MODE (Stats Visible, Country Names Gated) */
        /* ============================================================== */
        <div className="relative rounded-2xl border border-dashed border-indigo-300 bg-white/95 p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Locked Column 1: Long-Term Sustainable Havens (24+ Months Runway) */}
            <div className="p-4 rounded-2xl bg-emerald-50/90 border border-emerald-200/90 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
                  <span>🟢 Long-Term Sustainability (24+ Mos Runway)</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-200/80 text-emerald-950 text-xs font-mono font-bold">
                  {runwayData.longTerm.length} Unlocked
                </span>
              </div>

              <div className="space-y-2 opacity-75 pointer-events-none select-none">
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
                          className="p-2.5 rounded-xl bg-white border border-emerald-200/80 shadow-2xs flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-6 h-6 rounded-md bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800 shrink-0">
                              <Lock className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-slate-800 truncate flex items-center gap-1.5">
                                <span>🔒 Locked Sustainable Haven #{idx + 1}</span>
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
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-950 text-xs font-mono font-black shrink-0">
                            {Math.round(item.runwayMonths)} Mos
                          </span>
                        </div>
                      );
                    })}
                    {runwayData.longTerm.length > 3 && (
                      <div className="p-2 rounded-xl bg-emerald-100/70 border border-emerald-200 text-center text-[11px] font-bold text-emerald-900">
                        🔒 +{runwayData.longTerm.length - 3} more 24+ month sustainable countries
                        unlocked — Log in to reveal all
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Locked Column 2: Medium-Term Runway Havens (6 to 23 Months) */}
            <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200/90 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                  <span>🟡 Medium Runway (6 - 23 Mos)</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-200/80 text-amber-950 text-xs font-mono font-bold">
                  {runwayData.mediumTerm.length} Unlocked
                </span>
              </div>

              <div className="space-y-2 opacity-75 pointer-events-none select-none">
                {runwayData.mediumTerm.length === 0 ? (
                  <p className="text-xs text-amber-800 italic py-2 text-center">
                    No havens currently in the 6-23 month runway band.
                  </p>
                ) : (
                  <>
                    {runwayData.mediumTerm.slice(0, 3).map((item, idx) => {
                      const np = getCountryNomadProfile(item.country);
                      return (
                        <div
                          key={`locked-med-${idx}`}
                          className="p-2.5 rounded-xl bg-white border border-amber-200/80 shadow-2xs flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-6 h-6 rounded-md bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 shrink-0">
                              <Lock className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-slate-800 truncate flex items-center gap-1.5">
                                <span>🔒 Locked Medium-Runway Hub #{idx + 1}</span>
                                <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                  {item.country.region}
                                </span>
                              </h4>
                              <p className="text-[10px] text-slate-500 truncate">
                                Turnkey: ${item.monthlyBurnUSD.toLocaleString()}/mo · Internet:{' '}
                                {np.verifiedInternetMbps || 150} Mbps · Log in to reveal country
                              </p>
                            </div>
                          </div>
                          <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-950 text-xs font-mono font-black shrink-0">
                            {Math.round(item.runwayMonths)} Mos
                          </span>
                        </div>
                      );
                    })}
                    {runwayData.mediumTerm.length > 3 && (
                      <div className="p-2 rounded-xl bg-amber-100/70 border border-amber-200 text-center text-[11px] font-bold text-amber-900">
                        🔒 +{runwayData.mediumTerm.length - 3} more 6–23 month runway countries
                        unlocked — Log in to reveal all
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Locked Conversion Bar (Same style as Personal & 5-Scheme Financial Parameters Locked Bar) */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-indigo-950 via-slate-900 to-teal-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="text-xs font-extrabold flex items-center gap-1.5 text-amber-300">
                <Lock className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {runwayData.totalUnlocked} Countries Unlocked with Your {savingsDisplay} Buffer
                  ({runwayData.longTerm.length} Long-Term · {runwayData.mediumTerm.length} Medium
                  Runway) — Log In to View All Countries!
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">
                Adjust your balance or invested assets above to see how many countries unlock in
                real time, then sign up free or log in to reveal every country name, fiber speed,
                and interactive dossier.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => openAuthModal('signup')}
                className="px-3.5 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs cursor-pointer whitespace-nowrap inline-flex items-center gap-1.5 shadow-xs"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Sign Up Free</span>
              </button>
              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="px-3 py-2 rounded-lg bg-white/15 hover:bg-white/25 text-white font-bold text-xs cursor-pointer whitespace-nowrap inline-flex items-center gap-1.5"
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
            <div className="p-4 rounded-2xl bg-emerald-50/90 border border-emerald-200/90 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
                  <span>🟢 Long-Term Sustainability (24+ Mos Runway)</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-200/80 text-emerald-950 text-xs font-mono font-bold">
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
                        className="p-2.5 rounded-xl bg-white border border-emerald-200/80 shadow-2xs hover:border-emerald-400 transition-all flex items-center justify-between gap-3 cursor-pointer group"
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
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-950 text-xs font-mono font-black shrink-0">
                          {Math.round(item.runwayMonths)} Mos
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Medium-Term Runway Havens (6 to 23 Months) */}
            <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200/90 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                  <span>🟡 Medium Runway (6 - 23 Mos)</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-200/80 text-amber-950 text-xs font-mono font-bold">
                  {runwayData.mediumTerm.length}
                </span>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {runwayData.mediumTerm.length === 0 ? (
                  <p className="text-xs text-amber-800 italic py-2 text-center">
                    No havens currently in the 6-23 month runway band.
                  </p>
                ) : (
                  runwayData.mediumTerm.map(item => {
                    const np = getCountryNomadProfile(item.country);
                    return (
                      <div
                        key={`med-nomad-${item.country.id}`}
                        onClick={() => onSelectCountry && onSelectCountry(item.country.name)}
                        className="p-2.5 rounded-xl bg-white border border-amber-200/80 shadow-2xs hover:border-amber-400 transition-all flex items-center justify-between gap-3 cursor-pointer group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <CountryFlag
                            countryName={item.country.name}
                            fallbackEmoji={item.country.flag}
                            size="sm"
                            className="rounded-xs shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-amber-700 transition-colors">
                              {item.country.name}
                            </h4>
                            <p className="text-[10px] text-slate-500 truncate">
                              Turnkey: ${item.monthlyBurnUSD.toLocaleString()}/mo · Internet:{' '}
                              {np.verifiedInternetMbps || 150} Mbps
                            </p>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-950 text-xs font-mono font-black shrink-0">
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
          <div className="pt-2 border-t border-teal-100">
            <button
              type="button"
              onClick={() => setShowDepletingCountries(prev => !prev)}
              className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 border border-teal-200 text-teal-950 text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <span>
                {showDepletingCountries
                  ? 'Hide High Burn / Rapid Depletion Havens (<6 Months)'
                  : `Show High Burn Havens (${runwayData.depleting.length} Countries <6 Mo Runway)`}
              </span>
              {showDepletingCountries ? (
                <ChevronUp className="w-4 h-4 text-teal-600" />
              ) : (
                <ChevronDown className="w-4 h-4 text-teal-600" />
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
                      className="p-2.5 rounded-xl bg-rose-50/60 border border-rose-200/70 hover:border-rose-400 transition-all flex items-center justify-between gap-2 cursor-pointer group"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <CountryFlag
                          countryName={item.country.name}
                          fallbackEmoji={item.country.flag}
                          size="sm"
                          className="rounded-xs shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-800 truncate group-hover:text-rose-700 transition-colors">
                            {item.country.name}
                          </h4>
                          <p className="text-[10px] text-slate-500 truncate">
                            ${item.monthlyBurnUSD.toLocaleString()}/mo
                          </p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-900 text-[10px] font-mono font-bold shrink-0">
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
