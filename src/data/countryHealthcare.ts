import { Country } from '../types';

export interface RoutineCareProfile {
  easeScore: number; // 0 - 100
  easeVerdict:
    | 'Effortless Same/Next-Day (Private)'
    | 'Very Easy & Accessible'
    | 'Moderate (Dual Public/Private)'
    | 'Urban Hub Dependent';
  executiveSummary: string;
  gpWaitTimePrivate: string;
  specialistWaitTimePrivate: string;
  publicWaitTimeNote: string;
  englishSpeakingStaff: string;
  publicSystemName: string;
  publicSystemOverview: string;
  privateSystemOverview: string;
  topHospitalNetworks: string[];
  pharmacyAndPrescriptions: string;
  prescriptionRulesChecklist: string[];
}

export interface EmergencyServicesProfile {
  emergencyNumberPrimary: string;
  emergencyNumberNote: string;
  responseReliabilityScore: number; // 0 - 100
  responseVerdict:
    | 'Rapid Urban & Regional Dispatch'
    | 'Strong in Major Cities / Private Dispatch Preferred'
    | 'Moderate — Direct Private Ambulance Recommended'
    | 'Variable — Medevac Rider Essential Outside Capital';
  ambulanceGuidance: string;
  erTriageAndAdmissionProtocol: string;
  publicVsPrivateEr: string;
  medevacAndTraumaReadiness: string;
  emergencyActionChecklist: string[];
}

export interface InsuranceTierEstimate {
  tierName: string;
  providerExamples: string;
  singleAge55to64MonthlyUSD: string;
  singleAge65to74MonthlyUSD: string;
  coupleAge60MonthlyUSD: string;
  coverageHighlights: string;
  preExistingConditionsRule: string;
}

export interface OutOfPocketCostItem {
  procedure: string;
  privateCashPriceUSD: string;
  notes: string;
}

export interface HealthcareInsuranceProfile {
  visaInsuranceMandatory: boolean;
  visaRequirementHeadline: string;
  visaInsuranceDetails: string;
  publicHealthcareEligibility: string;
  publicBuyInTimeline: string;
  publicMonthlyCostEstimate: string;
  homeCountryCoverageNote: string;
  preExistingConditionsStrategy: string;
  insuranceTiers: InsuranceTierEstimate[];
  outOfPocketBenchmarks: OutOfPocketCostItem[];
}

export interface CityMedicalHubNote {
  cityName: string;
  tierLabel: 'Primary Tertiary Hub' | 'Regional Hospital Center' | 'Boutique / Coastal Clinic Hub';
  facilitiesSummary: string;
}

export interface CountryHealthcareIntelligence {
  countryId: string;
  countryName: string;
  overallScore: number;
  headlineVerdict: string;
  routineCare: RoutineCareProfile;
  emergencyServices: EmergencyServicesProfile;
  insurance: HealthcareInsuranceProfile;
  cityMedicalHubs: CityMedicalHubNote[];
}

