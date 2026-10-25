import React, { useState, useEffect, useCallback } from 'react';
import { Country } from '../types';
import {
  Download,
  Trash2,
  Sparkles,
  Plus,
  RotateCcw,
  Eye,
  X,
  CheckCircle2,
  Smartphone,
  RectangleVertical,
  Image as ImageIcon,
  Layers,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export type PortraitAspect = '9:16' | '4:5';

export interface SocialPromoCardSpec {
  id: string;
  category: 'Core Platform Module' | 'Feature Spotlight' | 'Country Dossier Spotlight';
  title: string;
  badge: string;
  headline: string;
  subheadline: string;
  accentTheme: 'teal-indigo' | 'indigo-violet' | 'amber-rose' | 'emerald-cyan';
  moduleTitle: string;
  moduleSubtitle: string;
  metrics: { label: string; value: string; sub: string }[];
  uiRows: { leftTitle: string; leftSub: string; rightBadge: string; rightValue: string }[];
  footerCallout: string;
  ctaText: string;
}

const DEFAULT_FEATURE_SNAPSHOTS: SocialPromoCardSpec[] = [
  {
    id: 'promo-overview-matchmaker',
    category: 'Core Platform Module',
    title: '1. AI Haven Matchmaker & 209+ Country Directory',
    badge: 'GLOBAL RETIREMENT & FIRE INTELLIGENCE',
    headline: 'Where Your Freedom Goes Further',
    subheadline:
      'Compare 209+ verified retirement destinations by monthly budget, visa rules, healthcare, taxes & safety.',
    accentTheme: 'teal-indigo',
    moduleTitle: 'Factual Global Relocation Directory',
    moduleSubtitle: 'Live Filter: Budget ≤ $2,500/mo · High Healthcare · Sunny Climate',
    metrics: [
      { label: 'Verified Havens', value: '209+', sub: '6 Continents' },
      { label: 'Couple Budgets', value: '$1,400+', sub: 'Full Lifestyle' },
      { label: 'Dossier Depth', value: '29 Pages', sub: 'PDF Export' },
    ],
    uiRows: [
      {
        leftTitle: '🇵🇹 Portugal (D7 Passive Income)',
        leftSub: 'Cascais · Lagos · Porto · Safety 92/100',
        rightBadge: 'Healthcare 89/100',
        rightValue: '$2,150/mo',
      },
      {
        leftTitle: '🇹🇭 Thailand (O-A / LTR Retirement)',
        leftSub: 'Chiang Mai · Hua Hin · Phuket',
        rightBadge: 'Healthcare 86/100',
        rightValue: '$1,450/mo',
      },
      {
        leftTitle: '🇨🇷 Costa Rica (Pensionado Visa)',
        leftSub: 'Atenas · Escazú · Tamarindo · Territorial Tax',
        rightBadge: 'Min Income $1,000',
        rightValue: '$1,950/mo',
      },
      {
        leftTitle: '🇪🇸 Spain (Non-Lucrative Visa)',
        leftSub: 'Alicante · Málaga · Valencia · 300+ Sunny Days',
        rightBadge: 'Healthcare 93/100',
        rightValue: '$2,350/mo',
      },
    ],
    footerCallout: '100% Free Interactive Country Dossiers, Maps & Calculators',
    ctaText: 'Explore All 209+ Havens at ReFIREly.com',
  },
  {
    id: 'promo-fire-budget-calculator',
    category: 'Core Platform Module',
    title: '2. Global FIRE & Annual Retirement Budget Calculator',
    badge: 'GEOGRAPHIC ARBITRAGE & FIRE SIMULATOR',
    headline: 'Retire 5 to 10 Years Earlier Abroad',
    subheadline:
      'Model your exact single or couple lifestyle budget across housing, healthcare, dining, utilities & taxes.',
    accentTheme: 'emerald-cyan',
    moduleTitle: 'Interactive Annual Retirement Budget Studio',
    moduleSubtitle: 'Couple Lifestyle Simulation · City Center vs. Coastal Suburb',
    metrics: [
      { label: 'US/UK Avg Spend', value: '$5,600/mo', sub: '$67,200 / yr' },
      { label: 'Haven Avg Spend', value: '$2,150/mo', sub: '$25,800 / yr' },
      { label: 'Annual Saved', value: '+$41,400/yr', sub: '61% Lower Cost' },
    ],
    uiRows: [
      {
        leftTitle: '🏡 1-Bedroom Modern Apartment Lease',
        leftSub: 'Prime Expat Neighborhood vs. Outside Center',
        rightBadge: 'Housing',
        rightValue: '$650 – $950/mo',
      },
      {
        leftTitle: '🩺 Private Expat Health Insurance & Care',
        leftSub: 'JCI-Accredited Private Hospitals + Dental',
        rightBadge: 'Healthcare',
        rightValue: '$140 – $260/mo',
      },
      {
        leftTitle: '🍽️ Fresh Groceries, Cafés & Dining Out',
        leftSub: 'Mediterranean / Tropical Markets & Bistros',
        rightBadge: 'Food & Dining',
        rightValue: '$480 – $650/mo',
      },
      {
        leftTitle: '⚡ High-Speed Fiber, Utilities & Transit',
        leftSub: 'Electricity, Cooling, Mobile & Local Mobility',
        rightBadge: 'Utilities',
        rightValue: '$120 – $190/mo',
      },
    ],
    footerCallout: 'Stretch a $450k–$750k Portfolio Into a Luxury Overseas Retirement',
    ctaText: 'Calculate Your Custom Budget at ReFIREly.com',
  },
  {
    id: 'promo-3d-world-atlas',
    category: 'Feature Spotlight',
    title: '3. Interactive 3D Satellite World Haven Atlas',
    badge: 'INTERACTIVE 3D GOOGLE EARTH GLOBE',
    headline: 'Spin, Zoom & Scout Every Retirement Haven on Earth',
    subheadline:
      'Inspect 209+ countries by continent, climate zone, monthly cost & visa threshold on a live 3D globe.',
    accentTheme: 'indigo-violet',
    moduleTitle: '3D Satellite Earth & Continent Explorer',
    moduleSubtitle: 'Color-Coded Cost Markers · Instant Country Preview Drawer',
    metrics: [
      { label: 'Under $1,600/mo', value: 'Emerald Pins', sub: 'Ultra-Value Havens' },
      { label: '$1,600–$2,400/mo', value: 'Amber Pins', sub: 'Balanced Comfort' },
      { label: '$2,400+/mo', value: 'Rose Pins', sub: 'Premier Luxury' },
    ],
    uiRows: [
      {
        leftTitle: '🌍 Europe & Mediterranean Havens (47)',
        leftSub: 'Portugal · Spain · Greece · Italy · Malta · Cyprus · Albania',
        rightBadge: 'High Safety',
        rightValue: '$1,450 – $3,200',
      },
      {
        leftTitle: '🌴 Southeast & East Asia Havens (26)',
        leftSub: 'Thailand · Malaysia · Vietnam · Philippines · Japan · Taiwan',
        rightBadge: 'Best Value',
        rightValue: '$1,100 – $2,600',
      },
      {
        leftTitle: '🏖️ Latin America & Caribbean (48)',
        leftSub: 'Costa Rica · Panama · Mexico · Uruguay · Colombia · Belize',
        rightBadge: 'Territorial Tax',
        rightValue: '$1,350 – $2,800',
      },
      {
        leftTitle: '☀️ Island & Coastal Sanctuaries (88)',
        leftSub: 'Mauritius · Seychelles · Fiji · Canary Islands · Madeira',
        rightBadge: 'Year-Round Sun',
        rightValue: '$1,500 – $3,400',
      },
    ],
    footerCallout: 'Filter Instantly by Continent, Budget, Healthcare & Climate',
    ctaText: 'Launch the 3D Haven Atlas at ReFIREly.com',
  },
  {
    id: 'promo-finances-banking-taxes',
    category: 'Core Platform Module',
    title: '4. Expat Banking, Remittances & Tax Optimization Module',
    badge: 'FINANCES, BANKING & EXPAT TAX GUIDE',
    headline: 'Stop Losing 4% on Transfers & Avoid Double Taxation',
    subheadline:
      'Every Country Dossier breaks down National & Private Banks, FX transfer fees, 183-day rules & pension taxes.',
    accentTheme: 'amber-rose',
    moduleTitle: 'Finances, Banking & Expat Tax Intelligence',
    moduleSubtitle: '4-Pillar Financial Playbook for Expats & Retirees',
    metrics: [
      { label: 'Principals/Savings', value: '0% Tax', sub: 'Capital Remittance' },
      { label: 'FX Wire Savings', value: '$1,450+/yr', sub: 'Fintech vs. SWIFT' },
      { label: 'Tax Treaties', value: 'DTA Matrix', sub: '183-Day Rules' },
    ],
    uiRows: [
      {
        leftTitle: '🏦 Nationalized & Top Private Expat Banks',
        leftSub: 'State-Backed & Commercial Banks · Deposit Insurance Limits',
        rightBadge: 'Pillar 1',
        rightValue: 'Local Tax ID Guide',
      },
      {
        leftTitle: '💱 Interactive Monthly Remittance Simulator',
        leftSub: 'Compare Wise / Revolut / Schwab ATM vs. Retail Bank SWIFT',
        rightBadge: 'Pillar 2',
        rightValue: '0.35% vs 4.2% FX',
      },
      {
        leftTitle: '⚖️ Inbound Funds & Foreign Pension Taxes',
        leftSub: 'Territorial 0% Havens · Remittance Basis · Social Security',
        rightBadge: 'Pillar 3',
        rightValue: 'Treaty Verdicts',
      },
      {
        leftTitle: '🐷 6 Actionable Fee & Tax Saving Strategies',
        leftSub: 'Decline ATM DCC · Batch Pensions · Pre-Residency Capital Timing',
        rightBadge: 'Pillar 4',
        rightValue: 'Save $2k–$5k/yr',
      },
    ],
    footerCallout: 'Know Your Exact Tax & Banking Rules Before Moving Abroad',
    ctaText: 'Read Country Tax & Bank Guides at ReFIREly.com',
  },
  {
    id: 'promo-healthcare-insurance',
    category: 'Core Platform Module',
    title: '5. Healthcare Access, Emergency & Expat Insurance Guide',
    badge: 'HEALTHCARE & MEDICAL INFRASTRUCTURE',
    headline: 'World-Class Hospital Care at a Fraction of US Costs',
    subheadline:
      'Compare JCI-accredited private hospitals, public healthcare buy-in rules, emergency numbers & insurance tiers.',
    accentTheme: 'teal-indigo',
    moduleTitle: '3-Pillar Healthcare & Insurance Dossier',
    moduleSubtitle: 'Routine Specialists · Emergency Trauma · Visa Health Insurance',
    metrics: [
      { label: 'Specialist Visit', value: '$35 – $65', sub: 'Private English MD' },
      { label: 'Private Policy', value: '$110 – $240', sub: 'Monthly Age 55–65' },
      { label: 'Consular Compliance', value: '100% Verified', sub: 'Zero-Deductible Rules' },
    ],
    uiRows: [
      {
        leftTitle: '🏥 Public vs. Private Hospital Networks',
        leftSub: 'English-Speaking Doctors · Waiting Times · Pharmacy Rules',
        rightBadge: 'Routine Care',
        rightValue: 'Scores up to 95/100',
      },
      {
        leftTitle: '🚑 Emergency Response & Medevac Readiness',
        leftSub: 'Direct ER Hotlines · ICU Standards · Regional Air Ambulance',
        rightBadge: 'Emergency',
        rightValue: '24/7 Protocols',
      },
      {
        leftTitle: '🛡️ Expat Health Insurance Age-Band Matrix',
        leftSub: 'Local Private Plans vs. International Cigna / Allianz / Bupa',
        rightBadge: 'Visa Compliant',
        rightValue: 'Age 55–74 Rates',
      },
      {
        leftTitle: '✈️ Scouting & Transitional Nomad Coverage',
        leftSub: 'Flexible Month-to-Month Coverage During Exploratory Visits',
        rightBadge: 'Bridge Option',
        rightValue: '180+ Countries',
      },
    ],
    footerCallout: 'Never Guess About Medical Care or Visa Insurance Requirements',
    ctaText: 'Compare Healthcare Rankings at ReFIREly.com',
  },
  {
    id: 'promo-compare-studio',
    category: 'Feature Spotlight',
    title: '6. Side-by-Side Country Comparison Studio',
    badge: 'MULTI-COUNTRY COMPARISON ENGINE',
    headline: 'Compare Top Retirement Havens Side-by-Side',
    subheadline:
      'Benchmark up to 3 countries simultaneously across 25+ empirical financial, visa, healthcare & lifestyle metrics.',
    accentTheme: 'indigo-violet',
    moduleTitle: 'Side-by-Side Comparison Matrix',
    moduleSubtitle: 'Portugal vs. Spain vs. Thailand · Direct Metric Benchmarking',
    metrics: [
      { label: 'Comparison Axes', value: '25+ Metrics', sub: 'Empirical Data' },
      { label: 'Radar Telemetry', value: '6-Axis Chart', sub: 'Vs. Global Avg' },
      { label: 'PDF Export', value: '29+ Pages', sub: 'Full Dossier' },
    ],
    uiRows: [
      {
        leftTitle: '💵 Monthly Budget (Single vs. Couple)',
        leftSub: 'Rent · Groceries · Utilities · Healthcare Breakdown',
        rightBadge: 'Cost of Living',
        rightValue: 'Real-Time Delta',
      },
      {
        leftTitle: '🛂 Retirement Visa Minimum Income & PR Path',
        leftSub: 'Passive Income Threshold · Processing Months · Citizenship',
        rightBadge: 'Visas & Rules',
        rightValue: 'Consular Specs',
      },
      {
        leftTitle: '☀️ Annual Sunshine, Temp & Humidity',
        leftSub: 'Sunny Days/Year · Peak Weather Months · Rainy Season',
        rightBadge: 'Climate',
        rightValue: 'Seasonal Fit',
      },
      {
        leftTitle: '🛡️ Safety, Healthcare & English Proficiency',
        leftSub: 'Global Peace Index · Hospital Quality · Expat Community Size',
        rightBadge: 'Quality of Life',
        rightValue: '0–100 Scores',
      },
    ],
    footerCallout: 'Make Data-Driven Relocation Decisions in Minutes',
    ctaText: 'Compare Your Shortlist at ReFIREly.com',
  },
  {
    id: 'promo-lifestyle-dating-community',
    category: 'Feature Spotlight',
    title: '7. Expat Cities, Lifestyle, Dating & Scam Protection',
    badge: 'CULTURE, DATING & EXPAT COMMUNITY',
    headline: 'Real Cultural Insights, Top Towns & Scam Protection',
    subheadline:
      'Discover the best expat towns, local dating expectations, cultural Dos & Don’ts, and verified expat meetups.',
    accentTheme: 'amber-rose',
    moduleTitle: 'Lifestyle, Dating & Expat Community Hub',
    moduleSubtitle: 'Regional Micro-Markets · Cultural Calibration · Peer Mentors',
    metrics: [
      { label: 'Expat Towns', value: '600+ Hubs', sub: 'Cost & Vibe' },
      { label: 'Dating & Culture', value: 'Normal vs Red Flag', sub: 'Scam Safeguards' },
      { label: 'Peer Network', value: 'Live Meetups', sub: 'Ask a Local DM' },
    ],
    uiRows: [
      {
        leftTitle: '📍 Premier Expat Cities & Coastal Towns',
        leftSub: 'Monthly Cost Benchmarks · Local Vibe · Direct Resident Chat',
        rightBadge: 'Top Towns',
        rightValue: '3 Hubs / Country',
      },
      {
        leftTitle: '❤️ Dating Style & Partner Expectations',
        leftSub: 'Courtship Pace · Bill Etiquette · Age-Gap Reception',
        rightBadge: 'Dating Guide',
        rightValue: 'Cultural Norms',
      },
      {
        leftTitle: '✅ What Is Normal vs. NOT Normal (Red Flags)',
        leftSub: 'Cultural Calibration Matrix · Dos & Don’ts · Asset Protection',
        rightBadge: 'Safety Shield',
        rightValue: 'Avoid Scams',
      },
      {
        leftTitle: '🤝 Connect with Verified Expats & Meetups',
        leftSub: '1-on-1 Peer Mentorship · Local Coffee Meetups · Q&A Boards',
        rightBadge: 'Community',
        rightValue: 'Free RSVP',
      },
    ],
    footerCallout: 'Arrive Informed, Connected & Protected in Your New Home',
    ctaText: 'Join the Expat Community at ReFIREly.com',
  },
];

function buildCountryPromoCardSpec(country: Country): SocialPromoCardSpec {
  const city1 = country.topCities[0];
  const city2 = country.topCities[1];
  return {
    id: `promo-country-${country.id}-${Date.now()}`,
    category: 'Country Dossier Spotlight',
    title: `${country.flag} ${country.name} — Retirement & Expat Haven Dossier`,
    badge: `${country.region.toUpperCase()} · VERIFIED HAVEN DOSSIER`,
    headline: `Retire in ${country.name}: Freedom & Quality of Life`,
    subheadline: country.tagline,
    accentTheme: 'teal-indigo',
    moduleTitle: `${country.flag} ${country.name} Executive Snapshot`,
    moduleSubtitle: `Capital: ${country.capital} · Currency: ${country.currency} · English: ${country.lifestyle.englishProficiency}`,
    metrics: [
      {
        label: 'Single Budget',
        value: `$${country.costOfLiving.monthlyBudgetSingleUSD.toLocaleString()}/mo`,
        sub: `Couple $${country.costOfLiving.monthlyBudgetCoupleUSD.toLocaleString()}/mo`,
      },
      {
        label: 'Healthcare Score',
        value: `${country.lifestyle.healthcareScore}/100`,
        sub: `Safety ${country.lifestyle.safetyScore}/100`,
      },
      {
        label: 'Annual Sunshine',
        value: `${country.climate.annualSunnyDays} days`,
        sub: `${country.climate.averageTempC}°C Avg Temp`,
      },
    ],
    uiRows: [
      {
        leftTitle: `🛂 ${country.visa.retirementVisaName}`,
        leftSub: `Processing ~${country.visa.processingMonths} mos · ${country.visa.pathwayToPR.slice(0, 52)}...`,
        rightBadge: 'Min Income',
        rightValue: `$${country.visa.minimumIncomeUSD.toLocaleString()}/mo`,
      },
      {
        leftTitle: `🏡 1-Bed Apartment & Monthly Utilities`,
        leftSub: `City Center $${country.costOfLiving.rent1BedCenterUSD}/mo · Outside $${country.costOfLiving.rent1BedOutsideUSD}/mo`,
        rightBadge: 'Housing',
        rightValue: `$${country.costOfLiving.rent1BedOutsideUSD}–$${country.costOfLiving.rent1BedCenterUSD}`,
      },
      {
        leftTitle: `📍 Top Hub: ${city1?.name || country.capital}`,
        leftSub: `${city1?.vibe || 'Premier expat destination'} — ${city1?.highlight?.slice(0, 48) || ''}`,
        rightBadge: 'Expat Hub #1',
        rightValue: `~$${city1?.monthlyCostUSD || country.costOfLiving.monthlyBudgetSingleUSD}/mo`,
      },
      {
        leftTitle: `📍 Top Hub: ${city2?.name || country.capital}`,
        leftSub: `${city2?.vibe || 'Popular coastal & cultural hub'} — ${city2?.highlight?.slice(0, 48) || ''}`,
        rightBadge: 'Expat Hub #2',
        rightValue: `~$${city2?.monthlyCostUSD || country.costOfLiving.monthlyBudgetSingleUSD}/mo`,
      },
    ],
    footerCallout: `Download the Full 29-Page ${country.name} Relocation PDF Dossier`,
    ctaText: `Explore ${country.name} at ReFIREly.com`,
  };
}

// Helper to draw rounded rectangles on Canvas
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

// Helper to wrap text on Canvas
function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = 3
): number {
  const words = text.split(' ');
  let line = '';
  let currentY = y;
  let linesDrawn = 0;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      linesDrawn++;
      if (linesDrawn >= maxLines) {
        ctx.fillText(line.trim() + '...', x, currentY);
        return currentY + lineHeight;
      }
      ctx.fillText(line.trim(), x, currentY);
      line = words[n] + ' ';
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line.trim()) {
    ctx.fillText(line.trim(), x, currentY);
    currentY += lineHeight;
  }
  return currentY;
}

