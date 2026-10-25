import React, { useState, useEffect, useCallback } from 'react';
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
  | 'country-magazine-cover';

export interface SocialPromoCardSpec {
  id: string;
  layout: PromoVisualLayout;
  category: 'Core Platform Module' | 'Feature Spotlight' | 'Country Dossier Spotlight';
  title: string;
  badge: string;
  headline: string;
  subheadline: string;
  ctaText: string;
  countryData?: {
    id: string;
    code?: string;
    name: string;
    flag: string;
    region: string;
    capital: string;
    tagline: string;
    imageUrl: string;
    landmarkLabel?: string;
    singleBudget: number;
    coupleBudget: number;
    rentCenter: number;
    visaName: string;
    minIncome: number;
    healthcareScore: number;
    safetyScore: number;
    walkabilityScore: number;
    sunnyDays: number;
    avgTempC: number;
    topCities: { name: string; vibe: string; monthlyCostUSD: number }[];
  };
}

const DEFAULT_FEATURE_SNAPSHOTS: SocialPromoCardSpec[] = [
  {
    id: 'promo-overview-matchmaker',
    layout: 'bento-destinations',
    category: 'Core Platform Module',
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
    title: '7. Lifestyle, Dating & Community — Green/Red Flags & Meetups',
    badge: 'LIFESTYLE, DATING NORMS & EXPAT COMMUNITY',
    headline: 'Real Cultural Insights, Scam Shield & Expat Meetups',
    subheadline:
      'Know what is normal vs. a red flag, master local etiquette, and connect with verified expats abroad.',
    ctaText: 'Join the Expat Network at ReFIREly.com',
  },
];

function buildCountryPromoCardSpec(country: Country): SocialPromoCardSpec {
  const photoCfg = getCountryPhotoConfig(country.id, country.imageUrl);
  return {
    id: `promo-country-${country.id}-${Date.now()}`,
    layout: 'country-magazine-cover',
    category: 'Country Dossier Spotlight',
    title: `${country.flag} ${country.name} — Magazine Cover Dossier Card`,
    badge: `${country.region.toUpperCase()} · VERIFIED RETIREMENT HAVEN`,
    headline: `Retire in ${country.name}`,
    subheadline: country.tagline,
    ctaText: `Download ${country.name} Dossier at ReFIREly.com`,
    countryData: {
      id: country.id,
      code: country.code,
      name: country.name,
      flag: country.flag,
      region: country.region,
      capital: country.capital,
      tagline: country.tagline,
      imageUrl: photoCfg.photoUrl,
      landmarkLabel: photoCfg.landmarkLabel,
      singleBudget: country.costOfLiving.monthlyBudgetSingleUSD,
      coupleBudget: country.costOfLiving.monthlyBudgetCoupleUSD,
      rentCenter: country.costOfLiving.rent1BedCenterUSD,
      visaName: country.visa.retirementVisaName,
      minIncome: country.visa.minimumIncomeUSD,
      healthcareScore: country.lifestyle.healthcareScore,
      safetyScore: country.lifestyle.safetyScore,
      walkabilityScore: country.lifestyle.walkabilityScore,
      sunnyDays: country.climate.annualSunnyDays,
      avgTempC: country.climate.averageTempC,
      topCities: country.topCities.slice(0, 3).map(c => ({
        name: c.name,
        vibe: c.vibe,
        monthlyCostUSD: c.monthlyCostUSD,
      })),
    },
  };
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

  return curY + boxSize + (isStory ? 42 : 26);
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
  const ctaH = isStory ? 86 : 66;
  const ctaY = height - (isStory ? 132 : 94);
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

  ctx.font = `900 ${isStory ? '26px' : '21px'} Inter, system-ui, sans-serif`;
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.fillText(`${ctaText}  →`, width / 2, ctaY + (isStory ? 53 : 41));
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
  ctx.fillText(label, cx, cy + radius + 30);
  ctx.textAlign = 'left';
}

