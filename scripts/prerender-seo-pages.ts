import fs from 'fs';
import path from 'path';
import { INITIAL_COUNTRIES } from '../src/data/countries';
import { getCountryGastronomyProfile } from '../src/data/countryFoodAndGastronomy';
import { getCountryNomadProfile } from '../src/data/countryNomadProfiles';
import {
  PUBLIC_SITE_ORIGIN,
  STATIC_PAGE_SEO,
  FEATURED_VISA_CORRIDORS,
  type StaticPageSeoConfig,
} from '../src/data/seoRoutes';
import {
  getPassportTypesForCountry,
  HELD_VISA_OPTIONS,
} from '../src/data/visaCheckCatalog';
import {
  evaluateVisaRequirement,
  computeGlobalAccessMatrix,
} from '../src/data/visaCheckEngine';

function escapeHtmlAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

interface RenderPageSeoInput {
  outputRelativeDir: string; // e.g. 'visa-check' or 'country/portugal' or 'visa-check/in-to-pt'
  canonicalUrl: string;
  title: string;
  description: string;
  keywords: string;
  ogImage: string;
  ogImageType?: string;
  ogImageWidth?: string;
  ogImageHeight?: string;
  ogImageAlt: string;
  jsonLd: Record<string, unknown>;
}

function replaceMetaContent(
  html: string,
  attr: 'name' | 'property' | 'itemprop',
  key: string,
  content: string
): string {
  const escaped = escapeHtmlAttr(content);
  const regex = new RegExp(
    `(<meta\\s+[^>]*${attr}="${key}"[^>]*content=")([^"]*)("[^>]*>)`,
    'gi'
  );
  return html.replace(regex, (_match, prefix: string, _oldVal: string, suffix: string) => `${prefix}${escaped}${suffix}`);
}

