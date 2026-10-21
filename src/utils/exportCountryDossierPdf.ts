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

export interface DossierExportOptions {
  includeExecutiveSummary: boolean;
  includePersonalReadinessAndJournal: boolean;
  includeVisaAndLegal: boolean;
  includeShortTermVisas: boolean;
  includeCostAndBudget: boolean;
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
    // Strip surrogate pair emojis that Helvetica cannot render
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

export function generateCountryDossierPdf(ctx: DossierExportContext): void {
  const { country, userProfile, isAuthenticated, journalEntry, threads, meetups, options } = ctx;

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

  // Brand Colors (RGB tuples)
  const SAFFRON: [number, number, number] = [234, 88, 12]; // #ea580c
  const PURPLE: [number, number, number] = [126, 34, 206]; // #7e22ce
  const NAVY: [number, number, number] = [30, 58, 138]; // #1e3a8a
  const SLATE_900: [number, number, number] = [15, 23, 42];
  const SLATE_600: [number, number, number] = [71, 85, 105];
  const SLATE_200: [number, number, number] = [226, 232, 240];
  const ORANGE_LIGHT: [number, number, number] = [255, 247, 237];
  const PURPLE_LIGHT: [number, number, number] = [250, 245, 255];

  const ensureSpace = (neededMm: number) => {
    if (currentY + neededMm > pageHeight - 18) {
      doc.addPage();
      currentY = 22;
    }
  };

  const drawSectionHeader = (sectionNum: string, title: string, subtitle?: string) => {
    ensureSpace(22);
    currentY += 4;

    // Accent bar on left
    doc.setFillColor(...SAFFRON);
    doc.rect(margin, currentY, 3, subtitle ? 12 : 8.5, 'F');

    // Light banner fill
    doc.setFillColor(...ORANGE_LIGHT);
    doc.rect(margin + 3, currentY, contentWidth - 3, subtitle ? 12 : 8.5, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11.5);
    doc.setTextColor(...SLATE_900);
    doc.text(sanitizePdfText(`${sectionNum}. ${title.toUpperCase()}`), margin + 6, currentY + 5.5);

    if (subtitle) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(...SLATE_600);
      doc.text(sanitizePdfText(subtitle), margin + 6, currentY + 10);
      currentY += 15;
    } else {
      currentY += 12;
    }
  };

