export type BrandAssetVariant =
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
}

export const BRAND_ASSET_CONFIGS: BrandAssetConfig[] = [
  {
    id: 'horizontal-transparent',
    title: '4K Full Horizontal Logo (Transparent)',
    subtitle: 'Ultra-crisp transparent PNG & vector SVG for websites, press kits, merchandise, and video overlays.',
    dimensionsLabel: '4096 × 1400 px · 4K Ultra HD',
    width: 4096,
    height: 1400,
    filenameBase: 'ReFIREly-Logo-4K-Transparent',
    badgeText: 'Primary Brand Mark',
    previewBgClass: 'bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] bg-slate-50/80',
  },
  {
    id: 'horizontal-dark',
    title: '4K Full Horizontal Logo (Midnight Dark)',
    subtitle: 'Luminous multi-colored emblem and white/gradient wordmark on a deep obsidian-indigo backdrop.',
    dimensionsLabel: '4096 × 1400 px · 4K Ultra HD',
    width: 4096,
    height: 1400,
    filenameBase: 'ReFIREly-Logo-4K-Dark-Edition',
    badgeText: 'Dark Mode & Video',
    previewBgClass: 'bg-slate-950',
  },
  {
    id: 'square-emblem',
    title: '2K Square App & Social Profile Emblem',
    subtitle: 'High-resolution 1:1 emblem icon designed for LinkedIn, X/Twitter, Instagram, YouTube, and Discord avatars.',
    dimensionsLabel: '2048 × 2048 px · 2K Square',
    width: 2048,
    height: 2048,
    filenameBase: 'ReFIREly-Emblem-Icon-2K',
    badgeText: 'Social Avatar 1:1',
    previewBgClass: 'bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900',
  },
  {
    id: 'social-promo-banner',
    title: 'High-Res Social Promotion & OpenGraph Banner',
    subtitle: 'Ready-to-post promotional card featuring the ReFIREly brand mark, value proposition, and domain badge.',
    dimensionsLabel: '2400 × 1260 px · Social / Press Card',
    width: 2400,
    height: 1260,
    filenameBase: 'ReFIREly-Promo-Banner-HighRes',
    badgeText: 'Marketing & Social Share',
    previewBgClass: 'bg-slate-900',
  },
  {
    id: 'horizontal-white',
    title: '4K Full Horizontal Logo (Studio White Card)',
    subtitle: 'Solid studio-white background for documents, PDFs, sponsorships, and platforms that do not support alpha transparency.',
    dimensionsLabel: '4096 × 1400 px · 4K Ultra HD',
    width: 4096,
    height: 1400,
    filenameBase: 'ReFIREly-Logo-4K-White-Card',
    badgeText: 'Print & Document Ready',
    previewBgClass: 'bg-white',
  },
];

/**
 * Generates a self-contained, high-precision SVG string for any BrandAssetVariant.
 * Uses standard system/geometric sans-serif font stacks so HTML5 Canvas rasterization
 * works cleanly without external webfont CORS tainting.
 */
