import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { CountryCard } from './CountryCard';
import { WorldHavenMap } from './WorldHavenMap';
import {
  Search, SlidersHorizontal, Compass, RotateCcw,
  Sun, Shield, DollarSign, Scale, ArrowRight, Map, X,
  Sparkles, Globe2, HeartHandshake
} from 'lucide-react';

export const DirectoryExplorer: React.FC = () => {
  const {
    filteredCountries,
    countries,
    searchQuery,
    setSearchQuery,
    selectedRegion,
    setSelectedRegion,
    budgetMax,
    setBudgetMax,
    selectedClimate,
    setSelectedClimate,
    visaDifficultyMax,
    setVisaDifficultyMax,
    visaIncomeMax,
    setVisaIncomeMax,
    sortBy,
    setSortBy,
    resetFilters,
    discreetLifestyleEnabled,
    setDiscreetLifestyleEnabled,
    comparedCountryIds,
    setCurrentView,
  } = useApp();

  const [showMap, setShowMap] = useState(false);

  const regions = [
    'All',
    'Europe',
    'Americas',
    'North & Central America',
    'South America',
    'Southeast Asia',
    'Asia & Middle East',
    'Africa',
    'Oceania',
  ];

  const climates = ['All', 'Mediterranean', 'Tropical', 'Subtropical', 'Temperate', 'Highlands / Mild'];

  const quickSearchKeywords = [
    { label: 'Portugal', color: 'bg-teal-50 text-teal-900 border-teal-200/90 hover:bg-teal-100/80', activeColor: 'bg-teal-600 text-white border-teal-600' },
    { label: 'Mediterranean', color: 'bg-amber-50 text-amber-900 border-amber-200/90 hover:bg-amber-100/80', activeColor: 'bg-amber-600 text-white border-amber-600' },
    { label: 'Tropical', color: 'bg-emerald-50 text-emerald-900 border-emerald-200/90 hover:bg-emerald-100/80', activeColor: 'bg-emerald-600 text-white border-emerald-600' },
    { label: 'Pensionado', color: 'bg-sky-50 text-sky-900 border-sky-200/90 hover:bg-sky-100/80', activeColor: 'bg-sky-600 text-white border-sky-600' },
    { label: 'D7 Passive Income', color: 'bg-indigo-50 text-indigo-900 border-indigo-200/90 hover:bg-indigo-100/80', activeColor: 'bg-indigo-600 text-white border-indigo-600' },
    { label: '0% tax', color: 'bg-rose-50 text-rose-900 border-rose-200/90 hover:bg-rose-100/80', activeColor: 'bg-rose-600 text-white border-rose-600' },
    { label: 'Permanent Residency', color: 'bg-violet-50 text-violet-900 border-violet-200/90 hover:bg-violet-100/80', activeColor: 'bg-violet-600 text-white border-violet-600' },
  ];

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedRegion !== 'All' ||
    budgetMax < 3500 ||
    selectedClimate !== 'All' ||
    visaDifficultyMax < 5 ||
    visaIncomeMax < 3500;

  return (
    <div className="space-y-10 pb-20">
      
      {/* Unified Factual Global Relocation Intelligence & Multi-Color Filter Console */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-50/75 via-indigo-50/45 to-amber-50/65 pt-8 pb-12 border-b border-slate-200/80">
        {/* Animated Ambient Multi-Colored Glow Orbs */}
        <motion.div
          animate={{ x: [0, 25, 0], y: [0, -15, 0], scale: [1, 1.06, 1] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-24 -left-24 w-96 h-96 bg-teal-300/20 rounded-full blur-3xl pointer-events-none"
        />
        <motion.div
          animate={{ x: [0, -20, 0], y: [0, 20, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-12 right-0 w-96 h-96 bg-indigo-300/20 rounded-full blur-3xl pointer-events-none"
        />
        <motion.div
          animate={{ x: [0, 15, 0], y: [0, 12, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-24 left-1/3 w-96 h-96 bg-amber-300/20 rounded-full blur-3xl pointer-events-none"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
          
          {/* Unified Header Row */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="flex flex-col lg:flex-row lg:items-end justify-between gap-6"
          >
            <div className="space-y-2.5 max-w-3xl">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-teal-800">
                <Compass className="w-4 h-4 text-teal-600 animate-spin" style={{ animationDuration: '18s' }} />
                <span>Factual Global Relocation Intelligence</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
                Choose the Right Country to Retire with{' '}
                <span className="bg-gradient-to-r from-teal-600 via-indigo-600 to-amber-600 bg-clip-text text-transparent">
                  Confidence
                </span>
                .
              </h1>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Search, filter, and compare visa pathways, real couple budgets, climate zones, healthcare standards, and community life across {countries.length} verified havens in one unified console.
              </p>
            </div>

            {/* Multi-Colored Live Intelligence Highlights */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3 shrink-0">
              <motion.div
                whileHover={{ y: -2 }}
                className="px-3.5 py-2.5 rounded-2xl bg-white/90 backdrop-blur-md border border-teal-200/80 shadow-xs"
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 block">
                  Global Index
                </span>
                <span className="font-mono text-lg sm:text-xl font-extrabold text-slate-900 tabular-nums">
                  {countries.length}
                </span>
                <span className="text-[11px] text-slate-500 block">Verified Havens</span>
              </motion.div>

              <motion.div
                whileHover={{ y: -2 }}
                className="px-3.5 py-2.5 rounded-2xl bg-white/90 backdrop-blur-md border border-indigo-200/80 shadow-xs"
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 block">
                  Deep Metrics
                </span>
                <span className="font-mono text-lg sm:text-xl font-extrabold text-slate-900 tabular-nums">
                  30+
                </span>
                <span className="text-[11px] text-slate-500 block">Empirical Factors</span>
              </motion.div>

              <motion.div
                whileHover={{ y: -2 }}
                className="px-3.5 py-2.5 rounded-2xl bg-white/90 backdrop-blur-md border border-amber-200/80 shadow-xs"
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">
                  Live Matches
                </span>
                <motion.span
                  key={filteredCountries.length}
                  initial={{ scale: 0.85, opacity: 0.5 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="font-mono text-lg sm:text-xl font-extrabold text-amber-600 tabular-nums block"
                >
                  {filteredCountries.length}
                </motion.span>
                <span className="text-[11px] text-slate-500 block">Ready to Explore</span>
              </motion.div>
            </div>
          </motion.div>

          {/* Unified Interactive Search & Multi-Color Filter Console */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease: 'easeOut' }}
            className="relative overflow-hidden bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-900/5 p-5 sm:p-7 space-y-6"
          >
            {/* Top Multi-Colored Gradient Accent Ribbon */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-teal-500 via-indigo-500 to-amber-500" />
            
            {/* Zone 1: Single Unified Search Bar + Action Buttons + Popular Multi-Color Chips */}
            <div className="space-y-3">
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
                {/* Single Unified Search Box */}
                <div className="relative flex-1 group">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-indigo-600 text-white flex items-center justify-center absolute left-2.5 top-1/2 -translate-y-1/2 shadow-xs pointer-events-none">
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    aria-label="Search destinations by country name, climate type, or visa keyword"
                    placeholder="Search by country, capital, climate (Mediterranean, Tropical), or visa keyword (D7, Pensionado, 0% tax)..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-24 py-3.5 bg-slate-50/90 hover:bg-white focus:bg-white text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm font-medium rounded-2xl border border-slate-200/90 focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-2xs"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="p-1 rounded-lg bg-slate-200/70 hover:bg-slate-300 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                        title="Clear search query"
                        aria-label="Clear search"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono text-[11px] font-bold">
                      {filteredCountries.length}/{countries.length}
                    </span>
                  </div>
                </div>

                {/* Right Action Bar: Compare & Interactive Spatial Atlas Toggle */}
                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  {comparedCountryIds.length >= 2 && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setCurrentView('compare')}
                      className="px-4 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-xs sm:text-sm hover:from-amber-600 hover:to-orange-700 transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                    >
                      <Scale className="w-4 h-4" />
                      <span>Compare ({comparedCountryIds.length})</span>
                    </motion.button>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowMap(!showMap)}
                    className={`px-4 py-3 text-xs sm:text-sm font-bold rounded-2xl border transition-all flex items-center gap-2 shadow-2xs cursor-pointer ${
                      showMap
                        ? 'bg-gradient-to-r from-teal-600 via-indigo-600 to-violet-600 text-white border-transparent shadow-sm'
                        : 'bg-gradient-to-r from-teal-50/90 via-indigo-50/70 to-amber-50/90 text-slate-800 border-teal-200/90 hover:border-indigo-300'
                    }`}
                  >
                    <Map className={`w-4 h-4 ${showMap ? 'text-white' : 'text-teal-600'}`} />
                    <span>{showMap ? 'Hide Spatial Atlas' : 'Interactive World Atlas'}</span>
                  </motion.button>
                </div>
              </div>

              {/* Popular Multi-Color Quick Filter Keywords */}
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Quick Tags:</span>
                </span>
                {quickSearchKeywords.map(kw => {
                  const isActive = searchQuery.toLowerCase() === kw.label.toLowerCase();
                  return (
                    <motion.button
                      key={kw.label}
                      whileHover={{ y: -1.5 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => setSearchQuery(isActive ? '' : kw.label)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap shrink-0 border cursor-pointer ${
                        isActive ? `${kw.activeColor} shadow-xs` : kw.color
                      }`}
                    >
                      {kw.label}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Hairline Divider */}
            <div className="border-t border-slate-200/80" />

            {/* Zone 2: Region & Continent Selector + Sort By & Reset Controls (Stacked cleanly to prevent overlap) */}
            <div className="space-y-3.5">
              {/* Row A: Full-Width Region & Continent Selector Pills */}
              <div className="flex flex-wrap items-center gap-2 bg-slate-50/80 border border-slate-200/80 rounded-2xl p-2.5 sm:px-3.5 sm:py-2.5">
                <span className="text-xs font-bold text-slate-600 mr-1 shrink-0 flex items-center gap-1.5 px-1">
                  <Globe2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Region:</span>
                </span>
                <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
                  {regions.map(r => {
                    const isSelected = selectedRegion === r;
                    return (
                      <motion.button
                        key={r}
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setSelectedRegion(r)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                          isSelected
                            ? 'bg-gradient-to-r from-teal-600 via-indigo-600 to-violet-600 text-white shadow-xs'
                            : 'bg-white text-slate-600 border border-slate-200/80 hover:text-slate-900 hover:border-indigo-300 hover:bg-indigo-50/40'
                        }`}
                      >
                        {r}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Row B: Sort By & Reset Controls Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-0.5">
                <div className="text-xs font-medium text-slate-500 flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-r from-teal-500 to-indigo-500" />
                  <span>
                    Showing <strong className="font-bold text-slate-800">{filteredCountries.length}</strong> of{' '}
                    <strong className="font-bold text-slate-800">{countries.length}</strong> destinations
                    {selectedRegion !== 'All' && (
                      <>
                        {' '}in <strong className="font-bold text-indigo-700">{selectedRegion}</strong>
                      </>
                    )}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 sm:justify-end shrink-0">
                  <div className="flex items-center gap-2 bg-gradient-to-r from-indigo-50/90 via-violet-50/70 to-sky-50/90 border border-indigo-200/80 px-3 py-1.5 rounded-xl shadow-2xs max-w-full">
                    <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5 shrink-0">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Sort By:</span>
                    </span>
                    <select
                      value={sortBy}
                      onChange={e => setSortBy(e.target.value as any)}
                      className="px-2.5 py-1 text-xs font-bold text-slate-900 border border-indigo-200/90 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white hover:border-indigo-300 transition-colors cursor-pointer shadow-2xs min-w-0 max-w-[220px] sm:max-w-none truncate"
                    >
                      <option value="recommended">Curated Haven Match</option>
                      <option value="alpha-asc">Alphabetical (A – Z)</option>
                      <option value="alpha-desc">Alphabetical (Z – A)</option>
                      <option value="budget-asc">Lowest Cost of Living</option>
                      <option value="healthcare-desc">Highest Healthcare Index</option>
                      <option value="travel-leisure-desc">Top Travel &amp; Leisure (Mobility &amp; Activities)</option>
                      <option value="sunny-desc">Most Sunny Days</option>
                      <option value="safety-desc">Highest Safety Score</option>
                      <option value="visa-difficulty-asc">Easiest Visa Process (Tier 1-2)</option>
                      <option value="visa-income-asc">Lowest Visa Income Requirement</option>
                      <option value="female-ratio-desc">Highest Female-to-Male Ratio</option>
                      <option value="dating-nightlife-desc">Best Dating &amp; Nightlife</option>
                    </select>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={resetFilters}
                    className="group px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200/90 hover:border-rose-600 flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer shrink-0"
                    title="Reset all filters to default"
                  >
                    <RotateCcw className="w-3.5 h-3.5 group-hover:-rotate-90 transition-transform duration-300" />
                    <span>Reset</span>
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Zone 3: 4 Multi-Colored Granular Filter Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Card 1: Max Monthly Budget (Emerald / Teal Theme) */}
              <motion.div
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
                className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/75 via-teal-50/50 to-white border border-emerald-200/80 shadow-2xs flex flex-col justify-between gap-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                    <span className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-700 flex items-center justify-center">
                      <DollarSign className="w-3.5 h-3.5" />
                    </span>
                    <span>Couple Budget</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-white border border-emerald-200/90 font-mono tabular-nums text-[11px] font-extrabold text-emerald-800 shadow-2xs">
                    {budgetMax >= 3500 ? 'Any ($3.5k+)' : `≤ $${budgetMax.toLocaleString()}/mo`}
                  </span>
                </div>
                <input
                  type="range"
                  min={1000}
                  max={3500}
                  step={50}
                  value={budgetMax}
                  onChange={e => setBudgetMax(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-emerald-800/70 font-mono font-semibold">
                  <span>$1,000</span>
                  <span>$2,250</span>
                  <span>$3,500+</span>
                </div>
              </motion.div>

              {/* Card 2: Climate Preference (Amber / Warm Gold Theme) */}
              <motion.div
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
                className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/80 via-orange-50/45 to-white border border-amber-200/80 shadow-2xs flex flex-col justify-between gap-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <label htmlFor="explore-climate-select" className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                    <span className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-700 flex items-center justify-center">
                      <Sun className="w-3.5 h-3.5" />
                    </span>
                    <span>Climate Zone</span>
                  </label>
                  <span className="px-2 py-0.5 rounded-md bg-white border border-amber-200/90 text-[10px] font-bold text-amber-800">
                    {selectedClimate === 'All' ? 'All Zones' : selectedClimate}
                  </span>
                </div>
                <select
                  id="explore-climate-select"
                  value={selectedClimate}
                  onChange={e => setSelectedClimate(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold text-slate-900 border border-amber-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white hover:border-amber-300 transition-colors cursor-pointer shadow-2xs"
                >
                  {climates.map(c => (
                    <option key={c} value={c}>
                      {c === 'All' ? 'Any Climate Category' : c}
                    </option>
                  ))}
                </select>
                <div className="flex justify-between text-[10px] text-amber-800/70 font-medium">
                  <span>Year-round sun</span>
                  <span>Seasonal &amp; mild</span>
                </div>
              </motion.div>

              {/* Card 3: Visa Complexity (Indigo / Violet Theme) */}
              <motion.div
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
                className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/75 via-violet-50/45 to-white border border-indigo-200/80 shadow-2xs flex flex-col justify-between gap-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                    <span className="w-6 h-6 rounded-lg bg-indigo-500/15 text-indigo-700 flex items-center justify-center">
                      <Shield className="w-3.5 h-3.5" />
                    </span>
                    <span>Visa Ease</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-white border border-indigo-200/90 font-mono tabular-nums text-[11px] font-extrabold text-indigo-800 shadow-2xs">
                    {visaDifficultyMax === 5 ? 'Any Tier (1–5)' : `Tier ≤ ${visaDifficultyMax}`}
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={visaDifficultyMax}
                  onChange={e => setVisaDifficultyMax(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-indigo-800/70 font-semibold">
                  <span>1 (Easiest)</span>
                  <span>3 (Moderate)</span>
                  <span>5 (Strict)</span>
                </div>
              </motion.div>

              {/* Card 4: Max Visa Income Requirement (Sky / Cyan Theme) */}
              <motion.div
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
                className="p-4 rounded-2xl bg-gradient-to-br from-sky-50/80 via-cyan-50/45 to-white border border-sky-200/80 shadow-2xs flex flex-col justify-between gap-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-sky-950 flex items-center gap-1.5">
                    <span className="w-6 h-6 rounded-lg bg-sky-500/15 text-sky-700 flex items-center justify-center">
                      <Scale className="w-3.5 h-3.5" />
                    </span>
                    <span>Visa Income Req.</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-white border border-sky-200/90 font-mono tabular-nums text-[11px] font-extrabold text-sky-800 shadow-2xs">
                    {visaIncomeMax >= 3500 ? 'Any Income' : `≤ $${visaIncomeMax.toLocaleString()}/mo`}
                  </span>
                </div>
                <input
                  type="range"
                  min={700}
                  max={3500}
                  step={100}
                  value={visaIncomeMax}
                  onChange={e => setVisaIncomeMax(Number(e.target.value))}
                  className="w-full accent-sky-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-sky-800/70 font-mono font-semibold">
                  <span>$700</span>
                  <span>$2,100</span>
                  <span>$3,500+</span>
                </div>
              </motion.div>

            </div>

            {/* Zone 4: Status Strip, Active Filter Chips & Discreet Lifestyle Toggle */}
            <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-2 text-slate-600">
                <span>
                  Showing <strong className="font-mono font-extrabold text-slate-900">{filteredCountries.length}</strong> of{' '}
                  <strong className="font-mono font-extrabold text-slate-900">{countries.length}</strong> verified retirement havens
                </span>

                {hasActiveFilters && (
                  <button
                    onClick={resetFilters}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 font-semibold text-[11px] transition-colors cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                    <span>Clear active filters</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <HeartHandshake className="w-3.5 h-3.5 text-violet-600" />
                <span className="text-[11px] text-slate-500 font-medium">Nightlife &amp; Dating Dynamics:</span>
                <button
                  onClick={() => setDiscreetLifestyleEnabled(!discreetLifestyleEnabled)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer border ${
                    discreetLifestyleEnabled
                      ? 'bg-violet-600 text-white border-violet-600 shadow-2xs'
                      : 'bg-violet-50/80 text-violet-900 border-violet-200 hover:bg-violet-100'
                  }`}
                >
                  {discreetLifestyleEnabled ? 'Details Visible (Active)' : 'Show Discreet Lifestyle Details'}
                </button>
              </div>
            </div>

          </motion.div>

        </div>
      </section>

      {/* Main Directory Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Interactive Spatial Map Component (Animated Expand/Collapse) */}
        <AnimatePresence>
          {showMap && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <WorldHavenMap />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quiet visual teaser card when spatial map is hidden */}
        {!showMap && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2 }}
            className="relative overflow-hidden p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-teal-50/90 via-indigo-50/70 to-amber-50/85 border border-teal-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-sm"
          >
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-teal-400 via-indigo-500 to-amber-500" />
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 via-indigo-600 to-amber-500 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                <Globe2 className="w-5 h-5" />
              </div>
              <div>
                <p className="font-extrabold text-slate-900 flex flex-wrap items-center gap-2 text-sm">
                  <span>Interactive 3D Google Earth World Atlas</span>
                  <span className="text-[10px] font-mono font-bold text-teal-900 bg-teal-100/90 border border-teal-200 px-2 py-0.5 rounded-md">
                    {countries.length} destinations
                  </span>
                </p>
                <p className="text-slate-600 text-xs mt-0.5">
                  Rotate the 3D globe, zoom up to 9x, and select any country marker or territory for instant cost, healthcare, and visa previews.
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowMap(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 via-indigo-600 to-amber-600 hover:from-teal-700 hover:via-indigo-700 hover:to-amber-700 text-white font-bold text-xs transition-all shrink-0 self-start sm:self-auto shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>Open 3D World Atlas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </motion.button>
          </motion.div>
        )}

        {/* Directory Grid */}
        <div>
          {filteredCountries.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-16 text-center bg-white rounded-3xl border border-slate-200/90 shadow-xs"
            >
              <Compass className="w-10 h-10 text-indigo-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900">No destinations match your current filters</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                Try increasing your monthly budget slider, broadening visa complexity, or selecting "All" regions.
              </p>
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Reset All Filters
              </button>
            </motion.div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {filteredCountries.map((country, idx) => (
                  <CountryCard key={country.id} country={country} index={idx} />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

      </div>

    </div>
  );
};

