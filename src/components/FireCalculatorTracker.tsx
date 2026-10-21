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
import {
  Flame, TrendingUp, DollarSign, ShieldAlert, CheckCircle2, Plus, Trash2,
  Sparkles, Calendar, Award, Sliders, ArrowRight, RefreshCw, Landmark,
  Briefcase, GraduationCap, HeartHandshake, ShieldCheck, AlertTriangle,
  Zap, Globe, PiggyBank, Percent, Clock, Check, ChevronRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';

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
    finances.monthlySalaryUSD || Math.round((finances.currentSalaryUSD || 120000) / 12)
  );
  const [monthlyCurrentExpensesUSD, setMonthlyCurrentExpensesUSD] = useState<number>(
    finances.monthlyCurrentExpensesUSD ?? defaultResidingMonthlyExpenseUSD
  );
  const [monthlySipUSD, setMonthlySipUSD] = useState<number>(finances.monthlySipUSD ?? 2800);
  const [sipStepUpPct, setSipStepUpPct] = useState<number>(finances.annualSipStepUpPercent ?? 8);
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
  const [investmentsDraft, setInvestmentsDraft] = useState<UserFinancialPortfolio['investments']>({
    savingsUSD: finances.investments.savingsUSD || 0,
    stocksMutualFundsUSD: finances.investments.stocksMutualFundsUSD || 0,
    realEstateUSD: finances.investments.realEstateUSD || 0,
    goldUSD: finances.investments.goldUSD || 0,
    othersUSD: finances.investments.othersUSD || 0,
  });
  const [showAssetsEditorInFire, setShowAssetsEditorInFire] = useState<boolean>(false);

  const [baseMonthlyExpenseTodayUSD, setBaseMonthlyExpenseTodayUSD] = useState<number>(
    costBasisMode === 'residing'
      ? (finances.monthlyCurrentExpensesUSD ?? defaultResidingMonthlyExpenseUSD)
      : defaultTargetHavenMonthlyExpenseUSD
  );

  // Sync interactive states when external profile finances change
  useEffect(() => {
    setCurrentAge(finances.currentAge || 42);
    setTargetFireAge(finances.targetFireAge || 50);
    setMonthlySalaryUSD(
      finances.monthlySalaryUSD || Math.round((finances.currentSalaryUSD || 120000) / 12)
    );
    const nextCurrentExp =
      finances.monthlyCurrentExpensesUSD ?? defaultResidingMonthlyExpenseUSD;
    setMonthlyCurrentExpensesUSD(nextCurrentExp);
    if (costBasisMode === 'residing') {
      setBaseMonthlyExpenseTodayUSD(nextCurrentExp);
    }
    setMonthlySipUSD(finances.monthlySipUSD ?? 2800);
    setSipStepUpPct(finances.annualSipStepUpPercent ?? 8);
    setSwrPct(finances.safeWithdrawalRatePercent || 4.0);
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
    finances.monthlySipUSD,
    finances.annualSipStepUpPercent,
    finances.safeWithdrawalRatePercent,
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
      setBaseMonthlyExpenseTodayUSD(nextExp);
    }
  };

  const handleSwitchCostBasis = (mode: 'residing' | 'target-haven') => {
    setCostBasisMode(mode);
    if (mode === 'residing') {
      setBaseMonthlyExpenseTodayUSD(monthlyCurrentExpensesUSD || defaultResidingMonthlyExpenseUSD);
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
    const cleanMonthlySalary = Math.round(monthlySalaryUSD || 0);
    const cleanCurrentExpenses = Math.round(monthlyCurrentExpensesUSD || 0);

    updateUserProfile({
      residingCountry: selectedBasisCountry,
      monthlyBudgetUSD: Math.round(baseMonthlyExpenseTodayUSD || cleanCurrentExpenses || 2400),
      finances: {
        ...finances,
        currentAge: Math.round(currentAge || 42),
        targetFireAge: Math.round(targetFireAge || 50),
        monthlySalaryUSD: cleanMonthlySalary,
        currentSalaryUSD: cleanMonthlySalary * 12,
        monthlyCurrentExpensesUSD: cleanCurrentExpenses,
        monthlySipUSD: Math.round(monthlySipUSD || 0),
        annualSipStepUpPercent: Number(sipStepUpPct) || 0,
        inflationRatePercent: Number(inflationPct) || countryMacro.defaultInflationPercent,
        expectedReturnRatePercent: Number(expectedReturnPct) || countryMacro.defaultReturnPercent,
        safeWithdrawalRatePercent: Number(swrPct) || 4.0,
        includePrimaryHomeInFire: includePrimaryHome,
        investments: {
          savingsUSD: Math.round(investmentsDraft.savingsUSD || 0),
          stocksMutualFundsUSD: Math.round(investmentsDraft.stocksMutualFundsUSD || 0),
          realEstateUSD: Math.round(investmentsDraft.realEstateUSD || 0),
          goldUSD: Math.round(investmentsDraft.goldUSD || 0),
          othersUSD: Math.round(investmentsDraft.othersUSD || 0),
        },
        totalLiabilitiesUSD: totalLoansPrincipal,
        additionalMonthlyPassiveUSD: totalPassive,
        ...partialFinances,
        updatedAt: new Date().toISOString().split('T')[0],
      },
    });
    if (toastMsg) triggerToast(toastMsg);
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

    const liquidAssets = savings + stocks + gold + others;
    const totalGrossAssets = liquidAssets + realEstate;

    const loansList = finances.loans || [];
    const totalLoanPrincipalUSD = Math.round(
      loansList.reduce((s, l) => s + (l.outstandingPrincipalUSD || 0), 0)
    );
    const totalMonthlyEmiUSD = Math.round(
      loansList.reduce((s, l) => s + (l.monthlyEmiUSD || 0), 0)
    );

    // Starting FIRE Corpus Today (Net of loan liabilities if included, or starting investable corpus)
    const startingCorpusTodayUSD = Math.max(
      0,
      (includePrimaryHome ? totalGrossAssets : liquidAssets) - totalLoanPrincipalUSD
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
    const fireProgressPct = Math.min(
      150,
      Math.max(0, Math.round((startingCorpusTodayUSD / Math.max(1, comprehensiveFireNumberTodayUSD)) * 100))
    );

    // 2. Year-by-Year Nominal & Real Wealth Trajectory Simulation (25-Year Horizon)
    const trajectory: {
      year: number;
      age: number;
      projectedCorpusUSD: number;
      fireTargetUSD: number;
      milestonesDeductedUSD: number;
      annualSipInvestedUSD: number;
      freedEmiBonusUSD: number;
    }[] = [];

    let simCorpusNominal = startingCorpusTodayUSD;
    let simMonthlySip = monthlySipUSD;
    let crossoverYear: number | null =
      startingCorpusTodayUSD >= activeFireTargetTodayUSD ? currentYear : null;
    let crossoverAge: number | null =
      startingCorpusTodayUSD >= activeFireTargetTodayUSD ? currentAge : null;
    let yearsToFireExact = startingCorpusTodayUSD >= activeFireTargetTodayUSD ? 0 : -1;

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

      // Milestones occurring in this specific year
      const yearMilestonesUSD = enrichedGoals
        .filter(g => g.targetYear === yr)
        .reduce((s, g) => s + g.inflatedCostUSD, 0);

      // Loans already paid off by this year -> freed EMI automatically boosts investment capacity!
      const freedMonthlyEmiUSD = loansList
        .filter(l => yrOffset >= l.remainingYears)
        .reduce((s, l) => s + (l.monthlyEmiUSD || 0), 0);

      const annualSipContribution = Math.round((simMonthlySip + freedMonthlyEmiUSD) * 12);

      if (yrOffset > 0) {
        const prevCorpus = simCorpusNominal;
        simCorpusNominal = Math.max(
          0,
          Math.round(
            prevCorpus * (1 + nominalReturnDec) + annualSipContribution - yearMilestonesUSD
          )
        );

        // Check if FIRE crossover happened during this year
        if (crossoverYear === null && simCorpusNominal >= dynamicFireTargetNominal) {
          crossoverYear = yr;
          crossoverAge = age;
          const prevGap = Math.max(0, dynamicFireTargetNominal - prevCorpus);
          const yearGain = Math.max(1, simCorpusNominal - prevCorpus);
          const fraction = Math.min(1, prevGap / yearGain);
          yearsToFireExact = Math.round(((yrOffset - 1 + fraction) * 10)) / 10;
        }

        // Step up monthly SIP for next year
        simMonthlySip = simMonthlySip * (1 + sipStepUpPct / 100);
      } else {
        // Deduct any current-year milestone if applicable
        simCorpusNominal = Math.max(0, simCorpusNominal - yearMilestonesUSD);
        if (simCorpusNominal >= dynamicFireTargetNominal) {
          crossoverYear = yr;
          crossoverAge = age;
          yearsToFireExact = 0;
        }
      }

      trajectory.push({
        year: yr,
        age,
        projectedCorpusUSD: simCorpusNominal,
        fireTargetUSD: dynamicFireTargetNominal,
        milestonesDeductedUSD: yearMilestonesUSD,
        annualSipInvestedUSD: yrOffset === 0 ? monthlySipUSD * 12 : annualSipContribution,
        freedEmiBonusUSD: freedMonthlyEmiUSD * 12,
      });
    }

    if (yearsToFireExact < 0) {
      yearsToFireExact = 25.5;
    }

    // 3. Helper to quickly simulate years-to-FIRE for "What-If" Accelerator Levers
    const simulateYearsForScenario = (
      customSipUSD: number,
      customStepUpPct: number,
      customBaseExpenseUSD: number,
      customReturnPct: number,
      prepayHighInterestLoanUSD = 0
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
        c = Math.max(
          0,
          c * (1 + customReturnPct / 100) + (sip + freedEmi) * 12 - milestones
        );
        sip = sip * (1 + customStepUpPct / 100);
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
    const monthlySalary = Math.round(monthlySalaryUSD || 0);
    const currentExpensesMo = Math.round(monthlyCurrentExpensesUSD || 0);
    const totalMonthlyInflow = monthlySalary + activeSideMonthlyUSD;
    const totalMonthlyOutflow = currentExpensesMo + totalMonthlyEmiUSD + monthlySipUSD;
    const unallocatedMonthlySurplusUSD = totalMonthlyInflow - totalMonthlyOutflow;
    const expenseToIncomePct =
      totalMonthlyInflow > 0
        ? Math.round(((currentExpensesMo + totalMonthlyEmiUSD) / totalMonthlyInflow) * 100)
        : 0;
    const savingsRatePct =
      totalMonthlyInflow > 0 ? Math.round((monthlySipUSD / totalMonthlyInflow) * 100) : 0;
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
      monthlySipUSD + trim15SavingsUSD,
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

    if (savingsRatePct >= 25) {
      strengths.push({
        title: `Strong Monthly SIP Rate (${savingsRatePct}% of Inflow)`,
        detail: `You are systematically investing ${formatDualCurrency(monthlySipUSD, countryMacro)} every month with a ${sipStepUpPct}% annual step-up.`,
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

    return {
      startingCorpusTodayUSD,
      liquidAssets,
      totalGrossAssets,
      totalLoanPrincipalUSD,
      totalMonthlyEmiUSD,
      activeSideMonthlyUSD,
      retirementContinuingPassiveMonthlyUSD,
      currentExpensesMo,
      totalMonthlyInflow,
      totalMonthlyOutflow,
      unallocatedMonthlySurplusUSD,
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
    inflationPct,
    expectedReturnPct,
    swrPct,
    includePrimaryHome,
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
    <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-7">
      
      {/* Top Header & Residing Country / Dual-Currency Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 via-amber-500 to-purple-600 flex items-center justify-center text-white shadow-xs">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  FIRE Calculator, Milestone Planner & Independence Tracker
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-950 border border-orange-200 uppercase tracking-wider">
                  {getWorldCountryFlag(selectedBasisCountry)} {selectedBasisCountry} ({countryMacro.currencyCode}) + $ USD Dual Ledger
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Calculates your exact Financial Independence number using your <strong>Residing Country ({selectedBasisCountry})</strong> inflation ({inflationPct}%), expected returns ({expectedReturnPct}%), Monthly Current Expenses, Monthly SIPs, Loans, Side Income, and Future Family Milestones.
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
                'Saved & Recalculated! All FIRE parameters, Monthly Current Expenses, assets, salary, and milestones are updated.'
              )
            }
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-600 via-amber-600 to-purple-600 text-white hover:from-orange-700 hover:to-purple-700 transition-all text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Save & Recalculate FIRE Plan</span>
          </button>
        </div>
      </div>

      {savedToast && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{savedToast}</span>
        </div>
      )}

      {/* Top 4 Dual-Currency FIRE KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Current Net FIRE Corpus */}
        <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              1. Current Net FIRE Corpus
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-teal-100 text-teal-800">
              {fireAnalysis.fireProgressPct}% of Target
            </span>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-extrabold font-mono text-slate-900 tabular-nums">
              {countryMacro.currencyCode !== 'USD'
                ? formatLocalCurrency(fireAnalysis.startingCorpusTodayUSD, countryMacro, true)
                : `$${fireAnalysis.startingCorpusTodayUSD.toLocaleString()}`}
            </div>
            <div className="text-xs font-mono text-slate-600 font-semibold mt-0.5">
              ${fireAnalysis.startingCorpusTodayUSD.toLocaleString()} USD
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-200/80 text-[11px] text-slate-500 flex items-center justify-between">
            <span>{includePrimaryHome ? 'Includes Home Equity' : 'Liquid Assets Net of Debt'}</span>
            <button
              type="button"
              onClick={() => setIncludePrimaryHome(!includePrimaryHome)}
              className="text-orange-700 font-semibold hover:underline"
            >
              {includePrimaryHome ? 'Exclude Home' : '+ Include Home'}
            </button>
          </div>
        </div>

        {/* KPI 2: Required Total FIRE Number (Living + Milestones) */}
        <div className="p-5 rounded-xl border-2 border-orange-400/60 bg-gradient-to-br from-orange-50/70 via-amber-50/30 to-purple-50/40 flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-orange-950 uppercase tracking-wider">
              2. Target {fireTier.toUpperCase()} FIRE Corpus
            </span>
            <Flame className="w-4 h-4 text-orange-600" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-extrabold font-mono text-orange-950 tabular-nums">
              {countryMacro.currencyCode !== 'USD'
                ? formatLocalCurrency(fireAnalysis.comprehensiveFireNumberTodayUSD, countryMacro, true)
                : `$${fireAnalysis.comprehensiveFireNumberTodayUSD.toLocaleString()}`}
            </div>
            <div className="text-xs font-mono text-purple-900 font-semibold mt-0.5">
              ${fireAnalysis.comprehensiveFireNumberTodayUSD.toLocaleString()} USD
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-orange-200/70 text-[11px] text-orange-950/80 flex items-center justify-between">
            <span>Current Exp: ${fireAnalysis.currentExpensesMo.toLocaleString()}/mo</span>
            <span className="font-mono font-bold">{swrPct.toFixed(1)}% SWR</span>
          </div>
        </div>

        {/* KPI 3: Monthly Current Expenses & Monthly SIP */}
        <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              3. MonthlySIP & Current Expenses
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              {fireAnalysis.savingsRatePct}% SIP Rate
            </span>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-extrabold font-mono text-emerald-800 tabular-nums">
              {countryMacro.currencyCode !== 'USD'
                ? `${formatLocalCurrency(monthlySipUSD, countryMacro, false)}/mo`
                : `$${monthlySipUSD.toLocaleString()}/mo`}
            </div>
            <div className="text-xs font-mono text-slate-600 font-semibold mt-0.5">
              SIP: ${monthlySipUSD.toLocaleString()}/mo · +{sipStepUpPct}%/yr step-up
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-200/80 text-[11px] text-slate-600 flex items-center justify-between">
            <span>Monthly Current Expenses:</span>
            <span className="font-mono font-bold text-rose-700">
              {countryMacro.currencyCode !== 'USD'
                ? `${formatLocalCurrency(fireAnalysis.currentExpensesMo, countryMacro, false)} ($${fireAnalysis.currentExpensesMo.toLocaleString()})`
                : `$${fireAnalysis.currentExpensesMo.toLocaleString()}/mo`}
            </span>
          </div>
        </div>

        {/* KPI 4: Countdown & Distance to FIRE */}
        <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              4. Time & Distance to FIRE
            </span>
            <Clock className="w-4 h-4 text-purple-600" />
          </div>
          <div>
            {fireAnalysis.yearsToFireExact === 0 ? (
              <>
                <div className="text-xl sm:text-2xl font-extrabold text-emerald-700">
                  FIRE Achieved! 🎉
                </div>
                <div className="text-xs font-mono text-emerald-800 font-semibold mt-0.5">
                  Surplus: {formatDualCurrency(Math.abs(gapOrSurplusUSD), countryMacro)}
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
                  Gap: {formatDualCurrency(Math.abs(gapOrSurplusUSD), countryMacro)}
                </div>
              </>
            )}
          </div>
          <div className="mt-3 pt-2 border-t border-slate-200/80 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Projected FIRE Age:</span>
            <span className="font-mono font-bold text-slate-900">
              {fireAnalysis.crossoverAge ? `Age ${fireAnalysis.crossoverAge}` : `Age ${currentAge + 25}+`} (Goal: {targetFireAge})
            </span>
          </div>
        </div>

      </div>

      {/* CURRENT MONTHLY CASH FLOW & EXPENSE LEDGER BAR */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-orange-50/70 via-amber-50/40 to-purple-50/50 border border-orange-200/80 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-orange-600" />
            <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
              Current Monthly Income, Monthly Current Expenses & SIP Cash-Flow Ledger
            </span>
          </div>
          <span className="text-[11px] text-slate-600">
            Emergency Buffer: <strong className="font-mono text-teal-800">{fireAnalysis.emergencyMonths} months</strong> of Current Expenses + Loan EMIs covered by Savings
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
          <div className="p-2.5 rounded-lg bg-white border border-slate-200/90">
            <span className="text-[10px] font-bold uppercase text-slate-500 block">
              1. Total Monthly Inflow
            </span>
            <div className="font-mono font-extrabold text-slate-900 text-sm mt-0.5">
              {formatDualCurrency(fireAnalysis.totalMonthlyInflow, countryMacro, false)}
            </div>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              Salary + ${fireAnalysis.activeSideMonthlyUSD.toLocaleString()} side income
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-white border-2 border-rose-300/80 shadow-2xs">
            <span className="text-[10px] font-bold uppercase text-rose-800 block">
              2. Monthly Current Expenses
            </span>
            <div className="font-mono font-extrabold text-rose-700 text-sm mt-0.5">
              {formatDualCurrency(fireAnalysis.currentExpensesMo, countryMacro, false)}
            </div>
            <span className="text-[10px] text-rose-700/80 block mt-0.5">
              Household & living ({Math.round((fireAnalysis.currentExpensesMo / Math.max(1, fireAnalysis.totalMonthlyInflow)) * 100)}% of inflow)
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-white border border-slate-200/90">
            <span className="text-[10px] font-bold uppercase text-slate-500 block">
              3. Monthly Loan EMIs
            </span>
            <div className="font-mono font-extrabold text-amber-800 text-sm mt-0.5">
              {formatDualCurrency(fireAnalysis.totalMonthlyEmiUSD, countryMacro, false)}
            </div>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              Across {finances.loans?.length || 0} active loan(s)
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-white border border-emerald-200">
            <span className="text-[10px] font-bold uppercase text-emerald-800 block">
              4. Monthly SIP Invested
            </span>
            <div className="font-mono font-extrabold text-emerald-700 text-sm mt-0.5">
              {formatDualCurrency(monthlySipUSD, countryMacro, false)}
            </div>
            <span className="text-[10px] text-emerald-700/80 block mt-0.5">
              {fireAnalysis.savingsRatePct}% of monthly inflow
            </span>
          </div>

          <div className={`p-2.5 rounded-lg border flex flex-col justify-between ${fireAnalysis.unallocatedMonthlySurplusUSD >= 0 ? 'bg-white border-teal-200' : 'bg-rose-50/60 border-rose-300'}`}>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-600 block">
                5. Unallocated Cash Flow
              </span>
              <div className={`font-mono font-extrabold text-sm mt-0.5 ${fireAnalysis.unallocatedMonthlySurplusUSD >= 0 ? 'text-teal-800' : 'text-rose-700'}`}>
                {fireAnalysis.unallocatedMonthlySurplusUSD >= 0 ? '+' : ''}
                {formatDualCurrency(fireAnalysis.unallocatedMonthlySurplusUSD, countryMacro, false)}
              </div>
            </div>
            {fireAnalysis.unallocatedMonthlySurplusUSD >= 100 ? (
              <button
                type="button"
                onClick={() => {
                  const nextSip = monthlySipUSD + fireAnalysis.unallocatedMonthlySurplusUSD;
                  setMonthlySipUSD(nextSip);
                  persistFireUpdates(
                    { monthlySipUSD: nextSip },
                    `Added unallocated surplus (+$${fireAnalysis.unallocatedMonthlySurplusUSD.toLocaleString()}/mo) to Monthly SIP!`
                  );
                }}
                className="mt-1 text-[10px] font-bold text-orange-700 hover:underline text-left cursor-pointer"
              >
                + Roll Surplus into SIP →
              </button>
            ) : (
              <span className="text-[10px] text-slate-500 block mt-0.5">
                {fireAnalysis.unallocatedMonthlySurplusUSD >= 0 ? 'Fully allocated' : 'Exceeds monthly inflow'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* VISUAL FIRE PROGRESS SCALE & MILESTONE THERMOMETER */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                FIRE Independence Thermometer & Tier Scale
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              {fireAnalysis.yearsToFireExact === 0
                ? `Congratulations! Your current corpus covers 100%+ of your ${fireTier.toUpperCase()} FIRE target including future family milestones.`
                : `You have completed ${fireAnalysis.fireProgressPct}% of your journey toward ${fireTier.toUpperCase()} FIRE in ${costBasisMode === 'residing' ? selectedBasisCountry : targetHavenCountryName}.`}
            </p>
          </div>

          {/* FIRE Tier Selector Pills */}
          <div className="inline-flex flex-wrap rounded-xl bg-white/10 p-1 text-xs font-semibold gap-1">
            {[
              { id: 'barista', label: 'Barista FIRE (72%)' },
              { id: 'lean', label: 'Lean FIRE (80%)' },
              { id: 'standard', label: 'Standard FIRE (100%)' },
              { id: 'fat', label: 'Fat FIRE (135%)' },
            ].map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => setFireTier(t.id as FireTierMode)}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  fireTier === t.id
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-extrabold shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Progress Bar Track */}
        <div className="space-y-2">
          <div className="w-full h-4 rounded-full bg-white/15 overflow-hidden relative p-0.5">
            <div
              style={{ width: `${Math.min(100, fireAnalysis.fireProgressPct)}%` }}
              className="h-full rounded-full bg-gradient-to-r from-orange-500 via-amber-400 to-emerald-400 transition-all duration-500"
            />
          </div>

          {/* 4 Milestone Stage Cards Under Scale */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-xs">
            <div className={`p-2.5 rounded-xl border ${fireAnalysis.startingCorpusTodayUSD >= fireAnalysis.coastFireTargetTodayUSD ? 'bg-emerald-500/20 border-emerald-400/50' : 'bg-white/5 border-white/10'}`}>
              <div className="flex items-center justify-between text-[10px] font-bold uppercase text-amber-300">
                <span>Stage 1: Coast FIRE</span>
                {fireAnalysis.startingCorpusTodayUSD >= fireAnalysis.coastFireTargetTodayUSD && <Check className="w-3.5 h-3.5 text-emerald-400" />}
              </div>
              <div className="font-mono font-bold text-sm mt-0.5">
                {formatDualCurrency(fireAnalysis.coastFireTargetTodayUSD, countryMacro)}
              </div>
            </div>

            <div className={`p-2.5 rounded-xl border ${fireAnalysis.startingCorpusTodayUSD >= fireAnalysis.leanFireTargetTodayUSD ? 'bg-emerald-500/20 border-emerald-400/50' : 'bg-white/5 border-white/10'}`}>
              <div className="flex items-center justify-between text-[10px] font-bold uppercase text-amber-300">
                <span>Stage 2: Lean FIRE</span>
                {fireAnalysis.startingCorpusTodayUSD >= fireAnalysis.leanFireTargetTodayUSD && <Check className="w-3.5 h-3.5 text-emerald-400" />}
              </div>
              <div className="font-mono font-bold text-sm mt-0.5">
                {formatDualCurrency(fireAnalysis.leanFireTargetTodayUSD + fireAnalysis.totalFutureGoalsTodayUSD, countryMacro)}
              </div>
            </div>

            <div className={`p-2.5 rounded-xl border ${fireAnalysis.startingCorpusTodayUSD >= fireAnalysis.standardFireTargetTodayUSD + fireAnalysis.totalFutureGoalsTodayUSD ? 'bg-emerald-500/20 border-emerald-400/50' : 'bg-white/5 border-white/10'}`}>
              <div className="flex items-center justify-between text-[10px] font-bold uppercase text-amber-300">
                <span>Stage 3: Standard FIRE</span>
                {fireAnalysis.startingCorpusTodayUSD >= fireAnalysis.standardFireTargetTodayUSD + fireAnalysis.totalFutureGoalsTodayUSD && <Check className="w-3.5 h-3.5 text-emerald-400" />}
              </div>
              <div className="font-mono font-bold text-sm mt-0.5">
                {formatDualCurrency(fireAnalysis.standardFireTargetTodayUSD + fireAnalysis.totalFutureGoalsTodayUSD, countryMacro)}
              </div>
            </div>

            <div className={`p-2.5 rounded-xl border ${fireAnalysis.startingCorpusTodayUSD >= fireAnalysis.fatFireTargetTodayUSD + fireAnalysis.totalFutureGoalsTodayUSD ? 'bg-emerald-500/20 border-emerald-400/50' : 'bg-white/5 border-white/10'}`}>
              <div className="flex items-center justify-between text-[10px] font-bold uppercase text-amber-300">
                <span>Stage 4: Fat FIRE</span>
                {fireAnalysis.startingCorpusTodayUSD >= fireAnalysis.fatFireTargetTodayUSD + fireAnalysis.totalFutureGoalsTodayUSD && <Check className="w-3.5 h-3.5 text-emerald-400" />}
              </div>
              <div className="font-mono font-bold text-sm mt-0.5">
                {formatDualCurrency(fireAnalysis.fatFireTargetTodayUSD + fireAnalysis.totalFutureGoalsTodayUSD, countryMacro)}
              </div>
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
              Interactive Country, Monthly Current Expenses, Inflation, Return & SIP Simulation Filters
            </span>
          </div>

          {/* Cost of Living Basis Switcher: Residing Country vs Target Haven */}
          <div className="inline-flex rounded-xl border border-slate-200 p-0.5 bg-white text-[11px] font-semibold">
            <button
              type="button"
              onClick={() => handleSwitchCostBasis('residing')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                costBasisMode === 'residing'
                  ? 'bg-slate-900 text-white font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Retire in Residing Country ({getWorldCountryFlag(selectedBasisCountry)} {selectedBasisCountry})
            </button>
            <button
              type="button"
              onClick={() => handleSwitchCostBasis('target-haven')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                costBasisMode === 'target-haven'
                  ? 'bg-gradient-to-r from-orange-600 to-purple-600 text-white font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Geo-Arbitrage in Target Haven ({getWorldCountryFlag(targetHavenCountryName)} {targetHavenCountryName})
            </button>
          </div>
        </div>

        {/* Row 1: Residing Country Selector, Current & Target Age, Current Monthly Salary, Monthly Current Expenses, Monthly SIP, Base Retirement Expense */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
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
            <span className="text-[10px] font-mono text-slate-500 mt-1 block">
              {countryMacro.currencyCode !== 'USD'
                ? `1 USD = ${countryMacro.symbol.trim()}${countryMacro.rateToUSD} ${countryMacro.currencyCode}`
                : 'Base: $ USD'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Current Age</label>
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
              <label className="font-semibold text-slate-700 block mb-1">Target FIRE Age</label>
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

          <div>
            <div className="flex justify-between mb-1">
              <span className="font-semibold text-slate-700">
                Current Monthly Salary ({inputCurrencyMode === 'LOCAL' && countryMacro.currencyCode !== 'USD' ? countryMacro.currencyCode : 'USD'})
              </span>
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

          <div>
            <div className="flex justify-between mb-1">
              <span className="font-bold text-rose-800">
                Monthly Current Expenses ({inputCurrencyMode === 'LOCAL' && countryMacro.currencyCode !== 'USD' ? countryMacro.currencyCode : 'USD'})
              </span>
            </div>
            <CurrencyAmountInput
              usdValue={monthlyCurrentExpensesUSD}
              onChangeUsd={val => {
                setMonthlyCurrentExpensesUSD(val);
                if (costBasisMode === 'residing') {
                  setBaseMonthlyExpenseTodayUSD(val);
                }
              }}
              currencyMode={inputCurrencyMode}
              countryMacro={countryMacro}
              inputSize="sm"
              helperSuffix="/mo"
            />
            <input
              type="range"
              min={300}
              max={20000}
              step={50}
              value={Math.min(20000, Math.round(monthlyCurrentExpensesUSD))}
              onChange={e => {
                const nextVal = Number(e.target.value);
                setMonthlyCurrentExpensesUSD(nextVal);
                if (costBasisMode === 'residing') {
                  setBaseMonthlyExpenseTodayUSD(nextVal);
                }
              }}
              className="w-full accent-rose-600 cursor-pointer mt-1.5"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="font-semibold text-slate-700">
                Monthly SIP ({inputCurrencyMode === 'LOCAL' && countryMacro.currencyCode !== 'USD' ? countryMacro.currencyCode : 'USD'})
              </span>
            </div>
            <CurrencyAmountInput
              usdValue={monthlySipUSD}
              onChangeUsd={val => setMonthlySipUSD(val)}
              currencyMode={inputCurrencyMode}
              countryMacro={countryMacro}
              inputSize="sm"
              helperSuffix="/mo"
            />
            <input
              type="range"
              min={0}
              max={25000}
              step={50}
              value={Math.min(25000, Math.round(monthlySipUSD))}
              onChange={e => setMonthlySipUSD(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer mt-1.5"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-slate-700">
                {costBasisMode === 'residing' ? 'Retirement Expense/mo' : `${targetHavenCountryName} Expense/mo`}
              </span>
              {baseMonthlyExpenseTodayUSD !== monthlyCurrentExpensesUSD && (
                <button
                  type="button"
                  onClick={() => setBaseMonthlyExpenseTodayUSD(monthlyCurrentExpensesUSD)}
                  className="text-[10px] font-bold text-orange-700 hover:underline cursor-pointer"
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
            <input
              type="range"
              min={300}
              max={20000}
              step={50}
              value={Math.min(20000, Math.round(baseMonthlyExpenseTodayUSD))}
              onChange={e => setBaseMonthlyExpenseTodayUSD(Number(e.target.value))}
              className="w-full accent-orange-600 cursor-pointer mt-1.5"
            />
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
                <label className="font-semibold text-indigo-900 block mb-1 text-[11px]">
                  3. Real Estate Equity
                </label>
                <CurrencyAmountInput
                  usdValue={investmentsDraft.realEstateUSD}
                  onChangeUsd={val => setInvestmentsDraft(prev => ({ ...prev, realEstateUSD: val }))}
                  currencyMode={inputCurrencyMode}
                  countryMacro={countryMacro}
                  inputSize="sm"
                />
              </div>
              <div>
                <label className="font-semibold text-amber-900 block mb-1 text-[11px]">
                  4. Gold & Bullion
                </label>
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
              All values above auto-calculate your <strong>Target FIRE Corpus ({formatDualCurrency(fireAnalysis.comprehensiveFireNumberTodayUSD, countryMacro, true)})</strong> and <strong>Countdown ({fireAnalysis.yearsToFireExact === 0 ? 'Achieved!' : `${fireAnalysis.yearsToFireExact} yrs`})</strong> in real time.
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
              <span>Save & Recalculate FIRE Plan</span>
            </button>
          </div>
        </div>
      </div>

      {/* WEALTH & FIRE CROSSOVER TRAJECTORY CHART */}
      <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-orange-600" />
              <span>25-Year FIRE Wealth Compounding vs. Inflation-Adjusted Target</span>
            </h3>
            <p className="text-xs text-slate-500">
              Includes your Monthly SIPs (+{sipStepUpPct}%/yr step-up), automatic EMI roll-ins as loans pay off, and deductions for Future Family Milestones.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-teal-800">
              <span className="w-3 h-3 rounded-full bg-teal-600 inline-block" />
              Projected FIRE Corpus
            </span>
            <span className="flex items-center gap-1.5 text-orange-800">
              <span className="w-3 h-3 rounded-full bg-orange-500 inline-block" />
              Inflation-Adjusted FIRE Target
            </span>
          </div>
        </div>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={fireAnalysis.trajectory.slice(0, 21)} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="corpusGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0d9488" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#0d9488" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="targetGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="year"
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickFormatter={(yr) => `${yr} (Age ${currentAge + (yr - currentYear)})`}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickFormatter={(v) => `$${Math.round(v / 1000)}k`}
              />
              <Tooltip
                formatter={((value: any, name: any) => [
                  formatDualCurrency(Number(value), countryMacro, true),
                  name === 'projectedCorpusUSD' ? 'Projected Net Corpus' : 'Inflation-Adj FIRE Target',
                ]) as any}
                labelFormatter={(yr) => `Year ${yr} (Age ${currentAge + (Number(yr) - currentYear)})`}
                contentStyle={{ borderRadius: '12px', fontSize: '12px', borderColor: '#cbd5e1' }}
              />
              {fireAnalysis.crossoverYear && (
                <ReferenceLine
                  x={fireAnalysis.crossoverYear}
                  stroke="#10b981"
                  strokeDasharray="4 4"
                  label={{
                    value: `FIRE in ${fireAnalysis.crossoverYear}`,
                    position: 'top',
                    fill: '#047857',
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                />
              )}
              <Area
                type="monotone"
                dataKey="projectedCorpusUSD"
                stroke="#0d9488"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#corpusGrad)"
              />
              <Area
                type="monotone"
                dataKey="fireTargetUSD"
                stroke="#f97316"
                strokeWidth={2}
                strokeDasharray="5 3"
                fillOpacity={1}
                fill="url(#targetGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4-TAB INTERACTIVE LEDGER & DIAGNOSTICS CONSOLE */}
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
