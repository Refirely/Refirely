import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { CountryJournalEntry, InterestLevel, Country } from '../types';
import { CountryFlag } from './CountryFlag';
import {
  BookOpen, Star, Lock, Edit3, Trash2, Plus, ExternalLink,
  Search, Bookmark, Globe, Check, Cloud, Sparkles, Filter,
  Calendar, DollarSign, Tag, Save, X, AlertCircle, RefreshCw
} from 'lucide-react';

const INTEREST_LEVEL_CONFIG: Record<
  InterestLevel,
  {
    label: string;
    bg: string;
    text: string;
    border: string;
    badgeBg: string;
    description: string;
    icon: string;
  }
> = {
  'Top Contender': {
    label: 'Top Contender',
    bg: 'bg-emerald-50 text-emerald-900 border-emerald-300',
    text: 'text-emerald-700',
    border: 'border-emerald-500',
    badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    description: 'Primary relocation target with highest suitability and scouting priority.',
    icon: '🌟',
  },
  'Strong Interest': {
    label: 'Strong Interest',
    bg: 'bg-teal-50 text-teal-900 border-teal-300',
    text: 'text-teal-700',
    border: 'border-teal-500',
    badgeBg: 'bg-teal-100 text-teal-800 border-teal-200',
    description: 'High research priority; actively analyzing visa rules, costs, and towns.',
    icon: '🚀',
  },
  'Moderate Interest': {
    label: 'Moderate Interest',
    bg: 'bg-sky-50 text-sky-900 border-sky-300',
    text: 'text-sky-700',
    border: 'border-sky-400',
    badgeBg: 'bg-sky-100 text-sky-800 border-sky-200',
    description: 'Promising backup haven; evaluating specific trade-offs like language or taxes.',
    icon: '💡',
  },
  'Casual Exploration': {
    label: 'Casual Exploration',
    bg: 'bg-amber-50 text-amber-900 border-amber-300',
    text: 'text-amber-700',
    border: 'border-amber-400',
    badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
    description: 'Intriguing destination on the backburner for casual reading or vacation scouting.',
    icon: '🧭',
  },
  'Ruled Out': {
    label: 'Ruled Out',
    bg: 'bg-slate-100 text-slate-800 border-slate-300',
    text: 'text-slate-600',
    border: 'border-slate-400',
    badgeBg: 'bg-slate-200 text-slate-700 border-slate-300',
    description: 'Investigated and disqualified due to climate, strict visa income, or taxes.',
    icon: '⛔',
  },
};

const SUGGESTED_TAGS = [
  'D7 Passive Visa',
  'Non-Lucrative Visa',
  'Digital Nomad Visa',
  'Coastal Living',
  'Low Living Costs',
  'Expat Friendly',
  'Top Healthcare',
  'Warm & Sunny',
  'Walkable City',
  'Low Tax Friendly',
  'High English',
  'UNESCO Charm',
];

