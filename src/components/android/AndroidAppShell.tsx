import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { Country, Persona, SortByType, UserFinancialPortfolio } from '../../types';
import { BrandLogo } from '../BrandLogo';
import { CountryThumbnail } from '../CountryThumbnail';
import { CountryFlag } from '../CountryFlag';
import { CountryDossier } from '../CountryDossier';
import { BadgePill } from '../BadgePill';
import { getCountryNomadProfile } from '../../data/countryNomadProfiles';
import { getCountryTravelLeisureScore } from '../../data/countryTravelMobility';
import { getCountryGastronomyProfile } from '../../data/countryFoodAndGastronomy';
import { getCountryContinentLabel, CONTINENT_FILTER_OPTIONS } from '../../utils/continents';
import { DEFAULT_FINANCIAL_PORTFOLIO } from '../../data/userAccounts';
import { getUserEarnedBadges, getAllBadgesProgress } from '../../data/badgeDefinitions';
import { calculateUnifiedFireMetrics } from '../../utils/fireCalculations';
import { generateCountryDossierPdf } from '../../utils/exportCountryDossierPdf';
import {
  getPassportTypesForCountry,
  HELD_VISA_OPTIONS,
  VISA_WORLD_COUNTRIES,
} from '../../data/visaCheckCatalog';
import {
  computeGlobalAccessMatrix,
  evaluateVisaRequirement,
} from '../../data/visaCheckEngine';
import { HeldVisaId, VisaRequirementStatus } from '../../types/visaCheck';
import {
  Sparkles,
  Compass,
  Flame,
  Stamp,
  LayoutDashboard,
  Search,
  SlidersHorizontal,
  Heart,
  X,
  ChevronRight,
  Bell,
  User,
  LogIn,
  UserPlus,
  LogOut,
  Award,
  CheckCircle2,
  Lock,
  Unlock,
  Download,
  ExternalLink,
  RefreshCw,
  Wifi,
  ShieldCheck,
  HeartPulse,
  Sun,
  Utensils,
  ArrowLeft,
  Share2,
  Check,
  Scale,
  Plus,
} from 'lucide-react';

export type AndroidTabId = 'matcher' | 'explore' | 'fire' | 'visa-check' | 'dashboard';

type PriorityDimension = 'balanced' | 'cost' | 'healthcare' | 'safety' | 'visa' | 'fiber';

const CLIMATE_PILLS = ['All', 'Mediterranean', 'Tropical', 'Subtropical', 'Temperate', 'Highlands / Mild'];

