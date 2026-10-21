import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Country, ClimateCategory, UserFinancialPortfolio } from '../types';
import { DEFAULT_FINANCIAL_PORTFOLIO, WORLD_COUNTRIES, getWorldCountryFlag } from '../data/userAccounts';
import { CountryFlag } from './CountryFlag';
import {
  Sparkles, ArrowRight, Heart, Check, Scale, Sun, DollarSign, Shield,
  SlidersHorizontal, Award, Globe, Languages, TrendingUp, CheckCircle2,
  AlertTriangle, Search, Sliders, Users, Landmark, Coins, Info
} from 'lucide-react';

// European Union / EEA / Swiss nationality set for automatic freedom-of-movement visa grading
const EU_EEA_SWISS_COUNTRIES = new Set([
  'Austria', 'Belgium', 'Bulgaria', 'Croatia', 'Cyprus', 'Czech Republic',
  'Denmark', 'Estonia', 'Finland', 'France', 'Germany', 'Greece', 'Hungary',
  'Iceland', 'Ireland', 'Italy', 'Latvia', 'Liechtenstein', 'Lithuania',
  'Luxembourg', 'Malta', 'Netherlands', 'Norway', 'Poland', 'Portugal',
  'Romania', 'Slovakia', 'Slovenia', 'Spain', 'Sweden', 'Switzerland'
]);

const EU_HAVEN_IDS = new Set([
  'portugal', 'spain', 'greece', 'italy', 'france', 'cyprus', 'malta',
  'croatia', 'slovenia', 'ireland', 'bulgaria', 'hungary', 'austria',
  'switzerland', 'czech-republic', 'romania', 'poland', 'estonia', 'slovakia'
]);

const IBERO_LATAM_COUNTRIES = new Set([
  'Argentina', 'Bolivia', 'Brazil', 'Chile', 'Colombia', 'Costa Rica', 'Cuba',
  'Dominican Republic', 'Ecuador', 'El Salvador', 'Guatemala', 'Honduras',
  'Mexico', 'Nicaragua', 'Panama', 'Paraguay', 'Peru', 'Philippines',
  'Puerto Rico', 'Uruguay', 'Venezuela'
]);

const COMMONWEALTH_CANZUK_COUNTRIES = new Set([
  'United Kingdom', 'Canada', 'Australia', 'New Zealand', 'India', 'Singapore',
  'Malaysia', 'South Africa', 'Mauritius', 'Barbados', 'Bahamas', 'Fiji',
  'Saint Kitts and Nevis', 'Jamaica', 'Saint Lucia', 'Grenada', 'Antigua and Barbuda',
  'Bermuda', 'Cayman Islands', 'Seychelles'
]);

export interface PillarGrade {
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C';
  score: number; // 0 to 100
  label: string;
  badgeClass: string;
  headline: string;
  detail: string;
}

