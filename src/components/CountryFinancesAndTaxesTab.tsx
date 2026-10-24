import React, { useState } from 'react';
import { Country } from '../types';
import { getCountryFinanceAndTaxProfile } from '../data/countryFinancesAndTaxes';
import {
  Landmark,
  ArrowRightLeft,
  Receipt,
  PiggyBank,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  FileText,
  CreditCard,
  Globe2,
  TrendingDown,
  Scale,
  Calculator,
  ChevronRight,
  Building2,
  Lock,
} from 'lucide-react';
import { motion } from 'motion/react';

interface CountryFinancesAndTaxesTabProps {
  country: Country;
  onNavigateTab?: (tab: 'visa' | 'cost' | 'faq' | 'cities' | 'community' | 'healthcare') => void;
}

const BANK_CARD_THEMES = [
  {
    ribbon: 'from-teal-400 via-emerald-500 to-cyan-500',
    bg: 'from-teal-50/70 via-white to-emerald-50/40',
    border: 'border-teal-200/80 hover:border-teal-300',
    badge: 'bg-teal-100/90 text-teal-950 border-teal-300',
    iconBg: 'from-teal-500 to-emerald-600',
  },
  {
    ribbon: 'from-indigo-500 via-violet-500 to-purple-500',
    bg: 'from-indigo-50/70 via-white to-violet-50/40',
    border: 'border-indigo-200/80 hover:border-indigo-300',
    badge: 'bg-indigo-100/90 text-indigo-950 border-indigo-300',
    iconBg: 'from-indigo-500 to-violet-600',
  },
  {
    ribbon: 'from-amber-400 via-orange-500 to-rose-500',
    bg: 'from-amber-50/70 via-white to-orange-50/40',
    border: 'border-amber-200/80 hover:border-amber-300',
    badge: 'bg-amber-100/90 text-amber-950 border-amber-300',
    iconBg: 'from-amber-500 to-orange-600',
  },
  {
    ribbon: 'from-violet-500 via-fuchsia-500 to-indigo-500',
    bg: 'from-violet-50/70 via-white to-indigo-50/40',
    border: 'border-violet-200/80 hover:border-violet-300',
    badge: 'bg-violet-100/90 text-violet-950 border-violet-300',
    iconBg: 'from-violet-600 to-indigo-600',
  },
];

