import { INITIAL_COUNTRIES } from './countries';
import { getCountryNomadProfile } from './countryNomadProfiles';
import {
  APEC_CODES,
  ASEAN_CODES,
  CA4_CODES,
  CARICOM_CODES,
  CIS_VISA_FREE_CODES,
  EAC_CODES,
  ECOWAS_CODES,
  EEA_EFTA_CODES,
  EU_CODES,
  GCC_CODES,
  getOfficialPortalForDestination,
  getPassportTypesForCountry,
  HELD_VISA_OPTIONS,
  MERCOSUR_CODES,
  SCHENGEN_CODES,
  THIRD_COUNTRY_EXEMPTION_RULES,
  VISA_COUNTRY_MAP,
  VISA_WORLD_COUNTRIES,
} from './visaCheckCatalog';
import {
  BilateralAgreementInfo,
  GlobalDestinationAccess,
  HeldVisaId,
  HeldVisaUnlockDetail,
  TravelPurpose,
  VisaCheckInput,
  VisaCheckResult,
  VisaRequirementStatus,
  VisaWorldCountry,
} from '../types/visaCheck';

// ============================================================================
// STATUS RANKING (lower number = easier access)
// ============================================================================

const STATUS_EASE_RANK: Record<VisaRequirementStatus, number> = {
  domestic: 0,
  freedom_of_movement: 1,
  visa_free: 2,
  visa_free_conditional: 3,
  eta_required: 4,
  visa_on_arrival: 5,
  e_visa: 6,
  visa_required: 7,
};

// ============================================================================
// CORE MULTILATERAL & BILATERAL DESTINATION SETS (2026 ACCURATE)
// ============================================================================

// U.S. Visa Waiver Program (VWP / ESTA) Partner Countries (42 countries)
const US_VWP_PARTNERS = new Set([
  'AD', 'AU', 'AT', 'BE', 'BN', 'CL', 'HR', 'CZ', 'DK', 'EE', 'FI', 'FR',
  'DE', 'GR', 'HU', 'IS', 'IE', 'IL', 'IT', 'JP', 'LV', 'LI', 'LT', 'LU',
  'MT', 'MC', 'NL', 'NZ', 'NO', 'PL', 'PT', 'QA', 'SM', 'SG', 'SK', 'SI',
  'KR', 'ES', 'SE', 'CH', 'TW', 'GB',
]);

// Schengen Annex II (Visa-Free 90/180 days to all 29 Schengen countries)
const SCHENGEN_ANNEX_II = new Set([
  ...EEA_EFTA_CODES,
  'AL', 'AD', 'AG', 'AR', 'AU', 'BS', 'BB', 'BA', 'BR', 'BN', 'CA', 'CL',
  'CO', 'CR', 'DM', 'SV', 'GE', 'GD', 'GT', 'HN', 'HK', 'IL', 'JP', 'KI',
  'XK', 'MO', 'MY', 'MH', 'MU', 'MX', 'FM', 'MD', 'MC', 'ME', 'NZ', 'NI',
  'MK', 'PW', 'PA', 'PY', 'PE', 'KN', 'LC', 'VC', 'WS', 'SM', 'RS', 'SC',
  'SG', 'SB', 'KR', 'TW', 'TL', 'TO', 'TT', 'TV', 'UA', 'AE', 'GB', 'US',
  'UY', 'VU', 'VA', 'VE',
]);

// UK ETA-eligible visa-free nationalities (2025/2026 rollout)
const UK_ETA_NATIONALITIES = new Set([
  ...EEA_EFTA_CODES,
  'AD', 'AG', 'AR', 'AU', 'BS', 'BH', 'BB', 'BZ', 'BW', 'BR', 'BN', 'CA',
  'CL', 'CR', 'GD', 'GT', 'GY', 'HK', 'IL', 'JP', 'KI', 'KW', 'MO', 'MY',
  'MV', 'MH', 'MU', 'MX', 'FM', 'MC', 'NR', 'NZ', 'NI', 'OM', 'PW', 'PA',
  'PG', 'PY', 'PE', 'QA', 'KN', 'LC', 'VC', 'WS', 'SM', 'SA', 'SC', 'SG',
  'SB', 'KR', 'TW', 'TO', 'TV', 'AE', 'US', 'UY', 'VA',
]);

// Canada eTA-eligible visa-exempt nationalities (air entry)
const CANADA_ETA_NATIONALITIES = new Set([
  ...EEA_EFTA_CODES,
  'AD', 'AU', 'BS', 'BB', 'BN', 'CL', 'HK', 'IL', 'JP', 'MC', 'NZ', 'PG',
  'WS', 'SM', 'SG', 'SB', 'KR', 'TW', 'AE', 'GB', 'VA',
]);

// Japan Visa-Exempt Nationalities (71+ countries)
const JAPAN_VISA_FREE = new Set([
  ...EEA_EFTA_CODES,
  'AD', 'AR', 'AU', 'BS', 'BB', 'BN', 'CA', 'CL', 'CR', 'DO', 'SV', 'GT',
  'HN', 'HK', 'ID', 'IL', 'LS', 'MO', 'MY', 'MU', 'MX', 'MC', 'NZ', 'MK',
  'PA', 'QA', 'SM', 'RS', 'SG', 'KR', 'SR', 'TW', 'TH', 'TN', 'TR', 'AE',
  'GB', 'US', 'UY',
]);

// Australia ETA / eVisitor eligible passports
const AUSTRALIA_ETA_ELIGIBLE = new Set([
  ...EEA_EFTA_CODES,
  'AD', 'BN', 'CA', 'HK', 'JP', 'MY', 'MC', 'SM', 'SG', 'KR', 'TW', 'GB', 'US', 'VA',
]);

// New Zealand NZeTA visa-waiver countries
const NZ_ETA_ELIGIBLE = new Set([
  ...EEA_EFTA_CODES,
  'AD', 'AR', 'BH', 'BR', 'BN', 'CA', 'CL', 'HK', 'IL', 'JP', 'KW', 'MO',
  'MY', 'MU', 'MX', 'MC', 'OM', 'QA', 'SM', 'SA', 'SC', 'SG', 'KR', 'TW',
  'AE', 'GB', 'US', 'UY', 'VA',
]);

// Countries that offer near-universal Visa-Free or Visa-on-Arrival / eTA to almost all nationalities
const UNIVERSALLY_OPEN_VISA_FREE = new Set(['DM', 'HT', 'FM', 'CK', 'NU', 'VC', 'SC', 'MV', 'BB', 'KN', 'GD', 'FJ']);
const UNIVERSALLY_OPEN_VOA = new Set(['MV', 'NP', 'KH', 'LA', 'BO', 'MG', 'RW', 'TZ', 'ZW', 'CV', 'KM', 'DJ', 'GW', 'MR', 'MZ', 'PW', 'WS', 'SB', 'TL', 'TV', 'TO', 'VU', 'JO', 'EG', 'LB']);
const UNIVERSALLY_OPEN_EVISA = new Set(['KE', 'VN', 'LK', 'IN', 'AU', 'NZ', 'GE', 'AZ', 'AM', 'UZ', 'KG', 'TJ', 'OM', 'BH', 'QA', 'TR', 'UG', 'ET', 'ZM', 'BJ', 'CI', 'GA', 'GN', 'MW', 'ST', 'TG', 'CO', 'EC', 'SR', 'MN', 'MY', 'ID', 'TH', 'SG', 'AE', 'SA', 'MA', 'PK', 'ZA']);

// ============================================================================
// BILATERAL DIPLOMATIC & OFFICIAL PASSPORT AGREEMENTS (VERIFIED MEA LISTS)
// ============================================================================

// India MEA Bilateral Visa Exemption Agreements — BOTH Diplomatic AND Official/Service (White Type S + Maroon Type D)
// Official Reference: https://www.mea.gov.in/bvwa-passport
// IMPORTANT: Strictly verified agreements covering BOTH Diplomatic and Official/Service passports.
// Countries where the MEA agreement covers Diplomatic Passports ONLY (e.g., Portugal, Germany, France, Italy, Spain, Malta, Japan, etc.) are listed separately in INDIA_MEA_DIPLOMATIC_ONLY.
const INDIA_MEA_DIPLOMATIC_AND_OFFICIAL = new Set([
  // Europe (Verified Diplomatic + Official/Service)
  'AL', 'AD', 'BY', 'BG', 'HR', 'CY', 'HU', 'RU', 'RS', 'UA',
  // Asia & Central Asia (Verified Diplomatic + Official/Service)
  'AZ', 'BD', 'BT', 'BN', 'KH', 'ID', 'KZ', 'KG', 'LA', 'MY', 'MV', 'MN', 'MM', 'NP', 'PH', 'SG', 'KR', 'LK', 'TJ', 'TH', 'VN',
  // Middle East (Verified Diplomatic + Official/Special; Saudi Arabia w.e.f. June 2026)
  'AE', 'BH', 'IL', 'JO', 'KW', 'OM', 'QA', 'SA',
  // Americas & Caribbean (Verified Diplomatic + Official/Service)
  'AG', 'AR', 'BS', 'BZ', 'BO', 'BR', 'CL', 'CO', 'DO', 'EC', 'SV', 'GY', 'HN', 'MX', 'PA', 'PE', 'UY', 'VE',
  // Africa & Oceania (Verified Diplomatic + Official/Service)
  'DZ', 'BJ', 'EG', 'GH', 'MU', 'MA', 'MZ', 'NA', 'RW', 'ZA', 'TZ', 'TN', 'UG', 'FJ',
]);

// India MEA Bilateral Visa Exemption Agreements — DIPLOMATIC PASSPORTS ONLY (Maroon Type D)
// Official Reference: https://www.mea.gov.in/bvwa-passport-only (34 MEA entries + verified diplomatic-only CIS/Africa pacts)
// Indian Official (White – Type S) passport holders are NOT covered under these agreements and require a visa.
const INDIA_MEA_DIPLOMATIC_ONLY = new Set([
  // Europe (Verified Diplomatic-Only — Official passports NOT exempt)
  'AT', 'CZ', 'EE', 'FI', 'FR', 'DE', 'GR', 'IT', 'LV', 'LT',
  'MK', 'MT', 'MC', 'NL', 'NO', 'PL', 'PT', 'RO', 'SK', 'SI',
  'ES', 'SE', 'CH', 'TR',
  // Asia & Central Asia (Verified Diplomatic-Only)
  'AF', 'AM', 'IR', 'JP', 'TM', 'UZ',
  // Africa & Americas (Verified Diplomatic-Only)
  'BW', 'CU', 'ET', 'KE', 'ZM', 'ZW',
]);

// Turkey Special (Green / Hususi) & Service (Gray / Hizmet) Passport Visa-Free Countries
const TURKEY_GREEN_PASSPORT_VISA_FREE = new Set([
  ...SCHENGEN_CODES,
  'CY', 'AL', 'BA', 'ME', 'MK', 'RS', 'XK', 'MD', 'UA', 'BY', 'GE', 'AM', 'AZ', 'RU',
  'JP', 'KR', 'SG', 'MY', 'TH', 'ID', 'PH', 'VN', 'HK', 'MO', 'TW', 'CN', 'KZ', 'UZ', 'KG', 'MN', 'MV', 'LK', 'BN', 'TL',
  'AE', 'QA', 'OM', 'BH', 'KW', 'JO', 'IL', 'LB', 'IR',
  'BR', 'AR', 'CL', 'CO', 'PE', 'EC', 'UY', 'PY', 'BO', 'VE', 'CR', 'PA', 'GT', 'SV', 'HN', 'NI', 'BZ', 'DO', 'CU', 'BS', 'BB', 'JM', 'TT', 'AG', 'KN', 'LC', 'GD', 'VC', 'DM',
  'ZA', 'MA', 'TN', 'EG', 'MU', 'SC', 'KE', 'TZ', 'BW', 'NA', 'SN', 'GM', 'SZ',
  'FJ', 'WS', 'TO', 'VU', 'PW',
]);

// China Ordinary Mutual Visa-Free / Easy Access Partners (2025/2026 expansions)
const CHINA_ORDINARY_VISA_FREE = new Set([
  'SG', 'TH', 'MY', 'AE', 'QA', 'GE', 'KZ', 'UZ', 'BY', 'RS', 'BA', 'AL', 'AM', 'AZ',
  'MV', 'MU', 'SC', 'AG', 'BB', 'BS', 'DM', 'GD', 'SR', 'EC', 'FJ', 'TO', 'WS', 'PW', 'SB',
  'MA', 'TN', 'IR', 'KR', 'HK', 'MO', 'JM', 'HT', 'KN', 'LC', 'VC',
]);

