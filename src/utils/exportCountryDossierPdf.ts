import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Country,
  CommunityThread,
  ExpatMeetup,
  CountryJournalEntry,
  UserProfile,
  ShortTermVisaOption,
} from '../types';
import { getFaqsForCountry } from '../data/countryFaqs';
import { SHORT_TERM_VISA_DATABASE } from '../data/shortTermVisas';
import { getCountryTravelMobility } from '../data/countryTravelMobility';
import { getCountryHealthcareProfile } from '../data/countryHealthcare';
import { COUNTRY_EXCHANGE_RATES } from '../components/AnnualRetirementBudgetCalculator';
import { generateBrandSvgString } from './exportBrandLogo';

export interface DossierExportOptions {
  includeExecutiveSummary: boolean;
  includePersonalReadinessAndJournal: boolean;
  includeVisaAndLegal: boolean;
  includeShortTermVisas: boolean;
  includeHealthcareAndInsurance?: boolean;
  includeCostAndBudget: boolean;
  includeHousingAndRentals?: boolean;
  includeTravelAndMobility: boolean;
  includeClimateAndTowns: boolean;
  includeDemographicsAndLifestyle: boolean;
  includeDiscreetNightlife: boolean;
  includeRelocationFaqs: boolean;
  includeCommunityAndMeetups: boolean;
}

export interface DossierExportContext {
  country: Country;
  userProfile?: UserProfile;
  isAuthenticated?: boolean;
  journalEntry?: CountryJournalEntry;
  threads: CommunityThread[];
  meetups: ExpatMeetup[];
  options: DossierExportOptions;
}

/**
 * Sanitizes text for standard PDF fonts (Helvetica) so non-Latin glyphs or emojis
 * do not render as garbled characters while keeping European accents and punctuation clean.
 */
function sanitizePdfText(input: string | undefined | null): string {
  if (!input) return '';
  return input
    .replace(/€/g, 'EUR ')
    .replace(/£/g, 'GBP ')
    .replace(/฿/g, 'THB ')
    .replace(/₱/g, 'PHP ')
    .replace(/₫/g, 'VND ')
    .replace(/₡/g, 'CRC ')
    .replace(/¥/g, 'JPY ')
    .replace(/₹/g, 'INR ')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/—/g, ' - ')
    .replace(/–/g, '-')
    .replace(/…/g, '...')
    .replace(/•/g, '-')
    .replace(/✓/g, '[Yes]')
    .replace(/♂/g, 'M')
    .replace(/♀/g, 'F')
    .replace(/→/g, '->')
    .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '')
    .replace(/[^\x00-\xFF]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function getStructuredVisaRows(c: Country) {
  const ageReq =
    c.id === 'thailand' || c.id === 'malaysia' || c.id === 'philippines'
      ? 'Age 50 years or older'
      : 'Any age with qualifying passive pension / investment income';

  const singleIncome = `$${c.visa.minimumIncomeUSD.toLocaleString()} USD / month`;
  const coupleIncome =
    c.id === 'portugal'
      ? `$${Math.round(c.visa.minimumIncomeUSD * 1.5).toLocaleString()} USD / mo (+50% for spouse)`
      : c.id === 'spain'
      ? `$${Math.round(c.visa.minimumIncomeUSD * 1.25).toLocaleString()} USD / mo (+100% IPREM for spouse)`
      : c.id === 'costa-rica' || c.id === 'panama'
      ? `$${c.visa.minimumIncomeUSD.toLocaleString()} USD / mo (covers spouse)`
      : `$${Math.round(c.visa.minimumIncomeUSD * 1.3).toLocaleString()} USD / mo (+30% dependent buffer)`;

  const bankBuffer =
    c.id === 'thailand'
      ? '800,000 THB (~$22,500 USD) deposited in a Thai bank, or pension certification'
      : c.id === 'portugal'
      ? 'Recommended EUR 10,000-15,000 buffer in Portuguese bank account'
      : c.id === 'spain'
      ? 'Proof of EUR 28,800/yr savings if applying via lump-sum solvency'
      : c.id === 'philippines'
      ? '$10,000 USD time deposit with $800 pension, or $20,000 deposit'
      : c.id === 'malaysia'
      ? 'RM 150,000 (~$35,000 USD) fixed deposit for Sarawak MM2H'
      : 'Sufficient liquid funds to establish household (~$5,000-$10,000 buffer)';

  const initialDuration =
    c.id === 'panama'
      ? 'Indefinite (Direct Permanent Residency upon approval)'
      : c.id === 'portugal'
      ? '2 Years (after initial 120-day entry stamp)'
      : c.id === 'spain'
      ? '1 Year (Non-Lucrative Resident Visa)'
      : c.id === 'costa-rica'
      ? '2 Years (Temporary Residency)'
      : c.id === 'france'
      ? '1 Year (VLS-TS Visiteur)'
      : c.id === 'thailand'
      ? '1 Year renewable (or 10 Years with LTR)'
      : '1 to 2 Years renewable';

  const renewalCadence =
    c.id === 'panama'
      ? 'Permanent status; valid for life with biennial entry'
      : c.id === 'portugal' || c.id === 'spain' || c.id === 'france' || c.id === 'greece' || c.id === 'italy'
      ? 'Renewable every 2-3 years; eligible for Permanent Residency & EU Passport after 5 years'
      : c.id === 'costa-rica'
      ? 'Renewable every 2 years; eligible for Permanent Residency after 3 years'
      : c.id === 'thailand'
      ? 'Renewable annually indefinitely at local immigration'
      : 'Renewable every 1-2 years; pathway to PR after 3-5 years';

  const stayRequirement =
    c.id === 'portugal'
      ? 'Average 8 months/year in-country (or 6 consecutive months)'
      : c.id === 'spain'
      ? '183 days per year to maintain residency renewals'
      : c.id === 'panama'
      ? 'Visit Panama at least once every 24 months'
      : c.id === 'costa-rica'
      ? 'At least 1 day per calendar year in Costa Rica'
      : c.id === 'thailand'
      ? 'No minimum stay; 90-day address report when in Thailand'
      : 'Minimum 3 to 6 months annually to preserve renewal eligibility';

  const workRights = c.visa.allowedToWork
    ? 'Remote digital work, passive investments, and overseas client freelancing permitted'
    : 'Strictly passive income only (pensions, dividends, rental income); local employment prohibited';

  const medicalReq =
    c.id === 'spain'
      ? 'Spanish private policy with zero copays and zero deductibles (Sanitas, Adeslas)'
      : c.id === 'costa-rica'
      ? 'Mandatory enrollment in CAJA universal healthcare upon residency grant'
      : c.id === 'thailand'
      ? 'Health insurance with min. $50,000-$100,000 coverage (O-A / LTR)'
      : 'Comprehensive private medical insurance covering hospitalization & repatriation';

  const backgroundDocs =
    'Apostilled FBI / national criminal background check (issued within 90-180 days) + birth/marriage certificates';

  return [
    ['Minimum Age Eligibility', ageReq, 'Primary applicant requirement'],
    ['Single Applicant Income', singleIncome, 'Verifiable pension, Social Security, or passive income'],
    ['Couple / Spouse Income', coupleIncome, 'Combined household requirement including spouse'],
    ['Bank Deposit / Reserve Buffer', bankBuffer, 'Held in local or accessible bank account'],
    ['Initial Visa Validity', initialDuration, `Processing time ~${c.visa.processingMonths} months`],
    ['Renewal & PR Timeline', renewalCadence, c.visa.pathwayToPR],
    ['Minimum Physical Stay', stayRequirement, 'Note: >183 days typically triggers tax residency'],
    ['Employment & Work Rights', workRights, c.visa.allowedToWork ? 'Remote work friendly' : 'Passive income only'],
    ['Health Insurance Mandate', medicalReq, `Est. ~$${c.costOfLiving.healthcareMonthlyUSD}/mo private policy`],
    ['Security & Clearances', backgroundDocs, 'Must be translated and apostilled'],
  ];
}

export function getShortTermVisasForCountry(country: Country): ShortTermVisaOption[] {
  return (
    SHORT_TERM_VISA_DATABASE[country.id] || [
      {
        id: `${country.id}-tourist`,
        name: `${country.name} Standard Tourist Entry Waiver`,
        category: 'Tourist & Scouting Stay',
        duration: '90 Days',
        financialRequirement: 'Proof of onward travel and economic solvency (~$50/day)',
        incomeThresholdUSD: 0,
        allowedActivities: 'Tourism, seasonal scouting, viewing property rentals. No domestic employment.',
        processingMethod: 'Visa waiver stamp on arrival for Western passport holders.',
        processingTime: 'Instant on entry',
        estimatedCost: 'Free ($0)',
        idealFor: 'Retirees exploring local cities and climate before submitting formal residency.',
        keyConditions: ['Return or onward plane ticket required.', 'Valid passport for 6 months.'],
      },
      {
        id: `${country.id}-visitor`,
        name: `${country.name} Temporary Visitor Permit`,
        category: 'Temporary Visitor (VLS)',
        duration: '1 Year Renewable',
        financialRequirement: `Proof of $${country.visa.minimumIncomeUSD.toLocaleString()} USD/mo self-sufficiency`,
        incomeThresholdUSD: country.visa.minimumIncomeUSD,
        allowedActivities: 'Extended independent living, studying, culture. Work prohibited.',
        processingMethod: 'Consular submission before travel.',
        processingTime: '30 to 60 days',
        estimatedCost: '~$100-$200 USD',
        idealFor: 'Retirees seeking a 12-month trial stay without immediate permanent immigration commitments.',
        keyConditions: ['Comprehensive private health insurance required.'],
      },
    ]
  );
}

let cachedLogoDataUrl: string | null = null;
let cachedIconDataUrl: string | null = null;
let brandAssetsPromise: Promise<{ logoDataUrl: string | null; iconDataUrl: string | null }> | null = null;

function rasterizeSvgToPngDataUrl(svgString: string, width: number, height: number): Promise<string | null> {
  return new Promise(resolve => {
    if (typeof window === 'undefined') {
      resolve(null);
      return;
    }
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(url);
          resolve(null);
          return;
        }
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL('image/png'));
      } catch {
        URL.revokeObjectURL(url);
        resolve(null);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    img.src = url;
  });
}

