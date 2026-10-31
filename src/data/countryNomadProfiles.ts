import { Country } from '../types';
import { SHORT_TERM_VISA_DATABASE } from './shortTermVisas';

export interface CountryNomadProfile {
  countryId: string;
  countryName: string;
  hasCuratedData: boolean;
  monthlyNomadBurnUSD: number; // Turnkey 1-month stay + dedicated coworking + dining out
  furnishedShortTermRentUSD: number; // 1-month furnished apartment / turnkey coliving
  coworkingMonthlyUSD: number; // Dedicated desk or hotdesk coworking membership
  sixMonthRunwayUSD: number; // monthlyNomadBurnUSD * 6
  verifiedInternetMbps: number; // Median verified fixed broadband / 5G speeds
  internetReliability: 'Ultra-Fast Fiber' | 'High-Speed Reliable' | 'Moderate / Hotspot Backup Recommended' | 'Variable';
  coworkingDensity: 'World-Class Nomad Hub' | 'Abundant & Vibrant' | 'Growing Network' | 'Limited / Hotel Lounges';
  topNomadCities: string[]; // Key cities & creator enclaves
  remoteWorkVisaName: string; // Official DNV / remote work permit
  remoteWorkVisaIncomeUSD: number; // Monthly income threshold required
  remoteWorkVisaStay: string; // Stay duration & renewal terms
  remoteWorkVisaDetails: string;
  creatorVibe: string; // Summary of cafe culture, community events & creator scene
  cafeWorkCulture: 'Legendary Laptop Friendly' | 'Widely Welcomed' | 'Selective Coworking Spaces Preferred';
  powerAndBackupStability: 'Extremely Reliable (99.9%)' | 'Very Stable' | 'Occasional Outages (Generator Common)';
  travelMedicalInsuranceRecommendation: {
    provider: string;
    estimatedMonthlyUSD: number;
    highlight: string;
  };
}

/**
 * Curated deep nomad intelligence for premier global creator & remote hubs
 */
