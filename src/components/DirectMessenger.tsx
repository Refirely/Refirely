import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getWorldCountryFlag } from '../data/userAccounts';
import { sortDmThreadsByLatest } from '../utils/messagingMultiUser';
import { DirectMessagesAuthGate } from './DirectMessagesAuthGate';
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
  Bell,
  Volume2,
  VolumeX,
  Sparkles,
  HelpCircle,
  Check,
  ShieldCheck,
  Clock,
  ArrowLeft,
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
    isAuthenticated,
    totalUnreadDms,
    markThreadAsRead,
    markAllThreadsAsRead,
    enablePeerAutoReplies,
    setEnablePeerAutoReplies,
    notificationSoundEnabled,
    setNotificationSoundEnabled,
    simulateIncomingPeerMessage,
    isOwnerAdmin,
    userProfile,
    setCurrentView,
  } = useApp();

  const isAdminUser = isOwnerAdmin || userProfile.role === 'admin' || currentUserId === 'usr-ganesh';

  const [messageInput, setMessageInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showMemberDirectoryStrip, setShowMemberDirectoryStrip] = useState(true);
  const [showExplanation, setShowExplanation] = useState(false);
  const [testNotificationTimer, setTestNotificationTimer] = useState<number | null>(null);

  const sortedThreads = React.useMemo(() => {
    return sortDmThreadsByLatest(dmThreads);
  }, [dmThreads]);

  const activeThread =
    sortedThreads.find(t => t.id === activeDmThreadId) ||
    sortedThreads.find(t => activeDmThreadId && t.peerUserId === activeDmThreadId) ||
    sortedThreads[0];

  // Auto-mark current active conversation as read
  useEffect(() => {
    if (isAuthenticated && currentUserId !== 'guest' && activeThread && (activeThread.unreadCount || 0) > 0) {
      markThreadAsRead(activeThread.id);
    }
  }, [activeThread?.id, activeThread?.unreadCount, markThreadAsRead, isAuthenticated, currentUserId]);

  // Strictly hide chats window if not authenticated
  if (!isAuthenticated || currentUserId === 'guest') {
    return <DirectMessagesAuthGate />;
  }

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeThread) return;

    sendMessage(activeThread.id, messageInput);
    setMessageInput('');
  };

  const handleTriggerDelayedNotification = () => {
    if (!activeThread) return;
    if (testNotificationTimer !== null) return;

    setTestNotificationTimer(3);
    let count = 3;
    const interval = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setTestNotificationTimer(count);
      } else {
        clearInterval(interval);
        setTestNotificationTimer(null);
        simulateIncomingPeerMessage(
          activeThread.id,
          `Hi! I received your inquiry about ${activeThread.peerCity}. Here is a test live notification message from ${activeThread.peerName}!`
        );
      }
    }, 1000);
  };

  const filteredThreads = sortedThreads.filter(t => {
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
          (activeThread.peerUserId && acc.id === activeThread.peerUserId) ||
          acc.profile.name.toLowerCase() === activeThread.peerName.toLowerCase() ||
          acc.name.toLowerCase() === activeThread.peerName.toLowerCase()
      )
    : undefined;

  // Collect peer user IDs and names with whom there is an active conversation already
  const existingChatPeerIds = React.useMemo(() => {
    return new Set(
      dmThreads
        .map(t => t.peerUserId)
        .filter((id): id is string => Boolean(id))
    );
  }, [dmThreads]);

  const existingChatPeerNames = React.useMemo(() => {
    return new Set(
      dmThreads.map(t => t.peerName.trim().toLowerCase())
    );
  }, [dmThreads]);

  // Remove members with whom there is an active chat already from the suggested directory (and never include Admin)
  const connectableMembers = React.useMemo(() => {
    return publicMemberAccounts.filter(acc => {
      if (acc.id === currentUserId) return false;
      if (acc.id === 'usr-ganesh' || acc.profile.role === 'admin' || acc.email?.toLowerCase() === 'ganesh.indireddy@gmail.com') {
        return false;
      }
      if (existingChatPeerIds.has(acc.id)) return false;
      const accProfileName = (acc.profile.name || '').trim().toLowerCase();
      const accName = (acc.name || '').trim().toLowerCase();
      if (accProfileName && existingChatPeerNames.has(accProfileName)) return false;
      if (accName && existingChatPeerNames.has(accName)) return false;
      return true;
    });
  }, [publicMemberAccounts, currentUserId, existingChatPeerIds, existingChatPeerNames]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title & Member Directory Toggle */}
      <div className="pb-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            {isAdminUser && (
              <button
                type="button"
                onClick={() => setCurrentView('admin')}
                className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer mr-1"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-amber-700" />
                <span>Back to Admin Console</span>
              </button>
            )}
            <MessageCircle className="w-6 h-6 text-teal-700" />
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              {isAdminUser ? 'Admin Direct Messaging Console' : 'Expat Peer Messaging & Member Connections'}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {isAdminUser
              ? 'Initiate direct messages with any registered member. Note: Only Admin can initiate conversations with members (not vice versa).'
              : 'Connect authentically with registered expats worldwide. Real-time notification badges update whenever new messages arrive.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowExplanation(prev => !prev)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <HelpCircle className="w-3.5 h-3.5 text-teal-700" />
            <span>Auto-Replies &amp; Notifications Info</span>
          </button>

          <button
            type="button"
            onClick={() => setShowMemberDirectoryStrip(prev => !prev)}
            className="px-3.5 py-2 rounded-xl border border-teal-200 bg-teal-50/70 hover:bg-teal-100 text-teal-900 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-2xs"
          >
            <Users className="w-4 h-4 text-teal-700" />
            <span>
              {showMemberDirectoryStrip
                ? 'Hide Member Directory'
                : `${isAdminUser ? 'Initiate Chat with Member' : 'Suggested Expat Members'} (${connectableMembers.length})`}
            </span>
          </button>
        </div>
      </div>

      {/* Info Panel: Explanation of auto-replies & notification mechanism */}
      {showExplanation && (
        <div className="bg-gradient-to-r from-teal-50 via-emerald-50 to-cyan-50 border border-teal-200 rounded-2xl p-4 sm:p-5 text-xs text-slate-700 space-y-2.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-teal-900 font-bold text-sm">
              <ShieldCheck className="w-4 h-4 text-teal-700" />
              <span>Direct Messaging &amp; Notification Diagnostic</span>
            </div>
            <button
              onClick={() => setShowExplanation(false)}
              className="text-slate-400 hover:text-slate-700 cursor-pointer font-bold px-1"
            >
              ✕
            </button>
          </div>
          <p className="leading-relaxed">
            <strong>Why were you receiving automated replies from any sender?</strong> In previous prototype versions, an automated simulation timer was hardcoded to synthesize canned expat replies after 1.2 seconds on every sent message. That artificial bot behavior is now <strong>disabled by default</strong> so you have genuine, authentic peer conversations without unsolicited phantom messages.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-[11px]">
            <div className="p-2.5 rounded-xl bg-white/80 border border-teal-100 space-y-1">
              <span className="font-bold text-teal-900 flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-600" />
                <span>Authentic Peer Mode (Active)</span>
              </span>
              <p className="text-slate-600">
                Messages to registered community members remain quiet until the real recipient replies. No automatic bot responses interfere.
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-white/80 border border-teal-100 space-y-1">
              <span className="font-bold text-teal-900 flex items-center gap-1">
                <Bell className="w-3 h-3 text-orange-600" />
                <span>Real-Time Notifications &amp; Badges</span>
              </span>
              <p className="text-slate-600">
                Whenever a message arrives while you are elsewhere in the app (exploring havens, viewing compare charts, or on dashboard), an in-app toast notification pops up and the chat bubble in the top navbar pulses with the unread count!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Control Strip: Testing Mode, Simulate Reply & Notification Trigger */}
      <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-3 sm:p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="font-bold text-slate-800 flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${enablePeerAutoReplies ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
            <span>Messaging Mode:</span>
            <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
              enablePeerAutoReplies
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
            }`}>
              {enablePeerAutoReplies ? 'Simulated Bot Replies (ON)' : 'Authentic Peer Chat (Auto-Replies OFF)'}
            </span>
          </span>

          <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 hover:text-slate-900 select-none">
            <input
              type="checkbox"
              checked={enablePeerAutoReplies}
              onChange={e => setEnablePeerAutoReplies(e.target.checked)}
              className="rounded text-teal-700 focus:ring-teal-500 h-3.5 w-3.5 cursor-pointer"
            />
            <span className="text-[11px] font-medium">Enable simulated replies for test</span>
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => setNotificationSoundEnabled(!notificationSoundEnabled)}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              notificationSoundEnabled
                ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-2xs'
                : 'bg-slate-100 border-slate-200 text-slate-400 hover:text-slate-600'
            }`}
            title={notificationSoundEnabled ? 'Notification chime sound is ON' : 'Notification chime is MUTED'}
          >
            {notificationSoundEnabled ? <Volume2 className="w-3.5 h-3.5 text-teal-700" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="text-[11px]">{notificationSoundEnabled ? 'Chime ON' : 'Muted'}</span>
          </button>

          {/* Simulate Immediate Reply */}
          {activeThread && (
            <button
              type="button"
              onClick={() => simulateIncomingPeerMessage(activeThread.id)}
              className="px-2.5 py-1.5 rounded-lg border border-teal-200 bg-teal-50 hover:bg-teal-100 text-teal-900 text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              title={`Simulate an incoming message reply from ${activeThread.peerName}`}
            >
              <Sparkles className="w-3 h-3 text-teal-700" />
              <span>Simulate Reply from {activeThread.peerName.split(' ')[0]}</span>
            </button>
          )}

          {/* Delayed Notification Test */}
          {activeThread && (
            <button
              type="button"
              onClick={handleTriggerDelayedNotification}
              disabled={testNotificationTimer !== null}
              className="px-2.5 py-1.5 rounded-lg border border-orange-200 bg-orange-50 hover:bg-orange-100 text-orange-950 text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
              title="Triggers an incoming message in 3 seconds so you can switch views and observe the notification toast and navbar badge"
            >
              <Bell className="w-3 h-3 text-orange-600" />
              <span>
                {testNotificationTimer !== null
                  ? `Triggering in ${testNotificationTimer}s (switch pages now!)`
                  : 'Test In-App Alert (3s delay)'}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Main Messenger Box (Conversations & Active Chat at the Top) */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs grid grid-cols-1 md:grid-cols-12 min-h-[580px]">
        {/* Left Sidebar: Threads List (col-span-4) */}
        <div className="md:col-span-4 border-r border-slate-200 flex flex-col bg-slate-50/50">
          {/* Header with Title, Unread Count & Mark All Read */}
          <div className="p-3 bg-white border-b border-slate-200 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-900">Conversations</span>
              <span className="text-[10px] font-semibold text-slate-400 font-mono">
                ({dmThreads.length})
              </span>
              {totalUnreadDms > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-orange-600 text-white shadow-2xs">
                  {totalUnreadDms} unread
                </span>
              )}
            </div>

            {totalUnreadDms > 0 && (
              <button
                type="button"
                onClick={markAllThreadsAsRead}
                className="text-[10px] font-bold text-teal-700 hover:text-teal-900 hover:underline cursor-pointer"
              >
                Mark all read
              </button>
            )}
          </div>

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

          {/* Threads List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredThreads.map(thread => {
              const isActive = thread.id === activeThread?.id;
              const hasUnread = (thread.unreadCount || 0) > 0;
              const peerAccount = publicMemberAccounts.find(
                acc =>
                  (thread.peerUserId && acc.id === thread.peerUserId) ||
                  acc.profile.name.toLowerCase() === thread.peerName.toLowerCase() ||
                  acc.name.toLowerCase() === thread.peerName.toLowerCase()
              );
              const displayAvatar = peerAccount?.profile.avatarUrl || thread.peerAvatar;

              return (
                <button
                  key={thread.id}
                  onClick={() => {
                    setActiveDmThreadId(thread.id);
                    if (hasUnread) {
                      markThreadAsRead(thread.id);
                    }
                  }}
                  className={`w-full p-3.5 text-left transition-colors flex items-start gap-3 cursor-pointer ${
                    isActive
                      ? 'bg-teal-50/90 ring-1 ring-inset ring-teal-200'
                      : hasUnread
                      ? 'bg-teal-50/40 hover:bg-teal-50/70'
                      : 'hover:bg-slate-100/70'
                  }`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={displayAvatar}
                      alt={thread.peerName}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-full object-cover border border-slate-200"
                    />
                    {hasUnread && (
                      <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-orange-600 ring-2 ring-white" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4
                        className={`text-xs truncate ${
                          hasUnread ? 'font-extrabold text-teal-950' : 'font-bold text-slate-900'
                        }`}
                      >
                        {thread.peerName}
                      </h4>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] text-slate-400 font-mono tabular-nums">
                          {thread.lastMessageTime}
                        </span>
                        {hasUnread && (
                          <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-orange-600 text-[9px] font-extrabold text-white px-1 shadow-2xs">
                            {thread.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-[11px] text-teal-800 font-medium truncate mt-0.5">
                      {getWorldCountryFlag(thread.peerCountry)} {thread.peerCity}, {thread.peerCountry}
                    </div>

                    <p
                      className={`text-xs truncate mt-1 ${
                        hasUnread ? 'font-semibold text-slate-900' : 'text-slate-500'
                      }`}
                    >
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
                    src={activePeerMember?.profile.avatarUrl || activeThread.peerAvatar}
                    alt={activeThread.peerName}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-full object-cover border border-slate-200 group-hover:ring-2 group-hover:ring-teal-600 transition-all"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-teal-800 transition-colors flex items-center gap-1.5">
                      <span>{activeThread.peerName}</span>
                      <span className="text-sm">{getWorldCountryFlag(activeThread.peerCountry)}</span>
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
                    onClick={() => simulateIncomingPeerMessage(activeThread.id)}
                    className="text-xs text-teal-800 bg-teal-50 hover:bg-teal-100 font-semibold px-2.5 py-1.5 rounded-lg border border-teal-200 flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-2xs"
                    title={`Trigger a simulated peer response from ${activeThread.peerName}`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-teal-700" />
                    <span>Simulate Reply</span>
                  </button>

                  {activePeerMember && (
                    <button
                      type="button"
                      onClick={() => openPublicProfile(activePeerMember.id)}
                      className="text-xs text-slate-700 hover:text-slate-900 font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                    >
                      <User className="w-3.5 h-3.5 text-teal-700" />
                      <span>View Profile</span>
                    </button>
                  )}

                  {!isAdminUser && (
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
                      Country Guide
                    </button>
                  )}
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
                  <span className="text-[11px] text-slate-400 bg-white/70 px-3 py-1 rounded-full border border-slate-200/70">
                    Direct conversation · Verified expat community member
                  </span>
                </div>

                {activeThread.messages.map(msg => {
                  const isMe = msg.senderUserId ? msg.senderUserId === currentUserId : msg.sender === 'user';
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
              <div className="border-t border-slate-200 bg-white">
                <form
                  onSubmit={handleSend}
                  className="p-3.5 flex items-center gap-2"
                >
                  <input
                    type="text"
                    placeholder={`Send a personal message to ${activeThread.peerName} about life in ${activeThread.peerCity}...`}
                    value={messageInput}
                    onChange={e => setMessageInput(e.target.value)}
                    className="flex-1 px-3.5 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                  />
                  <button
                    type="submit"
                    disabled={!messageInput.trim()}
                    className="px-4 py-2 bg-teal-800 text-white font-semibold text-xs sm:text-sm rounded-lg hover:bg-teal-900 transition-colors disabled:opacity-50 flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send</span>
                  </button>
                </form>

                <div className="px-4 pb-2 text-[10px] text-slate-400 flex items-center justify-between">
                  <span>
                    {enablePeerAutoReplies
                      ? 'Simulated peer auto-replies are ON (testing mode active)'
                      : 'Authentic messaging mode: peer auto-replies are OFF'}
                  </span>
                  <span>Enter ↵ to send</span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-center text-slate-400 text-xs">
              Select a conversation from the sidebar or choose a suggested member below to start chatting.
            </div>
          )}
        </div>
      </div>

      {/* Registered Expat Members Section (Below Conversations Window, excluding active chats) */}
      {showMemberDirectoryStrip && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 space-y-3 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-teal-700" />
                <span>Registered Expat Members — Discover &amp; Connect Directly ({connectableMembers.length})</span>
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Suggested members you haven&apos;t messaged yet. Starting a chat will move them into your active Conversations list above.
              </p>
            </div>
            {connectableMembers.length > 0 && (
              <span className="text-[11px] font-semibold text-teal-800 bg-teal-50 border border-teal-200/80 px-2.5 py-1 rounded-lg shrink-0 self-start sm:self-auto">
                {connectableMembers.length} {connectableMembers.length === 1 ? 'member' : 'members'} available to connect
              </span>
            )}
          </div>

          {connectableMembers.length === 0 ? (
            <div className="p-6 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-1.5">
              <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center mx-auto">
                <Users className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold text-slate-800">
                You have active conversations with all registered members!
              </p>
              <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                Every registered community member is already in your Conversations list above. Select their thread from the sidebar to continue chatting.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
              {connectableMembers.map(acc => {
                const p = acc.profile;
                const visitedCount = (p.travelHistory || []).length;
                const langSummary = (p.languagesKnown || [])
                  .map(l => l.language)
                  .slice(0, 2)
                  .join(', ');

                return (
                  <div
                    key={acc.id}
                    className="p-3.5 rounded-xl border bg-slate-50/70 border-slate-200 hover:border-slate-300 transition-all flex flex-col justify-between gap-3 shadow-2xs"
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
                          {p.residingCountry || p.originCountry}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate mt-0.5">
                          {visitedCount} countries visited · {langSummary || 'English'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60">
                      <button
                        type="button"
                        onClick={() => openPublicProfile(acc.id)}
                        className="flex-1 py-1 px-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                      >
                        <User className="w-3 h-3 text-teal-700" />
                        <span>View Profile</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          startDmWithPeer(
                            p.name,
                            p.residingCountry || p.targetCountry || 'Portugal',
                            p.originCity || 'Expat Hub',
                            undefined,
                            {
                              peerAvatar: p.avatarUrl,
                              peerStatus: p.relocationStatus || 'Registered Member',
                              peerUserId: acc.id,
                            }
                          )
                        }
                        className="flex-1 py-1 px-2 rounded-lg bg-teal-800 hover:bg-teal-900 text-white text-[11px] font-semibold flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-2xs"
                      >
                        <MessageCircle className="w-3 h-3" />
                        <span>Start Chat</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
