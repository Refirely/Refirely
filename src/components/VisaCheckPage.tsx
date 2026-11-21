import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence, MotionConfig } from 'motion/react';
import { useApp } from '../context/AppContext';
import { CountryFlag } from './CountryFlag';
import {
  FlightRouteArcGraphic,
  MobilityOverviewInfographic,
  MobilityPillarsShowcase,
  PassportBookletGraphic,
} from './VisaCheckInfographics';
import visaHeroAtlasImg from '../assets/images/visa_hero_atlas_1795241177098.jpg';
import {
  getPassportTypesForCountry,
  HELD_VISA_OPTIONS,
  TRAVEL_PURPOSE_OPTIONS,
  VISA_COUNTRY_MAP,
  VISA_WORLD_COUNTRIES,
} from '../data/visaCheckCatalog';
import {
  computeGlobalAccessMatrix,
  evaluateVisaRequirement,
} from '../data/visaCheckEngine';
import {
  GlobalDestinationAccess,
  HeldVisaId,
  TravelPurpose,
  VisaCheckResult,
  VisaRegion,
  VisaRequirementStatus,
  VisaWorldCountry,
} from '../types/visaCheck';
import {
  findFeaturedVisaCorridorBySlug,
  findMatchingFeaturedVisaSlug,
} from '../data/seoRoutes';
import { PUBLIC_SITE_ORIGIN, updateVisaCheckRouteSeo } from '../utils/seo';
import { trackAnalyticsEvent } from '../utils/analytics';
import {
  ArrowLeftRight,
  ArrowRight,
  BookOpen,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Compass,
  Copy,
  ExternalLink,
  FileCheck2,
  Globe,
  Info,
  Landmark,
  Plane,
  RotateCcw,
  Scale,
  Search,
  ShieldAlert,
  ShieldCheck,
  Stamp,
  Ticket,
  X,
} from 'lucide-react';

// ============================================================================
// REUSABLE SEARCHABLE COUNTRY COMBOBOX
// ============================================================================

interface CountryComboboxProps {
  id: string;
  label: string;
  value: string;
  onChange: (code: string) => void;
  placeholder?: string;
}

