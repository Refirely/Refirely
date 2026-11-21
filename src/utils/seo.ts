import { Country, Persona } from '../types';
import { AppView } from '../context/AppContext';
import { getCountryGastronomyProfile } from '../data/countryFoodAndGastronomy';
import { getCountryNomadProfile } from '../data/countryNomadProfiles';
import {
  PUBLIC_SITE_ORIGIN,
  STATIC_PAGE_SEO,
  findMatchingFeaturedVisaSlug,
} from '../data/seoRoutes';

const DEFAULT_TITLE = STATIC_PAGE_SEO.landing.title;
const DEFAULT_DESCRIPTION = STATIC_PAGE_SEO.landing.description;
const DEFAULT_KEYWORDS = STATIC_PAGE_SEO.landing.keywords;

const VALID_VIEWS: AppView[] = [
  'landing',
  'explore',
  'country-detail',
  'compare',
  'scout',
  'visa-check',
  'community',
  'meetups',
  'messages',
  'dashboard',
  'admin',
];

/**
 * Returns the clean crawlable path href for a specific country dossier (`/country/<id>`).
 * Backed by build-time pre-rendered static HTML (`dist/country/<id>/index.html`) so
 * WhatsApp, LinkedIn, X/Twitter, Facebook, and Googlebot receive country-specific metadata.
 */
export function getCountryUrl(countryId: string): string {
  return `/country/${encodeURIComponent(countryId)}`;
}

export { PUBLIC_SITE_ORIGIN };

/**
 * Returns the full absolute shareable URL for a specific country dossier
 * anchored to the production domain https://refirely.com.
 */
export function getFullCountryUrl(countryId: string): string {
  return `${PUBLIC_SITE_ORIGIN}/country/${encodeURIComponent(countryId)}`;
}

/**
 * Returns the clean crawlable path href for an application view (`/visa-check`, `/scout`, etc.)
 * backed by build-time pre-rendered static HTML for social link previews.
 */
export function getViewUrl(view: AppView, countryId?: string): string {
  if (view === 'country-detail' && countryId) {
    return getCountryUrl(countryId);
  }
  if (view === 'landing') {
    return '/';
  }
  if (view === 'community') {
    return '/expats';
  }
  if (view === 'admin') {
    return '/?view=admin';
  }
  return `/${encodeURIComponent(view)}`;
}

/**
 * Parses the current browser URL (supporting both `/?country=portugal` query params
 * AND `/country/portugal` or `/explore` pathnames) into the target AppView and countryId.
 */
export function parseUrlToRoute(countries: Country[]): { view: AppView; countryId?: string } {
  if (typeof window === 'undefined') {
    return { view: 'landing' };
  }

  const params = new URLSearchParams(window.location.search);
  const countryParam = params.get('country')?.trim().toLowerCase();
  const rawViewParam = params.get('view')?.trim().toLowerCase();
  const viewParam = (rawViewParam === 'expats' ? 'community' : rawViewParam) as AppView | undefined;

  const findMatchingCountry = (slugOrId: string): Country | undefined => {
    const clean = decodeURIComponent(slugOrId).trim().toLowerCase();
    return countries.find(
      c =>
        c.id.toLowerCase() === clean ||
        c.name.toLowerCase() === clean ||
        c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === clean
    );
  };

  // 1. Check ?country=<id>
  if (countryParam) {
    const matched = findMatchingCountry(countryParam);
    if (matched) {
      return { view: 'country-detail', countryId: matched.id };
    }
  }

  // 2. Check clean path /country/<id>, /countries/<id>, /haven/<id>, or /visa-check/<slug>
  const pathSegments = window.location.pathname
    .split('/')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);

  if (pathSegments.length >= 2 && (pathSegments[0] === 'country' || pathSegments[0] === 'countries' || pathSegments[0] === 'haven')) {
    const matched = findMatchingCountry(pathSegments[1]);
    if (matched) {
      return { view: 'country-detail', countryId: matched.id };
    }
  }

  if (pathSegments.length >= 2 && (pathSegments[0] === 'visa-check' || pathSegments[0] === 'visa')) {
    return { view: 'visa-check' };
  }

  // 3. Check ?view=<view> (legacy query-param backward compatibility)
  if (viewParam && VALID_VIEWS.includes(viewParam)) {
    return { view: viewParam };
  }

  // 4. Check clean path /explore, /compare, /visa-check, /scout, /expats, /community, /meetups, /dashboard, /messages, /admin
  if (pathSegments.length === 1) {
    const rawSeg = pathSegments[0];
    const seg = (rawSeg === 'expats' ? 'community' : rawSeg === 'visa' ? 'visa-check' : rawSeg) as AppView;
    if (VALID_VIEWS.includes(seg)) {
      return { view: seg };
    }
    // Or if the single path segment matches a country ID directly (e.g. /portugal)
    const matchedCountry = findMatchingCountry(seg);
    if (matchedCountry) {
      return { view: 'country-detail', countryId: matchedCountry.id };
    }
  }

  return { view: 'landing' };
}

