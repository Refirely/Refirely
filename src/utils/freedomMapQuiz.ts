import { ClimateCategory, Country, Persona, UserProfile, UserFinancialPortfolio } from '../types';
import { getCountryNomadProfile } from '../data/countryNomadProfiles';
import { getCountryTravelLeisureScore } from '../data/countryTravelMobility';

export type FreedomEscapePlan = 'full_fire' | 'coast_fire' | 'mini_retirement';
export type FreedomHouseholdMode = 'solo' | 'couple';

export type FreedomPriorityId =
  | 'budget-asc'
  | 'nomad-burn-asc'
  | 'healthcare-desc'
  | 'safety-desc'
  | 'visa-difficulty-asc'
  | 'visa-income-asc'
  | 'dnv-friendly'
  | 'internet-speed-desc'
  | 'coworking-friendly'
  | 'travel-leisure-desc'
  | 'sunny-desc'
  | 'dating-nightlife-desc'
  | 'female-ratio-desc'
  | 'zero-tax'
  | 'climate-mediterranean'
  | 'climate-tropical'
  | 'climate-highlands'
  | 'climate-temperate';

export interface FreedomPriorityOption {
  id: FreedomPriorityId;
  label: string;
  shortHint: string;
  group: 'Core & Financial' | 'Lifestyle & Nomad' | 'Climate & Tax';
}

export const FREEDOM_PRIORITY_OPTIONS: FreedomPriorityOption[] = [
  // Core & Financial (mirrors Explore Havens Sort By & Filters)
  { id: 'budget-asc', label: 'Lowest Cost of Living', shortHint: 'Stretch every dollar further', group: 'Core & Financial' },
  { id: 'nomad-burn-asc', label: 'Lowest Monthly Runway Burn', shortHint: 'Max months per $10k saved', group: 'Core & Financial' },
  { id: 'healthcare-desc', label: 'Highest Healthcare Index', shortHint: 'Top hospitals & expat care', group: 'Core & Financial' },
  { id: 'safety-desc', label: 'Highest Safety Score', shortHint: 'Low crime & calm daily life', group: 'Core & Financial' },
  { id: 'visa-difficulty-asc', label: 'Easiest Visa Process (Tier 1–2)', shortHint: 'Low-friction residency paths', group: 'Core & Financial' },
  { id: 'visa-income-asc', label: 'Lowest Visa Income Requirement', shortHint: 'Accessible passive/remote floors', group: 'Core & Financial' },

  // Lifestyle & Nomad (mirrors Explore Havens Sort By)
  { id: 'dnv-friendly', label: 'Digital Nomad Visa Friendly', shortHint: 'Official remote-work permits', group: 'Lifestyle & Nomad' },
  { id: 'internet-speed-desc', label: 'Fastest Internet Speeds', shortHint: 'High-speed fiber reliability', group: 'Lifestyle & Nomad' },
  { id: 'coworking-friendly', label: 'Best Coworking & Cafe Culture', shortHint: 'Vibrant remote-work hubs', group: 'Lifestyle & Nomad' },
  { id: 'travel-leisure-desc', label: 'Top Travel & Leisure', shortHint: 'Regional flight hubs & sights', group: 'Lifestyle & Nomad' },
  { id: 'sunny-desc', label: 'Most Sunny Days', shortHint: '300+ days of bright weather', group: 'Lifestyle & Nomad' },
  { id: 'dating-nightlife-desc', label: 'Best Dating & Nightlife', shortHint: 'Active social & evening scene', group: 'Lifestyle & Nomad' },
  { id: 'female-ratio-desc', label: 'Highest Female-to-Male Ratio', shortHint: 'Demographic social balance', group: 'Lifestyle & Nomad' },

  // Climate & Tax (mirrors Explore Havens Climate Zones & Tax Filters)
  { id: 'zero-tax', label: '0% / Territorial Tax Friendly', shortHint: 'Keep foreign income untaxed', group: 'Climate & Tax' },
  { id: 'climate-mediterranean', label: 'Mediterranean Climate', shortHint: 'Dry sunny summers, mild winters', group: 'Climate & Tax' },
  { id: 'climate-tropical', label: 'Tropical & Coastal Warmth', shortHint: 'Year-round beach weather', group: 'Climate & Tax' },
  { id: 'climate-highlands', label: 'Highlands / Mild Spring', shortHint: 'Eternal spring mountain air', group: 'Climate & Tax' },
  { id: 'climate-temperate', label: 'Temperate 4-Season Living', shortHint: 'Distinct crisp seasons', group: 'Climate & Tax' },
];