const CountryCombobox: React.FC<CountryComboboxProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder = 'Search country or ISO code...',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedCountry = VISA_COUNTRY_MAP.get(value);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, []);

  const filteredCountries = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return VISA_WORLD_COUNTRIES;
    return VISA_WORLD_COUNTRIES.filter(
      c =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase() === q ||
        c.region.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div className="relative" ref={containerRef}>
      <label
        htmlFor={id}
        className="block text-xs font-semibold text-slate-700 mb-1.5"
      >
        {label}
      </label>
      <button
        id={id}
        type="button"
        onClick={() => {
          setIsOpen(prev => {
            const next = !prev;
            if (next) {
              setQuery('');
              setTimeout(() => inputRef.current?.focus(), 20);
            }
            return next;
          });
        }}
        className="w-full min-h-[46px] px-3.5 py-2.5 rounded-xl bg-white border border-slate-300/90 hover:border-indigo-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-colors flex items-center justify-between gap-2 text-left cursor-pointer"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        {selectedCountry ? (
          <span className="flex items-center gap-2.5 min-w-0">
            <CountryFlag
              countryCode={selectedCountry.code}
              countryName={selectedCountry.name}
              fallbackEmoji={selectedCountry.flag}
              size="md"
              className="rounded-xs shadow-2xs"
            />
            <span className="font-semibold text-sm text-slate-900 truncate">
              {selectedCountry.name}
            </span>
            <span className="text-xs font-mono text-slate-400 shrink-0">
              {selectedCountry.code}
            </span>
          </span>
        ) : (
          <span className="text-sm text-slate-400">{placeholder}</span>
        )}
        <ChevronDown
          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-150 ${
            isOpen ? 'rotate-180 text-indigo-600' : ''
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.14 }}
            className="absolute left-0 right-0 mt-1.5 z-50 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden"
          >
            <div className="p-2 border-b border-slate-100 bg-slate-50/70">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-slate-400 absolute left-2.5 pointer-events-none" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder={placeholder}
                  className="w-full pl-8 pr-7 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="absolute right-2 p-0.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    aria-label="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
            <ul
              role="listbox"
              className="max-h-64 overflow-y-auto divide-y divide-slate-100/70 py-1"
            >
              {filteredCountries.length === 0 ? (
                <li className="px-3.5 py-4 text-xs text-slate-500 text-center">
                  No countries match &ldquo;{query}&rdquo;
                </li>
              ) : (
                filteredCountries.map(country => {
                  const isSelected = country.code === value;
                  return (
                    <li key={country.code}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => {
                          onChange(country.code);
                          setIsOpen(false);
                          setQuery('');
                        }}
                        className={`w-full px-3.5 py-2.5 text-left flex items-center justify-between gap-2 text-sm transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-50 text-indigo-950 font-semibold'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span className="flex items-center gap-2.5 min-w-0">
                          <CountryFlag
                            countryCode={country.code}
                            countryName={country.name}
                            fallbackEmoji={country.flag}
                            size="sm"
                            className="rounded-xs"
                          />
                          <span className="truncate">{country.name}</span>
                        </span>
                        <span className="text-[11px] text-slate-400 shrink-0 font-mono">
                          {country.region} · {country.code}
                        </span>
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================================================
// STATUS PRESENTATION HELPERS (ALWAYS ICON + TEXT + SEMANTIC COLOR)
// ============================================================================

function getStatusVisuals(status: VisaRequirementStatus) {
  switch (status) {
    case 'domestic':
    case 'freedom_of_movement':
      return {
        label: status === 'domestic' ? 'Domestic Citizen' : 'Freedom of Movement',
        shortLabel: status === 'domestic' ? 'Domestic' : 'Free Movement',
        bannerBg: 'bg-gradient-to-br from-emerald-50 via-teal-50/85 to-sky-50/70 border-emerald-200/90',
        cardTopBar: 'bg-gradient-to-r from-emerald-500 to-teal-500',
        cardTint: 'hover:bg-emerald-50/40',
        headerText: 'text-emerald-950',
        subText: 'text-emerald-900/90',
        accentText: 'text-emerald-700',
        iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm',
        Icon: ShieldCheck,
      };
    case 'visa_free':
      return {
        label: 'No Visa Required (Visa-Free)',
        shortLabel: 'Visa-Free',
        bannerBg: 'bg-gradient-to-br from-emerald-50 via-teal-50/80 to-emerald-50/60 border-emerald-200/90',
        cardTopBar: 'bg-gradient-to-r from-emerald-500 to-teal-500',
        cardTint: 'hover:bg-emerald-50/40',
        headerText: 'text-emerald-950',
        subText: 'text-emerald-900/90',
        accentText: 'text-emerald-700',
        iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm',
        Icon: CheckCircle2,
      };
    case 'visa_free_conditional':
      return {
        label: 'Visa-Free (Conditional / Held Visa Waiver)',
        shortLabel: 'Visa-Free Waiver',
        bannerBg: 'bg-gradient-to-br from-teal-50 via-cyan-50/85 to-sky-50/70 border-teal-200/90',
        cardTopBar: 'bg-gradient-to-r from-teal-500 to-cyan-500',
        cardTint: 'hover:bg-teal-50/45',
        headerText: 'text-teal-950',
        subText: 'text-teal-900/90',
        accentText: 'text-teal-700',
        iconBg: 'bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-sm',
        Icon: CheckCircle2,
      };
    case 'eta_required':
      return {
        label: 'Electronic Travel Authorization (eTA / ESTA)',
        shortLabel: 'eTA / ESTA',
        bannerBg: 'bg-gradient-to-br from-sky-50 via-blue-50/80 to-indigo-50/70 border-sky-200/90',
        cardTopBar: 'bg-gradient-to-r from-sky-500 to-blue-500',
        cardTint: 'hover:bg-sky-50/45',
        headerText: 'text-sky-950',
        subText: 'text-sky-900/90',
        accentText: 'text-sky-700',
        iconBg: 'bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-sm',
        Icon: Ticket,
      };
    case 'visa_on_arrival':
      return {
        label: 'Visa on Arrival Available',
        shortLabel: 'Visa on Arrival',
        bannerBg: 'bg-gradient-to-br from-indigo-50 via-violet-50/80 to-sky-50/70 border-indigo-200/90',
        cardTopBar: 'bg-gradient-to-r from-indigo-500 to-violet-500',
        cardTint: 'hover:bg-indigo-50/45',
        headerText: 'text-indigo-950',
        subText: 'text-indigo-900/90',
        accentText: 'text-indigo-700',
        iconBg: 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm',
        Icon: Stamp,
      };
    case 'e_visa':
      return {
        label: 'Online e-Visa Required',
        shortLabel: 'Online e-Visa',
        bannerBg: 'bg-gradient-to-br from-amber-50 via-orange-50/75 to-yellow-50/70 border-amber-200/90',
        cardTopBar: 'bg-gradient-to-r from-amber-500 to-orange-500',
        cardTint: 'hover:bg-amber-50/45',
        headerText: 'text-amber-950',
        subText: 'text-amber-950/85',
        accentText: 'text-amber-700',
        iconBg: 'bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-sm',
        Icon: FileCheck2,
      };
    case 'visa_required':
      return {
        label: 'Embassy / Consular Visa Required',
        shortLabel: 'Visa Required',
        bannerBg: 'bg-gradient-to-br from-rose-50 via-pink-50/75 to-amber-50/55 border-rose-200/90',
        cardTopBar: 'bg-gradient-to-r from-rose-500 to-pink-500',
        cardTint: 'hover:bg-rose-50/40',
        headerText: 'text-rose-950',
        subText: 'text-rose-900/90',
        accentText: 'text-rose-700',
        iconBg: 'bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-sm',
        Icon: ShieldAlert,
      };
  }
}

// ============================================================================
// POPULAR QUICK-CHECK PRESETS (DEMONSTRATES BILATERAL + HELD VISA POWER)
// ============================================================================

interface QuickScenario {
  label: string;
  originCode: string;
  destinationCode: string;
  passportCategoryHint?: string;
  heldVisas: HeldVisaId[];
  purpose: TravelPurpose;
}

const QUICK_SCENARIOS: QuickScenario[] = [
  {
    label: 'India + U.S. Visa → Mexico',
    originCode: 'IN',
    destinationCode: 'MX',
    passportCategoryHint: 'in_ordinary',
    heldVisas: ['us_visa'],
    purpose: 'tourism',
  },
  {
    label: 'India Official (White) → Hungary',
    originCode: 'IN',
    destinationCode: 'HU',
    passportCategoryHint: 'in_official',
    heldVisas: [],
    purpose: 'official_duty',
  },
  {
    label: 'India Diplomatic → Portugal',
    originCode: 'IN',
    destinationCode: 'PT',
    passportCategoryHint: 'in_diplomatic',
    heldVisas: [],
    purpose: 'official_duty',
  },
  {
    label: 'Türkiye Green Passport → Spain',
    originCode: 'TR',
    destinationCode: 'ES',
    passportCategoryHint: 'tr_special',
    heldVisas: [],
    purpose: 'tourism',
  },
  {
    label: 'India + Schengen → Cyprus',
    originCode: 'IN',
    destinationCode: 'CY',
    passportCategoryHint: 'in_ordinary',
    heldVisas: ['schengen_visa'],
    purpose: 'tourism',
  },
  {
    label: 'U.S. Citizen → Portugal (Retirement)',
    originCode: 'US',
    destinationCode: 'PT',
    passportCategoryHint: 'us_ordinary',
    heldVisas: [],
    purpose: 'retirement',
  },
];

// ============================================================================
// SEO FAQ DATA
// ============================================================================

const VISA_CHECK_FAQS = [
  {
    q: 'Which countries grant visa-free or simplified entry if I hold a valid U.S. B1/B2 or Schengen visa?',
    a: 'Holding a valid multiple-entry U.S. visa (B1/B2, H1B, F1, or Green Card) or Schengen Type C visa unlocks over 35 countries for many visa-required nationalities. Popular destinations include Mexico (up to 180 days), Costa Rica (30 days with US/Canada visa), Panama (30 days with a previously used multi-entry visa), Dominican Republic, Serbia, Montenegro, Albania, Bosnia & Herzegovina, North Macedonia, Georgia (90 days), Cyprus (with double/multi-entry Schengen), UAE 14-day Visa on Arrival (for Indian nationals), Philippines 14-day visa-free (for Indian nationals), Saudi Arabia Visa on Arrival (with used US/UK/Schengen visa), and fast online Türkiye and Morocco e-Visas.',
  },
  {
    q: 'Besides U.S. and Schengen visas, what other visas unlock third-country travel privileges?',
    a: 'Several major visas carry powerful third-country reciprocity: a valid UK Visa unlocks Ireland (under BIVS / Short Stay Visa Waiver Programme), Mexico, Serbia, Montenegro, Albania, Georgia, Saudi Arabia VoA, and UAE VoA for Indian citizens; a Canadian Visa/PR unlocks Mexico, Costa Rica, Panama, Dominican Republic, Peru, and Georgia; Japan and Australia/New Zealand visas unlock Mexico, Panama, Philippines (14 days for Indian nationals), Taiwan free TAC, and Singapore 96-hour Visa-Free Transit; GCC Residence Permits unlock Georgia (90 days), Oman, Bahrain, Saudi e-Visa, and Azerbaijan VoA; and the APEC Business Travel Card grants 60–90 day business entry across 19 Asia-Pacific economies.',
  },
  {
    q: 'Why do Diplomatic, Official, Service, and Special passports have different visa requirements?',
    a: 'Sovereign states negotiate Bilateral Visa Waiver Agreements (BVWA) specifically by passport class—and many agreements apply ONLY to Diplomatic passports while excluding Official/Service passports. For example, India’s Ministry of External Affairs (MEA) maintains separate lists: countries like Portugal, Germany, France, Italy, Spain, Switzerland, and Japan exempt Indian Diplomatic (Maroon) passports ONLY, whereas countries like Hungary, Croatia, Cyprus, Bulgaria, Singapore, Brazil, and the UAE exempt both Diplomatic and Official (White) passports. Similarly, Türkiye’s Special (Green / Hususi) passport allows visa-free entry across the Schengen Area where ordinary burgundy passports require a Schengen visa.',
  },
  {
    q: 'Does a U.S. Passport Card or German Temporary (Green) Passport have restrictions?',
    a: 'Yes. Selecting the exact passport booklet type matters greatly. A U.S. Passport Card is strictly valid for land and sea border crossings to Canada, Mexico, Bermuda, and the Caribbean—airlines cannot accept it for international flights. Similarly, Germany’s non-biometric green Temporary Passport (Vorläufiger Reisepass) does not qualify for U.S. ESTA and requires a full U.S. consular visa.',
  },
  {
    q: 'What is the difference between Visa-Free, eTA/ESTA, Visa on Arrival, and e-Visa?',
    a: 'Visa-Free means you arrive with only your eligible passport (and any free digital arrival card). An eTA / ESTA (e.g., U.S. ESTA, UK ETA, Canada eTA, Australia ETA, NZeTA) is a fast, low-cost electronic pre-travel clearance required for visa-exempt nationals before boarding. Visa on Arrival is issued at the destination airport or land border upon paying a fee. An e-Visa is an official electronic visa approved online prior to departure without visiting an embassy.',
  },
  {
    q: 'Can I work remotely or retire abroad on a visa-free tourist entry?',
    a: 'Short-stay tourist exemptions are designed for leisure, family visits, and exploratory scouting—not permanent relocation or local employment. If you plan to stay long-term as a Digital Nomad or Early Retiree (FIRE), select "Digital Nomad / Remote Work" or "Retirement / Long-Stay Relocation" in the Purpose field above to view dedicated DNV and Passive Income residency pathways alongside official ReFirely country dossiers.',
  },
];

type ExplorerFilterTab =
  | 'accessible'
  | 'visa_free'
  | 'unlocked_bonus'
  | 'eta_voa'
  | 'e_visa'
  | 'visa_required';

export const VisaCheckPage: React.FC = () => {
  const { navigateToCountry, userProfile } = useApp();

  // Resolve initial state from clean /visa-check/<slug> paths, URL query params, or user profile
  const initialSelection = useMemo(() => {
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
    const pathSegments = pathname.split('/').filter(Boolean);
    const matchedSlugCorridor =
      pathSegments[0]?.toLowerCase() === 'visa-check' && pathSegments[1]
        ? findFeaturedVisaCorridorBySlug(pathSegments[1])
        : undefined;

    const params =
      typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const urlFrom = params?.get('from')?.trim().toUpperCase() || matchedSlugCorridor?.originCode;
    const urlTo = params?.get('to')?.trim().toUpperCase() || matchedSlugCorridor?.destinationCode;
    const urlPassport = params?.get('passport')?.trim() || matchedSlugCorridor?.passportTypeId;
    const urlPurpose = params?.get('purpose')?.trim() as TravelPurpose | undefined;
    const queryVisas = params
      ?.get('visas')
      ?.split(',')
      .map(s => s.trim())
      .filter(Boolean) as HeldVisaId[] | undefined;
    const urlVisas: HeldVisaId[] | undefined =
      queryVisas && queryVisas.length > 0 ? queryVisas : matchedSlugCorridor?.heldVisas;

    // Infer origin from user profile if available, else India/US default
    let defaultOrigin = 'IN';
    if (urlFrom && VISA_COUNTRY_MAP.has(urlFrom)) {
      defaultOrigin = urlFrom;
    } else if (userProfile.originCountry) {
      const match = VISA_WORLD_COUNTRIES.find(
        c => c.name.toLowerCase() === userProfile.originCountry.trim().toLowerCase()
      );
      if (match) defaultOrigin = match.code;
    }

    let defaultDest = defaultOrigin === 'PT' ? 'JP' : 'PT';
    if (urlTo && VISA_COUNTRY_MAP.has(urlTo)) {
      defaultDest = urlTo;
    } else if (userProfile.targetCountry) {
      const match = VISA_WORLD_COUNTRIES.find(
        c => c.name.toLowerCase() === userProfile.targetCountry.trim().toLowerCase()
      );
      if (match && match.code !== defaultOrigin) defaultDest = match.code;
    }

    const originPassports = getPassportTypesForCountry(defaultOrigin);
    const defaultPassportId =
      urlPassport && originPassports.some(p => p.id === urlPassport)
        ? urlPassport
        : originPassports[0].id;

    const validPurposes = new Set(TRAVEL_PURPOSE_OPTIONS.map(o => o.id));
    const defaultPurpose: TravelPurpose =
      urlPurpose && validPurposes.has(urlPurpose) ? urlPurpose : 'tourism';

    const validVisas = new Set(HELD_VISA_OPTIONS.map(v => v.id));
    const defaultVisas: HeldVisaId[] = (urlVisas || []).filter(v => validVisas.has(v));

    return {
      originCode: defaultOrigin,
      destinationCode: defaultDest,
      passportTypeId: defaultPassportId,
      purpose: defaultPurpose,
      heldVisas: defaultVisas,
      fromDeepLink: Boolean(matchedSlugCorridor || (urlFrom && urlTo)),
    };
  }, [userProfile.originCountry, userProfile.targetCountry]);

  // Form states
  const [originCode, setOriginCode] = useState<string>(initialSelection.originCode);
  const [destinationCode, setDestinationCode] = useState<string>(initialSelection.destinationCode);
  const [passportTypeId, setPassportTypeId] = useState<string>(initialSelection.passportTypeId);
  const [purpose, setPurpose] = useState<TravelPurpose>(initialSelection.purpose);
  const [heldVisas, setHeldVisas] = useState<HeldVisaId[]>(initialSelection.heldVisas);
  const [showAllHeldVisas, setShowAllHeldVisas] = useState<boolean>(
    initialSelection.heldVisas.some(v => v !== 'us_visa' && v !== 'schengen_visa')
  );

  // Active evaluated result (pre-populated on load so zero empty dead state, and updates cleanly on Submit)
  const [submittedInput, setSubmittedInput] = useState({
    originCode: initialSelection.originCode,
    destinationCode: initialSelection.destinationCode,
    passportTypeId: initialSelection.passportTypeId,
    purpose: initialSelection.purpose,
    heldVisas: initialSelection.heldVisas,
  });
  // Only override hub /?view=visa-check canonical SEO when deep-linked to a specific route or after user actively checks a route
  const [hasRouteSelection, setHasRouteSelection] = useState<boolean>(initialSelection.fromDeepLink);

  // Global Access Explorer filters
  const [explorerTab, setExplorerTab] = useState<ExplorerFilterTab>('accessible');
  const [explorerRegion, setExplorerRegion] = useState<VisaRegion | 'All'>('All');
  const [explorerSearch, setExplorerSearch] = useState<string>('');
  const [visibleCount, setVisibleCount] = useState<number>(36);

  // UI feedback states
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);
  const [heroImgFailed, setHeroImgFailed] = useState<boolean>(false);
  const verdictRef = useRef<HTMLDivElement>(null);

  // Country-specific passport types for currently chosen Nationality
  const availablePassports = useMemo(
    () => getPassportTypesForCountry(originCode),
    [originCode]
  );

  const selectedPassportObj = useMemo(
    () => availablePassports.find(p => p.id === passportTypeId) || availablePassports[0],
    [availablePassports, passportTypeId]
  );

  // When Nationality changes, automatically load that country's passport types & reset passportTypeId cleanly
  const handleOriginChange = (newCode: string) => {
    setOriginCode(newCode);
    const nextPassports = getPassportTypesForCountry(newCode);
    // Preserve diplomatic/official intent if user had chosen diplomatic/official before
    const currentCategory = selectedPassportObj?.category;
    const matchingCategory = nextPassports.find(p => p.category === currentCategory);
    setPassportTypeId(matchingCategory ? matchingCategory.id : nextPassports[0].id);
  };

  const handleSwapCountries = () => {
    const prevOrigin = originCode;
    const prevDest = destinationCode;
    handleOriginChange(prevDest);
    setDestinationCode(prevOrigin);
  };

  const toggleHeldVisa = (visaId: HeldVisaId) => {
    setHeldVisas(prev =>
      prev.includes(visaId) ? prev.filter(v => v !== visaId) : [...prev, visaId]
    );
  };

  // Compute primary verdict from submittedInput
  const verdict: VisaCheckResult = useMemo(
    () => evaluateVisaRequirement(submittedInput),
    [submittedInput]
  );

  // Compute complete 205-country global travel access list for submitted passport + held visas
  const globalAccessList: GlobalDestinationAccess[] = useMemo(
    () =>
      computeGlobalAccessMatrix(
        submittedInput.originCode,
        submittedInput.passportTypeId,
        submittedInput.heldVisas,
        submittedInput.purpose
      ),
    [
      submittedInput.originCode,
      submittedInput.passportTypeId,
      submittedInput.heldVisas,
      submittedInput.purpose,
    ]
  );

  // Summary metrics across all world destinations
  const mobilityStats = useMemo(() => {
    let visaFreeTotal = 0;
    let etaOrVoaTotal = 0;
    let eVisaTotal = 0;
    let visaRequiredTotal = 0;
    let unlockedByHeldVisaCount = 0;
    let unlockedByPassportTierCount = 0;

    for (const item of globalAccessList) {
      if (
        item.status === 'freedom_of_movement' ||
        item.status === 'visa_free' ||
        item.status === 'visa_free_conditional'
      ) {
        visaFreeTotal++;
      } else if (item.status === 'eta_required' || item.status === 'visa_on_arrival') {
        etaOrVoaTotal++;
      } else if (item.status === 'e_visa') {
        eVisaTotal++;
      } else {
        visaRequiredTotal++;
      }

      if (item.unlockedByHeldVisa) unlockedByHeldVisaCount++;
      if (item.unlockedByBilateralPassport) unlockedByPassportTierCount++;
    }

    return {
      totalDestinations: globalAccessList.length,
      totalAccessibleNoEmbassy: visaFreeTotal + etaOrVoaTotal + eVisaTotal,
      visaFreeTotal,
      etaOrVoaTotal,
      eVisaTotal,
      visaRequiredTotal,
      unlockedByHeldVisaCount,
      unlockedByPassportTierCount,
      totalBonusUnlocked: unlockedByHeldVisaCount + unlockedByPassportTierCount,
    };
  }, [globalAccessList]);

  // Filtered global explorer cards
  const filteredDestinations = useMemo(() => {
    const q = explorerSearch.trim().toLowerCase();
    return globalAccessList.filter(item => {
      if (explorerRegion !== 'All' && item.destination.region !== explorerRegion) {
        return false;
      }
      if (q) {
        const matchesQuery =
          item.destination.name.toLowerCase().includes(q) ||
          item.destination.code.toLowerCase() === q ||
          item.shortNote.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }
      switch (explorerTab) {
        case 'accessible':
          return item.status !== 'visa_required';
        case 'visa_free':
          return (
            item.status === 'freedom_of_movement' ||
            item.status === 'visa_free' ||
            item.status === 'visa_free_conditional'
          );
        case 'unlocked_bonus':
          return Boolean(item.unlockedByHeldVisa || item.unlockedByBilateralPassport);
        case 'eta_voa':
          return item.status === 'eta_required' || item.status === 'visa_on_arrival';
        case 'e_visa':
          return item.status === 'e_visa';
        case 'visa_required':
          return item.status === 'visa_required';
      }
    });
  }, [globalAccessList, explorerTab, explorerRegion, explorerSearch]);

  // Update SEO metadata whenever a deep-linked or actively submitted route check is shown
  useEffect(() => {
    if (!hasRouteSelection) return;
    const heldLabels = verdict.heldVisas
      .map(id => HELD_VISA_OPTIONS.find(v => v.id === id)?.shortLabel)
      .filter((v): v is string => Boolean(v));

    updateVisaCheckRouteSeo({
      originName: verdict.origin.name,
      originCode: verdict.origin.code,
      destinationName: verdict.destination.name,
      destinationCode: verdict.destination.code,
      passportLabel: verdict.passportType.label,
      passportTypeId: verdict.passportType.id,
      isDefaultPassport: verdict.passportType.category === 'ordinary',
      statusHeadline: verdict.headline,
      heldVisasLabels: heldLabels,
      heldVisasIds: verdict.heldVisas,
      totalAccessibleCountries: mobilityStats.totalAccessibleNoEmbassy,
      visaFreeCountries: mobilityStats.visaFreeTotal,
    });
  }, [verdict, hasRouteSelection, mobilityStats.totalAccessibleNoEmbassy, mobilityStats.visaFreeTotal]);

  const buildCleanVisaRoutePath = (next: typeof submittedInput): string => {
    const passports = getPassportTypesForCountry(next.originCode);
    const selectedPassport = passports.find(p => p.id === next.passportTypeId) || passports[0];
    const isDefaultPassport = selectedPassport.category === 'ordinary';
    const matchedSlug =
      next.purpose === 'tourism'
        ? findMatchingFeaturedVisaSlug({
            originCode: next.originCode,
            destinationCode: next.destinationCode,
            passportTypeId: next.passportTypeId,
            isDefaultPassport,
            heldVisas: next.heldVisas,
          })
        : undefined;

    if (matchedSlug) {
      return `/visa-check/${matchedSlug}`;
    }

    const params = new URLSearchParams();
    params.set('from', next.originCode);
    params.set('to', next.destinationCode);
    if (!isDefaultPassport) params.set('passport', next.passportTypeId);
    if (next.purpose !== 'tourism') params.set('purpose', next.purpose);
    if (next.heldVisas.length > 0) params.set('visas', next.heldVisas.join(','));
    return `/visa-check?${params.toString()}`;
  };

  const syncBrowserQueryParams = (next: typeof submittedInput) => {
    if (typeof window === 'undefined') return;
    const cleanPath = buildCleanVisaRoutePath(next);
    try {
      window.history.replaceState({ view: 'visa-check' }, '', cleanPath);
    } catch {
      // Ignore if restricted in iframe
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextInput = {
      originCode,
      destinationCode,
      passportTypeId,
      purpose,
      heldVisas,
    };
    setHasRouteSelection(true);
    setSubmittedInput(nextInput);
    setVisibleCount(36);
    syncBrowserQueryParams(nextInput);

    trackAnalyticsEvent('visa_check_submit', {
      origin: originCode,
      destination: destinationCode,
      passport_type: passportTypeId,
      purpose,
      held_visas_count: heldVisas.length,
    });

    setTimeout(() => {
      verdictRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  };

  const handleApplyScenario = (scenario: QuickScenario) => {
    const passports = getPassportTypesForCountry(scenario.originCode);
    const matchedPassport =
      passports.find(p => p.id === scenario.passportCategoryHint) || passports[0];

    setOriginCode(scenario.originCode);
    setDestinationCode(scenario.destinationCode);
    setPassportTypeId(matchedPassport.id);
    setPurpose(scenario.purpose);
    setHeldVisas(scenario.heldVisas);

    const nextInput = {
      originCode: scenario.originCode,
      destinationCode: scenario.destinationCode,
      passportTypeId: matchedPassport.id,
      purpose: scenario.purpose,
      heldVisas: scenario.heldVisas,
    };
    setHasRouteSelection(true);
    setSubmittedInput(nextInput);
    setVisibleCount(36);
    syncBrowserQueryParams(nextInput);

    setTimeout(() => {
      verdictRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  };

  const handleReset = () => {
    const defaultOrigin = 'IN';
    const defaultDest = 'PT';
    const defaultPassport = getPassportTypesForCountry(defaultOrigin)[0].id;
    setOriginCode(defaultOrigin);
    setDestinationCode(defaultDest);
    setPassportTypeId(defaultPassport);
    setPurpose('tourism');
    setHeldVisas([]);
    setExplorerTab('accessible');
    setExplorerRegion('All');
    setExplorerSearch('');
    const nextInput = {
      originCode: defaultOrigin,
      destinationCode: defaultDest,
      passportTypeId: defaultPassport,
      purpose: 'tourism' as TravelPurpose,
      heldVisas: [] as HeldVisaId[],
    };
    setHasRouteSelection(true);
    setSubmittedInput(nextInput);
    syncBrowserQueryParams(nextInput);
  };

  const handleInspectDestinationFromExplorer = (dest: VisaWorldCountry) => {
    setDestinationCode(dest.code);
    const nextInput = {
      ...submittedInput,
      destinationCode: dest.code,
    };
    setHasRouteSelection(true);
    setSubmittedInput(nextInput);
    syncBrowserQueryParams(nextInput);
    verdictRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleCopyShareUrl = () => {
    const cleanPath = buildCleanVisaRoutePath(submittedInput);
    const fullUrl = `${PUBLIC_SITE_ORIGIN}${cleanPath}`;
    navigator.clipboard?.writeText(fullUrl).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2200);
    });
  };

  const statusVisual = getStatusVisuals(verdict.status);
  const StatusIcon = statusVisual.Icon;
  const hasUnsavedChanges =
    originCode !== submittedInput.originCode ||
    destinationCode !== submittedInput.destinationCode ||
    passportTypeId !== submittedInput.passportTypeId ||
    purpose !== submittedInput.purpose ||
    heldVisas.join(',') !== submittedInput.heldVisas.join(',');

  const visibleHeldVisaOptions = showAllHeldVisas
    ? HELD_VISA_OPTIONS
    : HELD_VISA_OPTIONS.slice(0, 4);

  return (
    <MotionConfig reducedMotion="user">
      <main className="min-h-screen overflow-x-clip bg-gradient-to-b from-sky-50/75 via-indigo-50/35 to-teal-50/55 pb-20">
        {/* ================================================================== */}
        {/* SUNLIT HERO & INTERACTIVE VISA CHECKER FORM                        */}
        {/* ================================================================== */}
        <section className="relative overflow-hidden border-b border-indigo-200/75 bg-gradient-to-br from-indigo-50/95 via-sky-50/85 to-teal-50/90">
          {/* Luminous Daylight Mesh & Subtle Geometric Latitude Lines (Strictly Light) */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-28 -right-24 w-96 h-96 rounded-full bg-teal-200/35 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-20 -left-24 w-80 h-80 rounded-full bg-indigo-200/35 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 right-1/3 w-72 h-72 rounded-full bg-amber-200/25 blur-3xl"
          />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8 sm:pt-10 sm:pb-12 lg:pt-12 lg:pb-14">
            {/* Editorial Split Hero: Copy Left + Sunlit Atlas Artwork Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-stretch mb-6 sm:mb-8">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="lg:col-span-7 flex flex-col justify-center space-y-3"
              >
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold text-indigo-700">
                  <span>Global Mobility Intelligence</span>
                  <span aria-hidden="true" className="text-indigo-300">·</span>
                  <span className="text-teal-700">205+ Countries &amp; Territories</span>
                  <span aria-hidden="true" className="text-indigo-300">·</span>
                  <span className="text-slate-600">Diplomatic &amp; Bilateral Treaties</span>
                </div>

                <h1 className="text-[28px] sm:text-4xl lg:text-[44px] font-extrabold tracking-tight text-slate-950 leading-[1.12] [text-wrap:balance]">
                  Global Visa Check &amp;{' '}
                  <span className="bg-gradient-to-r from-indigo-700 via-violet-700 to-teal-700 bg-clip-text text-transparent">
                    Passport Mobility
                  </span>{' '}
                  Explorer
                </h1>

                <p className="text-sm sm:text-base text-slate-700 leading-relaxed max-w-2xl">
                  Instantly check visa rules by nationality, passport class (Ordinary, Official, Diplomatic, or Special), verified bilateral waiver treaties, and existing visas like U.S. B1/B2, Schengen, UK, or Canada.
                </p>

                {/* Crisp Horizontal Proof Highlights (Desktop + Mobile Compact) */}
                <div className="grid grid-cols-3 gap-2.5 sm:gap-3 pt-1 max-w-xl">
                  <div className="rounded-xl bg-white/80 backdrop-blur-xs border border-indigo-200/75 px-3 py-2.5">
                    <div className="text-base sm:text-lg font-extrabold text-indigo-800 font-mono tabular-nums leading-none">
                      {VISA_WORLD_COUNTRIES.length}+
                    </div>
                    <div className="text-[11px] font-medium text-slate-600 mt-1 leading-tight">
                      Global nations
                    </div>
                  </div>
                  <div className="rounded-xl bg-white/80 backdrop-blur-xs border border-teal-200/75 px-3 py-2.5">
                    <div className="text-base sm:text-lg font-extrabold text-teal-800 font-mono tabular-nums leading-none">
                      8
                    </div>
                    <div className="text-[11px] font-medium text-slate-600 mt-1 leading-tight">
                      Power-visa tiers
                    </div>
                  </div>
                  <div className="rounded-xl bg-white/80 backdrop-blur-xs border border-amber-200/80 px-3 py-2.5">
                    <div className="text-base sm:text-lg font-extrabold text-amber-800 font-mono tabular-nums leading-none">
                      100%
                    </div>
                    <div className="text-[11px] font-medium text-slate-600 mt-1 leading-tight">
                      Official MFA links
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Sunlit Editorial Globe & Flight Arcs Visual Frame */}
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="lg:col-span-5"
              >
                <div className="relative h-36 sm:h-48 lg:h-full min-h-[144px] lg:min-h-[224px] w-full rounded-2xl overflow-hidden border-2 border-white shadow-[0_14px_34px_-14px_rgba(37,99,235,0.22)] bg-gradient-to-br from-sky-100 via-white to-teal-100">
                  {!heroImgFailed ? (
                    <img
                      src={visaHeroAtlasImg}
                      alt="Sunlit world globe with indigo and teal international flight arcs"
                      referrerPolicy="no-referrer"
                      onError={() => setHeroImgFailed(true)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-indigo-700 bg-gradient-to-br from-sky-50 via-indigo-50 to-teal-50">
                      <Globe className="w-10 h-10" />
                      <span className="text-xs font-bold">Global Visa &amp; Mobility Atlas</span>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Interactive Checker Form Card (Crisp High-Contrast Light Glass) */}
            <motion.form
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.42, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
              onSubmit={handleSubmit}
              className="relative rounded-2xl bg-white/95 backdrop-blur-md border border-indigo-200/90 shadow-[0_18px_44px_-18px_rgba(79,70,229,0.2)] overflow-hidden"
            >
              {/* Luminous Top Accent Ribbon */}
              <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-sky-500 to-teal-500" />

              <div className="p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-6">
                {/* Row 1: Nationality ↔ Destination + Purpose */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-4 items-start">
                  {/* Nationality */}
                  <div className="lg:col-span-4">
                    <CountryCombobox
                      id="visa-origin-country"
                      label="1. Your Nationality / Citizenship"
                      value={originCode}
                      onChange={handleOriginChange}
                      placeholder="Search your nationality..."
                    />
                  </div>

                  {/* Swap Button (Compact Full-Width Pill-Free Strip on Mobile, Centered Square on Desktop) */}
                  <div className="lg:col-span-1 flex items-center justify-center lg:pt-6">
                    <motion.button
                      whileTap={{ scale: 0.94 }}
                      type="button"
                      onClick={handleSwapCountries}
                      title="Swap Nationality and Destination"
                      aria-label="Swap Nationality and Destination"
                      className="w-full lg:w-auto min-h-[44px] min-w-[44px] px-3 lg:px-2.5 py-2 rounded-xl bg-gradient-to-r from-indigo-50 to-teal-50 border border-indigo-200 hover:border-indigo-400 hover:from-indigo-100 hover:to-teal-100 text-indigo-700 transition-colors cursor-pointer flex items-center justify-center gap-2 text-xs font-bold"
                    >
                      <ArrowLeftRight className="w-4 h-4 shrink-0" />
                      <span className="lg:hidden">Swap Origin &amp; Destination</span>
                    </motion.button>
                  </div>

                  {/* Destination */}
                  <div className="lg:col-span-4">
                    <CountryCombobox
                      id="visa-destination-country"
                      label="2. Destination Country"
                      value={destinationCode}
                      onChange={setDestinationCode}
                      placeholder="Where are you traveling?"
                    />
                  </div>

                  {/* Purpose of Travel (Optional) */}
                  <div className="lg:col-span-3">
                    <label
                      htmlFor="visa-purpose"
                      className="block text-xs font-semibold text-slate-700 mb-1.5"
                    >
                      3. Travel Purpose <span className="font-normal text-slate-500">(Optional)</span>
                    </label>
                    <div className="relative">
                      <select
                        id="visa-purpose"
                        value={purpose}
                        onChange={e => setPurpose(e.target.value as TravelPurpose)}
                        className="w-full min-h-[46px] appearance-none px-3.5 pr-9 py-2.5 rounded-xl bg-white border border-slate-300/90 hover:border-indigo-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 text-sm font-medium text-slate-900 cursor-pointer"
                      >
                        {TRAVEL_PURPOSE_OPTIONS.map(opt => (
                          <option key={opt.id} value={opt.id}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-500 pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                </div>

                {/* Row 2: Dynamic Passport Selector + Live Miniature Booklet & Held Visas */}
                <div className="pt-5 border-t border-indigo-100 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                  <div className="lg:col-span-5 space-y-3">
                    <label
                      htmlFor="visa-passport-type"
                      className="block text-xs font-semibold text-slate-700"
                    >
                      4. Passport Type Issued by {VISA_COUNTRY_MAP.get(originCode)?.name}
                    </label>
                    <div className="relative">
                      <select
                        id="visa-passport-type"
                        value={passportTypeId}
                        onChange={e => setPassportTypeId(e.target.value)}
                        className="w-full min-h-[46px] appearance-none px-3.5 pr-9 py-2.5 rounded-xl bg-white border border-slate-300/90 hover:border-indigo-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 text-sm font-semibold text-slate-900 cursor-pointer"
                      >
                        {availablePassports.map(pt => (
                          <option key={pt.id} value={pt.id}>
                            {pt.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-500 pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
                    </div>

                    {/* Live Animated Miniature Passport Booklet Preview */}
                    {selectedPassportObj && (
                      <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-50/75 via-sky-50/55 to-teal-50/65 border border-indigo-200/75 flex items-center gap-3.5">
                        <PassportBookletGraphic
                          countryCode={originCode}
                          countryName={VISA_COUNTRY_MAP.get(originCode)?.name || originCode}
                          passport={selectedPassportObj}
                          size="sm"
                        />
                        <div className="min-w-0 text-xs text-slate-700 leading-relaxed">
                          <div className="font-bold text-slate-900">
                            {selectedPassportObj.coverColor} Cover
                            {selectedPassportObj.localName ? ` · ${selectedPassportObj.localName}` : ''}
                          </div>
                          <p className="text-[11.5px] text-slate-600 mt-0.5 leading-snug">
                            {selectedPassportObj.description}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Row 2 Right: Optional Existing Valid Visas */}
                  <div className="lg:col-span-7 space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-700">
                        5. Valid Visas or Residence Permits You Hold{' '}
                        <span className="font-normal text-slate-500">(Optional — unlocks extra visa-free countries)</span>
                      </span>
                      {heldVisas.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setHeldVisas([])}
                          className="text-xs font-bold text-indigo-700 hover:text-indigo-900 underline underline-offset-2 cursor-pointer"
                        >
                          Clear {heldVisas.length} selected
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {visibleHeldVisaOptions.map(visa => {
                        const checked = heldVisas.includes(visa.id);
                        return (
                          <motion.button
                            whileTap={{ scale: 0.985 }}
                            key={visa.id}
                            type="button"
                            onClick={() => toggleHeldVisa(visa.id)}
                            aria-pressed={checked}
                            className={`min-h-[60px] p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                              checked
                                ? 'bg-gradient-to-br from-indigo-50 via-sky-50/80 to-teal-50/80 border-indigo-500 text-indigo-950 shadow-xs'
                                : 'bg-slate-50/60 border-slate-200/90 hover:border-indigo-300 hover:bg-indigo-50/30 text-slate-800'
                            }`}
                          >
                            <span
                              className={`mt-0.5 w-4.5 h-4.5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                                checked
                                  ? 'bg-gradient-to-br from-indigo-600 to-teal-600 border-indigo-600 text-white'
                                  : 'bg-white border-slate-300'
                              }`}
                            >
                              {checked && <Check className="w-3 h-3 stroke-[3]" />}
                            </span>
                            <span className="min-w-0">
                              <span className="block text-xs font-bold leading-snug text-slate-900">
                                {visa.label}
                              </span>
                              <span className="block text-[11px] text-slate-600 mt-0.5 leading-snug line-clamp-2">
                                {visa.sublabel}
                              </span>
                            </span>
                          </motion.button>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowAllHeldVisas(prev => !prev)}
                      className="min-h-[36px] inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 hover:text-indigo-950 cursor-pointer pt-0.5"
                    >
                      {showAllHeldVisas ? (
                        <>
                          <ChevronUp className="w-3.5 h-3.5" />
                          <span>Show fewer third-country visas</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-3.5 h-3.5" />
                          <span>
                            Show 4 more privilege visas (Japan, Australia/NZ, GCC Residence, APEC Card)
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit Bar */}
                <div className="pt-5 border-t border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
                  <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2.5 w-full sm:w-auto">
                    <motion.button
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="w-full sm:w-auto min-h-[48px] px-7 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-teal-600 hover:from-indigo-700 hover:via-violet-700 hover:to-teal-700 text-white font-bold text-sm shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                    >
                      <Plane className="w-4 h-4" />
                      <span>Check Visa Requirements</span>
                    </motion.button>

                    <button
                      type="button"
                      onClick={handleReset}
                      className="w-full sm:w-auto min-h-[46px] px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-900 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset</span>
                    </button>

                    {hasUnsavedChanges && (
                      <span className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
                        Selections updated — tap &ldquo;Check Visa Requirements&rdquo; to refresh
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-500 font-mono tabular-nums hidden sm:block">
                    {VISA_WORLD_COUNTRIES.length} nationalities &amp; destinations
                  </div>
                </div>
              </div>
            </motion.form>

            {/* Mobile-Swipeable Quick-Check Presets */}
            <div className="mt-4 sm:mt-5 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:flex-wrap sm:overflow-visible">
              <span className="text-xs font-bold text-indigo-900/80 mr-0.5 whitespace-nowrap shrink-0">
                Try example:
              </span>
              {QUICK_SCENARIOS.map(sc => (
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  key={sc.label}
                  type="button"
                  onClick={() => handleApplyScenario(sc)}
                  className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-white/90 hover:bg-indigo-600 text-slate-800 hover:text-white border border-indigo-200/90 hover:border-indigo-600 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 shadow-2xs"
                >
                  {sc.label}
                </motion.button>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================== */}
        {/* PRIMARY VERDICT SECTION WITH ANIMATED FLIGHT ROUTE & BOOKLET       */}
        {/* ================================================================== */}
        <section
          ref={verdictRef}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-7 sm:pt-10 scroll-mt-20"
        >
          <motion.article
            key={`${verdict.origin.code}-${verdict.destination.code}-${verdict.passportType.id}-${verdict.status}-${verdict.heldVisas.join(',')}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-2xl bg-white border border-indigo-200/80 overflow-hidden shadow-[0_14px_38px_-16px_rgba(37,99,235,0.16)]"
          >
            {/* Top Multi-Color Brand Strip */}
            <div className="h-1.5 w-full bg-gradient-to-r from-teal-500 via-indigo-500 to-amber-500" />

            {/* Verdict Status Banner */}
            <div className={`p-4 sm:p-7 border-b space-y-5 ${statusVisual.bannerBg}`}>
              {/* Interactive Animated Flight Route Infographic */}
              <FlightRouteArcGraphic
                origin={verdict.origin}
                destination={verdict.destination}
                status={verdict.status}
                shortStatusLabel={statusVisual.shortLabel}
              />

              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                <div className="flex items-start gap-3.5 sm:gap-4">
                  {/* Live Miniature Passport Booklet matching chosen passport */}
                  <div className="hidden sm:block pt-0.5">
                    <PassportBookletGraphic
                      countryCode={verdict.origin.code}
                      countryName={verdict.origin.name}
                      passport={verdict.passportType}
                      size="md"
                    />
                  </div>

                  {/* Mobile status icon */}
                  <div
                    className={`sm:hidden w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${statusVisual.iconBg}`}
                  >
                    <StatusIcon className="w-5 h-5" />
                  </div>

                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold text-slate-600">
                      <span className={`inline-flex items-center gap-1 font-bold ${statusVisual.accentText}`}>
                        <StatusIcon className="w-3.5 h-3.5 hidden sm:inline shrink-0" />
                        <span>{statusVisual.label}</span>
                      </span>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span className="text-slate-700">{verdict.passportType.label}</span>
                    </div>

                    <h2
                      className={`text-xl sm:text-2xl lg:text-[26px] font-extrabold tracking-tight leading-snug ${statusVisual.headerText}`}
                    >
                      {verdict.headline}
                    </h2>

                    <p className={`text-sm leading-relaxed max-w-3xl ${statusVisual.subText}`}>
                      {verdict.verdictSummary}
                    </p>
                  </div>
                </div>

                {/* Action Utilities (Strictly Light-Theme High-Contrast CTAs — Zero Dark Slate) */}
                <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={handleCopyShareUrl}
                    className="min-h-[44px] px-4 py-2 rounded-xl bg-white/95 hover:bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-bold transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shadow-2xs"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Link Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Share Check Link</span>
                      </>
                    )}
                  </button>

                  {verdict.refirelyCountryId && (
                    <button
                      type="button"
                      onClick={() => navigateToCountry(verdict.refirelyCountryId!)}
                      className="min-h-[44px] px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700 text-white text-xs font-bold transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shadow-sm"
                    >
                      <Compass className="w-3.5 h-3.5 text-amber-200" />
                      <span>Open {verdict.destination.name} Haven Dossier</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* 4-Column Key Entry Facts Strip (Color-Coded Light Icon Tiles) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-indigo-100 border-b border-indigo-100 bg-gradient-to-r from-indigo-50/35 via-white to-teal-50/35">
              <div className="p-4 sm:p-5 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-100/90 text-indigo-700 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-500">Maximum Stay</div>
                  <div className="mt-0.5 text-sm font-bold text-slate-950 font-mono tabular-nums">
                    {verdict.maxStay}
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-5 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal-100/90 text-teal-700 flex items-center justify-center shrink-0">
                  <Stamp className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-500">Entry Process</div>
                  <div className="mt-0.5 text-sm font-bold text-slate-950">
                    {verdict.entryMethod}
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-5 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100/90 text-amber-700 flex items-center justify-center shrink-0">
                  <Ticket className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-500">Estimated Government Fee</div>
                  <div className="mt-0.5 text-sm font-bold text-slate-950 font-mono tabular-nums">
                    {verdict.estimatedFee}
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-5 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-violet-100/90 text-violet-700 flex items-center justify-center shrink-0">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-500">Passport Validity Rule</div>
                  <div className="mt-0.5 text-sm font-bold text-slate-950">
                    {verdict.passportValidityRequirement}
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Official Portals, Bilateral Treaties, Held Visa Conditions & Purpose Guidance */}
            <div className="p-4 sm:p-7 space-y-6 sm:space-y-7 bg-white">
              {/* 1. Held Visa Unlock Highlight (if applicable) */}
              {verdict.heldVisaUnlock && (
                <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-br from-teal-50/90 via-cyan-50/70 to-emerald-50/75 border border-teal-200/90 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-extrabold text-teal-950 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                      <span>
                        Third-Country Visa Exemption Applied: {verdict.heldVisaUnlock.visaLabel}
                      </span>
                    </h3>
                    <span className="text-xs font-mono font-bold text-teal-800">
                      Upgraded from {verdict.heldVisaUnlock.upgradedFromStatus.replace(/_/g, ' ')} →{' '}
                      {verdict.heldVisaUnlock.grantedStatus.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <ul className="space-y-1.5 text-xs sm:text-sm text-teal-950/90 list-disc pl-5">
                    {verdict.heldVisaUnlock.conditions.map((cond, i) => (
                      <li key={i} className="leading-relaxed">
                        {cond}
                      </li>
                    ))}
                  </ul>

                  {verdict.heldVisaUnlock.officialReferenceUrl && (
                    <div className="pt-1">
                      <a
                        href={verdict.heldVisaUnlock.officialReferenceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-800 hover:text-teal-950 underline underline-offset-2"
                      >
                        <span>Verify exemption conditions on official government website</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* 2. Bilateral Agreements & Official Treaties (or Diplomatic-Only Scope Notice) */}
              {verdict.bilateralAgreements.length > 0 && (() => {
                const isExclusionOrVerifyNotice =
                  verdict.status !== 'freedom_of_movement' &&
                  verdict.status !== 'visa_free' &&
                  verdict.status !== 'visa_free_conditional' &&
                  !verdict.unlockedByPassportTier;
                return (
                  <div className="space-y-3">
                    <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                      <Scale
                        className={`w-4 h-4 ${
                          isExclusionOrVerifyNotice ? 'text-amber-600' : 'text-indigo-600'
                        }`}
                      />
                      <span>
                        {isExclusionOrVerifyNotice
                          ? 'Bilateral Agreement Scope & Passport Class Notice'
                          : 'Applicable Bilateral Agreements & Treaties'}
                      </span>
                    </h3>

                    <div
                      className={`divide-y rounded-xl overflow-hidden border ${
                        isExclusionOrVerifyNotice
                          ? 'divide-amber-200/80 border-amber-300/80 bg-gradient-to-br from-amber-50/90 via-orange-50/55 to-yellow-50/60'
                          : 'divide-indigo-100 border-indigo-200/90 bg-gradient-to-br from-indigo-50/75 via-sky-50/50 to-teal-50/55'
                      }`}
                    >
                      {verdict.bilateralAgreements.map(agreement => (
                        <div
                          key={agreement.id}
                          className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                          <div className="space-y-1.5 max-w-3xl">
                            <div
                              className={`text-sm font-bold ${
                                isExclusionOrVerifyNotice ? 'text-amber-950' : 'text-indigo-950'
                              }`}
                            >
                              {agreement.title}
                            </div>
                            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                              {agreement.summary}
                            </p>
                            <div className="text-xs text-slate-600 flex flex-wrap items-center gap-2">
                              <span>Applies to: {agreement.appliesTo}</span>
                              {agreement.effectiveNote && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span
                                    className={`font-semibold ${
                                      isExclusionOrVerifyNotice ? 'text-amber-900' : 'text-indigo-800'
                                    }`}
                                  >
                                    {agreement.effectiveNote}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          <a
                            href={agreement.officialUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`min-h-[44px] px-4 py-2 rounded-xl bg-white text-xs font-bold transition-colors inline-flex items-center justify-center gap-1.5 shrink-0 whitespace-nowrap border shadow-2xs ${
                              isExclusionOrVerifyNotice
                                ? 'hover:bg-amber-600 text-amber-950 hover:text-white border-amber-300'
                                : 'hover:bg-indigo-600 text-indigo-900 hover:text-white border-indigo-300'
                            }`}
                          >
                            <Landmark className="w-3.5 h-3.5" />
                            <span>{agreement.sourceLabel}</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* 3. Two-Column Official Government Portal + Purpose & Entry Checklist */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
                {/* Official Destination Government / MFA Link (Bright Pastel Gradient, High-Contrast Indigo CTA) */}
                <div className="lg:col-span-5 p-5 rounded-xl bg-gradient-to-br from-indigo-50/80 via-sky-50/70 to-teal-50/75 border border-indigo-200/85 flex flex-col justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-indigo-700">
                      <Building2 className="w-4 h-4" />
                      <span>Official Destination Authority</span>
                    </div>
                    <h3 className="text-base font-extrabold text-slate-950 leading-snug">
                      {verdict.officialPortal.authorityName}
                    </h3>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {verdict.officialPortal.notes ||
                        `Official foreign affairs and immigration authority for ${verdict.destination.name}. Always confirm fee schedules, forms, and transit requirements directly before travel.`}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 pt-2">
                    <a
                      href={verdict.officialPortal.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-h-[44px] px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs font-bold transition-all inline-flex items-center justify-center gap-2 whitespace-nowrap shadow-sm"
                    >
                      <span>Visit Official Visa / MFA Website</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    {verdict.officialPortal.eVisaUrl && (
                      <a
                        href={verdict.officialPortal.eVisaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="min-h-[44px] px-4 py-2.5 rounded-xl bg-white hover:bg-teal-50 text-teal-900 border border-teal-300 text-xs font-bold transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap"
                      >
                        <span>{verdict.officialPortal.eVisaLabel || 'Official e-Visa / eTA Portal'}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Purpose Guidance & Border Conditions */}
                <div className="lg:col-span-7 p-5 rounded-xl bg-slate-50/75 border border-slate-200/85 space-y-4">
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-extrabold text-slate-950">
                      {verdict.purposeGuidance.label}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                      {verdict.purposeGuidance.summary}
                    </p>
                  </div>

                  <div className="border-t border-slate-200/80 pt-3.5 space-y-2">
                    <h4 className="text-xs font-bold text-indigo-900">
                      Key Entry Conditions &amp; Practical Notes
                    </h4>
                    <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700 list-disc pl-5">
                      {[...verdict.purposeGuidance.actionItems, ...verdict.keyConditions]
                        .slice(0, 5)
                        .map((item, idx) => (
                          <li key={idx} className="leading-relaxed">
                            {item}
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </motion.article>
        </section>

        {/* ================================================================== */}
        {/* GLOBAL MOBILITY EXPLORER & INTERACTIVE INFOGRAPHICS                */}
        {/* ================================================================== */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-14 space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold text-teal-700">
                <span>Complete Global Access Map</span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span className="text-slate-600">
                  {verdict.origin.name} ({verdict.passportType.coverColor}{' '}
                  {verdict.passportType.category.replace('_', ' ')})
                  {verdict.heldVisas.length > 0
                    ? ` + ${verdict.heldVisas.length} Held Visa${verdict.heldVisas.length > 1 ? 's' : ''}`
                    : ''}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950">
                All Countries You Can Travel To With This Passport
                {verdict.heldVisas.length > 0 ? ' & Held Visas' : ''}
              </h2>
              <p className="text-sm text-slate-600 max-w-2xl">
                Explore your animated global mobility score, filter by continent, or tap any country card to inspect its exact entry rules and official MFA links.
              </p>
            </div>
          </div>

          {/* Interactive Mobility Gauge + Spectrum Bar + 6-Continent Bar Chart */}
          <MobilityOverviewInfographic
            globalAccessList={globalAccessList}
            mobilityStats={mobilityStats}
            activeRegion={explorerRegion}
            onSelectRegion={region => {
              setExplorerRegion(region);
              setVisibleCount(36);
            }}
          />

          {/* 4-Column Vibrant Light-Tinted Summary KPI Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-white via-sky-50/60 to-indigo-50/70 border border-indigo-200/80 shadow-2xs">
              <div className="text-xs font-semibold text-indigo-700">Accessible No-Embassy</div>
              <div className="mt-1.5 text-2xl sm:text-3xl font-extrabold text-slate-950 font-mono tabular-nums">
                {mobilityStats.totalAccessibleNoEmbassy}
                <span className="text-sm font-semibold text-slate-400">
                  /{mobilityStats.totalDestinations}
                </span>
              </div>
              <div className="mt-1 text-xs text-slate-600">
                Visa-Free, eTA, VoA &amp; e-Visa
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-white via-emerald-50/65 to-teal-50/70 border border-emerald-200/85 shadow-2xs">
              <div className="text-xs font-semibold text-emerald-700">Visa-Free &amp; Free Move</div>
              <div className="mt-1.5 text-2xl sm:text-3xl font-extrabold text-emerald-900 font-mono tabular-nums">
                {mobilityStats.visaFreeTotal}
              </div>
              <div className="mt-1 text-xs text-emerald-800/80">
                No consular visa needed
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-white via-violet-50/65 to-indigo-50/75 border border-violet-200/85 shadow-2xs">
              <div className="text-xs font-semibold text-violet-700">Bonus Unlocked</div>
              <div className="mt-1.5 text-2xl sm:text-3xl font-extrabold text-violet-950 font-mono tabular-nums">
                +{mobilityStats.totalBonusUnlocked}
              </div>
              <div className="mt-1 text-xs text-slate-600">
                {mobilityStats.unlockedByHeldVisaCount > 0 &&
                mobilityStats.unlockedByPassportTierCount > 0
                  ? `${mobilityStats.unlockedByHeldVisaCount} visas · ${mobilityStats.unlockedByPassportTierCount} bilateral`
                  : mobilityStats.unlockedByHeldVisaCount > 0
                  ? 'Via your selected valid visa(s)'
                  : mobilityStats.unlockedByPassportTierCount > 0
                  ? `Via ${verdict.passportType.category} treaty`
                  : 'Select U.S. / Schengen visa above'}
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-white via-amber-50/60 to-sky-50/60 border border-amber-200/85 shadow-2xs">
              <div className="text-xs font-semibold text-amber-800">eTA / VoA / Online e-Visa</div>
              <div className="mt-1.5 text-2xl sm:text-3xl font-extrabold text-slate-950 font-mono tabular-nums">
                {mobilityStats.etaOrVoaTotal + mobilityStats.eVisaTotal}
              </div>
              <div className="mt-1 text-xs text-slate-600 font-mono tabular-nums">
                {mobilityStats.etaOrVoaTotal} eTA/VoA · {mobilityStats.eVisaTotal} e-Visa
              </div>
            </div>
          </div>

          {/* Filter Toolbar: High-Contrast Swipeable Tabs + Region + Search */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-1 p-1.5 bg-white/90 border border-indigo-200/80 rounded-xl overflow-x-auto no-scrollbar shadow-2xs">
              {(
                [
                  { id: 'accessible', label: `All Accessible (${mobilityStats.totalAccessibleNoEmbassy})` },
                  { id: 'visa_free', label: `Visa-Free (${mobilityStats.visaFreeTotal})` },
                  ...(mobilityStats.totalBonusUnlocked > 0
                    ? [
                        {
                          id: 'unlocked_bonus' as const,
                          label: `Unlocked Bonus (+${mobilityStats.totalBonusUnlocked})`,
                        },
                      ]
                    : []),
                  { id: 'eta_voa', label: `eTA / VoA (${mobilityStats.etaOrVoaTotal})` },
                  { id: 'e_visa', label: `e-Visa (${mobilityStats.eVisaTotal})` },
                  { id: 'visa_required', label: `Embassy Visa (${mobilityStats.visaRequiredTotal})` },
                ] as { id: ExplorerFilterTab; label: string }[]
              ).map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setExplorerTab(tab.id);
                    setVisibleCount(36);
                  }}
                  className={`min-h-[38px] px-3.5 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                    explorerTab === tab.id
                      ? 'bg-gradient-to-r from-indigo-600 to-teal-600 text-white shadow-xs'
                      : 'text-slate-700 hover:text-indigo-900 hover:bg-indigo-50/70'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex items-stretch sm:items-center gap-2.5">
              <select
                aria-label="Filter destinations by region"
                value={explorerRegion}
                onChange={e => {
                  setExplorerRegion(e.target.value as VisaRegion | 'All');
                  setVisibleCount(36);
                }}
                className="min-h-[44px] px-3.5 py-2 rounded-xl bg-white border border-indigo-200/90 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="All">All Regions</option>
                <option value="Europe">Europe</option>
                <option value="Asia">Asia</option>
                <option value="Americas">Americas</option>
                <option value="Middle East">Middle East</option>
                <option value="Africa">Africa</option>
                <option value="Oceania">Oceania</option>
              </select>

              <div className="relative flex items-center lg:w-56">
                <Search className="w-3.5 h-3.5 text-indigo-500 absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  value={explorerSearch}
                  onChange={e => {
                    setExplorerSearch(e.target.value);
                    setVisibleCount(36);
                  }}
                  placeholder="Filter country..."
                  className="w-full min-h-[44px] pl-8 pr-8 py-2 rounded-xl bg-white border border-indigo-200/90 text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-500"
                />
                {explorerSearch && (
                  <button
                    type="button"
                    onClick={() => setExplorerSearch('')}
                    className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                    aria-label="Clear destination filter"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Destinations Grid */}
          {filteredDestinations.length === 0 ? (
            <div className="p-10 rounded-2xl bg-white border border-indigo-200/80 text-center space-y-2.5">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto">
                <Globe className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-900">
                No destinations match the current filter
              </p>
              <p className="text-xs text-slate-600">
                Try switching regions, clearing your search query, or selecting a valid U.S. / Schengen visa above.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {filteredDestinations.slice(0, visibleCount).map(item => {
                  const visuals = getStatusVisuals(item.status);
                  const ItemIcon = visuals.Icon;
                  const isActive = item.destination.code === verdict.destination.code;

                  return (
                    <motion.button
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.985 }}
                      transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                      key={item.destination.code}
                      type="button"
                      onClick={() => handleInspectDestinationFromExplorer(item.destination)}
                      className={`group relative overflow-hidden rounded-xl bg-white border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[96px] ${
                        visuals.cardTint
                      } ${
                        isActive
                          ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-sm'
                          : 'border-slate-200/90 hover:border-indigo-300 shadow-2xs'
                      }`}
                    >
                      {/* Subtle Semantic Status Top Hairline */}
                      <span aria-hidden="true" className={`h-1 w-full block ${visuals.cardTopBar}`} />

                      <div className="p-3.5 sm:p-4 flex flex-col justify-between gap-2.5 flex-1 w-full">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <CountryFlag
                              countryCode={item.destination.code}
                              countryName={item.destination.name}
                              fallbackEmoji={item.destination.flag}
                              size="md"
                              className="rounded-xs shadow-2xs shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="text-sm font-bold text-slate-950 truncate group-hover:text-indigo-900 transition-colors">
                                {item.destination.name}
                              </div>
                              <div className="text-[11px] text-slate-500 truncate">
                                {item.destination.region} · {item.maxStay}
                              </div>
                            </div>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                          <span
                            className={`inline-flex items-center gap-1.5 font-bold ${visuals.accentText}`}
                          >
                            <ItemIcon className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{visuals.shortLabel}</span>
                          </span>

                          {(item.unlockedByHeldVisaLabel || item.unlockedByBilateralPassport) && (
                            <span className="text-[11px] font-bold text-indigo-700 truncate">
                              {item.unlockedByHeldVisaLabel
                                ? `via ${item.unlockedByHeldVisaLabel}`
                                : 'Bilateral Waiver'}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {filteredDestinations.length > visibleCount && (
                <div className="flex justify-center pt-2">
                  <button
                    type="button"
                    onClick={() => setVisibleCount(prev => prev + 48)}
                    className="min-h-[46px] px-7 py-2.5 rounded-xl bg-white hover:bg-indigo-50 border border-indigo-300 text-indigo-900 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                  >
                    Show More Destinations ({filteredDestinations.length - visibleCount} remaining)
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        {/* ================================================================== */}
        {/* ILLUSTRATED VISUAL GUIDE: PASSPORT CLASS & MULTI-VISA LEVERAGE     */}
        {/* ================================================================== */}
        <MobilityPillarsShowcase />

        {/* ================================================================== */}
        {/* SEO-FRIENDLY VISA INTELLIGENCE FAQ & GUIDE                         */}
        {/* ================================================================== */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-14 space-y-6">
          <div className="max-w-2xl space-y-1.5">
            <div className="text-xs font-bold text-indigo-700">
              Travel Intelligence Guide
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950">
              Frequently Asked Questions: Bilateral Waivers &amp; Multi-Visa Travel
            </h2>
            <p className="text-sm text-slate-600">
              Key international travel rules covering U.S. B1/B2 and Schengen exemptions, official &amp; diplomatic passport treaties, and digital entry authorizations.
            </p>
          </div>

          <div className="divide-y divide-indigo-100 border border-indigo-200/80 rounded-2xl bg-white/95 overflow-hidden shadow-xs">
            {VISA_CHECK_FAQS.map((faq, idx) => {
              const isOpen = openFaqIdx === idx;
              return (
                <div key={idx} className={isOpen ? 'bg-indigo-50/30' : ''}>
                  <button
                    type="button"
                    onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                    aria-expanded={isOpen}
                    className="w-full min-h-[56px] px-4 sm:px-6 py-4 text-left flex items-center justify-between gap-4 hover:bg-indigo-50/45 transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-3 min-w-0">
                      <span
                        className={`w-7 h-7 rounded-lg font-mono text-xs font-bold flex items-center justify-center shrink-0 transition-colors ${
                          isOpen
                            ? 'bg-gradient-to-br from-indigo-600 to-teal-600 text-white'
                            : 'bg-indigo-50 text-indigo-700 border border-indigo-200/80'
                        }`}
                      >
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <span className="text-sm font-bold text-slate-950 leading-snug">
                        {faq.q}
                      </span>
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-indigo-500 shrink-0 transition-transform duration-150 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                        className="px-4 sm:px-6 pb-5 pl-14 sm:pl-16 text-sm text-slate-700 leading-relaxed max-w-4xl"
                      >
                        {faq.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>

        {/* ================================================================== */}
        {/* OFFICIAL ADVISORY DISCLAIMER (LIGHT PASTEL SURFACE)                */}
        {/* ================================================================== */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-indigo-50/85 via-sky-50/75 to-teal-50/80 border border-indigo-200/85 flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-white border border-indigo-200/80 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
              <Info className="w-4.5 h-4.5" />
            </div>
            <div className="space-y-1 text-xs sm:text-[13px] text-slate-700 leading-relaxed">
              <h3 className="font-bold text-slate-950">
                Important Travel &amp; Immigration Disclaimer
              </h3>
              <p>
                ReFirely is an independent informational and advisory platform only. International visa policies, diplomatic and official bilateral waiver agreements, electronic travel authorizations (ETIAS, UK ETA, ESTA, eTA), transit rules, and third-country visa exemptions are subject to sudden change by sovereign governments without prior notice. Always verify the latest entry requirements, validity rules, and documentation directly with the destination country&rsquo;s official embassy, consulate, or Ministry of Foreign Affairs portal (linked above) before booking flights or traveling. ReFirely is not a legal or immigration authority and assumes no responsibility or liability for any discrepancy, policy change, denied boarding, or entry refusal.
              </p>
            </div>
          </div>
        </section>
      </main>
    </MotionConfig>
  );
};
