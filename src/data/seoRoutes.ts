import type { HeldVisaId } from '../types/visaCheck';

export const PUBLIC_SITE_ORIGIN = 'https://refirely.com';

export interface StaticPageSeoConfig {
  view: 'landing' | 'explore' | 'compare' | 'scout' | 'visa-check' | 'community' | 'meetups' | 'dashboard' | 'messages';
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
      'Compare 209 countries for FIRE retirement & digital nomads, check global visa rules by passport type & US/Schengen visas, plan Scout & Hop trips & meet expats.',
    keywords:
      'retire early abroad calculator, FIRE calculator by country, global visa checker 2026, do I need a visa, visa free countries with US B1 B2 visa, visa free countries with Schengen visa, Indian diplomatic official passport visa free countries, MEA bilateral visa waiver agreement, diplomatic vs official passport visa rules, Turkey green passport visa free countries, digital nomad cost of living 2026, nomad cash burn calculator, digital nomad runway simulator, best countries to retire 2026, geoarbitrage calculator, Portugal D7 passive income visa, Spain Non-Lucrative Visa NLV, Thailand DTV visa 5 year, Scout and Hop sabbatical trip planner, expat meetups worldwide',
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
      'Check visa requirements for any destination by entering your nationality, passport type (Ordinary, Official, Diplomatic, Special) & US/Schengen visas—plus see how many countries you can visit visa-free with 155+ official government links.',
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
      'Search and filter 209 verified global havens for early retirement and digital nomads. Compare monthly budgets, nomad cash burn, D7 & DNV visas, fiber internet speeds, healthcare, safety & climate.',
    keywords:
      'explore retirement havens, best countries to retire abroad 2026, digital nomad countries ranked, lowest cost of living countries, fiber internet speeds by country, retirement visa directory, digital nomad visa directory, ReFirely explore',
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
      'compare countries to retire abroad, side by side cost of living comparison, Portugal vs Spain retirement, Thailand vs Vietnam digital nomad, compare retirement visas, compare nomad cash burn, ReFirely compare',
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
      'Discover and RSVP to local expat coffee socials, scouting dinners & online meetups in Portugal, Spain, Thailand, Costa Rica, Mexico and top relocation havens worldwide.',
    keywords:
      'expat meetups worldwide, digital nomad meetups, early retiree coffee socials, expat events Portugal Spain Thailand, relocation networking, ReFirely meetups',
    ogImage: `${PUBLIC_SITE_ORIGIN}/assets/og/expats-meetups.jpg`,
    ogImageType: 'image/jpeg',
    ogImageWidth: '1280',
    ogImageHeight: '960',
    ogImageAlt: 'Worldwide Expat, Early Retiree & Digital Nomad Meetups on ReFirely',
    schemaType: 'CollectionPage',
    schemaName: 'Worldwide Expat, Retiree & Digital Nomad Meetups',
  },
  dashboard: {
    view: 'dashboard',
    path: '/dashboard',
    title: 'Global FIRE Nest Egg & Digital Nomad Runway Burn Calculator | ReFirely',
    description:
      'Simulate your 4% SWR FIRE retirement portfolio or Digital Nomad liquid cash runway across 209 countries. Calculate geoarbitrage savings, saved shortlists & earned milestone badges.',
    keywords:
      'FIRE calculator abroad, 4 percent rule geoarbitrage, digital nomad cash runway calculator, retire years earlier abroad, expat portfolio simulator, ReFirely FIRE dashboard',
    ogImage: `${PUBLIC_SITE_ORIGIN}/assets/og/fire-calculator.jpg`,
    ogImageType: 'image/jpeg',
    ogImageWidth: '1280',
    ogImageHeight: '960',
    ogImageAlt: 'Global FIRE Nest Egg & Digital Nomad Runway Calculator on ReFirely',
    schemaType: 'WebApplication',
    schemaName: 'Global FIRE Nest Egg & Digital Nomad Runway Burn Calculator',
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
  // Popular ordinary passport travel & relocation corridors
  { slug: 'in-to-pt', originCode: 'IN', destinationCode: 'PT', priority: '0.85' },
  { slug: 'in-to-th', originCode: 'IN', destinationCode: 'TH', priority: '0.85' },
  { slug: 'in-to-ae', originCode: 'IN', destinationCode: 'AE', priority: '0.85' },
  { slug: 'in-to-jp', originCode: 'IN', destinationCode: 'JP', priority: '0.85' },
  { slug: 'in-to-gb', originCode: 'IN', destinationCode: 'GB', priority: '0.85' },
  { slug: 'in-to-es', originCode: 'IN', destinationCode: 'ES', priority: '0.85' },
  { slug: 'in-to-vn', originCode: 'IN', destinationCode: 'VN', priority: '0.85' },
  { slug: 'in-to-my', originCode: 'IN', destinationCode: 'MY', priority: '0.85' },
  { slug: 'in-to-id', originCode: 'IN', destinationCode: 'ID', priority: '0.85' },
  { slug: 'us-to-pt', originCode: 'US', destinationCode: 'PT', priority: '0.85' },
  { slug: 'us-to-es', originCode: 'US', destinationCode: 'ES', priority: '0.85' },
  { slug: 'us-to-th', originCode: 'US', destinationCode: 'TH', priority: '0.85' },
  { slug: 'us-to-mx', originCode: 'US', destinationCode: 'MX', priority: '0.85' },
  { slug: 'us-to-jp', originCode: 'US', destinationCode: 'JP', priority: '0.85' },
  { slug: 'us-to-cr', originCode: 'US', destinationCode: 'CR', priority: '0.85' },
  { slug: 'gb-to-pt', originCode: 'GB', destinationCode: 'PT', priority: '0.85' },
  { slug: 'gb-to-es', originCode: 'GB', destinationCode: 'ES', priority: '0.85' },
  { slug: 'gb-to-th', originCode: 'GB', destinationCode: 'TH', priority: '0.85' },
  { slug: 'ca-to-pt', originCode: 'CA', destinationCode: 'PT', priority: '0.85' },
  { slug: 'ph-to-jp', originCode: 'PH', destinationCode: 'JP', priority: '0.85' },
  { slug: 'ph-to-th', originCode: 'PH', destinationCode: 'TH', priority: '0.85' },
  // High-intent US B1/B2 & Schengen third-country visa exemption corridors
  { slug: 'in-to-mx-us-visa', originCode: 'IN', destinationCode: 'MX', heldVisas: ['us_visa'], priority: '0.9' },
  { slug: 'in-to-cr-us-visa', originCode: 'IN', destinationCode: 'CR', heldVisas: ['us_visa'], priority: '0.9' },
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
