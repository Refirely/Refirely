import { Country, ScoutScheduledItineraryItem, ScoutTripStop } from '../types';
import {
  ScoutInterestId,
  SCOUT_INTEREST_CATALOG,
  ScoutBudgetTier,
  ScoutExperienceLensId,
} from './scoutCoordinatesAndItineraries';
import { getCountryNomadProfile } from './countryNomadProfiles';
import { getCountryPhotoConfig } from '../components/CountryThumbnail';
import { resolveUniqueVenuePhotoUrl } from '../utils/placeThumbnailResolver';

export interface CuratedVenueSeed {
  idSuffix: string;
  interestId: ScoutInterestId;
  categoryLabel: string;
  title: string;
  neighborhood: string;
  description: string;
  insiderTip: string;
  rating: number;
  reviewCount: number;
  priceRange: string;
  timeOfDay: 'Morning' | 'Afternoon' | 'Evening' | 'Night' | 'Full Day';
  defaultDaySlot: string;
  defaultWeekOffset: number; // 0 = Week 1 of stop, 1 = Week 2 of stop, etc.
  photoUrl: string;
  fallbackGradient: string;
  googleMapsQuery: string;
  preselectedByDefault?: boolean;
}

export const DAY_SLOT_OPTIONS: string[] = [
  'Day 1 (Mon)',
  'Day 2 (Tue)',
  'Day 3 (Wed)',
  'Day 4 (Thu)',
  'Day 5 (Fri)',
  'Day 6 (Sat)',
  'Day 7 (Sun)',
];

export const TIME_OF_DAY_OPTIONS: ('Morning' | 'Afternoon' | 'Evening' | 'Night' | 'Full Day')[] = [
  'Morning',
  'Afternoon',
  'Evening',
  'Night',
  'Full Day',
];

export function buildGoogleMapsSearchUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/**
 * Strictly City-Scoped Curated Venues & Operators (`CITY_FAMOUS_VENUES`)
 * Each key is `<countryId>:<citySlug>` and contains ONLY venues located in that specific city/region stop.
 * Never mixes venues from different cities into the same stop.
 */