// China Diplomatic / Service / Public Affairs Bilateral Visa Exemption Countries
const CHINA_OFFICIAL_DIPLOMATIC_WAIVER = new Set([
  ...SCHENGEN_CODES, // EU-China Diplomatic waiver (Diplomatic only for Schengen; Service for many bilateral)
  'RU', 'BY', 'UA', 'RS', 'ME', 'AL', 'BA', 'MK', 'MD', 'GE', 'AM', 'AZ', 'TR', 'CY',
  'SG', 'TH', 'MY', 'ID', 'VN', 'PH', 'KH', 'LA', 'MM', 'BN', 'KR', 'JP', 'PK', 'BD', 'LK', 'NP', 'MV', 'MN', 'KZ', 'UZ', 'KG', 'TJ', 'TM',
  'AE', 'SA', 'QA', 'OM', 'BH', 'KW', 'JO', 'IR', 'EG', 'MA', 'TN', 'DZ',
  'BR', 'AR', 'CL', 'MX', 'PE', 'CO', 'EC', 'UY', 'PY', 'BO', 'VE', 'CR', 'PA', 'CU', 'DO', 'JM', 'TT', 'BB', 'BS', 'GY', 'SR',
  'ZA', 'KE', 'TZ', 'UG', 'RW', 'ET', 'NG', 'GH', 'SN', 'ZA', 'MU', 'SC', 'NA', 'BW', 'ZM', 'ZW', 'AO', 'MZ', 'FJ', 'PG', 'WS', 'TO', 'VU',
]);

// India Ordinary Passport Specific Access Lists (2026 Current)
const INDIA_ORDINARY_VISA_FREE = new Set([
  'NP', 'BT', 'TH', 'MY', 'MU', 'MV', 'SC', 'FJ', 'BB', 'DM', 'GD', 'HT', 'JM', 'KN', 'LC', 'VC', 'TT',
  'SV', 'KZ', 'IR', 'MO', 'SN', 'TN', 'PW', 'WS', 'CK', 'NU', 'VU', 'KI', 'FM', 'RW', 'KE', 'AO', 'BJ', 'GM', 'MR',
]);

const INDIA_ORDINARY_VOA = new Set([
  'ID', 'KH', 'LA', 'QA', 'JO', 'LK', 'BO', 'MG', 'TZ', 'ZW', 'CV', 'KM', 'DJ', 'GW', 'MZ', 'SB', 'TL', 'TV', 'TO', 'BI', 'ET', 'SL', 'SO',
]);

const INDIA_ORDINARY_EVISA = new Set([
  'VN', 'SG', 'AE', 'OM', 'BH', 'SA', 'GE', 'AM', 'AZ', 'UZ', 'KG', 'TJ', 'RU', 'AU', 'HK', 'MM', 'MN',
  'ZA', 'UG', 'ZM', 'MW', 'CI', 'GA', 'GN', 'ST', 'TG', 'MA', 'CO', 'SR', 'AG', 'BS', 'BZ', 'CU', 'AL', 'MD', 'PK', 'BD',
]);

// US Passport Card valid land/sea destinations ONLY
const US_PASSPORT_CARD_VALID = new Set([
  'CA', 'MX', 'BM', 'BS', 'BB', 'JM', 'KY', 'TC', 'AW', 'CW', 'BQ', 'SX',
  'AG', 'KN', 'LC', 'GD', 'VC', 'DM', 'DO', 'HT', 'TT', 'AI', 'VG', 'VI', 'PR', 'MQ', 'GP', 'BL', 'MS',
]);

// ============================================================================
// HELPER: CHECK BILATERAL AGREEMENT & PRIVILEGED PASSPORT RULES
// ============================================================================

interface EvaluatedBaseline {
  status: VisaRequirementStatus;
  maxStay: string;
  entryMethod: string;
  estimatedFee: string;
  agreements: BilateralAgreementInfo[];
  passportTierApplied: boolean;
  passportTierNote?: string;
}