function setMetaTag(attr: 'name' | 'property', key: string, content: string) {
  let element = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attr, key);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function updateStructuredDataJsonLd(
  origin: string,
  currentView: AppView,
  selectedCountry?: Country | null,
  allCountries?: Country[]
) {
  let scriptEl = document.getElementById('dynamic-seo-jsonld') as HTMLScriptElement | null;
  if (!scriptEl) {
    scriptEl = document.createElement('script');
    scriptEl.id = 'dynamic-seo-jsonld';
    scriptEl.type = 'application/ld+json';
    document.head.appendChild(scriptEl);
  }

  if (currentView === 'country-detail' && selectedCountry) {
    const countryUrl = `${origin}/country/${encodeURIComponent(selectedCountry.id)}`;
    const singleBudget = selectedCountry.costOfLiving.monthlyBudgetSingleUSD;
    const coupleBudget = selectedCountry.costOfLiving.monthlyBudgetCoupleUSD;
    const visaName = selectedCountry.visa.retirementVisaName;
    const minIncome = selectedCountry.visa.minimumIncomeUSD;
    const foodProfile = getCountryGastronomyProfile(selectedCountry);
    const nomadProfile = getCountryNomadProfile(selectedCountry);

    const jsonLd = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'ReFirely Home',
              item: `${origin}/`,
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'Explore Retirement & Nomad Havens',
              item: `${origin}/explore`,
            },
            {
              '@type': 'ListItem',
              position: 3,
              name: `${selectedCountry.name} Retirement & Digital Nomad Guide`,
              item: countryUrl,
            },
          ],
        },
        {
          '@type': 'Place',
          name: `${selectedCountry.name} Retirement (FIRE) & Digital Nomad Haven`,
          description: selectedCountry.overview || selectedCountry.tagline,
          url: countryUrl,
          containedInPlace: {
            '@type': 'Place',
            name: selectedCountry.region,
          },
          additionalProperty: [
            {
              '@type': 'PropertyValue',
              name: 'Monthly Cost of Living (Single Retiree USD)',
              value: singleBudget,
              unitText: 'USD/month',
            },
            {
              '@type': 'PropertyValue',
              name: 'Monthly Cost of Living (Retiree Couple USD)',
              value: coupleBudget,
              unitText: 'USD/month',
            },
            {
              '@type': 'PropertyValue',
              name: 'Monthly Digital Nomad Cash Burn (Turnkey Stay + Coworking USD)',
              value: nomadProfile.monthlyNomadBurnUSD,
              unitText: 'USD/month',
            },
            {
              '@type': 'PropertyValue',
              name: '6-Month Digital Nomad Runway Burn (USD)',
              value: nomadProfile.sixMonthRunwayUSD,
              unitText: 'USD/6 months',
            },
            {
              '@type': 'PropertyValue',
              name: 'Short-Term Furnished 1-Month Rent (Nomad USD)',
              value: nomadProfile.furnishedShortTermRentUSD,
              unitText: 'USD/month',
            },
            {
              '@type': 'PropertyValue',
              name: 'Average 1-Bed Apartment Rent (City Center Long-Term Lease USD)',
              value: selectedCountry.costOfLiving.rent1BedCenterUSD,
              unitText: 'USD/month',
            },
            {
              '@type': 'PropertyValue',
              name: 'Average 1-Bed Apartment Rent (Outside Center Long-Term Lease USD)',
              value: selectedCountry.costOfLiving.rent1BedOutsideUSD,
              unitText: 'USD/month',
            },
            {
              '@type': 'PropertyValue',
              name: 'Verified Fiber Internet Speed (Mbps)',
              value: nomadProfile.verifiedInternetMbps,
              unitText: 'Mbps',
            },
            {
              '@type': 'PropertyValue',
              name: 'Coworking Hub Density & Monthly Desk Cost',
              value: `${nomadProfile.coworkingDensity} (~$${nomadProfile.coworkingMonthlyUSD}/mo)`,
            },
            {
              '@type': 'PropertyValue',
              name: 'Digital Nomad / Remote Work Visa Pathway',
              value: nomadProfile.remoteWorkVisaName,
            },
            {
              '@type': 'PropertyValue',
              name: 'Primary Passive Retirement Visa Pathway',
              value: visaName,
            },
            {
              '@type': 'PropertyValue',
              name: 'Minimum Monthly Retirement Visa Income Requirement (USD)',
              value: minIncome,
              unitText: 'USD/month',
            },
            {
              '@type': 'PropertyValue',
              name: 'Healthcare Quality Score',
              value: `${selectedCountry.lifestyle.healthcareScore}/100`,
            },
            {
              '@type': 'PropertyValue',
              name: 'Safety Index Score',
              value: `${selectedCountry.lifestyle.safetyScore}/100`,
            },
            {
              '@type': 'PropertyValue',
              name: 'Female-to-Male Demographic Ratio',
              value: `${selectedCountry.demographics.femalesPer100Males.toFixed(1)}:100`,
            },
            {
              '@type': 'PropertyValue',
              name: 'National Cuisine Headline',
              value: foodProfile.cuisineHeadline,
            },
            {
              '@type': 'PropertyValue',
              name: 'Casual Restaurant Meal Cost (USD)',
              value: foodProfile.costsAndHygiene.casualRestaurantMealUSD,
              unitText: 'USD/meal',
            },
            {
              '@type': 'PropertyValue',
              name: 'Drinking Tap Water Safety',
              value: foodProfile.costsAndHygiene.waterSafety,
            },
            {
              '@type': 'PropertyValue',
              name: 'Vegetarian & Vegan Dining Ease',
              value: foodProfile.dietaryRestrictions.vegetarianRating,
            },
          ],
        },
        {
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: `What is the monthly cash burn and internet speed for digital nomads in ${selectedCountry.name}?`,
              acceptedAnswer: {
                '@type': 'Answer',
                text: `Digital nomads and remote creators in ${selectedCountry.name} have an estimated all-in monthly living burn of $${nomadProfile.monthlyNomadBurnUSD.toLocaleString()} USD/month ($${nomadProfile.sixMonthRunwayUSD.toLocaleString()} USD for a 6-month runway). This includes a turnkey 1-month furnished stay (~$${nomadProfile.furnishedShortTermRentUSD.toLocaleString()}/mo), coworking membership (~$${nomadProfile.coworkingMonthlyUSD}/mo), and daily dining. Verified fiber broadband speeds average ${nomadProfile.verifiedInternetMbps} Mbps (${nomadProfile.internetReliability}) across top hubs like ${nomadProfile.topNomadCities.join(', ')}.`,
              },
            },
            {
              '@type': 'Question',
              name: `Does ${selectedCountry.name} offer a Digital Nomad Visa or remote work permit?`,
              acceptedAnswer: {
                '@type': 'Answer',
                text: `For remote workers, ${selectedCountry.name} offers the ${nomadProfile.remoteWorkVisaName} (${nomadProfile.remoteWorkVisaStay}). ${nomadProfile.remoteWorkVisaIncomeUSD > 0 ? `Applicants typically need ~$${nomadProfile.remoteWorkVisaIncomeUSD.toLocaleString()} USD/month in verified remote earnings.` : 'Entry operates on liquid savings solvency or standard remote-friendly visitor rules.'} ${nomadProfile.remoteWorkVisaDetails}`,
              },
            },
            {
              '@type': 'Question',
              name: `How much does it cost to retire long-term in ${selectedCountry.name}?`,
              acceptedAnswer: {
                '@type': 'Answer',
                text: `A single retiree in ${selectedCountry.name} on a 12-month residential lease typically spends around $${singleBudget.toLocaleString()} USD per month, while a retired couple averages $${coupleBudget.toLocaleString()} USD per month (requiring a 4% SWR FIRE nest egg of ~$${(coupleBudget * 12 * 25).toLocaleString()} USD). A 1-bedroom apartment in ${selectedCountry.capital} or prime city center averages $${selectedCountry.costOfLiving.rent1BedCenterUSD.toLocaleString()}/month.`,
              },
            },
            {
              '@type': 'Question',
              name: `What are apartment rental costs and safe areas for expats in ${selectedCountry.name}?`,
              acceptedAnswer: {
                '@type': 'Answer',
                text: `In ${selectedCountry.name}, 1-bedroom long-term apartments in prime walkable districts average $${selectedCountry.costOfLiving.rent1BedCenterUSD.toLocaleString()}/month, while short-term furnished nomad stays average $${nomadProfile.furnishedShortTermRentUSD.toLocaleString()}/month. ReFirely provides verified neighborhood rent breakdowns, walkability scores, and safe expat districts.`,
              },
            },
            {
              '@type': 'Question',
              name: `What is the food and dining culture like in ${selectedCountry.name}?`,
              acceptedAnswer: {
                '@type': 'Answer',
                text: `Dining in ${selectedCountry.name} is known for ${foodProfile.cuisineHeadline.toLowerCase()}. Signature national dishes include ${foodProfile.nationalDishes.map(d => `${d.name} (${d.localName})`).slice(0, 3).join(', ')}. Casual dining averages $${foodProfile.costsAndHygiene.casualRestaurantMealUSD} USD per meal, while street food or bakery snacks cost around $${foodProfile.costsAndHygiene.streetFoodOrMarketMealUSD} USD. Tap water status: ${foodProfile.costsAndHygiene.waterSafety}. Vegetarian/vegan friendliness: ${foodProfile.dietaryRestrictions.vegetarianRating}.`,
              },
            },
            {
              '@type': 'Question',
              name: `What are the retirement visa requirements for ${selectedCountry.name}?`,
              acceptedAnswer: {
                '@type': 'Answer',
                text: `${selectedCountry.name} offers the ${visaName}, which requires a minimum passive income or pension of approximately $${minIncome.toLocaleString()} USD per month. Processing takes roughly ${selectedCountry.visa.processingMonths} months. Pathway to permanent residency: ${selectedCountry.visa.pathwayToPR}.`,
              },
            },
          ],
        },
      ],
    };

    scriptEl.textContent = JSON.stringify(jsonLd);
  } else if (currentView === 'visa-check') {
    const visaCheckUrl = `${origin}/visa-check`;
    const visaJsonLd = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'ReFirely Home',
              item: `${origin}/`,
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'Global Visa Checker & Passport Mobility Explorer',
              item: visaCheckUrl,
            },
          ],
        },
        {
          '@type': 'WebApplication',
          name: 'ReFirely Global Visa Checker & Bilateral Passport Mobility Tool',
          url: visaCheckUrl,
          applicationCategory: 'TravelApplication',
          operatingSystem: 'All',
          description: STATIC_PAGE_SEO['visa-check'].description,
          image: STATIC_PAGE_SEO['visa-check'].ogImage,
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
          },
        },
        {
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: 'Which countries can I visit visa-free with a valid U.S. B1/B2 or Schengen visa?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'A valid multiple-entry U.S. visa (B1/B2, H1B, F1, or Green Card) or Schengen visa unlocks visa-free, Visa on Arrival, or fast e-Visa entry to over 35 destinations—including Mexico (up to 180 days), Costa Rica (US/Canada visa), Panama, Dominican Republic, Serbia, Montenegro, Albania, Bosnia & Herzegovina, Georgia (90 days), Cyprus (multi-entry Schengen), UAE 14-day VoA (for Indian citizens), Philippines 14-day visa-free (for Indian citizens), Saudi Arabia VoA/e-Visa (with used visa), and Türkiye e-Visa.',
              },
            },
            {
              '@type': 'Question',
              name: 'Do diplomatic and official passport holders have different visa-free countries?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Yes. Many nations sign Bilateral Visa Waiver Agreements (BVWA) strictly by booklet class. For example, India’s Ministry of External Affairs maintains separate lists for Diplomatic-Only treaties (34 countries including Portugal, Spain, France, Germany, Italy, Japan, and Malta) versus dual-class Diplomatic & Official/Service agreements, while Türkiye’s Special (Green) passport provides Schengen visa-free access.',
              },
            },
            {
              '@type': 'Question',
              name: 'What other third-country visas unlock visa-free travel besides U.S. and Schengen visas?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Valid visas or residence permits from the United Kingdom (unlocks Ireland BIVS/SSVWP, Mexico, Balkans, UAE VoA for Indians, Saudi VoA, Georgia), Canada (Mexico, Costa Rica, Panama, Dominican Republic, Peru, Georgia), Japan and Australia/New Zealand (Mexico, Panama, Philippines, Taiwan TAC, Singapore 96h VFTF), GCC Residence Permits (Georgia, Oman, Bahrain, Saudi Arabia, Azerbaijan), and the APEC Business Travel Card (19 Asia-Pacific economies) all provide valuable exemptions.',
              },
            },
            {
              '@type': 'Question',
              name: 'Where should I verify the latest official visa rules before flying?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Always verify final entry requirements, transit visa rules, and bilateral agreement applicability directly on the destination country’s official Ministry of Foreign Affairs, Immigration Department, or Embassy website prior to booking flights.',
              },
            },
          ],
        },
      ],
    };
    scriptEl.textContent = JSON.stringify(visaJsonLd);
  } else if (
    currentView === 'scout' ||
    currentView === 'community' ||
    currentView === 'meetups' ||
    currentView === 'compare' ||
    currentView === 'dashboard'
  ) {
    const cfg = STATIC_PAGE_SEO[currentView];
    const fullUrl = `${origin}${cfg.path}`;
    const viewJsonLd = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'ReFirely Home',
              item: `${origin}/`,
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: cfg.schemaName,
              item: fullUrl,
            },
          ],
        },
        {
          '@type': cfg.schemaType,
          name: cfg.schemaName,
          url: fullUrl,
          description: cfg.description,
          image: cfg.ogImage,
          ...(cfg.schemaType === 'WebApplication'
            ? {
                applicationCategory: 'FinanceApplication',
                operatingSystem: 'All',
                offers: {
                  '@type': 'Offer',
                  price: '0',
                  priceCurrency: 'USD',
                },
              }
            : {}),
        },
      ],
    };
    scriptEl.textContent = JSON.stringify(viewJsonLd);
  } else if (allCountries && allCountries.length > 0) {
    const itemListJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Global Retirement (FIRE) & Digital Nomad Havens Directory | ReFirely',
      description: DEFAULT_DESCRIPTION,
      numberOfItems: allCountries.length,
      itemListElement: allCountries.map((c, idx) => {
        const np = getCountryNomadProfile(c);
        return {
          '@type': 'ListItem',
          position: idx + 1,
          name: `${c.name} Retirement (FIRE) & Digital Nomad Guide`,
          description: `${c.tagline} Retiree couple budget: $${c.costOfLiving.monthlyBudgetCoupleUSD}/mo (${c.visa.retirementVisaName}). Digital Nomad cash burn: $${np.monthlyNomadBurnUSD}/mo, ${np.verifiedInternetMbps} Mbps fiber, Remote Visa: ${np.remoteWorkVisaName}.`,
          url: `${origin}/country/${encodeURIComponent(c.id)}`,
        };
      }),
    };
    scriptEl.textContent = JSON.stringify(itemListJsonLd);
  }
}