/**
 * Renders 8 visually distinct Portrait Infographics & UI Snapshots on Canvas.
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
  // STYLE 1: WARM EDITORIAL BENTO DESTINATION GRID (LIGHT MAGAZINE THEME)
  // =========================================================================
  if (spec.layout === 'bento-destinations') {
    const bg = ctx.createLinearGradient(0, 0, width, height);
    bg.addColorStop(0, '#fffbeb');
    bg.addColorStop(0.5, '#f8fafc');
    bg.addColorStop(1, '#f0fdfa');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    // Decorative Top Sunburst Strip
    const topStrip = ctx.createLinearGradient(0, 0, width, 0);
    topStrip.addColorStop(0, '#f59e0b');
    topStrip.addColorStop(0.5, '#ec4899');
    topStrip.addColorStop(1, '#6366f1');
    ctx.fillStyle = topStrip;
    ctx.fillRect(0, 0, width, 14);

    let curY = drawBrandHeader(ctx, iconImg, width, padX, isStory ? 72 : 44, isStory, true);

    // Badge
    roundRect(ctx, padX, curY, 440, 40, 20);
    ctx.fillStyle = '#fef3c7';
    ctx.fill();
    ctx.font = '800 16px Inter, system-ui, sans-serif';
    ctx.fillStyle = '#b45309';
    ctx.fillText(spec.badge, padX + 20, curY + 26);
    curY += isStory ? 76 : 58;

    // Headline
    ctx.font = `900 ${isStory ? '54px' : '42px'} Inter, system-ui, sans-serif`;
    ctx.fillStyle = '#0f172a';
    curY = drawWrappedText(ctx, spec.headline, padX, curY, contentW, isStory ? 62 : 48, 2);
    curY += 8;

    ctx.font = `600 ${isStory ? '24px' : '19px'} Inter, system-ui, sans-serif`;
    ctx.fillStyle = '#475569';
    curY = drawWrappedText(ctx, spec.subheadline, padX, curY, contentW, isStory ? 34 : 26, 2);
    curY += isStory ? 28 : 16;

    // AI Filter Bar Pill
    const filterH = isStory ? 76 : 60;
    roundRect(ctx, padX, curY, contentW, filterH, 22);
    ctx.fillStyle = '#1e1b4b';
    ctx.fill();
    ctx.font = `800 ${isStory ? '20px' : '17px'} Inter, system-ui, sans-serif`;
    ctx.fillStyle = '#fde68a';
    ctx.fillText('✨ AI Match Filter: Couple ≤ $2,400/mo  ·  300+ Sunny Days  ·  High Healthcare', padX + 28, curY + (isStory ? 45 : 37));
    curY += filterH + (isStory ? 28 : 18);

    // 2x2 Bento Destination Cards with Real Country Photos & Match Gauges
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

      // Top Scenic Banner inside Bento Card
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

        ctx.beginPath();
        ctx.arc(cx + cardW - 65, cy + 50, 36, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.22)';
        ctx.fill();
      }

      // Match Pill in Banner
      roundRect(ctx, cx + 22, cy + 20, 148, 38, 19);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
      ctx.fill();
      ctx.font = '900 17px Inter, system-ui, sans-serif';
      ctx.fillStyle = '#4ade80';
      ctx.fillText(`★ ${c.match}% Match`, cx + 40, cy + 45);

      // Country Title & Details
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

      // Bottom Price Strip
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
  // STYLE 2: EMERALD WEALTH & FIRE CALCULATOR (BAR CHART + DONUT CHART)
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

    // CHART CARD 1: Horizontal Cost Comparison Bar Chart
    const box1H = isStory ? 440 : 300;
    roundRect(ctx, padX, curY, contentW, box1H, 30);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.font = `900 ${isStory ? '26px' : '21px'} Inter, system-ui, sans-serif`;
    ctx.fillStyle = '#0f172a';
    ctx.fillText('📊 Annual Couple Retirement Spend Comparison', padX + 36, curY + (isStory ? 52 : 40));

    // US/UK Bar
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

    // Overseas Haven Bar
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

    // Giant Savings Callout Pill
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

    // CHART CARD 2: Multi-Segment Donut Chart of Monthly Couple Budget ($2,150/mo)
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

    // Legend Rows on Right of Donut
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
  // STYLE 3: 3D SATELLITE GLOBE & ORBITAL WORLD ATLAS (SPACE CYAN/VIOLET)
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

    // Draw Giant 3D Wireframe Globe in Center
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

    // Latitude & Longitude Ellipses on Globe
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

    // Floating Pin Callouts around the 3D Globe
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

    // Bottom Continent Breakdown Cards
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
  // STYLE 4: SWISS GOLD & ROYAL SLATE — BANKING, FX WATERFALL & TAX DIAGRAM
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

    // Visual FX Transfer Comparison Card ($3,000 Monthly Pension Transfer)
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

    // Left: Retail Bank SWIFT
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

    // Right: Smart Multi-Currency Route
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

    // 3 Tax Pillar Cards Below
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
  // STYLE 5: CLEAN MEDICAL TEAL — HEALTHCARE GAUGES & PROCEDURE COST BARS
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

    // 3 Circular Quality Gauges Card
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

    // Out-of-Pocket Medical Procedure Cost Comparison Bars
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

      // Dual Bar Track
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
  // STYLE 6: COMPARE STUDIO — 6-AXIS SPIDER RADAR CHART & 3-COUNTRY MATRIX
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

    // 6-Axis Radar Chart Box
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

    // Concentric Hexagons
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

    // Axis Labels
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

    // Draw 2 Overlapping Country Polygons (Portugal vs Thailand)
    const poly1 = [0.78, 0.92, 0.94, 0.86, 0.88, 0.85]; // Portugal
    const poly2 = [0.96, 0.86, 0.82, 0.9, 0.92, 0.72]; // Thailand

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

    // 3-Column Comparison Matrix Table Below Radar
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
  // STYLE 7: LIFESTYLE, DATING & COMMUNITY — GREEN VS RED FLAGS + MEETUP PASS
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

    // Two-Column Visual Split: GREEN FLAGS (Normal Culture) vs RED FLAGS (Scams to Avoid)
    const splitW = (contentW - 24) / 2;
    const splitH = isStory ? 620 : 420;

    // Left: Emerald Green Flags
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

    // Right: Crimson Red Flags
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

    // Bottom Expat Community & Live Meetup Pass Card
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
  // STYLE 8: CUSTOM COUNTRY DOSSIER MAGAZINE COVER (WITH PHOTO & GAUGES)
  // =========================================================================
  const cd = spec.countryData;
  const photoCfg = getCountryPhotoConfig(cd?.id || 'portugal', cd?.imageUrl);
  const [heroImg, flagImg] = await Promise.all([
    loadExternalImageWithFallbacks(photoCfg.candidateUrls),
    cd?.code
      ? loadExternalImage(`https://flagcdn.com/w160/${cd.code.toLowerCase()}.png`)
      : Promise.resolve(null),
  ]);

  const bg = ctx.createLinearGradient(0, 0, width, height);
  bg.addColorStop(0, '#0f172a');
  bg.addColorStop(1, '#1e1b4b');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  let curY = drawBrandHeader(ctx, iconImg, width, padX, isStory ? 68 : 40, isStory, false);

  // Hero Photo Banner Card
  const photoH = isStory ? 460 : 295;
  ctx.save();
  roundRect(ctx, padX, curY, contentW, photoH, 32);
  ctx.clip();

  if (heroImg) {
    drawCoverImage(ctx, heroImg, padX, curY, contentW, photoH);
  } else {
    // Rich Illustrated Coastal & Mountain Panorama Fallback if Offline
    const fallbackG = ctx.createLinearGradient(padX, curY, padX + contentW, curY + photoH);
    fallbackG.addColorStop(0, '#0284c7');
    fallbackG.addColorStop(0.5, '#0d9488');
    fallbackG.addColorStop(1, '#1e1b4b');
    ctx.fillStyle = fallbackG;
    ctx.fillRect(padX, curY, contentW, photoH);

    // Golden Sun & Mountain Horizon
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

  // Smooth Editorial Gradient Scrim for Text Contrast while keeping Country Photo vibrant
  const darkOverlay = ctx.createLinearGradient(padX, curY, padX, curY + photoH);
  darkOverlay.addColorStop(0, 'rgba(15, 23, 42, 0.12)');
  darkOverlay.addColorStop(0.45, 'rgba(15, 23, 42, 0.18)');
  darkOverlay.addColorStop(1, 'rgba(15, 23, 42, 0.9)');
  ctx.fillStyle = darkOverlay;
  ctx.fillRect(padX, curY, contentW, photoH);

  // Top-Left Region Badge Pill over Country Photo
  roundRect(ctx, padX + 28, curY + 26, 370, 42, 21);
  ctx.fillStyle = 'rgba(15, 23, 42, 0.72)';
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = 'rgba(94, 234, 212, 0.55)';
  ctx.stroke();
  ctx.font = '800 15px Inter, system-ui, sans-serif';
  ctx.fillStyle = '#5eead4';
  ctx.fillText(spec.badge, padX + 48, curY + 52);

  // Top-Right Landmark Location Caption Pill over Country Photo
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

  // Country Flag + Headline + Tagline over Bottom of Country Photo
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

  // Subtle Inner Photo Frame Border
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
  roundRect(ctx, padX, curY, contentW, photoH, 32);
  ctx.stroke();
  ctx.restore();

  curY += photoH + (isStory ? 24 : 16);

  // 3 Circular Score Gauges + Cost Box
  const midH = isStory ? 260 : 185;
  roundRect(ctx, padX, curY, contentW, midH, 28);
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  const gR = isStory ? 62 : 44;
  const gCy = curY + (isStory ? 110 : 78);
  drawCircularGauge(ctx, padX + contentW * 0.18, gCy, gR, cd?.healthcareScore || 88, 'Healthcare', '#0d9488', '#ccfbf1', '#0f172a', '#0f766e');
  drawCircularGauge(ctx, padX + contentW * 0.45, gCy, gR, cd?.safetyScore || 90, 'Safety Index', '#4f46e5', '#e0e7ff', '#0f172a', '#4338ca');

  // Right Cost Callout Box inside White Card
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

  // Visa & Top Expat Cities Cards
  const botH = isStory ? 540 : 360;
  roundRect(ctx, padX, curY, contentW, botH, 28);
  ctx.fillStyle = 'rgba(30, 41, 59, 0.9)';
  ctx.fill();

  ctx.font = `800 ${isStory ? '22px' : '18px'} Inter, system-ui, sans-serif`;
  ctx.fillStyle = '#fde68a';
  ctx.fillText(`🛂 ${cd?.visaName || 'Retirement Visa'} · Min Income $${(cd?.minIncome || 1500).toLocaleString()}/mo · ☀️ ${cd?.sunnyDays || 290} Sunny Days`, padX + 32, curY + (isStory ? 52 : 38));

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
const CUSTOM_COUNTRY_STORAGE_KEY = 'refirely_admin_custom_country_snapshots_v2';

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
    showToast(`Generated Magazine Cover Snapshot for ${target.name}!`);
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
                {activeSpecs.length} Unique Infographic Designs Ready
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-slate-900 via-indigo-950 to-teal-900 bg-clip-text text-transparent">
              Portrait Social Media Infographics &amp; Feature Snapshots
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              Every card below features its own distinct visual style, color theme, and data visualization (Bento Destination Grid, Donut &amp; Bar Charts, 3D Orbital Globe, FX Waterfall, JCI Gauges, 6-Axis Radar Chart, Green/Red Flag Split, and Country Photo Magazine Covers).
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
              Generate Country Magazine-Cover Portrait Card (With Country Photo &amp; Score Gauges)
            </span>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Pick any of the {countries.length} countries to generate a travel-magazine style portrait card with its hero photography, circular gauges, and top 3 towns.
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
              <span>Generate Country Cover</span>
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