function evaluateOrdinaryPassport(
  origin: VisaWorldCountry,
  dest: VisaWorldCountry
): EvaluatedBaseline {
  const o = origin.code;
  const d = dest.code;
  const agreements: BilateralAgreementInfo[] = [];

  // 1. Freedom of Movement Treaties
  if (EEA_EFTA_CODES.has(o) && EEA_EFTA_CODES.has(d)) {
    agreements.push({
      id: 'eu-eea-fom',
      title: 'EU / EEA & EFTA Freedom of Movement (Directive 2004/38/EC)',
      summary: `Citizens of ${origin.name} enjoy unrestricted freedom of movement, residence, and work in ${dest.name} using a valid passport or national ID card.`,
      officialUrl: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32004L0038',
      sourceLabel: 'EUR-Lex Official Directive',
      appliesTo: 'All Ordinary, Official & Diplomatic Citizens',
    });
    return {
      status: 'freedom_of_movement',
      maxStay: 'Unlimited (Register if > 90 days)',
      entryMethod: 'Passport or National ID Card',
      estimatedFee: 'Free ($0)',
      agreements,
      passportTierApplied: false,
    };
  }

  if ((o === 'GB' && d === 'IE') || (o === 'IE' && d === 'GB')) {
    agreements.push({
      id: 'uk-ie-cta',
      title: 'UK–Ireland Common Travel Area (CTA) Agreement',
      summary: 'British and Irish citizens may travel, live, and work freely between the UK and Ireland with no visa or ETA required.',
      officialUrl: 'https://www.gov.uk/government/publications/common-travel-area-guidance',
      sourceLabel: 'GOV.UK Official CTA Guidance',
      appliesTo: 'All British & Irish Citizens',
    });
    return {
      status: 'freedom_of_movement',
      maxStay: 'Unlimited (CTA Rights)',
      entryMethod: 'Border entry (no visa / no UK ETA required)',
      estimatedFee: 'Free ($0)',
      agreements,
      passportTierApplied: false,
    };
  }

  if ((o === 'AU' && d === 'NZ') || (o === 'NZ' && d === 'AU')) {
    agreements.push({
      id: 'au-nz-ttta',
      title: 'Australia–New Zealand Trans-Tasman Travel Arrangement (TTTA)',
      summary: 'Australian and New Zealand citizens may enter, live, and work indefinitely in each other’s country (Special Category Visa SCV 444 on arrival in Australia).',
      officialUrl: 'https://immi.homeaffairs.gov.au/entering-and-leaving/new-zealand-citizens',
      sourceLabel: 'Australian Dept. of Home Affairs',
      appliesTo: 'All Australian & New Zealand Citizens',
    });
    return {
      status: 'freedom_of_movement',
      maxStay: 'Unlimited (Trans-Tasman)',
      entryMethod: 'Passport on arrival (SCV / Resident Visa)',
      estimatedFee: 'Free ($0)',
      agreements,
      passportTierApplied: false,
    };
  }

  if ((o === 'IN' && (d === 'NP' || d === 'BT')) || ((o === 'NP' || o === 'BT') && d === 'IN')) {
    agreements.push({
      id: 'in-np-bt-treaty',
      title: d === 'NP' || o === 'NP'
        ? '1950 Indo–Nepal Treaty of Peace and Friendship'
        : 'India–Bhutan Treaty of Perpetual Peace and Friendship (1949 / 2007)',
      summary: 'Provides reciprocal visa-free freedom of movement across land and air borders for citizens of India, Nepal, and Bhutan.',
      officialUrl: 'https://www.mea.gov.in/',
      sourceLabel: 'Ministry of External Affairs, India',
      appliesTo: 'All Citizens (Passport or Voter ID)',
    });
    return {
      status: 'freedom_of_movement',
      maxStay: 'Unlimited (Bhutan SDF applies for Indian tourists)',
      entryMethod: 'Passport or Approved National ID (No Visa)',
      estimatedFee: d === 'BT' ? 'SDF ~INR 1,200/night (No Visa Fee)' : 'Free ($0)',
      agreements,
      passportTierApplied: false,
    };
  }

  if (GCC_CODES.has(o) && GCC_CODES.has(d)) {
    agreements.push({
      id: 'gcc-fom',
      title: 'GCC Unified Freedom of Movement Agreement',
      summary: 'Citizens of Gulf Cooperation Council member states (UAE, Saudi Arabia, Qatar, Kuwait, Oman, Bahrain) enjoy visa-free travel and residence across all GCC states.',
      officialUrl: 'https://www.gcc-sg.org/',
      sourceLabel: 'GCC Secretariat General',
      appliesTo: 'All GCC Citizens (National ID or Passport)',
    });
    return {
      status: 'freedom_of_movement',
      maxStay: 'Unlimited (GCC Mobility)',
      entryMethod: 'GCC National ID or Passport',
      estimatedFee: 'Free ($0)',
      agreements,
      passportTierApplied: false,
    };
  }

  if ((o === 'US' && d === 'CA') || (o === 'CA' && d === 'US')) {
    agreements.push({
      id: 'us-ca-bilateral',
      title: 'U.S.–Canada Bilateral Visa-Exempt Travel Regime',
      summary: 'U.S. and Canadian citizens travel visa-free (no ESTA and no Canada eTA required) for tourism and business stays up to 180 days.',
      officialUrl: 'https://travel.state.gov/content/travel/en/international-travel/International-Travel-Country-Information-Pages/Canada.html',
      sourceLabel: 'U.S. Department of State',
      appliesTo: 'All U.S. & Canadian Citizens',
    });
    return {
      status: 'visa_free',
      maxStay: 'Up to 180 days',
      entryMethod: 'Direct border entry (No ESTA / No eTA required)',
      estimatedFee: 'Free ($0)',
      agreements,
      passportTierApplied: false,
    };
  }

  if ((o === 'US' && ['FM', 'MH', 'PW'].includes(d)) || (['FM', 'MH', 'PW'].includes(o) && d === 'US')) {
    agreements.push({
      id: 'us-cofa',
      title: 'Compact of Free Association (COFA)',
      summary: 'Grants reciprocal visa-free entry, residence, and employment rights between the United States and the Freely Associated States (Micronesia, Marshall Islands, Palau).',
      officialUrl: 'https://www.uscis.gov/',
      sourceLabel: 'USCIS Official COFA Guidance',
      appliesTo: 'All Eligible Citizens',
    });
    return {
      status: 'freedom_of_movement',
      maxStay: 'Unlimited (COFA Rights)',
      entryMethod: 'Passport on arrival (No Visa)',
      estimatedFee: 'Free ($0)',
      agreements,
      passportTierApplied: false,
    };
  }

  if ((o === 'RU' && d === 'BY') || (o === 'BY' && d === 'RU')) {
    agreements.push({
      id: 'ru-by-union',
      title: 'Russia–Belarus Union State Freedom of Movement',
      summary: 'Citizens of Russia and Belarus travel and reside without visas across both countries.',
      officialUrl: 'https://www.mid.ru/en/',
      sourceLabel: 'MFA Bilateral Agreement',
      appliesTo: 'All Citizens',
    });
    return {
      status: 'freedom_of_movement',
      maxStay: 'Unlimited',
      entryMethod: 'Internal or International Passport',
      estimatedFee: 'Free ($0)',
      agreements,
      passportTierApplied: false,
    };
  }

  // 2. Major Regional Multilateral Blocs
  if (ASEAN_CODES.has(o) && ASEAN_CODES.has(d)) {
    agreements.push({
      id: 'asean-waiver',
      title: 'ASEAN Framework Agreement on Visa Exemption (2006)',
      summary: `Grants reciprocal short-stay visa-free travel between ASEAN member states (${origin.name} and ${dest.name}).`,
      officialUrl: 'https://asean.org/asean-framework-agreement-on-visa-exemption/',
      sourceLabel: 'ASEAN Secretariat Official Treaty',
      appliesTo: 'All ASEAN Ordinary, Official & Diplomatic Passports',
    });
    return {
      status: 'visa_free',
      maxStay: '14–30 days (up to 60 days in Thailand)',
      entryMethod: 'Visa-free entry stamp on arrival',
      estimatedFee: 'Free ($0)',
      agreements,
      passportTierApplied: false,
    };
  }

  if (MERCOSUR_CODES.has(o) && MERCOSUR_CODES.has(d)) {
    agreements.push({
      id: 'mercosur-mobility',
      title: 'MERCOSUR & Associated States Mobility Agreement',
      summary: `Allows visa-free travel (often with National ID) and simplified 2-year residency pathways between ${origin.name} and ${dest.name}.`,
      officialUrl: 'https://www.mercosur.int/en/',
      sourceLabel: 'MERCOSUR Official Portal',
      appliesTo: 'Citizens of MERCOSUR & Associated States',
    });
    return {
      status: 'visa_free',
      maxStay: 'Up to 90 days (extendable / Mercosur residency eligible)',
      entryMethod: 'Passport or Mercosur National ID',
      estimatedFee: 'Free ($0)',
      agreements,
      passportTierApplied: false,
    };
  }

  if (CARICOM_CODES.has(o) && CARICOM_CODES.has(d) && o !== 'HT') {
    agreements.push({
      id: 'caricom-csme',
      title: 'CARICOM Single Market & Economy (CSME) Free Movement',
      summary: 'CARICOM nationals enjoy automatic 6-month stay upon entry across participating Caribbean member states.',
      officialUrl: 'https://caricom.org/',
      sourceLabel: 'CARICOM Official Secretariat',
      appliesTo: 'CARICOM Nationals',
    });
    return {
      status: 'visa_free',
      maxStay: 'Up to 180 days (6 months)',
      entryMethod: 'Passport on arrival (No Visa)',
      estimatedFee: 'Free ($0)',
      agreements,
      passportTierApplied: false,
    };
  }

  if (ECOWAS_CODES.has(o) && ECOWAS_CODES.has(d)) {
    agreements.push({
      id: 'ecowas-fom',
      title: 'ECOWAS Protocol on Free Movement of Persons',
      summary: 'ECOWAS citizens enjoy 90-day visa-free entry across West African member states.',
      officialUrl: 'https://www.ecowas.int/',
      sourceLabel: 'ECOWAS Official Commission',
      appliesTo: 'All ECOWAS Passport Holders',
    });
    return {
      status: 'visa_free',
      maxStay: 'Up to 90 days',
      entryMethod: 'ECOWAS Passport or Travel Certificate',
      estimatedFee: 'Free ($0)',
      agreements,
      passportTierApplied: false,
    };
  }

  if (EAC_CODES.has(o) && EAC_CODES.has(d)) {
    agreements.push({
      id: 'eac-fom',
      title: 'East African Community (EAC) Common Market Protocol',
      summary: 'Provides reciprocal visa-free movement between East African Community partner states.',
      officialUrl: 'https://www.eac.int/',
      sourceLabel: 'East African Community Secretariat',
      appliesTo: 'EAC Citizens',
    });
    return {
      status: 'visa_free',
      maxStay: 'Up to 90–180 days',
      entryMethod: 'Passport or East African ID',
      estimatedFee: 'Free ($0)',
      agreements,
      passportTierApplied: false,
    };
  }

  if (CA4_CODES.has(o) && CA4_CODES.has(d)) {
    agreements.push({
      id: 'ca4-agreement',
      title: 'Central America-4 (CA-4) Border Control Agreement',
      summary: 'Provides unified free movement across Guatemala, El Salvador, Honduras, and Nicaragua.',
      officialUrl: 'https://www.sica.int/',
      sourceLabel: 'SICA / CA-4 Agreement',
      appliesTo: 'CA-4 Nationals',
    });
    return {
      status: 'visa_free',
      maxStay: 'Up to 90 days',
      entryMethod: 'Passport or National ID',
      estimatedFee: 'Free ($0)',
      agreements,
      passportTierApplied: false,
    };
  }

  if (CIS_VISA_FREE_CODES.has(o) && CIS_VISA_FREE_CODES.has(d)) {
    agreements.push({
      id: 'cis-bilateral',
      title: 'CIS Bilateral Visa-Free Travel Agreements',
      summary: `Reciprocal visa-free short-term entry agreement between ${origin.name} and ${dest.name}.`,
      officialUrl: 'https://www.vmp.gov.kz/en/',
      sourceLabel: 'Regional Consular Treaty',
      appliesTo: 'Citizens of Participating CIS States',
    });
    return {
      status: 'visa_free',
      maxStay: '30–90 days',
      entryMethod: 'Passport on arrival (registration rules may apply)',
      estimatedFee: 'Free ($0)',
      agreements,
      passportTierApplied: false,
    };
  }

  // 3. Major Global Destination Gatekeepers (US, Schengen, UK, CA, AU, NZ, JP, IN, CN)
  if (d === 'US') {
    if (US_VWP_PARTNERS.has(o)) {
      agreements.push({
        id: 'us-vwp',
        title: 'U.S. Visa Waiver Program (VWP / ESTA)',
        summary: `Citizens of ${origin.name} qualify for visa-free travel to the United States for up to 90 days with an approved online ESTA authorization.`,
        officialUrl: 'https://travel.state.gov/content/travel/en/us-visas/tourism-visit/visa-waiver-program.html',
        sourceLabel: 'U.S. Department of State VWP',
        appliesTo: 'Biometric e-Passport Holders of 42 VWP Countries',
      });
      return {
        status: 'eta_required',
        maxStay: 'Up to 90 days',
        entryMethod: 'Online ESTA Authorization prior to boarding',
        estimatedFee: '$21 USD (ESTA Fee)',
        agreements,
        passportTierApplied: false,
      };
    }
    return {
      status: 'visa_required',
      maxStay: 'Up to 180 days (on B1/B2 Visa)',
      entryMethod: 'Embassy/Consulate Visa Interview (DS-160)',
      estimatedFee: '$185 USD (MRV Application Fee)',
      agreements,
      passportTierApplied: false,
    };
  }

  if (SCHENGEN_CODES.has(d)) {
    if (SCHENGEN_ANNEX_II.has(o)) {
      agreements.push({
        id: 'schengen-annex-ii',
        title: 'EU Visa-Free Regulation (EU) 2018/1806 — Annex II',
        summary: `Citizens of ${origin.name} enter ${dest.name} and the entire 29-country Schengen Area visa-free for up to 90 days in any 180-day period.`,
        officialUrl: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32018R1806',
        sourceLabel: 'EUR-Lex EU Regulation 2018/1806',
        appliesTo: 'Ordinary Passports of Annex II Countries (ETIAS ~€7 when active)',
      });
      return {
        status: 'visa_free',
        maxStay: '90 days within any 180-day rolling period',
        entryMethod: 'Visa-free border entry (ETIAS pre-travel clearance once rolled out)',
        estimatedFee: 'Free ($0; ETIAS ~€7 upon launch)',
        agreements,
        passportTierApplied: false,
      };
    }
    return {
      status: 'visa_required',
      maxStay: 'Up to 90 days (Schengen Type C Visa)',
      entryMethod: 'Schengen Embassy / VFS / TLS / BLS Application',
      estimatedFee: '€90 EUR (~$98 USD) consular fee',
      agreements,
      passportTierApplied: false,
    };
  }

  if (d === 'GB') {
    if (UK_ETA_NATIONALITIES.has(o)) {
      agreements.push({
        id: 'uk-eta-scheme',
        title: 'UK Electronic Travel Authorisation (ETA) Scheme',
        summary: `Visa-exempt citizens of ${origin.name} travel to the UK without a consular visa by obtaining a fast digital UK ETA before departure.`,
        officialUrl: 'https://www.gov.uk/guidance/apply-for-an-electronic-travel-authorisation-eta',
        sourceLabel: 'GOV.UK Official ETA Policy',
        appliesTo: 'Visa-Exempt Non-British/Irish Nationals',
      });
      return {
        status: 'eta_required',
        maxStay: 'Up to 6 months per visit',
        entryMethod: 'Online UK ETA App / Portal (valid 2 years)',
        estimatedFee: '£16 GBP (~$20 USD)',
        agreements,
        passportTierApplied: false,
      };
    }
    return {
      status: 'visa_required',
      maxStay: 'Up to 6 months (Standard Visitor Visa)',
      entryMethod: 'GOV.UK Online Application + Biometric Appointment',
      estimatedFee: '£115–£127 GBP (~$150 USD)',
      agreements,
      passportTierApplied: false,
    };
  }

  if (d === 'CA') {
    if (CANADA_ETA_NATIONALITIES.has(o)) {
      agreements.push({
        id: 'ca-eta',
        title: 'Canada Visa-Exempt Electronic Travel Authorization (eTA)',
        summary: `Citizens of ${origin.name} fly to Canada visa-free using an online CAD $7 eTA (valid 5 years).`,
        officialUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/eta.html',
        sourceLabel: 'IRCC Official Portal',
        appliesTo: 'Visa-Exempt Air Travelers',
      });
      return {
        status: 'eta_required',
        maxStay: 'Up to 6 months',
        entryMethod: 'Online Canada eTA (Air Entry)',
        estimatedFee: 'CAD $7 (~$5 USD)',
        agreements,
        passportTierApplied: false,
      };
    }
    return {
      status: 'visa_required',
      maxStay: 'Up to 6 months (Temporary Resident Visa)',
      entryMethod: 'IRCC Online Application + Biometrics',
      estimatedFee: 'CAD $100 + CAD $85 biometrics',
      agreements,
      passportTierApplied: false,
    };
  }

  if (d === 'AU') {
    if (AUSTRALIA_ETA_ELIGIBLE.has(o)) {
      return {
        status: 'eta_required',
        maxStay: 'Up to 90 days per visit',
        entryMethod: 'Australian ETA App (Subclass 601) or eVisitor (Subclass 651)',
        estimatedFee: EU_CODES.has(o) ? 'Free ($0 eVisitor 651)' : 'AUD $20 (~$13 USD ETA App)',
        agreements,
        passportTierApplied: false,
      };
    }
    return {
      status: 'e_visa',
      maxStay: 'Up to 3–12 months (Visitor Visa Subclass 600)',
      entryMethod: 'ImmiAccount Online Visa Application (100% digital)',
      estimatedFee: 'AUD $195 (~$130 USD)',
      agreements,
      passportTierApplied: false,
    };
  }

  if (d === 'NZ') {
    if (NZ_ETA_ELIGIBLE.has(o)) {
      return {
        status: 'eta_required',
        maxStay: 'Up to 90 days (6 months for UK citizens)',
        entryMethod: 'Online NZeTA + International Visitor Levy (IVL)',
        estimatedFee: 'NZD $17–$23 NZeTA + NZD $100 IVL',
        agreements,
        passportTierApplied: false,
      };
    }
    return {
      status: 'e_visa',
      maxStay: 'Up to 3–9 months (Visitor Visa)',
      entryMethod: 'Immigration New Zealand Online Portal',
      estimatedFee: 'NZD $341+ (incl. IVL)',
      agreements,
      passportTierApplied: false,
    };
  }

  if (d === 'JP') {
    if (JAPAN_VISA_FREE.has(o)) {
      agreements.push({
        id: 'jp-waiver',
        title: 'Japan Reciprocal Visa Exemption Arrangement',
        summary: `Citizens of ${origin.name} enter Japan visa-free for short-term tourism and business.`,
        officialUrl: 'https://www.mofa.go.jp/j_info/visit/visa/short/novisa.html',
        sourceLabel: 'MOFA Japan Official Exemption List',
        appliesTo: 'Ordinary e-Passports of 71 Exempt Nations',
      });
      return {
        status: 'visa_free',
        maxStay: o === 'TH' || o === 'ID' || o === 'BN' ? '15 days' : '90 days',
        entryMethod: 'Visa-free entry stamp (Visit Japan Web recommended)',
        estimatedFee: 'Free ($0)',
        agreements,
        passportTierApplied: false,
      };
    }
    return {
      status: ['IN', 'CN', 'BR', 'SA', 'ZA', 'TW', 'KH', 'MN'].includes(o) ? 'e_visa' : 'visa_required',
      maxStay: 'Up to 15–90 days',
      entryMethod: 'JAPAN eVISA (for eligible residents/nationalities) or Embassy Sticker Visa',
      estimatedFee: '~$20–$35 USD (Varies by nationality; reduced for India)',
      agreements,
      passportTierApplied: false,
    };
  }

  if (d === 'IN') {
    if (o === 'PK') {
      return {
        status: 'visa_required',
        maxStay: 'Restricted / Case-by-case',
        entryMethod: 'Indian High Commission Consular Visa Application',
        estimatedFee: 'Varies by category',
        agreements,
        passportTierApplied: false,
      };
    }
    if (o === 'MV' || o === 'JP' || o === 'KR' || o === 'AE') {
      return {
        status: o === 'MV' ? 'visa_free' : 'visa_on_arrival',
        maxStay: o === 'MV' ? '90 days' : '60 days (VoA at major airports) or e-Visa',
        entryMethod: o === 'MV' ? 'Visa-free bilateral entry' : 'Visa on Arrival or Indian e-Visa',
        estimatedFee: o === 'MV' ? 'Free ($0)' : 'INR 2,000 (~$24 USD)',
        agreements,
        passportTierApplied: false,
      };
    }
    if (o !== 'CN' && o !== 'AF' && o !== 'SO' && o !== 'SY' && o !== 'YE' && o !== 'IQ') {
      return {
        status: 'e_visa',
        maxStay: '30 days / 1-Year / 5-Year e-Tourist Visa',
        entryMethod: 'Official Indian e-Visa Portal (165+ eligible countries)',
        estimatedFee: '$10–$80 USD depending on season & duration',
        agreements,
        passportTierApplied: false,
      };
    }
    return {
      status: 'visa_required',
      maxStay: 'Per consular approval',
      entryMethod: 'Indian Embassy / Consulate Application',
      estimatedFee: 'Varies by nationality',
      agreements,
      passportTierApplied: false,
    };
  }

  // 4. Dedicated High-Precision Rules for Major Origin Nationalities
  if (o === 'IN') {
    if (INDIA_ORDINARY_VISA_FREE.has(d)) {
      if (d === 'TH' || d === 'MY' || d === 'MU' || d === 'MV' || d === 'KZ' || d === 'IR') {
        agreements.push({
          id: `in-${d.toLowerCase()}-waiver`,
          title: `India–${dest.name} Tourist Visa Exemption Arrangement`,
          summary: `${dest.name} grants visa-free short-stay tourist entry to Indian ordinary passport holders.`,
          officialUrl: getOfficialPortalForDestination(dest).officialUrl,
          sourceLabel: `${dest.name} Official Immigration`,
          appliesTo: 'Indian Ordinary Passport Holders',
        });
      }
      return {
        status: 'visa_free',
        maxStay:
          d === 'TH' ? '60 days' : d === 'MY' ? '30 days' : d === 'MV' || d === 'MU' || d === 'BB' ? '90 days' : d === 'FJ' ? '120 days' : d === 'KZ' || d === 'IR' ? '14–15 days' : '30 days',
        entryMethod: d === 'KE' ? 'Free/Online Kenya eTA (Visa-Exempt)' : 'Visa-free border stamp on arrival',
        estimatedFee: d === 'KE' ? '$30 USD eTA' : 'Free ($0)',
        agreements,
        passportTierApplied: false,
      };
    }
    if (INDIA_ORDINARY_VOA.has(d)) {
      return {
        status: 'visa_on_arrival',
        maxStay: d === 'ID' || d === 'QA' || d === 'KH' || d === 'LA' || d === 'JO' ? '30 days' : '30–90 days',
        entryMethod: 'Visa on Arrival at airport (or optional pre-arrival e-Visa)',
        estimatedFee: d === 'QA' ? 'Free (Hotel booking via Discover Qatar)' : d === 'ID' ? 'IDR 500,000 (~$32 USD)' : '$25–$50 USD',
        agreements,
        passportTierApplied: false,
      };
    }
    if (INDIA_ORDINARY_EVISA.has(d)) {
      return {
        status: 'e_visa',
        maxStay: d === 'VN' ? 'Up to 90 days' : d === 'HK' ? '14 days (Free Pre-Arrival Registration)' : '30 days',
        entryMethod: d === 'HK' ? 'Free Online Pre-Arrival Registration (PAR)' : 'Official Government e-Visa Portal',
        estimatedFee: d === 'HK' ? 'Free ($0)' : d === 'VN' ? '$25–$50 USD' : '$25–$90 USD',
        agreements,
        passportTierApplied: false,
      };
    }
    return {
      status: 'visa_required',
      maxStay: 'Per consular approval (typically 30–90 days)',
      entryMethod: `${dest.name} Embassy / Consulate or VFS Application`,
      estimatedFee: '$60–$160 USD (varies by category)',
      agreements,
      passportTierApplied: false,
    };
  }

  if (o === 'CN') {
    if (CHINA_ORDINARY_VISA_FREE.has(d)) {
      agreements.push({
        id: `cn-${d.toLowerCase()}-mutual`,
        title: `China–${dest.name} Mutual Visa Exemption Agreement`,
        summary: `Bilateral mutual visa-free travel arrangement between China and ${dest.name} for ordinary passport holders.`,
        officialUrl: 'https://en.nia.gov.cn/',
        sourceLabel: 'National Immigration Administration (China)',
        appliesTo: 'Chinese Ordinary Passports',
      });
      return {
        status: 'visa_free',
        maxStay: d === 'TH' ? '60 days' : d === 'SG' || d === 'MY' || d === 'AE' || d === 'QA' || d === 'GE' || d === 'KZ' ? '30 days' : '30–90 days',
        entryMethod: 'Visa-free border entry on arrival',
        estimatedFee: 'Free ($0)',
        agreements,
        passportTierApplied: false,
      };
    }
    if (['ID', 'KH', 'LA', 'NP', 'JO', 'EG', 'TZ', 'RW', 'BO', 'MG', 'LB', 'BH', 'OM', 'BN'].includes(d)) {
      return {
        status: 'visa_on_arrival',
        maxStay: '14–30 days',
        entryMethod: 'Visa on Arrival or Online e-Visa',
        estimatedFee: '$20–$50 USD',
        agreements,
        passportTierApplied: false,
      };
    }
    if (['VN', 'TR', 'AU', 'NZ', 'KE', 'LK', 'ZA', 'RU', 'SA', 'AZ', 'KG', 'TJ', 'CO', 'MX', 'PK'].includes(d)) {
      return {
        status: 'e_visa',
        maxStay: '30–90 days',
        entryMethod: 'Official e-Visa Portal',
        estimatedFee: '$25–$100 USD',
        agreements,
        passportTierApplied: false,
      };
    }
    return {
      status: 'visa_required',
      maxStay: 'Per consular visa',
      entryMethod: `${dest.name} Embassy / Visa Center`,
      estimatedFee: '$60–$160 USD',
      agreements,
      passportTierApplied: false,
    };
  }

  // China as Destination (2025/2026 unilateral 30-day visa-free expansion!)
  if (d === 'CN') {
    const chinaUnilateral30Day = new Set([
      'FR', 'DE', 'IT', 'NL', 'ES', 'MY', 'CH', 'IE', 'HU', 'AT', 'BE', 'LU',
      'NZ', 'AU', 'PL', 'PT', 'GR', 'CY', 'SI', 'SK', 'NO', 'FI', 'DK', 'IS',
      'AD', 'MC', 'LI', 'KR', 'BG', 'RO', 'HR', 'ME', 'MK', 'MT', 'EE', 'LV',
      'JP', 'SG', 'TH', 'AE', 'QA', 'GE', 'KZ', 'BY', 'RS', 'BA', 'AL', 'AM',
      'BN', 'BS', 'BB', 'DM', 'EC', 'FJ', 'GD', 'MU', 'MV', 'SC', 'SR', 'TO',
    ]);
    if (chinaUnilateral30Day.has(o)) {
      agreements.push({
        id: 'cn-30day-waiver',
        title: 'China 30-Day Visa-Free Entry Policy',
        summary: `Ordinary passport holders from ${origin.name} may enter China visa-free for up to 30 days for tourism, business, family visits, or transit.`,
        officialUrl: 'https://en.nia.gov.cn/',
        sourceLabel: 'National Immigration Administration of China',
        appliesTo: 'Ordinary Passport Holders',
      });
      return {
        status: 'visa_free',
        maxStay: 'Up to 30 days',
        entryMethod: 'Visa-free arrival at Chinese ports of entry',
        estimatedFee: 'Free ($0)',
        agreements,
        passportTierApplied: false,
      };
    }
    return {
      status: 'visa_required',
      maxStay: '30–60 days (Note: 240-hour Visa-Free Transit available for 54 nations)',
      entryMethod: 'Chinese Embassy / CVASC Application',
      estimatedFee: '$60–$185 USD',
      agreements,
      passportTierApplied: false,
    };
  }

  // 5. General Tier-Based Global Matrix (Calibrated for Real-World Mobility)
  const tier = origin.mobilityTier;

  // Tier 1 (EU, US, UK, CA, AU, NZ, JP, KR, SG, MY, AE, BR, AR, CL, MX, etc.)
  if (tier === 1) {
    // Countries requiring e-Visa or Visa even for Tier 1 Western/Asian passports
    const tier1VisaRequired = new Set(['RU', 'KP', 'TM', 'DZ', 'LY', 'SY', 'YE', 'AF', 'ER', 'SD', 'SS', 'CF', 'TD', 'NE', 'ML', 'BF', 'CG', 'CD', 'CM', 'GQ', 'LR', 'SL', 'GH', 'NG', 'CU', 'VE', 'IR', 'IQ', 'BT']);
    const tier1Evisa = new Set(['VN', 'KE', 'LK', 'EG', 'AZ', 'PK', 'SA', 'MM', 'KH', 'LA', 'TZ', 'UG', 'ET', 'RW', 'BJ', 'CI', 'GA', 'GN', 'PG', 'SUR', 'SR', 'CU']);
    const tier1Voa = new Set(['ID', 'NP', 'JO', 'EG', 'OM', 'BH', 'KW', 'LB', 'MV', 'MG', 'ZW', 'ZM', 'NA', 'TZ', 'BD']);

    // US/CA/AU citizens need Brazil e-Visa (reinstated April 2025)
    if (d === 'BR' && ['US', 'CA', 'AU'].includes(o)) {
      return {
        status: 'e_visa',
        maxStay: 'Up to 90 days',
        entryMethod: 'Official Brazil eVisa Portal (Reciprocity Policy)',
        estimatedFee: '$80.90 USD',
        agreements,
        passportTierApplied: false,
      };
    }

    if (tier1VisaRequired.has(d)) {
      // Russia e-Visa is available for EU, JP, SG, MY, AE, etc. (not US/UK/CA/AU)
      if (d === 'RU' && (EU_CODES.has(o) || ['JP', 'SG', 'MY', 'AE', 'KR', 'MX', 'BR', 'TR', 'CN', 'IN'].includes(o))) {
        return {
          status: 'e_visa',
          maxStay: 'Up to 16 days',
          entryMethod: 'Official Russia Unified e-Visa Portal',
          estimatedFee: '~$52 USD',
          agreements,
          passportTierApplied: false,
        };
      }
      if (d === 'CU') {
        return {
          status: 'e_visa',
          maxStay: 'Up to 90 days',
          entryMethod: 'Official eVisaCuba Electronic Tourist Card',
          estimatedFee: '~$25–$50 USD',
          agreements,
          passportTierApplied: false,
        };
      }
      return {
        status: 'visa_required',
        maxStay: 'Per consular visa approval',
        entryMethod: `${dest.name} Embassy / Consulate`,
        estimatedFee: '$50–$180 USD',
        agreements,
        passportTierApplied: false,
      };
    }

    if (tier1Evisa.has(d)) {
      // Vietnam is visa-free 45 days for UK, DE, FR, IT, ES, JP, KR, NO, SE, DK, FI, BY, RU!
      if (d === 'VN' && ['GB', 'DE', 'FR', 'IT', 'ES', 'JP', 'KR', 'NO', 'SE', 'DK', 'FI', 'BY', 'RU', 'CL', 'PA'].includes(o)) {
        return {
          status: 'visa_free',
          maxStay: 'Up to 45 days',
          entryMethod: 'Visa-free entry stamp on arrival (90-day e-Visa also available)',
          estimatedFee: 'Free ($0)',
          agreements,
          passportTierApplied: false,
        };
      }
      return {
        status: 'e_visa',
        maxStay: d === 'VN' || d === 'SA' || d === 'KE' ? 'Up to 90 days' : '30–60 days',
        entryMethod: 'Official Government e-Visa / eTA Portal',
        estimatedFee: '$25–$105 USD',
        agreements,
        passportTierApplied: false,
      };
    }

    if (tier1Voa.has(d)) {
      if (d === 'ID' && ['SG', 'MY', 'TH', 'PH', 'VN', 'BN', 'KH', 'LA', 'MM', 'TL'].includes(o)) {
        return { status: 'visa_free', maxStay: '30 days', entryMethod: 'ASEAN Visa-Free', estimatedFee: 'Free ($0)', agreements, passportTierApplied: false };
      }
      return {
        status: 'visa_on_arrival',
        maxStay: '30 days',
        entryMethod: 'Visa on Arrival at airport or online e-VOA',
        estimatedFee: d === 'MV' ? 'Free ($0)' : '$25–$50 USD',
        agreements,
        passportTierApplied: false,
      };
    }

    // Default for Tier 1 passports across Europe, Americas, Asia, Oceania, Caribbean
    return {
      status: 'visa_free',
      maxStay:
        d === 'MX' || d === 'PA' || d === 'CR' || d === 'PE' ? 'Up to 90–180 days' :
        d === 'TH' ? '60 days' :
        d === 'GE' ? 'Up to 1 year (365 days)' :
        'Up to 90 days',
      entryMethod: 'Visa-free entry stamp on arrival',
      estimatedFee: 'Free ($0)',
      agreements,
      passportTierApplied: false,
    };
  }

  // Tier 2 (GCC non-AE, Eastern Europe non-EU, LATAM mid-tier, Turkey, Thailand, South Africa, Russia, Kazakhstan, etc.)
  if (tier === 2) {
    const tier2VisaFree = new Set([
      ...UNIVERSALLY_OPEN_VISA_FREE,
      'TH', 'MY', 'SG', 'HK', 'MO', 'PH', 'GE', 'AM', 'RS', 'BA', 'ME', 'AL', 'MK', 'TR', 'BR', 'AR', 'CL', 'CO', 'PE', 'EC', 'UY', 'PY', 'PA', 'CR', 'DO', 'BS', 'JM', 'TT', 'MU', 'ZA', 'MA', 'TN', 'QA', 'OM', 'AE', 'KZ', 'UZ', 'KG', 'BY', 'MD', 'UA', 'RU',
    ]);
    // Turkey ordinary passport specific nuance: needs visa for MX, SG (no, TR is visa-free SG!), AE (e-Visa)
    if (tier2VisaFree.has(d)) {
      // GCC citizens need no visa for AE/QA/OM/BH/SA/KW; Russia/Turkey need e-Visa for AE/OM
      if (d === 'AE' && ['TR', 'ZA', 'TH', 'CO', 'PE', 'EC', 'DO', 'JM'].includes(o)) {
        return { status: 'e_visa', maxStay: '30–60 days', entryMethod: 'UAE Online e-Visa / Airline Sponsor', estimatedFee: '~$90 USD', agreements, passportTierApplied: false };
      }
      return {
        status: 'visa_free',
        maxStay: d === 'GE' ? 'Up to 1 year' : d === 'TH' ? '60 days' : '30–90 days',
        entryMethod: 'Visa-free entry stamp on arrival',
        estimatedFee: 'Free ($0)',
        agreements,
        passportTierApplied: false,
      };
    }
    if (UNIVERSALLY_OPEN_VOA.has(d)) {
      return {
        status: 'visa_on_arrival',
        maxStay: '30 days',
        entryMethod: 'Visa on Arrival or e-Visa',
        estimatedFee: '$25–$50 USD',
        agreements,
        passportTierApplied: false,
      };
    }
    if (UNIVERSALLY_OPEN_EVISA.has(d)) {
      return {
        status: 'e_visa',
        maxStay: '30–90 days',
        entryMethod: 'Official Government e-Visa Portal',
        estimatedFee: '$25–$90 USD',
        agreements,
        passportTierApplied: false,
      };
    }
    return {
      status: 'visa_required',
      maxStay: 'Per consular approval',
      entryMethod: `${dest.name} Embassy / Consulate Application`,
      estimatedFee: '$60–$150 USD',
      agreements,
      passportTierApplied: false,
    };
  }

  // Tier 3 (Indonesia, Philippines, Vietnam, Egypt, Morocco, Kenya, Sri Lanka, Mongolia, etc.)
  if (tier === 3) {
    const tier3VisaFree = new Set([
      ...UNIVERSALLY_OPEN_VISA_FREE,
      'MY', 'TH', 'SG', 'HK', 'MO', 'MU', 'RW', 'KE', 'DO', 'EC', 'CO', 'BR', 'PE', 'BO', 'SR', 'GM', 'SN', 'MA', 'TN', 'QA', 'OM', 'KZ', 'UZ', 'KG', 'AM', 'PS',
    ]);
    // Philippines / Indonesia / Vietnam nuances
    if (tier3VisaFree.has(d) && !(d === 'SG' && ['EG', 'MA', 'TN', 'DZ', 'LK', 'MM'].includes(o))) {
      return {
        status: 'visa_free',
        maxStay: '14–30 days',
        entryMethod: 'Visa-free border entry on arrival',
        estimatedFee: 'Free ($0)',
        agreements,
        passportTierApplied: false,
      };
    }
    if (UNIVERSALLY_OPEN_VOA.has(d)) {
      return {
        status: 'visa_on_arrival',
        maxStay: '30 days',
        entryMethod: 'Visa on Arrival at airport / border',
        estimatedFee: '$25–$50 USD',
        agreements,
        passportTierApplied: false,
      };
    }
    if (UNIVERSALLY_OPEN_EVISA.has(d)) {
      return {
        status: 'e_visa',
        maxStay: '30 days',
        entryMethod: 'Official e-Visa Portal',
        estimatedFee: '$25–$90 USD',
        agreements,
        passportTierApplied: false,
      };
    }
    return {
      status: 'visa_required',
      maxStay: 'Per consular approval',
      entryMethod: `${dest.name} Embassy / Consulate Application`,
      estimatedFee: '$60–$160 USD',
      agreements,
      passportTierApplied: false,
    };
  }

  // Tier 4 (Pakistan, Bangladesh, Nigeria, Afghanistan, Syria, Yemen, Iraq, Iran, Sudan, Nepal, etc.)
  if (UNIVERSALLY_OPEN_VISA_FREE.has(d) && !['KP', 'AF'].includes(o)) {
    return {
      status: 'visa_free',
      maxStay: '14–30 days',
      entryMethod: 'Visa-free entry on arrival',
      estimatedFee: 'Free ($0)',
      agreements,
      passportTierApplied: false,
    };
  }
  if (['MV', 'NP', 'KH', 'LA', 'RW', 'MG', 'CV', 'KM', 'DJ', 'PW', 'WS', 'TL', 'TV', 'TO', 'VU', 'QA'].includes(d)) {
    return {
      status: 'visa_on_arrival',
      maxStay: '14–30 days',
      entryMethod: 'Visa on Arrival (hotel & return ticket required)',
      estimatedFee: d === 'MV' || d === 'QA' ? 'Free (Discover Qatar / IMUGA)' : '$30–$50 USD',
      agreements,
      passportTierApplied: false,
    };
  }
  if (['MY', 'TH', 'KE', 'LK', 'AZ', 'UZ', 'KG', 'TJ', 'ET', 'UG', 'ZM', 'MW', 'BJ', 'CI', 'GA', 'GN', 'ST', 'TG', 'VN', 'TZ', 'AE', 'OM', 'BH', 'PK', 'BD'].includes(d)) {
    return {
      status: 'e_visa',
      maxStay: '30 days',
      entryMethod: 'Official Government e-Visa / eTA Portal',
      estimatedFee: '$30–$100 USD',
      agreements,
      passportTierApplied: false,
    };
  }
  return {
    status: 'visa_required',
    maxStay: 'Per consular approval',
    entryMethod: `${dest.name} Embassy / Consulate Application`,
    estimatedFee: '$80–$185 USD',
    agreements,
    passportTierApplied: false,
  };
}

