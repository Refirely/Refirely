import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import {
  ScoutTrip,
  ScoutTripStop,
  ScoutTaskItem,
  ScoutPackingItem,
  ScoutVisaStatusTag,
  ScoutScheduledItineraryItem,
} from '../types';
import { getCountryNomadProfile } from '../data/countryNomadProfiles';
import {
  COUNTRY_HUB_COORDINATES,
  ScoutingFocusPreference,
  ScoutInterestId,
  SCOUT_INTEREST_CATALOG,
  WeeklyItineraryBlock,
  generateWeeklyItineraryForStops,
  getHubCoordinatesForCountry,
} from '../data/scoutCoordinatesAndItineraries';
import {
  StopCuratedRecommendationCard,
  DAY_SLOT_OPTIONS,
  TIME_OF_DAY_OPTIONS,
  buildDefaultScheduledItineraryForStops,
  buildGoogleMapsSearchUrl,
} from '../data/scoutVenueRecommendations';
import { ScoutRouteMap, CandidateMapCountry } from './ScoutRouteMap';
import { CountryFlag } from './CountryFlag';
import { CountryThumbnail } from './CountryThumbnail';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  collection,
} from 'firebase/firestore';
import {
  Compass,
  Calendar,
  Plus,
  Trash2,
  Check,
  Sparkles,
  AlertTriangle,
  ShieldCheck,
  DollarSign,
  MapPin,
  Briefcase,
  Home,
  KeyRound,
  ExternalLink,
  Save,
  Lock,
  Mail,
  User,
  LogIn,
  UserPlus,
  X,
  ArrowRight,
  Plane,
  FileText,
  Luggage,
  Wifi,
  HeartPulse,
  Eye,
  EyeOff,
  FolderOpen,
  CheckCircle2,
  Clock,
  Search,
  Globe,
  Laptop,
  SlidersHorizontal,
  Map as MapIcon,
  CalendarDays,
  Columns3,
  LayoutGrid,
  ChevronRight,
  Sun,
  Star,
} from 'lucide-react';

const DRAFT_STORAGE_KEY = 'refirely_scout_draft';
const DISCOVERY_STORAGE_KEY = 'refirely_scout_discovery_v2';

// Comprehensive set of European Schengen Area member countries (by country ID and lowercase name)
const SCHENGEN_COUNTRIES_SET = new Set([
  'portugal',
  'spain',
  'france',
  'italy',
  'greece',
  'malta',
  'croatia',
  'germany',
  'netherlands',
  'austria',
  'switzerland',
  'estonia',
  'czech-republic',
  'czechia',
  'hungary',
  'poland',
  'slovenia',
  'slovakia',
  'finland',
  'sweden',
  'denmark',
  'norway',
  'iceland',
  'belgium',
  'luxembourg',
  'latvia',
  'lithuania',
  'bulgaria',
  'romania',
  'liechtenstein',
]);

// Curated Non-Schengen Visa Hop Destinations when approaching/exceeding 90 days in Schengen
const NON_SCHENGEN_HOP_SUGGESTIONS: {
  countryId: string;
  name: string;
  flag: string;
  visaRule: string;
  visaTag: ScoutVisaStatusTag;
  highlight: string;
}[] = [
  {
    countryId: 'albania',
    name: 'Albania',
    flag: '🇦🇱',
    visaRule: 'Up to 1 Year Visa-Free (US) / 90d Non-Schengen',
    visaTag: 'Visa-Free',
    highlight: 'Mediterranean Riviera coast outside the Schengen clock',
  },
  {
    countryId: 'montenegro',
    name: 'Montenegro',
    flag: '🇲🇪',
    visaRule: '90 Days Visa-Free (Non-Schengen)',
    visaTag: '90-Day Tourist',
    highlight: 'Adriatic fjords (Kotor & Budva) with EUR currency',
  },
  {
    countryId: 'cyprus',
    name: 'Cyprus',
    flag: '🇨🇾',
    visaRule: '90 Days EU Non-Schengen Allowance',
    visaTag: '90-Day Tourist',
    highlight: '320+ sunny days & English widely spoken',
  },
  {
    countryId: 'georgia',
    name: 'Georgia',
    flag: '🇬🇪',
    visaRule: '365 Days Visa-Free Entry',
    visaTag: 'Visa-Free',
    highlight: 'Zero Schengen overlap, low burn & 1% remote tax option',
  },
  {
    countryId: 'turkey',
    name: 'Turkey',
    flag: '🇹🇷',
    visaRule: '90 Days Non-Schengen e-Visa / Tourist',
    visaTag: '90-Day Tourist',
    highlight: 'Aegean coast & Istanbul flight hub right next to Greece',
  },
  {
    countryId: 'morocco',
    name: 'Morocco',
    flag: '🇲🇦',
    visaRule: '90 Days Visa-Free Entry',
    visaTag: 'Visa-Free',
    highlight: '1-hour hop from Spain/Portugal to reset Schengen days',
  },
];

const VISA_STATUS_OPTIONS: ScoutVisaStatusTag[] = [
  '90-Day Tourist',
  'Schengen 90/180',
  'Digital Nomad Visa',
  'Visa-Free',
  'Retirement / Passive Visa',
  'e-Visa / VoA',
];

const DEFAULT_RELOCATION_TASKS: ScoutTaskItem[] = [
  {
    id: 'task-reloc-1',
    category: 'relocation',
    title: 'Check neighborhood noise on weekday mornings',
    countryTag: 'All Stops',
    completed: false,
  },
  {
    id: 'task-reloc-2',
    category: 'relocation',
    title: 'Speedtest fiber internet & 5G',
    countryTag: 'All Stops',
    completed: false,
  },
  {
    id: 'task-reloc-3',
    category: 'relocation',
    title: 'Visit local private health clinic',
    countryTag: 'Healthcare',
    completed: false,
  },
  {
    id: 'task-reloc-4',
    category: 'relocation',
    title: 'Open Wise multi-currency account',
    countryTag: 'Banking',
    completed: false,
  },
  {
    id: 'task-reloc-5',
    category: 'relocation',
    title: 'Walk 3 residential streets away from tourist zones after 8 PM',
    countryTag: 'Safety & Vibe',
    completed: false,
  },
  {
    id: 'task-reloc-6',
    category: 'relocation',
    title: 'Price a full weekly grocery & fresh market basket in local currency',
    countryTag: 'Cost Audit',
    completed: false,
  },
  {
    id: 'task-reloc-7',
    category: 'relocation',
    title: 'View 2 long-term rental apartments with a local estate agent',
    countryTag: 'Housing',
    completed: false,
  },
  {
    id: 'task-bucket-1',
    category: 'bucket-list',
    title: 'Work a morning session from a local specialty coffee & coworking hub',
    countryTag: 'Nomad Life',
    completed: false,
  },
  {
    id: 'task-bucket-2',
    category: 'bucket-list',
    title: 'Attend a local expat or digital nomad community meetup',
    countryTag: 'Community',
    completed: false,
  },
  {
    id: 'task-bucket-3',
    category: 'bucket-list',
    title: 'Take a regional train day-trip to compare a smaller coastal town',
    countryTag: 'Exploration',
    completed: false,
  },
  {
    id: 'task-bucket-4',
    category: 'bucket-list',
    title: 'Enjoy a traditional weekday lunch menu (Prato do Dia / Taverna)',
    countryTag: 'Gastronomy',
    completed: false,
  },
];

const DEFAULT_PACKING_ITEMS: ScoutPackingItem[] = [
  {
    id: 'pack-ess-1',
    category: 'essentials',
    title: 'Universal GaN power adapter & surge protector',
    completed: false,
  },
  {
    id: 'pack-ess-2',
    category: 'essentials',
    title: 'Unlocked eSIM-ready smartphone + backup physical SIM tool',
    completed: false,
  },
  {
    id: 'pack-ess-3',
    category: 'essentials',
    title: '90-day buffer of prescription medications + doctor summary',
    completed: false,
  },
  {
    id: 'pack-ess-4',
    category: 'essentials',
    title: 'Portable travel router & high-capacity power bank',
    completed: false,
  },
  {
    id: 'pack-ess-5',
    category: 'essentials',
    title: 'Noise-canceling headphones & ergonomic laptop stand',
    completed: false,
  },
  {
    id: 'pack-doc-1',
    category: 'documents',
    title: 'Apostilled birth & marriage certificates (originals + copies)',
    completed: false,
  },
  {
    id: 'pack-doc-2',
    category: 'documents',
    title: 'Apostilled FBI / national police background check (<90 days old)',
    completed: false,
  },
  {
    id: 'pack-doc-3',
    category: 'documents',
    title: 'Certified passport scans & biometric visa photos',
    completed: false,
  },
  {
    id: 'pack-doc-4',
    category: 'documents',
    title: 'Backup no-FX-fee debit & credit cards (stored in separate bag)',
    completed: false,
  },
  {
    id: 'pack-doc-5',
    category: 'documents',
    title: '6 months of PDF bank, pension, or remote income statements',
    completed: false,
  },
];

function isCountrySchengen(countryId: string, countryName: string): boolean {
  const idClean = countryId.trim().toLowerCase();
  const nameClean = countryName.trim().toLowerCase().replace(/\s+/g, '-');
  return SCHENGEN_COUNTRIES_SET.has(idClean) || SCHENGEN_COUNTRIES_SET.has(nameClean);
}

function calculateStopDays(arrivalDate: string, departureDate: string): number {
  if (!arrivalDate || !departureDate) return 0;
  const start = new Date(`${arrivalDate}T00:00:00Z`);
  const end = new Date(`${departureDate}T00:00:00Z`);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
  const diffMs = end.getTime() - start.getTime();
  if (diffMs < 0) return 0;
  return Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
}

function getTodayLocalIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function clampToMinIsoDate(isoDate: string, minIsoDate: string): string {
  if (!isoDate || isoDate < minIsoDate) return minIsoDate;
  return isoDate;
}

function addDaysToIsoDate(isoDate: string, daysToAdd: number): string {
  const fallback = getTodayLocalIsoDate();
  const base = new Date(`${isoDate || fallback}T00:00:00Z`);
  if (isNaN(base.getTime())) return fallback;
  base.setUTCDate(base.getUTCDate() + daysToAdd);
  return base.toISOString().split('T')[0];
}

type ContinentFilter = 'all' | 'Europe' | 'Asia' | 'Americas' | 'Middle East & Africa';
type DiscoveryBrowseMode = 'continents' | 'nomad-top' | 'search-all';
type PlannerStageTab = 'discover' | 'map-itinerary' | 'complete-itinerary' | 'workspace' | 'all-in-one';
type WizardStepId = 'step-1-region' | 'step-2-countries' | 'step-3-interests' | 'step-4-itinerary';

const INTERESTS_STORAGE_KEY = 'refirely_scout_interests_v1';
const HOBBIES_STORAGE_KEY = 'refirely_scout_hobbies_v1';
const ACTIVE_EDIT_TRIP_STORAGE_KEY = 'refirely_active_edit_trip';

