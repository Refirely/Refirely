import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Country, ClimateCategory, UserFinancialPortfolio } from '../types';
import { DEFAULT_FINANCIAL_PORTFOLIO, WORLD_COUNTRIES, getWorldCountryFlag } from '../data/userAccounts';
import { getCountryNomadProfile, CountryNomadProfile } from '../data/countryNomadProfiles';
import { CountryFlag } from './CountryFlag';
import {
  Sparkles, ArrowRight, Heart, Check, Scale, Sun, DollarSign, Shield,
  SlidersHorizontal, Award, Globe, Languages, TrendingUp, CheckCircle2,
  AlertTriangle, Search, Sliders, Users, Landmark, Coins, Info,
  EyeOff, RotateCcw, X, Zap, Compass, Wifi, Laptop, Coffee, Briefcase
} from 'lucide-react';
import { CONTINENT_FILTER_OPTIONS, matchesContinentFilter } from '../utils/continents';

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

export type NomadPriorityFocus =
  | 'balanced-nomad'
  | 'internet-coworking'
  | 'dnv-tax-friendly'
  | 'low-burn-runway'
  | 'creator-dating-vibe'
  | 'safety-power-grid';

export type NomadWorkspaceFilter =
  | 'any'
  | 'world-class'
  | 'laptop-cafes'
  | 'strict-dnv-fit';

