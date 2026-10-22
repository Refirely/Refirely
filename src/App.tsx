import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { DirectoryExplorer } from './components/DirectoryExplorer';
import { CountryDossier } from './components/CountryDossier';
import { CompareStudio } from './components/CompareStudio';
import { CommunityHub } from './components/CommunityHub';
import { MeetupsView } from './components/MeetupsView';
import { DirectMessenger } from './components/DirectMessenger';
import { UserDashboard } from './components/UserDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthModal } from './components/AuthModal';
import { EditProfileModal } from './components/EditProfileModal';
import { FirebaseConnectionModal } from './components/FirebaseConnectionModal';
import { Compass, Shield } from 'lucide-react';

const MainContent: React.FC = () => {
  const { currentView, selectedCountry, setCurrentView, countries, userProfile, isOwnerAdmin, toggleRole, navigateToCountry } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-orange-100 selection:text-orange-950">
      
      {/* Top Bar (Follows 3-zone contract) */}
      <Navbar />

      {/* Main Viewport Router */}
      <div className="flex-1">
        {currentView === 'explore' && <DirectoryExplorer />}
        {currentView === 'country-detail' && <CountryDossier country={selectedCountry!} />}
        {currentView === 'compare' && <CompareStudio />}
        {currentView === 'community' && <CommunityHub />}
        {currentView === 'meetups' && <MeetupsView />}
        {currentView === 'messages' && <DirectMessenger />}
        {currentView === 'dashboard' && <UserDashboard />}
        {currentView === 'admin' && <AdminDashboard />}
      </div>

      {/* Global Auth and Profile Modals */}
      <AuthModal />
      <EditProfileModal />
      <FirebaseConnectionModal />

      {/* Elegant Light Footer */}
      <footer className="bg-white text-slate-600 border-t border-slate-200/90 text-xs py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-100">
            
            {/* Col 1: Wordmark & Purpose */}
            <div className="space-y-3">
              <button
                onClick={() => {
                  setCurrentView('explore');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center focus:outline-none group"
                aria-label="ReFIREly Home"
              >
                <img
                  src="/assets/aistudio/refirely-logo.png"
                  alt="ReFIREly"
                  className="h-9 w-auto object-contain transition-transform duration-200 group-hover:scale-[1.03]"
                />
              </button>
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
                <li><button onClick={() => navigateToCountry('portugal')} className="hover:text-orange-600 hover:underline transition-colors">Portugal (D7 / Algarve)</button></li>
                <li><button onClick={() => navigateToCountry('spain')} className="hover:text-orange-600 hover:underline transition-colors">Spain (Costa del Sol)</button></li>
                <li><button onClick={() => navigateToCountry('thailand')} className="hover:text-orange-600 hover:underline transition-colors">Thailand (Chiang Mai)</button></li>
                <li><button onClick={() => navigateToCountry('costa-rica')} className="hover:text-orange-600 hover:underline transition-colors">Costa Rica (Central Valley)</button></li>
                <li><button onClick={() => navigateToCountry('panama')} className="hover:text-orange-600 hover:underline transition-colors">Panama (Boquete)</button></li>
              </ul>
            </div>

            {/* Col 3: Features */}
            <div className="space-y-2">
              <span className="font-bold text-slate-900 block mb-2 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                <span>Platform Features</span>
              </span>
              <ul className="space-y-1.5">
                <li><button onClick={() => setCurrentView('explore')} className="hover:text-orange-600 hover:underline transition-colors">Haven Directory & Filters</button></li>
                <li><button onClick={() => setCurrentView('compare')} className="hover:text-orange-600 hover:underline transition-colors">Side-by-Side Compare Matrix</button></li>
                <li><button onClick={() => setCurrentView('community')} className="hover:text-orange-600 hover:underline transition-colors">Expat Community Boards</button></li>
                <li><button onClick={() => setCurrentView('meetups')} className="hover:text-orange-600 hover:underline transition-colors">Expat Meetups & Socials</button></li>
                <li><button onClick={() => setCurrentView('messages')} className="hover:text-orange-600 hover:underline transition-colors">Direct Member Messaging</button></li>
                <li><button onClick={() => setCurrentView('dashboard')} className="hover:text-orange-600 hover:underline transition-colors">Relocation Readiness Checklist</button></li>
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
                    <span className="text-slate-500">Owner Perspective:</span>
                    <span className={`font-bold capitalize px-2 py-0.5 rounded text-[11px] ${
                      userProfile.role === 'admin' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-orange-50 text-orange-800 border border-orange-200'
                    }`}>{userProfile.role} Mode</span>
                  </div>
                  <button
                    onClick={toggleRole}
                    className="w-full py-1.5 text-center text-xs font-semibold rounded-lg bg-slate-800 text-white hover:bg-slate-900 transition-colors shadow-2xs"
                  >
                    Switch to {userProfile.role === 'admin' ? 'Member Mode' : 'Admin Mode'}
                  </button>
                </div>
              )}
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Empirical indicators calibrated against national immigration authorities, Numbeo cost-of-living indexes, and WHO healthcare reports.
              </p>
            </div>

          </div>

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
