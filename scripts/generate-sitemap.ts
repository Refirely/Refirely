import fs from 'fs';
import path from 'path';
import { INITIAL_COUNTRIES } from '../src/data/countries';

const SITE_ORIGIN = 'https://refirely.com';

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
    {
      loc: `${SITE_ORIGIN}/`,
      lastmod: todayDate,
      changefreq: 'weekly',
      priority: '1.0',
    },
    {
      loc: `${SITE_ORIGIN}/?view=explore`,
      lastmod: todayDate,
      changefreq: 'weekly',
      priority: '0.9',
    },
    {
      loc: `${SITE_ORIGIN}/?view=scout`,
      lastmod: todayDate,
      changefreq: 'weekly',
      priority: '0.9',
    },
  ];

  // Loop through all 209 countries in the Refirely dataset
  const seenIds = new Set<string>();
  for (const country of INITIAL_COUNTRIES) {
    const id = country.id.trim();
    if (!id || seenIds.has(id)) continue;
    seenIds.add(id);

    const encodedId = encodeURIComponent(id);
    entries.push({
      loc: `${SITE_ORIGIN}/?country=${encodedId}`,
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

console.log(`Generated sitemap.xml with ${INITIAL_COUNTRIES.length} countries and 3 primary views (lastmod: ${today}).`);
