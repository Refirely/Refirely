import { Country, ScoutScheduledItineraryItem, ScoutTripStop } from '../types';
import { ScoutInterestId, SCOUT_INTEREST_CATALOG } from './scoutCoordinatesAndItineraries';
import { getCountryNomadProfile } from './countryNomadProfiles';
import { getCountryPhotoConfig } from '../components/CountryThumbnail';

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
 * Famous, real-world venue, pub/bar, dating spot, hiking/paragliding operator, coworking, and cultural recommendations
 * indexed by countryId
 */
const COUNTRY_FAMOUS_VENUES: Record<string, CuratedVenueSeed[]> = {
  colombia: [
    {
      idSuffix: 'med-envy-rooftop',
      interestId: 'nightlife',
      categoryLabel: '🍸 Nightlife & Rooftop Bar',
      title: 'Envy Rooftop Bar — The Charlee Hotel',
      neighborhood: 'Parque Lleras / El Poblado, Medellín',
      description:
        'Medellín’s flagship open-air aquarium rooftop lounge overlooking the Aburrá Valley with live DJ sets, craft cocktails, and cosmopolitan crowd.',
      insiderTip:
        'Arrive by 7:30 PM on Thursday or Friday for sunset tables without cover; smart-casual dress code strictly enforced.',
      rating: 4.7,
      reviewCount: 3420,
      priceRange: '$14–$22 cocktails',
      timeOfDay: 'Night',
      defaultDaySlot: 'Day 5 (Fri)',
      defaultWeekOffset: 0,
      photoUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=80',
      fallbackGradient: 'from-indigo-950 via-purple-950 to-slate-900',
      googleMapsQuery: 'Envy Rooftop The Charlee Hotel Parque Lleras Medellin Colombia',
      preselectedByDefault: true,
    },
    {
      idSuffix: 'med-son-havana',
      interestId: 'nightlife',
      categoryLabel: '🎺 Live Salsa & Pub',
      title: 'Son Havana Bar — Live Cuban & Paisa Salsa',
      neighborhood: 'Carrera 73 / Laureles, Medellín',
      description:
        'Iconic neighborhood salsa club where live brass bands play Thursday–Saturday; welcoming mix of local Paisas and expats.',
      insiderTip:
        'Come on Wednesday at 8:00 PM for their free group salsa class before the live band kicks off.',
      rating: 4.8,
      reviewCount: 2890,
      priceRange: '$5–$10 rum & club beers',
      timeOfDay: 'Night',
      defaultDaySlot: 'Day 6 (Sat)',
      defaultWeekOffset: 1,
      photoUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=900&q=80',
      fallbackGradient: 'from-rose-950 via-amber-950 to-slate-900',
      googleMapsQuery: 'Son Havana Bar Laureles Medellin Colombia',
      preselectedByDefault: false,
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
      fallbackGradient: 'from-rose-900 via-pink-950 to-slate-900',
      googleMapsQuery: 'Provenza El Poblado Mamba Negra Medellin Colombia',
      preselectedByDefault: true,
    },
    {
      idSuffix: 'med-paragliding-sanfelix',
      interestId: 'hiking',
      categoryLabel: '🪂 Paragliding & Mountain Ridge',
      title: 'Aeroclub Medellín / Zona de Vuelo San Félix Paragliding',
      neighborhood: 'San Félix Mountain Launch (Bello / North Medellín)',
      description:
        'Soar 2,500 ft above the Aburrá Valley and cloud-forest waterfalls on a 25-minute certified tandem paragliding flight with GoPro video included.',
      insiderTip:
        'Book the 9:30 AM–11:30 AM morning slot when thermal updrafts are smoothest and cloud cover is clearest.',
      rating: 4.9,
      reviewCount: 2140,
      priceRange: '$58–$72 tandem flight',
      timeOfDay: 'Morning',
      defaultDaySlot: 'Day 3 (Wed)',
      defaultWeekOffset: 0,
      photoUrl: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=900&q=80',
      fallbackGradient: 'from-emerald-900 via-teal-950 to-slate-900',
      googleMapsQuery: 'Parapente San Felix Aeroclub Medellin Colombia',
      preselectedByDefault: true,
    },
    {
      idSuffix: 'med-arvi-tres-cruces',
      interestId: 'nature',
      categoryLabel: '🥾 Cloud Forest & Fitness Hike',
      title: 'Parque Arví Metrocable Trail & Cerro de las Tres Cruces',
      neighborhood: 'Santa Elena / Belén Altavista, Medellín',
      description:
        'Ride the scenic Line L Metrocable gondola over the mountain ridge into Parque Arví’s orchid trails, or hike Cerro de las Tres Cruces with local fitness groups.',
      insiderTip:
        'Hike Tres Cruces between 6:30 AM and 9:30 AM on weekends when hundreds of locals climb for fresh mango and juices at the summit.',
      rating: 4.8,
      reviewCount: 5180,
      priceRange: '$3 Metrocable + guided trail',
      timeOfDay: 'Morning',
      defaultDaySlot: 'Day 6 (Sat)',
      defaultWeekOffset: 0,
      photoUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80',
      fallbackGradient: 'from-teal-900 via-emerald-950 to-slate-900',
      googleMapsQuery: 'Parque Arvi Santa Elena Medellin Colombia',
      preselectedByDefault: true,
    },
    {
      idSuffix: 'med-comuna13-botero',
      interestId: 'culture',
      categoryLabel: '🎭 Culture, Street Art & History',
      title: 'Comuna 13 Casa Kolacho Graffitour & Plaza Botero',
      neighborhood: 'San Javier (Comuna 13) & Centro, Medellín',
      description:
        'Walk with local hip-hop artists through the outdoor electric escalators, vibrant murals, and mango michelada viewpoints overlooking western Medellín.',
      insiderTip:
        'Take the clean Medellín Metro to San Javier Station and book a Casa Kolacho community guide.',
      rating: 4.9,
      reviewCount: 6840,
      priceRange: '$15–$22 guided walking tour',
      timeOfDay: 'Afternoon',
      defaultDaySlot: 'Day 2 (Tue)',
      defaultWeekOffset: 0,
      photoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=900&q=80',
      fallbackGradient: 'from-amber-900 via-orange-950 to-slate-900',
      googleMapsQuery: 'Escaleras Electricas Comuna 13 Medellin Colombia',
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
    {
      idSuffix: 'med-pablo-tobon-clinic',
      interestId: 'healthcare',
      categoryLabel: '🏥 JCI Hospital & Residency Audit',
      title: 'Hospital Pablo Tobón Uribe & El Poblado Apartment Viewing',
      neighborhood: 'Robledo / Milla de Oro, Medellín',
      description:
        'Tour Medellín’s top international patient department for private health plan quotes ($65–$95/mo Sura/Allianz) and inspect 2 furnished apartments.',
      insiderTip:
        'Compare long-term unfurnished vs. furnished contratos in Laureles, Envigado, and Sabaneta for 35% lower monthly rent.',
      rating: 4.8,
      reviewCount: 2310,
      priceRange: 'Free walk-in consult',
      timeOfDay: 'Afternoon',
      defaultDaySlot: 'Day 2 (Tue)',
      defaultWeekOffset: 1,
      photoUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=900&q=80',
      fallbackGradient: 'from-sky-900 via-teal-950 to-slate-900',
      googleMapsQuery: 'Hospital Pablo Tobon Uribe Medellin Colombia',
      preselectedByDefault: false,
    },
  ],

  portugal: [
    {
      idSuffix: 'pt-park-bar-rooftop',
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
      idSuffix: 'pt-principe-real-dating',
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
      fallbackGradient: 'from-rose-900 via-pink-950 to-slate-900',
      googleMapsQuery: 'Jardim do Principe Real Lisbon Portugal',
      preselectedByDefault: true,
    },
    {
      idSuffix: 'pt-cabo-roca-ursa-hike',
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
      idSuffix: 'pt-carcavelos-surf',
      interestId: 'surfing',
      categoryLabel: '🏄 Surfing & Cascais Marina',
      title: 'Carcavelos Surf School & Bar do Guincho Beach Club',
      neighborhood: 'Carcavelos & Cascais Coastal Line',
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
      idSuffix: 'pt-alfama-arch',
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
      fallbackGradient: 'from-stone-800 via-amber-950 to-slate-900',
      googleMapsQuery: 'Miradouro de Santa Luzia Alfama Lisbon Portugal',
      preselectedByDefault: true,
    },
    {
      idSuffix: 'pt-second-home-cowork',
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
      preselectedByDefault: false,
    },
    {
      idSuffix: 'pt-cuf-hospital-nif',
      interestId: 'healthcare',
      categoryLabel: '🏥 Hospital CUF & D7/D8 Visa Audit',
      title: 'Hospital CUF Descobertas Tour & Loja do Cidadão (NIF/AIMA Check)',
      neighborhood: 'Parque das Nações & Laranjeiras, Lisbon',
      description:
        'Audit Portugal’s leading private hospital network (English-speaking physicians, €65–€110/mo Médis/Multicare plans) and verify NIF/bank requirements.',
      insiderTip:
        'Parque das Nações is flat, modern, and riverfront—ideal to compare against historic cobblestone neighborhoods.',
      rating: 4.7,
      reviewCount: 2840,
      priceRange: 'Free scouting visit',
      timeOfDay: 'Morning',
      defaultDaySlot: 'Day 2 (Tue)',
      defaultWeekOffset: 1,
      photoUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=900&q=80',
      fallbackGradient: 'from-sky-900 via-teal-950 to-slate-900',
      googleMapsQuery: 'Hospital CUF Descobertas Lisbon Portugal',
      preselectedByDefault: false,
    },
  ],

  spain: [
    {
      idSuffix: 'es-atenea-sky-rooftop',
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
      idSuffix: 'es-ruzafa-mercat-colon',
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
      fallbackGradient: 'from-rose-900 via-pink-950 to-slate-900',
      googleMapsQuery: 'Mercado de Colon Ruzafa Valencia Spain',
      preselectedByDefault: true,
    },
    {
      idSuffix: 'es-montanejos-turia-hike',
      interestId: 'hiking',
      categoryLabel: '🥾 Thermal Gorge Hike & Turia Park',
      title: 'Fuente de los Baños de Montanejos Canyon Trek & Jardín del Turia',
      neighborhood: 'Montanejos (Castellón Gorge) & Turia Riverbed, Valencia',
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
      idSuffix: 'es-ciudad-artes-arch',
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
      fallbackGradient: 'from-stone-800 via-amber-950 to-slate-900',
      googleMapsQuery: 'Ciudad de las Artes y las Ciencias Valencia Spain',
      preselectedByDefault: true,
    },
    {
      idSuffix: 'es-marina-beach-club',
      interestId: 'surfing',
      categoryLabel: '🏄 Mediterranean Beach Club & Sailing',
      title: 'Marina Beach Club & La Malvarrosa Catamaran / Paddle Center',
      neighborhood: 'Marina Real Juan Carlos I & Playa de la Patacona, Valencia',
      description:
        'Spend a sunny afternoon at Valencia’s flagship beachfront infinity pool club or test stand-up paddleboarding and sailing from the America’s Cup marina.',
      insiderTip:
        'Book lunch at Casa Carmela on Malvarrosa Beach for traditional wood-fired Valencian paella cooked over orange-tree branches.',
      rating: 4.6,
      reviewCount: 4520,
      priceRange: '€25–€45 beach club / paella',
      timeOfDay: 'Afternoon',
      defaultDaySlot: 'Day 3 (Wed)',
      defaultWeekOffset: 0,
      photoUrl: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=900&q=80',
      fallbackGradient: 'from-cyan-900 via-sky-950 to-slate-900',
      googleMapsQuery: 'Marina Beach Club Valencia Spain',
      preselectedByDefault: false,
    },
  ],

  thailand: [
    {
      idSuffix: 'th-north-gate-octave',
      interestId: 'nightlife',
      categoryLabel: '🎷 Live Jazz & Skyscraper Rooftop',
      title: 'North Gate Jazz Co-Op (Chiang Mai) & Octave Rooftop Bar (Bangkok)',
      neighborhood: 'Si Phum Old City Moat (Chiang Mai) / Thonglor (Bangkok)',
      description:
        'Experience Chiang Mai’s legendary open-front live jazz and blues venue on the northern moat, plus 360° sunset cocktails 49 floors above Sukhumvit.',
      insiderTip:
        'Tuesday night is the famous Open Jam Session at North Gate Jazz Co-Op—arrive by 8:00 PM as the crowd spills onto the street.',
      rating: 4.8,
      reviewCount: 4720,
      priceRange: '$4–$14 craft drinks',
      timeOfDay: 'Night',
      defaultDaySlot: 'Day 5 (Fri)',
      defaultWeekOffset: 0,
      photoUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=80',
      fallbackGradient: 'from-indigo-950 via-purple-950 to-slate-900',
      googleMapsQuery: 'North Gate Jazz Co-Op Chiang Mai Thailand',
      preselectedByDefault: true,
    },
    {
      idSuffix: 'th-one-nimman-social',
      interestId: 'dating',
      categoryLabel: '🥂 Night Market & Social Piazza',
      title: 'One Nimman Clocktower Piazza & Think Park Evening Mixers',
      neighborhood: 'Nimmanhaemin Road Soi 1, Chiang Mai',
      description:
        'Brick-lined open-air piazza featuring craft wine lounges, live acoustic sets, night food stalls, and regular digital nomad & expat social nights.',
      insiderTip:
        'Thursday evening White Market and salsa/swing dance nights in the One Nimman courtyard are super welcoming for solo travelers and couples.',
      rating: 4.7,
      reviewCount: 5380,
      priceRange: '$8–$18 food & wine',
      timeOfDay: 'Evening',
      defaultDaySlot: 'Day 4 (Thu)',
      defaultWeekOffset: 0,
      photoUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=900&q=80',
      fallbackGradient: 'from-rose-900 via-pink-950 to-slate-900',
      googleMapsQuery: 'One Nimman Chiang Mai Thailand',
      preselectedByDefault: true,
    },
    {
      idSuffix: 'th-monks-trail-pha-lat',
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
      idSuffix: 'th-yellow-punspace-cowork',
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
    {
      idSuffix: 'th-bangkok-hospital-dtv',
      interestId: 'healthcare',
      categoryLabel: '🏥 JCI Hospital & DTV 5-Year Visa Audit',
      title: 'Bangkok Hospital Chiang Mai / Bumrungrad International Checkup',
      neighborhood: 'Nong Pa Khrang (Chiang Mai) / Sukhumvit Soi 3 (Bangkok)',
      description:
        'Walk-in tour of Thailand’s JCI-accredited international hospitals famous for 2-hour comprehensive executive blood/longevity panels and English specialists.',
      insiderTip:
        'Ask the International Insurance Desk for their outpatient vs. inpatient direct-billing list (Pacific Cross, Cigna, April International).',
      rating: 4.9,
      reviewCount: 5620,
      priceRange: '$120–$280 full health checkup',
      timeOfDay: 'Morning',
      defaultDaySlot: 'Day 2 (Tue)',
      defaultWeekOffset: 0,
      photoUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=900&q=80',
      fallbackGradient: 'from-sky-900 via-teal-950 to-slate-900',
      googleMapsQuery: 'Bangkok Hospital Chiang Mai Thailand',
      preselectedByDefault: false,
    },
  ],

  greece: [
    {
      idSuffix: 'gr-a-for-athens-barbarossa',
      interestId: 'nightlife',
      categoryLabel: '🍸 Acropolis Rooftop & Venetian Harbor Bar',
      title: 'A for Athens Rooftop Bar (Monastiraki) & Sinagogi Open-Air Bar (Chania)',
      neighborhood: 'Monastiraki Square, Athens & Old Venetian Harbor, Chania',
      description:
        'Enjoy illuminated Parthenon views from Monastiraki’s premier rooftop cocktail terrace and Chania’s candlelit open-air stone ruins lounge.',
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
      idSuffix: 'gr-samaria-sounion-hike',
      interestId: 'hiking',
      categoryLabel: '🥾 Samaria Gorge & Temple of Poseidon Trail',
      title: 'Samaria Gorge National Park Trek (Crete) & Cape Sounion Coastal Hike',
      neighborhood: 'White Mountains (Chania) & Athens Riviera South',
      description:
        'Trek Europe’s longest dramatic limestone canyon down to the turquoise Libyan Sea ferry or hike the Aegean coastal cliffs around the Temple of Poseidon.',
      insiderTip:
        'Take the early 7:00 AM coach from Chania to Xyloskalo trailhead to hike the Iron Gates in cool morning shade.',
      rating: 4.9,
      reviewCount: 5110,
      priceRange: '€5 park entry + ferry',
      timeOfDay: 'Full Day',
      defaultDaySlot: 'Day 6 (Sat)',
      defaultWeekOffset: 0,
      photoUrl: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=900&q=80',
      fallbackGradient: 'from-emerald-900 via-teal-950 to-slate-900',
      googleMapsQuery: 'Samaria Gorge National Park Chania Crete Greece',
      preselectedByDefault: true,
    },
    {
      idSuffix: 'gr-vouliagmeni-beach-club',
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
      idSuffix: 'gr-koukaki-plaka-dating',
      interestId: 'dating',
      categoryLabel: '🥂 Koukaki Wine Bars & Plaka Terraces',
      title: 'Heteroclito Cave & Wine Bar + Plaka Anafiotika Steps',
      neighborhood: 'Koukaki & Plaka Historic Center, Athens',
      description:
        'Sample indigenous Greek Assyrtiko and Xinomavro wines on lively pedestrian streets where Athenians and expats mingle every evening.',
      insiderTip:
        'Drakou Street in Koukaki is Athens’ most walkable residential-meets-social strip for scouting 1-bedroom apartments.',
      rating: 4.8,
      reviewCount: 3190,
      priceRange: '€8–€15 wine & meze',
      timeOfDay: 'Evening',
      defaultDaySlot: 'Day 4 (Thu)',
      defaultWeekOffset: 0,
      photoUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=900&q=80',
      fallbackGradient: 'from-rose-900 via-pink-950 to-slate-900',
      googleMapsQuery: 'Koukaki Pedestrian Street Wine Bars Athens Greece',
      preselectedByDefault: true,
    },
  ],

  mexico: [
    {
      idSuffix: 'mx-supra-limantour',
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
      idSuffix: 'mx-parque-mexico-dating',
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
      fallbackGradient: 'from-rose-900 via-pink-950 to-slate-900',
      googleMapsQuery: 'Parque Mexico Condesa Lardo Mexico City',
      preselectedByDefault: true,
    },
    {
      idSuffix: 'mx-balloon-toluca-hike',
      interestId: 'hiking',
      categoryLabel: '🎈 Hot Air Balloon & Volcano Crater Trek',
      title: 'Volar en Globo Teotihuacán Sunrise Balloon & Nevado de Toluca Hike',
      neighborhood: 'Teotihuacán Valley & Nevado de Toluca National Park',
      description:
        'Float in a hot air balloon at sunrise directly over the Pyramid of the Sun, or hike the 4,200m alpine crater lagoons of Nevado de Toluca.',
      insiderTip:
        'Dress in warm layers for the 6:00 AM Teotihuacán launch; mornings are crisp before warming to 24°C by midday.',
      rating: 4.9,
      reviewCount: 4610,
      priceRange: '$135 sunrise balloon flight',
      timeOfDay: 'Morning',
      defaultDaySlot: 'Day 6 (Sat)',
      defaultWeekOffset: 0,
      photoUrl: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=900&q=80',
      fallbackGradient: 'from-emerald-900 via-teal-950 to-slate-900',
      googleMapsQuery: 'Volar en Globo Teotihuacan Mexico',
      preselectedByDefault: true,
    },
  ],

  indonesia: [
    {
      idSuffix: 'id-la-brisa-finns',
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
      idSuffix: 'id-mount-batur-trek',
      interestId: 'hiking',
      categoryLabel: '🥾 Sunrise Volcano Trek & Paragliding',
      title: 'Mount Batur Sunrise Caldera Hike & Timbis Cliff Paragliding (Uluwatu)',
      neighborhood: 'Kintamani Volcano & Bukit Peninsula, Bali',
      description:
        'Trek to the 1,717m volcanic rim for sunrise over Mount Agung and Lake Batur, or fly tandem coastal paragliding over turquoise Uluwatu reefs.',
      insiderTip:
        'Soak in Toya Devasya natural lakeside hot springs immediately after descending Mount Batur.',
      rating: 4.9,
      reviewCount: 6810,
      priceRange: '$45 guided trek / $75 paragliding',
      timeOfDay: 'Morning',
      defaultDaySlot: 'Day 6 (Sat)',
      defaultWeekOffset: 0,
      photoUrl: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=900&q=80',
      fallbackGradient: 'from-emerald-900 via-teal-950 to-slate-900',
      googleMapsQuery: 'Mount Batur Sunrise Trekking Kintamani Bali',
      preselectedByDefault: true,
    },
    {
      idSuffix: 'id-bwork-canggu',
      interestId: 'coworking',
      categoryLabel: '💻 Bamboo Coworking, Pool & Sauna',
      title: 'BWork Bali & Tropical Nomad Coworking Space',
      neighborhood: 'Nelayan / Shortcut, Canggu, Bali',
      description:
        'Bali’s premier digital nomad campus featuring 200+ Mbps dual-fiber, 25m lap pool, ice bath/sauna recovery zone, and Friday community mixers.',
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

  'costa-rica': [
    {
      idSuffix: 'cr-volcano-brewing-mercadito',
      interestId: 'nightlife',
      categoryLabel: '🍹 Beachfront Microbrewery & Nightlife',
      title: 'Volcano Brewing Company & El Mercadito de Tamarindo',
      neighborhood: 'Playa Tamarindo, Guanacaste & Avenida Escazú',
      description:
        'Open-air craft brewery right on the sand at Tamarindo Beach paired with El Mercadito’s fairy-lit garden cocktail bars and live acoustic DJs.',
      insiderTip:
        'Thursday night ladies’ & expat mixer at El Mercadito is the hub of Tamarindo’s social calendar.',
      rating: 4.8,
      reviewCount: 3120,
      priceRange: '$8–$16 craft beer & cocktails',
      timeOfDay: 'Night',
      defaultDaySlot: 'Day 5 (Fri)',
      defaultWeekOffset: 0,
      photoUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=80',
      fallbackGradient: 'from-indigo-950 via-purple-950 to-slate-900',
      googleMapsQuery: 'El Mercadito de Tamarindo Guanacaste Costa Rica',
      preselectedByDefault: true,
    },
    {
      idSuffix: 'cr-witchs-rock-surf',
      interestId: 'surfing',
      categoryLabel: '🏄 Pacific Surf Camp & Catamaran',
      title: 'Witch’s Rock Surf Camp & Marlin del Rey Sunset Catamaran',
      neighborhood: 'Playa Tamarindo, Guanacaste',
      description:
        'Catch warm year-round Pacific waves right in front of Witch’s Rock Surf Camp and sail the Guanacaste coast with snorkeling and sunset drinks.',
      insiderTip:
        'Morning high tide offers the cleanest longboard and beginner-to-intermediate peeling waves.',
      rating: 4.9,
      reviewCount: 3910,
      priceRange: '$45 surf lesson / $85 catamaran',
      timeOfDay: 'Morning',
      defaultDaySlot: 'Day 3 (Wed)',
      defaultWeekOffset: 0,
      photoUrl: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=900&q=80',
      fallbackGradient: 'from-cyan-900 via-sky-950 to-slate-900',
      googleMapsQuery: 'Witchs Rock Surf Camp Tamarindo Costa Rica',
      preselectedByDefault: true,
    },
    {
      idSuffix: 'cr-arenal-sky-adventures',
      interestId: 'hiking',
      categoryLabel: '🥾 Volcano Lava Trail & Canopy Zipline',
      title: 'Arenal 1968 Volcano Lava Trail & Sky Adventures Canopy Zipline',
      neighborhood: 'La Fortuna / Arenal National Park',
      description:
        'Hike across ancient lava fields with towering views of Arenal Volcano and soar across rainforest cloud canyons on high-altitude ziplines.',
      insiderTip:
        'Finish the day soaking in Tabacón or EcoTermales natural volcanic thermal river pools.',
      rating: 4.9,
      reviewCount: 5740,
      priceRange: '$20 trail / $84 canopy zipline',
      timeOfDay: 'Morning',
      defaultDaySlot: 'Day 6 (Sat)',
      defaultWeekOffset: 0,
      photoUrl: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=900&q=80',
      fallbackGradient: 'from-emerald-900 via-teal-950 to-slate-900',
      googleMapsQuery: 'Arenal 1968 Trail La Fortuna Costa Rica',
      preselectedByDefault: true,
    },
  ],
};

/**
 * Generates a concrete, named venue/operator recommendation for any interest in any city/country
 * when a specific pre-curated entry isn't already present for that exact interest.
 */
function buildDynamicCityVenueSeed(
  interestId: ScoutInterestId,
  cityName: string,
  countryName: string,
  countryObj?: Country,
  weekOffset = 0
): CuratedVenueSeed {
  const cleanCity = cityName.split('&')[0].split('(')[0].trim() || countryName;
  const topVenueDistrict =
    countryObj?.adultEntertainment?.topVenuesOrDistricts?.[0] || `${cleanCity} Historic & Social Quarter`;
  const nomadProfile = countryObj ? getCountryNomadProfile(countryObj) : null;
  const internetMbps = nomadProfile?.verifiedInternetMbps || 180;
  const visaName = countryObj?.visa.retirementVisaName || 'Residency & Nomad Visa';

  switch (interestId) {
    case 'nightlife':
      return {
        idSuffix: `dyn-nightlife-${weekOffset}`,
        interestId: 'nightlife',
        categoryLabel: '🍸 Famous Rooftop Bar & Pub Crawl',
        title: `${topVenueDistrict} Flagship Rooftop Lounge & Craft Pubs`,
        neighborhood: `${topVenueDistrict}, ${cleanCity}`,
        description: `Experience ${cleanCity}’s #1 rated evening social strip—start at a panoramic sunset rooftop lounge in ${topVenueDistrict}, followed by live acoustic/jazz pubs.`,
        insiderTip: `Peak atmosphere starts around 8:30 PM Thursday–Saturday; check Google Maps live busyness for the top terrace in ${topVenueDistrict}.`,
        rating: 4.7,
        reviewCount: 2840,
        priceRange: '$10–$18 cocktails & craft beer',
        timeOfDay: 'Night',
        defaultDaySlot: 'Day 5 (Fri)',
        defaultWeekOffset: weekOffset,
        photoUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-indigo-950 via-purple-950 to-slate-900',
        googleMapsQuery: `Best rooftop bar and live music pub ${topVenueDistrict} ${cleanCity} ${countryName}`,
      };

    case 'dating':
      return {
        idSuffix: `dyn-dating-${weekOffset}`,
        interestId: 'dating',
        categoryLabel: '🥂 Top Dating & Social Mixer Spot',
        title: `${cleanCity} Botanical Wine Terrace & Expat-Local Social Mixer`,
        neighborhood: `Central Pedestrian Promenade, ${cleanCity}`,
        description: `${
          countryObj?.demographics?.datingCultureSummary ||
          `Vibrant, welcoming social atmosphere in ${cleanCity} where locals and international residents gather at open-air wine bars and specialty cafes.`
        }`,
        insiderTip: `Attend the Thursday evening international language & wine social in ${cleanCity}—rated ${
          countryObj?.demographics?.datingRating || 4
        }/5 for social friendliness.`,
        rating: 4.8,
        reviewCount: 3120,
        priceRange: '$15–$30 wine & shared plates',
        timeOfDay: 'Evening',
        defaultDaySlot: 'Day 4 (Thu)',
        defaultWeekOffset: weekOffset,
        photoUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-rose-900 via-pink-950 to-slate-900',
        googleMapsQuery: `Best wine bar social lounge terrace ${cleanCity} ${countryName}`,
      };

    case 'hiking':
      return {
        idSuffix: `dyn-hiking-${weekOffset}`,
        interestId: 'hiking',
        categoryLabel: '🪂 Scenic Ridge Hike & Tandem Paragliding',
        title: `${cleanCity} Panoramic Summit Trail & Certified Adventure Operators`,
        neighborhood: `Scenic Ridge & National Park Outlook near ${cleanCity}`,
        description: `Guided morning hike along ${cleanCity}’s most famous mountain/coastal viewpoint trail, with optional tandem paragliding or zip-lining offered by top local operators.`,
        insiderTip: `Best outdoor weather window: ${
          countryObj?.climate.bestMonths || 'Spring & Autumn'
        } (${countryObj?.climate.annualSunnyDays || 265} sunny days/yr). Book morning departures for clear views.`,
        rating: 4.9,
        reviewCount: 2490,
        priceRange: 'Free trail / $65 guided adventure',
        timeOfDay: 'Morning',
        defaultDaySlot: 'Day 6 (Sat)',
        defaultWeekOffset: weekOffset,
        photoUrl: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-emerald-900 via-teal-950 to-slate-900',
        googleMapsQuery: `Best hiking trail and paragliding adventure ${cleanCity} ${countryName}`,
      };

    case 'surfing':
      return {
        idSuffix: `dyn-surfing-${weekOffset}`,
        interestId: 'surfing',
        categoryLabel: '🏄 Surf Club, Marina & Waterfront Boardwalk',
        title: `${cleanCity} Surf & Sailing Club + Sunset Beach Lounge`,
        neighborhood: `Waterfront Promenade & Marina, ${cleanCity}`,
        description: `Test morning surf breaks, stand-up paddleboarding, or catamaran sailing with ${cleanCity}’s top-rated water sports school, followed by beachfront seafood.`,
        insiderTip: `Check morning swell and wind conditions; water & air average ${
          countryObj?.climate.averageTempC || 23
        }°C.`,
        rating: 4.8,
        reviewCount: 1950,
        priceRange: '$25–$45 session / rental',
        timeOfDay: 'Morning',
        defaultDaySlot: 'Day 3 (Wed)',
        defaultWeekOffset: weekOffset,
        photoUrl: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-cyan-900 via-sky-950 to-slate-900',
        googleMapsQuery: `Surf school beach club marina ${cleanCity} ${countryName}`,
      };

    case 'culture':
      return {
        idSuffix: `dyn-culture-${weekOffset}`,
        interestId: 'culture',
        categoryLabel: '🎭 Central Market Gastronomy & Museum',
        title: `Mercado Central de ${cleanCity} Food Tour & Flagship Cultural Museum`,
        neighborhood: `Historic Gastronomy Quarter, ${cleanCity}`,
        description: `Sample regional specialties, artisan cheeses, and seasonal fruit at ${cleanCity}’s main municipal market, then tour the city’s top cultural museum.`,
        insiderTip: `Local casual dining averages ~$${
          countryObj?.costOfLiving.mealInexpensiveUSD || 12
        } per meal; visit the market before 11:00 AM for peak freshness.`,
        rating: 4.8,
        reviewCount: 4120,
        priceRange: '$12–$25 tasting walk',
        timeOfDay: 'Afternoon',
        defaultDaySlot: 'Day 2 (Tue)',
        defaultWeekOffset: weekOffset,
        photoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-amber-900 via-orange-950 to-slate-900',
        googleMapsQuery: `Central Market food tour museum ${cleanCity} ${countryName}`,
      };

    case 'architecture':
      return {
        idSuffix: `dyn-arch-${weekOffset}`,
        interestId: 'architecture',
        categoryLabel: '🏛️ Old Town Architecture & Plazas Walk',
        title: `${cleanCity} Historic Quarter, Grand Plazas & Residential Architecture Walk`,
        neighborhood: `Old Town & Heritage District, ${cleanCity}`,
        description: `Explore ${cleanCity}’s landmark plazas, restored historic townhouses, and most walkable residential streets (Walkability score: ${
          countryObj?.lifestyle.walkabilityScore || 85
        }/100).`,
        insiderTip: `Audit daytime vs. evening street noise and inspect building courtyards in ${cleanCity}’s top residential blocks.`,
        rating: 4.9,
        reviewCount: 3680,
        priceRange: 'Free self-guided / $18 tour',
        timeOfDay: 'Afternoon',
        defaultDaySlot: 'Day 3 (Wed)',
        defaultWeekOffset: weekOffset,
        photoUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-stone-800 via-amber-950 to-slate-900',
        googleMapsQuery: `Historic Old Town Plaza Architecture ${cleanCity} ${countryName}`,
      };

    case 'nature':
      return {
        idSuffix: `dyn-nature-${weekOffset}`,
        interestId: 'nature',
        categoryLabel: '🌿 Botanical Reserve, Waterfalls & Lakes',
        title: `${cleanCity} Botanical Gardens & Regional National Park Excursion`,
        neighborhood: `Green Belt & Nature Reserve, ${cleanCity}`,
        description: `Full-day nature immersion into ${cleanCity}’s botanical gardens, thermal springs, or protected national park trails within 45–60 minutes of town.`,
        insiderTip: `Ideal weekend escape to experience ${countryName}’s ${
          countryObj?.climate.category || 'scenic'
        } biodiversity.`,
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
        idSuffix: `dyn-volunteering-${weekOffset}`,
        interestId: 'volunteering',
        categoryLabel: '🤝 Community Volunteering & Eco-Impact',
        title: `${cleanCity} Expat-Local Community Project & Language Mentoring`,
        neighborhood: `Community Hub, ${cleanCity}`,
        description: `Join a welcoming half-day community initiative in ${cleanCity}—from coastal/park conservation and animal rescue to English conversation circles.`,
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
        idSuffix: `dyn-hobbies-${weekOffset}`,
        interestId: 'hobbies',
        categoryLabel: '🧘 Padel, Tennis, Yoga & Wellness Club',
        title: `${cleanCity} Padel & Racquet Club + Boutique Yoga/Wellness Studio`,
        neighborhood: `Sports & Lifestyle District, ${cleanCity}`,
        description: `Book a drop-in match or trial wellness class at ${cleanCity}’s highest-rated padel/tennis club, golf course, or yoga studio.`,
        insiderTip: `Ask about monthly member socials and open match WhatsApp groups for newcomers.`,
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
        idSuffix: `dyn-coworking-${weekOffset}`,
        interestId: 'coworking',
        categoryLabel: '💻 Flagship Coworking & Fiber Audit',
        title: `${cleanCity} Premier Coworking Hub (${internetMbps}+ Mbps Fiber Test)`,
        neighborhood: `Innovation & Business District, ${cleanCity}`,
        description: `Run a full remote workday from ${cleanCity}’s top-rated coworking space—verify ${internetMbps} Mbps fiber latency, ergonomic chairs, and 5G backup.`,
        insiderTip: `Grab a day pass on Monday or Wednesday to meet remote founders and ${
          nomadProfile?.remoteWorkVisaName || 'Digital Nomad Visa'
        } holders.`,
        rating: 4.8,
        reviewCount: 1640,
        priceRange: '$12–$22 day pass',
        timeOfDay: 'Morning',
        defaultDaySlot: 'Day 1 (Mon)',
        defaultWeekOffset: weekOffset,
        photoUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-slate-800 via-indigo-950 to-slate-900',
        googleMapsQuery: `Best coworking space cafe ${cleanCity} ${countryName}`,
      };

    case 'healthcare':
      return {
        idSuffix: `dyn-healthcare-${weekOffset}`,
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
        idSuffix: `dyn-residency-${weekOffset}`,
        interestId: 'residency',
        categoryLabel: '🔑 Apartment Viewings & Visa Consult',
        title: `${cleanCity} Furnished Rental Tour & ${visaName} Advisor`,
        neighborhood: `Prime Residential Quarter, ${cleanCity}`,
        description: `Inspect 2–3 long-term apartments in ${cleanCity} (1-Bed Center ~$${
          countryObj?.costOfLiving.rent1BedCenterUSD || 900
        }/mo, Outside ~$${
          countryObj?.costOfLiving.rent1BedOutsideUSD || 650
        }/mo) and verify local bank/visa steps.`,
        insiderTip: `Always compare online listing prices against local neighborhood agency windows in ${cleanCity} for 15–25% savings.`,
        rating: 4.7,
        reviewCount: 1120,
        priceRange: `Rent ~$${countryObj?.costOfLiving.rent1BedCenterUSD || 900}/mo`,
        timeOfDay: 'Afternoon',
        defaultDaySlot: 'Day 1 (Mon)',
        defaultWeekOffset: weekOffset,
        photoUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=900&q=80',
        fallbackGradient: 'from-slate-900 via-indigo-950 to-teal-950',
        googleMapsQuery: `Real estate agency apartments ${cleanCity} ${countryName}`,
      };
  }
}

export interface StopCuratedRecommendationCard extends ScoutScheduledItineraryItem {
  isPreselectedSuggestion: boolean;
}

/**
 * Returns a rich list of specific, concrete place/venue/operator recommendations for a given stop,
 * tailored to the user's selected interests and custom hobbies, with Google Maps links, ratings, and photos.
 */
export function getRecommendationsForStop(
  stop: ScoutTripStop,
  countryObj: Country | undefined,
  selectedInterests: ScoutInterestId[],
  customHobbies: string[],
  startWeekNumber: number,
  numWeeksForStop: number
): StopCuratedRecommendationCard[] {
  const cleanId = stop.countryId.toLowerCase().trim();
  const cityName =
    stop.cityFocus ||
    countryObj?.topCities?.[0]?.name ||
    countryObj?.capital ||
    stop.countryName;
  const countryPhotos = getCountryPhotoConfig(cleanId, countryObj?.imageUrl);

  const curatedSeeds: CuratedVenueSeed[] = [...(COUNTRY_FAMOUS_VENUES[cleanId] || [])];

  // Ensure every user-selected interest has at least one concrete recommendation for this stop
  const coveredInterests = new Set(curatedSeeds.map(s => s.interestId));
  selectedInterests.forEach((intId, idx) => {
    if (!coveredInterests.has(intId)) {
      curatedSeeds.push({
        ...buildDynamicCityVenueSeed(intId, cityName, stop.countryName, countryObj, idx % numWeeksForStop),
        preselectedByDefault: true,
      });
      coveredInterests.add(intId);
    }
  });

  // Also add at least 2 extra high-value relocation/lifestyle recommendations if the list has fewer than 6
  const fallbackPriorityInterests: ScoutInterestId[] = [
    'nightlife',
    'dating',
    'hiking',
    'culture',
    'coworking',
    'residency',
  ];
  fallbackPriorityInterests.forEach((intId, idx) => {
    if (curatedSeeds.length < 7 && !coveredInterests.has(intId)) {
      curatedSeeds.push({
        ...buildDynamicCityVenueSeed(intId, cityName, stop.countryName, countryObj, idx % numWeeksForStop),
        preselectedByDefault: selectedInterests.includes(intId),
      });
      coveredInterests.add(intId);
    }
  });

  // Inject concrete custom hobby venue recommendations (e.g. "Padel", "Salsa", "Paragliding", "Scuba")
  customHobbies.forEach((hobby, idx) => {
    const cleanHobby = hobby.trim();
    if (!cleanHobby) return;
    curatedSeeds.push({
      idSuffix: `custom-hobby-${idx}-${cleanHobby.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      interestId: 'hobbies',
      categoryLabel: `🎯 ${cleanHobby}`,
      title: `Top ${cleanHobby} Club & Experience in ${cityName.split('&')[0].trim()}`,
      neighborhood: `${cityName}, ${stop.countryName}`,
      description: `Highly rated local venue, operator, or club for ${cleanHobby} in ${cityName}—connect with fellow enthusiasts and test weekly membership/session quality.`,
      insiderTip: `Click "View on Google Maps" to check live reviews, photos, and session schedules for ${cleanHobby} in ${cityName}.`,
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

  // Sort so that recommendations matching user's active interests come first
  const interestSet = new Set(selectedInterests);
  curatedSeeds.sort((a, b) => {
    const aMatch = interestSet.has(a.interestId) ? 1 : 0;
    const bMatch = interestSet.has(b.interestId) ? 1 : 0;
    if (aMatch !== bMatch) return bMatch - aMatch;
    return b.rating - a.rating;
  });

  return curatedSeeds.map((seed, idx) => {
    const assignedWeek =
      startWeekNumber + Math.min(numWeeksForStop - 1, seed.defaultWeekOffset ?? idx % numWeeksForStop);
    const assignedDay = seed.defaultDaySlot || DAY_SLOT_OPTIONS[idx % DAY_SLOT_OPTIONS.length];
    const recId = `rec-${stop.id}-${seed.idSuffix}`;

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
      description: seed.description,
      insiderTip: seed.insiderTip,
      rating: seed.rating,
      reviewCount: seed.reviewCount,
      priceRange: seed.priceRange,
      photoUrl: seed.photoUrl || countryPhotos.photoUrl,
      fallbackGradient: seed.fallbackGradient || countryPhotos.gradientFallback,
      googleMapsUrl: buildGoogleMapsSearchUrl(seed.googleMapsQuery),
      completed: false,
      isPreselectedSuggestion: Boolean(
        seed.preselectedByDefault || interestSet.has(seed.interestId)
      ),
    };
  });
}

/**
 * Generates an initial set of scheduled itinerary items across all stops when the user clicks
 * "Generate My Custom Itinerary" or when a trip has no scheduled items yet.
 */
export function buildDefaultScheduledItineraryForStops(
  stops: ScoutTripStop[],
  countries: Country[],
  selectedInterests: ScoutInterestId[],
  customHobbies: string[]
): {
  allRecommendationsByStop: Record<string, StopCuratedRecommendationCard[]>;
  defaultSelectedItems: ScoutScheduledItineraryItem[];
  stopWeekRanges: Record<string, { startWeek: number; endWeek: number; numWeeks: number; totalDays: number }>;
} {
  const allRecommendationsByStop: Record<string, StopCuratedRecommendationCard[]> = {};
  const defaultSelectedItems: ScoutScheduledItineraryItem[] = [];
  const stopWeekRanges: Record<
    string,
    { startWeek: number; endWeek: number; numWeeks: number; totalDays: number }
  > = {};

  let currentWeekCursor = 1;

  stops.forEach(stop => {
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
      numWeeks
    );
    allRecommendationsByStop[stop.id] = recs;

    // Pick top matching recommendations (up to 4–5 per stop) distributed across the stop's weeks & days
    const preselected = recs.filter(r => r.isPreselectedSuggestion).slice(0, 5);
    const chosen = preselected.length > 0 ? preselected : recs.slice(0, 4);

    chosen.forEach((item, idx) => {
      const distributedWeek = startWeek + (idx % numWeeks);
      const distributedDay = DAY_SLOT_OPTIONS[(idx * 2) % DAY_SLOT_OPTIONS.length];
      defaultSelectedItems.push({
        ...item,
        weekNumber: distributedWeek,
        daySlot: distributedDay,
      });
    });

    currentWeekCursor += numWeeks;
  });

  return {
    allRecommendationsByStop,
    defaultSelectedItems,
    stopWeekRanges,
  };
}
