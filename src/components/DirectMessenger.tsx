import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MessageCircle, Send, CheckCheck, User, Search, MapPin, Sparkles } from 'lucide-react';

export const DirectMessenger: React.FC = () => {
  const {
    dmThreads,
    activeDmThreadId,
    setActiveDmThreadId,
    sendMessage,
    navigateToCountry,
    countries,
  } = useApp();

  const [messageInput, setMessageInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

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

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Title */}
      <div className="pb-6 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-6 h-6 text-teal-700" />
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Expat Peer Messaging & Connections
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Chat directly with verified resident retirees and fellow prospective movers in your target destinations.
        </p>
      </div>

      {/* Main Messenger Box */}
      <div className="mt-6 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs grid grid-cols-1 md:grid-cols-12 min-h-[580px]">
        
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
                  className={`w-full p-3.5 text-left transition-colors flex items-start gap-3 ${
                    isActive ? 'bg-teal-50/80 border-l-4 border-l-teal-600' : 'hover:bg-slate-100/70'
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
                      <span className="text-[10px] text-slate-400 font-mono">
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
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                  <img
                    src={activeThread.peerAvatar}
                    alt={activeThread.peerName}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {activeThread.peerName}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="text-teal-700 font-medium">{activeThread.peerCity}, {activeThread.peerCountry}</span>
                      <span aria-hidden="true">·</span>
                      <span>{activeThread.peerStatus}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const matched = countries.find(c => c.name.toLowerCase() === activeThread.peerCountry.toLowerCase());
                      if (matched) navigateToCountry(matched.id);
                    }}
                    className="text-xs text-teal-700 hover:text-teal-900 font-semibold px-2.5 py-1 rounded-md border border-teal-200 hover:bg-teal-50"
                  >
                    View Country Guide
                  </button>
                </div>
              </div>

              {/* Message History */}
              <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/40">
                <div className="text-center my-2">
                  <span className="text-[11px] text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                    Direct conversation started · Verified resident expat
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
                      <span className="text-[10px] text-slate-400 mt-1 font-mono flex items-center gap-1">
                        {msg.timestamp}
                        {isMe && <CheckCheck className="w-3 h-3 text-teal-600" />}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Message Input Bar */}
              <form onSubmit={handleSend} className="p-3.5 border-t border-slate-200 bg-white flex items-center gap-2">
                <input
                  type="text"
                  placeholder={`Ask ${activeThread.peerName} about housing, healthcare, or daily life...`}
                  value={messageInput}
                  onChange={e => setMessageInput(e.target.value)}
                  className="flex-1 px-3.5 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                />
                <button
                  type="submit"
                  disabled={!messageInput.trim()}
                  className="px-4 py-2 bg-teal-800 text-white font-semibold text-xs sm:text-sm rounded-lg hover:bg-teal-900 transition-colors disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                >
                  <Send className="w-4 h-4" />
                  <span>Send</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-center text-slate-400 text-xs">
              Select a conversation from the sidebar to chat with fellow retirees.
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
