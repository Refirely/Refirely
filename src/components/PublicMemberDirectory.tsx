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
    <div className="space-y-6">
      {/* Privacy & Directory Intro Banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-br from-teal-50/85 via-indigo-50/55 to-amber-50/75 rounded-3xl border border-indigo-200/80 p-5 sm:p-7 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4"
      >
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-teal-500 via-indigo-500 to-amber-500" />
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-teal-900">
            <span className="p-1.5 rounded-lg bg-gradient-to-br from-teal-500 to-indigo-600 text-white shadow-2xs">
              <Users className="w-3.5 h-3.5" />
            </span>
            <span>Verified Expat &amp; Retiree Member Directory</span>
            <span className="px-2.5 py-0.5 rounded-full bg-white/90 border border-teal-200 font-mono tabular-nums text-teal-800 text-[11px]">
              {publicMemberAccounts.length} Registered Members
            </span>
          </div>
          <h2 className="text-lg sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Connect with Fellow Expats by{' '}
            <span className="bg-gradient-to-r from-teal-600 via-indigo-600 to-amber-600 bg-clip-text text-transparent">
              Countries Visited, Languages &amp; Interests
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            Explore public community profiles of registered members and send personal messages to exchange firsthand advice. Personal financial portfolios and private country shortlists are never displayed publicly.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-emerald-950 bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-emerald-200/90 shadow-2xs shrink-0">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Finances &amp; Shortlists Strictly Private</span>
        </div>
      </motion.div>

      {/* Search & Multi-Facet Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="relative overflow-hidden bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 space-y-4 shadow-sm"
      >
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 via-teal-500 to-amber-500" />
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input (5 cols) */}
          <div className="md:col-span-5 relative">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-500 to-indigo-600 text-white flex items-center justify-center absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none">
              <Search className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              placeholder="Search members by name, country visited, language, or interest..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-3 py-2.5 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/70 focus:bg-white transition-all"
            />
          </div>

          {/* Visited Country Filter (3 cols) */}
          <div className="md:col-span-3">
            <select
              value={visitedCountryFilter}
              onChange={e => setVisitedCountryFilter(e.target.value)}
              className="w-full px-3 py-2.5 text-xs font-bold text-slate-800 border border-teal-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-teal-50/40 hover:bg-teal-50/70 transition-colors cursor-pointer"
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
              className="w-full px-3 py-2.5 text-xs font-bold text-slate-800 border border-indigo-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-indigo-50/40 hover:bg-indigo-50/70 transition-colors cursor-pointer"
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
              className="w-full px-3 py-2.5 text-xs font-bold text-rose-700 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200/90 hover:border-rose-600 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </motion.button>
          </div>
        </div>

        {/* Relocation Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1 shrink-0">
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
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-indigo-600 via-teal-600 to-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/80'
                }`}
              >
                {status === 'All' ? 'All Relocation Stages' : status}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Member Cards Grid */}
      {filteredMembers.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3 shadow-xs"
        >
          <Users className="w-8 h-8 text-indigo-400 mx-auto" />
          <h3 className="text-sm font-extrabold text-slate-900">
            No member profiles match your filter
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try clearing your search or selecting a different language or visited country filter.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-indigo-600 text-white text-xs font-bold hover:from-teal-700 hover:to-indigo-700 transition-all cursor-pointer shadow-xs"
          >
            Show All Public Profiles
          </button>
        </motion.div>
      ) : (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                  initial={{ opacity: 0, y: 18, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  transition={{
                    type: 'spring',
                    stiffness: 290,
                    damping: 26,
                    delay: Math.min(idx * 0.03, 0.25),
                  }}
                  whileHover={{ y: -5 }}
                  className={`relative overflow-hidden bg-white rounded-2xl border border-slate-200/90 ${theme.borderHover} p-5 sm:p-6 flex flex-col justify-between transition-shadow shadow-sm hover:shadow-xl space-y-4`}
                >
                  {/* Top Multi-Color Accent Bar */}
                  <div className={`absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r ${theme.topBar}`} />

                  <div className="space-y-4 pt-1">
                    {/* Top Identity Row */}
                    <div className="flex items-start justify-between gap-3">
                      <div
                        onClick={() => openPublicProfile(acc.id)}
                        className="flex items-center gap-3.5 cursor-pointer group min-w-0"
                      >
                        <div className={`p-0.5 rounded-2xl bg-gradient-to-br ${theme.avatarRing} shadow-xs shrink-0`}>
                          {p.avatarUrl ? (
                            <img
                              src={p.avatarUrl}
                              alt={p.name}
                              referrerPolicy="no-referrer"
                              className="w-14 h-14 rounded-xl object-cover border-2 border-white shrink-0"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-xl bg-slate-900 text-white text-lg font-extrabold flex items-center justify-center shrink-0">
                              {p.name.charAt(0)}
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base font-extrabold text-slate-900 group-hover:text-indigo-700 transition-colors truncate">
                              {p.name}
                            </h3>
                            {isSelf && (
                              <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-900 text-[10px] font-extrabold">
                                You
                              </span>
                            )}
                            <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200/70 text-[10px] font-bold">
                              {p.relocationStatus || 'Exploring Options'}
                            </span>
                          </div>

                          {p.occupationOrBackground && (
                            <p className="text-xs text-slate-600 truncate flex items-center gap-1 mt-0.5 font-medium">
                              <Briefcase className="w-3 h-3 text-amber-500 shrink-0" />
                              <span className="truncate">{p.occupationOrBackground}</span>
                            </p>
                          )}

                          {/* Origin & Residing */}
                          <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 mt-1">
                            <span className="font-medium text-slate-700">
                              {getWorldCountryFlag(p.originCountry)} {p.originCountry}
                            </span>
                            <span aria-hidden="true" className="text-slate-400">→</span>
                            <span className="font-bold text-teal-800">
                              {getWorldCountryFlag(p.residingCountry || p.originCountry)}{' '}
                              {p.originCity ? `${p.originCity}, ` : ''}
                              {p.residingCountry || p.originCountry}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bio */}
                    {p.bio && (
                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 font-medium">
                        {p.bio}
                      </p>
                    )}

                    {/* Countries Visited Strip */}
                    <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-50/70 via-teal-50/50 to-indigo-50/40 border border-teal-200/70 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-extrabold text-teal-950 flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5 text-teal-600" />
                          <span>Countries Visited ({visited.length})</span>
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-amber-100/80 text-amber-900 font-bold text-[10px]">
                          {p.preferredClimate || 'Mediterranean'} Climate
                        </span>
                      </div>

                      {visited.length === 0 ? (
                        <p className="text-[11px] text-slate-400 italic">
                          Planning initial scouting trips
                        </p>
                      ) : (
                        <div className="flex flex-wrap items-center gap-1.5 text-xs">
                          {visited.map(v => (
                            <span
                              key={v.id}
                              className="px-2 py-0.5 rounded-lg bg-white/90 border border-teal-200/80 text-slate-800 font-semibold shadow-2xs"
                            >
                              {v.flag || getWorldCountryFlag(v.countryName)} {v.countryName}{' '}
                              <span className="text-indigo-600 font-mono text-[10px]">
                                ({v.yearVisited})
                              </span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Languages Known & Interests Summary */}
                    <div className="space-y-2 text-xs">
                      {/* Languages Known */}
                      <div className="flex items-start gap-2">
                        <Languages className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                        <div className="flex flex-wrap items-center gap-1.5 text-slate-600">
                          <span className="font-bold text-slate-800">Languages:</span>
                          {languages.length === 0 ? (
                            <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-900 font-semibold text-[11px]">
                              English
                            </span>
                          ) : (
                            languages.map(l => (
                              <span
                                key={l.id}
                                className="px-2 py-0.5 rounded-md bg-indigo-50/80 border border-indigo-200/70 text-indigo-950 font-semibold text-[11px]"
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
                        <div className="flex items-start gap-2">
                          <Heart className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                          <div className="flex flex-wrap items-center gap-1.5 text-slate-600">
                            <span className="font-bold text-slate-800">Interests:</span>
                            {interests.slice(0, 4).map(interest => (
                              <span
                                key={interest}
                                className="px-2 py-0.5 rounded-md bg-rose-50/80 border border-rose-200/70 text-rose-900 font-semibold text-[11px]"
                              >
                                {interest}
                              </span>
                            ))}
                            {interests.length > 4 && (
                              <span className="text-[11px] font-bold text-slate-400">
                                +{interests.length - 4} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Footer: View Public Profile & Send Personal Message */}
                  <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => openPublicProfile(acc.id)}
                      className="px-3.5 py-2 rounded-xl border border-indigo-200/90 hover:border-indigo-300 bg-indigo-50/60 hover:bg-indigo-100/80 text-indigo-950 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-indigo-600" />
                      <span>View Public Profile</span>
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
                        className={`px-4 py-2 rounded-xl bg-gradient-to-r ${theme.msgBtn} text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer whitespace-nowrap`}
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>{hasExistingChat ? 'Continue Chat' : 'Send Personal Message'}</span>
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