const CITY_FAMOUS_VENUES: Record<string, { matchKeywords: string[]; seeds: CuratedVenueSeed[] }> = {
  // ==================== INDIA CITIES ====================
  'india:goa': {
    matchKeywords: ['goa', 'assagao', 'anjuna', 'panjim', 'panaji', 'siolim', 'morjim', 'ashwem', 'palolem'],
    seeds: [
      {
        idSuffix: 'goa-soro-joseph-nightlife',
        interestId: 'nightlife',
        categoryLabel: '🍸 Villa Cocktail Lounge & Latin Quarter Bar',
        title: 'Soro The Village Pub (Assagao) & Joseph Bar (Fontainhas, Panjim)',
        neighborhood: 'Assagao & Fontainhas, North Goa',
        description:
          'Experience Goa’s iconic vintage-industrial garden pub in Assagao paired with Panjim’s intimate heritage tavern famous for small-batch Cabo and Urak cocktails.',
        insiderTip:
          'Friday live retro/funk nights at Soro Assagao and early evening drinks on Joseph Bar’s pastel lane draw Goa’s creative and expat crowd.',
        rating: 4.8,
        reviewCount: 6420,
        priceRange: '$8–$16 craft cocktails & tapas',
        timeOfDay: 'Night',
        defaultDaySlot: 'Day 5 (Fri)',
        defaultWeekOffset: 0,
        photoUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-indigo-900 via-violet-900 to-slate-900',
        googleMapsQuery: 'Soro The Village Pub Assagao Goa India',
        preselectedByDefault: true,
      },
      {
        idSuffix: 'goa-thalassa-dating',
        interestId: 'dating',
        categoryLabel: '🥂 Sunset Clifftop & Riverside Dining',
        title: 'Thalassa Greek Waterfront (Siolim) & Jamun (Assagao)',
        neighborhood: 'Siolim Chapora Estuary & Assagao, Goa',
        description:
          'Golden-hour sunset dining overlooking the Chapora River estuary at Thalassa, followed by candlelit courtyard dining under mango trees at Jamun Assagao.',
        insiderTip:
          'Reserve a waterfront table at Thalassa 45 minutes before sunset for spectacular golden-hour views and relaxed social conversation.',
        rating: 4.8,
        reviewCount: 7310,
        priceRange: '$18–$35 sunset dinner & wine',
        timeOfDay: 'Evening',
        defaultDaySlot: 'Day 4 (Thu)',
        defaultWeekOffset: 0,
        photoUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-sky-900 via-indigo-900 to-slate-900',
        googleMapsQuery: 'Thalassa Siolim Goa India',
        preselectedByDefault: true,
      },
      {
        idSuffix: 'goa-artjuna-clay-cowork',
        interestId: 'coworking',
        categoryLabel: '💻 Garden Coworking & Specialty Roastery',
        title: 'Artjuna Garden Cafe & Clay Coworking Space (Anjuna)',
        neighborhood: 'Anjuna & Assagao, North Goa',
        description:
          'Work beneath tropical banyan trees in Goa with 200+ Mbps dual-fiber, artisanal sourdough bakery, specialty Indian pour-over coffee, and creator networking.',
        insiderTip:
          'Morning 9:30 AM tables at Artjuna and Clay Coworking are the easiest places in Goa to meet long-stay digital nomads and founders.',
        rating: 4.9,
        reviewCount: 4890,
        priceRange: '$7–$14 day pass / brunch',
        timeOfDay: 'Morning',
        defaultDaySlot: 'Day 1 (Mon)',
        defaultWeekOffset: 0,
        photoUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-slate-800 via-indigo-950 to-slate-900',
        googleMapsQuery: 'Artjuna Cafe Anjuna Goa India',
        preselectedByDefault: true,
      },
      {
        idSuffix: 'goa-netravali-dudhsagar-hike',
        interestId: 'hiking',
        categoryLabel: '🥾 Western Ghats Waterfall & Spice Trail',
        title: 'Netravali Wildlife Sanctuary & Dudhsagar Waterfall Rainforest Trek',
        neighborhood: 'Sanguem / Western Ghats, South-East Goa',
        description:
          'Guided rainforest trek past organic spice plantations, ancient basalt temples, and cascading four-tiered waterfalls in Goa’s UNESCO Western Ghats.',
        insiderTip:
          'Start at 7:00 AM with a certified Goa Forest eco-guide to swim in natural freshwater canyon pools before midday.',
        rating: 4.9,
        reviewCount: 3920,
        priceRange: '$20–$40 guided forest trek',
        timeOfDay: 'Morning',
        defaultDaySlot: 'Day 6 (Sat)',
        defaultWeekOffset: 0,
        photoUrl: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-emerald-900 via-teal-950 to-slate-900',
        googleMapsQuery: 'Netravali Wildlife Sanctuary Goa India',
        preselectedByDefault: true,
      },
      {
        idSuffix: 'goa-fontainhas-arch',
        interestId: 'architecture',
        categoryLabel: '🏛️ Portuguese Latin Quarter & Fort Walk',
        title: 'Fontainhas UNESCO Latin Quarter (Panjim) & Reis Magos Fort',
        neighborhood: 'Fontainhas (Panjim) & Verem, Goa',
        description:
          'Stroll ochre-and-indigo 18th-century Portuguese villas, oyster-shell windows, azulejo street plaques, and the restored 1551 Reis Magos hilltop bastion.',
        insiderTip:
          'Stop at Confeitaria 31 de Janeiro in Fontainhas for warm Goan bebinca and wooden-oven pastries at 9:00 AM.',
        rating: 4.9,
        reviewCount: 5410,
        priceRange: 'Free walk / $12 heritage tour',
        timeOfDay: 'Morning',
        defaultDaySlot: 'Day 2 (Tue)',
        defaultWeekOffset: 0,
        photoUrl: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-indigo-900 via-sky-900 to-slate-900',
        googleMapsQuery: 'Fontainhas Latin Quarter Panjim Goa India',
        preselectedByDefault: true,
      },
      {
        idSuffix: 'goa-ashwem-surf',
        interestId: 'surfing',
        categoryLabel: '🏄 Arabian Sea Surf & Beach Club',
        title: 'Vaayu Ocean Adventures (Ashwem Beach) & Palm Grove Beach Club',
        neighborhood: 'Ashwem & Mandrem Coast, North Goa',
        description:
          'Gentle sandy-bottom morning surf waves, stand-up paddleboarding, and kitesurfing on Goa’s cleanest, widest northern beach stretch.',
        insiderTip:
          'Morning high-tide sessions between 7:30 AM and 10:30 AM offer glassy waist-to-chest-high waves ideal for longboarding.',
        rating: 4.8,
        reviewCount: 2180,
        priceRange: '$22 surf lesson & board rental',
        timeOfDay: 'Morning',
        defaultDaySlot: 'Day 3 (Wed)',
        defaultWeekOffset: 0,
        photoUrl: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-cyan-900 via-sky-950 to-slate-900',
        googleMapsQuery: 'Vaayu Ocean Adventures Ashwem Beach Goa India',
        preselectedByDefault: true,
      },
    ],
  },

  'india:bengaluru': {
    matchKeywords: ['bengaluru', 'bangalore', 'indiranagar', 'koramangala', 'whitefield', 'jayanagar'],
    seeds: [
      {
        idSuffix: 'blr-toit-arbor-nightlife',
        interestId: 'nightlife',
        categoryLabel: '🍺 Flagship Craft Microbrewery & Rooftop',
        title: 'Toit Brewpub (100 Feet Rd, Indiranagar) & Skyye Lounge (UB City)',
        neighborhood: 'Indiranagar & Lavelle Road, Bengaluru',
        description:
          'Bengaluru’s legendary brick-and-wood craft microbrewery in Indiranagar pouring fresh Basmati Blonde & Tint-in-Wit, paired with 16th-floor open-air skyline views at UB City.',
        insiderTip:
          'Walk 12th Main Indiranagar on Thursday or Friday evening to compare 10+ boutique cocktail bars and live acoustic pubs within 4 blocks.',
        rating: 4.8,
        reviewCount: 9840,
        priceRange: '$10–$20 craft beer & cocktails',
        timeOfDay: 'Night',
        defaultDaySlot: 'Day 5 (Fri)',
        defaultWeekOffset: 0,
        photoUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-indigo-900 via-violet-900 to-slate-900',
        googleMapsQuery: 'Toit Brewpub Indiranagar Bengaluru India',
        preselectedByDefault: true,
      },
      {
        idSuffix: 'blr-olive-toast-dating',
        interestId: 'dating',
        categoryLabel: '🥂 Courtyard Bistro & Botanical Gin Bar',
        title: 'Olive Beach Courtyard (Ashok Nagar) & Toast & Tonic (Wood Street)',
        neighborhood: 'Richmond Town & Ashok Nagar, Bengaluru',
        description:
          'Sun-dappled white-pebble Mediterranean courtyard under bougainvillea canopies at Olive Beach and East-Village-style artisanal gin & tonic dining at Toast & Tonic.',
        insiderTip:
          'Sunday brunch or Thursday 7:30 PM courtyard tables at Olive Beach are Bengaluru’s premier social setting for expats, founders, and creatives.',
        rating: 4.8,
        reviewCount: 5620,
        priceRange: '$20–$38 dinner & craft gin',
        timeOfDay: 'Evening',
        defaultDaySlot: 'Day 4 (Thu)',
        defaultWeekOffset: 0,
        photoUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-sky-900 via-indigo-900 to-slate-900',
        googleMapsQuery: 'Olive Beach Wood Street Ashok Nagar Bengaluru India',
        preselectedByDefault: true,
      },
      {
        idSuffix: 'blr-wework-thirdwave-cowork',
        interestId: 'coworking',
        categoryLabel: '💻 Gigabit Tech Campus & Specialty Roastery',
        title: 'WeWork Prestige Atlanta (Koramangala) & Araku Coffee Flagship (Indiranagar)',
        neighborhood: 'Koramangala 80 Feet Rd & 12th Main Indiranagar, Bengaluru',
        description:
          'Test 300+ Mbps enterprise fiber in India’s startup capital alongside Araku’s award-winning sensory coffee bar and rooftop workspace.',
        insiderTip:
          'Indiranagar Defense Colony and Koramangala 4th Block offer leafy, walkable streets right next to Bengaluru’s highest concentration of AI and SaaS founders.',
        rating: 4.9,
        reviewCount: 4310,
        priceRange: '$8–$16 day pass / specialty coffee',
        timeOfDay: 'Morning',
        defaultDaySlot: 'Day 1 (Mon)',
        defaultWeekOffset: 0,
        photoUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-slate-800 via-indigo-950 to-slate-900',
        googleMapsQuery: 'Araku Coffee 12th Main Indiranagar Bengaluru India',
        preselectedByDefault: true,
      },
      {
        idSuffix: 'blr-nandi-hills-hike',
        interestId: 'hiking',
        categoryLabel: '🥾 Cloud-Fortress Sunrise Hike & Paragliding',
        title: 'Nandi Hills Sunrise Cliff Trail & Savandurga Monolith Trek',
        neighborhood: 'Chikkaballapur Highlands (North Bengaluru)',
        description:
          'Climb to the 1,478m ancient hill fortress of Tipu Sultan above a sea of morning clouds, or hike Asia’s largest monolith rock formation at Savandurga.',
        insiderTip:
          'Depart Bengaluru at 5:00 AM on Saturday to reach Nandi Hills viewpoint for the 6:15 AM sunrise above the cloud inversion.',
        rating: 4.8,
        reviewCount: 6890,
        priceRange: '$5 entry / $25 guided trek',
        timeOfDay: 'Morning',
        defaultDaySlot: 'Day 6 (Sat)',
        defaultWeekOffset: 0,
        photoUrl: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-emerald-900 via-teal-950 to-slate-900',
        googleMapsQuery: 'Nandi Hills Sunrise Viewpoint Bengaluru India',
        preselectedByDefault: true,
      },
      {
        idSuffix: 'blr-palace-lalbagh-arch',
        interestId: 'architecture',
        categoryLabel: '🏛️ Tudor Palace & 1889 Crystal Glasshouse',
        title: 'Bangalore Palace Tudor Grounds & Lalbagh Botanical Glass House',
        neighborhood: 'Vasanth Nagar & Mavalli, Bengaluru',
        description:
          'Explore the 1878 Windsor-inspired Tudor stone castle and stroll 240 acres of century-old tropical trees and the 1889 Victorian Glass House at Lalbagh.',
        insiderTip:
          'Finish your morning walk with a legendary crispy masala dosa and filter coffee at MTR (Mavalli Tiffin Room, est. 1924) right beside Lalbagh Gate.',
        rating: 4.9,
        reviewCount: 8420,
        priceRange: '$6 palace & botanical entry',
        timeOfDay: 'Morning',
        defaultDaySlot: 'Day 2 (Tue)',
        defaultWeekOffset: 0,
        photoUrl: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-indigo-900 via-sky-900 to-slate-900',
        googleMapsQuery: 'Lalbagh Botanical Garden Glass House Bengaluru India',
        preselectedByDefault: true,
      },
      {
        idSuffix: 'blr-manipal-hospital',
        interestId: 'healthcare',
        categoryLabel: '🏥 NABH/JCI Flagship Hospital Tour',
        title: 'Manipal Hospital (Old Airport Rd) & Aster CMI International Wing',
        neighborhood: 'HAL Old Airport Road, Bengaluru',
        description:
          'Audit one of India’s premier tertiary care medical centers right next to Indiranagar, featuring dedicated international patient lounges and executive longevity panels.',
        insiderTip:
          'Comprehensive preventive blood, cardiac, and imaging executive checkups in Bengaluru cost ~$90–$160 with same-day digital results.',
        rating: 4.8,
        reviewCount: 4120,
        priceRange: '$95 executive health checkup',
        timeOfDay: 'Morning',
        defaultDaySlot: 'Day 3 (Wed)',
        defaultWeekOffset: 1,
        photoUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-sky-900 via-teal-950 to-slate-900',
        googleMapsQuery: 'Manipal Hospital Old Airport Road Bengaluru India',
        preselectedByDefault: false,
      },
    ],
  },

  'india:mumbai': {
    matchKeywords: ['mumbai', 'bombay', 'bandra', 'colaba', 'worli', 'juhu', 'lower parel'],
    seeds: [
      {
        idSuffix: 'bom-aer-bonobo-nightlife',
        interestId: 'nightlife',
        categoryLabel: '🍸 34th-Floor Open-Air Skybar & Bandra Rooftop',
        title: 'AER Rooftop Lounge (Four Seasons Worli) & Bonobo (Bandra West)',
        neighborhood: 'Worli Sea Face & Bandra West, Mumbai',
        description:
          'Sip sunset cocktails 34 stories above the Arabian Sea and Bandra-Worli Sea Link at AER, followed by indie/electronic rooftop vibes at Bonobo in Bandra.',
        insiderTip:
          'Bandra’s 16th Road, Pali Hill, and Chapel Road are Mumbai’s most walkable boutique neighborhoods for evening cafe-hopping.',
        rating: 4.8,
        reviewCount: 5190,
        priceRange: '$14–$26 cocktails',
        timeOfDay: 'Night',
        defaultDaySlot: 'Day 5 (Fri)',
        defaultWeekOffset: 0,
        photoUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-indigo-900 via-violet-900 to-slate-900',
        googleMapsQuery: 'Bonobo Bandra West Mumbai India',
        preselectedByDefault: true,
      },
      {
        idSuffix: 'bom-subko-veronicas-cowork',
        interestId: 'coworking',
        categoryLabel: '💻 Heritage Roastery & Creative Coworking',
        title: 'Subko Craftery (Chapel Rd, Bandra) & WeWork Enam Sambhav (BKC)',
        neighborhood: 'Bandra West & Bandra Kurla Complex, Mumbai',
        description:
          'Work inside a restored 1920s Bandra bungalow roasting specialty Indian single-origin coffee and bean-to-bar cacao, or test enterprise fiber in BKC.',
        insiderTip:
          'Arrive at Subko Chapel Road by 9:00 AM to grab the upstairs veranda table and sample their cardamom podi sourdough.',
        rating: 4.9,
        reviewCount: 3840,
        priceRange: '$8–$18 coffee & coworking',
        timeOfDay: 'Morning',
        defaultDaySlot: 'Day 1 (Mon)',
        defaultWeekOffset: 0,
        photoUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-slate-800 via-indigo-950 to-slate-900',
        googleMapsQuery: 'Subko Specialty Coffee Roasters Chapel Road Bandra Mumbai',
        preselectedByDefault: true,
      },
      {
        idSuffix: 'bom-kalaghoda-marine-arch',
        interestId: 'architecture',
        categoryLabel: '🏛️ UNESCO Victorian Gothic & Art Deco Walk',
        title: 'Kala Ghoda Art Precinct, Chhatrapati Shivaji Terminus & Marine Drive',
        neighborhood: 'Fort, Kala Ghoda & Marine Drive, South Mumbai',
        description:
          'Walk through the world’s second-largest collection of Art Deco sea-facing buildings along Marine Drive and the UNESCO Victorian Gothic precinct of Fort.',
        insiderTip:
          'Stop at Kala Ghoda Café and Jehangir Art Gallery in the afternoon, then watch sunset along the Queen’s Necklace promenade.',
        rating: 4.9,
        reviewCount: 7410,
        priceRange: 'Free walk / $15 heritage guide',
        timeOfDay: 'Afternoon',
        defaultDaySlot: 'Day 2 (Tue)',
        defaultWeekOffset: 0,
        photoUrl: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-indigo-900 via-sky-900 to-slate-900',
        googleMapsQuery: 'Kala Ghoda Art Precinct Fort Mumbai India',
        preselectedByDefault: true,
      },
      {
        idSuffix: 'bom-kanheri-hike',
        interestId: 'hiking',
        categoryLabel: '🥾 Forest Trail & 1st-Century Basalt Caves',
        title: 'Sanjay Gandhi National Park Trail & Kanheri Buddhist Caves Trek',
        neighborhood: 'Borivali Forest Reserve, Mumbai',
        description:
          'Hike shaded teak-and-bamboo forest trails inside Mumbai’s 104 sq km national park to 109 ancient rock-cut basalt caves and hilltop water cisterns.',
        insiderTip:
          'Rent a bicycle at the park gate at 7:30 AM to ride the 7km forest road to the Kanheri trailhead while spotted deer graze alongside.',
        rating: 4.8,
        reviewCount: 5120,
        priceRange: '$4 park & cave entry',
        timeOfDay: 'Morning',
        defaultDaySlot: 'Day 6 (Sat)',
        defaultWeekOffset: 0,
        photoUrl: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-emerald-900 via-teal-950 to-slate-900',
        googleMapsQuery: 'Kanheri Caves Sanjay Gandhi National Park Mumbai',
        preselectedByDefault: true,
      },
    ],
  },

  'india:pune': {
    matchKeywords: ['pune', 'koregaon', 'kalyani', 'baner', 'viman nagar'],
    seeds: [
      {
        idSuffix: 'pnq-effingut-nightlife',
        interestId: 'nightlife',
        categoryLabel: '🍺 Craft Brewhouse & Garden Lounge',
        title: 'Effingut Brewerkz & Cobbler & Crew Craft Cocktail Bar',
        neighborhood: 'Koregaon Park & Kalyani Nagar, Pune',
        description:
          'Sample 12+ small-batch craft beers on tap in Koregaon Park’s leafy Lane 6 and award-winning artisanal cocktails at Cobbler & Crew.',
        insiderTip:
          'Koregaon Park Lanes 5, 6, and 7 are shaded by giant banyan trees and offer some of Western India’s safest, most walkable evening dining.',
        rating: 4.8,
        reviewCount: 4180,
        priceRange: '$9–$18 craft beer & cocktails',
        timeOfDay: 'Night',
        defaultDaySlot: 'Day 5 (Fri)',
        defaultWeekOffset: 0,
        photoUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-indigo-900 via-violet-900 to-slate-900',
        googleMapsQuery: 'Effingut Brewerkz Koregaon Park Pune India',
        preselectedByDefault: true,
      },
      {
        idSuffix: 'pnq-sante-dating',
        interestId: 'dating',
        categoryLabel: '🥂 Banyan Courtyard Dining & Bistro',
        title: 'Santé Spa Cuisine & Dario’s Trattoria Courtyard (Koregaon Park)',
        neighborhood: 'Lane 1, Koregaon Park, Pune',
        description:
          'Tranquil open-air garden courtyards in Koregaon Park serving farm-to-table cuisine, wood-fired sourdough pizzas, and organic wines.',
        insiderTip:
          'Combine an afternoon walk through Osho Teerth Park with a 7:00 PM garden table at Santé or Dario’s.',
        rating: 4.8,
        reviewCount: 3690,
        priceRange: '$14–$28 courtyard dinner',
        timeOfDay: 'Evening',
        defaultDaySlot: 'Day 4 (Thu)',
        defaultWeekOffset: 0,
        photoUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-sky-900 via-indigo-900 to-slate-900',
        googleMapsQuery: 'Sante Spa Cuisine Koregaon Park Pune India',
        preselectedByDefault: true,
      },
      {
        idSuffix: 'pnq-sinhagad-hike',
        interestId: 'hiking',
        categoryLabel: '🥾 Sahyadri Mountain Fort Ridge Trek',
        title: 'Sinhagad Fort Cloud-Ridge Trek & Khadakwasla Reservoir View',
        neighborhood: 'Sahyadri Hills (South-West Pune)',
        description:
          'Hike the historic 1,312m Maratha cliff fortress overlooking the Sahyadri valleys and Khadakwasla dam, famous for cool mountain breezes and local pithla-bhakri stalls.',
        insiderTip:
          'Start the 2.7km trail at 6:30 AM and enjoy fresh clay-pot curd and warm bhakri at the summit ramparts.',
        rating: 4.9,
        reviewCount: 6250,
        priceRange: 'Free trail / $15 guided trek',
        timeOfDay: 'Morning',
        defaultDaySlot: 'Day 6 (Sat)',
        defaultWeekOffset: 0,
        photoUrl: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-emerald-900 via-teal-950 to-slate-900',
        googleMapsQuery: 'Sinhagad Fort Trek Pune Maharashtra India',
        preselectedByDefault: true,
      },
    ],
  },

  'india:kochi': {
    matchKeywords: ['kochi', 'cochin', 'varkala', 'kerala', 'munnar', 'alleppey'],
    seeds: [
      {
        idSuffix: 'cok-seagull-varkala-nightlife',
        interestId: 'nightlife',
        categoryLabel: '🍹 Harbour Sunset Deck & Cliffside Lounge',
        title: 'Seagull Waterfront Bar (Fort Kochi) & Darjeeling Cafe (Varkala North Cliff)',
        neighborhood: 'Calvathy Rd (Fort Kochi) & Varkala Cliff, Kerala',
        description:
          'Watch cargo ships and fishing dhows glide past on the Arabian Sea channel from Seagull’s overwater deck in Fort Kochi, or enjoy acoustic sunset sessions atop Varkala’s red laterite cliffs.',
        insiderTip:
          'Grab a waterside table at Seagull at 5:30 PM as the Chinese Fishing Nets light up across the harbor.',
        rating: 4.7,
        reviewCount: 3420,
        priceRange: '$8–$16 drinks & fresh catch',
        timeOfDay: 'Evening',
        defaultDaySlot: 'Day 5 (Fri)',
        defaultWeekOffset: 0,
        photoUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-indigo-900 via-violet-900 to-slate-900',
        googleMapsQuery: 'Seagull Restaurant Bar Fort Kochi Kerala India',
        preselectedByDefault: true,
      },
      {
        idSuffix: 'cok-kashi-dating',
        interestId: 'dating',
        categoryLabel: '🥂 Contemporary Art Courtyard & Heritage Dining',
        title: 'Kashi Art Café (Burgher Street) & Brunton Boatyard Harbour Terrace',
        neighborhood: 'Burgher Street & Princess Street, Fort Kochi',
        description:
          'Dine inside a whitewashed Dutch-era art gallery courtyard filled with contemporary Kerala sculptures, followed by sunset tea or wine on the harbor pier.',
        insiderTip:
          'Fort Kochi’s Princess Street and Rose Street are car-calmed, shaded by rain trees, and ideal for solo female travelers and couples.',
        rating: 4.8,
        reviewCount: 4890,
        priceRange: '$10–$25 art cafe & waterfront dining',
        timeOfDay: 'Evening',
        defaultDaySlot: 'Day 4 (Thu)',
        defaultWeekOffset: 0,
        photoUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-sky-900 via-indigo-900 to-slate-900',
        googleMapsQuery: 'Kashi Art Cafe Burgher Street Fort Kochi Kerala',
        preselectedByDefault: true,
      },
      {
        idSuffix: 'cok-varkala-surf',
        interestId: 'surfing',
        categoryLabel: '🏄 Red-Cliff Surf School & Backwater Kayak',
        title: 'Soul & Surf Kerala (Varkala Cliff) & Kadamakudy Backwater Kayaking (Kochi)',
        neighborhood: 'Edava / Varkala Beach & Kadamakudy Islands, Kerala',
        description:
          'Catch warm Indian Ocean waves beneath Varkala’s dramatic red cliffs with ISA-certified coaches, or paddle sunrise kayaks through Kochi’s serene backwater lagoons.',
        insiderTip:
          'Join Soul & Surf’s sunset cliff rooftop yoga session after your morning surf lesson.',
        rating: 4.9,
        reviewCount: 2150,
        priceRange: '$20–$35 surf or kayak session',
        timeOfDay: 'Morning',
        defaultDaySlot: 'Day 3 (Wed)',
        defaultWeekOffset: 0,
        photoUrl: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-cyan-900 via-sky-950 to-slate-900',
        googleMapsQuery: 'Soul and Surf Varkala Kerala India',
        preselectedByDefault: true,
      },
      {
        idSuffix: 'cok-fort-kochi-arch',
        interestId: 'architecture',
        categoryLabel: '🏛️ Dutch, Portuguese & Spice-Merchant Quarter',
        title: 'Fort Kochi Chinese Fishing Nets, Mattancherry Palace & Jew Town Walk',
        neighborhood: 'Fort Kochi & Mattancherry, Kochi',
        description:
          'Explore 16th-century Portuguese churches, Dutch merchant bungalows, the 1568 Paradesi Synagogue with hand-painted Canton tiles, and aromatic spice warehouses.',
        insiderTip:
          'Take the ₹6 ($0.08) public passenger ferry from Ernakulam mainland to Fort Kochi at 8:30 AM for harbor breezes.',
        rating: 4.9,
        reviewCount: 6180,
        priceRange: 'Free walk / $10 heritage guide',
        timeOfDay: 'Morning',
        defaultDaySlot: 'Day 2 (Tue)',
        defaultWeekOffset: 0,
        photoUrl: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-indigo-900 via-sky-900 to-slate-900',
        googleMapsQuery: 'Fort Kochi Chinese Fishing Nets Mattancherry Kerala',
        preselectedByDefault: true,
      },
    ],
  },

  'india:udaipur': {
    matchKeywords: ['udaipur', 'jaipur', 'rajasthan', 'jodhpur', 'pushkar'],
    seeds: [
      {
        idSuffix: 'udr-ambrai-palladio-dating',
        interestId: 'dating',
        categoryLabel: '🥂 Lake Pichola Palace View & Royal Lounge',
        title: 'Ambrai Ghat Waterfront Terrace & Upre by 1559 AD Rooftop (Lake Pichola)',
        neighborhood: 'Amet Haveli / Hanuman Ghat, Lake Pichola, Udaipur',
        description:
          'Candlelit lakeside dining right on the water’s edge looking directly across at the illuminated marble City Palace and Jag Mandir island palace.',
        insiderTip:
          'Book table #1 or #2 along the water rail at Ambrai for 6:00 PM sunset reflections over Lake Pichola.',
        rating: 4.9,
        reviewCount: 6840,
        priceRange: '$18–$36 royal lakefront dinner',
        timeOfDay: 'Evening',
        defaultDaySlot: 'Day 4 (Thu)',
        defaultWeekOffset: 0,
        photoUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-sky-900 via-indigo-900 to-slate-900',
        googleMapsQuery: 'Ambrai Restaurant Amet Haveli Lake Pichola Udaipur',
        preselectedByDefault: true,
      },
      {
        idSuffix: 'udr-fateh-nightlife',
        interestId: 'nightlife',
        categoryLabel: '🍸 Heritage Haveli Rooftop & Sunset Cocktail Bar',
        title: 'Sunset Terrace at Fateh Prakash Palace & Panera Bar (City Palace Complex)',
        neighborhood: 'City Palace Waterfront & Lal Ghat, Udaipur',
        description:
          'Sip signature royal cocktails and single malts on the grand colonnaded palace terrace overlooking Lake Pichola and the Aravalli mountains.',
        insiderTip:
          'Arrive at 5:15 PM right after boarding the royal wooden boat cruise around Jag Mandir.',
        rating: 4.8,
        reviewCount: 3910,
        priceRange: '$12–$24 heritage cocktails',
        timeOfDay: 'Evening',
        defaultDaySlot: 'Day 5 (Fri)',
        defaultWeekOffset: 0,
        photoUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-indigo-900 via-violet-900 to-slate-900',
        googleMapsQuery: 'Sunset Terrace Fateh Prakash Palace Udaipur India',
        preselectedByDefault: true,
      },
      {
        idSuffix: 'udr-city-palace-arch',
        interestId: 'architecture',
        categoryLabel: '🏛️ Marble Courtyards, Mirror Palaces & Ghat Walk',
        title: 'Udaipur City Palace Peacock Courtyard, Jagdish Temple & Gangaur Ghat',
        neighborhood: 'Old City / Lal Ghat, Udaipur',
        description:
          'Walk through 400 years of Mewar marble balconies, glass-mosaic Mor Chowk peacocks, and lakeside stone ghats—a paradise for content creators and photographers.',
        insiderTip:
          'Visit Gangaur Ghat and Bagore Ki Haveli between 7:00 AM and 8:30 AM for golden sunrise light with zero crowds.',
        rating: 4.9,
        reviewCount: 9240,
        priceRange: '$8 palace museum entry',
        timeOfDay: 'Morning',
        defaultDaySlot: 'Day 2 (Tue)',
        defaultWeekOffset: 0,
        photoUrl: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-indigo-900 via-sky-900 to-slate-900',
        googleMapsQuery: 'City Palace Gangaur Ghat Udaipur Rajasthan India',
        preselectedByDefault: true,
      },
      {
        idSuffix: 'udr-bahubali-badi-hike',
        interestId: 'hiking',
        categoryLabel: '🥾 Turquoise Lake Ridge & Monsoon Palace Trek',
        title: 'Bahubali Hills (Badi Lake) Sunrise Ridge Hike & Sajjangarh Sanctuary Trail',
        neighborhood: 'Badi Lake & Aravalli Hills, Udaipur',
        description:
          'Short 25-minute rocky ridge climb to a breathtaking 360° viewpoint above the emerald waters of Badi Lake framed by the Aravalli hills.',
        insiderTip:
          'Stop at Jheel Ginger Coffee Bar on Fateh Sagar Lake or Lal Ghat on your way back for fresh espresso and waffles.',
        rating: 4.9,
        reviewCount: 4510,
        priceRange: '$2 trail entry',
        timeOfDay: 'Morning',
        defaultDaySlot: 'Day 6 (Sat)',
        defaultWeekOffset: 0,
        photoUrl: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-emerald-900 via-teal-950 to-slate-900',
        googleMapsQuery: 'Bahubali Hills Badi Lake Udaipur Rajasthan India',
        preselectedByDefault: true,
      },
    ],
  },

  'india:rishikesh': {
    matchKeywords: ['rishikesh', 'dehradun', 'dharamkot', 'dharamshala', 'bir', 'mcleodganj', 'mussoorie', 'manali'],
    seeds: [
      {
        idSuffix: 'ded-triund-ganges-hike',
        interestId: 'hiking',
        categoryLabel: '🪂 Himalayan Ridge Trek, Rafting & Paragliding',
        title: 'Kunjapuri Sunrise Himalayan Trek, Ganges White-Water Rafting & Bir Paragliding',
        neighborhood: 'Tapovan (Rishikesh) & Kangra Valley Foothills',
        description:
          'Trek to panoramic snow-peak viewpoints in the Garhwal Himalayas, paddle Grade III turquoise rapids on the Ganges, or fly tandem paragliding at Bir Billing.',
        insiderTip:
          'Book morning 8:00 AM rafting runs from Shivpuri to Laxman Jhula for sparkling water and calm canyon winds.',
        rating: 4.9,
        reviewCount: 5480,
        priceRange: '$18–$55 guided trek / rafting / flight',
        timeOfDay: 'Morning',
        defaultDaySlot: 'Day 6 (Sat)',
        defaultWeekOffset: 0,
        photoUrl: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-emerald-900 via-teal-950 to-slate-900',
        googleMapsQuery: 'Kunjapuri Devi Temple Trek Rishikesh Uttarakhand India',
        preselectedByDefault: true,
      },
      {
        idSuffix: 'ded-beatles-cafe-culture',
        interestId: 'culture',
        categoryLabel: '🎭 Ganga Aarti Ceremony & Beatles Ashram Walk',
        title: 'Chaurasi Kutia (Beatles Ashram) Mural Walk & Parmarth Niketan Sunset Aarti',
        neighborhood: 'Swarg Ashram & Ram Jhula, Rishikesh',
        description:
          'Explore the forest meditation domes and cathedral mural halls where the Beatles wrote the White Album in 1968, followed by the candlelit evening Ganga Aarti song ceremony.',
        insiderTip:
          'Arrive at Parmarth Niketan Ghat by 5:30 PM to sit on the river steps as oil lamps float down the Ganges at dusk.',
        rating: 4.9,
        reviewCount: 6910,
        priceRange: '$7 ashram forest entry',
        timeOfDay: 'Afternoon',
        defaultDaySlot: 'Day 2 (Tue)',
        defaultWeekOffset: 0,
        photoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-indigo-900 via-violet-900 to-slate-900',
        googleMapsQuery: 'Beatles Ashram Chaurasi Kutia Parmarth Niketan Rishikesh',
        preselectedByDefault: true,
      },
      {
        idSuffix: 'ded-tapovan-cowork',
        interestId: 'coworking',
        categoryLabel: '💻 Riverview Cafe Coworking & Yoga Sanctuary',
        title: '60’s Cafe Delmar / Tat Cafe (Tapovan) & Bunkstay Mountain Coworking',
        neighborhood: 'Upper Tapovan & Laxman Jhula, Rishikesh',
        description:
          'Work from open-air cliff balconies overlooking the turquoise curve of the Ganges with fiber Wi-Fi, organic smoothie bowls, and drop-in Iyengar/Ashtanga yoga halls.',
        insiderTip:
          'Upper Tapovan offers quiet hillside apartments with fiber internet and 10-minute walks to waterfall trails.',
        rating: 4.8,
        reviewCount: 3120,
        priceRange: '$6–$12 cafe coworking & brunch',
        timeOfDay: 'Morning',
        defaultDaySlot: 'Day 1 (Mon)',
        defaultWeekOffset: 0,
        photoUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-slate-800 via-indigo-950 to-slate-900',
        googleMapsQuery: 'Tat Cafe Laxman Jhula Tapovan Rishikesh India',
        preselectedByDefault: true,
      },
    ],
  },

  'india:pondicherry': {
    matchKeywords: ['pondicherry', 'puducherry', 'white town', 'auroville', 'chennai'],
    seeds: [
      {
        idSuffix: 'pny-villashanti-dating',
        interestId: 'dating',
        categoryLabel: '🥂 French Colonial Courtyard & Bistro',
        title: 'Villa Shanti Courtyard & Coromandel Cafe (Rue Romain Rolland)',
        neighborhood: 'White Town (French Quarter), Pondicherry',
        description:
          'Dine beneath towering palms and mustard-yellow French colonial arches in White Town’s two most celebrated courtyard bistros.',
        insiderTip:
          'Book an outdoor courtyard table at Villa Shanti for 7:30 PM after an evening stroll along the car-free Rock Beach Promenade.',
        rating: 4.8,
        reviewCount: 5340,
        priceRange: '$14–$28 French-Tamil bistro dinner',
        timeOfDay: 'Evening',
        defaultDaySlot: 'Day 4 (Thu)',
        defaultWeekOffset: 0,
        photoUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-sky-900 via-indigo-900 to-slate-900',
        googleMapsQuery: 'Villa Shanti Suffren Street White Town Pondicherry India',
        preselectedByDefault: true,
      },
      {
        idSuffix: 'pny-whitetown-arch',
        interestId: 'architecture',
        categoryLabel: '🏛️ French Quarter Bougainvillea Lanes & Auroville',
        title: 'Rue Dumas French Quarter Walk, Baker Street Boulangerie & Auroville Matrimandir',
        neighborhood: 'White Town & Auroville, Pondicherry',
        description:
          'Cycle past pastel-yellow French mansions draped in magenta bougainvillea, enjoy authentic French croissants at Baker Street, and visit the golden geodesic dome of Auroville.',
        insiderTip:
          'Morning 7:30 AM to 9:30 AM on Rue Romain Rolland and Rue Suffren is one of India’s most peaceful, photogenic walks.',
        rating: 4.9,
        reviewCount: 6120,
        priceRange: 'Free walk / $8 cycle tour',
        timeOfDay: 'Morning',
        defaultDaySlot: 'Day 2 (Tue)',
        defaultWeekOffset: 0,
        photoUrl: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-indigo-900 via-sky-900 to-slate-900',
        googleMapsQuery: 'White Town Promenade Beach Pondicherry India',
        preselectedByDefault: true,
      },
      {
        idSuffix: 'pny-kallialay-surf',
        interestId: 'surfing',
        categoryLabel: '🏄 Bay of Bengal Surf & Serenity Beach',
        title: 'Kallialay Surf School (Serenity Beach) & Catamaran Ocean Ride',
        neighborhood: 'Serenity Beach / Kottakuppam, Pondicherry',
        description:
          'Learn to surf or catch point-break waves at Pondicherry’s pioneering surf club on Serenity Beach, followed by fresh espresso at Marc’s Cafe.',
        insiderTip:
          'Serenity Beach’s rock jetty creates a long, clean right-hand wave during morning swells.',
        rating: 4.8,
        reviewCount: 2490,
        priceRange: '$18 surf session & board',
        timeOfDay: 'Morning',
        defaultDaySlot: 'Day 3 (Wed)',
        defaultWeekOffset: 0,
        photoUrl: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-cyan-900 via-sky-950 to-slate-900',
        googleMapsQuery: 'Kallialay Surf School Serenity Beach Pondicherry India',
        preselectedByDefault: true,
      },
    ],
  },

  // ==================== PORTUGAL CITIES ====================
  'portugal:lisbon': {
    matchKeywords: ['lisbon', 'lisboa', 'cascais', 'sintra', 'estoril', 'oeiras'],
    seeds: [
      {
        idSuffix: 'lis-park-rooftop',
        interestId: 'nightlife',
        categoryLabel: '🍸 Rooftop Lounge & Nightlife',
        title: 'PARK Rooftop Bar (Bairro Alto) & Pavilhão Chinês',
        neighborhood: 'Calçada do Combro / Bairro Alto, Lisbon',
        description:
          'Famous elevated garden terrace hidden atop a 6th-floor parking structure with sweeping views of the 25 de Abril Bridge and Tagus River sunset.',
        insiderTip:
          'Enter through the parking garage elevator on Calçada do Combro 58; arrive around 6:00 PM for golden hour.',
        rating: 4.6,
        reviewCount: 5410,
        priceRange: '€10–€16 cocktails',
        timeOfDay: 'Evening',
        defaultDaySlot: 'Day 5 (Fri)',
        defaultWeekOffset: 0,
        photoUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-indigo-950 via-purple-950 to-slate-900',
        googleMapsQuery: 'Park Bar Calçada do Combro 58 Lisbon Portugal',
        preselectedByDefault: true,
      },
      {
        idSuffix: 'lis-principe-real-dating',
        interestId: 'dating',
        categoryLabel: '🥂 Dating & Social Kiosk Plazas',
        title: 'Príncipe Real Garden Kiosks & Time Out Market (Cais do Sodré)',
        neighborhood: 'Praça do Príncipe Real & Ribeira, Lisbon',
        description:
          'Open-air cedar tree plaza kiosks serving Portuguese Vinho Verde, paired with Lisbon’s liveliest culinary hall and Thursday expat-local social mixers.',
        insiderTip:
          'Praça das Flores and Quiosque do Príncipe Real at 6:30 PM are Lisbon’s most effortless spots to meet international professionals and locals.',
        rating: 4.8,
        reviewCount: 7820,
        priceRange: '€15–€30 wine & petiscos',
        timeOfDay: 'Evening',
        defaultDaySlot: 'Day 4 (Thu)',
        defaultWeekOffset: 0,
        photoUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-sky-900 via-indigo-950 to-slate-900',
        googleMapsQuery: 'Jardim do Principe Real Lisbon Portugal',
        preselectedByDefault: true,
      },
      {
        idSuffix: 'lis-cabo-roca-hike',
        interestId: 'hiking',
        categoryLabel: '🥾 Atlantic Cliff Trail & Paragliding',
        title: 'Cabo da Roca to Praia da Ursa Trail & Arrabida Paragliding',
        neighborhood: 'Sintra-Cascais Natural Park, Lisbon Coast',
        description:
          'Hike the dramatic wild Atlantic cliff path at mainland Europe’s westernmost promontory or fly tandem coastal paragliding over Praia das Bicas.',
        insiderTip:
          'Wear grippy trail shoes for the final descent to Praia da Ursa and stop in Azenhas do Mar for cliffside grilled sea bass.',
        rating: 4.9,
        reviewCount: 4190,
        priceRange: 'Free trail / €75 tandem flight',
        timeOfDay: 'Morning',
        defaultDaySlot: 'Day 6 (Sat)',
        defaultWeekOffset: 0,
        photoUrl: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-emerald-900 via-teal-950 to-slate-900',
        googleMapsQuery: 'Trilho Praia da Ursa Cabo da Roca Sintra Portugal',
        preselectedByDefault: true,
      },
      {
        idSuffix: 'lis-carcavelos-surf',
        interestId: 'surfing',
        categoryLabel: '🏄 Surfing & Cascais Marina',
        title: 'Carcavelos Surf School & Bar do Guincho Beach Club',
        neighborhood: 'Carcavelos & Cascais Coastal Line, Lisbon',
        description:
          'Take the 25-minute scenic coastal train from Cais do Sodré for morning Atlantic waves, wetsuit/board rental, and oceanfront lunch in Cascais.',
        insiderTip:
          'Walk the Paredão coastal boardwalk between Estoril and Cascais to audit retiree and family life by the sea.',
        rating: 4.8,
        reviewCount: 2640,
        priceRange: '€25 board + wetsuit session',
        timeOfDay: 'Morning',
        defaultDaySlot: 'Day 3 (Wed)',
        defaultWeekOffset: 0,
        photoUrl: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-cyan-900 via-sky-950 to-slate-900',
        googleMapsQuery: 'Carcavelos Surf School Cascais Portugal',
        preselectedByDefault: true,
      },
      {
        idSuffix: 'lis-alfama-arch',
        interestId: 'architecture',
        categoryLabel: '🏛️ Architecture, Tram 28 & Fado',
        title: 'Alfama Azulejo Quarter, Miradouro de Santa Luzia & Clube de Fado',
        neighborhood: 'Alfama & Graça Historic Hills, Lisbon',
        description:
          'Explore medieval Moorish alleys, hand-painted tile facades, bougainvillea belvederes, and authentic acoustic Fado guitar beside Lisbon Cathedral.',
        insiderTip:
          'Start at Miradouro da Senhora do Monte at 4:00 PM and walk downhill through Alfama so you avoid steep climbs.',
        rating: 4.9,
        reviewCount: 6320,
        priceRange: 'Free walk / €35 Fado dinner',
        timeOfDay: 'Afternoon',
        defaultDaySlot: 'Day 2 (Tue)',
        defaultWeekOffset: 0,
        photoUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-indigo-900 via-violet-950 to-slate-900',
        googleMapsQuery: 'Miradouro de Santa Luzia Alfama Lisbon Portugal',
        preselectedByDefault: true,
      },
      {
        idSuffix: 'lis-second-home-cowork',
        interestId: 'coworking',
        categoryLabel: '💻 Biophilic Coworking & Fiber',
        title: 'Second Home Lisboa (Time Out Market) & Outsite Cais do Sodré',
        neighborhood: 'Avenida 24 de Julho / Cais do Sodré, Lisbon',
        description:
          'Work inside Lisbon’s famous plant-filled studio above Mercado da Ribeira with 300+ Mbps fiber, member surf club, and D8 Nomad Visa workshops.',
        insiderTip:
          'Book a trial day pass on Thursday to join their weekly Cultural Hour drinks with founders and remote engineers.',
        rating: 4.8,
        reviewCount: 1490,
        priceRange: '€25 day pass',
        timeOfDay: 'Morning',
        defaultDaySlot: 'Day 1 (Mon)',
        defaultWeekOffset: 0,
        photoUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-slate-800 via-indigo-950 to-slate-900',
        googleMapsQuery: 'Second Home Lisboa Mercado da Ribeira Lisbon Portugal',
        preselectedByDefault: true,
      },
    ],
  },

  'portugal:porto': {
    matchKeywords: ['porto', 'matosinhos', 'gaia', 'foz'],
    seeds: [
      {
        idSuffix: 'opo-base-galeria-nightlife',
        interestId: 'nightlife',
        categoryLabel: '🍸 Olive-Grove Garden Bar & Galeria de Paris',
        title: 'BASE Porto Open-Air Garden Lounge (Clérigos) & Aduela Taberna',
        neighborhood: 'Passeio dos Clérigos & Rua das Oliveiras, Porto',
        description:
          'Relax on rooftop lawn lounges surrounded by century-old olive trees right beside Clérigos Tower, then stroll one block to Aduela and Galeria de Paris.',
        insiderTip:
          'Rua Galeria de Paris and Rua Cândido dos Reis come alive after 9:30 PM on Fridays with live jazz, wine bars, and friendly northern Portuguese crowds.',
        rating: 4.8,
        reviewCount: 6190,
        priceRange: '€7–€14 wine & craft cocktails',
        timeOfDay: 'Night',
        defaultDaySlot: 'Day 5 (Fri)',
        defaultWeekOffset: 0,
        photoUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-indigo-950 via-purple-950 to-slate-900',
        googleMapsQuery: 'Base Porto Passeio dos Clerigos Porto Portugal',
        preselectedByDefault: true,
      },
      {
        idSuffix: 'opo-ribeira-grahams-dating',
        interestId: 'dating',
        categoryLabel: '🥂 Douro River Terrace & Port Wine Cellar',
        title: 'Graham’s 1890 Port Lodge Terrace (Gaia) & Cais da Ribeira Promenade',
        neighborhood: 'Vila Nova de Gaia & Ribeira Riverfront, Porto',
        description:
          'Sip vintage Tawny Port and Douro reds overlooking the Dom Luís I iron bridge and terracotta rooftops of UNESCO Ribeira at sunset.',
        insiderTip:
          'Walk across the upper deck of the Dom Luís I Bridge to Jardim do Morro at golden hour before dinner at Vinum at Graham’s.',
        rating: 4.9,
        reviewCount: 7420,
        priceRange: '€18–€35 tasting & riverfront dining',
        timeOfDay: 'Evening',
        defaultDaySlot: 'Day 4 (Thu)',
        defaultWeekOffset: 0,
        photoUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-sky-900 via-indigo-950 to-slate-900',
        googleMapsQuery: 'Grahams Port Lodge Vila Nova de Gaia Porto Portugal',
        preselectedByDefault: true,
      },
      {
        idSuffix: 'opo-paiva-walkways-hike',
        interestId: 'hiking',
        categoryLabel: '🥾 UNESCO River Gorge & 516 Arouca Suspension Bridge',
        title: 'Passadiços do Paiva Wooden Canyon Trail & Foz Coastal Boardwalk',
        neighborhood: 'Arouca UNESCO Geopark (Porto Region) & Foz do Douro',
        description:
          'Hike 8km of elevated wooden cliff walkways along the rushing Paiva River rapids and cross the world-famous 516 Arouca pedestrian suspension bridge.',
        insiderTip:
          'Start at the Areinho entrance in the morning so the steepest staircase climb is behind you in the cool morning air.',
        rating: 4.9,
        reviewCount: 8910,
        priceRange: '€2 trail pass / €12 suspension bridge',
        timeOfDay: 'Morning',
        defaultDaySlot: 'Day 6 (Sat)',
        defaultWeekOffset: 0,
        photoUrl: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-emerald-900 via-teal-950 to-slate-900',
        googleMapsQuery: 'Passadicos do Paiva Arouca Porto Portugal',
        preselectedByDefault: true,
      },
      {
        idSuffix: 'opo-matosinhos-surf',
        interestId: 'surfing',
        categoryLabel: '🏄 Atlantic Surf School & Fresh Charcoal Fish',
        title: 'Onda Pura Surf Center (Praia de Matosinhos) & Praia da Luz Lounge',
        neighborhood: 'Matosinhos Beach & Foz do Douro, Porto',
        description:
          'Ride Porto Metro Blue Line A directly to Praia de Matosinhos for consistent Atlantic surf waves, followed by fresh charcoal-grilled sea bream on Rua Heróis de França.',
        insiderTip:
          'Matosinhos and Foz do Douro are Porto’s premier flat, oceanfront neighborhoods for long-term expat apartments.',
        rating: 4.8,
        reviewCount: 3120,
        priceRange: '€22 surf lesson & wetsuit',
        timeOfDay: 'Morning',
        defaultDaySlot: 'Day 3 (Wed)',
        defaultWeekOffset: 0,
        photoUrl: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-cyan-900 via-sky-950 to-slate-900',
        googleMapsQuery: 'Praia de Matosinhos Surf School Porto Portugal',
        preselectedByDefault: true,
      },
      {
        idSuffix: 'opo-saobento-arch',
        interestId: 'architecture',
        categoryLabel: '🏛️ 20,000 Azulejo Tiles & Baroque Heritage Walk',
        title: 'São Bento Azulejo Station, Livraria Lello & Palácio da Bolsa',
        neighborhood: 'Baixa & Vitória Historic Center, Porto',
        description:
          'Marvel at Jorge Colaço’s 20,000 blue-and-white historical tiles in São Bento Station, the Neo-Gothic staircase of Livraria Lello, and the Arabian Hall at Palácio da Bolsa.',
        insiderTip:
          'Explore the Cedofeita art gallery street and Mercado do Bolhão right after your morning architectural walk.',
        rating: 4.9,
        reviewCount: 9540,
        priceRange: 'Free station / €12 Palácio tour',
        timeOfDay: 'Afternoon',
        defaultDaySlot: 'Day 2 (Tue)',
        defaultWeekOffset: 0,
        photoUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-indigo-900 via-violet-950 to-slate-900',
        googleMapsQuery: 'Estacao de Sao Bento Palacio da Bolsa Porto Portugal',
        preselectedByDefault: true,
      },
      {
        idSuffix: 'opo-portoio-cowork',
        interestId: 'coworking',
        categoryLabel: '💻 Douro Riverview Coworking & Tech Hub',
        title: 'Porto i/o Riverside (Infante) & Selina Navis Cowork (Cedofeita)',
        neighborhood: 'Ribeira / Infante & Cedofeita, Porto',
        description:
          'Work overlooking the Douro River with 300+ Mbps fiber at Porto’s oldest community-driven tech hub or inside Selina’s courtyard garden.',
        insiderTip:
          'Porto rents average 25–30% less than central Lisbon while offering equally fast fiber and direct international flights.',
        rating: 4.9,
        reviewCount: 1620,
        priceRange: '€18 day pass',
        timeOfDay: 'Morning',
        defaultDaySlot: 'Day 1 (Mon)',
        defaultWeekOffset: 0,
        photoUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-slate-800 via-indigo-950 to-slate-900',
        googleMapsQuery: 'Porto io Riverside Coworking Porto Portugal',
        preselectedByDefault: true,
      },
    ],
  },

  'portugal:lagos': {
    matchKeywords: ['lagos', 'algarve', 'portimao', 'faro', 'albufeira', 'tavira', 'sagres'],
    seeds: [
      {
        idSuffix: 'fao-bonvivant-nightlife',
        interestId: 'nightlife',
        categoryLabel: '🍸 Old Town Rooftop & Marina Cocktail Lounge',
        title: 'Bon Vivant Rooftop Terrace & Mar d’Estórias Sky Bar (Lagos)',
        neighborhood: 'Rua 25 de Abril & Marina de Lagos, Algarve',
        description:
          'Sip Algarve citrus cocktails on whitewashed rooftop terraces overlooking Lagos Bay and the historic town walls.',
        insiderTip:
          'Start at Mar d’Estórias rooftop at 6:00 PM for sunset over Meia Praia, then walk 2 minutes to Rua 25 de Abril.',
        rating: 4.7,
        reviewCount: 2890,
        priceRange: '€9–€15 cocktails',
        timeOfDay: 'Night',
        defaultDaySlot: 'Day 5 (Fri)',
        defaultWeekOffset: 0,
        photoUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-indigo-950 via-purple-950 to-slate-900',
        googleMapsQuery: 'Bon Vivant Lagos Algarve Portugal',
        preselectedByDefault: true,
      },
      {
        idSuffix: 'fao-ponta-piedade-hike',
        interestId: 'hiking',
        categoryLabel: '🥾 Golden Sea-Stack Cliffs & Seven Hanging Valleys',
        title: 'Ponta da Piedade Cliff Boardwalk (Lagos) & Seven Hanging Valleys Trail',
        neighborhood: 'Ponta da Piedade (Lagos) & Praia da Marinha, Algarve',
        description:
          'Hike atop golden limestone sea arches, turquoise grottoes, and cliffside lighthouses along one of Europe’s most scenic coastal trails.',
        insiderTip:
          'Combine the morning cliff walk with a 45-minute wooden fisherman boat tour through the Ponta da Piedade sea caves.',
        rating: 4.9,
        reviewCount: 7840,
        priceRange: 'Free coastal trail / €20 grotto boat',
        timeOfDay: 'Morning',
        defaultDaySlot: 'Day 6 (Sat)',
        defaultWeekOffset: 0,
        photoUrl: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-emerald-900 via-teal-950 to-slate-900',
        googleMapsQuery: 'Ponta da Piedade Lagos Algarve Portugal',
        preselectedByDefault: true,
      },
      {
        idSuffix: 'fao-jahshaka-surf',
        interestId: 'surfing',
        categoryLabel: '🏄 West Coast Algarve Surf & Catamaran',
        title: 'Jah Shaka Surf Camp (Lagos) & Praia do Amado / Arrifana Surf Breaks',
        neighborhood: 'Lagos Old Town & Costa Vicentina, Algarve',
        description:
          'Catch year-round Atlantic swells on the dual-coast Algarve peninsula—when south coast waters are calm, the west coast breaks are offshore and clean.',
        insiderTip:
          '300+ sunny days per year make Lagos Europe’s premier winter-sun surf and golf basecamp.',
        rating: 4.9,
        reviewCount: 3120,
        priceRange: '€35 surf trip & equipment',
        timeOfDay: 'Morning',
        defaultDaySlot: 'Day 3 (Wed)',
        defaultWeekOffset: 0,
        photoUrl: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-cyan-900 via-sky-950 to-slate-900',
        googleMapsQuery: 'Jah Shaka Surf Shop Lagos Algarve Portugal',
        preselectedByDefault: true,
      },
    ],
  },

  'portugal:funchal': {
    matchKeywords: ['funchal', 'madeira', 'ponta do sol', 'machico', 'calheta'],
    seeds: [
      {
        idSuffix: 'fnc-pico-arieiro-hike',
        interestId: 'hiking',
        categoryLabel: '🥾 PR1 Cloud-Peak Ridge & 25 Fontes Levada',
        title: 'Pico do Arieiro to Pico Ruivo Sunrise Hike & Levada das 25 Fontes',
        neighborhood: 'Central Mountain Massif & Rabaçal, Madeira',
        description:
          'Walk above the clouds on Madeira’s legendary 1,862m volcanic stairway ridge trail and hike emerald Laurisilva rainforest aqueducts.',
        insiderTip:
          'Check live webcams on NetMadeira at 6:00 AM before heading up to Pico do Arieiro for crystal-clear sunrise views.',
        rating: 4.9,
        reviewCount: 9120,
        priceRange: '€3 trail fee / €30 transfer',
        timeOfDay: 'Morning',
        defaultDaySlot: 'Day 6 (Sat)',
        defaultWeekOffset: 0,
        photoUrl: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-emerald-900 via-teal-950 to-slate-900',
        googleMapsQuery: 'Pico do Arieiro Miradouro Madeira Portugal',
        preselectedByDefault: true,
      },
      {
        idSuffix: 'fnc-nomad-village-cowork',
        interestId: 'coworking',
        categoryLabel: '💻 Digital Nomad Village & Oceanfront Workspace',
        title: 'Digital Nomad Village Madeira (Ponta do Sol) & Cowork Funchal',
        neighborhood: 'John dos Passos Cultural Center, Ponta do Sol & Funchal',
        description:
          'Plug directly into Europe’s most famous oceanfront nomad community with free high-speed workspace, daily Slack events, and sunset poncha mixers.',
        insiderTip:
          'Friday sunset gatherings on the pebble beach promenade in Ponta do Sol draw 100+ remote workers every week.',
        rating: 4.9,
        reviewCount: 2450,
        priceRange: 'Free community hub / €15 Funchal desk',
        timeOfDay: 'Morning',
        defaultDaySlot: 'Day 1 (Mon)',
        defaultWeekOffset: 0,
        photoUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-slate-800 via-indigo-950 to-slate-900',
        googleMapsQuery: 'Centro Cultural John dos Passos Ponta do Sol Madeira',
        preselectedByDefault: true,
      },
    ],
  },

  // ==================== SPAIN CITIES ====================
  'spain:valencia': {
    matchKeywords: ['valencia', 'costa blanca', 'alicante', 'denia', 'javea'],
    seeds: [
      {
        idSuffix: 'vlc-atenea-sky-rooftop',
        interestId: 'nightlife',
        categoryLabel: '🍸 Skyline Rooftop & Cocktail Lounge',
        title: 'Atenea Sky Rooftop & Café de las Horas (El Carmen)',
        neighborhood: 'Plaza del Ayuntamiento & Barrio del Carmen, Valencia',
        description:
          'Sip Agua de Valencia and signature cocktails 8 floors above Valencia’s historic city hall plaza, followed by neo-baroque lounge vibes in El Carmen.',
        insiderTip:
          'Sunset reservations at Atenea Sky fill up fast on Fridays; walk in at 6:00 PM for uninterrupted 360° dome views.',
        rating: 4.7,
        reviewCount: 3890,
        priceRange: '€12–€18 cocktails',
        timeOfDay: 'Night',
        defaultDaySlot: 'Day 5 (Fri)',
        defaultWeekOffset: 0,
        photoUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-indigo-950 via-purple-950 to-slate-900',
        googleMapsQuery: 'Atenea Sky Rooftop Plaza del Ayuntamiento Valencia Spain',
        preselectedByDefault: true,
      },
      {
        idSuffix: 'vlc-ruzafa-mercat-colon',
        interestId: 'dating',
        categoryLabel: '🥂 Tapas, Vermouth & Social Scene',
        title: 'Mercat de Colón & Ruzafa Terraces (Carrer de Sueca)',
        neighborhood: 'Ruzafa & Pla del Remei, Valencia',
        description:
          'Art Nouveau stained-glass market hall and Ruzafa’s vibrant pedestrian tapas streets where expats and locals gather for evening vermouth and pintxos.',
        insiderTip:
          'Join the Tuesday/Thursday language exchange at Portland Ale House or Radio City to plug directly into Valencia’s international circle.',
        rating: 4.8,
        reviewCount: 6120,
        priceRange: '€15–€28 tapas & wine',
        timeOfDay: 'Evening',
        defaultDaySlot: 'Day 4 (Thu)',
        defaultWeekOffset: 0,
        photoUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-sky-900 via-indigo-950 to-slate-900',
        googleMapsQuery: 'Mercado de Colon Ruzafa Valencia Spain',
        preselectedByDefault: true,
      },
      {
        idSuffix: 'vlc-montanejos-turia-hike',
        interestId: 'hiking',
        categoryLabel: '🥾 Thermal Gorge Hike & Turia Park',
        title: 'Fuente de los Baños de Montanejos Canyon Trek & Jardín del Turia',
        neighborhood: 'Montanejos Gorge & Turia Riverbed, Valencia',
        description:
          'Hike limestone canyon cliffs above crystal-clear 25°C year-round thermal springs, plus cycle or run the 9km sunken Turia riverbed park through Valencia.',
        insiderTip:
          'Rent a Valenbisi bike to ride the entire Jardín del Turia from Bioparc to the City of Arts & Sciences without crossing a single car street.',
        rating: 4.9,
        reviewCount: 4950,
        priceRange: '€4 thermal entry / €12 bike',
        timeOfDay: 'Morning',
        defaultDaySlot: 'Day 6 (Sat)',
        defaultWeekOffset: 0,
        photoUrl: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-emerald-900 via-teal-950 to-slate-900',
        googleMapsQuery: 'Fuente de los Banos Montanejos Valencia Spain',
        preselectedByDefault: true,
      },
      {
        idSuffix: 'vlc-ciudad-artes-arch',
        interestId: 'architecture',
        categoryLabel: '🏛️ Futuristic & Gothic Architecture',
        title: 'Ciudad de las Artes y las Ciencias & La Lonja de la Seda (UNESCO)',
        neighborhood: 'Quatre Carreres & Ciutat Vella, Valencia',
        description:
          'Contrast Santiago Calatrava’s gleaming white futuristic pools and opera house with Valencia’s 15th-century Gothic Silk Exchange and Mercado Central.',
        insiderTip:
          'Visit Mercado Central before 11:30 AM for fresh Iberian ham, saffron, and a €3 cortado at Central Bar by Ricard Camarena.',
        rating: 4.9,
        reviewCount: 9840,
        priceRange: 'Free exterior / €12 museum',
        timeOfDay: 'Afternoon',
        defaultDaySlot: 'Day 2 (Tue)',
        defaultWeekOffset: 0,
        photoUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-indigo-900 via-violet-950 to-slate-900',
        googleMapsQuery: 'Ciudad de las Artes y las Ciencias Valencia Spain',
        preselectedByDefault: true,
      },
    ],
  },

  'spain:malaga': {
    matchKeywords: ['malaga', 'málaga', 'marbella', 'costa del sol', 'estepona', 'fuengirola', 'nerja'],
    seeds: [
      {
        idSuffix: 'agp-alcazaba-pimpi-nightlife',
        interestId: 'nightlife',
        categoryLabel: '🍸 Moorish Fortress Rooftop & Historic Bodega',
        title: 'La Terraza de la Alcazaba (Batik) & El Pimpi Bodega (Málaga)',
        neighborhood: 'Calle Alcazabilla, Centro Histórico, Málaga',
        description:
          'Sip cocktails eye-to-eye with the illuminated 11th-century Moorish Alcazaba fortress walls and sample sweet Málaga moscatel wines among celebrity-signed barrels at El Pimpi.',
        insiderTip:
          'Arrive at La Terraza de la Alcazaba at 6:30 PM as the Roman Theatre and fortress floodlights switch on.',
        rating: 4.8,
        reviewCount: 7420,
        priceRange: '€10–€16 cocktails & wine',
        timeOfDay: 'Night',
        defaultDaySlot: 'Day 5 (Fri)',
        defaultWeekOffset: 0,
        photoUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-indigo-950 via-purple-950 to-slate-900',
        googleMapsQuery: 'La Terraza de la Alcazaba El Pimpi Malaga Spain',
        preselectedByDefault: true,
      },
      {
        idSuffix: 'agp-muelle-uno-dating',
        interestId: 'dating',
        categoryLabel: '🥂 Superyacht Promenade & Soho Tapas',
        title: 'Muelle Uno Port Promenade & Soho Arts District Tapas Walk',
        neighborhood: 'Puerto de Málaga & Barrio de las Artes (Soho), Málaga',
        description:
          'Stroll palm-lined waterfront terraces past the Centre Pompidou glass cube at Muelle Uno and dine in Soho’s vibrant street-art bistro quarter.',
        insiderTip:
          'Pedregalejo’s beachfront promenade (10 minutes east) is unbeatable for sunset espetos de sardinas grilled over olive-wood boats.',
        rating: 4.8,
        reviewCount: 5390,
        priceRange: '€15–€30 seaside tapas & wine',
        timeOfDay: 'Evening',
        defaultDaySlot: 'Day 4 (Thu)',
        defaultWeekOffset: 0,
        photoUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-sky-900 via-indigo-950 to-slate-900',
        googleMapsQuery: 'Muelle Uno Puerto de Malaga Spain',
        preselectedByDefault: true,
      },
      {
        idSuffix: 'agp-caminito-rey-hike',
        interestId: 'hiking',
        categoryLabel: '🥾 Dramatic Cliffside Gorge Walkway',
        title: 'Caminito del Rey Suspended Canyon Trail & Monte Gibralfaro Climb',
        neighborhood: 'Desfiladero de los Gaitanes (Málaga) & Gibralfaro Ridge',
        description:
          'Walk the famous 100-meter-high cliffside boardwalk pinned to vertical limestone canyon walls at El Chorro, accessible via 40-minute regional train from Málaga Maria Zambrano.',
        insiderTip:
          'Reserve your timed entry slot online 2 weeks ahead and take the morning Cercanías/Media Distancia train directly to El Chorro.',
        rating: 4.9,
        reviewCount: 9810,
        priceRange: '€10 entry / €18 guided pass',
        timeOfDay: 'Morning',
        defaultDaySlot: 'Day 6 (Sat)',
        defaultWeekOffset: 0,
        photoUrl: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-emerald-900 via-teal-950 to-slate-900',
        googleMapsQuery: 'Caminito del Rey Ardales Malaga Spain',
        preselectedByDefault: true,
      },
    ],
  },

  'spain:barcelona': {
    matchKeywords: ['barcelona', 'sitges', 'girona', 'costa brava', 'tarragona'],
    seeds: [
      {
        idSuffix: 'bcn-paradiso-pulitzer-nightlife',
        interestId: 'nightlife',
        categoryLabel: '🍸 World’s #1 Speakeasy & Boutique Rooftop',
        title: 'Paradiso Speakeasy (El Born) & Pulitzer Hotel Garden Rooftop',
        neighborhood: 'El Born & Eixample, Barcelona',
        description:
          'Step through a pastrami-shop refrigerator door into Paradiso’s Gaudí-inspired wooden wave bar in El Born, or enjoy live DJ sunset sessions atop Hotel Pulitzer.',
        insiderTip:
          'Join Paradiso’s virtual queue via QR code at 5:30 PM while having tapas next door on Passeig del Born.',
        rating: 4.8,
        reviewCount: 6840,
        priceRange: '€14–€20 signature cocktails',
        timeOfDay: 'Night',
        defaultDaySlot: 'Day 5 (Fri)',
        defaultWeekOffset: 0,
        photoUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-indigo-950 via-purple-950 to-slate-900',
        googleMapsQuery: 'Paradiso Cocktail Bar El Born Barcelona Spain',
        preselectedByDefault: true,
      },
      {
        idSuffix: 'bcn-enric-granados-dating',
        interestId: 'dating',
        categoryLabel: '🥂 Pedestrian Bistro Boulevard & Wine Bar',
        title: 'Carrer d’Enric Granados Terraces & El Nacional (Passeig de Gràcia)',
        neighborhood: 'L’Antiga Esquerra de l’Eixample, Barcelona',
        description:
          'Barcelona’s most romantic tree-lined semi-pedestrian street packed with natural wine bars, specialty brunch terraces, and modernist facades.',
        insiderTip:
          'Eixample Esquerra and Gràcia offer the highest quality of residential life away from Las Ramblas tourist crowds.',
        rating: 4.9,
        reviewCount: 8120,
        priceRange: '€18–€35 wine & tapas',
        timeOfDay: 'Evening',
        defaultDaySlot: 'Day 4 (Thu)',
        defaultWeekOffset: 0,
        photoUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-sky-900 via-indigo-950 to-slate-900',
        googleMapsQuery: 'Carrer d Enric Granados Eixample Barcelona Spain',
        preselectedByDefault: true,
      },
      {
        idSuffix: 'bcn-montserrat-bunkers-hike',
        interestId: 'hiking',
        categoryLabel: '🥾 Serrated Mountain Abbey Trek & 360° Mirador',
        title: 'Montserrat Sant Jeroni Summit Trek & Bunkers del Carmel Viewpoint',
        neighborhood: 'Montserrat Natural Park & El Turó de la Rovira, Barcelona',
        description:
          'Ride the rack railway into the dramatic needle-shaped peaks of Montserrat to hike to the 1,236m Sant Jeroni summit overlooking all of Catalonia.',
        insiderTip:
          'Take the R5 train from Plaça Espanya at 8:00 AM and ride the Aeri cable car up to the monastery trailhead.',
        rating: 4.9,
        reviewCount: 7490,
        priceRange: '€14 train + cable car combo',
        timeOfDay: 'Morning',
        defaultDaySlot: 'Day 6 (Sat)',
        defaultWeekOffset: 0,
        photoUrl: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-emerald-900 via-teal-950 to-slate-900',
        googleMapsQuery: 'Montserrat Monastery Sant Jeroni Hike Barcelona Spain',
        preselectedByDefault: true,
      },
    ],
  },

  // ==================== THAILAND CITIES ====================
  'thailand:chiang-mai': {
    matchKeywords: ['chiang mai', 'nimman', 'chiang rai', 'pai', 'mae rim'],
    seeds: [
      {
        idSuffix: 'cnx-north-gate-jazz',
        interestId: 'nightlife',
        categoryLabel: '🎷 Legendary Live Jazz & Blues Co-Op',
        title: 'North Gate Jazz Co-Op (Old City North Moat) & Warm Up Cafe (Nimman)',
        neighborhood: 'Si Phum Old City Moat & Nimmanhaemin, Chiang Mai',
        description:
          'Experience Chiang Mai’s iconic open-front live jazz and brass jam venue on the northern moat alongside Nimman’s flagship live band courtyard.',
        insiderTip:
          'Tuesday night is the famous Open Jam Session at North Gate Jazz Co-Op—arrive by 8:00 PM as musicians from around the world take the stage.',
        rating: 4.8,
        reviewCount: 4720,
        priceRange: '$4–$10 craft beers & cocktails',
        timeOfDay: 'Night',
        defaultDaySlot: 'Day 5 (Fri)',
        defaultWeekOffset: 0,
        photoUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-indigo-950 via-purple-950 to-slate-900',
        googleMapsQuery: 'North Gate Jazz Co-Op Chiang Mai Thailand',
        preselectedByDefault: true,
      },
      {
        idSuffix: 'cnx-one-nimman-dating',
        interestId: 'dating',
        categoryLabel: '🥂 Night Market & Social Piazza',
        title: 'One Nimman Clocktower Piazza & Deck One Ping River Terrace',
        neighborhood: 'Nimmanhaemin Soi 1 & Charoenrat Riverside, Chiang Mai',
        description:
          'Brick-lined open-air piazza featuring craft wine lounges, live acoustic sets, and weekly salsa/swing social nights, plus candlelit dining on the Ping River.',
        insiderTip:
          'Thursday evening White Market and social dance nights in the One Nimman courtyard are super welcoming for solo travelers and couples.',
        rating: 4.7,
        reviewCount: 5380,
        priceRange: '$8–$18 food & wine',
        timeOfDay: 'Evening',
        defaultDaySlot: 'Day 4 (Thu)',
        defaultWeekOffset: 0,
        photoUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-sky-900 via-indigo-950 to-slate-900',
        googleMapsQuery: 'One Nimman Chiang Mai Thailand',
        preselectedByDefault: true,
      },
      {
        idSuffix: 'cnx-monks-trail-hike',
        interestId: 'hiking',
        categoryLabel: '🥾 Jungle Waterfall Hike & Paramotor',
        title: 'Monk’s Trail to Wat Pha Lat Jungle Temple & Chiang Mai Skyviews Paramotor',
        neighborhood: 'Doi Suthep National Park Foothills, Chiang Mai',
        description:
          'Trek along orange-cloth-marked forest trails beside mountain streams to the hidden 14th-century Wat Pha Lat stone temple, or fly tandem paramotor at sunrise.',
        insiderTip:
          'Start the trailhead behind Chiang Mai University Zoo at 7:00 AM while the rainforest air is cool and mist rises over the valley.',
        rating: 4.9,
        reviewCount: 4120,
        priceRange: 'Free hike / $85 paramotor flight',
        timeOfDay: 'Morning',
        defaultDaySlot: 'Day 3 (Wed)',
        defaultWeekOffset: 0,
        photoUrl: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-emerald-900 via-teal-950 to-slate-900',
        googleMapsQuery: 'Wat Pha Lat Hike Monks Trail Chiang Mai Thailand',
        preselectedByDefault: true,
      },
      {
        idSuffix: 'cnx-yellow-punspace-cowork',
        interestId: 'coworking',
        categoryLabel: '💻 260+ Mbps Fiber & Coworking',
        title: 'Yellow Coworking & Punspace Nimman (Digital Nomad Hub)',
        neighborhood: 'Nimmanhaemin Soi 5, Chiang Mai',
        description:
          'Benchmark 260+ Mbps AIS/True fiber, soundproof Zoom booths, specialty Thai arabica coffee bar, and weekly founder/nomad community talks.',
        insiderTip:
          'Test a $9 day pass at Yellow Coworking and pick up a local AIS 5G eSIM right across the street at Maya Lifestyle Mall.',
        rating: 4.8,
        reviewCount: 1840,
        priceRange: '$9 day pass',
        timeOfDay: 'Morning',
        defaultDaySlot: 'Day 1 (Mon)',
        defaultWeekOffset: 0,
        photoUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-slate-800 via-indigo-950 to-slate-900',
        googleMapsQuery: 'Yellow Coworking Nimman Chiang Mai Thailand',
        preselectedByDefault: true,
      },
    ],
  },

  'thailand:bangkok': {
    matchKeywords: ['bangkok', 'sukhumvit', 'thonglor', 'ari', 'sathorn', 'silom', 'ekkamai'],
    seeds: [
      {
        idSuffix: 'bkk-octave-havana-nightlife',
        interestId: 'nightlife',
        categoryLabel: '🍸 49th-Floor 360° Skybar & Speakeasy',
        title: 'Octave Rooftop Lounge & Bar (Thonglor) & BKK Social Club (Chao Phraya)',
        neighborhood: 'Sukhumvit Soi 57 (Thonglor) & Charoenkrung, Bangkok',
        description:
          'Take in unobstructed 360° views of the Bangkok skyline 49 floors above Thonglor BTS and visit Asia’s Top 50 Cocktail Bar on the Chao Phraya riverfront.',
        insiderTip:
          'Arrive at Octave between 5:00 PM and 7:00 PM for their 50%-off sunset signature cocktail hour.',
        rating: 4.8,
        reviewCount: 6890,
        priceRange: '$10–$22 rooftop cocktails',
        timeOfDay: 'Night',
        defaultDaySlot: 'Day 5 (Fri)',
        defaultWeekOffset: 0,
        photoUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-indigo-950 via-purple-950 to-slate-900',
        googleMapsQuery: 'Octave Rooftop Lounge and Bar Sukhumvit 57 Bangkok',
        preselectedByDefault: true,
      },
      {
        idSuffix: 'bkk-commons-ari-dating',
        interestId: 'dating',
        categoryLabel: '🥂 Architectural Open-Air Commons & Bistro Strip',
        title: 'theCOMMONS Thonglor (Soi 17) & Ari Soi 1 Leafy Cafe Quarter',
        neighborhood: 'Thonglor Soi 17 & Phahonyothin Soi 7 (Ari), Bangkok',
        description:
          'Award-winning vertical open-air community mall with artisanal wine bars, craft roasters, and breezy terraces where Bangkok’s international professionals gather.',
        insiderTip:
          'Friday evenings on the Top Yard lawn at theCOMMONS Thonglor feature live acoustic music and effortless social mingling.',
        rating: 4.9,
        reviewCount: 7420,
        priceRange: '$12–$28 artisanal dining & wine',
        timeOfDay: 'Evening',
        defaultDaySlot: 'Day 4 (Thu)',
        defaultWeekOffset: 0,
        photoUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-sky-900 via-indigo-950 to-slate-900',
        googleMapsQuery: 'theCOMMONS Thonglor Soi 17 Bangkok Thailand',
        preselectedByDefault: true,
      },
      {
        idSuffix: 'bkk-benjakitti-bangkrachao-hike',
        interestId: 'hiking',
        categoryLabel: '🌿 Elevated Forest Skywalk & Jungle Island Bike',
        title: 'Benjakitti Forest Park Canopy Walk & Bang Krachao (“Green Lung”) Bike Trail',
        neighborhood: 'Asok / Queen Sirikit & Phra Pradaeng River Loop, Bangkok',
        description:
          'Walk the elevated treetop boardwalks across Benjakitti’s wetland lagoons in central Bangkok, then take a 5-minute longtail boat to cycle elevated jungle paths in Bang Krachao.',
        insiderTip:
          'Cross from Klong Toey Pier at 7:30 AM and rent a bicycle for 100 THB ($3) to explore Sri Nakhon Khuean Khan Park.',
        rating: 4.9,
        reviewCount: 5190,
        priceRange: 'Free park / $3 bike rental',
        timeOfDay: 'Morning',
        defaultDaySlot: 'Day 6 (Sat)',
        defaultWeekOffset: 0,
        photoUrl: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-emerald-900 via-teal-950 to-slate-900',
        googleMapsQuery: 'Benjakitti Forest Park Skywalk Bangkok Thailand',
        preselectedByDefault: true,
      },
      {
        idSuffix: 'bkk-bumrungrad-hospital',
        interestId: 'healthcare',
        categoryLabel: '🏥 World-Renowned JCI Medical Center',
        title: 'Bumrungrad International Hospital & Samitivej Sukhumvit Executive Checkup',
        neighborhood: 'Sukhumvit Soi 3 (Nana) & Soi 49 (Thonglor), Bangkok',
        description:
          'Experience Southeast Asia’s #1 JCI-accredited private hospital featuring hotel-grade lobbies, direct international insurance billing, and 3-hour comprehensive health screenings.',
        insiderTip:
          'Book your annual executive checkup online at Bumrungrad’s 11th-floor Holistic & Preventive Center.',
        rating: 4.9,
        reviewCount: 8420,
        priceRange: '$160–$320 comprehensive panel',
        timeOfDay: 'Morning',
        defaultDaySlot: 'Day 2 (Tue)',
        defaultWeekOffset: 0,
        photoUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-sky-900 via-teal-950 to-slate-900',
        googleMapsQuery: 'Bumrungrad International Hospital Sukhumvit Soi 3 Bangkok',
        preselectedByDefault: true,
      },
    ],
  },

  'thailand:phuket': {
    matchKeywords: ['phuket', 'hua hin', 'samui', 'krabi', 'rawai', 'bangtao', 'cherngtalay'],
    seeds: [
      {
        idSuffix: 'hkt-catch-beach-nightlife',
        interestId: 'nightlife',
        categoryLabel: '🍸 Andaman Sunset Beach Club & Lagoon Lounge',
        title: 'Catch Beach Club (Bangtao) & Café del Mar Phuket (Kamala)',
        neighborhood: 'Bangtao Beach / Cherngtalay & Kamala, Phuket',
        description:
          'Phuket’s premier open-air beachfront clubs on the west coast with infinity pools, sunset fire shows, and international house DJs.',
        insiderTip:
          'Boat Avenue and Porto de Phuket in Cherngtalay (Laguna) are the top year-round expat dining and residential hubs on the island.',
        rating: 4.8,
        reviewCount: 5120,
        priceRange: '$10–$20 beach club drinks',
        timeOfDay: 'Evening',
        defaultDaySlot: 'Day 5 (Fri)',
        defaultWeekOffset: 0,
        photoUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-indigo-950 via-purple-950 to-slate-900',
        googleMapsQuery: 'Catch Beach Club Bangtao Phuket Thailand',
        preselectedByDefault: true,
      },
      {
        idSuffix: 'hkt-kata-surf-catamaran',
        interestId: 'surfing',
        categoryLabel: '🏄 Kata Bay Surf & Phang Nga Catamaran',
        title: 'Kata Beach Surf School & Royal Phuket Marina Sunset Catamaran',
        neighborhood: 'Kata Beach & Royal Phuket Marina, Phuket',
        description:
          'Surf warm Andaman waves at Kata Beach or sail a catamaran across turquoise limestone karsts in Phang Nga Bay and Coral Island.',
        insiderTip:
          'Rawai and Nai Harn in southern Phuket offer a relaxed fitness, Muay Thai, and digital nomad community.',
        rating: 4.9,
        reviewCount: 3890,
        priceRange: '$22 surf session / $75 catamaran',
        timeOfDay: 'Morning',
        defaultDaySlot: 'Day 3 (Wed)',
        defaultWeekOffset: 0,
        photoUrl: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-cyan-900 via-sky-950 to-slate-900',
        googleMapsQuery: 'Kata Beach Surf School Phuket Thailand',
        preselectedByDefault: true,
      },
    ],
  },

  // ==================== COLOMBIA CITIES ====================
  'colombia:medellin': {
    matchKeywords: ['medellin', 'medellín', 'poblado', 'laureles', 'envigado', 'sabaneta'],
    seeds: [
      {
        idSuffix: 'med-envy-rooftop',
        interestId: 'nightlife',
        categoryLabel: '🍸 Nightlife & Rooftop Bar',
        title: 'Envy Rooftop Bar (The Charlee) & Son Havana Salsa Bar (Laureles)',
        neighborhood: 'El Poblado & Carrera 73 Laureles, Medellín',
        description:
          'Medellín’s flagship open-air aquarium rooftop lounge overlooking the Aburrá Valley, paired with Laureles’ iconic live Cuban & Paisa brass salsa club.',
        insiderTip:
          'Arrive at Envy by 7:30 PM on Friday for sunset tables, or visit Son Havana on Wednesday at 8:00 PM for their free group salsa class.',
        rating: 4.8,
        reviewCount: 6310,
        priceRange: '$8–$18 cocktails & salsa',
        timeOfDay: 'Night',
        defaultDaySlot: 'Day 5 (Fri)',
        defaultWeekOffset: 0,
        photoUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-indigo-950 via-purple-950 to-slate-900',
        googleMapsQuery: 'Envy Rooftop The Charlee Hotel Parque Lleras Medellin Colombia',
        preselectedByDefault: true,
      },
      {
        idSuffix: 'med-provenza-dating',
        interestId: 'dating',
        categoryLabel: '🥂 Dating & Social Boulevard',
        title: 'Provenza Pedestrian Walk & Mamba Negra Rooftop',
        neighborhood: 'Barrio Provenza (Calle 10A / Carrera 35), Medellín',
        description:
          'Lush, car-free tree-lined avenue filled with botanical cocktail terraces, tapas lounges, and high-energy social dining ideal for first dates and mixers.',
        insiderTip:
          'Start with specialty coffee at Pergamino Via Primavera at 5 PM, then walk 2 blocks to Mamba Negra for sunset tapas.',
        rating: 4.9,
        reviewCount: 4650,
        priceRange: '$18–$35 dinner & drinks',
        timeOfDay: 'Evening',
        defaultDaySlot: 'Day 4 (Thu)',
        defaultWeekOffset: 0,
        photoUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-sky-900 via-indigo-950 to-slate-900',
        googleMapsQuery: 'Provenza El Poblado Mamba Negra Medellin Colombia',
        preselectedByDefault: true,
      },
      {
        idSuffix: 'med-paragliding-sanfelix',
        interestId: 'hiking',
        categoryLabel: '🪂 Paragliding & Cloud Forest Ridge',
        title: 'Aeroclub Medellín San Félix Paragliding & Parque Arví Metrocable Trail',
        neighborhood: 'San Félix Mountain Launch & Santa Elena, Medellín',
        description:
          'Soar 2,500 ft above the Aburrá Valley on a 25-minute certified tandem paragliding flight and ride the scenic Line L Metrocable into Parque Arví’s orchid trails.',
        insiderTip:
          'Book the 9:30 AM–11:30 AM morning flight slot when thermal updrafts are smoothest and cloud cover is clearest.',
        rating: 4.9,
        reviewCount: 4820,
        priceRange: '$58 tandem flight / $3 Metrocable',
        timeOfDay: 'Morning',
        defaultDaySlot: 'Day 3 (Wed)',
        defaultWeekOffset: 0,
        photoUrl: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-emerald-900 via-teal-950 to-slate-900',
        googleMapsQuery: 'Parapente San Felix Aeroclub Medellin Colombia',
        preselectedByDefault: true,
      },
      {
        idSuffix: 'med-selina-semilla',
        interestId: 'coworking',
        categoryLabel: '💻 Fast Fiber & Coworking Hub',
        title: 'Semilla Café Coworking (Laureles) & Selina Cowork (El Poblado)',
        neighborhood: 'Laureles Primer Parque & Calle 10, Medellín',
        description:
          'Test 250+ Mbps symmetrical fiber, acoustic call booths, specialty Antioquian pour-over coffee, and weekly digital nomad networking.',
        insiderTip:
          'Grab a $10 day pass at Semilla in Laureles to compare the quieter, flatter neighborhood vibe against hilly El Poblado.',
        rating: 4.7,
        reviewCount: 1580,
        priceRange: '$10–$14 day pass',
        timeOfDay: 'Morning',
        defaultDaySlot: 'Day 1 (Mon)',
        defaultWeekOffset: 0,
        photoUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-slate-800 via-indigo-950 to-slate-900',
        googleMapsQuery: 'Semilla Cafe Coworking Laureles Medellin Colombia',
        preselectedByDefault: true,
      },
    ],
  },

  'colombia:bogota': {
    matchKeywords: ['bogota', 'bogotá', 'chapinero', 'usaquen', 'parque 93'],
    seeds: [
      {
        idSuffix: 'bog-andres-dc-nightlife',
        interestId: 'nightlife',
        categoryLabel: '🍸 4-Story Carnival Dining & Zona T Rooftop',
        title: 'Andrés DC (Zona T) & Apache Rooftop Bar (Click Clack Hotel)',
        neighborhood: 'Zona Rosa (Calle 82) & Parque de la 93, Bogotá',
        description:
          'Bogotá’s legendary multi-level theatrical dinner-and-dance landmark in Zona T paired with panoramic Andean mountain views from Click Clack’s rooftop.',
        insiderTip:
          'Chapinero Alto and Parque de la 93 are Bogotá’s safest, most walkable districts for specialty coffee and cosmopolitan nightlife.',
        rating: 4.8,
        reviewCount: 8940,
        priceRange: '$12–$24 cocktails & dining',
        timeOfDay: 'Night',
        defaultDaySlot: 'Day 5 (Fri)',
        defaultWeekOffset: 0,
        photoUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-indigo-950 via-purple-950 to-slate-900',
        googleMapsQuery: 'Andres DC Zona T Calle 82 Bogota Colombia',
        preselectedByDefault: true,
      },
      {
        idSuffix: 'bog-monserrate-hike',
        interestId: 'hiking',
        categoryLabel: '🥾 3,152m Andean Sanctuary Climb & Páramo Trek',
        title: 'Cerro de Monserrate Stone Trail & Chingaza Páramo Cloud-Lagoon Hike',
        neighborhood: 'Eastern Hills (Cerros Orientales), Bogotá',
        description:
          'Climb the 1,605 stone steps (or ride the funicular) to the 3,152m white sanctuary overlooking all of Bogotá, or trek among giant frailejón plants in Chingaza.',
        insiderTip:
          'Hike Monserrate between 7:00 AM and 9:30 AM on weekends and reward yourself with hot chocolate and almojábanas at Casa San Isidro.',
        rating: 4.9,
        reviewCount: 9650,
        priceRange: 'Free trail / $8 funicular',
        timeOfDay: 'Morning',
        defaultDaySlot: 'Day 6 (Sat)',
        defaultWeekOffset: 0,
        photoUrl: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-emerald-900 via-teal-950 to-slate-900',
        googleMapsQuery: 'Cerro de Monserrate Bogota Colombia',
        preselectedByDefault: true,
      },
    ],
  },

  'colombia:cartagena': {
    matchKeywords: ['cartagena', 'santa marta', 'tayrona', 'getsemani', 'barranquilla'],
    seeds: [
      {
        idSuffix: 'ctg-alquimico-cafedelmar',
        interestId: 'nightlife',
        categoryLabel: '🍸 World’s Top 50 Mansion Bar & Sunset Ramparts',
        title: 'Alquímico Mansion Bar (Centro) & Café del Mar (Baluarte de Santo Domingo)',
        neighborhood: 'Walled Old City (Centro) & Getsemaní, Cartagena',
        description:
          'Watch the Caribbean sunset from 16th-century Spanish stone ramparts at Café del Mar, then explore 3 floors of Colombian botanical mixology at Alquímico.',
        insiderTip:
          'Walk 5 minutes to Plaza de la Trinidad in Getsemaní around 9:00 PM for open-air street performances and cumbia music.',
        rating: 4.8,
        reviewCount: 7810,
        priceRange: '$10–$18 craft cocktails',
        timeOfDay: 'Night',
        defaultDaySlot: 'Day 5 (Fri)',
        defaultWeekOffset: 0,
        photoUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-indigo-950 via-purple-950 to-slate-900',
        googleMapsQuery: 'Alquimico Cartagena Walled City Colombia',
        preselectedByDefault: true,
      },
      {
        idSuffix: 'ctg-rosario-tayrona',
        interestId: 'surfing',
        categoryLabel: '⛵ Caribbean Reef Catamaran & Tayrona Coast',
        title: 'Islas del Rosario Coral Catamaran & Bora Bora Beach Club',
        neighborhood: 'Muelle de la Bodeguita & Rosario Archipelago, Cartagena',
        description:
          'Sail 45 minutes from Cartagena’s walled port into crystal-clear turquoise Caribbean coral reefs for snorkeling, paddleboarding, and island beach clubs.',
        insiderTip:
          'Depart Muelle de la Bodeguita at 8:00 AM when the bay waters are calmest.',
        rating: 4.8,
        reviewCount: 5420,
        priceRange: '$65 island catamaran day pass',
        timeOfDay: 'Full Day',
        defaultDaySlot: 'Day 6 (Sat)',
        defaultWeekOffset: 0,
        photoUrl: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-cyan-900 via-sky-950 to-slate-900',
        googleMapsQuery: 'Islas del Rosario Muelle de la Bodeguita Cartagena Colombia',
        preselectedByDefault: true,
      },
    ],
  },

  // ==================== GREECE CITIES ====================
  'greece:athens': {
    matchKeywords: ['athens', 'riviera', 'glyfada', 'vouliagmeni', 'koukaki', 'plaka'],
    seeds: [
      {
        idSuffix: 'ath-a-for-athens-rooftop',
        interestId: 'nightlife',
        categoryLabel: '🍸 Acropolis Rooftop & World Top 50 Bar',
        title: 'A for Athens Rooftop Bar (Monastiraki) & The Clumsies / Baba Au Rum',
        neighborhood: 'Monastiraki Square & Praxitelous, Athens',
        description:
          'Enjoy illuminated Parthenon views from Monastiraki’s premier rooftop cocktail terrace alongside two of the World’s 50 Best Bars in central Athens.',
        insiderTip:
          'Book a front-row rail seat 30 minutes before sunset to watch the Acropolis floodlights turn on.',
        rating: 4.8,
        reviewCount: 6240,
        priceRange: '€11–€16 cocktails',
        timeOfDay: 'Night',
        defaultDaySlot: 'Day 5 (Fri)',
        defaultWeekOffset: 0,
        photoUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-indigo-950 via-purple-950 to-slate-900',
        googleMapsQuery: 'A for Athens Cocktail Bar Monastiraki Athens Greece',
        preselectedByDefault: true,
      },
      {
        idSuffix: 'ath-koukaki-plaka-dating',
        interestId: 'dating',
        categoryLabel: '🥂 Koukaki Wine Bars & Plaka Steps',
        title: 'Heteroclito Cave & Wine Bar + Plaka Mnisikleous Steps',
        neighborhood: 'Koukaki & Plaka Historic Center, Athens',
        description:
          'Sample indigenous Greek Assyrtiko and Xinomavro wines on lively pedestrian streets where Athenians and expats mingle every evening.',
        insiderTip:
          'Drakou and Olympiou Streets in Koukaki are Athens’ most walkable residential-meets-social strips for scouting 1-bedroom apartments.',
        rating: 4.8,
        reviewCount: 3190,
        priceRange: '€8–€15 wine & meze',
        timeOfDay: 'Evening',
        defaultDaySlot: 'Day 4 (Thu)',
        defaultWeekOffset: 0,
        photoUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-sky-900 via-indigo-950 to-slate-900',
        googleMapsQuery: 'Koukaki Pedestrian Street Wine Bars Athens Greece',
        preselectedByDefault: true,
      },
      {
        idSuffix: 'ath-vouliagmeni-beach-club',
        interestId: 'surfing',
        categoryLabel: '🏖️ Thermal Lake & Aegean Beach Club',
        title: 'Lake Vouliagmeni Thermal Springs & Krabo Beach Lounge (Athens Riviera)',
        neighborhood: 'Vouliagmeni Bay, Athens Riviera',
        description:
          'Swim in the mineral-rich 24°C subterranean cliffside thermal lake and spend the afternoon windsurfing or lounging on the Aegean Riviera.',
        insiderTip:
          'The Athens Riviera tram & bus connect Glyfada and Vouliagmeni directly to central Athens—ideal for testing coastal apartment living.',
        rating: 4.8,
        reviewCount: 4480,
        priceRange: '€17 lake entry',
        timeOfDay: 'Afternoon',
        defaultDaySlot: 'Day 3 (Wed)',
        defaultWeekOffset: 0,
        photoUrl: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-cyan-900 via-sky-950 to-slate-900',
        googleMapsQuery: 'Lake Vouliagmeni Athens Riviera Greece',
        preselectedByDefault: true,
      },
      {
        idSuffix: 'ath-sounion-hymettus-hike',
        interestId: 'hiking',
        categoryLabel: '🥾 Mount Hymettus Monastery Trail & Cape Sounion',
        title: 'Kaisariani Monastery Pine Trail (Mount Hymettus) & Temple of Poseidon Cliff Walk',
        neighborhood: 'Mount Hymettus Forest & Cape Sounion, Athens',
        description:
          'Hike cypress-and-pine trails past an 11th-century Byzantine monastery overlooking the Saronic Gulf, followed by sunset at the cliffside Temple of Poseidon.',
        insiderTip:
          'Mount Hymettus is only 20 minutes from central Athens and offers panoramic trails across the entire Attica basin.',
        rating: 4.9,
        reviewCount: 4120,
        priceRange: 'Free forest trail / €10 Sounion',
        timeOfDay: 'Morning',
        defaultDaySlot: 'Day 6 (Sat)',
        defaultWeekOffset: 0,
        photoUrl: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-emerald-900 via-teal-950 to-slate-900',
        googleMapsQuery: 'Kaisariani Monastery Hike Mount Hymettus Athens Greece',
        preselectedByDefault: true,
      },
    ],
  },

  'greece:chania': {
    matchKeywords: ['chania', 'crete', 'heraklion', 'rethymno', 'agios nikolaos'],
    seeds: [
      {
        idSuffix: 'chq-sinagogi-barbarossa-nightlife',
        interestId: 'nightlife',
        categoryLabel: '🍸 Open-Air Venetian Ruins Bar & Harbor Jazz',
        title: 'Sinagogi Open-Air Cocktail Bar & Fagotto Jazz Bar (Chania Old Town)',
        neighborhood: 'Kondylaki / Old Venetian Harbor, Chania, Crete',
        description:
          'Sip Cretan herb-infused cocktails inside candlelit open-air Venetian stone ruins and listen to live jazz in Chania’s car-free harbor lanes.',
        insiderTip:
          'Daliani Street and Splantzia Square are where year-round Chania locals and expats gather for evening wine and raki.',
        rating: 4.9,
        reviewCount: 3840,
        priceRange: '€9–€14 cocktails & wine',
        timeOfDay: 'Night',
        defaultDaySlot: 'Day 5 (Fri)',
        defaultWeekOffset: 0,
        photoUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-indigo-950 via-purple-950 to-slate-900',
        googleMapsQuery: 'Sinagogi Bar Old Venetian Harbor Chania Crete Greece',
        preselectedByDefault: true,
      },
      {
        idSuffix: 'chq-samaria-gorge-hike',
        interestId: 'hiking',
        categoryLabel: '🥾 Samaria Gorge National Park Canyon Trek',
        title: 'Samaria Gorge National Park Trek & White Mountains (Lefka Ori) Trail',
        neighborhood: 'Omalos Plateau / White Mountains, Chania, Crete',
        description:
          'Trek Europe’s longest dramatic limestone canyon (16km) through the 300m-high Iron Gates down to the turquoise Libyan Sea village of Agia Roumeli.',
        insiderTip:
          'Take the early 7:00 AM KTEL coach from Chania bus station to Xyloskalo trailhead to hike in cool morning mountain shade.',
        rating: 4.9,
        reviewCount: 6410,
        priceRange: '€5 park entry + coastal ferry',
        timeOfDay: 'Full Day',
        defaultDaySlot: 'Day 6 (Sat)',
        defaultWeekOffset: 0,
        photoUrl: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-emerald-900 via-teal-950 to-slate-900',
        googleMapsQuery: 'Samaria Gorge National Park Chania Crete Greece',
        preselectedByDefault: true,
      },
    ],
  },

  // ==================== MEXICO CITIES ====================
  'mexico:mexico-city': {
    matchKeywords: ['mexico city', 'cdmx', 'roma norte', 'condesa', 'polanco', 'coyoacan'],
    seeds: [
      {
        idSuffix: 'mex-supra-limantour',
        interestId: 'nightlife',
        categoryLabel: '🍸 World’s Top 50 Cocktail Bar & Rooftop',
        title: 'Licorería Limantour & Supra Roma 360° Rooftop Lounge',
        neighborhood: 'Avenida Álvaro Obregón, Roma Norte, Mexico City',
        description:
          'Experience Latin America’s #1 award-winning craft cocktail bar on Álvaro Obregón paired with Supra’s panoramic rooftop DJ terrace overlooking CDMX.',
        insiderTip:
          'Order the Mezcal Stalk or Margarita al Pastor at Limantour; reserve a 6:30 PM table at Supra for sunset over the volcanoes.',
        rating: 4.8,
        reviewCount: 5890,
        priceRange: '$11–$17 craft cocktails',
        timeOfDay: 'Night',
        defaultDaySlot: 'Day 5 (Fri)',
        defaultWeekOffset: 0,
        photoUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-indigo-950 via-purple-950 to-slate-900',
        googleMapsQuery: 'Licoreria Limantour Roma Norte Mexico City',
        preselectedByDefault: true,
      },
      {
        idSuffix: 'mex-parque-mexico-dating',
        interestId: 'dating',
        categoryLabel: '🥂 Art Deco Park & Bistro Terraces',
        title: 'Parque México Walk, Café Toscano & Lardo Social Dining',
        neighborhood: 'Hipódromo Condesa, Mexico City',
        description:
          'Stroll Condesa’s leafy Art Deco oval park and sidewalk bistros—Mexico City’s premier neighborhood for social coffees, dog walks, and dinner dates.',
        insiderTip:
          'Grab a counter seat at Lardo (Agustín Melgar 6) for shared Mediterranean-Mexican small plates and lively conversation.',
        rating: 4.9,
        reviewCount: 7420,
        priceRange: '$20–$40 dining & wine',
        timeOfDay: 'Evening',
        defaultDaySlot: 'Day 4 (Thu)',
        defaultWeekOffset: 0,
        photoUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-sky-900 via-indigo-950 to-slate-900',
        googleMapsQuery: 'Parque Mexico Condesa Lardo Mexico City',
        preselectedByDefault: true,
      },
      {
        idSuffix: 'mex-balloon-toluca-hike',
        interestId: 'hiking',
        categoryLabel: '🎈 Hot Air Balloon & Volcano Crater Trek',
        title: 'Volar en Globo Teotihuacán Sunrise Balloon & Desierto de los Leones Hike',
        neighborhood: 'Teotihuacán Valley & Cuajimalpa Pine Forest, CDMX',
        description:
          'Float in a hot air balloon at sunrise directly over the Pyramid of the Sun, or hike 3,500m pine-forest trails at Desierto de los Leones on the edge of CDMX.',
        insiderTip:
          'Dress in warm layers for the 6:00 AM Teotihuacán launch; mornings are crisp before warming to 24°C by midday.',
        rating: 4.9,
        reviewCount: 4610,
        priceRange: '$135 sunrise balloon / Free forest trail',
        timeOfDay: 'Morning',
        defaultDaySlot: 'Day 6 (Sat)',
        defaultWeekOffset: 0,
        photoUrl: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-emerald-900 via-teal-950 to-slate-900',
        googleMapsQuery: 'Volar en Globo Teotihuacan Mexico',
        preselectedByDefault: true,
      },
    ],
  },

  'mexico:puerto-vallarta': {
    matchKeywords: ['puerto vallarta', 'vallarta', 'sayulita', 'bucerias', 'punta mita', 'playa del carmen', 'tulum', 'merida'],
    seeds: [
      {
        idSuffix: 'pvr-lapalapa-elsolar',
        interestId: 'dating',
        categoryLabel: '🥂 Romantic Zone Beachfront & Pier Dining',
        title: 'La Palapa Beachfront Bistro & Los Muertos Pier Promenade (Zona Romántica)',
        neighborhood: 'Calle Pulpito, Zona Romántica, Puerto Vallarta',
        description:
          'Dine with your feet in the sand beside the illuminated sail-shaped Los Muertos Pier in Puerto Vallarta’s walkable Zona Romántica.',
        insiderTip:
          'Walk Basilio Badillo (“Restaurant Row”) on Thursday evenings during the Art Walk and lively expat gallery receptions.',
        rating: 4.8,
        reviewCount: 6120,
        priceRange: '$22–$42 beachfront dinner',
        timeOfDay: 'Evening',
        defaultDaySlot: 'Day 4 (Thu)',
        defaultWeekOffset: 0,
        photoUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-sky-900 via-indigo-950 to-slate-900',
        googleMapsQuery: 'La Palapa Zona Romantica Puerto Vallarta Mexico',
        preselectedByDefault: true,
      },
      {
        idSuffix: 'pvr-boca-tomatlan-hike',
        interestId: 'hiking',
        categoryLabel: '🥾 Coastal Jungle Cove Trail & Water Taxi',
        title: 'Boca de Tomatlán to Playa Colomitos & Las Ánimas Coastal Trail',
        neighborhood: 'South Bay Jungle Coast, Puerto Vallarta',
        description:
          'Hike along dramatic jungle cliffs and suspension bridges overhanging emerald Pacific coves from Boca de Tomatlán to hidden Playa Colomitos.',
        insiderTip:
          'Hike in the morning and take a $6 panga water taxi back to Los Muertos Pier after lunch on the beach.',
        rating: 4.9,
        reviewCount: 4890,
        priceRange: 'Free coastal trail / $6 water taxi',
        timeOfDay: 'Morning',
        defaultDaySlot: 'Day 6 (Sat)',
        defaultWeekOffset: 0,
        photoUrl: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-emerald-900 via-teal-950 to-slate-900',
        googleMapsQuery: 'Sendero Boca de Tomatlan Playa Colomitos Puerto Vallarta',
        preselectedByDefault: true,
      },
    ],
  },

  // ==================== INDONESIA CITIES ====================
  'indonesia:canggu': {
    matchKeywords: ['canggu', 'seminyak', 'berawa', 'pererenan', 'kuta'],
    seeds: [
      {
        idSuffix: 'dps-la-brisa-finns',
        interestId: 'nightlife',
        categoryLabel: '🍸 Iconic Oceanfront Beach Club',
        title: 'La Brisa Bali (Echo Beach) & Finns Beach Club (Berawa)',
        neighborhood: 'Echo Beach & Berawa, Canggu, Bali',
        description:
          'Handcrafted reclaimed-wood fisherman club set beneath towering palms at Echo Beach with lagoon pools, sunset bonfires, and international DJs.',
        insiderTip:
          'Arrive at La Brisa by 4:30 PM for front-row beanbags watching the sunset surf session at Echo Beach.',
        rating: 4.8,
        reviewCount: 9420,
        priceRange: '$10–$18 cocktails & tapas',
        timeOfDay: 'Evening',
        defaultDaySlot: 'Day 5 (Fri)',
        defaultWeekOffset: 0,
        photoUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-indigo-950 via-purple-950 to-slate-900',
        googleMapsQuery: 'La Brisa Bali Echo Beach Canggu Indonesia',
        preselectedByDefault: true,
      },
      {
        idSuffix: 'dps-bwork-canggu',
        interestId: 'coworking',
        categoryLabel: '💻 Bamboo Coworking, Pool & Sauna',
        title: 'BWork Bali & Tropical Nomad Coworking Space (Canggu)',
        neighborhood: 'Nelayan / Shortcut, Canggu, Bali',
        description:
          'Canggu’s premier digital nomad campus featuring 200+ Mbps dual-fiber, 25m lap pool, ice bath/sauna recovery zone, and Friday community mixers.',
        insiderTip:
          'Join their Friday afternoon poolside social to meet long-term E33G Remote Worker Visa holders.',
        rating: 4.9,
        reviewCount: 2340,
        priceRange: '$18 day pass',
        timeOfDay: 'Morning',
        defaultDaySlot: 'Day 1 (Mon)',
        defaultWeekOffset: 0,
        photoUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-slate-800 via-indigo-950 to-slate-900',
        googleMapsQuery: 'BWork Bali Canggu Coworking Indonesia',
        preselectedByDefault: true,
      },
    ],
  },

  'indonesia:ubud': {
    matchKeywords: ['ubud', 'kintamani', 'gianyar', 'penestanan', 'sayan'],
    seeds: [
      {
        idSuffix: 'ubd-campuhan-batur-hike',
        interestId: 'hiking',
        categoryLabel: '🥾 Sunrise Volcano Trek & Sacred Jungle Ridge',
        title: 'Campuhan Ridge Sunrise Walk (Ubud) & Mount Batur Caldera Trek',
        neighborhood: 'Sayan Ridge (Ubud) & Kintamani Highlands, Bali',
        description:
          'Stroll the lush emerald grass ridge between two river valleys in central Ubud at dawn, or trek to the 1,717m volcanic rim of Mount Batur for sunrise.',
        insiderTip:
          'Finish the Campuhan Ridge Walk at Karsa Kafe for lotus-pond Balinese coffee at 8:00 AM.',
        rating: 4.9,
        reviewCount: 7810,
        priceRange: 'Free ridge walk / $45 Batur trek',
        timeOfDay: 'Morning',
        defaultDaySlot: 'Day 6 (Sat)',
        defaultWeekOffset: 0,
        photoUrl: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-emerald-900 via-teal-950 to-slate-900',
        googleMapsQuery: 'Campuhan Ridge Walk Ubud Bali Indonesia',
        preselectedByDefault: true,
      },
      {
        idSuffix: 'ubd-outpost-cowork',
        interestId: 'coworking',
        categoryLabel: '💻 Rice-Field Coworking & Wellness Community',
        title: 'Outpost Ubud (Penestanan) & Nyuh Kuning Cowork',
        neighborhood: 'Penestanan & Nyuh Kuning, Ubud, Bali',
        description:
          'Work overlooking emerald rice terraces in Ubud’s quiet artist village of Penestanan, surrounded by raw-food cafes and The Yoga Barn.',
        insiderTip:
          'Penestanan and Nyuh Kuning are Ubud’s most walkable, scooter-light residential enclaves for long-term villa rentals.',
        rating: 4.9,
        reviewCount: 1920,
        priceRange: '$16 day pass',
        timeOfDay: 'Morning',
        defaultDaySlot: 'Day 1 (Mon)',
        defaultWeekOffset: 0,
        photoUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-slate-800 via-indigo-950 to-slate-900',
        googleMapsQuery: 'Outpost Ubud Penestanan Coworking Bali Indonesia',
        preselectedByDefault: true,
      },
    ],
  },
};