// ============================================================================
// SPECIAL & PRIVILEGED PASSPORT OVERLAY (DIPLOMATIC / OFFICIAL / SPECIAL / CARD)
// ============================================================================

function applyPassportTypeRules(
  origin: VisaWorldCountry,
  dest: VisaWorldCountry,
  passportCategory: string,
  ordinaryBaseline: EvaluatedBaseline
): EvaluatedBaseline {
  const o = origin.code;
  const d = dest.code;

  // Special Case 1: U.S. Passport Card restriction (Land & Sea ONLY to CA/MX/Caribbean)
  if (o === 'US' && passportCategory === 'passport_card') {
    if (!US_PASSPORT_CARD_VALID.has(d)) {
      return {
        status: 'visa_required',
        maxStay: 'Not valid for international air travel',
        entryMethod: 'U.S. Passport Book Required (Passport Card NOT accepted)',
        estimatedFee: 'Requires standard U.S. Passport Book',
        agreements: [],
        passportTierApplied: true,
        passportTierNote: `A U.S. Passport Card cannot be used for international flights or entry into ${dest.name}. It is strictly limited to land and sea border crossings to Canada, Mexico, Bermuda, and the Caribbean.`,
      };
    }
    return {
      ...ordinaryBaseline,
      entryMethod: 'Land & Sea Border Crossings ONLY (Not valid for flights)',
      passportTierApplied: true,
      passportTierNote: `Accepted at land border crossings and sea cruises to ${dest.name}, but NOT valid for commercial international air travel.`,
    };
  }

  // Special Case 2: German Temporary Passport (Green) — NOT eligible for US ESTA
  if (o === 'DE' && passportCategory === 'temporary' && d === 'US') {
    return {
      status: 'visa_required',
      maxStay: 'Requires B1/B2 Consular Visa',
      entryMethod: 'U.S. Embassy Visa Interview (Not ESTA-eligible)',
      estimatedFee: '$185 USD',
      agreements: [
        {
          id: 'de-temp-us-esta',
          title: 'U.S. ESTA Biometric e-Passport Mandate',
          summary: 'The German Green Temporary Passport (Vorläufiger Reisepass) lacks a biometric chip and does NOT qualify for U.S. ESTA under the Visa Waiver Program.',
          officialUrl: 'https://travel.state.gov/content/travel/en/us-visas/tourism-visit/visa-waiver-program.html',
          sourceLabel: 'U.S. Department of State VWP Rules',
          appliesTo: 'German Temporary Passports',
        },
      ],
      passportTierApplied: true,
      passportTierNote: 'Unlike the burgundy German Reisepass, the green Temporary Passport is NOT eligible for U.S. ESTA and requires a consular U.S. visa.',
    };
  }

  // Special Case 3: India ECR Ordinary Passport Note for 18 Emigration-Check Countries
  if (o === 'IN' && passportCategory === 'ecr_ordinary') {
    const ecrCountries = new Set(['AE', 'SA', 'QA', 'OM', 'KW', 'BH', 'MY', 'JO', 'LB', 'LY', 'IQ', 'YE', 'SD', 'SS', 'AF', 'ID', 'SY', 'TH']);
    if (ecrCountries.has(d)) {
      return {
        ...ordinaryBaseline,
        passportTierApplied: true,
        passportTierNote: `For TOURISM, ECR passports follow the same visa rules as regular Indian passports. However, if traveling to ${dest.name} for EMPLOYMENT, mandatory Protector of Emigrants (eMigrate POE) clearance is required.`,
      };
    }
  }

  // Special Case 4: UK BN(O) Passport traveling to Mainland China
  if (o === 'GB' && passportCategory === 'bno' && d === 'CN') {
    return {
      status: 'visa_required',
      maxStay: 'Not recognized by Mainland China',
      entryMethod: 'Home Return Permit (Hui Xiang Zheng) or HKSAR Passport required',
      estimatedFee: 'Varies',
      agreements: [],
      passportTierApplied: true,
      passportTierNote: 'Mainland China no longer recognizes British National (Overseas) BN(O) passports as valid travel documents; travelers must use an HKSAR passport or Home Return Permit.',
    };
  }

  // Special Case 5: INDIA Official (White) & Diplomatic (Maroon) Bilateral MEA Agreements!
  if (o === 'IN' && (passportCategory === 'official' || passportCategory === 'diplomatic')) {
    const isDiplomatic = passportCategory === 'diplomatic';
    const isDiplomaticAndOfficialAgreement = INDIA_MEA_DIPLOMATIC_AND_OFFICIAL.has(d);
    const isDiplomaticOnlyAgreement = INDIA_MEA_DIPLOMATIC_ONLY.has(d);

    const qualifies =
      isDiplomaticAndOfficialAgreement ||
      (isDiplomatic && isDiplomaticOnlyAgreement);

    const meaBvwaUrl = isDiplomaticOnlyAgreement
      ? 'https://www.mea.gov.in/bvwa-passport-only'
      : 'https://www.mea.gov.in/bvwa-passport';
    const meaSourceLabel = isDiplomaticOnlyAgreement
      ? 'Ministry of External Affairs, India (Diplomatic-Only BVWA List)'
      : 'Ministry of External Affairs, India (Diplomatic & Official BVWA List)';

    const getIndiaMeaStayWindow = (destCode: string): string => {
      if (['AF', 'IR', 'TM', 'HR', 'LK', 'LA'].includes(destCode)) return 'Up to 30 days';
      if (['KH', 'KW', 'UZ'].includes(destCode)) return 'Up to 60 days';
      if (SCHENGEN_CODES.has(destCode)) return 'Up to 90 days in any 180-day period';
      return 'Up to 90 days (verify exact treaty duration)';
    };

    if (qualifies && STATUS_EASE_RANK[ordinaryBaseline.status] > STATUS_EASE_RANK.visa_free) {
      const stayWindow = getIndiaMeaStayWindow(d);
      const agreement: BilateralAgreementInfo = {
        id: `in-mea-bvwa-${d.toLowerCase()}`,
        title: `India–${dest.name} Bilateral Visa Exemption Agreement (${isDiplomaticOnlyAgreement ? 'Diplomatic Passports Only' : 'Diplomatic & Official/Service Passports'})`,
        summary: `Under the operational bilateral Visa Waiver Agreement signed between the Government of India (MEA) and ${dest.name}, Indian ${isDiplomatic ? 'Diplomatic (Maroon – Type D)' : 'Official (White – Type S)'} passport holders are exempt from visa requirements for short stays.`,
        officialUrl: meaBvwaUrl,
        sourceLabel: meaSourceLabel,
        appliesTo: isDiplomaticOnlyAgreement
          ? 'Indian Diplomatic Passports ONLY (Type D — Official Passports NOT included)'
          : 'Indian Official (Type S) & Diplomatic (Type D) Passports',
        effectiveNote: 'Carry an official Note Verbale or travel authorization when traveling on official assignment.',
      };
      return {
        status: 'visa_free',
        maxStay: stayWindow,
        entryMethod: `Visa-free entry under India–${dest.name} Bilateral Agreement`,
        estimatedFee: 'Free ($0)',
        agreements: [agreement, ...ordinaryBaseline.agreements],
        passportTierApplied: true,
        passportTierNote: `Verified MEA Bilateral Waiver: Your Indian ${isDiplomatic ? 'Diplomatic (Maroon)' : 'Official (White)'} passport grants visa-free entry into ${dest.name} under an active MEA agreement.`,
      };
    }

    // Even if ordinary was already visa-free, surface the MEA bilateral treaty for transparency
    if (qualifies && ordinaryBaseline.status === 'visa_free') {
      const agreement: BilateralAgreementInfo = {
        id: `in-mea-bvwa-${d.toLowerCase()}`,
        title: `India–${dest.name} Bilateral ${isDiplomaticOnlyAgreement ? 'Diplomatic' : 'Diplomatic & Official'} Visa Waiver`,
        summary: `Covered by both general visitor access and the official MEA Bilateral Visa Exemption Agreement with ${dest.name}.`,
        officialUrl: meaBvwaUrl,
        sourceLabel: meaSourceLabel,
        appliesTo: isDiplomaticOnlyAgreement
          ? 'Indian Diplomatic Passports ONLY (Type D)'
          : 'Indian Diplomatic (Type D) & Official (Type S) Passports',
      };
      return {
        ...ordinaryBaseline,
        agreements: [agreement, ...ordinaryBaseline.agreements],
      };
    }

    // CRITICAL DISTINCTION: Indian OFFICIAL passport traveling to a DIPLOMATIC-ONLY agreement country (e.g., Portugal, Germany, France, Italy, Spain, Japan)
    if (!isDiplomatic && isDiplomaticOnlyAgreement) {
      const scopeNotice: BilateralAgreementInfo = {
        id: `in-mea-dip-only-notice-${d.toLowerCase()}`,
        title: `India–${dest.name} Agreement Applies to Diplomatic Passports ONLY (Official Passports Not Exempt)`,
        summary: `The bilateral India–${dest.name} Visa Exemption Agreement registered with MEA covers holders of Indian Diplomatic Passports (Maroon – Type D) ONLY. Holders of Indian Official Passports (White – Type S) are NOT covered by this waiver and must obtain the required visa prior to travel.`,
        officialUrl: 'https://www.mea.gov.in/bvwa-passport-only',
        sourceLabel: 'MEA India (Diplomatic-Only BVWA List)',
        appliesTo: 'Indian Diplomatic Passports ONLY — Official/Service Passports Excluded',
        effectiveNote: 'Official passport holders should apply via the destination embassy/consulate with an MEA Note Verbale.',
      };
      return {
        ...ordinaryBaseline,
        agreements: [scopeNotice, ...ordinaryBaseline.agreements],
        passportTierApplied: true,
        passportTierNote: `Important: The India–${dest.name} MEA Visa Waiver Agreement applies ONLY to Diplomatic Passports (Maroon – Type D). Indian Official Passports (White – Type S) are NOT exempt and require a visa for ${dest.name}.`,
      };
    }

    // No operational MEA bilateral waiver exists for this destination (e.g. US, UK, CA, AU, BE, DK, LU, CN) — NEVER fall through to generic heuristics!
    return ordinaryBaseline;
  }

  // Special Case 6: TURKEY Special (Green / Yeşil), Service (Gray), and Diplomatic Passports!
  if (o === 'TR' && (passportCategory === 'special' || passportCategory === 'service' || passportCategory === 'diplomatic')) {
    if (TURKEY_GREEN_PASSPORT_VISA_FREE.has(d) && STATUS_EASE_RANK[ordinaryBaseline.status] > STATUS_EASE_RANK.visa_free) {
      const passportLabel =
        passportCategory === 'special'
          ? 'Special Passport (Green / Hususi Damgalı)'
          : passportCategory === 'service'
          ? 'Service Passport (Gray / Hizmet Damgalı)'
          : 'Diplomatic Passport (Black)';
      const agreement: BilateralAgreementInfo = {
        id: `tr-privileged-${d.toLowerCase()}`,
        title: `Türkiye–${dest.name} Bilateral Visa Exemption (${passportLabel})`,
        summary: `Under bilateral agreements recognized by the Ministry of Foreign Affairs of Türkiye${SCHENGEN_CODES.has(d) ? ' and Schengen Member States' : ''}, Turkish ${passportLabel} holders enter ${dest.name} visa-free for up to 90 days.`,
        officialUrl: 'https://www.mfa.gov.tr/visa-information-for-foreigners.en.mfa',
        sourceLabel: 'Ministry of Foreign Affairs of Türkiye',
        appliesTo: `Turkish ${passportLabel}`,
      };
      return {
        status: 'visa_free',
        maxStay: SCHENGEN_CODES.has(d) ? '90 days within 180 days' : 'Up to 90 days',
        entryMethod: `Visa-free entry (${passportLabel})`,
        estimatedFee: 'Free ($0)',
        agreements: [agreement, ...ordinaryBaseline.agreements],
        passportTierApplied: true,
        passportTierNote: `While ordinary Burgundy Turkish passports require a visa for ${dest.name}, your Turkish ${passportLabel} grants visa-free entry.`,
      };
    }
    return ordinaryBaseline;
  }

  // Special Case 7: CHINA Diplomatic, Service & Public Affairs Passports
  if (o === 'CN' && (passportCategory === 'diplomatic' || passportCategory === 'service' || passportCategory === 'public_affairs')) {
    const isSchengen = SCHENGEN_CODES.has(d);
    const qualifies =
      (isSchengen && passportCategory === 'diplomatic') ||
      (!isSchengen && CHINA_OFFICIAL_DIPLOMATIC_WAIVER.has(d));
    const pName =
      passportCategory === 'diplomatic'
        ? 'Diplomatic Passport'
        : passportCategory === 'service'
        ? 'Service Passport'
        : 'Passport for Public Affairs';

    if (qualifies && STATUS_EASE_RANK[ordinaryBaseline.status] > STATUS_EASE_RANK.visa_free) {
      const agreement: BilateralAgreementInfo = {
        id: `cn-official-${d.toLowerCase()}`,
        title: isSchengen
          ? 'EU–China Agreement on Short-Stay Visa Waiver for Holders of Diplomatic Passports (2016)'
          : `China–${dest.name} Bilateral Official/Diplomatic Visa Waiver Agreement`,
        summary: `Grants visa-free short-term entry to ${dest.name} for holders of Chinese ${pName}s.`,
        officialUrl: isSchengen
          ? 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:22016A0322(01)'
          : 'https://en.nia.gov.cn/',
        sourceLabel: isSchengen ? 'EUR-Lex Official EU–China Agreement' : 'China MFA / NIA',
        appliesTo: isSchengen
          ? 'Chinese Diplomatic Passports ONLY (Service & Public Affairs Excluded)'
          : `Chinese ${pName} Holders`,
      };
      return {
        status: 'visa_free',
        maxStay: isSchengen ? '90 days within 180 days' : 'Up to 30 days',
        entryMethod: `Visa-free entry under Bilateral ${pName} Agreement`,
        estimatedFee: 'Free ($0)',
        agreements: [agreement, ...ordinaryBaseline.agreements],
        passportTierApplied: true,
        passportTierNote: `Your Chinese ${pName} unlocks visa-free entry into ${dest.name} under a bilateral government agreement.`,
      };
    }

    // Explicit EU–China Diplomatic-Only exclusion notice for Chinese Service / Public Affairs passports
    if (isSchengen && passportCategory !== 'diplomatic') {
      const scopeNotice: BilateralAgreementInfo = {
        id: `cn-schengen-dip-only-${d.toLowerCase()}`,
        title: 'EU–China Visa Waiver Covers Diplomatic Passports ONLY (Service & Public Affairs Not Exempt)',
        summary: `The 2016 EU–China Short-Stay Visa Waiver Agreement exempts Chinese Diplomatic Passports ONLY across the Schengen Area. Holders of Chinese ${pName}s are NOT exempt and must obtain a Schengen visa before traveling to ${dest.name}.`,
        officialUrl: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:22016A0322(01)',
        sourceLabel: 'EUR-Lex Official EU–China Agreement',
        appliesTo: 'Chinese Diplomatic Passports ONLY — Service & Public Affairs Excluded',
      };
      return {
        ...ordinaryBaseline,
        agreements: [scopeNotice, ...ordinaryBaseline.agreements],
        passportTierApplied: true,
        passportTierNote: `Important: The EU–China Schengen Visa Waiver applies ONLY to Chinese Diplomatic Passports. Your Chinese ${pName} is NOT exempt and requires a Schengen visa for ${dest.name}.`,
      };
    }

    return ordinaryBaseline;
  }

  // Special Case 8: General Diplomatic / Official / Service / Special Passports (Other Nationalities)
  // NEVER blindly assume visa-free status for unverified country pairs — many bilateral treaties cover
  // Diplomatic passports ONLY and exclude Official/Service passports. Keep the conservative baseline status
  // and guide the traveler to verify active bilateral coverage on the official MFA portal.
  if (
    ['diplomatic', 'official', 'service', 'special'].includes(passportCategory) &&
    STATUS_EASE_RANK[ordinaryBaseline.status] > STATUS_EASE_RANK.visa_free
  ) {
    const isDiplomatic = passportCategory === 'diplomatic';
    const label = isDiplomatic ? 'Diplomatic Passport' : 'Official / Service / Special Passport';
    const verificationNotice: BilateralAgreementInfo = {
      id: `bilateral-verify-${o.toLowerCase()}-${d.toLowerCase()}`,
      title: `Verify ${origin.name}–${dest.name} Bilateral ${label} Rules`,
      summary: isDiplomatic
        ? `Bilateral diplomatic visa exemption agreements are negotiated individually between sovereign states. Because we do not assume blanket exemptions for unverified pairs, confirm directly whether an active ${origin.name}–${dest.name} Diplomatic Passport waiver applies before traveling without a visa.`
        : `Important: Many bilateral visa waiver agreements apply ONLY to Diplomatic Passports and explicitly exclude Official, Service, or Special passports. Verify directly with both Ministries of Foreign Affairs whether an active ${origin.name}–${dest.name} agreement covers your ${label}.`,
      officialUrl: SCHENGEN_CODES.has(d)
        ? 'https://home-affairs.ec.europa.eu/policies/schengen/schengen-visas_en'
        : getOfficialPortalForDestination(dest).officialUrl,
      sourceLabel: SCHENGEN_CODES.has(d)
        ? 'European Commission – Schengen Visa Policy'
        : `${dest.name} Official Visa Authority`,
      appliesTo: `${origin.name} ${label} (Requires MFA Confirmation)`,
      effectiveNote: 'Never travel without a visa unless your specific passport class is explicitly exempted in an active bilateral treaty.',
    };
    return {
      ...ordinaryBaseline,
      agreements: [verificationNotice, ...ordinaryBaseline.agreements],
      passportTierApplied: true,
      passportTierNote: isDiplomatic
        ? `Standard entry rules are shown conservatively because bilateral Diplomatic Passport waivers vary by country pair. Confirm active ${origin.name}–${dest.name} diplomatic treaty status with the Ministry of Foreign Affairs before departure.`
        : `Standard entry rules are shown conservatively: many bilateral agreements exempt Diplomatic passports ONLY and do NOT cover Official/Service passports. Verify directly with ${origin.name} and ${dest.name} foreign affairs authorities before traveling without a visa.`,
    };
  }

  return ordinaryBaseline;
}

