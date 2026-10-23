export type Region = 'Europe' | 'Southeast Asia' | 'Americas';

export type ClimateCategory = 'Mediterranean' | 'Tropical' | 'Subtropical' | 'Temperate' | 'Highlands / Mild';

export type SortByType =
  | 'recommended'
  | 'budget-asc'
  | 'healthcare-desc'
  | 'travel-leisure-desc'
  | 'sunny-desc'
  | 'safety-desc'
  | 'visa-difficulty-asc'
  | 'visa-income-asc'
  | 'female-ratio-desc'
  | 'dating-nightlife-desc';

export interface TopCity {
  name: string;
  vibe: string;
  monthlyCostUSD: number;
  highlight: string;
}

export interface ShortTermVisaOption {
  id: string;
  name: string;
  category: 'Tourist & Scouting Stay' | 'Digital Nomad & Remote Work' | 'Temporary Visitor (VLS)' | 'Extended Trial Entry';
  duration: string;
  financialRequirement: string;
  incomeThresholdUSD: number;
  allowedActivities: string;
  processingMethod: string;
  processingTime: string;
  estimatedCost: string;
  idealFor: string;
  keyConditions: string[];
}

export type FaqCategoryType = 'banking' | 'taxes' | 'language' | 'healthcare' | 'housing';

export interface PreRetirementFaqItem {
  id: string;
  question: string;
  category: FaqCategoryType;
  categoryLabel: string;
  hurdleSeverity: 'Low' | 'Moderate' | 'High';
  shortSummary: string;
  detailedAnswer: string;
  actionableChecklist: string[];
  keyAgenciesOrForms: string[];
  estimatedResolutionTime: string;
}

export interface Country {
  id: string;
  name: string;
  code: string;
  flag: string;
  region: Region;
  capital: string;
  currency: string;
  currencySymbol: string;
  language: string;
  tagline: string;
  overview: string;
  imageUrl?: string;
  
  // Cost of Living (USD)
  costOfLiving: {
    monthlyBudgetSingleUSD: number;
    monthlyBudgetCoupleUSD: number;
    rent1BedCenterUSD: number;
    rent1BedOutsideUSD: number;
    mealInexpensiveUSD: number;
    utilitiesMonthlyUSD: number;
    groceriesIndex: number; // baseline 100 = NYC
    healthcareMonthlyUSD: number;
  };

  // Visa & Legal Rules
  visa: {
    retirementVisaName: string;
    minimumIncomeUSD: number;
    processingMonths: number;
    pathwayToPR: string;
    difficultyRating: number; // 1 (Easiest) to 5 (Strictest)
    keyRequirements: string[];
    taxStatus: string;
    allowedToWork: boolean;
    shortTermOptions?: ShortTermVisaOption[];
  };

  // Climate & Geography
  climate: {
    category: ClimateCategory;
    averageTempC: number;
    annualSunnyDays: number;
    humidityPercent: number;
    rainyMonths: string;
    bestMonths: string;
  };

  // Healthcare & Living
  lifestyle: {
    healthcareScore: number; // 0 - 100
    healthcareSummary: string;
    publicHealthcareAccess: string;
    safetyScore: number; // 0 - 100
    englishProficiency: 'Very High' | 'High' | 'Moderate' | 'Low';
    expatCommunitySize: string;
    walkabilityScore: number; // 0 - 100
  };

  // Demographics & Dating Culture
  demographics: {
    medianAge: number;
    youngPopulationPercent: number; // age under 30
    femalesPer100Males: number; // number of females per 100 males
    datingRating: number; // 1 to 5
    datingCultureSummary: string;
    socialAtmosphere: string;
  };

  // Nightlife & Adult Entertainment
  adultEntertainment: {
    nightlifeScore: number; // 1 to 5
    nightlifeVibrancy: 'Quiet & Wine Lounges' | 'Balanced Coastal Social' | 'Vibrant & Diverse' | 'World-Famous Nightlife';
    adultEntertainmentScore: number; // 1 to 5
    legalStatus: string;
    overview: string;
    topVenuesOrDistricts: string[];
    safetyGuidance: string;
  };

  // Towns & Hubs
  topCities: TopCity[];
  pros: string[];
  cons: string[];
}

export interface VisitedCountry {
  id: string;
  countryName: string;
  countryCode?: string;
  flag: string;
  yearVisited: number;
  purpose: 'Scouting Trip' | 'Vacation & Tourism' | 'Expat Residency' | 'Digital Nomad Stay' | 'Work / Relocation';
  duration?: string;
  favoriteSpotOrMemory?: string;
  notes?: string;
  rating: number; // 1 to 5
  wouldRetireHere?: 'Definitely' | 'Maybe' | 'Unlikely';
}

export interface KnownLanguage {
  id: string;
  language: string;
  proficiency: 'Native' | 'Fluent' | 'Conversational' | 'Intermediate' | 'Beginner / Learning';
}

