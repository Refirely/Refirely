import { Country, ScoutTripStop } from '../types';
import { getCountryNomadProfile } from './countryNomadProfiles';

export interface GeoHubCoordinate {
  countryId: string;
  countryName: string;
  cityName: string;
  lat: number;
  lng: number;
  continentGroup: 'Europe' | 'Asia' | 'Americas' | 'Middle East & Africa' | 'Oceania';
  airportCode: string;
  highlight: string;
}

import { getCountryPhotoConfig } from '../components/CountryThumbnail';

export type ScoutingFocusPreference =
  | 'nomad-fiber'
  | 'coastal-lifestyle'
  | 'healthcare-retirement'
  | 'tax-residency';

export type ScoutInterestId =
  | 'hiking'
  | 'nightlife'
  | 'culture'
  | 'architecture'
  | 'dating'
  | 'volunteering'
  | 'nature'
  | 'surfing'
  | 'hobbies'
  | 'coworking'
  | 'healthcare'
  | 'residency';

export interface ScoutInterestOption {
  id: ScoutInterestId;
  label: string;
  shortLabel: string;
  emoji: string;
  shortDesc: string;
  sampleActivityHint: string;
  photoUrl: string;
  fallbackGradient: string;
  svgMotif: 'mountains' | 'nightlife' | 'culture' | 'architecture' | 'dating' | 'volunteering' | 'nature' | 'surfing' | 'hobbies' | 'coworking' | 'healthcare' | 'residency';
}

export const SCOUT_INTEREST_CATALOG: ScoutInterestOption[] = [
  {
    id: 'hiking',
    label: 'Hiking & Scenic Trails',
    shortLabel: 'Hiking & Trails',
    emoji: '🥾',
    shortDesc: 'Coastal cliff walks, mountain ridges & sunrise viewpoint treks',
    sampleActivityHint: 'Guided ridge hike & local trail club meetup',
    photoUrl: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=800&q=80',
    fallbackGradient: 'from-emerald-900 via-teal-950 to-slate-900',
    svgMotif: 'mountains',
  },
  {
    id: 'surfing',
    label: 'Surfing, Beaches & Ocean',
    shortLabel: 'Surfing & Ocean',
    emoji: '🏄',
    shortDesc: 'Warm surf breaks, sailing marinas, beach clubs & coastal boardwalks',
    sampleActivityHint: 'Morning reef/beach surf session & marina walk',
    photoUrl: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=800&q=80',
    fallbackGradient: 'from-cyan-900 via-sky-950 to-slate-900',
    svgMotif: 'surfing',
  },
  {
    id: 'culture',
    label: 'Culture, History & Food',
    shortLabel: 'Culture & Food',
    emoji: '🎭',
    shortDesc: 'Artisan markets, culinary tastings, museums & local traditions',
    sampleActivityHint: 'Fresh market gastronomy tour & heritage museum visit',
    photoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
    fallbackGradient: 'from-amber-900 via-orange-950 to-slate-900',
    svgMotif: 'culture',
  },
  {
    id: 'architecture',
    label: 'Architecture & Old Towns',
    shortLabel: 'Architecture',
    emoji: '🏛️',
    shortDesc: 'UNESCO historic quarters, baroque plazas, tiled facades & design',
    sampleActivityHint: 'Architectural walking audit of historic residential quarters',
    photoUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
    fallbackGradient: 'from-stone-800 via-amber-950 to-slate-900',
    svgMotif: 'architecture',
  },
  {
    id: 'nightlife',
    label: 'Nightlife & Rooftop Lounges',
    shortLabel: 'Nightlife & Bars',
    emoji: '🍸',
    shortDesc: 'Sunset cocktail terraces, live jazz/acoustic lanes & evening vibrancy',
    sampleActivityHint: 'Evening walk & lounge experience in top nightlife district',
    photoUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
    fallbackGradient: 'from-indigo-950 via-purple-950 to-slate-900',
    svgMotif: 'nightlife',
  },
  {
    id: 'dating',
    label: 'Dating & Social Scene',
    shortLabel: 'Dating & Social',
    emoji: '🥂',
    shortDesc: 'Cosmopolitan mixers, language exchanges, social clubs & cafe culture',
    sampleActivityHint: 'Expat & local social mixer in high-energy dining district',
    photoUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80',
    fallbackGradient: 'from-rose-900 via-pink-950 to-slate-900',
    svgMotif: 'dating',
  },
  {
    id: 'nature',
    label: 'Nature, Parks & Lakes',
    shortLabel: 'Nature & Parks',
    emoji: '🌿',
    shortDesc: 'Botanical reserves, waterfalls, thermal springs & national parks',
    sampleActivityHint: 'Day excursion to nearby national park, lake or thermal reserve',
    photoUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    fallbackGradient: 'from-teal-900 via-emerald-950 to-slate-900',
    svgMotif: 'nature',
  },
  {
    id: 'volunteering',
    label: 'Volunteering & Impact',
    shortLabel: 'Volunteering',
    emoji: '🤝',
    shortDesc: 'Community gardens, animal rescues, coastal cleanups & mentoring',
    sampleActivityHint: 'Connect with a local community NGO or language exchange group',
    photoUrl: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=800&q=80',
    fallbackGradient: 'from-emerald-800 via-teal-950 to-slate-900',
    svgMotif: 'volunteering',
  },
  {
    id: 'hobbies',
    label: 'Hobbies, Sports & Wellness',
    shortLabel: 'Hobbies & Sports',
    emoji: '🧘',
    shortDesc: 'Padel/tennis clubs, golf courses, yoga studios, wine & pottery',
    sampleActivityHint: 'Trial session at a local sports, wellness, or creative studio',
    photoUrl: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=800&q=80',
    fallbackGradient: 'from-violet-900 via-indigo-950 to-slate-900',
    svgMotif: 'hobbies',
  },
  {
    id: 'coworking',
    label: 'Fast Fiber & Coworking',
    shortLabel: 'Fiber & Coworking',
    emoji: '💻',
    shortDesc: '5G/fiber speed audits, ergonomic coworking spaces & tech meetups',
    sampleActivityHint: 'Day-pass test at top coworking hub & fiber latency audit',
    photoUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
    fallbackGradient: 'from-slate-800 via-indigo-950 to-slate-900',
    svgMotif: 'coworking',
  },
  {
    id: 'healthcare',
    label: 'Healthcare & Longevity',
    shortLabel: 'Healthcare',
    emoji: '🏥',
    shortDesc: 'JCI private hospitals, bilingual specialists, pharmacies & wellness',
    sampleActivityHint: 'Walk-in tour of international private hospital & pharmacy audit',
    photoUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
    fallbackGradient: 'from-sky-900 via-teal-950 to-slate-900',
    svgMotif: 'healthcare',
  },
  {
    id: 'residency',
    label: 'Apartments, Visas & Tax',
    shortLabel: 'Apartments & Visas',
    emoji: '🔑',
    shortDesc: 'Long-term rental viewings, local bank rules & residency lawyers',
    sampleActivityHint: 'View 2 long-term apartments & consult on residency visa steps',
    photoUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80',
    fallbackGradient: 'from-slate-900 via-indigo-950 to-teal-950',
    svgMotif: 'residency',
  },
];

export interface WeeklyScoutingActivity {
  id: string;
  title: string;
  category:
    | 'Neighborhood & Vibe'
    | 'Digital Nomad & Tech'
    | 'Healthcare & Safety'
    | 'Housing & Legal'
    | 'Culture & Leisure'
    | 'Outdoors & Adventure'
    | 'Social & Nightlife'
    | 'Community & Hobbies';
  durationHint: string;
  interestTag?: string;
  spotlightDetail?: string;
  completed: boolean;
}

export interface WeeklyItineraryBlock {
  id: string;
  weekNumber: number;
  stopIndex: number;
  stopId: string;
  countryId: string;
  countryName: string;
  countryFlag: string;
  cityFocus: string;
  startDate: string;
  endDate: string;
  themeTitle: string;
  themeSubtitle: string;
  accentColor: 'teal' | 'indigo' | 'violet' | 'amber' | 'emerald' | 'rose';
  heroPhotoUrl: string;
  fallbackPhotoUrl: string;
  gradientFallback: string;
  landmarkCaption: string;
  matchedInterests: string[];
  localHighlightSpot: string;
  activities: WeeklyScoutingActivity[];
}

/**
 * Curated coordinates for global relocation & digital nomad hubs
 */
