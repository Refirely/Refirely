import type { HeldVisaId } from '../types/visaCheck';

export const PUBLIC_SITE_ORIGIN = 'https://refirely.com';

export interface StaticPageSeoConfig {
  view: 'landing' | 'explore' | 'compare' | 'fire-calculator' | 'scout' | 'visa-check' | 'community' | 'meetups' | 'dashboard' | 'messages';
  path: string;
  title: string;
  description: string;
  keywords: string;
  ogImage: string;
  ogImageType: string;
  ogImageWidth: string;
  ogImageHeight: string;
  ogImageAlt: string;
  schemaType: 'WebApplication' | 'CollectionPage' | 'WebPage';
  schemaName: string;
}

export const STATIC_PAGE_SEO: Record<StaticPageSeoConfig['view'], StaticPageSeoConfig> = {
  landing: {
    view: 'landing',
    path: '/',
    title: 'ReFirely – Retire Early Abroad (FIRE), Nomad Cost & Global Visa Check',
    description:
      'Find where you can retire early (FIRE) or work remotely across 209 countries. Calculate 4% SWR nest eggs, check global visa rules by passport & connect with expats.',
    keywords:
      'where can I retire abroad calculator, retire early abroad (FIRE), FIRE calculator by country, where can I retire with 250k, where can I retire with 500k, 4 percent rule retirement countries, top 12 retirement havens 2026, top 12 digital nomad countries 2026, global visa checker 2026, do I need a visa, visa free countries with US B1 B2 visa, visa free countries with Schengen visa, Indian diplomatic official passport visa free countries, MEA bilateral visa waiver agreement, Turkey green passport visa free countries, digital nomad cost of living 2026, nomad cash burn calculator, digital nomad runway simulator, geoarbitrage calculator, Portugal D7 passive income visa, Portugal D8 digital nomad visa, Spain Non-Lucrative Visa NLV, Spain digital nomad visa Beckham law, Thailand DTV visa 5 year, Costa Rica Pensionado visa, Panama Pensionado visa, Malaysia MM2H DE Rantau visa, Greece FIP 7 percent tax retirement, Italy 7 percent flat tax retiree, France long stay visitor visa retirement, Ecuador Jubilado visa, Uruguay Rentista visa, Bali E33G remote worker visa, Croatia digital nomad visa, Colombia digital nomad visa, Scout and Hop sabbatical trip planner, expat meetups worldwide',
    ogImage: `${PUBLIC_SITE_ORIGIN}/assets/og/explore-havens.jpg`,
    ogImageType: 'image/jpeg',
    ogImageWidth: '1408',
    ogImageHeight: '768',
    ogImageAlt: 'ReFirely – Retire Early Abroad (FIRE), Digital Nomad & Global Visa Check Platform',
    schemaType: 'WebApplication',
    schemaName: 'ReFirely – Retire Early Abroad (FIRE), Nomad Cost & Global Visa Check',
  },
  'visa-check': {
    view: 'visa-check',
    path: '/visa-check',
    title: 'Global Visa Check 2026: Check Visa Rules by Passport & Country Access | ReFirely',
    description:
      'Check visa requirements for 205+ destinations by nationality, passport class (Ordinary, Official, Diplomatic, Special) & US/Schengen visas with 155+ official embassy links.',
    keywords:
      'global visa checker 2026, do I need a visa, check visa requirement by nationality and destination, how many countries can I visit visa free, visa free countries with US B1 B2 visa, visa free countries with Schengen visa, Indian diplomatic official passport visa free countries, MEA bilateral visa waiver agreement, diplomatic vs official passport visa rules, Turkey green passport visa free countries, UK visa Ireland exemption, passport mobility explorer, official embassy visa portal, ReFirely visa check',
    ogImage: `${PUBLIC_SITE_ORIGIN}/assets/og/visa-check.jpg`,
    ogImageType: 'image/jpeg',
    ogImageWidth: '1408',
    ogImageHeight: '768',
    ogImageAlt: 'ReFirely Global Visa Check – Passport Mobility, Bilateral Treaties & US/Schengen Visa Exemptions',
    schemaType: 'WebApplication',
    schemaName: 'ReFirely Global Visa Checker & Bilateral Passport Mobility Explorer',
  },
  explore: {
    view: 'explore',
    path: '/explore',
    title: 'Explore 209 Global Retirement (FIRE) & Digital Nomad Havens | ReFirely',
    description:
      'Filter and rank 209 verified countries by monthly retirement budget, nomad cash burn, 4% FIRE nest egg, D7 & DNV visa income thresholds, fiber internet speed, healthcare & safety.',
    keywords:
      'explore retirement havens, best countries to retire abroad 2026, digital nomad countries ranked, filter countries by monthly budget, lowest cost of living countries, fiber internet speeds by country, retirement visa income requirements, digital nomad visa directory, ReFirely explore',
    ogImage: `${PUBLIC_SITE_ORIGIN}/assets/og/explore-havens.jpg`,
    ogImageType: 'image/jpeg',
    ogImageWidth: '1408',
    ogImageHeight: '768',
    ogImageAlt: 'Explore 209 Verified Global Retirement & Digital Nomad Havens on ReFirely',
    schemaType: 'CollectionPage',
    schemaName: 'Explore 209 Global Retirement (FIRE) & Digital Nomad Havens',
  },
  compare: {
    view: 'compare',
    path: '/compare',
    title: 'Compare 209 Retirement (FIRE) & Digital Nomad Countries Side-by-Side | ReFirely',
    description:
      'Compare countries head-to-head across monthly couple budgets, digital nomad cash burn, retirement & remote work visas, fiber speeds, apartment rents, food, taxes & healthcare.',
    keywords:
      'compare countries to retire abroad, side by side cost of living comparison, Portugal vs Spain retirement, Costa Rica vs Panama retirement, Thailand vs Malaysia retirement, Spain vs Portugal digital nomad, compare retirement visas, compare nomad cash burn, ReFirely compare',
    ogImage: `${PUBLIC_SITE_ORIGIN}/assets/og/compare-havens.jpg`,
    ogImageType: 'image/jpeg',
    ogImageWidth: '1408',
    ogImageHeight: '768',
    ogImageAlt: 'Side-by-Side Country Comparison Studio across 209 Havens on ReFirely',
    schemaType: 'WebApplication',
    schemaName: 'Side-by-Side Country Comparison Studio (209 Havens)',
  },
  scout: {
    view: 'scout',
    path: '/scout',
    title: 'Scout & Hop: Multi-Country Relocation Trip & Schengen 90/180 Planner | ReFirely',
    description:
      'Test-drive your shortlist countries before relocating. Map multi-stop scouting trips, track Schengen 90/180-day visa allowances, estimate monthly travel burn & organize relocation checklists.',
    keywords:
      'scout and hop trip planner, relocation scouting trip, Schengen 90 180 day visa calculator, slow travel itinerary builder, sabbatical budget planner, test drive retirement abroad, ReFirely scout',
    ogImage: `${PUBLIC_SITE_ORIGIN}/assets/og/scout-hop.jpg`,
    ogImageType: 'image/jpeg',
    ogImageWidth: '1280',
    ogImageHeight: '960',
    ogImageAlt: 'Scout & Hop Multi-Country Sabbatical & Schengen 90/180 Trip Planner on ReFirely',
    schemaType: 'WebApplication',
    schemaName: 'Scout & Hop Multi-Country Sabbatical & Visa Route Planner',
  },
  community: {
    view: 'community',
    path: '/expats',
    title: 'Verified Expats Directory, Profile Badges & Relocation Forum | ReFirely',
    description:
      'Connect with verified expats, early retirees (FIRE) & digital nomads living abroad. Browse relocation profiles, earned profile badges, countries visited, languages spoken & local discussions.',
    keywords:
      'verified expats directory, expat relocation community, early retirees abroad forum, digital nomad network, expat profile badges, ask expats abroad, ReFirely expats',
    ogImage: `${PUBLIC_SITE_ORIGIN}/assets/og/expats-meetups.jpg`,
    ogImageType: 'image/jpeg',
    ogImageWidth: '1280',
    ogImageHeight: '960',
    ogImageAlt: 'Verified Expats Directory & Relocation Community on ReFirely',
    schemaType: 'CollectionPage',
    schemaName: 'Verified Expats Directory, Profile Badges & Discussion Forum',
  },
  meetups: {
    view: 'meetups',
    path: '/meetups',
    title: 'Worldwide Expat, Retiree & Digital Nomad Meetups & Socials | ReFirely',
    description:
      'Discover and RSVP to local expat coffee socials, scouting dinners & online meetups in Portugal, Spain, Thailand, Costa Rica, Panama, Malaysia, Mexico and top havens worldwide.',
    keywords:
      'expat meetups worldwide, digital nomad meetups, early retiree coffee socials, expat events Portugal Spain Thailand Costa Rica, relocation networking, ReFirely meetups',
    ogImage: `${PUBLIC_SITE_ORIGIN}/assets/og/expats-meetups.jpg`,
    ogImageType: 'image/jpeg',
    ogImageWidth: '1280',
    ogImageHeight: '960',
    ogImageAlt: 'Worldwide Expat, Early Retiree & Digital Nomad Meetups on ReFirely',
    schemaType: 'CollectionPage',
    schemaName: 'Worldwide Expat, Retiree & Digital Nomad Meetups',
  },
  'fire-calculator': {
    view: 'fire-calculator',
    path: '/fire-calculator',
    title: 'FIRE Calculator Abroad: See Where You Can Retire Right Now | ReFirely',
    description:
      'Calculate your FIRE number abroad with our International Geo-Arbitrage Engine. See how many countries you can retire in today (100%+ funded) vs close to retirement (70–99%) across 209 havens.',
    keywords:
      'FIRE calculator abroad, international FIRE calculator, where can I retire right now calculator, geoarbitrage calculator, 4 percent rule retirement abroad, retire early abroad calculator, FIRE number by country, countries close to FIRE retirement, 10 year inflation stress test retirement, digital nomad runway calculator, monthly cash burn simulator, safe withdrawal rate SWR calculator, early retirement overseas, ReFirely FIRE calculator',
    ogImage: `${PUBLIC_SITE_ORIGIN}/assets/og/fire-calculator.jpg`,
    ogImageType: 'image/jpeg',
    ogImageWidth: '1280',
    ogImageHeight: '960',
    ogImageAlt: 'FIRE Calculator Abroad & International Geo-Arbitrage Engine on ReFirely',
    schemaType: 'WebApplication',
    schemaName: 'ReFirely FIRE Calculator Abroad & International Geo-Arbitrage Engine',
  },
  dashboard: {
    view: 'dashboard',
    path: '/dashboard',
    title: 'Member Relocation Dashboard, Saved Havens & FIRE Hub | ReFirely',
    description:
      'Manage your saved retirement havens, Top 10 Freedom Map matches, personal relocation checklist, country research journal, multi-asset portfolio tracker & earned expat badges.',
    keywords:
      'expat relocation dashboard, saved retirement countries, relocation checklist tracker, personal FIRE portfolio hub, country research journal, ReFirely member dashboard',
    ogImage: `${PUBLIC_SITE_ORIGIN}/assets/og/fire-calculator.jpg`,
    ogImageType: 'image/jpeg',
    ogImageWidth: '1280',
    ogImageHeight: '960',
    ogImageAlt: 'ReFirely Member Relocation Dashboard & Portfolio Hub',
    schemaType: 'WebApplication',
    schemaName: 'ReFirely Member Relocation Dashboard & Portfolio Hub',
  },
  messages: {
    view: 'messages',
    path: '/messages',
    title: 'Direct Expat Messaging & Relocation Connections | ReFirely',
    description:
      'Message verified expats, early retirees, and digital nomads directly on ReFirely to swap neighborhood tips, visa experiences, and scouting advice.',
    keywords: 'expat messaging, connect with expats abroad, relocation peer network, ReFirely messages',
    ogImage: `${PUBLIC_SITE_ORIGIN}/assets/og/expats-meetups.jpg`,
    ogImageType: 'image/jpeg',
    ogImageWidth: '1280',
    ogImageHeight: '960',
    ogImageAlt: 'Direct Expat Messaging on ReFirely',
    schemaType: 'WebPage',
    schemaName: 'Direct Expat Messaging & Relocation Connections',
  },
};