export type MatcherSortOption =
  | 'overall-score'
  | 'financial-score'
  | 'visa-score'
  | 'work-infra-score'
  | 'cost-asc'
  | 'dnv-income-asc'
  | 'internet-desc'
  | 'lifestyle-score';

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
    ignoredCountryIds,
    toggleIgnoreCountry,
    isCountryIgnored,
    restoreCountry,
    currentPersona,
    setCurrentPersona,
  } = useApp();

  const isNomadMode = currentPersona === 'nomad';

  // Active user finances
  const finances: UserFinancialPortfolio = useMemo(() => {
    return userProfile.finances || DEFAULT_FINANCIAL_PORTFOLIO;
  }, [userProfile.finances]);

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

  // Interactive Filters & Simulation Controls (synced with userProfile defaults)
  const [scopeTab, setScopeTab] = useState<'top' | 'shortlist' | 'target' | 'all' | 'ignored'>('top');
  const [recentlyDiscardedCountry, setRecentlyDiscardedCountry] = useState<{ id: string; name: string } | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [interactiveBudget, setInteractiveBudget] = useState<number>(userProfile.monthlyBudgetUSD || 2500);
  const [interactiveClimate, setInteractiveClimate] = useState<ClimateCategory | 'Any'>(userProfile.preferredClimate || 'Any');
  const [interactiveNationality, setInteractiveNationality] = useState<string>(userProfile.originCountry || 'United States');
  const [safeWithdrawalRate, setSafeWithdrawalRate] = useState<number>(finances.safeWithdrawalRatePercent || 4.0);
  const [incomeEvalMode, setIncomeEvalMode] = useState<'combined' | 'assets-only'>('combined');
  const [socialDatingPriority, setSocialDatingPriority] = useState<'balanced' | 'high-dating' | 'expat-hub' | 'quiet-wellness'>('balanced');

  // Digital Nomad Specific Interactive Controls & Sliders
  const defaultRemoteIncome = useMemo(() => {
    const combined = monthlySalary + passiveMonthlyIncome;
    if (combined > 0) return Math.min(8000, Math.max(500, Math.round(combined / 100) * 100));
    return 3500;
  }, [monthlySalary, passiveMonthlyIncome]);

  const [nomadRemoteIncomeUSD, setNomadRemoteIncomeUSD] = useState<number>(defaultRemoteIncome);
  const [minInternetSpeedMbps, setMinInternetSpeedMbps] = useState<number>(50);
  const [nomadPriorityFocus, setNomadPriorityFocus] = useState<NomadPriorityFocus>('balanced-nomad');
  const [nomadWorkspaceFilter, setNomadWorkspaceFilter] = useState<NomadWorkspaceFilter>('any');
  const [matcherSortBy, setMatcherSortBy] = useState<MatcherSortOption>('overall-score');

  // Keep interactive defaults updated when user switches account or updates profile
  useEffect(() => {
    setInteractiveBudget(userProfile.monthlyBudgetUSD || 2500);
    setInteractiveClimate(userProfile.preferredClimate || 'Any');
    setInteractiveNationality(userProfile.originCountry || 'United States');
    if (finances.safeWithdrawalRatePercent) {
      setSafeWithdrawalRate(finances.safeWithdrawalRatePercent);
    }
    setNomadRemoteIncomeUSD(defaultRemoteIncome);
  }, [userProfile.id, userProfile.monthlyBudgetUSD, userProfile.preferredClimate, userProfile.originCountry, finances.safeWithdrawalRatePercent, defaultRemoteIncome]);

  // Reset sort option if switching persona and current sort option is persona-specific
  useEffect(() => {
    setMatcherSortBy('overall-score');
  }, [currentPersona]);

  const climateOptions: (ClimateCategory | 'Any')[] = [
    'Any',
    'Mediterranean',
    'Tropical',
    'Subtropical',
    'Temperate',
    'Highlands / Mild',
  ];

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

  // Helper for nationality bilateral advantage
  const computeNationalityAdvantage = (country: Country, visaLabel: string) => {
    const nat = interactiveNationality.trim();
    const isUserEuCitizen = EU_EEA_SWISS_COUNTRIES.has(nat);
    const isDestinationEu = EU_HAVEN_IDS.has(country.id);
    const isDestinationOwnCountry = country.name.toLowerCase() === nat.toLowerCase();

    let nationalityBonus = 0;
    let nationalityNote = `Standard ${visaLabel} process for ${nat} passport`;

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
      nationalityNote = `Fast-track Visa / e-Visa corridor for Indian citizens + direct flights & cultural affinity`;
    } else if (nat === 'United States' && ['albania', 'georgia'].includes(country.id)) {
      nationalityBonus = 18;
      nationalityNote = `365-day visa-free stay & remote work automatically granted to US passport holders`;
    } else if (nat === 'United States' && ['panama', 'mexico', 'costa-rica', 'belize', 'barbados', 'bahamas', 'curacao', 'el-salvador', 'aruba', 'cayman-islands', 'bermuda', 'st-kitts-and-nevis', 'jamaica', 'saint-lucia', 'grenada', 'antigua-and-barbuda'].includes(country.id)) {
      nationalityBonus = 14;
      nationalityNote = `Preferred US bilateral corridor, time-zone alignment & 180-day visa-free entry`;
    } else if (IBERO_LATAM_COUNTRIES.has(nat) && ['spain', 'portugal'].includes(country.id)) {
      nationalityBonus = 18;
      nationalityNote = `Fast-track 2-year EU Citizenship eligibility for ${nat} nationals`;
    } else if (IBERO_LATAM_COUNTRIES.has(nat) && ['uruguay', 'argentina', 'brazil', 'paraguay', 'colombia', 'ecuador', 'peru', 'chile'].includes(country.id)) {
      nationalityBonus = 16;
      nationalityNote = `Mercosur / Regional Residency & work accord for ${nat} citizens`;
    } else if (COMMONWEALTH_CANZUK_COUNTRIES.has(nat) && ['australia', 'new-zealand', 'malta', 'cyprus', 'mauritius', 'barbados', 'bahamas', 'malaysia', 'south-africa', 'fiji', 'st-kitts-and-nevis', 'jamaica', 'saint-lucia', 'grenada', 'antigua-and-barbuda', 'bermuda', 'cayman-islands', 'seychelles'].includes(country.id)) {
      nationalityBonus = 12;
      nationalityNote = `Commonwealth legal & reciprocal bilateral familiarity for ${nat} nationals`;
    } else if (country.id === 'georgia') {
      nationalityBonus = 14;
      nationalityNote = `365-day visa-free remote work entry for 95+ nationalities`;
    }

    return {
      isDestinationOwnCountry,
      isUserEuCitizen,
      isDestinationEu,
      nat,
      nationalityBonus,
      nationalityNote,
    };
  };

  // ===========================================================================
  // EVALUATION ENGINE: RETIREE vs DIGITAL NOMAD
  // ===========================================================================
  const evaluateCountryComprehensive = (country: Country) => {
    const nomadProfile: CountryNomadProfile = getCountryNomadProfile(country);

    // -------------------------------------------------------------------------
    // DIGITAL NOMAD & CREATOR EVALUATION MODE
    // -------------------------------------------------------------------------
    if (isNomadMode) {
      const monthlyBurn = nomadProfile.monthlyNomadBurnUSD;
      const dnvIncomeReq = nomadProfile.remoteWorkVisaIncomeUSD || 0;
      const nomadMonthlySurplus = nomadRemoteIncomeUSD - monthlyBurn;
      const liquidRunwayMonths = Math.max(1, Math.round(stocksAndSavingsLiquid / Math.max(500, monthlyBurn)));
      const runwayYears = Math.round((liquidRunwayMonths / 12) * 10) / 10;

      // PILLAR 1 (Nomad): Monthly Burn, Cashflow Savings & Runway Potential (Max 100)
      let finScore = 0;
      // 1a. Target Burn alignment (35 pts)
      if (monthlyBurn <= interactiveBudget * 0.85) finScore += 35;
      else if (monthlyBurn <= interactiveBudget) finScore += 30;
      else if (monthlyBurn <= interactiveBudget * 1.15) finScore += 22;
      else finScore += Math.max(8, Math.round((interactiveBudget / Math.max(500, monthlyBurn)) * 20));

      // 1b. Remote Income to Burn Coverage & Savings Margin (40 pts)
      if (nomadRemoteIncomeUSD >= monthlyBurn * 2.2) finScore += 40;
      else if (nomadRemoteIncomeUSD >= monthlyBurn * 1.5) finScore += 34;
      else if (nomadRemoteIncomeUSD >= monthlyBurn * 1.15) finScore += 28;
      else if (nomadRemoteIncomeUSD >= monthlyBurn) finScore += 22;
      else finScore += Math.min(18, Math.round((nomadRemoteIncomeUSD / Math.max(500, monthlyBurn)) * 20));

      // 1c. Liquid Savings Runway Buffer (25 pts)
      if (liquidRunwayMonths >= 36) finScore += 25;
      else if (liquidRunwayMonths >= 24) finScore += 21;
      else if (liquidRunwayMonths >= 12) finScore += 17;
      else if (liquidRunwayMonths >= 6) finScore += 13;
      else finScore += 8;

      finScore = Math.min(99, Math.max(42, finScore));
      const finGrade = formatGrade(finScore);
      const savingsMarginPct = nomadRemoteIncomeUSD > 0
        ? Math.round(((nomadRemoteIncomeUSD - monthlyBurn) / nomadRemoteIncomeUSD) * 100)
        : 0;

      const financialPillar: PillarGrade = {
        grade: finGrade,
        score: finScore,
        label: nomadMonthlySurplus >= 0 ? `Saves +$${nomadMonthlySurplus.toLocaleString()}/mo` : `${liquidRunwayMonths} Mo Liquid Runway`,
        badgeClass: getGradeBadgeClass(finGrade),
        headline:
          nomadMonthlySurplus >= 0
            ? `Burn $${monthlyBurn.toLocaleString()}/mo · Saves +$${nomadMonthlySurplus.toLocaleString()}/mo (${savingsMarginPct}% margin)`
            : `Burn $${monthlyBurn.toLocaleString()}/mo · ${liquidRunwayMonths} Mo Liquid Runway Buffer`,
        detail: `1BR Furnished $${nomadProfile.furnishedShortTermRentUSD.toLocaleString()}/mo · Coworking $${nomadProfile.coworkingMonthlyUSD}/mo · 6-Mo Runway $${nomadProfile.sixMonthRunwayUSD.toLocaleString()}`,
      };

      // PILLAR 2 (Nomad): Digital Nomad Visa (DNV), Remote Income Slider Fit & Tax Status
      const {
        isDestinationOwnCountry,
        isUserEuCitizen,
        isDestinationEu,
        nat,
        nationalityBonus,
        nationalityNote,
      } = computeNationalityAdvantage(country, nomadProfile.remoteWorkVisaName);

      const isZeroTaxForeign =
        nomadProfile.remoteWorkVisaDetails.toLowerCase().includes('0%') ||
        nomadProfile.remoteWorkVisaDetails.toLowerCase().includes('exempt') ||
        nomadProfile.remoteWorkVisaDetails.toLowerCase().includes('zero') ||
        country.visa.taxStatus.toLowerCase().includes('0%') ||
        country.visa.taxStatus.toLowerCase().includes('territorial');

      const dnvSavingsFallbackUSD = Math.max(14000, dnvIncomeReq * 6);
      const meetsDnvViaRemoteIncome = dnvIncomeReq === 0 || nomadRemoteIncomeUSD >= dnvIncomeReq;
      const meetsDnvViaLiquidSavings = stocksAndSavingsLiquid >= dnvSavingsFallbackUSD;

      let visaScore = 55;
      let dnvHeadline = '';

      if (isDestinationOwnCountry || (isUserEuCitizen && isDestinationEu) || (nat === 'India' && country.id === 'nepal')) {
        visaScore = 99;
        dnvHeadline = `Visa-Free Right to Work & Reside (${nat} Passport)`;
      } else if (dnvIncomeReq === 0) {
        visaScore = Math.min(98, 90 + Math.min(8, nationalityBonus));
        dnvHeadline = `$0/mo Min Remote Income · ${nomadProfile.remoteWorkVisaName}`;
      } else if (meetsDnvViaRemoteIncome) {
        const bufferRatio = nomadRemoteIncomeUSD / Math.max(1, dnvIncomeReq);
        const bufferBonus = bufferRatio >= 1.5 ? 8 : bufferRatio >= 1.2 ? 5 : 2;
        const taxBonus = isZeroTaxForeign ? 4 : 0;
        visaScore = Math.min(98, 82 + bufferBonus + taxBonus + Math.min(8, Math.round(nationalityBonus * 0.5)));
        dnvHeadline = `Qualifies via Remote Income ($${nomadRemoteIncomeUSD.toLocaleString()}/mo ≥ $${dnvIncomeReq.toLocaleString()}/mo req)`;
      } else if (meetsDnvViaLiquidSavings) {
        visaScore = Math.min(82, 72 + Math.min(8, Math.round(nationalityBonus * 0.5)));
        dnvHeadline = `Income Short by $${(dnvIncomeReq - nomadRemoteIncomeUSD).toLocaleString()}/mo · Can Supplement w/ $${stocksAndSavingsLiquid.toLocaleString()} Savings`;
      } else {
        const ratio = dnvIncomeReq > 0 ? nomadRemoteIncomeUSD / dnvIncomeReq : 0.6;
        visaScore = Math.min(66, Math.max(36, Math.round(ratio * 62) + Math.min(6, Math.round(nationalityBonus * 0.4))));
        dnvHeadline = `Requires $${dnvIncomeReq.toLocaleString()}/mo Remote Income (Currently $${nomadRemoteIncomeUSD.toLocaleString()}/mo)`;
      }

      const visaGrade = formatGrade(visaScore);
      const visaPillar: PillarGrade = {
        grade: visaGrade,
        score: visaScore,
        label: dnvHeadline,
        badgeClass: getGradeBadgeClass(visaGrade),
        headline: dnvHeadline,
        detail: `${nomadProfile.remoteWorkVisaStay} · ${isZeroTaxForeign ? '0% / Favorable Foreign Income Tax · ' : ''}${nationalityNote}`,
      };

      // PILLAR 3 (Nomad): Fiber Speed, Coworking Ecosystem & Power Grid Stability
      let workInfraScore = 50;
      const mbps = nomadProfile.verifiedInternetMbps;
      if (mbps >= 200) workInfraScore += 22;
      else if (mbps >= 120) workInfraScore += 18;
      else if (mbps >= 75) workInfraScore += 14;
      else if (mbps >= 40) workInfraScore += 9;
      else workInfraScore += 3;

      // Bonus/Penalty against user's minimum internet speed slider
      if (mbps >= minInternetSpeedMbps) {
        workInfraScore += 8;
      } else {
        const speedDeficitRatio = mbps / Math.max(1, minInternetSpeedMbps);
        workInfraScore -= Math.round((1 - speedDeficitRatio) * 18);
      }

      if (nomadProfile.coworkingDensity === 'World-Class Nomad Hub') workInfraScore += 14;
      else if (nomadProfile.coworkingDensity === 'Abundant & Vibrant') workInfraScore += 10;
      else if (nomadProfile.coworkingDensity === 'Growing Network') workInfraScore += 6;
      else workInfraScore += 2;

      if (nomadProfile.cafeWorkCulture === 'Legendary Laptop Friendly') workInfraScore += 6;
      else if (nomadProfile.cafeWorkCulture === 'Widely Welcomed') workInfraScore += 4;
      else workInfraScore += 1;

      if (nomadProfile.powerAndBackupStability === 'Extremely Reliable (99.9%)') workInfraScore += 4;
      else if (nomadProfile.powerAndBackupStability === 'Very Stable') workInfraScore += 3;

      workInfraScore = Math.min(99, Math.max(38, workInfraScore));
      const workInfraGrade = formatGrade(workInfraScore);

      // Map workInfraPillar into languagePillar slot for unified card rendering
      const languagePillar: PillarGrade = {
        grade: workInfraGrade,
        score: workInfraScore,
        label: `${mbps} Mbps · ${nomadProfile.coworkingDensity}`,
        badgeClass: getGradeBadgeClass(workInfraGrade),
        headline: `${mbps} Mbps (${nomadProfile.internetReliability}) · ${nomadProfile.coworkingDensity}`,
        detail: `Laptop Cafes: ${nomadProfile.cafeWorkCulture} · Grid: ${nomadProfile.powerAndBackupStability} · Hubs: ${nomadProfile.topNomadCities.slice(0, 2).join(', ')}`,
      };

      // PILLAR 4 (Nomad): Creator Community, English/Language, Weather & Nightlife/Dating
      let climatePts = 22;
      if (interactiveClimate === 'Any') climatePts = 26;
      else if (country.climate.category === interactiveClimate) climatePts = 31;
      else climatePts = 15;

      const datingScore10 = country.demographics?.datingRating ? country.demographics.datingRating * 2 : 7;
      const nightlifeScore10 = country.adultEntertainment?.nightlifeScore ? country.adultEntertainment.nightlifeScore * 2 : 7;
      const englishBonus =
        country.lifestyle.englishProficiency === 'Very High'
          ? 24
          : country.lifestyle.englishProficiency === 'High'
          ? 20
          : country.lifestyle.englishProficiency === 'Moderate'
          ? 15
          : 10;
      const safetyWalkPts = Math.round(((country.lifestyle.safetyScore * 0.55 + country.lifestyle.walkabilityScore * 0.45) / 100) * 24);
      const socialVibePts = Math.round(((datingScore10 * 0.5 + nightlifeScore10 * 0.5) / 10) * 20) + (nomadProfile.hasCuratedData ? 4 : 0);

      const lifestyleScore = Math.min(99, Math.max(48, climatePts + englishBonus + safetyWalkPts + socialVibePts));
      const lifestyleGrade = formatGrade(lifestyleScore);

      const lifestylePillar: PillarGrade = {
        grade: lifestyleGrade,
        score: lifestyleScore,
        label: `${country.climate.category} · English: ${country.lifestyle.englishProficiency}`,
        badgeClass: getGradeBadgeClass(lifestyleGrade),
        headline: `${country.climate.category} (${country.climate.annualSunnyDays}d sun) · English: ${country.lifestyle.englishProficiency} · Dating ${datingScore10}/10`,
        detail: `Safety ${country.lifestyle.safetyScore}/100 · Walkability ${country.lifestyle.walkabilityScore}/100 · Nightlife ${nightlifeScore10}/10`,
      };

      // OVERALL WEIGHTED DIGITAL NOMAD SUITABILITY SCORE (0 to 99%)
      let overallScore = 70;
      switch (nomadPriorityFocus) {
        case 'internet-coworking':
          overallScore = Math.round(
            workInfraScore * 0.44 +
            finScore * 0.20 +
            visaScore * 0.20 +
            lifestyleScore * 0.16
          );
          break;
        case 'dnv-tax-friendly':
          overallScore = Math.round(
            visaScore * 0.46 +
            finScore * 0.22 +
            workInfraScore * 0.18 +
            lifestyleScore * 0.14
          );
          break;
        case 'low-burn-runway':
          overallScore = Math.round(
            finScore * 0.46 +
            visaScore * 0.22 +
            workInfraScore * 0.18 +
            lifestyleScore * 0.14
          );
          break;
        case 'creator-dating-vibe':
          overallScore = Math.round(
            lifestyleScore * 0.42 +
            workInfraScore * 0.24 +
            finScore * 0.18 +
            visaScore * 0.16
          );
          break;
        case 'safety-power-grid':
          overallScore = Math.round(
            (country.lifestyle.safetyScore * 0.45 + workInfraScore * 0.55) * 0.44 +
            finScore * 0.20 +
            visaScore * 0.20 +
            lifestyleScore * 0.16
          );
          break;
        case 'balanced-nomad':
        default:
          overallScore = Math.round(
            finScore * 0.28 +
            visaScore * 0.28 +
            workInfraScore * 0.26 +
            lifestyleScore * 0.18
          );
          break;
      }

      // Apply soft penalty if internet speed is below user's slider minimum
      if (mbps < minInternetSpeedMbps) {
        overallScore = Math.max(40, overallScore - 8);
      }

      overallScore = Math.min(99, Math.max(42, overallScore));
      const overallGrade = formatGrade(overallScore);

      return {
        country,
        nomadProfile,
        overallScore,
        overallGrade,
        overallBadgeClass: getGradeBadgeClass(overallGrade),
        financialPillar,
        visaPillar,
        languagePillar, // Work & Fiber Infra in Nomad Mode
        lifestylePillar,
        monthlyCost: monthlyBurn,
        visaReq: dnvIncomeReq,
        runwayYears,
        liquidRunwayYears: runwayYears,
        liquidRunwayMonths,
        nomadMonthlySurplus,
        fireLivingCoveragePct: savingsMarginPct,
        fireLivingSurplusUSD: nomadMonthlySurplus,
        activeSurplusUSD: nomadMonthlySurplus,
        assetSolvencyThresholdUSD: dnvSavingsFallbackUSD,
        meetsVisaViaMonthlyIncome: meetsDnvViaRemoteIncome,
        meetsVisaViaStocksAndLiquidAssets: meetsDnvViaLiquidSavings,
        nationalityNote,
        workInfraScore,
      };
    }

    // -------------------------------------------------------------------------
    // RETIREE / FIRE EVALUATION MODE (DEFAULT)
    // -------------------------------------------------------------------------
    const monthlyCost = country.costOfLiving.monthlyBudgetSingleUSD;
    const annualLivingCost = monthlyCost * 12;
    const visaReq = country.visa.minimumIncomeUSD || 0;

    // PILLAR 1: FINANCIAL & ASSET POTENTIAL (Max 100)
    const runwayYears = Math.round((totalNetWorth / (annualLivingCost || 1)) * 10) / 10;
    const liquidRunwayYears = Math.round((liquidInvestableAssets / (annualLivingCost || 1)) * 10) / 10;
    const fireLivingCoveragePct = Math.round((swrMonthlyIncome / (monthlyCost || 1)) * 100);
    const fireLivingSurplusUSD = swrMonthlyIncome - monthlyCost;
    const activeSurplusUSD = effectiveMonthlyIncome - monthlyCost;

    let finScore = 0;
    if (monthlyCost <= interactiveBudget * 0.85) finScore += 30;
    else if (monthlyCost <= interactiveBudget) finScore += 26;
    else if (monthlyCost <= interactiveBudget * 1.15) finScore += 18;
    else finScore += Math.max(6, Math.round((interactiveBudget / monthlyCost) * 18));

    if (effectiveMonthlyIncome >= monthlyCost * 2.2) finScore += 35;
    else if (effectiveMonthlyIncome >= monthlyCost * 1.5) finScore += 30;
    else if (effectiveMonthlyIncome >= monthlyCost * 1.1) finScore += 24;
    else if (effectiveMonthlyIncome >= monthlyCost) finScore += 19;
    else finScore += Math.min(15, Math.round((effectiveMonthlyIncome / (monthlyCost || 1)) * 18));

    if (runwayYears >= 30) finScore += 25;
    else if (runwayYears >= 20) finScore += 21;
    else if (runwayYears >= 12) finScore += 16;
    else finScore += Math.min(12, Math.round(runwayYears));

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

    // PILLAR 2: VISA SOLVENCY (SALARY vs STOCKS/ASSETS PROOF) & NATIONALITY FIT
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
      assetSolvencyThresholdUSD = 18000;
      acceptsAssetsInLieuOfSalary = true;
      assetRuleDescription = `D7 accepts investment dividends/4% SWR from your $${stocks.toLocaleString()} stocks + $${savings.toLocaleString()} cash`;
    } else if (country.id === 'mexico') {
      assetSolvencyThresholdUSD = 58000;
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

    const {
      isDestinationOwnCountry,
      isUserEuCitizen,
      isDestinationEu,
      nat,
      nationalityBonus,
      nationalityNote,
    } = computeNationalityAdvantage(country, country.visa.retirementVisaName);

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

    // PILLAR 3: LANGUAGES KNOWN & CULTURAL INTEGRATION (Max 100)
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

    // PILLAR 4: WEATHER/CLIMATE, HEALTHCARE & DATING/NIGHTLIFE SCENE (Max 100)
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
    const rawSocialAvg = (datingScore10 * 0.55 + nightlifeScore10 * 0.45) * 10;

    let socialPts = Math.round((rawSocialAvg / 100) * 32);
    if (socialDatingPriority === 'high-dating') {
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

    // OVERALL WEIGHTED SUITABILITY SCORE (0 to 99%)
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
      nomadProfile,
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
      liquidRunwayMonths: Math.round(liquidRunwayYears * 12),
      nomadMonthlySurplus: activeSurplusUSD,
      fireLivingCoveragePct,
      fireLivingSurplusUSD,
      activeSurplusUSD,
      assetSolvencyThresholdUSD,
      meetsVisaViaMonthlyIncome,
      meetsVisaViaStocksAndLiquidAssets,
      nationalityNote,
      workInfraScore: langScore,
    };
  };

  // Count how many countries qualify for DNV under the user's current remote income slider
  const dnvQualifyingCount = useMemo(() => {
    return countries.filter(c => {
      const np = getCountryNomadProfile(c);
      const req = np.remoteWorkVisaIncomeUSD || 0;
      return req === 0 || nomadRemoteIncomeUSD >= req;
    }).length;
  }, [countries, nomadRemoteIncomeUSD]);

  // Compute and rank all countries
  const allRankedAnalyses = useMemo(() => {
    const evaluated = countries.map(c => evaluateCountryComprehensive(c));

    return evaluated.sort((a, b) => {
      if (matcherSortBy === 'financial-score') {
        if (b.financialPillar.score !== a.financialPillar.score) return b.financialPillar.score - a.financialPillar.score;
        return b.overallScore - a.overallScore;
      }
      if (matcherSortBy === 'visa-score') {
        if (b.visaPillar.score !== a.visaPillar.score) return b.visaPillar.score - a.visaPillar.score;
        return b.overallScore - a.overallScore;
      }
      if (matcherSortBy === 'work-infra-score') {
        if (b.workInfraScore !== a.workInfraScore) return b.workInfraScore - a.workInfraScore;
        return b.nomadProfile.verifiedInternetMbps - a.nomadProfile.verifiedInternetMbps;
      }
      if (matcherSortBy === 'cost-asc') {
        if (a.monthlyCost !== b.monthlyCost) return a.monthlyCost - b.monthlyCost;
        return b.overallScore - a.overallScore;
      }
      if (matcherSortBy === 'dnv-income-asc') {
        if (a.visaReq !== b.visaReq) return a.visaReq - b.visaReq;
        return b.overallScore - a.overallScore;
      }
      if (matcherSortBy === 'internet-desc') {
        if (b.nomadProfile.verifiedInternetMbps !== a.nomadProfile.verifiedInternetMbps) {
          return b.nomadProfile.verifiedInternetMbps - a.nomadProfile.verifiedInternetMbps;
        }
        return b.overallScore - a.overallScore;
      }
      if (matcherSortBy === 'lifestyle-score') {
        if (b.lifestylePillar.score !== a.lifestylePillar.score) return b.lifestylePillar.score - a.lifestylePillar.score;
        return b.overallScore - a.overallScore;
      }
      // Default: 'overall-score'
      if (b.overallScore !== a.overallScore) return b.overallScore - a.overallScore;
      return a.monthlyCost - b.monthlyCost;
    });
  }, [
    countries,
    isNomadMode,
    interactiveBudget,
    interactiveClimate,
    interactiveNationality,
    safeWithdrawalRate,
    incomeEvalMode,
    socialDatingPriority,
    nomadRemoteIncomeUSD,
    minInternetSpeedMbps,
    nomadPriorityFocus,
    matcherSortBy,
    userProfile.languagesKnown,
    monthlySalary,
    passiveMonthlyIncome,
    totalNetWorth,
    stocksAndSavingsLiquid,
    liquidInvestableAssets,
  ]);

  // Apply scope, continent, workspace filter, ignore, and search filters while preserving global rank index
  const displayedAnalyses = useMemo(() => {
    let list = allRankedAnalyses.map((item, idx) => ({
      ...item,
      globalRank: idx + 1,
    }));

    if (scopeTab === 'ignored') {
      list = list.filter(item => ignoredCountryIds.includes(item.country.id));
    } else {
      list = list.filter(item => !ignoredCountryIds.includes(item.country.id));

      if (scopeTab === 'shortlist') {
        const saved = list.filter(item => userProfile.savedCountryIds.includes(item.country.id));
        list = saved.length > 0 ? saved : list.slice(0, 6);
      } else if (scopeTab === 'target') {
        const target = list.filter(
          item => item.country.name.toLowerCase() === userProfile.targetCountry.toLowerCase()
        );
        list = target.length > 0 ? target : list.slice(0, 1);
      }
    }

    // Apply Nomad Workspace / Visa Eligibility Filter when in Nomad mode
    if (isNomadMode && scopeTab !== 'ignored' && scopeTab !== 'target') {
      if (nomadWorkspaceFilter === 'world-class') {
        list = list.filter(
          item =>
            item.nomadProfile.coworkingDensity === 'World-Class Nomad Hub' ||
            item.nomadProfile.coworkingDensity === 'Abundant & Vibrant'
        );
      } else if (nomadWorkspaceFilter === 'laptop-cafes') {
        list = list.filter(
          item =>
            item.nomadProfile.cafeWorkCulture === 'Legendary Laptop Friendly' ||
            item.nomadProfile.cafeWorkCulture === 'Widely Welcomed'
        );
      } else if (nomadWorkspaceFilter === 'strict-dnv-fit') {
        list = list.filter(item => item.meetsVisaViaMonthlyIncome);
      }
    }

    if (selectedRegion !== 'All') {
      list = list.filter(item => matchesContinentFilter(item.country, selectedRegion));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        item =>
          item.country.name.toLowerCase().includes(q) ||
          item.country.capital.toLowerCase().includes(q) ||
          item.country.visa.retirementVisaName.toLowerCase().includes(q) ||
          item.nomadProfile.remoteWorkVisaName.toLowerCase().includes(q) ||
          item.nomadProfile.topNomadCities.some(city => city.toLowerCase().includes(q)) ||
          item.country.language.toLowerCase().includes(q)
      );
    }

    if (scopeTab === 'top' && !searchQuery.trim() && selectedRegion === 'All' && nomadWorkspaceFilter === 'any') {
      return list.slice(0, 6);
    }

    return list;
  }, [
    allRankedAnalyses,
    scopeTab,
    isNomadMode,
    nomadWorkspaceFilter,
    selectedRegion,
    searchQuery,
    userProfile.savedCountryIds,
    userProfile.targetCountry,
    ignoredCountryIds,
  ]);

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
    <section
      className={`relative overflow-hidden rounded-3xl border p-6 sm:p-8 shadow-md space-y-6 transition-colors ${
        isNomadMode
          ? 'bg-gradient-to-br from-indigo-50/85 via-white to-violet-50/80 border-indigo-200/80'
          : 'bg-gradient-to-br from-teal-50/80 via-white to-indigo-50/80 border-teal-200/80'
      }`}
    >
      <div
        className={`absolute top-0 left-0 right-0 h-1.5 ${
          isNomadMode
            ? 'bg-gradient-to-r from-indigo-600 via-violet-600 via-50% to-teal-500'
            : 'bg-gradient-to-r from-teal-500 via-indigo-500 via-50% to-amber-500'
        }`}
      />
      <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-teal-400/12 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-indigo-400/12 blur-3xl" />

      {/* Top Header, Dual-Persona Switch & Unified AI Profile Context Strip */}
      <div className="relative flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-5 border-b border-teal-100/80">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-sm ${
                isNomadMode
                  ? 'bg-gradient-to-br from-indigo-600 via-violet-600 to-teal-500 shadow-indigo-500/20'
                  : 'bg-gradient-to-br from-teal-500 via-indigo-600 to-violet-600 shadow-indigo-500/20'
              }`}
            >
              {isNomadMode ? <Zap className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  Haven Matcher{' '}
                  <span className="bg-gradient-to-r from-teal-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                    AI Recommendation &amp; Financial Potential Engine
                  </span>
                </h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                    isNomadMode
                      ? 'bg-indigo-100 text-indigo-900 border-indigo-200'
                      : 'bg-orange-100 text-orange-900 border-orange-200'
                  }`}
                >
                  {isNomadMode
                    ? `⚡ 4-Pillar Nomad & DNV Engine · ${countries.length} Havens`
                    : `Unified 4-Pillar Ranking · ${countries.length} Havens`}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {isNomadMode ? (
                  <>
                    Holistic Digital Nomad ranking combining your <strong>Monthly Burn &amp; Savings Runway</strong>,{' '}
                    <strong>Digital Nomad Visa (DNV) Remote Income Fit (${nomadRemoteIncomeUSD.toLocaleString()}/mo)</strong>,{' '}
                    <strong>Verified Fiber Mbps &amp; Coworking Hubs</strong>, and <strong>Creator/Social Vibe</strong>.
                  </>
                ) : (
                  <>
                    Holistic ranking combining your <strong>Financial &amp; Stocks/Assets Visa Solvency</strong>,{' '}
                    <strong>Nationality ({getWorldCountryFlag(interactiveNationality)} {interactiveNationality})</strong>,{' '}
                    <strong>Known Languages</strong>, <strong>Weather</strong>, and <strong>Dating/Nightlife Scene</strong>.
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Dual-Persona Switch + Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {/* Dual-Persona Switch (Early Retiree vs Digital Nomad) */}
          <div
            className="inline-flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200/90 shadow-2xs"
            role="group"
            aria-label="Haven Matcher Persona Mode"
          >
            <button
              type="button"
              onClick={() => setCurrentPersona('retiree')}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
                !isNomadMode
                  ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>🌿 Early Retiree</span>
            </button>
            <button
              type="button"
              onClick={() => setCurrentPersona('nomad')}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
                isNomadMode
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>⚡ Digital Nomad</span>
            </button>
          </div>

          {hasUnsavedChanges && (
            <button
              onClick={handleSavePreferencesToProfile}
              className="px-3.5 py-2 text-xs font-bold rounded-xl bg-teal-800 text-white hover:bg-teal-900 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Scenario to Profile</span>
            </button>
          )}
          <button
            onClick={() => openEditProfile('finances')}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-orange-50 text-orange-900 border border-orange-200 hover:bg-orange-100 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <DollarSign className="w-3.5 h-3.5 text-orange-600" />
            <span>Update Assets &amp; Salary</span>
          </button>
        </div>
      </div>

      {/* Active User Intelligence Snapshot Strip (Persona-Aware) */}
      <div
        className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 p-3.5 rounded-xl border text-xs ${
          isNomadMode
            ? 'bg-gradient-to-r from-indigo-50/80 via-violet-50/50 to-teal-50/50 border-indigo-200/70'
            : 'bg-gradient-to-r from-orange-50/70 via-purple-50/40 to-slate-50 border-orange-200/70'
        }`}
      >
        <div className="p-2.5 rounded-lg bg-white/90 border border-slate-200/70">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Nationality / Passport</span>
          <div className="font-bold text-slate-900 mt-0.5 truncate">
            {getWorldCountryFlag(interactiveNationality)} {interactiveNationality}
          </div>
          <span className="text-[10px] text-slate-500 block truncate">
            Residing: {getWorldCountryFlag(userProfile.residingCountry || userProfile.originCountry)} {userProfile.residingCountry || userProfile.originCountry}
          </span>
        </div>

        {isNomadMode ? (
          <>
            <div className="p-2.5 rounded-lg bg-white/90 border border-indigo-200/80">
              <span className="text-[10px] font-bold text-indigo-600 uppercase block">Remote Monthly Income</span>
              <div className="font-mono font-extrabold text-indigo-950 mt-0.5">
                ${nomadRemoteIncomeUSD.toLocaleString()}/mo
              </div>
              <span className="text-[10px] text-emerald-700 font-semibold block truncate">
                Qualifies {dnvQualifyingCount}/{countries.length} Nomad Visas
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-white/90 border border-slate-200/70">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Liquid Runway Capital</span>
              <div className="font-mono font-extrabold text-emerald-800 mt-0.5">
                ${stocksAndSavingsLiquid.toLocaleString()}
              </div>
              <span className="text-[10px] text-slate-500 block truncate">
                ~{Math.max(1, Math.round(stocksAndSavingsLiquid / Math.max(500, interactiveBudget)))} mos @ ${interactiveBudget.toLocaleString()}/mo
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-white/90 border border-slate-200/70">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Target Monthly Burn</span>
              <div className="font-mono font-extrabold text-violet-900 mt-0.5">
                ${interactiveBudget.toLocaleString()}/mo
              </div>
              <span className="text-[10px] text-slate-500 block truncate">
                6-Mo Runway: ${(interactiveBudget * 6).toLocaleString()}
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-white/90 border border-slate-200/70">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Min Fiber Speed</span>
              <div className="font-mono font-extrabold text-teal-800 mt-0.5">
                {minInternetSpeedMbps}+ Mbps
              </div>
              <span className="text-[10px] text-teal-700 font-medium block truncate">
                Verified Broadband &amp; 5G
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="p-2.5 rounded-lg bg-white/90 border border-slate-200/70">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Stocks &amp; Cash Proof</span>
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
          </>
        )}

        <div className="p-2.5 rounded-lg bg-white/90 border border-slate-200/70">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Target Haven</span>
          <div className="font-bold text-slate-900 mt-0.5 truncate">
            {getWorldCountryFlag(userProfile.targetCountry)} {userProfile.targetCountry}
          </div>
          <span className="text-[10px] text-slate-500 block truncate">
            {isNomadMode ? 'Lens: Digital Nomad' : `Timeline: ${userProfile.retirementTimelineYear}`}
          </span>
        </div>
      </div>

      {/* Interactive Multi-Parameter Control Console */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-4 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Control 1: Origin Country / Nationality (For Visa Treaties) */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 flex items-center justify-between">
              <span>Passport / Nationality</span>
              <span className="text-[10px] text-purple-700 font-medium">
                {isNomadMode ? 'Visa-Free & DNV Rules' : 'Visa Treaty Rules'}
              </span>
            </label>
            <select
              value={interactiveNationality}
              onChange={e => setInteractiveNationality(e.target.value)}
              className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-medium text-slate-800"
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

          {isNomadMode ? (
            <>
              {/* Nomad Control 2: Primary Digital Nomad Ranking Weight */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 flex items-center justify-between">
                  <span>Nomad Ranking Priority</span>
                  <span className="text-[10px] text-indigo-700 font-semibold">AI Weighting</span>
                </label>
                <select
                  value={nomadPriorityFocus}
                  onChange={e => setNomadPriorityFocus(e.target.value as NomadPriorityFocus)}
                  className="w-full px-2.5 py-2 text-xs border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-semibold text-slate-800"
                >
                  <option value="balanced-nomad">⚡ Balanced 4-Pillar Nomad Score</option>
                  <option value="internet-coworking">🚀 High-Speed Fiber &amp; 24/7 Coworking Hubs</option>
                  <option value="dnv-tax-friendly">🛂 Easy Digital Nomad Visa &amp; 0% Foreign Tax</option>
                  <option value="low-burn-runway">💰 Lowest Monthly Burn &amp; Max Runway</option>
                  <option value="creator-dating-vibe">☕ Creator Community, Cafes &amp; Nightlife</option>
                  <option value="safety-power-grid">🛡️ High Safety, Walkability &amp; Power Grid</option>
                </select>
              </div>

              {/* Nomad Control 3: Workspace & Visa Eligibility Filter */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 flex items-center justify-between">
                  <span>Workspace &amp; Visa Filter</span>
                  <span className="text-[10px] text-teal-700 font-semibold">Nomad Filter</span>
                </label>
                <select
                  value={nomadWorkspaceFilter}
                  onChange={e => setNomadWorkspaceFilter(e.target.value as NomadWorkspaceFilter)}
                  className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-medium text-slate-800"
                >
                  <option value="any">All Nomad Destinations ({countries.length})</option>
                  <option value="strict-dnv-fit">
                    ✓ Qualifies w/ My ${nomadRemoteIncomeUSD.toLocaleString()}/mo Income ({dnvQualifyingCount})
                  </option>
                  <option value="world-class">🏢 World-Class &amp; Abundant Coworking Hubs</option>
                  <option value="laptop-cafes">☕ Legendary &amp; Welcoming Laptop Cafes</option>
                </select>
              </div>
            </>
          ) : (
            <>
              {/* Retiree Control 2: Visa Solvency Mode */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 flex items-center justify-between">
                  <span>Visa Solvency Mode</span>
                  <span className="text-[10px] text-emerald-700 font-medium">Stocks &amp; Asset Proof</span>
                </label>
                <select
                  value={incomeEvalMode}
                  onChange={e => setIncomeEvalMode(e.target.value as 'combined' | 'assets-only')}
                  className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white font-medium text-slate-800"
                >
                  <option value="combined">Active Salary + Passive + Stocks/Assets</option>
                  <option value="assets-only">No Fixed Salary (Stocks/Assets &amp; {safeWithdrawalRate}% SWR Only)</option>
                </select>
              </div>

              {/* Retiree Control 3: Dating Life, Nightlife & Social Scene Weighting */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 flex items-center justify-between">
                  <span>Social, Dating &amp; Nightlife Focus</span>
                  <span className="text-[10px] text-orange-700 font-medium">Lifestyle Weight</span>
                </label>
                <select
                  value={socialDatingPriority}
                  onChange={e => setSocialDatingPriority(e.target.value as any)}
                  className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white font-medium text-slate-800"
                >
                  <option value="balanced">Balanced (All 4 Pillars Weighted Equally)</option>
                  <option value="high-dating">Vibrant Dating &amp; Nightlife Scene Priority</option>
                  <option value="expat-hub">Large English-Speaking Expat Community</option>
                  <option value="quiet-wellness">Peaceful Safety &amp; Healthcare Priority</option>
                </select>
              </div>
            </>
          )}

          {/* Control 4: Preferred Weather / Climate */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 flex items-center justify-between">
              <span>Preferred Weather / Climate</span>
              <span className="text-[10px] text-amber-700 font-medium">Sunshine Match</span>
            </label>
            <select
              value={interactiveClimate}
              onChange={e => setInteractiveClimate(e.target.value as ClimateCategory | 'Any')}
              className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-medium text-slate-800"
            >
              {climateOptions.map(c => (
                <option key={c} value={c}>
                  {c === 'Any' ? 'Any Climate Category' : c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sliders Row: Persona-Specific Interactive Sliders */}
        {isNomadMode ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 pt-3.5 border-t border-slate-200/80">
            {/* Nomad Slider 1: Target Monthly Living Burn */}
            <div className="space-y-1.5 bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-teal-600" />
                  <span>Target Monthly Nomad Burn:</span>
                </span>
                <span className="font-mono tabular-nums font-extrabold text-teal-900 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  ${interactiveBudget.toLocaleString()}/mo
                </span>
              </div>
              <input
                type="range"
                min={800}
                max={4500}
                step={50}
                value={interactiveBudget}
                onChange={e => setInteractiveBudget(Number(e.target.value))}
                className="w-full accent-teal-600 cursor-pointer"
              />
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>$800/mo</span>
                <span className="text-teal-700 font-semibold">
                  6-Mo Runway: ${(interactiveBudget * 6).toLocaleString()}
                </span>
                <span>$4,500/mo</span>
              </div>
              <div className="flex flex-wrap gap-1 pt-1">
                {[
                  { label: 'Lean $1.2k', val: 1200 },
                  { label: 'Sweet Spot $1.8k', val: 1800 },
                  { label: 'Comfort $2.5k', val: 2500 },
                  { label: 'Exec $3.5k', val: 3500 },
                ].map(preset => (
                  <button
                    key={preset.val}
                    type="button"
                    onClick={() => setInteractiveBudget(preset.val)}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold border transition-colors cursor-pointer ${
                      interactiveBudget === preset.val
                        ? 'bg-teal-700 text-white border-teal-700'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-teal-50'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Nomad Slider 2: Minimum Remote Income for Digital Nomad / Remote Visa */}
            <div className="space-y-1.5 bg-gradient-to-br from-indigo-50/70 via-white to-violet-50/70 p-3.5 rounded-xl border border-indigo-200/90 shadow-2xs">
              <div className="flex justify-between items-center gap-2">
                <span className="font-bold text-indigo-950 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>My Monthly Remote Income (for DNV):</span>
                </span>
                <span className="font-mono tabular-nums font-extrabold text-indigo-900 bg-indigo-100/90 px-2 py-0.5 rounded border border-indigo-300 shrink-0">
                  ${nomadRemoteIncomeUSD.toLocaleString()}/mo
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={8000}
                step={100}
                value={nomadRemoteIncomeUSD}
                onChange={e => setNomadRemoteIncomeUSD(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-slate-400">$0/mo (DTV/Savings)</span>
                <span className="text-emerald-700 font-bold">
                  ✓ {dnvQualifyingCount} of {countries.length} Visas Eligible
                </span>
                <span className="text-slate-400">$8,000/mo</span>
              </div>
              <div className="flex flex-wrap items-center gap-1 pt-1">
                {[
                  { label: '$0 Savings Only', val: 0 },
                  { label: '$1.5k Entry', val: 1500 },
                  { label: '$2.5k Mid DNV', val: 2500 },
                  { label: '$3.5k EU DNV', val: 3500 },
                  { label: '$5k+ Global', val: 5000 },
                ].map(preset => (
                  <button
                    key={preset.val}
                    type="button"
                    onClick={() => setNomadRemoteIncomeUSD(preset.val)}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold border transition-colors cursor-pointer ${
                      nomadRemoteIncomeUSD === preset.val
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-indigo-50'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
                {monthlySalary > 0 && nomadRemoteIncomeUSD !== defaultRemoteIncome && (
                  <button
                    type="button"
                    onClick={() => setNomadRemoteIncomeUSD(defaultRemoteIncome)}
                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 cursor-pointer"
                    title="Sync with your logged profile salary"
                  >
                    Sync Profile (${defaultRemoteIncome.toLocaleString()})
                  </button>
                )}
              </div>
            </div>

            {/* Nomad Slider 3: Minimum Verified Fiber / Broadband Speed */}
            <div className="space-y-1.5 bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Wifi className="w-3.5 h-3.5 text-violet-600" />
                  <span>Min Verified Internet Speed:</span>
                </span>
                <span className="font-mono tabular-nums font-extrabold text-violet-900 bg-violet-50 px-2 py-0.5 rounded border border-violet-200">
                  {minInternetSpeedMbps}+ Mbps
                </span>
              </div>
              <input
                type="range"
                min={25}
                max={225}
                step={25}
                value={minInternetSpeedMbps}
                onChange={e => setMinInternetSpeedMbps(Number(e.target.value))}
                className="w-full accent-violet-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>25 Mbps (Calls)</span>
                <span>100 Mbps (4K/Cloud)</span>
                <span>225+ Mbps (Fiber)</span>
              </div>
              <div className="flex flex-wrap gap-1 pt-1">
                {[
                  { label: '25+ Basic', val: 25 },
                  { label: '75+ Remote', val: 75 },
                  { label: '150+ Fast Fiber', val: 150 },
                  { label: '200+ Creator Pro', val: 200 },
                ].map(preset => (
                  <button
                    key={preset.val}
                    type="button"
                    onClick={() => setMinInternetSpeedMbps(preset.val)}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold border transition-colors cursor-pointer ${
                      minInternetSpeedMbps === preset.val
                        ? 'bg-violet-600 text-white border-violet-600'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-violet-50'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3 border-t border-slate-200/80">
            {/* Retiree Slider 1: Monthly Budget Slider */}
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

            {/* Retiree Slider 2: Safe Withdrawal Rate Slider */}
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
        )}
      </div>

      {/* Scope Tabs, Sort Dropdown, Continent Filter & Search Bar */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 pt-1">
        <div className="inline-flex flex-wrap rounded-xl border border-slate-200 p-1 bg-slate-50 text-xs font-semibold gap-1">
          <button
            onClick={() => setScopeTab('top')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              scopeTab === 'top'
                ? isNomadMode
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-2xs font-bold'
                  : 'bg-gradient-to-r from-orange-600 to-purple-600 text-white shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900 cursor-pointer'
            }`}
          >
            Top 6 {isNomadMode ? 'Nomad' : 'AI'} Matches
          </button>
          <button
            onClick={() => setScopeTab('shortlist')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              scopeTab === 'shortlist'
                ? isNomadMode
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-2xs font-bold'
                  : 'bg-gradient-to-r from-orange-600 to-purple-600 text-white shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900 cursor-pointer'
            }`}
          >
            My Shortlist ({userProfile.savedCountryIds.length})
          </button>
          <button
            onClick={() => setScopeTab('target')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              scopeTab === 'target'
                ? isNomadMode
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-2xs font-bold'
                  : 'bg-gradient-to-r from-orange-600 to-purple-600 text-white shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900 cursor-pointer'
            }`}
          >
            Target Haven ({userProfile.targetCountry})
          </button>
          <button
            onClick={() => setScopeTab('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              scopeTab === 'all'
                ? isNomadMode
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-2xs font-bold'
                  : 'bg-gradient-to-r from-orange-600 to-purple-600 text-white shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900 cursor-pointer'
            }`}
          >
            All {Math.max(0, countries.length - ignoredCountryIds.length)} Havens Ranked
          </button>
          <button
            onClick={() => setScopeTab('ignored')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              scopeTab === 'ignored'
                ? 'bg-gradient-to-r from-amber-600 via-rose-600 to-rose-700 text-white shadow-2xs font-bold'
                : 'text-slate-600 hover:text-amber-800 cursor-pointer'
            }`}
            title="View discarded or ignored havens"
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span>Ignored / Discarded ({ignoredCountryIds.length})</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Sort Order Selector */}
          <select
            value={matcherSortBy}
            onChange={e => setMatcherSortBy(e.target.value as MatcherSortOption)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold cursor-pointer"
            aria-label="Sort ranked havens"
          >
            <option value="overall-score">
              Sort: Overall {isNomadMode ? 'Nomad' : 'AI'} Score (Best First)
            </option>
            {isNomadMode ? (
              <>
                <option value="work-infra-score">Sort: Best Coworking &amp; Fiber Infra Score</option>
                <option value="internet-desc">Sort: Fastest Verified Internet (Mbps)</option>
                <option value="visa-score">Sort: Best Digital Nomad Visa Fit</option>
                <option value="dnv-income-asc">Sort: Lowest DNV Min Remote Income</option>
                <option value="cost-asc">Sort: Lowest Monthly Nomad Burn</option>
                <option value="lifestyle-score">Sort: Best Creator &amp; Nightlife Vibe</option>
              </>
            ) : (
              <>
                <option value="financial-score">Sort: Financial Potential &amp; SWR Fit</option>
                <option value="visa-score">Sort: Visa &amp; Nationality Solvency Fit</option>
                <option value="cost-asc">Sort: Lowest Monthly Living Cost</option>
                <option value="lifestyle-score">Sort: Weather, Healthcare &amp; Dating</option>
              </>
            )}
          </select>

          {/* Continent / Region Selector */}
          <select
            value={selectedRegion}
            onChange={e => setSelectedRegion(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium cursor-pointer"
            aria-label="Filter by continent"
          >
            {CONTINENT_FILTER_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.value === 'All' ? '🌍 All Continents / Any' : opt.label}
              </option>
            ))}
          </select>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={isNomadMode ? 'Search country, DNV, city...' : 'Search country or visa...'}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs w-48 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            />
          </div>
        </div>
      </div>

      {/* Undo / Ignored Toast Alert */}
      {recentlyDiscardedCountry && (
        <div className="p-3 sm:p-4 rounded-2xl bg-amber-50/95 border border-amber-300 text-amber-950 text-xs flex items-center justify-between shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl bg-amber-200 text-amber-900 shadow-2xs">
              <EyeOff className="w-4 h-4" />
            </div>
            <span>
              <strong>{recentlyDiscardedCountry.name}</strong> has been discarded and hidden from AI recommendations. The next best matching haven has moved up!
            </span>
          </div>
          <button
            onClick={() => {
              restoreCountry(recentlyDiscardedCountry.id);
              setRecentlyDiscardedCountry(null);
            }}
            className="px-3 py-1.5 rounded-xl bg-white border border-amber-300 hover:bg-amber-100 text-amber-950 font-bold text-xs cursor-pointer flex items-center gap-1.5 shadow-2xs transition-colors shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
            <span>Undo</span>
          </button>
        </div>
      )}

      {/* Empty State when in Ignored / Discarded Tab and list is empty */}
      {displayedAnalyses.length === 0 && scopeTab === 'ignored' && (
        <div className="text-center py-12 px-6 bg-slate-50/90 rounded-3xl border-2 border-dashed border-slate-300">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-3 shadow-2xs">
            <EyeOff className="w-7 h-7" />
          </div>
          <h4 className="text-base font-extrabold text-slate-800">No Discarded or Ignored Havens</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1.5 leading-relaxed">
            You haven&apos;t discarded any countries yet. While browsing the Top Matches or All Ranked Havens, click the &quot;Discard&quot; button on any country that doesn&apos;t fit your personal preferences to filter it out and promote alternative havens.
          </p>
        </div>
      )}

      {/* Empty State when filter yields 0 results */}
      {displayedAnalyses.length === 0 && scopeTab !== 'ignored' && (
        <div className="text-center py-10 px-6 bg-slate-50/90 rounded-3xl border border-dashed border-slate-300">
          <p className="text-sm font-bold text-slate-800">No destinations match your current filter combination.</p>
          <p className="text-xs text-slate-500 mt-1">
            Try raising your remote income slider, broadening the workspace filter, or selecting &quot;All Continents&quot;.
          </p>
          <button
            type="button"
            onClick={() => {
              setNomadWorkspaceFilter('any');
              setSelectedRegion('All');
              setSearchQuery('');
            }}
            className="mt-3 px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Ranked Country Recommendations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {displayedAnalyses.map(item => {
          const {
            country,
            nomadProfile,
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
            liquidRunwayMonths,
            nomadMonthlySurplus,
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
                  : isNomadMode
                  ? 'border-indigo-200/80 bg-white hover:border-indigo-300'
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
                        <span
                          className={`px-2 py-0.5 rounded-md text-white font-mono text-[10px] font-bold uppercase tracking-wider ${
                            isNomadMode ? 'bg-indigo-950' : 'bg-slate-900'
                          }`}
                        >
                          Rank #{globalRank}
                        </span>
                        {isNomadMode && nomadProfile.hasCuratedData && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200 flex items-center gap-1">
                            <Zap className="w-2.5 h-2.5 text-indigo-600" />
                            <span>Top Nomad Hub</span>
                          </span>
                        )}
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
                        {isCountryIgnored(country.id) && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1 shadow-2xs">
                            <EyeOff className="w-2.5 h-2.5 text-amber-700" />
                            <span>Discarded</span>
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-extrabold text-slate-900 mt-1 leading-tight">
                        {country.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {country.capital} · {country.region} ·{' '}
                        <span className={isNomadMode ? 'text-indigo-700 font-semibold' : ''}>
                          {isNomadMode ? nomadProfile.remoteWorkVisaName : country.visa.retirementVisaName}
                        </span>
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
                      {isNomadMode ? 'Nomad Fit Score' : 'Overall Potential'}
                    </span>
                  </div>
                </div>

                {/* Key Financial & Visa Solvency Strip (4 Compact Metrics - Persona Aware) */}
                {isNomadMode ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-3.5">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Turnkey Burn</span>
                      <div className="font-mono font-bold text-xs text-slate-900 mt-0.5">
                        ${monthlyCost.toLocaleString()}<span className="text-[10px] font-normal text-slate-500">/mo</span>
                      </div>
                      <span className="text-[10px] font-semibold text-teal-700 block mt-0.5">
                        {monthlyCost <= interactiveBudget
                          ? `-$${(interactiveBudget - monthlyCost).toLocaleString()} under target`
                          : `+$${(monthlyCost - interactiveBudget).toLocaleString()} over`}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-indigo-50/50 border border-indigo-200/70">
                      <span className="text-[10px] font-bold text-indigo-500 uppercase block">DNV Min Income</span>
                      <div className="font-mono font-bold text-xs text-slate-900 mt-0.5">
                        {visaReq > 0 ? (
                          <>
                            ${visaReq.toLocaleString()}
                            <span className="text-[10px] font-normal text-slate-500">/mo</span>
                          </>
                        ) : (
                          <span className="text-emerald-700">$0 / Solvency</span>
                        )}
                      </div>
                      <span
                        className={`text-[10px] font-semibold block mt-0.5 ${
                          meetsVisaViaMonthlyIncome ? 'text-emerald-700' : 'text-amber-700'
                        }`}
                      >
                        {meetsVisaViaMonthlyIncome
                          ? '✓ Income Qualifies'
                          : `+$${(visaReq - nomadRemoteIncomeUSD).toLocaleString()}/mo needed`}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-violet-50/50 border border-violet-200/70">
                      <span className="text-[10px] font-bold text-violet-500 uppercase block">Verified Fiber</span>
                      <div className="font-mono font-bold text-xs text-slate-900 mt-0.5">
                        {nomadProfile.verifiedInternetMbps}{' '}
                        <span className="text-[10px] font-normal text-slate-500">Mbps</span>
                      </div>
                      <span className="text-[10px] font-semibold text-violet-800 block mt-0.5 truncate">
                        Desk ~${nomadProfile.coworkingMonthlyUSD}/mo
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">
                        {nomadMonthlySurplus >= 0 ? 'Monthly Savings' : 'Liquid Runway'}
                      </span>
                      <div className="font-mono font-bold text-xs text-slate-900 mt-0.5">
                        {nomadMonthlySurplus >= 0 ? (
                          <span className="text-emerald-700">+${nomadMonthlySurplus.toLocaleString()}/mo</span>
                        ) : (
                          <>
                            {liquidRunwayMonths} <span className="text-[10px] font-normal text-slate-500">Mos</span>
                          </>
                        )}
                      </div>
                      <span className="text-[10px] font-semibold text-purple-800 block mt-0.5 truncate">
                        6-Mo Burn: ${nomadProfile.sixMonthRunwayUSD.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ) : (
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
                )}

                {/* 4 Categorized Sub-Grades Breakdown Inside Country Card */}
                <div className="space-y-2 mt-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    {isNomadMode
                      ? '4-Pillar Digital Nomad & Remote Work Breakdown:'
                      : 'Categorized Suitability & Grade Breakdown:'}
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {/* Category 1: Financial Potential / Burn & Runway */}
                    <div className="p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/40 flex flex-col justify-between">
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{isNomadMode ? '1. Burn & Runway Fit' : '1. Financial Potential'}</span>
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

                    {/* Category 2: Visa & Nationality Fit / DNV & Remote Income */}
                    <div className="p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/40 flex flex-col justify-between">
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
                          <Shield className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                          <span>{isNomadMode ? '2. Nomad Visa & Income Fit' : '2. Visa & Nationality Fit'}</span>
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

                    {/* Category 3: Language & Cultural Ease OR Fiber & Coworking Infra */}
                    <div className="p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/40 flex flex-col justify-between">
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
                          {isNomadMode ? (
                            <Wifi className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          ) : (
                            <Languages className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          )}
                          <span>{isNomadMode ? '3. Fiber & Coworking Infra' : '3. Language & Culture'}</span>
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

                    {/* Category 4: Weather, Healthcare & Dating/Nightlife OR Creator Vibe */}
                    <div className="p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/40 flex flex-col justify-between">
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
                          <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span>{isNomadMode ? '4. Creator Vibe & Lifestyle' : '4. Weather & Social/Dating'}</span>
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
                    className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
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
                    className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                      compared
                        ? 'bg-teal-700 text-white border-teal-700'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                    title="Compare in matrix"
                  >
                    <Scale className="w-3.5 h-3.5 inline mr-1" />
                    <span>{compared ? 'Compared' : 'Compare'}</span>
                  </button>

                  {/* Discard / Ignore or Restore Haven Button */}
                  {scopeTab === 'ignored' || isCountryIgnored(country.id) ? (
                    <button
                      onClick={() => restoreCountry(country.id)}
                      className="px-2.5 py-1 rounded-lg border text-xs font-bold bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100 transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                      title={`Restore ${country.name} back to active recommendations`}
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Restore Haven</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        toggleIgnoreCountry(country.id);
                        setRecentlyDiscardedCountry({ id: country.id, name: country.name });
                        setTimeout(() => setRecentlyDiscardedCountry(null), 5000);
                      }}
                      className="px-2 py-1 rounded-lg border text-xs bg-white text-slate-500 hover:text-amber-800 hover:bg-amber-50 hover:border-amber-300 transition-colors flex items-center gap-1 cursor-pointer"
                      title={`Ignore / Discard ${country.name} from recommendations`}
                    >
                      <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-[11px] font-medium hidden sm:inline">Discard</span>
                    </button>
                  )}

                  <span className="text-[11px] text-slate-400 hidden lg:inline ml-1 truncate max-w-[180px]">
                    {isNomadMode
                      ? `Hubs: ${nomadProfile.topNomadCities.slice(0, 2).join(', ')}`
                      : `Tax: ${country.visa.taxStatus.split('.')[0]}`}
                  </span>
                </div>

                <button
                  onClick={() => navigateToCountry(country.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1 transition-colors cursor-pointer border ${
                    isNomadMode
                      ? 'text-indigo-800 hover:bg-indigo-50 border-indigo-200'
                      : 'text-teal-800 hover:bg-teal-50 border-teal-200'
                  }`}
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