export const COUNTRY_HUB_COORDINATES: Record<string, GeoHubCoordinate[]> = {
  portugal: [
    {
      countryId: 'portugal',
      countryName: 'Portugal',
      cityName: 'Lisbon & Cascais',
      lat: 38.7223,
      lng: -9.1393,
      continentGroup: 'Europe',
      airportCode: 'LIS',
      highlight: 'Sunny Atlantic capital, D8 nomad cafes & coastal train to Cascais',
    },
    {
      countryId: 'portugal',
      countryName: 'Portugal',
      cityName: 'Lagos & Algarve',
      lat: 37.1028,
      lng: -8.673,
      continentGroup: 'Europe',
      airportCode: 'FAO',
      highlight: '300+ sunny days, English-speaking expat marinas & golden cliffs',
    },
    {
      countryId: 'portugal',
      countryName: 'Portugal',
      cityName: 'Porto & Matosinhos',
      lat: 41.1579,
      lng: -8.6291,
      continentGroup: 'Europe',
      airportCode: 'OPO',
      highlight: 'Walkable riverfront heritage, lower rents & vibrant tech scene',
    },
  ],
  spain: [
    {
      countryId: 'spain',
      countryName: 'Spain',
      cityName: 'Valencia & Costa Blanca',
      lat: 39.4699,
      lng: -0.3763,
      continentGroup: 'Europe',
      airportCode: 'VLC',
      highlight: 'Turia riverbed parks, sandy city beaches & Ruzafa coworking',
    },
    {
      countryId: 'spain',
      countryName: 'Spain',
      cityName: 'Málaga & Marbella',
      lat: 36.7213,
      lng: -4.4214,
      continentGroup: 'Europe',
      airportCode: 'AGP',
      highlight: 'Costa del Sol sunshine, AVE high-speed rail & international clinics',
    },
    {
      countryId: 'spain',
      countryName: 'Spain',
      cityName: 'Barcelona',
      lat: 41.3874,
      lng: 2.1686,
      continentGroup: 'Europe',
      airportCode: 'BCN',
      highlight: 'Poblenou tech district, Mediterranean beaches & cosmopolitan vibe',
    },
  ],
  greece: [
    {
      countryId: 'greece',
      countryName: 'Greece',
      cityName: 'Athens Riviera',
      lat: 37.9838,
      lng: 23.7275,
      continentGroup: 'Europe',
      airportCode: 'ATH',
      highlight: 'Coastal tramway, Koukaki cafes & island ferry hub',
    },
    {
      countryId: 'greece',
      countryName: 'Greece',
      cityName: 'Chania (Crete)',
      lat: 35.5138,
      lng: 24.018,
      continentGroup: 'Europe',
      airportCode: 'CHQ',
      highlight: 'Year-round island community, Venetian harbor & mild winters',
    },
  ],
  italy: [
    {
      countryId: 'italy',
      countryName: 'Italy',
      cityName: 'Lecce & Puglia',
      lat: 40.3515,
      lng: 18.175,
      continentGroup: 'Europe',
      airportCode: 'BDS',
      highlight: 'Baroque piazzas, 7% flat pension tax towns & Adriatic beaches',
    },
    {
      countryId: 'italy',
      countryName: 'Italy',
      cityName: 'Rome & Florence',
      lat: 41.9028,
      lng: 12.4964,
      continentGroup: 'Europe',
      airportCode: 'FCO',
      highlight: 'High-speed Frecciarossa rail hub, timeless culture & gastronomy',
    },
  ],
  france: [
    {
      countryId: 'france',
      countryName: 'France',
      cityName: 'Nice & Côte d’Azur',
      lat: 43.7102,
      lng: 7.262,
      continentGroup: 'Europe',
      airportCode: 'NCE',
      highlight: 'World-leading PUMA healthcare, Promenade des Anglais & tram network',
    },
    {
      countryId: 'france',
      countryName: 'France',
      cityName: 'Montpellier & Occitanie',
      lat: 43.6108,
      lng: 3.8767,
      continentGroup: 'Europe',
      airportCode: 'MPL',
      highlight: 'Sunny university vibrancy, free public trams & Mediterranean coast',
    },
  ],
  croatia: [
    {
      countryId: 'croatia',
      countryName: 'Croatia',
      cityName: 'Split & Dalmatian Coast',
      lat: 43.5081,
      lng: 16.4402,
      continentGroup: 'Europe',
      airportCode: 'SPU',
      highlight: 'Diocletian palace waterfront, island ferries & thriving nomad hub',
    },
    {
      countryId: 'croatia',
      countryName: 'Croatia',
      cityName: 'Zadar & Istria',
      lat: 44.1194,
      lng: 15.2314,
      continentGroup: 'Europe',
      airportCode: 'ZAD',
      highlight: 'Calm Adriatic promenades, high safety & crystal waters',
    },
  ],
  malta: [
    {
      countryId: 'malta',
      countryName: 'Malta',
      cityName: 'Valletta & Sliema',
      lat: 35.8989,
      lng: 14.5146,
      continentGroup: 'Europe',
      airportCode: 'MLA',
      highlight: 'Official English language, Nomad Residence Permit & 300 sunny days',
    },
  ],
  cyprus: [
    {
      countryId: 'cyprus',
      countryName: 'Cyprus',
      cityName: 'Limassol & Paphos',
      lat: 34.7071,
      lng: 33.0226,
      continentGroup: 'Europe',
      airportCode: 'PFO',
      highlight: 'EU Non-Schengen haven, 60-day Non-Dom tax rule & warm winters',
    },
  ],
  albania: [
    {
      countryId: 'albania',
      countryName: 'Albania',
      cityName: 'Sarandë & Tirana',
      lat: 39.8756,
      lng: 20.0053,
      continentGroup: 'Europe',
      airportCode: 'TIA',
      highlight: 'Non-Schengen Riviera coast, low living burn & up to 1-year stay',
    },
  ],
  montenegro: [
    {
      countryId: 'montenegro',
      countryName: 'Montenegro',
      cityName: 'Kotor & Tivat',
      lat: 42.4247,
      lng: 18.7712,
      continentGroup: 'Europe',
      airportCode: 'TIV',
      highlight: 'Non-Schengen Adriatic fjord, EUR currency & superyacht marina',
    },
  ],
  thailand: [
    {
      countryId: 'thailand',
      countryName: 'Thailand',
      cityName: 'Chiang Mai (Nimman)',
      lat: 18.7883,
      lng: 98.9853,
      continentGroup: 'Asia',
      airportCode: 'CNX',
      highlight: 'Global digital nomad capital, 260Mbps fiber & $1,150/mo turnkey burn',
    },
    {
      countryId: 'thailand',
      countryName: 'Thailand',
      cityName: 'Bangkok (Sukhumvit / Ari)',
      lat: 13.7563,
      lng: 100.5018,
      continentGroup: 'Asia',
      airportCode: 'BKK',
      highlight: 'Bumrungrad JCI hospital, BTS Skytrain & rooftop dining',
    },
    {
      countryId: 'thailand',
      countryName: 'Thailand',
      cityName: 'Phuket & Hua Hin',
      lat: 7.8804,
      lng: 98.3923,
      continentGroup: 'Asia',
      airportCode: 'HKT',
      highlight: 'Andaman beach clubs, international marinas & DTV 5-year visa',
    },
  ],
  malaysia: [
    {
      countryId: 'malaysia',
      countryName: 'Malaysia',
      cityName: 'Kuala Lumpur & Penang',
      lat: 3.139,
      lng: 101.6869,
      continentGroup: 'Asia',
      airportCode: 'KUL',
      highlight: 'DE Rantau Nomad Pass, widespread English & luxury high-rise condos',
    },
    {
      countryId: 'malaysia',
      countryName: 'Malaysia',
      cityName: 'George Town (Penang)',
      lat: 5.4141,
      lng: 100.3288,
      continentGroup: 'Asia',
      airportCode: 'PEN',
      highlight: 'UNESCO culinary capital, island hospitals & colonial heritage',
    },
  ],
  indonesia: [
    {
      countryId: 'indonesia',
      countryName: 'Indonesia',
      cityName: 'Bali (Canggu & Ubud)',
      lat: -8.6478,
      lng: 115.1385,
      continentGroup: 'Asia',
      airportCode: 'DPS',
      highlight: 'Iconic open-air bamboo coworking hubs, wellness & E33G Remote Visa',
    },
  ],
  vietnam: [
    {
      countryId: 'vietnam',
      countryName: 'Vietnam',
      cityName: 'Da Nang & Hoi An',
      lat: 16.0544,
      lng: 108.2022,
      continentGroup: 'Asia',
      airportCode: 'DAD',
      highlight: 'My Khe beachfront boulevards, ultra-low cost & specialty coffee culture',
    },
  ],
  philippines: [
    {
      countryId: 'philippines',
      countryName: 'Philippines',
      cityName: 'Cebu & Manila BGC',
      lat: 10.3157,
      lng: 123.8854,
      continentGroup: 'Asia',
      airportCode: 'CEB',
      highlight: 'English-speaking islands, SRRV retirement visa from age 50 & warm hospitality',
    },
  ],
  'costa-rica': [
    {
      countryId: 'costa-rica',
      countryName: 'Costa Rica',
      cityName: 'San José (Escazú) & Tamarindo',
      lat: 9.9281,
      lng: -84.0907,
      continentGroup: 'Americas',
      airportCode: 'SJO',
      highlight: 'Pura Vida biodiversity, Pensionado & Digital Nomad tax-exempt visas',
    },
  ],
  mexico: [
    {
      countryId: 'mexico',
      countryName: 'Mexico',
      cityName: 'Mexico City (Roma Norte)',
      lat: 19.4326,
      lng: -99.1332,
      continentGroup: 'Americas',
      airportCode: 'MEX',
      highlight: 'Leafy cafe boulevards, US time-zone alignment & vibrant gastronomy',
    },
    {
      countryId: 'mexico',
      countryName: 'Mexico',
      cityName: 'Puerto Vallarta & Playa del Carmen',
      lat: 20.6534,
      lng: -105.2253,
      continentGroup: 'Americas',
      airportCode: 'PVR',
      highlight: 'Beachfront boardwalks, direct North American flights & expat clinics',
    },
  ],
  panama: [
    {
      countryId: 'panama',
      countryName: 'Panama',
      cityName: 'Panama City & Boquete',
      lat: 8.9824,
      lng: -79.5199,
      continentGroup: 'Americas',
      airportCode: 'PTY',
      highlight: 'US Dollar currency, territorial tax exemption & gold-standard Pensionado perks',
    },
  ],
  colombia: [
    {
      countryId: 'colombia',
      countryName: 'Colombia',
      cityName: 'Medellín (El Poblado)',
      lat: 6.2442,
      lng: -75.5812,
      continentGroup: 'Americas',
      airportCode: 'MDE',
      highlight: 'City of Eternal Spring climate, Digital Nomad Visa & mountain cafes',
    },
  ],
  ecuador: [
    {
      countryId: 'ecuador',
      countryName: 'Ecuador',
      cityName: 'Cuenca & Quito',
      lat: -2.9001,
      lng: -79.0059,
      continentGroup: 'Americas',
      airportCode: 'CUE',
      highlight: 'UNESCO Andean river city, US Dollar economy & spring-like weather',
    },
  ],
  uruguay: [
    {
      countryId: 'uruguay',
      countryName: 'Uruguay',
      cityName: 'Montevideo & Punta del Este',
      lat: -34.9011,
      lng: -56.1645,
      continentGroup: 'Americas',
      airportCode: 'MVD',
      highlight: 'South America’s safest democracy, 11-year tax holiday & Atlantic beaches',
    },
  ],
  uae: [
    {
      countryId: 'uae',
      countryName: 'United Arab Emirates',
      cityName: 'Dubai Marina & Downtown',
      lat: 25.2048,
      lng: 55.2708,
      continentGroup: 'Middle East & Africa',
      airportCode: 'DXB',
      highlight: '0% personal income tax, 290Mbps fiber & 1-Year Virtual Working Visa',
    },
  ],
  mauritius: [
    {
      countryId: 'mauritius',
      countryName: 'Mauritius',
      cityName: 'Grand Baie & Tamarin',
      lat: -20.0089,
      lng: 57.5816,
      continentGroup: 'Middle East & Africa',
      airportCode: 'MRU',
      highlight: 'Free Premium Travel Visa (1 year), lagoon beaches & English/French fluency',
    },
  ],
  morocco: [
    {
      countryId: 'morocco',
      countryName: 'Morocco',
      cityName: 'Marrakech & Tangier',
      lat: 31.6295,
      lng: -7.9811,
      continentGroup: 'Middle East & Africa',
      airportCode: 'RAK',
      highlight: 'Non-Schengen hop 1 hour from Spain, Al Boraq high-speed rail & riads',
    },
  ],
  georgia: [
    {
      countryId: 'georgia',
      countryName: 'Georgia',
      cityName: 'Tbilisi & Batumi',
      lat: 41.7151,
      lng: 44.8271,
      continentGroup: 'Europe',
      airportCode: 'TBS',
      highlight: '365 days visa-free entry, 1% Individual Entrepreneur tax & cafe scene',
    },
  ],
  turkey: [
    {
      countryId: 'turkey',
      countryName: 'Turkey',
      cityName: 'Antalya & Istanbul',
      lat: 36.8969,
      lng: 30.7133,
      continentGroup: 'Europe',
      airportCode: 'AYT',
      highlight: 'Turquoise coast marinas, Non-Schengen hop & global flight connectivity',
    },
    {
      countryId: 'turkey',
      countryName: 'Turkey',
      cityName: 'Istanbul (Kadıköy & Karaköy)',
      lat: 41.0082,
      lng: 28.9784,
      continentGroup: 'Europe',
      airportCode: 'IST',
      highlight: 'Bosphorus ferries, historic neighborhoods & transcontinental hub',
    },
  ],
  japan: [
    {
      countryId: 'japan',
      countryName: 'Japan',
      cityName: 'Fukuoka & Kyoto',
      lat: 33.5902,
      lng: 130.4017,
      continentGroup: 'Asia',
      airportCode: 'FUK',
      highlight: 'Japan Startup & Nomad Visa hub, ultra-safe streets & Shinkansen rail',
    },
    {
      countryId: 'japan',
      countryName: 'Japan',
      cityName: 'Tokyo & Yokohama',
      lat: 35.6762,
      lng: 139.6503,
      continentGroup: 'Asia',
      airportCode: 'HND',
      highlight: 'World-leading transit, fiber connectivity & culinary excellence',
    },
  ],
  'south-korea': [
    {
      countryId: 'south-korea',
      countryName: 'South Korea',
      cityName: 'Seoul & Busan',
      lat: 37.5665,
      lng: 126.978,
      continentGroup: 'Asia',
      airportCode: 'ICN',
      highlight: 'Workation F-1-D Visa, fastest 5G/fiber globally & 24/7 cafe culture',
    },
    {
      countryId: 'south-korea',
      countryName: 'South Korea',
      cityName: 'Busan (Haeundae)',
      lat: 35.1796,
      lng: 129.0756,
      continentGroup: 'Asia',
      airportCode: 'PUS',
      highlight: 'Oceanfront high-rises, KTX express rail & coastal boardwalks',
    },
  ],
  taiwan: [
    {
      countryId: 'taiwan',
      countryName: 'Taiwan',
      cityName: 'Taipei & Kaohsiung',
      lat: 25.033,
      lng: 121.5654,
      continentGroup: 'Asia',
      airportCode: 'TPE',
      highlight: 'Employment Gold Card, world-class NHI healthcare & MRT metro',
    },
  ],
  cambodia: [
    {
      countryId: 'cambodia',
      countryName: 'Cambodia',
      cityName: 'Phnom Penh & Siem Reap',
      lat: 11.5564,
      lng: 104.9282,
      continentGroup: 'Asia',
      airportCode: 'PNH',
      highlight: 'Easy ER Retirement & E-Class renewals, USD economy & low burn',
    },
  ],
  'sri-lanka': [
    {
      countryId: 'sri-lanka',
      countryName: 'Sri Lanka',
      cityName: 'Galle Fort & Unawatuna',
      lat: 6.0535,
      lng: 80.221,
      continentGroup: 'Asia',
      airportCode: 'CMB',
      highlight: 'UNESCO Dutch colonial fort, Indian Ocean bays & boutique villas',
    },
    {
      countryId: 'sri-lanka',
      countryName: 'Sri Lanka',
      cityName: 'Weligama & Mirissa',
      lat: 5.9749,
      lng: 80.4297,
      continentGroup: 'Asia',
      airportCode: 'CMB',
      highlight: 'Premier surf bay, beach coworking cafes & whale-watching coast',
    },
    {
      countryId: 'sri-lanka',
      countryName: 'Sri Lanka',
      cityName: 'Colombo (Cinnamon Gardens)',
      lat: 6.9271,
      lng: 79.8612,
      continentGroup: 'Asia',
      airportCode: 'CMB',
      highlight: 'Modern oceanfront capital, private hospitals & international dining',
    },
    {
      countryId: 'sri-lanka',
      countryName: 'Sri Lanka',
      cityName: 'Ella & Kandy Highlands',
      lat: 6.8667,
      lng: 81.0466,
      continentGroup: 'Asia',
      airportCode: 'CMB',
      highlight: 'Cool emerald tea plantations, Nine Arch Bridge & mountain trails',
    },
  ],
  nepal: [
    {
      countryId: 'nepal',
      countryName: 'Nepal',
      cityName: 'Pokhara (Lakeside)',
      lat: 28.2096,
      lng: 83.9856,
      continentGroup: 'Asia',
      airportCode: 'PKR',
      highlight: 'Phewa lakeside tranquility, Annapurna views & paragliding capital',
    },
    {
      countryId: 'nepal',
      countryName: 'Nepal',
      cityName: 'Kathmandu & Patan (Lalitpur)',
      lat: 27.7172,
      lng: 85.324,
      continentGroup: 'Asia',
      airportCode: 'KTM',
      highlight: 'UNESCO heritage courtyards, artisan cafes & expat social clubs',
    },
  ],
  india: [
    {
      countryId: 'india',
      countryName: 'India',
      cityName: 'Goa (Assagao, Anjuna & Panjim)',
      lat: 15.4909,
      lng: 73.8278,
      continentGroup: 'Asia',
      airportCode: 'GOI',
      highlight: 'Portuguese-heritage villas, specialty coworking cafes & Arabian Sea beaches',
    },
    {
      countryId: 'india',
      countryName: 'India',
      cityName: 'Bengaluru (Indiranagar & Koramangala)',
      lat: 12.9716,
      lng: 77.5946,
      continentGroup: 'Asia',
      airportCode: 'BLR',
      highlight: 'India’s Silicon Valley, pleasant 24°C highland weather, craft breweries & gigabit fiber',
    },
    {
      countryId: 'india',
      countryName: 'India',
      cityName: 'Mumbai (Bandra West & Colaba)',
      lat: 19.0596,
      lng: 72.8295,
      continentGroup: 'Asia',
      airportCode: 'BOM',
      highlight: 'Cosmopolitan seaside promenade, luxury dining, art districts & global connectivity',
    },
    {
      countryId: 'india',
      countryName: 'India',
      cityName: 'Pune (Koregaon Park & Kalyani Nagar)',
      lat: 18.5362,
      lng: 73.894,
      continentGroup: 'Asia',
      airportCode: 'PNQ',
      highlight: 'Leafy tree-lined avenues, wellness retreats, high safety & vibrant cafe culture',
    },
    {
      countryId: 'india',
      countryName: 'India',
      cityName: 'Kochi (Fort Kochi) & Varkala Cliff',
      lat: 9.9312,
      lng: 76.2673,
      continentGroup: 'Asia',
      airportCode: 'COK',
      highlight: 'Kerala backwaters, cliffside surf cafes, world-class Ayurveda & JCI hospitals',
    },
    {
      countryId: 'india',
      countryName: 'India',
      cityName: 'Udaipur & Jaipur (Rajasthan Royal Hubs)',
      lat: 24.5854,
      lng: 73.7125,
      continentGroup: 'Asia',
      airportCode: 'UDR',
      highlight: 'Lake Pichola palaces, luxury heritage hotels, content-creator architecture & crafts',
    },
    {
      countryId: 'india',
      countryName: 'India',
      cityName: 'Rishikesh, Dehradun & Dharamkot',
      lat: 30.0869,
      lng: 78.2676,
      continentGroup: 'Asia',
      airportCode: 'DED',
      highlight: 'Himalayan foothills, Ganges yoga & wellness sanctuary, mountain cafes & hikes',
    },
    {
      countryId: 'india',
      countryName: 'India',
      cityName: 'Pondicherry (White Town) & Chennai',
      lat: 11.9416,
      lng: 79.8083,
      continentGroup: 'Asia',
      airportCode: 'MAA',
      highlight: 'French Riviera of the East, bougainvillea villas, Auroville & top medical care',
    },
  ],
  belize: [
    {
      countryId: 'belize',
      countryName: 'Belize',
      cityName: 'Ambergris Caye (San Pedro)',
      lat: 17.9192,
      lng: -87.9628,
      continentGroup: 'Americas',
      airportCode: 'BZE',
      highlight: 'Official English language, QRP Retirement Program & barrier reef living',
    },
    {
      countryId: 'belize',
      countryName: 'Belize',
      cityName: 'Placencia Peninsula',
      lat: 16.5142,
      lng: -88.3665,
      continentGroup: 'Americas',
      airportCode: 'BZE',
      highlight: 'Walkable 16-mile sandy peninsula, calm lagoon & relaxed expat community',
    },
    {
      countryId: 'belize',
      countryName: 'Belize',
      cityName: 'San Ignacio (Cayo Highlands)',
      lat: 17.1561,
      lng: -89.0714,
      continentGroup: 'Americas',
      airportCode: 'BZE',
      highlight: 'Eco-jungle river town, Mayan ruins, organic markets & low cost of living',
    },
  ],
  'dominican-republic': [
    {
      countryId: 'dominican-republic',
      countryName: 'Dominican Republic',
      cityName: 'Las Terrenas (Samaná)',
      lat: 19.3111,
      lng: -69.5428,
      continentGroup: 'Americas',
      airportCode: 'SDQ',
      highlight: 'French/Italian-influenced beach town in Samaná with bakeries & palm coves',
    },
    {
      countryId: 'dominican-republic',
      countryName: 'Dominican Republic',
      cityName: 'Punta Cana & Cap Cana',
      lat: 18.5601,
      lng: -68.3725,
      continentGroup: 'Americas',
      airportCode: 'PUJ',
      highlight: 'Gated golf & marina resorts, direct flights & modern private hospitals',
    },
    {
      countryId: 'dominican-republic',
      countryName: 'Dominican Republic',
      cityName: 'Santo Domingo (Zona Colonial)',
      lat: 18.4739,
      lng: -69.8847,
      continentGroup: 'Americas',
      airportCode: 'SDQ',
      highlight: '16th-century UNESCO stone plazas, rooftop lounges & fiber connectivity',
    },
  ],
  brazil: [
    {
      countryId: 'brazil',
      countryName: 'Brazil',
      cityName: 'Florianópolis (Lagoa & Campeche)',
      lat: -27.5954,
      lng: -48.548,
      continentGroup: 'Americas',
      airportCode: 'FLN',
      highlight: 'Magic Island tech & surf hub, 42 beaches, high safety & Nomad Visa',
    },
    {
      countryId: 'brazil',
      countryName: 'Brazil',
      cityName: 'Rio de Janeiro (Ipanema & Leblon)',
      lat: -22.9838,
      lng: -43.2096,
      continentGroup: 'Americas',
      airportCode: 'GIG',
      highlight: 'Iconic oceanfront boardwalk, mountain hikes & vibrant carioca lifestyle',
    },
    {
      countryId: 'brazil',
      countryName: 'Brazil',
      cityName: 'São Paulo (Vila Madalena & Pinheiros)',
      lat: -23.5505,
      lng: -46.6333,
      continentGroup: 'Americas',
      airportCode: 'GRU',
      highlight: 'South America’s Michelin culinary, art & startup powerhouse',
    },
  ],
  argentina: [
    {
      countryId: 'argentina',
      countryName: 'Argentina',
      cityName: 'Buenos Aires (Palermo & Recoleta)',
      lat: -34.588,
      lng: -58.4305,
      continentGroup: 'Americas',
      airportCode: 'EZE',
      highlight: 'Paris of South America, leafy cafes, steak & wine culture, Nomad Visa',
    },
    {
      countryId: 'argentina',
      countryName: 'Argentina',
      cityName: 'Mendoza Wine Country',
      lat: -32.8895,
      lng: -68.8458,
      continentGroup: 'Americas',
      airportCode: 'MDZ',
      highlight: 'Sun-drenched Andean foothills, Malbec vineyards & relaxed pace',
    },
    {
      countryId: 'argentina',
      countryName: 'Argentina',
      cityName: 'San Carlos de Bariloche',
      lat: -41.1335,
      lng: -71.3103,
      continentGroup: 'Americas',
      airportCode: 'BRC',
      highlight: 'Patagonian Alpine lakes, mountain trekking & boutique chocolate towns',
    },
  ],
  chile: [
    {
      countryId: 'chile',
      countryName: 'Chile',
      cityName: 'Santiago (Providencia & Las Condes)',
      lat: -33.4263,
      lng: -70.6109,
      continentGroup: 'Americas',
      airportCode: 'SCL',
      highlight: 'Modern infrastructure, fast fiber, walkable parks & Andean views',
    },
    {
      countryId: 'chile',
      countryName: 'Chile',
      cityName: 'Viña del Mar & Valparaíso',
      lat: -33.0245,
      lng: -71.5518,
      continentGroup: 'Americas',
      airportCode: 'SCL',
      highlight: 'Pacific garden coast, colorful hillside funiculars & ocean breezes',
    },
    {
      countryId: 'chile',
      countryName: 'Chile',
      cityName: 'Pucón & Lake Villarrica',
      lat: -39.2822,
      lng: -71.9543,
      continentGroup: 'Americas',
      airportCode: 'ZCO',
      highlight: 'Volcanic lake adventure capital, thermal springs & alpine forests',
    },
  ],
  peru: [
    {
      countryId: 'peru',
      countryName: 'Peru',
      cityName: 'Lima (Miraflores & Barranco)',
      lat: -12.1191,
      lng: -77.0349,
      continentGroup: 'Americas',
      airportCode: 'LIM',
      highlight: 'Clifftop Pacific parks, world-renowned culinary capital & Rentista visa',
    },
    {
      countryId: 'peru',
      countryName: 'Peru',
      cityName: 'Cusco & Sacred Valley',
      lat: -13.532,
      lng: -71.9675,
      continentGroup: 'Americas',
      airportCode: 'CUZ',
      highlight: 'Andean stone plazas, sacred mountain trails & thriving wellness community',
    },
    {
      countryId: 'peru',
      countryName: 'Peru',
      cityName: 'Arequipa (White City)',
      lat: -16.409,
      lng: -71.5375,
      continentGroup: 'Americas',
      airportCode: 'AQP',
      highlight: '300+ days of sunshine, UNESCO sillar-stone architecture & mild highland air',
    },
  ],
  'south-africa': [
    {
      countryId: 'south-africa',
      countryName: 'South Africa',
      cityName: 'Cape Town (Sea Point & Camps Bay)',
      lat: -33.9249,
      lng: 18.4241,
      continentGroup: 'Middle East & Africa',
      airportCode: 'CPT',
      highlight: 'Table Mountain oceanfront, European time zone & Remote Work Visa',
    },
    {
      countryId: 'south-africa',
      countryName: 'South Africa',
      cityName: 'Stellenbosch & Franschhoek',
      lat: -33.9321,
      lng: 18.8602,
      continentGroup: 'Middle East & Africa',
      airportCode: 'CPT',
      highlight: 'Cape Winelands estates, oak-lined streets, fine dining & mountain cycling',
    },
    {
      countryId: 'south-africa',
      countryName: 'South Africa',
      cityName: 'Knysna & Garden Route',
      lat: -34.0351,
      lng: 23.0465,
      continentGroup: 'Middle East & Africa',
      airportCode: 'GRJ',
      highlight: 'Coastal lagoon sanctuary, championship golf & tranquil retiree haven',
    },
  ],
  namibia: [
    {
      countryId: 'namibia',
      countryName: 'Namibia',
      cityName: 'Swakopmund & Walvis Bay',
      lat: -22.6784,
      lng: 14.5266,
      continentGroup: 'Middle East & Africa',
      airportCode: 'WDH',
      highlight: 'Safe Atlantic coastal gem, English official language & desert beauty',
    },
    {
      countryId: 'namibia',
      countryName: 'Namibia',
      cityName: 'Windhoek (Klein Windhoek)',
      lat: -22.5609,
      lng: 17.0658,
      continentGroup: 'Middle East & Africa',
      airportCode: 'WDH',
      highlight: 'Clean highland capital, modern private healthcare & German bakeries',
    },
  ],
  kenya: [
    {
      countryId: 'kenya',
      countryName: 'Kenya',
      cityName: 'Nairobi (Westlands & Karen)',
      lat: -1.2921,
      lng: 36.8219,
      continentGroup: 'Middle East & Africa',
      airportCode: 'NBO',
      highlight: 'Silicon Savannah tech hub, leafy Karen suburbs & year-round spring climate',
    },
    {
      countryId: 'kenya',
      countryName: 'Kenya',
      cityName: 'Diani Beach & Kilifi Coast',
      lat: -4.2798,
      lng: 39.5947,
      continentGroup: 'Middle East & Africa',
      airportCode: 'MBA',
      highlight: 'White-sand Indian Ocean reef, kitesurfing & tropical coworking villas',
    },
  ],
  seychelles: [
    {
      countryId: 'seychelles',
      countryName: 'Seychelles',
      cityName: 'Mahé (Beau Vallon & Eden Island)',
      lat: -4.6796,
      lng: 55.492,
      continentGroup: 'Middle East & Africa',
      airportCode: 'SEZ',
      highlight: 'Workation Retreat Program, luxury marina & granite island beaches',
    },
    {
      countryId: 'seychelles',
      countryName: 'Seychelles',
      cityName: 'Praslin & La Digue Islands',
      lat: -4.319,
      lng: 55.7385,
      continentGroup: 'Middle East & Africa',
      airportCode: 'PRI',
      highlight: 'Car-free bicycle island paths, Anse Source d’Argent & coral lagoons',
    },
  ],
  estonia: [
    {
      countryId: 'estonia',
      countryName: 'Estonia',
      cityName: 'Tallinn (Kalamaja & Telliskivi)',
      lat: 59.437,
      lng: 24.7536,
      continentGroup: 'Europe',
      airportCode: 'TLL',
      highlight: 'Pioneer of e-Residency & Digital Nomad Visa, medieval Old Town',
    },
    {
      countryId: 'estonia',
      countryName: 'Estonia',
      cityName: 'Tartu & Pärnu Coast',
      lat: 58.378,
      lng: 26.729,
      continentGroup: 'Europe',
      airportCode: 'TLL',
      highlight: 'Historic university town, summer beach resort & startup ecosystem',
    },
  ],
  hungary: [
    {
      countryId: 'hungary',
      countryName: 'Hungary',
      cityName: 'Budapest (District V & Buda Hills)',
      lat: 47.4979,
      lng: 19.0402,
      continentGroup: 'Europe',
      airportCode: 'BUD',
      highlight: 'White Card Digital Nomad Visa, thermal baths & Danube boulevards',
    },
    {
      countryId: 'hungary',
      countryName: 'Hungary',
      cityName: 'Lake Balaton (Balatonfüred) & Pécs',
      lat: 46.9599,
      lng: 17.8851,
      continentGroup: 'Europe',
      airportCode: 'BUD',
      highlight: 'Hungarian Sea vineyards, sailing marinas & sunny southern microclimate',
    },
  ],
  'czech-republic': [
    {
      countryId: 'czech-republic',
      countryName: 'Czech Republic',
      cityName: 'Prague (Vinohrady & Karlín)',
      lat: 50.0755,
      lng: 14.4378,
      continentGroup: 'Europe',
      airportCode: 'PRG',
      highlight: 'Zivno freelancer visa, world-class public transit & central EU hub',
    },
    {
      countryId: 'czech-republic',
      countryName: 'Czech Republic',
      cityName: 'Brno & Karlovy Vary',
      lat: 49.1951,
      lng: 16.6068,
      continentGroup: 'Europe',
      airportCode: 'BRQ',
      highlight: 'Moravian tech & cafe hub and historic thermal spa colonnades',
    },
  ],
  romania: [
    {
      countryId: 'romania',
      countryName: 'Romania',
      cityName: 'Brașov (Transylvania)',
      lat: 45.6427,
      lng: 25.5887,
      continentGroup: 'Europe',
      airportCode: 'GHV',
      highlight: 'Carpathian mountain town, medieval square & ultra-fast gigabit fiber',
    },
    {
      countryId: 'romania',
      countryName: 'Romania',
      cityName: 'Cluj-Napoca & Sibiu',
      lat: 46.7712,
      lng: 23.6236,
      continentGroup: 'Europe',
      airportCode: 'CLJ',
      highlight: 'Vibrant university tech capital, cultural festivals & Nomad Visa',
    },
    {
      countryId: 'romania',
      countryName: 'Romania',
      cityName: 'Bucharest (Primăverii & Old Town)',
      lat: 44.4268,
      lng: 26.1025,
      continentGroup: 'Europe',
      airportCode: 'OTP',
      highlight: 'Grand Belle Époque parks, specialty coffee & international flights',
    },
  ],
  bulgaria: [
    {
      countryId: 'bulgaria',
      countryName: 'Bulgaria',
      cityName: 'Sofia (Lozenets & Vitosha)',
      lat: 42.6977,
      lng: 23.3219,
      continentGroup: 'Europe',
      airportCode: 'SOF',
      highlight: '10% flat income tax, mountain backdrop & fast metro transit',
    },
    {
      countryId: 'bulgaria',
      countryName: 'Bulgaria',
      cityName: 'Bansko (Pirin Mountain Nomad Hub)',
      lat: 41.8404,
      lng: 23.4886,
      continentGroup: 'Europe',
      airportCode: 'SOF',
      highlight: 'Europe’s lowest-burn mountain coworking village, ski & summer hiking',
    },
    {
      countryId: 'bulgaria',
      countryName: 'Bulgaria',
      cityName: 'Plovdiv & Varna (Black Sea)',
      lat: 42.1354,
      lng: 24.7453,
      continentGroup: 'Europe',
      airportCode: 'PDV',
      highlight: 'Kapana creative arts district, Roman amphitheater & coastal gardens',
    },
  ],
  slovenia: [
    {
      countryId: 'slovenia',
      countryName: 'Slovenia',
      cityName: 'Ljubljana (Riverfront Old Town)',
      lat: 46.0569,
      lng: 14.5058,
      continentGroup: 'Europe',
      airportCode: 'LJU',
      highlight: 'Greenest car-free European capital, riverside cafes & high safety',
    },
    {
      countryId: 'slovenia',
      countryName: 'Slovenia',
      cityName: 'Piran (Adriatic Coast) & Lake Bled',
      lat: 45.5283,
      lng: 13.5683,
      continentGroup: 'Europe',
      airportCode: 'LJU',
      highlight: 'Venetian coastal peninsula and emerald Julian Alps lake scenery',
    },
  ],
  ireland: [
    {
      countryId: 'ireland',
      countryName: 'Ireland',
      cityName: 'Cork & Kinsale Harbor',
      lat: 51.8985,
      lng: -8.4756,
      continentGroup: 'Europe',
      airportCode: 'ORK',
      highlight: 'English-speaking EU Non-Schengen haven, gourmet coast & Stamp 0',
    },
    {
      countryId: 'ireland',
      countryName: 'Ireland',
      cityName: 'Galway & West Coast',
      lat: 53.2707,
      lng: -9.0568,
      continentGroup: 'Europe',
      airportCode: 'SNN',
      highlight: 'Bohemian music & literary harbor on the Wild Atlantic Way',
    },
    {
      countryId: 'ireland',
      countryName: 'Ireland',
      cityName: 'Dublin (Ranelagh & Dalkey)',
      lat: 53.3498,
      lng: -6.2603,
      continentGroup: 'Europe',
      airportCode: 'DUB',
      highlight: 'European tech headquarters, coastal DART rail villages & Georgian parks',
    },
  ],
  germany: [
    {
      countryId: 'germany',
      countryName: 'Germany',
      cityName: 'Berlin (Prenzlauer Berg & Kreuzberg)',
      lat: 52.52,
      lng: 13.405,
      continentGroup: 'Europe',
      airportCode: 'BER',
      highlight: 'Freiberufler freelancer visa, English startup scene & cultural diversity',
    },
    {
      countryId: 'germany',
      countryName: 'Germany',
      cityName: 'Munich & Bavarian Lakes',
      lat: 48.1351,
      lng: 11.582,
      continentGroup: 'Europe',
      airportCode: 'MUC',
      highlight: 'Alpine proximity, beer gardens, world-class hospitals & ultra-safe streets',
    },
    {
      countryId: 'germany',
      countryName: 'Germany',
      cityName: 'Freiburg & Heidelberg',
      lat: 47.999,
      lng: 7.8421,
      continentGroup: 'Europe',
      airportCode: 'BSL',
      highlight: 'Germany’s sunniest Black Forest university town near France & Switzerland',
    },
  ],
  netherlands: [
    {
      countryId: 'netherlands',
      countryName: 'Netherlands',
      cityName: 'Amsterdam & Haarlem',
      lat: 52.3676,
      lng: 4.9041,
      continentGroup: 'Europe',
      airportCode: 'AMS',
      highlight: 'DAFT Entrepreneur treaty, canal cycling & 95% English fluency',
    },
    {
      countryId: 'netherlands',
      countryName: 'Netherlands',
      cityName: 'Utrecht, Rotterdam & The Hague',
      lat: 52.0907,
      lng: 5.1214,
      continentGroup: 'Europe',
      airportCode: 'AMS',
      highlight: 'Car-free medieval canals, North Sea beach at Scheveningen & fast rail',
    },
  ],
  switzerland: [
    {
      countryId: 'switzerland',
      countryName: 'Switzerland',
      cityName: 'Zurich & Zug',
      lat: 47.3769,
      lng: 8.5417,
      continentGroup: 'Europe',
      airportCode: 'ZRH',
      highlight: 'Unmatched Alpine safety, lakeside baths & low-tax Zug canton',
    },
    {
      countryId: 'switzerland',
      countryName: 'Switzerland',
      cityName: 'Lugano (Ticino) & Geneva',
      lat: 46.0037,
      lng: 8.9511,
      continentGroup: 'Europe',
      airportCode: 'ZRH',
      highlight: 'Palm-lined Italian-speaking lakefront and international diplomatic hub',
    },
  ],
  austria: [
    {
      countryId: 'austria',
      countryName: 'Austria',
      cityName: 'Vienna (Neubau & Innere Stadt)',
      lat: 48.2082,
      lng: 16.3738,
      continentGroup: 'Europe',
      airportCode: 'VIE',
      highlight: 'Ranked #1 most livable city globally, coffeehouses & €1/day transit',
    },
    {
      countryId: 'austria',
      countryName: 'Austria',
      cityName: 'Salzburg & Innsbruck',
      lat: 47.8095,
      lng: 13.055,
      continentGroup: 'Europe',
      airportCode: 'SZG',
      highlight: 'Baroque Alpine music capital and year-round mountain sports',
    },
  ],
  poland: [
    {
      countryId: 'poland',
      countryName: 'Poland',
      cityName: 'Kraków (Kazimierz & Old Town)',
      lat: 50.0647,
      lng: 19.945,
      continentGroup: 'Europe',
      airportCode: 'KRK',
      highlight: 'Walkable royal square, lively cafe cellars & high safety',
    },
    {
      countryId: 'poland',
      countryName: 'Poland',
      cityName: 'Warsaw & Wrocław',
      lat: 52.2297,
      lng: 21.0122,
      continentGroup: 'Europe',
      airportCode: 'WAW',
      highlight: 'Dynamic European business skyline, Vistula boulevards & island bridges',
    },
  ],
  australia: [
    {
      countryId: 'australia',
      countryName: 'Australia',
      cityName: 'Gold Coast & Byron Bay',
      lat: -28.0167,
      lng: 153.4,
      continentGroup: 'Oceania',
      airportCode: 'OOL',
      highlight: 'Subtropical surf beaches, oceanfront paths & outdoor wellness culture',
    },
    {
      countryId: 'australia',
      countryName: 'Australia',
      cityName: 'Sydney (Manly & Bondi)',
      lat: -33.8688,
      lng: 151.2093,
      continentGroup: 'Oceania',
      airportCode: 'SYD',
      highlight: 'Iconic harbor ferries, coastal cliff walks & global financial hub',
    },
    {
      countryId: 'australia',
      countryName: 'Australia',
      cityName: 'Melbourne & Sunshine Coast',
      lat: -37.8136,
      lng: 144.9631,
      continentGroup: 'Oceania',
      airportCode: 'MEL',
      highlight: 'World specialty coffee capital, cultural laneways & top hospitals',
    },
  ],
  'new-zealand': [
    {
      countryId: 'new-zealand',
      countryName: 'New Zealand',
      cityName: 'Auckland & Waiheke Island',
      lat: -36.8485,
      lng: 174.7633,
      continentGroup: 'Oceania',
      airportCode: 'AKL',
      highlight: 'City of Sails harbors, island vineyards & peaceful English lifestyle',
    },
    {
      countryId: 'new-zealand',
      countryName: 'New Zealand',
      cityName: 'Queenstown & Wanaka',
      lat: -45.0312,
      lng: 168.6626,
      continentGroup: 'Oceania',
      airportCode: 'ZQN',
      highlight: 'Dramatic Southern Alps lakes, hiking trails & adventure capital',
    },
    {
      countryId: 'new-zealand',
      countryName: 'New Zealand',
      cityName: 'Wellington & Nelson',
      lat: -41.2865,
      lng: 174.7762,
      continentGroup: 'Oceania',
      airportCode: 'WLG',
      highlight: 'Walkable creative harbor capital and sunny Abel Tasman bays',
    },
  ],
  fiji: [
    {
      countryId: 'fiji',
      countryName: 'Fiji',
      cityName: 'Nadi (Denarau Marina) & Coral Coast',
      lat: -17.7765,
      lng: 177.4356,
      continentGroup: 'Oceania',
      airportCode: 'NAN',
      highlight: 'Warm Pacific hospitality, English official language & island lagoons',
    },
    {
      countryId: 'fiji',
      countryName: 'Fiji',
      cityName: 'Savusavu & Suva',
      lat: -16.7784,
      lng: 179.333,
      continentGroup: 'Oceania',
      airportCode: 'SUV',
      highlight: 'Hidden paradise yacht bay, coral diving & lush rainforests',
    },
  ],
};

