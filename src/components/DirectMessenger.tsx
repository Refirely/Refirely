import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getWorldCountryFlag } from '../data/userAccounts';
import {
  MessageCircle,
  Send,
  CheckCheck,
  User,
  Search,
  Users,
  ExternalLink,
  Globe,
  Languages,
} from 'lucide-react';

export const DirectMessenger: React.FC = () => {
  const {
    dmThreads,
    activeDmThreadId,
    setActiveDmThreadId,
    sendMessage,
    startDmWithPeer,
    navigateToCountry,
    countries,
    publicMemberAccounts,
    openPublicProfile,
    currentUserId,
  } = useApp();

  const [messageInput, setMessageInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showMemberDirectoryStrip, setShowMemberDirectoryStrip] = useState(true);

  const activeThread = dmThreads.find(t => t.id === activeDmThreadId) || dmThreads[0];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeThread) return;

    sendMessage(activeThread.id, messageInput);
    setMessageInput('');
  };

  const filteredThreads = dmThreads.filter(t => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      t.peerName.toLowerCase().includes(q) ||
      t.peerCountry.toLowerCase().includes(q) ||
      t.peerCity.toLowerCase().includes(q)
    );
  });

  // Match active thread to a registered non-admin public member account
  const activePeerMember = activeThread
    ? publicMemberAccounts.find(
        acc =>
          acc.id === activeThread.peerUserId ||
          acc.profile.name.toLowerCase() === activeThread.peerName.toLowerCase() ||
          acc.profile.name.toLowerCase().includes(activeThread.peerName.toLowerCase())
      )
    : undefined;

  const connectableMembers = publicMemberAccounts.filter(acc => acc.id !== currentUserId);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title & Member Directory Toggle */}
      <div className="pb-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-teal-700" />
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Expat Peer Messaging &amp; Member Connections
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Inspect public member profiles (countries visited, languages, interests) and send personal messages to connect.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowMemberDirectoryStrip(prev => !prev)}
          className="px-3.5 py-2 rounded-xl border border-teal-200 bg-teal-50/70 hover:bg-teal-100 text-teal-900 text-xs font-bold transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer whitespace-nowrap"
        >
          <Users className="w-4 h-4 text-teal-700" />
          <span>
            {showMemberDirectoryStrip
              ? 'Hide Member Directory Strip'
              : `Browse Registered Members (${connectableMembers.length})`}
          </span>
        </button>
      </div>

      {/* Registered Members Quick-Connect Strip (Excludes Admins) */}
      {showMemberDirectoryStrip && connectableMembers.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-teal-700" />
                <span>Registered Expat Members — View Public Profile or Message Directly</span>
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Click any member to inspect their visited countries, languages known, and interests, or start a personal chat.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {connectableMembers.map(acc => {
              const p = acc.profile;
              const visitedCount = (p.travelHistory || []).length;
              const langSummary = (p.languagesKnown || [])
                .map(l => l.language)
                .slice(0, 2)
                .join(', ');
              const isCurrentChat =
                activeThread &&
                (activeThread.peerUserId === acc.id ||
                  activeThread.peerName.toLowerCase() === p.name.toLowerCase());

              return (
                <div
                  key={acc.id}
                  className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                    isCurrentChat
                      ? 'bg-teal-50/60 border-teal-300'
                      : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={p.avatarUrl}
                      alt={p.name}
                      referrerPolicy="no-referrer"
                      onClick={() => openPublicProfile(acc.id)}
                      className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0 cursor-pointer hover:ring-2 hover:ring-teal-600 transition-all"
                    />
                    <div className="min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => openPublicProfile(acc.id)}
                        className="text-xs font-bold text-slate-900 hover:text-teal-800 truncate block text-left cursor-pointer"
                      >
                        {p.name}
                      </button>
                      <div className="text-[11px] text-teal-800 font-medium truncate">
                        {getWorldCountryFlag(p.residingCountry || p.originCountry)}{' '}
                        {p.originCity ? `${p.originCity}, ` : ''}
                        {p.residingCountry || p.originCountry}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Globe className="w-3 h-3 text-slate-400" />
                          <span>{visitedCount} visited</span>
                        </span>
                        {langSummary && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="truncate">{langSummary}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/70">
                    <button
                      type="button"
                      onClick={() => openPublicProfile(acc.id)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap"
                    >
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                      <span>Public Profile</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
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
                        )
                      }
                      className="px-3 py-1.5 rounded-lg bg-teal-800 hover:bg-teal-900 text-white text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap"
                    >
                      <MessageCircle className="w-3 h-3" />
                      <span>{isCurrentChat ? 'Active Chat' : 'Message'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Messenger Box */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs grid grid-cols-1 md:grid-cols-12 min-h-[580px]">
        {/* Left Sidebar: Threads List (col-span-4) */}
        <div className="md:col-span-4 border-r border-slate-200 flex flex-col bg-slate-50/50">
          {/* Search bar */}
          <div className="p-3 border-b border-slate-200 bg-white">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
              />
            </div>
          </div>

          {/* Threads */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredThreads.map(thread => {
              const isActive = thread.id === activeThread?.id;
              return (
                <button
                  key={thread.id}
                  onClick={() => setActiveDmThreadId(thread.id)}
                  className={`w-full p-3.5 text-left transition-colors flex items-start gap-3 cursor-pointer ${
                    isActive
                      ? 'bg-teal-50/90 ring-1 ring-inset ring-teal-200'
                      : 'hover:bg-slate-100/70'
                  }`}
                >
                  <img
                    src={thread.peerAvatar}
                    alt={thread.peerName}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-200"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {thread.peerName}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-mono tabular-nums">
                        {thread.lastMessageTime}
                      </span>
                    </div>

                    <div className="text-[11px] text-teal-800 font-medium truncate mt-0.5">
                      {thread.peerCity}, {thread.peerCountry}
                    </div>

                    <p className="text-xs text-slate-500 truncate mt-1">
                      {thread.lastMessage}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Chat View (col-span-8) */}
        <div className="md:col-span-8 flex flex-col justify-between bg-white">
          {activeThread ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-white">
                <div
                  onClick={() =>
                    openPublicProfile(activePeerMember?.id || activeThread.peerUserId || activeThread.peerName)
                  }
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <img
                    src={activeThread.peerAvatar}
                    alt={activeThread.peerName}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-full object-cover border border-slate-200 group-hover:ring-2 group-hover:ring-teal-600 transition-all"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-teal-800 transition-colors flex items-center gap-1.5">
                      <span>{activeThread.peerName}</span>
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="text-teal-700 font-medium">
                        {activeThread.peerCity}, {activeThread.peerCountry}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{activeThread.peerStatus}</span>
                      {activePeerMember && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>
                            {(activePeerMember.profile.travelHistory || []).length} countries visited
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      openPublicProfile(activePeerMember?.id || activeThread.peerUserId || activeThread.peerName)
                    }
                    className="text-xs text-slate-700 hover:text-slate-900 font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    <User className="w-3.5 h-3.5 text-teal-700" />
                    <span>View Public Profile</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const matched = countries.find(
                        c => c.name.toLowerCase() === activeThread.peerCountry.toLowerCase()
                      );
                      if (matched) navigateToCountry(matched.id);
                    }}
                    className="text-xs text-teal-700 hover:text-teal-900 font-semibold px-2.5 py-1.5 rounded-lg border border-teal-200 hover:bg-teal-50 cursor-pointer whitespace-nowrap"
                  >
                    View Country Guide
                  </button>
                </div>
              </div>

              {/* Quick Public Profile Summary Bar inside Active Chat */}
              {activePeerMember && (
                <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5 text-teal-700" />
                      <span>Visited:</span>
                      <strong className="text-slate-800">
                        {(activePeerMember.profile.travelHistory || [])
                          .map(v => `${v.flag || ''} ${v.countryName}`)
                          .join(', ') || activePeerMember.profile.residingCountry}
                      </strong>
                    </span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span className="flex items-center gap-1">
                      <Languages className="w-3.5 h-3.5 text-teal-700" />
                      <span>Languages:</span>
                      <strong className="text-slate-800">
                        {(activePeerMember.profile.languagesKnown || [])
                          .map(l => `${l.language} (${l.proficiency})`)
                          .join(', ')}
                      </strong>
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => openPublicProfile(activePeerMember.id)}
                    className="text-[11px] font-bold text-teal-700 hover:underline cursor-pointer whitespace-nowrap"
                  >
                    See Interests &amp; Travel Notes →
                  </button>
                </div>
              )}

              {/* Message History */}
              <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/40">
                <div className="text-center my-2">
                  <span className="text-[11px] text-slate-400">
                    Direct conversation · Verified expat community member
                  </span>
                </div>

                {activeThread.messages.map(msg => {
                  const isMe = msg.sender === 'user';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                          isMe
                            ? 'bg-teal-800 text-white rounded-br-none shadow-xs'
                            : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-xs'
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 font-mono tabular-nums flex items-center gap-1">
                        {msg.timestamp}
                        {isMe && <CheckCheck className="w-3 h-3 text-teal-600" />}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Message Input Bar */}
              <form
                onSubmit={handleSend}
                className="p-3.5 border-t border-slate-200 bg-white flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder={`Send a personal message to ${activeThread.peerName} about countries visited, languages, or daily life...`}
                  value={messageInput}
                  onChange={e => setMessageInput(e.target.value)}
                  className="flex-1 px-3.5 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                />
                <button
                  type="submit"
                  disabled={!messageInput.trim()}
                  className="px-4 py-2 bg-teal-800 text-white font-semibold text-xs sm:text-sm rounded-lg hover:bg-teal-900 transition-colors disabled:opacity-50 flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Send</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-center text-slate-400 text-xs">
              Select a conversation from the sidebar or click a member above to start chatting.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

