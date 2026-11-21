export type PassportCategory =
  | 'ordinary'
  | 'diplomatic'
  | 'official'
  | 'service'
  | 'special'
  | 'public_affairs'
  | 'bno'
  | 'botc'
  | 'passport_card'
  | 'temporary'
  | 'ecr_ordinary'
  | 'emergency';

export interface CountryPassportType {
  id: string;
  category: PassportCategory;
  label: string;
  localName?: string;
  coverColor: string;
  coverColorHex: string;
  description: string;
  isPrivileged: boolean;
}

export type TravelPurpose =
  | 'tourism'
  | 'business'
  | 'transit'
  | 'digital_nomad'
  | 'retirement'
  | 'official_duty'
  | 'study'
  | 'medical';

export type HeldVisaId =
  | 'us_visa'
  | 'schengen_visa'
  | 'uk_visa'
  | 'canada_visa'
  | 'japan_visa'
  | 'australia_visa'
  | 'gcc_resident'
  | 'apec_card';

export interface HeldVisaOption {
  id: HeldVisaId;
  label: string;
  shortLabel: string;
  sublabel: string;
  issuingAuthority: string;
  isPrimaryHighlight?: boolean;
  exampleCountriesUnlocked: string[];
}

export type VisaRegion =
  | 'Europe'
  | 'Asia'
  | 'Americas'
  | 'Middle East'
  | 'Africa'
  | 'Oceania';

export interface VisaWorldCountry {
  code: string; // ISO-2 uppercase (e.g. 'IN', 'US', 'PT')
  name: string;
  flag: string;
  region: VisaRegion;
  refirelyCountryId?: string;
  isSchengen?: boolean;
  isEu?: boolean;
  isEeaOrEfta?: boolean;
  isAsean?: boolean;
  isMercosur?: boolean;
  isGcc?: boolean;
  isCaricom?: boolean;
  isEcowas?: boolean;
  isEac?: boolean;
  isCa4?: boolean;
  isCis?: boolean;
  isApec?: boolean;
  isCommonwealth?: boolean;
  mobilityTier: 1 | 2 | 3 | 4;
}

export type VisaRequirementStatus =
  | 'domestic'
  | 'freedom_of_movement'
  | 'visa_free'
  | 'visa_free_conditional'
  | 'eta_required'
  | 'visa_on_arrival'
  | 'e_visa'
  | 'visa_required';

export interface BilateralAgreementInfo {
  id: string;
  title: string;
  summary: string;
  officialUrl: string;
  sourceLabel: string;
  appliesTo: string;
  effectiveNote?: string;
}

export interface OfficialPortalInfo {
  authorityName: string;
  officialUrl: string;
  eVisaUrl?: string;
  eVisaLabel?: string;
  notes?: string;
}

export interface HeldVisaUnlockDetail {
  visaId: HeldVisaId;
  visaLabel: string;
  upgradedFromStatus: VisaRequirementStatus;
  grantedStatus: VisaRequirementStatus;
  maxStay: string;
  conditions: string[];
  officialReferenceUrl?: string;
}

export interface VisaCheckInput {
  originCode: string;
  destinationCode: string;
  passportTypeId: string;
  purpose: TravelPurpose;
  heldVisas: HeldVisaId[];
}

export interface VisaCheckResult {
  origin: VisaWorldCountry;
  destination: VisaWorldCountry;
  passportType: CountryPassportType;
  purpose: TravelPurpose;
  heldVisas: HeldVisaId[];
  status: VisaRequirementStatus;
  baselineOrdinaryStatus: VisaRequirementStatus;
  headline: string;
  verdictSummary: string;
  maxStay: string;
  entryMethod: string;
  estimatedFee: string;
  passportValidityRequirement: string;
  unlockedByPassportTier: boolean;
  passportTierNote?: string;
  heldVisaUnlock?: HeldVisaUnlockDetail;
  bilateralAgreements: BilateralAgreementInfo[];
  officialPortal: OfficialPortalInfo;
  purposeGuidance: {
    label: string;
    summary: string;
    actionItems: string[];
  };
  keyConditions: string[];
  refirelyCountryId?: string;
}

export interface GlobalDestinationAccess {
  destination: VisaWorldCountry;
  status: VisaRequirementStatus;
  baselineOrdinaryStatus: VisaRequirementStatus;
  maxStay: string;
  unlockedByHeldVisa?: HeldVisaId;
  unlockedByHeldVisaLabel?: string;
  unlockedByBilateralPassport?: boolean;
  agreementTitle?: string;
  shortNote: string;
}
