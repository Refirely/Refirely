import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  UserFinancialPortfolio,
  UserLoanItem,
  SideIncomeStream,
  FutureMilestoneExpense,
} from '../types';
import {
  DEFAULT_FINANCIAL_PORTFOLIO,
  WORLD_COUNTRIES,
  getWorldCountryFlag,
  getCountryCurrencyMacro,
  formatLocalCurrency,
  formatDualCurrency,
} from '../data/userAccounts';
import { CurrencyAmountInput } from './CurrencyAmountInput';
import { FireProgressChart, FireTrajectoryPoint } from './FireProgressChart';
import { CountryFlag } from './CountryFlag';
import {
  Flame, TrendingUp, DollarSign, ShieldAlert, CheckCircle2, Plus, Trash2,
  Sparkles, Calendar, Award, Sliders, ArrowRight, RefreshCw, Landmark,
  Briefcase, GraduationCap, HeartHandshake, ShieldCheck, AlertTriangle,
  Zap, Globe, PiggyBank, Percent, Clock, Check, ChevronRight
} from 'lucide-react';

type FireTierMode = 'lean' | 'standard' | 'fat' | 'barista';

export const FireCalculatorTracker: React.FC = () => {
  const { userProfile, updateUserProfile, countries, openEditProfile } = useApp();

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

  // Basis Country: Residing Country vs Target Haven Geo-Arbitrage comparison
  const residingCountryName = userProfile.residingCountry || userProfile.originCountry || 'United States';
  const targetHavenCountryName = userProfile.targetCountry || 'Portugal';

  const [selectedBasisCountry, setSelectedBasisCountry] = useState<string>(residingCountryName);
  const [costBasisMode, setCostBasisMode] = useState<'residing' | 'target-haven'>('residing');
  const [fireTier, setFireTier] = useState<FireTierMode>('standard');
  const [activeLedgerTab, setActiveLedgerTab] = useState<'loans' | 'side-income' | 'future-goals' | 'diagnostics'>('diagnostics');
  const [inputCurrencyMode, setInputCurrencyMode] = useState<'USD' | 'LOCAL'>(() =>
    getCountryCurrencyMacro(residingCountryName).currencyCode !== 'USD' ? 'LOCAL' : 'USD'
  );
  const [savedToast, setSavedToast] = useState<string | null>(null);

  // Sync residing country when user profile changes
  useEffect(() => {
    const nextCountry = userProfile.residingCountry || userProfile.originCountry || 'United States';
    setSelectedBasisCountry(nextCountry);
    const nextMacro = getCountryCurrencyMacro(nextCountry);
    setInputCurrencyMode(nextMacro.currencyCode !== 'USD' ? 'LOCAL' : 'USD');
  }, [userProfile.residingCountry, userProfile.originCountry]);

  // Currency & Macro metadata for the active Residing Country
  const countryMacro = useMemo(() => {
    return getCountryCurrencyMacro(selectedBasisCountry);
  }, [selectedBasisCountry]);

  // Base monthly living expense before tier multiplier
  const targetHavenDossier = countries.find(
    c => c.name.toLowerCase() === targetHavenCountryName.toLowerCase()
  );
  const residingDossier = countries.find(
    c => c.name.toLowerCase() === selectedBasisCountry.toLowerCase()
  );

  const defaultResidingMonthlyExpenseUSD =
    finances.monthlyCurrentExpensesUSD ||
    residingDossier?.costOfLiving.monthlyBudgetCoupleUSD ||
    countryMacro.typicalMonthlyExpenseUSD ||
    3200;

  const defaultTargetHavenMonthlyExpenseUSD =
    targetHavenDossier?.costOfLiving.monthlyBudgetSingleUSD ||
    userProfile.monthlyBudgetUSD ||
    2200;

  // Interactive Simulation State (initialized from finances & country macro)
  const [currentAge, setCurrentAge] = useState<number>(finances.currentAge || 42);
  const [targetFireAge, setTargetFireAge] = useState<number>(finances.targetFireAge || 50);
  const [monthlySalaryUSD, setMonthlySalaryUSD] = useState<number>(
    finances.monthlySalaryUSD ?? Math.round(((finances.currentSalaryUSD ?? 120000) / 12) * 100) / 100
  );
  const [monthlyCurrentExpensesUSD, setMonthlyCurrentExpensesUSD] = useState<number>(
    finances.monthlyCurrentExpensesUSD ?? defaultResidingMonthlyExpenseUSD
  );
  const [monthlySipUSD, setMonthlySipUSD] = useState<number>(finances.monthlySipUSD ?? 2800);
  const [lastActiveSipUSD, setLastActiveSipUSD] = useState<number>(
    finances.monthlySipUSD && finances.monthlySipUSD > 0 ? finances.monthlySipUSD : 1000
  );
  const [sipStepUpPct, setSipStepUpPct] = useState<number>(finances.annualSipStepUpPercent ?? 8);
  const [sipContinuityMode, setSipContinuityMode] = useState<'until-fire' | 'custom-years' | 'paused'>(
    finances.sipContinuityMode || 'until-fire'
  );
  const [sipDurationYears, setSipDurationYears] = useState<number>(
    finances.sipDurationYears || 7
  );
  const [stopSipAtFire, setStopSipAtFire] = useState<boolean>(
    finances.stopSipAtFire ?? true
  );
  const [selectedSipReturnsHorizon, setSelectedSipReturnsHorizon] = useState<'fire' | '3' | '5' | '10' | 'custom'>('fire');
  const [inflationPct, setInflationPct] = useState<number>(
    finances.inflationRatePercent ?? countryMacro.defaultInflationPercent
  );
  const [expectedReturnPct, setExpectedReturnPct] = useState<number>(
    finances.expectedReturnRatePercent ?? countryMacro.defaultReturnPercent
  );
  const [swrPct, setSwrPct] = useState<number>(finances.safeWithdrawalRatePercent || 4.0);
  const [includePrimaryHome, setIncludePrimaryHome] = useState<boolean>(
    Boolean(finances.includePrimaryHomeInFire)
  );
  const [includeGold, setIncludeGold] = useState<boolean>(
    finances.includeGoldInFire ?? true
  );
  const [plannerPersonaMode, setPlannerPersonaMode] = useState<'retiree' | 'digital-nomad'>(() => {
    if (finances.plannerPersonaMode) return finances.plannerPersonaMode;
    try {
      const savedGlobal = localStorage.getItem('refirely_persona');
      if (savedGlobal === 'nomad') return 'digital-nomad';
    } catch {
      // ignore storage errors
    }
    return 'retiree';
  });
  const [expectedNomadMonthlyIncomeUSD, setExpectedNomadMonthlyIncomeUSD] = useState<number>(
    finances.expectedNomadMonthlyIncomeUSD ?? 2200
  );
  const [nomadIncomeActiveYears, setNomadIncomeActiveYears] = useState<number>(
    finances.nomadIncomeActiveYears ?? 10
  );
  const [plannedSabbaticalYears, setPlannedSabbaticalYears] = useState<number>(
    finances.plannedSabbaticalYears ?? 3
  );
  const [showSurvivalTimelineTable, setShowSurvivalTimelineTable] = useState<boolean>(false);
  const [investmentsDraft, setInvestmentsDraft] = useState<UserFinancialPortfolio['investments']>({
    savingsUSD: finances.investments.savingsUSD || 0,
    stocksMutualFundsUSD: finances.investments.stocksMutualFundsUSD || 0,
    realEstateUSD: finances.investments.realEstateUSD || 0,
    goldUSD: finances.investments.goldUSD || 0,
    othersUSD: finances.investments.othersUSD || 0,
  });
  const [showAssetsEditorInFire, setShowAssetsEditorInFire] = useState<boolean>(false);
  const [showFormulaAudit, setShowFormulaAudit] = useState<boolean>(true);

  // Helper to preserve 2-decimal USD precision (prevents ₹75,000 INR -> $794 USD -> ₹75,033 INR drift)
  const roundUsd2 = (val: number) => Math.round((Number(val) || 0) * 100) / 100;

  // Heal legacy whole-dollar rounded 794 USD (₹75,033 INR at 94.5) back to exact ₹75,000 INR (793.65 USD)
  const normalizeLegacyInrUsd = (usdVal: number | undefined, fallbackUsd: number): number => {
    const raw = usdVal ?? fallbackUsd;
    if (countryMacro.currencyCode === 'INR' && raw === 794) {
      return 793.65;
    }
    return raw;
  };

  const [baseMonthlyExpenseTodayUSD, setBaseMonthlyExpenseTodayUSD] = useState<number>(() =>
    costBasisMode === 'residing'
      ? normalizeLegacyInrUsd(
          finances.monthlyRetirementExpensesUSD ?? finances.monthlyCurrentExpensesUSD,
          defaultResidingMonthlyExpenseUSD
        )
      : defaultTargetHavenMonthlyExpenseUSD
  );

  // Sync interactive states when external profile finances change
  useEffect(() => {
    setCurrentAge(finances.currentAge || 42);
    setTargetFireAge(finances.targetFireAge || 50);
    setMonthlySalaryUSD(
      finances.monthlySalaryUSD ?? Math.round(((finances.currentSalaryUSD ?? 120000) / 12) * 100) / 100
    );
    const nextCurrentExp = normalizeLegacyInrUsd(
      finances.monthlyCurrentExpensesUSD,
      defaultResidingMonthlyExpenseUSD
    );
    setMonthlyCurrentExpensesUSD(nextCurrentExp);
    if (costBasisMode === 'residing') {
      const nextRetireExp = normalizeLegacyInrUsd(
        finances.monthlyRetirementExpensesUSD ?? finances.monthlyCurrentExpensesUSD,
        nextCurrentExp
      );
      setBaseMonthlyExpenseTodayUSD(nextRetireExp);
    }
    const nextSip = finances.monthlySipUSD ?? 2800;
    setMonthlySipUSD(nextSip);
    if (nextSip > 0) {
      setLastActiveSipUSD(nextSip);
    }
    setSipStepUpPct(finances.annualSipStepUpPercent ?? 8);
    setSipContinuityMode(finances.sipContinuityMode || 'until-fire');
    setSipDurationYears(finances.sipDurationYears || 7);
    setStopSipAtFire(finances.stopSipAtFire ?? true);
    setSwrPct(finances.safeWithdrawalRatePercent || 4.0);
    setIncludePrimaryHome(Boolean(finances.includePrimaryHomeInFire));
    setIncludeGold(finances.includeGoldInFire ?? true);
    if (finances.plannerPersonaMode) {
      setPlannerPersonaMode(finances.plannerPersonaMode);
    }
    setExpectedNomadMonthlyIncomeUSD(finances.expectedNomadMonthlyIncomeUSD ?? 2200);
    setNomadIncomeActiveYears(finances.nomadIncomeActiveYears ?? 10);
    setPlannedSabbaticalYears(finances.plannedSabbaticalYears ?? 3);
    setInvestmentsDraft({
      savingsUSD: finances.investments.savingsUSD || 0,
      stocksMutualFundsUSD: finances.investments.stocksMutualFundsUSD || 0,
      realEstateUSD: finances.investments.realEstateUSD || 0,
      goldUSD: finances.investments.goldUSD || 0,
      othersUSD: finances.investments.othersUSD || 0,
    });
  }, [
    finances.currentAge,
    finances.targetFireAge,
    finances.monthlySalaryUSD,
    finances.currentSalaryUSD,
    finances.monthlyCurrentExpensesUSD,
    finances.monthlyRetirementExpensesUSD,
    finances.monthlySipUSD,
    finances.annualSipStepUpPercent,
    finances.sipContinuityMode,
    finances.sipDurationYears,
    finances.stopSipAtFire,
    finances.safeWithdrawalRatePercent,
    finances.includePrimaryHomeInFire,
    finances.includeGoldInFire,
    finances.plannerPersonaMode,
    finances.expectedNomadMonthlyIncomeUSD,
    finances.nomadIncomeActiveYears,
    finances.plannedSabbaticalYears,
    finances.investments.savingsUSD,
    finances.investments.stocksMutualFundsUSD,
    finances.investments.realEstateUSD,
    finances.investments.goldUSD,
    finances.investments.othersUSD,
  ]);

  // Update inflation/return defaults when user switches the basis country dropdown
  const handleBasisCountryChange = (newCountry: string) => {
    setSelectedBasisCountry(newCountry);
    const nextMacro = getCountryCurrencyMacro(newCountry);
    setInputCurrencyMode(nextMacro.currencyCode !== 'USD' ? 'LOCAL' : 'USD');
    setInflationPct(nextMacro.defaultInflationPercent);
    setExpectedReturnPct(nextMacro.defaultReturnPercent);
    if (costBasisMode === 'residing') {
      const matched = countries.find(c => c.name.toLowerCase() === newCountry.toLowerCase());
      const nextExp =
        finances.monthlyCurrentExpensesUSD ||
        matched?.costOfLiving.monthlyBudgetCoupleUSD ||
        nextMacro.typicalMonthlyExpenseUSD;
      setMonthlyCurrentExpensesUSD(nextExp);
      setBaseMonthlyExpenseTodayUSD(finances.monthlyRetirementExpensesUSD ?? nextExp);
    }
  };

  const handleSwitchCostBasis = (mode: 'residing' | 'target-haven') => {
    setCostBasisMode(mode);
    if (mode === 'residing') {
      setBaseMonthlyExpenseTodayUSD(
        finances.monthlyRetirementExpensesUSD ??
          monthlyCurrentExpensesUSD ??
          defaultResidingMonthlyExpenseUSD
      );
    } else {
      setBaseMonthlyExpenseTodayUSD(defaultTargetHavenMonthlyExpenseUSD);
    }
  };

  // New Loan Form State
  const [newLoan, setNewLoan] = useState<{
    name: string;
    category: UserLoanItem['category'];
    principalInput: number;
    interestRatePercent: number;
    emiInput: number;
    remainingYears: number;
  }>({
    name: '',
    category: 'Home / Mortgage',
    principalInput: 50000,
    interestRatePercent: 6.5,
    emiInput: 650,
    remainingYears: 5,
  });

  // New Side Income Form State
  const [newSideIncome, setNewSideIncome] = useState<{
    name: string;
    category: SideIncomeStream['category'];
    monthlyInput: number;
    continuesInRetirement: boolean;
  }>({
    name: '',
    category: 'Rental Property',
    monthlyInput: 600,
    continuesInRetirement: true,
  });

  // New Future Milestone Expense Form State
  const [newGoal, setNewGoal] = useState<{
    title: string;
    category: FutureMilestoneExpense['category'];
    costInput: number;
    targetYear: number;
    priority: 'Essential' | 'Aspirational';
  }>({
    title: '',
    category: 'Children Education',
    costInput: 35000,
    targetYear: 2030,
    priority: 'Essential',
  });

  const triggerToast = (msg: string) => {
    setSavedToast(msg);
    setTimeout(() => setSavedToast(null), 3200);
  };

  // Helper to convert user input to USD if they entered in Local Currency
  const toUSD = (val: number) => {
    if (inputCurrencyMode === 'LOCAL' && countryMacro.rateToUSD > 0) {
      return Math.round(val / countryMacro.rateToUSD);
    }
    return Math.round(val);
  };

  // Save current FIRE parameters to UserProfile
  const persistFireUpdates = (partialFinances: Partial<UserFinancialPortfolio>, toastMsg?: string) => {
    const nextLoans = partialFinances.loans ?? finances.loans ?? [];
    const totalLoansPrincipal = Math.round(
      nextLoans.reduce((sum, l) => sum + (l.outstandingPrincipalUSD || 0), 0)
    );
    const nextSideIncomes = partialFinances.sideIncomes ?? finances.sideIncomes ?? [];
    const totalPassive = Math.round(
      nextSideIncomes
        .filter(s => s.continuesInRetirement)
        .reduce((sum, s) => sum + (s.monthlyAmountUSD || 0), 0)
    );
    const cleanMonthlySalary = roundUsd2(
      partialFinances.monthlySalaryUSD ?? monthlySalaryUSD ?? 0
    );
    const cleanCurrentExpenses = roundUsd2(
      partialFinances.monthlyCurrentExpensesUSD ?? monthlyCurrentExpensesUSD ?? 0
    );
    const cleanRetirementExpenses = roundUsd2(
      partialFinances.monthlyRetirementExpensesUSD ??
        baseMonthlyExpenseTodayUSD ??
        cleanCurrentExpenses ??
        2400
    );
    const cleanMonthlySip = roundUsd2(
      partialFinances.monthlySipUSD ?? monthlySipUSD ?? 0
    );
    const cleanSipContinuityMode =
      partialFinances.sipContinuityMode ?? sipContinuityMode;

    updateUserProfile({
      residingCountry: selectedBasisCountry,
      monthlyBudgetUSD: cleanRetirementExpenses,
      finances: {
        ...finances,
        currentAge: Math.round(currentAge || 42),
        targetFireAge: Math.round(targetFireAge || 50),
        monthlySalaryUSD: cleanMonthlySalary,
        currentSalaryUSD: roundUsd2(cleanMonthlySalary * 12),
        monthlyCurrentExpensesUSD: cleanCurrentExpenses,
        monthlyRetirementExpensesUSD: cleanRetirementExpenses,
        monthlySipUSD: cleanMonthlySip,
        annualSipStepUpPercent: Number(sipStepUpPct) || 0,
        sipContinuityMode: cleanSipContinuityMode,
        sipDurationYears: Number(sipDurationYears) || 7,
        stopSipAtFire,
        inflationRatePercent: Number(inflationPct) || countryMacro.defaultInflationPercent,
        expectedReturnRatePercent: Number(expectedReturnPct) || countryMacro.defaultReturnPercent,
        safeWithdrawalRatePercent: Number(swrPct) || 4.0,
        includePrimaryHomeInFire: includePrimaryHome,
        includeGoldInFire: includeGold,
        plannerPersonaMode,
        expectedNomadMonthlyIncomeUSD: roundUsd2(expectedNomadMonthlyIncomeUSD || 0),
        nomadIncomeActiveYears: Math.max(0, Math.round(nomadIncomeActiveYears || 0)),
        plannedSabbaticalYears: Math.max(1, Math.round(plannedSabbaticalYears || 1)),
        investments: {
          savingsUSD: roundUsd2(investmentsDraft.savingsUSD || 0),
          stocksMutualFundsUSD: roundUsd2(investmentsDraft.stocksMutualFundsUSD || 0),
          realEstateUSD: roundUsd2(investmentsDraft.realEstateUSD || 0),
          goldUSD: roundUsd2(investmentsDraft.goldUSD || 0),
          othersUSD: roundUsd2(investmentsDraft.othersUSD || 0),
        },
        totalLiabilitiesUSD: totalLoansPrincipal,
        additionalMonthlyPassiveUSD: totalPassive,
        ...partialFinances,
        updatedAt: new Date().toISOString().split('T')[0],
      },
    });
    if (toastMsg) triggerToast(toastMsg);
  };

  // Stop SIP Right Away ($0/mo + Coast Mode) & Resume SIP Handlers
  const handleStopSipRightAway = () => {
    if (monthlySipUSD > 0) {
      setLastActiveSipUSD(monthlySipUSD);
    }
    setMonthlySipUSD(0);
    setSipContinuityMode('paused');
    persistFireUpdates(
      { monthlySipUSD: 0, sipContinuityMode: 'paused' },
      'Stopped Monthly SIP right away ($0/mo — Coast FIRE Mode active)!'
    );
  };

  const handleResumeSip = (customSipUSD?: number) => {
    const restoredSip =
      customSipUSD && customSipUSD > 0
        ? customSipUSD
        : lastActiveSipUSD > 0
        ? lastActiveSipUSD
        : 1000;
    setMonthlySipUSD(restoredSip);
    setSipContinuityMode('until-fire');
    persistFireUpdates(
      { monthlySipUSD: restoredSip, sipContinuityMode: 'until-fire' },
      `Resumed active Monthly SIP (${formatDualCurrency(restoredSip, countryMacro, false)}/mo)!`
    );
  };

  // Add / Edit / Delete Handlers for Loans, Side Incomes, and Future Milestones
  const handleAddLoan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLoan.name.trim()) return;
    const item: UserLoanItem = {
      id: `loan-${Date.now()}`,
      name: newLoan.name.trim(),
      category: newLoan.category,
      outstandingPrincipalUSD: Math.round(Number(newLoan.principalInput) || 0),
      interestRatePercent: Number(newLoan.interestRatePercent) || 5.0,
      monthlyEmiUSD: Math.round(Number(newLoan.emiInput) || 0),
      remainingYears: Math.max(1, Number(newLoan.remainingYears) || 1),
    };
    const nextLoans = [...(finances.loans || []), item];
    persistFireUpdates({ loans: nextLoans }, `Added loan "${item.name}" and recalculated FIRE.`);
    setNewLoan({ ...newLoan, name: '' });
  };

  const handleUpdateLoan = (id: string, patch: Partial<UserLoanItem>) => {
    const nextLoans = (finances.loans || []).map(l =>
      l.id === id ? { ...l, ...patch } : l
    );
    persistFireUpdates({ loans: nextLoans });
  };

  const handleRemoveLoan = (id: string) => {
    const nextLoans = (finances.loans || []).filter(l => l.id !== id);
    persistFireUpdates({ loans: nextLoans }, 'Removed loan from liabilities and recalculated.');
  };

  const handleAddSideIncome = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSideIncome.name.trim()) return;
    const item: SideIncomeStream = {
      id: `side-${Date.now()}`,
      name: newSideIncome.name.trim(),
      category: newSideIncome.category,
      monthlyAmountUSD: Math.round(Number(newSideIncome.monthlyInput) || 0),
      continuesInRetirement: newSideIncome.continuesInRetirement,
    };
    const nextSide = [...(finances.sideIncomes || []), item];
    persistFireUpdates({ sideIncomes: nextSide }, `Added side income "${item.name}" and recalculated.`);
    setNewSideIncome({ ...newSideIncome, name: '' });
  };

  const handleUpdateSideIncome = (id: string, patch: Partial<SideIncomeStream>) => {
    const nextSide = (finances.sideIncomes || []).map(s =>
      s.id === id ? { ...s, ...patch } : s
    );
    persistFireUpdates({ sideIncomes: nextSide });
  };

  const handleRemoveSideIncome = (id: string) => {
    const nextSide = (finances.sideIncomes || []).filter(s => s.id !== id);
    persistFireUpdates({ sideIncomes: nextSide }, 'Removed side income stream and recalculated.');
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.title.trim()) return;
    const item: FutureMilestoneExpense = {
      id: `goal-${Date.now()}`,
      title: newGoal.title.trim(),
      category: newGoal.category,
      estimatedCostTodayUSD: Math.round(Number(newGoal.costInput) || 0),
      targetYear: Number(newGoal.targetYear) || currentYear + 3,
      priority: newGoal.priority,
    };
    const nextGoals = [...(finances.futureExpenses || []), item];
    persistFireUpdates({ futureExpenses: nextGoals }, `Added milestone "${item.title}" and recalculated.`);
    setNewGoal({ ...newGoal, title: '' });
  };

  const handleUpdateGoal = (id: string, patch: Partial<FutureMilestoneExpense>) => {
    const nextGoals = (finances.futureExpenses || []).map(g =>
      g.id === id ? { ...g, ...patch } : g
    );
    persistFireUpdates({ futureExpenses: nextGoals });
  };

  const handleRemoveGoal = (id: string) => {
    const nextGoals = (finances.futureExpenses || []).filter(g => g.id !== id);
    persistFireUpdates({ futureExpenses: nextGoals }, 'Removed future milestone expense and recalculated.');
  };

  // ===========================================================================
  // CORE FIRE MATHEMATICAL ENGINE
  // ===========================================================================
  const fireAnalysis = useMemo(() => {
    const savings = Math.round(investmentsDraft.savingsUSD || 0);
    const stocks = Math.round(investmentsDraft.stocksMutualFundsUSD || 0);
    const realEstate = Math.round(investmentsDraft.realEstateUSD || 0);
    const gold = Math.round(investmentsDraft.goldUSD || 0);
    const others = Math.round(investmentsDraft.othersUSD || 0);

    // 3 core always-liquid financial schemes (Savings + Stocks/MFs + Others)
    const coreFinancialLiquidAssets = savings + stocks + others;
    // Active liquid assets included in FIRE (includes Gold only when includeGold is true)
    const liquidAssets = coreFinancialLiquidAssets + (includeGold ? gold : 0);
    // Total gross wealth across all 5 schemes regardless of exclusion toggles
    const totalGrossAssets = coreFinancialLiquidAssets + gold + realEstate;

    const loansList = finances.loans || [];
    const totalLoanPrincipalUSD = Math.round(
      loansList.reduce((s, l) => s + (l.outstandingPrincipalUSD || 0), 0)
    );
    const totalMonthlyEmiUSD = Math.round(
      loansList.reduce((s, l) => s + (l.monthlyEmiUSD || 0), 0)
    );

    // Starting FIRE Corpus Today (Net of loan liabilities, respecting both Gold and Home toggles)
    const startingCorpusTodayUSD = Math.max(
      0,
      liquidAssets + (includePrimaryHome ? realEstate : 0) - totalLoanPrincipalUSD
    );

    // Side Income Streams
    const sideList = finances.sideIncomes || [];
    const activeSideMonthlyUSD = sideList.reduce((s, i) => s + (i.monthlyAmountUSD || 0), 0);
    const retirementContinuingPassiveMonthlyUSD = sideList
      .filter(i => i.continuesInRetirement)
      .reduce((s, i) => s + (i.monthlyAmountUSD || 0), 0);

    // Tier multiplier for living expenses
    const tierMultiplier =
      fireTier === 'lean'
        ? 0.8
        : fireTier === 'fat'
        ? 1.35
        : fireTier === 'barista'
        ? 0.72
        : 1.0;

    const effectiveMonthlyExpenseTodayUSD = Math.round(baseMonthlyExpenseTodayUSD * tierMultiplier);
    const netMonthlyPortfolioNeedTodayUSD = Math.max(
      300,
      effectiveMonthlyExpenseTodayUSD - retirementContinuingPassiveMonthlyUSD
    );
    const annualPortfolioWithdrawalTodayUSD = netMonthlyPortfolioNeedTodayUSD * 12;

    // 1. FIRE Targets in Today's Purchasing Power (USD)
    const swrDecimal = Math.max(0.02, swrPct / 100);
    const leanFireTargetTodayUSD = Math.round(
      (Math.max(300, baseMonthlyExpenseTodayUSD * 0.8 - retirementContinuingPassiveMonthlyUSD) * 12) / swrDecimal
    );
    const standardFireTargetTodayUSD = Math.round(
      (Math.max(300, baseMonthlyExpenseTodayUSD - retirementContinuingPassiveMonthlyUSD) * 12) / swrDecimal
    );
    const fatFireTargetTodayUSD = Math.round(
      (Math.max(300, baseMonthlyExpenseTodayUSD * 1.35 - retirementContinuingPassiveMonthlyUSD) * 12) / swrDecimal
    );
    const activeFireTargetTodayUSD = Math.round(annualPortfolioWithdrawalTodayUSD / swrDecimal);

    // Present Value of Future Milestone Expenses (Education, Marriage, Insurance, Major Purchases)
    const goalsList = finances.futureExpenses || [];
    const inflationDec = inflationPct / 100;
    const nominalReturnDec = expectedReturnPct / 100;
    const realReturnDec = (1 + nominalReturnDec) / (1 + inflationDec) - 1;

    const enrichedGoals = goalsList.map(g => {
      const yearsAway = Math.max(0, g.targetYear - currentYear);
      const inflatedCostUSD = Math.round(
        g.estimatedCostTodayUSD * Math.pow(1 + inflationDec, yearsAway)
      );
      return {
        ...g,
        yearsAway,
        inflatedCostUSD,
      };
    });

    const totalFutureGoalsTodayUSD = enrichedGoals.reduce((s, g) => s + g.estimatedCostTodayUSD, 0);
    const totalFutureGoalsInflatedUSD = enrichedGoals.reduce((s, g) => s + g.inflatedCostUSD, 0);

    // Total Comprehensive FIRE Number Today (Living Corpus + Present Value of Future Milestones)
    const comprehensiveFireNumberTodayUSD = activeFireTargetTodayUSD + totalFutureGoalsTodayUSD;

    // Coast FIRE Target Today (Corpus needed today so real compounding alone reaches Standard FIRE by targetFireAge)
    const yearsToTargetAge = Math.max(1, targetFireAge - currentAge);
    const coastFireTargetTodayUSD = Math.round(
      comprehensiveFireNumberTodayUSD / Math.pow(1 + Math.max(0.01, realReturnDec), yearsToTargetAge)
    );

    // Progress % toward Selected FIRE Target Today
    const uncappedFireProgressPct = Math.max(
      0,
      Math.round((startingCorpusTodayUSD / Math.max(1, comprehensiveFireNumberTodayUSD)) * 100)
    );
    const fireProgressPct = Math.min(150, uncappedFireProgressPct);

    // 2. Systematic SIP Compounding Returns Mathematical Engine
    const calculateSipReturns = (
      monthlyAmountUSD: number,
      annualStepUpRate: number,
      annualReturnRate: number,
      durationYears: number
    ) => {
      const cleanDuration = Math.max(0, Math.round(durationYears * 10) / 10);
      if (cleanDuration <= 0 || monthlyAmountUSD <= 0) {
        return {
          totalPrincipalUSD: 0,
          finalMaturityUSD: 0,
          wealthGainedUSD: 0,
          returnPercent: 0,
          multiplier: 1.0,
          durationYears: 0,
        };
      }

      let currentMonthly = monthlyAmountUSD;
      let cumulativePrincipal = 0;
      let corpus = 0;
      const r = annualReturnRate / 100;
      const stepUp = annualStepUpRate / 100;

      const fullYears = Math.floor(cleanDuration);
      const partialYear = cleanDuration - fullYears;

      for (let y = 1; y <= fullYears; y++) {
        const annualInvested = currentMonthly * 12;
        cumulativePrincipal += annualInvested;
        // Mid-year compounding approximation for systematic monthly flows
        corpus = corpus * (1 + r) + annualInvested * (1 + r / 2);
        currentMonthly = currentMonthly * (1 + stepUp);
      }

      if (partialYear > 0) {
        const partialInvested = currentMonthly * 12 * partialYear;
        cumulativePrincipal += partialInvested;
        corpus = corpus * (1 + r * partialYear) + partialInvested * (1 + (r * partialYear) / 2);
      }

      const finalMaturityUSD = Math.round(corpus);
      const totalPrincipalUSD = Math.round(cumulativePrincipal);
      const wealthGainedUSD = Math.max(0, finalMaturityUSD - totalPrincipalUSD);
      const returnPercent = totalPrincipalUSD > 0 ? (wealthGainedUSD / totalPrincipalUSD) * 100 : 0;
      const multiplier = totalPrincipalUSD > 0 ? +(finalMaturityUSD / totalPrincipalUSD).toFixed(2) : 1.0;

      return {
        totalPrincipalUSD,
        finalMaturityUSD,
        wealthGainedUSD,
        returnPercent,
        multiplier,
        durationYears: cleanDuration,
      };
    };

    // 3. Year-by-Year Nominal & Real Wealth Trajectory Simulation (25-Year Horizon)
    const trajectory: FireTrajectoryPoint[] = [];

    let simCorpusNominal = startingCorpusTodayUSD;
    let simCumulativeContributions = startingCorpusTodayUSD;
    let simMonthlySip = monthlySipUSD;
    let simCumulativeSipPrincipal = 0;
    let simSipOnlyValue = 0;
    let crossoverYear: number | null =
      startingCorpusTodayUSD >= comprehensiveFireNumberTodayUSD ? currentYear : null;
    let crossoverAge: number | null =
      startingCorpusTodayUSD >= comprehensiveFireNumberTodayUSD ? currentAge : null;
    let yearsToFireExact = startingCorpusTodayUSD >= comprehensiveFireNumberTodayUSD ? 0 : -1;

    const targetHavenNetMonthlyNeedUSD = Math.max(
      300,
      defaultTargetHavenMonthlyExpenseUSD * tierMultiplier - retirementContinuingPassiveMonthlyUSD
    );

    for (let yrOffset = 0; yrOffset <= 25; yrOffset++) {
      const yr = currentYear + yrOffset;
      const age = currentAge + yrOffset;

      // Inflation-adjusted annual living withdrawal requirement in year `yr`
      const inflatedAnnualLivingNeed =
        annualPortfolioWithdrawalTodayUSD * Math.pow(1 + inflationDec, yrOffset);
      // Remaining future goals after year `yr`
      const remainingGoalsPV = enrichedGoals
        .filter(g => g.targetYear > yr)
        .reduce((s, g) => s + g.inflatedCostUSD, 0);

      const dynamicFireTargetNominal = Math.round(
        inflatedAnnualLivingNeed / swrDecimal + remainingGoalsPV
      );

      // Target Haven geo-arbitrage corpus in year `yr`
      const inflatedHavenAnnualNeed =
        targetHavenNetMonthlyNeedUSD * 12 * Math.pow(1 + inflationDec, yrOffset);
      const targetHavenCorpusNominal = Math.round(
        inflatedHavenAnnualNeed / swrDecimal + remainingGoalsPV
      );

      // Milestones occurring in this specific year
      const yearMilestonesUSD = enrichedGoals
        .filter(g => g.targetYear === yr)
        .reduce((s, g) => s + g.inflatedCostUSD, 0);

      // Loans already paid off by this year -> freed EMI automatically boosts investment capacity!
      const freedMonthlyEmiUSD = loansList
        .filter(l => yrOffset >= l.remainingYears)
        .reduce((s, l) => s + (l.monthlyEmiUSD || 0), 0);

      // Determine if SIP is active for this year based on user's continuity mode, SIP amount, and earning status
      const alreadyFiredPriorYear = stopSipAtFire && crossoverYear !== null && yr > crossoverYear;
      let isSipActiveThisYear = false;

      if (sipContinuityMode === 'paused' || monthlySipUSD <= 0) {
        isSipActiveThisYear = false;
      } else if (sipContinuityMode === 'custom-years') {
        const withinCommittedYears = yrOffset <= sipDurationYears;
        isSipActiveThisYear = withinCommittedYears && !alreadyFiredPriorYear;
      } else {
        // 'until-fire': Active while in active earning phase, ceases once FIRE is achieved
        isSipActiveThisYear = !alreadyFiredPriorYear;
      }

      const activeMonthlySip = isSipActiveThisYear ? simMonthlySip : 0;
      const annualSipOnlyInvested = Math.round(activeMonthlySip * 12);
      const annualTotalInjected = Math.round((activeMonthlySip + freedMonthlyEmiUSD) * 12);

      if (yrOffset > 0) {
        const prevCorpus = simCorpusNominal;
        const inRetirementWithdrawal = crossoverYear !== null && yr > crossoverYear;
        const livingWithdrawalUSD = inRetirementWithdrawal ? inflatedAnnualLivingNeed : 0;

        simCorpusNominal = Math.max(
          0,
          Math.round(
            prevCorpus * (1 + nominalReturnDec) + annualTotalInjected - livingWithdrawalUSD - yearMilestonesUSD
          )
        );
        simCumulativeContributions += annualTotalInjected;

        // Cumulative SIP standalone tracking
        simCumulativeSipPrincipal += annualSipOnlyInvested;
        simSipOnlyValue = simSipOnlyValue * (1 + nominalReturnDec) + annualSipOnlyInvested * (1 + nominalReturnDec / 2);

        // Check if FIRE crossover happened during this year
        if (crossoverYear === null && simCorpusNominal >= dynamicFireTargetNominal) {
          crossoverYear = yr;
          crossoverAge = age;
          const prevGap = Math.max(0, dynamicFireTargetNominal - prevCorpus);
          const yearGain = Math.max(1, simCorpusNominal - prevCorpus);
          const fraction = Math.min(1, prevGap / yearGain);
          yearsToFireExact = Math.round(((yrOffset - 1 + fraction) * 10)) / 10;
        }

        // Step up monthly SIP for next year if SIP was active
        if (isSipActiveThisYear) {
          simMonthlySip = simMonthlySip * (1 + sipStepUpPct / 100);
        }
      } else {
        // Deduct any current-year milestone if applicable
        simCorpusNominal = Math.max(0, simCorpusNominal - yearMilestonesUSD);
        simCumulativeSipPrincipal = 0;
        simSipOnlyValue = 0;
        if (simCorpusNominal >= dynamicFireTargetNominal) {
          crossoverYear = yr;
          crossoverAge = age;
          yearsToFireExact = 0;
        }
      }

      const compoundingGainsUSD = Math.max(0, simCorpusNominal - simCumulativeContributions);
      const fundingRatioPct =
        dynamicFireTargetNominal > 0
          ? Math.min(250, Math.round((simCorpusNominal / dynamicFireTargetNominal) * 100))
          : 100;
      const sipReturnsUSD = Math.max(0, Math.round(simSipOnlyValue - simCumulativeSipPrincipal));

      trajectory.push({
        year: yr,
        age,
        projectedCorpusUSD: simCorpusNominal,
        cumulativeContributionsUSD: simCumulativeContributions,
        compoundingGainsUSD,
        fireTargetUSD: dynamicFireTargetNominal,
        targetHavenCorpusUSD: targetHavenCorpusNominal,
        milestonesDeductedUSD: yearMilestonesUSD,
        annualSipInvestedUSD: annualSipOnlyInvested,
        freedEmiBonusUSD: freedMonthlyEmiUSD * 12,
        fundingRatioPct,
        cumulativeSipPrincipalUSD: simCumulativeSipPrincipal,
        sipPortfolioValueUSD: Math.round(simSipOnlyValue),
        sipReturnsUSD,
        isSipActiveInYear: isSipActiveThisYear,
      });
    }

    if (yearsToFireExact < 0) {
      yearsToFireExact = 25.5;
    }

    // Pre-calculate SIP Compounding Returns across key horizons
    const isSipStopped = sipContinuityMode === 'paused' || monthlySipUSD <= 0;
    const effectiveMonthlySipUSD = isSipStopped ? 0 : monthlySipUSD;
    const sipDurationForFire =
      isSipStopped
        ? 0
        : sipContinuityMode === 'custom-years'
        ? Math.min(sipDurationYears, Math.max(0.5, yearsToFireExact))
        : Math.max(0.5, Math.min(25, yearsToFireExact));

    const sipReturnsAtFire = calculateSipReturns(
      effectiveMonthlySipUSD,
      sipStepUpPct,
      expectedReturnPct,
      sipDurationForFire
    );

    const sipReturns3Yr = calculateSipReturns(
      effectiveMonthlySipUSD,
      sipStepUpPct,
      expectedReturnPct,
      isSipStopped ? 0 : Math.min(3, sipContinuityMode === 'custom-years' ? sipDurationYears : 3)
    );

    const sipReturns5Yr = calculateSipReturns(
      effectiveMonthlySipUSD,
      sipStepUpPct,
      expectedReturnPct,
      isSipStopped ? 0 : Math.min(5, sipContinuityMode === 'custom-years' ? sipDurationYears : 5)
    );

    const sipReturns10Yr = calculateSipReturns(
      effectiveMonthlySipUSD,
      sipStepUpPct,
      expectedReturnPct,
      isSipStopped ? 0 : Math.min(10, sipContinuityMode === 'custom-years' ? sipDurationYears : 10)
    );

    const sipReturnsCustom = calculateSipReturns(
      effectiveMonthlySipUSD,
      sipStepUpPct,
      expectedReturnPct,
      isSipStopped ? 0 : sipDurationYears
    );

    // 4. Helper to quickly simulate years-to-FIRE for "What-If" Accelerator Levers
    const simulateYearsForScenario = (
      customSipUSD: number,
      customStepUpPct: number,
      customBaseExpenseUSD: number,
      customReturnPct: number,
      prepayHighInterestLoanUSD = 0,
      customContinuityMode = sipContinuityMode,
      customDuration = sipDurationYears
    ): number => {
      let c = Math.max(0, startingCorpusTodayUSD);
      let sip = customSipUSD;
      const netMoNeed = Math.max(
        300,
        customBaseExpenseUSD * tierMultiplier - retirementContinuingPassiveMonthlyUSD
      );
      const baseAnnualNeed = netMoNeed * 12;

      for (let y = 0; y <= 30; y++) {
        const yr = currentYear + y;
        const target =
          (baseAnnualNeed * Math.pow(1 + inflationDec, y)) / swrDecimal +
          enrichedGoals.filter(g => g.targetYear > yr).reduce((s, g) => s + g.inflatedCostUSD, 0);
        if (c >= target) return y;
        const milestones = enrichedGoals
          .filter(g => g.targetYear === yr)
          .reduce((s, g) => s + g.inflatedCostUSD, 0);
        const freedEmi =
          loansList
            .filter(l => y >= l.remainingYears)
            .reduce((s, l) => s + (l.monthlyEmiUSD || 0), 0) + prepayHighInterestLoanUSD;

        let isSipActive = false;
        if (customContinuityMode === 'paused') {
          isSipActive = false;
        } else if (customContinuityMode === 'custom-years') {
          isSipActive = y <= customDuration;
        } else {
          isSipActive = true;
        }

        const activeSipAmount = isSipActive ? sip : 0;
        c = Math.max(
          0,
          c * (1 + customReturnPct / 100) + (activeSipAmount + freedEmi) * 12 - milestones
        );
        if (isSipActive) {
          sip = sip * (1 + customStepUpPct / 100);
        }
      }
      return 30;
    };

    const baseSimYears = simulateYearsForScenario(
      monthlySipUSD,
      sipStepUpPct,
      baseMonthlyExpenseTodayUSD,
      expectedReturnPct
    );

    const boostSip25Years = simulateYearsForScenario(
      Math.round(monthlySipUSD * 1.25),
      sipStepUpPct,
      baseMonthlyExpenseTodayUSD,
      expectedReturnPct
    );

    const geoArbitrageYears = simulateYearsForScenario(
      monthlySipUSD,
      sipStepUpPct,
      defaultTargetHavenMonthlyExpenseUSD,
      expectedReturnPct
    );

    const highInterestLoan = [...loansList].sort(
      (a, b) => b.interestRatePercent - a.interestRatePercent
    )[0];

    const prepayLoanYears = highInterestLoan
      ? simulateYearsForScenario(
          monthlySipUSD,
          sipStepUpPct,
          baseMonthlyExpenseTodayUSD,
          expectedReturnPct,
          highInterestLoan.monthlyEmiUSD
        )
      : baseSimYears;

    // 4. Strengths & Weaknesses Diagnostic Analysis
    const monthlySalary = Math.round(monthlySalaryUSD ?? 0);
    const currentExpensesMo = Math.round(monthlyCurrentExpensesUSD ?? 0);
    const totalMonthlyInflow = monthlySalary + activeSideMonthlyUSD;
    const totalMonthlyOutflow = currentExpensesMo + totalMonthlyEmiUSD + Math.round(effectiveMonthlySipUSD);
    const unallocatedMonthlySurplusUSD = totalMonthlyInflow - totalMonthlyOutflow;
    const expenseToIncomePct =
      totalMonthlyInflow > 0
        ? Math.round(((currentExpensesMo + totalMonthlyEmiUSD) / totalMonthlyInflow) * 100)
        : 0;
    const savingsRatePct =
      totalMonthlyInflow > 0 ? Math.round((effectiveMonthlySipUSD / totalMonthlyInflow) * 100) : 0;
    const debtToAssetPct =
      totalGrossAssets > 0 ? Math.round((totalLoanPrincipalUSD / totalGrossAssets) * 100) : 0;
    const emergencyMonths = Math.round(
      (savings / Math.max(1, currentExpensesMo + totalMonthlyEmiUSD)) * 10
    ) / 10;
    const equityAllocationPct =
      liquidAssets > 0 ? Math.round((stocks / liquidAssets) * 100) : 0;
    const hasInsuranceGoal = enrichedGoals.some(g => g.category === 'Insurance & Medical Corpus');

    // Simulate trimming 15% of Monthly Current Expenses and rolling that savings into Monthly SIP
    const trim15SavingsUSD = Math.round(currentExpensesMo * 0.15);
    const trimExpensesYears = simulateYearsForScenario(
      effectiveMonthlySipUSD + trim15SavingsUSD,
      sipStepUpPct,
      costBasisMode === 'residing' ? Math.max(300, currentExpensesMo - trim15SavingsUSD) : baseMonthlyExpenseTodayUSD,
      expectedReturnPct
    );

    const strengths: { title: string; detail: string }[] = [];
    const weaknesses: { title: string; detail: string }[] = [];

    if (expenseToIncomePct <= 55) {
      strengths.push({
        title: `Disciplined Monthly Current Expenses (${expenseToIncomePct}% of Inflow)`,
        detail: `Your current living expenses (${formatDualCurrency(currentExpensesMo, countryMacro, false)}/mo) plus EMIs leave strong headroom for compounding.`,
      });
    } else {
      weaknesses.push({
        title: `Elevated Monthly Living & EMI Outflow (${expenseToIncomePct}% of Inflow)`,
        detail: `Monthly current expenses (${formatDualCurrency(currentExpensesMo, countryMacro, false)}/mo) and loan EMIs consume ${expenseToIncomePct}% of your monthly income.`,
      });
    }

    if (isSipStopped) {
      weaknesses.push({
        title: `Monthly SIP Stopped ($0/mo — Coast FIRE Mode Active)`,
        detail: `You have stopped fresh monthly SIP contributions. Achieving FIRE depends entirely on your current net corpus (${formatDualCurrency(startingCorpusTodayUSD, countryMacro)}) compounding at ${expectedReturnPct}% without new salary savings.`,
      });
    } else if (savingsRatePct >= 25) {
      strengths.push({
        title: `Strong Monthly SIP Rate (${savingsRatePct}% of Inflow)`,
        detail: `You are systematically investing ${formatDualCurrency(effectiveMonthlySipUSD, countryMacro)} every month with a ${sipStepUpPct}% annual step-up ${
          sipContinuityMode === 'custom-years' ? `for the next ${sipDurationYears} years` : 'during your active earning phase'
        }.`,
      });
    } else {
      weaknesses.push({
        title: `Moderate SIP Investment Ratio (${savingsRatePct}% of Inflow)`,
        detail: `Increasing your monthly SIP toward 30%+ of monthly income will dramatically compress your years to FIRE.`,
      });
    }

    if (startingCorpusTodayUSD >= coastFireTargetTodayUSD) {
      strengths.push({
        title: `Coast FIRE Milestone Already Achieved`,
        detail: `Your current corpus (${formatDualCurrency(startingCorpusTodayUSD, countryMacro)}) already exceeds your Coast FIRE threshold (${formatDualCurrency(coastFireTargetTodayUSD, countryMacro)}).`,
      });
    } else {
      weaknesses.push({
        title: `Coast FIRE Gap of ${formatDualCurrency(coastFireTargetTodayUSD - startingCorpusTodayUSD, countryMacro)}`,
        detail: `Building your base corpus to ${formatDualCurrency(coastFireTargetTodayUSD, countryMacro)} will let compounding carry you to retirement.`,
      });
    }

    if (equityAllocationPct >= 55) {
      strengths.push({
        title: `Growth-Oriented Equity Allocation (${equityAllocationPct}% of Liquid Wealth)`,
        detail: `Your Stocks & Mutual Funds (${formatDualCurrency(stocks, countryMacro)}) outpace ${selectedBasisCountry}'s ${inflationPct}% inflation.`,
      });
    } else {
      weaknesses.push({
        title: `Low Equity Growth Exposure (${equityAllocationPct}% of Liquid Assets)`,
        detail: `Consider shifting excess idle cash or low-yield holdings into diversified index ETFs/Mutual Funds to beat ${inflationPct}% inflation.`,
      });
    }

    if (retirementContinuingPassiveMonthlyUSD >= effectiveMonthlyExpenseTodayUSD * 0.2) {
      strengths.push({
        title: `Durable Retirement Side Income (${formatDualCurrency(retirementContinuingPassiveMonthlyUSD, countryMacro, false)}/mo)`,
        detail: `Continuing passive streams cover ${Math.round((retirementContinuingPassiveMonthlyUSD / effectiveMonthlyExpenseTodayUSD) * 100)}% of your base retirement living costs.`,
      });
    } else {
      weaknesses.push({
        title: `Limited Post-Retirement Passive Cash Flow (${formatDualCurrency(retirementContinuingPassiveMonthlyUSD, countryMacro, false)}/mo)`,
        detail: `Building dividend, rental, or annuity streams that continue in retirement directly lowers your required FIRE corpus.`,
      });
    }

    const costlyLoans = loansList.filter(l => l.interestRatePercent >= expectedReturnPct - 1.5);
    if (costlyLoans.length > 0) {
      weaknesses.push({
        title: `${costlyLoans.length} High-Interest Loan(s) Dragging Compounding`,
        detail: `${costlyLoans[0].name} (${costlyLoans[0].interestRatePercent}% APR) drains ${formatDualCurrency(costlyLoans[0].monthlyEmiUSD, countryMacro, false)}/mo in EMI.`,
      });
    } else if (totalLoanPrincipalUSD === 0) {
      strengths.push({
        title: `100% Debt-Free Balance Sheet`,
        detail: `Zero loan EMIs allow 100% of your surplus cash flow to compound toward FIRE.`,
      });
    } else {
      strengths.push({
        title: `Manageable Debt-to-Asset Ratio (${debtToAssetPct}%)`,
        detail: `Your loan interest rates remain below your expected portfolio return (${expectedReturnPct}%), and payoff frees ${formatDualCurrency(totalMonthlyEmiUSD, countryMacro, false)}/mo.`,
      });
    }

    if (!hasInsuranceGoal && emergencyMonths < 12) {
      weaknesses.push({
        title: `Healthcare & Insurance Buffer Can Be Strengthened`,
        detail: `Add a dedicated International Health / Term Insurance corpus in Future Milestones to protect your FIRE nest egg from medical inflation.`,
      });
    } else {
      strengths.push({
        title: `Solid Emergency & Healthcare Cushion (${emergencyMonths} Months Liquid)`,
        detail: `Your cash savings (${formatDualCurrency(savings, countryMacro)}) and medical/insurance planning protect your portfolio from forced withdrawals.`,
      });
    }

    // 5. 50-Year Work-Free Runway & Digital Nomad Survival Year Simulation Engine
    const simulateCorpusSurvival = (
      monthlyRemoteIncomeTodayUSD: number,
      remoteIncomeDurationYrs: number,
      sabbaticalZeroWorkFirstYrs = 0,
      customBaseMonthlyExpenseUSD = effectiveMonthlyExpenseTodayUSD
    ) => {
      let balance = Math.max(0, startingCorpusTodayUSD);
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
        const inflationMultiplier = Math.pow(1 + inflationDec, y);

        // Living expense for this year
        const annualLiving = customBaseMonthlyExpenseUSD * 12 * inflationMultiplier;

        // Active loan EMIs still remaining in year y
        const activeAnnualEmi =
          loansList
            .filter(l => y < l.remainingYears)
            .reduce((s, l) => s + (l.monthlyEmiUSD || 0), 0) * 12;

        // Continuing passive income (dividends, rental, pension) adjusted for inflation
        const annualPassive =
          retirementContinuingPassiveMonthlyUSD * 12 * inflationMultiplier;

        // Digital Nomad / Remote work income (if within active earning window and after any initial sabbatical break)
        const isEarningNomadThisYear =
          y >= sabbaticalZeroWorkFirstYrs &&
          y < sabbaticalZeroWorkFirstYrs + remoteIncomeDurationYrs &&
          monthlyRemoteIncomeTodayUSD > 0;

        const annualNomadIncome = isEarningNomadThisYear
          ? monthlyRemoteIncomeTodayUSD * 12 * inflationMultiplier
          : 0;

        // One-time future milestone expenses occurring in calYear
        const milestonesInYear = enrichedGoals
          .filter(g => g.targetYear === calYear)
          .reduce((s, g) => s + g.inflatedCostUSD, 0);

        const totalAnnualOutflow = annualLiving + activeAnnualEmi + milestonesInYear;
        const totalAnnualInflow = annualPassive + annualNomadIncome;
        const netAnnualCashFlow = totalAnnualInflow - totalAnnualOutflow; // negative = withdrawal from corpus

        // Portfolio growth during the year + net cash flow
        const investmentGrowth = startBal * nominalReturnDec;
        const nextBal = startBal + investmentGrowth + netAnnualCashFlow;

        if (nextBal <= 0 && isPerpetual) {
          isPerpetual = false;
          // Calculate fractional year survival within year y
          const netDrainThisYear = Math.max(1, -netAnnualCashFlow - investmentGrowth);
          const fractionSurvived = Math.min(0.95, Math.max(0.05, startBal / netDrainThisYear));
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
        survivalYear: isPerpetual ? currentYear + 50 : depletedYear || currentYear,
        survivalAge: isPerpetual ? currentAge + 50 : depletedAge || currentAge,
        endingCorpusAt50YrsUSD: balance,
        balanceAfterSabbaticalUSD:
          sabbaticalZeroWorkFirstYrs > 0 ? balanceAfterSabbatical : startingCorpusTodayUSD,
        yearlyRows,
      };
    };

    // Scenario A: 100% Zero Active Work Starting Today (Pure Sabbatical / Retiree Drawdown)
    const zeroWorkSim = simulateCorpusSurvival(0, 0, 0, effectiveMonthlyExpenseTodayUSD);

    // Scenario B: With Expected Digital Nomad / Remote Income (for nomadIncomeActiveYears)
    const withNomadSim = simulateCorpusSurvival(
      expectedNomadMonthlyIncomeUSD,
      nomadIncomeActiveYears,
      0,
      effectiveMonthlyExpenseTodayUSD
    );

    // Scenario C: Take `plannedSabbaticalYears` of 100% Work-Free Break Today, THEN earn Nomad Income
    const sabbaticalThenNomadSim = simulateCorpusSurvival(
      expectedNomadMonthlyIncomeUSD,
      nomadIncomeActiveYears,
      plannedSabbaticalYears,
      effectiveMonthlyExpenseTodayUSD
    );

    // Scenario D: Zero-Work Runway if Geo-Arbitraging in Target Haven (using Target Haven monthly budget)
    const targetHavenZeroWorkSim = simulateCorpusSurvival(
      0,
      0,
      0,
      Math.max(400, Math.round(defaultTargetHavenMonthlyExpenseUSD * tierMultiplier))
    );

    // Find Minimum Monthly Digital Nomad Income needed over nomadIncomeActiveYears so money lasts 50+ years (Perpetual)
    let minMonthlyNomadIncomeForPerpetualUSD = 0;
    if (!zeroWorkSim.isPerpetual) {
      let low = 0;
      let high = Math.max(15000, effectiveMonthlyExpenseTodayUSD + totalMonthlyEmiUSD + 3000);
      for (let iter = 0; iter < 18; iter++) {
        const mid = Math.round((low + high) / 2);
        const testSim = simulateCorpusSurvival(
          mid,
          Math.max(1, nomadIncomeActiveYears),
          0,
          effectiveMonthlyExpenseTodayUSD
        );
        if (testSim.isPerpetual && testSim.endingCorpusAt50YrsUSD > 0) {
          high = mid;
        } else {
          low = mid;
        }
      }
      minMonthlyNomadIncomeForPerpetualUSD = Math.ceil(high / 25) * 25;
    }

    // Build combined Survival Timeline rows for the comparison table
    const survivalTimeline = zeroWorkSim.yearlyRows
      .filter(
        r =>
          r.yearOffset === 1 ||
          r.yearOffset === 3 ||
          r.yearOffset === 5 ||
          r.yearOffset % 5 === 0 ||
          r.calendarYear === zeroWorkSim.survivalYear ||
          r.calendarYear === withNomadSim.survivalYear
      )
      .slice(0, 14)
      .map(r => {
        const matchingNomadRow = withNomadSim.yearlyRows.find(
          nr => nr.calendarYear === r.calendarYear
        );
        const matchingSabbaticalRow = sabbaticalThenNomadSim.yearlyRows.find(
          sr => sr.calendarYear === r.calendarYear
        );
        return {
          ...r,
          withNomadEndCorpusUSD: matchingNomadRow ? matchingNomadRow.endCorpusUSD : 0,
          withNomadInflowUSD: matchingNomadRow
            ? matchingNomadRow.annualPassiveAndNomadInflowUSD
            : r.annualPassiveAndNomadInflowUSD,
          afterSabbaticalEndCorpusUSD: matchingSabbaticalRow
            ? matchingSabbaticalRow.endCorpusUSD
            : 0,
        };
      });

    return {
      savings,
      stocks,
      realEstate,
      gold,
      others,
      coreFinancialLiquidAssets,
      startingCorpusTodayUSD,
      liquidAssets,
      totalGrossAssets,
      totalLoanPrincipalUSD,
      totalMonthlyEmiUSD,
      monthlySalary,
      activeSideMonthlyUSD,
      retirementContinuingPassiveMonthlyUSD,
      currentExpensesMo,
      totalMonthlyInflow,
      totalMonthlyOutflow,
      unallocatedMonthlySurplusUSD,
      isSipStopped,
      effectiveMonthlySipUSD,
      expenseToIncomePct,
      effectiveMonthlyExpenseTodayUSD,
      netMonthlyPortfolioNeedTodayUSD,
      leanFireTargetTodayUSD,
      standardFireTargetTodayUSD,
      fatFireTargetTodayUSD,
      coastFireTargetTodayUSD,
      activeFireTargetTodayUSD,
      comprehensiveFireNumberTodayUSD,
      totalFutureGoalsTodayUSD,
      totalFutureGoalsInflatedUSD,
      enrichedGoals,
      fireProgressPct,
      uncappedFireProgressPct,
      yearsToTargetAge,
      realReturnPct: Math.round(realReturnDec * 1000) / 10,
      tierMultiplier,
      trajectory,
      crossoverYear,
      crossoverAge,
      yearsToFireExact,
      savingsRatePct,
      emergencyMonths,
      strengths,
      weaknesses,
      accelerators: [
        {
          id: 'trim-expenses',
          title: `Optimize Monthly Current Expenses by 15% (& Invest +${formatDualCurrency(trim15SavingsUSD, countryMacro, false)}/mo)`,
          impactYears: Math.max(0.5, Math.round((baseSimYears - trimExpensesYears) * 10) / 10),
          description: `Trimming monthly current expenses from ${formatDualCurrency(currentExpensesMo, countryMacro, false)} to ${formatDualCurrency(Math.max(300, currentExpensesMo - trim15SavingsUSD), countryMacro, false)} both lowers your required FIRE corpus and boosts your monthly SIP.`,
          actionLabel: 'Apply 15% Expense Optimization',
          onApply: () => {
            const nextExp = Math.max(300, currentExpensesMo - trim15SavingsUSD);
            const nextSip = monthlySipUSD + trim15SavingsUSD;
            setMonthlyCurrentExpensesUSD(nextExp);
            if (costBasisMode === 'residing') setBaseMonthlyExpenseTodayUSD(nextExp);
            setMonthlySipUSD(nextSip);
            persistFireUpdates(
              { monthlyCurrentExpensesUSD: nextExp, monthlySipUSD: nextSip },
              'Optimized Monthly Current Expenses by 15% and rolled savings into Monthly SIP!'
            );
          },
        },
        {
          id: 'boost-sip',
          title: `Step Up Monthly SIP by +25% (+${formatDualCurrency(Math.round(monthlySipUSD * 0.25), countryMacro, false)}/mo)`,
          impactYears: Math.max(0.5, Math.round((baseSimYears - boostSip25Years) * 10) / 10),
          description: `Increasing your systematic monthly investment from ${formatDualCurrency(monthlySipUSD, countryMacro, false)} to ${formatDualCurrency(Math.round(monthlySipUSD * 1.25), countryMacro, false)} compounds aggressively.`,
          actionLabel: 'Apply +25% SIP',
          onApply: () => {
            const nextSip = Math.round(monthlySipUSD * 1.25);
            setMonthlySipUSD(nextSip);
            persistFireUpdates({ monthlySipUSD: nextSip }, 'Applied +25% Monthly SIP acceleration!');
          },
        },
        {
          id: 'geo-arbitrage',
          title: `Geo-Arbitrage FIRE in ${targetHavenCountryName} (${formatDualCurrency(defaultTargetHavenMonthlyExpenseUSD, countryMacro, false)}/mo)`,
          impactYears: Math.max(0.5, Math.round((baseSimYears - geoArbitrageYears) * 10) / 10),
          description: `Retiring in ${targetHavenCountryName} instead of ${selectedBasisCountry} lowers your required FIRE corpus to ${formatDualCurrency(Math.round((( Math.max(300, defaultTargetHavenMonthlyExpenseUSD - retirementContinuingPassiveMonthlyUSD) * 12) / swrDecimal) + totalFutureGoalsTodayUSD), countryMacro)}.`,
          actionLabel: `Switch Basis to ${targetHavenCountryName}`,
          onApply: () => {
            handleSwitchCostBasis('target-haven');
            triggerToast(`Switched FIRE cost basis to ${targetHavenCountryName} Geo-Arbitrage!`);
          },
        },
        ...(highInterestLoan
          ? [
              {
                id: 'prepay-loan',
                title: `Pay Off "${highInterestLoan.name}" & Roll ${formatDualCurrency(highInterestLoan.monthlyEmiUSD, countryMacro, false)}/mo EMI into SIP`,
                impactYears: Math.max(0.5, Math.round((baseSimYears - prepayLoanYears) * 10) / 10),
                description: `Eliminating ${highInterestLoan.interestRatePercent}% debt and redirecting its ${formatDualCurrency(highInterestLoan.monthlyEmiUSD, countryMacro, false)}/mo EMI directly into your equity SIPs accelerates compounding.`,
                actionLabel: 'Simulate EMI Roll-In',
                onApply: () => {
                  const nextSip = monthlySipUSD + highInterestLoan.monthlyEmiUSD;
                  setMonthlySipUSD(nextSip);
                  persistFireUpdates({ monthlySipUSD: nextSip }, `Rolled ${highInterestLoan.name} EMI into Monthly SIP!`);
                },
              },
            ]
          : []),
      ],
      sipContinuityMode,
      sipDurationYears,
      stopSipAtFire,
      sipReturnsAtFire,
      sipReturns3Yr,
      sipReturns5Yr,
      sipReturns10Yr,
      sipReturnsCustom,
      zeroWorkSim,
      withNomadSim,
      sabbaticalThenNomadSim,
      targetHavenZeroWorkSim,
      minMonthlyNomadIncomeForPerpetualUSD,
      survivalTimeline,
    };
  }, [
    finances,
    investmentsDraft,
    monthlySalaryUSD,
    monthlyCurrentExpensesUSD,
    currentAge,
    targetFireAge,
    monthlySipUSD,
    sipStepUpPct,
    sipContinuityMode,
    sipDurationYears,
    stopSipAtFire,
    inflationPct,
    expectedReturnPct,
    swrPct,
    includePrimaryHome,
    includeGold,
    expectedNomadMonthlyIncomeUSD,
    nomadIncomeActiveYears,
    plannedSabbaticalYears,
    baseMonthlyExpenseTodayUSD,
    costBasisMode,
    fireTier,
    countryMacro,
    selectedBasisCountry,
    targetHavenCountryName,
    defaultTargetHavenMonthlyExpenseUSD,
  ]);

  const gapOrSurplusUSD =
    fireAnalysis.startingCorpusTodayUSD - fireAnalysis.comprehensiveFireNumberTodayUSD;

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50/80 via-white to-emerald-50/75 rounded-3xl border border-indigo-200/80 p-6 sm:p-8 shadow-md space-y-7">
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-violet-500 via-50% to-emerald-500" />
      <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-indigo-400/12 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-emerald-400/12 blur-3xl" />
      
      {/* Top Header & Residing Country / Dual-Currency Banner */}
      <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-indigo-100/80">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-teal-500 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  FIRE Calculator,{' '}
                  <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-teal-600 bg-clip-text text-transparent">
                    Visual Trajectory &amp; Independence Planner
                  </span>
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-indigo-100 to-teal-100 text-indigo-950 border border-indigo-200 uppercase tracking-wider inline-flex items-center gap-1.5 shadow-2xs">
                  <CountryFlag countryName={selectedBasisCountry} size="xs" className="rounded-xs" />
                  <span>{selectedBasisCountry} ({countryMacro.currencyCode}) + $ USD Dual Ledger</span>
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Unified FIRE calculator, work-free runway survival simulator, Digital Nomad cash-flow bridge, and multi-horizon compounding trajectory for <strong>{selectedBasisCountry}</strong> ({inflationPct}% inflation, {expectedReturnPct}% return) &amp; <strong>{targetHavenCountryName}</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Save & Currency Mode Controls */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {countryMacro.currencyCode !== 'USD' && (
            <div className="inline-flex rounded-xl border border-slate-200 p-0.5 bg-slate-100 text-[11px] font-semibold">
              <button
                type="button"
                onClick={() => setInputCurrencyMode('LOCAL')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  inputCurrencyMode === 'LOCAL'
                    ? 'bg-white text-orange-950 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Input in {countryMacro.currencyCode} ({countryMacro.symbol.trim()})
              </button>
              <button
                type="button"
                onClick={() => setInputCurrencyMode('USD')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  inputCurrencyMode === 'USD'
                    ? 'bg-white text-orange-950 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Input in $ USD
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() =>
              persistFireUpdates(
                {},
                'Saved & Recalculated! All FIRE parameters, Digital Nomad runway settings, expenses, assets, and milestones are updated.'
              )
            }
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-600 via-amber-600 to-purple-600 text-white hover:from-orange-700 hover:to-purple-700 transition-all text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Save &amp; Recalculate FIRE Plan</span>
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* DUAL-PERSONA PLANNER SWITCHER: RETIREE vs. DIGITAL NOMAD & RUNWAY     */}
      {/* ===================================================================== */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-indigo-50/95 via-white to-teal-50/90 border border-indigo-200/90 flex flex-col lg:flex-row lg:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-start sm:items-center gap-2.5">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm ${
            plannerPersonaMode === 'digital-nomad'
              ? 'bg-teal-600 text-white'
              : 'bg-indigo-600 text-white'
          }`}>
            {plannerPersonaMode === 'digital-nomad' ? '⚡' : '🌿'}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                Active Independence &amp; Survival Lens:
              </span>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                plannerPersonaMode === 'digital-nomad'
                  ? 'bg-teal-100 text-teal-900 border border-teal-300'
                  : 'bg-indigo-100 text-indigo-900 border border-indigo-300'
              }`}>
                {plannerPersonaMode === 'digital-nomad'
                  ? 'Digital Nomad · Work-Free Runway & Survival Year Mode'
                  : 'Early Retiree · Full Passive FIRE & Corpus Survival Mode'}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5">
              {plannerPersonaMode === 'digital-nomad'
                ? `Showing how long you need not work today (${fireAnalysis.zeroWorkSim.isPerpetual ? '50+ Yrs / Perpetual' : `${fireAnalysis.zeroWorkSim.wholeYears} yrs ${fireAnalysis.zeroWorkSim.remMonths} mos`}), exact survival year without working (${fireAnalysis.zeroWorkSim.isPerpetual ? 'Perpetual 2076+' : `Year ${fireAnalysis.zeroWorkSim.survivalYear}`}), and survival year with expected remote income.`
                : `Showing full passive ${swrPct.toFixed(1)}% SWR FIRE readiness (${fireAnalysis.uncappedFireProgressPct}% funded) plus exact calendar year your current corpus lasts without working (${fireAnalysis.zeroWorkSim.isPerpetual ? 'Perpetual 2076+' : `Until Year ${fireAnalysis.zeroWorkSim.survivalYear} · Age ${fireAnalysis.zeroWorkSim.survivalAge}`}).`}
            </p>
          </div>
        </div>

        <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200/90 shrink-0 self-start lg:self-center">
          <button
            type="button"
            onClick={() => {
              setPlannerPersonaMode('retiree');
              try {
                localStorage.setItem('refirely_persona', 'retiree');
              } catch {
                // ignore
              }
              persistFireUpdates(
                { plannerPersonaMode: 'retiree' },
                'Switched to Early Retiree & Full Passive FIRE View.'
              );
            }}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              plannerPersonaMode === 'retiree'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🌿 Retiree &amp; Full FIRE View</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setPlannerPersonaMode('digital-nomad');
              try {
                localStorage.setItem('refirely_persona', 'nomad');
              } catch {
                // ignore
              }
              persistFireUpdates(
                { plannerPersonaMode: 'digital-nomad' },
                'Switched to Digital Nomad & Work-Free Runway Survival View.'
              );
            }}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              plannerPersonaMode === 'digital-nomad'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>⚡ Digital Nomad &amp; Work-Free Runway View</span>
          </button>
        </div>
      </div>

      {savedToast && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{savedToast}</span>
        </div>
      )}

      {/* Top 4 Unified Executive FIRE KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Current Net FIRE Corpus */}
        <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5 gap-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                1. Current Net FIRE Corpus
              </span>
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded bg-teal-100 text-teal-800"
                title={`Calculated as: Current Net FIRE Corpus ($${fireAnalysis.startingCorpusTodayUSD.toLocaleString()}) ÷ Target FIRE Corpus ($${fireAnalysis.comprehensiveFireNumberTodayUSD.toLocaleString()}) = ${fireAnalysis.uncappedFireProgressPct}%`}
              >
                {fireAnalysis.uncappedFireProgressPct}% Funded
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-extrabold font-mono text-slate-900 tabular-nums">
              {countryMacro.currencyCode !== 'USD'
                ? formatLocalCurrency(fireAnalysis.startingCorpusTodayUSD, countryMacro, true)
                : `$${fireAnalysis.startingCorpusTodayUSD.toLocaleString()}`}
            </div>
            <div className="text-xs font-mono text-slate-600 font-semibold mt-0.5">
              ${fireAnalysis.startingCorpusTodayUSD.toLocaleString()} USD
            </div>

            {/* Explicit Itemized Composition of Card 1 */}
            <div className="mt-2.5 p-2 rounded-lg bg-white border border-slate-200/80 space-y-1 text-[10px] font-mono text-slate-600">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-sans">3 Financial Schemes (Cash+Stocks+Other):</span>
                <span className="font-bold text-slate-800">+${fireAnalysis.coreFinancialLiquidAssets.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-sans">Gold &amp; Bullion (${fireAnalysis.gold.toLocaleString()}):</span>
                <span className={`font-bold ${includeGold ? 'text-amber-700' : 'text-slate-400'}`}>
                  {includeGold ? `+$${fireAnalysis.gold.toLocaleString()} (Included)` : '$0 (Excluded)'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-sans">Real Estate Equity (${fireAnalysis.realEstate.toLocaleString()}):</span>
                <span className={`font-bold ${includePrimaryHome ? 'text-indigo-700' : 'text-slate-400'}`}>
                  {includePrimaryHome ? `+$${fireAnalysis.realEstate.toLocaleString()} (Included)` : '$0 (Excluded)'}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 pt-0.5">
                <span className="text-slate-500 font-sans">Less Loan Principal (Debt):</span>
                <span className="font-bold text-rose-700">-${fireAnalysis.totalLoanPrincipalUSD.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-200/80 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
              <span>
                🪙 Gold: <strong className={includeGold ? 'text-amber-800' : 'text-slate-500'}>{includeGold ? 'Included' : 'Excluded (Family Gold)'}</strong>
              </span>
              <span>
                🏠 Home: <strong className={includePrimaryHome ? 'text-indigo-800' : 'text-slate-500'}>{includePrimaryHome ? 'Included' : 'Excluded'}</strong>
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => {
                  const nextGold = !includeGold;
                  setIncludeGold(nextGold);
                  persistFireUpdates(
                    { includeGoldInFire: nextGold },
                    nextGold
                      ? `Included Gold & Bullion (+$${fireAnalysis.gold.toLocaleString()}) in Current Net FIRE Corpus!`
                      : `Excluded Gold & Bullion ($${fireAnalysis.gold.toLocaleString()}) — preserving family/heirloom gold outside FIRE drawdown.`
                  );
                }}
                title="In many Indian & global households, family/women's gold is kept as generational wealth and not sold for retirement expenses."
                className={`px-2 py-1 rounded font-bold text-[10px] transition-colors cursor-pointer text-center ${
                  includeGold
                    ? 'bg-amber-100/90 hover:bg-amber-200/90 text-amber-900 border border-amber-300/80'
                    : 'bg-slate-200/80 hover:bg-amber-100 text-slate-700 border border-slate-300'
                }`}
              >
                {includeGold
                  ? `Exclude Gold (-$${fireAnalysis.gold.toLocaleString()})`
                  : `+ Include Gold (+$${fireAnalysis.gold.toLocaleString()})`}
              </button>

              <button
                type="button"
                onClick={() => {
                  const nextInclude = !includePrimaryHome;
                  setIncludePrimaryHome(nextInclude);
                  persistFireUpdates(
                    { includePrimaryHomeInFire: nextInclude },
                    nextInclude
                      ? `Included Real Estate Equity (+$${fireAnalysis.realEstate.toLocaleString()}) in Current Net FIRE Corpus!`
                      : `Excluded Real Estate Equity ($${fireAnalysis.realEstate.toLocaleString()}) — showing strictly Liquid Assets net of debt.`
                  );
                }}
                className={`px-2 py-1 rounded font-bold text-[10px] transition-colors cursor-pointer text-center ${
                  includePrimaryHome
                    ? 'bg-indigo-100/90 hover:bg-indigo-200/90 text-indigo-900 border border-indigo-300/80'
                    : 'bg-orange-100/80 hover:bg-orange-200/80 text-orange-800 border border-orange-200'
                }`}
              >
                {includePrimaryHome
                  ? `Exclude Home (-$${fireAnalysis.realEstate.toLocaleString()})`
                  : `+ Include Home (+$${fireAnalysis.realEstate.toLocaleString()})`}
              </button>
            </div>
          </div>
        </div>

        {/* KPI 2: Required Total FIRE Number (Living + Milestones) */}
        <div className="p-5 rounded-xl border-2 border-orange-400/60 bg-gradient-to-br from-orange-50/70 via-amber-50/30 to-purple-50/40 flex flex-col justify-between shadow-2xs">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-orange-950 uppercase tracking-wider">
                2. Target {fireTier.toUpperCase()} FIRE Corpus
              </span>
              <Flame className="w-4 h-4 text-orange-600" />
            </div>
            <div className="text-xl sm:text-2xl font-extrabold font-mono text-orange-950 tabular-nums">
              {countryMacro.currencyCode !== 'USD'
                ? formatLocalCurrency(fireAnalysis.comprehensiveFireNumberTodayUSD, countryMacro, true)
                : `$${fireAnalysis.comprehensiveFireNumberTodayUSD.toLocaleString()}`}
            </div>
            <div className="text-xs font-mono text-purple-900 font-semibold mt-0.5">
              ${fireAnalysis.comprehensiveFireNumberTodayUSD.toLocaleString()} USD
            </div>

            {/* Explicit Formula Breakdown of Card 2 */}
            <div className="mt-2.5 p-2 rounded-lg bg-white/85 border border-orange-200/70 space-y-1 text-[10px] font-mono text-orange-950/90">
              <div className="flex items-center justify-between">
                <span className="font-sans text-slate-600">
                  Net Expense (${fireAnalysis.netMonthlyPortfolioNeedTodayUSD.toLocaleString()}/mo × 12):
                </span>
                <span className="font-bold">${(fireAnalysis.netMonthlyPortfolioNeedTodayUSD * 12).toLocaleString()}/yr</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-sans text-slate-600">
                  Living Corpus (×{Math.round((100 / Math.max(1, swrPct)) * 10) / 10}x at {swrPct.toFixed(1)}% SWR):
                </span>
                <span className="font-bold">+${fireAnalysis.activeFireTargetTodayUSD.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between border-t border-orange-100 pt-0.5">
                <span className="font-sans text-slate-600">Plus One-Time Future Goals:</span>
                <span className="font-bold text-purple-800">+${fireAnalysis.totalFutureGoalsTodayUSD.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-orange-200/70 text-[11px] text-orange-950/80 flex items-center justify-between">
            <span>Retire Exp: ${fireAnalysis.effectiveMonthlyExpenseTodayUSD.toLocaleString()}/mo</span>
            <span className="font-mono font-bold">{swrPct.toFixed(1)}% SWR ({Math.round((100 / Math.max(1, swrPct)) * 10) / 10}x)</span>
          </div>
        </div>

        {/* KPI 3: Monthly Current Expenses & Monthly SIP */}
        <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                {plannerPersonaMode === 'digital-nomad'
                  ? '3. Nomad Income & SIP Flow'
                  : '3. Monthly SIP & Expenses'}
              </span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded shrink-0 ${
                plannerPersonaMode === 'digital-nomad'
                  ? 'bg-teal-100 text-teal-800'
                  : fireAnalysis.isSipStopped
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}>
                {plannerPersonaMode === 'digital-nomad'
                  ? `Nomad: $${expectedNomadMonthlyIncomeUSD.toLocaleString()}/mo`
                  : fireAnalysis.isSipStopped
                  ? 'SIP Stopped ($0)'
                  : `${fireAnalysis.savingsRatePct}% SIP Rate`}
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-extrabold font-mono text-emerald-800 tabular-nums">
              {plannerPersonaMode === 'digital-nomad'
                ? countryMacro.currencyCode !== 'USD'
                  ? `${formatLocalCurrency(expectedNomadMonthlyIncomeUSD, countryMacro, false)}/mo`
                  : `$${expectedNomadMonthlyIncomeUSD.toLocaleString()}/mo`
                : fireAnalysis.isSipStopped
                ? '$0 / mo (Coast Mode)'
                : countryMacro.currencyCode !== 'USD'
                ? `${formatLocalCurrency(fireAnalysis.effectiveMonthlySipUSD, countryMacro, false)}/mo`
                : `$${fireAnalysis.effectiveMonthlySipUSD.toLocaleString()}/mo`}
            </div>
            <div className="text-xs font-mono text-slate-600 font-semibold mt-0.5">
              {plannerPersonaMode === 'digital-nomad'
                ? `Expected Nomad Income (${nomadIncomeActiveYears} yrs) · SIP: $${fireAnalysis.effectiveMonthlySipUSD.toLocaleString()}/mo`
                : fireAnalysis.isSipStopped
                ? '0 fresh contributions (compounding current assets)'
                : `$${fireAnalysis.effectiveMonthlySipUSD.toLocaleString()} USD/mo · +${sipStepUpPct}%/yr step-up`}
            </div>

            {/* Explicit Cash-Flow Breakdown of Card 3 */}
            <div className="mt-2.5 p-2 rounded-lg bg-white border border-slate-200/80 space-y-1 text-[10px] font-mono text-slate-600">
              <div className="flex items-center justify-between">
                <span className="font-sans text-slate-500">Monthly Inflow (Salary+Side):</span>
                <span className="font-bold text-slate-800">${fireAnalysis.totalMonthlyInflow.toLocaleString()}/mo</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-sans text-slate-500">Current Living Expenses:</span>
                <span className="font-bold text-rose-700">-${fireAnalysis.currentExpensesMo.toLocaleString()}/mo</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 pt-0.5">
                <span className="font-sans text-slate-500">Retire Passive Income Offset:</span>
                <span className="font-bold text-emerald-700">+${fireAnalysis.retirementContinuingPassiveMonthlyUSD.toLocaleString()}/mo</span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-200/80 text-[11px] text-slate-600 flex items-center justify-between">
            <span>Current Expenses:</span>
            <span className="font-mono font-bold text-rose-700">
              {countryMacro.currencyCode !== 'USD'
                ? `${formatLocalCurrency(fireAnalysis.currentExpensesMo, countryMacro, false)} ($${fireAnalysis.currentExpensesMo.toLocaleString()})`
                : `$${fireAnalysis.currentExpensesMo.toLocaleString()}/mo`}
            </span>
          </div>
        </div>

        {/* KPI 4: Work-Free Runway, Survival Year & Time to FIRE */}
        <div className={`p-5 rounded-xl border flex flex-col justify-between ${
          plannerPersonaMode === 'digital-nomad'
            ? 'border-2 border-teal-400/70 bg-gradient-to-br from-teal-50/80 via-white to-indigo-50/50 shadow-2xs'
            : 'border-slate-200 bg-slate-50/70'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                {plannerPersonaMode === 'digital-nomad'
                  ? '4. Work-Free Runway & Survival'
                  : '4. Time to FIRE & Survival Year'}
              </span>
              <Clock className="w-4 h-4 text-teal-600" />
            </div>

            {plannerPersonaMode === 'digital-nomad' ? (
              <>
                <div className="text-xl sm:text-2xl font-extrabold font-mono text-teal-900 tabular-nums">
                  {fireAnalysis.zeroWorkSim.isPerpetual
                    ? '50+ Yrs (Perpetual)'
                    : `${fireAnalysis.zeroWorkSim.wholeYears} Yrs ${fireAnalysis.zeroWorkSim.remMonths} Mos`}
                </div>
                <div className="text-xs font-mono text-teal-800 font-semibold mt-0.5">
                  0-Work Survival:{' '}
                  {fireAnalysis.zeroWorkSim.isPerpetual
                    ? `Year ${currentYear + 50}+ (Age ${currentAge + 50}+)`
                    : `Until Year ${fireAnalysis.zeroWorkSim.survivalYear} (Age ${fireAnalysis.zeroWorkSim.survivalAge})`}
                </div>
              </>
            ) : fireAnalysis.yearsToFireExact === 0 ? (
              <>
                <div className="text-xl sm:text-2xl font-extrabold text-emerald-700">
                  FIRE Achieved! 🎉
                </div>
                <div className="text-xs font-mono text-emerald-800 font-semibold mt-0.5">
                  Surplus: +{formatDualCurrency(Math.abs(gapOrSurplusUSD), countryMacro)}
                </div>
              </>
            ) : (
              <>
                <div className="text-xl sm:text-2xl font-extrabold font-mono text-purple-950 tabular-nums">
                  {fireAnalysis.yearsToFireExact <= 25
                    ? `${fireAnalysis.yearsToFireExact} Years`
                    : '25+ Years'}
                  <span className="text-xs font-sans font-semibold text-slate-500 ml-1.5">
                    (Year {fireAnalysis.crossoverYear || '2051+'})
                  </span>
                </div>
                <div className="text-xs font-mono text-rose-700 font-semibold mt-0.5">
                  Gap: -{formatDualCurrency(Math.abs(gapOrSurplusUSD), countryMacro)}
                </div>
              </>
            )}

            {/* Explicit Formula & Survival Year Breakdown of Card 4 */}
            <div className="mt-2.5 p-2 rounded-lg bg-white border border-slate-200/80 space-y-1 text-[10px] font-mono text-slate-600">
              <div className="flex items-center justify-between">
                <span className="font-sans text-slate-500">Without Working (0 Income):</span>
                <span className="font-bold text-indigo-800">
                  {fireAnalysis.zeroWorkSim.isPerpetual
                    ? `2076+ (Perpetual)`
                    : `Until ${fireAnalysis.zeroWorkSim.survivalYear} (${fireAnalysis.zeroWorkSim.exactRunwayYears}y)`}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-sans text-slate-500">
                  With Nomad (${expectedNomadMonthlyIncomeUSD.toLocaleString()}/mo):
                </span>
                <span className="font-bold text-teal-800">
                  {fireAnalysis.withNomadSim.isPerpetual
                    ? `2076+ (Perpetual)`
                    : `Until ${fireAnalysis.withNomadSim.survivalYear} (${fireAnalysis.withNomadSim.exactRunwayYears}y)`}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 pt-0.5">
                <span className="font-sans text-slate-500">Full FIRE Crossover:</span>
                <span className={`font-bold ${fireAnalysis.yearsToFireExact === 0 ? 'text-emerald-700' : 'text-purple-800'}`}>
                  {fireAnalysis.yearsToFireExact === 0
                    ? 'Achieved Today'
                    : `${fireAnalysis.yearsToFireExact}y (Year ${fireAnalysis.crossoverYear || '2051+'})`}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-200/80 text-[11px] text-slate-600 flex items-center justify-between">
            <span>Money Lasts (0 Work):</span>
            <span className="font-mono font-bold text-teal-900">
              {fireAnalysis.zeroWorkSim.isPerpetual
                ? `Forever (Age ${currentAge + 50}+)`
                : `Year ${fireAnalysis.zeroWorkSim.survivalYear} (Age ${fireAnalysis.zeroWorkSim.survivalAge})`}
            </span>
          </div>
        </div>

      </div>

      {/* ===================================================================== */}
      {/* WORK-FREE RUNWAY, SURVIVAL YEAR & DIGITAL NOMAD PLANNER CONSOLE       */}
      {/* ===================================================================== */}
      <div className={`rounded-2xl border p-5 sm:p-6 space-y-5 shadow-xs transition-all ${
        plannerPersonaMode === 'digital-nomad'
          ? 'bg-gradient-to-br from-teal-50/90 via-white to-indigo-50/80 border-teal-300/90 ring-1 ring-teal-200/60'
          : 'bg-gradient-to-br from-slate-50/90 via-white to-indigo-50/50 border-indigo-200/80'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                  How Long Your Money Lasts — Work-Free Runway &amp; Survival Year Intelligence
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-900 border border-teal-200 text-[10px] font-bold uppercase">
                  For Both Retirees &amp; Digital Nomads
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Simulates your exact corpus survival year from <strong>{currentYear} to {currentYear + 50}</strong> using your Current Net FIRE Corpus (<strong>{formatDualCurrency(fireAnalysis.startingCorpusTodayUSD, countryMacro, true)}</strong>), {expectedReturnPct}% portfolio return, {inflationPct}% annual inflation, active loan EMIs, and one-time future family milestones.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleSwitchCostBasis(costBasisMode === 'residing' ? 'target-haven' : 'residing')}
              className="px-3 py-1.5 rounded-xl bg-white border border-teal-300 hover:bg-teal-50 text-teal-950 text-[11px] font-bold cursor-pointer transition-colors"
            >
              {costBasisMode === 'residing'
                ? `🌍 Test Geo-Arbitrage in ${targetHavenCountryName} ($${defaultTargetHavenMonthlyExpenseUSD.toLocaleString()}/mo)`
                : `🏠 Switch Back to ${selectedBasisCountry} Cost Basis`}
            </button>
            <button
              type="button"
              onClick={() => setShowSurvivalTimelineTable(!showSurvivalTimelineTable)}
              className="px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-950 text-[11px] font-bold cursor-pointer transition-colors"
            >
              {showSurvivalTimelineTable ? 'Hide Year-by-Year Survival Table ▲' : 'View Year-by-Year Survival Table ▼'}
            </button>
          </div>
        </div>

        {/* 4 Survival & Runway Intelligence Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Card A: Pure Zero-Work Runway (Stop Working Today) */}
          <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-2.5">
            <div>
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-900">
                  A. Without Working (0 Active Income)
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  fireAnalysis.zeroWorkSim.isPerpetual
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-indigo-100 text-indigo-800'
                }`}>
                  {fireAnalysis.zeroWorkSim.isPerpetual ? 'Perpetual' : 'Zero-Work Runway'}
                </span>
              </div>

              <div className="text-xl font-extrabold font-mono text-slate-900 mt-1.5">
                {fireAnalysis.zeroWorkSim.isPerpetual
                  ? '50+ Years (Never Depletes)'
                  : `${fireAnalysis.zeroWorkSim.wholeYears} Yrs, ${fireAnalysis.zeroWorkSim.remMonths} Mos`}
              </div>

              <div className="mt-1 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200/80 text-indigo-950 font-mono text-xs font-extrabold">
                <Calendar className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>
                  {fireAnalysis.zeroWorkSim.isPerpetual
                    ? `Survives Beyond Year ${currentYear + 50}+ (Age ${currentAge + 50}+)`
                    : `Lasts Until Year ${fireAnalysis.zeroWorkSim.survivalYear} (Age ${fireAnalysis.zeroWorkSim.survivalAge})`}
                </span>
              </div>

              <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">
                If you stop all active work today and live solely off your <strong>{formatDualCurrency(fireAnalysis.startingCorpusTodayUSD, countryMacro, true)}</strong> corpus + <strong>{formatDualCurrency(fireAnalysis.retirementContinuingPassiveMonthlyUSD, countryMacro, false)}/mo</strong> passive income.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 text-[10px] font-mono text-slate-500 flex items-center justify-between">
              <span>Net Yr-1 Drawdown:</span>
              <span className="font-bold text-slate-800">
                {formatDualCurrency(fireAnalysis.netMonthlyPortfolioNeedTodayUSD + fireAnalysis.totalMonthlyEmiUSD, countryMacro, false)}/mo
              </span>
            </div>
          </div>

          {/* Card B: Survival Year WITH Expected Digital Nomad / Remote Income */}
          <div className="p-4 rounded-xl bg-white border-2 border-teal-400/70 shadow-2xs flex flex-col justify-between space-y-2.5">
            <div>
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-900">
                  B. With Expected Nomad Income
                </span>
                <span className="px-2 py-0.5 rounded bg-teal-100 text-teal-900 text-[10px] font-bold">
                  +${expectedNomadMonthlyIncomeUSD.toLocaleString()}/mo ({nomadIncomeActiveYears}y)
                </span>
              </div>

              <div className="text-xl font-extrabold font-mono text-teal-900 mt-1.5">
                {fireAnalysis.withNomadSim.isPerpetual
                  ? '50+ Years (Perpetual)'
                  : `${fireAnalysis.withNomadSim.wholeYears} Yrs, ${fireAnalysis.withNomadSim.remMonths} Mos`}
              </div>

              <div className="mt-1 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-200 text-teal-950 font-mono text-xs font-extrabold">
                <Calendar className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span>
                  {fireAnalysis.withNomadSim.isPerpetual
                    ? `Survives Forever · Year ${currentYear + 50}+ (Age ${currentAge + 50}+)`
                    : `Lasts Until Year ${fireAnalysis.withNomadSim.survivalYear} (Age ${fireAnalysis.withNomadSim.survivalAge})`}
                </span>
              </div>

              <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">
                Earning <strong>{formatDualCurrency(expectedNomadMonthlyIncomeUSD, countryMacro, false)}/mo</strong> from remote/digital nomad work for <strong>{nomadIncomeActiveYears} years</strong>{' '}
                {fireAnalysis.withNomadSim.isPerpetual && !fireAnalysis.zeroWorkSim.isPerpetual
                  ? 'turns your corpus into a perpetual self-sustaining engine!'
                  : fireAnalysis.withNomadSim.exactRunwayYears > fireAnalysis.zeroWorkSim.exactRunwayYears
                  ? `extends your money survival by +${Math.round((fireAnalysis.withNomadSim.exactRunwayYears - fireAnalysis.zeroWorkSim.exactRunwayYears) * 10) / 10} years!`
                  : 'keeps your corpus compounding safely across decades.'}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 text-[10px] font-mono text-teal-900 flex items-center justify-between">
              <span>Yr-1 Net Nomad Cash Flow:</span>
              <span className="font-bold">
                {expectedNomadMonthlyIncomeUSD >= fireAnalysis.netMonthlyPortfolioNeedTodayUSD + fireAnalysis.totalMonthlyEmiUSD
                  ? `+${formatDualCurrency(expectedNomadMonthlyIncomeUSD - (fireAnalysis.netMonthlyPortfolioNeedTodayUSD + fireAnalysis.totalMonthlyEmiUSD), countryMacro, false)}/mo surplus`
                  : `Covers ${Math.min(100, Math.round((expectedNomadMonthlyIncomeUSD / Math.max(1, fireAnalysis.netMonthlyPortfolioNeedTodayUSD + fireAnalysis.totalMonthlyEmiUSD)) * 100))}% of need`}
              </span>
            </div>
          </div>

          {/* Card C: Planned Work-Free Sabbatical / Career Break Stress Test */}
          <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-2.5">
            <div>
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-900">
                  C. Take {plannedSabbaticalYears}-Yr Work-Free Break Now
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  fireAnalysis.sabbaticalThenNomadSim.balanceAfterSabbaticalUSD > 0
                    ? 'bg-purple-100 text-purple-900'
                    : 'bg-rose-100 text-rose-800'
                }`}>
                  {fireAnalysis.sabbaticalThenNomadSim.balanceAfterSabbaticalUSD > 0 ? 'Sabbatical Safe' : 'Depletes Early'}
                </span>
              </div>

              <div className="text-xl font-extrabold font-mono text-purple-950 mt-1.5">
                {formatDualCurrency(fireAnalysis.sabbaticalThenNomadSim.balanceAfterSabbaticalUSD, countryMacro, true)}
              </div>

              <div className="mt-1 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 border border-purple-200 text-purple-950 font-mono text-xs font-extrabold">
                <span>
                  Corpus Left in Year {currentYear + plannedSabbaticalYears} ·{' '}
                  {fireAnalysis.sabbaticalThenNomadSim.isPerpetual
                    ? 'Then Perpetual'
                    : `Lasts Until ${fireAnalysis.sabbaticalThenNomadSim.survivalYear}`}
                </span>
              </div>

              <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">
                If you take <strong>{plannedSabbaticalYears} {plannedSabbaticalYears === 1 ? 'year' : 'years'} completely off work ($0 income)</strong> from {currentYear}–{currentYear + plannedSabbaticalYears}, and then earn remote income for {nomadIncomeActiveYears} yrs.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 text-[10px] font-mono text-slate-500 flex items-center justify-between">
              <span>Post-Break Survival:</span>
              <span className="font-bold text-purple-900">
                {fireAnalysis.sabbaticalThenNomadSim.isPerpetual
                  ? `Year ${currentYear + 50}+ (Age ${currentAge + 50}+)`
                  : `Year ${fireAnalysis.sabbaticalThenNomadSim.survivalYear} (Age ${fireAnalysis.sabbaticalThenNomadSim.survivalAge})`}
              </span>
            </div>
          </div>

          {/* Card D: Perpetual Nomad Bridge & Target Haven Geo-Arbitrage */}
          <div className="p-4 rounded-xl bg-white border border-amber-200/90 shadow-2xs flex flex-col justify-between space-y-2.5">
            <div>
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-950">
                  D. Perpetual Survival Threshold
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-bold">
                  Never Run Out
                </span>
              </div>

              <div className="text-xl font-extrabold font-mono text-amber-950 mt-1.5">
                {fireAnalysis.zeroWorkSim.isPerpetual
                  ? '$0 / mo Needed!'
                  : `${formatDualCurrency(fireAnalysis.minMonthlyNomadIncomeForPerpetualUSD, countryMacro, false)}/mo`}
              </div>

              <div className="mt-1 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-950 font-mono text-xs font-extrabold">
                <span>
                  {fireAnalysis.zeroWorkSim.isPerpetual
                    ? 'Already Self-Sustaining on Zero Work!'
                    : `Min. Nomad Income for ${nomadIncomeActiveYears}y → Perpetual`}
                </span>
              </div>

              <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">
                {fireAnalysis.zeroWorkSim.isPerpetual
                  ? `Your corpus already compounds faster than your ${costBasisMode === 'residing' ? selectedBasisCountry : targetHavenCountryName} withdrawals — you never have to work again.`
                  : `Earning just ${formatDualCurrency(fireAnalysis.minMonthlyNomadIncomeForPerpetualUSD, countryMacro, false)}/mo remotely for ${nomadIncomeActiveYears} yrs makes your money last forever (2076+).`}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 text-[10px] font-mono text-slate-600 flex items-center justify-between">
              <span>In {targetHavenCountryName} (0 Work):</span>
              <span className="font-bold text-emerald-800">
                {fireAnalysis.targetHavenZeroWorkSim.isPerpetual
                  ? 'Lasts Forever (2076+)'
                  : `Until ${fireAnalysis.targetHavenZeroWorkSim.survivalYear} (${fireAnalysis.targetHavenZeroWorkSim.exactRunwayYears}y)`}
              </span>
            </div>
          </div>
        </div>

        {/* Interactive Digital Nomad & Work-Free Runway Controls */}
        <div className="p-4 rounded-xl bg-white/95 border border-slate-200/90 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Control 1: Expected Monthly Digital Nomad / Remote Income */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800">
                1. Expected Digital Nomad / Remote Income (Monthly)
              </label>
              <span className="text-[10px] font-mono font-bold text-teal-800">
                {formatDualCurrency(expectedNomadMonthlyIncomeUSD, countryMacro, false)}/mo
              </span>
            </div>
            <CurrencyAmountInput
              usdValue={expectedNomadMonthlyIncomeUSD}
              onChangeUsd={val => setExpectedNomadMonthlyIncomeUSD(val)}
              currencyMode={inputCurrencyMode}
              countryMacro={countryMacro}
              inputSize="sm"
            />
            <div className="flex flex-wrap items-center gap-1 pt-0.5">
              {[
                { label: '$0 (Pure Retiree)', val: 0 },
                { label: '$1,200/mo', val: 1200 },
                { label: '$2,200/mo', val: 2200 },
                { label: '$3,500/mo', val: 3500 },
                ...(fireAnalysis.minMonthlyNomadIncomeForPerpetualUSD > 0
                  ? [
                      {
                        label: `Perpetual ($${fireAnalysis.minMonthlyNomadIncomeForPerpetualUSD.toLocaleString()})`,
                        val: fireAnalysis.minMonthlyNomadIncomeForPerpetualUSD,
                      },
                    ]
                  : []),
              ].map(preset => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setExpectedNomadMonthlyIncomeUSD(preset.val);
                    persistFireUpdates(
                      { expectedNomadMonthlyIncomeUSD: preset.val },
                      `Updated Expected Digital Nomad Income to $${preset.val.toLocaleString()}/mo.`
                    );
                  }}
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold cursor-pointer transition-colors ${
                    expectedNomadMonthlyIncomeUSD === preset.val
                      ? 'bg-teal-600 text-white font-bold'
                      : 'bg-slate-100 hover:bg-teal-50 text-slate-700 border border-slate-200'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Control 2: How Many Years You Expect to Earn Nomad / Remote Income */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800">
                2. Active Nomad / Slow-Work Horizon
              </label>
              <span className="px-2 py-0.5 rounded bg-teal-50 border border-teal-200 font-mono font-bold text-teal-900 text-[11px]">
                {nomadIncomeActiveYears} {nomadIncomeActiveYears === 1 ? 'Year' : 'Years'} (Until {currentYear + nomadIncomeActiveYears})
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={30}
              step={1}
              value={nomadIncomeActiveYears}
              onChange={e => setNomadIncomeActiveYears(parseInt(e.target.value, 10) || 0)}
              className="w-full accent-teal-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0 Yrs (No Work)</span>
              <span>10 Yrs (Age {currentAge + 10})</span>
              <span>30 Yrs</span>
            </div>
          </div>

          {/* Control 3: Planned Immediate Work-Free Sabbatical / Career Break */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800">
                3. Planned Work-Free Break Starting Today
              </label>
              <span className="px-2 py-0.5 rounded bg-purple-50 border border-purple-200 font-mono font-bold text-purple-900 text-[11px]">
                {plannedSabbaticalYears} {plannedSabbaticalYears === 1 ? 'Year' : 'Years'} Off ({currentYear}–{currentYear + plannedSabbaticalYears})
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={15}
              step={1}
              value={plannedSabbaticalYears}
              onChange={e => setPlannedSabbaticalYears(parseInt(e.target.value, 10) || 1)}
              className="w-full accent-purple-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>1 Yr Break</span>
              <span>5 Yrs Mini-Retire</span>
              <span>15 Yrs</span>
            </div>
          </div>
        </div>

        {/* Optional Expandable Year-by-Year Money Survival & Depletion Ledger Table */}
        {showSurvivalTimelineTable && (
          <div className="p-4 rounded-xl bg-white border border-slate-200 overflow-x-auto space-y-2 animate-in fade-in">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                Year-by-Year Corpus Survival &amp; Depletion Schedule ({currentYear} – {currentYear + 50})
              </h4>
              <span className="text-[11px] text-slate-500">
                Compares <strong>Zero Active Work</strong> vs. <strong>With ${expectedNomadMonthlyIncomeUSD.toLocaleString()}/mo Nomad Income ({nomadIncomeActiveYears} yrs)</strong> vs. <strong>{plannedSabbaticalYears}-Yr Sabbatical First</strong>
              </span>
            </div>

            <table className="w-full text-left border-collapse text-[11px]">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                  <th className="py-2 pr-3">Calendar Year (Age)</th>
                  <th className="py-2 px-3">Inflated Living + EMIs / yr</th>
                  <th className="py-2 px-3">Future Goals in Year</th>
                  <th className="py-2 px-3 text-indigo-900">A. Corpus Without Working</th>
                  <th className="py-2 px-3 text-teal-900">B. Corpus With Nomad Income</th>
                  <th className="py-2 pl-3 text-purple-900">C. After {plannedSabbaticalYears}-Yr Break</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {fireAnalysis.survivalTimeline.map(row => (
                  <tr key={row.calendarYear} className="hover:bg-slate-50/80">
                    <td className="py-2 pr-3 font-bold text-slate-900">
                      {row.calendarYear} <span className="text-slate-500 font-normal">(Age {row.age})</span>
                    </td>
                    <td className="py-2 px-3 text-rose-700">
                      {formatDualCurrency(row.annualLivingAndEmiUSD, countryMacro, true)}
                    </td>
                    <td className="py-2 px-3 text-purple-700">
                      {row.milestonesOutflowUSD > 0
                        ? formatDualCurrency(row.milestonesOutflowUSD, countryMacro, true)
                        : '—'}
                    </td>
                    <td className={`py-2 px-3 font-bold ${row.endCorpusUSD > 0 ? 'text-indigo-900' : 'text-rose-600'}`}>
                      {row.endCorpusUSD > 0
                        ? formatDualCurrency(row.endCorpusUSD, countryMacro, true)
                        : '$0 (Depleted)'}
                    </td>
                    <td className={`py-2 px-3 font-bold ${row.withNomadEndCorpusUSD > 0 ? 'text-teal-800' : 'text-rose-600'}`}>
                      {row.withNomadEndCorpusUSD > 0
                        ? formatDualCurrency(row.withNomadEndCorpusUSD, countryMacro, true)
                        : '$0 (Depleted)'}
                    </td>
                    <td className={`py-2 pl-3 font-bold ${row.afterSabbaticalEndCorpusUSD > 0 ? 'text-purple-900' : 'text-rose-600'}`}>
                      {row.afterSabbaticalEndCorpusUSD > 0
                        ? formatDualCurrency(row.afterSabbaticalEndCorpusUSD, countryMacro, true)
                        : '$0 (Depleted)'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* TRANSPARENT STEP-BY-STEP FORMULA & ASSET BREAKDOWN AUDIT PANEL        */}
      {/* ===================================================================== */}
      <div className="rounded-2xl border border-indigo-200/90 bg-white/95 shadow-xs overflow-hidden">
        <div className="px-4 py-3 bg-gradient-to-r from-indigo-50/90 via-slate-50 to-teal-50/80 border-b border-indigo-100 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-mono font-bold text-xs flex items-center justify-center">
              ∑
            </span>
            <div>
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                How Your FIRE Numbers Are Calculated — Live Asset &amp; Formula Audit
              </h3>
              <p className="text-[11px] text-slate-600">
                Exact mathematical breakdown of your <strong>Current Net FIRE Corpus ({formatDualCurrency(fireAnalysis.startingCorpusTodayUSD, countryMacro, true)})</strong>, <strong>{fireAnalysis.uncappedFireProgressPct}% Funded Ratio</strong>, and <strong>Target FIRE Corpus ({formatDualCurrency(fireAnalysis.comprehensiveFireNumberTodayUSD, countryMacro, true)})</strong>.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowFormulaAudit(!showFormulaAudit)}
            className="px-3 py-1 rounded-lg bg-white border border-indigo-200 text-indigo-900 hover:bg-indigo-50 text-[11px] font-bold cursor-pointer transition-colors"
          >
            {showFormulaAudit ? 'Hide Formula Breakdown ▲' : 'Show How Numbers Are Calculated ▼'}
          </button>
        </div>

        {showFormulaAudit && (
          <div className="p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs animate-in fade-in">
            
            {/* Column 1: How "1. Current Net FIRE Corpus" is Reached */}
            <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/90 space-y-2.5 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2 gap-1">
                  <span className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px]">
                    Step 1: Current Net FIRE Corpus
                  </span>
                  <span className="px-2 py-0.5 rounded bg-teal-100 text-teal-900 font-mono font-bold text-[10px]">
                    {includeGold ? '3 Schemes + Gold' : '3 Schemes (No Gold)'}
                    {includePrimaryHome ? ' + Home' : ''} − Debt
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Your <strong>Current Net FIRE Corpus</strong> starts with your <strong>3 Core Financial Schemes</strong> (Cash, Stocks/MFs, Other). Because <strong>Family / Women&apos;s Gold</strong> is often kept as heirloom wealth and <strong>Primary Home Equity</strong> is lived in rather than sold, you can freely include or exclude both below:
                </p>

                <div className="space-y-1.5 font-mono text-[11px] bg-white p-3 rounded-xl border border-slate-200/80">
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="font-sans">1. Savings &amp; Cash:</span>
                    <span className="font-bold">+{formatDualCurrency(fireAnalysis.savings, countryMacro, true)}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="font-sans">2. Stocks &amp; Mutual Funds:</span>
                    <span className="font-bold">+{formatDualCurrency(fireAnalysis.stocks, countryMacro, true)}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="font-sans">3. Other Investments:</span>
                    <span className="font-bold">+{formatDualCurrency(fireAnalysis.others, countryMacro, true)}</span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-dashed border-slate-200 text-slate-800 font-bold">
                    <span className="font-sans">= Core Financial Liquid (1+2+3):</span>
                    <span>{formatDualCurrency(fireAnalysis.coreFinancialLiquidAssets, countryMacro, true)}</span>
                  </div>

                  <div className={`flex items-center justify-between pt-1 border-t border-dashed border-slate-200 gap-1 ${includeGold ? 'text-amber-800 font-bold' : 'text-slate-400'}`}>
                    <span className="font-sans flex items-center gap-1.5">
                      <span>4. Gold ({includeGold ? 'Included' : 'Excluded'}):</span>
                      <button
                        type="button"
                        onClick={() => {
                          const nextGold = !includeGold;
                          setIncludeGold(nextGold);
                          persistFireUpdates(
                            { includeGoldInFire: nextGold },
                            nextGold
                              ? `Included Gold & Bullion (+$${fireAnalysis.gold.toLocaleString()}) in FIRE Corpus!`
                              : `Excluded Gold & Bullion ($${fireAnalysis.gold.toLocaleString()}) from FIRE Corpus.`
                          );
                        }}
                        className="px-1.5 py-0.5 rounded bg-amber-100 hover:bg-amber-200 text-amber-900 font-sans font-bold text-[9px] cursor-pointer"
                      >
                        {includeGold ? 'Exclude' : '+ Include'}
                      </button>
                    </span>
                    <span>
                      {includeGold
                        ? `+${formatDualCurrency(fireAnalysis.gold, countryMacro, true)}`
                        : `$0 (of ${formatDualCurrency(fireAnalysis.gold, countryMacro, true)})`}
                    </span>
                  </div>

                  <div className={`flex items-center justify-between pt-1 border-t border-dashed border-slate-200 gap-1 ${includePrimaryHome ? 'text-indigo-800 font-bold' : 'text-slate-400'}`}>
                    <span className="font-sans flex items-center gap-1.5">
                      <span>5. Real Estate ({includePrimaryHome ? 'Included' : 'Excluded'}):</span>
                      <button
                        type="button"
                        onClick={() => {
                          const nextHome = !includePrimaryHome;
                          setIncludePrimaryHome(nextHome);
                          persistFireUpdates(
                            { includePrimaryHomeInFire: nextHome },
                            nextHome
                              ? `Included Real Estate Equity (+$${fireAnalysis.realEstate.toLocaleString()}) in FIRE Corpus!`
                              : `Excluded Real Estate Equity ($${fireAnalysis.realEstate.toLocaleString()}) from FIRE Corpus.`
                          );
                        }}
                        className="px-1.5 py-0.5 rounded bg-indigo-100 hover:bg-indigo-200 text-indigo-900 font-sans font-bold text-[9px] cursor-pointer"
                      >
                        {includePrimaryHome ? 'Exclude' : '+ Include'}
                      </button>
                    </span>
                    <span>
                      {includePrimaryHome
                        ? `+${formatDualCurrency(fireAnalysis.realEstate, countryMacro, true)}`
                        : `$0 (of ${formatDualCurrency(fireAnalysis.realEstate, countryMacro, true)})`}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-rose-700 pt-1 border-t border-dashed border-slate-200">
                    <span className="font-sans">6. Less Loan Principal (Debt):</span>
                    <span className="font-bold">−{formatDualCurrency(fireAnalysis.totalLoanPrincipalUSD, countryMacro, true)}</span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t-2 border-slate-300 text-slate-950 font-extrabold text-xs">
                    <span className="font-sans">= 1. Current Net FIRE Corpus:</span>
                    <span>{formatDualCurrency(fireAnalysis.startingCorpusTodayUSD, countryMacro, true)}</span>
                  </div>
                </div>
              </div>

              <div className="pt-1 flex items-center justify-between gap-2 text-[11px]">
                <span className="text-slate-500">
                  Gross All 5 Assets: <strong>{formatDualCurrency(fireAnalysis.totalGrossAssets, countryMacro, true)}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setShowAssetsEditorInFire(true)}
                  className="text-indigo-700 font-bold hover:underline cursor-pointer"
                >
                  Edit 5 Asset Values ↓
                </button>
              </div>
            </div>

            {/* Column 2: How "2. Target FIRE Corpus" & "% Funded" Are Reached */}
            <div className="p-4 rounded-xl bg-orange-50/40 border border-orange-200/80 space-y-2.5 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b border-orange-200/70 pb-2">
                  <span className="font-extrabold text-orange-950 uppercase tracking-wider text-[11px]">
                    Step 2: Target FIRE Corpus &amp; % Funded
                  </span>
                  <span className="px-2 py-0.5 rounded bg-orange-100 text-orange-900 font-mono font-bold text-[10px]">
                    {swrPct.toFixed(1)}% SWR = {Math.round((100 / Math.max(1, swrPct)) * 10) / 10}x Annual Need
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 leading-relaxed">
                  At a <strong>{swrPct.toFixed(1)}% Safe Withdrawal Rate</strong>, you need <strong>{Math.round((100 / Math.max(1, swrPct)) * 10) / 10}×</strong> your net annual retirement expenses, plus the present value of one-time family/life milestones.
                </p>

                <div className="space-y-1.5 font-mono text-[11px] bg-white p-3 rounded-xl border border-orange-200/70">
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="font-sans">Base Retire Expense ({fireTier.toUpperCase()} {Math.round(fireAnalysis.tierMultiplier * 100)}%):</span>
                    <span className="font-bold">{formatDualCurrency(fireAnalysis.effectiveMonthlyExpenseTodayUSD, countryMacro, false)}/mo</span>
                  </div>
                  <div className="flex items-center justify-between text-emerald-700">
                    <span className="font-sans">Less Continuing Passive Income:</span>
                    <span className="font-bold">−{formatDualCurrency(fireAnalysis.retirementContinuingPassiveMonthlyUSD, countryMacro, false)}/mo</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-dashed border-slate-200 text-slate-900 font-bold">
                    <span className="font-sans">= Net Monthly Portfolio Drawdown:</span>
                    <span>{formatDualCurrency(fireAnalysis.netMonthlyPortfolioNeedTodayUSD, countryMacro, false)}/mo</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="font-sans">× 12 Months (Annual Portfolio Need):</span>
                    <span className="font-bold">{formatDualCurrency(fireAnalysis.netMonthlyPortfolioNeedTodayUSD * 12, countryMacro, true)}/yr</span>
                  </div>
                  <div className="flex items-center justify-between text-orange-900 font-bold">
                    <span className="font-sans">÷ {swrPct.toFixed(1)}% SWR (Living FIRE Corpus):</span>
                    <span>{formatDualCurrency(fireAnalysis.activeFireTargetTodayUSD, countryMacro, true)}</span>
                  </div>
                  <div className="flex items-center justify-between text-purple-800">
                    <span className="font-sans">+ Future Milestones ({fireAnalysis.enrichedGoals.length} Goals Today):</span>
                    <span className="font-bold">+{formatDualCurrency(fireAnalysis.totalFutureGoalsTodayUSD, countryMacro, true)}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t-2 border-orange-300 text-orange-950 font-extrabold text-xs">
                    <span className="font-sans">= 2. Target {fireTier.toUpperCase()} FIRE Corpus:</span>
                    <span>{formatDualCurrency(fireAnalysis.comprehensiveFireNumberTodayUSD, countryMacro, true)}</span>
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-teal-50/90 border border-teal-200 text-[11px] flex items-center justify-between">
                <span className="text-teal-950 font-semibold">
                  <strong>% Funded Formula:</strong> Corpus ÷ Target
                </span>
                <span className="font-mono font-extrabold text-teal-900">
                  ${fireAnalysis.startingCorpusTodayUSD.toLocaleString()} ÷ ${fireAnalysis.comprehensiveFireNumberTodayUSD.toLocaleString()} = {fireAnalysis.uncappedFireProgressPct}%
                </span>
              </div>
            </div>

            {/* Column 3: How "Coast FIRE", "Surplus/Gap" & "Time to FIRE" Are Reached */}
            <div className="p-4 rounded-xl bg-purple-50/40 border border-purple-200/80 space-y-2.5 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b border-purple-200/70 pb-2">
                  <span className="font-extrabold text-purple-950 uppercase tracking-wider text-[11px]">
                    Step 3: Surplus/Gap, Coast FIRE &amp; Years
                  </span>
                  <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-900 font-mono font-bold text-[10px]">
                    {fireAnalysis.yearsToTargetAge} Yrs to Age {targetFireAge}
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 leading-relaxed">
                  <strong>Surplus / Gap</strong> compares your current net corpus against today&apos;s target. <strong>Coast FIRE</strong> is the amount needed today so real returns ({expectedReturnPct}% return − {inflationPct}% inflation = <strong>{fireAnalysis.realReturnPct}%/yr</strong>) reach your target by age {targetFireAge} with $0 new SIP.
                </p>

                <div className="space-y-1.5 font-mono text-[11px] bg-white p-3 rounded-xl border border-purple-200/70">
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="font-sans">Current Net FIRE Corpus (Card 1):</span>
                    <span className="font-bold">{formatDualCurrency(fireAnalysis.startingCorpusTodayUSD, countryMacro, true)}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="font-sans">Less Target FIRE Corpus (Card 2):</span>
                    <span className="font-bold">−{formatDualCurrency(fireAnalysis.comprehensiveFireNumberTodayUSD, countryMacro, true)}</span>
                  </div>
                  <div className={`flex items-center justify-between pt-1 border-t border-dashed border-slate-200 font-extrabold ${gapOrSurplusUSD >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                    <span className="font-sans">= Current Net {gapOrSurplusUSD >= 0 ? 'Surplus' : 'Gap'} Today:</span>
                    <span>
                      {gapOrSurplusUSD >= 0 ? '+' : '−'}
                      {formatDualCurrency(Math.abs(gapOrSurplusUSD), countryMacro, true)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1.5 border-t border-dashed border-slate-200 text-indigo-900 font-bold">
                    <span className="font-sans">Coast FIRE Target (at {fireAnalysis.realReturnPct}% real/yr):</span>
                    <span>{formatDualCurrency(fireAnalysis.coastFireTargetTodayUSD, countryMacro, true)}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-700">
                    <span className="font-sans">Annual Trajectory Formula:</span>
                    <span className="font-bold text-[10px]">Corpus×(1+{expectedReturnPct}%)+SIP−Goals</span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t-2 border-purple-300 text-purple-950 font-extrabold text-xs">
                    <span className="font-sans">= 4. Time to Full FIRE Crossover:</span>
                    <span>
                      {fireAnalysis.yearsToFireExact === 0
                        ? '0 Yrs (Already Achieved! 🎉)'
                        : `${fireAnalysis.yearsToFireExact} Yrs (Age ${fireAnalysis.crossoverAge || currentAge + 25})`}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-indigo-50/90 border border-indigo-200 text-[11px] text-indigo-950">
                {gapOrSurplusUSD >= 0 ? (
                  <span>
                    ✅ <strong>Why it says FIRE Achieved:</strong> Your liquid corpus ({formatDualCurrency(fireAnalysis.startingCorpusTodayUSD, countryMacro, true)}) already exceeds your {fireTier.toUpperCase()} FIRE target ({formatDualCurrency(fireAnalysis.comprehensiveFireNumberTodayUSD, countryMacro, true)}) by <strong>{formatDualCurrency(gapOrSurplusUSD, countryMacro, true)}</strong>!
                  </span>
                ) : (
                  <span>
                    📈 <strong>Compounding Bridge:</strong> Your current corpus ({formatDualCurrency(fireAnalysis.startingCorpusTodayUSD, countryMacro, true)}) + {formatDualCurrency(monthlySipUSD, countryMacro, false)}/mo SIP bridges the {formatDualCurrency(Math.abs(gapOrSurplusUSD), countryMacro, true)} gap in <strong>{fireAnalysis.yearsToFireExact} years</strong>.
                  </span>
                )}
              </div>
            </div>

          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* PART 1: INTERACTIVE FIRE CALCULATOR & CASH-FLOW CONTROLS (FIRST)      */}
      {/* ===================================================================== */}

      {/* CURRENT MONTHLY CASH FLOW & EXPENSE LEDGER BAR */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-orange-50/70 via-amber-50/40 to-purple-50/50 border border-orange-200/80 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-orange-600" />
            <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
              Current Monthly Income, Monthly Current Expenses &amp; SIP Cash-Flow Ledger
            </span>
          </div>
          <span className="text-[11px] text-slate-600">
            Emergency Buffer: <strong className="font-mono text-teal-800">{fireAnalysis.emergencyMonths} months</strong> of Current Expenses + Loan EMIs covered by Savings
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-white border border-slate-200/90 flex flex-col justify-between shadow-2xs">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                1. Total Monthly Inflow
              </span>
              <div className="font-mono font-extrabold text-slate-900 text-sm mt-1">
                {formatDualCurrency(fireAnalysis.totalMonthlyInflow, countryMacro, false)}
              </div>
              <div className="text-[10px] text-slate-600 mt-1 space-y-0.5 leading-snug">
                <div className="flex items-center justify-between gap-1">
                  <span>Salary:</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {formatLocalCurrency(fireAnalysis.monthlySalary, countryMacro, false)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-1">
                  <span>Side Income:</span>
                  <span className="font-mono font-semibold text-emerald-700">
                    {formatLocalCurrency(fireAnalysis.activeSideMonthlyUSD, countryMacro, false)} (${fireAnalysis.activeSideMonthlyUSD.toLocaleString()})
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 mt-2 pt-1.5 border-t border-slate-100">
              {fireAnalysis.monthlySalary > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setMonthlySalaryUSD(0);
                    persistFireUpdates(
                      { monthlySalaryUSD: 0, currentSalaryUSD: 0 },
                      'Set Current Monthly Salary to $0/mo (Zero active salary inflow)!'
                    );
                  }}
                  className="text-[10px] font-bold text-slate-600 hover:text-rose-700 hover:underline cursor-pointer"
                  title="Zero out monthly salary if you have stopped working"
                >
                  Set Salary 0
                </button>
              )}
              {fireAnalysis.activeSideMonthlyUSD > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveLedgerTab('side-income');
                  }}
                  className="text-[10px] font-bold text-emerald-700 hover:underline cursor-pointer"
                  title="View or edit your side & passive income streams"
                >
                  Edit Side ({finances.sideIncomes?.length || 0}) →
                </button>
              )}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white border-2 border-rose-300/80 shadow-2xs flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 block">
                2. Monthly Current Expenses
              </span>
              <div className="font-mono font-extrabold text-rose-700 text-sm mt-1">
                {formatDualCurrency(fireAnalysis.currentExpensesMo, countryMacro, false)}
              </div>
            </div>
            <span className="text-[10px] text-rose-700/80 block mt-2 pt-1.5 border-t border-rose-100">
              Household &amp; living ({Math.round((fireAnalysis.currentExpensesMo / Math.max(1, fireAnalysis.totalMonthlyInflow)) * 100)}% of inflow)
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                3. Monthly Loan EMIs
              </span>
              <div className="font-mono font-extrabold text-amber-800 text-sm mt-1">
                {formatDualCurrency(fireAnalysis.totalMonthlyEmiUSD, countryMacro, false)}
              </div>
            </div>
            <span className="text-[10px] text-slate-500 block mt-2 pt-1.5 border-t border-slate-100">
              Across {finances.loans?.length || 0} active loan(s)
            </span>
          </div>

          <div className={`p-3 rounded-xl bg-white border shadow-2xs flex flex-col justify-between ${
            fireAnalysis.isSipStopped ? 'border-amber-300 bg-amber-50/30' : 'border-emerald-200'
          }`}>
            <div>
              <span className={`text-[10px] font-bold uppercase tracking-wider block ${
                fireAnalysis.isSipStopped ? 'text-amber-900' : 'text-emerald-800'
              }`}>
                4. Monthly SIP Invested
              </span>
              <div className={`font-mono font-extrabold text-sm mt-1 ${
                fireAnalysis.isSipStopped ? 'text-amber-800' : 'text-emerald-700'
              }`}>
                {formatDualCurrency(fireAnalysis.effectiveMonthlySipUSD, countryMacro, false)}
              </div>
              <span className={`text-[10px] block mt-1 ${
                fireAnalysis.isSipStopped ? 'text-amber-800/90 font-medium' : 'text-emerald-700/80'
              }`}>
                {fireAnalysis.isSipStopped
                  ? 'SIP Stopped ($0/mo · Coast Mode)'
                  : `${fireAnalysis.savingsRatePct}% of monthly inflow`}
              </span>
            </div>
            <div className="mt-2 pt-1.5 border-t border-slate-100">
              {fireAnalysis.isSipStopped ? (
                <button
                  type="button"
                  onClick={() => handleResumeSip()}
                  className="text-[10px] font-bold text-emerald-700 hover:underline cursor-pointer"
                >
                  + Resume Monthly SIP →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStopSipRightAway}
                  className="text-[10px] font-bold text-rose-700 hover:underline cursor-pointer"
                >
                  ✕ Stop SIP Right Away ($0)
                </button>
              )}
            </div>
          </div>

          <div className={`p-3 rounded-xl border shadow-2xs flex flex-col justify-between ${fireAnalysis.unallocatedMonthlySurplusUSD >= 0 ? 'bg-white border-teal-200' : 'bg-rose-50/60 border-rose-300'}`}>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
                5. Unallocated Cash Flow
              </span>
              <div className={`font-mono font-extrabold text-sm mt-1 ${fireAnalysis.unallocatedMonthlySurplusUSD >= 0 ? 'text-teal-800' : 'text-rose-700'}`}>
                {fireAnalysis.unallocatedMonthlySurplusUSD >= 0 ? '+' : ''}
                {formatDualCurrency(fireAnalysis.unallocatedMonthlySurplusUSD, countryMacro, false)}
              </div>
            </div>
            <div className="mt-2 pt-1.5 border-t border-slate-100">
              {fireAnalysis.unallocatedMonthlySurplusUSD >= 100 && !fireAnalysis.isSipStopped ? (
                <button
                  type="button"
                  onClick={() => {
                    const nextSip = fireAnalysis.effectiveMonthlySipUSD + fireAnalysis.unallocatedMonthlySurplusUSD;
                    setMonthlySipUSD(nextSip);
                    setLastActiveSipUSD(nextSip);
                    setSipContinuityMode('until-fire');
                    persistFireUpdates(
                      { monthlySipUSD: nextSip, sipContinuityMode: 'until-fire' },
                      `Added unallocated surplus (+$${fireAnalysis.unallocatedMonthlySurplusUSD.toLocaleString()}/mo) to Monthly SIP!`
                    );
                  }}
                  className="text-[10px] font-bold text-orange-700 hover:underline text-left cursor-pointer"
                >
                  + Roll Surplus into SIP →
                </button>
              ) : (
                <span className="text-[10px] text-slate-500 block">
                  {fireAnalysis.isSipStopped
                    ? 'Retained in cash (SIP stopped)'
                    : fireAnalysis.unallocatedMonthlySurplusUSD >= 0
                    ? 'Fully allocated'
                    : 'Exceeds monthly inflow'}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* VARIABLE MACRO & PERSONAL SIMULATION CONTROLS */}
      <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/90 space-y-5 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/80">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-orange-600" />
            <span className="font-bold text-slate-900 uppercase tracking-wider">
              Interactive FIRE Calculator: Country, Monthly Expenses, Inflation, Return &amp; SIP Controls
            </span>
          </div>

          {/* Cost of Living Basis Switcher: Residing Country vs Target Haven */}
          <div className="inline-flex rounded-xl border border-slate-200 p-0.5 bg-white text-[11px] font-semibold">
            <button
              type="button"
              onClick={() => handleSwitchCostBasis('residing')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                costBasisMode === 'residing'
                  ? 'bg-slate-900 text-white font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CountryFlag countryName={selectedBasisCountry} size="xs" className="rounded-xs" />
              <span>Retire in Residing Country ({selectedBasisCountry})</span>
            </button>
            <button
              type="button"
              onClick={() => handleSwitchCostBasis('target-haven')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                costBasisMode === 'target-haven'
                  ? 'bg-gradient-to-r from-orange-600 to-purple-600 text-white font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CountryFlag countryName={targetHavenCountryName} size="xs" className="rounded-xs" />
              <span>Geo-Arbitrage in Target Haven ({targetHavenCountryName})</span>
            </button>
          </div>
        </div>

        {/* Row 1: Residing Country Selector, Current & Target Age, Current Monthly Salary, Monthly Current Expenses, Monthly SIP, Base Retirement Expense */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card 1: Residing Country (Basis) */}
          <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-2">
            <div>
              <label className="font-semibold text-slate-700 block mb-1.5">
                Residing Country (Basis)
              </label>
              <select
                value={selectedBasisCountry}
                onChange={e => handleBasisCountryChange(e.target.value)}
                className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-lg bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {!WORLD_COUNTRIES.some(c => c.name === selectedBasisCountry) && selectedBasisCountry && (
                  <option value={selectedBasisCountry}>🌍 {selectedBasisCountry}</option>
                )}
                {WORLD_COUNTRIES.map(c => (
                  <option key={`fire-basis-${c.code}-${c.name}`} value={c.name}>
                    {c.flag} {c.name}
                  </option>
                ))}
              </select>
            </div>
            <span className="text-[10px] font-mono text-slate-500 block pt-1 border-t border-slate-100">
              {countryMacro.currencyCode !== 'USD'
                ? `Exchange Rate: 1 USD = ${countryMacro.symbol.trim()}${countryMacro.rateToUSD} ${countryMacro.currencyCode}`
                : 'Base Currency: $ USD'}
            </span>
          </div>

          {/* Card 2: Current Age & Target FIRE Age */}
          <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1.5">Current Age</label>
                <input
                  type="number"
                  step="any"
                  min={18}
                  max={85}
                  value={currentAge}
                  onChange={e => setCurrentAge(Number(e.target.value))}
                  className="w-full px-2.5 py-2 text-xs font-mono border border-slate-300 rounded-lg bg-white"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1.5">Target FIRE Age</label>
                <input
                  type="number"
                  step="any"
                  min={20}
                  max={95}
                  value={targetFireAge}
                  onChange={e => setTargetFireAge(Number(e.target.value))}
                  className="w-full px-2.5 py-2 text-xs font-mono border border-slate-300 rounded-lg bg-white"
                />
              </div>
            </div>
            <span className="text-[10px] font-mono text-slate-500 block pt-1 border-t border-slate-100">
              Compounding Horizon: {Math.max(1, targetFireAge - currentAge)} years (until {currentYear + Math.max(1, targetFireAge - currentAge)})
            </span>
          </div>

          {/* Card 3: Current Monthly Salary */}
          <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-2">
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="font-semibold text-slate-700">
                  Current Monthly Salary ({inputCurrencyMode === 'LOCAL' && countryMacro.currencyCode !== 'USD' ? countryMacro.currencyCode : 'USD'})
                </span>
                {monthlySalaryUSD > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setMonthlySalaryUSD(0);
                      persistFireUpdates(
                        { monthlySalaryUSD: 0, currentSalaryUSD: 0 },
                        'Set Current Monthly Salary to $0/mo!'
                      );
                    }}
                    className="text-[10px] font-bold text-slate-500 hover:text-rose-700 hover:underline cursor-pointer shrink-0"
                  >
                    Set $0
                  </button>
                )}
              </div>
              <CurrencyAmountInput
                usdValue={monthlySalaryUSD}
                onChangeUsd={val => setMonthlySalaryUSD(val)}
                currencyMode={inputCurrencyMode}
                countryMacro={countryMacro}
                inputSize="sm"
                helperSuffix="/mo"
              />
            </div>
            <span className="text-[10px] font-mono text-slate-500 block pt-1 border-t border-slate-100">
              Active take-home salary feeding monthly cash flow
            </span>
          </div>

          {/* Card 4: Monthly Current Expenses */}
          <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-2">
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="font-bold text-rose-800">
                  Monthly Current Expenses ({inputCurrencyMode === 'LOCAL' && countryMacro.currencyCode !== 'USD' ? countryMacro.currencyCode : 'USD'})
                </span>
              </div>
              <CurrencyAmountInput
                usdValue={monthlyCurrentExpensesUSD}
                onChangeUsd={val => {
                  setMonthlyCurrentExpensesUSD(val);
                }}
                currencyMode={inputCurrencyMode}
                countryMacro={countryMacro}
                inputSize="sm"
                helperSuffix="/mo"
              />
            </div>
            <input
              type="range"
              min={300}
              max={20000}
              step={50}
              value={Math.min(20000, Math.round(monthlyCurrentExpensesUSD))}
              onChange={e => {
                const nextVal = Number(e.target.value);
                setMonthlyCurrentExpensesUSD(nextVal);
              }}
              className="w-full accent-rose-600 cursor-pointer"
            />
          </div>

          {/* Card 5: Monthly SIP */}
          <div className={`p-3.5 rounded-xl border shadow-2xs flex flex-col justify-between space-y-2 ${
            fireAnalysis.isSipStopped
              ? 'bg-gradient-to-br from-amber-50/80 via-orange-50/30 to-white border-amber-300/90'
              : 'bg-gradient-to-br from-emerald-50/70 via-teal-50/30 to-white border-emerald-200/90'
          }`}>
            <div>
              <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1.5">
                <span className="font-bold text-emerald-950 flex items-center gap-1.5 text-xs">
                  <PiggyBank className={`w-4 h-4 shrink-0 ${fireAnalysis.isSipStopped ? 'text-amber-600' : 'text-emerald-600'}`} />
                  <span>Monthly SIP ({inputCurrencyMode === 'LOCAL' && countryMacro.currencyCode !== 'USD' ? countryMacro.currencyCode : 'USD'})</span>
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${
                  fireAnalysis.isSipStopped
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                }`}>
                  {fireAnalysis.isSipStopped ? 'SIP Stopped ($0)' : `Active · +${sipStepUpPct}%/yr`}
                </span>
              </div>
              <CurrencyAmountInput
                usdValue={fireAnalysis.effectiveMonthlySipUSD}
                onChangeUsd={val => {
                  setMonthlySipUSD(val);
                  if (val > 0) {
                    setLastActiveSipUSD(val);
                    if (sipContinuityMode === 'paused') {
                      setSipContinuityMode('until-fire');
                    }
                  } else {
                    setSipContinuityMode('paused');
                  }
                }}
                currencyMode={inputCurrencyMode}
                countryMacro={countryMacro}
                inputSize="sm"
                helperSuffix="/mo"
              />
            </div>
            <div className="space-y-1.5">
              <input
                type="range"
                min={0}
                max={25000}
                step={50}
                value={Math.min(25000, Math.round(fireAnalysis.effectiveMonthlySipUSD))}
                onChange={e => {
                  const nextVal = Number(e.target.value);
                  setMonthlySipUSD(nextVal);
                  if (nextVal > 0) {
                    setLastActiveSipUSD(nextVal);
                    if (sipContinuityMode === 'paused') {
                      setSipContinuityMode('until-fire');
                    }
                  } else {
                    setSipContinuityMode('paused');
                  }
                }}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                <span className="text-[10px] text-slate-600 font-mono">
                  {fireAnalysis.isSipStopped
                    ? '$0/mo (Coast Mode)'
                    : `$${Math.round(fireAnalysis.effectiveMonthlySipUSD).toLocaleString()}/mo`}
                </span>
                {fireAnalysis.isSipStopped ? (
                  <button
                    type="button"
                    onClick={() => handleResumeSip()}
                    className="px-2.5 py-0.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] cursor-pointer transition-colors shrink-0"
                  >
                    Resume SIP
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleStopSipRightAway}
                    className="px-2.5 py-0.5 rounded-md bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] cursor-pointer transition-colors shrink-0"
                    title="Immediately stop all monthly SIP investments ($0/mo) and switch to Coast FIRE mode"
                  >
                    Stop SIP Now ($0)
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Card 6: Retirement Monthly Expense */}
          <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-2">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1.5">
                <span className="font-semibold text-slate-700">
                  {costBasisMode === 'residing' ? 'Retirement Expense/mo' : `${targetHavenCountryName} Expense/mo`}
                </span>
                {Math.round(baseMonthlyExpenseTodayUSD) !== Math.round(monthlyCurrentExpensesUSD) && (
                  <button
                    type="button"
                    onClick={() => setBaseMonthlyExpenseTodayUSD(monthlyCurrentExpensesUSD)}
                    className="text-[10px] font-bold text-orange-700 hover:underline cursor-pointer shrink-0"
                    title="Match Monthly Current Expenses"
                  >
                    Match Current
                  </button>
                )}
              </div>
              <CurrencyAmountInput
                usdValue={baseMonthlyExpenseTodayUSD}
                onChangeUsd={val => setBaseMonthlyExpenseTodayUSD(val)}
                currencyMode={inputCurrencyMode}
                countryMacro={countryMacro}
                inputSize="sm"
                helperSuffix="/mo"
              />
            </div>
            <input
              type="range"
              min={300}
              max={20000}
              step={50}
              value={Math.min(20000, Math.round(baseMonthlyExpenseTodayUSD))}
              onChange={e => setBaseMonthlyExpenseTodayUSD(Number(e.target.value))}
              className="w-full accent-orange-600 cursor-pointer"
            />
          </div>
        </div>

        {/* SIP EARNING CONTINUITY SWITCH & RETURN ON SIP INTELLIGENCE DECK */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-white via-emerald-50/40 to-teal-50/50 border border-emerald-200/90 shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-2xs shrink-0">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-extrabold text-slate-900 tracking-tight flex flex-wrap items-center gap-2">
                  <span>SIP Earning Continuity Switch &amp; Returns on Investment</span>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-200">
                    Calculated at {expectedReturnPct}% Return · +{sipStepUpPct}% Step-Up
                  </span>
                </h4>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Your monthly SIP represents active capital invested from your salary while earning. Confirm whether you can sustain this SIP until FIRE, commit for a set number of years, or test coasting with zero new savings.
              </p>
            </div>

            {/* Switch / Mode Selector Bar */}
            <div className="flex flex-wrap rounded-xl p-1 bg-slate-100/90 border border-slate-200 text-xs font-bold gap-1 self-start lg:self-auto shrink-0">
              <button
                type="button"
                onClick={() => {
                  const nextSip = monthlySipUSD > 0 ? monthlySipUSD : (lastActiveSipUSD > 0 ? lastActiveSipUSD : 1000);
                  setMonthlySipUSD(nextSip);
                  setSipContinuityMode('until-fire');
                  persistFireUpdates(
                    { monthlySipUSD: nextSip, sipContinuityMode: 'until-fire' },
                    'SIP Continuity set to: Active Until FIRE Reached!'
                  );
                }}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  !fireAnalysis.isSipStopped && sipContinuityMode === 'until-fire'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200/60'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Until FIRE Reached</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const nextSip = monthlySipUSD > 0 ? monthlySipUSD : (lastActiveSipUSD > 0 ? lastActiveSipUSD : 1000);
                  setMonthlySipUSD(nextSip);
                  setSipContinuityMode('custom-years');
                  persistFireUpdates(
                    { monthlySipUSD: nextSip, sipContinuityMode: 'custom-years' },
                    `SIP Continuity set to: Commit ${sipDurationYears} Years!`
                  );
                }}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  !fireAnalysis.isSipStopped && sipContinuityMode === 'custom-years'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200/60'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Commit {sipDurationYears} Years</span>
              </button>

              <button
                type="button"
                onClick={handleStopSipRightAway}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  fireAnalysis.isSipStopped
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200/60'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Stop SIP Right Away ($0 · Coast)</span>
              </button>
            </div>
          </div>

          {/* Custom Duration Slider (if custom-years selected) */}
          {sipContinuityMode === 'custom-years' && (
            <div className="p-3 rounded-xl bg-white border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <span>How many years will you continue this SIP out of current earnings?</span>
                  <span className="font-mono font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {sipDurationYears} {sipDurationYears === 1 ? 'Year' : 'Years'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  After year {currentYear + sipDurationYears} (Age {currentAge + sipDurationYears}), fresh salary contributions will halt ($0/mo), and your accumulated corpus will compound on its own toward retirement.
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-64 shrink-0">
                <input
                  type="range"
                  min={1}
                  max={15}
                  step={1}
                  value={sipDurationYears}
                  onChange={e => setSipDurationYears(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <span className="font-mono font-bold text-xs text-slate-700 w-12 text-right">
                  {sipDurationYears} yrs
                </span>
              </div>
            </div>
          )}

          {/* Toggle Checkbox: Stop fresh SIP once FIRE is achieved */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-emerald-100 text-xs">
            <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700 font-semibold">
              <input
                type="checkbox"
                checked={stopSipAtFire}
                onChange={e => setStopSipAtFire(e.target.checked)}
                className="rounded accent-emerald-600 cursor-pointer w-4 h-4"
              />
              <span>
                Stop fresh salary SIP once FIRE is achieved (since active earning ceases and living withdrawals begin)
              </span>
            </label>
            <span className="text-[11px] text-slate-500">
              {stopSipAtFire
                ? 'Realistic: Salary injections cease upon retirement'
                : 'Pumping salary SIP indefinitely post-retirement'}
            </span>
          </div>

          {/* RETURNS ON SIP: HORIZON CALCULATOR & 4 KEY VALUE METRICS */}
          <div className="pt-2 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-emerald-600" />
                <span>Returns on Your SIP Contributions (Compounding Breakdown)</span>
              </span>

              {/* Horizon Tabs */}
              <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-xs font-semibold gap-1">
                {[
                  { id: 'fire', label: `At FIRE Goal (${fireAnalysis.yearsToFireExact <= 0 ? 'Now' : `${fireAnalysis.yearsToFireExact} yrs`})` },
                  { id: '3', label: '3 Years' },
                  { id: '5', label: '5 Years' },
                  { id: '10', label: '10 Years' },
                  ...(sipContinuityMode === 'custom-years'
                    ? [{ id: 'custom', label: `Committed (${sipDurationYears} yrs)` }]
                    : []),
                ].map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSelectedSipReturnsHorizon(tab.id as any)}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer text-[11px] ${
                      selectedSipReturnsHorizon === tab.id
                        ? 'bg-white text-emerald-950 font-bold shadow-2xs border border-emerald-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 4 Return on SIP Tiles */}
            {(() => {
              const activeReturns =
                selectedSipReturnsHorizon === '3'
                  ? fireAnalysis.sipReturns3Yr
                  : selectedSipReturnsHorizon === '5'
                  ? fireAnalysis.sipReturns5Yr
                  : selectedSipReturnsHorizon === '10'
                  ? fireAnalysis.sipReturns10Yr
                  : selectedSipReturnsHorizon === 'custom'
                  ? fireAnalysis.sipReturnsCustom
                  : fireAnalysis.sipReturnsAtFire;

              const percentPrincipal =
                activeReturns.finalMaturityUSD > 0
                  ? Math.round((activeReturns.totalPrincipalUSD / activeReturns.finalMaturityUSD) * 100)
                  : 100;
              const percentGain =
                activeReturns.finalMaturityUSD > 0
                  ? Math.round((activeReturns.wealthGainedUSD / activeReturns.finalMaturityUSD) * 100)
                  : 0;

              return (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    
                    {/* Metric 1: Total Out-of-Pocket Invested via SIP */}
                    <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        1. Out-of-Pocket Invested (Principal)
                      </span>
                      <div className="text-lg font-extrabold font-mono text-slate-900 tabular-nums">
                        {formatDualCurrency(activeReturns.totalPrincipalUSD, countryMacro, true)}
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Total saved from your salary over {activeReturns.durationYears} {activeReturns.durationYears === 1 ? 'year' : 'years'}
                      </p>
                    </div>

                    {/* Metric 2: Returns on SIP (Pure Compounded Profit) */}
                    <div className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-50 via-teal-50/40 to-white border border-emerald-300 shadow-2xs space-y-1">
                      <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                        2. Compounded Returns on SIP
                      </span>
                      <div className="text-lg font-extrabold font-mono text-emerald-700 tabular-nums">
                        +{formatDualCurrency(activeReturns.wealthGainedUSD, countryMacro, true)}
                      </div>
                      <p className="text-[11px] text-emerald-900/80 font-medium">
                        Pure wealth generated by {expectedReturnPct}% annual return
                      </p>
                    </div>

                    {/* Metric 3: Total Accumulated SIP Value */}
                    <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        3. Total SIP Maturity Value
                      </span>
                      <div className="text-lg font-extrabold font-mono text-purple-950 tabular-nums">
                        {formatDualCurrency(activeReturns.finalMaturityUSD, countryMacro, true)}
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Principal + compounding gains created by SIP
                      </p>
                    </div>

                    {/* Metric 4: Wealth Multiplier & Gain % */}
                    <div className="p-3.5 rounded-xl bg-gradient-to-br from-purple-50 via-indigo-50/40 to-white border border-purple-200 shadow-2xs space-y-1">
                      <span className="text-[10px] font-bold text-purple-900 uppercase tracking-wider block">
                        4. Wealth Multiplier &amp; Gain
                      </span>
                      <div className="text-lg font-extrabold font-mono text-purple-900 tabular-nums flex items-baseline gap-1.5">
                        <span>{activeReturns.multiplier}x</span>
                        <span className="text-xs font-sans font-bold text-emerald-700">
                          (+{activeReturns.returnPercent.toFixed(1)}%)
                        </span>
                      </div>
                      <p className="text-[11px] text-purple-950/75">
                        {activeReturns.wealthGainedUSD >= activeReturns.totalPrincipalUSD
                          ? 'Returns exceed your entire invested principal!'
                          : `${percentGain}% of maturity is pure compounding growth`}
                      </p>
                    </div>

                  </div>

                  {/* Compounding Proportional Ratio Bar */}
                  {activeReturns.finalMaturityUSD > 0 && (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-sm bg-sky-600 inline-block" />
                          <span>Principal Invested: {percentPrincipal}% ({formatDualCurrency(activeReturns.totalPrincipalUSD, countryMacro, true)})</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600 inline-block" />
                          <span className="text-emerald-800 font-bold">Market Returns Gained: {percentGain}% (+{formatDualCurrency(activeReturns.wealthGainedUSD, countryMacro, true)})</span>
                        </span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden flex">
                        <div
                          style={{ width: `${percentPrincipal}%` }}
                          className="h-full bg-sky-600 transition-all duration-300"
                          title="Principal Invested"
                        />
                        <div
                          style={{ width: `${percentGain}%` }}
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
                          title="Compounded Returns"
                        />
                      </div>
                    </div>
                  )}

                  {/* Plain-English Takeaway */}
                  <div className="text-[11px] text-slate-600 leading-relaxed bg-white/80 p-2.5 rounded-xl border border-emerald-100 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      {fireAnalysis.isSipStopped ? (
                        <span>
                          <strong>SIP Stopped (Coast Mode Active):</strong> You have stopped fresh monthly SIP contributions ($0/mo). Your current net corpus ({formatDualCurrency(fireAnalysis.startingCorpusTodayUSD, countryMacro, true)}) compounds on its own without new salary deductions.
                        </span>
                      ) : (
                        <span>
                          <strong>How your SIP is treated:</strong> You invest {formatDualCurrency(fireAnalysis.effectiveMonthlySipUSD, countryMacro, false)}/mo out of active salary with a {sipStepUpPct}%/yr step-up. Over {activeReturns.durationYears} {activeReturns.durationYears === 1 ? 'year' : 'years'}, your personal investment of {formatDualCurrency(activeReturns.totalPrincipalUSD, countryMacro, true)} produces <strong>+{formatDualCurrency(activeReturns.wealthGainedUSD, countryMacro, true)}</strong> in compounded returns at {expectedReturnPct}% annual return. {stopSipAtFire ? 'Upon reaching FIRE, fresh salary injections halt and your accumulated investments support your lifestyle.' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Row 2: Direct Editable Inputs + Sliders for Country Inflation, Investment Return, Annual SIP Step-Up, and Safe Withdrawal Rate */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-3 border-t border-slate-200/70">
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="font-semibold text-slate-700">Country Inflation Rate (% / yr)</span>
              <input
                type="number"
                step="any"
                min={0}
                max={25}
                value={inflationPct}
                onChange={e => setInflationPct(parseFloat(e.target.value) || 0)}
                className="w-20 px-2 py-1 text-xs font-mono font-bold text-rose-700 border border-slate-300 rounded-lg bg-white text-right"
              />
            </div>
            <input
              type="range"
              min={1.0}
              max={12.0}
              step={0.1}
              value={Math.min(12, Math.max(1, inflationPct))}
              onChange={e => setInflationPct(parseFloat(e.target.value))}
              className="w-full accent-rose-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>1.0%</span>
              <span>Default: {countryMacro.defaultInflationPercent}%</span>
              <span>12%</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="font-semibold text-slate-700">Expected Return (% / yr)</span>
              <input
                type="number"
                step="any"
                min={1}
                max={30}
                value={expectedReturnPct}
                onChange={e => setExpectedReturnPct(parseFloat(e.target.value) || 0)}
                className="w-20 px-2 py-1 text-xs font-mono font-bold text-teal-800 border border-slate-300 rounded-lg bg-white text-right"
              />
            </div>
            <input
              type="range"
              min={3.0}
              max={18.0}
              step={0.1}
              value={Math.min(18, Math.max(3, expectedReturnPct))}
              onChange={e => setExpectedReturnPct(parseFloat(e.target.value))}
              className="w-full accent-teal-700 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>3.0%</span>
              <span className="text-teal-800 font-bold">Real: {(expectedReturnPct - inflationPct).toFixed(1)}%</span>
              <span>18%</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="font-semibold text-slate-700">Annual SIP Step-Up (% / yr)</span>
              <input
                type="number"
                step="any"
                min={0}
                max={50}
                value={sipStepUpPct}
                onChange={e => setSipStepUpPct(parseFloat(e.target.value) || 0)}
                className="w-20 px-2 py-1 text-xs font-mono font-bold text-purple-800 border border-slate-300 rounded-lg bg-white text-right"
              />
            </div>
            <input
              type="range"
              min={0}
              max={25}
              step={0.5}
              value={Math.min(25, Math.max(0, sipStepUpPct))}
              onChange={e => setSipStepUpPct(parseFloat(e.target.value))}
              className="w-full accent-purple-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>0% (Flat)</span>
              <span>8% Standard</span>
              <span>25%/yr</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="font-semibold text-slate-700">Safe Withdrawal Rate (SWR %)</span>
              <input
                type="number"
                step="any"
                min={1.5}
                max={10.0}
                value={swrPct}
                onChange={e => setSwrPct(parseFloat(e.target.value) || 4.0)}
                className="w-20 px-2 py-1 text-xs font-mono font-bold text-orange-800 border border-slate-300 rounded-lg bg-white text-right"
              />
            </div>
            <input
              type="range"
              min={2.5}
              max={6.0}
              step={0.1}
              value={Math.min(6, Math.max(2.5, swrPct))}
              onChange={e => setSwrPct(parseFloat(e.target.value))}
              className="w-full accent-orange-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>2.5% (40x)</span>
              <span className="text-orange-900 font-bold">{Math.round((100 / Math.max(1, swrPct)) * 10) / 10}x Corpus</span>
              <span>6.0%</span>
            </div>
          </div>
        </div>

        {/* Row 3: Editable Financial Assets (5 Schemes) Directly Inside FIRE Calculator */}
        <div className="pt-3 border-t border-slate-200/80 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <PiggyBank className="w-4 h-4 text-teal-700" />
              <span className="font-bold text-slate-900">
                Current Financial Assets Feeding FIRE Corpus: {formatDualCurrency(fireAnalysis.startingCorpusTodayUSD, countryMacro, true)}
              </span>
              <span className="text-[11px] text-slate-500">
                (Liquid: {formatDualCurrency(fireAnalysis.liquidAssets, countryMacro, true)} · Gross: {formatDualCurrency(fireAnalysis.totalGrossAssets, countryMacro, true)})
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowAssetsEditorInFire(!showAssetsEditorInFire)}
              className="px-3 py-1 rounded-lg border border-orange-300 bg-white hover:bg-orange-50 text-orange-900 font-bold text-[11px] cursor-pointer"
            >
              {showAssetsEditorInFire
                ? 'Hide Direct Asset Scheme Inputs'
                : `Edit 5 Asset Schemes Here (${inputCurrencyMode === 'LOCAL' && countryMacro.currencyCode !== 'USD' ? countryMacro.currencyCode : 'USD'})`}
            </button>
          </div>

          {showAssetsEditorInFire && (
            <div className="p-4 rounded-xl bg-white border border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 animate-in fade-in">
              <div>
                <label className="font-semibold text-blue-900 block mb-1 text-[11px]">
                  1. Savings & Cash
                </label>
                <CurrencyAmountInput
                  usdValue={investmentsDraft.savingsUSD}
                  onChangeUsd={val => setInvestmentsDraft(prev => ({ ...prev, savingsUSD: val }))}
                  currencyMode={inputCurrencyMode}
                  countryMacro={countryMacro}
                  inputSize="sm"
                />
              </div>
              <div>
                <label className="font-semibold text-emerald-900 block mb-1 text-[11px]">
                  2. Stocks & Mutual Funds
                </label>
                <CurrencyAmountInput
                  usdValue={investmentsDraft.stocksMutualFundsUSD}
                  onChangeUsd={val => setInvestmentsDraft(prev => ({ ...prev, stocksMutualFundsUSD: val }))}
                  currencyMode={inputCurrencyMode}
                  countryMacro={countryMacro}
                  inputSize="sm"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-indigo-900 text-[11px]">
                    3. Real Estate Equity
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const nextHome = !includePrimaryHome;
                      setIncludePrimaryHome(nextHome);
                      persistFireUpdates({ includePrimaryHomeInFire: nextHome });
                    }}
                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold cursor-pointer ${
                      includePrimaryHome
                        ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}
                  >
                    {includePrimaryHome ? '✓ In FIRE' : 'Excluded'}
                  </button>
                </div>
                <CurrencyAmountInput
                  usdValue={investmentsDraft.realEstateUSD}
                  onChangeUsd={val => setInvestmentsDraft(prev => ({ ...prev, realEstateUSD: val }))}
                  currencyMode={inputCurrencyMode}
                  countryMacro={countryMacro}
                  inputSize="sm"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-amber-900 text-[11px]">
                    4. Gold &amp; Bullion
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const nextGold = !includeGold;
                      setIncludeGold(nextGold);
                      persistFireUpdates({ includeGoldInFire: nextGold });
                    }}
                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold cursor-pointer ${
                      includeGold
                        ? 'bg-amber-100 text-amber-900 border border-amber-200'
                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}
                  >
                    {includeGold ? '✓ In FIRE' : 'Excluded (Family)'}
                  </button>
                </div>
                <CurrencyAmountInput
                  usdValue={investmentsDraft.goldUSD}
                  onChangeUsd={val => setInvestmentsDraft(prev => ({ ...prev, goldUSD: val }))}
                  currencyMode={inputCurrencyMode}
                  countryMacro={countryMacro}
                  inputSize="sm"
                />
              </div>
              <div>
                <label className="font-semibold text-purple-900 block mb-1 text-[11px]">
                  5. Other Investments
                </label>
                <CurrencyAmountInput
                  usdValue={investmentsDraft.othersUSD}
                  onChangeUsd={val => setInvestmentsDraft(prev => ({ ...prev, othersUSD: val }))}
                  currencyMode={inputCurrencyMode}
                  countryMacro={countryMacro}
                  inputSize="sm"
                />
              </div>
            </div>
          )}

          {/* Save & Recalculate Action Bar at bottom of Interactive Controls */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-slate-200/70">
            <span className="text-[11px] text-slate-600">
              All values above auto-calculate your <strong>Target FIRE Corpus ({formatDualCurrency(fireAnalysis.comprehensiveFireNumberTodayUSD, countryMacro, true)})</strong>, <strong>Countdown ({fireAnalysis.yearsToFireExact === 0 ? 'Achieved!' : `${fireAnalysis.yearsToFireExact} yrs`})</strong>, and the <strong>Visual Path &amp; Trajectory Charts</strong> below in real time.
            </span>
            <button
              type="button"
              onClick={() =>
                persistFireUpdates(
                  {},
                  'Saved & Recalculated! Your FIRE parameters, salary, and asset balances are synced.'
                )
              }
              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Save &amp; Recalculate FIRE Plan</span>
            </button>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* PART 2: VISUAL FIRE PATH, THERMOMETER & TRAJECTORY CHARTS (SECOND)    */}
      {/* ===================================================================== */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-50/70 border border-slate-200/90 space-y-6">
        {/* VISUAL FIRE PROGRESS SCALE & MILESTONE THERMOMETER (LIGHT EDITORIAL THEME) */}
        <div className="relative overflow-hidden p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-indigo-50/90 via-white to-emerald-50/85 border border-indigo-200/90 text-slate-900 space-y-4 shadow-xs">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-amber-500 to-emerald-500" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-600 to-teal-600 text-white flex items-center justify-center shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5" />
                </span>
                <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-900">
                  FIRE Independence Thermometer &amp; 4-Stage Milestone Scale
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300">
                  {fireAnalysis.uncappedFireProgressPct}% Funded ({fireAnalysis.zeroWorkSim.isPerpetual ? 'Perpetual 2076+' : `Survives Until ${fireAnalysis.zeroWorkSim.survivalYear}`})
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                {fireAnalysis.yearsToFireExact === 0
                  ? `Congratulations! Your current net corpus (${formatDualCurrency(fireAnalysis.startingCorpusTodayUSD, countryMacro, true)}) covers 100%+ of your ${fireTier.toUpperCase()} FIRE target including future family milestones.`
                  : `You have completed ${fireAnalysis.fireProgressPct}% of your journey toward ${fireTier.toUpperCase()} FIRE in ${costBasisMode === 'residing' ? selectedBasisCountry : targetHavenCountryName} — and your current money already lasts ${fireAnalysis.zeroWorkSim.isPerpetual ? '50+ years (forever)' : `${fireAnalysis.zeroWorkSim.wholeYears} yrs ${fireAnalysis.zeroWorkSim.remMonths} mos (until ${fireAnalysis.zeroWorkSim.survivalYear})`} without working.`}
              </p>
            </div>

            {/* FIRE Tier Selector Pills */}
            <div className="inline-flex flex-wrap rounded-xl bg-slate-100/90 border border-slate-200/90 p-1 text-xs font-semibold gap-1 shrink-0">
              {[
                { id: 'barista', label: 'Barista / Nomad FIRE (72%)' },
                { id: 'lean', label: 'Lean FIRE (80%)' },
                { id: 'standard', label: 'Standard FIRE (100%)' },
                { id: 'fat', label: 'Fat FIRE (135%)' },
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setFireTier(t.id as FireTierMode)}
                  className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                    fireTier === t.id
                      ? 'bg-gradient-to-r from-indigo-600 via-violet-600 to-teal-600 text-white font-extrabold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Progress Bar Track & Live Scale Labels */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-600">
                Current Net Corpus: <strong className="text-slate-900">{formatDualCurrency(fireAnalysis.startingCorpusTodayUSD, countryMacro, true)}</strong>
              </span>
              <span className="text-indigo-900 font-bold">
                Target {fireTier.toUpperCase()} Corpus: {formatDualCurrency(fireAnalysis.comprehensiveFireNumberTodayUSD, countryMacro, true)}
              </span>
            </div>

            <div className="w-full h-4 rounded-full bg-slate-200/80 border border-slate-300/70 overflow-hidden relative p-0.5 shadow-inner">
              <div
                style={{ width: `${Math.min(100, Math.max(4, fireAnalysis.fireProgressPct))}%` }}
                className="h-full rounded-full bg-gradient-to-r from-indigo-600 via-teal-500 to-emerald-500 transition-all duration-500"
              />
            </div>

            {/* 4 Milestone Stage Cards Under Scale */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1 text-xs">
              {[
                {
                  stage: 'Stage 1: Coast / Nomad Seed',
                  targetUSD: fireAnalysis.coastFireTargetTodayUSD,
                  subtitle: `Compounds to target by Age ${targetFireAge} with $0 new SIP`,
                  achieved: fireAnalysis.startingCorpusTodayUSD >= fireAnalysis.coastFireTargetTodayUSD,
                  active: fireTier === 'barista',
                },
                {
                  stage: 'Stage 2: Lean FIRE (80%)',
                  targetUSD: fireAnalysis.leanFireTargetTodayUSD + fireAnalysis.totalFutureGoalsTodayUSD,
                  subtitle: 'Essential living + all future family goals covered',
                  achieved:
                    fireAnalysis.startingCorpusTodayUSD >=
                    fireAnalysis.leanFireTargetTodayUSD + fireAnalysis.totalFutureGoalsTodayUSD,
                  active: fireTier === 'lean',
                },
                {
                  stage: 'Stage 3: Standard FIRE (100%)',
                  targetUSD: fireAnalysis.standardFireTargetTodayUSD + fireAnalysis.totalFutureGoalsTodayUSD,
                  subtitle: 'Full comfortable lifestyle + future milestones',
                  achieved:
                    fireAnalysis.startingCorpusTodayUSD >=
                    fireAnalysis.standardFireTargetTodayUSD + fireAnalysis.totalFutureGoalsTodayUSD,
                  active: fireTier === 'standard',
                },
                {
                  stage: 'Stage 4: Fat FIRE (135%)',
                  targetUSD: fireAnalysis.fatFireTargetTodayUSD + fireAnalysis.totalFutureGoalsTodayUSD,
                  subtitle: 'Abundant luxury, global travel & healthcare buffer',
                  achieved:
                    fireAnalysis.startingCorpusTodayUSD >=
                    fireAnalysis.fatFireTargetTodayUSD + fireAnalysis.totalFutureGoalsTodayUSD,
                  active: fireTier === 'fat',
                },
              ].map(item => {
                const pctOfStage = Math.min(
                  999,
                  Math.round((fireAnalysis.startingCorpusTodayUSD / Math.max(1, item.targetUSD)) * 100)
                );
                return (
                  <div
                    key={item.stage}
                    className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                      item.achieved
                        ? 'bg-emerald-50/85 border-emerald-300/90 shadow-2xs'
                        : item.active
                        ? 'bg-indigo-50/80 border-indigo-300/90 shadow-2xs'
                        : 'bg-white border-slate-200/90'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 text-[10px] font-extrabold uppercase tracking-wider">
                        <span className={item.achieved ? 'text-emerald-900' : 'text-indigo-950'}>
                          {item.stage}
                        </span>
                        {item.achieved ? (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-200/80 text-emerald-950 font-bold text-[9px]">
                            <Check className="w-3 h-3 text-emerald-700" />
                            Unlocked ({pctOfStage}%)
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[9px]">
                            {pctOfStage}%
                          </span>
                        )}
                      </div>
                      <div className="font-mono font-extrabold text-sm text-slate-900 mt-1">
                        {formatDualCurrency(item.targetUSD, countryMacro)}
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-600 mt-1.5 leading-snug">
                      {item.subtitle}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RECHARTS VISUAL PATH: BENCHMARK COMPARISON & TIMELINE GROWTH PROJECTION */}
        <FireProgressChart
          currentYear={currentYear}
          currentAge={currentAge}
          targetFireAge={targetFireAge}
          selectedBasisCountry={selectedBasisCountry}
          targetHavenCountryName={targetHavenCountryName}
          costBasisMode={costBasisMode}
          countryMacro={countryMacro}
          expectedReturnPct={expectedReturnPct}
          inflationPct={inflationPct}
          sipStepUpPct={sipStepUpPct}
          investments={investmentsDraft}
          liquidAssetsUSD={fireAnalysis.liquidAssets}
          totalGrossAssetsUSD={fireAnalysis.totalGrossAssets}
          startingCorpusTodayUSD={fireAnalysis.startingCorpusTodayUSD}
          coastFireTargetTodayUSD={fireAnalysis.coastFireTargetTodayUSD}
          leanFireTargetTodayUSD={fireAnalysis.leanFireTargetTodayUSD}
          standardFireTargetTodayUSD={fireAnalysis.standardFireTargetTodayUSD}
          fatFireTargetTodayUSD={fireAnalysis.fatFireTargetTodayUSD}
          comprehensiveFireNumberTodayUSD={fireAnalysis.comprehensiveFireNumberTodayUSD}
          totalFutureGoalsTodayUSD={fireAnalysis.totalFutureGoalsTodayUSD}
          crossoverYear={fireAnalysis.crossoverYear}
          crossoverAge={fireAnalysis.crossoverAge}
          trajectory={fireAnalysis.trajectory}
        />
      </div>

      {/* ===================================================================== */}
      {/* PART 3: 4-TAB INTERACTIVE LEDGER & DIAGNOSTICS CONSOLE (THIRD)        */}
      {/* ===================================================================== */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 pb-2 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveLedgerTab('diagnostics')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeLedgerTab === 'diagnostics'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Strengths, Weaknesses & FIRE Accelerators</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveLedgerTab('future-goals')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeLedgerTab === 'future-goals'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 text-purple-500" />
            <span>Future Expenses & Insurance ({finances.futureExpenses?.length || 0})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveLedgerTab('loans')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeLedgerTab === 'loans'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            <Landmark className="w-3.5 h-3.5 text-rose-500" />
            <span>Multiple Loans & EMIs ({finances.loans?.length || 0})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveLedgerTab('side-income')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeLedgerTab === 'side-income'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5 text-emerald-500" />
            <span>Side & Passive Incomes ({finances.sideIncomes?.length || 0})</span>
          </button>
        </div>

        {/* TAB 1: STRENGTHS, WEAKNESSES & ACTIONABLE ACCELERATORS */}
        {activeLedgerTab === 'diagnostics' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              
              {/* Strengths Column */}
              <div className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50/30 space-y-3">
                <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Financial Strengths Supporting Your FIRE ({fireAnalysis.strengths.length})</span>
                </div>
                <div className="space-y-2.5">
                  {fireAnalysis.strengths.map((s, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-white border border-emerald-100 shadow-2xs">
                      <p className="text-xs font-bold text-slate-900">{s.title}</p>
                      <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">{s.detail}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weaknesses / Watchouts Column */}
              <div className="p-5 rounded-2xl border border-amber-200 bg-amber-50/30 space-y-3">
                <div className="flex items-center gap-2 text-amber-950 font-extrabold text-sm">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Gaps, Inflation Drag & Watchouts ({fireAnalysis.weaknesses.length})</span>
                </div>
                <div className="space-y-2.5">
                  {fireAnalysis.weaknesses.map((w, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-white border border-amber-100 shadow-2xs">
                      <p className="text-xs font-bold text-slate-900">{w.title}</p>
                      <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">{w.detail}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Actionable "Achieve FIRE Earlier" Levers */}
            <div className="p-5 rounded-2xl border border-purple-200 bg-gradient-to-r from-orange-50/60 via-purple-50/50 to-white space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-orange-600" />
                  <h4 className="text-sm font-extrabold text-slate-900">
                    How to Achieve FIRE Earlier — Quantified Action Levers
                  </h4>
                </div>
                <span className="text-[11px] text-purple-800 font-semibold">
                  Click any lever to test & apply immediately
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {fireAnalysis.accelerators.map(acc => (
                  <div
                    key={acc.id}
                    className="p-4 rounded-xl bg-white border border-slate-200/90 flex flex-col justify-between shadow-2xs"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                          Retire ~{acc.impactYears} Yrs Earlier
                        </span>
                      </div>
                      <h5 className="text-xs font-bold text-slate-900 leading-snug">{acc.title}</h5>
                      <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{acc.description}</p>
                    </div>
                    <button
                      type="button"
                      onClick={acc.onApply}
                      className="mt-3 w-full py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-orange-600 text-white font-bold text-[11px] transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>{acc.actionLabel}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: FUTURE LIFE MILESTONES, EDUCATION, MARRIAGE, TRAVEL & INSURANCE (DIRECTLY EDITABLE) */}
        {activeLedgerTab === 'future-goals' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-purple-50/50 p-3.5 rounded-xl border border-purple-200/80 text-xs">
              <div>
                <span className="font-bold text-purple-950">
                  Auto-Calculated Total Future Milestones Today: {formatDualCurrency(fireAnalysis.totalFutureGoalsTodayUSD, countryMacro)}
                </span>
                <span className="text-slate-600 ml-2">
                  (Inflation-Adjusted at Target Years: <strong>{formatDualCurrency(fireAnalysis.totalFutureGoalsInflatedUSD, countryMacro)}</strong>)
                </span>
              </div>
              <button
                type="button"
                onClick={() => persistFireUpdates({}, 'Saved & Recalculated Future Milestones!')}
                className="px-3 py-1.5 rounded-lg bg-purple-800 hover:bg-purple-900 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer shrink-0"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Save & Recalculate</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {fireAnalysis.enrichedGoals.map(g => (
                <div
                  key={g.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2.5 text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">
                          Milestone Name
                        </label>
                        <input
                          type="text"
                          value={g.title}
                          onChange={e => handleUpdateGoal(g.id, { title: e.target.value })}
                          className="w-full px-2.5 py-1.5 text-xs font-bold text-slate-900 border border-slate-300 rounded-lg bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">
                          Category
                        </label>
                        <select
                          value={g.category}
                          onChange={e => handleUpdateGoal(g.id, { category: e.target.value as any })}
                          className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                        >
                          <option value="Children Education">Children Education</option>
                          <option value="Children Marriage">Children Marriage</option>
                          <option value="Self Education">Self Education</option>
                          <option value="Self Marriage / Family">Self Marriage / Family</option>
                          <option value="World Travel / Sabbatical">World Travel / Sabbatical</option>
                          <option value="Insurance & Medical Corpus">Insurance & Medical Corpus</option>
                          <option value="Major Purchase / Property">Major Purchase / Property</option>
                          <option value="Other Goal">Other Goal</option>
                        </select>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveGoal(g.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 shrink-0"
                      title="Remove milestone"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 items-start">
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 uppercase block mb-0.5">
                        Cost Today ({inputCurrencyMode === 'LOCAL' && countryMacro.currencyCode !== 'USD' ? countryMacro.currencyCode : 'USD'})
                      </label>
                      <CurrencyAmountInput
                        usdValue={g.estimatedCostTodayUSD}
                        onChangeUsd={val => handleUpdateGoal(g.id, { estimatedCostTodayUSD: Math.round(val) })}
                        currencyMode={inputCurrencyMode}
                        countryMacro={countryMacro}
                        inputSize="sm"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 uppercase block mb-0.5">
                          Target Year
                        </label>
                        <input
                          type="number"
                          step="any"
                          min={currentYear}
                          max={currentYear + 40}
                          value={g.targetYear}
                          onChange={e => handleUpdateGoal(g.id, { targetYear: Number(e.target.value) || currentYear })}
                          className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-lg bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 uppercase block mb-0.5">
                          Priority
                        </label>
                        <select
                          value={g.priority}
                          onChange={e => handleUpdateGoal(g.id, { priority: e.target.value as any })}
                          className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                        >
                          <option value="Essential">Essential</option>
                          <option value="Aspirational">Aspirational</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="pt-1.5 border-t border-slate-200/80 text-[11px] text-slate-600 font-mono flex items-center justify-between">
                    <span>In {g.yearsAway} yrs ({g.targetYear}) at {inflationPct}% inflation:</span>
                    <strong className="text-purple-900">
                      {formatDualCurrency(g.inflatedCostUSD, countryMacro, false)}
                    </strong>
                  </div>
                </div>
              ))}
            </div>

            {/* Add New Future Milestone Form */}
            <form noValidate onSubmit={handleAddGoal} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3 text-xs">
              <div className="font-bold text-slate-800">
                + Add New Future Expense (Children Education, Marriage, Travel, Insurance, Major Purchase)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-start">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Milestone Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Daughter College"
                    value={newGoal.title}
                    onChange={e => setNewGoal({ ...newGoal, title: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Category</label>
                  <select
                    value={newGoal.category}
                    onChange={e => setNewGoal({ ...newGoal, category: e.target.value as any })}
                    className="w-full px-2.5 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Children Education">Children Education</option>
                    <option value="Children Marriage">Children Marriage</option>
                    <option value="Self Education">Self Education</option>
                    <option value="Self Marriage / Family">Self Marriage / Family</option>
                    <option value="World Travel / Sabbatical">World Travel / Sabbatical</option>
                    <option value="Insurance & Medical Corpus">Insurance & Medical Corpus</option>
                    <option value="Major Purchase / Property">Major Purchase / Property</option>
                    <option value="Other Goal">Other Goal</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    Estimated Cost Today ({inputCurrencyMode === 'LOCAL' && countryMacro.currencyCode !== 'USD' ? countryMacro.currencyCode : 'USD'})
                  </label>
                  <CurrencyAmountInput
                    usdValue={newGoal.costInput}
                    onChangeUsd={val => setNewGoal({ ...newGoal, costInput: val })}
                    currencyMode={inputCurrencyMode}
                    countryMacro={countryMacro}
                    inputSize="sm"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Target Year</label>
                  <input
                    type="number"
                    step="any"
                    min={currentYear}
                    max={currentYear + 40}
                    required
                    placeholder="Target Year"
                    value={newGoal.targetYear}
                    onChange={e => setNewGoal({ ...newGoal, targetYear: Number(e.target.value) })}
                    className="w-full px-3 py-2 font-mono border border-slate-300 rounded-lg bg-white"
                  />
                </div>
                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full px-4 py-2 rounded-lg bg-purple-700 hover:bg-purple-800 text-white font-bold flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add & Recalculate</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: MULTIPLE LOANS & LIABILITIES (DIRECTLY EDITABLE) */}
        {activeLedgerTab === 'loans' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-rose-50/50 p-3.5 rounded-xl border border-rose-200/80 text-xs">
              <div>
                <span className="font-bold text-rose-950">
                  Auto-Calculated Active Loans Principal: {formatDualCurrency(fireAnalysis.totalLoanPrincipalUSD, countryMacro)}
                </span>
                <span className="text-slate-600 ml-2">
                  · Total Monthly EMIs: <strong>{formatDualCurrency(fireAnalysis.totalMonthlyEmiUSD, countryMacro, false)}/mo</strong> (Automatically rolls into SIPs upon payoff)
                </span>
              </div>
              <button
                type="button"
                onClick={() => persistFireUpdates({}, 'Saved & Recalculated Loan Liabilities!')}
                className="px-3 py-1.5 rounded-lg bg-rose-800 hover:bg-rose-900 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer shrink-0"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Save & Recalculate</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(finances.loans || []).map(loan => (
                <div
                  key={loan.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2.5 text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">
                          Loan Name
                        </label>
                        <input
                          type="text"
                          value={loan.name}
                          onChange={e => handleUpdateLoan(loan.id, { name: e.target.value })}
                          className="w-full px-2.5 py-1.5 text-xs font-bold text-slate-900 border border-slate-300 rounded-lg bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">
                          Loan Type
                        </label>
                        <select
                          value={loan.category}
                          onChange={e => handleUpdateLoan(loan.id, { category: e.target.value as any })}
                          className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                        >
                          <option value="Home / Mortgage">Home / Mortgage</option>
                          <option value="Car / Vehicle">Car / Vehicle</option>
                          <option value="Personal / Credit">Personal / Credit</option>
                          <option value="Education">Education Loan</option>
                          <option value="Business / Investment">Business / Investment</option>
                          <option value="Other">Other Liability</option>
                        </select>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveLoan(loan.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 shrink-0"
                      title="Remove loan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 uppercase block mb-0.5">
                        Outstanding Principal ({inputCurrencyMode === 'LOCAL' && countryMacro.currencyCode !== 'USD' ? countryMacro.currencyCode : 'USD'})
                      </label>
                      <CurrencyAmountInput
                        usdValue={loan.outstandingPrincipalUSD}
                        onChangeUsd={val => handleUpdateLoan(loan.id, { outstandingPrincipalUSD: Math.round(val) })}
                        currencyMode={inputCurrencyMode}
                        countryMacro={countryMacro}
                        inputSize="sm"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 uppercase block mb-0.5">
                        Monthly EMI ({inputCurrencyMode === 'LOCAL' && countryMacro.currencyCode !== 'USD' ? countryMacro.currencyCode : 'USD'})
                      </label>
                      <CurrencyAmountInput
                        usdValue={loan.monthlyEmiUSD}
                        onChangeUsd={val => handleUpdateLoan(loan.id, { monthlyEmiUSD: Math.round(val) })}
                        currencyMode={inputCurrencyMode}
                        countryMacro={countryMacro}
                        inputSize="sm"
                        helperSuffix="/mo"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 uppercase block mb-0.5">
                        Interest Rate (APR %)
                      </label>
                      <input
                        type="number"
                        step="any"
                        min={0}
                        max={40}
                        value={loan.interestRatePercent}
                        onChange={e => handleUpdateLoan(loan.id, { interestRatePercent: parseFloat(e.target.value) || 0 })}
                        className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-lg bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 uppercase block mb-0.5">
                        Remaining Years (Paid off {currentYear + (loan.remainingYears || 1)})
                      </label>
                      <input
                        type="number"
                        step="any"
                        min={1}
                        max={35}
                        value={loan.remainingYears}
                        onChange={e => handleUpdateLoan(loan.id, { remainingYears: Math.max(1, Number(e.target.value) || 1) })}
                        className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-lg bg-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add New Loan Form */}
            <form noValidate onSubmit={handleAddLoan} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3 text-xs">
              <div className="font-bold text-slate-800">
                + Add New Loan (Mortgage, Auto, Personal, Education, Business)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5 items-start">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Loan Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Home Mortgage"
                    value={newLoan.name}
                    onChange={e => setNewLoan({ ...newLoan, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Category</label>
                  <select
                    value={newLoan.category}
                    onChange={e => setNewLoan({ ...newLoan, category: e.target.value as any })}
                    className="w-full px-2.5 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Home / Mortgage">Home / Mortgage</option>
                    <option value="Car / Vehicle">Car / Vehicle</option>
                    <option value="Personal / Credit">Personal / Credit</option>
                    <option value="Education">Education Loan</option>
                    <option value="Business / Investment">Business / Investment</option>
                    <option value="Other">Other Liability</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    Principal ({inputCurrencyMode === 'LOCAL' && countryMacro.currencyCode !== 'USD' ? countryMacro.currencyCode : 'USD'})
                  </label>
                  <CurrencyAmountInput
                    usdValue={newLoan.principalInput}
                    onChangeUsd={val => setNewLoan({ ...newLoan, principalInput: val })}
                    currencyMode={inputCurrencyMode}
                    countryMacro={countryMacro}
                    inputSize="sm"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    Monthly EMI ({inputCurrencyMode === 'LOCAL' && countryMacro.currencyCode !== 'USD' ? countryMacro.currencyCode : 'USD'})
                  </label>
                  <CurrencyAmountInput
                    usdValue={newLoan.emiInput}
                    onChangeUsd={val => setNewLoan({ ...newLoan, emiInput: val })}
                    currencyMode={inputCurrencyMode}
                    countryMacro={countryMacro}
                    inputSize="sm"
                    helperSuffix="/mo"
                  />
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">APR %</label>
                    <input
                      type="number"
                      step="any"
                      min={0}
                      max={35}
                      required
                      value={newLoan.interestRatePercent}
                      onChange={e => setNewLoan({ ...newLoan, interestRatePercent: Number(e.target.value) })}
                      className="w-full px-2 py-2 font-mono border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Yrs Left</label>
                    <input
                      type="number"
                      step="any"
                      min={1}
                      max={35}
                      required
                      value={newLoan.remainingYears}
                      onChange={e => setNewLoan({ ...newLoan, remainingYears: Number(e.target.value) })}
                      className="w-full px-2 py-2 font-mono border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                </div>
                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full px-3 py-2 rounded-lg bg-rose-700 hover:bg-rose-800 text-white font-bold flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add & Recalculate</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* TAB 4: SIDE & PASSIVE INCOME STREAMS (DIRECTLY EDITABLE) */}
        {activeLedgerTab === 'side-income' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-200/80 text-xs">
              <div>
                <span className="font-bold text-emerald-950">
                  Auto-Calculated Total Side Income: {formatDualCurrency(fireAnalysis.activeSideMonthlyUSD, countryMacro, false)}/mo
                </span>
                <span className="text-slate-600 ml-2">
                  · Continuing in Retirement: <strong>{formatDualCurrency(fireAnalysis.retirementContinuingPassiveMonthlyUSD, countryMacro, false)}/mo</strong> (Reduces required FIRE corpus by {formatDualCurrency(Math.round((fireAnalysis.retirementContinuingPassiveMonthlyUSD * 12) / (swrPct / 100)), countryMacro)})
                </span>
              </div>
              <button
                type="button"
                onClick={() => persistFireUpdates({}, 'Saved & Recalculated Side Incomes!')}
                className="px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer shrink-0"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Save & Recalculate</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(finances.sideIncomes || []).map(side => (
                <div
                  key={side.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2.5 text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">
                          Income Stream Name
                        </label>
                        <input
                          type="text"
                          value={side.name}
                          onChange={e => handleUpdateSideIncome(side.id, { name: e.target.value })}
                          className="w-full px-2.5 py-1.5 text-xs font-bold text-slate-900 border border-slate-300 rounded-lg bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">
                          Category
                        </label>
                        <select
                          value={side.category}
                          onChange={e => handleUpdateSideIncome(side.id, { category: e.target.value as any })}
                          className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                        >
                          <option value="Dividends & Interest">Dividends & Interest</option>
                          <option value="Rental Property">Rental Property</option>
                          <option value="Side Business / Consulting">Side Business / Consulting</option>
                          <option value="Pension / Annuity">Pension / Annuity</option>
                          <option value="Royalties / Other">Royalties / Other</option>
                        </select>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveSideIncome(side.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 shrink-0"
                      title="Remove side income"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 items-center">
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 uppercase block mb-0.5">
                        Monthly Amount ({inputCurrencyMode === 'LOCAL' && countryMacro.currencyCode !== 'USD' ? countryMacro.currencyCode : 'USD'})
                      </label>
                      <CurrencyAmountInput
                        usdValue={side.monthlyAmountUSD}
                        onChangeUsd={val => handleUpdateSideIncome(side.id, { monthlyAmountUSD: Math.round(val) })}
                        currencyMode={inputCurrencyMode}
                        countryMacro={countryMacro}
                        inputSize="sm"
                        helperSuffix="/mo"
                      />
                    </div>
                    <div className="pt-3">
                      <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer p-2 rounded-lg bg-white border border-slate-200">
                        <input
                          type="checkbox"
                          checked={side.continuesInRetirement}
                          onChange={e => handleUpdateSideIncome(side.id, { continuesInRetirement: e.target.checked })}
                          className="rounded accent-emerald-600"
                        />
                        <span>Continues in Retirement</span>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add New Side Income Form */}
            <form noValidate onSubmit={handleAddSideIncome} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3 text-xs">
              <div className="font-bold text-slate-800">
                + Add Side / Passive Income Stream (Dividends, Rental, Business, Pension)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-start">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Stream Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rental Unit"
                    value={newSideIncome.name}
                    onChange={e => setNewSideIncome({ ...newSideIncome, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Category</label>
                  <select
                    value={newSideIncome.category}
                    onChange={e => setNewSideIncome({ ...newSideIncome, category: e.target.value as any })}
                    className="w-full px-2.5 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Dividends & Interest">Dividends & Interest</option>
                    <option value="Rental Property">Rental Property</option>
                    <option value="Side Business / Consulting">Side Business / Consulting</option>
                    <option value="Pension / Annuity">Pension / Annuity</option>
                    <option value="Royalties / Other">Royalties / Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    Monthly Amount ({inputCurrencyMode === 'LOCAL' && countryMacro.currencyCode !== 'USD' ? countryMacro.currencyCode : 'USD'})
                  </label>
                  <CurrencyAmountInput
                    usdValue={newSideIncome.monthlyInput}
                    onChangeUsd={val => setNewSideIncome({ ...newSideIncome, monthlyInput: val })}
                    currencyMode={inputCurrencyMode}
                    countryMacro={countryMacro}
                    inputSize="sm"
                    helperSuffix="/mo"
                  />
                </div>
                <div className="pt-5">
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newSideIncome.continuesInRetirement}
                      onChange={e => setNewSideIncome({ ...newSideIncome, continuesInRetirement: e.target.checked })}
                      className="rounded accent-emerald-600"
                    />
                    <span>Continues in Retirement</span>
                  </label>
                </div>
                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add & Recalculate</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </section>
  );
};
