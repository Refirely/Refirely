import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { Country, SortByType, UserFinancialPortfolio } from '../../types';
import { BrandLogo } from '../BrandLogo';
import { CountryThumbnail } from '../CountryThumbnail';
import { CountryFlag } from '../CountryFlag';
import { CountryDossier } from '../CountryDossier';
import { BadgePill } from '../BadgePill';
import { getCountryNomadProfile } from '../../data/countryNomadProfiles';
import { getCountryTravelLeisureScore } from '../../data/countryTravelMobility';
import { getCountryContinentLabel, CONTINENT_FILTER_OPTIONS } from '../../utils/continents';
import { DEFAULT_FINANCIAL_PORTFOLIO, WORLD_COUNTRIES } from '../../data/userAccounts';
import { getUserEarnedBadges, getAllBadgesProgress } from '../../data/badgeDefinitions';
import { calculateUnifiedFireMetrics } from '../../utils/fireCalculations';
import { generateCountryDossierPdf } from '../../utils/exportCountryDossierPdf';
import {
  DEFAULT_FREEDOM_QUIZ_STATE,
  FREEDOM_PRIORITY_OPTIONS,
  FREEDOM_QUIZ_UPDATED_EVENT,
  FreedomEscapePlan,
  FreedomPriorityId,
  FreedomQuizState,
  computeFreedomMapResults,
  loadFreedomQuizState,
  normalizeFreedomQuizState,
  pickNewestFreedomQuizState,
} from '../../utils/freedomMapQuiz';
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
  ChevronDown,
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
  ArrowLeft,
  Share2,
  Check,
  Scale,
  Sunrise,
  Briefcase,
  Palmtree,
  RotateCcw,
} from 'lucide-react';

export type AndroidTabId = 'matcher' | 'explore' | 'fire' | 'visa-check' | 'dashboard';

const CLIMATE_PILLS = ['All', 'Mediterranean', 'Tropical', 'Subtropical', 'Temperate', 'Highlands / Mild'];

const NEST_EGG_PRESETS = [
  { label: '$25k', sub: 'Starter', value: 25000 },
  { label: '$100k', sub: 'Builder', value: 100000 },
  { label: '$250k', sub: 'Coast', value: 250000 },
  { label: '$500k', sub: 'Geo-FIRE', value: 500000 },
  { label: '$1M+', sub: 'Full FIRE', value: 1000000 },
];

const ESCAPE_PLAN_CARDS: Array<{
  id: FreedomEscapePlan;
  title: string;
  sub: string;
  badge: string;
  icon: React.FC<{ className?: string }>;
}> = [
  {
    id: 'full_fire',
    title: 'Full FIRE / Passive Income',
    sub: 'Living off investments, dividends, or pensions',
    badge: 'Retirement Visas',
    icon: Sunrise,
  },
  {
    id: 'coast_fire',
    title: 'Coast FIRE / Remote Work',
    sub: 'Location-independent income while portfolio compounds',
    badge: 'Digital Nomad Visas',
    icon: Briefcase,
  },
  {
    id: 'mini_retirement',
    title: 'Mini-Retirement / Sabbatical',
    sub: 'Taking 1–3 years off to travel and recharge',
    badge: 'Flexible Long-Stay',
    icon: Palmtree,
  },
];