// ============================================================================
// HELD VISA EXEMPTION EVALUATOR
// ============================================================================

function evaluateHeldVisaUnlock(
  origin: VisaWorldCountry,
  dest: VisaWorldCountry,
  currentStatus: VisaRequirementStatus,
  heldVisas: HeldVisaId[],
  purpose: TravelPurpose
): HeldVisaUnlockDetail | undefined {
  if (!heldVisas.length) return undefined;
  if (STATUS_EASE_RANK[currentStatus] <= STATUS_EASE_RANK.visa_free) return undefined;

  let bestUnlock: HeldVisaUnlockDetail | undefined;

  // 1. Check APEC Business Travel Card (ABTC) first for business/tourism across 19 APEC economies
  if (
    heldVisas.includes('apec_card') &&
    APEC_CODES.has(dest.code) &&
    dest.code !== 'US' &&
    dest.code !== 'CA' // US & CA are transitional APEC members (fast-track lane, still need visa/ESTA/eTA)
  ) {
    const candidateStatus: VisaRequirementStatus = 'visa_free_conditional';
    if (STATUS_EASE_RANK[candidateStatus] < STATUS_EASE_RANK[currentStatus]) {
      bestUnlock = {
        visaId: 'apec_card',
        visaLabel: 'APEC Business Travel Card (ABTC)',
        upgradedFromStatus: currentStatus,
        grantedStatus: candidateStatus,
        maxStay: 'Up to 60–90 days (Business Entry)',
        conditions: [
          `Your ABTC card must show "${dest.code}" pre-cleared on the reverse side.`,
          'Valid strictly for short-term business visits and fast-track APEC airport lanes.',
        ],
        officialReferenceUrl: 'https://www.apec.org/groups/committee-on-trade-and-investment/business-mobility-group/abtc',
      };
    }
  }

  // 2. Check all third-country visa exemption rules (US, Schengen, UK, CA, JP, AU, GCC)
  const matchingRules = THIRD_COUNTRY_EXEMPTION_RULES.filter(
    rule => rule.destinationCode === dest.code
  );

  for (const rule of matchingRules) {
    if (rule.onlyForOriginCodes && !rule.onlyForOriginCodes.includes(origin.code)) {
      continue;
    }
    if (rule.excludedOriginCodes && rule.excludedOriginCodes.includes(origin.code)) {
      continue;
    }

    // Singapore VFTF is transit-only; still show it clearly, especially if purpose === 'transit' or user wants to know
    const matchingVisaId = heldVisas.find(v => rule.acceptedVisas.includes(v));
    if (!matchingVisaId) continue;

    // Only upgrade if the held visa grants BETTER (lower rank) status than the current status!
    if (STATUS_EASE_RANK[rule.grantedStatus] < STATUS_EASE_RANK[currentStatus]) {
      const visaMeta = HELD_VISA_OPTIONS.find(v => v.id === matchingVisaId);
      const candidate: HeldVisaUnlockDetail = {
        visaId: matchingVisaId,
        visaLabel: visaMeta?.shortLabel || matchingVisaId,
        upgradedFromStatus: currentStatus,
        grantedStatus: rule.grantedStatus,
        maxStay: rule.maxStay,
        conditions:
          dest.code === 'SG' && purpose !== 'transit'
            ? [
                ...rule.conditions,
                'Important: Since your selected purpose is not Airport Transit, verify whether your itinerary is a single-ticket transit to a third country—otherwise apply for a standard Singapore tourist visa.',
              ]
            : rule.conditions,
        officialReferenceUrl: rule.officialReferenceUrl,
      };

      if (!bestUnlock || STATUS_EASE_RANK[candidate.grantedStatus] < STATUS_EASE_RANK[bestUnlock.grantedStatus]) {
        bestUnlock = candidate;
      }
    }
  }

  return bestUnlock;
}

