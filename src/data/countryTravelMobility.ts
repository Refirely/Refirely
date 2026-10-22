import { Country, CountryTravelMobility, RetireeActivity } from '../types';

/**
 * Curated Travel, Famous Retirement Activities & Domestic Mobility database.
 * Explicitly covers retiree lifestyles, activities to pass time, domestic transportation,
 * and safety/mobility profiles for couples, solo travelers, and solo female travelers.
 */
export const BESPOKE_TRAVEL_MOBILITY: Record<string, Partial<CountryTravelMobility>> = {
  portugal: {
    countryId: 'portugal',
    countryName: 'Portugal',
    activitiesHeadline: 'Coastal boardwalk strolls, world-class golf, wine harvesting, and Camino trail walking',
    retireeActivities: [
      {
        id: 'pt-golf',
        title: 'Championship Golf on the Algarve Coast',
        category: 'Outdoor & Nature',
        description: 'Over 40 internationally acclaimed golf courses line the southern coast from Quinta do Lago to Lagos, offering discounted retiree membership packages and morning oceanfront tee times.',
        popularLocations: 'Vilamoura, Quinta do Lago, Vale do Lobo, Cascais',
        intensity: 'Moderate Activity',
        whyRetireesLoveIt: 'Year-round Mediterranean sunshine, pristine fairways, and clubhouse lunch leagues with fellow international expats.',
      },
      {
        id: 'pt-wine',
        title: 'Douro Valley & Alentejo Wine Tours',
        category: 'Food, Wine & Culinary',
        description: 'Day-tripping along terraced Douro river vineyards, sampling Port varieties, and joining harvest weekend pickings (vindimas) at local quintas.',
        popularLocations: 'Pinhão, Peso da Régua, Évora, Monsaraz',
        intensity: 'Gentle & Relaxed',
        whyRetireesLoveIt: 'World-class vintages at modest prices, exceptional regional cheeses, and scenic rail rides along the Douro river.',
      },
      {
        id: 'pt-camino',
        title: 'Portuguese Coastal Camino & Rota Vicentina',
        category: 'Outdoor & Nature',
        description: 'Hiking gentle segments of the historic Camino Português pilgrim route or coastal cliff paths along the Fishermen’s Trail with panoramic Atlantic vistas.',
        popularLocations: 'Viana do Castelo, Porto coastal path, Costa Vicentina Natural Park',
        intensity: 'Active Exploration',
        whyRetireesLoveIt: 'Extremely well-marked, safe trails with abundant quaint village cafés, fresh seafood taverns, and luggage-transfer services.',
      },
      {
        id: 'pt-language',
        title: 'Municipal Portuguese Classes & Expat Book Clubs',
        category: 'Volunteering & Learning',
        description: 'Joining subsidized PLA (Portuguese as a Host Language) courses, foreign film discussion circles, and American Club of Lisbon or British Historical Society seminars.',
        popularLocations: 'Lisbon, Cascais, Tavira, Coimbra, Porto',
        intensity: 'Gentle & Relaxed',
        whyRetireesLoveIt: 'Engages the mind, builds local respect with Portuguese neighbors, and forms lasting friendships with incoming retirees.',
      },
      {
        id: 'pt-sailing',
        title: 'Atlantic Sailing, Kayaking & Coastal Paddling',
        category: 'Outdoor & Nature',
        description: 'Chartering day catamarans, marina social clubs, and calm dolphin-watching excursions along the Ria Formosa barrier islands.',
        popularLocations: 'Lagos Marina, Olhão, Cascais, Portimão',
        intensity: 'Moderate Activity',
        whyRetireesLoveIt: 'Gentle sea breezes, vibrant marina terrace cafés, and active retiree sailing clubs.',
      },
      {
        id: 'pt-volunteer',
        title: 'Animal Rescue Support & Community Gardening',
        category: 'Volunteering & Learning',
        description: 'Volunteering with regional canine/feline rescue sanctuaries (such as APAA Algarve) or tending community olive and citrus orchards.',
        popularLocations: 'Silves, Loulé, Sintra, Caldas da Rainha',
        intensity: 'Moderate Activity',
        whyRetireesLoveIt: 'High community fulfillment, giving back to local municipalities, and bonding with compassionate pet lovers.',
      },
    ],
    domesticTransit: {
      publicTransitScore: 88,
      trainNetwork: 'CP (Comboios de Portugal) operates Alfa Pendular high-speed trains (Lisbon to Porto in 2h 45m; Lisbon to Faro in 3h) plus scenic regional lines with 50% discounts for seniors 65+.',
      intercityBuses: 'Rede Expressos, FlixBus, and Gipsyy provide cheap, immaculate air-conditioned coach service connecting virtually every small historic town.',
      carRentalAndRoads: 'Excellent toll motorways (Autoestradas) with automated Via Verde electronic toll transponders. Driving is calm outside dense Lisbon/Porto centers.',
      rideHailingAndTaxis: ['Uber', 'Bolt', 'FreeNow', 'Licensed White/Green Taxis'],
      domesticAirAndFerries: 'TAP Air Portugal and Ryanair fly hourly between Lisbon, Porto, and Faro; daily commuter ferries cross the Tagus River and link Algarve barrier islands.',
    },
    couples: {
      safetyRating: 94,
      safetyVerdict: 'Exceptionally Safe',
      easeOfMovement: 'Effortless / Excellent Transit',
      excitementLevel: 'World-Class Scenic Variety',
      summary: 'One of the world’s most romantic and peaceful retirement territories. Couples can effortlessly combine tranquil beach living in the Algarve with weekend cultural escapes to Porto, Sintra palaces, and medieval Évora without stress.',
      recommendedDestinations: ['Sintra & Cascais Coastline', 'Douro Valley Quinta Hotels', 'Monsaraz & Alentejo Dark Sky Reserve', 'Madeira Levada Walks'],
      transportOptions: ['Alfa Pendular Trains', 'Scenic Highway A2/A22', 'Ria Formosa water taxis'],
      safetyAdvice: [
        'Vehicle property crime is low; keep bags out of sight in rental cars parked at secluded surf beaches.',
        'Beware of cobblestone streets (calçada portuguesa) when wet—pack good grip walking shoes.',
      ],
      romanticEscapes: ['Private Douro River solar boat cruises with wine tasting', 'Sunset dining overlooking the Ponta da Piedade cliffs in Lagos', 'Historic Pousada stays in medieval castles'],
      scenicRoadTrips: ['N2 Highway (Portugal’s Route 66 from Chaves to Faro)', 'Costa Vicentina scenic coastal route through cliff-side fishing villages'],
      coupleFriendlyVibe: 'Warm, respectful family-oriented society where restaurant owners greet couples with genuine warmth.',
    },
    solo: {
      safetyRating: 93,
      safetyVerdict: 'Exceptionally Safe',
      easeOfMovement: 'Effortless / Excellent Transit',
      excitementLevel: 'Charming & Scenic',
      summary: 'Ideal for solo retirees. Solo dining in petiscos wine bars is comfortable and customary. English is widely spoken in healthcare and coastal hubs, and expat coffee meetups occur weekly.',
      recommendedDestinations: ['Cascais', 'Tavira', 'Porto Ribeiro Quarter', 'Coimbra University District'],
      transportOptions: ['CP Trains (50% senior discount with passport)', 'FlixBus and Rede Expressos', 'Metro do Porto / Metropolitano de Lisboa'],
      safetyAdvice: [
        'Watch for pickpockets in crowded tourist trams in Lisbon (Tram 28) and Belém.',
        'Use Bolt or Uber after midnight rather than hailing unmetered street cabs in tourist zones.',
      ],
      socialEaseRating: 90,
      solitaryDiningAndCafeCulture: 'Dining alone at tascas and pastelarias with a bica (espresso) and pastel de nata is completely normal and welcomed.',
      meetingOtherRetirees: 'Thriving Meetup.com expat groups, Americans & Friends PT, InterNations Lisbon, and English library clubs.',
      solitaryNavigationTips: ['Download the CP Train app for seamless digital ticketing', 'Purchase a rechargeable Navegante or Andante city transit card'],
    },
    soloFemale: {
      safetyRating: 93,
      safetyVerdict: 'Exceptionally Safe',
      femaleSafetyScore: 94,
      streetHarassmentLevel: 'Virtually Non-Existent',
      easeOfMovement: 'Effortless / Excellent Transit',
      excitementLevel: 'Charming & Scenic',
      summary: 'Portugal ranks as the 7th most peaceful country in the world (Global Peace Index). Solo female retirees and travelers consistently report feeling secure walking alone at night, using public trains, and exploring remote villages.',
      culturalDressAndEtiquette: 'Western and relaxed coastal attire. Modest dress recommended when visiting historic cathedrals and monasteries.',
      nighttimeTransitAdvice: 'Metros and train stations are clean, well-lit, and monitored by CCTV and security guards. Ride-hailing via Uber and Bolt is prompt and inexpensive.',
      recommendedPrecautions: [
        'Exercise standard awareness in nightlife quarters like Bairro Alto (Lisbon) or Cais de Gaia late on weekends.',
        'Keep emergency number 112 saved in your phone; police (PSP/GNR) are courteous and often speak conversational English.',
      ],
      femaleExpatCommunities: 'Active Facebook groups: "Portugal Expat Women", "Women Traveling in Portugal", and "Algarve Ladies Network".',
      recommendedDestinations: ['Cascais', 'Lagos Old Town', 'Porto Foz do Douro', 'Aveiro Canals'],
      transportOptions: ['Metro networks', 'Uber/Bolt apps', 'Well-patrolled CP trains'],
      safetyAdvice: ['Stay alert around tourist transport hubs', 'Store your passport photocopy in cloud storage'],
    },
  },
  spain: {
    countryId: 'spain',
    countryName: 'Spain',
    activitiesHeadline: 'Paseo evening promenades, flamenco heritage, golf resorts, tapas crawl culture, and Mediterranean sailing',
    retireeActivities: [
      {
        id: 'es-paseo',
        title: 'The Daily Evening Paseo & Tapas Culture',
        category: 'Food, Wine & Culinary',
        description: 'Embracing the quintessentially Spanish custom of strolling the town plaza at 7 PM, greeting neighbors, and enjoying tapas with a glass of crisp Albariño or Rioja.',
        popularLocations: 'Valencia Old Town, Malaga Promenade, Seville Santa Cruz, Alicante',
        intensity: 'Gentle & Relaxed',
        whyRetireesLoveIt: 'Effortless social contact, low-cost culinary delights ($2–$4 tapas), and zero loneliness in pedestrian-friendly town centers.',
      },
      {
        id: 'es-golf',
        title: 'Costa del Sol & Costa Blanca Championship Golf',
        category: 'Outdoor & Nature',
        description: 'Over 70 world-ranked courses earn Andalusia the title of "Costa del Golf," hosting vibrant senior amateur leagues throughout the mild winter.',
        popularLocations: 'Marbella, Estepona, Sotogrande, Benidorm, Murcia',
        intensity: 'Moderate Activity',
        whyRetireesLoveIt: '320+ days of sun, sea-breeze fairways, and English-speaking leagues with fellow European and North American retirees.',
      },
      {
        id: 'es-culture',
        title: 'Flamenco Academies & Art Museum Exploration',
        category: 'Culture & Arts',
        description: 'Attending intimate peña flamenco performances, joining Spanish guitar workshops, and holding senior museum passes to the Prado, Reina Sofia, and Picasso museums.',
        popularLocations: 'Seville, Granada, Madrid, Malaga',
        intensity: 'Gentle & Relaxed',
        whyRetireesLoveIt: 'Rich cultural depth at discounted senior admission rates (€0 to €4).',
      },
      {
        id: 'es-sailing',
        title: 'Balearic & Mediterranean Coastal Sailing',
        category: 'Outdoor & Nature',
        description: 'Club Náutico memberships, gentle dinghy sailing, and weekend catamaran trips across the turquoise waters of Mallorca, Menorca, and the Costa Brava.',
        popularLocations: 'Palma de Mallorca, Denia, Altea, Sitges',
        intensity: 'Moderate Activity',
        whyRetireesLoveIt: 'Calm summer waters, modern marinas, and thriving expat yachting associations.',
      },
      {
        id: 'es-hiking',
        title: 'Camino de Santiago & Sierra Nevada Nature Walks',
        category: 'Outdoor & Nature',
        description: 'Hiking parts of the Camino Francés or Camino del Norte, with tranquil mountain trails in the Picos de Europa and alpujarras of Andalusia.',
        popularLocations: 'Galicia, Granada Alpujarras, Costa Brava Camí de Ronda',
        intensity: 'Active Exploration',
        whyRetireesLoveIt: 'Glorious topography, abundant fresh mountain air, and scenic village inns (paradores).',
      },
      {
        id: 'es-language',
        title: 'Senior University & Castilian Language Immersion',
        category: 'Volunteering & Learning',
        description: 'Universities throughout Spain offer "Aulas de Mayores" (university courses for seniors) alongside conversational exchanges (intercambios) in neighborhood bars.',
        popularLocations: 'Salamanca, Valencia, Alicante, Madrid, Malaga',
        intensity: 'Gentle & Relaxed',
        whyRetireesLoveIt: 'Stimulating academic environment, rapid Spanish fluency, and deep integration with locals.',
      },
    ],
    domesticTransit: {
      publicTransitScore: 93,
      trainNetwork: 'Renfe AVE and low-cost high-speed operators (Ouigo, Iryo, Avlo) provide Europe’s largest high-speed rail network (Madrid to Barcelona in 2.5h; Madrid to Valencia in 1h 40m). Senior Tarjeta Dorada offers up to 40% off.',
      intercityBuses: 'ALSA and Avanza operate luxury coaches with Wi-Fi, reclining seats, and frequent schedules to mountain pueblos and coastal villages.',
      carRentalAndRoads: 'First-rate Autovías (mostly toll-free) and Autopistas. Spanish drivers are generally disciplined and respectful of pedestrian crossings.',
      rideHailingAndTaxis: ['Cabify', 'Uber', 'FreeNow', 'Radio Taxi'],
      domesticAirAndFerries: 'Iberia, Vueling, and Air Europa cover island routes; Trasmediterránea and Balearia operate comfortable car ferries to Ibiza, Mallorca, and the Canary Islands.',
    },
    couples: {
      safetyRating: 92,
      safetyVerdict: 'Very Safe',
      easeOfMovement: 'Effortless / Excellent Transit',
      excitementLevel: 'World-Class Scenic Variety',
      summary: 'Spain is an absolute paradise for retired couples. High-speed rail makes spontaneous weekend trips to historic cities effortless, while the cafe and plaza lifestyle provides romance and connection daily.',
      recommendedDestinations: ['Andalusia White Villages (Pueblos Blancos)', 'Mallorca Tramuntana Mountains', 'San Sebastián Gastronomy Corridor', 'Valencia Turia Gardens'],
      transportOptions: ['Renfe AVE Trains', 'ALSA Premium Buses', 'Scenic coastal highways'],
      safetyAdvice: [
        'Watch for bag snatchers and distraction scams on Barcelona’s Las Ramblas and Madrid’s Sol square.',
        'Use official taxi ranks or Cabify/Uber when arriving late at train terminals.',
      ],
      romanticEscapes: ['Parador de Granada inside the Alhambra complex', 'Vineyard boutique hotels in La Rioja', 'Coastal cliff retreats in Costa Brava'],
      scenicRoadTrips: ['Costa del Sol to Ronda mountain drive', 'Mallorca Sa Calobra winding route', 'Asturias and Picos de Europa mountain circuit'],
      coupleFriendlyVibe: 'Extremely welcoming culture where couples of all ages enjoy lively plazas and late-night dinners until midnight.',
    },
    solo: {
      safetyRating: 91,
      safetyVerdict: 'Very Safe',
      easeOfMovement: 'Effortless / Excellent Transit',
      excitementLevel: 'High Cultural Immersion',
      summary: 'Remarkably easy for solo retirees. Spaniards are talkative and sociable at bar counters. You can sit with a book or coffee for hours in any plaza without being rushed.',
      recommendedDestinations: ['Malaga', 'Alicante', 'Valencia', 'Seville'],
      transportOptions: ['Tarjeta Dorada senior train pass', 'City metro and tramways', 'Bicipalma/Valenbisi city bike shares'],
      safetyAdvice: [
        'Keep phones inside zipped bags rather than sitting openly on outdoor café tables.',
        'Carry a photocopy of your residency card or passport rather than original documents.',
      ],
      socialEaseRating: 92,
      solitaryDiningAndCafeCulture: 'Eating solo at a tapas bar counter (en la barra) is an art form in Spain—bartenders are friendly and chatty.',
      meetingOtherRetirees: 'U3A (University of the Third Age) chapters, InterNations Spain, American Club, and Hash House Harriers.',
      solitaryNavigationTips: ['Get the Renfe Cercanías and ALSA apps', 'Get a rechargeable city transport card (e.g. Suma in Valencia)'],
    },
    soloFemale: {
      safetyRating: 92,
      safetyVerdict: 'Very Safe',
      femaleSafetyScore: 92,
      streetHarassmentLevel: 'Very Rare / Respectful Culture',
      easeOfMovement: 'Effortless / Excellent Transit',
      excitementLevel: 'High Cultural Immersion',
      summary: 'Spain is one of the safest destinations worldwide for solo female travelers and retirees. Plazas remain bustling with families and elderly women walking dogs well past 11 PM.',
      culturalDressAndEtiquette: 'Stylish casual wear is standard. Bare beachwear should be reserved strictly for beaches and swimming pools.',
      nighttimeTransitAdvice: 'Metros and city buses operate late, are well-illuminated, and feel secure. Cabify and FreeNow offer GPS-tracked rides.',
      recommendedPrecautions: [
        'Be alert for pickpockets in crowded tourist zones and festive celebrations (e.g. Feria de Abril or Las Fallas).',
        'Save the alert app AlertCops (official Spanish Police app with English SOS button) on your smartphone.',
      ],
      femaleExpatCommunities: '"Spain Expat Women", "Costa del Sol Ladies Club", "Women in Valencia Expat Circle".',
      recommendedDestinations: ['Valencia', 'Malaga Historic Center', 'San Sebastián', 'Alicante Coastal Walk'],
      transportOptions: ['High-speed trains', 'Cabify & FreeNow', 'Clean well-lit city metro lines'],
      safetyAdvice: ['Always store valuables in anti-theft cross-body bags in crowded subways', 'Trust local advice from neighborhood pharmacists and shopkeepers'],
    },
  },
  thailand: {
    countryId: 'thailand',
    countryName: 'Thailand',
    activitiesHeadline: 'Thai massage & wellness retreats, culinary cooking schools, tropical island hopping, golf, and temple meditation',
    retireeActivities: [
      {
        id: 'th-wellness',
        title: 'Traditional Thai Massage & Longevity Spas',
        category: 'Wellness & Fitness',
        description: 'Enjoying regular 2-hour traditional Nuad Thai massages, herbal steam baths, and holistic acupuncture treatments for $8 to $15 per session.',
        popularLocations: 'Chiang Mai, Hua Hin, Koh Samui, Bangkok',
        intensity: 'Gentle & Relaxed',
        whyRetireesLoveIt: 'Relieves arthritis, promotes joint flexibility, and costs less than 15% of Western spa prices.',
      },
      {
        id: 'th-cooking',
        title: 'Mastering Royal Thai & Street Food Cooking',
        category: 'Food, Wine & Culinary',
        description: 'Morning market tours picking fresh lemongrass, galangal, and kaffir lime leaves, followed by hands-on culinary workshops preparing green curry and pad thai.',
        popularLocations: 'Chiang Mai, Phuket, Bangkok, Krabi',
        intensity: 'Gentle & Relaxed',
        whyRetireesLoveIt: 'Healthy, aromatic, vegetable-rich diet that transforms home cooking for a lifetime of clean eating.',
      },
      {
        id: 'th-golf',
        title: 'Tropical Fairways with Personal Caddies',
        category: 'Outdoor & Nature',
        description: 'Playing 18 holes at championship golf courses designed by Jack Nicklaus or Greg Norman, complete with mandatory personal caddies and clubhouse banquets.',
        popularLocations: 'Hua Hin (Banyan, Black Mountain), Pattaya, Phuket',
        intensity: 'Moderate Activity',
        whyRetireesLoveIt: 'Unparalleled luxury caddie service at reasonable green fees, with year-round tropical warmth.',
      },
      {
        id: 'th-meditation',
        title: 'Buddhist Temple Meditation & Mindful Living',
        category: 'Culture & Arts',
        description: 'Participating in Vipassana meditation retreats at forest monasteries (Wat) or attending mindful breathing sessions with English-speaking monks.',
        popularLocations: 'Wat Umong (Chiang Mai), Wat Suan Dok, Hua Hin, Koh Phangan',
        intensity: 'Gentle & Relaxed',
        whyRetireesLoveIt: 'Profound tranquility, mental clarity, and deep appreciation for Thailand’s Buddhist culture of kindness (metta).',
      },
      {
        id: 'th-islands',
        title: 'Andaman & Gulf Tropical Island Hopping',
        category: 'Outdoor & Nature',
        description: 'Snorkeling, sea canoeing in limestone karst bays, and taking longtail boats to remote sandy coves.',
        popularLocations: 'Phang Nga Bay, Koh Lanta, Koh Tao, Similan Islands',
        intensity: 'Active Exploration',
        whyRetireesLoveIt: 'Emerald waters, gentle warm seas, and tranquil beachside seafood dinners with feet in the sand.',
      },
      {
        id: 'th-volunteering',
        title: 'Ethical Elephant Sanctuaries & English Mentoring',
        category: 'Volunteering & Learning',
        description: 'Supporting ethical, no-riding elephant rescue habitats in northern hills or mentoring local students in conversational English.',
        popularLocations: 'Mae Rim (Chiang Mai), Chiang Rai, Hua Hin',
        intensity: 'Moderate Activity',
        whyRetireesLoveIt: 'Heartwarming interactions with majestic rescued animals and fulfilling bonds with local communities.',
      },
    ],
    domesticTransit: {
      publicTransitScore: 82,
      trainNetwork: 'State Railway of Thailand (SRT) operates modern sleeper trains (e.g., Bangkok to Chiang Mai with private first-class sleeper cabins) plus expanding regional lines.',
      intercityBuses: 'First-class VIP 24 buses (Nakhonchai Air, Sombat Tour) feature reclining massage seats, personal video screens, and steward service at budget rates.',
      carRentalAndRoads: 'Drives on the left. High quality multilane highways connecting provinces. Driving inside Bangkok is congested; driving in Hua Hin or Chiang Mai countryside is pleasant.',
      rideHailingAndTaxis: ['Grab', 'Bolt', 'InDrive', 'BTS Skytrain / MRT Subway (Bangkok)', 'Songthaew (shared red pickup trucks)'],
      domesticAirAndFerries: 'Superb domestic flight coverage (AirAsia, Bangkok Airways, Nok Air) with $30–$60 flights to every region; high-speed catamaran ferries (Lomprayah) serve Gulf islands.',
    },
    couples: {
      safetyRating: 88,
      safetyVerdict: 'Very Safe',
      easeOfMovement: 'Convenient & Accessible',
      excitementLevel: 'World-Class Scenic Variety',
      summary: 'Extraordinary value and luxury for retired couples. Private pool villas in Hua Hin or Phuket cost a fraction of Western rentals, and couples can indulge in five-star dining and tropical spa days every week.',
      recommendedDestinations: ['Hua Hin Royal Beach Resort', 'Chiang Mai Old City & Mae Rim', 'Koh Samui Bophut Fisherman’s Village', 'Krabi Ao Nang'],
      transportOptions: ['Grab car app', 'VIP 24 sleeper buses', 'Bangkok Airways boutique flights'],
      safetyAdvice: [
        'Avoid renting motorbikes/scooters unless you hold an official motorcycle license with International Driving Permit and proper helmet.',
        'Drink bottled or filtered water and verify ice comes from commercial tubular ice factories.',
      ],
      romanticEscapes: ['Sunset dinner cruise on Phang Nga Bay', 'Private jungle pool villa overlooking Chiang Mai rice terraces', 'Beachfront candlelit dining in Hua Hin'],
      scenicRoadTrips: ['Mae Hong Son 1,864-curve loop in northern hills', 'Coastal drive along the Royal Coast from Hua Hin to Prachuap Khiri Khan'],
      coupleFriendlyVibe: 'Extremely courteous and hospitable service with reverence for older couples and retirees.',
    },
    solo: {
      safetyRating: 87,
      safetyVerdict: 'Very Safe',
      easeOfMovement: 'Convenient & Accessible',
      excitementLevel: 'High Cultural Immersion',
      summary: 'One of the easiest countries in the world for solo living. Street food stalls and open-air food courts make solo dining fun, welcoming, and ultra-cheap ($2 meals). Expat clubs abound in Chiang Mai and Hua Hin.',
      recommendedDestinations: ['Chiang Mai Nimman & Old City', 'Hua Hin', 'Bangkok Sukhumvit', 'Phuket Rawai'],
      transportOptions: ['Grab / Bolt apps', 'BTS Skytrain & MRT (Bangkok)', 'Shared Songthaew trucks'],
      safetyAdvice: [
        'Beware of tuk-tuk drivers offering "free temple tours" that detour to gem stores or tailor shops.',
        'Always ensure meter is turned on in Bangkok street taxis (or just use Grab).',
      ],
      socialEaseRating: 94,
      solitaryDiningAndCafeCulture: 'Chiang Mai is the world capital of welcoming specialty coffee shops and open-air night markets where eating alone is celebrated.',
      meetingOtherRetirees: 'Chiang Mai Expats Club (CEC), Hua Hin Expat Society, Rotary Clubs, and gym/padel clubs.',
      solitaryNavigationTips: ['Buy a local AIS or TrueMove SIM card at the airport with unlimited 5G data', 'Download Grab, Bolt, and Google Translate'],
    },
    soloFemale: {
      safetyRating: 87,
      safetyVerdict: 'Very Safe',
      femaleSafetyScore: 88,
      streetHarassmentLevel: 'Virtually Non-Existent',
      easeOfMovement: 'Convenient & Accessible',
      excitementLevel: 'High Cultural Immersion',
      summary: 'Thailand has an exceptionally low rate of violent crime and street harassment due to Buddhist cultural values of gentleness and respect. Solo women travel freely on night trains and throughout resort towns.',
      culturalDressAndEtiquette: 'Cover shoulders and knees when visiting temples and government offices. Beachwear should be reserved strictly for beaches.',
      nighttimeTransitAdvice: 'SRT sleeper trains offer dedicated "Ladies Only" sleeper carriages with female attendants. Grab car rides are GPS tracked and cashless.',
      recommendedPrecautions: [
        'Watch your drink in late-night party hubs (e.g. Full Moon parties or tourist nightlife strips).',
        'Use reputable Grab rides rather than unmarked street motorbike taxis late at night.',
      ],
      femaleExpatCommunities: '"Women Living in Chiang Mai", "Bangkok Expats Women Network", "Thailand Solo Female Travelers".',
      recommendedDestinations: ['Chiang Mai Old City', 'Hua Hin', 'Koh Lanta', 'Chiang Rai'],
      transportOptions: ['Grab / Bolt car apps', 'SRT "Ladies Only" sleeper train cars', 'Bangkok Airways'],
      safetyAdvice: ['Stay hydrated and keep emergency tourist police number 1155 handy', 'Dress respectfully at spiritual and sacred sites'],
    },
  },
  'costa-rica': {
    countryId: 'costa-rica',
    countryName: 'Costa Rica',
    activitiesHeadline: 'Pura Vida rainforest hikes, birdwatching for quetzals, thermal hot springs, surfing, and organic coffee farming',
    retireeActivities: [
      {
        id: 'cr-nature',
        title: 'Cloud Forest & Rainforest Birdwatching',
        category: 'Outdoor & Nature',
        description: 'Spotting Resplendent Quetzals, toucans, and sloths on guided morning hikes through biological reserves with binoculars and expert naturalist guides.',
        popularLocations: 'Monteverde, San Gerardo de Dota, Manuel Antonio, Arenal',
        intensity: 'Moderate Activity',
        whyRetireesLoveIt: 'Incredible biodiversity (over 900 bird species), tranquil forest canopy walks, and cooler mountain microclimates.',
      },
      {
        id: 'cr-hotsprings',
        title: 'Thermal Mineral Hot Springs of Arenal',
        category: 'Wellness & Fitness',
        description: 'Soaking in volcanic mineral pools surrounded by lush orchids and heliconias at the base of the majestic Arenal Volcano.',
        popularLocations: 'La Fortuna, Tabacón, EcoTermales, Orosi Valley',
        intensity: 'Gentle & Relaxed',
        whyRetireesLoveIt: 'Natural relief for stiff muscles, therapeutic mineral waters, and serene rainforest backdrops.',
      },
      {
        id: 'cr-coffee',
        title: 'Highland Specialty Coffee Cupping',
        category: 'Food, Wine & Culinary',
        description: 'Visiting family-run organic coffee fincas in the Central Valley, learning artisanal roasting methods, and tasting single-origin Tarrazú beans.',
        popularLocations: 'Tarrazú, Naranjo, Heredia, Atenas',
        intensity: 'Gentle & Relaxed',
        whyRetireesLoveIt: 'World-class coffee freshness right at the farm gate, rich farm-to-table culinary heritage, and crisp mountain air.',
      },
      {
        id: 'cr-conservation',
        title: 'Sea Turtle Nesting & Wildlife Conservation',
        category: 'Volunteering & Learning',
        description: 'Patrolling Pacific and Caribbean beaches to safeguard olive ridley and leatherback turtle hatchlings alongside university marine biologists.',
        popularLocations: 'Ostional, Tortuguero, Playa Grande, Osa Peninsula',
        intensity: 'Moderate Activity',
        whyRetireesLoveIt: 'Unforgettable emotional connection with endangered wildlife and deep contribution to local conservation.',
      },
      {
        id: 'cr-beaches',
        title: 'Pacific Sunset Beach Walks & Gentle Swimming',
        category: 'Outdoor & Nature',
        description: 'Strolling long golden-sand beaches at low tide, watching Pacific sunsets, and enjoying calm swimming in sheltered bays.',
        popularLocations: 'Playa Samara, Tamarindo, Hermosa, Las Terrazas',
        intensity: 'Gentle & Relaxed',
        whyRetireesLoveIt: 'Warm ocean water year-round, uncrowded sands, and the quintessential laid-back "Pura Vida" rhythm.',
      },
      {
        id: 'cr-community',
        title: 'Farmers Markets (Ferias) & Artisan Crafts',
        category: 'Social & Clubs',
        description: 'Weekly Friday/Saturday ferias buying fresh papayas, mangoes, artisan cheeses, and meeting fellow expat and Tico neighbors.',
        popularLocations: 'San Ramón, Atenas, Escazú, Grecia',
        intensity: 'Gentle & Relaxed',
        whyRetireesLoveIt: 'Organic produce at pennies on the dollar, lively Latin music, and a warm sense of neighborhood community.',
      },
    ],
    domesticTransit: {
      publicTransitScore: 74,
      trainNetwork: 'Limited suburban commuter trains link San José with Heredia, Belén, and Cartago; long-distance intercity travel relies primarily on buses and shuttles.',
      intercityBuses: 'Extensive public bus network (Empresa Alfaro, Tracopa, Musoc) covers all cantons affordably; shared tourist vans (Interbus, Gray Line) offer door-to-door hotel transfers.',
      carRentalAndRoads: 'Scenic mountain roads with winding topography; 4WD (4x4) vehicles are recommended for accessing unpaved beach communities (Montezuma, Santa Teresa, rural Osa).',
      rideHailingAndTaxis: ['Uber (widely available in Central Valley & tourist centers)', 'Official Red Taxis (with yellow triangle on door)', 'Local collective shuttles'],
      domesticAirAndFerries: 'Sansa Airlines operates quick 20- to 45-minute turboprop flights from San José (SJO) to regional airstrips; modern car ferries cross the Gulf of Nicoya (Puntarenas to Paquera).',
    },
    couples: {
      safetyRating: 86,
      safetyVerdict: 'Very Safe',
      easeOfMovement: 'Convenient & Accessible',
      excitementLevel: 'World-Class Scenic Variety',
      summary: 'Costa Rica is legendary for eco-luxury romantic getaways. Couples can rent a home in Atenas or Escazú and take easy 2-hour weekend drives to either the Pacific beaches or mountain cloud forests.',
      recommendedDestinations: ['Atenas & Central Valley Hills', 'Arenal & Tabacón Hot Springs', 'Playa Samara & Nicoya Peninsula', 'Manuel Antonio Coastal Bluffs'],
      transportOptions: ['Private 4WD SUV rental', 'Interbus shared air-conditioned shuttles', 'Sansa domestic hops'],
      safetyAdvice: [
        'Never leave bags, cameras, or valuables unattended in rental cars at national park trailheads or beach parking.',
        'Avoid driving on remote mountain roads during heavy rainy season downpours after dark.',
      ],
      romanticEscapes: ['Eco-lodge bungalow with private plunge pool overlooking Arenal Volcano', 'Sunset catamaran cruise in Guanacaste with dolphin sightings', 'Boutique coffee estate stays in the Orosi Valley'],
      scenicRoadTrips: ['Lake Arenal scenic loop through lush rainforest', 'Pan-American Highway south over the Cerro de la Muerte cloud forest'],
      coupleFriendlyVibe: 'Extremely welcoming "Pura Vida" mindset where local Ticos greet couples with kindness and peace.',
    },
    solo: {
      safetyRating: 85,
      safetyVerdict: 'Very Safe',
      easeOfMovement: 'Convenient & Accessible',
      excitementLevel: 'High Cultural Immersion',
      summary: 'Very approachable for solo retirees. The massive English-speaking expat community in the Central Valley and Guanacaste ensures immediate social circles, hiking groups, and library clubs.',
      recommendedDestinations: ['Atenas', 'Grecia', 'Escazú', 'Playa Samara'],
      transportOptions: ['Uber in Central Valley', 'Interbus tourist shuttles', 'Domestic Sansa flights'],
      safetyAdvice: [
        'Be alert around bus stations in downtown San José (Coca-Cola bus terminal); take an Uber directly to your hotel door.',
        'Keep emergency contacts and health insurance card saved offline.',
      ],
      socialEaseRating: 89,
      solitaryDiningAndCafeCulture: 'Eating at local "sodas" (traditional open-air diners) enjoying a $5 casado meal is friendly and conversational.',
      meetingOtherRetirees: 'Club de Leones, Birding Club of Costa Rica, InterNations San José, and active regional Facebook expat associations.',
      solitaryNavigationTips: ['Use Waze—it is the universal navigation app in Costa Rica with real-time hazard alerts', 'Get a Kolbi or Claro local SIM card'],
    },
    soloFemale: {
      safetyRating: 85,
      safetyVerdict: 'Very Safe',
      femaleSafetyScore: 86,
      streetHarassmentLevel: 'Occasional Catcalling in Tourist Hubs',
      easeOfMovement: 'Convenient & Accessible',
      excitementLevel: 'High Cultural Immersion',
      summary: 'Costa Rica has abolished its military since 1948 and has one of Latin America’s most stable democratic societies. Solo female retirees find it peaceful, progressive, and easy to navigate.',
      culturalDressAndEtiquette: 'Comfortable outdoor activewear is the norm. In downtown San José, standard city casual is customary.',
      nighttimeTransitAdvice: 'Use Uber or registered official red taxis called by your restaurant or hotel rather than hailing unmarked vehicles off the street at night.',
      recommendedPrecautions: [
        'Avoid unlit, isolated stretches of beach after dark.',
        'Heed ocean rip current warning flags—swim at beaches with lifeguards or in calm bays like Samara.',
      ],
      femaleExpatCommunities: '"Costa Rica Women Expats", "Gals of Guanacaste", "Solo Women Traveling Costa Rica".',
      recommendedDestinations: ['Atenas', 'Samara', 'Grecia', 'La Fortuna'],
      transportOptions: ['Interbus door-to-door shuttles', 'Uber in Central Valley', 'Sansa airlines'],
      safetyAdvice: ['Always swim in calm, protected bays or ask locals about current conditions', 'Save emergency number 911 on speed dial'],
    },
  },
  mexico: {
    countryId: 'mexico',
    countryName: 'Mexico',
    activitiesHeadline: 'Colonial art festivals, vibrant mariachi plazas, ancient Mayan ruins, world-class golf, and authentic gastronomy',
    retireeActivities: [
      {
        id: 'mx-art',
        title: 'Colonial Architecture & Art Galleries in San Miguel',
        category: 'Culture & Arts',
        description: 'Browsing artisanal weaving workshops, world-class painting studios at the Instituto Allende, and rooftop sunset cocktail hours overlooking neo-Gothic spires.',
        popularLocations: 'San Miguel de Allende, Oaxaca City, Guanajuato, Merida',
        intensity: 'Gentle & Relaxed',
        whyRetireesLoveIt: 'Rich creative intellectual community, endless exhibitions, chamber music festivals, and picturesque cobblestone streets.',
      },
      {
        id: 'mx-food',
        title: 'Regional Gastronomy & Mole Tasting',
        category: 'Food, Wine & Culinary',
        description: 'Tasting seven varieties of Oaxacan mole, fresh seafood ceviches along the Riviera Nayarit, and attending gourmet Mexican cooking masterclasses.',
        popularLocations: 'Oaxaca, Puerto Vallarta, Ensenada (Baja Wine Country), Puebla',
        intensity: 'Gentle & Relaxed',
        whyRetireesLoveIt: 'UNESCO-recognized culinary heritage, farm-fresh ingredients at local tianguis markets, and warm culinary hospitality.',
      },
      {
        id: 'mx-lake',
        title: 'Lake Chapala Expat Clubs & Lakeside Strolls',
        category: 'Social & Clubs',
        description: 'Home to the largest North American retiree community abroad. Daily activities include gardening clubs, pickleball leagues, live theater, and lakeside boardwalk walks.',
        popularLocations: 'Ajijic, Chapala, San Antonio Tlayacapan',
        intensity: 'Gentle & Relaxed',
        whyRetireesLoveIt: 'Sublime year-round spring weather (75°F/24°C), instant English-speaking social circle, and hundreds of volunteer opportunities.',
      },
      {
        id: 'mx-mayan',
        title: 'Archaeological Exploration & Cenote Swimming',
        category: 'Outdoor & Nature',
        description: 'Exploring ancient Mayan pyramid complexes (Uxmal, Chichen Itza, Palenque) and swimming in crystalline limestone sinkhole cenotes.',
        popularLocations: 'Yucatan Peninsula, Merida, Palenque, Riviera Maya',
        intensity: 'Active Exploration',
        whyRetireesLoveIt: 'Awe-inspiring ancient history, refreshing natural freshwater pools, and immaculate ecological reserves.',
      },
      {
        id: 'mx-golf',
        title: 'Oceanfront Golf along Cabo & Puerto Vallarta',
        category: 'Outdoor & Nature',
        description: 'Teeing off on cliffside Pacific courses with views of breaching humpback whales, followed by clubhouse seafood luncheons.',
        popularLocations: 'Los Cabos, Punta Mita, Puerto Vallarta, Mazatlan',
        intensity: 'Moderate Activity',
        whyRetireesLoveIt: 'Pristine world-tier courses, warm winter temperatures, and lively expat leagues.',
      },
      {
        id: 'mx-volunteering',
        title: 'Bilingual Education & Indigenous Weaving Cooperatives',
        category: 'Volunteering & Learning',
        description: 'Volunteering with local children’s libraries, dog rescue shelters, or supporting indigenous women’s embroidery cooperatives.',
        popularLocations: 'San Miguel de Allende, Oaxaca, Ajijic, Merida',
        intensity: 'Moderate Activity',
        whyRetireesLoveIt: 'Deeply rewarding community bonds, profound cultural respect, and rapid improvement of conversational Spanish.',
      },
    ],
    domesticTransit: {
      publicTransitScore: 84,
      trainNetwork: 'The new Tren Maya connects Cancun, Merida, Campeche, and Palenque with modern air-conditioned trains; the scenic Chepe train winds through Copper Canyon; urban metros serve CDMX, Guadalajara, and Monterrey.',
      intercityBuses: 'Superb first-class luxury coach networks (ETN, Primera Plus, ADO Platino) featuring individual entertainment screens, wide reclining leather seats, clean onboard restrooms, and complimentary snacks.',
      carRentalAndRoads: 'Modern toll highways (Cuota roads) are fast, well-maintained, and patrolled by the Green Angels (Ángeles Verdes) free roadside assistance team. Avoid driving libre (free) rural backroads after dark.',
      rideHailingAndTaxis: ['Uber (extensively used in all major cities)', 'Didi', 'Cabify', 'Authorized Airport Sitio Taxis'],
      domesticAirAndFerries: 'Volaris, VivaAerobus, and Aeromexico provide dense, ultra-low-cost domestic routes connecting regional cities in 1–2 hours for $40–$90.',
    },
    couples: {
      safetyRating: 84,
      safetyVerdict: 'Very Safe',
      easeOfMovement: 'Convenient & Accessible',
      excitementLevel: 'World-Class Scenic Variety',
      summary: 'Mexico offers retired couples an unmatched lifestyle richness. Major retirement enclaves like Lake Chapala, San Miguel de Allende, Merida, and Puerto Vallarta are exceptionally safe, vibrant, and culturally rich.',
      recommendedDestinations: ['Ajijic (Lake Chapala)', 'San Miguel de Allende', 'Merida & Yucatan Coast', 'Puerto Vallarta Old Town'],
      transportOptions: ['ETN/Primera Plus luxury coaches', 'Cuota toll highways', 'Uber & Didi in cities'],
      safetyAdvice: [
        'Stick to toll (Cuota) highways when taking road trips and travel during daytime hours.',
        'Use authorized airport "Sitio" taxi booths or app-based pickups upon arrival.',
      ],
      romanticEscapes: ['Hacienda boutique hotel stays in Yucatan', 'Rooftop dining overlooking the Parroquia in San Miguel', 'Sunset sailing in Banderas Bay with whale watching'],
      scenicRoadTrips: ['Baja California Pacific to Sea of Cortez transpeninsular route', 'Yucatan historic convent and hacienda route around Merida'],
      coupleFriendlyVibe: 'Warm, familial, and joyous culture where local shopkeepers and neighbors treat couples with gracious cordiality.',
    },
    solo: {
      safetyRating: 83,
      safetyVerdict: 'Very Safe',
      easeOfMovement: 'Convenient & Accessible',
      excitementLevel: 'High Cultural Immersion',
      summary: 'With over 1.5 million North American expats, solo retirees find immediate camaraderie in established expat hubs like Lake Chapala, San Miguel, and Puerto Vallarta.',
      recommendedDestinations: ['Ajijic (Lake Chapala)', 'San Miguel de Allende', 'Merida', 'Puerto Escondido'],
      transportOptions: ['ETN / ADO luxury bus networks', 'Uber & Didi', 'Tren Maya in the Yucatan'],
      safetyAdvice: [
        'Withdraw cash from ATMs located inside bank branches or shopping malls rather than isolated street corners.',
        'Stay in central, walkable historic districts where streets remain illuminated and lively.',
      ],
      socialEaseRating: 93,
      solitaryDiningAndCafeCulture: 'Sitting alone at coffee shops or casual taquerias is vibrant and social; Mexicans are warm and quick to strike up friendly conversations.',
      meetingOtherRetirees: 'Lake Chapala Society (LCS), San Miguel Expat Groups, InterNations Mexico, and active pickleball and bridge clubs.',
      solitaryNavigationTips: ['Download the ADO Móvil and ETN apps for express bus tickets', 'Set up Uber and Didi on your phone'],
    },
    soloFemale: {
      safetyRating: 82,
      safetyVerdict: 'Very Safe',
      femaleSafetyScore: 83,
      streetHarassmentLevel: 'Occasional Catcalling in Tourist Hubs',
      easeOfMovement: 'Convenient & Accessible',
      excitementLevel: 'High Cultural Immersion',
      summary: 'Tens of thousands of solo female expats and retirees live happily and securely across Mexico. Cities like Merida consistently rank among the safest cities in the entire Americas.',
      culturalDressAndEtiquette: 'Colonial highland towns favor smart casual dress; resort beach towns are casual. Direct polite confidence commands great respect.',
      nighttimeTransitAdvice: 'Always take Uber, Didi, or radio-dispatched taxis after dark rather than hailing street cabs.',
      recommendedPrecautions: [
        'Avoid desolate neighborhoods or unlit side streets late at night.',
        'Choose accommodations in safe central neighborhoods (e.g. Centro Historico in Merida, Colonia San Antonio in San Miguel, Zona Romántica in Vallarta).',
      ],
      femaleExpatCommunities: '"Women of Lake Chapala", "San Miguel Ladies Expat Network", "Expats Women in Merida".',
      recommendedDestinations: ['Merida', 'San Miguel de Allende', 'Ajijic', 'Puerto Vallarta'],
      transportOptions: ['Uber & Didi with GPS route sharing', 'First-class luxury buses (ETN/ADO)', 'Tren Maya'],
      safetyAdvice: ['Use app-based transport for guaranteed fares and GPS tracking', 'Join local female expat groups for trusted local service recommendations'],
    },
  },
};

