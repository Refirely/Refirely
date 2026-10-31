import { Country, Persona } from '../types';
import { AppView } from '../context/AppContext';
import { getCountryGastronomyProfile } from '../data/countryFoodAndGastronomy';
import { getCountryNomadProfile } from '../data/countryNomadProfiles';

const DEFAULT_TITLE =
  'ReFirely – Global Retirement (FIRE) & Digital Nomad Haven Guide | Runway & Burn Calculator';
const DEFAULT_DESCRIPTION =
  'Compare 209 global havens for early retirement (FIRE) and digital nomads: explore monthly cash burn, nomad runway, remote & DNV visas, fiber internet, rents, food, and healthcare.';
const DEFAULT_KEYWORDS =
  'digital nomad cost of living 2026, nomad cash burn calculator, digital nomad runway simulator, best countries to retire 2026, global retirement havens, digital nomad visa friendly countries, Spain digital nomad visa, Thailand DTV visa, Portugal D8 digital nomad visa, Portugal D7 visa, fastest internet speed for remote work, coworking spaces abroad, short-term furnished apartment rent overseas, monthly living burn abroad, geographic arbitrage platform, slow travel budget calculator, FIRE calculator overseas, safe expat neighborhoods, apartment rents abroad, food and gastronomy abroad, vegetarian vegan expat dining, tap water safety overseas, retirement visa requirements, international healthcare for expats, SafetyWing nomad insurance, Wise multi-currency expat transfers, expat taxes 183 day rule, female to male ratio by country, dating and lifestyle dynamics, financial independence retire early';

const VALID_VIEWS: AppView[] = [
  'landing',
  'explore',
  'country-detail',
  'compare',
  'community',
  'meetups',
  'messages',
  'dashboard',
  'admin',
];

/**
 * Returns the relative crawlable href for a specific country dossier.
 * Uses query parameter format `/?country=id` so it works on all static/cloud hosts without 404s
 * while remaining a unique, canonical URL for search engine crawlers.
 */
export function getCountryUrl(countryId: string): string {
  return `/?country=${encodeURIComponent(countryId)}`;
}

export const PUBLIC_SITE_ORIGIN = 'https://refirely.com';

/**
 * Returns the full absolute shareable URL for a specific country dossier
 * anchored to the production domain https://refirely.com.
 */
export function getFullCountryUrl(countryId: string): string {
  return `${PUBLIC_SITE_ORIGIN}/?country=${encodeURIComponent(countryId)}`;
}

/**
 * Returns the relative crawlable href for an application view.
 */