export interface FeaturedVisaCorridor {
  slug: string;
  originCode: string;
  destinationCode: string;
  passportTypeId?: string;
  heldVisas?: HeldVisaId[];
  priority: string;
}

export const FEATURED_VISA_CORRIDORS: FeaturedVisaCorridor[] = [
  // Popular ordinary passport travel, Top 12 Retirement Haven & Top 12 Nomad corridors
  { slug: 'in-to-pt', originCode: 'IN', destinationCode: 'PT', priority: '0.85' },
  { slug: 'in-to-th', originCode: 'IN', destinationCode: 'TH', priority: '0.85' },
  { slug: 'in-to-ae', originCode: 'IN', destinationCode: 'AE', priority: '0.85' },
  { slug: 'in-to-jp', originCode: 'IN', destinationCode: 'JP', priority: '0.85' },
  { slug: 'in-to-gb', originCode: 'IN', destinationCode: 'GB', priority: '0.85' },
  { slug: 'in-to-es', originCode: 'IN', destinationCode: 'ES', priority: '0.85' },
  { slug: 'in-to-vn', originCode: 'IN', destinationCode: 'VN', priority: '0.85' },
  { slug: 'in-to-my', originCode: 'IN', destinationCode: 'MY', priority: '0.85' },
  { slug: 'in-to-id', originCode: 'IN', destinationCode: 'ID', priority: '0.85' },
  { slug: 'in-to-cr', originCode: 'IN', destinationCode: 'CR', priority: '0.85' },
  { slug: 'in-to-pa', originCode: 'IN', destinationCode: 'PA', priority: '0.85' },
  { slug: 'in-to-gr', originCode: 'IN', destinationCode: 'GR', priority: '0.85' },
  { slug: 'in-to-it', originCode: 'IN', destinationCode: 'IT', priority: '0.85' },
  { slug: 'us-to-pt', originCode: 'US', destinationCode: 'PT', priority: '0.9' },
  { slug: 'us-to-es', originCode: 'US', destinationCode: 'ES', priority: '0.9' },
  { slug: 'us-to-th', originCode: 'US', destinationCode: 'TH', priority: '0.9' },
  { slug: 'us-to-mx', originCode: 'US', destinationCode: 'MX', priority: '0.9' },
  { slug: 'us-to-jp', originCode: 'US', destinationCode: 'JP', priority: '0.85' },
  { slug: 'us-to-cr', originCode: 'US', destinationCode: 'CR', priority: '0.9' },
  { slug: 'us-to-pa', originCode: 'US', destinationCode: 'PA', priority: '0.9' },
  { slug: 'us-to-my', originCode: 'US', destinationCode: 'MY', priority: '0.9' },
  { slug: 'us-to-gr', originCode: 'US', destinationCode: 'GR', priority: '0.9' },
  { slug: 'us-to-it', originCode: 'US', destinationCode: 'IT', priority: '0.9' },
  { slug: 'us-to-fr', originCode: 'US', destinationCode: 'FR', priority: '0.9' },
  { slug: 'us-to-ec', originCode: 'US', destinationCode: 'EC', priority: '0.85' },
  { slug: 'us-to-uy', originCode: 'US', destinationCode: 'UY', priority: '0.85' },
  { slug: 'us-to-id', originCode: 'US', destinationCode: 'ID', priority: '0.9' },
  { slug: 'us-to-co', originCode: 'US', destinationCode: 'CO', priority: '0.85' },
  { slug: 'us-to-hr', originCode: 'US', destinationCode: 'HR', priority: '0.85' },
  { slug: 'us-to-vn', originCode: 'US', destinationCode: 'VN', priority: '0.85' },
  { slug: 'us-to-ae', originCode: 'US', destinationCode: 'AE', priority: '0.85' },
  { slug: 'gb-to-pt', originCode: 'GB', destinationCode: 'PT', priority: '0.85' },
  { slug: 'gb-to-es', originCode: 'GB', destinationCode: 'ES', priority: '0.85' },
  { slug: 'gb-to-th', originCode: 'GB', destinationCode: 'TH', priority: '0.85' },
  { slug: 'gb-to-cr', originCode: 'GB', destinationCode: 'CR', priority: '0.85' },
  { slug: 'gb-to-my', originCode: 'GB', destinationCode: 'MY', priority: '0.85' },
  { slug: 'ca-to-pt', originCode: 'CA', destinationCode: 'PT', priority: '0.85' },
  { slug: 'ca-to-mx', originCode: 'CA', destinationCode: 'MX', priority: '0.85' },
  { slug: 'ca-to-cr', originCode: 'CA', destinationCode: 'CR', priority: '0.85' },
  { slug: 'au-to-id', originCode: 'AU', destinationCode: 'ID', priority: '0.85' },
  { slug: 'au-to-th', originCode: 'AU', destinationCode: 'TH', priority: '0.85' },
  { slug: 'ph-to-jp', originCode: 'PH', destinationCode: 'JP', priority: '0.85' },
  { slug: 'ph-to-th', originCode: 'PH', destinationCode: 'TH', priority: '0.85' },
  // High-intent US B1/B2 & Schengen third-country visa exemption corridors
  { slug: 'in-to-mx-us-visa', originCode: 'IN', destinationCode: 'MX', heldVisas: ['us_visa'], priority: '0.9' },
  { slug: 'in-to-cr-us-visa', originCode: 'IN', destinationCode: 'CR', heldVisas: ['us_visa'], priority: '0.9' },
  { slug: 'in-to-pa-us-visa', originCode: 'IN', destinationCode: 'PA', heldVisas: ['us_visa'], priority: '0.9' },
  { slug: 'in-to-co-us-visa', originCode: 'IN', destinationCode: 'CO', heldVisas: ['us_visa'], priority: '0.9' },
  { slug: 'in-to-ae-us-visa', originCode: 'IN', destinationCode: 'AE', heldVisas: ['us_visa'], priority: '0.9' },
  { slug: 'in-to-ph-us-visa', originCode: 'IN', destinationCode: 'PH', heldVisas: ['us_visa'], priority: '0.9' },
  { slug: 'in-to-ge-schengen-visa', originCode: 'IN', destinationCode: 'GE', heldVisas: ['schengen_visa'], priority: '0.9' },
  { slug: 'in-to-cy-schengen-visa', originCode: 'IN', destinationCode: 'CY', heldVisas: ['schengen_visa'], priority: '0.9' },
  { slug: 'in-to-rs-schengen-visa', originCode: 'IN', destinationCode: 'RS', heldVisas: ['schengen_visa'], priority: '0.9' },
  { slug: 'in-to-tr-us-visa', originCode: 'IN', destinationCode: 'TR', heldVisas: ['us_visa'], priority: '0.9' },
  { slug: 'ph-to-mx-us-visa', originCode: 'PH', destinationCode: 'MX', heldVisas: ['us_visa'], priority: '0.85' },
  { slug: 'cn-to-mx-us-visa', originCode: 'CN', destinationCode: 'MX', heldVisas: ['us_visa'], priority: '0.85' },
  // Diplomatic, Official & Special Passport Bilateral Visa Waiver Agreement (BVWA) corridors
  { slug: 'in-to-pt-diplomatic', originCode: 'IN', destinationCode: 'PT', passportTypeId: 'in_diplomatic', priority: '0.9' },
  { slug: 'in-to-pt-official', originCode: 'IN', destinationCode: 'PT', passportTypeId: 'in_official', priority: '0.9' },
  { slug: 'in-to-de-diplomatic', originCode: 'IN', destinationCode: 'DE', passportTypeId: 'in_diplomatic', priority: '0.85' },
  { slug: 'in-to-fr-diplomatic', originCode: 'IN', destinationCode: 'FR', passportTypeId: 'in_diplomatic', priority: '0.85' },
  { slug: 'in-to-jp-diplomatic', originCode: 'IN', destinationCode: 'JP', passportTypeId: 'in_diplomatic', priority: '0.85' },
  { slug: 'in-to-sg-official', originCode: 'IN', destinationCode: 'SG', passportTypeId: 'in_official', priority: '0.85' },
  { slug: 'in-to-ae-official', originCode: 'IN', destinationCode: 'AE', passportTypeId: 'in_official', priority: '0.85' },
  { slug: 'tr-to-de-special', originCode: 'TR', destinationCode: 'DE', passportTypeId: 'tr_special', priority: '0.85' },
  { slug: 'cn-to-fr-diplomatic', originCode: 'CN', destinationCode: 'FR', passportTypeId: 'cn_diplomatic', priority: '0.85' },
];

export function findFeaturedVisaCorridorBySlug(slug: string): FeaturedVisaCorridor | undefined {
  const clean = slug.trim().toLowerCase();
  return FEATURED_VISA_CORRIDORS.find(c => c.slug === clean);
}

export function findMatchingFeaturedVisaSlug(params: {
  originCode: string;
  destinationCode: string;
  passportTypeId?: string;
  isDefaultPassport?: boolean;
  heldVisas?: string[];
}): string | undefined {
  const origin = params.originCode.toUpperCase();
  const dest = params.destinationCode.toUpperCase();
  const visasKey = [...(params.heldVisas || [])].sort().join(',');
  const passport = params.isDefaultPassport ? '' : (params.passportTypeId || '');

  const match = FEATURED_VISA_CORRIDORS.find(c => {
    if (c.originCode !== origin || c.destinationCode !== dest) return false;
    const cVisasKey = [...(c.heldVisas || [])].sort().join(',');
    const cPassport = c.passportTypeId || '';
    return cVisasKey === visasKey && cPassport === passport;
  });
  return match?.slug;
}
