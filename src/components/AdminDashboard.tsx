import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Country, Region, ClimateCategory } from '../types';
import {
  Shield, Globe, Edit, Trash2, Plus, Users, MessageSquare,
  Calendar, CheckCircle, AlertTriangle, X, Search, SlidersHorizontal, ArrowLeft
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    countries,
    updateCountry,
    addCountry,
    deleteCountry,
    threads,
    meetups,
    toggleRole,
    setCurrentView,
    navigateToCountry,
  } = useApp();

  const [adminSearch, setAdminSearch] = useState('');
  const [editingCountry, setEditingCountry] = useState<Country | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Country Form State
  const [newCountryForm, setNewCountryForm] = useState<Partial<Country>>({
    name: '',
    code: '',
    flag: '🌍',
    region: 'Europe',
    capital: '',
    currency: 'Euro (EUR)',
    currencySymbol: '€',
    language: 'English',
    tagline: '',
    overview: '',
    costOfLiving: {
      monthlyBudgetSingleUSD: 1800,
      monthlyBudgetCoupleUSD: 2600,
      rent1BedCenterUSD: 700,
      rent1BedOutsideUSD: 500,
      mealInexpensiveUSD: 10,
      utilitiesMonthlyUSD: 100,
      groceriesIndex: 45,
      healthcareMonthlyUSD: 80,
    },
    visa: {
      retirementVisaName: 'Retirement Residence Permit',
      minimumIncomeUSD: 1500,
      processingMonths: 3,
      pathwayToPR: 'Eligible for Permanent Residency after 5 years',
      difficultyRating: 2,
      keyRequirements: ['Proof of passive monthly income', 'Clean criminal background check', 'Private healthcare policy'],
      taxStatus: 'Bilateral tax treaties prevent double taxation on foreign pensions.',
      allowedToWork: false,
    },
    climate: {
      category: 'Mediterranean',
      averageTempC: 20,
      annualSunnyDays: 300,
      humidityPercent: 60,
      rainyMonths: 'November to February',
      bestMonths: 'April to October',
    },
    lifestyle: {
      healthcareScore: 88,
      healthcareSummary: 'Modern hospital care with English-speaking specialists.',
      publicHealthcareAccess: 'Full access after residency approval.',
      safetyScore: 89,
      englishProficiency: 'High',
      expatCommunitySize: '100,000+ Expats',
      walkabilityScore: 85,
    },
    demographics: {
      medianAge: 42,
      youngPopulationPercent: 32,
      femalesPer100Males: 103.5,
      datingRating: 4,
      datingCultureSummary: 'Warm and social cafe culture.',
      socialAtmosphere: 'Relaxed and family-friendly outdoor lifestyle.',
    },
    adultEntertainment: {
      nightlifeScore: 4,
      nightlifeVibrancy: 'Balanced Coastal Social',
      adultEntertainmentScore: 3,
      legalStatus: 'Regulated commercial entertainment venues operate under municipal licenses.',
      overview: 'Vibrant local restaurants, beach bars, and regulated lounges.',
      topVenuesOrDistricts: ['Central Marina lounges', 'Historic district bars'],
      safetyGuidance: 'High safety standards across all key districts.',
    },
    topCities: [
      { name: 'Capital City', vibe: 'Urban cosmopolitan hub', monthlyCostUSD: 2000, highlight: 'Central airport and hospitals' },
      { name: 'Coastal Haven', vibe: 'Sunny beach resort', monthlyCostUSD: 1600, highlight: 'Warm climate and expat clubs' },
    ],
    pros: ['Favorable climate and high safety', 'Accessible cost of living'],
    cons: ['Bureaucracy requires patience'],
  });

  const filteredCountries = countries.filter(c => {
    if (!adminSearch.trim()) return true;
    const q = adminSearch.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.region.toLowerCase().includes(q) || c.capital.toLowerCase().includes(q);
  });

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCountry) return;
    updateCountry(editingCountry);
    setEditingCountry(null);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCountryForm.name || !newCountryForm.capital) return;

    const id = newCountryForm.name.toLowerCase().replace(/\s+/g, '-');
    const created: Country = {
      ...(newCountryForm as Country),
      id,
    };
    addCountry(created);
    setIsAddModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Admin Header - Luminous Colorful & Elegant Light Palette */}
      <div className="bg-gradient-to-r from-amber-50 via-teal-50 to-sky-50 text-slate-900 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs border border-amber-200/80">
        <div>
          <div className="flex items-center gap-2 text-amber-800 text-xs font-extrabold uppercase tracking-wider">
            <Shield className="w-4 h-4 text-amber-600" />
            <span>ReFirely Central Administration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Country CMS & Platform Governance Console
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
            Update empirical country indicators, visa rules, economic budgets, moderate discussions, and add new retirement havens.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold text-xs rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Country</span>
          </button>

          <button
            onClick={toggleRole}
            className="px-4 py-2.5 bg-white border border-slate-300 text-slate-700 hover:text-slate-950 font-semibold text-xs rounded-xl hover:bg-slate-50 transition-colors shadow-2xs"
          >
            Switch to Member View
          </button>
        </div>
      </div>

      {/* KPI Metric Summary Cards (Tabular figures) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Published Destinations</span>
            <Globe className="w-4 h-4 text-orange-600" />
          </div>
          <div className="font-mono tabular-nums text-2xl font-extrabold text-slate-900 mt-2">
            {countries.length}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">{countries.length} Global Havens Active</span>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Registered Expat Movers</span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <div className="font-mono tabular-nums text-2xl font-extrabold text-slate-900 mt-2">
            1,248
          </div>
          <span className="text-[11px] text-orange-800 mt-1 block font-semibold">+18% this month</span>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Community Threads</span>
            <MessageSquare className="w-4 h-4 text-orange-600" />
          </div>
          <div className="font-mono tabular-nums text-2xl font-extrabold text-slate-900 mt-2">
            {threads.length}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Across 6 topic categories</span>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Scheduled Expat Meetups</span>
            <Calendar className="w-4 h-4 text-purple-600" />
          </div>
          <div className="font-mono tabular-nums text-2xl font-extrabold text-slate-900 mt-2">
            {meetups.length}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Active community events</span>
        </div>
      </div>

      {/* Country Catalog CMS Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Country Catalog Database ({countries.length} Havens)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Edit live statistics, income thresholds, and healthcare scores. Changes immediately update across all user pages.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search countries..."
              value={adminSearch}
              onChange={e => setAdminSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-slate-200">
            <thead className="bg-slate-50 text-slate-600 font-semibold">
              <tr>
                <th className="py-3 px-4">Country & Flag</th>
                <th className="py-3 px-4">Region</th>
                <th className="py-3 px-4">Single Budget</th>
                <th className="py-3 px-4">Visa Name</th>
                <th className="py-3 px-4">Min. Income</th>
                <th className="py-3 px-4">Healthcare</th>
                <th className="py-3 px-4">Sun Days</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCountries.map(c => (
                <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                    <span className="text-xl">{c.flag}</span>
                    <button
                      onClick={() => navigateToCountry(c.id)}
                      className="hover:text-orange-700 hover:underline text-left font-semibold"
                    >
                      {c.name}
                    </button>
                  </td>

                  <td className="py-3 px-4 text-slate-600">{c.region}</td>

                  <td className="py-3 px-4 font-mono tabular-nums font-semibold text-slate-900">
                    ${c.costOfLiving.monthlyBudgetSingleUSD.toLocaleString()}/mo
                  </td>

                  <td className="py-3 px-4 text-slate-700 truncate max-w-[160px]" title={c.visa.retirementVisaName}>
                    {c.visa.retirementVisaName}
                  </td>

                  <td className="py-3 px-4 font-mono tabular-nums font-semibold text-slate-800">
                    ${c.visa.minimumIncomeUSD.toLocaleString()}/mo
                  </td>

                  <td className="py-3 px-4 font-mono tabular-nums font-bold text-purple-700">
                    {c.lifestyle.healthcareScore}/100
                  </td>

                  <td className="py-3 px-4 font-mono tabular-nums text-amber-700 font-medium">
                    {c.climate.annualSunnyDays} d/yr
                  </td>

                  <td className="py-3 px-4 text-right space-x-2">
                    <button
                      onClick={() => setEditingCountry(JSON.parse(JSON.stringify(c)))}
                      className="p-1.5 rounded text-orange-700 hover:bg-orange-50"
                      title="Edit Country Data"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete ${c.name} from the database?`)) {
                          deleteCountry(c.id);
                        }
                      }}
                      className="p-1.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      title="Delete Country"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Country Modal */}
      {editingCountry && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">
                Edit {editingCountry.flag} {editingCountry.name} Data
              </h3>
              <button onClick={() => setEditingCountry(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 mt-4 text-xs">
              
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tagline</label>
                <input
                  type="text"
                  required
                  value={editingCountry.tagline}
                  onChange={e => setEditingCountry({ ...editingCountry, tagline: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Single Monthly Budget (USD)</label>
                  <input
                    type="number"
                    required
                    value={editingCountry.costOfLiving.monthlyBudgetSingleUSD}
                    onChange={e => setEditingCountry({
                      ...editingCountry,
                      costOfLiving: { ...editingCountry.costOfLiving, monthlyBudgetSingleUSD: Number(e.target.value) }
                    })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Couple Monthly Budget (USD)</label>
                  <input
                    type="number"
                    required
                    value={editingCountry.costOfLiving.monthlyBudgetCoupleUSD}
                    onChange={e => setEditingCountry({
                      ...editingCountry,
                      costOfLiving: { ...editingCountry.costOfLiving, monthlyBudgetCoupleUSD: Number(e.target.value) }
                    })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Retirement Visa Name</label>
                  <input
                    type="text"
                    required
                    value={editingCountry.visa.retirementVisaName}
                    onChange={e => setEditingCountry({
                      ...editingCountry,
                      visa: { ...editingCountry.visa, retirementVisaName: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Min. Monthly Passive Income (USD)</label>
                  <input
                    type="number"
                    required
                    value={editingCountry.visa.minimumIncomeUSD}
                    onChange={e => setEditingCountry({
                      ...editingCountry,
                      visa: { ...editingCountry.visa, minimumIncomeUSD: Number(e.target.value) }
                    })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Healthcare Score (0-100)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={editingCountry.lifestyle.healthcareScore}
                    onChange={e => setEditingCountry({
                      ...editingCountry,
                      lifestyle: { ...editingCountry.lifestyle, healthcareScore: Number(e.target.value) }
                    })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Safety Score (0-100)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={editingCountry.lifestyle.safetyScore}
                    onChange={e => setEditingCountry({
                      ...editingCountry,
                      lifestyle: { ...editingCountry.lifestyle, safetyScore: Number(e.target.value) }
                    })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Annual Sunny Days</label>
                  <input
                    type="number"
                    min={50}
                    max={365}
                    value={editingCountry.climate.annualSunnyDays}
                    onChange={e => setEditingCountry({
                      ...editingCountry,
                      climate: { ...editingCountry.climate, annualSunnyDays: Number(e.target.value) }
                    })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Country Overview Prose</label>
                <textarea
                  rows={3}
                  value={editingCountry.overview}
                  onChange={e => setEditingCountry({ ...editingCountry, overview: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingCountry(null)}
                  className="px-4 py-2 font-medium text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold rounded-xl bg-gradient-to-r from-orange-600 via-amber-600 to-purple-600 text-white hover:from-orange-700 hover:to-purple-700 transition-all shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Country Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-xl w-full p-6 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">Add New Retirement Haven</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">Country Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Belize"
                    value={newCountryForm.name}
                    onChange={e => setNewCountryForm({ ...newCountryForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Flag Emoji</label>
                  <input
                    type="text"
                    required
                    value={newCountryForm.flag}
                    onChange={e => setNewCountryForm({ ...newCountryForm, flag: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-center text-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Region</label>
                  <select
                    value={newCountryForm.region}
                    onChange={e => setNewCountryForm({ ...newCountryForm, region: e.target.value as Region })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="Europe">Europe</option>
                    <option value="Southeast Asia">Southeast Asia</option>
                    <option value="Americas">Americas</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Capital City</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Belmopan"
                    value={newCountryForm.capital}
                    onChange={e => setNewCountryForm({ ...newCountryForm, capital: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tagline</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Caribbean ease, barrier reefs, and English official tongue"
                  value={newCountryForm.tagline}
                  onChange={e => setNewCountryForm({ ...newCountryForm, tagline: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Single Budget (USD/mo)</label>
                  <input
                    type="number"
                    required
                    value={newCountryForm.costOfLiving?.monthlyBudgetSingleUSD}
                    onChange={e => setNewCountryForm({
                      ...newCountryForm,
                      costOfLiving: { ...newCountryForm.costOfLiving!, monthlyBudgetSingleUSD: Number(e.target.value) }
                    })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Min. Passive Income (USD/mo)</label>
                  <input
                    type="number"
                    required
                    value={newCountryForm.visa?.minimumIncomeUSD}
                    onChange={e => setNewCountryForm({
                      ...newCountryForm,
                      visa: { ...newCountryForm.visa!, minimumIncomeUSD: Number(e.target.value) }
                    })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 font-medium text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold rounded-xl bg-gradient-to-r from-orange-600 via-amber-600 to-purple-600 text-white hover:from-orange-700 hover:to-purple-700 transition-all shadow-xs"
                >
                  Publish Destination
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
