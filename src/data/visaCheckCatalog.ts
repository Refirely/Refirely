import { INITIAL_COUNTRIES } from './countries';
import { WORLD_COUNTRIES } from './userAccounts';
import {
  CountryPassportType,
  HeldVisaId,
  HeldVisaOption,
  OfficialPortalInfo,
  TravelPurpose,
  VisaRegion,
  VisaWorldCountry,
} from '../types/visaCheck';

// ============================================================================
// 1. REGIONAL BLOC MEMBERSHIPS (2026 Current International Law)
// ============================================================================

export const SCHENGEN_CODES = new Set([
  'AT', 'BE', 'BG', 'HR', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU',
  'IS', 'IT', 'LV', 'LI', 'LT', 'LU', 'MT', 'NL', 'NO', 'PL', 'PT', 'RO',
  'SK', 'SI', 'ES', 'SE', 'CH',
]);

export const EU_CODES = new Set([
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR',
  'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK',
  'SI', 'ES', 'SE',
]);

export const EEA_EFTA_CODES = new Set([...EU_CODES, 'IS', 'LI', 'NO', 'CH']);

export const ASEAN_CODES = new Set([
  'BN', 'KH', 'ID', 'LA', 'MY', 'MM', 'PH', 'SG', 'TH', 'VN',
]);

export const MERCOSUR_CODES = new Set([
  'AR', 'BR', 'PY', 'UY', 'BO', 'CL', 'CO', 'EC', 'PE',
]);

export const GCC_CODES = new Set(['AE', 'BH', 'KW', 'OM', 'QA', 'SA']);

export const CARICOM_CODES = new Set([
  'AG', 'BS', 'BB', 'BZ', 'DM', 'GD', 'GY', 'HT', 'JM', 'KN', 'LC', 'VC', 'SR', 'TT',
]);

export const ECOWAS_CODES = new Set([
  'BJ', 'BF', 'CV', 'CI', 'GM', 'GH', 'GN', 'GW', 'LR', 'ML', 'NE', 'NG', 'SN', 'SL', 'TG',
]);

export const EAC_CODES = new Set(['BI', 'CD', 'KE', 'RW', 'SS', 'TZ', 'UG']);

export const CA4_CODES = new Set(['SV', 'GT', 'HN', 'NI']);

export const CIS_VISA_FREE_CODES = new Set(['AM', 'AZ', 'BY', 'KZ', 'KG', 'MD', 'RU', 'TJ', 'UZ']);

export const APEC_CODES = new Set([
  'AU', 'BN', 'CA', 'CL', 'CN', 'HK', 'ID', 'JP', 'KR', 'MY', 'MX', 'NZ',
  'PG', 'PE', 'PH', 'RU', 'SG', 'TW', 'TH', 'US', 'VN',
]);

// High-mobility Tier 1 passports (Schengen Annex II + VWP + top Asian/Oceania passports)
export const TIER_1_PASSPORTS = new Set([
  ...EEA_EFTA_CODES,
  'GB', 'US', 'CA', 'AU', 'NZ', 'JP', 'KR', 'SG', 'MY', 'BN', 'AE',
  'AD', 'MC', 'SM', 'VA', 'HK', 'MO', 'TW', 'IL', 'CL', 'UY', 'AR', 'BR',
  'MX', 'CR', 'PA', 'BB', 'BS', 'KN', 'AG', 'LC', 'GD', 'VC', 'DM', 'SC', 'MU',
]);

// Upper-middle mobility Tier 2 passports (Eastern Europe non-EU, LATAM, GCC, Caribbean, Pacific)
export const TIER_2_PASSPORTS = new Set([
  'QA', 'KW', 'BH', 'OM', 'SA', 'CO', 'PE', 'PY', 'EC', 'SV', 'GT', 'HN', 'NI', 'BZ',
  'TT', 'JM', 'SR', 'GY', 'RS', 'ME', 'BA', 'AL', 'MK', 'UA', 'MD', 'GE', 'TR',
  'ZA', 'BW', 'NA', 'FJ', 'WS', 'TO', 'VU', 'PW', 'MH', 'FM', 'SB', 'KI', 'TV', 'RU', 'KZ', 'BY', 'TH',
]);

// Mid-mobility Tier 3 passports (Major emerging economies with strategic regional / e-Visa access)
export const TIER_3_PASSPORTS = new Set([
  'IN', 'CN', 'ID', 'PH', 'VN', 'DO', 'BO', 'VE', 'CU', 'MA', 'TN', 'EG', 'JO',
  'AZ', 'AM', 'UZ', 'KG', 'MN', 'MV', 'LK', 'BT', 'KH', 'LA', 'KE', 'TZ', 'UG',
  'RW', 'GH', 'SN', 'CV', 'GM', 'BJ', 'TG', 'CI', 'ZM', 'MW', 'SZ', 'LS', 'ZW',
  'MZ', 'AO', 'GA', 'MG', 'DZ', 'PG', 'TL', 'XK',
]);

// Extra sovereign states to ensure ALL 195+ UN members + key territories are available
const EXTRA_UN_COUNTRIES: { code: string; name: string; flag: string; region: VisaRegion }[] = [
  { code: 'KP', name: 'North Korea', flag: '🇰🇵', region: 'Asia' },
  { code: 'CD', name: 'DR Congo', flag: '🇨🇩', region: 'Africa' },
  { code: 'SS', name: 'South Sudan', flag: '🇸🇸', region: 'Africa' },
  { code: 'SO', name: 'Somalia', flag: '🇸🇴', region: 'Africa' },
  { code: 'PS', name: 'Palestine', flag: '🇵🇸', region: 'Middle East' },
  { code: 'AD', name: 'Andorra', flag: '🇦🇩', region: 'Europe' },
  { code: 'BT', name: 'Bhutan', flag: '🇧🇹', region: 'Asia' },
  { code: 'BW', name: 'Botswana', flag: '🇧🇼', region: 'Africa' },
  { code: 'KM', name: 'Comoros', flag: '🇰🇲', region: 'Africa' },
  { code: 'FM', name: 'Micronesia', flag: '🇫🇲', region: 'Oceania' },
  { code: 'KI', name: 'Kiribati', flag: '🇰🇮', region: 'Oceania' },
  { code: 'MH', name: 'Marshall Islands', flag: '🇲🇭', region: 'Oceania' },
  { code: 'NR', name: 'Nauru', flag: '🇳🇷', region: 'Oceania' },
  { code: 'ST', name: 'São Tomé and Príncipe', flag: '🇸🇹', region: 'Africa' },
  { code: 'TV', name: 'Tuvalu', flag: '🇹🇻', region: 'Oceania' },
  { code: 'MO', name: 'Macau', flag: '🇲🇴', region: 'Asia' },
  { code: 'XK', name: 'Kosovo', flag: '🇽🇰', region: 'Europe' },
  { code: 'VA', name: 'Vatican City', flag: '🇻🇦', region: 'Europe' },
];

const MIDDLE_EAST_CODES = new Set([
  'AE', 'BH', 'IL', 'IQ', 'IR', 'JO', 'KW', 'LB', 'OM', 'PS', 'QA', 'SA', 'SY', 'YE',
]);

const EUROPE_CODES = new Set([
  ...EEA_EFTA_CODES,
  'GB', 'AL', 'AD', 'AM', 'AZ', 'BA', 'BY', 'GE', 'GI', 'GG', 'IM', 'JE',
  'MC', 'MD', 'ME', 'MK', 'RS', 'RU', 'SM', 'TR', 'UA', 'VA', 'XK', 'FO',
]);

const ASIA_CODES = new Set([
  'AF', 'BD', 'BN', 'BT', 'CN', 'HK', 'ID', 'IN', 'JP', 'KG', 'KH', 'KP',
  'KR', 'KZ', 'LA', 'LK', 'MM', 'MN', 'MO', 'MV', 'MY', 'NP', 'PH', 'PK',
  'SG', 'TH', 'TJ', 'TL', 'TM', 'TW', 'UZ', 'VN',
]);

const AMERICAS_CODES = new Set([
  'AG', 'AI', 'AR', 'AW', 'BB', 'BL', 'BM', 'BO', 'BQ', 'BR', 'BS', 'BZ',
  'CA', 'CL', 'CO', 'CR', 'CU', 'CW', 'DM', 'DO', 'EC', 'FK', 'GD', 'GF',
  'GL', 'GP', 'GT', 'GY', 'HN', 'HT', 'JM', 'KN', 'KY', 'LC', 'MQ', 'MS',
  'MX', 'NI', 'PA', 'PE', 'PM', 'PR', 'PY', 'SR', 'SV', 'SX', 'TC', 'TT',
  'US', 'UY', 'VC', 'VE', 'VG', 'VI',
]);

const OCEANIA_CODES = new Set([
  'AS', 'AU', 'CK', 'CX', 'FJ', 'FM', 'GU', 'KI', 'MH', 'MP', 'NC', 'NF',
  'NR', 'NU', 'NZ', 'PF', 'PG', 'PW', 'SB', 'TO', 'TV', 'VU', 'WS',
]);

function inferVisaRegion(code: string): VisaRegion {
  if (MIDDLE_EAST_CODES.has(code)) return 'Middle East';
  if (EUROPE_CODES.has(code)) return 'Europe';
  if (ASIA_CODES.has(code)) return 'Asia';
  if (AMERICAS_CODES.has(code)) return 'Americas';
  if (OCEANIA_CODES.has(code)) return 'Oceania';
  return 'Africa';
}

function inferMobilityTier(code: string): 1 | 2 | 3 | 4 {
  if (TIER_1_PASSPORTS.has(code)) return 1;
  if (TIER_2_PASSPORTS.has(code)) return 2;
  if (TIER_3_PASSPORTS.has(code)) return 3;
  return 4;
}

// Build canonical deduplicated sorted list of all world countries
export const VISA_WORLD_COUNTRIES: VisaWorldCountry[] = (() => {
  const byCode = new Map<string, VisaWorldCountry>();

  const refirelyByCode = new Map<string, string>();
  for (const c of INITIAL_COUNTRIES) {
    const code = c.code.trim().toUpperCase();
    if (!refirelyByCode.has(code)) {
      refirelyByCode.set(code, c.id);
    }
  }

  // Prefer clean canonical names from WORLD_COUNTRIES first
  for (const wc of WORLD_COUNTRIES) {
    const code = wc.code.trim().toUpperCase();
    if (!byCode.has(code)) {
      byCode.set(code, {
        code,
        name: wc.name,
        flag: wc.flag,
        region: inferVisaRegion(code),
        refirelyCountryId: refirelyByCode.get(code),
        isSchengen: SCHENGEN_CODES.has(code),
        isEu: EU_CODES.has(code),
        isEeaOrEfta: EEA_EFTA_CODES.has(code),
        isAsean: ASEAN_CODES.has(code),
        isMercosur: MERCOSUR_CODES.has(code),
        isGcc: GCC_CODES.has(code),
        isCaricom: CARICOM_CODES.has(code),
        isEcowas: ECOWAS_CODES.has(code),
        isEac: EAC_CODES.has(code),
        isCa4: CA4_CODES.has(code),
        isCis: CIS_VISA_FREE_CODES.has(code),
        isApec: APEC_CODES.has(code),
        mobilityTier: inferMobilityTier(code),
      });
    }
  }

  // Merge any extra UN members
  for (const ex of EXTRA_UN_COUNTRIES) {
    if (!byCode.has(ex.code)) {
      byCode.set(ex.code, {
        code: ex.code,
        name: ex.name,
        flag: ex.flag,
        region: ex.region,
        refirelyCountryId: refirelyByCode.get(ex.code),
        isSchengen: SCHENGEN_CODES.has(ex.code),
        isEu: EU_CODES.has(ex.code),
        isEeaOrEfta: EEA_EFTA_CODES.has(ex.code),
        isAsean: ASEAN_CODES.has(ex.code),
        isMercosur: MERCOSUR_CODES.has(ex.code),
        isGcc: GCC_CODES.has(ex.code),
        isCaricom: CARICOM_CODES.has(ex.code),
        isEcowas: ECOWAS_CODES.has(ex.code),
        isEac: EAC_CODES.has(ex.code),
        isCa4: CA4_CODES.has(ex.code),
        isCis: CIS_VISA_FREE_CODES.has(ex.code),
        isApec: APEC_CODES.has(ex.code),
        mobilityTier: inferMobilityTier(ex.code),
      });
    }
  }

  // Merge remaining territories from INITIAL_COUNTRIES (e.g. Anguilla, BVI, Curaçao, etc.)
  for (const c of INITIAL_COUNTRIES) {
    const code = c.code.trim().toUpperCase();
    if (!byCode.has(code)) {
      // Strip parenthetical regional hints for clean passport/destination naming
      const cleanName = c.name.replace(/\s*\([^)]*\)\s*/g, '').trim();
      byCode.set(code, {
        code,
        name: cleanName || c.name,
        flag: c.flag,
        region: inferVisaRegion(code),
        refirelyCountryId: c.id,
        isSchengen: SCHENGEN_CODES.has(code),
        isEu: EU_CODES.has(code),
        isEeaOrEfta: EEA_EFTA_CODES.has(code),
        isAsean: ASEAN_CODES.has(code),
        isMercosur: MERCOSUR_CODES.has(code),
        isGcc: GCC_CODES.has(code),
        isCaricom: CARICOM_CODES.has(code),
        isEcowas: ECOWAS_CODES.has(code),
        isEac: EAC_CODES.has(code),
        isCa4: CA4_CODES.has(code),
        isCis: CIS_VISA_FREE_CODES.has(code),
        isApec: APEC_CODES.has(code),
        mobilityTier: inferMobilityTier(code),
      });
    }
  }

  return Array.from(byCode.values()).sort((a, b) => a.name.localeCompare(b.name));
})();