/**
 * Intelligent generator function providing rich, authentic, tailored Travel,
 * Activities & Domestic Mobility data for all 100 countries in the database.
 */
export function getCountryTravelMobility(country: Country): CountryTravelMobility {
  // Check if a fully bespoke profile exists
  const existing = BESPOKE_TRAVEL_MOBILITY[country.id];

  const safety = country.lifestyle.safetyScore;
  const walkability = country.lifestyle.walkabilityScore;
  const region = country.region;
  const cities = country.topCities.map(c => c.name);
  const primaryCity = cities[0] || country.capital;
  const secondaryCity = cities[1] || 'the coastal and countryside towns';

  // Base verdict
  let safetyVerdict: 'Exceptionally Safe' | 'Very Safe' | 'Moderately Safe - Standard Awareness' | 'Caution Required' = 'Very Safe';
  if (safety >= 88) safetyVerdict = 'Exceptionally Safe';
  else if (safety >= 75) safetyVerdict = 'Very Safe';
  else if (safety >= 60) safetyVerdict = 'Moderately Safe - Standard Awareness';
  else safetyVerdict = 'Caution Required';

  // Female safety score calibrated by lifestyle safety score
  const femaleSafetyScore = Math.min(99, Math.max(50, Math.round(safety * 0.98 + (region === 'Europe' ? 2 : 0))));

  // Street harassment assessment
  let streetHarassment: 'Virtually Non-Existent' | 'Very Rare / Respectful Culture' | 'Occasional Catcalling in Tourist Hubs' | 'Moderate / Heightened Vigilance Needed' = 'Very Rare / Respectful Culture';
  if (femaleSafetyScore >= 90) streetHarassment = 'Virtually Non-Existent';
  else if (femaleSafetyScore >= 78) streetHarassment = 'Very Rare / Respectful Culture';
  else if (femaleSafetyScore >= 65) streetHarassment = 'Occasional Catcalling in Tourist Hubs';
  else streetHarassment = 'Moderate / Heightened Vigilance Needed';

  // Transit apps by region
  let rideHailing = ['Uber', 'Local Metered Taxis'];
  if (region === 'Europe') {
    rideHailing = ['Bolt', 'Uber', 'FreeNow', 'Local Radio Taxis'];
  } else if (region === 'Southeast Asia') {
    rideHailing = ['Grab', 'Bolt', 'InDrive', 'Local Metered Taxis'];
  } else if (region === 'Americas') {
    rideHailing = ['Uber', 'Cabify', 'Didi', 'Official Radio Taxis'];
  }

  // Synthesize rich bespoke activities tailored to country characteristics
  const defaultActivities: RetireeActivity[] = [
    {
      id: `${country.id}-nature-walks`,
      title: `Scenic Trails, National Parks & Coastal Walks`,
      category: 'Outdoor & Nature',
      description: `Retirees in ${country.name} spend sunny mornings exploring scenic nature reserves, botanical gardens, and gentle coastal or highland pathways around ${primaryCity} and ${secondaryCity}.`,
      popularLocations: `${primaryCity}, ${secondaryCity}, Regional Nature Reserves`,
      intensity: 'Moderate Activity',
      whyRetireesLoveIt: `Year-round access to fresh air, dramatic landscape diversity, and well-maintained scenic trails with pleasant resting spots.`,
    },
    {
      id: `${country.id}-culinary`,
      title: `Local Farmers Markets & Traditional Cooking`,
      category: 'Food, Wine & Culinary',
      description: `Browsing vibrant open-air markets for fresh seasonal produce, regional cheeses, seafood, and attending informal cooking workshops to master traditional ${country.name} specialties.`,
      popularLocations: `${primaryCity} Central Market, Historic Neighborhood Plazas`,
      intensity: 'Gentle & Relaxed',
      whyRetireesLoveIt: `Exceptional culinary quality at fraction of Western prices, healthy farm-to-table dining, and warm interactions with local vendors.`,
    },
    {
      id: `${country.id}-social-clubs`,
      title: `Expat Meetups, Bridge Leagues & Coffee Circles`,
      category: 'Social & Clubs',
      description: `Participating in regular expat coffee mornings, walking groups, book discussions, and social leagues organized across international communities in ${country.name}.`,
      popularLocations: `${primaryCity}, ${secondaryCity}`,
      intensity: 'Gentle & Relaxed',
      whyRetireesLoveIt: `Quickly builds an active circle of friends and eliminates feelings of isolation through welcoming peer connections.`,
    },
    {
      id: `${country.id}-culture-arts`,
      title: `Historic Heritage & Cultural Festivals`,
      category: 'Culture & Arts',
      description: `Visiting ancient fortresses, art galleries, classical music performances, and participating in seasonal village festivals celebrating regional heritage.`,
      popularLocations: `${country.capital}, Historic UNESCO Quarters`,
      intensity: 'Gentle & Relaxed',
      whyRetireesLoveIt: `Deep cultural immersion, discounted senior entrance passes, and rich historical pride throughout local communities.`,
    },
    {
      id: `${country.id}-wellness`,
      title: `Thermal Spas, Yoga & Gentle Recreation`,
      category: 'Wellness & Fitness',
      description: `Enjoying therapeutic mineral baths, seaside morning yoga, golf courses, and accessible wellness centers geared toward senior vitality.`,
      popularLocations: `${secondaryCity}, Coastal & Mountain Retreats`,
      intensity: 'Moderate Activity',
      whyRetireesLoveIt: `Affordable wellness treatments, soothing climate for joint health, and a relaxed, unhurried pace of daily life.`,
    },
    {
      id: `${country.id}-volunteering`,
      title: `Language Immersion & Community Volunteering`,
      category: 'Volunteering & Learning',
      description: `Taking conversational ${country.language.split(' ')[0]} lessons and giving back by assisting animal rescue shelters, student mentorship programs, or environmental clean-ups.`,
      popularLocations: `${primaryCity}, Local Community Centers`,
      intensity: 'Moderate Activity',
      whyRetireesLoveIt: `Provides meaningful purpose in retirement, earns reciprocal warmth from locals, and speeds up everyday integration.`,
    },
  ];

  const activitiesHeadline = existing?.activitiesHeadline ||
    `Pristine nature hikes, vibrant local market shopping, rich cultural heritage, and warm expat community gatherings`;

  const domesticTransit = {
    publicTransitScore: existing?.domesticTransit?.publicTransitScore || Math.min(95, Math.max(65, Math.round(walkability * 0.95))),
    trainNetwork: existing?.domesticTransit?.trainNetwork || (
      region === 'Europe'
        ? `Comprehensive national rail network connecting ${primaryCity} and ${secondaryCity} with comfortable regional and express trains (senior discounts generally available).`
        : region === 'Southeast Asia'
        ? `Regional rail connects major provincial hubs, supplemented by modern mass transit systems (MRT/Skytrain) in urban capitals.`
        : `Intercity rail is focused on key scenic corridors; comfortable regional shuttle networks connect key retirement hubs.`
    ),
    intercityBuses: existing?.domesticTransit?.intercityBuses || `Frequent modern air-conditioned express buses operate reliable schedules between all major towns and rural provinces at budget-friendly fares.`,
    carRentalAndRoads: existing?.domesticTransit?.carRentalAndRoads || (
      region === 'Europe'
        ? `Roads are well-maintained with clear signage. Driving is scenic and relaxed outside heavy rush-hour city cores.`
        : `Highways connecting primary cities are paved and multi-lane; scenic countryside drives are best undertaken during daytime hours.`
    ),
    rideHailingAndTaxis: existing?.domesticTransit?.rideHailingAndTaxis || rideHailing,
    domesticAirAndFerries: existing?.domesticTransit?.domesticAirAndFerries || `Affordable regional flights and ferry lines easily connect outer regions, islands, and neighboring destinations.`,
  };

  const couples = {
    safetyRating: existing?.couples?.safetyRating || safety,
    safetyVerdict: existing?.couples?.safetyVerdict || safetyVerdict,
    easeOfMovement: existing?.couples?.easeOfMovement || (walkability > 80 ? 'Effortless / Excellent Transit' : 'Convenient & Accessible'),
    excitementLevel: existing?.couples?.excitementLevel || 'World-Class Scenic Variety',
    summary: existing?.couples?.summary || `Traveling as a retired couple in ${country.name} is peaceful, romantic, and simple. Couples can leisurely explore historic town centers, dine outdoors at intimate local bistros, and enjoy day excursions without safety anxieties.`,
    recommendedDestinations: existing?.couples?.recommendedDestinations || [primaryCity, secondaryCity, `Historic coastal and mountain villages`],
    transportOptions: existing?.couples?.transportOptions || [`Regional Express Trains & Buses`, `Scenic Rental Car Excursions`, rideHailing[0]],
    safetyAdvice: existing?.couples?.safetyAdvice || [
      `Keep personal belongings secure in busy tourist plazas and transport stations.`,
      `Carry digital photocopies of your passports and travel insurance documentation.`,
    ],
    romanticEscapes: existing?.couples?.romanticEscapes || [
      `Sunset dining at scenic viewpoint terraces overlooking the water or old quarter`,
      `Weekend stays at boutique heritage country inns or coastal villas`,
      `Private wine tastings and vineyard tours in surrounding hills`,
    ],
    scenicRoadTrips: existing?.couples?.scenicRoadTrips || [
      `Panoramic coastal route connecting ${primaryCity} to nearby beach towns`,
      `Countryside loop through historic villages and agricultural valleys`,
    ],
    coupleFriendlyVibe: existing?.couples?.coupleFriendlyVibe || `Welcoming and family-oriented culture that treats mature couples with high respect and courteous hospitality.`,
  };

  const solo = {
    safetyRating: existing?.solo?.safetyRating || Math.max(60, safety - 2),
    safetyVerdict: existing?.solo?.safetyVerdict || safetyVerdict,
    easeOfMovement: existing?.solo?.easeOfMovement || (walkability > 75 ? 'Convenient & Accessible' : 'Moderate / Regional Nuances'),
    excitementLevel: existing?.solo?.excitementLevel || 'High Cultural Immersion',
    summary: existing?.solo?.summary || `Solo retirees find ${country.name} accessible and straightforward to navigate. Cafés and public squares invite relaxed solo reading and dining, while active expat clubs make finding companionship natural and unforced.`,
    recommendedDestinations: existing?.solo?.recommendedDestinations || [primaryCity, secondaryCity, `Central Walkable Districts`],
    transportOptions: existing?.solo?.transportOptions || [`Public Metro & Tram Networks`, `Intercity Express Buses`, rideHailing[0]],
    safetyAdvice: existing?.solo?.safetyAdvice || [
      `Avoid poorly illuminated side alleys late at night; prefer well-traveled main avenues.`,
      `Save local emergency numbers and your accommodation's address card in your phone.`,
    ],
    socialEaseRating: existing?.solo?.socialEaseRating || Math.min(95, Math.max(70, walkability + 5)),
    solitaryDiningAndCafeCulture: existing?.solo?.solitaryDiningAndCafeCulture || `Solo dining in cafes, bistros, and open plazas is completely standard and comfortable, with friendly staff and a relaxed pace.`,
    meetingOtherRetirees: existing?.solo?.meetingOtherRetirees || `Active international expat meetups, walking groups, cultural society lectures, and language exchange evenings.`,
    solitaryNavigationTips: existing?.solo?.solitaryNavigationTips || [
      `Download offline maps (Google Maps / Maps.me) before traveling to rural regions.`,
      `Get a local prepaid SIM card with 5G data for instant ride-hailing and translation.`,
    ],
  };

  const soloFemale = {
    safetyRating: existing?.soloFemale?.safetyRating || femaleSafetyScore,
    safetyVerdict: existing?.soloFemale?.safetyVerdict || (femaleSafetyScore >= 85 ? 'Very Safe' : 'Moderately Safe - Standard Awareness'),
    femaleSafetyScore: existing?.soloFemale?.femaleSafetyScore || femaleSafetyScore,
    streetHarassmentLevel: existing?.soloFemale?.streetHarassmentLevel || streetHarassment,
    easeOfMovement: existing?.soloFemale?.easeOfMovement || (walkability > 80 ? 'Effortless / Excellent Transit' : 'Convenient & Accessible'),
    excitementLevel: existing?.soloFemale?.excitementLevel || 'High Cultural Immersion',
    summary: existing?.soloFemale?.summary || `Solo female travelers and retirees in ${country.name} generally enjoy a secure, comfortable experience with low rates of violent crime. Everyday transit and town centers are welcoming when observing standard travel precautions.`,
    culturalDressAndEtiquette: existing?.soloFemale?.culturalDressAndEtiquette || `Smart-casual Western dress is widely embraced. Modest attire covering shoulders and knees is appreciated when touring historic religious sites.`,
    nighttimeTransitAdvice: existing?.soloFemale?.nighttimeTransitAdvice || `Opt for licensed app-based rides (${rideHailing.slice(0, 2).join(' or ')}) or hotel-dispatched taxis when returning late rather than walking alone down dark alleys.`,
    recommendedPrecautions: existing?.soloFemale?.recommendedPrecautions || [
      `Keep your mobile phone charged and share your travel itinerary with trusted friends or family.`,
      `Use hotel safes for original passport and credit cards; carry modest cash for daily excursions.`,
      `Trust your instincts and choose centrally located, well-reviewed accommodations.`,
    ],
    femaleExpatCommunities: existing?.soloFemale?.femaleExpatCommunities || `Local women's expat circles, "Women Traveling in ${country.name}" social groups, and international ladies clubs.`,
    recommendedDestinations: existing?.soloFemale?.recommendedDestinations || [primaryCity, secondaryCity, `Walkable Historic Quarters`],
    transportOptions: existing?.soloFemale?.transportOptions || [`App-based rides (${rideHailing[0]})`, `Daytime intercity trains and luxury coaches`, `Official radio taxis`],
    safetyAdvice: existing?.soloFemale?.safetyAdvice || [
      `Stay alert in busy markets where pickpocketing can occur.`,
      `Connect with established female expat groups for trustworthy local driver and service recommendations.`,
    ],
  };

  return {
    countryId: country.id,
    countryName: country.name,
    activitiesHeadline,
    retireeActivities: existing?.retireeActivities || defaultActivities,
    domesticTransit,
    couples,
    solo,
    soloFemale,
  };
}