export function generateBrandSvgString(variant: BrandAssetVariant): string {
  if (variant === 'square-emblem') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="2048" height="2048" fill="none">
  <defs>
    <linearGradient id="sq-bg" x1="0" y1="0" x2="1024" y2="1024" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="48%" stop-color="#1e1b4b"/>
      <stop offset="100%" stop-color="#042f2e"/>
    </linearGradient>
    <radialGradient id="sq-glow-1" cx="25%" cy="22%" r="60%">
      <stop offset="0%" stop-color="#f97316" stop-opacity="0.28"/>
      <stop offset="100%" stop-color="#f97316" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="sq-glow-2" cx="78%" cy="78%" r="60%">
      <stop offset="0%" stop-color="#14b8a6" stop-opacity="0.32"/>
      <stop offset="100%" stop-color="#14b8a6" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="sq-ring" x1="64" y1="64" x2="960" y2="960" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#14b8a6"/>
      <stop offset="35%" stop-color="#6366f1"/>
      <stop offset="70%" stop-color="#d946ef"/>
      <stop offset="100%" stop-color="#f59e0b"/>
    </linearGradient>
    <linearGradient id="sq-flame" x1="260" y1="820" x2="540" y2="140" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#e11d48"/>
      <stop offset="48%" stop-color="#f97316"/>
      <stop offset="100%" stop-color="#facc15"/>
    </linearGradient>
    <linearGradient id="sq-flame-core" x1="340" y1="780" x2="500" y2="340" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#f97316"/>
      <stop offset="100%" stop-color="#fef08a"/>
    </linearGradient>
    <linearGradient id="sq-palm" x1="420" y1="780" x2="860" y2="240" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#059669"/>
      <stop offset="52%" stop-color="#14b8a6"/>
      <stop offset="100%" stop-color="#38bdf8"/>
    </linearGradient>
    <linearGradient id="sq-orbit" x1="120" y1="680" x2="900" y2="260" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="50%" stop-color="#818cf8"/>
      <stop offset="100%" stop-color="#f472b6"/>
    </linearGradient>
  </defs>

  <!-- Rounded Squircle Base -->
  <rect x="32" y="32" width="960" height="960" rx="224" fill="url(#sq-bg)"/>
  <rect x="32" y="32" width="960" height="960" rx="224" fill="url(#sq-glow-1)"/>
  <rect x="32" y="32" width="960" height="960" rx="224" fill="url(#sq-glow-2)"/>
  <rect x="44" y="44" width="936" height="936" rx="212" stroke="url(#sq-ring)" stroke-width="16" stroke-opacity="0.9"/>

  <!-- Subtle Inner Compass Grid -->
  <circle cx="512" cy="512" r="350" stroke="#ffffff" stroke-opacity="0.07" stroke-width="4" stroke-dasharray="14 14"/>
  <circle cx="512" cy="512" r="260" stroke="#ffffff" stroke-opacity="0.05" stroke-width="3"/>

  <!-- FIRE Flame (Left / Center-Top) -->
  <path d="M496 152C496 152 304 328 304 544C304 684 404 792 528 792C440 736 408 632 432 528C452 440 536 376 536 288C536 232 512 184 496 152Z" fill="url(#sq-flame)"/>
  <path d="M488 336C488 336 384 448 384 576C384 664 448 744 528 768C476 720 464 640 484 568C500 508 548 456 544 392C540 364 512 348 488 336Z" fill="url(#sq-flame-core)" opacity="0.95"/>

  <!-- Tropical Haven Palm Fronds (Right / Center) -->
  <path d="M488 792C528 632 616 472 784 360C672 368 576 424 520 512C568 400 664 304 800 264C672 256 560 320 496 432C528 328 608 240 712 200C592 216 496 312 464 456C440 568 448 696 488 792Z" fill="url(#sq-palm)"/>

  <!-- Sweeping Global Horizon Orbit -->
  <path d="M168 648C312 752 656 672 848 352" stroke="url(#sq-orbit)" stroke-width="30" stroke-linecap="round"/>

  <!-- Soaring Jet Plane at Orbit Apex -->
  <path d="M848 256L728 328L776 356L824 308L796 372L840 400L848 256Z" fill="#facc15"/>
  <circle cx="240" cy="248" r="22" fill="#38bdf8"/>
</svg>`;
  }

  if (variant === 'social-promo-banner') {
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
    <linearGradient id="sp-flame" x1="260" y1="820" x2="540" y2="140" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#e11d48"/>
      <stop offset="48%" stop-color="#f97316"/>
      <stop offset="100%" stop-color="#facc15"/>
    </linearGradient>
    <linearGradient id="sp-palm" x1="420" y1="780" x2="860" y2="240" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#059669"/>
      <stop offset="52%" stop-color="#14b8a6"/>
      <stop offset="100%" stop-color="#38bdf8"/>
    </linearGradient>
    <linearGradient id="sp-orbit" x1="120" y1="680" x2="900" y2="260" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="50%" stop-color="#818cf8"/>
      <stop offset="100%" stop-color="#f472b6"/>
    </linearGradient>
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
  <g transform="translate(160, 220) scale(0.76)">
    <rect x="32" y="32" width="960" height="960" rx="224" fill="#0f172a" fill-opacity="0.85"/>
    <rect x="44" y="44" width="936" height="936" rx="212" stroke="url(#sp-ribbon)" stroke-width="18"/>
    <circle cx="512" cy="512" r="350" stroke="#ffffff" stroke-opacity="0.08" stroke-width="4" stroke-dasharray="14 14"/>
    <path d="M496 152C496 152 304 328 304 544C304 684 404 792 528 792C440 736 408 632 432 528C452 440 536 376 536 288C536 232 512 184 496 152Z" fill="url(#sp-flame)"/>
    <path d="M488 792C528 632 616 472 784 360C672 368 576 424 520 512C568 400 664 304 800 264C672 256 560 320 496 432C528 328 608 240 712 200C592 216 496 312 464 456C440 568 448 696 488 792Z" fill="url(#sp-palm)"/>
    <path d="M168 648C312 752 656 672 848 352" stroke="url(#sp-orbit)" stroke-width="30" stroke-linecap="round"/>
    <path d="M848 256L728 328L776 356L824 308L796 372L840 400L848 256Z" fill="#facc15"/>
    <circle cx="240" cy="248" r="22" fill="#38bdf8"/>
  </g>

  <!-- Right Wordmark & Promotional Copy -->
  <g transform="translate(1020, 0)">
    <!-- Kicker Pill -->
    <rect x="0" y="250" width="660" height="58" rx="29" fill="#ffffff" fill-opacity="0.08" stroke="#2dd4bf" stroke-opacity="0.4" stroke-width="2"/>
    <text x="36" y="288" fill="#5eead4" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="25" font-weight="800" letter-spacing="4">GLOBAL RETIREMENT &amp; FIRE INTELLIGENCE</text>

    <!-- Main ReFIREly Wordmark -->
    <text x="0" y="535" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="235" font-weight="900" letter-spacing="-6">
      <tspan fill="#ffffff">Re</tspan><tspan fill="url(#sp-fire-grad)">FIRE</tspan><tspan fill="url(#sp-ly-grad)">ly</tspan>
    </text>

    <!-- Multi-Colored Accent Bar -->
    <rect x="6" y="585" width="1140" height="12" rx="6" fill="url(#sp-ribbon)"/>

    <!-- Tagline -->
    <text x="6" y="670" fill="#e2e8f0" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="44" font-weight="800" letter-spacing="5">
      WHERE YOUR FREEDOM GOES FURTHER
    </text>

    <!-- Feature Highlights -->
    <text x="6" y="765" fill="#94a3b8" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="34" font-weight="500">
      Empirical Cost-of-Living Dossiers · Sovereign Visa Pathways · Expat Community
    </text>

    <!-- Bottom Domain Callout Badge -->
    <rect x="6" y="850" width="470" height="88" rx="24" fill="url(#sp-ribbon)"/>
    <text x="241" y="907" text-anchor="middle" fill="#ffffff" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="40" font-weight="900" letter-spacing="2">
      refirely.com
    </text>
  </g>
</svg>`;
  }

  // Horizontal Full Logo variants ('horizontal-transparent' | 'horizontal-dark' | 'horizontal-white')
  const isDark = variant === 'horizontal-dark';
  const isWhiteCard = variant === 'horizontal-white';

  const reColor = isDark ? '#ffffff' : '#0f172a';
  const taglineColor = isDark ? '#cbd5e1' : '#475569';

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
    <linearGradient id="hz-flame" x1="160" y1="490" x2="330" y2="90" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#e11d48"/>
      <stop offset="48%" stop-color="#f97316"/>
      <stop offset="100%" stop-color="#facc15"/>
    </linearGradient>
    <linearGradient id="hz-flame-core" x1="210" y1="470" x2="300" y2="210" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#f97316"/>
      <stop offset="100%" stop-color="#fef08a"/>
    </linearGradient>
    <linearGradient id="hz-palm" x1="250" y1="470" x2="520" y2="140" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#059669"/>
      <stop offset="52%" stop-color="#14b8a6"/>
      <stop offset="100%" stop-color="#38bdf8"/>
    </linearGradient>
    <linearGradient id="hz-orbit" x1="80" y1="410" x2="540" y2="150" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="50%" stop-color="#818cf8"/>
      <stop offset="100%" stop-color="#f472b6"/>
    </linearGradient>
    <linearGradient id="hz-fire-text" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#e11d48"/>
      <stop offset="52%" stop-color="#f97316"/>
      <stop offset="100%" stop-color="#f59e0b"/>
    </linearGradient>
    <linearGradient id="hz-ly-text" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0d9488"/>
      <stop offset="50%" stop-color="#06b6d4"/>
      <stop offset="100%" stop-color="#6366f1"/>
    </linearGradient>
    <linearGradient id="hz-ribbon" x1="680" y1="0" x2="1960" y2="0" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#14b8a6"/>
      <stop offset="35%" stop-color="#6366f1"/>
      <stop offset="70%" stop-color="#d946ef"/>
      <stop offset="100%" stop-color="#f59e0b"/>
    </linearGradient>
  </defs>

  ${isDark ? `<rect width="2048" height="700" rx="64" fill="url(#hz-dark-bg)"/>` : ''}
  ${isWhiteCard ? `<rect width="2048" height="700" rx="64" fill="#ffffff"/><rect x="8" y="8" width="2032" height="684" rx="56" stroke="#e2e8f0" stroke-width="4"/>` : ''}

  <!-- Left Multi-Colored Emblem (540x540 centered vertically at y=80) -->
  <g transform="translate(80, 62) scale(0.93)">
    <rect x="24" y="24" width="568" height="568" rx="136" fill="url(#hz-emblem-bg)"/>
    <rect x="30" y="30" width="556" height="556" rx="130" stroke="url(#hz-ring)" stroke-width="12"/>
    <circle cx="308" cy="308" r="210" stroke="#ffffff" stroke-opacity="0.08" stroke-width="3" stroke-dasharray="10 10"/>

    <!-- FIRE Flame -->
    <path d="M298 92C298 92 182 198 182 328C182 412 242 476 316 476C264 442 244 380 258 318C270 264 322 226 322 174C322 140 308 112 298 92Z" fill="url(#hz-flame)"/>
    <path d="M292 202C292 202 230 270 230 346C230 400 268 446 316 462C286 432 278 384 290 342C300 306 328 274 326 236C324 218 308 210 292 202Z" fill="url(#hz-flame-core)" opacity="0.95"/>

    <!-- Tropical Palm Frond -->
    <path d="M292 476C316 380 370 284 470 216C404 222 346 254 312 308C340 240 398 182 480 158C404 154 336 192 298 260C316 198 364 144 428 120C356 130 298 188 278 274C264 342 268 418 292 476Z" fill="url(#hz-palm)"/>

    <!-- Global Horizon Orbit -->
    <path d="M100 390C188 452 394 404 510 212" stroke="url(#hz-orbit)" stroke-width="18" stroke-linecap="round"/>

    <!-- Soaring Jet -->
    <path d="M510 154L438 198L466 214L496 186L478 224L504 240L510 154Z" fill="#facc15"/>
    <circle cx="144" cy="150" r="14" fill="#38bdf8"/>
  </g>

  <!-- Right Typographic Wordmark + Multi-Color Ribbon + Tagline -->
  <g transform="translate(690, 0)">
    <text x="0" y="380" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="250" font-weight="900" letter-spacing="-7">
      <tspan fill="${reColor}">Re</tspan><tspan fill="url(#hz-fire-text)">FIRE</tspan><tspan fill="url(#hz-ly-text)">ly</tspan>
    </text>

    <!-- Multi-Colored Divider Ribbon -->
    <rect x="8" y="432" width="1240" height="14" rx="7" fill="url(#hz-ribbon)"/>

    <!-- Subtitle / Tagline -->
    <text x="12" y="518" fill="${taglineColor}" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="42" font-weight="800" letter-spacing="8.5">
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
  const config = BRAND_ASSET_CONFIGS.find((c) => c.id === variant) || BRAND_ASSET_CONFIGS[0];
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
  const config = BRAND_ASSET_CONFIGS.find((c) => c.id === variant) || BRAND_ASSET_CONFIGS[0];
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
