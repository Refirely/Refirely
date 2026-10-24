import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Country, ShortTermVisaOption } from '../types';
import { SHORT_TERM_VISA_DATABASE } from '../data/shortTermVisas';
import {
  Compass,
  Clock,
  Briefcase,
  CheckCircle2,
  Sparkles,
  Info,
  HelpCircle,
} from 'lucide-react';

interface ShortTermVisaOptionsProps {
  country: Country;
}

const VISA_CARD_ACCENTS = [
  {
    ribbon: 'from-teal-400 via-emerald-500 to-cyan-500',
    badge: 'bg-teal-50 text-teal-900 border-teal-200',
    border: 'border-teal-200/80 hover:border-teal-300',
  },
  {
    ribbon: 'from-indigo-500 via-violet-500 to-purple-500',
    badge: 'bg-indigo-50 text-indigo-900 border-indigo-200',
    border: 'border-indigo-200/80 hover:border-indigo-300',
  },
  {
    ribbon: 'from-amber-400 via-orange-500 to-rose-500',
    badge: 'bg-amber-50 text-amber-900 border-amber-200',
    border: 'border-amber-200/80 hover:border-amber-300',
  },
];

export const ShortTermVisaOptions: React.FC<ShortTermVisaOptionsProps> = ({ country }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedUseCase, setSelectedUseCase] = useState<string>('all');

  // Retrieve country short visas or fallback
  const shortVisas: ShortTermVisaOption[] = SHORT_TERM_VISA_DATABASE[country.id] || [
    {
      id: `${country.id}-tourist`,
      name: `${country.name} Tourist & Scouting Entry Waiver`,
      category: 'Tourist & Scouting Stay',
      duration: '90 to 180 Days',
      financialRequirement: 'Proof of onward travel and economic solvency (~$50/day)',
      incomeThresholdUSD: 0,
      allowedActivities: `Tourism, winter snowbirding, scouting ${country.topCities[0]?.name || country.capital} neighborhoods, and viewing property rentals.`,
      processingMethod: 'Visa waiver stamp on arrival or e-Visa portal for Western passport holders.',
      processingTime: 'Instant on entry',
      estimatedCost: 'Free to $35 USD',
      idealFor: `Retirees exploring ${country.name}’s climate, hospitals, and top hubs (${country.topCities.map(c => c.name.split(' ')[0]).join(', ')}) before submitting formal residency.`,
      keyConditions: ['Return or onward plane ticket required.', 'Valid passport with 6+ months validity.'],
    },
    {
      id: `${country.id}-nomad`,
      name: `${country.name} Remote Work & Extended Stay Permit`,
      category: 'Digital Nomad & Remote Work',
      duration: '1 Year (Renewable)',
      financialRequirement: `Proof of $${Math.round(country.visa.minimumIncomeUSD * 1.15).toLocaleString()} USD/mo foreign remote or passive income`,
      incomeThresholdUSD: Math.round(country.visa.minimumIncomeUSD * 1.15),
      allowedActivities: 'Remote consulting, managing overseas investments, or part-time international work while living locally.',
      processingMethod: 'Online immigration portal or consular application.',
      processingTime: '15 to 30 business days',
      estimatedCost: '~$120–$250 USD',
      idealFor: `Semi-retired professionals or early FIRE movers testing a full 4-season year in ${country.name}.`,
      keyConditions: ['All income must originate from outside the host country.', 'Clean police certificate and health coverage required.'],
    },
    {
      id: `${country.id}-visitor`,
      name: `${country.name} Temporary Independent Visitor Permit`,
      category: 'Temporary Visitor (VLS)',
      duration: '1 Year Renewable Trial Stay',
      financialRequirement: `Proof of $${country.visa.minimumIncomeUSD.toLocaleString()} USD/mo passive pension or savings`,
      incomeThresholdUSD: country.visa.minimumIncomeUSD,
      allowedActivities: `Extended independent living under ${country.visa.retirementVisaName} rules, local banking, and leasing a home.`,
      processingMethod: 'Consular submission or in-country immigration bureau.',
      processingTime: `${Math.max(1, Math.round(country.visa.processingMonths * 4))} to ${Math.max(2, Math.round(country.visa.processingMonths * 6))} weeks`,
      estimatedCost: '~$150–$300 USD',
      idealFor: 'Retirees seeking a 12-month trial stay with full resident privileges before committing to permanent relocation.',
      keyConditions: ['Comprehensive private health insurance required.', 'Signed local residential lease agreement.'],
    },
  ];

  const categories = [
    'All',
    'Tourist & Scouting Stay',
    'Digital Nomad & Remote Work',
    'Temporary Visitor (VLS)',
  ];

  const filteredVisas = shortVisas.filter(visa => {
    if (selectedCategory !== 'All' && visa.category !== selectedCategory) {
      return false;
    }
    if (
      selectedUseCase === 'snowbird' &&
      !visa.duration.toLowerCase().includes('day') &&
      !visa.idealFor.toLowerCase().includes('winter') &&
      !visa.idealFor.toLowerCase().includes('scout')
    ) {
      return false;
    }
    if (selectedUseCase === 'remote' && visa.category !== 'Digital Nomad & Remote Work') {
      return false;
    }
    if (
      selectedUseCase === 'trial-year' &&
      !visa.duration.toLowerCase().includes('year') &&
      !visa.duration.toLowerCase().includes('month')
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="relative overflow-hidden bg-white rounded-3xl border border-indigo-100/90 shadow-sm mt-6 space-y-6 p-6 sm:p-8">
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-teal-400 to-amber-500" />

      {/* Header & Strategic Context */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-indigo-100/80">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-teal-500 to-amber-500 text-white flex items-center justify-center shadow-2xs shrink-0">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold bg-gradient-to-r from-slate-900 via-indigo-950 to-teal-900 bg-clip-text text-transparent">
                Short-Stay, Trial &amp; Alternative Visa Pathways for {country.name}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 max-w-3xl leading-relaxed">
                Not ready to commit to the formal <strong>{country.visa.retirementVisaName}</strong>? Explore flexible 60–180 day tourist entries, digital nomad remote permits, and 1-year visitor visas to "test drive" living in {country.name} first.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Comparison Tag */}
        <div className="bg-gradient-to-br from-indigo-50/80 via-white to-teal-50/60 border border-indigo-200/80 rounded-2xl p-3.5 shrink-0 text-xs shadow-2xs">
          <span className="text-[10px] text-indigo-700 uppercase tracking-wider block font-bold">
            Primary Retirement Visa:
          </span>
          <span className="font-extrabold text-slate-900 block mt-0.5">
            {country.visa.retirementVisaName}
          </span>
          <span className="text-[11px] text-teal-800 font-mono font-bold mt-0.5 block">
            Min. ${country.visa.minimumIncomeUSD.toLocaleString()}/mo · Tier{' '}
            {country.visa.difficultyRating}/5
          </span>
        </div>
      </div>

      {/* Decision-Aid Banner: Short Visa vs. Full Retirement Visa */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-teal-50/80 via-indigo-50/50 to-amber-50/70 border border-teal-200/80 text-xs text-slate-700 space-y-3">
        <div className="flex items-center gap-2 font-extrabold text-indigo-950">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>When to choose a Short-Stay / Trial Visa vs. Permanent Retirement Visa:</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-slate-600">
          <div className="relative overflow-hidden p-3 bg-white rounded-xl border border-teal-200/80 shadow-2xs">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 to-emerald-500" />
            <strong className="text-teal-950 block mb-0.5">Winter Snowbirding (2–6 Mos):</strong>
            <span>
              Use Tourist Waivers or e-Visas. Avoids local tax residency and requires zero Apostille police certificates.
            </span>
          </div>
          <div className="relative overflow-hidden p-3 bg-white rounded-xl border border-indigo-200/80 shadow-2xs">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-violet-500" />
            <strong className="text-indigo-950 block mb-0.5">Pre-Retirement Remote Work:</strong>
            <span>
              Use Digital Nomad Visas (DTV, D8, Estancia). Lets you earn consulting income legally while testing the country.
            </span>
          </div>
          <div className="relative overflow-hidden p-3 bg-white rounded-xl border border-amber-200/80 shadow-2xs">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500" />
            <strong className="text-amber-950 block mb-0.5">Scouting &amp; Bank Accounts:</strong>
            <span>
              Enter on short stay to lease an apartment, register a local tax number (NIF/NIE), and complete paperwork.
            </span>
          </div>
        </div>
      </div>

      {/* Category Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-xs font-bold text-slate-500 mr-1.5 shrink-0">Category:</span>
          {categories.map(cat => (
            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.96 }}
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-indigo-600 via-violet-600 to-teal-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-indigo-950 hover:bg-indigo-50/70'
              }`}
            >
              {cat}
            </motion.button>
          ))}
        </div>

        {/* Quick Goal Preset */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-semibold shrink-0">Retiree Goal:</span>
          <select
            value={selectedUseCase}
            onChange={e => setSelectedUseCase(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold border border-indigo-200 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Intentions</option>
            <option value="snowbird">Winter Snowbirding / Scouting</option>
            <option value="remote">Part-Time Remote Consulting</option>
            <option value="trial-year">1-Year Full Trial Year</option>
          </select>
        </div>
      </div>

      {/* Short Visas Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
        {filteredVisas.map((visa, idx) => {
          const theme = VISA_CARD_ACCENTS[idx % VISA_CARD_ACCENTS.length];
          return (
            <motion.div
              key={visa.id}
              whileHover={{ y: -4 }}
              transition={{ type: 'spring', stiffness: 340, damping: 24 }}
              className={`relative overflow-hidden bg-white rounded-2xl border ${theme.border} p-5 flex flex-col justify-between transition-all shadow-xs`}
            >
              <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${theme.ribbon}`} />

              {/* Header / Category */}
              <div className="pt-1">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${theme.badge}`}
                  >
                    {visa.category}
                  </span>
                  <span className="text-xs font-mono tabular-nums text-slate-600 font-bold">
                    {visa.estimatedCost}
                  </span>
                </div>

                <h4 className="text-base font-extrabold text-slate-900 leading-snug">
                  {visa.name}
                </h4>

                {/* Key Duration Strip */}
                <div className="flex items-center gap-1.5 text-xs text-indigo-950 bg-indigo-50/60 p-2.5 rounded-xl border border-indigo-100 my-3 font-bold">
                  <Clock className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>{visa.duration}</span>
                </div>

                {/* Financial Requirement */}
                <div className="space-y-1 text-xs mb-3">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Financial Requirement:
                  </span>
                  <div className="font-mono tabular-nums text-amber-950 font-bold bg-gradient-to-r from-amber-50/90 to-orange-50/70 border border-amber-200/80 p-2.5 rounded-xl leading-relaxed">
                    {visa.financialRequirement}
                  </div>
                </div>

                {/* Allowed Activities */}
                <div className="space-y-1 text-xs mb-3">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Briefcase className="w-3 h-3 text-indigo-500" />
                    <span>Permitted Activities &amp; Work Rights:</span>
                  </span>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    {visa.allowedActivities}
                  </p>
                </div>

                {/* Processing Method & Speed */}
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 py-2.5 border-y border-slate-100 my-3">
                  <div>
                    <span className="block text-slate-400 font-medium">How to Apply:</span>
                    <span className="text-slate-800 font-bold">
                      {visa.processingMethod.split(' ')[0]}{' '}
                      {visa.processingMethod.split(' ')[1] || 'Direct'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-slate-400 font-medium">Processing Time:</span>
                    <span className="text-slate-800 font-bold">{visa.processingTime}</span>
                  </div>
                </div>

                {/* Ideal Retiree Profile */}
                <div className="p-2.5 bg-teal-50/50 rounded-xl border border-teal-100 text-[11px] text-slate-700 mb-3">
                  <strong className="text-teal-950 block mb-0.5">Best Suited For:</strong>
                  <p className="leading-relaxed">{visa.idealFor}</p>
                </div>

                {/* Key Conditions */}
                <div className="space-y-1 text-[11px] text-slate-500">
                  <span className="font-bold text-slate-400 uppercase tracking-wider block">
                    Important Rules:
                  </span>
                  <ul className="space-y-1 text-slate-600">
                    {visa.keyConditions.map((cond, cIdx) => (
                      <li key={cIdx} className="flex items-start gap-1.5 leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                        <span>{cond}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Bottom Status Footnote */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1 font-semibold text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Verified Legal Route</span>
                </span>
                <span className="text-indigo-900 font-mono font-bold">
                  {visa.incomeThresholdUSD > 0
                    ? `Min $${visa.incomeThresholdUSD.toLocaleString()}/mo`
                    : 'No min. income'}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredVisas.length === 0 && (
        <div className="text-center py-8 bg-slate-50 rounded-2xl border border-slate-200">
          <HelpCircle className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-slate-900">
            No short visa options match this filter
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            Select "All" categories or reset your intention filter.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSelectedUseCase('all');
            }}
            className="mt-3 px-4 py-1.5 bg-gradient-to-r from-indigo-600 to-teal-600 text-white rounded-xl text-xs font-bold cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Advisory Note */}
      <div className="p-4 bg-gradient-to-r from-slate-50 via-indigo-50/30 to-amber-50/40 border border-indigo-100 rounded-2xl flex items-start gap-2.5 text-xs text-slate-600">
        <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-slate-900">Tax Residency Caution:</strong> In most jurisdictions (including Portugal, Spain, Greece, Italy, and Colombia), residing more than <strong>183 days</strong> in a calendar or 12-month period establishes domestic fiscal tax residency, subjecting your worldwide pension and investment income to local tax brackets. For snowbirds wishing to remain non-resident for tax purposes, keep cumulative stays below 183 days or consult an international expat CPA.
        </p>
      </div>
    </div>
  );
};