  const drawWrappedParagraph = (text: string, fontSize = 9.5, color: [number, number, number] = SLATE_600, indent = 0) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(fontSize);
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(sanitizePdfText(text), contentWidth - indent);
    const lineHeight = fontSize * 0.44;
    ensureSpace(lines.length * lineHeight + 3);
    doc.text(lines, margin + indent, currentY);
    currentY += lines.length * lineHeight + 3;
  };

  // =========================================================================
  // COVER BANNER & EXECUTIVE HEADER
  // =========================================================================
  // Top Tricolor / Brand Header Strip
  doc.setFillColor(...SAFFRON);
  doc.rect(0, 0, pageWidth / 3, 4, 'F');
  doc.setFillColor(245, 158, 11);
  doc.rect(pageWidth / 3, 0, pageWidth / 3, 4, 'F');
  doc.setFillColor(...PURPLE);
  doc.rect((pageWidth / 3) * 2, 0, pageWidth / 3, 4, 'F');

  // Hero Header Box
  doc.setFillColor(255, 250, 245);
  doc.setDrawColor(254, 215, 170);
  doc.roundedRect(margin, 10, contentWidth, 38, 3, 3, 'FD');

  // Brand tag
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...SAFFRON);
  doc.text('REFIRELY GLOBAL RETIREMENT ATLAS  |  OFFICIAL COUNTRY DOSSIER', margin + 5, 16.5);

  // Country Name & Code
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(...SLATE_900);
  doc.text(sanitizePdfText(`${country.name} (${country.code})`), margin + 5, 25.5);

  // Metadata line
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...NAVY);
  const metaLine = `Region: ${country.region}   |   Capital: ${country.capital}   |   Currency: ${country.currency}   |   Language: ${country.language}   |   English: ${country.lifestyle.englishProficiency}`;
  doc.text(sanitizePdfText(metaLine), margin + 5, 32);

  // Tagline
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(...SLATE_600);
  const taglineLines = doc.splitTextToSize(sanitizePdfText(country.tagline), contentWidth - 10);
  doc.text(taglineLines, margin + 5, 38);

  currentY = 53;

  // Quick 8-KPI Executive Grid using autoTable
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

  currentY = (doc as any).lastAutoTable.finalY + 4;

  let sectionCounter = 1;

  // =========================================================================
  // SECTION 1: EXECUTIVE SUMMARY, PROS & CONS
  // =========================================================================
  if (options.includeExecutiveSummary) {
    drawSectionHeader(
      String(sectionCounter++),
      'Executive Overview & Strategic Assessment',
      `Comprehensive evaluation of lifestyle, infrastructure, and retirement suitability in ${country.name}`
    );

    drawWrappedParagraph(country.overview, 9.5, SLATE_900);

    // Pros & Cons Side-by-Side Table
    const maxRows = Math.max(country.pros.length, country.cons.length);
    const prosConsBody: string[][] = [];
    for (let i = 0; i < maxRows; i++) {
      prosConsBody.push([
        country.pros[i] ? `+ ${sanitizePdfText(country.pros[i])}` : '',
        country.cons[i] ? `- ${sanitizePdfText(country.cons[i])}` : '',
      ]);
    }

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [['Why Retirees Love It (Key Advantages)', 'Trade-offs & Considerations (Watch Out For)']],
      body: prosConsBody,
      theme: 'grid',
      headStyles: {
        fillColor: NAVY,
        textColor: [255, 255, 255],
        fontSize: 8.5,
        fontStyle: 'bold',
      },
      columnStyles: {
        0: { cellWidth: contentWidth / 2, textColor: [21, 128, 61] },
        1: { cellWidth: contentWidth / 2, textColor: [180, 83, 9] },
      },
      bodyStyles: {
        fontSize: 8.5,
        cellPadding: 2.5,
      },
    });

    currentY = (doc as any).lastAutoTable.finalY + 4;
  }

  // =========================================================================
  // SECTION 2: PERSONALIZED FINANCIAL READINESS & CONFIDENTIAL JOURNAL
  // =========================================================================
  if (options.includePersonalReadinessAndJournal && (isAuthenticated || journalEntry)) {
    drawSectionHeader(
      String(sectionCounter++),
      'Personal Financial Readiness & Confidential Journal',
      `Tailored feasibility benchmark and personal scouting notes for ${userProfile?.name || 'Retiree Member'}`
    );

    if (isAuthenticated && userProfile) {
      const finances = userProfile.finances;
      const monthlySalary = finances?.monthlySalaryUSD || Math.round((finances?.currentSalaryUSD || 120000) / 12);
      const netWorth = finances
        ? finances.investments.savingsUSD +
          finances.investments.stocksMutualFundsUSD +
          finances.investments.realEstateUSD +
          finances.investments.goldUSD +
          finances.investments.othersUSD -
          (finances.totalLiabilitiesUSD || 0)
        : 835000;
      const swrRate = finances?.safeWithdrawalRatePercent || 4.0;
      const swrMonthly = Math.round((netWorth * (swrRate / 100)) / 12);

      const singleBudget = country.costOfLiving.monthlyBudgetSingleUSD;
      const visaMin = country.visa.minimumIncomeUSD;
      const meetsVisaViaSalary = monthlySalary >= visaMin;
      const meetsVisaViaSwr = swrMonthly >= visaMin;

      autoTable(doc, {
        startY: currentY,
        margin: { left: margin, right: margin },
        head: [['Personal Metric', 'Your Profile Figure', `${country.name} Benchmark`, 'Feasibility Status']],
        body: [
          [
            'Monthly Active Income',
            `$${monthlySalary.toLocaleString()} / mo`,
            `$${singleBudget.toLocaleString()} / mo (Single Budget)`,
            monthlySalary >= singleBudget
              ? `Surplus +$${(monthlySalary - singleBudget).toLocaleString()}/mo`
              : `Gap -$${(singleBudget - monthlySalary).toLocaleString()}/mo`,
          ],
          [
            `Total Net Worth (${swrRate}% SWR)`,
            `$${netWorth.toLocaleString()} ($${swrMonthly.toLocaleString()}/mo)`,
            `$${Math.round((singleBudget * 12) / (swrRate / 100)).toLocaleString()} target nest egg`,
            swrMonthly >= singleBudget ? 'Fully Funded via 4% Rule' : 'Partial SWR Coverage',
          ],
          [
            'Visa Income Qualification',
            `$${Math.max(monthlySalary, swrMonthly).toLocaleString()} / mo peak`,
            `$${visaMin.toLocaleString()} / mo (${sanitizePdfText(country.visa.retirementVisaName)})`,
            meetsVisaViaSwr || meetsVisaViaSalary ? 'Meets Visa Minimum Threshold' : 'Requires Savings Buffer',
          ],
        ],
        theme: 'striped',
        headStyles: { fillColor: PURPLE, textColor: [255, 255, 255], fontSize: 8.5 },
        bodyStyles: { fontSize: 8.5 },
      });

      currentY = (doc as any).lastAutoTable.finalY + 4;
    }

    if (journalEntry) {
      autoTable(doc, {
        startY: currentY,
        margin: { left: margin, right: margin },
        head: [['Journal Parameter', 'Logged Details']],
        body: [
          ['Candidacy Interest Level', sanitizePdfText(journalEntry.interestLevel)],
          [
            'Personal Scouting Budget Estimate',
            journalEntry.personalBudgetEstimateUSD
              ? `$${journalEntry.personalBudgetEstimateUSD.toLocaleString()} USD / month`
              : 'Standard Dossier Estimate',
          ],
          ['Scouting Timeline & Status', sanitizePdfText(journalEntry.scoutingTimeline || 'Not specified')],
          ['Visited Country Previously', journalEntry.visitedBefore ? 'Yes - Visited in person' : 'No - Planning initial trip'],
          ['Personal Tags', sanitizePdfText(journalEntry.tags.join(', ') || 'None')],
          ['Confidential Notes', sanitizePdfText(journalEntry.privateNotes || 'No private notes recorded.')],
        ],
        theme: 'grid',
        headStyles: { fillColor: SAFFRON, textColor: [255, 255, 255], fontSize: 8.5 },
        columnStyles: {
          0: { cellWidth: 55, fontStyle: 'bold' },
          1: { cellWidth: contentWidth - 55 },
        },
        bodyStyles: { fontSize: 8.5 },
      });

      currentY = (doc as any).lastAutoTable.finalY + 4;
    }
  }

  // =========================================================================
  // SECTION 3: VISA, RESIDENCY RULES & TAX LANDSCAPE
  // =========================================================================
  if (options.includeVisaAndLegal) {
    drawSectionHeader(
      String(sectionCounter++),
      'Visa, Legal Residency & Retiree Tax Framework',
      `Official pathways, income thresholds, permanent residency timeline, and tax treaties for ${country.name}`
    );

    // Primary Visa Summary Table
    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [['Primary Retirement Visa', 'Min. Passive Income', 'Processing Time', 'Work Permitted', 'Difficulty']],
      body: [[
        sanitizePdfText(country.visa.retirementVisaName),
        `$${country.visa.minimumIncomeUSD.toLocaleString()} USD / mo`,
        `~${country.visa.processingMonths} months`,
        country.visa.allowedToWork ? 'Yes (Remote / Foreign)' : 'No (Passive Income Only)',
        `${country.visa.difficultyRating} / 5`,
      ]],
      theme: 'grid',
      headStyles: { fillColor: SAFFRON, textColor: [255, 255, 255], fontSize: 8.5 },
      bodyStyles: { fontSize: 8.5, fontStyle: 'bold' },
    });

    currentY = (doc as any).lastAutoTable.finalY + 4;

    // Pathway to PR & Tax Regime
    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      body: [
        ['Pathway to Permanent Residency & Citizenship', sanitizePdfText(country.visa.pathwayToPR)],
        ['Retiree Tax Landscape & Foreign Pension Rules', sanitizePdfText(country.visa.taxStatus)],
        [
          'Mandatory Qualification Checklist',
          sanitizePdfText(country.visa.keyRequirements.map((r, i) => `${i + 1}. ${r}`).join('   |   ')),
        ],
      ],
      theme: 'grid',
      columnStyles: {
        0: { cellWidth: 58, fontStyle: 'bold', fillColor: ORANGE_LIGHT, textColor: SLATE_900 },
        1: { cellWidth: contentWidth - 58 },
      },
      bodyStyles: { fontSize: 8.5, cellPadding: 2.5 },
    });

    currentY = (doc as any).lastAutoTable.finalY + 4;

    // 10-Point Structured Consular Eligibility Matrix
    const visaRows = getStructuredVisaRows(country).map(row => row.map(cell => sanitizePdfText(cell)));
    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [['Consular Dimension', 'Official Requirement & Threshold', 'Practical Implementation Notes']],
      body: visaRows,
      theme: 'striped',
      headStyles: { fillColor: NAVY, textColor: [255, 255, 255], fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 44, fontStyle: 'bold' },
        1: { cellWidth: 68 },
        2: { cellWidth: contentWidth - 112 },
      },
      bodyStyles: { fontSize: 8, cellPadding: 2 },
    });

    currentY = (doc as any).lastAutoTable.finalY + 4;
  }

  // =========================================================================
  // SECTION 4: SHORT-STAY, SCOUTING & DIGITAL NOMAD VISAS
  // =========================================================================
  if (options.includeShortTermVisas) {
    const shortVisas = getShortTermVisasForCountry(country);
    drawSectionHeader(
      String(sectionCounter++),
      'Short-Stay, Scouting & Trial Residency Visas',
      `Snowbird tourist waivers, digital nomad permits, and 12-month trial options in ${country.name}`
    );

    const shortVisaBody = shortVisas.map(v => [
      sanitizePdfText(`${v.name}\n(${v.category})`),
      sanitizePdfText(v.duration),
      sanitizePdfText(v.financialRequirement),
      sanitizePdfText(`${v.processingTime} | Cost: ${v.estimatedCost}`),
      sanitizePdfText(`${v.idealFor}\nConditions: ${v.keyConditions.join('; ')}`),
    ]);

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [['Visa / Entry Option', 'Duration', 'Financial Requirement', 'Processing & Cost', 'Ideal Profile & Key Conditions']],
      body: shortVisaBody,
      theme: 'grid',
      headStyles: { fillColor: PURPLE, textColor: [255, 255, 255], fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 38, fontStyle: 'bold' },
        1: { cellWidth: 24 },
        2: { cellWidth: 38 },
        3: { cellWidth: 30 },
        4: { cellWidth: contentWidth - 130 },
      },
      bodyStyles: { fontSize: 7.8, cellPadding: 2 },
    });

    currentY = (doc as any).lastAutoTable.finalY + 4;
  }

  // =========================================================================
  // SECTION 5: COST OF LIVING & ANNUAL RETIREMENT BUDGET
  // =========================================================================
  if (options.includeCostAndBudget) {
    drawSectionHeader(
      String(sectionCounter++),
      'Cost of Living & Annual Retirement Budget Projections',
      `Monthly and annual expense breakdown in USD for single retirees and couples in ${country.name}`
    );

    const col = country.costOfLiving;
    const singleMo = col.monthlyBudgetSingleUSD;
    const coupleMo = col.monthlyBudgetCoupleUSD;

    // Itemized Cost Table
    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [['Expense Category', 'Monthly Estimate (USD)', 'Annualized Cost (USD)', 'Benchmark Notes']],
      body: [
        [
          'Full Monthly Living Budget (Single Retiree)',
          `$${singleMo.toLocaleString()} / mo`,
          `$${(singleMo * 12).toLocaleString()} / yr`,
          'Covers rent, utilities, groceries, dining, local transport & healthcare',
        ],
        [
          'Full Monthly Living Budget (Retired Couple)',
          `$${coupleMo.toLocaleString()} / mo`,
          `$${(coupleMo * 12).toLocaleString()} / yr`,
          'Shared 1-2 bedroom apartment and combined household expenses',
        ],
        [
          'Apartment Rent (1-Bed City Center)',
          `$${col.rent1BedCenterUSD.toLocaleString()} / mo`,
          `$${(col.rent1BedCenterUSD * 12).toLocaleString()} / yr`,
          'Prime walkable expat neighborhood or coastal town center',
        ],
        [
          'Apartment Rent (1-Bed Outside Center)',
          `$${col.rent1BedOutsideUSD.toLocaleString()} / mo`,
          `$${(col.rent1BedOutsideUSD * 12).toLocaleString()} / yr`,
          'Residential suburb or quieter provincial town',
        ],
        [
          'Utilities (Electricity, Cooling/Heating, Fiber)',
          `$${col.utilitiesMonthlyUSD.toLocaleString()} / mo`,
          `$${(col.utilitiesMonthlyUSD * 12).toLocaleString()} / yr`,
          'Standard 85m2 apartment + high-speed internet & mobile',
        ],
        [
          'Private Health Insurance / Medical Provision',
          `$${col.healthcareMonthlyUSD.toLocaleString()} / mo`,
          `$${(col.healthcareMonthlyUSD * 12).toLocaleString()} / yr`,
          `Healthcare Quality Score: ${country.lifestyle.healthcareScore}/100`,
        ],
        [
          'Local Dining (Inexpensive Restaurant Meal)',
          `$${col.mealInexpensiveUSD.toFixed(2)} / meal`,
          `~$${Math.round(col.mealInexpensiveUSD * 104).toLocaleString()} / yr (2x/wk)`,
          `Groceries Index: ${col.groceriesIndex}/100 (vs. NYC baseline 100)`,
        ],
      ],
      theme: 'striped',
      headStyles: { fillColor: SAFFRON, textColor: [255, 255, 255], fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 62, fontStyle: 'bold' },
        1: { cellWidth: 32 },
        2: { cellWidth: 34 },
        3: { cellWidth: contentWidth - 128 },
      },
      bodyStyles: { fontSize: 8 },
    });

    currentY = (doc as any).lastAutoTable.finalY + 4;

    // Lifestyle Tiers & 4% FIRE Portfolio Matrix
    const leanSingle = Math.round(singleMo * 0.8);
    const luxSingle = Math.round(singleMo * 1.45);
    const leanCouple = Math.round(coupleMo * 0.8);
    const luxCouple = Math.round(coupleMo * 1.45);

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [[
        'Lifestyle Tier',
        'Single Monthly / Annual',
        'Single 4% FIRE Nest Egg',
        'Couple Monthly / Annual',
        'Couple 4% FIRE Nest Egg',
      ]],
      body: [
        [
          'Modest / Lean Expat (0.8x)',
          `$${leanSingle.toLocaleString()}/mo  ($${(leanSingle * 12).toLocaleString()}/yr)`,
          `$${(leanSingle * 12 * 25).toLocaleString()}`,
          `$${leanCouple.toLocaleString()}/mo  ($${(leanCouple * 12).toLocaleString()}/yr)`,
          `$${(leanCouple * 12 * 25).toLocaleString()}`,
        ],
        [
          'Comfortable Expat Standard (1.0x)',
          `$${singleMo.toLocaleString()}/mo  ($${(singleMo * 12).toLocaleString()}/yr)`,
          `$${(singleMo * 12 * 25).toLocaleString()}`,
          `$${coupleMo.toLocaleString()}/mo  ($${(coupleMo * 12).toLocaleString()}/yr)`,
          `$${(coupleMo * 12 * 25).toLocaleString()}`,
        ],
        [
          'Luxury / Fat FIRE Lifestyle (1.45x)',
          `$${luxSingle.toLocaleString()}/mo  ($${(luxSingle * 12).toLocaleString()}/yr)`,
          `$${(luxSingle * 12 * 25).toLocaleString()}`,
          `$${luxCouple.toLocaleString()}/mo  ($${(luxCouple * 12).toLocaleString()}/yr)`,
          `$${(luxCouple * 12 * 25).toLocaleString()}`,
        ],
      ],
      theme: 'grid',
      headStyles: { fillColor: NAVY, textColor: [255, 255, 255], fontSize: 8 },
      columnStyles: {
        0: { fontStyle: 'bold' },
      },
      bodyStyles: { fontSize: 8 },
    });

    currentY = (doc as any).lastAutoTable.finalY + 4;
  }

  // =========================================================================
  // SECTION 6: CLIMATE, HEALTHCARE & TOP EXPAT TOWNS
  // =========================================================================
  if (options.includeClimateAndTowns) {
    drawSectionHeader(
      String(sectionCounter++),
      'Healthcare, Climate & Premier Expat Towns',
      `Medical infrastructure, seasonal meteorology, and top retirement hubs across ${country.name}`
    );

    // Healthcare & Climate Summary Table
    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [['Dimension', 'Empirical Rating & Metrics', 'Detailed Assessment']],
      body: [
        [
          'Healthcare System & Quality',
          `Score: ${country.lifestyle.healthcareScore}/100\nPrivate: ~$${country.costOfLiving.healthcareMonthlyUSD}/mo`,
          sanitizePdfText(`${country.lifestyle.healthcareSummary} Public Access: ${country.lifestyle.publicHealthcareAccess}`),
        ],
        [
          'Safety, Walkability & Community',
          `Safety: ${country.lifestyle.safetyScore}/100 | Walkability: ${country.lifestyle.walkabilityScore}/100`,
          sanitizePdfText(`English Proficiency: ${country.lifestyle.englishProficiency}. Expat Community: ${country.lifestyle.expatCommunitySize}`),
        ],
        [
          'Climate & Sunshine Profile',
          `${country.climate.category}\n${country.climate.annualSunnyDays} sunny days/yr | Avg ${country.climate.averageTempC}C (${Math.round((country.climate.averageTempC * 9) / 5 + 32)}F)`,
          sanitizePdfText(`Relative Humidity: ${country.climate.humidityPercent}%. Best Months: ${country.climate.bestMonths}. Wet/Rainy Season: ${country.climate.rainyMonths}.`),
        ],
      ],
      theme: 'grid',
      headStyles: { fillColor: PURPLE, textColor: [255, 255, 255], fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 42, fontStyle: 'bold', fillColor: PURPLE_LIGHT },
        1: { cellWidth: 45, fontStyle: 'bold' },
        2: { cellWidth: contentWidth - 87 },
      },
      bodyStyles: { fontSize: 8 },
    });

    currentY = (doc as any).lastAutoTable.finalY + 4;

    // Top Expat Cities Table
    const citiesBody = country.topCities.map(city => [
      sanitizePdfText(city.name),
      `$${city.monthlyCostUSD.toLocaleString()} USD / mo`,
      sanitizePdfText(city.vibe),
      sanitizePdfText(city.highlight),
    ]);

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [['Top Expat Town / Hub', 'Est. Single Budget', 'Local Vibe & Character', 'Key Retiree Highlights']],
      body: citiesBody,
      theme: 'striped',
      headStyles: { fillColor: SAFFRON, textColor: [255, 255, 255], fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 36, fontStyle: 'bold' },
        1: { cellWidth: 32, fontStyle: 'bold', textColor: SAFFRON },
        2: { cellWidth: 44 },
        3: { cellWidth: contentWidth - 112 },
      },
      bodyStyles: { fontSize: 8 },
    });

    currentY = (doc as any).lastAutoTable.finalY + 4;
  }

  // =========================================================================
  // SECTION 7: DEMOGRAPHICS, SOCIAL ATMOSPHERE & NIGHTLIFE
  // =========================================================================
  if (options.includeDemographicsAndLifestyle) {
    drawSectionHeader(
      String(sectionCounter++),
      'Demographics, Social Culture & Lifestyle',
      `Population statistics, gender ratios, dating culture, and social integration in ${country.name}`
    );

    const demo = country.demographics;
    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [['Median National Age', 'Females per 100 Males', 'Youth Population (<30)', 'Dating Openness Rating']],
      body: [[
        `${demo.medianAge} years`,
        `${demo.femalesPer100Males.toFixed(1)} F : 100 M (${(demo.femalesPer100Males / 100).toFixed(2)}:1)`,
        `${demo.youngPopulationPercent}% under age 30`,
        `${demo.datingRating} / 5`,
      ]],
      theme: 'grid',
      headStyles: { fillColor: NAVY, textColor: [255, 255, 255], fontSize: 8, halign: 'center' },
      bodyStyles: { fontSize: 8.5, fontStyle: 'bold', halign: 'center' },
    });

    currentY = (doc as any).lastAutoTable.finalY + 3;

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
        0: { cellWidth: 48, fontStyle: 'bold', fillColor: [248, 250, 252] },
        1: { cellWidth: contentWidth - 48 },
      },
      bodyStyles: { fontSize: 8 },
    });

    currentY = (doc as any).lastAutoTable.finalY + 4;
  }

  // =========================================================================
  // SECTION 8: PRE-RETIREMENT HURDLES & RELOCATION FAQ KNOWLEDGE BASE
  // =========================================================================
  if (options.includeRelocationFaqs) {
    const faqs = getFaqsForCountry(country);
    drawSectionHeader(
      String(sectionCounter++),
      'Pre-Retirement Hurdles & Relocation Knowledge Base',
      `Actionable guidance on banking, 183-day tax rules, language bureaucracy, healthcare, and leases in ${country.name}`
    );

    faqs.forEach((faq, idx) => {
      const faqRows = [
        [
          `Q${idx + 1}: ${sanitizePdfText(faq.question)}`,
          `Category: ${sanitizePdfText(faq.categoryLabel)} | Hurdle: ${faq.hurdleSeverity} | Timeline: ${sanitizePdfText(faq.estimatedResolutionTime)}`,
        ],
        ['Executive Summary', sanitizePdfText(faq.shortSummary)],
        ['Detailed Guidance', sanitizePdfText(faq.detailedAnswer)],
        [
          'Actionable Step-by-Step Checklist',
          sanitizePdfText(faq.actionableChecklist.map((step, sIdx) => `${sIdx + 1}. ${step}`).join('   |   ')),
        ],
        ['Key Agencies & Forms', sanitizePdfText(faq.keyAgenciesOrForms.join(', '))],
      ];

      autoTable(doc, {
        startY: currentY,
        margin: { left: margin, right: margin },
        body: faqRows,
        theme: 'grid',
        columnStyles: {
          0: { cellWidth: 48, fontStyle: 'bold', fillColor: ORANGE_LIGHT, textColor: SLATE_900 },
          1: { cellWidth: contentWidth - 48 },
        },
        bodyStyles: { fontSize: 7.8, cellPadding: 2 },
        didParseCell: data => {
          if (data.row.index === 0) {
            data.cell.styles.fillColor = SLATE_900;
            data.cell.styles.textColor = [255, 255, 255];
            data.cell.styles.fontStyle = 'bold';
          }
        },
      });

      currentY = (doc as any).lastAutoTable.finalY + 3.5;
    });
  }

  // =========================================================================
  // SECTION 9: COMMUNITY INSIGHTS, LOCAL EXPAT CONTACTS & MEETUPS
  // =========================================================================
  if (options.includeCommunityAndMeetups) {
    drawSectionHeader(
      String(sectionCounter++),
      'Community Discussions, Local Contacts & Expat Meetups',
      `Resident expat contacts, scheduled social gatherings, and forum discussions for ${country.name}`
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
        '4 years living locally',
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
        '2 years living locally',
        `Advises on daily living expenses, language learning, and expat social groups in ${country.name}.`,
      ],
    ];

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [['Resident Expat Contact', 'City / Hub', 'Tenure', 'Focus Areas & Guidance']],
      body: localExpats.map(r => r.map(c => sanitizePdfText(c))),
      theme: 'grid',
      headStyles: { fillColor: SAFFRON, textColor: [255, 255, 255], fontSize: 8 },
      bodyStyles: { fontSize: 8 },
    });

    currentY = (doc as any).lastAutoTable.finalY + 4;

    if (meetups.length > 0) {
      autoTable(doc, {
        startY: currentY,
        margin: { left: margin, right: margin },
        head: [['Upcoming Expat Meetup', 'City & Venue', 'Date & Time', 'Host & Attendance']],
        body: meetups.map(m => [
          sanitizePdfText(`${m.title} (${m.category})`),
          sanitizePdfText(`${m.city} - ${m.location}`),
          sanitizePdfText(`${m.date} at ${m.time}`),
          sanitizePdfText(`${m.hostName} (${m.attendeesCount} attending)`),
        ]),
        theme: 'striped',
        headStyles: { fillColor: PURPLE, textColor: [255, 255, 255], fontSize: 8 },
        bodyStyles: { fontSize: 8 },
      });

      currentY = (doc as any).lastAutoTable.finalY + 4;
    }

    if (threads.length > 0) {
      autoTable(doc, {
        startY: currentY,
        margin: { left: margin, right: margin },
        head: [['Community Discussion Thread', 'Category & Author', 'Upvotes', 'Key Discussion & Replies']],
        body: threads.map(t => [
          sanitizePdfText(t.title),
          sanitizePdfText(`${t.category}\nBy ${t.authorName} (${t.authorLocation})`),
          `${t.upvotes}`,
          sanitizePdfText(
            `${t.content}${
              t.comments.length > 0
                ? `\nTop Reply (${t.comments[0].authorName}): "${t.comments[0].text}"`
                : ''
            }`
          ),
        ]),
        theme: 'grid',
        headStyles: { fillColor: NAVY, textColor: [255, 255, 255], fontSize: 8 },
        columnStyles: {
          0: { cellWidth: 42, fontStyle: 'bold' },
          1: { cellWidth: 34 },
          2: { cellWidth: 16, halign: 'center' },
          3: { cellWidth: contentWidth - 92 },
        },
        bodyStyles: { fontSize: 7.8 },
      });

      currentY = (doc as any).lastAutoTable.finalY + 4;
    }
  }

  // =========================================================================
  // RUNNING HEADERS & FOOTERS ON ALL PAGES
  // =========================================================================
  const totalPages = doc.getNumberOfPages();
  const dateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);

    if (p > 1) {
      // Top running header on subsequent pages
      doc.setFillColor(...SAFFRON);
      doc.rect(0, 0, pageWidth / 3, 2.5, 'F');
      doc.setFillColor(245, 158, 11);
      doc.rect(pageWidth / 3, 0, pageWidth / 3, 2.5, 'F');
      doc.setFillColor(...PURPLE);
      doc.rect((pageWidth / 3) * 2, 0, pageWidth / 3, 2.5, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(...SLATE_600);
      doc.text(
        sanitizePdfText(`ReFirely Global Retirement Atlas  |  ${country.name} Complete Country Dossier`),
        margin,
        10
      );
      doc.setFont('helvetica', 'normal');
      doc.text(
        sanitizePdfText(`${country.region}  |  Visa: ${country.visa.retirementVisaName}`),
        pageWidth - margin,
        10,
        { align: 'right' }
      );

      doc.setDrawColor(...SLATE_200);
      doc.line(margin, 12.5, pageWidth - margin, 12.5);
    }

    // Footer line & text on every page
    doc.setDrawColor(...SLATE_200);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...SLATE_600);
    doc.text(
      sanitizePdfText(`Generated by ReFirely on ${dateStr}  |  Empirical Relocation & FIRE Dossier`),
      margin,
      pageHeight - 7.5
    );

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...SAFFRON);
    doc.text(`Page ${p} of ${totalPages}`, pageWidth - margin, pageHeight - 7.5, {
      align: 'right',
    });
  }

  const safeSlug = country.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  doc.save(`ReFirely-${safeSlug}-Complete-Retirement-Dossier.pdf`);
}
