import React, { useState, useMemo } from 'react';
import { Country, FaqCategoryType, PreRetirementFaqItem } from '../types';
import { getFaqsForCountry } from '../data/countryFaqs';
import { useApp } from '../context/AppContext';
import {
  HelpCircle, ChevronDown, ChevronUp, Search, Landmark,
  Receipt, Languages, Stethoscope, Home, AlertTriangle,
  CheckCircle2, Clock, FileText, ArrowRight, Sparkles,
  ShieldAlert, BookOpen, Layers
} from 'lucide-react';

interface CountryFaqHurdlesProps {
  country: Country;
  onNavigateToHealthcare?: () => void;
}

export const CountryFaqHurdles: React.FC<CountryFaqHurdlesProps> = ({
  country,
  onNavigateToHealthcare,
}) => {
  const { setCurrentView } = useApp();
  const faqs = useMemo(() => getFaqsForCountry(country), [country]);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FaqCategoryType | 'all'>('all');
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>(() => {
    // Default open the first two items
    const initial: Record<string, boolean> = {};
    if (faqs[0]) initial[faqs[0].id] = true;
    if (faqs[1]) initial[faqs[1].id] = true;
    return initial;
  });

  const [showPreDepartureTimeline, setShowPreDepartureTimeline] = useState(false);

  // Toggle single FAQ
  const toggleFaq = (id: string) => {
    setExpandedIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Expand / Collapse All
  const expandAll = () => {
    const allExpanded: Record<string, boolean> = {};
    faqs.forEach(f => { allExpanded[f.id] = true; });
    setExpandedIds(allExpanded);
  };

  const collapseAll = () => {
    setExpandedIds({});
  };

  // Filtered FAQs
  const filteredFaqs = useMemo(() => {
    return faqs.filter(faq => {
      const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      if (!query) return matchesCategory;

      const matchesText =
        faq.question.toLowerCase().includes(query) ||
        faq.shortSummary.toLowerCase().includes(query) ||
        faq.detailedAnswer.toLowerCase().includes(query) ||
        faq.actionableChecklist.some(item => item.toLowerCase().includes(query)) ||
        faq.keyAgenciesOrForms.some(agency => agency.toLowerCase().includes(query));

      return matchesCategory && matchesText;
    });
  }, [faqs, selectedCategory, searchQuery]);

  // Category metadata with icons
  const categories: Array<{ id: FaqCategoryType | 'all'; label: string; icon: React.ReactNode; count: number }> = [
    {
      id: 'all',
      label: 'All Hurdles',
      icon: <Layers className="w-3.5 h-3.5" />,
      count: faqs.length
    },
    {
      id: 'banking',
      label: 'Banking & Money',
      icon: <Landmark className="w-3.5 h-3.5" />,
      count: faqs.filter(f => f.category === 'banking').length
    },
    {
      id: 'taxes',
      label: 'Taxes & Residency',
      icon: <Receipt className="w-3.5 h-3.5" />,
      count: faqs.filter(f => f.category === 'taxes').length
    },
    {
      id: 'language',
      label: 'Language & Bureaucracy',
      icon: <Languages className="w-3.5 h-3.5" />,
      count: faqs.filter(f => f.category === 'language').length
    },
    {
      id: 'healthcare',
      label: 'Healthcare & Prescriptions',
      icon: <Stethoscope className="w-3.5 h-3.5" />,
      count: faqs.filter(f => f.category === 'healthcare').length
    },
    {
      id: 'housing',
      label: 'Housing & Settling In',
      icon: <Home className="w-3.5 h-3.5" />,
      count: faqs.filter(f => f.category === 'housing').length
    }
  ];

  const getSeverityBadge = (severity: 'Low' | 'Moderate' | 'High') => {
    switch (severity) {
      case 'Low':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Low Hurdle
          </span>
        );
      case 'Moderate':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Moderate Hurdle
          </span>
        );
      case 'High':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            High Complexity
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Container */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-teal-800 text-xs font-bold uppercase tracking-wider mb-1">
              <HelpCircle className="w-4 h-4 text-teal-600" />
              <span>Pre-Retirement Due Diligence & Knowledge Base</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Common Relocation Hurdles & FAQs: {country.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              Factual, practical answers addressing banking regulations, cross-border tax residency, 
              local language realities, healthcare transitions, and rental lease protocols.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <button
              onClick={() => setShowPreDepartureTimeline(!showPreDepartureTimeline)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-colors ${
                showPreDepartureTimeline
                  ? 'bg-teal-50 border-teal-300 text-teal-800'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-teal-600" />
              <span>{showPreDepartureTimeline ? 'Hide Timeline' : 'Pre-Departure Timeline'}</span>
            </button>
            <button
              onClick={expandAll}
              className="px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              Expand All
            </button>
            <button
              onClick={collapseAll}
              className="px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* Optional Collapsible Pre-Departure Timeline Guide */}
        {showPreDepartureTimeline && (
          <div className="mt-6 p-5 rounded-xl bg-teal-50/70 border border-teal-200 transition-all">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-teal-700" />
              <h3 className="text-sm font-bold text-teal-950">
                12-Month Pre-Departure Readiness Checklist for {country.name}
              </h3>
            </div>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Before boarding your one-way flight, execute these steps systematically to prevent banking freeze-outs, 
              double taxation disputes, and visa processing rejections.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
              <div className="bg-white p-3.5 rounded-lg border border-teal-100 shadow-2xs">
                <div className="font-bold text-teal-900 mb-1 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-mono text-[10px]">1</span>
                  12–9 Mos Out
                </div>
                <ul className="text-slate-600 space-y-1 pl-1 list-disc list-inside">
                  <li>Consult cross-border CPA on tax residency & pensions</li>
                  <li>Order physical passport renewals (min 2 yrs validity)</li>
                  <li>Begin conversational language study ({country.language.split(' ')[0]})</li>
                </ul>
              </div>

              <div className="bg-white p-3.5 rounded-lg border border-teal-100 shadow-2xs">
                <div className="font-bold text-teal-900 mb-1 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-mono text-[10px]">2</span>
                  6 Mos Out
                </div>
                <ul className="text-slate-600 space-y-1 pl-1 list-disc list-inside">
                  <li>Obtain FBI or police background check with Apostille</li>
                  <li>Open Wise/Schwab multi-currency accounts for zero-fee wires</li>
                  <li>Schedule scouting trip to inspect top expat towns</li>
                </ul>
              </div>

              <div className="bg-white p-3.5 rounded-lg border border-teal-100 shadow-2xs">
                <div className="font-bold text-teal-900 mb-1 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-mono text-[10px]">3</span>
                  3 Mos Out
                </div>
                <ul className="text-slate-600 space-y-1 pl-1 list-disc list-inside">
                  <li>Submit {country.visa.retirementVisaName} consulate dossier</li>
                  <li>Purchase compliant expat health insurance policy</li>
                  <li>Secure physical US/home SIM or Google Voice for SMS 2FA</li>
                </ul>
              </div>

              <div className="bg-white p-3.5 rounded-lg border border-teal-100 shadow-2xs">
                <div className="font-bold text-teal-900 mb-1 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-mono text-[10px]">4</span>
                  1 Mo Out
                </div>
                <ul className="text-slate-600 space-y-1 pl-1 list-disc list-inside">
                  <li>Request 90-day supply of prescriptions with generic names</li>
                  <li>Notify banks of travel and set foreign card limits</li>
                  <li>Book initial 30-day furnished rental for arrival</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Search & Category Filter Toolbar */}
        <div className="mt-6 space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search hurdles in ${country.name} (e.g. banking, taxes, 183 days, Medicare, English, lease)...`}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-xs sm:text-sm bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 flex items-center gap-1.5 transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-teal-700 text-white font-bold shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  selectedCategory === cat.id ? 'bg-teal-800 text-teal-100' : 'bg-slate-200 text-slate-600'
                }`}>
                  {cat.count}
                </span>
              </button>
            ))}
          </div>

          {onNavigateToHealthcare && (
            <div className="p-3.5 rounded-xl bg-teal-50/70 border border-teal-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-teal-950">
                <Stethoscope className="w-4 h-4 text-teal-700 shrink-0" />
                <span>
                  <strong>Looking for routine doctor access, emergency numbers, & insurance cost tables?</strong> Visit the dedicated Healthcare & Insurance tab.
                </span>
              </div>
              <button
                onClick={onNavigateToHealthcare}
                className="px-3 py-1.5 rounded-lg bg-teal-800 hover:bg-teal-900 text-white font-semibold text-xs whitespace-nowrap shrink-0 flex items-center gap-1 cursor-pointer self-start sm:self-auto"
              >
                <span>Open Healthcare & Insurance Tab</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Accordion List */}
      {filteredFaqs.length > 0 ? (
        <div className="space-y-3">
          {filteredFaqs.map((faq, index) => {
            const isExpanded = !!expandedIds[faq.id];

            return (
              <div
                key={faq.id}
                className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                  isExpanded
                    ? 'bg-white border-teal-300 shadow-xs ring-1 ring-teal-500/10'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-2xs'
                }`}
              >
                {/* Accordion Question Header */}
                <button
                  onClick={() => toggleFaq(faq.id)}
                  aria-expanded={isExpanded}
                  className="w-full text-left p-5 sm:p-6 flex items-start justify-between gap-4 select-none focus:outline-hidden"
                >
                  <div className="flex items-start gap-3.5">
                    <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="text-[11px] font-semibold tracking-wider uppercase text-teal-800">
                          {faq.categoryLabel}
                        </span>
                        <span aria-hidden="true" className="text-slate-300">·</span>
                        {getSeverityBadge(faq.hurdleSeverity)}
                        <span aria-hidden="true" className="text-slate-300">·</span>
                        <span className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {faq.estimatedResolutionTime}
                        </span>
                      </div>

                      <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                        {faq.question}
                      </h3>

                      {!isExpanded && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                          {faq.shortSummary}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className={`p-1.5 rounded-lg transition-transform duration-200 shrink-0 ${
                    isExpanded ? 'bg-teal-50 text-teal-700 rotate-180' : 'bg-slate-100 text-slate-500'
                  }`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {/* Expanded Content Area */}
                {isExpanded && (
                  <div className="px-5 sm:px-6 pb-6 pt-1 border-t border-slate-100 space-y-4">
                    {/* Key Takeaway Summary Box */}
                    <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                      <strong className="text-slate-900 block mb-0.5">Quick Summary Takeaway:</strong>
                      {faq.shortSummary}
                    </div>

                    {/* Detailed Legal / Factual Analysis */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                        Detailed Guidance & Context
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                        {faq.detailedAnswer}
                      </p>
                    </div>

                    {/* Actionable Retiree Checklist */}
                    {faq.actionableChecklist.length > 0 && (
                      <div className="p-4 rounded-lg bg-teal-50/50 border border-teal-100">
                        <h4 className="text-xs font-bold text-teal-950 flex items-center gap-1.5 mb-2.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                          <span>Actionable Checklist & Recommendations</span>
                        </h4>
                        <ul className="space-y-1.5 text-xs text-slate-700">
                          {faq.actionableChecklist.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-teal-700 font-bold text-xs mt-0.5">✓</span>
                              <span className="leading-snug">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Relevant Agencies, Portals & Forms */}
                    {faq.keyAgenciesOrForms.length > 0 && (
                      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                          <FileText className="w-3 h-3 text-slate-400" />
                          <span>Key Portals & Forms:</span>
                        </span>
                        {faq.keyAgenciesOrForms.map((agency, aIdx) => (
                          <span
                            key={aIdx}
                            className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[11px] border border-slate-200"
                          >
                            {agency}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
          <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-900 mb-1">No matching FAQ questions found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
            No questions matched your search query "{searchQuery}". Try searching for terms like "bank", "tax", "pension", "Medicare", or select "All Hurdles".
          </p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
            className="px-3 py-1.5 rounded-lg bg-teal-800 text-white font-semibold text-xs hover:bg-teal-900 transition-colors"
          >
            Reset Search Filters
          </button>
        </div>
      )}

      {/* Community Callout & Next Steps Footer Banner */}
      <div className="bg-linear-to-r from-slate-900 to-teal-950 rounded-xl p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs text-teal-400 font-bold uppercase tracking-wider block mb-1">
            Still Have Questions About {country.name}?
          </span>
          <h3 className="text-base sm:text-lg font-bold text-white">
            Connect Directly with Expat Peers Living in {country.name}
          </h3>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Ask real questions about banking, neighborhood safety, or language tutors to retirees who have already made the move.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setCurrentView('community')}
            className="px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <span>Ask in Community Hub</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