function loadImageAsDataUrl(url: string): Promise<string | null> {
  return new Promise(resolve => {
    if (typeof window === 'undefined') {
      resolve(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const context = canvas.getContext('2d');
        if (!context) {
          resolve(null);
          return;
        }
        context.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

export function preloadDossierBrandAssets(): Promise<{
  logoDataUrl: string | null;
  iconDataUrl: string | null;
}> {
  if (cachedLogoDataUrl && cachedIconDataUrl) {
    return Promise.resolve({ logoDataUrl: cachedLogoDataUrl, iconDataUrl: cachedIconDataUrl });
  }
  if (!brandAssetsPromise) {
    brandAssetsPromise = Promise.all([
      rasterizeSvgToPngDataUrl(generateBrandSvgString('horizontal-transparent'), 1200, 410).then(
        res => res || loadImageAsDataUrl('/assets/aistudio/refirely-logo.png')
      ),
      rasterizeSvgToPngDataUrl(generateBrandSvgString('square-emblem'), 256, 256).then(
        res => res || loadImageAsDataUrl('/assets/aistudio/refirely-icon.png')
      ),
    ]).then(([logo, icon]) => {
      cachedLogoDataUrl = logo;
      cachedIconDataUrl = icon;
      return { logoDataUrl: logo, iconDataUrl: icon };
    });
  }
  return brandAssetsPromise;
}

if (typeof window !== 'undefined') {
  preloadDossierBrandAssets();
}

export async function generateCountryDossierPdf(ctx: DossierExportContext): Promise<void> {
  const { country, userProfile, isAuthenticated, journalEntry, threads, meetups, options } = ctx;
  const includeHealthcare = options.includeHealthcareAndInsurance ?? true;
  const { logoDataUrl, iconDataUrl } = await preloadDossierBrandAssets();

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let currentY = 20;

  // Multi-Colored Luminous Design Theme Palette (Teal / Emerald / Indigo / Violet / Amber / Rose)
  const BRAND_NAVY: [number, number, number] = [15, 23, 42]; // #0f172a Slate/Indigo Dark
  const TEAL_600: [number, number, number] = [13, 148, 136]; // #0d9488
  const EMERALD_700: [number, number, number] = [4, 120, 87]; // #047857
  const INDIGO_600: [number, number, number] = [79, 70, 229]; // #4f46e5
  const INDIGO_900: [number, number, number] = [30, 27, 75]; // #1e1b4b
  const VIOLET_600: [number, number, number] = [124, 58, 237]; // #7c3aed
  const AMBER_600: [number, number, number] = [217, 119, 6]; // #d97706
  const SAFFRON: [number, number, number] = [234, 88, 12]; // #ea580c
  const ROSE_600: [number, number, number] = [225, 29, 72]; // #e11d48

  const SLATE_900: [number, number, number] = [15, 23, 42];
  const SLATE_700: [number, number, number] = [51, 65, 85];
  const SLATE_600: [number, number, number] = [71, 85, 105];
  const SLATE_300: [number, number, number] = [203, 213, 225];
  const SLATE_200: [number, number, number] = [226, 232, 240];

  // Soft Luminous Card Fills
  const TEAL_LIGHT: [number, number, number] = [240, 253, 250]; // #f0fdfa
  const INDIGO_LIGHT: [number, number, number] = [238, 242, 255]; // #eef2ff
  const VIOLET_LIGHT: [number, number, number] = [245, 243, 255]; // #f5f3ff
  const AMBER_LIGHT: [number, number, number] = [255, 251, 235]; // #fffbeb
  const ORANGE_LIGHT: [number, number, number] = [255, 247, 237]; // #fff7ed
  const ROSE_LIGHT: [number, number, number] = [255, 241, 242]; // #fff1f2

  const now = new Date();
  const dateFormatted = now.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const timeFormatted = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });
  const documentControlId = `REF-DOS-${country.code.toUpperCase()}-${now.getFullYear()}-${Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase()}`;

  // Multi-Colored 4-Segment Ribbon Bar Helper (Teal -> Indigo -> Violet -> Amber)
  const drawMultiColorRibbon = (x: number, y: number, w: number, h: number) => {
    const segW = w / 4;
    doc.setFillColor(...TEAL_600);
    doc.rect(x, y, segW, h, 'F');
    doc.setFillColor(...INDIGO_600);
    doc.rect(x + segW, y, segW, h, 'F');
    doc.setFillColor(...VIOLET_600);
    doc.rect(x + segW * 2, y, segW, h, 'F');
    doc.setFillColor(...AMBER_600);
    doc.rect(x + segW * 3, y, segW, h, 'F');
  };

  // Helper to ensure vertical space within a chapter, adding a page if needed
  const ensureSpace = (neededMm: number) => {
    if (currentY + neededMm > pageHeight - 22) {
      doc.addPage();
      currentY = 24;
    }
  };

  // Helper to start a dedicated new page for a chapter
  const startNewChapterPage = () => {
    doc.addPage();
    currentY = 24;
  };

  // Chapter Header Banner with Multi-Colored Theme Accents
  const drawChapterHeader = (
    chapterNum: string,
    title: string,
    subtitle?: string,
    accentColor: [number, number, number] = INDIGO_600,
    bgColor: [number, number, number] = INDIGO_LIGHT
  ) => {
    const bannerH = subtitle ? 15.5 : 10.5;
    // Soft luminous banner fill
    doc.setFillColor(...bgColor);
    doc.setDrawColor(...SLATE_200);
    doc.setLineWidth(0.25);
    doc.roundedRect(margin, currentY, contentWidth, bannerH, 2, 2, 'FD');

    // Top 4-color gradient micro-ribbon along chapter header
    drawMultiColorRibbon(margin, currentY, contentWidth, 1.3);

    // Left vertical accent bar
    doc.setFillColor(...accentColor);
    doc.rect(margin, currentY + 1.3, 3.8, bannerH - 1.3, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11.5);
    doc.setTextColor(...SLATE_900);
    doc.text(sanitizePdfText(`${chapterNum}. ${title.toUpperCase()}`), margin + 7.5, currentY + 7);

    if (subtitle) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.2);
      doc.setTextColor(...SLATE_600);
      doc.text(sanitizePdfText(subtitle), margin + 7.5, currentY + 12.5);
      currentY += 19.5;
    } else {
      currentY += 14.5;
    }
  };

  // Helper to draw formatted paragraphs
  const drawParagraph = (
    text: string,
    fontSize = 9.2,
    color: [number, number, number] = SLATE_700,
    indent = 0
  ) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(fontSize);
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(sanitizePdfText(text), contentWidth - indent);
    const lineHeight = fontSize * 0.43;
    ensureSpace(lines.length * lineHeight + 3.5);
    doc.text(lines, margin + indent, currentY);
    currentY += lines.length * lineHeight + 3.5;
  };

  // Helper to draw structured callout cards with top multi-color or themed bar
  const drawCalloutBox = (
    title: string,
    bodyText: string,
    borderColor: [number, number, number] = INDIGO_600,
    bgColor: [number, number, number] = INDIGO_LIGHT
  ) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.3);
    const lines = doc.splitTextToSize(sanitizePdfText(bodyText), contentWidth - 14);
    const boxHeight = lines.length * 3.9 + 14;
    ensureSpace(boxHeight + 4);

    doc.setFillColor(...bgColor);
    doc.setDrawColor(...borderColor);
    doc.setLineWidth(0.35);
    doc.roundedRect(margin, currentY, contentWidth, boxHeight, 2.5, 2.5, 'FD');

    // Top accent strip
    doc.setFillColor(...borderColor);
    doc.rect(margin + 0.5, currentY + 0.5, contentWidth - 1, 1.5, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.2);
    doc.setTextColor(...SLATE_900);
    doc.text(sanitizePdfText(title), margin + 6, currentY + 7);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.3);
    doc.setTextColor(...SLATE_700);
    doc.text(lines, margin + 6, currentY + 11.8);

    currentY += boxHeight + 4.5;
  };

  // Pre-fetch rich domain datasets for this country
  const hc = getCountryHealthcareProfile(country);
  const mobility = getCountryTravelMobility(country);
  const faqs = getFaqsForCountry(country);
  const shortVisas = getShortTermVisasForCountry(country);
  const currencyInfo = COUNTRY_EXCHANGE_RATES[country.id] || {
    rate: 1.0,
    symbol: country.currencySymbol || '$',
    code: country.currency || 'USD',
    name: 'Local Currency',
  };

  // =========================================================================
  // PAGE 1: DEDICATED PRESTIGE COVER PAGE (MULTI-COLORED LUMINOUS EDITION)
  // =========================================================================
  const centerX = pageWidth / 2;

  // Top Full-Width Multi-Color Brand Ribbon (Teal -> Indigo -> Violet -> Amber)
  drawMultiColorRibbon(0, 0, pageWidth, 4.5);

  // Outer Architectural Cover Frame with Indigo/Teal border
  doc.setDrawColor(...INDIGO_600);
  doc.setLineWidth(0.45);
  doc.roundedRect(margin, 11, contentWidth, 272, 4, 4, 'D');

  // Top inner multi-color ribbon inside cover frame
  drawMultiColorRibbon(margin + 0.5, 11.5, contentWidth - 1, 2);

  // --- SECTION A: OFFICIAL WEBSITE LOGO & BRAND IDENTITY (y = 18mm to 55mm) ---
  if (logoDataUrl) {
    const logoW = 72;
    const logoH = 24.6;
    doc.addImage(logoDataUrl, 'PNG', centerX - logoW / 2, 18, logoW, logoH);
  } else {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(26);
    doc.setTextColor(...BRAND_NAVY);
    doc.text('Re', centerX - 18, 34, { align: 'right' });
    doc.setTextColor(...SAFFRON);
    doc.text('FIRE', centerX - 17, 34, { align: 'left' });
    doc.setTextColor(...TEAL_600);
    doc.text('ly', centerX + 14, 34, { align: 'left' });
  }

  // Brand Mission Subtitle
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.6);
  doc.setTextColor(...INDIGO_900);
  doc.text(
    'GLOBAL RELOCATION INTELLIGENCE   |   FIRE ANALYTICS   |   HEALTHCARE & VISA ATLAS',
    centerX,
    48.5,
    { align: 'center' }
  );

  // Centered 4-Color Gradient Divider
  drawMultiColorRibbon(centerX - 36, 51.5, 72, 1.1);

  // --- SECTION B: DOSSIER BADGE & COUNTRY HERO TITLE (y = 57mm to 115mm) ---
  doc.setFillColor(...INDIGO_LIGHT);
  doc.setDrawColor(...INDIGO_600);
  doc.setLineWidth(0.3);
  doc.roundedRect(centerX - 56, 57, 112, 7, 3.5, 3.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.6);
  doc.setTextColor(...INDIGO_600);
  doc.text('OFFICIAL MASTER COUNTRY RETIREMENT DOSSIER', centerX, 61.7, { align: 'center' });

  // Country Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(...BRAND_NAVY);
  doc.text(sanitizePdfText(country.name.toUpperCase()), centerX, 74.5, { align: 'center' });

  // Geopolitical Metadata Strip
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.8);
  doc.setTextColor(...TEAL_600);
  doc.text(
    sanitizePdfText(
      `ISO: ${country.code.toUpperCase()}   |   REGION: ${country.region.toUpperCase()}   |   CAPITAL: ${country.capital.toUpperCase()}   |   CURRENCY: ${country.currency} (${currencyInfo.rate} / USD)`
    ),
    centerX,
    82,
    { align: 'center' }
  );

  // Country Tagline
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9.2);
  doc.setTextColor(...VIOLET_600);
  const coverTaglines = doc
    .splitTextToSize(sanitizePdfText(`"${country.tagline}"`), contentWidth - 26)
    .slice(0, 2);
  doc.text(coverTaglines, centerX, 89.5, { align: 'center' });

  // Concise Executive Overview Brief (3 lines max)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.2);
  doc.setTextColor(...SLATE_700);
  const coverOverviewLines = doc
    .splitTextToSize(sanitizePdfText(country.overview), contentWidth - 22)
    .slice(0, 3);
  doc.text(coverOverviewLines, centerX, 99.5, { align: 'center' });

  // --- SECTION C: 4-PILLAR MULTI-COLORED KEY BENCHMARK CARDS (y = 115mm to 141mm) ---
  const kpiCardsY = 115;
  const kpiCardH = 25;
  const kpiGap = 4;
  const kpiTotalW = contentWidth - 16; // 166mm
  const kpiCardW = (kpiTotalW - kpiGap * 3) / 4; // 38.5mm
  const kpiStartX = margin + 8;

  const coverKpis: Array<{
    label: string;
    value: string;
    sub: string;
    accent: [number, number, number];
    bg: [number, number, number];
  }> = [
    {
      label: 'MONTHLY BUDGET',
      value: `$${country.costOfLiving.monthlyBudgetSingleUSD.toLocaleString()} / $${country.costOfLiving.monthlyBudgetCoupleUSD.toLocaleString()}`,
      sub: 'Single / Couple (USD)',
      accent: TEAL_600,
      bg: TEAL_LIGHT,
    },
    {
      label: 'PRIMARY VISA',
      value: `$${country.visa.minimumIncomeUSD.toLocaleString()} / mo`,
      sub: sanitizePdfText(country.visa.retirementVisaName).slice(0, 22),
      accent: INDIGO_600,
      bg: INDIGO_LIGHT,
    },
    {
      label: 'HEALTH & SAFETY',
      value: `${country.lifestyle.healthcareScore} / ${country.lifestyle.safetyScore} (of 100)`,
      sub: `ER: ${hc.emergencyServices.emergencyNumberPrimary} | ~$${country.costOfLiving.healthcareMonthlyUSD}/mo`,
      accent: VIOLET_600,
      bg: VIOLET_LIGHT,
    },
    {
      label: 'ANNUAL CLIMATE',
      value: `${country.climate.annualSunnyDays} Sunny Days`,
      sub: `Avg. ${country.climate.averageTempC}C Year-Round`,
      accent: AMBER_600,
      bg: AMBER_LIGHT,
    },
  ];

  coverKpis.forEach((kpi, idx) => {
    const cardX = kpiStartX + idx * (kpiCardW + kpiGap);
    doc.setFillColor(...kpi.bg);
    doc.setDrawColor(...kpi.accent);
    doc.setLineWidth(0.3);
    doc.roundedRect(cardX, kpiCardsY, kpiCardW, kpiCardH, 2.5, 2.5, 'FD');

    // Colored top bar inside card
    doc.setFillColor(...kpi.accent);
    doc.rect(cardX + 0.5, kpiCardsY + 0.5, kpiCardW - 1, 2.2, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(...kpi.accent);
    doc.text(kpi.label, cardX + kpiCardW / 2, kpiCardsY + 7.5, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.2);
    doc.setTextColor(...BRAND_NAVY);
    doc.text(kpi.value, cardX + kpiCardW / 2, kpiCardsY + 14.5, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.6);
    doc.setTextColor(...SLATE_600);
    doc.text(kpi.sub, cardX + kpiCardW / 2, kpiCardsY + 20.8, { align: 'center' });
  });

  // --- SECTION D: SOVEREIGN, HEALTHCARE & RETIREMENT SPECIFICATION MATRIX (y = 146mm to 198mm) ---
  const specCardY = 146;
  const specCardHeight = 52;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...INDIGO_600);
  doc.setLineWidth(0.35);
  doc.roundedRect(kpiStartX, specCardY, kpiTotalW, specCardHeight, 3, 3, 'FD');

  // Header band inside specification card
  doc.setFillColor(...INDIGO_LIGHT);
  doc.rect(kpiStartX + 0.5, specCardY + 0.5, kpiTotalW - 1, 8.5, 'F');
  drawMultiColorRibbon(kpiStartX + 0.5, specCardY + 0.5, kpiTotalW - 1, 1.4);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.8);
  doc.setTextColor(...INDIGO_900);
  doc.text(
    'CORE COUNTRY, HEALTHCARE, FINANCIAL & RETIREMENT SPECIFICATION MATRIX',
    kpiStartX + 6,
    specCardY + 6.5
  );

  const singleFireTarget = country.costOfLiving.monthlyBudgetSingleUSD * 12 * 25;
  const coupleFireTarget = country.costOfLiving.monthlyBudgetCoupleUSD * 12 * 25;

  const leftSpecs: Array<[string, string]> = [
    ['Official Language:', `${country.language} (English: ${country.lifestyle.englishProficiency})`],
    ['Single 4% FIRE Target:', `$${singleFireTarget.toLocaleString()} USD Nest Egg`],
    ['1-Bed City Center Rent:', `$${country.costOfLiving.rent1BedCenterUSD.toLocaleString()} USD / month`],
    ['Public Health System:', hc.routineCare.publicSystemName.slice(0, 32)],
    ['Expat Community Scale:', `${country.lifestyle.expatCommunitySize} Resident Network`],
  ];

  const rightSpecs: Array<[string, string]> = [
    ['Private Health Policy:', `~$${country.costOfLiving.healthcareMonthlyUSD} USD / mo (Score: ${hc.overallScore}/100)`],
    ['Couple 4% FIRE Target:', `$${coupleFireTarget.toLocaleString()} USD Nest Egg`],
    ['1-Bed Outside Center:', `$${country.costOfLiving.rent1BedOutsideUSD.toLocaleString()} USD / month`],
    ['Emergency Dispatch:', `Dial ${hc.emergencyServices.emergencyNumberPrimary} (Reliability: ${hc.emergencyServices.responseReliabilityScore}/100)`],
    ['Premier Expat Towns:', country.topCities.slice(0, 3).map(t => t.name).join(', ')],
  ];

  leftSpecs.forEach(([label, val], idx) => {
    const rowY = specCardY + 15.5 + idx * 7.8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...INDIGO_900);
    doc.text(sanitizePdfText(label), kpiStartX + 5.5, rowY);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...SLATE_700);
    doc.text(sanitizePdfText(val).slice(0, 34), kpiStartX + 39, rowY);
  });

  rightSpecs.forEach(([label, val], idx) => {
    const rowY = specCardY + 15.5 + idx * 7.8;
    const col2X = kpiStartX + kpiTotalW / 2 + 2;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...TEAL_600);
    doc.text(sanitizePdfText(label), col2X, rowY);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...SLATE_700);
    doc.text(sanitizePdfText(val).slice(0, 32), col2X + 33, rowY);
  });

  // --- SECTION E: DOCUMENT PROVENANCE, DOWNLOAD AUDIT & LICENSE CARD (y = 204mm to 251mm) ---
  const metaCardY = 204;
  const metaCardHeight = 47;
  doc.setFillColor(...TEAL_LIGHT);
  doc.setDrawColor(...TEAL_600);
  doc.setLineWidth(0.35);
  doc.roundedRect(kpiStartX, metaCardY, kpiTotalW, metaCardHeight, 3, 3, 'FD');

  if (iconDataUrl) {
    doc.addImage(iconDataUrl, 'PNG', kpiStartX + 6, metaCardY + 3, 5.5, 5.5);
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.8);
  doc.setTextColor(...BRAND_NAVY);
  doc.text(
    'DOCUMENT PROVENANCE, DOWNLOAD AUDIT & LICENSING CERTIFICATE',
    kpiStartX + (iconDataUrl ? 13.5 : 6),
    metaCardY + 7
  );

  doc.setDrawColor(...SLATE_300);
  doc.setLineWidth(0.3);
  doc.line(kpiStartX + 6, metaCardY + 10.2, kpiStartX + kpiTotalW - 6, metaCardY + 10.2);

  const recipientName = userProfile?.name || 'Valued ReFIREly Member';
  const leftMeta: Array<[string, string]> = [
    ['Document Control ID:', documentControlId],
    ['Downloaded On:', `${dateFormatted} at ${timeFormatted}`],
    ['Prepared For:', recipientName],
    ['Account License:', userProfile?.email || 'Individual Planning Session'],
  ];

  // Note: Publication Volume is dynamically stamped on Page 1 once all pages are built
  const rightMeta: Array<[string, string]> = [
    ['Publication Volume:', ''], // Populated dynamically at end of generation
    ['Issuing Authority:', 'ReFIREly Global Intelligence Unit'],
    ['Permitted Usage:', 'Personal Non-Commercial Planning'],
    ['Data Verification:', 'Consular Schedules, WHO, JCI & Numbeo'],
  ];

  leftMeta.forEach(([label, val], idx) => {
    const rowY = metaCardY + 17.2 + idx * 7.8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...SLATE_700);
    doc.text(sanitizePdfText(label), kpiStartX + 6, rowY);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...SLATE_600);
    doc.text(sanitizePdfText(val).slice(0, 34), kpiStartX + 38, rowY);
  });

  rightMeta.forEach(([label, val], idx) => {
    const rowY = metaCardY + 17.2 + idx * 7.8;
    const col2X = kpiStartX + kpiTotalW / 2 + 4;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...SLATE_700);
    doc.text(sanitizePdfText(label), col2X, rowY);

    if (val) {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...SLATE_600);
      doc.text(sanitizePdfText(val).slice(0, 32), col2X + 31, rowY);
    }
  });

  // --- SECTION F: CLEAN BOTTOM COLOPHON INSIDE FRAME (y = 258mm to 274mm) ---
  drawMultiColorRibbon(centerX - 35, 257, 70, 0.9);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...INDIGO_600);
  doc.text(
    'CONFIDENTIAL RELOCATION INTELLIGENCE   |   MASTER MULTI-DIMENSIONAL EDITION',
    centerX,
    263.5,
    { align: 'center' }
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.9);
  doc.setTextColor(...SLATE_600);
  doc.text(
    '(c) 2026 ReFIREly Global Relocation Intelligence (ReFIREly.com). All rights reserved. Commercial resale prohibited.',
    centerX,
    269,
    { align: 'center' }
  );

  // =========================================================================
  // PAGE 2: MASTER TABLE OF CONTENTS & 28-PAGE DOSSIER BLUEPRINT
  // =========================================================================
  startNewChapterPage();

  drawChapterHeader(
    'TOC',
    'Master Table of Contents & Complete Dossier Blueprint',
    `Complete 19-chapter architectural index covering all 10 Country Dossier intelligence tabs for ${country.name}`,
    INDIGO_600,
    INDIGO_LIGHT
  );

  const tocChapters = [
    { num: '01', title: 'Executive Country Profile, 8-KPI Scorecard & 6-Axis Radar Telemetry', p: '3', desc: 'Overview prose, 8 core metrics, and multi-dimensional radar comparison vs. global benchmarks.' },
    { num: '01B', title: 'Strategic SWOT Assessment, Retirement Advantages, Watch-Outs & Journal', p: '4', desc: 'Itemized pros, risk-mitigated trade-offs, macroeconomic stability, and personal readiness notes.' },
    { num: '02', title: 'Consular Architecture, Primary Retirement Visa & Fiscal Tax Regime', p: '5', desc: `${country.visa.retirementVisaName} thresholds, PR/citizenship timeline, tax treaties, and mandatory checklists.` },
    { num: '02B', title: '10-Point Consular Eligibility & In-Country Settlement Matrix', p: '6', desc: 'Minimum age, single/couple income, bank buffers, stay mandates, work rights, and apostille rules.' },
    { num: '03', title: 'Short-Stay, Trial Scouting & Digital Nomad Visa Pathways', p: '7', desc: `All ${shortVisas.length} short-term/trial visa options, 3-step decision framework, and 90-day scouting protocol.` },
    { num: '04', title: 'Healthcare System Architecture, Routine Care & Pharmacy Rules', p: '8', desc: 'Public vs. private care, GP/specialist wait times, English-speaking staff, hospital networks & prescriptions.' },
    { num: '05', title: 'Emergency Medical Services, ER Triage Protocols & Medevac Readiness', p: '9', desc: `Dial ${hc.emergencyServices.emergencyNumberPrimary} dispatch, ambulance guidance, ER deposits/GOP, and trauma/medevac readiness.` },
    { num: '06', title: 'Expat Health Insurance Tiers, Consular Mandates & Pre-Existing Strategy', p: '10', desc: 'Consular policy compliance, Medicare portability, pre-existing conditions, and 3-tier age-banded premiums.' },
    { num: '06B', title: 'Out-of-Pocket Private Medical Cash Tariffs & Regional City Medical Hubs', p: '11', desc: 'Cash prices for GP, specialist, MRI/CT, labs, dental & hospital suites + city-by-city medical tiering.' },
    { num: '07', title: 'Cost of Living Telemetry, Dual-Currency Benchmarks & Itemized Expenses', p: '12', desc: `Monthly & annual costs in USD and ${currencyInfo.code}, rent tiers, groceries, dining, utilities, and healthcare.` },
    { num: '07B', title: 'Annual Retirement Budget Calculator Matrix & One-Time Overheads', p: '13', desc: 'Coastal, City Center & Villa household configurations + flights, visa renewals, furnishing & medical reserves.' },
    { num: '08', title: 'Real Estate Market Architecture, Rental Lease Protocols & Tenant Rights', p: '14', desc: 'Lease durations, security deposits, guarantor rules, inflation caps, and foreign freehold ownership.' },
    { num: '09', title: 'FIRE Financial Modeling, SWR Sensitivity & Geo-Arbitrage Economics', p: '15', desc: 'Lean, Standard & Luxury 4% and 3.5% SWR nest egg targets + US/UK metro geo-arbitrage savings.' },
    { num: '10', title: 'Travel, Famous Retirement Activities & Senior Leisure Pursuits', p: '16-17', desc: `Full catalogue of ${mobility.retireeActivities.length} signature retiree hobbies, locations, intensity & weekly expat schedule.` },
    { num: '11', title: 'Domestic Transit Infrastructure & Inter-City Mobility Network', p: '18', desc: 'High-speed & regional trains, express buses, highways, ride-hailing apps, and domestic flights/ferries.' },
    { num: '12', title: 'Traveler Persona Safety & Mobility: Couples, Solo & Solo Female Profiles', p: '19-20', desc: 'Dedicated safety scores, romantic escapes, solo dining, street harassment levels & female expat networks.' },
    { num: '13', title: 'Climate Meteorology, Weather Cycles & 3-Season Breakdown', p: '21', desc: 'Sunny days, average temperatures, humidity, best months, and Summer/Winter/Monsoon seasonal guide.' },
    { num: '14', title: 'Premier Expat Towns & Regional Micro-Market Hub Directory', p: '22', desc: `Deep-dive comparison of ${country.topCities.map(c => c.name).join(', ')} with monthly costs and local vibe.` },
    { num: '15', title: 'Demographics, Gender Ratios, Dating Culture & Nightlife Regulation', p: '23', desc: 'Median age, F:M ratio, youth share, dating openness, social integration, and nightlife districts.' },
    { num: '16', title: 'Pre-Departure Readiness Checklist & Relocation Hurdles FAQ Knowledge Base', p: '24-26', desc: `4-pillar readiness checklist + ${faqs.length} complete step-by-step legal, banking, tax & lease guides.` },
    { num: '17', title: 'Expat Community Network, Resident Mentors, Meetups & Forum Insights', p: '27', desc: 'Direct mentor profiles, scheduled expat social gatherings, and verified community forum discussions.' },
    { num: '18', title: '12-Month Master Relocation Execution Roadmap & Action Checklist', p: '28', desc: 'Chronological phase-by-phase execution checklist from T-12 months pre-departure to Year 1 renewal.' },
    { num: '19', title: 'Document Governance, Legal Disclaimer, Copyright & Verification Seal', p: '29', desc: 'Empirical legal/tax disclaimers, intellectual property protection, and cryptographic audit record.' },
  ];

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [['Ch.', 'Chapter Title & Dossier Intelligence Pillar', 'Pages', 'Comprehensive Subject Scope']],
    body: tocChapters.map(c => [c.num, c.title, c.p, c.desc]),
    theme: 'striped',
    headStyles: {
      fillColor: INDIGO_900,
      textColor: [255, 255, 255],
      fontSize: 7.8,
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center', fontStyle: 'bold', textColor: TEAL_600 },
      1: { cellWidth: 68, fontStyle: 'bold', textColor: SLATE_900 },
      2: { cellWidth: 14, halign: 'center', fontStyle: 'bold', textColor: VIOLET_600 },
      3: { cellWidth: contentWidth - 94, textColor: SLATE_600 },
    },
    bodyStyles: { fontSize: 7.1, cellPadding: 1.75 },
  });

  currentY = (doc as any).lastAutoTable.finalY + 4.5;

  drawCalloutBox(
    'EMPIRICAL METHODOLOGY & MULTI-DIMENSIONAL DATA PROVENANCE',
    'This Master Country Dossier synthesizes all 10 intelligence tabs from the ReFIREly platform into a single archival reference. Datasets are cross-verified against national immigration ministries, World Health Organization (WHO) & Joint Commission International (JCI) hospital registries, Numbeo cost-of-living telemetry, and verified resident expat surveys.',
    TEAL_600,
    TEAL_LIGHT
  );

  // =========================================================================
  // PAGE 3 & 4: CHAPTER 01 & 01B - EXECUTIVE COUNTRY PROFILE, RADAR & SWOT
  // =========================================================================
  if (options.includeExecutiveSummary) {
    startNewChapterPage();

    drawChapterHeader(
      '01',
      'Executive Country Profile, 8-KPI Scorecard & Radar Telemetry',
      `Holistic macroeconomic, geopolitical, and 6-axis suitability evaluation for retirees in ${country.name}`,
      TEAL_600,
      TEAL_LIGHT
    );

    drawParagraph(country.overview, 9.2, SLATE_900);

    // 8-KPI Executive Matrix
    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [[
        'Single Budget',
        'Couple Budget',
        'Min Visa Income',
        'Healthcare Score',
        'Safety Index',
        'Walkability',
        'Annual Sun',
        'Avg Temp',
      ]],
      body: [[
        `$${country.costOfLiving.monthlyBudgetSingleUSD.toLocaleString()}/mo`,
        `$${country.costOfLiving.monthlyBudgetCoupleUSD.toLocaleString()}/mo`,
        `$${country.visa.minimumIncomeUSD.toLocaleString()}/mo`,
        `${country.lifestyle.healthcareScore}/100`,
        `${country.lifestyle.safetyScore}/100`,
        `${country.lifestyle.walkabilityScore}/100`,
        `${country.climate.annualSunnyDays} days`,
        `${country.climate.averageTempC}C (${Math.round((country.climate.averageTempC * 9) / 5 + 32)}F)`,
      ]],
      theme: 'grid',
      headStyles: {
        fillColor: INDIGO_900,
        textColor: [255, 255, 255],
        fontSize: 7.4,
        fontStyle: 'bold',
        halign: 'center',
      },
      bodyStyles: {
        fontSize: 8.2,
        fontStyle: 'bold',
        textColor: TEAL_600,
        halign: 'center',
        fillColor: [255, 255, 255],
      },
    });

    currentY = (doc as any).lastAutoTable.finalY + 5;

    // 6-Axis Multi-Dimensional Performance Radar Telemetry (from CountryRadarComparison)
    const affordabilityScore = Math.max(
      20,
      Math.min(99, Math.round(115 - (country.costOfLiving.monthlyBudgetSingleUSD / 4200) * 80))
    );
    const visaEaseScore = Math.max(25, Math.min(98, (6 - country.visa.difficultyRating) * 19));
    const climateScore = Math.max(
      40,
      Math.min(98, Math.round((country.climate.annualSunnyDays / 350) * 95))
    );
    const englishScore =
      country.lifestyle.englishProficiency === 'Very High'
        ? 95
        : country.lifestyle.englishProficiency === 'High'
        ? 82
        : country.lifestyle.englishProficiency === 'Moderate'
        ? 68
        : 52;

    const radarRows = [
      [
        '1. Cost & Affordability Index',
        `${affordabilityScore} / 100`,
        '68 / 100',
        `${affordabilityScore >= 68 ? '+' : ''}${affordabilityScore - 68} pts`,
        `Single baseline $${country.costOfLiving.monthlyBudgetSingleUSD.toLocaleString()}/mo vs. $2,850 global expat average`,
      ],
      [
        '2. Healthcare & Clinical Quality',
        `${country.lifestyle.healthcareScore} / 100`,
        '74 / 100',
        `${country.lifestyle.healthcareScore >= 74 ? '+' : ''}${country.lifestyle.healthcareScore - 74} pts`,
        `${hc.headlineVerdict}; private insurance ~$${country.costOfLiving.healthcareMonthlyUSD}/mo`,
      ],
      [
        '3. Personal Safety & Peace Index',
        `${country.lifestyle.safetyScore} / 100`,
        '76 / 100',
        `${country.lifestyle.safetyScore >= 76 ? '+' : ''}${country.lifestyle.safetyScore - 76} pts`,
        `Walkability ${country.lifestyle.walkabilityScore}/100; Solo Female Safety ${mobility.soloFemale.femaleSafetyScore}/100`,
      ],
      [
        '4. Visa Accessibility & Solvency Ease',
        `${visaEaseScore} / 100`,
        '70 / 100',
        `${visaEaseScore >= 70 ? '+' : ''}${visaEaseScore - 70} pts`,
        `${country.visa.retirementVisaName} (${country.visa.difficultyRating}/5 difficulty; ~$${country.visa.minimumIncomeUSD.toLocaleString()}/mo req.)`,
      ],
      [
        '5. Climate & Sunshine Comfort',
        `${climateScore} / 100`,
        '72 / 100',
        `${climateScore >= 72 ? '+' : ''}${climateScore - 72} pts`,
        `${country.climate.annualSunnyDays} sunny days/yr; ${country.climate.category} (${country.climate.averageTempC}C avg)`,
      ],
      [
        '6. English & Social Integration',
        `${englishScore} / 100`,
        '71 / 100',
        `${englishScore >= 71 ? '+' : ''}${englishScore - 71} pts`,
        `English proficiency: ${country.lifestyle.englishProficiency}; Expat network: ${country.lifestyle.expatCommunitySize}`,
      ],
    ];

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [[
        'Multi-Dimensional Radar Axis',
        `${country.name} Score`,
        'Global Benchmark',
        'Net Delta',
        'Empirical Performance Interpretation',
      ]],
      body: radarRows.map(r => r.map(c => sanitizePdfText(c))),
      theme: 'striped',
      headStyles: { fillColor: INDIGO_600, textColor: [255, 255, 255], fontSize: 7.8 },
      columnStyles: {
        0: { cellWidth: 46, fontStyle: 'bold', textColor: SLATE_900 },
        1: { cellWidth: 23, halign: 'center', fontStyle: 'bold', textColor: TEAL_600 },
        2: { cellWidth: 25, halign: 'center', textColor: SLATE_600 },
        3: { cellWidth: 18, halign: 'center', fontStyle: 'bold', textColor: INDIGO_600 },
        4: { cellWidth: contentWidth - 112, textColor: SLATE_700 },
      },
      bodyStyles: { fontSize: 7.6, cellPadding: 2.1 },
    });

    currentY = (doc as any).lastAutoTable.finalY + 5;

    drawCalloutBox(
      'COMPOSITE RETIREE SUITABILITY VERDICT',
      `${country.name} achieves a composite suitability score of ${Math.round(
        (affordabilityScore +
          country.lifestyle.healthcareScore +
          country.lifestyle.safetyScore +
          visaEaseScore +
          climateScore +
          englishScore) /
          6
      )}/100 across our 6 core relocation telemetry axes. Its strongest comparative advantages lie in ${
        affordabilityScore >= 80
          ? 'exceptional cost-of-living purchasing power'
          : 'high clinical infrastructure and lifestyle quality'
      }, paired with an established ${country.lifestyle.expatCommunitySize.toLowerCase()} expat support ecosystem.`,
      INDIGO_600,
      INDIGO_LIGHT
    );

    // PAGE 4: CHAPTER 01B - STRATEGIC ADVANTAGES, WATCH-OUTS & PERSONAL READINESS
    startNewChapterPage();

    drawChapterHeader(
      '01B',
      'Strategic SWOT Assessment, Advantages & Watch-Outs',
      `Key lifestyle advantages, systemic trade-offs, mitigation protocols, and personal readiness for ${country.name}`,
      EMERALD_700,
      TEAL_LIGHT
    );

    const prosBody = country.pros.map((p, idx) => [
      `+ ${idx + 1}`,
      sanitizePdfText(p),
      'Directly enhances retiree purchasing power, healthcare peace of mind, or daily lifestyle enjoyment.',
    ]);

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [['#', `Key Retirement Advantages (Pros) of ${country.name}`, 'Strategic Value to Retiree']],
      body: prosBody,
      theme: 'striped',
      headStyles: { fillColor: EMERALD_700, textColor: [255, 255, 255], fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center', fontStyle: 'bold', textColor: EMERALD_700 },
        1: { cellWidth: 96, fontStyle: 'bold', textColor: SLATE_900 },
        2: { cellWidth: contentWidth - 106, textColor: SLATE_600 },
      },
      bodyStyles: { fontSize: 7.8, cellPadding: 2.1 },
    });

    currentY = (doc as any).lastAutoTable.finalY + 5;

    const consBody = country.cons.map((c, idx) => [
      `- ${idx + 1}`,
      sanitizePdfText(c),
      'Mitigation: Engage licensed local bilingual counsel, complete a 90-day trial stay, and keep a liquid USD buffer.',
    ]);

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [['#', `Practical Trade-Offs & Considerations (Cons) in ${country.name}`, 'Actionable Risk Mitigation Protocol']],
      body: consBody,
      theme: 'striped',
      headStyles: { fillColor: AMBER_600, textColor: [255, 255, 255], fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center', fontStyle: 'bold', textColor: AMBER_600 },
        1: { cellWidth: 96, fontStyle: 'bold', textColor: SLATE_900 },
        2: { cellWidth: contentWidth - 106, textColor: SLATE_600 },
      },
      bodyStyles: { fontSize: 7.8, cellPadding: 2.1 },
    });

    currentY = (doc as any).lastAutoTable.finalY + 5;

    if (options.includePersonalReadinessAndJournal && (journalEntry || isAuthenticated)) {
      const readinessRows: string[][] = [
        ['Member Profile', sanitizePdfText(`${recipientName} (${userProfile?.email || 'Active Session'})`)],
        [
          'Country Journal Interest Level',
          sanitizePdfText(journalEntry?.interestLevel || 'High Priority Shortlist Candidate'),
        ],
        [
          'Target Scouting & Relocation Window',
          sanitizePdfText(
            `${journalEntry?.scoutingTimeline || 'Next 6-12 Months'} | Visited Previously: ${
              journalEntry?.visitedBefore ? 'Yes' : 'Planned Scouting Trip'
            }`
          ),
        ],
        [
          'Confidential Personal Notes',
          sanitizePdfText(
            journalEntry?.privateNotes ||
              `Compare ${country.topCities[0]?.name || country.capital} vs. ${
                country.topCities[1]?.name || 'provincial hubs'
              } during initial scouting stay; verify ${country.visa.retirementVisaName} document checklist.`
          ),
        ],
      ];

      autoTable(doc, {
        startY: currentY,
        margin: { left: margin, right: margin },
        head: [['Personal Readiness & Journal Dimension', 'Member Record & Confidential Planning Notes']],
        body: readinessRows,
        theme: 'grid',
        headStyles: { fillColor: VIOLET_600, textColor: [255, 255, 255], fontSize: 8 },
        columnStyles: {
          0: { cellWidth: 52, fontStyle: 'bold', fillColor: VIOLET_LIGHT, textColor: SLATE_900 },
          1: { cellWidth: contentWidth - 52, textColor: SLATE_700 },
        },
        bodyStyles: { fontSize: 7.8, cellPadding: 2.1 },
      });

      currentY = (doc as any).lastAutoTable.finalY + 5;
    }

    drawCalloutBox(
      'MACROECONOMIC & GEOPOLITICAL STABILITY ASSESSMENT',
      `${country.name} maintains strong institutional frameworks for foreign retirees. Private property leases and bank deposits are protected under statutory civil law, while bilateral double-taxation treaties and territorial/special tax regimes shield foreign retirees from duplicative taxation when structured properly with a cross-border CPA.`,
      VIOLET_600,
      VIOLET_LIGHT
    );
  }

  // =========================================================================
  // PAGE 5 & 6: CHAPTER 02 & 02B - CONSULAR ARCHITECTURE & LONG-TERM VISA RULES
  // =========================================================================
  if (options.includeVisaAndLegal) {
    startNewChapterPage();

    drawChapterHeader(
      '02',
      'Consular Architecture & Long-Term Visa Pathways',
      `Official legal requirements, statutory income thresholds, and procedural stages for ${country.name}`,
      INDIGO_600,
      INDIGO_LIGHT
    );

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [[
        'Primary Retirement Visa',
        'Min. Passive Income',
        'Processing Time',
        'Work Permitted',
        'Consular Difficulty',
      ]],
      body: [[
        sanitizePdfText(country.visa.retirementVisaName),
        `$${country.visa.minimumIncomeUSD.toLocaleString()} USD / month`,
        `~${country.visa.processingMonths} months`,
        country.visa.allowedToWork ? 'Yes (Remote / Overseas)' : 'No (Strict Passive Only)',
        `${country.visa.difficultyRating} / 5 (${
          country.visa.difficultyRating <= 2
            ? 'Accessible'
            : country.visa.difficultyRating === 3
            ? 'Moderate'
            : 'Stringent'
        })`,
      ]],
      theme: 'grid',
      headStyles: { fillColor: INDIGO_600, textColor: [255, 255, 255], fontSize: 8.2, halign: 'center' },
      bodyStyles: { fontSize: 8.2, fontStyle: 'bold', halign: 'center', textColor: SLATE_900 },
    });

    currentY = (doc as any).lastAutoTable.finalY + 5;

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      body: [
        ['Permanent Residency & Citizenship Timeline', sanitizePdfText(country.visa.pathwayToPR)],
        ['Foreign Pension & Overseas Income Tax Regime', sanitizePdfText(country.visa.taxStatus)],
        [
          'Mandatory Consular Qualification Checklist',
          sanitizePdfText(country.visa.keyRequirements.map((r, i) => `[${i + 1}] ${r}`).join('\n')),
        ],
      ],
      theme: 'grid',
      columnStyles: {
        0: { cellWidth: 56, fontStyle: 'bold', fillColor: INDIGO_LIGHT, textColor: INDIGO_900 },
        1: { cellWidth: contentWidth - 56, textColor: SLATE_700 },
      },
      bodyStyles: { fontSize: 7.9, cellPadding: 2.4 },
    });

    currentY = (doc as any).lastAutoTable.finalY + 5;

    drawCalloutBox(
      'CONSULAR SUBMISSION & APOSTILLE TIMING ADVISORY',
      `All civil documents (birth certificate, marriage certificate, and FBI/national federal criminal background check) must bear an official Hague Apostille or consular legalization stamp and be translated into ${country.language} by a certified sworn translator. Because criminal background checks expire 90 to 180 days after issuance, order your background check last.`,
      AMBER_600,
      AMBER_LIGHT
    );

    // PAGE 6: CHAPTER 02B - 10-POINT CONSULAR ELIGIBILITY MATRIX
    startNewChapterPage();

    drawChapterHeader(
      '02B',
      '10-Point Consular Eligibility & In-Country Settlement Matrix',
      `Detailed statutory benchmarks, spouse/dependent multipliers, and compliance rules for ${country.name}`,
      VIOLET_600,
      VIOLET_LIGHT
    );

    const visaRows = getStructuredVisaRows(country).map(row => row.map(cell => sanitizePdfText(cell)));
    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [['Consular Dimension', 'Statutory Requirement & Threshold', 'Practical Implementation Advice']],
      body: visaRows,
      theme: 'striped',
      headStyles: { fillColor: INDIGO_900, textColor: [255, 255, 255], fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 44, fontStyle: 'bold', textColor: SLATE_900 },
        1: { cellWidth: 68, fontStyle: 'bold', textColor: INDIGO_600 },
        2: { cellWidth: contentWidth - 112, textColor: SLATE_600 },
      },
      bodyStyles: { fontSize: 7.8, cellPadding: 2.2 },
    });

    currentY = (doc as any).lastAutoTable.finalY + 5;

    drawCalloutBox(
      'PATHWAY FROM TEMPORARY RESIDENCY TO PERMANENT RESIDENCY & CITIZENSHIP',
      `Upon initial consular approval, retirees receive a visa stamp enabling entry into ${country.name} to register biometrics for their physical residency card. Maintaining status requires respecting the minimum physical stay rules above. ${country.visa.pathwayToPR}`,
      TEAL_600,
      TEAL_LIGHT
    );
  }

  // =========================================================================
  // PAGE 7: CHAPTER 03 - SHORT-STAY, SCOUTING & DIGITAL NOMAD VISAS
  // =========================================================================
  if (options.includeShortTermVisas) {
    startNewChapterPage();

    drawChapterHeader(
      '03',
      'Short-Stay, Trial Scouting & Digital Nomad Entry Pathways',
      `Tourist waivers, seasonal snowbird stays, and flexible remote work permits in ${country.name}`,
      AMBER_600,
      AMBER_LIGHT
    );

    const shortVisaBody = shortVisas.map(v => [
      sanitizePdfText(`${v.name}\n[${v.category}]`),
      sanitizePdfText(v.duration),
      sanitizePdfText(v.financialRequirement),
      sanitizePdfText(`${v.processingMethod}\nTime: ${v.processingTime}\nFee: ${v.estimatedCost}`),
      sanitizePdfText(
        `Ideal For: ${v.idealFor}\nActivities: ${v.allowedActivities}\nConditions: ${v.keyConditions.join('; ')}`
      ),
    ]);

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [[
        'Short-Stay / Trial Pathway',
        'Max Duration',
        'Financial Solvency',
        'Processing & Cost',
        'Ideal Retiree Profile, Activities & Conditions',
      ]],
      body: shortVisaBody,
      theme: 'grid',
      headStyles: { fillColor: AMBER_600, textColor: [255, 255, 255], fontSize: 7.8 },
      columnStyles: {
        0: { cellWidth: 38, fontStyle: 'bold', textColor: SLATE_900 },
        1: { cellWidth: 22, halign: 'center', fontStyle: 'bold', textColor: AMBER_600 },
        2: { cellWidth: 34, textColor: SLATE_700 },
        3: { cellWidth: 32, textColor: SLATE_700 },
        4: { cellWidth: contentWidth - 126, textColor: SLATE_600 },
      },
      bodyStyles: { fontSize: 7.4, cellPadding: 2.1 },
    });

    currentY = (doc as any).lastAutoTable.finalY + 5;

    // 3 Decision-Aid Frameworks from ShortTermVisaOptions
    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [['Trial Stay Strategy', 'Recommended Entry Pathway', 'Tax & Legal Advantage for Retirees']],
      body: [
        [
          '1. 30-to-90 Day Scouting Trip',
          'Tourist Entry Waiver / e-Visa',
          'Zero local tax residency triggered; test neighborhoods, hospitals, and rental apartments firsthand before committing.',
        ],
        [
          '2. Semi-Retired / Consulting Income',
          'Digital Nomad / Remote Work Visa',
          'Legally continue earning overseas consulting, business, or remote employment income while living in-country.',
        ],
        [
          '3. Seasonal Snowbird (Under 6 Mos/Yr)',
          'Temporary Visitor / Multiple-Entry Permit',
          'Enjoy peak sunny weather months in-country while remaining below the 183-day domestic tax residency threshold.',
        ],
      ],
      theme: 'striped',
      headStyles: { fillColor: INDIGO_600, textColor: [255, 255, 255], fontSize: 7.8 },
      columnStyles: {
        0: { cellWidth: 44, fontStyle: 'bold', textColor: SLATE_900 },
        1: { cellWidth: 46, fontStyle: 'bold', textColor: TEAL_600 },
        2: { cellWidth: contentWidth - 90, textColor: SLATE_700 },
      },
      bodyStyles: { fontSize: 7.6, cellPadding: 2 },
    });
  }

  // =========================================================================
  // PAGES 8, 9, 10 & 11: CHAPTERS 04, 05, 06 & 06B - HEALTHCARE, EMERGENCY & INSURANCE
  // =========================================================================
  if (includeHealthcare) {
    // PAGE 8: CHAPTER 04 - HEALTHCARE INFRASTRUCTURE & ROUTINE CARE
    startNewChapterPage();

    drawChapterHeader(
      '04',
      'Healthcare Infrastructure, Routine Care & Pharmacy Protocol',
      `Public vs. private clinical networks, doctor wait times, hospital groups, and prescription rules in ${country.name}`,
      TEAL_600,
      TEAL_LIGHT
    );

    drawParagraph(hc.routineCare.executiveSummary, 9.0, SLATE_900);

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [[
        'Overall Healthcare Score',
        'Routine Care Ease Score',
        'Private GP Wait Time',
        'Private Specialist Wait',
        'Public System Name',
      ]],
      body: [[
        `${hc.overallScore} / 100`,
        `${hc.routineCare.easeScore} / 100 (${hc.routineCare.easeVerdict})`,
        sanitizePdfText(hc.routineCare.gpWaitTimePrivate),
        sanitizePdfText(hc.routineCare.specialistWaitTimePrivate),
        sanitizePdfText(hc.routineCare.publicSystemName),
      ]],
      theme: 'grid',
      headStyles: { fillColor: TEAL_600, textColor: [255, 255, 255], fontSize: 7.5, halign: 'center' },
      bodyStyles: { fontSize: 7.6, fontStyle: 'bold', halign: 'center', textColor: SLATE_900 },
    });

    currentY = (doc as any).lastAutoTable.finalY + 5;

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [['Clinical Care Dimension', 'Operational Standard & Retiree Access Guidance']],
      body: [
        ['Public Healthcare System Overview', sanitizePdfText(hc.routineCare.publicSystemOverview)],
        ['Public Queue & Wait Time Reality', sanitizePdfText(hc.routineCare.publicWaitTimeNote)],
        ['Private Concierge System Overview', sanitizePdfText(hc.routineCare.privateSystemOverview)],
        ['English-Speaking Doctors & Staff', sanitizePdfText(hc.routineCare.englishSpeakingStaff)],
        [
          'Top Accredited Hospital Networks',
          sanitizePdfText(hc.routineCare.topHospitalNetworks.map((h, i) => `(${i + 1}) ${h}`).join('   |   ')),
        ],
        ['Pharmacies & Prescription Pricing', sanitizePdfText(hc.routineCare.pharmacyAndPrescriptions)],
        [
          'Prescription Transition Checklist',
          sanitizePdfText(
            hc.routineCare.prescriptionRulesChecklist.map((step, i) => `[Step ${i + 1}] ${step}`).join('\n')
          ),
        ],
      ],
      theme: 'grid',
      headStyles: { fillColor: INDIGO_900, textColor: [255, 255, 255], fontSize: 7.8 },
      columnStyles: {
        0: { cellWidth: 48, fontStyle: 'bold', fillColor: TEAL_LIGHT, textColor: SLATE_900 },
        1: { cellWidth: contentWidth - 48, textColor: SLATE_700 },
      },
      bodyStyles: { fontSize: 7.6, cellPadding: 2.1 },
    });

    // PAGE 9: CHAPTER 05 - EMERGENCY MEDICAL SERVICES, ER TRIAGE & MEDEVAC
    startNewChapterPage();

    drawChapterHeader(
      '05',
      'Emergency Medical Services, ER Triage & Medevac Readiness',
      `Emergency dispatch numbers, ambulance response, ER admission deposits, and trauma protocols in ${country.name}`,
      ROSE_600,
      ROSE_LIGHT
    );

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [[
        'Emergency Dispatch Number',
        'Response Reliability Score',
        'Operational Dispatch Verdict',
        'Operator & Dispatch Note',
      ]],
      body: [[
        `Dial ${ sanitizePdfText(hc.emergencyServices.emergencyNumberPrimary) }`,
        `${hc.emergencyServices.responseReliabilityScore} / 100`,
        sanitizePdfText(hc.emergencyServices.responseVerdict),
        sanitizePdfText(hc.emergencyServices.emergencyNumberNote),
      ]],
      theme: 'grid',
      headStyles: { fillColor: ROSE_600, textColor: [255, 255, 255], fontSize: 7.8, halign: 'center' },
      columnStyles: {
        0: { cellWidth: 34, fontStyle: 'bold', halign: 'center', textColor: ROSE_600 },
        1: { cellWidth: 28, fontStyle: 'bold', halign: 'center', textColor: SLATE_900 },
        2: { cellWidth: 48, fontStyle: 'bold', textColor: SLATE_900 },
        3: { cellWidth: contentWidth - 110, textColor: SLATE_700 },
      },
      bodyStyles: { fontSize: 7.6, cellPadding: 2.2 },
    });

    currentY = (doc as any).lastAutoTable.finalY + 5;

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [['Emergency & Trauma Protocol', 'Field Guidance & Hospital Admission Standard']],
      body: [
        ['Ambulance Dispatch Strategy', sanitizePdfText(hc.emergencyServices.ambulanceGuidance)],
        [
          'ER Triage & Admission Deposit / GOP Rules',
          sanitizePdfText(hc.emergencyServices.erTriageAndAdmissionProtocol),
        ],
        ['When to Choose Public vs. Private ER', sanitizePdfText(hc.emergencyServices.publicVsPrivateEr)],
        ['Trauma Centers & Medevac Readiness', sanitizePdfText(hc.emergencyServices.medevacAndTraumaReadiness)],
        [
          'Mandatory 4-Point Emergency Preparedness Checklist',
          sanitizePdfText(
            hc.emergencyServices.emergencyActionChecklist.map((item, i) => `[${i + 1}] ${item}`).join('\n')
          ),
        ],
      ],
      theme: 'grid',
      headStyles: { fillColor: INDIGO_900, textColor: [255, 255, 255], fontSize: 7.8 },
      columnStyles: {
        0: { cellWidth: 50, fontStyle: 'bold', fillColor: ROSE_LIGHT, textColor: SLATE_900 },
        1: { cellWidth: contentWidth - 50, textColor: SLATE_700 },
      },
      bodyStyles: { fontSize: 7.7, cellPadding: 2.3 },
    });

    currentY = (doc as any).lastAutoTable.finalY + 5;

    drawCalloutBox(
      'CRITICAL ER ADMISSION RULE FOR EXPAT RETIREES',
      `Always keep a dedicated Visa or Mastercard with at least $5,000 USD available credit alongside your private insurance policy card. While life-threatening emergencies are stabilized immediately, private hospitals outside Western Europe routinely require a credit card authorization prior to inpatient surgical admission while awaiting your insurer's formal Guarantee of Payment (GOP).`,
      ROSE_600,
      ROSE_LIGHT
    );

    // PAGE 10: CHAPTER 06 - EXPAT HEALTH INSURANCE TIERS & PRE-EXISTING STRATEGY
    startNewChapterPage();

    drawChapterHeader(
      '06',
      'Expat Health Insurance Tiers, Consular Rules & Pre-Existing Strategy',
      `Consular insurance compliance, age-banded monthly premiums, Medicare portability, and chronic care strategy`,
      INDIGO_600,
      INDIGO_LIGHT
    );

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      body: [
        [
          `Consular Visa Mandate (${hc.insurance.visaRequirementHeadline})`,
          sanitizePdfText(hc.insurance.visaInsuranceDetails),
        ],
        [
          'Public Healthcare Eligibility & Buy-In Timeline',
          sanitizePdfText(
            `${hc.insurance.publicHealthcareEligibility} | Buy-In Timeline: ${hc.insurance.publicBuyInTimeline} | Est. Cost: ${hc.insurance.publicMonthlyCostEstimate}`
          ),
        ],
        [
          'Pre-Existing Conditions 2-Step Strategy',
          sanitizePdfText(hc.insurance.preExistingConditionsStrategy),
        ],
        [
          'US Medicare / Home-Country Coverage Warning',
          sanitizePdfText(hc.insurance.homeCountryCoverageNote),
        ],
      ],
      theme: 'grid',
      columnStyles: {
        0: { cellWidth: 52, fontStyle: 'bold', fillColor: INDIGO_LIGHT, textColor: INDIGO_900 },
        1: { cellWidth: contentWidth - 52, textColor: SLATE_700 },
      },
      bodyStyles: { fontSize: 7.5, cellPadding: 2.1 },
    });

    currentY = (doc as any).lastAutoTable.finalY + 5;

    // 3-Tier Age-Banded Insurance Matrix
    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [[
        'Coverage Tier & Providers',
        'Single (55-64)',
        'Single (65-74)',
        'Couple (Age 60)',
        'Coverage Scope & Pre-Existing Condition Rules',
      ]],
      body: hc.insurance.insuranceTiers.map(tier => [
        sanitizePdfText(`${tier.tierName}\nProviders: ${tier.providerExamples}`),
        sanitizePdfText(tier.singleAge55to64MonthlyUSD),
        sanitizePdfText(tier.singleAge65to74MonthlyUSD),
        sanitizePdfText(tier.coupleAge60MonthlyUSD),
        sanitizePdfText(`${tier.coverageHighlights}\nPre-Existing Rule: ${tier.preExistingConditionsRule}`),
      ]),
      theme: 'striped',
      headStyles: { fillColor: INDIGO_600, textColor: [255, 255, 255], fontSize: 7.6 },
      columnStyles: {
        0: { cellWidth: 40, fontStyle: 'bold', textColor: SLATE_900 },
        1: { cellWidth: 23, halign: 'center', fontStyle: 'bold', textColor: TEAL_600 },
        2: { cellWidth: 23, halign: 'center', fontStyle: 'bold', textColor: INDIGO_600 },
        3: { cellWidth: 24, halign: 'center', fontStyle: 'bold', textColor: VIOLET_600 },
        4: { cellWidth: contentWidth - 110, textColor: SLATE_700 },
      },
      bodyStyles: { fontSize: 7.3, cellPadding: 2 },
    });

    // PAGE 11: CHAPTER 06B - OUT-OF-POCKET CASH TARIFFS & REGIONAL CITY MEDICAL HUBS
    startNewChapterPage();

    drawChapterHeader(
      '06B',
      'Private Out-of-Pocket Cash Tariffs & Regional Medical Hubs',
      `Self-pay private procedure benchmarks and hospital infrastructure across ${country.name}'s top expat cities`,
      VIOLET_600,
      VIOLET_LIGHT
    );

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [['Medical Procedure / Diagnostic Service', 'Private Self-Pay Cash Tariff (USD)', 'Clinical Context & Notes']],
      body: hc.insurance.outOfPocketBenchmarks.map(item => [
        sanitizePdfText(item.procedure),
        sanitizePdfText(item.privateCashPriceUSD),
        sanitizePdfText(item.notes),
      ]),
      theme: 'striped',
      headStyles: { fillColor: VIOLET_600, textColor: [255, 255, 255], fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 58, fontStyle: 'bold', textColor: SLATE_900 },
        1: { cellWidth: 42, fontStyle: 'bold', textColor: TEAL_600 },
        2: { cellWidth: contentWidth - 100, textColor: SLATE_600 },
      },
      bodyStyles: { fontSize: 7.8, cellPadding: 2.2 },
    });

    currentY = (doc as any).lastAutoTable.finalY + 6;

    // Regional City Medical Hub Classification Table
    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [['City / Expat Hub', 'Medical Infrastructure Classification', 'Hospital & Specialist Capabilities Summary']],
      body: hc.cityMedicalHubs.map(hub => [
        sanitizePdfText(hub.cityName),
        sanitizePdfText(hub.tierLabel),
        sanitizePdfText(hub.facilitiesSummary),
      ]),
      theme: 'grid',
      headStyles: { fillColor: TEAL_600, textColor: [255, 255, 255], fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 36, fontStyle: 'bold', textColor: SLATE_900 },
        1: { cellWidth: 46, fontStyle: 'bold', textColor: INDIGO_600 },
        2: { cellWidth: contentWidth - 82, textColor: SLATE_700 },
      },
      bodyStyles: { fontSize: 7.8, cellPadding: 2.3 },
    });

    currentY = (doc as any).lastAutoTable.finalY + 5;

    drawCalloutBox(
      'HIGH-DEDUCTIBLE + SELF-PAY OPTIMIZATION STRATEGY',
      `Because private GP consultations (${hc.insurance.outOfPocketBenchmarks[0]?.privateCashPriceUSD}) and specialist visits (${hc.insurance.outOfPocketBenchmarks[1]?.privateCashPriceUSD}) are highly affordable in ${country.name}, many savvy expat retirees select an inpatient hospital policy with a $1,500–$2,500 annual deductible (cutting monthly insurance premiums by 35%–45%) and pay cash out-of-pocket for routine clinic checkups and dental cleanings.`,
      TEAL_600,
      TEAL_LIGHT
    );
  }

  // =========================================================================
  // PAGES 12, 13, 14 & 15: CHAPTERS 07, 07B, 08 & 09 - COST OF LIVING, BUDGET CALC, REAL ESTATE & FIRE
  // =========================================================================
  if (options.includeCostAndBudget) {
    // PAGE 12: CHAPTER 07 - COST OF LIVING & DUAL-CURRENCY ITEMIZED TELEMETRY
    startNewChapterPage();

    drawChapterHeader(
      '07',
      'Cost of Living Telemetry & Dual-Currency Expense Matrix',
      `Empirical monthly & annual living costs in USD and ${currencyInfo.code} (${currencyInfo.rate} ${currencyInfo.code}/USD) for ${country.name}`,
      AMBER_600,
      AMBER_LIGHT
    );

    const col = country.costOfLiving;
    const singleMo = col.monthlyBudgetSingleUSD;
    const coupleMo = col.monthlyBudgetCoupleUSD;
    const toLocalStr = (usd: number) =>
      `${Math.round(usd * currencyInfo.rate).toLocaleString()} ${currencyInfo.code}`;

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [[
        'Expense Category',
        'Monthly (USD / Local)',
        'Annualized (USD)',
        'Benchmark Context & Notes',
      ]],
      body: [
        [
          'Total Baseline Living Budget (Single Retiree)',
          `$${singleMo.toLocaleString()} (${toLocalStr(singleMo)})`,
          `$${(singleMo * 12).toLocaleString()} / yr`,
          'All-inclusive: 1-bed rent, utilities, groceries, dining, transit & health insurance',
        ],
        [
          'Total Baseline Living Budget (Retired Couple)',
          `$${coupleMo.toLocaleString()} (${toLocalStr(coupleMo)})`,
          `$${(coupleMo * 12).toLocaleString()} / yr`,
          'Shared 1-2 bedroom residence with combined household groceries, dining & insurance',
        ],
        [
          'Apartment Rent (1-Bed City Center / Prime Haven)',
          `$${col.rent1BedCenterUSD.toLocaleString()} (${toLocalStr(col.rent1BedCenterUSD)})`,
          `$${(col.rent1BedCenterUSD * 12).toLocaleString()} / yr`,
          'Walkable historic center, prime coastal promenade, or top expat neighborhood',
        ],
        [
          'Apartment Rent (1-Bed Outer Suburbs / Provincial)',
          `$${col.rent1BedOutsideUSD.toLocaleString()} (${toLocalStr(col.rent1BedOutsideUSD)})`,
          `$${(col.rent1BedOutsideUSD * 12).toLocaleString()} / yr`,
          'Quieter residential district or charming inland town (25-35% rent savings)',
        ],
        [
          'Spacious 2-3 Bed Villa / Upscale Penthouse',
          `$${Math.round(col.rent1BedCenterUSD * 1.55).toLocaleString()} (${toLocalStr(col.rent1BedCenterUSD * 1.55)})`,
          `$${(Math.round(col.rent1BedCenterUSD * 1.55) * 12).toLocaleString()} / yr`,
          'Detached villa with garden/terrace or luxury sea-view condominium',
        ],
        [
          'Utilities (Power, Water, Gas, A/C + 500Mbps Fiber)',
          `$${col.utilitiesMonthlyUSD.toLocaleString()} (${toLocalStr(col.utilitiesMonthlyUSD)})`,
          `$${(col.utilitiesMonthlyUSD * 12).toLocaleString()} / yr`,
          'Standard 85m2 apartment utilities plus high-speed fiber internet & mobile eSIM',
        ],
        [
          'Fresh Markets & Local Groceries (Single / Couple)',
          `$${Math.round(col.groceriesIndex * 7.5)} / $${Math.round(col.groceriesIndex * 7.5 * 1.75)}`,
          `$${(Math.round(col.groceriesIndex * 7.5) * 12).toLocaleString()} / yr (Single)`,
          `Groceries Index: ${col.groceriesIndex}/100 (open-air produce markets & supermarkets)`,
        ],
        [
          'Comprehensive Private Health Insurance',
          `$${col.healthcareMonthlyUSD.toLocaleString()} (${toLocalStr(col.healthcareMonthlyUSD)})`,
          `$${(col.healthcareMonthlyUSD * 12).toLocaleString()} / yr`,
          `Healthcare Score ${country.lifestyle.healthcareScore}/100; private hospital & specialist coverage`,
        ],
        [
          'Casual Restaurant Dining (Per Meal Benchmark)',
          `$${col.mealInexpensiveUSD.toFixed(2)} (${toLocalStr(col.mealInexpensiveUSD)})`,
          `~$${Math.round(col.mealInexpensiveUSD * 104).toLocaleString()} / yr (2x/wk)`,
          'Menu del dia, local bistro lunch, or casual neighborhood eatery',
        ],
      ],
      theme: 'striped',
      headStyles: { fillColor: AMBER_600, textColor: [255, 255, 255], fontSize: 7.8 },
      columnStyles: {
        0: { cellWidth: 56, fontStyle: 'bold', textColor: SLATE_900 },
        1: { cellWidth: 40, fontStyle: 'bold', textColor: AMBER_600 },
        2: { cellWidth: 28, fontStyle: 'bold', textColor: INDIGO_600 },
        3: { cellWidth: contentWidth - 124, textColor: SLATE_600 },
      },
      bodyStyles: { fontSize: 7.5, cellPadding: 2 },
    });

    // PAGE 13: CHAPTER 07B - ANNUAL RETIREMENT BUDGET CALCULATOR & PERIODIC OVERHEADS
    startNewChapterPage();

    drawChapterHeader(
      '07B',
      'Annual Retirement Budget Matrix & Periodic Overheads',
      `Complete lifestyle configuration modeling and annual one-time/periodic reserves from our Budget Calculator`,
      INDIGO_600,
      INDIGO_LIGHT
    );

    // Compute the 3 lifestyle configurations from AnnualRetirementBudgetCalculator
    const calcBaseGroceries = Math.round(col.groceriesIndex * 7.5);
    const coastalSingleMo =
      col.rent1BedOutsideUSD +
      calcBaseGroceries +
      Math.round(col.mealInexpensiveUSD * 10 + 60) +
      (col.utilitiesMonthlyUSD + 40) +
      col.healthcareMonthlyUSD +
      55 +
      110;
    const centerCoupleMo =
      Math.round(col.rent1BedCenterUSD * 1.15) +
      Math.round(calcBaseGroceries * 1.75) +
      Math.round(col.mealInexpensiveUSD * 18 + 120) +
      Math.round(col.utilitiesMonthlyUSD * 1.3 + 40) +
      Math.round(col.healthcareMonthlyUSD * 1.85) +
      95 +
      180;
    const luxuryVillaCoupleMo =
      Math.round(col.rent1BedCenterUSD * 1.55) +
      Math.round(calcBaseGroceries * 1.75 * 1.35) +
      Math.round(col.mealInexpensiveUSD * 36 + 120) +
      Math.round(col.utilitiesMonthlyUSD * 1.3 + 40) +
      Math.round(col.healthcareMonthlyUSD * 1.85 * 1.55) +
      (country.region === 'Europe' ? 380 : 260) +
      (country.region === 'Southeast Asia' || country.region === 'Americas' ? 140 : 280) +
      180;

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [[
        'Budget Calculator Configuration',
        'Monthly Core Outlay',
        'Annualized Core Living',
        'Included Housing, Dining, Transit & Healthcare Profile',
      ]],
      body: [
        [
          'Profile A: Single — Coastal / Suburban Value',
          `$${coastalSingleMo.toLocaleString()} / mo`,
          `$${(coastalSingleMo * 12).toLocaleString()} / yr`,
          '1-Bed outside center, local produce markets, moderate dining (10x/mo), public transit, standard private health.',
        ],
        [
          'Profile B: Couple — Walkable City Center',
          `$${centerCoupleMo.toLocaleString()} / mo`,
          `$${(centerCoupleMo * 12).toLocaleString()} / yr`,
          'Spacious center apartment, local groceries, 18 restaurant meals/mo, public transit + ride-share, couple health policy.',
        ],
        [
          'Profile C: Couple — Upscale Villa & Car',
          `$${luxuryVillaCoupleMo.toLocaleString()} / mo`,
          `$${(luxuryVillaCoupleMo * 12).toLocaleString()} / yr`,
          '2-3 Bed Villa, imported specialty groceries, frequent dining (36x/mo), private car ownership, premium global health + housekeeping.',
        ],
      ],
      theme: 'grid',
      headStyles: { fillColor: INDIGO_600, textColor: [255, 255, 255], fontSize: 7.8 },
      columnStyles: {
        0: { cellWidth: 48, fontStyle: 'bold', textColor: SLATE_900 },
        1: { cellWidth: 30, fontStyle: 'bold', textColor: TEAL_600 },
        2: { cellWidth: 32, fontStyle: 'bold', textColor: INDIGO_600 },
        3: { cellWidth: contentWidth - 110, textColor: SLATE_700 },
      },
      bodyStyles: { fontSize: 7.6, cellPadding: 2.2 },
    });

    currentY = (doc as any).lastAutoTable.finalY + 5;

    // Annual Periodic & One-Time Overheads Table (from AnnualRetirementBudgetCalculator)
    const annualFlightsSingle = country.region === 'Americas' ? 850 : 1400;
    const annualFlightsCouple = annualFlightsSingle * 2;
    const annualVisaLegalSingle = 450;
    const annualVisaLegalCouple = 800;
    const annualSetupSingle = 1200;
    const annualSetupCouple = 1800;
    const annualMedBufferSingle = 600;
    const annualMedBufferCouple = 1100;
    const totalOverheadsSingle =
      annualFlightsSingle + annualVisaLegalSingle + annualSetupSingle + annualMedBufferSingle;
    const totalOverheadsCouple =
      annualFlightsCouple + annualVisaLegalCouple + annualSetupCouple + annualMedBufferCouple;

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [[
        'Annual Periodic & Contingency Reserve Item',
        'Single Annual Reserve',
        'Couple Annual Reserve',
        'Financial Planning Purpose',
      ]],
      body: [
        [
          '1. Annual Return Home Visits & Regional Flights',
          `$${annualFlightsSingle.toLocaleString()} / yr`,
          `$${annualFlightsCouple.toLocaleString()} / yr`,
          'Round-trip international airfare to visit family plus regional holiday travel.',
        ],
        [
          '2. Visa Renewals, Legal & Cross-Border CPA Fees',
          `$${annualVisaLegalSingle.toLocaleString()} / yr`,
          `$${annualVisaLegalCouple.toLocaleString()} / yr`,
          'Biometric residency card renewals, apostilles, and dual-country tax filings.',
        ],
        [
          '3. Home Furnishing, Appliances & Tech Replacement',
          `$${annualSetupSingle.toLocaleString()} / yr`,
          `$${annualSetupCouple.toLocaleString()} / yr`,
          'Amortized household setup, dehumidifiers/air purifiers, laptops, and home upkeep.',
        ],
        [
          '4. Out-of-Pocket Dental, Vision & Deductible Buffer',
          `$${annualMedBufferSingle.toLocaleString()} / yr`,
          `$${annualMedBufferCouple.toLocaleString()} / yr`,
          'Covers policy deductibles, dental crowns, prescription eyewear, and pharmacy copays.',
        ],
        [
          'TOTAL ANNUAL PERIODIC OVERHEAD RESERVE',
          `$${totalOverheadsSingle.toLocaleString()} / yr`,
          `$${totalOverheadsCouple.toLocaleString()} / yr`,
          `Add ~$${Math.round(totalOverheadsSingle / 12)}/mo (Single) or ~$${Math.round(totalOverheadsCouple / 12)}/mo (Couple) to core budget.`,
        ],
      ],
      theme: 'striped',
      headStyles: { fillColor: TEAL_600, textColor: [255, 255, 255], fontSize: 7.8 },
      columnStyles: {
        0: { cellWidth: 58, fontStyle: 'bold', textColor: SLATE_900 },
        1: { cellWidth: 30, fontStyle: 'bold', textColor: TEAL_600 },
        2: { cellWidth: 30, fontStyle: 'bold', textColor: INDIGO_600 },
        3: { cellWidth: contentWidth - 118, textColor: SLATE_600 },
      },
      bodyStyles: { fontSize: 7.5, cellPadding: 2 },
    });

    // PAGE 14: CHAPTER 08 - REAL ESTATE MARKET, LEASES & TENANT RIGHTS
    startNewChapterPage();

    drawChapterHeader(
      '08',
      'Real Estate Market Architecture, Leases & Tenant Rights',
      `Securing long-term housing, lease contracts, deposit protection, and property purchasing in ${country.name}`,
      VIOLET_600,
      VIOLET_LIGHT
    );

    const realEstateRows = [
      [
        'Standard Lease Duration',
        'Typically 12-month renewable contracts; 3-to-5 year long-term residential leases common in Europe and Latin America.',
        'Always register your signed lease contract officially with municipal/tax authorities for consular proof of address.',
      ],
      [
        'Security Deposits & Guarantor (Fiador)',
        '1 to 2 months rent standard security deposit. Landlords may request 2-4 months advance rent if applicant lacks local credit.',
        'Include a diplomatic/break clause allowing termination with 60-90 days notice after the first 6 months.',
      ],
      [
        'Statutory Tenant Protections',
        'Strong civil-code protections against arbitrary eviction; landlords must provide statutory notice prior to non-renewal.',
        'Annual rent adjustments on existing leases are typically capped or indexed to official consumer inflation.',
      ],
      [
        'Furnished vs. Unfurnished Rentals',
        'Both widely available. Furnished (equipado) apartments allow immediate turn-key living during Year 1.',
        'Renting furnished for Year 1 avoids $8,000-$15,000 in international shipping container costs.',
      ],
      [
        'Foreign Freehold Property Ownership',
        `Foreign retirees enjoy strong property rights in ${country.name} (note: some Asian jurisdictions restrict land freehold to condos/leases).`,
        'Rent for at least 12 months before buying real estate; always hire an independent conveyancing attorney.',
      ],
    ];

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [['Rental / Property Dimension', 'Market Norm & Legal Standard', 'Retiree Protection Protocol']],
      body: realEstateRows.map(r => r.map(c => sanitizePdfText(c))),
      theme: 'grid',
      headStyles: { fillColor: INDIGO_900, textColor: [255, 255, 255], fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 46, fontStyle: 'bold', textColor: SLATE_900 },
        1: { cellWidth: 70, textColor: SLATE_700 },
        2: { cellWidth: contentWidth - 116, textColor: SLATE_600 },
      },
      bodyStyles: { fontSize: 7.8, cellPadding: 2.4 },
    });

    currentY = (doc as any).lastAutoTable.finalY + 5;

    drawCalloutBox(
      'AVOIDING EXPAT RENTAL SURCHARGES & WINTER INSULATION TRAPS',
      `Never sign a 12-month lease sight-unseen from overseas or pay tourist-portal rates for long-term stays. Book a 30-day short-term apartment upon arrival, walk target neighborhoods in person, and negotiate directly with local licensed agencies. Always inspect double-glazed windows, heating/AC split units, and afternoon sun exposure.`,
      VIOLET_600,
      VIOLET_LIGHT
    );

    // PAGE 15: CHAPTER 09 - FIRE MODELING, SWR SENSITIVITY & GEO-ARBITRAGE
    startNewChapterPage();

    drawChapterHeader(
      '09',
      'FIRE Financial Modeling, SWR Sensitivity & Geo-Arbitrage',
      `Safe Withdrawal Rate (4.0% Standard vs. 3.5% Conservative) nest egg targets and US/UK domestic arbitrage savings`,
      EMERALD_700,
      TEAL_LIGHT
    );

    const leanSingle = Math.round(singleMo * 0.8);
    const luxSingle = Math.round(singleMo * 1.5);
    const leanCouple = Math.round(coupleMo * 0.8);
    const luxCouple = Math.round(coupleMo * 1.5);

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [[
        'Lifestyle Tier Mode',
        'Single Monthly / Annual',
        'Single 4% SWR / 3.5% SWR',
        'Couple Monthly / Annual',
        'Couple 4% SWR / 3.5% SWR',
      ]],
      body: [
        [
          'Lean FIRE (Frugal / Provincial 0.8x)',
          `$${leanSingle.toLocaleString()}/mo ($${(leanSingle * 12).toLocaleString()}/yr)`,
          `4%: $${(leanSingle * 12 * 25).toLocaleString()}\n3.5%: $${Math.round((leanSingle * 12) / 0.035).toLocaleString()}`,
          `$${leanCouple.toLocaleString()}/mo ($${(leanCouple * 12).toLocaleString()}/yr)`,
          `4%: $${(leanCouple * 12 * 25).toLocaleString()}\n3.5%: $${Math.round((leanCouple * 12) / 0.035).toLocaleString()}`,
        ],
        [
          'Comfortable Expat Baseline (1.0x)',
          `$${singleMo.toLocaleString()}/mo ($${(singleMo * 12).toLocaleString()}/yr)`,
          `4%: $${(singleMo * 12 * 25).toLocaleString()}\n3.5%: $${Math.round((singleMo * 12) / 0.035).toLocaleString()}`,
          `$${coupleMo.toLocaleString()}/mo ($${(coupleMo * 12).toLocaleString()}/yr)`,
          `4%: $${(coupleMo * 12 * 25).toLocaleString()}\n3.5%: $${Math.round((coupleMo * 12) / 0.035).toLocaleString()}`,
        ],
        [
          'Luxury / Fat FIRE Tier (1.50x)',
          `$${luxSingle.toLocaleString()}/mo ($${(luxSingle * 12).toLocaleString()}/yr)`,
          `4%: $${(luxSingle * 12 * 25).toLocaleString()}\n3.5%: $${Math.round((luxSingle * 12) / 0.035).toLocaleString()}`,
          `$${luxCouple.toLocaleString()}/mo ($${(luxCouple * 12).toLocaleString()}/yr)`,
          `4%: $${(luxCouple * 12 * 25).toLocaleString()}\n3.5%: $${Math.round((luxCouple * 12) / 0.035).toLocaleString()}`,
        ],
      ],
      theme: 'grid',
      headStyles: { fillColor: INDIGO_900, textColor: [255, 255, 255], fontSize: 7.6 },
      columnStyles: {
        0: { cellWidth: 38, fontStyle: 'bold', textColor: SLATE_900 },
        1: { cellWidth: 34, textColor: SLATE_700 },
        2: { cellWidth: 38, fontStyle: 'bold', textColor: TEAL_600 },
        3: { cellWidth: 34, textColor: SLATE_700 },
        4: { cellWidth: contentWidth - 144, fontStyle: 'bold', textColor: INDIGO_600 },
      },
      bodyStyles: { fontSize: 7.4, cellPadding: 2.2 },
    });

    currentY = (doc as any).lastAutoTable.finalY + 5;

    const domesticUSCouple = 5400;
    const domesticUSNestEgg = domesticUSCouple * 12 * 25;
    const havenCoupleNestEgg = coupleMo * 12 * 25;
    const nestEggDifference = domesticUSNestEgg - havenCoupleNestEgg;
    const percentSaved = Math.round((nestEggDifference / domesticUSNestEgg) * 100);

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [[
        'Comparison Benchmark',
        'US / UK Domestic Metro',
        `${country.name} Haven Advantage`,
        'Net Geo-Arbitrage Savings',
      ]],
      body: [
        [
          'Monthly Couple Living Outlay',
          `$${domesticUSCouple.toLocaleString()} USD / month`,
          `$${coupleMo.toLocaleString()} USD / month`,
          `Save $${(domesticUSCouple - coupleMo).toLocaleString()}/mo (-${Math.round(
            ((domesticUSCouple - coupleMo) / domesticUSCouple) * 100
          )}%)`,
        ],
        [
          '4% Rule Target FIRE Nest Egg',
          `$${domesticUSNestEgg.toLocaleString()} USD`,
          `$${havenCoupleNestEgg.toLocaleString()} USD`,
          `Save $${nestEggDifference.toLocaleString()} USD (${percentSaved}% Less Capital Needed)`,
        ],
        [
          'Years to Financial Independence',
          'Working until age 65-67',
          'Achievable 7 to 14 years earlier',
          'Immediate sequence-of-returns protection via lower fixed overhead',
        ],
      ],
      theme: 'striped',
      headStyles: { fillColor: EMERALD_700, textColor: [255, 255, 255], fontSize: 8 },
      columnStyles: {
        0: { fontStyle: 'bold', textColor: SLATE_900 },
        3: { fontStyle: 'bold', textColor: EMERALD_700 },
      },
      bodyStyles: { fontSize: 7.8, cellPadding: 2.2 },
    });

    currentY = (doc as any).lastAutoTable.finalY + 5;

    drawCalloutBox(
      'PORTFOLIO LONGEVITY & SEQUENCE-OF-RETURNS SHIELD',
      `By relocating to ${country.name}, a couple with a $1,000,000 USD portfolio only needs to withdraw ${((coupleMo * 12) / 10000).toFixed(2)}% annually ($${(coupleMo * 12).toLocaleString()}/yr) rather than 6.48% ($64,800/yr) in a typical US metro. Even before Social Security or state pensions begin, this low withdrawal rate virtually eliminates sequence-of-returns risk.`,
      EMERALD_700,
      TEAL_LIGHT
    );
  }

  // =========================================================================
  // PAGES 16, 17, 18, 19 & 20: CHAPTERS 10, 10B, 11, 12 & 12B - TRAVEL, ACTIVITIES, TRANSIT & SAFETY PERSONAS
  // =========================================================================
  if (options.includeTravelAndMobility) {
    // PAGE 16: CHAPTER 10 - FAMOUS RETIREMENT ACTIVITIES & LEISURE (PART 1)
    startNewChapterPage();

    drawChapterHeader(
      '10',
      'Travel, Famous Leisure Pursuits & Senior Activities (Part 1)',
      `Signature hobbies, outdoor recreation, and how retirees spend their days in ${country.name}`,
      AMBER_600,
      AMBER_LIGHT
    );

    drawParagraph(
      `${mobility.activitiesHeadline}. Retirement in ${country.name} offers a fulfilling calendar of outdoor, culinary, cultural, and volunteer activities tailored to varied physical intensities.`,
      9.0,
      SLATE_900
    );

    const halfActCount = Math.ceil(mobility.retireeActivities.length / 2);
    const actGroup1 = mobility.retireeActivities.slice(0, halfActCount);
    const actGroup2 = mobility.retireeActivities.slice(halfActCount);

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [[
        'Leisure Activity & Category',
        'Intensity Level',
        'Top Locations',
        'Activity Overview & Why Retirees Love It',
      ]],
      body: actGroup1.map(act => [
        sanitizePdfText(`${act.title}\n[${act.category}]`),
        sanitizePdfText(act.intensity),
        sanitizePdfText(act.popularLocations),
        sanitizePdfText(`${act.description}\nWhy Retirees Love It: ${act.whyRetireesLoveIt}`),
      ]),
      theme: 'striped',
      headStyles: { fillColor: AMBER_600, textColor: [255, 255, 255], fontSize: 7.8 },
      columnStyles: {
        0: { cellWidth: 40, fontStyle: 'bold', textColor: SLATE_900 },
        1: { cellWidth: 24, halign: 'center', fontStyle: 'bold', textColor: TEAL_600 },
        2: { cellWidth: 32, textColor: INDIGO_600 },
        3: { cellWidth: contentWidth - 96, textColor: SLATE_700 },
      },
      bodyStyles: { fontSize: 7.5, cellPadding: 2.2 },
    });

    // PAGE 17: CHAPTER 10B - FAMOUS RETIREMENT ACTIVITIES (PART 2) & WEEKLY RHYTHM
    startNewChapterPage();

    drawChapterHeader(
      '10B',
      'Leisure Pursuits (Part 2) & Typical Weekly Expat Rhythm',
      `Continuing activity catalogue and regular weekly recreational schedules in ${country.name}`,
      TEAL_600,
      TEAL_LIGHT
    );

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [[
        'Leisure Activity & Category',
        'Intensity Level',
        'Top Locations',
        'Activity Overview & Why Retirees Love It',
      ]],
      body: actGroup2.map(act => [
        sanitizePdfText(`${act.title}\n[${act.category}]`),
        sanitizePdfText(act.intensity),
        sanitizePdfText(act.popularLocations),
        sanitizePdfText(`${act.description}\nWhy Retirees Love It: ${act.whyRetireesLoveIt}`),
      ]),
      theme: 'striped',
      headStyles: { fillColor: TEAL_600, textColor: [255, 255, 255], fontSize: 7.8 },
      columnStyles: {
        0: { cellWidth: 40, fontStyle: 'bold', textColor: SLATE_900 },
        1: { cellWidth: 24, halign: 'center', fontStyle: 'bold', textColor: TEAL_600 },
        2: { cellWidth: 32, textColor: INDIGO_600 },
        3: { cellWidth: contentWidth - 96, textColor: SLATE_700 },
      },
      bodyStyles: { fontSize: 7.5, cellPadding: 2.2 },
    });

    currentY = (doc as any).lastAutoTable.finalY + 5;

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [['Day of Week', 'Morning Active Routine', 'Afternoon Social & Learning', 'Evening Culture & Dining']],
      body: [
        [
          'Monday - Wednesday',
          'Coastal promenade walk, morning golf, or lap swimming',
          'Host-language class, book club, or charity volunteering',
          'Al fresco sunset drinks and dinner with expat circle',
        ],
        [
          'Thursday - Friday',
          'Open-air farmers market & artisan bakery visit',
          'Museum lecture, photography walk, or marina sailing',
          'Live music, regional wine tasting, or neighborhood bistro',
        ],
        [
          'Saturday - Sunday',
          'Scenic regional rail excursion or nature trail hike',
          'Beach club social, botanical gardens, or family brunch',
          'Relaxed plaza stroll (paseo) and evening hospitality',
        ],
      ],
      theme: 'grid',
      headStyles: { fillColor: INDIGO_900, textColor: [255, 255, 255], fontSize: 7.8 },
      bodyStyles: { fontSize: 7.6, cellPadding: 2.1 },
    });

    // PAGE 18: CHAPTER 11 - DOMESTIC TRANSIT INFRASTRUCTURE & INTER-CITY MOBILITY
    startNewChapterPage();

    drawChapterHeader(
      '11',
      'Domestic Transit Infrastructure & Inter-City Mobility',
      `Trains, intercity coaches, highway driving, ride-hailing apps, and domestic flights/ferries in ${country.name}`,
      INDIGO_600,
      INDIGO_LIGHT
    );

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [['Mobility Dimension', 'Empirical Rating & Infrastructure Details']],
      body: [
        [
          'Overall Public Transit & Mobility Score',
          `Score: ${mobility.domesticTransit.publicTransitScore} / 100 | Walkability Score: ${country.lifestyle.walkabilityScore} / 100`,
        ],
        ['National Rail & Passenger Train Network', sanitizePdfText(mobility.domesticTransit.trainNetwork)],
        ['Inter-City Express Buses & Coaches', sanitizePdfText(mobility.domesticTransit.intercityBuses)],
        ['Highways, Car Rental & Driving Rules', sanitizePdfText(mobility.domesticTransit.carRentalAndRoads)],
        [
          'Ride-Hailing Apps & Licensed Taxis',
          sanitizePdfText(mobility.domesticTransit.rideHailingAndTaxis.join('   |   ')),
        ],
        ['Domestic Flights & Ferry Connections', sanitizePdfText(mobility.domesticTransit.domesticAirAndFerries)],
      ],
      theme: 'grid',
      headStyles: { fillColor: INDIGO_600, textColor: [255, 255, 255], fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 52, fontStyle: 'bold', fillColor: INDIGO_LIGHT, textColor: INDIGO_900 },
        1: { cellWidth: contentWidth - 52, textColor: SLATE_700 },
      },
      bodyStyles: { fontSize: 7.8, cellPadding: 2.4 },
    });

    currentY = (doc as any).lastAutoTable.finalY + 5;

    drawCalloutBox(
      'DRIVER LICENSE CONVERSION & SENIOR TRANSIT DISCOUNTS',
      `Most foreign retirees can drive legally in ${country.name} for their first 90 to 180 days using their home driver's license paired with an International Driving Permit (IDP). Once residency is granted, check bilateral license exchange deadlines early. Seniors aged 60–65+ frequently qualify for 25%–50% discounts on national rail and municipal metro passes.`,
      INDIGO_600,
      INDIGO_LIGHT
    );

    // PAGE 19: CHAPTER 12 - TRAVELER PERSONA PROFILES: COUPLES & SOLO TRAVELERS
    startNewChapterPage();

    drawChapterHeader(
      '12',
      'Traveler Persona Profiles: Couples & Solo Retirees',
      `Dedicated safety ratings, romantic escapes, solo dining culture, and social integration in ${country.name}`,
      VIOLET_600,
      VIOLET_LIGHT
    );

    // Couples Deep-Dive Table
    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [[
        `1. Retiring & Traveling as a Couple in ${country.name}`,
        `Safety: ${mobility.couples.safetyRating}/100 (${mobility.couples.safetyVerdict}) | Movement: ${mobility.couples.easeOfMovement}`,
      ]],
      body: [
        ['Executive Couple Assessment', sanitizePdfText(mobility.couples.summary)],
        ['Couple-Friendly Social Vibe', sanitizePdfText(mobility.couples.coupleFriendlyVibe)],
        ['Top Recommended Destinations', sanitizePdfText(mobility.couples.recommendedDestinations.join('   |   '))],
        ['Signature Romantic Escapes', sanitizePdfText(mobility.couples.romanticEscapes.join('   |   '))],
        ['Scenic Road Trips & Rail Routes', sanitizePdfText(mobility.couples.scenicRoadTrips.join('   |   '))],
        ['Preferred Transport Options', sanitizePdfText(mobility.couples.transportOptions.join('   |   '))],
        ['Couple Safety & Practical Advice', sanitizePdfText(mobility.couples.safetyAdvice.join('   |   '))],
      ],
      theme: 'grid',
      headStyles: { fillColor: TEAL_600, textColor: [255, 255, 255], fontSize: 7.8 },
      columnStyles: {
        0: { cellWidth: 48, fontStyle: 'bold', fillColor: TEAL_LIGHT, textColor: SLATE_900 },
        1: { cellWidth: contentWidth - 48, textColor: SLATE_700 },
      },
      bodyStyles: { fontSize: 7.4, cellPadding: 1.9 },
    });

    currentY = (doc as any).lastAutoTable.finalY + 5;

    // Solo Retiree Deep-Dive Table
    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [[
        `2. Retiring & Traveling Solo in ${country.name}`,
        `Safety: ${mobility.solo.safetyRating}/100 | Social Ease Score: ${mobility.solo.socialEaseRating}/100`,
      ]],
      body: [
        ['Executive Solo Assessment', sanitizePdfText(mobility.solo.summary)],
        ['Solo Dining & Cafe Culture', sanitizePdfText(mobility.solo.solitaryDiningAndCafeCulture)],
        ['Meeting Fellow Expats & Retirees', sanitizePdfText(mobility.solo.meetingOtherRetirees)],
        ['Best Hubs for Solo Retirees', sanitizePdfText(mobility.solo.recommendedDestinations.join('   |   '))],
        ['Solo Navigation & Transit Tips', sanitizePdfText(mobility.solo.solitaryNavigationTips.join('   |   '))],
        ['Solo Safety Precautions', sanitizePdfText(mobility.solo.safetyAdvice.join('   |   '))],
      ],
      theme: 'grid',
      headStyles: { fillColor: INDIGO_600, textColor: [255, 255, 255], fontSize: 7.8 },
      columnStyles: {
        0: { cellWidth: 48, fontStyle: 'bold', fillColor: INDIGO_LIGHT, textColor: SLATE_900 },
        1: { cellWidth: contentWidth - 48, textColor: SLATE_700 },
      },
      bodyStyles: { fontSize: 7.4, cellPadding: 1.9 },
    });

    // PAGE 20: CHAPTER 12B - SOLO FEMALE RETIREE & TRAVELER PROFILE
    startNewChapterPage();

    drawChapterHeader(
      '12B',
      'Solo Female Retiree & Traveler Safety & Integration Profile',
      `Dedicated female safety telemetry, street harassment levels, cultural etiquette, and women's networks in ${country.name}`,
      ROSE_600,
      ROSE_LIGHT
    );

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [[
        'Female Safety Score',
        'Street Harassment Level',
        'Safety Verdict',
        'Ease of Domestic Movement',
      ]],
      body: [[
        `${mobility.soloFemale.femaleSafetyScore} / 100`,
        sanitizePdfText(mobility.soloFemale.streetHarassmentLevel),
        sanitizePdfText(mobility.soloFemale.safetyVerdict),
        sanitizePdfText(mobility.soloFemale.easeOfMovement),
      ]],
      theme: 'grid',
      headStyles: { fillColor: ROSE_600, textColor: [255, 255, 255], fontSize: 7.8, halign: 'center' },
      bodyStyles: { fontSize: 8.0, fontStyle: 'bold', halign: 'center', textColor: SLATE_900 },
    });

    currentY = (doc as any).lastAutoTable.finalY + 5;

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [['Solo Female Dimension', 'Empirical Field Assessment & Actionable Guidance']],
      body: [
        ['Executive Solo Female Summary', sanitizePdfText(mobility.soloFemale.summary)],
        ['Cultural Dress & Social Etiquette', sanitizePdfText(mobility.soloFemale.culturalDressAndEtiquette)],
        ['Evening & Nighttime Transit Advice', sanitizePdfText(mobility.soloFemale.nighttimeTransitAdvice)],
        ['Women Expat Groups & Networks', sanitizePdfText(mobility.soloFemale.femaleExpatCommunities)],
        ['Top Recommended Safe Hubs', sanitizePdfText(mobility.soloFemale.recommendedDestinations.join('   |   '))],
        ['Recommended Transit Modes', sanitizePdfText(mobility.soloFemale.transportOptions.join('   |   '))],
        [
          'Recommended Safety Precautions',
          sanitizePdfText(mobility.soloFemale.recommendedPrecautions.map((p, i) => `[${i + 1}] ${p}`).join('\n')),
        ],
      ],
      theme: 'grid',
      headStyles: { fillColor: INDIGO_900, textColor: [255, 255, 255], fontSize: 7.8 },
      columnStyles: {
        0: { cellWidth: 50, fontStyle: 'bold', fillColor: ROSE_LIGHT, textColor: SLATE_900 },
        1: { cellWidth: contentWidth - 50, textColor: SLATE_700 },
      },
      bodyStyles: { fontSize: 7.7, cellPadding: 2.3 },
    });

    currentY = (doc as any).lastAutoTable.finalY + 5;

    drawCalloutBox(
      'CONNECTING WITH FEMALE EXPAT CIRCLES PRIOR TO ARRIVAL',
      `Solo female retirees relocating to ${country.name} consistently report that joining active women's expat networks (${mobility.soloFemale.femaleExpatCommunities}) 60 days before arrival accelerates housing searches, trusted doctor referrals, and immediate social companionship during the first month in-country.`,
      ROSE_600,
      ROSE_LIGHT
    );
  }

  // =========================================================================
  // PAGES 21 & 22: CHAPTERS 13 & 14 - CLIMATE METEOROLOGY & PREMIER EXPAT TOWNS
  // =========================================================================
  if (options.includeClimateAndTowns) {
    // PAGE 21: CHAPTER 13 - CLIMATE METEOROLOGY & 3-SEASON BREAKDOWN
    startNewChapterPage();

    drawChapterHeader(
      '13',
      'Climate Meteorology, Weather Cycles & Seasonal Breakdown',
      `Annual sunshine telemetry, humidity, temperature rhythms, and 3-season living guide for ${country.name}`,
      AMBER_600,
      AMBER_LIGHT
    );

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [['Climatic Parameter', 'Empirical Measurement', 'Seasonal Lifestyle & Housing Impact']],
      body: [
        ['Climate Classification', sanitizePdfText(country.climate.category), 'Determines home insulation, heating/cooling needs, and outdoor lifestyle.'],
        ['Annual Sunny Days', `${country.climate.annualSunnyDays} Sunny Days / year`, 'Supports year-round walking, golf, terrace dining, and active longevity.'],
        [
          'Average Annual Temperature',
          `${country.climate.averageTempC}C (${Math.round((country.climate.averageTempC * 9) / 5 + 32)}F)`,
          'Mild annual thermal profile without severe sub-zero winter freezes.',
        ],
        ['Average Relative Humidity', `${country.climate.humidityPercent}% ambient humidity`, 'Comfortable respiratory climate; coastal breezes moderate summer warmth.'],
        ['Optimal Peak Weather Months', sanitizePdfText(country.climate.bestMonths), 'Ideal window for outdoor travel, visiting family, and initial scouting stays.'],
        ['Rainy / Wet Season Window', sanitizePdfText(country.climate.rainyMonths), 'Seasonal rainfall that keeps landscapes lush and reservoirs replenished.'],
      ],
      theme: 'grid',
      headStyles: { fillColor: AMBER_600, textColor: [255, 255, 255], fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 46, fontStyle: 'bold', textColor: SLATE_900 },
        1: { cellWidth: 44, fontStyle: 'bold', textColor: AMBER_600 },
        2: { cellWidth: contentWidth - 90, textColor: SLATE_700 },
      },
      bodyStyles: { fontSize: 7.8, cellPadding: 2.3 },
    });

    currentY = (doc as any).lastAutoTable.finalY + 5;

    // 3-Season Breakdown Matrix
    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [['Seasonal Phase', 'Expected Conditions', 'Retiree Comfort & Home Preparation Tips']],
      body: [
        [
          '1. Summer Peak Season',
          `Warm, sun-drenched days (~${country.climate.averageTempC + 6}C / ${Math.round(
            ((country.climate.averageTempC + 6) * 9) / 5 + 32
          )}F) with lively coastal tourism.`,
          'Ensure bedroom split-unit A/C; schedule outdoor exercise before 10 AM or after 6 PM.',
        ],
        [
          '2. Winter Low / Mild Season',
          `Crisp evenings and mild afternoons (~${Math.max(8, country.climate.averageTempC - 6)}C / ${Math.round(
            (Math.max(8, country.climate.averageTempC - 6) * 9) / 5 + 32
          )}F).`,
          'Older masonry homes can feel cool indoors—verify reverse-cycle heating or radiant heaters.',
        ],
        [
          '3. Wet / Green Season',
          `Concentrated during ${sanitizePdfText(country.climate.rainyMonths)} (${country.climate.humidityPercent}% avg humidity).`,
          'Use a quiet bedroom dehumidifier in coastal towns and pack waterproof walking footwear.',
        ],
      ],
      theme: 'striped',
      headStyles: { fillColor: TEAL_600, textColor: [255, 255, 255], fontSize: 7.8 },
      columnStyles: {
        0: { cellWidth: 40, fontStyle: 'bold', textColor: SLATE_900 },
        1: { cellWidth: 64, textColor: SLATE_700 },
        2: { cellWidth: contentWidth - 104, textColor: SLATE_600 },
      },
      bodyStyles: { fontSize: 7.6, cellPadding: 2.2 },
    });

    // PAGE 22: CHAPTER 14 - PREMIER EXPAT TOWNS & REGIONAL MICRO-MARKETS
    startNewChapterPage();

    drawChapterHeader(
      '14',
      `Premier Expat Towns & Retirement Hubs in ${country.name}`,
      `In-depth comparison of the top ${country.topCities.length} retirement micro-markets, monthly costs, and local atmosphere`,
      INDIGO_600,
      INDIGO_LIGHT
    );

    const citiesBody = country.topCities.map((city, idx) => [
      `Hub #${idx + 1}: ${sanitizePdfText(city.name)}`,
      `$${city.monthlyCostUSD.toLocaleString()} / mo\n($${(city.monthlyCostUSD * 12).toLocaleString()} / yr)`,
      sanitizePdfText(city.vibe),
      sanitizePdfText(city.highlight),
    ]);

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [['Expat Town / Hub', 'Est. Monthly / Annual', 'Local Vibe & Character', 'Key Retiree Highlights & Appeal']],
      body: citiesBody,
      theme: 'striped',
      headStyles: { fillColor: INDIGO_600, textColor: [255, 255, 255], fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 38, fontStyle: 'bold', textColor: SLATE_900 },
        1: { cellWidth: 34, fontStyle: 'bold', textColor: TEAL_600 },
        2: { cellWidth: 42, fontStyle: 'bold', textColor: INDIGO_600 },
        3: { cellWidth: contentWidth - 114, textColor: SLATE_700 },
      },
      bodyStyles: { fontSize: 7.8, cellPadding: 2.5 },
    });

    currentY = (doc as any).lastAutoTable.finalY + 5;

    drawCalloutBox(
      'CAPITAL METROPOLIS VS. COASTAL & PROVINCIAL HAVENS',
      `Living in or near ${country.capital} provides immediate proximity to flagship international airports, embassies, and JCI tertiary university hospitals. Conversely, secondary hubs like ${
        country.topCities[1]?.name || country.topCities[0]?.name || 'coastal towns'
      } offer relaxed walkability, lower rental overhead, and tight-knit expat social clubs. Split your scouting trip across at least two hubs.`,
      INDIGO_600,
      INDIGO_LIGHT
    );
  }

  // =========================================================================
  // PAGE 23: CHAPTER 15 - DEMOGRAPHICS, SOCIAL DYNAMICS & NIGHTLIFE
  // =========================================================================
  if (options.includeDemographicsAndLifestyle) {
    startNewChapterPage();

    drawChapterHeader(
      '15',
      'Demographics, Social Integration & Nightlife Atmosphere',
      `Population metrics, gender ratios, dating culture, and evening entertainment in ${country.name}`,
      VIOLET_600,
      VIOLET_LIGHT
    );

    const demo = country.demographics;
    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [['Median National Age', 'Females per 100 Males', 'Youth Ratio (<30)', 'Dating Openness Index']],
      body: [[
        `${demo.medianAge} years old`,
        `${demo.femalesPer100Males.toFixed(1)} F : 100 M (${(demo.femalesPer100Males / 100).toFixed(2)}:1)`,
        `${demo.youngPopulationPercent}% under age 30`,
        `${demo.datingRating} / 5 (${demo.datingRating >= 4 ? 'Very Welcoming' : 'Traditional / Respectful'})`,
      ]],
      theme: 'grid',
      headStyles: { fillColor: VIOLET_600, textColor: [255, 255, 255], fontSize: 8, halign: 'center' },
      bodyStyles: { fontSize: 8.2, fontStyle: 'bold', halign: 'center', textColor: SLATE_900 },
    });

    currentY = (doc as any).lastAutoTable.finalY + 5;

    const socialRows: string[][] = [
      ['Dating Culture & Relationship Dynamics', sanitizePdfText(demo.datingCultureSummary)],
      ['Everyday Social Integration & Community', sanitizePdfText(demo.socialAtmosphere)],
      [
        'Language & Expat Network Density',
        `Official Language: ${sanitizePdfText(country.language)} | English Proficiency: ${
          country.lifestyle.englishProficiency
        } | Expat Network: ${country.lifestyle.expatCommunitySize}`,
      ],
    ];

    if (options.includeDiscreetNightlife) {
      const ae = country.adultEntertainment;
      socialRows.push(
        [
          'Nightlife Vibrancy & Venue Scores',
          sanitizePdfText(
            `${ae.nightlifeVibrancy} (Nightlife Score: ${ae.nightlifeScore}/5 | Adult Venue Score: ${ae.adultEntertainmentScore}/5)`
          ),
        ],
        ['Regulatory Framework & Overview', sanitizePdfText(`${ae.legalStatus} - ${ae.overview}`)],
        ['Primary Entertainment Districts', sanitizePdfText(ae.topVenuesOrDistricts.join('   |   '))],
        ['Evening & Nightlife Safety Guidance', sanitizePdfText(ae.safetyGuidance)]
      );
    }

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      body: socialRows,
      theme: 'grid',
      columnStyles: {
        0: { cellWidth: 50, fontStyle: 'bold', fillColor: VIOLET_LIGHT, textColor: SLATE_900 },
        1: { cellWidth: contentWidth - 50, textColor: SLATE_700 },
      },
      bodyStyles: { fontSize: 7.8, cellPadding: 2.3 },
    });
  }

  // =========================================================================
  // PAGES 24, 25 & 26: CHAPTERS 16, 16B & 16C - PRE-RETIREMENT HURDLES & COMPLETE FAQ KNOWLEDGE BASE
  // =========================================================================
  if (options.includeRelocationFaqs) {
    // PAGE 24: CHAPTER 16 - 4-PILLAR PRE-DEPARTURE READINESS CHECKLIST & FAQS (PART 1)
    startNewChapterPage();

    drawChapterHeader(
      '16',
      'Pre-Departure Readiness & Relocation Hurdles FAQ (Part 1)',
      `4-Pillar Pre-Departure Checklist plus step-by-step banking and tax residency guides for ${country.name}`,
      TEAL_600,
      TEAL_LIGHT
    );

    // 4-Pillar Readiness Checklist from CountryFaqHurdles
    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [['Pre-Departure Readiness Pillar', 'Mandatory Action Protocol Before Leaving Home']],
      body: [
        [
          '1. Banking & Cross-Border Capital',
          `Obtain local tax ID (NIF/NIE/RFC) early; maintain a US/UK brokerage account alongside Wise/Revolut multi-currency accounts for low-fee transfers into ${country.currency}.`,
        ],
        [
          '2. Tax Residency & 183-Day Rule',
          `Spending >183 days/year in ${country.name} typically triggers worldwide tax residency. Consult a cross-border CPA 6 months before moving to structure pensions and Roth/capital gains.`,
        ],
        [
          '3. Healthcare & Insurance Bridge',
          `Secure consular-compliant health insurance (${hc.insurance.visaRequirementHeadline}) and carry a 90-day supply of generic (INN) prescriptions.`,
        ],
        [
          '4. Housing Lease & Scouting Rule',
          `Never sign a long-term lease sight-unseen. Book a 30-60 day temporary apartment first to inspect neighborhoods and register your official lease for visa biometrics.`,
        ],
      ],
      theme: 'grid',
      headStyles: { fillColor: TEAL_600, textColor: [255, 255, 255], fontSize: 7.8 },
      columnStyles: {
        0: { cellWidth: 48, fontStyle: 'bold', fillColor: TEAL_LIGHT, textColor: SLATE_900 },
        1: { cellWidth: contentWidth - 48, textColor: SLATE_700 },
      },
      bodyStyles: { fontSize: 7.4, cellPadding: 1.9 },
    });

    currentY = (doc as any).lastAutoTable.finalY + 4.5;

    const faqsGroup1 = faqs.slice(0, 2);
    const faqsGroup2 = faqs.slice(2, 4);
    const faqsGroup3 = faqs.slice(4);

    const renderFaqTables = (faqList: typeof faqs, startIndex: number) => {
      faqList.forEach((faq, idx) => {
        const qNum = startIndex + idx + 1;
        const faqRows = [
          [
            `Q${qNum}: ${sanitizePdfText(faq.question)}`,
            `Category: ${sanitizePdfText(faq.categoryLabel)} | Severity: ${faq.hurdleSeverity} | Timeline: ${sanitizePdfText(
              faq.estimatedResolutionTime
            )}`,
          ],
          ['Executive Summary', sanitizePdfText(faq.shortSummary)],
          ['Detailed Legal & Practical Guidance', sanitizePdfText(faq.detailedAnswer)],
          [
            'Actionable Step-by-Step Checklist',
            sanitizePdfText(faq.actionableChecklist.map((step, sIdx) => `[Step ${sIdx + 1}] ${step}`).join('   |   ')),
          ],
          ['Key Government Agencies & Forms', sanitizePdfText(faq.keyAgenciesOrForms.join(', '))],
        ];

        autoTable(doc, {
          startY: currentY,
          margin: { left: margin, right: margin },
          body: faqRows,
          theme: 'grid',
          columnStyles: {
            0: { cellWidth: 48, fontStyle: 'bold', fillColor: INDIGO_LIGHT, textColor: SLATE_900 },
            1: { cellWidth: contentWidth - 48, textColor: SLATE_700 },
          },
          bodyStyles: { fontSize: 7.3, cellPadding: 1.85 },
          didParseCell: data => {
            if (data.row.index === 0) {
              data.cell.styles.fillColor = INDIGO_900;
              data.cell.styles.textColor = [255, 255, 255];
              data.cell.styles.fontStyle = 'bold';
            }
          },
        });

        currentY = (doc as any).lastAutoTable.finalY + 4;
      });
    };

    renderFaqTables(faqsGroup1, 0);

    // PAGE 25: CHAPTER 16B - RELOCATION HURDLES & FAQ KNOWLEDGE BASE (PART 2)
    startNewChapterPage();

    drawChapterHeader(
      '16B',
      'Relocation Hurdles & FAQ Knowledge Base (Part 2)',
      `Continuing step-by-step guidance on healthcare transitions, insurance, and consular compliance in ${country.name}`,
      INDIGO_600,
      INDIGO_LIGHT
    );

    renderFaqTables(faqsGroup2, 2);

    // PAGE 26: CHAPTER 16C - RELOCATION HURDLES & FAQ KNOWLEDGE BASE (PART 3)
    if (faqsGroup3.length > 0) {
      startNewChapterPage();

      drawChapterHeader(
        '16C',
        'Relocation Hurdles & FAQ Knowledge Base (Part 3)',
        `Continuing resolutions for rental leases, language bureaucracy, and daily settlement in ${country.name}`,
        VIOLET_600,
        VIOLET_LIGHT
      );

      renderFaqTables(faqsGroup3, 4);
    }
  }

  // =========================================================================
  // PAGE 27: CHAPTER 17 - COMMUNITY INSIGHTS, MENTORS & MEETUPS
  // =========================================================================
  if (options.includeCommunityAndMeetups) {
    startNewChapterPage();

    drawChapterHeader(
      '17',
      'Expat Community Network, Resident Mentors & Meetup Circles',
      `Connecting with verified expat mentors, scheduled social gatherings, and peer forum threads in ${country.name}`,
      AMBER_600,
      AMBER_LIGHT
    );

    const localExpats = [
      [
        country.id === 'portugal'
          ? 'Arthur Sterling'
          : country.id === 'thailand'
          ? 'David Chen'
          : country.id === 'spain'
          ? 'Elena Rostova'
          : 'Michael Thorne',
        country.topCities[0]?.name || country.capital,
        '4 years resident',
        `Mentors newcomers on rental leases, immigration appointments, and private healthcare in ${country.name}.`,
      ],
      [
        country.id === 'portugal'
          ? "Margaret O'Connor"
          : country.id === 'thailand'
          ? 'Frank Gallagher'
          : country.id === 'spain'
          ? 'Carlos Mendonza'
          : 'Claire Dupont',
        country.topCities[1]?.name || country.capital,
        '2 years resident',
        `Advises on daily living expenses, language classes, and expat social groups in ${country.name}.`,
      ],
    ];

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [['Resident Expat Mentor', 'Location Hub', 'Tenure Abroad', 'Mentorship & Focus Area']],
      body: localExpats.map(r => r.map(c => sanitizePdfText(c))),
      theme: 'grid',
      headStyles: { fillColor: TEAL_600, textColor: [255, 255, 255], fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 40, fontStyle: 'bold', textColor: SLATE_900 },
        1: { cellWidth: 32, fontStyle: 'bold', textColor: INDIGO_600 },
        2: { cellWidth: 30 },
        3: { cellWidth: contentWidth - 102, textColor: SLATE_700 },
      },
      bodyStyles: { fontSize: 7.8, cellPadding: 2.2 },
    });

    currentY = (doc as any).lastAutoTable.finalY + 5;

    if (meetups.length > 0) {
      autoTable(doc, {
        startY: currentY,
        margin: { left: margin, right: margin },
        head: [['Scheduled Expat Meetup', 'Location & Venue', 'Date & Time', 'Host & Confirmed Attendees']],
        body: meetups.map(m => [
          sanitizePdfText(`${m.title} (${m.category})`),
          sanitizePdfText(`${m.city} - ${m.location}`),
          sanitizePdfText(`${m.date} at ${m.time}`),
          sanitizePdfText(`${m.hostName} (${m.attendeesCount} expats attending)`),
        ]),
        theme: 'striped',
        headStyles: { fillColor: INDIGO_600, textColor: [255, 255, 255], fontSize: 8 },
        bodyStyles: { fontSize: 7.6, cellPadding: 2.1 },
      });

      currentY = (doc as any).lastAutoTable.finalY + 5;
    }

    if (threads.length > 0) {
      autoTable(doc, {
        startY: currentY,
        margin: { left: margin, right: margin },
        head: [['Community Discussion Thread', 'Topic & Author', 'Upvotes', 'Key Peer Insight & Verified Advice']],
        body: threads.map(t => [
          sanitizePdfText(t.title),
          sanitizePdfText(`${t.category}\nBy ${t.authorName} (${t.authorLocation})`),
          `${t.upvotes}`,
          sanitizePdfText(
            `${t.content}${
              t.comments.length > 0
                ? `\nTop Contributor Insight (${t.comments[0].authorName}): "${t.comments[0].text}"`
                : ''
            }`
          ),
        ]),
        theme: 'grid',
        headStyles: { fillColor: INDIGO_900, textColor: [255, 255, 255], fontSize: 8 },
        columnStyles: {
          0: { cellWidth: 44, fontStyle: 'bold', textColor: SLATE_900 },
          1: { cellWidth: 34, textColor: INDIGO_600 },
          2: { cellWidth: 16, halign: 'center', fontStyle: 'bold', textColor: TEAL_600 },
          3: { cellWidth: contentWidth - 94, textColor: SLATE_700 },
        },
        bodyStyles: { fontSize: 7.5, cellPadding: 2 },
      });
    }
  }

  // =========================================================================
  // PAGE 28: CHAPTER 18 - 12-MONTH MASTER RELOCATION ROADMAP
  // =========================================================================
  startNewChapterPage();

  drawChapterHeader(
    '18',
    '12-Month Master Relocation Execution Roadmap & Checklist',
    `Chronological milestone timeline from T-12 months pre-departure planning to full Year 1 settlement in ${country.name}`,
    TEAL_600,
    TEAL_LIGHT
  );

  const roadmapSteps = [
    [
      'T-12 to T-9 Months',
      'Initial Scouting & Financial Audit',
      `Complete 30-to-60 day in-person scouting trip across ${
        country.topCities[0]?.name || country.capital
      } and secondary hubs. Consult cross-border CPA on 183-day tax residency and pension treaties.`,
    ],
    [
      'T-8 to T-6 Months',
      'Vital Records & Tax ID Setup',
      `Order certified birth/marriage certificates. Apply remotely or via legal representative for local tax ID (NIF/NIE/RFC) and open local bank account in ${country.currency}.`,
    ],
    [
      'T-5 to T-4 Months',
      'Police Clearance, Apostilles & Insurance',
      `Order FBI/federal criminal background check (valid 90-180 days) and obtain Hague Apostilles. Purchase consular-compliant health policy (${hc.insurance.visaRequirementHeadline}).`,
    ],
    [
      'T-3 to T-2 Months',
      'Consular Submission & Lease Registration',
      `Engage sworn translator for apostilled documents. Submit formal ${country.visa.retirementVisaName} package at regional consulate. Secure registered residential lease or accommodation proof.`,
    ],
    [
      'T-1 Month to Departure',
      'Visa Stamp, Medical & Logistics',
      `Collect passport with visa stamp. Convert prescriptions to generic chemical names (INN) and pack 90-day supply. Set up 2FA hardware keys for home-country banking.`,
    ],
    [
      'Month 1 In-Country',
      'Biometrics & Municipal Registration',
      `Attend in-country immigration appointment for residency card issuance. Register local address at town hall (Empadronamiento / Junta de Freguesia). Get local SIM/fiber.`,
    ],
    [
      'Months 2 to 3 In-Country',
      'Healthcare Enrollment & Community',
      `Enroll in ${hc.routineCare.publicSystemName} or activate local private hospital app. Establish relationship with English-speaking GP. Join local expat meetups and language courses.`,
    ],
    [
      'Months 6 to 12 In-Country',
      'Driver License Exchange & Renewal Prep',
      `Complete statutory driver's license exchange before foreign permit window expires. Prepare annual tax return with bilingual CPA and verify Year 1 residency renewal documents.`,
    ],
  ];

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [['Timeline Phase', 'Strategic Milestone', 'Concrete Actionable Steps']],
    body: roadmapSteps.map(r => r.map(c => sanitizePdfText(c))),
    theme: 'striped',
    headStyles: { fillColor: INDIGO_600, textColor: [255, 255, 255], fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 34, fontStyle: 'bold', textColor: TEAL_600 },
      1: { cellWidth: 48, fontStyle: 'bold', textColor: SLATE_900 },
      2: { cellWidth: contentWidth - 82, textColor: SLATE_700 },
    },
    bodyStyles: { fontSize: 7.6, cellPadding: 2.2 },
  });

  currentY = (doc as any).lastAutoTable.finalY + 5;

  drawCalloutBox(
    'CRITICAL TIMING RULE: DOCUMENT EXPIRATION WINDOWS',
    'Criminal background checks and medical certificates carry strict 90-to-180 day validity windows at most consulates. Never order your FBI/national police check more than 120 days prior to your confirmed consular appointment date.',
    AMBER_600,
    AMBER_LIGHT
  );

  // =========================================================================
  // PAGE 29: CHAPTER 19 - DOCUMENT GOVERNANCE, LEGAL DISCLAIMER & COPYRIGHT
  // =========================================================================
  startNewChapterPage();

  drawChapterHeader(
    '19',
    'Document Governance, Legal Disclaimer & Exclusive Copyright',
    `Official terms of use, legal notices, intellectual property protection, and cryptographic verification seal`,
    INDIGO_900,
    INDIGO_LIGHT
  );

  drawCalloutBox(
    'OFFICIAL LEGAL, TAX, HEALTHCARE & IMMIGRATION DISCLAIMER',
    `This Master Country Relocation Dossier is published by ReFIREly (ReFIREly.com) for informational, educational, and personal planning purposes only. It does not constitute formal legal, financial, tax, medical, or immigration advice, nor does it establish an attorney-client, physician-patient, or fiduciary relationship.

Immigration legislation, visa income thresholds, double taxation treaties, and healthcare policies are subject to sovereign statutory revision by the government of ${country.name}. Prospective expatriates and retirees are strongly advised to retain licensed immigration attorneys, certified public accountants (CPAs), and qualified healthcare brokers prior to executing contracts or submitting official visa petitions.`,
    INDIGO_600,
    INDIGO_LIGHT
  );

  drawCalloutBox(
    'PROPRIETARY INTELLECTUAL PROPERTY & COPYRIGHT NOTICE',
    `(c) 2026 ReFIREly Global Relocation Intelligence (ReFIREly.com). All Rights Reserved.

This document, including its compilation, tabular schemas, 6-axis radar telemetry, healthcare evaluations, travel mobility assessments, and formatting architecture, constitutes the proprietary intellectual property of ReFIREly.

STRICT PROHIBITION ON COMMERCIAL RESALE AND REDISTRIBUTION:
This dossier is licensed exclusively to the individual member who downloaded it for personal, non-commercial relocation evaluation. Any unauthorized reproduction, resale, syndication, commercial redistribution, or public web hosting without prior written consent from ReFIREly is strictly prohibited.`,
    AMBER_600,
    AMBER_LIGHT
  );

  const totalPages = doc.getNumberOfPages();

  // Document Authenticity & Cryptographic Verification Seal
  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [['Verification Dimension', 'Audit Record & Authenticity Metadata']],
    body: [
      ['Publication Title', sanitizePdfText(`ReFIREly Master Country Relocation & FIRE Dossier - ${country.name}`)],
      ['Publication Volume', `${totalPages}-Page Master Edition (19 Chapters)`],
      ['Document Control ID', documentControlId],
      ['Issuing Entity', 'ReFIREly Global Relocation Intelligence Unit'],
      ['Official Website', 'https://refirely.com'],
      ['Timestamp of Issuance', sanitizePdfText(`${dateFormatted} at ${timeFormatted}`)],
      ['Licensed Recipient', sanitizePdfText(recipientName)],
      ['License Classification', 'Single Individual Planning License (Non-Commercial)'],
      ['Digital Verification Seal', `VERIFIED-AUTHENTIC-${country.code.toUpperCase()}-2026`],
    ],
    theme: 'grid',
    headStyles: { fillColor: INDIGO_900, textColor: [255, 255, 255], fontSize: 7.8 },
    columnStyles: {
      0: { cellWidth: 50, fontStyle: 'bold', textColor: SLATE_900 },
      1: { cellWidth: contentWidth - 50, fontStyle: 'bold', textColor: INDIGO_600 },
    },
    bodyStyles: { fontSize: 7.5, cellPadding: 2 },
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // Official ReFIREly Brand Sign-Off on Final Governance Page
  if (currentY + 24 < pageHeight - 16) {
    if (logoDataUrl) {
      const signLogoW = 46;
      const signLogoH = 15.7;
      doc.addImage(logoDataUrl, 'PNG', centerX - signLogoW / 2, currentY, signLogoW, signLogoH);
      currentY += signLogoH + 4.5;
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.8);
    doc.setTextColor(...INDIGO_900);
    doc.text(
      'OFFICIAL PROPRIETARY PUBLICATION OF REFIRELY GLOBAL RELOCATION INTELLIGENCE (REFIRELY.COM)',
      centerX,
      currentY,
      { align: 'center' }
    );
  }

  // Stamp exact totalPages onto Page 1's Provenance Card ("Publication Volume")
  doc.setPage(1);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...INDIGO_600);
  doc.text(
    sanitizePdfText(`${totalPages}-Page Master Edition (19 Chapters)`),
    kpiStartX + kpiTotalW / 2 + 35,
    metaCardY + 17.2
  );

  // =========================================================================
  // RUNNING HEADERS & FOOTERS (SKIPPING DEDICATED COVER PAGE 1)
  // =========================================================================
  for (let p = 2; p <= totalPages; p++) {
    doc.setPage(p);

    // Top Multi-Color Brand Ribbon (Teal -> Indigo -> Violet -> Amber)
    drawMultiColorRibbon(0, 0, pageWidth, 2.5);

    // Official ReFIREly Icon in Running Header
    if (iconDataUrl) {
      doc.addImage(iconDataUrl, 'PNG', margin, 5, 4.5, 4.5);
    }

    // Top running text
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.4);
    doc.setTextColor(...INDIGO_900);
    doc.text(
      sanitizePdfText(`ReFIREly Global Relocation Atlas  |  ${country.name} Master Dossier`),
      margin + (iconDataUrl ? 6 : 0),
      8.6
    );

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...SLATE_600);
    doc.text(
      sanitizePdfText(`${country.region}  |  Visa: ${country.visa.retirementVisaName}  |  Health: ${hc.overallScore}/100`),
      pageWidth - margin,
      8.6,
      { align: 'right' }
    );

    doc.setDrawColor(...SLATE_200);
    doc.setLineWidth(0.35);
    doc.line(margin, 11.5, pageWidth - margin, 11.5);

    // Running Footer on Pages 2..totalPages
    doc.setDrawColor(...SLATE_200);
    doc.setLineWidth(0.35);
    doc.line(margin, pageHeight - 11.5, pageWidth - margin, pageHeight - 11.5);

    // Bottom Multi-Color Accent Line
    drawMultiColorRibbon(0, pageHeight - 1.8, pageWidth, 1.8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.1);
    doc.setTextColor(...SLATE_600);
    doc.text(
      sanitizePdfText(
        `(c) 2026 ReFIREly.com Global Intelligence  |  ${country.name} ${totalPages}-Page Master Dossier  |  Issued ${dateFormatted}`
      ),
      margin,
      pageHeight - 6.8
    );

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...INDIGO_600);
    doc.text(`Page ${p} of ${totalPages}`, pageWidth - margin, pageHeight - 6.8, {
      align: 'right',
    });
  }

  const safeSlug = country.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  doc.save(`ReFIREly-${safeSlug}-${totalPages}p-Master-Retirement-Dossier.pdf`);
}