export interface FreedomQuizState {
  nestEggUSD: number;
  monthlyBudgetUSD: number;
  household: FreedomHouseholdMode;
  escapePlan: FreedomEscapePlan;
  priorities: FreedomPriorityId[];
  completedReveal: boolean;
  updatedAt: string;
}

export interface FreedomPriorityScoreDetail {
  id: FreedomPriorityId;
  label: string;
  score: number; // 0 to 100
}

export interface FreedomScoreBreakdown {
  baseScore: number;
  budgetPoints: number;
  budgetReason: string;
  escapePlanPoints: number;
  escapePlanReason: string;
  priorityPoints: number;
  priorityDetails: FreedomPriorityScoreDetail[];
  curatedBoost: number;
  whyRankedBullets: string[];
}

export interface FreedomCountryMatch {
  country: Country;
  matchPercent: number;
  monthlyCostUSD: number;
  monthlySavingsVsBudgetUSD: number;
  visaLabel: string;
  visaIncomeReqUSD: number;
  visaQualifies: boolean;
  taxSummary: string;
  fiberMbps: number;
  inflation10YrLowUSD: number; // 3% annual inflation
  inflation10YrHighUSD: number; // 5% annual inflation
  highlightReason: string;
  scoreBreakdown: FreedomScoreBreakdown;
}

export interface FreedomMapResults {
  runwayLabel: string;
  runwayShortLabel: string;
  runwaySubLabel: string;
  isIndefinite: boolean;
  runwayTotalMonths: number;
  qualifyingCount: number;
  topMatch: FreedomCountryMatch | null;
  topMatches: FreedomCountryMatch[];
  blurredMatches: FreedomCountryMatch[];
  allRanked: FreedomCountryMatch[];
  safeMonthlyWithdrawalUSD: number;
}

export const FREEDOM_QUIZ_STORAGE_KEY = 'refirely_freedom_map_quiz_v1';
export const FREEDOM_QUIZ_PENDING_HYDRATE_KEY = 'refirely_freedom_map_quiz_pending_hydrate';
export const FREEDOM_QUIZ_UPDATED_EVENT = 'refirely_freedom_quiz_updated';

export const DEFAULT_FREEDOM_QUIZ_STATE: FreedomQuizState = {
  nestEggUSD: 250000,
  monthlyBudgetUSD: 2400,
  household: 'solo',
  escapePlan: 'coast_fire',
  priorities: ['budget-asc', 'healthcare-desc'],
  completedReveal: false,
  updatedAt: '',
};

export function saveFreedomQuizState(state: FreedomQuizState): void {
  const payload: FreedomQuizState = {
    ...state,
    updatedAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(FREEDOM_QUIZ_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore storage quota errors
  }
  try {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(FREEDOM_QUIZ_UPDATED_EVENT, { detail: payload }));
    }
  } catch {
    // Ignore event dispatch issues
  }
}