/**
 * Resolves curated seeds strictly matching the given stop's cityName.
 * Never returns seeds belonging to a different city in the same country.
 */
function getMatchingCityCuratedSeeds(countryId: string, cityName: string): CuratedVenueSeed[] {
  const cleanCountry = countryId.toLowerCase().trim();
  const lowerCity = cityName.toLowerCase().trim();
  const primaryToken = lowerCity.split(/[(&,/]/)[0].trim();

  for (const [key, entry] of Object.entries(CITY_FAMOUS_VENUES)) {
    if (!key.startsWith(`${cleanCountry}:`)) continue;
    const isMatch = entry.matchKeywords.some(
      kw => lowerCity.includes(kw) || (primaryToken.length >= 3 && kw.includes(primaryToken))
    );
    if (isMatch) {
      return entry.seeds;
    }
  }

  return [];
}

export interface IncludedVenuePlace {
  name: string;
  googleMapsUrl: string;
}

/**
 * Extracts individual venue/place names when a recommendation card combines 1, 2, or 3 suggested places
 * so the UI can clearly display "1 Place" vs "2 Suggested Places" with direct Google Maps links for each.
 */
export function extractPlacesFromVenueTitle(
  title: string,
  neighborhood: string,
  cityName: string,
  countryName: string
): IncludedVenuePlace[] {
  const cleanCity = cityName.split('&')[0].split('(')[0].trim() || countryName;
  const rawSegments = title
    .split(/\s+(?:\+|&|\/)\s+/)
    .map(s => s.trim())
    .filter(s => s.length >= 4);

  const merged: string[] = [];
  for (const seg of rawSegments) {
    const lower = seg.toLowerCase();
    if (
      merged.length > 0 &&
      (seg.split(/\s+/).length <= 1 ||
        lower.startsWith('sciences') ||
        lower.startsWith('tennis') ||
        lower.startsWith('freediving') ||
        lower.startsWith('bachata') ||
        lower.startsWith('wellness') ||
        lower.startsWith('advisor') ||
        lower.startsWith('crew') ||
        lower.startsWith('tonic') ||
        lower.startsWith('surf') ||
        lower.startsWith('bar'))
    ) {
      merged[merged.length - 1] = `${merged[merged.length - 1]} & ${seg}`;
    } else {
      merged.push(seg);
    }
  }

  const finalNames = merged.length > 0 ? merged.slice(0, 4) : [title];
  return finalNames.map(placeName => ({
    name: placeName,
    googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${placeName} ${neighborhood} ${cleanCity} ${countryName}`
    )}`,
  }));
}

/**
 * Generates a concrete, 100% city-scoped venue/operator recommendation for any interest in `cityName`.
 * Supports `variantIdx` (0 or 1) so each category in a city can offer multiple distinct city-specific options.
 * Strictly avoids referencing any other city in the country.
 */
function buildDynamicCityVenueSeed(
  interestId: ScoutInterestId,
  cityName: string,
  countryName: string,
  countryObj?: Country,
  weekOffset = 0,
  variantIdx = 0
): CuratedVenueSeed {
  const cleanCity = cityName.split('&')[0].split('(')[0].trim() || countryName;
  // Extract optional neighborhood in parentheses if present, e.g., "Bengaluru (Indiranagar)" -> "Indiranagar"
  const parenMatch = cityName.match(/\(([^)]+)\)/);
  const subDistrict = parenMatch ? parenMatch[1].split('&')[0].split(',')[0].trim() : `${cleanCity} Central Quarter`;

  const nomadProfile = countryObj ? getCountryNomadProfile(countryObj) : null;
  const internetMbps = nomadProfile?.verifiedInternetMbps || 180;
  const visaName = countryObj?.visa.retirementVisaName || 'Residency & Nomad Visa';

  switch (interestId) {
    case 'nightlife':
      if (variantIdx === 1) {
        return {
          idSuffix: `dyn-nightlife-v2-w${weekOffset}`,
          interestId: 'nightlife',
          categoryLabel: '🍺 Craft Microbrewery & Live Acoustic Pub',
          title: `${cleanCity} Craft Brewhouse & ${subDistrict} Live Jazz Lounge`,
          neighborhood: `${subDistrict}, ${cleanCity}`,
          description: `Unwind at ${cleanCity}’s highest-rated craft brewery and live acoustic music pub in ${subDistrict}—popular with local professionals and long-stay expats.`,
          insiderTip: `Thursday and Saturday live acoustic sets in ${subDistrict} start around 8:30 PM; great spot to compare ${cleanCity}’s evening neighborhood vibe.`,
          rating: 4.7,
          reviewCount: 2190,
          priceRange: '$8–$16 craft beer & cocktails',
          timeOfDay: 'Night',
          defaultDaySlot: 'Day 6 (Sat)',
          defaultWeekOffset: weekOffset,
          photoUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=900&q=80',
          fallbackGradient: 'from-indigo-900 via-violet-950 to-slate-900',
          googleMapsQuery: `Best craft brewery and live music pub ${subDistrict} ${cleanCity} ${countryName}`,
        };
      }
      return {
        idSuffix: `dyn-nightlife-v1-w${weekOffset}`,
        interestId: 'nightlife',
        categoryLabel: '🍸 Panoramic Rooftop Bar & Cocktail Terrace',
        title: `${cleanCity} Sky Rooftop Lounge & ${subDistrict} Speakeasy Bar`,
        neighborhood: `${subDistrict}, ${cleanCity}`,
        description: `Experience ${cleanCity}’s #1 rated evening social strip—start with golden-hour skyline cocktails on a rooftop terrace in ${subDistrict}, followed by signature mixology.`,
        insiderTip: `Peak atmosphere in ${cleanCity} starts around 8:00 PM Friday–Saturday; reserve a sunset terrace table in ${subDistrict}.`,
        rating: 4.8,
        reviewCount: 2840,
        priceRange: '$10–$18 signature cocktails',
        timeOfDay: 'Night',
        defaultDaySlot: 'Day 5 (Fri)',
        defaultWeekOffset: weekOffset,
        photoUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-indigo-950 via-purple-950 to-slate-900',
        googleMapsQuery: `Best rooftop cocktail bar ${subDistrict} ${cleanCity} ${countryName}`,
      };

    case 'dating':
      if (variantIdx === 1) {
        return {
          idSuffix: `dyn-dating-v2-w${weekOffset}`,
          interestId: 'dating',
          categoryLabel: '🍷 Sunset Tapas Courtyard & International Mixer',
          title: `${subDistrict} Courtyard Bistro & ${cleanCity} Expat-Local Social Night`,
          neighborhood: `${subDistrict} Promenade, ${cleanCity}`,
          description: `Join ${cleanCity}’s weekly international language & professional mixer in ${subDistrict}, or book an intimate candlelit courtyard table for shared plates.`,
          insiderTip: `Mid-week social mixers in ${cleanCity} are the fastest way to meet both welcoming locals and fellow international residents.`,
          rating: 4.8,
          reviewCount: 2410,
          priceRange: '$16–$32 dinner & wine',
          timeOfDay: 'Evening',
          defaultDaySlot: 'Day 5 (Fri)',
          defaultWeekOffset: weekOffset,
          photoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=900&q=80',
          fallbackGradient: 'from-sky-900 via-indigo-950 to-slate-900',
          googleMapsQuery: `Best courtyard restaurant wine bar ${subDistrict} ${cleanCity} ${countryName}`,
        };
      }
      return {
        idSuffix: `dyn-dating-v1-w${weekOffset}`,
        interestId: 'dating',
        categoryLabel: '🥂 Botanical Wine Terrace & Social Lounge',
        title: `${cleanCity} Botanical Wine Bar & ${subDistrict} Social Terrace`,
        neighborhood: `${subDistrict}, ${cleanCity}`,
        description: `Vibrant, welcoming evening social scene in ${cleanCity} where locals and expats gather at open-air wine terraces and specialty bistros in ${subDistrict}.`,
        insiderTip: `Arrive around 6:30 PM on Thursday in ${subDistrict}—rated ${
          countryObj?.demographics?.datingRating || 4
        }/5 for social friendliness and walkability.`,
        rating: 4.8,
        reviewCount: 3120,
        priceRange: '$15–$30 wine & shared plates',
        timeOfDay: 'Evening',
        defaultDaySlot: 'Day 4 (Thu)',
        defaultWeekOffset: weekOffset,
        photoUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-sky-900 via-indigo-950 to-slate-900',
        googleMapsQuery: `Best wine bar social lounge terrace ${subDistrict} ${cleanCity} ${countryName}`,
      };

    case 'hiking':
      if (variantIdx === 1) {
        return {
          idSuffix: `dyn-hiking-v2-w${weekOffset}`,
          interestId: 'hiking',
          categoryLabel: '🪂 Canyon Trek & Outdoor Adventure Operator',
          title: `${cleanCity} Canyon Waterfall Trail & Certified Adventure Guides`,
          neighborhood: `Regional Nature Reserve near ${cleanCity}`,
          description: `Half-day guided canyon, waterfall, or coastal cliff trek departing from ${cleanCity}, with optional tandem paragliding, zip-lining, or rock climbing.`,
          insiderTip: `Book an early 7:00 AM departure from ${cleanCity} for cool morning trail temperatures and clear photography light.`,
          rating: 4.8,
          reviewCount: 1890,
          priceRange: '$25–$65 guided outdoor adventure',
          timeOfDay: 'Morning',
          defaultDaySlot: 'Day 7 (Sun)',
          defaultWeekOffset: weekOffset,
          photoUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80',
          fallbackGradient: 'from-emerald-900 via-teal-950 to-slate-900',
          googleMapsQuery: `Guided hiking waterfall canyon tour ${cleanCity} ${countryName}`,
        };
      }
      return {
        idSuffix: `dyn-hiking-v1-w${weekOffset}`,
        interestId: 'hiking',
        categoryLabel: '🥾 Panoramic Ridge Hike & Sunrise Viewpoint',
        title: `${cleanCity} Panoramic Summit Trail & Morning Hiking Club`,
        neighborhood: `Scenic Ridge & National Park Outlook, ${cleanCity}`,
        description: `Morning hike along ${cleanCity}’s premier mountain or coastal viewpoint trail with panoramic 360° views over ${cleanCity} and surrounding valleys.`,
        insiderTip: `Best outdoor weather window in ${cleanCity}: ${
          countryObj?.climate.bestMonths || 'Spring & Autumn'
        } (${countryObj?.climate.annualSunnyDays || 265} sunny days/yr).`,
        rating: 4.9,
        reviewCount: 2490,
        priceRange: 'Free trail / $30 guided trek',
        timeOfDay: 'Morning',
        defaultDaySlot: 'Day 6 (Sat)',
        defaultWeekOffset: weekOffset,
        photoUrl: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-emerald-900 via-teal-950 to-slate-900',
        googleMapsQuery: `Best hiking trail viewpoint ${cleanCity} ${countryName}`,
      };

    case 'surfing':
      return {
        idSuffix: `dyn-surfing-v${variantIdx + 1}-w${weekOffset}`,
        interestId: 'surfing',
        categoryLabel: '🏄 Surf, Paddleboard & Waterfront Club',
        title:
          variantIdx === 1
            ? `${cleanCity} Sunset Catamaran & Waterfront Beach Club`
            : `${cleanCity} Surf & Paddleboard School + Marina Boardwalk`,
        neighborhood: `Waterfront & Marina District, ${cleanCity}`,
        description: `Test morning surf breaks, stand-up paddleboarding, kayaking, or sailing in ${cleanCity}, followed by relaxed waterfront dining.`,
        insiderTip: `Check morning water conditions in ${cleanCity}; average temperature is ${
          countryObj?.climate.averageTempC || 23
        }°C.`,
        rating: 4.8,
        reviewCount: 1950,
        priceRange: '$25–$45 session / rental',
        timeOfDay: 'Morning',
        defaultDaySlot: variantIdx === 1 ? 'Day 6 (Sat)' : 'Day 3 (Wed)',
        defaultWeekOffset: weekOffset,
        photoUrl: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-cyan-900 via-sky-950 to-slate-900',
        googleMapsQuery: `Surf paddleboard sailing club waterfront ${cleanCity} ${countryName}`,
      };

    case 'culture':
      return {
        idSuffix: `dyn-culture-v${variantIdx + 1}-w${weekOffset}`,
        interestId: 'culture',
        categoryLabel: '🎭 Central Market Gastronomy & Cultural Museum',
        title:
          variantIdx === 1
            ? `${cleanCity} Contemporary Arts Center & Heritage Tasting Walk`
            : `${cleanCity} Central Market Food Tour & Flagship Cultural Museum`,
        neighborhood: `${subDistrict}, ${cleanCity}`,
        description: `Sample regional specialties, artisan produce, and street gastronomy at ${cleanCity}’s historic market, then tour ${cleanCity}’s flagship cultural museum.`,
        insiderTip: `Local casual dining in ${cleanCity} averages ~$${
          countryObj?.costOfLiving.mealInexpensiveUSD || 12
        } per meal; visit the market before 11:00 AM for peak freshness.`,
        rating: 4.8,
        reviewCount: 4120,
        priceRange: '$12–$25 tasting walk',
        timeOfDay: 'Afternoon',
        defaultDaySlot: variantIdx === 1 ? 'Day 4 (Thu)' : 'Day 2 (Tue)',
        defaultWeekOffset: weekOffset,
        photoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-indigo-900 via-violet-950 to-slate-900',
        googleMapsQuery: `Central Market food tour museum ${cleanCity} ${countryName}`,
      };

    case 'architecture':
      return {
        idSuffix: `dyn-arch-v${variantIdx + 1}-w${weekOffset}`,
        interestId: 'architecture',
        categoryLabel: '🏛️ Historic Quarter Architecture & Plazas Walk',
        title:
          variantIdx === 1
            ? `${cleanCity} Royal Landmarks, Mirador & Botanical Promenade`
            : `${cleanCity} Historic Quarter, Grand Plazas & Heritage Walk`,
        neighborhood: `Old Town & ${subDistrict}, ${cleanCity}`,
        description: `Explore ${cleanCity}’s landmark plazas, restored historic townhouses, and most walkable residential streets (Walkability score: ${
          countryObj?.lifestyle.walkabilityScore || 85
        }/100).`,
        insiderTip: `Audit daytime vs. evening street noise and inspect residential courtyards in ${cleanCity}’s ${subDistrict} district.`,
        rating: 4.9,
        reviewCount: 3680,
        priceRange: 'Free self-guided / $18 heritage tour',
        timeOfDay: 'Afternoon',
        defaultDaySlot: variantIdx === 1 ? 'Day 5 (Fri)' : 'Day 3 (Wed)',
        defaultWeekOffset: weekOffset,
        photoUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-indigo-900 via-sky-950 to-slate-900',
        googleMapsQuery: `Historic Old Town Plaza Architecture ${cleanCity} ${countryName}`,
      };

    case 'nature':
      return {
        idSuffix: `dyn-nature-v${variantIdx + 1}-w${weekOffset}`,
        interestId: 'nature',
        categoryLabel: '🌿 Botanical Reserve, Lakes & Nature Sanctuary',
        title: `${cleanCity} Botanical Gardens & Regional Nature Sanctuary`,
        neighborhood: `Green Belt & Nature Reserve, ${cleanCity}`,
        description: `Full-day nature immersion into ${cleanCity}’s botanical gardens, lakes, or protected nature reserve trails within 45 minutes of ${subDistrict}.`,
        insiderTip: `Ideal weekend escape to experience ${cleanCity}’s ${
          countryObj?.climate.category || 'scenic'
        } microclimate and birdlife.`,
        rating: 4.8,
        reviewCount: 2940,
        priceRange: '$5–$18 park entry',
        timeOfDay: 'Full Day',
        defaultDaySlot: 'Day 7 (Sun)',
        defaultWeekOffset: weekOffset,
        photoUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-teal-900 via-emerald-950 to-slate-900',
        googleMapsQuery: `Botanical Garden National Park Nature Reserve ${cleanCity} ${countryName}`,
      };

    case 'volunteering':
      return {
        idSuffix: `dyn-volunteering-v${variantIdx + 1}-w${weekOffset}`,
        interestId: 'volunteering',
        categoryLabel: '🤝 Community Volunteering & Eco-Impact',
        title: `${cleanCity} Expat-Local Community Project & Language Mentoring`,
        neighborhood: `${subDistrict} Community Hub, ${cleanCity}`,
        description: `Join a welcoming half-day community initiative in ${cleanCity}—from park/coastal conservation and animal welfare to English conversation circles.`,
        insiderTip: `Fastest way to build meaningful friendships with long-term residents in ${cleanCity} (${
          countryObj?.lifestyle.expatCommunitySize || 'Active'
        } expat community).`,
        rating: 4.9,
        reviewCount: 890,
        priceRange: 'Free community session',
        timeOfDay: 'Morning',
        defaultDaySlot: 'Day 4 (Thu)',
        defaultWeekOffset: weekOffset,
        photoUrl: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-emerald-800 via-teal-950 to-slate-900',
        googleMapsQuery: `Community center volunteer NGO ${cleanCity} ${countryName}`,
      };

    case 'hobbies':
      return {
        idSuffix: `dyn-hobbies-v${variantIdx + 1}-w${weekOffset}`,
        interestId: 'hobbies',
        categoryLabel: '🧘 Padel, Tennis, Yoga & Wellness Club',
        title: `${cleanCity} Padel & Racquet Club + ${subDistrict} Yoga Studio`,
        neighborhood: `${subDistrict}, ${cleanCity}`,
        description: `Book a drop-in match or trial wellness class at ${cleanCity}’s highest-rated padel/tennis club, golf club, or boutique yoga studio.`,
        insiderTip: `Ask about monthly member socials and open match WhatsApp groups in ${cleanCity} for newcomers.`,
        rating: 4.8,
        reviewCount: 1420,
        priceRange: '$12–$25 drop-in session',
        timeOfDay: 'Afternoon',
        defaultDaySlot: 'Day 5 (Fri)',
        defaultWeekOffset: weekOffset,
        photoUrl: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-violet-900 via-indigo-950 to-slate-900',
        googleMapsQuery: `Padel tennis club yoga wellness studio ${cleanCity} ${countryName}`,
      };

    case 'coworking':
      return {
        idSuffix: `dyn-coworking-v${variantIdx + 1}-w${weekOffset}`,
        interestId: 'coworking',
        categoryLabel: '💻 Flagship Coworking & Fiber Audit',
        title:
          variantIdx === 1
            ? `${subDistrict} Specialty Coffee Roastery & Nomad Work Lounge`
            : `${cleanCity} Premier Coworking Hub (${internetMbps}+ Mbps Fiber Test)`,
        neighborhood: `${subDistrict}, ${cleanCity}`,
        description: `Run a full remote workday from ${cleanCity}’s top-rated coworking space—verify ${internetMbps} Mbps fiber latency, ergonomic chairs, and 5G backup.`,
        insiderTip: `Grab a day pass in ${subDistrict} on Monday or Wednesday to meet remote founders and ${
          nomadProfile?.remoteWorkVisaName || 'Digital Nomad Visa'
        } holders in ${cleanCity}.`,
        rating: 4.8,
        reviewCount: 1640,
        priceRange: '$10–$20 day pass',
        timeOfDay: 'Morning',
        defaultDaySlot: variantIdx === 1 ? 'Day 3 (Wed)' : 'Day 1 (Mon)',
        defaultWeekOffset: weekOffset,
        photoUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-slate-800 via-indigo-950 to-slate-900',
        googleMapsQuery: `Best coworking space specialty coffee ${subDistrict} ${cleanCity} ${countryName}`,
      };

    case 'healthcare':
      return {
        idSuffix: `dyn-healthcare-v${variantIdx + 1}-w${weekOffset}`,
        interestId: 'healthcare',
        categoryLabel: '🏥 Private Hospital & Longevity Clinic',
        title: `${cleanCity} International Private Hospital & English Specialist Tour`,
        neighborhood: `Medical District, ${cleanCity}`,
        description: `Walk-in scouting visit to ${cleanCity}’s leading private hospital (Healthcare score: ${
          countryObj?.lifestyle.healthcareScore || 85
        }/100) to verify English-speaking doctors and pharmacy prices.`,
        insiderTip: `Private health insurance in ${countryName} averages ~$${
          countryObj?.costOfLiving.healthcareMonthlyUSD || 95
        }/mo.`,
        rating: 4.8,
        reviewCount: 2190,
        priceRange: 'Free walk-in / $95 checkup',
        timeOfDay: 'Morning',
        defaultDaySlot: 'Day 2 (Tue)',
        defaultWeekOffset: weekOffset,
        photoUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-sky-900 via-teal-950 to-slate-900',
        googleMapsQuery: `International private hospital clinic ${cleanCity} ${countryName}`,
      };

    case 'residency':
    default:
      return {
        idSuffix: `dyn-residency-v${variantIdx + 1}-w${weekOffset}`,
        interestId: 'residency',
        categoryLabel: '🔑 Apartment Viewings & Visa Consult',
        title: `${cleanCity} (${subDistrict}) Furnished Rental Tour & ${visaName} Consult`,
        neighborhood: `${subDistrict}, ${cleanCity}`,
        description: `Inspect 2–3 long-term apartments in ${cleanCity} (1-Bed Center ~$${
          countryObj?.costOfLiving.rent1BedCenterUSD || 900
        }/mo, Outside ~$${
          countryObj?.costOfLiving.rent1BedOutsideUSD || 650
        }/mo) and verify local bank/visa steps.`,
        insiderTip: `Compare online listing prices against local neighborhood agency windows in ${subDistrict}, ${cleanCity} for 15–25% savings.`,
        rating: 4.7,
        reviewCount: 1120,
        priceRange: `Rent ~$${countryObj?.costOfLiving.rent1BedCenterUSD || 900}/mo`,
        timeOfDay: 'Afternoon',
        defaultDaySlot: 'Day 1 (Mon)',
        defaultWeekOffset: weekOffset,
        photoUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-slate-900 via-indigo-950 to-teal-950',
        googleMapsQuery: `Real estate agency apartments ${subDistrict} ${cleanCity} ${countryName}`,
      };
  }
}

