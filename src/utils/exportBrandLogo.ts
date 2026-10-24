export type BrandAssetVariant =
  | 'horizontal-dotcom-transparent'
  | 'horizontal-dotcom-dark'
  | 'horizontal-dotcom-white'
  | 'horizontal-transparent'
  | 'horizontal-dark'
  | 'horizontal-white'
  | 'square-emblem'
  | 'social-promo-banner';

export interface BrandAssetConfig {
  id: BrandAssetVariant;
  title: string;
  subtitle: string;
  dimensionsLabel: string;
  width: number;
  height: number;
  filenameBase: string;
  badgeText: string;
  previewBgClass: string;
  hasDotCom: boolean;
}

export const BRAND_ASSET_CONFIGS: BrandAssetConfig[] = [
  {
    id: 'horizontal-dotcom-transparent',
    title: '4K Full Logo with .com — ReFIREly.com (Transparent)',
    subtitle:
      'Ultra-crisp transparent 4K PNG & SVG featuring the authentic Flight & Flight-Path emblem and ReFIREly.com with a smaller .com.',
    dimensionsLabel: '4096 × 1400 px · 4K Ultra HD',
    width: 4096,
    height: 1400,
    filenameBase: 'ReFIREly.com-Logo-4K-Transparent',
    badgeText: 'ReFIREly.com · Primary Transparent',
    previewBgClass:
      'bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] bg-slate-50/90',
    hasDotCom: true,
  },
  {
    id: 'horizontal-dotcom-dark',
    title: '4K Full Logo with .com — ReFIREly.com (Midnight Dark)',
    subtitle:
      'Luminous multi-colored Flight, Flame & Palm emblem with ReFIREly.com (smaller .com) on a deep obsidian-indigo backdrop.',
    dimensionsLabel: '4096 × 1400 px · 4K Ultra HD',
    width: 4096,
    height: 1400,
    filenameBase: 'ReFIREly.com-Logo-4K-Dark-Edition',
    badgeText: 'ReFIREly.com · Dark Mode & Video',
    previewBgClass: 'bg-slate-950',
    hasDotCom: true,
  },
  {
    id: 'horizontal-dotcom-white',
    title: '4K Full Logo with .com — ReFIREly.com (Studio White)',
    subtitle:
      'Solid studio-white card with ReFIREly.com (smaller .com) and the classic navy/multi-color flight-path emblem for print & press.',
    dimensionsLabel: '4096 × 1400 px · 4K Ultra HD',
    width: 4096,
    height: 1400,
    filenameBase: 'ReFIREly.com-Logo-4K-White-Card',
    badgeText: 'ReFIREly.com · Print & Press Ready',
    previewBgClass: 'bg-white',
    hasDotCom: true,
  },
  {
    id: 'horizontal-transparent',
    title: '4K Full Horizontal Logo — ReFIREly (Transparent)',
    subtitle:
      'Flagship 4K transparent PNG & vector SVG without .com, featuring the accurate passenger flight & curved arrow flight path.',
    dimensionsLabel: '4096 × 1400 px · 4K Ultra HD',
    width: 4096,
    height: 1400,
    filenameBase: 'ReFIREly-Logo-4K-Transparent',
    badgeText: 'Standard Wordmark · Transparent',
    previewBgClass:
      'bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] bg-slate-50/90',
    hasDotCom: false,
  },
  {
    id: 'horizontal-dark',
    title: '4K Full Horizontal Logo — ReFIREly (Midnight Dark)',
    subtitle:
      'Luminous multi-colored emblem and ReFIREly wordmark on a deep obsidian-indigo backdrop for dark headers and videos.',
    dimensionsLabel: '4096 × 1400 px · 4K Ultra HD',
    width: 4096,
    height: 1400,
    filenameBase: 'ReFIREly-Logo-4K-Dark-Edition',
    badgeText: 'Standard Wordmark · Dark Mode',
    previewBgClass: 'bg-slate-950',
    hasDotCom: false,
  },
  {
    id: 'horizontal-white',
    title: '4K Full Horizontal Logo — ReFIREly (Studio White)',
    subtitle:
      'Solid studio-white background for documents, PDFs, sponsorships, and platforms that do not support alpha transparency.',
    dimensionsLabel: '4096 × 1400 px · 4K Ultra HD',
    width: 4096,
    height: 1400,
    filenameBase: 'ReFIREly-Logo-4K-White-Card',
    badgeText: 'Standard Wordmark · Print Ready',
    previewBgClass: 'bg-white',
    hasDotCom: false,
  },
  {
    id: 'square-emblem',
    title: '2K Square Flight, Flame & Palm Emblem Icon',
    subtitle:
      'High-resolution 1:1 emblem icon accurately depicting the FIRE flame, 5-leaflet palm frond, curved globe flight-path arrow, and ascending passenger jet.',
    dimensionsLabel: '2048 × 2048 px · 2K Square',
    width: 2048,
    height: 2048,
    filenameBase: 'ReFIREly-Emblem-Icon-2K',
    badgeText: 'Social Avatar 1:1',
    previewBgClass: 'bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900',
    hasDotCom: false,
  },
  {
    id: 'social-promo-banner',
    title: 'High-Res ReFIREly.com Social & OpenGraph Promo Banner',
    subtitle:
      'Ready-to-share promotional card featuring the accurate Flight & Flight-Path emblem, ReFIREly.com wordmark with smaller .com, and tagline.',
    dimensionsLabel: '2400 × 1260 px · Social / Press Card',
    width: 2400,
    height: 1260,
    filenameBase: 'ReFIREly.com-Promo-Banner-HighRes',
    badgeText: 'ReFIREly.com · Marketing Banner',
    previewBgClass: 'bg-slate-900',
    hasDotCom: true,
  },
];