function formatNestEggDisplay(value: number): string {
  if (value >= 1000000) {
    return value === 1000000 ? '$1M+' : `$${(value / 1000000).toFixed(2).replace(/\.00$/, '')}M`;
  }
  return `$${value.toLocaleString()}`;
}

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
    saveFreedomMapQuiz,
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

  // Sync active tab with currentView
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
  // TAB 1: SYNCED 4-STEP FREEDOM MAP QUIZ ("Find out where you can retire—or work remotely—today.")
  // + INSTANT MATCH ENGINE (100% synced with Website Home Page)
  // ============================================================================
  const [quiz, setQuiz] = useState<FreedomQuizState>(() => {
    const initial = pickNewestFreedomQuizState(
      !isGuestUser ? userProfile.freedomMapQuiz : null,
      loadFreedomQuizState()
    );
    return initial || DEFAULT_FREEDOM_QUIZ_STATE;
  });
  const [quizStep, setQuizStep] = useState<1 | 2 | 3 | 4>(1);
  const [quizResultTab, setQuizResultTab] = useState<'matches' | 'visa' | 'inflation'>('matches');
  const [matcherSearch, setMatcherSearch] = useState<string>('');

  // Hydrate when cloud-synced userProfile.freedomMapQuiz updates
  useEffect(() => {
    if (isGuestUser) return;
    const cloudQuiz = normalizeFreedomQuizState(userProfile.freedomMapQuiz);
    if (!cloudQuiz) return;
    setQuiz(prev => {
      const newest = pickNewestFreedomQuizState(cloudQuiz, prev);
      return newest || prev;
    });
  }, [isGuestUser, currentUserId, userProfile.freedomMapQuiz]);

  // Listen for live updates from Website FreedomMapHeroQuiz / Dashboard
  useEffect(() => {
    const handleExternalUpdate = (e: Event) => {
      const custom = e as CustomEvent<FreedomQuizState | null>;
      if (custom.detail === null) {
        setQuiz(DEFAULT_FREEDOM_QUIZ_STATE);
        setQuizStep(1);
        return;
      }
      const incoming = normalizeFreedomQuizState(custom.detail);
      if (!incoming) return;
      setQuiz(prev => (prev.updatedAt === incoming.updatedAt ? prev : incoming));
    };
    window.addEventListener(FREEDOM_QUIZ_UPDATED_EVENT, handleExternalUpdate);
    return () => window.removeEventListener(FREEDOM_QUIZ_UPDATED_EVENT, handleExternalUpdate);
  }, []);

  const updateQuizFromAndroid = (
    updater: (prev: FreedomQuizState) => FreedomQuizState,
    options?: { immediate?: boolean }
  ) => {
    setQuiz(prev => {
      const next: FreedomQuizState = {
        ...updater(prev),
        updatedAt: new Date().toISOString(),
      };
      saveFreedomMapQuiz(next, options);
      return next;
    });
  };

  const freedomResults = useMemo(
    () => computeFreedomMapResults(countries, quiz),
    [countries, quiz]
  );

  // Synced Interactive Match Engine scoring (exact same algorithm as LandingPage.tsx)
  const DEFAULT_RETIREE_BUDGET_REF = 2800;
  const DEFAULT_NOMAD_BURN_REF = 2200;
  const matcherResults = useMemo(() => {
    const scored = countries.map(country => {
      const travelScore = getCountryTravelLeisureScore(country);
      const nomadProfile = getCountryNomadProfile(country);
      const monthlyCost =
        currentPersona === 'nomad'
          ? nomadProfile.monthlyNomadBurnUSD
          : country.costOfLiving.monthlyBudgetCoupleUSD;

      if (currentPersona === 'nomad') {
        let score = 66;
        const burnDiff = DEFAULT_NOMAD_BURN_REF - nomadProfile.monthlyNomadBurnUSD;
        if (burnDiff >= 450) score += 14;
        else if (burnDiff >= 0) score += 11;
        else if (burnDiff >= -350) score += 5;
        else score -= 9;

        if (nomadProfile.hasCuratedData) score += 3;
        if (nomadProfile.coworkingDensity === 'World-Class Nomad Hub') score += 2;

        const speedPts = Math.min(14, (nomadProfile.verifiedInternetMbps / 270) * 14);
        const relPts =
          nomadProfile.internetReliability === 'Ultra-Fast Fiber'
            ? 4
            : nomadProfile.internetReliability === 'High-Speed Reliable'
            ? 2
            : 0;
        const gridPts = nomadProfile.powerAndBackupStability.includes('99.9%') ? 2 : 1;
        score += speedPts + relPts + gridPts;

        return {
          country,
          nomadProfile,
          monthlyCost,
          matchPercent: Math.min(99, Math.max(68, Math.round(score))),
          travelScore,
        };
      }

      let score = 68;
      const diff = DEFAULT_RETIREE_BUDGET_REF - country.costOfLiving.monthlyBudgetCoupleUSD;
      if (diff >= 400) score += 16;
      else if (diff >= 0) score += 13;
      else if (diff >= -450) score += 6;
      else score -= 8;
      score += (travelScore / 100) * 15;

      return {
        country,
        nomadProfile,
        monthlyCost,
        matchPercent: Math.min(99, Math.max(68, Math.round(score))),
        travelScore,
      };
    });

    const q = matcherSearch.trim().toLowerCase();
    const filtered = q
      ? scored.filter(({ country, nomadProfile }) => {
          const cities = (country.topCities || []).map(tc => tc.name.toLowerCase()).join(' ');
          const nomadCities = nomadProfile.topNomadCities.join(' ').toLowerCase();
          return (
            country.name.toLowerCase().includes(q) ||
            country.capital.toLowerCase().includes(q) ||
            country.region.toLowerCase().includes(q) ||
            cities.includes(q) ||
            nomadCities.includes(q)
          );
        })
      : scored;

    filtered.sort((a, b) => {
      if (b.matchPercent !== a.matchPercent) return b.matchPercent - a.matchPercent;
      if (currentPersona === 'nomad') {
        return b.nomadProfile.verifiedInternetMbps - a.nomadProfile.verifiedInternetMbps;
      }
      return b.travelScore - a.travelScore;
    });

    return filtered.slice(0, 14);
  }, [countries, currentPersona, matcherSearch]);

  // ============================================================================
  // TAB 3: SYNCED FIRE CALCULATOR & GEO-ARBITRAGE ENGINE (100% logic parity with FireCalculatorPage.tsx)
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

  const initialInvestedSum = useMemo(() => {
    const inv = finances.investments;
    const sum =
      (inv.savingsUSD || 0) +
      (inv.stocksMutualFundsUSD || 0) +
      (finances.includePrimaryHomeInFire ? inv.realEstateUSD || 0 : 0) +
      (finances.includeGoldInFire !== false ? inv.goldUSD || 0 : 0) +
      (inv.othersUSD || 0);
    return sum > 0 ? Math.round(sum) : 250000;
  }, [finances]);

  const [fireMode, setFireMode] = useState<'fire' | 'nomad' | 'portfolio'>('fire');
  const [selectedBasisCountry, setSelectedBasisCountry] = useState<string>(
    userProfile.residingCountry || userProfile.originCountry || 'United States'
  );
  const [selectedTargetHaven, setSelectedTargetHaven] = useState<string>(
    userProfile.targetCountry || 'Portugal'
  );
  const [isBasisPickerOpen, setIsBasisPickerOpen] = useState<boolean>(false);
  const [isHavenPickerOpen, setIsHavenPickerOpen] = useState<boolean>(false);
  const [countryPickerSearch, setCountryPickerSearch] = useState<string>('');

  const [fireNetWorth, setFireNetWorth] = useState<number>(() =>
    isGuestUser ? 250000 : initialInvestedSum
  );
  const [fireAbroadBudget, setFireAbroadBudget] = useState<number>(() =>
    isGuestUser
      ? 2400
      : Math.round(finances.monthlyRetirementExpensesUSD || userProfile.monthlyBudgetUSD || 2400)
  );
  const [fireDomesticCost, setFireDomesticCost] = useState<number>(() =>
    isGuestUser ? 4800 : Math.round(finances.monthlyCurrentExpensesUSD || 4800)
  );
  const [fireAnnualSavings, setFireAnnualSavings] = useState<number>(() =>
    isGuestUser ? 25000 : Math.round((finances.monthlySipUSD ?? 2100) * 12)
  );
  const [fireSwr, setFireSwr] = useState<number>(() => finances.safeWithdrawalRatePercent || 4.0);
  const [fireReturnRate, setFireReturnRate] = useState<number>(() =>
    finances.expectedReturnRatePercent || 7.0
  );
  const [fireInflationRate, setFireInflationRate] = useState<number>(() =>
    finances.inflationRatePercent || 3.0
  );
  const [showFireSummaryNarrative, setShowFireSummaryNarrative] = useState<boolean>(true);

  // 5-Scheme Personal Portfolio state
  const [schemeSavings, setSchemeSavings] = useState<number>(() => finances.investments.savingsUSD || 35000);
  const [schemeStocks, setSchemeStocks] = useState<number>(() => finances.investments.stocksMutualFundsUSD || 165000);
  const [schemeRealEstate, setSchemeRealEstate] = useState<number>(() => finances.investments.realEstateUSD || 0);
  const [schemeGold, setSchemeGold] = useState<number>(() => finances.investments.goldUSD || 25000);
  const [schemeOthers, setSchemeOthers] = useState<number>(() => finances.investments.othersUSD || 25000);
  const [fireToast, setFireToast] = useState<string | null>(null);

  // Nomad Runway state
  const [nomadCash, setNomadCash] = useState<number>(() =>
    Math.min(1000000, Math.max(10000, finances.investments.savingsUSD || 45000))
  );
  const [nomadBurn, setNomadBurn] = useState<number>(1850);
  const [nomadIncome, setNomadIncome] = useState<number>(1400);

  // Sync when userProfile or targetCountry changes on website
  useEffect(() => {
    if (userProfile.targetCountry) setSelectedTargetHaven(userProfile.targetCountry);
    if (userProfile.residingCountry || userProfile.originCountry) {
      setSelectedBasisCountry(userProfile.residingCountry || userProfile.originCountry);
    }
    if (!isGuestUser) {
      setFireNetWorth(initialInvestedSum);
      setFireAbroadBudget(
        Math.round(finances.monthlyRetirementExpensesUSD || userProfile.monthlyBudgetUSD || 2400)
      );
      setFireDomesticCost(Math.round(finances.monthlyCurrentExpensesUSD || 4800));
      setFireAnnualSavings(Math.round((finances.monthlySipUSD ?? 2100) * 12));
      setFireSwr(finances.safeWithdrawalRatePercent || 4.0);
      setFireReturnRate(finances.expectedReturnRatePercent || 7.0);
      setFireInflationRate(finances.inflationRatePercent || 3.0);
      setSchemeSavings(finances.investments.savingsUSD || 0);
      setSchemeStocks(finances.investments.stocksMutualFundsUSD || 0);
      setSchemeRealEstate(finances.investments.realEstateUSD || 0);
      setSchemeGold(finances.investments.goldUSD || 0);
      setSchemeOthers(finances.investments.othersUSD || 0);
    }
  }, [
    isGuestUser,
    initialInvestedSum,
    finances,
    userProfile.monthlyBudgetUSD,
    userProfile.targetCountry,
    userProfile.residingCountry,
    userProfile.originCountry,
  ]);

  const selectedTargetHavenObj = useMemo(
    () =>
      countries.find(c => c.name.toLowerCase() === selectedTargetHaven.toLowerCase()) || null,
    [countries, selectedTargetHaven]
  );

  const handleSelectTargetHaven = (countryName: string) => {
    setSelectedTargetHaven(countryName);
    setIsHavenPickerOpen(false);
    setCountryPickerSearch('');
    const matched = countries.find(c => c.name.toLowerCase() === countryName.toLowerCase());
    if (matched) {
      setFireAbroadBudget(
        currentPersona === 'nomad'
          ? getCountryNomadProfile(matched).monthlyNomadBurnUSD
          : matched.costOfLiving.monthlyBudgetCoupleUSD
      );
    }
    if (!isGuestUser) {
      updateUserProfile({ targetCountry: countryName });
    }
  };

  // Compounded return applied to BOTH currently invested assets AND monthly SIP (synced with FireCalculatorPage.tsx)
  const fireTargetAbroadUSD = Math.round((fireAbroadBudget * 12) / (fireSwr / 100));
  const fireTargetHomeUSD = Math.round((fireDomesticCost * 12) / (fireSwr / 100));
  const fireCapitalSavedUSD = Math.max(0, fireTargetHomeUSD - fireTargetAbroadUSD);
  const fireFundedPct = Math.min(
    100,
    Math.max(0, Math.round((fireNetWorth / Math.max(1, fireTargetAbroadUSD)) * 100))
  );

  const computeYearsToTargetWithCompounding = (targetUSD: number) => {
    if (fireNetWorth >= targetUSD) return 0;
    const monthlyRate = Math.max(0, fireReturnRate) / 100 / 12;
    const monthlySip = Math.max(0, fireAnnualSavings) / 12;
    let pool = Math.max(0, fireNetWorth);
    let months = 0;
    while (pool < targetUSD && months < 600) {
      pool = pool * (1 + monthlyRate) + monthlySip;
      months++;
    }
    return Number((months / 12).toFixed(1));
  };

  const fireYearsAbroad = computeYearsToTargetWithCompounding(fireTargetAbroadUSD);
  const fireYearsHome = computeYearsToTargetWithCompounding(fireTargetHomeUSD);
  const fireYearsSaved = Math.max(0, Number((fireYearsHome - fireYearsAbroad).toFixed(1)));

  // Work-Free Survival if stopping work today (with compounded return vs inflation)
  const survivalIfStopToday = useMemo(() => {
    const realAnnualReturn = (1 + fireReturnRate / 100) / (1 + fireInflationRate / 100) - 1;
    const monthlyRealRate = realAnnualReturn / 12;
    let balance = Math.max(0, fireNetWorth);
    if (balance <= 0 || fireAbroadBudget <= 0) return { years: 0, months: 0, perpetual: false };
    if (balance * monthlyRealRate >= fireAbroadBudget) {
      return { years: 50, months: 0, perpetual: true };
    }
    let totalMonths = 0;
    while (balance > 0 && totalMonths < 600) {
      balance = balance * (1 + monthlyRealRate) - fireAbroadBudget;
      if (balance >= 0) totalMonths++;
    }
    return {
      years: Math.floor(totalMonths / 12),
      months: totalMonths % 12,
      perpetual: totalMonths >= 600,
    };
  }, [fireNetWorth, fireAbroadBudget, fireReturnRate, fireInflationRate]);

  const handleSaveAndroidFirePlan = () => {
    if (isGuestUser) {
      openAuthModal('signup');
      return;
    }
    const nextFinances: UserFinancialPortfolio = {
      ...finances,
      monthlyCurrentExpensesUSD: fireDomesticCost,
      monthlyRetirementExpensesUSD: fireAbroadBudget,
      monthlySipUSD: Math.round(fireAnnualSavings / 12),
      safeWithdrawalRatePercent: fireSwr,
      expectedReturnRatePercent: fireReturnRate,
      inflationRatePercent: fireInflationRate,
      investments: {
        ...finances.investments,
        savingsUSD: schemeSavings,
        stocksMutualFundsUSD: schemeStocks,
        realEstateUSD: schemeRealEstate,
        goldUSD: schemeGold,
        othersUSD: schemeOthers,
      },
    };
    updateUserProfile({
      monthlyBudgetUSD: fireAbroadBudget,
      residingCountry: selectedBasisCountry,
      targetCountry: selectedTargetHaven,
      finances: nextFinances,
    });
    setShowFireSummaryNarrative(true);
    setFireToast('Synced with your Cloud FIRE Profile!');
    setTimeout(() => setFireToast(null), 2800);
  };

  const handleOpenAndroidShareableFireCard = () => {
    openShareFireCardModal({
      persona: currentPersona,
      topCountry: selectedTargetHaven,
      topCity: selectedTargetHavenObj?.topCities?.[0]?.name || selectedTargetHavenObj?.capital || '',
      topCountryFlag: selectedTargetHavenObj?.flag || '🌍',
      fireProgressPercent: fireFundedPct,
      yearsSaved: Math.round(fireYearsSaved),
      monthlyBurnUSD: fireAbroadBudget,
      domesticMonthlyBurnUSD: fireDomesticCost,
      currentNetWorthUSD: fireNetWorth,
      targetFireNestEggUSD: fireTargetAbroadUSD,
      swrPercent: fireSwr,
    });
  };

  const nomadNetMonthlyBurn = Math.max(0, nomadBurn - nomadIncome);
  const nomadRunwayMonths =
    nomadNetMonthlyBurn <= 0 ? 120 : Math.min(120, Math.round(nomadCash / nomadNetMonthlyBurn));

  // ============================================================================
  // TAB 4: BILATERAL PASSPORT & 209-HAVEN VISA CHECKER (WITH FLAG PICKERS)
  // ============================================================================
  const [visaOriginCode, setVisaOriginCode] = useState<string>('US');
  const [visaPassportTypeId, setVisaPassportTypeId] = useState<string>('ordinary');
  const [visaHeldVisas, setVisaHeldVisas] = useState<HeldVisaId[]>([]);
  const [visaDestCode, setVisaDestCode] = useState<string>('PT');
  const [visaStatusFilter, setVisaStatusFilter] = useState<'all' | 'visa-free' | 'evisa-voa' | 'required'>('all');
  const [visaSearchFilter, setVisaSearchFilter] = useState<string>('');
  const [isVisaOriginPickerOpen, setIsVisaOriginPickerOpen] = useState<boolean>(false);
  const [isVisaDestPickerOpen, setIsVisaDestPickerOpen] = useState<boolean>(false);
  const [visaPickerSearch, setVisaPickerSearch] = useState<string>('');

  const availablePassportTypes = useMemo(
    () => getPassportTypesForCountry(visaOriginCode),
    [visaOriginCode]
  );

  const toggleHeldVisa = (id: HeldVisaId) => {
    setVisaHeldVisas(prev => (prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]));
  };

  const directVisaResult = useMemo(
    () =>
      evaluateVisaRequirement({
        originCode: visaOriginCode,
        destinationCode: visaDestCode,
        passportTypeId: visaPassportTypeId,
        purpose: currentPersona === 'nomad' ? 'digital_nomad' : 'retirement',
        heldVisas: visaHeldVisas,
      }),
    [visaOriginCode, visaDestCode, visaPassportTypeId, visaHeldVisas, currentPersona]
  );

  const globalVisaMatrix = useMemo(
    () => computeGlobalAccessMatrix(visaOriginCode, visaPassportTypeId, visaHeldVisas),
    [visaOriginCode, visaPassportTypeId, visaHeldVisas]
  );

  const visaSummaryCounts = useMemo(() => {
    let visaFree = 0;
    let eVisaVoa = 0;
    let required = 0;
    globalVisaMatrix.forEach(r => {
      if (
        r.status === 'domestic' ||
        r.status === 'freedom_of_movement' ||
        r.status === 'visa_free' ||
        r.status === 'visa_free_conditional' ||
        r.status === 'eta_required'
      ) {
        visaFree++;
      } else if (r.status === 'visa_on_arrival' || r.status === 'e_visa') {
        eVisaVoa++;
      } else {
        required++;
      }
    });
    return { visaFree, eVisaVoa, required };
  }, [globalVisaMatrix]);

  const filteredVisaDestinations = useMemo(() => {
    const q = visaSearchFilter.trim().toLowerCase();
    return globalVisaMatrix.filter(r => {
      if (q && !r.destination.name.toLowerCase().includes(q)) return false;
      if (visaStatusFilter === 'visa-free') {
        return (
          r.status === 'domestic' ||
          r.status === 'freedom_of_movement' ||
          r.status === 'visa_free' ||
          r.status === 'visa_free_conditional' ||
          r.status === 'eta_required'
        );
      }
      if (visaStatusFilter === 'evisa-voa') {
        return r.status === 'visa_on_arrival' || r.status === 'e_visa';
      }
      if (visaStatusFilter === 'required') {
        return r.status === 'visa_required';
      }
      return true;
    });
  }, [globalVisaMatrix, visaStatusFilter, visaSearchFilter]);

  // ============================================================================
  // TAB 5: DASHBOARD (SAVED HAVENS, BADGES, QUIZ SYNC & CHECKLIST)
  // ============================================================================
  const currentAccount = useMemo(
    () => registeredAccounts.find(a => a.id === currentUserId) || null,
    [registeredAccounts, currentUserId]
  );

  const earnedBadges = useMemo(
    () =>
      isGuestUser
        ? []
        : getUserEarnedBadges(
            userProfile,
            currentAccount,
            earlyPioneerThreshold,
            registeredAccounts,
            countries
          ),
    [isGuestUser, userProfile, currentAccount, earlyPioneerThreshold, registeredAccounts, countries]
  );

  const badgesProgress = useMemo(
    () =>
      getAllBadgesProgress(
        userProfile,
        currentAccount,
        earlyPioneerThreshold,
        registeredAccounts,
        countries
      ),
    [userProfile, currentAccount, earlyPioneerThreshold, registeredAccounts, countries]
  );

  const unifiedMetrics = useMemo(
    () => calculateUnifiedFireMetrics(userProfile, countries),
    [userProfile, countries]
  );

  const savedCountriesList = useMemo(
    () => countries.filter(c => savedCountryIds.includes(c.id)),
    [countries, savedCountryIds]
  );

  const getVisaBadgeStyle = (status: VisaRequirementStatus) => {
    switch (status) {
      case 'domestic':
      case 'freedom_of_movement':
      case 'visa_free':
      case 'visa_free_conditional':
        return { bg: 'bg-emerald-100 text-emerald-900 border-emerald-300', label: 'Visa-Free' };
      case 'eta_required':
        return { bg: 'bg-teal-100 text-teal-900 border-teal-300', label: 'eTA / Waiver' };
      case 'visa_on_arrival':
        return { bg: 'bg-amber-100 text-amber-950 border-amber-300', label: 'Visa on Arrival' };
      case 'e_visa':
        return { bg: 'bg-indigo-100 text-indigo-900 border-indigo-300', label: 'Online e-Visa' };
      default:
        return { bg: 'bg-rose-100 text-rose-900 border-rose-300', label: 'Visa Required' };
    }
  };

  const selectedOriginVisaCountry = useMemo(
    () => VISA_WORLD_COUNTRIES.find(c => c.code === visaOriginCode) || VISA_WORLD_COUNTRIES[0],
    [visaOriginCode]
  );
  const selectedDestVisaCountry = useMemo(
    () => VISA_WORLD_COUNTRIES.find(c => c.code === visaDestCode) || VISA_WORLD_COUNTRIES[1],
    [visaDestCode]
  );

  return (
    <div className="min-h-screen w-full bg-slate-900/95 flex flex-col items-center justify-start select-none">
      {/* Centered Native Android Phone App Frame (Full width on phone, sleek 460px mobile app frame on desktop) */}
      <div className="w-full max-w-[460px] min-h-screen bg-slate-50 text-slate-900 flex flex-col shadow-2xl relative pb-20 overflow-x-hidden border-x border-slate-800/20">
        {/* Preview Mode Switcher Banner (Web Preview Only) */}
        {!isNativeCapacitor && (
          <div className="bg-slate-950 text-white px-3.5 py-1.5 flex items-center justify-between gap-2 text-[11px] border-b border-slate-800">
            <span className="font-bold text-slate-200 flex items-center gap-1.5 truncate">
              <span>📱</span>
              <span>Native Android App Preview</span>
            </span>
            <button
              type="button"
              onClick={exitAndroidAppPreview}
              className="px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[11px] flex items-center gap-1 shrink-0 cursor-pointer transition-colors shadow-2xs"
            >
              <span>Exit to Web Mode</span>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

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
              Android
            </span>
          </button>

          <div className="flex items-center gap-1.5">
            {/* Quick Persona Pill Toggle */}
            <button
              type="button"
              onClick={() => setCurrentPersona(currentPersona === 'retiree' ? 'nomad' : 'retiree')}
              className="min-h-[34px] px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200/90 text-[11px] font-extrabold text-slate-800 flex items-center gap-1 cursor-pointer active:scale-95 transition-transform"
            >
              <span>{currentPersona === 'nomad' ? '⚡ Nomad' : '🌿 Retiree'}</span>
            </button>

            {/* Notifications / Profile Sheet */}
            <button
              type="button"
              onClick={() => setIsProfileSheetOpen(true)}
              className="relative min-w-[38px] min-h-[38px] rounded-full flex items-center justify-center text-slate-700 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {totalUnreadDms > 0 && (
                <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full bg-rose-600 text-white text-[9px] font-black flex items-center justify-center">
                  {totalUnreadDms}
                </span>
              )}
            </button>

            {/* Profile Avatar */}
            <button
              type="button"
              onClick={() => setIsProfileSheetOpen(true)}
              className="min-w-[38px] min-h-[38px] rounded-full flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
              aria-label="Account Menu"
            >
              {!isGuestUser && userProfile.avatarUrl ? (
                <img
                  src={userProfile.avatarUrl}
                  alt={userProfile.name}
                  className="w-7 h-7 rounded-full object-cover ring-2 ring-indigo-500/40"
                />
              ) : (
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white shadow-2xs ${
                    isGuestUser
                      ? 'bg-slate-700'
                      : 'bg-gradient-to-br from-indigo-600 via-violet-600 to-teal-600'
                  }`}
                >
                  {isGuestUser ? <User className="w-3.5 h-3.5" /> : (userProfile.name || 'M').charAt(0).toUpperCase()}
                </div>
              )}
            </button>
          </div>
        </header>

        {/* ===================================================================== */}
        {/* 2. MAIN NATIVE ANDROID SINGLE-COLUMN TAB VIEWPORT                     */}
        {/* ===================================================================== */}
        <main className="flex-1 w-full px-3.5 pt-3.5 pb-6 space-y-3.5 overflow-x-hidden">
          {/* ------------------------------------------------------------------- */}
          {/* TAB 1: "MATCHER" — SYNCED 4-STEP FREEDOM MAP QUIZ + HAVEN MATCHER   */}
          {/* ------------------------------------------------------------------- */}
          {activeTab === 'matcher' && (
            <div className="space-y-3.5 animate-in fade-in duration-150">
              {/* Native Android Card: "Find out where you can retire—or work remotely—today." */}
              <div className="p-4 rounded-3xl bg-white border border-indigo-200/90 shadow-sm space-y-3.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-[10px] font-extrabold uppercase tracking-wider text-indigo-800">
                    <Sparkles className="w-3 h-3 text-indigo-600" />
                    <span>4-Step Freedom Map · Cloud Synced</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      updateQuizFromAndroid(() => DEFAULT_FREEDOM_QUIZ_STATE, { immediate: true });
                      setQuizStep(1);
                    }}
                    className="text-[11px] font-bold text-slate-500 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                </div>

                <div>
                  <h1 className="text-base font-black text-slate-900 leading-snug">
                    Find out where you can{' '}
                    <span className="bg-gradient-to-r from-indigo-600 via-teal-600 to-amber-600 bg-clip-text text-transparent">
                      retire—or work remotely—today.
                    </span>
                  </h1>
                </div>

                {/* 4-Step Segmented Native Pill Bar */}
                <div className="grid grid-cols-4 gap-1.5 p-1 rounded-2xl bg-slate-100 border border-slate-200/80">
                  {[
                    { s: 1 as const, label: '1. Savings' },
                    { s: 2 as const, label: '2. Budget' },
                    { s: 3 as const, label: '3. Plan' },
                    { s: 4 as const, label: '4. Vibe' },
                  ].map(tab => (
                    <button
                      key={tab.s}
                      type="button"
                      onClick={() => setQuizStep(tab.s)}
                      className={`min-h-[34px] rounded-xl text-[11px] font-extrabold transition-all cursor-pointer ${
                        quizStep === tab.s
                          ? 'bg-gradient-to-r from-indigo-600 to-teal-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* STEP 1: YOUR NEST EGG */}
                {quizStep === 1 && (
                  <div className="space-y-3 pt-0.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-slate-700">Your Invested Nest Egg</span>
                      <span className="font-mono font-black text-sm px-2.5 py-0.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900">
                        {formatNestEggDisplay(quiz.nestEggUSD)}
                      </span>
                    </div>
                    <div className="grid grid-cols-5 gap-1.5">
                      {NEST_EGG_PRESETS.map(p => {
                        const active = quiz.nestEggUSD === p.value;
                        return (
                          <button
                            key={p.value}
                            type="button"
                            onClick={() => {
                              updateQuizFromAndroid(prev => ({ ...prev, nestEggUSD: p.value }), {
                                immediate: true,
                              });
                            }}
                            className={`py-2 px-1 rounded-xl border text-center cursor-pointer transition-all ${
                              active
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                                : 'bg-slate-50 text-slate-800 border-slate-200'
                            }`}
                          >
                            <span className="text-xs font-black block">{p.label}</span>
                            <span className={`text-[9px] font-bold block ${active ? 'text-indigo-100' : 'text-slate-500'}`}>
                              {p.sub}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={1000000}
                      step={5000}
                      value={Math.min(1000000, quiz.nestEggUSD)}
                      onChange={e =>
                        updateQuizFromAndroid(prev => ({
                          ...prev,
                          nestEggUSD: Number(e.target.value),
                        }))
                      }
                      className="w-full h-2 bg-indigo-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <button
                      type="button"
                      onClick={() => setQuizStep(2)}
                      className="w-full min-h-[42px] rounded-2xl bg-slate-900 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Next: Monthly Burn Rate →</span>
                    </button>
                  </div>
                )}

                {/* STEP 2: YOUR MONTHLY BURN RATE & HOUSEHOLD */}
                {quizStep === 2 && (
                  <div className="space-y-3 pt-0.5">
                    <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200">
                      {(['solo', 'couple'] as const).map(h => (
                        <button
                          key={h}
                          type="button"
                          onClick={() =>
                            updateQuizFromAndroid(
                              prev => ({
                                ...prev,
                                household: h,
                                monthlyBudgetUSD:
                                  h === 'couple'
                                    ? Math.max(2200, prev.monthlyBudgetUSD)
                                    : prev.monthlyBudgetUSD,
                              }),
                              { immediate: true }
                            )
                          }
                          className={`min-h-[34px] rounded-lg text-xs font-extrabold capitalize cursor-pointer ${
                            quiz.household === h
                              ? 'bg-white text-slate-900 shadow-2xs'
                              : 'text-slate-600'
                          }`}
                        >
                          {h === 'solo' ? '👤 Solo Explorer' : '👥 Couple / Partner'}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-slate-700">Target Monthly Budget</span>
                      <span className="font-mono font-black text-sm px-2.5 py-0.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-900">
                        ${quiz.monthlyBudgetUSD.toLocaleString()}/mo
                      </span>
                    </div>
                    <input
                      type="range"
                      min={800}
                      max={8000}
                      step={100}
                      value={quiz.monthlyBudgetUSD}
                      onChange={e =>
                        updateQuizFromAndroid(prev => ({
                          ...prev,
                          monthlyBudgetUSD: Number(e.target.value),
                        }))
                      }
                      className="w-full h-2 bg-teal-100 rounded-lg appearance-none cursor-pointer accent-teal-600"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setQuizStep(1)}
                        className="min-h-[40px] rounded-xl bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer"
                      >
                        ← Back
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuizStep(3)}
                        className="min-h-[40px] rounded-xl bg-slate-900 text-white text-xs font-extrabold cursor-pointer"
                      >
                        Next: Escape Plan →
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: YOUR ESCAPE PLAN */}
                {quizStep === 3 && (
                  <div className="space-y-2.5 pt-0.5">
                    {ESCAPE_PLAN_CARDS.map(plan => {
                      const Icon = plan.icon;
                      const active = quiz.escapePlan === plan.id;
                      return (
                        <button
                          key={plan.id}
                          type="button"
                          onClick={() => {
                            updateQuizFromAndroid(prev => ({ ...prev, escapePlan: plan.id }), {
                              immediate: true,
                            });
                            setQuizStep(4);
                          }}
                          className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between gap-2.5 cursor-pointer transition-all ${
                            active
                              ? 'bg-gradient-to-r from-indigo-600 to-teal-600 text-white border-indigo-600 shadow-xs'
                              : 'bg-slate-50 text-slate-900 border-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                                active ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-700'
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <span className="text-xs font-black block truncate">{plan.title}</span>
                              <span
                                className={`text-[10px] block truncate ${
                                  active ? 'text-indigo-100' : 'text-slate-500'
                                }`}
                              >
                                {plan.sub}
                              </span>
                            </div>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-lg text-[9px] font-extrabold shrink-0 ${
                              active ? 'bg-white/20 text-white' : 'bg-white text-indigo-800 border border-indigo-200'
                            }`}
                          >
                            {plan.badge}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* STEP 4: YOUR IDEAL ENVIRONMENT PRIORITIES */}
                {quizStep === 4 && (
                  <div className="space-y-3 pt-0.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-extrabold text-slate-700">
                        Tap Priorities ({quiz.priorities.length} selected)
                      </span>
                      {quiz.priorities.length > 0 && (
                        <button
                          type="button"
                          onClick={() =>
                            updateQuizFromAndroid(prev => ({ ...prev, priorities: [] }), {
                              immediate: true,
                            })
                          }
                          className="text-rose-600 font-bold cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5 max-h-44 overflow-y-auto pr-1">
                      {FREEDOM_PRIORITY_OPTIONS.map(opt => {
                        const active = quiz.priorities.includes(opt.id);
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() =>
                              updateQuizFromAndroid(
                                prev => {
                                  const exists = prev.priorities.includes(opt.id);
                                  const nextP = exists
                                    ? prev.priorities.filter(p => p !== opt.id)
                                    : [...prev.priorities, opt.id];
                                  return { ...prev, priorities: nextP, completedReveal: true };
                                },
                                { immediate: true }
                              )
                            }
                            className={`px-2.5 py-1.5 rounded-xl text-[11px] font-extrabold border transition-all cursor-pointer flex items-center gap-1 ${
                              active
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                                : 'bg-slate-50 text-slate-700 border-slate-200'
                            }`}
                          >
                            {active && <Check className="w-3 h-3" />}
                            <span>{opt.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* LIVE SYNCED FREEDOM MAP KPI STRIP */}
                <div className="p-3 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-teal-950 text-white space-y-2.5">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 rounded-xl bg-white/10">
                      <span className="text-[9px] uppercase font-bold text-teal-200 block">
                        Havens Unlocked
                      </span>
                      <span className="text-base font-black font-mono text-emerald-300">
                        {freedomResults.qualifyingCount}
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-white/10">
                      <span className="text-[9px] uppercase font-bold text-amber-200 block">
                        Freedom Runway
                      </span>
                      <span className="text-base font-black font-mono text-amber-300">
                        {freedomResults.runwayShortLabel}
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-white/10">
                      <span className="text-[9px] uppercase font-bold text-indigo-200 block">
                        4% Safe Income
                      </span>
                      <span className="text-base font-black font-mono text-white">
                        ${freedomResults.safeMonthlyWithdrawalUSD.toLocaleString()}/mo
                      </span>
                    </div>
                  </div>

                  {/* 3 Result Sub-Tabs: Top Matches / Visa Matrix / 10-Yr Inflation */}
                  <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-white/10 text-[10px] font-extrabold">
                    {[
                      { id: 'matches' as const, label: 'Top Matches' },
                      { id: 'visa' as const, label: 'Visa Matrix' },
                      { id: 'inflation' as const, label: '10-Yr Cost' },
                    ].map(t => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setQuizResultTab(t.id)}
                        className={`py-1.5 rounded-lg cursor-pointer transition-all ${
                          quizResultTab === t.id
                            ? 'bg-amber-400 text-slate-950 font-black'
                            : 'text-slate-200'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  {/* Top 3 Synced Freedom Quiz Matches */}
                  <div className="space-y-1.5">
                    {freedomResults.topMatches.slice(0, 3).map((item, idx) => (
                      <div
                        key={item.country.id}
                        onClick={() => openCountryDossierSheet(item.country)}
                        className="p-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 flex items-center justify-between gap-2 cursor-pointer"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] flex items-center justify-center shrink-0">
                            #{idx + 1}
                          </span>
                          <CountryFlag
                            countryCode={item.country.code}
                            countryName={item.country.name}
                            fallbackEmoji={item.country.flag}
                            className="w-5 h-3.5 rounded-xs shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="text-xs font-extrabold text-white block truncate">
                              {item.country.name}
                            </span>
                            <span className="text-[10px] text-slate-300 block truncate">
                              {quizResultTab === 'matches' &&
                                `${item.matchPercent}% Match · $${item.monthlyCostUSD.toLocaleString()}/mo`}
                              {quizResultTab === 'visa' &&
                                `${item.visaLabel} · Min $${item.visaIncomeReqUSD.toLocaleString()}/mo`}
                              {quizResultTab === 'inflation' &&
                                `10-Yr Projected: $${item.inflation10YrLowUSD.toLocaleString()}–$${item.inflation10YrHighUSD.toLocaleString()}/mo`}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-teal-300 shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Instant Search Bar for Curated Havens */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={matcherSearch}
                  onChange={e => setMatcherSearch(e.target.value)}
                  placeholder="Instant country or city search (Portugal, Thailand, Bali)..."
                  className="w-full min-h-[44px] pl-10 pr-9 py-2 rounded-2xl bg-white border border-slate-200/90 text-xs font-semibold text-slate-900 placeholder:text-slate-400 shadow-2xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                    Curated {currentPersona === 'nomad' ? 'Nomad Hubs' : 'Retirement Havens'} ({matcherResults.length})
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
                      <CountryThumbnail country={country} className="h-36" hideLandmarkLabel>
                        <div className="absolute top-2.5 left-3 right-3 flex items-center justify-between gap-2">
                          <span className="px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-white text-[11px] font-black border border-white/15">
                            {matchPercent}% Match
                          </span>
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              toggleSaveCountry(country.id);
                            }}
                            className={`min-w-[36px] min-h-[36px] rounded-full flex items-center justify-center backdrop-blur-md border transition-all cursor-pointer ${
                              saved
                                ? 'bg-rose-600 text-white border-rose-400'
                                : 'bg-slate-950/60 text-white border-white/25'
                            }`}
                            aria-label={`Save ${country.name}`}
                          >
                            <Heart className={`w-4 h-4 ${saved ? 'fill-white' : ''}`} />
                          </button>
                        </div>

                        <div className="absolute bottom-2.5 left-3 right-3 flex items-end justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <CountryFlag
                              countryCode={country.code}
                              countryName={country.name}
                              fallbackEmoji={country.flag}
                              className="w-6 h-4 rounded-xs shadow-xs shrink-0 ring-1 ring-white/40"
                            />
                            <div className="min-w-0">
                              <h2 className="text-sm font-black text-white truncate drop-shadow-xs">
                                {country.name}
                              </h2>
                              <span className="text-[10px] font-semibold text-slate-200 block truncate">
                                {getCountryContinentLabel(country)} · {country.climate.category}
                              </span>
                            </div>
                          </div>
                          <span className="px-2.5 py-1 rounded-xl bg-amber-400 text-slate-950 font-mono font-black text-xs shrink-0 shadow-xs">
                            ${monthlyCost.toLocaleString()}/mo
                          </span>
                        </div>
                      </CountryThumbnail>

                      <div className="p-3 space-y-2">
                        <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                          <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/70">
                            <span className="text-[9px] text-slate-500 font-bold block">
                              {currentPersona === 'nomad' ? 'Fiber Speed' : 'Healthcare'}
                            </span>
                            <span className="font-mono font-extrabold text-slate-900">
                              {currentPersona === 'nomad'
                                ? `${nomadProfile.verifiedInternetMbps} Mbps`
                                : `${country.lifestyle.healthcareScore}/100`}
                            </span>
                          </div>
                          <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/70">
                            <span className="text-[9px] text-slate-500 font-bold block">Safety</span>
                            <span className="font-mono font-extrabold text-emerald-800">
                              {country.lifestyle.safetyScore}/100
                            </span>
                          </div>
                          <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/70">
                            <span className="text-[9px] text-slate-500 font-bold block">
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
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder={`Search all ${countries.length} countries...`}
                    className="w-full min-h-[44px] pl-10 pr-8 py-2 rounded-2xl bg-white border border-slate-200/90 text-xs font-semibold text-slate-900 placeholder:text-slate-400 shadow-2xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                  className="min-h-[44px] px-3.5 rounded-2xl bg-slate-900 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0 active:scale-95 transition-transform"
                >
                  <SlidersHorizontal className="w-4 h-4 text-amber-300" />
                  <span>Filters</span>
                </button>
              </div>

              {/* Horizontal Region Pill Carousel */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
                {CONTINENT_FILTER_OPTIONS.map(reg => (
                  <button
                    key={reg.value}
                    type="button"
                    onClick={() => setSelectedRegion(reg.value)}
                    className={`min-h-[34px] px-3 py-1 rounded-2xl text-xs font-extrabold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                      selectedRegion === reg.value
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'bg-white text-slate-700 border border-slate-200/90'
                    }`}
                  >
                    {reg.label}
                  </button>
                ))}
              </div>

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
                      <CountryThumbnail country={country} className="h-36" hideLandmarkLabel>
                        <div className="absolute top-2.5 left-3 right-3 flex items-center justify-between gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-950/75 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider border border-white/15">
                            {getCountryContinentLabel(country)}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation();
                                toggleCompareCountry(country.id);
                              }}
                              className={`min-h-[32px] px-2.5 rounded-full text-[10px] font-extrabold backdrop-blur-md border flex items-center gap-1 cursor-pointer ${
                                compared
                                  ? 'bg-indigo-600 text-white border-indigo-400'
                                  : 'bg-slate-950/60 text-white border-white/25'
                              }`}
                            >
                              <Scale className="w-3 h-3" />
                              <span>{compared ? 'Added' : 'Compare'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation();
                                toggleSaveCountry(country.id);
                              }}
                              className={`min-w-[34px] min-h-[34px] rounded-full flex items-center justify-center backdrop-blur-md border cursor-pointer ${
                                saved
                                  ? 'bg-rose-600 text-white border-rose-400'
                                  : 'bg-slate-950/60 text-white border-white/25'
                              }`}
                              aria-label={`Save ${country.name}`}
                            >
                              <Heart className={`w-3.5 h-3.5 ${saved ? 'fill-white' : ''}`} />
                            </button>
                          </div>
                        </div>

                        <div className="absolute bottom-2.5 left-3 right-3 flex items-end justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <CountryFlag
                              countryCode={country.code}
                              countryName={country.name}
                              fallbackEmoji={country.flag}
                              className="w-6 h-4 rounded-xs shadow-xs shrink-0 ring-1 ring-white/40"
                            />
                            <div className="min-w-0">
                              <h3 className="text-sm font-black text-white truncate drop-shadow-xs">
                                {country.name}
                              </h3>
                              <span className="text-[10px] font-medium text-slate-200 block truncate">
                                {country.capital} · {country.climate.category}
                              </span>
                            </div>
                          </div>
                          <span className="px-2.5 py-1 rounded-xl bg-emerald-400 text-slate-950 font-mono font-black text-xs block shrink-0">
                            ${currentPersona === 'nomad'
                              ? np.monthlyNomadBurnUSD.toLocaleString()
                              : country.costOfLiving.monthlyBudgetCoupleUSD.toLocaleString()}
                            /mo
                          </span>
                        </div>
                      </CountryThumbnail>

                      <div className="p-3 space-y-2">
                        <div className="grid grid-cols-3 gap-1.5 text-xs">
                          <div className="p-2 rounded-xl bg-emerald-50/70 border border-emerald-200/70">
                            <span className="text-[9px] font-bold text-emerald-800 block">
                              Single / Couple
                            </span>
                            <span className="font-mono font-extrabold text-emerald-950 text-[11px]">
                              ${country.costOfLiving.monthlyBudgetSingleUSD.toLocaleString()} / $
                              {country.costOfLiving.monthlyBudgetCoupleUSD.toLocaleString()}
                            </span>
                          </div>
                          <div className="p-2 rounded-xl bg-teal-50/70 border border-teal-200/70">
                            <span className="text-[9px] font-bold text-teal-800 block">
                              Nomad / Fiber
                            </span>
                            <span className="font-mono font-extrabold text-teal-950 text-[11px]">
                              ${np.monthlyNomadBurnUSD.toLocaleString()} · {np.verifiedInternetMbps}M
                            </span>
                          </div>
                          <div className="p-2 rounded-xl bg-indigo-50/70 border border-indigo-200/70">
                            <span className="text-[9px] font-bold text-indigo-800 block">
                              Health / Safety
                            </span>
                            <span className="font-mono font-extrabold text-indigo-950 text-[11px]">
                              {country.lifestyle.healthcareScore} / {country.lifestyle.safetyScore}
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
          {/* TAB 3: "FIRE" — SYNCED WITH WEBSITE FIRE CALCULATOR & FLAG PICKERS  */}
          {/* ------------------------------------------------------------------- */}
          {activeTab === 'fire' && (
            <div className="space-y-3.5 animate-in fade-in duration-150">
              {/* Top Mode Toggle & Summary Banner */}
              <div className="p-4 rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-600 text-white shadow-md space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/20 text-[10px] font-extrabold uppercase tracking-wider">
                    <Flame className="w-3.5 h-3.5 text-amber-200" />
                    <span>FIRE &amp; Geo-Arbitrage Engine</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleOpenAndroidShareableFireCard}
                    className="px-2.5 py-1 rounded-full bg-white text-slate-950 text-[10px] font-black shadow-2xs cursor-pointer flex items-center gap-1"
                  >
                    <span>🏅 Create Shareable FIRE Card</span>
                  </button>
                </div>

                {/* 3 Sub-Tabs matching Website FIRE page */}
                <div className="grid grid-cols-3 p-1 rounded-2xl bg-black/20 text-[11px] font-extrabold">
                  <button
                    type="button"
                    onClick={() => setFireMode('fire')}
                    className={`min-h-[36px] rounded-xl transition-all cursor-pointer ${
                      fireMode === 'fire' ? 'bg-white text-slate-950 shadow-xs' : 'text-white/90'
                    }`}
                  >
                    1. FIRE Calc
                  </button>
                  <button
                    type="button"
                    onClick={() => setFireMode('nomad')}
                    className={`min-h-[36px] rounded-xl transition-all cursor-pointer ${
                      fireMode === 'nomad' ? 'bg-white text-slate-950 shadow-xs' : 'text-white/90'
                    }`}
                  >
                    2. Nomad Runway
                  </button>
                  <button
                    type="button"
                    onClick={() => setFireMode('portfolio')}
                    className={`min-h-[36px] rounded-xl transition-all cursor-pointer ${
                      fireMode === 'portfolio' ? 'bg-white text-slate-950 shadow-xs' : 'text-white/90'
                    }`}
                  >
                    3. Portfolio
                  </button>
                </div>

                {/* Years to Financial Freedom & Work-Free Survival Area WITH COUNTRY FLAG */}
                <div className="p-3 rounded-2xl bg-black/25 backdrop-blur-xs space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-200">
                      Years to Financial Freedom &amp; Work-Free Survival
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/15 border border-white/25 text-[10px] font-extrabold text-white">
                      <CountryFlag
                        countryName={selectedTargetHaven}
                        countryCode={selectedTargetHavenObj?.code}
                        fallbackEmoji={selectedTargetHavenObj?.flag || '🌍'}
                        className="w-4 h-3 rounded-xs shrink-0"
                      />
                      <span>{selectedTargetHaven}</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2 rounded-xl bg-white/10">
                      <span className="text-[9px] uppercase font-bold text-amber-100 block">
                        FIRE in {selectedTargetHaven}
                      </span>
                      <span className="text-base font-black font-mono">
                        {fireYearsAbroad === 0 ? 'Ready!' : `${fireYearsAbroad} Yrs`}
                      </span>
                      <span className="text-[9px] text-amber-100 block">
                        ${fireTargetAbroadUSD.toLocaleString()}
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-white/10">
                      <span className="text-[9px] uppercase font-bold text-amber-100 block">
                        Stop Work Today
                      </span>
                      <span className="text-base font-black font-mono">
                        {survivalIfStopToday.perpetual
                          ? '50+ Yrs'
                          : `${survivalIfStopToday.years}y ${survivalIfStopToday.months}m`}
                      </span>
                      <span className="text-[9px] text-amber-100 block">
                        At {fireReturnRate}% return
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-white/10">
                      <span className="text-[9px] uppercase font-bold text-amber-100 block">
                        Time Saved
                      </span>
                      <span className="text-base font-black font-mono text-emerald-300">
                        {fireYearsSaved} Yrs
                      </span>
                      <span className="text-[9px] text-amber-100 block">
                        -${Math.round(fireCapitalSavedUSD / 1000)}k needed
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {fireToast && (
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-300 text-xs font-bold text-emerald-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{fireToast}</span>
                </div>
              )}

              {/* SUB-TAB 1: FIRE CALCULATOR */}
              {fireMode === 'fire' && (
                <div className="space-y-3">
                  {/* Searchable Country Flag Pickers: Current Residing Country & Target FIRE Haven Abroad */}
                  <div className="p-3.5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-2.5">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-extrabold uppercase text-slate-500 block mb-1">
                          Residing Country
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setCountryPickerSearch('');
                            setIsBasisPickerOpen(true);
                          }}
                          className="w-full min-h-[40px] px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-1.5 text-xs font-extrabold text-slate-900 cursor-pointer"
                        >
                          <span className="flex items-center gap-1.5 truncate">
                            <CountryFlag
                              countryName={selectedBasisCountry}
                              className="w-4 h-3 rounded-xs shrink-0"
                            />
                            <span className="truncate">{selectedBasisCountry}</span>
                          </span>
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        </button>
                      </div>

                      <div>
                        <label className="text-[10px] font-extrabold uppercase text-indigo-700 block mb-1">
                          Target FIRE Haven
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setCountryPickerSearch('');
                            setIsHavenPickerOpen(true);
                          }}
                          className="w-full min-h-[40px] px-2.5 py-1.5 rounded-xl bg-indigo-50/80 border border-indigo-200 flex items-center justify-between gap-1.5 text-xs font-extrabold text-indigo-950 cursor-pointer"
                        >
                          <span className="flex items-center gap-1.5 truncate">
                            <CountryFlag
                              countryName={selectedTargetHaven}
                              countryCode={selectedTargetHavenObj?.code}
                              fallbackEmoji={selectedTargetHavenObj?.flag}
                              className="w-4 h-3 rounded-xs shrink-0"
                            />
                            <span className="truncate">{selectedTargetHaven}</span>
                          </span>
                          <ChevronDown className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Thumb-Friendly Range Sliders Card */}
                  <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-3.5">
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-extrabold text-slate-800">Current Invested Assets</span>
                        <span className="font-mono font-black text-indigo-900 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-200">
                          ${fireNetWorth.toLocaleString()}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={10000}
                        max={1500000}
                        step={10000}
                        value={Math.min(1500000, fireNetWorth)}
                        onChange={e => setFireNetWorth(Number(e.target.value))}
                        className="w-full h-2 bg-indigo-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-extrabold text-slate-800">
                          Monthly Budget in {selectedTargetHaven}
                        </span>
                        <span className="font-mono font-black text-amber-950 bg-amber-100 px-2.5 py-0.5 rounded-lg border border-amber-300">
                          ${fireAbroadBudget.toLocaleString()}/mo
                        </span>
                      </div>
                      <input
                        type="range"
                        min={600}
                        max={6000}
                        step={100}
                        value={fireAbroadBudget}
                        onChange={e => setFireAbroadBudget(Number(e.target.value))}
                        className="w-full h-2 bg-amber-100 rounded-lg appearance-none cursor-pointer accent-orange-600"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-extrabold text-slate-800">
                          Domestic Cost in {selectedBasisCountry}
                        </span>
                        <span className="font-mono font-black text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-300">
                          ${fireDomesticCost.toLocaleString()}/mo
                        </span>
                      </div>
                      <input
                        type="range"
                        min={1000}
                        max={10000}
                        step={100}
                        value={fireDomesticCost}
                        onChange={e => setFireDomesticCost(Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-800"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-1">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px]">
                          <span className="font-bold text-slate-600">Savings/yr</span>
                          <span className="font-mono font-black text-emerald-800">
                            ${Math.round(fireAnnualSavings / 1000)}k
                          </span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={120000}
                          step={2000}
                          value={fireAnnualSavings}
                          onChange={e => setFireAnnualSavings(Number(e.target.value))}
                          className="w-full h-1.5 bg-emerald-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px]">
                          <span className="font-bold text-slate-600">Return %</span>
                          <span className="font-mono font-black text-indigo-800">
                            {fireReturnRate.toFixed(1)}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min={2.0}
                          max={14.0}
                          step={0.5}
                          value={fireReturnRate}
                          onChange={e => setFireReturnRate(Number(e.target.value))}
                          className="w-full h-1.5 bg-indigo-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px]">
                          <span className="font-bold text-slate-600">SWR %</span>
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
                          className="w-full h-1.5 bg-teal-100 rounded-lg appearance-none cursor-pointer accent-teal-600"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleSaveAndroidFirePlan}
                      className="w-full min-h-[42px] rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-teal-600 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Flame className="w-4 h-4 text-amber-300" />
                      <span>Calculate &amp; Sync FIRE Scenario</span>
                    </button>
                  </div>

                  {/* Readable 2-Paragraph Executive Scenario Summary (Synced with Website) */}
                  {showFireSummaryNarrative && (
                    <div className="p-3.5 rounded-3xl bg-gradient-to-br from-indigo-50/90 via-white to-teal-50/80 border border-indigo-200/90 space-y-2 text-xs text-slate-700 leading-relaxed">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Personalized FIRE Scenario Summary</span>
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-teal-800">
                          <CountryFlag
                            countryName={selectedTargetHaven}
                            countryCode={selectedTargetHavenObj?.code}
                            fallbackEmoji={selectedTargetHavenObj?.flag}
                            className="w-3.5 h-2.5 rounded-xs"
                          />
                          <span>{selectedTargetHaven}</span>
                        </span>
                      </div>
                      <p>
                        With <strong className="text-slate-900">${fireNetWorth.toLocaleString()}</strong> currently invested compounding at{' '}
                        <strong className="text-indigo-800">{fireReturnRate.toFixed(1)}%/yr</strong> plus{' '}
                        <strong className="text-slate-900">${Math.round(fireAnnualSavings / 12).toLocaleString()}/mo</strong> in new savings, your target FIRE nest egg for{' '}
                        <strong className="text-slate-900">{selectedTargetHaven}</strong> (${fireAbroadBudget.toLocaleString()}/mo at a {fireSwr.toFixed(1)}% SWR) is{' '}
                        <strong className="text-emerald-800">${fireTargetAbroadUSD.toLocaleString()}</strong> ({fireFundedPct}% funded)—reachable in{' '}
                        <strong className="text-indigo-900">
                          {fireYearsAbroad === 0 ? '0 years (Ready Today!)' : `${fireYearsAbroad} years`}
                        </strong>
                        .
                      </p>
                      <p>
                        Compared to retiring in <strong className="text-slate-900">{selectedBasisCountry}</strong> (${fireTargetHomeUSD.toLocaleString()} needed over {fireYearsHome} years), relocating to{' '}
                        <strong className="text-slate-900">{selectedTargetHaven}</strong> slashes your required capital by{' '}
                        <strong className="text-emerald-800">${fireCapitalSavedUSD.toLocaleString()}</strong> and accelerates your freedom by{' '}
                        <strong className="text-amber-800">{fireYearsSaved} years</strong>. If you stopped working today, your existing portfolio alone can sustain your {selectedTargetHaven} lifestyle for{' '}
                        <strong className="text-indigo-900">
                          {survivalIfStopToday.perpetual
                            ? '50+ years (perpetual)'
                            : `${survivalIfStopToday.years} years, ${survivalIfStopToday.months} months`}
                        </strong>
                        .
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* SUB-TAB 2: NOMAD RUNWAY */}
              {fireMode === 'nomad' && (
                <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="p-3 rounded-2xl bg-teal-50 border border-teal-200">
                      <span className="text-[10px] uppercase font-bold text-teal-800 block">
                        Calendar Runway
                      </span>
                      <span className="text-lg font-black font-mono text-teal-950">
                        {nomadNetMonthlyBurn === 0 ? '∞ Infinite' : `${nomadRunwayMonths} Mos`}
                      </span>
                    </div>
                    <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-200">
                      <span className="text-[10px] uppercase font-bold text-indigo-800 block">
                        6-Mo Buffer
                      </span>
                      <span className="text-lg font-black font-mono text-indigo-950">
                        ${(nomadNetMonthlyBurn * 6).toLocaleString()}
                      </span>
                    </div>
                  </div>

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
                      step={5000}
                      value={Math.min(1000000, Math.max(10000, nomadCash))}
                      onChange={e => setNomadCash(Number(e.target.value))}
                      className="w-full h-2 bg-teal-100 rounded-lg appearance-none cursor-pointer accent-teal-600"
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
                      className="w-full h-2 bg-amber-100 rounded-lg appearance-none cursor-pointer accent-orange-600"
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
                      className="w-full h-2 bg-indigo-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>
                </div>
              )}

              {/* SUB-TAB 3: 5-SCHEME PERSONAL ASSET PORTFOLIO */}
              {fireMode === 'portfolio' && (
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
                    {!isGuestUser && (
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
                      <p className="text-xs text-slate-600">
                        Sign in to customize and cloud-sync your 5-scheme investment breakdown across web and Android.
                      </p>
                      <button
                        type="button"
                        onClick={() => openAuthModal('signup')}
                        className="w-full min-h-[42px] rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-teal-600 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <UserPlus className="w-4 h-4 text-amber-300" />
                        <span>Sign Up Free to Unlock Portfolio</span>
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
                        className="w-full min-h-[42px] rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Save &amp; Sync Portfolio to Cloud</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ------------------------------------------------------------------- */}
          {/* TAB 4: "VISA CHECK" (BILATERAL PASSPORT & 209-HAVEN CHECKER)        */}
          {/* ------------------------------------------------------------------- */}
          {activeTab === 'visa-check' && (
            <div className="space-y-3.5 animate-in fade-in duration-150">
              <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-900 text-[10px] font-extrabold uppercase tracking-wider">
                    <Stamp className="w-3.5 h-3.5 text-teal-600" />
                    <span>Global Visa &amp; Passport Checker</span>
                  </span>
                  <span className="text-[11px] font-bold text-slate-500">
                    {globalVisaMatrix.length} Havens
                  </span>
                </div>

                {/* Custom Flag Pickers for Origin Passport & Destination Haven */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">
                      Origin Passport
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setVisaPickerSearch('');
                        setIsVisaOriginPickerOpen(true);
                      }}
                      className="w-full min-h-[40px] px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-1.5 text-xs font-extrabold text-slate-900 cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5 truncate">
                        <CountryFlag
                          countryCode={selectedOriginVisaCountry.code}
                          countryName={selectedOriginVisaCountry.name}
                          fallbackEmoji={selectedOriginVisaCountry.flag}
                          className="w-4 h-3 rounded-xs shrink-0"
                        />
                        <span className="truncate">{selectedOriginVisaCountry.name}</span>
                      </span>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    </button>
                  </div>

                  <div>
                    <label className="text-[10px] font-extrabold text-teal-800 uppercase block mb-1">
                      Destination Haven
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setVisaPickerSearch('');
                        setIsVisaDestPickerOpen(true);
                      }}
                      className="w-full min-h-[40px] px-2.5 py-1.5 rounded-xl bg-teal-50/70 border border-teal-200 flex items-center justify-between gap-1.5 text-xs font-extrabold text-teal-950 cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5 truncate">
                        <CountryFlag
                          countryCode={selectedDestVisaCountry.code}
                          countryName={selectedDestVisaCountry.name}
                          fallbackEmoji={selectedDestVisaCountry.flag}
                          className="w-4 h-3 rounded-xs shrink-0"
                        />
                        <span className="truncate">{selectedDestVisaCountry.name}</span>
                      </span>
                      <ChevronDown className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    </button>
                  </div>
                </div>

                {/* Passport Booklet Class Carousel */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                  {availablePassportTypes.map(pt => (
                    <button
                      key={pt.id}
                      type="button"
                      onClick={() => setVisaPassportTypeId(pt.id)}
                      className={`min-h-[32px] px-2.5 py-1 rounded-xl text-[11px] font-extrabold whitespace-nowrap shrink-0 cursor-pointer ${
                        visaPassportTypeId === pt.id
                          ? 'bg-slate-900 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {pt.label}
                    </button>
                  ))}
                </div>

                {/* Held Third-Country Visa Unlocks Carousel */}
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase block">
                    Held Visas (Tap to Unlock Extra Visa-Free Entry)
                  </span>
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                    {HELD_VISA_OPTIONS.map(hv => {
                      const active = visaHeldVisas.includes(hv.id);
                      return (
                        <button
                          key={hv.id}
                          type="button"
                          onClick={() => toggleHeldVisa(hv.id)}
                          className={`min-h-[32px] px-2.5 py-1 rounded-xl text-[11px] font-extrabold whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1 ${
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
                  <span className="text-xs font-extrabold text-teal-200 flex items-center gap-1.5">
                    <CountryFlag
                      countryCode={directVisaResult.origin.code}
                      countryName={directVisaResult.origin.name}
                      fallbackEmoji={directVisaResult.origin.flag}
                      className="w-4 h-3 rounded-xs"
                    />
                    <span>{directVisaResult.origin.name}</span>
                    <span>→</span>
                    <CountryFlag
                      countryCode={directVisaResult.destination.code}
                      countryName={directVisaResult.destination.name}
                      fallbackEmoji={directVisaResult.destination.flag}
                      className="w-4 h-3 rounded-xs"
                    />
                    <span>{directVisaResult.destination.name}</span>
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                      getVisaBadgeStyle(directVisaResult.status).bg
                    }`}
                  >
                    {getVisaBadgeStyle(directVisaResult.status).label}
                  </span>
                </div>
                <h2 className="text-sm font-black leading-snug">{directVisaResult.headline}</h2>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded-xl bg-white/10">
                    <span className="text-slate-300 text-[9px] block">Max Stay</span>
                    <span className="font-mono font-bold text-white">{directVisaResult.maxStay}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white/10">
                    <span className="text-slate-300 text-[9px] block">Entry Method</span>
                    <span className="font-bold text-amber-300">{directVisaResult.entryMethod}</span>
                  </div>
                </div>
                <div className="pt-0.5 flex items-center justify-between gap-2">
                  <a
                    href={directVisaResult.officialPortal.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-extrabold text-teal-300 underline inline-flex items-center gap-1"
                  >
                    <span>Official Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  {directVisaResult.refirelyCountryId && (
                    <button
                      type="button"
                      onClick={() => {
                        const found = countries.find(c => c.id === directVisaResult.refirelyCountryId);
                        if (found) openCountryDossierSheet(found);
                      }}
                      className="px-3 py-1 rounded-xl bg-white text-slate-950 text-[11px] font-extrabold cursor-pointer"
                    >
                      Open Dossier →
                    </button>
                  )}
                </div>
              </div>

              {/* Filter Pills + Search */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                {[
                  { id: 'all', label: `All (${globalVisaMatrix.length})` },
                  { id: 'visa-free', label: `✅ Visa-Free (${visaSummaryCounts.visaFree})` },
                  { id: 'evisa-voa', label: `⚡ e-Visa/VoA (${visaSummaryCounts.eVisaVoa})` },
                  { id: 'required', label: `🏛️ Required (${visaSummaryCounts.required})` },
                ].map(f => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setVisaStatusFilter(f.id as any)}
                    className={`min-h-[34px] px-3 py-1 rounded-2xl text-xs font-extrabold whitespace-nowrap shrink-0 cursor-pointer ${
                      visaStatusFilter === f.id
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'bg-white text-slate-700 border border-slate-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={visaSearchFilter}
                  onChange={e => setVisaSearchFilter(e.target.value)}
                  placeholder="Filter destinations by country name..."
                  className="w-full min-h-[42px] pl-10 pr-8 py-2 rounded-2xl bg-white border border-slate-200 text-xs font-semibold"
                />
              </div>

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
                      className="p-3 rounded-2xl bg-white border border-slate-200/90 flex items-center justify-between gap-2.5 shadow-2xs cursor-pointer active:bg-slate-50"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <CountryFlag
                          countryCode={item.destination.code}
                          countryName={item.destination.name}
                          fallbackEmoji={item.destination.flag}
                          className="w-6 h-4 rounded-xs shrink-0"
                        />
                        <div className="min-w-0">
                          <h3 className="text-xs font-extrabold text-slate-900 truncate">
                            {item.destination.name}
                          </h3>
                          <span className="text-[10px] text-slate-500 block truncate">
                            {item.maxStay} · {item.shortNote}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-xl text-[10px] font-extrabold border shrink-0 ${badge.bg}`}
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
            <div className="space-y-3.5 animate-in fade-in duration-150">
              <div className="p-4 rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-teal-950 text-white shadow-md space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {!isGuestUser && userProfile.avatarUrl ? (
                      <img
                        src={userProfile.avatarUrl}
                        alt={userProfile.name}
                        className="w-11 h-11 rounded-2xl object-cover ring-2 ring-amber-400/60 shrink-0"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 font-black text-base flex items-center justify-center shrink-0">
                        {isGuestUser ? 'G' : (userProfile.name || 'M').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <h1 className="text-sm font-black truncate">
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
                      className="min-h-[36px] px-3 rounded-xl bg-amber-400 text-slate-950 text-xs font-black shrink-0 cursor-pointer"
                    >
                      Sign In
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => openEditProfile('about')}
                      className="min-h-[36px] px-3 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-bold shrink-0 cursor-pointer"
                    >
                      Edit
                    </button>
                  )}
                </div>

                {/* Shareable FIRE Freedom Card Trigger */}
                <div className="p-3 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300 block">
                      Personal Freedom Card
                    </span>
                    <span className="text-xs font-black text-white">
                      {unifiedMetrics.fireProgressPercent}% FI Ready · Target {selectedTargetHaven}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenAndroidShareableFireCard}
                    className="min-h-[36px] px-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 text-xs font-black shrink-0 cursor-pointer flex items-center gap-1"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share Card</span>
                  </button>
                </div>
              </div>

              {/* Saved Havens Portfolio */}
              <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-2.5">
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
                  <p className="text-xs text-slate-500 py-1">
                    Tap the heart icon on any country card to save it to your relocation shortlist.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {savedCountriesList.map(c => (
                      <div
                        key={c.id}
                        onClick={() => openCountryDossierSheet(c)}
                        className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center justify-between gap-2.5 cursor-pointer active:bg-slate-100"
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
                            <span className="text-[10px] text-slate-500 block truncate">
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
              <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-2.5">
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
                  <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-slate-700 flex items-center justify-between gap-2">
                    <span>
                      {isGuestUser
                        ? 'Sign in to unlock verified Expat Badges.'
                        : 'Log visited countries or languages to earn badges!'}
                    </span>
                    <button
                      type="button"
                      onClick={() => (isGuestUser ? openAuthModal('signup') : openEditProfile('travel'))}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-extrabold text-xs shrink-0 cursor-pointer"
                    >
                      {isGuestUser ? 'Sign Up' : 'Log Trips'}
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
                  <div className="space-y-1.5 pt-0.5">
                    {badgesProgress
                      .filter(p => !p.badge.comingSoon && p.nextTier)
                      .slice(0, 2)
                      .map(p => (
                        <div
                          key={p.badge.id}
                          className="p-2 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1"
                        >
                          <div className="flex justify-between text-[10px] font-bold">
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
              <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                    Relocation Milestone Checklist
                  </h2>
                  <span className="text-xs font-mono font-bold text-emerald-700">
                    {checklist.filter(t => t.completed).length}/{checklist.length} Done
                  </span>
                </div>
                <div className="space-y-1.5">
                  {checklist.slice(0, 5).map(task => (
                    <button
                      key={task.id}
                      type="button"
                      onClick={() => toggleChecklistTask(task.id)}
                      className={`w-full p-2.5 rounded-2xl border text-left flex items-center gap-2.5 cursor-pointer transition-colors ${
                        task.completed
                          ? 'bg-emerald-50/50 border-emerald-200 text-slate-500 line-through'
                          : 'bg-slate-50 border-slate-200/90 text-slate-900'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                          task.completed
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'bg-white border-slate-300'
                        }`}
                      >
                        {task.completed && <Check className="w-3 h-3" />}
                      </div>
                      <span className="text-xs font-bold truncate">{task.title}</span>
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
          className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[460px] z-40 h-16 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 grid grid-cols-5 items-center px-1 shadow-lg"
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
        {/* 4. NATIVE BOTTOM-SHEET MODAL: SEARCHABLE COUNTRY FLAG PICKER          */}
        {/* ===================================================================== */}
        <AnimatePresence>
          {(isBasisPickerOpen || isHavenPickerOpen || isVisaOriginPickerOpen || isVisaDestPickerOpen) && (
            <div className="fixed inset-0 z-50 flex flex-col justify-end">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => {
                  setIsBasisPickerOpen(false);
                  setIsHavenPickerOpen(false);
                  setIsVisaOriginPickerOpen(false);
                  setIsVisaDestPickerOpen(false);
                }}
                className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
              />
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                className="relative z-10 w-full max-w-[460px] mx-auto bg-white rounded-t-3xl border-t border-slate-200 shadow-2xl max-h-[80vh] flex flex-col overflow-hidden"
              >
                <div className="w-10 h-1.5 bg-slate-300 rounded-full mx-auto my-2.5 shrink-0" />
                <div className="px-4 pb-3 border-b border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-slate-900">
                      {isBasisPickerOpen && 'Select Residing Country'}
                      {isHavenPickerOpen && 'Select Target FIRE Haven Abroad'}
                      {isVisaOriginPickerOpen && 'Select Origin Passport'}
                      {isVisaDestPickerOpen && 'Select Destination Haven'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setIsBasisPickerOpen(false);
                        setIsHavenPickerOpen(false);
                        setIsVisaOriginPickerOpen(false);
                        setIsVisaDestPickerOpen(false);
                      }}
                      className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={isBasisPickerOpen || isHavenPickerOpen ? countryPickerSearch : visaPickerSearch}
                      onChange={e =>
                        isBasisPickerOpen || isHavenPickerOpen
                          ? setCountryPickerSearch(e.target.value)
                          : setVisaPickerSearch(e.target.value)
                      }
                      placeholder="Search country..."
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold"
                    />
                  </div>
                </div>

                <div className="p-3 overflow-y-auto space-y-1">
                  {isBasisPickerOpen &&
                    WORLD_COUNTRIES.filter(c =>
                      c.name.toLowerCase().includes(countryPickerSearch.trim().toLowerCase())
                    ).map(cObj => (
                      <button
                        key={cObj.name}
                        type="button"
                        onClick={() => {
                          setSelectedBasisCountry(cObj.name);
                          setIsBasisPickerOpen(false);
                          if (!isGuestUser) updateUserProfile({ residingCountry: cObj.name });
                        }}
                        className={`w-full px-3 py-2.5 rounded-xl flex items-center justify-between text-xs font-bold cursor-pointer ${
                          selectedBasisCountry === cObj.name
                            ? 'bg-indigo-600 text-white'
                            : 'hover:bg-slate-100 text-slate-800'
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          <CountryFlag
                            countryName={cObj.name}
                            fallbackEmoji={cObj.flag}
                            className="w-5 h-3.5 rounded-xs"
                          />
                          <span>{cObj.name}</span>
                        </span>
                        {selectedBasisCountry === cObj.name && <Check className="w-4 h-4" />}
                      </button>
                    ))}

                  {isHavenPickerOpen &&
                    [...countries]
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .filter(c =>
                        c.name.toLowerCase().includes(countryPickerSearch.trim().toLowerCase())
                      )
                      .map(c => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => handleSelectTargetHaven(c.name)}
                          className={`w-full px-3 py-2.5 rounded-xl flex items-center justify-between text-xs font-bold cursor-pointer ${
                            selectedTargetHaven.toLowerCase() === c.name.toLowerCase()
                              ? 'bg-indigo-600 text-white'
                              : 'hover:bg-slate-100 text-slate-800'
                          }`}
                        >
                          <span className="flex items-center gap-2.5">
                            <CountryFlag
                              countryCode={c.code}
                              countryName={c.name}
                              fallbackEmoji={c.flag}
                              className="w-5 h-3.5 rounded-xs"
                            />
                            <span>{c.name}</span>
                          </span>
                          <span className="font-mono text-[11px] opacity-85">
                            ${c.costOfLiving.monthlyBudgetCoupleUSD.toLocaleString()}/mo
                          </span>
                        </button>
                      ))}

                  {(isVisaOriginPickerOpen || isVisaDestPickerOpen) &&
                    VISA_WORLD_COUNTRIES.filter(c =>
                      c.name.toLowerCase().includes(visaPickerSearch.trim().toLowerCase())
                    ).map(c => {
                      const isSel = isVisaOriginPickerOpen
                        ? visaOriginCode === c.code
                        : visaDestCode === c.code;
                      return (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => {
                            if (isVisaOriginPickerOpen) setVisaOriginCode(c.code);
                            if (isVisaDestPickerOpen) setVisaDestCode(c.code);
                            setIsVisaOriginPickerOpen(false);
                            setIsVisaDestPickerOpen(false);
                          }}
                          className={`w-full px-3 py-2.5 rounded-xl flex items-center justify-between text-xs font-bold cursor-pointer ${
                            isSel ? 'bg-teal-600 text-white' : 'hover:bg-slate-100 text-slate-800'
                          }`}
                        >
                          <span className="flex items-center gap-2.5">
                            <CountryFlag
                              countryCode={c.code}
                              countryName={c.name}
                              fallbackEmoji={c.flag}
                              className="w-5 h-3.5 rounded-xs"
                            />
                            <span>{c.name}</span>
                          </span>
                          <span className="text-[10px] font-mono opacity-75">{c.code}</span>
                        </button>
                      );
                    })}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ===================================================================== */}
        {/* 5. NATIVE BOTTOM-SHEET MODAL: EXPLORE FILTERS                         */}
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
                className="relative z-10 w-full max-w-[460px] mx-auto bg-white rounded-t-3xl border-t border-slate-200 shadow-2xl max-h-[82vh] flex flex-col overflow-hidden"
              >
                <div className="w-10 h-1.5 bg-slate-300 rounded-full mx-auto my-2.5 shrink-0" />
                <div className="px-5 pb-3 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="text-sm font-black text-slate-900">
                    Filter &amp; Sort {countries.length} Havens
                  </h2>
                  <button
                    type="button"
                    onClick={() => setIsFilterSheetOpen(false)}
                    className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-5 overflow-y-auto space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="font-extrabold text-slate-800 uppercase tracking-wider block">
                      Sort Havens By
                    </label>
                    <select
                      value={sortBy}
                      onChange={e => setSortBy(e.target.value as SortByType)}
                      className="w-full min-h-[42px] px-3 py-2 rounded-2xl bg-slate-50 border border-slate-300 font-bold text-slate-900"
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

                  <div className="space-y-1.5">
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
                      className="w-full h-2 bg-indigo-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <span className="font-extrabold text-slate-800 uppercase tracking-wider block">
                      Preferred Climate
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {CLIMATE_PILLS.map(clim => (
                        <button
                          key={clim}
                          type="button"
                          onClick={() => setSelectedClimate(clim)}
                          className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer ${
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
                    className="min-h-[42px] rounded-2xl bg-white border border-slate-300 text-xs font-extrabold text-slate-700 cursor-pointer"
                  >
                    Reset All
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsFilterSheetOpen(false)}
                    className="min-h-[42px] rounded-2xl bg-indigo-600 text-white text-xs font-extrabold cursor-pointer"
                  >
                    Show {filteredCountries.length} Havens
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ===================================================================== */}
        {/* 6. NATIVE BOTTOM-SHEET MODAL: COUNTRY DOSSIER                         */}
        {/* ===================================================================== */}
        <AnimatePresence>
          {dossierCountry && (
            <div className="fixed inset-0 z-50 flex flex-col justify-end">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setDossierCountry(null)}
                className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs"
              />
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                className="relative z-10 w-full max-w-[460px] mx-auto bg-white rounded-t-3xl shadow-2xl h-[90vh] flex flex-col overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-2 bg-white shrink-0">
                  <button
                    type="button"
                    onClick={() => setDossierCountry(null)}
                    className="min-h-[36px] px-2.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-extrabold flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Close</span>
                  </button>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <CountryFlag
                      countryCode={dossierCountry.code}
                      countryName={dossierCountry.name}
                      fallbackEmoji={dossierCountry.flag}
                      className="w-5 h-3.5 rounded-xs shrink-0"
                    />
                    <span className="text-xs font-black text-slate-900 truncate">
                      {dossierCountry.name} Dossier
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      generateCountryDossierPdf({
                        country: dossierCountry,
                        userProfile,
                        isAuthenticated: !isGuestUser,
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
                          includeDiscreetNightlife: false,
                          includeRelocationFaqs: true,
                          includeCommunityAndMeetups: true,
                        },
                      });
                      trackDossierDownload(dossierCountry.id, dossierCountry.name);
                    }}
                    className="min-h-[36px] px-2.5 rounded-xl bg-indigo-50 text-indigo-800 border border-indigo-200 text-[11px] font-extrabold flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>PDF</span>
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {showFull11TabDossier ? (
                    <CountryDossier country={dossierCountry} />
                  ) : (
                    <div className="p-4 space-y-4">
                      <CountryThumbnail country={dossierCountry} className="h-44 rounded-3xl" hideLandmarkLabel>
                        <div className="absolute bottom-3 left-3.5 right-3.5 flex items-end justify-between">
                          <div>
                            <h2 className="text-lg font-black text-white">{dossierCountry.name}</h2>
                            <span className="text-xs text-slate-200">
                              {dossierCountry.capital} · {dossierCountry.climate.category}
                            </span>
                          </div>
                          <span className="px-3 py-1 rounded-xl bg-amber-400 text-slate-950 font-mono font-black text-xs">
                            ${dossierCountry.costOfLiving.monthlyBudgetCoupleUSD.toLocaleString()}/mo
                          </span>
                        </div>
                      </CountryThumbnail>

                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200">
                          <span className="text-[10px] font-bold text-slate-500 block">Single</span>
                          <span className="font-mono font-black text-xs text-slate-900">
                            ${dossierCountry.costOfLiving.monthlyBudgetSingleUSD.toLocaleString()}/mo
                          </span>
                        </div>
                        <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200">
                          <span className="text-[10px] font-bold text-slate-500 block">Healthcare</span>
                          <span className="font-mono font-black text-xs text-indigo-800">
                            {dossierCountry.lifestyle.healthcareScore}/100
                          </span>
                        </div>
                        <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200">
                          <span className="text-[10px] font-bold text-slate-500 block">Safety</span>
                          <span className="font-mono font-black text-xs text-emerald-800">
                            {dossierCountry.lifestyle.safetyScore}/100
                          </span>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-600 font-bold">Retirement Visa</span>
                          <span className="font-extrabold text-indigo-950">
                            {dossierCountry.visa.retirementVisaName}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600 font-bold">Min Passive Income</span>
                          <span className="font-mono font-extrabold text-slate-900">
                            ${dossierCountry.visa.minimumIncomeUSD.toLocaleString()}/mo
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600 font-bold">Tax Profile</span>
                          <span className="font-extrabold text-emerald-800 truncate max-w-[180px]">
                            {dossierCountry.visa.taxStatus}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={() => {
                            handleSelectTargetHaven(dossierCountry.name);
                            setDossierCountry(null);
                            handleSelectTab('fire');
                          }}
                          className="min-h-[44px] rounded-2xl bg-amber-500 text-slate-950 text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Flame className="w-4 h-4" />
                          <span>Model FIRE Here</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowFull11TabDossier(true)}
                          className="min-h-[44px] rounded-2xl bg-slate-900 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <span>Full 11-Tab Dossier →</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ===================================================================== */}
        {/* 7. NATIVE BOTTOM-SHEET MODAL: PROFILE & ACCOUNT                       */}
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
                className="relative z-10 w-full max-w-[460px] mx-auto bg-white rounded-t-3xl border-t border-slate-200 shadow-2xl p-5 space-y-4"
              >
                <div className="w-10 h-1.5 bg-slate-300 rounded-full mx-auto -mt-2 mb-1" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-teal-600 text-white font-black text-sm flex items-center justify-center">
                      {isGuestUser ? 'G' : (userProfile.name || 'M').charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-sm font-black text-slate-900 truncate">
                        {isGuestUser ? 'Guest Explorer' : userProfile.name}
                      </h2>
                      <span className="text-xs text-slate-500 block truncate">
                        {isGuestUser ? 'Not signed in' : `Target: ${userProfile.targetCountry}`}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsProfileSheetOpen(false)}
                    className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 cursor-pointer"
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
                      className="min-h-[44px] rounded-2xl bg-slate-100 text-slate-900 text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer"
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
                      className="min-h-[44px] rounded-2xl bg-gradient-to-r from-indigo-600 to-teal-600 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Sign Up Free</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileSheetOpen(false);
                        openEditProfile('about');
                      }}
                      className="min-h-[42px] rounded-2xl bg-slate-100 text-slate-900 text-xs font-extrabold cursor-pointer"
                    >
                      Edit Profile
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileSheetOpen(false);
                        logout();
                      }}
                      className="min-h-[42px] rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