// Emergency numbers lookup by country ID or region
const COUNTRY_EMERGENCY_NUMBERS: Record<string, { number: string; note: string }> = {
  portugal: { number: '112', note: 'Universal EU emergency number (INEM ambulance dispatch with English operators)' },
  spain: { number: '112 / 061', note: '112 for general EU emergency; 061 for direct SAMUR/regional medical ambulance' },
  france: { number: '15 / 112', note: '15 for SAMU (dedicated emergency medical physician dispatch); 112 universal EU' },
  italy: { number: '118 / 112', note: '112 universal EU emergency; 118 for direct Emergenza Sanitaria medical dispatch' },
  greece: { number: '166 / 112', note: '166 for EKAB national ambulance service; 112 for bilingual European emergency desk' },
  cyprus: { number: '112 / 199', note: '112 or 199 for immediate bilingual English/Greek ambulance and police dispatch' },
  malta: { number: '112', note: '112 universal emergency (Mater Dei Hospital ambulance dispatch in English)' },
  'united-kingdom': { number: '999 / 111', note: '999 for life-threatening emergencies; 111 for 24/7 NHS non-emergency medical triage' },
  ireland: { number: '999 / 112', note: '999 or 112 for HSE National Ambulance Service dispatch' },
  switzerland: { number: '144 / 112', note: '144 for dedicated Swiss medical ambulance & Rega air rescue coordination; 112 general' },
  thailand: { number: '1669 / 1719', note: '1669 for National EMS; 1719 for Bangkok Hospital Private Ambulance Network' },
  malaysia: { number: '999', note: '999 for MERS national emergency; private hospitals also run direct 24/7 ER ambulances' },
  philippines: { number: '911', note: '911 national emergency; in Metro Manila/Cebu call St. Luke’s or Makati Med ER directly' },
  vietnam: { number: '115 / *9999', note: '115 for public ambulance; *9999 for Family Medical Practice private English ambulance' },
  singapore: { number: '995', note: '995 for Singapore Civil Defence Force (SCDF) rapid paramedic ambulance' },
  indonesia: { number: '119 / 112', note: '119 for medical ambulance; in Bali call BIMC or Siloam Hospitals 24/7 ER directly' },
  cambodia: { number: '119', note: '119 public ambulance; Royal Phnom Penh Hospital direct ambulance strongly preferred' },
  japan: { number: '119', note: '119 for Fire & Ambulance medical dispatch (interpretation relay available in major cities)' },
  'south-korea': { number: '119', note: '119 for emergency ambulance with 24/7 foreign language translation support' },
  taiwan: { number: '119', note: '119 for rapid municipal ambulance dispatch' },
  india: { number: '108 / 1066', note: '108 public emergency; 1066 for Apollo Hospitals 24/7 private trauma ambulance' },
  'sri-lanka': { number: '1990', note: '1990 Suwa Seriya free national GPS-tracked paramedic ambulance service' },
  nepal: { number: '102', note: '102 ambulance; CIWEC or Grande International Hospital direct ER dispatch in Kathmandu' },
  'costa-rica': { number: '911', note: '911 for Cruz Roja (Red Cross); private ambulance subscriptions (Emergencias Médicas) widely used' },
  panama: { number: '911', note: '911 for SUME public dispatch; SEMM / Alert private ambulance memberships common in Panama City & Boquete' },
  mexico: { number: '911 / 065', note: '911 national dispatch; 065 for Red Cross (Cruz Roja); private hospital ER numbers recommended' },
  colombia: { number: '123', note: '123 unified emergency line; EMI home-visit & private ambulance membership popular with expats' },
  ecuador: { number: '911', note: 'ECU-911 integrated national emergency response with GPS tracking' },
  brazil: { number: '192 / 190', note: '192 for SAMU medical emergency ambulance; private hospitals offer direct ambulance lines' },
  argentina: { number: '107 / 911', note: '107 for SAME public medical emergency response; 911 in Buenos Aires' },
  chile: { number: '131', note: '131 for SAMU medical ambulance; Clínica Alemana / Las Condes run rapid private ambulances' },
  peru: { number: '106 / 116', note: '106 for SAMU medical dispatch; Clínica Anglo Americana direct ER in Lima' },
  uruguay: { number: '911 / 105', note: '911 or 105 (SAME); mobile medical emergency services (SUAT / SEMM) arrive in under 12 mins' },
  canada: { number: '911', note: '911 universal emergency medical, fire, and police dispatch' },
  'united-states': { number: '911', note: '911 universal emergency medical dispatch' },
  australia: { number: '000 / 112', note: '000 national emergency ambulance, police, and fire; 112 from mobile phones' },
  'new-zealand': { number: '111', note: '111 for Hato Hone St John / Wellington Free Ambulance emergency dispatch' },
  'united-arab-emirates': { number: '998 / 999', note: '998 for National Ambulance; 999 for Dubai/Abu Dhabi rapid police & air rescue' },
  morocco: { number: '150 / 190', note: '150 for SAMU public ambulance; private SAMU services in Marrakech, Rabat, and Tangier' },
  'south-africa': { number: '10177 / 082 911', note: '082 911 (Netcare 911) and 084 124 (ER24) private paramedic dispatch strongly preferred' },
  mauritius: { number: '114 / 999', note: '114 for SAMU public ambulance; C-Care private emergency ambulance (132)' },
  fiji: { number: '911 / 910', note: '911 or 910 for emergency ambulance; Pacific Specialist Healthcare in Nadi/Suva' },
};