const CURATED_NOMAD_PROFILES: Record<string, Partial<CountryNomadProfile>> = {
  thailand: {
    hasCuratedData: true,
    monthlyNomadBurnUSD: 1150,
    furnishedShortTermRentUSD: 580,
    coworkingMonthlyUSD: 110,
    verifiedInternetMbps: 260,
    internetReliability: 'Ultra-Fast Fiber',
    coworkingDensity: 'World-Class Nomad Hub',
    topNomadCities: ['Chiang Mai (Nimman / Santitham)', 'Bangkok (Thonglor / Ari)', 'Phuket (Rawai / Bang Tao)', 'Koh Phangan'],
    remoteWorkVisaName: 'Destination Thailand Visa (DTV)',
    remoteWorkVisaIncomeUSD: 0, // Solvency 500k THB (~$14k deposit), no monthly income threshold
    remoteWorkVisaStay: '5-Year Multi-Entry (180 Days/Entry + 180 Days Extension)',
    remoteWorkVisaDetails: 'Groundbreaking 2024 visa for remote workers, digital nomads, freelancers, and cultural learners. Requires ~500,000 THB in liquid savings with zero monthly income mandate.',
    creatorVibe: 'Global digital nomad capital. Hundreds of laptop-friendly specialty cafes, 24/7 coworking hubs like Punspace & Yellow, ultra-fast 500Mbps fiber, and world-renowned meetup density.',
    cafeWorkCulture: 'Legendary Laptop Friendly',
    powerAndBackupStability: 'Very Stable',
    travelMedicalInsuranceRecommendation: {
      provider: 'SafetyWing Nomad Insurance (Essential)',
      estimatedMonthlyUSD: 45,
      highlight: 'Continuous rolling global medical coverage with motorbike & adventure sports riders',
    },
  },

  portugal: {
    hasCuratedData: true,
    monthlyNomadBurnUSD: 2200,
    furnishedShortTermRentUSD: 1350,
    coworkingMonthlyUSD: 160,
    verifiedInternetMbps: 220,
    internetReliability: 'Ultra-Fast Fiber',
    coworkingDensity: 'World-Class Nomad Hub',
    topNomadCities: ['Lisbon (Santos / Cais do Sodré)', 'Porto (Cedofeita / Bonfim)', 'Ericeira (Surf & Remote)', 'Madeira (Ponta do Sol Nomad Village)'],
    remoteWorkVisaName: 'D8 Digital Nomad Temporary Stay Visa',
    remoteWorkVisaIncomeUSD: 3560, // 4x Portuguese minimum wage (~€3,280/mo)
    remoteWorkVisaStay: '1 Year (Renewable) or 2-Year Residency Card',
    remoteWorkVisaDetails: 'Tailored for remote employees and contractors of foreign companies. Temporary 1-year permit avoids immediate tax lock-in; convertible to 5-year permanent residency pathway.',
    creatorVibe: 'Europe’s primary nomad crossroads. Massive international tech diaspora, coastal surf hubs, weekly English-language founder meetups, and dedicated digital nomad villages in Madeira.',
    cafeWorkCulture: 'Widely Welcomed',
    powerAndBackupStability: 'Extremely Reliable (99.9%)',
    travelMedicalInsuranceRecommendation: {
      provider: 'Genki Explorer / SafetyWing Complete',
      estimatedMonthlyUSD: 65,
      highlight: 'Schengen-compliant health certificate accepted for D8 consular filings',
    },
  },

  spain: {
    hasCuratedData: true,
    monthlyNomadBurnUSD: 2350,
    furnishedShortTermRentUSD: 1400,
    coworkingMonthlyUSD: 175,
    verifiedInternetMbps: 230,
    internetReliability: 'Ultra-Fast Fiber',
    coworkingDensity: 'World-Class Nomad Hub',
    topNomadCities: ['Barcelona (Poblenou / Gràcia)', 'Madrid (Malasaña / Chamberí)', 'Valencia (Ruzafa)', 'Málaga & Costa del Sol', 'Gran Canaria & Tenerife'],
    remoteWorkVisaName: 'Spain Digital Nomad Visa (Ley de Startups)',
    remoteWorkVisaIncomeUSD: 2875, // 200% Spanish minimum wage (~€2,646/mo)
    remoteWorkVisaStay: '1 Year (Consular) or 3-Year Resident Card (In-Country Application)',
    remoteWorkVisaDetails: 'Special expat tax regime (Beckham Law variant) capping personal income tax at 15% on income up to €600,000 for up to 5 consecutive tax years.',
    creatorVibe: 'Sun-drenched Mediterranean lifestyle paired with high-energy creator scenes, world-class high-speed rail network, and hundreds of top coworking chains like Aticco & Utopicus.',
    cafeWorkCulture: 'Widely Welcomed',
    powerAndBackupStability: 'Extremely Reliable (99.9%)',
    travelMedicalInsuranceRecommendation: {
      provider: 'Sanitas / Adeslas Nomad Inbound (Zero Copay)',
      estimatedMonthlyUSD: 70,
      highlight: 'Zero-deductible private policy meeting strict Spanish immigration criteria',
    },
  },

  greece: {
    hasCuratedData: true,
    monthlyNomadBurnUSD: 1850,
    furnishedShortTermRentUSD: 1050,
    coworkingMonthlyUSD: 140,
    verifiedInternetMbps: 145,
    internetReliability: 'High-Speed Reliable',
    coworkingDensity: 'Abundant & Vibrant',
    topNomadCities: ['Athens (Koukaki / Pangrati)', 'Chania & Heraklion (Crete)', 'Thessaloniki', 'Rhodes'],
    remoteWorkVisaName: 'Greece Digital Nomad Visa (Law 4825/2021)',
    remoteWorkVisaIncomeUSD: 3800, // €3,500/mo net + €700 spouse
    remoteWorkVisaStay: '1 Year (Consulate) + 2-Year Renewable Residence Permit',
    remoteWorkVisaDetails: 'Offers a 50% income tax deduction for digital nomads who commit to residing in Greece for at least 2 years, drastically cutting effective European tax burden.',
    creatorVibe: 'Unrivaled archaeological heritage and Aegean island beauty combined with a blossoming Athenian tech-nomad hub and island colivings open year-round.',
    cafeWorkCulture: 'Legendary Laptop Friendly',
    powerAndBackupStability: 'Very Stable',
    travelMedicalInsuranceRecommendation: {
      provider: 'SafetyWing Nomad Insurance',
      estimatedMonthlyUSD: 48,
      highlight: 'Complete Schengen medical evacuation and emergency inpatient care',
    },
  },

  uae: {
    hasCuratedData: true,
    monthlyNomadBurnUSD: 3450,
    furnishedShortTermRentUSD: 2200,
    coworkingMonthlyUSD: 250,
    verifiedInternetMbps: 290,
    internetReliability: 'Ultra-Fast Fiber',
    coworkingDensity: 'World-Class Nomad Hub',
    topNomadCities: ['Dubai (Marina / JLT / Downtown)', 'Abu Dhabi (Yas / Al Reem Island)'],
    remoteWorkVisaName: 'Dubai 1-Year Virtual Working Programme',
    remoteWorkVisaIncomeUSD: 3500, // $3,500/mo proven monthly salary
    remoteWorkVisaStay: '1 Year (Renewable Annually In-Country)',
    remoteWorkVisaDetails: 'Gives full access to UAE resident banking, Emirates ID, driver license conversion, and telecom contracts with zero percent (0%) personal income tax.',
    creatorVibe: 'The world’s most tax-advantaged ultra-modern creator hub. Futuristic skyline, luxury fitness facilities, round-the-clock safety, and hyper-connected global flights.',
    cafeWorkCulture: 'Widely Welcomed',
    powerAndBackupStability: 'Extremely Reliable (99.9%)',
    travelMedicalInsuranceRecommendation: {
      provider: 'Cigna Global / SafetyWing Nomad',
      estimatedMonthlyUSD: 85,
      highlight: 'Complies with mandatory Dubai Health Authority (DHA) residency requirements',
    },
  },

  indonesia: {
    hasCuratedData: true,
    monthlyNomadBurnUSD: 1350,
    furnishedShortTermRentUSD: 750,
    coworkingMonthlyUSD: 135,
    verifiedInternetMbps: 110,
    internetReliability: 'High-Speed Reliable',
    coworkingDensity: 'World-Class Nomad Hub',
    topNomadCities: ['Bali (Canggu / Pererenan)', 'Bali (Ubud / Sayan)', 'Bali (Uluwatu / Bingin)', 'Sanur', 'Jakarta'],
    remoteWorkVisaName: 'E33G Remote Worker Visa (KITAS)',
    remoteWorkVisaIncomeUSD: 5000, // $60,000/yr salary + employment contract
    remoteWorkVisaStay: '1 Year (Renewable) or B211A Visit Visa (Up to 180 Days)',
    remoteWorkVisaDetails: 'Official 1-year E33G Remote Worker permit exempts foreign-sourced salary from Indonesian domestic personal income taxes.',
    creatorVibe: 'Global epicenter of lifestyle entrepreneurs, wellness creators, and crypto builders. Iconic open-air bamboo coworkings like Tropical Nomad, Dojo, and Outpost with high-velocity community.',
    cafeWorkCulture: 'Legendary Laptop Friendly',
    powerAndBackupStability: 'Occasional Outages (Generator Common)',
    travelMedicalInsuranceRecommendation: {
      provider: 'SafetyWing Nomad Insurance with Scooter Add-On',
      estimatedMonthlyUSD: 45,
      highlight: 'Covers private BIMC and Siloam international hospital clinics in Bali',
    },
  },

  mexico: {
    hasCuratedData: true,
    monthlyNomadBurnUSD: 1650,
    furnishedShortTermRentUSD: 950,
    coworkingMonthlyUSD: 130,
    verifiedInternetMbps: 160,
    internetReliability: 'High-Speed Reliable',
    coworkingDensity: 'World-Class Nomad Hub',
    topNomadCities: ['Mexico City (Roma Norte / Condesa / Juárez)', 'Oaxaca City (Jalatlaco)', 'Playa del Carmen', 'Puerto Vallarta'],
    remoteWorkVisaName: 'Temporary Resident Remote Worker Permit',
    remoteWorkVisaIncomeUSD: 3300, // Solvency ~$3,300/mo income or $55,000 liquid savings
    remoteWorkVisaStay: '1 Year (Extendable up to 4 Years Total)',
    remoteWorkVisaDetails: '180-day tourist entry (FMM) allows visa-free remote work for Western passports. Formal Temporary Residency grants banking, local tax ID (RFC), and path to PR.',
    creatorVibe: 'Vibrant Latin American creator hub. World-class culinary culture, endless coffee shops with 150Mbps fiber, zero timezone friction with North America, and deep artistic energy.',
    cafeWorkCulture: 'Legendary Laptop Friendly',
    powerAndBackupStability: 'Very Stable',
    travelMedicalInsuranceRecommendation: {
      provider: 'SafetyWing Nomad Insurance',
      estimatedMonthlyUSD: 45,
      highlight: 'Direct billing at top private hospitals like ABC Medical Center in CDMX',
    },
  },

  colombia: {
    hasCuratedData: true,
    monthlyNomadBurnUSD: 1250,
    furnishedShortTermRentUSD: 680,
    coworkingMonthlyUSD: 115,
    verifiedInternetMbps: 130,
    internetReliability: 'High-Speed Reliable',
    coworkingDensity: 'World-Class Nomad Hub',
    topNomadCities: ['Medellín (El Poblado / Provenza / Laureles)', 'Bogotá (Chicó / Chapinero)', 'Santa Marta / Minca', 'Cartagena'],
    remoteWorkVisaName: 'Visa V Nómadas Digitales (Resolution 5477)',
    remoteWorkVisaIncomeUSD: 1400, // 3x Colombian minimum wage (~$1,400 USD/mo)
    remoteWorkVisaStay: 'Up to 2 Years (Multiple Entry)',
    remoteWorkVisaDetails: 'One of the lowest income thresholds in the Americas ($1,400/mo). Exemption from domestic Colombian income tax if stay remains under 183 days per rolling year.',
    creatorVibe: 'City of Eternal Spring. Lush green mountain scenery, modern metro transit, thriving expat meetups, and dozens of coworking centers like Selina & WeWork in Laureles.',
    cafeWorkCulture: 'Legendary Laptop Friendly',
    powerAndBackupStability: 'Very Stable',
    travelMedicalInsuranceRecommendation: {
      provider: 'SafetyWing Nomad Insurance',
      estimatedMonthlyUSD: 45,
      highlight: 'Covers premier private hospitals like Hospital Pablo Tobón Uribe',
    },
  },

  'costa-rica': {
    hasCuratedData: true,
    monthlyNomadBurnUSD: 2100,
    furnishedShortTermRentUSD: 1250,
    coworkingMonthlyUSD: 150,
    verifiedInternetMbps: 125,
    internetReliability: 'High-Speed Reliable',
    coworkingDensity: 'Abundant & Vibrant',
    topNomadCities: ['Santa Teresa & Mal País', 'Nosara & Playa Guiones', 'Puerto Viejo (Caribbean)', 'San José / Escazú'],
    remoteWorkVisaName: 'Estancia Para Trabajadores Remotos (Law 10008)',
    remoteWorkVisaIncomeUSD: 3000, // $3,000/mo single ($4,000 for family)
    remoteWorkVisaStay: '1 Year (Extendable to 2 Years)',
    remoteWorkVisaDetails: 'Complete exemption from Costa Rican income tax on foreign revenues, import tax exemption on work equipment, and local bank account rights.',
    creatorVibe: 'Pura Vida paradise for remote creators, surfers, and eco-innovators. High concentration of beachside colivings, solar-powered work cafes, and active outdoor communities.',
    cafeWorkCulture: 'Widely Welcomed',
    powerAndBackupStability: 'Very Stable',
    travelMedicalInsuranceRecommendation: {
      provider: 'SafetyWing Nomad Insurance',
      estimatedMonthlyUSD: 48,
      highlight: 'Meets Costa Rican Directorate General of Migration requirements',
    },
  },

  italy: {
    hasCuratedData: true,
    monthlyNomadBurnUSD: 2400,
    furnishedShortTermRentUSD: 1350,
    coworkingMonthlyUSD: 165,
    verifiedInternetMbps: 180,
    internetReliability: 'Ultra-Fast Fiber',
    coworkingDensity: 'Abundant & Vibrant',
    topNomadCities: ['Rome (Trastevere / Monti)', 'Milan (Navigli / Isola)', 'Florence', 'Palermo & Catania (Sicily)'],
    remoteWorkVisaName: 'Italy Digital Nomad Visa (Art. 27-quater)',
    remoteWorkVisaIncomeUSD: 3100, // 3x minimum health exemption threshold (~€2,700/mo)
    remoteWorkVisaStay: '1 Year (Renewable Annually)',
    remoteWorkVisaDetails: 'Officially launched in 2024 for highly qualified remote professionals. Allows residence in Italy while working for non-Italian clients; potential access to Southern Italy 90% tax relief scheme.',
    creatorVibe: 'Legendary espresso culture, historic architecture, and burgeoning creative hubs across Milan, Rome, and coastal Sicily where municipalities subsidize coworking spaces.',
    cafeWorkCulture: 'Selective Coworking Spaces Preferred',
    powerAndBackupStability: 'Extremely Reliable (99.9%)',
    travelMedicalInsuranceRecommendation: {
      provider: 'Genki Explorer / Cigna Global',
      estimatedMonthlyUSD: 65,
      highlight: 'Schengen-compliant health certificate for Italian consular processing',
    },
  },

  japan: {
    hasCuratedData: true,
    monthlyNomadBurnUSD: 2650,
    furnishedShortTermRentUSD: 1450,
    coworkingMonthlyUSD: 180,
    verifiedInternetMbps: 250,
    internetReliability: 'Ultra-Fast Fiber',
    coworkingDensity: 'Abundant & Vibrant',
    topNomadCities: ['Tokyo (Shibuya / Shinjuku / Kichijoji)', 'Kyoto', 'Fukuoka (Startup City)', 'Osaka'],
    remoteWorkVisaName: 'Japan 6-Month Digital Nomad Visa (2024)',
    remoteWorkVisaIncomeUSD: 5600, // ¥10,000,000 annual income (~$68,000 USD)
    remoteWorkVisaStay: '6 Months (Non-Renewable consecutive; reapply after 6 months out)',
    remoteWorkVisaDetails: 'Allows citizens of 49 visa-exempt countries with tax treaties to live and work remotely in Japan for up to 6 months without being subject to Japanese domestic income taxes.',
    creatorVibe: 'Immaculate safety, ultra-fast public Wi-Fi, high-tech train transit, 24/7 konbini culture, and vibrant creator communities in Tokyo and startup-friendly Fukuoka.',
    cafeWorkCulture: 'Selective Coworking Spaces Preferred',
    powerAndBackupStability: 'Extremely Reliable (99.9%)',
    travelMedicalInsuranceRecommendation: {
      provider: 'SafetyWing Nomad Insurance / World Nomads',
      estimatedMonthlyUSD: 55,
      highlight: 'Covers Japanese private medical clinics with English-language translation',
    },
  },

  malaysia: {
    hasCuratedData: true,
    monthlyNomadBurnUSD: 1400,
    furnishedShortTermRentUSD: 720,
    coworkingMonthlyUSD: 120,
    verifiedInternetMbps: 190,
    internetReliability: 'Ultra-Fast Fiber',
    coworkingDensity: 'World-Class Nomad Hub',
    topNomadCities: ['Kuala Lumpur (Bangsar / KLCC / Mont Kiara)', 'Penang (George Town)', 'Langkawi Island (Duty-Free)'],
    remoteWorkVisaName: 'DE Rantau Nomad Pass (MDEC)',
    remoteWorkVisaIncomeUSD: 2000, // $24,000 annual income
    remoteWorkVisaStay: '1 Year (Renewable for a 2nd Year)',
    remoteWorkVisaDetails: 'Endorsed by the Malaysia Digital Economy Corporation. Grants foreign-sourced remote income exemption, spouse/child inclusion, and access to DE Rantau certified hubs.',
    creatorVibe: 'Premier Southeast Asian hub for English fluency, affordable high-rise condos with rooftop infinity pools, and legendary culinary diversity.',
    cafeWorkCulture: 'Legendary Laptop Friendly',
    powerAndBackupStability: 'Extremely Reliable (99.9%)',
    travelMedicalInsuranceRecommendation: {
      provider: 'SafetyWing Nomad Insurance',
      estimatedMonthlyUSD: 45,
      highlight: 'Covers JCI-accredited Gleneagles and Prince Court medical centers',
    },
  },

  panama: {
    hasCuratedData: true,
    monthlyNomadBurnUSD: 1950,
    furnishedShortTermRentUSD: 1100,
    coworkingMonthlyUSD: 140,
    verifiedInternetMbps: 155,
    internetReliability: 'High-Speed Reliable',
    coworkingDensity: 'Abundant & Vibrant',
    topNomadCities: ['Panama City (Casco Viejo / San Francisco)', 'Boquete (Highlands)', 'Playa Venao (Surf & Remote)'],
    remoteWorkVisaName: 'Short Stay Remote Worker Visa (Executive Decree 198)',
    remoteWorkVisaIncomeUSD: 3000, // $3,000/mo ($4,000 with family)
    remoteWorkVisaStay: '9 months (Extendable once for up to 18 months total)',
    remoteWorkVisaDetails: 'Panama operates on a strictly territorial tax system: income earned remotely from foreign clients is 100% tax-exempt under national law.',
    creatorVibe: 'USD-currency economy with high-rise banking headquarters, vibrant historical Casco Viejo cafes, and Pacific surf towns with fiber internet.',
    cafeWorkCulture: 'Widely Welcomed',
    powerAndBackupStability: 'Very Stable',
    travelMedicalInsuranceRecommendation: {
      provider: 'SafetyWing Nomad Insurance',
      estimatedMonthlyUSD: 45,
      highlight: 'Direct coverage at Pacifica Salud (Johns Hopkins affiliate) in Panama City',
    },
  },

  croatia: {
    hasCuratedData: true,
    monthlyNomadBurnUSD: 1950,
    furnishedShortTermRentUSD: 1100,
    coworkingMonthlyUSD: 140,
    verifiedInternetMbps: 150,
    internetReliability: 'High-Speed Reliable',
    coworkingDensity: 'Abundant & Vibrant',
    topNomadCities: ['Split (Diocletian Palace / Bačvice)', 'Zagreb', 'Dubrovnik', 'Zadar Nomad Valley'],
    remoteWorkVisaName: 'Croatia Digital Nomad Temporary Stay',
    remoteWorkVisaIncomeUSD: 2750, // 2.5x Croatian average salary (~€2,540/mo)
    remoteWorkVisaStay: 'Up to 1 Year (Must spend 6 months out before re-applying)',
    remoteWorkVisaDetails: 'Zero percent (0%) domestic income tax on remote income generated for foreign employers during the 1-year residency grant.',
    creatorVibe: 'Stunning Adriatic coastline, pristine waters, warm island-hopping lifestyle, and an organized Digital Nomad Association with community co-working events.',
    cafeWorkCulture: 'Widely Welcomed',
    powerAndBackupStability: 'Extremely Reliable (99.9%)',
    travelMedicalInsuranceRecommendation: {
      provider: 'SafetyWing Nomad Insurance / Genki',
      estimatedMonthlyUSD: 48,
      highlight: 'Schengen medical insurance accepted at MUP police stations for permit issuance',
    },
  },

  cyprus: {
    hasCuratedData: true,
    monthlyNomadBurnUSD: 2250,
    furnishedShortTermRentUSD: 1300,
    coworkingMonthlyUSD: 150,
    verifiedInternetMbps: 170,
    internetReliability: 'Ultra-Fast Fiber',
    coworkingDensity: 'Abundant & Vibrant',
    topNomadCities: ['Limassol', 'Paphos', 'Larnaca', 'Nicosia'],
    remoteWorkVisaName: 'Cyprus Digital Nomad Visa Scheme',
    remoteWorkVisaIncomeUSD: 3800, // €3,500/mo net
    remoteWorkVisaStay: '1 Year (Renewable for up to 3 Years Total)',
    remoteWorkVisaDetails: 'Tax residency kicks in only if present for >183 days, with access to favorable non-domicile dividend and interest tax exemptions.',
    creatorVibe: 'Sun-drenched EU island with 320+ days of sunshine, English widely spoken across commerce, and a thriving digital nomad and fintech cluster.',
    cafeWorkCulture: 'Widely Welcomed',
    powerAndBackupStability: 'Extremely Reliable (99.9%)',
    travelMedicalInsuranceRecommendation: {
      provider: 'SafetyWing Nomad Insurance',
      estimatedMonthlyUSD: 50,
      highlight: 'Meets Cyprus Civil Registry and Migration Department criteria',
    },
  },

  vietnam: {
    hasCuratedData: true,
    monthlyNomadBurnUSD: 1080,
    furnishedShortTermRentUSD: 520,
    coworkingMonthlyUSD: 95,
    verifiedInternetMbps: 140,
    internetReliability: 'High-Speed Reliable',
    coworkingDensity: 'World-Class Nomad Hub',
    topNomadCities: ['Da Nang (An Thuong / My Khe Beach)', 'Ho Chi Minh City (District 1 / Thao Dien)', 'Hanoi (Tay Ho)'],
    remoteWorkVisaName: '90-Day Multiple-Entry E-Visa',
    remoteWorkVisaIncomeUSD: 0, // No income requirement
    remoteWorkVisaStay: '90 Days (Easily renewable via border run or online reapplication)',
    remoteWorkVisaDetails: 'Full 90-day multiple entry e-visas allow flexible remote stays. Coastal Da Nang offers world-class beachfront work cafes at ultra-affordable living costs.',
    creatorVibe: 'Legendary coffee culture (Phin, egg coffee, coconut coffee), high-speed fiber everywhere, friendly locals, and vibrant creator communities.',
    cafeWorkCulture: 'Legendary Laptop Friendly',
    powerAndBackupStability: 'Very Stable',
    travelMedicalInsuranceRecommendation: {
      provider: 'SafetyWing Nomad Insurance',
      estimatedMonthlyUSD: 45,
      highlight: 'Covers private international clinics like Vinmec and Family Medical Practice',
    },
  },

  malta: {
    hasCuratedData: true,
    monthlyNomadBurnUSD: 2450,
    furnishedShortTermRentUSD: 1450,
    coworkingMonthlyUSD: 165,
    verifiedInternetMbps: 175,
    internetReliability: 'Ultra-Fast Fiber',
    coworkingDensity: 'Abundant & Vibrant',
    topNomadCities: ['Valletta', 'Sliema', 'St. Julian’s'],
    remoteWorkVisaName: 'Malta Nomad Residence Permit (Residency Malta)',
    remoteWorkVisaIncomeUSD: 3800, // €3,500/mo gross
    remoteWorkVisaStay: '1 Year (Renewable up to 4 Years Total)',
    remoteWorkVisaDetails: 'Special 10% flat tax rate on authorized remote work income, with English as an official co-language across all government and commercial services.',
    creatorVibe: 'English-speaking Mediterranean archipelago with nationwide 5G and fiber network, historic fortifications, and active yachting and startup social scene.',
    cafeWorkCulture: 'Widely Welcomed',
    powerAndBackupStability: 'Extremely Reliable (99.9%)',
    travelMedicalInsuranceRecommendation: {
      provider: 'SafetyWing Nomad / Cigna Global',
      estimatedMonthlyUSD: 55,
      highlight: 'Schengen-compliant health coverage for Identity Malta filings',
    },
  },
};

