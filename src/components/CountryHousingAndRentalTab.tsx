import React, { useState, useMemo } from 'react';
import { Country } from '../types';
import { useApp } from '../context/AppContext';
import { getCountryNomadProfile } from '../data/countryNomadProfiles';
import {
  getCountryHousingProfile,
  NeighborhoodRentalProfile,
} from '../data/countryHousingAndRentals';
import {
  Home,
  Building,
  DollarSign,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Scale,
  FileText,
  Key,
  Compass,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Info,
  ExternalLink,
  ChevronRight,
  Wifi,
  Zap,
  Sparkles,
  Users,
  MapPin,
  Clock,
  RotateCcw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CountryHousingAndRentalTabProps {
  country: Country;
  onNavigateTab?: (tab: 'visa' | 'cost' | 'faq' | 'cities' | 'community' | 'healthcare' | 'finances') => void;
}

export const CountryHousingAndRentalTab: React.FC<CountryHousingAndRentalTabProps> = ({
  country,
  onNavigateTab,
}) => {
  const { currentPersona } = useApp();
  const housing = useMemo(() => getCountryHousingProfile(country), [country]);
  const nomadProfile = useMemo(() => getCountryNomadProfile(country), [country]);

  // Filter state for neighborhood directory
  const [selectedDistrictType, setSelectedDistrictType] = useState<string>('All');
  const [selectedCity, setSelectedCity] = useState<string>('All');

  // Interactive Monthly Housing Cost Calculator State
  const [calcAptType, setCalcAptType] = useState<'studio' | '1bed-center' | '1bed-outside' | '2bed-center' | 'villa'>('1bed-center');
  const [includeFiberWifi, setIncludeFiberWifi] = useState(true);
  const [includeAcHeatingBonus, setIncludeAcHeatingBonus] = useState(false);
  const [includeWeeklyCleaner, setIncludeWeeklyCleaner] = useState(false);
  const [includeBuildingHoa, setIncludeBuildingHoa] = useState(true);

  // Available unique cities in the neighborhood dataset
  const availableCities = useMemo(() => {
    const set = new Set<string>();
    set.add('All');
    housing.safeExpatNeighborhoods.forEach(n => set.add(n.city));
    return Array.from(set);
  }, [housing]);

  // Filtered neighborhoods
  const filteredNeighborhoods = useMemo(() => {
    return housing.safeExpatNeighborhoods.filter(n => {
      const matchType = selectedDistrictType === 'All' || n.districtType === selectedDistrictType;
      const matchCity = selectedCity === 'All' || n.city === selectedCity;
      return matchType && matchCity;
    });
  }, [housing, selectedDistrictType, selectedCity]);

  // Calculate estimated total monthly housing budget based on calculator state
  const calculatedMonthlyTotal = useMemo(() => {
    let baseRent = housing.avgNationalRent1BedCenterUSD;
    if (calcAptType === 'studio') baseRent = Math.round(housing.avgNationalRent1BedCenterUSD * 0.78);
    else if (calcAptType === '1bed-outside') baseRent = housing.avgNationalRent1BedOutsideUSD;
    else if (calcAptType === '2bed-center') baseRent = housing.avgNationalRent2BedCenterUSD;
    else if (calcAptType === 'villa') baseRent = Math.round(housing.avgNationalRent2BedCenterUSD * 1.55);

    let utilities = housing.avgMonthlyUtilitiesUSD;
    if (includeAcHeatingBonus) utilities += Math.round(utilities * 0.45); // heavy summer cooling or winter heating
    const wifi = includeFiberWifi ? housing.highSpeedInternetUSD : 0;
    const hoa = includeBuildingHoa ? Math.round(baseRent * 0.08) : 0;
    const cleaner = includeWeeklyCleaner ? 120 : 0;

    return {
      baseRent,
      utilities,
      wifi,
      hoa,
      cleaner,
      totalUSD: baseRent + utilities + wifi + hoa + cleaner,
    };
  }, [
    calcAptType,
    includeFiberWifi,
    includeAcHeatingBonus,
    includeWeeklyCleaner,
    includeBuildingHoa,
    housing,
  ]);

  return (
    <div className="space-y-8 pb-12">
      {/* SECTION 1: HEADER & KEY HOUSING METRICS STRIP */}
      <div className="relative overflow-hidden bg-white rounded-3xl border border-indigo-100/90 p-6 sm:p-8 shadow-sm">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 via-teal-500 to-indigo-600" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-teal-700 uppercase tracking-wider mb-1">
              <Home className="w-4 h-4 text-teal-600" />
              <span>Residential Tenancy &amp; Real Estate Guide</span>
              <span className="text-slate-300">·</span>
              <span className="text-slate-600 font-semibold">{country.name} ({country.currency})</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-slate-900 via-indigo-950 to-teal-900 bg-clip-text text-transparent">
              Housing, Neighborhood Rents &amp; Tenancy Legalities
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
              Rental housing accounts for 45%–65% of your overseas monthly budget. Here is the verified breakdown of neighborhood rental costs in {country.capital} and key expat hubs, broker fee customs, tenant contract protections, safe zones, and places to exercise caution.
            </p>
          </div>

          {/* Market Velocity & Inflation Indicator */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-2 shrink-0">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-xs font-bold">
              <TrendingUp className="w-4 h-4 text-teal-600" />
              <span>Market Trend: {housing.marketTrends.yearOverYearRentChange}</span>
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Velocity: <strong className="text-slate-800">{housing.marketTrends.marketVelocity}</strong>
            </div>
          </div>
        </div>

        {/* Nomad Lens Callout: Short-Term Furnished Burn */}
        {currentPersona === 'nomad' && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-indigo-50/90 via-violet-50/70 to-teal-50/70 border border-indigo-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-indigo-600 text-white shrink-0">
                <Wifi className="w-4 h-4" />
              </span>
              <div>
                <span className="text-xs font-extrabold text-indigo-950 block">
                  ⚡ Nomad Lens: Turnkey Furnished 1-Month Stay Baseline
                </span>
                <p className="text-xs text-slate-600 mt-0.5">
                  Nomads avoid 12-month lease deposits and utility setup fees by booking furnished coliving or serviced apartments. Typical turnkey furnished stay: <strong>${nomadProfile.furnishedShortTermRentUSD.toLocaleString()}/mo</strong> with high-speed fiber WiFi included.
                </p>
              </div>
            </div>
            <div className="text-left sm:text-right shrink-0">
              <span className="font-mono text-lg font-extrabold text-indigo-950">
                ${nomadProfile.furnishedShortTermRentUSD.toLocaleString()}
                <span className="text-xs font-sans text-slate-500 font-normal">/mo turnkey</span>
              </span>
            </div>
          </div>
        )}

        {/* 4 Core Benchmark Rental Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/40 border border-emerald-200/80">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block">
              1-Bed City Center
            </span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="font-mono tabular-nums text-2xl font-extrabold text-emerald-950">
                ${housing.avgNationalRent1BedCenterUSD.toLocaleString()}
              </span>
              <span className="text-xs text-slate-500 font-medium">/mo</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Prime walkable core in {country.capital}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/80 via-white to-sky-50/40 border border-indigo-200/80">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-800 block">
              1-Bed Outside Center
            </span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="font-mono tabular-nums text-2xl font-extrabold text-indigo-950">
                ${housing.avgNationalRent1BedOutsideUSD.toLocaleString()}
              </span>
              <span className="text-xs text-slate-500 font-medium">/mo</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Quiet residential &amp; green districts
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-50/80 via-white to-purple-50/40 border border-violet-200/80">
            <span className="text-[11px] font-bold uppercase tracking-wider text-violet-800 block">
              2-Bed Family Apartment
            </span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="font-mono tabular-nums text-2xl font-extrabold text-violet-950">
                ${housing.avgNationalRent2BedCenterUSD.toLocaleString()}
              </span>
              <span className="text-xs text-slate-500 font-medium">/mo</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Couples with home office or guests
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/80 via-white to-orange-50/40 border border-amber-200/80">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 block">
              Utilities &amp; Fiber WiFi
            </span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="font-mono tabular-nums text-2xl font-extrabold text-amber-950">
                ${(housing.avgMonthlyUtilitiesUSD + housing.highSpeedInternetUSD).toLocaleString()}
              </span>
              <span className="text-xs text-slate-500 font-medium">/mo</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Electric, water, heating &amp; 300Mbps+
            </span>
          </div>
        </div>

        {/* Quick Highlights Summary Bar */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5 text-teal-600" />
            <span>Broker Finder Fee:</span>
            <strong className="text-slate-900 font-semibold">{housing.brokerAndFees.whoPaysBrokerFee}</strong>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-indigo-600" />
            <span>Standard Lease:</span>
            <strong className="text-slate-900 font-semibold">{housing.legalRules.standardLeaseDuration}</strong>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Deposit Norm:</span>
            <strong className="text-slate-900 font-semibold">{housing.brokerAndFees.securityDepositRequirement.split('+')[0]}</strong>
          </div>
        </div>
      </div>

      {/* SECTION 2: INTERACTIVE MONTHLY HOUSING OUTLAY CALCULATOR */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-300 block mb-1">
              Personalized Cost Modeling
            </span>
            <h3 className="text-xl font-extrabold text-white">
              Interactive Monthly Housing Budget Estimator
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Select your preferred apartment size and lifestyle add-ons in {country.name} to view the realistic all-inclusive monthly housing cost.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-right shrink-0">
            <span className="text-[10px] uppercase font-bold text-teal-200 block">
              Estimated Total Housing Outlay
            </span>
            <div className="flex items-baseline justify-end gap-1.5 mt-0.5">
              <span className="font-mono tabular-nums text-3xl font-extrabold text-white">
                ${calculatedMonthlyTotal.totalUSD.toLocaleString()}
              </span>
              <span className="text-xs text-slate-300 font-normal">/mo</span>
            </div>
            <span className="text-[11px] text-teal-300 font-medium block mt-0.5">
              ≈ {(calculatedMonthlyTotal.totalUSD * (country.currency === 'EUR' ? 0.92 : country.currency === 'THB' ? 35.5 : country.currency === 'MXN' ? 18.2 : 1)).toLocaleString(undefined, { maximumFractionDigits: 0 })} {country.currency}
            </span>
          </div>
        </div>

        {/* Apt Size Buttons */}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">
              Apartment Size &amp; Location Tier:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { id: 'studio', label: 'Studio Apartment', desc: 'Single retiree / minimalist' },
                { id: '1bed-outside', label: '1-Bed (Suburbs)', desc: 'Quiet, residential, lower rent' },
                { id: '1bed-center', label: '1-Bed (City Center)', desc: 'Walkable central living' },
                { id: '2bed-center', label: '2-Bed (City Center)', desc: 'Home office or guests' },
                { id: 'villa', label: 'Villa / Large Home', desc: 'Garden, private pool or terrace' },
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setCalcAptType(opt.id as any)}
                  className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                    calcAptType === opt.id
                      ? 'bg-teal-500/25 border-teal-400 text-white shadow-xs'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <span className="text-xs font-bold block">{opt.label}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Add-ons Toggles */}
          <div className="pt-2">
            <label className="text-xs font-semibold text-slate-300 block mb-2">
              Utility &amp; Maintenance Add-Ons:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => setIncludeFiberWifi(!includeFiberWifi)}
                className={`p-2.5 rounded-xl text-xs font-bold border flex items-center justify-between cursor-pointer transition-all ${
                  includeFiberWifi ? 'bg-teal-500/20 border-teal-400 text-teal-200' : 'bg-white/5 border-white/10 text-slate-400'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Wifi className="w-3.5 h-3.5" />
                  <span>300M+ Fiber WiFi</span>
                </span>
                <span className="font-mono text-[11px]">+${housing.highSpeedInternetUSD}</span>
              </button>

              <button
                onClick={() => setIncludeAcHeatingBonus(!includeAcHeatingBonus)}
                className={`p-2.5 rounded-xl text-xs font-bold border flex items-center justify-between cursor-pointer transition-all ${
                  includeAcHeatingBonus ? 'bg-amber-500/20 border-amber-400 text-amber-200' : 'bg-white/5 border-white/10 text-slate-400'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Heavy AC / Heating</span>
                </span>
                <span className="font-mono text-[11px]">+{Math.round(housing.avgMonthlyUtilitiesUSD * 0.45)}</span>
              </button>

              <button
                onClick={() => setIncludeBuildingHoa(!includeBuildingHoa)}
                className={`p-2.5 rounded-xl text-xs font-bold border flex items-center justify-between cursor-pointer transition-all ${
                  includeBuildingHoa ? 'bg-indigo-500/20 border-indigo-400 text-indigo-200' : 'bg-white/5 border-white/10 text-slate-400'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5" />
                  <span>Building HOA / Elevator</span>
                </span>
                <span className="font-mono text-[11px]">~${Math.round(calculatedMonthlyTotal.baseRent * 0.08)}</span>
              </button>

              <button
                onClick={() => setIncludeWeeklyCleaner(!includeWeeklyCleaner)}
                className={`p-2.5 rounded-xl text-xs font-bold border flex items-center justify-between cursor-pointer transition-all ${
                  includeWeeklyCleaner ? 'bg-rose-500/20 border-rose-400 text-rose-200' : 'bg-white/5 border-white/10 text-slate-400'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Weekly Cleaning Maid</span>
                </span>
                <span className="font-mono text-[11px]">+$120</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: FAMOUS CITIES & NEIGHBORHOODS RENTAL DIRECTORY */}
      <div className="bg-white rounded-3xl border border-indigo-100/90 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-800 uppercase tracking-wider mb-1">
              <MapPin className="w-4 h-4 text-indigo-600" />
              <span>Expat Enclaves &amp; Urban Micro-Markets</span>
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">
              Famous Neighborhoods &amp; Rent Costs in {country.name}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Average rental costs, walkability, safety scores, and lifestyle atmosphere for top districts.
            </p>
          </div>

          {/* City & Type Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {availableCities.length > 2 && (
              <select
                value={selectedCity}
                onChange={e => setSelectedCity(e.target.value)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                {availableCities.map(c => (
                  <option key={c} value={c}>{c === 'All' ? 'All Cities' : c}</option>
                ))}
              </select>
            )}

            <select
              value={selectedDistrictType}
              onChange={e => setSelectedDistrictType(e.target.value)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="All">All Vibe Styles</option>
              <option value="Expat Favorite & Walkable">Expat Walkable &amp; Social</option>
              <option value="Peaceful Residential & Green">Peaceful &amp; Green</option>
              <option value="Diplomatic & Luxury">Diplomatic &amp; Luxury</option>
              <option value="Coastal & Beachfront">Coastal &amp; Beachfront</option>
              <option value="Budget Friendly & Authentic">Budget Friendly</option>
              <option value="Hip & Bohemian">Hip &amp; Bohemian</option>
            </select>
          </div>
        </div>

        {/* Neighborhood Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredNeighborhoods.map((n, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              className="p-5 rounded-2xl bg-gradient-to-br from-slate-50/80 via-white to-indigo-50/30 border border-slate-200/90 hover:border-indigo-300 transition-all shadow-2xs flex flex-col justify-between gap-4"
            >
              <div>
                {/* Card Header: Name, City & District Type */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                      <span>{n.name}</span>
                    </h4>
                    <span className="text-xs text-slate-500 font-medium">
                      {n.city} <span aria-hidden="true">·</span> {n.districtType}
                    </span>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-mono tabular-nums text-lg font-extrabold text-indigo-950 block">
                      ${n.avgRent1BedUSD.toLocaleString()}
                      <span className="text-xs font-normal text-slate-400 ml-1">/mo</span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium block">
                      2-Bed: ${n.avgRent2BedUSD.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Atmosphere Description */}
                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  {n.vibeAndHighlights}
                </p>

                {/* Best For Tag */}
                <div className="text-[11px] text-indigo-950 bg-indigo-50/70 border border-indigo-100 rounded-xl p-2.5 mb-3">
                  <strong className="text-indigo-900 font-bold block mb-0.5">Ideal Match:</strong>
                  <span>{n.bestFor}</span>
                </div>
              </div>

              {/* Card Footer: Safety, Walkability & Transit */}
              <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Safety: <strong className="text-slate-800 font-mono">{n.safetyRating}/100</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Walkability: <strong className="text-slate-800 font-mono">{n.walkabilityScore}/100</strong></span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span className="truncate" title={n.transitAccess}>{n.transitAccess}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* SECTION 4: PLACES & DISTRICTS TO AVOID / EXERCISE CAUTION */}
      <div className="relative overflow-hidden bg-rose-50/40 rounded-3xl border border-rose-200/80 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 text-xs font-bold text-rose-800 uppercase tracking-wider">
          <ShieldAlert className="w-4 h-4 text-rose-600" />
          <span>Local Safety Awareness &amp; Risk Avoidance</span>
        </div>

        <div>
          <h3 className="text-xl font-extrabold text-slate-900">
            Neighborhoods &amp; Zones to Exercise Caution in {country.name}
          </h3>
          <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
            Every country has areas with heightened pickpocketing, poor lighting, or industrial isolation. Knowing these districts in advance prevents rental deposit mistakes and keeps your day-to-day life secure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {housing.areasToAvoidOrCaution.map((caution, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-white border border-rose-200 text-xs space-y-2.5 shadow-2xs"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">
                    {caution.districtName}
                  </h4>
                  <span className="text-[11px] text-slate-500">{caution.city}</span>
                </div>
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold shrink-0 ${
                  caution.severity === 'Strictly Avoid'
                    ? 'bg-rose-100 text-rose-900 border border-rose-300'
                    : 'bg-amber-100 text-amber-900 border border-amber-300'
                }`}>
                  {caution.severity}
                </span>
              </div>

              <div className="text-slate-700 leading-relaxed">
                <strong className="text-slate-900 font-semibold block mb-0.5">Primary Hazard:</strong>
                {caution.reason}
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600">
                <strong className="text-slate-800 font-semibold block mb-0.5">Expat Actionable Advice:</strong>
                {caution.actionableSafetyAdvice}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 5: BROKER COMMISSIONS, DEPOSITS & HOW TO FIND RENTALS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Broker Commissions & Deposit Rules */}
        <div className="bg-white rounded-3xl border border-indigo-100/90 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-teal-800 uppercase tracking-wider">
            <DollarSign className="w-4 h-4 text-teal-600" />
            <span>Agent Fees &amp; Financial Security</span>
          </div>

          <h3 className="text-lg font-extrabold text-slate-900">
            Broker Commissions &amp; Security Deposits
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200">
              <span className="text-[11px] font-bold text-teal-900 block mb-1">
                Who Pays the Real Estate Agent Fee?
              </span>
              <p className="text-slate-800 font-semibold leading-relaxed">
                {housing.brokerAndFees.whoPaysBrokerFee}
              </p>
              <p className="text-slate-600 mt-1 leading-relaxed">
                {housing.brokerAndFees.typicalBrokerCommission}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-bold text-slate-900 block mb-1">
                Security Deposit (Bond) Norms:
              </span>
              <p className="text-slate-700 leading-relaxed">
                {housing.brokerAndFees.securityDepositRequirement}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-bold text-slate-900 block mb-1">
                Guarantor / Proof of Pension Income:
              </span>
              <p className="text-slate-700 leading-relaxed">
                {housing.brokerAndFees.guarantorRequirements}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-bold text-slate-900 block mb-1">
                Utility &amp; Meter Setup Protocol:
              </span>
              <p className="text-slate-700 leading-relaxed">
                {housing.brokerAndFees.utilityRegistrationProcess}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Verified Property Search Portals */}
        <div className="bg-white rounded-3xl border border-indigo-100/90 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-800 uppercase tracking-wider">
            <ExternalLink className="w-4 h-4 text-indigo-600" />
            <span>Search Portals &amp; Scout Stays</span>
          </div>

          <h3 className="text-lg font-extrabold text-slate-900">
            Top Real Estate Portals for {country.name}
          </h3>

          <div className="space-y-3">
            {housing.brokerAndFees.keyListingPortals.map((portal, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-slate-50 hover:bg-indigo-50/40 border border-slate-200 hover:border-indigo-200 transition-all text-xs"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-extrabold text-slate-900 text-sm">
                    {portal.name}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white text-indigo-700 border border-indigo-200 shadow-2xs">
                    {portal.domainUrl}
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  {portal.description}
                </p>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 space-y-1">
            <strong className="block font-bold">Pro Tip for Relocating Retirees:</strong>
            <p className="leading-relaxed">
              Book a 2-to-4 week furnished stay via Airbnb or Flatio in your top-choice neighborhood before signing any 12-month lease. Walk the streets at 8 AM, 2 PM, and 10 PM to evaluate street noise, grocery proximity, and hill steepness.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 6: LEGAL RULES ABOUT RENTAL CONTRACTS */}
      <div className="bg-white rounded-3xl border border-indigo-100/90 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-2 text-xs font-bold text-indigo-800 uppercase tracking-wider">
          <Scale className="w-4 h-4 text-indigo-600" />
          <span>Statutory Protections &amp; Lease Laws</span>
        </div>

        <div>
          <h3 className="text-xl font-extrabold text-slate-900">
            Legal Tenancy Framework &amp; Contract Rules in {country.name}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
            Understanding statutory lease terms protects you against arbitrary rent increases, unfair deposit withholding, or sudden contract terminations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
            <span className="text-[11px] font-bold uppercase text-slate-500 block">
              Contract Duration &amp; Extensions
            </span>
            <strong className="text-slate-900 font-extrabold text-sm block">
              {housing.legalRules.standardLeaseDuration}
            </strong>
            <p className="text-slate-600 leading-relaxed pt-1 border-t border-slate-200">
              Most standard contracts automatically roll over unless explicit statutory non-renewal notice is served in advance.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
            <span className="text-[11px] font-bold uppercase text-slate-500 block">
              Early Exit &amp; Break Clause Notice
            </span>
            <strong className="text-slate-900 font-extrabold text-sm block">
              {housing.legalRules.earlyTerminationNotice}
            </strong>
            <p className="text-slate-600 leading-relaxed pt-1 border-t border-slate-200">
              Statutory notice periods protect you from paying the entire remaining contract balance if you need to return home.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
            <span className="text-[11px] font-bold uppercase text-slate-500 block">
              Rent Increase Indexation &amp; Caps
            </span>
            <strong className="text-slate-900 font-extrabold text-sm block">
              {housing.legalRules.tenantProtectionsAndRentCaps}
            </strong>
            <p className="text-slate-600 leading-relaxed pt-1 border-t border-slate-200">
              Landlords cannot demand arbitrary double-digit spikes without official statistical inflation indexation.
            </p>
          </div>
        </div>

        {/* Detailed Legal Rules Callouts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/70 to-white border border-indigo-200/80 space-y-1.5">
            <div className="flex items-center gap-1.5 text-indigo-900 font-bold text-sm">
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>Mandatory Tax Registration for Visa Proof:</span>
            </div>
            <p className="text-slate-700 leading-relaxed">
              {housing.legalRules.registrationRequirement}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-50/70 to-white border border-teal-200/80 space-y-1.5">
            <div className="flex items-center gap-1.5 text-teal-900 font-bold text-sm">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>Move-In Inspection &amp; Deposit Refund Law:</span>
            </div>
            <p className="text-slate-700 leading-relaxed">
              {housing.legalRules.inventoryAndDepositReturn}
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 7: CHECKLIST & EXPAT RED FLAGS BEFORE SIGNING */}
      <div className="bg-white rounded-3xl border border-indigo-100/90 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-wider">
          <CheckCircle2 className="w-4 h-4 text-amber-600" />
          <span>Due Diligence Checklist</span>
        </div>

        <div>
          <h3 className="text-xl font-extrabold text-slate-900">
            6 Must-Check Clauses Before Wiring Any Deposit
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Always inspect and verify these specific points in the written contract before sending your deposit.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm">
          {housing.mustCheckClausesChecklist.map((clause, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-start gap-3 text-slate-700 leading-relaxed"
            >
              <span className="w-6 h-6 rounded-lg bg-teal-100 text-teal-800 font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                ✓
              </span>
              <span>{clause}</span>
            </div>
          ))}
        </div>

        {/* Golden Rules Callout */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-50/80 via-orange-50/50 to-indigo-50/50 border border-amber-200/90 text-xs space-y-2">
          <strong className="text-amber-950 font-bold text-sm block">
            Golden Rules of Renting Overseas:
          </strong>
          <div className="space-y-1.5 text-slate-700">
            {housing.expatRentingGoldenRules.map((rule, idx) => (
              <p key={idx} className="leading-relaxed">{rule}</p>
            ))}
          </div>
        </div>

        {/* Navigation CTAs to other related tabs */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="text-slate-500 font-medium">
            Explore related relocation planning modules:
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onNavigateTab?.('cost')}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold cursor-pointer transition-colors"
            >
              Annual Budget Calculator →
            </button>
            <button
              onClick={() => onNavigateTab?.('visa')}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold cursor-pointer transition-colors"
            >
              Residency Visas →
            </button>
            <button
              onClick={() => onNavigateTab?.('finances')}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold cursor-pointer transition-colors"
            >
              Banking &amp; Expat Taxes →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