/**
 * Returns the reusable, high-precision SVG defs and geometry for the ReFIREly Emblem
 * in a canonical 200x200 coordinate space.
 *
 * Faithfully represents all 4 signature elements from the original ReFIREly mark:
 * 1. Three-tongued FIRE Flame with internal S-curve split and lower-left flame wisp.
 * 2. Arching 5-leaflet tropical palm frond sweeping up and right.
 * 3. Curved globe cradle with latitude/meridian ribs and a sweeping flight-path swoosh ending in a sharp directional arrowhead.
 * 4. Unmistakable commercial passenger jet airplane (fuselage nose, swept wings, wing engines, and rear tail stabilizers) ascending ahead of the flight-path arrow.
 */
function buildEmblemSvgParts(prefix: string, theme: 'dark-badge' | 'light-clean'): {
  defs: string;
  mark: string;
} {
  const flightColorStart = theme === 'dark-badge' ? '#38bdf8' : '#1e3a5f';
  const flightColorMid = theme === 'dark-badge' ? '#818cf8' : '#1e40af';
  const flightColorEnd = theme === 'dark-badge' ? '#c084fc' : '#0f172a';
  const jetFill = theme === 'dark-badge' ? '#ffffff' : '#16263f';
  const jetAccent = theme === 'dark-badge' ? '#38bdf8' : '#2563eb';

  const defs = `
    <linearGradient id="${prefix}-flame-left" x1="34" y1="146" x2="96" y2="20" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#d92b27"/>
      <stop offset="52%" stop-color="#f15a24"/>
      <stop offset="100%" stop-color="#f7931e"/>
    </linearGradient>
    <linearGradient id="${prefix}-flame-right" x1="62" y1="146" x2="114" y2="24" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#ea580c"/>
      <stop offset="55%" stop-color="#f97316"/>
      <stop offset="100%" stop-color="#facc15"/>
    </linearGradient>
    <linearGradient id="${prefix}-palm" x1="72" y1="154" x2="166" y2="46" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#3f6212"/>
      <stop offset="48%" stop-color="#65a30d"/>
      <stop offset="100%" stop-color="#14b8a6"/>
    </linearGradient>
    <linearGradient id="${prefix}-flight-path" x1="24" y1="136" x2="160" y2="128" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="${flightColorStart}"/>
      <stop offset="55%" stop-color="${flightColorMid}"/>
      <stop offset="100%" stop-color="${flightColorEnd}"/>
    </linearGradient>
  `;

  const mark = `
    <!-- 1. FIRE FLAME (3 distinct tongues + S-curve split + lower-left wisp) -->
    <!-- Left & Center Flame Body -->
    <path d="M 70 146 C 40 130 32 98 48 66 C 50 76 55 82 59 77 C 56 58 64 44 74 36 C 73 48 77 56 81 60 C 83 42 91 27 100 18 C 91 48 64 76 58 112 C 55 126 61 138 70 146 Z" fill="url(#${prefix}-flame-left)"/>
    <!-- Right S-Curve Flame Tongue -->
    <path d="M 75 146 C 63 116 69 84 94 56 C 102 46 106 34 105 22 C 118 42 117 74 100 102 C 89 120 80 132 75 146 Z" fill="url(#${prefix}-flame-right)"/>
    <!-- Lower-Left Flame Wisp -->
    <path d="M 39 138 C 28 128 27 111 36 98 C 35 113 40 125 49 134 C 45 138 42 139 39 138 Z" fill="url(#${prefix}-flame-left)"/>

    <!-- 2. TROPICAL PALM FROND (Smooth overarching spine + 5 distinct right leaflets) -->
    <path d="M 72 154 C 76 110 104 66 164 46 C 153 55 141 61 126 64 L 168 62 C 155 72 141 78 121 80 L 162 80 C 147 90 133 95 113 96 L 150 98 C 135 107 121 110 103 110 L 136 115 C 121 123 107 125 93 123 C 85 134 80 144 78 154 Z" fill="url(#${prefix}-palm)"/>
    <!-- Subtle Spine Highlight -->
    <path d="M 74 152 C 79 112 105 70 160 48" stroke="#fef08a" stroke-opacity="0.35" stroke-width="2.2" stroke-linecap="round" fill="none"/>

    <!-- 3. GLOBE CRADLE & CURVED FLIGHT-PATH ARROW -->
    <!-- Lower Globe Rim & Latitude/Meridian Ribs -->
    <path d="M 46 155 C 76 183 118 181 146 153" stroke="url(#${prefix}-flight-path)" stroke-width="5.5" stroke-linecap="round" fill="none"/>
    <path d="M 62 166 C 86 176 112 175 134 160" stroke="url(#${prefix}-flight-path)" stroke-width="3.2" stroke-linecap="round" stroke-opacity="0.85" fill="none"/>
    <!-- Globe Meridian Struts -->
    <path d="M 68 156 L 62 166 M 91 161 L 89 175 M 114 157 L 117 171 M 132 148 L 138 159" stroke="url(#${prefix}-flight-path)" stroke-width="3.8" stroke-linecap="round"/>

    <!-- Sweeping Flight-Path Swoosh with Sharp Directional Arrowhead -->
    <path d="M 22 130 C 48 160 100 163 135 139 L 128 130 L 153 131 L 143 152 L 139 144 C 102 172 46 168 22 130 Z" fill="url(#${prefix}-flight-path)"/>

    <!-- Subtle Jet Contrail Dotted Link from Arrowhead to Airplane Tail -->
    <path d="M 149 128 L 154 123" stroke="${jetAccent}" stroke-width="3" stroke-linecap="round" stroke-dasharray="2 4"/>

    <!-- 4. THE FLIGHT — COMMERCIAL PASSENGER JET AIRPLANE -->
    <g transform="translate(168, 111) rotate(-38)">
      <!-- Main Passenger Jet Fuselage, Swept Wings & Swept Tail Stabilizers -->
      <path d="
        M 25 0
        C 25 -3.0 18.5 -4.0 11 -4.0
        L 5.5 -4.0
        L -6 -24
        L -11 -24
        L -3.5 -3.8
        L -14.5 -2.7
        L -21.5 -11
        L -24.5 -11
        L -20 -1.5
        L -22.5 0
        L -20 1.5
        L -24.5 11
        L -21.5 11
        L -14.5 2.7
        L -3.5 3.8
        L -11 24
        L -6 24
        L 5.5 4.0
        L 11 4.0
        C 18.5 4.0 25 3.0 25 0
        Z"
        fill="${jetFill}"
      />
      <!-- Twin Under-Wing Jet Engine Pods -->
      <path d="M 1.5 -11.2 L 7 -11.2 C 8.2 -11.2 8.2 -8.2 7 -8.2 L 0.5 -8.2 Z" fill="${jetFill}"/>
      <path d="M 1.5 11.2 L 7 11.2 C 8.2 11.2 8.2 8.2 7 8.2 L 0.5 8.2 Z" fill="${jetFill}"/>
      <!-- Cockpit Window Accent -->
      <path d="M 17 -1.8 C 19.5 -1.4 21 -0.8 21.5 0 C 21 0.8 19.5 1.4 17 1.8 C 17.8 0.6 17.8 -0.6 17 -1.8 Z" fill="${jetAccent}"/>
    </g>
  `;

  return { defs, mark };
}

