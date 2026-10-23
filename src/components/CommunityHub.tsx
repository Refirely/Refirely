import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MessageSquare, ThumbsUp, Send, Plus, Search, X, Users, MessageCircle, ExternalLink } from 'lucide-react';
import { CommunityThread } from '../types';
import { PublicMemberDirectory } from './PublicMemberDirectory';

export const CommunityHub: React.FC = () => {
  const {
    threads,
    addThread,
    addComment,
    toggleUpvoteThread,
    countries,
    userProfile,
    publicMemberAccounts,
    openPublicProfile,
    startDmWithPeer,
    isAuthenticated,
    openAuthModal,
  } = useApp();

  const [activeCommunityTab, setActiveCommunityTab] = useState<'discussions' | 'members'>('discussions');
  const [selectedCountryFilter, setSelectedCountryFilter] = useState<string>('All');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Expanded thread for full comments view
  const [expandedThreadId, setExpandedThreadId] = useState<string | null>(null);
  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});

  // New discussion modal state
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newCountryId, setNewCountryId] = useState(countries[0]?.id || 'portugal');
  const [newCategory, setNewCategory] = useState<CommunityThread['category']>('General Expat Life');
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  const categories = [
    'All',
    'Visas & Paperwork',
    'Cost of Living',
    'Housing & Real Estate',
    'Healthcare',
    'Dating & Nightlife',
    'General Expat Life',
  ];

  const filteredThreads = threads.filter(t => {
    if (selectedCountryFilter !== 'All' && t.countryId !== selectedCountryFilter) {
      return false;
    }
    if (selectedCategoryFilter !== 'All' && t.category !== selectedCategoryFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.content.toLowerCase().includes(q) ||
        t.authorName.toLowerCase().includes(q) ||
        t.countryName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCreateThread = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const matchedCountry = countries.find(c => c.id === newCountryId);

    addThread({
      countryId: newCountryId,
      countryName: matchedCountry?.name || 'Global',
      category: newCategory,
      title: newTitle.trim(),
      content: newContent.trim(),
      authorName: userProfile.name,
      authorLocation: `Prospective retiree (${userProfile.targetCountry})`,
      authorAvatar: userProfile.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    });

    setNewTitle('');
    setNewContent('');
    setIsNewModalOpen(false);
  };

  const handlePostReply = (threadId: string) => {
    const text = replyTextMap[threadId];
    if (!text || !text.trim()) return;

    addComment(threadId, text);
    setReplyTextMap(prev => ({ ...prev, [threadId]: '' }));
  };

  // Helper to check if an author name matches a public member profile
  const findMemberForAuthor = (authorName: string) => {
    const clean = (authorName || '').trim().toLowerCase();
    return publicMemberAccounts.find(acc => {
      const nameLower = acc.profile.name.toLowerCase();
      const parts = nameLower.split(' ');
      return (
        nameLower === clean ||
        (parts.length >= 2 && clean.includes(parts[0]) && clean.includes(parts[parts.length - 1]))
      );
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-orange-600" />
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Retiree &amp; Expat Community Hub
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Exchange firsthand guidance on visas, housing, healthcare, and connect directly with verified expat members.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() =>
              setActiveCommunityTab(activeCommunityTab === 'members' ? 'discussions' : 'members')
            }
            className="px-3.5 py-2 text-xs font-bold rounded-xl border border-teal-200 bg-teal-50/70 text-teal-900 hover:bg-teal-100 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <Users className="w-4 h-4 text-teal-700" />
            <span>
              {activeCommunityTab === 'members'
                ? 'Back to Discussions'
                : `Member Profiles (${publicMemberAccounts.length})`}
            </span>
          </button>

          <button
            onClick={() => setIsNewModalOpen(true)}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-orange-600 via-amber-600 to-purple-600 text-white hover:from-orange-700 hover:to-purple-700 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Ask a Question / Post</span>
          </button>
        </div>
      </div>

      {/* Segmented View Switcher: Discussions vs. Public Member Directory */}
      <div className="mt-5 mb-6 flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-xl w-fit">
        <button
          onClick={() => setActiveCommunityTab('discussions')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeCommunityTab === 'discussions'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5 text-orange-600" />
          <span>Discussion Forum ({threads.length})</span>
        </button>

        <button
          onClick={() => setActiveCommunityTab('members')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeCommunityTab === 'members'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-teal-700" />
          <span>Public Member Profiles ({publicMemberAccounts.length})</span>
        </button>
      </div>

      {activeCommunityTab === 'members' ? (
        <PublicMemberDirectory />
      ) : (
        <>
          {/* Filter and Search Bar */}
          <div className="my-6 space-y-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search discussions by keywords, questions, or towns..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                />
              </div>

              {/* Country filter dropdown */}
              <div className="w-full sm:w-56">
                <select
                  value={selectedCountryFilter}
                  onChange={e => setSelectedCountryFilter(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                >
                  <option value="All">All Countries (Global)</option>
                  {countries.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.flag} {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategoryFilter(cat)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                    selectedCategoryFilter === cat
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Thread List */}
          <div className="space-y-4">
            {filteredThreads.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
                <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-slate-800">No discussions match your filter</h3>
                <p className="text-xs text-slate-500 mt-1 mb-4">
                  Try adjusting your search keywords or start a new thread for this country.
                </p>
                <button
                  onClick={() => setIsNewModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-orange-600 to-purple-600 text-white text-xs font-medium hover:from-orange-700 hover:to-purple-700 shadow-2xs"
                >
                  Post First Discussion
                </button>
              </div>
            ) : (
              filteredThreads.map(thread => {
                const isExpanded = expandedThreadId === thread.id;
                const matchedAuthorMember = findMemberForAuthor(thread.authorName);

                return (
                  <article
                    key={thread.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 transition-shadow hover:shadow-xs"
                  >
                    {/* Thread Header */}
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex items-center gap-3">
                        <img
                          src={thread.authorAvatar}
                          alt={thread.authorName}
                          referrerPolicy="no-referrer"
                          onClick={() => matchedAuthorMember && openPublicProfile(matchedAuthorMember.id)}
                          className={`w-10 h-10 rounded-full object-cover border border-slate-200 ${
                            matchedAuthorMember ? 'cursor-pointer hover:ring-2 hover:ring-teal-600 transition-all' : ''
                          }`}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                matchedAuthorMember
                                  ? openPublicProfile(matchedAuthorMember.id)
                                  : setActiveCommunityTab('members')
                              }
                              className="text-sm font-bold text-slate-900 hover:text-teal-800 transition-colors cursor-pointer text-left"
                            >
                              {thread.authorName}
                            </button>
                            {matchedAuthorMember && (
                              <button
                                type="button"
                                onClick={() => openPublicProfile(matchedAuthorMember.id)}
                                className="text-[11px] font-semibold text-teal-700 hover:underline flex items-center gap-0.5 cursor-pointer"
                              >
                                <span>Public Profile</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </button>
                            )}
                          </div>
                          {/* Clean unboxed metadata with typographic separators */}
                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                            <span className="font-semibold text-orange-900">{thread.countryName}</span>
                            <span aria-hidden="true">·</span>
                            <span>{thread.category}</span>
                            <span aria-hidden="true">·</span>
                            <span>{thread.createdAt}</span>
                          </div>
                        </div>
                      </div>

                      {/* Upvote Button */}
                      <button
                        onClick={() => toggleUpvoteThread(thread.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                          thread.hasUpvoted
                            ? 'bg-orange-50 text-orange-900 border-orange-300'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                        title="Upvote this discussion"
                      >
                        <ThumbsUp className={`w-3.5 h-3.5 ${thread.hasUpvoted ? 'fill-orange-600 text-orange-600' : ''}`} />
                        <span className="font-mono tabular-nums">{thread.upvotes}</span>
                      </button>
                    </div>

                    {/* Thread Title & Content */}
                    <h3 className="text-base font-bold text-slate-900 mt-3 mb-2 leading-snug">
                      {thread.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                      {thread.content}
                    </p>

                    {/* Footer and Comment Toggle */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                      <span className="text-[11px] text-slate-400">
                        Location: {thread.authorLocation}
                      </span>

                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          onClick={() => {
                            if (!isAuthenticated) {
                              openAuthModal('login');
                              return;
                            }
                            startDmWithPeer(
                              matchedAuthorMember?.profile.name || thread.authorName,
                              matchedAuthorMember?.profile.residingCountry || thread.countryName,
                              matchedAuthorMember?.profile.originCity || thread.authorLocation,
                              undefined,
                              {
                                peerAvatar: matchedAuthorMember?.profile.avatarUrl || thread.authorAvatar,
                                peerStatus: matchedAuthorMember?.profile.relocationStatus || thread.authorLocation,
                                peerUserId: matchedAuthorMember?.id,
                              }
                            );
                          }}
                          className="font-semibold text-teal-800 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-teal-700" />
                          <span>Message {thread.authorName.split(' ')[0]}</span>
                        </button>

                        <button
                          onClick={() => setExpandedThreadId(isExpanded ? null : thread.id)}
                          className="font-semibold text-orange-800 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-orange-600" />
                          <span>{thread.comments.length} Comments {isExpanded ? '▲' : '▼'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Expanded Comments Tree */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-slate-100 space-y-3 bg-slate-50/70 -mx-5 -mb-5 p-5 rounded-b-xl">
                        <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                          Responses &amp; Advice ({thread.comments.length})
                        </h5>

                        {thread.comments.length === 0 ? (
                          <p className="text-xs text-slate-500 italic">
                            No responses yet. Add the first helpful comment below!
                          </p>
                        ) : (
                          thread.comments.map(c => {
                            const commentMember = findMemberForAuthor(c.authorName);
                            return (
                              <div key={c.id} className="p-3 bg-white rounded-lg border border-slate-200 text-xs space-y-1">
                                <div className="flex items-center justify-between text-slate-500">
                                  <button
                                    type="button"
                                    onClick={() => commentMember && openPublicProfile(commentMember.id)}
                                    className={`font-bold text-slate-900 ${
                                      commentMember ? 'hover:text-teal-800 hover:underline cursor-pointer' : ''
                                    }`}
                                  >
                                    {c.authorName}
                                  </button>
                                  <span className="text-[11px]">{c.createdAt}</span>
                                </div>
                                <span className="text-[11px] text-slate-400 block">{c.authorLocation}</span>
                                <p className="text-slate-700 leading-relaxed pt-1">{c.text}</p>
                              </div>
                            );
                          })
                        )}

                        {/* Write comment input */}
                        <div className="flex gap-2 pt-2">
                          <input
                            type="text"
                            placeholder="Write a helpful reply..."
                            value={replyTextMap[thread.id] || ''}
                            onChange={e => setReplyTextMap({ ...replyTextMap, [thread.id]: e.target.value })}
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handlePostReply(thread.id);
                              }
                            }}
                            className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                          />
                          <button
                            onClick={() => handlePostReply(thread.id)}
                            className="px-4 py-2 bg-gradient-to-r from-orange-600 to-purple-600 text-white rounded-xl text-xs font-semibold hover:from-orange-700 hover:to-purple-700 transition-all flex items-center gap-1 shrink-0 shadow-2xs"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Reply</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })
            )}
          </div>
        </>
      )}


      {/* Modal: Create New Discussion */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">Start a New Discussion</h3>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateThread} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Target Country</label>
                  <select
                    value={newCountryId}
                    onChange={e => setNewCountryId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    {countries.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.flag} {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Topic Category</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as CommunityThread['category'])}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    {categories.filter(c => c !== 'All').map(cat => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Question / Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., How difficult is the bank deposit requirement in Chiang Mai?"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Details & Context</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Provide background on your retirement timeline, budget, and specific questions..."
                  value={newContent}
                  onChange={e => setNewContent(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-orange-600 via-amber-600 to-purple-600 text-white hover:from-orange-700 hover:to-purple-700 transition-all shadow-xs"
                >
                  Publish Discussion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
