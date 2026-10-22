import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Compass, Scale, MessageSquare, Calendar, User, Shield, Bookmark,
  MessageCircle, Menu, X, SlidersHorizontal, LogIn, UserPlus, LogOut,
  ChevronDown, Settings, Globe, Camera, Check, Sparkles, BookOpen, Database
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    userProfile,
    isOwnerAdmin,
    toggleRole,
    savedCountryIds,
    dmThreads,
    discreetLifestyleEnabled,
    setDiscreetLifestyleEnabled,
    isAuthenticated,
    currentUserId,
    openAuthModal,
    openFirebaseModal,
    openEditProfile,
    logout,
    registeredAccounts,
    switchAccount,
    journalEntries,
    firebaseUser,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalUnreadDms = dmThreads.reduce((sum, t) => sum + (t.unreadCount || 0), 0);

  const handleNav = (view: typeof currentView) => {
    setCurrentView(view);
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/90 text-slate-800 shadow-2xs">
      {/* Universal Top Bar Contract: 3 zones separated by gap-8 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        
        {/* Zone 1: Single clean brand wordmark */}
        <button
          onClick={() => handleNav('landing')}
          className="flex items-center gap-2 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded-md group shrink-0 py-1"
          aria-label="ReFIREly Home"
        >
          <img
            src="/assets/aistudio/refirely-logo.png"
            alt="ReFIREly"
            className="h-10 sm:h-11 w-auto object-contain transition-transform duration-200 group-hover:scale-[1.03]"
          />
        </button>

        {/* Zone 2: 5 single-line clean text navigation links */}
        <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-slate-600">
          <button
            onClick={() => handleNav('landing')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1.5 px-2.5 rounded-lg ${
              currentView === 'landing'
                ? 'text-orange-950 font-bold bg-orange-50/80 border-b-2 border-orange-500'
                : 'hover:text-orange-600 hover:bg-slate-50'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => handleNav('explore')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1.5 px-2.5 rounded-lg ${
              currentView === 'explore' || currentView === 'country-detail'
                ? 'text-orange-950 font-bold bg-orange-50/80 border-b-2 border-orange-500'
                : 'hover:text-orange-600 hover:bg-slate-50'
            }`}
          >
            Explore Havens
          </button>
          <button
            onClick={() => handleNav('compare')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1.5 px-2.5 rounded-lg ${
              currentView === 'compare'
                ? 'text-orange-950 font-bold bg-orange-50/80 border-b-2 border-orange-500'
                : 'hover:text-orange-600 hover:bg-slate-50'
            }`}
          >
            Compare Matrix
          </button>
          <button
            onClick={() => handleNav('community')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1.5 px-2.5 rounded-lg ${
              currentView === 'community'
                ? 'text-orange-950 font-bold bg-orange-50/80 border-b-2 border-orange-500'
                : 'hover:text-orange-600 hover:bg-slate-50'
            }`}
          >
            Community Hub
          </button>
          <button
            onClick={() => handleNav('meetups')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1.5 px-2.5 rounded-lg ${
              currentView === 'meetups'
                ? 'text-orange-950 font-bold bg-orange-50/80 border-b-2 border-orange-500'
                : 'hover:text-orange-600 hover:bg-slate-50'
            }`}
          >
            Expat Meetups
          </button>
          <button
            onClick={() => handleNav('dashboard')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1.5 px-2.5 rounded-lg ${
              currentView === 'dashboard'
                ? 'text-orange-950 font-bold bg-orange-50/80 border-b-2 border-orange-500'
                : 'hover:text-orange-600 hover:bg-slate-50'
            }`}
          >
            My Dashboard
          </button>
        </nav>

        {/* Zone 3: Primary actions & Role Switcher */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Discreet lifestyle toggle button */}
          <button
            onClick={() => setDiscreetLifestyleEnabled(!discreetLifestyleEnabled)}
            title={discreetLifestyleEnabled ? "Discreet lifestyle filters active (Nightlife & Adult indicators visible)" : "Show lifestyle & nightlife indicators"}
            className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
              discreetLifestyleEnabled
                ? 'bg-amber-50 border-amber-300 text-amber-800 shadow-2xs'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-600" />
            <span className="whitespace-nowrap">Lifestyle Metrics {discreetLifestyleEnabled ? 'ON' : 'OFF'}</span>
          </button>

          {/* Direct Messages link with badge */}
          <button
            onClick={() => handleNav('messages')}
            className={`relative p-2 rounded-lg text-slate-600 hover:text-orange-800 hover:bg-orange-50/60 transition-colors ${
              currentView === 'messages' ? 'bg-orange-50 text-orange-800' : ''
            }`}
            title="Expat Direct Messages"
          >
            <MessageCircle className="w-5 h-5" />
            {totalUnreadDms > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-orange-600 ring-2 ring-white" />
            )}
          </button>

          {/* Saved Shortlist button */}
          <button
            onClick={() => handleNav('dashboard')}
            className="relative p-2 rounded-lg text-slate-600 hover:text-orange-800 hover:bg-orange-50/60 transition-colors"
            title="Saved Country Shortlist"
          >
            <Bookmark className="w-5 h-5" />
            {savedCountryIds.length > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.2 bg-orange-600 text-white text-[10px] font-bold rounded-full font-mono shadow-2xs">
                {savedCountryIds.length}
              </span>
            )}
          </button>

          {/* Firebase Cloud DB & Hosting Connection button (Owner / Admin Only) */}
          {isOwnerAdmin && (
            <button
              onClick={openFirebaseModal}
              className={`hidden sm:flex px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-all items-center gap-1.5 cursor-pointer ${
                firebaseUser
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100 shadow-2xs'
                  : 'bg-orange-50/80 text-orange-900 border-orange-200 hover:bg-orange-100 shadow-2xs'
              }`}
              title="Owner Admin: Firebase Database & Hosting Connection Center"
            >
              <Database className={`w-3.5 h-3.5 ${firebaseUser ? 'text-emerald-600' : 'text-orange-600'}`} />
              <span className="whitespace-nowrap">{firebaseUser ? 'Cloud Synced' : 'Cloud DB'}</span>
            </button>
          )}

          {/* Role switcher toggle: Member vs Admin (Owner / Admin Only) */}
          {isOwnerAdmin && (
            <button
              onClick={toggleRole}
              className={`hidden lg:flex px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all items-center gap-1.5 ${
                userProfile.role === 'admin'
                  ? 'bg-amber-50 text-amber-900 border-amber-300 font-bold shadow-2xs hover:bg-amber-100'
                  : 'bg-purple-50 border-purple-200 text-purple-800 hover:bg-purple-100 shadow-2xs'
              }`}
              title="Switch user perspective"
            >
              {userProfile.role === 'admin' ? (
                <>
                  <Shield className="w-3.5 h-3.5 text-amber-600" />
                  <span className="whitespace-nowrap">Admin Mode</span>
                </>
              ) : (
                <>
                  <User className="w-3.5 h-3.5 text-purple-600" />
                  <span className="whitespace-nowrap">Member View</span>
                </>
              )}
            </button>
          )}

          {/* User Account / Profile dropdown or Login/Signup buttons */}
          {isAuthenticated ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-2xs"
              >
                <div className="relative">
                  {userProfile.avatarUrl ? (
                    <img
                      src={userProfile.avatarUrl}
                      alt={userProfile.name}
                      className="w-7 h-7 rounded-full object-cover ring-2 ring-orange-500/30"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold text-xs ring-2 ring-orange-500/30">
                      {userProfile.name.charAt(0)}
                    </div>
                  )}
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                </div>
                <span className="hidden sm:inline text-xs font-semibold text-slate-800 max-w-[90px] truncate">
                  {userProfile.name.split(' ')[0]}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {/* Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50 text-xs text-slate-700 animate-in fade-in zoom-in-95 duration-150">
                  {/* User info banner */}
                  <div className="px-3.5 py-2.5 border-b border-slate-100 bg-gradient-to-r from-orange-50/90 via-purple-50/40 to-slate-50">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-slate-900 text-xs truncate">{userProfile.name}</p>
                      {firebaseUser && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 font-semibold uppercase tracking-wider">
                          Google Auth
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">{userProfile.email}</p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-orange-100 text-orange-900 font-semibold">
                        → {userProfile.targetCountry}
                      </span>
                      {userProfile.relocationStatus && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-medium">
                          {userProfile.relocationStatus}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions list */}
                  <div className="py-1">
                    <button
                      onClick={() => handleNav('dashboard')}
                      className="w-full text-left px-3.5 py-2 hover:bg-orange-50/70 hover:text-orange-950 flex items-center gap-2 transition-colors"
                    >
                      <User className="w-3.5 h-3.5 text-orange-600" />
                      <span>My Dashboard & Relocation Hub</span>
                    </button>
                    <button
                      onClick={() => handleNav('dashboard')}
                      className="w-full text-left px-3.5 py-2 hover:bg-orange-50/70 hover:text-orange-950 flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-3.5 h-3.5 text-purple-600" />
                        <span>Country Journal & Notes</span>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 font-bold font-mono">
                        {Object.keys(journalEntries).length}
                      </span>
                    </button>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        openEditProfile('about');
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-orange-50/70 hover:text-orange-950 flex items-center gap-2 transition-colors"
                    >
                      <Settings className="w-3.5 h-3.5 text-orange-600" />
                      <span>Edit Profile & About</span>
                    </button>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        openEditProfile('picture');
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-orange-50/70 hover:text-orange-950 flex items-center gap-2 transition-colors"
                    >
                      <Camera className="w-3.5 h-3.5 text-purple-600" />
                      <span>Change Profile Picture</span>
                    </button>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        openEditProfile('travel');
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-orange-50/70 hover:text-orange-950 flex items-center gap-2 transition-colors"
                    >
                      <Globe className="w-3.5 h-3.5 text-blue-600" />
                      <span>Travel History ({userProfile.travelHistory?.length || 0})</span>
                    </button>
                    {isOwnerAdmin && (
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          openFirebaseModal();
                        }}
                        className="w-full text-left px-3.5 py-2 hover:bg-orange-50/70 hover:text-orange-950 flex items-center justify-between transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Database className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Firebase DB & Hosting Setup</span>
                        </div>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                          firebaseUser ? 'bg-emerald-100 text-emerald-800' : 'bg-orange-100 text-orange-800'
                        }`}>
                          {firebaseUser ? 'Online' : 'Link'}
                        </span>
                      </button>
                    )}
                  </div>

                  {/* Switch Expat Account (Requires Password via Login Modal) */}
                  <div className="pt-1.5 border-t border-slate-100 px-3.5 py-1.5">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Account Actions
                      </span>
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          openAuthModal('login');
                        }}
                        className="text-[10px] font-bold text-orange-600 hover:text-orange-800 flex items-center gap-0.5 cursor-pointer"
                      >
                        <LogIn className="w-3 h-3" />
                        <span>Switch User ID</span>
                      </button>
                    </div>
                  </div>

                  {/* Logout */}
                  <div className="pt-1.5 border-t border-slate-100">
                    <button
                      onClick={() => {
                        logout();
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => openAuthModal('login')}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Log In</span>
              </button>
              <button
                onClick={() => openAuthModal('signup')}
                className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 transition-all flex items-center gap-1.5 shadow-xs"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Sign Up</span>
              </button>
            </div>
          )}

          {/* Quick link to admin dashboard if role is admin */}
          {userProfile.role === 'admin' && (
            <button
              onClick={() => handleNav('admin')}
              className={`hidden sm:inline-flex px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors border ${
                currentView === 'admin'
                  ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                  : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
              }`}
            >
              CMS Console
            </button>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-6 bg-white border-b border-slate-200 shadow-xl space-y-3">
          <div className="flex flex-col space-y-1">
            <button
              onClick={() => handleNav('landing')}
              className={`text-left px-3 py-2 rounded-lg text-sm font-medium ${
                currentView === 'landing' ? 'bg-orange-50 text-orange-950 font-bold' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => handleNav('explore')}
              className={`text-left px-3 py-2 rounded-lg text-sm font-medium ${
                currentView === 'explore' ? 'bg-orange-50 text-orange-950 font-bold' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              Explore Havens
            </button>
            <button
              onClick={() => handleNav('compare')}
              className={`text-left px-3 py-2 rounded-lg text-sm font-medium ${
                currentView === 'compare' ? 'bg-orange-50 text-orange-950 font-bold' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              Compare Matrix ({useApp().comparedCountryIds.length})
            </button>
            <button
              onClick={() => handleNav('community')}
              className={`text-left px-3 py-2 rounded-lg text-sm font-medium ${
                currentView === 'community' ? 'bg-orange-50 text-orange-950 font-bold' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              Community Hub
            </button>
            <button
              onClick={() => handleNav('meetups')}
              className={`text-left px-3 py-2 rounded-lg text-sm font-medium ${
                currentView === 'meetups' ? 'bg-orange-50 text-orange-950 font-bold' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              Expat Meetups
            </button>
            <button
              onClick={() => handleNav('messages')}
              className={`text-left px-3 py-2 rounded-lg text-sm font-medium ${
                currentView === 'messages' ? 'bg-orange-50 text-orange-950 font-bold' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              Direct Messages
            </button>
            <button
              onClick={() => handleNav('dashboard')}
              className={`text-left px-3 py-2 rounded-lg text-sm font-medium ${
                currentView === 'dashboard' ? 'bg-orange-50 text-orange-950 font-bold' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              My Dashboard
            </button>
            {userProfile.role === 'admin' && (
              <button
                onClick={() => handleNav('admin')}
                className={`text-left px-3 py-2 rounded-lg text-sm font-semibold ${
                  currentView === 'admin' ? 'bg-amber-100 text-amber-900' : 'text-amber-800 hover:bg-amber-50'
                }`}
              >
                Admin CMS Console
              </button>
            )}
          </div>

          {/* Mobile User Profile Section */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-orange-50/80 border border-orange-100">
                  {userProfile.avatarUrl ? (
                    <img
                      src={userProfile.avatarUrl}
                      alt={userProfile.name}
                      className="w-9 h-9 rounded-full object-cover ring-2 ring-orange-500/30"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold text-sm">
                      {userProfile.name.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate">{userProfile.name}</p>
                    <p className="text-[10px] text-orange-800 font-medium truncate">Target: {userProfile.targetCountry}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openEditProfile('about');
                    }}
                    className="px-3 py-1.5 text-xs rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center gap-1.5"
                  >
                    <Settings className="w-3.5 h-3.5 text-orange-600" />
                    <span>Edit Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openEditProfile('travel');
                    }}
                    className="px-3 py-1.5 text-xs rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center gap-1.5"
                  >
                    <Globe className="w-3.5 h-3.5 text-blue-600" />
                    <span>Travel Log</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg flex items-center justify-center gap-1.5 border border-rose-200"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out ({userProfile.name.split(' ')[0]})</span>
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal('login');
                  }}
                  className="px-3 py-2 text-xs font-semibold rounded-lg bg-slate-100 text-slate-800 hover:bg-slate-200 flex items-center justify-center gap-1.5 border border-slate-200"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Log In</span>
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal('signup');
                  }}
                  className="px-3 py-2 text-xs font-bold rounded-lg bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Sign Up</span>
                </button>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">Nightlife & Lifestyle Details</span>
            <button
              onClick={() => setDiscreetLifestyleEnabled(!discreetLifestyleEnabled)}
              className={`px-3 py-1 text-xs rounded font-medium ${
                discreetLifestyleEnabled ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-slate-100 text-slate-700'
              }`}
            >
              {discreetLifestyleEnabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
