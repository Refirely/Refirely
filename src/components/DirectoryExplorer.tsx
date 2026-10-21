import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CountryCard } from './CountryCard';
import { WorldHavenMap } from './WorldHavenMap';
import {
  Search, SlidersHorizontal, Compass, RotateCcw,
  Sun, Shield, DollarSign, HeartHandshake, Scale, ArrowRight, Map, LayoutGrid, X
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

  const regions = ['All', 'Europe', 'Southeast Asia', 'Americas'];
  const climates = ['All', 'Mediterranean', 'Tropical', 'Subtropical', 'Temperate', 'Highlands / Mild'];
  const quickSearchKeywords = [
    { label: 'Portugal', color: 'bg-orange-50 text-orange-900 border-orange-200 hover:bg-orange-100' },
    { label: 'Mediterranean', color: 'bg-purple-50 text-purple-900 border-purple-200 hover:bg-purple-100' },
    { label: 'Tropical', color: 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100' },
    { label: 'Pensionado', color: 'bg-blue-50 text-blue-900 border-blue-200 hover:bg-blue-100' },
    { label: 'D7 Passive Income', color: 'bg-violet-50 text-violet-900 border-violet-200 hover:bg-violet-100' },
    { label: '0% tax', color: 'bg-rose-50 text-rose-900 border-rose-200 hover:bg-rose-100' },
    { label: 'Permanent Residency', color: 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100' },
  ];

  return (
    <div className="space-y-10 pb-20">
      
      {/* Saffron Dawn & Lavender Luminous Hero Section */}
      <section className="bg-gradient-to-b from-orange-50/80 via-purple-50/35 to-white text-slate-900 pt-12 pb-14 border-b border-orange-100/80 relative overflow-hidden">
        {/* Subtle decorative radiant blurs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-orange-200/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-200/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            {/* Clean unboxed editorial kicker */}
            <div className="text-xs font-bold text-orange-700 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-orange-600" />
              <span>Factual Global Relocation Intelligence</span>
            </div>
            
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Choose the Right Country to Retire with{' '}
              <span className="bg-gradient-to-r from-orange-600 via-amber-600 to-purple-600 bg-clip-text text-transparent">
                Confidence
              </span>
              .
            </h1>
            
            <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed max-w-2xl">
              Compare visa rules, actual living costs, climate data, healthcare standards, dating dynamics, and connect directly with fellow retirees already living abroad.
            </p>

            {/* Quick Filter Search Box inside Hero */}
            <div className="mt-7 flex flex-col sm:flex-row items-stretch gap-2.5 max-w-2xl">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type="text"
                  aria-label="Search countries by name, climate type, or visa policy keywords"
                  placeholder="Search by country, climate (e.g. Mediterranean), or visa keyword (e.g. D7, Pensionado, 0% tax)..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-9 py-3 bg-white text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm rounded-xl border border-orange-200/90 shadow-2xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 p-0.5 rounded transition-colors"
                    title="Clear search query"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {comparedCountryIds.length >= 2 && (
                <button
                  onClick={() => setCurrentView('compare')}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white font-bold text-xs sm:text-sm hover:from-orange-700 hover:to-orange-800 transition-all flex items-center justify-center gap-2 shrink-0 shadow-xs"
                >
                  <Scale className="w-4 h-4" />
                  <span>Compare ({comparedCountryIds.length})</span>
                </button>
              )}
            </div>

            {/* Interactive Quick-Filter Keyword Buttons in Curated Saffron & Pastel Hues */}
            <div className="mt-3.5 flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-slate-500 font-medium mr-1 text-[11px]">Popular searches:</span>
              {quickSearchKeywords.map(kw => (
                <button
                  key={kw.label}
                  onClick={() => setSearchQuery(searchQuery === kw.label ? '' : kw.label)}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all whitespace-nowrap shrink-0 border ${
                    searchQuery.toLowerCase() === kw.label.toLowerCase()
                      ? 'bg-orange-600 text-white border-orange-600 shadow-2xs'
                      : kw.color
                  }`}
                >
                  {kw.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Filter and Directory Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Interactive Filter Console */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          
          {/* Dedicated Directory Search Bar inside Filter Console */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              aria-label="Filter directory by country name, climate type, or visa policy keywords"
              placeholder="Filter destinations by country name, climate type (Mediterranean, Tropical, Temperate), or visa policy keyword (Pensionado, D7, Golden Visa, territorial tax)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 bg-slate-50 text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm rounded-lg border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 p-0.5 rounded transition-colors"
                title="Clear search filter"
                aria-label="Clear search filter"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            {/* Region Selector Tabs (Functional Segmented Buttons) */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto">
              <span className="text-xs font-semibold text-slate-400 mr-2 shrink-0">Region:</span>
              {regions.map(r => (
                <button
                  key={r}
                  onClick={() => setSelectedRegion(r)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                    selectedRegion === r
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* Highlighted Sort By & Reset Controls */}
            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-between sm:justify-end">
              <div className="flex items-center gap-2 bg-gradient-to-r from-orange-50 via-amber-50/90 to-orange-50 border border-orange-200/90 px-3 py-1.5 rounded-xl shadow-2xs">
                <span className="text-xs font-bold text-orange-900 flex items-center gap-1.5 shrink-0">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-orange-600" />
                  <span>Sort By:</span>
                </span>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  className="px-2.5 py-1 text-xs font-bold text-slate-900 border border-orange-300/90 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white hover:border-orange-400 transition-colors cursor-pointer shadow-2xs"
                >
                  <option value="recommended">Curated Haven Match</option>
                  <option value="budget-asc">Lowest Cost of Living</option>
                  <option value="healthcare-desc">Highest Healthcare Index</option>
                  <option value="sunny-desc">Most Sunny Days</option>
                  <option value="safety-desc">Highest Safety Score</option>
                  <option value="visa-difficulty-asc">Easiest Visa Process (Tier 1-2)</option>
                  <option value="visa-income-asc">Lowest Visa Income Requirement</option>
                  <option value="female-ratio-desc">Highest Female-to-Male Ratio</option>
                  <option value="dating-nightlife-desc">Best Dating & Nightlife</option>
                </select>
              </div>

              <button
                onClick={resetFilters}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200 hover:border-rose-600 flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer shrink-0"
                title="Reset all filters to default"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Granular Sliders and Micro-filters (No surrounding border lines) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
            
            {/* Budget Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-700">Max Monthly Budget</span>
                <span className="font-mono tabular-nums font-bold text-orange-700">
                  {budgetMax >= 3500 ? 'Any Budget ($3,500+)' : `≤ $${budgetMax.toLocaleString()} / mo`}
                </span>
              </div>
              <input
                type="range"
                min={1100}
                max={3500}
                step={50}
                value={budgetMax}
                onChange={e => setBudgetMax(Number(e.target.value))}
                className="w-full accent-orange-600 cursor-pointer border-0 outline-none focus:outline-none focus:ring-0"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>$1,100</span>
                <span>$2,300</span>
                <span>$3,500+</span>
              </div>
            </div>

            {/* Climate Dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">Climate Preference</label>
              <select
                value={selectedClimate}
                onChange={e => setSelectedClimate(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-slate-50/70 hover:bg-white transition-colors"
              >
                {climates.map(c => (
                  <option key={c} value={c}>
                    {c === 'All' ? 'Any Climate Category' : c}
                  </option>
                ))}
              </select>
            </div>

            {/* Visa Strictness Filter */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-700">Visa Complexity</span>
                <span className="font-mono tabular-nums text-slate-600">
                  {visaDifficultyMax === 5 ? 'Any Tier (1–5)' : `Tier ≤ ${visaDifficultyMax}`}
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={5}
                value={visaDifficultyMax}
                onChange={e => setVisaDifficultyMax(Number(e.target.value))}
                className="w-full accent-orange-600 cursor-pointer border-0 outline-none focus:outline-none focus:ring-0"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>1 (Easiest)</span>
                <span>3 (Moderate)</span>
                <span>5 (Strictest)</span>
              </div>
            </div>

            {/* Visa Minimum Income Requirement Filter */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-700">Max Visa Income Req.</span>
                <span className="font-mono tabular-nums text-orange-700 font-bold">
                  {visaIncomeMax >= 3500 ? 'Any Income' : `≤ $${visaIncomeMax.toLocaleString()} / mo`}
                </span>
              </div>
              <input
                type="range"
                min={700}
                max={3500}
                step={100}
                value={visaIncomeMax}
                onChange={e => setVisaIncomeMax(Number(e.target.value))}
                className="w-full accent-orange-600 cursor-pointer border-0 outline-none focus:outline-none focus:ring-0"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>$700</span>
                <span>$2,000</span>
                <span>$3,500+</span>
              </div>
            </div>

          </div>

          {/* Discreet Lifestyle Toggle Notification Strip */}
          <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-2">
            <span>
              Showing <strong className="font-mono text-slate-900">{filteredCountries.length}</strong> of{' '}
              <strong className="font-mono text-slate-900">{countries.length}</strong> verified retirement havens
            </span>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">Nightlife & Dating Dynamics:</span>
              <button
                onClick={() => setDiscreetLifestyleEnabled(!discreetLifestyleEnabled)}
                className={`font-semibold hover:underline ${
                  discreetLifestyleEnabled ? 'text-amber-700' : 'text-slate-600'
                }`}
              >
                {discreetLifestyleEnabled ? 'Details Visible (Active)' : 'Show Discreet Lifestyle Details'}
              </button>
            </div>
          </div>

        </div>

        {/* View Switcher Bar & Map Header */}
        <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Retirement Destinations ({filteredCountries.length})
            </h2>
            <span className="text-xs text-slate-400 hidden sm:inline">
              · Detailed economic, healthcare & visa dossiers
            </span>
          </div>

          <button
            onClick={() => setShowMap(!showMap)}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all flex items-center gap-2 shadow-2xs ${
              showMap
                ? 'bg-gradient-to-r from-orange-600 to-purple-600 text-white border-orange-600 shadow-xs'
                : 'bg-white text-orange-950 border-orange-200 hover:border-orange-300 hover:bg-orange-50/70'
            }`}
          >
            <Map className="w-4 h-4 text-orange-600" />
            <span>{showMap ? 'Hide Spatial Map' : '🗺️ Open Spatial Map (Global Atlas)'}</span>
            {!showMap && (
              <span className="text-[10px] px-1.5 py-0.2 bg-orange-100 text-orange-900 font-bold font-mono rounded">
                Interactive
              </span>
            )}
          </button>
        </div>

        {/* Interactive Spatial Map Component (shown only when requested) */}
        {showMap && <WorldHavenMap />}

        {/* Quiet visual teaser card when spatial map is hidden by default */}
        {!showMap && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-50/80 via-purple-50/40 to-blue-50/50 border border-orange-100/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white border border-orange-200 text-orange-800 flex items-center justify-center font-bold shadow-2xs shrink-0">
                <Map className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <p className="font-bold text-slate-900 flex items-center gap-2">
                  <span>Interactive Spatial Map Available</span>
                  <span className="text-[10px] font-mono font-bold text-orange-800 bg-orange-100/80 px-1.5 py-0.2 rounded">{countries.length} destinations</span>
                </p>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Click to visualize countries on a high-resolution cartographic world atlas with coordinates, cost previews, and visa corridors.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowMap(true)}
              className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs transition-colors shrink-0 self-start sm:self-auto shadow-2xs flex items-center gap-1.5"
            >
              <span>Show Spatial Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Directory Grid */}
        <div className="mt-8">
          {filteredCountries.length === 0 ? (
            <div className="p-16 text-center bg-white rounded-xl border border-slate-200">
              <Compass className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900">No destinations match this budget or climate</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                Try increasing your monthly budget slider or selecting "All Climates".
              </p>
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCountries.map(country => (
                <CountryCard key={country.id} country={country} />
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