export const VISA_COUNTRY_MAP = new Map<string, VisaWorldCountry>(
  VISA_WORLD_COUNTRIES.map(c => [c.code, c])
);

// ============================================================================
// 2. COUNTRY-SPECIFIC PASSPORT TYPES DATABASE
// ============================================================================

const COUNTRY_SPECIFIC_PASSPORTS: Record<string, CountryPassportType[]> = {
  IN: [
    {
      id: 'in_ordinary',
      category: 'ordinary',
      label: 'Ordinary Passport (Navy Blue – Type P)',
      localName: 'ECNR / Regular Citizen Passport',
      coverColor: 'Navy Blue',
      coverColorHex: '#1e3a5f',
      description: 'Standard Indian citizen passport for tourism, business, education, and personal travel.',
      isPrivileged: false,
    },
    {
      id: 'in_official',
      category: 'official',
      label: 'Official Passport (White – Type S)',
      localName: 'Official / Government Duty Passport',
      coverColor: 'White',
      coverColorHex: '#e2e8f0',
      description: 'Issued to Indian government officials representing India abroad; unlocks MEA Diplomatic & Official waivers (excludes Diplomatic-Only treaties such as Portugal, Germany, France, Italy, Spain, and Japan).',
      isPrivileged: true,
    },
    {
      id: 'in_diplomatic',
      category: 'diplomatic',
      label: 'Diplomatic Passport (Maroon – Type D)',
      localName: 'Diplomatic / Consular Passport',
      coverColor: 'Maroon',
      coverColorHex: '#7f1d1d',
      description: 'Issued to Indian diplomats, MPs, and senior dignitaries; unlocks both Diplomatic & Official MEA waivers plus 34+ Diplomatic-Only agreements (incl. Portugal, France, Germany, Italy, Spain, Switzerland, Japan).',
      isPrivileged: true,
    },
    {
      id: 'in_ecr',
      category: 'ecr_ordinary',
      label: 'Ordinary Passport – ECR Category',
      localName: 'Emigration Check Required',
      coverColor: 'Navy Blue (ECR)',
      coverColorHex: '#c2410c',
      description: 'Standard Indian passport requiring Emigration Clearance (POE) specifically for employment travel to 18 notified ECR countries.',
      isPrivileged: false,
    },
  ],

  US: [
    {
      id: 'us_ordinary',
      category: 'ordinary',
      label: 'Regular Tourist Passport (Navy Blue)',
      localName: 'U.S. Passport Book',
      coverColor: 'Navy Blue',
      coverColorHex: '#1e3a8a',
      description: 'Standard U.S. citizen passport book valid for all international air, sea, and land travel.',
      isPrivileged: false,
    },
    {
      id: 'us_service',
      category: 'service',
      label: 'Service Passport (Gray)',
      localName: 'U.S. Service Passport',
      coverColor: 'Gray',
      coverColorHex: '#64748b',
      description: 'Issued to non-personal services contractors supporting the U.S. government abroad.',
      isPrivileged: true,
    },
    {
      id: 'us_official',
      category: 'official',
      label: 'Official Passport (Maroon)',
      localName: 'U.S. Official Passport',
      coverColor: 'Maroon',
      coverColorHex: '#7f1d1d',
      description: 'Issued to U.S. government employees and military personnel traveling on official assignments.',
      isPrivileged: true,
    },
    {
      id: 'us_diplomatic',
      category: 'diplomatic',
      label: 'Diplomatic Passport (Black)',
      localName: 'U.S. Diplomatic Passport',
      coverColor: 'Black',
      coverColorHex: '#0f172a',
      description: 'Issued to U.S. diplomats, ambassadors, and senior federal officials accredited overseas.',
      isPrivileged: true,
    },
    {
      id: 'us_card',
      category: 'passport_card',
      label: 'U.S. Passport Card (Land & Sea Only)',
      localName: 'Wallet-Size Border Card',
      coverColor: 'Blue Card',
      coverColorHex: '#2563eb',
      description: 'Valid ONLY for land and sea border crossings to Canada, Mexico, Bermuda, and the Caribbean (NOT valid for international flights).',
      isPrivileged: false,
    },
  ],

  GB: [
    {
      id: 'gb_ordinary',
      category: 'ordinary',
      label: 'British Citizen Passport (Blue / Burgundy)',
      localName: 'Full British Citizen',
      coverColor: 'Dark Blue',
      coverColorHex: '#172554',
      description: 'Standard UK citizen passport with full right of abode in the UK and Common Travel Area access to Ireland.',
      isPrivileged: false,
    },
    {
      id: 'gb_bno',
      category: 'bno',
      label: 'British National (Overseas) – BN(O)',
      localName: 'BN(O) Passport',
      coverColor: 'Dark Blue',
      coverColorHex: '#1e40af',
      description: 'Held by eligible Hong Kong residents; note some countries (e.g., Mainland China, select visas) treat BN(O) differently from British Citizen passports.',
      isPrivileged: false,
    },
    {
      id: 'gb_botc',
      category: 'botc',
      label: 'British Overseas Territories Citizen (BOTC)',
      localName: 'BOTC Passport',
      coverColor: 'Dark Blue',
      coverColorHex: '#1d4ed8',
      description: 'Issued to citizens of British Overseas Territories (Gibraltar, Bermuda, Cayman Islands, BVI, etc.).',
      isPrivileged: false,
    },
    {
      id: 'gb_diplomatic',
      category: 'diplomatic',
      label: 'Diplomatic / Official Passport',
      localName: 'HM Diplomatic Service',
      coverColor: 'Dark Blue (Diplomatic)',
      coverColorHex: '#0f172a',
      description: 'Issued to accredited UK diplomats and officials traveling on Crown duties.',
      isPrivileged: true,
    },
  ],

  TR: [
    {
      id: 'tr_ordinary',
      category: 'ordinary',
      label: 'Ordinary Passport (Burgundy – Umuma Mahsus)',
      localName: 'Bordo Pasaport',
      coverColor: 'Burgundy',
      coverColorHex: '#881337',
      description: 'Standard Turkish citizen passport; requires Schengen visa for EU entry.',
      isPrivileged: false,
    },
    {
      id: 'tr_special',
      category: 'special',
      label: 'Special Passport (Green – Hususi Damgalı)',
      localName: 'Yeşil Pasaport',
      coverColor: 'Green',
      coverColorHex: '#15803d',
      description: 'Issued to senior Turkish civil servants, former MPs, and qualifying exporters/lawyers; unlocks visa-free Schengen & 150+ countries!',
      isPrivileged: true,
    },
    {
      id: 'tr_service',
      category: 'service',
      label: 'Service Passport (Gray – Hizmet Damgalı)',
      localName: 'Gri Pasaport',
      coverColor: 'Gray',
      coverColorHex: '#475569',
      description: 'Issued to Turkish officials, athletes, and personnel on official state assignment; broad Schengen & bilateral visa waivers.',
      isPrivileged: true,
    },
    {
      id: 'tr_diplomatic',
      category: 'diplomatic',
      label: 'Diplomatic Passport (Black – Diplomatik)',
      localName: 'Siyah Pasaport',
      coverColor: 'Black',
      coverColorHex: '#0f172a',
      description: 'Issued to Turkish diplomats and senior state dignitaries with comprehensive global visa exemptions.',
      isPrivileged: true,
    },
  ],

  CN: [
    {
      id: 'cn_ordinary',
      category: 'ordinary',
      label: 'Ordinary Passport (Burgundy)',
      localName: '普通护照 (Pǔtōng Hùzhào)',
      coverColor: 'Burgundy',
      coverColorHex: '#881337',
      description: 'Standard PRC citizen passport for personal travel, tourism, and business.',
      isPrivileged: false,
    },
    {
      id: 'cn_public_affairs',
      category: 'public_affairs',
      label: 'Passport for Public Affairs (Dark Brown)',
      localName: '公务普通护照 (Gōngwù Pǔtōng)',
      coverColor: 'Dark Brown',
      coverColorHex: '#713f12',
      description: 'Issued to Chinese civil servants and state-enterprise personnel; unlocks 70+ bilateral visa waivers.',
      isPrivileged: true,
    },
    {
      id: 'cn_service',
      category: 'service',
      label: 'Service Passport (Dark Green)',
      localName: '公务护照 (Gōngwù Hùzhào)',
      coverColor: 'Dark Green',
      coverColorHex: '#14532d',
      description: 'Issued to mid-level PRC government officials traveling on official missions; extensive bilateral waivers.',
      isPrivileged: true,
    },
    {
      id: 'cn_diplomatic',
      category: 'diplomatic',
      label: 'Diplomatic Passport (Bright Red)',
      localName: '外交护照 (Wàijiāo Hùzhào)',
      coverColor: 'Bright Red',
      coverColorHex: '#b91c1c',
      description: 'Issued to senior Chinese diplomats and officials; unlocks 110+ bilateral visa exemption agreements including EU Schengen.',
      isPrivileged: true,
    },
  ],

  DE: [
    {
      id: 'de_ordinary',
      category: 'ordinary',
      label: 'Ordinary Passport (Burgundy – Reisepass)',
      localName: 'Reisepass',
      coverColor: 'Burgundy',
      coverColorHex: '#881337',
      description: 'Standard biometric German ePassport with EU freedom of movement and global visa-free access.',
      isPrivileged: false,
    },
    {
      id: 'de_official',
      category: 'official',
      label: 'Official / Service Passport (Red – Dienstpass)',
      localName: 'Dienstpass',
      coverColor: 'Red',
      coverColorHex: '#dc2626',
      description: 'Issued to German federal and state officials traveling on official government duties.',
      isPrivileged: true,
    },
    {
      id: 'de_diplomatic',
      category: 'diplomatic',
      label: 'Diplomatic Passport (Dark Blue – Diplomatenpass)',
      localName: 'Diplomatenpass',
      coverColor: 'Dark Blue',
      coverColorHex: '#1e3a8a',
      description: 'Issued to German diplomats, Bundestag leaders, and accredited international officials.',
      isPrivileged: true,
    },
    {
      id: 'de_temporary',
      category: 'temporary',
      label: 'Temporary Passport (Green – Vorläufiger Reisepass)',
      localName: 'Vorläufiger Reisepass',
      coverColor: 'Green',
      coverColorHex: '#16a34a',
      description: 'Non-biometric emergency 1-year passport; IMPORTANT: NOT eligible for U.S. ESTA Visa Waiver Program (requires a U.S. visa).',
      isPrivileged: false,
    },
  ],

  FR: [
    {
      id: 'fr_ordinary',
      category: 'ordinary',
      label: 'Ordinary Passport (Burgundy)',
      localName: 'Passeport Ordinaire',
      coverColor: 'Burgundy',
      coverColorHex: '#881337',
      description: 'Standard French biometric ePassport with full EU/EEA freedom of movement.',
      isPrivileged: false,
    },
    {
      id: 'fr_mission',
      category: 'official',
      label: 'Mission Passport',
      localName: 'Passeport de Mission',
      coverColor: 'Navy Blue',
      coverColorHex: '#1e3a8a',
      description: 'Issued to French civil servants and military personnel on temporary overseas missions.',
      isPrivileged: true,
    },
    {
      id: 'fr_service',
      category: 'service',
      label: 'Service Passport',
      localName: 'Passeport de Service',
      coverColor: 'Dark Blue',
      coverColorHex: '#1d4ed8',
      description: 'Issued to non-diplomatic French government staff posted abroad.',
      isPrivileged: true,
    },
    {
      id: 'fr_diplomatic',
      category: 'diplomatic',
      label: 'Diplomatic Passport',
      localName: 'Passeport Diplomatique',
      coverColor: 'Dark Slate',
      coverColorHex: '#0f172a',
      description: 'Issued to French diplomats and senior state authorities under Vienna Convention protocols.',
      isPrivileged: true,
    },
  ],

  CA: [
    {
      id: 'ca_ordinary',
      category: 'ordinary',
      label: 'Regular Passport (Navy Blue)',
      localName: 'Canadian Ordinary Passport',
      coverColor: 'Navy Blue',
      coverColorHex: '#1e3a8a',
      description: 'Standard Canadian citizen passport for international travel.',
      isPrivileged: false,
    },
    {
      id: 'ca_special',
      category: 'special',
      label: 'Special Passport (Green)',
      localName: 'Canadian Special Passport',
      coverColor: 'Green',
      coverColorHex: '#15803d',
      description: 'Issued to MPs, Senators, provincial ministers, and federal officials on government duty.',
      isPrivileged: true,
    },
    {
      id: 'ca_diplomatic',
      category: 'diplomatic',
      label: 'Diplomatic Passport (Maroon)',
      localName: 'Canadian Diplomatic Passport',
      coverColor: 'Maroon',
      coverColorHex: '#7f1d1d',
      description: 'Issued to Canadian diplomats, senior officials, and accredited delegates.',
      isPrivileged: true,
    },
  ],

  JP: [
    {
      id: 'jp_ordinary',
      category: 'ordinary',
      label: 'Ordinary Passport (5-Yr Blue / 10-Yr Crimson)',
      localName: '一般旅券 (Ippan Ryoken)',
      coverColor: 'Crimson / Navy',
      coverColorHex: '#991b1b',
      description: 'Standard Japanese citizen passport—one of the world’s highest-mobility travel documents.',
      isPrivileged: false,
    },
    {
      id: 'jp_official',
      category: 'official',
      label: 'Official Passport (Dark Green)',
      localName: '公用旅券 (Kōyō Ryoken)',
      coverColor: 'Dark Green',
      coverColorHex: '#14532d',
      description: 'Issued to Diet members and Japanese public servants traveling on official business.',
      isPrivileged: true,
    },
    {
      id: 'jp_diplomatic',
      category: 'diplomatic',
      label: 'Diplomatic Passport (Dark Brown)',
      localName: '外交旅券 (Gaikō Ryoken)',
      coverColor: 'Dark Brown',
      coverColorHex: '#713f12',
      description: 'Issued to Imperial Family members, Cabinet ministers, and accredited Japanese diplomats.',
      isPrivileged: true,
    },
  ],

  KR: [
    {
      id: 'kr_ordinary',
      category: 'ordinary',
      label: 'Ordinary Passport (Navy Blue / Green)',
      localName: '일반여권 (Ilban Yeogwon)',
      coverColor: 'Navy Blue',
      coverColorHex: '#1e3a8a',
      description: 'Standard South Korean next-generation biometric passport.',
      isPrivileged: false,
    },
    {
      id: 'kr_official',
      category: 'official',
      label: 'Official Passport (Dark Gray)',
      localName: '관용여권 (Gwanyong Yeogwon)',
      coverColor: 'Dark Gray',
      coverColorHex: '#475569',
      description: 'Issued to South Korean public officials and delegates on official duties.',
      isPrivileged: true,
    },
    {
      id: 'kr_diplomatic',
      category: 'diplomatic',
      label: 'Diplomatic Passport (Red)',
      localName: '외교관여권 (Oegyogwan Yeogwon)',
      coverColor: 'Red',
      coverColorHex: '#b91c1c',
      description: 'Issued to accredited South Korean diplomats and senior state leaders.',
      isPrivileged: true,
    },
  ],

  SG: [
    {
      id: 'sg_ordinary',
      category: 'ordinary',
      label: 'Ordinary Passport (Red)',
      localName: 'Singapore Biometric Passport',
      coverColor: 'Red',
      coverColorHex: '#b91c1c',
      description: 'Standard Singaporean citizen passport with top-ranked global visa-free mobility.',
      isPrivileged: false,
    },
    {
      id: 'sg_official',
      category: 'official',
      label: 'Official Passport (Dark Gray)',
      localName: 'Singapore Official Passport',
      coverColor: 'Gray',
      coverColorHex: '#475569',
      description: 'Issued to Singapore government officers traveling on official assignments.',
      isPrivileged: true,
    },
    {
      id: 'sg_diplomatic',
      category: 'diplomatic',
      label: 'Diplomatic Passport (Dark Blue)',
      localName: 'Singapore Diplomatic Passport',
      coverColor: 'Dark Blue',
      coverColorHex: '#1e3a8a',
      description: 'Issued to Singapore diplomats and senior ministers on state duty.',
      isPrivileged: true,
    },
  ],

  AE: [
    {
      id: 'ae_ordinary',
      category: 'ordinary',
      label: 'Regular Passport (Navy Blue)',
      localName: 'جواز سفر عادي',
      coverColor: 'Navy Blue',
      coverColorHex: '#1e3a8a',
      description: 'Standard UAE citizen passport with broad visa-free entry across Europe, Asia, and Americas.',
      isPrivileged: false,
    },
    {
      id: 'ae_special',
      category: 'special',
      label: 'Special Passport (Green)',
      localName: 'جواز سفر خاص',
      coverColor: 'Green',
      coverColorHex: '#15803d',
      description: 'Issued to senior UAE officials, Federal National Council members, and dignitaries.',
      isPrivileged: true,
    },
    {
      id: 'ae_diplomatic',
      category: 'diplomatic',
      label: 'Diplomatic Passport (Red)',
      localName: 'جواز سفر دبلوماسي',
      coverColor: 'Red',
      coverColorHex: '#991b1b',
      description: 'Issued to ruling family members, ministers, and UAE diplomatic corps.',
      isPrivileged: true,
    },
  ],

  SA: [
    {
      id: 'sa_ordinary',
      category: 'ordinary',
      label: 'Ordinary Passport (Green)',
      localName: 'جواز سفر عادي',
      coverColor: 'Green',
      coverColorHex: '#166534',
      description: 'Standard Saudi citizen passport with GCC freedom of movement.',
      isPrivileged: false,
    },
    {
      id: 'sa_special',
      category: 'special',
      label: 'Special Passport (Dark Green)',
      localName: 'جواز سفر خاص',
      coverColor: 'Dark Green',
      coverColorHex: '#14532d',
      description: 'Issued to senior Saudi officials and royal court personnel with bilateral visa exemptions.',
      isPrivileged: true,
    },
    {
      id: 'sa_diplomatic',
      category: 'diplomatic',
      label: 'Diplomatic Passport (Dark Green / Gold)',
      localName: 'جواز سفر دبلوماسي',
      coverColor: 'Dark Green',
      coverColorHex: '#064e3b',
      description: 'Issued to Saudi diplomats and ministers under bilateral diplomatic waiver treaties.',
      isPrivileged: true,
    },
  ],

  AU: [
    {
      id: 'au_ordinary',
      category: 'ordinary',
      label: 'Ordinary Passport (Navy Blue)',
      localName: 'Australian Passport (P-Series)',
      coverColor: 'Navy Blue',
      coverColorHex: '#1e3a8a',
      description: 'Standard Australian citizen passport with Trans-Tasman access to New Zealand.',
      isPrivileged: false,
    },
    {
      id: 'au_official',
      category: 'official',
      label: 'Official Passport (Teal-Gray)',
      localName: 'Australian Official Passport',
      coverColor: 'Teal-Gray',
      coverColorHex: '#0f766e',
      description: 'Issued to Australian government officials representing Australia overseas.',
      isPrivileged: true,
    },
    {
      id: 'au_diplomatic',
      category: 'diplomatic',
      label: 'Diplomatic Passport (Red)',
      localName: 'Australian Diplomatic Passport',
      coverColor: 'Red',
      coverColorHex: '#991b1b',
      description: 'Issued to Australian diplomats, ministers, and senior officials.',
      isPrivileged: true,
    },
  ],

  BR: [
    {
      id: 'br_ordinary',
      category: 'ordinary',
      label: 'Common Passport (Mercosur Blue)',
      localName: 'Passaporte Comum',
      coverColor: 'Blue',
      coverColorHex: '#1d4ed8',
      description: 'Standard Brazilian passport with Mercosur freedom of movement and Schengen visa-free access.',
      isPrivileged: false,
    },
    {
      id: 'br_official',
      category: 'official',
      label: 'Official Passport (Green)',
      localName: 'Passaporte Oficial',
      coverColor: 'Green',
      coverColorHex: '#15803d',
      description: 'Issued to Brazilian public servants and federal delegates traveling on official duty.',
      isPrivileged: true,
    },
    {
      id: 'br_diplomatic',
      category: 'diplomatic',
      label: 'Diplomatic Passport (Red)',
      localName: 'Passaporte Diplomático',
      coverColor: 'Red',
      coverColorHex: '#b91c1c',
      description: 'Issued to Brazilian diplomats, Congress leaders, and senior state officials.',
      isPrivileged: true,
    },
  ],

  RU: [
    {
      id: 'ru_ordinary',
      category: 'ordinary',
      label: 'Ordinary International Passport (Red)',
      localName: 'Заграничный паспорт',
      coverColor: 'Red',
      coverColorHex: '#991b1b',
      description: 'Standard Russian biometric international travel passport.',
      isPrivileged: false,
    },
    {
      id: 'ru_service',
      category: 'service',
      label: 'Service Passport (Blue)',
      localName: 'Служебный паспорт',
      coverColor: 'Blue',
      coverColorHex: '#1d4ed8',
      description: 'Issued to Russian federal/regional civil servants on official missions; unlocks select bilateral waivers.',
      isPrivileged: true,
    },
    {
      id: 'ru_diplomatic',
      category: 'diplomatic',
      label: 'Diplomatic Passport (Green)',
      localName: 'Дипломатический паспорт',
      coverColor: 'Green',
      coverColorHex: '#166534',
      description: 'Issued to accredited Russian diplomats and senior federal leaders.',
      isPrivileged: true,
    },
  ],

  PH: [
    {
      id: 'ph_ordinary',
      category: 'ordinary',
      label: 'Regular Passport (Maroon)',
      localName: 'Regular Philippine Passport',
      coverColor: 'Maroon',
      coverColorHex: '#881337',
      description: 'Standard Filipino citizen passport with ASEAN visa-free access.',
      isPrivileged: false,
    },
    {
      id: 'ph_official',
      category: 'official',
      label: 'Official Passport (Red)',
      localName: 'Philippine Official Passport',
      coverColor: 'Red',
      coverColorHex: '#dc2626',
      description: 'Issued to Philippine government officials on official travel; unlocks 70+ bilateral waivers.',
      isPrivileged: true,
    },
    {
      id: 'ph_diplomatic',
      category: 'diplomatic',
      label: 'Diplomatic Passport (Dark Blue)',
      localName: 'Philippine Diplomatic Passport',
      coverColor: 'Dark Blue',
      coverColorHex: '#1e3a8a',
      description: 'Issued to Filipino diplomats, Cabinet secretaries, and senior dignitaries.',
      isPrivileged: true,
    },
  ],

  ID: [
    {
      id: 'id_ordinary',
      category: 'ordinary',
      label: 'Ordinary Passport (Red-White / Green)',
      localName: 'Paspor Biasa',
      coverColor: 'Red / Green',
      coverColorHex: '#15803d',
      description: 'Standard Indonesian passport with ASEAN visa-free entry.',
      isPrivileged: false,
    },
    {
      id: 'id_service',
      category: 'service',
      label: 'Service Passport (Blue – Paspor Dinas)',
      localName: 'Paspor Dinas',
      coverColor: 'Blue',
      coverColorHex: '#1d4ed8',
      description: 'Issued to Indonesian civil servants on official assignment; broad bilateral visa waivers across 85+ nations.',
      isPrivileged: true,
    },
    {
      id: 'id_diplomatic',
      category: 'diplomatic',
      label: 'Diplomatic Passport (Black)',
      localName: 'Paspor Diplomatik',
      coverColor: 'Black',
      coverColorHex: '#0f172a',
      description: 'Issued to Indonesian diplomats and senior officials with extensive bilateral exemptions.',
      isPrivileged: true,
    },
  ],

  TH: [
    {
      id: 'th_ordinary',
      category: 'ordinary',
      label: 'Ordinary Passport (Maroon)',
      localName: 'หนังสือเดินทางบุคคลทั่วไป',
      coverColor: 'Maroon',
      coverColorHex: '#881337',
      description: 'Standard Thai citizen passport with ASEAN & Japan/Korea visa-free entry.',
      isPrivileged: false,
    },
    {
      id: 'th_official',
      category: 'official',
      label: 'Official Passport (Dark Blue)',
      localName: 'หนังสือเดินทางราชการ',
      coverColor: 'Dark Blue',
      coverColorHex: '#1e3a8a',
      description: 'Issued to Thai government officers on official travel; unlocks 90+ bilateral visa waivers.',
      isPrivileged: true,
    },
    {
      id: 'th_diplomatic',
      category: 'diplomatic',
      label: 'Diplomatic Passport (Red)',
      localName: 'หนังสือเดินทางทูต',
      coverColor: 'Red',
      coverColorHex: '#b91c1c',
      description: 'Issued to Thai diplomats and royal/state representatives; broad Schengen & global exemptions.',
      isPrivileged: true,
    },
  ],

  VN: [
    {
      id: 'vn_ordinary',
      category: 'ordinary',
      label: 'Ordinary Passport (Navy Blue)',
      localName: 'Hộ chiếu Phổ thông',
      coverColor: 'Navy Blue',
      coverColorHex: '#1e3a8a',
      description: 'Standard Vietnamese citizen passport with ASEAN visa-free access.',
      isPrivileged: false,
    },
    {
      id: 'vn_official',
      category: 'official',
      label: 'Official Passport (Dark Green)',
      localName: 'Hộ chiếu Công vụ',
      coverColor: 'Dark Green',
      coverColorHex: '#14532d',
      description: 'Issued to Vietnamese officials; unlocks 85+ bilateral visa waiver agreements.',
      isPrivileged: true,
    },
    {
      id: 'vn_diplomatic',
      category: 'diplomatic',
      label: 'Diplomatic Passport (Red)',
      localName: 'Hộ chiếu Ngoại giao',
      coverColor: 'Red',
      coverColorHex: '#b91c1c',
      description: 'Issued to Vietnamese diplomats and senior officials with 95+ bilateral waivers.',
      isPrivileged: true,
    },
  ],

  PK: [
    {
      id: 'pk_ordinary',
      category: 'ordinary',
      label: 'Ordinary Passport (Green)',
      localName: 'Standard Machine-Readable / e-Passport',
      coverColor: 'Green',
      coverColorHex: '#166534',
      description: 'Standard Pakistani citizen passport for tourism, business, and personal travel.',
      isPrivileged: false,
    },
    {
      id: 'pk_official',
      category: 'official',
      label: 'Official Passport (Blue)',
      localName: 'Pakistan Official Passport',
      coverColor: 'Blue',
      coverColorHex: '#1d4ed8',
      description: 'Issued to Pakistani government officials on official duty; unlocks 50+ bilateral agreements.',
      isPrivileged: true,
    },
    {
      id: 'pk_diplomatic',
      category: 'diplomatic',
      label: 'Diplomatic Passport (Red)',
      localName: 'Pakistan Diplomatic Passport',
      coverColor: 'Red',
      coverColorHex: '#991b1b',
      description: 'Issued to Pakistani diplomats, parliamentarians, and senior officials; 75+ bilateral waivers.',
      isPrivileged: true,
    },
  ],

  BD: [
    {
      id: 'bd_ordinary',
      category: 'ordinary',
      label: 'Ordinary Passport (Green)',
      localName: 'Bangladesh e-Passport',
      coverColor: 'Green',
      coverColorHex: '#166534',
      description: 'Standard Bangladeshi citizen passport for private international travel.',
      isPrivileged: false,
    },
    {
      id: 'bd_official',
      category: 'official',
      label: 'Official Passport (Blue)',
      localName: 'Government Official Passport',
      coverColor: 'Blue',
      coverColorHex: '#1d4ed8',
      description: 'Issued to Bangladeshi public servants on official duty; unlocks bilateral waivers across Asia & partners.',
      isPrivileged: true,
    },
    {
      id: 'bd_diplomatic',
      category: 'diplomatic',
      label: 'Diplomatic Passport (Red)',
      localName: 'Diplomatic Passport',
      coverColor: 'Red',
      coverColorHex: '#b91c1c',
      description: 'Issued to Bangladeshi diplomats, MPs, and senior dignitaries with extensive bilateral waivers.',
      isPrivileged: true,
    },
  ],

  MX: [
    {
      id: 'mx_ordinary',
      category: 'ordinary',
      label: 'Ordinary Passport (Dark Green)',
      localName: 'Pasaporte Ordinario',
      coverColor: 'Dark Green',
      coverColorHex: '#14532d',
      description: 'Standard Mexican citizen passport with Schengen, UK, and Japan visa-free access.',
      isPrivileged: false,
    },
    {
      id: 'mx_official',
      category: 'official',
      label: 'Official Passport (Gray)',
      localName: 'Pasaporte Oficial',
      coverColor: 'Gray',
      coverColorHex: '#475569',
      description: 'Issued to Mexican federal legislators and officials on official representation.',
      isPrivileged: true,
    },
    {
      id: 'mx_diplomatic',
      category: 'diplomatic',
      label: 'Diplomatic Passport (Black)',
      localName: 'Pasaporte Diplomático',
      coverColor: 'Black',
      coverColorHex: '#0f172a',
      description: 'Issued to Mexican diplomats, ambassadors, and senior state officials.',
      isPrivileged: true,
    },
  ],

  ZA: [
    {
      id: 'za_ordinary',
      category: 'ordinary',
      label: 'Regular Tourist Passport (Green)',
      localName: 'South African Ordinary Passport',
      coverColor: 'Green',
      coverColorHex: '#166534',
      description: 'Standard South African citizen passport with SADC and broad regional mobility.',
      isPrivileged: false,
    },
    {
      id: 'za_official',
      category: 'official',
      label: 'Official Passport (Blue)',
      localName: 'South African Official Passport',
      coverColor: 'Blue',
      coverColorHex: '#1d4ed8',
      description: 'Issued to South African officials traveling on government business; unlocks 80+ bilateral waivers.',
      isPrivileged: true,
    },
    {
      id: 'za_diplomatic',
      category: 'diplomatic',
      label: 'Diplomatic Passport (Maroon)',
      localName: 'South African Diplomatic Passport',
      coverColor: 'Maroon',
      coverColorHex: '#7f1d1d',
      description: 'Issued to South African diplomats and cabinet officials with extensive Schengen & global waivers.',
      isPrivileged: true,
    },
  ],

  NG: [
    {
      id: 'ng_ordinary',
      category: 'ordinary',
      label: 'Standard Passport (Green)',
      localName: 'ECOWAS Nigerian Passport',
      coverColor: 'Green',
      coverColorHex: '#15803d',
      description: 'Standard Nigerian passport with full ECOWAS West African freedom of movement.',
      isPrivileged: false,
    },
    {
      id: 'ng_official',
      category: 'official',
      label: 'Official Passport (Blue)',
      localName: 'Nigerian Official Passport',
      coverColor: 'Blue',
      coverColorHex: '#1d4ed8',
      description: 'Issued to Nigerian government officials on official travel; unlocks bilateral diplomatic/official agreements.',
      isPrivileged: true,
    },
    {
      id: 'ng_diplomatic',
      category: 'diplomatic',
      label: 'Diplomatic Passport (Red)',
      localName: 'Nigerian Diplomatic Passport',
      coverColor: 'Red',
      coverColorHex: '#b91c1c',
      description: 'Issued to accredited Nigerian diplomats and senior federal leaders.',
      isPrivileged: true,
    },
  ],

  MY: [
    {
      id: 'my_ordinary',
      category: 'ordinary',
      label: 'International Ordinary Passport (Red)',
      localName: 'Pasport Malaysia Antarabangsa',
      coverColor: 'Red',
      coverColorHex: '#b91c1c',
      description: 'Standard Malaysian biometric passport with high global visa-free mobility.',
      isPrivileged: false,
    },
    {
      id: 'my_official',
      category: 'official',
      label: 'Official Passport (Dark Blue)',
      localName: 'Pasport Rasmi',
      coverColor: 'Dark Blue',
      coverColorHex: '#1e3a8a',
      description: 'Issued to Malaysian civil servants traveling on official duties.',
      isPrivileged: true,
    },
    {
      id: 'my_diplomatic',
      category: 'diplomatic',
      label: 'Diplomatic Passport (Dark Maroon)',
      localName: 'Pasport Diplomatik',
      coverColor: 'Dark Maroon',
      coverColorHex: '#7f1d1d',
      description: 'Issued to Malaysian diplomats, ministers, and royal representatives.',
      isPrivileged: true,
    },
  ],
};

