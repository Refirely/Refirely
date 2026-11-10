import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { getWorldCountryFlag } from '../data/userAccounts';
import {
  Users,
  Search,
  Globe,
  Languages,
  Heart,
  MessageCircle,
  Briefcase,
  ShieldCheck,
  ExternalLink,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

const MEMBER_CARD_THEMES = [
  {
    topBar: 'from-emerald-500 via-teal-500 to-cyan-500',
    borderHover: 'hover:border-teal-300 hover:shadow-teal-950/10',
    avatarRing: 'from-emerald-400 via-teal-400 to-cyan-500',
    msgBtn: 'from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700',
  },
  {
    topBar: 'from-indigo-500 via-violet-500 to-purple-500',
    borderHover: 'hover:border-indigo-300 hover:shadow-indigo-950/10',
    avatarRing: 'from-indigo-400 via-violet-400 to-purple-500',
    msgBtn: 'from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700',
  },
  {
    topBar: 'from-amber-500 via-orange-500 to-rose-500',
    borderHover: 'hover:border-amber-300 hover:shadow-amber-950/10',
    avatarRing: 'from-amber-400 via-orange-400 to-rose-500',
    msgBtn: 'from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700',
  },
  {
    topBar: 'from-teal-500 via-indigo-500 to-amber-500',
    borderHover: 'hover:border-violet-300 hover:shadow-violet-950/10',
    avatarRing: 'from-teal-400 via-indigo-400 to-amber-400',
    msgBtn: 'from-indigo-600 via-teal-600 to-emerald-600 hover:from-indigo-700 hover:to-emerald-700',
  },
];

export const PublicMemberDirectory: React.FC = () => {
  const {
    publicMemberAccounts,
    openPublicProfile,
    startDmWithPeer,
    currentUserId,
    isAuthenticated,
    openAuthModal,
    dmThreads,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [languageFilter, setLanguageFilter] = useState('All');
  const [visitedCountryFilter, setVisitedCountryFilter] = useState('All');

  // Collect unique languages and visited countries across all public members for filters
  const availableLanguages = useMemo(() => {
    const set = new Set<string>();
    publicMemberAccounts.forEach(acc => {
      (acc.profile.languagesKnown || []).forEach(l => {
        if (l.language) set.add(l.language);
      });
    });
    return ['All', ...Array.from(set).sort()];
  }, [publicMemberAccounts]);

  const availableVisitedCountries = useMemo(() => {
    const set = new Set<string>();
    publicMemberAccounts.forEach(acc => {
      (acc.profile.travelHistory || []).forEach(v => {
        if (v.countryName) set.add(v.countryName);
      });
    });
    return ['All', ...Array.from(set).sort()];
  }, [publicMemberAccounts]);

  const statusOptions = [
    'All',
    'Relocated & Settled',
    'Early Retired (FIRE)',
    'Visa In-Progress',
    'Scouting In-Person',
    'Exploring Options',
  ];

  const filteredMembers = useMemo(() => {
    return publicMemberAccounts.filter(acc => {
      const p = acc.profile;

      if (statusFilter !== 'All' && p.relocationStatus !== statusFilter) {
        return false;
      }

      if (languageFilter !== 'All') {
        const speaksLang = (p.languagesKnown || []).some(
          l => l.language.toLowerCase() === languageFilter.toLowerCase()
        );
        if (!speaksLang) return false;
      }

      if (visitedCountryFilter !== 'All') {
        const visited = (p.travelHistory || []).some(
          v => v.countryName.toLowerCase() === visitedCountryFilter.toLowerCase()
        );
        if (!visited) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchName =
          p.name.toLowerCase().includes(q) || (acc.username || '').toLowerCase().includes(q);
        const matchOrigin =
          (p.originCountry || '').toLowerCase().includes(q) ||
          (p.residingCountry || '').toLowerCase().includes(q) ||
          (p.originCity || '').toLowerCase().includes(q);
        const matchBio =
          (p.bio || '').toLowerCase().includes(q) ||
          (p.aboutMe || '').toLowerCase().includes(q) ||
          (p.occupationOrBackground || '').toLowerCase().includes(q);
        const matchLang = (p.languagesKnown || []).some(l => l.language.toLowerCase().includes(q));
        const matchInterests = (p.interests || []).some(i => i.toLowerCase().includes(q));
        const matchVisited = (p.travelHistory || []).some(
          v =>
            v.countryName.toLowerCase().includes(q) ||
            (v.favoriteSpotOrMemory || '').toLowerCase().includes(q) ||
            (v.notes || '').toLowerCase().includes(q)
        );
        return matchName || matchOrigin || matchBio || matchLang || matchInterests || matchVisited;
      }

      return true;
    });
  }, [publicMemberAccounts, searchQuery, statusFilter, languageFilter, visitedCountryFilter]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setLanguageFilter('All');
    setVisitedCountryFilter('All');
  };

  return (
    <div className="space-y-3.5">
      {/* Compact Search & Multi-Facet Filter Toolbar */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-white rounded-2xl border border-slate-200/90 px-3.5 py-3 sm:px-4 sm:py-3.5 space-y-2.5 shadow-xs"
      >
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 via-teal-500 to-amber-500" />
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center">
          {/* Search Input (5 cols) */}
          <div className="md:col-span-5 relative">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-teal-500 to-indigo-600 text-white flex items-center justify-center absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none">
              <Search className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              placeholder="Search expats by name, country visited, language, or interest..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/70 focus:bg-white transition-all"
            />
          </div>

          {/* Visited Country Filter (3 cols) */}
          <div className="md:col-span-3">
            <select
              value={visitedCountryFilter}
              onChange={e => setVisitedCountryFilter(e.target.value)}
              className="w-full px-2.5 py-2 text-xs font-bold text-slate-800 border border-teal-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-teal-50/40 hover:bg-teal-50/70 transition-colors cursor-pointer"
            >
              <option value="All">Visited Country: All</option>
              {availableVisitedCountries
                .filter(c => c !== 'All')
                .map(c => (
                  <option key={c} value={c}>
                    {getWorldCountryFlag(c)} Visited {c}
                  </option>
                ))}
            </select>
          </div>

          {/* Language Spoken Filter (2 cols) */}
          <div className="md:col-span-2">
            <select
              value={languageFilter}
              onChange={e => setLanguageFilter(e.target.value)}
              className="w-full px-2.5 py-2 text-xs font-bold text-slate-800 border border-indigo-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-indigo-50/40 hover:bg-indigo-50/70 transition-colors cursor-pointer"
            >
              <option value="All">Language: All</option>
              {availableLanguages
                .filter(l => l !== 'All')
                .map(l => (
                  <option key={l} value={l}>
                    Speaks {l}
                  </option>
                ))}
            </select>
          </div>

          {/* Reset Button (2 cols) */}
          <div className="md:col-span-2 flex items-center justify-end">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleResetFilters}
              className="w-full px-2.5 py-2 text-xs font-bold text-rose-700 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200/90 hover:border-rose-600 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </motion.button>
          </div>
        </div>

        {/* Relocation Status Filter Tabs + Live Count */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-0.5 flex items-center gap-1 shrink-0">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Stage:</span>
            </span>
            {statusOptions.map(status => {
              const isSelected = statusFilter === status;
              return (
                <motion.button
                  key={status}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1 text-[11px] font-bold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-indigo-600 via-teal-600 to-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/80'
                  }`}
                >
                  {status === 'All' ? 'All Stages' : status}
                </motion.button>
              );
            })}
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold text-slate-500 shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>
              Showing <strong className="text-slate-900 font-mono">{filteredMembers.length}</strong> of{' '}
              <strong className="text-slate-900 font-mono">{publicMemberAccounts.length}</strong> Verified Expats
            </span>
          </div>
        </div>
      </motion.div>

      {/* Expat Cards Grid — 3 per row on lg, 4 per row on xl */}
      {filteredMembers.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-3 shadow-xs"
        >
          <Users className="w-8 h-8 text-indigo-400 mx-auto" />
          <h3 className="text-sm font-extrabold text-slate-900">
            No expat profiles match your filter
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try clearing your search or selecting a different language or visited country filter.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-indigo-600 text-white text-xs font-bold hover:from-teal-700 hover:to-indigo-700 transition-all cursor-pointer shadow-xs"
          >
            Show All Expats
          </button>
        </motion.div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {filteredMembers.map((acc, idx) => {
              const p = acc.profile;
              const visited = p.travelHistory || [];
              const languages = p.languagesKnown || [];
              const interests = p.interests || [];
              const isSelf = acc.id === currentUserId;
              const hasExistingChat = dmThreads.some(
                t =>
                  t.peerUserId === acc.id ||
                  t.peerName.toLowerCase() === p.name.toLowerCase()
              );
              const theme = MEMBER_CARD_THEMES[idx % MEMBER_CARD_THEMES.length];

              return (
                <motion.div
                  layout
                  key={acc.id}
                  initial={{ opacity: 0, y: 14, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 26,
                    delay: Math.min(idx * 0.025, 0.2),
                  }}
                  whileHover={{ y: -4 }}
                  className={`relative overflow-hidden bg-white rounded-2xl border border-slate-200/90 ${theme.borderHover} p-4 flex flex-col justify-between transition-shadow shadow-xs hover:shadow-lg space-y-3`}
                >
                  {/* Top Multi-Color Accent Bar */}
                  <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${theme.topBar}`} />

                  <div className="space-y-2.5 pt-0.5">
                    {/* Top Identity Row */}
                    <div
                      onClick={() => openPublicProfile(acc.id)}
                      className="flex items-start gap-2.5 cursor-pointer group min-w-0"
                    >
                      <div className={`p-0.5 rounded-xl bg-gradient-to-br ${theme.avatarRing} shadow-2xs shrink-0`}>
                        {p.avatarUrl ? (
                          <img
                            src={p.avatarUrl}
                            alt={p.name}
                            referrerPolicy="no-referrer"
                            className="w-11 h-11 rounded-[10px] object-cover border border-white shrink-0"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-[10px] bg-slate-900 text-white text-sm font-extrabold flex items-center justify-center shrink-0">
                            {p.name.charAt(0)}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1.5">
                          <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-indigo-700 transition-colors truncate">
                            {p.name}
                          </h3>
                          {isSelf && (
                            <span className="px-1.5 py-0.5 rounded-full bg-teal-100 text-teal-900 text-[9px] font-extrabold shrink-0">
                              You
                            </span>
                          )}
                        </div>

                        <div className="mt-0.5">
                          <span className="inline-block px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-800 border border-indigo-200/70 text-[10px] font-bold leading-tight truncate max-w-full">
                            {p.relocationStatus || 'Exploring Options'}
                          </span>
                        </div>

                        {p.occupationOrBackground && (
                          <p className="text-[11px] text-slate-600 truncate flex items-center gap-1 mt-1 font-medium">
                            <Briefcase className="w-3 h-3 text-amber-500 shrink-0" />
                            <span className="truncate">{p.occupationOrBackground}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Origin & Residing Strip */}
                    <div className="flex flex-wrap items-center gap-1 text-[11px] text-slate-600 bg-slate-50/90 border border-slate-200/70 rounded-lg px-2.5 py-1">
                      <span className="font-medium text-slate-700 truncate">
                        {getWorldCountryFlag(p.originCountry)} {p.originCountry}
                      </span>
                      <span aria-hidden="true" className="text-slate-400">→</span>
                      <span className="font-bold text-teal-800 truncate">
                        {getWorldCountryFlag(p.residingCountry || p.originCountry)}{' '}
                        {p.originCity ? `${p.originCity}, ` : ''}
                        {p.residingCountry || p.originCountry}
                      </span>
                    </div>

                    {/* Bio */}
                    {p.bio && (
                      <p className="text-[11px] text-slate-600 leading-snug line-clamp-2 font-medium">
                        {p.bio}
                      </p>
                    )}

                    {/* Countries Visited Strip */}
                    <div className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-50/70 via-teal-50/50 to-indigo-50/40 border border-teal-200/70 space-y-1.5">
                      <div className="flex items-center justify-between gap-1 text-[11px]">
                        <span className="font-extrabold text-teal-950 flex items-center gap-1 truncate">
                          <Globe className="w-3 h-3 text-teal-600 shrink-0" />
                          <span>Visited ({visited.length})</span>
                        </span>
                        <span className="px-1.5 py-0.5 rounded-md bg-amber-100/80 text-amber-900 font-bold text-[9px] shrink-0">
                          {p.preferredClimate || 'Mediterranean'}
                        </span>
                      </div>

                      {visited.length === 0 ? (
                        <p className="text-[10px] text-slate-400 italic">
                          Planning initial scouting trips
                        </p>
                      ) : (
                        <div className="flex flex-wrap items-center gap-1 text-[10px]">
                          {visited.slice(0, 3).map(v => (
                            <span
                              key={v.id}
                              className="px-1.5 py-0.5 rounded-md bg-white/90 border border-teal-200/80 text-slate-800 font-semibold shadow-2xs truncate max-w-full"
                            >
                              {v.flag || getWorldCountryFlag(v.countryName)} {v.countryName}{' '}
                              <span className="text-indigo-600 font-mono text-[9px]">
                                ({v.yearVisited})
                              </span>
                            </span>
                          ))}
                          {visited.length > 3 && (
                            <span className="text-[10px] font-bold text-teal-800 px-1">
                              +{visited.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Languages Known & Interests Summary */}
                    <div className="space-y-1.5 text-[11px]">
                      {/* Languages Known */}
                      <div className="flex items-start gap-1.5">
                        <Languages className="w-3 h-3 text-indigo-600 shrink-0 mt-0.5" />
                        <div className="flex flex-wrap items-center gap-1 text-slate-600 min-w-0">
                          {languages.length === 0 ? (
                            <span className="px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-900 font-semibold text-[10px]">
                              English
                            </span>
                          ) : (
                            languages.slice(0, 3).map(l => (
                              <span
                                key={l.id}
                                className="px-1.5 py-0.5 rounded-md bg-indigo-50/80 border border-indigo-200/70 text-indigo-950 font-semibold text-[10px]"
                              >
                                {l.language}{' '}
                                <span className="text-indigo-600 font-normal">({l.proficiency})</span>
                              </span>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Interests */}
                      {interests.length > 0 && (
                        <div className="flex items-start gap-1.5">
                          <Heart className="w-3 h-3 text-rose-500 shrink-0 mt-0.5" />
                          <div className="flex flex-wrap items-center gap-1 text-slate-600 min-w-0">
                            {interests.slice(0, 3).map(interest => (
                              <span
                                key={interest}
                                className="px-1.5 py-0.5 rounded-md bg-rose-50/80 border border-rose-200/70 text-rose-900 font-semibold text-[10px]"
                              >
                                {interest}
                              </span>
                            ))}
                            {interests.length > 3 && (
                              <span className="text-[10px] font-bold text-slate-400">
                                +{interests.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Footer: View Public Profile & Send Personal Message */}
                  <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-1.5">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => openPublicProfile(acc.id)}
                      className="px-2.5 py-1.5 rounded-xl border border-indigo-200/90 hover:border-indigo-300 bg-indigo-50/60 hover:bg-indigo-100/80 text-indigo-950 text-[11px] font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap"
                    >
                      <ExternalLink className="w-3 h-3 text-indigo-600 shrink-0" />
                      <span>Profile</span>
                    </motion.button>

                    {!isSelf && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => {
                          if (!isAuthenticated || currentUserId === 'guest') {
                            openAuthModal('login');
                            return;
                          }
                          startDmWithPeer(
                            p.name,
                            p.residingCountry || p.originCountry || 'Portugal',
                            p.originCity || p.residingCountry || 'Coastal Hub',
                            undefined,
                            {
                              peerAvatar: p.avatarUrl,
                              peerStatus: p.relocationStatus || 'Expat Community Member',
                              peerUserId: acc.id,
                            }
                          );
                        }}
                        className={`flex-1 px-2.5 py-1.5 rounded-xl bg-gradient-to-r ${theme.msgBtn} text-white text-[11px] font-bold transition-all flex items-center justify-center gap-1 shadow-2xs cursor-pointer whitespace-nowrap`}
                      >
                        <MessageCircle className="w-3 h-3 shrink-0" />
                        <span>{hasExistingChat ? 'Continue Chat' : 'Message'}</span>
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