export function updatePageSeo(
  currentView: AppView,
  selectedCountry?: Country | null,
  allCountries?: Country[],
  currentPersona: Persona = 'retiree'
) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const origin = PUBLIC_SITE_ORIGIN;
  const logoUrl = `${origin}/assets/aistudio/refirely-logo.png`;
  const iconUrl = `${origin}/assets/aistudio/refirely-icon.png`;

  let title = DEFAULT_TITLE;
  let description = DEFAULT_DESCRIPTION;
  let keywords = DEFAULT_KEYWORDS;
  let canonicalUrl = `${origin}/`;
  let activeImage = logoUrl;
  let activeImageAlt = STATIC_PAGE_SEO.landing.ogImageAlt;

  if (currentView === 'country-detail' && selectedCountry) {
    const singleBudget = selectedCountry.costOfLiving.monthlyBudgetSingleUSD.toLocaleString();
    const coupleBudget = selectedCountry.costOfLiving.monthlyBudgetCoupleUSD.toLocaleString();
    const visaName = selectedCountry.visa.retirementVisaName;
    const foodProfile = getCountryGastronomyProfile(selectedCountry);
    const topDish = foodProfile.nationalDishes[0]?.name || 'Local Gastronomy';
    const nomadProfile = getCountryNomadProfile(selectedCountry);
    const nomadBurn = nomadProfile.monthlyNomadBurnUSD.toLocaleString();
    const fiberMbps = nomadProfile.verifiedInternetMbps;
    const dnvName = nomadProfile.remoteWorkVisaName;

    if (currentPersona === 'nomad') {
      title = `${selectedCountry.name} Digital Nomad & FIRE Guide: $${nomadBurn}/mo Burn, ${fiberMbps} Mbps & Visas | ReFirely`;
      description = `Digital Nomad & Retirement guide to ${selectedCountry.name}: $${nomadBurn}/mo turnkey cash burn, ${fiberMbps} Mbps fiber, ${dnvName}, $${singleBudget}/mo retiree budget & ${topDish}.`;
    } else {
      title = `${selectedCountry.name} Retirement & Nomad Guide: Visas, $${singleBudget}/mo Cost, Rents & Burn | ReFirely`;
      description = `Retire or work remotely in ${selectedCountry.name}: $${singleBudget}/mo retiree budget ($${coupleBudget} couple), $${nomadBurn}/mo nomad burn, ${fiberMbps} Mbps fiber, ${visaName} & ${dnvName}.`;
    }

    keywords = `digital nomad ${selectedCountry.name}, ${selectedCountry.name} monthly cash burn, ${selectedCountry.name} digital nomad visa, ${dnvName}, ${selectedCountry.name} internet speed Mbps, coworking in ${selectedCountry.name}, retire in ${selectedCountry.name}, ${selectedCountry.name} retirement visa, ${visaName}, ${selectedCountry.name} cost of living, ${selectedCountry.name} housing rent costs, ${selectedCountry.name} furnished apartment rent, ${selectedCountry.name} food and gastronomy, ${selectedCountry.name} expat healthcare, ReFirely ${selectedCountry.name}`;
    canonicalUrl = `${origin}/country/${encodeURIComponent(selectedCountry.id)}`;
    activeImage =
      selectedCountry.imageUrl && selectedCountry.imageUrl.startsWith('https://')
        ? selectedCountry.imageUrl
        : STATIC_PAGE_SEO.explore.ogImage;
    activeImageAlt = `${selectedCountry.name} Retirement (FIRE) & Digital Nomad Guide – ReFirely`;
  } else if (
    currentView !== 'landing' &&
    currentView !== 'admin' &&
    currentView !== 'country-detail'
  ) {
    const cfg = STATIC_PAGE_SEO[currentView];
    if (cfg) {
      title = cfg.title;
      description = cfg.description;
      keywords = cfg.keywords;
      canonicalUrl = `${origin}${cfg.path}`;
      activeImage = cfg.ogImage;
      activeImageAlt = cfg.ogImageAlt;

      if (currentView === 'explore') {
        const countLabel = allCountries && allCountries.length > 0 ? `${allCountries.length}` : '209';
        if (currentPersona === 'nomad') {
          title = `Explore ${countLabel} Digital Nomad & Retirement Havens: Cash Burn, Fiber & DNV Visas | ReFirely`;
          description = `Filter ${countLabel} global havens by lowest monthly nomad cash burn, 6-month runway, Digital Nomad Visa (DNV) rules, verified fiber internet speeds, coworking, and FIRE budgets.`;
        } else {
          title = `Explore ${countLabel} Global Retirement (FIRE) & Digital Nomad Havens | ReFirely`;
          description = `Search and filter ${countLabel} verified global havens for early retirement and digital nomads. Compare visas, monthly cash burn, 4% FIRE nest eggs, fiber speeds, rents, and dining.`;
        }
      }
    }
  }

  document.title = title;

  setMetaTag('name', 'title', title);
  setMetaTag('name', 'description', description);
  setMetaTag('name', 'keywords', keywords);

  // OpenGraph tags
  setMetaTag('property', 'og:type', 'website');
  setMetaTag('property', 'og:title', title);
  setMetaTag('property', 'og:description', description);
  setMetaTag('property', 'og:url', canonicalUrl);
  setMetaTag('property', 'og:image', activeImage);
  setMetaTag('property', 'og:image:url', activeImage);
  setMetaTag('property', 'og:image:secure_url', activeImage);
  setMetaTag('property', 'og:image:alt', activeImageAlt);
  setMetaTag('property', 'og:logo', iconUrl);

  // Twitter Card tags
  setMetaTag('name', 'twitter:card', 'summary_large_image');
  setMetaTag('name', 'twitter:url', canonicalUrl);
  setMetaTag('name', 'twitter:title', title);
  setMetaTag('name', 'twitter:description', description);
  setMetaTag('name', 'twitter:image', activeImage);
  setMetaTag('name', 'twitter:image:alt', activeImageAlt);

  // Update canonical link
  let canonicalEl = document.getElementById('canonical-link') as HTMLLinkElement | null;
  if (!canonicalEl) {
    canonicalEl = document.createElement('link');
    canonicalEl.id = 'canonical-link';
    canonicalEl.rel = 'canonical';
    document.head.appendChild(canonicalEl);
  }
  canonicalEl.href = canonicalUrl;

  // Update dynamic multi-colored SVG favicon in browser tab
  updateMultiColoredFavicon(currentView);

  // Update Schema.org JSON-LD Structured Data
  updateStructuredDataJsonLd(origin, currentView, selectedCountry, allCountries);
}

