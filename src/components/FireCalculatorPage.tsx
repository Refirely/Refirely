import React, { useState, useMemo, useEffect } from 'react';
import { motion, MotionConfig } from 'motion/react';
import { useApp } from '../context/AppContext';
import { CountryThumbnail } from './CountryThumbnail';
import { CountryFlag } from './CountryFlag';
import { getCountryTravelLeisureScore } from '../data/countryTravelMobility';
import { getCountryContinentLabel } from '../utils/continents';
import { getCountryNomadProfile } from '../data/countryNomadProfiles';
import { GlobalHavenFeasibilityWidget } from './GlobalHavenFeasibilityWidget';
import { NomadHavenRunwayWidget } from './NomadHavenRunwayWidget';
import { FireProgressChart, FireTrajectoryPoint } from './FireProgressChart';
import { CurrencyAmountInput } from './CurrencyAmountInput';
import {
  DEFAULT_FINANCIAL_PORTFOLIO,
  WORLD_COUNTRIES,
  getWorldCountryFlag,
  getCountryCurrencyMacro,
  formatLocalCurrency,
  formatDualCurrency,
} from '../data/userAccounts';
import {
  UserFinancialPortfolio,
  UserLoanItem,
  SideIncomeStream,
  FutureMilestoneExpense,
} from '../types';
import {
  Sparkles,
  Flame,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  LogIn,
  UserPlus,
  Wallet,
  Zap,
  Laptop,
  Globe,
  Stamp,
  Scale,
  HelpCircle,
  Lock,
  Unlock,
  BarChart3,
  Landmark,
  Briefcase,
  GraduationCap,
  Plus,
  Trash2,
  RefreshCw,
  Award,
  TrendingUp,
  Clock,
  Calendar,
  AlertTriangle,
  Check,
  PiggyBank,
} from 'lucide-react';

type FireTierMode = 'lean' | 'standard' | 'fat' | 'barista';

interface FireCalculatorPageProps {
  isEmbeddedInDashboard?: boolean;
}