export interface StopCuratedRecommendationCard extends ScoutScheduledItineraryItem {
  isPreselectedSuggestion: boolean;
  placesIncluded: IncludedVenuePlace[];
  experienceBadges: string[];
  genericFallbackPhotoUrl?: string;
}

/**
 * Adapts a venue recommendation seed according to the user's chosen Budget Tier
 * (economic / medium / luxury) and Experience Lenses (solo-women-safe, content-creator, vip-exclusive, etc.)
 */
function tailorVenueForExperienceProfile(
  seed: CuratedVenueSeed,
  cityName: string,
  budgetTier: ScoutBudgetTier,
  experienceLenses: ScoutExperienceLensId[]
): {
  description: string;
  insiderTip: string;
  priceRange: string;
  experienceBadges: string[];
} {
  const badges: string[] = [];
  let description = seed.description;
  let insiderTip = seed.insiderTip;
  let priceRange = seed.priceRange;

  if (budgetTier === 'economic') {
    badges.push('🪙 Value / Economic Pick');
    priceRange = `${seed.priceRange} (Value Local Tier)`;
  } else if (budgetTier === 'luxury') {
    badges.push('💎 Luxury & VIP Tier');
    priceRange = `${seed.priceRange} · VIP / Private Option`;
    insiderTip = `${seed.insiderTip} Ask for private terrace/concierge table reservations.`;
  } else {
    badges.push('⚖️ Balanced Comfort');
  }

  if (experienceLenses.includes('solo-women-safe')) {
    badges.push('🛡️ Solo Female Safe');
    insiderTip = `${insiderTip} Vetted safe, well-lit area in ${cityName.split('&')[0].trim()} with reliable Uber/ride-hailing pickup.`;
  }
  if (experienceLenses.includes('content-creator')) {
    badges.push('📸 Creator & Aesthetic');
  }
  if (experienceLenses.includes('vip-exclusive')) {
    badges.push('👑 Exclusive / Private');
  }
  if (experienceLenses.includes('retiree-accessible')) {
    badges.push('🌿 Step-Free & Calm');
  }
  if (experienceLenses.includes('nomad-social')) {
    badges.push('⚡ Nomad Social Hub');
  }

  return {
    description,
    insiderTip,
    priceRange,
    experienceBadges: badges,
  };
}

