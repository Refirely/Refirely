import { Country } from '../types';
import { AppView } from '../context/AppContext';

const DEFAULT_TITLE =
  'ReFirely - Where Your Freedom Goes Further | AI Haven Retirement Guide & FIRE Calculator';
const DEFAULT_DESCRIPTION =
  'AI Haven retirement guide and FIRE calculator to compare 200+ global retirement countries by visa rules, cost of living, healthcare, banking, taxes, and expat community.';
const DEFAULT_KEYWORDS =
  'ReFirely, ReFIREly, AI Haven retirement guide, FIRE calculator, retire abroad, global retirement guide, financial independence retire early, retirement visa requirements, cost of living comparison, expat community, overseas retirement planning';

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
              name: 'Explore Retirement Havens',
              item: `${origin}/?view=explore`,
            },
            {
              '@type': 'ListItem',
              position: 3,
              name: `${selectedCountry.name} Retirement Guide`,
              item: countryUrl,
            },
          ],
        },
        {
          '@type': 'Place',
          name: `${selectedCountry.name} Retirement & Expat Haven`,
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
              name: 'Primary Retirement Visa Pathway',
              value: visaName,
            },
            {
              '@type': 'PropertyValue',
              name: 'Minimum Monthly Visa Income Requirement (USD)',
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
          ],
        },
        {
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: `How much does it cost to retire in ${selectedCountry.name}?`,
              acceptedAnswer: {
                '@type': 'Answer',
                text: `A single retiree in ${selectedCountry.name} typically spends around $${singleBudget.toLocaleString()} USD per month, while a retired couple averages $${coupleBudget.toLocaleString()} USD per month. A 1-bedroom apartment in the city center averages $${selectedCountry.costOfLiving.rent1BedCenterUSD.toLocaleString()}/month.`,
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
            {
              '@type': 'Question',
              name: `How is the healthcare and tax environment for retirees in ${selectedCountry.name}?`,
              acceptedAnswer: {
                '@type': 'Answer',
                text: `${selectedCountry.name} has a healthcare score of ${selectedCountry.lifestyle.healthcareScore}/100 (${selectedCountry.lifestyle.healthcareSummary}). Tax overview: ${selectedCountry.visa.taxStatus}.`,
              },
            },
          ],
        },
      ],
    };

    scriptEl.textContent = JSON.stringify(jsonLd);
  } else if (allCountries && allCountries.length > 0) {
    // Inject ItemList of all countries so web crawlers discover every dedicated country URL
    const itemListJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Global Retirement Havens & Country Dossiers | ReFirely',
      description: DEFAULT_DESCRIPTION,
      numberOfItems: allCountries.length,
      itemListElement: allCountries.map((c, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: `${c.name} Retirement Guide & Visa Requirements`,
        description: `${c.tagline} Single budget: $${c.costOfLiving.monthlyBudgetSingleUSD}/mo, Couple: $${c.costOfLiving.monthlyBudgetCoupleUSD}/mo, Visa: ${c.visa.retirementVisaName}.`,
        url: `${origin}/?country=${encodeURIComponent(c.id)}`,
      })),
    };
    scriptEl.textContent = JSON.stringify(itemListJsonLd);
  }
}

export function updatePageSeo(
  currentView: AppView,
  selectedCountry?: Country | null,
  allCountries?: Country[]
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
    const visaName = selectedCountry.visa.retirementVisaName;
    const healthScore = selectedCountry.lifestyle.healthcareScore;

    title = `${selectedCountry.name} Retirement Guide, Visa Rules & Cost of Living | ReFirely`;
    description = `Retire in ${selectedCountry.name} (${selectedCountry.region}): $${singleBudget}/mo single or $${coupleBudget}/mo couple, ${visaName} visa rules, healthcare score ${healthScore}/100, and FIRE calculator.`;
    keywords = `retire in ${selectedCountry.name}, ${selectedCountry.name} retirement visa, ${visaName}, ${selectedCountry.name} cost of living, ReFirely AI Haven retirement guide, FIRE calculator ${selectedCountry.name}`;
    canonicalUrl = `${origin}/?country=${encodeURIComponent(selectedCountry.id)}`;
  } else if (currentView === 'explore') {
    const countLabel = allCountries && allCountries.length > 0 ? `${allCountries.length}` : '140+';
    title = `Explore ${countLabel} Global Retirement Havens | ReFirely AI Haven Guide & FIRE Calculator`;
    description =
      `Filter and compare ${countLabel} verified retirement havens worldwide with AI Haven match suggestions, visa financial thresholds, monthly cost of living, healthcare rankings, and climate profiles.`;
    canonicalUrl = `${origin}/?view=explore`;
  } else if (currentView === 'compare') {
    title = 'Side-by-Side Country Comparison Matrix | ReFirely Retirement Guide & FIRE Calculator';
    description =
      'Compare retirement countries side-by-side across visa income requirements, couple and single monthly budgets, tax rules, healthcare quality, and safety indexes.';
    canonicalUrl = `${origin}/?view=compare`;
  } else if (currentView === 'dashboard') {
    title = 'Global FIRE Calculator & Relocation Checklist | ReFirely Retirement Planner';
    description =
      'Calculate your Financial Independence Retire Early (FIRE) target across 140+ countries, model geographic arbitrage savings, and track your overseas retirement checklist.';
    canonicalUrl = `${origin}/?view=dashboard`;
  } else if (currentView === 'community') {
    title = 'Verified Expat Community Boards & Q&A | ReFirely Global Retirement Network';
    description =
      'Connect with real expats and retirees worldwide. Discuss visa renewals, local healthcare, housing costs, and international relocation experiences on ReFirely.';
    canonicalUrl = `${origin}/?view=community`;
  } else if (currentView === 'meetups') {
    title = 'Expat Meetups & Local Retirement Events | ReFirely Community';
    description =
      'Discover and RSVP to in-person and virtual expat meetups in top retirement havens including Portugal, Spain, Thailand, Costa Rica, and Panama.';
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