/**
 * Generates a self-contained, high-precision SVG string for any BrandAssetVariant.
 * Uses standard system/geometric sans-serif font stacks so HTML5 Canvas rasterization
 * works cleanly without external webfont CORS tainting.
 */
export function generateBrandSvgString(variant: BrandAssetVariant): string {
  if (variant === 'square-emblem') {
    const { defs: emblemDefs, mark: emblemMark } = buildEmblemSvgParts('sq', 'dark-badge');
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="2048" height="2048" fill="none">
  <defs>
    <linearGradient id="sq-bg" x1="0" y1="0" x2="1024" y2="1024" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="50%" stop-color="#1e1b4b"/>
      <stop offset="100%" stop-color="#042f2e"/>
    </linearGradient>
    <radialGradient id="sq-glow-1" cx="28%" cy="24%" r="58%">
      <stop offset="0%" stop-color="#f97316" stop-opacity="0.26"/>
      <stop offset="100%" stop-color="#f97316" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="sq-glow-2" cx="76%" cy="74%" r="58%">
      <stop offset="0%" stop-color="#14b8a6" stop-opacity="0.30"/>
      <stop offset="100%" stop-color="#14b8a6" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="sq-ring" x1="64" y1="64" x2="960" y2="960" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#14b8a6"/>
      <stop offset="35%" stop-color="#6366f1"/>
      <stop offset="70%" stop-color="#d946ef"/>
      <stop offset="100%" stop-color="#f59e0b"/>
    </linearGradient>
    ${emblemDefs}
  </defs>

  <!-- Rounded Squircle Base -->
  <rect x="32" y="32" width="960" height="960" rx="224" fill="url(#sq-bg)"/>
  <rect x="32" y="32" width="960" height="960" rx="224" fill="url(#sq-glow-1)"/>
  <rect x="32" y="32" width="960" height="960" rx="224" fill="url(#sq-glow-2)"/>
  <rect x="44" y="44" width="936" height="936" rx="212" stroke="url(#sq-ring)" stroke-width="16" stroke-opacity="0.92"/>

  <!-- Subtle Global Navigation Compass Ring -->
  <circle cx="512" cy="512" r="370" stroke="#ffffff" stroke-opacity="0.07" stroke-width="4" stroke-dasharray="14 14"/>

  <!-- Authentic ReFIREly Emblem Scaled to 1024x1024 Canvas -->
  <g transform="translate(62, 62) scale(4.5)">
    ${emblemMark}
  </g>
</svg>`;
  }

  if (variant === 'social-promo-banner') {
    const { defs: emblemDefs, mark: emblemMark } = buildEmblemSvgParts('sp', 'dark-badge');
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2400 1260" width="2400" height="1260" fill="none">
  <defs>
    <linearGradient id="sp-bg" x1="0" y1="0" x2="2400" y2="1260" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#090d16"/>
      <stop offset="45%" stop-color="#17153b"/>
      <stop offset="100%" stop-color="#042f2e"/>
    </linearGradient>
    <radialGradient id="sp-orb1" cx="18%" cy="25%" r="50%">
      <stop offset="0%" stop-color="#f97316" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#f97316" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="sp-orb2" cx="85%" cy="75%" r="55%">
      <stop offset="0%" stop-color="#14b8a6" stop-opacity="0.28"/>
      <stop offset="100%" stop-color="#14b8a6" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="sp-orb3" cx="55%" cy="15%" r="45%">
      <stop offset="0%" stop-color="#6366f1" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#6366f1" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="sp-ribbon" x1="0" y1="0" x2="2400" y2="0" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#14b8a6"/>
      <stop offset="35%" stop-color="#6366f1"/>
      <stop offset="70%" stop-color="#d946ef"/>
      <stop offset="100%" stop-color="#f59e0b"/>
    </linearGradient>
    <linearGradient id="sp-fire-grad" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#fb7185"/>
      <stop offset="50%" stop-color="#fb923c"/>
      <stop offset="100%" stop-color="#facc15"/>
    </linearGradient>
    <linearGradient id="sp-ly-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2dd4bf"/>
      <stop offset="55%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#818cf8"/>
    </linearGradient>
    ${emblemDefs}
  </defs>

  <!-- Background Canvas -->
  <rect width="2400" height="1260" fill="url(#sp-bg)"/>
  <rect width="2400" height="1260" fill="url(#sp-orb1)"/>
  <rect width="2400" height="1260" fill="url(#sp-orb2)"/>
  <rect width="2400" height="1260" fill="url(#sp-orb3)"/>

  <!-- Top & Bottom Multi-Color Accent Bars -->
  <rect x="0" y="0" width="2400" height="16" fill="url(#sp-ribbon)"/>
  <rect x="0" y="1244" width="2400" height="16" fill="url(#sp-ribbon)"/>

  <!-- Subtle Inner Frame -->
  <rect x="64" y="64" width="2272" height="1132" rx="44" stroke="#ffffff" stroke-opacity="0.1" stroke-width="3"/>

  <!-- Left Emblem Icon (Scaled & Positioned) -->
  <g transform="translate(150, 220) scale(0.78)">
    <rect x="32" y="32" width="960" height="960" rx="224" fill="#0f172a" fill-opacity="0.88"/>
    <rect x="44" y="44" width="936" height="936" rx="212" stroke="url(#sp-ribbon)" stroke-width="18"/>
    <circle cx="512" cy="512" r="365" stroke="#ffffff" stroke-opacity="0.08" stroke-width="4" stroke-dasharray="14 14"/>
    <g transform="translate(62, 62) scale(4.5)">
      ${emblemMark}
    </g>
  </g>

  <!-- Right Wordmark & Promotional Copy -->
  <g transform="translate(1000, 0)">
    <!-- Kicker Pill -->
    <rect x="0" y="250" width="680" height="58" rx="29" fill="#ffffff" fill-opacity="0.08" stroke="#2dd4bf" stroke-opacity="0.4" stroke-width="2"/>
    <text x="36" y="288" fill="#5eead4" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="25" font-weight="800" letter-spacing="4">GLOBAL RETIREMENT &amp; FIRE INTELLIGENCE</text>

    <!-- Main ReFIREly.com Wordmark (with smaller .com) -->
    <text x="0" y="535" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-weight="900" letter-spacing="-6">
      <tspan fill="#ffffff" font-size="220">Re</tspan><tspan fill="url(#sp-fire-grad)" font-size="220">FIRE</tspan><tspan fill="url(#sp-ly-grad)" font-size="220">ly</tspan><tspan fill="#94a3b8" font-size="88" font-weight="800" letter-spacing="-1">.com</tspan>
    </text>

    <!-- Multi-Colored Accent Bar -->
    <rect x="6" y="585" width="1220" height="12" rx="6" fill="url(#sp-ribbon)"/>

    <!-- Tagline -->
    <text x="6" y="670" fill="#e2e8f0" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="43" font-weight="800" letter-spacing="4.5">
      WHERE YOUR FREEDOM GOES FURTHER
    </text>

    <!-- Feature Highlights -->
    <text x="6" y="765" fill="#94a3b8" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="34" font-weight="500">
      Empirical Cost-of-Living Dossiers · Sovereign Visa Pathways · Expat Community
    </text>

    <!-- Bottom Domain Callout Badge -->
    <rect x="6" y="850" width="490" height="88" rx="24" fill="url(#sp-ribbon)"/>
    <text x="251" y="907" text-anchor="middle" fill="#ffffff" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="40" font-weight="900" letter-spacing="2">
      ReFIREly.com
    </text>
  </g>
</svg>`;
  }

  // Horizontal Full Logo variants (with or without .com)
  const isDark =
    variant === 'horizontal-dark' || variant === 'horizontal-dotcom-dark';
  const isWhiteCard =
    variant === 'horizontal-white' || variant === 'horizontal-dotcom-white';
  const includeDotCom =
    variant === 'horizontal-dotcom-transparent' ||
    variant === 'horizontal-dotcom-dark' ||
    variant === 'horizontal-dotcom-white';

  const reColor = isDark ? '#ffffff' : '#16263f';
  const dotComColor = isDark ? '#94a3b8' : '#475569';
  const taglineColor = isDark ? '#cbd5e1' : '#334155';

  // Use clean direct emblem (no dark box) on transparent/white variants so it looks just like the classic logo in 4K,
  // and use the luminous dark badge container on dark variants (plus a subtle halo on light variants).
  const emblemTheme = isDark ? 'dark-badge' : 'light-clean';
  const { defs: emblemDefs, mark: emblemMark } = buildEmblemSvgParts(
    'hz',
    emblemTheme
  );

  const mainFontSize = includeDotCom ? 228 : 248;
  const dotComFontSize = 92; // Noticeably smaller .com (~40% of main wordmark)

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2048 700" width="4096" height="1400" fill="none">
  <defs>
    <linearGradient id="hz-dark-bg" x1="0" y1="0" x2="2048" y2="700" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#090d16"/>
      <stop offset="50%" stop-color="#17153b"/>
      <stop offset="100%" stop-color="#042f2e"/>
    </linearGradient>
    <linearGradient id="hz-emblem-bg" x1="0" y1="0" x2="600" y2="600" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="50%" stop-color="#1e1b4b"/>
      <stop offset="100%" stop-color="#042f2e"/>
    </linearGradient>
    <linearGradient id="hz-ring" x1="0" y1="0" x2="600" y2="600" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#14b8a6"/>
      <stop offset="35%" stop-color="#6366f1"/>
      <stop offset="70%" stop-color="#d946ef"/>
      <stop offset="100%" stop-color="#f59e0b"/>
    </linearGradient>
    <linearGradient id="hz-fire-text" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#d92b27"/>
      <stop offset="52%" stop-color="#f15a24"/>
      <stop offset="100%" stop-color="#f7931e"/>
    </linearGradient>
    <linearGradient id="hz-ly-text" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4d7c2b"/>
      <stop offset="50%" stop-color="#0d9488"/>
      <stop offset="100%" stop-color="#0284c7"/>
    </linearGradient>
    <linearGradient id="hz-ribbon" x1="660" y1="0" x2="1980" y2="0" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#14b8a6"/>
      <stop offset="35%" stop-color="#6366f1"/>
      <stop offset="70%" stop-color="#d946ef"/>
      <stop offset="100%" stop-color="#f59e0b"/>
    </linearGradient>
    ${emblemDefs}
  </defs>

  ${isDark ? `<rect width="2048" height="700" rx="64" fill="url(#hz-dark-bg)"/>` : ''}
  ${isWhiteCard ? `<rect width="2048" height="700" rx="64" fill="#ffffff"/><rect x="8" y="8" width="2032" height="684" rx="56" stroke="#e2e8f0" stroke-width="4"/>` : ''}

  <!-- Left Authentic Flight, Flame, Palm & Globe Flight-Path Emblem -->
  ${
    isDark
      ? `<g transform="translate(72, 62) scale(0.93)">
          <rect x="24" y="24" width="568" height="568" rx="136" fill="url(#hz-emblem-bg)"/>
          <rect x="30" y="30" width="556" height="556" rx="130" stroke="url(#hz-ring)" stroke-width="12"/>
          <circle cx="308" cy="308" r="215" stroke="#ffffff" stroke-opacity="0.08" stroke-width="3" stroke-dasharray="10 10"/>
          <g transform="translate(36, 36) scale(2.72)">
            ${emblemMark}
          </g>
        </g>`
      : `<g transform="translate(56, 42) scale(3.05)">
          ${emblemMark}
        </g>`
  }

  <!-- Right Typographic Wordmark + Multi-Color Ribbon + Tagline -->
  <g transform="translate(675, 0)">
    <text x="0" y="382" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-weight="900" letter-spacing="-6">
      <tspan fill="${reColor}" font-size="${mainFontSize}">Re</tspan><tspan fill="url(#hz-fire-text)" font-size="${mainFontSize}">FIRE</tspan><tspan fill="url(#hz-ly-text)" font-size="${mainFontSize}">ly</tspan>${
        includeDotCom
          ? `<tspan fill="${dotComColor}" font-size="${dotComFontSize}" font-weight="800" letter-spacing="-1">.com</tspan>`
          : ''
      }
    </text>

    <!-- Multi-Colored Divider Ribbon -->
    <rect x="8" y="432" width="1285" height="14" rx="7" fill="url(#hz-ribbon)"/>

    <!-- Subtitle / Tagline -->
    <text x="12" y="518" fill="${taglineColor}" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="41" font-weight="800" letter-spacing="7.5">
      WHERE YOUR FREEDOM GOES FURTHER
    </text>
  </g>
</svg>`;
}

/**
 * Triggers a browser file download from a Blob or URL.
 */
function triggerBrowserDownload(url: string, filename: string, revokeAfter = true) {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  if (revokeAfter) {
    setTimeout(() => URL.revokeObjectURL(url), 3000);
  }
}

/**
 * Downloads the selected brand asset as a lossless Vector SVG file (.svg).
 */
export function downloadBrandSvg(variant: BrandAssetVariant): void {
  const config =
    BRAND_ASSET_CONFIGS.find((c) => c.id === variant) || BRAND_ASSET_CONFIGS[0];
  const svgString = generateBrandSvgString(variant);
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  triggerBrowserDownload(url, `${config.filenameBase}.svg`, true);
}

/**
 * Rasterizes the selected brand asset at ultra-high resolution (up to 4096px)
 * onto an offscreen HTML5 Canvas and downloads a crisp PNG file (.png).
 */
export async function downloadBrandPng(
  variant: BrandAssetVariant,
  customScale = 1
): Promise<void> {
  const config =
    BRAND_ASSET_CONFIGS.find((c) => c.id === variant) || BRAND_ASSET_CONFIGS[0];
  const targetWidth = Math.round(config.width * customScale);
  const targetHeight = Math.round(config.height * customScale);

  const svgString = generateBrandSvgString(variant);
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const svgUrl = URL.createObjectURL(svgBlob);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(svgUrl);
          reject(new Error('Canvas 2D context unavailable'));
          return;
        }
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        URL.revokeObjectURL(svgUrl);

        canvas.toBlob(
          (pngBlob) => {
            if (!pngBlob) {
              reject(new Error('Failed to encode high-resolution PNG'));
              return;
            }
            const pngUrl = URL.createObjectURL(pngBlob);
            triggerBrowserDownload(
              pngUrl,
              `${config.filenameBase}-${targetWidth}x${targetHeight}.png`,
              true
            );
            resolve();
          },
          'image/png',
          1.0
        );
      } catch (err) {
        URL.revokeObjectURL(svgUrl);
        reject(err);
      }
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(svgUrl);
      reject(err);
    };
    img.src = svgUrl;
  });
}

/**
 * Downloads the original classic raster logo PNG bundled in /assets/aistudio/refirely-logo.png
 */
export function downloadOriginalClassicLogo(): void {
  triggerBrowserDownload(
    '/assets/aistudio/refirely-logo.png',
    'ReFIREly-Classic-Logo.png',
    false
  );
}