export const AndroidAppShell: React.FC = () => {
  const {
    countries,
    currentView,
    setCurrentView,
    selectedCountry,
    isAuthenticated,
    currentUserId,
    userProfile,
    updateUserProfile,
    openAuthModal,
    openEditProfile,
    logout,
    currentPersona,
    setCurrentPersona,
    savedCountryIds,
    toggleSaveCountry,
    isCountrySaved,
    comparedCountryIds,
    toggleCompareCountry,
    isCountryCompared,
    searchQuery,
    setSearchQuery,
    selectedRegion,
    setSelectedRegion,
    selectedClimate,
    setSelectedClimate,
    budgetMax,
    setBudgetMax,
    sortBy,
    setSortBy,
    resetFilters,
    filteredCountries,
    checklist,
    toggleChecklistTask,
    totalUnreadDms,
    openBadgeModal,
    openShareFireCardModal,
    earlyPioneerThreshold,
    registeredAccounts,
    trackDossierDownload,
    exitAndroidAppPreview,
  } = useApp();

  const isNativeCapacitor =
    typeof window !== 'undefined' &&
    typeof (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor
      ?.isNativePlatform === 'function' &&
    Boolean(
      (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.()
    );

  const isGuestUser = !isAuthenticated || currentUserId === 'guest';

  // Map initial web view into our 5 native Android tabs
  const [activeTab, setActiveTab] = useState<AndroidTabId>(() => {
    if (currentView === 'explore') return 'explore';
    if (currentView === 'fire-calculator') return 'fire';
    if (currentView === 'visa-check') return 'visa-check';
    if (currentView === 'dashboard') return 'dashboard';
    return 'matcher';
  });

  // Bottom-Sheet Modal States
  const [dossierCountry, setDossierCountry] = useState<Country | null>(() =>
    currentView === 'country-detail' && selectedCountry ? selectedCountry : null
  );
  const [showFull11TabDossier, setShowFull11TabDossier] = useState<boolean>(false);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState<boolean>(false);
  const [isProfileSheetOpen, setIsProfileSheetOpen] = useState<boolean>(false);
  const [isFreedomCardSheetOpen, setIsFreedomCardSheetOpen] = useState<boolean>(false);

  // Sync if external navigateToCountry is triggered (e.g. from deep links or widgets)
  useEffect(() => {
    if (currentView === 'country-detail' && selectedCountry) {
      setDossierCountry(selectedCountry);
    }
  }, [currentView, selectedCountry]);

  const handleSelectTab = (tab: AndroidTabId) => {
    setActiveTab(tab);
    setShowFull11TabDossier(false);
    const viewMap: Record<AndroidTabId, typeof currentView> = {
      matcher: 'landing',
      explore: 'explore',
      fire: 'fire-calculator',
      'visa-check': 'visa-check',
      dashboard: 'dashboard',
    };
    setCurrentView(viewMap[tab]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openCountryDossierSheet = (country: Country) => {
    setDossierCountry(country);
    setShowFull11TabDossier(false);
  };

  // ============================================================================
  // TAB 1: UNIFIED QUICK MATCHER STATE
  // ============================================================================
  const [matcherSearch, setMatcherSearch] = useState<string>('');
  const [matcherBudget, setMatcherBudget] = useState<number>(
    currentPersona === 'nomad' ? 2000 : 2600
  );
  const [matcherPriority, setMatcherPriority] = useState<PriorityDimension>('balanced');

  const matcherResults = useMemo(() => {
    const q = matcherSearch.trim().toLowerCase();
    const list = countries
      .filter(c => {
        if (!q) return true;
        const cities = (c.topCities || []).map(tc => tc.name.toLowerCase()).join(' ');
        return (
          c.name.toLowerCase().includes(q) ||
          c.capital.toLowerCase().includes(q) ||
          c.region.toLowerCase().includes(q) ||
          cities.includes(q)
        );
      })
      .map(c => {
        const np = getCountryNomadProfile(c);
        const monthlyCost =
          currentPersona === 'nomad'
            ? np.monthlyNomadBurnUSD
            : c.costOfLiving.monthlyBudgetCoupleUSD;

        let score = 70;
        const budgetDiff = matcherBudget - monthlyCost;
        if (budgetDiff >= 0) {
          score += Math.min(18, Math.round(budgetDiff / 120));
        } else {
          score -= Math.min(35, Math.round(Math.abs(budgetDiff) / 80));
        }

        if (matcherPriority === 'cost') {
          score += Math.max(0, Math.round((3500 - monthlyCost) / 140));
        } else if (matcherPriority === 'healthcare') {
          score += Math.round((c.lifestyle.healthcareScore - 65) * 0.45);
        } else if (matcherPriority === 'safety') {
          score += Math.round((c.lifestyle.safetyScore - 65) * 0.45);
        } else if (matcherPriority === 'visa') {
          score += (5 - c.visa.difficultyRating) * 4;
        } else if (matcherPriority === 'fiber') {
          score += Math.min(18, Math.round(np.verifiedInternetMbps / 15));
        } else {
          score += Math.round(
            (c.lifestyle.healthcareScore +
              c.lifestyle.safetyScore +
              getCountryTravelLeisureScore(c)) /
              18
          );
        }

        const matchPercent = Math.max(54, Math.min(99, score));
        return {
          country: c,
          nomadProfile: np,
          monthlyCost,
          matchPercent,
        };
      });

    list.sort((a, b) => b.matchPercent - a.matchPercent);
    return list.slice(0, 18);
  }, [countries, matcherSearch, matcherBudget, matcherPriority, currentPersona]);

  // ============================================================================
  // TAB 3: UNIFIED FIRE CALCULATOR & TRACKER STATE
  // ============================================================================
  const finances: UserFinancialPortfolio = useMemo(() => {
    const base = userProfile.finances || DEFAULT_FINANCIAL_PORTFOLIO;
    return {
      ...DEFAULT_FINANCIAL_PORTFOLIO,
      ...base,
      investments: {
        ...DEFAULT_FINANCIAL_PORTFOLIO.investments,
        ...(base.investments || {}),
      },
    };
  }, [userProfile.finances]);

  const [fireMode, setFireMode] = useState<'fire' | 'nomad'>(
    currentPersona === 'nomad' ? 'nomad' : 'fire'
  );
  const [fireNetWorth, setFireNetWorth] = useState<number>(() => {
    if (isGuestUser) return 250000;
    const inv = finances.investments;
    const total =
      (inv.savingsUSD || 0) +
      (inv.stocksMutualFundsUSD || 0) +
      (inv.realEstateUSD || 0) +
      (inv.goldUSD || 0) +
      (inv.othersUSD || 0);
    return total > 0 ? Math.round(total) : 250000;
  });
  const [fireAbroadBudget, setFireAbroadBudget] = useState<number>(() =>
    isGuestUser ? 2400 : Math.round(finances.monthlyRetirementExpensesUSD || userProfile.monthlyBudgetUSD || 2400)
  );
  const [fireDomesticCost, setFireDomesticCost] = useState<number>(() =>
    isGuestUser ? 4800 : Math.round(finances.monthlyCurrentExpensesUSD || 4800)
  );
  const [fireAnnualSavings, setFireAnnualSavings] = useState<number>(() =>
    isGuestUser ? 24000 : Math.round((finances.monthlySipUSD ?? 2000) * 12)
  );
  const [fireSwr, setFireSwr] = useState<number>(() => finances.safeWithdrawalRatePercent || 4.0);
  const [fireToast, setFireToast] = useState<string | null>(null);

  // 5-scheme draft for logged in users
  const [schemeSavings, setSchemeSavings] = useState<number>(finances.investments.savingsUSD || 35000);
  const [schemeStocks, setSchemeStocks] = useState<number>(finances.investments.stocksMutualFundsUSD || 165000);
  const [schemeRealEstate, setSchemeRealEstate] = useState<number>(finances.investments.realEstateUSD || 0);
  const [schemeGold, setSchemeGold] = useState<number>(finances.investments.goldUSD || 25000);
  const [schemeOthers, setSchemeOthers] = useState<number>(finances.investments.othersUSD || 25000);

  // Nomad Runway sliders
  const [nomadCash, setNomadCash] = useState<number>(36000);
  const [nomadBurn, setNomadBurn] = useState<number>(1850);
  const [nomadIncome, setNomadIncome] = useState<number>(850);

  const swrDec = Math.max(0.02, fireSwr / 100);
  const fireTargetAbroadUSD = Math.round((fireAbroadBudget * 12) / swrDec);
  const fireTargetHomeUSD = Math.round((fireDomesticCost * 12) / swrDec);
  const fireCapitalSavedUSD = Math.max(0, fireTargetHomeUSD - fireTargetAbroadUSD);
  const fireFundedPct = Math.min(100, Math.round((fireNetWorth / Math.max(1, fireTargetAbroadUSD)) * 100));

  const calcYears = (goal: number, start: number, annualAdd: number) => {
    if (start >= goal) return 0;
    let bal = start;
    let yrs = 0;
    while (bal < goal && yrs < 50) {
      bal = bal * 1.07 + annualAdd;
      yrs++;
    }
    return yrs;
  };

  const fireYearsAbroad = calcYears(fireTargetAbroadUSD, fireNetWorth, fireAnnualSavings);
  const fireYearsHome = calcYears(fireTargetHomeUSD, fireNetWorth, fireAnnualSavings);
  const fireYearsSaved = Math.max(0, fireYearsHome - fireYearsAbroad);

  const nomadNetMonthlyBurn = Math.max(0, nomadBurn - nomadIncome);
  const nomadRunwayMonths =
    nomadNetMonthlyBurn <= 0 ? 999 : Math.floor(nomadCash / nomadNetMonthlyBurn);

  const handleSaveAndroidFirePlan = () => {
    if (isGuestUser) {
      openAuthModal('signup');
      return;
    }
    updateUserProfile({
      monthlyBudgetUSD: fireAbroadBudget,
      finances: {
        ...finances,
        monthlyCurrentExpensesUSD: fireDomesticCost,
        monthlyRetirementExpensesUSD: fireAbroadBudget,
        monthlySipUSD: Math.round(fireAnnualSavings / 12),
        safeWithdrawalRatePercent: fireSwr,
        investments: {
          savingsUSD: schemeSavings,
          stocksMutualFundsUSD: schemeStocks,
          realEstateUSD: schemeRealEstate,
          goldUSD: schemeGold,
          othersUSD: schemeOthers,
        },
        updatedAt: new Date().toISOString().split('T')[0],
      },
    });
    setFireToast('FIRE Scorecard & Portfolio synced to your account!');
    setTimeout(() => setFireToast(null), 3500);
  };

  // ============================================================================
  // TAB 4: VISA CHECK STATE
  // ============================================================================
  const [visaOriginCode, setVisaOriginCode] = useState<string>('US');
  const [visaDestCode, setVisaDestCode] = useState<string>('PT');
  const [visaPassportTypeId, setVisaPassportTypeId] = useState<string>('ordinary');
  const [visaHeldVisas, setVisaHeldVisas] = useState<HeldVisaId[]>([]);
  const [visaSearchFilter, setVisaSearchFilter] = useState<string>('');
  const [visaStatusFilter, setVisaStatusFilter] = useState<'all' | 'visa-free' | 'evisa-voa' | 'required'>('all');

  const availablePassportTypes = useMemo(
    () => getPassportTypesForCountry(visaOriginCode),
    [visaOriginCode]
  );

  useEffect(() => {
    if (!availablePassportTypes.some(p => p.id === visaPassportTypeId)) {
      setVisaPassportTypeId(availablePassportTypes[0]?.id || 'ordinary');
    }
  }, [availablePassportTypes, visaPassportTypeId]);

  const directVisaResult = useMemo(
    () =>
      evaluateVisaRequirement({
        originCode: visaOriginCode,
        destinationCode: visaDestCode,
        passportTypeId: visaPassportTypeId,
        purpose: currentPersona === 'nomad' ? 'digital_nomad' : 'retirement',
        heldVisas: visaHeldVisas,
      }),
    [visaOriginCode, visaDestCode, visaPassportTypeId, currentPersona, visaHeldVisas]
  );

  const globalVisaMatrix = useMemo(
    () =>
      computeGlobalAccessMatrix(
        visaOriginCode,
        visaPassportTypeId,
        visaHeldVisas,
        currentPersona === 'nomad' ? 'digital_nomad' : 'retirement'
      ),
    [visaOriginCode, visaPassportTypeId, visaHeldVisas, currentPersona]
  );

  const visaSummaryCounts = useMemo(() => {
    let visaFree = 0;
    let eVisaVoa = 0;
    let required = 0;
    globalVisaMatrix.forEach(item => {
      if (
        item.status === 'freedom_of_movement' ||
        item.status === 'visa_free' ||
        item.status === 'visa_free_conditional' ||
        item.status === 'eta_required'
      ) {
        visaFree++;
      } else if (item.status === 'visa_on_arrival' || item.status === 'e_visa') {
        eVisaVoa++;
      } else {
        required++;
      }
    });
    return { visaFree, eVisaVoa, required };
  }, [globalVisaMatrix]);

  const filteredVisaDestinations = useMemo(() => {
    const q = visaSearchFilter.trim().toLowerCase();
    return globalVisaMatrix.filter(item => {
      if (q && !item.destination.name.toLowerCase().includes(q)) return false;
      if (visaStatusFilter === 'visa-free') {
        return (
          item.status === 'freedom_of_movement' ||
          item.status === 'visa_free' ||
          item.status === 'visa_free_conditional' ||
          item.status === 'eta_required'
        );
      }
      if (visaStatusFilter === 'evisa-voa') {
        return item.status === 'visa_on_arrival' || item.status === 'e_visa';
      }
      if (visaStatusFilter === 'required') {
        return item.status === 'visa_required';
      }
      return true;
    });
  }, [globalVisaMatrix, visaSearchFilter, visaStatusFilter]);

  const toggleHeldVisa = (id: HeldVisaId) => {
    setVisaHeldVisas(prev =>
      prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]
    );
  };

  // ============================================================================
  // TAB 5: DASHBOARD DATA (SAVED PORTFOLIO, BADGES & FREEDOM CARD)
  // ============================================================================
  const activeAccount = useMemo(
    () => registeredAccounts.find(a => a.id === currentUserId) || null,
    [registeredAccounts, currentUserId]
  );

  const earnedBadges = useMemo(
    () =>
      isAuthenticated
        ? getUserEarnedBadges(userProfile, activeAccount, earlyPioneerThreshold, registeredAccounts)
        : [],
    [isAuthenticated, userProfile, activeAccount, earlyPioneerThreshold, registeredAccounts]
  );

  const badgesProgress = useMemo(
    () =>
      isAuthenticated
        ? getAllBadgesProgress(userProfile, activeAccount, earlyPioneerThreshold, registeredAccounts)
        : [],
    [isAuthenticated, userProfile, activeAccount, earlyPioneerThreshold, registeredAccounts]
  );

  const savedCountriesList = useMemo(
    () => countries.filter(c => savedCountryIds.includes(c.id)),
    [countries, savedCountryIds]
  );

  const unifiedMetrics = useMemo(
    () => calculateUnifiedFireMetrics(userProfile, countries),
    [userProfile, countries]
  );

  const getVisaBadgeStyle = (status: VisaRequirementStatus) => {
    switch (status) {
      case 'freedom_of_movement':
      case 'visa_free':
        return { bg: 'bg-emerald-100 text-emerald-900 border-emerald-300', label: 'Visa-Free' };
      case 'visa_free_conditional':
        return { bg: 'bg-teal-100 text-teal-900 border-teal-300', label: 'Visa-Free (3P Visa)' };
      case 'eta_required':
        return { bg: 'bg-sky-100 text-sky-900 border-sky-300', label: 'eTA / ESTA' };
      case 'visa_on_arrival':
        return { bg: 'bg-amber-100 text-amber-950 border-amber-300', label: 'Visa on Arrival' };
      case 'e_visa':
        return { bg: 'bg-indigo-100 text-indigo-900 border-indigo-300', label: 'Online e-Visa' };
      default:
        return { bg: 'bg-rose-100 text-rose-900 border-rose-300', label: 'Visa Required' };
    }
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-50 text-slate-900 flex flex-col select-none pb-20">
      {/* ===================================================================== */}
      {/* 1. COMPACT NATIVE ANDROID TOP APP BAR (56px sticky header)            */}
      {/* ===================================================================== */}
      <header className="sticky top-0 z-30 h-14 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-3.5 flex items-center justify-between shadow-2xs">
        <button
          type="button"
          onClick={() => handleSelectTab('matcher')}
          className="flex items-center gap-2 min-h-[44px] focus:outline-none cursor-pointer"
          aria-label="ReFIREly Home"
        >
          <BrandLogo variant="full" size="sm" />
          <span className="px-1.5 py-0.5 rounded-md bg-gradient-to-r from-indigo-600 to-teal-600 text-white text-[9px] font-black uppercase tracking-wider">
            App
          </span>
        </button>

        <div className="flex items-center gap-1.5">
          {!isNativeCapacitor && (
            <button
              type="button"
              onClick={exitAndroidAppPreview}
              title="Exit Android Preview & Return to Desktop/Mobile Web View"
              className="min-h-[34px] px-2.5 py-1 rounded-full bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-[10px] font-black text-indigo-800 flex items-center gap-1 cursor-pointer active:scale-95 transition-transform"
            >
              <span>Web View</span>
              <X className="w-3 h-3 text-indigo-600" />
            </button>
          )}
          {/* Quick Persona Pill Toggle */}
          <button
            type="button"
            onClick={() => setCurrentPersona(currentPersona === 'retiree' ? 'nomad' : 'retiree')}
            className="min-h-[36px] px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200/90 text-[11px] font-extrabold text-slate-800 flex items-center gap-1 cursor-pointer active:scale-95 transition-transform"
          >
            <span>{currentPersona === 'nomad' ? '⚡ Nomad' : '🌿 Retiree'}</span>
          </button>

          {/* Notification / Direct Messages Icon */}
          <button
            type="button"
            onClick={() => setIsProfileSheetOpen(true)}
            className="relative min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center text-slate-700 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
            aria-label="Notifications and Profile"
          >
            <Bell className="w-5 h-5" />
            {totalUnreadDms > 0 && (
              <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-black flex items-center justify-center">
                {totalUnreadDms}
              </span>
            )}
          </button>

          {/* Profile Avatar / Login Trigger */}
          <button
            type="button"
            onClick={() => setIsProfileSheetOpen(true)}
            className="min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
            aria-label="Account Menu"
          >
            {!isGuestUser && userProfile.avatarUrl ? (
              <img
                src={userProfile.avatarUrl}
                alt={userProfile.name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/40"
              />
            ) : (
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white shadow-2xs ${
                  isGuestUser
                    ? 'bg-slate-700'
                    : 'bg-gradient-to-br from-indigo-600 via-violet-600 to-teal-600'
                }`}
              >
                {isGuestUser ? <User className="w-4 h-4" /> : (userProfile.name || 'M').charAt(0).toUpperCase()}
              </div>
            )}
          </button>
        </div>
      </header>

      {/* ===================================================================== */}
      {/* 2. MAIN NATIVE ANDROID SINGLE-COLUMN TAB VIEWPORT                     */}
      {/* ===================================================================== */}
      <main className="flex-1 w-full max-w-lg mx-auto px-3.5 pt-3.5 pb-6 space-y-4 overflow-x-hidden">
        {/* ------------------------------------------------------------------- */}
        {/* TAB 1: "MATCHER" (UNIFIED QUICK MATCHER)                            */}
        {/* ------------------------------------------------------------------- */}
        {activeTab === 'matcher' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Hero Touch Card */}
            <div className="p-4 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-teal-950 text-white shadow-md space-y-3.5">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 border border-white/15 text-[10px] font-extrabold uppercase tracking-wider text-teal-200">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>Unified Quick Matcher · {countries.length} Havens</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsFreedomCardSheetOpen(true)}
                  className="px-2.5 py-1 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-200 text-[10px] font-extrabold cursor-pointer"
                >
                  🏅 Freedom Card
                </button>
              </div>

              <div>
                <h1 className="text-xl font-black tracking-tight leading-snug">
                  Find Your Ideal{' '}
                  <span className="bg-gradient-to-r from-amber-300 via-teal-200 to-emerald-300 bg-clip-text text-transparent">
                    {currentPersona === 'nomad' ? 'Digital Nomad Hub' : 'Early Retirement Haven'}
                  </span>
                </h1>
                <p className="text-xs text-slate-300 mt-0.5">
                  Slide your monthly budget and tap a priority pill to rank all {countries.length} countries in real time.
                </p>
              </div>

              {/* Dual-Persona Switcher */}
              <div className="grid grid-cols-2 p-1 rounded-2xl bg-white/10 border border-white/15 text-xs font-extrabold">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentPersona('retiree');
                    setMatcherBudget(2600);
                  }}
                  className={`min-h-[42px] rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    currentPersona === 'retiree'
                      ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-xs'
                      : 'text-slate-200'
                  }`}
                >
                  <span>🌿 Early Retiree</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentPersona('nomad');
                    setMatcherBudget(1900);
                  }}
                  className={`min-h-[42px] rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    currentPersona === 'nomad'
                      ? 'bg-gradient-to-r from-teal-400 to-emerald-500 text-slate-950 shadow-xs'
                      : 'text-slate-200'
                  }`}
                >
                  <span>⚡ Digital Nomad</span>
                </button>
              </div>

              {/* Thumb-Friendly Range Slider: Monthly Budget / Burn */}
              <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200">
                    {currentPersona === 'nomad' ? 'Target Monthly Nomad Burn' : 'Target Couple Budget'}
                  </span>
                  <span className="font-mono font-black text-sm px-2.5 py-0.5 rounded-lg bg-amber-400 text-slate-950">
                    ${matcherBudget.toLocaleString()}/mo
                  </span>
                </div>
                <input
                  type="range"
                  min={800}
                  max={6000}
                  step={100}
                  value={matcherBudget}
                  onChange={e => setMatcherBudget(Number(e.target.value))}
                  className="w-full h-2.5 bg-white/25 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-300">
                  <span>$800/mo</span>
                  <span>$2,500/mo</span>
                  <span>$6,000/mo</span>
                </div>
              </div>
            </div>

            {/* Horizontal Priority Pill Carousel (Zero Page Overflow) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between px-0.5">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  Priority Match Lens
                </span>
                <span className="text-[11px] font-bold text-indigo-700">
                  Swipe pills →
                </span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
                {[
                  { id: 'balanced', label: '✨ Best Overall' },
                  { id: 'cost', label: '💰 Lowest Cost' },
                  { id: 'healthcare', label: '🏥 Top Healthcare' },
                  { id: 'safety', label: '🛡️ Highest Safety' },
                  { id: 'visa', label: '🛂 Easiest Visa' },
                  { id: 'fiber', label: '⚡ Fastest Fiber' },
                ].map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setMatcherPriority(p.id as PriorityDimension)}
                    className={`min-h-[40px] px-3.5 py-2 rounded-2xl text-xs font-extrabold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                      matcherPriority === p.id
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-200/90'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Instant Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={matcherSearch}
                onChange={e => setMatcherSearch(e.target.value)}
                placeholder="Search country, city, or region..."
                className="w-full min-h-[46px] pl-10 pr-9 py-2.5 rounded-2xl bg-white border border-slate-200/90 text-xs font-semibold text-slate-900 placeholder:text-slate-400 shadow-2xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {matcherSearch && (
                <button
                  type="button"
                  onClick={() => setMatcherSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Single-Column Touch Country Cards */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-0.5">
                <span className="text-xs font-extrabold text-slate-900">
                  Top Curated Haven Matches ({matcherResults.length})
                </span>
                <button
                  type="button"
                  onClick={() => handleSelectTab('explore')}
                  className="text-xs font-extrabold text-indigo-700 flex items-center gap-0.5 cursor-pointer"
                >
                  <span>Explore All {countries.length}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {matcherResults.map(({ country, nomadProfile, monthlyCost, matchPercent }) => {
                const saved = isCountrySaved(country.id);
                return (
                  <motion.div
                    key={country.id}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => openCountryDossierSheet(country)}
                    className="rounded-3xl bg-white border border-slate-200/90 overflow-hidden shadow-xs active:shadow-md transition-all cursor-pointer"
                  >
                    <CountryThumbnail country={country} className="h-40" hideLandmarkLabel>
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                        <span className="px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-white text-[11px] font-black border border-white/15">
                          {matchPercent}% Match
                        </span>
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            toggleSaveCountry(country.id);
                          }}
                          className={`min-w-[40px] min-h-[40px] rounded-full flex items-center justify-center backdrop-blur-md border transition-all cursor-pointer ${
                            saved
                              ? 'bg-rose-600 text-white border-rose-400'
                              : 'bg-slate-950/60 text-white border-white/25'
                          }`}
                          aria-label={`Save ${country.name}`}
                        >
                          <Heart className={`w-4 h-4 ${saved ? 'fill-white' : ''}`} />
                        </button>
                      </div>

                      <div className="absolute bottom-3 left-3.5 right-3.5 flex items-end justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <CountryFlag
                            countryCode={country.code}
                            countryName={country.name}
                            fallbackEmoji={country.flag}
                            className="w-7 h-5 rounded-xs shadow-xs shrink-0 ring-1 ring-white/40"
                          />
                          <div className="min-w-0">
                            <h2 className="text-base font-black text-white truncate drop-shadow-xs">
                              {country.name}
                            </h2>
                            <span className="text-[11px] font-semibold text-slate-200 block truncate">
                              {getCountryContinentLabel(country)} · {country.climate.category}
                            </span>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-xl bg-amber-400 text-slate-950 font-mono font-black text-xs shrink-0 shadow-xs">
                          ${monthlyCost.toLocaleString()}/mo
                        </span>
                      </div>
                    </CountryThumbnail>

                    <div className="p-3.5 space-y-3">
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {country.tagline}
                      </p>

                      <div className="grid grid-cols-3 gap-2 text-[11px]">
                        <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/70">
                          <span className="text-[10px] text-slate-500 font-bold block">
                            {currentPersona === 'nomad' ? 'Fiber Speed' : 'Healthcare'}
                          </span>
                          <span className="font-mono font-extrabold text-slate-900">
                            {currentPersona === 'nomad'
                              ? `${nomadProfile.verifiedInternetMbps} Mbps`
                              : `${country.lifestyle.healthcareScore}/100`}
                          </span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/70">
                          <span className="text-[10px] text-slate-500 font-bold block">Safety</span>
                          <span className="font-mono font-extrabold text-emerald-800">
                            {country.lifestyle.safetyScore}/100
                          </span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/70">
                          <span className="text-[10px] text-slate-500 font-bold block">
                            {currentPersona === 'nomad' ? 'DNV Visa' : 'Retire Visa'}
                          </span>
                          <span className="font-extrabold text-indigo-900 truncate block">
                            {currentPersona === 'nomad'
                              ? nomadProfile.remoteWorkVisaName
                              : country.visa.retirementVisaName}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* TAB 2: "EXPLORE" (SWIPEABLE / SINGLE-COLUMN 209-COUNTRY CARDS)      */}
        {/* ------------------------------------------------------------------- */}
        {activeTab === 'explore' && (
          <div className="space-y-3.5 animate-in fade-in duration-150">
            {/* Sticky Search + Filter Bottom-Sheet Launcher */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={`Search all ${countries.length} countries...`}
                  className="w-full min-h-[46px] pl-10 pr-8 py-2.5 rounded-2xl bg-white border border-slate-200/90 text-xs font-semibold text-slate-900 placeholder:text-slate-400 shadow-2xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setIsFilterSheetOpen(true)}
                className="min-h-[46px] px-3.5 rounded-2xl bg-slate-900 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0 active:scale-95 transition-transform"
              >
                <SlidersHorizontal className="w-4 h-4 text-amber-300" />
                <span>Filters</span>
              </button>
            </div>

            {/* Horizontal Region Pill Carousel */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
              {CONTINENT_FILTER_OPTIONS.map(reg => (
                <button
                  key={reg.value}
                  type="button"
                  onClick={() => setSelectedRegion(reg.value)}
                  className={`min-h-[38px] px-3.5 py-1.5 rounded-2xl text-xs font-extrabold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                    selectedRegion === reg.value
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-white text-slate-700 border border-slate-200/90'
                  }`}
                >
                  {reg.label}
                </button>
              ))}
            </div>

            {/* Active Result Count & Reset Bar */}
            <div className="flex items-center justify-between px-0.5 text-xs">
              <span className="font-extrabold text-slate-700">
                Showing <strong className="text-slate-950">{filteredCountries.length}</strong> of {countries.length} Havens
              </span>
              {(selectedRegion !== 'All' || selectedClimate !== 'All' || searchQuery || budgetMax < 10000) && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-rose-600 font-extrabold underline cursor-pointer"
                >
                  Reset Filters
                </button>
              )}
            </div>

            {/* Single-Column Touch Country Cards */}
            <div className="space-y-3">
              {filteredCountries.map(country => {
                const np = getCountryNomadProfile(country);
                const saved = isCountrySaved(country.id);
                const compared = isCountryCompared(country.id);
                return (
                  <motion.div
                    key={country.id}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => openCountryDossierSheet(country)}
                    className="rounded-3xl bg-white border border-slate-200/90 overflow-hidden shadow-xs cursor-pointer"
                  >
                    <CountryThumbnail country={country} className="h-40" hideLandmarkLabel>
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                        <span className="px-2.5 py-1 rounded-full bg-slate-950/75 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider border border-white/15">
                          {getCountryContinentLabel(country)}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              toggleCompareCountry(country.id);
                            }}
                            className={`min-h-[36px] px-2.5 rounded-full text-[10px] font-extrabold backdrop-blur-md border flex items-center gap-1 cursor-pointer ${
                              compared
                                ? 'bg-indigo-600 text-white border-indigo-400'
                                : 'bg-slate-950/60 text-white border-white/25'
                            }`}
                          >
                            <Scale className="w-3 h-3" />
                            <span>{compared ? 'Comparing' : 'Compare'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              toggleSaveCountry(country.id);
                            }}
                            className={`min-w-[38px] min-h-[38px] rounded-full flex items-center justify-center backdrop-blur-md border cursor-pointer ${
                              saved
                                ? 'bg-rose-600 text-white border-rose-400'
                                : 'bg-slate-950/60 text-white border-white/25'
                            }`}
                            aria-label={`Save ${country.name}`}
                          >
                            <Heart className={`w-4 h-4 ${saved ? 'fill-white' : ''}`} />
                          </button>
                        </div>
                      </div>

                      <div className="absolute bottom-3 left-3.5 right-3.5 flex items-end justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <CountryFlag
                            countryCode={country.code}
                            countryName={country.name}
                            fallbackEmoji={country.flag}
                            className="w-7 h-5 rounded-xs shadow-xs shrink-0 ring-1 ring-white/40"
                          />
                          <div className="min-w-0">
                            <h3 className="text-base font-black text-white truncate drop-shadow-xs">
                              {country.name}
                            </h3>
                            <span className="text-[11px] font-medium text-slate-200 block truncate">
                              {country.capital} · {country.climate.category}
                            </span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="px-2.5 py-1 rounded-xl bg-emerald-400 text-slate-950 font-mono font-black text-xs block">
                            ${currentPersona === 'nomad'
                              ? np.monthlyNomadBurnUSD.toLocaleString()
                              : country.costOfLiving.monthlyBudgetCoupleUSD.toLocaleString()}
                            /mo
                          </span>
                        </div>
                      </div>
                    </CountryThumbnail>

                    <div className="p-3.5 space-y-2.5">
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="p-2 rounded-xl bg-emerald-50/70 border border-emerald-200/70">
                          <span className="text-[10px] font-bold text-emerald-800 block">
                            Single / Couple
                          </span>
                          <span className="font-mono font-extrabold text-emerald-950 text-[11px]">
                            ${country.costOfLiving.monthlyBudgetSingleUSD.toLocaleString()} / $
                            {country.costOfLiving.monthlyBudgetCoupleUSD.toLocaleString()}
                          </span>
                        </div>
                        <div className="p-2 rounded-xl bg-teal-50/70 border border-teal-200/70">
                          <span className="text-[10px] font-bold text-teal-800 block">
                            Nomad / Fiber
                          </span>
                          <span className="font-mono font-extrabold text-teal-950 text-[11px]">
                            ${np.monthlyNomadBurnUSD.toLocaleString()} · {np.verifiedInternetMbps}M
                          </span>
                        </div>
                        <div className="p-2 rounded-xl bg-indigo-50/70 border border-indigo-200/70">
                          <span className="text-[10px] font-bold text-indigo-800 block">
                            Health / Safety
                          </span>
                          <span className="font-mono font-extrabold text-indigo-950 text-[11px]">
                            {country.lifestyle.healthcareScore} / {country.lifestyle.safetyScore}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 text-xs">
                        <span className="text-[11px] font-semibold text-slate-600 truncate">
                          Visa: <strong className="text-slate-900">{country.visa.retirementVisaName}</strong>
                        </span>
                        <span className="text-indigo-700 font-extrabold inline-flex items-center gap-0.5 shrink-0">
                          <span>Tap for Dossier</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* TAB 3: "FIRE" (FIRE CALCULATOR & PROGRESS TRACKER)                  */}
        {/* ------------------------------------------------------------------- */}
        {activeTab === 'fire' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Top Mode Toggle & Summary Banner */}
            <div className="p-4 rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-600 text-white shadow-md space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/20 text-[10px] font-extrabold uppercase tracking-wider">
                  <Flame className="w-3.5 h-3.5 text-amber-200" />
                  <span>Geo-Arbitrage FIRE &amp; Runway Engine</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsFreedomCardSheetOpen(true)}
                  className="px-2.5 py-1 rounded-full bg-white text-slate-950 text-[10px] font-black shadow-2xs cursor-pointer"
                >
                  🏅 Share Card
                </button>
              </div>

              <div className="grid grid-cols-2 p-1 rounded-2xl bg-black/20 text-xs font-extrabold">
                <button
                  type="button"
                  onClick={() => setFireMode('fire')}
                  className={`min-h-[40px] rounded-xl transition-all cursor-pointer ${
                    fireMode === 'fire' ? 'bg-white text-slate-950 shadow-xs' : 'text-white/90'
                  }`}
                >
                  🔥 FIRE Nest Egg
                </button>
                <button
                  type="button"
                  onClick={() => setFireMode('nomad')}
                  className={`min-h-[40px] rounded-xl transition-all cursor-pointer ${
                    fireMode === 'nomad' ? 'bg-white text-slate-950 shadow-xs' : 'text-white/90'
                  }`}
                >
                  ⚡ Nomad Runway
                </button>
              </div>

              {fireMode === 'fire' ? (
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <div className="p-3 rounded-2xl bg-black/20 backdrop-blur-xs">
                    <span className="text-[10px] uppercase font-bold text-amber-100 block">
                      Nest Egg Abroad
                    </span>
                    <span className="text-xl font-black font-mono">
                      ${fireTargetAbroadUSD.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-amber-100 block mt-0.5">
                      {fireFundedPct}% Funded · {fireYearsAbroad === 0 ? 'Ready Now!' : `${fireYearsAbroad} Yrs`}
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-black/20 backdrop-blur-xs">
                    <span className="text-[10px] uppercase font-bold text-amber-100 block">
                      Capital Slashed
                    </span>
                    <span className="text-xl font-black font-mono">
                      ${fireCapitalSavedUSD.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-amber-100 block mt-0.5">
                      Retire {fireYearsSaved} {fireYearsSaved === 1 ? 'yr' : 'yrs'} sooner!
                    </span>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <div className="p-3 rounded-2xl bg-black/20 backdrop-blur-xs">
                    <span className="text-[10px] uppercase font-bold text-amber-100 block">
                      Calendar Runway
                    </span>
                    <span className="text-xl font-black font-mono">
                      {nomadNetMonthlyBurn === 0 ? '∞ Infinite' : `${nomadRunwayMonths} Mos`}
                    </span>
                    <span className="text-[10px] text-amber-100 block mt-0.5">
                      Net Burn: ${nomadNetMonthlyBurn.toLocaleString()}/mo
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-black/20 backdrop-blur-xs">
                    <span className="text-[10px] uppercase font-bold text-amber-100 block">
                      6-Mo Target Buffer
                    </span>
                    <span className="text-xl font-black font-mono">
                      ${(nomadNetMonthlyBurn * 6).toLocaleString()}
                    </span>
                    <span className="text-[10px] text-amber-100 block mt-0.5">
                      {nomadCash >= nomadNetMonthlyBurn * 6 ? '✅ Fully Funded' : 'Building Buffer'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {fireToast && (
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-300 text-xs font-bold text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{fireToast}</span>
              </div>
            )}

            {fireMode === 'fire' ? (
              <div className="space-y-3.5">
                {/* Thumb-Friendly Range Sliders Card */}
                <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-extrabold text-slate-800">Current Invested Assets</span>
                      <span className="font-mono font-black text-indigo-900 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-200">
                        ${fireNetWorth.toLocaleString()}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={20000}
                      max={1500000}
                      step={10000}
                      value={Math.min(1500000, fireNetWorth)}
                      onChange={e => setFireNetWorth(Number(e.target.value))}
                      className="w-full h-2.5 bg-indigo-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-extrabold text-slate-800">Target Monthly Budget Abroad</span>
                      <span className="font-mono font-black text-amber-950 bg-amber-100 px-2.5 py-0.5 rounded-lg border border-amber-300">
                        ${fireAbroadBudget.toLocaleString()}/mo
                      </span>
                    </div>
                    <input
                      type="range"
                      min={600}
                      max={5000}
                      step={100}
                      value={fireAbroadBudget}
                      onChange={e => setFireAbroadBudget(Number(e.target.value))}
                      className="w-full h-2.5 bg-amber-100 rounded-lg appearance-none cursor-pointer accent-orange-600"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-extrabold text-slate-800">Current Domestic Cost (At Home)</span>
                      <span className="font-mono font-black text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-300">
                        ${fireDomesticCost.toLocaleString()}/mo
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1000}
                      max={8000}
                      step={100}
                      value={fireDomesticCost}
                      onChange={e => setFireDomesticCost(Number(e.target.value))}
                      className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-800"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="font-bold text-slate-700">Annual Savings</span>
                        <span className="font-mono font-black text-emerald-800">
                          ${(fireAnnualSavings / 1000).toFixed(0)}k/yr
                        </span>
                      </div>
                      <input
                        type="range"
                        min={2000}
                        max={100000}
                        step={2000}
                        value={fireAnnualSavings}
                        onChange={e => setFireAnnualSavings(Number(e.target.value))}
                        className="w-full h-2 bg-emerald-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="font-bold text-slate-700">SWR Rule</span>
                        <span className="font-mono font-black text-teal-800">
                          {fireSwr.toFixed(1)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min={3.0}
                        max={5.0}
                        step={0.1}
                        value={fireSwr}
                        onChange={e => setFireSwr(Number(e.target.value))}
                        className="w-full h-2 bg-teal-100 rounded-lg appearance-none cursor-pointer accent-teal-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Personal 5-Scheme Financial Portfolio (Locked for Guest, Editable for Logged-In) */}
                <div className="p-4 rounded-3xl bg-white border border-indigo-200/90 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {isGuestUser ? (
                        <Lock className="w-4 h-4 text-indigo-700" />
                      ) : (
                        <Unlock className="w-4 h-4 text-emerald-600" />
                      )}
                      <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                        5-Scheme Personal Asset Portfolio
                      </h2>
                    </div>
                    {isGuestUser ? (
                      <button
                        type="button"
                        onClick={() => openAuthModal('signup')}
                        className="px-2.5 py-1 rounded-xl bg-indigo-600 text-white text-[11px] font-extrabold cursor-pointer"
                      >
                        Unlock Free
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSaveAndroidFirePlan}
                        className="px-2.5 py-1 rounded-xl bg-emerald-600 text-white text-[11px] font-extrabold flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Save</span>
                      </button>
                    )}
                  </div>

                  {isGuestUser ? (
                    <div className="space-y-2.5">
                      <div className="grid grid-cols-2 gap-2 opacity-60 pointer-events-none text-[11px]">
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                          <span className="text-slate-500 block">Cash &amp; Savings</span>
                          <span className="font-mono font-bold">🔒 $35,000</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                          <span className="text-slate-500 block">Stocks &amp; ETFs</span>
                          <span className="font-mono font-bold">🔒 $165,000</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                          <span className="text-slate-500 block">Real Estate &amp; Gold</span>
                          <span className="font-mono font-bold">🔒 $50,000</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                          <span className="text-slate-500 block">Loans &amp; Milestones</span>
                          <span className="font-mono font-bold">🔒 Custom Ledger</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => openAuthModal('signup')}
                        className="w-full min-h-[44px] rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-teal-600 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <UserPlus className="w-4 h-4 text-amber-300" />
                        <span>Sign Up Free to Customize &amp; Save FIRE Plan</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2.5 text-xs">
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { label: 'Cash/Savings ($)', val: schemeSavings, set: setSchemeSavings },
                          { label: 'Stocks/ETFs ($)', val: schemeStocks, set: setSchemeStocks },
                          { label: 'Real Estate ($)', val: schemeRealEstate, set: setSchemeRealEstate },
                          { label: 'Gold/Bullion ($)', val: schemeGold, set: setSchemeGold },
                          { label: 'Crypto/Other ($)', val: schemeOthers, set: setSchemeOthers },
                        ].map(item => (
                          <div key={item.label} className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                            <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                              {item.label}
                            </label>
                            <input
                              type="number"
                              value={item.val}
                              onChange={e => {
                                const v = Math.max(0, Number(e.target.value) || 0);
                                item.set(v);
                                const nextSum =
                                  (item.label.includes('Cash') ? v : schemeSavings) +
                                  (item.label.includes('Stocks') ? v : schemeStocks) +
                                  (item.label.includes('Real') ? v : schemeRealEstate) +
                                  (item.label.includes('Gold') ? v : schemeGold) +
                                  (item.label.includes('Crypto') ? v : schemeOthers);
                                setFireNetWorth(nextSum);
                              }}
                              className="w-full px-2 py-1 rounded-lg bg-white border border-slate-300 font-mono font-bold text-xs"
                            />
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={handleSaveAndroidFirePlan}
                        className="w-full min-h-[44px] rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Save &amp; Sync FIRE Plan to Cloud Account</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Nomad Runway Sliders */
              <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-extrabold text-slate-800">Liquid Cash Savings</span>
                    <span className="font-mono font-black text-teal-900 bg-teal-50 px-2.5 py-0.5 rounded-lg border border-teal-200">
                      ${nomadCash.toLocaleString()}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={10000}
                    max={1000000}
                    step={2000}
                    value={Math.min(1000000, Math.max(10000, nomadCash))}
                    onChange={e => setNomadCash(Number(e.target.value))}
                    className="w-full h-2.5 bg-teal-100 rounded-lg appearance-none cursor-pointer accent-teal-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-extrabold text-slate-800">Monthly Turnkey Burn</span>
                    <span className="font-mono font-black text-amber-950 bg-amber-100 px-2.5 py-0.5 rounded-lg border border-amber-300">
                      ${nomadBurn.toLocaleString()}/mo
                    </span>
                  </div>
                  <input
                    type="range"
                    min={700}
                    max={4500}
                    step={50}
                    value={nomadBurn}
                    onChange={e => setNomadBurn(Number(e.target.value))}
                    className="w-full h-2.5 bg-amber-100 rounded-lg appearance-none cursor-pointer accent-orange-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-extrabold text-slate-800">Remote Client Income</span>
                    <span className="font-mono font-black text-indigo-900 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-200">
                      +${nomadIncome.toLocaleString()}/mo
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={6000}
                    step={100}
                    value={nomadIncome}
                    onChange={e => setNomadIncome(Number(e.target.value))}
                    className="w-full h-2.5 bg-indigo-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* TAB 4: "VISA CHECK" (BILATERAL PASSPORT & 209-HAVEN CHECKER)        */}
        {/* ------------------------------------------------------------------- */}
        {activeTab === 'visa-check' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-900 text-[10px] font-extrabold uppercase tracking-wider">
                  <Stamp className="w-3.5 h-3.5 text-teal-600" />
                  <span>Global Visa &amp; Passport Checker</span>
                </span>
                <span className="text-[11px] font-bold text-slate-500">
                  {globalVisaMatrix.length} Destinations
                </span>
              </div>

              {/* Origin Passport & Destination Haven Selectors */}
              <div className="grid grid-cols-1 gap-2.5">
                <div>
                  <label className="text-[11px] font-extrabold text-slate-600 uppercase block mb-1">
                    Your Origin Passport
                  </label>
                  <select
                    value={visaOriginCode}
                    onChange={e => setVisaOriginCode(e.target.value)}
                    className="w-full min-h-[44px] px-3 py-2 rounded-2xl bg-slate-50 border border-slate-300 text-xs font-extrabold text-slate-900"
                  >
                    {VISA_WORLD_COUNTRIES.map(c => (
                      <option key={`orig-${c.code}`} value={c.code}>
                        {c.flag} {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-extrabold text-slate-600 uppercase block mb-1">
                    Destination Haven to Check
                  </label>
                  <select
                    value={visaDestCode}
                    onChange={e => setVisaDestCode(e.target.value)}
                    className="w-full min-h-[44px] px-3 py-2 rounded-2xl bg-slate-50 border border-slate-300 text-xs font-extrabold text-slate-900"
                  >
                    {VISA_WORLD_COUNTRIES.map(c => (
                      <option key={`dest-${c.code}`} value={c.code}>
                        {c.flag} {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Passport Booklet Class Carousel */}
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase block">
                  Passport Booklet Class
                </span>
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                  {availablePassportTypes.map(pt => (
                    <button
                      key={pt.id}
                      type="button"
                      onClick={() => setVisaPassportTypeId(pt.id)}
                      className={`min-h-[36px] px-3 py-1 rounded-xl text-[11px] font-extrabold whitespace-nowrap shrink-0 cursor-pointer ${
                        visaPassportTypeId === pt.id
                          ? 'bg-slate-900 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {pt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Held Third-Country Visa Unlocks Carousel */}
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase block">
                  Held Visas (Tap to Unlock Extra Visa-Free Havens)
                </span>
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                  {HELD_VISA_OPTIONS.map(hv => {
                    const active = visaHeldVisas.includes(hv.id);
                    return (
                      <button
                        key={hv.id}
                        type="button"
                        onClick={() => toggleHeldVisa(hv.id)}
                        className={`min-h-[36px] px-3 py-1 rounded-xl text-[11px] font-extrabold whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1 ${
                          active
                            ? 'bg-indigo-600 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {active && <Check className="w-3 h-3" />}
                        <span>{hv.shortLabel}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Instant Corridor Verdict Card */}
            <div className="p-4 rounded-3xl bg-gradient-to-br from-teal-900 via-slate-900 to-indigo-950 text-white shadow-md space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-extrabold text-teal-200">
                  {directVisaResult.origin.flag} {directVisaResult.origin.name} →{' '}
                  {directVisaResult.destination.flag} {directVisaResult.destination.name}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                    getVisaBadgeStyle(directVisaResult.status).bg
                  }`}
                >
                  {getVisaBadgeStyle(directVisaResult.status).label}
                </span>
              </div>
              <h2 className="text-base font-black leading-snug">{directVisaResult.headline}</h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                {directVisaResult.verdictSummary}
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                <div className="p-2.5 rounded-xl bg-white/10">
                  <span className="text-slate-300 text-[10px] block">Max Stay</span>
                  <span className="font-mono font-bold text-white">{directVisaResult.maxStay}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/10">
                  <span className="text-slate-300 text-[10px] block">Entry Method</span>
                  <span className="font-bold text-amber-300">{directVisaResult.entryMethod}</span>
                </div>
              </div>
              <div className="pt-1 flex items-center justify-between gap-2">
                <a
                  href={directVisaResult.officialPortal.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-extrabold text-teal-300 underline inline-flex items-center gap-1"
                >
                  <span>Official {directVisaResult.destination.name} Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                {directVisaResult.refirelyCountryId && (
                  <button
                    type="button"
                    onClick={() => {
                      const found = countries.find(c => c.id === directVisaResult.refirelyCountryId);
                      if (found) openCountryDossierSheet(found);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white text-slate-950 text-[11px] font-extrabold cursor-pointer"
                  >
                    Open Haven Dossier →
                  </button>
                )}
              </div>
            </div>

            {/* Global Mobility Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {[
                { id: 'all', label: `All (${globalVisaMatrix.length})` },
                { id: 'visa-free', label: `✅ Visa-Free / eTA (${visaSummaryCounts.visaFree})` },
                { id: 'evisa-voa', label: `⚡ e-Visa / VoA (${visaSummaryCounts.eVisaVoa})` },
                { id: 'required', label: `🏛️ Visa Required (${visaSummaryCounts.required})` },
              ].map(f => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setVisaStatusFilter(f.id as any)}
                  className={`min-h-[38px] px-3 py-1.5 rounded-2xl text-xs font-extrabold whitespace-nowrap shrink-0 cursor-pointer ${
                    visaStatusFilter === f.id
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-white text-slate-700 border border-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Destination Search inside Visa Matrix */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={visaSearchFilter}
                onChange={e => setVisaSearchFilter(e.target.value)}
                placeholder="Filter destinations by country name..."
                className="w-full min-h-[44px] pl-10 pr-8 py-2 rounded-2xl bg-white border border-slate-200 text-xs font-semibold"
              />
            </div>

            {/* Single-Column Destination Visa List */}
            <div className="space-y-2">
              {filteredVisaDestinations.slice(0, 60).map(item => {
                const badge = getVisaBadgeStyle(item.status);
                const matchingHaven = countries.find(
                  c =>
                    c.id === item.destination.refirelyCountryId ||
                    c.code.toUpperCase() === item.destination.code.toUpperCase()
                );
                return (
                  <div
                    key={item.destination.code}
                    onClick={() => {
                      setVisaDestCode(item.destination.code);
                      if (matchingHaven) openCountryDossierSheet(matchingHaven);
                    }}
                    className="p-3.5 rounded-2xl bg-white border border-slate-200/90 flex items-center justify-between gap-2.5 shadow-2xs cursor-pointer active:bg-slate-50"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-xl shrink-0">{item.destination.flag}</span>
                      <div className="min-w-0">
                        <h3 className="text-xs font-extrabold text-slate-900 truncate">
                          {item.destination.name}
                        </h3>
                        <span className="text-[11px] text-slate-500 block truncate">
                          {item.maxStay} · {item.shortNote}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold border shrink-0 ${badge.bg}`}
                    >
                      {badge.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* TAB 5: "DASHBOARD" (SAVED PORTFOLIO, BADGES & FREEDOM CARD)         */}
        {/* ------------------------------------------------------------------- */}
        {activeTab === 'dashboard' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Profile & Freedom Card Header */}
            <div className="p-4 rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-teal-950 text-white shadow-md space-y-3.5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {!isGuestUser && userProfile.avatarUrl ? (
                    <img
                      src={userProfile.avatarUrl}
                      alt={userProfile.name}
                      className="w-12 h-12 rounded-2xl object-cover ring-2 ring-amber-400/60 shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 font-black text-lg flex items-center justify-center shrink-0">
                      {isGuestUser ? 'G' : (userProfile.name || 'M').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h1 className="text-base font-black truncate">
                      {isGuestUser ? 'Guest Expat Explorer' : userProfile.name}
                    </h1>
                    <p className="text-[11px] text-slate-300 truncate">
                      {isGuestUser
                        ? 'Sign in to sync your FIRE portfolio & badges'
                        : `${userProfile.residingCountry || userProfile.originCountry} → Target: ${userProfile.targetCountry}`}
                    </p>
                  </div>
                </div>

                {isGuestUser ? (
                  <button
                    type="button"
                    onClick={() => openAuthModal('login')}
                    className="min-h-[40px] px-3.5 rounded-xl bg-amber-400 text-slate-950 text-xs font-black shrink-0 cursor-pointer"
                  >
                    Sign In
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => openEditProfile('about')}
                    className="min-h-[40px] px-3 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-bold shrink-0 cursor-pointer"
                  >
                    Edit
                  </button>
                )}
              </div>

              {/* Shareable FIRE Freedom Card Trigger */}
              <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300 block">
                    Personal Freedom Card
                  </span>
                  <span className="text-sm font-black text-white">
                    {unifiedMetrics.fireProgressPercent}% FI Ready · Target {unifiedMetrics.targetCountryName}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFreedomCardSheetOpen(true)}
                  className="min-h-[40px] px-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 text-xs font-black shrink-0 cursor-pointer flex items-center gap-1"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Open Card</span>
                </button>
              </div>
            </div>

            {/* Saved Havens Portfolio */}
            <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-rose-600 fill-rose-600" />
                  <span>Saved Havens Shortlist ({savedCountriesList.length})</span>
                </h2>
                <button
                  type="button"
                  onClick={() => handleSelectTab('explore')}
                  className="text-xs font-extrabold text-indigo-700 cursor-pointer"
                >
                  + Add More
                </button>
              </div>

              {savedCountriesList.length === 0 ? (
                <p className="text-xs text-slate-500 py-2">
                  Tap the heart icon on any country card to save it to your relocation shortlist.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {savedCountriesList.map(c => (
                    <div
                      key={c.id}
                      onClick={() => openCountryDossierSheet(c)}
                      className="p-3 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center justify-between gap-2.5 cursor-pointer active:bg-slate-100"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <CountryFlag
                          countryCode={c.code}
                          countryName={c.name}
                          fallbackEmoji={c.flag}
                          className="w-6 h-4 rounded-xs shrink-0"
                        />
                        <div className="min-w-0">
                          <h3 className="text-xs font-extrabold text-slate-900 truncate">{c.name}</h3>
                          <span className="text-[11px] text-slate-500 block truncate">
                            Couple: ${c.costOfLiving.monthlyBudgetCoupleUSD.toLocaleString()}/mo ·{' '}
                            {c.visa.retirementVisaName}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Expat Badges & Honors Carousel */}
            <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span>Earned Expat Badges ({earnedBadges.length})</span>
                </h2>
                <button
                  type="button"
                  onClick={() => openBadgeModal('all')}
                  className="text-xs font-extrabold text-amber-700 cursor-pointer"
                >
                  Badge Codex →
                </button>
              </div>

              {earnedBadges.length === 0 ? (
                <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-slate-700 space-y-2">
                  <p>
                    {isGuestUser
                      ? 'Create a free account to unlock verified Expat Badges (Globetrotter, Polyglot, FIRE Architect & Early Pioneer).'
                      : 'Log visited countries or languages to earn your first Expat Badge!'}
                  </p>
                  <button
                    type="button"
                    onClick={() => (isGuestUser ? openAuthModal('signup') : openEditProfile('travel'))}
                    className="px-3.5 py-2 rounded-xl bg-amber-500 text-slate-950 font-extrabold text-xs cursor-pointer"
                  >
                    {isGuestUser ? 'Sign Up Free' : 'Log Scouting Trips'}
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                  {earnedBadges.map(b => (
                    <div key={b.tierId} className="shrink-0">
                      <BadgePill badge={b} size="md" onClick={() => openBadgeModal(b.category)} />
                    </div>
                  ))}
                </div>
              )}

              {badgesProgress.length > 0 && (
                <div className="space-y-2 pt-1">
                  {badgesProgress
                    .filter(p => !p.badge.comingSoon && p.nextTier)
                    .slice(0, 3)
                    .map(p => (
                      <div
                        key={p.badge.id}
                        className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1"
                      >
                        <div className="flex justify-between text-[11px] font-bold">
                          <span className="text-slate-800">{p.nextTier?.name}</span>
                          <span className="font-mono text-indigo-700">
                            {p.currentValue}/{p.nextTier?.threshold}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-amber-500 to-teal-500 rounded-full"
                            style={{ width: `${Math.min(100, p.progressPercent)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Relocation Readiness Checklist */}
            <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                  Relocation Milestone Checklist
                </h2>
                <span className="text-xs font-mono font-bold text-emerald-700">
                  {checklist.filter(t => t.completed).length}/{checklist.length} Done
                </span>
              </div>
              <div className="space-y-2">
                {checklist.slice(0, 6).map(task => (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => toggleChecklistTask(task.id)}
                    className={`w-full p-3 rounded-2xl border text-left flex items-start gap-2.5 cursor-pointer transition-colors ${
                      task.completed
                        ? 'bg-emerald-50/50 border-emerald-200 text-slate-500 line-through'
                        : 'bg-slate-50 border-slate-200/90 text-slate-900'
                    }`}
                  >
                    <div
                      className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 ${
                        task.completed
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'bg-white border-slate-300'
                      }`}
                    >
                      {task.completed && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold block">{task.title}</span>
                      <span className="text-[11px] text-slate-500 block mt-0.5">
                        {task.category}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ===================================================================== */}
      {/* 3. FIXED 5-TAB NATIVE ANDROID BOTTOM NAVIGATION BAR                   */}
      {/* ===================================================================== */}
      <nav
        aria-label="Primary Android Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 h-16 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 grid grid-cols-5 items-center px-1 shadow-lg"
      >
        {[
          { id: 'matcher', label: 'Matcher', icon: Sparkles },
          { id: 'explore', label: 'Explore', icon: Compass },
          { id: 'fire', label: 'FIRE', icon: Flame },
          { id: 'visa-check', label: 'Visa Check', icon: Stamp },
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleSelectTab(tab.id as AndroidTabId)}
              className="min-h-[48px] min-w-[44px] flex flex-col items-center justify-center gap-0.5 cursor-pointer focus:outline-none active:scale-95 transition-transform"
            >
              <div
                className={`px-3.5 py-1 rounded-full transition-colors flex items-center justify-center ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-teal-600 text-white shadow-2xs'
                    : 'text-slate-500'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span
                className={`text-[10px] tracking-tight ${
                  isActive ? 'font-black text-indigo-950' : 'font-semibold text-slate-500'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* ===================================================================== */}
      {/* 4. NATIVE BOTTOM-SHEET MODAL 1: EXPLORE FILTERS                       */}
      {/* ===================================================================== */}
      <AnimatePresence>
        {isFilterSheetOpen && (
          <div className="fixed inset-0 z-50 flex flex-col justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterSheetOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative z-10 w-full max-w-lg mx-auto bg-white rounded-t-3xl border-t border-slate-200 shadow-2xl max-h-[85vh] flex flex-col overflow-hidden"
            >
              <div className="w-10 h-1.5 bg-slate-300 rounded-full mx-auto my-2.5 shrink-0" />
              <div className="px-5 pb-3 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-base font-black text-slate-900">
                  Filter &amp; Sort {countries.length} Havens
                </h2>
                <button
                  type="button"
                  onClick={() => setIsFilterSheetOpen(false)}
                  className="min-w-[40px] min-h-[40px] rounded-full bg-slate-100 flex items-center justify-center text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 overflow-y-auto space-y-5 text-xs">
                {/* Sort Order */}
                <div className="space-y-2">
                  <label className="font-extrabold text-slate-800 uppercase tracking-wider block">
                    Sort Havens By
                  </label>
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value as SortByType)}
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-2xl bg-slate-50 border border-slate-300 font-bold text-slate-900"
                  >
                    <option value="recommended">✨ Recommended Overall</option>
                    <option value="budget-asc">💰 Lowest Retiree Budget</option>
                    <option value="nomad-burn-asc">⚡ Lowest Nomad Monthly Burn</option>
                    <option value="internet-speed-desc">🚀 Fastest Fiber Internet (Mbps)</option>
                    <option value="healthcare-desc">🏥 Highest Healthcare Score</option>
                    <option value="safety-desc">🛡️ Highest Safety Score</option>
                    <option value="visa-difficulty-asc">🛂 Easiest Retirement Visa</option>
                    <option value="alpha-asc">🔤 Alphabetical (A–Z)</option>
                  </select>
                </div>

                {/* Max Monthly Budget Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-slate-800 uppercase tracking-wider">
                      Max Monthly Budget
                    </span>
                    <span className="font-mono font-black text-sm text-indigo-900">
                      ${budgetMax >= 10000 ? '10,000+ (Any)' : `${budgetMax.toLocaleString()}/mo`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1000}
                    max={10000}
                    step={250}
                    value={budgetMax}
                    onChange={e => setBudgetMax(Number(e.target.value))}
                    className="w-full h-2.5 bg-indigo-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>

                {/* Region Pills */}
                <div className="space-y-2">
                  <span className="font-extrabold text-slate-800 uppercase tracking-wider block">
                    Continent &amp; Region
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {CONTINENT_FILTER_OPTIONS.map(r => (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => setSelectedRegion(r.value)}
                        className={`min-h-[38px] px-3 py-1.5 rounded-xl font-bold cursor-pointer ${
                          selectedRegion === r.value
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Climate Pills */}
                <div className="space-y-2">
                  <span className="font-extrabold text-slate-800 uppercase tracking-wider block">
                    Preferred Climate
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {CLIMATE_PILLS.map(clim => (
                      <button
                        key={clim}
                        type="button"
                        onClick={() => setSelectedClimate(clim)}
                        className={`min-h-[38px] px-3 py-1.5 rounded-xl font-bold cursor-pointer ${
                          selectedClimate === clim
                            ? 'bg-teal-600 text-white'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {clim}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-slate-200 bg-slate-50 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    resetFilters();
                    setIsFilterSheetOpen(false);
                  }}
                  className="min-h-[46px] rounded-2xl bg-white border border-slate-300 text-slate-700 font-extrabold text-xs cursor-pointer"
                >
                  Reset All
                </button>
                <button
                  type="button"
                  onClick={() => setIsFilterSheetOpen(false)}
                  className="min-h-[46px] rounded-2xl bg-gradient-to-r from-indigo-600 to-teal-600 text-white font-black text-xs cursor-pointer shadow-md"
                >
                  Show {filteredCountries.length} Havens
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ===================================================================== */}
      {/* 5. NATIVE BOTTOM-SHEET MODAL 2: COUNTRY DOSSIER                       */}
      {/* ===================================================================== */}
      <AnimatePresence>
        {dossierCountry && (
          <div className="fixed inset-0 z-50 flex flex-col justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setDossierCountry(null);
                setShowFull11TabDossier(false);
              }}
              className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative z-10 w-full max-w-lg mx-auto bg-white rounded-t-3xl border-t border-slate-200 shadow-2xl h-[90vh] flex flex-col overflow-hidden"
            >
              <div className="w-10 h-1.5 bg-slate-300 rounded-full mx-auto my-2 shrink-0" />

              {/* Sheet Top Controls */}
              <div className="px-4 pb-2.5 border-b border-slate-100 flex items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  {showFull11TabDossier && (
                    <button
                      type="button"
                      onClick={() => setShowFull11TabDossier(false)}
                      className="min-w-[36px] min-h-[36px] rounded-full bg-slate-100 flex items-center justify-center text-slate-700 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  )}
                  <CountryFlag
                    countryCode={dossierCountry.code}
                    countryName={dossierCountry.name}
                    fallbackEmoji={dossierCountry.flag}
                    className="w-6 h-4 rounded-xs shrink-0"
                  />
                  <h2 className="text-base font-black text-slate-900 truncate">
                    {dossierCountry.name} Dossier
                  </h2>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => toggleSaveCountry(dossierCountry.id)}
                    className={`min-w-[38px] min-h-[38px] rounded-full flex items-center justify-center border cursor-pointer ${
                      isCountrySaved(dossierCountry.id)
                        ? 'bg-rose-600 text-white border-rose-500'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <Heart
                      className={`w-4 h-4 ${isCountrySaved(dossierCountry.id) ? 'fill-white' : ''}`}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDossierCountry(null);
                      setShowFull11TabDossier(false);
                    }}
                    className="min-w-[38px] min-h-[38px] rounded-full bg-slate-100 flex items-center justify-center text-slate-600 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Scrollable Sheet Content */}
              <div className="flex-1 overflow-y-auto">
                {showFull11TabDossier ? (
                  <div className="pb-12">
                    <CountryDossier country={dossierCountry} />
                  </div>
                ) : (
                  (() => {
                    const np = getCountryNomadProfile(dossierCountry);
                    const food = getCountryGastronomyProfile(dossierCountry);
                    const nestEggCouple = dossierCountry.costOfLiving.monthlyBudgetCoupleUSD * 12 * 25;
                    return (
                      <div className="p-4 space-y-4 text-xs pb-10">
                        <div className="rounded-2xl overflow-hidden relative h-44">
                          <CountryThumbnail country={dossierCountry} className="h-44" />
                        </div>

                        <p className="text-xs text-slate-700 leading-relaxed font-medium">
                          {dossierCountry.overview || dossierCountry.tagline}
                        </p>

                        {/* Core Financial & Nomad Metrics */}
                        <div className="grid grid-cols-2 gap-2.5">
                          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
                            <span className="text-[10px] font-bold uppercase text-emerald-800 block">
                              Retiree Couple / Solo
                            </span>
                            <span className="text-base font-black font-mono text-emerald-950">
                              ${dossierCountry.costOfLiving.monthlyBudgetCoupleUSD.toLocaleString()}{' '}
                              <span className="text-xs font-normal">
                                (${dossierCountry.costOfLiving.monthlyBudgetSingleUSD.toLocaleString()} solo)
                              </span>
                            </span>
                            <span className="text-[10px] text-emerald-700 block mt-0.5">
                              4% FIRE Nest Egg: ${(nestEggCouple / 1000).toFixed(0)}k
                            </span>
                          </div>

                          <div className="p-3 rounded-2xl bg-teal-50 border border-teal-200">
                            <span className="text-[10px] font-bold uppercase text-teal-800 block">
                              Nomad Turnkey Burn
                            </span>
                            <span className="text-base font-black font-mono text-teal-950">
                              ${np.monthlyNomadBurnUSD.toLocaleString()}/mo
                            </span>
                            <span className="text-[10px] text-teal-700 block mt-0.5">
                              Fiber: {np.verifiedInternetMbps} Mbps · 6-Mo: $
                              {(np.sixMonthRunwayUSD / 1000).toFixed(1)}k
                            </span>
                          </div>
                        </div>

                        {/* Visa & Residency Card */}
                        <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 space-y-2">
                          <h3 className="text-xs font-extrabold uppercase tracking-wider text-indigo-950">
                            Visa &amp; Legal Pathways
                          </h3>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="p-2.5 rounded-xl bg-white border border-indigo-100">
                              <span className="text-[10px] text-slate-500 font-bold block">
                                Retirement Visa
                              </span>
                              <span className="font-extrabold text-slate-900 block">
                                {dossierCountry.visa.retirementVisaName}
                              </span>
                              <span className="text-[10px] font-mono text-indigo-700">
                                Min. ${dossierCountry.visa.minimumIncomeUSD.toLocaleString()}/mo
                              </span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-white border border-indigo-100">
                              <span className="text-[10px] text-slate-500 font-bold block">
                                Digital Nomad Visa
                              </span>
                              <span className="font-extrabold text-slate-900 block">
                                {np.remoteWorkVisaName}
                              </span>
                              <span className="text-[10px] font-mono text-teal-700">
                                {np.remoteWorkVisaStay}
                              </span>
                            </div>
                          </div>
                          <p className="text-[11px] text-slate-600">
                            <strong>PR / Citizenship:</strong> {dossierCountry.visa.pathwayToPR}
                          </p>
                        </div>

                        {/* Lifestyle & Climate Scores */}
                        <div className="grid grid-cols-3 gap-2">
                          <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                            <HeartPulse className="w-4 h-4 text-rose-500 mx-auto mb-1" />
                            <span className="text-[10px] text-slate-500 block">Healthcare</span>
                            <span className="font-mono font-black text-sm text-slate-900">
                              {dossierCountry.lifestyle.healthcareScore}/100
                            </span>
                          </div>
                          <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                            <ShieldCheck className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                            <span className="text-[10px] text-slate-500 block">Safety</span>
                            <span className="font-mono font-black text-sm text-slate-900">
                              {dossierCountry.lifestyle.safetyScore}/100
                            </span>
                          </div>
                          <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                            <Sun className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                            <span className="text-[10px] text-slate-500 block">Sunny Days</span>
                            <span className="font-mono font-black text-sm text-slate-900">
                              {dossierCountry.climate.annualSunnyDays}/yr
                            </span>
                          </div>
                        </div>

                        {/* Top Expat & Nomad Hubs */}
                        {dossierCountry.topCities && dossierCountry.topCities.length > 0 && (
                          <div className="space-y-2">
                            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                              Top Cities &amp; Monthly Costs
                            </h3>
                            <div className="space-y-2">
                              {dossierCountry.topCities.map(city => (
                                <div
                                  key={city.name}
                                  className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2"
                                >
                                  <div>
                                    <span className="font-extrabold text-slate-900 block">
                                      {city.name} ({city.vibe})
                                    </span>
                                    <span className="text-[11px] text-slate-500 block">
                                      {city.highlight}
                                    </span>
                                  </div>
                                  <span className="font-mono font-black text-xs text-teal-900 bg-teal-100/80 px-2.5 py-1 rounded-xl shrink-0">
                                    ${city.monthlyCostUSD.toLocaleString()}/mo
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Gastronomy & Dining Snapshot */}
                        <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-1.5">
                          <div className="flex items-center gap-1.5 font-extrabold text-amber-950">
                            <Utensils className="w-3.5 h-3.5 text-orange-600" />
                            <span>Food &amp; Dining: {food.cuisineHeadline}</span>
                          </div>
                          <p className="text-[11px] text-slate-600">
                            Casual Meal: <strong>${food.costsAndHygiene.casualRestaurantMealUSD}</strong> · Tap Water:{' '}
                            <strong>{food.costsAndHygiene.waterSafety}</strong> · Veg Friendly:{' '}
                            <strong>{food.dietaryRestrictions.vegetarianRating}</strong>
                          </p>
                        </div>
                      </div>
                    );
                  })()
                )}
              </div>

              {/* Sticky Bottom Sheet Actions */}
              {!showFull11TabDossier && (
                <div className="p-3.5 border-t border-slate-200 bg-slate-50 grid grid-cols-2 gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      trackDossierDownload(
                        dossierCountry.id,
                        dossierCountry.name,
                        'Comprehensive 35-Page PDF Dossier'
                      );
                      generateCountryDossierPdf({
                        country: dossierCountry,
                        userProfile,
                        isAuthenticated,
                        threads: [],
                        meetups: [],
                        options: {
                          includeExecutiveSummary: true,
                          includePersonalReadinessAndJournal: true,
                          includeVisaAndLegal: true,
                          includeShortTermVisas: true,
                          includeHealthcareAndInsurance: true,
                          includeCostAndBudget: true,
                          includeHousingAndRentals: true,
                          includeFIREModeling: true,
                          includeFoodAndGastronomy: true,
                          includeTravelAndMobility: true,
                          includeClimateAndTowns: true,
                          includeDemographicsAndLifestyle: true,
                          includeDiscreetNightlife: true,
                          includeRelocationFaqs: true,
                          includeCommunityAndMeetups: true,
                        },
                      });
                    }}
                    className="min-h-[44px] rounded-2xl bg-white border border-slate-300 text-slate-800 font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Download PDF</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowFull11TabDossier(true)}
                    className="min-h-[44px] rounded-2xl bg-gradient-to-r from-indigo-600 to-teal-600 text-white font-black text-xs flex items-center justify-center gap-1 cursor-pointer shadow-sm"
                  >
                    <span>Full 11-Tab Dossier</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ===================================================================== */}
      {/* 6. NATIVE BOTTOM-SHEET MODAL 3: SHAREABLE FIRE FREEDOM CARD           */}
      {/* ===================================================================== */}
      <AnimatePresence>
        {isFreedomCardSheetOpen && (
          <div className="fixed inset-0 z-50 flex flex-col justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFreedomCardSheetOpen(false)}
              className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative z-10 w-full max-w-lg mx-auto bg-white rounded-t-3xl border-t border-slate-200 shadow-2xl p-5 space-y-4"
            >
              <div className="w-10 h-1.5 bg-slate-300 rounded-full mx-auto -mt-2 mb-1" />
              <div className="flex items-center justify-between">
                <h2 className="text-base font-black text-slate-900">
                  🏅 Shareable FIRE Freedom Card
                </h2>
                <button
                  type="button"
                  onClick={() => setIsFreedomCardSheetOpen(false)}
                  className="min-w-[38px] min-h-[38px] rounded-full bg-slate-100 flex items-center justify-center text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Native Preview Card */}
              <div className="p-5 rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-teal-950 text-white border border-indigo-400/30 shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-300 text-[10px] font-black uppercase">
                    {currentPersona === 'nomad' ? '⚡ Coast FIRE Nomad' : '🔥 Arbitrage Architect'}
                  </span>
                  <span className="text-[11px] font-mono text-teal-300 font-bold">
                    refirely.com
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="text-2xl font-black tracking-tight">
                    {fireFundedPct >= 100
                      ? '100% Financially Independent Abroad!'
                      : `Retiring ${Math.max(1, fireYearsSaved || 7)} Years Sooner Abroad`}
                  </div>
                  <p className="text-xs text-slate-300">
                    Target Haven: <strong>{userProfile.targetCountry || 'Portugal'}</strong> ·{' '}
                    <strong>${fireAbroadBudget.toLocaleString()}/mo</strong> budget ({fireFundedPct}% FI Ready)
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
                  <div className="p-2.5 rounded-xl bg-white/10">
                    <span className="text-[10px] text-slate-300 block">FI Progress</span>
                    <span className="font-mono font-black text-amber-300">{fireFundedPct}%</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/10">
                    <span className="text-[10px] text-slate-300 block">Nest Egg Goal</span>
                    <span className="font-mono font-black text-white">
                      ${(fireTargetAbroadUSD / 1000).toFixed(0)}k
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/10">
                    <span className="text-[10px] text-slate-300 block">Capital Saved</span>
                    <span className="font-mono font-black text-emerald-300">
                      ${(fireCapitalSavedUSD / 1000).toFixed(0)}k
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsFreedomCardSheetOpen(false);
                    openShareFireCardModal({
                      persona: currentPersona,
                      badgeTitle: fireFundedPct >= 100 ? '100% FI' : 'Arbitrage Architect',
                      badgeEmoji: '🔥',
                      yearsSaved: Math.max(1, fireYearsSaved || 7),
                      fireProgressPercent: fireFundedPct,
                      topCountry: userProfile.targetCountry || 'Portugal',
                      monthlyBurnUSD: fireAbroadBudget,
                      domesticMonthlyBurnUSD: fireDomesticCost,
                      currentNetWorthUSD: fireNetWorth,
                      targetFireNestEggUSD: fireTargetAbroadUSD,
                      swrPercent: fireSwr,
                    });
                  }}
                  className="min-h-[46px] rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                >
                  <Download className="w-4 h-4" />
                  <span>Customize &amp; Export PNG</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsFreedomCardSheetOpen(false)}
                  className="min-h-[46px] rounded-2xl bg-slate-100 text-slate-700 font-extrabold text-xs cursor-pointer"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ===================================================================== */}
      {/* 7. NATIVE BOTTOM-SHEET MODAL 4: USER PROFILE & QUICK ACTIONS          */}
      {/* ===================================================================== */}
      <AnimatePresence>
        {isProfileSheetOpen && (
          <div className="fixed inset-0 z-50 flex flex-col justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProfileSheetOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative z-10 w-full max-w-lg mx-auto bg-white rounded-t-3xl border-t border-slate-200 shadow-2xl p-5 space-y-4"
            >
              <div className="w-10 h-1.5 bg-slate-300 rounded-full mx-auto -mt-2 mb-1" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-teal-600 text-white font-black flex items-center justify-center">
                    {isGuestUser ? 'G' : (userProfile.name || 'M').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">
                      {isGuestUser ? 'Guest Account' : userProfile.name}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      {isGuestUser ? 'Not signed in' : userProfile.email}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsProfileSheetOpen(false)}
                  className="min-w-[38px] min-h-[38px] rounded-full bg-slate-100 flex items-center justify-center text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {isGuestUser ? (
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileSheetOpen(false);
                      openAuthModal('login');
                    }}
                    className="min-h-[46px] rounded-2xl bg-slate-900 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Log In</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileSheetOpen(false);
                      openAuthModal('signup');
                    }}
                    className="min-h-[46px] rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Sign Up Free</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileSheetOpen(false);
                      handleSelectTab('dashboard');
                    }}
                    className="w-full min-h-[44px] px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs flex items-center justify-between cursor-pointer"
                  >
                    <span>Open My Relocation Dashboard</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileSheetOpen(false);
                      openEditProfile('finances');
                    }}
                    className="w-full min-h-[44px] px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs flex items-center justify-between cursor-pointer"
                  >
                    <span>Edit 5-Scheme Financial Portfolio</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileSheetOpen(false);
                      logout();
                    }}
                    className="w-full min-h-[44px] px-4 rounded-2xl bg-rose-50 text-rose-700 font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}

              {!isNativeCapacitor && (
                <div className="pt-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileSheetOpen(false);
                      exitAndroidAppPreview();
                    }}
                    className="w-full min-h-[44px] px-4 rounded-2xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-900 font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Compass className="w-4 h-4 text-indigo-600" />
                    <span>Exit Android Preview (Return to Web View)</span>
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
