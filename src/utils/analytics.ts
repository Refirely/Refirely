import { Country, ViewState } from '../types';
import firebaseConfig from '../../firebase-applet-config.json';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

// Resolve Google Analytics 4 Measurement ID (G-BF5ZNE0F65)
export const GA_MEASUREMENT_ID: string =
  (import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined)?.trim() ||
  (firebaseConfig.measurementId as string | undefined)?.trim() ||
  'G-BF5ZNE0F65';

let isGaInitialized = false;
let isInitialPageLoad = true;

/**
 * Ensures Google Analytics 4 (gtag.js) is available on window.
 */
export function initGoogleAnalytics(): void {
  if (typeof window === 'undefined' || isGaInitialized) return;
  if (!GA_MEASUREMENT_ID || !GA_MEASUREMENT_ID.startsWith('G-')) {
    return;
  }

  isGaInitialized = true;

  // Ensure dataLayer and gtag function exist
  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function gtag(...args: unknown[]) {
      window.dataLayer?.push(args);
    };

  // Inject the async gtag.js script if not already present in index.html
  const existingScript = document.querySelector(
    `script[src*="googletagmanager.com/gtag/js"]`
  );
  if (!existingScript) {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(
      GA_MEASUREMENT_ID
    )}`;
    document.head.appendChild(script);
    window.gtag('js', new Date());
    window.gtag('config', GA_MEASUREMENT_ID);
  }
}

/**
 * Tracks virtual SPA pageviews across all views and Country Dossiers.
 */
export function trackPageView(
  view: ViewState,
  selectedCountry?: Country | null
): void {
  if (typeof window === 'undefined') return;
  initGoogleAnalytics();

  if (!window.gtag || !GA_MEASUREMENT_ID) return;

  // The inline script in index.html already sends the initial landing page_view,
  // so skip duplicate firing on the very first hydration unless viewing a country dossier.
  if (isInitialPageLoad) {
    isInitialPageLoad = false;
    if (view === 'landing' && !selectedCountry) {
      return;
    }
  }

  const pagePath =
    view === 'country-detail' && selectedCountry
      ? `/?country=${encodeURIComponent(selectedCountry.id)}`
      : view === 'landing'
      ? '/'
      : `/?view=${encodeURIComponent(view)}`;

  const pageTitle = document.title;

  window.gtag('event', 'page_view', {
    page_title: pageTitle,
    page_location: window.location.href,
    page_path: pagePath,
    view_name: view,
    country_id: selectedCountry?.id || undefined,
    country_name: selectedCountry?.name || undefined,
  });
}

/**
 * Tracks custom user interaction events (e.g. Dossier Tab switches, PDF exports, Affiliate clicks).
 */
export function trackAnalyticsEvent(
  eventName: string,
  params?: Record<string, string | number | boolean | undefined>
): void {
  if (typeof window === 'undefined') return;
  initGoogleAnalytics();

  if (!window.gtag || !GA_MEASUREMENT_ID) return;

  window.gtag('event', eventName, params || {});
}