/**
 * Returns the authentic country-specific passport types for ANY selected nationality.
 */
export function getPassportTypesForCountry(countryCode: string): CountryPassportType[] {
  const code = countryCode.trim().toUpperCase();
  if (COUNTRY_SPECIFIC_PASSPORTS[code]) {
    return COUNTRY_SPECIFIC_PASSPORTS[code];
  }

  const country = VISA_COUNTRY_MAP.get(code);
  const name = country?.name || 'National';

  // Regional cover color conventions for realistic, authentic UX across all 200+ countries
  let ordinaryColor = 'Navy Blue';
  let ordinaryHex = '#1e3a8a';
  if (EU_CODES.has(code)) {
    ordinaryColor = code === 'HR' ? 'Dark Blue' : 'Burgundy (EU)';
    ordinaryHex = code === 'HR' ? '#1e3a8a' : '#881337';
  } else if (ECOWAS_CODES.has(code) || GCC_CODES.has(code)) {
    ordinaryColor = code === 'AE' || code === 'KW' || code === 'QA' ? 'Navy / Maroon' : 'Green';
    ordinaryHex = code === 'AE' || code === 'KW' ? '#1e3a8a' : code === 'QA' ? '#7f1d1d' : '#166534';
  } else if (MERCOSUR_CODES.has(code) || CARICOM_CODES.has(code)) {
    ordinaryColor = 'Dark Blue';
    ordinaryHex = '#1d4ed8';
  } else if (country?.region === 'Asia') {
    ordinaryColor = 'Burgundy / Navy';
    ordinaryHex = '#7f1d1d';
  }

  return [
    {
      id: `${code.toLowerCase()}_ordinary`,
      category: 'ordinary',
      label: `${name} Ordinary Passport`,
      localName: 'Standard Citizen Passport',
      coverColor: ordinaryColor,
      coverColorHex: ordinaryHex,
      description: `Standard biometric/machine-readable citizen passport issued by ${name} for personal, tourism, and business travel.`,
      isPrivileged: false,
    },
    {
      id: `${code.toLowerCase()}_official`,
      category: 'official',
      label: `${name} Official / Service Passport`,
      localName: 'Government Duty Passport',
      coverColor: 'Official Blue / Green',
      coverColorHex: '#0f766e',
      description: `Issued to ${name} government officials and civil servants traveling on official state missions; eligible for bilateral official passport waivers.`,
      isPrivileged: true,
    },
    {
      id: `${code.toLowerCase()}_diplomatic`,
      category: 'diplomatic',
      label: `${name} Diplomatic Passport`,
      localName: 'Diplomatic Corps Passport',
      coverColor: 'Diplomatic Maroon / Black',
      coverColorHex: '#7f1d1d',
      description: `Issued to accredited ${name} diplomats and senior dignitaries; qualifies for bilateral diplomatic visa waiver agreements.`,
      isPrivileged: true,
    },
  ];
}

