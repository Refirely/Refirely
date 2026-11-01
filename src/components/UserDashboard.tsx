import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ScoutTrip, ScoutScheduledItineraryItem } from '../types';
import { DAY_SLOT_OPTIONS, buildGoogleMapsSearchUrl } from '../data/scoutVenueRecommendations';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { doc, setDoc, getDocs, deleteDoc, collection } from 'firebase/firestore';
import { HavenMatcherWidget } from './HavenMatcherWidget';
import { CountryJournal } from './CountryJournal';
import { UserFinancialsDashboard } from './UserFinancialsDashboard';
import { FireCalculatorTracker } from './FireCalculatorTracker';
import { WORLD_COUNTRIES, getWorldCountryFlag, ALL_INTEREST_SUGGESTIONS } from '../data/userAccounts';
import { CountryFlag } from './CountryFlag';
import {
  User, CheckSquare, Calendar, Compass,
  DollarSign, ArrowRight, Plus, Heart, Edit3, Save, X, Sparkles, FileText,
  Globe, Languages, Star, MapPin, Camera, Check, Trash2, ExternalLink, BookOpen,
  TrendingUp, ShieldCheck, Lock, LogIn, UserPlus, Shield, Coins, LayoutDashboard, Layers
} from 'lucide-react';
import { motion } from 'motion/react';