// ============================================================================
// PURPOSE-SPECIFIC GUIDANCE (INTEGRATES REFIRELY COUNTRY DOSSIERS!)
// ============================================================================

function buildPurposeGuidance(
  dest: VisaWorldCountry,
  purpose: TravelPurpose,
  status: VisaRequirementStatus
): { label: string; summary: string; actionItems: string[] } {
  const refirelyCountry = dest.refirelyCountryId
    ? INITIAL_COUNTRIES.find(c => c.id === dest.refirelyCountryId)
    : undefined;

  if (purpose === 'retirement') {
    if (refirelyCountry) {
      return {
        label: `Retirement & Long-Stay Pathway in ${dest.name}`,
        summary: `${dest.name} offers the ${refirelyCountry.visa.retirementVisaName} (est. minimum passive income: ${refirelyCountry.visa.minimumIncomeUSD > 0 ? `$${refirelyCountry.visa.minimumIncomeUSD.toLocaleString()}/mo` : 'Savings/solvency based'}; processing ~${refirelyCountry.visa.processingMonths} months). Pathway: ${refirelyCountry.visa.pathwayToPR}.`,
        actionItems: [
          'Short-stay tourist entry lets you scout neighborhoods, but long-term residency usually requires applying for a National Long-Stay (Type D) visa from your country of residence.',
          `Open the full ${dest.name} Retirement & FIRE Dossier on ReFirely for complete tax, healthcare, and housing breakdowns.`,
        ],
      };
    }
    return {
      label: `Long-Stay & Retirement Advisory for ${dest.name}`,
      summary: `Short-term entry rules above cover exploratory scouting visits only. Residing permanently in ${dest.name} requires a dedicated Retirement, Pensioner, or Passive Income Residence Permit.`,
      actionItems: [
        'Prepare apostilled criminal background checks, proof of passive pension/investment income, and comprehensive health insurance.',
        `Verify current financial thresholds directly with ${dest.name}’s immigration portal before relocating.`,
      ],
    };
  }

  if (purpose === 'digital_nomad') {
    if (refirelyCountry) {
      const nomad = getCountryNomadProfile(refirelyCountry);
      return {
        label: `Digital Nomad & Remote Work Visa in ${dest.name}`,
        summary: `${dest.name} pathway: ${nomad.remoteWorkVisaName} (${nomad.remoteWorkVisaStay}). ${nomad.remoteWorkVisaIncomeUSD > 0 ? `Typical remote income threshold: ~$${nomad.remoteWorkVisaIncomeUSD.toLocaleString()} USD/month.` : 'Check remote-friendly visitor or savings requirements.'} Average fiber speed: ${nomad.verifiedInternetMbps} Mbps.`,
        actionItems: [
          'Standard tourist waivers strictly prohibit local employment; for stays beyond 90 days or full legal remote-work status, apply for the official Digital Nomad / Remote Work Visa.',
          'Check the 183-day tax residency trigger and bilateral double-taxation treaties.',
        ],
      };
    }
    return {
      label: `Remote Work & Digital Nomad Guidance for ${dest.name}`,
      summary: `Confirm whether ${dest.name} permits remote work for foreign clients on a short-term visitor entry, or requires a formal Digital Nomad / Temporary Stay visa.`,
      actionItems: [
        'Carry proof of overseas employment, international health insurance, and return travel.',
        'Monitor cumulative days spent to avoid unintended local tax residency.',
      ],
    };
  }

  if (purpose === 'official_duty') {
    return {
      label: `Official & Diplomatic Mission Protocol (${dest.name})`,
      summary: `Travelers on government, diplomatic, or UN missions should ensure they travel on their Official/Diplomatic passport and carry an official Note Verbale from their Ministry of Foreign Affairs.`,
      actionItems: [
        'Confirm whether your bilateral waiver covers both official assignments and private leisure travel.',
        'Coordinate protocol clearance and diplomatic accreditation through your embassy or mission.',
      ],
    };
  }

  if (purpose === 'business') {
    return {
      label: `Business & Conference Travel to ${dest.name}`,
      summary: `Short-term business activities (meetings, conferences, trade fairs, contract negotiations) are typically permitted under the entry rule above—local gainful employment is prohibited.`,
      actionItems: [
        'Carry a formal conference registration or invitation letter from your host company in ' + dest.name + '.',
        'If you hold an APEC Business Travel Card (ABTC), toggle it above to check pre-cleared business lanes.',
      ],
    };
  }

  if (purpose === 'transit') {
    return {
      label: `Airport Transit & Stopover Rules (${dest.name})`,
      summary: `Airside international-to-international transit on a single ticket often requires no visa, but some countries (e.g., US, Canada, UK, select Schengen airports) enforce strict Airside Transit Visas (ATV) depending on nationality.`,
      actionItems: [
        'Confirm whether your baggage is checked through and whether you must cross passport control for a self-transfer.',
        'Verify airline Timatic boarding requirements 72 hours before departure.',
      ],
    };
  }

  if (purpose === 'study') {
    return {
      label: `Study & Academic Exchange in ${dest.name}`,
      summary: `Short courses under 90 days may be permitted under visa-free entry, whereas full degrees or programs over 90 days require a dedicated Student Visa (Type D / F-1 / Tier 4) prior to departure.`,
      actionItems: [
        'Obtain an official Letter of Acceptance from an accredited institution before lodging a student visa application.',
        'Verify proof of tuition funds and mandatory student health coverage.',
      ],
    };
  }

  if (purpose === 'medical') {
    return {
      label: `Medical & Wellness Travel to ${dest.name}`,
      summary: `Routine outpatient wellness visits often fit within tourist entry rules, while planned surgeries or extended hospital recovery may require a Medical Visa supported by a hospital invitation letter.`,
      actionItems: [
        'Carry a written treatment schedule, hospital appointment letter, and proof of medical funds or insurance.',
      ],
    };
  }

  // Default: Tourism
  return {
    label: `Tourist & Short-Stay Checklist for ${dest.name}`,
    summary:
      status === 'visa_required'
        ? `Apply for your tourist visa well ahead of departure (typically 4–8 weeks in advance) via ${dest.name}’s official embassy or authorized visa application center.`
        : `Ensure your passport meets validity rules and carry printed or digital proof of accommodation, return flight, and travel medical insurance.`,
    actionItems: [
      'Confirm passport validity (most destinations require 6 months remaining beyond arrival and 2 blank pages).',
      'Check if a free digital arrival card (e.g., SG Arrival Card, MDAC Malaysia, TDAC Thailand, E-Ticket DR) must be filled 72 hours prior to landing.',
    ],
  };
}

