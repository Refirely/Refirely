import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Country, UserFinancialPortfolio } from '../types';
import {
  DEFAULT_FINANCIAL_PORTFOLIO,
  WORLD_COUNTRIES,
  getCountryCurrencyMacro,
  formatLocalCurrency,
  formatDualCurrency,
  getWorldCountryFlag,
} from '../data/userAccounts';
import { CurrencyAmountInput } from './CurrencyAmountInput';
import {
  DollarSign, TrendingUp, Landmark, Home, Coins, PieChart,
  ShieldCheck, CheckCircle2, AlertTriangle, ArrowRight, Edit3,
  Sparkles, Layers, Sliders, ExternalLink, X, Save, RefreshCw,
  Search, Check, Award, ArrowUpRight, Globe, Lock
} from 'lucide-react';

export const UserFinancialsDashboard: React.FC = () => {
  const {
    userProfile,
    updateUserProfile,
    countries,
    navigateToCountry,
    setCurrentView,
  } = useApp();

  // Active user finances (fallback to DEFAULT_FINANCIAL_PORTFOLIO)
  const finances: UserFinancialPortfolio = useMemo(() => {
    return {
      ...DEFAULT_FINANCIAL_PORTFOLIO,
      ...(userProfile.finances || {}),
      investments: {
        ...DEFAULT_FINANCIAL_PORTFOLIO.investments,
        ...(userProfile.finances?.investments || {}),
      },
    };
  }, [userProfile.finances]);

  const residingCountry = userProfile.residingCountry || userProfile.originCountry || 'United States';
  const [selectedResidingCountry, setSelectedResidingCountry] = useState<string>(residingCountry);
  const countryMacro = useMemo(() => getCountryCurrencyMacro(selectedResidingCountry), [selectedResidingCountry]);

  // Currency Mode State (LOCAL vs USD, uniform with FIRE Calculator)
  const [inputCurrencyMode, setInputCurrencyMode] = useState<'LOCAL' | 'USD'>(() =>
    getCountryCurrencyMacro(residingCountry).currencyCode !== 'USD' ? 'LOCAL' : 'USD'
  );

  // Sync residingCountry if updated from elsewhere in profile
  React.useEffect(() => {
    const nextCountry = userProfile.residingCountry || userProfile.originCountry || 'United States';
    setSelectedResidingCountry(nextCountry);
    const macro = getCountryCurrencyMacro(nextCountry);
    if (macro.currencyCode === 'USD') {
      setInputCurrencyMode('USD');
    }
  }, [userProfile.residingCountry, userProfile.originCountry]);

  // Edit Modal & Inline Edit State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isInlineEditing, setIsInlineEditing] = useState(false);
  const [formData, setFormData] = useState<UserFinancialPortfolio>(finances);
  const [salaryMode, setSalaryMode] = useState<'annual' | 'monthly'>('annual');
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);
  const [inlineSaveToast, setInlineSaveToast] = useState<string | null>(null);

  // Country Readiness Filter
  const [countryFilterTab, setCountryFilterTab] = useState<'shortlist' | 'target' | 'all'>('shortlist');
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedRegionFilter, setSelectedRegionFilter] = useState<string>('All');
  const [safeWithdrawalRate, setSafeWithdrawalRate] = useState<number>(finances.safeWithdrawalRatePercent || 4.0);

  // Sync formData when external profile finances update and user is not actively editing
  React.useEffect(() => {
    if (!isEditModalOpen && !isInlineEditing) {
      setFormData({
        ...finances,
        investments: { ...finances.investments },
      });
      setSafeWithdrawalRate(finances.safeWithdrawalRatePercent || 4.0);
    }
  }, [finances, isEditModalOpen, isInlineEditing]);

  // Synchronize formData when modal opens
  const openEditModal = () => {
    setFormData({
      ...finances,
      investments: { ...finances.investments },
    });
    setSelectedResidingCountry(userProfile.residingCountry || userProfile.originCountry || 'United States');
    setSaveSuccessNotice(false);
    setIsEditModalOpen(true);
  };

  const startInlineEdit = () => {
    setFormData({
      ...finances,
      investments: { ...finances.investments },
    });
    setIsInlineEditing(true);
  };

  // Use live draft values when editing inline so all totals auto-calculate immediately as user types
  const activeSource = isInlineEditing ? formData : finances;

  // Calculations for Net Worth (Auto-Calculated from active schemes & liabilities)
  const savings = Math.round(activeSource.investments?.savingsUSD || 0);
  const stocks = Math.round(activeSource.investments?.stocksMutualFundsUSD || 0);
  const realEstate = Math.round(activeSource.investments?.realEstateUSD || 0);
  const gold = Math.round(activeSource.investments?.goldUSD || 0);
  const others = Math.round(activeSource.investments?.othersUSD || 0);
  const liabilities = Math.round(activeSource.totalLiabilitiesUSD || 0);

  const grossAssetsTotal = savings + stocks + realEstate + gold + others;
  const totalNetWorth = grossAssetsTotal - liabilities;
  const liquidInvestableAssets = savings + stocks + gold + others; // Excludes illiquid real estate

  // Monthly and Annual cash flow calculations (Auto-synced)
  const monthlySalary = Math.round(
    activeSource.monthlySalaryUSD || (activeSource.currentSalaryUSD || 0) / 12
  );
  const annualSalary = Math.round(
    activeSource.currentSalaryUSD || monthlySalary * 12
  );
  const passiveMonthlyIncome = Math.round(activeSource.additionalMonthlyPassiveUSD || 0);

  // Safe Withdrawal Rate Monthly Retirement Cash Flow
  const swrAnnualIncome = Math.round(totalNetWorth * (safeWithdrawalRate / 100));
  const swrMonthlyIncome = Math.round(swrAnnualIncome / 12);

  // Liquid SWR (conservative, without selling home)
  const liquidSwrMonthlyIncome = Math.round((liquidInvestableAssets * (safeWithdrawalRate / 100)) / 12);

  // Asset allocation percentages
  const totalAssetsSum = grossAssetsTotal || 1;
  const savingsPct = Math.round((savings / totalAssetsSum) * 100);
  const stocksPct = Math.round((stocks / totalAssetsSum) * 100);
  const realEstatePct = Math.round((realEstate / totalAssetsSum) * 100);
  const goldPct = Math.round((gold / totalAssetsSum) * 100);
  const othersPct = Math.max(0, 100 - (savingsPct + stocksPct + realEstatePct + goldPct));

  // Persist helper used by both Modal Save and Inline Save & Recalculate
  const persistFinancialPortfolio = (closeModalAfter = true) => {
    const cleanAnnual = Math.round(
      Number(formData.currentSalaryUSD) || Number(formData.monthlySalaryUSD || 0) * 12
    );
    const cleanMonthly = Math.round(
      Number(formData.monthlySalaryUSD) || cleanAnnual / 12
    );

    const updatedFinances: UserFinancialPortfolio = {
      ...finances,
      ...formData,
      currentSalaryUSD: cleanAnnual,
      monthlySalaryUSD: cleanMonthly,
      monthlyCurrentExpensesUSD: Math.round(Number(formData.monthlyCurrentExpensesUSD ?? finances.monthlyCurrentExpensesUSD ?? 3200)),
      monthlySipUSD: Math.round(Number(formData.monthlySipUSD) || 0),
      additionalMonthlyPassiveUSD: Math.round(Number(formData.additionalMonthlyPassiveUSD) || 0),
      investments: {
        savingsUSD: Math.round(Number(formData.investments?.savingsUSD) || 0),
        stocksMutualFundsUSD: Math.round(Number(formData.investments?.stocksMutualFundsUSD) || 0),
        realEstateUSD: Math.round(Number(formData.investments?.realEstateUSD) || 0),
        goldUSD: Math.round(Number(formData.investments?.goldUSD) || 0),
        othersUSD: Math.round(Number(formData.investments?.othersUSD) || 0),
      },
      totalLiabilitiesUSD: Math.round(Number(formData.totalLiabilitiesUSD) || 0),
      safeWithdrawalRatePercent: safeWithdrawalRate,
      updatedAt: new Date().toISOString().split('T')[0],
    };

    updateUserProfile({
      residingCountry: selectedResidingCountry,
      finances: updatedFinances,
    });

    setIsInlineEditing(false);
    setInlineSaveToast(
      'Saved & Recalculated! All Net Worth totals, Haven Matcher AI scores, and FIRE projections are updated.'
    );
    setTimeout(() => setInlineSaveToast(null), 4000);

    if (closeModalAfter) {
      setSaveSuccessNotice(true);
      setTimeout(() => {
        setSaveSuccessNotice(false);
        setIsEditModalOpen(false);
      }, 700);
    }
  };

  // Handle Form Submission
  const handleSaveFinances = (e: React.FormEvent) => {
    e.preventDefault();
    persistFinancialPortfolio(true);
  };

  // Helper to calculate country potential
  const analyzeCountryPotential = (country: Country) => {
    const monthlyCost = country.costOfLiving.monthlyBudgetSingleUSD;
    const coupleCost = country.costOfLiving.monthlyBudgetCoupleUSD;
    const annualLivingCost = monthlyCost * 12;

    // Visa qualification comparison
    const visaReq = country.visa.minimumIncomeUSD || 0;
    const meetsVisaWithSalary = monthlySalary >= visaReq;
    const meetsVisaWithPassive = (passiveMonthlyIncome + swrMonthlyIncome) >= visaReq;
    const visaCoveragePct = visaReq > 0 ? Math.round((monthlySalary / visaReq) * 100) : 100;

    // Living cost coverage with current salary
    const salaryLivingSurplusUSD = monthlySalary - monthlyCost;
    const salaryLivingCoveragePct = Math.round((monthlySalary / monthlyCost) * 100);

    // Living cost coverage with 4% FIRE SWR alone (without working!)
    const fireLivingSurplusUSD = swrMonthlyIncome - monthlyCost;
    const fireLivingCoveragePct = Math.round((swrMonthlyIncome / monthlyCost) * 100);

    // Net worth living runway in years
    const runwayYears = Math.round((totalNetWorth / annualLivingCost) * 10) / 10;
    const liquidRunwayYears = Math.round((liquidInvestableAssets / annualLivingCost) * 10) / 10;

    // Real estate purchase potential
    // Estimate capital city center vs regional coastal property (80m² apartment)
    const estCenterHomePriceUSD = Math.round(country.costOfLiving.rent1BedCenterUSD * 240); // ~20 yrs rent multiple
    const estCoastalHomePriceUSD = Math.round(country.costOfLiving.rent1BedOutsideUSD * 210);
    const canAffordHomeOutright = totalNetWorth >= estCenterHomePriceUSD;
    const realEstateEquityCoversHome = realEstate >= estCoastalHomePriceUSD;

    // Readiness Score (0 to 100)
    let score = 0;
    // 1. Visa income score (max 30 pts)
    if (visaReq === 0 || monthlySalary >= visaReq * 2) score += 30;
    else if (monthlySalary >= visaReq) score += 25;
    else if (meetsVisaWithPassive) score += 20;
    else score += Math.min(15, Math.round((monthlySalary / visaReq) * 25));

    // 2. Monthly living cost surplus score (max 30 pts)
    if (monthlySalary >= monthlyCost * 2.5) score += 30;
    else if (monthlySalary >= monthlyCost * 1.5) score += 25;
    else if (monthlySalary >= monthlyCost) score += 20;
    else score += Math.min(15, Math.round((monthlySalary / monthlyCost) * 20));

    // 3. Net worth runway score (max 25 pts)
    if (runwayYears >= 30) score += 25; // Perpetual FIRE threshold
    else if (runwayYears >= 20) score += 20;
    else if (runwayYears >= 10) score += 15;
    else score += Math.min(10, Math.round(runwayYears));

    // 4. Liquid emergency buffer (max 15 pts)
    const emergencyMonths = savings / monthlyCost;
    if (emergencyMonths >= 18) score += 15;
    else if (emergencyMonths >= 12) score += 12;
    else if (emergencyMonths >= 6) score += 9;
    else score += 5;

    let tier: { label: string; color: string; badgeBg: string; text: string } = {
      label: 'Prime Financial Fit',
      color: 'emerald',
      badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      text: 'Exceptional financial synergy. Your income & net worth provide complete peace of mind with massive monthly surplus.',
    };

    if (score >= 90) {
      tier = {
        label: 'Prime Financial Fit',
        color: 'emerald',
        badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        text: 'Exceptional financial synergy. Your income & net worth exceed all visa rules with 200%+ living cost surplus.',
      };
    } else if (score >= 75) {
      tier = {
        label: 'Comfortable Surplus',
        color: 'teal',
        badgeBg: 'bg-teal-50 text-teal-800 border-teal-200',
        text: 'Very comfortable position. Visa requirements are fully satisfied with strong monthly cash flow buffer.',
      };
    } else if (score >= 60) {
      tier = {
        label: 'Balanced Financial Match',
        color: 'blue',
        badgeBg: 'bg-blue-50 text-blue-800 border-blue-200',
        text: 'Sound financial basis. Monthly living budget is covered, with steady capital preservation.',
      };
    } else if (score >= 45) {
      tier = {
        label: 'Moderate / Tight Budget',
        color: 'amber',
        badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
        text: 'Meets minimum requirements, but budget discipline will be needed for discretionary travel or healthcare.',
      };
    } else {
      tier = {
        label: 'Requires Additional Capital',
        color: 'rose',
        badgeBg: 'bg-rose-50 text-rose-800 border-rose-200',
        text: 'Income or net worth is below recommended threshold. Consider boosting passive income or exploring lower-cost havens.',
      };
    }

    return {
      country,
      score,
      tier,
      monthlyCost,
      coupleCost,
      annualLivingCost,
      visaReq,
      meetsVisaWithSalary,
      meetsVisaWithPassive,
      visaCoveragePct,
      salaryLivingSurplusUSD,
      salaryLivingCoveragePct,
      fireLivingSurplusUSD,
      fireLivingCoveragePct,
      runwayYears,
      liquidRunwayYears,
      estCenterHomePriceUSD,
      estCoastalHomePriceUSD,
      canAffordHomeOutright,
      realEstateEquityCoversHome,
    };
  };

  // Filter countries according to tab & search
  const filteredCountryAnalyses = useMemo(() => {
    let list: Country[] = countries;

    if (countryFilterTab === 'shortlist') {
      const saved = countries.filter(c => userProfile.savedCountryIds.includes(c.id));
      list = saved.length > 0 ? saved : countries.slice(0, 4); // fallback to top 4 if none saved
    } else if (countryFilterTab === 'target') {
      const target = countries.filter(c => c.name.toLowerCase() === userProfile.targetCountry.toLowerCase());
      list = target.length > 0 ? target : [countries[0]];
    }

    if (selectedRegionFilter !== 'All') {
      list = list.filter(c => c.region === selectedRegionFilter);
    }

    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      list = list.filter(c => c.name.toLowerCase().includes(q) || c.capital.toLowerCase().includes(q));
    }

    return list.map(c => analyzeCountryPotential(c)).sort((a, b) => b.score - a.score);
  }, [countries, countryFilterTab, selectedRegionFilter, searchFilter, userProfile.savedCountryIds, userProfile.targetCountry, monthlySalary, totalNetWorth, safeWithdrawalRate]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-8">
      
        {/* Top Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-50 border border-orange-200 text-orange-800">
              <DollarSign className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  Current Salary & Investment Schemes Net Worth
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-950 border border-orange-200 uppercase tracking-wider">
                  {getWorldCountryFlag(selectedResidingCountry)} {selectedResidingCountry} ({countryMacro.currencyCode}) + $ USD
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Multi-asset wealth allocation and financial readiness potential across global retirement havens. Enter or view balances in <strong>{countryMacro.currencyCode} ({countryMacro.symbol.trim()})</strong> or <strong>$ USD</strong>.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {countryMacro.currencyCode !== 'USD' && (
            <div className="inline-flex rounded-xl border border-slate-200 p-0.5 bg-slate-100 text-[11px] font-semibold">
              <button
                type="button"
                onClick={() => setInputCurrencyMode('LOCAL')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  inputCurrencyMode === 'LOCAL'
                    ? 'bg-white text-orange-950 font-bold shadow-2xs'
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
                    ? 'bg-white text-orange-950 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                $ USD
              </button>
            </div>
          )}

          {isInlineEditing ? (
            <>
              <button
                type="button"
                onClick={() => setIsInlineEditing(false)}
                className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => persistFinancialPortfolio(false)}
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white transition-all text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save & Recalculate Portfolio</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={startInlineEdit}
                className="px-3.5 py-2 rounded-xl border border-orange-300 bg-orange-50/80 text-orange-950 hover:bg-orange-100 transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5 text-orange-600" />
                <span>Quick Edit Inline</span>
              </button>
              <button
                type="button"
                onClick={openEditModal}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-600 via-amber-600 to-purple-600 text-white hover:from-orange-700 hover:to-purple-700 transition-all text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Full Portfolio ({inputCurrencyMode === 'LOCAL' && countryMacro.currencyCode !== 'USD' ? countryMacro.currencyCode : 'USD'})</span>
              </button>
            </>
          )}
        </div>
      </div>

      {inlineSaveToast && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-900 flex items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{inlineSaveToast}</span>
          </div>
        </div>
      )}

      {/* Top KPI Cards: Salary, Total Net Worth, Liquid Assets, 4% SWR FIRE Cashflow */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Current Salary */}
        <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/70 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Current Salary & SIP
            </span>
            <div className="p-1 rounded bg-orange-100 text-orange-800">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          {isInlineEditing ? (
            <div className="space-y-2.5 my-1">
              <div>
                <label className="text-[10px] font-bold text-slate-600 uppercase block mb-0.5">
                  Monthly Salary ({inputCurrencyMode === 'LOCAL' && countryMacro.currencyCode !== 'USD' ? countryMacro.currencyCode : 'USD'})
                </label>
                <CurrencyAmountInput
                  usdValue={formData.monthlySalaryUSD || Math.round((formData.currentSalaryUSD || 0) / 12)}
                  onChangeUsd={(val) =>
                    setFormData(prev => ({
                      ...prev,
                      monthlySalaryUSD: val,
                      currentSalaryUSD: Math.round(val * 12),
                    }))
                  }
                  currencyMode={inputCurrencyMode}
                  countryMacro={countryMacro}
                  inputSize="sm"
                  helperSuffix="/mo"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-600 uppercase block mb-0.5">
                  Monthly SIP Invested
                </label>
                <CurrencyAmountInput
                  usdValue={formData.monthlySipUSD ?? 2800}
                  onChangeUsd={(val) =>
                    setFormData(prev => ({
                      ...prev,
                      monthlySipUSD: val,
                    }))
                  }
                  currencyMode={inputCurrencyMode}
                  countryMacro={countryMacro}
                  inputSize="sm"
                  helperSuffix="/mo"
                />
              </div>
            </div>
          ) : (
            <div>
              <div className="text-2xl font-extrabold font-mono text-slate-900 tabular-nums">
                {inputCurrencyMode === 'LOCAL' && countryMacro.currencyCode !== 'USD'
                  ? formatLocalCurrency(annualSalary, countryMacro, true)
                  : `$${annualSalary.toLocaleString()}`}
                <span className="text-xs font-sans font-medium text-slate-500 ml-1.5">/ yr</span>
              </div>
              {countryMacro.currencyCode !== 'USD' && (
                <div className="text-[11px] font-mono font-bold text-teal-800 mt-0.5">
                  {inputCurrencyMode === 'LOCAL'
                    ? `$${annualSalary.toLocaleString()} USD / yr`
                    : `${getWorldCountryFlag(selectedResidingCountry)} ${formatLocalCurrency(annualSalary, countryMacro, true)} / yr`}
                </div>
              )}
              <div className="text-xs font-mono text-orange-900 font-semibold mt-1">
                {formatDualCurrency(monthlySalary, countryMacro, false)} <span className="text-[11px] font-sans text-slate-500 font-normal">/ mo gross</span>
              </div>
            </div>
          )}
          <div className="mt-3 pt-2.5 border-t border-slate-200/80 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Monthly SIP Invested</span>
            <span className="font-mono font-bold text-emerald-700">
              {formatDualCurrency(activeSource.monthlySipUSD || 2800, countryMacro, true)}/mo
            </span>
          </div>
        </div>

        {/* KPI 2: Total Net Worth - Saffron & Purple Luxury Card */}
        <div className="p-5 rounded-xl border-2 border-orange-400/50 bg-gradient-to-br from-orange-50/70 via-amber-50/30 to-purple-50/40 relative overflow-hidden flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-orange-950 uppercase tracking-wider">
              Total Net Worth
            </span>
            <div className="p-1 rounded bg-gradient-to-r from-orange-600 to-purple-600 text-white">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold font-mono text-orange-950 tabular-nums">
              {inputCurrencyMode === 'LOCAL' && countryMacro.currencyCode !== 'USD'
                ? formatLocalCurrency(totalNetWorth, countryMacro, true)
                : `$${totalNetWorth.toLocaleString()}`}
            </div>
            {countryMacro.currencyCode !== 'USD' && (
              <div className="text-xs font-mono font-bold text-purple-900 mt-0.5">
                {inputCurrencyMode === 'LOCAL'
                  ? `$${totalNetWorth.toLocaleString()} USD`
                  : `${getWorldCountryFlag(selectedResidingCountry)} ${formatLocalCurrency(totalNetWorth, countryMacro, true)}`}
              </div>
            )}
            <div className="text-xs text-orange-900 font-medium mt-1">
              Combined across 5 asset pillars {liabilities > 0 ? `(Net of $${liabilities.toLocaleString()} debt)` : ''}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-orange-200/70 text-[11px] text-orange-950/80 flex items-center justify-between font-medium">
            <span>Portfolio Status</span>
            <span className="font-bold text-purple-950 font-mono">100% Accounted</span>
          </div>
        </div>

        {/* KPI 3: Liquid & Deployable Wealth */}
        <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/70 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Liquid / Investable Wealth
            </span>
            <div className="p-1 rounded bg-blue-100 text-blue-800">
              <PieChart className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold font-mono text-slate-900 tabular-nums">
              {inputCurrencyMode === 'LOCAL' && countryMacro.currencyCode !== 'USD'
                ? formatLocalCurrency(liquidInvestableAssets, countryMacro, true)
                : `$${liquidInvestableAssets.toLocaleString()}`}
            </div>
            {countryMacro.currencyCode !== 'USD' && (
              <div className="text-xs font-mono font-bold text-blue-800 mt-0.5">
                {inputCurrencyMode === 'LOCAL'
                  ? `$${liquidInvestableAssets.toLocaleString()} USD`
                  : `${getWorldCountryFlag(selectedResidingCountry)} ${formatLocalCurrency(liquidInvestableAssets, countryMacro, true)}`}
              </div>
            )}
            <div className="text-xs text-slate-500 mt-1">
              {Math.round((liquidInvestableAssets / totalAssetsSum) * 100)}% of gross assets
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-200/80 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Excludes primary home</span>
            <span className="font-semibold text-blue-700">Deployable Cash/Equities</span>
          </div>
        </div>

        {/* KPI 4: 4% FIRE Safe Withdrawal Rate */}
        <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/70 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {safeWithdrawalRate}% FIRE Safe Cash Flow
            </span>
            <div className="p-1 rounded bg-amber-100 text-amber-800">
              <Coins className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold font-mono text-slate-900 tabular-nums">
              {inputCurrencyMode === 'LOCAL' && countryMacro.currencyCode !== 'USD'
                ? formatLocalCurrency(swrMonthlyIncome, countryMacro, false)
                : `$${swrMonthlyIncome.toLocaleString()}`}
              <span className="text-xs font-sans font-medium text-slate-500 ml-1.5">/ mo</span>
            </div>
            {countryMacro.currencyCode !== 'USD' && (
              <div className="text-xs font-mono font-bold text-amber-800 mt-0.5">
                {inputCurrencyMode === 'LOCAL'
                  ? `$${swrMonthlyIncome.toLocaleString()} USD / mo`
                  : `${getWorldCountryFlag(selectedResidingCountry)} ${formatLocalCurrency(swrMonthlyIncome, countryMacro, false)} / mo`}
              </div>
            )}
            <div className="text-xs font-mono text-amber-900 font-semibold mt-1">
              {formatDualCurrency(swrAnnualIncome, countryMacro, true)} <span className="text-[11px] font-sans text-slate-500 font-normal">/ yr perpetual</span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-200/80 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Trinity 4% Rule</span>
            <span className="font-semibold text-emerald-700">Perpetual Income</span>
          </div>
        </div>

      </div>

      {/* Asset Allocation Visual Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
            Portfolio Distribution Across 5 Schemes
          </span>
          <span className="font-mono text-slate-500 text-[11px]">
            Total Net Worth: <strong className="text-slate-900 font-bold">{formatDualCurrency(totalNetWorth, countryMacro, true)}</strong>
          </span>
        </div>

        <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-100 shadow-inner">
          <div
            title={`Savings: ${formatDualCurrency(savings, countryMacro, true)} (${savingsPct}%)`}
            style={{ width: `${savingsPct}%` }}
            className="bg-blue-500 transition-all duration-300 hover:opacity-90"
          />
          <div
            title={`Stocks / Mutual Funds: ${formatDualCurrency(stocks, countryMacro, true)} (${stocksPct}%)`}
            style={{ width: `${stocksPct}%` }}
            className="bg-emerald-500 transition-all duration-300 hover:opacity-90"
          />
          <div
            title={`Real Estate: ${formatDualCurrency(realEstate, countryMacro, true)} (${realEstatePct}%)`}
            style={{ width: `${realEstatePct}%` }}
            className="bg-indigo-600 transition-all duration-300 hover:opacity-90"
          />
          <div
            title={`Gold & Bullion: ${formatDualCurrency(gold, countryMacro, true)} (${goldPct}%)`}
            style={{ width: `${goldPct}%` }}
            className="bg-amber-400 transition-all duration-300 hover:opacity-90"
          />
          <div
            title={`Others & Alternatives: ${formatDualCurrency(others, countryMacro, true)} (${othersPct}%)`}
            style={{ width: `${othersPct}%` }}
            className="bg-purple-500 transition-all duration-300 hover:opacity-90"
          />
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1 text-[11px] text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
            <span>Savings ({savingsPct}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
            <span>Stocks / Mutual Funds ({stocksPct}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 shrink-0" />
            <span>Real Estate ({realEstatePct}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
            <span>Gold ({goldPct}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0" />
            <span>Others ({othersPct}%)</span>
          </div>
        </div>
      </div>

      {/* 5 INVESTMENT SCHEMES DETAIL GRID */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-orange-600" />
            <span>Investment Schemes Breakdown (Auto-Calculates Total Net Worth)</span>
          </h3>
          <div className="flex items-center gap-2">
            {!isInlineEditing ? (
              <button
                type="button"
                onClick={startInlineEdit}
                className="text-xs font-bold text-orange-700 hover:text-orange-900 underline cursor-pointer"
              >
                Click here to edit schemes directly in {inputCurrencyMode === 'LOCAL' && countryMacro.currencyCode !== 'USD' ? countryMacro.currencyCode : 'USD'}
              </button>
            ) : (
              <span className="text-xs font-bold text-emerald-800">
                Editing Inline — Totals auto-calculate as you type!
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          
          {/* Scheme 1: Savings */}
          <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/30 hover:border-blue-200 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-blue-900">1. Savings</span>
                <div className="p-1 rounded bg-blue-100 text-blue-700">
                  <Landmark className="w-3.5 h-3.5" />
                </div>
              </div>
              {isInlineEditing ? (
                <CurrencyAmountInput
                  usdValue={formData.investments?.savingsUSD || 0}
                  onChangeUsd={(val) =>
                    setFormData(prev => ({
                      ...prev,
                      investments: { ...prev.investments, savingsUSD: val },
                    }))
                  }
                  currencyMode={inputCurrencyMode}
                  countryMacro={countryMacro}
                  inputSize="sm"
                />
              ) : (
                <>
                  <div className="text-lg font-extrabold font-mono text-slate-900 tabular-nums">
                    {inputCurrencyMode === 'LOCAL' && countryMacro.currencyCode !== 'USD'
                      ? formatLocalCurrency(savings, countryMacro, true)
                      : `$${savings.toLocaleString()}`}
                  </div>
                  {countryMacro.currencyCode !== 'USD' && (
                    <div className="text-[11px] font-mono font-semibold text-blue-800 mt-0.5">
                      {inputCurrencyMode === 'LOCAL'
                        ? `$${savings.toLocaleString()} USD`
                        : formatLocalCurrency(savings, countryMacro, true)}
                    </div>
                  )}
                </>
              )}
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                Emergency funds, high-yield cash, checking, CDs, money market.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-blue-100 text-[10px] text-blue-800 font-semibold flex items-center justify-between">
              <span>{savingsPct}% of Gross Assets</span>
              <span className="bg-blue-100 px-1.5 py-0.2 rounded">Instant Liquidity</span>
            </div>
          </div>

          {/* Scheme 2: Stocks / Mutual Funds */}
          <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/30 hover:border-emerald-200 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-emerald-900">2. Stocks & MF</span>
                <div className="p-1 rounded bg-emerald-100 text-emerald-700">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
              </div>
              {isInlineEditing ? (
                <CurrencyAmountInput
                  usdValue={formData.investments?.stocksMutualFundsUSD || 0}
                  onChangeUsd={(val) =>
                    setFormData(prev => ({
                      ...prev,
                      investments: { ...prev.investments, stocksMutualFundsUSD: val },
                    }))
                  }
                  currencyMode={inputCurrencyMode}
                  countryMacro={countryMacro}
                  inputSize="sm"
                />
              ) : (
                <>
                  <div className="text-lg font-extrabold font-mono text-slate-900 tabular-nums">
                    {inputCurrencyMode === 'LOCAL' && countryMacro.currencyCode !== 'USD'
                      ? formatLocalCurrency(stocks, countryMacro, true)
                      : `$${stocks.toLocaleString()}`}
                  </div>
                  {countryMacro.currencyCode !== 'USD' && (
                    <div className="text-[11px] font-mono font-semibold text-emerald-800 mt-0.5">
                      {inputCurrencyMode === 'LOCAL'
                        ? `$${stocks.toLocaleString()} USD`
                        : formatLocalCurrency(stocks, countryMacro, true)}
                    </div>
                  )}
                </>
              )}
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                Equities, broad index funds, ETFs, 401(k), IRA, brokerage accounts.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-emerald-100 text-[10px] text-emerald-800 font-semibold flex items-center justify-between">
              <span>{stocksPct}% of Gross Assets</span>
              <span className="bg-emerald-100 px-1.5 py-0.2 rounded">Growth Engine</span>
            </div>
          </div>

          {/* Scheme 3: Real Estate */}
          <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/30 hover:border-indigo-200 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-indigo-900">3. Real Estate</span>
                <div className="p-1 rounded bg-indigo-100 text-indigo-700">
                  <Home className="w-3.5 h-3.5" />
                </div>
              </div>
              {isInlineEditing ? (
                <CurrencyAmountInput
                  usdValue={formData.investments?.realEstateUSD || 0}
                  onChangeUsd={(val) =>
                    setFormData(prev => ({
                      ...prev,
                      investments: { ...prev.investments, realEstateUSD: val },
                    }))
                  }
                  currencyMode={inputCurrencyMode}
                  countryMacro={countryMacro}
                  inputSize="sm"
                />
              ) : (
                <>
                  <div className="text-lg font-extrabold font-mono text-slate-900 tabular-nums">
                    {inputCurrencyMode === 'LOCAL' && countryMacro.currencyCode !== 'USD'
                      ? formatLocalCurrency(realEstate, countryMacro, true)
                      : `$${realEstate.toLocaleString()}`}
                  </div>
                  {countryMacro.currencyCode !== 'USD' && (
                    <div className="text-[11px] font-mono font-semibold text-indigo-800 mt-0.5">
                      {inputCurrencyMode === 'LOCAL'
                        ? `$${realEstate.toLocaleString()} USD`
                        : formatLocalCurrency(realEstate, countryMacro, true)}
                    </div>
                  )}
                </>
              )}
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                Primary home equity, rental units, REITs, land investments.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-indigo-100 text-[10px] text-indigo-800 font-semibold flex items-center justify-between">
              <span>{realEstatePct}% of Gross Assets</span>
              <span className="bg-indigo-100 px-1.5 py-0.2 rounded">Property Equity</span>
            </div>
          </div>

          {/* Scheme 4: Gold */}
          <div className="p-4 rounded-xl border border-amber-100 bg-amber-50/30 hover:border-amber-200 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-amber-900">4. Gold</span>
                <div className="p-1 rounded bg-amber-100 text-amber-700">
                  <Coins className="w-3.5 h-3.5" />
                </div>
              </div>
              {isInlineEditing ? (
                <CurrencyAmountInput
                  usdValue={formData.investments?.goldUSD || 0}
                  onChangeUsd={(val) =>
                    setFormData(prev => ({
                      ...prev,
                      investments: { ...prev.investments, goldUSD: val },
                    }))
                  }
                  currencyMode={inputCurrencyMode}
                  countryMacro={countryMacro}
                  inputSize="sm"
                />
              ) : (
                <>
                  <div className="text-lg font-extrabold font-mono text-slate-900 tabular-nums">
                    {inputCurrencyMode === 'LOCAL' && countryMacro.currencyCode !== 'USD'
                      ? formatLocalCurrency(gold, countryMacro, true)
                      : `$${gold.toLocaleString()}`}
                  </div>
                  {countryMacro.currencyCode !== 'USD' && (
                    <div className="text-[11px] font-mono font-semibold text-amber-800 mt-0.5">
                      {inputCurrencyMode === 'LOCAL'
                        ? `$${gold.toLocaleString()} USD`
                        : formatLocalCurrency(gold, countryMacro, true)}
                    </div>
                  )}
                </>
              )}
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                Physical gold bullion, Sovereign Gold Bonds (SGB), silver, metals.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-amber-100 text-[10px] text-amber-800 font-semibold flex items-center justify-between">
              <span>{goldPct}% of Gross Assets</span>
              <span className="bg-amber-100 px-1.5 py-0.2 rounded">Inflation Hedge</span>
            </div>
          </div>

          {/* Scheme 5: Others */}
          <div className="p-4 rounded-xl border border-purple-100 bg-purple-50/30 hover:border-purple-200 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-purple-900">5. Others</span>
                <div className="p-1 rounded bg-purple-100 text-purple-700">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
              </div>
              {isInlineEditing ? (
                <CurrencyAmountInput
                  usdValue={formData.investments?.othersUSD || 0}
                  onChangeUsd={(val) =>
                    setFormData(prev => ({
                      ...prev,
                      investments: { ...prev.investments, othersUSD: val },
                    }))
                  }
                  currencyMode={inputCurrencyMode}
                  countryMacro={countryMacro}
                  inputSize="sm"
                />
              ) : (
                <>
                  <div className="text-lg font-extrabold font-mono text-slate-900 tabular-nums">
                    {inputCurrencyMode === 'LOCAL' && countryMacro.currencyCode !== 'USD'
                      ? formatLocalCurrency(others, countryMacro, true)
                      : `$${others.toLocaleString()}`}
                  </div>
                  {countryMacro.currencyCode !== 'USD' && (
                    <div className="text-[11px] font-mono font-semibold text-purple-800 mt-0.5">
                      {inputCurrencyMode === 'LOCAL'
                        ? `$${others.toLocaleString()} USD`
                        : formatLocalCurrency(others, countryMacro, true)}
                    </div>
                  )}
                </>
              )}
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                Crypto, fixed income bonds, private business stakes, alternatives.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-purple-100 text-[10px] text-purple-800 font-semibold flex items-center justify-between">
              <span>{othersPct}% of Gross Assets</span>
              <span className="bg-purple-100 px-1.5 py-0.2 rounded">Alternatives</span>
            </div>
          </div>

        </div>

        {/* Inline Edit Action Bar when active */}
        {isInlineEditing && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50 to-orange-50 border border-emerald-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
            <div className="text-xs text-slate-800">
              <span className="font-bold text-emerald-950">Auto-Calculated Totals: </span>
              Gross Assets: <strong className="font-mono">{formatDualCurrency(grossAssetsTotal, countryMacro, true)}</strong> ·
              Liabilities: <strong className="font-mono text-rose-800">{formatDualCurrency(liabilities, countryMacro, true)}</strong> ·
              Net Worth: <strong className="font-mono text-teal-950">{formatDualCurrency(totalNetWorth, countryMacro, true)}</strong>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsInlineEditing(false)}
                className="px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => persistFinancialPortfolio(false)}
                className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save & Recalculate All</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Unified Engine Integration Notice */}
      <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-orange-600 shrink-0" />
          <span>
            Your <strong>Salary (${monthlySalary.toLocaleString()}/mo)</strong>, <strong>Stocks & Cash Proof (${(savings + stocks).toLocaleString()})</strong>, and <strong>{safeWithdrawalRate}% SWR (${swrMonthlyIncome.toLocaleString()}/mo)</strong> automatically power the unified <strong>Haven Matcher AI Recommendation Engine</strong> and <strong>FIRE Calculator</strong> below.
          </span>
        </div>
      </div>

      {/* EDIT FINANCIALS MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-6">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Edit Financial Portfolio & Schemes
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Enter your salary, SIP, liabilities, and 5 investment schemes in your <strong>Local Currency ({countryMacro.currencyCode})</strong> or <strong>$ USD</strong>.
                </p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* UNIFORM RESIDING COUNTRY & LOCAL CURRENCY / USD INPUT TOGGLE BAR */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-orange-50/80 via-amber-50/50 to-purple-50/60 border border-orange-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1">
                <label className="text-[11px] font-bold text-orange-950 uppercase tracking-wider block mb-1">
                  Residing Country & Local Currency Basis
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={selectedResidingCountry}
                    onChange={(e) => {
                      const next = e.target.value;
                      setSelectedResidingCountry(next);
                      const nextMacro = getCountryCurrencyMacro(next);
                      if (nextMacro.currencyCode !== 'USD') {
                        setInputCurrencyMode('LOCAL');
                      } else {
                        setInputCurrencyMode('USD');
                      }
                    }}
                    className="px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-orange-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    {!WORLD_COUNTRIES.some(c => c.name === selectedResidingCountry) && selectedResidingCountry && (
                      <option value={selectedResidingCountry}>🌍 {selectedResidingCountry}</option>
                    )}
                    {WORLD_COUNTRIES.map(c => (
                      <option key={`fin-modal-country-${c.code}-${c.name}`} value={c.name}>
                        {c.flag} {c.name}
                      </option>
                    ))}
                  </select>
                  <span className="text-[11px] font-mono text-slate-600">
                    {countryMacro.currencyCode !== 'USD'
                      ? `1 USD = ${countryMacro.symbol.trim()}${countryMacro.rateToUSD} ${countryMacro.currencyCode}`
                      : 'Base Currency: $ USD'}
                  </span>
                </div>
              </div>

              {/* Currency Input Mode Toggle (Uniform with FIRE Calculator) */}
              {countryMacro.currencyCode !== 'USD' && (
                <div className="shrink-0">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1 sm:text-right">
                    Input Currency Mode
                  </span>
                  <div className="inline-flex rounded-xl border border-orange-300 p-0.5 bg-white shadow-2xs text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setInputCurrencyMode('LOCAL')}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                        inputCurrencyMode === 'LOCAL'
                          ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Input in {countryMacro.currencyCode} ({countryMacro.symbol.trim()})
                    </button>
                    <button
                      type="button"
                      onClick={() => setInputCurrencyMode('USD')}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                        inputCurrencyMode === 'USD'
                          ? 'bg-slate-900 text-white font-bold shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Input in $ USD
                    </button>
                  </div>
                </div>
              )}
            </div>

            {saveSuccessNotice && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Financial portfolio updated and recalculated successfully!</span>
              </div>
            )}

            <form noValidate onSubmit={handleSaveFinances} className="space-y-6">
              
              {/* SECTION: SALARY & PASSIVE INCOME (Both Annual and Monthly Directly Editable & Auto-Calculated) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-teal-700" />
                    <span>
                      Current Salary, SIP & Liabilities ({inputCurrencyMode === 'LOCAL' && countryMacro.currencyCode !== 'USD' ? `${countryMacro.currencyCode} ${countryMacro.symbol.trim()}` : '$ USD'})
                    </span>
                  </h4>
                  <span className="text-[11px] text-teal-800 font-semibold">
                    Annual & Monthly auto-calculate each other
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Current Annual Salary ({inputCurrencyMode === 'LOCAL' && countryMacro.currencyCode !== 'USD' ? countryMacro.currencyCode : 'USD'})
                    </label>
                    <CurrencyAmountInput
                      usdValue={formData.currentSalaryUSD || 0}
                      onChangeUsd={(val) =>
                        setFormData(prev => ({
                          ...prev,
                          currentSalaryUSD: val,
                          monthlySalaryUSD: Math.round((val / 12) * 100) / 100,
                        }))
                      }
                      currencyMode={inputCurrencyMode}
                      countryMacro={countryMacro}
                      helperSuffix="/yr"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Current Monthly Salary ({inputCurrencyMode === 'LOCAL' && countryMacro.currencyCode !== 'USD' ? countryMacro.currencyCode : 'USD'})
                    </label>
                    <CurrencyAmountInput
                      usdValue={formData.monthlySalaryUSD || Math.round((formData.currentSalaryUSD || 0) / 12)}
                      onChangeUsd={(val) =>
                        setFormData(prev => ({
                          ...prev,
                          monthlySalaryUSD: val,
                          currentSalaryUSD: Math.round(val * 12 * 100) / 100,
                        }))
                      }
                      currencyMode={inputCurrencyMode}
                      countryMacro={countryMacro}
                      helperSuffix="/mo"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Additional Monthly Passive Income ({inputCurrencyMode === 'LOCAL' && countryMacro.currencyCode !== 'USD' ? countryMacro.currencyCode : 'USD'})
                    </label>
                    <CurrencyAmountInput
                      usdValue={formData.additionalMonthlyPassiveUSD || 0}
                      onChangeUsd={(val) => setFormData(prev => ({ ...prev, additionalMonthlyPassiveUSD: val }))}
                      currencyMode={inputCurrencyMode}
                      countryMacro={countryMacro}
                      helperSuffix="/mo"
                    />
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      Pensions, dividends, social security, rental cash flow
                    </span>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-rose-800 block mb-1">
                      Monthly Current Expenses ({inputCurrencyMode === 'LOCAL' && countryMacro.currencyCode !== 'USD' ? countryMacro.currencyCode : 'USD'})
                    </label>
                    <CurrencyAmountInput
                      usdValue={formData.monthlyCurrentExpensesUSD ?? 3200}
                      onChangeUsd={(val) => setFormData(prev => ({ ...prev, monthlyCurrentExpensesUSD: val }))}
                      currencyMode={inputCurrencyMode}
                      countryMacro={countryMacro}
                      helperSuffix="/mo"
                    />
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      Current household & living expenses (feeds FIRE Calculator)
                    </span>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Monthly SIP Being Invested ({inputCurrencyMode === 'LOCAL' && countryMacro.currencyCode !== 'USD' ? countryMacro.currencyCode : 'USD'})
                    </label>
                    <CurrencyAmountInput
                      usdValue={formData.monthlySipUSD ?? 2800}
                      onChangeUsd={(val) => setFormData(prev => ({ ...prev, monthlySipUSD: val }))}
                      currencyMode={inputCurrencyMode}
                      countryMacro={countryMacro}
                      helperSuffix="/mo"
                    />
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      Systematic monthly investment feeding your FIRE Calculator
                    </span>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Total Loan Liabilities Principal ({inputCurrencyMode === 'LOCAL' && countryMacro.currencyCode !== 'USD' ? countryMacro.currencyCode : 'USD'})
                    </label>
                    <CurrencyAmountInput
                      usdValue={formData.totalLiabilitiesUSD || 0}
                      onChangeUsd={(val) => setFormData(prev => ({ ...prev, totalLiabilitiesUSD: val }))}
                      currencyMode={inputCurrencyMode}
                      countryMacro={countryMacro}
                    />
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      Combined mortgage, auto & personal loan balances
                    </span>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Safe Withdrawal Rate (SWR % / yr)
                    </label>
                    <input
                      type="number"
                      step="any"
                      min={1}
                      max={10}
                      value={safeWithdrawalRate}
                      onChange={(e) => setSafeWithdrawalRate(parseFloat(e.target.value) || 4.0)}
                      className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      Standard Trinity Study rate is 4.0%
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION: 5 INVESTMENT SCHEMES */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Landmark className="w-3.5 h-3.5 text-teal-700" />
                  <span>
                    5 Investment Schemes ({inputCurrencyMode === 'LOCAL' && countryMacro.currencyCode !== 'USD' ? `Enter in ${countryMacro.currencyCode} ${countryMacro.symbol.trim()}` : 'Enter in $ USD'})
                  </span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Scheme 1: Savings */}
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      <span>1. Savings & Cash Reserves ({inputCurrencyMode === 'LOCAL' && countryMacro.currencyCode !== 'USD' ? countryMacro.currencyCode : 'USD'})</span>
                    </label>
                    <CurrencyAmountInput
                      usdValue={formData.investments?.savingsUSD || 0}
                      onChangeUsd={(val) =>
                        setFormData(prev => ({
                          ...prev,
                          investments: { ...prev.investments, savingsUSD: val },
                        }))
                      }
                      currencyMode={inputCurrencyMode}
                      countryMacro={countryMacro}
                    />
                    <span className="text-[11px] text-slate-500 mt-0.5 block">
                      HYSA, emergency fund, checking, fixed deposits / CDs
                    </span>
                  </div>

                  {/* Scheme 2: Stocks / Mutual Funds */}
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>2. Stocks & Mutual Funds / ETFs ({inputCurrencyMode === 'LOCAL' && countryMacro.currencyCode !== 'USD' ? countryMacro.currencyCode : 'USD'})</span>
                    </label>
                    <CurrencyAmountInput
                      usdValue={formData.investments?.stocksMutualFundsUSD || 0}
                      onChangeUsd={(val) =>
                        setFormData(prev => ({
                          ...prev,
                          investments: { ...prev.investments, stocksMutualFundsUSD: val },
                        }))
                      }
                      currencyMode={inputCurrencyMode}
                      countryMacro={countryMacro}
                    />
                    <span className="text-[11px] text-slate-500 mt-0.5 block">
                      Index funds, mutual funds, 401(k)/EPF/PPF, brokerage equities
                    </span>
                  </div>

                  {/* Scheme 3: Real Estate */}
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-teal-700" />
                      <span>3. Real Estate Equity & Land ({inputCurrencyMode === 'LOCAL' && countryMacro.currencyCode !== 'USD' ? countryMacro.currencyCode : 'USD'})</span>
                    </label>
                    <CurrencyAmountInput
                      usdValue={formData.investments?.realEstateUSD || 0}
                      onChangeUsd={(val) =>
                        setFormData(prev => ({
                          ...prev,
                          investments: { ...prev.investments, realEstateUSD: val },
                        }))
                      }
                      currencyMode={inputCurrencyMode}
                      countryMacro={countryMacro}
                    />
                    <span className="text-[11px] text-slate-500 mt-0.5 block">
                      Home equity, rental units, land, REITs
                    </span>
                  </div>

                  {/* Scheme 4: Gold */}
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      <span>4. Gold & Precious Metals ({inputCurrencyMode === 'LOCAL' && countryMacro.currencyCode !== 'USD' ? countryMacro.currencyCode : 'USD'})</span>
                    </label>
                    <CurrencyAmountInput
                      usdValue={formData.investments?.goldUSD || 0}
                      onChangeUsd={(val) =>
                        setFormData(prev => ({
                          ...prev,
                          investments: { ...prev.investments, goldUSD: val },
                        }))
                      }
                      currencyMode={inputCurrencyMode}
                      countryMacro={countryMacro}
                    />
                    <span className="text-[11px] text-slate-500 mt-0.5 block">
                      Physical bullion, Sovereign Gold Bonds (SGB), silver
                    </span>
                  </div>

                  {/* Scheme 5: Others */}
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-700 block mb-1 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-purple-500" />
                      <span>5. Other Investments & Alternatives ({inputCurrencyMode === 'LOCAL' && countryMacro.currencyCode !== 'USD' ? countryMacro.currencyCode : 'USD'})</span>
                    </label>
                    <CurrencyAmountInput
                      usdValue={formData.investments?.othersUSD || 0}
                      onChangeUsd={(val) =>
                        setFormData(prev => ({
                          ...prev,
                          investments: { ...prev.investments, othersUSD: val },
                        }))
                      }
                      currencyMode={inputCurrencyMode}
                      countryMacro={countryMacro}
                    />
                    <span className="text-[11px] text-slate-500 mt-0.5 block">
                      Crypto, corporate/govt bonds, private business equity, alternative funds
                    </span>
                  </div>

                </div>
              </div>

              {/* Live Auto-Calculated Totals Breakdown Card in Modal */}
              <div className="p-4 rounded-xl bg-teal-50/60 border border-teal-200 space-y-3">
                <div className="flex items-center justify-between border-b border-teal-200/70 pb-2">
                  <span className="text-xs font-extrabold text-teal-950 uppercase tracking-wider">
                    Auto-Calculated Portfolio Totals (Live)
                  </span>
                  <span className="text-[11px] font-semibold text-teal-800">
                    Updates automatically as you type
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                    <span className="text-[11px] text-slate-500 block">Gross Financial Assets (1–5):</span>
                    <div className="font-bold font-mono text-slate-900 mt-0.5">
                      {formatDualCurrency(
                        (formData.investments?.savingsUSD || 0) +
                          (formData.investments?.stocksMutualFundsUSD || 0) +
                          (formData.investments?.realEstateUSD || 0) +
                          (formData.investments?.goldUSD || 0) +
                          (formData.investments?.othersUSD || 0),
                        countryMacro,
                        true
                      )}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                    <span className="text-[11px] text-slate-500 block">Liquid Investable Assets:</span>
                    <div className="font-bold font-mono text-blue-900 mt-0.5">
                      {formatDualCurrency(
                        (formData.investments?.savingsUSD || 0) +
                          (formData.investments?.stocksMutualFundsUSD || 0) +
                          (formData.investments?.goldUSD || 0) +
                          (formData.investments?.othersUSD || 0),
                        countryMacro,
                        true
                      )}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-teal-300">
                    <span className="text-[11px] text-teal-800 font-bold block">Total Net Worth (Net of Debt):</span>
                    <div className="font-extrabold font-mono text-teal-950 mt-0.5">
                      {formatDualCurrency(
                        (formData.investments?.savingsUSD || 0) +
                          (formData.investments?.stocksMutualFundsUSD || 0) +
                          (formData.investments?.realEstateUSD || 0) +
                          (formData.investments?.goldUSD || 0) +
                          (formData.investments?.othersUSD || 0) -
                          (formData.totalLiabilitiesUSD || 0),
                        countryMacro,
                        true
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-teal-800 text-white text-xs font-bold hover:bg-teal-900 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save & Recalculate Portfolio</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