export function loadFreedomQuizState(): FreedomQuizState | null {
  try {
    const raw = localStorage.getItem(FREEDOM_QUIZ_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<FreedomQuizState>;
    if (typeof parsed.nestEggUSD !== 'number' || typeof parsed.monthlyBudgetUSD !== 'number') {
      return null;
    }
    return {
      nestEggUSD: Math.max(0, Math.min(5000000, parsed.nestEggUSD)),
      monthlyBudgetUSD: Math.max(1000, Math.min(10000, parsed.monthlyBudgetUSD)),
      household: parsed.household === 'couple' ? 'couple' : 'solo',
      escapePlan:
        parsed.escapePlan === 'full_fire' ||
        parsed.escapePlan === 'coast_fire' ||
        parsed.escapePlan === 'mini_retirement'
          ? parsed.escapePlan
          : 'coast_fire',
      priorities: Array.isArray(parsed.priorities)
        ? (parsed.priorities.slice(0, 2) as FreedomPriorityId[])
        : ['budget-asc', 'healthcare-desc'],
      completedReveal: Boolean(parsed.completedReveal),
      updatedAt: parsed.updatedAt || new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function markPendingFreedomQuizHydration(state: FreedomQuizState): void {
  saveFreedomQuizState({ ...state, completedReveal: true });
  try {
    localStorage.setItem(FREEDOM_QUIZ_PENDING_HYDRATE_KEY, 'true');
  } catch {}
}

export function hasPendingFreedomQuizHydration(): boolean {
  try {
    return localStorage.getItem(FREEDOM_QUIZ_PENDING_HYDRATE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function clearPendingFreedomQuizHydration(): void {
  try {
    localStorage.removeItem(FREEDOM_QUIZ_PENDING_HYDRATE_KEY);
  } catch {}
}

export function mapFreedomQuizToPersona(escapePlan: FreedomEscapePlan): Persona {
  return escapePlan === 'full_fire' ? 'retiree' : 'nomad';
}

export function mapFreedomPrioritiesToClimate(priorities: FreedomPriorityId[]): ClimateCategory | 'Any' {
  if (priorities.includes('climate-mediterranean')) return 'Mediterranean';
  if (priorities.includes('climate-tropical')) return 'Tropical';
  if (priorities.includes('climate-highlands')) return 'Highlands / Mild';
  if (priorities.includes('climate-temperate')) return 'Temperate';
  return 'Any';
}

function isTerritorialOrZeroTax(country: Country): boolean {
  const tax = (country.visa?.taxStatus || '').toLowerCase();
  return (
    tax.includes('0%') ||
    tax.includes('zero') ||
    tax.includes('territorial') ||
    tax.includes('tax-free') ||
    tax.includes('no personal income tax') ||
    tax.includes('exempt')
  );
}

function isDigitalNomadVisaFriendly(remoteWorkVisaName: string): boolean {
  const lower = (remoteWorkVisaName || '').toLowerCase();
  return (
    lower.includes('nomad') ||
    lower.includes('remote') ||
    lower.includes('dtv') ||
    lower.includes('d8') ||
    lower.includes('freelance') ||
    lower.includes('telework') ||
    lower.includes('startup') ||
    lower.includes('workation') ||
    lower.includes('digital')
  );
}

function scorePriorityForCountry(country: Country, priority: FreedomPriorityId, household: FreedomHouseholdMode): number {
  const nomad = getCountryNomadProfile(country);
  const travelScore = getCountryTravelLeisureScore(country);
  const hasDnv = isDigitalNomadVisaFriendly(nomad.remoteWorkVisaName);
  const baseCost =
    household === 'couple'
      ? country.costOfLiving.monthlyBudgetCoupleUSD
      : country.costOfLiving.monthlyBudgetSingleUSD;

  switch (priority) {
    case 'budget-asc':
      return Math.max(0, Math.min(100, ((4500 - baseCost) / 3500) * 100));
    case 'nomad-burn-asc':
      return Math.max(0, Math.min(100, ((3800 - nomad.monthlyNomadBurnUSD) / 2800) * 100));
    case 'healthcare-desc':
      return country.lifestyle.healthcareScore;
    case 'safety-desc':
      return country.lifestyle.safetyScore;
    case 'visa-difficulty-asc':
      return Math.max(0, Math.min(100, ((6 - country.visa.difficultyRating) / 5) * 100));
    case 'visa-income-asc':
      return Math.max(0, Math.min(100, ((4000 - (country.visa.minimumIncomeUSD || 0)) / 4000) * 100));
    case 'dnv-friendly':
      return hasDnv ? 95 : nomad.hasCuratedData ? 65 : 38;
    case 'internet-speed-desc':
      return Math.max(0, Math.min(100, (nomad.verifiedInternetMbps / 260) * 100));
    case 'coworking-friendly':
      return nomad.coworkingDensity === 'World-Class Nomad Hub'
        ? 98
        : nomad.coworkingDensity === 'Abundant & Vibrant'
          ? 85
          : nomad.coworkingDensity === 'Growing Network'
            ? 70
            : 45;
    case 'travel-leisure-desc':
      return travelScore;
    case 'sunny-desc':
      return Math.max(0, Math.min(100, (country.climate.annualSunnyDays / 320) * 100));
    case 'dating-nightlife-desc':
      return Math.max(
        0,
        Math.min(
          100,
          ((country.demographics.datingRating + country.adultEntertainment.nightlifeScore) / 10) * 100
        )
      );
    case 'female-ratio-desc':
      return Math.max(0, Math.min(100, ((country.demographics.femalesPer100Males - 85) / 35) * 100));
    case 'zero-tax':
      return isTerritorialOrZeroTax(country) ? 98 : 42;
    case 'climate-mediterranean':
      return country.climate.category === 'Mediterranean' ? 98 : country.climate.category === 'Subtropical' ? 68 : 38;
    case 'climate-tropical':
      return country.climate.category === 'Tropical' ? 98 : country.climate.category === 'Subtropical' ? 76 : 36;
    case 'climate-highlands':
      return country.climate.category === 'Highlands / Mild' ? 98 : country.climate.category === 'Temperate' ? 68 : 40;
    case 'climate-temperate':
      return country.climate.category === 'Temperate' ? 98 : country.climate.category === 'Mediterranean' ? 70 : 40;
    default:
      return 65;
  }
}

function getPriorityShortLabel(priority: FreedomPriorityId): string {
  const found = FREEDOM_PRIORITY_OPTIONS.find(p => p.id === priority);
  return found ? found.label : 'Lifestyle Match';
}

export function computeFreedomMapResults(
  countries: Country[],
  quiz: FreedomQuizState
): FreedomMapResults {
  const nestEgg = Math.max(0, quiz.nestEggUSD);
  const monthlyBudget = Math.max(1000, quiz.monthlyBudgetUSD);
  const annualSpend = monthlyBudget * 12;
  const safeMonthlyWithdrawalUSD = Math.round((nestEgg * 0.04) / 12);

  // Compute realistic runway (accounting for 4% SWR and 5% real compounding yield during drawdown)
  let isIndefinite = false;
  let runwayTotalMonths = 0;
  let runwayLabel = '';
  let runwayShortLabel = '';
  let runwaySubLabel = '';

  if (nestEgg * 0.04 >= annualSpend) {
    isIndefinite = true;
    runwayTotalMonths = 600;
    runwayLabel = 'Indefinite · 4% Safe Withdrawal Ready';
    runwayShortLabel = 'Indefinite (4% SWR)';
    runwaySubLabel = `Your $${nestEgg.toLocaleString()} portfolio generates ~$${safeMonthlyWithdrawalUSD.toLocaleString()}/mo at 4% SWR`;
  } else if (quiz.escapePlan === 'coast_fire' && nestEgg >= annualSpend * 5) {
    // Coast FIRE with remote income offsetting living expenses + strong buffer
    const monthlyRealRate = 0.05 / 12;
    const netMonthlyDraw = Math.max(monthlyBudget * 0.35, monthlyBudget - safeMonthlyWithdrawalUSD);
    if (nestEgg * monthlyRealRate >= netMonthlyDraw) {
      isIndefinite = true;
      runwayTotalMonths = 600;
      runwayLabel = 'Indefinite · Coast FIRE Ready';
      runwayShortLabel = 'Indefinite (Coast)';
      runwaySubLabel = 'Remote income covers living burn while your nest egg compounds untouched';
    } else {
      const months = Math.round(
        -Math.log(1 - (nestEgg * monthlyRealRate) / netMonthlyDraw) / Math.log(1 + monthlyRealRate)
      );
      runwayTotalMonths = Math.max(12, Math.min(540, Number.isFinite(months) ? months : Math.round(nestEgg / netMonthlyDraw)));
      const yrs = Math.floor(runwayTotalMonths / 12);
      const remMos = runwayTotalMonths % 12;
      runwayLabel = remMos > 0 ? `${yrs} Years, ${remMos} Months` : `${yrs} Years`;
      runwayShortLabel = runwayLabel;
      runwaySubLabel = 'Coast FIRE runway assuming partial remote-work coverage + 5% real growth';
    }
  } else {
    // Direct drawdown with conservative 5% real investment return (4.5% for mini-retirement)
    const realAnnualReturn = quiz.escapePlan === 'mini_retirement' ? 0.04 : 0.05;
    const monthlyRate = realAnnualReturn / 12;
    if (nestEgg <= 0) {
      runwayTotalMonths = 0;
      runwayLabel = '0 Years, 0 Months';
      runwayShortLabel = '0 Months';
      runwaySubLabel = 'Add savings or choose Coast FIRE / Remote Work to fund your move';
    } else if (nestEgg * monthlyRate >= monthlyBudget) {
      isIndefinite = true;
      runwayTotalMonths = 600;
      runwayLabel = 'Indefinite · 4% Safe Withdrawal Ready';
      runwayShortLabel = 'Indefinite (4% SWR)';
      runwaySubLabel = `Portfolio yield covers your $${monthlyBudget.toLocaleString()}/mo lifestyle indefinitely`;
    } else {
      const exactMonths =
        -Math.log(1 - (nestEgg * monthlyRate) / monthlyBudget) / Math.log(1 + monthlyRate);
      runwayTotalMonths = Math.max(
        1,
        Math.round(Number.isFinite(exactMonths) ? exactMonths : nestEgg / monthlyBudget)
      );
      const yrs = Math.floor(runwayTotalMonths / 12);
      const remMos = runwayTotalMonths % 12;
      if (yrs === 0) {
        runwayLabel = `${remMos} ${remMos === 1 ? 'Month' : 'Months'}`;
      } else if (remMos === 0) {
        runwayLabel = `${yrs} ${yrs === 1 ? 'Year' : 'Years'}`;
      } else {
        runwayLabel = `${yrs} ${yrs === 1 ? 'Year' : 'Years'}, ${remMos} ${remMos === 1 ? 'Month' : 'Months'}`;
      }
      runwayShortLabel = runwayLabel;
      runwaySubLabel =
        quiz.escapePlan === 'mini_retirement'
          ? `Sabbatical cash runway at $${monthlyBudget.toLocaleString()}/mo (${quiz.household === 'couple' ? 'Couple' : 'Solo'})`
          : `Projected portfolio longevity at $${monthlyBudget.toLocaleString()}/mo with 5% real return`;
    }
  }

  // Score every country in the 209-country dataset
  const evaluated: FreedomCountryMatch[] = countries.map(country => {
    const nomad = getCountryNomadProfile(country);
    const monthlyCostUSD =
      quiz.escapePlan === 'full_fire'
        ? quiz.household === 'couple'
          ? country.costOfLiving.monthlyBudgetCoupleUSD
          : country.costOfLiving.monthlyBudgetSingleUSD
        : quiz.household === 'couple'
          ? Math.round(nomad.monthlyNomadBurnUSD * 1.38)
          : nomad.monthlyNomadBurnUSD;

    const monthlySavingsVsBudgetUSD = monthlyBudget - monthlyCostUSD;
    const withinBudget = monthlyCostUSD <= monthlyBudget * 1.08;

    const hasDnv = isDigitalNomadVisaFriendly(nomad.remoteWorkVisaName);

    // Visa pathway & income threshold tailored to Escape Plan
    const visaLabel =
      quiz.escapePlan === 'full_fire'
        ? country.visa.retirementVisaName
        : quiz.escapePlan === 'coast_fire'
          ? hasDnv
            ? nomad.remoteWorkVisaName
            : country.visa.retirementVisaName
          : country.visa.shortTermOptions?.[0]?.name ||
            (hasDnv ? nomad.remoteWorkVisaName : country.visa.retirementVisaName);

    const visaIncomeReqUSD =
      quiz.escapePlan === 'full_fire'
        ? country.visa.minimumIncomeUSD || 0
        : quiz.escapePlan === 'coast_fire'
          ? nomad.remoteWorkVisaIncomeUSD || country.visa.minimumIncomeUSD || 0
          : 0; // Mini-retirement / sabbatical relies primarily on savings & tourist/sabbatical stays

    // Qualification check
    const passiveMonthlyCapacity = Math.max(safeMonthlyWithdrawalUSD, monthlyBudget * 0.85);
    let visaQualifies = true;
    if (quiz.escapePlan === 'full_fire') {
      visaQualifies =
        withinBudget &&
        (visaIncomeReqUSD === 0 ||
          passiveMonthlyCapacity >= visaIncomeReqUSD * 0.85 ||
          nestEgg >= visaIncomeReqUSD * 180);
    } else if (quiz.escapePlan === 'coast_fire') {
      visaQualifies =
        withinBudget &&
        (hasDnv || country.visa.difficultyRating <= 3) &&
        (visaIncomeReqUSD === 0 || monthlyBudget * 1.45 >= visaIncomeReqUSD);
    } else {
      // Mini-retirement / Sabbatical: needs at least 6 months runway at this destination's cost
      visaQualifies = withinBudget && nestEgg >= monthlyCostUSD * 6;
    }

    // Composite lifestyle match score (60–99%)
    const baseScore = 58;
    let score = baseScore;

    // 1. Budget fit (up to +18 pts)
    let budgetPoints = 0;
    let budgetReason = '';
    if (monthlySavingsVsBudgetUSD >= 500) {
      budgetPoints = 18;
      budgetReason = `Est. $${monthlyCostUSD.toLocaleString()}/mo — saves $${monthlySavingsVsBudgetUSD.toLocaleString()}/mo vs your $${monthlyBudget.toLocaleString()}/mo budget`;
    } else if (monthlySavingsVsBudgetUSD >= 0) {
      budgetPoints = 14;
      budgetReason = `Est. $${monthlyCostUSD.toLocaleString()}/mo — fits inside your $${monthlyBudget.toLocaleString()}/mo budget (+$${monthlySavingsVsBudgetUSD.toLocaleString()}/mo cushion)`;
    } else if (monthlySavingsVsBudgetUSD >= -300) {
      budgetPoints = 6;
      budgetReason = `Est. $${monthlyCostUSD.toLocaleString()}/mo — close to target (+$${Math.abs(monthlySavingsVsBudgetUSD).toLocaleString()}/mo above budget)`;
    } else {
      budgetPoints = -10;
      budgetReason = `Est. $${monthlyCostUSD.toLocaleString()}/mo — exceeds your $${monthlyBudget.toLocaleString()}/mo budget by $${Math.abs(monthlySavingsVsBudgetUSD).toLocaleString()}/mo`;
    }
    score += budgetPoints;

    // 2. Escape plan compatibility (up to +10 pts)
    let escapePlanPoints = 0;
    let escapePlanReason = '';
    if (quiz.escapePlan === 'full_fire') {
      if (country.visa.difficultyRating <= 2) escapePlanPoints += 6;
      else if (country.visa.difficultyRating === 3) escapePlanPoints += 3;
      if (visaQualifies) escapePlanPoints += 4;
      escapePlanReason = `Full FIRE / Passive Income: ${visaLabel} (Difficulty Tier ${country.visa.difficultyRating}/5${visaQualifies ? ' · Qualifies today' : ' · Stretch threshold'})`;
    } else if (quiz.escapePlan === 'coast_fire') {
      if (hasDnv) escapePlanPoints += 6;
      if (nomad.coworkingDensity === 'World-Class Nomad Hub') escapePlanPoints += 4;
      else if (nomad.coworkingDensity === 'Abundant & Vibrant' || nomad.hasCuratedData) escapePlanPoints += 2;
      escapePlanReason = `Coast FIRE / Remote Work: ${hasDnv ? `${visaLabel} available` : 'Flexible long-stay path'} · ${nomad.coworkingDensity} (${nomad.verifiedInternetMbps} Mbps)`;
    } else {
      // Mini-retirement
      const travelScore = getCountryTravelLeisureScore(country);
      escapePlanPoints += Math.round((travelScore / 100) * 6);
      if (country.visa.difficultyRating <= 3) escapePlanPoints += 4;
      escapePlanReason = `Mini-Retirement / Sabbatical: Travel & Leisure ${travelScore}/100 · Entry Tier ${country.visa.difficultyRating}/5 (${visaLabel})`;
    }
    score += escapePlanPoints;

    // 3. Selected Step-4 Priorities (up to +14 pts)
    const activePriorities = quiz.priorities.length > 0 ? quiz.priorities : (['budget-asc', 'healthcare-desc'] as FreedomPriorityId[]);
    const priorityDetails: FreedomPriorityScoreDetail[] = activePriorities.map(p => ({
      id: p,
      label: getPriorityShortLabel(p),
      score: Math.round(scorePriorityForCountry(country, p, quiz.household)),
    }));
    const avgPriorityScore =
      priorityDetails.reduce((sum, item) => sum + item.score, 0) / Math.max(1, priorityDetails.length);
    const priorityPoints = Math.round((avgPriorityScore / 100) * 14);
    score += priorityPoints;

    // Subtle curated-dossier polish boost so flagship rich havens surface cleanly on ties
    const curatedBoost = nomad.hasCuratedData ? 2 : 0;
    score += curatedBoost;

    const matchPercent = Math.max(54, Math.min(98, Math.round(score)));

    // 10-Year Inflation Stress Test projections (3% baseline vs 5% elevated)
    const inflation10YrLowUSD = Math.round(monthlyCostUSD * Math.pow(1.03, 10));
    const inflation10YrHighUSD = Math.round(monthlyCostUSD * Math.pow(1.05, 10));

    const topPriorityLabel = getPriorityShortLabel(activePriorities[0]);
    const highlightReason =
      monthlySavingsVsBudgetUSD > 200
        ? `Saves ~$${monthlySavingsVsBudgetUSD.toLocaleString()}/mo vs your budget · Strong ${topPriorityLabel}`
        : `Fits your lifestyle · Ranked high for ${topPriorityLabel}`;

    const prioritySummaryText = priorityDetails
      .map(d => `${d.label} (${d.score}/100)`)
      .join(' & ');

    const whyRankedBullets: string[] = [
      `${budgetReason} (${budgetPoints >= 0 ? `+${budgetPoints}` : budgetPoints} pts)`,
      `${escapePlanReason} (+${escapePlanPoints} pts)`,
      `Priority Alignment: ${prioritySummaryText} (+${priorityPoints} pts)`,
      visaQualifies
        ? `Qualifies under your ${quiz.household === 'couple' ? 'Couple / Family' : 'Solo'} plan (${visaIncomeReqUSD > 0 ? `Min ~$${visaIncomeReqUSD.toLocaleString()}/mo` : 'Savings / Flexible entry'})`
        : `Higher threshold (${visaIncomeReqUSD > 0 ? `~$${visaIncomeReqUSD.toLocaleString()}/mo income req` : 'requires larger buffer'})`,
    ];

    return {
      country,
      matchPercent,
      monthlyCostUSD,
      monthlySavingsVsBudgetUSD,
      visaLabel,
      visaIncomeReqUSD,
      visaQualifies,
      taxSummary: country.visa.taxStatus || 'Standard Resident Tax Rules',
      fiberMbps: nomad.verifiedInternetMbps,
      inflation10YrLowUSD,
      inflation10YrHighUSD,
      highlightReason,
      scoreBreakdown: {
        baseScore,
        budgetPoints,
        budgetReason,
        escapePlanPoints,
        escapePlanReason,
        priorityPoints,
        priorityDetails,
        curatedBoost,
        whyRankedBullets,
      },
    };
  });

  // Sort by qualification first, then highest matchPercent, then lowest cost
  evaluated.sort((a, b) => {
    if (a.visaQualifies !== b.visaQualifies) return a.visaQualifies ? -1 : 1;
    if (b.matchPercent !== a.matchPercent) return b.matchPercent - a.matchPercent;
    return a.monthlyCostUSD - b.monthlyCostUSD;
  });

  const qualifyingCountries = evaluated.filter(e => e.visaQualifies);
  const qualifyingCount = Math.max(
    qualifyingCountries.length,
    evaluated.filter(e => e.monthlyCostUSD <= monthlyBudget * 1.15).length
  );

  const topMatches = evaluated.slice(0, 8);
  const topMatch = topMatches[0] || null;
  const blurredMatches = topMatches.slice(1, 4);

  return {
    runwayLabel,
    runwayShortLabel,
    runwaySubLabel,
    isIndefinite,
    runwayTotalMonths,
    qualifyingCount,
    topMatch,
    topMatches,
    blurredMatches,
    allRanked: evaluated,
    safeMonthlyWithdrawalUSD,
  };
}

/**
 * Hydrates a newly signed-up or signed-in UserProfile with the 4 Freedom Map Quiz
 * answers stored in localStorage so the user lands directly on their personalized
 * dashboard without ever re-entering their numbers.
 */
export function hydrateUserProfileFromFreedomQuiz(
  profile: UserProfile,
  countries: Country[],
  defaultPortfolio: UserFinancialPortfolio
): { profile: UserProfile; persona: Persona; hydrated: boolean } {
  if (!hasPendingFreedomQuizHydration()) {
    return { profile, persona: 'retiree', hydrated: false };
  }
  const quiz = loadFreedomQuizState();
  if (!quiz) {
    return { profile, persona: 'retiree', hydrated: false };
  }

  const results = computeFreedomMapResults(countries, quiz);
  const topMatchIds = results.topMatches.slice(0, 4).map(m => m.country.id);
  const mergedSavedIds = Array.from(new Set([...topMatchIds, ...(profile.savedCountryIds || [])]));
  const mappedClimate = mapFreedomPrioritiesToClimate(quiz.priorities);
  const baseFinances = profile.finances || defaultPortfolio;

  const hydratedFinances: UserFinancialPortfolio = {
    ...baseFinances,
    monthlyCurrentExpensesUSD: quiz.monthlyBudgetUSD,
    monthlyRetirementExpensesUSD: quiz.monthlyBudgetUSD,
    investments: {
      savingsUSD: Math.round(quiz.nestEggUSD * 0.25),
      stocksMutualFundsUSD: Math.round(quiz.nestEggUSD * 0.75),
      realEstateUSD: 0,
      goldUSD: 0,
      othersUSD: 0,
    },
    updatedAt: new Date().toISOString().split('T')[0],
  };

  const hydratedProfile: UserProfile = {
    ...profile,
    monthlyBudgetUSD: quiz.monthlyBudgetUSD,
    targetCountry: results.topMatch?.country.name || profile.targetCountry,
    savedCountryIds: mergedSavedIds,
    preferredClimate: mappedClimate !== 'Any' ? mappedClimate : profile.preferredClimate,
    relocationStatus:
      quiz.escapePlan === 'full_fire' ? 'Early Retired (FIRE)' : 'Exploring Options',
    finances: hydratedFinances,
  };

  return {
    profile: hydratedProfile,
    persona: mapFreedomQuizToPersona(quiz.escapePlan),
    hydrated: true,
  };
}

