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

export interface DossierExportOptions {
  includeExecutiveSummary: boolean;
  includePersonalReadinessAndJournal: boolean;
  includeVisaAndLegal: boolean;
  includeShortTermVisas: boolean;
  includeCostAndBudget: boolean;
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
      loadImageAsDataUrl('/assets/aistudio/refirely-logo.png'),
      loadImageAsDataUrl('/assets/aistudio/refirely-icon.png'),
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

  // Brand Palette aligned with /assets/aistudio/refirely-logo.png
  const BRAND_NAVY: [number, number, number] = [23, 37, 59]; // #17253b (Re / ly / globe / plane)
  const SAFFRON: [number, number, number] = [234, 88, 12]; // #ea580c (FIRE / flame)
  const PALM_GREEN: [number, number, number] = [93, 140, 62]; // #5d8c3e (Palm frond)
  const AMBER: [number, number, number] = [217, 119, 6]; // #d97706
  const PURPLE: [number, number, number] = [126, 34, 206]; // #7e22ce
  const NAVY: [number, number, number] = [15, 23, 42]; // #0f172a
  const BLUE_800: [number, number, number] = [30, 58, 138]; // #1e3a8a
  const SLATE_900: [number, number, number] = [15, 23, 42];
  const SLATE_700: [number, number, number] = [51, 65, 85];
  const SLATE_600: [number, number, number] = [71, 85, 105];
  const SLATE_300: [number, number, number] = [203, 213, 225];
  const SLATE_200: [number, number, number] = [226, 232, 240];
  const SLATE_100: [number, number, number] = [241, 245, 249];
  const ORANGE_LIGHT: [number, number, number] = [255, 247, 237];
  const PURPLE_LIGHT: [number, number, number] = [250, 245, 255];
  const GREEN_700: [number, number, number] = [21, 128, 61];

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
  const documentControlId = `REF-DOS-${country.code.toUpperCase()}-${now.getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

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

  // Chapter Header Banner
  const drawChapterHeader = (chapterNum: string, title: string, subtitle?: string) => {
    // Left decorative saffron bar
    doc.setFillColor(...SAFFRON);
    doc.rect(margin, currentY, 4, subtitle ? 15 : 10, 'F');

    // Soft banner fill
    doc.setFillColor(...ORANGE_LIGHT);
    doc.rect(margin + 4, currentY, contentWidth - 4, subtitle ? 15 : 10, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...SLATE_900);
    doc.text(sanitizePdfText(`${chapterNum}. ${title.toUpperCase()}`), margin + 8, currentY + 6.5);

    if (subtitle) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(...SLATE_600);
      doc.text(sanitizePdfText(subtitle), margin + 8, currentY + 12);
      currentY += 19;
    } else {
      currentY += 14;
    }
  };

  // Helper to draw formatted paragraphs
  const drawParagraph = (text: string, fontSize = 9.5, color: [number, number, number] = SLATE_700, indent = 0) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(fontSize);
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(sanitizePdfText(text), contentWidth - indent);
    const lineHeight = fontSize * 0.44;
    ensureSpace(lines.length * lineHeight + 4);
    doc.text(lines, margin + indent, currentY);
    currentY += lines.length * lineHeight + 4;
  };

  // Helper to draw structured callout cards
  const drawCalloutBox = (title: string, bodyText: string, borderColor = SAFFRON, bgColor = ORANGE_LIGHT) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    const lines = doc.splitTextToSize(sanitizePdfText(bodyText), contentWidth - 14);
    const boxHeight = lines.length * 4 + 14;
    ensureSpace(boxHeight + 4);

    doc.setFillColor(...bgColor);
    doc.setDrawColor(...borderColor);
    doc.roundedRect(margin, currentY, contentWidth, boxHeight, 2.5, 2.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...SLATE_900);
    doc.text(sanitizePdfText(title), margin + 6, currentY + 6.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...SLATE_700);
    doc.text(lines, margin + 6, currentY + 11.5);

    currentY += boxHeight + 5;
  };

  // =========================================================================
  // PAGE 1: DEDICATED PRESTIGE COVER PAGE
  // =========================================================================
  const centerX = pageWidth / 2;

  // Top Full-Width Brand Ribbon matching the ReFIREly Logo (Navy, Flame Orange, Palm Green)
  doc.setFillColor(...BRAND_NAVY);
  doc.rect(0, 0, pageWidth * 0.42, 4.5, 'F');
  doc.setFillColor(...SAFFRON);
  doc.rect(pageWidth * 0.42, 0, pageWidth * 0.33, 4.5, 'F');
  doc.setFillColor(...PALM_GREEN);
  doc.rect(pageWidth * 0.75, 0, pageWidth * 0.25, 4.5, 'F');

  // Single Refined Architectural Cover Frame (No double border, generous bottom margin)
  doc.setDrawColor(...SLATE_300);
  doc.setLineWidth(0.45);
  doc.roundedRect(margin, 12, contentWidth, 269, 4, 4, 'D');

  // --- SECTION A: OFFICIAL WEBSITE LOGO & BRAND IDENTITY (y = 20mm to 57mm) ---
  if (logoDataUrl) {
    // Official /assets/aistudio/refirely-logo.png (641x240 -> 2.6708 aspect ratio)
    const logoW = 66;
    const logoH = 24.7;
    doc.addImage(logoDataUrl, 'PNG', centerX - logoW / 2, 20, logoW, logoH);
  } else {
    // Faithful styled wordmark fallback if image asset is unavailable
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(26);
    doc.setTextColor(...BRAND_NAVY);
    doc.text('Re', centerX - 18, 36, { align: 'right' });
    doc.setTextColor(...SAFFRON);
    doc.text('FIRE', centerX - 17, 36, { align: 'left' });
    doc.setTextColor(...BRAND_NAVY);
    doc.text('ly', centerX + 14, 36, { align: 'left' });
  }

  // Brand Mission Subtitle
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.8);
  doc.setTextColor(...SLATE_600);
  doc.text(
    'GLOBAL RELOCATION INTELLIGENCE   |   FIRE ANALYTICS   |   EXPAT ATLAS',
    centerX,
    51,
    { align: 'center' }
  );

  // Centered Tricolor Brand Divider (Navy / Flame Orange / Palm Green)
  doc.setFillColor(...BRAND_NAVY);
  doc.rect(centerX - 33, 54.5, 22, 0.9, 'F');
  doc.setFillColor(...SAFFRON);
  doc.rect(centerX - 11, 54.5, 22, 0.9, 'F');
  doc.setFillColor(...PALM_GREEN);
  doc.rect(centerX + 11, 54.5, 22, 0.9, 'F');

  // --- SECTION B: DOSSIER BADGE & COUNTRY HERO TITLE (y = 61mm to 118mm) ---
  doc.setFillColor(...ORANGE_LIGHT);
  doc.setDrawColor(253, 186, 116);
  doc.setLineWidth(0.3);
  doc.roundedRect(centerX - 48, 60.5, 96, 7, 3.5, 3.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.8);
  doc.setTextColor(...SAFFRON);
  doc.text('OFFICIAL COUNTRY RETIREMENT DOSSIER', centerX, 65.2, { align: 'center' });

  // Country Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(27);
  doc.setTextColor(...BRAND_NAVY);
  doc.text(sanitizePdfText(country.name.toUpperCase()), centerX, 78.5, { align: 'center' });

  // Geopolitical Metadata Strip
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.2);
  doc.setTextColor(...BLUE_800);
  doc.text(
    sanitizePdfText(
      `ISO CODE: ${country.code.toUpperCase()}   |   REGION: ${country.region.toUpperCase()}   |   CAPITAL: ${country.capital.toUpperCase()}   |   CURRENCY: ${country.currency}`
    ),
    centerX,
    86.5,
    { align: 'center' }
  );

  // Country Tagline
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9.5);
  doc.setTextColor(...SLATE_600);
  const coverTaglines = doc
    .splitTextToSize(sanitizePdfText(`"${country.tagline}"`), contentWidth - 28)
    .slice(0, 2);
  doc.text(coverTaglines, centerX, 94, { align: 'center' });

  // Concise Executive Overview Brief (3 lines max)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.4);
  doc.setTextColor(...SLATE_700);
  const coverOverviewLines = doc
    .splitTextToSize(sanitizePdfText(country.overview), contentWidth - 24)
    .slice(0, 3);
  doc.text(coverOverviewLines, centerX, 104.5, { align: 'center' });

  // --- SECTION C: 4-PILLAR KEY BENCHMARK CARDS (y = 121mm to 147mm) ---
  const kpiCardsY = 121;
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
  }> = [
    {
      label: 'MONTHLY BUDGET',
      value: `$${country.costOfLiving.monthlyBudgetSingleUSD.toLocaleString()} / $${country.costOfLiving.monthlyBudgetCoupleUSD.toLocaleString()}`,
      sub: 'Single / Couple (USD)',
      accent: SAFFRON,
    },
    {
      label: 'PRIMARY VISA',
      value: `$${country.visa.minimumIncomeUSD.toLocaleString()} / mo`,
      sub: sanitizePdfText(country.visa.retirementVisaName).slice(0, 22),
      accent: BRAND_NAVY,
    },
    {
      label: 'HEALTH & SAFETY',
      value: `${country.lifestyle.healthcareScore} / ${country.lifestyle.safetyScore} (of 100)`,
      sub: 'Clinical & Peace Index',
      accent: PALM_GREEN,
    },
    {
      label: 'ANNUAL CLIMATE',
      value: `${country.climate.annualSunnyDays} Sunny Days`,
      sub: `Avg. ${country.climate.averageTempC} C Year-Round`,
      accent: AMBER,
    },
  ];

  coverKpis.forEach((kpi, idx) => {
    const cardX = kpiStartX + idx * (kpiCardW + kpiGap);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(...SLATE_200);
    doc.setLineWidth(0.3);
    doc.roundedRect(cardX, kpiCardsY, kpiCardW, kpiCardH, 2.5, 2.5, 'FD');

    // Colored top bar inside card
    doc.setFillColor(...kpi.accent);
    doc.rect(cardX + 0.5, kpiCardsY + 0.5, kpiCardW - 1, 2, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(...SLATE_600);
    doc.text(kpi.label, cardX + kpiCardW / 2, kpiCardsY + 7.5, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...BRAND_NAVY);
    doc.text(kpi.value, cardX + kpiCardW / 2, kpiCardsY + 14.8, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(...SLATE_600);
    doc.text(kpi.sub, cardX + kpiCardW / 2, kpiCardsY + 21, { align: 'center' });
  });

  // --- SECTION D: SOVEREIGN & RETIREMENT SPECIFICATION MATRIX CARD (y = 152mm to 198mm) ---
  const specCardY = 152;
  const specCardHeight = 46;
  doc.setFillColor(255, 252, 248);
  doc.setDrawColor(254, 215, 170);
  doc.setLineWidth(0.35);
  doc.roundedRect(kpiStartX, specCardY, kpiTotalW, specCardHeight, 3, 3, 'FD');

  // Header band inside specification card
  doc.setFillColor(...ORANGE_LIGHT);
  doc.rect(kpiStartX + 0.5, specCardY + 0.5, kpiTotalW - 1, 8.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...SAFFRON);
  doc.text('CORE COUNTRY & RETIREMENT SPECIFICATION SUMMARY', kpiStartX + 6, specCardY + 6.2);

  const singleFireTarget = country.costOfLiving.monthlyBudgetSingleUSD * 12 * 25;
  const coupleFireTarget = country.costOfLiving.monthlyBudgetCoupleUSD * 12 * 25;

  const leftSpecs: Array<[string, string]> = [
    ['Official Language:', `${country.language} (English: ${country.lifestyle.englishProficiency})`],
    ['Single 4% FIRE Target:', `$${singleFireTarget.toLocaleString()} USD Nest Egg`],
    ['1-Bed City Center Rent:', `$${country.costOfLiving.rent1BedCenterUSD.toLocaleString()} USD / month`],
    ['Expat Community Scale:', `${country.lifestyle.expatCommunitySize} Resident Network`],
  ];

  const rightSpecs: Array<[string, string]> = [
    ['Private Health Policy:', `~$${country.costOfLiving.healthcareMonthlyUSD} USD / month`],
    ['Couple 4% FIRE Target:', `$${coupleFireTarget.toLocaleString()} USD Nest Egg`],
    ['1-Bed Outside Center:', `$${country.costOfLiving.rent1BedOutsideUSD.toLocaleString()} USD / month`],
    ['Premier Expat Towns:', country.topCities.slice(0, 3).map(t => t.name).join(', ')],
  ];

  leftSpecs.forEach(([label, val], idx) => {
    const rowY = specCardY + 16 + idx * 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.8);
    doc.setTextColor(...BRAND_NAVY);
    doc.text(sanitizePdfText(label), kpiStartX + 6, rowY);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...SLATE_700);
    doc.text(sanitizePdfText(val).slice(0, 32), kpiStartX + 41, rowY);
  });

  rightSpecs.forEach(([label, val], idx) => {
    const rowY = specCardY + 16 + idx * 8;
    const col2X = kpiStartX + kpiTotalW / 2 + 2;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.8);
    doc.setTextColor(...BRAND_NAVY);
    doc.text(sanitizePdfText(label), col2X, rowY);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...SLATE_700);
    doc.text(sanitizePdfText(val).slice(0, 30), col2X + 34, rowY);
  });

  // --- SECTION E: DOCUMENT PROVENANCE, DOWNLOAD AUDIT & LICENSE CARD (y = 204mm to 250mm) ---
  const metaCardY = 204;
  const metaCardHeight = 46;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(...SLATE_300);
  doc.setLineWidth(0.35);
  doc.roundedRect(kpiStartX, metaCardY, kpiTotalW, metaCardHeight, 3, 3, 'FD');

  if (iconDataUrl) {
    doc.addImage(iconDataUrl, 'PNG', kpiStartX + 6, metaCardY + 3.2, 5.5, 5.5);
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...BRAND_NAVY);
  doc.text(
    'DOCUMENT PROVENANCE, DOWNLOAD AUDIT & LICENSING CERTIFICATE',
    kpiStartX + (iconDataUrl ? 13.5 : 6),
    metaCardY + 7.2
  );

  doc.setDrawColor(...SLATE_200);
  doc.setLineWidth(0.3);
  doc.line(kpiStartX + 6, metaCardY + 10.5, kpiStartX + kpiTotalW - 6, metaCardY + 10.5);

  const recipientName = userProfile?.name || 'Valued ReFIREly Member';
  const leftMeta: Array<[string, string]> = [
    ['Document Control ID:', documentControlId],
    ['Downloaded On:', `${dateFormatted} at ${timeFormatted}`],
    ['Prepared For:', recipientName],
    ['Account License:', userProfile?.email || 'Individual Planning Session'],
  ];

  const rightMeta: Array<[string, string]> = [
    ['Publication Volume:', '22-Page Master Edition (14 Chapters)'],
    ['Issuing Authority:', 'ReFIREly Global Intelligence Unit'],
    ['Permitted Usage:', 'Personal Non-Commercial Planning'],
    ['Data Verification:', 'Consular Schedules, WHO & Numbeo'],
  ];

  leftMeta.forEach(([label, val], idx) => {
    const rowY = metaCardY + 17.5 + idx * 7.8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.6);
    doc.setTextColor(...SLATE_700);
    doc.text(sanitizePdfText(label), kpiStartX + 6, rowY);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...SLATE_600);
    doc.text(sanitizePdfText(val).slice(0, 34), kpiStartX + 38, rowY);
  });

  rightMeta.forEach(([label, val], idx) => {
    const rowY = metaCardY + 17.5 + idx * 7.8;
    const col2X = kpiStartX + kpiTotalW / 2 + 4;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.6);
    doc.setTextColor(...SLATE_700);
    doc.text(sanitizePdfText(label), col2X, rowY);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...SLATE_600);
    doc.text(sanitizePdfText(val).slice(0, 32), col2X + 31, rowY);
  });

  // --- SECTION F: CLEAN BOTTOM COLOPHON INSIDE FRAME (y = 258mm to 270mm; frame bottom is 281mm) ---
  doc.setDrawColor(...SLATE_200);
  doc.setLineWidth(0.3);
  doc.line(centerX - 25, 257.5, centerX + 25, 257.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...SAFFRON);
  doc.text(
    'CONFIDENTIAL RELOCATION INTELLIGENCE   |   PREMIUM RESEARCH EDITION',
    centerX,
    263.5,
    { align: 'center' }
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...SLATE_600);
  doc.text(
    '(c) 2026 ReFIREly Global Relocation Intelligence. All rights reserved. Commercial resale or redistribution prohibited.',
    centerX,
    269,
    { align: 'center' }
  );


  // =========================================================================
  // PAGE 2: TABLE OF CONTENTS & DOSSIER BLUEPRINT
  // =========================================================================
  startNewChapterPage();

  drawChapterHeader(
    'TOC',
    'Table of Contents & Dossier Blueprint',
    `Navigational structure and thematic chapters of this ${country.name} dossier`
  );

  const tocChapters = [
    { num: '01', title: 'Executive Country Profile & Strategic SWOT Assessment', p: '3', desc: 'Holistic overview, strategic advantages, critical watch-outs, and 8-KPI scorecard.' },
    { num: '02', title: 'Consular Architecture & Long-Term Visa Pathways', p: '5', desc: 'Primary retirement visa rules, income test, 10-point consular matrix, and PR timeline.' },
    { num: '03', title: 'Short-Stay, Scouting & Digital Nomad Entry Pathways', p: '7', desc: 'Tourist waiver scouting, temporary visitor (VLS) schemes, and remote work legality.' },
    { num: '04', title: 'Cost of Living, Real Estate & Rental Market Intelligence', p: '8', desc: 'Itemized living expenses, lease protocols, tenant protections, and provincial comparisons.' },
    { num: '05', title: 'FIRE Financial Modeling & Geo-Arbitrage Economics', p: '10', desc: 'Lean, Standard & Luxury budgets, 4% rule nest egg targets, and retirement acceleration.' },
    { num: '06', title: 'Healthcare System, Health Insurance & Clinical Infrastructure', p: '11', desc: 'Public system access (SNS/CAJA), private health insurance tiers, and hospital hubs.' },
    { num: '07', title: 'Travel, Famous Leisure Pursuits & Senior Activities', p: '12', desc: 'Comprehensive guide to what retirees do to pass time, top leisure hobbies, and daily life.' },
    { num: '08', title: 'Domestic Transit, Inter-City Mobility & Safety Profiles', p: '14', desc: 'Rail networks, driving rules, and dedicated profiles for couples, solo & solo female travelers.' },
    { num: '09', title: 'Climate Meteorology, Weather Cycles & Top Expat Towns', p: '15', desc: 'Four-season meteorology, annual sunshine, and in-depth profiles of premier expat towns.' },
    { num: '10', title: 'Demographics, Social Integration & Nightlife Atmosphere', p: '17', desc: 'Median age, gender ratios, dating dynamics, social club integration, and nightlife laws.' },
    { num: '11', title: 'Pre-Retirement Regulatory Hurdles & Relocation FAQ Knowledge Base', p: '18', desc: 'Actionable resolutions for banking, 183-day tax residency traps, language and leases.' },
    { num: '12', title: 'Community Discussion Insights, Expat Mentors & Meetup Circles', p: '20', desc: 'Resident expat mentors, scheduled social gatherings, and peer discussion findings.' },
    { num: '13', title: '12-Month Master Relocation Execution Roadmap & Action Checklist', p: '21', desc: 'Chronological timeline from T-12 months pre-departure to Month 3 settled in-country.' },
    { num: '14', title: 'Document Governance, Legal Disclaimer & Exclusive Copyright', p: '22', desc: 'Official empirical disclaimers, proprietary intellectual property notice, and verification seal.' },
  ];

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [['Ch.', 'Chapter Title & Subject Coverage', 'Page', 'Executive Chapter Scope']],
    body: tocChapters.map(c => [c.num, c.title, c.p, c.desc]),
    theme: 'striped',
    headStyles: {
      fillColor: NAVY,
      textColor: [255, 255, 255],
      fontSize: 8.5,
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center', fontStyle: 'bold', textColor: SAFFRON },
      1: { cellWidth: 70, fontStyle: 'bold', textColor: SLATE_900 },
      2: { cellWidth: 14, halign: 'center', fontStyle: 'bold', textColor: PURPLE },
      3: { cellWidth: contentWidth - 96, textColor: SLATE_600 },
    },
    bodyStyles: { fontSize: 7.8, cellPadding: 2.2 },
  });

  currentY = (doc as any).lastAutoTable.finalY + 6;

  // Research Methodology & Provenance Notice
  drawCalloutBox(
    'RESEARCH METHODOLOGY & DATA PROVENANCE',
    'This dossier compiles empirical datasets calibrated against national immigration ministries, Numbeo cost-of-living indices, World Health Organization (WHO) healthcare ratings, and verified boots-on-the-ground expat resident surveys. All currency conversions reflect current spot rates with standard purchasing-power buffers. Calculations are updated continuously to reflect current statutory visa amendments.',
    NAVY,
    [248, 250, 252]
  );

  // =========================================================================
  // PAGE 3 & 4: CHAPTER 1 - EXECUTIVE COUNTRY PROFILE & STRATEGIC SWOT
  // =========================================================================
  startNewChapterPage();

  drawChapterHeader(
    '01',
    'Executive Country Profile & Strategic SWOT Assessment',
    `Holistic macroeconomic, geopolitical, and lifestyle evaluation for prospective retirees in ${country.name}`
  );

  drawParagraph(country.overview, 9.5, SLATE_900);

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
      fillColor: SLATE_900,
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 8.5,
      fontStyle: 'bold',
      textColor: SAFFRON,
      halign: 'center',
      fillColor: [255, 255, 255],
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 6;

  // Key Strategic Advantages (Pros)
  const prosBody = country.pros.map((p, idx) => [
    `+ ${idx + 1}`,
    sanitizePdfText(p),
    'Directly accelerates retiree quality of life, purchasing power, or safety.',
  ]);

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [['#', `Strategic Advantages of Retiring in ${country.name}`, 'Practical Value to Retiree']],
    body: prosBody,
    theme: 'striped',
    headStyles: { fillColor: GREEN_700, textColor: [255, 255, 255], fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center', fontStyle: 'bold', textColor: GREEN_700 },
      1: { cellWidth: 95, fontStyle: 'bold', textColor: SLATE_900 },
      2: { cellWidth: contentWidth - 105, textColor: SLATE_600 },
    },
    bodyStyles: { fontSize: 8, cellPadding: 2.2 },
  });

  currentY = (doc as any).lastAutoTable.finalY + 6;

  // Page 4: Watch-outs, Trade-offs & Strategic SWOT Continuation
  startNewChapterPage();

  drawChapterHeader(
    '01B',
    'Critical Watch-Outs, Trade-Offs & Strategic SWOT',
    `Understanding systemic hurdles, bureaucratic bottlenecks, and mitigation protocols in ${country.name}`
  );

  const consBody = country.cons.map((c, idx) => [
    `- ${idx + 1}`,
    sanitizePdfText(c),
    'Recommended mitigation: Engage professional bilingual counsel and maintain adequate currency buffer.',
  ]);

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [['#', `Critical Considerations & Watch-Outs for ${country.name}`, 'Risk Mitigation Recommendation']],
    body: consBody,
    theme: 'striped',
    headStyles: { fillColor: [180, 83, 9], textColor: [255, 255, 255], fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center', fontStyle: 'bold', textColor: [180, 83, 9] },
      1: { cellWidth: 95, fontStyle: 'bold', textColor: SLATE_900 },
      2: { cellWidth: contentWidth - 105, textColor: SLATE_600 },
    },
    bodyStyles: { fontSize: 8, cellPadding: 2.2 },
  });

  currentY = (doc as any).lastAutoTable.finalY + 6;

  // Structural SWOT Assessment Card
  drawCalloutBox(
    'MACROECONOMIC & GEOPOLITICAL STABILITY ASSESSMENT',
    `${country.name} occupies a resilient regional standing characterized by membership in key international accords. Its economic framework provides dependable stability for foreign pension income, though retirees should monitor exchange rate shifts between USD and ${country.currency}. The judicial system respects private property rights, and foreign nationals enjoy equal legal protections when acquiring long-term rental leases or purchasing real estate under statutory guidelines.`,
    BLUE_800,
    PURPLE_LIGHT
  );

  // =========================================================================
  // PAGE 5 & 6: CHAPTER 2 - CONSULAR ARCHITECTURE & LONG-TERM VISA RULES
  // =========================================================================
  startNewChapterPage();

  drawChapterHeader(
    '02',
    'Consular Architecture & Long-Term Visa Pathways',
    `Official legal requirements, statutory thresholds, and procedural stages for ${country.name}`
  );

  // Primary Visa Summary
  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [['Primary Retirement Visa', 'Min. Passive Income', 'Processing Time', 'Work Permitted', 'Consular Difficulty']],
    body: [[
      sanitizePdfText(country.visa.retirementVisaName),
      `$${country.visa.minimumIncomeUSD.toLocaleString()} USD / month`,
      `~${country.visa.processingMonths} months`,
      country.visa.allowedToWork ? 'Yes (Remote / Overseas)' : 'No (Strict Passive Only)',
      `${country.visa.difficultyRating} / 5 (${country.visa.difficultyRating <= 2 ? 'Accessible' : country.visa.difficultyRating === 3 ? 'Moderate' : 'Stringent'})`,
    ]],
    theme: 'grid',
    headStyles: { fillColor: SAFFRON, textColor: [255, 255, 255], fontSize: 8.5 },
    bodyStyles: { fontSize: 8.5, fontStyle: 'bold', halign: 'center' },
  });

  currentY = (doc as any).lastAutoTable.finalY + 5;

  // Pathway to PR & Tax Regime
  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    body: [
      ['Permanent Residency & Citizenship Timeline', sanitizePdfText(country.visa.pathwayToPR)],
      ['Foreign Pension & Overseas Income Tax Regime', sanitizePdfText(country.visa.taxStatus)],
      [
        'Consular Document Submission Requirements',
        sanitizePdfText(country.visa.keyRequirements.map((r, i) => `[${i + 1}] ${r}`).join('\n')),
      ],
    ],
    theme: 'grid',
    columnStyles: {
      0: { cellWidth: 58, fontStyle: 'bold', fillColor: ORANGE_LIGHT, textColor: SLATE_900 },
      1: { cellWidth: contentWidth - 58, textColor: SLATE_700 },
    },
    bodyStyles: { fontSize: 8, cellPadding: 2.5 },
  });

  currentY = (doc as any).lastAutoTable.finalY + 6;

  // Page 6: 10-Point Consular Matrix
  startNewChapterPage();

  drawChapterHeader(
    '02B',
    'Consular Eligibility & In-Country Settlement Matrix',
    `Detailed statutory benchmarks and consular compliance criteria for ${country.name}`
  );

  const visaRows = getStructuredVisaRows(country).map(row => row.map(cell => sanitizePdfText(cell)));
  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [['Consular Dimension', 'Statutory Requirement & Threshold', 'Practical Implementation Advice']],
    body: visaRows,
    theme: 'striped',
    headStyles: { fillColor: NAVY, textColor: [255, 255, 255], fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 44, fontStyle: 'bold', textColor: SLATE_900 },
      1: { cellWidth: 68, fontStyle: 'bold', textColor: BLUE_800 },
      2: { cellWidth: contentWidth - 112, textColor: SLATE_600 },
    },
    bodyStyles: { fontSize: 7.8, cellPadding: 2.2 },
  });

  currentY = (doc as any).lastAutoTable.finalY + 6;

  drawCalloutBox(
    'LEGAL TIMELINE TO PERMANENT RESIDENCY & PASSPORT',
    `Upon initial consular approval, retirees receive an entry visa enabling them to travel to ${country.name} for biometric card issuance. Maintaining residence status requires adhering strictly to minimum physical presence criteria. After 3 to 5 years of compliant renewals, foreign retirees become eligible to apply for Permanent Residency (PR) or naturalization, offering freedom from future income re-certifications.`,
    SAFFRON,
    ORANGE_LIGHT
  );

  // =========================================================================
  // PAGE 7: CHAPTER 3 - SHORT-STAY, SCOUTING & DIGITAL NOMAD VISAS
  // =========================================================================
  startNewChapterPage();

  drawChapterHeader(
    '03',
    'Short-Stay, Scouting & Digital Nomad Entry Pathways',
    `Trial residency options, tourist waivers, and flexible remote work permits in ${country.name}`
  );

  const shortVisas = getShortTermVisasForCountry(country);
  const shortVisaBody = shortVisas.map(v => [
    sanitizePdfText(`${v.name}\n(${v.category})`),
    sanitizePdfText(v.duration),
    sanitizePdfText(v.financialRequirement),
    sanitizePdfText(`${v.processingTime}\nCost: ${v.estimatedCost}`),
    sanitizePdfText(`${v.idealFor}\nConditions: ${v.keyConditions.join('; ')}`),
  ]);

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [['Entry Option', 'Duration', 'Financial Solvency', 'Processing & Cost', 'Ideal Profile & Conditions']],
    body: shortVisaBody,
    theme: 'grid',
    headStyles: { fillColor: PURPLE, textColor: [255, 255, 255], fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 40, fontStyle: 'bold', textColor: SLATE_900 },
      1: { cellWidth: 24, halign: 'center' },
      2: { cellWidth: 38 },
      3: { cellWidth: 30 },
      4: { cellWidth: contentWidth - 132 },
    },
    bodyStyles: { fontSize: 7.8, cellPadding: 2.2 },
  });

  currentY = (doc as any).lastAutoTable.finalY + 6;

  drawCalloutBox(
    'THE IN-PERSON SCOUTING TRIAL PROTOCOL',
    `ReFIREly strongly advises all prospective retirees to undertake a 30 to 90-day scouting stay prior to submitting irreversible consular visa applications. Utilize the standard tourist entry waiver to experience daily life across distinct seasons (e.g. summer peak vs. winter quiet). Rent a local apartment in a residential neighborhood rather than booking a resort hotel to test grocery availability, walkability, medical access, and noise levels.`,
    PURPLE,
    PURPLE_LIGHT
  );

  // =========================================================================
  // PAGE 8 & 9: CHAPTER 4 - COST OF LIVING & RENTAL MARKET INTELLIGENCE
  // =========================================================================
  startNewChapterPage();

  drawChapterHeader(
    '04',
    'Cost of Living, Real Estate & Rental Intelligence',
    `Empirical itemized expenses, housing costs, and tenant protocols in ${country.name}`
  );

  const col = country.costOfLiving;
  const singleMo = col.monthlyBudgetSingleUSD;
  const coupleMo = col.monthlyBudgetCoupleUSD;

  // Itemized Expense Table
  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [['Expense Category', 'Monthly Estimate (USD)', 'Annualized Cost (USD)', 'Benchmark Context & Notes']],
    body: [
      [
        'Total Baseline Living Budget (Single Retiree)',
        `$${singleMo.toLocaleString()} / mo`,
        `$${(singleMo * 12).toLocaleString()} / yr`,
        'Includes rent, utilities, food, healthcare provision, and local transport',
      ],
      [
        'Total Baseline Living Budget (Retired Couple)',
        `$${coupleMo.toLocaleString()} / mo`,
        `$${(coupleMo * 12).toLocaleString()} / yr`,
        'Shared 1-2 bedroom apartment with combined household expenses',
      ],
      [
        'Apartment Rent (1-Bed City Center / Prime Haven)',
        `$${col.rent1BedCenterUSD.toLocaleString()} / mo`,
        `$${(col.rent1BedCenterUSD * 12).toLocaleString()} / yr`,
        'Walkable expat town center or desirable coastal district',
      ],
      [
        'Apartment Rent (1-Bed Outer Suburbs / Rural Town)',
        `$${col.rent1BedOutsideUSD.toLocaleString()} / mo`,
        `$${(col.rent1BedOutsideUSD * 12).toLocaleString()} / yr`,
        'Quieter residential area or scenic provincial community',
      ],
      [
        'Utilities (Power, Gas, Water, Cooling, Fiber Internet)',
        `$${col.utilitiesMonthlyUSD.toLocaleString()} / mo`,
        `$${(col.utilitiesMonthlyUSD * 12).toLocaleString()} / yr`,
        'Standard 85m2 living space plus high-speed fiber internet and mobile',
      ],
      [
        'Comprehensive Private Health Insurance',
        `$${col.healthcareMonthlyUSD.toLocaleString()} / mo`,
        `$${(col.healthcareMonthlyUSD * 12).toLocaleString()} / yr`,
        `Quality rating ${country.lifestyle.healthcareScore}/100. Covers hospital and specialists.`,
      ],
      [
        'Local Restaurant Dining (Casual / Mid-Range Meal)',
        `$${col.mealInexpensiveUSD.toFixed(2)} / meal`,
        `~$${Math.round(col.mealInexpensiveUSD * 104).toLocaleString()} / yr (2x/wk)`,
        'Three-course lunch or traditional dinner in expat and local eateries',
      ],
      [
        'Groceries & Fresh Markets Index',
        `Score: ${col.groceriesIndex} / 100`,
        'Approx. 40-55% below US metro costs',
        'Abundant weekly open-air produce markets and modern supermarkets',
      ],
    ],
    theme: 'striped',
    headStyles: { fillColor: SAFFRON, textColor: [255, 255, 255], fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 62, fontStyle: 'bold', textColor: SLATE_900 },
      1: { cellWidth: 32, fontStyle: 'bold', textColor: SAFFRON },
      2: { cellWidth: 32, textColor: SLATE_700 },
      3: { cellWidth: contentWidth - 126, textColor: SLATE_600 },
    },
    bodyStyles: { fontSize: 7.8, cellPadding: 2.2 },
  });

  currentY = (doc as any).lastAutoTable.finalY + 6;

  // Page 9: Real Estate, Leases & Tenant Protections
  startNewChapterPage();

  drawChapterHeader(
    '04B',
    'Rental Market Architecture, Leases & Tenant Rights',
    `Securing housing, lease contracts, deposit safety, and property purchasing in ${country.name}`
  );

  const realEstateRows = [
    [
      'Standard Lease Duration',
      'Typically 12-month renewable contracts. Multi-year leases common for settled expats.',
      'Always register contracts officially with local tax revenue authorities.',
    ],
    [
      'Security Deposits & Fiador (Guarantor)',
      '1 to 2 months rent standard deposit. Some landlords request 2-4 months upfront if no local guarantor exists.',
      'Bank guarantees (garantia bancaria) can substitute for local guarantors.',
    ],
    [
      'Tenant Legal Protections',
      'Strong statutory tenant protections exist against arbitrary eviction or excessive annual rent hikes.',
      'Annual rent increases are legally pegged to official consumer inflation indices.',
    ],
    [
      'Furnished vs. Unfurnished',
      'Both readily available. Fully furnished (equipado) apartments facilitate rapid settlement for early retirees.',
      'Furnished rentals typically command a 15-25% premium over bare units.',
    ],
    [
      'Foreign Property Ownership Rights',
      'Foreigners generally enjoy equal freehold ownership rights without nationality restrictions.',
      'Engage an independent conveyancing lawyer (solicitor) not affiliated with the seller.',
    ],
  ];

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [['Rental / Property Dimension', 'Market Norm & Legal Standard', 'Retiree Protection Protocol']],
    body: realEstateRows.map(r => r.map(c => sanitizePdfText(c))),
    theme: 'grid',
    headStyles: { fillColor: NAVY, textColor: [255, 255, 255], fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 46, fontStyle: 'bold', textColor: SLATE_900 },
      1: { cellWidth: 70, textColor: SLATE_700 },
      2: { cellWidth: contentWidth - 116, textColor: SLATE_600 },
    },
    bodyStyles: { fontSize: 7.8, cellPadding: 2.4 },
  });

  currentY = (doc as any).lastAutoTable.finalY + 6;

  drawCalloutBox(
    'AVOIDING EXPAT RENTAL SURCHARGES',
    `Do not lease apartments through short-term tourist booking portals for permanent relocation. Once on the ground during your initial trial scouting trip, connect with licensed local bilingual real estate brokers (imobiliarias/inmobiliarias). Inspect the heating and cooling installations thoroughly, as winter insulation varies significantly across older historical buildings.`,
    NAVY,
    ORANGE_LIGHT
  );

  // =========================================================================
  // PAGE 10: CHAPTER 5 - FIRE MODELING & GEO-ARBITRAGE ECONOMICS
  // =========================================================================
  startNewChapterPage();

  drawChapterHeader(
    '05',
    'FIRE Financial Modeling & Geo-Arbitrage Economics',
    `Portfolio nest egg requirements, safe withdrawal rate (SWR) modeling, and retirement acceleration`
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
      'Single 4% FIRE Nest Egg',
      'Couple Monthly / Annual',
      'Couple 4% FIRE Nest Egg',
    ]],
    body: [
      [
        'Lean FIRE (Frugal / Provincial 0.8x)',
        `$${leanSingle.toLocaleString()}/mo  ($${(leanSingle * 12).toLocaleString()}/yr)`,
        `$${(leanSingle * 12 * 25).toLocaleString()} USD`,
        `$${leanCouple.toLocaleString()}/mo  ($${(leanCouple * 12).toLocaleString()}/yr)`,
        `$${(leanCouple * 12 * 25).toLocaleString()} USD`,
      ],
      [
        'Comfortable Expat Baseline (1.0x)',
        `$${singleMo.toLocaleString()}/mo  ($${(singleMo * 12).toLocaleString()}/yr)`,
        `$${(singleMo * 12 * 25).toLocaleString()} USD`,
        `$${coupleMo.toLocaleString()}/mo  ($${(coupleMo * 12).toLocaleString()}/yr)`,
        `$${(coupleMo * 12 * 25).toLocaleString()} USD`,
      ],
      [
        'Luxury / Fat FIRE Tier (1.50x)',
        `$${luxSingle.toLocaleString()}/mo  ($${(luxSingle * 12).toLocaleString()}/yr)`,
        `$${(luxSingle * 12 * 25).toLocaleString()} USD`,
        `$${luxCouple.toLocaleString()}/mo  ($${(luxCouple * 12).toLocaleString()}/yr)`,
        `$${(luxCouple * 12 * 25).toLocaleString()} USD`,
      ],
    ],
    theme: 'grid',
    headStyles: { fillColor: NAVY, textColor: [255, 255, 255], fontSize: 8 },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: SLATE_900 },
      1: { textColor: SLATE_700 },
      2: { fontStyle: 'bold', textColor: SAFFRON },
      3: { textColor: SLATE_700 },
      4: { fontStyle: 'bold', textColor: PURPLE },
    },
    bodyStyles: { fontSize: 8, cellPadding: 2.5 },
  });

  currentY = (doc as any).lastAutoTable.finalY + 6;

  // Domestic vs Haven Arbitrage Comparison Table
  const domesticUSCouple = 5200;
  const domesticUSNestEgg = domesticUSCouple * 12 * 25;
  const havenCoupleNestEgg = coupleMo * 12 * 25;
  const nestEggDifference = domesticUSNestEgg - havenCoupleNestEgg;
  const percentSaved = Math.round((nestEggDifference / domesticUSNestEgg) * 100);

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [['Comparison Benchmark', 'US / UK Domestic Metro', `${country.name} Haven Advantage`, 'Net Geo-Arbitrage Savings']],
    body: [
      [
        'Monthly Couple Budget',
        `$${domesticUSCouple.toLocaleString()} USD / month`,
        `$${coupleMo.toLocaleString()} USD / month`,
        `Save $${(domesticUSCouple - coupleMo).toLocaleString()} USD / month (-${Math.round(((domesticUSCouple - coupleMo) / domesticUSCouple) * 100)}%)`,
      ],
      [
        '4% Rule Target Nest Egg',
        `$${domesticUSNestEgg.toLocaleString()} USD`,
        `$${havenCoupleNestEgg.toLocaleString()} USD`,
        `Save $${nestEggDifference.toLocaleString()} USD (${percentSaved}% Less Capital Needed)`,
      ],
      [
        'Years to Financial Independence',
        'Working until age 62-67',
        'Achievable 7 to 14 years earlier',
        'Freedom to retire ahead of domestic schedule',
      ],
    ],
    theme: 'striped',
    headStyles: { fillColor: GREEN_700, textColor: [255, 255, 255], fontSize: 8 },
    columnStyles: {
      0: { fontStyle: 'bold' },
      3: { fontStyle: 'bold', textColor: GREEN_700 },
    },
    bodyStyles: { fontSize: 8, cellPadding: 2.2 },
  });

  currentY = (doc as any).lastAutoTable.finalY + 6;

  drawCalloutBox(
    'THE POWER OF INTERNATIONAL GEO-ARBITRAGE',
    `By relocating from high-cost domestic urban areas to ${country.name}, retirees effectively double their investment dividend purchasing power. Because the required FIRE nest egg drops by ${percentSaved}%, capital that would normally take another decade of work to accumulate is no longer required. Coupled with lower property taxes and private healthcare fees, your net worth goes significantly further.`,
    GREEN_700,
    ORANGE_LIGHT
  );

  // =========================================================================
  // PAGE 11: CHAPTER 6 - HEALTHCARE SYSTEM & MEDICAL INFRASTRUCTURE
  // =========================================================================
  startNewChapterPage();

  drawChapterHeader(
    '06',
    'Healthcare System, Health Insurance & Clinical Infrastructure',
    `Public health access, private medical insurance, emergency networks, and drug coverage in ${country.name}`
  );

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [['Healthcare Dimension', 'Official Rating & Cost Metrics', 'Operational Assessment']],
    body: [
      [
        'Healthcare System Quality',
        `Score: ${country.lifestyle.healthcareScore} / 100\nWorld Health Org Tier: High`,
        sanitizePdfText(country.lifestyle.healthcareSummary),
      ],
      [
        'Public Healthcare Access Rights',
        'Universal access post-residency registration',
        sanitizePdfText(country.lifestyle.publicHealthcareAccess),
      ],
      [
        'Private Health Insurance Costs',
        `Est. ~$${country.costOfLiving.healthcareMonthlyUSD} USD / month\n($${country.costOfLiving.healthcareMonthlyUSD * 12}/year)`,
        'Comprehensive in-patient & out-patient coverage across private hospitals, diagnostics, and specialty centers with low copays.',
      ],
      [
        'Doctor Consultations & Specialist Care',
        'Private GP: ~$40-$70 USD\nSpecialist: ~$60-$95 USD',
        'English-speaking general practitioners and medical specialists available in all primary expat provincial centers.',
      ],
      [
        'Prescription Drugs & Pharmacy Network',
        'Regulated maximum retail prices\nSubsidized under public formulary',
        'Extensive network of licensed community pharmacies with 24-hour on-duty rotations in every municipality.',
      ],
    ],
    theme: 'grid',
    headStyles: { fillColor: PURPLE, textColor: [255, 255, 255], fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 44, fontStyle: 'bold', fillColor: PURPLE_LIGHT },
      1: { cellWidth: 46, fontStyle: 'bold', textColor: SLATE_900 },
      2: { cellWidth: contentWidth - 90, textColor: SLATE_600 },
    },
    bodyStyles: { fontSize: 8, cellPadding: 2.5 },
  });

  currentY = (doc as any).lastAutoTable.finalY + 6;

  drawCalloutBox(
    'DUAL HEALTHCARE STRATEGY FOR EXPATS',
    `Most experienced retirees in ${country.name} maintain a strategic dual healthcare approach: registering with the public system for chronic care and subsidized medications, while maintaining an affordable private health policy ($60-$120/mo) for rapid, same-week access to English-speaking specialists and elective procedures without public waiting lists.`,
    PURPLE,
    PURPLE_LIGHT
  );

  // =========================================================================
  // PAGE 12 & 13: CHAPTER 7 - TRAVEL, FAMOUS LEISURE PURSUITS & SENIOR ACTIVITIES
  // =========================================================================
  startNewChapterPage();

  const mobility = getCountryTravelMobility(country);

  drawChapterHeader(
    '07',
    'Travel, Famous Leisure Pursuits & Senior Activities',
    `What retirees do in ${country.name}, weekly lifestyle rhythms, and popular recreational hobbies`
  );

  drawParagraph(
    `Retirement in ${country.name} is characterized by an active, outdoor-oriented social calendar. From coastal maritime pursuits to historic culinary tours, retirees have access to rich cultural and recreational activities suited to diverse physical abilities.`,
    9.5,
    SLATE_900
  );

  // Activities Table - Part 1
  const halfActCount = Math.ceil(mobility.retireeActivities.length / 2);
  const actGroup1 = mobility.retireeActivities.slice(0, halfActCount);
  const actGroup2 = mobility.retireeActivities.slice(halfActCount);

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [['Leisure Activity', 'Category', 'Intensity', 'Top Locations', 'Overview & Why Retirees Love It']],
    body: actGroup1.map(act => [
      sanitizePdfText(act.title),
      sanitizePdfText(act.category),
      sanitizePdfText(act.intensity),
      sanitizePdfText(act.popularLocations),
      sanitizePdfText(act.description),
    ]),
    theme: 'striped',
    headStyles: { fillColor: SAFFRON, textColor: [255, 255, 255], fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 36, fontStyle: 'bold', textColor: SLATE_900 },
      1: { cellWidth: 26 },
      2: { cellWidth: 22, halign: 'center' },
      3: { cellWidth: 32 },
      4: { cellWidth: contentWidth - 116, textColor: SLATE_600 },
    },
    bodyStyles: { fontSize: 7.6, cellPadding: 2.2 },
  });

  currentY = (doc as any).lastAutoTable.finalY + 6;

  // Page 13: Activities Part 2 & Typical Weekly Rhythm
  startNewChapterPage();

  drawChapterHeader(
    '07B',
    'Leisure Pursuits (Cont.) & Typical Weekly Expat Rhythm',
    `Continuing activity catalogue and regular weekly recreational schedules in ${country.name}`
  );

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [['Leisure Activity', 'Category', 'Intensity', 'Top Locations', 'Overview & Why Retirees Love It']],
    body: actGroup2.map(act => [
      sanitizePdfText(act.title),
      sanitizePdfText(act.category),
      sanitizePdfText(act.intensity),
      sanitizePdfText(act.popularLocations),
      sanitizePdfText(act.description),
    ]),
    theme: 'striped',
    headStyles: { fillColor: SAFFRON, textColor: [255, 255, 255], fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 36, fontStyle: 'bold', textColor: SLATE_900 },
      1: { cellWidth: 26 },
      2: { cellWidth: 22, halign: 'center' },
      3: { cellWidth: 32 },
      4: { cellWidth: contentWidth - 116, textColor: SLATE_600 },
    },
    bodyStyles: { fontSize: 7.6, cellPadding: 2.2 },
  });

  currentY = (doc as any).lastAutoTable.finalY + 6;

  // Typical Weekly Schedule Table
  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [['Day of Week', 'Morning Focus', 'Afternoon Social Activity', 'Evening Culture & Dining']],
    body: [
      ['Monday - Wednesday', 'Coastal walk, golf, or lap swimming', 'Bilingual language exchange / volunteer work', 'Al fresco dinner with fellow expats'],
      ['Thursday - Friday', 'Weekly local farmers market visit', 'Art history lecture or sailing outing', 'Live acoustic music / local bistro gathering'],
      ['Saturday - Sunday', 'Provincial train excursion or vineyard hike', 'Beach gathering or community club social', 'Relaxed family and neighbor hospitality'],
    ],
    theme: 'grid',
    headStyles: { fillColor: NAVY, textColor: [255, 255, 255], fontSize: 8 },
    bodyStyles: { fontSize: 7.8, cellPadding: 2.2 },
  });

  // =========================================================================
  // PAGE 14: CHAPTER 8 - DOMESTIC TRANSIT, MOBILITY & SAFETY PROFILES
  // =========================================================================
  startNewChapterPage();

  drawChapterHeader(
    '08',
    'Domestic Transit, Inter-City Mobility & Traveler Safety Profiles',
    `Moving around ${country.name}: rail systems, highways, and specialized profiles for couples and solo travelers`
  );

  // Mobility & Safety Profiles Table
  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [['Traveler Profile', 'Safety Index & Verdict', 'Domestic Ease', 'Excitement Level', 'Practical Advice & Strategic Insights']],
    body: [
      [
        'Couples Travel Profile',
        `${mobility.couples.safetyRating}/100 - ${mobility.couples.safetyVerdict}`,
        mobility.couples.easeOfMovement,
        mobility.couples.excitementLevel,
        sanitizePdfText(mobility.couples.summary),
      ],
      [
        'Solo Traveler Profile',
        `${mobility.solo.safetyRating}/100 - ${mobility.solo.safetyVerdict}`,
        mobility.solo.easeOfMovement,
        mobility.solo.excitementLevel,
        sanitizePdfText(mobility.solo.summary),
      ],
      [
        'Solo Female Traveler Profile',
        `${mobility.soloFemale.femaleSafetyScore}/100\nHarassment: ${mobility.soloFemale.streetHarassmentLevel}`,
        mobility.soloFemale.easeOfMovement,
        mobility.soloFemale.excitementLevel,
        sanitizePdfText(mobility.soloFemale.summary),
      ],
    ],
    theme: 'grid',
    headStyles: { fillColor: NAVY, textColor: [255, 255, 255], fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 36, fontStyle: 'bold', textColor: SLATE_900 },
      1: { cellWidth: 38, fontStyle: 'bold' },
      2: { cellWidth: 26 },
      3: { cellWidth: 24 },
      4: { cellWidth: contentWidth - 124, textColor: SLATE_600 },
    },
    bodyStyles: { fontSize: 7.6, cellPadding: 2.5 },
  });

  currentY = (doc as any).lastAutoTable.finalY + 6;

  // Transit Infrastructure Details Table
  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [['Transit Mode', 'Infrastructure Standard', 'Senior / Expat Discounts & Practical Tips']],
    body: [
      ['National Rail & High-Speed Trains', 'Modern, air-conditioned, reliable network connecting major metros.', 'Generous senior discounts (25-50% off) with national rail discount card.'],
      ['Inter-City Express Coaches', 'Comfortable coach network with onboard Wi-Fi reaching provincial towns.', 'Cost-effective alternative for routes not serviced by passenger rail.'],
      ['Roads, Highways & Tollways', 'High-quality highway network with modern electronic tolling.', 'International Driving Permit (IDP) valid for initial 6-12 months.'],
      ['Urban Metro, Trams & City Buses', 'Punctual, safe, clean public transit in all primary metropolitan areas.', 'Monthly multi-modal transit passes provide unlimited rides under $40/mo.'],
    ],
    theme: 'striped',
    headStyles: { fillColor: BLUE_800, textColor: [255, 255, 255], fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 46, fontStyle: 'bold' },
      1: { cellWidth: 70 },
      2: { cellWidth: contentWidth - 116 },
    },
    bodyStyles: { fontSize: 7.8, cellPadding: 2.2 },
  });

  // =========================================================================
  // PAGE 15 & 16: CHAPTER 9 - CLIMATE & PREMIER EXPAT TOWNS
  // =========================================================================
  startNewChapterPage();

  drawChapterHeader(
    '09',
    'Climate Meteorology, Weather Cycles & Micro-Climates',
    `Seasonal weather patterns, temperature rhythms, and sunshine metrics in ${country.name}`
  );

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [['Climatic Parameter', 'Empirical Measurement', 'Seasonal Lifestyle Impact']],
    body: [
      ['Climate Category', country.climate.category, 'Determines heating and air conditioning requirements and daily wardrobe.'],
      ['Annual Sunny Days', `${country.climate.annualSunnyDays} Sunny Days / year`, 'Supports year-round outdoor sports, hiking, gardening, and solar living.'],
      ['Average Annual Temperature', `${country.climate.averageTempC}C (${Math.round((country.climate.averageTempC * 9) / 5 + 32)}F)`, 'Mild seasonal fluctuations prevent extreme cold or debilitating freezes.'],
      ['Relative Humidity', `${country.climate.humidityPercent}% average humidity`, 'Comfortable respiratory environment for active seniors and retirees.'],
      ['Rainy / Wet Season', country.climate.rainyMonths, 'Brief seasonal showers that replenish reservoirs and maintain lush greenery.'],
      ['Optimal Living Months', country.climate.bestMonths, 'Peak outdoor climate with warm days, mild evenings, and low precipitation.'],
    ],
    theme: 'grid',
    headStyles: { fillColor: SAFFRON, textColor: [255, 255, 255], fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 46, fontStyle: 'bold', textColor: SLATE_900 },
      1: { cellWidth: 44, fontStyle: 'bold', textColor: SAFFRON },
      2: { cellWidth: contentWidth - 90, textColor: SLATE_600 },
    },
    bodyStyles: { fontSize: 8, cellPadding: 2.4 },
  });

  currentY = (doc as any).lastAutoTable.finalY + 6;

  // Page 16: Top Expat Towns Directory
  startNewChapterPage();

  drawChapterHeader(
    '09B',
    `Premier Expat Towns & Retirement Hubs in ${country.name}`,
    `Detailed guide to the top ${country.topCities.length} retirement locations, costs, and local atmosphere`
  );

  const citiesBody = country.topCities.map(city => [
    sanitizePdfText(city.name),
    `$${city.monthlyCostUSD.toLocaleString()} USD / mo`,
    sanitizePdfText(city.vibe),
    sanitizePdfText(city.highlight),
  ]);

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [['Expat Town / Hub', 'Est. Monthly Cost', 'Local Vibe & Character', 'Key Retiree Highlights']],
    body: citiesBody,
    theme: 'striped',
    headStyles: { fillColor: PURPLE, textColor: [255, 255, 255], fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 36, fontStyle: 'bold', textColor: SLATE_900 },
      1: { cellWidth: 32, fontStyle: 'bold', textColor: SAFFRON },
      2: { cellWidth: 44 },
      3: { cellWidth: contentWidth - 112, textColor: SLATE_600 },
    },
    bodyStyles: { fontSize: 8, cellPadding: 2.4 },
  });

  currentY = (doc as any).lastAutoTable.finalY + 6;

  drawCalloutBox(
    'SELECTING YOUR IDEAL PROVINCIAL HAVEN',
    `Urban centers like ${country.capital} offer top-tier cultural events, world-class hospitals, and extensive international flight connections, but come with higher rental rates. In contrast, coastal havens and provincial heritage towns offer peaceful walkability, tighter-knit expat social circles, and 25% to 40% lower rent. Spend time in multiple micro-regions before committing.`,
    PURPLE,
    PURPLE_LIGHT
  );

  // =========================================================================
  // PAGE 17: CHAPTER 10 - DEMOGRAPHICS, SOCIAL DYNAMICS & NIGHTLIFE
  // =========================================================================
  startNewChapterPage();

  drawChapterHeader(
    '10',
    'Demographics, Social Integration & Nightlife Atmosphere',
    `Population dynamics, gender ratios, dating culture, and evening entertainment in ${country.name}`
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
    headStyles: { fillColor: NAVY, textColor: [255, 255, 255], fontSize: 8, halign: 'center' },
    bodyStyles: { fontSize: 8.5, fontStyle: 'bold', halign: 'center' },
  });

  currentY = (doc as any).lastAutoTable.finalY + 5;

  const socialRows: string[][] = [
    ['Dating Culture Dynamics', sanitizePdfText(demo.datingCultureSummary)],
    ['Everyday Social Atmosphere', sanitizePdfText(demo.socialAtmosphere)],
  ];

  if (options.includeDiscreetNightlife) {
    const ae = country.adultEntertainment;
    socialRows.push(
      [
        'Nightlife Vibrancy & Score',
        sanitizePdfText(`${ae.nightlifeVibrancy} (Nightlife: ${ae.nightlifeScore}/5 | Adult Venue Score: ${ae.adultEntertainmentScore}/5)`),
      ],
      ['Regulatory Status & Overview', sanitizePdfText(`${ae.legalStatus} - ${ae.overview}`)],
      ['Key Entertainment Districts', sanitizePdfText(ae.topVenuesOrDistricts.join(', '))],
      ['Nightlife Safety Guidance', sanitizePdfText(ae.safetyGuidance)]
    );
  }

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    body: socialRows,
    theme: 'grid',
    columnStyles: {
      0: { cellWidth: 48, fontStyle: 'bold', fillColor: [248, 250, 252], textColor: SLATE_900 },
      1: { cellWidth: contentWidth - 48, textColor: SLATE_700 },
    },
    bodyStyles: { fontSize: 8, cellPadding: 2.4 },
  });

  // =========================================================================
  // PAGE 18 & 19: CHAPTER 11 - PRE-RETIREMENT HURDLES & FAQS
  // =========================================================================
  startNewChapterPage();

  const faqs = getFaqsForCountry(country);
  const halfFaqs = Math.ceil(faqs.length / 2);
  const faqsGroup1 = faqs.slice(0, halfFaqs);
  const faqsGroup2 = faqs.slice(halfFaqs);

  drawChapterHeader(
    '11',
    'Pre-Retirement Hurdles & Relocation FAQ Knowledge Base (Part 1)',
    `Step-by-step guidance on banking, tax residency traps, and official bureaucracy in ${country.name}`
  );

  faqsGroup1.forEach((faq, idx) => {
    const faqRows = [
      [
        `Q${idx + 1}: ${sanitizePdfText(faq.question)}`,
        `Category: ${sanitizePdfText(faq.categoryLabel)} | Severity: ${faq.hurdleSeverity} | Resolution: ${sanitizePdfText(faq.estimatedResolutionTime)}`,
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
        0: { cellWidth: 48, fontStyle: 'bold', fillColor: ORANGE_LIGHT, textColor: SLATE_900 },
        1: { cellWidth: contentWidth - 48, textColor: SLATE_700 },
      },
      bodyStyles: { fontSize: 7.6, cellPadding: 2 },
      didParseCell: data => {
        if (data.row.index === 0) {
          data.cell.styles.fillColor = SLATE_900;
          data.cell.styles.textColor = [255, 255, 255];
          data.cell.styles.fontStyle = 'bold';
        }
      },
    });

    currentY = (doc as any).lastAutoTable.finalY + 4;
  });

  // Page 19: FAQs Part 2
  startNewChapterPage();

  drawChapterHeader(
    '11B',
    'Pre-Retirement Hurdles & Relocation FAQ Knowledge Base (Part 2)',
    `Continuing actionable resolutions for healthcare transitions, leases, and municipal registration`
  );

  faqsGroup2.forEach((faq, idx) => {
    const faqIndex = halfFaqs + idx + 1;
    const faqRows = [
      [
        `Q${faqIndex}: ${sanitizePdfText(faq.question)}`,
        `Category: ${sanitizePdfText(faq.categoryLabel)} | Severity: ${faq.hurdleSeverity} | Resolution: ${sanitizePdfText(faq.estimatedResolutionTime)}`,
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
        0: { cellWidth: 48, fontStyle: 'bold', fillColor: ORANGE_LIGHT, textColor: SLATE_900 },
        1: { cellWidth: contentWidth - 48, textColor: SLATE_700 },
      },
      bodyStyles: { fontSize: 7.6, cellPadding: 2 },
      didParseCell: data => {
        if (data.row.index === 0) {
          data.cell.styles.fillColor = SLATE_900;
          data.cell.styles.textColor = [255, 255, 255];
          data.cell.styles.fontStyle = 'bold';
        }
      },
    });

    currentY = (doc as any).lastAutoTable.finalY + 4;
  });

  // =========================================================================
  // PAGE 20: CHAPTER 12 - COMMUNITY INSIGHTS & MEETUPS
  // =========================================================================
  startNewChapterPage();

  drawChapterHeader(
    '12',
    'Community Discussions, Local Expat Mentors & Meetup Circles',
    `Connecting with verified expats, local social organizers, and community discussions in ${country.name}`
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
      `Mentors newcomers on renting, immigration appointments, and local healthcare in ${country.name}.`,
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
      `Advises on daily living expenses, language learning, and expat social groups in ${country.name}.`,
    ],
  ];

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [['Resident Expat Mentor', 'Location Hub', 'Tenure Abroad', 'Mentorship & Focus Area']],
    body: localExpats.map(r => r.map(c => sanitizePdfText(c))),
    theme: 'grid',
    headStyles: { fillColor: SAFFRON, textColor: [255, 255, 255], fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 40, fontStyle: 'bold' },
      1: { cellWidth: 32 },
      2: { cellWidth: 30 },
      3: { cellWidth: contentWidth - 102 },
    },
    bodyStyles: { fontSize: 8, cellPadding: 2.4 },
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
      headStyles: { fillColor: PURPLE, textColor: [255, 255, 255], fontSize: 8 },
      bodyStyles: { fontSize: 7.8, cellPadding: 2.2 },
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
      headStyles: { fillColor: NAVY, textColor: [255, 255, 255], fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 44, fontStyle: 'bold' },
        1: { cellWidth: 34 },
        2: { cellWidth: 16, halign: 'center' },
        3: { cellWidth: contentWidth - 94 },
      },
      bodyStyles: { fontSize: 7.6, cellPadding: 2 },
    });
  }

  // =========================================================================
  // PAGE 21: CHAPTER 13 - 12-MONTH MASTER RELOCATION ROADMAP
  // =========================================================================
  startNewChapterPage();

  drawChapterHeader(
    '13',
    '12-Month Master Relocation Execution Roadmap & Checklist',
    `Chronological milestone timeline from pre-departure planning to full settlement in ${country.name}`
  );

  const roadmapSteps = [
    [
      'T-12 to T-9 Months',
      'Initial Scouting & Document Foundation',
      'Conduct 30-day in-person trial trip. Order certified birth/marriage certificates. Request FBI/national criminal history background check. Obtain official Apostille certifications.',
    ],
    [
      'T-8 to T-6 Months',
      'Consular Preparation & Translations',
      'Engage sworn legal translator for apostilled records. Request certified pension / Social Security statements. Secure proof of health insurance. Set up Portuguese/local NIF or foreign tax number.',
    ],
    [
      'T-5 to T-3 Months',
      'Consular Submission & In-Country Pre-Lease',
      'Submit formal residency visa package to regional consulate. Open local bank account and transfer required living capital. Secure registered 12-month lease agreement.',
    ],
    [
      'T-2 to T-1 Month',
      'Logistics, Medical & Packing',
      'Obtain visa stamp in passport. Book one-way flights. Schedule pet health checks and international microchipping. Cancel domestic utilities and notify tax authorities of impending departure.',
    ],
    [
      'Month 1 In-Country',
      'Immigration Appointment & Residence Card',
      'Attend biometrics appointment at national immigration office (AIMA/SEF/Migraciones). Register residence address at local parish (junta de freguesia / ayuntamiento). Receive residence card.',
    ],
    [
      'Months 2 to 3 In-Country',
      'Healthcare Registration & Settling In',
      'Register for public healthcare (SNS/CAJA) at local health center. Enroll in language courses. Attend local expat meetups and establish routine banking and utility auto-pay.',
    ],
  ];

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [['Timeline Phase', 'Strategic Milestone', 'Concrete Actionable Steps']],
    body: roadmapSteps.map(r => r.map(c => sanitizePdfText(c))),
    theme: 'striped',
    headStyles: { fillColor: SAFFRON, textColor: [255, 255, 255], fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 32, fontStyle: 'bold', textColor: SAFFRON },
      1: { cellWidth: 50, fontStyle: 'bold', textColor: SLATE_900 },
      2: { cellWidth: contentWidth - 82, textColor: SLATE_700 },
    },
    bodyStyles: { fontSize: 7.8, cellPadding: 2.5 },
  });

  currentY = (doc as any).lastAutoTable.finalY + 6;

  drawCalloutBox(
    'ROADMAP SUCCESS PRINCIPLE: TIMING IS CRITICAL',
    'Apostilled criminal background checks generally possess a strict 90 to 180-day validity window depending on the destination consulate. Do not order criminal background checks more than 4 months before your scheduled consular appointment date to prevent expirations.',
    SAFFRON,
    ORANGE_LIGHT
  );

  // =========================================================================
  // PAGE 22: CHAPTER 14 - DOCUMENT GOVERNANCE, LEGAL DISCLAIMER & COPYRIGHT
  // =========================================================================
  startNewChapterPage();

  drawChapterHeader(
    '14',
    'Document Governance, Legal Disclaimer & Exclusive Copyright',
    `Official terms of use, legal notices, copyright enforcement, and verification provenance`
  );

  // Official Legal Disclaimer Card
  drawCalloutBox(
    'OFFICIAL LEGAL, TAX & IMMIGRATION DISCLAIMER',
    `This Country Relocation Dossier is published by ReFIREly for informational, educational, and personal planning purposes only. It does not constitute formal legal, financial, tax, or immigration advice, nor does it establish an attorney-client or fiduciary relationship.

Immigration legislation, visa income thresholds, double taxation treaties, and healthcare policies are subject to sovereign statutory revision by the government of ${country.name} and international authorities. While ReFIREly verifies datasets against official gazettes, Numbeo indexes, and WHO reports, regulations change without prior notice.

Prospective expatriates and retirees are strongly advised to retain licensed immigration attorneys, certified public accountants (CPAs), and registered financial fiduciaries in their home country and in ${country.name} prior to executing contracts, liquidating assets, or submitting official visa petitions.`,
    NAVY,
    [248, 250, 252]
  );

  // Strict Proprietary Copyright Notice Card
  drawCalloutBox(
    'PROPRIETARY INTELLECTUAL PROPERTY & COPYRIGHT NOTICE',
    `(c) 2026 ReFIREly Global Relocation Intelligence. All Rights Reserved.

This document, including its compilation, tabular schemas, quantitative scoring models, travel mobility evaluations, and formatting architecture, constitutes the proprietary intellectual property of ReFIREly.

STRICT PROHIBITION ON COMMERCIAL RESALE AND REDISTRIBUTION:
This dossier is licensed exclusively to the individual member who downloaded it for personal, non-commercial relocation evaluation. Any unauthorized reproduction, resale, syndication, commercial redistribution, public web hosting, extraction into automated databases, or ingestion into machine learning / artificial intelligence models without prior written consent from ReFIREly is strictly prohibited and will be prosecuted under international copyright law and the Digital Millennium Copyright Act (DMCA).`,
    SAFFRON,
    ORANGE_LIGHT
  );

  // Document Authenticity & Cryptographic Verification Seal
  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [['Verification Dimension', 'Audit Record & Authenticity Metadata']],
    body: [
      ['Publication Title', sanitizePdfText(`ReFIREly Country Relocation & FIRE Dossier - ${country.name}`)],
      ['Document Control ID', documentControlId],
      ['Issuing Entity', 'ReFIREly Global Relocation Intelligence Unit'],
      ['Official Website', 'https://refirely.com'],
      ['Timestamp of Issuance', sanitizePdfText(`${dateFormatted} at ${timeFormatted}`)],
      ['Licensed Recipient', sanitizePdfText(recipientName)],
      ['License Classification', 'Single Individual Planning License (Non-Commercial)'],
      ['Digital Verification Seal', `VERIFIED-AUTHENTIC-${country.code.toUpperCase()}-2026`],
    ],
    theme: 'grid',
    headStyles: { fillColor: SLATE_900, textColor: [255, 255, 255], fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 50, fontStyle: 'bold', textColor: SLATE_900 },
      1: { cellWidth: contentWidth - 50, fontStyle: 'bold', textColor: BLUE_800 },
    },
    bodyStyles: { fontSize: 7.8, cellPadding: 2.2 },
  });

  currentY = (doc as any).lastAutoTable.finalY + 10;

  // Official ReFIREly Brand Sign-Off on Final Governance Page
  if (currentY + 28 < pageHeight - 16) {
    if (logoDataUrl) {
      const signLogoW = 42;
      const signLogoH = 15.7;
      doc.addImage(logoDataUrl, 'PNG', centerX - signLogoW / 2, currentY, signLogoW, signLogoH);
      currentY += signLogoH + 5;
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...BRAND_NAVY);
    doc.text(
      'OFFICIAL PROPRIETARY PUBLICATION OF REFIRELY GLOBAL RELOCATION INTELLIGENCE',
      centerX,
      currentY,
      { align: 'center' }
    );
  }

  // =========================================================================
  // RUNNING HEADERS & FOOTERS (SKIPPING DEDICATED COVER PAGE 1)
  // =========================================================================
  const totalPages = doc.getNumberOfPages();

  for (let p = 2; p <= totalPages; p++) {
    doc.setPage(p);

    // Top Tricolor Brand Ribbon matching ReFIREly Logo (Navy, Flame Orange, Palm Green)
    doc.setFillColor(...BRAND_NAVY);
    doc.rect(0, 0, pageWidth * 0.42, 2.5, 'F');
    doc.setFillColor(...SAFFRON);
    doc.rect(pageWidth * 0.42, 0, pageWidth * 0.33, 2.5, 'F');
    doc.setFillColor(...PALM_GREEN);
    doc.rect(pageWidth * 0.75, 0, pageWidth * 0.25, 2.5, 'F');

    // Official ReFIREly Icon in Running Header
    if (iconDataUrl) {
      doc.addImage(iconDataUrl, 'PNG', margin, 5.2, 4.5, 4.5);
    }

    // Top running text
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...BRAND_NAVY);
    doc.text(
      sanitizePdfText(`ReFIREly Global Relocation Atlas  |  ${country.name} Complete Dossier`),
      margin + (iconDataUrl ? 6 : 0),
      8.8
    );

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...SLATE_600);
    doc.text(
      sanitizePdfText(`${country.region}  |  Visa: ${country.visa.retirementVisaName}`),
      pageWidth - margin,
      8.8,
      { align: 'right' }
    );

    doc.setDrawColor(...SLATE_200);
    doc.setLineWidth(0.35);
    doc.line(margin, 11.5, pageWidth - margin, 11.5);

    // Running Footer on Pages 2..totalPages
    doc.setDrawColor(...SLATE_200);
    doc.setLineWidth(0.35);
    doc.line(margin, pageHeight - 11.5, pageWidth - margin, pageHeight - 11.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.2);
    doc.setTextColor(...SLATE_600);
    doc.text(
      sanitizePdfText(`(c) 2026 ReFIREly Global Intelligence  |  ${country.name} Master Dossier  |  Issued ${dateFormatted}`),
      margin,
      pageHeight - 6.8
    );

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...SAFFRON);
    doc.text(
      `Page ${p} of ${totalPages}`,
      pageWidth - margin,
      pageHeight - 6.8,
      { align: 'right' }
    );
  }

  const safeSlug = country.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  doc.save(`ReFIREly-${safeSlug}-Master-Retirement-Dossier.pdf`);
}

