import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { getWorldCountryFlag } from '../data/userAccounts';
import {
  Users,
  Search,
  Globe,
  Languages,
  Heart,
  MessageCircle,
  MapPin,
  Briefcase,
  ShieldCheck,
  UserCheck,
  ExternalLink,
  RotateCcw,
} from 'lucide-react';

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
        const matchName = p.name.toLowerCase().includes(q) || (acc.username || '').toLowerCase().includes(q);
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
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-800">
            <Users className="w-4 h-4 text-teal-700" />
            <span>Verified Expat &amp; Retiree Member Directory</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{publicMemberAccounts.length} Registered Members</span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
            Connect with Fellow Expats by Countries Visited, Languages &amp; Interests
          </h2>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            Explore public community profiles of registered members and send personal messages to exchange firsthand advice. Personal financial portfolios and private country shortlists are never displayed publicly.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200/80 shrink-0">
          <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0" />
          <span>Finances &amp; Shortlists Strictly Private</span>
        </div>
      </div>

      {/* Search & Multi-Facet Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-3 shadow-2xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input (5 cols) */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search members by name, country visited, language, or interest..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
            />
          </div>

          {/* Visited Country Filter (3 cols) */}
          <div className="md:col-span-3">
            <select
              value={visitedCountryFilter}
              onChange={e => setVisitedCountryFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
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
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
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
            <button
              type="button"
              onClick={handleResetFilters}
              className="w-full px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>
        </div>

        {/* Relocation Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          {statusOptions.map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === status
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              {status === 'All' ? 'All Relocation Stages' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Member Cards Grid */}
      {filteredMembers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <Users className="w-8 h-8 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900">No member profiles match your filter</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try clearing your search or selecting a different language or visited country filter.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 rounded-xl bg-teal-800 text-white text-xs font-bold hover:bg-teal-900 transition-colors cursor-pointer"
          >
            Show All Public Profiles
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredMembers.map(acc => {
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

            return (
              <div
                key={acc.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 flex flex-col justify-between hover:border-slate-300 transition-all shadow-2xs space-y-4"
              >
                <div className="space-y-4">
                  {/* Top Identity Row */}
                  <div className="flex items-start justify-between gap-3">
                    <div
                      onClick={() => openPublicProfile(acc.id)}
                      className="flex items-center gap-3.5 cursor-pointer group"
                    >
                      {p.avatarUrl ? (
                        <img
                          src={p.avatarUrl}
                          alt={p.name}
                          referrerPolicy="no-referrer"
                          className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shrink-0 group-hover:ring-2 group-hover:ring-teal-600 transition-all"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-teal-800 text-white text-lg font-bold flex items-center justify-center shrink-0">
                          {p.name.charAt(0)}
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-800 transition-colors truncate">
                            {p.name}
                          </h3>
                          {isSelf && (
                            <span className="text-[11px] font-semibold text-teal-700">
                              (You)
                            </span>
                          )}
                        </div>

                        {p.occupationOrBackground && (
                          <p className="text-xs text-slate-600 truncate flex items-center gap-1 mt-0.5">
                            <Briefcase className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{p.occupationOrBackground}</span>
                          </p>
                        )}

                        {/* Unboxed Metadata: Origin & Residing */}
                        <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 mt-1">
                          <span>
                            {getWorldCountryFlag(p.originCountry)} {p.originCountry}
                          </span>
                          <span aria-hidden="true">→</span>
                          <span className="font-semibold text-teal-800">
                            {getWorldCountryFlag(p.residingCountry || p.originCountry)}{' '}
                            {p.originCity ? `${p.originCity}, ` : ''}
                            {p.residingCountry || p.originCountry}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{p.relocationStatus || 'Exploring Options'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  {p.bio && (
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                      {p.bio}
                    </p>
                  )}

                  {/* Countries Visited Strip */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-teal-700" />
                        <span>Countries Visited ({visited.length})</span>
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {p.preferredClimate || 'Mediterranean'} Climate
                      </span>
                    </div>

                    {visited.length === 0 ? (
                      <p className="text-[11px] text-slate-400 italic">
                        Planning initial scouting trips
                      </p>
                    ) : (
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-700">
                        {visited.map((v, idx) => (
                          <React.Fragment key={v.id}>
                            <span className="font-medium">
                              {v.flag || getWorldCountryFlag(v.countryName)} {v.countryName}{' '}
                              <span className="text-slate-400 font-mono text-[11px]">({v.yearVisited})</span>
                            </span>
                            {idx < visited.length - 1 && (
                              <span aria-hidden="true" className="text-slate-300">
                                ·
                              </span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Languages Known & Interests Summary */}
                  <div className="space-y-2 text-xs">
                    {/* Languages Known */}
                    <div className="flex items-start gap-2">
                      <Languages className="w-3.5 h-3.5 text-teal-700 shrink-0 mt-0.5" />
                      <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-slate-600">
                        <span className="font-semibold text-slate-800">Languages:</span>
                        {languages.length === 0 ? (
                          <span>English</span>
                        ) : (
                          languages.map((l, idx) => (
                            <React.Fragment key={l.id}>
                              <span>
                                {l.language} <span className="text-slate-400">({l.proficiency})</span>
                              </span>
                              {idx < languages.length - 1 && (
                                <span aria-hidden="true" className="text-slate-300">
                                  ·
                                </span>
                              )}
                            </React.Fragment>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Interests */}
                    {interests.length > 0 && (
                      <div className="flex items-start gap-2">
                        <Heart className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-slate-600">
                          <span className="font-semibold text-slate-800">Interests:</span>
                          {interests.slice(0, 4).map((interest, idx, arr) => (
                            <React.Fragment key={interest}>
                              <span>{interest}</span>
                              {idx < arr.length - 1 && (
                                <span aria-hidden="true" className="text-slate-300">
                                  ·
                                </span>
                              )}
                            </React.Fragment>
                          ))}
                          {interests.length > 4 && (
                            <span className="text-slate-400">+{interests.length - 4} more</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Footer: View Public Profile & Send Personal Message */}
                <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => openPublicProfile(acc.id)}
                    className="px-3.5 py-2 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                    <span>View Public Profile</span>
                  </button>

                  {!isSelf && (
                    <button
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
                      className="px-4 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer whitespace-nowrap"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>{hasExistingChat ? 'Continue Chat' : 'Send Personal Message'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