function injectPageMetadata(templateHtml: string, page: RenderPageSeoInput): string {
  let html = templateHtml;

  const safeTitle = escapeHtmlAttr(page.title);
  const safeUrl = escapeHtmlAttr(page.canonicalUrl);
  const safeImage = escapeHtmlAttr(page.ogImage);

  // 1. Replace <title> (callback prevents $1/$2 in prices like "$1,950" from being treated as regex backreferences)
  html = html.replace(/<title>[\s\S]*?<\/title>/i, () => `<title>${safeTitle}</title>`);

  // 2. Replace primary SEO meta tags
  html = replaceMetaContent(html, 'name', 'title', page.title);
  html = replaceMetaContent(html, 'name', 'description', page.description);
  html = replaceMetaContent(html, 'name', 'keywords', page.keywords);

  // 3. Replace canonical, hreflang, and image_src links
  html = html.replace(
    /(<link\s+rel="canonical"[^>]*href=")([^"]*)("[^>]*>)/i,
    (_m, p1: string, _p2: string, p3: string) => `${p1}${safeUrl}${p3}`
  );
  html = html.replace(
    /(<link\s+rel="alternate"\s+hreflang="en"\s+href=")([^"]*)("[^>]*>)/i,
    (_m, p1: string, _p2: string, p3: string) => `${p1}${safeUrl}${p3}`
  );
  html = html.replace(
    /(<link\s+rel="alternate"\s+hreflang="x-default"\s+href=")([^"]*)("[^>]*>)/i,
    (_m, p1: string, _p2: string, p3: string) => `${p1}${safeUrl}${p3}`
  );
  html = html.replace(
    /(<link\s+rel="image_src"\s+href=")([^"]*)("[^>]*>)/i,
    (_m, p1: string, _p2: string, p3: string) => `${p1}${safeImage}${p3}`
  );

  // 4. Remove the secondary homepage emblem og:image block so WhatsApp/LinkedIn/Twitter strictly use this page's primary og:image
  html = html.replace(
    /<!-- Secondary OpenGraph Image:[\s\S]*?(?=<meta property="og:logo")/i,
    () => ''
  );

  // 5. Replace Schema.org microdata (itemprop)
  html = replaceMetaContent(html, 'itemprop', 'name', page.title);
  html = replaceMetaContent(html, 'itemprop', 'description', page.description);
  html = html.replace(
    /(<meta\s+itemprop="image"\s+content=")([^"]*)("[^>]*>)/gi,
    (_m, p1: string, _p2: string, p3: string) => `${p1}${safeImage}${p3}`
  );

  // 6. Replace OpenGraph tags
  html = replaceMetaContent(html, 'property', 'og:url', page.canonicalUrl);
  html = replaceMetaContent(html, 'property', 'og:title', page.title);
  html = replaceMetaContent(html, 'property', 'og:description', page.description);
  html = html.replace(
    /(<meta\s+property="og:image"[^>]*content=")([^"]*)("[^>]*>)/gi,
    (_m, p1: string, _p2: string, p3: string) => `${p1}${safeImage}${p3}`
  );
  html = replaceMetaContent(html, 'property', 'og:image:url', page.ogImage);
  html = replaceMetaContent(html, 'property', 'og:image:secure_url', page.ogImage);
  html = replaceMetaContent(html, 'property', 'og:image:type', page.ogImageType || 'image/jpeg');
  html = replaceMetaContent(html, 'property', 'og:image:width', page.ogImageWidth || '1408');
  html = replaceMetaContent(html, 'property', 'og:image:height', page.ogImageHeight || '768');
  html = replaceMetaContent(html, 'property', 'og:image:alt', page.ogImageAlt);

  // 7. Replace Twitter / X tags
  html = replaceMetaContent(html, 'name', 'twitter:url', page.canonicalUrl);
  html = replaceMetaContent(html, 'name', 'twitter:title', page.title);
  html = replaceMetaContent(html, 'name', 'twitter:description', page.description);
  html = replaceMetaContent(html, 'name', 'twitter:image', page.ogImage);
  html = replaceMetaContent(html, 'name', 'twitter:image:alt', page.ogImageAlt);

  // 8. Replace Schema.org JSON-LD script block with page-specific structured data
  const jsonLdString = JSON.stringify(page.jsonLd, null, 2).replace(/<\/script>/gi, '<\\/script>');
  html = html.replace(
    /<script\s+type="application\/ld\+json"\s+id="schema-jsonld">[\s\S]*?<\/script>/i,
    () => `<script type="application/ld+json" id="schema-jsonld">\n${jsonLdString}\n    </script>`
  );

  return html;
}

function writePrerenderedHtml(distDir: string, relativeDir: string, html: string) {
  const targetDir = path.join(distDir, relativeDir);
  fs.mkdirSync(targetDir, { recursive: true });
  fs.writeFileSync(path.join(targetDir, 'index.html'), html, 'utf8');
}

function buildStaticViewJsonLd(cfg: StaticPageSeoConfig): Record<string, unknown> {
  const fullUrl = `${PUBLIC_SITE_ORIGIN}${cfg.path}`;
  const graph: Record<string, unknown>[] = [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'ReFirely Home',
          item: `${PUBLIC_SITE_ORIGIN}/`,
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
            applicationCategory: cfg.view === 'visa-check' ? 'TravelApplication' : 'FinanceApplication',
            operatingSystem: 'All',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
            },
          }
        : {}),
    },
  ];

  if (cfg.view === 'visa-check') {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Which countries can I visit visa-free with a valid U.S. B1/B2 or Schengen visa?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'A valid multiple-entry U.S. visa (B1/B2, H1B, F1, or Green Card) or Schengen visa unlocks visa-free, Visa on Arrival, or expedited e-Visa access to 35+ destinations—including Mexico (up to 180 days), Costa Rica, Panama, Dominican Republic, Serbia, Montenegro, Albania, Bosnia & Herzegovina, Georgia (90 days), Cyprus, UAE 14-day VoA and Philippines 14-day visa-free (for Indian citizens), Saudi Arabia VoA/e-Visa, and Türkiye e-Visa.',
          },
        },
        {
          '@type': 'Question',
          name: 'Do diplomatic and official passport holders have different visa-free countries?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. Many nations negotiate Bilateral Visa Waiver Agreements (BVWA) strictly by booklet class. For example, India’s Ministry of External Affairs separates Diplomatic-Only treaties (34 countries including Portugal, Spain, France, Germany, Italy, Japan, and Malta) from dual-class Diplomatic & Official agreements, while Türkiye’s Special (Green) passport grants Schengen visa-free access.',
          },
        },
      ],
    });
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  };
}