/**
 * Calculates a holistic Travel & Leisure Index (0 - 100) for a retirement destination.
 * Synthesizes:
 * - Public & domestic transit infrastructure reliability (30%)
 * - Traveler mobility safety across couples, solo, and solo female retiree profiles (35%)
 * - Walkability & local neighborhood exploration ease (20%)
 * - Retiree activities richness, outdoor climate, and leisure variety (15%)
 */
export function getCountryTravelLeisureScore(country: Country): number {
  if (!country) return 75;
  const mobility = getCountryTravelMobility(country);

  const transitScore = mobility.domesticTransit?.publicTransitScore || Math.round(country.lifestyle.walkabilityScore * 0.95);
  const coupleSafety = mobility.couples?.safetyRating || country.lifestyle.safetyScore;
  const soloSafety = mobility.solo?.safetyRating || country.lifestyle.safetyScore;
  const soloFemaleSafety = mobility.soloFemale?.femaleSafetyScore || country.lifestyle.safetyScore;

  // Composite traveler safety and peace of mind
  const safetyComposite = (coupleSafety * 0.35 + soloSafety * 0.35 + soloFemaleSafety * 0.30);
  const walkability = country.lifestyle.walkabilityScore || 70;

  // Curated activity breadth bonus + sunny recreation climate bonus
  const activityCount = mobility.retireeActivities?.length || 6;
  const sunnyBonus = country.climate.annualSunnyDays > 240 ? 15 : 10;
  const leisureBonus = Math.min(100, (activityCount * 14) + sunnyBonus);

  const totalScore = Math.round(
    transitScore * 0.30 +
    safetyComposite * 0.35 +
    walkability * 0.20 +
    leisureBonus * 0.15
  );

  return Math.min(100, Math.max(0, totalScore));
}
