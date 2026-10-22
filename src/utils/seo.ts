import { Country } from '../types';
import { AppView } from '../context/AppContext';

const DEFAULT_TITLE =
  'ReFirely - Where Your Freedom Goes Further | AI Haven Retirement Guide & FIRE Calculator';
const DEFAULT_DESCRIPTION =
  'AI Haven retirement guide and FIRE calculator to compare 55+ global retirement countries by visa rules, cost of living, healthcare, taxes, and expat community.';
const DEFAULT_KEYWORDS =
  'ReFirely, ReFIREly, AI Haven retirement guide, FIRE calculator, retire abroad, global retirement guide, financial independence retire early, retirement visa requirements, cost of living comparison, expat community, overseas retirement planning';

function setMetaTag(attr: 'name' | 'property', key: string, content: string) {
  let element = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attr, key);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

export function updatePageSeo(currentView: AppView, selectedCountry?: Country | null) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const origin = window.location.origin;
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

    title = `${selectedCountry.name} Retirement Guide, Visa Rules & Cost of Living | ReFirely AI Haven & FIRE Calculator`;
    description = `Retire in ${selectedCountry.name} (${selectedCountry.region}): $${singleBudget}/mo single or $${coupleBudget}/mo couple, ${visaName} visa rules, healthcare score ${healthScore}/100, and FIRE calculator.`;
    keywords = `retire in ${selectedCountry.name}, ${selectedCountry.name} retirement visa, ${visaName}, ${selectedCountry.name} cost of living, ReFirely AI Haven retirement guide, FIRE calculator ${selectedCountry.name}`;
    canonicalUrl = `${origin}/?country=${encodeURIComponent(selectedCountry.id)}`;
  } else if (currentView === 'explore') {
    title = 'Explore 55+ Global Retirement Havens | ReFirely AI Haven Guide & FIRE Calculator';
    description =
      'Filter and compare 55+ verified retirement havens worldwide with AI Haven match suggestions, visa financial thresholds, monthly cost of living, healthcare rankings, and climate profiles.';
    canonicalUrl = `${origin}/?view=explore`;
  } else if (currentView === 'compare') {
    title = 'Side-by-Side Country Comparison Matrix | ReFirely Retirement Guide & FIRE Calculator';
    description =
      'Compare retirement countries side-by-side across visa income requirements, couple and single monthly budgets, tax rules, healthcare quality, and safety indexes.';
    canonicalUrl = `${origin}/?view=compare`;
  } else if (currentView === 'dashboard') {
    title = 'Global FIRE Calculator & Relocation Checklist | ReFirely Retirement Planner';
    description =
      'Calculate your Financial Independence Retire Early (FIRE) target across 55+ countries, model geographic arbitrage savings, and track your overseas retirement checklist.';
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
  setMetaTag('property', 'og:image', logoUrl);
  setMetaTag('property', 'og:image:secure_url', logoUrl);
  setMetaTag('property', 'og:logo', iconUrl);

  // Twitter Card tags
  setMetaTag('name', 'twitter:title', title);
  setMetaTag('name', 'twitter:description', description);
  setMetaTag('name', 'twitter:image', logoUrl);

  // Update canonical link
  let canonicalEl = document.getElementById('canonical-link') as HTMLLinkElement | null;
  if (!canonicalEl) {
    canonicalEl = document.createElement('link');
    canonicalEl.id = 'canonical-link';
    canonicalEl.rel = 'canonical';
    document.head.appendChild(canonicalEl);
  }
  canonicalEl.href = canonicalUrl;
}