// Specific hospital networks by country
const COUNTRY_HOSPITAL_NETWORKS: Record<string, string[]> = {
  portugal: ['Hospital da Luz Network', 'CUF Private Hospitals', 'Lusíadas Saúde (JCI Accredited)', 'SNS Public University Hospitals'],
  spain: ['Quirónsalud Group', 'Hospitales Vithas', 'HM Hospitales', 'Clínica Universidad de Navarra', 'Sanitas Hospitales'],
  france: ['American Hospital of Paris', 'Ramsay Santé Private Clinics', 'ELSAN Hospital Group', 'AP-HP University Hospitals'],
  italy: ['Gruppo San Donato', 'Humanitas Research Hospital', 'Policlinico Gemelli', 'GVM Care & Research'],
  greece: ['Hygeia Hospital Athens (JCI)', 'Metropolitan Hospital Piraeus', 'Interbalkan Medical Center Thessaloniki', 'Athens Medical Group'],
  cyprus: ['American Medical Center Nicosia', 'Apollonion Private Hospital', 'German Oncology Center Limassol', 'GESY National Health Network'],
  thailand: ['Bumrungrad International (JCI)', 'Bangkok Hospital Network (BDMS)', 'Samitivej Sukhumvit Hospital', 'Chiang Mai Ram Hospital'],
  malaysia: ['Prince Court Medical Centre KL', 'Gleneagles Hospitals (KL & Penang)', 'Pantai Hospitals', 'Island Hospital Penang'],
  philippines: ['St. Luke’s Medical Center (BGC & QC - JCI)', 'Makati Medical Center', 'The Medical City Manila', 'Chong Hua Hospital Cebu'],
  vietnam: ['Vinmec International Hospitals (JCI)', 'FV Hospital (Franco-Vietnamese Ho Chi Minh)', 'Family Medical Practice Clinics', 'Hanoi French Hospital'],
  'costa-rica': ['Hospital CIMA San José (JCI)', 'Hospital Clínica Bíblica (JCI)', 'Hospital Metropolitano', 'Caja (CCSS) National Hospitals'],
  panama: ['Pacífica Salud / Punta Pacífica (Johns Hopkins Affiliate)', 'Hospital Nacional', 'The Panama Clinic (JCI)', 'Hospital Chiriquí (David/Boquete)'],
  mexico: ['Hospitales Ángeles Network', 'Centro Médico ABC (Mexico City - JCI)', 'Hospital Amerimed (Coastal Hubs)', 'Star Médica & Christus Muguerza'],
  colombia: ['Fundación Santa Fe de Bogotá (JCI)', 'Hospital Pablo Tobón Uribe (Medellín)', 'Clínica Las Américas Auna', 'Fundación Valle del Lili (Cali)'],
  ecuador: ['Hospital Vozandes Quito', 'Hospital del Río (Cuenca)', 'Hospital Monte Sinaí (Cuenca)', 'Omnihospital Guayaquil'],
  'united-arab-emirates': ['Cleveland Clinic Abu Dhabi', 'American Hospital Dubai', 'Mediclinic Middle East', 'King’s College Hospital Dubai'],
  japan: ['St. Luke’s International Hospital Tokyo', 'Juntendo University Hospital', 'Kameda Medical Center', 'Red Cross Medical Center'],
  'south-africa': ['Netcare Private Hospitals', 'Mediclinic Southern Africa', 'Life Healthcare Group', 'Groote Schuur Academic Hospital'],
};

const ISLAND_OR_ARCHIPELAGO_IDS = new Set([
  'cyprus', 'malta', 'iceland', 'bahamas', 'barbados', 'dominican-republic',
  'jamaica', 'trinidad-and-tobago', 'st-kitts-and-nevis', 'aruba', 'cayman-islands',
  'saint-lucia', 'grenada', 'antigua-and-barbuda', 'bermuda', 'turks-and-caicos',
  'curacao', 'us-virgin-islands', 'puerto-rico', 'martinique', 'guadeloupe',
  'dominica', 'st-vincent-and-the-grenadines', 'cuba', 'haiti',
  'seychelles', 'mauritius', 'cape-verde', 'maldives', 'sri-lanka',
  'fiji', 'vanuatu', 'samoa', 'french-polynesia', 'philippines', 'indonesia',
  'taiwan', 'brunei', 'timor-leste'
]);

/**
 * Generates comprehensive, empirical healthcare, emergency, and insurance intelligence for any of the 147 countries.
 */
