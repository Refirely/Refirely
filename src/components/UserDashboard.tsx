import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { HavenMatcherWidget } from './HavenMatcherWidget';
import { CountryJournal } from './CountryJournal';
import { UserFinancialsDashboard } from './UserFinancialsDashboard';
import { FireCalculatorTracker } from './FireCalculatorTracker';
import { WORLD_COUNTRIES, getWorldCountryFlag } from '../data/userAccounts';
import { CountryFlag } from './CountryFlag';
import {
  User, Bookmark, CheckSquare, Calendar, Compass,
  DollarSign, ArrowRight, Plus, Heart, Edit3, Save, X, Sparkles, FileText,
  Globe, Languages, Star, MapPin, Camera, Check, Trash2, ExternalLink, BookOpen,
  TrendingUp, ShieldCheck, Lock, LogIn, UserPlus, Shield, Coins
} from 'lucide-react';

export const UserDashboard: React.FC = () => {
  const {
    userProfile,
    updateUserProfile,
    countries,
    navigateToCountry,
    checklist,
    toggleChecklistTask,
    addChecklistTask,
    meetups,
    setCurrentView,
    openEditProfile,
    removeVisitedCountry,
    toggleRsvpMeetup,
    journalEntries,
    isAuthenticated,
    currentUserId,
    firebaseUser,
    openAuthModal,
    openFirebaseModal,
    loginWithGoogle,
    registeredAccounts,
    switchAccount,
  } = useApp();

  // New task modal
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<'Financial' | 'Legal & Visas' | 'Healthcare' | 'Logistics & Housing'>('Legal & Visas');
  const [newTaskDesc, setNewTaskDesc] = useState('');

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    addChecklistTask({
      title: newTaskTitle.trim(),
      category: newTaskCategory,
      description: newTaskDesc.trim() || 'Custom user relocation milestone.',
    });

    setNewTaskTitle('');
    setNewTaskDesc('');
    setIsAddTaskOpen(false);
  };

  // If user is logged out, lock the dashboard to protect personal salary, net worth, checklist, and journal data
  if (!isAuthenticated) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-in fade-in duration-200">
        {/* Security & Privacy Lock Hero - Saffron & Purple Accent */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 shadow-sm text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 via-amber-500 to-purple-600" />
          
          <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-200 text-orange-700 flex items-center justify-center mx-auto mb-5 shadow-xs">
            <Lock className="w-8 h-8" />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50/80 border border-orange-200 text-orange-900 text-xs font-semibold uppercase tracking-wider mb-3">
            <Shield className="w-3.5 h-3.5 text-orange-600" />
            <span>Session Status: Logged Out · Personal Data Protected</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight max-w-2xl mx-auto">
            Personal Dashboard & Financial Ledger Locked
          </h1>

          <p className="text-slate-600 text-sm max-w-xl mx-auto mt-3 leading-relaxed">
            You are currently logged out. To ensure strict privacy, your personal details — including current salary, 5-scheme net worth portfolio (Savings, Stocks/Mutual Funds, Real Estate, Gold, and Others), relocation timeline, checklist milestones, and confidential country journal notes — are hidden.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
            <button
              onClick={() => openAuthModal('login')}
              className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm transition-all shadow-sm flex items-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Log In to Your Account</span>
            </button>
            <button
              onClick={() => openAuthModal('signup')}
              className="px-6 py-2.5 rounded-xl border border-purple-200 bg-purple-50/50 hover:bg-purple-100/70 text-purple-900 font-semibold text-sm transition-colors shadow-2xs flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4 text-purple-700" />
              <span>Create Free Account</span>
            </button>
            <button
              onClick={loginWithGoogle}
              className="px-6 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium text-sm transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>

          {/* Registered Expat Profiles — Requires Password Sign-In */}
          <div className="mt-10 pt-8 border-t border-slate-100 text-left">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-orange-600" />
                <span>Registered Expat Accounts (Password Required):</span>
              </span>
              <span className="text-[11px] text-slate-400">Click to sign in with password</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {registeredAccounts.map(account => (
                <button
                  key={account.id}
                  onClick={() => openAuthModal('login')}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-orange-400 hover:bg-orange-50/30 text-left transition-all group flex items-start gap-3 bg-slate-50/50 cursor-pointer"
                >
                  <img
                    src={account.profile.avatarUrl}
                    alt={account.name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-200 group-hover:ring-orange-500 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-900 group-hover:text-orange-950 truncate">
                        {account.name}
                      </p>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-orange-600 shrink-0 transition-transform group-hover:translate-x-0.5" />
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">
                      {getWorldCountryFlag(account.profile.originCountry)} {account.profile.originCountry} (Residing: {account.profile.residingCountry || account.profile.originCountry}) → {account.profile.targetCountry}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1 text-[10px] text-orange-700 font-semibold">
                      <Lock className="w-3 h-3" />
                      <span>ID: {account.id} · Enter password</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* What Unlocks Preview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-2">
            <div className="w-9 h-9 rounded-lg bg-orange-50 text-orange-800 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="text-xs font-bold text-slate-900">5-Scheme Financial Ledger</h3>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Log current salary and net worth across cash, stocks, real estate equity, physical gold, and alternative schemes.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-2">
            <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-800 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-xs font-bold text-slate-900">Haven Potential Matrix</h3>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Instant eligibility matching comparing your assets & income against Portugal D7, Spain Non-Lucrative, and Thai visas.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-2">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-800 flex items-center justify-center font-bold">
              <CheckSquare className="w-5 h-5 text-blue-700" />
            </div>
            <h3 className="text-xs font-bold text-slate-900">Milestone Checklist</h3>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Step-by-step relocation progress tracking for legal visas, international healthcare, banking, and housing.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-2">
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5 text-amber-700" />
            </div>
            <h3 className="text-xs font-bold text-slate-900">Confidential Journal</h3>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Private notes, visited trip history, interest level ratings, and custom scouting budgets per destination.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Saved countries list
  const savedCountries = countries.filter(c => userProfile.savedCountryIds.includes(c.id));

  // My RSVP'd meetups
  const rsvpedMeetups = meetups.filter(m => userProfile.rsvpMeetupIds.includes(m.id));

  // Checklist calculations
  const completedTasks = checklist.filter(t => t.completed).length;
  const progressPercent = checklist.length > 0 ? Math.round((completedTasks / checklist.length) * 100) : 0;

  // Check if user knows the target haven language
  const targetCountryData = countries.find(c => c.name.toLowerCase() === userProfile.targetCountry.toLowerCase());
  const targetLanguage = targetCountryData?.language || '';
  const knowsTargetLanguage = userProfile.languagesKnown?.some(
    l => targetLanguage.toLowerCase().includes(l.language.toLowerCase()) || l.language.toLowerCase().includes(targetLanguage.toLowerCase())
  );

  // Financial summary metrics for top banner
  const userSalaryUSD = userProfile.finances?.currentSalaryUSD || 120000;
  const userMonthlySalaryUSD = userProfile.finances?.monthlySalaryUSD || Math.round(userSalaryUSD / 12);
  const userNetWorthUSD = userProfile.finances
    ? (userProfile.finances.investments.savingsUSD +
       userProfile.finances.investments.stocksMutualFundsUSD +
       userProfile.finances.investments.realEstateUSD +
       userProfile.finances.investments.goldUSD +
       userProfile.finances.investments.othersUSD -
       (userProfile.finances.totalLiabilitiesUSD || 0))
    : 835000;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner & Profile Overview */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs">
        <div className="flex items-start sm:items-center gap-5">
          
          {/* Avatar with Click-to-update */}
          <div className="relative group shrink-0">
            {userProfile.avatarUrl ? (
              <img
                src={userProfile.avatarUrl}
                alt={userProfile.name}
                className="w-20 h-20 rounded-full object-cover ring-4 ring-orange-500/20 shadow-sm"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold text-2xl shadow-sm ring-4 ring-orange-500/20">
                {userProfile.name.charAt(0)}
              </div>
            )}
            <button
              onClick={() => openEditProfile('picture')}
              title="Change profile picture"
              className="absolute inset-0 rounded-full bg-slate-900/60 text-white opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-[10px] font-semibold"
            >
              <Camera className="w-4 h-4 mb-0.5" />
              <span>Change</span>
            </button>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900">{userProfile.name}</h1>
              <code className="text-xs font-mono font-bold bg-purple-50 text-purple-900 border border-purple-200 px-2.5 py-0.5 rounded">
                ID: {currentUserId}
              </code>
              <span className="text-xs bg-orange-50 text-orange-900 border border-orange-200 px-2.5 py-0.5 rounded font-medium">
                {userProfile.role === 'admin' ? 'Platform Administrator' : 'Retiree Member'}
              </span>
              {userProfile.relocationStatus && (
                <span className="text-xs bg-purple-50 text-purple-900 border border-purple-200 px-2.5 py-0.5 rounded-full font-semibold">
                  {userProfile.relocationStatus}
                </span>
              )}
            </div>

            {/* Clean unboxed metadata with typographic separators */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1.5">
              <span className="inline-flex items-center gap-1.5">
                <span>Origin Country / Nationality:</span>
                <strong className="text-slate-800 inline-flex items-center gap-1">
                  <CountryFlag countryName={userProfile.originCountry} size="xs" className="rounded-xs" />
                  <span>{userProfile.originCountry}</span>
                </strong>
              </span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1.5">
                <span>Residing Country:</span>
                <strong className="text-slate-800 inline-flex items-center gap-1">
                  <CountryFlag countryName={userProfile.residingCountry || userProfile.originCountry} size="xs" className="rounded-xs" />
                  <span>
                    {userProfile.originCity ? `${userProfile.originCity}, ` : ''}
                    {userProfile.residingCountry || userProfile.originCountry}
                  </span>
                </strong>
              </span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1.5">
                <span>Target Haven:</span>
                <strong className="text-slate-900 inline-flex items-center gap-1">
                  <CountryFlag countryName={userProfile.targetCountry} size="xs" className="rounded-xs" />
                  <span>{userProfile.targetCountry}</span>
                </strong>
              </span>
              <span aria-hidden="true">·</span>
              <span>Departure: <strong className="font-mono text-slate-900">{userProfile.retirementTimelineYear}</strong></span>
              <span aria-hidden="true">·</span>
              <span>Current Salary: <strong className="font-mono text-slate-900">${userSalaryUSD.toLocaleString()} / yr</strong> (${userMonthlySalaryUSD.toLocaleString()}/mo)</span>
              <span aria-hidden="true">·</span>
              <span>Total Net Worth: <strong className="font-mono text-orange-950 font-bold">${userNetWorthUSD.toLocaleString()}</strong></span>
              {userProfile.occupationOrBackground && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-slate-600 italic">{userProfile.occupationOrBackground}</span>
                </>
              )}
            </div>

            <p className="text-xs text-slate-600 mt-2 max-w-2xl leading-relaxed">
              {userProfile.bio}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0 self-start md:self-auto">
          <button
            onClick={() => openEditProfile('finances')}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-orange-50 text-orange-900 border border-orange-200 hover:bg-orange-100 transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <DollarSign className="w-3.5 h-3.5 text-orange-600" />
            <span>Edit Financials</span>
          </button>
          <button
            onClick={() => openEditProfile('about')}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-orange-600 via-amber-600 to-purple-600 text-white hover:from-orange-700 hover:to-purple-700 transition-all flex items-center gap-1.5 shadow-xs"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>
          <button
            onClick={openFirebaseModal}
            className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-colors flex items-center gap-1.5 cursor-pointer ${
              firebaseUser
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900 hover:bg-emerald-100'
                : 'bg-purple-50 border-purple-200 text-purple-900 hover:bg-purple-100'
            }`}
          >
            <ShieldCheck className={`w-3.5 h-3.5 ${firebaseUser ? 'text-emerald-600' : 'text-purple-600'}`} />
            <span>{firebaseUser ? 'Cloud DB Synced' : 'Firebase DB & Hosting'}</span>
          </button>
          <button
            onClick={() => openEditProfile('travel')}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
          >
            <Globe className="w-3.5 h-3.5 text-purple-600" />
            <span>+ Add Visited Country</span>
          </button>
        </div>
      </div>

      {/* SECTION: FINANCIAL PORTFOLIO & 5 INVESTMENT SCHEMES */}
      <UserFinancialsDashboard />

      {/* SECTION: UNIFIED FIRE CALCULATOR, VISUAL PATH, MILESTONE PLANNER & INDEPENDENCE TRACKER */}
      <FireCalculatorTracker />

      {/* SECTION: UNIFIED HAVEN MATCHER AI RECOMMENDATION & FINANCIAL POTENTIAL ENGINE */}
      <HavenMatcherWidget />

      {/* SECTION: EXPAT IDENTITY, TRAVEL JOURNAL & RETIREMENT VISION */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-bold text-slate-900">
                Expat Profile, Travel History & Lifestyle Readiness
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Your logged trips, language capabilities, and personal interests that guide your relocation choices.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => openEditProfile('travel')}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
            >
              <Globe className="w-3.5 h-3.5 text-teal-700" />
              <span>Log Trip</span>
            </button>
            <button
              onClick={() => openEditProfile('languages')}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
            >
              <Languages className="w-3.5 h-3.5 text-teal-700" />
              <span>Languages</span>
            </button>
            <button
              onClick={() => openEditProfile('interests')}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
            >
              <Heart className="w-3.5 h-3.5 text-rose-600" />
              <span>Interests</span>
            </button>
          </div>
        </div>

        {/* 3-Column Profile Cards: Travel History, Languages & Interests, and About Vision */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Column 1: Travel History Log (col-span-7) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Countries Visited & Scouting Log
                </span>
                <span className="text-xs px-2 py-0.2 rounded-full bg-orange-100 text-orange-900 font-bold font-mono">
                  {userProfile.travelHistory?.length || 0}
                </span>
              </div>
              <button
                onClick={() => openEditProfile('travel')}
                className="text-xs font-semibold text-orange-700 hover:underline flex items-center gap-1"
              >
                <span>Manage Log</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {(!userProfile.travelHistory || userProfile.travelHistory.length === 0) ? (
              <div className="p-8 rounded-xl border border-dashed border-slate-300 text-center bg-slate-50/50">
                <Globe className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-medium text-slate-700">No visited countries logged yet.</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Record your past vacations and scouting trips to keep track of destinations you love.
                </p>
                <button
                  onClick={() => openEditProfile('travel')}
                  className="mt-3 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-orange-600 to-purple-600 text-white font-semibold text-xs inline-flex items-center gap-1.5 shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log First Country</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {userProfile.travelHistory.map(trip => (
                  <div
                    key={trip.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <CountryFlag
                        countryCode={trip.countryCode}
                        countryName={trip.countryName}
                        fallbackEmoji={trip.flag}
                        size="lg"
                        className="w-7 h-5 rounded-xs shrink-0 mt-0.5"
                      />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900">{trip.countryName}</h4>
                          <span className="text-[11px] font-mono text-slate-500">
                            {trip.yearVisited} ({trip.duration || 'Stay'})
                          </span>
                          <span className="text-[10px] px-2 py-0.2 rounded-full bg-slate-200/80 text-slate-700 font-medium">
                            {trip.purpose}
                          </span>
                          {trip.wouldRetireHere && (
                            <span className={`text-[10px] px-2 py-0.2 rounded-full font-semibold ${
                              trip.wouldRetireHere === 'Definitely'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : trip.wouldRetireHere === 'Maybe'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                              Retire: {trip.wouldRetireHere}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 my-1">
                          {[1, 2, 3, 4, 5].map(s => (
                            <Star
                              key={s}
                              className={`w-3 h-3 ${
                                s <= trip.rating
                                  ? 'text-amber-500 fill-amber-500'
                                  : 'text-slate-300'
                              }`}
                            />
                          ))}
                        </div>

                        {trip.favoriteSpotOrMemory && (
                          <p className="text-[11px] text-slate-700 font-medium">
                            "{trip.favoriteSpotOrMemory}"
                          </p>
                        )}
                        {trip.notes && (
                          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                            {trip.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => removeVisitedCountry(trip.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all shrink-0 self-end sm:self-auto"
                      title="Remove from history"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Column 2: Languages & Interests & Vision (col-span-5) */}
          <div className="lg:col-span-5 space-y-5">
            
            {/* Languages Known Card */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Languages className="w-4 h-4 text-teal-700" />
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Languages Known ({userProfile.languagesKnown?.length || 0})
                  </span>
                </div>
                <button
                  onClick={() => openEditProfile('languages')}
                  className="text-[11px] font-semibold text-teal-700 hover:underline"
                >
                  Edit
                </button>
              </div>

              {/* Haven Language Match Badge */}
              {knowsTargetLanguage ? (
                <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 flex items-center gap-1.5 font-medium">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Target Haven Language Match ({targetLanguage})</span>
                </div>
              ) : targetLanguage ? (
                <div className="p-2 rounded-lg bg-amber-50/80 border border-amber-200 text-[11px] text-amber-800 flex items-center justify-between gap-1 font-medium">
                  <span>Target language is <strong>{targetLanguage}</strong></span>
                  <button
                    onClick={() => openEditProfile('languages')}
                    className="text-[10px] underline hover:text-amber-900 font-semibold"
                  >
                    + Add to goals
                  </button>
                </div>
              ) : null}

              <div className="flex flex-wrap gap-2">
                {userProfile.languagesKnown?.map(lang => (
                  <div
                    key={lang.id}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white shadow-2xs flex items-center gap-1.5 text-xs"
                  >
                    <span className="font-bold text-slate-800">{lang.language}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                      lang.proficiency === 'Native'
                        ? 'bg-emerald-100 text-emerald-800'
                        : lang.proficiency === 'Fluent'
                        ? 'bg-teal-100 text-teal-800'
                        : lang.proficiency === 'Conversational'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {lang.proficiency}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Lifestyle & Expat Interests Card */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-rose-600" />
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Interests & Priorities ({userProfile.interests?.length || 0})
                  </span>
                </div>
                <button
                  onClick={() => openEditProfile('interests')}
                  className="text-[11px] font-semibold text-teal-700 hover:underline"
                >
                  Edit
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {userProfile.interests?.map((interest, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-white text-slate-700 border border-slate-200 shadow-2xs"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>

            {/* Detailed About User & Retirement Vision Card with Origin Country/Nationality & Residing Country Dropdowns */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-orange-600" />
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    About User & Retirement Vision
                  </span>
                </div>
                <button
                  onClick={() => openEditProfile('about')}
                  className="text-[11px] font-semibold text-teal-700 hover:underline"
                >
                  Edit Full Bio
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Origin Country / Nationality
                  </label>
                  <select
                    value={userProfile.originCountry || 'United States'}
                    onChange={e => updateUserProfile({ originCountry: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white font-medium text-slate-800"
                  >
                    {!WORLD_COUNTRIES.some(c => c.name === userProfile.originCountry) && userProfile.originCountry && (
                      <option value={userProfile.originCountry}>🌍 {userProfile.originCountry}</option>
                    )}
                    {WORLD_COUNTRIES.map(c => (
                      <option key={`dash-origin-${c.code}-${c.name}`} value={c.name}>
                        {c.flag} {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Residing Country
                  </label>
                  <select
                    value={userProfile.residingCountry || userProfile.originCountry || 'United States'}
                    onChange={e => updateUserProfile({ residingCountry: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white font-medium text-slate-800"
                  >
                    {!WORLD_COUNTRIES.some(c => c.name === (userProfile.residingCountry || userProfile.originCountry)) &&
                      (userProfile.residingCountry || userProfile.originCountry) && (
                        <option value={userProfile.residingCountry || userProfile.originCountry}>
                          🌍 {userProfile.residingCountry || userProfile.originCountry}
                        </option>
                      )}
                    {WORLD_COUNTRIES.map(c => (
                      <option key={`dash-residing-${c.code}-${c.name}`} value={c.name}>
                        {c.flag} {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {userProfile.aboutMe ? (
                <p className="text-xs text-slate-600 leading-relaxed italic pt-1 border-t border-slate-200/70">
                  "{userProfile.aboutMe}"
                </p>
              ) : (
                <p className="text-xs text-slate-500 leading-relaxed pt-1 border-t border-slate-200/70">
                  {userProfile.bio}
                </p>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Country Journal & Candidacy Tracker */}
      <CountryJournal />

      {/* Relocation Readiness Progress & Checklist */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-bold text-slate-900">
                Relocation Readiness Milestone Checklist
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Essential legal, tax, medical, and logistical steps before departing for your chosen haven.
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="text-right">
              <span className="text-xs font-mono tabular-nums font-bold text-orange-950 text-base">
                {progressPercent}%
              </span>
              <span className="text-[11px] text-slate-400 block font-normal">
                {completedTasks} of {checklist.length} Completed
              </span>
            </div>

            <button
              onClick={() => setIsAddTaskOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-orange-600 to-purple-600 text-white text-xs font-semibold hover:from-orange-700 hover:to-purple-700 transition-all flex items-center gap-1 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Step</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-2.5 rounded-full mt-4 overflow-hidden">
          <div
            className="bg-gradient-to-r from-orange-500 via-amber-500 to-purple-600 h-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Checklist items */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
          {checklist.map(task => (
            <div
              key={task.id}
              onClick={() => toggleChecklistTask(task.id)}
              className={`p-3.5 rounded-xl border text-left cursor-pointer transition-colors flex items-start gap-3 ${
                task.completed
                  ? 'bg-purple-50/50 border-purple-200'
                  : 'bg-slate-50/50 border-slate-200 hover:bg-slate-100/50'
              }`}
            >
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => {}} // handled by container onClick
                className="mt-1 h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold ${task.completed ? 'text-slate-600 line-through' : 'text-slate-900'}`}>
                    {task.title}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">({task.category})</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  {task.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Applied Visa Tracker */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-teal-700" />
          <h2 className="text-lg font-bold text-slate-900">
            Active Visa & Consular Application Tracker
          </h2>
        </div>

        <div className="space-y-3">
          {userProfile.appliedVisas.map((visa, idx) => (
            <div key={idx} className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-semibold text-teal-800 uppercase tracking-wider block">Target: {visa.countryId.toUpperCase()}</span>
                <h4 className="text-sm font-bold text-slate-900 mt-0.5">{visa.visaName}</h4>
                <p className="text-xs text-slate-500 mt-0.5">Consulate processing file #PT-2026-8819A</p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                  {visa.status}
                </span>
                <button
                  onClick={() => navigateToCountry(visa.countryId)}
                  className="text-xs font-semibold text-teal-700 hover:underline"
                >
                  View Guide
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Saved Country Shortlist */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-teal-700" />
            <h2 className="text-lg font-bold text-slate-900">
              Saved Country Shortlist ({savedCountries.length})
            </h2>
          </div>
          <button
            onClick={() => setCurrentView('explore')}
            className="text-xs font-semibold text-teal-800 hover:underline"
          >
            Browse More Countries →
          </button>
        </div>

        {savedCountries.length === 0 ? (
          <div className="text-center py-10">
            <Heart className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500">You haven't saved any countries yet.</p>
            <button
              onClick={() => setCurrentView('explore')}
              className="mt-3 px-3.5 py-1.5 rounded-lg bg-teal-800 text-white text-xs font-semibold"
            >
              Explore Top 15 Destinations
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {savedCountries.map(country => {
              const journal = journalEntries[country.id];
              return (
                <div
                  key={country.id}
                  className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between hover:border-slate-300 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <CountryFlag
                        countryCode={country.code}
                        countryName={country.name}
                        fallbackEmoji={country.flag}
                        size="xl"
                        className="w-9 h-6 rounded-xs"
                      />
                      <div className="flex items-center gap-1.5">
                        {journal && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                            {journal.interestLevel}
                          </span>
                        )}
                        <span className="font-mono tabular-nums text-xs font-bold text-teal-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                          ${country.costOfLiving.monthlyBudgetSingleUSD.toLocaleString()}/mo
                        </span>
                      </div>
                    </div>
                    <h3 className="text-base font-bold text-slate-900">{country.name}</h3>
                    <p className="text-xs text-slate-600 line-clamp-2 mt-1 mb-3">
                      {country.tagline}
                    </p>
                    <div className="space-y-1 text-xs text-slate-500 mb-2">
                      <div>Visa: {country.visa.retirementVisaName}</div>
                      <div>Healthcare: {country.lifestyle.healthcareScore}/100</div>
                      <div>Sunny Days: {country.climate.annualSunnyDays} d/yr</div>
                    </div>

                    {/* Financial Potential Badge for Saved Country */}
                    <div className="mb-3 p-2 rounded-lg bg-teal-50/80 border border-teal-200/80 flex items-center justify-between text-[11px]">
                      <span className="text-teal-900 font-semibold flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-teal-700" />
                        <span>Runway ({userMonthlySalaryUSD >= country.visa.minimumIncomeUSD ? 'Visa Ready' : 'Income Check'}):</span>
                      </span>
                      <span className="font-mono font-bold text-teal-950">
                        {Math.round((userNetWorthUSD / (country.costOfLiving.monthlyBudgetSingleUSD * 12)) * 10) / 10} yrs
                      </span>
                    </div>

                    {journal?.privateNotes && (
                      <div className="p-2.5 rounded-lg bg-white border border-slate-200/80 text-[11px] text-slate-700 italic line-clamp-2 flex items-start gap-1.5">
                        <BookOpen className="w-3 h-3 text-teal-700 shrink-0 mt-0.5 not-italic" />
                        <span>"{journal.privateNotes}"</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between">
                    <button
                      onClick={() => navigateToCountry(country.id)}
                      className="text-xs font-bold text-teal-800 hover:underline flex items-center gap-1"
                    >
                      <span>Open Dossier</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    {journal?.scoutingTimeline && (
                      <span className="text-[10px] text-slate-400 font-medium">
                        Trip: {journal.scoutingTimeline}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* RSVP'd Meetups */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-teal-700" />
            <h2 className="text-lg font-bold text-slate-900">
              My RSVP'd Expat Meetups ({rsvpedMeetups.length})
            </h2>
          </div>
          <button
            onClick={() => setCurrentView('meetups')}
            className="text-xs font-semibold text-teal-800 hover:underline"
          >
            Find More Meetups →
          </button>
        </div>

        {rsvpedMeetups.length === 0 ? (
          <p className="text-xs text-slate-500 py-4">
            You haven't RSVP'd to any events yet. Check out the Expat Meetups tab to join informal coffee chats and wine nights!
          </p>
        ) : (
          <div className="space-y-3">
            {rsvpedMeetups.map(meetup => (
              <div key={meetup.id} className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-bold text-teal-800">{meetup.countryName}</span>
                    <span aria-hidden="true">·</span>
                    <span>{meetup.city}</span>
                    <span aria-hidden="true">·</span>
                    <span>{meetup.date} ({meetup.time})</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mt-1">{meetup.title}</h4>
                  <p className="text-xs text-slate-600 mt-0.5">{meetup.location}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => toggleRsvpMeetup(meetup.id)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:text-rose-600 border border-slate-300 rounded-lg"
                  >
                    Cancel RSVP
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>



      {/* Add Custom Task Modal */}
      {isAddTaskOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">Add Relocation Step</h3>
              <button onClick={() => setIsAddTaskOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTask} className="space-y-4 mt-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Milestone Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Schedule pet health certificate appointment"
                  value={newTaskTitle}
                  onChange={e => setNewTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Category</label>
                <select
                  value={newTaskCategory}
                  onChange={e => setNewTaskCategory(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="Legal & Visas">Legal & Visas</option>
                  <option value="Financial">Financial</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Logistics & Housing">Logistics & Housing</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Description / Notes</label>
                <textarea
                  rows={2}
                  placeholder="Details, phone numbers, or paperwork instructions..."
                  value={newTaskDesc}
                  onChange={e => setNewTaskDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddTaskOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-teal-800 text-white hover:bg-teal-900"
                >
                  Add Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
