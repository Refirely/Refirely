import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { DirectoryExplorer } from './components/DirectoryExplorer';
import { CountryDossier } from './components/CountryDossier';
import { CompareStudio } from './components/CompareStudio';
import { CommunityHub } from './components/CommunityHub';
import { MeetupsView } from './components/MeetupsView';
import { DirectMessenger } from './components/DirectMessenger';
import { DirectMessagesAuthGate } from './components/DirectMessagesAuthGate';
import { UserDashboard } from './components/UserDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthModal } from './components/AuthModal';
import { EditProfileModal } from './components/EditProfileModal';
import { FirebaseConnectionModal } from './components/FirebaseConnectionModal';
import { PublicProfileModal } from './components/PublicProfileModal';
import { MessageNotificationToast } from './components/MessageNotificationToast';
import { FeedbackWidget } from './components/FeedbackWidget';
import { BrandLogo } from './components/BrandLogo';
import { BrandKitModal } from './components/BrandKitModal';
import { downloadBrandPng } from './utils/exportBrandLogo';
import { updatePageSeo, getCountryUrl, getViewUrl } from './utils/seo';
import { initGoogleAnalytics, trackPageView } from './utils/analytics';
import { Compass, Shield, Download, Sparkles } from 'lucide-react';

const MainContent: React.FC = () => {
  const {
    currentView,
    selectedCountry,
    setCurrentView,
    countries,
    userProfile,
    isOwnerAdmin,
    toggleRole,
    navigateToCountry,
    isAuthenticated,
    currentUserId,
    currentPersona,
  } = useApp();

  const [brandKitOpen, setBrandKitOpen] = useState(false);

  useEffect(() => {
    initGoogleAnalytics();
  }, []);

  useEffect(() => {
    updatePageSeo(currentView, selectedCountry, countries, currentPersona);
    trackPageView(currentView, selectedCountry);
  }, [currentView, selectedCountry, countries, currentPersona]);

  const handleSpaViewClick = (e: React.MouseEvent<HTMLAnchorElement>, view: typeof currentView) => {
    if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && e.button === 0) {
      e.preventDefault();
      setCurrentView(view);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSpaCountryClick = (e: React.MouseEvent<HTMLAnchorElement>, countryId: string) => {
    if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && e.button === 0) {
      e.preventDefault();
      navigateToCountry(countryId);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 via-indigo-50/15 to-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-950">
      
      {/* Top Bar (Follows 3-zone contract) */}
      <Navbar onOpenBrandKit={() => setBrandKitOpen(true)} />

      {/* Main Viewport Router with Smooth Page Transitions */}
      <div className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView === 'country-detail' ? `country-${selectedCountry?.id}` : currentView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          >
            {currentView === 'landing' && <LandingPage />}
            {currentView === 'explore' && <DirectoryExplorer />}
            {currentView === 'country-detail' && <CountryDossier country={selectedCountry!} />}
            {currentView === 'compare' && <CompareStudio />}
            {currentView === 'community' && <CommunityHub />}
            {currentView === 'meetups' && <MeetupsView />}
            {currentView === 'messages' && (
              isAuthenticated && currentUserId !== 'guest' ? (
                <DirectMessenger />
              ) : (
                <DirectMessagesAuthGate />
              )
            )}
            {currentView === 'dashboard' && (
              isOwnerAdmin ? (
                <AdminDashboard onOpenBrandKit={() => setBrandKitOpen(true)} />
              ) : (
                <UserDashboard />
              )
            )}
            {currentView === 'admin' && (
              isOwnerAdmin ? (
                <AdminDashboard onOpenBrandKit={() => setBrandKitOpen(true)} />
              ) : (
                <LandingPage />
              )
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Global In-App Notifications Toast */}
      <MessageNotificationToast />

      {/* Global Auth, Profile & Brand Kit Modals */}
      <AuthModal />
      <EditProfileModal />
      <FirebaseConnectionModal />
      <PublicProfileModal />
      <BrandKitModal isOpen={brandKitOpen} onClose={() => setBrandKitOpen(false)} />
      <FeedbackWidget />

      {/* Multi-Colored Elegant Footer */}
      <footer className="relative bg-white text-slate-600 border-t border-indigo-100 text-xs py-12 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 via-indigo-500 via-50% to-amber-500" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-100">
            
            {/* Col 1: Wordmark & Purpose */}
            <div className="space-y-3">
              <a
                href={getViewUrl(isOwnerAdmin ? 'admin' : 'landing')}
                onClick={(e) => handleSpaViewClick(e, isOwnerAdmin ? 'admin' : 'landing')}
                className="inline-flex items-center focus:outline-none group"
                aria-label="ReFIREly Home"
              >
                <BrandLogo variant="full" size="md" showTagline />
              </a>
              <p className="text-slate-500 text-xs leading-relaxed">
                Objective empirical guidance and expat community connections for prospective retirees evaluating relocation worldwide.
              </p>
            </div>

            {/* Col 2: Havens by Region */}
            <div className="space-y-2">
              <span className="font-bold text-slate-900 block mb-2 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                <span>Top Havens</span>
              </span>
              <ul className="space-y-1.5">
                <li><a href={getCountryUrl('portugal')} onClick={(e) => handleSpaCountryClick(e, 'portugal')} className="hover:text-orange-600 hover:underline transition-colors">Portugal (D7 / Algarve)</a></li>
                <li><a href={getCountryUrl('spain')} onClick={(e) => handleSpaCountryClick(e, 'spain')} className="hover:text-orange-600 hover:underline transition-colors">Spain (Costa del Sol)</a></li>
                <li><a href={getCountryUrl('thailand')} onClick={(e) => handleSpaCountryClick(e, 'thailand')} className="hover:text-orange-600 hover:underline transition-colors">Thailand (Chiang Mai)</a></li>
                <li><a href={getCountryUrl('costa-rica')} onClick={(e) => handleSpaCountryClick(e, 'costa-rica')} className="hover:text-orange-600 hover:underline transition-colors">Costa Rica (Central Valley)</a></li>
                <li><a href={getCountryUrl('panama')} onClick={(e) => handleSpaCountryClick(e, 'panama')} className="hover:text-orange-600 hover:underline transition-colors">Panama (Boquete)</a></li>
              </ul>
            </div>

            {/* Col 3: Features */}
            <div className="space-y-2">
              <span className="font-bold text-slate-900 block mb-2 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                <span>Platform Features</span>
              </span>
              <ul className="space-y-1.5">
                <li><a href={getViewUrl('landing')} onClick={(e) => handleSpaViewClick(e, 'landing')} className="hover:text-orange-600 hover:underline transition-colors">Home / Overview</a></li>
                <li><a href={getViewUrl('explore')} onClick={(e) => handleSpaViewClick(e, 'explore')} className="hover:text-orange-600 hover:underline transition-colors">Haven Directory &amp; Filters</a></li>
                <li><a href={getViewUrl('compare')} onClick={(e) => handleSpaViewClick(e, 'compare')} className="hover:text-orange-600 hover:underline transition-colors">Side-by-Side Compare Matrix</a></li>
                <li><a href={getViewUrl('community')} onClick={(e) => handleSpaViewClick(e, 'community')} className="hover:text-orange-600 hover:underline transition-colors">Expat Community Boards</a></li>
                <li><a href={getViewUrl('meetups')} onClick={(e) => handleSpaViewClick(e, 'meetups')} className="hover:text-orange-600 hover:underline transition-colors">Expat Meetups &amp; Socials</a></li>
                <li><a href={getViewUrl('messages')} onClick={(e) => handleSpaViewClick(e, 'messages')} className="hover:text-orange-600 hover:underline transition-colors">Direct Member Messaging</a></li>
                <li><a href={getViewUrl('dashboard')} onClick={(e) => handleSpaViewClick(e, 'dashboard')} className="hover:text-orange-600 hover:underline transition-colors">FIRE Calculator &amp; Checklist</a></li>
              </ul>
            </div>

            {/* Col 4: Platform Governance */}
            <div className="space-y-3">
              <span className="font-bold text-slate-900 block uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                <span>Data &amp; Governance</span>
              </span>
              {isOwnerAdmin && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Active Role:</span>
                    <span className="font-bold px-2 py-0.5 rounded text-[11px] bg-amber-100 text-amber-900 border border-amber-300">
                      Platform Admin
                    </span>
                  </div>
                  <button
                    onClick={() => setBrandKitOpen(true)}
                    className="w-full py-1.5 px-2.5 text-center text-xs font-bold rounded-lg bg-gradient-to-r from-indigo-600 via-violet-600 to-teal-600 text-white hover:from-indigo-700 hover:to-teal-700 transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>4K Brand &amp; Logo Kit (Admin Only)</span>
                  </button>
                </div>
              )}
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Empirical indicators calibrated against national immigration authorities, Numbeo cost-of-living indexes, and WHO healthcare reports.
              </p>
            </div>

          </div>

          {/* Crawlable Global Retirement Dossiers Index (SEO Sitemap Links) */}
          <nav aria-label="Global Retirement Havens Directory" className="py-6 border-b border-slate-100">
            <span className="font-bold text-slate-800 block mb-3 uppercase tracking-wider text-[10px]">
              Global Retirement &amp; FIRE Dossiers (Direct Country Links)
            </span>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-slate-500">
              {[...countries]
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((c) => (
                  <a
                    key={c.id}
                    href={getCountryUrl(c.id)}
                    onClick={(e) => handleSpaCountryClick(e, c.id)}
                    className={`hover:text-orange-600 hover:underline transition-colors ${
                      currentView === 'country-detail' && selectedCountry?.id === c.id
                        ? 'text-orange-600 font-bold'
                        : ''
                    }`}
                  >
                    {c.name}
                  </a>
                ))}
            </div>
          </nav>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-3">
            <span>© 2026 ReFirely Global Relocation Intelligence. All rights reserved.</span>
            <div className="flex items-center gap-3">
              <span className="text-orange-600 font-medium">Verified Immigration Standards</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-600">Direct Expat Connections</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