export function updatePublicProfileSeo(memberAccount: { id: string; username?: string; profile: import('../types').UserProfile }) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  const profile = memberAccount.profile;
  const origin = PUBLIC_SITE_ORIGIN;
  const shareUrl = `${origin}/?profile=${encodeURIComponent(memberAccount.username || memberAccount.id)}`;
  const avatar = profile.avatarUrl && !profile.avatarUrl.includes('images.unsplash.com') ? profile.avatarUrl : `${origin}/assets/aistudio/refirely-logo.png`;
  
  const visitedCount = profile.travelHistory?.length || 0;
  const langCount = profile.languagesKnown?.length || 0;
  const badgeCount = profile.badges?.length || 0;
  const residence = profile.residingCountry || profile.originCountry || 'Global Haven';
  const targetHaven = profile.targetCountry || residence;

  const title = `${profile.name} – Verified Expat Profile (${residence}) | ReFirely`;
  const badgeSuffix = badgeCount > 0 ? `, ${badgeCount} verified badges` : '';
  const description = `Explore ${profile.name}'s verified expat profile: residing in ${residence}, scouting ${targetHaven}, ${visitedCount} countries visited, ${langCount} languages spoken${badgeSuffix} on ReFirely.`;

  document.title = title;
  setMetaTag('name', 'title', title);
  setMetaTag('name', 'description', description);
  setMetaTag('property', 'og:type', 'profile');
  setMetaTag('property', 'og:title', title);
  setMetaTag('property', 'og:description', description);
  setMetaTag('property', 'og:url', shareUrl);
  setMetaTag('property', 'og:image', avatar);
  setMetaTag('property', 'og:image:secure_url', avatar);
  setMetaTag('property', 'og:image:alt', `${profile.name} – Verified Expat Profile on ReFirely`);
  setMetaTag('property', 'og:logo', `${origin}/assets/aistudio/refirely-icon.png`);
  setMetaTag('name', 'twitter:card', 'summary_large_image');
  setMetaTag('name', 'twitter:url', shareUrl);
  setMetaTag('name', 'twitter:title', title);
  setMetaTag('name', 'twitter:description', description);
  setMetaTag('name', 'twitter:image', avatar);
  setMetaTag('name', 'twitter:image:alt', `${profile.name} – Verified Expat Profile on ReFirely`);

  let canonicalEl = document.getElementById('canonical-link') as HTMLLinkElement | null;
  if (!canonicalEl) {
    canonicalEl = document.createElement('link');
    canonicalEl.id = 'canonical-link';
    canonicalEl.rel = 'canonical';
    document.head.appendChild(canonicalEl);
  }
  canonicalEl.href = shareUrl;

  // Inject ProfilePage Schema.org JSON-LD for rich social and search indexing
  let scriptEl = document.getElementById('dynamic-seo-jsonld') as HTMLScriptElement | null;
  if (!scriptEl) {
    scriptEl = document.createElement('script');
    scriptEl.id = 'dynamic-seo-jsonld';
    scriptEl.type = 'application/ld+json';
    document.head.appendChild(scriptEl);
  }
  const profileJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    url: shareUrl,
    name: title,
    description,
    mainEntity: {
      '@type': 'Person',
      name: profile.name,
      identifier: memberAccount.username || memberAccount.id,
      description: profile.bio || description,
      image: avatar,
      homeLocation: {
        '@type': 'Place',
        name: residence,
      },
      knowsLanguage: (profile.languagesKnown || []).map(l => l.language),
      ...(badgeCount > 0 ? { award: (profile.badges || []).map(b => b.id) } : {}),
    },
  };
  scriptEl.textContent = JSON.stringify(profileJsonLd);
}