// ============================================================================
// HUMAN-READABLE VERDICT FORMATTER
// ============================================================================

function getStatusHeadline(
  status: VisaRequirementStatus,
  destName: string,
  heldVisaUnlock?: HeldVisaUnlockDetail,
  unlockedByPassportTier?: boolean,
  passportLabel?: string
): string {
  switch (status) {
    case 'domestic':
      return `Domestic Travel — You Are a Citizen of ${destName}`;
    case 'freedom_of_movement':
      return `Freedom of Movement — No Visa Required for ${destName}`;
    case 'visa_free':
      return unlockedByPassportTier
        ? `Visa-Free via Bilateral Agreement (${passportLabel})`
        : `No Visa Required — Visa-Free Entry to ${destName}`;
    case 'visa_free_conditional':
      return heldVisaUnlock
        ? `Visa-Free Entry Unlocked via Your ${heldVisaUnlock.visaLabel}!`
        : `Conditional Visa-Free Entry to ${destName}`;
    case 'eta_required':
      return heldVisaUnlock
        ? `Fast Online eTA Unlocked via Your ${heldVisaUnlock.visaLabel}`
        : `Electronic Travel Authorization (eTA / ESTA) Required for ${destName}`;
    case 'visa_on_arrival':
      return heldVisaUnlock
        ? `Visa on Arrival Unlocked via Your ${heldVisaUnlock.visaLabel}`
        : `Visa on Arrival Available for ${destName}`;
    case 'e_visa':
      return heldVisaUnlock
        ? `Fast Online e-Visa Unlocked via Your ${heldVisaUnlock.visaLabel}`
        : `Online e-Visa Required Before Traveling to ${destName}`;
    case 'visa_required':
      return `Embassy / Consular Visa Required for ${destName}`;
  }
}

