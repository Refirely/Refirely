import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, Wallet, ChevronDown, ChevronUp, Sparkles, Clock } from 'lucide-react';
import { Country, UserProfile } from '../types';
import { CountryFlag } from './CountryFlag';
import { getCountryNomadProfile } from '../data/countryNomadProfiles';

interface NomadHavenRunwayWidgetProps {
  userProfile: UserProfile;
  countries: Country[];
  liquidSavingsUSD: number;
  onSelectCountry?: (countryName: string) => void;
}

export interface NomadHavenRunwayItem {
  country: Country;
  monthlyBurnUSD: number;
  runwayMonths: number;
  status: 'long-term' | 'medium-term' | 'depleting';
}

export const NomadHavenRunwayWidget: React.FC<NomadHavenRunwayWidgetProps> = ({
  userProfile,
  countries,
  liquidSavingsUSD,
  onSelectCountry,
}) => {
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

    return {
      longTerm: items.filter(i => i.status === 'long-term').sort((a, b) => b.runwayMonths - a.runwayMonths),
      mediumTerm: items.filter(i => i.status === 'medium-term').sort((a, b) => b.runwayMonths - a.runwayMonths),
      depleting: items.filter(i => i.status === 'depleting').sort((a, b) => b.runwayMonths - a.runwayMonths),
      savings,
    };
  }, [countries, liquidSavingsUSD]);

  const savingsDisplay = `$${Math.round(runwayData.savings / 1000).toLocaleString()}k`;

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-teal-50/90 via-white to-indigo-50/80 border border-teal-200/90 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-600 to-indigo-600 text-white flex items-center justify-center shadow-2xs">
              <Wallet className="w-4 h-4" />
            </div>
            <h3
              className="text-sm sm:text-base font-extrabold text-slate-900"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Digital Nomad Runway &amp; Haven Sustainability Matrix ({savingsDisplay} Liquid Buffer)
            </h3>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Dividing your liquid cash buffer by turnkey monthly nomad living expenses reveals your real calendar survival runway across global nomad hotspots.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold">
            🟢 {runwayData.longTerm.length} 24+ Mo Sustainable
          </span>
          <span className="px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold">
            🟡 {runwayData.mediumTerm.length} 6-23 Mo Runway
          </span>
        </div>
      </div>

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
                No havens currently offer 24+ months of runway with this liquid buffer. Increase cash savings or choose lower-cost nomad hubs!
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
                      <CountryFlag countryName={item.country.name} fallbackEmoji={item.country.flag} size="sm" className="rounded-xs shrink-0" />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-emerald-700 transition-colors">
                          {item.country.name}
                        </h4>
                        <p className="text-[10px] text-slate-500 truncate">
                          Turnkey: ${item.monthlyBurnUSD.toLocaleString()}/mo · Internet: {np.verifiedInternetMbps || 150} Mbps
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
                      <CountryFlag countryName={item.country.name} fallbackEmoji={item.country.flag} size="sm" className="rounded-xs shrink-0" />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-amber-700 transition-colors">
                          {item.country.name}
                        </h4>
                        <p className="text-[10px] text-slate-500 truncate">
                          Turnkey: ${item.monthlyBurnUSD.toLocaleString()}/mo · Internet: {np.verifiedInternetMbps || 150} Mbps
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
          <span>{showDepletingCountries ? 'Hide High Burn / Rapid Depletion Havens (<6 Months)' : `Show High Burn Havens (${runwayData.depleting.length} Countries <6 Mo Runway)`}</span>
          {showDepletingCountries ? <ChevronUp className="w-4 h-4 text-teal-600" /> : <ChevronDown className="w-4 h-4 text-teal-600" />}
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
                    <CountryFlag countryName={item.country.name} fallbackEmoji={item.country.flag} size="sm" className="rounded-xs shrink-0" />
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
    </div>
  );
};