export function updateVisaCheckRouteSeo(params: {
  originName: string;
  originCode: string;
  destinationName: string;
  destinationCode: string;
  passportLabel: string;
  passportTypeId?: string;
  isDefaultPassport?: boolean;
  statusHeadline: string;
  heldVisasLabels: string[];
  heldVisasIds?: string[];
  totalAccessibleCountries?: number;
  visaFreeCountries?: number;
}) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  const origin = PUBLIC_SITE_ORIGIN;
  const matchedSlug = findMatchingFeaturedVisaSlug({
    originCode: params.originCode,
    destinationCode: params.destinationCode,
    passportTypeId: params.passportTypeId,
    isDefaultPassport: params.isDefaultPassport,
    heldVisas: params.heldVisasIds,
  });

  let routeUrl: string;
  if (matchedSlug) {
    routeUrl = `${origin}/visa-check/${matchedSlug}`;
  } else {
    const urlParams = new URLSearchParams();
    urlParams.set('from', params.originCode);
    urlParams.set('to', params.destinationCode);
    if (params.passportTypeId && !params.isDefaultPassport) {
      urlParams.set('passport', params.passportTypeId);
    }
    if (params.heldVisasIds && params.heldVisasIds.length > 0) {
      urlParams.set('visas', params.heldVisasIds.join(','));
    }
    routeUrl = `${origin}/visa-check?${urlParams.toString()}`;
  }

  const visaSuffix =
    params.heldVisasLabels.length > 0 ? ` with ${params.heldVisasLabels.join(' & ')}` : '';
  const passportSuffix = params.isDefaultPassport ? '' : ` (${params.passportLabel})`;
  const accessSummary =
    typeof params.totalAccessibleCountries === 'number'
      ? ` ${params.originName} (${params.passportLabel})${visaSuffix} holders can access ${params.totalAccessibleCountries} countries${typeof params.visaFreeCountries === 'number' ? ` (${params.visaFreeCountries} visa-free)` : ''}.`
      : '';
  const title = `Do ${params.originName}${passportSuffix} Passport Holders Need a Visa for ${params.destinationName}${visaSuffix}? | ReFirely`;
  const description = `${params.statusHeadline}.${accessSummary} Check official ${params.destinationName} visa requirements, bilateral visa waiver agreements & live government links.`;
  const keywords = `${params.originName} to ${params.destinationName} visa requirements, do ${params.originName} citizens need visa for ${params.destinationName}, ${params.originName} ${params.passportLabel} ${params.destinationName} visa, ${params.destinationName} visa checker 2026${visaSuffix ? `, ${params.destinationName} visa free${visaSuffix}` : ''}, ReFirely visa check`;
  const ogImage = params.isDefaultPassport
    ? `${origin}/assets/og/visa-check.jpg`
    : `${origin}/assets/og/visa-passports.jpg`;

  document.title = title;
  setMetaTag('name', 'title', title);
  setMetaTag('name', 'description', description);
  setMetaTag('name', 'keywords', keywords);
  setMetaTag('property', 'og:title', title);
  setMetaTag('property', 'og:description', description);
  setMetaTag('property', 'og:url', routeUrl);
  setMetaTag('property', 'og:image', ogImage);
  setMetaTag('property', 'og:image:url', ogImage);
  setMetaTag('property', 'og:image:secure_url', ogImage);
  setMetaTag('property', 'og:image:alt', `${params.originName} to ${params.destinationName} Visa Check – ReFirely`);
  setMetaTag('name', 'twitter:title', title);
  setMetaTag('name', 'twitter:description', description);
  setMetaTag('name', 'twitter:url', routeUrl);
  setMetaTag('name', 'twitter:image', ogImage);
  setMetaTag('name', 'twitter:image:alt', `${params.originName} to ${params.destinationName} Visa Check – ReFirely`);

  let canonicalEl = document.getElementById('canonical-link') as HTMLLinkElement | null;
  if (canonicalEl) {
    canonicalEl.href = routeUrl;
  }

  // Inject route-specific BreadcrumbList & FAQPage Schema.org JSON-LD for rich snippets
  let scriptEl = document.getElementById('dynamic-seo-jsonld') as HTMLScriptElement | null;
  if (!scriptEl) {
    scriptEl = document.createElement('script');
    scriptEl.id = 'dynamic-seo-jsonld';
    scriptEl.type = 'application/ld+json';
    document.head.appendChild(scriptEl);
  }
  const routeJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'ReFirely Home',
            item: `${origin}/`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Global Visa Check',
            item: `${origin}/visa-check`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: `${params.originName} to ${params.destinationName} Visa Rules`,
            item: routeUrl,
          },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: `Do ${params.originName} (${params.passportLabel}) holders need a visa to travel to ${params.destinationName}${visaSuffix}?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `${params.statusHeadline}.${accessSummary} Always verify the latest entry conditions, stay limits, and bilateral visa waiver terms directly on the official ${params.destinationName} Ministry of Foreign Affairs or Embassy portal.`,
            },
          },
        ],
      },
    ],
  };
  scriptEl.textContent = JSON.stringify(routeJsonLd);
}

const VIEW_RING_PALETTES: Record<AppView, [string, string, string, string]> = {
  landing: ['#14b8a6', '#6366f1', '#d946ef', '#f59e0b'],
  explore: ['#10b981', '#06b6d4', '#6366f1', '#f97316'],
  'country-detail': ['#f59e0b', '#f43f5e', '#8b5cf6', '#14b8a6'],
  compare: ['#6366f1', '#a855f7', '#ec4899', '#14b8a6'],
  scout: ['#14b8a6', '#6366f1', '#f59e0b', '#10b981'],
  'visa-check': ['#0d9488', '#4f46e5', '#f59e0b', '#10b981'],
  community: ['#14b8a6', '#3b82f6', '#8b5cf6', '#f59e0b'],
  meetups: ['#f97316', '#ec4899', '#6366f1', '#10b981'],
  messages: ['#06b6d4', '#6366f1', '#d946ef', '#f43f5e'],
  dashboard: ['#10b981', '#6366f1', '#f59e0b', '#f43f5e'],
  admin: ['#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6'],
};

function updateMultiColoredFavicon(_view: AppView) {
  if (typeof document === 'undefined') return;
  let linkEl = document.getElementById('dynamic-favicon') as HTMLLinkElement | null;
  if (!linkEl) {
    linkEl = document.createElement('link');
    linkEl.id = 'dynamic-favicon';
    linkEl.rel = 'icon';
    document.head.appendChild(linkEl);
  }
  linkEl.type = 'image/png';
  linkEl.href = '/favicon.png';
}