// ============================================================================
// 3. TRAVEL PURPOSE OPTIONS
// ============================================================================

export const TRAVEL_PURPOSE_OPTIONS: {
  id: TravelPurpose;
  label: string;
  shortDesc: string;
}[] = [
  { id: 'tourism', label: 'Tourism & Short Visit', shortDesc: 'Leisure, sightseeing, visiting friends/family' },
  { id: 'business', label: 'Business & Conferences', shortDesc: 'Meetings, trade shows, negotiations (non-payroll)' },
  { id: 'digital_nomad', label: 'Digital Nomad / Remote Work', shortDesc: 'Extended stay while working remotely abroad' },
  { id: 'retirement', label: 'Retirement / Long-Stay Relocation', shortDesc: 'Passive-income, pensioner, or FIRE residency' },
  { id: 'transit', label: 'Airport Transit / Layover', shortDesc: 'Connecting flight or short 24–96h stopover' },
  { id: 'official_duty', label: 'Official / Diplomatic Mission', shortDesc: 'Government delegation, UN, or consular assignment' },
  { id: 'study', label: 'Study & Academic Exchange', shortDesc: 'University degree, research, or language course' },
  { id: 'medical', label: 'Medical & Wellness Travel', shortDesc: 'Planned clinical care or hospital procedure' },
];

