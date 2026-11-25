import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Globe,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Lock,
  Clock,
  Flame,
  UserPlus,
  LogIn,
} from 'lucide-react';
import { Country, UserProfile } from '../types';
import { getCountryFireFeasibilityList } from '../utils/fireCalculations';
import { CountryFlag } from './CountryFlag';
import { useApp } from '../context/AppContext';

interface GlobalHavenFeasibilityWidgetProps {
  userProfile: UserProfile;
  countries: Country[];
  onSelectCountry?: (countryName: string) => void;
}

export const GlobalHavenFeasibilityWidget: React.FC<GlobalHavenFeasibilityWidgetProps> = ({
  userProfile,
  countries,
  onSelectCountry,
}) => {
  const { isAuthenticated, currentUserId, openAuthModal } = useApp();
  const isGuestUser = !isAuthenticated || currentUserId === 'guest';
  const [showFarCountries, setShowFarCountries] = useState<boolean>(false);

  const feasibility = useMemo(() => {
    return getCountryFireFeasibilityList(userProfile, countries);
  }, [userProfile, countries]);

  const corpusDisplay = `$${Math.round((feasibility.effectiveCorpus || 0) / 1000).toLocaleString()}k`;
  const totalUnlocked = feasibility.achieved.length + feasibility.close.length;
  const unlockedPercent =
    countries.length > 0 ? Math.round((totalUnlocked / countries.length) * 100) : 0;

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-indigo-50/90 via-white to-teal-50/80 border border-indigo-200/90 shadow-sm space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-teal-600 text-white flex items-center justify-center shadow-2xs shrink-0">
              <Globe className="w-4 h-4" />
            </div>
            <h3
              className="text-sm sm:text-base font-extrabold text-slate-900"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Global Haven FIRE Feasibility Breakdown ({corpusDisplay} Investable Corpus)
            </h3>
            {isGuestUser && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-extrabold">
                <Lock className="w-3 h-3 text-amber-700" />
                <span>Stats Live · Login to Reveal Countries</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Based on your {corpusDisplay} active financial portfolio and Safe Withdrawal Rate (SWR),
            here is your financial independence readiness across {countries.length} global
            retirement havens.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <span className="px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold">
            🟢 {feasibility.achieved.length} Achieved
          </span>
          <span className="px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold">
            🟡 {feasibility.close.length} Close (70-99%)
          </span>
        </div>
      </div>

      {/* Live Asset-Based Country Unlock Statistics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 rounded-2xl bg-white border border-indigo-200/80 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            Total Havens Unlocked (70%+ Funded)
          </span>
          <div className="text-base sm:text-lg font-black font-mono text-indigo-950 mt-0.5">
            {totalUnlocked} / {countries.length}{' '}
            <span className="text-xs font-bold text-indigo-700">({unlockedPercent}%)</span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
            100%+ FIRE Achieved
          </span>
          <div className="text-base sm:text-lg font-black font-mono text-emerald-950 mt-0.5 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feasibility.achieved.length} Countries</span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
            70% – 99% Close to FIRE
          </span>
          <div className="text-base sm:text-lg font-black font-mono text-amber-950 mt-0.5 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{feasibility.close.length} Countries</span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-rose-50/70 border border-rose-200/80 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 block">
            &lt;70% Long-Term Horizon
          </span>
          <div className="text-base sm:text-lg font-black font-mono text-rose-950 mt-0.5 flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{feasibility.far.length} Countries</span>
          </div>
        </div>
      </div>

      {isGuestUser ? (
        /* GUEST LOCKED PREVIEW MODE (Stats Visible, Country Names Gated) */
        <div className="relative rounded-2xl border border-dashed border-indigo-300 bg-white/95 p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Locked Column 1: Achieved Freedom Havens (100%+) */}
            <div className="p-4 rounded-2xl bg-emerald-50/90 border border-emerald-200/90 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
                  <span>🟢 Achieved Freedom (100%+ Funded)</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-200/80 text-emerald-950 text-xs font-mono font-bold">
                  {feasibility.achieved.length} Unlocked
                </span>
              </div>

              <div className="space-y-2 opacity-75 pointer-events-none select-none">
                {feasibility.achieved.length === 0 ? (
                  <p className="text-xs text-emerald-800 italic py-2 text-center">
                    No havens fully funded yet. Increase your Current Invested Assets slider above
                    to unlock 100%+ funded retirement havens!
                  </p>
                ) : (
                  <>
                    {feasibility.achieved.slice(0, 3).map((item, idx) => (
                      <div
                        key={`locked-ach-${idx}`}
                        className="p-2.5 rounded-xl bg-white border border-emerald-200/80 shadow-2xs flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-6 h-6 rounded-md bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800 shrink-0">
                            <Lock className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-800 truncate flex items-center gap-1.5">
                              <span>🔒 Locked FIRE-Ready Haven #{idx + 1}</span>
                              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                {item.country.region}
                              </span>
                            </h4>
                            <p className="text-[10px] text-slate-500 truncate">
                              Cost: $
                              {item.country.costOfLiving.monthlyBudgetSingleUSD.toLocaleString()}
                              /mo · Nest Egg: ${(item.nestEggUSD / 1000).toFixed(0)}k · Log in to
                              reveal
                            </p>
                          </div>
                        </div>
                        <span className="px-2 py-1 rounded-lg bg-emerald-100 text-emerald-900 text-xs font-mono font-black shrink-0">
                          {item.fundedPercent}%
                        </span>
                      </div>
                    ))}
                    {feasibility.achieved.length > 3 && (
                      <div className="p-2 rounded-xl bg-emerald-100/70 border border-emerald-200 text-center text-[11px] font-bold text-emerald-900">
                        🔒 +{feasibility.achieved.length - 3} more 100%+ funded FIRE countries
                        unlocked — Log in to reveal all
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Locked Column 2: Close to FIRE Havens (70% - 99%) */}
            <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200/90 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                  <span>🟡 Close to FIRE (70% - 99% Funded)</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-200/80 text-amber-950 text-xs font-mono font-bold">
                  {feasibility.close.length} Unlocked
                </span>
              </div>

              <div className="space-y-2 opacity-75 pointer-events-none select-none">
                {feasibility.close.length === 0 ? (
                  <p className="text-xs text-amber-800 italic py-2 text-center">
                    No havens currently in the 70-99% striking distance band.
                  </p>
                ) : (
                  <>
                    {feasibility.close.slice(0, 3).map((item, idx) => (
                      <div
                        key={`locked-cls-${idx}`}
                        className="p-2.5 rounded-xl bg-white border border-amber-200/80 shadow-2xs flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-6 h-6 rounded-md bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 shrink-0">
                            <Lock className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-800 truncate flex items-center gap-1.5">
                              <span>🔒 Locked Near-FIRE Haven #{idx + 1}</span>
                              <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                {item.country.region}
                              </span>
                            </h4>
                            <p className="text-[10px] text-slate-500 truncate">
                              Cost: $
                              {item.country.costOfLiving.monthlyBudgetSingleUSD.toLocaleString()}
                              /mo · Nest Egg: ${(item.nestEggUSD / 1000).toFixed(0)}k · Log in to
                              reveal
                            </p>
                          </div>
                        </div>
                        <span className="px-2 py-1 rounded-lg bg-amber-100 text-amber-950 text-xs font-mono font-black shrink-0">
                          {item.fundedPercent}%
                        </span>
                      </div>
                    ))}
                    {feasibility.close.length > 3 && (
                      <div className="p-2 rounded-xl bg-amber-100/70 border border-amber-200 text-center text-[11px] font-bold text-amber-900">
                        🔒 +{feasibility.close.length - 3} more 70–99% funded countries unlocked —
                        Log in to reveal all
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-gradient-to-r from-indigo-950 via-slate-900 to-teal-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="text-xs font-extrabold flex items-center gap-1.5 text-amber-300">
                <Lock className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {totalUnlocked} Retirement Havens Unlocked with Your {corpusDisplay} Corpus (
                  {feasibility.achieved.length} Fully Funded · {feasibility.close.length} Close to
                  FIRE) — Log In to Reveal All Countries!
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">
                Sign up free or log in to unlock the full list of {totalUnlocked} matching countries,
                compare required FIRE nest eggs, and save your progress to your dashboard.
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
        /* LOGGED-IN FULL INTERACTIVE COUNTRY FEASIBILITY MATRIX */
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Achieved Freedom Havens (100%+) */}
            <div className="p-4 rounded-2xl bg-emerald-50/90 border border-emerald-200/90 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
                  <span>🟢 Achieved Freedom (100%+ Funded)</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-200/80 text-emerald-950 text-xs font-mono font-bold">
                  {feasibility.achieved.length}
                </span>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {feasibility.achieved.length === 0 ? (
                  <p className="text-xs text-emerald-800 italic py-2 text-center">
                    No havens fully funded yet. Increase your investments or explore lower-cost
                    retirement havens below!
                  </p>
                ) : (
                  feasibility.achieved.map(item => (
                    <div
                      key={`ach-widget-${item.country.id}`}
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
                            Cost: $
                            {item.country.costOfLiving.monthlyBudgetSingleUSD.toLocaleString()}/mo ·
                            Nest Egg: ${(item.nestEggUSD / 1000).toFixed(0)}k
                          </p>
                        </div>
                      </div>
                      <span className="px-2 py-1 rounded-lg bg-emerald-100 text-emerald-900 text-xs font-mono font-black shrink-0">
                        {item.fundedPercent}%
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Close to FIRE Havens (70% - 99%) */}
            <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200/90 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                  <span>🟡 Close to FIRE (70% - 99% Funded)</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-200/80 text-amber-950 text-xs font-mono font-bold">
                  {feasibility.close.length}
                </span>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {feasibility.close.length === 0 ? (
                  <p className="text-xs text-amber-800 italic py-2 text-center">
                    No havens currently in the 70-99% striking distance band.
                  </p>
                ) : (
                  feasibility.close.map(item => (
                    <div
                      key={`cls-widget-${item.country.id}`}
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
                            Cost: $
                            {item.country.costOfLiving.monthlyBudgetSingleUSD.toLocaleString()}/mo ·
                            Nest Egg: ${(item.nestEggUSD / 1000).toFixed(0)}k
                          </p>
                        </div>
                      </div>
                      <span className="px-2 py-1 rounded-lg bg-amber-100 text-amber-950 text-xs font-mono font-black shrink-0">
                        {item.fundedPercent}%
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Toggle On-Demand for Far Countries (<70%) */}
          <div className="pt-2 border-t border-indigo-100">
            <button
              type="button"
              onClick={() => setShowFarCountries(prev => !prev)}
              className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 border border-indigo-200 text-indigo-900 text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <span>
                {showFarCountries
                  ? 'Hide Long-Term Horizons (<70% Funded)'
                  : `Show Long-Term Horizon Havens (${feasibility.far.length} Countries <70%)`}
              </span>
              {showFarCountries ? (
                <ChevronUp className="w-4 h-4 text-indigo-600" />
              ) : (
                <ChevronDown className="w-4 h-4 text-indigo-600" />
              )}
            </button>

            <AnimatePresence>
              {showFarCountries && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 overflow-hidden"
                >
                  {feasibility.far.map(item => (
                    <div
                      key={`far-widget-${item.country.id}`}
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
                            ${item.country.costOfLiving.monthlyBudgetSingleUSD.toLocaleString()}/mo
                          </p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-900 text-[10px] font-mono font-bold shrink-0">
                        {item.fundedPercent}%
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