export const HavenMatcherWidget: React.FC = () => {
  const {
    countries,
    userProfile,
    updateUserProfile,
    navigateToCountry,
    isCountrySaved,
    toggleSaveCountry,
    isCountryCompared,
    toggleCompareCountry,
    openEditProfile,
  } = useApp();

  // Active user finances
  const finances: UserFinancialPortfolio = useMemo(() => {
    return userProfile.finances || DEFAULT_FINANCIAL_PORTFOLIO;
  }, [userProfile.finances]);

  // Interactive Filters & Simulation Controls (synced with userProfile defaults)
  const [scopeTab, setScopeTab] = useState<'top' | 'shortlist' | 'target' | 'all'>('top');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [interactiveBudget, setInteractiveBudget] = useState<number>(userProfile.monthlyBudgetUSD || 2500);
  const [interactiveClimate, setInteractiveClimate] = useState<ClimateCategory | 'Any'>(userProfile.preferredClimate || 'Any');
  const [interactiveNationality, setInteractiveNationality] = useState<string>(userProfile.originCountry || 'United States');
  const [safeWithdrawalRate, setSafeWithdrawalRate] = useState<number>(finances.safeWithdrawalRatePercent || 4.0);
  const [incomeEvalMode, setIncomeEvalMode] = useState<'combined' | 'assets-only'>('combined');
  const [socialDatingPriority, setSocialDatingPriority] = useState<'balanced' | 'high-dating' | 'expat-hub' | 'quiet-wellness'>('balanced');

  // Keep interactive defaults updated when user switches account or updates profile
  useEffect(() => {
    setInteractiveBudget(userProfile.monthlyBudgetUSD || 2500);
    setInteractiveClimate(userProfile.preferredClimate || 'Any');
    setInteractiveNationality(userProfile.originCountry || 'United States');
    if (finances.safeWithdrawalRatePercent) {
      setSafeWithdrawalRate(finances.safeWithdrawalRatePercent);
    }
  }, [userProfile.id, userProfile.monthlyBudgetUSD, userProfile.preferredClimate, userProfile.originCountry, finances.safeWithdrawalRatePercent]);

  const climateOptions: (ClimateCategory | 'Any')[] = [
    'Any',
    'Mediterranean',
    'Tropical',
    'Subtropical',
    'Temperate',
    'Highlands / Mild',
  ];

  // Financial Portfolio Calculations
  const savings = finances.investments?.savingsUSD || 0;
  const stocks = finances.investments?.stocksMutualFundsUSD || 0;
  const realEstate = finances.investments?.realEstateUSD || 0;
  const gold = finances.investments?.goldUSD || 0;
  const others = finances.investments?.othersUSD || 0;
  const liabilities = finances.totalLiabilitiesUSD || 0;

  const totalNetWorth = Math.max(0, savings + stocks + realEstate + gold + others - liabilities);
  const stocksAndSavingsLiquid = savings + stocks; // Directly verifiable bank + brokerage statements for visa consulates
  const liquidInvestableAssets = savings + stocks + gold + others; // Total liquid/deployable financial assets

  const monthlySalary = finances.monthlySalaryUSD || Math.round((finances.currentSalaryUSD || 0) / 12);
  const passiveMonthlyIncome = finances.additionalMonthlyPassiveUSD || 0;
  const swrAnnualIncome = Math.round(totalNetWorth * (safeWithdrawalRate / 100));
  const swrMonthlyIncome = Math.round(swrAnnualIncome / 12);
  const liquidSwrMonthlyIncome = Math.round((liquidInvestableAssets * (safeWithdrawalRate / 100)) / 12);

  // Effective monthly income based on whether the user is testing active salary + assets OR pure retirement (assets/stocks/SWR only)
  const effectiveMonthlyIncome =
    incomeEvalMode === 'combined'
      ? Math.max(monthlySalary + passiveMonthlyIncome, passiveMonthlyIncome + swrMonthlyIncome)
      : passiveMonthlyIncome + swrMonthlyIncome;

  const formatGrade = (score: number): 'A+' | 'A' | 'B+' | 'B' | 'C' => {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B+';
    if (score >= 60) return 'B';
    return 'C';
  };

  const getGradeBadgeClass = (grade: 'A+' | 'A' | 'B+' | 'B' | 'C') => {
    switch (grade) {
      case 'A+':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300';
      case 'A':
        return 'bg-teal-50 text-teal-800 border-teal-300';
      case 'B+':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'B':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      default:
        return 'bg-rose-50 text-rose-800 border-rose-200';
    }
  };

  // Evaluate how each country treats Stocks/Mutual Funds/Savings/Net Worth for Visa Solvency + Nationality Treaties
  const evaluateCountryComprehensive = (country: Country) => {
    const monthlyCost = country.costOfLiving.monthlyBudgetSingleUSD;
    const annualLivingCost = monthlyCost * 12;
    const visaReq = country.visa.minimumIncomeUSD || 0;

    // =========================================================================
    // PILLAR 1: FINANCIAL & ASSET POTENTIAL (Max 100)
    // =========================================================================
    const runwayYears = Math.round((totalNetWorth / (annualLivingCost || 1)) * 10) / 10;
    const liquidRunwayYears = Math.round((liquidInvestableAssets / (annualLivingCost || 1)) * 10) / 10;
    const fireLivingCoveragePct = Math.round((swrMonthlyIncome / (monthlyCost || 1)) * 100);
    const fireLivingSurplusUSD = swrMonthlyIncome - monthlyCost;
    const activeSurplusUSD = effectiveMonthlyIncome - monthlyCost;

    let finScore = 0;
    // 1a. Target Budget alignment (30 pts)
    if (monthlyCost <= interactiveBudget * 0.85) finScore += 30;
    else if (monthlyCost <= interactiveBudget) finScore += 26;
    else if (monthlyCost <= interactiveBudget * 1.15) finScore += 18;
    else finScore += Math.max(6, Math.round((interactiveBudget / monthlyCost) * 18));

    // 1b. Cashflow / SWR Living Coverage (35 pts)
    if (effectiveMonthlyIncome >= monthlyCost * 2.2) finScore += 35;
    else if (effectiveMonthlyIncome >= monthlyCost * 1.5) finScore += 30;
    else if (effectiveMonthlyIncome >= monthlyCost * 1.1) finScore += 24;
    else if (effectiveMonthlyIncome >= monthlyCost) finScore += 19;
    else finScore += Math.min(15, Math.round((effectiveMonthlyIncome / (monthlyCost || 1)) * 18));

    // 1c. Net Worth Runway & Perpetual FIRE (25 pts)
    if (runwayYears >= 30) finScore += 25;
    else if (runwayYears >= 20) finScore += 21;
    else if (runwayYears >= 12) finScore += 16;
    else finScore += Math.min(12, Math.round(runwayYears));

    // 1d. Emergency Liquid Buffer (10 pts)
    const emergencyMonths = savings / (monthlyCost || 1);
    if (emergencyMonths >= 18) finScore += 10;
    else if (emergencyMonths >= 12) finScore += 8;
    else if (emergencyMonths >= 6) finScore += 6;
    else finScore += 3;

    finScore = Math.min(99, Math.max(40, finScore));
    const finGrade = formatGrade(finScore);
    const finTierLabel =
      finScore >= 90
        ? 'Prime Financial Fit'
        : finScore >= 80
        ? 'Comfortable Surplus'
        : finScore >= 70
        ? 'Balanced Financial Match'
        : finScore >= 58
        ? 'Moderate / Tight Budget'
        : 'Requires Additional Capital';

    const financialPillar: PillarGrade = {
      grade: finGrade,
      score: finScore,
      label: finTierLabel,
      badgeClass: getGradeBadgeClass(finGrade),
      headline: `${finTierLabel} · ${fireLivingCoveragePct}% SWR Coverage`,
      detail: `Cost $${monthlyCost.toLocaleString()}/mo · ${runwayYears >= 30 ? 'Perpetual FIRE (30+ yrs)' : `${runwayYears} yrs runway`}`,
    };

    // =========================================================================
    // PILLAR 2: VISA SOLVENCY (SALARY vs STOCKS/ASSETS PROOF) & NATIONALITY FIT
    // =========================================================================
    // Determine required investment/stocks/savings balance if qualifying WITHOUT fixed monthly salary
    let assetSolvencyThresholdUSD = Math.max(24000, visaReq * 12);
    let acceptsAssetsInLieuOfSalary = true;
    let assetRuleDescription = `Accepts brokerage (stocks/MF) & bank statements (~$${assetSolvencyThresholdUSD.toLocaleString()}+) or ${safeWithdrawalRate}% SWR yield`;

    if (['spain', 'france', 'italy', 'greece', 'cyprus', 'malta', 'croatia', 'montenegro', 'albania', 'georgia', 'estonia', 'romania', 'poland', 'czech-republic', 'bulgaria', 'hungary', 'slovenia', 'serbia', 'slovakia', 'morocco'].includes(country.id)) {
      assetSolvencyThresholdUSD = country.id === 'serbia' ? 45000 : Math.max(25000, visaReq * 14);
      acceptsAssetsInLieuOfSalary = true;
      assetRuleDescription =
        country.id === 'serbia'
          ? `3-Yr Residence granted upon buying property of any value (~$45k+) or bank solvency`
          : `Consulate accepts Stocks/Mutual Funds & Bank Savings ($${assetSolvencyThresholdUSD.toLocaleString()}+ liquid) in lieu of fixed salary`;
    } else if (country.id === 'portugal') {
      assetSolvencyThresholdUSD = 18000; // €11k+ local deposit + portfolio generating D7 passive yield
      acceptsAssetsInLieuOfSalary = true;
      assetRuleDescription = `D7 accepts investment dividends/4% SWR from your $${stocks.toLocaleString()} stocks + $${savings.toLocaleString()} cash`;
    } else if (country.id === 'mexico') {
      assetSolvencyThresholdUSD = 58000; // 12-month average investment/savings balance route
      acceptsAssetsInLieuOfSalary = true;
      assetRuleDescription = `Allows 12-mo Investment/Stocks/Savings balance ($${assetSolvencyThresholdUSD.toLocaleString()}+) with $0 monthly salary`;
    } else if (['thailand', 'cambodia', 'sri-lanka', 'laos', 'vietnam', 'nepal', 'india', 'fiji'].includes(country.id)) {
      assetSolvencyThresholdUSD = country.id === 'fiji' ? 44500 : country.id === 'thailand' ? 24000 : 18000;
      acceptsAssetsInLieuOfSalary = true;
      assetRuleDescription = `Qualifies via bank deposit / liquid portfolio ($${assetSolvencyThresholdUSD.toLocaleString()}+) without monthly pension`;
    } else if (['malaysia', 'indonesia', 'mauritius', 'costa-rica', 'ecuador', 'paraguay', 'brazil', 'uruguay', 'belize', 'guatemala', 'nicaragua', 'honduras', 'el-salvador', 'peru', 'colombia', 'argentina', 'dominican-republic', 'turkey', 'taiwan', 'japan', 'south-korea', 'south-africa', 'jamaica', 'saint-lucia', 'grenada', 'seychelles'].includes(country.id)) {
      assetSolvencyThresholdUSD = country.id === 'malaysia' || country.id === 'costa-rica' ? 60000 : Math.max(30000, visaReq * 15);
      acceptsAssetsInLieuOfSalary = true;
      assetRuleDescription = `Accepts investment portfolio / CD / liquid assets ($${assetSolvencyThresholdUSD.toLocaleString()}+) or passive yield`;
    } else if (['panama'].includes(country.id)) {
      // Friendly Nations / Investor accepts $200k CD/real estate if not lifetime pensionado
      assetSolvencyThresholdUSD = 200000;
      acceptsAssetsInLieuOfSalary = true;
      assetRuleDescription = `Pensionado requires $1k/mo pension OR Friendly Nations/Investor accepts $200k CD/property/assets`;
    } else if (['australia', 'new-zealand', 'singapore', 'switzerland', 'austria', 'ireland', 'andorra', 'barbados', 'bahamas', 'curacao', 'united-arab-emirates', 'st-kitts-and-nevis', 'aruba', 'cayman-islands', 'antigua-and-barbuda', 'bermuda'].includes(country.id)) {
      assetSolvencyThresholdUSD = country.id === 'united-arab-emirates' ? 272500 : Math.max(150000, visaReq * 36);
      acceptsAssetsInLieuOfSalary = true;
      assetRuleDescription = `High-net-worth investor/independent means route ($${assetSolvencyThresholdUSD.toLocaleString()}+ in stocks/liquid assets or property)`;
    }

    const meetsVisaViaMonthlyIncome =
      incomeEvalMode === 'combined'
        ? (monthlySalary + passiveMonthlyIncome >= visaReq || passiveMonthlyIncome + swrMonthlyIncome >= visaReq)
        : (passiveMonthlyIncome + swrMonthlyIncome >= visaReq);

    const meetsVisaViaStocksAndLiquidAssets =
      acceptsAssetsInLieuOfSalary &&
      (stocksAndSavingsLiquid >= assetSolvencyThresholdUSD ||
        (liquidInvestableAssets >= assetSolvencyThresholdUSD && liquidSwrMonthlyIncome >= visaReq * 0.85));

    // Nationality-specific bilateral / passport advantage
    const nat = interactiveNationality.trim();
    const isUserEuCitizen = EU_EEA_SWISS_COUNTRIES.has(nat);
    const isDestinationEu = EU_HAVEN_IDS.has(country.id);
    const isDestinationOwnCountry = country.name.toLowerCase() === nat.toLowerCase();

    let nationalityBonus = 0;
    let nationalityNote = `Standard ${country.visa.retirementVisaName} process for ${nat} passport`;

    if (isDestinationOwnCountry) {
      nationalityBonus = 25;
      nationalityNote = `Citizen of ${country.name} — Zero visa required (Right of Abode)`;
    } else if (isUserEuCitizen && isDestinationEu) {
      nationalityBonus = 25;
      nationalityNote = `EU/EEA Freedom of Movement for ${nat} nationals — No visa or income hurdle`;
    } else if (nat === 'India' && country.id === 'nepal') {
      nationalityBonus = 25;
      nationalityNote = `Indo-Nepal Treaty of Peace & Friendship — Visa-free unlimited residency for Indian nationals`;
    } else if (nat === 'India' && ['mauritius', 'thailand', 'malaysia', 'sri-lanka', 'indonesia', 'singapore', 'philippines', 'vietnam', 'cambodia', 'united-arab-emirates', 'seychelles', 'fiji'].includes(country.id)) {
      nationalityBonus = 14;
      nationalityNote = `Fast-track Golden Visa / e-Visa corridor for Indian citizens + direct flights & cultural affinity`;
    } else if (nat === 'United States' && ['albania', 'georgia'].includes(country.id)) {
      nationalityBonus = 18;
      nationalityNote = `365-day visa-free stay automatically granted to US passport holders`;
    } else if (nat === 'United States' && ['panama', 'mexico', 'costa-rica', 'belize', 'barbados', 'bahamas', 'curacao', 'el-salvador', 'aruba', 'cayman-islands', 'bermuda', 'st-kitts-and-nevis', 'jamaica', 'saint-lucia', 'grenada', 'antigua-and-barbuda'].includes(country.id)) {
      nationalityBonus = 14;
      nationalityNote = `Preferred US bilateral corridor, USD-pegged currency & 180-day visa-free / Pre-Clearance entry`;
    } else if (IBERO_LATAM_COUNTRIES.has(nat) && ['spain', 'portugal'].includes(country.id)) {
      nationalityBonus = 18;
      nationalityNote = `Fast-track 2-year EU Citizenship eligibility for ${nat} nationals`;
    } else if (IBERO_LATAM_COUNTRIES.has(nat) && ['uruguay', 'argentina', 'brazil', 'paraguay', 'colombia', 'ecuador', 'peru', 'chile'].includes(country.id)) {
      nationalityBonus = 16;
      nationalityNote = `Mercosur / Regional Residency accord for ${nat} citizens`;
    } else if (COMMONWEALTH_CANZUK_COUNTRIES.has(nat) && ['australia', 'new-zealand', 'malta', 'cyprus', 'mauritius', 'barbados', 'bahamas', 'malaysia', 'south-africa', 'fiji', 'st-kitts-and-nevis', 'jamaica', 'saint-lucia', 'grenada', 'antigua-and-barbuda', 'bermuda', 'cayman-islands', 'seychelles'].includes(country.id)) {
      nationalityBonus = 12;
      nationalityNote = `Commonwealth legal & reciprocal bilateral familiarity for ${nat} nationals`;
    } else if (country.id === 'georgia') {
      nationalityBonus = 12;
      nationalityNote = `365-day visa-free entry for 95+ nationalities with simple residency`;
    }

    let visaScore = 50;
    let qualificationMethodLabel = '';

    if (isDestinationOwnCountry || (isUserEuCitizen && isDestinationEu) || (nat === 'India' && country.id === 'nepal')) {
      visaScore = 99;
      qualificationMethodLabel = 'Visa-Free Right of Residence';
    } else if (meetsVisaViaMonthlyIncome && meetsVisaViaStocksAndLiquidAssets) {
      visaScore = 84 + Math.max(0, (5 - country.visa.difficultyRating) * 3) + Math.min(10, nationalityBonus);
      qualificationMethodLabel =
        incomeEvalMode === 'assets-only'
          ? `Qualifies via ${safeWithdrawalRate}% SWR ($${swrMonthlyIncome.toLocaleString()}/mo) + Stocks/Savings ($${stocksAndSavingsLiquid.toLocaleString()})`
          : `Dual Qualification: Monthly Income ($${effectiveMonthlyIncome.toLocaleString()}/mo) & Stocks/Assets ($${stocksAndSavingsLiquid.toLocaleString()})`;
    } else if (meetsVisaViaStocksAndLiquidAssets) {
      visaScore = 82 + Math.max(0, (5 - country.visa.difficultyRating) * 2) + Math.min(10, nationalityBonus);
      qualificationMethodLabel = `Qualifies via Stocks/Mutual Funds & Savings Proof ($${stocksAndSavingsLiquid.toLocaleString()} ≥ $${assetSolvencyThresholdUSD.toLocaleString()})`;
    } else if (meetsVisaViaMonthlyIncome) {
      visaScore = 80 + Math.max(0, (5 - country.visa.difficultyRating) * 2) + Math.min(10, nationalityBonus);
      qualificationMethodLabel = `Qualifies via Monthly Income ($${effectiveMonthlyIncome.toLocaleString()}/mo ≥ $${visaReq.toLocaleString()}/mo)`;
    } else {
      const incomeRatio = visaReq > 0 ? effectiveMonthlyIncome / visaReq : 1;
      const assetRatio = assetSolvencyThresholdUSD > 0 ? stocksAndSavingsLiquid / assetSolvencyThresholdUSD : 1;
      const bestRatio = Math.max(incomeRatio, assetRatio);
      visaScore = Math.min(68, Math.max(35, Math.round(bestRatio * 65) + Math.min(8, nationalityBonus)));
      qualificationMethodLabel = `Requires $${visaReq.toLocaleString()}/mo OR $${assetSolvencyThresholdUSD.toLocaleString()} in Stocks/Savings`;
    }

    visaScore = Math.min(99, Math.max(35, visaScore));
    const visaGrade = formatGrade(visaScore);

    const visaPillar: PillarGrade = {
      grade: visaGrade,
      score: visaScore,
      label: qualificationMethodLabel,
      badgeClass: getGradeBadgeClass(visaGrade),
      headline: qualificationMethodLabel,
      detail: `${nationalityNote} · ${assetRuleDescription}`,
    };

    // =========================================================================
    // PILLAR 3: LANGUAGES KNOWN & CULTURAL INTEGRATION (Max 100)
    // =========================================================================
    const userLangs = userProfile.languagesKnown || [{ id: 'en', language: 'English', proficiency: 'Native' }];
    const countryLangLower = country.language.toLowerCase();

    const matchedLang = userLangs.find(
      l =>
        countryLangLower.includes(l.language.toLowerCase()) ||
        l.language.toLowerCase().includes(countryLangLower.split(' ')[0].replace(/[^a-z]/g, ''))
    );

    const speaksEnglish = userLangs.some(l => l.language.toLowerCase() === 'english');
    let langScore = 60;
    let langHeadline = '';
    let langDetail = '';

    if (matchedLang) {
      if (matchedLang.proficiency === 'Native' || matchedLang.proficiency === 'Fluent') {
        langScore = 98;
      } else if (matchedLang.proficiency === 'Conversational') {
        langScore = 90;
      } else {
        langScore = 82;
      }
      langHeadline = `Direct Match: ${matchedLang.language} (${matchedLang.proficiency})`;
      langDetail = `Official language is ${country.language} · Local English: ${country.lifestyle.englishProficiency}`;
    } else if (speaksEnglish) {
      if (country.lifestyle.englishProficiency === 'Very High') {
        langScore = 94;
        langHeadline = `Very High English Fluency Nationwide`;
      } else if (country.lifestyle.englishProficiency === 'High') {
        langScore = 85;
        langHeadline = `High English Proficiency in Expat Hubs`;
      } else if (country.lifestyle.englishProficiency === 'Moderate') {
        langScore = 73;
        langHeadline = `Moderate English (${country.language} Helpful)`;
      } else {
        langScore = 58;
        langHeadline = `Local Language (${country.language}) Recommended`;
      }
      langDetail = `Primary language: ${country.language} · English proficiency: ${country.lifestyle.englishProficiency}`;
    } else {
      langScore = 62;
      langHeadline = `Primary Language: ${country.language}`;
      langDetail = `English proficiency: ${country.lifestyle.englishProficiency}`;
    }

    const langGrade = formatGrade(langScore);
    const languagePillar: PillarGrade = {
      grade: langGrade,
      score: langScore,
      label: langHeadline,
      badgeClass: getGradeBadgeClass(langGrade),
      headline: langHeadline,
      detail: langDetail,
    };

    // =========================================================================
    // PILLAR 4: WEATHER/CLIMATE, HEALTHCARE & DATING/NIGHTLIFE SCENE (Max 100)
    // =========================================================================
    let climatePts = 22;
    if (interactiveClimate === 'Any') {
      climatePts = 27;
    } else if (country.climate.category === interactiveClimate) {
      climatePts = 32;
    } else {
      climatePts = 16;
    }

    const healthSafetyPts = Math.round(((country.lifestyle.healthcareScore * 0.6 + country.lifestyle.safetyScore * 0.4) / 100) * 36);

    const datingScore10 = country.demographics?.datingRating ? country.demographics.datingRating * 2 : 7;
    const nightlifeScore10 = country.adultEntertainment?.nightlifeScore ? country.adultEntertainment.nightlifeScore * 2 : 7;
    const femaleRatio = country.demographics?.femalesPer100Males || 100;
    const rawSocialAvg = (datingScore10 * 0.55 + nightlifeScore10 * 0.45) * 10; // 0 to 100

    let socialPts = Math.round((rawSocialAvg / 100) * 32);
    if (socialDatingPriority === 'high-dating') {
      // Boost weight for strong dating/nightlife & favorable demographics
      socialPts = Math.round((rawSocialAvg / 100) * 38) + (femaleRatio >= 103 ? 5 : 0);
    } else if (socialDatingPriority === 'expat-hub') {
      socialPts =
        country.lifestyle.expatCommunitySize === 'Large'
          ? 34
          : country.lifestyle.expatCommunitySize === 'Medium'
          ? 25
          : 16;
    } else if (socialDatingPriority === 'quiet-wellness') {
      socialPts = Math.round(((country.lifestyle.safetyScore * 0.5 + country.lifestyle.healthcareScore * 0.5) / 100) * 34);
    }

    const lifestyleScore = Math.min(99, Math.max(48, climatePts + healthSafetyPts + socialPts));
    const lifestyleGrade = formatGrade(lifestyleScore);

    const lifestylePillar: PillarGrade = {
      grade: lifestyleGrade,
      score: lifestyleScore,
      label: `${country.climate.category} · Dating ${datingScore10}/10`,
      badgeClass: getGradeBadgeClass(lifestyleGrade),
      headline: `${country.climate.category} (${country.climate.annualSunnyDays}d sun) · Dating ${datingScore10}/10 · Nightlife ${nightlifeScore10}/10`,
      detail: `Healthcare ${country.lifestyle.healthcareScore}/100 · Safety ${country.lifestyle.safetyScore}/100 · F/M Ratio ${femaleRatio}:100`,
    };

    // =========================================================================
    // OVERALL WEIGHTED SUITABILITY SCORE (0 to 99%)
    // =========================================================================
    let overallScore = Math.round(
      finScore * 0.32 +
      visaScore * 0.28 +
      langScore * 0.16 +
      lifestyleScore * 0.24
    );

    if (socialDatingPriority === 'high-dating') {
      overallScore = Math.round(
        finScore * 0.26 +
        visaScore * 0.24 +
        langScore * 0.14 +
        lifestyleScore * 0.36
      );
    }

    overallScore = Math.min(99, Math.max(45, overallScore));
    const overallGrade = formatGrade(overallScore);

    return {
      country,
      overallScore,
      overallGrade,
      overallBadgeClass: getGradeBadgeClass(overallGrade),
      financialPillar,
      visaPillar,
      languagePillar,
      lifestylePillar,
      monthlyCost,
      visaReq,
      runwayYears,
      liquidRunwayYears,
      fireLivingCoveragePct,
      fireLivingSurplusUSD,
      activeSurplusUSD,
      assetSolvencyThresholdUSD,
      meetsVisaViaMonthlyIncome,
      meetsVisaViaStocksAndLiquidAssets,
      nationalityNote,
    };
  };

  // Compute and rank all countries
  const allRankedAnalyses = useMemo(() => {
    return countries
      .map(c => evaluateCountryComprehensive(c))
      .sort((a, b) => b.overallScore - a.overallScore);
  }, [
    countries,
    interactiveBudget,
    interactiveClimate,
    interactiveNationality,
    safeWithdrawalRate,
    incomeEvalMode,
    socialDatingPriority,
    userProfile.languagesKnown,
    monthlySalary,
    passiveMonthlyIncome,
    totalNetWorth,
    stocksAndSavingsLiquid,
    liquidInvestableAssets,
  ]);

  // Apply scope, region, and search filters while preserving global rank index
  const displayedAnalyses = useMemo(() => {
    let list = allRankedAnalyses.map((item, idx) => ({
      ...item,
      globalRank: idx + 1,
    }));

    if (scopeTab === 'shortlist') {
      const saved = list.filter(item => userProfile.savedCountryIds.includes(item.country.id));
      list = saved.length > 0 ? saved : list.slice(0, 6);
    } else if (scopeTab === 'target') {
      const target = list.filter(
        item => item.country.name.toLowerCase() === userProfile.targetCountry.toLowerCase()
      );
      list = target.length > 0 ? target : list.slice(0, 1);
    }

    if (selectedRegion !== 'All') {
      list = list.filter(item => item.country.region === selectedRegion);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        item =>
          item.country.name.toLowerCase().includes(q) ||
          item.country.capital.toLowerCase().includes(q) ||
          item.country.visa.retirementVisaName.toLowerCase().includes(q) ||
          item.country.language.toLowerCase().includes(q)
      );
    }

    if (scopeTab === 'top' && !searchQuery.trim() && selectedRegion === 'All') {
      return list.slice(0, 6);
    }

    return list;
  }, [allRankedAnalyses, scopeTab, selectedRegion, searchQuery, userProfile.savedCountryIds, userProfile.targetCountry]);

  const handleSavePreferencesToProfile = () => {
    updateUserProfile({
      monthlyBudgetUSD: interactiveBudget,
      preferredClimate: interactiveClimate,
      originCountry: interactiveNationality,
      finances: {
        ...finances,
        safeWithdrawalRatePercent: safeWithdrawalRate,
      },
    });
  };

  const hasUnsavedChanges =
    interactiveBudget !== userProfile.monthlyBudgetUSD ||
    interactiveClimate !== userProfile.preferredClimate ||
    interactiveNationality !== userProfile.originCountry ||
    safeWithdrawalRate !== (finances.safeWithdrawalRatePercent || 4.0);

  return (
    <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
      
      {/* Top Header & Unified AI Profile Context Strip */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 via-amber-500 to-purple-600 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  Haven Matcher AI Recommendation & Financial Potential Engine
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-900 border border-orange-200 uppercase tracking-wider">
                  Unified 4-Pillar Ranking · {countries.length} Havens
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Holistic ranking combining your <strong>Financial & Stocks/Assets Visa Solvency</strong>, <strong>Nationality ({getWorldCountryFlag(interactiveNationality)} {interactiveNationality})</strong>, <strong>Known Languages</strong>, <strong>Weather</strong>, and <strong>Dating/Nightlife Scene</strong>.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {hasUnsavedChanges && (
            <button
              onClick={handleSavePreferencesToProfile}
              className="px-3.5 py-2 text-xs font-bold rounded-xl bg-teal-800 text-white hover:bg-teal-900 transition-colors shadow-xs flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Scenario to Profile</span>
            </button>
          )}
          <button
            onClick={() => openEditProfile('finances')}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-orange-50 text-orange-900 border border-orange-200 hover:bg-orange-100 transition-colors flex items-center gap-1.5"
          >
            <DollarSign className="w-3.5 h-3.5 text-orange-600" />
            <span>Update Assets & Salary</span>
          </button>
        </div>
      </div>

      {/* Active User Intelligence Snapshot Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 p-3.5 rounded-xl bg-gradient-to-r from-orange-50/70 via-purple-50/40 to-slate-50 border border-orange-200/70 text-xs">
        <div className="p-2.5 rounded-lg bg-white/90 border border-slate-200/70">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Nationality / Passport</span>
          <div className="font-bold text-slate-900 mt-0.5 truncate">
            {getWorldCountryFlag(interactiveNationality)} {interactiveNationality}
          </div>
          <span className="text-[10px] text-slate-500 block truncate">
            Residing: {getWorldCountryFlag(userProfile.residingCountry || userProfile.originCountry)} {userProfile.residingCountry || userProfile.originCountry}
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-white/90 border border-slate-200/70">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Stocks & Cash Proof</span>
          <div className="font-mono font-extrabold text-emerald-800 mt-0.5">
            ${stocksAndSavingsLiquid.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-500 block truncate">
            Stocks: ${stocks.toLocaleString()} · Cash: ${savings.toLocaleString()}
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-white/90 border border-slate-200/70">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Net Worth</span>
          <div className="font-mono font-extrabold text-orange-950 mt-0.5">
            ${totalNetWorth.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-500 block truncate">
            Liquid: ${liquidInvestableAssets.toLocaleString()}
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-white/90 border border-slate-200/70">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">{safeWithdrawalRate.toFixed(1)}% SWR + Passive</span>
          <div className="font-mono font-extrabold text-purple-900 mt-0.5">
            ${(swrMonthlyIncome + passiveMonthlyIncome).toLocaleString()}/mo
          </div>
          <span className="text-[10px] text-slate-500 block truncate">
            Salary: ${monthlySalary.toLocaleString()}/mo
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-white/90 border border-slate-200/70">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Languages Spoken</span>
          <div className="font-bold text-slate-900 mt-0.5 truncate">
            {(userProfile.languagesKnown || []).map(l => l.language).join(', ') || 'English'}
          </div>
          <span className="text-[10px] text-teal-700 font-medium block truncate">
            {(userProfile.languagesKnown || []).length || 1} language(s) active
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-white/90 border border-slate-200/70">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Target Haven</span>
          <div className="font-bold text-slate-900 mt-0.5 truncate">
            {getWorldCountryFlag(userProfile.targetCountry)} {userProfile.targetCountry}
          </div>
          <span className="text-[10px] text-slate-500 block truncate">
            Timeline: {userProfile.retirementTimelineYear}
          </span>
        </div>
      </div>

      {/* Interactive Multi-Parameter Control Console */}
      <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200/90 space-y-4 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Control 1: Origin Country / Nationality (For Visa Treaties) */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 flex items-center justify-between">
              <span>Passport / Nationality</span>
              <span className="text-[10px] text-purple-700 font-medium">Visa Treaty Rules</span>
            </label>
            <select
              value={interactiveNationality}
              onChange={e => setInteractiveNationality(e.target.value)}
              className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white font-medium text-slate-800"
            >
              {!WORLD_COUNTRIES.some(c => c.name === interactiveNationality) && interactiveNationality && (
                <option value={interactiveNationality}>🌍 {interactiveNationality}</option>
              )}
              {WORLD_COUNTRIES.map(c => (
                <option key={`matcher-nat-${c.code}-${c.name}`} value={c.name}>
                  {c.flag} {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Control 2: Visa Solvency Mode (Salary + Assets vs Assets & Stocks Proof Only) */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 flex items-center justify-between">
              <span>Visa Solvency Mode</span>
              <span className="text-[10px] text-emerald-700 font-medium">Stocks & Asset Proof</span>
            </label>
            <select
              value={incomeEvalMode}
              onChange={e => setIncomeEvalMode(e.target.value as 'combined' | 'assets-only')}
              className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white font-medium text-slate-800"
            >
              <option value="combined">Active Salary + Passive + Stocks/Assets</option>
              <option value="assets-only">No Fixed Salary (Stocks/Assets & {safeWithdrawalRate}% SWR Only)</option>
            </select>
          </div>

          {/* Control 3: Dating Life, Nightlife & Social Scene Weighting */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 flex items-center justify-between">
              <span>Social, Dating & Nightlife Focus</span>
              <span className="text-[10px] text-orange-700 font-medium">Lifestyle Weight</span>
            </label>
            <select
              value={socialDatingPriority}
              onChange={e => setSocialDatingPriority(e.target.value as any)}
              className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white font-medium text-slate-800"
            >
              <option value="balanced">Balanced (All 4 Pillars Weighted Equally)</option>
              <option value="high-dating">Vibrant Dating & Nightlife Scene Priority</option>
              <option value="expat-hub">Large English-Speaking Expat Community</option>
              <option value="quiet-wellness">Peaceful Safety & Healthcare Priority</option>
            </select>
          </div>

          {/* Control 4: Preferred Weather / Climate */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 flex items-center justify-between">
              <span>Preferred Weather / Climate</span>
              <span className="text-[10px] text-amber-700 font-medium">Sunshine Match</span>
            </label>
            <select
              value={interactiveClimate}
              onChange={e => setInteractiveClimate(e.target.value as ClimateCategory | 'Any')}
              className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white font-medium text-slate-800"
            >
              {climateOptions.map(c => (
                <option key={c} value={c}>
                  {c === 'Any' ? 'Any Climate Category' : c}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Sliders Row: Target Monthly Budget & Safe Withdrawal Rate (SWR) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3 border-t border-slate-200/80">
          
          {/* Monthly Budget Slider */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-700">Target Monthly Living Budget:</span>
              <span className="font-mono tabular-nums font-bold text-teal-900">
                ${interactiveBudget.toLocaleString()} USD/mo
              </span>
            </div>
            <input
              type="range"
              min={1100}
              max={4500}
              step={50}
              value={interactiveBudget}
              onChange={e => setInteractiveBudget(Number(e.target.value))}
              className="w-full accent-teal-700 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>$1,100/mo</span>
              <span>$2,800/mo</span>
              <span>$4,500/mo</span>
            </div>
          </div>

          {/* Safe Withdrawal Rate Slider */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-700">
                Portfolio Safe Withdrawal Rate (SWR):
              </span>
              <span className="font-mono tabular-nums font-bold text-orange-900">
                {safeWithdrawalRate.toFixed(2)}% / yr (${swrMonthlyIncome.toLocaleString()}/mo yield)
              </span>
            </div>
            <input
              type="range"
              min={3.0}
              max={5.0}
              step={0.25}
              value={safeWithdrawalRate}
              onChange={e => setSafeWithdrawalRate(parseFloat(e.target.value))}
              className="w-full accent-orange-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>3.0% (Conservative)</span>
              <span>4.0% (Standard Trinity)</span>
              <span>5.0% (Flexible)</span>
            </div>
          </div>

        </div>
      </div>

      {/* Scope Tabs, Region Filter & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
        <div className="inline-flex flex-wrap rounded-xl border border-slate-200 p-1 bg-slate-50 text-xs font-semibold gap-1">
          <button
            onClick={() => setScopeTab('top')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              scopeTab === 'top'
                ? 'bg-gradient-to-r from-orange-600 to-purple-600 text-white shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Top 6 AI Matches
          </button>
          <button
            onClick={() => setScopeTab('shortlist')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              scopeTab === 'shortlist'
                ? 'bg-gradient-to-r from-orange-600 to-purple-600 text-white shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            My Shortlist ({userProfile.savedCountryIds.length})
          </button>
          <button
            onClick={() => setScopeTab('target')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              scopeTab === 'target'
                ? 'bg-gradient-to-r from-orange-600 to-purple-600 text-white shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Target Haven ({userProfile.targetCountry})
          </button>
          <button
            onClick={() => setScopeTab('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              scopeTab === 'all'
                ? 'bg-gradient-to-r from-orange-600 to-purple-600 text-white shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All {countries.length} Havens Ranked
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedRegion}
            onChange={e => setSelectedRegion(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
          >
            <option value="All">All Regions</option>
            <option value="Europe">Europe</option>
            <option value="Southeast Asia">Southeast Asia</option>
            <option value="Americas">Americas</option>
          </select>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search country or visa..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs w-44 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>
      </div>

      {/* Ranked Country Recommendations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {displayedAnalyses.map(item => {
          const {
            country,
            globalRank,
            overallScore,
            overallGrade,
            overallBadgeClass,
            financialPillar,
            visaPillar,
            languagePillar,
            lifestylePillar,
            monthlyCost,
            visaReq,
            runwayYears,
            fireLivingCoveragePct,
            assetSolvencyThresholdUSD,
            meetsVisaViaMonthlyIncome,
            meetsVisaViaStocksAndLiquidAssets,
          } = item;

          const saved = isCountrySaved(country.id);
          const compared = isCountryCompared(country.id);
          const isTarget = country.name.toLowerCase() === userProfile.targetCountry.toLowerCase();

          return (
            <div
              key={country.id}
              className={`rounded-2xl border p-5 sm:p-6 flex flex-col justify-between transition-all shadow-2xs ${
                isTarget
                  ? 'border-orange-400/90 bg-orange-50/15 ring-2 ring-orange-500/10'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div>
                {/* Top Header: Rank, Flag, Country Name, Overall Score & Overall Grade */}
                <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <CountryFlag
                      countryCode={country.code}
                      countryName={country.name}
                      fallbackEmoji={country.flag}
                      size="xl"
                      className="w-9 h-6 rounded-xs shrink-0"
                    />
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-md bg-slate-900 text-white font-mono text-[10px] font-bold uppercase tracking-wider">
                          Rank #{globalRank}
                        </span>
                        {isTarget && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-gradient-to-r from-orange-600 to-purple-600 text-white">
                            Target Haven
                          </span>
                        )}
                        {saved && !isTarget && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            Shortlisted
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-extrabold text-slate-900 mt-1 leading-tight">
                        {country.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {country.capital} · {country.region} · {country.visa.retirementVisaName}
                      </p>
                    </div>
                  </div>

                  {/* Overall Suitability Score & Letter Grade */}
                  <div className="text-right shrink-0">
                    <div className="flex items-center justify-end gap-1.5">
                      <span className="font-mono tabular-nums text-2xl font-extrabold text-slate-900">
                        {overallScore}%
                      </span>
                      <span className={`px-2 py-0.5 rounded-lg text-xs font-extrabold border ${overallBadgeClass}`}>
                        {overallGrade}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider mt-0.5">
                      Overall Potential
                    </span>
                  </div>
                </div>

                {/* Key Financial & Visa Solvency Strip (4 Compact Metrics) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-3.5">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Living Cost</span>
                    <div className="font-mono font-bold text-xs text-slate-900 mt-0.5">
                      ${monthlyCost.toLocaleString()}<span className="text-[10px] font-normal text-slate-500">/mo</span>
                    </div>
                    <span className="text-[10px] font-semibold text-teal-700 block mt-0.5">
                      {monthlyCost <= interactiveBudget ? `-$${(interactiveBudget - monthlyCost).toLocaleString()} under target` : `+$${(monthlyCost - interactiveBudget).toLocaleString()} over`}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Visa Income Req</span>
                    <div className="font-mono font-bold text-xs text-slate-900 mt-0.5">
                      ${visaReq.toLocaleString()}<span className="text-[10px] font-normal text-slate-500">/mo</span>
                    </div>
                    <span className={`text-[10px] font-semibold block mt-0.5 ${meetsVisaViaMonthlyIncome ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {meetsVisaViaMonthlyIncome ? 'Income Covered' : 'Use Asset Proof'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Stocks/Asset Proof</span>
                    <div className="font-mono font-bold text-xs text-slate-900 mt-0.5">
                      ${assetSolvencyThresholdUSD.toLocaleString()}
                    </div>
                    <span className={`text-[10px] font-semibold block mt-0.5 ${meetsVisaViaStocksAndLiquidAssets ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {meetsVisaViaStocksAndLiquidAssets ? 'Assets Qualify ✓' : 'Below Asset Min'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Net Worth Runway</span>
                    <div className="font-mono font-bold text-xs text-slate-900 mt-0.5">
                      {runwayYears} <span className="text-[10px] font-normal text-slate-500">Yrs</span>
                    </div>
                    <span className="text-[10px] font-semibold text-purple-800 block mt-0.5">
                      {fireLivingCoveragePct}% SWR cover
                    </span>
                  </div>
                </div>

                {/* 4 Categorized Sub-Grades Breakdown Inside Country Card */}
                <div className="space-y-2 mt-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Categorized Suitability & Grade Breakdown:
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    
                    {/* Category 1: Financial Potential */}
                    <div className="p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/40 flex flex-col justify-between">
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>1. Financial Potential</span>
                        </span>
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-extrabold border ${financialPillar.badgeClass}`}>
                          {financialPillar.grade} ({financialPillar.score})
                        </span>
                      </div>
                      <p className="text-[11px] font-semibold text-slate-700 mt-1">
                        {financialPillar.headline}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                        {financialPillar.detail}
                      </p>
                    </div>

                    {/* Category 2: Visa & Nationality + Stocks/Asset Solvency */}
                    <div className="p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/40 flex flex-col justify-between">
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
                          <Shield className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                          <span>2. Visa & Nationality Fit</span>
                        </span>
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-extrabold border ${visaPillar.badgeClass}`}>
                          {visaPillar.grade} ({visaPillar.score})
                        </span>
                      </div>
                      <p className="text-[11px] font-semibold text-slate-700 mt-1">
                        {visaPillar.headline}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                        {visaPillar.detail}
                      </p>
                    </div>

                    {/* Category 3: Language & Cultural Ease */}
                    <div className="p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/40 flex flex-col justify-between">
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
                          <Languages className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          <span>3. Language & Culture</span>
                        </span>
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-extrabold border ${languagePillar.badgeClass}`}>
                          {languagePillar.grade} ({languagePillar.score})
                        </span>
                      </div>
                      <p className="text-[11px] font-semibold text-slate-700 mt-1">
                        {languagePillar.headline}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                        {languagePillar.detail}
                      </p>
                    </div>

                    {/* Category 4: Weather, Healthcare & Dating/Nightlife */}
                    <div className="p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/40 flex flex-col justify-between">
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
                          <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span>4. Weather & Social/Dating</span>
                        </span>
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-extrabold border ${lifestylePillar.badgeClass}`}>
                          {lifestylePillar.grade} ({lifestylePillar.score})
                        </span>
                      </div>
                      <p className="text-[11px] font-semibold text-slate-700 mt-1">
                        {lifestylePillar.headline}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                        {lifestylePillar.detail}
                      </p>
                    </div>

                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => toggleSaveCountry(country.id)}
                    className={`p-1.5 rounded-lg border text-xs transition-colors ${
                      saved
                        ? 'bg-rose-50 text-rose-600 border-rose-200'
                        : 'bg-white text-slate-500 border-slate-200 hover:text-rose-600'
                    }`}
                    title={saved ? 'Remove from shortlist' : 'Save to shortlist'}
                  >
                    <Heart className={`w-3.5 h-3.5 ${saved ? 'fill-rose-600' : ''}`} />
                  </button>

                  <button
                    onClick={() => toggleCompareCountry(country.id)}
                    className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors ${
                      compared
                        ? 'bg-teal-700 text-white border-teal-700'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                    title="Compare in matrix"
                  >
                    <Scale className="w-3.5 h-3.5 inline mr-1" />
                    <span>{compared ? 'Compared' : 'Compare'}</span>
                  </button>

                  <span className="text-[11px] text-slate-400 hidden sm:inline ml-1">
                    Tax: {country.visa.taxStatus.split('.')[0]}
                  </span>
                </div>

                <button
                  onClick={() => navigateToCountry(country.id)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-teal-800 hover:bg-teal-50 border border-teal-200 inline-flex items-center gap-1 transition-colors"
                >
                  <span>Full Dossier</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
