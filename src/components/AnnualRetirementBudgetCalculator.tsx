import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Country } from '../types';
import {
  DollarSign, Calculator, ArrowRight, RefreshCw,
  Home, ShoppingCart, Utensils, Zap, Stethoscope, Car,
  Sparkles, PiggyBank, ShieldCheck, Plane, FileCheck, Layers
} from 'lucide-react';

export const COUNTRY_EXCHANGE_RATES: Record<string, { rate: number; symbol: string; code: string; name: string }> = {
  portugal: { rate: 0.92, symbol: '€', code: 'EUR', name: 'Euro' },
  spain: { rate: 0.92, symbol: '€', code: 'EUR', name: 'Euro' },
  thailand: { rate: 36.5, symbol: '฿', code: 'THB', name: 'Thai Baht' },
  'costa-rica': { rate: 520, symbol: '₡', code: 'CRC', name: 'Costa Rican Colón' },
  panama: { rate: 1.0, symbol: '$', code: 'USD', name: 'US Dollar' },
  mexico: { rate: 18.2, symbol: '$', code: 'MXN', name: 'Mexican Peso' },
  greece: { rate: 0.92, symbol: '€', code: 'EUR', name: 'Euro' },
  italy: { rate: 0.92, symbol: '€', code: 'EUR', name: 'Euro' },
  malaysia: { rate: 4.65, symbol: 'RM', code: 'MYR', name: 'Malaysian Ringgit' },
  colombia: { rate: 4050, symbol: 'COP $', code: 'COP', name: 'Colombian Peso' },
  philippines: { rate: 56.5, symbol: '₱', code: 'PHP', name: 'Philippine Peso' },
  vietnam: { rate: 25400, symbol: '₫', code: 'VND', name: 'Vietnamese Dong' },
  france: { rate: 0.92, symbol: '€', code: 'EUR', name: 'Euro' },
  cyprus: { rate: 0.92, symbol: '€', code: 'EUR', name: 'Euro' },
  ecuador: { rate: 1.0, symbol: '$', code: 'USD', name: 'US Dollar' },
  'united-arab-emirates': { rate: 3.67, symbol: 'AED ', code: 'AED', name: 'UAE Dirham' },
  morocco: { rate: 9.85, symbol: 'DH ', code: 'MAD', name: 'Moroccan Dirham' },
  'south-africa': { rate: 17.8, symbol: 'R', code: 'ZAR', name: 'South African Rand' },
  fiji: { rate: 2.24, symbol: 'FJ$', code: 'FJD', name: 'Fijian Dollar' },
  'st-kitts-and-nevis': { rate: 2.70, symbol: 'EC$', code: 'XCD', name: 'East Caribbean Dollar' },
  aruba: { rate: 1.79, symbol: 'Afl.', code: 'AWG', name: 'Aruban Florin' },
  'cayman-islands': { rate: 0.83, symbol: 'CI$', code: 'KYD', name: 'Cayman Islands Dollar' },
  jamaica: { rate: 157.0, symbol: 'J$', code: 'JMD', name: 'Jamaican Dollar' },
  'saint-lucia': { rate: 2.70, symbol: 'EC$', code: 'XCD', name: 'East Caribbean Dollar' },
  grenada: { rate: 2.70, symbol: 'EC$', code: 'XCD', name: 'East Caribbean Dollar' },
  'antigua-and-barbuda': { rate: 2.70, symbol: 'EC$', code: 'XCD', name: 'East Caribbean Dollar' },
  bermuda: { rate: 1.0, symbol: 'BD$', code: 'BMD', name: 'Bermudian Dollar' },
  seychelles: { rate: 14.2, symbol: 'SR ', code: 'SCR', name: 'Seychellois Rupee' },
  serbia: { rate: 108.5, symbol: 'дин ', code: 'RSD', name: 'Serbian Dinar' },
  slovakia: { rate: 0.92, symbol: '€', code: 'EUR', name: 'Euro' },
};

interface AnnualRetirementBudgetCalculatorProps {
  country: Country;
  onNavigateToHealthcare?: () => void;
}

