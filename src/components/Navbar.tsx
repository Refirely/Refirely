import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { getViewUrl } from '../utils/seo';
import {
  User, Shield, Bookmark, MessageCircle, Menu, X, SlidersHorizontal,
  LogIn, UserPlus, LogOut, ChevronDown, Settings, Globe, Camera,
  BookOpen, Database, LayoutDashboard, Download
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface NavbarProps {
  onOpenBrandKit?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenBrandKit }) => {
  const {
    currentView,
    setCurrentView,
    userProfile,
    isOwnerAdmin,
    toggleRole,
    updateUserProfile,
    savedCountryIds,
    dmThreads,
    discreetLifestyleEnabled,
    setDiscreetLifestyleEnabled,
    isAuthenticated,
    openAuthModal,
    openFirebaseModal,
    openEditProfile,
    logout,
    journalEntries,
    firebaseUser,
    comparedCountryIds,
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
  const canAccessAdmin = isOwnerAdmin || userProfile.role === 'admin';

  const handleNav = (view: typeof currentView) => {
    if (view === 'admin' && userProfile.role !== 'admin' && isOwnerAdmin) {
      updateUserProfile({ role: 'admin' });
    }
    setCurrentView(view);
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAnchorNav = (e: React.MouseEvent<HTMLAnchorElement>, view: typeof currentView) => {
    if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && !e.button) {
      e.preventDefault();
      handleNav(view);
    }
  };

  const navItems: { view: typeof currentView; label: string; isActive: boolean }[] = [
    { view: 'landing', label: 'Home', isActive: currentView === 'landing' },
    { view: 'explore', label: 'Explore Havens', isActive: currentView === 'explore' || currentView === 'country-detail' },
    { view: 'compare', label: 'Compare', isActive: currentView === 'compare' },
    { view: 'community', label: 'Community', isActive: currentView === 'community' },
    { view: 'meetups', label: 'Meetups', isActive: currentView === 'meetups' },
    { view: 'dashboard', label: 'My Dashboard', isActive: currentView === 'dashboard' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-xl border-b border-indigo-100/90 text-slate-800 shadow-xs">
      {/* Multi-Colored Top Accent Line */}
      <div className="h-1 w-full bg-gradient-to-r from-teal-500 via-indigo-500 via-50% to-amber-500" />

      {/* Responsive 3-zone Top Bar — engineered to never overflow horizontally */}
      <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6 h-16 flex items-center justify-between gap-2 lg:gap-4">
        
        {/* Zone 1: Multi-Colored Animated Brand Wordmark + High-Res Logo Kit Trigger */}
        <div className="flex items-center gap-2 shrink-0">
          <a
            href={getViewUrl('landing')}
            onClick={(e) => handleAnchorNav(e, 'landing')}
            className="flex items-center gap-2 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-xl group shrink-0 py-1"
            aria-label="ReFIREly Home"
          >
            <BrandLogo variant="full" size="md" />
          </a>
          {onOpenBrandKit && (
            <button
              onClick={onOpenBrandKit}
              title="Download High-Resolution 4K Logo & Promo Brand Kit (PNG / SVG)"
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-indigo-700 hover:text-white bg-indigo-50/90 hover:bg-gradient-to-r hover:from-indigo-600 hover:to-teal-600 border border-indigo-200/80 transition-all shadow-2xs cursor-pointer"
            >
              <Download className="w-3 h-3" />
              <span>4K Logo</span>
            </button>
          )}
        </div>

        {/* Zone 2: Primary navigation links with animated active pill */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-1.5 text-xs lg:text-[13px] font-semibold text-slate-600 min-w-0 p-1 rounded-2xl bg-slate-100/80 border border-slate-200/70">
          {navItems.map((item) => (
            <a
              key={item.view}
              href={getViewUrl(item.view)}
              onClick={(e) => handleAnchorNav(e, item.view)}
              className={`relative whitespace-nowrap shrink-0 transition-colors py-1.5 px-2.5 lg:px-3 rounded-xl cursor-pointer ${
                item.isActive
                  ? 'text-white font-bold'
                  : 'text-slate-600 hover:text-indigo-950 hover:bg-white/60'
              }`}
            >
              {item.isActive && (
                <motion.span
                  layoutId="navbarActivePill"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-teal-600 shadow-xs"
                />
              )}
              <span className="relative z-10">{item.label}</span>
            </a>
          ))}
        </nav>

        {/* Zone 3: Compact Right Utility & Account Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Discreet lifestyle toggle button */}
          <button
            onClick={() => setDiscreetLifestyleEnabled(!discreetLifestyleEnabled)}
            title={discreetLifestyleEnabled ? "Discreet lifestyle filters active (Nightlife & Adult indicators visible)" : "Show lifestyle & nightlife indicators"}
            className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer shrink-0 ${
              discreetLifestyleEnabled
                ? 'bg-amber-50 border-amber-300 text-amber-800 shadow-2xs'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-600" />
            <span className="whitespace-nowrap">Lifestyle {discreetLifestyleEnabled ? 'ON' : 'OFF'}</span>
          </button>

          {/* Direct Messages link with dynamic notification badge */}
          <button
            onClick={() => {
              if (!isAuthenticated) {
                openAuthModal('login');
                return;
              }
              handleNav('messages');
            }}
            className={`relative p-1.5 sm:p-2 rounded-lg text-slate-600 hover:text-orange-800 hover:bg-orange-50/60 transition-colors cursor-pointer ${
              currentView === 'messages' ? 'bg-orange-50 text-orange-800' : ''
            }`}
            title={
              !isAuthenticated
                ? 'Sign in to access Expat Direct Messages'
                : totalUnreadDms > 0
                ? `Expat Direct Messages (${totalUnreadDms} unread message${totalUnreadDms > 1 ? 's' : ''})`
                : 'Expat Direct Messages'
            }
            aria-label="Direct Messages"
          >
            <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            {isAuthenticated && totalUnreadDms > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-[18px] items-center justify-center px-1 rounded-full bg-orange-600 text-[10px] font-extrabold text-white ring-2 ring-white shadow-xs">
                <span className="absolute -inset-0.5 rounded-full bg-orange-500 opacity-75 animate-ping" />
                <span className="relative z-10">{totalUnreadDms > 9 ? '9+' : totalUnreadDms}</span>
              </span>
            )}
          </button>

          {/* Saved Shortlist button */}
          <button
            onClick={() => handleNav('dashboard')}
            className="relative p-1.5 sm:p-2 rounded-lg text-slate-600 hover:text-orange-800 hover:bg-orange-50/60 transition-colors cursor-pointer"
            title="Saved Country Shortlist"
          >
            <Bookmark className="w-4 h-4 sm:w-5 sm:h-5" />
            {savedCountryIds.length > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.2 bg-orange-600 text-white text-[10px] font-bold rounded-full font-mono shadow-2xs">
                {savedCountryIds.length}
              </span>
            )}
          </button>

          {/* Firebase Cloud DB Connection button (Owner / Admin Only) */}
          {isOwnerAdmin && (
            <button
              onClick={openFirebaseModal}
              className={`hidden lg:flex px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-all items-center gap-1.5 cursor-pointer ${
                firebaseUser
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100 shadow-2xs'
                  : 'bg-orange-50/80 text-orange-900 border-orange-200 hover:bg-orange-100 shadow-2xs'
              }`}
              title="Owner Admin: Firebase Database & Hosting Connection Center"
            >
              <Database className={`w-3.5 h-3.5 ${firebaseUser ? 'text-emerald-600' : 'text-orange-600'}`} />
              <span className="whitespace-nowrap">{firebaseUser ? 'Synced' : 'Cloud DB'}</span>
            </button>
          )}

          {/* User Account / Profile dropdown or Login/Signup buttons */}
          {isAuthenticated ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-1.5 p-1 pl-1.5 pr-2.5 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-2xs cursor-pointer"
              >
                <div className="relative">
                  {userProfile.avatarUrl ? (
                    <img
                      src={userProfile.avatarUrl}
                      alt={userProfile.name}
                      className="w-7 h-7 rounded-full object-cover ring-2 ring-orange-500/30"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold text-xs ring-2 ring-orange-500/30">
                      {userProfile.name.charAt(0)}
                    </div>
                  )}
                </div>
                <span className="hidden sm:inline text-xs font-semibold text-slate-800 max-w-[85px] truncate">
                  {userProfile.name.split(' ')[0]}
                </span>
                {canAccessAdmin && (
                  <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-900">
                    {userProfile.role === 'admin' ? 'Admin' : 'Owner'}
                  </span>
                )}
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {/* Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50 text-xs text-slate-700 animate-in fade-in zoom-in-95 duration-150">
                  {/* User info banner */}
                  <div className="px-3.5 py-2.5 border-b border-slate-100 bg-gradient-to-r from-orange-50/90 via-purple-50/40 to-slate-50">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold text-slate-900 text-xs truncate">{userProfile.name}</p>
                      {firebaseUser && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 font-semibold uppercase tracking-wider shrink-0">
                          Google Auth
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">{userProfile.email}</p>
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
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

                  {/* Admin & CMS Console Quick Access Section (Top of Dropdown for Admins) */}
                  {canAccessAdmin && (
                    <div className="p-2 border-b border-amber-100 bg-amber-50/50 space-y-1">
                      <div className="px-2 py-0.5 flex items-center justify-between">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-900 flex items-center gap-1">
                          <Shield className="w-3 h-3 text-amber-600" />
                          <span>Admin Governance</span>
                        </span>
                        <span className="text-[10px] font-semibold text-amber-800">
                          {userProfile.role === 'admin' ? 'Admin Mode' : 'Member View'}
                        </span>
                      </div>
                      <button
                        onClick={() => handleNav('admin')}
                        className="w-full text-left px-2.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold flex items-center justify-between transition-colors shadow-2xs cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <LayoutDashboard className="w-3.5 h-3.5" />
                          <span>Open Admin CMS Console</span>
                        </div>
                        <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded">Manage</span>
                      </button>
                      <div className="grid grid-cols-2 gap-1.5 pt-1">
                        <button
                          onClick={() => {
                            toggleRole();
                            setUserMenuOpen(false);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-amber-100/70 text-slate-700 border border-amber-200 font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer text-[11px]"
                        >
                          <Shield className="w-3 h-3 text-amber-600" />
                          <span>{userProfile.role === 'admin' ? 'Member View' : 'Admin Mode'}</span>
                        </button>
                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            openFirebaseModal();
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-emerald-50 text-slate-700 border border-emerald-200 font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer text-[11px]"
                        >
                          <Database className="w-3 h-3 text-emerald-600" />
                          <span>{firebaseUser ? 'Cloud Online' : 'Cloud DB'}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Actions list */}
                  <div className="py-1">
                    <button
                      onClick={() => handleNav('dashboard')}
                      className="w-full text-left px-3.5 py-2 hover:bg-orange-50/70 hover:text-orange-950 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5 text-orange-600" />
                      <span>My Dashboard & Relocation Hub</span>
                    </button>
                    <button
                      onClick={() => handleNav('dashboard')}
                      className="w-full text-left px-3.5 py-2 hover:bg-orange-50/70 hover:text-orange-950 flex items-center justify-between transition-colors cursor-pointer"
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
                      className="w-full text-left px-3.5 py-2 hover:bg-orange-50/70 hover:text-orange-950 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Settings className="w-3.5 h-3.5 text-orange-600" />
                      <span>Edit Profile & About</span>
                    </button>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        openEditProfile('picture');
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-orange-50/70 hover:text-orange-950 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5 text-purple-600" />
                      <span>Change Profile Picture</span>
                    </button>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        openEditProfile('travel');
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-orange-50/70 hover:text-orange-950 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Globe className="w-3.5 h-3.5 text-blue-600" />
                      <span>Travel History ({userProfile.travelHistory?.length || 0})</span>
                    </button>
                  </div>

                  {/* Switch Expat Account (Requires Password via Login Modal) */}
                  <div className="pt-1.5 border-t border-slate-100 px-3.5 py-1.5">
                    <div className="flex items-center justify-between">
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
                  <div className="pt-1 border-t border-slate-100">
                    <button
                      onClick={() => {
                        logout();
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => openAuthModal('login')}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Log In</span>
              </button>
              <button
                onClick={() => openAuthModal('signup')}
                className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Sign Up</span>
              </button>
            </div>
          )}

          {/* Mobile hamburger - styled with border and background for clear mobile visibility */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-800 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 border border-slate-200/90 transition-all shrink-0 flex items-center justify-center cursor-pointer shadow-2xs"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-slate-900" /> : <Menu className="w-5 h-5 text-slate-900" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-6 bg-white border-b border-slate-200 shadow-xl space-y-3">
          <div className="flex flex-col space-y-1">
            {canAccessAdmin && (
              <button
                onClick={() => handleNav('admin')}
                className={`text-left px-3 py-2.5 rounded-lg text-sm font-bold flex items-center justify-between ${
                  currentView === 'admin'
                    ? 'bg-amber-500 text-white'
                    : 'bg-amber-50 text-amber-900 border border-amber-200'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span>Admin CMS Console</span>
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-white/20">Open</span>
              </button>
            )}
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
              Compare Matrix ({comparedCountryIds.length})
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
              onClick={() => {
                if (!isAuthenticated) {
                  setMobileMenuOpen(false);
                  openAuthModal('login');
                  return;
                }
                handleNav('messages');
              }}
              className={`text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-between cursor-pointer ${
                currentView === 'messages' ? 'bg-orange-50 text-orange-950 font-bold' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-orange-600" />
                <span>Direct Messages</span>
              </span>
              {!isAuthenticated ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                  Members Only
                </span>
              ) : totalUnreadDms > 0 ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-600 text-white shadow-2xs">
                  {totalUnreadDms} new
                </span>
              ) : null}
            </button>
            <button
              onClick={() => handleNav('dashboard')}
              className={`text-left px-3 py-2 rounded-lg text-sm font-medium ${
                currentView === 'dashboard' ? 'bg-orange-50 text-orange-950 font-bold' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              My Dashboard
            </button>
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
                      referrerPolicy="no-referrer"
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