let cachedIconImage: HTMLImageElement | null = null;
function loadEmblemIcon(): Promise<HTMLImageElement | null> {
  if (cachedIconImage && cachedIconImage.complete) {
    return Promise.resolve(cachedIconImage);
  }
  return new Promise(resolve => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      cachedIconImage = img;
      resolve(img);
    };
    img.onerror = () => resolve(null);
    img.src = '/assets/aistudio/refirely-icon.png';
  });
}

/**
 * Renders a high-resolution Portrait Social Media Promotional Snapshot (1080x1920 or 1080x1350)
 * containing the authentic ReFIREly emblem, ReFIREly.com branding, and UI module snapshot.
 */
async function renderPortraitPromoToDataUrl(
  spec: SocialPromoCardSpec,
  aspect: PortraitAspect
): Promise<string> {
  const width = 1080;
  const height = aspect === '9:16' ? 1920 : 1350;
  const isStory = aspect === '9:16';

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const iconImg = await loadEmblemIcon();

  // 1. Rich Multi-Colored Luminous Background
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#0f172a');
  bgGrad.addColorStop(0.45, '#1e1b4b');
  bgGrad.addColorStop(1, '#042f2e');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Ambient Luminous Glow Orbs
  const orb1 = ctx.createRadialGradient(200, 220, 20, 200, 220, 480);
  orb1.addColorStop(0, 'rgba(20, 184, 166, 0.28)');
  orb1.addColorStop(1, 'rgba(20, 184, 166, 0)');
  ctx.fillStyle = orb1;
  ctx.fillRect(0, 0, width, height);

  const orb2 = ctx.createRadialGradient(880, height - 300, 20, 880, height - 300, 520);
  orb2.addColorStop(0, 'rgba(245, 158, 11, 0.24)');
  orb2.addColorStop(1, 'rgba(245, 158, 11, 0)');
  ctx.fillStyle = orb2;
  ctx.fillRect(0, 0, width, height);

  // Top Multi-Color Signature Ribbon
  const ribbonGrad = ctx.createLinearGradient(0, 0, width, 0);
  ribbonGrad.addColorStop(0, '#14b8a6');
  ribbonGrad.addColorStop(0.5, '#6366f1');
  ribbonGrad.addColorStop(1, '#f59e0b');
  ctx.fillStyle = ribbonGrad;
  ctx.fillRect(0, 0, width, 14);

  const padX = 68;
  let curY = isStory ? 86 : 54;

  // 2. Top Brand Header Bar (Authentic Favicon Emblem + ReFIREly.com + URL Pill)
  // Squircle Emblem Box
  const boxSize = isStory ? 96 : 82;
  roundRect(ctx, padX, curY, boxSize, boxSize, 24);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = ribbonGrad;
  ctx.stroke();

  if (iconImg) {
    ctx.drawImage(iconImg, padX + 8, curY + 8, boxSize - 16, boxSize - 16);
  }

  // Wordmark: ReFIREly.com
  const wordX = padX + boxSize + 22;
  const wordY = curY + (isStory ? 54 : 46);
  ctx.font = `900 ${isStory ? '48px' : '42px'} Inter, system-ui, sans-serif`;
  ctx.fillStyle = '#ffffff';
  ctx.fillText('Re', wordX, wordY);
  const reW = ctx.measureText('Re').width;

  const fireGrad = ctx.createLinearGradient(wordX + reW, wordY - 36, wordX + reW + 115, wordY);
  fireGrad.addColorStop(0, '#fb7185');
  fireGrad.addColorStop(0.5, '#f97316');
  fireGrad.addColorStop(1, '#fbbf24');
  ctx.fillStyle = fireGrad;
  ctx.fillText('FIRE', wordX + reW, wordY);
  const fireW = ctx.measureText('FIRE').width;

  ctx.fillStyle = '#2dd4bf';
  ctx.fillText('ly', wordX + reW + fireW, wordY);
  const lyW = ctx.measureText('ly').width;

  ctx.font = `800 ${isStory ? '26px' : '22px'} Inter, system-ui, sans-serif`;
  ctx.fillStyle = '#cbd5e1';
  ctx.fillText('.com', wordX + reW + fireW + lyW + 3, wordY);

  // Tagline under wordmark
  ctx.font = `700 ${isStory ? '17px' : '15px'} Inter, system-ui, sans-serif`;
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('WHERE YOUR FREEDOM GOES FURTHER', wordX, wordY + (isStory ? 28 : 24));

  // Right Top Website Pill
  const pillW = 240;
  const pillH = 46;
  roundRect(ctx, width - padX - pillW, curY + 18, pillW, pillH, 23);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = 'rgba(45, 212, 191, 0.5)';
  ctx.stroke();

  ctx.font = '800 18px Inter, system-ui, sans-serif';
  ctx.fillStyle = '#5eead4';
  ctx.textAlign = 'center';
  ctx.fillText('🌐 refirely.com', width - padX - pillW / 2, curY + 47);
  ctx.textAlign = 'left';

  curY += boxSize + (isStory ? 54 : 32);

  // 3. Category Badge Pill
  ctx.font = '800 18px Inter, system-ui, sans-serif';
  const badgeTextW = ctx.measureText(spec.badge).width + 44;
  roundRect(ctx, padX, curY, badgeTextW, 42, 21);
  ctx.fillStyle = 'rgba(99, 102, 241, 0.25)';
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = 'rgba(129, 140, 248, 0.6)';
  ctx.stroke();

  ctx.fillStyle = '#fde68a';
  ctx.fillText(spec.badge, padX + 22, curY + 27);

  curY += isStory ? 84 : 66;

  // 4. Main Promotional Headline & Subheadline
  ctx.font = `900 ${isStory ? '54px' : '44px'} Inter, system-ui, sans-serif`;
  ctx.fillStyle = '#ffffff';
  curY = drawWrappedText(
    ctx,
    spec.headline,
    padX,
    curY,
    width - padX * 2,
    isStory ? 64 : 52,
    2
  );

  curY += isStory ? 12 : 6;
  ctx.font = `500 ${isStory ? '25px' : '21px'} Inter, system-ui, sans-serif`;
  ctx.fillStyle = '#cbd5e1';
  curY = drawWrappedText(
    ctx,
    spec.subheadline,
    padX,
    curY,
    width - padX * 2,
    isStory ? 36 : 30,
    2
  );

  curY += isStory ? 34 : 20;

  // 5. Realistic Website UI Module Snapshot Card (White/Luminous App Window)
  const cardX = padX;
  const cardW = width - padX * 2;
  const cardH = isStory ? 1050 : 730;

  // Outer Window Shadow
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 18;
  roundRect(ctx, cardX, curY, cardW, cardH, 34);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.restore();

  // Top Gradient Bar on UI Card
  ctx.save();
  roundRect(ctx, cardX, curY, cardW, cardH, 34);
  ctx.clip();
  ctx.fillStyle = ribbonGrad;
  ctx.fillRect(cardX, curY, cardW, 12);

  // Browser / Module Top Bar inside UI Card
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(cardX, curY + 12, cardW, isStory ? 96 : 78);

  // Traffic Light Dots
  const dotY = curY + (isStory ? 42 : 34);
  ['#f43f5e', '#f59e0b', '#10b981'].forEach((col, i) => {
    ctx.beginPath();
    ctx.arc(cardX + 34 + i * 22, dotY, 6.5, 0, Math.PI * 2);
    ctx.fillStyle = col;
    ctx.fill();
  });

  // Module Header Title & Subtitle
  ctx.font = `800 ${isStory ? '26px' : '22px'} Inter, system-ui, sans-serif`;
  ctx.fillStyle = '#0f172a';
  ctx.fillText(spec.moduleTitle, cardX + 115, curY + (isStory ? 49 : 41));

  ctx.font = `600 ${isStory ? '18px' : '15px'} Inter, system-ui, sans-serif`;
  ctx.fillStyle = '#4f46e5';
  ctx.fillText(spec.moduleSubtitle, cardX + 34, curY + (isStory ? 86 : 68));

  let innerY = curY + (isStory ? 132 : 104);

  // 3 KPI Metric Boxes inside UI Snapshot
  const kpiGap = 20;
  const kpiW = (cardW - 68 - kpiGap * 2) / 3;
  const kpiH = isStory ? 142 : 106;
  const kpiColors = [
    { bg: '#f0fdfa', border: '#99f6e4', label: '#0f766e', val: '#134e4a' },
    { bg: '#eef2ff', border: '#c7d2fe', label: '#4338ca', val: '#1e1b4b' },
    { bg: '#fffbeb', border: '#fde68a', label: '#b45309', val: '#78350f' },
  ];

  spec.metrics.forEach((m, idx) => {
    const kx = cardX + 34 + idx * (kpiW + kpiGap);
    const theme = kpiColors[idx % kpiColors.length];
    roundRect(ctx, kx, innerY, kpiW, kpiH, 20);
    ctx.fillStyle = theme.bg;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = theme.border;
    ctx.stroke();

    ctx.font = `800 ${isStory ? '15px' : '13px'} Inter, system-ui, sans-serif`;
    ctx.fillStyle = theme.label;
    ctx.fillText(m.label.toUpperCase(), kx + 20, innerY + (isStory ? 34 : 26));

    ctx.font = `900 ${isStory ? '32px' : '25px'} Inter, system-ui, sans-serif`;
    ctx.fillStyle = theme.val;
    ctx.fillText(m.value, kx + 20, innerY + (isStory ? 80 : 60));

    ctx.font = `600 ${isStory ? '16px' : '13px'} Inter, system-ui, sans-serif`;
    ctx.fillStyle = '#64748b';
    ctx.fillText(m.sub, kx + 20, innerY + (isStory ? 114 : 86));
  });

  innerY += kpiH + (isStory ? 32 : 20);

  // 4 Structured Feature/Data Rows inside UI Snapshot
  const rowH = isStory ? 156 : 104;
  const rowGap = isStory ? 20 : 12;

  spec.uiRows.forEach((row, idx) => {
    const ry = innerY + idx * (rowH + rowGap);
    roundRect(ctx, cardX + 34, ry, cardW - 68, rowH, 20);
    ctx.fillStyle = idx % 2 === 0 ? '#f8fafc' : '#f0fdfa';
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = idx % 2 === 0 ? '#e2e8f0' : '#ccfbf1';
    ctx.stroke();

    // Left Accent Bar
    roundRect(ctx, cardX + 34, ry, 8, rowH, 4);
    ctx.fillStyle = idx % 2 === 0 ? '#6366f1' : '#14b8a6';
    ctx.fill();

    // Left Title & Subtitle
    ctx.font = `800 ${isStory ? '24px' : '19px'} Inter, system-ui, sans-serif`;
    ctx.fillStyle = '#0f172a';
    ctx.fillText(row.leftTitle, cardX + 62, ry + (isStory ? 56 : 40));

    ctx.font = `500 ${isStory ? '19px' : '15px'} Inter, system-ui, sans-serif`;
    ctx.fillStyle = '#475569';
    ctx.fillText(row.leftSub, cardX + 62, ry + (isStory ? 104 : 74));

    // Right Badge & Value
    ctx.textAlign = 'right';
    ctx.font = `800 ${isStory ? '16px' : '13px'} Inter, system-ui, sans-serif`;
    ctx.fillStyle = '#0d9488';
    ctx.fillText(row.rightBadge.toUpperCase(), cardX + cardW - 58, ry + (isStory ? 52 : 38));

    ctx.font = `900 ${isStory ? '26px' : '20px'} Inter, system-ui, sans-serif`;
    ctx.fillStyle = '#1e1b4b';
    ctx.fillText(row.rightValue, cardX + cardW - 58, ry + (isStory ? 104 : 74));
    ctx.textAlign = 'left';
  });

  // Bottom strip inside UI card
  const stripY = curY + cardH - (isStory ? 74 : 54);
  ctx.fillStyle = '#eef2ff';
  ctx.fillRect(cardX, stripY, cardW, isStory ? 74 : 54);
  ctx.font = `800 ${isStory ? '20px' : '16px'} Inter, system-ui, sans-serif`;
  ctx.fillStyle = '#312e81';
  ctx.textAlign = 'center';
  ctx.fillText(`✨ ${spec.footerCallout}`, width / 2, stripY + (isStory ? 44 : 33));
  ctx.textAlign = 'left';
  ctx.restore();

  // 6. Bottom Promotional Call-To-Action Button Banner
  const ctaY = curY + cardH + (isStory ? 44 : 24);
  const ctaH = isStory ? 88 : 66;
  roundRect(ctx, padX, ctaY, cardW, ctaH, ctaH / 2);
  ctx.fillStyle = ribbonGrad;
  ctx.fill();

  ctx.font = `900 ${isStory ? '28px' : '22px'} Inter, system-ui, sans-serif`;
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.fillText(`${spec.ctaText}  →`, width / 2, ctaY + (isStory ? 54 : 41));
  ctx.textAlign = 'left';

  return canvas.toDataURL('image/png', 1.0);
}

