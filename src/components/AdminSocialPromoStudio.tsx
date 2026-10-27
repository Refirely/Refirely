import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Country } from '../types';
import { getCountryPhotoConfig } from './CountryThumbnail';
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
  FolderOpen,
  ChevronLeft,
  ChevronRight,
  FolderArchive,
  Copy,
  Check,
  FileText,
  Hash,
  Wand2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export type PortraitAspect = '9:16' | '4:5';

export type PromoVisualLayout =
  | 'bento-destinations'
  | 'fire-donut-bars'
  | 'globe-3d-atlas'
  | 'banking-fx-waterfall'
  | 'healthcare-gauge-bars'
  | 'compare-radar-matrix'
  | 'dating-flags-meetup'
  | 'country-magazine-cover'
  | 'country-cost-donut'
  | 'country-visa-timeline'
  | 'country-cities-radar'
  | 'country-healthcare-access'
  | 'country-climate-calendar'
  | 'country-pros-cons'
  | 'country-social-demographics';

export interface CountryPromoDossierData {
  id: string;
  code?: string;
  name: string;
  flag: string;
  region: string;
  capital: string;
  currency: string;
  currencySymbol: string;
  language: string;
  tagline: string;
  overview: string;
  imageUrl: string;
  landmarkLabel?: string;
  // Cost of Living
  singleBudget: number;
  coupleBudget: number;
  rentCenter: number;
  rentOutside: number;
  mealInexpensive: number;
  utilitiesMonthly: number;
  groceriesIndex: number;
  healthcareMonthly: number;
  // Visa & Tax
  visaName: string;
  minIncome: number;
  processingMonths: number;
  pathwayToPR: string;
  difficultyRating: number;
  keyRequirements: string[];
  taxStatus: string;
  allowedToWork: boolean;
  // Climate
  climateCategory: string;
  sunnyDays: number;
  avgTempC: number;
  humidityPercent: number;
  rainyMonths: string;
  bestMonths: string;
  // Lifestyle & Healthcare
  healthcareScore: number;
  healthcareSummary: string;
  publicHealthcareAccess: string;
  safetyScore: number;
  englishProficiency: string;
  expatCommunitySize: string;
  walkabilityScore: number;
  // Demographics & Social
  medianAge: number;
  youngPopulationPercent: number;
  femalesPer100Males: number;
  datingRating: number;
  datingCultureSummary: string;
  socialAtmosphere: string;
  // Nightlife
  nightlifeScore: number;
  nightlifeVibrancy: string;
  topVenuesOrDistricts: string[];
  safetyGuidance: string;
  // Cities, Pros & Cons
  topCities: { name: string; vibe: string; monthlyCostUSD: number; highlight?: string }[];
  pros: string[];
  cons: string[];
}

export interface SocialPromoCardSpec {
  id: string;
  layout: PromoVisualLayout;
  category: string; // e.g., 'Core Platform Module', 'Feature Spotlight', or Country Name like 'Portugal'
  countryId?: string;
  countryName?: string;
  countryFlag?: string;
  slideNumber?: number;
  totalSlides?: number;
  styleTag?: string;
  title: string;
  badge: string;
  headline: string;
  subheadline: string;
  ctaText: string;
  countryData?: CountryPromoDossierData;
}

const DEFAULT_FEATURE_SNAPSHOTS: SocialPromoCardSpec[] = [
  {
    id: 'promo-overview-matchmaker',
    layout: 'bento-destinations',
    category: 'Core Platform Module',
    styleTag: 'Editorial Bento Grid',
    title: '1. AI Haven Matchmaker — Editorial Destination Bento Grid',
    badge: 'AI HAVEN MATCHMAKER · 209+ COUNTRIES',
    headline: 'Find Where Your Freedom Goes Further',
    subheadline:
      'Personalized retirement matches ranked by monthly budget, visa rules, healthcare & sunshine.',
    ctaText: 'Find Your Top Haven Match at ReFIREly.com',
  },
  {
    id: 'promo-fire-budget-calculator',
    layout: 'fire-donut-bars',
    category: 'Core Platform Module',
    styleTag: 'Donut & Bar Infographic',
    title: '2. FIRE & Cost Arbitrage — Donut & Bar Chart Infographic',
    badge: 'GLOBAL FIRE & COST OF LIVING SIMULATOR',
    headline: 'Retire 7 Years Earlier with Geographic Arbitrage',
    subheadline:
      'Compare US/UK living costs against 209+ overseas havens with real-time single & couple budgets.',
    ctaText: 'Run Your Custom Budget at ReFIREly.com',
  },
  {
    id: 'promo-3d-world-atlas',
    layout: 'globe-3d-atlas',
    category: 'Feature Spotlight',
    styleTag: '3D Orbital Globe',
    title: '3. 3D Satellite World Atlas — Orbital Globe & Pin Map',
    badge: 'INTERACTIVE 3D SATELLITE EARTH ATLAS',
    headline: 'Explore 209+ Retirement Havens on a 3D Globe',
    subheadline:
      'Spin, zoom, and filter every country by monthly cost, continent, climate & visa income threshold.',
    ctaText: 'Launch the 3D Haven Globe at ReFIREly.com',
  },
  {
    id: 'promo-finances-banking-taxes',
    layout: 'banking-fx-waterfall',
    category: 'Core Platform Module',
    styleTag: 'FX Waterfall & Tax Matrix',
    title: '4. Banking, FX & Expat Taxes — Waterfall & Tax Regime Diagram',
    badge: 'EXPAT BANKING, REMITTANCES & TAX GUIDE',
    headline: 'Slash Wire Fees by 90% & Avoid Double Taxation',
    subheadline:
      'National & private banks, FX transfer simulators, 183-day tax rules & pension treaty verdicts.',
    ctaText: 'View Expat Tax & Bank Guides at ReFIREly.com',
  },
  {
    id: 'promo-healthcare-insurance',
    layout: 'healthcare-gauge-bars',
    category: 'Core Platform Module',
    styleTag: 'JCI Gauges & Cost Bars',
    title: '5. Healthcare & Insurance — JCI Gauge & Cost Comparison Chart',
    badge: 'HEALTHCARE ACCESS, ER & NOMAD INSURANCE',
    headline: 'World-Class Private Healthcare at 80% Lower Cost',
    subheadline:
      'Compare hospital quality scores, specialist visit costs, emergency trauma readiness & insurance tiers.',
    ctaText: 'Compare Healthcare Rankings at ReFIREly.com',
  },
  {
    id: 'promo-compare-studio',
    layout: 'compare-radar-matrix',
    category: 'Feature Spotlight',
    styleTag: '6-Axis Spider Radar',
    title: '6. Compare Studio — 6-Axis Radar Chart & 3-Country Matrix',
    badge: 'SIDE-BY-SIDE COUNTRY COMPARISON STUDIO',
    headline: 'Benchmark Top Havens Across 25+ Live Metrics',
    subheadline:
      'Compare up to 3 countries head-to-head on cost of living, visas, taxes, healthcare & climate.',
    ctaText: 'Compare Countries Side-by-Side at ReFIREly.com',
  },
  {
    id: 'promo-lifestyle-dating-community',
    layout: 'dating-flags-meetup',
    category: 'Feature Spotlight',
    styleTag: 'Green/Red Flag Split',
    title: '7. Lifestyle, Dating & Community — Green/Red Flags & Meetups',
    badge: 'LIFESTYLE, DATING NORMS & EXPAT COMMUNITY',
    headline: 'Real Cultural Insights, Scam Shield & Expat Meetups',
    subheadline:
      'Know what is normal vs. a red flag, master local etiquette, and connect with verified expats abroad.',
    ctaText: 'Join the Expat Network at ReFIREly.com',
  },
];

function extractCountryDossierData(country: Country): CountryPromoDossierData {
  const photoCfg = getCountryPhotoConfig(country.id, country.imageUrl);
  return {
    id: country.id,
    code: country.code,
    name: country.name,
    flag: country.flag,
    region: country.region,
    capital: country.capital,
    currency: country.currency,
    currencySymbol: country.currencySymbol,
    language: country.language,
    tagline: country.tagline,
    overview: country.overview,
    imageUrl: photoCfg.photoUrl,
    landmarkLabel: photoCfg.landmarkLabel,
    singleBudget: country.costOfLiving.monthlyBudgetSingleUSD,
    coupleBudget: country.costOfLiving.monthlyBudgetCoupleUSD,
    rentCenter: country.costOfLiving.rent1BedCenterUSD,
    rentOutside: country.costOfLiving.rent1BedOutsideUSD,
    mealInexpensive: country.costOfLiving.mealInexpensiveUSD,
    utilitiesMonthly: country.costOfLiving.utilitiesMonthlyUSD,
    groceriesIndex: country.costOfLiving.groceriesIndex,
    healthcareMonthly: country.costOfLiving.healthcareMonthlyUSD,
    visaName: country.visa.retirementVisaName,
    minIncome: country.visa.minimumIncomeUSD,
    processingMonths: country.visa.processingMonths,
    pathwayToPR: country.visa.pathwayToPR,
    difficultyRating: country.visa.difficultyRating,
    keyRequirements: country.visa.keyRequirements || [],
    taxStatus: country.visa.taxStatus,
    allowedToWork: country.visa.allowedToWork,
    climateCategory: country.climate.category,
    sunnyDays: country.climate.annualSunnyDays,
    avgTempC: country.climate.averageTempC,
    humidityPercent: country.climate.humidityPercent,
    rainyMonths: country.climate.rainyMonths,
    bestMonths: country.climate.bestMonths,
    healthcareScore: country.lifestyle.healthcareScore,
    healthcareSummary: country.lifestyle.healthcareSummary,
    publicHealthcareAccess: country.lifestyle.publicHealthcareAccess,
    safetyScore: country.lifestyle.safetyScore,
    englishProficiency: country.lifestyle.englishProficiency,
    expatCommunitySize: country.lifestyle.expatCommunitySize,
    walkabilityScore: country.lifestyle.walkabilityScore,
    medianAge: country.demographics.medianAge,
    youngPopulationPercent: country.demographics.youngPopulationPercent,
    femalesPer100Males: country.demographics.femalesPer100Males ?? 100,
    datingRating: country.demographics.datingRating,
    datingCultureSummary: country.demographics.datingCultureSummary,
    socialAtmosphere: country.demographics.socialAtmosphere,
    nightlifeScore: country.adultEntertainment?.nightlifeScore ?? 4,
    nightlifeVibrancy: country.adultEntertainment?.nightlifeVibrancy ?? 'Balanced Coastal Social',
    topVenuesOrDistricts: country.adultEntertainment?.topVenuesOrDistricts ?? [],
    safetyGuidance:
      country.adultEntertainment?.safetyGuidance ??
      'Exercise standard urban awareness and use licensed transit apps at night.',
    topCities: (country.topCities || []).slice(0, 3).map(c => ({
      name: c.name,
      vibe: c.vibe,
      monthlyCostUSD: c.monthlyCostUSD,
      highlight: c.highlight,
    })),
    pros: (country.pros || []).slice(0, 5),
    cons: (country.cons || []).slice(0, 5),
  };
}

/**
 * Generates an 8-Slide Instagram Carousel / Dossier Infographic Pack for a Country.
 * Every slide features a completely different visual style, color theme, and chart/infographic format,
 * capturing 100% of the Country Dossier data.
 */
export function buildCountryDossierPackSpecs(country: Country): SocialPromoCardSpec[] {
  const cd = extractCountryDossierData(country);
  const totalSlides = 8;
  const ts = Date.now();

  return [
    {
      id: `promo-country-${country.id}-s1-cover-${ts}`,
      layout: 'country-magazine-cover',
      category: country.name,
      countryId: country.id,
      countryName: country.name,
      countryFlag: country.flag,
      slideNumber: 1,
      totalSlides,
      styleTag: 'Magazine Cover & Radial Gauges',
      title: `${country.flag} ${country.name} (1/8) — Magazine Cover & Executive Scorecard`,
      badge: `SLIDE 1/8 · ${country.region.toUpperCase()} HAVEN DOSSIER`,
      headline: `Retire in ${country.name}`,
      subheadline: country.tagline,
      ctaText: `Explore Full ${country.name} Dossier at ReFIREly.com`,
      countryData: cd,
    },
    {
      id: `promo-country-${country.id}-s2-cost-${ts}`,
      layout: 'country-cost-donut',
      category: country.name,
      countryId: country.id,
      countryName: country.name,
      countryFlag: country.flag,
      slideNumber: 2,
      totalSlides,
      styleTag: 'Donut & Cost Arbitrage Bars',
      title: `${country.flag} ${country.name} (2/8) — Cost of Living, Rent & Arbitrage Chart`,
      badge: `SLIDE 2/8 · ${country.name.toUpperCase()} COST OF LIVING & RENT`,
      headline: `${country.name} Monthly Budget Breakdown`,
      subheadline: `Single: $${cd.singleBudget.toLocaleString()}/mo · Couple: $${cd.coupleBudget.toLocaleString()}/mo · Currency: ${cd.currency}`,
      ctaText: `Run Your ${country.name} FIRE Calculator at ReFIREly.com`,
      countryData: cd,
    },
    {
      id: `promo-country-${country.id}-s3-visa-${ts}`,
      layout: 'country-visa-timeline',
      category: country.name,
      countryId: country.id,
      countryName: country.name,
      countryFlag: country.flag,
      slideNumber: 3,
      totalSlides,
      styleTag: 'Consular Blueprint & Tax Verdict',
      title: `${country.flag} ${country.name} (3/8) — Retirement Visa, PR & Tax Rules`,
      badge: `SLIDE 3/8 · ${country.name.toUpperCase()} VISA & TAX REGIME`,
      headline: `${cd.visaName}`,
      subheadline: `Min Income: $${cd.minIncome.toLocaleString()}/mo · Processing: ~${cd.processingMonths} Months · PR Pathway`,
      ctaText: `Check ${country.name} Visa Eligibility at ReFIREly.com`,
      countryData: cd,
    },
    {
      id: `promo-country-${country.id}-s4-cities-${ts}`,
      layout: 'country-cities-radar',
      category: country.name,
      countryId: country.id,
      countryName: country.name,
      countryFlag: country.flag,
      slideNumber: 4,
      totalSlides,
      styleTag: '6-Axis Spider Radar & Top Towns',
      title: `${country.flag} ${country.name} (4/8) — 6-Axis Radar & Best Expat Towns`,
      badge: `SLIDE 4/8 · ${country.name.toUpperCase()} EXPAT HUBS & RADAR`,
      headline: `Best Towns to Retire in ${country.name}`,
      subheadline: `6-axis lifestyle benchmark plus monthly budgets across ${country.name}'s top expat cities.`,
      ctaText: `Compare ${country.name} Towns at ReFIREly.com`,
      countryData: cd,
    },
    {
      id: `promo-country-${country.id}-s5-healthcare-${ts}`,
      layout: 'country-healthcare-access',
      category: country.name,
      countryId: country.id,
      countryName: country.name,
      countryFlag: country.flag,
      slideNumber: 5,
      totalSlides,
      styleTag: 'Clinical Teal Medical Infographic',
      title: `${country.flag} ${country.name} (5/8) — Healthcare Quality, Insurance & Safety`,
      badge: `SLIDE 5/8 · ${country.name.toUpperCase()} HEALTHCARE & SAFETY`,
      headline: `${country.name} Healthcare & Safety Report`,
      subheadline: `Healthcare Score: ${cd.healthcareScore}/100 · Safety Index: ${cd.safetyScore}/100 · Est. Policy: ~$${cd.healthcareMonthly}/mo`,
      ctaText: `Read ${country.name} Hospital Guide at ReFIREly.com`,
      countryData: cd,
    },
    {
      id: `promo-country-${country.id}-s6-climate-${ts}`,
      layout: 'country-climate-calendar',
      category: country.name,
      countryId: country.id,
      countryName: country.name,
      countryFlag: country.flag,
      slideNumber: 6,
      totalSlides,
      styleTag: 'Golden Sunburst 12-Month Calendar',
      title: `${country.flag} ${country.name} (6/8) — Climate, Sunshine & Best Months`,
      badge: `SLIDE 6/8 · ${country.name.toUpperCase()} CLIMATE & WEATHER`,
      headline: `${cd.sunnyDays} Sunny Days & ${cd.climateCategory} Climate`,
      subheadline: `Avg Temp: ${cd.avgTempC}°C (${Math.round((cd.avgTempC * 9) / 5 + 32)}°F) · Humidity: ${cd.humidityPercent}% · Best Months: ${cd.bestMonths}`,
      ctaText: `Plan Your ${country.name} Scouting Trip at ReFIREly.com`,
      countryData: cd,
    },
    {
      id: `promo-country-${country.id}-s7-proscons-${ts}`,
      layout: 'country-pros-cons',
      category: country.name,
      countryId: country.id,
      countryName: country.name,
      countryFlag: country.flag,
      slideNumber: 7,
      totalSlides,
      styleTag: 'Emerald vs Rose Reality Check',
      title: `${country.flag} ${country.name} (7/8) — Honest Pros & Cons Reality Check`,
      badge: `SLIDE 7/8 · ${country.name.toUpperCase()} PROS VS. CONS VERDICT`,
      headline: `The Honest Truth About ${country.name}`,
      subheadline: `Why expats love retiring in ${country.name}—and the real-world trade-offs to prepare for.`,
      ctaText: `See Unbiased ${country.name} Reviews at ReFIREly.com`,
      countryData: cd,
    },
    {
      id: `promo-country-${country.id}-s8-social-${ts}`,
      layout: 'country-social-demographics',
      category: country.name,
      countryId: country.id,
      countryName: country.name,
      countryFlag: country.flag,
      slideNumber: 8,
      totalSlides,
      styleTag: 'Cosmopolitan Demographics & Lounge',
      title: `${country.flag} ${country.name} (8/8) — Demographics, Dating & Social Vibe`,
      badge: `SLIDE 8/8 · ${country.name.toUpperCase()} SOCIAL & DEMOGRAPHICS`,
      headline: `Social Life & Demographics in ${country.name}`,
      subheadline: `Median Age: ${cd.medianAge} · ${cd.femalesPer100Males} Females / 100 Males · ${cd.nightlifeVibrancy}`,
      ctaText: `Connect with ${country.name} Expats at ReFIREly.com`,
      countryData: cd,
    },
  ];
}

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

function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = 3
): number {
  const words = (text || '').split(' ');
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

const cachedExternalImages: Record<string, HTMLImageElement> = {};

function loadExternalImage(url: string): Promise<HTMLImageElement | null> {
  if (!url) return Promise.resolve(null);
  if (cachedExternalImages[url] && cachedExternalImages[url].complete) {
    return Promise.resolve(cachedExternalImages[url]);
  }
  return new Promise(resolve => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.referrerPolicy = 'no-referrer';
    const timer = setTimeout(() => resolve(null), 4000);
    img.onload = () => {
      clearTimeout(timer);
      if (img.naturalWidth > 0) {
        cachedExternalImages[url] = img;
        resolve(img);
      } else {
        resolve(null);
      }
    };
    img.onerror = () => {
      clearTimeout(timer);
      resolve(null);
    };
    img.src = url;
  });
}

async function loadExternalImageWithFallbacks(
  urls: (string | undefined)[]
): Promise<HTMLImageElement | null> {
  const validUrls = urls.filter((u): u is string => Boolean(u && u.trim()));
  for (const url of validUrls) {
    const img = await loadExternalImage(url);
    if (img) return img;
  }
  return null;
}

function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const imgW = img.naturalWidth || img.width;
  const imgH = img.naturalHeight || img.height;
  if (!imgW || !imgH) {
    ctx.drawImage(img, x, y, w, h);
    return;
  }
  const targetRatio = w / h;
  const imgRatio = imgW / imgH;
  let sx = 0;
  let sy = 0;
  let sw = imgW;
  let sh = imgH;

  if (imgRatio > targetRatio) {
    sw = imgH * targetRatio;
    sx = (imgW - sw) / 2;
  } else {
    sh = imgW / targetRatio;
    sy = (imgH - sh) / 2;
  }
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