export const FireCalculatorPage: React.FC<FireCalculatorPageProps> = ({
  isEmbeddedInDashboard = false,
}) => {
  const {
    countries,
    navigateToCountry,
    setCurrentView,
    openAuthModal,
    isAuthenticated,
    currentUserId,
    setSelectedRegion,
    setSelectedClimate,
    setSearchQuery,
    setSortBy,
    currentPersona,
    openShareFireCardModal,
    userProfile,
    updateUserProfile,
  } = useApp();

  const isGuestUser = !isAuthenticated || currentUserId === 'guest';
  const currentYear = 2026;

  // Merge user finances with default FIRE fields
  const finances: UserFinancialPortfolio = useMemo(() => {
    const base = userProfile.finances || DEFAULT_FINANCIAL_PORTFOLIO;
    return {
      ...DEFAULT_FINANCIAL_PORTFOLIO,
      ...base,
      investments: {
        ...DEFAULT_FINANCIAL_PORTFOLIO.investments,
        ...(base.investments || {}),
      },
      loans: base.loans || DEFAULT_FINANCIAL_PORTFOLIO.loans || [],
      sideIncomes: base.sideIncomes || DEFAULT_FINANCIAL_PORTFOLIO.sideIncomes || [],
      futureExpenses: base.futureExpenses || DEFAULT_FINANCIAL_PORTFOLIO.futureExpenses || [],
    };
  }, [userProfile.finances]);

  const residingCountryName =
    userProfile.residingCountry || userProfile.originCountry || 'United States';
  const targetHavenCountryName = userProfile.targetCountry || 'Portugal';

  const [selectedBasisCountry, setSelectedBasisCountry] = useState<string>(residingCountryName);
  const [selectedTargetHaven, setSelectedTargetHaven] = useState<string>(targetHavenCountryName);
  const [fireTier, setFireTier] = useState<FireTierMode>('standard');
  const [inputCurrencyMode, setInputCurrencyMode] = useState<'USD' | 'LOCAL'>('USD');

  const countryMacro = useMemo(() => {
    return getCountryCurrencyMacro(selectedBasisCountry);
  }, [selectedBasisCountry]);

  // -------------------------------------------------------------
  // 1. Unified Core FIRE Calculator State (Zero Redundant Fields)
  // -------------------------------------------------------------
  const initialLoggedNetWorth = useMemo(() => {
    const inv = finances.investments;
    const total =
      (inv.savingsUSD || 0) +
      (inv.stocksMutualFundsUSD || 0) +
      (finances.includePrimaryHomeInFire ? inv.realEstateUSD || 0 : 0) +
      (finances.includeGoldInFire !== false ? inv.goldUSD || 0 : 0) +
      (inv.othersUSD || 0);
    return total > 0 ? Math.round(total) : 250000;
  }, [finances]);

  // Core Parameters (Available to both Guests & Logged-In Users)
  const [currentNetWorth, setCurrentNetWorth] = useState<number>(() =>
    isGuestUser ? 250000 : initialLoggedNetWorth
  );
  const [targetMonthlyExpenseAbroad, setTargetMonthlyExpenseAbroad] = useState<number>(() =>
    isGuestUser
      ? 2400
      : Math.round(
          finances.monthlyRetirementExpensesUSD || userProfile.monthlyBudgetUSD || 2400
        )
  );
  const [domesticMonthlyExpense, setDomesticMonthlyExpense] = useState<number>(() =>
    isGuestUser ? 4800 : Math.round(finances.monthlyCurrentExpensesUSD || 4800)
  );
  const [annualSavings, setAnnualSavings] = useState<number>(() =>
    isGuestUser ? 25000 : Math.round((finances.monthlySipUSD ?? 2100) * 12)
  );
  const [safeWithdrawalRate, setSafeWithdrawalRate] = useState<number>(() =>
    finances.safeWithdrawalRatePercent || 4.0
  );
  const [expectedGrowthRate, setExpectedGrowthRate] = useState<number>(() =>
    finances.expectedReturnRatePercent || 7.0
  );
  const [inflationPct, setInflationPct] = useState<number>(() =>
    finances.inflationRatePercent || 3.0
  );

  // Personal & Financial Portfolio Parameters (Locked Preview for Guests, Editable for Logged-In)
  const [currentAge, setCurrentAge] = useState<number>(() => finances.currentAge || 38);
  const [targetFireAge, setTargetFireAge] = useState<number>(() => finances.targetFireAge || 48);
  const [monthlySalaryUSD, setMonthlySalaryUSD] = useState<number>(() =>
    finances.monthlySalaryUSD ?? Math.round((finances.currentSalaryUSD ?? 120000) / 12)
  );
  const [sipStepUpPct, setSipStepUpPct] = useState<number>(() =>
    finances.annualSipStepUpPercent ?? 5
  );
  const [sipContinuityMode, setSipContinuityMode] = useState<
    'until-fire' | 'custom-years' | 'paused'
  >(finances.sipContinuityMode || 'until-fire');
  const [sipDurationYears, setSipDurationYears] = useState<number>(
    finances.sipDurationYears || 7
  );
  const [stopSipAtFire, setStopSipAtFire] = useState<boolean>(finances.stopSipAtFire ?? true);
  const [selectedSipReturnsHorizon, setSelectedSipReturnsHorizon] = useState<
    'fire' | '3' | '5' | '10' | 'custom'
  >('fire');

  // Survival & Digital Nomad Bridge Parameters
  const [expectedNomadMonthlyIncomeUSD, setExpectedNomadMonthlyIncomeUSD] = useState<number>(
    finances.expectedNomadMonthlyIncomeUSD ?? 1800
  );
  const [nomadIncomeActiveYears, setNomadIncomeActiveYears] = useState<number>(
    finances.nomadIncomeActiveYears ?? 8
  );
  const [plannedSabbaticalYears, setPlannedSabbaticalYears] = useState<number>(
    finances.plannedSabbaticalYears ?? 3
  );
  const [showSurvivalTimelineTable, setShowSurvivalTimelineTable] = useState<boolean>(false);
  const [showFormulaAudit, setShowFormulaAudit] = useState<boolean>(false);

  // 5-Scheme Assets, Loans, Passive Incomes & Future Milestones
  const [investmentsDraft, setInvestmentsDraft] = useState<
    UserFinancialPortfolio['investments']
  >({
    savingsUSD: finances.investments.savingsUSD || 35000,
    stocksMutualFundsUSD: finances.investments.stocksMutualFundsUSD || 165000,
    realEstateUSD: finances.investments.realEstateUSD || 0,
    goldUSD: finances.investments.goldUSD || 25000,
    othersUSD: finances.investments.othersUSD || 25000,
  });
  const [includePrimaryHome, setIncludePrimaryHome] = useState<boolean>(
    Boolean(finances.includePrimaryHomeInFire)
  );
  const [includeGold, setIncludeGold] = useState<boolean>(finances.includeGoldInFire ?? true);
  const [loansList, setLoansList] = useState<UserLoanItem[]>(() => finances.loans || []);
  const [sideIncomesList, setSideIncomesList] = useState<SideIncomeStream[]>(
    () => finances.sideIncomes || []
  );
  const [futureGoalsList, setFutureGoalsList] = useState<FutureMilestoneExpense[]>(
    () => finances.futureExpenses || []
  );

  // Sync when user logs in / switches account
  useEffect(() => {
    if (!isGuestUser) {
      setInvestmentsDraft({
        savingsUSD: finances.investments.savingsUSD || 0,
        stocksMutualFundsUSD: finances.investments.stocksMutualFundsUSD || 0,
        realEstateUSD: finances.investments.realEstateUSD || 0,
        goldUSD: finances.investments.goldUSD || 0,
        othersUSD: finances.investments.othersUSD || 0,
      });
      setIncludePrimaryHome(Boolean(finances.includePrimaryHomeInFire));
      setIncludeGold(finances.includeGoldInFire ?? true);
      setLoansList(finances.loans || []);
      setSideIncomesList(finances.sideIncomes || []);
      setFutureGoalsList(finances.futureExpenses || []);
      const schemeSum =
        (finances.investments.savingsUSD || 0) +
        (finances.investments.stocksMutualFundsUSD || 0) +
        (finances.includePrimaryHomeInFire ? finances.investments.realEstateUSD || 0 : 0) +
        (finances.includeGoldInFire !== false ? finances.investments.goldUSD || 0 : 0) +
        (finances.investments.othersUSD || 0);
      if (schemeSum > 0) {
        setCurrentNetWorth(Math.round(schemeSum));
      }
      if (finances.monthlyRetirementExpensesUSD || userProfile.monthlyBudgetUSD) {
        setTargetMonthlyExpenseAbroad(
          Math.round(
            finances.monthlyRetirementExpensesUSD || userProfile.monthlyBudgetUSD || 2400
          )
        );
      }
      if (finances.monthlyCurrentExpensesUSD) {
        setDomesticMonthlyExpense(Math.round(finances.monthlyCurrentExpensesUSD));
      }
      if (finances.monthlySipUSD !== undefined) {
        setAnnualSavings(Math.round(finances.monthlySipUSD * 12));
      }
      if (finances.safeWithdrawalRatePercent) {
        setSafeWithdrawalRate(finances.safeWithdrawalRatePercent);
      }
      if (finances.expectedReturnRatePercent) {
        setExpectedGrowthRate(finances.expectedReturnRatePercent);
      }
      if (finances.inflationRatePercent) {
        setInflationPct(finances.inflationRatePercent);
      }
      if (finances.currentAge) setCurrentAge(finances.currentAge);
      if (finances.targetFireAge) setTargetFireAge(finances.targetFireAge);
      if (finances.monthlySalaryUSD) setMonthlySalaryUSD(finances.monthlySalaryUSD);
      if (finances.annualSipStepUpPercent !== undefined) {
        setSipStepUpPct(finances.annualSipStepUpPercent);
      }
      if (finances.sipContinuityMode) setSipContinuityMode(finances.sipContinuityMode);
      if (finances.sipDurationYears) setSipDurationYears(finances.sipDurationYears);
      if (finances.stopSipAtFire !== undefined) setStopSipAtFire(finances.stopSipAtFire);
      if (finances.expectedNomadMonthlyIncomeUSD !== undefined) {
        setExpectedNomadMonthlyIncomeUSD(finances.expectedNomadMonthlyIncomeUSD);
      }
      if (finances.nomadIncomeActiveYears !== undefined) {
        setNomadIncomeActiveYears(finances.nomadIncomeActiveYears);
      }
      if (finances.plannedSabbaticalYears !== undefined) {
        setPlannedSabbaticalYears(finances.plannedSabbaticalYears);
      }
      setSelectedBasisCountry(
        userProfile.residingCountry || userProfile.originCountry || 'United States'
      );
      setSelectedTargetHaven(userProfile.targetCountry || 'Portugal');
      setHasGeneratedScorecard(true);
    }
  }, [isGuestUser, currentUserId]);

  // Keep currentNetWorth synced when logged-in user edits their 5-scheme asset breakdown
  const handleSchemeChange = (
    key: keyof UserFinancialPortfolio['investments'],
    val: number
  ) => {
    const clean = Math.max(0, Math.round(val || 0));
    const next = { ...investmentsDraft, [key]: clean };
    setInvestmentsDraft(next);
    const total =
      next.savingsUSD +
      next.stocksMutualFundsUSD +
      (includePrimaryHome ? next.realEstateUSD : 0) +
      (includeGold ? next.goldUSD : 0) +
      next.othersUSD;
    setCurrentNetWorth(Math.max(0, Math.round(total)));
  };

  // When slider moves directly, update stocks/equity bucket so 5-scheme total stays consistent
  const handleNetWorthSliderChange = (nextTotal: number) => {
    setCurrentNetWorth(nextTotal);
    if (!isGuestUser) {
      const otherBuckets =
        investmentsDraft.savingsUSD +
        (includePrimaryHome ? investmentsDraft.realEstateUSD : 0) +
        (includeGold ? investmentsDraft.goldUSD : 0) +
        investmentsDraft.othersUSD;
      if (nextTotal >= otherBuckets) {
        setInvestmentsDraft(prev => ({
          ...prev,
          stocksMutualFundsUSD: nextTotal - otherBuckets,
        }));
      } else {
        setInvestmentsDraft({
          savingsUSD: Math.round(nextTotal * 0.15),
          stocksMutualFundsUSD: Math.round(nextTotal * 0.7),
          realEstateUSD: investmentsDraft.realEstateUSD,
          goldUSD: includeGold ? Math.round(nextTotal * 0.1) : investmentsDraft.goldUSD,
          othersUSD: Math.round(nextTotal * 0.05),
        });
      }
    }
  };

  // Gated Scorecard state: Guests start gated first so they see the value of the exhaustive FIRE calculator,
  // and can generate the full FIRE scorecard with 1 click using their basic sliders!
  const [hasGeneratedScorecard, setHasGeneratedScorecard] = useState<boolean>(
    () => !isGuestUser
  );
  const [activePortfolioSubTab, setActivePortfolioSubTab] = useState<
    'assets' | 'loans' | 'passive' | 'milestones'
  >('assets');
  const [activeLedgerTab, setActiveLedgerTab] = useState<
    'diagnostics' | 'future-goals' | 'loans' | 'side-income'
  >('diagnostics');
  const [savedToast, setSavedToast] = useState<string | null>(null);

  // Quick Add Forms for Logged-in Users
  const [newLoanName, setNewLoanName] = useState('');
  const [newLoanCategory, setNewLoanCategory] =
    useState<UserLoanItem['category']>('Home / Mortgage');
  const [newLoanPrincipal, setNewLoanPrincipal] = useState(45000);
  const [newLoanEmi, setNewLoanEmi] = useState(550);
  const [newLoanRate, setNewLoanRate] = useState(6.5);
  const [newLoanYears, setNewLoanYears] = useState(5);

  const [newPassiveName, setNewPassiveName] = useState('');
  const [newPassiveCategory, setNewPassiveCategory] =
    useState<SideIncomeStream['category']>('Rental Property');
  const [newPassiveMonthly, setNewPassiveMonthly] = useState(500);
  const [newPassiveContinues, setNewPassiveContinues] = useState(true);

  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalCategory, setNewGoalCategory] =
    useState<FutureMilestoneExpense['category']>('Children Education');
  const [newGoalCost, setNewGoalCost] = useState(30000);
  const [newGoalYear, setNewGoalYear] = useState(2030);

  // -------------------------------------------------------------
  // 2. Unified FIRE Mathematical, Survival & Diagnostics Engine
  // -------------------------------------------------------------
  const tierMultiplier =
    fireTier === 'lean'
      ? 0.8
      : fireTier === 'fat'
      ? 1.35
      : fireTier === 'barista'
      ? 0.72
      : 1.0;

  // Effective 5-scheme breakdown (uses guest proportional allocation when not logged in)
  const effectiveInvestments = useMemo(() => {
    if (isGuestUser) {
      return {
        savingsUSD: Math.round(currentNetWorth * 0.15),
        stocksMutualFundsUSD: Math.round(currentNetWorth * 0.7),
        realEstateUSD: 0,
        goldUSD: Math.round(currentNetWorth * 0.1),
        othersUSD: Math.round(currentNetWorth * 0.05),
      };
    }
    return investmentsDraft;
  }, [isGuestUser, currentNetWorth, investmentsDraft]);

  const coreFinancialLiquidAssets =
    (effectiveInvestments.savingsUSD || 0) +
    (effectiveInvestments.stocksMutualFundsUSD || 0) +
    (effectiveInvestments.othersUSD || 0);

  const liquidAssetsUSD =
    coreFinancialLiquidAssets +
    (includeGold ? effectiveInvestments.goldUSD || 0 : 0);

  const totalGrossAssetsUSD =
    coreFinancialLiquidAssets +
    (effectiveInvestments.goldUSD || 0) +
    (effectiveInvestments.realEstateUSD || 0);

  const totalLoanPrincipalUSD = useMemo(
    () =>
      isGuestUser
        ? 0
        : Math.round(
            loansList.reduce((sum, l) => sum + (l.outstandingPrincipalUSD || 0), 0)
          ),
    [isGuestUser, loansList]
  );

  const totalMonthlyEmiUSD = useMemo(
    () =>
      isGuestUser
        ? 0
        : Math.round(loansList.reduce((sum, l) => sum + (l.monthlyEmiUSD || 0), 0)),
    [isGuestUser, loansList]
  );

  const activeSideMonthlyUSD = useMemo(
    () =>
      isGuestUser
        ? 0
        : Math.round(
            sideIncomesList.reduce((sum, s) => sum + (s.monthlyAmountUSD || 0), 0)
          ),
    [isGuestUser, sideIncomesList]
  );

  const passiveMonthlyInRetirementUSD = useMemo(
    () =>
      isGuestUser
        ? 0
        : Math.round(
            sideIncomesList
              .filter(s => s.continuesInRetirement)
              .reduce((sum, s) => sum + (s.monthlyAmountUSD || 0), 0)
          ),
    [isGuestUser, sideIncomesList]
  );

  const enrichedGoals = useMemo(() => {
    if (isGuestUser) return [];
    const infDec = inflationPct / 100;
    return futureGoalsList.map(g => {
      const yearsAway = Math.max(0, g.targetYear - currentYear);
      const inflatedCostUSD = Math.round(
        (g.estimatedCostTodayUSD || 0) * Math.pow(1 + infDec, yearsAway)
      );
      return {
        ...g,
        yearsAway,
        inflatedCostUSD,
      };
    });
  }, [isGuestUser, futureGoalsList, inflationPct]);

  const totalFutureGoalsTodayUSD = useMemo(
    () =>
      isGuestUser
        ? 0
        : Math.round(
            futureGoalsList.reduce((sum, g) => sum + (g.estimatedCostTodayUSD || 0), 0)
          ),
    [isGuestUser, futureGoalsList]
  );

  const totalFutureGoalsInflatedUSD = useMemo(
    () =>
      isGuestUser
        ? 0
        : Math.round(enrichedGoals.reduce((sum, g) => sum + g.inflatedCostUSD, 0)),
    [isGuestUser, enrichedGoals]
  );

  const effectiveNetCorpusTodayUSD = Math.max(
    0,
    currentNetWorth - totalLoanPrincipalUSD
  );
  const effectiveMonthlyAbroadUSD = Math.round(
    targetMonthlyExpenseAbroad * tierMultiplier
  );
  const netMonthlyAbroadPortfolioNeedUSD = Math.max(
    300,
    effectiveMonthlyAbroadUSD - passiveMonthlyInRetirementUSD
  );
  const netMonthlyDomesticPortfolioNeedUSD = Math.max(
    400,
    Math.round(domesticMonthlyExpense * tierMultiplier) -
      passiveMonthlyInRetirementUSD
  );

  const annualExpenseAbroad = netMonthlyAbroadPortfolioNeedUSD * 12;
  const annualExpenseDomestic = netMonthlyDomesticPortfolioNeedUSD * 12;
  const swrDecimal = Math.max(0.01, safeWithdrawalRate / 100);

  const activeFireTargetTodayUSD = Math.round(annualExpenseAbroad / swrDecimal);
  const fireNestEggAbroad = activeFireTargetTodayUSD + totalFutureGoalsTodayUSD;
  const fireNestEggDomestic =
    Math.round(annualExpenseDomestic / swrDecimal) + totalFutureGoalsTodayUSD;
  const capitalSaved = fireNestEggDomestic - fireNestEggAbroad;
  const capitalSavedPercent = Math.round(
    (capitalSaved / Math.max(1, fireNestEggDomestic)) * 100
  );

  const leanFireTargetTodayUSD = Math.round(
    (Math.max(300, targetMonthlyExpenseAbroad * 0.8 - passiveMonthlyInRetirementUSD) *
      12) /
      swrDecimal
  );
  const standardFireTargetTodayUSD = Math.round(
    (Math.max(300, targetMonthlyExpenseAbroad - passiveMonthlyInRetirementUSD) * 12) /
      swrDecimal
  );
  const fatFireTargetTodayUSD = Math.round(
    (Math.max(300, targetMonthlyExpenseAbroad * 1.35 - passiveMonthlyInRetirementUSD) *
      12) /
      swrDecimal
  );

  const realReturnDec = Math.max(
    0.01,
    (1 + expectedGrowthRate / 100) / (1 + inflationPct / 100) - 1
  );
  const realReturnPct = Math.round(realReturnDec * 1000) / 10;
  const yearsToTargetAge = Math.max(1, targetFireAge - currentAge);
  const coastFireTargetTodayUSD = Math.round(
    fireNestEggAbroad / Math.pow(1 + realReturnDec, yearsToTargetAge)
  );

  const isSipStopped = sipContinuityMode === 'paused' || annualSavings <= 0;
  const effectiveMonthlySipUSD = isSipStopped ? 0 : Math.round(annualSavings / 12);

  const calculateYearsToFire = (
    targetNestEgg: number,
    currentSavings: number,
    annualContribution: number,
    rate: number
  ) => {
    if (currentSavings >= targetNestEgg) return 0;
    if (annualContribution <= 0 && rate <= 0) return 99;
    const r = rate / 100;
    let balance = currentSavings;
    let years = 0;
    while (balance < targetNestEgg && years < 60) {
      balance = balance * (1 + r) + annualContribution;
      years++;
    }
    return years;
  };

  const yearsToFireAbroad = calculateYearsToFire(
    fireNestEggAbroad,
    effectiveNetCorpusTodayUSD,
    isSipStopped ? 0 : annualSavings,
    expectedGrowthRate
  );
  const yearsToFireDomestic = calculateYearsToFire(
    fireNestEggDomestic,
    effectiveNetCorpusTodayUSD,
    isSipStopped ? 0 : annualSavings,
    expectedGrowthRate
  );
  const yearsSaved = Math.max(0, yearsToFireDomestic - yearsToFireAbroad);
  const uncappedFireProgressPct = Math.round(
    (effectiveNetCorpusTodayUSD / Math.max(1, fireNestEggAbroad)) * 100
  );
  const fireProgressPercent = Math.min(100, uncappedFireProgressPct);
  const fireProgressDomesticPercent = Math.min(
    100,
    Math.round((effectiveNetCorpusTodayUSD / Math.max(1, fireNestEggDomestic)) * 100)
  );
  const swrMultiplier = +(100 / safeWithdrawalRate).toFixed(1);
  const monthlySafeWithdrawalIncomeUSD = Math.round(
    (effectiveNetCorpusTodayUSD * swrDecimal) / 12 + passiveMonthlyInRetirementUSD
  );
  const gapOrSurplusUSD = effectiveNetCorpusTodayUSD - fireNestEggAbroad;

  // Build 25-Year Visual Trajectory for FireProgressChart
  const trajectoryData = useMemo(() => {
    const points: FireTrajectoryPoint[] = [];
    let simCorpus = effectiveNetCorpusTodayUSD;
    let simContrib = effectiveNetCorpusTodayUSD;
    let simAnnualSip = isSipStopped ? 0 : annualSavings;
    const r = expectedGrowthRate / 100;
    const inf = inflationPct / 100;
    const stepUp = (isGuestUser ? 0 : sipStepUpPct) / 100;

    let crossoverYear: number | null =
      effectiveNetCorpusTodayUSD >= fireNestEggAbroad ? currentYear : null;
    let crossoverAge: number | null =
      effectiveNetCorpusTodayUSD >= fireNestEggAbroad ? currentAge : null;

    for (let y = 0; y <= 25; y++) {
      const yr = currentYear + y;
      const age = currentAge + y;
      const inflatedAbroadNeed = annualExpenseAbroad * Math.pow(1 + inf, y);
      const inflatedDomesticNeed = annualExpenseDomestic * Math.pow(1 + inf, y);

      const remainingGoals = isGuestUser
        ? 0
        : futureGoalsList
            .filter(g => g.targetYear > yr)
            .reduce(
              (s, g) =>
                s +
                Math.round(
                  g.estimatedCostTodayUSD *
                    Math.pow(1 + inf, Math.max(0, g.targetYear - currentYear))
                ),
              0
            );

      const dynamicAbroadTarget = Math.round(
        inflatedAbroadNeed / swrDecimal + remainingGoals
      );
      const dynamicDomesticTarget = Math.round(
        inflatedDomesticNeed / swrDecimal + remainingGoals
      );

      const yearMilestoneOutflow = isGuestUser
        ? 0
        : futureGoalsList
            .filter(g => g.targetYear === yr)
            .reduce(
              (s, g) => s + Math.round(g.estimatedCostTodayUSD * Math.pow(1 + inf, y)),
              0
            );

      const freedAnnualEmi = isGuestUser
        ? 0
        : loansList
            .filter(l => y >= l.remainingYears)
            .reduce((s, l) => s + (l.monthlyEmiUSD || 0) * 12, 0);

      let isSipActiveInYear = !isSipStopped;
      if (sipContinuityMode === 'custom-years' && y > sipDurationYears) {
        isSipActiveInYear = false;
      }
      if (stopSipAtFire && crossoverYear !== null && yr > crossoverYear) {
        isSipActiveInYear = false;
      }

      if (y > 0) {
        const activeAnnualSip = isSipActiveInYear ? simAnnualSip : 0;
        const totalInjected = Math.round(activeAnnualSip + freedAnnualEmi);
        simCorpus = Math.max(
          0,
          Math.round(simCorpus * (1 + r) + totalInjected - yearMilestoneOutflow)
        );
        simContrib += totalInjected;
        if (crossoverYear === null && simCorpus >= dynamicAbroadTarget) {
          crossoverYear = yr;
          crossoverAge = age;
        }
        if (isSipActiveInYear) {
          simAnnualSip = simAnnualSip * (1 + stepUp);
        }
      }

      const gains = Math.max(0, simCorpus - simContrib);
      const fundingRatio =
        dynamicAbroadTarget > 0
          ? Math.min(250, Math.round((simCorpus / dynamicAbroadTarget) * 100))
          : 100;

      points.push({
        year: yr,
        age,
        projectedCorpusUSD: simCorpus,
        cumulativeContributionsUSD: simContrib,
        compoundingGainsUSD: gains,
        fireTargetUSD: dynamicAbroadTarget,
        targetHavenCorpusUSD: dynamicDomesticTarget,
        milestonesDeductedUSD: yearMilestoneOutflow,
        annualSipInvestedUSD: isSipActiveInYear ? Math.round(simAnnualSip) : 0,
        freedEmiBonusUSD: freedAnnualEmi,
        fundingRatioPct: fundingRatio,
        isSipActiveInYear,
      });
    }

    return {
      points,
      crossoverYear,
      crossoverAge,
    };
  }, [
    effectiveNetCorpusTodayUSD,
    annualSavings,
    isSipStopped,
    sipContinuityMode,
    sipDurationYears,
    stopSipAtFire,
    expectedGrowthRate,
    inflationPct,
    sipStepUpPct,
    isGuestUser,
    fireNestEggAbroad,
    currentAge,
    annualExpenseAbroad,
    annualExpenseDomestic,
    swrDecimal,
    futureGoalsList,
    loansList,
  ]);

  // -------------------------------------------------------------
  // 3. Returns on SIP Compounding Breakdown (3Y, 5Y, 10Y, At FIRE)
  // -------------------------------------------------------------
  const computeSipHorizonReturns = (horizonYrs: number) => {
    const yrs = Math.max(1, Math.min(35, horizonYrs));
    if (isSipStopped || annualSavings <= 0) {
      return {
        durationYears: yrs,
        totalPrincipalUSD: 0,
        wealthGainedUSD: 0,
        finalMaturityUSD: 0,
        multiplier: '1.0',
        returnPercent: 0,
      };
    }
    let principal = 0;
    let maturity = 0;
    let annualContrib = annualSavings;
    const r = expectedGrowthRate / 100;
    const stepUp = (isGuestUser ? 0 : sipStepUpPct) / 100;

    for (let y = 1; y <= yrs; y++) {
      const isContribActive =
        sipContinuityMode === 'custom-years' ? y <= sipDurationYears : true;
      const contrib = isContribActive ? annualContrib : 0;
      principal += contrib;
      maturity = (maturity + contrib) * (1 + r);
      if (isContribActive) {
        annualContrib = annualContrib * (1 + stepUp);
      }
    }
    const cleanPrincipal = Math.round(principal);
    const cleanMaturity = Math.round(maturity);
    const wealthGained = Math.max(0, cleanMaturity - cleanPrincipal);
    const mult =
      cleanPrincipal > 0 ? (cleanMaturity / cleanPrincipal).toFixed(2) : '1.00';
    const retPct =
      cleanPrincipal > 0 ? (wealthGained / cleanPrincipal) * 100 : 0;

    return {
      durationYears: yrs,
      totalPrincipalUSD: cleanPrincipal,
      wealthGainedUSD: wealthGained,
      finalMaturityUSD: cleanMaturity,
      multiplier: mult,
      returnPercent: retPct,
    };
  };

  const sipReturnsDeck = useMemo(() => {
    const fireHorizon = Math.max(1, yearsToFireAbroad || 5);
    return {
      fire: computeSipHorizonReturns(fireHorizon),
      '3': computeSipHorizonReturns(3),
      '5': computeSipHorizonReturns(5),
      '10': computeSipHorizonReturns(10),
      custom: computeSipHorizonReturns(sipDurationYears),
    };
  }, [
    yearsToFireAbroad,
    isSipStopped,
    annualSavings,
    expectedGrowthRate,
    isGuestUser,
    sipStepUpPct,
    sipContinuityMode,
    sipDurationYears,
  ]);

  // -------------------------------------------------------------
  // 4. 50-Year Work-Free Runway & Digital Nomad Survival Engine
  // -------------------------------------------------------------
  const survivalSimulations = useMemo(() => {
    const infDec = inflationPct / 100;
    const nomRetDec = expectedGrowthRate / 100;

    const simulateSurvival = (
      monthlyRemoteIncomeUSD: number,
      remoteIncomeDurationYrs: number,
      sabbaticalZeroWorkFirstYrs = 0,
      baseMonthlyExpenseUSD = effectiveMonthlyAbroadUSD
    ) => {
      let balance = Math.max(0, effectiveNetCorpusTodayUSD);
      let exactRunwayYears = 50;
      let depletedYear: number | null = null;
      let depletedAge: number | null = null;
      let isPerpetual = true;
      let balanceAfterSabbatical = balance;

      const yearlyRows: {
        yearOffset: number;
        calendarYear: number;
        age: number;
        startCorpusUSD: number;
        annualLivingAndEmiUSD: number;
        annualPassiveAndNomadInflowUSD: number;
        milestonesOutflowUSD: number;
        netWithdrawalOrAdditionUSD: number;
        endCorpusUSD: number;
      }[] = [];

      for (let y = 0; y < 50; y++) {
        const calYear = currentYear + y;
        const ageAtY = currentAge + y;
        const startBal = balance;
        const infMult = Math.pow(1 + infDec, y);

        const annualLiving = baseMonthlyExpenseUSD * 12 * infMult;
        const activeAnnualEmi = isGuestUser
          ? 0
          : loansList
              .filter(l => y < l.remainingYears)
              .reduce((s, l) => s + (l.monthlyEmiUSD || 0), 0) * 12;

        const annualPassive = passiveMonthlyInRetirementUSD * 12 * infMult;
        const isEarningNomad =
          y >= sabbaticalZeroWorkFirstYrs &&
          y < sabbaticalZeroWorkFirstYrs + remoteIncomeDurationYrs &&
          monthlyRemoteIncomeUSD > 0;
        const annualNomad = isEarningNomad
          ? monthlyRemoteIncomeUSD * 12 * infMult
          : 0;

        const milestonesInYear = isGuestUser
          ? 0
          : enrichedGoals
              .filter(g => g.targetYear === calYear)
              .reduce((s, g) => s + g.inflatedCostUSD, 0);

        const totalAnnualOutflow =
          annualLiving + activeAnnualEmi + milestonesInYear;
        const totalAnnualInflow = annualPassive + annualNomad;
        const netAnnualCashFlow = totalAnnualInflow - totalAnnualOutflow;

        const investmentGrowth = startBal * nomRetDec;
        const nextBal = startBal + investmentGrowth + netAnnualCashFlow;

        if (nextBal <= 0 && isPerpetual) {
          isPerpetual = false;
          const netDrainThisYear = Math.max(
            1,
            -netAnnualCashFlow - investmentGrowth
          );
          const fractionSurvived = Math.min(
            0.95,
            Math.max(0.05, startBal / netDrainThisYear)
          );
          exactRunwayYears = Math.round((y + fractionSurvived) * 10) / 10;
          depletedYear = calYear;
          depletedAge = ageAtY;
        }

        balance = Math.max(0, Math.round(nextBal));
        if (y + 1 === sabbaticalZeroWorkFirstYrs) {
          balanceAfterSabbatical = balance;
        }

        yearlyRows.push({
          yearOffset: y + 1,
          calendarYear: calYear,
          age: ageAtY,
          startCorpusUSD: Math.round(startBal),
          annualLivingAndEmiUSD: Math.round(annualLiving + activeAnnualEmi),
          annualPassiveAndNomadInflowUSD: Math.round(totalAnnualInflow),
          milestonesOutflowUSD: Math.round(milestonesInYear),
          netWithdrawalOrAdditionUSD: Math.round(netAnnualCashFlow),
          endCorpusUSD: balance,
        });
      }

      const wholeYears = Math.floor(exactRunwayYears);
      const remMonths = Math.round((exactRunwayYears - wholeYears) * 12);

      return {
        exactRunwayYears,
        wholeYears,
        remMonths,
        isPerpetual,
        survivalYear: isPerpetual
          ? currentYear + 50
          : depletedYear || currentYear,
        survivalAge: isPerpetual ? currentAge + 50 : depletedAge || currentAge,
        endingCorpusAt50YrsUSD: balance,
        balanceAfterSabbaticalUSD:
          sabbaticalZeroWorkFirstYrs > 0
            ? balanceAfterSabbatical
            : effectiveNetCorpusTodayUSD,
        yearlyRows,
      };
    };

    const zeroWorkAbroadSim = simulateSurvival(
      0,
      0,
      0,
      effectiveMonthlyAbroadUSD
    );
    const zeroWorkDomesticSim = simulateSurvival(
      0,
      0,
      0,
      Math.round(domesticMonthlyExpense * tierMultiplier)
    );
    const withNomadSim = simulateSurvival(
      expectedNomadMonthlyIncomeUSD,
      nomadIncomeActiveYears,
      0,
      effectiveMonthlyAbroadUSD
    );
    const sabbaticalThenNomadSim = simulateSurvival(
      expectedNomadMonthlyIncomeUSD,
      nomadIncomeActiveYears,
      plannedSabbaticalYears,
      effectiveMonthlyAbroadUSD
    );

    let minMonthlyNomadForPerpetualUSD = 0;
    if (!zeroWorkAbroadSim.isPerpetual) {
      let low = 0;
      let high = Math.max(
        15000,
        effectiveMonthlyAbroadUSD + totalMonthlyEmiUSD + 3000
      );
      for (let iter = 0; iter < 16; iter++) {
        const mid = Math.round((low + high) / 2);
        const testSim = simulateSurvival(
          mid,
          Math.max(1, nomadIncomeActiveYears),
          0,
          effectiveMonthlyAbroadUSD
        );
        if (testSim.isPerpetual && testSim.endingCorpusAt50YrsUSD > 0) {
          high = mid;
        } else {
          low = mid;
        }
      }
      minMonthlyNomadForPerpetualUSD = Math.ceil(high / 25) * 25;
    }

    const survivalTimeline = zeroWorkAbroadSim.yearlyRows
      .filter(
        r =>
          r.yearOffset === 1 ||
          r.yearOffset === 3 ||
          r.yearOffset === 5 ||
          r.yearOffset % 5 === 0 ||
          r.calendarYear === zeroWorkAbroadSim.survivalYear ||
          r.calendarYear === withNomadSim.survivalYear
      )
      .slice(0, 12)
      .map(r => {
        const matchingNomad = withNomadSim.yearlyRows.find(
          nr => nr.calendarYear === r.calendarYear
        );
        const matchingSabbatical = sabbaticalThenNomadSim.yearlyRows.find(
          sr => sr.calendarYear === r.calendarYear
        );
        return {
          ...r,
          withNomadEndCorpusUSD: matchingNomad ? matchingNomad.endCorpusUSD : 0,
          afterSabbaticalEndCorpusUSD: matchingSabbatical
            ? matchingSabbatical.endCorpusUSD
            : 0,
        };
      });

    return {
      zeroWorkAbroadSim,
      zeroWorkDomesticSim,
      withNomadSim,
      sabbaticalThenNomadSim,
      minMonthlyNomadForPerpetualUSD,
      survivalTimeline,
    };
  }, [
    inflationPct,
    expectedGrowthRate,
    effectiveNetCorpusTodayUSD,
    effectiveMonthlyAbroadUSD,
    domesticMonthlyExpense,
    tierMultiplier,
    currentAge,
    isGuestUser,
    loansList,
    passiveMonthlyInRetirementUSD,
    enrichedGoals,
    expectedNomadMonthlyIncomeUSD,
    nomadIncomeActiveYears,
    plannedSabbaticalYears,
    totalMonthlyEmiUSD,
  ]);

  // -------------------------------------------------------------
  // 5. Strengths, Weaknesses & Quantified FIRE Accelerators
  // -------------------------------------------------------------
  const diagnosticsAndAccelerators = useMemo(() => {
    const strengths: { title: string; detail: string }[] = [];
    const weaknesses: { title: string; detail: string }[] = [];

    if (capitalSaved > 0) {
      strengths.push({
        title: `Strong Geo-Arbitrage Advantage (-${capitalSavedPercent}% Required Capital)`,
        detail: `Retiring abroad at $${targetMonthlyExpenseAbroad.toLocaleString()}/mo vs. $${domesticMonthlyExpense.toLocaleString()}/mo at home slashes your required FIRE nest egg by $${capitalSaved.toLocaleString()}.`,
      });
    } else {
      weaknesses.push({
        title: `Target Abroad Budget Matches or Exceeds Domestic Cost`,
        detail: `Lowering your target abroad budget below $${domesticMonthlyExpense.toLocaleString()}/mo will unlock geo-arbitrage savings and compress your years to FIRE.`,
      });
    }

    if (effectiveNetCorpusTodayUSD >= coastFireTargetTodayUSD) {
      strengths.push({
        title: `Coast FIRE Milestone Already Unlocked`,
        detail: `Your current net corpus ($${effectiveNetCorpusTodayUSD.toLocaleString()}) exceeds your Coast FIRE threshold ($${coastFireTargetTodayUSD.toLocaleString()}) for Age ${targetFireAge}.`,
      });
    } else {
      weaknesses.push({
        title: `Coast FIRE Gap of $${(coastFireTargetTodayUSD - effectiveNetCorpusTodayUSD).toLocaleString()}`,
        detail: `Reaching $${coastFireTargetTodayUSD.toLocaleString()} will allow compounding alone (${realReturnPct}% real return/yr) to carry you to full FIRE by Age ${targetFireAge}.`,
      });
    }

    if (!isSipStopped && annualSavings >= 24000) {
      strengths.push({
        title: `High Annual Savings Velocity ($${annualSavings.toLocaleString()}/yr · $${effectiveMonthlySipUSD.toLocaleString()}/mo)`,
        detail: `Your systematic investments compound at ${expectedGrowthRate}%/yr and generate +$${sipReturnsDeck.fire.wealthGainedUSD.toLocaleString()} in pure market gains by FIRE.`,
      });
    } else if (isSipStopped) {
      weaknesses.push({
        title: `Monthly SIP Paused ($0/mo — Coast Mode Active)`,
        detail: `Fresh contributions are paused. Resuming even $${Math.round(targetMonthlyExpenseAbroad * 0.5).toLocaleString()}/mo in SIP will accelerate your crossover year.`,
      });
    } else {
      weaknesses.push({
        title: `Moderate Annual Savings Velocity ($${annualSavings.toLocaleString()}/yr)`,
        detail: `Stepping up your annual savings by +25% will shave years off your FIRE timeline.`,
      });
    }

    if (totalLoanPrincipalUSD === 0) {
      strengths.push({
        title: isGuestUser
          ? `Zero Liabilities Assumed in Basic Mode`
          : `100% Debt-Free Balance Sheet`,
        detail: isGuestUser
          ? `Sign in to add mortgages or loans if applicable so your net FIRE corpus reflects exact debt payoff.`
          : `Zero loan EMIs allow 100% of your investment returns to compound toward financial freedom.`,
      });
    } else {
      weaknesses.push({
        title: `Active Loan Principal ($${totalLoanPrincipalUSD.toLocaleString()}) & EMIs ($${totalMonthlyEmiUSD.toLocaleString()}/mo)`,
        detail: `Paying off active debt and rolling $${totalMonthlyEmiUSD.toLocaleString()}/mo freed EMI into your SIP will accelerate compounding.`,
      });
    }

    // Quantified Accelerators
    const trim15BudgetAbroad = Math.max(
      500,
      Math.round(targetMonthlyExpenseAbroad * 0.85)
    );
    const trim15NestEgg =
      Math.round(
        (Math.max(
          300,
          trim15BudgetAbroad * tierMultiplier - passiveMonthlyInRetirementUSD
        ) *
          12) /
          swrDecimal
      ) + totalFutureGoalsTodayUSD;
    const trim15Years = calculateYearsToFire(
      trim15NestEgg,
      effectiveNetCorpusTodayUSD,
      isSipStopped
        ? 0
        : annualSavings + (targetMonthlyExpenseAbroad - trim15BudgetAbroad) * 12,
      expectedGrowthRate
    );

    const boost25Savings = Math.round((annualSavings || 12000) * 1.25);
    const boost25Years = calculateYearsToFire(
      fireNestEggAbroad,
      effectiveNetCorpusTodayUSD,
      boost25Savings,
      expectedGrowthRate
    );

    const lowerCostHaven =
      [...countries]
        .filter(
          c =>
            c.costOfLiving.monthlyBudgetCoupleUSD <
              targetMonthlyExpenseAbroad - 250 &&
            c.lifestyle.healthcareScore >= 72
        )
        .sort(
          (a, b) =>
            b.lifestyle.healthcareScore +
            b.lifestyle.safetyScore -
            (a.lifestyle.healthcareScore + a.lifestyle.safetyScore)
        )[0] || countries[0];
    const havenBudget =
      lowerCostHaven?.costOfLiving.monthlyBudgetCoupleUSD || 1800;
    const havenNestEgg =
      Math.round(
        (Math.max(300, havenBudget * tierMultiplier - passiveMonthlyInRetirementUSD) *
          12) /
          swrDecimal
      ) + totalFutureGoalsTodayUSD;
    const havenYears = calculateYearsToFire(
      havenNestEgg,
      effectiveNetCorpusTodayUSD,
      isSipStopped ? 0 : annualSavings,
      expectedGrowthRate
    );

    const accelerators = [
      {
        id: 'trim-budget',
        title: `Optimize Abroad Budget by 15% (to $${trim15BudgetAbroad.toLocaleString()}/mo)`,
        impactYears: Math.max(0.5, yearsToFireAbroad - trim15Years),
        description: `Trimming $${(targetMonthlyExpenseAbroad - trim15BudgetAbroad).toLocaleString()}/mo lowers your required FIRE corpus to $${trim15NestEgg.toLocaleString()}.`,
        actionLabel: `Apply $${trim15BudgetAbroad.toLocaleString()}/mo Target`,
        onApply: () => {
          setTargetMonthlyExpenseAbroad(trim15BudgetAbroad);
          setSavedToast(
            `Applied 15% budget optimization ($${trim15BudgetAbroad.toLocaleString()}/mo target abroad)!`
          );
          setTimeout(() => setSavedToast(null), 3500);
        },
      },
      {
        id: 'boost-sip',
        title: `Step Up Annual Savings by +25% (to $${boost25Savings.toLocaleString()}/yr)`,
        impactYears: Math.max(0.5, yearsToFireAbroad - boost25Years),
        description: `Increasing annual savings from $${annualSavings.toLocaleString()}/yr to $${boost25Savings.toLocaleString()}/yr compounds aggressively at ${expectedGrowthRate}%.`,
        actionLabel: `Apply $${(boost25Savings / 1000).toFixed(1)}k/yr Savings`,
        onApply: () => {
          setSipContinuityMode('until-fire');
          setAnnualSavings(boost25Savings);
          setSavedToast(
            `Applied +25% Annual Savings acceleration ($${boost25Savings.toLocaleString()}/yr)!`
          );
          setTimeout(() => setSavedToast(null), 3500);
        },
      },
      {
        id: 'haven-arbitrage',
        title: `Geo-Arbitrage in ${lowerCostHaven?.name || 'Thailand'} ($${havenBudget.toLocaleString()}/mo Couple)`,
        impactYears: Math.max(0.5, yearsToFireAbroad - havenYears),
        description: `Choosing ${lowerCostHaven?.name || 'Thailand'} drops your required FIRE nest egg to $${havenNestEgg.toLocaleString()}.`,
        actionLabel: `Test ${lowerCostHaven?.name || 'Thailand'} ($${havenBudget.toLocaleString()}/mo)`,
        onApply: () => {
          if (lowerCostHaven) {
            setSelectedTargetHaven(lowerCostHaven.name);
            setTargetMonthlyExpenseAbroad(havenBudget);
            setSavedToast(
              `Switched Target Haven to ${lowerCostHaven.name} ($${havenBudget.toLocaleString()}/mo)!`
            );
            setTimeout(() => setSavedToast(null), 3500);
          }
        },
      },
    ];

    return {
      strengths,
      weaknesses,
      accelerators,
    };
  }, [
    capitalSaved,
    capitalSavedPercent,
    targetMonthlyExpenseAbroad,
    domesticMonthlyExpense,
    effectiveNetCorpusTodayUSD,
    coastFireTargetTodayUSD,
    targetFireAge,
    realReturnPct,
    isSipStopped,
    annualSavings,
    effectiveMonthlySipUSD,
    expectedGrowthRate,
    sipReturnsDeck.fire.wealthGainedUSD,
    totalLoanPrincipalUSD,
    totalMonthlyEmiUSD,
    isGuestUser,
    tierMultiplier,
    passiveMonthlyInRetirementUSD,
    swrDecimal,
    totalFutureGoalsTodayUSD,
    fireNestEggAbroad,
    countries,
    yearsToFireAbroad,
  ]);

  // Save unified FIRE plan to user profile (for logged-in users)
  const handleSaveFirePlanToAccount = (customToast?: string) => {
    if (isGuestUser) {
      openAuthModal('signup');
      return;
    }

    const monthlySip = isSipStopped ? 0 : Math.round(annualSavings / 12);
    updateUserProfile({
      residingCountry: selectedBasisCountry,
      targetCountry: selectedTargetHaven,
      monthlyBudgetUSD: targetMonthlyExpenseAbroad,
      finances: {
        ...finances,
        currentAge,
        targetFireAge,
        monthlySalaryUSD,
        currentSalaryUSD: monthlySalaryUSD * 12,
        monthlyCurrentExpensesUSD: domesticMonthlyExpense,
        monthlyRetirementExpensesUSD: targetMonthlyExpenseAbroad,
        monthlySipUSD: monthlySip,
        annualSipStepUpPercent: sipStepUpPct,
        sipContinuityMode,
        sipDurationYears,
        stopSipAtFire,
        safeWithdrawalRatePercent: safeWithdrawalRate,
        expectedReturnRatePercent: expectedGrowthRate,
        inflationRatePercent: inflationPct,
        includePrimaryHomeInFire: includePrimaryHome,
        includeGoldInFire: includeGold,
        expectedNomadMonthlyIncomeUSD,
        nomadIncomeActiveYears,
        plannedSabbaticalYears,
        investments: investmentsDraft,
        loans: loansList,
        sideIncomes: sideIncomesList,
        futureExpenses: futureGoalsList,
        totalLiabilitiesUSD: totalLoanPrincipalUSD,
        additionalMonthlyPassiveUSD: passiveMonthlyInRetirementUSD,
        updatedAt: new Date().toISOString().split('T')[0],
      },
    });

    setSavedToast(
      customToast ||
        'Saved to your ReFIREly Account! Your FIRE Scorecard, 5-Scheme Assets, Loans & Milestones are synced across your dashboard.'
    );
    setTimeout(() => setSavedToast(null), 4000);
  };

  // Top 4 matching countries dynamically synced with the user's FIRE Calculator inputs
  const fireMatchedCountries = useMemo(() => {
    const useSingleBasis = targetMonthlyExpenseAbroad < 1350;

    const evaluated = countries.map(country => {
      const referenceMonthlyCost = useSingleBasis
        ? country.costOfLiving.monthlyBudgetSingleUSD
        : country.costOfLiving.monthlyBudgetCoupleUSD;
      const countryNestEgg =
        Math.round(
          (Math.max(300, referenceMonthlyCost - passiveMonthlyInRetirementUSD) *
            12) /
            swrDecimal
        ) + totalFutureGoalsTodayUSD;
      const fundedPercent = Math.min(
        100,
        Math.round(
          (effectiveNetCorpusTodayUSD / Math.max(1, countryNestEgg)) * 100
        )
      );
      const yearsToFireInCountry = calculateYearsToFire(
        countryNestEgg,
        effectiveNetCorpusTodayUSD,
        isSipStopped ? 0 : annualSavings,
        expectedGrowthRate
      );
      const budgetDelta = targetMonthlyExpenseAbroad - referenceMonthlyCost;
      const qualityScore =
        (country.lifestyle.healthcareScore +
          country.lifestyle.safetyScore +
          getCountryTravelLeisureScore(country)) /
        3;

      let fitRank = qualityScore;
      if (budgetDelta >= 0 && budgetDelta <= 700) {
        fitRank += 40;
      } else if (budgetDelta > 700) {
        fitRank += 28;
      } else if (budgetDelta >= -250) {
        fitRank += 12;
      } else {
        fitRank -= Math.abs(budgetDelta) / 20;
      }

      return {
        country,
        referenceMonthlyCost,
        budgetModeLabel: useSingleBasis ? 'Solo' : 'Couple',
        countryNestEgg,
        fundedPercent,
        yearsToFireInCountry,
        fitRank,
      };
    });

    evaluated.sort((a, b) => b.fitRank - a.fitRank);
    return evaluated.slice(0, 4);
  }, [
    countries,
    targetMonthlyExpenseAbroad,
    passiveMonthlyInRetirementUSD,
    totalFutureGoalsTodayUSD,
    swrDecimal,
    effectiveNetCorpusTodayUSD,
    isSipStopped,
    annualSavings,
    expectedGrowthRate,
  ]);

  // -------------------------------------------------------------
  // 6. Duo-Calculator Tab State & Nomad Runway Calculation
  // -------------------------------------------------------------
  const [calculatorTab, setCalculatorTab] = useState<'fire' | 'nomad'>(
    currentPersona === 'nomad' ? 'nomad' : 'fire'
  );

  useEffect(() => {
    setCalculatorTab(currentPersona === 'nomad' ? 'nomad' : 'fire');
  }, [currentPersona]);

  const [nomadSavings, setNomadSavings] = useState<number>(36000);
  const [nomadMonthlyBurn, setNomadMonthlyBurn] = useState<number>(1850);
  const [nomadRemoteIncome, setNomadRemoteIncome] = useState<number>(850);

  const nomadNetBurn = Math.max(0, nomadMonthlyBurn - nomadRemoteIncome);
  const nomadRunwayMonths =
    nomadNetBurn <= 0 ? 999 : Math.floor(nomadSavings / nomadNetBurn);
  const nomadRunwayYears = (nomadRunwayMonths / 12).toFixed(1);
  const nomadSixMonthRunwayRequired = nomadNetBurn * 6;
  const nomadTwelveMonthRunwayRequired = nomadNetBurn * 12;

  const nomadMatchedCountries = useMemo(() => {
    const list = countries.map(country => {
      const nomadProfile = getCountryNomadProfile(country);
      const burnDelta = nomadMonthlyBurn - nomadProfile.monthlyNomadBurnUSD;
      let fitScore = nomadProfile.hasCuratedData ? 40 : 10;
      if (burnDelta >= 0 && burnDelta <= 500) {
        fitScore += 35;
      } else if (burnDelta > 500) {
        fitScore += 25;
      } else if (burnDelta >= -300) {
        fitScore += 15;
      } else {
        fitScore -= Math.abs(burnDelta) / 25;
      }
      fitScore += Math.min(25, nomadProfile.verifiedInternetMbps / 10);
      return {
        country,
        nomadProfile,
        fitScore,
      };
    });
    list.sort((a, b) => b.fitScore - a.fitScore);
    return list.slice(0, 4);
  }, [countries, nomadMonthlyBurn]);

  const handleOpenAdvancedExplorer = () => {
    setSelectedRegion('All');
    setSelectedClimate('All');
    setSearchQuery('');
    setSortBy(calculatorTab === 'nomad' ? 'internet-speed-desc' : 'budget-asc');
    setCurrentView('explore');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <MotionConfig reducedMotion="user">
      <div
        className={
          isEmbeddedInDashboard
            ? 'space-y-8'
            : 'pt-5 md:pt-8 pb-16 md:pb-24 space-y-10 md:space-y-14 overflow-x-clip bg-gradient-to-b from-slate-50/80 via-white to-slate-50/50'
        }
      >
        {/* ============================================================ */}
        {/* 1. UNIFIED INTERNATIONAL GEO-ARBITRAGE & FIRE PLANNER        */}
        {/* ============================================================ */}
        <section
          id="fire-calculator"
          className={
            isEmbeddedInDashboard
              ? 'scroll-mt-20'
              : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20'
          }
        >
          <div className="relative overflow-hidden p-4 md:p-10 rounded-2xl md:rounded-[2rem] bg-white border border-slate-200/90 shadow-lg shadow-slate-900/5">
            {/* Decorative Top Ribbon & Subtle Ambient Orbs */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-teal-500 to-emerald-500" />
            <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-indigo-200/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-teal-200/15 blur-3xl" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-5 md:mb-8">
              <div className="max-w-3xl space-y-2.5 md:space-y-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="inline-flex items-center gap-2 px-3 py-1 md:px-3.5 md:py-1.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200/80 text-[11px] md:text-xs font-bold">
                    <Flame className="w-3.5 h-3.5 text-indigo-600" />
                    <span>
                      International Geo-Arbitrage Engine &amp; FIRE Independence Planner
                    </span>
                  </div>
                  <span className="text-xs font-bold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
                    {isGuestUser
                      ? 'Guest Mode · Basic Calculator + Full Scorecard Generator'
                      : `Synced to ${userProfile.name}'s Account`}
                  </span>
                </div>

                {/* Duo-Calculator Segmented Tab Switcher */}
                <div className="pt-1 flex flex-wrap items-center gap-2.5">
                  <div className="grid grid-cols-2 w-full md:w-auto md:inline-flex p-1 rounded-2xl bg-slate-100 border border-slate-200/90 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setCalculatorTab('fire')}
                      className={`px-3 md:px-5 py-2 md:py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 md:gap-2 ${
                        calculatorTab === 'fire'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-slate-700 hover:text-slate-950 hover:bg-white/80'
                      }`}
                    >
                      <Flame className="w-4 h-4 text-indigo-200 shrink-0" />
                      <span className="md:hidden">FIRE &amp; Trajectory</span>
                      <span className="hidden md:inline">
                        Tab 1: FIRE Calculator, Visual Trajectory &amp; Independence Planner
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCalculatorTab('nomad')}
                      className={`px-3 md:px-5 py-2 md:py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 md:gap-2 ${
                        calculatorTab === 'nomad'
                          ? 'bg-teal-600 text-white shadow-xs'
                          : 'text-slate-700 hover:text-slate-950 hover:bg-white/80'
                      }`}
                    >
                      <Zap className="w-4 h-4 text-teal-200 shrink-0" />
                      <span className="md:hidden">Nomad Runway</span>
                      <span className="hidden md:inline">
                        Tab 2: Nomad Runway &amp; Monthly Burn
                      </span>
                    </button>
                  </div>
                </div>

                <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                  {calculatorTab === 'fire' ? (
                    <>
                      Calculate Your{' '}
                      <span className="bg-gradient-to-r from-indigo-700 via-teal-600 to-emerald-600 bg-clip-text text-transparent">
                        FIRE Number, Visual Trajectory &amp; Survival Runway Abroad
                      </span>
                    </>
                  ) : (
                    <>
                      Calculate Your{' '}
                      <span className="bg-gradient-to-r from-teal-600 via-indigo-600 to-emerald-600 bg-clip-text text-transparent">
                        Nomad Runway &amp; Monthly Burn
                      </span>
                    </>
                  )}
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {calculatorTab === 'fire'
                    ? 'Calculate your overseas FIRE number immediately using core sliders, generate your full 25-year visual trajectory & 50-year survival scorecard, and unlock personal 5-scheme assets, loans, passive income & milestones when logged in.'
                    : 'Determine exactly how many months or years of global freedom your liquid savings buy across top digital nomad havens, factoring in turnkey rent, coworking, and remote client retainers.'}
                </p>
              </div>

              {/* Save / Sign Up Top Action Bar */}
              {calculatorTab === 'fire' && (
                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  {countryMacro.currencyCode !== 'USD' && !isGuestUser && (
                    <div className="inline-flex rounded-xl border border-slate-200 p-0.5 bg-white text-[11px] font-semibold">
                      <button
                        type="button"
                        onClick={() => setInputCurrencyMode('LOCAL')}
                        className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                          inputCurrencyMode === 'LOCAL'
                            ? 'bg-orange-600 text-white font-bold shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {countryMacro.currencyCode} ({countryMacro.symbol.trim()})
                      </button>
                      <button
                        type="button"
                        onClick={() => setInputCurrencyMode('USD')}
                        className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                          inputCurrencyMode === 'USD'
                            ? 'bg-orange-600 text-white font-bold shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        $ USD
                      </button>
                    </div>
                  )}

                  {isGuestUser ? (
                    <button
                      type="button"
                      onClick={() => openAuthModal('signup')}
                      className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700 text-white text-xs font-extrabold shadow-md transition-all cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Unlock className="w-3.5 h-3.5 text-amber-300" />
                      <span>Sign Up Free to Unlock Personal Assets &amp; Save</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSaveFirePlanToAccount()}
                      className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-700 hover:to-indigo-700 text-white text-xs font-extrabold shadow-md transition-all cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Save &amp; Sync FIRE Plan to Account</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {savedToast && (
              <div className="relative z-10 mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-xs font-bold text-emerald-900 flex items-center justify-between gap-2 shadow-2xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{savedToast}</span>
                </div>
                {!isEmbeddedInDashboard && !isGuestUser && (
                  <button
                    type="button"
                    onClick={() => setCurrentView('dashboard')}
                    className="px-3 py-1 rounded-xl bg-emerald-700 text-white text-[11px] font-extrabold hover:bg-emerald-800 cursor-pointer shrink-0"
                  >
                    View in Dashboard →
                  </button>
                )}
              </div>
            )}

            {calculatorTab === 'fire' ? (
              <>
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Left Column: Unified Core Sliders + Gated/Unlocked Personal Financial Parameters */}
                  <div className="lg:col-span-6 space-y-4 bg-slate-50/40 p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-xs">
                    {/* Country Pair & FIRE Lifestyle Tier Bar */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-3 border-b border-slate-100 text-xs">
                      <div>
                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">
                          Residing Country (At Home)
                        </label>
                        <select
                          value={selectedBasisCountry}
                          onChange={e => setSelectedBasisCountry(e.target.value)}
                          className="w-full px-2.5 py-2 rounded-xl border border-slate-300 bg-white font-semibold text-slate-800 text-xs"
                        >
                          {!WORLD_COUNTRIES.some(c => c.name === selectedBasisCountry) &&
                            selectedBasisCountry && (
                              <option value={selectedBasisCountry}>
                                🌍 {selectedBasisCountry}
                              </option>
                            )}
                          {WORLD_COUNTRIES.map(c => (
                            <option key={`basis-${c.code}-${c.name}`} value={c.name}>
                              {c.flag} {c.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-800 block mb-1">
                          Target FIRE Haven Abroad
                        </label>
                        <select
                          value={selectedTargetHaven}
                          onChange={e => {
                            const val = e.target.value;
                            setSelectedTargetHaven(val);
                            const matched = countries.find(
                              c => c.name.toLowerCase() === val.toLowerCase()
                            );
                            if (matched) {
                              setTargetMonthlyExpenseAbroad(
                                matched.costOfLiving.monthlyBudgetCoupleUSD
                              );
                            }
                          }}
                          className="w-full px-2.5 py-2 rounded-xl border border-indigo-200 bg-indigo-50/50 font-extrabold text-indigo-950 text-xs"
                        >
                          {!countries.some(c => c.name === selectedTargetHaven) &&
                            selectedTargetHaven && (
                              <option value={selectedTargetHaven}>
                                {getWorldCountryFlag(selectedTargetHaven)}{' '}
                                {selectedTargetHaven}
                              </option>
                            )}
                          {countries.map(c => (
                            <option key={`target-${c.id}`} value={c.name}>
                              {c.flag} {c.name} ($
                              {c.costOfLiving.monthlyBudgetCoupleUSD.toLocaleString()}/mo
                              couple)
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Lifestyle FIRE Tier Selector Pills */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
                        FIRE Lifestyle Tier:
                      </span>
                      <div className="inline-flex flex-wrap rounded-xl bg-slate-100 p-1 border border-slate-200 gap-1">
                        {[
                          { id: 'barista', label: 'Barista (72%)' },
                          { id: 'lean', label: 'Lean (80%)' },
                          { id: 'standard', label: 'Standard (100%)' },
                          { id: 'fat', label: 'Fat FIRE (135%)' },
                        ].map(t => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setFireTier(t.id as FireTierMode)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer ${
                              fireTier === t.id
                                ? 'bg-indigo-600 text-white shadow-2xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Core Parameter 1: Current Invested Assets */}
                    <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <label className="font-extrabold text-slate-800 uppercase tracking-wider">
                          1. Current Invested Assets{' '}
                          {!isGuestUser && '(Auto-Synced with 5 Schemes)'}
                        </label>
                        <motion.span
                          key={currentNetWorth}
                          initial={{ scale: 0.92 }}
                          animate={{ scale: 1 }}
                          className="font-mono font-black px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-900 border border-indigo-200 text-sm"
                        >
                          ${currentNetWorth.toLocaleString()}
                        </motion.span>
                      </div>
                      <input
                        type="range"
                        min="20000"
                        max="2000000"
                        step="10000"
                        value={Math.min(2000000, currentNetWorth)}
                        onChange={e =>
                          handleNetWorthSliderChange(Number(e.target.value))
                        }
                        className="w-full h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                      <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                        <span>$20k</span>
                        <span>$500k</span>
                        <span>$2.0M+</span>
                      </div>
                    </div>

                    {/* Core Parameter 2: Target Monthly Budget Abroad */}
                    <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <label className="font-extrabold text-slate-800 uppercase tracking-wider">
                          2. Target Monthly Budget Abroad ({selectedTargetHaven})
                        </label>
                        <motion.span
                          key={targetMonthlyExpenseAbroad}
                          initial={{ scale: 0.92 }}
                          animate={{ scale: 1 }}
                          className="font-mono font-black px-2.5 py-0.5 rounded-lg bg-teal-50 text-teal-900 border border-teal-200 text-sm"
                        >
                          ${targetMonthlyExpenseAbroad.toLocaleString()}/mo
                        </motion.span>
                      </div>
                      <input
                        type="range"
                        min="500"
                        max="6000"
                        step="100"
                        value={Math.min(6000, targetMonthlyExpenseAbroad)}
                        onChange={e =>
                          setTargetMonthlyExpenseAbroad(Number(e.target.value))
                        }
                        className="w-full h-2 bg-teal-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                      />
                      <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                        <span>$500 (Ultra-Lean)</span>
                        <span>$2,400 (Standard Haven)</span>
                        <span>$6,000 (Fat FIRE)</span>
                      </div>
                    </div>

                    {/* Core Parameter 3: Current Monthly Cost (At Home) */}
                    <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <label className="font-extrabold text-slate-800 uppercase tracking-wider">
                          3. Current Monthly Cost at Home ({selectedBasisCountry})
                        </label>
                        <span className="font-mono font-black px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 text-sm">
                          ${domesticMonthlyExpense.toLocaleString()}/mo
                        </span>
                      </div>
                      <input
                        type="range"
                        min="500"
                        max="10000"
                        step="100"
                        value={Math.min(10000, domesticMonthlyExpense)}
                        onChange={e =>
                          setDomesticMonthlyExpense(Number(e.target.value))
                        }
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-700"
                      />
                      <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                        <span>$500</span>
                        <span>$4,800 (Domestic Baseline)</span>
                        <span>$10,000</span>
                      </div>
                    </div>

                    {/* Core Parameters 4 & 5: Annual Savings / SIP & Safe Withdrawal Rate */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <label className="font-extrabold text-emerald-950">
                            4. Annual Savings / SIP
                          </label>
                          <span className="font-mono font-black text-emerald-800">
                            $
                            {annualSavings >= 1000
                              ? `${(annualSavings / 1000).toFixed(0)}k`
                              : annualSavings.toLocaleString()}
                            /yr
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="120000"
                          step="1000"
                          value={Math.min(120000, annualSavings)}
                          onChange={e => {
                            const v = Number(e.target.value);
                            setAnnualSavings(v);
                            if (v > 0 && sipContinuityMode === 'paused') {
                              setSipContinuityMode('until-fire');
                            }
                          }}
                          className="w-full h-2 bg-emerald-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                        />
                        <div className="flex justify-between text-[10px] text-emerald-700 font-mono">
                          <span>$0 (Coast)</span>
                          <span>${Math.round(annualSavings / 12).toLocaleString()}/mo</span>
                          <span>$120k/yr</span>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-200/80 space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <label className="font-extrabold text-teal-950">
                            5. Safe Withdrawal (SWR)
                          </label>
                          <span className="font-mono font-black text-teal-900">
                            {safeWithdrawalRate.toFixed(1)}%{' '}
                            <span className="text-[10px] font-semibold text-teal-700">
                              ({swrMultiplier}x)
                            </span>
                          </span>
                        </div>
                        <input
                          type="range"
                          min="3.0"
                          max="5.0"
                          step="0.1"
                          value={safeWithdrawalRate}
                          onChange={e =>
                            setSafeWithdrawalRate(Number(e.target.value))
                          }
                          className="w-full h-2 bg-teal-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                        />
                        <div className="flex justify-between text-[10px] text-teal-700 font-mono">
                          <span>3.0% (33.3x)</span>
                          <span>4.0% (25x)</span>
                          <span>5.0% (20x)</span>
                        </div>
                      </div>
                    </div>

                    {/* Core Parameters 6 & 7: Expected Annual Return & Inflation Rate */}
                    <div className="grid grid-cols-2 gap-3.5">
                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <label className="font-bold text-slate-700">
                            Expected Return %
                          </label>
                          <span className="font-mono font-black text-teal-800">
                            {expectedGrowthRate.toFixed(1)}%/yr
                          </span>
                        </div>
                        <input
                          type="range"
                          min="3.0"
                          max="15.0"
                          step="0.5"
                          value={expectedGrowthRate}
                          onChange={e =>
                            setExpectedGrowthRate(Number(e.target.value))
                          }
                          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-700"
                        />
                      </div>

                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <label className="font-bold text-slate-700">
                            Annual Inflation %
                          </label>
                          <span className="font-mono font-black text-rose-700">
                            {inflationPct.toFixed(1)}%/yr
                          </span>
                        </div>
                        <input
                          type="range"
                          min="1.0"
                          max="10.0"
                          step="0.5"
                          value={inflationPct}
                          onChange={e => setInflationPct(Number(e.target.value))}
                          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
                        />
                      </div>
                    </div>

                    {/* ========================================================== */}
                    {/* PERSONAL & FINANCIAL PORTFOLIO PARAMETERS                  */}
                    {/* Locked with Login Prompt for Guests · Editable on Login    */}
                    {/* ========================================================== */}
                    <div className="rounded-2xl border border-indigo-200/90 bg-gradient-to-br from-indigo-50/60 via-white to-teal-50/40 p-4 space-y-3.5 shadow-2xs">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-7 h-7 rounded-xl flex items-center justify-center text-white shadow-2xs ${
                              isGuestUser
                                ? 'bg-gradient-to-br from-slate-700 to-indigo-800'
                                : 'bg-gradient-to-br from-emerald-600 to-teal-600'
                            }`}
                          >
                            {isGuestUser ? (
                              <Lock className="w-3.5 h-3.5" />
                            ) : (
                              <Unlock className="w-3.5 h-3.5" />
                            )}
                          </div>
                          <div>
                            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                              Personal &amp; 5-Scheme Financial Parameters
                            </h3>
                            <p className="text-[11px] text-slate-500">
                              {isGuestUser
                                ? 'Locked in Guest Mode — Log in to enter 5 asset schemes, salary, loans, passive income & milestones'
                                : 'Unlocked — All personal asset schemes, loans & milestones feed your Net FIRE Corpus'}
                            </p>
                          </div>
                        </div>

                        {isGuestUser ? (
                          <button
                            type="button"
                            onClick={() => openAuthModal('login')}
                            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-extrabold inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                          >
                            <LogIn className="w-3 h-3" />
                            <span>Log In to Enter Details</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSaveFirePlanToAccount()}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-extrabold inline-flex items-center gap-1 cursor-pointer shadow-2xs"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Save Portfolio</span>
                          </button>
                        )}
                      </div>

                      {/* Sub-navigation pills */}
                      <div className="grid grid-cols-4 gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-[11px] font-bold">
                        {[
                          { id: 'assets', label: '5 Asset Schemes' },
                          {
                            id: 'loans',
                            label: `Loans (${isGuestUser ? '🔒' : loansList.length})`,
                          },
                          {
                            id: 'passive',
                            label: `Passive (${isGuestUser ? '🔒' : sideIncomesList.length})`,
                          },
                          {
                            id: 'milestones',
                            label: `Milestones (${isGuestUser ? '🔒' : futureGoalsList.length})`,
                          },
                        ].map(tab => (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActivePortfolioSubTab(tab.id as any)}
                            className={`py-1.5 px-2 rounded-lg transition-all cursor-pointer truncate ${
                              activePortfolioSubTab === tab.id
                                ? 'bg-white text-indigo-950 shadow-2xs font-extrabold'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>

                      {isGuestUser ? (
                        /* GUEST LOCKED PREVIEW STATE */
                        <div className="relative rounded-xl border border-dashed border-indigo-300 bg-white/95 p-3.5 space-y-3">
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 opacity-70 pointer-events-none select-none text-[11px]">
                            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                              <span className="text-slate-500 block text-[10px]">
                                1. Cash &amp; High-Yield Savings
                              </span>
                              <span className="font-mono font-bold text-slate-800">
                                🔒 Log in to enter
                              </span>
                            </div>
                            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                              <span className="text-slate-500 block text-[10px]">
                                2. Stocks, ETFs &amp; Mutual Funds
                              </span>
                              <span className="font-mono font-bold text-emerald-800">
                                🔒 Log in to enter
                              </span>
                            </div>
                            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                              <span className="text-slate-500 block text-[10px]">
                                3. Real Estate &amp; 4. Family Gold
                              </span>
                              <span className="font-mono font-bold text-amber-800">
                                🔒 Include / Exclude
                              </span>
                            </div>
                            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                              <span className="text-slate-500 block text-[10px]">
                                5. Crypto / Bonds &amp; Age / Salary
                              </span>
                              <span className="font-mono font-bold text-indigo-800">
                                🔒 Age, Salary &amp; Step-Up
                              </span>
                            </div>
                            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                              <span className="text-slate-500 block text-[10px]">
                                Active Loans &amp; Monthly EMIs
                              </span>
                              <span className="font-mono font-bold text-rose-800">
                                🔒 Deduct Debt &amp; Roll EMI
                              </span>
                            </div>
                            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                              <span className="text-slate-500 block text-[10px]">
                                Passive Income &amp; Milestones
                              </span>
                              <span className="font-mono font-bold text-purple-800">
                                🔒 Rentals, College, Health
                              </span>
                            </div>
                          </div>

                          <div className="p-3.5 rounded-xl bg-gradient-to-r from-indigo-50/80 via-white to-teal-50/80 border border-indigo-200/80 text-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="space-y-0.5">
                              <div className="text-xs font-extrabold flex items-center gap-1.5 text-indigo-900">
                                <Lock className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                                <span>
                                  Log in to enter personal assets, loans &amp; milestones—or generate with basic info below!
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-600 leading-snug">
                                You can proceed right now with the basic sliders above to generate your full FIRE scorecard &amp; visual trajectory, or log in to unlock all 5 asset schemes.
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => openAuthModal('signup')}
                                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] cursor-pointer whitespace-nowrap"
                              >
                                Sign Up Free
                              </button>
                              <button
                                type="button"
                                onClick={() => openAuthModal('login')}
                                className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold text-[11px] cursor-pointer whitespace-nowrap"
                              >
                                Log In
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* LOGGED-IN UNLOCKED PERSONAL PORTFOLIO EDITOR */
                        <div className="space-y-3 text-xs">
                          {activePortfolioSubTab === 'assets' && (
                            <div className="space-y-3">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                {[
                                  {
                                    key: 'savingsUSD',
                                    label: '1. Cash & High-Yield Savings',
                                  },
                                  {
                                    key: 'stocksMutualFundsUSD',
                                    label: '2. Stocks, Index ETFs & MFs',
                                  },
                                  {
                                    key: 'realEstateUSD',
                                    label: '3. Real Estate Equity',
                                  },
                                  {
                                    key: 'goldUSD',
                                    label: '4. Physical Gold & Bullion',
                                  },
                                  {
                                    key: 'othersUSD',
                                    label: '5. Crypto, Bonds & Other',
                                  },
                                ].map(item => (
                                  <div
                                    key={item.key}
                                    className="p-2.5 rounded-xl bg-white border border-slate-200/90 space-y-1"
                                  >
                                    <label className="text-[10px] font-bold text-slate-600 uppercase block">
                                      {item.label}
                                    </label>
                                    <CurrencyAmountInput
                                      usdValue={
                                        investmentsDraft[
                                          item.key as keyof UserFinancialPortfolio['investments']
                                        ] || 0
                                      }
                                      onChangeUsd={val =>
                                        handleSchemeChange(
                                          item.key as keyof UserFinancialPortfolio['investments'],
                                          val
                                        )
                                      }
                                      currencyMode={inputCurrencyMode}
                                      countryMacro={countryMacro}
                                      inputSize="sm"
                                    />
                                  </div>
                                ))}

                                <div className="p-2.5 rounded-xl bg-indigo-50/60 border border-indigo-200/80 flex flex-col justify-between">
                                  <span className="text-[10px] font-bold text-indigo-900 uppercase">
                                    Corpus Inclusion Toggles
                                  </span>
                                  <div className="flex flex-col gap-1.5 pt-1">
                                    <label className="inline-flex items-center gap-2 text-[11px] font-semibold text-slate-800 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={includeGold}
                                        onChange={e => {
                                          const next = e.target.checked;
                                          setIncludeGold(next);
                                          const total =
                                            investmentsDraft.savingsUSD +
                                            investmentsDraft.stocksMutualFundsUSD +
                                            (includePrimaryHome
                                              ? investmentsDraft.realEstateUSD
                                              : 0) +
                                            (next ? investmentsDraft.goldUSD : 0) +
                                            investmentsDraft.othersUSD;
                                          setCurrentNetWorth(
                                            Math.max(0, Math.round(total))
                                          );
                                        }}
                                        className="rounded text-amber-600"
                                      />
                                      <span>Include Gold in FIRE Corpus</span>
                                    </label>
                                    <label className="inline-flex items-center gap-2 text-[11px] font-semibold text-slate-800 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={includePrimaryHome}
                                        onChange={e => {
                                          const next = e.target.checked;
                                          setIncludePrimaryHome(next);
                                          const total =
                                            investmentsDraft.savingsUSD +
                                            investmentsDraft.stocksMutualFundsUSD +
                                            (next
                                              ? investmentsDraft.realEstateUSD
                                              : 0) +
                                            (includeGold
                                              ? investmentsDraft.goldUSD
                                              : 0) +
                                            investmentsDraft.othersUSD;
                                          setCurrentNetWorth(
                                            Math.max(0, Math.round(total))
                                          );
                                        }}
                                        className="rounded text-indigo-600"
                                      />
                                      <span>Include Home Equity in FIRE</span>
                                    </label>
                                  </div>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                                <div>
                                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">
                                    Current Age
                                  </label>
                                  <input
                                    type="number"
                                    min={18}
                                    max={85}
                                    value={currentAge}
                                    onChange={e =>
                                      setCurrentAge(Number(e.target.value) || 38)
                                    }
                                    className="w-full px-2 py-1.5 rounded-lg border border-slate-300 font-mono font-bold text-xs bg-white"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">
                                    Target FIRE Age
                                  </label>
                                  <input
                                    type="number"
                                    min={25}
                                    max={90}
                                    value={targetFireAge}
                                    onChange={e =>
                                      setTargetFireAge(Number(e.target.value) || 48)
                                    }
                                    className="w-full px-2 py-1.5 rounded-lg border border-slate-300 font-mono font-bold text-xs bg-white"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">
                                    Monthly Salary ($)
                                  </label>
                                  <input
                                    type="number"
                                    step={250}
                                    min={0}
                                    value={monthlySalaryUSD}
                                    onChange={e =>
                                      setMonthlySalaryUSD(
                                        Math.max(0, Number(e.target.value) || 0)
                                      )
                                    }
                                    className="w-full px-2 py-1.5 rounded-lg border border-slate-300 font-mono font-bold text-xs bg-white"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">
                                    SIP Step-Up %/yr
                                  </label>
                                  <input
                                    type="number"
                                    step="1"
                                    min={0}
                                    max={25}
                                    value={sipStepUpPct}
                                    onChange={e =>
                                      setSipStepUpPct(
                                        Math.max(0, Number(e.target.value) || 0)
                                      )
                                    }
                                    className="w-full px-2 py-1.5 rounded-lg border border-slate-300 font-mono font-bold text-xs bg-white"
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          {activePortfolioSubTab === 'loans' && (
                            <div className="space-y-2.5">
                              {loansList.length === 0 ? (
                                <p className="text-[11px] text-slate-500 py-1">
                                  No active loans logged. Your balance sheet is 100% debt-free.
                                </p>
                              ) : (
                                <div className="space-y-1.5">
                                  {loansList.map(l => (
                                    <div
                                      key={l.id}
                                      className="p-2.5 rounded-xl bg-white border border-rose-200 flex items-center justify-between gap-2"
                                    >
                                      <div>
                                        <span className="font-bold text-slate-900">
                                          {l.name} ({l.category})
                                        </span>
                                        <span className="text-[11px] text-rose-700 font-mono block">
                                          Principal: $
                                          {l.outstandingPrincipalUSD.toLocaleString()}{' '}
                                          · EMI: ${l.monthlyEmiUSD.toLocaleString()}
                                          /mo ({l.remainingYears} yrs left)
                                        </span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setLoansList(prev =>
                                            prev.filter(item => item.id !== l.id)
                                          )
                                        }
                                        className="p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}

                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                                <input
                                  type="text"
                                  placeholder="Loan name (e.g. Mortgage)"
                                  value={newLoanName}
                                  onChange={e => setNewLoanName(e.target.value)}
                                  className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs"
                                />
                                <input
                                  type="number"
                                  placeholder="Principal $"
                                  value={newLoanPrincipal}
                                  onChange={e =>
                                    setNewLoanPrincipal(Number(e.target.value) || 0)
                                  }
                                  className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-mono text-xs"
                                />
                                <input
                                  type="number"
                                  placeholder="Monthly EMI $"
                                  value={newLoanEmi}
                                  onChange={e =>
                                    setNewLoanEmi(Number(e.target.value) || 0)
                                  }
                                  className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-mono text-xs"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (!newLoanName.trim()) return;
                                    setLoansList(prev => [
                                      ...prev,
                                      {
                                        id: `loan-${Date.now()}`,
                                        name: newLoanName.trim(),
                                        category: newLoanCategory,
                                        outstandingPrincipalUSD: newLoanPrincipal,
                                        interestRatePercent: newLoanRate,
                                        monthlyEmiUSD: newLoanEmi,
                                        remainingYears: newLoanYears,
                                      },
                                    ]);
                                    setNewLoanName('');
                                  }}
                                  className="px-3 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs cursor-pointer flex items-center justify-center gap-1"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Add Loan</span>
                                </button>
                              </div>
                            </div>
                          )}

                          {activePortfolioSubTab === 'passive' && (
                            <div className="space-y-2.5">
                              {sideIncomesList.length === 0 ? (
                                <p className="text-[11px] text-slate-500 py-1">
                                  No retirement passive income streams added yet.
                                </p>
                              ) : (
                                <div className="space-y-1.5">
                                  {sideIncomesList.map(s => (
                                    <div
                                      key={s.id}
                                      className="p-2.5 rounded-xl bg-white border border-emerald-200 flex items-center justify-between gap-2"
                                    >
                                      <div>
                                        <span className="font-bold text-slate-900">
                                          {s.name}
                                        </span>
                                        <span className="text-[11px] text-emerald-700 font-mono block">
                                          +${s.monthlyAmountUSD.toLocaleString()}/mo (
                                          {s.continuesInRetirement
                                            ? 'Continues in retirement'
                                            : 'Active phase only'}
                                          )
                                        </span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setSideIncomesList(prev =>
                                            prev.filter(item => item.id !== s.id)
                                          )
                                        }
                                        className="p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}

                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                                <input
                                  type="text"
                                  placeholder="Stream (e.g. Rental / Dividend)"
                                  value={newPassiveName}
                                  onChange={e => setNewPassiveName(e.target.value)}
                                  className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs"
                                />
                                <input
                                  type="number"
                                  placeholder="Monthly USD $"
                                  value={newPassiveMonthly}
                                  onChange={e =>
                                    setNewPassiveMonthly(Number(e.target.value) || 0)
                                  }
                                  className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-mono text-xs"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (!newPassiveName.trim()) return;
                                    setSideIncomesList(prev => [
                                      ...prev,
                                      {
                                        id: `side-${Date.now()}`,
                                        name: newPassiveName.trim(),
                                        category: newPassiveCategory,
                                        monthlyAmountUSD: newPassiveMonthly,
                                        continuesInRetirement: newPassiveContinues,
                                      },
                                    ]);
                                    setNewPassiveName('');
                                  }}
                                  className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs cursor-pointer flex items-center justify-center gap-1"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Add Passive Stream</span>
                                </button>
                              </div>
                            </div>
                          )}

                          {activePortfolioSubTab === 'milestones' && (
                            <div className="space-y-2.5">
                              {futureGoalsList.length === 0 ? (
                                <p className="text-[11px] text-slate-500 py-1">
                                  No one-time future milestone expenses logged.
                                </p>
                              ) : (
                                <div className="space-y-1.5">
                                  {futureGoalsList.map(g => (
                                    <div
                                      key={g.id}
                                      className="p-2.5 rounded-xl bg-white border border-purple-200 flex items-center justify-between gap-2"
                                    >
                                      <div>
                                        <span className="font-bold text-slate-900">
                                          {g.title}
                                        </span>
                                        <span className="text-[11px] text-purple-800 font-mono block">
                                          ${g.estimatedCostTodayUSD.toLocaleString()}{' '}
                                          · Target Year {g.targetYear}
                                        </span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setFutureGoalsList(prev =>
                                            prev.filter(item => item.id !== g.id)
                                          )
                                        }
                                        className="p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}

                              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1">
                                <input
                                  type="text"
                                  placeholder="Milestone (e.g. College)"
                                  value={newGoalTitle}
                                  onChange={e => setNewGoalTitle(e.target.value)}
                                  className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs"
                                />
                                <input
                                  type="number"
                                  placeholder="Cost Today $"
                                  value={newGoalCost}
                                  onChange={e =>
                                    setNewGoalCost(Number(e.target.value) || 0)
                                  }
                                  className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-mono text-xs"
                                />
                                <input
                                  type="number"
                                  placeholder="Year"
                                  value={newGoalYear}
                                  onChange={e =>
                                    setNewGoalYear(Number(e.target.value) || 2030)
                                  }
                                  className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-mono text-xs"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (!newGoalTitle.trim()) return;
                                    setFutureGoalsList(prev => [
                                      ...prev,
                                      {
                                        id: `goal-${Date.now()}`,
                                        title: newGoalTitle.trim(),
                                        category: newGoalCategory,
                                        estimatedCostTodayUSD: newGoalCost,
                                        targetYear: newGoalYear,
                                        priority: 'Essential',
                                      },
                                    ]);
                                    setNewGoalTitle('');
                                  }}
                                  className="px-3 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs cursor-pointer flex items-center justify-center gap-1"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Add Goal</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Primary CTA: Generate Full FIRE Scorecard, Trajectory & Survival Analysis */}
                    <button
                      type="button"
                      onClick={() => {
                        setHasGeneratedScorecard(true);
                        if (!isGuestUser) {
                          handleSaveFirePlanToAccount(
                            'Generated & Saved your personalized FIRE Scorecard, 25-Year Visual Trajectory & 50-Year Survival Report!'
                          );
                        }
                        const el = document.getElementById(
                          'unified-fire-scorecard-section'
                        );
                        if (el) {
                          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }}
                      className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-indigo-600 via-teal-600 to-emerald-600 hover:from-indigo-700 hover:to-emerald-700 text-white font-black text-xs sm:text-sm shadow-md shadow-indigo-500/15 transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <BarChart3 className="w-4 h-4 text-teal-100" />
                      <span>
                        {isGuestUser
                          ? 'Generate Full FIRE Scorecard, Trajectory & Survival Analysis'
                          : 'Generate & Save Personalized FIRE Scorecard'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Right Column: Comparative Geo-Arbitrage Results & Live FIRE Readiness */}
                  <div className="lg:col-span-6 space-y-5">
                    {/* Highlight Comparison Cards */}
                    <div className="grid grid-cols-2 gap-4">
                      <motion.div
                        whileHover={{ y: -3 }}
                        className="relative overflow-hidden p-5 rounded-3xl bg-gradient-to-br from-teal-50/45 via-white to-emerald-50/30 border border-teal-200/80 shadow-xs space-y-1"
                      >
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-emerald-500" />
                        <span className="text-xs font-extrabold text-teal-800 uppercase tracking-wide">
                          Nest Egg Abroad ({selectedTargetHaven})
                        </span>
                        <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tabular-nums">
                          ${fireNestEggAbroad.toLocaleString()}
                        </div>
                        <div className="text-xs text-teal-700 font-medium">
                          ${annualExpenseAbroad.toLocaleString()}/yr net ×{' '}
                          {swrMultiplier} ({safeWithdrawalRate.toFixed(1)}% SWR)
                        </div>
                      </motion.div>

                      <motion.div
                        whileHover={{ y: -3 }}
                        className="relative overflow-hidden p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-1"
                      >
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-slate-400 to-indigo-500" />
                        <span className="text-xs font-extrabold text-slate-600 uppercase tracking-wide">
                          Nest Egg at Home ({selectedBasisCountry})
                        </span>
                        <div className="text-2xl sm:text-3xl font-black text-slate-800 font-mono tabular-nums">
                          ${fireNestEggDomestic.toLocaleString()}
                        </div>
                        <div className="text-xs text-slate-500 font-medium">
                          ${annualExpenseDomestic.toLocaleString()}/yr net ×{' '}
                          {swrMultiplier} ({safeWithdrawalRate.toFixed(1)}% SWR)
                        </div>
                      </motion.div>
                    </div>

                    {/* Geo-Arbitrage Savings Banner (Light & Elegant) */}
                    <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-50/60 via-white to-teal-50/50 border border-emerald-200/80 text-slate-900 shadow-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                          {capitalSaved >= 0
                            ? 'Capital Required Slashed'
                            : 'Target Lifestyle Comparison'}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100/80 text-emerald-900 border border-emerald-200 text-xs font-extrabold">
                          {capitalSaved >= 0
                            ? `${capitalSavedPercent}% Less Capital`
                            : `${Math.abs(capitalSavedPercent)}% Higher Target`}
                        </span>
                      </div>
                      <div className="text-2xl sm:text-3xl font-black text-slate-900">
                        {capitalSaved >= 0
                          ? `Save $${capitalSaved.toLocaleString()} in Required Net Worth`
                          : `+$${Math.abs(capitalSaved).toLocaleString()} Additional Nest Egg vs. Home`}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        With ${effectiveNetCorpusTodayUSD.toLocaleString()} net FIRE
                        corpus today, you have already funded{' '}
                        <span className="font-extrabold text-emerald-700">
                          {fireProgressPercent}%
                        </span>{' '}
                        of your abroad retirement goal (vs.{' '}
                        <span className="font-extrabold text-indigo-700">
                          {fireProgressDomesticPercent}%
                        </span>{' '}
                        of your domestic goal).
                      </p>
                    </div>

                    {/* Years to Retirement Comparison */}
                    <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                          Years to Financial Freedom &amp; Work-Free Survival
                        </span>
                        <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-extrabold text-emerald-800">
                          {yearsToFireAbroad === 0 && yearsToFireDomestic === 0
                            ? 'Ready Today (Abroad & At Home)!'
                            : yearsToFireAbroad === 0
                            ? `Ready Abroad Today! (${yearsSaved} ${yearsSaved === 1 ? 'Yr' : 'Yrs'} Sooner Than Home)`
                            : yearsSaved > 0
                            ? `Retire ${yearsSaved} ${yearsSaved === 1 ? 'Year' : 'Years'} Sooner Abroad!`
                            : yearsToFireAbroad === yearsToFireDomestic
                            ? `Same Timeline (${yearsToFireAbroad} ${yearsToFireAbroad === 1 ? 'Year' : 'Years'} to Goal)`
                            : `Home Goal Reached ${yearsToFireAbroad - yearsToFireDomestic} ${
                                yearsToFireAbroad - yearsToFireDomestic === 1
                                  ? 'Yr'
                                  : 'Yrs'
                              } Sooner`}
                        </span>
                      </div>

                      {/* Row 1: Retirement Abroad Timeline & Funding Bar */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-700">
                            Retire Abroad ({selectedTargetHaven}){' '}
                            <span className="text-slate-400 font-normal">
                              (${effectiveMonthlyAbroadUSD.toLocaleString()}/mo · $
                              {fireNestEggAbroad.toLocaleString()} goal)
                            </span>
                          </span>
                          <span className="font-extrabold text-teal-700 font-mono">
                            {yearsToFireAbroad === 0
                              ? '0 Years (100% Funded Today!)'
                              : `${yearsToFireAbroad} ${yearsToFireAbroad === 1 ? 'Year' : 'Years'} (${fireProgressPercent}% Funded)`}
                          </span>
                        </div>
                        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-500 via-teal-500 to-emerald-500 rounded-full transition-all duration-500"
                            style={{ width: `${fireProgressPercent}%` }}
                          />
                        </div>
                      </div>

                      {/* Row 2: Retirement At Home Timeline & Funding Bar */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-600">
                            Retire at Home ({selectedBasisCountry}){' '}
                            <span className="text-slate-400 font-normal">
                              ($
                              {Math.round(
                                domesticMonthlyExpense * tierMultiplier
                              ).toLocaleString()}
                              /mo · ${fireNestEggDomestic.toLocaleString()} goal)
                            </span>
                          </span>
                          <span className="font-bold text-indigo-700 font-mono">
                            {yearsToFireDomestic === 0
                              ? '0 Years (100% Funded Today!)'
                              : `${yearsToFireDomestic} ${yearsToFireDomestic === 1 ? 'Year' : 'Years'} (${fireProgressDomesticPercent}% Funded)`}
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-400 to-slate-500 rounded-full transition-all duration-500"
                            style={{ width: `${fireProgressDomesticPercent}%` }}
                          />
                        </div>
                      </div>

                      {/* Quick Zero-Work Survival Preview */}
                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-[10px] font-bold uppercase text-slate-500 block">
                            0-Work Money Survival Abroad
                          </span>
                          <span className="font-mono font-extrabold text-teal-900">
                            {survivalSimulations.zeroWorkAbroadSim.isPerpetual
                              ? '50+ Yrs (Perpetual 2076+)'
                              : `${survivalSimulations.zeroWorkAbroadSim.wholeYears}y ${survivalSimulations.zeroWorkAbroadSim.remMonths}m (Until ${survivalSimulations.zeroWorkAbroadSim.survivalYear})`}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase text-slate-500 block">
                            0-Work Money Survival at Home
                          </span>
                          <span className="font-mono font-extrabold text-indigo-900">
                            {survivalSimulations.zeroWorkDomesticSim.isPerpetual
                              ? '50+ Yrs (Perpetual 2076+)'
                              : `${survivalSimulations.zeroWorkDomesticSim.wholeYears}y ${survivalSimulations.zeroWorkDomesticSim.remMonths}m (Until ${survivalSimulations.zeroWorkDomesticSim.survivalYear})`}
                          </span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() =>
                              openShareFireCardModal({
                                persona: currentPersona,
                                badgeTitle:
                                  fireProgressPercent >= 100
                                    ? '100% FI'
                                    : yearsSaved >= 5
                                    ? 'Arbitrage Architect'
                                    : 'FIRE Pathfinder',
                                badgeEmoji: fireProgressPercent >= 100 ? '🔥' : '⚡',
                                yearsSaved: Math.max(1, yearsSaved || 8),
                                fireProgressPercent,
                                topCountry:
                                  fireMatchedCountries[0]?.country.name ||
                                  selectedTargetHaven,
                                topCountryFlag: fireMatchedCountries[0]?.country.flag,
                                topCity:
                                  fireMatchedCountries[0]?.country.topCities?.[0]
                                    ?.name ||
                                  fireMatchedCountries[0]?.country.capital ||
                                  'Lisbon',
                                monthlyBurnUSD: effectiveMonthlyAbroadUSD,
                                domesticMonthlyBurnUSD: domesticMonthlyExpense,
                                currentNetWorthUSD: effectiveNetCorpusTodayUSD,
                                targetFireNestEggUSD: fireNestEggAbroad,
                                swrPercent: safeWithdrawalRate,
                                headlineMode:
                                  yearsSaved > 0 ? 'years-saved' : 'fi-percent',
                              })
                            }
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-50 via-purple-50 to-rose-50 hover:from-indigo-100 hover:via-purple-100 hover:to-rose-100 text-indigo-950 border border-indigo-200/90 text-xs font-extrabold shadow-2xs transition-all inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                          >
                            <span>🏅 Create Shareable FIRE Card</span>
                          </button>

                          {isGuestUser ? (
                            <button
                              type="button"
                              onClick={() => openAuthModal('signup')}
                              className="text-xs font-extrabold text-indigo-700 hover:text-teal-700 inline-flex items-center gap-1.5 cursor-pointer group whitespace-nowrap"
                            >
                              <span>Sign Up to Save &amp; Track Progress</span>
                              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSaveFirePlanToAccount()}
                              className="text-xs font-extrabold text-emerald-700 hover:text-teal-800 inline-flex items-center gap-1.5 cursor-pointer group whitespace-nowrap"
                            >
                              <span>Save Scorecard to Account</span>
                              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                            </button>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {expectedGrowthRate}% return · ${(annualSavings / 1000).toFixed(0)}k/yr SIP
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ========================================================== */}
                {/* UNIFIED FULL FIRE SCORECARD, VISUAL TRAJECTORY & PLANNER   */}
                {/* Gated First for Guests · Full Dashboard Engine on Generate */}
                {/* ========================================================== */}
                <div
                  id="unified-fire-scorecard-section"
                  className="relative z-10 mt-8 pt-8 border-t border-slate-200/80 space-y-6 scroll-mt-20"
                >
                  {!hasGeneratedScorecard && isGuestUser ? (
                    /* STEP 1 FOR GUESTS: VALUE-FIRST GATE IN CLEAN LIGHT STYLE */
                    <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-indigo-50/45 via-white to-teal-50/45 text-slate-900 border border-indigo-200/80 shadow-xs space-y-6">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="space-y-2.5 max-w-2xl">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 text-[11px] font-extrabold uppercase tracking-wider">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                            <span>
                              Exhaustive FIRE Calculator, Visual Trajectory &amp; Independence Planner
                            </span>
                          </div>
                          <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
                            Generate Your Full FIRE Scorecard, 25-Year Visual Trajectory &amp; 50-Year Survival Report
                          </h2>
                          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                            Proceed with your basic sliders above ($
                            {currentNetWorth.toLocaleString()} assets, $
                            {targetMonthlyExpenseAbroad.toLocaleString()}/mo abroad, $
                            {domesticMonthlyExpense.toLocaleString()}/mo at home) to
                            generate the complete FIRE intelligence suite right now—or
                            sign up free to enter your 5 asset schemes, loans, passive
                            income, and family milestones and save it to your account.
                          </p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                          <button
                            type="button"
                            onClick={() => setHasGeneratedScorecard(true)}
                            className="px-5 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-xs cursor-pointer flex items-center justify-center gap-2 transition-colors"
                          >
                            <BarChart3 className="w-4 h-4" />
                            <span>Generate Full FIRE Scorecard Now (With Basic Info)</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => openAuthModal('signup')}
                            className="px-4 py-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-xs cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <UserPlus className="w-4 h-4 text-teal-600" />
                            <span>Sign Up &amp; Enter Full Portfolio</span>
                          </button>
                        </div>
                      </div>

                      {/* Preview Grid of What's Unlocked inside the Full FIRE Scorecard */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs pt-4 border-t border-slate-200/80">
                        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 space-y-1">
                          <span className="text-indigo-800 font-extrabold block">
                            1. 4-Stage FIRE Thermometer &amp; KPIs
                          </span>
                          <p className="text-[11px] text-slate-600">
                            Coast, Lean, Standard &amp; Fat FIRE thresholds plus itemized corpus &amp; formula audit.
                          </p>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 space-y-1">
                          <span className="text-teal-800 font-extrabold block">
                            2. 25-Year Visual Trajectory Chart
                          </span>
                          <p className="text-[11px] text-slate-600">
                            Interactive Recharts compounding curve, SIP returns breakdown &amp; crossover year.
                          </p>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 space-y-1">
                          <span className="text-indigo-800 font-extrabold block">
                            3. 50-Year Work-Free Survival Simulator
                          </span>
                          <p className="text-[11px] text-slate-600">
                            Exact calendar year your money lasts with 0 work, remote nomad income, or a career break.
                          </p>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 space-y-1">
                          <span className="text-emerald-800 font-extrabold block">
                            4. Diagnostics &amp; 1-Click Accelerators
                          </span>
                          <p className="text-[11px] text-slate-600">
                            Personalized strengths, inflation watchouts, and quantified levers to retire years earlier.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* STEP 2: FULL GENERATED FIRE SCORECARD, VISUAL TRAJECTORY & INDEPENDENCE PLANNER */
                    <div className="space-y-6 animate-in fade-in duration-300">
                      {/* Light Guest Callout Banner at Top of Generated Scorecard */}
                      {isGuestUser && (
                        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-indigo-50/60 via-white to-teal-50/60 text-slate-900 border border-indigo-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="space-y-1 max-w-3xl">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 text-[11px] font-extrabold uppercase">
                              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                              <span>
                                Basic FIRE Scorecard Generated · {fireProgressPercent}% Funded (${monthlySafeWithdrawalIncomeUSD.toLocaleString()}/mo Safe Withdrawal)
                              </span>
                            </div>
                            <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                              Want Your Personalized FIRE Scorecard with 5 Asset Schemes, Loans &amp; Family Milestones?
                            </h3>
                            <p className="text-xs text-slate-600 leading-relaxed">
                              This scorecard was generated from your basic sliders. Sign up free to enter your <strong>5-Scheme Asset Breakdown (Cash, Stocks, Real Estate, Family Gold, Crypto)</strong>, deduct <strong>Active Loans/EMIs</strong>, add <strong>Passive Income &amp; Future Milestones</strong>, and save this scorecard to your dashboard to track your progress over time.
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => openAuthModal('signup')}
                              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer inline-flex items-center gap-1.5 shadow-2xs transition-colors"
                            >
                              <UserPlus className="w-4 h-4" />
                              <span>Sign Up Free &amp; Save Scorecard</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => openAuthModal('login')}
                              className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-bold cursor-pointer transition-colors"
                            >
                              Log In
                            </button>
                          </div>
                        </div>
                      )}

                      {/* ====================================================== */}
                      {/* A. TOP 4 UNIFIED EXECUTIVE FIRE KPI CARDS              */}
                      {/* ====================================================== */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* KPI 1: Current Net FIRE Corpus */}
                        <div className="p-5 rounded-2xl border border-slate-200 bg-white/95 shadow-2xs flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between mb-1.5 gap-1">
                              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                1. Current Net FIRE Corpus
                              </span>
                              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-teal-100 text-teal-800">
                                {uncappedFireProgressPct}% Funded
                              </span>
                            </div>
                            <div className="text-xl sm:text-2xl font-extrabold font-mono text-slate-900 tabular-nums">
                              ${effectiveNetCorpusTodayUSD.toLocaleString()}
                            </div>
                            <div className="mt-2.5 p-2 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1 text-[10px] font-mono text-slate-600">
                              <div className="flex items-center justify-between">
                                <span className="font-sans text-slate-500">
                                  Cash + Stocks + Other:
                                </span>
                                <span className="font-bold text-slate-800">
                                  +${coreFinancialLiquidAssets.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="font-sans text-slate-500">
                                  Gold &amp; Bullion:
                                </span>
                                <span
                                  className={`font-bold ${
                                    includeGold ? 'text-amber-700' : 'text-slate-400'
                                  }`}
                                >
                                  {includeGold
                                    ? `+$${(effectiveInvestments.goldUSD || 0).toLocaleString()}`
                                    : '$0 (Excluded)'}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="font-sans text-slate-500">
                                  Real Estate Equity:
                                </span>
                                <span
                                  className={`font-bold ${
                                    includePrimaryHome
                                      ? 'text-indigo-700'
                                      : 'text-slate-400'
                                  }`}
                                >
                                  {includePrimaryHome
                                    ? `+$${(effectiveInvestments.realEstateUSD || 0).toLocaleString()}`
                                    : '$0 (Excluded)'}
                                </span>
                              </div>
                              <div className="flex items-center justify-between border-t border-slate-200 pt-0.5">
                                <span className="font-sans text-slate-500">
                                  Less Loan Principal:
                                </span>
                                <span className="font-bold text-rose-700">
                                  -${totalLoanPrincipalUSD.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                            <span>
                              {isGuestUser ? 'Basic Estimate' : '5-Scheme Verified'}
                            </span>
                            <span className="font-mono font-bold text-indigo-800">
                              SWR Income: ${monthlySafeWithdrawalIncomeUSD.toLocaleString()}/mo
                            </span>
                          </div>
                        </div>

                        {/* KPI 2: Target FIRE Corpus Abroad */}
                        <div className="p-5 rounded-2xl border border-indigo-200/90 bg-gradient-to-br from-indigo-50/35 via-white to-teal-50/25 shadow-2xs flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[11px] font-bold text-indigo-950 uppercase tracking-wider">
                                2. Target {fireTier.toUpperCase()} FIRE Corpus
                              </span>
                              <Flame className="w-4 h-4 text-indigo-600" />
                            </div>
                            <div className="text-xl sm:text-2xl font-extrabold font-mono text-slate-900 tabular-nums">
                              ${fireNestEggAbroad.toLocaleString()}
                            </div>
                            <div className="mt-2.5 p-2 rounded-xl bg-white/90 border border-slate-200/80 space-y-1 text-[10px] font-mono text-slate-700">
                              <div className="flex items-center justify-between">
                                <span className="font-sans text-slate-500">
                                  Net Abroad Need (${netMonthlyAbroadPortfolioNeedUSD.toLocaleString()}/mo × 12):
                                </span>
                                <span className="font-bold text-slate-800">
                                  ${annualExpenseAbroad.toLocaleString()}/yr
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="font-sans text-slate-500">
                                  Living Corpus (×{swrMultiplier} at{' '}
                                  {safeWithdrawalRate.toFixed(1)}% SWR):
                                </span>
                                <span className="font-bold text-slate-800">
                                  +${activeFireTargetTodayUSD.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex items-center justify-between border-t border-slate-100 pt-0.5">
                                <span className="font-sans text-slate-500">
                                  Plus One-Time Future Milestones:
                                </span>
                                <span className="font-bold text-purple-800">
                                  +${totalFutureGoalsTodayUSD.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="mt-3 pt-2 border-t border-slate-200/70 text-[11px] text-slate-600 flex items-center justify-between">
                            <span>Haven: {selectedTargetHaven}</span>
                            <span className="font-mono font-bold text-emerald-700">
                              Saves ${Math.max(0, capitalSaved).toLocaleString()} vs. Home
                            </span>
                          </div>
                        </div>

                        {/* KPI 3: Monthly SIP & Expenses Flow */}
                        <div className="p-5 rounded-2xl border border-slate-200 bg-white/95 shadow-2xs flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                3. Monthly SIP &amp; Cash Flow
                              </span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                  isSipStopped
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-emerald-100 text-emerald-800'
                                }`}
                              >
                                {isSipStopped
                                  ? 'Coast Mode ($0)'
                                  : `+$${(annualSavings / 1000).toFixed(0)}k/yr`}
                              </span>
                            </div>
                            <div className="text-xl sm:text-2xl font-extrabold font-mono text-emerald-800 tabular-nums">
                              ${effectiveMonthlySipUSD.toLocaleString()}/mo
                            </div>
                            <div className="mt-2.5 p-2 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1 text-[10px] font-mono text-slate-600">
                              <div className="flex items-center justify-between">
                                <span className="font-sans text-slate-500">
                                  Current Domestic Cost:
                                </span>
                                <span className="font-bold text-rose-700">
                                  ${domesticMonthlyExpense.toLocaleString()}/mo
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="font-sans text-slate-500">
                                  Target Abroad Cost:
                                </span>
                                <span className="font-bold text-emerald-700">
                                  ${effectiveMonthlyAbroadUSD.toLocaleString()}/mo
                                </span>
                              </div>
                              <div className="flex items-center justify-between border-t border-slate-200 pt-0.5">
                                <span className="font-sans text-slate-500">
                                  Retire Passive Offset:
                                </span>
                                <span className="font-bold text-teal-800">
                                  +${passiveMonthlyInRetirementUSD.toLocaleString()}/mo
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-600 flex items-center justify-between">
                            <span>Compounding Return:</span>
                            <span className="font-mono font-bold text-teal-800">
                              {expectedGrowthRate}%/yr ({realReturnPct}% real)
                            </span>
                          </div>
                        </div>

                        {/* KPI 4: Time to FIRE & Work-Free Survival Year */}
                        <div className="p-5 rounded-2xl border border-teal-300/80 bg-gradient-to-br from-teal-50/70 via-white to-indigo-50/50 shadow-2xs flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                                4. Time to FIRE &amp; Survival Year
                              </span>
                              <Clock className="w-4 h-4 text-teal-600" />
                            </div>
                            {yearsToFireAbroad === 0 ? (
                              <div className="text-xl sm:text-2xl font-extrabold text-emerald-700">
                                FIRE Achieved! 🎉
                              </div>
                            ) : (
                              <div className="text-xl sm:text-2xl font-extrabold font-mono text-indigo-950 tabular-nums">
                                {yearsToFireAbroad} Years{' '}
                                <span className="text-xs font-sans font-semibold text-slate-500">
                                  (Year {trajectoryData.crossoverYear || '2051+'})
                                </span>
                              </div>
                            )}

                            <div className="mt-2.5 p-2 rounded-xl bg-white border border-slate-200/80 space-y-1 text-[10px] font-mono text-slate-600">
                              <div className="flex items-center justify-between">
                                <span className="font-sans text-slate-500">
                                  0-Work Survival Abroad:
                                </span>
                                <span className="font-bold text-teal-800">
                                  {survivalSimulations.zeroWorkAbroadSim.isPerpetual
                                    ? '2076+ (Perpetual)'
                                    : `Until ${survivalSimulations.zeroWorkAbroadSim.survivalYear} (${survivalSimulations.zeroWorkAbroadSim.exactRunwayYears}y)`}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="font-sans text-slate-500">
                                  With Nomad (${expectedNomadMonthlyIncomeUSD.toLocaleString()}/mo):
                                </span>
                                <span className="font-bold text-indigo-800">
                                  {survivalSimulations.withNomadSim.isPerpetual
                                    ? '2076+ (Perpetual)'
                                    : `Until ${survivalSimulations.withNomadSim.survivalYear} (${survivalSimulations.withNomadSim.exactRunwayYears}y)`}
                                </span>
                              </div>
                              <div className="flex items-center justify-between border-t border-slate-100 pt-0.5">
                                <span className="font-sans text-slate-500">
                                  Net {gapOrSurplusUSD >= 0 ? 'Surplus' : 'Gap'}{' '}
                                  Today:
                                </span>
                                <span
                                  className={`font-bold ${
                                    gapOrSurplusUSD >= 0
                                      ? 'text-emerald-700'
                                      : 'text-rose-700'
                                  }`}
                                >
                                  {gapOrSurplusUSD >= 0 ? '+' : '-'}$
                                  {Math.abs(gapOrSurplusUSD).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="mt-3 pt-2 border-t border-slate-200/80 text-[11px] text-slate-600 flex items-center justify-between">
                            <span>Money Lasts (0 Work):</span>
                            <span className="font-mono font-bold text-teal-900">
                              {survivalSimulations.zeroWorkAbroadSim.isPerpetual
                                ? `Forever (Age ${currentAge + 50}+)`
                                : `Year ${survivalSimulations.zeroWorkAbroadSim.survivalYear} (Age ${survivalSimulations.zeroWorkAbroadSim.survivalAge})`}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* ====================================================== */}
                      {/* B. 4-STAGE FIRE THERMOMETER & 25-YR VISUAL TRAJECTORY  */}
                      {/* ====================================================== */}
                      <div className="p-5 sm:p-7 rounded-3xl bg-white/95 border border-indigo-200/80 shadow-md space-y-5">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-teal-600 text-white text-[11px] font-extrabold uppercase tracking-wider">
                                <Award className="w-3.5 h-3.5 text-amber-300" />
                                <span>
                                  {isGuestUser
                                    ? 'FIRE Independence Thermometer & Visual Trajectory (Basic Info)'
                                    : `${userProfile.name}'s Personalized FIRE Scorecard & Visual Trajectory`}
                                </span>
                              </span>
                              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300">
                                {fireProgressPercent}% FI Readiness
                              </span>
                            </div>
                            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1.5">
                              4-Stage Milestone Thermometer &amp; 25-Year Compounding Trajectory
                            </h2>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setShowFormulaAudit(!showFormulaAudit)}
                              className="px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 font-bold text-xs cursor-pointer"
                            >
                              {showFormulaAudit
                                ? 'Hide Formula Audit ▲'
                                : '∑ View Step-by-Step Formula Audit ▼'}
                            </button>
                            {isGuestUser ? (
                              <button
                                type="button"
                                onClick={() => openAuthModal('signup')}
                                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-2xs cursor-pointer inline-flex items-center gap-1.5 transition-colors"
                              >
                                <UserPlus className="w-3.5 h-3.5" />
                                <span>Sign Up Free to Customize &amp; Save</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleSaveFirePlanToAccount()}
                                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-sm cursor-pointer inline-flex items-center gap-1.5"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                                <span>Save &amp; Track in My Account</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Expandable 3-Step Formula Audit Panel */}
                        {showFormulaAudit && (
                          <div className="p-4 rounded-2xl bg-slate-50 border border-indigo-200/80 grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs animate-in fade-in">
                            <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1.5">
                              <span className="font-extrabold text-slate-900 uppercase text-[11px] block">
                                Step 1: Net FIRE Corpus Today
                              </span>
                              <p className="text-[11px] text-slate-600">
                                Cash/Stocks/Other ($
                                {coreFinancialLiquidAssets.toLocaleString()}) + Gold (
                                {includeGold
                                  ? `$${(effectiveInvestments.goldUSD || 0).toLocaleString()}`
                                  : '$0'}
                                ) + Home Equity (
                                {includePrimaryHome
                                  ? `$${(effectiveInvestments.realEstateUSD || 0).toLocaleString()}`
                                  : '$0'}
                                ) − Loan Principal ($
                                {totalLoanPrincipalUSD.toLocaleString()}) ={' '}
                                <strong className="font-mono text-slate-900">
                                  ${effectiveNetCorpusTodayUSD.toLocaleString()}
                                </strong>
                              </p>
                            </div>
                            <div className="p-3.5 rounded-xl bg-white border border-orange-200 space-y-1.5">
                              <span className="font-extrabold text-orange-950 uppercase text-[11px] block">
                                Step 2: Target FIRE Nest Egg Abroad
                              </span>
                              <p className="text-[11px] text-slate-600">
                                (${effectiveMonthlyAbroadUSD.toLocaleString()}/mo − $
                                {passiveMonthlyInRetirementUSD.toLocaleString()}/mo
                                passive) × 12 ÷ {safeWithdrawalRate.toFixed(1)}% SWR +
                                ${totalFutureGoalsTodayUSD.toLocaleString()} milestones
                                ={' '}
                                <strong className="font-mono text-orange-950">
                                  ${fireNestEggAbroad.toLocaleString()}
                                </strong>
                              </p>
                            </div>
                            <div className="p-3.5 rounded-xl bg-white border border-purple-200 space-y-1.5">
                              <span className="font-extrabold text-purple-950 uppercase text-[11px] block">
                                Step 3: Coast FIRE &amp; Crossover Year
                              </span>
                              <p className="text-[11px] text-slate-600">
                                At {realReturnPct}% real return/yr, Coast FIRE today is{' '}
                                <strong className="font-mono text-indigo-900">
                                  ${coastFireTargetTodayUSD.toLocaleString()}
                                </strong>
                                , and your trajectory crosses 100% FIRE in{' '}
                                <strong>
                                  {yearsToFireAbroad === 0
                                    ? '0 Years (Achieved Today!)'
                                    : `${yearsToFireAbroad} Years (Year ${trajectoryData.crossoverYear || '2051+'})`}
                                </strong>
                                .
                              </p>
                            </div>
                          </div>
                        )}

                        {/* 4-Stage Milestone Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs">
                          {[
                            {
                              stage: `Stage 1: Coast FIRE (Age ${targetFireAge})`,
                              targetUSD: coastFireTargetTodayUSD,
                              desc: 'Corpus needed today so compounding alone hits your goal',
                              achieved:
                                effectiveNetCorpusTodayUSD >= coastFireTargetTodayUSD,
                            },
                            {
                              stage: 'Stage 2: Lean FIRE Abroad (80%)',
                              targetUSD:
                                leanFireTargetTodayUSD + totalFutureGoalsTodayUSD,
                              desc: 'Essential overseas living + future milestones covered',
                              achieved:
                                effectiveNetCorpusTodayUSD >=
                                leanFireTargetTodayUSD + totalFutureGoalsTodayUSD,
                            },
                            {
                              stage: 'Stage 3: Standard FIRE Abroad (100%)',
                              targetUSD:
                                standardFireTargetTodayUSD + totalFutureGoalsTodayUSD,
                              desc: `Full $${targetMonthlyExpenseAbroad.toLocaleString()}/mo target lifestyle funded`,
                              achieved:
                                effectiveNetCorpusTodayUSD >=
                                standardFireTargetTodayUSD + totalFutureGoalsTodayUSD,
                            },
                            {
                              stage: 'Stage 4: Fat FIRE Abroad (135%)',
                              targetUSD:
                                fatFireTargetTodayUSD + totalFutureGoalsTodayUSD,
                              desc: `Abundant luxury ($${Math.round(targetMonthlyExpenseAbroad * 1.35).toLocaleString()}/mo) + healthcare buffer`,
                              achieved:
                                effectiveNetCorpusTodayUSD >=
                                fatFireTargetTodayUSD + totalFutureGoalsTodayUSD,
                            },
                          ].map(item => {
                            const pct = Math.min(
                              999,
                              Math.round(
                                (effectiveNetCorpusTodayUSD /
                                  Math.max(1, item.targetUSD)) *
                                  100
                              )
                            );
                            return (
                              <div
                                key={item.stage}
                                className={`p-4 rounded-2xl border flex flex-col justify-between gap-2 ${
                                  item.achieved
                                    ? 'bg-emerald-50/80 border-emerald-300'
                                    : 'bg-slate-50/80 border-slate-200/90'
                                }`}
                              >
                                <div>
                                  <div className="flex items-center justify-between gap-1 text-[10px] font-extrabold uppercase tracking-wider">
                                    <span
                                      className={
                                        item.achieved
                                          ? 'text-emerald-900'
                                          : 'text-indigo-950'
                                      }
                                    >
                                      {item.stage}
                                    </span>
                                    <span
                                      className={`px-1.5 py-0.5 rounded font-mono text-[10px] ${
                                        item.achieved
                                          ? 'bg-emerald-200/80 text-emerald-950 font-black'
                                          : 'bg-white text-slate-700 border border-slate-200'
                                      }`}
                                    >
                                      {item.achieved ? `✓ ${pct}%` : `${pct}%`}
                                    </span>
                                  </div>
                                  <div className="text-base font-black font-mono text-slate-900 mt-1">
                                    ${item.targetUSD.toLocaleString()}
                                  </div>
                                  <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                                    {item.desc}
                                  </p>
                                </div>
                                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${
                                      item.achieved
                                        ? 'bg-emerald-600'
                                        : 'bg-indigo-600'
                                    }`}
                                    style={{ width: `${Math.min(100, pct)}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Interactive Visual Trajectory Chart (Recharts) */}
                        <FireProgressChart
                          currentYear={currentYear}
                          currentAge={currentAge}
                          targetFireAge={targetFireAge}
                          selectedBasisCountry={selectedTargetHaven}
                          targetHavenCountryName={selectedBasisCountry}
                          costBasisMode="residing"
                          countryMacro={countryMacro}
                          expectedReturnPct={expectedGrowthRate}
                          inflationPct={inflationPct}
                          sipStepUpPct={isGuestUser ? 0 : sipStepUpPct}
                          investments={effectiveInvestments}
                          liquidAssetsUSD={liquidAssetsUSD}
                          totalGrossAssetsUSD={totalGrossAssetsUSD}
                          startingCorpusTodayUSD={effectiveNetCorpusTodayUSD}
                          coastFireTargetTodayUSD={coastFireTargetTodayUSD}
                          leanFireTargetTodayUSD={leanFireTargetTodayUSD}
                          standardFireTargetTodayUSD={standardFireTargetTodayUSD}
                          fatFireTargetTodayUSD={fatFireTargetTodayUSD}
                          comprehensiveFireNumberTodayUSD={fireNestEggAbroad}
                          totalFutureGoalsTodayUSD={totalFutureGoalsTodayUSD}
                          crossoverYear={trajectoryData.crossoverYear}
                          crossoverAge={trajectoryData.crossoverAge}
                          trajectory={trajectoryData.points}
                        />
                      </div>

                      {/* ====================================================== */}
                      {/* C. 50-YEAR WORK-FREE RUNWAY & SURVIVAL YEAR SIMULATOR  */}
                      {/* ====================================================== */}
                      <div className="p-5 sm:p-7 rounded-3xl bg-gradient-to-br from-teal-50/80 via-white to-indigo-50/70 border border-teal-200/90 shadow-md space-y-5">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 border-b border-teal-100">
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                              <Globe className="w-4 h-4" />
                            </div>
                            <div>
                              <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                                How Long Your Money Lasts — 50-Year Work-Free Runway &amp; Survival Year Simulator
                              </h3>
                              <p className="text-xs text-slate-600 mt-0.5">
                                Simulates exact portfolio survival from{' '}
                                <strong>
                                  {currentYear} to {currentYear + 50}
                                </strong>{' '}
                                in <strong>{selectedTargetHaven}</strong> ($
                                {effectiveMonthlyAbroadUSD.toLocaleString()}/mo) at{' '}
                                {expectedGrowthRate}% return and {inflationPct}%
                                inflation.
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              setShowSurvivalTimelineTable(!showSurvivalTimelineTable)
                            }
                            className="px-3.5 py-2 rounded-xl bg-white border border-teal-300 hover:bg-teal-50 text-teal-950 text-xs font-extrabold cursor-pointer self-start lg:self-auto"
                          >
                            {showSurvivalTimelineTable
                              ? 'Hide Year-by-Year Survival Table ▲'
                              : 'View Year-by-Year Survival Table (2026–2076) ▼'}
                          </button>
                        </div>

                        {/* 4 Survival & Runway Intelligence Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs">
                          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-900 block">
                              A. Without Working (0 Active Income)
                            </span>
                            <div className="text-lg font-black font-mono text-slate-900">
                              {survivalSimulations.zeroWorkAbroadSim.isPerpetual
                                ? '50+ Years (Never Depletes)'
                                : `${survivalSimulations.zeroWorkAbroadSim.wholeYears} Yrs, ${survivalSimulations.zeroWorkAbroadSim.remMonths} Mos`}
                            </div>
                            <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-50 text-indigo-950 font-mono text-[11px] font-bold">
                              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                              <span>
                                {survivalSimulations.zeroWorkAbroadSim.isPerpetual
                                  ? `Beyond Year ${currentYear + 50}+`
                                  : `Until Year ${survivalSimulations.zeroWorkAbroadSim.survivalYear} (Age ${survivalSimulations.zeroWorkAbroadSim.survivalAge})`}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 leading-relaxed">
                              If you stop all active work today and live off your $
                              {effectiveNetCorpusTodayUSD.toLocaleString()} corpus in{' '}
                              {selectedTargetHaven}.
                            </p>
                          </div>

                          <div className="p-4 rounded-2xl bg-white border-2 border-teal-400/70 shadow-2xs space-y-2">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-900 block">
                              B. With Expected Nomad Income (+$
                              {expectedNomadMonthlyIncomeUSD.toLocaleString()}/mo)
                            </span>
                            <div className="text-lg font-black font-mono text-teal-900">
                              {survivalSimulations.withNomadSim.isPerpetual
                                ? '50+ Years (Perpetual)'
                                : `${survivalSimulations.withNomadSim.wholeYears} Yrs, ${survivalSimulations.withNomadSim.remMonths} Mos`}
                            </div>
                            <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-teal-50 text-teal-950 font-mono text-[11px] font-bold">
                              <Calendar className="w-3.5 h-3.5 text-teal-600" />
                              <span>
                                {survivalSimulations.withNomadSim.isPerpetual
                                  ? `Survives Forever (${currentYear + 50}+)`
                                  : `Until Year ${survivalSimulations.withNomadSim.survivalYear} (Age ${survivalSimulations.withNomadSim.survivalAge})`}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 leading-relaxed">
                              Earning ${expectedNomadMonthlyIncomeUSD.toLocaleString()}
                              /mo remotely for {nomadIncomeActiveYears} years while
                              living abroad.
                            </p>
                          </div>

                          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-900 block">
                              C. Take {plannedSabbaticalYears}-Yr Work-Free Break Now
                            </span>
                            <div className="text-lg font-black font-mono text-purple-950">
                              $
                              {survivalSimulations.sabbaticalThenNomadSim.balanceAfterSabbaticalUSD.toLocaleString()}
                            </div>
                            <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-purple-50 text-purple-950 font-mono text-[11px] font-bold">
                              <span>
                                Left in {currentYear + plannedSabbaticalYears} ·{' '}
                                {survivalSimulations.sabbaticalThenNomadSim.isPerpetual
                                  ? 'Then Perpetual'
                                  : `Until ${survivalSimulations.sabbaticalThenNomadSim.survivalYear}`}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 leading-relaxed">
                              Take {plannedSabbaticalYears} yrs completely off work ($0
                              income), then earn remote income for{' '}
                              {nomadIncomeActiveYears} yrs.
                            </p>
                          </div>

                          <div className="p-4 rounded-2xl bg-white border border-emerald-200/80 shadow-2xs space-y-2">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-900 block">
                              D. Perpetual Survival Threshold
                            </span>
                            <div className="text-lg font-black font-mono text-emerald-950">
                              {survivalSimulations.zeroWorkAbroadSim.isPerpetual
                                ? '$0 / mo Needed!'
                                : `$${survivalSimulations.minMonthlyNomadForPerpetualUSD.toLocaleString()}/mo`}
                            </div>
                            <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 text-emerald-900 font-mono text-[11px] font-bold">
                              <span>
                                {survivalSimulations.zeroWorkAbroadSim.isPerpetual
                                  ? 'Already Perpetual on 0 Work!'
                                  : `Min. Remote Income (${nomadIncomeActiveYears}y) → Perpetual`}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 leading-relaxed">
                              {survivalSimulations.zeroWorkAbroadSim.isPerpetual
                                ? 'Your corpus already compounds faster than your abroad withdrawals!'
                                : `Earning $${survivalSimulations.minMonthlyNomadForPerpetualUSD.toLocaleString()}/mo for ${nomadIncomeActiveYears} yrs makes your money last forever.`}
                            </p>
                          </div>
                        </div>

                        {/* Interactive Sliders for Nomad Bridge & Sabbatical Stress Test */}
                        <div className="p-4 rounded-2xl bg-white/95 border border-slate-200/90 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                          <div className="space-y-1">
                            <div className="flex justify-between font-bold text-slate-800">
                              <span>Expected Remote / Nomad Income</span>
                              <span className="font-mono text-teal-800">
                                ${expectedNomadMonthlyIncomeUSD.toLocaleString()}/mo
                              </span>
                            </div>
                            <input
                              type="range"
                              min={0}
                              max={6000}
                              step={100}
                              value={expectedNomadMonthlyIncomeUSD}
                              onChange={e =>
                                setExpectedNomadMonthlyIncomeUSD(
                                  Number(e.target.value)
                                )
                              }
                              className="w-full accent-teal-600 cursor-pointer"
                            />
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between font-bold text-slate-800">
                              <span>Active Nomad Earning Horizon</span>
                              <span className="font-mono text-teal-800">
                                {nomadIncomeActiveYears} Years
                              </span>
                            </div>
                            <input
                              type="range"
                              min={0}
                              max={25}
                              step={1}
                              value={nomadIncomeActiveYears}
                              onChange={e =>
                                setNomadIncomeActiveYears(Number(e.target.value))
                              }
                              className="w-full accent-teal-600 cursor-pointer"
                            />
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between font-bold text-slate-800">
                              <span>Planned Work-Free Break Today</span>
                              <span className="font-mono text-purple-800">
                                {plannedSabbaticalYears} Years Off
                              </span>
                            </div>
                            <input
                              type="range"
                              min={1}
                              max={15}
                              step={1}
                              value={plannedSabbaticalYears}
                              onChange={e =>
                                setPlannedSabbaticalYears(Number(e.target.value))
                              }
                              className="w-full accent-purple-600 cursor-pointer"
                            />
                          </div>
                        </div>

                        {/* Expandable Year-by-Year Survival Schedule Table */}
                        {showSurvivalTimelineTable && (
                          <div className="p-4 rounded-2xl bg-white border border-slate-200 overflow-x-auto space-y-2 animate-in fade-in">
                            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                              Year-by-Year Corpus Survival &amp; Depletion Schedule (
                              {currentYear} – {currentYear + 50})
                            </h4>
                            <table className="w-full text-left border-collapse text-[11px]">
                              <thead>
                                <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                                  <th className="py-2 pr-3">Calendar Year (Age)</th>
                                  <th className="py-2 px-3">
                                    Inflated Living + EMIs / yr
                                  </th>
                                  <th className="py-2 px-3 text-indigo-900">
                                    A. Corpus Without Working
                                  </th>
                                  <th className="py-2 px-3 text-teal-900">
                                    B. Corpus With Nomad Income
                                  </th>
                                  <th className="py-2 pl-3 text-purple-900">
                                    C. After {plannedSabbaticalYears}-Yr Break
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 font-mono">
                                {survivalSimulations.survivalTimeline.map(row => (
                                  <tr
                                    key={row.calendarYear}
                                    className="hover:bg-slate-50/80"
                                  >
                                    <td className="py-2 pr-3 font-bold text-slate-900">
                                      {row.calendarYear}{' '}
                                      <span className="text-slate-500 font-normal">
                                        (Age {row.age})
                                      </span>
                                    </td>
                                    <td className="py-2 px-3 text-rose-700">
                                      ${row.annualLivingAndEmiUSD.toLocaleString()}
                                    </td>
                                    <td
                                      className={`py-2 px-3 font-bold ${
                                        row.endCorpusUSD > 0
                                          ? 'text-indigo-900'
                                          : 'text-rose-600'
                                      }`}
                                    >
                                      {row.endCorpusUSD > 0
                                        ? `$${row.endCorpusUSD.toLocaleString()}`
                                        : '$0 (Depleted)'}
                                    </td>
                                    <td
                                      className={`py-2 px-3 font-bold ${
                                        row.withNomadEndCorpusUSD > 0
                                          ? 'text-teal-800'
                                          : 'text-rose-600'
                                      }`}
                                    >
                                      {row.withNomadEndCorpusUSD > 0
                                        ? `$${row.withNomadEndCorpusUSD.toLocaleString()}`
                                        : '$0 (Depleted)'}
                                    </td>
                                    <td
                                      className={`py-2 pl-3 font-bold ${
                                        row.afterSabbaticalEndCorpusUSD > 0
                                          ? 'text-purple-900'
                                          : 'text-rose-600'
                                      }`}
                                    >
                                      {row.afterSabbaticalEndCorpusUSD > 0
                                        ? `$${row.afterSabbaticalEndCorpusUSD.toLocaleString()}`
                                        : '$0 (Depleted)'}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>

                      {/* ====================================================== */}
                      {/* D. SIP CONTINUITY & RETURNS ON SIP COMPOUNDING DECK    */}
                      {/* ====================================================== */}
                      <div className="p-5 sm:p-6 rounded-3xl bg-white/95 border border-emerald-200/90 shadow-sm space-y-4">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
                                <TrendingUp className="w-4 h-4" />
                              </div>
                              <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                                SIP Earning Continuity Switch &amp; Returns on Your SIP Contributions
                              </h3>
                            </div>
                            <p className="text-xs text-slate-600 mt-0.5">
                              Test whether you invest until FIRE is reached, commit for
                              a fixed horizon, or stop fresh SIP right away ($0 Coast
                              Mode).
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <div className="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200 text-xs font-bold gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  if (annualSavings === 0) setAnnualSavings(24000);
                                  setSipContinuityMode('until-fire');
                                }}
                                className={`px-2.5 py-1.5 rounded-lg cursor-pointer ${
                                  !isSipStopped && sipContinuityMode === 'until-fire'
                                    ? 'bg-emerald-600 text-white shadow-2xs'
                                    : 'text-slate-700'
                                }`}
                              >
                                Until FIRE
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (annualSavings === 0) setAnnualSavings(24000);
                                  setSipContinuityMode('custom-years');
                                }}
                                className={`px-2.5 py-1.5 rounded-lg cursor-pointer ${
                                  !isSipStopped && sipContinuityMode === 'custom-years'
                                    ? 'bg-emerald-600 text-white shadow-2xs'
                                    : 'text-slate-700'
                                }`}
                              >
                                Commit {sipDurationYears} Yrs
                              </button>
                              <button
                                type="button"
                                onClick={() => setSipContinuityMode('paused')}
                                className={`px-2.5 py-1.5 rounded-lg cursor-pointer ${
                                  isSipStopped
                                    ? 'bg-rose-600 text-white shadow-2xs'
                                    : 'text-slate-700'
                                }`}
                              >
                                Stop SIP ($0 · Coast)
                              </button>
                            </div>

                            <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-semibold gap-1">
                              {[
                                {
                                  id: 'fire',
                                  label: `At FIRE (${yearsToFireAbroad || 5}y)`,
                                },
                                { id: '3', label: '3 Yrs' },
                                { id: '5', label: '5 Yrs' },
                                { id: '10', label: '10 Yrs' },
                              ].map(tab => (
                                <button
                                  key={tab.id}
                                  type="button"
                                  onClick={() =>
                                    setSelectedSipReturnsHorizon(tab.id as any)
                                  }
                                  className={`px-2.5 py-1 rounded-lg cursor-pointer text-[11px] ${
                                    selectedSipReturnsHorizon === tab.id
                                      ? 'bg-white text-emerald-950 font-bold shadow-2xs'
                                      : 'text-slate-600'
                                  }`}
                                >
                                  {tab.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {(() => {
                          const activeRet =
                            sipReturnsDeck[
                              selectedSipReturnsHorizon === 'custom'
                                ? 'custom'
                                : selectedSipReturnsHorizon
                            ];
                          return (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-1">
                                <span className="text-[10px] font-bold text-slate-500 uppercase block">
                                  1. Out-of-Pocket SIP Principal
                                </span>
                                <div className="text-lg font-extrabold font-mono text-slate-900">
                                  ${activeRet.totalPrincipalUSD.toLocaleString()}
                                </div>
                                <span className="text-[11px] text-slate-500">
                                  Saved over {activeRet.durationYears} yrs
                                </span>
                              </div>
                              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                                <span className="text-[10px] font-bold text-emerald-800 uppercase block">
                                  2. Compounded Returns on SIP
                                </span>
                                <div className="text-lg font-extrabold font-mono text-emerald-700">
                                  +${activeRet.wealthGainedUSD.toLocaleString()}
                                </div>
                                <span className="text-[11px] text-emerald-800">
                                  Generated at {expectedGrowthRate}%/yr return
                                </span>
                              </div>
                              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-1">
                                <span className="text-[10px] font-bold text-slate-500 uppercase block">
                                  3. Total SIP Maturity Value
                                </span>
                                <div className="text-lg font-extrabold font-mono text-indigo-950">
                                  ${activeRet.finalMaturityUSD.toLocaleString()}
                                </div>
                                <span className="text-[11px] text-slate-500">
                                  Principal + compounding gains
                                </span>
                              </div>
                              <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-200 space-y-1">
                                <span className="text-[10px] font-bold text-purple-900 uppercase block">
                                  4. Wealth Multiplier &amp; Gain
                                </span>
                                <div className="text-lg font-extrabold font-mono text-purple-900">
                                  {activeRet.multiplier}x{' '}
                                  <span className="text-xs font-sans font-bold text-emerald-700">
                                    (+{activeRet.returnPercent.toFixed(1)}%)
                                  </span>
                                </div>
                                <span className="text-[11px] text-purple-800">
                                  Compounding efficiency
                                </span>
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      {/* ====================================================== */}
                      {/* E. 4-TAB DIAGNOSTICS, ACCELERATORS & PERSONAL LEDGER   */}
                      {/* ====================================================== */}
                      <div className="p-5 sm:p-7 rounded-3xl bg-white/95 border border-slate-200/90 shadow-md space-y-5">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                          <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
                            <button
                              type="button"
                              onClick={() => setActiveLedgerTab('diagnostics')}
                              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                                activeLedgerTab === 'diagnostics'
                                  ? 'bg-indigo-600 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              <Zap className="w-3.5 h-3.5 text-teal-200" />
                              <span>
                                Strengths, Weaknesses &amp; FIRE Accelerators
                              </span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setActiveLedgerTab('future-goals')}
                              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                                activeLedgerTab === 'future-goals'
                                  ? 'bg-indigo-600 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              <GraduationCap className="w-3.5 h-3.5 text-purple-400" />
                              <span>
                                Future Milestones &amp; Insurance (
                                {isGuestUser ? '🔒' : futureGoalsList.length})
                              </span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setActiveLedgerTab('loans')}
                              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                                activeLedgerTab === 'loans'
                                  ? 'bg-indigo-600 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              <Landmark className="w-3.5 h-3.5 text-rose-400" />
                              <span>
                                Loans &amp; EMIs ({isGuestUser ? '🔒' : loansList.length}
                                )
                              </span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setActiveLedgerTab('side-income')}
                              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                                activeLedgerTab === 'side-income'
                                  ? 'bg-indigo-600 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                              <span>
                                Side &amp; Passive Incomes (
                                {isGuestUser ? '🔒' : sideIncomesList.length})
                              </span>
                            </button>
                          </div>
                        </div>

                        {activeLedgerTab === 'diagnostics' ? (
                          <div className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                              {/* Strengths Column */}
                              <div className="p-5 rounded-2xl border border-emerald-200/80 bg-emerald-50/25 space-y-3">
                                <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-sm">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                  <span>
                                    Financial Strengths Supporting Your FIRE (
                                    {diagnosticsAndAccelerators.strengths.length})
                                  </span>
                                </div>
                                <div className="space-y-2.5">
                                  {diagnosticsAndAccelerators.strengths.map(
                                    (s, idx) => (
                                      <div
                                        key={idx}
                                        className="p-3 rounded-xl bg-white border border-emerald-100 shadow-2xs"
                                      >
                                        <p className="text-xs font-bold text-slate-900">
                                          {s.title}
                                        </p>
                                        <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                                          {s.detail}
                                        </p>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>

                              {/* Weaknesses / Watchouts Column */}
                              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3">
                                <div className="flex items-center gap-2 text-slate-800 font-extrabold text-sm">
                                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                                  <span>
                                    Gaps, Inflation Drag &amp; Watchouts (
                                    {diagnosticsAndAccelerators.weaknesses.length})
                                  </span>
                                </div>
                                <div className="space-y-2.5">
                                  {diagnosticsAndAccelerators.weaknesses.map(
                                    (w, idx) => (
                                      <div
                                        key={idx}
                                        className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs"
                                      >
                                        <p className="text-xs font-bold text-slate-900">
                                          {w.title}
                                        </p>
                                        <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                                          {w.detail}
                                        </p>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Actionable "Achieve FIRE Earlier" Levers */}
                            <div className="p-5 rounded-2xl border border-indigo-200/80 bg-gradient-to-r from-indigo-50/35 via-teal-50/25 to-white space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Zap className="w-4 h-4 text-indigo-600" />
                                  <h4 className="text-sm font-extrabold text-slate-900">
                                    How to Achieve FIRE Earlier — Quantified 1-Click Action Levers
                                  </h4>
                                </div>
                                <span className="text-[11px] text-indigo-800 font-semibold">
                                  Click any lever to test &amp; apply immediately
                                </span>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {diagnosticsAndAccelerators.accelerators.map(
                                  acc => (
                                    <div
                                      key={acc.id}
                                      className="p-4 rounded-xl bg-white border border-slate-200/90 flex flex-col justify-between shadow-2xs"
                                    >
                                      <div>
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 border border-emerald-200 text-emerald-800 inline-block mb-1.5">
                                          Retire ~{acc.impactYears} Yrs Earlier
                                        </span>
                                        <h5 className="text-xs font-bold text-slate-900 leading-snug">
                                          {acc.title}
                                        </h5>
                                        <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                                          {acc.description}
                                        </p>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={acc.onApply}
                                        className="mt-3 w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] transition-colors flex items-center justify-center gap-1 cursor-pointer"
                                      >
                                        <span>{acc.actionLabel}</span>
                                        <ArrowRight className="w-3 h-3" />
                                      </button>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                        ) : isGuestUser ? (
                          /* Gated Prompt When Guest Clicks Future Milestones, Loans, or Side Incomes Tab */
                          <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-50/70 via-white to-teal-50/70 border border-indigo-200/80 text-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-1.5 max-w-2xl">
                              <div className="inline-flex items-center gap-1.5 text-indigo-900 text-xs font-extrabold">
                                <Lock className="w-4 h-4 text-indigo-600" />
                                <span>
                                  Unlock Personal Loans, Passive Income &amp; Family Milestone Modeling
                                </span>
                              </div>
                              <p className="text-xs text-slate-600 leading-relaxed">
                                Sign in or create a free ReFIREly account to enter your multi-loan EMI payoff schedules, continuing retirement passive income streams (rentals, dividends, pensions), and inflation-adjusted family milestones (children&apos;s college, medical buffer, property purchases).
                              </p>
                            </div>
                            <div className="flex items-center gap-2.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => openAuthModal('signup')}
                                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer transition-colors"
                              >
                                Sign Up Free to Unlock
                              </button>
                              <button
                                type="button"
                                onClick={() => openAuthModal('login')}
                                className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold text-xs cursor-pointer transition-colors"
                              >
                                Log In
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* Logged-in Quick Redirect to Left Panel or Inline Editor */
                          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                              <span className="font-extrabold text-slate-900 block">
                                Your Personal Ledger Is Unlocked ({loansList.length}{' '}
                                Loans · {sideIncomesList.length} Passive Streams ·{' '}
                                {futureGoalsList.length} Future Milestones)
                              </span>
                              <span className="text-slate-600">
                                Use the Personal &amp; 5-Scheme Financial Parameters
                                editor above to add or remove items, then click Save
                                Portfolio.
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleSaveFirePlanToAccount()}
                              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shrink-0"
                            >
                              Save &amp; Sync Ledger
                            </button>
                          </div>
                        )}
                      </div>

                      {/* ====================================================== */}
                      {/* F. GLOBAL 209-COUNTRY FIRE FEASIBILITY MATRIX          */}
                      {/* ====================================================== */}
                      <div>
                        <GlobalHavenFeasibilityWidget
                          userProfile={{
                            ...userProfile,
                            finances: {
                              ...DEFAULT_FINANCIAL_PORTFOLIO,
                              ...(userProfile.finances || {}),
                              investments: effectiveInvestments,
                            },
                          }}
                          countries={countries}
                          onSelectCountry={cName =>
                            navigateToCountry(
                              countries.find(
                                c =>
                                  c.name.toLowerCase() === cName.toLowerCase()
                              )?.id || 'portugal'
                            )
                          }
                        />
                      </div>

                      {/* Bottom Guest Sign-Up & Save Conversion Banner */}
                      {isGuestUser && (
                        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-indigo-50/50 via-white to-teal-50/50 border border-indigo-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-1 max-w-2xl">
                            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-indigo-800 uppercase tracking-wider">
                              <Award className="w-4 h-4 text-indigo-600" />
                              <span>
                                Save Your FIRE Scorecard &amp; Track Progress Over Time
                              </span>
                            </div>
                            <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                              Don&apos;t Lose Your ${fireNestEggAbroad.toLocaleString()}{' '}
                              FIRE Target &amp; {fireProgressPercent}% Readiness Score
                            </h3>
                            <p className="text-xs text-slate-600 leading-relaxed">
                              Sign up for a free ReFIREly account to unlock your
                              personal 5-scheme financial portfolio, log loans and
                              passive income, and save this FIRE scorecard to your
                              Relocation Dashboard for ongoing tracking.
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => openAuthModal('signup')}
                              className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer inline-flex items-center gap-2 shadow-xs transition-colors"
                            >
                              <UserPlus className="w-4 h-4" />
                              <span>Create Free Account &amp; Save Scorecard</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => openAuthModal('login')}
                              className="px-4 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-xs font-bold cursor-pointer transition-colors"
                            >
                              Log In
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Digital Nomad Runway & Haven Sustainability Matrix (Displayed for Retiree Persona as well) */}
                <div className="relative z-10 mt-8 mb-8">
                  <NomadHavenRunwayWidget
                    userProfile={{
                      ...userProfile,
                      finances: {
                        ...DEFAULT_FINANCIAL_PORTFOLIO,
                        ...(userProfile.finances || {}),
                        investments: effectiveInvestments,
                      },
                    }}
                    countries={countries}
                    liquidSavingsUSD={
                      isGuestUser
                        ? Math.max(5000, Math.round(currentNetWorth * 0.144))
                        : effectiveInvestments.savingsUSD > 0
                        ? effectiveInvestments.savingsUSD
                        : Math.max(5000, Math.round(currentNetWorth * 0.144))
                    }
                    investedAssetsUSD={effectiveNetCorpusTodayUSD}
                    personaMode="retiree"
                    onSelectCountry={cName =>
                      navigateToCountry(
                        countries.find(
                          c => c.name.toLowerCase() === cName.toLowerCase()
                        )?.id || 'portugal'
                      )
                    }
                  />
                </div>

                {/* Live Matching Retirement Havens for the User's FIRE Parameters */}
                <div className="relative z-10 mt-6 md:mt-10 pt-5 md:pt-8 border-t border-slate-200/80 space-y-5 md:space-y-6">
                  <div className="p-4 md:p-7 rounded-2xl md:rounded-3xl bg-slate-50/60 border border-slate-200/90 shadow-xs space-y-4 md:space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-[11px] font-bold uppercase tracking-wider mb-2">
                          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                          <span>Live FIRE-Ready Destination Matches</span>
                        </div>
                        <h2 className="text-base md:text-xl font-extrabold text-slate-900 tracking-tight">
                          <span className="md:hidden">Top 2</span>
                          <span className="hidden md:inline">Top 4</span> Havens
                          Matching Your $
                          {targetMonthlyExpenseAbroad.toLocaleString()}/mo Target
                          &amp; {safeWithdrawalRate.toFixed(1)}% SWR
                        </h2>
                      </div>
                      <span className="hidden md:inline-block text-xs font-bold text-slate-700 bg-white px-3.5 py-1.5 rounded-xl border border-slate-200/90 self-start sm:self-auto">
                        Ranked by budget fit, healthcare, safety &amp; portfolio
                        readiness
                      </span>
                    </div>

                    {/* 4 Matching Countries Grid (2 on Mobile, 4 on Desktop) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {fireMatchedCountries.map(
                        (
                          {
                            country,
                            referenceMonthlyCost,
                            budgetModeLabel,
                            countryNestEgg,
                            fundedPercent,
                            yearsToFireInCountry,
                          },
                          idx
                        ) => {
                          const topBarColors = [
                            'from-emerald-500 via-teal-500 to-cyan-500',
                            'from-indigo-500 via-violet-500 to-purple-500',
                            'from-sky-500 via-teal-500 to-emerald-500',
                            'from-teal-500 via-indigo-500 to-sky-500',
                          ];
                          return (
                            <motion.div
                              key={country.id}
                              layout
                              whileHover={{ y: -5 }}
                              transition={{
                                type: 'spring',
                                stiffness: 320,
                                damping: 26,
                              }}
                              onClick={() => navigateToCountry(country.id)}
                              className={`${idx >= 2 ? 'hidden md:flex' : 'flex'} group rounded-2xl bg-white border border-slate-200/90 hover:border-indigo-300 transition-shadow cursor-pointer flex-col justify-between overflow-hidden shadow-2xs hover:shadow-md`}
                            >
                              <div
                                className={`h-1.5 w-full bg-gradient-to-r ${topBarColors[idx % topBarColors.length]}`}
                              />

                              <CountryThumbnail
                                country={country}
                                className="h-32"
                                hideLandmarkLabel
                              >
                                <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2">
                                  <span className="px-2 py-0.5 rounded-md bg-slate-900/75 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider border border-white/15 truncate">
                                    {getCountryContinentLabel(country)}
                                  </span>
                                  <span
                                    className={`text-[11px] font-extrabold px-2 py-0.5 rounded-md shrink-0 shadow-xs ${
                                      yearsToFireInCountry === 0
                                        ? 'bg-emerald-500 text-white'
                                        : 'bg-white/95 text-slate-900'
                                    }`}
                                  >
                                    {yearsToFireInCountry === 0
                                      ? 'FIRE Ready!'
                                      : `${yearsToFireInCountry} Yrs`}
                                  </span>
                                </div>

                                <div className="absolute bottom-2.5 left-3 right-3 flex items-center gap-2">
                                  <CountryFlag
                                    countryCode={country.code}
                                    countryName={country.name}
                                    fallbackEmoji={country.flag}
                                    className="w-5 h-5 rounded-xs shadow-xs shrink-0 ring-1 ring-white/30"
                                  />
                                  <div className="min-w-0">
                                    <h3 className="text-sm font-extrabold text-white truncate drop-shadow-xs">
                                      {country.name}
                                    </h3>
                                    <span className="text-[10px] font-medium text-slate-200 block truncate">
                                      {country.climate.category}
                                    </span>
                                  </div>
                                </div>
                              </CountryThumbnail>

                              <div className="p-4 flex-1 flex flex-col justify-between gap-3.5">
                                <div className="space-y-3">
                                  <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div className="p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-200/70">
                                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                                        {budgetModeLabel} Budget
                                      </span>
                                      <span className="font-mono font-extrabold text-sm text-emerald-950 tabular-nums mt-0.5 block">
                                        ${referenceMonthlyCost.toLocaleString()}/mo
                                      </span>
                                    </div>
                                    <div className="p-2.5 rounded-xl bg-indigo-50/50 border border-indigo-200/70">
                                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 block">
                                        FIRE Nest Egg
                                      </span>
                                      <span className="font-mono font-extrabold text-sm text-indigo-950 tabular-nums mt-0.5 block">
                                        ${(countryNestEgg / 1000).toFixed(0)}k
                                      </span>
                                    </div>
                                  </div>

                                  <div className="space-y-1.5">
                                    <div className="flex justify-between items-center text-[11px]">
                                      <span className="font-semibold text-slate-600">
                                        Current Assets Cover
                                      </span>
                                      <span
                                        className={`font-mono font-extrabold tabular-nums ${
                                          fundedPercent >= 100
                                            ? 'text-emerald-700'
                                            : 'text-indigo-700'
                                        }`}
                                      >
                                        {fundedPercent}%
                                      </span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
                                      <div
                                        className={`h-full rounded-full transition-all duration-300 ${
                                          fundedPercent >= 100
                                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                                            : 'bg-gradient-to-r from-indigo-500 to-teal-500'
                                        }`}
                                        style={{ width: `${fundedPercent}%` }}
                                      />
                                    </div>
                                  </div>
                                </div>

                                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                                  <span className="font-semibold text-slate-600">
                                    Health{' '}
                                    <strong className="font-mono text-slate-900">
                                      {country.lifestyle.healthcareScore}
                                    </strong>{' '}
                                    · Safety{' '}
                                    <strong className="font-mono text-slate-900">
                                      {country.lifestyle.safetyScore}
                                    </strong>
                                  </span>
                                  <span className="inline-flex items-center gap-0.5 font-extrabold text-indigo-700 group-hover:text-teal-700 transition-colors">
                                    <span>Dossier</span>
                                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                                  </span>
                                </div>
                              </div>
                            </motion.div>
                          );
                        }
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* TAB 2: NOMAD RUNWAY & BURN CALCULATOR */
              <>
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Left Column: Interactive Inputs for Nomads & Creators */}
                  <div className="lg:col-span-6 space-y-5 bg-slate-50/40 p-6 rounded-3xl border border-slate-200/90 shadow-xs">
                    <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <label className="font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                          <Wallet className="w-3.5 h-3.5 text-teal-600" />
                          <span>Liquid Cash Buffer / Savings</span>
                        </label>
                        <motion.span
                          key={nomadSavings}
                          initial={{ scale: 0.92 }}
                          animate={{ scale: 1 }}
                          className="font-mono font-black px-2.5 py-0.5 rounded-lg bg-teal-50 text-teal-900 border border-teal-200 text-sm"
                        >
                          ${nomadSavings.toLocaleString()}
                        </motion.span>
                      </div>
                      <input
                        type="range"
                        min="10000"
                        max="1000000"
                        step="2000"
                        value={Math.min(1000000, Math.max(10000, nomadSavings))}
                        onChange={e => setNomadSavings(Number(e.target.value))}
                        className="w-full h-2 bg-teal-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                      />
                      <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                        <span>$10,000</span>
                        <span>$500,000</span>
                        <span>$1,000,000+</span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <label className="font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                          <Flame className="w-3.5 h-3.5 text-teal-600" />
                          <span>Short-Term Living &amp; Coworking Burn</span>
                        </label>
                        <motion.span
                          key={nomadMonthlyBurn}
                          initial={{ scale: 0.92 }}
                          animate={{ scale: 1 }}
                          className="font-mono font-black px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 text-sm"
                        >
                          ${nomadMonthlyBurn.toLocaleString()}/mo
                        </motion.span>
                      </div>
                      <input
                        type="range"
                        min="700"
                        max="4500"
                        step="50"
                        value={nomadMonthlyBurn}
                        onChange={e => setNomadMonthlyBurn(Number(e.target.value))}
                        className="w-full h-2 bg-teal-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                      />
                      <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                        <span>$700 (Lean SE Asia)</span>
                        <span>$1,850 (Standard Nomad Hub)</span>
                        <span>$4,500 (Luxury Lisbon/Tokyo)</span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <label className="font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                          <Laptop className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Remote Work / Freelance Inflow</span>
                        </label>
                        <motion.span
                          key={nomadRemoteIncome}
                          initial={{ scale: 0.92 }}
                          animate={{ scale: 1 }}
                          className="font-mono font-black px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-900 border border-indigo-200 text-sm"
                        >
                          +${nomadRemoteIncome.toLocaleString()}/mo
                        </motion.span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="6000"
                        step="100"
                        value={nomadRemoteIncome}
                        onChange={e => setNomadRemoteIncome(Number(e.target.value))}
                        className="w-full h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                      <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                        <span>$0 (Full Sabbatical)</span>
                        <span>$1,500 (Part-Time Gig)</span>
                        <span>$6,000+ (Full Remote Job)</span>
                      </div>
                    </div>

                    <div className="hidden md:block p-3.5 rounded-2xl bg-white border border-slate-200/80 text-[11px] text-slate-600 leading-relaxed space-y-1">
                      <div className="font-bold text-slate-800 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-teal-600" />
                        <span>The Nomad Runway Formula:</span>
                      </div>
                      <p>
                        Net Burn = Short-term Rent &amp; Coworking ($
                        <strong>{nomadMonthlyBurn.toLocaleString()}</strong>) -
                        Remote Inflow ($
                        <strong>{nomadRemoteIncome.toLocaleString()}</strong>) ={' '}
                        <strong className="text-slate-900">
                          ${nomadNetBurn.toLocaleString()}/mo
                        </strong>
                        . Dividing liquid savings by net burn reveals your real
                        calendar survival runway before needing to take on additional
                        clients.
                      </p>
                    </div>
                  </div>

                  {/* Right Column: Comparative Nomad Runway Results */}
                  <div className="lg:col-span-6 space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <motion.div
                        whileHover={{ y: -3 }}
                        className="relative overflow-hidden p-5 rounded-3xl bg-gradient-to-br from-teal-50/45 via-white to-emerald-50/30 border border-teal-200/80 shadow-xs space-y-1"
                      >
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-emerald-500" />
                        <span className="text-xs font-extrabold text-teal-800 uppercase tracking-wide">
                          Total Calendar Runway
                        </span>
                        <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tabular-nums">
                          {nomadNetBurn === 0
                            ? '∞ Infinite'
                            : `${nomadRunwayMonths} Mos`}
                        </div>
                        <div className="text-xs text-teal-700 font-medium">
                          {nomadNetBurn === 0
                            ? 'Cashflow positive abroad!'
                            : `~${nomadRunwayYears} years at current cash burn`}
                        </div>
                      </motion.div>

                      <motion.div
                        whileHover={{ y: -3 }}
                        className="relative overflow-hidden p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-1"
                      >
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-sky-500" />
                        <span className="text-xs font-extrabold text-indigo-800 uppercase tracking-wide">
                          Net Monthly Cash Burn
                        </span>
                        <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tabular-nums">
                          ${nomadNetBurn.toLocaleString()}/mo
                        </div>
                        <div className="text-xs text-slate-600 font-medium">
                          ${nomadMonthlyBurn.toLocaleString()} burn - $
                          {nomadRemoteIncome.toLocaleString()} inflow
                        </div>
                      </motion.div>
                    </div>

                    <div className="p-6 rounded-3xl bg-gradient-to-br from-teal-50/50 via-white to-indigo-50/45 border border-teal-200/80 text-slate-900 shadow-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
                          Runway Safety Thresholds
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-900 text-xs font-extrabold">
                          {nomadSavings >= nomadTwelveMonthRunwayRequired
                            ? '12+ Months Safe'
                            : nomadSavings >= nomadSixMonthRunwayRequired
                            ? '6+ Months Viable'
                            : 'Lean Buffer'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                        <div className="p-3 rounded-2xl bg-white border border-slate-200/80">
                          <span className="text-teal-800 text-[10px] font-bold uppercase block">
                            6-Month Runway Target
                          </span>
                          <div className="text-lg font-black font-mono text-slate-900 mt-0.5">
                            ${nomadSixMonthRunwayRequired.toLocaleString()}
                          </div>
                          <span className="text-[11px] text-slate-600">
                            {nomadSavings >= nomadSixMonthRunwayRequired
                              ? '✅ Fully Funded'
                              : `+$${(nomadSixMonthRunwayRequired - nomadSavings).toLocaleString()} needed`}
                          </span>
                        </div>
                        <div className="p-3 rounded-2xl bg-white border border-slate-200/80">
                          <span className="text-indigo-800 text-[10px] font-bold uppercase block">
                            12-Month Runway Target
                          </span>
                          <div className="text-lg font-black font-mono text-slate-900 mt-0.5">
                            ${nomadTwelveMonthRunwayRequired.toLocaleString()}
                          </div>
                          <span className="text-[11px] text-slate-600">
                            {nomadSavings >= nomadTwelveMonthRunwayRequired
                              ? '✅ Fully Funded'
                              : `+$${(nomadTwelveMonthRunwayRequired - nomadSavings).toLocaleString()} needed`}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-extrabold text-slate-900 uppercase tracking-wider">
                          Cash Runway Depletion Bar
                        </span>
                        <span className="font-mono font-bold text-teal-800">
                          {nomadNetBurn === 0
                            ? 'Zero Cash Burn'
                            : `${nomadRunwayMonths} Months of Freedom`}
                        </span>
                      </div>

                      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
                        <div
                          className="h-full bg-gradient-to-r from-teal-500 via-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(100, nomadNetBurn === 0 ? 100 : Math.round((nomadRunwayMonths / 24) * 100))}%`,
                          }}
                        />
                      </div>

                      <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                        <span>0 Mos</span>
                        <span>6 Mos (Standard)</span>
                        <span>12 Mos (Comfort)</span>
                        <span>24+ Mos</span>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() =>
                              openShareFireCardModal({
                                persona: 'nomad',
                                badgeTitle:
                                  nomadRunwayMonths >= 24
                                    ? 'Runway Sovereign'
                                    : 'Coast FIRE Nomad',
                                badgeEmoji: nomadRunwayMonths >= 24 ? '👑' : '🌊',
                                yearsSaved: Math.max(1, yearsSaved || 8),
                                fireProgressPercent,
                                topCountry:
                                  nomadMatchedCountries[0]?.country.name ||
                                  'Portugal',
                                topCountryFlag:
                                  nomadMatchedCountries[0]?.country.flag,
                                topCity:
                                  nomadMatchedCountries[0]?.country.capital ||
                                  'Lisbon',
                                nomadRunwayMonths:
                                  nomadNetBurn === 0 ? 120 : nomadRunwayMonths,
                                monthlyBurnUSD: nomadMonthlyBurn,
                                domesticMonthlyBurnUSD: domesticMonthlyExpense,
                                currentNetWorthUSD: nomadSavings,
                                targetFireNestEggUSD: fireNestEggAbroad,
                                swrPercent: safeWithdrawalRate,
                                headlineMode: 'nomad-runway',
                              })
                            }
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-50 via-indigo-50 to-amber-50 hover:from-teal-100 hover:via-indigo-100 hover:to-amber-100 text-teal-950 border border-teal-200/90 text-xs font-extrabold shadow-2xs transition-all inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                          >
                            <span>🏅 Create Shareable Runway Card</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setCurrentView('scout')}
                            className="font-extrabold text-teal-700 hover:text-indigo-700 inline-flex items-center gap-1.5 cursor-pointer group whitespace-nowrap"
                          >
                            <span>Plan 90-Day Multi-Country Hop</span>
                            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                          </button>
                        </div>
                        <span className="text-[11px] text-slate-400">
                          Includes turnkey Airbnb + Coworking
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Global Nomad Runway Matrix */}
                <div className="relative z-10 mt-8 mb-8">
                  <NomadHavenRunwayWidget
                    userProfile={{
                      ...userProfile,
                      finances: {
                        ...DEFAULT_FINANCIAL_PORTFOLIO,
                        ...(userProfile.finances || {}),
                      },
                    }}
                    countries={countries}
                    liquidSavingsUSD={nomadSavings}
                    personaMode="nomad"
                    onSelectCountry={cName =>
                      navigateToCountry(
                        countries.find(
                          c => c.name.toLowerCase() === cName.toLowerCase()
                        )?.id || 'portugal'
                      )
                    }
                  />
                </div>

                {/* Live Matching Nomad & Remote Destinations */}
                <div className="relative z-10 mt-6 md:mt-10 pt-5 md:pt-8 border-t border-teal-200/70 space-y-5 md:space-y-6">
                  <div className="p-4 md:p-7 rounded-2xl md:rounded-3xl bg-gradient-to-br from-indigo-50/85 via-white to-teal-50/85 border border-teal-200/80 shadow-md space-y-4 md:space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-teal-600 via-indigo-600 to-amber-600 text-white text-[11px] font-bold uppercase tracking-wider mb-2 shadow-2xs">
                          <Zap className="w-3.5 h-3.5 text-amber-300" />
                          <span>Live Nomad-Ready Destination Matches</span>
                        </div>
                        <h2 className="text-base md:text-xl font-extrabold text-slate-900 tracking-tight">
                          <span className="md:hidden">Top 2</span>
                          <span className="hidden md:inline">Top 4</span> Hubs
                          Matching Your ${nomadMonthlyBurn.toLocaleString()}/mo
                          Turnkey Living Burn
                        </h2>
                      </div>
                      <span className="hidden md:inline-block text-xs font-bold text-teal-900 bg-white px-3.5 py-1.5 rounded-xl border border-teal-200/80 shadow-2xs self-start sm:self-auto">
                        Ranked by verified fiber speed, coworking density &amp; visa
                        terms
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {nomadMatchedCountries.map(({ country, nomadProfile }, idx) => {
                        const topBarColors = [
                          'from-teal-500 via-indigo-500 to-emerald-500',
                          'from-indigo-500 via-violet-500 to-purple-500',
                          'from-amber-500 via-orange-500 to-rose-500',
                          'from-emerald-500 via-teal-500 to-cyan-500',
                        ];
                        return (
                          <motion.div
                            key={country.id}
                            layout
                            whileHover={{ y: -5 }}
                            transition={{
                              type: 'spring',
                              stiffness: 320,
                              damping: 26,
                            }}
                            onClick={() => navigateToCountry(country.id)}
                            className={`${idx >= 2 ? 'hidden md:flex' : 'flex'} group rounded-2xl bg-white border border-teal-100 hover:border-teal-300 transition-shadow cursor-pointer flex-col justify-between overflow-hidden shadow-xs hover:shadow-xl hover:shadow-teal-950/10`}
                          >
                            <div
                              className={`h-1.5 w-full bg-gradient-to-r ${topBarColors[idx % topBarColors.length]}`}
                            />

                            <CountryThumbnail
                              country={country}
                              className="h-32 transition-transform duration-500 group-hover:scale-105"
                              hideLandmarkLabel
                            >
                              <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5">
                                <span className="px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-md text-[10px] font-bold text-teal-200 border border-teal-500/30">
                                  {nomadProfile.verifiedInternetMbps} Mbps Fiber
                                </span>
                              </div>
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent flex items-end p-3">
                                <div className="flex items-center gap-2">
                                  <CountryFlag
                                    countryCode={country.code}
                                    countryName={country.name}
                                    fallbackEmoji={country.flag}
                                    className="w-5 h-3.5 rounded shadow-xs shrink-0"
                                  />
                                  <span className="font-extrabold text-white text-sm tracking-tight drop-shadow-sm truncate">
                                    {country.name}
                                  </span>
                                </div>
                              </div>
                            </CountryThumbnail>

                            <div className="p-4 flex-1 flex flex-col justify-between gap-3.5">
                              <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div className="p-2.5 rounded-xl bg-teal-50/70 border border-teal-200/80">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 block">
                                      Turnkey Burn
                                    </span>
                                    <span className="font-mono font-extrabold text-sm text-teal-950 tabular-nums mt-0.5 block">
                                      $
                                      {nomadProfile.monthlyNomadBurnUSD.toLocaleString()}
                                      /mo
                                    </span>
                                  </div>
                                  <div className="p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-200/80">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 block">
                                      6-Mo Runway
                                    </span>
                                    <span className="font-mono font-extrabold text-sm text-indigo-950 tabular-nums mt-0.5 block">
                                      $
                                      {(nomadProfile.sixMonthRunwayUSD / 1000).toFixed(
                                        0
                                      )}
                                      k
                                    </span>
                                  </div>
                                </div>

                                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1 text-xs">
                                  <div className="flex items-center justify-between text-[11px]">
                                    <span
                                      className="font-bold text-slate-800 truncate"
                                      title={nomadProfile.remoteWorkVisaName}
                                    >
                                      {nomadProfile.remoteWorkVisaName}
                                    </span>
                                  </div>
                                  <div className="text-[10px] text-slate-500 font-medium">
                                    {nomadProfile.remoteWorkVisaIncomeUSD > 0
                                      ? `Min. $${nomadProfile.remoteWorkVisaIncomeUSD.toLocaleString()}/mo income`
                                      : 'Liquid Solvency / Zero Monthly Mandate'}
                                  </div>
                                </div>
                              </div>

                              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                                <span className="font-semibold text-slate-600">
                                  Coworking:{' '}
                                  <strong className="text-teal-900">
                                    {nomadProfile.coworkingDensity.split(' ')[0]}
                                  </strong>
                                </span>
                                <span className="inline-flex items-center gap-0.5 font-extrabold text-teal-700 group-hover:text-indigo-700 transition-colors">
                                  <span>Nomad Dossier</span>
                                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>

        {/* ============================================================ */}
        {/* 2. SEO METHODOLOGY & GEO-ARBITRAGE FAQ + NEXT-STEP LINKS     */}
        {/* ============================================================ */}
        {!isEmbeddedInDashboard && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="rounded-3xl bg-white border border-slate-200/80 p-6 md:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-indigo-700">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>FIRE Abroad Methodology &amp; FAQ</span>
                  </div>
                  <h2 className="text-lg md:text-2xl font-extrabold text-slate-900 tracking-tight">
                    How International Geo-Arbitrage Accelerates Financial Independence
                  </h2>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleOpenAdvancedExplorer}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-800 hover:text-indigo-900 text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Globe className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Explore {countries.length} Havens</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentView('compare');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-800 hover:text-indigo-900 text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Scale className="w-3.5 h-3.5 text-violet-600" />
                    <span>Compare Countries</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentView('visa-check');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-3.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-900 text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Stamp className="w-3.5 h-3.5 text-teal-700" />
                    <span>Global Visa Check</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <article className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-2">
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Why does geo-arbitrage cut my FIRE nest egg by 40%–65%?
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Every $1,000/month trimmed from recurring living costs reduces your
                    4% SWR retirement target by $300,000. Earning or investing in a
                    strong currency while enjoying lower housing, dining, and private
                    healthcare costs abroad compresses both your target nest egg and
                    accumulation years.
                  </p>
                </article>

                <article className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-2">
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Should I model 4.0% SWR or a safer 3.5% SWR abroad?
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    The classic 4.0% rule (25× annual spending) was built for 30-year
                    horizons. Early retirees relocating in their 30s, 40s, or early
                    50s often stress-test at 3.25%–3.5% SWR (28.6×–30.8×) to absorb FX
                    swings, visa renewals, and long-term inflation safely.
                  </p>
                </article>

                <article className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-2">
                  <h3 className="text-sm font-extrabold text-slate-900">
                    How does Nomad Runway differ from full FIRE?
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Full FIRE replaces 100% of spending from portfolio withdrawals
                    forever. Digital Nomad Runway measures how many months your liquid
                    cash buffer sustains short-term furnished housing and coworking
                    burn after offsetting remote client retainers or part-time income.
                  </p>
                </article>
              </div>
            </div>
          </section>
        )}
      </div>
    </MotionConfig>
  );
};
