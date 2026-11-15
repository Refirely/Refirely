import { Country, UserProfile, UserFinancialPortfolio } from '../types';
import {
  DEFAULT_FINANCIAL_PORTFOLIO,
  getWorldCountryFlag,
} from '../data/userAccounts';

export interface UnifiedFireMetrics {
  targetCountryName: string;
  targetCountryFlag: string;
  targetCityName: string;
  residingCountryName: string;
  grossAssetsUSD: number;
  fireEligibleAssetsUSD: number;
  totalDebtUSD: number;
  netWorthUSD: number;
  effectiveFireCorpusUSD: number;
  includePrimaryHome: boolean;
  includeGold: boolean;
  monthlyBurnUSD: number;
  domesticMonthlyBurnUSD: number;
  continuingPassiveMonthlyUSD: number;
  netMonthlyPortfolioNeedUSD: number;
  swrPercent: number;
  livingFireTargetUSD: number;
  futureGoalsTodayUSD: number;
  comprehensiveFireTargetUSD: number;
  targetFireNestEggUSD: number;
  uncappedFireProgressPct: number;
  fireProgressPercent: number;
  isCompleteFire: boolean;
  yearsSaved: number;
  nomadRunwayMonths: number;
  burnSavingsPct: number;
  recommendedBadgeTitle: string;
  recommendedBadgeEmoji: string;
}

/**
 * Resolves the monthly living burn (USD) for a specific country, prioritizing:
 * 1. Matched Country from the `countries` catalog (`monthlyBudgetSingleUSD`)
 * 2. User's profile/financial retirement expense fallback
 */
export function resolveCountryMonthlyBurnUSD(
  countryName: string,
  countries: Country[],
  userProfile: UserProfile,
  finances: UserFinancialPortfolio
): {
  monthlyBurnUSD: number;
  topCityName: string;
  countryFlag: string;
} {
  const cleanName = (countryName || '').trim();
  const matchedCountry = countries.find(
    c =>
      c.name.toLowerCase() === cleanName.toLowerCase() ||
      c.id.toLowerCase() === cleanName.toLowerCase()
  );

  const countryFlag = matchedCountry?.flag || getWorldCountryFlag(cleanName) || '🌍';

  const topCityName =
    matchedCountry?.topCities?.[0]?.name ||
    (cleanName === 'Colombia'
      ? 'Medellín'
      : cleanName === 'Portugal'
      ? 'Lisbon'
      : cleanName === 'Spain'
      ? 'Valencia'
      : cleanName === 'Thailand'
      ? 'Chiang Mai'
      : cleanName === 'Mexico'
      ? 'Mérida'
      : cleanName === 'Malaysia'
      ? 'Penang'
      : 'Expat Hub');

  if (matchedCountry) {
    return {
      monthlyBurnUSD: matchedCountry.costOfLiving.monthlyBudgetSingleUSD,
      topCityName,
      countryFlag,
    };
  }

  const fallbackBurn =
    finances.monthlyRetirementExpensesUSD ||
    finances.monthlyCurrentExpensesUSD ||
    userProfile.monthlyBudgetUSD ||
    2200;

  return {
    monthlyBurnUSD: fallbackBurn,
    topCityName,
    countryFlag,
  };
}

/**
 * Unified, live FIRE & Geoarbitrage calculation used across:
 * - UserDashboard ("Shareable FIRE Milestones & Freedom Cards")
 * - ShareableFireCardModal ("Shareable FIRE Badge & Freedom Card Studio")
 * - UserFinancialsDashboard ("5-Scheme Asset Breakdown & FIRE Badge")
 * - FireCalculatorTracker ("FIRE & Expense Planner")
 */