function main() {
  const distDir = path.resolve(process.cwd(), 'dist');
  const rootIndexPath = path.join(distDir, 'index.html');

  if (!fs.existsSync(rootIndexPath)) {
    throw new Error('dist/index.html not found. Run vite build before prerender-seo-pages.ts.');
  }

  const templateHtml = fs.readFileSync(rootIndexPath, 'utf8');
  let generatedCount = 0;

  // 1. Prerender all primary feature pages (/visa-check, /explore, /compare, /scout, /expats, /community, /meetups, /dashboard, /messages)
  const staticViews: StaticPageSeoConfig['view'][] = [
    'visa-check',
    'explore',
    'compare',
    'scout',
    'community',
    'meetups',
    'dashboard',
    'messages',
  ];

  for (const viewKey of staticViews) {
    const cfg = STATIC_PAGE_SEO[viewKey];
    const cleanDir = cfg.path.replace(/^\/+/, '');
    const pageHtml = injectPageMetadata(templateHtml, {
      outputRelativeDir: cleanDir,
      canonicalUrl: `${PUBLIC_SITE_ORIGIN}${cfg.path}`,
      title: cfg.title,
      description: cfg.description,
      keywords: cfg.keywords,
      ogImage: cfg.ogImage,
      ogImageType: cfg.ogImageType,
      ogImageWidth: cfg.ogImageWidth,
      ogImageHeight: cfg.ogImageHeight,
      ogImageAlt: cfg.ogImageAlt,
      jsonLd: buildStaticViewJsonLd(cfg),
    });
    writePrerenderedHtml(distDir, cleanDir, pageHtml);
    generatedCount++;

    // Also mirror /community -> same SEO as /expats (with canonical pointing to /expats)
    if (viewKey === 'community') {
      writePrerenderedHtml(distDir, 'community', pageHtml);
      generatedCount++;
    }
  }

  // 2. Prerender all 40 featured Visa Check corridor pages (/visa-check/<slug>) with live verdict + exact accessible countries count!
  for (const corridor of FEATURED_VISA_CORRIDORS) {
    const originPassports = getPassportTypesForCountry(corridor.originCode);
    const passportObj =
      (corridor.passportTypeId && originPassports.find(p => p.id === corridor.passportTypeId)) ||
      originPassports[0];
    const heldVisas = corridor.heldVisas || [];

    const verdict = evaluateVisaRequirement({
      originCode: corridor.originCode,
      destinationCode: corridor.destinationCode,
      passportTypeId: passportObj.id,
      purpose: 'tourism',
      heldVisas,
    });

    const accessMatrix = computeGlobalAccessMatrix(
      corridor.originCode,
      passportObj.id,
      heldVisas,
      'tourism'
    );
    const accessibleCount = accessMatrix.filter(item => item.status !== 'visa_required').length;
    const visaFreeCount = accessMatrix.filter(
      item =>
        item.status === 'freedom_of_movement' ||
        item.status === 'visa_free' ||
        item.status === 'visa_free_conditional'
    ).length;

    const heldLabels = heldVisas
      .map(id => HELD_VISA_OPTIONS.find(v => v.id === id)?.shortLabel)
      .filter((v): v is string => Boolean(v));
    const visaSuffix = heldLabels.length > 0 ? ` with ${heldLabels.join(' & ')}` : '';
    const isOrdinary = passportObj.category === 'ordinary';
    const passportSuffix = isOrdinary ? '' : ` (${passportObj.label})`;
    const canonicalUrl = `${PUBLIC_SITE_ORIGIN}/visa-check/${corridor.slug}`;

    const title = `Do ${verdict.origin.name}${passportSuffix} Passport Holders Need a Visa for ${verdict.destination.name}${visaSuffix}? | ReFirely`;
    const description = `${verdict.headline}. ${verdict.origin.name} (${passportObj.label})${visaSuffix} holders can access ${accessibleCount} countries (${visaFreeCount} visa-free). Check bilateral agreements & official ${verdict.destination.name} government links.`;
    const keywords = `${verdict.origin.name} to ${verdict.destination.name} visa, ${verdict.origin.name} ${passportObj.label} ${verdict.destination.name}, ${verdict.destination.name} visa requirements 2026${visaSuffix ? `, ${verdict.destination.name} visa free${visaSuffix}` : ''}, ReFirely visa check`;
    const ogImage = isOrdinary
      ? `${PUBLIC_SITE_ORIGIN}/assets/og/visa-check.jpg`
      : `${PUBLIC_SITE_ORIGIN}/assets/og/visa-passports.jpg`;

    const corridorJsonLd = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'ReFirely Home', item: `${PUBLIC_SITE_ORIGIN}/` },
            { '@type': 'ListItem', position: 2, name: 'Global Visa Check', item: `${PUBLIC_SITE_ORIGIN}/visa-check` },
            {
              '@type': 'ListItem',
              position: 3,
              name: `${verdict.origin.name} to ${verdict.destination.name} Visa Rules`,
              item: canonicalUrl,
            },
          ],
        },
        {
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: `Do ${verdict.origin.name} (${passportObj.label}) holders need a visa for ${verdict.destination.name}${visaSuffix}?`,
              acceptedAnswer: {
                '@type': 'Answer',
                text: `${verdict.headline}. ${verdict.verdictSummary} Holders of this profile have streamlined access to ${accessibleCount} destinations worldwide (${visaFreeCount} visa-free). Always confirm final entry rules on the official ${verdict.destination.name} immigration or embassy portal.`,
              },
            },
          ],
        },
      ],
    };

    const pageHtml = injectPageMetadata(templateHtml, {
      outputRelativeDir: `visa-check/${corridor.slug}`,
      canonicalUrl,
      title,
      description,
      keywords,
      ogImage,
      ogImageType: 'image/jpeg',
      ogImageWidth: isOrdinary ? '1408' : '1280',
      ogImageHeight: isOrdinary ? '768' : '960',
      ogImageAlt: `${verdict.origin.name} to ${verdict.destination.name} Visa Check (${passportObj.label}) – ReFirely`,
      jsonLd: corridorJsonLd,
    });
    writePrerenderedHtml(distDir, `visa-check/${corridor.slug}`, pageHtml);
    generatedCount++;
  }

  // 3. Prerender all 209 Country Dossier pages (/country/<id>)
  const seenCountryIds = new Set<string>();
  for (const country of INITIAL_COUNTRIES) {
    const id = country.id.trim();
    if (!id || seenCountryIds.has(id)) continue;
    seenCountryIds.add(id);

    const canonicalUrl = `${PUBLIC_SITE_ORIGIN}/country/${encodeURIComponent(id)}`;
    const singleBudget = country.costOfLiving.monthlyBudgetSingleUSD.toLocaleString();
    const coupleBudget = country.costOfLiving.monthlyBudgetCoupleUSD.toLocaleString();
    const visaName = country.visa.retirementVisaName;
    const nomadProfile = getCountryNomadProfile(country);
    const nomadBurn = nomadProfile.monthlyNomadBurnUSD.toLocaleString();
    const fiberMbps = nomadProfile.verifiedInternetMbps;
    const dnvName = nomadProfile.remoteWorkVisaName;
    const foodProfile = getCountryGastronomyProfile(country);

    const title = `${country.name} Retirement (FIRE) & Digital Nomad Guide: $${singleBudget}/mo Cost, Visas & Rents | ReFirely`;
    const description = `Retire or work remotely in ${country.name}: $${singleBudget}/mo solo ($${coupleBudget}/mo couple), $${nomadBurn}/mo nomad burn, ${fiberMbps} Mbps fiber, ${visaName} & ${dnvName}, healthcare ${country.lifestyle.healthcareScore}/100 & safety ${country.lifestyle.safetyScore}/100.`;
    const keywords = `retire in ${country.name}, ${country.name} retirement visa, ${visaName}, digital nomad ${country.name}, ${dnvName}, ${country.name} cost of living, ${country.name} monthly cash burn, ${country.name} internet speed Mbps, ${country.name} apartment rent, ${country.name} expat healthcare, ReFirely ${country.name}`;
    const ogImage =
      country.imageUrl && country.imageUrl.startsWith('https://')
        ? country.imageUrl
        : `${PUBLIC_SITE_ORIGIN}/assets/og/explore-havens.jpg`;

    const countryJsonLd = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'ReFirely Home', item: `${PUBLIC_SITE_ORIGIN}/` },
            { '@type': 'ListItem', position: 2, name: 'Explore 209 Havens', item: `${PUBLIC_SITE_ORIGIN}/explore` },
            { '@type': 'ListItem', position: 3, name: `${country.name} Retirement & Nomad Guide`, item: canonicalUrl },
          ],
        },
        {
          '@type': 'Place',
          name: `${country.name} Retirement (FIRE) & Digital Nomad Haven`,
          description: country.overview || country.tagline,
          url: canonicalUrl,
          image: ogImage,
          containedInPlace: {
            '@type': 'Place',
            name: country.region,
          },
          additionalProperty: [
            { '@type': 'PropertyValue', name: 'Monthly Cost of Living (Single Retiree USD)', value: country.costOfLiving.monthlyBudgetSingleUSD, unitText: 'USD/month' },
            { '@type': 'PropertyValue', name: 'Monthly Cost of Living (Retiree Couple USD)', value: country.costOfLiving.monthlyBudgetCoupleUSD, unitText: 'USD/month' },
            { '@type': 'PropertyValue', name: 'Monthly Digital Nomad Cash Burn (USD)', value: nomadProfile.monthlyNomadBurnUSD, unitText: 'USD/month' },
            { '@type': 'PropertyValue', name: 'Verified Fiber Internet Speed (Mbps)', value: fiberMbps, unitText: 'Mbps' },
            { '@type': 'PropertyValue', name: 'Primary Passive Retirement Visa Pathway', value: visaName },
            { '@type': 'PropertyValue', name: 'Digital Nomad / Remote Work Visa Pathway', value: dnvName },
            { '@type': 'PropertyValue', name: 'Healthcare Quality Score', value: `${country.lifestyle.healthcareScore}/100` },
            { '@type': 'PropertyValue', name: 'Safety Index Score', value: `${country.lifestyle.safetyScore}/100` },
            { '@type': 'PropertyValue', name: 'Drinking Tap Water Safety', value: foodProfile.costsAndHygiene.waterSafety },
          ],
        },
      ],
    };

    const hasCustomHttpsImage = Boolean(country.imageUrl && country.imageUrl.startsWith('https://'));
    const pageHtml = injectPageMetadata(templateHtml, {
      outputRelativeDir: `country/${id}`,
      canonicalUrl,
      title,
      description,
      keywords,
      ogImage,
      ogImageType: 'image/jpeg',
      ogImageWidth: hasCustomHttpsImage ? '1000' : '1408',
      ogImageHeight: hasCustomHttpsImage ? '667' : '768',
      ogImageAlt: `${country.name} Retirement (FIRE) & Digital Nomad Guide – ReFirely`,
      jsonLd: countryJsonLd,
    });
    writePrerenderedHtml(distDir, `country/${id}`, pageHtml);
    generatedCount++;
  }

  // 4. Write dist/404.html SPA fallback for GitHub Pages (preserves clean URLs for any dynamic/unlisted path)
  fs.writeFileSync(path.join(distDir, '404.html'), templateHtml, 'utf8');

  console.log(
    `Prerendered ${generatedCount} static SEO HTML pages (primary views, ${FEATURED_VISA_CORRIDORS.length} Visa Check corridors, ${seenCountryIds.size} country dossiers) + 404.html fallback.`
  );
}

main();
