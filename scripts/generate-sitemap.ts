import fs from 'fs';
import path from 'path';
import { INITIAL_COUNTRIES } from '../src/data/countries';
import { PUBLIC_SITE_ORIGIN, FEATURED_VISA_CORRIDORS } from '../src/data/seoRoutes';

const SITE_ORIGIN = PUBLIC_SITE_ORIGIN;

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

interface SitemapEntry {
  loc: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: string;
}

export function generateSitemapXml(todayDate: string): string {
  const entries: SitemapEntry[] = [
    { loc: `${SITE_ORIGIN}/`, lastmod: todayDate, changefreq: 'weekly', priority: '1.0' },
    { loc: `${SITE_ORIGIN}/visa-check`, lastmod: todayDate, changefreq: 'weekly', priority: '0.95' },
    { loc: `${SITE_ORIGIN}/fire-calculator`, lastmod: todayDate, changefreq: 'weekly', priority: '0.95' },
    { loc: `${SITE_ORIGIN}/explore`, lastmod: todayDate, changefreq: 'weekly', priority: '0.9' },
    { loc: `${SITE_ORIGIN}/compare`, lastmod: todayDate, changefreq: 'weekly', priority: '0.9' },
    { loc: `${SITE_ORIGIN}/scout`, lastmod: todayDate, changefreq: 'weekly', priority: '0.9' },
    { loc: `${SITE_ORIGIN}/expats`, lastmod: todayDate, changefreq: 'weekly', priority: '0.85' },
    { loc: `${SITE_ORIGIN}/meetups`, lastmod: todayDate, changefreq: 'weekly', priority: '0.85' },
  ];

  // Clean pre-rendered Global Visa Check corridor URLs
  for (const corridor of FEATURED_VISA_CORRIDORS) {
    entries.push({
      loc: `${SITE_ORIGIN}/visa-check/${encodeURIComponent(corridor.slug)}`,
      lastmod: todayDate,
      changefreq: 'weekly',
      priority: corridor.priority,
    });
  }

  // All 209 pre-rendered country dossier URLs
  const seenIds = new Set<string>();
  for (const country of INITIAL_COUNTRIES) {
    const id = country.id.trim();
    if (!id || seenIds.has(id)) continue;
    seenIds.add(id);

    entries.push({
      loc: `${SITE_ORIGIN}/country/${encodeURIComponent(id)}`,
      lastmod: todayDate,
      changefreq: 'monthly',
      priority: '0.8',
    });
  }

  const urlBlocks = entries
    .map(
      entry => `  <url>
    <loc>${escapeXml(entry.loc)}</loc>
    <lastmod>${escapeXml(entry.lastmod)}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlBlocks}
</urlset>
`;
}

const today = process.env.SITEMAP_DATE || new Date().toISOString().split('T')[0];
const xml = generateSitemapXml(today);

const publicSitemapPath = path.resolve(process.cwd(), 'public', 'sitemap.xml');
const rootSitemapPath = path.resolve(process.cwd(), 'sitemap.xml');

fs.writeFileSync(publicSitemapPath, xml, 'utf8');
fs.writeFileSync(rootSitemapPath, xml, 'utf8');

console.log(
  `Generated sitemap.xml with 8 primary views, ${FEATURED_VISA_CORRIDORS.length} Visa Check corridors, and ${INITIAL_COUNTRIES.length} country dossiers (lastmod: ${today}).`
);