// ============================================================================
// 4. EXISTING VALID THIRD-COUNTRY VISAS ("POWER VISAS")
// ============================================================================

export const HELD_VISA_OPTIONS: HeldVisaOption[] = [
  {
    id: 'us_visa',
    label: 'Valid U.S. Visa (B1/B2, H1B, F1) or Green Card',
    shortLabel: 'U.S. Visa (B1/B2)',
    sublabel: 'Unlocks 35+ countries incl. Mexico, Costa Rica, Panama, Balkans, UAE VoA (IN), Philippines, Turkey e-Visa',
    issuingAuthority: 'United States',
    isPrimaryHighlight: true,
    exampleCountriesUnlocked: ['Mexico', 'Costa Rica', 'Panama', 'UAE (IN)', 'Philippines (IN)', 'Serbia', 'Georgia', 'Turkey e-Visa'],
  },
  {
    id: 'schengen_visa',
    label: 'Valid Schengen Visa (Multi-Entry C) or EU Residence',
    shortLabel: 'Schengen Visa',
    sublabel: 'Unlocks Cyprus, Balkans (Albania, Montenegro, Serbia), Georgia, Mexico, Peru, Saudi VoA, Turkey e-Visa',
    issuingAuthority: 'Schengen Area (EU)',
    isPrimaryHighlight: true,
    exampleCountriesUnlocked: ['Cyprus', 'Mexico', 'Montenegro', 'Albania', 'Serbia', 'Georgia', 'Saudi Arabia', 'Morocco e-Visa'],
  },
  {
    id: 'uk_visa',
    label: 'Valid UK Visa (Standard Visitor, Skilled Worker, eVisa)',
    shortLabel: 'UK Visa',
    sublabel: 'Unlocks Ireland (BIVS/SSVWP), Mexico, Balkans, UAE VoA (IN), Saudi VoA, Philippines, Turkey e-Visa',
    issuingAuthority: 'United Kingdom',
    exampleCountriesUnlocked: ['Ireland', 'Mexico', 'UAE (IN)', 'Saudi Arabia', 'Serbia', 'Georgia', 'Gibraltar'],
  },
  {
    id: 'canada_visa',
    label: 'Valid Canadian Visa (TRV) or Canada PR Card',
    shortLabel: 'Canada Visa / PR',
    sublabel: 'Unlocks Mexico, Costa Rica, Panama, Peru, Dominican Republic, Georgia, Caribbean territories',
    issuingAuthority: 'Canada',
    exampleCountriesUnlocked: ['Mexico', 'Costa Rica', 'Panama', 'Dominican Republic', 'Peru', 'Georgia'],
  },
  {
    id: 'japan_visa',
    label: 'Valid Japan Visa (Multi-Entry / Residence)',
    shortLabel: 'Japan Visa',
    sublabel: 'Unlocks Mexico, Panama, Philippines (IN), Taiwan TAC, Singapore 96h VFTF',
    issuingAuthority: 'Japan',
    exampleCountriesUnlocked: ['Mexico', 'Panama', 'Philippines (IN)', 'Taiwan (TAC)', 'Singapore VFTF'],
  },
  {
    id: 'australia_visa',
    label: 'Valid Australia / New Zealand Visa',
    shortLabel: 'Australia / NZ Visa',
    sublabel: 'Unlocks Panama, Peru (IN/CN), Philippines (IN), Georgia, Taiwan TAC, Morocco e-Visa',
    issuingAuthority: 'Australia / New Zealand',
    exampleCountriesUnlocked: ['Panama', 'Peru', 'Philippines (IN)', 'Georgia', 'Taiwan (TAC)'],
  },
  {
    id: 'gcc_resident',
    label: 'GCC Residence Permit (UAE, Saudi, Qatar, Kuwait, Oman, Bahrain)',
    shortLabel: 'GCC Residence',
    sublabel: 'Unlocks Oman visa-free/e-Visa, Bahrain e-Visa, Saudi e-Visa, Georgia (90 days), Azerbaijan VoA, Armenia',
    issuingAuthority: 'Gulf Cooperation Council',
    exampleCountriesUnlocked: ['Georgia', 'Oman', 'Bahrain', 'Saudi Arabia', 'Azerbaijan', 'Armenia'],
  },
  {
    id: 'apec_card',
    label: 'APEC Business Travel Card (ABTC)',
    shortLabel: 'APEC Business Card',
    sublabel: 'Unlocks 60–90 day visa-free business entry across 19 participating Asia-Pacific economies',
    issuingAuthority: 'APEC Economies',
    exampleCountriesUnlocked: ['Japan', 'Australia', 'South Korea', 'China', 'Singapore', 'Thailand', 'Mexico', 'Chile'],
  },
];

// ============================================================================
// 5. OFFICIAL GOVERNMENT VISA & FOREIGN OFFICE PORTALS (110+ Countries)
// ============================================================================