export type UserDashboardTab =
  | 'overview'
  | 'scout'
  | 'matcher'
  | 'financials'
  | 'fire'
  | 'profile'
  | 'journal'
  | 'checklist'
  | 'all';

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
    publicMemberAccounts,
    openPublicProfile,
    toggleInterest,
    currentPersona,
    setCurrentPersona,
  } = useApp();

  // Active dashboard module tab (persisted for smooth navigation)
  const [activeTab, setActiveTab] = useState<UserDashboardTab>(() => {
    try {
      const saved = localStorage.getItem('refirely_user_dashboard_tab') as UserDashboardTab | null;
      if (
        saved &&
        ['overview', 'scout', 'matcher', 'financials', 'fire', 'profile', 'journal', 'checklist', 'all'].includes(saved)
      ) {
        return saved;
      }
    } catch {}
    return 'overview';
  });

  const handleSelectTab = (tab: UserDashboardTab) => {
    setActiveTab(tab);
    try {
      localStorage.setItem('refirely_user_dashboard_tab', tab);
    } catch {}
  };

  // Saved Scout & Hop Trips & Complete Chosen Itinerary State
  const [savedScoutTrips, setSavedScoutTrips] = useState<ScoutTrip[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string>('');
  const [dashboardTripStatusMsg, setDashboardTripStatusMsg] = useState<string | null>(null);
  const [newDashSpotTitle, setNewDashSpotTitle] = useState<string>('');
  const [newDashSpotNeighborhood, setNewDashSpotNeighborhood] = useState<string>('');
  const [newDashSpotWeek, setNewDashSpotWeek] = useState<number>(1);
  const [newDashSpotDay, setNewDashSpotDay] = useState<string>('Day 5 (Fri)');

  useEffect(() => {
    if (!isAuthenticated || currentUserId === 'guest') {
      setSavedScoutTrips([]);
      return;
    }

    let localTrips: ScoutTrip[] = [];
    try {
      const userRaw = localStorage.getItem(`refirely_saved_trips_${currentUserId}`);
      const latestRaw = localStorage.getItem('refirely_saved_trips_latest');
      const parsedUser: ScoutTrip[] = userRaw ? JSON.parse(userRaw) : [];
      const parsedLatest: ScoutTrip[] = latestRaw ? JSON.parse(latestRaw) : [];
      const map = new Map<string, ScoutTrip>();
      parsedLatest.forEach(t => {
        if (t && t.id) map.set(t.id, t);
      });
      parsedUser.forEach(t => {
        if (t && t.id) map.set(t.id, t);
      });
      localTrips = Array.from(map.values()).sort((a, b) =>
        (b.updatedAt || '').localeCompare(a.updatedAt || '')
      );
      setSavedScoutTrips(localTrips);
      if (localTrips.length > 0 && !selectedTripId) {
        setSelectedTripId(localTrips[0].id);
      }
    } catch {}

    if (auth.currentUser) {
      const uid = auth.currentUser.uid;
      getDocs(collection(db, 'users', uid, 'trips'))
        .then(snap => {
          const cloudList: ScoutTrip[] = [];
          snap.forEach(d => cloudList.push(d.data() as ScoutTrip));
          if (cloudList.length > 0) {
            const mergedMap = new Map<string, ScoutTrip>();
            localTrips.forEach(t => mergedMap.set(t.id, t));
            cloudList.forEach(t => mergedMap.set(t.id, t));
            const merged = Array.from(mergedMap.values()).sort((a, b) =>
              (b.updatedAt || '').localeCompare(a.updatedAt || '')
            );
            setSavedScoutTrips(merged);
            if (merged.length > 0 && !selectedTripId) {
              setSelectedTripId(merged[0].id);
            }
            try {
              localStorage.setItem(`refirely_saved_trips_${currentUserId}`, JSON.stringify(merged));
              localStorage.setItem('refirely_saved_trips_latest', JSON.stringify(merged));
            } catch {}
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated, currentUserId, firebaseUser]);

  const activeScoutTrip =
    savedScoutTrips.find(t => t.id === selectedTripId) || savedScoutTrips[0] || null;

  const persistUpdatedScoutTripFromDashboard = async (updatedTrip: ScoutTrip, msg?: string) => {
    const stamped: ScoutTrip = {
      ...updatedTrip,
      updatedAt: new Date().toISOString().slice(0, 40),
    };
    const nextList = savedScoutTrips.map(t => (t.id === stamped.id ? stamped : t));
    setSavedScoutTrips(nextList);

    try {
      localStorage.setItem(`refirely_saved_trips_${currentUserId}`, JSON.stringify(nextList));
      localStorage.setItem('refirely_saved_trips_latest', JSON.stringify(nextList));
      localStorage.setItem('refirely_scout_draft', JSON.stringify(stamped));
      localStorage.setItem('refirely_scout_discovery_v2', JSON.stringify(stamped));
    } catch {}

    if (auth.currentUser) {
      const path = `users/${auth.currentUser.uid}/trips/${stamped.id}`;
      try {
        await setDoc(doc(db, 'users', auth.currentUser.uid, 'trips', stamped.id), stamped);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    }

    if (msg) {
      setDashboardTripStatusMsg(msg);
      setTimeout(() => setDashboardTripStatusMsg(null), 4000);
    }
  };

  const handleOpenTripInScoutPlanner = (
    trip: ScoutTrip,
    initialTab: 'map-itinerary' | 'complete-itinerary' = 'complete-itinerary'
  ) => {
    try {
      localStorage.setItem(
        'refirely_active_edit_trip',
        JSON.stringify({ trip, initialTab })
      );
      localStorage.setItem('refirely_scout_draft', JSON.stringify(trip));
      localStorage.setItem('refirely_scout_discovery_v2', JSON.stringify(trip));
    } catch {}
    setCurrentView('scout');
  };

  const handleDeleteScoutTripFromDashboard = async (tripId: string) => {
    const nextList = savedScoutTrips.filter(t => t.id !== tripId);
    setSavedScoutTrips(nextList);
    if (selectedTripId === tripId) {
      setSelectedTripId(nextList[0]?.id || '');
    }
    try {
      localStorage.setItem(`refirely_saved_trips_${currentUserId}`, JSON.stringify(nextList));
      localStorage.setItem('refirely_saved_trips_latest', JSON.stringify(nextList));
    } catch {}
    if (auth.currentUser) {
      const path = `users/${auth.currentUser.uid}/trips/${tripId}`;
      try {
        await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'trips', tripId));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, path);
      }
    }
  };

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
        {/* Security & Privacy Lock Hero - Multi-Colored Gradient & Ambient Glow */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 26 }}
          className="bg-gradient-to-br from-indigo-50/90 via-white to-amber-50/85 rounded-3xl border border-indigo-200/80 p-8 sm:p-12 shadow-lg text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 via-indigo-500 via-50% to-amber-500" />
          <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-indigo-400/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-amber-400/15 blur-3xl" />
          
          <motion.div
            whileHover={{ rotate: 6, scale: 1.06 }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-teal-500 text-white flex items-center justify-center mx-auto mb-5 shadow-md shadow-indigo-500/20"
          >
            <Lock className="w-8 h-8" />
          </motion.div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-indigo-100/80 via-purple-100/80 to-amber-100/80 border border-indigo-200/80 text-indigo-950 text-xs font-bold uppercase tracking-wider mb-3 shadow-2xs">
            <Shield className="w-3.5 h-3.5 text-indigo-600" />
            <span>Session Status: Logged Out · Personal Data Protected</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight max-w-2xl mx-auto">
            Personal Dashboard &amp;{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-teal-600 bg-clip-text text-transparent">
              Financial Ledger Locked
            </span>
          </h1>

          <p className="text-slate-600 text-sm max-w-xl mx-auto mt-3 leading-relaxed">
            You are currently logged out. To ensure strict privacy, your personal details — including current salary, 5-scheme net worth portfolio (Savings, Stocks/Mutual Funds, Real Estate, Gold, and Others), relocation timeline, checklist milestones, and confidential country journal notes — are hidden.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-8 relative">
            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => openAuthModal('login')}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700 text-white font-bold text-sm transition-all shadow-md shadow-indigo-600/20 flex items-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Log In to Your Account</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => openAuthModal('signup')}
              className="px-6 py-2.5 rounded-xl border border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 text-amber-950 font-bold text-sm transition-all shadow-2xs flex items-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-amber-700" />
              <span>Create Free Account</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={loginWithGoogle}
              className="px-6 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-all shadow-2xs flex items-center gap-2 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue with Google</span>
            </motion.button>
          </div>

          {/* Public Expat Member Profiles Preview (Strictly Non-Admin & Privacy-Protected) */}
          <div className="mt-10 pt-8 border-t border-indigo-100/80 text-left relative">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-teal-700" />
                <span>Connect with Verified Expat Members (Public Profiles):</span>
              </span>
              <span className="text-[11px] text-slate-400">
                Click any member to view visited countries, languages &amp; interests
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {publicMemberAccounts.slice(0, 3).map(account => (
                <motion.button
                  key={account.id}
                  whileHover={{ y: -3, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => openPublicProfile(account.id)}
                  className="p-3.5 rounded-xl border border-indigo-200/70 hover:border-teal-400 bg-white/90 hover:bg-gradient-to-br hover:from-white hover:to-teal-50/50 text-left transition-all group flex items-start gap-3 shadow-xs cursor-pointer"
                >
                  <img
                    src={account.profile.avatarUrl}
                    alt={account.name}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-200 group-hover:ring-teal-500 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-900 group-hover:text-teal-950 truncate">
                        {account.name}
                      </p>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600 shrink-0 transition-transform group-hover:translate-x-0.5" />
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">
                      {getWorldCountryFlag(account.profile.originCountry)} {account.profile.originCountry} →{' '}
                      {getWorldCountryFlag(account.profile.residingCountry || account.profile.originCountry)}{' '}
                      {account.profile.residingCountry || account.profile.originCountry}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1 text-[10px] text-teal-700 font-semibold">
                      <span>{(account.profile.travelHistory || []).length} countries visited</span>
                      <span aria-hidden="true">·</span>
                      <span>View Public Profile</span>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* What Unlocks Preview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div whileHover={{ y: -4 }} className="bg-gradient-to-br from-amber-50/80 via-white to-orange-50/60 rounded-2xl border border-amber-200/80 p-5 shadow-xs space-y-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center font-bold shadow-xs">
              <DollarSign className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-bold text-slate-900">5-Scheme Financial Ledger</h3>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Log current salary and net worth across cash, stocks, real estate equity, physical gold, and alternative schemes.
            </p>
          </motion.div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-2">
            <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-800 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-xs font-bold text-slate-900">Haven Potential Matrix</h3>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Instant eligibility matching comparing your assets &amp; remote income against Digital Nomad Visas (D8, DNV, DTV) and Retirement Visas (D7, Non-Lucrative).
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


  // My RSVP'd meetups
  const rsvpedMeetups = meetups.filter(m => userProfile.rsvpMeetupIds.includes(m.id));
  const journalEntryList = Object.values(journalEntries || {});

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

  const moduleTabs: {
    id: UserDashboardTab;
    label: string;
    shortLabel: string;
    badge: string;
    icon: React.ReactNode;
    activeClass: string;
  }[] = [
    {
      id: 'overview',
      label: 'All-Modules Overview',
      shortLabel: 'Overview',
      badge: '7 Modules',
      icon: <LayoutDashboard className="w-3.5 h-3.5" />,
      activeClass: 'bg-slate-900 text-white shadow-sm',
    },
    {
      id: 'scout',
      label: 'Scout & Hop Itineraries',
      shortLabel: 'Scout & Hop',
      badge: `${savedScoutTrips.length} Saved`,
      icon: <Compass className="w-3.5 h-3.5" />,
      activeClass: 'bg-gradient-to-r from-teal-600 via-indigo-600 to-violet-600 text-white shadow-sm',
    },
    {
      id: 'matcher',
      label: 'Haven Matcher AI',
      shortLabel: 'Haven Matcher',
      badge: `${countries.length} Havens`,
      icon: <Sparkles className="w-3.5 h-3.5" />,
      activeClass: 'bg-gradient-to-r from-indigo-600 via-violet-600 to-teal-600 text-white shadow-sm',
    },
    {
      id: 'financials',
      label: '5-Scheme Financials',
      shortLabel: 'Financials',
      badge: `$${Math.round(userNetWorthUSD / 1000)}k`,
      icon: <Coins className="w-3.5 h-3.5" />,
      activeClass: 'bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 text-white shadow-sm',
    },
    {
      id: 'fire',
      label: 'FIRE & Runway Calc',
      shortLabel: 'FIRE & Runway',
      badge: `${userProfile.retirementTimelineYear}`,
      icon: <TrendingUp className="w-3.5 h-3.5" />,
      activeClass: 'bg-gradient-to-r from-teal-600 via-emerald-600 to-indigo-600 text-white shadow-sm',
    },
    {
      id: 'profile',
      label: 'Expat Profile & Travel',
      shortLabel: 'Profile & Trips',
      badge: `${userProfile.travelHistory?.length || 0} Trips`,
      icon: <Globe className="w-3.5 h-3.5" />,
      activeClass: 'bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white shadow-sm',
    },
    {
      id: 'journal',
      label: 'Country Journal',
      shortLabel: 'Journal',
      badge: `${journalEntryList.length}`,
      icon: <BookOpen className="w-3.5 h-3.5" />,
      activeClass: 'bg-gradient-to-r from-amber-600 to-teal-600 text-white shadow-sm',
    },
    {
      id: 'checklist',
      label: 'Checklist, Visas & Meetups',
      shortLabel: 'Checklist & Visas',
      badge: `${progressPercent}%`,
      icon: <CheckSquare className="w-3.5 h-3.5" />,
      activeClass: 'bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 text-white shadow-sm',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Banner & Profile Overview - Multi-Colored Luminous Header */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="relative overflow-hidden bg-gradient-to-br from-indigo-50/90 via-white to-teal-50/85 rounded-3xl border border-indigo-200/80 p-6 sm:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-md shadow-indigo-950/5"
      >
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 via-indigo-500 via-50% to-amber-500" />
        <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-indigo-400/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-teal-400/15 blur-3xl" />

        <div className="relative flex items-start sm:items-center gap-5 flex-1 min-w-0">
          
          {/* Avatar with Click-to-update */}
          <div className="relative group shrink-0">
            {userProfile.avatarUrl ? (
              <img
                src={userProfile.avatarUrl}
                alt={userProfile.name}
                className="w-20 h-20 rounded-full object-cover ring-4 ring-indigo-500/25 shadow-md"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-600 via-violet-600 to-teal-500 text-white flex items-center justify-center font-bold text-2xl shadow-md ring-4 ring-indigo-500/25">
                {userProfile.name.charAt(0)}
              </div>
            )}
            <button
              onClick={() => openEditProfile('picture')}
              title="Change profile picture"
              className="absolute inset-0 rounded-full bg-slate-900/60 text-white opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-[10px] font-semibold cursor-pointer"
            >
              <Camera className="w-4 h-4 mb-0.5" />
              <span>Change</span>
            </button>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900">{userProfile.name}</h1>
              <code className="text-xs font-mono font-bold bg-purple-50 text-purple-900 border border-purple-200 px-2.5 py-0.5 rounded">
                ID: {currentUserId}
              </code>
              <span className="text-xs bg-orange-50 text-orange-900 border border-orange-200 px-2.5 py-0.5 rounded font-medium">
                {userProfile.role === 'admin'
                  ? 'Platform Administrator'
                  : currentPersona === 'nomad'
                  ? '⚡ Nomad & Creator Member'
                  : '🌿 Retiree Member'}
              </span>
              {userProfile.relocationStatus && (
                <span className="text-xs bg-purple-50 text-purple-900 border border-purple-200 px-2.5 py-0.5 rounded-full font-semibold">
                  {userProfile.relocationStatus}
                </span>
              )}
            </div>

            {/* Clean unboxed metadata with typographic separators */}
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-500 mt-2">
              <span className="inline-flex items-center gap-1.5">
                <span>Origin Country / Nationality:</span>
                <strong className="text-slate-800 inline-flex items-center gap-1">
                  <CountryFlag countryName={userProfile.originCountry} size="xs" className="rounded-xs" />
                  <span>{userProfile.originCountry}</span>
                </strong>
              </span>
              <span aria-hidden="true" className="text-slate-300">·</span>
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
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="inline-flex items-center gap-1.5">
                <span>Target Haven:</span>
                <strong className="text-slate-900 inline-flex items-center gap-1">
                  <CountryFlag countryName={userProfile.targetCountry} size="xs" className="rounded-xs" />
                  <span>{userProfile.targetCountry}</span>
                </strong>
              </span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span>Departure: <strong className="font-mono text-slate-900">{userProfile.retirementTimelineYear}</strong></span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span>Current Salary: <strong className="font-mono text-slate-900">${userSalaryUSD.toLocaleString()} / yr</strong> (${userMonthlySalaryUSD.toLocaleString()}/mo)</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span>Total Net Worth: <strong className="font-mono text-orange-950 font-bold">${userNetWorthUSD.toLocaleString()}</strong></span>
              {userProfile.occupationOrBackground && (
                <>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span className="text-slate-600 italic">{userProfile.occupationOrBackground}</span>
                </>
              )}
            </div>

            {userProfile.bio && (
              <p className="text-xs text-slate-600 mt-2 max-w-3xl leading-relaxed">
                {userProfile.bio}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start lg:self-center">
          {userProfile.role !== 'admin' && currentUserId !== 'usr-ganesh' && (
            <button
              onClick={() => openPublicProfile(currentUserId)}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-teal-50 text-teal-900 border border-teal-200 hover:bg-teal-100 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer whitespace-nowrap"
            >
              <ExternalLink className="w-3.5 h-3.5 text-teal-700" />
              <span>My Public Profile</span>
            </button>
          )}
          <button
            onClick={() => openEditProfile('finances')}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-orange-50 text-orange-900 border border-orange-200 hover:bg-orange-100 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer whitespace-nowrap"
          >
            <DollarSign className="w-3.5 h-3.5 text-orange-600" />
            <span>Edit Financials</span>
          </button>
          <button
            onClick={() => openEditProfile('about')}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-orange-600 via-amber-600 to-purple-600 text-white hover:from-orange-700 hover:to-purple-700 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer whitespace-nowrap"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>
          <button
            onClick={openFirebaseModal}
            className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
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
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-indigo-200 bg-white/90 text-indigo-900 hover:bg-indigo-50 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-2xs"
          >
            <Globe className="w-3.5 h-3.5 text-indigo-600" />
            <span>+ Add Visited Country</span>
          </button>
        </div>
      </motion.div>

      {/* STICKY MODULE NAVIGATION BAR (Admin-Style Modular Tabs) */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 p-2.5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-100 px-1">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-bold uppercase tracking-wider text-[11px] text-slate-400">
              Member Workspace
            </span>
            <span aria-hidden="true">/</span>
            <span className="text-slate-900 font-bold">
              {activeTab === 'overview' && 'All-Modules Executive Overview'}
              {activeTab === 'scout' && `Saved Scout & Hop Roadmaps & Itineraries (${savedScoutTrips.length})`}
              {activeTab === 'matcher' && 'Haven Matcher AI & Visa Eligibility Engine'}
              {activeTab === 'financials' && '5-Scheme Financial Portfolio & Net Worth Ledger'}
              {activeTab === 'fire' && 'Unified FIRE Target & Nomad Runway Calculator'}
              {activeTab === 'profile' && 'Expat Profile, Travel History & Lifestyle Readiness'}
              {activeTab === 'journal' && `Confidential Country Journal (${journalEntryList.length})`}
              {activeTab === 'checklist' && `Relocation Checklist (${progressPercent}%), Visas & Meetups`}
              {activeTab === 'all' && 'Full-Scroll View (All Modules Expanded)'}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Dual-Persona Quick Switch */}
            <div className="inline-flex items-center p-0.5 rounded-lg bg-slate-100 border border-slate-200/80 text-[11px]">
              <button
                type="button"
                onClick={() => setCurrentPersona('retiree')}
                className={`px-2 py-1 rounded-md font-bold transition-all cursor-pointer ${
                  currentPersona === 'retiree'
                    ? 'bg-teal-700 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🌿 Retiree
              </button>
              <button
                type="button"
                onClick={() => setCurrentPersona('nomad')}
                className={`px-2 py-1 rounded-md font-bold transition-all cursor-pointer ${
                  currentPersona === 'nomad'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ⚡ Nomad
              </button>
            </div>

            {activeTab !== 'overview' && (
              <button
                type="button"
                onClick={() => handleSelectTab('overview')}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition-colors flex items-center gap-1 cursor-pointer"
              >
                <LayoutDashboard className="w-3 h-3" />
                <span>Overview</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => handleSelectTab(activeTab === 'all' ? 'overview' : 'all')}
              className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-colors flex items-center gap-1 cursor-pointer border ${
                activeTab === 'all'
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-900'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
              title="Toggle between single-module tabs and full-page scroll view"
            >
              <Layers className="w-3 h-3" />
              <span>{activeTab === 'all' ? 'Tabbed View' : 'Show All'}</span>
            </button>
          </div>
        </div>

        {/* Module Tab Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {moduleTabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleSelectTab(tab.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                  isActive
                    ? tab.activeClass
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950 bg-slate-50/70 border border-slate-200/60'
                }`}
              >
                {tab.icon}
                <span className="hidden md:inline">{tab.label}</span>
                <span className="md:hidden">{tab.shortLabel}</span>
                <span
                  className={`font-mono tabular-nums text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-700'
                  }`}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* TAB 0: ALL-MODULES EXECUTIVE OVERVIEW (Admin-Style Command Center)    */}
      {/* ===================================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Quick KPI Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <button
              type="button"
              onClick={() => handleSelectTab('matcher')}
              className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/90 via-white to-teal-50/70 border border-indigo-200/80 text-left hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-xs text-indigo-700 font-bold mb-1">
                <span>Haven Matcher AI</span>
                <Sparkles className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-lg font-extrabold text-slate-900 font-mono">
                {countries.length} Havens
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                {currentPersona === 'nomad' ? '⚡ Nomad & DNV Lens' : '🌿 Early Retiree Lens'}
              </p>
            </button>

            <button
              type="button"
              onClick={() => handleSelectTab('financials')}
              className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/90 via-white to-orange-50/70 border border-amber-200/80 text-left hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-xs text-amber-800 font-bold mb-1">
                <span>Net Worth Ledger</span>
                <Coins className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-lg font-extrabold text-slate-900 font-mono">
                ${userNetWorthUSD.toLocaleString()}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                ${userMonthlySalaryUSD.toLocaleString()}/mo income · 5 Schemes
              </p>
            </button>

            <button
              type="button"
              onClick={() => handleSelectTab('fire')}
              className="p-4 rounded-2xl bg-gradient-to-br from-teal-50/90 via-white to-emerald-50/70 border border-teal-200/80 text-left hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-xs text-teal-800 font-bold mb-1">
                <span>FIRE &amp; Runway</span>
                <TrendingUp className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-lg font-extrabold text-slate-900 font-mono">
                {userProfile.retirementTimelineYear}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                Target budget ${userProfile.monthlyBudgetUSD.toLocaleString()}/mo
              </p>
            </button>

            <button
              type="button"
              onClick={() => handleSelectTab('profile')}
              className="p-4 rounded-2xl bg-gradient-to-br from-violet-50/90 via-white to-purple-50/70 border border-violet-200/80 text-left hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-xs text-violet-800 font-bold mb-1">
                <span>Visited &amp; Profile</span>
                <Globe className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-lg font-extrabold text-slate-900 font-mono">
                {userProfile.travelHistory?.length || 0} Trips
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                {userProfile.languagesKnown?.length || 0} languages · {userProfile.interests?.length || 0} interests
              </p>
            </button>

            <button
              type="button"
              onClick={() => handleSelectTab('journal')}
              className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/80 via-white to-teal-50/70 border border-amber-200/80 text-left hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-xs text-amber-900 font-bold mb-1">
                <span>Country Journal</span>
                <BookOpen className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-lg font-extrabold text-slate-900 font-mono">
                {journalEntryList.length} Notes
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                Private scouting &amp; candidacy log
              </p>
            </button>

            <button
              type="button"
              onClick={() => handleSelectTab('checklist')}
              className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/90 via-white to-indigo-50/70 border border-emerald-200/80 text-left hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-xs text-emerald-800 font-bold mb-1">
                <span>Checklist &amp; Visas</span>
                <CheckSquare className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-lg font-extrabold text-slate-900 font-mono">
                {progressPercent}% Done
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                {completedTasks}/{checklist.length} tasks · {userProfile.appliedVisas.length} visas
              </p>
            </button>
          </div>

          {/* Scout & Hop Planner Quick-Launch Banner */}
          <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-teal-950 rounded-3xl border border-indigo-500/30 p-5 sm:p-6 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  ✨ New Module
                </span>
                <span className="text-xs text-teal-300 font-semibold">Cloud-Synced to Your Account</span>
              </div>
              <h3 className="text-base sm:text-lg font-extrabold tracking-tight font-display">
                Scout &amp; Hop: Sabbatical &amp; Visa Route Planner
              </h3>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                Map multi-stop scouting itineraries, track your live Schengen 90/180-day allowance, calculate monthly living burn across stops, and manage your relocation tasks &amp; packing vault.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCurrentView('scout')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 via-violet-500 to-teal-500 hover:from-indigo-600 hover:to-teal-600 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              <span>Open Scout &amp; Hop Planner</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 6 Interactive Module Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Module 1: Haven Matcher AI */}
            <div className="bg-white rounded-3xl border border-indigo-200/80 p-6 shadow-xs flex flex-col justify-between hover:border-indigo-400 transition-all">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-teal-600 text-white flex items-center justify-center shadow-2xs">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900">Haven Matcher AI Engine</h3>
                      <p className="text-[11px] text-slate-500">Retiree &amp; Digital Nomad Visa Matching</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-900 border border-indigo-200">
                    {currentPersona === 'nomad' ? '⚡ Nomad Mode' : '🌿 Retiree Mode'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Rank all {countries.length} global havens by your monthly remote income, DNV visa threshold, fiber internet Mbps, coworking density, or 4% SWR retirement portfolio.
                </p>
                <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                  <span className="text-slate-600">Primary Target Haven:</span>
                  <strong className="text-slate-900 inline-flex items-center gap-1.5">
                    <CountryFlag countryName={userProfile.targetCountry} size="xs" className="rounded-xs" />
                    <span>{userProfile.targetCountry}</span>
                  </strong>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleSelectTab('matcher')}
                className="mt-5 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <span>Open Haven Matcher AI</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Module 2: 5-Scheme Financial Portfolio */}
            <div className="bg-white rounded-3xl border border-amber-200/80 p-6 shadow-xs flex flex-col justify-between hover:border-amber-400 transition-all">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-2xs">
                      <Coins className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900">5-Scheme Financial Portfolio</h3>
                      <p className="text-[11px] text-slate-500">Salary, Assets &amp; Net Worth Ledger</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-50 text-amber-900 border border-amber-200">
                    ${userNetWorthUSD.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Manage your liquid savings, stocks &amp; mutual funds, real estate equity, physical gold, and alternative investments alongside your current annual salary.
                </p>
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/60">
                    <span className="text-[10px] text-slate-500 block">Monthly Income</span>
                    <strong className="font-mono text-slate-900">${userMonthlySalaryUSD.toLocaleString()}/mo</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200/60">
                    <span className="text-[10px] text-slate-500 block">4% SWR Passive Yield</span>
                    <strong className="font-mono text-emerald-900">${Math.round((userNetWorthUSD * 0.04) / 12).toLocaleString()}/mo</strong>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleSelectTab('financials')}
                className="mt-5 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <span>Open Financial Portfolio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Module 3: FIRE & Runway Calculator */}
            <div className="bg-white rounded-3xl border border-teal-200/80 p-6 shadow-xs flex flex-col justify-between hover:border-teal-400 transition-all">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-600 to-emerald-600 text-white flex items-center justify-center shadow-2xs">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900">FIRE &amp; Runway Calculator</h3>
                      <p className="text-[11px] text-slate-500">Compound Trajectory &amp; Geoarbitrage</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-teal-50 text-teal-900 border border-teal-200">
                    Target {userProfile.retirementTimelineYear}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Simulate compound portfolio growth, safe withdrawal rates, and geoarbitrage purchasing power across global retirement and slow-travel hubs.
                </p>
                <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                  <span className="text-slate-600">Target Monthly Spend:</span>
                  <strong className="font-mono text-teal-900">${userProfile.monthlyBudgetUSD.toLocaleString()} / mo</strong>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleSelectTab('fire')}
                className="mt-5 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-700 hover:to-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <span>Open FIRE &amp; Runway Calculator</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Module 4: Expat Identity & Travel History */}
            <div className="bg-white rounded-3xl border border-violet-200/80 p-6 shadow-xs flex flex-col justify-between hover:border-violet-400 transition-all">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white flex items-center justify-center shadow-2xs">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900">Expat Profile &amp; Travel Log</h3>
                      <p className="text-[11px] text-slate-500">Scouting Trips, Languages &amp; Interests</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-violet-50 text-violet-900 border border-violet-200">
                    {userProfile.travelHistory?.length || 0} Visited
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Track visited countries, scouting trip ratings, spoken languages, and lifestyle hobbies that shape your ideal overseas community.
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {(userProfile.languagesKnown || []).slice(0, 3).map(l => (
                    <span key={l.id} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">
                      {l.language} ({l.proficiency})
                    </span>
                  ))}
                  {knowsTargetLanguage && (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold">
                      ✓ Speaks {targetLanguage}
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleSelectTab('profile')}
                className="mt-5 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <span>Open Expat Profile &amp; Travel Log</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Module 5: Confidential Country Journal */}
            <div className="bg-white rounded-3xl border border-amber-200/80 p-6 shadow-xs flex flex-col justify-between hover:border-amber-400 transition-all">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-600 to-teal-600 text-white flex items-center justify-center shadow-2xs">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900">Country Journal &amp; Candidacy</h3>
                      <p className="text-[11px] text-slate-500">Private Scouting Notes &amp; Pros/Cons</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-50 text-amber-900 border border-amber-200">
                    {journalEntryList.length} Entries
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Record detailed personal observations, neighborhood impressions, target budgets, and pros/cons for every country you are evaluating.
                </p>
                <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 truncate">
                  {journalEntryList.length > 0
                    ? `Latest: ${countries.find(c => c.id === journalEntryList[0].countryId)?.name || journalEntryList[0].countryId} (${journalEntryList[0].interestLevel})`
                    : 'No journal entries yet — start logging your impressions!'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleSelectTab('journal')}
                className="mt-5 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-teal-600 hover:from-amber-700 hover:to-teal-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <span>Open Country Journal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Module 6: Relocation Checklist, Visas & Meetups */}
            <div className="bg-white rounded-3xl border border-emerald-200/80 p-6 shadow-xs flex flex-col justify-between hover:border-emerald-400 transition-all">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-2xs">
                      <CheckSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900">Checklist, Visas &amp; Meetups</h3>
                      <p className="text-[11px] text-slate-500">Milestones, Consular Files &amp; Events</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-900 border border-emerald-200">
                    {progressPercent}% Ready
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Complete pre-departure legal, tax, healthcare, and housing milestones, monitor consular visa applications, and manage your RSVP'd expat meetups.
                </p>
                <div className="mt-4 space-y-2">
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-teal-600 h-full rounded-full transition-all"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>{completedTasks}/{checklist.length} Milestones</span>
                    <span>{userProfile.appliedVisas.length} Active Visas · {rsvpedMeetups.length} Meetups</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleSelectTab('checklist')}
                className="mt-5 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <span>Open Checklist, Visas &amp; Meetups</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB: SAVED SCOUT & HOP ROADMAPS & COMPLETE CHOSEN ITINERARY EDITOR    */}
      {/* ===================================================================== */}
      {(activeTab === 'scout' || activeTab === 'overview' || activeTab === 'all') && (
        <div className="bg-white rounded-3xl border-2 border-indigo-200/90 p-6 sm:p-8 shadow-md space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-950 text-[10px] font-extrabold uppercase tracking-wider">
                <Compass className="w-3.5 h-3.5 text-teal-600" />
                <span>Saved Scout &amp; Hop Roadmaps · Dashboard Itinerary Editor</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                My Saved Scouting Roadmaps &amp; Chosen Venue Itineraries
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-3xl">
                View and edit your saved Scout &amp; Hop trips directly from your Dashboard. Reassign any bar, dating spot, hiking trail, or paragliding operator to a different Week or Day, open its Google Maps location, or launch the full Scout &amp; Hop Studio.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {activeScoutTrip && (
                <button
                  type="button"
                  onClick={() => handleOpenTripInScoutPlanner(activeScoutTrip, 'map-itinerary')}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 via-indigo-600 to-violet-600 hover:from-teal-700 hover:to-violet-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit in Scout &amp; Hop Studio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setCurrentView('scout')}
                className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create New Scouting Route</span>
              </button>
            </div>
          </div>

          {dashboardTripStatusMsg && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs font-bold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{dashboardTripStatusMsg}</span>
            </div>
          )}

          {savedScoutTrips.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-50 border border-dashed border-slate-300 text-center space-y-3">
              <p className="text-sm font-extrabold text-slate-800">
                No saved Scout &amp; Hop itineraries yet.
              </p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Build a custom scouting route in the Scout &amp; Hop Planner, pick your favorite bars, dating spots, trails &amp; local operators, and click &ldquo;Save Complete Itinerary to Dashboard&rdquo;.
              </p>
              <button
                type="button"
                onClick={() => setCurrentView('scout')}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold inline-flex items-center gap-2 cursor-pointer"
              >
                <Compass className="w-4 h-4" />
                <span>Launch Scout &amp; Hop Planner →</span>
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Saved Trip Selector Tabs */}
              <div className="flex flex-wrap items-center gap-2">
                {savedScoutTrips.map(trip => {
                  const isSelected = activeScoutTrip?.id === trip.id;
                  return (
                    <div
                      key={trip.id}
                      className={`px-3.5 py-2 rounded-2xl border transition-all flex items-center gap-2 ${
                        isSelected
                          ? 'bg-indigo-950 text-white border-indigo-950 shadow-xs'
                          : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedTripId(trip.id)}
                        className="text-left cursor-pointer"
                      >
                        <p className="text-xs font-extrabold">{trip.title}</p>
                        <p
                          className={`text-[10px] font-mono ${
                            isSelected ? 'text-teal-300' : 'text-slate-500'
                          }`}
                        >
                          {trip.stops?.length || 0} stops · {trip.totalDays}d ·{' '}
                          {(trip.selectedItineraryItems || []).length} chosen places
                        </p>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteScoutTripFromDashboard(trip.id)}
                        className={`p-1 rounded-lg transition-colors cursor-pointer ${
                          isSelected
                            ? 'text-slate-300 hover:text-rose-300'
                            : 'text-slate-400 hover:text-rose-600'
                        }`}
                        title="Delete saved roadmap"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Active Selected Trip Details & Editable Itinerary Schedule */}
              {activeScoutTrip && (
                <div className="space-y-5">
                  {/* Trip Summary Bar + Inline Title Editor */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-50 via-indigo-50/40 to-teal-50/40 border border-indigo-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                          Roadmap Title:
                        </span>
                        <input
                          type="text"
                          value={activeScoutTrip.title}
                          onChange={e => {
                            const updated: ScoutTrip = {
                              ...activeScoutTrip,
                              title: e.target.value,
                            };
                            setSavedScoutTrips(prev =>
                              prev.map(t => (t.id === updated.id ? updated : t))
                            );
                          }}
                          onBlur={() =>
                            persistUpdatedScoutTripFromDashboard(
                              activeScoutTrip,
                              'Updated roadmap title!'
                            )
                          }
                          className="px-3 py-1 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[240px]"
                        />
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        {(activeScoutTrip.stops || []).map((s, idx) => (
                          <span
                            key={s.id}
                            className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-slate-800 font-bold flex items-center gap-1.5"
                          >
                            <span>{s.countryFlag}</span>
                            <span>
                              Stop {idx + 1}: {s.cityFocus || s.countryName} ({s.arrivalDate} →{' '}
                              {s.departureDate})
                            </span>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          persistUpdatedScoutTripFromDashboard(
                            activeScoutTrip,
                            `Saved all changes to "${activeScoutTrip.title}"!`
                          )
                        }
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Changes</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleOpenTripInScoutPlanner(activeScoutTrip, 'complete-itinerary')
                        }
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Open Full Itinerary in Scout &amp; Hop</span>
                      </button>
                    </div>
                  </div>

                  {/* Quick Add Custom Place / Venue to Saved Trip from Dashboard */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-extrabold text-slate-900">
                        + Add a New Bar, Dating Spot, Hike or Activity to This Saved Itinerary
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Automatically creates a Google Maps search link and schedules it under your chosen Week &amp; Day.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="text"
                        value={newDashSpotTitle}
                        onChange={e => setNewDashSpotTitle(e.target.value)}
                        placeholder="Venue or activity name..."
                        className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 min-w-[180px]"
                      />
                      <input
                        type="text"
                        value={newDashSpotNeighborhood}
                        onChange={e => setNewDashSpotNeighborhood(e.target.value)}
                        placeholder="Neighborhood / City"
                        className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 w-36"
                      />
                      <select
                        value={newDashSpotWeek}
                        onChange={e => setNewDashSpotWeek(Number(e.target.value))}
                        className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-800"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(wk => (
                          <option key={wk} value={wk}>
                            Week {wk}
                          </option>
                        ))}
                      </select>
                      <select
                        value={newDashSpotDay}
                        onChange={e => setNewDashSpotDay(e.target.value)}
                        className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-800"
                      >
                        {DAY_SLOT_OPTIONS.map(d => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          const clean = newDashSpotTitle.trim();
                          if (!clean) return;
                          const primaryStop = activeScoutTrip.stops?.[0];
                          const city =
                            newDashSpotNeighborhood.trim() ||
                            primaryStop?.cityFocus ||
                            primaryStop?.countryName ||
                            'City Center';
                          const countryName = primaryStop?.countryName || 'Destination';
                          const newItem: ScoutScheduledItineraryItem = {
                            id: `dash-sched-${Date.now()}`,
                            recommendationId: `custom-dash-${Date.now()}`,
                            stopId: primaryStop?.id || 'stop-1',
                            countryId: primaryStop?.countryId || 'custom',
                            countryName,
                            countryFlag: primaryStop?.countryFlag || '🌍',
                            cityName: primaryStop?.cityFocus || countryName,
                            weekNumber: newDashSpotWeek,
                            daySlot: newDashSpotDay,
                            timeOfDay: 'Evening',
                            title: clean,
                            categoryLabel: 'Custom Dashboard Spot',
                            interestId: 'culture',
                            neighborhood: city,
                            description: `Scheduled from your Dashboard for Week ${newDashSpotWeek} (${newDashSpotDay}).`,
                            insiderTip: 'Click Google Maps to view live ratings, hours & directions.',
                            rating: 4.8,
                            reviewCount: 120,
                            priceRange: '$$',
                            photoUrl:
                              'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80',
                            fallbackGradient: 'from-indigo-700 via-teal-700 to-slate-900',
                            googleMapsUrl: buildGoogleMapsSearchUrl(
                              `${clean} ${city} ${primaryStop?.cityFocus || countryName} ${countryName}`
                            ),
                            completed: false,
                          };
                          const updatedTrip: ScoutTrip = {
                            ...activeScoutTrip,
                            selectedItineraryItems: [
                              ...(activeScoutTrip.selectedItineraryItems || []),
                              newItem,
                            ].slice(0, 150),
                          };
                          setNewDashSpotTitle('');
                          setNewDashSpotNeighborhood('');
                          persistUpdatedScoutTripFromDashboard(
                            updatedTrip,
                            `Added "${clean}" to Week ${newDashSpotWeek} · ${newDashSpotDay}!`
                          );
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold cursor-pointer"
                      >
                        + Add to Schedule
                      </button>
                    </div>
                  </div>

                  {/* Scheduled Itinerary Places List (Editable Week, Day, Completion & Remove) */}
                  {(activeScoutTrip.selectedItineraryItems || []).length === 0 ? (
                    <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
                      <p className="text-xs font-bold text-slate-700">
                        No individual venues scheduled on this roadmap yet.
                      </p>
                      <button
                        type="button"
                        onClick={() => handleOpenTripInScoutPlanner(activeScoutTrip, 'map-itinerary')}
                        className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-extrabold cursor-pointer"
                      >
                        Browse Curated Bars, Dating Spots &amp; Operators in Scout &amp; Hop →
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {[...(activeScoutTrip.selectedItineraryItems || [])]
                        .sort((a, b) => {
                          if (a.weekNumber !== b.weekNumber) return a.weekNumber - b.weekNumber;
                          return (
                            DAY_SLOT_OPTIONS.indexOf(a.daySlot) -
                            DAY_SLOT_OPTIONS.indexOf(b.daySlot)
                          );
                        })
                        .map(item => (
                          <div
                            key={item.id}
                            className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                              item.completed
                                ? 'bg-emerald-50/35 border-emerald-300 opacity-75'
                                : 'bg-white border-slate-200/90 hover:border-indigo-300 shadow-2xs'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <button
                                type="button"
                                onClick={() => {
                                  const nextItems = (
                                    activeScoutTrip.selectedItineraryItems || []
                                  ).map(i =>
                                    i.id === item.id ? { ...i, completed: !i.completed } : i
                                  );
                                  persistUpdatedScoutTripFromDashboard({
                                    ...activeScoutTrip,
                                    selectedItineraryItems: nextItems,
                                  });
                                }}
                                className={`mt-1 w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 cursor-pointer ${
                                  item.completed
                                    ? 'bg-emerald-600 border-emerald-600 text-white'
                                    : 'bg-white border-slate-300 hover:border-indigo-500'
                                }`}
                              >
                                {item.completed && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                              </button>

                              <div className="min-w-0 flex-1 space-y-1">
                                <div className="flex flex-wrap items-center justify-between gap-1.5">
                                  <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-900 text-[10px] font-extrabold">
                                    {item.countryFlag} {item.cityName} · {item.categoryLabel}
                                  </span>
                                  <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-950 font-mono text-[10px] font-extrabold flex items-center gap-1">
                                    <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                                    <span>
                                      {item.rating.toFixed(1)} ({item.reviewCount.toLocaleString()})
                                    </span>
                                  </span>
                                </div>

                                <h4
                                  className={`text-sm font-extrabold leading-snug ${
                                    item.completed
                                      ? 'line-through text-slate-400'
                                      : 'text-slate-900'
                                  }`}
                                >
                                  {item.title}
                                </h4>

                                <p className="text-[11px] font-semibold text-teal-800 flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-teal-600 shrink-0" />
                                  <span>{item.neighborhood}</span>
                                </p>

                                <p className="text-[11px] text-slate-500 line-clamp-2">
                                  {item.description}
                                </p>
                              </div>
                            </div>

                            <div className="pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5">
                                <select
                                  value={item.weekNumber}
                                  onChange={e => {
                                    const nextWk = Number(e.target.value);
                                    const nextItems = (
                                      activeScoutTrip.selectedItineraryItems || []
                                    ).map(i =>
                                      i.id === item.id ? { ...i, weekNumber: nextWk } : i
                                    );
                                    persistUpdatedScoutTripFromDashboard(
                                      {
                                        ...activeScoutTrip,
                                        selectedItineraryItems: nextItems,
                                      },
                                      `Moved "${item.title}" to Week ${nextWk}`
                                    );
                                  }}
                                  className="px-2 py-1 rounded-lg bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-800"
                                >
                                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(wk => (
                                    <option key={wk} value={wk}>
                                      Week {wk}
                                    </option>
                                  ))}
                                </select>

                                <select
                                  value={item.daySlot}
                                  onChange={e => {
                                    const nextDay = e.target.value;
                                    const nextItems = (
                                      activeScoutTrip.selectedItineraryItems || []
                                    ).map(i =>
                                      i.id === item.id ? { ...i, daySlot: nextDay } : i
                                    );
                                    persistUpdatedScoutTripFromDashboard(
                                      {
                                        ...activeScoutTrip,
                                        selectedItineraryItems: nextItems,
                                      },
                                      `Rescheduled "${item.title}" to ${nextDay}`
                                    );
                                  }}
                                  className="px-2 py-1 rounded-lg bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-800"
                                >
                                  {DAY_SLOT_OPTIONS.map(d => (
                                    <option key={d} value={d}>
                                      {d}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <a
                                  href={item.googleMapsUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-900 text-[11px] font-extrabold flex items-center gap-1"
                                >
                                  <MapPin className="w-3 h-3 text-indigo-600" />
                                  <span>Google Maps</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>

                                <button
                                  type="button"
                                  onClick={() => {
                                    const nextItems = (
                                      activeScoutTrip.selectedItineraryItems || []
                                    ).filter(i => i.id !== item.id);
                                    persistUpdatedScoutTripFromDashboard(
                                      {
                                        ...activeScoutTrip,
                                        selectedItineraryItems: nextItems,
                                      },
                                      `Removed "${item.title}" from itinerary`
                                    );
                                  }}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                                  title="Remove from itinerary"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB: 5-SCHEME FINANCIAL PORTFOLIO                                     */}
      {/* ===================================================================== */}
      {(activeTab === 'financials' || activeTab === 'all') && (
        <div className="animate-in fade-in duration-200">
          <UserFinancialsDashboard />
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB: UNIFIED FIRE & RUNWAY CALCULATOR                                 */}
      {/* ===================================================================== */}
      {(activeTab === 'fire' || activeTab === 'all') && (
        <div className="animate-in fade-in duration-200">
          <FireCalculatorTracker />
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB: HAVEN MATCHER AI RECOMMENDATION & FINANCIAL POTENTIAL ENGINE     */}
      {/* ===================================================================== */}
      {(activeTab === 'matcher' || activeTab === 'all') && (
        <div className="animate-in fade-in duration-200">
          <HavenMatcherWidget />
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB: EXPAT IDENTITY, TRAVEL JOURNAL & RETIREMENT VISION               */}
      {/* ===================================================================== */}
      {(activeTab === 'profile' || activeTab === 'all') && (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 26 }}
        className="relative overflow-hidden bg-gradient-to-br from-violet-50/70 via-white to-amber-50/70 rounded-3xl border border-violet-200/80 p-6 sm:p-8 shadow-md space-y-6"
      >
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-violet-500 via-indigo-500 to-amber-500" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-violet-100/80">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
                <Globe className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-extrabold text-slate-900">
                Expat Profile, Travel History &amp; Lifestyle Readiness
              </h2>
            </div>
            <p className="text-xs text-slate-600 mt-1">
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
                    Interests &amp; Priorities ({userProfile.interests?.length || 0})
                  </span>
                </div>
                <button
                  onClick={() => openEditProfile('interests')}
                  className="text-[11px] font-semibold text-teal-700 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Edit Interests</span>
                </button>
              </div>

              {(!userProfile.interests || userProfile.interests.length === 0) ? (
                <p className="text-xs text-slate-400 py-2">
                  No interests added yet. Click "Edit Interests" to add your hobbies and retirement priorities.
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {userProfile.interests.map((interest, idx) => {
                    const isCustom = !ALL_INTEREST_SUGGESTIONS.includes(interest);
                    return (
                      <span
                        key={`${interest}-${idx}`}
                        className={`group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium shadow-2xs transition-colors ${
                          isCustom
                            ? 'bg-gradient-to-r from-indigo-50 to-teal-50 text-teal-950 border border-teal-200'
                            : 'bg-white text-slate-700 border border-slate-200'
                        }`}
                      >
                        {isCustom && (
                          <Sparkles className="w-2.5 h-2.5 text-teal-600 shrink-0" />
                        )}
                        <span>{interest}</span>
                        <button
                          type="button"
                          onClick={() => toggleInterest(interest)}
                          className="opacity-60 group-hover:opacity-100 text-slate-400 hover:text-rose-600 transition-opacity cursor-pointer"
                          title={`Remove "${interest}"`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}
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
      </motion.div>
      )}

      {/* ===================================================================== */}
      {/* TAB: COUNTRY JOURNAL & CANDIDACY TRACKER                              */}
      {/* ===================================================================== */}
      {(activeTab === 'journal' || activeTab === 'all') && (
        <div className="animate-in fade-in duration-200">
          <CountryJournal />
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB: RELOCATION CHECKLIST, VISAS & MEETUPS                            */}
      {/* ===================================================================== */}
      {(activeTab === 'checklist' || activeTab === 'all') && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Relocation Readiness Progress & Checklist */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
            className="relative overflow-hidden bg-gradient-to-br from-emerald-50/75 via-white to-indigo-50/75 rounded-3xl border border-emerald-200/80 p-6 sm:p-8 shadow-md"
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600" />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-emerald-100/80">
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-xs">
                    <CheckSquare className="w-4 h-4" />
                  </div>
                  <h2 className="text-lg font-extrabold text-slate-900">
                    Relocation Readiness Milestone Checklist
                  </h2>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Essential legal, tax, medical, and logistical steps before departing for your chosen haven.
                </p>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <span className="font-mono tabular-nums font-extrabold text-emerald-950 text-base">
                    {progressPercent}%
                  </span>
                  <span className="text-[11px] text-slate-500 block font-medium">
                    {completedTasks} of {checklist.length} Completed
                  </span>
                </div>

                <motion.button
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setIsAddTaskOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 text-white text-xs font-bold hover:from-emerald-700 hover:to-indigo-700 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Step</span>
                </motion.button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 h-3 rounded-full mt-4 overflow-hidden shadow-inner">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 h-full rounded-full"
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
          </motion.div>

          {/* Applied Visa Tracker */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
            className="relative overflow-hidden bg-gradient-to-br from-amber-50/70 via-white to-teal-50/70 rounded-3xl border border-amber-200/80 p-6 sm:p-8 shadow-md"
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-teal-500" />
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-xs">
                <FileText className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-extrabold text-slate-900">
                Active Visa &amp; Consular Application Tracker
              </h2>
            </div>

            <div className="space-y-3">
              {userProfile.appliedVisas.map((visa, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ y: -2 }}
                  className="p-4 rounded-2xl bg-white/90 border border-amber-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                >
                  <div>
                    <span className="text-xs font-bold text-teal-800 uppercase tracking-wider block">Target: {visa.countryId.toUpperCase()}</span>
                    <h4 className="text-sm font-bold text-slate-900 mt-0.5">{visa.visaName}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Consulate processing file #PT-2026-8819A</p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                      {visa.status}
                    </span>
                    <button
                      onClick={() => navigateToCountry(visa.countryId)}
                      className="text-xs font-bold text-indigo-700 hover:text-indigo-950 hover:underline cursor-pointer"
                    >
                      View Guide →
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* RSVP'd Meetups */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
            className="relative overflow-hidden bg-gradient-to-br from-teal-50/75 via-white to-amber-50/70 rounded-3xl border border-teal-200/80 p-6 sm:p-8 shadow-md"
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 via-emerald-500 to-amber-500" />
            <div className="flex items-center justify-between pb-4 border-b border-teal-100/80 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-600 to-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <Calendar className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-extrabold text-slate-900">
                  My RSVP'd Expat Meetups ({rsvpedMeetups.length})
                </h2>
              </div>
              <button
                onClick={() => setCurrentView('meetups')}
                className="text-xs font-bold text-teal-800 hover:underline cursor-pointer"
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
                  <div key={meetup.id} className="p-4 rounded-2xl bg-white/90 border border-teal-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
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
                        className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 border border-slate-300 rounded-xl bg-white cursor-pointer"
                      >
                        Cancel RSVP
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      )}



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
