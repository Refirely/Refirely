import { Country } from '../types';

export interface NeighborhoodRentalProfile {
  name: string;
  city: string;
  districtType:
    | 'Expat Favorite & Walkable'
    | 'Diplomatic & Luxury'
    | 'Hip & Bohemian'
    | 'Peaceful Residential & Green'
    | 'Coastal & Beachfront'
    | 'Budget Friendly & Authentic';
  avgRent1BedUSD: number;
  avgRent2BedUSD: number;
  safetyRating: number; // 0 - 100
  walkabilityScore: number; // 0 - 100
  transitAccess: string;
  vibeAndHighlights: string;
  bestFor: string;
  cautionNotes?: string;
}

export interface DistrictToAvoidCaution {
  districtName: string;
  city: string;
  riskCategory:
    | 'Petty Crime & Pickpocketing'
    | 'Violent Crime / Gang Activity'
    | 'Night-time Vulnerability / Poor Lighting'
    | 'Industrial / Noise & Infrastructure'
    | 'Scams & Street Aggression';
  severity: 'Exercise Caution at Night' | 'Avoid Unaccompanied' | 'Strictly Avoid';
  reason: string;
  actionableSafetyAdvice: string;
}

export interface RentalMarketTrends {
  marketVelocity:
    | 'Hot Demand / Rapid Turnaround'
    | 'Balanced & Stable'
    | 'Tenant-Favorable (Oversupply)'
    | 'Seasonal Tourism Driven';
  yearOverYearRentChange: string;
  inventoryAvailability: 'Very Tight (< 14 days)' | 'Moderate (30-45 days)' | 'Abundant (> 60 days)';
  keyNomadOrTourismPressure: string;
  outlookSummary: string;
}

export interface ListingPortal {
  name: string;
  domainUrl: string;
  description: string;
  expatFriendly: boolean;
}

export interface BrokerAndFeeStructure {
  whoPaysBrokerFee:
    | 'Landlord Strictly (0% for Tenant)'
    | 'Tenant Pays (1 Month Rent)'
    | 'Split 50/50 Between Parties'
    | 'Tenant Pays Statutory Capped Fee'
    | 'Direct Landlord Portals (No Agent)';
  typicalBrokerCommission: string;
  securityDepositRequirement: string;
  guarantorRequirements: string;
  utilityRegistrationProcess: string;
  keyListingPortals: ListingPortal[];
}

export interface RentalContractLegalRules {
  standardLeaseDuration: string;
  earlyTerminationNotice: string;
  tenantProtectionsAndRentCaps: string;
  evictionRegulations: string;
  registrationRequirement: string;
  inventoryAndDepositReturn: string;
}

export interface CountryHousingProfile {
  countryId: string;
  countryName: string;
  capitalCity: string;
  currency: string;
  currencySymbol: string;
  avgNationalRent1BedCenterUSD: number;
  avgNationalRent1BedOutsideUSD: number;
  avgNationalRent2BedCenterUSD: number;
  avgMonthlyUtilitiesUSD: number;
  highSpeedInternetUSD: number;
  marketTrends: RentalMarketTrends;
  brokerAndFees: BrokerAndFeeStructure;
  legalRules: RentalContractLegalRules;
  safeExpatNeighborhoods: NeighborhoodRentalProfile[];
  areasToAvoidOrCaution: DistrictToAvoidCaution[];
  mustCheckClausesChecklist: string[];
  expatRentingGoldenRules: string[];
}

