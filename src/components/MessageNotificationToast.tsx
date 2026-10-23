import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { getWorldCountryFlag } from '../data/userAccounts';
import { MessageCircle, X, ArrowRight, Volume2, VolumeX, Bell } from 'lucide-react';

export const MessageNotificationToast: React.FC = () => {
  const {
    incomingNotification,
    dismissNotification,
    setCurrentView,
    setActiveDmThreadId,
    markThreadAsRead,
    notificationSoundEnabled,
    setNotificationSoundEnabled,
    isAuthenticated,
    currentUserId,
  } = useApp();

  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!isAuthenticated || currentUserId === 'guest' || !incomingNotification) {
      setProgress(100);
      return;
    }

    setProgress(100);
    const totalDuration = 7000; // 7 seconds
    const intervalTime = 100;
    const step = (intervalTime / totalDuration) * 100;

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev <= step) {
          clearInterval(timer);
          dismissNotification();
          return 0;
        }
        return prev - step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [incomingNotification, dismissNotification, isAuthenticated, currentUserId]);

  if (!isAuthenticated || currentUserId === 'guest' || !incomingNotification) return null;

  const handleOpenChat = () => {
    const threadId = incomingNotification.threadId;
    markThreadAsRead(threadId);
    setActiveDmThreadId(threadId);
    setCurrentView('messages');
    dismissNotification();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      role="alert"
      aria-live="polite"
      className="fixed top-20 right-4 sm:right-6 z-50 max-w-sm w-[calc(100vw-2rem)] sm:w-96 bg-white rounded-2xl border border-teal-200/90 shadow-2xl overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-top-4"
    >
      {/* Top Accent Strip with Sound & Close */}
      <div className="bg-gradient-to-r from-teal-800 to-emerald-800 px-4 py-2.5 flex items-center justify-between text-white">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
          </span>
          <span className="text-xs font-bold tracking-wide flex items-center gap-1.5">
            <MessageCircle className="w-3.5 h-3.5 text-teal-200" />
            <span>New Peer Expat Message</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setNotificationSoundEnabled(!notificationSoundEnabled)}
            title={notificationSoundEnabled ? 'Mute notification chimes' : 'Enable notification chimes'}
            className="p-1 rounded-md text-teal-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label={notificationSoundEnabled ? 'Mute notification sound' : 'Enable notification sound'}
          >
            {notificationSoundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 opacity-70" />}
          </button>
          <button
            type="button"
            onClick={dismissNotification}
            className="p-1 rounded-md text-teal-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Dismiss message notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4 bg-white space-y-3">
        <div className="flex items-start gap-3">
          <div className="relative shrink-0">
            <img
              src={incomingNotification.peerAvatar}
              alt={incomingNotification.peerName}
              referrerPolicy="no-referrer"
              className="w-12 h-12 rounded-full object-cover border-2 border-teal-500 shadow-xs"
            />
            <span className="absolute -bottom-1 -right-1 text-sm bg-white rounded-full px-0.5 border border-slate-200 shadow-2xs">
              {getWorldCountryFlag(incomingNotification.peerCountry)}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <h4 className="text-sm font-bold text-slate-900 truncate">
                {incomingNotification.peerName}
              </h4>
              <span className="text-[10px] text-slate-400 font-mono shrink-0">
                {incomingNotification.timestamp}
              </span>
            </div>
            <p className="text-[11px] font-medium text-teal-800 truncate">
              {incomingNotification.peerCity}, {incomingNotification.peerCountry}
            </p>
            <div className="mt-1 p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed line-clamp-2 italic">
              "{incomingNotification.text}"
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-1 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={dismissNotification}
            className="text-xs text-slate-500 hover:text-slate-800 font-medium px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Dismiss
          </button>
          <button
            type="button"
            onClick={handleOpenChat}
            className="px-3.5 py-1.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer hover:gap-2"
          >
            <span>Open Chat &amp; Reply</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Auto-Dismiss Progress Bar */}
      <div className="w-full bg-slate-100 h-1">
        <div
          className="bg-teal-600 h-1 transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