export function getViewUrl(view: AppView, countryId?: string): string {
  if (view === 'country-detail' && countryId) {
    return getCountryUrl(countryId);
  }
  if (view === 'landing') {
    return '/';
  }
  return `/?view=${encodeURIComponent(view)}`;
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
  const viewParam = params.get('view')?.trim().toLowerCase() as AppView | undefined;

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

  // 2. Check clean path /country/<id> or /countries/<id>
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

  // 3. Check ?view=<view>
  if (viewParam && VALID_VIEWS.includes(viewParam)) {
    return { view: viewParam };
  }

  // 4. Check clean path /explore, /compare, /community, /meetups, /dashboard, /messages, /admin
  if (pathSegments.length === 1) {
    const seg = pathSegments[0] as AppView;
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
    const countryUrl = `${origin}/?country=${encodeURIComponent(selectedCountry.id)}`;
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
              item: `${origin}/?view=explore`,
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
  } else if (allCountries && allCountries.length > 0) {
    // Inject ItemList of all countries so web crawlers discover every dedicated country URL with both Retiree & Nomad metrics
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
          url: `${origin}/?country=${encodeURIComponent(c.id)}`,
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

  if (currentView === 'country-detail' && selectedCountry) {
    const singleBudget = selectedCountry.costOfLiving.monthlyBudgetSingleUSD.toLocaleString();
    const coupleBudget = selectedCountry.costOfLiving.monthlyBudgetCoupleUSD.toLocaleString();
    const rentCenter = selectedCountry.costOfLiving.rent1BedCenterUSD.toLocaleString();
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
    canonicalUrl = `${origin}/?country=${encodeURIComponent(selectedCountry.id)}`;
  } else if (currentView === 'explore') {
    const countLabel = allCountries && allCountries.length > 0 ? `${allCountries.length}` : '209';
    if (currentPersona === 'nomad') {
      title = `Explore ${countLabel} Digital Nomad & Retirement Havens: Cash Burn, Fiber & DNV Visas | ReFirely`;
      description =
        `Filter ${countLabel} global havens by lowest monthly nomad cash burn, 6-month runway, Digital Nomad Visa (DNV) rules, verified fiber internet speeds, coworking, and FIRE budgets.`;
    } else {
      title = `Explore ${countLabel} Global Retirement (FIRE) & Digital Nomad Havens | ReFirely`;
      description =
        `Search and filter ${countLabel} verified global havens for early retirement and digital nomads. Compare visas, monthly cash burn, 4% FIRE nest eggs, fiber speeds, rents, and dining.`;
    }
    canonicalUrl = `${origin}/?view=explore`;
  } else if (currentView === 'compare') {
    title = 'Compare 209 Retirement (FIRE) & Digital Nomad Havens Side-by-Side | ReFirely';
    description =
      'Compare countries side-by-side: evaluate monthly nomad cash burn, 4% FIRE couple budgets, Digital Nomad & retirement visas, fiber internet speeds, apartment rents, food, and healthcare.';
    canonicalUrl = `${origin}/?view=compare`;
  } else if (currentView === 'dashboard') {
    title = 'Global FIRE Nest Egg & Digital Nomad Runway Burn Calculator | ReFirely';
    description =
      'Calculate your 4% SWR FIRE target or Digital Nomad liquid cash runway across 209 countries. Model monthly cash burn, geoarbitrage savings, housing rents, and currency transfers.';
    canonicalUrl = `${origin}/?view=dashboard`;
  } else if (currentView === 'community') {
    title = 'Expat Retirement & Digital Nomad Community Forum | ReFirely';
    description =
      'Connect with verified expats, early retirees, and digital nomads living abroad. Discuss DNV & retirement visas, coworking hubs, apartment leases, and healthcare.';
    canonicalUrl = `${origin}/?view=community`;
  } else if (currentView === 'meetups') {
    title = 'Expat, Retiree & Digital Nomad Meetups Worldwide | ReFirely';
    description =
      'Join in-person and online expat & digital nomad meetups in Portugal, Spain, Thailand, Costa Rica, Mexico, and top global havens.';
    canonicalUrl = `${origin}/?view=meetups`;
  }

  document.title = title;

  setMetaTag('name', 'title', title);
  setMetaTag('name', 'description', description);
  setMetaTag('name', 'keywords', keywords);

  // OpenGraph tags
  setMetaTag('property', 'og:title', title);
  setMetaTag('property', 'og:description', description);
  setMetaTag('property', 'og:url', canonicalUrl);
  setMetaTag('property', 'og:image', selectedCountry?.imageUrl || logoUrl);
  setMetaTag('property', 'og:image:secure_url', selectedCountry?.imageUrl || logoUrl);
  setMetaTag('property', 'og:logo', iconUrl);

  // Twitter Card tags
  setMetaTag('name', 'twitter:title', title);
  setMetaTag('name', 'twitter:description', description);
  setMetaTag('name', 'twitter:image', selectedCountry?.imageUrl || logoUrl);

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

const VIEW_RING_PALETTES: Record<AppView, [string, string, string, string]> = {
  landing: ['#14b8a6', '#6366f1', '#d946ef', '#f59e0b'],
  explore: ['#10b981', '#06b6d4', '#6366f1', '#f97316'],
  'country-detail': ['#f59e0b', '#f43f5e', '#8b5cf6', '#14b8a6'],
  compare: ['#6366f1', '#a855f7', '#ec4899', '#14b8a6'],
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