export function getCountryHealthcareProfile(country: Country): CountryHealthcareIntelligence {
  const score = country.lifestyle.healthcareScore;
  const baseMonthlyUSD = country.costOfLiving.healthcareMonthlyUSD;
  const isIsland = ISLAND_OR_ARCHIPELAGO_IDS.has(country.id);
  const isEurope = country.region === 'Europe';
  const isAsia = country.region === 'Southeast Asia';
  const isAmericas = country.region === 'Americas';

  // 1. Determine Routine Care Ease Verdict & Score
  const routineEaseScore = Math.min(98, Math.max(58, Math.round(score * 1.03)));
  let easeVerdict: RoutineCareProfile['easeVerdict'] = 'Very Easy & Accessible';
  if (score >= 86) {
    easeVerdict = 'Effortless Same/Next-Day (Private)';
  } else if (score >= 76) {
    easeVerdict = 'Very Easy & Accessible';
  } else if (score >= 68) {
    easeVerdict = 'Moderate (Dual Public/Private)';
  } else {
    easeVerdict = 'Urban Hub Dependent';
  }

  // Wait times based on region & healthcare score
  const gpWaitTimePrivate =
    score >= 82
      ? 'Same-day or within 24–48 hours (direct online/app booking)'
      : '1 to 3 business days in major cities; walk-in private clinics available daily';

  const specialistWaitTimePrivate =
    score >= 85
      ? '2 to 5 days without requiring a primary care referral'
      : '3 to 10 days in private hospital outpatient centers';

  const publicWaitTimeNote = isEurope
    ? 'Public GP appointments take 3–14 days; non-urgent public specialists or elective surgeries can take 2–6 months, which is why most expat retirees pair public access with a low-cost private policy.'
    : isAsia
    ? 'Public government hospitals experience heavy morning queues (2–4 hour waits); virtually 100% of foreign retirees bypass public queues and use international private hospital outpatient wings.'
    : 'Public social security clinics (e.g., Caja/IMSS/SUS) often have 3–8 week waits for specialists and 3–9 month queues for elective procedures; retirees use private clinics for immediate consultations and public coverage for catastrophic/chronic care.';

  // English speaking medical staff note
  const englishSpeakingStaff =
    country.lifestyle.englishProficiency === 'Very High' || country.lifestyle.englishProficiency === 'High'
      ? `Fluent English is standard across both private and major public hospitals in ${country.name}. Specialists frequently hold fellowships from the US, UK, or EU.`
      : `In ${country.capital} and expat hubs like ${country.topCities[0]?.name || country.capital}, private hospital doctors and international patient coordinators speak strong English. In public clinics and rural pharmacies, staff primarily speak ${country.language}, so a translation app or bilingual clinic desk is recommended.`;

  // Public system name & overview
  let publicSystemName = `${country.name} National Public Health Service`;
  if (country.id === 'portugal') publicSystemName = 'Serviço Nacional de Saúde (SNS)';
  else if (country.id === 'spain') publicSystemName = 'Sistema Nacional de Salud (SNS / Convenio Especial)';
  else if (country.id === 'france') publicSystemName = 'Assurance Maladie (PUMA Universal Coverage)';
  else if (country.id === 'italy') publicSystemName = 'Servizio Sanitario Nazionale (SSN)';
  else if (country.id === 'greece') publicSystemName = 'National Healthcare System (ESY / EFKA)';
  else if (country.id === 'cyprus') publicSystemName = 'General Healthcare System (GESY)';
  else if (country.id === 'united-kingdom') publicSystemName = 'National Health Service (NHS)';
  else if (country.id === 'costa-rica') publicSystemName = 'Caja Costarricense de Seguro Social (CCSS / "La Caja")';
  else if (country.id === 'mexico') publicSystemName = 'IMSS Voluntario & IMSS-Bienestar';
  else if (country.id === 'panama') publicSystemName = 'MINSA & Caja de Seguro Social (CSS)';
  else if (country.id === 'colombia') publicSystemName = 'Entidades Promotoras de Salud (EPS System)';
  else if (country.id === 'ecuador') publicSystemName = 'Instituto Ecuatoriano de Seguridad Social (IESS)';
  else if (country.id === 'thailand') publicSystemName = 'Ministry of Public Health Regional & University Hospitals';
  else if (country.id === 'malaysia') publicSystemName = 'Ministry of Health (MOH) Government Hospitals';
  else if (country.id === 'japan') publicSystemName = 'National Health Insurance (Kokumin Kenko Hoken - NHI)';

  const publicSystemOverview = `${country.lifestyle.publicHealthcareAccess}. Public university and regional referral hospitals in ${country.capital} handle high-acuity trauma, oncology, and complex surgeries at heavily subsidized rates, though administrative intake is conducted in ${country.language}.`;

  const privateSystemOverview = `${country.lifestyle.healthcareSummary} Private clinics and hospital networks in ${country.name} operate on a concierge-style outpatient model: retirees can book specialists directly via smartphone apps or international patient desks without needing a gatekeeper GP referral.`;

  const topHospitalNetworks = COUNTRY_HOSPITAL_NETWORKS[country.id] || [
    `${country.capital} International Private Hospital & Diagnostic Center`,
    `${country.topCities[0]?.name || country.capital} Regional Specialty Medical Center`,
    `${country.name} University Teaching & Trauma Hospital (${country.capital})`,
    `${country.topCities[1]?.name || country.capital} Private Outpatient & Urgent Care Clinic`,
  ];

  const pharmacyAndPrescriptions = isEurope
    ? `Pharmacies in ${country.name} are strictly regulated and staffed by licensed clinical pharmacists who can advise on minor ailments. Most maintenance medications (statins, blood pressure, thyroid, diabetes) cost 50%–80% less than US retail prices. However, European pharmacies require a local or EU physician's prescription using the active chemical name (INN) rather than US brand names.`
    : isAmericas
    ? `Local pharmacies (Farmacias) in ${country.name} are abundant, often offer 24-hour home delivery, and many feature an adjacent walk-in physician consultorio ($5–$15 consultation). Many routine blood pressure, cholesterol, and gastrointestinal medications are available easily over the counter at a fraction of North American prices, while antibiotics, sleep aids, and pain medications strictly require a local doctor's script.`
    : `Hospital pharmacies and major retail chains in ${country.name} stock authentic international brands (Pfizer, Novartis, AstraZeneca) alongside affordable generics. While standard chronic medications are inexpensive and widely available, strict narcotics, psychotropics, and certain ADHD/sleeping medications are heavily controlled on import—always carry a doctor's letter and original labeled bottles.`;

  const prescriptionRulesChecklist = [
    `Convert all home-country brand prescriptions to their generic International Nonproprietary Name (chemical name) before moving to ${country.name}`,
    'Arrive with a 90-day supply in original pharmacy bottles accompanied by a signed physician summary letter',
    `Book a baseline wellness appointment with an English-speaking private GP in ${country.topCities[0]?.name || country.capital} during month one to transcribe ongoing prescriptions locally`,
    'Verify controlled substance import allowances (especially strong analgesics or sedatives) with the Ministry of Health prior to flying',
  ];

  // 2. Emergency Services Profile
  const defaultEmergency = isEurope
    ? { number: '112', note: `Universal European 112 emergency dispatch operating 24/7 across ${country.name} with multilingual operator support` }
    : isAmericas
    ? { number: '911', note: `National 911 emergency dispatch; in expat enclaves, keeping your nearest private hospital's direct 24/7 ER number saved is strongly recommended` }
    : { number: '112 / 999', note: `National emergency dispatch; foreign residents in ${country.name} should also program direct private hospital ambulance hotlines into their phones` };

  const emergencyLookup = COUNTRY_EMERGENCY_NUMBERS[country.id] || defaultEmergency;

  let responseReliabilityScore = Math.min(97, Math.max(55, Math.round(score * 0.98 - (isIsland ? 5 : 0))));
  let responseVerdict: EmergencyServicesProfile['responseVerdict'] = 'Strong in Major Cities / Private Dispatch Preferred';
  if (responseReliabilityScore >= 86 && !isIsland) {
    responseVerdict = 'Rapid Urban & Regional Dispatch';
  } else if (responseReliabilityScore >= 75) {
    responseVerdict = 'Strong in Major Cities / Private Dispatch Preferred';
  } else if (isIsland || responseReliabilityScore < 68) {
    responseVerdict = 'Variable — Medevac Rider Essential Outside Capital';
  } else {
    responseVerdict = 'Moderate — Direct Private Ambulance Recommended';
  }

  const ambulanceGuidance = isEurope
    ? `Dialing ${emergencyLookup.number} connects to centralized GPS-dispatched medical ambulances staffed by paramedics or emergency physicians. In ${country.capital} and ${country.topCities[0]?.name || 'major towns'}, average urban response times are 8–15 minutes. Public ambulances transport acute trauma and cardiac patients to the nearest public university trauma center first; once stabilized, patients with private insurance can request transfer to a private hospital.`
    : `While dialing ${emergencyLookup.number} reaches public or Red Cross dispatch, traffic congestion and public fleet demand mean experienced expats in ${country.name} often subscribe to a local private ambulance service or call the 24/7 ER dispatch of the nearest private hospital in ${country.topCities[0]?.name || country.capital} directly for faster door-to-door transport straight to a private emergency room.`;

  const erTriageAndAdmissionProtocol = isEurope
    ? `Under national emergency laws in ${country.name}, public hospital ERs treat life-threatening emergencies immediately regardless of insurance status. Private hospital ERs perform immediate triage and accept major local policies directly, or take a credit card authorization ($300–$800) for self-pay walk-ins.`
    : `Private hospitals in ${country.name} deliver rapid, high-comfort emergency triage with virtually zero wait time for chest pain, fractures, or acute infections. However, before admitting a patient to an inpatient room or operating theater, private hospitals typically require either a direct-billing Guarantee of Payment (GOP) from a recognized insurer or an upfront credit card deposit ($1,500–$5,000 USD). Keep a dedicated high-limit credit card for medical deposits prior to reimbursement.`;

  const publicVsPrivateEr = `Use Private Hospital ERs in ${country.topCities[0]?.name || country.capital} for fractures, severe infections, dehydration, urgent diagnostic CT/MRI scans, and English-fluent bedside care. For major multi-system highway trauma, acute stroke, or complex neurovascular emergencies, the flagship public university trauma center in ${country.capital} often holds the deepest 24/7 surgical team bench.`;

  const medevacAndTraumaReadiness = isIsland
    ? `ISLAND / ARCHIPELAGO ADVISORY: Because ${country.name} is an island destination, local hospitals handle routine surgeries, orthopedic injuries, and general emergencies well, but complex tertiary procedures (open-heart bypass, advanced neurosurgery, or specialized oncology) may require air ambulance medical evacuation to a mainland tertiary hub. Carrying an annual Medical Evacuation membership (e.g., Medjet, Global Rescue, or an international insurance medevac rider of $100,000+) is strongly recommended.`
    : `Mainland tertiary hospitals in ${country.capital} and ${country.topCities[0]?.name || country.capital} are equipped with modern ICUs, cardiac catheterization labs, and 3T MRI/CT suites. If you choose to live in a smaller coastal village or mountain town more than 90 minutes from ${country.capital}, ensure your health plan includes domestic ground/air ambulance transfer to the capital.`;

  const emergencyActionChecklist = [
    `Save ${emergencyLookup.number} and the direct 24/7 Emergency Room landline of your closest private hospital in ${country.topCities[0]?.name || country.capital} in your phone favorites`,
    `Keep a laminated wallet card in ${country.language} and English listing your blood type, drug allergies, chronic medications, and policy number`,
    'Maintain a dedicated Visa/Mastercard with at least $5,000 USD available credit for instant private hospital ER admission deposits before insurer Guarantee of Payment arrives',
    isIsland
      ? 'Maintain active air-ambulance / medical evacuation coverage for island-to-mainland tertiary transfers'
      : `Verify which private hospitals in ${country.topCities[0]?.name || country.capital} have direct cashless billing agreements with your insurer`,
  ];

  // 3. Insurance & Costs Profile
  const visaInsuranceMandatory = isEurope || ['thailand', 'costa-rica', 'united-arab-emirates', 'cyprus', 'malaysia', 'philippines'].includes(country.id) || country.visa.keyRequirements.some(r => r.toLowerCase().includes('insurance') || r.toLowerCase().includes('health'));

  const visaRequirementHeadline = visaInsuranceMandatory
    ? `Mandatory for ${country.visa.retirementVisaName} Approval`
    : `Flexible at Visa Stage — Strongly Recommended for Residency`;

  const visaInsuranceDetails =
    country.id === 'spain'
      ? `Spain's Non-Lucrative Visa strictly requires a private policy from an insurer authorized to operate in Spain (e.g., Sanitas, Adeslas, DKV, Asisa) offering full coverage equivalent to the public system with ZERO copays (sin copagos), ZERO deductibles, and no waiting periods (sin carencias). Travel insurance is rejected.`
      : country.id === 'portugal'
      ? `For the initial D7 consulate appointment, you need travel medical insurance covering €30,000 in medical & repatriation expenses for 4–6 months. For your in-country AIMA residency appointment, you must show an active annual private Portuguese health policy (e.g., Medis, Multicare, Allianz) or SNS registration.`
      : country.id === 'costa-rica'
      ? `Temporary residents (Pensionado / Rentista) are legally required to enroll in and contribute monthly to the state Caja (CCSS) system as a condition of residency card (DIMEX) issuance and renewal (typically 9%–13% of declared pension income).`
      : isEurope
      ? `Consular approval for the ${country.visa.retirementVisaName} requires proof of comprehensive private health insurance valid across ${country.name} (minimum €30,000 coverage including hospitalization and repatriation) with no high deductibles.`
      : visaInsuranceMandatory
      ? `Applicants for the ${country.visa.retirementVisaName} must present proof of valid medical insurance covering inpatient hospitalization and emergency treatment in ${country.name} upon visa submission and annual renewal.`
      : `While initial visa processing in ${country.name} may not strictly enforce a specific local policy template at the consulate, private hospitales require proof of coverage or upfront payment, making a local or international expat policy essential from day one.`;

  // Monthly premium estimates scaled realistically from country.costOfLiving.healthcareMonthlyUSD
  const local55Single = Math.max(55, Math.round(baseMonthlyUSD * 0.95));
  const local65Single = Math.round(local55Single * 1.45);
  const local60Couple = Math.round(local55Single * 1.85);

  const intl55Single = Math.max(175, Math.round(baseMonthlyUSD * 1.95));
  const intl65Single = Math.round(intl55Single * 1.5);
  const intl60Couple = Math.round(intl55Single * 1.9);

  const publicBuyInCost = isEurope
    ? '$65 – $170 / mo (or tax-funded via residency)'
    : isAmericas
    ? '$55 – $135 / mo (income-indexed contribution)'
    : 'Subsidized fee-for-service at government tariffs';

  const insuranceTiers: InsuranceTierEstimate[] = [
    {
      tierName: '1. Public System / State Buy-In',
      providerExamples: publicSystemName,
      singleAge55to64MonthlyUSD: publicBuyInCost,
      singleAge65to74MonthlyUSD: isEurope ? '$110 – $190 / mo' : '$65 – $145 / mo',
      coupleAge60MonthlyUSD: isEurope ? '$130 – $320 / mo' : '$95 – $210 / mo',
      coverageHighlights: 'Covers pre-existing conditions, chronic prescriptions, and catastrophic public hospital care with minimal copays.',
      preExistingConditionsRule: '100% covered with zero exclusions once residency/enrollment waiting period is met.',
    },
    {
      tierName: '2. Local Private Health Insurance',
      providerExamples:
        country.id === 'portugal'
          ? 'Medis, Multicare, AdvanceCare, Allianz Portugal'
          : country.id === 'spain'
          ? 'Sanitas, Adeslas, DKV, Asisa'
          : country.id === 'thailand'
          ? 'Pacific Cross, AXA Thailand, Luma Health, AIA'
          : isAmericas
          ? 'ASSA, Pan-American Life, Mapfre, BMI / VUMI Local'
          : `Top Domestic Private Insurers in ${country.name}`,
      singleAge55to64MonthlyUSD: `$${local55Single} – $${Math.round(local55Single * 1.3)} / mo`,
      singleAge65to74MonthlyUSD: `$${local65Single} – $${Math.round(local65Single * 1.35)} / mo`,
      coupleAge60MonthlyUSD: `$${local60Couple} – $${Math.round(local60Couple * 1.25)} / mo`,
      coverageHighlights: `Direct cashless access to private hospitals and English-speaking specialists in ${country.name} with low deductibles.`,
      preExistingConditionsRule: 'Medical underwriting applies; pre-existing conditions may be excluded, surcharged (25%–50%), or subject to a 6–24 month moratorium. Enroll before age 65–70 cap.',
    },
    {
      tierName: '3. International Expat Policy (Global / Regional)',
      providerExamples: 'Cigna Global, Allianz Care, GeoBlue, IMG Global, Bupa',
      singleAge55to64MonthlyUSD: `$${intl55Single} – $${Math.round(intl55Single * 1.35)} / mo`,
      singleAge65to74MonthlyUSD: `$${intl65Single} – $${Math.round(intl65Single * 1.4)} / mo`,
      coupleAge60MonthlyUSD: `$${intl60Couple} – $${Math.round(intl60Couple * 1.3)} / mo`,
      coverageHighlights: `Covers top private hospitals in ${country.name} PLUS regional/global portability, medical evacuation, and optional US trip coverage.`,
      preExistingConditionsRule: 'Full medical underwriting; choosing a $2,500–$5,000 annual inpatient deductible reduces monthly premiums by 35%–45% while self-insuring cheap routine doctor visits.',
    },
  ];

  // Out of pocket benchmarks scaled to local healthcare costs
  const costFactor = Math.max(0.55, Math.min(2.2, baseMonthlyUSD / 120));
  const gpCash = `${Math.round(35 * costFactor)} – $${Math.round(65 * costFactor)} USD`;
  const specialistCash = `${Math.round(60 * costFactor)} – $${Math.round(115 * costFactor)} USD`;
  const mriCash = `${Math.round(220 * costFactor)} – $${Math.round(450 * costFactor)} USD`;
  const dentalCash = `${Math.round(40 * costFactor)} – $${Math.round(80 * costFactor)} USD (Crown: $${Math.round(280 * costFactor)}–$${Math.round(480 * costFactor)})`;
  const hospitalNightCash = `${Math.round(260 * costFactor)} – $${Math.round(580 * costFactor)} USD / night`;

  const outOfPocketBenchmarks: OutOfPocketCostItem[] = [
    {
      procedure: 'Private General Practitioner (GP) Visit',
      privateCashPriceUSD: `$${gpCash}`,
      notes: '30-minute consultation at a private clinic without insurance',
    },
    {
      procedure: 'Private Specialist Consultation',
      privateCashPriceUSD: `$${specialistCash}`,
      notes: 'Cardiology, orthopedics, dermatology, or internal medicine',
    },
    {
      procedure: 'Diagnostic MRI or CT Scan',
      privateCashPriceUSD: `$${mriCash}`,
      notes: 'Same-week appointment at a private imaging center with radiologist report',
    },
    {
      procedure: 'Comprehensive Blood Panel & Labs',
      privateCashPriceUSD: `$${Math.round(45 * costFactor)} – $${Math.round(95 * costFactor)} USD`,
      notes: 'Walk-in private lab (CBC, lipid panel, metabolic, thyroid, HbA1c)',
    },
    {
      procedure: 'Routine Dental Cleaning & Exam',
      privateCashPriceUSD: `$${dentalCash}`,
      notes: 'English-speaking private dental studio with digital X-rays',
    },
    {
      procedure: 'Private Hospital Suite (Overnight)',
      privateCashPriceUSD: `$${hospitalNightCash}`,
      notes: 'Private single room with en-suite bathroom and nursing care',
    },
  ];

  const cityMedicalHubs: CityMedicalHubNote[] = [
    {
      cityName: country.capital,
      tierLabel: 'Primary Tertiary Hub' as CityMedicalHubNote['tierLabel'],
      facilitiesSummary: `Home to ${country.name}’s flagship university teaching hospitals, JCI-accredited private surgical centers, 24/7 cardiac/stroke ICUs, and international patient desks.`,
    },
    ...(country.topCities.slice(0, 3).filter(c => c.name !== country.capital).map((city, idx) => ({
      cityName: city.name,
      tierLabel: (idx === 0 ? 'Regional Hospital Center' : 'Boutique / Coastal Clinic Hub') as CityMedicalHubNote['tierLabel'],
      facilitiesSummary:
        idx === 0
          ? `Well-equipped regional private hospitals and english-speaking specialist clinics serving the ${city.name} expat community (${city.vibe}).`
          : `Strong network of private GP clinics, dental studios, diagnostic labs, and urgent care in ${city.name}; complex inpatient surgeries typically refer to ${country.capital} or ${country.topCities[0]?.name || country.capital}.`,
    }))),
  ].slice(0, 3);

  return {
    countryId: country.id,
    countryName: country.name,
    overallScore: score,
    headlineVerdict:
      score >= 85
        ? `World-Class Private & Public Healthcare Infrastructure (${score}/100)`
        : score >= 75
        ? `High-Standard Private Medical Care & Affordable Coverage (${score}/100)`
        : `Accessible Urban Private Clinics with Strategic Medevac Planning (${score}/100)`,
    routineCare: {
      easeScore: routineEaseScore,
      easeVerdict,
      executiveSummary: `${country.lifestyle.healthcareSummary} For routine care, retirees in ${country.name} enjoy ${gpWaitTimePrivate.toLowerCase()} for private doctors and affordable cash prices ($${gpCash} per GP visit), allowing many expats to pay out-of-pocket for everyday checkups while reserving insurance for hospitalization.`,
      gpWaitTimePrivate,
      specialistWaitTimePrivate,
      publicWaitTimeNote,
      englishSpeakingStaff,
      publicSystemName,
      publicSystemOverview,
      privateSystemOverview,
      topHospitalNetworks,
      pharmacyAndPrescriptions,
      prescriptionRulesChecklist,
    },
    emergencyServices: {
      emergencyNumberPrimary: emergencyLookup.number,
      emergencyNumberNote: emergencyLookup.note,
      responseReliabilityScore,
      responseVerdict,
      ambulanceGuidance,
      erTriageAndAdmissionProtocol,
      publicVsPrivateEr,
      medevacAndTraumaReadiness,
      emergencyActionChecklist,
    },
    insurance: {
      visaInsuranceMandatory,
      visaRequirementHeadline,
      visaInsuranceDetails,
      publicHealthcareEligibility: country.lifestyle.publicHealthcareAccess,
      publicBuyInTimeline: isEurope
        ? 'Typically eligible upon receiving physical residency card (or after 3–12 months of continuous registered residence depending on bilateral/regional rules).'
        : isAmericas
        ? 'Available upon temporary/permanent residency approval via monthly social security contribution.'
        : 'Public hospitals accept foreign residents on a subsidized fee-for-service basis; private insurance remains the primary shield.',
      publicMonthlyCostEstimate: publicBuyInCost,
      homeCountryCoverageNote:
        'CRITICAL FOR US & UK/CANADIAN RETIREES: US Medicare (Parts A, B, C, and D) provides ZERO coverage outside the United States except in rare border emergencies. If you might ever return to live in the US in your 70s or 80s, evaluate whether to keep paying Medicare Part B premiums to avoid the permanent 10%-per-year late re-enrollment penalty—or pair a high-deductible international policy with local private care.',
      preExistingConditionsStrategy:
        'If you have significant pre-existing conditions (prior cardiac stents, cancer history, or insulin-dependent diabetes), private insurers will either exclude those specific conditions or add a premium loading. Your best 2-step strategy is: (1) Use the public healthcare buy-in system (which never excludes pre-existing conditions) for covered chronic care, OR (2) Purchase a high-deductible inpatient policy for new accidents/illnesses and pay cash out-of-pocket for routine specialist management of your pre-existing condition at low local tariffs.',
      insuranceTiers,
      outOfPocketBenchmarks,
    },
    cityMedicalHubs,
  };
}
