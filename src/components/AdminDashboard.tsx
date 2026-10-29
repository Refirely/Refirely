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
  ArrowUpRight, Clock, BookOpen, Plane, UserPlus, MessageSquarePlus,
  IndianRupee, MessageCircle, LogOut, Copy, Check, FlaskConical
} from 'lucide-react';
import { motion } from 'motion/react';
import { AdminFeedbackManagement } from './AdminFeedbackManagement';
import { AdminSocialPromoStudio } from './AdminSocialPromoStudio';
import { AdminAccountingModule } from './AdminAccountingModule';

type AdminTab = 'overview' | 'users' | 'countries' | 'community' | 'feedback' | 'accounting' | 'social-promo' | 'cloud';

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
    userProfile,
    navigateToCountry,
    registeredAccounts,
    currentUserId,
    deleteUserAccount,
    deleteAllTestAccounts,
    adminUpdateUserAccount,
    refreshRegisteredUsersFromCloud,
    syncAllAccountsToCloud,
    signup,
    firebaseUser,
    isFirebaseSyncing,
    lastCloudSyncTime,
    openFirebaseModal,
    feedbackReports,
    startDmWithPeer,
    setCurrentView,
    dmThreads,
    totalUnreadDms,
    setActiveDmThreadId,
    switchAccount,
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
  const [copiedCredentialId, setCopiedCredentialId] = useState<string | null>(null);

  // Demo Member Accounts for Admin Sandbox Testing & Verification
  const demoTestAccounts = useMemo(() => {
    return registeredAccounts.filter(
      acc =>
        acc.id !== 'guest' &&
        acc.id !== 'usr-ganesh' &&
        acc.profile?.role !== 'admin' &&
        acc.email?.toLowerCase() !== 'ganesh.indireddy@gmail.com'
    );
  }, [registeredAccounts]);

  const handleCopyCredentials = (acc: UserAccount) => {
    const text = `User ID: ${acc.id}\nEmail: ${acc.email}\nPassword: ${acc.password || 'password123'}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedCredentialId(acc.id);
      setTimeout(() => setCopiedCredentialId(null), 2500);
    }
  };

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

  // Live Accounting Snapshot (reads from Accounting module localStorage keys)
  const accountingSnapshot = useMemo(() => {
    let fxRate = 94.5;
    let txs: {
      id: string;
      date: string;
      type: 'expense' | 'revenue';
      currency: 'INR' | 'USD';
      amount: number;
      amountINR: number;
      amountUSD: number;
      vendor: string;
      category: string;
      description: string;
    }[] = [];
    try {
      const savedRate = localStorage.getItem('refirely_admin_accounting_usd_inr_rate_v1');
      if (savedRate && !isNaN(parseFloat(savedRate)) && parseFloat(savedRate) > 0) {
        fxRate = parseFloat(savedRate);
      }
      const savedTxs = localStorage.getItem('refirely_admin_accounting_transactions_v1');
      if (savedTxs) {
        const parsed = JSON.parse(savedTxs);
        if (Array.isArray(parsed)) txs = parsed;
      }
    } catch {}

    const expenses = txs.filter(t => t.type === 'expense');
    const revenues = txs.filter(t => t.type === 'revenue');
    const totalExpenseINR = expenses.reduce((sum, t) => sum + (t.amountINR || 0), 0);
    const totalExpenseUSD = expenses.reduce((sum, t) => sum + (t.amountUSD || 0), 0);
    const totalRevenueINR = revenues.reduce((sum, t) => sum + (t.amountINR || 0), 0);
    const totalRevenueUSD = revenues.reduce((sum, t) => sum + (t.amountUSD || 0), 0);

    return {
      fxRate,
      totalTransactions: txs.length,
      expenseCount: expenses.length,
      revenueCount: revenues.length,
      totalExpenseINR,
      totalExpenseUSD,
      totalRevenueINR,
      totalRevenueUSD,
      netBalanceINR: totalRevenueINR - totalExpenseINR,
      recentTransactions: txs.slice(0, 3),
    };
  }, [activeTab]);

  // Live Social Promo Studio Snapshot
  const promoSnapshot = useMemo(() => {
    let discardedIds: string[] = [];
    let customIds: string[] = [];
    try {
      const savedDiscarded = localStorage.getItem('refirely_admin_discarded_promo_cards_v1');
      if (savedDiscarded) {
        const parsed = JSON.parse(savedDiscarded);
        if (Array.isArray(parsed)) discardedIds = parsed;
      }
      const savedCustom = localStorage.getItem('refirely_admin_custom_country_promos_v1');
      if (savedCustom) {
        const parsed = JSON.parse(savedCustom);
        if (Array.isArray(parsed)) customIds = parsed;
      }
    } catch {}
    const totalGenerated = 8 + Math.min(6, countries.length) + customIds.length;
    const activeCount = Math.max(0, totalGenerated - discardedIds.length);
    return {
      activeCount,
      discardedCount: discardedIds.length,
      coreModulesCount: 8,
      countryCoversCount: Math.min(6, countries.length) + customIds.length,
    };
  }, [activeTab, countries.length]);

  // Regional Catalog Breakdown
  const regionBreakdown = useMemo(() => {
    const map: Record<string, { count: number; totalBudget: number }> = {};
    countries.forEach(c => {
      const reg = c.region || 'Other';
      if (!map[reg]) map[reg] = { count: 0, totalBudget: 0 };
      map[reg].count += 1;
      map[reg].totalBudget += c.costOfLiving.monthlyBudgetSingleUSD || 1800;
    });
    return Object.entries(map)
      .map(([region, data]) => ({
        region,
        count: data.count,
        avgBudget: Math.round(data.totalBudget / Math.max(1, data.count)),
      }))
      .sort((a, b) => b.count - a.count);
  }, [countries]);

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

  const handleSyncAllCloud = async () => {
    const res = await syncAllAccountsToCloud();
    setStatusBanner({
      type: res.success ? 'success' : 'error',
      message: res.success
        ? `Successfully synced ${res.syncedCount} registered user accounts and workspace collections to Firestore.`
        : res.error || 'Sync failed.',
    });
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
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50/70">
      {/* Clean Contextual Governance Header (Zero Redundant Module Buttons) */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Admin Console</span>
              <span aria-hidden="true">/</span>
              <span className="text-slate-900 font-semibold">
                {activeTab === 'overview' && 'All-Modules Executive Snapshot'}
                {activeTab === 'users' && `Registered Users Directory (${registeredAccounts.length})`}
                {activeTab === 'countries' && `Country Catalog CMS (${countries.length})`}
                {activeTab === 'community' && 'Forum & Meetups Moderation'}
                {activeTab === 'feedback' && `User Feedback & Bug Reports (${feedbackReports.length})`}
                {activeTab === 'accounting' && 'Accounting, Expenses & Revenue Ledger (₹ / $)'}
                {activeTab === 'social-promo' && 'Portrait Social Promo Studio'}
                {activeTab === 'cloud' && 'Cloud Database & Sync Center'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1 tracking-tight">
              {activeTab === 'overview' && 'Platform Governance & All-Modules Snapshot'}
              {activeTab === 'users' && 'Registered Users & Member Profiles'}
              {activeTab === 'countries' && 'Global Country Dossier Catalog CMS'}
              {activeTab === 'community' && 'Community Forum & Expat Meetups'}
              {activeTab === 'feedback' && 'User Feedback, Ideas & Bug Triage'}
              {activeTab === 'accounting' && 'Accounting, Expenses & Revenue Ledger'}
              {activeTab === 'social-promo' && 'Portrait Social Promo Snapshots Studio'}
              {activeTab === 'cloud' && 'Firebase Cloud Database & Sync Center'}
            </h1>
          </div>

          {/* Primary Creation & Asset Actions Only */}
          <div className="flex items-center flex-wrap gap-2 shrink-0">
            {activeTab !== 'overview' && (
              <button
                onClick={() => setActiveTab('overview')}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-slate-600" />
                <span>All-Modules Overview</span>
              </button>
            )}
            <button
              onClick={() => setIsCreateUserModalOpen(true)}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5 text-amber-400" />
              <span>Register User</span>
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Country</span>
            </button>
            {onOpenBrandKit && (
              <button
                onClick={onOpenBrandKit}
                className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Open 4K High-Resolution Brand & Logo Kit"
              >
                <Download className="w-3.5 h-3.5 text-indigo-600" />
                <span>4K Brand Kit</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Workspace Layout: Left Module Sidebar + Content Area */}
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
          {/* Left Navigation Sidebar — Single Canonical Module Rail */}
          <aside className="w-full lg:w-60 shrink-0 bg-white border border-slate-200 rounded-2xl p-2.5 space-y-1 shadow-2xs">
            <div className="px-3 py-2 border-b border-slate-100 mb-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Admin Modules
              </p>
            </div>

            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <LayoutDashboard className="w-4 h-4 text-amber-400" />
                <span>All-Modules Overview</span>
              </span>
              <span
                className={`font-mono tabular-nums text-[10px] px-1.5 py-0.5 rounded ${
                  activeTab === 'overview' ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                8
              </span>
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'users'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-indigo-500" />
                <span>Registered Users</span>
              </span>
              <span
                className={`font-mono tabular-nums text-[11px] px-1.5 py-0.5 rounded ${
                  activeTab === 'users' ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                {registeredAccounts.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('countries')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'countries'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-teal-500" />
                <span>Country CMS Catalog</span>
              </span>
              <span
                className={`font-mono tabular-nums text-[11px] px-1.5 py-0.5 rounded ${
                  activeTab === 'countries' ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                {countries.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('accounting')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'accounting'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <IndianRupee className="w-4 h-4 text-emerald-500" />
                <span>Accounting &amp; Ledger</span>
              </span>
              <span
                className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                  activeTab === 'accounting' ? 'bg-white/15 text-white' : 'bg-emerald-50 text-emerald-800'
                }`}
              >
                ₹ / $
              </span>
            </button>

            <button
              onClick={() => setActiveTab('social-promo')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'social-promo'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Social Promo Studio</span>
              </span>
              <span
                className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                  activeTab === 'social-promo' ? 'bg-white/15 text-white' : 'bg-amber-50 text-amber-800'
                }`}
              >
                9:16
              </span>
            </button>

            <button
              onClick={() => setActiveTab('community')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'community'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4 text-violet-500" />
                <span>Forum &amp; Meetups</span>
              </span>
              <span
                className={`font-mono tabular-nums text-[11px] px-1.5 py-0.5 rounded ${
                  activeTab === 'community' ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                {threads.length + meetups.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('feedback')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'feedback'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <MessageSquarePlus className="w-4 h-4 text-rose-500" />
                <span>Feedback &amp; Bugs</span>
              </span>
              <div className="flex items-center gap-1">
                {feedbackReports.filter(r => r.status === 'new').length > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-600 text-white">
                    {feedbackReports.filter(r => r.status === 'new').length}
                  </span>
                )}
                <span
                  className={`font-mono tabular-nums text-[11px] px-1.5 py-0.5 rounded ${
                    activeTab === 'feedback' ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-700'
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
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Database className="w-4 h-4 text-sky-500" />
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

            <div className="pt-2 mt-2 border-t border-slate-100">
              <button
                onClick={() => setCurrentView('messages')}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-teal-900 bg-teal-50/70 hover:bg-teal-100/80 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2.5">
                  <MessageCircle className="w-4 h-4 text-teal-700" />
                  <span>Direct Messages</span>
                </span>
                <span className="font-mono tabular-nums text-[11px] px-1.5 py-0.5 rounded bg-white text-teal-900">
                  {totalUnreadDms > 0 ? `${totalUnreadDms} new` : dmThreads.length}
                </span>
              </button>
            </div>
          </aside>

          {/* Main Content Viewport */}
          <div className="flex-1 min-w-0 w-full space-y-6">
            {/* =========================================================
                TAB 1: ALL-MODULES EXECUTIVE SNAPSHOT OVERVIEW
            ========================================================= */}
            {activeTab === 'overview' && (
              <>
                {/* 4-Column Executive Platform Pulse Strip */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  <div
                    onClick={() => setActiveTab('users')}
                    className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-indigo-400 transition-all cursor-pointer shadow-2xs"
                  >
                    <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                      <span>01 · Registered Users</span>
                      <Users className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div className="font-mono tabular-nums text-2xl font-extrabold text-slate-900 mt-1.5">
                      {userStats.total} Accounts
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      {userStats.membersCount} Members · Avg Budget ${userStats.avgBudget.toLocaleString()}/mo
                    </div>
                  </div>

                  <div
                    onClick={() => setActiveTab('countries')}
                    className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-teal-400 transition-all cursor-pointer shadow-2xs"
                  >
                    <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                      <span>02 · Country CMS Catalog</span>
                      <Globe className="w-4 h-4 text-teal-600" />
                    </div>
                    <div className="font-mono tabular-nums text-2xl font-extrabold text-slate-900 mt-1.5">
                      {countries.length} Havens
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Across {regionBreakdown.length} global regions · Full visa &amp; cost data
                    </div>
                  </div>

                  <div
                    onClick={() => setActiveTab('accounting')}
                    className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-400 transition-all cursor-pointer shadow-2xs"
                  >
                    <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                      <span>03 · Accounting &amp; Expenses</span>
                      <IndianRupee className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="font-mono tabular-nums text-2xl font-extrabold text-slate-900 mt-1.5">
                      ₹{Math.round(accountingSnapshot.totalExpenseINR).toLocaleString('en-IN')}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      {accountingSnapshot.totalTransactions} entries · Rev: ₹{Math.round(accountingSnapshot.totalRevenueINR).toLocaleString('en-IN')} · $1 = ₹{accountingSnapshot.fxRate}
                    </div>
                  </div>

                  <div
                    onClick={() => setActiveTab('feedback')}
                    className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-rose-400 transition-all cursor-pointer shadow-2xs"
                  >
                    <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                      <span>04 · Moderation &amp; Support</span>
                      <MessageSquarePlus className="w-4 h-4 text-rose-600" />
                    </div>
                    <div className="font-mono tabular-nums text-2xl font-extrabold text-slate-900 mt-1.5">
                      {feedbackReports.filter(r => r.status === 'new').length} Open Reports
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      {threads.length} Forum Threads · {meetups.length} Meetups · {dmThreads.length} DMs
                    </div>
                  </div>
                </div>

                {/* =========================================================
                    ALL 8 ADMIN MODULES — UNIFIED SNAPSHOT GRID
                ========================================================= */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                  {/* MODULE SNAPSHOT 1: REGISTERED USERS & RELOCATION DEMAND */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between space-y-4 shadow-2xs">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                        <div>
                          <span className="text-[11px] font-semibold text-indigo-600">
                            Module 01 · User Directory &amp; Profiles
                          </span>
                          <h2 className="text-base font-bold text-slate-900 mt-0.5">
                            Registered Users ({registeredAccounts.length})
                          </h2>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Member profiles, relocation stages, financial portfolios &amp; direct messaging.
                          </p>
                        </div>
                        <button
                          onClick={() => setActiveTab('users')}
                          className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-900 font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                        >
                          <span>Open Module</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Recent 4 Registered Members Preview */}
                      <div className="divide-y divide-slate-100">
                        {registeredAccounts.slice(0, 4).map(acc => {
                          const p = acc.profile;
                          const isCurrent = acc.id === currentUserId;
                          return (
                            <div key={acc.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                              <div className="flex items-center gap-2.5 min-w-0">
                                {p?.avatarUrl ? (
                                  <img
                                    src={p.avatarUrl}
                                    alt={acc.name}
                                    className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                                    referrerPolicy="no-referrer"
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                                    {acc.name.charAt(0)}
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <button
                                    onClick={() => openUserInspector(acc, false)}
                                    className="font-bold text-slate-900 hover:text-indigo-600 truncate block text-left cursor-pointer"
                                  >
                                    {acc.name} {p?.role === 'admin' ? '(Admin)' : ''}
                                  </button>
                                  <span className="text-[11px] text-slate-500 truncate block">
                                    {getWorldCountryFlag(p?.originCountry)} {p?.originCountry || 'US'} →{' '}
                                    {getWorldCountryFlag(p?.targetCountry)} {p?.targetCountry || 'Portugal'} ·{' '}
                                    <span className="font-mono">${(p?.monthlyBudgetUSD || 2200).toLocaleString()}/mo</span>
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                {!isCurrent && p?.role !== 'admin' && (
                                  <button
                                    onClick={() =>
                                      startDmWithPeer(
                                        acc.name,
                                        p?.residingCountry || p?.targetCountry || 'Portugal',
                                        p?.originCity || 'Expat Hub',
                                        undefined,
                                        {
                                          peerAvatar: p?.avatarUrl,
                                          peerStatus: p?.relocationStatus || 'Registered Member',
                                          peerUserId: acc.id,
                                        }
                                      )
                                    }
                                    className="px-2 py-1 rounded bg-teal-50 hover:bg-teal-100 text-teal-900 font-semibold text-[11px] cursor-pointer"
                                    title={`Message ${acc.name}`}
                                  >
                                    Message
                                  </button>
                                )}
                                <button
                                  onClick={() => openUserInspector(acc, false)}
                                  className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] cursor-pointer"
                                >
                                  Inspect
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Top Target Destinations Demand */}
                      <div className="pt-2 border-t border-slate-100">
                        <div className="text-[11px] font-semibold text-slate-500 mb-2">
                          Top Member Target Destinations
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {userStats.topTargets.slice(0, 4).map(([countryName, count]) => (
                            <span
                              key={countryName}
                              className="text-xs text-slate-700 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg font-medium"
                            >
                              {getWorldCountryFlag(countryName)} {countryName}{' '}
                              <span className="font-mono text-slate-500">({count})</span>
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Demo Sandbox Quick Personas Callout */}
                      <div className="p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <FlaskConical className="w-3.5 h-3.5 text-indigo-700 shrink-0" />
                          <span className="text-slate-700 truncate">
                            <strong>Demo QA Testing Personas:</strong> usr-elena, usr-marcus, usr-arthur, usr-margaret (Password: <code className="font-mono text-indigo-900 font-bold">password123</code>)
                          </span>
                        </div>
                        <button
                          onClick={() => setActiveTab('users')}
                          className="text-[11px] font-bold text-indigo-700 hover:text-indigo-900 underline cursor-pointer shrink-0"
                        >
                          View Credentials in Users Directory →
                        </button>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <button
                        onClick={handleExportUsersCsv}
                        className="text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Export Users CSV</span>
                      </button>
                      <button
                        onClick={() => setActiveTab('users')}
                        className="font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                      >
                        View All {registeredAccounts.length} Accounts →
                      </button>
                    </div>
                  </div>

                  {/* MODULE SNAPSHOT 2: COUNTRY CATALOG CMS */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between space-y-4 shadow-2xs">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                        <div>
                          <span className="text-[11px] font-semibold text-teal-600">
                            Module 02 · Destination Dossiers
                          </span>
                          <h2 className="text-base font-bold text-slate-900 mt-0.5">
                            Country Catalog CMS ({countries.length})
                          </h2>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Edit monthly budgets, retirement visa income rules, healthcare &amp; city breakdowns.
                          </p>
                        </div>
                        <button
                          onClick={() => setActiveTab('countries')}
                          className="px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-900 font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                        >
                          <span>Open Module</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Spotlight Countries Quick Edit List */}
                      <div className="divide-y divide-slate-100">
                        {countries.slice(0, 4).map(c => (
                          <div key={c.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-2.5 min-w-0">
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
                                  className="font-bold text-slate-900 hover:text-teal-600 truncate block text-left cursor-pointer"
                                >
                                  {c.name}
                                </button>
                                <span className="text-[11px] text-slate-500 truncate block">
                                  {c.region} · {c.visa.retirementVisaName}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2.5 shrink-0">
                              <div className="text-right font-mono tabular-nums">
                                <div className="font-semibold text-slate-900">
                                  ${c.costOfLiving.monthlyBudgetSingleUSD.toLocaleString()}/mo
                                </div>
                                <div className="text-[10px] text-slate-500">
                                  Visa: ${c.visa.minimumIncomeUSD.toLocaleString()}
                                </div>
                              </div>
                              <button
                                onClick={() => setEditingCountry(JSON.parse(JSON.stringify(c)))}
                                className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] cursor-pointer"
                              >
                                Edit
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Regional Distribution Summary */}
                      <div className="pt-2 border-t border-slate-100">
                        <div className="text-[11px] font-semibold text-slate-500 mb-2">
                          Regional Catalog Coverage
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {regionBreakdown.map(r => (
                            <span
                              key={r.region}
                              className="text-xs text-slate-700 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg font-medium"
                            >
                              {r.region}: <span className="font-mono font-bold">{r.count}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add New Country</span>
                      </button>
                      <button
                        onClick={() => setActiveTab('countries')}
                        className="font-bold text-teal-700 hover:text-teal-900 cursor-pointer"
                      >
                        Manage All {countries.length} Havens →
                      </button>
                    </div>
                  </div>

                  {/* MODULE SNAPSHOT 3: ACCOUNTING, EXPENSES & REVENUE LEDGER */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between space-y-4 shadow-2xs">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                        <div>
                          <span className="text-[11px] font-semibold text-emerald-600">
                            Module 03 · Financial Bookkeeping (₹ INR &amp; $ USD)
                          </span>
                          <h2 className="text-base font-bold text-slate-900 mt-0.5">
                            Accounting, Expenses &amp; Revenue Ledger
                          </h2>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Track platform expenses, vendors, transaction heads, and monthly charts in ₹ and $.
                          </p>
                        </div>
                        <button
                          onClick={() => setActiveTab('accounting')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                        >
                          <span>Open Module</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* 3-Box Financial Summary */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                          <div className="text-[11px] text-slate-500 font-medium">Total Spent</div>
                          <div className="font-mono tabular-nums text-base font-extrabold text-rose-700 mt-0.5">
                            ₹{Math.round(accountingSnapshot.totalExpenseINR).toLocaleString('en-IN')}
                          </div>
                          <div className="font-mono tabular-nums text-[10px] text-slate-500">
                            ${accountingSnapshot.totalExpenseUSD.toFixed(2)} ({accountingSnapshot.expenseCount} tx)
                          </div>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                          <div className="text-[11px] text-slate-500 font-medium">Total Revenue</div>
                          <div className="font-mono tabular-nums text-base font-extrabold text-emerald-700 mt-0.5">
                            ₹{Math.round(accountingSnapshot.totalRevenueINR).toLocaleString('en-IN')}
                          </div>
                          <div className="font-mono tabular-nums text-[10px] text-slate-500">
                            ${accountingSnapshot.totalRevenueUSD.toFixed(2)} ({accountingSnapshot.revenueCount} tx)
                          </div>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                          <div className="text-[11px] text-slate-500 font-medium">FX Conversion</div>
                          <div className="font-mono tabular-nums text-base font-extrabold text-slate-900 mt-0.5">
                            ₹{accountingSnapshot.fxRate}
                          </div>
                          <div className="text-[10px] text-slate-500">per $1.00 USD</div>
                        </div>
                      </div>

                      {/* Recent Transactions or Empty State */}
                      {accountingSnapshot.recentTransactions.length > 0 ? (
                        <div className="divide-y divide-slate-100">
                          {accountingSnapshot.recentTransactions.map(tx => (
                            <div key={tx.id} className="py-2 flex items-center justify-between gap-2 text-xs">
                              <div className="min-w-0">
                                <div className="font-semibold text-slate-900 truncate">
                                  {tx.vendor} · <span className="text-slate-500 font-normal">{tx.category}</span>
                                </div>
                                <div className="text-[11px] text-slate-500 truncate">
                                  {tx.date} {tx.description ? `· ${tx.description}` : ''}
                                </div>
                              </div>
                              <div
                                className={`font-mono tabular-nums font-bold shrink-0 ${
                                  tx.type === 'expense' ? 'text-rose-700' : 'text-emerald-700'
                                }`}
                              >
                                {tx.type === 'expense' ? '-' : '+'}₹{Math.round(tx.amountINR).toLocaleString('en-IN')}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-600 flex items-center justify-between">
                          <span>No expenses or revenue entries recorded yet. Default currency is ₹ INR.</span>
                          <button
                            onClick={() => setActiveTab('accounting')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-semibold text-[11px] shrink-0 cursor-pointer"
                          >
                            + Log Expense
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500">
                        Supports custom vendors, categories &amp; CSV export
                      </span>
                      <button
                        onClick={() => setActiveTab('accounting')}
                        className="font-bold text-emerald-700 hover:text-emerald-900 cursor-pointer"
                      >
                        Open Accounting Ledger →
                      </button>
                    </div>
                  </div>

                  {/* MODULE SNAPSHOT 4: PORTRAIT SOCIAL PROMO STUDIO */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between space-y-4 shadow-2xs">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                        <div>
                          <span className="text-[11px] font-semibold text-amber-600">
                            Module 04 · Promotional Graphics &amp; Brand Assets
                          </span>
                          <h2 className="text-base font-bold text-slate-900 mt-0.5">
                            Portrait Social Promo Studio ({promoSnapshot.activeCount} Active)
                          </h2>
                          <p className="text-xs text-slate-500 mt-0.5">
                            High-resolution 9:16 &amp; 4:5 portrait promotional snapshots with custom charts &amp; country photos.
                          </p>
                        </div>
                        <button
                          onClick={() => setActiveTab('social-promo')}
                          className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                        >
                          <span>Open Studio</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                          <div className="text-[11px] text-slate-500 font-medium">Module Cards</div>
                          <div className="font-mono tabular-nums text-base font-extrabold text-slate-900 mt-0.5">
                            {promoSnapshot.coreModulesCount} Designs
                          </div>
                          <div className="text-[10px] text-slate-500">Distinct chart styles</div>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                          <div className="text-[11px] text-slate-500 font-medium">Country Covers</div>
                          <div className="font-mono tabular-nums text-base font-extrabold text-slate-900 mt-0.5">
                            {promoSnapshot.countryCoversCount} Covers
                          </div>
                          <div className="text-[10px] text-slate-500">With country photos</div>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                          <div className="text-[11px] text-slate-500 font-medium">Discarded</div>
                          <div className="font-mono tabular-nums text-base font-extrabold text-slate-900 mt-0.5">
                            {promoSnapshot.discardedCount} Cards
                          </div>
                          <div className="text-[10px] text-slate-500">Restorable anytime</div>
                        </div>
                      </div>

                      <div className="text-xs text-slate-600 space-y-1.5">
                        <div className="font-semibold text-slate-800">Included Bespoke Visual Layouts:</div>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          Editorial Destination Bento · FIRE Budget Donut · 3D Interactive Globe · Banking FX Waterfall (₹94.5/$) · Healthcare Gauge · Multi-Country Radar Matrix · Dating &amp; Meetups · Country Magazine Cover with Photo Banner.
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      {onOpenBrandKit ? (
                        <button
                          onClick={onOpenBrandKit}
                          className="text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>4K Logo &amp; Brand Kit</span>
                        </button>
                      ) : (
                        <span className="text-slate-500">1080×1920 &amp; 1080×1350 PNG export</span>
                      )}
                      <button
                        onClick={() => setActiveTab('social-promo')}
                        className="font-bold text-amber-700 hover:text-amber-900 cursor-pointer"
                      >
                        Generate &amp; Download Promos →
                      </button>
                    </div>
                  </div>

                  {/* MODULE SNAPSHOT 5: COMMUNITY FORUM & EXPAT MEETUPS MODERATION */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between space-y-4 shadow-2xs">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                        <div>
                          <span className="text-[11px] font-semibold text-violet-600">
                            Module 05 · Discussions &amp; Events
                          </span>
                          <h2 className="text-base font-bold text-slate-900 mt-0.5">
                            Forum ({threads.length}) &amp; Meetups ({meetups.length})
                          </h2>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Pin important community threads, remove spam, and moderate scheduled expat meetups.
                          </p>
                        </div>
                        <button
                          onClick={() => setActiveTab('community')}
                          className="px-3 py-1.5 rounded-lg bg-violet-50 hover:bg-violet-100 text-violet-900 font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                        >
                          <span>Open Module</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="divide-y divide-slate-100">
                        {threads.slice(0, 3).map(t => (
                          <div key={t.id} className="py-2 flex items-center justify-between gap-2 text-xs">
                            <div className="min-w-0">
                              <div className="font-semibold text-slate-900 truncate">
                                {t.isPinned ? '📌 ' : ''}
                                {t.title}
                              </div>
                              <div className="text-[11px] text-slate-500 truncate">
                                {t.authorName} · {t.countryTag} · {t.comments.length} replies
                              </div>
                            </div>
                            <button
                              onClick={() => togglePinThread(t.id)}
                              className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] shrink-0 cursor-pointer"
                            >
                              {t.isPinned ? 'Unpin' : 'Pin'}
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                        <span>Upcoming Expat Meetups Scheduled:</span>
                        <span className="font-mono font-bold text-slate-900">{meetups.length} Active Events</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500">
                        {threads.filter(t => t.isPinned).length} pinned threads
                      </span>
                      <button
                        onClick={() => setActiveTab('community')}
                        className="font-bold text-violet-700 hover:text-violet-900 cursor-pointer"
                      >
                        Moderate Forum &amp; Meetups →
                      </button>
                    </div>
                  </div>

                  {/* MODULE SNAPSHOT 6: USER FEEDBACK & BUG REPORTS TRIAGE */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between space-y-4 shadow-2xs">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                        <div>
                          <span className="text-[11px] font-semibold text-rose-600">
                            Module 06 · Quality Assurance &amp; Ideas
                          </span>
                          <h2 className="text-base font-bold text-slate-900 mt-0.5">
                            User Feedback &amp; Bug Reports ({feedbackReports.length})
                          </h2>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Review member bug reports, feature requests, priority levels, and resolution notes.
                          </p>
                        </div>
                        <button
                          onClick={() => setActiveTab('feedback')}
                          className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-900 font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                        >
                          <span>Open Module</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                          <div className="text-[11px] text-slate-500">New / Open</div>
                          <div className="font-mono tabular-nums text-base font-extrabold text-rose-700">
                            {feedbackReports.filter(r => r.status === 'new').length}
                          </div>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                          <div className="text-[11px] text-slate-500">Bug Reports</div>
                          <div className="font-mono tabular-nums text-base font-extrabold text-slate-900">
                            {feedbackReports.filter(r => r.type === 'bug').length}
                          </div>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                          <div className="text-[11px] text-slate-500">Resolved</div>
                          <div className="font-mono tabular-nums text-base font-extrabold text-emerald-700">
                            {feedbackReports.filter(r => r.status === 'resolved' || r.status === 'closed').length}
                          </div>
                        </div>
                      </div>

                      <div className="divide-y divide-slate-100">
                        {feedbackReports.slice(0, 3).map(rep => (
                          <div key={rep.id} className="py-2 flex items-center justify-between gap-2 text-xs">
                            <div className="min-w-0">
                              <div className="font-semibold text-slate-900 truncate">{rep.title}</div>
                              <div className="text-[11px] text-slate-500 truncate">
                                {rep.userName} · {rep.type.toUpperCase()} · Priority: {rep.priority}
                              </div>
                            </div>
                            <span className="text-[11px] font-semibold text-slate-600 capitalize shrink-0">
                              {rep.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500">
                        {feedbackReports.filter(r => r.type !== 'bug').length} feature ideas &amp; feedback logged
                      </span>
                      <button
                        onClick={() => setActiveTab('feedback')}
                        className="font-bold text-rose-700 hover:text-rose-900 cursor-pointer"
                      >
                        Open Feedback Triage →
                      </button>
                    </div>
                  </div>

                  {/* MODULE SNAPSHOT 7: ADMIN DIRECT MESSAGES & MEMBER OUTREACH */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between space-y-4 shadow-2xs">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                        <div>
                          <span className="text-[11px] font-semibold text-teal-600">
                            Module 07 · Admin-Initiated Member Outreach
                          </span>
                          <h2 className="text-base font-bold text-slate-900 mt-0.5">
                            Direct Messages ({dmThreads.length} Conversations)
                          </h2>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Only Admin can initiate direct conversations with normal members. Members can reply in active threads.
                          </p>
                        </div>
                        <button
                          onClick={() => setCurrentView('messages')}
                          className="px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-900 font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                        >
                          <span>Open Inbox</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {dmThreads.length > 0 ? (
                        <div className="divide-y divide-slate-100">
                          {dmThreads.slice(0, 3).map(dm => (
                            <div key={dm.id} className="py-2 flex items-center justify-between gap-3 text-xs">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <img
                                  src={dm.peerAvatar}
                                  alt={dm.peerName}
                                  className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="min-w-0">
                                  <div className="font-bold text-slate-900 truncate">{dm.peerName}</div>
                                  <div className="text-[11px] text-slate-500 truncate">{dm.lastMessage}</div>
                                </div>
                              </div>
                              <button
                                onClick={() => {
                                  setActiveDmThreadId(dm.id);
                                  setCurrentView('messages');
                                }}
                                className="px-2.5 py-1 rounded bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-900 font-semibold text-[11px] shrink-0 cursor-pointer"
                              >
                                Open Chat
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-600">
                          No active direct message threads yet. Click "Message" next to any registered member to start a conversation.
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500">
                        {totalUnreadDms > 0 ? `${totalUnreadDms} unread messages` : 'All member messages read'}
                      </span>
                      <button
                        onClick={() => setCurrentView('messages')}
                        className="font-bold text-teal-700 hover:text-teal-900 cursor-pointer"
                      >
                        Launch Direct Messenger →
                      </button>
                    </div>
                  </div>

                  {/* MODULE SNAPSHOT 8: CLOUD DATABASE & FIRESTORE SYNC CENTER */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between space-y-4 shadow-2xs">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                        <div>
                          <span className="text-[11px] font-semibold text-sky-600">
                            Module 08 · Persistence &amp; Cloud Infrastructure
                          </span>
                          <h2 className="text-base font-bold text-slate-900 mt-0.5">
                            Firebase Cloud Database &amp; Sync Center
                          </h2>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Synchronize registered accounts, country dossiers, community threads &amp; accounting ledgers to Firestore.
                          </p>
                        </div>
                        <button
                          onClick={() => setActiveTab('cloud')}
                          className="px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-900 font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                        >
                          <span>Open Module</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                          <div className="text-[11px] text-slate-500">Connection Mode</div>
                          <div className="font-bold text-slate-900 mt-0.5">
                            {firebaseUser ? 'Google Cloud Auth Online' : 'Local Storage Active'}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate mt-0.5">
                            {firebaseUser ? firebaseUser.email : 'Connect Google Auth to sync'}
                          </div>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                          <div className="text-[11px] text-slate-500">Cloud Synced Accounts</div>
                          <div className="font-mono tabular-nums text-base font-extrabold text-slate-900 mt-0.5">
                            {userStats.syncedCount} / {userStats.total}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate">
                            {lastCloudSyncTime
                              ? `Last sync: ${new Date(lastCloudSyncTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                              : 'Ready to sync'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={handleSyncAllCloud}
                          disabled={isFirebaseSyncing}
                          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isFirebaseSyncing ? 'animate-spin' : ''}`} />
                          <span>Sync All to Cloud</span>
                        </button>
                        <button
                          onClick={openFirebaseModal}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                        >
                          Connection Settings
                        </button>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500">
                        Collections: users, savedAccounts, countryCatalog, accounting
                      </span>
                      <button
                        onClick={() => setActiveTab('cloud')}
                        className="font-bold text-sky-700 hover:text-sky-900 cursor-pointer"
                      >
                        Open Cloud Center →
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

                  {/* Demo Member Accounts & QA Testing Credentials Panel */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/80 via-white to-amber-50/70 border border-indigo-200/90 shadow-2xs space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-100 pb-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700 shrink-0">
                          <FlaskConical className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                            <span>Demo Member Sandbox &amp; Testing Personas</span>
                            <span className="text-[10px] bg-indigo-100 text-indigo-800 font-extrabold px-2 py-0.5 rounded-full">
                              {demoTestAccounts.length} Test Accounts
                            </span>
                          </h3>
                          <p className="text-[11px] text-slate-500">
                            Pre-configured test personas for QA, authentication checks, and direct messaging testing.
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto shrink-0">
                        <div className="text-[11px] text-slate-600 bg-white px-3 py-1 rounded-lg border border-slate-200/90 shadow-2xs flex items-center gap-1.5">
                          <span className="text-slate-400">Default Password:</span>
                          <code className="font-mono font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            password123
                          </code>
                        </div>
                        {demoTestAccounts.length > 0 && (
                          <button
                            type="button"
                            onClick={async () => {
                              if (confirm(`Permanently remove all ${demoTestAccounts.length} test personas? They will be tombstoned in local and cloud database and will NEVER reload.`)) {
                                const res = await deleteAllTestAccounts();
                                if (res.success) {
                                  setStatusBanner({
                                    type: 'success',
                                    message: `Permanently removed ${res.deletedCount} demo persona(s). Primary admin account is preserved and test accounts will never return.`,
                                  });
                                }
                              }
                            }}
                            className="px-2.5 py-1 text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                            title="Permanently remove all demo test personas"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete All Test Personas</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {demoTestAccounts.length === 0 ? (
                      <div className="p-4 rounded-xl bg-white border border-slate-200 text-center space-y-1">
                        <div className="text-xs font-bold text-slate-700">No test personas active</div>
                        <p className="text-[11px] text-slate-500">
                          All sample demo accounts have been permanently removed and will not reload. Only genuine registered users will appear here.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        {demoTestAccounts.slice(0, 4).map(acc => {
                          const isCopied = copiedCredentialId === acc.id;
                          return (
                            <div
                              key={acc.id}
                              className="p-3 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between space-y-2.5"
                            >
                              <div className="flex items-start gap-2.5">
                                <img
                                  src={acc.profile.avatarUrl}
                                  alt={acc.name}
                                  className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="min-w-0 flex-1">
                                  <div className="font-bold text-xs text-slate-900 truncate">{acc.name}</div>
                                  <div className="text-[11px] text-slate-500 truncate">
                                    {acc.profile.occupationOrBackground || 'Retiree'}
                                  </div>
                                  <div className="text-[10px] text-slate-400 font-mono truncate">
                                    {getWorldCountryFlag(acc.profile.originCountry)} {acc.profile.originCountry} →{' '}
                                    {getWorldCountryFlag(acc.profile.targetCountry)} {acc.profile.targetCountry}
                                  </div>
                                </div>
                              </div>

                              <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/70 space-y-1 text-[11px] font-mono">
                                <div className="flex items-center justify-between text-slate-600">
                                  <span className="text-slate-400 font-sans text-[10px]">User ID:</span>
                                  <span className="font-bold text-slate-900">{acc.id}</span>
                                </div>
                                <div className="flex items-center justify-between text-slate-600 truncate">
                                  <span className="text-slate-400 font-sans text-[10px]">Email:</span>
                                  <span className="truncate max-w-[130px] text-slate-700" title={acc.email}>
                                    {acc.email}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-slate-600">
                                  <span className="text-slate-400 font-sans text-[10px]">Password:</span>
                                  <span className="font-bold text-emerald-700">{acc.password || 'password123'}</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 pt-1">
                                <button
                                  type="button"
                                  onClick={() => handleCopyCredentials(acc)}
                                  className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer border ${
                                    isCopied
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold'
                                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                                  }`}
                                >
                                  {isCopied ? (
                                    <>
                                      <Check className="w-3 h-3 text-emerald-600" />
                                      <span>Copied!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3 text-slate-500" />
                                      <span>Copy Login</span>
                                    </>
                                  )}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openUserInspector(acc, false)}
                                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                                  title="Inspect Member Profile"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    startDmWithPeer(
                                      acc.name,
                                      acc.profile.residingCountry || acc.profile.targetCountry || 'Portugal',
                                      acc.profile.originCity || 'Expat Hub',
                                      undefined,
                                      {
                                        peerAvatar: acc.profile.avatarUrl,
                                        peerStatus: acc.profile.relocationStatus || 'Registered Member',
                                        peerUserId: acc.id,
                                      }
                                    )
                                  }
                                  className="p-1.5 rounded-lg border border-teal-200 bg-teal-50 hover:bg-teal-100 text-teal-800 transition-colors cursor-pointer"
                                  title="Test Direct Message"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
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
                              {!isCurrent && p?.role !== 'admin' && (
                                <button
                                  onClick={() =>
                                    startDmWithPeer(
                                      acc.name,
                                      p?.residingCountry || p?.targetCountry || 'Portugal',
                                      p?.originCity || 'Expat Hub',
                                      undefined,
                                      {
                                        peerAvatar: p?.avatarUrl,
                                        peerStatus: p?.relocationStatus || 'Registered Member',
                                        peerUserId: acc.id,
                                      }
                                    )
                                  }
                                  className="px-2.5 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 font-semibold text-[11px] inline-flex items-center gap-1 transition-colors cursor-pointer"
                                  title={`Initiate Direct Message with ${acc.name}`}
                                >
                                  <MessageCircle className="w-3 h-3 text-teal-700" />
                                  <span>Message</span>
                                </button>
                              )}
                              {acc.id !== 'usr-ganesh' && acc.profile?.role !== 'admin' && registeredAccounts.length > 1 && (
                                <button
                                  onClick={async () => {
                                    if (confirm(`Permanently remove user account "${acc.name}" (${acc.id})? This will tombstone this user so it never returns on refresh.`)) {
                                      const res = await deleteUserAccount(acc.id);
                                      if (res.success) {
                                        setStatusBanner({
                                          type: 'info',
                                          message: `Permanently removed user account ${acc.name} (${acc.id}). Tombstone saved — will never reload.`,
                                        });
                                      } else {
                                        setStatusBanner({
                                          type: 'error',
                                          message: res.error || `Could not remove user account ${acc.id}.`,
                                        });
                                      }
                                    }
                                  }}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                  title="Permanently delete user account"
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
                TAB 5.2: ADMIN ACCOUNTING, EXPENSES & REVENUE LEDGER (₹ / $)
            ========================================================= */}
            {activeTab === 'accounting' && (
              <AdminAccountingModule />
            )}

            {/* =========================================================
                TAB 5.5: PORTRAIT SOCIAL MEDIA SNAPSHOTS STUDIO (Admin Only)
            ========================================================= */}
            {activeTab === 'social-promo' && (
              <AdminSocialPromoStudio countries={countries} />
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
                  {selectedUserAccount.id !== currentUserId && selectedUserAccount.profile?.role !== 'admin' ? (
                    <button
                      onClick={() => {
                        const targetAcc = selectedUserAccount;
                        setSelectedUserAccount(null);
                        startDmWithPeer(
                          targetAcc.name,
                          targetAcc.profile?.residingCountry || targetAcc.profile?.targetCountry || 'Portugal',
                          targetAcc.profile?.originCity || 'Expat Hub',
                          undefined,
                          {
                            peerAvatar: targetAcc.profile?.avatarUrl,
                            peerStatus: targetAcc.profile?.relocationStatus || 'Registered Member',
                            peerUserId: targetAcc.id,
                          }
                        );
                      }}
                      className="px-3.5 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Initiate Direct Message with {selectedUserAccount.name}</span>
                    </button>
                  ) : (
                    <div />
                  )}

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