function drawBrandHeader(
  ctx: CanvasRenderingContext2D,
  iconImg: HTMLImageElement | null,
  width: number,
  padX: number,
  curY: number,
  isStory: boolean,
  isLightBg: boolean
): number {
  const boxSize = isStory ? 92 : 78;

  const ribbonGrad = ctx.createLinearGradient(padX, curY, padX + boxSize, curY + boxSize);
  ribbonGrad.addColorStop(0, '#14b8a6');
  ribbonGrad.addColorStop(0.5, '#6366f1');
  ribbonGrad.addColorStop(1, '#f59e0b');

  ctx.save();
  ctx.shadowColor = isLightBg ? 'rgba(79, 70, 229, 0.18)' : 'rgba(0, 0, 0, 0.35)';
  ctx.shadowBlur = 18;
  roundRect(ctx, padX, curY, boxSize, boxSize, 22);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.lineWidth = 3.5;
  ctx.strokeStyle = ribbonGrad;
  ctx.stroke();
  ctx.restore();

  if (iconImg) {
    ctx.drawImage(iconImg, padX + 7, curY + 7, boxSize - 14, boxSize - 14);
  }

  const wordX = padX + boxSize + 20;
  const wordY = curY + (isStory ? 52 : 44);
  ctx.font = `900 ${isStory ? '46px' : '40px'} Inter, system-ui, sans-serif`;
  ctx.fillStyle = isLightBg ? '#0f172a' : '#ffffff';
  ctx.fillText('Re', wordX, wordY);
  const reW = ctx.measureText('Re').width;

  const fireGrad = ctx.createLinearGradient(wordX + reW, wordY - 36, wordX + reW + 115, wordY);
  fireGrad.addColorStop(0, '#f43f5e');
  fireGrad.addColorStop(0.5, '#f97316');
  fireGrad.addColorStop(1, '#f59e0b');
  ctx.fillStyle = fireGrad;
  ctx.fillText('FIRE', wordX + reW, wordY);
  const fireW = ctx.measureText('FIRE').width;

  ctx.fillStyle = isLightBg ? '#0d9488' : '#2dd4bf';
  ctx.fillText('ly', wordX + reW + fireW, wordY);
  const lyW = ctx.measureText('ly').width;

  ctx.font = `800 ${isStory ? '24px' : '20px'} Inter, system-ui, sans-serif`;
  ctx.fillStyle = isLightBg ? '#64748b' : '#cbd5e1';
  ctx.fillText('.com', wordX + reW + fireW + lyW + 3, wordY);

  ctx.font = `700 ${isStory ? '15px' : '13px'} Inter, system-ui, sans-serif`;
  ctx.fillStyle = isLightBg ? '#475569' : '#94a3b8';
  ctx.fillText('WHERE YOUR FREEDOM GOES FURTHER', wordX, wordY + (isStory ? 26 : 22));

  // Website Pill on Right
  const pillW = 230;
  const pillH = 44;
  roundRect(ctx, width - padX - pillW, curY + 16, pillW, pillH, 22);
  ctx.fillStyle = isLightBg ? '#eef2ff' : 'rgba(255,255,255,0.12)';
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = isLightBg ? '#c7d2fe' : 'rgba(94, 234, 212, 0.45)';
  ctx.stroke();

  ctx.font = '800 17px Inter, system-ui, sans-serif';
  ctx.fillStyle = isLightBg ? '#4338ca' : '#5eead4';
  ctx.textAlign = 'center';
  ctx.fillText('🌐 refirely.com', width - padX - pillW / 2, curY + 44);
  ctx.textAlign = 'left';

  return curY + boxSize + (isStory ? 38 : 24);
}

function drawFooterCta(
  ctx: CanvasRenderingContext2D,
  ctaText: string,
  width: number,
  height: number,
  padX: number,
  isStory: boolean,
  gradColors: [string, string, string]
) {
  const ctaH = isStory ? 84 : 64;
  const ctaY = height - (isStory ? 128 : 92);
  const cardW = width - padX * 2;

  const btnGrad = ctx.createLinearGradient(padX, ctaY, padX + cardW, ctaY);
  btnGrad.addColorStop(0, gradColors[0]);
  btnGrad.addColorStop(0.5, gradColors[1]);
  btnGrad.addColorStop(1, gradColors[2]);

  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.28)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 8;
  roundRect(ctx, padX, ctaY, cardW, ctaH, ctaH / 2);
  ctx.fillStyle = btnGrad;
  ctx.fill();
  ctx.restore();

  ctx.font = `900 ${isStory ? '25px' : '20px'} Inter, system-ui, sans-serif`;
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.fillText(`${ctaText}  →`, width / 2, ctaY + (isStory ? 51 : 40));
  ctx.textAlign = 'left';
}

function drawCircularGauge(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  score: number,
  label: string,
  color: string,
  trackColor: string,
  textColor: string,
  subColor: string
) {
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.strokeStyle = trackColor;
  ctx.stroke();

  const startAngle = -Math.PI / 2;
  const endAngle = startAngle + (Math.PI * 2 * Math.min(100, Math.max(0, score))) / 100;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, startAngle, endAngle);
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.font = `900 ${Math.round(radius * 0.56)}px Inter, system-ui, sans-serif`;
  ctx.fillStyle = textColor;
  ctx.fillText(`${score}`, cx, cy + Math.round(radius * 0.18));

  ctx.font = '800 15px Inter, system-ui, sans-serif';
  ctx.fillStyle = subColor;
  ctx.fillText(label, cx, cy + radius + 28);
  ctx.textAlign = 'left';
}

function drawCountrySlideTopHeader(
  ctx: CanvasRenderingContext2D,
  spec: SocialPromoCardSpec,
  flagImg: HTMLImageElement | null,
  padX: number,
  contentW: number,
  curY: number,
  isStory: boolean,
  isLightBg: boolean,
  badgeBg: string,
  badgeTextCol: string
): number {
  const cd = spec.countryData;
  // Badge Pill + Slide Indicator
  const badgeW = Math.min(contentW, 560);
  roundRect(ctx, padX, curY, badgeW, 38, 19);
  ctx.fillStyle = badgeBg;
  ctx.fill();
  ctx.font = '800 15px Inter, system-ui, sans-serif';
  ctx.fillStyle = badgeTextCol;
  ctx.fillText(spec.badge, padX + 20, curY + 25);

  if (spec.slideNumber && spec.totalSlides) {
    const pillW = 165;
    roundRect(ctx, padX + contentW - pillW, curY, pillW, 38, 19);
    ctx.fillStyle = isLightBg ? '#0f172a' : 'rgba(255,255,255,0.16)';
    ctx.fill();
    ctx.textAlign = 'center';
    ctx.font = '900 14px Inter, system-ui, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`SWIPE  ${spec.slideNumber} / ${spec.totalSlides}  →`, padX + contentW - pillW / 2, curY + 24);
    ctx.textAlign = 'left';
  }

  curY += isStory ? 66 : 52;

  // Flag + Headline
  let titleX = padX;
  if (flagImg) {
    const fw = isStory ? 56 : 46;
    const fh = isStory ? 38 : 32;
    const fy = curY - (isStory ? 34 : 28);
    ctx.save();
    roundRect(ctx, titleX, fy, fw, fh, 7);
    ctx.clip();
    ctx.drawImage(flagImg, titleX, fy, fw, fh);
    ctx.restore();
    ctx.strokeStyle = isLightBg ? '#cbd5e1' : 'rgba(255,255,255,0.45)';
    ctx.lineWidth = 1.5;
    roundRect(ctx, titleX, fy, fw, fh, 7);
    ctx.stroke();
    titleX += fw + 16;
  }

  ctx.font = `900 ${isStory ? '46px' : '36px'} Inter, system-ui, sans-serif`;
  ctx.fillStyle = isLightBg ? '#0f172a' : '#ffffff';
  curY = drawWrappedText(
    ctx,
    flagImg ? spec.headline : `${cd?.flag || ''} ${spec.headline}`,
    titleX,
    curY,
    contentW - (titleX - padX),
    isStory ? 52 : 42,
    2
  );
  curY += 4;

  ctx.font = `600 ${isStory ? '21px' : '17px'} Inter, system-ui, sans-serif`;
  ctx.fillStyle = isLightBg ? '#475569' : '#cbd5e1';
  curY = drawWrappedText(ctx, spec.subheadline, padX, curY, contentW, isStory ? 30 : 24, 2);

  return curY + (isStory ? 22 : 14);
}

/**
 * Renders all Platform Snapshots + 8 Distinct Country Dossier Carousel Slides on Canvas.
 */