/**
 * Runtime registry for custom cities searched via Google Places Autocomplete or added by the user
 * so they plot at their exact coordinates on the single-country map.
 */
const CUSTOM_CITY_COORDINATE_REGISTRY: Record<string, GeoHubCoordinate> = {};

function mapRegionToContinentGroup(region: string): GeoHubCoordinate['continentGroup'] {
  const r = (region || '').toLowerCase();
  if (r.includes('america')) return 'Americas';
  if (r.includes('asia')) return 'Asia';
  if (r.includes('africa') || r.includes('middle east')) return 'Middle East & Africa';
  if (r.includes('oceania')) return 'Oceania';
  return 'Europe';
}

export function registerCustomCityCoordinate(
  countryId: string,
  countryName: string,
  cityName: string,
  lat: number,
  lng: number,
  region?: string,
  highlight?: string
): GeoHubCoordinate {
  const cleanId = String(countryId || '').toLowerCase().trim();
  const cleanCountryName = String(countryName || countryId || '').trim();
  const cleanCity = String(cityName || cleanCountryName).trim();
  const safeLat = typeof lat === 'number' && !isNaN(lat) ? lat : 0;
  const safeLng = typeof lng === 'number' && !isNaN(lng) ? lng : 0;
  const coord: GeoHubCoordinate = {
    countryId: cleanId,
    countryName: cleanCountryName,
    cityName: cleanCity,
    lat: safeLat,
    lng: safeLng,
    continentGroup: mapRegionToContinentGroup(region || 'Europe'),
    airportCode: cleanCity.slice(0, 3).toUpperCase(),
    highlight: highlight || `Custom selected city hub in ${cleanCity}, ${cleanCountryName}`,
  };
  const key = `${cleanId}::${cleanCity.toLowerCase()}`;
  CUSTOM_CITY_COORDINATE_REGISTRY[key] = coord;

  const existingList = COUNTRY_HUB_COORDINATES[cleanId] || [];
  const alreadyExists = existingList.some(
    h => h.cityName.toLowerCase() === cleanCity.toLowerCase()
  );
  if (!alreadyExists) {
    COUNTRY_HUB_COORDINATES[cleanId] = [...existingList, coord];
  }
  return coord;
}