export const OFFICIAL_GOVERNMENT_PORTALS: Record<string, OfficialPortalInfo> = {
  // Europe
  PT: { authorityName: 'Ministry of Foreign Affairs of Portugal (Vistos MNE)', officialUrl: 'https://vistos.mne.gov.pt/en/', notes: 'Official Portuguese consular & Schengen visa portal.' },
  ES: { authorityName: 'Ministry of Foreign Affairs of Spain (Exteriores)', officialUrl: 'https://www.exteriores.gob.es/', notes: 'Official Spanish consular & visa information portal.' },
  FR: { authorityName: 'France-Visas (Official Visa Portal of France)', officialUrl: 'https://france-visas.gouv.fr/en/', notes: 'Official French Government Visa Wizard and online filing.' },
  DE: { authorityName: 'Federal Foreign Office of Germany (Auswärtiges Amt)', officialUrl: 'https://www.auswaertiges-amt.de/en/visa-service', notes: 'Official German visa regulations & Schengen requirements.' },
  IT: { authorityName: 'Ministry of Foreign Affairs of Italy (Il Visto per l’Italia)', officialUrl: 'https://vistoperitalia.esteri.it/', notes: 'Official Italian visa eligibility questionnaire & consular portal.' },
  GB: { authorityName: 'UK Government (GOV.UK – Check if you need a UK visa)', officialUrl: 'https://www.gov.uk/check-uk-visa', eVisaUrl: 'https://www.gov.uk/guidance/apply-for-an-electronic-travel-authorisation-eta', eVisaLabel: 'Official UK ETA Portal' },
  IE: { authorityName: 'Irish Immigration Service (Department of Justice)', officialUrl: 'https://www.irishimmigration.ie/coming-to-visit-ireland/visit-ireland-travel-path/', notes: 'Includes BIVS & Short Stay Visa Waiver Programme details.' },
  NL: { authorityName: 'Netherlands Worldwide (Ministry of Foreign Affairs)', officialUrl: 'https://www.netherlandsworldwide.nl/visa-the-netherlands', notes: 'Official Dutch Schengen & Caribbean visa portal.' },
  BE: { authorityName: 'FPS Foreign Affairs of Belgium', officialUrl: 'https://diplomatie.belgium.be/en/travel-belgium/visa-belgium', notes: 'Official Belgian Immigration & Visa Office guide.' },
  CH: { authorityName: 'State Secretariat for Migration (SEM Switzerland)', officialUrl: 'https://www.sem.admin.ch/en', eVisaUrl: 'https://www.swiss-visa.ch/', eVisaLabel: 'Official Swiss Online Visa Portal', notes: 'Official Swiss entry, Schengen, and ID/visa overview.' },
  AT: { authorityName: 'Austrian Federal Ministry for European & International Affairs', officialUrl: 'https://www.bmeia.gv.at/en/travel-stay/entrance-and-residence-in-austria/visa', notes: 'Official Austrian visa & diplomatic waiver portal.' },
  GR: { authorityName: 'Hellenic Republic Ministry of Foreign Affairs', officialUrl: 'https://www.mfa.gr/en/visas/', notes: 'Official Greek Schengen & National Visa portal.' },
  SE: { authorityName: 'Swedish Migration Agency (Migrationsverket)', officialUrl: 'https://www.migrationsverket.se/English/Private-individuals/Visiting-Sweden.html' },
  NO: { authorityName: 'Norwegian Directorate of Immigration (UDI)', officialUrl: 'https://www.udi.no/en/want-to-apply/visit-and-holiday/' },
  DK: { authorityName: 'New to Denmark (Danish Immigration Service)', officialUrl: 'https://nyidanmark.dk/en-GB/You-want-to-apply/Short-stay-visa' },
  FI: { authorityName: 'Ministry for Foreign Affairs of Finland', officialUrl: 'https://um.fi/visa-to-visit-finland' },
  IS: { authorityName: 'Directorate of Immigration of Iceland (Útlendingastofnun)', officialUrl: 'https://island.is/en/do-you-need-a-visa' },
  PL: { authorityName: 'Ministry of Foreign Affairs of Poland (Gov.pl)', officialUrl: 'https://www.gov.pl/web/diplomacy/visas' },
  CZ: { authorityName: 'Ministry of Foreign Affairs of the Czech Republic', officialUrl: 'https://mzv.gov.cz/jnp/en/information_for_aliens/index.html' },
  HU: { authorityName: 'Consular Services of Hungary (Konzinfo)', officialUrl: 'https://konzinfo.mfa.gov.hu/en/how-apply-visa' },
  HR: { authorityName: 'Ministry of Foreign and European Affairs of Croatia', officialUrl: 'https://mvep.gov.hr/services-for-citizens/consular-information-22802/visas-22807/visa-requirements-overview-22879/22879' },
  SI: { authorityName: 'Ministry of Foreign and European Affairs of Slovenia (GOV.SI)', officialUrl: 'https://www.gov.si/en/topics/entry-and-residence/' },
  SK: { authorityName: 'Ministry of Foreign and European Affairs of Slovakia', officialUrl: 'https://www.mzv.sk/en/' },
  RO: { authorityName: 'Ministry of Foreign Affairs of Romania (eViza)', officialUrl: 'https://eviza.mae.ro/' },
  BG: { authorityName: 'Ministry of Foreign Affairs of Bulgaria', officialUrl: 'https://www.mfa.bg/en/services-travel/consular-services/travel-bulgaria/visa-bulgaria' },
  CY: { authorityName: 'Ministry of Foreign Affairs of Cyprus', officialUrl: 'https://www.gov.cy/mfa/en/' },
  MT: { authorityName: 'Identità Malta (Central Visa Unit)', officialUrl: 'https://identita.gov.mt/central-visa-unit-main-page/' },
  EE: { authorityName: 'Ministry of Foreign Affairs of Estonia (Välisministeerium)', officialUrl: 'https://www.vm.ee/en' },
  LV: { authorityName: 'Ministry of Foreign Affairs of Latvia', officialUrl: 'https://www.mfa.gov.lv/en/entry-latvia' },
  LT: { authorityName: 'Migration Department of Lithuania (MIGRIS)', officialUrl: 'https://www.migracija.lt/en/' },
  LU: { authorityName: 'Guichet.lu – Government of Luxembourg Immigration', officialUrl: 'https://guichet.public.lu/en/citoyens/immigration.html' },
  TR: { authorityName: 'Ministry of Foreign Affairs of Türkiye', officialUrl: 'https://www.mfa.gov.tr/visa-information-for-foreigners.en.mfa', eVisaUrl: 'https://www.evisa.gov.tr/en/', eVisaLabel: 'Official Türkiye e-Visa Portal' },
  RS: { authorityName: 'Ministry of Foreign Affairs of the Republic of Serbia', officialUrl: 'https://www.mfa.gov.rs/en/citizens/travel-serbia/visa-regime', eVisaUrl: 'https://welcometoserbia.gov.rs/', eVisaLabel: 'Welcome to Serbia Official Portal' },
  ME: { authorityName: 'Ministry of Foreign Affairs of Montenegro', officialUrl: 'https://www.gov.me/en/diplomatic-missions/visas-for-foreign-citizens' },
  AL: { authorityName: 'Ministry for Europe and Foreign Affairs of Albania (e-Visa)', officialUrl: 'https://e-visa.al/' },
  BA: { authorityName: 'Ministry of Foreign Affairs of Bosnia and Herzegovina', officialUrl: 'https://www.mvp.gov.ba/konzularne_informacije/vize/Default.aspx' },
  MK: { authorityName: 'Ministry of Foreign Affairs of North Macedonia', officialUrl: 'https://mfa.gov.mk/' },
  GE: { authorityName: 'Ministry of Foreign Affairs of Georgia (Geoconsul / e-Visa)', officialUrl: 'https://www.geoconsul.gov.ge/', eVisaUrl: 'https://www.evisa.gov.ge/', eVisaLabel: 'Official Georgia e-Visa Portal' },
  AM: { authorityName: 'Ministry of Foreign Affairs of Armenia', officialUrl: 'https://www.mfa.am/en/visa/', eVisaUrl: 'https://evisa.mfa.am/', eVisaLabel: 'Official Armenia e-Visa Portal' },
  AZ: { authorityName: 'ASAN Visa – Official Republic of Azerbaijan e-Visa Portal', officialUrl: 'https://evisa.gov.az/en/' },
  UA: { authorityName: 'Ministry of Foreign Affairs of Ukraine', officialUrl: 'https://mfa.gov.ua/en/consular-affairs/entry-and-stay-foreigners-ukraine' },
  MD: { authorityName: 'Ministry of Foreign Affairs of Moldova (eVisa)', officialUrl: 'https://www.evisa.gov.md/' },
  RU: { authorityName: 'Consular Department of the Ministry of Foreign Affairs of Russia', officialUrl: 'https://electronic-visa.kdmid.ru/index_en.html' },

  // Americas
  US: { authorityName: 'U.S. Department of State – Bureau of Consular Affairs', officialUrl: 'https://travel.state.gov/content/travel/en/us-visas.html', eVisaUrl: 'https://esta.cbp.dhs.gov/', eVisaLabel: 'Official U.S. ESTA Portal' },
  CA: { authorityName: 'Immigration, Refugees and Citizenship Canada (IRCC)', officialUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada.html', eVisaUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/eta.html', eVisaLabel: 'Official Canada eTA Portal' },
  MX: { authorityName: 'Secretaría de Relaciones Exteriores (SRE Mexico)', officialUrl: 'https://www.gob.mx/sre/acciones-y-programas/visas-para-extranjeros', notes: 'Confirms exemptions for valid US, Canada, UK, Japan, and Schengen visa holders.' },
  CR: { authorityName: 'Dirección General de Migración y Extranjería (Costa Rica)', officialUrl: 'https://www.migracion.go.cr/' },
  PA: { authorityName: 'Servicio Nacional de Migración de Panamá', officialUrl: 'https://www.migracion.gob.pa/' },
  CO: { authorityName: 'Cancillería – Ministerio de Relaciones Exteriores de Colombia', officialUrl: 'https://www.cancilleria.gov.co/tramites_servicios/visa' },
  BR: { authorityName: 'Ministério das Relações Exteriores do Brasil (Itamaraty)', officialUrl: 'https://www.gov.br/mre/pt-br/assuntos/portal-consular/vistos/informacoes-sobre-vistos-para-estrangeiros-viajarem-ao-brasil' },
  AR: { authorityName: 'Dirección Nacional de Migraciones (Argentina)', officialUrl: 'https://www.argentina.gob.ar/interior/migraciones' },
  CL: { authorityName: 'Ministerio de Relaciones Exteriores de Chile (Consular)', officialUrl: 'https://serviciosconsulares.cl/tramites/visas' },
  PE: { authorityName: 'Ministerio de Relaciones Exteriores del Perú', officialUrl: 'https://www.gob.pe/rree' },
  EC: { authorityName: 'Ministerio de Relaciones Exteriores y Movilidad Humana (Ecuador)', officialUrl: 'https://www.cancilleria.gob.ec/visas/' },
  UY: { authorityName: 'Ministerio de Relaciones Exteriores de Uruguay', officialUrl: 'https://www.gub.uy/ministerio-relaciones-exteriores/' },
  DO: { authorityName: 'Ministerio de Relaciones Exteriores (MIREX Dominican Republic)', officialUrl: 'https://mirex.gob.do/' },
  BZ: { authorityName: 'Belize Immigration Department', officialUrl: 'https://immigration.gov.bz/visa/visa-who-qualify/' },
  BB: { authorityName: 'Barbados Immigration Department', officialUrl: 'https://immigration.gov.bb/' },
  BS: { authorityName: 'Department of Immigration of The Bahamas', officialUrl: 'https://www.immigration.gov.bs/' },
  JM: { authorityName: 'Passport, Immigration and Citizenship Agency (PICA Jamaica)', officialUrl: 'https://www.pica.gov.jm/immigration/entry-visa-requirements' },
  CU: { authorityName: 'Ministerio de Relaciones Exteriores de Cuba (eVisaCuba)', officialUrl: 'https://evisacuba.cu/en/inicio' },

  // Asia
  IN: { authorityName: 'Ministry of Home Affairs / Bureau of Immigration (Indian e-Visa)', officialUrl: 'https://indianvisaonline.gov.in/', eVisaUrl: 'https://indianvisaonline.gov.in/evisa/tvoa.html', eVisaLabel: 'Official Indian e-Visa Portal' },
  JP: { authorityName: 'Ministry of Foreign Affairs of Japan (MOFA)', officialUrl: 'https://www.mofa.go.jp/j_info/visit/visa/index.html', eVisaUrl: 'https://www.evisa.mofa.go.jp/', eVisaLabel: 'Official JAPAN eVISA Portal' },
  KR: { authorityName: 'Korea Visa Portal (Ministry of Justice)', officialUrl: 'https://www.visa.go.kr/', eVisaUrl: 'https://www.k-eta.go.kr/', eVisaLabel: 'Official K-ETA Portal' },
  SG: { authorityName: 'Immigration & Checkpoints Authority of Singapore (ICA)', officialUrl: 'https://www.ica.gov.sg/enter-transit-depart/entering-singapore/visa_requirements' },
  TH: { authorityName: 'Ministry of Foreign Affairs of Thailand (Thai e-Visa)', officialUrl: 'https://www.thaievisa.go.th/' },
  MY: { authorityName: 'Immigration Department of Malaysia (IMI)', officialUrl: 'https://www.imi.gov.my/index.php/en/main-services/visa/', eVisaUrl: 'https://malaysiavisa.imi.gov.my/', eVisaLabel: 'Official Malaysia eVISA' },
  VN: { authorityName: 'Vietnam Immigration Department (Official e-Visa Portal)', officialUrl: 'https://evisa.gov.vn/' },
  ID: { authorityName: 'Directorate General of Immigration of Indonesia (Molina e-Visa)', officialUrl: 'https://evisa.imigrasi.go.id/' },
  PH: { authorityName: 'Department of Foreign Affairs of the Philippines (Official eVisa)', officialUrl: 'https://evisa.gov.ph/' },
  CN: { authorityName: 'National Immigration Administration / MFA China', officialUrl: 'https://en.nia.gov.cn/' },
  HK: { authorityName: 'Immigration Department of Hong Kong SAR', officialUrl: 'https://www.immd.gov.hk/eng/services/visas/visit-transit/visit-visa-entry-permit.html' },
  TW: { authorityName: 'Bureau of Consular Affairs (BOCA Taiwan)', officialUrl: 'https://www.boca.gov.tw/mp-2.html', eVisaUrl: 'https://niaspeedy.immigration.gov.tw/nia_southeast/', eVisaLabel: 'Official Taiwan TAC Portal' },
  LK: { authorityName: 'Department of Immigration & Emigration of Sri Lanka (ETA)', officialUrl: 'https://eta.gov.lk/' },
  NP: { authorityName: 'Department of Immigration of Nepal', officialUrl: 'https://www.immigration.gov.np/' },
  MV: { authorityName: 'Maldives Immigration (IMUGA)', officialUrl: 'https://www.immigration.gov.mv/' },
  KH: { authorityName: 'Ministry of Foreign Affairs of Cambodia (Official e-Visa)', officialUrl: 'https://www.evisa.gov.kh/' },
  LA: { authorityName: 'Ministry of Foreign Affairs of Lao PDR (eVisa)', officialUrl: 'https://laoevisa.gov.la/' },
  BT: { authorityName: 'Department of Immigration of Bhutan', officialUrl: 'https://immi.gov.bt/' },
  KZ: { authorityName: 'Ministry of Foreign Affairs of Kazakhstan (vmp.gov.kz)', officialUrl: 'https://www.vmp.gov.kz/en/' },
  UZ: { authorityName: 'Ministry of Foreign Affairs of Uzbekistan (e-Visa)', officialUrl: 'https://e-visa.gov.uz/' },
  KG: { authorityName: 'Ministry of Foreign Affairs of Kyrgyzstan (e-Visa)', officialUrl: 'https://www.evisa.e-gov.kg/' },
  PK: { authorityName: 'Directorate General of Immigration & Passports (Pakistan Online Visa)', officialUrl: 'https://visa.nadra.gov.pk/' },
  BD: { authorityName: 'Department of Immigration & Passports of Bangladesh', officialUrl: 'https://www.visa.gov.bd/' },
  MN: { authorityName: 'Immigration Agency of Mongolia (eVisa)', officialUrl: 'https://evisa.mn/en' },

  // Middle East
  AE: { authorityName: 'UAE Federal Authority for Identity & Citizenship (ICP / u.ae)', officialUrl: 'https://u.ae/en/information-and-services/visa-and-emirates-id' },
  SA: { authorityName: 'Saudi Ministry of Foreign Affairs / Visit Saudi eVisa', officialUrl: 'https://ksavisa.sa/', eVisaUrl: 'https://visa.visitsaudi.com/', eVisaLabel: 'Official Saudi Tourist eVisa' },
  QA: { authorityName: 'Visit Qatar / Ministry of Interior (Hayya Portal)', officialUrl: 'https://hayya.qa/' },
  OM: { authorityName: 'Royal Oman Police (Official eVisa Portal)', officialUrl: 'https://evisa.rop.gov.om/' },
  BH: { authorityName: 'Nationality, Passports & Residence Affairs (Bahrain eVisa)', officialUrl: 'https://www.evisa.gov.bh/' },
  KW: { authorityName: 'Ministry of Interior of Kuwait (e-Visa)', officialUrl: 'https://evisa.moi.gov.kw/' },
  JO: { authorityName: 'Ministry of Interior of Jordan (e-Services)', officialUrl: 'https://eservices.moi.gov.jo/' },
  IL: { authorityName: 'Population and Immigration Authority of Israel (ETA-IL)', officialUrl: 'https://israel-entry.piba.gov.il/' },

  // Oceania
  AU: { authorityName: 'Department of Home Affairs of Australia (Visa Finder)', officialUrl: 'https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-finder' },
  NZ: { authorityName: 'Immigration New Zealand (INZ)', officialUrl: 'https://www.immigration.govt.nz/new-zealand-visas', eVisaUrl: 'https://nzeta.immigration.govt.nz/', eVisaLabel: 'Official NZeTA Portal' },
  FJ: { authorityName: 'Fiji Immigration Department', officialUrl: 'https://www.immigration.gov.fj/' },

  // Africa
  ZA: { authorityName: 'Department of Home Affairs of South Africa', officialUrl: 'https://www.dha.gov.za/', eVisaUrl: 'https://ehome.dha.gov.za/epermit/home', eVisaLabel: 'Official South Africa eVisa' },
  MA: { authorityName: 'Ministry of Foreign Affairs of Morocco (Accès Maroc e-Visa)', officialUrl: 'https://www.acces-maroc.ma/' },
  EG: { authorityName: 'Ministry of Interior of Egypt (Official e-Visa Portal)', officialUrl: 'https://visa2egypt.gov.eg/' },
  KE: { authorityName: 'Republic of Kenya Electronic Travel Authorisation (eTA)', officialUrl: 'https://www.etakenya.go.ke/' },
  TZ: { authorityName: 'Tanzania Immigration Department (Official e-Visa)', officialUrl: 'https://visa.immigration.go.tz/' },
  MU: { authorityName: 'Passport and Immigration Office of Mauritius', officialUrl: 'https://passport.govmu.org/passport/' },
  SC: { authorityName: 'Seychelles Electronic Border System (Official Gov Portal)', officialUrl: 'https://seychelles.govtas.com/' },
  RW: { authorityName: 'Directorate General of Immigration and Emigration of Rwanda', officialUrl: 'https://www.migration.gov.rw/' },
  NA: { authorityName: 'Ministry of Home Affairs, Immigration, Safety & Security (Namibia)', officialUrl: 'https://eservices.mhaiss.gov.na/' },
  NG: { authorityName: 'Nigeria Immigration Service (NIS)', officialUrl: 'https://immigration.gov.ng/' },
  ET: { authorityName: 'Ethiopian Immigration and Citizenship Service (e-Visa)', officialUrl: 'https://www.evisa.gov.et/' },
  TN: { authorityName: 'Ministry of Foreign Affairs of Tunisia', officialUrl: 'https://www.diplomatie.gov.tn/' },
  GH: { authorityName: 'Ghana Immigration Service', officialUrl: 'https://gis.gov.gh/' },
  UG: { authorityName: 'Directorate of Citizenship and Immigration Control (Uganda e-Visa)', officialUrl: 'https://visas.immigration.go.ug/' },
  ZM: { authorityName: 'Department of Immigration of Zambia (e-Services)', officialUrl: 'https://eservices.zambiaimmigration.gov.zm/' },
};