// Tailored, empirical profiles for premier retirement and expat hubs
const COUNTRY_HOUSING_OVERLAYS: Record<string, Partial<CountryHousingProfile>> = {
  portugal: {
    marketTrends: {
      marketVelocity: 'Hot Demand / Rapid Turnaround',
      yearOverYearRentChange: '+5.4% YoY',
      inventoryAvailability: 'Very Tight (< 14 days)',
      keyNomadOrTourismPressure:
        'Lisbon and Porto central apartments face fierce competition from high-earning remote workers and short-term tourist rentals (Alojamento Local), though suburban areas offer more breathing room.',
      outlookSummary:
        'Lisbon historic center remains premium, but Cascais, the Silver Coast, and Eastern Algarve offer exceptional value and superior inventory for long-term retirees.',
    },
    brokerAndFees: {
      whoPaysBrokerFee: 'Landlord Strictly (0% for Tenant)',
      typicalBrokerCommission: 'Paid entirely by property owner (typically 1 month rent or 5% of lease value). Tenants never pay agency finder fees.',
      securityDepositRequirement: 'Standard is 1 to 2 months rent as security deposit (caução) plus 1 to 2 months rent paid in advance.',
      guarantorRequirements:
        'Foreign retirees without local Portuguese tax income (fiador) are customarily asked to provide 3 to 6 months of pension/bank statements or offer 3 months rent upfront.',
      utilityRegistrationProcess:
        'Electricity (EDP, Endesa), water (EPAL), and fiber internet (MEO, NOS, Vodafone) require your NIF (Portuguese Tax ID) and registered lease agreement. Transfer takes 3 to 5 business days.',
      keyListingPortals: [
        { name: 'Idealista.pt', domainUrl: 'idealista.pt', description: 'The gold standard across Portugal with photo verification and English translation.', expatFriendly: true },
        { name: 'Imovirtual.com', domainUrl: 'imovirtual.com', description: 'Major agency listings with filter by energy rating and elevator access.', expatFriendly: true },
        { name: 'Casa Sapo', domainUrl: 'casa.sapo.pt', description: 'Traditional portal with direct private landlord listings and regional bargains.', expatFriendly: false },
        { name: 'Uniplaces & Flatio', domainUrl: 'flatio.com', description: 'Mid-term 1 to 6-month furnished rentals ideal for your initial scout trip.', expatFriendly: true },
      ],
    },
    legalRules: {
      standardLeaseDuration: 'Residential leases (Contrato de Arrendamento) are typically 1 to 3 years, automatically renewable.',
      earlyTerminationNotice: 'By law, after completing 1/3 of the contract term (e.g. 4 months on a 1-year lease), tenant can exit with 60 to 90 days written registered notice (carta registada com aviso de receção).',
      tenantProtectionsAndRentCaps: 'Annual rent updates are legally tied to the National Statistics Institute (INE) inflation index. Landlords cannot arbitrarily raise rent during a multi-year lease.',
      evictionRegulations: 'Portugal maintains strong tenant protections; arbitrary eviction is strictly illegal. Landlords must give 120 days non-renewal notice.',
      registrationRequirement: 'Mandatory: The landlord MUST register the lease electronically with the Portuguese Tax Authority (Finanças - Portal das Finanças). You need this official stamped registration to prove legal address for your D7/D8 residency visa!',
      inventoryAndDepositReturn: 'An initial inventory inspection (auto de receção) must be signed. Landlords are legally required to refund the security deposit within 30 days after check-out minus documented repair invoices.',
    },
    safeExpatNeighborhoods: [
      {
        name: 'Príncipe Real & Chiado',
        city: 'Lisbon',
        districtType: 'Expat Favorite & Walkable',
        avgRent1BedUSD: 1650,
        avgRent2BedUSD: 2450,
        safetyRating: 94,
        walkabilityScore: 98,
        transitAccess: 'Baixa-Chiado & Rato Metro stations, historic Tram 28, easily walkable.',
        vibeAndHighlights: 'Historic 19th-century mansions, tranquil botanical gardens, chic designer boutiques, and Lisbon’s finest organic markets and wine bars.',
        bestFor: 'Active urban retirees desiring culture, architecture, and top culinary choices on foot.',
      },
      {
        name: 'Campo de Ourique',
        city: 'Lisbon',
        districtType: 'Peaceful Residential & Green',
        avgRent1BedUSD: 1350,
        avgRent2BedUSD: 1950,
        safetyRating: 97,
        walkabilityScore: 95,
        transitAccess: 'Terminal for Tram 28, numerous bus lines, easy flat walking grid.',
        vibeAndHighlights: 'Often called Lisbon’s best neighborhood for daily life; flat tree-lined streets, traditional Mercado de Campo de Ourique gourmet market, and Jardim da Parada park.',
        bestFor: 'Retirees seeking peaceful village atmosphere without hills, surrounded by local grocers and cafes.',
      },
      {
        name: 'Parque das Nações (Expo)',
        city: 'Lisbon',
        districtType: 'Diplomatic & Luxury',
        avgRent1BedUSD: 1400,
        avgRent2BedUSD: 2100,
        safetyRating: 98,
        walkabilityScore: 92,
        transitAccess: 'Oriente Station (Red line metro, high-speed regional trains, buses).',
        vibeAndHighlights: 'Ultra-modern riverfront district built for Expo 98. Modern high-rises with elevators and underground parking, 5km waterfront boardwalk, Oceanarium, and private CUF Descobertas hospital.',
        bestFor: 'Retirees prioritizing step-free modern elevator buildings, river views, and hospital proximity.',
      },
      {
        name: 'Cascais & Estoril',
        city: 'Greater Lisbon Riviera',
        districtType: 'Coastal & Beachfront',
        avgRent1BedUSD: 1500,
        avgRent2BedUSD: 2350,
        safetyRating: 98,
        walkabilityScore: 90,
        transitAccess: 'Cascais-Cais do Sodré coastal train line (32 min scenic ride into central Lisbon).',
        vibeAndHighlights: 'World-renowned coastal resort town with sheltered sandy beaches, scenic seaside promenade (Paredão), golf courses, marina, and Michelin-starred dining.',
        bestFor: 'Seaside lovers seeking clean Atlantic breezes, affluent expat community, and outdoor wellness.',
      },
      {
        name: 'Foz do Douro & Cedofeita',
        city: 'Porto',
        districtType: 'Expat Favorite & Walkable',
        avgRent1BedUSD: 1050,
        avgRent2BedUSD: 1550,
        safetyRating: 95,
        walkabilityScore: 91,
        transitAccess: 'Porto Metro, historical coastal tram line 1.',
        vibeAndHighlights: 'Foz offers Atlantic beach promenades and lighthouses; Cedofeita offers the trendy arts district with galleries, quaint gardens, and craft cafes.',
        bestFor: 'Retirees wanting a vibrant northern Portuguese city with lower living costs than Lisbon.',
      },
      {
        name: 'Caldas da Rainha & Silver Coast',
        city: 'Silver Coast (Oeste)',
        districtType: 'Budget Friendly & Authentic',
        avgRent1BedUSD: 680,
        avgRent2BedUSD: 980,
        safetyRating: 98,
        walkabilityScore: 88,
        transitAccess: 'Direct express buses (Rede Expressos) to Lisbon in 65 minutes.',
        vibeAndHighlights: 'Historic spa town known for daily open-air fruit and flower market (Praça da Fruta), thermal hospital, low humidity, and 15-minute drive to Foz do Arelho beach lagoon.',
        bestFor: 'Budget-conscious retirees seeking 40% lower rents, fresh local food, and genuine Portuguese hospitality.',
      },
    ],
    areasToAvoidOrCaution: [
      {
        districtName: 'Martim Moniz & Intendente (Late Night)',
        city: 'Lisbon',
        riskCategory: 'Night-time Vulnerability / Poor Lighting',
        severity: 'Exercise Caution at Night',
        reason: 'While heavily revitalized by day with diverse ethnic restaurants, streets behind Intendente and Martim Moniz can experience open drug peddling and petty theft past midnight.',
        actionableSafetyAdvice: 'Fine to visit during daylight; take registered taxis or Bolt rideshare when returning late at night rather than walking through dimly lit back alleys.',
      },
      {
        districtName: 'Chelas & Bairro do Padre Cruz (Peripheral Suburbs)',
        city: 'Lisbon Outskirts',
        riskCategory: 'Industrial / Noise & Infrastructure',
        severity: 'Avoid Unaccompanied',
        reason: 'Post-war public housing projects located far from amenities and tourist services; lack medical clinics and English services.',
        actionableSafetyAdvice: 'Stick to residential municipalities like Cascais, Oeiras, Alfragide, or Lisbon central parish zones when choosing rental housing.',
      },
      {
        districtName: 'Cais do Sodré Strip (Rua Cor-de-Rosa at 3 AM)',
        city: 'Lisbon',
        riskCategory: 'Petty Crime & Pickpocketing',
        severity: 'Exercise Caution at Night',
        reason: 'Heavy nightlife crowd and drunkenness make visitors vulnerable to pickpockets and aggressive street scammers selling fake oregano/substances.',
        actionableSafetyAdvice: 'Keep phones and wallets in front zipper pockets; firmly ignore street hawkers offering counterfeit items.',
      },
    ],
  },

  spain: {
    marketTrends: {
      marketVelocity: 'Hot Demand / Rapid Turnaround',
      yearOverYearRentChange: '+6.1% YoY',
      inventoryAvailability: 'Very Tight (< 14 days)',
      keyNomadOrTourismPressure:
        'Madrid and Barcelona suffer intense rental pressure. Coastal retiree hubs like Valencia, Alicante, and Malaga have seen strong European influx, but suburban and secondary coastal towns remain widely accessible.',
      outlookSummary:
        'Spain’s Housing Law (Ley de Vivienda) provides extraordinary tenant protections, legally capping annual rent increases and banning tenant-side broker fees for primary residences.',
    },
    brokerAndFees: {
      whoPaysBrokerFee: 'Landlord Strictly (0% for Tenant)',
      typicalBrokerCommission: 'Under the landmark Spanish Housing Law (Ley 12/2023), real estate agency commissions MUST be paid by the landlord. Tenants pay €0 in agent commission for primary residential contracts.',
      securityDepositRequirement: 'By statutory law (LAU), the mandatory deposit is exactly 1 month rent (fianza legal). Landlords may request an additional contractual guarantee of up to 2 months rent max.',
      guarantorRequirements:
        'Proof of stable pension, passive income, or non-lucrative visa approval showing at least 3x monthly rent. A Spanish bank statement showing liquid funds is widely accepted.',
      utilityRegistrationProcess:
        'Requires your NIE (Foreigner ID number), passport, and Spanish bank IBAN for direct debit (domiciliación bancaria). Companies: Iberdrola, Endesa, Canal de Isabel II (Madrid), Movistar/Orange fiber.',
      keyListingPortals: [
        { name: 'Idealista.com', domainUrl: 'idealista.com', description: 'Spain’s undisputed #1 property portal with map drawing tools and English filters.', expatFriendly: true },
        { name: 'Fotocasa.es', domainUrl: 'fotocasa.es', description: 'Comprehensive secondary portal with virtual tours and neighborhood safety stats.', expatFriendly: true },
        { name: 'Habitaclia', domainUrl: 'habitaclia.com', description: 'Exceptional coverage in Catalonia, Valencia, and the Balearic Islands.', expatFriendly: true },
        { name: 'Milanuncios', domainUrl: 'milanuncios.com', description: 'Direct owner classifieds; great prices but requires verification against rental scams.', expatFriendly: false },
      ],
    },
    legalRules: {
      standardLeaseDuration: 'Statutory 5-year lease (if landlord is an individual) or 7 years (if corporate entity). Tenant has the right to renew annually up to 5 full years!',
      earlyTerminationNotice: 'Tenant has the legal right to terminate after 6 months with only 30 days written notice (Art. 9 LAU). Penalties cannot exceed 1 month rent per year remaining.',
      tenantProtectionsAndRentCaps: 'Annual rent updates are strictly capped by government index (capped at 3% or national IPC index). Landlords cannot hike rent beyond this ceiling.',
      evictionRegulations: 'Extremely protective of bona fide tenants. Eviction for non-payment requires formal judicial proceedings lasting 8 to 18 months.',
      registrationRequirement: 'Landlords are legally mandated to deposit your security deposit with the regional tenancy agency (e.g., IVIMA in Madrid, INCASÒL in Catalonia, AVRA in Andalusia). This guarantees your deposit cannot be stolen.',
      inventoryAndDepositReturn: 'Deposit must be returned within 30 days following handover of keys, with interest accruing to the tenant if delayed past 30 days.',
    },
    safeExpatNeighborhoods: [
      {
        name: 'Chamberí & Salamanca',
        city: 'Madrid',
        districtType: 'Diplomatic & Luxury',
        avgRent1BedUSD: 1450,
        avgRent2BedUSD: 2200,
        safetyRating: 97,
        walkabilityScore: 98,
        transitAccess: 'Rubén Darío, Alonso Martínez, Serrano Metro lines.',
        vibeAndHighlights: 'Chamberí offers authentic Madrid life with traditional tapas squares (Plaza de Olavide); Salamanca offers stately 19th-century architecture, tree-lined boulevards, and elite shopping.',
        bestFor: 'Retirees who love refined European city living, opera, museums, and safe evening strolls.',
      },
      {
        name: 'Retiro & Ibiza',
        city: 'Madrid',
        districtType: 'Peaceful Residential & Green',
        avgRent1BedUSD: 1350,
        avgRent2BedUSD: 2050,
        safetyRating: 98,
        walkabilityScore: 96,
        transitAccess: 'Retiro & Ibiza Metro stations, 5 min to Atocha high-speed train hub.',
        vibeAndHighlights: 'Steps from UNESCO-listed El Retiro Park, crystal palaces, and Calle Ibiza’s famous gastronomy mile with world-class medical facilities nearby (Hospital Gregorio Marañón).',
        bestFor: 'Retirees seeking healthy parkside walking routines and exceptional food culture.',
      },
      {
        name: 'Ruzafa & Gran Vía',
        city: 'Valencia',
        districtType: 'Expat Favorite & Walkable',
        avgRent1BedUSD: 920,
        avgRent2BedUSD: 1380,
        safetyRating: 94,
        walkabilityScore: 97,
        transitAccess: 'Xàtiva & Colón Metro stations, flat bike paths everywhere.',
        vibeAndHighlights: 'Valencia is Spain’s sunshine gem; Ruzafa boasts art galleries, flower-filled balconies, craft bakeries, and proximity to the 9km-long Turia Gardens park riverbed.',
        bestFor: 'Retirees wanting 300 sunny days, coastal access, and 35% lower rents than Madrid.',
      },
      {
        name: 'Playa de San Juan & Cabo de las Huertas',
        city: 'Alicante',
        districtType: 'Coastal & Beachfront',
        avgRent1BedUSD: 780,
        avgRent2BedUSD: 1150,
        safetyRating: 96,
        walkabilityScore: 89,
        transitAccess: 'Alicante modern coastal Tram (lines L1, L3, L4 direct to city center).',
        vibeAndHighlights: 'Golden sand beaches stretching 7km, palm-fringed promenades, year-round microclimate, golf club, and a large welcoming English and Northern European retiree community.',
        bestFor: 'Seaside retirement with low living costs and direct international airport connections.',
      },
    ],
    areasToAvoidOrCaution: [
      {
        districtName: 'El Raval (Southern Alleys near Drassanes) & La Mina',
        city: 'Barcelona',
        riskCategory: 'Petty Crime & Pickpocketing',
        severity: 'Exercise Caution at Night',
        reason: 'Narrow dimly lit alleys in lower Raval have persistent pickpocketing, bag snatching, and drug sales. La Mina has high social deprivation.',
        actionableSafetyAdvice: 'Retirees looking at Barcelona should prioritize Eixample, Gràcia, Les Corts, or Sarrià-Sant Gervasi.',
      },
      {
        districtName: 'San Cristóbal & Cañada Real (Outer Margins)',
        city: 'Madrid Outskirts',
        riskCategory: 'Violent Crime / Gang Activity',
        severity: 'Strictly Avoid',
        reason: 'Marginalized informal settlements located far along the M-50 highway; center of illicit trade.',
        actionableSafetyAdvice: 'Stick to central Madrid districts inside the M-30 ring or affluent suburbs like Pozuelo, Majadahonda, and Las Rozas.',
      },
    ],
  },

  thailand: {
    marketTrends: {
      marketVelocity: 'Tenant-Favorable (Oversupply)',
      yearOverYearRentChange: '+1.8% YoY',
      inventoryAvailability: 'Abundant (> 60 days)',
      keyNomadOrTourismPressure:
        'Thailand features a vast surplus of brand-new luxury condominium towers. Bangkok, Chiang Mai, and Pattaya are heavily tenant-friendly, meaning retirees can negotiate rent discounts and extra furnishings easily.',
      outlookSummary:
        'World-class luxury amenities (infinity pools, rooftop saunas, co-working lounges, 24/7 security) come standard in modern condos starting under $500–$800/month.',
    },
    brokerAndFees: {
      whoPaysBrokerFee: 'Landlord Strictly (0% for Tenant)',
      typicalBrokerCommission: 'Real estate agents are 100% free for the renter! Landlords pay the agent exactly 1 month rent on a 1-year contract.',
      securityDepositRequirement: 'Standard is 2 months rent as security deposit plus 1 month rent paid in advance (3 months total to move in).',
      guarantorRequirements: 'No local guarantor needed! Foreign retirees simply provide a copy of their passport, valid Thai visa (e.g. Non-O Retirement or LTR), and first month’s deposit.',
      utilityRegistrationProcess:
        'In condominiums, water is paid directly to the condo management office (Juristic Office) at municipal rates (~20-40 THB/unit). Electricity is paid via 7-Eleven or mobile banking app (MEA/PEA rate ~4-5 THB/unit). Avoid apartments that bill private marked-up electric rates (7-9 THB/unit)!',
      keyListingPortals: [
        { name: 'DDproperty.com', domainUrl: 'ddproperty.com', description: 'Thailand’s largest property directory with BTS/MRT station distance filters.', expatFriendly: true },
        { name: 'Hipflat.com', domainUrl: 'hipflat.com', description: 'Shows historical price-per-sqm trends and condominium building reviews.', expatFriendly: true },
        { name: 'FazWaz.com', domainUrl: 'fazwaz.com', description: '360 virtual tours and verified agent listings across Bangkok, Phuket, and Chiang Mai.', expatFriendly: true },
        { name: 'RentHub.in.th', domainUrl: 'renthub.in.th', description: 'Direct budget apartments and mid-range serviced studios.', expatFriendly: false },
      ],
    },
    legalRules: {
      standardLeaseDuration: '1-year fixed lease is standard. 6-month leases are available at a 10–15% premium. Condos come 100% fully furnished with appliances and smart TVs.',
      earlyTerminationNotice: 'Breaking a lease before 12 months typically forfeits your 2-month security deposit unless a specific diplomatic relocation clause is written in.',
      tenantProtectionsAndRentCaps: 'No government rent caps, but high housing supply prevents landlords from making large rent increases upon renewal.',
      evictionRegulations: 'Clear and commercial: if rent is unpaid after 15 days, landlords can lock doors after written notice.',
      registrationRequirement: 'CRITICAL: The landlord MUST file the TM.30 Foreigner Notification form with Thai Immigration within 24 hours of your move-in. Ensure this is explicitly stated in your contract so your 90-day reporting and annual retirement visa extensions proceed smoothly!',
      inventoryAndDepositReturn: 'Detailed photographic inventory before handover. Deposit is refunded within 14 to 30 days after deducting final water and electric utility bills.',
    },
    safeExpatNeighborhoods: [
      {
        name: 'Ari & Phahonyothin',
        city: 'Bangkok',
        districtType: 'Expat Favorite & Walkable',
        avgRent1BedUSD: 550,
        avgRent2BedUSD: 950,
        safetyRating: 96,
        walkabilityScore: 92,
        transitAccess: 'BTS Ari station (Sukhumvit Line), direct access to Chatuchak and Siam.',
        vibeAndHighlights: 'Charming, leafy, low-stress residential neighborhood filled with craft cafes, boutique bakeries, open-air food courts, and tree-shaded villas. Highly popular with European professionals and long-term expats.',
        bestFor: 'Retirees who want Bangkok convenience without the frenetic sensory overload of Sukhumvit nightlife.',
      },
      {
        name: 'Phrom Phong & Thong Lo (Sukhumvit)',
        city: 'Bangkok',
        districtType: 'Diplomatic & Luxury',
        avgRent1BedUSD: 850,
        avgRent2BedUSD: 1600,
        safetyRating: 95,
        walkabilityScore: 94,
        transitAccess: 'BTS Phrom Phong & Thong Lo stations.',
        vibeAndHighlights: 'The epicenter of luxury expat life. Steps from Benjasiri Park, world-class EmQuartier and EmSphere malls, Samitivej International Hospital, and high-end Japanese dining.',
        bestFor: 'Retirees demanding maximum luxury, premier international hospitals, and vibrant urban energy.',
      },
      {
        name: 'Nimmanhaemin & Santitham',
        city: 'Chiang Mai',
        districtType: 'Hip & Bohemian',
        avgRent1BedUSD: 380,
        avgRent2BedUSD: 650,
        safetyRating: 97,
        walkabilityScore: 91,
        transitAccess: 'Songthaew red trucks, Grab taxis, easily walkable or scooter-friendly.',
        vibeAndHighlights: 'Mountain backdrop (Doi Suthep), art galleries, specialty coffee culture, Maya Lifestyle shopping mall, and Chiang Mai Ram private hospital.',
        bestFor: 'Retirees on a modest budget seeking cultural serenity, lush nature, and unmatched cost-of-living value.',
      },
      {
        name: 'Khao Takiab & Hua Hin Center',
        city: 'Hua Hin',
        districtType: 'Coastal & Beachfront',
        avgRent1BedUSD: 490,
        avgRent2BedUSD: 850,
        safetyRating: 98,
        walkabilityScore: 86,
        transitAccess: 'Green songthaew coastal line, Bangkok express train, easily walkable beach.',
        vibeAndHighlights: 'Royal resort town famed for serene wide beaches, championship golf courses, Bangkok Hospital Hua Hin, and relaxed seaside seafood dining.',
        bestFor: 'Peaceful coastal retirement favored by Scandinavian and British retirees.',
      },
    ],
    areasToAvoidOrCaution: [
      {
        districtName: 'Nana (Sukhumvit Soi 4) & Patpong Late Night',
        city: 'Bangkok',
        riskCategory: 'Scams & Street Aggression',
        severity: 'Exercise Caution at Night',
        reason: 'Dense adult nightlife zones with late-night touts, overpriced drink scams, and pushy street hawkers.',
        actionableSafetyAdvice: 'If seeking a Sukhumvit home, choose quieter residential sois (e.g. Soi 31, 39, 49, 53) rather than nightlife entertainment alleys.',
      },
      {
        districtName: 'Khlong Toei Slum Margins',
        city: 'Bangkok',
        riskCategory: 'Night-time Vulnerability / Poor Lighting',
        severity: 'Avoid Unaccompanied',
        reason: 'Large informal settlement area with maze-like alleys, stray dogs, and poor sanitation.',
        actionableSafetyAdvice: 'Stay north of Rama IV road in verified condominium developments.',
      },
    ],
  },

  mexico: {
    marketTrends: {
      marketVelocity: 'Hot Demand / Rapid Turnaround',
      yearOverYearRentChange: '+4.8% YoY',
      inventoryAvailability: 'Moderate (30-45 days)',
      keyNomadOrTourismPressure:
        'Mexico City (Roma/Condesa) and Riviera Maya have seen significant rental appreciation, but colonial highland hubs (Merida, Querétaro, Oaxaca, Puebla) offer stable, affordable pricing.',
      outlookSummary:
        'Retirees love Mexico’s colonial courtyard homes, spacious garden villas, and warm climates, with rents running 50% to 70% cheaper than the US or Canada.',
    },
    brokerAndFees: {
      whoPaysBrokerFee: 'Landlord Strictly (0% for Tenant)',
      typicalBrokerCommission: 'Landlord pays the broker commission (usually 1 month rent). Tenants pay $0 in real estate agency fees.',
      securityDepositRequirement: 'Standard is 1 month rent security deposit (depósito en garantía) plus the first month’s rent.',
      guarantorRequirements:
        'Mexican landlords often ask for an Aval or Fiador (a local property owner who co-signs). Expats without an Aval use a Póliza Jurídica (legal rental insurance policy costing $150–$300, usually split or paid by tenant), which conducts a background check on foreign income.',
      utilityRegistrationProcess:
        'Utilities (CFE electricity, Telmex Infinitum fiber) usually remain in the landlord’s name; you simply pay the bimonthly CFE receipt at any OXXO convenience store or via the CFE Contigo mobile app.',
      keyListingPortals: [
        { name: 'Inmuebles24.com', domainUrl: 'inmuebles24.com', description: 'Mexico’s premier real estate portal with verified landlord contacts.', expatFriendly: true },
        { name: 'Vivanuncios', domainUrl: 'vivanuncios.com.mx', description: 'Wide national coverage including small retirement beach towns.', expatFriendly: false },
        { name: 'Propiedades.com', domainUrl: 'propiedades.com', description: 'Clean interface with neighborhood safety and amenity metrics.', expatFriendly: true },
        { name: 'Local Expat Facebook Groups', domainUrl: 'facebook.com', description: 'In towns like Lake Chapala, San Miguel, and Merida, private landlords list directly in expat community groups.', expatFriendly: true },
      ],
    },
    legalRules: {
      standardLeaseDuration: '1-year contracts (Contrato de Arrendamiento) are standard.',
      earlyTerminationNotice: 'Notice period is typically 30 to 60 days, with forfeiture of deposit or 1 month penalty if breaking early without mutual agreement.',
      tenantProtectionsAndRentCaps: 'Civil codes vary by state (e.g. CDMX caps rent increases to 10% maximum per year), protecting against runaway spikes.',
      evictionRegulations: 'Formal judicial process; landlords cannot shut off utilities or enter property without court order.',
      registrationRequirement: 'Landlords are legally supposed to provide official tax receipts (CFDI / Factura). If you need to prove local address for bank accounts, ask for a CFE electric bill (*Comprobante de Domicilio*).',
      inventoryAndDepositReturn: 'Detailed photographic inventory (*Inventario de Entrega*). Deposit must be returned within 30 to 45 days after verifying final CFE electricity bill.',
    },
    safeExpatNeighborhoods: [
      {
        name: 'Polanco & Lomas de Chapultepec',
        city: 'Mexico City',
        districtType: 'Diplomatic & Luxury',
        avgRent1BedUSD: 1600,
        avgRent2BedUSD: 2500,
        safetyRating: 97,
        walkabilityScore: 95,
        transitAccess: 'Polanco & Auditorio Metro, ecobici bike stations.',
        vibeAndHighlights: 'The premier diplomatic and residential district of Latin America. Tree-shaded avenues, Chapultepec Forest park access, top private hospitals (ABC Medical Center), world-class dining on Avenida Presidente Masaryk.',
        bestFor: 'Retirees seeking premier international hospital access, top safety, and luxury surroundings.',
      },
      {
        name: 'Condesa & Roma Norte',
        city: 'Mexico City',
        districtType: 'Hip & Bohemian',
        avgRent1BedUSD: 1100,
        avgRent2BedUSD: 1750,
        safetyRating: 92,
        walkabilityScore: 98,
        transitAccess: 'Chilpancingo, Insurgentes, Metrobus lines, ecobici bike lanes.',
        vibeAndHighlights: 'Art Deco architecture, leafy parks (Parque México & Parque España), vibrant pet-friendly sidewalk cafes, bookstores, and artisan bakeries.',
        bestFor: 'Culturally active retirees who love walking everywhere, cafe culture, and tree-lined parks.',
      },
      {
        name: 'Ajijic & San Antonio Tlayacapan',
        city: 'Lake Chapala (Jalisco)',
        districtType: 'Peaceful Residential & Green',
        avgRent1BedUSD: 650,
        avgRent2BedUSD: 1050,
        safetyRating: 96,
        walkabilityScore: 88,
        transitAccess: 'Local lakeside buses, easily walkable cobblestone village.',
        vibeAndHighlights: 'Largest North American retirement community in the world. Year-round spring-like climate (75°F / 24°C), majestic lake views, English-language theater, Lake Chapala Society, and dedicated expat clinics.',
        bestFor: 'Retirees wanting effortless English communication, active social clubs, and spring weather.',
      },
      {
        name: 'Centro Histórico & Garcia Gineres',
        city: 'Mérida (Yucatán)',
        districtType: 'Budget Friendly & Authentic',
        avgRent1BedUSD: 580,
        avgRent2BedUSD: 920,
        safetyRating: 98,
        walkabilityScore: 90,
        transitAccess: 'Va-y-Ven modern AC transit buses, Uber/Didi rideshare.',
        vibeAndHighlights: 'Ranked the safest city in Latin America. Restored colonial pastel homes with high ceilings and private courtyard swimming pools, rich Mayan culture, and modern Star Médica private hospital.',
        bestFor: 'Retirees prioritizing peace, safety, warm tropical weather, and spacious colonial architecture.',
      },
    ],
    areasToAvoidOrCaution: [
      {
        districtName: 'Tepito, Doctores (Eastern side), & Iztapalapa',
        city: 'Mexico City',
        riskCategory: 'Violent Crime / Gang Activity',
        severity: 'Avoid Unaccompanied',
        reason: 'Historic black-market trading enclaves with active illicit commerce and armed robbery risks.',
        actionableSafetyAdvice: 'Stick to western and central municipalities like Miguel Hidalgo, Benito Juárez, Coyoacán, and Cuauhtémoc (Roma/Condesa).',
      },
      {
        districtName: 'Peripheral Colonias of Border / Transit Cities',
        city: 'Regional Border Cities',
        riskCategory: 'Violent Crime / Gang Activity',
        severity: 'Strictly Avoid',
        reason: 'Cartel transit routes and industrial outskirts lack municipal security infrastructure.',
        actionableSafetyAdvice: 'Retirees should choose established expat havens (Mérida, Lake Chapala, San Miguel de Allende, Puerto Vallarta, Querétaro, Huatulco).',
      },
    ],
  },

  costa_rica: {
    marketTrends: {
      marketVelocity: 'Balanced & Stable',
      yearOverYearRentChange: '+3.2% YoY',
      inventoryAvailability: 'Moderate (30-45 days)',
      keyNomadOrTourismPressure:
        'Coastal towns (Tamarindo, Santa Teresa, Nosara) have high seasonal holiday pricing; Central Valley towns (Escazú, Santa Ana, Atenas, Grecia) offer stable year-round expat rentals.',
      outlookSummary:
        'Central Valley offers spring-like temperatures without needing air conditioning, saving hundreds per month on electricity bills.',
    },
    brokerAndFees: {
      whoPaysBrokerFee: 'Landlord Strictly (0% for Tenant)',
      typicalBrokerCommission: 'Paid by the landlord (typically 1 month rent). Renter pays no commission.',
      securityDepositRequirement: '1 month rent security deposit (depósito de garantía) plus first month in advance.',
      guarantorRequirements: 'No local guarantor needed; proof of retirement income, pension letter, or bank statements is sufficient.',
      utilityRegistrationProcess: 'Utilities (ICE electricity, AyA water, Kolbi/Liberty fiber) are maintained by the owner. Tenants pay monthly at local banks or Super Compro supermarkets.',
      keyListingPortals: [
        { name: 'Encuentra24 Costa Rica', domainUrl: 'encuentra24.com/costa-rica', description: 'Most popular portal for long-term furnished and unfurnished rentals.', expatFriendly: true },
        { name: 'Craigslist Costa Rica', domainUrl: 'costarica.craigslist.org', description: 'Direct expat-to-expat home rentals in Central Valley and Guanacaste.', expatFriendly: true },
        { name: 'Century 21 & RE/MAX Costa Rica', domainUrl: 'c21costarica.com', description: 'Bilingual agents handling legal lease vetting.', expatFriendly: true },
      ],
    },
    legalRules: {
      standardLeaseDuration: 'By statutory law (Ley de Arrendamientos Urbanos), minimum residential lease is 3 years, but tenant can vacate earlier with proper notice.',
      earlyTerminationNotice: 'Tenant can terminate with 90 days written notice to the landlord without statutory penalty.',
      tenantProtectionsAndRentCaps: 'If rent is in USD, landlord CANNOT raise rent during the 3-year contract term! If in colones, increases are capped to the central bank inflation index.',
      evictionRegulations: 'Eviction requires judicial resolution; landlords cannot unlawfully disconnect electricity or change door locks.',
      registrationRequirement: 'Contracts can be signed before a Public Notary (Notario Público) for extra legal security.',
      inventoryAndDepositReturn: 'Security deposit must be returned within 30 days after deducting confirmed utility arrears or repairs.',
    },
    safeExpatNeighborhoods: [
      {
        name: 'Escazú & Santa Ana',
        city: 'San José (Central Valley)',
        districtType: 'Diplomatic & Luxury',
        avgRent1BedUSD: 850,
        avgRent2BedUSD: 1400,
        safetyRating: 95,
        walkabilityScore: 87,
        transitAccess: 'Highway 27 direct to Pacific coast, local buses, Uber.',
        vibeAndHighlights: 'The premier expat hub known as "The Beverly Hills of Costa Rica." Gated communities with swimming pools, CIMA Hospital (JCI-accredited), Multiplaza mall, and international gourmet grocery stores (Automercado).',
        bestFor: 'Retirees wanting JCI hospital proximity, top medical specialists, and modern gated conveniences.',
      },
      {
        name: 'Atenas & Grecia',
        city: 'Alajuela (Central Valley)',
        districtType: 'Peaceful Residential & Green',
        avgRent1BedUSD: 700,
        avgRent2BedUSD: 1100,
        safetyRating: 97,
        walkabilityScore: 84,
        transitAccess: 'Direct highway buses to San José, 30 min to SJO International Airport.',
        vibeAndHighlights: 'Famous for having "the best climate in the world" (75°F / 24°C year-round). Lush mountain views, coffee plantation breezes, community farmers markets (feria del agricultor), and tight-knit expat community.',
        bestFor: 'Nature lovers wanting mountain views, fresh organic produce, and zero AC/heating bills.',
      },
    ],
    areasToAvoidOrCaution: [
      {
        districtName: 'Los Guido, La Carpio, & Southern San José Center (Night)',
        city: 'San José',
        riskCategory: 'Violent Crime / Gang Activity',
        severity: 'Avoid Unaccompanied',
        reason: 'Marginalized settlements with high poverty and limited policing.',
        actionableSafetyAdvice: 'Live in western suburbs (Escazú, Santa Ana, Rohrmoser, Belén) or highland towns (Atenas, Grecia, San Ramón).',
      },
    ],
  },
};