/**
 * ISO 3166-1 alpha-2 country codes used to strictly restrict Google Places Autocomplete
 * (`includedRegionCodes: [iso2]`) to the single chosen country only.
 */
const COUNTRY_ISO2_MAP: Record<string, string> = {
  portugal: 'pt',
  spain: 'es',
  france: 'fr',
  italy: 'it',
  greece: 'gr',
  malta: 'mt',
  cyprus: 'cy',
  croatia: 'hr',
  montenegro: 'me',
  albania: 'al',
  turkey: 'tr',
  georgia: 'ge',
  bulgaria: 'bg',
  romania: 'ro',
  hungary: 'hu',
  'czech-republic': 'cz',
  poland: 'pl',
  estonia: 'ee',
  latvia: 'lv',
  lithuania: 'lt',
  slovenia: 'si',
  slovakia: 'sk',
  austria: 'at',
  switzerland: 'ch',
  germany: 'de',
  netherlands: 'nl',
  belgium: 'be',
  luxembourg: 'lu',
  ireland: 'ie',
  'united-kingdom': 'gb',
  uk: 'gb',
  denmark: 'dk',
  sweden: 'se',
  norway: 'no',
  finland: 'fi',
  iceland: 'is',
  andorra: 'ad',
  monaco: 'mc',
  serbia: 'rs',
  'north-macedonia': 'mk',
  bosnia: 'ba',
  armenia: 'am',
  thailand: 'th',
  malaysia: 'my',
  vietnam: 'vn',
  indonesia: 'id',
  philippines: 'ph',
  cambodia: 'kh',
  laos: 'la',
  singapore: 'sg',
  japan: 'jp',
  'south-korea': 'kr',
  taiwan: 'tw',
  india: 'in',
  'sri-lanka': 'lk',
  nepal: 'np',
  uzbekistan: 'uz',
  kazakhstan: 'kz',
  uae: 'ae',
  'united-arab-emirates': 'ae',
  oman: 'om',
  qatar: 'qa',
  bahrain: 'bh',
  jordan: 'jo',
  'costa-rica': 'cr',
  panama: 'pa',
  mexico: 'mx',
  colombia: 'co',
  ecuador: 'ec',
  uruguay: 'uy',
  brazil: 'br',
  argentina: 'ar',
  chile: 'cl',
  peru: 'pe',
  paraguay: 'py',
  bolivia: 'bo',
  belize: 'bz',
  'dominican-republic': 'do',
  nicaragua: 'ni',
  guatemala: 'gt',
  honduras: 'hn',
  barbados: 'bb',
  bahamas: 'bs',
  curacao: 'cw',
  aruba: 'aw',
  jamaica: 'jm',
  mauritius: 'mu',
  morocco: 'ma',
  'south-africa': 'za',
  namibia: 'na',
  kenya: 'ke',
  seychelles: 'sc',
  'cape-verde': 'cv',
  tunisia: 'tn',
  egypt: 'eg',
  rwanda: 'rw',
  tanzania: 'tz',
  ghana: 'gh',
  senegal: 'sn',
  botswana: 'bw',
  australia: 'au',
  'new-zealand': 'nz',
  fiji: 'fj',
  vanuatu: 'vu',
};