async function renderPortraitPromoToDataUrl(
  spec: SocialPromoCardSpec,
  aspect: PortraitAspect
): Promise<string> {
  const width = 1080;
  const height = aspect === '9:16' ? 1920 : 1350;
  const isStory = aspect === '9:16';
  const padX = 64;
  const contentW = width - padX * 2;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const iconImg = await loadEmblemIcon();

  // =========================================================================
  // PLATFORM STYLE 1: WARM EDITORIAL BENTO DESTINATION GRID
  // =========================================================================
  if (spec.layout === 'bento-destinations') {
    const bg = ctx.createLinearGradient(0, 0, width, height);
    bg.addColorStop(0, '#fffbeb');
    bg.addColorStop(0.5, '#f8fafc');
    bg.addColorStop(1, '#f0fdfa');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    const topStrip = ctx.createLinearGradient(0, 0, width, 0);
    topStrip.addColorStop(0, '#f59e0b');
    topStrip.addColorStop(0.5, '#ec4899');
    topStrip.addColorStop(1, '#6366f1');
    ctx.fillStyle = topStrip;
    ctx.fillRect(0, 0, width, 14);

    let curY = drawBrandHeader(ctx, iconImg, width, padX, isStory ? 72 : 44, isStory, true);

    roundRect(ctx, padX, curY, 440, 40, 20);
    ctx.fillStyle = '#fef3c7';
    ctx.fill();
    ctx.font = '800 16px Inter, system-ui, sans-serif';
    ctx.fillStyle = '#b45309';
    ctx.fillText(spec.badge, padX + 20, curY + 26);
    curY += isStory ? 76 : 58;

    ctx.font = `900 ${isStory ? '54px' : '42px'} Inter, system-ui, sans-serif`;
    ctx.fillStyle = '#0f172a';
    curY = drawWrappedText(ctx, spec.headline, padX, curY, contentW, isStory ? 62 : 48, 2);
    curY += 8;

    ctx.font = `600 ${isStory ? '24px' : '19px'} Inter, system-ui, sans-serif`;
    ctx.fillStyle = '#475569';
    curY = drawWrappedText(ctx, spec.subheadline, padX, curY, contentW, isStory ? 34 : 26, 2);
    curY += isStory ? 28 : 16;

    const filterH = isStory ? 76 : 60;
    roundRect(ctx, padX, curY, contentW, filterH, 22);
    ctx.fillStyle = '#1e1b4b';
    ctx.fill();
    ctx.font = `800 ${isStory ? '20px' : '17px'} Inter, system-ui, sans-serif`;
    ctx.fillStyle = '#fde68a';
    ctx.fillText('✨ AI Match Filter: Couple ≤ $2,400/mo  ·  300+ Sunny Days  ·  High Healthcare', padX + 28, curY + (isStory ? 45 : 37));
    curY += filterH + (isStory ? 28 : 18);

    const cards = [
      {
        id: 'portugal',
        flag: '🇵🇹',
        name: 'Portugal',
        town: 'Cascais & Lagos',
        visa: 'D7 Passive Income',
        budget: '$2,150/mo',
        match: 97,
        grad: ['#0284c7', '#0d9488'],
        tag: 'EU Safety #1',
      },
      {
        id: 'thailand',
        flag: '🇹🇭',
        name: 'Thailand',
        town: 'Hua Hin & Chiang Mai',
        visa: 'O-A / LTR Visa',
        budget: '$1,450/mo',
        match: 95,
        grad: ['#f97316', '#e11d48'],
        tag: 'Best Value',
      },
      {
        id: 'costa-rica',
        flag: '🇨🇷',
        name: 'Costa Rica',
        town: 'Atenas & Escazú',
        visa: 'Pensionado ($1k)',
        budget: '$1,950/mo',
        match: 94,
        grad: ['#059669', '#0284c7'],
        tag: '0% Foreign Tax',
      },
      {
        id: 'spain',
        flag: '🇪🇸',
        name: 'Spain',
        town: 'Alicante & Málaga',
        visa: 'Non-Lucrative NLV',
        budget: '$2,350/mo',
        match: 93,
        grad: ['#7c3aed', '#db2777'],
        tag: '320 Sunny Days',
      },
    ];

    const bentoImages = await Promise.all(
      cards.map(c => loadExternalImageWithFallbacks(getCountryPhotoConfig(c.id).candidateUrls))
    );

    const gap = 24;
    const cardW = (contentW - gap) / 2;
    const cardH = isStory ? 440 : 285;

    cards.forEach((c, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const cx = padX + col * (cardW + gap);
      const cy = curY + row * (cardH + gap);

      ctx.save();
      ctx.shadowColor = 'rgba(15, 23, 42, 0.1)';
      ctx.shadowBlur = 24;
      ctx.shadowOffsetY = 8;
      roundRect(ctx, cx, cy, cardW, cardH, 28);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.restore();

      ctx.save();
      roundRect(ctx, cx, cy, cardW, cardH, 28);
      ctx.clip();
      const bannerH = isStory ? 170 : 108;
      const cardPhoto = bentoImages[idx];
      if (cardPhoto) {
        drawCoverImage(ctx, cardPhoto, cx, cy, cardW, bannerH);
        const scrim = ctx.createLinearGradient(cx, cy, cx, cy + bannerH);
        scrim.addColorStop(0, 'rgba(15, 23, 42, 0.25)');
        scrim.addColorStop(1, 'rgba(15, 23, 42, 0.55)');
        ctx.fillStyle = scrim;
        ctx.fillRect(cx, cy, cardW, bannerH);
      } else {
        const cg = ctx.createLinearGradient(cx, cy, cx + cardW, cy + bannerH);
        cg.addColorStop(0, c.grad[0]);
        cg.addColorStop(1, c.grad[1]);
        ctx.fillStyle = cg;
        ctx.fillRect(cx, cy, cardW, bannerH);
      }

      roundRect(ctx, cx + 22, cy + 20, 148, 38, 19);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
      ctx.fill();
      ctx.font = '900 17px Inter, system-ui, sans-serif';
      ctx.fillStyle = '#4ade80';
      ctx.fillText(`★ ${c.match}% Match`, cx + 40, cy + 45);

      const bodyY = cy + bannerH + (isStory ? 48 : 34);
      ctx.font = `900 ${isStory ? '34px' : '26px'} Inter, system-ui, sans-serif`;
      ctx.fillStyle = '#0f172a';
      ctx.fillText(`${c.flag} ${c.name}`, cx + 24, bodyY);

      ctx.font = `600 ${isStory ? '20px' : '16px'} Inter, system-ui, sans-serif`;
      ctx.fillStyle = '#475569';
      ctx.fillText(`📍 ${c.town}`, cx + 24, bodyY + (isStory ? 38 : 26));

      ctx.font = `700 ${isStory ? '18px' : '15px'} Inter, system-ui, sans-serif`;
      ctx.fillStyle = '#4f46e5';
      ctx.fillText(`🛂 ${c.visa}`, cx + 24, bodyY + (isStory ? 74 : 50));

      const priceY = cy + cardH - (isStory ? 76 : 54);
      roundRect(ctx, cx + 20, priceY, cardW - 40, isStory ? 56 : 40, 14);
      ctx.fillStyle = '#f1f5f9';
      ctx.fill();
      ctx.font = `900 ${isStory ? '24px' : '19px'} Inter, system-ui, sans-serif`;
      ctx.fillStyle = '#0f172a';
      ctx.fillText(c.budget, cx + 36, priceY + (isStory ? 36 : 27));

      ctx.textAlign = 'right';
      ctx.font = `800 ${isStory ? '16px' : '13px'} Inter, system-ui, sans-serif`;
      ctx.fillStyle = '#0d9488';
      ctx.fillText(c.tag, cx + cardW - 36, priceY + (isStory ? 34 : 26));
      ctx.textAlign = 'left';
      ctx.restore();
    });

    drawFooterCta(ctx, spec.ctaText, width, height, padX, isStory, ['#f59e0b', '#ec4899', '#4f46e5']);
    return canvas.toDataURL('image/png', 1.0);
  }

  // =========================================================================
  // PLATFORM STYLE 2: EMERALD WEALTH & FIRE CALCULATOR
  // =========================================================================
  if (spec.layout === 'fire-donut-bars') {
    const bg = ctx.createLinearGradient(0, 0, width, height);
    bg.addColorStop(0, '#022c22');
    bg.addColorStop(0.55, '#064e3b');
    bg.addColorStop(1, '#0f172a');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    let curY = drawBrandHeader(ctx, iconImg, width, padX, isStory ? 72 : 44, isStory, false);

    roundRect(ctx, padX, curY, 460, 40, 20);
    ctx.fillStyle = 'rgba(16, 185, 129, 0.25)';
    ctx.fill();
    ctx.font = '800 16px Inter, system-ui, sans-serif';
    ctx.fillStyle = '#6ee7b7';
    ctx.fillText(spec.badge, padX + 20, curY + 26);
    curY += isStory ? 74 : 56;

    ctx.font = `900 ${isStory ? '52px' : '40px'} Inter, system-ui, sans-serif`;
    ctx.fillStyle = '#ffffff';
    curY = drawWrappedText(ctx, spec.headline, padX, curY, contentW, isStory ? 60 : 46, 2);
    curY += 6;

    ctx.font = `500 ${isStory ? '23px' : '18px'} Inter, system-ui, sans-serif`;
    ctx.fillStyle = '#a7f3d0';
    curY = drawWrappedText(ctx, spec.subheadline, padX, curY, contentW, isStory ? 32 : 25, 2);
    curY += isStory ? 28 : 16;

    const box1H = isStory ? 440 : 300;
    roundRect(ctx, padX, curY, contentW, box1H, 30);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.font = `900 ${isStory ? '26px' : '21px'} Inter, system-ui, sans-serif`;
    ctx.fillStyle = '#0f172a';
    ctx.fillText('📊 Annual Couple Retirement Spend Comparison', padX + 36, curY + (isStory ? 52 : 40));

    const bar1Y = curY + (isStory ? 95 : 68);
    ctx.font = `800 ${isStory ? '20px' : '16px'} Inter, system-ui, sans-serif`;
    ctx.fillStyle = '#475569';
    ctx.fillText('🇺🇸 🇬🇧 US / UK Average Retirement ($5,600/mo)', padX + 36, bar1Y);

    roundRect(ctx, padX + 36, bar1Y + 14, contentW - 72, isStory ? 54 : 38, 14);
    ctx.fillStyle = '#f43f5e';
    ctx.fill();
    ctx.font = `900 ${isStory ? '24px' : '18px'} Inter, system-ui, sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.fillText('$67,200 / year', padX + 56, bar1Y + (isStory ? 50 : 39));

    const bar2Y = bar1Y + (isStory ? 115 : 80);
    ctx.font = `800 ${isStory ? '20px' : '16px'} Inter, system-ui, sans-serif`;
    ctx.fillStyle = '#065f46';
    ctx.fillText('🇵🇹 🇹🇭 🇨🇷 Overseas Haven Average ($2,150/mo)', padX + 36, bar2Y);

    roundRect(ctx, padX + 36, bar2Y + 14, (contentW - 72) * 0.42, isStory ? 54 : 38, 14);
    ctx.fillStyle = '#10b981';
    ctx.fill();
    ctx.font = `900 ${isStory ? '24px' : '18px'} Inter, system-ui, sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.fillText('$25,800 / yr', padX + 56, bar2Y + (isStory ? 50 : 39));

    const saveY = bar2Y + (isStory ? 92 : 66);
    roundRect(ctx, padX + 36, saveY, contentW - 72, isStory ? 68 : 48, 18);
    ctx.fillStyle = '#ecfdf5';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#34d399';
    ctx.stroke();
    ctx.font = `900 ${isStory ? '25px' : '19px'} Inter, system-ui, sans-serif`;
    ctx.fillStyle = '#065f46';
    ctx.textAlign = 'center';
    ctx.fillText('💰 YOU KEEP +$41,400 / YEAR (+$828,000 OVER 20 YEARS)', width / 2, saveY + (isStory ? 43 : 31));
    ctx.textAlign = 'left';

    curY += box1H + (isStory ? 32 : 20);

    const box2H = isStory ? 530 : 370;
    roundRect(ctx, padX, curY, contentW, box2H, 30);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.font = `900 ${isStory ? '26px' : '21px'} Inter, system-ui, sans-serif`;
    ctx.fillStyle = '#0f172a';
    ctx.fillText('🍩 Where Your $2,150/mo Couple Budget Goes', padX + 36, curY + (isStory ? 52 : 40));

    const slices = [
      { label: '1-Bed Prime Apartment', amount: '$820/mo', pct: 0.38, color: '#6366f1' },
      { label: 'Fresh Markets & Dining Out', amount: '$540/mo', pct: 0.25, color: '#14b8a6' },
      { label: 'Travel, Leisure & Clubs', amount: '$320/mo', pct: 0.15, color: '#f59e0b' },
      { label: 'Private Health Insurance', amount: '$260/mo', pct: 0.12, color: '#ec4899' },
      { label: 'Fiber, Utilities & Transit', amount: '$210/mo', pct: 0.1, color: '#0ea5e9' },
    ];

    const donutCx = padX + (isStory ? 225 : 185);
    const donutCy = curY + (isStory ? 295 : 210);
    const donutR = isStory ? 145 : 105;

    let angle = -Math.PI / 2;
    slices.forEach(s => {
      const sweep = s.pct * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(donutCx, donutCy, donutR, angle, angle + sweep);
      ctx.strokeStyle = s.color;
      ctx.lineWidth = isStory ? 44 : 34;
      ctx.stroke();
      angle += sweep;
    });

    ctx.textAlign = 'center';
    ctx.font = `900 ${isStory ? '34px' : '26px'} Inter, system-ui, sans-serif`;
    ctx.fillStyle = '#0f172a';
    ctx.fillText('$2,150', donutCx, donutCy + 6);
    ctx.font = `700 ${isStory ? '16px' : '13px'} Inter, system-ui, sans-serif`;
    ctx.fillStyle = '#64748b';
    ctx.fillText('PER MONTH', donutCx, donutCy + 32);
    ctx.textAlign = 'left';

    const legX = padX + (isStory ? 425 : 340);
    let legY = curY + (isStory ? 120 : 88);
    slices.forEach(s => {
      roundRect(ctx, legX, legY - 18, 22, 22, 6);
      ctx.fillStyle = s.color;
      ctx.fill();

      ctx.font = `800 ${isStory ? '21px' : '17px'} Inter, system-ui, sans-serif`;
      ctx.fillStyle = '#0f172a';
      ctx.fillText(s.label, legX + 34, legY);

      ctx.textAlign = 'right';
      ctx.font = `900 ${isStory ? '21px' : '17px'} Inter, system-ui, sans-serif`;
      ctx.fillStyle = '#0f766e';
      ctx.fillText(s.amount, padX + contentW - 36, legY);
      ctx.textAlign = 'left';

      legY += isStory ? 76 : 52;
    });

    drawFooterCta(ctx, spec.ctaText, width, height, padX, isStory, ['#10b981', '#0d9488', '#f59e0b']);
    return canvas.toDataURL('image/png', 1.0);
  }

  // =========================================================================
  // PLATFORM STYLE 3: 3D SATELLITE GLOBE & ORBITAL WORLD ATLAS
  // =========================================================================
  if (spec.layout === 'globe-3d-atlas') {
    const bg = ctx.createRadialGradient(width / 2, height * 0.45, 50, width / 2, height * 0.45, 950);
    bg.addColorStop(0, '#1e1b4b');
    bg.addColorStop(0.55, '#090d16');
    bg.addColorStop(1, '#020617');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    let curY = drawBrandHeader(ctx, iconImg, width, padX, isStory ? 72 : 44, isStory, false);

    roundRect(ctx, padX, curY, 460, 40, 20);
    ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
    ctx.fill();
    ctx.font = '800 16px Inter, system-ui, sans-serif';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(spec.badge, padX + 20, curY + 26);
    curY += isStory ? 74 : 56;

    ctx.font = `900 ${isStory ? '52px' : '40px'} Inter, system-ui, sans-serif`;
    ctx.fillStyle = '#ffffff';
    curY = drawWrappedText(ctx, spec.headline, padX, curY, contentW, isStory ? 60 : 46, 2);
    curY += 6;

    ctx.font = `500 ${isStory ? '23px' : '18px'} Inter, system-ui, sans-serif`;
    ctx.fillStyle = '#94a3b8';
    curY = drawWrappedText(ctx, spec.subheadline, padX, curY, contentW, isStory ? 32 : 25, 2);

    const globeCx = width / 2;
    const globeCy = curY + (isStory ? 360 : 240);
    const globeR = isStory ? 275 : 185;

    const globeGrad = ctx.createRadialGradient(
      globeCx - globeR * 0.3,
      globeCy - globeR * 0.3,
      20,
      globeCx,
      globeCy,
      globeR
    );
    globeGrad.addColorStop(0, '#2563eb');
    globeGrad.addColorStop(0.55, '#1e1b4b');
    globeGrad.addColorStop(1, '#020617');

    ctx.save();
    ctx.shadowColor = 'rgba(56, 189, 248, 0.45)';
    ctx.shadowBlur = 55;
    ctx.beginPath();
    ctx.arc(globeCx, globeCy, globeR, 0, Math.PI * 2);
    ctx.fillStyle = globeGrad;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#38bdf8';
    ctx.stroke();
    ctx.restore();

    ctx.strokeStyle = 'rgba(125, 211, 252, 0.28)';
    ctx.lineWidth = 1.5;
    [0.35, 0.7].forEach(scale => {
      ctx.beginPath();
      ctx.ellipse(globeCx, globeCy, globeR, globeR * scale, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(globeCx, globeCy, globeR * scale, globeR, 0, 0, Math.PI * 2);
      ctx.stroke();
    });

    const pins = [
      { x: globeCx - globeR - 140, y: globeCy - 140, text: '🇵🇹 Portugal · $2,150/mo', col: '#10b981' },
      { x: globeCx + globeR - 110, y: globeCy - 150, text: '🇹🇭 Thailand · $1,450/mo', col: '#10b981' },
      { x: globeCx - globeR - 150, y: globeCy + 70, text: '🇨🇷 Costa Rica · $1,950/mo', col: '#f59e0b' },
      { x: globeCx + globeR - 120, y: globeCy + 85, text: '🇲🇾 Malaysia · $1,550/mo', col: '#38bdf8' },
    ];

    pins.forEach(p => {
      roundRect(ctx, p.x, p.y, 280, 52, 26);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = p.col;
      ctx.stroke();
      ctx.font = '800 18px Inter, system-ui, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(p.text, p.x + 20, p.y + 32);
    });

    const gridY = globeCy + globeR + (isStory ? 60 : 34);
    const regions = [
      { name: 'Europe & Med', count: '47 Havens', range: 'From $1,400/mo', color: '#818cf8' },
      { name: 'Asia & Pacific', count: '42 Havens', range: 'From $1,150/mo', color: '#2dd4bf' },
      { name: 'Americas & Carib', count: '52 Havens', range: 'From $1,350/mo', color: '#fbbf24' },
      { name: 'Middle East & Africa', count: '68 Havens', range: 'From $1,250/mo', color: '#f472b6' },
    ];

    const rW = (contentW - 24) / 2;
    const rH = isStory ? 128 : 88;
    regions.forEach((r, i) => {
      const rx = padX + (i % 2) * (rW + 24);
      const ry = gridY + Math.floor(i / 2) * (rH + 18);
      roundRect(ctx, rx, ry, rW, rH, 20);
      ctx.fillStyle = 'rgba(30, 41, 59, 0.85)';
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = r.color;
      ctx.stroke();

      ctx.font = `800 ${isStory ? '22px' : '18px'} Inter, system-ui, sans-serif`;
      ctx.fillStyle = '#ffffff';
      ctx.fillText(r.name, rx + 24, ry + (isStory ? 48 : 36));

      ctx.font = `700 ${isStory ? '18px' : '15px'} Inter, system-ui, sans-serif`;
      ctx.fillStyle = r.color;
      ctx.fillText(`${r.count}  ·  ${r.range}`, rx + 24, ry + (isStory ? 88 : 66));
    });

    drawFooterCta(ctx, spec.ctaText, width, height, padX, isStory, ['#0284c7', '#6366f1', '#a855f7']);
    return canvas.toDataURL('image/png', 1.0);
  }

  // =========================================================================
  // PLATFORM STYLE 4: SWISS GOLD & ROYAL SLATE — BANKING & FX WATERFALL
  // =========================================================================
  if (spec.layout === 'banking-fx-waterfall') {
    const bg = ctx.createLinearGradient(0, 0, width, height);
    bg.addColorStop(0, '#1e293b');
    bg.addColorStop(0.5, '#0f172a');
    bg.addColorStop(1, '#1c1917');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    let curY = drawBrandHeader(ctx, iconImg, width, padX, isStory ? 72 : 44, isStory, false);

    roundRect(ctx, padX, curY, 470, 40, 20);
    ctx.fillStyle = 'rgba(245, 158, 11, 0.22)';
    ctx.fill();
    ctx.font = '800 16px Inter, system-ui, sans-serif';
    ctx.fillStyle = '#fcd34d';
    ctx.fillText(spec.badge, padX + 20, curY + 26);
    curY += isStory ? 74 : 56;

    ctx.font = `900 ${isStory ? '52px' : '40px'} Inter, system-ui, sans-serif`;
    ctx.fillStyle = '#ffffff';
    curY = drawWrappedText(ctx, spec.headline, padX, curY, contentW, isStory ? 60 : 46, 2);
    curY += 6;

    ctx.font = `500 ${isStory ? '23px' : '18px'} Inter, system-ui, sans-serif`;
    ctx.fillStyle = '#fde68a';
    curY = drawWrappedText(ctx, spec.subheadline, padX, curY, contentW, isStory ? 32 : 25, 2);
    curY += isStory ? 28 : 16;

    const fxH = isStory ? 470 : 320;
    roundRect(ctx, padX, curY, contentW, fxH, 28);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.font = `900 ${isStory ? '26px' : '20px'} Inter, system-ui, sans-serif`;
    ctx.fillStyle = '#0f172a';
    ctx.fillText('💱 Monthly $3,000 Pension Transfer Fee Comparison', padX + 34, curY + (isStory ? 52 : 38));

    const colW = (contentW - 92) / 2;
    const colH = isStory ? 360 : 240;
    const colY = curY + (isStory ? 80 : 56);

    roundRect(ctx, padX + 34, colY, colW, colH, 22);
    ctx.fillStyle = '#fff1f2';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#fecdd3';
    ctx.stroke();

    ctx.font = `800 ${isStory ? '22px' : '18px'} Inter, system-ui, sans-serif`;
    ctx.fillStyle = '#9f1239';
    ctx.fillText('❌ High-Street Bank SWIFT', padX + 58, colY + (isStory ? 48 : 36));
    ctx.font = `600 ${isStory ? '19px' : '15px'} Inter, system-ui, sans-serif`;
    ctx.fillStyle = '#475569';
    ctx.fillText('• Wire Fee: -$35 / transfer', padX + 58, colY + (isStory ? 96 : 70));
    ctx.fillText('• Hidden FX Spread (3.2%): -$96', padX + 58, colY + (isStory ? 136 : 98));
    ctx.fillText('• Receiving Bank Cut: -$15', padX + 58, colY + (isStory ? 176 : 126));

    ctx.font = `900 ${isStory ? '30px' : '23px'} Inter, system-ui, sans-serif`;
    ctx.fillStyle = '#e11d48';
    ctx.fillText('Lost: -$1,752 / yr', padX + 58, colY + colH - (isStory ? 42 : 28));

    const rx = padX + 34 + colW + 24;
    roundRect(ctx, rx, colY, colW, colH, 22);
    ctx.fillStyle = '#ecfdf5';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#6ee7b7';
    ctx.stroke();

    ctx.font = `800 ${isStory ? '22px' : '18px'} Inter, system-ui, sans-serif`;
    ctx.fillStyle = '#065f46';
    ctx.fillText('✅ Wise / Revolut + Local IBAN', rx + 24, colY + (isStory ? 48 : 36));
    ctx.font = `600 ${isStory ? '19px' : '15px'} Inter, system-ui, sans-serif`;
    ctx.fillStyle = '#475569';
    ctx.fillText('• Mid-Market Interbank FX Rate', rx + 24, colY + (isStory ? 96 : 70));
    ctx.fillText('• Transparent Fee (~0.38%): -$11', rx + 24, colY + (isStory ? 136 : 98));
    ctx.fillText('• Fee-Free Charles Schwab ATM', rx + 24, colY + (isStory ? 176 : 126));

    ctx.font = `900 ${isStory ? '30px' : '23px'} Inter, system-ui, sans-serif`;
    ctx.fillStyle = '#059669';
    ctx.fillText('You Save +$1,620 / yr', rx + 24, colY + colH - (isStory ? 42 : 28));

    curY += fxH + (isStory ? 32 : 20);

    const taxPillars = [
      {
        badge: '0% CAPITAL TRANSFER TAX',
        title: 'Savings & Home Sale Proceeds Are Tax-Free',
        desc: 'Moving already-taxed principal savings into your local bank is a capital transfer—not taxable income.',
        col: '#f59e0b',
      },
      {
        badge: 'TERRITORIAL & TREATY HAVENS',
        title: 'Countries That Exempt Foreign Pensions',
        desc: 'Compare 0% Territorial Tax havens (Costa Rica, Panama, Malaysia, Thailand LTR) vs. DTA treaty countries.',
        col: '#2dd4bf',
      },
      {
        badge: 'NATIONAL & PRIVATE BANKS',
        title: 'Step-by-Step Expat Account Opening Checklist',
        desc: 'Local Tax IDs (NIF/RFC/TIN), deposit insurance limits, and English digital banking apps.',
        col: '#818cf8',
      },
    ];

    const pH = isStory ? 152 : 108;
    taxPillars.forEach((tp, idx) => {
      const py = curY + idx * (pH + (isStory ? 18 : 12));
      roundRect(ctx, padX, py, contentW, pH, 22);
      ctx.fillStyle = 'rgba(30, 41, 59, 0.92)';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = tp.col;
      ctx.stroke();

      ctx.font = `800 ${isStory ? '15px' : '12px'} Inter, system-ui, sans-serif`;
      ctx.fillStyle = tp.col;
      ctx.fillText(tp.badge, padX + 28, py + (isStory ? 36 : 26));

      ctx.font = `900 ${isStory ? '24px' : '19px'} Inter, system-ui, sans-serif`;
      ctx.fillStyle = '#ffffff';
      ctx.fillText(tp.title, padX + 28, py + (isStory ? 72 : 54));

      ctx.font = `500 ${isStory ? '18px' : '14px'} Inter, system-ui, sans-serif`;
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText(tp.desc, padX + 28, py + (isStory ? 112 : 82));
    });

    drawFooterCta(ctx, spec.ctaText, width, height, padX, isStory, ['#f59e0b', '#ea580c', '#6366f1']);
    return canvas.toDataURL('image/png', 1.0);
  }

  // =========================================================================
  // PLATFORM STYLE 5: CLEAN MEDICAL TEAL — HEALTHCARE GAUGES
  // =========================================================================
  if (spec.layout === 'healthcare-gauge-bars') {
    const bg = ctx.createLinearGradient(0, 0, width, height);
    bg.addColorStop(0, '#f0fdfa');
    bg.addColorStop(0.5, '#e0f2fe');
    bg.addColorStop(1, '#eef2ff');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    let curY = drawBrandHeader(ctx, iconImg, width, padX, isStory ? 72 : 44, isStory, true);

    roundRect(ctx, padX, curY, 470, 40, 20);
    ctx.fillStyle = '#ccfbf1';
    ctx.fill();
    ctx.font = '800 16px Inter, system-ui, sans-serif';
    ctx.fillStyle = '#0f766e';
    ctx.fillText(spec.badge, padX + 20, curY + 26);
    curY += isStory ? 74 : 56;

    ctx.font = `900 ${isStory ? '52px' : '40px'} Inter, system-ui, sans-serif`;
    ctx.fillStyle = '#0f172a';
    curY = drawWrappedText(ctx, spec.headline, padX, curY, contentW, isStory ? 60 : 46, 2);
    curY += 6;

    ctx.font = `600 ${isStory ? '23px' : '18px'} Inter, system-ui, sans-serif`;
    ctx.fillStyle = '#334155';
    curY = drawWrappedText(ctx, spec.subheadline, padX, curY, contentW, isStory ? 32 : 25, 2);
    curY += isStory ? 28 : 16;

    const gBoxH = isStory ? 290 : 210;
    roundRect(ctx, padX, curY, contentW, gBoxH, 28);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    const gR = isStory ? 72 : 52;
    const gCy = curY + (isStory ? 125 : 90);
    drawCircularGauge(ctx, padX + contentW * 0.2, gCy, gR, 92, 'Hospital Quality', '#0d9488', '#ccfbf1', '#0f172a', '#0f766e');
    drawCircularGauge(ctx, padX + contentW * 0.5, gCy, gR, 95, 'English Doctors', '#4f46e5', '#e0e7ff', '#0f172a', '#4338ca');
    drawCircularGauge(ctx, padX + contentW * 0.8, gCy, gR, 84, 'Cost Savings %', '#f59e0b', '#fef3c7', '#0f172a', '#b45309');

    curY += gBoxH + (isStory ? 28 : 18);

    const mBoxH = isStory ? 670 : 460;
    roundRect(ctx, padX, curY, contentW, mBoxH, 28);
    ctx.fillStyle = '#0f172a';
    ctx.fill();

    ctx.font = `900 ${isStory ? '26px' : '20px'} Inter, system-ui, sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.fillText('🩺 Private Medical & Insurance Costs: US vs. Top Havens', padX + 36, curY + (isStory ? 54 : 40));

    const procedures = [
      { name: 'Private Specialist Consultation', us: '$280', haven: '$45', pct: 0.18 },
      { name: 'Full MRI Diagnostic Scan', us: '$2,400', haven: '$290', pct: 0.15 },
      { name: 'Porcelain Dental Crown', us: '$1,650', haven: '$320', pct: 0.22 },
      { name: 'Comprehensive Expat Health Policy (Age 60)', us: '$920/mo', haven: '$185/mo', pct: 0.24 },
    ];

    let py = curY + (isStory ? 110 : 80);
    procedures.forEach(p => {
      ctx.font = `800 ${isStory ? '21px' : '16px'} Inter, system-ui, sans-serif`;
      ctx.fillStyle = '#e2e8f0';
      ctx.fillText(p.name, padX + 36, py);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#fda4af';
      ctx.fillText(`US: ${p.us}`, padX + contentW - 230, py);
      ctx.fillStyle = '#5eead4';
      ctx.fillText(`Haven: ${p.haven}`, padX + contentW - 36, py);
      ctx.textAlign = 'left';

      roundRect(ctx, padX + 36, py + 14, contentW - 72, isStory ? 26 : 18, 10);
      ctx.fillStyle = 'rgba(244, 63, 94, 0.35)';
      ctx.fill();

      roundRect(ctx, padX + 36, py + 14, (contentW - 72) * p.pct, isStory ? 26 : 18, 10);
      ctx.fillStyle = '#14b8a6';
      ctx.fill();

      py += isStory ? 132 : 90;
    });

    drawFooterCta(ctx, spec.ctaText, width, height, padX, isStory, ['#0d9488', '#0284c7', '#4f46e5']);
    return canvas.toDataURL('image/png', 1.0);
  }

  // =========================================================================
  // PLATFORM STYLE 6: COMPARE STUDIO — 6-AXIS SPIDER RADAR CHART
  // =========================================================================
  if (spec.layout === 'compare-radar-matrix') {
    const bg = ctx.createLinearGradient(0, 0, width, height);
    bg.addColorStop(0, '#2e1065');
    bg.addColorStop(0.5, '#1e1b4b');
    bg.addColorStop(1, '#0f172a');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    let curY = drawBrandHeader(ctx, iconImg, width, padX, isStory ? 72 : 44, isStory, false);

    roundRect(ctx, padX, curY, 470, 40, 20);
    ctx.fillStyle = 'rgba(192, 132, 252, 0.22)';
    ctx.fill();
    ctx.font = '800 16px Inter, system-ui, sans-serif';
    ctx.fillStyle = '#e9d5ff';
    ctx.fillText(spec.badge, padX + 20, curY + 26);
    curY += isStory ? 74 : 56;

    ctx.font = `900 ${isStory ? '52px' : '40px'} Inter, system-ui, sans-serif`;
    ctx.fillStyle = '#ffffff';
    curY = drawWrappedText(ctx, spec.headline, padX, curY, contentW, isStory ? 60 : 46, 2);
    curY += 6;

    ctx.font = `500 ${isStory ? '23px' : '18px'} Inter, system-ui, sans-serif`;
    ctx.fillStyle = '#ddd6fe';
    curY = drawWrappedText(ctx, spec.subheadline, padX, curY, contentW, isStory ? 32 : 25, 2);
    curY += isStory ? 22 : 12;

    const radarBoxH = isStory ? 520 : 350;
    roundRect(ctx, padX, curY, contentW, radarBoxH, 28);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.07)';
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(167, 139, 250, 0.4)';
    ctx.stroke();

    const rCx = width / 2;
    const rCy = curY + radarBoxH / 2 + 12;
    const rMax = isStory ? 175 : 118;
    const axes = ['Affordability', 'Healthcare', 'Safety', 'Visa Ease', 'Sunshine', 'English'];

    [0.35, 0.68, 1].forEach(level => {
      ctx.beginPath();
      axes.forEach((_, idx) => {
        const ang = -Math.PI / 2 + (idx * Math.PI * 2) / 6;
        const px = rCx + Math.cos(ang) * rMax * level;
        const py = rCy + Math.sin(ang) * rMax * level;
        if (idx === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.closePath();
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    axes.forEach((label, idx) => {
      const ang = -Math.PI / 2 + (idx * Math.PI * 2) / 6;
      const lx = rCx + Math.cos(ang) * (rMax + 46);
      const ly = rCy + Math.sin(ang) * (rMax + 30);
      ctx.textAlign = 'center';
      ctx.font = `800 ${isStory ? '18px' : '14px'} Inter, system-ui, sans-serif`;
      ctx.fillStyle = '#e2e8f0';
      ctx.fillText(label, lx, ly + 6);
    });
    ctx.textAlign = 'left';

    const poly1 = [0.78, 0.92, 0.94, 0.86, 0.88, 0.85];
    const poly2 = [0.96, 0.86, 0.82, 0.9, 0.92, 0.72];

    const drawPoly = (vals: number[], stroke: string, fill: string) => {
      ctx.beginPath();
      vals.forEach((v, idx) => {
        const ang = -Math.PI / 2 + (idx * Math.PI * 2) / 6;
        const px = rCx + Math.cos(ang) * rMax * v;
        const py = rCy + Math.sin(ang) * rMax * v;
        if (idx === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = stroke;
      ctx.stroke();
    };

    drawPoly(poly1, '#38bdf8', 'rgba(56, 189, 248, 0.28)');
    drawPoly(poly2, '#fbbf24', 'rgba(251, 191, 36, 0.25)');

    curY += radarBoxH + (isStory ? 28 : 16);

    const tableH = isStory ? 440 : 310;
    roundRect(ctx, padX, curY, contentW, tableH, 28);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    const cols = ['Metric', '🇵🇹 Portugal', '🇪🇸 Spain', '🇹🇭 Thailand'];
    const colOffsets = [padX + 34, padX + 330, padX + 560, padX + 770];

    ctx.font = `900 ${isStory ? '22px' : '18px'} Inter, system-ui, sans-serif`;
    cols.forEach((c, i) => {
      ctx.fillStyle = i === 0 ? '#64748b' : '#0f172a';
      ctx.fillText(c, colOffsets[i], curY + (isStory ? 54 : 40));
    });

    const matrixRows = [
      ['Couple Budget', '$2,150/mo', '$2,350/mo', '$1,450/mo'],
      ['Min Visa Income', '$1,050/mo', '$2,600/mo', '$1,850/mo'],
      ['Healthcare Score', '89 / 100', '93 / 100', '86 / 100'],
      ['Safety Index', '92 / 100', '89 / 100', '82 / 100'],
      ['Foreign Tax', '10–28% DTA', 'Beckham / DTA', '0% LTR / Remit'],
    ];

    matrixRows.forEach((r, rIdx) => {
      const ry = curY + (isStory ? 115 : 82) + rIdx * (isStory ? 66 : 46);
      if (rIdx % 2 === 0) {
        roundRect(ctx, padX + 20, ry - (isStory ? 34 : 24), contentW - 40, isStory ? 52 : 36, 12);
        ctx.fillStyle = '#f8fafc';
        ctx.fill();
      }
      r.forEach((cell, cIdx) => {
        ctx.font = `${cIdx === 0 ? '700' : '800'} ${isStory ? '20px' : '16px'} Inter, system-ui, sans-serif`;
        ctx.fillStyle = cIdx === 0 ? '#475569' : '#1e1b4b';
        ctx.fillText(cell, colOffsets[cIdx], ry);
      });
    });

    drawFooterCta(ctx, spec.ctaText, width, height, padX, isStory, ['#ec4899', '#8b5cf6', '#06b6d4']);
    return canvas.toDataURL('image/png', 1.0);
  }

  // =========================================================================
  // PLATFORM STYLE 7: LIFESTYLE, DATING & COMMUNITY
  // =========================================================================
  if (spec.layout === 'dating-flags-meetup') {
    const bg = ctx.createLinearGradient(0, 0, width, height);
    bg.addColorStop(0, '#fff1f2');
    bg.addColorStop(0.5, '#f8fafc');
    bg.addColorStop(1, '#eef2ff');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    let curY = drawBrandHeader(ctx, iconImg, width, padX, isStory ? 72 : 44, isStory, true);

    roundRect(ctx, padX, curY, 480, 40, 20);
    ctx.fillStyle = '#ffe4e6';
    ctx.fill();
    ctx.font = '800 16px Inter, system-ui, sans-serif';
    ctx.fillStyle = '#be123c';
    ctx.fillText(spec.badge, padX + 20, curY + 26);
    curY += isStory ? 74 : 56;

    ctx.font = `900 ${isStory ? '50px' : '38px'} Inter, system-ui, sans-serif`;
    ctx.fillStyle = '#0f172a';
    curY = drawWrappedText(ctx, spec.headline, padX, curY, contentW, isStory ? 58 : 44, 2);
    curY += 6;

    ctx.font = `600 ${isStory ? '22px' : '18px'} Inter, system-ui, sans-serif`;
    ctx.fillStyle = '#475569';
    curY = drawWrappedText(ctx, spec.subheadline, padX, curY, contentW, isStory ? 32 : 25, 2);
    curY += isStory ? 26 : 16;

    const splitW = (contentW - 24) / 2;
    const splitH = isStory ? 620 : 420;

    roundRect(ctx, padX, curY, splitW, splitH, 28);
    ctx.fillStyle = '#ecfdf5';
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#34d399';
    ctx.stroke();

    ctx.font = `900 ${isStory ? '24px' : '19px'} Inter, system-ui, sans-serif`;
    ctx.fillStyle = '#065f46';
    ctx.fillText('✅ Completely Normal Culture', padX + 26, curY + (isStory ? 50 : 38));

    const greenItems = [
      '• Covering the restaurant bill when you invite a date out',
      '• Daily check-in messages & warm family closeness',
      '• Daytime coffee, beach walks, padel & language clubs',
      '• Dressing smart-casual & keeping calm ("saving face")',
    ];
    let gy = curY + (isStory ? 105 : 76);
    ctx.font = `600 ${isStory ? '20px' : '15px'} Inter, system-ui, sans-serif`;
    ctx.fillStyle = '#064e3b';
    greenItems.forEach(item => {
      gy = drawWrappedText(ctx, item, padX + 26, gy, splitW - 52, isStory ? 30 : 22, 3) + (isStory ? 24 : 14);
    });

    const rx = padX + splitW + 24;
    roundRect(ctx, rx, curY, splitW, splitH, 28);
    ctx.fillStyle = '#fff1f2';
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#fb7185';
    ctx.stroke();

    ctx.font = `900 ${isStory ? '24px' : '19px'} Inter, system-ui, sans-serif`;
    ctx.fillStyle = '#9f1239';
    ctx.fillText('🚩 Red Flags (Walk Away!)', rx + 26, curY + (isStory ? 50 : 38));

    const redItems = [
      '• Asking for cash for a "sick relative" or emergency bill',
      '• Pressure to buy property or a car in a new partner’s name',
      '• Insisting on an unknown bar with padded bottle bills',
      '• Online matches pitching crypto or forex investments',
    ];
    let ry = curY + (isStory ? 105 : 76);
    ctx.font = `600 ${isStory ? '20px' : '15px'} Inter, system-ui, sans-serif`;
    ctx.fillStyle = '#881337';
    redItems.forEach(item => {
      ry = drawWrappedText(ctx, item, rx + 26, ry, splitW - 52, isStory ? 30 : 22, 3) + (isStory ? 24 : 14);
    });

    curY += splitH + (isStory ? 32 : 20);

    const passH = isStory ? 310 : 210;
    roundRect(ctx, padX, curY, contentW, passH, 28);
    ctx.fillStyle = '#1e1b4b';
    ctx.fill();

    ctx.font = `800 ${isStory ? '17px' : '14px'} Inter, system-ui, sans-serif`;
    ctx.fillStyle = '#2dd4bf';
    ctx.fillText('🤝 VERIFIED EXPAT CITIES, PEER MENTORS & LOCAL MEETUPS', padX + 34, curY + (isStory ? 48 : 36));

    ctx.font = `900 ${isStory ? '30px' : '22px'} Inter, system-ui, sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.fillText('Connect 1-on-1 with Retirees Already Living Abroad', padX + 34, curY + (isStory ? 96 : 70));

    const pills = ['💬 Direct Expat Chat', '☕ Monthly City Meetups', '📍 600+ Expat Town Guides'];
    pills.forEach((p, idx) => {
      const px = padX + 34 + idx * 305;
      const py = curY + (isStory ? 140 : 96);
      roundRect(ctx, px, py, 285, isStory ? 56 : 42, 16);
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      ctx.fill();
      ctx.font = `800 ${isStory ? '18px' : '15px'} Inter, system-ui, sans-serif`;
      ctx.fillStyle = '#fde68a';
      ctx.fillText(p, px + 20, py + (isStory ? 35 : 27));
    });

    drawFooterCta(ctx, spec.ctaText, width, height, padX, isStory, ['#e11d48', '#f97316', '#4f46e5']);
    return canvas.toDataURL('image/png', 1.0);
  }

  // =========================================================================
  // COUNTRY DOSSIER PACK SLIDES (SLIDES 1 TO 8)
  // =========================================================================
  const cd = spec.countryData;
  const photoCfg = getCountryPhotoConfig(cd?.id || 'portugal', cd?.imageUrl);
  const [heroImg, flagImg] = await Promise.all([
    spec.layout === 'country-magazine-cover'
      ? loadExternalImageWithFallbacks(photoCfg.candidateUrls)
      : Promise.resolve(null),
    cd?.code
      ? loadExternalImage(`https://flagcdn.com/w160/${cd.code.toLowerCase()}.png`)
      : Promise.resolve(null),
  ]);

  // -------------------------------------------------------------------------
  // COUNTRY SLIDE 2: COST OF LIVING, RENT & ARBITRAGE DONUT/BAR INFOGRAPHIC
  // -------------------------------------------------------------------------
  if (spec.layout === 'country-cost-donut' && cd) {
    const bg = ctx.createLinearGradient(0, 0, width, height);
    bg.addColorStop(0, '#fffbeb');
    bg.addColorStop(0.5, '#f0fdf4');
    bg.addColorStop(1, '#f0f9ff');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    let curY = drawBrandHeader(ctx, iconImg, width, padX, isStory ? 68 : 40, isStory, true);
    curY = drawCountrySlideTopHeader(
      ctx,
      spec,
      flagImg,
      padX,
      contentW,
      curY,
      isStory,
      true,
      '#dcfce7',
      '#065f46'
    );

    // Top Card: Multi-Segment Donut Breakdown of Monthly Living Costs
    const donutCardH = isStory ? 540 : 370;
    roundRect(ctx, padX, curY, contentW, donutCardH, 28);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#d1fae5';
    ctx.stroke();

    ctx.font = `900 ${isStory ? '26px' : '20px'} Inter, system-ui, sans-serif`;
    ctx.fillStyle = '#0f172a';
    ctx.fillText(
      `🍩 ${cd.name} Monthly Living Cost Breakdown (Single vs. Couple)`,
      padX + 34,
      curY + (isStory ? 50 : 38)
    );

    const rentCenter = cd.rentCenter || Math.round(cd.singleBudget * 0.42);
    const utilities = cd.utilitiesMonthly || 110;
    const health = cd.healthcareMonthly || 95;
    const foodAndLeisure = Math.max(250, cd.singleBudget - rentCenter - utilities - health);
    const totalCalc = rentCenter + utilities + health + foodAndLeisure;

    const slices = [
      { label: '1-Bed City Center Rent', amount: `$${rentCenter}/mo`, pct: rentCenter / totalCalc, color: '#4f46e5' },
      { label: 'Groceries, Dining & Lifestyle', amount: `$${foodAndLeisure}/mo`, pct: foodAndLeisure / totalCalc, color: '#10b981' },
      { label: 'Utilities, Fiber & Mobile', amount: `$${utilities}/mo`, pct: utilities / totalCalc, color: '#f59e0b' },
      { label: 'Private Healthcare / Policy', amount: `$${health}/mo`, pct: health / totalCalc, color: '#ec4899' },
    ];

    const dCx = padX + (isStory ? 210 : 170);
    const dCy = curY + (isStory ? 305 : 215);
    const dR = isStory ? 140 : 98;

    let ang = -Math.PI / 2;
    slices.forEach(s => {
      const sweep = s.pct * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(dCx, dCy, dR, ang, ang + sweep);
      ctx.strokeStyle = s.color;
      ctx.lineWidth = isStory ? 44 : 32;
      ctx.stroke();
      ang += sweep;
    });

    ctx.textAlign = 'center';
    ctx.font = `900 ${isStory ? '34px' : '25px'} Inter, system-ui, sans-serif`;
    ctx.fillStyle = '#0f172a';
    ctx.fillText(`$${cd.singleBudget.toLocaleString()}`, dCx, dCy + 6);
    ctx.font = `700 ${isStory ? '15px' : '12px'} Inter, system-ui, sans-serif`;
    ctx.fillStyle = '#64748b';
    ctx.fillText('SINGLE / MO', dCx, dCy + 30);
    ctx.textAlign = 'left';

    const legX = padX + (isStory ? 405 : 320);
    let legY = curY + (isStory ? 130 : 94);
    slices.forEach(s => {
      roundRect(ctx, legX, legY - 18, 22, 22, 6);
      ctx.fillStyle = s.color;
      ctx.fill();

      ctx.font = `800 ${isStory ? '21px' : '16px'} Inter, system-ui, sans-serif`;
      ctx.fillStyle = '#0f172a';
      ctx.fillText(s.label, legX + 34, legY);

      ctx.textAlign = 'right';
      ctx.font = `900 ${isStory ? '22px' : '17px'} Inter, system-ui, sans-serif`;
      ctx.fillStyle = '#0f766e';
      ctx.fillText(s.amount, padX + contentW - 34, legY);
      ctx.textAlign = 'left';

      legY += isStory ? 76 : 54;
    });

    // Sub-strip inside Donut Card: Outside Center Rent + Meal Cost + Groceries Index
    const stripY = curY + donutCardH - (isStory ? 84 : 60);
    roundRect(ctx, padX + 28, stripY, contentW - 56, isStory ? 62 : 44, 16);
    ctx.fillStyle = '#f8fafc';
    ctx.fill();
    ctx.font = `800 ${isStory ? '19px' : '15px'} Inter, system-ui, sans-serif`;
    ctx.fillStyle = '#334155';
    ctx.textAlign = 'center';
    ctx.fillText(
      `🏠 Outside Center 1-Bed: $${cd.rentOutside}/mo   ·   🍽️ Local Meal: $${cd.mealInexpensive}   ·   🛒 Groceries Index: ${cd.groceriesIndex}/100`,
      width / 2,
      stripY + (isStory ? 38 : 28)
    );
    ctx.textAlign = 'left';

    curY += donutCardH + (isStory ? 28 : 16);

    // Bottom Card: Couple Budget vs US/UK Geographic Arbitrage Bar Comparison
    const arbCardH = isStory ? 440 : 295;
    roundRect(ctx, padX, curY, contentW, arbCardH, 28);
    ctx.fillStyle = '#064e3b';
    ctx.fill();

    ctx.font = `900 ${isStory ? '25px' : '19px'} Inter, system-ui, sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(
      `💰 Geographic Arbitrage: Retiring in ${cd.name} vs. US / UK`,
      padX + 34,
      curY + (isStory ? 50 : 36)
    );

    const usCoupleAnnual = 67200; // $5,600/mo
    const countryCoupleAnnual = cd.coupleBudget * 12;
    const annualSaved = Math.max(6000, usCoupleAnnual - countryCoupleAnnual);
    const ratio = Math.min(0.92, Math.max(0.22, countryCoupleAnnual / usCoupleAnnual));

    const b1Y = curY + (isStory ? 96 : 66);
    ctx.font = `800 ${isStory ? '19px' : '15px'} Inter, system-ui, sans-serif`;
    ctx.fillStyle = '#fecdd3';
    ctx.fillText('🇺🇸 🇬🇧 US / UK Couple Retirement Benchmark ($5,600/mo)', padX + 34, b1Y);
    roundRect(ctx, padX + 34, b1Y + 12, contentW - 68, isStory ? 48 : 34, 12);
    ctx.fillStyle = '#f43f5e';
    ctx.fill();
    ctx.font = `900 ${isStory ? '22px' : '16px'} Inter, system-ui, sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.fillText('$67,200 / year', padX + 52, b1Y + (isStory ? 44 : 35));

    const b2Y = b1Y + (isStory ? 108 : 74);
    ctx.font = `800 ${isStory ? '19px' : '15px'} Inter, system-ui, sans-serif`;
    ctx.fillStyle = '#a7f3d0';
    ctx.fillText(
      `${cd.flag} ${cd.name} Couple Retirement Budget ($${cd.coupleBudget.toLocaleString()}/mo)`,
      padX + 34,
      b2Y
    );
    roundRect(ctx, padX + 34, b2Y + 12, (contentW - 68) * ratio, isStory ? 48 : 34, 12);
    ctx.fillStyle = '#10b981';
    ctx.fill();
    ctx.font = `900 ${isStory ? '22px' : '16px'} Inter, system-ui, sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`$${countryCoupleAnnual.toLocaleString()} / yr`, padX + 52, b2Y + (isStory ? 44 : 35));

    const calloutY = b2Y + (isStory ? 86 : 60);
    roundRect(ctx, padX + 34, calloutY, contentW - 68, isStory ? 72 : 50, 18);
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#34d399';
    ctx.stroke();
    ctx.textAlign = 'center';
    ctx.font = `900 ${isStory ? '24px' : '18px'} Inter, system-ui, sans-serif`;
    ctx.fillStyle = '#fde68a';
    ctx.fillText(
      `✨ SAVE +$${annualSaved.toLocaleString()}/YEAR (+$${(annualSaved * 15).toLocaleString()} OVER 15 YEARS)`,
      width / 2,
      calloutY + (isStory ? 45 : 32)
    );
    ctx.textAlign = 'left';

    drawFooterCta(ctx, spec.ctaText, width, height, padX, isStory, ['#059669', '#0d9488', '#4f46e5']);
    return canvas.toDataURL('image/png', 1.0);
  }

  // -------------------------------------------------------------------------
  // COUNTRY SLIDE 3: RETIREMENT VISA, PR PATHWAY & TAX VERDICT
  // -------------------------------------------------------------------------
  if (spec.layout === 'country-visa-timeline' && cd) {
    const bg = ctx.createLinearGradient(0, 0, width, height);
    bg.addColorStop(0, '#0f172a');
    bg.addColorStop(0.5, '#1e293b');
    bg.addColorStop(1, '#1c1917');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    let curY = drawBrandHeader(ctx, iconImg, width, padX, isStory ? 68 : 40, isStory, false);
    curY = drawCountrySlideTopHeader(
      ctx,
      spec,
      flagImg,
      padX,
      contentW,
      curY,
      isStory,
      false,
      'rgba(245, 158, 11, 0.22)',
      '#fcd34d'
    );

    // 3 KPI Pillars: Min Income, Processing Time, Difficulty Meter
    const kpiGap = 20;
    const kpiW = (contentW - kpiGap * 2) / 3;
    const kpiH = isStory ? 185 : 132;

    const kpis = [
      {
        label: 'MINIMUM PASSIVE INCOME',
        val: `$${cd.minIncome.toLocaleString()}/mo`,
        sub: `$${(cd.minIncome * 12).toLocaleString()} / year required`,
        col: '#34d399',
      },
      {
        label: 'PROCESSING TIMELINE',
        val: `~${cd.processingMonths} Months`,
        sub: cd.allowedToWork ? 'Work Permitted' : 'Passive / Non-Lucrative',
        col: '#38bdf8',
      },
      {
        label: 'BUREAUCRACY DIFFICULTY',
        val: `${cd.difficultyRating} / 5`,
        sub: cd.difficultyRating <= 2 ? 'Streamlined Consular Process' : 'Moderate Paperwork',
        col: '#fbbf24',
      },
    ];

    kpis.forEach((k, idx) => {
      const kx = padX + idx * (kpiW + kpiGap);
      roundRect(ctx, kx, curY, kpiW, kpiH, 24);
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = k.col;
      ctx.stroke();

      ctx.font = `800 ${isStory ? '14px' : '11px'} Inter, system-ui, sans-serif`;
      ctx.fillStyle = k.col;
      ctx.fillText(k.label, kx + 22, curY + (isStory ? 38 : 28));

      ctx.font = `900 ${isStory ? '36px' : '26px'} Inter, system-ui, sans-serif`;
      ctx.fillStyle = '#ffffff';
      ctx.fillText(k.val, kx + 22, curY + (isStory ? 96 : 68));

      ctx.font = `600 ${isStory ? '16px' : '13px'} Inter, system-ui, sans-serif`;
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText(k.sub, kx + 22, curY + (isStory ? 142 : 102));
    });

    curY += kpiH + (isStory ? 26 : 16);

    // Consular Requirements Checklist Card
    const reqCardH = isStory ? 430 : 295;
    roundRect(ctx, padX, curY, contentW, reqCardH, 28);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.font = `900 ${isStory ? '25px' : '19px'} Inter, system-ui, sans-serif`;
    ctx.fillStyle = '#0f172a';
    ctx.fillText(`🛂 Key Consular Requirements & PR Pathway`, padX + 34, curY + (isStory ? 48 : 36));

    const reqs =
      cd.keyRequirements.length > 0
        ? cd.keyRequirements.slice(0, 4)
        : [
            `Proof of $${cd.minIncome.toLocaleString()}/mo passive pension or investment income`,
            'Apostilled federal background check & clean criminal record',
            'Private health insurance policy with full local coverage',
            'Long-term lease agreement or local address registration',
          ];

    let ry = curY + (isStory ? 96 : 68);
    reqs.forEach((req, idx) => {
      roundRect(ctx, padX + 34, ry - (isStory ? 28 : 22), 34, 34, 10);
      ctx.fillStyle = '#eef2ff';
      ctx.fill();
      ctx.font = '900 16px Inter, system-ui, sans-serif';
      ctx.fillStyle = '#4f46e5';
      ctx.textAlign = 'center';
      ctx.fillText(`${idx + 1}`, padX + 51, ry - (isStory ? 5 : 0));
      ctx.textAlign = 'left';

      ctx.font = `700 ${isStory ? '20px' : '16px'} Inter, system-ui, sans-serif`;
      ctx.fillStyle = '#1e293b';
      drawWrappedText(ctx, req, padX + 82, ry - (isStory ? 4 : 0), contentW - 116, isStory ? 26 : 20, 2);
      ry += isStory ? 66 : 45;
    });

    // PR Pathway Banner inside White Card
    const prY = curY + reqCardH - (isStory ? 84 : 58);
    roundRect(ctx, padX + 28, prY, contentW - 56, isStory ? 62 : 42, 16);
    ctx.fillStyle = '#f0fdf4';
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#86efac';
    ctx.stroke();
    ctx.font = `800 ${isStory ? '19px' : '15px'} Inter, system-ui, sans-serif`;
    ctx.fillStyle = '#065f46';
    drawWrappedText(
      ctx,
      `🏆 PR & Citizenship: ${cd.pathwayToPR}`,
      padX + 46,
      prY + (isStory ? 38 : 27),
      contentW - 92,
      24,
      1
    );

    curY += reqCardH + (isStory ? 26 : 16);

    // Bottom Tax Regime Verdict Box
    const taxBoxH = isStory ? 330 : 220;
    roundRect(ctx, padX, curY, contentW, taxBoxH, 28);
    ctx.fillStyle = 'rgba(30, 41, 59, 0.95)';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#f59e0b';
    ctx.stroke();

    ctx.font = `800 ${isStory ? '17px' : '14px'} Inter, system-ui, sans-serif`;
    ctx.fillStyle = '#fcd34d';
    ctx.fillText(`⚖️ ${cd.name.toUpperCase()} EXPAT TAX REGIME & FOREIGN PENSION VERDICT`, padX + 34, curY + (isStory ? 48 : 34));

    ctx.font = `600 ${isStory ? '22px' : '17px'} Inter, system-ui, sans-serif`;
    ctx.fillStyle = '#f8fafc';
    drawWrappedText(
      ctx,
      cd.taxStatus,
      padX + 34,
      curY + (isStory ? 96 : 66),
      contentW - 68,
      isStory ? 34 : 25,
      4
    );

    ctx.font = `700 ${isStory ? '18px' : '14px'} Inter, system-ui, sans-serif`;
    ctx.fillStyle = '#5eead4';
    ctx.fillText(
      `💱 Local Currency: ${cd.currency} (${cd.currencySymbol})   ·   🗣️ Official Language: ${cd.language}`,
      padX + 34,
      curY + taxBoxH - (isStory ? 36 : 24)
    );

    drawFooterCta(ctx, spec.ctaText, width, height, padX, isStory, ['#f59e0b', '#ea580c', '#4f46e5']);
    return canvas.toDataURL('image/png', 1.0);
  }

  // -------------------------------------------------------------------------
  // COUNTRY SLIDE 4: 6-AXIS SPIDER RADAR & TOP 3 EXPAT CITIES
  // -------------------------------------------------------------------------
  if (spec.layout === 'country-cities-radar' && cd) {
    const bg = ctx.createLinearGradient(0, 0, width, height);
    bg.addColorStop(0, '#1e1b4b');
    bg.addColorStop(0.55, '#0f172a');
    bg.addColorStop(1, '#042f2e');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    let curY = drawBrandHeader(ctx, iconImg, width, padX, isStory ? 68 : 40, isStory, false);
    curY = drawCountrySlideTopHeader(
      ctx,
      spec,
      flagImg,
      padX,
      contentW,
      curY,
      isStory,
      false,
      'rgba(56, 189, 248, 0.22)',
      '#7dd3fc'
    );

    // 6-Axis Radar Polygon Box for this Country
    const radarH = isStory ? 470 : 320;
    roundRect(ctx, padX, curY, contentW, radarH, 28);
    ctx.fillStyle = 'rgba(255,255,255,0.07)';
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(94, 234, 212, 0.35)';
    ctx.stroke();

    const rCx = width / 2;
    const rCy = curY + radarH / 2 + 10;
    const rMax = isStory ? 155 : 104;

    const affordScore = Math.min(98, Math.max(45, Math.round(100 - (cd.singleBudget - 900) / 38)));
    const visaEaseScore = Math.min(96, Math.max(40, (6 - cd.difficultyRating) * 19));
    const sunScore = Math.min(98, Math.max(45, Math.round((cd.sunnyDays / 340) * 100)));

    const axes = [
      { label: `Affordability (${affordScore})`, val: affordScore / 100 },
      { label: `Healthcare (${cd.healthcareScore})`, val: cd.healthcareScore / 100 },
      { label: `Safety (${cd.safetyScore})`, val: cd.safetyScore / 100 },
      { label: `Walkability (${cd.walkabilityScore})`, val: cd.walkabilityScore / 100 },
      { label: `Sunshine (${sunScore})`, val: sunScore / 100 },
      { label: `Visa Ease (${visaEaseScore})`, val: visaEaseScore / 100 },
    ];

    [0.35, 0.68, 1].forEach(level => {
      ctx.beginPath();
      axes.forEach((_, idx) => {
        const ang = -Math.PI / 2 + (idx * Math.PI * 2) / 6;
        const px = rCx + Math.cos(ang) * rMax * level;
        const py = rCy + Math.sin(ang) * rMax * level;
        if (idx === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.closePath();
      ctx.strokeStyle = 'rgba(255,255,255,0.18)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    axes.forEach((a, idx) => {
      const ang = -Math.PI / 2 + (idx * Math.PI * 2) / 6;
      const lx = rCx + Math.cos(ang) * (rMax + 58);
      const ly = rCy + Math.sin(ang) * (rMax + 30);
      ctx.textAlign = 'center';
      ctx.font = `800 ${isStory ? '17px' : '13px'} Inter, system-ui, sans-serif`;
      ctx.fillStyle = '#e2e8f0';
      ctx.fillText(a.label, lx, ly + 6);
    });
    ctx.textAlign = 'left';

    ctx.beginPath();
    axes.forEach((a, idx) => {
      const ang = -Math.PI / 2 + (idx * Math.PI * 2) / 6;
      const px = rCx + Math.cos(ang) * rMax * a.val;
      const py = rCy + Math.sin(ang) * rMax * a.val;
      if (idx === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.closePath();
    ctx.fillStyle = 'rgba(45, 212, 191, 0.32)';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#2dd4bf';
    ctx.stroke();

    curY += radarH + (isStory ? 26 : 16);

    // Top 3 Expat Towns Cards
    const cityColors = ['#2dd4bf', '#818cf8', '#fbbf24'];
    const cityH = isStory ? 162 : 112;
    (cd.topCities || []).slice(0, 3).forEach((city, idx) => {
      const cy = curY + idx * (cityH + (isStory ? 18 : 12));
      roundRect(ctx, padX, cy, contentW, cityH, 24);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      roundRect(ctx, padX + 24, cy + (isStory ? 26 : 18), 44, 44, 14);
      ctx.fillStyle = cityColors[idx % cityColors.length];
      ctx.fill();
      ctx.textAlign = 'center';
      ctx.font = '900 20px Inter, system-ui, sans-serif';
      ctx.fillStyle = '#0f172a';
      ctx.fillText(`#${idx + 1}`, padX + 46, cy + (isStory ? 55 : 47));
      ctx.textAlign = 'left';

      ctx.font = `900 ${isStory ? '28px' : '21px'} Inter, system-ui, sans-serif`;
      ctx.fillStyle = '#0f172a';
      ctx.fillText(`📍 ${city.name}`, padX + 84, cy + (isStory ? 50 : 38));

      ctx.font = `700 ${isStory ? '19px' : '15px'} Inter, system-ui, sans-serif`;
      ctx.fillStyle = '#4f46e5';
      ctx.fillText(city.vibe, padX + 84, cy + (isStory ? 84 : 64));

      if (city.highlight) {
        ctx.font = `500 ${isStory ? '17px' : '13px'} Inter, system-ui, sans-serif`;
        ctx.fillStyle = '#475569';
        drawWrappedText(ctx, city.highlight, padX + 84, cy + (isStory ? 118 : 88), contentW - 290, 22, 1);
      }

      // Monthly cost pill on right
      const costW = 185;
      roundRect(ctx, padX + contentW - costW - 26, cy + (isStory ? 34 : 22), costW, isStory ? 64 : 48, 16);
      ctx.fillStyle = '#f0fdfa';
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#99f6e4';
      ctx.stroke();
      ctx.textAlign = 'center';
      ctx.font = `900 ${isStory ? '26px' : '20px'} Inter, system-ui, sans-serif`;
      ctx.fillStyle = '#0f766e';
      ctx.fillText(`~$${city.monthlyCostUSD}/mo`, padX + contentW - costW / 2 - 26, cy + (isStory ? 74 : 53));
      ctx.textAlign = 'left';
    });

    drawFooterCta(ctx, spec.ctaText, width, height, padX, isStory, ['#14b8a6', '#6366f1', '#a855f7']);
    return canvas.toDataURL('image/png', 1.0);
  }

  // -------------------------------------------------------------------------
  // COUNTRY SLIDE 5: HEALTHCARE QUALITY, PUBLIC/PRIVATE ACCESS & SAFETY
  // -------------------------------------------------------------------------
  if (spec.layout === 'country-healthcare-access' && cd) {
    const bg = ctx.createLinearGradient(0, 0, width, height);
    bg.addColorStop(0, '#f0fdfa');
    bg.addColorStop(0.5, '#e0f2fe');
    bg.addColorStop(1, '#eef2ff');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    let curY = drawBrandHeader(ctx, iconImg, width, padX, isStory ? 68 : 40, isStory, true);
    curY = drawCountrySlideTopHeader(
      ctx,
      spec,
      flagImg,
      padX,
      contentW,
      curY,
      isStory,
      true,
      '#ccfbf1',
      '#0f766e'
    );

    // 3 Circular Quality Gauges
    const gBoxH = isStory ? 275 : 195;
    roundRect(ctx, padX, curY, contentW, gBoxH, 28);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    const gR = isStory ? 68 : 48;
    const gCy = curY + (isStory ? 118 : 84);
    drawCircularGauge(ctx, padX + contentW * 0.2, gCy, gR, cd.healthcareScore, 'Healthcare Score', '#0d9488', '#ccfbf1', '#0f172a', '#0f766e');
    drawCircularGauge(ctx, padX + contentW * 0.5, gCy, gR, cd.safetyScore, 'Safety Index', '#4f46e5', '#e0e7ff', '#0f172a', '#4338ca');
    drawCircularGauge(ctx, padX + contentW * 0.8, gCy, gR, cd.walkabilityScore, 'Walkability', '#f59e0b', '#fef3c7', '#0f172a', '#b45309');

    curY += gBoxH + (isStory ? 24 : 16);

    // Medical System & Public Access Cards
    const medCardH = isStory ? 420 : 285;
    roundRect(ctx, padX, curY, contentW, medCardH, 28);
    ctx.fillStyle = '#0f172a';
    ctx.fill();

    ctx.font = `800 ${isStory ? '17px' : '13px'} Inter, system-ui, sans-serif`;
    ctx.fillStyle = '#5eead4';
    ctx.fillText(`🏥 HOSPITAL INFRASTRUCTURE & PRIVATE CARE SUMMARY`, padX + 34, curY + (isStory ? 48 : 34));

    ctx.font = `600 ${isStory ? '22px' : '17px'} Inter, system-ui, sans-serif`;
    ctx.fillStyle = '#f8fafc';
    let my = drawWrappedText(
      ctx,
      cd.healthcareSummary,
      padX + 34,
      curY + (isStory ? 92 : 64),
      contentW - 68,
      isStory ? 32 : 24,
      3
    );

    my += isStory ? 24 : 14;
    roundRect(ctx, padX + 34, my, contentW - 68, isStory ? 145 : 102, 20);
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#38bdf8';
    ctx.stroke();

    ctx.font = `800 ${isStory ? '16px' : '13px'} Inter, system-ui, sans-serif`;
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('🩺 PUBLIC HEALTHCARE ACCESS FOR FOREIGN RESIDENTS', padX + 56, my + (isStory ? 38 : 28));

    ctx.font = `600 ${isStory ? '20px' : '15px'} Inter, system-ui, sans-serif`;
    ctx.fillStyle = '#e2e8f0';
    drawWrappedText(
      ctx,
      cd.publicHealthcareAccess,
      padX + 56,
      my + (isStory ? 76 : 54),
      contentW - 112,
      isStory ? 28 : 20,
      2
    );

    curY += medCardH + (isStory ? 24 : 16);

    // Bottom 3 Metric Pills: Monthly Insurance Cost, English Proficiency, Expat Community Size
    const botH = isStory ? 255 : 175;
    roundRect(ctx, padX, curY, contentW, botH, 28);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    const cols = [
      { label: 'EST. HEALTHCARE / MO', val: `$${cd.healthcareMonthly}/mo`, sub: 'vs. $920/mo US Avg', col: '#0d9488' },
      { label: 'ENGLISH PROFICIENCY', val: cd.englishProficiency, sub: `Official: ${cd.language}`, col: '#4f46e5' },
      { label: 'EXPAT COMMUNITY', val: cd.expatCommunitySize, sub: 'Active Expat Networks', col: '#e11d48' },
    ];
    const cW = (contentW - 68) / 3;
    cols.forEach((c, idx) => {
      const cx = padX + 34 + idx * cW;
      ctx.font = `800 ${isStory ? '15px' : '12px'} Inter, system-ui, sans-serif`;
      ctx.fillStyle = '#64748b';
      ctx.fillText(c.label, cx, curY + (isStory ? 62 : 44));

      ctx.font = `900 ${isStory ? '32px' : '22px'} Inter, system-ui, sans-serif`;
      ctx.fillStyle = c.col;
      drawWrappedText(ctx, c.val, cx, curY + (isStory ? 116 : 82), cW - 18, isStory ? 36 : 26, 2);

      ctx.font = `600 ${isStory ? '17px' : '13px'} Inter, system-ui, sans-serif`;
      ctx.fillStyle = '#475569';
      ctx.fillText(c.sub, cx, curY + botH - (isStory ? 40 : 28));
    });

    drawFooterCta(ctx, spec.ctaText, width, height, padX, isStory, ['#0d9488', '#0284c7', '#4f46e5']);
    return canvas.toDataURL('image/png', 1.0);
  }

  // -------------------------------------------------------------------------
  // COUNTRY SLIDE 6: CLIMATE, SUNSHINE CALENDAR & SEASONAL WEATHER GUIDE
  // -------------------------------------------------------------------------
  if (spec.layout === 'country-climate-calendar' && cd) {
    const bg = ctx.createLinearGradient(0, 0, width, height);
    bg.addColorStop(0, '#451a03');
    bg.addColorStop(0.5, '#7c2d12');
    bg.addColorStop(1, '#0f172a');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    let curY = drawBrandHeader(ctx, iconImg, width, padX, isStory ? 68 : 40, isStory, false);
    curY = drawCountrySlideTopHeader(
      ctx,
      spec,
      flagImg,
      padX,
      contentW,
      curY,
      isStory,
      false,
      'rgba(251, 191, 36, 0.25)',
      '#fde68a'
    );

    // 3 Big Weather Stat Boxes
    const wGap = 20;
    const wW = (contentW - wGap * 2) / 3;
    const wH = isStory ? 210 : 145;
    const tempF = Math.round((cd.avgTempC * 9) / 5 + 32);

    const weatherStats = [
      { icon: '☀️', label: 'ANNUAL SUNSHINE', val: `${cd.sunnyDays} Days`, sub: `${cd.climateCategory} Zone`, col: '#fbbf24' },
      { icon: '🌡️', label: 'AVERAGE TEMP', val: `${cd.avgTempC}°C / ${tempF}°F`, sub: 'Year-Round Comfort', col: '#fb923c' },
      { icon: '💧', label: 'AVG HUMIDITY', val: `${cd.humidityPercent}%`, sub: 'Coastal / Inland Breeze', col: '#38bdf8' },
    ];

    weatherStats.forEach((ws, idx) => {
      const wx = padX + idx * (wW + wGap);
      roundRect(ctx, wx, curY, wW, wH, 24);
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = ws.col;
      ctx.stroke();

      ctx.font = `800 ${isStory ? '15px' : '12px'} Inter, system-ui, sans-serif`;
      ctx.fillStyle = ws.col;
      ctx.fillText(`${ws.icon} ${ws.label}`, wx + 22, curY + (isStory ? 42 : 30));

      ctx.font = `900 ${isStory ? '36px' : '25px'} Inter, system-ui, sans-serif`;
      ctx.fillStyle = '#ffffff';
      ctx.fillText(ws.val, wx + 22, curY + (isStory ? 105 : 74));

      ctx.font = `600 ${isStory ? '17px' : '13px'} Inter, system-ui, sans-serif`;
      ctx.fillStyle = '#fde68a';
      ctx.fillText(ws.sub, wx + 22, curY + (isStory ? 158 : 112));
    });

    curY += wH + (isStory ? 28 : 18);

    // 12-Month Visual Sunshine & Comfort Bar Chart Card
    const calH = isStory ? 440 : 300;
    roundRect(ctx, padX, curY, contentW, calH, 28);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.font = `900 ${isStory ? '25px' : '19px'} Inter, system-ui, sans-serif`;
    ctx.fillStyle = '#0f172a';
    ctx.fillText(`📅 12-Month Sunshine & Scouting Comfort Index`, padX + 34, curY + (isStory ? 50 : 38));

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const rainyLower = (cd.rainyMonths || '').toLowerCase();

    const mGap = 14;
    const barW = (contentW - 68 - mGap * 11) / 12;
    const maxBarH = isStory ? 230 : 145;
    const baseBarY = curY + calH - (isStory ? 90 : 64);

    months.forEach((m, idx) => {
      const mx = padX + 34 + idx * (barW + mGap);
      const isRainy =
        rainyLower.includes(m.toLowerCase()) ||
        (rainyLower.includes('november to february') && (idx === 0 || idx === 1 || idx === 10 || idx === 11)) ||
        (rainyLower.includes('may to october') && idx >= 4 && idx <= 9);

      const factor = isRainy ? 0.52 + (idx % 3) * 0.06 : 0.85 + ((idx * 7) % 15) / 100;
      const bh = Math.round(maxBarH * Math.min(1, factor));

      roundRect(ctx, mx, baseBarY - maxBarH, barW, maxBarH, 10);
      ctx.fillStyle = '#f1f5f9';
      ctx.fill();

      roundRect(ctx, mx, baseBarY - bh, barW, bh, 10);
      ctx.fillStyle = isRainy ? '#38bdf8' : '#f59e0b';
      ctx.fill();

      ctx.textAlign = 'center';
      ctx.font = `800 ${isStory ? '16px' : '13px'} Inter, system-ui, sans-serif`;
      ctx.fillStyle = '#334155';
      ctx.fillText(m, mx + barW / 2, baseBarY + (isStory ? 32 : 24));
      ctx.textAlign = 'left';
    });

    curY += calH + (isStory ? 28 : 18);

    // Best Months vs Rainy Months Split Cards
    const splitW = (contentW - 24) / 2;
    const splitH = isStory ? 260 : 180;

    roundRect(ctx, padX, curY, splitW, splitH, 24);
    ctx.fillStyle = '#ecfdf5';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#34d399';
    ctx.stroke();

    ctx.font = `800 ${isStory ? '16px' : '13px'} Inter, system-ui, sans-serif`;
    ctx.fillStyle = '#065f46';
    ctx.fillText('🌟 BEST MONTHS TO SCOUT & LIVE', padX + 28, curY + (isStory ? 46 : 34));
    ctx.font = `900 ${isStory ? '28px' : '20px'} Inter, system-ui, sans-serif`;
    ctx.fillStyle = '#0f172a';
    drawWrappedText(ctx, cd.bestMonths, padX + 28, curY + (isStory ? 96 : 68), splitW - 56, isStory ? 34 : 24, 2);
    ctx.font = `600 ${isStory ? '17px' : '13px'} Inter, system-ui, sans-serif`;
    ctx.fillStyle = '#047857';
    ctx.fillText('Ideal outdoor dining & coastal walks', padX + 28, curY + splitH - (isStory ? 34 : 24));

    const rx = padX + splitW + 24;
    roundRect(ctx, rx, curY, splitW, splitH, 24);
    ctx.fillStyle = '#f0f9ff';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#38bdf8';
    ctx.stroke();

    ctx.font = `800 ${isStory ? '16px' : '13px'} Inter, system-ui, sans-serif`;
    ctx.fillStyle = '#0369a1';
    ctx.fillText('🌧️ RAINY / GREEN SEASON MONTHS', rx + 28, curY + (isStory ? 46 : 34));
    ctx.font = `900 ${isStory ? '28px' : '20px'} Inter, system-ui, sans-serif`;
    ctx.fillStyle = '#0f172a';
    drawWrappedText(ctx, cd.rainyMonths, rx + 28, curY + (isStory ? 96 : 68), splitW - 56, isStory ? 34 : 24, 2);
    ctx.font = `600 ${isStory ? '17px' : '13px'} Inter, system-ui, sans-serif`;
    ctx.fillStyle = '#0284c7';
    ctx.fillText('Lower off-season rental rates', rx + 28, curY + splitH - (isStory ? 34 : 24));

    drawFooterCta(ctx, spec.ctaText, width, height, padX, isStory, ['#f59e0b', '#ea580c', '#0d9488']);
    return canvas.toDataURL('image/png', 1.0);
  }

  // -------------------------------------------------------------------------
  // COUNTRY SLIDE 7: HONEST PROS & CONS REALITY CHECK
  // -------------------------------------------------------------------------
  if (spec.layout === 'country-pros-cons' && cd) {
    const bg = ctx.createLinearGradient(0, 0, width, height);
    bg.addColorStop(0, '#f8fafc');
    bg.addColorStop(0.5, '#f0fdf4');
    bg.addColorStop(1, '#fff1f2');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    let curY = drawBrandHeader(ctx, iconImg, width, padX, isStory ? 68 : 40, isStory, true);
    curY = drawCountrySlideTopHeader(
      ctx,
      spec,
      flagImg,
      padX,
      contentW,
      curY,
      isStory,
      true,
      '#e0e7ff',
      '#3730a3'
    );

    const splitW = (contentW - 24) / 2;
    const splitH = isStory ? 680 : 465;

    // Left: Emerald Pros
    roundRect(ctx, padX, curY, splitW, splitH, 28);
    ctx.fillStyle = '#ecfdf5';
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#10b981';
    ctx.stroke();

    ctx.font = `900 ${isStory ? '25px' : '19px'} Inter, system-ui, sans-serif`;
    ctx.fillStyle = '#065f46';
    ctx.fillText(`✅ Why Retirees Love ${cd.name}`, padX + 26, curY + (isStory ? 50 : 38));

    let py = curY + (isStory ? 102 : 74);
    ctx.font = `600 ${isStory ? '20px' : '15px'} Inter, system-ui, sans-serif`;
    ctx.fillStyle = '#064e3b';
    (cd.pros || []).slice(0, 4).forEach(pro => {
      py = drawWrappedText(ctx, `✓  ${pro}`, padX + 26, py, splitW - 52, isStory ? 30 : 22, 3) + (isStory ? 26 : 16);
    });

    // Right: Rose Cons / Reality Check
    const rx = padX + splitW + 24;
    roundRect(ctx, rx, curY, splitW, splitH, 28);
    ctx.fillStyle = '#fff1f2';
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#f43f5e';
    ctx.stroke();

    ctx.font = `900 ${isStory ? '25px' : '19px'} Inter, system-ui, sans-serif`;
    ctx.fillStyle = '#9f1239';
    ctx.fillText(`⚠️ Reality Check & Trade-Offs`, rx + 26, curY + (isStory ? 50 : 38));

    let cy = curY + (isStory ? 102 : 74);
    ctx.font = `600 ${isStory ? '20px' : '15px'} Inter, system-ui, sans-serif`;
    ctx.fillStyle = '#881337';
    (cd.cons || []).slice(0, 4).forEach(con => {
      cy = drawWrappedText(ctx, `•  ${con}`, rx + 26, cy, splitW - 52, isStory ? 30 : 22, 3) + (isStory ? 26 : 16);
    });

    curY += splitH + (isStory ? 28 : 16);

    // Bottom Dossier Verdict Box
    const verdH = isStory ? 255 : 175;
    roundRect(ctx, padX, curY, contentW, verdH, 28);
    ctx.fillStyle = '#0f172a';
    ctx.fill();

    ctx.font = `800 ${isStory ? '16px' : '13px'} Inter, system-ui, sans-serif`;
    ctx.fillStyle = '#2dd4bf';
    ctx.fillText(`🧭 EXECUTIVE DOSSIER OVERVIEW · CAPITAL: ${cd.capital.toUpperCase()}`, padX + 34, curY + (isStory ? 44 : 32));

    ctx.font = `500 ${isStory ? '20px' : '15px'} Inter, system-ui, sans-serif`;
    ctx.fillStyle = '#f1f5f9';
    drawWrappedText(
      ctx,
      cd.overview,
      padX + 34,
      curY + (isStory ? 84 : 60),
      contentW - 68,
      isStory ? 30 : 22,
      4
    );

    drawFooterCta(ctx, spec.ctaText, width, height, padX, isStory, ['#10b981', '#4f46e5', '#e11d48']);
    return canvas.toDataURL('image/png', 1.0);
  }

  // -------------------------------------------------------------------------
  // COUNTRY SLIDE 8: DEMOGRAPHICS, DATING CULTURE & NIGHTLIFE VIBRANCY
  // -------------------------------------------------------------------------
  if (spec.layout === 'country-social-demographics' && cd) {
    const bg = ctx.createLinearGradient(0, 0, width, height);
    bg.addColorStop(0, '#2e1065');
    bg.addColorStop(0.5, '#1e1b4b');
    bg.addColorStop(1, '#31102f');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    let curY = drawBrandHeader(ctx, iconImg, width, padX, isStory ? 68 : 40, isStory, false);
    curY = drawCountrySlideTopHeader(
      ctx,
      spec,
      flagImg,
      padX,
      contentW,
      curY,
      isStory,
      false,
      'rgba(244, 114, 182, 0.22)',
      '#fbcfe8'
    );

    // 3 Demographic KPI Boxes
    const dGap = 20;
    const dW = (contentW - dGap * 2) / 3;
    const dH = isStory ? 195 : 138;

    const demoKpis = [
      { label: 'MEDIAN AGE', val: `${cd.medianAge} Yrs`, sub: `${cd.youngPopulationPercent}% Under Age 30`, col: '#f472b6' },
      { label: 'FEMALE : MALE RATIO', val: `${cd.femalesPer100Males} : 100`, sub: 'Females per 100 Males', col: '#38bdf8' },
      { label: 'DATING & SOCIAL SCORE', val: `${cd.datingRating} / 5 ★`, sub: cd.nightlifeVibrancy, col: '#fbbf24' },
    ];

    demoKpis.forEach((dk, idx) => {
      const dx = padX + idx * (dW + dGap);
      roundRect(ctx, dx, curY, dW, dH, 24);
      ctx.fillStyle = 'rgba(255,255,255,0.09)';
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = dk.col;
      ctx.stroke();

      ctx.font = `800 ${isStory ? '14px' : '11px'} Inter, system-ui, sans-serif`;
      ctx.fillStyle = dk.col;
      ctx.fillText(dk.label, dx + 22, curY + (isStory ? 38 : 28));

      ctx.font = `900 ${isStory ? '36px' : '25px'} Inter, system-ui, sans-serif`;
      ctx.fillStyle = '#ffffff';
      ctx.fillText(dk.val, dx + 22, curY + (isStory ? 96 : 68));

      ctx.font = `600 ${isStory ? '16px' : '12px'} Inter, system-ui, sans-serif`;
      ctx.fillStyle = '#e2e8f0';
      drawWrappedText(ctx, dk.sub, dx + 22, curY + (isStory ? 142 : 102), dW - 44, 20, 1);
    });

    curY += dH + (isStory ? 26 : 16);

    // Social Atmosphere & Dating Culture Card
    const socCardH = isStory ? 420 : 285;
    roundRect(ctx, padX, curY, contentW, socCardH, 28);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.font = `900 ${isStory ? '25px' : '19px'} Inter, system-ui, sans-serif`;
    ctx.fillStyle = '#0f172a';
    ctx.fillText(`💬 Social Atmosphere & Dating Culture in ${cd.name}`, padX + 34, curY + (isStory ? 50 : 36));

    ctx.font = `700 ${isStory ? '21px' : '16px'} Inter, system-ui, sans-serif`;
    ctx.fillStyle = '#4f46e5';
    let sy = drawWrappedText(
      ctx,
      cd.socialAtmosphere,
      padX + 34,
      curY + (isStory ? 96 : 68),
      contentW - 68,
      isStory ? 30 : 22,
      2
    );

    sy += isStory ? 18 : 10;
    ctx.font = `500 ${isStory ? '20px' : '15px'} Inter, system-ui, sans-serif`;
    ctx.fillStyle = '#334155';
    drawWrappedText(
      ctx,
      cd.datingCultureSummary,
      padX + 34,
      sy,
      contentW - 68,
      isStory ? 30 : 22,
      4
    );

    curY += socCardH + (isStory ? 26 : 16);

    // Nightlife Districts & Safety Guidance Card
    const nightH = isStory ? 320 : 220;
    roundRect(ctx, padX, curY, contentW, nightH, 28);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#f472b6';
    ctx.stroke();

    ctx.font = `800 ${isStory ? '17px' : '13px'} Inter, system-ui, sans-serif`;
    ctx.fillStyle = '#f472b6';
    ctx.fillText(
      `🥂 EVENING VIBRANCY: ${cd.nightlifeVibrancy.toUpperCase()} (${cd.nightlifeScore}/5)`,
      padX + 34,
      curY + (isStory ? 46 : 34)
    );

    const districts =
      cd.topVenuesOrDistricts.length > 0
        ? cd.topVenuesOrDistricts.join('  ·  ')
        : `${cd.capital} Historic Quarter & Waterfront Promenades`;

    ctx.font = `800 ${isStory ? '22px' : '17px'} Inter, system-ui, sans-serif`;
    ctx.fillStyle = '#ffffff';
    drawWrappedText(
      ctx,
      `📍 Popular Social Districts: ${districts}`,
      padX + 34,
      curY + (isStory ? 92 : 66),
      contentW - 68,
      isStory ? 30 : 22,
      2
    );

    ctx.font = `500 ${isStory ? '19px' : '14px'} Inter, system-ui, sans-serif`;
    ctx.fillStyle = '#cbd5e1';
    drawWrappedText(
      ctx,
      `🛡️ Safety Tip: ${cd.safetyGuidance}`,
      padX + 34,
      curY + (isStory ? 185 : 132),
      contentW - 68,
      isStory ? 28 : 20,
      3
    );

    drawFooterCta(ctx, spec.ctaText, width, height, padX, isStory, ['#ec4899', '#8b5cf6', '#14b8a6']);
    return canvas.toDataURL('image/png', 1.0);
  }

  // =========================================================================
  // COUNTRY SLIDE 1 (DEFAULT): MAGAZINE COVER WITH HERO PHOTO & GAUGES
  // =========================================================================
  const bg = ctx.createLinearGradient(0, 0, width, height);
  bg.addColorStop(0, '#0f172a');
  bg.addColorStop(1, '#1e1b4b');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  let curY = drawBrandHeader(ctx, iconImg, width, padX, isStory ? 68 : 40, isStory, false);

  const photoH = isStory ? 460 : 295;
  ctx.save();
  roundRect(ctx, padX, curY, contentW, photoH, 32);
  ctx.clip();

  if (heroImg) {
    drawCoverImage(ctx, heroImg, padX, curY, contentW, photoH);
  } else {
    const fallbackG = ctx.createLinearGradient(padX, curY, padX + contentW, curY + photoH);
    fallbackG.addColorStop(0, '#0284c7');
    fallbackG.addColorStop(0.5, '#0d9488');
    fallbackG.addColorStop(1, '#1e1b4b');
    ctx.fillStyle = fallbackG;
    ctx.fillRect(padX, curY, contentW, photoH);

    ctx.beginPath();
    ctx.arc(padX + contentW - 170, curY + 110, 68, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(253, 224, 71, 0.35)';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(padX, curY + photoH);
    ctx.lineTo(padX + 240, curY + photoH - 180);
    ctx.lineTo(padX + 520, curY + photoH - 95);
    ctx.lineTo(padX + 760, curY + photoH - 210);
    ctx.lineTo(padX + contentW, curY + photoH - 110);
    ctx.lineTo(padX + contentW, curY + photoH);
    ctx.closePath();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.45)';
    ctx.fill();
  }

  const darkOverlay = ctx.createLinearGradient(padX, curY, padX, curY + photoH);
  darkOverlay.addColorStop(0, 'rgba(15, 23, 42, 0.12)');
  darkOverlay.addColorStop(0.45, 'rgba(15, 23, 42, 0.18)');
  darkOverlay.addColorStop(1, 'rgba(15, 23, 42, 0.9)');
  ctx.fillStyle = darkOverlay;
  ctx.fillRect(padX, curY, contentW, photoH);

  roundRect(ctx, padX + 28, curY + 26, 420, 42, 21);
  ctx.fillStyle = 'rgba(15, 23, 42, 0.72)';
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = 'rgba(94, 234, 212, 0.55)';
  ctx.stroke();
  ctx.font = '800 15px Inter, system-ui, sans-serif';
  ctx.fillStyle = '#5eead4';
  ctx.fillText(spec.badge, padX + 48, curY + 52);

  const landmarkText = `📸 ${cd?.landmarkLabel || photoCfg.landmarkLabel}`;
  ctx.font = '700 15px Inter, system-ui, sans-serif';
  const lmW = Math.min(380, ctx.measureText(landmarkText).width + 40);
  roundRect(ctx, padX + contentW - lmW - 28, curY + 26, lmW, 42, 21);
  ctx.fillStyle = 'rgba(15, 23, 42, 0.72)';
  ctx.fill();
  ctx.fillStyle = '#fde68a';
  ctx.textAlign = 'right';
  ctx.fillText(landmarkText, padX + contentW - 48, curY + 52);
  ctx.textAlign = 'left';

  const titleY = curY + photoH - (isStory ? 84 : 66);
  let textStartX = padX + 34;
  if (flagImg) {
    const fw = isStory ? 68 : 54;
    const fh = isStory ? 46 : 36;
    const fy = titleY - (isStory ? 42 : 32);
    ctx.save();
    roundRect(ctx, textStartX, fy, fw, fh, 8);
    ctx.clip();
    ctx.drawImage(flagImg, textStartX, fy, fw, fh);
    ctx.restore();
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 2;
    roundRect(ctx, textStartX, fy, fw, fh, 8);
    ctx.stroke();
    textStartX += fw + 18;
  }

  ctx.font = `900 ${isStory ? '54px' : '40px'} Inter, system-ui, sans-serif`;
  ctx.fillStyle = '#ffffff';
  ctx.fillText(
    flagImg ? `${cd?.name || spec.title} Dossier` : `${cd?.flag || '🌍'} ${cd?.name || spec.title}`,
    textStartX,
    titleY
  );

  ctx.font = `500 ${isStory ? '20px' : '16px'} Inter, system-ui, sans-serif`;
  ctx.fillStyle = '#e2e8f0';
  drawWrappedText(
    ctx,
    cd?.tagline || spec.subheadline,
    padX + 34,
    titleY + (isStory ? 34 : 26),
    contentW - 68,
    isStory ? 26 : 20,
    1
  );

  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
  roundRect(ctx, padX, curY, contentW, photoH, 32);
  ctx.stroke();
  ctx.restore();

  curY += photoH + (isStory ? 24 : 16);

  const midH = isStory ? 260 : 185;
  roundRect(ctx, padX, curY, contentW, midH, 28);
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  const gR = isStory ? 62 : 44;
  const gCy = curY + (isStory ? 110 : 78);
  drawCircularGauge(ctx, padX + contentW * 0.18, gCy, gR, cd?.healthcareScore || 88, 'Healthcare', '#0d9488', '#ccfbf1', '#0f172a', '#0f766e');
  drawCircularGauge(ctx, padX + contentW * 0.45, gCy, gR, cd?.safetyScore || 90, 'Safety Index', '#4f46e5', '#e0e7ff', '#0f172a', '#4338ca');

  const costX = padX + contentW * 0.65;
  roundRect(ctx, costX, curY + 24, contentW * 0.32, midH - 48, 20);
  ctx.fillStyle = '#f0fdfa';
  ctx.fill();
  ctx.font = `800 ${isStory ? '16px' : '13px'} Inter, system-ui, sans-serif`;
  ctx.fillStyle = '#0f766e';
  ctx.fillText('MONTHLY BUDGET', costX + 22, curY + (isStory ? 66 : 52));
  ctx.font = `900 ${isStory ? '36px' : '26px'} Inter, system-ui, sans-serif`;
  ctx.fillStyle = '#0f172a';
  ctx.fillText(`$${(cd?.singleBudget || 1850).toLocaleString()}/mo`, costX + 22, curY + (isStory ? 120 : 90));
  ctx.font = `700 ${isStory ? '18px' : '14px'} Inter, system-ui, sans-serif`;
  ctx.fillStyle = '#475569';
  ctx.fillText(`Couple: $${(cd?.coupleBudget || 2550).toLocaleString()}/mo`, costX + 22, curY + (isStory ? 162 : 120));

  curY += midH + (isStory ? 28 : 18);

  const botH = isStory ? 540 : 360;
  roundRect(ctx, padX, curY, contentW, botH, 28);
  ctx.fillStyle = 'rgba(30, 41, 59, 0.9)';
  ctx.fill();

  ctx.font = `800 ${isStory ? '22px' : '18px'} Inter, system-ui, sans-serif`;
  ctx.fillStyle = '#fde68a';
  ctx.fillText(
    `🛂 ${cd?.visaName || 'Retirement Visa'} · Min $${(cd?.minIncome || 1500).toLocaleString()}/mo · ☀️ ${cd?.sunnyDays || 290} Sunny Days`,
    padX + 32,
    curY + (isStory ? 52 : 38)
  );

  (cd?.topCities || []).forEach((city, idx) => {
    const ry = curY + (isStory ? 84 : 58) + idx * (isStory ? 140 : 94);
    roundRect(ctx, padX + 28, ry, contentW - 56, isStory ? 120 : 80, 18);
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fill();

    ctx.font = `900 ${isStory ? '26px' : '20px'} Inter, system-ui, sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`📍 ${city.name}`, padX + 52, ry + (isStory ? 50 : 34));

    ctx.font = `500 ${isStory ? '19px' : '15px'} Inter, system-ui, sans-serif`;
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText(city.vibe, padX + 52, ry + (isStory ? 88 : 62));

    ctx.textAlign = 'right';
    ctx.font = `900 ${isStory ? '26px' : '20px'} Inter, system-ui, sans-serif`;
    ctx.fillStyle = '#5eead4';
    ctx.fillText(`~$${city.monthlyCostUSD}/mo`, padX + contentW - 52, ry + (isStory ? 68 : 48));
    ctx.textAlign = 'left';
  });

  drawFooterCta(ctx, spec.ctaText, width, height, padX, isStory, ['#14b8a6', '#6366f1', '#f59e0b']);
  return canvas.toDataURL('image/png', 1.0);
}

const DISCARDED_STORAGE_KEY = 'refirely_admin_discarded_snapshots_v2';
const CUSTOM_COUNTRY_STORAGE_KEY = 'refirely_admin_custom_country_packs_v3';

export type ViralCaptionStyle = 'viral-hook' | 'carousel-guide' | 'fire-arbitrage' | 'reel-short';

export interface ViralInstagramPostResult {
  styleLabel: string;
  captionBody: string;
  hashtags: string;
  fullText: string;
}

/**
 * Generates a high-converting, empirical-data-backed Viral Instagram Post caption & hashtag block
 * for a specific Country using all key metrics from its Country Dossier.
 */
function buildViralInstagramPost(country: Country, style: ViralCaptionStyle): ViralInstagramPostResult {
  const single = country.costOfLiving.monthlyBudgetSingleUSD;
  const couple = country.costOfLiving.monthlyBudgetCoupleUSD;
  const rentCenter = country.costOfLiving.rent1BedCenterUSD;
  const rentOutside = country.costOfLiving.rent1BedOutsideUSD;
  const meal = country.costOfLiving.mealInexpensiveUSD;
  const healthMo = country.costOfLiving.healthcareMonthlyUSD;
  const utilsMo = country.costOfLiving.utilitiesMonthlyUSD;

  const visaName = country.visa.retirementVisaName;
  const minIncome = country.visa.minimumIncomeUSD;
  const prPath = country.visa.pathwayToPR;
  const processingMo = country.visa.processingMonths;
  const taxNote = country.visa.taxStatus;

  const hcScore = country.lifestyle.healthcareScore;
  const safetyScore = country.lifestyle.safetyScore;
  const walkScore = country.lifestyle.walkabilityScore;
  const expatPop = country.lifestyle.expatCommunitySize;
  const english = country.lifestyle.englishProficiency;

  const sunnyDays = country.climate.annualSunnyDays;
  const avgTemp = country.climate.averageTempC;
  const bestMonths = country.climate.bestMonths;

  const cities = (country.topCities || []).slice(0, 3);
  const pros = (country.pros || []).slice(0, 3);
  const cons = (country.cons || []).slice(0, 2);

  // Save calculation vs $4,500/mo Western city benchmark
  const westernMonthly = 4500;
  const monthlySavings = Math.max(600, westernMonthly - single);
  const annualSavings = monthlySavings * 12;
  const fireNestEggSingle = Math.round((single * 12) / 0.04);
  const westernFireNestEgg = Math.round((westernMonthly * 12) / 0.04);

  const cleanCountryTag = country.name.replace(/[^a-zA-Z0-9]/g, '');
  const cleanCapitalTag = (country.capital || '').replace(/[^a-zA-Z0-9]/g, '');
  const cleanRegionTag = (country.region || '').replace(/[^a-zA-Z0-9]/g, '');
  const cityTags = cities
    .map(c => `#${c.name.replace(/[^a-zA-Z0-9]/g, '')}`)
    .join(' ');

  const hashtags = [
    `#RetireIn${cleanCountryTag}`,
    `#${cleanCountryTag}Expat`,
    `#${cleanCountryTag}Living`,
    cleanCapitalTag ? `#${cleanCapitalTag}Life` : '#ExpatLife',
    cityTags,
    `#${cleanRegionTag}Retirement`,
    '#ReFIREly',
    '#GeoArbitrage',
    '#FIREMovement',
    '#EarlyRetirement',
    '#RetireAbroad',
    '#RetireEarly',
    '#ExpatRetirement',
    '#CostOfLiving',
    '#FinancialIndependence',
    '#DigitalNomadVisas',
    '#RetirementVisa',
    '#PassiveIncomeLifestyle',
    '#GlobalCitizen',
    '#SlowTravel',
    '#RetireOverseas',
    '#WealthPreservation',
    '#FreedomLifestyle',
  ]
    .filter(Boolean)
    .join(' ');

  if (style === 'carousel-guide') {
    const cityLines = cities
      .map((c, idx) => `   ${idx + 1}. ${c.name}: ~$${c.monthlyCostUSD.toLocaleString()}/mo (${c.vibe})`)
      .join('\n');

    const captionBody = [
      `🛑 STOP SCROLLING if you think you need $1.5M+ to retire comfortably.`,
      ``,
      `Welcome to ${country.flag} ${country.name.toUpperCase()} — "${country.tagline}"`,
      ``,
      `We just dropped our complete 8-Slide Country Dossier for ${country.name}. Swipe through the carousel to see the real numbers 👉`,
      ``,
      `📸 SLIDE 1 · Executive Score & Overview`,
      `• Region: ${country.region} (Capital: ${country.capital})`,
      `• Healthcare Score: ${hcScore}/100 | Safety Index: ${safetyScore}/100`,
      `• Annual Sunshine: ${sunnyDays} sunny days/yr (Avg ${avgTemp}°C)`,
      ``,
      `🍩 SLIDE 2 · Real Monthly Cost of Living`,
      `• Single Retiree: $${single.toLocaleString()}/mo ($${(single * 12).toLocaleString()}/yr)`,
      `• Couple Budget: $${couple.toLocaleString()}/mo`,
      `• 1-Bed City Center Rent: $${rentCenter}/mo (Outside center: $${rentOutside}/mo)`,
      `• Local Dining: ~$${meal} | Private Healthcare: ~$${healthMo}/mo | Utilities: ~$${utilsMo}/mo`,
      ``,
      `🛂 SLIDE 3 · Visa & Tax Blueprint`,
      `• Program: ${visaName}`,
      `• Minimum Passive Income: $${minIncome.toLocaleString()}/mo`,
      `• Processing Time: ~${processingMo} months | PR Pathway: ${prPath}`,
      `• Tax Note: ${taxNote}`,
      ``,
      `📍 SLIDE 4 · Top 3 Expat & Retirement Havens`,
      cityLines,
      ``,
      `🏥 SLIDE 5–8 · Healthcare, Climate Calendar, Pros/Cons & Lifestyle`,
      `• Expat Community: ${expatPop} (English: ${english})`,
      `• Best Weather Window: ${bestMonths}`,
      `• Biggest Advantage: ${pros[0] || 'High quality of life at a fraction of US/UK costs'}`,
      `• Watch Out For: ${cons[0] || 'Local bureaucracy requires patience'}`,
      ``,
      `💡 THE FIRE MATH: Using the 4% Safe Withdrawal Rule, you only need ~$${(fireNestEggSingle / 1000).toFixed(0)}k invested to fund a $${single.toLocaleString()}/mo lifestyle in ${country.name} (compared to $1.35M in a typical US city)!`,
      ``,
      `🔖 SAVE this 8-slide dossier for your retirement shortlist & SHARE it with someone planning their escape!`,
      `🔗 Explore all 209+ Country Dossiers & run your personal FIRE countdown at ReFIREly.com (Link in Bio)`,
    ].join('\n');

    return {
      styleLabel: '8-Slide Carousel Walkthrough',
      captionBody,
      hashtags,
      fullText: `${captionBody}\n\n.\n.\n${hashtags}`,
    };
  }

  if (style === 'fire-arbitrage') {
    const captionBody = [
      `Why work 12 extra years in a high-cost city when ${country.flag} ${country.name} lets you retire NOW on $${single.toLocaleString()}/month? 🧠💸`,
      ``,
      `Most people think Early Retirement (FIRE) is a math problem of earning more. In reality, it’s a GEOGRAPHY problem.`,
      ``,
      `Look at the Geo-Arbitrage math for ${country.flag} ${country.name}:`,
      `━━━━━━━━━━━━━━━━━━━━━━`,
      `🇺🇸 Average US/UK Metro Burn Rate: ~$${westernMonthly.toLocaleString()}/mo ($1,350,000 FIRE portfolio needed)`,
      `${country.flag} ${country.name} Comfortable Single Budget: $${single.toLocaleString()}/mo (~$${(fireNestEggSingle / 1000).toFixed(0)}k FIRE portfolio needed)`,
      `💑 ${country.name} Couple Full Budget: $${couple.toLocaleString()}/mo`,
      `💰 Annual Lifestyle Savings: $${annualSavings.toLocaleString()}/year kept compounding in your portfolio!`,
      `━━━━━━━━━━━━━━━━━━━━━━`,
      ``,
      `What does $${single.toLocaleString()}/mo actually buy you in ${country.name}?`,
      `🏠 Modern 1-Bed Apartment: $${rentOutside}–$${rentCenter}/mo`,
      `🏥 Healthcare (${hcScore}/100 rating): ~$${healthMo}/mo (${country.lifestyle.healthcareSummary})`,
      `🍽️ Fresh local dining out: ~$${meal} per meal`,
      `☀️ Climate: ${sunnyDays} sunny days/year (${country.climate.category}, avg ${avgTemp}°C)`,
      `🛡️ Safety Score: ${safetyScore}/100 with ${expatPop} already settled`,
      ``,
      `🛂 How to Move Legally:`,
      `Apply for the ${visaName} — requires just $${minIncome.toLocaleString()}/mo in passive/retirement income and processes in ~${processingMo} months (${prPath}).`,
      ``,
      `📍 Best Towns to Scout First:`,
      ...cities.map(c => `• ${c.name} (~$${c.monthlyCostUSD}/mo) — ${c.vibe}`),
      ``,
      `👇 Would you trade the rat race for ${sunnyDays} days of sunshine in ${country.name}? Drop a "${country.flag}" in the comments and SAVE this post!`,
    ].join('\n');

    return {
      styleLabel: 'FIRE Math & Geo-Arbitrage Story',
      captionBody,
      hashtags,
      fullText: `${captionBody}\n\n.\n.\n${hashtags}`,
    };
  }

  if (style === 'reel-short') {
    const captionBody = [
      `${country.flag} Retire in ${country.name} on $${single.toLocaleString()}/month?! Here is the real 2026 cheat sheet 👇`,
      ``,
      `💵 Single Budget: $${single.toLocaleString()}/mo | Couple: $${couple.toLocaleString()}/mo`,
      `🏠 1-Bed Rent: $${rentOutside}–$${rentCenter}/mo`,
      `🛂 Visa: ${visaName} ($${minIncome.toLocaleString()}/mo min income)`,
      `🏥 Healthcare: ${hcScore}/100 | 🛡️ Safety: ${safetyScore}/100`,
      `☀️ Weather: ${sunnyDays} sunny days/yr (${avgTemp}°C avg)`,
      `📍 Top Hubs: ${cities.map(c => `${c.name} ($${c.monthlyCostUSD}/mo)`).join(' · ')}`,
      ``,
      `✅ Top Pro: ${pros[0] || 'Incredible value & lifestyle quality'}`,
      `⚠️ Reality Check: ${cons[0] || 'Plan ahead for visa paperwork'}`,
      ``,
      `🔖 SAVE this for your relocation board & check out ReFIREly (Link in Bio) to match your portfolio against 209+ countries!`,
    ].join('\n');

    return {
      styleLabel: 'Punchy Reel / Story Caption',
      captionBody,
      hashtags,
      fullText: `${captionBody}\n\n${hashtags}`,
    };
  }

  // Default: 'viral-hook'
  const captionBody = [
    `Could you live your dream life in ${country.flag} ${country.name} on just $${single.toLocaleString()}/month? 🌍✨`,
    ``,
    `"${country.tagline}"`,
    ``,
    `${country.overview}`,
    ``,
    `📊 THE 2026 ${country.name.toUpperCase()} RETIREMENT & EXPAT SCORECARD:`,
    `• 💵 Monthly Cost (Single): $${single.toLocaleString()}/mo`,
    `• 💑 Monthly Cost (Couple): $${couple.toLocaleString()}/mo`,
    `• 🏠 1-Bed Rent (City Center / Outside): $${rentCenter}/mo / $${rentOutside}/mo`,
    `• 🏥 Healthcare Quality: ${hcScore}/100 (~$${healthMo}/mo private insurance)`,
    `• 🛡️ Safety & Peace Index: ${safetyScore}/100 (Walkability: ${walkScore}/100)`,
    `• ☀️ Climate: ${sunnyDays} sunny days/yr · ${avgTemp}°C avg (${country.climate.category})`,
    `• 🗣️ English Proficiency: ${english} · Expat Community: ${expatPop}`,
    ``,
    `🛂 VISA & RESIDENCY PATHWAY:`,
    `• Visa Name: ${visaName}`,
    `• Income Requirement: $${minIncome.toLocaleString()}/mo passive income`,
    `• Approval Timeline: ~${processingMo} months (${prPath})`,
    `• Tax Overview: ${taxNote}`,
    ``,
    `📍 TOP CITIES TO SCOUT IN ${country.name.toUpperCase()}:`,
    ...cities.map(
      c => `• ${c.name} (~$${c.monthlyCostUSD.toLocaleString()}/mo): ${c.vibe}${c.highlight ? ` — ${c.highlight}` : ''}`
    ),
    ``,
    `✅ WHY EXPATS LOVE IT:`,
    ...pros.map(p => `✔ ${p}`),
    ``,
    `⚖️ HONEST TRADE-OFFS TO KNOW:`,
    ...cons.map(c => `• ${c}`),
    ``,
    `💬 Question for you: Which city in ${country.name} would you pick — ${cities.map(c => c.name).join(', ')}? Comment below! 👇`,
    `🔖 SAVE this post to your Retirement Board & visit ReFIREly (Link in Bio) to calculate your exact Freedom Countdown!`,
  ].join('\n');

  return {
    styleLabel: 'Viral Hook + Full Dossier Breakdown',
    captionBody,
    hashtags,
    fullText: `${captionBody}\n\n.\n.\n${hashtags}`,
  };
}

interface AdminSocialPromoStudioProps {
  countries: Country[];
}

export const AdminSocialPromoStudio: React.FC<AdminSocialPromoStudioProps> = ({ countries }) => {
  const [aspect, setAspect] = useState<PortraitAspect>('9:16');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('ALL');
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
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      // Pre-seed initial 8-slide Country Dossier Pack for the first country (e.g., Portugal)
      if (countries.length > 0) {
        return buildCountryDossierPackSpecs(countries[0]);
      }
      return [];
    } catch {
      return countries.length > 0 ? buildCountryDossierPackSpecs(countries[0]) : [];
    }
  });

  const [selectedCountryId, setSelectedCountryId] = useState<string>(
    countries[0]?.id || 'portugal'
  );
  const [captionStyle, setCaptionStyle] = useState<ViralCaptionStyle>('viral-hook');
  const [customCaptionOverride, setCustomCaptionOverride] = useState<string | null>(null);
  const [copiedType, setCopiedType] = useState<'full' | 'caption' | 'hashtags' | null>(null);

  const [renderedUrls, setRenderedUrls] = useState<Record<string, string>>({});
  const [isRendering, setIsRendering] = useState(false);
  const [isBatchDownloading, setIsBatchDownloading] = useState(false);
  const [previewSpec, setPreviewSpec] = useState<SocialPromoCardSpec | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Keep active viral post country synced with either the active country category tab or the dropdown selection
  const activeCountryForViralPost = useMemo(() => {
    if (activeCategoryFilter !== 'ALL' && activeCategoryFilter !== 'PLATFORM') {
      const byName = countries.find(
        c => c.name.toLowerCase() === activeCategoryFilter.toLowerCase()
      );
      if (byName) return byName;
    }
    return countries.find(c => c.id === selectedCountryId) || countries[0];
  }, [activeCategoryFilter, selectedCountryId, countries]);

  // Reset manual text override whenever country or caption style changes
  useEffect(() => {
    setCustomCaptionOverride(null);
  }, [activeCountryForViralPost?.id, captionStyle]);

  const viralPostData = useMemo(() => {
    if (!activeCountryForViralPost) return null;
    return buildViralInstagramPost(activeCountryForViralPost, captionStyle);
  }, [activeCountryForViralPost, captionStyle]);

  const displayedViralText = customCaptionOverride !== null
    ? customCaptionOverride
    : (viralPostData?.fullText || '');

  const allActiveSpecs = useMemo(() => {
    return [
      ...customSpecs,
      ...DEFAULT_FEATURE_SNAPSHOTS.filter(s => !discardedIds.includes(s.id)),
    ];
  }, [customSpecs, discardedIds]);

  // Distinct Country Categories generated by Admin
  const countryCategories = useMemo(() => {
    const map = new Map<string, { name: string; flag: string; count: number; countryId: string }>();
    customSpecs.forEach(s => {
      const cName = s.countryName || s.category;
      const cFlag = s.countryFlag || s.countryData?.flag || '🌍';
      const cId = s.countryId || s.countryData?.id || cName.toLowerCase();
      if (!map.has(cName)) {
        map.set(cName, { name: cName, flag: cFlag, count: 0, countryId: cId });
      }
      map.get(cName)!.count += 1;
    });
    return Array.from(map.values());
  }, [customSpecs]);

  const platformSpecsCount = useMemo(() => {
    return DEFAULT_FEATURE_SNAPSHOTS.filter(s => !discardedIds.includes(s.id)).length;
  }, [discardedIds]);

  const filteredSpecs = useMemo(() => {
    if (activeCategoryFilter === 'ALL') return allActiveSpecs;
    if (activeCategoryFilter === 'PLATFORM') {
      return DEFAULT_FEATURE_SNAPSHOTS.filter(s => !discardedIds.includes(s.id));
    }
    return customSpecs.filter(s => (s.countryName || s.category) === activeCategoryFilter);
  }, [allActiveSpecs, activeCategoryFilter, customSpecs, discardedIds]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleCopyViralText = (mode: 'full' | 'caption' | 'hashtags') => {
    if (!viralPostData || !activeCountryForViralPost) return;
    const textToCopy =
      mode === 'full'
        ? displayedViralText
        : mode === 'caption'
          ? viralPostData.captionBody
          : viralPostData.hashtags;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textToCopy);
    }
    setCopiedType(mode);
    setTimeout(() => setCopiedType(null), 2500);
    const label =
      mode === 'full'
        ? 'Full Viral Instagram Post + Hashtags'
        : mode === 'caption'
          ? 'Viral Instagram Caption'
          : '30 Targeted Hashtags';
    showToast(`Copied ${label} for ${activeCountryForViralPost.flag} ${activeCountryForViralPost.name}!`);
  };

  const handleDownloadViralTextFile = () => {
    if (!activeCountryForViralPost || !displayedViralText) return;
    const blob = new Blob([displayedViralText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const cleanCountry = activeCountryForViralPost.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    link.href = url;
    link.download = `${cleanCountry}-instagram-viral-post-${captionStyle}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Downloaded Viral Instagram Caption (.txt) for ${activeCountryForViralPost.name}!`);
  };

  // Render visible cards on-demand and cache by id + aspect
  useEffect(() => {
    let cancelled = false;
    const renderMissing = async () => {
      const missing = filteredSpecs.filter(spec => !renderedUrls[`${spec.id}_${aspect}`]);
      if (missing.length === 0) return;
      setIsRendering(true);
      for (const spec of missing) {
        if (cancelled) break;
        const key = `${spec.id}_${aspect}`;
        const dataUrl = await renderPortraitPromoToDataUrl(spec, aspect);
        if (!cancelled) {
          setRenderedUrls(prev => ({ ...prev, [key]: dataUrl }));
        }
      }
      if (!cancelled) {
        setIsRendering(false);
      }
    };
    renderMissing();
    return () => {
      cancelled = true;
    };
  }, [filteredSpecs, aspect]);

  const handleDiscardCard = (spec: SocialPromoCardSpec) => {
    if (spec.id.startsWith('promo-country-')) {
      const nextCustom = customSpecs.filter(c => c.id !== spec.id);
      setCustomSpecs(nextCustom);
      try {
        localStorage.setItem(CUSTOM_COUNTRY_STORAGE_KEY, JSON.stringify(nextCustom));
      } catch {}
    } else {
      const nextDiscarded = [...discardedIds, spec.id];
      setDiscardedIds(nextDiscarded);
      try {
        localStorage.setItem(DISCARDED_STORAGE_KEY, JSON.stringify(nextDiscarded));
      } catch {}
    }
    if (previewSpec?.id === spec.id) {
      setPreviewSpec(null);
    }
    showToast(`Discarded "${spec.title}" from your promotional gallery.`);
  };

  const handleDeleteCountryPack = (countryName: string) => {
    const nextCustom = customSpecs.filter(c => (c.countryName || c.category) !== countryName);
    setCustomSpecs(nextCustom);
    try {
      localStorage.setItem(CUSTOM_COUNTRY_STORAGE_KEY, JSON.stringify(nextCustom));
    } catch {}
    if (activeCategoryFilter === countryName) {
      setActiveCategoryFilter('ALL');
    }
    showToast(`Removed ${countryName} card pack from your gallery.`);
  };

  const handleRestoreDefaults = () => {
    setDiscardedIds([]);
    try {
      localStorage.removeItem(DISCARDED_STORAGE_KEY);
    } catch {}
    showToast('Restored all default website module snapshots.');
  };

  /**
   * Generates a full 8-Slide Country Dossier Pack for the selected country,
   * categorizes them under the Country Name, and focuses that Country category tab.
   */
  const handleGenerateCountryPack = async () => {
    const target = countries.find(c => c.id === selectedCountryId);
    if (!target) return;

    const newPackSpecs = buildCountryDossierPackSpecs(target);
    // Replace any existing pack for this same country so slides stay fresh and organized
    const remainingCustom = customSpecs.filter(
      c => c.countryId !== target.id && (c.countryName || c.category) !== target.name
    );
    const nextCustom = [...newPackSpecs, ...remainingCustom];
    setCustomSpecs(nextCustom);
    setActiveCategoryFilter(target.name);

    try {
      localStorage.setItem(CUSTOM_COUNTRY_STORAGE_KEY, JSON.stringify(nextCustom));
    } catch {}

    showToast(
      `Generated 8-Slide Dossier Pack & Viral Instagram Post for ${target.flag} ${target.name}!`
    );
  };

  const handleDownloadSnapshot = async (spec: SocialPromoCardSpec) => {
    const key = `${spec.id}_${aspect}`;
    let dataUrl = renderedUrls[key];
    if (!dataUrl) {
      dataUrl = await renderPortraitPromoToDataUrl(spec, aspect);
      setRenderedUrls(prev => ({ ...prev, [key]: dataUrl }));
    }
    const link = document.createElement('a');
    const cleanName = spec.title
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase();
    link.download = `refirely-${aspect.replace(':', 'x')}-${cleanName}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Downloaded HD Portrait PNG (${aspect === '9:16' ? '1080×1920' : '1080×1350'})!`);
  };

  const handleDownloadCountryPackAll = async (countryName: string) => {
    const countrySlides = customSpecs.filter(s => (s.countryName || s.category) === countryName);
    if (countrySlides.length === 0) return;

    setIsBatchDownloading(true);
    showToast(`Preparing & downloading all ${countrySlides.length} slides for ${countryName}...`);

    for (let i = 0; i < countrySlides.length; i++) {
      const spec = countrySlides[i];
      const key = `${spec.id}_${aspect}`;
      let dataUrl = renderedUrls[key];
      if (!dataUrl) {
        dataUrl = await renderPortraitPromoToDataUrl(spec, aspect);
        setRenderedUrls(prev => ({ ...prev, [key]: dataUrl }));
      }
      const slideIdx = String(spec.slideNumber || i + 1).padStart(2, '0');
      const cleanCountry = countryName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const cleanStyle = (spec.styleTag || spec.layout).toLowerCase().replace(/[^a-z0-9]+/g, '-');

      const link = document.createElement('a');
      link.download = `${cleanCountry}-slide-${slideIdx}-${cleanStyle}-${aspect.replace(':', 'x')}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      await new Promise(r => setTimeout(r, 260));
    }

    setIsBatchDownloading(false);
    showToast(`Downloaded all ${countrySlides.length} Instagram Carousel PNGs for ${countryName}!`);
  };

  // Lightbox Next/Prev navigation
  const currentPreviewIndex = useMemo(() => {
    if (!previewSpec) return -1;
    return filteredSpecs.findIndex(s => s.id === previewSpec.id);
  }, [previewSpec, filteredSpecs]);

  const handleNavigatePreview = (dir: -1 | 1) => {
    if (currentPreviewIndex < 0 || filteredSpecs.length <= 1) return;
    const nextIdx = (currentPreviewIndex + dir + filteredSpecs.length) % filteredSpecs.length;
    setPreviewSpec(filteredSpecs[nextIdx]);
  };

  return (
    <div className="w-full space-y-6">
      {/* =====================================================================
          SECTION 1: STUDIO HEADER & ASPECT RATIO TOOLBAR (Full-Width Balanced)
      ===================================================================== */}
      <div className="relative overflow-hidden bg-white rounded-3xl border border-indigo-200/80 p-5 sm:p-7 shadow-sm space-y-5">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-400 via-indigo-500 to-amber-500" />

        {/* Top Bar: Badges on Left, Aspect Switcher on Right */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-indigo-50 text-indigo-900 border border-indigo-200">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span>Admin Social Promotion &amp; Country Carousel Studio</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-teal-50 text-teal-900 border border-teal-200">
              <ImageIcon className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span>
                {allActiveSpecs.length} Ready Portrait Cards ({countryCategories.length} Country Packs)
              </span>
            </span>
          </div>

          {/* Aspect Ratio Switcher & Restore Action */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
              <button
                onClick={() => setAspect('9:16')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  aspect === '9:16'
                    ? 'bg-gradient-to-r from-teal-600 to-indigo-600 text-white shadow-2xs'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5 shrink-0" />
                <span>9:16 Story (1080×1920)</span>
              </button>
              <button
                onClick={() => setAspect('4:5')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  aspect === '4:5'
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-2xs'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                <RectangleVertical className="w-3.5 h-3.5 shrink-0" />
                <span>4:5 Feed Carousel (1080×1350)</span>
              </button>
            </div>

            {discardedIds.length > 0 && (
              <button
                onClick={handleRestoreDefaults}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition-colors cursor-pointer"
                title="Restore discarded default snapshots"
              >
                <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                <span>Restore ({discardedIds.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Full-Width Title & Description (Never squeezed to the left) */}
        <div className="w-full space-y-2">
          <h2 className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-slate-900 via-indigo-950 to-teal-900 bg-clip-text text-transparent">
            Multi-Slide Country Dossier Packs, Infographics &amp; Viral Instagram Captions
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed w-full">
            Generate a complete <strong>8-Slide Instagram Carousel / Story Pack</strong> + <strong>Viral Instagram Post Text</strong> for any country capturing 100% of its Dossier intelligence across 8 distinct visual layouts: <em>(1) Magazine Cover &amp; Score Gauges, (2) Cost of Living Donut &amp; Arbitrage Chart, (3) Visa &amp; Tax Blueprint, (4) 6-Axis Radar &amp; Top Towns, (5) Healthcare &amp; Safety Report, (6) 12-Month Sunshine Calendar, (7) Honest Pros vs. Cons Split, and (8) Demographics, Dating &amp; Nightlife</em>.
          </p>
        </div>

        {/* =====================================================================
            8-SLIDE COUNTRY DOSSIER PACK & VIRAL POST GENERATOR BAR (Full Width)
        ===================================================================== */}
        <div className="bg-gradient-to-r from-teal-50/70 via-indigo-50/50 to-amber-50/60 p-4 sm:p-5 rounded-2xl border border-indigo-200/80 space-y-4">
          <div className="w-full space-y-1">
            <div className="text-xs sm:text-sm font-extrabold text-indigo-950 flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-600 shrink-0" />
              <span>Generate 8-Slide Country Dossier Infographic Pack + Viral Instagram Post</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Select any of the {countries.length} countries below to generate 8 diverse infographic slides categorized by Country Name, along with a ready-to-copy viral Instagram caption and hashtag set.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-stretch">
            <div className="sm:col-span-5">
              <select
                value={selectedCountryId}
                onChange={e => {
                  const newId = e.target.value;
                  setSelectedCountryId(newId);
                  const found = countries.find(c => c.id === newId);
                  if (found && countryCategories.some(cat => cat.name === found.name)) {
                    setActiveCategoryFilter(found.name);
                  }
                }}
                className="w-full h-full px-3.5 py-2.5 rounded-xl bg-white border border-indigo-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label="Select country for 8-slide promotional pack"
              >
                {countries.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.flag} {c.name} (${c.costOfLiving.monthlyBudgetSingleUSD}/mo · {c.region})
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-4">
              <button
                onClick={handleGenerateCountryPack}
                className="w-full h-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 via-indigo-600 to-violet-600 text-white text-xs font-extrabold shadow-xs hover:opacity-95 transition-opacity cursor-pointer"
              >
                <Plus className="w-4 h-4 shrink-0" />
                <span>Generate 8-Slide Country Pack</span>
              </button>
            </div>

            <div className="sm:col-span-3">
              <button
                onClick={() => handleCopyViralText('full')}
                className="w-full h-full inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-indigo-50 text-indigo-950 border border-indigo-300 text-xs font-extrabold shadow-2xs transition-colors cursor-pointer"
              >
                {copiedType === 'full' ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-emerald-700">Copied IG Post!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>Copy Viral IG Text</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* =====================================================================
            CATEGORY & COUNTRY PACK FILTER PILLS + ACTIVE PACK TOOLBAR
        ===================================================================== */}
        <div className="pt-2 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mr-1 flex items-center gap-1.5">
              <FolderOpen className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span>Categorized Packs:</span>
            </span>

            <button
              onClick={() => setActiveCategoryFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeCategoryFilter === 'ALL'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Cards ({allActiveSpecs.length})
            </button>

            <button
              onClick={() => setActiveCategoryFilter('PLATFORM')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeCategoryFilter === 'PLATFORM'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-indigo-50 text-indigo-900 hover:bg-indigo-100 border border-indigo-200/70'
              }`}
            >
              🌐 Platform Modules ({platformSpecsCount})
            </button>

            {countryCategories.map(cat => {
              const isSelected = activeCategoryFilter === cat.name;
              return (
                <button
                  key={cat.name}
                  onClick={() => {
                    setActiveCategoryFilter(cat.name);
                    const found = countries.find(c => c.name === cat.name || c.id === cat.countryId);
                    if (found) setSelectedCountryId(found.id);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-teal-600 to-indigo-600 text-white shadow-xs'
                      : 'bg-teal-50/80 text-teal-950 hover:bg-teal-100 border border-teal-200'
                  }`}
                >
                  <span>{cat.flag}</span>
                  <span>{cat.name}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-teal-200/70 text-teal-950'
                    }`}
                  >
                    {cat.count} Slides
                  </span>
                </button>
              );
            })}
          </div>

          {/* Dedicated Full-Width Action Bar when a Country Category is selected */}
          {activeCategoryFilter !== 'ALL' && activeCategoryFilter !== 'PLATFORM' && (
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <span className="text-base">{activeCountryForViralPost?.flag || '🌍'}</span>
                <span>
                  Viewing <strong>{activeCategoryFilter}</strong> Dossier Carousel Pack ({filteredSpecs.length} Portrait Slides)
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleCopyViralText('full')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-2xs transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5 shrink-0" />
                  <span>Copy {activeCategoryFilter} Viral IG Post</span>
                </button>

                <button
                  onClick={() => handleDownloadCountryPackAll(activeCategoryFilter)}
                  disabled={isBatchDownloading}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-extrabold shadow-2xs transition-colors cursor-pointer"
                >
                  <FolderArchive className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    {isBatchDownloading
                      ? 'Downloading Pack...'
                      : `Download All ${filteredSpecs.length} PNG Slides`}
                  </span>
                </button>

                <button
                  onClick={() => handleDeleteCountryPack(activeCategoryFilter)}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-colors cursor-pointer"
                  title={`Delete all ${activeCategoryFilter} slides`}
                >
                  <Trash2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Remove Pack</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* =====================================================================
          SECTION 2: VIRAL INSTAGRAM POST CAPTION & HASHTAGS STUDIO
      ===================================================================== */}
      {activeCountryForViralPost && viralPostData && (
        <div className="bg-white rounded-3xl border border-indigo-200/80 p-5 sm:p-6 shadow-sm space-y-4">
          {/* Header & Country / Style Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-amber-50 text-amber-900 border border-amber-200">
                  <Wand2 className="w-3 h-3 text-amber-600 shrink-0" />
                  <span>Viral Instagram Post Copywriter</span>
                </span>
                <span className="text-xs font-extrabold text-indigo-950">
                  {activeCountryForViralPost.flag} {activeCountryForViralPost.name} ·{' '}
                  <span className="font-mono text-teal-700">
                    ${activeCountryForViralPost.costOfLiving.monthlyBudgetSingleUSD.toLocaleString()}/mo
                  </span>
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                Ready-to-Post Viral Instagram Caption &amp; Targeted Hashtags for {activeCountryForViralPost.name}
              </h3>
            </div>

            {/* 4 Viral Caption Angle Switcher Buttons */}
            <div className="flex flex-wrap items-center gap-1.5">
              {(
                [
                  { id: 'viral-hook', label: '🔥 Viral Hook & Dossier' },
                  { id: 'carousel-guide', label: '📊 8-Slide Walkthrough' },
                  { id: 'fire-arbitrage', label: '💰 FIRE Math & Arbitrage' },
                  { id: 'reel-short', label: '⚡ Short Reel / Story' },
                ] as { id: ViralCaptionStyle; label: string }[]
              ).map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setCaptionStyle(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    captionStyle === tab.id
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Editable Viral Caption Textarea */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 font-semibold">
              <span>
                Style: <strong className="text-slate-800">{viralPostData.styleLabel}</strong> (Click inside the box to customize any line before copying)
              </span>
              <span className="font-mono">
                {displayedViralText.length.toLocaleString()} / 2,200 IG chars
              </span>
            </div>

            <textarea
              rows={11}
              value={displayedViralText}
              onChange={e => setCustomCaptionOverride(e.target.value)}
              className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 font-sans leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
              aria-label={`Viral Instagram post text for ${activeCountryForViralPost.name}`}
            />
          </div>

          {/* Action Bar: Copy Full Post, Copy Caption Only, Copy Hashtags, Download .TXT */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleCopyViralText('full')}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 via-indigo-600 to-violet-600 hover:opacity-95 text-white text-xs font-extrabold shadow-xs transition-all cursor-pointer"
              >
                {copiedType === 'full' ? (
                  <>
                    <Check className="w-4 h-4 shrink-0" />
                    <span>Copied Full Viral Post!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 shrink-0" />
                    <span>Copy Full Viral Post (Caption + Hashtags)</span>
                  </>
                )}
              </button>

              <button
                onClick={() => handleCopyViralText('caption')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
              >
                {copiedType === 'caption' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="text-emerald-700">Copied Caption!</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                    <span>Copy Caption Only</span>
                  </>
                )}
              </button>

              <button
                onClick={() => handleCopyViralText('hashtags')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
              >
                {copiedType === 'hashtags' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="text-emerald-700">Copied Hashtags!</span>
                  </>
                ) : (
                  <>
                    <Hash className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>Copy Hashtags Only</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {customCaptionOverride !== null && (
                <button
                  onClick={() => setCustomCaptionOverride(null)}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                  <span>Reset Text</span>
                </button>
              )}

              <button
                onClick={handleDownloadViralTextFile}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span>Download Post (.txt)</span>
              </button>
            </div>
          </div>
        </div>
      )}

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
              <span>{toastMessage}</span>
            </span>
            <button onClick={() => setToastMessage(null)} className="text-emerald-700 hover:text-emerald-950">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =====================================================================
          SECTION 3: GALLERY GRID OF PORTRAIT PROMOTIONAL SNAPSHOTS (3-Col Balanced)
      ===================================================================== */}
      {filteredSpecs.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <p className="text-sm font-bold text-slate-700">
            No promotional snapshots in this category yet.
          </p>
          <button
            onClick={() => setActiveCategoryFilter('ALL')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>View All Snapshots</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredSpecs.map(spec => {
            const key = `${spec.id}_${aspect}`;
            const imgUrl = renderedUrls[key];
            return (
              <motion.div
                key={spec.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative overflow-hidden bg-white rounded-3xl border border-indigo-200/80 shadow-sm flex flex-col justify-between p-4 sm:p-5"
              >
                <div className="w-full">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-indigo-50 text-indigo-900 border border-indigo-200 truncate">
                      {spec.countryName
                        ? `${spec.countryFlag || ''} ${spec.countryName} · Slide ${spec.slideNumber}/${spec.totalSlides}`
                        : spec.category}
                    </span>
                    <span className="font-mono text-[11px] font-bold text-slate-500 shrink-0">
                      {aspect === '9:16' ? '1080×1920' : '1080×1350'}
                    </span>
                  </div>

                  {spec.styleTag && (
                    <p className="text-xs font-bold text-teal-700 mb-1 truncate">
                      🎨 {spec.styleTag}
                    </p>
                  )}

                  <h3 className="text-sm font-extrabold text-slate-900 mb-3 line-clamp-1" title={spec.title}>
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
                      <div className="aspect-[9/16] flex items-center justify-center text-xs text-slate-400 font-bold p-4 text-center">
                        {isRendering ? 'Rendering HD Infographic...' : 'Preparing Preview...'}
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

                {/* Action Buttons: Download PNG, Copy Country IG Caption, Discard */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => handleDownloadSnapshot(spec)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 via-indigo-600 to-violet-600 hover:from-teal-500 hover:to-violet-500 text-white text-xs font-extrabold shadow-xs transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 shrink-0" />
                    <span>Download PNG</span>
                  </button>

                  {spec.countryName && (
                    <button
                      onClick={() => {
                        const found = countries.find(
                          c => c.id === spec.countryId || c.name === spec.countryName
                        );
                        if (found) {
                          const post = buildViralInstagramPost(found, captionStyle);
                          if (navigator.clipboard && navigator.clipboard.writeText) {
                            navigator.clipboard.writeText(post.fullText);
                          }
                          setSelectedCountryId(found.id);
                          showToast(`Copied Viral Instagram Post for ${found.flag} ${found.name}!`);
                        }
                      }}
                      className="inline-flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 text-xs font-bold transition-colors cursor-pointer"
                      title={`Copy viral Instagram post caption for ${spec.countryName}`}
                    >
                      <Copy className="w-3.5 h-3.5 shrink-0" />
                      <span>IG Text</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleDiscardCard(spec)}
                    className="inline-flex items-center justify-center p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-colors cursor-pointer"
                    title="Discard / Delete this slide"
                  >
                    <Trash2 className="w-3.5 h-3.5 shrink-0" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Full-Size Lightbox Inspector Modal with Carousel Prev/Next */}
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
              className="bg-white rounded-3xl border border-indigo-200 p-5 max-w-xl w-full shadow-2xl space-y-4 my-8"
            >
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="min-w-0">
                  <h4 className="text-sm font-extrabold text-slate-900 truncate">{previewSpec.title}</h4>
                  <span className="text-[11px] text-slate-500">
                    {previewSpec.styleTag ? `${previewSpec.styleTag} · ` : ''}
                    High-Resolution Portrait ({aspect === '9:16' ? '1080×1920' : '1080×1350'} px)
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {filteredSpecs.length > 1 && (
                    <>
                      <button
                        onClick={() => handleNavigatePreview(-1)}
                        className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                        title="Previous Slide"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleNavigatePreview(1)}
                        className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                        title="Next Slide"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setPreviewSpec(null)}
                    className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
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

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  onClick={() => handleDiscardCard(previewSpec)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Discard Slide</span>
                </button>

                <div className="flex flex-wrap items-center gap-2">
                  {previewSpec.countryName && (
                    <button
                      onClick={() => handleDownloadCountryPackAll(previewSpec.countryName!)}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold cursor-pointer"
                    >
                      <FolderArchive className="w-4 h-4" />
                      <span>Download All {previewSpec.countryName} Slides</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleDownloadSnapshot(previewSpec)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 via-indigo-600 to-violet-600 text-white text-xs font-extrabold shadow-sm cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PNG</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