export const CountryJournal: React.FC = () => {
  const {
    userProfile,
    countries,
    navigateToCountry,
    journalEntries,
    saveJournalEntry,
    deleteJournalEntry,
    firebaseUser,
    isFirebaseSyncing,
    toggleSaveCountry,
    openEditProfile,
  } = useApp();

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'favorited' | 'visited' | InterestLevel>('all');
  
  // Modal state for adding/editing entry
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCountryId, setEditingCountryId] = useState<string>('');
  const [modalInterest, setModalInterest] = useState<InterestLevel>('Top Contender');
  const [modalNotes, setModalNotes] = useState('');
  const [modalTimeline, setModalTimeline] = useState('');
  const [modalBudget, setModalBudget] = useState<number | ''>('');
  const [modalTags, setModalTags] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Compute union of countries: favorited, visited, or existing journal entries
  const candidateCountryMap = useMemo(() => {
    const map = new Map<string, { country: Country; isFavorited: boolean; isVisited: boolean }>();

    // 1. Favorited countries
    userProfile.savedCountryIds.forEach(id => {
      const c = countries.find(item => item.id === id);
      if (c) {
        map.set(c.id, { country: c, isFavorited: true, isVisited: false });
      }
    });

    // 2. Visited countries from travel history
    userProfile.travelHistory?.forEach(t => {
      const matched = countries.find(
        c => c.name.toLowerCase() === t.countryName.toLowerCase() || c.id === t.countryCode?.toLowerCase()
      );
      if (matched) {
        const existing = map.get(matched.id);
        map.set(matched.id, {
          country: matched,
          isFavorited: existing?.isFavorited || userProfile.savedCountryIds.includes(matched.id),
          isVisited: true,
        });
      }
    });

    // 3. Any country with an active journal entry
    Object.keys(journalEntries).forEach(cid => {
      const c = countries.find(item => item.id === cid);
      if (c && !map.has(c.id)) {
        map.set(c.id, {
          country: c,
          isFavorited: userProfile.savedCountryIds.includes(c.id),
          isVisited: userProfile.travelHistory?.some(t => t.countryName.toLowerCase() === c.name.toLowerCase()) || false,
        });
      }
    });

    return map;
  }, [userProfile.savedCountryIds, userProfile.travelHistory, journalEntries, countries]);

  const candidateList = useMemo(() => {
    return Array.from(candidateCountryMap.values());
  }, [candidateCountryMap]);

  // Filtered candidate list based on search and selected filter
  const filteredCandidates = useMemo(() => {
    return candidateList.filter(({ country, isFavorited, isVisited }) => {
      const entry = journalEntries[country.id];

      // Filter check
      if (selectedFilter === 'favorited' && !isFavorited) return false;
      if (selectedFilter === 'visited' && !isVisited) return false;
      if (
        selectedFilter !== 'all' &&
        selectedFilter !== 'favorited' &&
        selectedFilter !== 'visited'
      ) {
        if (!entry || entry.interestLevel !== selectedFilter) return false;
      }

      // Search check
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = country.name.toLowerCase().includes(q);
        const matchesNotes = entry?.privateNotes?.toLowerCase().includes(q);
        const matchesTags = entry?.tags?.some(tag => tag.toLowerCase().includes(q));
        if (!matchesName && !matchesNotes && !matchesTags) return false;
      }

      return true;
    });
  }, [candidateList, journalEntries, selectedFilter, searchQuery]);

  // Open editor for a specific country
  const openJournalEditor = (countryId: string) => {
    const c = countries.find(item => item.id === countryId);
    if (!c) return;

    const existing = journalEntries[countryId];
    setEditingCountryId(countryId);
    setModalInterest(existing?.interestLevel || 'Top Contender');
    setModalNotes(existing?.privateNotes || '');
    setModalTimeline(existing?.scoutingTimeline || '');
    setModalBudget(existing?.personalBudgetEstimateUSD ?? c.costOfLiving.monthlyBudgetSingleUSD);
    setModalTags(existing?.tags || ['Top Contender', 'Coastal Living']);
    setCustomTagInput('');
    setIsModalOpen(true);
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    const c = countries.find(item => item.id === editingCountryId);
    if (!c) return;

    const isVisited = userProfile.travelHistory?.some(
      t => t.countryName.toLowerCase() === c.name.toLowerCase()
    ) || false;
    const isFavorited = userProfile.savedCountryIds.includes(c.id);

    await saveJournalEntry({
      countryId: c.id,
      countryName: c.name,
      countryFlag: c.flag,
      interestLevel: modalInterest,
      privateNotes: modalNotes.trim(),
      tags: modalTags,
      scoutingTimeline: modalTimeline.trim(),
      personalBudgetEstimateUSD: modalBudget !== '' ? Number(modalBudget) : undefined,
      visitedBefore: isVisited,
      isFavorited,
    });

    setIsModalOpen(false);
    setSaveSuccessMsg(`Saved journal notes for ${c.name}`);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleQuickInterestChange = async (country: Country, newInterest: InterestLevel) => {
    const existing = journalEntries[country.id];
    const isVisited = userProfile.travelHistory?.some(
      t => t.countryName.toLowerCase() === country.name.toLowerCase()
    ) || false;

    await saveJournalEntry({
      countryId: country.id,
      countryName: country.name,
      countryFlag: country.flag,
      interestLevel: newInterest,
      privateNotes: existing?.privateNotes || `Tracking ${country.name} as ${newInterest}.`,
      tags: existing?.tags || [newInterest],
      scoutingTimeline: existing?.scoutingTimeline,
      personalBudgetEstimateUSD: existing?.personalBudgetEstimateUSD ?? country.costOfLiving.monthlyBudgetSingleUSD,
      visitedBefore: isVisited,
      isFavorited: userProfile.savedCountryIds.includes(country.id),
    });
  };

  const toggleModalTag = (tag: string) => {
    setModalTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const addCustomTag = () => {
    if (!customTagInput.trim()) return;
    const clean = customTagInput.trim();
    if (!modalTags.includes(clean)) {
      setModalTags(prev => [...prev, clean]);
    }
    setCustomTagInput('');
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
      
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800 shadow-2xs">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">Country Journal & Interest Tracker</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 uppercase tracking-wider">
                  Private Vault
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Record private research notes, scouting impressions, and track candidacy tiers for favorited or visited countries.
              </p>
            </div>
          </div>
        </div>

        {/* Cloud Sync & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600">
            <Cloud className={`w-3.5 h-3.5 ${isFirebaseSyncing ? 'text-teal-600 animate-spin' : 'text-teal-700'}`} />
            <span>
              {firebaseUser
                ? 'Firestore Cloud Synced'
                : 'Encrypted Local Storage'}
            </span>
          </div>

          <button
            onClick={() => {
              // Open modal with first candidate or default country
              const firstCountryId = candidateList[0]?.country.id || 'portugal';
              openJournalEditor(firstCountryId);
            }}
            className="px-3.5 py-1.5 rounded-lg bg-teal-800 text-white font-semibold text-xs hover:bg-teal-900 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Country Note</span>
          </button>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in duration-150">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Candidates ({candidateList.length})
          </button>
          <button
            onClick={() => setSelectedFilter('favorited')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
              selectedFilter === 'favorited'
                ? 'bg-rose-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Bookmark className="w-3 h-3" />
            <span>Favorited ({candidateList.filter(c => c.isFavorited).length})</span>
          </button>
          <button
            onClick={() => setSelectedFilter('visited')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
              selectedFilter === 'visited'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Globe className="w-3 h-3" />
            <span>Visited ({candidateList.filter(c => c.isVisited).length})</span>
          </button>
          <button
            onClick={() => setSelectedFilter('Top Contender')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
              selectedFilter === 'Top Contender'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <span>🌟 Top Contenders</span>
          </button>
          <button
            onClick={() => setSelectedFilter('Strong Interest')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
              selectedFilter === 'Strong Interest'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100'
            }`}
          >
            <span>🚀 Strong Interest</span>
          </button>
          <button
            onClick={() => setSelectedFilter('Ruled Out')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
              selectedFilter === 'Ruled Out'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>⛔ Ruled Out</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search notes or tags..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* Candidate Journal Grid */}
      {filteredCandidates.length === 0 ? (
        <div className="p-10 rounded-xl border border-dashed border-slate-300 text-center bg-slate-50/50">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-800">No Journal Entries Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            {searchQuery
              ? `No countries or notes match "${searchQuery}". Try a different keyword or reset filters.`
              : 'Add countries to your favorited shortlist or log your travel history to begin writing your private retirement journal.'}
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedFilter('all');
            }}
            className="mt-4 px-4 py-2 rounded-lg bg-teal-800 text-white font-semibold text-xs inline-flex items-center gap-1.5 shadow-xs"
          >
            <span>Show All Candidates</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredCandidates.map(({ country, isFavorited, isVisited }) => {
            const entry = journalEntries[country.id];
            const interest = entry?.interestLevel || (isFavorited ? 'Strong Interest' : 'Moderate Interest');
            const style = INTEREST_LEVEL_CONFIG[interest] || INTEREST_LEVEL_CONFIG['Moderate Interest'];
            const lastUpdated = entry?.updatedAt 
              ? new Date(entry.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              : 'Drafted';

            return (
              <div
                key={country.id}
                className="rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all p-5 flex flex-col justify-between shadow-2xs space-y-4"
              >
                {/* Header: Flag, Name, Status Badges */}
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <CountryFlag
                        countryCode={country.code}
                        countryName={country.name}
                        fallbackEmoji={country.flag}
                        size="xl"
                        className="w-9 h-6 rounded-sm shadow-xs ring-1 ring-slate-200 shrink-0"
                      />
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-extrabold text-slate-900">{country.name}</h3>
                          <span className="text-[11px] font-medium text-slate-500">
                            {country.region} · {country.capital}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          {isFavorited && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-semibold flex items-center gap-1">
                              <Bookmark className="w-2.5 h-2.5 fill-rose-600 text-rose-600" />
                              <span>Favorited Shortlist</span>
                            </span>
                          )}
                          {isVisited && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 font-semibold flex items-center gap-1">
                              <Globe className="w-2.5 h-2.5 text-teal-700" />
                              <span>Visited Trip Logged</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Interest Level Badge */}
                    <div className="shrink-0 text-right">
                      <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-bold border ${style.badgeBg}`}>
                        <span>{style.icon}</span>
                        <span>{interest}</span>
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-1">
                        Updated {lastUpdated}
                      </span>
                    </div>
                  </div>

                  {/* Quick Interest Level Switcher Buttons */}
                  <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                      Set Level:
                    </span>
                    {(['Top Contender', 'Strong Interest', 'Moderate Interest', 'Casual Exploration', 'Ruled Out'] as InterestLevel[]).map(lvl => (
                      <button
                        key={lvl}
                        onClick={() => handleQuickInterestChange(country, lvl)}
                        className={`text-[10px] px-2 py-0.5 rounded-md font-medium transition-all ${
                          interest === lvl
                            ? 'bg-slate-900 text-white font-bold shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {INTEREST_LEVEL_CONFIG[lvl].icon} {lvl.split(' ')[0]}
                      </button>
                    ))}
                  </div>

                  {/* Private Notes Display */}
                  <div className="mt-3.5 p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-slate-700 text-xs font-semibold">
                        <Lock className="w-3 h-3 text-slate-400" />
                        <span>Private Scouting Notes</span>
                      </div>
                      <button
                        onClick={() => openJournalEditor(country.id)}
                        className="text-[11px] font-semibold text-teal-700 hover:underline flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit Note</span>
                      </button>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed italic line-clamp-3">
                      {entry?.privateNotes || (
                        <span className="text-slate-400 not-italic">
                          No private notes recorded yet. Click "Edit Note" to log your thoughts on housing, visas, or local scouting impressions.
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Expat Snapshot: Scouting Window & Budget */}
                  <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                    <div className="p-2.5 rounded-lg bg-slate-50/70 border border-slate-200/80">
                      <span className="text-[10px] text-slate-400 font-medium block">Planned Scouting Window</span>
                      <div className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3 text-teal-700 shrink-0" />
                        <span className="truncate">{entry?.scoutingTimeline || 'TBD (Flexible)'}</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-50/70 border border-slate-200/80">
                      <span className="text-[10px] text-slate-400 font-medium block">Personal Target Budget</span>
                      <div className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                        <DollarSign className="w-3 h-3 text-teal-700 shrink-0" />
                        <span className="font-mono">
                          ${(entry?.personalBudgetEstimateUSD || country.costOfLiving.monthlyBudgetSingleUSD).toLocaleString()}/mo
                        </span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          (Ref: ${country.costOfLiving.monthlyBudgetSingleUSD})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  {entry?.tags && entry.tags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 mt-3">
                      {entry.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded text-[10px] font-medium bg-white text-slate-600 border border-slate-200 shadow-2xs"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleSaveCountry(country.id)}
                      className={`text-xs px-2.5 py-1.5 rounded-lg border font-semibold flex items-center gap-1 transition-colors ${
                        isFavorited
                          ? 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
                          : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                      }`}
                      title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <Bookmark className={`w-3 h-3 ${isFavorited ? 'fill-rose-600' : ''}`} />
                      <span>{isFavorited ? 'Saved' : 'Save'}</span>
                    </button>

                    {entry && (
                      <button
                        onClick={() => deleteJournalEntry(country.id)}
                        className="text-xs p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete this journal record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => navigateToCountry(country.id)}
                    className="text-xs font-bold text-teal-800 hover:underline flex items-center gap-1"
                  >
                    <span>Open Country Dossier</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit/Create Journal Entry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-6">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-800 text-white flex items-center justify-center font-bold">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Country Journal: {countries.find(c => c.id === editingCountryId)?.name || 'Destination'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Private retirement research, candidacy tier & local scouting notes
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4 mt-5">
              {/* Country Picker if selecting another country */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Select Country
                </label>
                <select
                  value={editingCountryId}
                  onChange={e => setEditingCountryId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {countries.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.flag} {c.name} ({c.region})
                    </option>
                  ))}
                </select>
              </div>

              {/* Interest Level Selection */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Retirement Interest Level & Candidacy Tier
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(['Top Contender', 'Strong Interest', 'Moderate Interest', 'Casual Exploration', 'Ruled Out'] as InterestLevel[]).map(lvl => {
                    const cfg = INTEREST_LEVEL_CONFIG[lvl];
                    const isSelected = modalInterest === lvl;
                    return (
                      <button
                        type="button"
                        key={lvl}
                        onClick={() => setModalInterest(lvl)}
                        className={`p-2.5 rounded-lg border text-left transition-all ${
                          isSelected
                            ? `${cfg.bg} border-2 ${cfg.border} shadow-2xs`
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span>{cfg.icon}</span>
                          <span className="text-xs font-bold text-slate-900">{lvl}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                          {cfg.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Private Notes Textarea */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Private Notes & Observations
                  </label>
                  <span className="text-[10px] text-slate-400">
                    {modalNotes.length} / 5000 chars
                  </span>
                </div>
                <textarea
                  rows={4}
                  required
                  placeholder="e.g. Visited in May; loved Cascais promenade. Spoke with a local lawyer about D7 passive income proof (~€820/mo) and NHR 2.0 tax rules. Private healthcare was around €120/mo with Médis."
                  value={modalNotes}
                  onChange={e => setModalNotes(e.target.value)}
                  maxLength={5000}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-sans"
                />
              </div>

              {/* Two columns: Scouting timeline & Target Monthly Budget */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Planned Scouting Trip / Timeline
                  </label>
                  <div className="relative">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="e.g. Fall 2026, or Done (May 2024)"
                      value={modalTimeline}
                      onChange={e => setModalTimeline(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Personal Target Budget (USD/mo)
                  </label>
                  <div className="relative">
                    <DollarSign className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="number"
                      min={500}
                      max={20000}
                      step={50}
                      placeholder="e.g. 2800"
                      value={modalBudget}
                      onChange={e => setModalBudget(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full pl-8 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Tags Selector */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Tags & Priority Focus
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {SUGGESTED_TAGS.map(tag => {
                    const isSelected = modalTags.includes(tag);
                    return (
                      <button
                        type="button"
                        key={tag}
                        onClick={() => toggleModalTag(tag)}
                        className={`text-[10px] px-2 py-0.5 rounded-md border transition-all ${
                          isSelected
                            ? 'bg-teal-800 text-white border-teal-800 font-bold'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        #{tag}
                      </button>
                    );
                  })}
                </div>

                {/* Custom tag input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add custom tag..."
                    value={customTagInput}
                    onChange={e => setCustomTagInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addCustomTag();
                      }
                    }}
                    className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <button
                    type="button"
                    onClick={addCustomTag}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-lg bg-teal-800 text-white hover:bg-teal-900 flex items-center gap-1.5 shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Journal Entry</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