/**
 * Returns a rich list of specific, concrete place/venue/operator recommendations strictly for `stop.cityFocus`,
 * tailored to the user's selected interests, custom hobbies, budget tier, and experience lenses,
 * sorted chronologically by Week & Day and annotated with exact place counts.
 *
 * Guarantees that:
 * 1. Every venue card in `stop` belongs strictly to `stop.cityFocus` (never mixes venues from other cities).
 * 2. Every user-selected interest + core lifestyle category is present for `stop.cityFocus` so clicking any
 *    category filter pill filters cleanly in each city.
 * 3. Every venue card receives a unique, place/city/country-tailored thumbnail URL (`photoUrl`) plus a
 *    generic category fallback (`genericFallbackPhotoUrl`).
 */
export function getRecommendationsForStop(
  stop: ScoutTripStop,
  countryObj: Country | undefined,
  selectedInterests: ScoutInterestId[],
  customHobbies: string[],
  startWeekNumber: number,
  numWeeksForStop: number,
  budgetTier: ScoutBudgetTier = 'medium',
  experienceLenses: ScoutExperienceLensId[] = [],
  sharedUsedPhotoUrls?: Set<string>
): StopCuratedRecommendationCard[] {
  const cleanId = stop.countryId.toLowerCase().trim();
  const cityName =
    stop.cityFocus ||
    countryObj?.topCities?.[0]?.name ||
    countryObj?.capital ||
    stop.countryName;
  const cleanPrimaryCity = cityName.split('&')[0].split('(')[0].trim();
  const countryPhotos = getCountryPhotoConfig(cleanId, countryObj?.imageUrl);
  const usedUrlsTracker = sharedUsedPhotoUrls || new Set<string>();

  // 1. Load ONLY curated seeds that strictly match this stop's specific city
  const cityMatchedSeeds = getMatchingCityCuratedSeeds(cleanId, cityName);
  const curatedSeeds: CuratedVenueSeed[] = [...cityMatchedSeeds];

  // 2. Ensure ALL user-selected interests + core categories have city-specific venue cards in this city
  const targetCategories: ScoutInterestId[] = Array.from(
    new Set<ScoutInterestId>([
      ...selectedInterests,
      'nightlife',
      'dating',
      'hiking',
      'culture',
      'architecture',
      'coworking',
      'surfing',
      'nature',
      'healthcare',
      'residency',
    ])
  );

  const countByCategory = new Map<ScoutInterestId, number>();
  curatedSeeds.forEach(s => {
    countByCategory.set(s.interestId, (countByCategory.get(s.interestId) || 0) + 1);
  });

  targetCategories.forEach((intId, idx) => {
    const existingCount = countByCategory.get(intId) || 0;
    const isUserSelected = selectedInterests.includes(intId);

    // Every category gets at least 1 city-specific card; user-selected interests get 2 distinct city-specific cards
    // (distributed across weeks if multi-week) so filtering by any category in any city is rich and complete.
    if (existingCount === 0) {
      curatedSeeds.push({
        ...buildDynamicCityVenueSeed(
          intId,
          cityName,
          stop.countryName,
          countryObj,
          idx % numWeeksForStop,
          0
        ),
        preselectedByDefault: isUserSelected,
      });
      countByCategory.set(intId, 1);
    }

    if (isUserSelected && (countByCategory.get(intId) || 0) < 2) {
      curatedSeeds.push({
        ...buildDynamicCityVenueSeed(
          intId,
          cityName,
          stop.countryName,
          countryObj,
          (idx + 1) % numWeeksForStop,
          1
        ),
        preselectedByDefault: false,
      });
      countByCategory.set(intId, (countByCategory.get(intId) || 0) + 1);
    }
  });

  // 3. Inject concrete custom hobby venue recommendations scoped strictly to this stop's city
  customHobbies.forEach((hobby, idx) => {
    const cleanHobby = hobby.trim();
    if (!cleanHobby) return;
    curatedSeeds.push({
      idSuffix: `custom-hobby-${idx}-${cleanHobby.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      interestId: 'hobbies',
      categoryLabel: `🎯 ${cleanHobby} in ${cleanPrimaryCity}`,
      title: `Top ${cleanHobby} Club & Experience in ${cleanPrimaryCity}`,
      neighborhood: `${cityName}, ${stop.countryName}`,
      description: `Highly rated local venue, operator, or club for ${cleanHobby} in ${cityName}—connect with fellow enthusiasts and test weekly membership/session quality.`,
      insiderTip: `Click "Google Maps & Reviews" to check live ratings, photos, and session schedules for ${cleanHobby} in ${cityName}.`,
      rating: 4.8,
      reviewCount: 940 + idx * 170,
      priceRange: '$15–$35 session',
      timeOfDay: 'Afternoon',
      defaultDaySlot: DAY_SLOT_OPTIONS[(idx + 2) % DAY_SLOT_OPTIONS.length],
      defaultWeekOffset: idx % numWeeksForStop,
      photoUrl: countryPhotos.photoUrl,
      fallbackGradient: 'from-violet-900 via-indigo-950 to-slate-900',
      googleMapsQuery: `Best ${cleanHobby} club center in ${cityName} ${stop.countryName}`,
      preselectedByDefault: true,
    });
  });

  const interestSet = new Set(selectedInterests);

  const mappedCards: StopCuratedRecommendationCard[] = curatedSeeds.map((seed, idx) => {
    const assignedWeek =
      startWeekNumber + Math.min(numWeeksForStop - 1, seed.defaultWeekOffset ?? idx % numWeeksForStop);
    const assignedDay = seed.defaultDaySlot || DAY_SLOT_OPTIONS[idx % DAY_SLOT_OPTIONS.length];
    const recId = `rec-${stop.id}-${seed.idSuffix}`;

    const tailored = tailorVenueForExperienceProfile(
      seed,
      cityName,
      budgetTier,
      experienceLenses
    );

    const placesIncluded = extractPlacesFromVenueTitle(
      seed.title,
      seed.neighborhood,
      cityName,
      stop.countryName
    );

    const { primaryPhotoUrl, genericCategoryFallbackUrl } = resolveUniqueVenuePhotoUrl({
      interestId: seed.interestId,
      title: seed.title,
      neighborhood: seed.neighborhood,
      cityName,
      countryId: cleanId,
      countryName: stop.countryName,
      idSuffix: seed.idSuffix,
      seedPhotoUrl: seed.photoUrl,
      countryPhotoUrl: countryPhotos.photoUrl,
      usedUrlsTracker,
    });

    return {
      id: recId,
      recommendationId: recId,
      stopId: stop.id,
      countryId: stop.countryId,
      countryName: stop.countryName,
      countryFlag: stop.countryFlag,
      cityName,
      weekNumber: assignedWeek,
      daySlot: assignedDay,
      timeOfDay: seed.timeOfDay,
      title: seed.title,
      categoryLabel: seed.categoryLabel,
      interestId: seed.interestId,
      neighborhood: seed.neighborhood,
      description: tailored.description,
      insiderTip: tailored.insiderTip,
      rating: seed.rating,
      reviewCount: seed.reviewCount,
      priceRange: tailored.priceRange,
      photoUrl: primaryPhotoUrl,
      genericFallbackPhotoUrl: genericCategoryFallbackUrl,
      fallbackGradient: seed.fallbackGradient || countryPhotos.gradientFallback,
      googleMapsUrl: buildGoogleMapsSearchUrl(seed.googleMapsQuery),
      completed: false,
      isPreselectedSuggestion: Boolean(
        seed.preselectedByDefault || interestSet.has(seed.interestId)
      ),
      placesIncluded,
      experienceBadges: tailored.experienceBadges,
    };
  });

  // Sort chronologically by weekNumber ascending, then by daySlot order (Mon -> Sun), then by rating
  mappedCards.sort((a, b) => {
    if (a.weekNumber !== b.weekNumber) return a.weekNumber - b.weekNumber;
    const dayIdxA = DAY_SLOT_OPTIONS.indexOf(a.daySlot);
    const dayIdxB = DAY_SLOT_OPTIONS.indexOf(b.daySlot);
    if (dayIdxA !== dayIdxB) return dayIdxA - dayIdxB;
    return b.rating - a.rating;
  });

  return mappedCards;
}

/**
 * Generates an initial set of scheduled itinerary items across all stops when the user clicks
 * "Generate My Custom Itinerary" or when a trip has no scheduled items yet.
 * Stops are sorted chronologically by arrivalDate ascending.
 */
export function buildDefaultScheduledItineraryForStops(
  stops: ScoutTripStop[],
  countries: Country[],
  selectedInterests: ScoutInterestId[],
  customHobbies: string[],
  budgetTier: ScoutBudgetTier = 'medium',
  experienceLenses: ScoutExperienceLensId[] = []
): {
  allRecommendationsByStop: Record<string, StopCuratedRecommendationCard[]>;
  defaultSelectedItems: ScoutScheduledItineraryItem[];
  stopWeekRanges: Record<string, { startWeek: number; endWeek: number; numWeeks: number; totalDays: number }>;
} {
  const allRecommendationsByStop: Record<string, StopCuratedRecommendationCard[]> = {};
  const scheduledAccum: ScoutScheduledItineraryItem[] = [];
  const stopWeekRanges: Record<
    string,
    { startWeek: number; endWeek: number; numWeeks: number; totalDays: number }
  > = {};

  let currentWeekCursor = 1;
  // Share a single tracker across all stops so multi-city itineraries never repeat a thumbnail across cities either
  const globalUsedPhotoUrls = new Set<string>();

  // Sort stops chronologically by arrivalDate ascending
  const sortedStops = [...stops].sort((a, b) =>
    (a.arrivalDate || '').localeCompare(b.arrivalDate || '')
  );

  sortedStops.forEach(stop => {
    const countryObj = countries.find(
      c =>
        c.id.toLowerCase() === stop.countryId.toLowerCase() ||
        c.name.toLowerCase() === stop.countryName.toLowerCase()
    );

    const startObj = new Date(`${stop.arrivalDate}T00:00:00Z`);
    const endObj = new Date(`${stop.departureDate}T00:00:00Z`);
    const rawDays =
      !isNaN(startObj.getTime()) && !isNaN(endObj.getTime()) && endObj >= startObj
        ? Math.floor((endObj.getTime() - startObj.getTime()) / (1000 * 60 * 60 * 24)) + 1
        : 14;
    const numWeeks = Math.max(1, Math.min(6, Math.ceil(rawDays / 7)));
    const startWeek = currentWeekCursor;
    const endWeek = currentWeekCursor + numWeeks - 1;

    stopWeekRanges[stop.id] = {
      startWeek,
      endWeek,
      numWeeks,
      totalDays: rawDays,
    };

    const recs = getRecommendationsForStop(
      stop,
      countryObj,
      selectedInterests,
      customHobbies,
      startWeek,
      numWeeks,
      budgetTier,
      experienceLenses,
      globalUsedPhotoUrls
    );
    allRecommendationsByStop[stop.id] = recs;

    // Pick top matching recommendations (up to 5 per stop) distributed across the stop's weeks & days
    const preselected = recs.filter(r => r.isPreselectedSuggestion).slice(0, 5);
    const chosen = preselected.length > 0 ? preselected : recs.slice(0, 4);

    chosen.forEach((item, idx) => {
      const distributedWeek = startWeek + (idx % numWeeks);
      const distributedDay = DAY_SLOT_OPTIONS[(idx * 2) % DAY_SLOT_OPTIONS.length];
      scheduledAccum.push({
        ...item,
        weekNumber: distributedWeek,
        daySlot: distributedDay,
      });
    });

    currentWeekCursor += numWeeks;
  });

  const defaultSelectedItems = scheduledAccum;

  // Sort defaultSelectedItems chronologically by weekNumber and daySlot
  defaultSelectedItems.sort((a, b) => {
    if (a.weekNumber !== b.weekNumber) return a.weekNumber - b.weekNumber;
    return DAY_SLOT_OPTIONS.indexOf(a.daySlot) - DAY_SLOT_OPTIONS.indexOf(b.daySlot);
  });

  return {
    allRecommendationsByStop,
    defaultSelectedItems,
    stopWeekRanges,
  };
}