/**
 * Intelligent helper to retrieve or generate accurate Nomad & Remote Work metrics
 * for any country in the ReFIREly global database.
 */
export function getCountryNomadProfile(country: Country): CountryNomadProfile {
  const curated = CURATED_NOMAD_PROFILES[country.id];
  const shortVisas = SHORT_TERM_VISA_DATABASE[country.id] || [];

  // Look for any active DNV or remote visa in the shortTermVisas dataset
  const dnvOption = shortVisas.find(
    v => v.category === 'Digital Nomad & Remote Work' || v.name.toLowerCase().includes('nomad')
  );

  const touristOption = shortVisas.find(
    v => v.category === 'Tourist & Scouting Stay' || v.name.toLowerCase().includes('tourist')
  );

  // If curated data exists, merge with country defaults
  if (curated) {
    const monthlyBurn = curated.monthlyNomadBurnUSD || Math.round(country.costOfLiving.monthlyBudgetSingleUSD * 1.15 + 130);
    return {
      countryId: country.id,
      countryName: country.name,
      hasCuratedData: true,
      monthlyNomadBurnUSD: monthlyBurn,
      furnishedShortTermRentUSD: curated.furnishedShortTermRentUSD || Math.round(country.costOfLiving.rent1BedCenterUSD * 1.35),
      coworkingMonthlyUSD: curated.coworkingMonthlyUSD || 140,
      sixMonthRunwayUSD: monthlyBurn * 6,
      verifiedInternetMbps: curated.verifiedInternetMbps || 150,
      internetReliability: curated.internetReliability || 'High-Speed Reliable',
      coworkingDensity: curated.coworkingDensity || 'Abundant & Vibrant',
      topNomadCities: curated.topNomadCities || country.topCities.map(c => c.name),
      remoteWorkVisaName: curated.remoteWorkVisaName || dnvOption?.name || `${country.name} Remote / Tourist Stay`,
      remoteWorkVisaIncomeUSD: curated.remoteWorkVisaIncomeUSD ?? (dnvOption?.incomeThresholdUSD || 0),
      remoteWorkVisaStay: curated.remoteWorkVisaStay || dnvOption?.duration || '90–180 Days on Arrival',
      remoteWorkVisaDetails: curated.remoteWorkVisaDetails || dnvOption?.allowedActivities || 'Remote work for overseas employers permitted under standard entry guidelines.',
      creatorVibe: curated.creatorVibe || `Dynamic remote hub in ${country.region} with strong digital infrastructure and scenic expat living.`,
      cafeWorkCulture: curated.cafeWorkCulture || 'Widely Welcomed',
      powerAndBackupStability: curated.powerAndBackupStability || 'Very Stable',
      travelMedicalInsuranceRecommendation: curated.travelMedicalInsuranceRecommendation || {
        provider: 'SafetyWing Nomad Insurance',
        estimatedMonthlyUSD: 48,
        highlight: 'Continuous rolling global medical coverage with $0 deductible',
      },
    };
  }

  // Graceful fallback calculation for countries currently indexing deep nomad data
  const shortRent = Math.round(country.costOfLiving.rent1BedCenterUSD * 1.35);
  const coworking = Math.max(100, Math.round(country.costOfLiving.rent1BedCenterUSD * 0.16));
  const livingBurn = Math.round(country.costOfLiving.monthlyBudgetSingleUSD * 1.12 + coworking);

  // Regional internet speed estimation
  const regionMbps: Record<string, number> = {
    Europe: 185,
    'Southeast Asia': 150,
    Americas: 140,
    'North & Central America': 155,
    'South America': 120,
    'Asia & Middle East': 190,
    Oceania: 170,
    Africa: 85,
  };

  const internetSpeed = regionMbps[country.region] || 135;

  return {
    countryId: country.id,
    countryName: country.name,
    hasCuratedData: false, // Triggers fallback indexing badge as requested
    monthlyNomadBurnUSD: livingBurn,
    furnishedShortTermRentUSD: shortRent,
    coworkingMonthlyUSD: coworking,
    sixMonthRunwayUSD: livingBurn * 6,
    verifiedInternetMbps: internetSpeed,
    internetReliability: country.region === 'Europe' ? 'Ultra-Fast Fiber' : 'High-Speed Reliable',
    coworkingDensity: country.topCities.length > 2 ? 'Abundant & Vibrant' : 'Growing Network',
    topNomadCities: country.topCities.map(c => c.name),
    remoteWorkVisaName: dnvOption?.name || `${country.name} Tourist & Remote Entry`,
    remoteWorkVisaIncomeUSD: dnvOption?.incomeThresholdUSD || 0,
    remoteWorkVisaStay: dnvOption?.duration || touristOption?.duration || '90-Day Entry Stamp / Consular Visa',
    remoteWorkVisaDetails: dnvOption?.allowedActivities || 'Standard short-stay entry rules. Check local immigration rules for remote work tax thresholds.',
    creatorVibe: `Welcoming destination in ${country.region} with scenic surroundings and growing remote-worker amenities.`,
    cafeWorkCulture: 'Widely Welcomed',
    powerAndBackupStability: country.region === 'Europe' ? 'Extremely Reliable (99.9%)' : 'Very Stable',
    travelMedicalInsuranceRecommendation: {
      provider: 'SafetyWing Nomad Insurance',
      estimatedMonthlyUSD: 48,
      highlight: 'Global travel medical insurance covering 180+ countries with rolling subscription',
    },
  };
}