// Resilient Magazine-Grade Photo Banner for Interest Cards & Weekly Itinerary Cards
const ResilientScenicBanner: React.FC<{
  primaryUrl: string;
  fallbackUrl?: string;
  gradientFallback: string;
  alt: string;
  className?: string;
  children?: React.ReactNode;
}> = ({ primaryUrl, fallbackUrl, gradientFallback, alt, className = 'h-48', children }) => {
  const [stage, setStage] = useState<'primary' | 'fallback' | 'art'>('primary');

  useEffect(() => {
    setStage('primary');
  }, [primaryUrl, fallbackUrl]);

  const activeSrc = stage === 'primary' ? primaryUrl : stage === 'fallback' ? fallbackUrl : null;

  return (
    <div
      className={`relative w-full overflow-hidden bg-gradient-to-br ${gradientFallback} ${className}`}
    >
      {/* Decorative Scenic Vector Backdrop (Always present beneath photo for zero broken state) */}
      <svg
        className="absolute inset-0 w-full h-full opacity-25 pointer-events-none"
        viewBox="0 0 800 320"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
      >
        <circle cx="660" cy="75" r="46" fill="white" fillOpacity="0.35" />
        <path
          d="M0 240L140 135L275 215L430 95L590 210L710 140L800 205V320H0V240Z"
          fill="white"
          fillOpacity="0.18"
        />
        <path
          d="M0 270L190 175L350 245L530 135L690 235L800 180V320H0V270Z"
          fill="black"
          fillOpacity="0.22"
        />
      </svg>

      {activeSrc && (
        <img
          src={activeSrc}
          alt={alt}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => {
            if (stage === 'primary' && fallbackUrl && fallbackUrl !== primaryUrl) {
              setStage('fallback');
            } else {
              setStage('art');
            }
          }}
          className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
        />
      )}

      {/* Multi-stop editorial dark gradient scrim for crisp text legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-slate-950/15" />
      <div className="relative z-10 h-full w-full">{children}</div>
    </div>
  );
};

function mapRegionToContinentGroup(region: string): ContinentFilter {
  if (region === 'Europe') return 'Europe';
  if (region === 'Southeast Asia' || region === 'Oceania') return 'Asia';
  if (
    region === 'Americas' ||
    region === 'North & Central America' ||
    region === 'South America'
  ) {
    return 'Americas';
  }
  return 'Middle East & Africa';
}

export const ScoutHopPlanner: React.FC = () => {
  const {
    countries,
    isAuthenticated,
    currentUserId,
    firebaseUser,
    login,
    signup,
    loginWithGoogle,
    setCurrentView,
    navigateToCountry,
    currentPersona,
  } = useApp();

  // Cost Calculation Basis ('retiree-single' | 'retiree-couple' | 'nomad')
  const [burnBasisMode, setBurnBasisMode] = useState<'retiree-single' | 'retiree-couple' | 'nomad'>(
    currentPersona === 'nomad' ? 'nomad' : 'retiree-single'
  );

  const todayIsoDate = getTodayLocalIsoDate();

  // Discovery & Preferences State (No pre-defined countries on initial load!)
  const [browseMode, setBrowseMode] = useState<DiscoveryBrowseMode>('continents');
  const [selectedContinent, setSelectedContinent] = useState<ContinentFilter>('all');
  const [countrySearchQuery, setCountrySearchQuery] = useState('');
  const [maxMonthlyBudgetUSD, setMaxMonthlyBudgetUSD] = useState<number>(3500);
  const [tentativeStartDate, setTentativeStartDate] = useState<string>(() => getTodayLocalIsoDate());
  const [daysPerStopPreference, setDaysPerStopPreference] = useState<number>(21); // Default 3 weeks per stop
  const [scoutingFocus, setScoutingFocus] = useState<ScoutingFocusPreference>(
    currentPersona === 'nomad' ? 'nomad-fiber' : 'coastal-lifestyle'
  );
  const [climatePreference, setClimatePreference] = useState<string>('Any');
  const [focusedMapCountryId, setFocusedMapCountryId] = useState<string | null>(null);
  const [showDiscoveryMapPreview, setShowDiscoveryMapPreview] = useState<boolean>(true);

  // User Personal Interests & Custom Hobbies State (Step 3)
  const [selectedInterests, setSelectedInterests] = useState<ScoutInterestId[]>(() => {
    try {
      const raw = localStorage.getItem(INTERESTS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return currentPersona === 'nomad'
      ? ['hiking', 'surfing', 'culture', 'nightlife', 'coworking']
      : ['culture', 'architecture', 'nature', 'healthcare', 'residency'];
  });

  const [customHobbies, setCustomHobbies] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(HOBBIES_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });
  const [customHobbyInput, setCustomHobbyInput] = useState<string>('');

  useEffect(() => {
    try {
      localStorage.setItem(INTERESTS_STORAGE_KEY, JSON.stringify(selectedInterests));
    } catch {}
  }, [selectedInterests]);

  useEffect(() => {
    try {
      localStorage.setItem(HOBBIES_STORAGE_KEY, JSON.stringify(customHobbies));
    } catch {}
  }, [customHobbies]);

  // Resolve monthly cost for a country from Refirely's empirical dataset
  const getCountryMonthlyRateUSD = (countryId: string, mode = burnBasisMode): number => {
    const found = countries.find(
      c => c.id.toLowerCase() === countryId.toLowerCase() || c.name.toLowerCase() === countryId.toLowerCase()
    );
    if (!found) return 2100;
    if (mode === 'nomad') {
      const nomadProf = getCountryNomadProfile(found);
      return nomadProf.monthlyNomadBurnUSD || found.costOfLiving.monthlyBudgetSingleUSD;
    }
    if (mode === 'retiree-couple') {
      return found.costOfLiving.monthlyBudgetCoupleUSD;
    }
    return found.costOfLiving.monthlyBudgetSingleUSD;
  };

  // Create an empty initial draft (NO pre-defined countries forced on the user)
  const createBlankDiscoveryDraft = (): ScoutTrip => {
    const nowIso = new Date().toISOString();
    return {
      id: `trip-custom-${Date.now()}`,
      userId: auth.currentUser?.uid || currentUserId || 'guest',
      title: 'My Custom Global Scouting Roadmap',
      stops: [],
      tasks: DEFAULT_RELOCATION_TASKS.map(t => ({ ...t })),
      accommodation: {
        propertyName: '',
        checkInDate: tentativeStartDate,
        checkOutDate: addDaysToIsoDate(tentativeStartDate, 20),
        hostContactOrDoorCode: '',
        bookingLink: '',
        cityOrNeighborhood: '',
      },
      packingList: DEFAULT_PACKING_ITEMS.map(p => ({ ...p })),
      totalDays: 0,
      schengenDays: 0,
      estimatedTotalBurnUSD: 0,
      createdAt: nowIso,
      updatedAt: nowIso,
    };
  };

  // Optional 1-click sample preset (Portugal 45d + Greece 30d) when user explicitly clicks the preset button
  const createMediterraneanPresetDraft = (): ScoutTrip => {
    const ptCountry = countries.find(c => c.id === 'portugal') || countries[0];
    const grCountry = countries.find(c => c.id === 'greece') || countries[1];
    const ptBurn = getCountryMonthlyRateUSD('portugal', burnBasisMode);
    const grBurn = getCountryMonthlyRateUSD('greece', burnBasisMode);

    const baseStart = clampToMinIsoDate(tentativeStartDate, todayIsoDate);
    const ptArrival = baseStart;
    const ptDeparture = addDaysToIsoDate(ptArrival, 44); // 45 days inclusive
    const grArrival = addDaysToIsoDate(ptDeparture, 1);
    const grDeparture = addDaysToIsoDate(grArrival, 29); // 30 days inclusive

    const stops: ScoutTripStop[] = [
      {
        id: 'stop-pt-45d',
        countryId: ptCountry?.id || 'portugal',
        countryName: ptCountry?.name || 'Portugal',
        countryFlag: ptCountry?.flag || '🇵🇹',
        cityFocus: 'Lisbon & Cascais',
        arrivalDate: ptArrival,
        departureDate: ptDeparture,
        visaStatusTag: '90-Day Tourist',
        isSchengen: true,
        monthlyBurnRateUSD: ptBurn,
        notes: 'Test D7/D8 neighborhoods, private CUF hospital, and coastal train links.',
      },
      {
        id: 'stop-gr-30d',
        countryId: grCountry?.id || 'greece',
        countryName: grCountry?.name || 'Greece',
        countryFlag: grCountry?.flag || '🇬🇷',
        cityFocus: 'Athens Riviera',
        arrivalDate: grArrival,
        departureDate: grDeparture,
        visaStatusTag: '90-Day Tourist',
        isSchengen: true,
        monthlyBurnRateUSD: grBurn,
        notes: 'Compare Crete island living costs, fiber speeds, and 7% pension tax regime.',
      },
    ];

    const totalDays = 75;
    const schengenDays = 75;
    const estimatedTotalBurnUSD = Math.round((45 / 30) * ptBurn + (30 / 30) * grBurn);
    const nowIso = new Date().toISOString();

    return {
      id: `trip-med-scout-75d`,
      userId: auth.currentUser?.uid || currentUserId || 'guest',
      title: '75-Day Mediterranean Scout (Portugal 45d + Greece 30d)',
      stops,
      tasks: DEFAULT_RELOCATION_TASKS.map(t => ({ ...t })),
      accommodation: {
        propertyName: 'Príncipe Real Serviced Loft (Lisbon) + Chania Harbor Studio',
        checkInDate: ptArrival,
        checkOutDate: grDeparture,
        hostContactOrDoorCode: '+351 912 345 678 · Keypad #4829*',
        bookingLink: 'https://www.airbnb.com/',
        cityOrNeighborhood: 'Lisbon & Chania',
      },
      packingList: DEFAULT_PACKING_ITEMS.map(p => ({ ...p })),
      totalDays,
      schengenDays,
      estimatedTotalBurnUSD,
      createdAt: nowIso,
      updatedAt: nowIso,
    };
  };

  // Load initial draft: only restore if the user explicitly generated/saved a custom v2 draft, and shift any stale past dates forward to todayIsoDate
  const [tripDraft, setTripDraft] = useState<ScoutTrip>(() => {
    try {
      const savedV2 = localStorage.getItem(DISCOVERY_STORAGE_KEY);
      if (savedV2) {
        const parsed = JSON.parse(savedV2) as ScoutTrip;
        if (parsed && Array.isArray(parsed.stops)) {
          let cursor = todayIsoDate;
          const sanitizedStops = parsed.stops.map((s, idx) => {
            const durationDays = Math.max(1, calculateStopDays(s.arrivalDate, s.departureDate) || 21);
            const arr =
              idx === 0
                ? clampToMinIsoDate(s.arrivalDate, todayIsoDate)
                : s.arrivalDate && s.arrivalDate >= cursor
                ? s.arrivalDate
                : cursor;
            const dep = s.departureDate >= arr ? s.departureDate : addDaysToIsoDate(arr, durationDays - 1);
            cursor = addDaysToIsoDate(dep, 1);
            return {
              ...s,
              arrivalDate: arr,
              departureDate: dep,
            };
          });
          const checkIn = clampToMinIsoDate(
            parsed.accommodation?.checkInDate || sanitizedStops[0]?.arrivalDate || todayIsoDate,
            todayIsoDate
          );
          const checkOutRaw = parsed.accommodation?.checkOutDate || sanitizedStops[sanitizedStops.length - 1]?.departureDate || addDaysToIsoDate(checkIn, 20);
          const checkOut = checkOutRaw >= checkIn ? checkOutRaw : addDaysToIsoDate(checkIn, 20);
          return {
            ...parsed,
            stops: sanitizedStops,
            accommodation: {
              ...parsed.accommodation,
              checkInDate: checkIn,
              checkOutDate: checkOut,
            },
          };
        }
      }
    } catch {}
    return createBlankDiscoveryDraft();
  });

  // Step-by-Step Guided Wizard State:
  // Step 1: Region & Dates -> Step 2: Countries & Map -> Step 3: Interests & Hobbies -> Step 4: Generated Itinerary & Workspace
  const [wizardStep, setWizardStep] = useState<WizardStepId>(() =>
    tripDraft.stops.length > 0 ? 'step-4-itinerary' : 'step-1-region'
  );

  // Sub-view inside Step 4 so the generated result is clean and clutter-free
  const [activeStageTab, setActiveStageTab] = useState<PlannerStageTab>('map-itinerary');

  // Weekly Itinerary State & Filter
  const [weeklyBlocks, setWeeklyBlocks] = useState<WeeklyItineraryBlock[]>([]);
  const [selectedItineraryStopFilter, setSelectedItineraryStopFilter] = useState<string>('all');
  const [newWeeklyActivityText, setNewWeeklyActivityText] = useState<Record<string, string>>({});

  // Unified Multi-Week Stop Card Filters & Scheduling Controls
  const [stopWeekFilter, setStopWeekFilter] = useState<Record<string, 'all' | number>>({});
  const [stopCategoryFilter, setStopCategoryFilter] = useState<Record<string, string>>({});
  const [pendingScheduleSlot, setPendingScheduleSlot] = useState<
    Record<string, { weekNumber: number; daySlot: string; timeOfDay: string }>
  >({});
  const [customVenueDraft, setCustomVenueDraft] = useState<
    Record<
      string,
      {
        title: string;
        neighborhood: string;
        categoryLabel: string;
        weekNumber: number;
        daySlot: string;
      }
    >
  >({});
  const [completeItineraryStopFilter, setCompleteItineraryStopFilter] = useState<string>('all');
  const [completeItineraryWeekFilter, setCompleteItineraryWeekFilter] = useState<'all' | number>('all');

  // Mobile 3-column switcher ('route' | 'tasks' | 'logistics' | 'all')
  const [mobileColumnTab, setMobileColumnTab] = useState<'route' | 'tasks' | 'logistics' | 'all'>('route');

  // Column 2 sub-tab ('relocation' | 'bucket-list')
  const [taskSubTab, setTaskSubTab] = useState<'relocation' | 'bucket-list'>('relocation');
  const [showAddTaskInput, setShowAddTaskInput] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskTag, setNewTaskTag] = useState('');

  // Column 3 packing sub-tab ('essentials' | 'documents')
  const [packingSubTab, setPackingSubTab] = useState<'essentials' | 'documents'>('essentials');
  const [showAddPackingInput, setShowAddPackingInput] = useState(false);
  const [newPackingTitle, setNewPackingTitle] = useState('');
  const [revealDoorCode, setRevealDoorCode] = useState(true);

  // Saved trips list for authenticated user & status feedback
  const [savedTrips, setSavedTrips] = useState<ScoutTrip[]>([]);
  const [isSavingTrip, setIsSavingTrip] = useState(false);
  const [saveBannerMessage, setSaveBannerMessage] = useState<string | null>(null);

  // Conversion / Auth Gate Modal state
  const [isConversionModalOpen, setIsConversionModalOpen] = useState(false);
  const [conversionAuthMode, setConversionAuthMode] = useState<'signup' | 'login'>('signup');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);

  // Curated Venue & Operator Catalog for all selected country stops (mixed weeks per stop)
  const venueCatalog = useMemo(() => {
    return buildDefaultScheduledItineraryForStops(
      tripDraft.stops,
      countries,
      selectedInterests,
      customHobbies
    );
  }, [tripDraft.stops, countries, selectedInterests, customHobbies]);

  // Ensure tripDraft.selectedItineraryItems is populated with concrete default venues when stops exist
  useEffect(() => {
    if (tripDraft.stops.length === 0) return;
    setTripDraft(prev => {
      const existing = prev.selectedItineraryItems || [];
      const validStopIds = new Set(prev.stops.map(s => s.id));
      const filteredExisting = existing.filter(item => validStopIds.has(item.stopId));
      // For any stop that doesn't yet have scheduled items, seed its curated recommendations
      const stopsWithItems = new Set(filteredExisting.map(item => item.stopId));
      const missingDefaults = venueCatalog.defaultSelectedItems.filter(
        item => !stopsWithItems.has(item.stopId)
      );
      if (missingDefaults.length === 0 && filteredExisting.length === existing.length) {
        return prev;
      }
      return {
        ...prev,
        selectedItineraryItems: [...filteredExisting, ...missingDefaults],
      };
    });
  }, [tripDraft.stops, venueCatalog.defaultSelectedItems]);

  // Check if user clicked "Edit Itinerary in Scout & Hop" from UserDashboard
  useEffect(() => {
    try {
      const editRaw = localStorage.getItem(ACTIVE_EDIT_TRIP_STORAGE_KEY);
      if (editRaw) {
        localStorage.removeItem(ACTIVE_EDIT_TRIP_STORAGE_KEY);
        const parsed = JSON.parse(editRaw) as {
          trip: ScoutTrip;
          initialTab?: PlannerStageTab;
        };
        if (parsed && parsed.trip && Array.isArray(parsed.trip.stops)) {
          setTripDraft(parsed.trip);
          if (Array.isArray(parsed.trip.selectedInterests) && parsed.trip.selectedInterests.length > 0) {
            setSelectedInterests(parsed.trip.selectedInterests as ScoutInterestId[]);
          }
          if (Array.isArray(parsed.trip.customHobbies)) {
            setCustomHobbies(parsed.trip.customHobbies);
          }
          setWizardStep('step-4-itinerary');
          setActiveStageTab(parsed.initialTab || 'complete-itinerary');
          setSaveBannerMessage(
            `Loaded "${parsed.trip.title}" for editing! Add, remove, or reschedule any venue by Week & Day.`
          );
          setTimeout(() => setSaveBannerMessage(null), 6000);
        }
      }
    } catch {}
  }, []);

  // Regenerate weekly itinerary whenever stops, scoutingFocus, selectedInterests, or customHobbies change
  useEffect(() => {
    if (tripDraft.stops.length === 0) {
      setWeeklyBlocks([]);
      return;
    }
    const generated = generateWeeklyItineraryForStops(
      tripDraft.stops,
      countries,
      scoutingFocus,
      selectedInterests,
      customHobbies
    );
    setWeeklyBlocks(prev => {
      // Preserve completed status of matching activity IDs
      const completedSet = new Set<string>();
      prev.forEach(b =>
        b.activities.forEach(a => {
          if (a.completed) completedSet.add(a.id);
        })
      );
      return generated.map(b => ({
        ...b,
        activities: b.activities.map(a => ({
          ...a,
          completed: completedSet.has(a.id),
        })),
      }));
    });
  }, [tripDraft.stops, countries, scoutingFocus, selectedInterests, customHobbies]);

  // Toggle an interest pill/card
  const handleToggleInterest = (interestId: ScoutInterestId) => {
    setSelectedInterests(prev => {
      if (prev.includes(interestId)) {
        if (prev.length === 1) return prev; // Keep at least 1 interest active
        return prev.filter(id => id !== interestId);
      }
      return [...prev, interestId];
    });
  };

  // Add a custom user hobby (e.g. "Padel Tennis", "Scuba Diving", "Salsa Dancing")
  const handleAddCustomHobby = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleaned = customHobbyInput.trim();
    if (!cleaned) return;
    if (!customHobbies.some(h => h.toLowerCase() === cleaned.toLowerCase())) {
      setCustomHobbies(prev => [...prev, cleaned]);
    }
    setCustomHobbyInput('');
  };

  const handleRemoveCustomHobby = (hobby: string) => {
    setCustomHobbies(prev => prev.filter(h => h !== hobby));
  };

  // Live computed metrics for the current itinerary
  const computedMetrics = useMemo(() => {
    let totalDays = 0;
    let schengenDays = 0;
    let estimatedTotalBurnUSD = 0;

    const enrichedStops = tripDraft.stops.map(stop => {
      const days = calculateStopDays(stop.arrivalDate, stop.departureDate);
      const isSchengen = isCountrySchengen(stop.countryId, stop.countryName);
      const monthlyRate = getCountryMonthlyRateUSD(stop.countryId, burnBasisMode);
      const stopBurnUSD = Math.round((days / 30) * monthlyRate);

      totalDays += days;
      if (isSchengen) {
        schengenDays += days;
      }
      estimatedTotalBurnUSD += stopBurnUSD;

      return {
        ...stop,
        days,
        isSchengen,
        monthlyBurnRateUSD: monthlyRate,
        stopBurnUSD,
      };
    });

    const avgMonthlyBurnUSD =
      totalDays > 0 ? Math.round((estimatedTotalBurnUSD / totalDays) * 30) : 0;

    const schengenStatus: 'safe' | 'warning' | 'overlimit' =
      schengenDays < 75 ? 'safe' : schengenDays <= 89 ? 'warning' : 'overlimit';

    return {
      enrichedStops,
      totalDays,
      schengenDays,
      estimatedTotalBurnUSD,
      avgMonthlyBurnUSD,
      schengenStatus,
    };
  }, [tripDraft.stops, burnBasisMode, countries]);

  // Persist changes to `localStorage` under both `refirely_scout_draft` and `refirely_scout_discovery_v2`
  useEffect(() => {
    try {
      const syncedDraft: ScoutTrip = {
        ...tripDraft,
        totalDays: computedMetrics.totalDays,
        schengenDays: computedMetrics.schengenDays,
        estimatedTotalBurnUSD: computedMetrics.estimatedTotalBurnUSD,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(syncedDraft));
      localStorage.setItem(DISCOVERY_STORAGE_KEY, JSON.stringify(syncedDraft));
    } catch {}
  }, [
    tripDraft,
    computedMetrics.totalDays,
    computedMetrics.schengenDays,
    computedMetrics.estimatedTotalBurnUSD,
  ]);

  // Load saved trips from localStorage & Firestore when user is authenticated
  useEffect(() => {
    const loadUserSavedTrips = async () => {
      if (!isAuthenticated || currentUserId === 'guest') {
        setSavedTrips([]);
        return;
      }

      let localList: ScoutTrip[] = [];
      try {
        const raw = localStorage.getItem(`refirely_saved_trips_${currentUserId}`);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            localList = parsed;
            setSavedTrips(parsed);
          }
        }
      } catch {}

      if (auth.currentUser) {
        const uid = auth.currentUser.uid;
        try {
          const snap = await getDocs(collection(db, 'users', uid, 'trips'));
          const cloudList: ScoutTrip[] = [];
          snap.forEach(docSnap => {
            cloudList.push(docSnap.data() as ScoutTrip);
          });
          if (cloudList.length > 0) {
            const mergedMap = new Map<string, ScoutTrip>();
            localList.forEach(t => mergedMap.set(t.id, t));
            cloudList.forEach(t => mergedMap.set(t.id, t));
            const merged = Array.from(mergedMap.values()).sort((a, b) =>
              (b.updatedAt || '').localeCompare(a.updatedAt || '')
            );
            setSavedTrips(merged);
            try {
              localStorage.setItem(`refirely_saved_trips_${currentUserId}`, JSON.stringify(merged));
            } catch {}
          }
        } catch (err) {
          console.warn('Notice reading trips from Firestore:', err);
        }
      }
    };

    loadUserSavedTrips();
  }, [isAuthenticated, currentUserId, firebaseUser]);

  // Enriched Country Discovery List with Nomad Score, Fiber Speed, and Continent Grouping
  const enrichedDiscoveryCountries = useMemo(() => {
    return countries
      .map(c => {
        const nomadProfile = getCountryNomadProfile(c);
        const continentGroup = mapRegionToContinentGroup(c.region);
        const monthlyRate = getCountryMonthlyRateUSD(c.id, burnBasisMode);
        const hubs = COUNTRY_HUB_COORDINATES[c.id.toLowerCase()] || [];

        // Calculate composite Digital Nomad Score (0 - 100)
        const speedScore = Math.min(100, Math.round((nomadProfile.verifiedInternetMbps / 220) * 100));
        const costScore = Math.max(40, Math.min(100, Math.round(((3800 - monthlyRate) / 2800) * 100)));
        const coworkScore =
          nomadProfile.coworkingDensity === 'World-Class Nomad Hub'
            ? 98
            : nomadProfile.coworkingDensity === 'Abundant & Vibrant'
            ? 88
            : 75;
        const nomadOverallScore = Math.round(
          speedScore * 0.35 + coworkScore * 0.35 + costScore * 0.15 + c.lifestyle.safetyScore * 0.15
        );

        return {
          country: c,
          nomadProfile,
          continentGroup,
          monthlyRate,
          nomadOverallScore,
          hubs,
          isSchengen: isCountrySchengen(c.id, c.name),
        };
      })
      .filter(item => {
        if (selectedContinent !== 'all' && item.continentGroup !== selectedContinent) {
          return false;
        }
        if (item.monthlyRate > maxMonthlyBudgetUSD) {
          return false;
        }
        if (
          climatePreference !== 'Any' &&
          item.country.climate.category.toLowerCase() !== climatePreference.toLowerCase()
        ) {
          return false;
        }
        if (countrySearchQuery.trim()) {
          const q = countrySearchQuery.trim().toLowerCase();
          const matchName = item.country.name.toLowerCase().includes(q);
          const matchRegion = item.country.region.toLowerCase().includes(q);
          const matchCity =
            item.country.topCities?.some(tc => tc.name.toLowerCase().includes(q)) ||
            item.nomadProfile.topNomadCities?.some(nc => nc.toLowerCase().includes(q));
          const matchVisa =
            item.nomadProfile.remoteWorkVisaName.toLowerCase().includes(q) ||
            item.country.visa.retirementVisaName.toLowerCase().includes(q);
          if (!matchName && !matchRegion && !matchCity && !matchVisa) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (browseMode === 'nomad-top' || scoutingFocus === 'nomad-fiber') {
          return b.nomadOverallScore - a.nomadOverallScore;
        }
        if (scoutingFocus === 'healthcare-retirement') {
          return b.country.lifestyle.healthcareScore - a.country.lifestyle.healthcareScore;
        }
        if (scoutingFocus === 'coastal-lifestyle') {
          return b.country.climate.annualSunnyDays - a.country.climate.annualSunnyDays;
        }
        return a.monthlyRate - b.monthlyRate;
      });
  }, [
    countries,
    burnBasisMode,
    selectedContinent,
    maxMonthlyBudgetUSD,
    climatePreference,
    countrySearchQuery,
    browseMode,
    scoutingFocus,
  ]);

  // Candidate pins formatted for interactive selection on the Google Map preview
  const candidateMapCountries: CandidateMapCountry[] = useMemo(() => {
    return enrichedDiscoveryCountries.map(item => {
      const availableCities =
        item.hubs.length > 0
          ? item.hubs.map(h => h.cityName)
          : item.country.topCities?.slice(0, 3).map(tc => tc.name) || [item.country.capital];

      const coord = getHubCoordinatesForCountry(
        item.country.id,
        item.country.name,
        availableCities[0],
        item.country.region
      );

      return {
        countryId: item.country.id,
        countryName: item.country.name,
        countryFlag: item.country.flag,
        region: item.country.region,
        monthlyRateUSD: item.monthlyRate,
        nomadScore: item.nomadOverallScore,
        fiberMbps: item.nomadProfile.verifiedInternetMbps,
        visaName: item.nomadProfile.remoteWorkVisaName,
        isSchengen: item.isSchengen,
        sunnyDays: item.country.climate.annualSunnyDays,
        coord,
        availableCities,
      };
    });
  }, [enrichedDiscoveryCountries]);

  // Continent cards summary
  const continentStats = useMemo(() => {
    const groups: {
      id: ContinentFilter;
      label: string;
      emoji: string;
      tagline: string;
      gradient: string;
    }[] = [
      {
        id: 'all',
        label: 'All Global Havens',
        emoji: '🌐',
        tagline: 'Explore every retirement & digital nomad haven worldwide',
        gradient: 'from-indigo-500 to-teal-500',
      },
      {
        id: 'Europe',
        label: 'Europe & Mediterranean',
        emoji: '🇪🇺',
        tagline: 'Portugal, Spain, Greece, Italy, Albania & Adriatic hubs',
        gradient: 'from-blue-600 to-indigo-600',
      },
      {
        id: 'Asia',
        label: 'Southeast & East Asia',
        emoji: '🌏',
        tagline: 'Thailand, Malaysia, Bali, Vietnam & tropical islands',
        gradient: 'from-teal-600 to-emerald-600',
      },
      {
        id: 'Americas',
        label: 'Latin America & Caribbean',
        emoji: '🌎',
        tagline: 'Costa Rica, Mexico, Panama, Colombia & South America',
        gradient: 'from-amber-500 to-orange-600',
      },
      {
        id: 'Middle East & Africa',
        label: 'Middle East, Africa & Islands',
        emoji: '🏝️',
        tagline: 'Dubai (UAE), Mauritius, Morocco & tax-free hubs',
        gradient: 'from-violet-600 to-fuchsia-600',
      },
    ];

    return groups.map(g => {
      const matching = countries.filter(c =>
        g.id === 'all' ? true : mapRegionToContinentGroup(c.region) === g.id
      );
      const avgBurn =
        matching.length > 0
          ? Math.round(
              matching.reduce((s, c) => s + getCountryMonthlyRateUSD(c.id, burnBasisMode), 0) /
                matching.length
            )
          : 1900;
      return {
        ...g,
        count: matching.length,
        avgBurn,
      };
    });
  }, [countries, burnBasisMode]);

  // Toggle or Add a Country / City Stop from the Discovery Grid
  const handleAddCountryFromDiscovery = (countryId: string, preferredCity?: string) => {
    if (tripDraft.stops.length >= 5) {
      setSaveBannerMessage('Maximum of 5 stops reached. Remove a stop to add another haven.');
      setTimeout(() => setSaveBannerMessage(null), 4000);
      return;
    }

    const countryObj = countries.find(c => c.id.toLowerCase() === countryId.toLowerCase());
    if (!countryObj) return;

    const lastStop = tripDraft.stops[tripDraft.stops.length - 1];
    const arrival = lastStop ? addDaysToIsoDate(lastStop.departureDate, 1) : tentativeStartDate;
    const departure = addDaysToIsoDate(arrival, Math.max(6, daysPerStopPreference - 1));
    const isSchengen = isCountrySchengen(countryObj.id, countryObj.name);

    const hubs = COUNTRY_HUB_COORDINATES[countryObj.id.toLowerCase()] || [];
    const existingSameCountryCount = tripDraft.stops.filter(
      s => s.countryId.toLowerCase() === countryObj.id.toLowerCase()
    ).length;

    const resolvedCity =
      preferredCity ||
      hubs[existingSameCountryCount]?.cityName ||
      countryObj.topCities?.[existingSameCountryCount]?.name ||
      countryObj.topCities?.[0]?.name ||
      countryObj.capital;

    const defaultVisaTag: ScoutVisaStatusTag =
      scoutingFocus === 'nomad-fiber' || browseMode === 'nomad-top'
        ? 'Digital Nomad Visa'
        : isSchengen
        ? '90-Day Tourist'
        : 'Visa-Free';

    const newStop: ScoutTripStop = {
      id: `stop-${countryObj.id}-${Date.now().toString().slice(-5)}-${Math.random().toString(36).slice(2, 5)}`,
      countryId: countryObj.id,
      countryName: countryObj.name,
      countryFlag: countryObj.flag,
      cityFocus: resolvedCity,
      arrivalDate: arrival,
      departureDate: departure,
      visaStatusTag: defaultVisaTag,
      isSchengen,
      monthlyBurnRateUSD: getCountryMonthlyRateUSD(countryObj.id, burnBasisMode),
    };

    setTripDraft(prev => {
      const nextStops = [...prev.stops, newStop];
      const names = Array.from(new Set(nextStops.map(s => s.countryName)));
      const autoTitle =
        names.length === 1
          ? `${names[0]} Deep Scouting Roadmap`
          : `${names.join(' → ')} Scouting Route`;

      return {
        ...prev,
        title:
          prev.title === 'My Custom Global Scouting Roadmap' ||
          prev.title.includes('→') ||
          prev.title.includes('Deep Scouting')
            ? autoTitle
            : prev.title,
        stops: nextStops,
        accommodation: {
          ...prev.accommodation,
          checkInDate: nextStops[0]?.arrivalDate || tentativeStartDate,
          checkOutDate: nextStops[nextStops.length - 1]?.departureDate || departure,
        },
      };
    });
  };

  // Recalculate all stop dates sequentially when user changes Tentative Start Date or Days/Stop
  const handleRecalculateDatesFromPreferences = (newStart: string, newDaysPerStop: number) => {
    const safeStart = clampToMinIsoDate(newStart, todayIsoDate);
    setTentativeStartDate(safeStart);
    setDaysPerStopPreference(newDaysPerStop);

    if (tripDraft.stops.length === 0) return;

    setTripDraft(prev => {
      let cursor = safeStart;
      const updatedStops = prev.stops.map(s => {
        const arr = cursor;
        const dep = addDaysToIsoDate(arr, Math.max(6, newDaysPerStop - 1));
        cursor = addDaysToIsoDate(dep, 1);
        return {
          ...s,
          arrivalDate: arr,
          departureDate: dep,
        };
      });
      return {
        ...prev,
        stops: updatedStops,
        accommodation: {
          ...prev.accommodation,
          checkInDate: updatedStops[0]?.arrivalDate || safeStart,
          checkOutDate: updatedStops[updatedStops.length - 1]?.departureDate || cursor,
        },
      };
    });
  };

  // Auto-Suggest Top 3 Countries based on active filters & preferences
  const handleAutoSuggestRoute = (advanceToInterests = false) => {
    const topMatches = enrichedDiscoveryCountries.slice(0, 3);
    if (topMatches.length === 0) return;

    let cursor = tentativeStartDate;
    const autoStops: ScoutTripStop[] = topMatches.map((item, idx) => {
      const arr = cursor;
      const dep = addDaysToIsoDate(arr, Math.max(6, daysPerStopPreference - 1));
      cursor = addDaysToIsoDate(dep, 1);
      const city =
        item.hubs[0]?.cityName ||
        item.country.topCities?.[0]?.name ||
        item.country.capital;

      return {
        id: `stop-${item.country.id}-${idx}-${Date.now().toString().slice(-4)}`,
        countryId: item.country.id,
        countryName: item.country.name,
        countryFlag: item.country.flag,
        cityFocus: city,
        arrivalDate: arr,
        departureDate: dep,
        visaStatusTag:
          scoutingFocus === 'nomad-fiber' || browseMode === 'nomad-top'
            ? 'Digital Nomad Visa'
            : item.isSchengen
            ? '90-Day Tourist'
            : 'Visa-Free',
        isSchengen: item.isSchengen,
        monthlyBurnRateUSD: item.monthlyRate,
      };
    });

    const routeNames = autoStops.map(s => s.countryName).join(' → ');
    setTripDraft(prev => ({
      ...prev,
      title: `${routeNames} Scouting Route`,
      stops: autoStops,
      accommodation: {
        ...prev.accommodation,
        propertyName: `${autoStops[0]?.cityFocus} Furnished Scouting Basecamp`,
        checkInDate: autoStops[0]?.arrivalDate || tentativeStartDate,
        checkOutDate: autoStops[autoStops.length - 1]?.departureDate || cursor,
        cityOrNeighborhood: autoStops.map(s => s.cityFocus).join(' · '),
      },
    }));

    if (advanceToInterests) {
      setWizardStep('step-3-interests');
    } else {
      setWizardStep('step-2-countries');
    }
    setSaveBannerMessage(
      `Selected top 3 matches: ${routeNames}! Now review them on the map or pick your interests to generate your custom weekly itinerary.`
    );
    setTimeout(() => setSaveBannerMessage(null), 5000);
  };

  // CTA handler for Step 3 -> Step 4 ("Generate My Custom Itinerary & Show Me")
  const handleGenerateCustomItinerary = () => {
    if (tripDraft.stops.length === 0) {
      handleAutoSuggestRoute(false);
    }
    // Sync default recommended venues for active interests while keeping any user-customized items
    setTripDraft(prev => {
      const freshCatalog = buildDefaultScheduledItineraryForStops(
        prev.stops,
        countries,
        selectedInterests,
        customHobbies
      );
      const customItems = (prev.selectedItineraryItems || []).filter(item =>
        (item.recommendationId || '').startsWith('custom-')
      );
      return {
        ...prev,
        selectedItineraryItems: [...freshCatalog.defaultSelectedItems, ...customItems].slice(0, 150),
        selectedInterests: selectedInterests.slice(0, 30),
        customHobbies: customHobbies.slice(0, 30),
      };
    });
    setWizardStep('step-4-itinerary');
    setActiveStageTab('map-itinerary');
    setSaveBannerMessage(
      `✨ Generated your unified multi-week itinerary with curated bars, dating spots, trails & operators tailored to ${selectedInterests.length} interests${
        customHobbies.length > 0 ? ` + ${customHobbies.join(', ')}` : ''
      }!`
    );
    setTimeout(() => setSaveBannerMessage(null), 6000);
  };

  // Add a curated venue/operator recommendation to a specific Week & Day in the user's itinerary
  const handleAddRecommendationToSchedule = (
    rec: StopCuratedRecommendationCard,
    weekNumber: number,
    daySlot: string,
    timeOfDay?: 'Morning' | 'Afternoon' | 'Evening' | 'Night' | 'Full Day'
  ) => {
    const newItem: ScoutScheduledItineraryItem = {
      id: `sched-${rec.stopId}-${rec.recommendationId || rec.id}-${Date.now().toString().slice(-4)}`,
      recommendationId: rec.recommendationId || rec.id,
      stopId: rec.stopId,
      countryId: rec.countryId,
      countryName: rec.countryName,
      countryFlag: rec.countryFlag,
      cityName: rec.cityName,
      weekNumber,
      daySlot,
      timeOfDay: timeOfDay || rec.timeOfDay || 'Evening',
      title: rec.title,
      categoryLabel: rec.categoryLabel,
      interestId: rec.interestId,
      neighborhood: rec.neighborhood,
      description: rec.description,
      insiderTip: rec.insiderTip,
      rating: rec.rating,
      reviewCount: rec.reviewCount,
      priceRange: rec.priceRange,
      photoUrl: rec.photoUrl,
      fallbackGradient: rec.fallbackGradient,
      googleMapsUrl: rec.googleMapsUrl,
      completed: false,
    };

    setTripDraft(prev => {
      const existing = (prev.selectedItineraryItems || []).filter(
        item => !(item.stopId === rec.stopId && item.recommendationId === (rec.recommendationId || rec.id))
      );
      return {
        ...prev,
        selectedItineraryItems: [...existing, newItem].slice(0, 150),
      };
    });

    setSaveBannerMessage(
      `Added "${rec.title}" to Week ${weekNumber} · ${daySlot} in your chosen itinerary!`
    );
    setTimeout(() => setSaveBannerMessage(null), 4000);
  };

  // Remove a scheduled item from the itinerary (by item ID or by stopId + recommendationId)
  const handleRemoveScheduledItem = (itemId: string) => {
    setTripDraft(prev => ({
      ...prev,
      selectedItineraryItems: (prev.selectedItineraryItems || []).filter(item => item.id !== itemId),
    }));
  };

  // Update Week, Day, Time, or completion status of a scheduled item in the itinerary
  const handleUpdateScheduledItem = (
    itemId: string,
    updates: Partial<ScoutScheduledItineraryItem>
  ) => {
    setTripDraft(prev => ({
      ...prev,
      selectedItineraryItems: (prev.selectedItineraryItems || []).map(item =>
        item.id === itemId ? { ...item, ...updates } : item
      ),
    }));
  };

  // Add a custom user-defined place/bar/activity with live Google Maps link to a specific Week & Day
  const handleAddCustomVenueToStop = (stop: ScoutTripStop, defaultStartWeek: number) => {
    const draft = customVenueDraft[stop.id];
    const cleanTitle = (draft?.title || '').trim();
    if (!cleanTitle) return;

    const city = stop.cityFocus || stop.countryName;
    const cleanNeighborhood = (draft?.neighborhood || city).trim();
    const categoryLabel = draft?.categoryLabel || 'Custom Spot & Experience';
    const weekNumber = draft?.weekNumber || defaultStartWeek;
    const daySlot = draft?.daySlot || 'Day 5 (Fri)';
    const recId = `custom-${Date.now()}`;

    const customItem: ScoutScheduledItineraryItem = {
      id: `sched-${stop.id}-${recId}`,
      recommendationId: recId,
      stopId: stop.id,
      countryId: stop.countryId,
      countryName: stop.countryName,
      countryFlag: stop.countryFlag,
      cityName: city,
      weekNumber,
      daySlot,
      timeOfDay: 'Evening',
      title: cleanTitle,
      categoryLabel,
      interestId: 'culture',
      neighborhood: cleanNeighborhood,
      description: `Custom scheduled stop in ${cleanNeighborhood}, ${city}.`,
      insiderTip: `Added by you for Week ${weekNumber} (${daySlot}). Click the Google Maps link to verify directions & opening hours.`,
      rating: 4.8,
      reviewCount: 150,
      priceRange: '$$',
      photoUrl:
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80',
      fallbackGradient: 'from-indigo-700 via-teal-700 to-slate-900',
      googleMapsUrl: buildGoogleMapsSearchUrl(
        `${cleanTitle} ${cleanNeighborhood} ${city} ${stop.countryName}`
      ),
      completed: false,
    };

    setTripDraft(prev => ({
      ...prev,
      selectedItineraryItems: [...(prev.selectedItineraryItems || []), customItem].slice(0, 150),
    }));

    setCustomVenueDraft(prev => ({
      ...prev,
      [stop.id]: {
        title: '',
        neighborhood: '',
        categoryLabel: '🍸 Nightlife & Rooftop Bar',
        weekNumber: defaultStartWeek,
        daySlot: 'Day 5 (Fri)',
      },
    }));

    setSaveBannerMessage(`Added "${cleanTitle}" to Week ${weekNumber} · ${daySlot}!`);
    setTimeout(() => setSaveBannerMessage(null), 4000);
  };

  // Core helper: Save the current draft to Firestore `users/{userId}/trips/{tripId}`
  const persistDraftToUserTrips = async (overrideUid?: string, overrideAppUserId?: string) => {
    setIsSavingTrip(true);
    const activeFirebaseUid = overrideUid || auth.currentUser?.uid;
    const activeAppUserId =
      overrideAppUserId || (currentUserId !== 'guest' ? currentUserId : activeFirebaseUid || 'member');
    const safeTripId = (tripDraft.id || `trip-${Date.now()}`)
      .replace(/[^a-zA-Z0-9_\-]/g, '-')
      .slice(0, 100);
    const nowIso = new Date().toISOString().slice(0, 40);

    const payloadToSave: ScoutTrip = {
      ...tripDraft,
      id: safeTripId,
      userId: activeFirebaseUid || activeAppUserId,
      title: (tripDraft.title || 'My Scouting Roadmap').trim().slice(0, 200),
      stops: computedMetrics.enrichedStops.slice(0, 5).map(s => ({
        id: s.id,
        countryId: s.countryId,
        countryName: s.countryName,
        countryFlag: s.countryFlag,
        cityFocus: s.cityFocus || '',
        arrivalDate: s.arrivalDate,
        departureDate: s.departureDate,
        visaStatusTag: s.visaStatusTag,
        isSchengen: s.isSchengen,
        monthlyBurnRateUSD: s.monthlyBurnRateUSD,
        notes: s.notes || '',
      })),
      tasks: tripDraft.tasks.slice(0, 100),
      accommodation: tripDraft.accommodation,
      packingList: tripDraft.packingList.slice(0, 100),
      selectedItineraryItems: (tripDraft.selectedItineraryItems || []).slice(0, 150),
      selectedInterests: selectedInterests.slice(0, 30),
      customHobbies: customHobbies.slice(0, 30),
      totalDays: computedMetrics.totalDays,
      schengenDays: computedMetrics.schengenDays,
      estimatedTotalBurnUSD: computedMetrics.estimatedTotalBurnUSD,
      createdAt: (tripDraft.createdAt || nowIso).slice(0, 40),
      updatedAt: nowIso,
    };

    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(payloadToSave));
      localStorage.setItem(DISCOVERY_STORAGE_KEY, JSON.stringify(payloadToSave));
      const existingRaw = localStorage.getItem(`refirely_saved_trips_${activeAppUserId}`);
      const existingList: ScoutTrip[] = existingRaw ? JSON.parse(existingRaw) : [];
      const updatedList = [
        payloadToSave,
        ...existingList.filter(t => t.id !== payloadToSave.id),
      ];
      localStorage.setItem(`refirely_saved_trips_${activeAppUserId}`, JSON.stringify(updatedList));
      localStorage.setItem('refirely_saved_trips_latest', JSON.stringify(updatedList));
      setSavedTrips(updatedList);
    } catch {}

    if (activeFirebaseUid) {
      const firestorePath = `users/${activeFirebaseUid}/trips/${safeTripId}`;
      try {
        await setDoc(doc(db, 'users', activeFirebaseUid, 'trips', safeTripId), payloadToSave);
      } catch (err) {
        setIsSavingTrip(false);
        handleFirestoreError(err, OperationType.WRITE, firestorePath);
        return;
      }
    }

    setIsSavingTrip(false);
    setSaveBannerMessage(
      `Saved "${payloadToSave.title}" (${(payloadToSave.selectedItineraryItems || []).length} chosen places · ${payloadToSave.totalDays} days) to your Dashboard!`
    );
    setTimeout(() => {
      setSaveBannerMessage(null);
    }, 7000);
  };

  const handleSaveTripClick = async () => {
    if (tripDraft.stops.length === 0) {
      setSaveBannerMessage('Please select at least 1 country stop before saving your scouting trip.');
      setTimeout(() => setSaveBannerMessage(null), 4500);
      return;
    }
    if (!isAuthenticated || currentUserId === 'guest') {
      setAuthError(null);
      setIsConversionModalOpen(true);
      return;
    }
    await persistDraftToUserTrips();
  };

  const handleModalGoogleAuth = async () => {
    setAuthError(null);
    setIsSubmittingAuth(true);
    try {
      const res = await loginWithGoogle();
      if (res.success) {
        setIsConversionModalOpen(false);
        await persistDraftToUserTrips(auth.currentUser?.uid, auth.currentUser?.uid);
      } else {
        setAuthError(res.error || 'Google sign-in was cancelled or failed.');
      }
    } catch (err: any) {
      setAuthError(err?.message || 'Could not complete Google Sign-In.');
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  const handleModalEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const cleanEmail = authEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setAuthError('Please enter a valid email address.');
      return;
    }
    if (!authPassword || authPassword.length < 6) {
      setAuthError('Please enter a password of at least 6 characters.');
      return;
    }

    setIsSubmittingAuth(true);
    try {
      if (conversionAuthMode === 'signup') {
        const displayName =
          authName.trim() ||
          cleanEmail
            .split('@')[0]
            .replace(/[._\-]+/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());

        const primaryStopCountry = tripDraft.stops[0]?.countryName || 'Portugal';
        const signupRes = signup({
          name: displayName,
          email: cleanEmail,
          password: authPassword,
          targetCountry: primaryStopCountry,
          relocationStatus: 'Scouting In-Person',
        });

        if (!signupRes.success && signupRes.error) {
          const loginFallback = login(cleanEmail, authPassword);
          if (!loginFallback.success) {
            setAuthError(signupRes.error);
            setIsSubmittingAuth(false);
            return;
          }
        }

        let fbUid = auth.currentUser?.uid;
        try {
          const cred = await createUserWithEmailAndPassword(auth, cleanEmail, authPassword);
          fbUid = cred.user.uid;
        } catch {
          try {
            const signInCred = await signInWithEmailAndPassword(auth, cleanEmail, authPassword);
            fbUid = signInCred.user.uid;
          } catch {}
        }

        setIsConversionModalOpen(false);
        await persistDraftToUserTrips(fbUid, signupRes.createdUserId || cleanEmail);
      } else {
        const loginRes = login(cleanEmail, authPassword);
        let fbUid = auth.currentUser?.uid;
        try {
          const cred = await signInWithEmailAndPassword(auth, cleanEmail, authPassword);
          fbUid = cred.user.uid;
        } catch {}

        if (!loginRes.success && !fbUid) {
          setAuthError(loginRes.error || 'Invalid email or password. Try creating a free account.');
          setIsSubmittingAuth(false);
          return;
        }

        setIsConversionModalOpen(false);
        await persistDraftToUserTrips(fbUid, cleanEmail);
      }
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  const handleLoadSamplePreset = () => {
    const preset = createMediterraneanPresetDraft();
    setTripDraft(preset);
    setWizardStep('step-4-itinerary');
    setActiveStageTab('map-itinerary');
    setSaveBannerMessage('Loaded Sample 75-Day Mediterranean Scout (Portugal 45d + Greece 30d)!');
    setTimeout(() => setSaveBannerMessage(null), 5000);
  };

  const handleClearRouteAndStartFresh = () => {
    const blank = createBlankDiscoveryDraft();
    setTripDraft(blank);
    setWizardStep('step-1-region');
  };

  const handleAddStop = (prefillCountryId?: string, prefillVisaTag?: ScoutVisaStatusTag) => {
    if (tripDraft.stops.length >= 5) return;
    const lastStop = tripDraft.stops[tripDraft.stops.length - 1];
    const nextArrival = lastStop ? addDaysToIsoDate(lastStop.departureDate, 1) : tentativeStartDate;
    const nextDeparture = addDaysToIsoDate(nextArrival, Math.max(6, daysPerStopPreference - 1));

    const defaultCountryCandidates = ['portugal', 'spain', 'thailand', 'greece', 'costa-rica', 'albania'];
    const usedIds = new Set(tripDraft.stops.map(s => s.countryId));
    const chosenId =
      prefillCountryId ||
      defaultCountryCandidates.find(id => !usedIds.has(id)) ||
      countries[0]?.id ||
      'portugal';

    const countryObj =
      countries.find(c => c.id.toLowerCase() === chosenId.toLowerCase()) || countries[0];
    const isSchengen = isCountrySchengen(countryObj.id, countryObj.name);
    const visaTag: ScoutVisaStatusTag =
      prefillVisaTag || (isSchengen ? '90-Day Tourist' : 'Visa-Free');

    const hubs = COUNTRY_HUB_COORDINATES[countryObj.id.toLowerCase()] || [];

    const newStop: ScoutTripStop = {
      id: `stop-${Date.now()}`,
      countryId: countryObj.id,
      countryName: countryObj.name,
      countryFlag: countryObj.flag,
      cityFocus: hubs[0]?.cityName || countryObj.topCities?.[0]?.name || countryObj.capital,
      arrivalDate: nextArrival,
      departureDate: nextDeparture,
      visaStatusTag: visaTag,
      isSchengen,
      monthlyBurnRateUSD: getCountryMonthlyRateUSD(countryObj.id, burnBasisMode),
    };

    setTripDraft(prev => ({
      ...prev,
      stops: [...prev.stops, newStop],
    }));
  };

  const handleUpdateStop = (stopId: string, updates: Partial<ScoutTripStop>) => {
    setTripDraft(prev => ({
      ...prev,
      stops: prev.stops.map(stop => {
        if (stop.id !== stopId) return stop;

        const sanitizedUpdates = { ...updates };
        if (sanitizedUpdates.arrivalDate !== undefined) {
          sanitizedUpdates.arrivalDate = clampToMinIsoDate(sanitizedUpdates.arrivalDate, todayIsoDate);
        }
        const effectiveArrival = sanitizedUpdates.arrivalDate ?? stop.arrivalDate;
        if (sanitizedUpdates.departureDate !== undefined) {
          const minDep = effectiveArrival && effectiveArrival >= todayIsoDate ? effectiveArrival : todayIsoDate;
          sanitizedUpdates.departureDate = clampToMinIsoDate(sanitizedUpdates.departureDate, minDep);
        } else if (stop.departureDate < effectiveArrival) {
          sanitizedUpdates.departureDate = effectiveArrival;
        }

        if (sanitizedUpdates.countryId && sanitizedUpdates.countryId !== stop.countryId) {
          const matched = countries.find(c => c.id === sanitizedUpdates.countryId);
          if (matched) {
            const schengen = isCountrySchengen(matched.id, matched.name);
            const hubs = COUNTRY_HUB_COORDINATES[matched.id.toLowerCase()] || [];
            return {
              ...stop,
              ...sanitizedUpdates,
              countryId: matched.id,
              countryName: matched.name,
              countryFlag: matched.flag,
              cityFocus: hubs[0]?.cityName || matched.topCities?.[0]?.name || matched.capital,
              isSchengen: schengen,
              monthlyBurnRateUSD: getCountryMonthlyRateUSD(matched.id, burnBasisMode),
            };
          }
        }
        return { ...stop, ...sanitizedUpdates };
      }),
    }));
  };

  const handleRemoveStop = (stopId: string) => {
    setTripDraft(prev => {
      const nextStops = prev.stops.filter(s => s.id !== stopId);
      if (nextStops.length === 0 && wizardStep === 'step-4-itinerary') {
        setWizardStep('step-2-countries');
      }
      return {
        ...prev,
        stops: nextStops,
      };
    });
  };

  // Weekly Itinerary Activity Handlers
  const handleToggleWeeklyActivity = (blockId: string, activityId: string) => {
    setWeeklyBlocks(prev =>
      prev.map(b =>
        b.id !== blockId
          ? b
          : {
              ...b,
              activities: b.activities.map(a =>
                a.id === activityId ? { ...a, completed: !a.completed } : a
              ),
            }
      )
    );
  };

  const handlePushWeeklyActivityToTasks = (activityTitle: string, countryName: string) => {
    const newItem: ScoutTaskItem = {
      id: `task-wk-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      category: 'relocation',
      title: activityTitle.slice(0, 200),
      countryTag: countryName,
      completed: false,
    };
    setTripDraft(prev => ({
      ...prev,
      tasks: [newItem, ...prev.tasks],
    }));
    setSaveBannerMessage(`Added "${activityTitle.slice(0, 48)}..." to your Relocation Tasks!`);
    setTimeout(() => setSaveBannerMessage(null), 3500);
  };

  const handleAddCustomWeeklyActivity = (blockId: string) => {
    const text = (newWeeklyActivityText[blockId] || '').trim();
    if (!text) return;
    setWeeklyBlocks(prev =>
      prev.map(b =>
        b.id !== blockId
          ? b
          : {
              ...b,
              activities: [
                ...b.activities,
                {
                  id: `wk-custom-${Date.now()}`,
                  title: text,
                  category: 'Neighborhood & Vibe',
                  durationHint: 'Custom',
                  completed: false,
                },
              ],
            }
      )
    );
    setNewWeeklyActivityText(prev => ({ ...prev, [blockId]: '' }));
  };

  // Tasks & Bucket List handlers
  const handleToggleTask = (taskId: string) => {
    setTripDraft(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => (t.id === taskId ? { ...t, completed: !t.completed } : t)),
    }));
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const newItem: ScoutTaskItem = {
      id: `task-${Date.now()}`,
      category: taskSubTab,
      title: newTaskTitle.trim().slice(0, 200),
      countryTag: newTaskTag.trim() || (taskSubTab === 'relocation' ? 'Field Audit' : 'Experience'),
      completed: false,
    };
    setTripDraft(prev => ({
      ...prev,
      tasks: [newItem, ...prev.tasks],
    }));
    setNewTaskTitle('');
    setNewTaskTag('');
    setShowAddTaskInput(false);
  };

  const handleDeleteTask = (taskId: string) => {
    setTripDraft(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== taskId),
    }));
  };

  // Packing Vault handlers
  const handleTogglePackingItem = (itemId: string) => {
    setTripDraft(prev => ({
      ...prev,
      packingList: prev.packingList.map(item =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      ),
    }));
  };

  const handleAddPackingItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPackingTitle.trim()) return;
    const newItem: ScoutPackingItem = {
      id: `pack-${Date.now()}`,
      category: packingSubTab,
      title: newPackingTitle.trim().slice(0, 200),
      completed: false,
    };
    setTripDraft(prev => ({
      ...prev,
      packingList: [newItem, ...prev.packingList],
    }));
    setNewPackingTitle('');
    setShowAddPackingInput(false);
  };

  const handleDeletePackingItem = (itemId: string) => {
    setTripDraft(prev => ({
      ...prev,
      packingList: prev.packingList.filter(item => item.id !== itemId),
    }));
  };

  const handleDeleteSavedTrip = async (tripId: string) => {
    const nextList = savedTrips.filter(t => t.id !== tripId);
    setSavedTrips(nextList);
    try {
      localStorage.setItem(`refirely_saved_trips_${currentUserId}`, JSON.stringify(nextList));
      localStorage.setItem('refirely_saved_trips_latest', JSON.stringify(nextList));
    } catch {}
    if (auth.currentUser) {
      const path = `users/${auth.currentUser.uid}/trips/${tripId}`;
      try {
        await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'trips', tripId));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, path);
      }
    }
  };

  const sortedCountries = useMemo(
    () => [...countries].sort((a, b) => a.name.localeCompare(b.name)),
    [countries]
  );

  const filteredTasks = tripDraft.tasks.filter(t => t.category === taskSubTab);
  const completedTasksCount = filteredTasks.filter(t => t.completed).length;

  const filteredPacking = tripDraft.packingList.filter(p => p.category === packingSubTab);
  const completedPackingCount = filteredPacking.filter(p => p.completed).length;

  const schengenProgressPct = Math.min(100, Math.round((computedMetrics.schengenDays / 90) * 100));

  const visibleWeeklyBlocks = useMemo(() => {
    if (selectedItineraryStopFilter === 'all') return weeklyBlocks;
    return weeklyBlocks.filter(b => b.stopId === selectedItineraryStopFilter);
  }, [weeklyBlocks, selectedItineraryStopFilter]);

  const hasStopsSelected = tripDraft.stops.length > 0;

  const activeContinentObj = useMemo(
    () => continentStats.find(c => c.id === selectedContinent) || continentStats[0],
    [continentStats, selectedContinent]
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 overflow-x-hidden">
      {/* =================================================================== */}
      {/* 1. PAGE HEADER & PRIMARY ACTIONS BAR                                */}
      {/* =================================================================== */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-50/95 via-white to-teal-50/90 border border-indigo-200/80 p-6 sm:p-8 shadow-md">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 via-indigo-500 via-50% to-amber-500" />
        <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-teal-400/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-indigo-400/15 blur-3xl" />

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-teal-100/90 to-indigo-100/90 border border-teal-300/80 text-teal-950 text-xs font-bold uppercase tracking-wider shadow-2xs">
              <Plane className="w-3.5 h-3.5 text-teal-700" />
              <span>Guided 4-Step Sabbatical, Nomad &amp; Relocation Studio</span>
              <span className="px-1.5 py-0.2 rounded-full bg-amber-400/90 text-slate-950 text-[10px] font-extrabold">
                ✨ New
              </span>
            </div>

            <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              Scout &amp; Hop:{' '}
              <span className="bg-gradient-to-r from-teal-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                Sabbatical &amp; Visa Route Planner
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Design your ideal scouting trip step by step: choose your region &amp; dates, watch your stops connect on an interactive Google Map, pick your personal interests (hiking, surfing, nightlife, architecture, dating, volunteering &amp; more), and generate a bespoke visual weekly itinerary.
            </p>
          </div>

          {/* Preset + Reset + Save CTA Controls */}
          <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleLoadSamplePreset}
              className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-indigo-50/80 text-indigo-950 border border-indigo-200/90 text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Load Sample 75-Day Mediterranean Scout</span>
            </button>

            {hasStopsSelected && (
              <button
                type="button"
                onClick={handleClearRouteAndStartFresh}
                className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 text-xs font-bold transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Start Over</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleSaveTripClick}
              disabled={isSavingTrip}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 via-indigo-600 to-violet-600 hover:from-teal-700 hover:to-violet-700 text-white text-xs sm:text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 cursor-pointer shrink-0"
            >
              <Save className="w-4 h-4 shrink-0" />
              <span>{isSavingTrip ? 'Saving Roadmap...' : '💾 Save Trip to My Dashboard'}</span>
            </button>
          </div>
        </div>

        {/* Editable Trip Title & Burn Mode Bar */}
        <div className="relative mt-5 pt-4 border-t border-indigo-100/90 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2">
            <label
              htmlFor="scout-trip-title"
              className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 shrink-0"
            >
              Roadmap Title:
            </label>
            <input
              id="scout-trip-title"
              type="text"
              value={tripDraft.title}
              onChange={e => setTripDraft(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Autumn 2026 Southern Europe Scouting Loop"
              className="w-full sm:max-w-md px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                {isAuthenticated && currentUserId !== 'guest'
                  ? 'Draft synced · Click Save to update Dashboard'
                  : 'Guest Draft Auto-Saved'}
              </span>
            </span>
          </div>

          {/* Living Burn Calculation Basis Selector */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/90 p-1 rounded-xl border border-slate-200/80 text-[11px] font-bold self-start md:self-auto shrink-0">
            <span className="px-2 text-slate-500">Cost Basis:</span>
            {[
              { id: 'retiree-single', label: 'Single Retiree' },
              { id: 'retiree-couple', label: 'Retiree Couple' },
              { id: 'nomad', label: '⚡ Digital Nomad Burn' },
            ].map(mode => (
              <button
                key={mode.id}
                type="button"
                onClick={() => setBurnBasisMode(mode.id as any)}
                className={`px-2.5 py-1 rounded-lg transition-all duration-300 cursor-pointer ${
                  burnBasisMode === mode.id
                    ? 'bg-white text-indigo-950 font-extrabold shadow-2xs border border-indigo-200/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Confirmation Banner when Trip is Saved or Route Generated */}
      <AnimatePresence>
        {saveBannerMessage && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs font-semibold flex flex-wrap items-center justify-between gap-3 shadow-xs"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{saveBannerMessage}</span>
            </div>
            {isAuthenticated && currentUserId !== 'guest' && (
              <button
                type="button"
                onClick={() => setCurrentView('dashboard')}
                className="px-3 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>Open My Dashboard</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Saved Trips Drawer (for Authenticated Members with Saved Trips) */}
      {isAuthenticated && currentUserId !== 'guest' && savedTrips.length > 0 && (
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-extrabold text-slate-900 uppercase tracking-wider">
              <FolderOpen className="w-4 h-4 text-indigo-600" />
              <span>My Saved Scouting Roadmaps ({savedTrips.length})</span>
            </div>
            <button
              type="button"
              onClick={handleClearRouteAndStartFresh}
              className="text-[11px] font-bold text-indigo-700 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Start Fresh Custom Route</span>
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {savedTrips.map(t => {
              const isCurrent = t.id === tripDraft.id;
              return (
                <div
                  key={t.id}
                  className={`p-3 rounded-xl border transition-all duration-300 flex items-center justify-between gap-2 ${
                    isCurrent
                      ? 'bg-indigo-50/70 border-indigo-300 shadow-2xs'
                      : 'bg-slate-50/70 border-slate-200 hover:bg-white'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setTripDraft(t);
                      setWizardStep('step-4-itinerary');
                    }}
                    className="text-left min-w-0 flex-1 cursor-pointer"
                  >
                    <p className="text-xs font-bold text-slate-900 truncate">{t.title}</p>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                      {t.stops?.length || 0} stops · {t.totalDays}d · ${t.estimatedTotalBurnUSD?.toLocaleString()} burn
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteSavedTrip(t.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                    title="Delete saved roadmap"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* CLEAN 4-STEP INTERACTIVE WIZARD PROGRESS BAR                        */}
      {/* =================================================================== */}
      <div className="bg-white/95 backdrop-blur-md p-3 sm:p-4 rounded-3xl border border-indigo-200/80 shadow-sm">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
          {[
            {
              id: 'step-1-region' as WizardStepId,
              stepNum: 'Step 1',
              title: 'Region & Dates',
              subtitle:
                selectedContinent === 'all'
                  ? `Global · ${daysPerStopPreference}d/stop`
                  : `${activeContinentObj.label} · ${daysPerStopPreference}d/stop`,
              icon: Globe,
              done: true,
            },
            {
              id: 'step-2-countries' as WizardStepId,
              stepNum: 'Step 2',
              title: 'Countries & Places',
              subtitle: hasStopsSelected
                ? `${tripDraft.stops.length} ${tripDraft.stops.length === 1 ? 'Stop' : 'Stops'} Selected`
                : 'Pick on Interactive Map',
              icon: MapIcon,
              done: hasStopsSelected,
            },
            {
              id: 'step-3-interests' as WizardStepId,
              stepNum: 'Step 3',
              title: 'Interests & Hobbies',
              subtitle: `${selectedInterests.length} Interests${
                customHobbies.length > 0 ? ` + ${customHobbies.length} Hobbies` : ''
              }`,
              icon: Sparkles,
              done: selectedInterests.length > 0,
            },
            {
              id: 'step-4-itinerary' as WizardStepId,
              stepNum: 'Step 4',
              title: 'My Custom Itinerary',
              subtitle: hasStopsSelected
                ? `${weeklyBlocks.length} Weeks · $${computedMetrics.estimatedTotalBurnUSD.toLocaleString()} Burn`
                : 'Ready to Generate',
              icon: CalendarDays,
              done: wizardStep === 'step-4-itinerary' && hasStopsSelected,
            },
          ].map((step, index) => {
            const Icon = step.icon;
            const isCurrent = wizardStep === step.id;
            const stepOrder = ['step-1-region', 'step-2-countries', 'step-3-interests', 'step-4-itinerary'];
            const currentIdx = stepOrder.indexOf(wizardStep);
            const isCompleted = index < currentIdx;

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => {
                  if (step.id === 'step-4-itinerary' && !hasStopsSelected) {
                    handleGenerateCustomItinerary();
                  } else {
                    setWizardStep(step.id);
                  }
                }}
                className={`p-3 rounded-2xl border text-left transition-all duration-300 flex items-center gap-3 cursor-pointer relative overflow-hidden ${
                  isCurrent
                    ? 'bg-gradient-to-r from-indigo-950 via-indigo-900 to-teal-900 text-white border-indigo-700 shadow-md ring-2 ring-indigo-500/25'
                    : isCompleted
                    ? 'bg-emerald-50/70 hover:bg-emerald-50 border-emerald-200/90 text-slate-900'
                    : 'bg-slate-50/80 hover:bg-white border-slate-200/90 text-slate-700'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-mono text-xs font-extrabold transition-colors ${
                    isCurrent
                      ? 'bg-gradient-to-br from-teal-400 to-emerald-400 text-slate-950 shadow-xs'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white border border-slate-200 text-indigo-700'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4 stroke-[2.5]" /> : <Icon className="w-4 h-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-mono font-extrabold uppercase tracking-wider ${
                        isCurrent ? 'text-teal-300' : isCompleted ? 'text-emerald-700' : 'text-indigo-600'
                      }`}
                    >
                      {step.stepNum}
                    </span>
                    {isCurrent && (
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                    )}
                  </div>
                  <p className="font-heading text-xs sm:text-sm font-extrabold truncate">
                    {step.title}
                  </p>
                  <p
                    className={`text-[11px] truncate font-medium ${
                      isCurrent ? 'text-slate-300' : 'text-slate-500'
                    }`}
                  >
                    {step.subtitle}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* =================================================================== */}
      {/* WIZARD STEP 1: CHOOSE GEOGRAPHICAL REGION, TENTATIVE DATES & BUDGET */}
      {/* =================================================================== */}
      {wizardStep === 'step-1-region' && (
        <motion.div
          key="wizard-step-1"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-3xl bg-white border border-indigo-200/90 shadow-md overflow-hidden"
        >
          {/* Step 1 Top Hero Banner */}
          <div className="p-5 sm:p-7 bg-gradient-to-r from-indigo-950 via-slate-900 to-teal-950 text-white flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/20 border border-teal-400/40 text-teal-300 text-[10px] font-extrabold uppercase tracking-wider">
                <Globe className="w-3 h-3" />
                <span>Step 1 of 4 · Geographical Region &amp; Schedule</span>
              </div>
              <h2 className="font-heading text-xl sm:text-2xl font-extrabold">
                Where in the World Do You Want to Scout, and When?
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
                Pick a continent or Digital Nomad lens, set your tentative start date, duration per stop, and monthly budget target.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setWizardStep('step-2-countries')}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg cursor-pointer shrink-0 transition-transform active:scale-98"
            >
              <span>Next: Choose Countries on Map</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 sm:p-7 space-y-6">
            {/* 1A. Discovery Lens Selector */}
            <div className="space-y-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block">
                1. Choose Your Scouting Style
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  {
                    id: 'continents',
                    title: '🌍 Explore by Continent / Region',
                    desc: 'Mediterranean Europe, Southeast Asia, Latin America, or Islands',
                    icon: Globe,
                    accent: 'from-blue-600 to-indigo-600',
                  },
                  {
                    id: 'nomad-top',
                    title: '💻 Top Digital Nomad Havens',
                    desc: 'Ranked by fast fiber Mbps, coworking hubs & remote work visas',
                    icon: Laptop,
                    accent: 'from-teal-600 to-emerald-600',
                  },
                  {
                    id: 'search-all',
                    title: '🔍 All Retirement & Lifestyle Havens',
                    desc: 'Compare all global havens by healthcare, sunshine & low tax burn',
                    icon: Search,
                    accent: 'from-violet-600 to-indigo-600',
                  },
                ].map(lens => {
                  const Icon = lens.icon;
                  const active = browseMode === lens.id;
                  return (
                    <button
                      key={lens.id}
                      type="button"
                      onClick={() => {
                        setBrowseMode(lens.id as DiscoveryBrowseMode);
                        if (lens.id === 'nomad-top') {
                          setBurnBasisMode('nomad');
                          setScoutingFocus('nomad-fiber');
                        }
                      }}
                      className={`p-4 rounded-2xl border text-left transition-all duration-300 cursor-pointer flex items-start gap-3.5 ${
                        active
                          ? 'bg-gradient-to-br from-indigo-50/90 via-white to-teal-50/80 border-indigo-400 shadow-sm ring-2 ring-indigo-500/20'
                          : 'bg-slate-50/70 hover:bg-white border-slate-200/90'
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${lens.accent} text-white flex items-center justify-center shrink-0 shadow-xs`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-heading text-xs sm:text-sm font-extrabold text-slate-900">
                          {lens.title}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{lens.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 1B. Continent / Geographical Region Cards */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  2. Select Continent or Geographical Region
                </span>
                <span className="text-xs font-bold text-indigo-700">
                  {enrichedDiscoveryCountries.length} matching havens available
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {continentStats.map(cont => {
                  const isSelected = selectedContinent === cont.id;
                  return (
                    <button
                      key={cont.id}
                      type="button"
                      onClick={() => setSelectedContinent(cont.id)}
                      className={`p-4 rounded-2xl border text-left transition-all duration-300 cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                        isSelected
                          ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-indigo-500/30'
                          : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200/90'
                      }`}
                    >
                      <div
                        className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${cont.gradient}`}
                      />
                      <div>
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-2xl">{cont.emoji}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                              isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {cont.count} countries
                          </span>
                        </div>
                        <p className="font-heading text-sm font-extrabold mt-2">{cont.label}</p>
                        <p
                          className={`text-[11px] mt-1 leading-snug ${
                            isSelected ? 'text-slate-300' : 'text-slate-500'
                          }`}
                        >
                          {cont.tagline}
                        </p>
                      </div>
                      <p
                        className={`text-xs font-mono mt-3 pt-2 border-t ${
                          isSelected
                            ? 'border-white/15 text-teal-300 font-bold'
                            : 'border-slate-100 text-emerald-700 font-bold'
                        }`}
                      >
                        Avg ~${cont.avgBurn.toLocaleString()}/mo
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 1C. Tentative Dates, Duration Per Stop, Budget & Climate */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 via-indigo-50/35 to-teal-50/35 border border-indigo-200/70 space-y-4">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 block">
                3. Set Tentative Dates, Stop Duration &amp; Monthly Budget
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Tentative Start Date */}
                <div>
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-1.5 mb-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Tentative Start Date</span>
                  </label>
                  <input
                    type="date"
                    min={todayIsoDate}
                    value={tentativeStartDate}
                    onChange={e =>
                      handleRecalculateDatesFromPreferences(
                        clampToMinIsoDate(e.target.value, todayIsoDate),
                        daysPerStopPreference
                      )
                    }
                    className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Tentative Duration per Stop */}
                <div>
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-1.5 mb-1.5">
                    <Clock className="w-3.5 h-3.5 text-teal-600" />
                    <span>Duration Per Stop (Weeks)</span>
                  </label>
                  <select
                    value={daysPerStopPreference}
                    onChange={e =>
                      handleRecalculateDatesFromPreferences(
                        tentativeStartDate,
                        Number(e.target.value)
                      )
                    }
                    className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value={7}>1 Week (7 Days / Stop)</option>
                    <option value={14}>2 Weeks (14 Days / Stop)</option>
                    <option value={21}>3 Weeks (21 Days / Stop)</option>
                    <option value={30}>1 Month (30 Days / Stop)</option>
                    <option value={45}>6 Weeks (45 Days / Stop)</option>
                  </select>
                </div>

                {/* Monthly Living Budget Target Slider */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Max Monthly Budget</span>
                    </label>
                    <span className="text-xs font-mono font-extrabold text-emerald-800">
                      Up to ${maxMonthlyBudgetUSD.toLocaleString()}/mo
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1200}
                    max={5000}
                    step={100}
                    value={maxMonthlyBudgetUSD}
                    onChange={e => setMaxMonthlyBudgetUSD(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer mt-1"
                  />
                </div>

                {/* Climate Preference */}
                <div>
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-1.5 mb-1.5">
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                    <span>Preferred Climate</span>
                  </label>
                  <select
                    value={climatePreference}
                    onChange={e => setClimatePreference(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Any">Any Climate</option>
                    <option value="Mediterranean">Mediterranean (Warm &amp; Sunny)</option>
                    <option value="Tropical">Tropical (Beach &amp; Island)</option>
                    <option value="Subtropical">Subtropical</option>
                    <option value="Temperate">Temperate</option>
                    <option value="Highlands / Mild">Highlands / Eternal Spring</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Step 1 Bottom Action Bar */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handleAutoSuggestRoute(true)}
                className="px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>✨ Auto-Pick Top 3 Matches &amp; Jump to Interests</span>
              </button>

              <button
                type="button"
                onClick={() => setWizardStep('step-2-countries')}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-teal-600 via-indigo-600 to-violet-600 hover:from-teal-700 hover:to-violet-700 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <span>Continue to Step 2: Choose Countries &amp; Places ({enrichedDiscoveryCountries.length} Havens)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* =================================================================== */}
      {/* WIZARD STEP 2: CHOOSE COUNTRIES & PLACES WITH LIVE GOOGLE MAP       */}
      {/* =================================================================== */}
      {wizardStep === 'step-2-countries' && (
        <motion.div
          key="wizard-step-2"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-3xl bg-white border border-indigo-200/90 shadow-md overflow-hidden"
        >
          {/* Step 2 Header Banner */}
          <div className="p-5 sm:p-7 bg-gradient-to-r from-indigo-950 via-slate-900 to-teal-950 text-white flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/20 border border-teal-400/40 text-teal-300 text-[10px] font-extrabold uppercase tracking-wider">
                <MapIcon className="w-3 h-3" />
                <span>Step 2 of 4 · Visual Country &amp; City Hub Selection</span>
              </div>
              <h2 className="font-heading text-xl sm:text-2xl font-extrabold">
                Pick Your Countries &amp; Cities on the Interactive Route Map
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
                Click any country pin on the Google Map—or click a city hub button below—to build a 1 to 5 stop route. Watch the animated polyline connect your stops in real time.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setWizardStep('step-1-region')}
                className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 border border-white/20 text-xs font-bold cursor-pointer"
              >
                ← Back to Region
              </button>

              <button
                type="button"
                onClick={() => setWizardStep('step-3-interests')}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg cursor-pointer"
              >
                <span>Next: Choose Interests &amp; Hobbies ({tripDraft.stops.length}/5 Stops)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-5 sm:p-7 space-y-6">
            {/* Selected Route Tray */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-950 via-indigo-950 to-slate-900 text-white space-y-3 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-teal-300 block">
                    Active Route Sequence ({tripDraft.stops.length}/5 Stops · {computedMetrics.totalDays} Days Total)
                  </span>
                  <p className="text-xs text-slate-300">
                    {hasStopsSelected
                      ? 'Click any stop pill to focus it on the map, or add up to 5 stops before choosing your interests.'
                      : 'No stops selected yet — click a country pin on the map below, pick a card, or click "Auto-Pick Top 3".'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {!hasStopsSelected && (
                    <button
                      type="button"
                      onClick={() => handleAutoSuggestRoute(false)}
                      className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Auto-Pick Top 3 Matches</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowDiscoveryMapPreview(prev => !prev)}
                    className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-xs font-bold text-teal-200 flex items-center gap-1.5 cursor-pointer"
                  >
                    <MapIcon className="w-3.5 h-3.5" />
                    <span>{showDiscoveryMapPreview ? 'Hide Map' : 'Show Live Map'}</span>
                  </button>
                </div>
              </div>

              {hasStopsSelected && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {computedMetrics.enrichedStops.map((stop, idx) => (
                    <React.Fragment key={stop.id}>
                      <div
                        onClick={() => setFocusedMapCountryId(stop.countryId)}
                        className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 flex items-center gap-2.5 cursor-pointer transition-colors"
                      >
                        <span
                          className={`w-5 h-5 rounded-full text-[10px] font-mono font-extrabold flex items-center justify-center ${
                            idx === 0
                              ? 'bg-emerald-500 text-white'
                              : idx === computedMetrics.enrichedStops.length - 1 &&
                                computedMetrics.enrichedStops.length > 1
                              ? 'bg-amber-400 text-slate-950'
                              : 'bg-indigo-500 text-white'
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <span className="text-base">{stop.countryFlag}</span>
                        <div className="text-left">
                          <div className="flex items-center gap-1.5 text-xs font-extrabold">
                            <span>{stop.countryName}</span>
                            <span className="text-[10px] font-mono text-teal-300">
                              ({stop.days}d)
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-300 block font-mono">
                            {stop.cityFocus} · {stop.arrivalDate} → {stop.departureDate}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            handleRemoveStop(stop.id);
                          }}
                          className="p-1 rounded-lg text-slate-300 hover:text-rose-400 hover:bg-white/10 cursor-pointer"
                          title="Remove stop"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {idx < computedMetrics.enrichedStops.length - 1 && (
                        <ArrowRight className="w-4 h-4 text-teal-400 shrink-0" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>

            {/* Interactive Google Maps Route & Candidate Pin Selector */}
            {showDiscoveryMapPreview && (
              <ScoutRouteMap
                stops={computedMetrics.enrichedStops}
                candidateCountries={candidateMapCountries}
                focusedCountryId={focusedMapCountryId}
                isDiscoveryPreview={true}
                onAddCountryFromMap={(countryId, city) => {
                  handleAddCountryFromDiscovery(countryId, city);
                  setFocusedMapCountryId(countryId);
                }}
                onRemoveStopFromMap={handleRemoveStop}
                onUpdateStopDatesFromMap={(stopId, updates) => handleUpdateStop(stopId, updates)}
              />
            )}

            {/* Quick Search & Continent Filter Bar inside Step 2 */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2 border-t border-slate-100">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={countrySearchQuery}
                  onChange={e => setCountrySearchQuery(e.target.value)}
                  placeholder="Search country or city hub (e.g., Lisbon, Chiang Mai, Valencia, Bali)..."
                  className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {countrySearchQuery && (
                  <button
                    type="button"
                    onClick={() => setCountrySearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {continentStats.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedContinent(c.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      selectedContinent === c.id
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span>{c.emoji}</span>
                    <span>{c.id === 'all' ? 'All' : c.id}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Visual Country & City Hub Cards with Scenic Thumbnails */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[680px] overflow-y-auto pr-1">
              {enrichedDiscoveryCountries.map(item => {
                const { country, nomadProfile, monthlyRate, nomadOverallScore, hubs, isSchengen } =
                  item;
                const selectedStopsForCountry = tripDraft.stops.filter(
                  s => s.countryId.toLowerCase() === country.id.toLowerCase()
                );
                const isSelected = selectedStopsForCountry.length > 0;
                const isMapFocused =
                  focusedMapCountryId?.toLowerCase() === country.id.toLowerCase();

                return (
                  <motion.div
                    key={country.id}
                    layout
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.25 }}
                    className={`group rounded-2xl border overflow-hidden transition-all duration-300 flex flex-col justify-between ${
                      isSelected
                        ? 'bg-gradient-to-br from-indigo-50/90 via-white to-teal-50/80 border-indigo-400 shadow-md ring-2 ring-indigo-500/20'
                        : isMapFocused
                        ? 'bg-teal-50/40 border-teal-400 shadow-xs ring-2 ring-teal-500/20'
                        : 'bg-white hover:border-indigo-300 border-slate-200/90 hover:shadow-sm'
                    }`}
                  >
                    <div>
                      {/* Scenic Country Thumbnail Header */}
                      <div className="relative h-32 w-full overflow-hidden">
                        <CountryThumbnail
                          country={country}
                          className="w-full h-full"
                          hideLandmarkLabel
                        />
                        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-lg bg-slate-950/75 backdrop-blur-md text-white text-[10px] font-bold border border-white/15">
                            {isSchengen ? '🇪🇺 Schengen' : '🌍 Non-Schengen'}
                          </span>
                          {isSelected && (
                            <span className="px-2 py-0.5 rounded-lg bg-emerald-500 text-slate-950 font-mono text-[10px] font-extrabold shadow-xs">
                              ✓ Stop #{tripDraft.stops.findIndex(s => s.countryId === country.id) + 1}
                            </span>
                          )}
                        </div>
                        <div className="absolute top-2.5 right-2.5">
                          <span className="px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md text-emerald-300 font-mono text-xs font-extrabold border border-emerald-400/30">
                            ${monthlyRate.toLocaleString()}/mo
                          </span>
                        </div>
                        <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-white">
                          <div className="flex items-center gap-2 min-w-0">
                            <CountryFlag
                              countryName={country.name}
                              fallbackEmoji={country.flag}
                              size="sm"
                            />
                            <h3 className="font-heading font-extrabold text-base text-white drop-shadow-xs truncate">
                              {country.name}
                            </h3>
                          </div>
                          <span className="text-[10px] font-mono font-bold text-teal-200 bg-slate-950/60 px-2 py-0.5 rounded-md">
                            ⚡ Nomad {nomadOverallScore}/100
                          </span>
                        </div>
                      </div>

                      <div className="p-4 space-y-3">
                        {/* Key Metrics Pills */}
                        <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-semibold">
                          <span className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-900 border border-teal-200/80 flex items-center gap-1">
                            <Wifi className="w-3 h-3 text-teal-600" />
                            <span>{nomadProfile.verifiedInternetMbps} Mbps Fiber</span>
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-900 border border-indigo-200/80 truncate max-w-[175px]">
                            {nomadProfile.remoteWorkVisaName}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200/80">
                            ☀️ {country.climate.annualSunnyDays}d sun
                          </span>
                        </div>

                        {/* Quick City Hub Selector Pills */}
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                            Pick a City Hub to Plot on Map:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {(hubs.length > 0
                              ? hubs.map(h => h.cityName)
                              : country.topCities?.slice(0, 2).map(tc => tc.name) || [country.capital]
                            ).map(cityName => (
                              <button
                                key={cityName}
                                type="button"
                                onClick={() => {
                                  handleAddCountryFromDiscovery(country.id, cityName);
                                  setFocusedMapCountryId(country.id);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700 text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                              >
                                <MapPin className="w-2.5 h-2.5" />
                                <span>+ {cityName}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer Buttons */}
                    <div className="px-4 pb-4 pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setShowDiscoveryMapPreview(true);
                          setFocusedMapCountryId(country.id);
                        }}
                        className="px-2.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200/80 text-[11px] font-bold flex items-center gap-1 cursor-pointer shrink-0 transition-colors"
                      >
                        <MapPin className="w-3 h-3 text-teal-700" />
                        <span>Preview Pin</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          handleAddCountryFromDiscovery(country.id);
                          setFocusedMapCountryId(country.id);
                        }}
                        disabled={tripDraft.stops.length >= 5}
                        className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          isSelected
                            ? 'bg-indigo-100 hover:bg-indigo-200 text-indigo-950'
                            : 'bg-slate-900 hover:bg-indigo-600 text-white'
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>
                          {isSelected ? `+ 2nd Hub in ${country.name}` : `+ Add ${country.name}`}
                        </span>
                      </button>

                      {isSelected && (
                        <button
                          type="button"
                          onClick={() => {
                            const lastMatch =
                              selectedStopsForCountry[selectedStopsForCountry.length - 1];
                            if (lastMatch) handleRemoveStop(lastMatch.id);
                          }}
                          className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 cursor-pointer"
                          title="Remove from route"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Step 2 Bottom CTA Bar */}
            <div className="pt-3 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs text-slate-600">
                {hasStopsSelected ? (
                  <span>
                    <strong className="text-slate-900">{tripDraft.stops.length} stops selected</strong> (
                    {tripDraft.stops.map(s => s.cityFocus || s.countryName).join(' → ')}). Ready to personalize your activities!
                  </span>
                ) : (
                  <span>Select at least 1 country stop above (or click Next and we will auto-pick your top 3 matches).</span>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!hasStopsSelected) {
                    handleAutoSuggestRoute(true);
                  } else {
                    setWizardStep('step-3-interests');
                  }
                }}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-teal-600 via-indigo-600 to-violet-600 hover:from-teal-700 hover:to-violet-700 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer shrink-0"
              >
                <span>Continue to Step 3: Pick Your Interests &amp; Hobbies</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* =================================================================== */}
      {/* WIZARD STEP 3: COLLECT USER INTERESTS, PASSIONS & HOBBIES           */}
      {/* =================================================================== */}
      {wizardStep === 'step-3-interests' && (
        <motion.div
          key="wizard-step-3"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-3xl bg-white border border-indigo-200/90 shadow-md overflow-hidden"
        >
          {/* Step 3 Header Banner */}
          <div className="p-5 sm:p-7 bg-gradient-to-r from-indigo-950 via-violet-950 to-teal-950 text-white flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-300 text-[10px] font-extrabold uppercase tracking-wider">
                <Sparkles className="w-3 h-3" />
                <span>Step 3 of 4 · Personalize Your Weekly Playbook</span>
              </div>
              <h2 className="font-heading text-xl sm:text-2xl font-extrabold">
                What Are Your Interests, Passions &amp; Lifestyle Priorities?
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
                Select everything you love—from hiking, surfing, architecture, and culture to nightlife, dating, volunteering, nature reserves, and hobbies. We will craft a custom week-by-week itinerary for your chosen stops.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setWizardStep('step-2-countries')}
                className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 border border-white/20 text-xs font-bold cursor-pointer"
              >
                ← Back to Countries
              </button>

              <button
                type="button"
                onClick={handleGenerateCustomItinerary}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-400 to-rose-500 hover:from-amber-300 hover:to-rose-400 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl cursor-pointer transition-transform active:scale-98"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate My Custom Itinerary &amp; Show Me →</span>
              </button>
            </div>
          </div>

          <div className="p-5 sm:p-7 space-y-6">
            {/* Quick Interest Bundle Presets */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mr-1">
                  Quick Vibe Bundles:
                </span>
                {[
                  {
                    label: '🏔️ Outdoor, Surf & Nature',
                    ids: ['hiking', 'surfing', 'nature', 'hobbies', 'culture'] as ScoutInterestId[],
                  },
                  {
                    label: '🍸 Social, Nightlife & Dating',
                    ids: ['nightlife', 'dating', 'culture', 'surfing', 'coworking'] as ScoutInterestId[],
                  },
                  {
                    label: '🏛️ Culture, Architecture & Volunteering',
                    ids: ['culture', 'architecture', 'volunteering', 'nature', 'hobbies'] as ScoutInterestId[],
                  },
                  {
                    label: '🏡 Full Relocation & Visa Audit',
                    ids: ['residency', 'healthcare', 'architecture', 'culture', 'coworking'] as ScoutInterestId[],
                  },
                ].map(bundle => (
                  <button
                    key={bundle.label}
                    type="button"
                    onClick={() => setSelectedInterests(bundle.ids)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-900 border border-slate-200/80 text-xs font-bold transition-colors cursor-pointer"
                  >
                    {bundle.label}
                  </button>
                ))}
              </div>

              <span className="text-xs font-mono font-extrabold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
                {selectedInterests.length} of {SCOUT_INTEREST_CATALOG.length} selected
              </span>
            </div>

            {/* 12 Visual Interest Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {SCOUT_INTEREST_CATALOG.map(interest => {
                const isSelected = selectedInterests.includes(interest.id);
                return (
                  <motion.button
                    key={interest.id}
                    type="button"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleToggleInterest(interest.id)}
                    className={`group rounded-2xl border text-left overflow-hidden transition-all duration-300 flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-br from-indigo-50/90 via-white to-teal-50/80 border-indigo-500 shadow-md ring-2 ring-indigo-500/25'
                        : 'bg-white hover:border-indigo-300 border-slate-200/90 opacity-90 hover:opacity-100'
                    }`}
                  >
                    <div className="w-full">
                      <ResilientScenicBanner
                        primaryUrl={interest.photoUrl}
                        fallbackUrl="https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=900&q=80"
                        gradientFallback={interest.fallbackGradient}
                        alt={interest.label}
                        className="h-28"
                      >
                        <div className="p-3 h-full flex flex-col justify-between">
                          <div className="flex items-center justify-between">
                            <span className="w-8 h-8 rounded-xl bg-slate-950/65 backdrop-blur-md border border-white/20 flex items-center justify-center text-base shadow-2xs">
                              {interest.emoji}
                            </span>
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                                isSelected
                                  ? 'bg-emerald-500 text-slate-950 shadow-sm scale-105'
                                  : 'bg-slate-950/50 text-white/70 border border-white/30'
                              }`}
                            >
                              {isSelected ? (
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              ) : (
                                <Plus className="w-3.5 h-3.5" />
                              )}
                            </div>
                          </div>

                          <h3 className="font-heading text-sm font-extrabold text-white drop-shadow-xs">
                            {interest.label}
                          </h3>
                        </div>
                      </ResilientScenicBanner>

                      <div className="p-3.5">
                        <p className="text-xs text-slate-600 leading-snug">{interest.shortDesc}</p>
                      </div>
                    </div>

                    <div className="px-3.5 pb-3 pt-1 flex items-center justify-between">
                      <span
                        className={`text-[10px] font-extrabold uppercase tracking-wider ${
                          isSelected ? 'text-indigo-700' : 'text-slate-400'
                        }`}
                      >
                        {isSelected ? '✓ Included in Playbook' : 'Click to Include'}
                      </span>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Custom Hobby / Personal Passion Input */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 via-indigo-50/40 to-teal-50/40 border border-indigo-200/80 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-heading text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>Add Your Specific Hobbies or Passions (Optional)</span>
                  </h3>
                  <p className="text-xs text-slate-600">
                    Type any personal hobby (e.g., Padel Tennis, Scuba Diving, Salsa Dancing, Specialty Coffee, Photography, Chess) and we will weave it into your city stops.
                  </p>
                </div>
              </div>

              <form onSubmit={handleAddCustomHobby} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={customHobbyInput}
                  onChange={e => setCustomHobbyInput(e.target.value)}
                  placeholder="e.g., Padel Tennis, Scuba Diving, Salsa, Pottery, Trail Running..."
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => handleAddCustomHobby()}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer shrink-0"
                >
                  + Add Hobby Tag
                </button>
              </form>

              {/* Quick One-Click Hobby Suggestions + Active Custom Hobby Pills */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1">
                  Popular Hobbies:
                </span>
                {[
                  'Padel & Tennis',
                  'Scuba & Freediving',
                  'Salsa & Bachata',
                  'Specialty Coffee',
                  'Yoga & Breathwork',
                  'Photography Walks',
                  'Wine Tasting',
                  'Cycling Clubs',
                ].map(suggestion => {
                  const isAdded = customHobbies.includes(suggestion);
                  return (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => {
                        if (isAdded) {
                          handleRemoveCustomHobby(suggestion);
                        } else {
                          setCustomHobbies(prev => [...prev, suggestion]);
                        }
                      }}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        isAdded
                          ? 'bg-teal-600 text-white shadow-2xs'
                          : 'bg-white text-slate-700 border border-slate-200 hover:border-teal-400'
                      }`}
                    >
                      <span>{isAdded ? '✓' : '+'}</span>
                      <span>{suggestion}</span>
                    </button>
                  );
                })}
              </div>

              {customHobbies.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-indigo-200/50">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-800">
                    Your Custom Hobbies:
                  </span>
                  {customHobbies.map(hobby => (
                    <span
                      key={hobby}
                      className="px-3 py-1 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs"
                    >
                      <span>🎯 {hobby}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCustomHobby(hobby)}
                        className="hover:text-rose-200 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Prominent Final Call to Action Banner */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-950 via-indigo-900 to-teal-950 text-white flex flex-col lg:flex-row lg:items-center justify-between gap-5 shadow-lg">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-teal-300 block">
                  Ready to Build Your Bespoke Scouting Masterplan
                </span>
                <h3 className="font-heading text-lg sm:text-xl font-extrabold">
                  {hasStopsSelected
                    ? `${tripDraft.stops.map(s => s.cityFocus || s.countryName).join(' → ')} (${computedMetrics.totalDays} Days)`
                    : 'Auto-Match Top 3 Havens + Custom Weekly Playbook'}
                </h3>
                <p className="text-xs text-slate-300">
                  Tailored to {selectedInterests.length} selected interests
                  {customHobbies.length > 0 ? ` and ${customHobbies.join(', ')}` : ''} with interactive Google Maps route &amp; magazine-style weekly cards.
                </p>
              </div>

              <button
                type="button"
                onClick={handleGenerateCustomItinerary}
                className="px-7 py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-400 to-rose-500 hover:from-amber-300 hover:to-rose-400 text-slate-950 font-heading font-extrabold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xl cursor-pointer shrink-0 transition-transform active:scale-98"
              >
                <Sparkles className="w-5 h-5" />
                <span>Generate My Custom Itinerary &amp; Show Me</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* =================================================================== */}
      {/* WIZARD STEP 4: GENERATED VISUAL ITINERARY, ROUTE MAP & WORKSPACE    */}
      {/* =================================================================== */}
      {wizardStep === 'step-4-itinerary' && hasStopsSelected && (
        <motion.div
          key="wizard-step-4"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-6"
        >
          {/* Step 4 Control & Sub-View Switcher Bar (Clutter-Free Mode Toggle) */}
          <div className="p-4 rounded-3xl bg-white border border-indigo-200/90 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Active Interests & Route Summary */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1.5 rounded-xl bg-indigo-950 text-white font-mono text-xs font-extrabold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  {tripDraft.stops.length} Stops · {weeklyBlocks.length} Weeks · $
                  {computedMetrics.estimatedTotalBurnUSD.toLocaleString()} Est. Burn
                </span>
              </span>

              {selectedInterests.slice(0, 5).map(intId => {
                const meta = SCOUT_INTEREST_CATALOG.find(item => item.id === intId);
                if (!meta) return null;
                return (
                  <span
                    key={intId}
                    className="px-2.5 py-1 rounded-xl bg-indigo-50 border border-indigo-200/80 text-indigo-950 text-[11px] font-bold flex items-center gap-1"
                  >
                    <span>{meta.emoji}</span>
                    <span>{meta.shortLabel}</span>
                  </span>
                );
              })}
              {selectedInterests.length > 5 && (
                <span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-bold">
                  +{selectedInterests.length - 5} more
                </span>
              )}

              <button
                type="button"
                onClick={() => setWizardStep('step-3-interests')}
                className="px-2.5 py-1 rounded-xl text-xs font-bold text-indigo-700 hover:bg-indigo-50 cursor-pointer"
              >
                ✎ Edit Interests
              </button>
              <button
                type="button"
                onClick={() => setWizardStep('step-2-countries')}
                className="px-2.5 py-1 rounded-xl text-xs font-bold text-teal-700 hover:bg-teal-50 cursor-pointer"
              >
                ✎ Edit Stops
              </button>
            </div>

            {/* Clean Sub-View Tabs so Step 4 is never cluttered */}
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/90 shrink-0">
              {[
                {
                  id: 'map-itinerary' as PlannerStageTab,
                  label: '✨ Map & Mixed-Week Venue Explorer',
                  icon: CalendarDays,
                },
                {
                  id: 'complete-itinerary' as PlannerStageTab,
                  label: `📋 Complete Chosen Itinerary (${(tripDraft.selectedItineraryItems || []).length})`,
                  icon: CheckCircle2,
                },
                {
                  id: 'workspace' as PlannerStageTab,
                  label: '🗂️ 3-Column Visa, Tasks & Packing',
                  icon: Columns3,
                },
                {
                  id: 'all-in-one' as PlannerStageTab,
                  label: '🌐 Unified View',
                  icon: LayoutGrid,
                },
              ].map(tab => {
                const Icon = tab.icon;
                const active = activeStageTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveStageTab(tab.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      active
                        ? 'bg-gradient-to-r from-teal-600 via-indigo-600 to-violet-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4A. INTERACTIVE GOOGLE MAPS WIDGET & UNIFIED MULTI-WEEK VENUE EXPLORER */}
          {(activeStageTab === 'map-itinerary' || activeStageTab === 'all-in-one') && (
            <div className="space-y-6">
              {/* Interactive Google Maps Route & Directions Widget */}
              <ScoutRouteMap
                stops={computedMetrics.enrichedStops}
                candidateCountries={candidateMapCountries}
                focusedCountryId={focusedMapCountryId}
                onAddCountryFromMap={(countryId, city) => {
                  handleAddCountryFromDiscovery(countryId, city);
                  setFocusedMapCountryId(countryId);
                }}
                onRemoveStopFromMap={handleRemoveStop}
                onUpdateStopDatesFromMap={(stopId, updates) => handleUpdateStop(stopId, updates)}
              />

              {/* UNIFIED MULTI-WEEK STOP CARDS WITH FAMOUS BARS, DATING SPOTS, TRAILS & OPERATORS */}
              <div className="rounded-3xl bg-white border border-indigo-200/90 p-5 sm:p-7 shadow-md space-y-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                  <div className="space-y-1.5">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-50 to-teal-50 border border-indigo-200 text-indigo-900 text-[10px] font-extrabold uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Mixed Multi-Week Stop Cards · Verified Local Venues &amp; Operators</span>
                    </div>
                    <h2 className="font-heading text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900">
                      Famous Bars, Dating Spots, Hikes &amp; Local Operators by Country Stop
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 max-w-3xl">
                      All weeks for each country stop are combined into a single unified card below. Inspect real venues, rooftop bars, paragliding/adventure companies, and social spots with Google ★ ratings and direct Google Maps links—then assign any spot to a specific Week &amp; Day in your itinerary.
                    </p>
                  </div>

                  {/* Filter by Country Stop + Quick Jump to Complete Chosen Itinerary */}
                  <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setSelectedItineraryStopFilter('all')}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selectedItineraryStopFilter === 'all'
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      All Stops ({computedMetrics.enrichedStops.length})
                    </button>
                    {computedMetrics.enrichedStops.map((stop, idx) => (
                      <button
                        key={stop.id}
                        type="button"
                        onClick={() => setSelectedItineraryStopFilter(stop.id)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          selectedItineraryStopFilter === stop.id
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        <span>{stop.countryFlag}</span>
                        <span>
                          Stop {idx + 1}: {stop.cityFocus || stop.countryName}
                        </span>
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setActiveStageTab('complete-itinerary')}
                      className="px-3.5 py-2 rounded-xl text-xs font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>
                        View Complete Itinerary ({(tripDraft.selectedItineraryItems || []).length})
                      </span>
                    </button>
                  </div>
                </div>

                {/* Unified Stop Cards Stack (1 Card per Country Stop, mixing all weeks of that stop) */}
                <div className="space-y-8">
                  {computedMetrics.enrichedStops
                    .filter(
                      stop =>
                        selectedItineraryStopFilter === 'all' ||
                        stop.id === selectedItineraryStopFilter
                    )
                    .map((stop, stopIdx) => {
                      const stopWeeklyBlocks = weeklyBlocks.filter(b => b.stopId === stop.id);
                      const weekRangeMeta = venueCatalog.stopWeekRanges[stop.id] || {
                        startWeek: stopIdx + 1,
                        endWeek: stopIdx + 1,
                        numWeeks: 1,
                        totalDays: stop.days || 7,
                      };
                      const stopWeeksArray = Array.from(
                        { length: weekRangeMeta.numWeeks },
                        (_, i) => weekRangeMeta.startWeek + i
                      );
                      const allStopRecs = venueCatalog.allRecommendationsByStop[stop.id] || [];
                      const activeWeekFilter = stopWeekFilter[stop.id] ?? 'all';
                      const activeCatFilter = stopCategoryFilter[stop.id] ?? 'all';

                      const scheduledForThisStop = (tripDraft.selectedItineraryItems || []).filter(
                        item => item.stopId === stop.id
                      );

                      // Filter recommendations by selected week (or show all weeks mixed) and category
                      const visibleRecs = allStopRecs.filter(rec => {
                        const scheduledMatch = scheduledForThisStop.find(
                          s => s.recommendationId === rec.recommendationId
                        );
                        const recDefaultWeek = rec.weekNumber || weekRangeMeta.startWeek;
                        const effectiveWeek = scheduledMatch
                          ? scheduledMatch.weekNumber
                          : recDefaultWeek;

                        if (activeWeekFilter !== 'all' && effectiveWeek !== activeWeekFilter) {
                          return false;
                        }
                        if (activeCatFilter !== 'all' && rec.interestId !== activeCatFilter) {
                          return false;
                        }
                        return true;
                      });

                      const heroBlock = stopWeeklyBlocks[0];
                      const heroPhoto =
                        heroBlock?.heroPhotoUrl ||
                        allStopRecs[0]?.photoUrl ||
                        'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1000&q=80';
                      const heroGradient =
                        heroBlock?.gradientFallback ||
                        allStopRecs[0]?.fallbackGradient ||
                        'from-indigo-900 via-teal-900 to-slate-900';

                      const uniqueCategories: string[] = Array.from(
                        new Set(
                          allStopRecs
                            .map(r => r.interestId)
                            .filter((id): id is string => Boolean(id))
                        )
                      );

                      const draftCustom = customVenueDraft[stop.id] || {
                        title: '',
                        neighborhood: '',
                        categoryLabel: '🍸 Nightlife & Rooftop Bar',
                        weekNumber: weekRangeMeta.startWeek,
                        daySlot: 'Day 5 (Fri)',
                      };

                      return (
                        <motion.div
                          key={stop.id}
                          layout
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                          className="rounded-3xl bg-white border-2 border-indigo-200/90 overflow-hidden shadow-md hover:shadow-xl transition-all duration-500"
                        >
                          {/* Unified Multi-Week Country Stop Hero Banner */}
                          <ResilientScenicBanner
                            primaryUrl={heroPhoto}
                            fallbackUrl={heroBlock?.fallbackPhotoUrl}
                            gradientFallback={heroGradient}
                            alt={`${stop.cityFocus || stop.countryName}, ${stop.countryName}`}
                            className="h-56 sm:h-64"
                          >
                            <div className="p-5 sm:p-7 h-full flex flex-col justify-between">
                              {/* Top Badges */}
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="px-3.5 py-1.5 rounded-xl bg-slate-950/85 backdrop-blur-md text-teal-300 font-mono text-xs font-extrabold border border-teal-400/40 shadow-xs">
                                    {weekRangeMeta.numWeeks > 1
                                      ? `WEEKS ${weekRangeMeta.startWeek}–${weekRangeMeta.endWeek} MIXED (${stop.days} DAYS)`
                                      : `WEEK ${weekRangeMeta.startWeek} (${stop.days} DAYS)`}
                                  </span>
                                  <span className="px-3.5 py-1.5 rounded-xl bg-white/95 backdrop-blur-md text-slate-950 font-heading text-xs sm:text-sm font-extrabold flex items-center gap-1.5 shadow-xs">
                                    <span>{stop.countryFlag}</span>
                                    <span>{stop.countryName}</span>
                                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                                    <span className="text-indigo-700">
                                      {stop.cityFocus || stop.countryName}
                                    </span>
                                  </span>
                                  <span className="px-3 py-1 rounded-xl bg-emerald-500/90 text-slate-950 font-mono text-xs font-extrabold shadow-xs">
                                    {scheduledForThisStop.length} Places Scheduled
                                  </span>
                                </div>

                                <div className="flex items-center gap-2">
                                  <span className="px-3 py-1.5 rounded-xl bg-slate-950/75 backdrop-blur-md text-white/95 font-mono text-xs font-bold border border-white/15">
                                    {stop.arrivalDate} → {stop.departureDate}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => setFocusedMapCountryId(stop.countryId)}
                                    className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs cursor-pointer transition-colors shadow-xs"
                                  >
                                    Focus on Map
                                  </button>
                                </div>
                              </div>

                              {/* Bottom Title & Combined Weekly Themes */}
                              <div className="space-y-2">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  {stopWeeklyBlocks.map(wb => (
                                    <span
                                      key={wb.id}
                                      className="px-2.5 py-0.5 rounded-lg bg-slate-950/75 backdrop-blur-md text-teal-200 border border-teal-400/25 text-[11px] font-bold"
                                    >
                                      Wk {wb.weekNumber}: {wb.themeTitle}
                                    </span>
                                  ))}
                                </div>
                                <h3 className="font-heading text-xl sm:text-2xl lg:text-3xl font-extrabold text-white leading-tight drop-shadow-xs">
                                  {stop.cityFocus || stop.countryName}, {stop.countryName} — Unified Multi-Week Playbook &amp; Curated Hotspots
                                </h3>
                              </div>
                            </div>
                          </ResilientScenicBanner>

                          {/* Internal Filter Bar: Mix All Weeks vs Individual Week + Category Filter */}
                          <div className="px-5 sm:px-7 py-4 bg-gradient-to-r from-slate-50 via-indigo-50/40 to-teal-50/30 border-b border-slate-200/80 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                            {/* Week Selector Pills (Mix All Weeks vs Specific Week) */}
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mr-1">
                                Week View:
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  setStopWeekFilter(prev => ({ ...prev, [stop.id]: 'all' }))
                                }
                                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                                  activeWeekFilter === 'all'
                                    ? 'bg-indigo-950 text-white shadow-2xs'
                                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                                }`}
                              >
                                ✨ All Weeks Mixed (Wks {weekRangeMeta.startWeek}–{weekRangeMeta.endWeek})
                              </button>
                              {stopWeeksArray.map(wkNum => (
                                <button
                                  key={wkNum}
                                  type="button"
                                  onClick={() =>
                                    setStopWeekFilter(prev => ({ ...prev, [stop.id]: wkNum }))
                                  }
                                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                    activeWeekFilter === wkNum
                                      ? 'bg-teal-600 text-white shadow-2xs'
                                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                                  }`}
                                >
                                  Week {wkNum}
                                </button>
                              ))}
                            </div>

                            {/* Category / Activity Type Filter */}
                            <div className="flex flex-wrap items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() =>
                                  setStopCategoryFilter(prev => ({ ...prev, [stop.id]: 'all' }))
                                }
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                                  activeCatFilter === 'all'
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                                }`}
                              >
                                All Hotspots ({allStopRecs.length})
                              </button>
                              {uniqueCategories.map(catId => {
                                const meta = SCOUT_INTEREST_CATALOG.find(i => i.id === catId);
                                return (
                                  <button
                                    key={catId}
                                    type="button"
                                    onClick={() =>
                                      setStopCategoryFilter(prev => ({
                                        ...prev,
                                        [stop.id]: catId,
                                      }))
                                    }
                                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                      activeCatFilter === catId
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                                    }`}
                                  >
                                    <span>{meta?.emoji || '🎯'}</span>
                                    <span>{meta?.shortLabel || catId}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Curated Real-World Venues, Bars, Dating Spots & Adventure Operators Grid */}
                          <div className="p-5 sm:p-7 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                              {visibleRecs.map(rec => {
                                const scheduledItem = scheduledForThisStop.find(
                                  item => item.recommendationId === rec.recommendationId
                                );
                                const isAdded = Boolean(scheduledItem);

                                const defaultWeekForRec = rec.weekNumber || weekRangeMeta.startWeek;
                                const slotKey = `${stop.id}__${rec.recommendationId}`;
                                const pendingSlot = pendingScheduleSlot[slotKey] || {
                                  weekNumber: scheduledItem?.weekNumber || defaultWeekForRec,
                                  daySlot: scheduledItem?.daySlot || rec.daySlot,
                                  timeOfDay: scheduledItem?.timeOfDay || rec.timeOfDay,
                                };

                                return (
                                  <motion.div
                                    key={rec.recommendationId}
                                    layout
                                    className={`rounded-2xl border overflow-hidden flex flex-col justify-between transition-all duration-300 ${
                                      isAdded
                                        ? 'bg-emerald-50/35 border-emerald-400/90 shadow-sm ring-1 ring-emerald-400/40'
                                        : 'bg-white border-slate-200/90 hover:border-indigo-300 hover:shadow-md'
                                    }`}
                                  >
                                    <div>
                                      {/* Venue Photo + Star Rating + Google Maps Quick Badge */}
                                      <ResilientScenicBanner
                                        primaryUrl={rec.photoUrl}
                                        gradientFallback={rec.fallbackGradient}
                                        alt={rec.title}
                                        className="h-44"
                                      >
                                        <div className="p-3.5 h-full flex flex-col justify-between">
                                          <div className="flex items-center justify-between gap-2">
                                            <span className="px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md text-white text-[10px] font-extrabold border border-white/15 truncate">
                                              {rec.categoryLabel}
                                            </span>
                                            <div className="flex items-center gap-1.5 shrink-0">
                                              <span className="px-2 py-0.5 rounded-lg bg-amber-400 text-slate-950 font-mono text-[11px] font-extrabold flex items-center gap-1 shadow-2xs">
                                                <Star className="w-3 h-3 fill-slate-950 text-slate-950" />
                                                <span>{rec.rating.toFixed(1)}</span>
                                                <span className="text-[10px] opacity-80">
                                                  ({rec.reviewCount.toLocaleString()})
                                                </span>
                                              </span>
                                              <span className="px-2 py-0.5 rounded-lg bg-slate-950/80 text-teal-300 font-mono text-[10px] font-bold">
                                                {rec.priceRange}
                                              </span>
                                            </div>
                                          </div>

                                          <div className="space-y-0.5">
                                            <div className="flex items-center gap-1 text-[11px] font-semibold text-teal-200">
                                              <MapPin className="w-3 h-3 text-teal-400 shrink-0" />
                                              <span className="truncate">{rec.neighborhood}</span>
                                            </div>
                                            <h4 className="font-heading text-sm sm:text-base font-extrabold text-white leading-snug line-clamp-2">
                                              {rec.title}
                                            </h4>
                                          </div>
                                        </div>
                                      </ResilientScenicBanner>

                                      {/* Venue Description, Insider Tip & Direct Google Maps Link */}
                                      <div className="p-4 space-y-3">
                                        <p className="text-xs text-slate-600 leading-relaxed">
                                          {rec.description}
                                        </p>

                                        <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-950 leading-snug">
                                          <span className="font-extrabold uppercase tracking-wider text-[10px] text-amber-800 block mb-0.5">
                                            💡 Insider Scouting Tip
                                          </span>
                                          {rec.insiderTip}
                                        </div>

                                        {/* Direct Google Maps Link + Add to Relocation Tasks */}
                                        <div className="flex items-center justify-between gap-2 pt-1">
                                          <a
                                            href={rec.googleMapsUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200/80 text-[11px] font-extrabold flex items-center gap-1.5 transition-colors"
                                          >
                                            <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                                            <span>Google Maps &amp; Reviews</span>
                                            <ExternalLink className="w-3 h-3 text-indigo-500 shrink-0" />
                                          </a>

                                          <button
                                            type="button"
                                            onClick={() =>
                                              handlePushWeeklyActivityToTasks(
                                                `${rec.title} (${rec.neighborhood})`,
                                                stop.countryName
                                              )
                                            }
                                            className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-extrabold cursor-pointer transition-colors"
                                            title="Also add as a Relocation Task in Column 2"
                                          >
                                            + Task List
                                          </button>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Schedule Under Week / Day Controls + Add / Remove Itinerary CTA */}
                                    <div className="p-3.5 bg-slate-50/95 border-t border-slate-200/80 space-y-2.5">
                                      <div className="grid grid-cols-2 gap-2">
                                        <div>
                                          <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">
                                            Schedule Week
                                          </label>
                                          <select
                                            value={
                                              isAdded && scheduledItem
                                                ? scheduledItem.weekNumber
                                                : pendingSlot.weekNumber
                                            }
                                            onChange={e => {
                                              const nextWk = Number(e.target.value);
                                              if (isAdded && scheduledItem) {
                                                handleUpdateScheduledItem(scheduledItem.id, {
                                                  weekNumber: nextWk,
                                                });
                                              } else {
                                                setPendingScheduleSlot(prev => ({
                                                  ...prev,
                                                  [slotKey]: {
                                                    ...pendingSlot,
                                                    weekNumber: nextWk,
                                                  },
                                                }));
                                              }
                                            }}
                                            className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                          >
                                            {Array.from(
                                              { length: Math.max(weeklyBlocks.length, weekRangeMeta.endWeek) },
                                              (_, i) => i + 1
                                            ).map(wk => (
                                              <option key={wk} value={wk}>
                                                Week {wk}
                                                {wk >= weekRangeMeta.startWeek &&
                                                wk <= weekRangeMeta.endWeek
                                                  ? ` (${stop.cityFocus || stop.countryName})`
                                                  : ''}
                                              </option>
                                            ))}
                                          </select>
                                        </div>

                                        <div>
                                          <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">
                                            Day Schedule
                                          </label>
                                          <select
                                            value={
                                              isAdded && scheduledItem
                                                ? scheduledItem.daySlot
                                                : pendingSlot.daySlot
                                            }
                                            onChange={e => {
                                              const nextDay = e.target.value;
                                              if (isAdded && scheduledItem) {
                                                handleUpdateScheduledItem(scheduledItem.id, {
                                                  daySlot: nextDay,
                                                });
                                              } else {
                                                setPendingScheduleSlot(prev => ({
                                                  ...prev,
                                                  [slotKey]: {
                                                    ...pendingSlot,
                                                    daySlot: nextDay,
                                                  },
                                                }));
                                              }
                                            }}
                                            className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                          >
                                            {DAY_SLOT_OPTIONS.map(dayOpt => (
                                              <option key={dayOpt} value={dayOpt}>
                                                {dayOpt}
                                              </option>
                                            ))}
                                          </select>
                                        </div>
                                      </div>

                                      {isAdded && scheduledItem ? (
                                        <div className="flex items-center justify-between gap-2">
                                          <span className="px-2.5 py-1.5 rounded-xl bg-emerald-600 text-white text-[11px] font-extrabold flex items-center gap-1.5 flex-1 justify-center">
                                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                            <span>
                                              In Itinerary · Wk {scheduledItem.weekNumber},{' '}
                                              {scheduledItem.daySlot}
                                            </span>
                                          </span>
                                          <button
                                            type="button"
                                            onClick={() => handleRemoveScheduledItem(scheduledItem.id)}
                                            className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200 text-[11px] font-extrabold transition-colors cursor-pointer shrink-0"
                                          >
                                            Remove
                                          </button>
                                        </div>
                                      ) : (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleAddRecommendationToSchedule(
                                              rec,
                                              pendingSlot.weekNumber,
                                              pendingSlot.daySlot,
                                              pendingSlot.timeOfDay as
                                                | 'Morning'
                                                | 'Afternoon'
                                                | 'Evening'
                                                | 'Night'
                                                | 'Full Day'
                                            )
                                          }
                                          className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-teal-600 via-indigo-600 to-violet-600 hover:from-teal-700 hover:to-violet-700 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer transition-all"
                                        >
                                          <Plus className="w-3.5 h-3.5" />
                                          <span>
                                            Add to Week {pendingSlot.weekNumber} · {pendingSlot.daySlot}
                                          </span>
                                        </button>
                                      )}
                                    </div>
                                  </motion.div>
                                );
                              })}
                            </div>

                            {/* Custom Venue / Activity Adder inside the Unified Stop Card */}
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <span className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                                  +
                                </span>
                                <div>
                                  <p className="text-xs font-extrabold text-slate-900">
                                    Add Your Own Pub, Trail, Spot or Operator in{' '}
                                    {stop.cityFocus || stop.countryName}
                                  </p>
                                  <p className="text-[11px] text-slate-500">
                                    Automatically generates a Google Maps link and schedules it under your chosen Week &amp; Day.
                                  </p>
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-2 flex-1 lg:justify-end">
                                <input
                                  type="text"
                                  value={draftCustom.title}
                                  onChange={e =>
                                    setCustomVenueDraft(prev => ({
                                      ...prev,
                                      [stop.id]: { ...draftCustom, title: e.target.value },
                                    }))
                                  }
                                  placeholder="Venue or operator name (e.g. Pergamino Café)..."
                                  className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[200px] flex-1 sm:flex-initial"
                                />
                                <input
                                  type="text"
                                  value={draftCustom.neighborhood}
                                  onChange={e =>
                                    setCustomVenueDraft(prev => ({
                                      ...prev,
                                      [stop.id]: { ...draftCustom, neighborhood: e.target.value },
                                    }))
                                  }
                                  placeholder="Neighborhood (e.g. El Poblado)"
                                  className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-36"
                                />
                                <select
                                  value={draftCustom.weekNumber}
                                  onChange={e =>
                                    setCustomVenueDraft(prev => ({
                                      ...prev,
                                      [stop.id]: {
                                        ...draftCustom,
                                        weekNumber: Number(e.target.value),
                                      },
                                    }))
                                  }
                                  className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-800"
                                >
                                  {stopWeeksArray.map(wk => (
                                    <option key={wk} value={wk}>
                                      Week {wk}
                                    </option>
                                  ))}
                                </select>
                                <select
                                  value={draftCustom.daySlot}
                                  onChange={e =>
                                    setCustomVenueDraft(prev => ({
                                      ...prev,
                                      [stop.id]: { ...draftCustom, daySlot: e.target.value },
                                    }))
                                  }
                                  className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-800"
                                >
                                  {DAY_SLOT_OPTIONS.map(d => (
                                    <option key={d} value={d}>
                                      {d}
                                    </option>
                                  ))}
                                </select>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleAddCustomVenueToStop(stop, weekRangeMeta.startWeek)
                                  }
                                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold cursor-pointer transition-colors shrink-0"
                                >
                                  + Schedule Spot
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}

          {/* 4A-2. COMPLETE CHOSEN ITINERARY VIEW (WEEK & DAY SCHEDULE + SAVE TO DASHBOARD) */}
          {(activeStageTab === 'complete-itinerary' ||
            activeStageTab === 'map-itinerary' ||
            activeStageTab === 'all-in-one') && (
            <div className="rounded-3xl bg-white border-2 border-teal-300/90 p-5 sm:p-7 shadow-lg space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-950 text-[10px] font-extrabold uppercase tracking-wider">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Complete Chosen Itinerary · Week &amp; Day Schedule</span>
                  </div>
                  <h2 className="font-heading text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900">
                    Your Complete Chosen Scouting Itinerary (
                    {(tripDraft.selectedItineraryItems || []).length} Scheduled Places &amp; Activities)
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-3xl">
                    Review every rooftop bar, dating spot, hiking trail, paragliding operator, and relocation audit you’ve selected. Reassign any place to a different Week or Day, open its Google Maps location, or save this complete itinerary to your Dashboard to view and edit anytime.
                  </p>
                </div>

                {/* Save to Dashboard & View Dashboard Primary Actions */}
                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={handleSaveTripClick}
                    disabled={isSavingTrip}
                    className="px-5 py-3 rounded-2xl bg-gradient-to-r from-teal-600 via-indigo-600 to-violet-600 hover:from-teal-700 hover:to-violet-700 text-white text-xs sm:text-sm font-extrabold flex items-center gap-2 shadow-md cursor-pointer transition-all"
                  >
                    <Save className="w-4 h-4" />
                    <span>
                      {isSavingTrip
                        ? 'Saving Itinerary...'
                        : '💾 Save Complete Itinerary to Dashboard'}
                    </span>
                  </button>

                  {isAuthenticated && currentUserId !== 'guest' && (
                    <button
                      type="button"
                      onClick={() => setCurrentView('dashboard')}
                      className="px-4 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <span>View &amp; Edit in My Dashboard</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Filter Bar for Complete Chosen Itinerary */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mr-1">
                    Filter Stop:
                  </span>
                  <button
                    type="button"
                    onClick={() => setCompleteItineraryStopFilter('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                      completeItineraryStopFilter === 'all'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    All Stops ({(tripDraft.selectedItineraryItems || []).length})
                  </button>
                  {computedMetrics.enrichedStops.map(stop => {
                    const count = (tripDraft.selectedItineraryItems || []).filter(
                      i => i.stopId === stop.id
                    ).length;
                    return (
                      <button
                        key={stop.id}
                        type="button"
                        onClick={() => setCompleteItineraryStopFilter(stop.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                          completeItineraryStopFilter === stop.id
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        <span>{stop.countryFlag}</span>
                        <span>
                          {stop.cityFocus || stop.countryName} ({count})
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Week Filter */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mr-1">
                    Week:
                  </span>
                  <button
                    type="button"
                    onClick={() => setCompleteItineraryWeekFilter('all')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                      completeItineraryWeekFilter === 'all'
                        ? 'bg-teal-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    All Weeks
                  </button>
                  {Array.from({ length: Math.max(1, weeklyBlocks.length) }, (_, i) => i + 1).map(
                    wk => (
                      <button
                        key={wk}
                        type="button"
                        onClick={() => setCompleteItineraryWeekFilter(wk)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                          completeItineraryWeekFilter === wk
                            ? 'bg-teal-600 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        Wk {wk}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Scheduled Items Grouped by Week & Day */}
              {(() => {
                const filteredItems = (tripDraft.selectedItineraryItems || [])
                  .filter(item =>
                    completeItineraryStopFilter === 'all'
                      ? true
                      : item.stopId === completeItineraryStopFilter
                  )
                  .filter(item =>
                    completeItineraryWeekFilter === 'all'
                      ? true
                      : item.weekNumber === completeItineraryWeekFilter
                  )
                  .sort((a, b) => {
                    if (a.weekNumber !== b.weekNumber) return a.weekNumber - b.weekNumber;
                    return (
                      DAY_SLOT_OPTIONS.indexOf(a.daySlot) - DAY_SLOT_OPTIONS.indexOf(b.daySlot)
                    );
                  });

                if (filteredItems.length === 0) {
                  return (
                    <div className="p-8 rounded-2xl bg-slate-50 border border-dashed border-slate-300 text-center space-y-2">
                      <p className="text-sm font-bold text-slate-800">
                        No places scheduled for this filter yet.
                      </p>
                      <p className="text-xs text-slate-500">
                        Use the Unified Stop Cards above to add bars, dating spots, hikes, or operators to any Week &amp; Day.
                      </p>
                    </div>
                  );
                }

                const groupedByWeek = new Map<number, ScoutScheduledItineraryItem[]>();
                filteredItems.forEach(item => {
                  const list = groupedByWeek.get(item.weekNumber) || [];
                  list.push(item);
                  groupedByWeek.set(item.weekNumber, list);
                });

                return (
                  <div className="space-y-5">
                    {Array.from(groupedByWeek.entries()).map(([weekNum, items]) => {
                      const sampleItem = items[0];
                      const matchingBlock = weeklyBlocks.find(b => b.weekNumber === weekNum);

                      return (
                        <div
                          key={weekNum}
                          className="rounded-2xl bg-slate-50/80 border border-slate-200/90 overflow-hidden"
                        >
                          <div className="px-4 sm:px-5 py-3 bg-gradient-to-r from-slate-900 via-indigo-950 to-teal-950 text-white flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <span className="px-2.5 py-1 rounded-lg bg-teal-400 text-slate-950 font-mono text-xs font-extrabold">
                                WEEK {weekNum}
                              </span>
                              <span className="text-xs sm:text-sm font-extrabold flex items-center gap-1.5">
                                <span>{sampleItem.countryFlag}</span>
                                <span>
                                  {sampleItem.cityName}, {sampleItem.countryName}
                                </span>
                              </span>
                              {matchingBlock && (
                                <span className="text-[11px] text-teal-200 font-mono hidden sm:inline">
                                  ({matchingBlock.startDate} → {matchingBlock.endDate})
                                </span>
                              )}
                            </div>
                            <span className="text-xs font-mono text-teal-300 font-bold">
                              {items.length} Scheduled {items.length === 1 ? 'Place' : 'Places'}
                            </span>
                          </div>

                          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3.5">
                            {items.map(item => (
                              <div
                                key={item.id}
                                className={`p-3.5 rounded-2xl bg-white border transition-all flex flex-col justify-between gap-3 ${
                                  item.completed
                                    ? 'border-emerald-300 bg-emerald-50/30 opacity-75'
                                    : 'border-slate-200/90 hover:border-indigo-300 shadow-2xs'
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleUpdateScheduledItem(item.id, {
                                        completed: !item.completed,
                                      })
                                    }
                                    className={`mt-1 w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
                                      item.completed
                                        ? 'bg-emerald-600 border-emerald-600 text-white'
                                        : 'bg-white border-slate-300 hover:border-indigo-500'
                                    }`}
                                    title="Mark visited / completed"
                                  >
                                    {item.completed && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                                  </button>

                                  <div className="min-w-0 flex-1 space-y-1">
                                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                                      <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-900 text-[10px] font-extrabold">
                                        {item.categoryLabel}
                                      </span>
                                      <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-950 font-mono text-[10px] font-extrabold flex items-center gap-1">
                                        <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                                        <span>
                                          {item.rating.toFixed(1)} ({item.reviewCount.toLocaleString()})
                                        </span>
                                      </span>
                                    </div>

                                    <h4
                                      className={`font-heading text-sm font-extrabold leading-snug ${
                                        item.completed
                                          ? 'line-through text-slate-400'
                                          : 'text-slate-900'
                                      }`}
                                    >
                                      {item.title}
                                    </h4>

                                    <p className="text-[11px] font-semibold text-teal-800 flex items-center gap-1">
                                      <MapPin className="w-3 h-3 text-teal-600 shrink-0" />
                                      <span>
                                        {item.neighborhood} · {item.cityName}
                                      </span>
                                    </p>

                                    <p className="text-[11px] text-slate-500 line-clamp-2">
                                      {item.description}
                                    </p>
                                  </div>
                                </div>

                                {/* Inline Week/Day Rescheduler + Google Maps Link + Remove Button */}
                                <div className="pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                                  <div className="flex items-center gap-1.5">
                                    <select
                                      value={item.weekNumber}
                                      onChange={e =>
                                        handleUpdateScheduledItem(item.id, {
                                          weekNumber: Number(e.target.value),
                                        })
                                      }
                                      className="px-2 py-1 rounded-lg bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-800"
                                    >
                                      {Array.from(
                                        { length: Math.max(4, weeklyBlocks.length) },
                                        (_, i) => i + 1
                                      ).map(wk => (
                                        <option key={wk} value={wk}>
                                          Week {wk}
                                        </option>
                                      ))}
                                    </select>

                                    <select
                                      value={item.daySlot}
                                      onChange={e =>
                                        handleUpdateScheduledItem(item.id, {
                                          daySlot: e.target.value,
                                        })
                                      }
                                      className="px-2 py-1 rounded-lg bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-800"
                                    >
                                      {DAY_SLOT_OPTIONS.map(d => (
                                        <option key={d} value={d}>
                                          {d}
                                        </option>
                                      ))}
                                    </select>
                                  </div>

                                  <div className="flex items-center gap-1.5">
                                    <a
                                      href={item.googleMapsUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-900 text-[11px] font-extrabold flex items-center gap-1"
                                    >
                                      <MapPin className="w-3 h-3 text-indigo-600" />
                                      <span>Google Maps</span>
                                      <ExternalLink className="w-2.5 h-2.5" />
                                    </a>

                                    <button
                                      type="button"
                                      onClick={() => handleRemoveScheduledItem(item.id)}
                                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
                                      title="Remove from itinerary"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

              {/* Bottom prompt to switch to the 3-Column Execution Workspace */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-teal-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-xs sm:text-sm font-extrabold">
                    Ready to manage your Schengen 90/180 allowance, Accommodation Vault &amp; Packing Checklist?
                  </p>
                  <p className="text-[11px] text-slate-300">
                    Open the 3-Column Execution Workspace to fine-tune arrival dates, tasks, and relocation documents.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveStageTab('workspace')}
                  className="px-4 py-2.5 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Columns3 className="w-4 h-4" />
                  <span>Open 3-Column Trip &amp; Visa Workspace →</span>
                </button>
              </div>
            </div>
          )}

          {/* 4B. 3-COLUMN UNIFIED SNAPSHOT DASHBOARD */}
          {(activeStageTab === 'workspace' || activeStageTab === 'all-in-one') && (
            <div className="space-y-4">
              {/* Section Title Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-600 to-indigo-600 text-white flex items-center justify-center shadow-2xs">
                    <Columns3 className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-heading text-lg sm:text-xl font-extrabold text-slate-900">
                      3-Column Scout Trip &amp; Visa Execution Workspace
                    </h2>
                    <p className="text-xs text-slate-500">
                      Fine-tune stop dates &amp; Schengen limits, check off relocation tasks, and manage accommodation &amp; packing logistics.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveStageTab('map-itinerary')}
                    className="text-xs font-bold text-teal-700 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <CalendarDays className="w-3.5 h-3.5" />
                    <span>← Back to Visual Weekly Itinerary</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setWizardStep('step-2-countries')}
                    className="text-xs font-bold text-indigo-700 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>+ Modify Countries</span>
                  </button>
                </div>
              </div>

              {/* MOBILE SEGMENTED SWITCHER (Zero Horizontal Overflow on Phones) */}
              <div className="lg:hidden bg-slate-100 p-1 rounded-2xl border border-slate-200/90 grid grid-cols-4 gap-1 text-[11px] font-bold">
                {[
                  { id: 'route', label: '1. Route & Visas' },
                  { id: 'tasks', label: '2. Scout Tasks' },
                  { id: 'logistics', label: '3. Vault & Pack' },
                  { id: 'all', label: 'All Columns' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setMobileColumnTab(tab.id as any)}
                    className={`py-2 px-2 rounded-xl transition-all duration-300 text-center cursor-pointer truncate ${
                      mobileColumnTab === tab.id
                        ? 'bg-gradient-to-r from-indigo-600 to-teal-600 text-white font-extrabold shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* ================================================================= */}
              {/* COLUMN 1: MULTI-STOP ROUTE & VISA HOPPER                          */}
              {/* ================================================================= */}
              <div
                className={`space-y-4 ${
                  mobileColumnTab === 'route' || mobileColumnTab === 'all' ? 'block' : 'hidden lg:block'
                }`}
              >
                <div className="rounded-3xl bg-white border border-slate-200/90 p-5 shadow-xs space-y-5">
                  {/* Column 1 Header */}
                  <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-600 to-indigo-600 text-white flex items-center justify-center shadow-2xs shrink-0">
                        <Compass className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="font-heading text-base font-extrabold text-slate-900">
                          1. Multi-Stop Route &amp; Visa Hopper
                        </h2>
                        <p className="text-[11px] text-slate-500">
                          Map 1 to 5 stops · Track Schengen 90/180 &amp; monthly burn
                        </p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-mono text-[11px] font-bold shrink-0">
                      {tripDraft.stops.length}/5 Stops
                    </span>
                  </div>

                  {/* METRICS PILL BAR: Total Days, Living Burn, Live Schengen Counter */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2.5">
                      {/* Metric 1: Total Trip Duration */}
                      <div className="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200/90 space-y-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-indigo-600" />
                          <span>Total Trip Duration</span>
                        </span>
                        <div className="text-xl font-extrabold font-mono text-slate-900 tabular-nums">
                          {computedMetrics.totalDays} Days
                        </div>
                        <span className="text-[11px] text-slate-500 block">
                          ~{(computedMetrics.totalDays / 30).toFixed(1)} months across {tripDraft.stops.length}{' '}
                          {tripDraft.stops.length === 1 ? 'stop' : 'stops'}
                        </span>
                      </div>

                      {/* Metric 2: Estimated Living Burn */}
                      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-50/80 via-teal-50/40 to-white border border-emerald-200/90 space-y-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1">
                          <DollarSign className="w-3 h-3 text-emerald-600" />
                          <span>Estimated Living Burn</span>
                        </span>
                        <div className="text-xl font-extrabold font-mono text-emerald-800 tabular-nums">
                          ${computedMetrics.estimatedTotalBurnUSD.toLocaleString()}
                        </div>
                        <span className="text-[11px] text-emerald-900/80 font-mono block">
                          Avg ${computedMetrics.avgMonthlyBurnUSD.toLocaleString()}/mo (
                          {burnBasisMode === 'nomad'
                            ? 'Nomad'
                            : burnBasisMode === 'retiree-couple'
                            ? 'Couple'
                            : 'Single'}
                          )
                        </span>
                      </div>
                    </div>

                    {/* Metric 3: Live Schengen Visa Counter with Animated Progress Bar */}
                    <div
                      className={`p-4 rounded-2xl border transition-all duration-500 space-y-2.5 ${
                        computedMetrics.schengenStatus === 'safe'
                          ? 'bg-emerald-50/70 border-emerald-300/90 text-emerald-950'
                          : computedMetrics.schengenStatus === 'warning'
                          ? 'bg-amber-50/85 border-amber-300 text-amber-950'
                          : 'bg-rose-50/90 border-rose-300 text-rose-950'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-1.5">
                        <div className="flex items-center gap-1.5">
                          {computedMetrics.schengenStatus === 'safe' ? (
                            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <AlertTriangle
                              className={`w-4 h-4 shrink-0 ${
                                computedMetrics.schengenStatus === 'warning'
                                  ? 'text-amber-600'
                                  : 'text-rose-600'
                              }`}
                            />
                          )}
                          <span className="text-xs font-extrabold uppercase tracking-wider">
                            Live Schengen Visa Counter
                          </span>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-extrabold ${
                            computedMetrics.schengenStatus === 'safe'
                              ? 'bg-emerald-200/80 text-emerald-950'
                              : computedMetrics.schengenStatus === 'warning'
                              ? 'bg-amber-200/90 text-amber-950'
                              : 'bg-rose-600 text-white'
                          }`}
                        >
                          {computedMetrics.schengenDays} / 90 Days
                        </span>
                      </div>

                      {/* Animated Progress Bar */}
                      <div className="w-full h-3 rounded-full bg-white/90 border border-slate-200/80 overflow-hidden p-0.5 shadow-inner">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${schengenProgressPct}%` }}
                          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                          className={`h-full rounded-full ${
                            computedMetrics.schengenStatus === 'safe'
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                              : computedMetrics.schengenStatus === 'warning'
                              ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                              : 'bg-gradient-to-r from-rose-500 to-red-600'
                          }`}
                        />
                      </div>

                      <p className="text-[11px] leading-snug font-medium">
                        {computedMetrics.schengenStatus === 'safe' && (
                          <>
                            <strong>Green Status (&lt;75 Days):</strong> You have{' '}
                            <strong>{Math.max(0, 90 - computedMetrics.schengenDays)} Schengen days</strong>{' '}
                            remaining in your 180-day rolling window.
                          </>
                        )}
                        {computedMetrics.schengenStatus === 'warning' && (
                          <>
                            <strong>Amber Warning (75–89 Days):</strong> You are approaching the 90-day Schengen limit (
                            {90 - computedMetrics.schengenDays} days buffer left). Consider hopping to a non-Schengen haven next.
                          </>
                        )}
                        {computedMetrics.schengenStatus === 'overlimit' && (
                          <>
                            <strong>
                              Red Alert ({computedMetrics.schengenDays} Days &ge; 90-Day Limit):
                            </strong>{' '}
                            Your European Schengen stays exceed the 90/180-day tourist allowance by{' '}
                            <strong>{Math.max(0, computedMetrics.schengenDays - 90)} days</strong>! Swap or hop to a Non-Schengen haven below, or apply for a National D7/DNV Long-Stay Visa.
                          </>
                        )}
                      </p>

                      {(computedMetrics.schengenStatus === 'warning' ||
                        computedMetrics.schengenStatus === 'overlimit') && (
                        <div className="pt-2 border-t border-slate-200/70 space-y-2">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider block">
                            Recommended Non-Schengen Visa Hop Destinations (Pause Schengen Clock):
                          </span>
                          <div className="grid grid-cols-1 gap-1.5">
                            {NON_SCHENGEN_HOP_SUGGESTIONS.slice(0, 4).map(hop => (
                              <div
                                key={hop.countryId}
                                className="p-2 rounded-xl bg-white/95 border border-slate-200/90 flex items-center justify-between gap-2 text-slate-800"
                              >
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                                    <span>{hop.flag}</span>
                                    <span>{hop.name}</span>
                                    <span className="text-[10px] font-mono font-semibold text-teal-800 bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200">
                                      {hop.visaRule}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-slate-500 truncate">{hop.highlight}</p>
                                </div>
                                {tripDraft.stops.length < 5 && (
                                  <button
                                    type="button"
                                    onClick={() => handleAddStop(hop.countryId, hop.visaTag)}
                                    className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[10px] font-bold shrink-0 cursor-pointer transition-colors"
                                  >
                                    + Hop Here
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* STOPS LIST (1 to 5 Stops) */}
                  <div className="space-y-3">
                    <AnimatePresence initial={false}>
                      {computedMetrics.enrichedStops.map((stop, idx) => (
                        <motion.div
                          key={stop.id}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                          className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/90 hover:border-indigo-300/80 transition-all duration-300 space-y-3 relative"
                        >
                          {/* Stop Header */}
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-mono text-xs font-extrabold flex items-center justify-center shrink-0">
                                {idx + 1}
                              </span>
                              <CountryFlag
                                countryName={stop.countryName}
                                fallbackEmoji={stop.countryFlag}
                                size="sm"
                              />
                              <span className="font-heading font-extrabold text-sm text-slate-900 truncate">
                                {stop.countryName}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 ${
                                  stop.isSchengen
                                    ? 'bg-indigo-100 text-indigo-900 border border-indigo-200'
                                    : 'bg-teal-100 text-teal-900 border border-teal-200'
                                }`}
                              >
                                {stop.isSchengen ? '🇪🇺 Schengen' : '🌍 Non-Schengen'}
                              </span>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => navigateToCountry(stop.countryId)}
                                className="px-2 py-1 rounded-lg text-[10px] font-bold text-indigo-700 hover:bg-indigo-50 cursor-pointer"
                                title={`Open full ${stop.countryName} Dossier`}
                              >
                                Dossier →
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveStop(stop.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Remove stop"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Country Selector & Visa Status Tag */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                            <div>
                              <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                                Country Haven
                              </label>
                              <select
                                value={stop.countryId}
                                onChange={e =>
                                  handleUpdateStop(stop.id, { countryId: e.target.value })
                                }
                                className="w-full px-2.5 py-2 rounded-xl bg-white border border-slate-300 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              >
                                {sortedCountries.map(c => (
                                  <option key={c.id} value={c.id}>
                                    {c.flag} {c.name} ($
                                    {getCountryMonthlyRateUSD(c.id, burnBasisMode).toLocaleString()}
                                    /mo)
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                                Visa Status Tag
                              </label>
                              <select
                                value={stop.visaStatusTag}
                                onChange={e =>
                                  handleUpdateStop(stop.id, {
                                    visaStatusTag: e.target.value as ScoutVisaStatusTag,
                                  })
                                }
                                className="w-full px-2.5 py-2 rounded-xl bg-white border border-slate-300 text-xs font-semibold text-indigo-950 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              >
                                {VISA_STATUS_OPTIONS.map(tag => (
                                  <option key={tag} value={tag}>
                                    {tag}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {/* Arrival & Departure Date Pickers */}
                          <div className="grid grid-cols-2 gap-2.5 text-xs">
                            <div>
                              <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                                Arrival Date
                              </label>
                              <input
                                type="date"
                                min={todayIsoDate}
                                value={stop.arrivalDate}
                                onChange={e =>
                                  handleUpdateStop(stop.id, { arrivalDate: e.target.value })
                                }
                                className="w-full px-2.5 py-1.5 rounded-xl bg-white border border-slate-300 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                                Departure Date
                              </label>
                              <input
                                type="date"
                                value={stop.departureDate}
                                min={
                                  stop.arrivalDate && stop.arrivalDate >= todayIsoDate
                                    ? stop.arrivalDate
                                    : todayIsoDate
                                }
                                onChange={e =>
                                  handleUpdateStop(stop.id, { departureDate: e.target.value })
                                }
                                className="w-full px-2.5 py-1.5 rounded-xl bg-white border border-slate-300 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                            </div>
                          </div>

                          {/* City / Neighborhood Focus */}
                          <div>
                            <input
                              type="text"
                              value={stop.cityFocus || ''}
                              onChange={e =>
                                handleUpdateStop(stop.id, { cityFocus: e.target.value })
                              }
                              placeholder="Target cities / neighborhoods to scout (e.g., Lisbon, Lagos, Chania)"
                              className="w-full px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>

                          {/* Stop Summary Pill Footer */}
                          <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                            <div className="flex items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 font-mono font-bold text-slate-900">
                                {stop.days} Days
                              </span>
                              <span className="px-2 py-0.5 rounded-md bg-violet-100/80 text-violet-900 font-semibold text-[10px]">
                                {stop.visaStatusTag}
                              </span>
                            </div>
                            <div className="font-mono text-emerald-800 font-bold">
                              Est. Burn: ${stop.stopBurnUSD.toLocaleString()}{' '}
                              <span className="text-[10px] font-normal text-slate-500">
                                (${stop.monthlyBurnRateUSD.toLocaleString()}/mo)
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {tripDraft.stops.length < 5 ? (
                      <button
                        type="button"
                        onClick={() => handleAddStop()}
                        className="w-full py-3 px-4 rounded-2xl border-2 border-dashed border-indigo-300 hover:border-indigo-500 bg-indigo-50/40 hover:bg-indigo-50/80 text-indigo-900 font-bold text-xs transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Plus className="w-4 h-4 text-indigo-600" />
                        <span>
                          Add Country Stop ({tripDraft.stops.length}/5) — Test Multi-Haven Visa Hop
                        </span>
                      </button>
                    ) : (
                      <div className="p-2.5 rounded-xl bg-slate-100 text-slate-600 text-[11px] text-center font-medium">
                        Maximum of 5 stops reached for a single scouting loop.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ================================================================= */}
              {/* COLUMN 2: SCOUTING TASKS & BUCKET LIST                            */}
              {/* ================================================================= */}
              <div
                className={`space-y-4 ${
                  mobileColumnTab === 'tasks' || mobileColumnTab === 'all' ? 'block' : 'hidden lg:block'
                }`}
              >
                <div className="rounded-3xl bg-white border border-slate-200/90 p-5 shadow-xs space-y-4">
                  {/* Column 2 Header */}
                  <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-2xs shrink-0">
                        <Briefcase className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="font-heading text-base font-extrabold text-slate-900">
                          2. Scouting Tasks &amp; Bucket List
                        </h2>
                        <p className="text-[11px] text-slate-500">
                          On-the-ground due diligence &amp; local experiences
                        </p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-800 font-mono text-[11px] font-bold shrink-0">
                      {completedTasksCount}/{filteredTasks.length} Done
                    </span>
                  </div>

                  {/* Sub-Tabs: "Relocation Tasks" vs "Experiences & Bucket List" */}
                  <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-100 border border-slate-200/80 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setTaskSubTab('relocation')}
                      className={`py-2 px-3 rounded-xl transition-all duration-300 cursor-pointer flex items-center justify-center gap-1.5 ${
                        taskSubTab === 'relocation'
                          ? 'bg-white text-indigo-950 font-extrabold shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>Relocation Tasks</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTaskSubTab('bucket-list')}
                      className={`py-2 px-3 rounded-xl transition-all duration-300 cursor-pointer flex items-center justify-center gap-1.5 ${
                        taskSubTab === 'bucket-list'
                          ? 'bg-white text-violet-950 font-extrabold shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>Experiences &amp; Bucket List</span>
                    </button>
                  </div>

                  {/* 1-Click "+ Add Task" Toggle & Smooth Slide-In Input */}
                  <div>
                    {!showAddTaskInput ? (
                      <button
                        type="button"
                        onClick={() => setShowAddTaskInput(true)}
                        className="w-full py-2.5 px-3.5 rounded-xl bg-indigo-50/80 hover:bg-indigo-100/80 border border-indigo-200/90 text-indigo-950 font-bold text-xs transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-4 h-4 text-indigo-600" />
                        <span>
                          + Add {taskSubTab === 'relocation' ? 'Relocation Task' : 'Experience / Cafe'}
                        </span>
                      </button>
                    ) : (
                      <AnimatePresence>
                        <motion.form
                          initial={{ opacity: 0, y: -10, height: 0 }}
                          animate={{ opacity: 1, y: 0, height: 'auto' }}
                          exit={{ opacity: 0, y: -10, height: 0 }}
                          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                          onSubmit={handleAddTask}
                          className="p-3.5 rounded-2xl bg-slate-50 border border-indigo-200 space-y-2.5 overflow-hidden"
                        >
                          <input
                            type="text"
                            autoFocus
                            value={newTaskTitle}
                            onChange={e => setNewTaskTitle(e.target.value)}
                            placeholder={
                              taskSubTab === 'relocation'
                                ? 'e.g., Test morning commute & noise in Lagos marina...'
                                : 'e.g., Sunset espresso at Miradouro de Santa Catarina...'
                            }
                            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                          <div className="flex items-center justify-between gap-2">
                            <input
                              type="text"
                              value={newTaskTag}
                              onChange={e => setNewTaskTag(e.target.value)}
                              placeholder="Optional tag (e.g., Lisbon, Healthcare, Cafe)"
                              className="flex-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-[11px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => setShowAddTaskInput(false)}
                                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-200/70 cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer"
                              >
                                Add Item
                              </button>
                            </div>
                          </div>
                        </motion.form>
                      </AnimatePresence>
                    )}
                  </div>

                  {/* Checklist Items with Smooth Strike-Through & Opacity Fade */}
                  <div className="space-y-2 max-h-[540px] overflow-y-auto pr-1">
                    <AnimatePresence initial={false}>
                      {filteredTasks.map(task => (
                        <motion.div
                          key={task.id}
                          layout
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.96 }}
                          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                          onClick={() => handleToggleTask(task.id)}
                          className={`group p-3 rounded-2xl border transition-all duration-300 flex items-start justify-between gap-2.5 cursor-pointer select-none ${
                            task.completed
                              ? 'bg-slate-50/70 border-slate-200/70 opacity-60'
                              : 'bg-white border-slate-200/90 hover:border-indigo-300 hover:shadow-2xs'
                          }`}
                        >
                          <div className="flex items-start gap-2.5 min-w-0 flex-1">
                            <div
                              className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-all duration-300 shrink-0 ${
                                task.completed
                                  ? 'bg-emerald-600 border-emerald-600 text-white'
                                  : 'bg-white border-slate-300 group-hover:border-indigo-500'
                              }`}
                            >
                              {task.completed && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p
                                className={`text-xs font-medium leading-snug transition-all duration-300 ${
                                  task.completed ? 'line-through text-slate-400' : 'text-slate-800'
                                }`}
                              >
                                {task.title}
                              </p>
                              {task.countryTag && (
                                <span className="inline-block mt-1 px-2 py-0.2 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold">
                                  {task.countryTag}
                                </span>
                              )}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              handleDeleteTask(task.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer shrink-0"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* ================================================================= */}
              {/* COLUMN 3: LOGISTICS & PACKING VAULT                               */}
              {/* ================================================================= */}
              <div
                className={`space-y-4 ${
                  mobileColumnTab === 'logistics' || mobileColumnTab === 'all'
                    ? 'block'
                    : 'hidden lg:block'
                }`}
              >
                <div className="rounded-3xl bg-white border border-slate-200/90 p-5 shadow-xs space-y-5">
                  {/* Column 3 Header */}
                  <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-2xs shrink-0">
                        <Luggage className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="font-heading text-base font-extrabold text-slate-900">
                          3. Logistics &amp; Packing Vault
                        </h2>
                        <p className="text-[11px] text-slate-500">
                          Basecamp accommodation, apostilled docs &amp; utilities
                        </p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 font-mono text-[11px] font-bold shrink-0">
                      Vault Ready
                    </span>
                  </div>

                  {/* 1. ACCOMMODATION SNAPSHOT */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 via-white to-amber-50/40 border border-slate-200/90 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                        <Home className="w-3.5 h-3.5 text-amber-600" />
                        <span>Accommodation Snapshot</span>
                      </span>
                      {tripDraft.accommodation.bookingLink && (
                        <a
                          href={tripDraft.accommodation.bookingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-bold text-indigo-700 hover:underline flex items-center gap-1"
                        >
                          <span>Open Booking</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>

                    <div className="space-y-2.5 text-xs">
                      <div>
                        <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                          Property Name / Basecamp
                        </label>
                        <input
                          type="text"
                          value={tripDraft.accommodation.propertyName}
                          onChange={e =>
                            setTripDraft(prev => ({
                              ...prev,
                              accommodation: {
                                ...prev.accommodation,
                                propertyName: e.target.value,
                              },
                            }))
                          }
                          placeholder="e.g., Alfama Riverview Loft / Flatio Turnkey Apt"
                          className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                            Check-In Date
                          </label>
                          <input
                            type="date"
                            min={todayIsoDate}
                            value={tripDraft.accommodation.checkInDate}
                            onChange={e => {
                              const nextCheckIn = clampToMinIsoDate(e.target.value, todayIsoDate);
                              setTripDraft(prev => ({
                                ...prev,
                                accommodation: {
                                  ...prev.accommodation,
                                  checkInDate: nextCheckIn,
                                  checkOutDate:
                                    prev.accommodation.checkOutDate < nextCheckIn
                                      ? nextCheckIn
                                      : prev.accommodation.checkOutDate,
                                },
                              }));
                            }}
                            className="w-full px-2.5 py-1.5 rounded-xl bg-white border border-slate-300 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                            Check-Out Date
                          </label>
                          <input
                            type="date"
                            min={
                              tripDraft.accommodation.checkInDate &&
                              tripDraft.accommodation.checkInDate >= todayIsoDate
                                ? tripDraft.accommodation.checkInDate
                                : todayIsoDate
                            }
                            value={tripDraft.accommodation.checkOutDate}
                            onChange={e => {
                              const minOut =
                                tripDraft.accommodation.checkInDate &&
                                tripDraft.accommodation.checkInDate >= todayIsoDate
                                  ? tripDraft.accommodation.checkInDate
                                  : todayIsoDate;
                              setTripDraft(prev => ({
                                ...prev,
                                accommodation: {
                                  ...prev.accommodation,
                                  checkOutDate: clampToMinIsoDate(e.target.value, minOut),
                                },
                              }));
                            }}
                            className="w-full px-2.5 py-1.5 rounded-xl bg-white border border-slate-300 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-1">
                            <KeyRound className="w-3 h-3 text-amber-600" />
                            <span>Host Contact / Door Code</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => setRevealDoorCode(!revealDoorCode)}
                            className="text-[10px] font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                          >
                            {revealDoorCode ? (
                              <EyeOff className="w-3 h-3" />
                            ) : (
                              <Eye className="w-3 h-3" />
                            )}
                            <span>{revealDoorCode ? 'Hide' : 'Show'}</span>
                          </button>
                        </div>
                        <input
                          type={revealDoorCode ? 'text' : 'password'}
                          value={tripDraft.accommodation.hostContactOrDoorCode}
                          onChange={e =>
                            setTripDraft(prev => ({
                              ...prev,
                              accommodation: {
                                ...prev.accommodation,
                                hostContactOrDoorCode: e.target.value,
                              },
                            }))
                          }
                          placeholder="WhatsApp +351... · Lockbox #1234"
                          className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                          Booking Link (Airbnb / Flatio / Booking.com)
                        </label>
                        <input
                          type="url"
                          value={tripDraft.accommodation.bookingLink}
                          onChange={e =>
                            setTripDraft(prev => ({
                              ...prev,
                              accommodation: {
                                ...prev.accommodation,
                                bookingLink: e.target.value,
                              },
                            }))
                          }
                          placeholder="https://..."
                          className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 2. SMART PACKING CHECKLIST */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                        Smart Packing Checklist
                      </span>
                      <span className="text-[11px] font-mono font-bold text-teal-800">
                        {completedPackingCount}/{filteredPacking.length} Packed
                      </span>
                    </div>

                    <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-100 border border-slate-200/80 text-xs font-bold">
                      <button
                        type="button"
                        onClick={() => setPackingSubTab('essentials')}
                        className={`py-1.5 px-2.5 rounded-xl transition-all duration-300 cursor-pointer flex items-center justify-center gap-1.5 ${
                          packingSubTab === 'essentials'
                            ? 'bg-white text-slate-900 font-extrabold shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Luggage className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span>Travel Essentials</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPackingSubTab('documents')}
                        className={`py-1.5 px-2.5 rounded-xl transition-all duration-300 cursor-pointer flex items-center justify-center gap-1.5 ${
                          packingSubTab === 'documents'
                            ? 'bg-white text-slate-900 font-extrabold shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <FileText className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>Relocation Docs</span>
                      </button>
                    </div>

                    {!showAddPackingInput ? (
                      <button
                        type="button"
                        onClick={() => setShowAddPackingInput(true)}
                        className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/90 text-slate-700 font-bold text-xs transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 text-teal-600" />
                        <span>
                          + Add{' '}
                          {packingSubTab === 'essentials'
                            ? 'Travel Essential'
                            : 'Relocation Document'}
                        </span>
                      </button>
                    ) : (
                      <form
                        onSubmit={handleAddPackingItem}
                        className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-200"
                      >
                        <input
                          type="text"
                          autoFocus
                          value={newPackingTitle}
                          onChange={e => setNewPackingTitle(e.target.value)}
                          placeholder="Add item to pack..."
                          className="flex-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                        <button
                          type="submit"
                          className="px-3 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-bold cursor-pointer"
                        >
                          Add
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAddPackingInput(false)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </form>
                    )}

                    <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                      {filteredPacking.map(item => (
                        <div
                          key={item.id}
                          onClick={() => handleTogglePackingItem(item.id)}
                          className={`group p-2.5 rounded-xl border transition-all duration-300 flex items-center justify-between gap-2 cursor-pointer select-none ${
                            item.completed
                              ? 'bg-slate-50/70 border-slate-200/60 opacity-55'
                              : 'bg-white border-slate-200/90 hover:border-teal-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <div
                              className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all duration-300 shrink-0 ${
                                item.completed
                                  ? 'bg-teal-600 border-teal-600 text-white'
                                  : 'bg-white border-slate-300 group-hover:border-teal-500'
                              }`}
                            >
                              {item.completed && <Check className="w-3 h-3 stroke-[2.5]" />}
                            </div>
                            <span
                              className={`text-xs transition-all duration-300 ${
                                item.completed
                                  ? 'line-through text-slate-400'
                                  : 'text-slate-800 font-medium'
                              }`}
                            >
                              {item.title}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              handleDeletePackingItem(item.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-400 hover:text-rose-600 cursor-pointer shrink-0"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 3. BUILT-IN UTILITY LINKS */}
                  <div className="pt-3 border-t border-slate-100 space-y-2.5">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 block">
                      Scouting Field Utilities &amp; Expat Infrastructure
                    </span>

                    <div className="space-y-2">
                      {/* Utility 1: Medical & Travel Insurance -> SafetyWing */}
                      <a
                        href="https://safetywing.com/nomad-insurance"
                        target="_blank"
                        rel="noopener noreferrer sponsored"
                        className="p-3 rounded-2xl bg-gradient-to-r from-teal-50/80 via-white to-teal-50/40 hover:from-teal-100/80 border border-teal-200/90 transition-all duration-300 flex items-center justify-between gap-3 group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                            <HeartPulse className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-extrabold text-slate-900 group-hover:text-teal-900 truncate">
                              Medical &amp; Travel Insurance
                            </p>
                            <p className="text-[11px] text-slate-500 truncate">
                              SafetyWing Nomad &amp; Scouting Coverage (180+ countries)
                            </p>
                          </div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-teal-700 group-hover:translate-x-0.5 transition-transform shrink-0" />
                      </a>

                      {/* Utility 2: Scouting eSIM Connectivity -> Airalo */}
                      <a
                        href="https://www.airalo.com/"
                        target="_blank"
                        rel="noopener noreferrer sponsored"
                        className="p-3 rounded-2xl bg-gradient-to-r from-indigo-50/80 via-white to-indigo-50/40 hover:from-indigo-100/80 border border-indigo-200/90 transition-all duration-300 flex items-center justify-between gap-3 group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                            <Wifi className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-extrabold text-slate-900 group-hover:text-indigo-900 truncate">
                              Scouting eSIM Connectivity
                            </p>
                            <p className="text-[11px] text-slate-500 truncate">
                              Airalo Instant Local &amp; Regional 5G eSIMs
                            </p>
                          </div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-indigo-700 group-hover:translate-x-0.5 transition-transform shrink-0" />
                      </a>

                      {/* Utility 3: Zero-Markup FX Transfers -> Wise */}
                      <a
                        href="https://wise.prf.hn/click/camref:1100l6wa9o"
                        target="_blank"
                        rel="noopener noreferrer sponsored"
                        className="p-3 rounded-2xl bg-gradient-to-r from-emerald-50/80 via-white to-amber-50/40 hover:from-emerald-100/80 border border-emerald-200/90 transition-all duration-300 flex items-center justify-between gap-3 group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                            <DollarSign className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-extrabold text-slate-900 group-hover:text-emerald-900 truncate">
                              Zero-Markup FX Transfers
                            </p>
                            <p className="text-[11px] text-slate-500 truncate">
                              Wise Multi-Currency Account for Rent &amp; Local Spend
                            </p>
                          </div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-emerald-700 group-hover:translate-x-0.5 transition-transform shrink-0" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          )}
        </motion.div>
      )}

      {/* =================================================================== */}
      {/* CONVERSION / AUTH GATE MODAL (FROSTED GLASS BACKDROP)               */}
      {/* =================================================================== */}
      <AnimatePresence>
        {isConversionModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-md rounded-3xl bg-white/95 backdrop-blur-xl border border-indigo-200/90 p-6 sm:p-7 shadow-2xl overflow-hidden my-auto"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 via-indigo-500 to-amber-500" />

              <button
                type="button"
                onClick={() => setIsConversionModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-600 via-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
                  <Save className="w-6 h-6" />
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-heading text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                    Save Your Scouting Roadmap
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Create a free Refirely account to save your route, track visa deadlines, and access your itinerary and packing checklist across all your devices.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 flex items-center justify-between gap-2 text-xs">
                  <div className="min-w-0">
                    <p className="font-bold text-indigo-950 truncate">{tripDraft.title}</p>
                    <p className="text-[11px] text-indigo-800/80 font-mono">
                      {tripDraft.stops.length} stops · {computedMetrics.totalDays} days · Schengen:{' '}
                      {computedMetrics.schengenDays}/90d
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 font-mono font-bold text-[10px] shrink-0">
                    Ready to Sync
                  </span>
                </div>

                {authError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{authError}</span>
                  </div>
                )}

                {/* Option 1: Firebase Google Sign-In */}
                <button
                  type="button"
                  onClick={handleModalGoogleAuth}
                  disabled={isSubmittingAuth}
                  className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 font-bold text-xs sm:text-sm transition-all duration-300 flex items-center justify-center gap-2.5 shadow-2xs cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span>Continue with Google &amp; Save Trip</span>
                </button>

                <div className="relative flex items-center justify-center">
                  <div className="border-t border-slate-200 w-full" />
                  <span className="bg-white px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
                    or with Email &amp; Password
                  </span>
                  <div className="border-t border-slate-200 w-full" />
                </div>

                {/* Mode Switcher: Sign Up vs Log In */}
                <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-100 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => {
                      setConversionAuthMode('signup');
                      setAuthError(null);
                    }}
                    className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                      conversionAuthMode === 'signup'
                        ? 'bg-white text-indigo-950 shadow-2xs font-extrabold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Create Free Account
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setConversionAuthMode('login');
                      setAuthError(null);
                    }}
                    className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                      conversionAuthMode === 'login'
                        ? 'bg-white text-indigo-950 shadow-2xs font-extrabold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Existing Member Log In
                  </button>
                </div>

                {/* Option 2: Email & Password Form */}
                <form onSubmit={handleModalEmailAuth} className="space-y-3 text-xs">
                  {conversionAuthMode === 'signup' && (
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-600 block mb-1">
                        Your Name
                      </label>
                      <div className="relative">
                        <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={authName}
                          onChange={e => setAuthName(e.target.value)}
                          placeholder="Alex Morgan"
                          className="w-full pl-8 pr-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-600 block mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={authEmail}
                        onChange={e => setAuthEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full pl-8 pr-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-600 block mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={authPassword}
                        onChange={e => setAuthPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full pl-8 pr-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingAuth}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-teal-600 via-indigo-600 to-violet-600 hover:from-teal-700 hover:to-violet-700 text-white font-bold text-xs sm:text-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-md cursor-pointer"
                  >
                    {conversionAuthMode === 'signup' ? (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>Create Account &amp; Save Trip to Dashboard</span>
                      </>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4" />
                        <span>Log In &amp; Save Trip to Dashboard</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