export type InterestLevel =
  | 'Top Contender'
  | 'Strong Interest'
  | 'Moderate Interest'
  | 'Casual Exploration'
  | 'Ruled Out';

export interface CountryJournalEntry {
  id: string;
  userId: string;
  countryId: string;
  countryName: string;
  countryFlag: string;
  interestLevel: InterestLevel;
  privateNotes: string;
  tags: string[];
  scoutingTimeline?: string;
  personalBudgetEstimateUSD?: number;
  visitedBefore: boolean;
  isFavorited: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserAccount {
  id: string;
  username?: string;
  email: string;
  password?: string;
  name: string;
  createdAt: string;
  profile: UserProfile;
  checklist?: RelocationChecklistTask[];
  journalEntries?: Record<string, CountryJournalEntry>;
  cloudSynced?: boolean;
  lastSyncedAt?: string;
}

export interface InvestmentSchemes {
  savingsUSD: number; // High-yield cash, emergency funds, certificates of deposit
  stocksMutualFundsUSD: number; // Equities, index funds, ETFs, 401k/IRA/brokerage portfolios
  realEstateUSD: number; // Primary residence equity, rental units, land value
  goldUSD: number; // Physical bullion, Sovereign Gold Bonds (SGB), precious metals
  othersUSD: number; // Crypto, bonds, private business equity, alternative assets
}

export interface UserLoanItem {
  id: string;
  name: string;
  category: 'Home / Mortgage' | 'Car / Vehicle' | 'Personal / Credit' | 'Education' | 'Business / Investment' | 'Other';
  outstandingPrincipalUSD: number;
  interestRatePercent: number;
  monthlyEmiUSD: number;
  remainingYears: number;
}

export interface SideIncomeStream {
  id: string;
  name: string;
  category: 'Dividends & Interest' | 'Rental Property' | 'Side Business / Consulting' | 'Pension / Annuity' | 'Royalties / Other';
  monthlyAmountUSD: number;
  continuesInRetirement: boolean;
}

export interface FutureMilestoneExpense {
  id: string;
  title: string;
  category:
    | 'Children Education'
    | 'Children Marriage'
    | 'Self Education'
    | 'Self Marriage / Family'
    | 'World Travel / Sabbatical'
    | 'Insurance & Medical Corpus'
    | 'Major Purchase / Property'
    | 'Other Goal';
  estimatedCostTodayUSD: number;
  targetYear: number;
  priority: 'Essential' | 'Aspirational';
}

export interface UserFinancialPortfolio {
  currentSalaryUSD: number; // Annual salary amount
  salaryFrequency: 'annual' | 'monthly';
  monthlySalaryUSD: number; // Calculated or explicit monthly take-home/gross
  additionalMonthlyPassiveUSD?: number; // Pensions, dividends, annuities, social security
  investments: InvestmentSchemes;
  totalLiabilitiesUSD?: number; // Mortgages, loans, personal debt
  safeWithdrawalRatePercent?: number; // Default 4.0%
  preferredCurrency?: string; // Default 'USD'
  currentAge?: number; // Default 42
  targetFireAge?: number; // Default 52
  monthlyCurrentExpensesUSD?: number; // Current monthly household & living expenses (excluding loan EMIs & SIP)
  monthlySipUSD?: number; // Monthly Systematic Investment Plan (SIP) contribution
  annualSipStepUpPercent?: number; // Annual % increase in SIP (e.g. 5% - 10%)
  expectedReturnRatePercent?: number; // Expected annual portfolio return %
  inflationRatePercent?: number; // Residing country annual inflation %
  includePrimaryHomeInFire?: boolean; // Whether real estate equity is counted toward liquid FIRE
  loans?: UserLoanItem[]; // Multiple itemized loans
  sideIncomes?: SideIncomeStream[]; // Itemized side/passive income streams
  futureExpenses?: FutureMilestoneExpense[]; // Itemized future life milestones & insurance goals
  notes?: string;
  updatedAt?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  originCountry: string;
  residingCountry?: string;
  originCity?: string;
  targetCountry: string;
  retirementTimelineYear: number;
  monthlyBudgetUSD: number;
  preferredClimate: ClimateCategory | 'Any';
  savedCountryIds: string[];
  rsvpMeetupIds: string[];
  appliedVisas: { countryId: string; visaName: string; status: 'In Review' | 'Submitted' | 'Approved' }[];
  bio: string;
  aboutMe?: string;
  occupationOrBackground?: string;
  relocationStatus?: 'Exploring Options' | 'Scouting In-Person' | 'Visa In-Progress' | 'Relocated & Settled' | 'Early Retired (FIRE)';
  languagesKnown?: KnownLanguage[];
  interests?: string[];
  travelHistory?: VisitedCountry[];
  finances?: UserFinancialPortfolio;
  role: 'member' | 'admin';
}

export interface Comment {
  id: string;
  authorName: string;
  authorLocation: string;
  authorAvatar: string;
  text: string;
  createdAt: string;
}

export interface CommunityThread {
  id: string;
  countryId: string;
  countryName: string;
  category: 'Visas & Paperwork' | 'Cost of Living' | 'Housing & Real Estate' | 'Healthcare' | 'Dating & Nightlife' | 'General Expat Life';
  title: string;
  content: string;
  authorName: string;
  authorLocation: string;
  authorAvatar: string;
  createdAt: string;
  upvotes: number;
  hasUpvoted?: boolean;
  comments: Comment[];
  isPinned?: boolean;
}

export interface ExpatMeetup {
  id: string;
  countryId: string;
  countryName: string;
  city: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  hostName: string;
  hostRole: string;
  attendeesCount: number;
  isRsvped: boolean;
  category: 'Coffee & Chat' | 'Sunset Drinks & Tapas' | 'Relocation Workshop' | 'Outdoor Hike / Excursion';
}

export interface DirectMessage {
  id: string;
  sender: 'user' | 'peer';
  senderUserId?: string;
  senderName?: string;
  recipientUserId?: string;
  recipientName?: string;
  text: string;
  timestamp: string;
  createdAt?: string;
  read?: boolean;
}

export interface DirectMessageThread {
  id: string;
  peerUserId?: string;
  peerName: string;
  peerAvatar: string;
  peerCountry: string;
  peerCity: string;
  peerStatus: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: DirectMessage[];
  participants?: string[];
  lastActivityAt?: string;
}

export interface InAppMessageNotification {
  id: string;
  threadId: string;
  peerName: string;
  peerAvatar: string;
  peerCountry: string;
  peerCity: string;
  text: string;
  timestamp: string;
}

export interface RelocationChecklistTask {
  id: string;
  category: 'Financial' | 'Legal & Visas' | 'Healthcare' | 'Logistics & Housing';
  title: string;
  description: string;
  completed: boolean;
}

// ==========================================
// Travel, Activities & Domestic Mobility
// ==========================================

export interface RetireeActivity {
  id: string;
  title: string;
  category: 'Outdoor & Nature' | 'Culture & Arts' | 'Social & Clubs' | 'Food, Wine & Culinary' | 'Wellness & Fitness' | 'Volunteering & Learning';
  description: string;
  popularLocations: string;
  intensity: 'Gentle & Relaxed' | 'Moderate Activity' | 'Active Exploration';
  whyRetireesLoveIt: string;
}

export interface TravelMobilityProfile {
  safetyRating: number; // 0 - 100
  safetyVerdict: 'Exceptionally Safe' | 'Very Safe' | 'Moderately Safe - Standard Awareness' | 'Caution Required';
  easeOfMovement: 'Effortless / Excellent Transit' | 'Convenient & Accessible' | 'Moderate / Regional Nuances' | 'Adventurous / Requires Planning';
  excitementLevel: 'World-Class Scenic Variety' | 'High Cultural Immersion' | 'Charming & Scenic' | 'Peaceful & Low-Key';
  summary: string;
  recommendedDestinations: string[];
  transportOptions: string[];
  safetyAdvice: string[];
}

export interface CoupleTravelProfile extends TravelMobilityProfile {
  romanticEscapes: string[];
  scenicRoadTrips: string[];
  coupleFriendlyVibe: string;
}

export interface SoloTravelerProfile extends TravelMobilityProfile {
  socialEaseRating: number; // 0 - 100
  solitaryDiningAndCafeCulture: string;
  meetingOtherRetirees: string;
  solitaryNavigationTips: string[];
}

export interface SoloFemaleTravelerProfile extends TravelMobilityProfile {
  femaleSafetyScore: number; // 0 - 100
  streetHarassmentLevel: 'Virtually Non-Existent' | 'Very Rare / Respectful Culture' | 'Occasional Catcalling in Tourist Hubs' | 'Moderate / Heightened Vigilance Needed';
  culturalDressAndEtiquette: string;
  nighttimeTransitAdvice: string;
  recommendedPrecautions: string[];
  femaleExpatCommunities: string;
}

export interface DomesticTransitSystem {
  publicTransitScore: number; // 0 - 100
  trainNetwork: string;
  intercityBuses: string;
  carRentalAndRoads: string;
  rideHailingAndTaxis: string[];
  domesticAirAndFerries: string;
}

export interface CountryTravelMobility {
  countryId: string;
  countryName: string;
  activitiesHeadline: string;
  retireeActivities: RetireeActivity[];
  domesticTransit: DomesticTransitSystem;
  couples: CoupleTravelProfile;
  solo: SoloTravelerProfile;
  soloFemale: SoloFemaleTravelerProfile;
}