export function calculateUnifiedFireMetrics(
  userProfile: UserProfile,
  countries: Country[],
  overrideCountryName?: string
): UnifiedFireMetrics {
  const finances: UserFinancialPortfolio = userProfile.finances || DEFAULT_FINANCIAL_PORTFOLIO;
  const inv = finances.investments || DEFAULT_FINANCIAL_PORTFOLIO.investments;

  const savings = Number(inv.savingsUSD) || 0;
  const stocks = Number(inv.stocksMutualFundsUSD) || 0;
  const realEstate = Number(inv.realEstateUSD) || 0;
  const gold = Number(inv.goldUSD) || 0;
  const others = Number(inv.othersUSD) || 0;

  const grossAssetsUSD = Math.round(savings + stocks + realEstate + gold + others);

  // Respect user's Real Estate & Gold inclusion flags (defaulting to true if not explicitly excluded)
  const includePrimaryHome = finances.includePrimaryHomeInFire ?? true;
  const includeGold = finances.includeGoldInFire ?? true;

  const fireEligibleAssetsUSD = Math.round(
    savings +
      stocks +
      others +
      (includePrimaryHome ? realEstate : 0) +
      (includeGold ? gold : 0)
  );

  // Resolve liabilities cleanly: if totalLiabilitiesUSD is explicitly set (including 0), use it; else sum loans
  const loansList = finances.loans || [];
  const loansPrincipalSum = Math.round(
    loansList.reduce((sum, l) => sum + (Number(l.outstandingPrincipalUSD) || 0), 0)
  );
  const totalDebtUSD =
    typeof finances.totalLiabilitiesUSD === 'number'
      ? Math.max(0, Math.round(finances.totalLiabilitiesUSD))
      : loansPrincipalSum;

  const netWorthUSD = Math.max(0, grossAssetsUSD - totalDebtUSD);
  const effectiveFireCorpusUSD = Math.max(0, fireEligibleAssetsUSD - totalDebtUSD);

  // Resolve target country vs residing country
  const residingCountryName =
    userProfile.residingCountry || userProfile.originCountry || 'United States';
  const residingIsHaven = countries.some(
    c => c.name.toLowerCase() === residingCountryName.toLowerCase()
  );
  const resolvedDefaultCountry =
    residingIsHaven && (!userProfile.targetCountry || userProfile.targetCountry === 'Portugal')
      ? residingCountryName
      : userProfile.targetCountry || residingCountryName || 'Portugal';

  const targetCountryName =
    (overrideCountryName && overrideCountryName.trim()) || resolvedDefaultCountry;

  const { monthlyBurnUSD, topCityName, countryFlag } = resolveCountryMonthlyBurnUSD(
    targetCountryName,
    countries,
    userProfile,
    finances
  );

  // Domestic / Home country monthly burn for comparison & years saved
  const domesticMonthlyBurnUSD = Math.max(
    monthlyBurnUSD + 800,
    finances.monthlyCurrentExpensesUSD ||
      finances.monthlyRetirementExpensesUSD ||
      4800
  );

  // Continuing passive income in retirement (rental, dividends, pension, etc.)
  const sideList = finances.sideIncomes || [];
  const itemizedContinuingPassiveUSD = Math.round(
    sideList
      .filter(s => s.continuesInRetirement)
      .reduce((sum, s) => sum + (Number(s.monthlyAmountUSD) || 0), 0)
  );
  const continuingPassiveMonthlyUSD =
    sideList.length > 0
      ? itemizedContinuingPassiveUSD
      : Math.round(Number(finances.additionalMonthlyPassiveUSD) || 0);

  // Net monthly portfolio withdrawal needed in the target country
  const netMonthlyPortfolioNeedUSD = Math.max(
    300,
    monthlyBurnUSD - continuingPassiveMonthlyUSD
  );

  const swrPercent = Math.max(2.0, Number(finances.safeWithdrawalRatePercent) || 4.0);
  const swrDecimal = swrPercent / 100;

  // Living FIRE target in the target country
  const livingFireTargetUSD = Math.round((netMonthlyPortfolioNeedUSD * 12) / swrDecimal);

  // Future milestone expenses (if any)
  const goalsList = finances.futureExpenses || [];
  const futureGoalsTodayUSD = Math.round(
    goalsList.reduce((sum, g) => sum + (Number(g.estimatedCostTodayUSD) || 0), 0)
  );

  const comprehensiveFireTargetUSD = livingFireTargetUSD + futureGoalsTodayUSD;
  const targetFireNestEggUSD = Math.max(100000, comprehensiveFireTargetUSD);

  const uncappedFireProgressPct = Math.max(
    5,
    Math.round((effectiveFireCorpusUSD / Math.max(1, targetFireNestEggUSD)) * 100)
  );
  const fireProgressPercent = Math.min(100, uncappedFireProgressPct);
  const isCompleteFire = uncappedFireProgressPct >= 100;

  // Calculate domestic FIRE target to determine how many years earlier geoarbitrage lets them retire
  const netDomesticMonthlyNeedUSD = Math.max(
    500,
    domesticMonthlyBurnUSD - continuingPassiveMonthlyUSD
  );
  const domesticFireTargetUSD =
    Math.round((netDomesticMonthlyNeedUSD * 12) / swrDecimal) + futureGoalsTodayUSD;

  const annualSavingsAndGrowthUSD = Math.max(
    18000,
    (Number(finances.monthlySipUSD) || 2500) * 12 + effectiveFireCorpusUSD * 0.05
  );
  const capitalSavedByGeoarbitrageUSD = Math.max(
    0,
    domesticFireTargetUSD - targetFireNestEggUSD
  );
  const yearsSaved = Math.max(
    2,
    Math.min(20, Math.round(capitalSavedByGeoarbitrageUSD / annualSavingsAndGrowthUSD) || 8)
  );

  // Digital Nomad Runway (liquid savings + 25% of equities / monthly burn)
  const liquidNomadBufferUSD = Math.max(15000, savings + stocks * 0.25);
  const nomadRunwayMonths = Math.max(
    6,
    Math.min(180, Math.round(liquidNomadBufferUSD / Math.max(600, monthlyBurnUSD)))
  );

  const burnSavingsPct = Math.max(
    20,
    Math.min(
      80,
      Math.round(
        ((domesticMonthlyBurnUSD - monthlyBurnUSD) / Math.max(1, domesticMonthlyBurnUSD)) * 100
      )
    )
  );

  const recommendedBadgeTitle = isCompleteFire
    ? '100% FI'
    : uncappedFireProgressPct >= 75
    ? 'Arbitrage Architect'
    : 'Coast FIRE Nomad';
  const recommendedBadgeEmoji = isCompleteFire
    ? '🔥'
    : uncappedFireProgressPct >= 75
    ? '⚡'
    : '🌊';

  return {
    targetCountryName,
    targetCountryFlag: countryFlag,
    targetCityName: topCityName,
    residingCountryName,
    grossAssetsUSD,
    fireEligibleAssetsUSD,
    totalDebtUSD,
    netWorthUSD,
    effectiveFireCorpusUSD,
    includePrimaryHome,
    includeGold,
    monthlyBurnUSD,
    domesticMonthlyBurnUSD,
    continuingPassiveMonthlyUSD,
    netMonthlyPortfolioNeedUSD,
    swrPercent,
    livingFireTargetUSD,
    futureGoalsTodayUSD,
    comprehensiveFireTargetUSD,
    targetFireNestEggUSD,
    uncappedFireProgressPct,
    fireProgressPercent,
    isCompleteFire,
    yearsSaved,
    nomadRunwayMonths,
    burnSavingsPct,
    recommendedBadgeTitle,
    recommendedBadgeEmoji,
  };
}
