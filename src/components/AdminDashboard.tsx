import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Country, Region, UserAccount, ClimateCategory } from '../types';
import { CountryFlag } from './CountryFlag';
import { getWorldCountryFlag } from '../data/userAccounts';
import {
  Shield, Globe, Edit, Trash2, Plus, Users, MessageSquare,
  Calendar, CheckCircle, X, Search, LayoutDashboard,
  Database, Download, RefreshCw, Eye, UserCheck, Mail,
  MapPin, DollarSign, Briefcase, Award, Pin, Sparkles,
  ArrowUpRight, Clock, BookOpen, Plane, UserPlus, MessageSquarePlus
} from 'lucide-react';
import { motion } from 'motion/react';
import { AdminFeedbackManagement } from './AdminFeedbackManagement';

type AdminTab = 'overview' | 'users' | 'countries' | 'community' | 'feedback' | 'cloud';

interface AdminDashboardProps {
  onOpenBrandKit?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onOpenBrandKit }) => {
  const {
    countries,
    updateCountry,
    addCountry,
    deleteCountry,
    threads,
    deleteThread,
    togglePinThread,
    meetups,
    deleteMeetup,
    toggleRole,
    userProfile,
    navigateToCountry,
    registeredAccounts,
    currentUserId,
    switchAccount,
    deleteUserAccount,
    adminUpdateUserAccount,
    refreshRegisteredUsersFromCloud,
    syncAllAccountsToCloud,
    signup,
    firebaseUser,
    isFirebaseSyncing,
    lastCloudSyncTime,
    openFirebaseModal,
    feedbackReports,
  } = useApp();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Country CMS filter state
  const [adminSearch, setAdminSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState<string>('All');
  const [editingCountry, setEditingCountry] = useState<Country | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Registered Users filter & modal state
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'admin' | 'member'>('all');
  const [userStageFilter, setUserStageFilter] = useState<string>('all');
  const [selectedUserAccount, setSelectedUserAccount] = useState<UserAccount | null>(null);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [editUserDraft, setEditUserDraft] = useState<UserAccount | null>(null);
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [statusBanner, setStatusBanner] = useState<{ type: 'success' | 'info' | 'error'; message: string } | null>(null);

  // Create New User Form State
  const [newUserForm, setNewUserForm] = useState({
    customUserId: '',
    name: '',
    email: '',
    password: 'password123',
    originCountry: 'United States',
    residingCountry: 'United States',
    originCity: '',
    targetCountry: 'Portugal',
    retirementTimelineYear: 2027,
    monthlyBudgetUSD: 2500,
    preferredClimate: 'Mediterranean' as ClimateCategory | 'Any',
    relocationStatus: 'Exploring Options' as
      | 'Exploring Options'
      | 'Scouting In-Person'
      | 'Visa In-Progress'
      | 'Relocated & Settled'
      | 'Early Retired (FIRE)',
    occupationOrBackground: '',
    bio: '',
  });

  // New Country Form State
  const [newCountryForm, setNewCountryForm] = useState<Partial<Country>>({
    name: '',
    code: '',
    flag: '🌍',
    region: 'Europe',
    capital: '',
    currency: 'Euro (EUR)',
    currencySymbol: '€',
    language: 'English',
    tagline: '',
    overview: '',
    costOfLiving: {
      monthlyBudgetSingleUSD: 1800,
      monthlyBudgetCoupleUSD: 2600,
      rent1BedCenterUSD: 700,
      rent1BedOutsideUSD: 500,
      mealInexpensiveUSD: 10,
      utilitiesMonthlyUSD: 100,
      groceriesIndex: 45,
      healthcareMonthlyUSD: 80,
    },
    visa: {
      retirementVisaName: 'Retirement Residence Permit',
      minimumIncomeUSD: 1500,
      processingMonths: 3,
      pathwayToPR: 'Eligible for Permanent Residency after 5 years',
      difficultyRating: 2,
      keyRequirements: ['Proof of passive monthly income', 'Clean criminal background check', 'Private healthcare policy'],
      taxStatus: 'Bilateral tax treaties prevent double taxation on foreign pensions.',
      allowedToWork: false,
    },
    climate: {
      category: 'Mediterranean',
      averageTempC: 20,
      annualSunnyDays: 300,
      humidityPercent: 60,
      rainyMonths: 'November to February',
      bestMonths: 'April to October',
    },
    lifestyle: {
      healthcareScore: 88,
      healthcareSummary: 'Modern hospital care with English-speaking specialists.',
      publicHealthcareAccess: 'Full access after residency approval.',
      safetyScore: 89,
      englishProficiency: 'High',
      expatCommunitySize: '100,000+ Expats',
      walkabilityScore: 85,
    },
    demographics: {
      medianAge: 42,
      youngPopulationPercent: 32,
      femalesPer100Males: 103.5,
      datingRating: 4,
      datingCultureSummary: 'Warm and social cafe culture.',
      socialAtmosphere: 'Relaxed and family-friendly outdoor lifestyle.',
    },
    adultEntertainment: {
      nightlifeScore: 4,
      nightlifeVibrancy: 'Balanced Coastal Social',
      adultEntertainmentScore: 3,
      legalStatus: 'Regulated commercial entertainment venues operate under municipal licenses.',
      overview: 'Vibrant local restaurants, beach bars, and regulated lounges.',
      topVenuesOrDistricts: ['Central Marina lounges', 'Historic district bars'],
      safetyGuidance: 'High safety standards across all key districts.',
    },
    topCities: [
      { name: 'Capital City', vibe: 'Urban cosmopolitan hub', monthlyCostUSD: 2000, highlight: 'Central airport and hospitals' },
      { name: 'Coastal Haven', vibe: 'Sunny beach resort', monthlyCostUSD: 1600, highlight: 'Warm climate and expat clubs' },
    ],
    pros: ['Favorable climate and high safety', 'Accessible cost of living'],
    cons: ['Bureaucracy requires patience'],
  });

  // Helper to calculate a user's net worth from their financial portfolio
  const getUserNetWorth = (acc: UserAccount): number => {
    const inv = acc.profile?.finances?.investments;
    if (!inv) return 0;
    const assets =
      (inv.savingsUSD || 0) +
      (inv.stocksMutualFundsUSD || 0) +
      (inv.realEstateUSD || 0) +
      (inv.goldUSD || 0) +
      (inv.othersUSD || 0);
    const liabilities = acc.profile?.finances?.totalLiabilitiesUSD || 0;
    return Math.max(0, assets - liabilities);
  };

  // Filtered registered users
  const filteredUsers = useMemo(() => {
    return registeredAccounts.filter(acc => {
      if (userRoleFilter !== 'all' && acc.profile?.role !== userRoleFilter) {
        return false;
      }
      if (userStageFilter !== 'all' && acc.profile?.relocationStatus !== userStageFilter) {
        return false;
      }
      if (!userSearch.trim()) return true;
      const q = userSearch.toLowerCase();
      return (
        acc.name.toLowerCase().includes(q) ||
        acc.id.toLowerCase().includes(q) ||
        (acc.username && acc.username.toLowerCase().includes(q)) ||
        acc.email.toLowerCase().includes(q) ||
        (acc.profile?.originCountry && acc.profile.originCountry.toLowerCase().includes(q)) ||
        (acc.profile?.residingCountry && acc.profile.residingCountry.toLowerCase().includes(q)) ||
        (acc.profile?.targetCountry && acc.profile.targetCountry.toLowerCase().includes(q)) ||
        (acc.profile?.occupationOrBackground && acc.profile.occupationOrBackground.toLowerCase().includes(q))
      );
    });
  }, [registeredAccounts, userSearch, userRoleFilter, userStageFilter]);

  // Filtered countries
  const filteredCountries = useMemo(() => {
    return countries.filter(c => {
      if (regionFilter !== 'All' && c.region !== regionFilter) return false;
      if (!adminSearch.trim()) return true;
      const q = adminSearch.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.region.toLowerCase().includes(q) ||
        c.capital.toLowerCase().includes(q) ||
        c.visa.retirementVisaName.toLowerCase().includes(q)
      );
    });
  }, [countries, adminSearch, regionFilter]);

  // Aggregate user analytics
  const userStats = useMemo(() => {
    const total = registeredAccounts.length;
    const adminsCount = registeredAccounts.filter(a => a.profile?.role === 'admin').length;
    const syncedCount = registeredAccounts.filter(a => a.cloudSynced).length;
    const avgBudget =
      total > 0
        ? Math.round(
            registeredAccounts.reduce((sum, a) => sum + (a.profile?.monthlyBudgetUSD || 2200), 0) / total
          )
        : 0;
    const avgNetWorth =
      total > 0
        ? Math.round(registeredAccounts.reduce((sum, a) => sum + getUserNetWorth(a), 0) / total)
        : 0;

    // Target country counts
    const targetCounts: Record<string, number> = {};
    const stageCounts: Record<string, number> = {};
    registeredAccounts.forEach(a => {
      const target = a.profile?.targetCountry || 'Portugal';
      targetCounts[target] = (targetCounts[target] || 0) + 1;
      const stage = a.profile?.relocationStatus || 'Exploring Options';
      stageCounts[stage] = (stageCounts[stage] || 0) + 1;
    });

    const topTargets = Object.entries(targetCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      total,
      adminsCount,
      membersCount: total - adminsCount,
      syncedCount,
      avgBudget,
      avgNetWorth,
      topTargets,
      stageCounts,
    };
  }, [registeredAccounts]);

  // Export registered users to CSV
  const handleExportUsersCsv = () => {
    const headers = [
      'User ID',
      'Username',
      'Full Name',
      'Email',
      'Role',
      'Created Date',
      'Origin Country',
      'Origin City',
      'Residing Country',
      'Target Country',
      'Target Year',
      'Relocation Status',
      'Monthly Budget (USD)',
      'Net Worth (USD)',
      'Occupation / Background',
      'Saved Havens Count',
      'Languages Spoken',
      'Travel History Count',
      'Cloud Synced',
    ];

    const rows = registeredAccounts.map(acc => {
      const p = acc.profile;
      const langs = (p?.languagesKnown || []).map(l => `${l.language} (${l.proficiency})`).join('; ');
      return [
        acc.id,
        acc.username || acc.id,
        acc.name,
        acc.email,
        p?.role || 'member',
        acc.createdAt || '2026-01-01',
        p?.originCountry || '',
        p?.originCity || '',
        p?.residingCountry || p?.originCountry || '',
        p?.targetCountry || '',
        String(p?.retirementTimelineYear || ''),
        p?.relocationStatus || 'Exploring Options',
        String(p?.monthlyBudgetUSD || 0),
        String(getUserNetWorth(acc)),
        p?.occupationOrBackground || '',
        String(p?.savedCountryIds?.length || 0),
        langs,
        String(p?.travelHistory?.length || 0),
        acc.cloudSynced ? 'Yes' : 'No',
      ].map(val => `"${String(val).replace(/"/g, '""')}"`);
    });

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `refirely-registered-users-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setStatusBanner({
      type: 'success',
      message: `Exported ${registeredAccounts.length} registered user profiles to CSV.`,
    });
  };

  const handleRefreshCloudUsers = async () => {
    const res = await refreshRegisteredUsersFromCloud();
    if (res.success) {
      setStatusBanner({
        type: 'success',
        message: `Synchronized ${res.count} registered user accounts from Firestore Cloud Database.`,
      });
    } else {
      setStatusBanner({
        type: 'info',
        message: res.error || 'Displaying all local & preloaded registered user accounts.',
      });
    }
  };

  const handleSaveUserEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUserDraft) return;
    await adminUpdateUserAccount(editUserDraft);
    setSelectedUserAccount(editUserDraft);
    setIsEditingUser(false);
    setStatusBanner({
      type: 'success',
      message: `Updated user profile for ${editUserDraft.name} (${editUserDraft.id}).`,
    });
  };

  const handleCreateNewUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserForm.name.trim() || !newUserForm.email.trim()) return;
    const res = signup({
      customUserId: newUserForm.customUserId.trim() || undefined,
      name: newUserForm.name.trim(),
      email: newUserForm.email.trim(),
      password: newUserForm.password || 'password123',
      originCountry: newUserForm.originCountry,
      residingCountry: newUserForm.residingCountry,
      originCity: newUserForm.originCity,
      targetCountry: newUserForm.targetCountry,
      retirementTimelineYear: Number(newUserForm.retirementTimelineYear) || 2027,
      monthlyBudgetUSD: Number(newUserForm.monthlyBudgetUSD) || 2500,
      preferredClimate: newUserForm.preferredClimate,
      relocationStatus: newUserForm.relocationStatus,
      occupationOrBackground: newUserForm.occupationOrBackground,
      bio: newUserForm.bio,
    });

    if (!res.success) {
      setStatusBanner({ type: 'error', message: res.error || 'Could not create user.' });
      return;
    }

    // Switch back to the admin account if signup switched active session
    if (currentUserId && currentUserId !== res.createdUserId) {
      switchAccount(currentUserId);
    }

    setIsCreateUserModalOpen(false);
    setNewUserForm({
      customUserId: '',
      name: '',
      email: '',
      password: 'password123',
      originCountry: 'United States',
      residingCountry: 'United States',
      originCity: '',
      targetCountry: 'Portugal',
      retirementTimelineYear: 2027,
      monthlyBudgetUSD: 2500,
      preferredClimate: 'Mediterranean',
      relocationStatus: 'Exploring Options',
      occupationOrBackground: '',
      bio: '',
    });
    setStatusBanner({
      type: 'success',
      message: `Registered new user account "${res.createdUserId}" successfully.`,
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCountry) return;
    updateCountry(editingCountry);
    setEditingCountry(null);
    setStatusBanner({
      type: 'success',
      message: `Saved empirical indicators for ${editingCountry.name}.`,
    });
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCountryForm.name || !newCountryForm.capital) return;

    const id = newCountryForm.name.toLowerCase().replace(/\s+/g, '-');
    const created: Country = {
      ...(newCountryForm as Country),
      id,
    };
    addCountry(created);
    setIsAddModalOpen(false);
    setStatusBanner({
      type: 'success',
      message: `Published new destination haven: ${created.name}.`,
    });
  };

  const openUserInspector = (acc: UserAccount, startInEditMode = false) => {
    const clone = JSON.parse(JSON.stringify(acc)) as UserAccount;
    setSelectedUserAccount(clone);
    setEditUserDraft(clone);
    setIsEditingUser(startInEditMode);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-indigo-50/40 via-slate-50 to-teal-50/30">
      {/* Top Contextual Bar - Multi-Colored Governance Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-50/90 via-white to-amber-50/85 border-b border-indigo-200/80 shadow-xs">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 via-indigo-500 via-50% to-amber-500" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span className="font-bold text-indigo-900 bg-indigo-100/80 border border-indigo-200 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                <Shield className="w-3.5 h-3.5 text-indigo-600" />
                <span>ReFIREly Governance</span>
              </span>
              <span aria-hidden="true">/</span>
              <span className="text-slate-900 font-bold capitalize">
                {activeTab === 'overview' && 'Executive Overview'}
                {activeTab === 'users' && `Registered Users Directory (${registeredAccounts.length})`}
                {activeTab === 'countries' && `Country Catalog CMS (${countries.length})`}
                {activeTab === 'community' && 'Community & Meetups Moderation'}
                {activeTab === 'feedback' && `User Feedback & Bug Reports (${feedbackReports.length})`}
                {activeTab === 'cloud' && 'Cloud Database & Sync Center'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1 tracking-tight">
              Admin CMS &amp;{' '}
              <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-teal-600 bg-clip-text text-transparent">
                Registered Users Console
              </span>
            </h1>
          </div>

          {/* Right Quick Actions */}
          <div className="flex items-center flex-wrap gap-2 shrink-0">
            {onOpenBrandKit && (
              <motion.button
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={onOpenBrandKit}
                className="px-3.5 py-2 bg-slate-900 hover:bg-indigo-950 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer border border-indigo-400/40"
                title="Open 4K High-Resolution Brand & Logo Kit (Admin Only)"
              >
                <Download className="w-3.5 h-3.5 text-teal-300" />
                <span>4K Brand &amp; Logo Kit</span>
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setIsCreateUserModalOpen(true)}
              className="px-3.5 py-2 bg-gradient-to-r from-indigo-600 via-violet-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5 text-amber-300" />
              <span>Add User</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setIsAddModalOpen(true)}
              className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Country</span>
            </motion.button>
            <button
              onClick={toggleRole}
              className="px-3.5 py-2 bg-white border border-indigo-200 text-indigo-950 hover:bg-indigo-50 font-bold text-xs rounded-xl transition-colors shadow-2xs cursor-pointer"
              title="Toggle between Admin Mode and Member View"
            >
              Role: {userProfile.role === 'admin' ? 'Admin' : 'Member'} (Switch)
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout: Left Sidebar + Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {statusBanner && (
          <div
            className={`mb-6 px-4 py-3 rounded-xl border flex items-center justify-between text-xs font-medium ${
              statusBanner.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : statusBanner.type === 'error'
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{statusBanner.message}</span>
            </div>
            <button onClick={() => setStatusBanner(null)} className="text-slate-500 hover:text-slate-800">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Left Navigation Sidebar */}
          <aside className="w-full lg:w-60 shrink-0 bg-white/95 backdrop-blur-xs border border-indigo-200/80 rounded-2xl p-2.5 space-y-1.5 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-teal-500 to-amber-500" />
            <div className="px-3 py-2 border-b border-slate-100 mb-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-900/70">
                Console Modules
              </p>
            </div>

            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-gradient-to-r from-indigo-600 via-violet-600 to-teal-600 text-white shadow-sm shadow-indigo-500/20'
                  : 'text-slate-700 hover:bg-indigo-50/70 hover:text-indigo-950'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <LayoutDashboard className="w-4 h-4" />
                <span>Executive Overview</span>
              </span>
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'users'
                  ? 'bg-gradient-to-r from-indigo-600 via-violet-600 to-teal-600 text-white shadow-sm shadow-indigo-500/20'
                  : 'text-slate-700 hover:bg-indigo-50/70 hover:text-indigo-950'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Users className="w-4 h-4" />
                <span>Registered Users</span>
              </span>
              <span
                className={`font-mono tabular-nums text-[11px] px-1.5 py-0.5 rounded-md ${
                  activeTab === 'users' ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-800'
                }`}
              >
                {registeredAccounts.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('countries')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'countries'
                  ? 'bg-gradient-to-r from-indigo-600 via-violet-600 to-teal-600 text-white shadow-sm shadow-indigo-500/20'
                  : 'text-slate-700 hover:bg-indigo-50/70 hover:text-indigo-950'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Globe className="w-4 h-4" />
                <span>Country CMS Catalog</span>
              </span>
              <span
                className={`font-mono tabular-nums text-[11px] px-1.5 py-0.5 rounded-md ${
                  activeTab === 'countries' ? 'bg-white/20 text-white' : 'bg-teal-50 text-teal-800'
                }`}
              >
                {countries.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('community')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'community'
                  ? 'bg-gradient-to-r from-indigo-600 via-violet-600 to-teal-600 text-white shadow-sm shadow-indigo-500/20'
                  : 'text-slate-700 hover:bg-indigo-50/70 hover:text-indigo-950'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4" />
                <span>Forum &amp; Meetups</span>
              </span>
              <span
                className={`font-mono tabular-nums text-[11px] px-1.5 py-0.5 rounded-md ${
                  activeTab === 'community' ? 'bg-white/20 text-white' : 'bg-amber-50 text-amber-800'
                }`}
              >
                {threads.length + meetups.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('feedback')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'feedback'
                  ? 'bg-gradient-to-r from-indigo-600 via-violet-600 to-teal-600 text-white shadow-sm shadow-indigo-500/20'
                  : 'text-slate-700 hover:bg-indigo-50/70 hover:text-indigo-950'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <MessageSquarePlus className={`w-4 h-4 ${activeTab === 'feedback' ? 'text-amber-300' : 'text-orange-500'}`} />
                <span>Feedback &amp; Bugs</span>
              </span>
              <div className="flex items-center gap-1.5">
                {feedbackReports.filter(r => r.status === 'new').length > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-orange-600 text-white">
                    {feedbackReports.filter(r => r.status === 'new').length} new
                  </span>
                )}
                <span
                  className={`font-mono tabular-nums text-[11px] px-1.5 py-0.5 rounded-md ${
                    activeTab === 'feedback' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {feedbackReports.length}
                </span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('cloud')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'cloud'
                  ? 'bg-gradient-to-r from-indigo-600 via-violet-600 to-teal-600 text-white shadow-sm shadow-indigo-500/20'
                  : 'text-slate-700 hover:bg-indigo-50/70 hover:text-indigo-950'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Database className="w-4 h-4" />
                <span>Cloud DB &amp; Sync</span>
              </span>
              <span
                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                  firebaseUser
                    ? activeTab === 'cloud'
                      ? 'bg-emerald-500/30 text-emerald-200'
                      : 'bg-emerald-50 text-emerald-700'
                    : activeTab === 'cloud'
                      ? 'bg-amber-500/30 text-amber-200'
                      : 'bg-amber-50 text-amber-700'
                }`}
              >
                {firebaseUser ? 'Online' : 'Local'}
              </span>
            </button>

            {/* Active Admin Session Summary Card */}
            <div className="pt-3 mt-3 border-t border-slate-100 px-3 py-2.5 space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Active Session
              </div>
              <div className="flex items-center gap-2">
                {userProfile.avatarUrl ? (
                  <img
                    src={userProfile.avatarUrl}
                    alt={userProfile.name}
                    className="w-8 h-8 rounded-full object-cover border border-slate-200"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-xs">
                    {userProfile.name.charAt(0)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 truncate">{userProfile.name}</p>
                  <p className="text-[11px] text-slate-500 font-mono truncate">{currentUserId}</p>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content Viewport */}
          <div className="flex-1 min-w-0 w-full space-y-6">
            {/* =========================================================
                TAB 1: EXECUTIVE OVERVIEW (Reshuffled Unified Dashboard)
            ========================================================= */}
            {activeTab === 'overview' && (
              <>
                {/* 5-Column Multi-Color KPI Strip */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
                  <motion.div
                    whileHover={{ y: -4, scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab('users')}
                    className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/90 via-white to-violet-50/80 border border-indigo-200/80 hover:border-indigo-400 transition-all shadow-xs cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-indigo-900">
                      <span className="text-xs font-bold">Registered Users</span>
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-2xs">
                        <Users className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div className="font-mono tabular-nums text-2xl font-extrabold text-indigo-950 mt-2">
                      {userStats.total}
                    </div>
                    <div className="text-[11px] text-slate-600 mt-1 flex items-center gap-1.5">
                      <span>{userStats.adminsCount} Admin</span>
                      <span aria-hidden="true">·</span>
                      <span>{userStats.membersCount} Members</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-emerald-700 font-bold">{userStats.syncedCount} Synced</span>
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ y: -4, scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab('countries')}
                    className="p-5 rounded-2xl bg-gradient-to-br from-amber-50/90 via-white to-orange-50/80 border border-amber-200/80 hover:border-amber-400 transition-all shadow-xs cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-amber-900">
                      <span className="text-xs font-bold">Published Havens</span>
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-2xs">
                        <Globe className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div className="font-mono tabular-nums text-2xl font-extrabold text-amber-950 mt-2">
                      {countries.length}
                    </div>
                    <div className="text-[11px] text-slate-600 mt-1 flex items-center gap-1.5">
                      <span>Europe</span>
                      <span aria-hidden="true">·</span>
                      <span>SE Asia</span>
                      <span aria-hidden="true">·</span>
                      <span>Americas</span>
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ y: -4, scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab('users')}
                    className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/80 border border-emerald-200/80 hover:border-emerald-400 transition-all shadow-xs cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-emerald-900">
                      <span className="text-xs font-bold">Avg. User Target Budget</span>
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-2xs">
                        <DollarSign className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div className="font-mono tabular-nums text-2xl font-extrabold text-emerald-950 mt-2">
                      ${userStats.avgBudget.toLocaleString()}/mo
                    </div>
                    <div className="text-[11px] text-slate-600 mt-1 flex items-center gap-1.5">
                      <span>Avg. Net Worth: ${(userStats.avgNetWorth / 1000).toFixed(0)}k</span>
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ y: -4, scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab('community')}
                    className="p-5 rounded-2xl bg-gradient-to-br from-violet-50/90 via-white to-fuchsia-50/80 border border-violet-200/80 hover:border-violet-400 transition-all shadow-xs cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-violet-900">
                      <span className="text-xs font-bold">Community &amp; Meetups</span>
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-purple-600 text-white flex items-center justify-center shadow-2xs">
                        <MessageSquare className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div className="font-mono tabular-nums text-2xl font-extrabold text-violet-950 mt-2">
                      {threads.length} / {meetups.length}
                    </div>
                    <div className="text-[11px] text-slate-600 mt-1 flex items-center gap-1.5">
                      <span>{threads.length} Forum</span>
                      <span aria-hidden="true">·</span>
                      <span>{meetups.length} Meetups</span>
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ y: -4, scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab('feedback')}
                    className="p-5 rounded-2xl bg-gradient-to-br from-rose-50/90 via-white to-orange-50/80 border border-rose-200/80 hover:border-rose-400 transition-all shadow-xs cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-rose-900">
                      <span className="text-xs font-bold">Feedback &amp; Bugs</span>
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-rose-500 to-orange-600 text-white flex items-center justify-center shadow-2xs">
                        <MessageSquarePlus className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div className="font-mono tabular-nums text-2xl font-extrabold text-rose-950 mt-2">
                      {feedbackReports.length}
                    </div>
                    <div className="text-[11px] text-slate-600 mt-1 flex items-center gap-1.5">
                      <span className="text-rose-700 font-bold">{feedbackReports.filter(r => r.status === 'new').length} New</span>
                      <span aria-hidden="true">·</span>
                      <span>{feedbackReports.filter(r => r.type === 'bug').length} Bugs</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-emerald-700 font-bold">{feedbackReports.filter(r => r.status === 'resolved' || r.status === 'closed').length} Done</span>
                    </div>
                  </motion.div>
                </div>

                {/* Registered Users & Basic Information Section (Directly visible on Overview) */}
                <div className="relative bg-white rounded-2xl border border-indigo-200/80 overflow-hidden shadow-xs">
                  <div className="h-1 bg-gradient-to-r from-indigo-500 via-teal-500 to-amber-500" />
                  <div className="p-5 border-b border-indigo-100 bg-gradient-to-r from-indigo-50/50 via-white to-teal-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-base font-extrabold text-slate-900">
                        Registered Users &amp; Basic Member Information ({registeredAccounts.length})
                      </h2>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Complete roster of registered User IDs, contact emails, origin &amp; residing countries, target retirement havens, budgets, and relocation status.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={handleExportUsersCsv}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Export CSV</span>
                      </button>
                      <button
                        onClick={() => setActiveTab('users')}
                        className="px-3.5 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700 rounded-xl flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                      >
                        <span>Full User Directory</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs divide-y divide-slate-200">
                      <thead className="bg-slate-50 text-slate-600 font-semibold">
                        <tr>
                          <th className="py-3 px-4">User & Account ID</th>
                          <th className="py-3 px-4">Email & Role</th>
                          <th className="py-3 px-4">Origin → Residing</th>
                          <th className="py-3 px-4">Target Haven & Year</th>
                          <th className="py-3 px-4">Relocation Stage</th>
                          <th className="py-3 px-4 text-right">Budget / Portfolio</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {registeredAccounts.map(acc => {
                          const p = acc.profile;
                          const netWorth = getUserNetWorth(acc);
                          const isCurrent = acc.id === currentUserId;
                          return (
                            <tr key={acc.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2.5">
                                  {p?.avatarUrl ? (
                                    <img
                                      src={p.avatarUrl}
                                      alt={acc.name}
                                      className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                                      referrerPolicy="no-referrer"
                                    />
                                  ) : (
                                    <div className="w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                                      {acc.name.charAt(0)}
                                    </div>
                                  )}
                                  <div className="min-w-0">
                                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                      <button
                                        onClick={() => openUserInspector(acc, false)}
                                        className="hover:text-orange-600 hover:underline text-left truncate cursor-pointer"
                                      >
                                        {acc.name}
                                      </button>
                                      {isCurrent && (
                                        <span className="text-[10px] font-semibold text-emerald-700">
                                          · Active
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5">
                                      <span>ID: {acc.id}</span>
                                      <span aria-hidden="true">·</span>
                                      <span>Joined {acc.createdAt || '2026'}</span>
                                    </div>
                                  </div>
                                </div>
                              </td>

                              <td className="py-3 px-4">
                                <div className="font-medium text-slate-800 truncate max-w-[190px]" title={acc.email}>
                                  {acc.email}
                                </div>
                                <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                                  <span
                                    className={
                                      p?.role === 'admin'
                                        ? 'font-bold text-amber-800'
                                        : 'text-slate-600'
                                    }
                                  >
                                    {p?.role === 'admin' ? 'Admin' : 'Member'}
                                  </span>
                                  <span aria-hidden="true">·</span>
                                  <span>{p?.occupationOrBackground || 'Retiree Member'}</span>
                                </div>
                              </td>

                              <td className="py-3 px-4 text-slate-700">
                                <div className="font-medium">
                                  {getWorldCountryFlag(p?.originCountry)} {p?.originCountry || 'United States'}
                                  {p?.originCity ? ` (${p.originCity})` : ''}
                                </div>
                                <div className="text-[11px] text-slate-500 mt-0.5">
                                  Residing: {getWorldCountryFlag(p?.residingCountry || p?.originCountry)}{' '}
                                  {p?.residingCountry || p?.originCountry || 'United States'}
                                </div>
                              </td>

                              <td className="py-3 px-4">
                                <div className="font-bold text-slate-900">
                                  {getWorldCountryFlag(p?.targetCountry)} {p?.targetCountry || 'Portugal'}
                                </div>
                                <div className="text-[11px] text-slate-500 font-mono tabular-nums mt-0.5">
                                  Target: {p?.retirementTimelineYear || 2027} · {p?.preferredClimate || 'Any'}
                                </div>
                              </td>

                              <td className="py-3 px-4">
                                <div className="font-semibold text-slate-800">
                                  {p?.relocationStatus || 'Exploring Options'}
                                </div>
                                <div className="text-[11px] text-slate-500 mt-0.5">
                                  {p?.savedCountryIds?.length || 0} saved · {p?.travelHistory?.length || 0} trips
                                </div>
                              </td>

                              <td className="py-3 px-4 text-right font-mono tabular-nums">
                                <div className="font-bold text-slate-900">
                                  ${(p?.monthlyBudgetUSD || 0).toLocaleString()}/mo
                                </div>
                                <div className="text-[11px] text-slate-500 mt-0.5">
                                  Net Worth: ${(netWorth / 1000).toFixed(0)}k
                                </div>
                              </td>

                              <td className="py-3 px-4 text-right whitespace-nowrap space-x-1">
                                <button
                                  onClick={() => openUserInspector(acc, false)}
                                  className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-[11px] inline-flex items-center gap-1 transition-colors cursor-pointer"
                                  title="Inspect full user profile and basic details"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>Inspect</span>
                                </button>
                                <button
                                  onClick={() => openUserInspector(acc, true)}
                                  className="p-1.5 rounded-md text-orange-700 hover:bg-orange-50 transition-colors cursor-pointer"
                                  title="Edit User Account"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 2-Column Split: User Relocation Analytics + Quick Country CMS Preview */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                  {/* Left: Member Relocation Demand & Stage Breakdown */}
                  <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between space-y-5">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Registered Member Relocation Demand
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Most requested retirement destinations and active relocation stages among registered users.
                      </p>

                      <div className="mt-4 space-y-3">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Top Target Countries Chosen by Users
                        </p>
                        {userStats.topTargets.map(([countryName, count]) => {
                          const pct = Math.round((count / Math.max(1, userStats.total)) * 100);
                          return (
                            <div key={countryName} className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-semibold text-slate-800">
                                  {getWorldCountryFlag(countryName)} {countryName}
                                </span>
                                <span className="font-mono tabular-nums text-slate-600">
                                  {count} {count === 1 ? 'user' : 'users'} ({pct}%)
                                </span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-orange-500 rounded-full"
                                  style={{ width: `${Math.max(8, pct)}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                        Relocation Readiness Breakdown
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {Object.entries(userStats.stageCounts).map(([stage, count]) => (
                          <div key={stage} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
                            <div className="font-mono tabular-nums text-base font-extrabold text-slate-900">
                              {count}
                            </div>
                            <div className="text-[11px] text-slate-600 truncate" title={stage}>
                              {stage}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right: Quick Country Catalog & Governance Actions */}
                  <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">
                            Country Catalog Quick Editor
                          </h3>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Jump directly to edit visa thresholds and budgets.
                          </p>
                        </div>
                        <button
                          onClick={() => setActiveTab('countries')}
                          className="text-xs font-bold text-orange-600 hover:text-orange-800 flex items-center gap-1 cursor-pointer"
                        >
                          <span>All {countries.length} Havens</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="mt-4 divide-y divide-slate-100">
                        {countries.slice(0, 5).map(c => (
                          <div key={c.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-2 min-w-0">
                              <CountryFlag
                                countryCode={c.code}
                                countryName={c.name}
                                fallbackEmoji={c.flag}
                                size="sm"
                                className="rounded-xs shrink-0"
                              />
                              <div className="min-w-0">
                                <button
                                  onClick={() => navigateToCountry(c.id)}
                                  className="font-bold text-slate-900 hover:text-orange-600 truncate block text-left cursor-pointer"
                                >
                                  {c.name}
                                </button>
                                <span className="text-[11px] text-slate-500 truncate block">
                                  {c.visa.retirementVisaName}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              <div className="text-right font-mono tabular-nums">
                                <div className="font-semibold text-slate-900">
                                  ${c.costOfLiving.monthlyBudgetSingleUSD.toLocaleString()}/mo
                                </div>
                                <div className="text-[10px] text-slate-500">
                                  Visa: ${c.visa.minimumIncomeUSD.toLocaleString()}/mo
                                </div>
                              </div>
                              <button
                                onClick={() => setEditingCountry(JSON.parse(JSON.stringify(c)))}
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-orange-50 text-slate-700 hover:text-orange-700 transition-colors cursor-pointer"
                                title={`Edit ${c.name}`}
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-500">
                        Need to add a new country dossier to the directory?
                      </span>
                      <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                      >
                        + New Country
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* =========================================================
                TAB 2: REGISTERED USERS DIRECTORY & INSPECTOR
            ========================================================= */}
            {activeTab === 'users' && (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                {/* Header & Controls */}
                <div className="p-5 border-b border-slate-200 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-base font-bold text-slate-900">
                        Registered Users & Member Profiles ({filteredUsers.length} of {registeredAccounts.length})
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Inspect basic information, contact details, origin & residing locations, target retirement havens, financial readiness, and travel logs for every registered account.
                      </p>
                    </div>

                    <div className="flex items-center flex-wrap gap-2 shrink-0">
                      <button
                        onClick={handleRefreshCloudUsers}
                        disabled={isFirebaseSyncing}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isFirebaseSyncing ? 'animate-spin' : ''}`} />
                        <span>Refresh Cloud Users</span>
                      </button>
                      <button
                        onClick={handleExportUsersCsv}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Export CSV</span>
                      </button>
                      <button
                        onClick={() => setIsCreateUserModalOpen(true)}
                        className="px-3 py-1.5 text-xs font-bold rounded-lg bg-orange-600 hover:bg-orange-700 text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Register User</span>
                      </button>
                    </div>
                  </div>

                  {/* Search & Segmented Filters */}
                  <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-1">
                    <div className="relative flex-1">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="Search by name, User ID, email, origin country, target country, or occupation..."
                        value={userSearch}
                        onChange={e => setUserSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    <div className="flex items-center flex-wrap gap-2">
                      {/* Role Filter */}
                      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                        {(['all', 'admin', 'member'] as const).map(roleOpt => (
                          <button
                            key={roleOpt}
                            onClick={() => setUserRoleFilter(roleOpt)}
                            className={`px-2.5 py-1 text-xs font-medium rounded-md capitalize transition-colors cursor-pointer ${
                              userRoleFilter === roleOpt
                                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            {roleOpt === 'all' ? 'All Roles' : roleOpt}
                          </button>
                        ))}
                      </div>

                      {/* Relocation Stage Filter */}
                      <select
                        value={userStageFilter}
                        onChange={e => setUserStageFilter(e.target.value)}
                        className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="all">All Relocation Stages</option>
                        <option value="Exploring Options">Exploring Options</option>
                        <option value="Scouting In-Person">Scouting In-Person</option>
                        <option value="Visa In-Progress">Visa In-Progress</option>
                        <option value="Relocated & Settled">Relocated & Settled</option>
                        <option value="Early Retired (FIRE)">Early Retired (FIRE)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Detailed Registered Users Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs divide-y divide-slate-200">
                    <thead className="bg-slate-50 text-slate-600 font-semibold">
                      <tr>
                        <th className="py-3 px-4">Registered User & ID</th>
                        <th className="py-3 px-4">Email & Occupation</th>
                        <th className="py-3 px-4">Origin & Residing</th>
                        <th className="py-3 px-4">Target Haven & Plan</th>
                        <th className="py-3 px-4">Languages & Activity</th>
                        <th className="py-3 px-4 text-right">Budget & Net Worth</th>
                        <th className="py-3 px-4 text-right">Manage</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredUsers.map(acc => {
                        const p = acc.profile;
                        const netWorth = getUserNetWorth(acc);
                        const isCurrent = acc.id === currentUserId;
                        const langs = (p?.languagesKnown || []).map(l => l.language).join(', ') || 'English';

                        return (
                          <tr key={acc.id} className="hover:bg-slate-50/80 transition-colors">
                            {/* Col 1: Avatar, Name, ID, Created */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                {p?.avatarUrl ? (
                                  <img
                                    src={p.avatarUrl}
                                    alt={acc.name}
                                    className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                                    referrerPolicy="no-referrer"
                                  />
                                ) : (
                                  <div className="w-9 h-9 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                                    {acc.name.charAt(0)}
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                    <button
                                      onClick={() => openUserInspector(acc, false)}
                                      className="hover:text-orange-600 hover:underline text-left cursor-pointer"
                                    >
                                      {acc.name}
                                    </button>
                                    {isCurrent && (
                                      <span className="text-[10px] font-semibold text-emerald-700">
                                        · Current
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-slate-500 font-mono">
                                    {acc.id} {acc.username && acc.username !== acc.id ? `(@${acc.username})` : ''}
                                  </div>
                                  <div className="text-[10px] text-slate-400">
                                    Joined {acc.createdAt || '2026-01-01'} · {acc.cloudSynced ? 'Cloud Synced' : 'Local'}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Col 2: Email, Role, Occupation */}
                            <td className="py-3.5 px-4">
                              <div className="font-medium text-slate-900">{acc.email}</div>
                              <div className="text-[11px] text-slate-500 mt-0.5">
                                <span
                                  className={
                                    p?.role === 'admin'
                                      ? 'font-bold text-amber-800'
                                      : 'font-semibold text-slate-700'
                                  }
                                >
                                  {p?.role === 'admin' ? 'Admin' : 'Member'}
                                </span>
                                <span aria-hidden="true"> · </span>
                                <span>{p?.occupationOrBackground || 'Retiree'}</span>
                              </div>
                            </td>

                            {/* Col 3: Origin & Residing */}
                            <td className="py-3.5 px-4">
                              <div className="font-medium text-slate-800">
                                Origin: {getWorldCountryFlag(p?.originCountry)} {p?.originCountry || 'United States'}
                                {p?.originCity ? `, ${p.originCity}` : ''}
                              </div>
                              <div className="text-[11px] text-slate-500 mt-0.5">
                                Residing: {getWorldCountryFlag(p?.residingCountry || p?.originCountry)}{' '}
                                {p?.residingCountry || p?.originCountry || 'United States'}
                              </div>
                            </td>

                            {/* Col 4: Target Haven & Status */}
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-slate-900">
                                {getWorldCountryFlag(p?.targetCountry)} {p?.targetCountry || 'Portugal'} ({p?.retirementTimelineYear || 2027})
                              </div>
                              <div className="text-[11px] text-slate-600 mt-0.5">
                                {p?.relocationStatus || 'Exploring Options'} · {p?.preferredClimate || 'Any'}
                              </div>
                            </td>

                            {/* Col 5: Languages, Shortlist, Trips */}
                            <td className="py-3.5 px-4">
                              <div className="text-slate-800 truncate max-w-[180px]" title={langs}>
                                {langs}
                              </div>
                              <div className="text-[11px] text-slate-500 font-mono tabular-nums mt-0.5">
                                {p?.savedCountryIds?.length || 0} saved · {p?.appliedVisas?.length || 0} visas ·{' '}
                                {p?.travelHistory?.length || 0} trips
                              </div>
                            </td>

                            {/* Col 6: Budget & Net Worth */}
                            <td className="py-3.5 px-4 text-right font-mono tabular-nums">
                              <div className="font-bold text-slate-900">
                                ${(p?.monthlyBudgetUSD || 0).toLocaleString()}/mo
                              </div>
                              <div className="text-[11px] text-slate-500 mt-0.5">
                                Portfolio: ${(netWorth / 1000).toFixed(0)}k
                              </div>
                            </td>

                            {/* Col 7: Actions */}
                            <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-1">
                              <button
                                onClick={() => openUserInspector(acc, false)}
                                className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-[11px] inline-flex items-center gap-1 transition-colors cursor-pointer"
                                title="View full user dossier"
                              >
                                <Eye className="w-3 h-3" />
                                <span>Dossier</span>
                              </button>
                              <button
                                onClick={() => openUserInspector(acc, true)}
                                className="p-1.5 rounded-lg text-orange-700 hover:bg-orange-50 transition-colors cursor-pointer"
                                title="Edit user information"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              {!isCurrent && (
                                <button
                                  onClick={() => {
                                    switchAccount(acc.id);
                                    setStatusBanner({
                                      type: 'info',
                                      message: `Switched active perspective to ${acc.name} (${acc.id}).`,
                                    });
                                  }}
                                  className="p-1.5 rounded-lg text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer"
                                  title={`Switch session to ${acc.name}`}
                                >
                                  <UserCheck className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {acc.id !== 'usr-ganesh' && registeredAccounts.length > 1 && (
                                <button
                                  onClick={async () => {
                                    if (confirm(`Remove registered user account "${acc.name}" (${acc.id})?`)) {
                                      const res = await deleteUserAccount(acc.id);
                                      if (res.success) {
                                        setStatusBanner({
                                          type: 'info',
                                          message: `Removed user account ${acc.id}.`,
                                        });
                                      }
                                    }
                                  }}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                  title="Delete user account"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* =========================================================
                TAB 3: COUNTRY CATALOG CMS
            ========================================================= */}
            {activeTab === 'countries' && (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="p-5 border-b border-slate-200 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-base font-bold text-slate-900">
                        Country Catalog Database ({filteredCountries.length} of {countries.length} Havens)
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Edit live empirical indicators, retirement visa income thresholds, and healthcare scores.
                      </p>
                    </div>

                    <button
                      onClick={() => setIsAddModalOpen(true)}
                      className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New Country</span>
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="relative flex-1">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="Search countries, capitals, regions, or visa programs..."
                        value={adminSearch}
                        onChange={e => setAdminSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                      {['All', 'Europe', 'Southeast Asia', 'Americas'].map(reg => (
                        <button
                          key={reg}
                          onClick={() => setRegionFilter(reg)}
                          className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                            regionFilter === reg
                              ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {reg}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs divide-y divide-slate-200">
                    <thead className="bg-slate-50 text-slate-600 font-semibold">
                      <tr>
                        <th className="py-3 px-4">Country & Flag</th>
                        <th className="py-3 px-4">Region</th>
                        <th className="py-3 px-4 text-right">Single Budget</th>
                        <th className="py-3 px-4">Visa Program</th>
                        <th className="py-3 px-4 text-right">Min. Income</th>
                        <th className="py-3 px-4 text-right">Healthcare</th>
                        <th className="py-3 px-4 text-right">Sun Days</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredCountries.map(c => (
                        <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                            <CountryFlag
                              countryCode={c.code}
                              countryName={c.name}
                              fallbackEmoji={c.flag}
                              size="sm"
                              className="rounded-xs shrink-0"
                            />
                            <button
                              onClick={() => navigateToCountry(c.id)}
                              className="hover:text-orange-700 hover:underline text-left font-semibold cursor-pointer"
                            >
                              {c.name}
                            </button>
                          </td>

                          <td className="py-3 px-4 text-slate-600">{c.region}</td>

                          <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-slate-900">
                            ${c.costOfLiving.monthlyBudgetSingleUSD.toLocaleString()}/mo
                          </td>

                          <td className="py-3 px-4 text-slate-700 truncate max-w-[180px]" title={c.visa.retirementVisaName}>
                            {c.visa.retirementVisaName}
                          </td>

                          <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-slate-800">
                            ${c.visa.minimumIncomeUSD.toLocaleString()}/mo
                          </td>

                          <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-purple-700">
                            {c.lifestyle.healthcareScore}/100
                          </td>

                          <td className="py-3 px-4 text-right font-mono tabular-nums text-amber-700 font-medium">
                            {c.climate.annualSunnyDays} d/yr
                          </td>

                          <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                            <button
                              onClick={() => setEditingCountry(JSON.parse(JSON.stringify(c)))}
                              className="p-1.5 rounded text-orange-700 hover:bg-orange-50 cursor-pointer"
                              title="Edit Country Data"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete ${c.name} from the database?`)) {
                                  deleteCountry(c.id);
                                }
                              }}
                              className="p-1.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                              title="Delete Country"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* =========================================================
                TAB 4: COMMUNITY & MEETUPS MODERATION
            ========================================================= */}
            {activeTab === 'community' && (
              <div className="space-y-6">
                {/* Community Threads Moderation */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <div className="p-5 border-b border-slate-200">
                    <h2 className="text-base font-bold text-slate-900">
                      Expat Forum Discussions ({threads.length})
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Pin important regulatory advisories or remove off-topic discussions.
                    </p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs divide-y divide-slate-200">
                      <thead className="bg-slate-50 text-slate-600 font-semibold">
                        <tr>
                          <th className="py-3 px-4">Discussion Title</th>
                          <th className="py-3 px-4">Author</th>
                          <th className="py-3 px-4">Destination & Topic</th>
                          <th className="py-3 px-4 text-right">Engagement</th>
                          <th className="py-3 px-4 text-right">Moderation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {threads.map(t => (
                          <tr key={t.id} className="hover:bg-slate-50/70">
                            <td className="py-3 px-4">
                              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                {t.isPinned && <Pin className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
                                <span>{t.title}</span>
                              </div>
                              <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                                {t.content}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-medium text-slate-800">{t.authorName}</div>
                              <div className="text-[11px] text-slate-500">{t.authorLocation}</div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-semibold text-slate-800">{t.countryName}</div>
                              <div className="text-[11px] text-slate-500">{t.category}</div>
                            </td>
                            <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700">
                              {t.upvotes} upvotes · {t.comments.length} replies
                            </td>
                            <td className="py-3 px-4 text-right whitespace-nowrap space-x-1">
                              <button
                                onClick={() => togglePinThread(t.id)}
                                className={`px-2.5 py-1 rounded text-[11px] font-semibold cursor-pointer ${
                                  t.isPinned
                                    ? 'bg-amber-100 text-amber-900'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                }`}
                              >
                                {t.isPinned ? 'Unpin' : 'Pin'}
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Delete discussion thread "${t.title}"?`)) {
                                    deleteThread(t.id);
                                  }
                                }}
                                className="p-1.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                                title="Delete Thread"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Meetups Moderation */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <div className="p-5 border-b border-slate-200">
                    <h2 className="text-base font-bold text-slate-900">
                      Scheduled Expat Meetups ({meetups.length})
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Review upcoming in-person expat gatherings across retirement hubs.
                    </p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs divide-y divide-slate-200">
                      <thead className="bg-slate-50 text-slate-600 font-semibold">
                        <tr>
                          <th className="py-3 px-4">Event & Category</th>
                          <th className="py-3 px-4">City & Country</th>
                          <th className="py-3 px-4">Date & Venue</th>
                          <th className="py-3 px-4">Host</th>
                          <th className="py-3 px-4 text-right">Attendees</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {meetups.map(m => (
                          <tr key={m.id} className="hover:bg-slate-50/70">
                            <td className="py-3 px-4">
                              <div className="font-bold text-slate-900">{m.title}</div>
                              <div className="text-[11px] text-slate-500">{m.category}</div>
                            </td>
                            <td className="py-3 px-4 font-medium text-slate-800">
                              {m.city}, {m.countryName}
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-medium text-slate-800">
                                {m.date} · {m.time}
                              </div>
                              <div className="text-[11px] text-slate-500">{m.location}</div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-medium text-slate-800">{m.hostName}</div>
                              <div className="text-[11px] text-slate-500">{m.hostRole}</div>
                            </td>
                            <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-slate-900">
                              {m.attendeesCount}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => {
                                  if (confirm(`Cancel and remove meetup "${m.title}"?`)) {
                                    deleteMeetup(m.id);
                                  }
                                }}
                                className="p-1.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                                title="Delete Meetup"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* =========================================================
                TAB 5: USER FEEDBACK & BUG REPORTS (Interactive Triage)
            ========================================================= */}
            {activeTab === 'feedback' && (
              <AdminFeedbackManagement />
            )}

            {/* =========================================================
                TAB 6: CLOUD DATABASE & GOVERNANCE
            ========================================================= */}
            {activeTab === 'cloud' && (
              <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Firebase Cloud Firestore & Account Sync Center
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Manage cloud persistence for all registered User IDs, country journals, checklists, and community threads.
                    </p>
                  </div>
                  <button
                    onClick={openFirebaseModal}
                    className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-2 shrink-0 cursor-pointer"
                  >
                    <Database className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Open Full Cloud Connection Modal</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-xs text-slate-500">Google Auth Session</div>
                    <div className="text-sm font-bold text-slate-900 mt-1 truncate">
                      {firebaseUser ? firebaseUser.email : 'Not signed in with Google'}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      {firebaseUser ? 'Authenticated for Cloud Read/Write' : 'Using Local Storage + Preloaded Accounts'}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-xs text-slate-500">Registered Accounts Synced</div>
                    <div className="font-mono tabular-nums text-lg font-extrabold text-slate-900 mt-1">
                      {userStats.syncedCount} / {userStats.total} Accounts
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Stored in /users & /savedAccounts
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-xs text-slate-500">Last Cloud Sync</div>
                    <div className="font-mono tabular-nums text-sm font-bold text-slate-900 mt-1">
                      {lastCloudSyncTime
                        ? new Date(lastCloudSyncTime).toLocaleString()
                        : 'Pending initial cloud sync'}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Automatic real-time persistence
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={async () => {
                      const res = await syncAllAccountsToCloud();
                      setStatusBanner({
                        type: res.success ? 'success' : 'error',
                        message: res.success
                          ? `Successfully synced ${res.syncedCount} registered user accounts and workspace collections to Firestore.`
                          : res.error || 'Sync failed.',
                      });
                    }}
                    disabled={isFirebaseSyncing}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isFirebaseSyncing ? 'animate-spin' : ''}`} />
                    <span>Push All Registered Users to Cloud</span>
                  </button>

                  <button
                    onClick={handleRefreshCloudUsers}
                    disabled={isFirebaseSyncing}
                    className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Pull Registered Users from Cloud</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================
          MODAL 1: REGISTERED USER DOSSIER & EDITOR
      ========================================================= */}
      {selectedUserAccount && editUserDraft && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-5">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3.5">
                {selectedUserAccount.profile?.avatarUrl ? (
                  <img
                    src={selectedUserAccount.profile.avatarUrl}
                    alt={selectedUserAccount.name}
                    className="w-14 h-14 rounded-full object-cover border border-slate-200"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold text-lg">
                    {selectedUserAccount.name.charAt(0)}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-extrabold text-slate-900">
                      {selectedUserAccount.name}
                    </h3>
                    <span className="text-xs font-mono text-slate-500">
                      ({selectedUserAccount.id})
                    </span>
                    <span className="text-xs font-bold text-amber-800 capitalize">
                      · {selectedUserAccount.profile?.role || 'member'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {selectedUserAccount.email} · Joined {selectedUserAccount.createdAt || '2026-01-01'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditingUser(!isEditingUser)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                    isEditingUser
                      ? 'bg-slate-100 text-slate-800 border-slate-300'
                      : 'bg-orange-50 text-orange-800 border-orange-200 hover:bg-orange-100'
                  }`}
                >
                  {isEditingUser ? 'View Dossier' : 'Edit User'}
                </button>
                <button
                  onClick={() => {
                    setSelectedUserAccount(null);
                    setEditUserDraft(null);
                    setIsEditingUser(false);
                  }}
                  className="p-1.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {isEditingUser ? (
              /* Edit User Form */
              <form onSubmit={handleSaveUserEdit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={editUserDraft.name}
                      onChange={e =>
                        setEditUserDraft({
                          ...editUserDraft,
                          name: e.target.value,
                          profile: { ...editUserDraft.profile, name: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={editUserDraft.email}
                      onChange={e =>
                        setEditUserDraft({
                          ...editUserDraft,
                          email: e.target.value,
                          profile: { ...editUserDraft.profile, email: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">System Role</label>
                    <select
                      value={editUserDraft.profile.role}
                      onChange={e =>
                        setEditUserDraft({
                          ...editUserDraft,
                          profile: { ...editUserDraft.profile, role: e.target.value as 'admin' | 'member' },
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Origin Country</label>
                    <input
                      type="text"
                      value={editUserDraft.profile.originCountry}
                      onChange={e =>
                        setEditUserDraft({
                          ...editUserDraft,
                          profile: { ...editUserDraft.profile, originCountry: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Residing Country</label>
                    <input
                      type="text"
                      value={editUserDraft.profile.residingCountry || editUserDraft.profile.originCountry}
                      onChange={e =>
                        setEditUserDraft({
                          ...editUserDraft,
                          profile: { ...editUserDraft.profile, residingCountry: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Target Haven</label>
                    <input
                      type="text"
                      value={editUserDraft.profile.targetCountry}
                      onChange={e =>
                        setEditUserDraft({
                          ...editUserDraft,
                          profile: { ...editUserDraft.profile, targetCountry: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Target Retirement Year</label>
                    <input
                      type="number"
                      value={editUserDraft.profile.retirementTimelineYear}
                      onChange={e =>
                        setEditUserDraft({
                          ...editUserDraft,
                          profile: { ...editUserDraft.profile, retirementTimelineYear: Number(e.target.value) },
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Monthly Budget (USD)</label>
                    <input
                      type="number"
                      value={editUserDraft.profile.monthlyBudgetUSD}
                      onChange={e =>
                        setEditUserDraft({
                          ...editUserDraft,
                          profile: { ...editUserDraft.profile, monthlyBudgetUSD: Number(e.target.value) },
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Relocation Stage</label>
                    <select
                      value={editUserDraft.profile.relocationStatus || 'Exploring Options'}
                      onChange={e =>
                        setEditUserDraft({
                          ...editUserDraft,
                          profile: {
                            ...editUserDraft.profile,
                            relocationStatus: e.target.value as any,
                          },
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    >
                      <option value="Exploring Options">Exploring Options</option>
                      <option value="Scouting In-Person">Scouting In-Person</option>
                      <option value="Visa In-Progress">Visa In-Progress</option>
                      <option value="Relocated & Settled">Relocated & Settled</option>
                      <option value="Early Retired (FIRE)">Early Retired (FIRE)</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Occupation / Background</label>
                    <input
                      type="text"
                      value={editUserDraft.profile.occupationOrBackground || ''}
                      onChange={e =>
                        setEditUserDraft({
                          ...editUserDraft,
                          profile: { ...editUserDraft.profile, occupationOrBackground: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Member Bio</label>
                  <textarea
                    rows={2}
                    value={editUserDraft.profile.bio || ''}
                    onChange={e =>
                      setEditUserDraft({
                        ...editUserDraft,
                        profile: { ...editUserDraft.profile, bio: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setIsEditingUser(false)}
                    className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold cursor-pointer"
                  >
                    Save User Changes
                  </button>
                </div>
              </form>
            ) : (
              /* Read-Only Comprehensive User Dossier View */
              <div className="space-y-5 text-xs">
                {/* Basic Info Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[11px] text-slate-500 block">Origin & City</span>
                    <span className="font-bold text-slate-900 mt-0.5 block">
                      {getWorldCountryFlag(selectedUserAccount.profile?.originCountry)}{' '}
                      {selectedUserAccount.profile?.originCountry || 'United States'}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {selectedUserAccount.profile?.originCity || 'Not specified'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[11px] text-slate-500 block">Residing Country</span>
                    <span className="font-bold text-slate-900 mt-0.5 block">
                      {getWorldCountryFlag(
                        selectedUserAccount.profile?.residingCountry ||
                          selectedUserAccount.profile?.originCountry
                      )}{' '}
                      {selectedUserAccount.profile?.residingCountry ||
                        selectedUserAccount.profile?.originCountry ||
                        'United States'}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {selectedUserAccount.profile?.occupationOrBackground || 'Retiree'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[11px] text-slate-500 block">Target Haven</span>
                    <span className="font-bold text-slate-900 mt-0.5 block">
                      {getWorldCountryFlag(selectedUserAccount.profile?.targetCountry)}{' '}
                      {selectedUserAccount.profile?.targetCountry || 'Portugal'} (
                      {selectedUserAccount.profile?.retirementTimelineYear || 2027})
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {selectedUserAccount.profile?.relocationStatus || 'Exploring Options'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 font-mono tabular-nums">
                    <span className="text-[11px] text-slate-500 font-sans block">Budget & Net Worth</span>
                    <span className="font-bold text-slate-900 mt-0.5 block">
                      ${(selectedUserAccount.profile?.monthlyBudgetUSD || 0).toLocaleString()}/mo
                    </span>
                    <span className="text-[11px] text-emerald-700 font-semibold">
                      Net: ${(getUserNetWorth(selectedUserAccount) / 1000).toFixed(0)}k USD
                    </span>
                  </div>
                </div>

                {/* Bio & About Me */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="font-bold text-slate-900">Profile Summary & Retirement Vision</div>
                  <p className="text-slate-700 leading-relaxed">
                    {selectedUserAccount.profile?.bio || 'No short bio provided.'}
                  </p>
                  {selectedUserAccount.profile?.aboutMe && (
                    <p className="text-slate-600 leading-relaxed pt-1 border-t border-slate-200/80">
                      {selectedUserAccount.profile.aboutMe}
                    </p>
                  )}
                </div>

                {/* Financial Portfolio Breakdown */}
                {selectedUserAccount.profile?.finances && (
                  <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">Financial Portfolio Snapshot</span>
                      <span className="text-[11px] text-slate-500 font-mono tabular-nums">
                        Annual Income: $
                        {(selectedUserAccount.profile.finances.currentSalaryUSD || 0).toLocaleString()}/yr
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 font-mono tabular-nums">
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70">
                        <span className="text-[10px] font-sans text-slate-500 block">Cash & Savings</span>
                        <span className="font-bold text-slate-900">
                          ${(selectedUserAccount.profile.finances.investments?.savingsUSD || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70">
                        <span className="text-[10px] font-sans text-slate-500 block">Stocks & ETFs</span>
                        <span className="font-bold text-slate-900">
                          $
                          {(
                            selectedUserAccount.profile.finances.investments?.stocksMutualFundsUSD || 0
                          ).toLocaleString()}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70">
                        <span className="text-[10px] font-sans text-slate-500 block">Real Estate</span>
                        <span className="font-bold text-slate-900">
                          $
                          {(
                            selectedUserAccount.profile.finances.investments?.realEstateUSD || 0
                          ).toLocaleString()}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70">
                        <span className="text-[10px] font-sans text-slate-500 block">Gold & Metals</span>
                        <span className="font-bold text-slate-900">
                          ${(selectedUserAccount.profile.finances.investments?.goldUSD || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70">
                        <span className="text-[10px] font-sans text-slate-500 block">Liabilities</span>
                        <span className="font-bold text-rose-700">
                          ${(selectedUserAccount.profile.finances.totalLiabilitiesUSD || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Languages, Saved Countries & Visas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
                    <div className="font-bold text-slate-900">Languages & Lifestyle Interests</div>
                    <div className="text-slate-700">
                      <span className="text-slate-500">Languages: </span>
                      {(selectedUserAccount.profile?.languagesKnown || [])
                        .map(l => `${l.language} (${l.proficiency})`)
                        .join(' · ') || 'English'}
                    </div>
                    <div className="text-slate-600 pt-1">
                      <span className="text-slate-500">Interests: </span>
                      {(selectedUserAccount.profile?.interests || []).join(' · ') || 'None listed'}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
                    <div className="font-bold text-slate-900">
                      Saved Shortlist ({selectedUserAccount.profile?.savedCountryIds?.length || 0}) & Visas
                    </div>
                    <div className="text-slate-700 capitalize">
                      <span className="text-slate-500">Shortlisted Havens: </span>
                      {(selectedUserAccount.profile?.savedCountryIds || []).join(', ') || 'None'}
                    </div>
                    <div className="text-slate-700 pt-1">
                      <span className="text-slate-500">Visas Tracked: </span>
                      {(selectedUserAccount.profile?.appliedVisas || [])
                        .map(v => `${v.visaName} (${v.status})`)
                        .join(' · ') || 'No active applications'}
                    </div>
                  </div>
                </div>

                {/* Travel History Log */}
                {selectedUserAccount.profile?.travelHistory &&
                  selectedUserAccount.profile.travelHistory.length > 0 && (
                    <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2.5">
                      <div className="font-bold text-slate-900">
                        Scouting & Travel History ({selectedUserAccount.profile.travelHistory.length} Trips)
                      </div>
                      <div className="divide-y divide-slate-100">
                        {selectedUserAccount.profile.travelHistory.map(trip => (
                          <div key={trip.id} className="py-2 flex items-start justify-between gap-4">
                            <div>
                              <div className="font-semibold text-slate-900">
                                {trip.flag} {trip.countryName} · {trip.yearVisited} ({trip.purpose})
                              </div>
                              {trip.favoriteSpotOrMemory && (
                                <p className="text-[11px] text-slate-600 mt-0.5">{trip.favoriteSpotOrMemory}</p>
                              )}
                            </div>
                            <span className="font-mono tabular-nums text-[11px] text-slate-500 shrink-0">
                              Rating: {trip.rating}/5 · Retire: {trip.wouldRetireHere || 'Maybe'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Modal Footer Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                  <button
                    onClick={() => {
                      switchAccount(selectedUserAccount.id);
                      setSelectedUserAccount(null);
                      setStatusBanner({
                        type: 'info',
                        message: `Switched active account session to ${selectedUserAccount.name} (${selectedUserAccount.id}).`,
                      });
                    }}
                    className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Switch Active Session to This User</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedUserAccount(null);
                      setEditUserDraft(null);
                    }}
                    className="px-4 py-2 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 cursor-pointer"
                  >
                    Close Dossier
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 2: REGISTER NEW USER ACCOUNT (Admin Action)
      ========================================================= */}
      {isCreateUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">Register New Expat User Account</h3>
              <button
                onClick={() => setIsCreateUserModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewUser} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. David Chen"
                    value={newUserForm.name}
                    onChange={e => setNewUserForm({ ...newUserForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Custom User ID (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. usr-david"
                    value={newUserForm.customUserId}
                    onChange={e => setNewUserForm({ ...newUserForm, customUserId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="david.chen@example.com"
                    value={newUserForm.email}
                    onChange={e => setNewUserForm({ ...newUserForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Initial Password</label>
                  <input
                    type="text"
                    required
                    value={newUserForm.password}
                    onChange={e => setNewUserForm({ ...newUserForm, password: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Origin Country</label>
                  <input
                    type="text"
                    value={newUserForm.originCountry}
                    onChange={e => setNewUserForm({ ...newUserForm, originCountry: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Residing Country</label>
                  <input
                    type="text"
                    value={newUserForm.residingCountry}
                    onChange={e => setNewUserForm({ ...newUserForm, residingCountry: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Target Country</label>
                  <input
                    type="text"
                    value={newUserForm.targetCountry}
                    onChange={e => setNewUserForm({ ...newUserForm, targetCountry: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Target Year</label>
                  <input
                    type="number"
                    value={newUserForm.retirementTimelineYear}
                    onChange={e =>
                      setNewUserForm({ ...newUserForm, retirementTimelineYear: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Monthly Budget (USD)</label>
                  <input
                    type="number"
                    value={newUserForm.monthlyBudgetUSD}
                    onChange={e =>
                      setNewUserForm({ ...newUserForm, monthlyBudgetUSD: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Relocation Stage</label>
                  <select
                    value={newUserForm.relocationStatus}
                    onChange={e =>
                      setNewUserForm({ ...newUserForm, relocationStatus: e.target.value as any })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="Exploring Options">Exploring Options</option>
                    <option value="Scouting In-Person">Scouting In-Person</option>
                    <option value="Visa In-Progress">Visa In-Progress</option>
                    <option value="Relocated & Settled">Relocated & Settled</option>
                    <option value="Early Retired (FIRE)">Early Retired (FIRE)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Occupation / Background</label>
                <input
                  type="text"
                  placeholder="e.g. Former Aerospace Engineer"
                  value={newUserForm.occupationOrBackground}
                  onChange={e =>
                    setNewUserForm({ ...newUserForm, occupationOrBackground: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCreateUserModalOpen(false)}
                  className="px-4 py-2 font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold rounded-lg bg-slate-900 hover:bg-slate-800 text-white cursor-pointer"
                >
                  Create Registered User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 3: EDIT COUNTRY DATA
      ========================================================= */}
      {editingCountry && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">
                Edit {editingCountry.flag} {editingCountry.name} Data
              </h3>
              <button onClick={() => setEditingCountry(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tagline</label>
                <input
                  type="text"
                  required
                  value={editingCountry.tagline}
                  onChange={e => setEditingCountry({ ...editingCountry, tagline: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Single Monthly Budget (USD)</label>
                  <input
                    type="number"
                    required
                    value={editingCountry.costOfLiving.monthlyBudgetSingleUSD}
                    onChange={e =>
                      setEditingCountry({
                        ...editingCountry,
                        costOfLiving: {
                          ...editingCountry.costOfLiving,
                          monthlyBudgetSingleUSD: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Couple Monthly Budget (USD)</label>
                  <input
                    type="number"
                    required
                    value={editingCountry.costOfLiving.monthlyBudgetCoupleUSD}
                    onChange={e =>
                      setEditingCountry({
                        ...editingCountry,
                        costOfLiving: {
                          ...editingCountry.costOfLiving,
                          monthlyBudgetCoupleUSD: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Retirement Visa Name</label>
                  <input
                    type="text"
                    required
                    value={editingCountry.visa.retirementVisaName}
                    onChange={e =>
                      setEditingCountry({
                        ...editingCountry,
                        visa: { ...editingCountry.visa, retirementVisaName: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Min. Monthly Passive Income (USD)</label>
                  <input
                    type="number"
                    required
                    value={editingCountry.visa.minimumIncomeUSD}
                    onChange={e =>
                      setEditingCountry({
                        ...editingCountry,
                        visa: { ...editingCountry.visa, minimumIncomeUSD: Number(e.target.value) },
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Healthcare Score (0-100)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={editingCountry.lifestyle.healthcareScore}
                    onChange={e =>
                      setEditingCountry({
                        ...editingCountry,
                        lifestyle: { ...editingCountry.lifestyle, healthcareScore: Number(e.target.value) },
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Safety Score (0-100)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={editingCountry.lifestyle.safetyScore}
                    onChange={e =>
                      setEditingCountry({
                        ...editingCountry,
                        lifestyle: { ...editingCountry.lifestyle, safetyScore: Number(e.target.value) },
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Annual Sunny Days</label>
                  <input
                    type="number"
                    min={50}
                    max={365}
                    value={editingCountry.climate.annualSunnyDays}
                    onChange={e =>
                      setEditingCountry({
                        ...editingCountry,
                        climate: { ...editingCountry.climate, annualSunnyDays: Number(e.target.value) },
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Country Overview Prose</label>
                <textarea
                  rows={3}
                  value={editingCountry.overview}
                  onChange={e => setEditingCountry({ ...editingCountry, overview: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingCountry(null)}
                  className="px-4 py-2 font-medium text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 4: ADD NEW COUNTRY
      ========================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-xl w-full p-6 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">Add New Retirement Haven</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">Country Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Belize"
                    value={newCountryForm.name}
                    onChange={e => setNewCountryForm({ ...newCountryForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Flag Emoji</label>
                  <input
                    type="text"
                    required
                    value={newCountryForm.flag}
                    onChange={e => setNewCountryForm({ ...newCountryForm, flag: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-center text-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Region</label>
                  <select
                    value={newCountryForm.region}
                    onChange={e => setNewCountryForm({ ...newCountryForm, region: e.target.value as Region })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="Europe">Europe</option>
                    <option value="Southeast Asia">Southeast Asia</option>
                    <option value="Americas">Americas</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Capital City</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Belmopan"
                    value={newCountryForm.capital}
                    onChange={e => setNewCountryForm({ ...newCountryForm, capital: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tagline</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Caribbean ease, barrier reefs, and English official tongue"
                  value={newCountryForm.tagline}
                  onChange={e => setNewCountryForm({ ...newCountryForm, tagline: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Single Budget (USD/mo)</label>
                  <input
                    type="number"
                    required
                    value={newCountryForm.costOfLiving?.monthlyBudgetSingleUSD}
                    onChange={e =>
                      setNewCountryForm({
                        ...newCountryForm,
                        costOfLiving: {
                          ...newCountryForm.costOfLiving!,
                          monthlyBudgetSingleUSD: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Min. Passive Income (USD/mo)</label>
                  <input
                    type="number"
                    required
                    value={newCountryForm.visa?.minimumIncomeUSD}
                    onChange={e =>
                      setNewCountryForm({
                        ...newCountryForm,
                        visa: { ...newCountryForm.visa!, minimumIncomeUSD: Number(e.target.value) },
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 font-medium text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-all"
                >
                  Publish Destination
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