export const CountryFinancesAndTaxesTab: React.FC<CountryFinancesAndTaxesTabProps> = ({
  country,
  onNavigateTab,
}) => {
  const profile = getCountryFinanceAndTaxProfile(country);
  const [transferAmountUSD, setTransferAmountUSD] = useState<number>(
    Math.max(2500, Math.round(country.costOfLiving.monthlyBudgetCoupleUSD / 100) * 100)
  );
  const [selectedSection, setSelectedSection] = useState<
    'all' | 'banks' | 'remittance' | 'taxes' | 'tips'
  >('all');

  // Dynamic remittance fee calculation based on user slider
  const ratio = transferAmountUSD / 3000;
  const retailBankMonthlyCost = Math.round(profile.averageMonthlyFxCostOn3000USD * ratio);
  const fintechMonthlyCost = Math.round(profile.fintechCostOn3000USD * ratio);
  const annualFxSavings = Math.max(0, (retailBankMonthlyCost - fintechMonthlyCost) * 12);

  const getSeverityBadgeStyle = (severity: string) => {
    if (severity.includes('0% Tax')) {
      return 'bg-emerald-100/90 text-emerald-950 border-emerald-300';
    }
    if (severity.includes('Favorable')) {
      return 'bg-teal-100/90 text-teal-950 border-teal-300';
    }
    if (severity.includes('Moderate')) {
      return 'bg-amber-100/90 text-amber-950 border-amber-300';
    }
    return 'bg-indigo-100/90 text-indigo-950 border-indigo-300';
  };

  return (
    <div className="space-y-8">
      {/* 1. HERO EXECUTIVE BANNER — FINANCES, BANKING & EXPAT TAX INTELLIGENCE */}
      <div className="relative overflow-hidden bg-white rounded-3xl border border-indigo-100/90 p-6 sm:p-8 shadow-sm">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-400 via-indigo-500 to-amber-500" />
        <div
          className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-gradient-to-br from-teal-400/10 via-indigo-500/10 to-amber-400/10 blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-gradient-to-r from-teal-500/15 via-indigo-500/15 to-amber-500/15 text-indigo-950 border border-indigo-200/80">
                <Landmark className="w-3.5 h-3.5 text-teal-600" />
                Financial &amp; Fiscal Intelligence
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-900 border border-emerald-200">
                <Scale className="w-3.5 h-3.5 text-emerald-600" />
                {profile.taxRegimeClassification}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-teal-900 bg-clip-text text-transparent">
              {country.name} Banking, Remittances &amp; Expat Tax Guide
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed mt-2">
              {profile.headlineSummary}
            </p>
          </div>

          {/* Right Quick Verdict Card: Inbound Remittance Tax Status */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-50/95 via-indigo-50/70 to-amber-50/80 border border-teal-200/90 p-5 lg:w-96 shrink-0 shadow-xs">
            <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-b from-teal-400 via-indigo-500 to-amber-500" />
            <div className="pl-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-800 block">
                Inbound Bank Transfer Verdict
              </span>
              <div className="text-sm sm:text-base font-extrabold text-slate-900 mt-1 flex items-start gap-2">
                <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                <span>{profile.inboundRemittanceTaxedVerdict}</span>
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Currency: <strong className="text-slate-900">{country.currency}</strong> · Tax ID:{' '}
                <strong className="text-indigo-950">{profile.localTaxIdName.split('(')[0]}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* 4 Core Financial KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-7 pt-6 border-t border-indigo-100/80">
          <div className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-teal-50/80 via-white to-emerald-50/40 border border-teal-200/80 shadow-2xs">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 to-emerald-500" />
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-800 block">
              Required Local Fiscal ID
            </span>
            <div className="text-sm font-extrabold text-slate-900 mt-1 leading-snug">
              {profile.localTaxIdName}
            </div>
            <span className="text-[11px] text-teal-700 font-medium mt-1 block">
              Mandatory for local bank &amp; lease
            </span>
          </div>

          <div className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-indigo-50/80 via-white to-violet-50/40 border border-indigo-200/80 shadow-2xs">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-violet-500" />
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-800 block">
              Deposit Protection Scheme
            </span>
            <div className="text-sm font-extrabold text-slate-900 mt-1 leading-snug">
              {profile.depositInsuranceLimit}
            </div>
            <span className="text-[11px] text-indigo-700 font-medium mt-1 block">
              Statutory guarantee per bank
            </span>
          </div>

          <div className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-amber-50/80 via-white to-orange-50/40 border border-amber-200/80 shadow-2xs">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500" />
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-900 block">
              Central Bank AML Threshold
            </span>
            <div className="text-xs font-bold text-slate-900 mt-1 leading-snug">
              {profile.centralBankReportingThreshold}
            </div>
          </div>

          <div className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-violet-50/80 via-white to-indigo-50/40 border border-violet-200/80 shadow-2xs">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-indigo-600" />
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-violet-900 block">
              Fintech vs. Bank Wire Savings
            </span>
            <div className="font-mono tabular-nums text-xl font-extrabold text-emerald-700 mt-1">
              Save ~${(profile.averageMonthlyFxCostOn3000USD - profile.fintechCostOn3000USD) * 12}/yr
            </div>
            <span className="text-[11px] text-violet-700 font-medium mt-0.5 block">
              On $3,000/mo pension transfers
            </span>
          </div>
        </div>

        {/* Sub-Navigation Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-5 border-t border-indigo-100/70">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1">
            Focus Pillar:
          </span>
          {[
            { id: 'all', label: 'All 4 Pillars' },
            { id: 'banks', label: '1. National & Private Banks' },
            { id: 'remittance', label: '2. Remittances & FX Calculator' },
            { id: 'taxes', label: '3. Expat & Remittance Taxes' },
            { id: 'tips', label: '4. Fee & Tax Saving Tips' },
          ].map(pill => {
            const active = selectedSection === pill.id;
            return (
              <button
                key={pill.id}
                onClick={() => setSelectedSection(pill.id as typeof selectedSection)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  active
                    ? 'bg-gradient-to-r from-teal-600 via-indigo-600 to-violet-600 text-white shadow-2xs'
                    : 'bg-slate-100/90 hover:bg-indigo-50 text-slate-700 border border-slate-200/80'
                }`}
              >
                {pill.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. PILLAR 1: FAMOUS NATIONALIZED (STATE-BACKED) & TOP PRIVATE BANKS */}
      {(selectedSection === 'all' || selectedSection === 'banks') && (
        <div className="relative overflow-hidden bg-white rounded-3xl border border-indigo-100/90 p-6 sm:p-8 shadow-sm">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-400 via-emerald-500 to-indigo-500" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 block mb-0.5">
                Pillar 1 · Banking Infrastructure &amp; Account Opening
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-slate-900 via-indigo-950 to-teal-900 bg-clip-text text-transparent">
                Famous Nationalized &amp; Top Private Banks in {country.name}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Compare sovereign state-backed institutions, premier commercial banks with expat relationship desks, and multi-currency digital bridges.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-teal-50/90 border border-teal-200 text-teal-950 text-xs font-bold shrink-0">
              <Lock className="w-4 h-4 text-teal-600" />
              <span>Deposit Guarantee: {profile.depositInsuranceLimit.split('(')[0]}</span>
            </div>
          </div>

          {/* 4 Bank Institution Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {profile.banks.map((bank, idx) => {
              const theme = BANK_CARD_THEMES[idx % BANK_CARD_THEMES.length];
              return (
                <motion.div
                  key={bank.name}
                  whileHover={{ y: -3 }}
                  transition={{ type: 'spring', stiffness: 340, damping: 26 }}
                  className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${theme.bg} border ${theme.border} p-5 shadow-xs flex flex-col justify-between`}
                >
                  <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${theme.ribbon}`} />
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-extrabold border ${theme.badge}`}
                      >
                        <Building2 className="w-3.5 h-3.5" />
                        {bank.category}
                      </span>
                      <span className="text-[11px] font-bold text-slate-600 bg-white/90 px-2.5 py-1 rounded-lg border border-slate-200/80">
                        Onboarding: <strong className="text-slate-900">{bank.expatOnboardingEase}</strong>
                      </span>
                    </div>

                    <h4 className="text-lg font-extrabold text-slate-900">{bank.name}</h4>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mt-2">
                      {bank.atmAndWireHighlights}
                    </p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-200/70 space-y-2 text-xs">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-slate-500 shrink-0">English Support:</span>
                      <span className="font-bold text-slate-800 text-right">{bank.englishSupport}</span>
                    </div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-slate-500 shrink-0">Multi-Currency:</span>
                      <span className="text-slate-700 text-right">{bank.multiCurrencyAccounts}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/90 border border-slate-200/80 mt-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-800 block">
                        Best For Retirees &amp; Expats:
                      </span>
                      <span className="text-xs font-semibold text-slate-800">{bank.bestForRetirees}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Step-by-Step Expat Bank Account Opening Checklist */}
          <div className="mt-7 pt-6 border-t border-indigo-100/80">
            <h4 className="text-base font-extrabold text-slate-900 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>Mandatory Checklist to Open a Local Bank Account in {country.name}</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {profile.accountOpeningChecklist.map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200/80 text-xs text-slate-700"
                >
                  <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-teal-500 to-indigo-600 text-white font-mono text-xs font-extrabold flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. PILLAR 2: SENDING REMITTANCES, INTERACTIVE FX SIMULATOR & CHANNEL BENCHMARKS */}
      {(selectedSection === 'all' || selectedSection === 'remittance') && (
        <div className="relative overflow-hidden bg-white rounded-3xl border border-indigo-100/90 p-6 sm:p-8 shadow-sm">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-amber-500" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 block mb-0.5">
                Pillar 2 · Cross-Border Transfers, FX Spreads &amp; Compliance
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-slate-900 via-indigo-950 to-violet-900 bg-clip-text text-transparent">
                Sending Money to {country.name}: Remittance Channels &amp; Charges
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl">
                How to transfer monthly Social Security, pensions, 401(k)/IRA withdrawals, or property capital into{' '}
                <strong>{country.currency}</strong> without losing 3%–5% to hidden bank exchange rate markups.
              </p>
            </div>

            {/* Interactive Monthly Transfer Fee & FX Spread Simulator */}
            <div className="bg-gradient-to-r from-indigo-50/90 via-teal-50/60 to-amber-50/70 border border-indigo-200/80 rounded-2xl p-4 sm:p-5 lg:w-[420px] shrink-0 shadow-2xs">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-extrabold text-indigo-950 flex items-center gap-1.5">
                  <Calculator className="w-4 h-4 text-indigo-600" />
                  Monthly Remittance Simulator
                </span>
                <span className="font-mono tabular-nums text-base font-extrabold text-indigo-950 bg-white px-2.5 py-0.5 rounded-lg border border-indigo-200">
                  ${transferAmountUSD.toLocaleString()}/mo
                </span>
              </div>
              <input
                type="range"
                min={1000}
                max={10000}
                step={250}
                value={transferAmountUSD}
                onChange={e => setTransferAmountUSD(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
                aria-label="Simulated monthly transfer amount in USD"
              />
              <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-indigo-200/60 text-center">
                <div className="bg-white/90 rounded-xl p-2 border border-rose-200/80">
                  <span className="text-[10px] font-bold text-rose-800 block">Retail Bank SWIFT</span>
                  <span className="font-mono text-sm font-extrabold text-rose-950">
                    -${retailBankMonthlyCost}/mo
                  </span>
                </div>
                <div className="bg-white/90 rounded-xl p-2 border border-teal-200/80">
                  <span className="text-[10px] font-bold text-teal-800 block">Fintech (Wise/OFX)</span>
                  <span className="font-mono text-sm font-extrabold text-teal-950">
                    -${fintechMonthlyCost}/mo
                  </span>
                </div>
                <div className="bg-emerald-600 text-white rounded-xl p-2 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider block opacity-90">
                    Annual Saved
                  </span>
                  <span className="font-mono text-sm font-extrabold">
                    +${annualFxSavings.toLocaleString()}/yr
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 4-Channel Remittance Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.remittanceChannels.map((ch, idx) => {
              const isRecommended = idx < 2;
              return (
                <div
                  key={ch.channelName}
                  className={`relative overflow-hidden rounded-2xl p-5 border ${
                    isRecommended
                      ? 'bg-gradient-to-br from-teal-50/60 via-white to-indigo-50/40 border-teal-200/90'
                      : idx === 2
                      ? 'bg-gradient-to-br from-indigo-50/50 via-white to-amber-50/40 border-indigo-200/80'
                      : 'bg-gradient-to-br from-rose-50/50 via-white to-orange-50/40 border-rose-200/80'
                  } shadow-2xs`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span
                      className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                        isRecommended
                          ? 'bg-teal-100/90 text-teal-950 border-teal-300'
                          : idx === 2
                          ? 'bg-indigo-100/90 text-indigo-950 border-indigo-300'
                          : 'bg-rose-100/90 text-rose-950 border-rose-300'
                      }`}
                    >
                      {isRecommended ? 'Recommended Low-Fee Channel' : idx === 2 ? 'Large Capital / Property' : 'High-Cost Legacy Wire'}
                    </span>
                    <span className="font-mono text-xs font-extrabold text-slate-800 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200">
                      Cost on $3k: {ch.typicalCostOn3000USD}
                    </span>
                  </div>

                  <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <ArrowRightLeft className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>{ch.channelName}</span>
                  </h4>
                  <p className="text-xs font-bold text-indigo-900 mt-0.5">
                    Providers: {ch.providerExamples}
                  </p>

                  <div className="grid grid-cols-2 gap-2 my-3 p-2.5 rounded-xl bg-white/90 border border-slate-200/80 text-xs">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">
                        Transfer Fee
                      </span>
                      <span className="font-bold text-slate-800">{ch.transferFeeStructure}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">
                        FX Rate Spread
                      </span>
                      <span className="font-bold text-slate-800">{ch.fxSpreadPercent}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    <strong className="text-slate-900">Best For:</strong> {ch.idealUseCase} (Speed:{' '}
                    {ch.settlementSpeed})
                  </p>
                  <div className="mt-2.5 pt-2.5 border-t border-slate-200/70 text-xs text-teal-950 font-medium flex items-start gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Insider Tip:</strong> {ch.proTip}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. PILLAR 3: EXPAT & RETIREE TAXES ON INBOUND FUNDS & FOREIGN INCOME */}
      {(selectedSection === 'all' || selectedSection === 'taxes') && (
        <div className="relative overflow-hidden bg-white rounded-3xl border border-indigo-100/90 p-6 sm:p-8 shadow-sm">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-orange-500 to-indigo-600" />

          <div className="mb-6">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 block mb-0.5">
              Pillar 3 · Fiscal Residency, Inbound Transfers &amp; Foreign Pension Taxation
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-slate-900 via-indigo-950 to-amber-900 bg-clip-text text-transparent">
              Are Expats &amp; Retirees Taxed When Bringing Money Into {country.name}?
            </h3>
          </div>

          {/* Primary Callout Box Explaining Principal Savings vs Income */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-50/90 via-indigo-50/70 to-amber-50/80 border border-teal-200/90 p-5 mb-6">
            <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-b from-teal-400 via-indigo-500 to-amber-500" />
            <div className="pl-2">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="text-xs font-extrabold uppercase tracking-wider text-teal-900">
                  Core Fiscal Distinction: Capital Principal vs. New Income
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-white text-indigo-950 border border-indigo-200">
                  {profile.inboundRemittanceTaxedVerdict}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {profile.inboundRemittanceExplanation}
              </p>
              <p className="text-xs text-indigo-950 font-semibold mt-2">
                Country Statutory Summary: {country.visa.taxStatus}
              </p>
            </div>
          </div>

          {/* 6-Category Expat Tax Rules Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profile.taxRulesMatrix.map(rule => (
              <div
                key={rule.category}
                className="rounded-2xl bg-slate-50/90 hover:bg-white border border-slate-200/90 hover:border-indigo-200 p-4 transition-colors flex flex-col justify-between shadow-2xs"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${getSeverityBadgeStyle(
                        rule.severity
                      )}`}
                    >
                      {rule.severity}
                    </span>
                  </div>
                  <h4 className="text-sm font-extrabold text-slate-900">{rule.category}</h4>
                  <div className="text-xs font-extrabold text-indigo-900 mt-1 bg-indigo-50/80 border border-indigo-100 rounded-lg px-2.5 py-1.5">
                    {rule.applicableRateOrVerdict}
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mt-3 pt-2.5 border-t border-slate-200/70">
                  {rule.detailedExplanation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. PILLAR 4: ACTIONABLE TIPS TO SAVE ON TRANSACTION CHARGES & EXPAT TAXES */}
      {(selectedSection === 'all' || selectedSection === 'tips') && (
        <div className="relative overflow-hidden bg-white rounded-3xl border border-indigo-100/90 p-6 sm:p-8 shadow-sm">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-400 via-indigo-500 to-violet-600" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 block mb-0.5">
                Pillar 4 · Actionable Wealth Preservation Playbook
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-slate-900 via-indigo-950 to-teal-900 bg-clip-text text-transparent">
                6 Proven Strategies to Save on Remittance Fees &amp; Expat Taxes in {country.name}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Concrete banking, ATM, currency batching, and legal tax-timing habits used by seasoned expat retirees.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs font-extrabold shrink-0">
              <PiggyBank className="w-4 h-4 text-emerald-600" />
              <span>Combined Potential Savings: $1,800 – $5,500+/yr</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {profile.savingStrategies.map((tip, idx) => {
              const isFeeTip = tip.type === 'Remittance & FX Fee Saver';
              return (
                <motion.div
                  key={tip.title}
                  whileHover={{ y: -2 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 26 }}
                  className={`relative overflow-hidden rounded-2xl p-5 border shadow-2xs flex flex-col justify-between ${
                    isFeeTip
                      ? 'bg-gradient-to-br from-teal-50/70 via-white to-emerald-50/40 border-teal-200/80'
                      : 'bg-gradient-to-br from-indigo-50/70 via-white to-amber-50/40 border-indigo-200/80'
                  }`}
                >
                  <div
                    className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
                      isFeeTip
                        ? 'from-teal-400 via-emerald-500 to-cyan-500'
                        : 'from-indigo-500 via-violet-500 to-amber-500'
                    }`}
                  />
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                          isFeeTip
                            ? 'bg-teal-100/90 text-teal-950 border-teal-300'
                            : 'bg-indigo-100/90 text-indigo-950 border-indigo-300'
                        }`}
                      >
                        {isFeeTip ? (
                          <CreditCard className="w-3 h-3 text-teal-700" />
                        ) : (
                          <Receipt className="w-3 h-3 text-indigo-700" />
                        )}
                        {tip.type}
                      </span>
                      <span className="font-mono text-xs font-extrabold text-emerald-900 bg-emerald-100/90 border border-emerald-300 px-2.5 py-0.5 rounded-lg">
                        Save {tip.estimatedAnnualSavingsUSD}
                      </span>
                    </div>

                    <h4 className="text-base font-extrabold text-slate-900">
                      {idx + 1}. {tip.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-1.5">
                      {tip.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-start gap-2 text-xs text-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-indigo-950">Action Step:</strong> {tip.actionStep}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Bottom Cross-Navigation Bar */}
          {onNavigateTab && (
            <div className="mt-8 pt-6 border-t border-indigo-100/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-xs text-slate-600">
                <strong className="text-slate-900">Next Relocation Steps:</strong> Model your net post-tax monthly expenses in the Budget Calculator or verify visa bank deposit rules.
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => onNavigateTab('cost')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white text-xs font-bold shadow-2xs hover:opacity-95 transition-opacity cursor-pointer"
                >
                  <span>Open Annual Budget Calculator</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onNavigateTab('visa')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-bold shadow-2xs hover:opacity-95 transition-opacity cursor-pointer"
                >
                  <span>Visa Income &amp; Deposit Rules</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