export const AnnualRetirementBudgetCalculator: React.FC<AnnualRetirementBudgetCalculatorProps> = ({
  country,
  onNavigateToHealthcare,
}) => {
  // Exchange rate configuration
  const currencyInfo = COUNTRY_EXCHANGE_RATES[country.id] || {
    rate: 1.0,
    symbol: country.currencySymbol || '$',
    code: country.currency || 'USD',
    name: 'Local Currency',
  };

  // State controls
  const [household, setHousehold] = useState<'single' | 'couple'>('single');
  const [housingType, setHousingType] = useState<'coastal' | 'center' | 'villa'>('coastal');
  const [groceryStyle, setGroceryStyle] = useState<'local' | 'imported'>('local');
  const [diningFrequency, setDiningFrequency] = useState<'moderate' | 'frequent'>('moderate');
  const [healthcareTier, setHealthcareTier] = useState<'standard' | 'premium'>('standard');
  const [includeDomesticHelp, setIncludeDomesticHelp] = useState(false);
  const [transportMode, setTransportMode] = useState<'transit' | 'car'>('transit');
  const [displayCurrency, setDisplayCurrency] = useState<'USD' | 'LOCAL' | 'BOTH'>('BOTH');
  const [customExchangeRate, setCustomExchangeRate] = useState<number>(currencyInfo.rate);

  // Helper formatters
  const formatUSD = (val: number) => `$${Math.round(val).toLocaleString()} USD`;
  const formatLocal = (val: number) => {
    const localVal = Math.round(val * customExchangeRate);
    return `${currencyInfo.symbol}${localVal.toLocaleString()} ${currencyInfo.code}`;
  };

  const renderDual = (valUSD: number) => {
    if (displayCurrency === 'USD') return formatUSD(valUSD);
    if (displayCurrency === 'LOCAL') return formatLocal(valUSD);
    return (
      <span className="flex flex-col sm:inline-block">
        <span className="font-mono tabular-nums">{formatUSD(valUSD)}</span>
        <span className="text-[11px] text-slate-400 sm:ml-2 font-mono tabular-nums">
          ({formatLocal(valUSD)})
        </span>
      </span>
    );
  };

  // 1. Monthly Housing Calculation
  let monthlyRentUSD = country.costOfLiving.rent1BedOutsideUSD;
  if (housingType === 'center') {
    monthlyRentUSD = country.costOfLiving.rent1BedCenterUSD;
  } else if (housingType === 'villa') {
    monthlyRentUSD = Math.round(country.costOfLiving.rent1BedCenterUSD * 1.55);
  }
  if (household === 'couple' && housingType !== 'villa') {
    monthlyRentUSD = Math.round(monthlyRentUSD * 1.15); // slightly larger space for couple
  }

  // 2. Monthly Groceries
  const baseGroceriesUSD = Math.round(country.costOfLiving.groceriesIndex * 7.5);
  let monthlyGroceriesUSD = household === 'couple' ? baseGroceriesUSD * 1.75 : baseGroceriesUSD;
  if (groceryStyle === 'imported') {
    monthlyGroceriesUSD = Math.round(monthlyGroceriesUSD * 1.35);
  }

  // 3. Monthly Dining Out
  const mealPrice = country.costOfLiving.mealInexpensiveUSD;
  const mealsCount = diningFrequency === 'frequent'
    ? (household === 'couple' ? 36 : 22)
    : (household === 'couple' ? 18 : 10);
  const monthlyDiningUSD = Math.round(mealPrice * mealsCount + (household === 'couple' ? 120 : 60));

  // 4. Monthly Utilities & Fiber
  let monthlyUtilitiesUSD = country.costOfLiving.utilitiesMonthlyUSD * (household === 'couple' ? 1.3 : 1);
  monthlyUtilitiesUSD += 40; // 500Mbps fiber internet + mobile eSIM

  // 5. Monthly Healthcare Insurance
  let monthlyHealthUSD = country.costOfLiving.healthcareMonthlyUSD * (household === 'couple' ? 1.85 : 1);
  if (healthcareTier === 'premium') {
    monthlyHealthUSD = Math.round(monthlyHealthUSD * 1.55);
  }

  // 6. Monthly Transport
  const monthlyTransportUSD = transportMode === 'car'
    ? (country.region === 'Europe' ? 380 : 260)
    : (household === 'couple' ? 95 : 55);

  // 7. Monthly Domestic Help / Leisure
  let monthlyDomesticUSD = 0;
  if (includeDomesticHelp) {
    monthlyDomesticUSD = country.region === 'Southeast Asia' || country.region === 'Americas' ? 140 : 280;
  }
  const monthlyLeisureUSD = household === 'couple' ? 180 : 110;

  // Total Monthly Outlay
  const totalMonthlyUSD = Math.round(
    monthlyRentUSD +
    monthlyGroceriesUSD +
    monthlyDiningUSD +
    monthlyUtilitiesUSD +
    monthlyHealthUSD +
    monthlyTransportUSD +
    monthlyDomesticUSD +
    monthlyLeisureUSD
  );

  // 8. Annual Overheads (One-Time / Periodic items)
  const annualFlightsUSD = household === 'couple' ? 2400 : 1300;
  const annualVisaFeesUSD = 350;
  const annualMedicalReserveUSD = household === 'couple' ? 1200 : 700;
  const annualContingencyUSD = 800;

  const totalAnnualOverheadsUSD = annualFlightsUSD + annualVisaFeesUSD + annualMedicalReserveUSD + annualContingencyUSD;
  const grandTotalAnnualUSD = (totalMonthlyUSD * 12) + totalAnnualOverheadsUSD;

  // 4% Safe Withdrawal Nest Egg
  const recommendedNestEggUSD = Math.round(grandTotalAnnualUSD / 0.04);

  // US Comparative Benchmark (Baseline US average monthly living for retiree: ~$3,650/mo)
  const US_BENCHMARK_MONTHLY = 3650;
  const monthlySavingsUSD = US_BENCHMARK_MONTHLY - totalMonthlyUSD;
  const savingsPercent = Math.round((monthlySavingsUSD / US_BENCHMARK_MONTHLY) * 100);

  return (
    <div className="relative overflow-hidden bg-white rounded-3xl border border-indigo-100/90 shadow-sm space-y-6 p-6 sm:p-8">
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-400 via-indigo-500 to-amber-500" />
      
      {/* Top Banner & Currency Conversion Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-6 border-b border-indigo-100/80">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 via-indigo-600 to-amber-500 flex items-center justify-center text-white shadow-2xs shrink-0">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-slate-900 via-indigo-950 to-teal-900 bg-clip-text text-transparent">
                Annual Retirement Budget &amp; Currency Calculator
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Calculates 12-month projected living expenses, annual periodic overheads, and currency conversion for {country.name}.
              </p>
            </div>
          </div>
        </div>

        {/* Currency Display & Exchange Rate Controller */}
        <div className="flex flex-wrap items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Display:</span>
            <div className="flex rounded-lg bg-white p-0.5 border border-slate-200 shadow-2xs">
              <button
                onClick={() => setDisplayCurrency('BOTH')}
                className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                  displayCurrency === 'BOTH' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                USD + {currencyInfo.code}
              </button>
              <button
                onClick={() => setDisplayCurrency('USD')}
                className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                  displayCurrency === 'USD' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                USD Only
              </button>
              <button
                onClick={() => setDisplayCurrency('LOCAL')}
                className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                  displayCurrency === 'LOCAL' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {currencyInfo.code} Only
              </button>
            </div>
          </div>

          <div className="h-4 w-px bg-slate-200 hidden sm:block" />

          {/* Current Rate Indicator */}
          <div className="flex items-center gap-1 text-[11px] text-slate-500">
            <span>Rate:</span>
            <span className="font-mono tabular-nums font-bold text-slate-800">
              1 USD = {customExchangeRate} {currencyInfo.code}
            </span>
            {customExchangeRate !== currencyInfo.rate && (
              <button
                onClick={() => setCustomExchangeRate(currencyInfo.rate)}
                className="text-teal-700 hover:underline ml-1"
                title="Reset to default rate"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Primary KPI Summary Strips: Monthly Outlay vs Annual Total vs Nest Egg */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric 1: Monthly Budget */}
        <motion.div
          whileHover={{ y: -3 }}
          className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-sm flex flex-col justify-between"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 to-emerald-400" />
          <div>
            <span className="text-xs text-indigo-200 font-semibold block">
              Estimated Monthly Living Cost
            </span>
            <div className="font-mono tabular-nums text-2xl sm:text-3xl font-extrabold text-teal-300 mt-2">
              ${totalMonthlyUSD.toLocaleString()}
              <span className="text-xs font-sans text-indigo-300 font-normal"> / mo</span>
            </div>
            <div className="text-xs font-mono text-indigo-200/90 mt-1">
              ≈ {formatLocal(totalMonthlyUSD)} / mo
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-emerald-300 flex items-center justify-between">
            <span>Vs. US Average ($3,650):</span>
            <span className="font-bold">Save {savingsPercent}% (${monthlySavingsUSD.toLocaleString()}/mo)</span>
          </div>
        </motion.div>

        {/* Metric 2: Grand Annual Budget */}
        <motion.div
          whileHover={{ y: -3 }}
          className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br from-teal-900 via-emerald-900 to-indigo-950 text-white shadow-sm flex flex-col justify-between"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-400 via-teal-300 to-amber-400" />
          <div>
            <span className="text-xs text-teal-200 font-semibold block">
              Grand Total Annual Budget
            </span>
            <div className="font-mono tabular-nums text-2xl sm:text-3xl font-extrabold text-white mt-2">
              ${grandTotalAnnualUSD.toLocaleString()}
              <span className="text-xs font-sans text-teal-200 font-normal"> / yr</span>
            </div>
            <div className="text-xs font-mono text-teal-200 mt-1">
              ≈ {formatLocal(grandTotalAnnualUSD)} / yr
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-teal-200 flex items-center justify-between">
            <span>Includes:</span>
            <span>12 mos rent + travel + visa &amp; health buffer</span>
          </div>
        </motion.div>

        {/* Metric 3: Safe Withdrawal Nest Egg */}
        <motion.div
          whileHover={{ y: -3 }}
          className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br from-amber-50/90 via-indigo-50/50 to-white border border-amber-200/80 text-slate-900 shadow-xs flex flex-col justify-between"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-indigo-500" />
          <div>
            <span className="text-xs text-amber-900 font-bold block">
              Suggested Portfolio / Nest Egg
            </span>
            <div className="font-mono tabular-nums text-2xl sm:text-3xl font-extrabold text-indigo-950 mt-2">
              ${recommendedNestEggUSD.toLocaleString()}
            </div>
            <div className="text-xs font-mono text-slate-600 mt-1">
              ≈ {formatLocal(recommendedNestEggUSD)}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-amber-200/70 text-[11px] text-indigo-900 flex items-center justify-between">
            <span>Rule:</span>
            <span className="font-bold">4% Safe Perpetual Withdrawal</span>
          </div>
        </motion.div>
      </div>

      {/* Interactive Scenario Adjustment Parameters */}
      <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Customize Lifestyle & Cost Parameters
          </span>
          <span className="text-xs text-slate-500">
            Local CoL Index: <strong className="font-mono text-slate-900">{country.costOfLiving.groceriesIndex}</strong> (NYC=100)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          
          {/* Household Size */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 block">Household Setup</label>
            <div className="flex rounded-lg bg-white p-1 border border-slate-200">
              <button
                onClick={() => setHousehold('single')}
                className={`flex-1 py-1.5 font-medium rounded-md transition-colors ${
                  household === 'single' ? 'bg-slate-900 text-white' : 'text-slate-600'
                }`}
              >
                Single Retiree
              </button>
              <button
                onClick={() => setHousehold('couple')}
                className={`flex-1 py-1.5 font-medium rounded-md transition-colors ${
                  household === 'couple' ? 'bg-slate-900 text-white' : 'text-slate-600'
                }`}
              >
                Couple (2 Adults)
              </button>
            </div>
          </div>

          {/* Housing Type */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 block">Housing Location & Type</label>
            <select
              value={housingType}
              onChange={e => setHousingType(e.target.value as any)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-xs focus:ring-2 focus:ring-teal-500"
            >
              <option value="coastal">1-Bed Outside Center / Coastal Town</option>
              <option value="center">1-Bed City Center Prime</option>
              <option value="villa">2-Bed House / Luxury Condominium</option>
            </select>
          </div>

          {/* Dining Frequency */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 block">Dining & Terrace Living</label>
            <select
              value={diningFrequency}
              onChange={e => setDiningFrequency(e.target.value as any)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-xs focus:ring-2 focus:ring-teal-500"
            >
              <option value="moderate">Moderate (1-2x/wk dining out)</option>
              <option value="frequent">Frequent (3-4x/wk dining & cafes)</option>
            </select>
          </div>

          {/* Private Healthcare Plan */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 block">Healthcare Insurance Tier</label>
            <select
              value={healthcareTier}
              onChange={e => setHealthcareTier(e.target.value as any)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-xs focus:ring-2 focus:ring-teal-500"
            >
              <option value="standard">Standard Resident Health Policy</option>
              <option value="premium">Comprehensive Zero-Copay Inpatient</option>
            </select>
          </div>

        </div>

        {/* Secondary Toggles: Transportation & Domestic Cleaning */}
        <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-200 text-xs">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeDomesticHelp}
              onChange={e => setIncludeDomesticHelp(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
            />
            <span className="text-slate-700 font-medium">
              Include Weekly Housekeeper / Maid (~{renderDual(country.region === 'Europe' ? 280 : 140)}/mo)
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={transportMode === 'car'}
              onChange={e => setTransportMode(e.target.checked ? 'car' : 'transit')}
              className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
            />
            <span className="text-slate-700 font-medium">
              Own / Lease Private Vehicle (vs. Public Transit & Rideshare)
            </span>
          </label>
        </div>
      </div>

      {/* Itemized Monthly Expense Line-Items Table */}
      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Itemized Monthly Expense Matrix
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            12-Month Base Projection
          </span>
        </div>

        <table className="w-full text-left text-xs divide-y divide-slate-200">
          <thead className="bg-slate-100/60 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3 px-4 w-48">Cost Domain</th>
              <th className="py-3 px-4">Selected Specification</th>
              <th className="py-3 px-4 text-right">Monthly (USD)</th>
              <th className="py-3 px-4 text-right">Monthly ({currencyInfo.code})</th>
              <th className="py-3 px-4 text-right">Annualized (12 Mos)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr>
              <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                <Home className="w-3.5 h-3.5 text-teal-700" />
                <span>Housing Rent</span>
              </td>
              <td className="py-3 px-4 text-slate-500">
                {housingType === 'center' ? 'City Center Prime' : housingType === 'villa' ? '2-Bed Villa / Luxury' : 'Coastal / Outside Center'}
              </td>
              <td className="py-3 px-4 font-mono tabular-nums text-right font-semibold text-slate-900">{formatUSD(monthlyRentUSD)}</td>
              <td className="py-3 px-4 font-mono tabular-nums text-right text-slate-600">{formatLocal(monthlyRentUSD)}</td>
              <td className="py-3 px-4 font-mono tabular-nums text-right text-slate-900">{formatUSD(monthlyRentUSD * 12)}</td>
            </tr>

            <tr>
              <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                <ShoppingCart className="w-3.5 h-3.5 text-teal-700" />
                <span>Groceries & Markets</span>
              </td>
              <td className="py-3 px-4 text-slate-500">
                {household === 'couple' ? '2 Adults' : '1 Adult'} · {groceryStyle === 'imported' ? 'Imported pantry goods' : 'Fresh regional markets'}
              </td>
              <td className="py-3 px-4 font-mono tabular-nums text-right font-semibold text-slate-900">{formatUSD(monthlyGroceriesUSD)}</td>
              <td className="py-3 px-4 font-mono tabular-nums text-right text-slate-600">{formatLocal(monthlyGroceriesUSD)}</td>
              <td className="py-3 px-4 font-mono tabular-nums text-right text-slate-900">{formatUSD(monthlyGroceriesUSD * 12)}</td>
            </tr>

            <tr>
              <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                <Utensils className="w-3.5 h-3.5 text-teal-700" />
                <span>Dining & Socializing</span>
              </td>
              <td className="py-3 px-4 text-slate-500">
                {diningFrequency === 'frequent' ? '3-4x per week dining out' : '1-2x per week dining & wine'}
              </td>
              <td className="py-3 px-4 font-mono tabular-nums text-right font-semibold text-slate-900">{formatUSD(monthlyDiningUSD)}</td>
              <td className="py-3 px-4 font-mono tabular-nums text-right text-slate-600">{formatLocal(monthlyDiningUSD)}</td>
              <td className="py-3 px-4 font-mono tabular-nums text-right text-slate-900">{formatUSD(monthlyDiningUSD * 12)}</td>
            </tr>

            <tr>
              <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-teal-700" />
                <span>Utilities & Gigabit Fiber</span>
              </td>
              <td className="py-3 px-4 text-slate-500">
                Electric, water, gas + 500Mbps fiber internet & mobile
              </td>
              <td className="py-3 px-4 font-mono tabular-nums text-right font-semibold text-slate-900">{formatUSD(monthlyUtilitiesUSD)}</td>
              <td className="py-3 px-4 font-mono tabular-nums text-right text-slate-600">{formatLocal(monthlyUtilitiesUSD)}</td>
              <td className="py-3 px-4 font-mono tabular-nums text-right text-slate-900">{formatUSD(monthlyUtilitiesUSD * 12)}</td>
            </tr>

            <tr>
              <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                <Stethoscope className="w-3.5 h-3.5 text-teal-700" />
                <span>Private Healthcare Plan</span>
              </td>
              <td className="py-3 px-4 text-slate-500">
                <span>
                  {healthcareTier === 'premium' ? 'Zero copay full hospitalization & outpatient' : 'Standard resident policy'}
                </span>
                {onNavigateToHealthcare && (
                  <button
                    onClick={onNavigateToHealthcare}
                    className="ml-2 text-[11px] font-semibold text-teal-700 hover:text-teal-900 hover:underline cursor-pointer"
                  >
                    (View Insurance & ER Guide →)
                  </button>
                )}
              </td>
              <td className="py-3 px-4 font-mono tabular-nums text-right font-semibold text-slate-900">{formatUSD(monthlyHealthUSD)}</td>
              <td className="py-3 px-4 font-mono tabular-nums text-right text-slate-600">{formatLocal(monthlyHealthUSD)}</td>
              <td className="py-3 px-4 font-mono tabular-nums text-right text-slate-900">{formatUSD(monthlyHealthUSD * 12)}</td>
            </tr>

            <tr>
              <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                <Car className="w-3.5 h-3.5 text-teal-700" />
                <span>Mobility & Transport</span>
              </td>
              <td className="py-3 px-4 text-slate-500">
                {transportMode === 'car' ? 'Vehicle fuel, insurance & upkeep' : 'High-speed transit pass & rideshare'}
              </td>
              <td className="py-3 px-4 font-mono tabular-nums text-right font-semibold text-slate-900">{formatUSD(monthlyTransportUSD)}</td>
              <td className="py-3 px-4 font-mono tabular-nums text-right text-slate-600">{formatLocal(monthlyTransportUSD)}</td>
              <td className="py-3 px-4 font-mono tabular-nums text-right text-slate-900">{formatUSD(monthlyTransportUSD * 12)}</td>
            </tr>

            {includeDomesticHelp && (
              <tr>
                <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-teal-700" />
                  <span>Domestic Help & Cleaning</span>
                </td>
                <td className="py-3 px-4 text-slate-500">
                  Weekly housekeeper / home maintenance service
                </td>
                <td className="py-3 px-4 font-mono tabular-nums text-right font-semibold text-slate-900">{formatUSD(monthlyDomesticUSD)}</td>
                <td className="py-3 px-4 font-mono tabular-nums text-right text-slate-600">{formatLocal(monthlyDomesticUSD)}</td>
                <td className="py-3 px-4 font-mono tabular-nums text-right text-slate-900">{formatUSD(monthlyDomesticUSD * 12)}</td>
              </tr>
            )}

            <tr>
              <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-teal-700" />
                <span>Leisure, Culture & Fitness</span>
              </td>
              <td className="py-3 px-4 text-slate-500">
                Gym, concerts, museum passes, domestic day trips
              </td>
              <td className="py-3 px-4 font-mono tabular-nums text-right font-semibold text-slate-900">{formatUSD(monthlyLeisureUSD)}</td>
              <td className="py-3 px-4 font-mono tabular-nums text-right text-slate-600">{formatLocal(monthlyLeisureUSD)}</td>
              <td className="py-3 px-4 font-mono tabular-nums text-right text-slate-900">{formatUSD(monthlyLeisureUSD * 12)}</td>
            </tr>

            {/* Subtotal Monthly */}
            <tr className="bg-slate-100/70 font-bold text-slate-900">
              <td className="py-3 px-4" colSpan={2}>
                Monthly Living Baseline Subtotal
              </td>
              <td className="py-3 px-4 font-mono tabular-nums text-right text-teal-900 text-sm">{formatUSD(totalMonthlyUSD)}</td>
              <td className="py-3 px-4 font-mono tabular-nums text-right text-teal-900 text-sm">{formatLocal(totalMonthlyUSD)}</td>
              <td className="py-3 px-4 font-mono tabular-nums text-right text-slate-900 text-sm">{formatUSD(totalMonthlyUSD * 12)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Annual Periodic Overheads Section */}
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
        <div className="p-4 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Annual Periodic Overheads & Travel Buffer
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            {formatUSD(totalAnnualOverheadsUSD)} / year
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 text-xs">
          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <Plane className="w-3.5 h-3.5 text-teal-700" />
              <span>Annual Trip Home</span>
            </div>
            <div className="font-mono tabular-nums font-bold text-slate-900 mt-1">
              {formatUSD(annualFlightsUSD)}
            </div>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              Roundtrip flights for {household === 'couple' ? '2 adults' : '1 adult'}
            </span>
          </div>

          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <FileCheck className="w-3.5 h-3.5 text-teal-700" />
              <span>Visa & Legal Renewal</span>
            </div>
            <div className="font-mono tabular-nums font-bold text-slate-900 mt-1">
              {formatUSD(annualVisaFeesUSD)}
            </div>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              Consulate tax & legal document renewal
            </span>
          </div>

          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
              <span>Dental & Health Reserve</span>
            </div>
            <div className="font-mono tabular-nums font-bold text-slate-900 mt-1">
              {formatUSD(annualMedicalReserveUSD)}
            </div>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              Out-of-pocket dental / prescription buffer
            </span>
          </div>

          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <PiggyBank className="w-3.5 h-3.5 text-teal-700" />
              <span>Emergency Contingency</span>
            </div>
            <div className="font-mono tabular-nums font-bold text-slate-900 mt-1">
              {formatUSD(annualContingencyUSD)}
            </div>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              Home repairs, gifts, domestic travel
            </span>
          </div>
        </div>

        {/* Final Grand Summary Footprint */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-teal-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-semibold text-teal-300 block">
              Grand Total Annual Outlay (Monthly Living x 12 + Annual Overheads)
            </span>
            <div className="font-mono tabular-nums text-xl sm:text-2xl font-extrabold text-white mt-0.5">
              ${grandTotalAnnualUSD.toLocaleString()} USD
              <span className="text-xs font-normal text-indigo-200 ml-2 font-mono">
                (≈ {formatLocal(grandTotalAnnualUSD)})
              </span>
            </div>
          </div>

          <div className="text-right sm:border-l sm:border-white/15 sm:pl-6">
            <span className="text-[11px] text-amber-300 block font-bold uppercase tracking-wider">Monthly Average Equivalent</span>
            <span className="font-mono tabular-nums text-lg font-extrabold text-teal-300">
              ${Math.round(grandTotalAnnualUSD / 12).toLocaleString()} / mo
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};
