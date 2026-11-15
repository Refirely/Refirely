import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, CheckCircle2, ChevronDown, ChevronUp, Sparkles, Shield, ArrowRight } from 'lucide-react';
import { Country, UserProfile } from '../types';
import { getCountryFireFeasibilityList, CountryFireFeasibility } from '../utils/fireCalculations';
import { CountryFlag } from './CountryFlag';

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
  const [showFarCountries, setShowFarCountries] = useState<boolean>(false);

  const feasibility = useMemo(() => {
    return getCountryFireFeasibilityList(userProfile, countries);
  }, [userProfile, countries]);

  const corpusDisplay = `$${Math.round((feasibility.effectiveCorpus || 0) / 1000).toLocaleString()}k`;

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-indigo-50/90 via-white to-teal-50/80 border border-indigo-200/90 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-teal-600 text-white flex items-center justify-center shadow-2xs">
              <Globe className="w-4 h-4" />
            </div>
            <h3
              className="text-sm sm:text-base font-extrabold text-slate-900"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Global Haven FIRE Feasibility Breakdown ({corpusDisplay} Investable Corpus)
            </h3>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Based on your active financial portfolio and Safe Withdrawal Rate (SWR), here is your financial independence readiness across 200+ global retirement havens.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold">
            🟢 {feasibility.achieved.length} Achieved
          </span>
          <span className="px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold">
            🟡 {feasibility.close.length} Close (70-99%)
          </span>
        </div>
      </div>

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
                No havens fully funded yet. Increase your investments or explore lower-cost retirement havens below!
              </p>
            ) : (
              feasibility.achieved.map(item => (
                <div
                  key={`ach-widget-${item.country.id}`}
                  onClick={() => onSelectCountry && onSelectCountry(item.country.name)}
                  className="p-2.5 rounded-xl bg-white border border-emerald-200/80 shadow-2xs hover:border-emerald-400 transition-all flex items-center justify-between gap-3 cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <CountryFlag countryName={item.country.name} fallbackEmoji={item.country.flag} size="sm" className="rounded-xs shrink-0" />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-emerald-700 transition-colors">
                        {item.country.name}
                      </h4>
                      <p className="text-[10px] text-slate-500 truncate">
                        Cost: ${item.country.costOfLiving.monthlyBudgetSingleUSD.toLocaleString()}/mo · Nest Egg: ${(item.nestEggUSD / 1000).toFixed(0)}k
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
                    <CountryFlag countryName={item.country.name} fallbackEmoji={item.country.flag} size="sm" className="rounded-xs shrink-0" />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-amber-700 transition-colors">
                        {item.country.name}
                      </h4>
                      <p className="text-[10px] text-slate-500 truncate">
                        Cost: ${item.country.costOfLiving.monthlyBudgetSingleUSD.toLocaleString()}/mo · Nest Egg: ${(item.nestEggUSD / 1000).toFixed(0)}k
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
          <span>{showFarCountries ? 'Hide Long-Term Horizons (<70% Funded)' : `Show Long-Term Horizon Havens (${feasibility.far.length} Countries <70%)`}</span>
          {showFarCountries ? <ChevronUp className="w-4 h-4 text-indigo-600" /> : <ChevronDown className="w-4 h-4 text-indigo-600" />}
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
                    <CountryFlag countryName={item.country.name} fallbackEmoji={item.country.flag} size="sm" className="rounded-xs shrink-0" />
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
    </div>
  );
};