export function getCountryIso2Code(countryId: string, countryName?: string): string | undefined {
  const cleanId = countryId.toLowerCase().trim();
  if (COUNTRY_ISO2_MAP[cleanId]) return COUNTRY_ISO2_MAP[cleanId];
  if (countryName) {
    const cleanName = countryName.toLowerCase().trim().replace(/\s+/g, '-');
    if (COUNTRY_ISO2_MAP[cleanName]) return COUNTRY_ISO2_MAP[cleanName];
  }
  return undefined;
}

/**
 * Returns 4 to 8 rich city hubs for a given country, combining curated `COUNTRY_HUB_COORDINATES`,
 * `country.topCities`, and `nomadProfile.topNomadCities` with distinct non-overlapping coordinates.
 */
export function getCityHubsForCountry(country: Country): GeoHubCoordinate[] {
  const cleanId = country.id.toLowerCase().trim();
  const cleanNameKey = country.name.toLowerCase().trim().replace(/\s+/g, '-');
  const existingHubs = [
    ...(COUNTRY_HUB_COORDINATES[cleanId] || COUNTRY_HUB_COORDINATES[cleanNameKey] || []),
  ];

  const baseCoord =
    existingHubs[0] ||
    getHubCoordinatesForCountry(country.id, country.name, country.capital, country.region);

  const seenTokens = new Set<string>();
  const result: GeoHubCoordinate[] = [];

  const registerHubIfUnique = (hub: GeoHubCoordinate) => {
    const primaryToken = hub.cityName
      .toLowerCase()
      .split(/[(&,/]/)[0]
      .trim();
    if (!primaryToken || seenTokens.has(primaryToken)) return;
    seenTokens.add(primaryToken);
    result.push(hub);
  };

  existingHubs.forEach(registerHubIfUnique);

  const nomadProfile = getCountryNomadProfile(country);
  const candidateNames: { name: string; highlight?: string }[] = [];

  (country.topCities || []).forEach(tc => {
    if (tc?.name) {
      candidateNames.push({
        name: tc.name,
        highlight: tc.highlight || `${tc.vibe || 'Expat Hub'} in ${country.name}`,
      });
    }
  });

  (nomadProfile.topNomadCities || []).forEach(nc => {
    if (nc) {
      candidateNames.push({
        name: nc,
        highlight: `High-speed fiber & digital nomad hub in ${country.name}`,
      });
    }
  });

  if (country.capital) {
    candidateNames.push({
      name: country.capital,
      highlight: `Capital city, international flight gateway & cultural center of ${country.name}`,
    });
  }

  // Deterministic ring offsets around the country center for any synthesized city
  const ringOffsets: [number, number][] = [
    [0.85, -0.75],
    [-0.95, 0.85],
    [1.25, 1.1],
    [-1.15, -0.9],
    [0.55, 1.35],
    [-0.65, -1.3],
  ];

  let offsetIdx = 0;
  candidateNames.forEach(cand => {
    const primaryToken = cand.name
      .toLowerCase()
      .split(/[(&,/]/)[0]
      .trim();
    if (!primaryToken || seenTokens.has(primaryToken)) return;
    // Also skip if any existing hub already contains this city name
    const alreadySubMatched = result.some(
      h =>
        h.cityName.toLowerCase().includes(primaryToken) ||
        primaryToken.includes(h.cityName.toLowerCase().split(/[(&,/]/)[0].trim())
    );
    if (alreadySubMatched) return;

    const [dLat, dLng] = ringOffsets[offsetIdx % ringOffsets.length];
    offsetIdx++;
    registerHubIfUnique({
      countryId: cleanId,
      countryName: country.name,
      cityName: cand.name,
      lat: Number((baseCoord.lat + dLat).toFixed(4)),
      lng: Number((baseCoord.lng + dLng).toFixed(4)),
      continentGroup: baseCoord.continentGroup,
      airportCode: cand.name.slice(0, 3).toUpperCase(),
      highlight: cand.highlight || `Top expat & scouting destination in ${country.name}`,
    });
  });

  return result;
}

/**
 * Deterministic coordinate lookup for any additional country name/capital so pins never stack identically
 */
const EXTRA_COUNTRY_LOOKUP: Record<string, { lat: number; lng: number; group: GeoHubCoordinate['continentGroup'] }> = {
  nicaragua: { lat: 11.4314, lng: -85.9262, group: 'Americas' },
  guatemala: { lat: 14.5586, lng: -90.7333, group: 'Americas' },
  honduras: { lat: 16.3268, lng: -86.5378, group: 'Americas' },
  paraguay: { lat: -25.2637, lng: -57.5759, group: 'Americas' },
  bolivia: { lat: -17.7833, lng: -63.1821, group: 'Americas' },
  barbados: { lat: 13.1939, lng: -59.5432, group: 'Americas' },
  bahamas: { lat: 25.0443, lng: -77.3504, group: 'Americas' },
  curacao: { lat: 12.1696, lng: -68.99, group: 'Americas' },
  aruba: { lat: 12.5211, lng: -69.9683, group: 'Americas' },
  jamaica: { lat: 18.4762, lng: -77.8939, group: 'Americas' },
  'cape-verde': { lat: 16.5979, lng: -22.9051, group: 'Middle East & Africa' },
  tunisia: { lat: 36.8065, lng: 10.1815, group: 'Middle East & Africa' },
  egypt: { lat: 27.2579, lng: 33.8116, group: 'Middle East & Africa' },
  oman: { lat: 23.588, lng: 58.3829, group: 'Middle East & Africa' },
  qatar: { lat: 25.2854, lng: 51.531, group: 'Middle East & Africa' },
  bahrain: { lat: 26.2285, lng: 50.586, group: 'Middle East & Africa' },
  jordan: { lat: 31.9539, lng: 35.9106, group: 'Middle East & Africa' },
  rwanda: { lat: -1.9441, lng: 30.0619, group: 'Middle East & Africa' },
  tanzania: { lat: -6.1659, lng: 39.2026, group: 'Middle East & Africa' },
  ghana: { lat: 5.6037, lng: -0.187, group: 'Middle East & Africa' },
  senegal: { lat: 14.7167, lng: -17.4677, group: 'Middle East & Africa' },
  botswana: { lat: -24.6282, lng: 25.9231, group: 'Middle East & Africa' },
  singapore: { lat: 1.3521, lng: 103.8198, group: 'Asia' },
  laos: { lat: 19.8845, lng: 102.135, group: 'Asia' },
  uzbekistan: { lat: 41.2995, lng: 69.2401, group: 'Asia' },
  kazakhstan: { lat: 43.222, lng: 76.8512, group: 'Asia' },
  armenia: { lat: 40.1792, lng: 44.4991, group: 'Europe' },
  serbia: { lat: 44.7866, lng: 20.4489, group: 'Europe' },
  'north-macedonia': { lat: 41.9981, lng: 21.4254, group: 'Europe' },
  bosnia: { lat: 43.8563, lng: 18.4131, group: 'Europe' },
  andorra: { lat: 42.5063, lng: 1.5218, group: 'Europe' },
  monaco: { lat: 43.7384, lng: 7.4246, group: 'Europe' },
  luxembourg: { lat: 49.6116, lng: 6.1319, group: 'Europe' },
  belgium: { lat: 50.8503, lng: 4.3517, group: 'Europe' },
  denmark: { lat: 55.6761, lng: 12.5683, group: 'Europe' },
  sweden: { lat: 59.3293, lng: 18.0686, group: 'Europe' },
  norway: { lat: 59.9139, lng: 10.7522, group: 'Europe' },
  finland: { lat: 60.1699, lng: 24.9384, group: 'Europe' },
  iceland: { lat: 64.1466, lng: -21.9426, group: 'Europe' },
  latvia: { lat: 56.9496, lng: 24.1052, group: 'Europe' },
  lithuania: { lat: 54.6872, lng: 25.2797, group: 'Europe' },
  slovakia: { lat: 48.1486, lng: 17.1077, group: 'Europe' },
  vanuatu: { lat: -17.7333, lng: 168.3273, group: 'Oceania' },
};

/**
 * Fallback coordinate resolver for any country or city in Refirely
 */
export function getHubCoordinatesForCountry(
  countryId: string,
  countryName: string,
  cityFocus?: string,
  region?: string
): GeoHubCoordinate {
  const cleanId = countryId.toLowerCase().trim();
  const cleanNameKey = countryName.toLowerCase().trim().replace(/\s+/g, '-');

  if (cityFocus) {
    const customKey = `${cleanId}::${cityFocus.trim().toLowerCase()}`;
    if (CUSTOM_CITY_COORDINATE_REGISTRY[customKey]) {
      return CUSTOM_CITY_COORDINATE_REGISTRY[customKey];
    }
  }

  const hubs = COUNTRY_HUB_COORDINATES[cleanId] || COUNTRY_HUB_COORDINATES[cleanNameKey];
  if (hubs && hubs.length > 0) {
    if (cityFocus) {
      const cleanCityFocus = cityFocus.toLowerCase().trim();
      const firstToken = cleanCityFocus.split(/[(&,/]/)[0].trim();
      const matchedCity = hubs.find(
        h =>
          h.cityName.toLowerCase() === cleanCityFocus ||
          h.cityName.toLowerCase().includes(firstToken) ||
          cleanCityFocus.includes(h.cityName.split(/[(&,/]/)[0].trim().toLowerCase())
      );
      if (matchedCity) return matchedCity;

      // If cityFocus is a custom city in this country not in the predefined hubs, give it a deterministic offset
      let cityHash = 0;
      for (let i = 0; i < cleanCityFocus.length; i++) {
        cityHash = (cityHash * 33 + cleanCityFocus.charCodeAt(i)) % 1000;
      }
      const dLat = ((cityHash % 19) - 9) * 0.22;
      const dLng = (((cityHash >> 3) % 19) - 9) * 0.25;
      return {
        ...hubs[0],
        cityName: cityFocus,
        lat: Number((hubs[0].lat + dLat).toFixed(4)),
        lng: Number((hubs[0].lng + dLng).toFixed(4)),
        airportCode: cityFocus.slice(0, 3).toUpperCase(),
        highlight: `Scouting hub in ${cityFocus}, ${countryName}`,
      };
    }
    return hubs[0];
  }

  const extra = EXTRA_COUNTRY_LOOKUP[cleanId] || EXTRA_COUNTRY_LOOKUP[cleanNameKey];
  if (extra) {
    if (cityFocus) {
      let cityHash = 0;
      const cleanCityFocus = cityFocus.toLowerCase().trim();
      for (let i = 0; i < cleanCityFocus.length; i++) {
        cityHash = (cityHash * 33 + cleanCityFocus.charCodeAt(i)) % 1000;
      }
      const dLat = ((cityHash % 17) - 8) * 0.18;
      const dLng = (((cityHash >> 3) % 17) - 8) * 0.2;
      return {
        countryId: cleanId,
        countryName,
        cityName: cityFocus,
        lat: Number((extra.lat + dLat).toFixed(4)),
        lng: Number((extra.lng + dLng).toFixed(4)),
        continentGroup: extra.group,
        airportCode: cityFocus.slice(0, 3).toUpperCase(),
        highlight: `Scouting basecamp in ${cityFocus}, ${countryName}`,
      };
    }
    return {
      countryId: cleanId,
      countryName,
      cityName: cityFocus || countryName,
      lat: extra.lat,
      lng: extra.lng,
      continentGroup: extra.group,
      airportCode: countryName.slice(0, 3).toUpperCase(),
      highlight: `Scouting basecamp in ${cityFocus || countryName}`,
    };
  }

  // Fallback by region with deterministic hash offset so custom countries never stack on the exact same pixel
  const fallbackRegionMap: Record<string, { lat: number; lng: number; group: GeoHubCoordinate['continentGroup'] }> = {
    Europe: { lat: 41.9028, lng: 12.4964, group: 'Europe' },
    'Southeast Asia': { lat: 13.7563, lng: 100.5018, group: 'Asia' },
    'Asia & Middle East': { lat: 25.2048, lng: 55.2708, group: 'Middle East & Africa' },
    Americas: { lat: 9.9281, lng: -84.0907, group: 'Americas' },
    'North & Central America': { lat: 19.4326, lng: -99.1332, group: 'Americas' },
    'South America': { lat: -34.9011, lng: -56.1645, group: 'Americas' },
    Africa: { lat: -20.0089, lng: 57.5816, group: 'Middle East & Africa' },
    Oceania: { lat: -33.8688, lng: 151.2093, group: 'Oceania' },
  };

  let hash = 0;
  for (let i = 0; i < cleanId.length; i++) {
    hash = (hash * 31 + cleanId.charCodeAt(i)) % 1000;
  }
  const latOffset = ((hash % 25) - 12) * 0.45;
  const lngOffset = (((hash >> 3) % 25) - 12) * 0.55;

  const fb = fallbackRegionMap[region || 'Europe'] || fallbackRegionMap.Europe;
  return {
    countryId: cleanId,
    countryName,
    cityName: cityFocus || countryName,
    lat: fb.lat + latOffset,
    lng: fb.lng + lngOffset,
    continentGroup: fb.group,
    airportCode: countryName.slice(0, 3).toUpperCase(),
    highlight: `Scouting basecamp in ${cityFocus || countryName}`,
  };
}

/**
 * Great-circle Haversine distance in kilometers between two coordinates
 */
export function calculateDistanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;

  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return Math.round(R * c);
}

/**
 * Builds an interest-specific activity tailored to a specific country & city
 */
function buildInterestActivityForCity(
  interestId: ScoutInterestId,
  weekNum: number,
  actIdx: number,
  cityFocus: string,
  countryName: string,
  countryObj?: Country
): WeeklyScoutingActivity {
  const cleanCityFocus = cityFocus.split('&')[0].split('(')[0].trim() || cityFocus;
  const rawCountryDistrict = countryObj?.adultEntertainment?.topVenuesOrDistricts?.[0] || '';
  const topDistrict =
    rawCountryDistrict &&
    rawCountryDistrict.toLowerCase().includes(cleanCityFocus.toLowerCase())
      ? rawCountryDistrict
      : `${cleanCityFocus}’s premier social & dining district`;
  const internetMbps = countryObj ? getCountryNomadProfile(countryObj).verifiedInternetMbps : 160;
  const visaName = countryObj?.visa.retirementVisaName || 'long-term residency';

  switch (interestId) {
    case 'hiking':
      return {
        id: `wk-${weekNum}-int-hiking-${actIdx}`,
        title: `Morning panoramic ridge & coastal trail hike near ${cityFocus}, followed by a local trail-runners or hiking club meetup`,
        category: 'Outdoors & Adventure',
        durationHint: 'Morning · 3–4 hrs',
        interestTag: 'Hiking & Trails',
        spotlightDetail: `Best outdoor weather months: ${countryObj?.climate.bestMonths || 'Spring & Autumn'} (${countryObj?.climate.annualSunnyDays || 260} sunny days/yr)`,
        completed: false,
      };
    case 'surfing':
      return {
        id: `wk-${weekNum}-int-surfing-${actIdx}`,
        title: `Test morning surf breaks, beach clubs & waterfront boardwalks around ${cityFocus} (board rental & water quality check)`,
        category: 'Outdoors & Adventure',
        durationHint: 'Early Morning / Sunset',
        interestTag: 'Surfing & Ocean',
        spotlightDetail: `Avg temperature ${countryObj?.climate.averageTempC || 22}°C · Coastal lifestyle audit`,
        completed: false,
      };
    case 'nightlife':
      return {
        id: `wk-${weekNum}-int-nightlife-${actIdx}`,
        title: `Evening rooftop lounge & live music crawl around ${topDistrict} to experience ${cityFocus} after dark`,
        category: 'Social & Nightlife',
        durationHint: 'Friday / Saturday 8 PM+',
        interestTag: 'Nightlife & Lounges',
        spotlightDetail: `${countryObj?.adultEntertainment?.nightlifeVibrancy || 'Vibrant Social Scene'} · Safety score ${countryObj?.lifestyle.safetyScore || 85}/100`,
        completed: false,
      };
    case 'dating':
      return {
        id: `wk-${weekNum}-int-dating-${actIdx}`,
        title: `Attend a cosmopolitan expat-local social mixer or language exchange cafe evening in ${cityFocus}`,
        category: 'Social & Nightlife',
        durationHint: 'Mid-Week / Weekend Evening',
        interestTag: 'Dating & Social',
        spotlightDetail:
          countryObj?.demographics?.datingCultureSummary?.slice(0, 110) ||
          `Welcoming international and local social scene in ${cityFocus}`,
        completed: false,
      };
    case 'architecture':
      return {
        id: `wk-${weekNum}-int-arch-${actIdx}`,
        title: `Architectural & heritage walking tour through ${cityFocus}’s historic residential quarters, plazas & restored townhouses`,
        category: 'Culture & Leisure',
        durationHint: 'Afternoon · 2.5 hrs',
        interestTag: 'Architecture & Heritage',
        spotlightDetail: `Walkability score ${countryObj?.lifestyle.walkabilityScore || 84}/100 in central districts`,
        completed: false,
      };
    case 'culture':
      return {
        id: `wk-${weekNum}-int-culture-${actIdx}`,
        title: `Explore ${cityFocus}’s morning municipal market, sample regional gastronomy & visit a flagship cultural museum`,
        category: 'Culture & Leisure',
        durationHint: 'Mid-Day · 3 hrs',
        interestTag: 'Culture & Gastronomy',
        spotlightDetail: `Local dining benchmark ~$${countryObj?.costOfLiving.mealInexpensiveUSD || 12} per traditional meal`,
        completed: false,
      };
    case 'volunteering':
      return {
        id: `wk-${weekNum}-int-volunteer-${actIdx}`,
        title: `Join a half-day community volunteering session in ${cityFocus} (coastal eco-cleanup, community garden, or English conversation circle)`,
        category: 'Community & Hobbies',
        durationHint: 'Mid-Week Morning',
        interestTag: 'Volunteering & Impact',
        spotlightDetail: `Connect with ${countryObj?.lifestyle.expatCommunitySize || 'local & expat'} community networks`,
        completed: false,
      };
    case 'nature':
      return {
        id: `wk-${weekNum}-int-nature-${actIdx}`,
        title: `Full-day nature immersion to botanical reserves, lakes, or national parks within 60 minutes of ${cityFocus}`,
        category: 'Outdoors & Adventure',
        durationHint: 'Weekend Day Trip',
        interestTag: 'Nature & Parks',
        spotlightDetail: `${countryObj?.climate.category || 'Scenic'} microclimate & outdoor biodiversity`,
        completed: false,
      };
    case 'hobbies':
      return {
        id: `wk-${weekNum}-int-hobbies-${actIdx}`,
        title: `Book a trial session at a local padel/tennis club, golf course, yoga studio, or artisan workshop in ${cityFocus}`,
        category: 'Community & Hobbies',
        durationHint: 'Flexible Afternoon',
        interestTag: 'Hobbies & Wellness',
        spotlightDetail: `Test weekly membership rates & social club friendliness in ${cityFocus}`,
        completed: false,
      };
    case 'coworking':
      return {
        id: `wk-${weekNum}-int-cowork-${actIdx}`,
        title: `Run a full workday from ${cityFocus}’s top coworking space & verify ${internetMbps}+ Mbps fiber + 5G backup`,
        category: 'Digital Nomad & Tech',
        durationHint: 'Weekday 9 AM–4 PM',
        interestTag: 'Fast Fiber & Coworking',
        spotlightDetail: `Verified ~${internetMbps} Mbps fiber · English proficiency: ${countryObj?.lifestyle.englishProficiency || 'High'}`,
        completed: false,
      };
    case 'healthcare':
      return {
        id: `wk-${weekNum}-int-health-${actIdx}`,
        title: `Tour an international private clinic in ${cityFocus}, verify English-speaking specialists & check pharmacy availability`,
        category: 'Healthcare & Safety',
        durationHint: 'Weekday Morning',
        interestTag: 'Healthcare & Longevity',
        spotlightDetail: `Healthcare index ${countryObj?.lifestyle.healthcareScore || 85}/100 · Private plan ~$${countryObj?.costOfLiving.healthcareMonthlyUSD || 95}/mo`,
        completed: false,
      };
    case 'residency':
    default:
      return {
        id: `wk-${weekNum}-int-residency-${actIdx}`,
        title: `View 2 long-term rental apartments in ${cityFocus} (est. $${countryObj?.costOfLiving.rent1BedCenterUSD || 900}/mo) & review ${visaName} requirements`,
        category: 'Housing & Legal',
        durationHint: 'Mid-Week Appointment',
        interestTag: 'Apartments & Visas',
        spotlightDetail: `1-Bed Center ~$${countryObj?.costOfLiving.rent1BedCenterUSD || 900}/mo · Outside ~$${countryObj?.costOfLiving.rent1BedOutsideUSD || 650}/mo`,
        completed: false,
      };
  }
}

/**
 * Generates a visually rich, interest-personalized week-by-week scouting itinerary across all stops
 */
export function generateWeeklyItineraryForStops(
  stops: ScoutTripStop[],
  countries: Country[],
  focusPreference: ScoutingFocusPreference = 'nomad-fiber',
  selectedInterests: ScoutInterestId[] = ['culture', 'architecture', 'hiking', 'nightlife'],
  customHobbies: string[] = []
): WeeklyItineraryBlock[] {
  const blocks: WeeklyItineraryBlock[] = [];
  const accentPalette: WeeklyItineraryBlock['accentColor'][] = [
    'teal',
    'indigo',
    'violet',
    'emerald',
    'amber',
    'rose',
  ];

  const activeInterests: ScoutInterestId[] =
    selectedInterests.length > 0
      ? selectedInterests
      : focusPreference === 'nomad-fiber'
      ? ['coworking', 'culture', 'nightlife', 'hiking']
      : focusPreference === 'coastal-lifestyle'
      ? ['surfing', 'architecture', 'culture', 'dating']
      : ['healthcare', 'residency', 'culture', 'nature'];

  let globalWeekCounter = 1;

  const sortedStops = [...stops].sort((a, b) =>
    (a.arrivalDate || '').localeCompare(b.arrivalDate || '')
  );

  sortedStops.forEach((stop, stopIdx) => {
    const countryObj = countries.find(
      c =>
        c.id.toLowerCase() === stop.countryId.toLowerCase() ||
        c.name.toLowerCase() === stop.countryName.toLowerCase()
    );
    const nomadProfile = countryObj ? getCountryNomadProfile(countryObj) : null;
    const countryPhotos = getCountryPhotoConfig(stop.countryId.toLowerCase(), countryObj?.imageUrl);

    // Calculate stop duration in days and number of weeks (at least 1 week per stop, up to 6 weeks per stop)
    const startObj = new Date(`${stop.arrivalDate}T00:00:00Z`);
    const endObj = new Date(`${stop.departureDate}T00:00:00Z`);
    const rawDays =
      !isNaN(startObj.getTime()) && !isNaN(endObj.getTime()) && endObj >= startObj
        ? Math.floor((endObj.getTime() - startObj.getTime()) / (1000 * 60 * 60 * 24)) + 1
        : 14;

    const numWeeksForStop = Math.max(1, Math.min(6, Math.ceil(rawDays / 7)));
    const primaryCity =
      stop.cityFocus ||
      countryObj?.topCities?.[0]?.name ||
      nomadProfile?.topNomadCities?.[0] ||
      countryObj?.capital ||
      stop.countryName;
    const cleanPrimaryCity = primaryCity.split('&')[0].split('(')[0].trim() || primaryCity;

    for (let w = 0; w < numWeeksForStop; w++) {
      const weekStart = new Date(startObj.getTime());
      weekStart.setUTCDate(weekStart.getUTCDate() + w * 7);
      const weekEnd = new Date(weekStart.getTime());
      weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
      if (!isNaN(endObj.getTime()) && weekEnd > endObj) {
        weekEnd.setTime(endObj.getTime());
      }

      const startIso = !isNaN(weekStart.getTime())
        ? weekStart.toISOString().split('T')[0]
        : stop.arrivalDate;
      const endIso = !isNaN(weekEnd.getTime())
        ? weekEnd.toISOString().split('T')[0]
        : stop.departureDate;

      const accent = accentPalette[(globalWeekCounter - 1) % accentPalette.length];
      // Strictly keep every week of this stop focused on its chosen city (primaryCity)
      const activeCityForWeek = primaryCity;

      // Rotate through the user's selected interests across weeks so every week feels fresh and personalized
      const weekInterest1 = activeInterests[(w * 2) % activeInterests.length];
      const weekInterest2 = activeInterests[(w * 2 + 1) % activeInterests.length];
      const weekInterest3 = activeInterests[(w * 2 + 2) % activeInterests.length];

      const uniqueWeekInterests = Array.from(
        new Set([weekInterest1, weekInterest2, weekInterest3])
      );

      const interestObj1 = SCOUT_INTEREST_CATALOG.find(i => i.id === weekInterest1);
      const interestObj2 = SCOUT_INTEREST_CATALOG.find(i => i.id === weekInterest2);

      // Select visual photo for this week
      const heroPhotoUrl =
        w === 0 && interestObj1
          ? interestObj1.photoUrl
          : w === 1
          ? countryPhotos.photoUrl
          : w === 2
          ? countryPhotos.fallbackPhotoUrl
          : interestObj2?.photoUrl || countryPhotos.photoUrl;

      const matchedLabels = uniqueWeekInterests
        .map(id => SCOUT_INTEREST_CATALOG.find(cat => cat.id === id)?.label || id)
        .concat(customHobbies.slice(0, 2));

      // Build activities combining core scouting essentials + the user's chosen interests + custom hobbies
      const activities: WeeklyScoutingActivity[] = [];

      // 1. Core foundation activity for the week stage
      if (w === 0) {
        activities.push({
          id: `wk-${globalWeekCounter}-core-1`,
          title: `Soft Landing & Day/Night Street Walk in ${activeCityForWeek}: audit morning cafe vibe, transit & evening walkability`,
          category: 'Neighborhood & Vibe',
          durationHint: 'Days 1–2',
          interestTag: 'Arrival & Vibe',
          spotlightDetail: `${countryObj?.tagline || `Establishing basecamp in ${activeCityForWeek}`}`,
          completed: false,
        });
      } else if (w === 1) {
        activities.push({
          id: `wk-${globalWeekCounter}-core-1`,
          title: `Real-World Cost & Housing Audit in ${activeCityForWeek}: price a full weekly market basket & inspect 2 long-term rentals`,
          category: 'Housing & Legal',
          durationHint: 'Early Week',
          interestTag: 'Cost & Housing',
          spotlightDetail: `Target monthly burn benchmark: $${stop.monthlyBurnRateUSD.toLocaleString()}/mo`,
          completed: false,
        });
      } else if (w === 2) {
        activities.push({
          id: `wk-${globalWeekCounter}-core-1`,
          title: `Outer Neighborhood & Surrounding Microclimate Audit in ${activeCityForWeek}: compare central vs. residential districts`,
          category: 'Neighborhood & Vibe',
          durationHint: 'Days 1–3',
          interestTag: 'District Comparison',
          spotlightDetail: `Comparing central vs. residential pockets of ${activeCityForWeek}`,
          completed: false,
        });
      } else {
        activities.push({
          id: `wk-${globalWeekCounter}-core-1`,
          title: `Resident Routine Simulation & Final ${activeCityForWeek} Scorecard: reconcile 30-day budget & verify visa/healthcare contacts`,
          category: 'Housing & Legal',
          durationHint: 'Full Week Rhythm',
          interestTag: 'Final Verdict',
          spotlightDetail: `Visa pathway: ${stop.visaStatusTag}`,
          completed: false,
        });
      }

      // 2. Inject tailored activities for each of the user's selected interests for this week
      uniqueWeekInterests.forEach((intId, idx) => {
        activities.push(
          buildInterestActivityForCity(
            intId,
            globalWeekCounter,
            idx + 1,
            activeCityForWeek,
            stop.countryName,
            countryObj
          )
        );
      });

      // 3. If the user entered custom hobbies (e.g. "Padel", "Salsa", "Photography"), inject a dedicated custom hobby activity!
      if (customHobbies.length > 0) {
        const hobbyForWeek = customHobbies[(globalWeekCounter - 1) % customHobbies.length];
        activities.push({
          id: `wk-${globalWeekCounter}-hobby-custom`,
          title: `Personal Passion Session — ${hobbyForWeek} in ${activeCityForWeek}: visit top local club/group and meet fellow enthusiasts`,
          category: 'Community & Hobbies',
          durationHint: 'Weekend / Evening',
          interestTag: hobbyForWeek,
          spotlightDetail: `Custom lifestyle priority tailored for your ${activeCityForWeek} scout`,
          completed: false,
        });
      }

      const interestHeadline =
        interestObj1 && interestObj2
          ? `${interestObj1.label.split('&')[0].trim()} & ${interestObj2.label.split('&')[0].trim()}`
          : interestObj1?.label || 'Lifestyle & Relocation';

      const themeTitle =
        w === 0
          ? `Arrival in ${activeCityForWeek}: ${interestHeadline} Immersion`
          : w === 1
          ? `Living Like a Local in ${activeCityForWeek}: ${interestHeadline}`
          : w === 2
          ? `Neighborhood Deep-Dive in ${activeCityForWeek}: ${interestHeadline}`
          : `Deep Residency Rhythm in ${activeCityForWeek}: ${interestHeadline}`;

      const themeSubtitle = `Curated around your interests (${matchedLabels.slice(0, 3).join(', ')}) while auditing real living costs and neighborhood quality in ${activeCityForWeek}, ${stop.countryName}.`;

      const matchingTopCity = countryObj?.topCities?.find(tc =>
        tc.name.toLowerCase().includes(cleanPrimaryCity.toLowerCase())
      );
      const localHighlightSpot =
        matchingTopCity?.highlight || `${cleanPrimaryCity} Historic & Lifestyle Hub`;

      blocks.push({
        id: `week-block-${stop.id}-${w + 1}`,
        weekNumber: globalWeekCounter,
        stopIndex: stopIdx,
        stopId: stop.id,
        countryId: stop.countryId,
        countryName: stop.countryName,
        countryFlag: stop.countryFlag,
        cityFocus: activeCityForWeek,
        startDate: startIso,
        endDate: endIso,
        themeTitle,
        themeSubtitle,
        accentColor: accent,
        heroPhotoUrl,
        fallbackPhotoUrl: countryPhotos.fallbackPhotoUrl,
        gradientFallback: interestObj1?.fallbackGradient || countryPhotos.gradientFallback,
        landmarkCaption: `${activeCityForWeek} · ${stop.countryName}`,
        matchedInterests: matchedLabels,
        localHighlightSpot,
        activities,
      });

      globalWeekCounter++;
    }
  });

  return blocks;
}

export type ScoutBudgetTier = 'economic' | 'medium' | 'luxury';

export type ScoutExperienceLensId =
  | 'solo-women-safe'
  | 'content-creator'
  | 'vip-exclusive'
  | 'retiree-accessible'
  | 'nomad-social';

export interface ScoutBudgetTierMeta {
  id: ScoutBudgetTier;
  label: string;
  shortLabel: string;
  emoji: string;
  tagline: string;
  subtitle: string;
  priceMultiplierLabel: string;
  cardBg: string;
  badgeBg: string;
  activeBorder: string;
}

export const SCOUT_BUDGET_TIERS: ScoutBudgetTierMeta[] = [
  {
    id: 'economic',
    label: 'Economic & High-Value',
    shortLabel: 'Economic',
    emoji: '🪙',
    tagline: 'Authentic street markets, community coworking, public trails & local bistros',
    subtitle: 'Authentic street markets, community coworking, public trails & local bistros',
    priceMultiplierLabel: '$ · Value Local Pricing',
    cardBg: 'from-emerald-50/80 via-white to-teal-50/60',
    badgeBg: 'bg-emerald-50/90 text-emerald-950 border-emerald-300',
    activeBorder: 'border-emerald-300 ring-emerald-300/30',
  },
  {
    id: 'medium',
    label: 'Medium Comfort & Balanced',
    shortLabel: 'Medium Comfort',
    emoji: '⚖️',
    tagline: 'Boutique cafes, verified rooftop lounges, guided adventures & turnkey rentals',
    subtitle: 'Boutique cafes, verified rooftop lounges, guided adventures & turnkey rentals',
    priceMultiplierLabel: '$$ · Balanced Expat Standard',
    cardBg: 'from-sky-50/80 via-white to-indigo-50/60',
    badgeBg: 'bg-sky-50/90 text-sky-950 border-sky-300',
    activeBorder: 'border-sky-300 ring-sky-300/30',
  },
  {
    id: 'luxury',
    label: 'Luxury, Fine Dining & Concierge',
    shortLabel: 'Luxury & VIP',
    emoji: '💎',
    tagline: '5-star beach clubs, private yacht/helicopter charters, Michelin dining & VIP clinics',
    subtitle: '5-star beach clubs, private yacht/helicopter charters, Michelin dining & VIP clinics',
    priceMultiplierLabel: '$$$ · Executive & Luxury',
    cardBg: 'from-violet-50/80 via-white to-purple-50/60',
    badgeBg: 'bg-violet-50/90 text-violet-950 border-violet-300',
    activeBorder: 'border-violet-300 ring-violet-300/30',
  },
];

export interface ScoutExperienceLensMeta {
  id: ScoutExperienceLensId;
  label: string;
  shortLabel: string;
  shortBadge: string;
  emoji: string;
  description: string;
  shortDesc: string;
  colorClasses: string;
  badgeClass: string;
}

export const SCOUT_EXPERIENCE_LENSES: ScoutExperienceLensMeta[] = [
  {
    id: 'solo-women-safe',
    label: 'Solo Women Safe Places',
    shortLabel: 'Solo Female Safe',
    shortBadge: '🛡️ Solo Female Safe',
    emoji: '🛡️',
    description:
      'Prioritizes well-lit walkable neighborhoods, vetted daytime/early-evening venues, female-friendly social mixers & high-security transport.',
    shortDesc:
      'Prioritizes well-lit walkable neighborhoods, vetted daytime/early-evening venues, female-friendly social mixers & high-security transport.',
    colorClasses: 'bg-sky-50/90 text-sky-900 border-sky-200',
    badgeClass: 'bg-sky-50/90 text-sky-900 border-sky-200',
  },
  {
    id: 'content-creator',
    label: 'Good for Content Creators',
    shortLabel: 'Creator & Aesthetic',
    shortBadge: '📸 Creator & Aesthetic',
    emoji: '📸',
    description:
      'Highlights golden-hour viewpoints, photogenic architecture, drone-friendly scenic lookouts, design cafes & fast upload fiber.',
    shortDesc:
      'Highlights golden-hour viewpoints, photogenic architecture, drone-friendly scenic lookouts, design cafes & fast upload fiber.',
    colorClasses: 'bg-violet-50/90 text-violet-900 border-violet-200',
    badgeClass: 'bg-violet-50/90 text-violet-900 border-violet-200',
  },
  {
    id: 'vip-exclusive',
    label: 'Rich / Exclusive / Private VIP',
    shortLabel: 'Exclusive & Private VIP',
    shortBadge: '👑 Exclusive & Private VIP',
    emoji: '👑',
    description:
      'Curates members-only clubs, private marinas, gated luxury enclaves, bespoke concierge tours & wealth/tax advisory consultations.',
    shortDesc:
      'Curates members-only clubs, private marinas, gated luxury enclaves, bespoke concierge tours & wealth/tax advisory consultations.',
    colorClasses: 'bg-purple-50/90 text-purple-900 border-purple-200',
    badgeClass: 'bg-purple-50/90 text-purple-900 border-purple-200',
  },
  {
    id: 'retiree-accessible',
    label: 'Calm, Flat & Retiree Accessible',
    shortLabel: 'Step-Free & Calm Pace',
    shortBadge: '🌿 Step-Free & Calm Pace',
    emoji: '🌿',
    description:
      'Focuses on flat waterfront promenades, quiet residential blocks, JCI private hospital tours & relaxed cultural mornings.',
    shortDesc:
      'Focuses on flat waterfront promenades, quiet residential blocks, JCI private hospital tours & relaxed cultural mornings.',
    colorClasses: 'bg-emerald-50/90 text-emerald-900 border-emerald-200',
    badgeClass: 'bg-emerald-50/90 text-emerald-900 border-emerald-200',
  },
  {
    id: 'nomad-social',
    label: 'High-Energy Nomad & Founder Community',
    shortLabel: 'Nomad & Founder Hub',
    shortBadge: '⚡ Nomad & Founder Hub',
    emoji: '⚡',
    description:
      'Centers on 250+ Mbps coworking campuses, Thursday expat mixers, padel/surf clubs & fast social integration.',
    shortDesc:
      'Centers on 250+ Mbps coworking campuses, Thursday expat mixers, padel/surf clubs & fast social integration.',
    colorClasses: 'bg-indigo-50/90 text-indigo-900 border-indigo-200',
    badgeClass: 'bg-indigo-50/90 text-indigo-900 border-indigo-200',
  },
];