// ============================================================================
// PUBLIC API: CHECK SINGLE ROUTE
// ============================================================================

export function evaluateVisaRequirement(input: VisaCheckInput): VisaCheckResult {
  const origin = VISA_COUNTRY_MAP.get(input.originCode.toUpperCase()) || VISA_WORLD_COUNTRIES[0];
  const dest = VISA_COUNTRY_MAP.get(input.destinationCode.toUpperCase()) || VISA_WORLD_COUNTRIES[1];
  const availablePassports = getPassportTypesForCountry(origin.code);
  const passportType =
    availablePassports.find(p => p.id === input.passportTypeId) || availablePassports[0];

  const officialPortal = getOfficialPortalForDestination(dest);

  // Domestic Travel
  if (origin.code === dest.code) {
    return {
      origin,
      destination: dest,
      passportType,
      purpose: input.purpose,
      heldVisas: input.heldVisas,
      status: 'domestic',
      baselineOrdinaryStatus: 'domestic',
      headline: `Domestic Travel — You Hold ${origin.name} Citizenship`,
      verdictSummary: `As a citizen of ${origin.name}, you have the unrestricted right to enter and reside in ${dest.name} with your valid passport or national ID.`,
      maxStay: 'Unlimited',
      entryMethod: 'Citizen Entry (No Visa)',
      estimatedFee: 'Free ($0)',
      passportValidityRequirement: 'Valid passport or national ID for re-entry',
      unlockedByPassportTier: false,
      bilateralAgreements: [],
      officialPortal,
      purposeGuidance: buildPurposeGuidance(dest, input.purpose, 'domestic'),
      keyConditions: ['Select a different destination country to check international visa requirements.'],
      refirelyCountryId: dest.refirelyCountryId,
    };
  }

  // Step 1: Ordinary passport baseline
  const ordinaryEval = evaluateOrdinaryPassport(origin, dest);

  // Step 2: Apply selected passport type (Diplomatic, Official, Special Green, Public Affairs, Passport Card, Temporary, ECR)
  const passportEval = applyPassportTypeRules(
    origin,
    dest,
    passportType.category,
    ordinaryEval
  );

  // Step 3: Apply held third-country visas (US, Schengen, UK, CA, JP, AU, GCC, APEC)
  const heldVisaUnlock = evaluateHeldVisaUnlock(
    origin,
    dest,
    passportEval.status,
    input.heldVisas,
    input.purpose
  );

  const finalStatus = heldVisaUnlock ? heldVisaUnlock.grantedStatus : passportEval.status;
  const finalMaxStay = heldVisaUnlock ? heldVisaUnlock.maxStay : passportEval.maxStay;
  const finalEntryMethod = heldVisaUnlock
    ? `${heldVisaUnlock.visaLabel} Exemption (${heldVisaUnlock.grantedStatus === 'e_visa' ? 'Online e-Visa' : heldVisaUnlock.grantedStatus === 'eta_required' ? 'Online eTA' : heldVisaUnlock.grantedStatus === 'visa_on_arrival' ? 'Visa on Arrival' : 'Visa-Free Border Entry'})`
    : passportEval.entryMethod;

  const finalEstimatedFee = heldVisaUnlock
    ? heldVisaUnlock.grantedStatus === 'visa_free_conditional'
      ? 'Free ($0; verify any local tourist card/reciprocity fee)'
      : heldVisaUnlock.grantedStatus === 'eta_required'
      ? 'Free – $15 USD (Online eTA / TAC)'
      : '$25–$105 USD (VoA / e-Visa Fee)'
    : passportEval.estimatedFee;

  const headline = getStatusHeadline(
    finalStatus,
    dest.name,
    heldVisaUnlock,
    passportEval.passportTierApplied && STATUS_EASE_RANK[passportEval.status] < STATUS_EASE_RANK[ordinaryEval.status],
    passportType.label
  );

  let verdictSummary = '';
  if (heldVisaUnlock) {
    verdictSummary = `Although a standard ${origin.name} ${passportType.label} normally requires "${ordinaryEval.status.replace(/_/g, ' ')}" for ${dest.name}, holding a valid ${heldVisaUnlock.visaLabel} upgrades your access to ${finalStatus.replace(/_/g, ' ')} for ${finalMaxStay}.`;
  } else if (passportEval.passportTierApplied && passportEval.passportTierNote) {
    verdictSummary = passportEval.passportTierNote;
  } else if (finalStatus === 'freedom_of_movement') {
    verdictSummary = `${origin.name} and ${dest.name} share a Freedom of Movement treaty, allowing unrestricted entry, stay, and residency rights.`;
  } else if (finalStatus === 'visa_free') {
    verdictSummary = `Citizens of ${origin.name} holding a ${passportType.label} do NOT need a visa prior to traveling to ${dest.name} for short stays up to ${finalMaxStay}.`;
  } else if (finalStatus === 'eta_required') {
    verdictSummary = `You are exempt from a traditional embassy visa for ${dest.name}, but MUST obtain an Electronic Travel Authorization (${finalEntryMethod}) online before boarding your flight.`;
  } else if (finalStatus === 'visa_on_arrival') {
    verdictSummary = `You can obtain a Visa on Arrival at designated international airports or border crossings in ${dest.name} (valid for ${finalMaxStay}). Pre-applying online for an e-VOA is often available to skip airport queues.`;
  } else if (finalStatus === 'e_visa') {
    verdictSummary = `You need a visa to enter ${dest.name}, and you can apply 100% online via the official government e-Visa portal without visiting an embassy.`;
  } else {
    verdictSummary = `Citizens of ${origin.name} holding a ${passportType.label} must obtain a consular/embassy visa in advance before traveling to ${dest.name}. Tip: If you hold a valid U.S., Schengen, UK, or Canadian visa, select it above to check for exemption waivers.`;
  }

  const keyConditions: string[] = [];
  if (heldVisaUnlock) {
    keyConditions.push(...heldVisaUnlock.conditions);
  }
  if (SCHENGEN_CODES.has(dest.code) && finalStatus !== 'freedom_of_movement') {
    keyConditions.push(
      'Schengen 90/180 Rule: Your 90-day allowance is shared across all 29 Schengen Area countries combined.',
      'Passport must be issued within the last 10 years and remain valid for at least 3 months beyond your planned exit date from Schengen.'
    );
  } else {
    keyConditions.push(
      'Passport Validity: Carry a passport valid for at least 6 months beyond your arrival date with at least 2 blank visa pages.',
      'Border Proof: Immigration officers may request proof of onward/return ticket, hotel reservation, and sufficient funds.'
    );
  }

  const passportValidityRequirement = SCHENGEN_CODES.has(dest.code)
    ? 'Min. 3 months beyond exit & issued within 10 years'
    : 'Min. 6 months remaining validity & 2 blank pages';

  return {
    origin,
    destination: dest,
    passportType,
    purpose: input.purpose,
    heldVisas: input.heldVisas,
    status: finalStatus,
    baselineOrdinaryStatus: ordinaryEval.status,
    headline,
    verdictSummary,
    maxStay: finalMaxStay,
    entryMethod: finalEntryMethod,
    estimatedFee: finalEstimatedFee,
    passportValidityRequirement,
    unlockedByPassportTier:
      passportEval.passportTierApplied &&
      STATUS_EASE_RANK[passportEval.status] < STATUS_EASE_RANK[ordinaryEval.status],
    passportTierNote: passportEval.passportTierNote,
    heldVisaUnlock,
    bilateralAgreements: passportEval.agreements,
    officialPortal,
    purposeGuidance: buildPurposeGuidance(dest, input.purpose, finalStatus),
    keyConditions,
    refirelyCountryId: dest.refirelyCountryId,
  };
}

// ============================================================================
// PUBLIC API: COMPUTE ALL ~200+ DESTINATIONS FOR PASSPORT + HELD VISAS
// ============================================================================

export function computeGlobalAccessMatrix(
  originCode: string,
  passportTypeId: string,
  heldVisas: HeldVisaId[],
  purpose: TravelPurpose = 'tourism'
): GlobalDestinationAccess[] {
  const origin = VISA_COUNTRY_MAP.get(originCode.toUpperCase()) || VISA_WORLD_COUNTRIES[0];
  const availablePassports = getPassportTypesForCountry(origin.code);
  const passportType =
    availablePassports.find(p => p.id === passportTypeId) || availablePassports[0];

  const results: GlobalDestinationAccess[] = [];

  for (const dest of VISA_WORLD_COUNTRIES) {
    if (dest.code === origin.code) continue;

    const ordinaryEval = evaluateOrdinaryPassport(origin, dest);
    const passportEval = applyPassportTypeRules(
      origin,
      dest,
      passportType.category,
      ordinaryEval
    );
    const heldVisaUnlock = evaluateHeldVisaUnlock(
      origin,
      dest,
      passportEval.status,
      heldVisas,
      purpose
    );

    const finalStatus = heldVisaUnlock ? heldVisaUnlock.grantedStatus : passportEval.status;
    const unlockedByBilateralPassport =
      passportEval.passportTierApplied &&
      STATUS_EASE_RANK[passportEval.status] < STATUS_EASE_RANK[ordinaryEval.status];

    let shortNote = '';
    if (heldVisaUnlock) {
      shortNote = `Unlocked via ${heldVisaUnlock.visaLabel}`;
    } else if (unlockedByBilateralPassport) {
      shortNote = `Bilateral ${passportType.category.replace('_', ' ')} waiver`;
    } else if (passportEval.agreements.length > 0) {
      shortNote = passportEval.agreements[0].title;
    } else if (finalStatus === 'visa_free') {
      shortNote = 'Visa-free entry';
    } else if (finalStatus === 'eta_required') {
      shortNote = 'Online eTA / ESTA';
    } else if (finalStatus === 'visa_on_arrival') {
      shortNote = 'Visa on Arrival';
    } else if (finalStatus === 'e_visa') {
      shortNote = 'Online e-Visa';
    } else {
      shortNote = 'Consular visa required';
    }

    results.push({
      destination: dest,
      status: finalStatus,
      baselineOrdinaryStatus: ordinaryEval.status,
      maxStay: heldVisaUnlock ? heldVisaUnlock.maxStay : passportEval.maxStay,
      unlockedByHeldVisa: heldVisaUnlock?.visaId,
      unlockedByHeldVisaLabel: heldVisaUnlock?.visaLabel,
      unlockedByBilateralPassport,
      agreementTitle: passportEval.agreements[0]?.title,
      shortNote,
    });
  }

  return results.sort((a, b) => {
    const rankDiff = STATUS_EASE_RANK[a.status] - STATUS_EASE_RANK[b.status];
    if (rankDiff !== 0) return rankDiff;
    return a.destination.name.localeCompare(b.destination.name);
  });
}
