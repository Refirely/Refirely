import React from 'react';
import { useApp } from '../context/AppContext';
import { Lock, LogIn, UserPlus, Shield, MessageCircle, Compass, Users, CheckCircle2 } from 'lucide-react';

export const DirectMessagesAuthGate: React.FC = () => {
  const { openAuthModal, setCurrentView } = useApp();

  return (
    <div className="min-h-[calc(100vh-14rem)] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 via-orange-50/20 to-white">
      <div className="max-w-xl w-full">
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden">
          
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 px-6 sm:px-8 py-8 text-white text-center relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />
            <div className="absolute -left-6 -top-6 w-32 h-32 rounded-full bg-black/10 blur-xl pointer-events-none" />
            
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 text-white shadow-inner mb-4">
              <Lock className="w-8 h-8" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold tracking-wide uppercase mb-3">
              <Shield className="w-3.5 h-3.5" />
              <span>Verified Expat Privacy Guard</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Member Sign-In Required
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-orange-100 max-w-md mx-auto leading-relaxed">
              Expat Peer Direct Messaging and private inbox conversations are strictly reserved for logged-in members.
            </p>
          </div>

          {/* Body Content */}
          <div className="p-6 sm:p-8 space-y-6">
            
            {/* Why was it locked explanation */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs sm:text-[13px] text-slate-600 leading-relaxed space-y-2">
              <p className="font-semibold text-slate-800 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-600" />
                <span>Why are direct chats hidden when logged out?</span>
              </p>
              <p>
                To maintain authenticity, protect member contact details, and prevent unsolicited spam, all direct message threads, conversation histories, and messaging tools are hidden until you authenticate with your member account.
              </p>
            </div>

            {/* Member Perks Checklist */}
            <div className="space-y-2.5">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                What you unlock as an authenticated member:
              </span>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>1-on-1 Expat Advice:</strong> Connect with retirees who already relocated to Portugal, Spain, Thailand, Costa Rica, and Panama.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Real-Time Alerts:</strong> Receive in-app notifications and sound chimes when peers respond to your queries.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Safe &amp; Encrypted:</strong> No public publication of your personal questions or private correspondence.</span>
                </li>
              </ul>
            </div>

            {/* Call to Actions */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => openAuthModal('login')}
                className="flex-1 py-3 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Log In to Access Inbox</span>
              </button>
              <button
                onClick={() => openAuthModal('signup')}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-black active:bg-slate-800 text-white font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create Free Account</span>
              </button>
            </div>

            {/* Navigation fallbacks */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
              <button
                onClick={() => {
                  setCurrentView('community');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="hover:text-orange-600 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span>Browse Public Member Directory</span>
              </button>
              <button
                onClick={() => {
                  setCurrentView('explore');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="hover:text-orange-600 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5 text-slate-400" />
                <span>Explore Top Havens</span>
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
