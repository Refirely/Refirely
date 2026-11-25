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
    <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center shrink-0">
              <Globe className="w-4 h-4" />
            </div>
            <h3
              className="text-sm sm:text-base font-extrabold text-slate-900"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Global Haven FIRE Feasibility Breakdown ({corpusDisplay} Investable Corpus)
            </h3>
            {isGuestUser && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200 text-[10px] font-bold">
                <Lock className="w-3 h-3 text-indigo-600" />
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
          <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
            {feasibility.achieved.length} Achieved (100%+)
          </span>
          <span className="px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-800 text-xs font-bold">
            {feasibility.close.length} Close (70-99%)
          </span>
        </div>
      </div>

      {/* Live Asset-Based Country Unlock Statistics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 rounded-2xl bg-slate-50/70 border border-slate-200/80">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            Total Havens Unlocked (70%+ Funded)
          </span>
          <div className="text-base sm:text-lg font-black font-mono text-slate-900 mt-0.5">
            {totalUnlocked} / {countries.length}{' '}
            <span className="text-xs font-bold text-indigo-700">({unlockedPercent}%)</span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-emerald-50/40 border border-emerald-200/70">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
            100%+ FIRE Achieved
          </span>
          <div className="text-base sm:text-lg font-black font-mono text-emerald-900 mt-0.5 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feasibility.achieved.length} Countries</span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-sky-50/40 border border-sky-200/70">
          <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 block">
            70% – 99% Close to FIRE
          </span>
          <div className="text-base sm:text-lg font-black font-mono text-sky-900 mt-0.5 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-sky-600 shrink-0" />
            <span>{feasibility.close.length} Countries</span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-slate-50/70 border border-slate-200/80">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
            &lt;70% Long-Term Horizon
          </span>
          <div className="text-base sm:text-lg font-black font-mono text-slate-800 mt-0.5 flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{feasibility.far.length} Countries</span>
          </div>
        </div>
      </div>

      {isGuestUser ? (
        /* GUEST LOCKED PREVIEW MODE (Stats Visible, Country Names Gated) */
        <div className="relative rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Locked Column 1: Achieved Freedom Havens (100%+) */}
            <div className="p-4 rounded-2xl bg-emerald-50/35 border border-emerald-200/70 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                  <span>Achieved Freedom (100%+ Funded)</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-100/80 text-emerald-900 text-xs font-mono font-bold">
                  {feasibility.achieved.length} Unlocked
                </span>
              </div>

              <div className="space-y-2 opacity-80 pointer-events-none select-none">
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
                        className="p-2.5 rounded-xl bg-white border border-emerald-200/70 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-6 h-6 rounded-md bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
                            <Lock className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-800 truncate flex items-center gap-1.5">
                              <span>Locked FIRE-Ready Haven #{idx + 1}</span>
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
                        <span className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-mono font-black shrink-0">
                          {item.fundedPercent}%
                        </span>
                      </div>
                    ))}
                    {feasibility.achieved.length > 3 && (
                      <div className="p-2 rounded-xl bg-white/90 border border-emerald-200/70 text-center text-[11px] font-bold text-emerald-800">
                        +{feasibility.achieved.length - 3} more 100%+ funded FIRE countries
                        unlocked — Log in to reveal all
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Locked Column 2: Close to FIRE Havens (70% - 99%) */}
            <div className="p-4 rounded-2xl bg-sky-50/35 border border-sky-200/70 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-sky-900 flex items-center gap-1.5">
                  <span>Close to FIRE (70% - 99% Funded)</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-sky-100/80 text-sky-900 text-xs font-mono font-bold">
                  {feasibility.close.length} Unlocked
                </span>
              </div>

              <div className="space-y-2 opacity-80 pointer-events-none select-none">
                {feasibility.close.length === 0 ? (
                  <p className="text-xs text-sky-800 italic py-2 text-center">
                    No havens currently in the 70-99% striking distance band.
                  </p>
                ) : (
                  <>
                    {feasibility.close.slice(0, 3).map((item, idx) => (
                      <div
                        key={`locked-cls-${idx}`}
                        className="p-2.5 rounded-xl bg-white border border-sky-200/70 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-6 h-6 rounded-md bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700 shrink-0">
                            <Lock className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-800 truncate flex items-center gap-1.5">
                              <span>Locked Near-FIRE Haven #{idx + 1}</span>
                              <span className="text-[10px] font-semibold text-sky-800 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">
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
                        <span className="px-2 py-1 rounded-lg bg-sky-50 text-sky-900 border border-sky-200 text-xs font-mono font-black shrink-0">
                          {item.fundedPercent}%
                        </span>
                      </div>
                    ))}
                    {feasibility.close.length > 3 && (
                      <div className="p-2 rounded-xl bg-white/90 border border-sky-200/70 text-center text-[11px] font-bold text-sky-800">
                        +{feasibility.close.length - 3} more 70–99% funded countries unlocked —
                        Log in to reveal all
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50/70 via-white to-teal-50/70 border border-indigo-200/80 text-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="text-xs font-extrabold flex items-center gap-1.5 text-indigo-900">
                <Lock className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>
                  {totalUnlocked} Retirement Havens Unlocked with Your {corpusDisplay} Corpus (
                  {feasibility.achieved.length} Fully Funded · {feasibility.close.length} Close to
                  FIRE) — Log In to Reveal All Countries!
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-snug">
                Sign up free or log in to unlock the full list of {totalUnlocked} matching countries,
                compare required FIRE nest eggs, and save your progress to your dashboard.
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
        /* LOGGED-IN FULL INTERACTIVE COUNTRY FEASIBILITY MATRIX */
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Achieved Freedom Havens (100%+) */}
            <div className="p-4 rounded-2xl bg-emerald-50/35 border border-emerald-200/70 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                  <span>Achieved Freedom (100%+ Funded)</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-100/80 text-emerald-900 text-xs font-mono font-bold">
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
                            Cost: $
                            {item.country.costOfLiving.monthlyBudgetSingleUSD.toLocaleString()}/mo ·
                            Nest Egg: ${(item.nestEggUSD / 1000).toFixed(0)}k
                          </p>
                        </div>
                      </div>
                      <span className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-mono font-black shrink-0">
                        {item.fundedPercent}%
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Close to FIRE Havens (70% - 99%) */}
            <div className="p-4 rounded-2xl bg-sky-50/35 border border-sky-200/70 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-sky-900 flex items-center gap-1.5">
                  <span>Close to FIRE (70% - 99% Funded)</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-sky-100/80 text-sky-900 text-xs font-mono font-bold">
                  {feasibility.close.length}
                </span>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {feasibility.close.length === 0 ? (
                  <p className="text-xs text-sky-800 italic py-2 text-center">
                    No havens currently in the 70-99% striking distance band.
                  </p>
                ) : (
                  feasibility.close.map(item => (
                    <div
                      key={`cls-widget-${item.country.id}`}
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
                            Cost: $
                            {item.country.costOfLiving.monthlyBudgetSingleUSD.toLocaleString()}/mo ·
                            Nest Egg: ${(item.nestEggUSD / 1000).toFixed(0)}k
                          </p>
                        </div>
                      </div>
                      <span className="px-2 py-1 rounded-lg bg-sky-50 text-sky-900 border border-sky-200 text-xs font-mono font-black shrink-0">
                        {item.fundedPercent}%
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Toggle On-Demand for Far Countries (<70%) */}
          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowFarCountries(prev => !prev)}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>
                {showFarCountries
                  ? 'Hide Long-Term Horizons (<70% Funded)'
                  : `Show Long-Term Horizon Havens (${feasibility.far.length} Countries <70%)`}
              </span>
              {showFarCountries ? (
                <ChevronUp className="w-4 h-4 text-slate-600" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-600" />
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
                            ${item.country.costOfLiving.monthlyBudgetSingleUSD.toLocaleString()}/mo
                          </p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-slate-200/70 text-slate-800 text-[10px] font-mono font-bold shrink-0">
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