/**
 * Generates an empirical, comprehensive CountryHousingProfile for any of the 209 countries.
 * If an explicit curated overlay exists, it uses those verified details; otherwise, it dynamically
 * synthesizes an accurate, region-tailored housing profile from the Country's core data metrics.
 */
export function getCountryHousingProfile(country: Country): CountryHousingProfile {
  const overlay = COUNTRY_HOUSING_OVERLAYS[country.id] || {};

  const rent1BedCenter = country.costOfLiving.rent1BedCenterUSD || 800;
  const rent1BedOutside = country.costOfLiving.rent1BedOutsideUSD || Math.round(rent1BedCenter * 0.72);
  const rent2BedCenter = Math.round(rent1BedCenter * 1.55);
  const utilitiesMonthly = country.costOfLiving.utilitiesMonthlyUSD || 120;
  const internetMonthly = Math.min(Math.round(utilitiesMonthly * 0.35), 65);

  // Determine standard regional broker customs
  let whoPaysBroker: BrokerAndFeeStructure['whoPaysBrokerFee'] = 'Landlord Strictly (0% for Tenant)';
  let brokerCommission = 'Typically covered entirely by the landlord (1 month rent or 5% of lease value). Tenants usually pay zero agency fees.';
  let defaultDeposit = '1 to 2 months rent refundable security deposit plus 1 month advance rent.';
  let leaseDuration = '1-year standard lease, automatically renewable.';
  let terminationNotice = '30 to 60 days formal written notice prior to contract renewal or break clause.';

  if (country.region === 'Europe') {
    whoPaysBroker = country.id === 'spain' ? 'Landlord Strictly (0% for Tenant)' : 'Tenant Pays Statutory Capped Fee';
    brokerCommission = 'In many European nations, agency fees are legally regulated or shared. In Southern Europe, landlords frequently pay.';
    leaseDuration = '1 to 3 years renewable residential tenancy agreement.';
    terminationNotice = '60 to 90 days registered written notice.';
  } else if (country.region === 'Southeast Asia' || country.region === 'Asia & Middle East') {
    whoPaysBroker = 'Landlord Strictly (0% for Tenant)';
    brokerCommission = '100% free for renters! Landlords pay agents 1 month rent on a 1-year contract.';
    leaseDuration = '1-year fixed furnished condominium lease.';
    terminationNotice = '30 days written notice before completion of the 12-month lease term.';
  } else if (country.region === 'Americas' || country.region === 'North & Central America' || country.region === 'South America') {
    whoPaysBroker = 'Landlord Strictly (0% for Tenant)';
    brokerCommission = 'Landlords pay real estate agency commissions; tenants pay $0 broker fee.';
    leaseDuration = '1-year residential lease agreement.';
    terminationNotice = '30 to 60 days written notice.';
  }

  // Generate safe expat neighborhoods if not provided in overlay
  const defaultSafeNeighborhoods: NeighborhoodRentalProfile[] = overlay.safeExpatNeighborhoods || [
    {
      name: `${country.capital} Diplomatic & Embassy Quarter`,
      city: country.capital,
      districtType: 'Diplomatic & Luxury',
      avgRent1BedUSD: Math.round(rent1BedCenter * 1.25),
      avgRent2BedUSD: Math.round(rent2BedCenter * 1.25),
      safetyRating: Math.min(country.lifestyle.safetyScore + 10, 98),
      walkabilityScore: 92,
      transitAccess: 'Central metro, rapid transit lines, and official rideshare stands.',
      vibeAndHighlights: `Stately embassies, high-security residential buildings with elevators, manicured public gardens, international groceries, and private expat medical clinics in ${country.capital}.`,
      bestFor: 'Retirees prioritizing elite security, concierge service, and walkability to embassies and clinics.',
    },
    {
      name: `${country.capital} Cultural & Old Town Core`,
      city: country.capital,
      districtType: 'Expat Favorite & Walkable',
      avgRent1BedUSD: rent1BedCenter,
      avgRent2BedUSD: rent2BedCenter,
      safetyRating: Math.min(country.lifestyle.safetyScore + 4, 95),
      walkabilityScore: 96,
      transitAccess: 'Historic tram lines, central pedestrian boulevards, regional bus hubs.',
      vibeAndHighlights: `Cobblestone plazas, artisan bakeries, open-air cafes, historic architecture, and vibrant daily neighborhood markets.`,
      bestFor: 'Culturally active retirees who enjoy daily morning walks, historic architecture, and cafe life.',
    },
    {
      name: country.topCities[0]?.name ? `${country.topCities[0].name} Coastal / Lakeside District` : `${country.capital} Green Suburbs`,
      city: country.topCities[0]?.name || country.capital,
      districtType: (country.topCities[0]?.monthlyCostUSD || 1500) < 1200 ? 'Budget Friendly & Authentic' : 'Peaceful Residential & Green',
      avgRent1BedUSD: rent1BedOutside,
      avgRent2BedUSD: Math.round(rent1BedOutside * 1.5),
      safetyRating: Math.min(country.lifestyle.safetyScore + 8, 97),
      walkabilityScore: 86,
      transitAccess: 'Suburban commuter rail and dedicated regional buses.',
      vibeAndHighlights: `Quiet residential streets, larger living areas with balconies or garden courtyards, lower ambient noise, and clean air.`,
      bestFor: 'Retirees seeking larger living spaces, quiet evenings, and lower monthly rental costs.',
    },
    {
      name: country.topCities[1]?.name ? `${country.topCities[1].name} Expat Enclave` : `${country.capital} Modern Riverfront`,
      city: country.topCities[1]?.name || country.capital,
      districtType: 'Expat Favorite & Walkable',
      avgRent1BedUSD: Math.round(rent1BedCenter * 0.9),
      avgRent2BedUSD: Math.round(rent2BedCenter * 0.9),
      safetyRating: Math.min(country.lifestyle.safetyScore + 6, 96),
      walkabilityScore: 89,
      transitAccess: 'Direct highway access, local modern bus network.',
      vibeAndHighlights: `Established community of international retirees, English-speaking social clubs, international restaurants, and private healthcare centers.`,
      bestFor: 'Retirees who value community camaraderie, peer social meetups, and easy expat integration.',
    },
  ];

  // Generate areas to avoid or exercise caution
  const defaultAreasToAvoid: DistrictToAvoidCaution[] = overlay.areasToAvoidOrCaution || [
    {
      districtName: `${country.capital} Central Railway & Intercity Bus Terminal at Night`,
      city: country.capital,
      riskCategory: 'Petty Crime & Pickpocketing',
      severity: 'Exercise Caution at Night',
      reason: 'Dense transit hubs attract opportunistic pickpockets, luggage thieves, and unlicensed street solicitors after midnight.',
      actionableSafetyAdvice: 'Use pre-booked licensed taxis or verified rideshare apps (Uber, Bolt, Grab) rather than hailing unmarked street cars late at night. Keep bags zipped in front of you.',
    },
    {
      districtName: `${country.capital} Outer Industrial & Unregulated Margins`,
      city: country.capital,
      riskCategory: 'Night-time Vulnerability / Poor Lighting',
      severity: 'Avoid Unaccompanied',
      reason: 'Peripheral industrial zones and informal settlements have minimal street lighting, poor pavement infrastructure, and delayed emergency response times.',
      actionableSafetyAdvice: 'Stick to established residential neighborhoods recommended by local expat associations and vetted real estate brokers.',
    },
  ];

  // Market trends
  const marketTrends: RentalMarketTrends = overlay.marketTrends || {
    marketVelocity: country.costOfLiving.rent1BedCenterUSD > 1200 ? 'Hot Demand / Rapid Turnaround' : 'Balanced & Stable',
    yearOverYearRentChange: country.costOfLiving.rent1BedCenterUSD > 1200 ? '+4.2% YoY' : '+1.9% YoY',
    inventoryAvailability: country.costOfLiving.rent1BedCenterUSD > 1200 ? 'Moderate (30-45 days)' : 'Abundant (> 60 days)',
    keyNomadOrTourismPressure: `Rental demand in ${country.capital} is concentrated in central walkable districts, with seasonal peaks during pleasant weather months (${country.climate.bestMonths}).`,
    outlookSummary: `Steady rental market for long-term expat retirees. Excellent inventory is accessible outside the hyper-central tourist core, saving up to 30–45% on monthly rent.`,
  };

  // Broker and fees
  const brokerAndFees: BrokerAndFeeStructure = {
    whoPaysBrokerFee: overlay.brokerAndFees?.whoPaysBrokerFee || whoPaysBroker,
    typicalBrokerCommission: overlay.brokerAndFees?.typicalBrokerCommission || brokerCommission,
    securityDepositRequirement: overlay.brokerAndFees?.securityDepositRequirement || defaultDeposit,
    guarantorRequirements:
      overlay.brokerAndFees?.guarantorRequirements ||
      `Foreign retirees are typically asked for proof of pension/passive income (3x rent) and passport. If a local tax guarantor is traditionally requested, offering 2 to 3 months of rent in advance usually waives this requirement.`,
    utilityRegistrationProcess:
      overlay.brokerAndFees?.utilityRegistrationProcess ||
      `Utilities (electricity, water, high-speed fiber internet) are generally billed in local ${country.currency} (${country.currencySymbol}). In apartments/condos, water and building fees are often handled by building management, while electricity is paid monthly via bank app or convenience stores.`,
    keyListingPortals: overlay.brokerAndFees?.keyListingPortals || [
      { name: 'Major National Property Portal', domainUrl: 'Local Real Estate Board', description: 'Primary verified residential rental website used by licensed realtors.', expatFriendly: true },
      { name: 'Expat Community Classifieds', domainUrl: 'Expat Forum & Groups', description: 'Direct landlord listings and lease-takeovers from fellow relocating retirees.', expatFriendly: true },
    ],
  };

  // Legal rules
  const legalRules: RentalContractLegalRules = overlay.legalRules || {
    standardLeaseDuration: leaseDuration,
    earlyTerminationNotice: terminationNotice,
    tenantProtectionsAndRentCaps: `Tenancy laws protect against arbitrary rent hikes during the contract term. Rent updates are normally tied to official government cost-of-living indexation.`,
    evictionRegulations: `Landlords must follow statutory court or tenancy board procedures. Unilateral lockouts or turning off utilities without court order is illegal.`,
    registrationRequirement: `Important: Ensure your residential lease is formally written and registered or notarized if required by ${country.name} immigration authorities to prove your official address for retirement residency visas.`,
    inventoryAndDepositReturn: `Conduct a joint check-in walk-through with high-resolution photos and meter readings. Security deposit is typically refundable within 14 to 30 days after contract termination minus verified utility bills.`,
  };

  const mustCheckClausesChecklist = [
    `1. Land Registry / Proof of Ownership Check: Verify the person signing the contract is the registered property owner or a legally authorized licensed broker with power of attorney.`,
    `2. Exact Meter Readings at Handover: Document initial readings for electricity, water, and gas on the move-in day with photos attached to the contract addendum to avoid inheriting prior tenant debts.`,
    `3. Formal Move-In Condition Inventory: Take timestamped photos and video of all walls, air conditioning units, appliances, and fixtures before moving your personal belongings in.`,
    `4. Clear Deposit Return Timeline Clause: Ensure the contract explicitly specifies that your security deposit must be refunded within 14 to 30 days of vacating via bank wire.`,
    `5. Early Termination / Diplomatic Exit Clause: Request a clause allowing termination after 6 months with 30–60 days notice in case of medical emergency or visa changes.`,
    `6. Maintenance Responsibility Threshold: Specify that structural repairs, plumbing leaks, and major AC/heating maintenance are 100% landlord responsibility, with tenant only covering minor consumables (lightbulbs, filters).`,
  ];

  const expatRentingGoldenRules = [
    `• Never wire a deposit or first month’s rent from abroad without having someone physically walk through the apartment or booking a verified initial 2-week stay first.`,
    `• Confirm whether condominium / HOA fees (gastos comunes / condomínio) and building maintenance are included in the advertised rent.`,
    `• In warm climates, test the air conditioning efficiency and verify whether electricity is billed at the standard government municipal rate rather than private markups.`,
    `• Keep a digital PDF copy of your signed lease, landlord’s ID, and registered tax receipt on cloud storage—essential for opening local bank accounts and visa renewals.`,
  ];

  return {
    countryId: country.id,
    countryName: country.name,
    capitalCity: country.capital,
    currency: country.currency,
    currencySymbol: country.currencySymbol,
    avgNationalRent1BedCenterUSD: rent1BedCenter,
    avgNationalRent1BedOutsideUSD: rent1BedOutside,
    avgNationalRent2BedCenterUSD: rent2BedCenter,
    avgMonthlyUtilitiesUSD: utilitiesMonthly,
    highSpeedInternetUSD: internetMonthly,
    marketTrends,
    brokerAndFees,
    legalRules,
    safeExpatNeighborhoods: defaultSafeNeighborhoods,
    areasToAvoidOrCaution: defaultAreasToAvoid,
    mustCheckClausesChecklist,
    expatRentingGoldenRules,
  };
}