const DISCARDED_STORAGE_KEY = 'refirely_admin_discarded_snapshots_v1';
const CUSTOM_COUNTRY_STORAGE_KEY = 'refirely_admin_custom_country_snapshots_v1';

interface AdminSocialPromoStudioProps {
  countries: Country[];
}

export const AdminSocialPromoStudio: React.FC<AdminSocialPromoStudioProps> = ({ countries }) => {
  const [aspect, setAspect] = useState<PortraitAspect>('9:16');
  const [discardedIds, setDiscardedIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(DISCARDED_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [customSpecs, setCustomSpecs] = useState<SocialPromoCardSpec[]>(() => {
    try {
      const raw = localStorage.getItem(CUSTOM_COUNTRY_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [selectedCountryId, setSelectedCountryId] = useState<string>(
    countries[0]?.id || 'portugal'
  );
  const [renderedUrls, setRenderedUrls] = useState<Record<string, string>>({});
  const [isRendering, setIsRendering] = useState(false);
  const [previewSpec, setPreviewSpec] = useState<SocialPromoCardSpec | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeSpecs = [
    ...customSpecs,
    ...DEFAULT_FEATURE_SNAPSHOTS.filter(s => !discardedIds.includes(s.id)),
  ];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const renderAllVisible = useCallback(async () => {
    setIsRendering(true);
    const nextMap: Record<string, string> = {};
    for (const spec of activeSpecs) {
      const key = `${spec.id}_${aspect}`;
      const dataUrl = await renderPortraitPromoToDataUrl(spec, aspect);
      nextMap[key] = dataUrl;
    }
    setRenderedUrls(nextMap);
    setIsRendering(false);
  }, [activeSpecs.length, aspect, discardedIds.length, customSpecs.length]);

  useEffect(() => {
    renderAllVisible();
  }, [renderAllVisible]);

  const handleDiscardCard = (spec: SocialPromoCardSpec) => {
    if (spec.id.startsWith('promo-country-')) {
      const nextCustom = customSpecs.filter(c => c.id !== spec.id);
      setCustomSpecs(nextCustom);
      try {
        localStorage.setItem(CUSTOM_COUNTRY_STORAGE_KEY, JSON.stringify(nextCustom));
      } catch {
        // ignore storage quota errors
      }
    } else {
      const nextDiscarded = [...discardedIds, spec.id];
      setDiscardedIds(nextDiscarded);
      try {
        localStorage.setItem(DISCARDED_STORAGE_KEY, JSON.stringify(nextDiscarded));
      } catch {
        // ignore
      }
    }
    if (previewSpec?.id === spec.id) {
      setPreviewSpec(null);
    }
    showToast(`Discarded "${spec.title}" from your promotional gallery.`);
  };

  const handleRestoreDefaults = () => {
    setDiscardedIds([]);
    try {
      localStorage.removeItem(DISCARDED_STORAGE_KEY);
    } catch {
      // ignore
    }
    showToast('Restored all default website module snapshots.');
  };

  const handleGenerateCountrySnapshot = async () => {
    const target = countries.find(c => c.id === selectedCountryId);
    if (!target) return;
    const newSpec = buildCountryPromoCardSpec(target);
    const nextCustom = [newSpec, ...customSpecs];
    setCustomSpecs(nextCustom);
    try {
      localStorage.setItem(CUSTOM_COUNTRY_STORAGE_KEY, JSON.stringify(nextCustom));
    } catch {
      // ignore
    }
    const key = `${newSpec.id}_${aspect}`;
    const url = await renderPortraitPromoToDataUrl(newSpec, aspect);
    setRenderedUrls(prev => ({ ...prev, [key]: url }));
    showToast(`Generated Portrait Social Snapshot for ${target.name}!`);
  };

  const handleDownloadSnapshot = async (spec: SocialPromoCardSpec) => {
    const key = `${spec.id}_${aspect}`;
    let dataUrl = renderedUrls[key];
    if (!dataUrl) {
      dataUrl = await renderPortraitPromoToDataUrl(spec, aspect);
    }
    const link = document.createElement('a');
    const cleanName = spec.title
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase();
    link.download = `refirely-portrait-${aspect.replace(':', 'x')}-${cleanName}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Downloaded HD Portrait PNG (${aspect === '9:16' ? '1080×1920' : '1080×1350'})!`);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls Card */}
      <div className="relative overflow-hidden bg-white rounded-3xl border border-indigo-200/80 p-6 sm:p-8 shadow-sm">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-400 via-indigo-500 to-amber-500" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-indigo-50 text-indigo-900 border border-indigo-200">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                Admin-Only Social Promotion Studio
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-teal-50 text-teal-900 border border-teal-200">
                <ImageIcon className="w-3.5 h-3.5 text-teal-600" />
                {activeSpecs.length} Active Snapshots Ready
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-slate-900 via-indigo-950 to-teal-900 bg-clip-text text-transparent">
              Portrait Website &amp; Feature Snapshots for Social Media
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              Download high-resolution portrait promotional snapshots featuring the authentic{' '}
              <strong>ReFIREly.com</strong> logo, website URL, and top platform modules for Instagram Stories/Reels, WhatsApp Status, Facebook, and LinkedIn. Discard any image you don’t want with one click.
            </p>
          </div>

          {/* Aspect Ratio Switcher (9:16 Story vs 4:5 Portrait Feed) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            <div className="inline-flex rounded-2xl bg-slate-100 p-1 border border-slate-200">
              <button
                onClick={() => setAspect('9:16')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  aspect === '9:16'
                    ? 'bg-gradient-to-r from-teal-600 to-indigo-600 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>9:16 Story / Status (1080×1920)</span>
              </button>
              <button
                onClick={() => setAspect('4:5')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  aspect === '4:5'
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                <RectangleVertical className="w-3.5 h-3.5" />
                <span>4:5 Feed Portrait (1080×1350)</span>
              </button>
            </div>

            {discardedIds.length > 0 && (
              <button
                onClick={handleRestoreDefaults}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition-colors cursor-pointer"
                title="Restore discarded default snapshots"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restore Discarded ({discardedIds.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Custom Country Dossier Portrait Snapshot Generator Bar */}
        <div className="mt-6 pt-5 border-t border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-teal-50/60 via-indigo-50/40 to-amber-50/50 p-4 rounded-2xl border border-indigo-100/80">
          <div>
            <span className="text-xs font-extrabold text-indigo-950 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-teal-600" />
              Generate Custom Country Dossier Portrait Snapshot
            </span>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Pick any of the {countries.length} countries to generate a branded portrait card with its real budget, visa, healthcare score, and top towns.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <select
              value={selectedCountryId}
              onChange={e => setSelectedCountryId(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-white border border-indigo-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Select country for promotional snapshot"
            >
              {countries.map(c => (
                <option key={c.id} value={c.id}>
                  {c.flag} {c.name} (${c.costOfLiving.monthlyBudgetSingleUSD}/mo)
                </option>
              ))}
            </select>

            <button
              onClick={handleGenerateCountrySnapshot}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-600 via-indigo-600 to-violet-600 text-white text-xs font-extrabold shadow-xs hover:opacity-95 transition-opacity cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Generate Country Card</span>
            </button>
          </div>
        </div>
      </div>

      {/* Status Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="px-4 py-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs font-bold flex items-center justify-between shadow-xs"
          >
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              {toastMessage}
            </span>
            <button onClick={() => setToastMessage(null)} className="text-emerald-700 hover:text-emerald-950">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gallery Grid of Portrait Promotional Snapshots */}
      {activeSpecs.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <p className="text-sm font-bold text-slate-700">
            All promotional snapshots have been discarded.
          </p>
          <button
            onClick={handleRestoreDefaults}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restore Default Module Snapshots</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeSpecs.map(spec => {
            const key = `${spec.id}_${aspect}`;
            const imgUrl = renderedUrls[key];
            return (
              <motion.div
                key={spec.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative overflow-hidden bg-white rounded-3xl border border-indigo-200/80 shadow-sm flex flex-col justify-between p-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-50 text-indigo-900 border border-indigo-200">
                      {spec.category}
                    </span>
                    <span className="font-mono text-[10px] font-bold text-slate-500">
                      {aspect === '9:16' ? '1080×1920 px' : '1080×1350 px'}
                    </span>
                  </div>

                  <h3 className="text-sm font-extrabold text-slate-900 mb-3 line-clamp-1">
                    {spec.title}
                  </h3>

                  {/* Portrait Image Preview Frame */}
                  <div
                    onClick={() => setPreviewSpec(spec)}
                    className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 cursor-pointer group"
                  >
                    {imgUrl ? (
                      <img
                        src={imgUrl}
                        alt={spec.title}
                        className="w-full h-auto block transition-transform duration-300 group-hover:scale-[1.02]"
                      />
                    ) : (
                      <div className="aspect-[9/16] flex items-center justify-center text-xs text-slate-400 font-bold">
                        {isRendering ? 'Rendering HD Snapshot...' : 'Preparing Preview...'}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="px-3.5 py-2 rounded-xl bg-white/95 text-slate-900 text-xs font-extrabold flex items-center gap-1.5 shadow-md">
                        <Eye className="w-4 h-4 text-indigo-600" />
                        <span>Inspect Full Size</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons: Download to Computer OR Discard/Delete */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => handleDownloadSnapshot(spec)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 via-indigo-600 to-violet-600 hover:from-teal-500 hover:to-violet-500 text-white text-xs font-extrabold shadow-xs transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PNG</span>
                  </button>

                  <button
                    onClick={() => handleDiscardCard(spec)}
                    className="inline-flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-colors cursor-pointer"
                    title="Discard / Delete this snapshot"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Discard</span>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Full-Size Lightbox Inspector Modal */}
      <AnimatePresence>
        {previewSpec && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreviewSpec(null)}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl border border-indigo-200 p-5 max-w-lg w-full shadow-2xl space-y-4 my-8"
            >
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">{previewSpec.title}</h4>
                  <span className="text-[11px] text-slate-500">
                    High-Resolution Portrait ({aspect === '9:16' ? '1080×1920' : '1080×1350'} px)
                  </span>
                </div>
                <button
                  onClick={() => setPreviewSpec(null)}
                  className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="max-h-[70vh] overflow-y-auto rounded-2xl bg-slate-950 p-2 flex justify-center">
                {renderedUrls[`${previewSpec.id}_${aspect}`] && (
                  <img
                    src={renderedUrls[`${previewSpec.id}_${aspect}`]}
                    alt={previewSpec.title}
                    className="max-h-[66vh] w-auto rounded-xl object-contain"
                  />
                )}
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  onClick={() => handleDiscardCard(previewSpec)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Discard / Delete Image</span>
                </button>

                <button
                  onClick={() => handleDownloadSnapshot(previewSpec)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 via-indigo-600 to-violet-600 text-white text-xs font-extrabold shadow-sm cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download to Computer</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