export function getOfficialPortalForDestination(country: VisaWorldCountry): OfficialPortalInfo {
  if (OFFICIAL_GOVERNMENT_PORTALS[country.code]) {
    return OFFICIAL_GOVERNMENT_PORTALS[country.code];
  }
  return {
    authorityName: `Ministry of Foreign Affairs & Immigration — ${country.name}`,
    officialUrl: `https://www.iatatravelcentre.com/`,
    notes: `Check the official embassy or consulate of ${country.name} or IATA Timatic travel requirements before booking.`,
  };
}

// ============================================================================
// 6. THIRD-COUNTRY HELD VISA EXEMPTION RULES (US, SCHENGEN, UK, CA, JP, AU, GCC, APEC)
// ============================================================================

export interface ThirdCountryExemptionRule {
  destinationCode: string;
  acceptedVisas: HeldVisaId[];
  grantedStatus: 'visa_free_conditional' | 'visa_on_arrival' | 'e_visa' | 'eta_required';
  maxStay: string;
  onlyForOriginCodes?: string[]; // If restricted to specific nationalities (e.g. UAE VoA for India, Ireland BIVS)
  excludedOriginCodes?: string[];
  conditions: string[];
  officialReferenceUrl?: string;
}

export const THIRD_COUNTRY_EXEMPTION_RULES: ThirdCountryExemptionRule[] = [
  // Americas
  {
    destinationCode: 'MX',
    acceptedVisas: ['us_visa', 'schengen_visa', 'uk_visa', 'canada_visa', 'japan_visa'],
    grantedStatus: 'visa_free_conditional',
    maxStay: 'Up to 180 days',
    conditions: [
      'Visa must be valid, multiple-entry, and unexpired at the time of entry to Mexico.',
      'Valid for tourism, business, or transit without remuneration in Mexico.',
      'Final stay length (up to 180 days) is determined by INM officers at arrival.',
    ],
    officialReferenceUrl: 'https://www.gob.mx/sre/acciones-y-programas/visas-para-extranjeros',
  },
  {
    destinationCode: 'CR',
    acceptedVisas: ['us_visa', 'canada_visa'],
    grantedStatus: 'visa_free_conditional',
    maxStay: 'Up to 30 days',
    conditions: [
      'Valid multiple-entry U.S. (B1/B2, D, or C1/D) or Canadian tourist/residence visa.',
      'Note: Schengen visa alone does NOT exempt Costa Rica entry (only US/Canada visas or PR cards qualify).',
      'Passport must have at least 6 months validity and proof of onward travel.',
    ],
    officialReferenceUrl: 'https://www.migracion.go.cr/',
  },
  {
    destinationCode: 'PA',
    acceptedVisas: ['us_visa', 'schengen_visa', 'uk_visa', 'canada_visa', 'japan_visa', 'australia_visa'],
    grantedStatus: 'visa_free_conditional',
    maxStay: 'Up to 30 days',
    conditions: [
      'Held visa must be multiple-entry, valid for at least 6 months, and PREVIOUSLY USED at least once to enter the issuing country.',
      'Must demonstrate $500 USD economic solvency and confirmed return ticket.',
    ],
    officialReferenceUrl: 'https://www.migracion.gob.pa/',
  },
  {
    destinationCode: 'DO',
    acceptedVisas: ['us_visa', 'schengen_visa', 'uk_visa', 'canada_visa'],
    grantedStatus: 'visa_free_conditional',
    maxStay: 'Up to 30 days',
    conditions: [
      'Valid visa or residence permit from the U.S., Canada, UK, or EU/Schengen state exempts the Dominican consular tourist visa.',
      'Must complete free Dominican E-Ticket online before arrival.',
    ],
    officialReferenceUrl: 'https://mirex.gob.do/',
  },
  {
    destinationCode: 'PE',
    acceptedVisas: ['us_visa', 'schengen_visa', 'uk_visa', 'canada_visa', 'australia_visa'],
    grantedStatus: 'visa_free_conditional',
    maxStay: 'Up to 180 days (within 12 months)',
    onlyForOriginCodes: ['IN', 'CN'],
    conditions: [
      'Indian and Chinese citizens holding a visa valid for at least 6 months (or PR) from the US, Canada, UK, Australia, or Schengen enter Peru visa-free.',
      'Valid for tourism and non-remunerated business visits.',
    ],
    officialReferenceUrl: 'https://www.gob.pe/rree',
  },
  {
    destinationCode: 'CL',
    acceptedVisas: ['us_visa', 'canada_visa'],
    grantedStatus: 'visa_free_conditional',
    maxStay: 'Up to 90 days',
    onlyForOriginCodes: ['CN'],
    conditions: [
      'Chinese passport holders with a valid U.S. or Canadian visa (min. 6 months remaining validity, excluding transit C visas) are exempt from a Chilean tourist visa.',
    ],
    officialReferenceUrl: 'https://serviciosconsulares.cl/tramites/visas',
  },
  {
    destinationCode: 'CO',
    acceptedVisas: ['us_visa', 'schengen_visa'],
    grantedStatus: 'visa_free_conditional',
    maxStay: 'Up to 90 days',
    onlyForOriginCodes: ['IN', 'CN', 'TH', 'VN', 'KH', 'NI'],
    conditions: [
      'Select nationalities (including India, China, Thailand, Vietnam) with a valid Schengen or U.S. visa/residence permit (min. 180 days validity upon entry) are visa-exempt for Colombia.',
    ],
    officialReferenceUrl: 'https://www.cancilleria.gov.co/tramites_servicios/visa',
  },
  {
    destinationCode: 'CA',
    acceptedVisas: ['us_visa'],
    grantedStatus: 'eta_required',
    maxStay: 'Up to 6 months',
    onlyForOriginCodes: ['BR', 'MX', 'AR', 'CR', 'PA', 'UY', 'PH', 'TH', 'MA', 'AG', 'KN', 'LC', 'VC', 'TT', 'SC'],
    conditions: [
      'Eligible nationalities holding a valid U.S. non-immigrant visa (or who held a Canadian visa in the last 10 years) can fly to Canada with a fast CAD $7 eTA instead of a full consular visa.',
      'Applies to air arrivals only; land/sea arrivals still require a visitor visa.',
    ],
    officialReferenceUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/eta/eligibility.html',
  },
  {
    destinationCode: 'BZ',
    acceptedVisas: ['us_visa', 'schengen_visa', 'canada_visa'],
    grantedStatus: 'visa_free_conditional',
    maxStay: 'Up to 30 days',
    conditions: [
      'Holders of a valid multiple-entry U.S., Canadian, or Schengen visa (or PR card) are exempt from a Belizean consular visa.',
    ],
    officialReferenceUrl: 'https://immigration.gov.bz/visa/visa-who-qualify/',
  },
  {
    destinationCode: 'GT',
    acceptedVisas: ['us_visa', 'schengen_visa', 'canada_visa'],
    grantedStatus: 'visa_free_conditional',
    maxStay: 'Up to 90 days',
    conditions: [
      'Category B nationalities holding a valid U.S., Canadian, or Schengen visa are exempt from obtaining a Guatemalan visa in advance.',
    ],
  },
  {
    destinationCode: 'HN',
    acceptedVisas: ['us_visa', 'schengen_visa', 'canada_visa'],
    grantedStatus: 'visa_free_conditional',
    maxStay: 'Up to 90 days',
    conditions: [
      'Holders of a valid U.S., Canadian, or Schengen visa (valid min. 6 months) may enter Honduras visa-free.',
    ],
  },
  {
    destinationCode: 'SV',
    acceptedVisas: ['us_visa', 'schengen_visa', 'canada_visa'],
    grantedStatus: 'visa_free_conditional',
    maxStay: 'Up to 90 days',
    conditions: [
      'Valid U.S., Canadian, or Schengen visa holders are exempt from consular visas (tourist card fee ~$12 at arrival).',
    ],
  },
  {
    destinationCode: 'AW',
    acceptedVisas: ['us_visa', 'schengen_visa', 'uk_visa', 'canada_visa'],
    grantedStatus: 'visa_free_conditional',
    maxStay: 'Up to 30 days',
    conditions: [
      'Valid multiple-entry U.S., Canadian, UK, Ireland, or Schengen visa/residence permit grants visa-free entry to Aruba.',
    ],
  },
  {
    destinationCode: 'CW',
    acceptedVisas: ['us_visa', 'schengen_visa', 'uk_visa', 'canada_visa'],
    grantedStatus: 'visa_free_conditional',
    maxStay: 'Up to 30 days',
    conditions: [
      'Valid multiple-entry U.S., Canadian, UK, or Schengen visa exempts the Caribbean visa requirement for Curaçao.',
    ],
  },
  {
    destinationCode: 'BM',
    acceptedVisas: ['us_visa', 'uk_visa', 'canada_visa'],
    grantedStatus: 'visa_free_conditional',
    maxStay: 'Up to 90 days',
    conditions: [
      'Holders of a valid multiple-entry U.S., UK, or Canadian visa/residence valid for at least 45 days beyond departure may enter Bermuda visa-free.',
    ],
  },
  {
    destinationCode: 'KY',
    acceptedVisas: ['us_visa', 'uk_visa', 'canada_visa'],
    grantedStatus: 'visa_free_conditional',
    maxStay: 'Up to 30 days',
    conditions: [
      'Select visa-required nationals holding a valid US/UK/Canada residence or arriving directly from those countries may qualify for visa exemption.',
    ],
  },

  // Europe & Balkans & Caucasus
  {
    destinationCode: 'CY',
    acceptedVisas: ['schengen_visa'],
    grantedStatus: 'visa_free_conditional',
    maxStay: 'Up to 90 days within 180 days',
    conditions: [
      'Requires a valid DOUBLE-ENTRY or MULTIPLE-ENTRY Schengen Type C visa (or Schengen national D visa / EU residence permit).',
      'Time spent in Cyprus does NOT deduct from your 90-day Schengen clock.',
    ],
    officialReferenceUrl: 'https://www.gov.cy/mfa/en/',
  },
  {
    destinationCode: 'IE',
    acceptedVisas: ['uk_visa'],
    grantedStatus: 'visa_free_conditional',
    maxStay: 'Up to 90 days (or remaining UK stay)',
    onlyForOriginCodes: ['IN', 'CN', 'TR', 'SA', 'QA', 'OM', 'BH', 'KW', 'KZ', 'UZ', 'TH', 'ID', 'PH', 'VN', 'RS', 'ME', 'BA', 'UA', 'CO', 'PE'],
    conditions: [
      'Under Ireland’s Short Stay Visa Waiver Programme & British-Irish Visa Scheme (BIVS), you must first clear UK immigration on your valid UK short-stay visa before traveling to Ireland.',
      'Not valid for UK transit, marriage, or long-term work/student visas unless BIVS-endorsed.',
    ],
    officialReferenceUrl: 'https://www.irishimmigration.ie/coming-to-visit-ireland/short-stay-visa-waiver-programme/',
  },
  {
    destinationCode: 'AL',
    acceptedVisas: ['us_visa', 'schengen_visa', 'uk_visa'],
    grantedStatus: 'visa_free_conditional',
    maxStay: 'Up to 90 days within 180 days',
    conditions: [
      'Valid multiple-entry Schengen Type C, U.S., or UK visa that has been PREVIOUSLY USED at least once in the issuing area (or valid residence permit).',
    ],
    officialReferenceUrl: 'https://e-visa.al/',
  },
  {
    destinationCode: 'ME',
    acceptedVisas: ['us_visa', 'schengen_visa', 'uk_visa', 'canada_visa', 'australia_visa', 'japan_visa'],
    grantedStatus: 'visa_free_conditional',
    maxStay: 'Up to 30 days',
    conditions: [
      'Holders of a valid multiple-entry Schengen, US, UK, Canada, Australia, New Zealand, or Japan visa/residence permit may enter Montenegro visa-free for up to 30 days.',
    ],
    officialReferenceUrl: 'https://www.gov.me/en/diplomatic-missions/visas-for-foreign-citizens',
  },
  {
    destinationCode: 'RS',
    acceptedVisas: ['us_visa', 'schengen_visa', 'uk_visa'],
    grantedStatus: 'visa_free_conditional',
    maxStay: 'Up to 90 days within 180 days',
    conditions: [
      'Holders of a valid Schengen, U.S., UK, or EU member state visa/residence permit may enter Serbia visa-free for up to 90 days.',
    ],
    officialReferenceUrl: 'https://www.mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
  },
  {
    destinationCode: 'BA',
    acceptedVisas: ['us_visa', 'schengen_visa', 'uk_visa'],
    grantedStatus: 'visa_free_conditional',
    maxStay: 'Up to 30 days',
    conditions: [
      'Valid multiple-entry Schengen, U.S., UK, or EU member state visa allows visa-free entry into Bosnia and Herzegovina for up to 30 days.',
    ],
    officialReferenceUrl: 'https://www.mvp.gov.ba/konzularne_informacije/vize/Default.aspx',
  },
  {
    destinationCode: 'MK',
    acceptedVisas: ['us_visa', 'schengen_visa', 'uk_visa', 'canada_visa'],
    grantedStatus: 'visa_free_conditional',
    maxStay: 'Up to 15 days per entry',
    conditions: [
      'Valid multiple-entry Schengen Type C, U.S., UK, or Canadian visa (valid at least 5 days beyond intended stay) grants up to 15 days visa-free entry.',
    ],
    officialReferenceUrl: 'https://mfa.gov.mk/',
  },
  {
    destinationCode: 'GE',
    acceptedVisas: ['us_visa', 'schengen_visa', 'uk_visa', 'canada_visa', 'japan_visa', 'australia_visa', 'gcc_resident'],
    grantedStatus: 'visa_free_conditional',
    maxStay: 'Up to 90 days within 180 days',
    conditions: [
      'Georgia grants 90-day visa-free entry to holders of valid visas or residence permits from 50 approved countries (including US, Schengen/EU, UK, Canada, Japan, Australia, and GCC states).',
      'Visa/residence must be valid on the date of entry to Georgia; carry printed proof and hotel/insurance bookings.',
    ],
    officialReferenceUrl: 'https://www.geoconsul.gov.ge/',
  },
  {
    destinationCode: 'TR',
    acceptedVisas: ['us_visa', 'schengen_visa', 'uk_visa'],
    grantedStatus: 'e_visa',
    maxStay: 'Up to 30 days (Single Entry e-Visa)',
    onlyForOriginCodes: ['IN', 'PK', 'BD', 'EG', 'PH', 'VN', 'DZ', 'NG', 'GH', 'KE', 'LK', 'NP', 'IQ', 'YE', 'AF', 'PS', 'LY', 'SD'],
    conditions: [
      'Unlocks fast 5-minute online Türkiye e-Visa (instead of a slow embassy sticker visa) when holding a valid US, UK, Ireland, or Schengen visa/residence permit.',
      'Must hold return ticket, hotel booking, and $50/day proof of funds.',
    ],
    officialReferenceUrl: 'https://www.evisa.gov.tr/en/',
  },
  {
    destinationCode: 'GI',
    acceptedVisas: ['uk_visa', 'schengen_visa'],
    grantedStatus: 'visa_free_conditional',
    maxStay: 'Up to 21 days',
    conditions: [
      'Holders of a UK multiple-entry visa valid for 6+ months or a valid Schengen multiple-entry visa (for select nationals) can enter Gibraltar visa-free.',
    ],
  },

  // Middle East
  {
    destinationCode: 'AE',
    acceptedVisas: ['us_visa', 'uk_visa', 'schengen_visa'],
    grantedStatus: 'visa_on_arrival',
    maxStay: '14 days (extendable once for 14 days)',
    onlyForOriginCodes: ['IN'],
    conditions: [
      'Indian passport holders with a valid U.S. visit visa/Green Card, UK residence/visa, or EU/Schengen residence permit (valid for at least 6 months from arrival) qualify for a 14-day UAE Visa on Arrival.',
      'Note: For Schengen, official UAE ICP rules require an EU/Schengen Residence Permit or eligible multi-entry visa valid 6+ months; confirm with airline/ICP prior to flight.',
    ],
    officialReferenceUrl: 'https://www.mofa.gov.ae/en/visa-exemptions-for-non-citizen',
  },
  {
    destinationCode: 'SA',
    acceptedVisas: ['us_visa', 'uk_visa', 'schengen_visa', 'gcc_resident'],
    grantedStatus: 'visa_on_arrival',
    maxStay: 'Up to 90 days (1-Year Multiple Entry)',
    conditions: [
      'Holders of a valid U.S., UK, or Schengen business/tourist visa that has been USED AT LEAST ONCE (bearing an entry stamp from the issuing country) qualify for Saudi Visa on Arrival or instant e-Visa.',
      'GCC residents with qualifying professions and min. 3-month valid residency qualify for the Saudi e-Visa.',
    ],
    officialReferenceUrl: 'https://ksavisa.sa/',
  },
  {
    destinationCode: 'OM',
    acceptedVisas: ['us_visa', 'schengen_visa', 'uk_visa', 'canada_visa', 'japan_visa', 'australia_visa', 'gcc_resident'],
    grantedStatus: 'e_visa',
    maxStay: 'Up to 30 days (14 days visa-free for GCC residents)',
    conditions: [
      'Valid US, Schengen, UK, Canada, Japan, or Australia visa unlocks Oman’s simplified unsponsored 26B e-Visa (and 14-day visa-free entry for GCC residents).',
    ],
    officialReferenceUrl: 'https://evisa.rop.gov.om/',
  },
  {
    destinationCode: 'QA',
    acceptedVisas: ['us_visa', 'schengen_visa', 'uk_visa', 'canada_visa', 'australia_visa', 'gcc_resident'],
    grantedStatus: 'e_visa',
    maxStay: 'Up to 30 days (Hayya A3 / A2 e-Visa)',
    conditions: [
      'Valid US, UK, Canada, Schengen, Australia, or New Zealand visa unlocks the fast online Hayya A3 Electronic Travel Authorization (ETA); GCC residents use Hayya A2.',
    ],
    officialReferenceUrl: 'https://hayya.qa/',
  },
  {
    destinationCode: 'BH',
    acceptedVisas: ['us_visa', 'schengen_visa', 'uk_visa', 'gcc_resident'],
    grantedStatus: 'e_visa',
    maxStay: 'Up to 14–30 days',
    conditions: [
      'Valid US, UK, Schengen, or GCC residence permit simplifies eligibility for Bahrain’s online e-Visa.',
    ],
    officialReferenceUrl: 'https://www.evisa.gov.bh/',
  },

  // Asia
  {
    destinationCode: 'PH',
    acceptedVisas: ['us_visa', 'schengen_visa', 'uk_visa', 'canada_visa', 'japan_visa', 'australia_visa'],
    grantedStatus: 'visa_free_conditional',
    maxStay: '14 days (extendable by 7 days = 21 days max)',
    onlyForOriginCodes: ['IN', 'CN'],
    conditions: [
      'Indian nationals (14 days) and Chinese nationals (7 days) holding a valid, unexpired AJACSSUK visa (Australia, Japan, Canada, Schengen, Singapore, UK, or US) enter the Philippines visa-free for tourism.',
      'Passport must be valid at least 6 months beyond stay with confirmed onward/return ticket.',
    ],
    officialReferenceUrl: 'https://evisa.gov.ph/',
  },
  {
    destinationCode: 'TW',
    acceptedVisas: ['us_visa', 'schengen_visa', 'uk_visa', 'canada_visa', 'japan_visa', 'australia_visa'],
    grantedStatus: 'eta_required',
    maxStay: 'Up to 14 days (Free Online TAC Certificate)',
    onlyForOriginCodes: ['IN', 'ID', 'VN', 'MM', 'KH', 'LA'],
    conditions: [
      'Eligible Asian nationals (including India, Indonesia, Vietnam) holding a valid (or expired within 10 years) US, Canada, UK, Schengen, Australia, NZ, or Japan visa can obtain a FREE instant online Travel Authorization Certificate (TAC).',
    ],
    officialReferenceUrl: 'https://niaspeedy.immigration.gov.tw/nia_southeast/',
  },
  {
    destinationCode: 'SG',
    acceptedVisas: ['us_visa', 'schengen_visa', 'uk_visa', 'canada_visa', 'japan_visa', 'australia_visa'],
    grantedStatus: 'visa_free_conditional',
    maxStay: '96-Hour Visa-Free Transit Facility (VFTF)',
    onlyForOriginCodes: ['IN', 'CN'],
    conditions: [
      'Strictly for TRANSIT ONLY (onward air ticket to a third country within 96 hours) when holding a valid visa (min. 1 month validity) from the US, Canada, UK, Australia, NZ, Japan, Germany, or Switzerland.',
      'For round-trip tourism terminating in Singapore, a standard Singapore tourist visa is still required.',
    ],
    officialReferenceUrl: 'https://www.ica.gov.sg/enter-transit-depart/entering-singapore/visa-free-transit-facility',
  },
  {
    destinationCode: 'KR',
    acceptedVisas: ['us_visa', 'canada_visa', 'australia_visa', 'schengen_visa'],
    grantedStatus: 'visa_free_conditional',
    maxStay: 'Up to 30 days (Transit Tour Exemption)',
    onlyForOriginCodes: ['IN', 'CN', 'PH', 'VN', 'ID'],
    conditions: [
      'Applies ONLY when transiting through South Korea en route to/from the US, Canada, Australia, New Zealand, or 30 European states with a valid visa and confirmed onward ticket within 30 days.',
    ],
    officialReferenceUrl: 'https://www.visa.go.kr/',
  },
  {
    destinationCode: 'AZ',
    acceptedVisas: ['gcc_resident'],
    grantedStatus: 'visa_on_arrival',
    maxStay: 'Up to 30 days',
    conditions: [
      'Valid GCC residence permit holders (UAE, Saudi, Qatar, Kuwait, Oman, Bahrain) with 6+ months remaining validity qualify for a 30-day Visa on Arrival in Azerbaijan.',
    ],
    officialReferenceUrl: 'https://evisa.gov.az/en/',
  },

  // Africa
  {
    destinationCode: 'MA',
    acceptedVisas: ['us_visa', 'schengen_visa', 'uk_visa', 'canada_visa', 'australia_visa', 'japan_visa'],
    grantedStatus: 'e_visa',
    maxStay: 'Up to 30 days (Single Entry e-Visa)',
    conditions: [
      'Holders of a valid multiple-entry visa (min. 90 days remaining) or residence permit (min. 180 days) from the US, EU/Schengen, UK, Canada, Australia, NZ, or Japan qualify for Morocco’s online Accès Maroc e-Visa.',
    ],
    officialReferenceUrl: 'https://www.acces-maroc.ma/',
  },
  {
    destinationCode: 'EG',
    acceptedVisas: ['us_visa', 'schengen_visa', 'uk_visa', 'canada_visa', 'japan_visa', 'australia_visa', 'gcc_resident'],
    grantedStatus: 'visa_on_arrival',
    maxStay: 'Up to 30 days',
    onlyForOriginCodes: ['IN', 'CN', 'MA', 'DZ', 'TN', 'TR', 'ZA', 'PH', 'VN', 'TH', 'ID'],
    conditions: [
      'Select nationalities with a valid, previously used US, UK, Schengen, Japan, Canada, Australia, or NZ visa (or GCC residence) may obtain a 30-day Visa on Arrival at Cairo/Hurghada/Sharm airports.',
    ],
    officialReferenceUrl: 'https://visa2egypt.gov.eg/',
  },
];
