import { Country } from '../types';
import { getCountryNomadProfile } from '../data/countryNomadProfiles';
import { getCountryPhotoConfig } from '../components/CountryThumbnail';

export type VideoOrientation = 'vertical' | 'horizontal';
export type VideoDurationSec = 15 | 30;

export type VideoSceneId =
  | 'hook'
  | 'cost_tax'
  | 'visa_tax'
  | 'scores_radar'
  | 'pros_cons'
  | 'outro';

export interface VideoSceneSpec {
  id: VideoSceneId;
  label: string;
  shortTitle: string;
  startSec: number;
  durationSec: number;
  text: string;
}

export interface ComparisonEntry {
  id: string;
  name: string;
  flag: string;
  singleBudget: number;
  coupleBudget: number;
  nomadBurn: number;
  healthcareScore: number;
  safetyScore: number;
  sunnyDays: number;
  fiberMbps: number;
  walkabilityScore: number;
  role: 'target' | 'peer' | 'baseline';
}

export interface PromoVideoBlueprint {
  country: Country;
  comparisonCountry: Country | null;
  durationSec: VideoDurationSec;
  photoUrl: string;
  landmarkLabel: string;
  nomadBurnUSD: number;
  fiberMbps: number;
  remoteWorkVisaName: string;
  highCostBaselineMonthly: number;
  annualSavingsVsBaseline: number;
  savingsPercentVsBaseline: number;
  taxBadgeLabel: string;
  comparisons: ComparisonEntry[];
  scenes: VideoSceneSpec[];
}

export interface VideoDimensions {
  width: number;
  height: number;
  label: string;
  platformHint: string;
}

export const HIGH_COST_CITY_BASELINE_USD = 5400; // NYC / SF / London solo living benchmark

export const VIDEO_DIMENSIONS: Record<VideoOrientation, VideoDimensions> = {
  vertical: {
    width: 1080,
    height: 1920,
    label: '9:16 Vertical (1080×1920)',
    platformHint: 'Instagram Reels · YouTube Shorts · TikTok',
  },
  horizontal: {
    width: 1920,
    height: 1080,
    label: '16:9 Landscape (1920×1080)',
    platformHint: 'YouTube Video · LinkedIn · X',
  },
};

// ============================================================================
// TAX REGIME EXTRACTOR & SMART PEER MATCHING
// ============================================================================

export function extractTaxBadgeLabel(taxStatus: string): string {
  const lower = (taxStatus || '').toLowerCase();
  if (lower.includes('0%') || lower.includes('tax-free') || lower.includes('no personal income tax')) {
    return '0% Personal Income Tax';
  }
  if (lower.includes('territorial')) {
    return 'Territorial Tax · Foreign Income Exempt';
  }
  const flatMatch = taxStatus.match(/(\d{1,2})%\s*(flat|tax)/i);
  if (flatMatch) {
    return `${flatMatch[1]}% Flat Expat Tax Regime`;
  }
  if (lower.includes('nhr')) {
    return 'NHR / Special Expat Tax Regime';
  }
  if (lower.includes('treaty') || lower.includes('treaties')) {
    return 'Double-Tax Treaty Protection';
  }
  return 'Favorable Expat Tax Treaties';
}

export function pickAutoComparisonCountry(target: Country, allCountries: Country[]): Country | null {
  const candidates = allCountries.filter(c => c.id !== target.id);
  if (candidates.length === 0) return null;
  const targetBudget = target.costOfLiving.monthlyBudgetSingleUSD || 1800;

  let best = candidates[0];
  let bestScore = -Infinity;
  for (const c of candidates) {
    const sameRegion = c.region === target.region ? 1 : 0;
    const budgetDiff = Math.abs((c.costOfLiving.monthlyBudgetSingleUSD || 1800) - targetBudget);
    const budgetSim = Math.max(0, 1 - budgetDiff / Math.max(targetBudget, 1500));
    const quality = ((c.lifestyle.safetyScore || 75) + (c.lifestyle.healthcareScore || 75)) / 200;
    const score = sameRegion * 2.5 + budgetSim * 1.5 + quality * 0.5;
    if (score > bestScore) {
      bestScore = score;
      best = c;
    }
  }
  return best;
}

function shortenClause(raw: string, maxWords = 8): string {
  const clean = (raw || '').replace(/\.$/, '').trim();
  const words = clean.split(/\s+/);
  if (words.length <= maxWords) return clean;
  return words.slice(0, maxWords).join(' ');
}

/**
 * Counts effective spoken words, accounting for numbers (e.g. "1,950" -> ~3 spoken words)
 * and punctuation pauses so Web Speech timing estimates closely match real OS TTS voices.
 */
export function countEffectiveSpokenWords(text: string): number {
  const trimmed = (text || '').trim();
  if (!trimmed) return 0;
  const tokens = trimmed.split(/\s+/);
  let count = 0;
  for (const tok of tokens) {
    const digitsOnly = tok.replace(/[^0-9]/g, '');
    if (digitsOnly.length >= 4) {
      count += 3.0; // e.g., "1,950" -> "one thousand nine hundred fifty"
    } else if (digitsOnly.length === 3) {
      count += 2.2; // e.g., "305" -> "three hundred five"
    } else if (digitsOnly.length >= 1) {
      count += 1.4;
    } else {
      count += 1.0;
    }
  }
  const pauses = (trimmed.match(/[.,;:!?]/g) || []).length;
  return count + pauses * 0.35;
}

/**
 * Estimates total spoken duration in seconds for a set of scenes at a given Web Speech rate.
 * Most OS/Chrome English voices average ~2.25 effective words/sec at 1.0x rate, plus ~0.22s inter-scene pause.
 */
export function estimateSpeechDurationSec(
  scenes: Array<{ text: string }>,
  speechRate: number
): number {
  const safeRate = Math.max(0.5, Math.min(2.5, speechRate || 1.0));
  const baseWordsPerSec = 2.25;
  const totalEffectiveWords = scenes.reduce((sum, s) => sum + countEffectiveSpokenWords(s.text), 0);
  const interSceneGaps = Math.max(0, scenes.length - 1) * 0.22;
  return totalEffectiveWords / (baseWordsPerSec * safeRate) + interSceneGaps;
}

/**
 * Calculates the recommended Web Speech rate (rounded to nearest 0.05x, clamped 0.90x–2.00x)
 * so all voiceover text completes cleanly with ~0.7s breathing room before the video ends.
 */
export function computeRecommendedSpeechRate(
  scenes: Array<{ text: string }>,
  targetDurationSec: number
): number {
  const targetSpeechWindow = Math.max(4, targetDurationSec - 0.7);
  const baseAt1x = estimateSpeechDurationSec(scenes, 1.0);
  const rawRate = baseAt1x / targetSpeechWindow;
  const rounded = Math.ceil(rawRate * 20) / 20; // round up to nearest 0.05x so it never runs long
  return Math.max(0.9, Math.min(2.0, Number(rounded.toFixed(2))));
}

/**
 * Rebalances each scene's startSec and durationSec proportionally to its spoken word weight
 * while preserving the exact total target duration (15s or 30s) and a minimum readable duration per scene.
 */
export function rebalanceSceneTimingsByText(
  scenes: VideoSceneSpec[],
  totalDurationSec: number
): VideoSceneSpec[] {
  if (scenes.length === 0) return scenes;
  const minSceneSec = totalDurationSec === 15 ? 2.2 : 2.8;
  const weights = scenes.map(s => Math.max(4, countEffectiveSpokenWords(s.text)));
  const totalWeight = weights.reduce((a, b) => a + b, 0) || 1;
  const reserved = minSceneSec * scenes.length;
  const distributable = Math.max(0, totalDurationSec - reserved);

  let cursor = 0;
  return scenes.map((scene, idx) => {
    const rawDur = minSceneSec + (weights[idx] / totalWeight) * distributable;
    const dur =
      idx === scenes.length - 1
        ? Math.max(minSceneSec, Number((totalDurationSec - cursor).toFixed(2)))
        : Number(rawDur.toFixed(2));
    const start = Number(cursor.toFixed(2));
    cursor += dur;
    return {
      ...scene,
      startSec: start,
      durationSec: dur,
    };
  });
}

// ============================================================================
// DYNAMIC 15s AND 30s VIDEO BLUEPRINT & VOICEOVER SCRIPT BUILDER
// ============================================================================

export function buildPromoVideoBlueprint(
  country: Country,
  allCountries: Country[],
  durationSec: VideoDurationSec,
  comparisonCountryId?: string | null
): PromoVideoBlueprint {
  const photoCfg = getCountryPhotoConfig(country.id, country.imageUrl);
  const nomad = getCountryNomadProfile(country);

  const comparisonCountry =
    comparisonCountryId && comparisonCountryId !== 'auto' && comparisonCountryId !== country.id
      ? allCountries.find(c => c.id === comparisonCountryId) || pickAutoComparisonCountry(country, allCountries)
      : pickAutoComparisonCountry(country, allCountries);

  const singleUSD = country.costOfLiving.monthlyBudgetSingleUSD;
  const coupleUSD = country.costOfLiving.monthlyBudgetCoupleUSD;
  const annualSavings = Math.max(0, (HIGH_COST_CITY_BASELINE_USD - singleUSD) * 12);
  const savingsPct = Math.max(
    0,
    Math.round(((HIGH_COST_CITY_BASELINE_USD - singleUSD) / HIGH_COST_CITY_BASELINE_USD) * 100)
  );
  const taxBadgeLabel = extractTaxBadgeLabel(country.visa.taxStatus);
  const visaShort = country.visa.retirementVisaName.split('/')[0].trim();

  const comparisons: ComparisonEntry[] = [
    {
      id: country.id,
      name: country.name,
      flag: country.flag,
      singleBudget: singleUSD,
      coupleBudget: coupleUSD,
      nomadBurn: nomad.monthlyNomadBurnUSD,
      healthcareScore: country.lifestyle.healthcareScore,
      safetyScore: country.lifestyle.safetyScore,
      sunnyDays: country.climate.annualSunnyDays,
      fiberMbps: nomad.verifiedInternetMbps,
      walkabilityScore: country.lifestyle.walkabilityScore,
      role: 'target',
    },
  ];

  if (comparisonCountry) {
    const peerNomad = getCountryNomadProfile(comparisonCountry);
    comparisons.push({
      id: comparisonCountry.id,
      name: comparisonCountry.name,
      flag: comparisonCountry.flag,
      singleBudget: comparisonCountry.costOfLiving.monthlyBudgetSingleUSD,
      coupleBudget: comparisonCountry.costOfLiving.monthlyBudgetCoupleUSD,
      nomadBurn: peerNomad.monthlyNomadBurnUSD,
      healthcareScore: comparisonCountry.lifestyle.healthcareScore,
      safetyScore: comparisonCountry.lifestyle.safetyScore,
      sunnyDays: comparisonCountry.climate.annualSunnyDays,
      fiberMbps: peerNomad.verifiedInternetMbps,
      walkabilityScore: comparisonCountry.lifestyle.walkabilityScore,
      role: 'peer',
    });
  }

  comparisons.push({
    id: 'nyc-baseline',
    name: 'NYC / High-Cost City',
    flag: '🏙️',
    singleBudget: HIGH_COST_CITY_BASELINE_USD,
    coupleBudget: 8600,
    nomadBurn: 5800,
    healthcareScore: 80,
    safetyScore: 68,
    sunnyDays: 224,
    fiberMbps: 240,
    walkabilityScore: 86,
    role: 'baseline',
  });

  const peerLine = comparisonCountry
    ? `compared to ${comparisonCountry.costOfLiving.monthlyBudgetSingleUSD.toLocaleString()} dollars in ${comparisonCountry.name}`
    : `saving up to ${savingsPct} percent versus major US cities`;

  const topPro = shortenClause(country.pros[0] || 'Strong expat community and high quality of life', 7);
  const topCon = shortenClause(country.cons[0] || 'Visa paperwork takes advance planning', 7);

  let scenes: VideoSceneSpec[];

  if (durationSec === 15) {
    // Tight 15-second Reels/Shorts Blitz (4 scenes: 3.2s + 4.4s + 4.2s + 3.2s = 15.0s)
    scenes = [
      {
        id: 'hook',
        label: 'Scene 1 · Hook (0–3.2s)',
        shortTitle: 'Hook',
        startSec: 0,
        durationSec: 3.2,
        text: `Retire or work remotely in ${country.name} from just ${singleUSD.toLocaleString()} dollars a month.`,
      },
      {
        id: 'cost_tax',
        label: 'Scene 2 · Cost & Tax (3.2–7.6s)',
        shortTitle: 'Cost & Tax',
        startSec: 3.2,
        durationSec: 4.4,
        text: `Save ${savingsPct} percent versus high-cost cities, with the ${visaShort} and ${taxBadgeLabel.toLowerCase()}.`,
      },
      {
        id: 'scores_radar',
        label: 'Scene 3 · Quality Radar (7.6–11.8s)',
        shortTitle: 'Scores',
        startSec: 7.6,
        durationSec: 4.2,
        text: `Score ${country.lifestyle.healthcareScore} healthcare, ${country.lifestyle.safetyScore} safety, ${country.climate.annualSunnyDays} sunny days, and ${nomad.verifiedInternetMbps} megabit fiber.`,
      },
      {
        id: 'outro',
        label: 'Scene 4 · Refirely CTA (11.8–15s)',
        shortTitle: 'Refirely CTA',
        startSec: 11.8,
        durationSec: 3.2,
        text: `Compare 209 global havens free at Refirely dot com.`,
      },
    ];
  } else {
    // Full 30-second Deep-Dive Dossier (6 scenes: 4.2 + 5.8 + 5.2 + 5.8 + 5.2 + 3.8 = 30.0s)
    scenes = [
      {
        id: 'hook',
        label: 'Scene 1 · Country Hook (0–4.2s)',
        shortTitle: 'Hook',
        startSec: 0,
        durationSec: 4.2,
        text: `Could ${country.name} be your next early retirement or digital nomad haven? Let's break down the real 2026 numbers.`,
      },
      {
        id: 'cost_tax',
        label: 'Scene 2 · Cost Arbitrage (4.2–10s)',
        shortTitle: 'Cost Chart',
        startSec: 4.2,
        durationSec: 5.8,
        text: `Solo retirees live comfortably for ${singleUSD.toLocaleString()} dollars a month, and nomads for ${nomad.monthlyNomadBurnUSD.toLocaleString()}, ${peerLine}.`,
      },
      {
        id: 'visa_tax',
        label: 'Scene 3 · Visa & Tax (10–15.2s)',
        shortTitle: 'Visa & Tax',
        startSec: 10.0,
        durationSec: 5.2,
        text: `Qualify via the ${visaShort} with ${taxBadgeLabel.toLowerCase()}, plus a clear ${country.visa.pathwayToPR.toLowerCase()}.`,
      },
      {
        id: 'scores_radar',
        label: 'Scene 4 · Radar & Fiber (15.2–21s)',
        shortTitle: 'Radar',
        startSec: 15.2,
        durationSec: 5.8,
        text: `Quality scores shine with ${country.lifestyle.healthcareScore} healthcare, ${country.lifestyle.safetyScore} safety, ${country.climate.annualSunnyDays} sunny days, and ${nomad.verifiedInternetMbps} megabit fiber.`,
      },
      {
        id: 'pros_cons',
        label: 'Scene 5 · Pros & Cons (21–26.2s)',
        shortTitle: 'Pros/Cons',
        startSec: 21.0,
        durationSec: 5.2,
        text: `The biggest advantage is ${topPro}. The trade-off to plan for is ${topCon}.`,
      },
      {
        id: 'outro',
        label: 'Scene 6 · Refirely CTA (26.2–30s)',
        shortTitle: 'Refirely CTA',
        startSec: 26.2,
        durationSec: 3.8,
        text: `Compare 209 global havens, visas, and your exact FIRE budget free at Refirely dot com.`,
      },
    ];
  }

  return {
    country,
    comparisonCountry,
    durationSec,
    photoUrl: photoCfg.photoUrl,
    landmarkLabel: photoCfg.landmarkLabel,
    nomadBurnUSD: nomad.monthlyNomadBurnUSD,
    fiberMbps: nomad.verifiedInternetMbps,
    remoteWorkVisaName: nomad.remoteWorkVisaName,
    highCostBaselineMonthly: HIGH_COST_CITY_BASELINE_USD,
    annualSavingsVsBaseline: annualSavings,
    savingsPercentVsBaseline: savingsPct,
    taxBadgeLabel,
    comparisons,
    scenes,
  };
}

export function buildVideoSocialCopy(blueprint: PromoVideoBlueprint, orientation: VideoOrientation) {
  const c = blueprint.country;
  const single = c.costOfLiving.monthlyBudgetSingleUSD.toLocaleString();
  const couple = c.costOfLiving.monthlyBudgetCoupleUSD.toLocaleString();
  const cleanTag = c.name.replace(/[^a-zA-Z0-9]/g, '');
  const compNote = blueprint.comparisonCountry
    ? ` vs ${blueprint.comparisonCountry.name} ($${blueprint.comparisonCountry.costOfLiving.monthlyBudgetSingleUSD.toLocaleString()}/mo)`
    : '';

  const title =
    orientation === 'vertical'
      ? `${c.flag} Live in ${c.name} for $${single}/mo (Save ${blueprint.savingsPercentVsBaseline}%!) | #Shorts`
      : `${c.flag} ${c.name} Retirement & Nomad Breakdown (${blueprint.durationSec}s) — $${single}/mo${compNote}`;

  const description = [
    `Thinking about retiring early or working remotely in ${c.flag} ${c.name}?`,
    ``,
    `2026 Refirely Dossier Highlights:`,
    `• Retiree Solo Budget: $${single}/mo ($${couple}/mo couple)`,
    `• Digital Nomad Burn: $${blueprint.nomadBurnUSD.toLocaleString()}/mo · ${blueprint.fiberMbps} Mbps Fiber`,
    `• Annual Savings vs High-Cost City: $${blueprint.annualSavingsVsBaseline.toLocaleString()}/yr (${blueprint.savingsPercentVsBaseline}% lower)`,
    `• Visa & Tax: ${c.visa.retirementVisaName} · ${blueprint.taxBadgeLabel}`,
    `• Scores: Healthcare ${c.lifestyle.healthcareScore}/100 · Safety ${c.lifestyle.safetyScore}/100 · ${c.climate.annualSunnyDays} Sunny Days/yr`,
    ``,
    `Compare 209 Global Havens Free at Refirely.com:`,
    `https://refirely.com/country/${c.id}`,
    ``,
    `#${cleanTag} #RetireAbroad #FIREMovement #EarlyRetirement #DigitalNomad #Geoarbitrage #CostOfLiving #Refirely #${cleanTag}Expats`,
  ].join('\n');

  return { title, description };
}

// ============================================================================
// BROWSER WEB SPEECH VOICE RANKING (PREFERS NATURAL FEMALE ENGLISH VOICES)
// ============================================================================

const PREFERRED_FEMALE_VOICE_KEYWORDS = [
  'samantha',
  'google us english',
  'aria',
  'jenny',
  'zira',
  'karen',
  'serena',
  'tessa',
  'victoria',
  'moira',
  'allison',
  'ava',
  'susan',
  'emma',
  'joanna',
  'salli',
  'female',
];

export function sortSystemVoicesForPromo(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice[] {
  const scoreVoice = (v: SpeechSynthesisVoice): number => {
    const name = v.name.toLowerCase();
    const lang = v.lang.toLowerCase();
    let score = 0;
    if (lang.startsWith('en-us')) score += 40;
    else if (lang.startsWith('en-gb') || lang.startsWith('en-au') || lang.startsWith('en')) score += 30;
    if (name.includes('natural') || name.includes('neural') || name.includes('google') || name.includes('enhanced')) {
      score += 25;
    }
    const femaleIdx = PREFERRED_FEMALE_VOICE_KEYWORDS.findIndex(k => name.includes(k));
    if (femaleIdx >= 0) {
      score += 60 - femaleIdx;
    }
    if (v.localService) score += 5;
    return score;
  };

  return [...voices].sort((a, b) => scoreVoice(b) - scoreVoice(a));
}

// ============================================================================
// SAFE IMAGE LOADER (CORS-SAFE FOR CANVAS CAPTURE STREAM)
// ============================================================================

const videoImageCache: Record<string, HTMLImageElement> = {};

export function loadCanvasSafeImage(url: string): Promise<HTMLImageElement | null> {
  if (!url) return Promise.resolve(null);
  if (videoImageCache[url] && videoImageCache[url].complete && videoImageCache[url].naturalWidth > 0) {
    return Promise.resolve(videoImageCache[url]);
  }
  return new Promise(resolve => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.referrerPolicy = 'no-referrer';
    const timeout = setTimeout(() => resolve(null), 4000);
    img.onload = () => {
      clearTimeout(timeout);
      if (img.naturalWidth > 0) {
        videoImageCache[url] = img;
        resolve(img);
      } else {
        resolve(null);
      }
    };
    img.onerror = () => {
      clearTimeout(timeout);
      resolve(null);
    };
    img.src = url;
  });
}

// ============================================================================
// WEB AUDIO API AMBIENT FINTECH SOUNDTRACK (100% FREE, ROYALTY-FREE)
// ============================================================================

export function scheduleFintechAmbientTrack(
  audioCtx: AudioContext,
  destination: AudioNode,
  startTime: number,
  durationSec: number,
  masterVolume = 0.11
): AudioNode[] {
  const master = audioCtx.createGain();
  master.gain.setValueAtTime(0.0001, startTime);
  master.gain.linearRampToValueAtTime(masterVolume, startTime + 0.7);
  master.gain.setValueAtTime(masterVolume, Math.max(startTime + 0.8, startTime + durationSec - 1.1));
  master.gain.linearRampToValueAtTime(0.0001, startTime + durationSec);
  master.connect(destination);

  const nodes: AudioNode[] = [master];

  // Crisp modern fintech chord progression (E minor 9 -> C maj7 -> G maj9 -> D add9)
  const chords = [
    [164.81, 246.94, 293.66, 369.99],
    [130.81, 196.0, 246.94, 329.63],
    [196.0, 246.94, 293.66, 369.99],
    [146.83, 220.0, 293.66, 369.99],
  ];

  const chordDur = 3.75;
  const count = Math.ceil(durationSec / chordDur);

  for (let i = 0; i < count; i++) {
    const chord = chords[i % chords.length];
    const t0 = startTime + i * chordDur;
    const tEnd = Math.min(startTime + durationSec, t0 + chordDur + 0.18);

    // Warm sub-pad
    chord.forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const filter = audioCtx.createBiquadFilter();
      const g = audioCtx.createGain();
      osc.type = idx === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, t0);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(780, t0);

      g.gain.setValueAtTime(0.0001, t0);
      g.gain.linearRampToValueAtTime(idx === 0 ? 0.28 : 0.14, t0 + 0.45);
      g.gain.linearRampToValueAtTime(0.0001, tEnd);

      osc.connect(filter);
      filter.connect(g);
      g.connect(master);
      osc.start(t0);
      osc.stop(tEnd + 0.05);
      nodes.push(osc, filter, g);
    });

    // Subtle rhythmic fintech pulse notes (8th-note glassy marimba plucks)
    const steps = 6;
    for (let s = 0; s < steps; s++) {
      const nt = t0 + s * (chordDur / steps);
      if (nt >= startTime + durationSec - 0.25) break;
      const pluckFreq = chord[(s + 1) % chord.length] * 2;
      const osc = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(pluckFreq, nt);
      g.gain.setValueAtTime(0.0001, nt);
      g.gain.linearRampToValueAtTime(0.11, nt + 0.018);
      g.gain.exponentialRampToValueAtTime(0.0008, nt + 0.42);
      osc.connect(g);
      g.connect(master);
      osc.start(nt);
      osc.stop(nt + 0.46);
      nodes.push(osc, g);
    }
  }

  return nodes;
}

// ============================================================================
// REFIRELY LIGHT THEME CANVAS DRAWING ENGINE (30 FPS · MATCHES LIVE SITE THEME)
// ============================================================================

interface ActiveThemeFonts {
  display: string;
  body: string;
  mono: string;
}

function getActiveThemeFonts(): ActiveThemeFonts {
  const fallback: ActiveThemeFonts = {
    display: '"Outfit", "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif',
    body: '"Figtree", "DM Sans", ui-sans-serif, system-ui, sans-serif',
    mono: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
  };
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return fallback;
  }
  try {
    const styles = window.getComputedStyle(document.documentElement);
    const display = styles.getPropertyValue('--active-font-display').trim();
    const body = styles.getPropertyValue('--active-font-sans').trim();
    const mono = styles.getPropertyValue('--active-font-mono').trim();
    return {
      display: display || fallback.display,
      body: body || fallback.body,
      mono: mono || fallback.mono,
    };
  } catch {
    return fallback;
  }
}

function easeOutCubic(t: number): number {
  const c = Math.max(0, Math.min(1, t));
  return 1 - Math.pow(1 - c, 3);
}

function easeOutBack(t: number): number {
  const c = Math.max(0, Math.min(1, t));
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(c - 1, 3) + c1 * Math.pow(c - 1, 2);
}

function drawRoundedRect(
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

function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxW: number,
  maxLines = 3
): string[] {
  const words = (text || '').trim().split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width <= maxW) {
      line = test;
    } else {
      if (line) lines.push(line);
      line = word;
      if (lines.length >= maxLines - 1) break;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, maxLines);
}

function drawCoverPhotoZoom(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  zoom = 1.04
) {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  if (!iw || !ih) return;
  const scale = Math.max(w / iw, h / ih) * zoom;
  const dw = iw * scale;
  const dh = ih * scale;
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}

/**
 * Draws the authentic Refirely light pastel gradient backdrop (Slate-50 -> Indigo-50 -> Teal-50 -> Amber-50)
 * matching the live ReFIREly web application theme with zero dark backgrounds.
 */
function drawRefirelyLightBackdrop(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  globalProgress: number
) {
  // Crisp airy Refirely light multi-tone gradient canvas
  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, '#f8fafc');
  bg.addColorStop(0.36, '#eef2ff');
  bg.addColorStop(0.72, '#f0fdfa');
  bg.addColorStop(1, '#fffbeb');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Subtle architectural indigo hairline grid
  ctx.save();
  ctx.strokeStyle = 'rgba(79, 70, 229, 0.048)';
  ctx.lineWidth = 1;
  const step = 72;
  for (let gx = 0; gx < w; gx += step) {
    ctx.beginPath();
    ctx.moveTo(gx, 0);
    ctx.lineTo(gx, h);
    ctx.stroke();
  }
  for (let gy = 0; gy < h; gy += step) {
    ctx.beginPath();
    ctx.moveTo(0, gy);
    ctx.lineTo(w, gy);
    ctx.stroke();
  }
  ctx.restore();

  // Gently drifting pastel ambient brand washes (Teal, Indigo, Warm Amber)
  const dx = Math.sin(globalProgress * Math.PI * 2) * (w * 0.045);
  const dy = Math.cos(globalProgress * Math.PI * 2) * (h * 0.035);

  const glowTeal = ctx.createRadialGradient(
    w * 0.14 + dx,
    h * 0.15 + dy,
    20,
    w * 0.14 + dx,
    h * 0.15 + dy,
    Math.max(w, h) * 0.45
  );
  glowTeal.addColorStop(0, 'rgba(20, 184, 166, 0.16)');
  glowTeal.addColorStop(1, 'rgba(20, 184, 166, 0)');
  ctx.fillStyle = glowTeal;
  ctx.fillRect(0, 0, w, h);

  const glowIndigo = ctx.createRadialGradient(
    w * 0.85 - dx,
    h * 0.24 + dy,
    20,
    w * 0.85 - dx,
    h * 0.24 + dy,
    Math.max(w, h) * 0.44
  );
  glowIndigo.addColorStop(0, 'rgba(99, 102, 241, 0.14)');
  glowIndigo.addColorStop(1, 'rgba(99, 102, 241, 0)');
  ctx.fillStyle = glowIndigo;
  ctx.fillRect(0, 0, w, h);

  const glowAmber = ctx.createRadialGradient(
    w * 0.78 - dx,
    h * 0.84 - dy,
    20,
    w * 0.78 - dx,
    h * 0.84 - dy,
    Math.max(w, h) * 0.42
  );
  glowAmber.addColorStop(0, 'rgba(249, 115, 22, 0.11)');
  glowAmber.addColorStop(1, 'rgba(249, 115, 22, 0)');
  ctx.fillStyle = glowAmber;
  ctx.fillRect(0, 0, w, h);

  // Signature Refirely Multi-Colored Top Accent Ribbon (Teal -> Indigo -> Amber)
  const bar = ctx.createLinearGradient(0, 0, w, 0);
  bar.addColorStop(0, '#14b8a6');
  bar.addColorStop(0.5, '#6366f1');
  bar.addColorStop(1, '#f59e0b');
  ctx.fillStyle = bar;
  ctx.fillRect(0, 0, w, 10);
}

function drawRefirelyCard(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius = 28,
  borderColor = 'rgba(99, 102, 241, 0.22)',
  fillColor = 'rgba(255, 255, 255, 0.94)'
) {
  ctx.save();
  ctx.shadowColor = 'rgba(15, 23, 42, 0.08)';
  ctx.shadowBlur = 26;
  ctx.shadowOffsetY = 10;
  drawRoundedRect(ctx, x, y, w, h, radius);
  ctx.fillStyle = fillColor;
  ctx.fill();
  ctx.restore();

  drawRoundedRect(ctx, x, y, w, h, radius);
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 2;
  ctx.stroke();
}

/**
 * Renders the authentic ReFIREly multi-colored wordmark ("Re" slate-indigo + "FIRE" rose-orange-amber + "ly" teal-emerald-indigo + ".com")
 * matching BrandLogo.tsx on the live website.
 */
function drawRefirelyWordmark(
  ctx: CanvasRenderingContext2D,
  x: number,
  centerY: number,
  fontSize: number,
  fonts: ActiveThemeFonts,
  options?: { showDotCom?: boolean; centered?: boolean; underline?: boolean }
) {
  const showDotCom = options?.showDotCom ?? true;
  const centered = options?.centered ?? false;
  const underline = options?.underline ?? false;

  ctx.save();
  ctx.font = `800 ${fontSize}px ${fonts.display}`;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';

  const wRe = ctx.measureText('Re').width;
  const wFire = ctx.measureText('FIRE').width;
  const wLy = ctx.measureText('ly').width;
  const dotFontSize = Math.round(fontSize * 0.72);
  ctx.font = `700 ${dotFontSize}px ${fonts.display}`;
  const wDot = showDotCom ? ctx.measureText('.com').width : 0;

  const totalW = wRe + wFire + wLy + wDot;
  const startX = centered ? x - totalW / 2 : x;

  ctx.font = `800 ${fontSize}px ${fonts.display}`;

  // "Re" (slate-900 -> indigo-800)
  const reGrad = ctx.createLinearGradient(startX, centerY - fontSize / 2, startX + wRe, centerY + fontSize / 2);
  reGrad.addColorStop(0, '#0f172a');
  reGrad.addColorStop(1, '#312e81');
  ctx.fillStyle = reGrad;
  ctx.fillText('Re', startX, centerY);

  // "FIRE" (rose-500 -> orange-500 -> amber-500)
  const fireX = startX + wRe;
  const fireGrad = ctx.createLinearGradient(fireX, centerY, fireX + wFire, centerY);
  fireGrad.addColorStop(0, '#f43f5e');
  fireGrad.addColorStop(0.5, '#f97316');
  fireGrad.addColorStop(1, '#f59e0b');
  ctx.fillStyle = fireGrad;
  ctx.fillText('FIRE', fireX, centerY);

  // "ly" (teal-600 -> emerald-500 -> indigo-600)
  const lyX = fireX + wFire;
  const lyGrad = ctx.createLinearGradient(lyX, centerY, lyX + wLy, centerY);
  lyGrad.addColorStop(0, '#0d9488');
  lyGrad.addColorStop(0.5, '#10b981');
  lyGrad.addColorStop(1, '#4f46e5');
  ctx.fillStyle = lyGrad;
  ctx.fillText('ly', lyX, centerY);

  // ".com"
  if (showDotCom) {
    ctx.font = `700 ${dotFontSize}px ${fonts.display}`;
    ctx.fillStyle = '#64748b';
    ctx.fillText('.com', lyX + wLy + 1, centerY + fontSize * 0.08);
  }

  // Signature Refirely multi-colored accent underline
  if (underline) {
    const lineY = centerY + fontSize * 0.56;
    const lineGrad = ctx.createLinearGradient(startX, lineY, startX + totalW, lineY);
    lineGrad.addColorStop(0, '#14b8a6');
    lineGrad.addColorStop(0.55, '#6366f1');
    lineGrad.addColorStop(1, '#f59e0b');
    drawRoundedRect(ctx, startX, lineY, totalW, 4, 2);
    ctx.fillStyle = lineGrad;
    ctx.fill();
  }

  ctx.restore();
}

function drawSquircleLogo(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  logoImg: HTMLImageElement | null
) {
  const r = Math.round(size * 0.28);
  // Multi-colored gradient squircle border (matches BrandLogo.tsx)
  drawRoundedRect(ctx, x, y, size, size, r);
  const borderGrad = ctx.createLinearGradient(x, y, x + size, y + size);
  borderGrad.addColorStop(0, '#2dd4bf');
  borderGrad.addColorStop(0.55, '#6366f1');
  borderGrad.addColorStop(1, '#f59e0b');
  ctx.fillStyle = borderGrad;
  ctx.fill();

  const inset = Math.max(2, Math.round(size * 0.05));
  drawRoundedRect(ctx, x + inset, y + inset, size - inset * 2, size - inset * 2, Math.max(4, r - inset));
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  if (logoImg) {
    const pad = Math.max(4, Math.round(size * 0.12));
    ctx.drawImage(logoImg, x + pad, y + pad, size - pad * 2, size - pad * 2);
  }
}

function drawTopChrome(
  ctx: CanvasRenderingContext2D,
  w: number,
  isVertical: boolean,
  blueprint: PromoVideoBlueprint,
  logoImg: HTMLImageElement | null,
  activeIdx: number,
  sceneProgress: number,
  totalScenes: number,
  fonts: ActiveThemeFonts
) {
  const padX = isVertical ? 54 : 72;
  const topY = isVertical ? 46 : 36;
  const totalBarW = w - padX * 2;
  const gap = 10;
  const segW = (totalBarW - gap * (totalScenes - 1)) / totalScenes;

  for (let i = 0; i < totalScenes; i++) {
    const sx = padX + i * (segW + gap);
    drawRoundedRect(ctx, sx, topY, segW, 7, 4);
    ctx.fillStyle = 'rgba(99, 102, 241, 0.15)';
    ctx.fill();

    const ratio = i < activeIdx ? 1 : i === activeIdx ? Math.min(1, sceneProgress) : 0;
    if (ratio > 0) {
      drawRoundedRect(ctx, sx, topY, Math.max(7, segW * ratio), 7, 4);
      const grad = ctx.createLinearGradient(sx, topY, sx + segW, topY);
      grad.addColorStop(0, '#14b8a6');
      grad.addColorStop(0.55, '#4f46e5');
      grad.addColorStop(1, '#f59e0b');
      ctx.fillStyle = grad;
      ctx.fill();
    }
  }

  const rowY = topY + 24;
  const pillH = isVertical ? 60 : 54;

  // Left: Local ReFIREly Squircle Logo + Authentic Multi-Colored Brand Wordmark
  const brandW = isVertical ? 286 : 268;
  drawRefirelyCard(ctx, padX, rowY, brandW, pillH, 18, 'rgba(99, 102, 241, 0.24)', 'rgba(255, 255, 255, 0.96)');
  const iconSize = pillH - 14;
  drawSquircleLogo(ctx, padX + 9, rowY + 7, iconSize, logoImg);
  drawRefirelyWordmark(
    ctx,
    padX + iconSize + 19,
    rowY + pillH / 2 + 1,
    isVertical ? 26 : 24,
    fonts,
    { showDotCom: true }
  );

  // Right: Country & Duration Pill (Light Indigo/Teal Accent)
  const badgeLabel = `${blueprint.country.flag}  ${blueprint.country.name.toUpperCase()} · ${blueprint.durationSec}S REPORT`;
  ctx.font = `800 ${isVertical ? 19 : 17}px ${fonts.display}`;
  const textW = ctx.measureText(badgeLabel).width;
  const rightW = Math.min(w - padX * 2 - brandW - 20, textW + 42);
  const rightX = w - padX - rightW;
  drawRefirelyCard(ctx, rightX, rowY, rightW, pillH, 18, 'rgba(99, 102, 241, 0.3)', 'rgba(238, 242, 255, 0.96)');
  ctx.fillStyle = '#3730a3';
  ctx.textBaseline = 'middle';
  ctx.fillText(badgeLabel, rightX + 20, rowY + pillH / 2 + 1, rightW - 36);
}

function drawKineticSubtitles(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  isVertical: boolean,
  text: string,
  p: number,
  fonts: ActiveThemeFonts
) {
  const padX = isVertical ? 54 : 170;
  const bottomSafe = isVertical ? 148 : 38;
  const boxW = w - padX * 2;
  const fontSize = isVertical ? 30 : 27;
  ctx.font = `700 ${fontSize}px ${fonts.body}`;

  const lines = wrapLines(ctx, text, boxW - 58, 3);
  const lineH = fontSize * 1.36;
  const boxH = lines.length * lineH + 34;
  const boxY = h - bottomSafe - boxH;

  ctx.save();
  ctx.globalAlpha = Math.min(1, p * 6);
  drawRefirelyCard(ctx, padX, boxY, boxW, boxH, 22, 'rgba(99, 102, 241, 0.34)', 'rgba(255, 255, 255, 0.97)');

  // Signature Refirely Teal -> Indigo -> Amber accent bar on left
  drawRoundedRect(ctx, padX + 12, boxY + 14, 6, boxH - 28, 3);
  const barGrad = ctx.createLinearGradient(0, boxY + 14, 0, boxY + boxH - 14);
  barGrad.addColorStop(0, '#14b8a6');
  barGrad.addColorStop(0.5, '#6366f1');
  barGrad.addColorStop(1, '#f59e0b');
  ctx.fillStyle = barGrad;
  ctx.fill();

  ctx.fillStyle = '#0f172a';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  lines.forEach((l, i) => {
    ctx.fillText(l, w / 2 + 6, boxY + 18 + i * lineH, boxW - 54);
  });
  ctx.textAlign = 'left';
  ctx.restore();
}

// ============================================================================
// SCENE: HOOK (HERO PHOTO + REFIRELY LIGHT SNAPSHOT METRICS)
// ============================================================================

function drawSceneHook(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  isVertical: boolean,
  blueprint: PromoVideoBlueprint,
  photoImg: HTMLImageElement | null,
  p: number,
  fonts: ActiveThemeFonts
) {
  const c = blueprint.country;
  const padX = isVertical ? 54 : 72;
  const topY = isVertical ? 168 : 138;
  const availW = w - padX * 2;
  const enter = easeOutCubic(Math.min(1, p * 2.4));
  const slideY = (1 - enter) * 26;

  if (isVertical) {
    const photoH = 660;
    ctx.save();
    ctx.shadowColor = 'rgba(15, 23, 42, 0.14)';
    ctx.shadowBlur = 32;
    ctx.shadowOffsetY = 14;
    drawRoundedRect(ctx, padX, topY, availW, photoH, 34);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.restore();

    ctx.save();
    drawRoundedRect(ctx, padX, topY, availW, photoH, 34);
    ctx.clip();
    if (photoImg) {
      drawCoverPhotoZoom(ctx, photoImg, padX, topY, availW, photoH, 1.03 + p * 0.08);
    } else {
      const fb = ctx.createLinearGradient(padX, topY, padX + availW, topY + photoH);
      fb.addColorStop(0, '#0d9488');
      fb.addColorStop(0.55, '#4f46e5');
      fb.addColorStop(1, '#f59e0b');
      ctx.fillStyle = fb;
      ctx.fillRect(padX, topY, availW, photoH);
    }

    // Measured contrast scrim strictly over lower portion of photography for legibility
    const scrim = ctx.createLinearGradient(0, topY + photoH - 270, 0, topY + photoH);
    scrim.addColorStop(0, 'rgba(15, 23, 42, 0)');
    scrim.addColorStop(1, 'rgba(15, 23, 42, 0.82)');
    ctx.fillStyle = scrim;
    ctx.fillRect(padX, topY + photoH - 270, availW, 270);

    // Brand Teal -> Indigo Savings Badge top-left
    const savBadge = `SAVE ${blueprint.savingsPercentVsBaseline}% VS HIGH-COST CITIES`;
    ctx.font = `800 20px ${fonts.display}`;
    const sbW = ctx.measureText(savBadge).width + 44;
    drawRoundedRect(ctx, padX + 26, topY + 26, sbW, 48, 24);
    const pillGrad = ctx.createLinearGradient(padX + 26, topY + 26, padX + 26 + sbW, topY + 26);
    pillGrad.addColorStop(0, '#0d9488');
    pillGrad.addColorStop(1, '#4f46e5');
    ctx.fillStyle = pillGrad;
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.textBaseline = 'middle';
    ctx.fillText(savBadge, padX + 48, topY + 50);

    // Big Flag + Country Title
    ctx.fillStyle = '#ffffff';
    ctx.font = `800 74px ${fonts.display}`;
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(`${c.flag} ${c.name}`, padX + 32, topY + photoH - 76, availW - 64);

    ctx.fillStyle = '#fde68a';
    ctx.font = `700 26px ${fonts.body}`;
    ctx.fillText(`${c.region}  ·  ${c.capital}  ·  ${c.currency}`, padX + 32, topY + photoH - 32, availW - 64);
    ctx.restore();

    // Crisp white inner photo ring
    drawRoundedRect(ctx, padX, topY, availW, photoH, 34);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 4;
    ctx.stroke();

    // 3 Crisp Light KPI Tiles with Colored Top Accents
    const kpiY = topY + photoH + 30 + slideY;
    const gap = 20;
    const kw = (availW - gap * 2) / 3;
    const kh = 228;
    const kpis = [
      {
        label: 'RETIREE SOLO',
        val: `$${c.costOfLiving.monthlyBudgetSingleUSD.toLocaleString()}`,
        sub: `Couple $${c.costOfLiving.monthlyBudgetCoupleUSD.toLocaleString()}/mo`,
        accent: '#0d9488',
        border: 'rgba(20, 184, 166, 0.34)',
        tint: 'rgba(240, 253, 250, 0.96)',
      },
      {
        label: 'NOMAD BURN',
        val: `$${blueprint.nomadBurnUSD.toLocaleString()}`,
        sub: `${blueprint.fiberMbps} Mbps Fiber`,
        accent: '#4f46e5',
        border: 'rgba(99, 102, 241, 0.34)',
        tint: 'rgba(238, 242, 255, 0.96)',
      },
      {
        label: 'ANNUAL SAVINGS',
        val: `$${Math.round(blueprint.annualSavingsVsBaseline / 1000)}K/yr`,
        sub: `vs NYC $5,400/mo`,
        accent: '#d97706',
        border: 'rgba(245, 158, 11, 0.38)',
        tint: 'rgba(255, 251, 235, 0.96)',
      },
    ];

    kpis.forEach((k, idx) => {
      const kx = padX + idx * (kw + gap);
      const pop = easeOutBack(Math.max(0, Math.min(1, (p - idx * 0.12) * 2.5)));
      ctx.save();
      ctx.globalAlpha = Math.min(1, pop);
      drawRefirelyCard(ctx, kx, kpiY, kw, kh, 26, k.border, k.tint);

      // Subtle colored accent bar at top
      drawRoundedRect(ctx, kx + 22, kpiY + 14, 48, 5, 3);
      ctx.fillStyle = k.accent;
      ctx.fill();

      ctx.fillStyle = k.accent;
      ctx.font = `800 18px ${fonts.display}`;
      ctx.textBaseline = 'top';
      ctx.fillText(k.label, kx + 22, kpiY + 30);

      ctx.fillStyle = '#0f172a';
      ctx.font = `800 52px ${fonts.display}`;
      ctx.fillText(k.val, kx + 22, kpiY + 68, kw - 40);

      ctx.fillStyle = '#475569';
      ctx.font = `600 20px ${fonts.body}`;
      ctx.fillText(k.sub, kx + 22, kpiY + 150, kw - 40);
      ctx.restore();
    });

    // Visa + Tax Quick Strip (Light White Card)
    const stripY = kpiY + kh + 26;
    drawRefirelyCard(ctx, padX, stripY, availW, 330, 30, 'rgba(99, 102, 241, 0.26)', 'rgba(255, 255, 255, 0.96)');
    ctx.fillStyle = '#4f46e5';
    ctx.font = `800 20px ${fonts.display}`;
    ctx.textBaseline = 'top';
    ctx.fillText('RESIDENCY & TAX ADVANTAGE', padX + 32, stripY + 30);

    ctx.fillStyle = '#0f172a';
    ctx.font = `800 35px ${fonts.display}`;
    ctx.fillText(c.visa.retirementVisaName, padX + 32, stripY + 68, availW - 64);

    ctx.fillStyle = '#334155';
    ctx.font = `600 25px ${fonts.body}`;
    const taxLines = wrapLines(ctx, `${blueprint.taxBadgeLabel} · ${c.visa.pathwayToPR}`, availW - 64, 2);
    taxLines.forEach((l, i) => ctx.fillText(l, padX + 32, stripY + 130 + i * 36));

    // Bottom pastel score chips
    const pills = [
      { text: `☀️ ${c.climate.annualSunnyDays} Sunny Days`, bg: '#fffbeb', border: '#fcd34d', color: '#92400e' },
      { text: `🏥 Health ${c.lifestyle.healthcareScore}/100`, bg: '#f0fdfa', border: '#5eead4', color: '#115e59' },
      { text: `🛡️ Safety ${c.lifestyle.safetyScore}/100`, bg: '#eef2ff', border: '#a5b4fc', color: '#3730a3' },
    ];
    let px = padX + 32;
    const py = stripY + 242;
    ctx.font = `800 21px ${fonts.body}`;
    pills.forEach(item => {
      const tw = ctx.measureText(item.text).width + 32;
      if (px + tw < padX + availW - 20) {
        drawRoundedRect(ctx, px, py, tw, 48, 24);
        ctx.fillStyle = item.bg;
        ctx.fill();
        ctx.strokeStyle = item.border;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillStyle = item.color;
        ctx.textBaseline = 'middle';
        ctx.fillText(item.text, px + 16, py + 24);
        px += tw + 14;
      }
    });
  } else {
    // 16:9 Landscape: Left Photo (52%), Right Light Refirely KPI Grid (48%)
    const leftW = Math.round(availW * 0.52);
    const rightW = availW - leftW - 34;
    const cardH = 710;

    ctx.save();
    ctx.shadowColor = 'rgba(15, 23, 42, 0.14)';
    ctx.shadowBlur = 32;
    ctx.shadowOffsetY = 14;
    drawRoundedRect(ctx, padX, topY, leftW, cardH, 34);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.restore();

    ctx.save();
    drawRoundedRect(ctx, padX, topY, leftW, cardH, 34);
    ctx.clip();
    if (photoImg) {
      drawCoverPhotoZoom(ctx, photoImg, padX, topY, leftW, cardH, 1.03 + p * 0.08);
    } else {
      const fb = ctx.createLinearGradient(padX, topY, padX + leftW, topY + cardH);
      fb.addColorStop(0, '#0d9488');
      fb.addColorStop(0.55, '#4f46e5');
      fb.addColorStop(1, '#f59e0b');
      ctx.fillStyle = fb;
      ctx.fillRect(padX, topY, leftW, cardH);
    }
    const scrim = ctx.createLinearGradient(0, topY + cardH - 250, 0, topY + cardH);
    scrim.addColorStop(0, 'rgba(15, 23, 42, 0)');
    scrim.addColorStop(1, 'rgba(15, 23, 42, 0.84)');
    ctx.fillStyle = scrim;
    ctx.fillRect(padX, topY + cardH - 250, leftW, 250);

    const savBadge = `SAVE ${blueprint.savingsPercentVsBaseline}% VS HIGH-COST CITIES`;
    ctx.font = `800 19px ${fonts.display}`;
    const sbW = ctx.measureText(savBadge).width + 42;
    drawRoundedRect(ctx, padX + 24, topY + 24, sbW, 46, 23);
    const pillGrad = ctx.createLinearGradient(padX + 24, topY + 24, padX + 24 + sbW, topY + 24);
    pillGrad.addColorStop(0, '#0d9488');
    pillGrad.addColorStop(1, '#4f46e5');
    ctx.fillStyle = pillGrad;
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.textBaseline = 'middle';
    ctx.fillText(savBadge, padX + 44, topY + 47);

    ctx.fillStyle = '#ffffff';
    ctx.font = `800 66px ${fonts.display}`;
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(`${c.flag} ${c.name}`, padX + 30, topY + cardH - 76, leftW - 60);

    ctx.fillStyle = '#fde68a';
    ctx.font = `700 24px ${fonts.body}`;
    ctx.fillText(`${c.region} · ${c.capital} · ${c.currency}`, padX + 30, topY + cardH - 32, leftW - 60);
    ctx.restore();

    drawRoundedRect(ctx, padX, topY, leftW, cardH, 34);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.92)';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Right Column
    const rx = padX + leftW + 34;
    drawRefirelyCard(ctx, rx, topY + slideY, rightW, 240, 28, 'rgba(99, 102, 241, 0.26)', 'rgba(255, 255, 255, 0.96)');
    ctx.fillStyle = '#4f46e5';
    ctx.font = `800 18px ${fonts.display}`;
    ctx.textBaseline = 'top';
    ctx.fillText('2026 GEO-ARBITRAGE DOSSIER', rx + 30, topY + 26 + slideY);

    ctx.fillStyle = '#0f172a';
    ctx.font = `800 38px ${fonts.display}`;
    ctx.fillText(c.visa.retirementVisaName, rx + 30, topY + 62 + slideY, rightW - 60);

    ctx.fillStyle = '#334155';
    ctx.font = `600 22px ${fonts.body}`;
    const lines = wrapLines(ctx, `${blueprint.taxBadgeLabel} · ${c.tagline}`, rightW - 60, 2);
    lines.forEach((l, i) => ctx.fillText(l, rx + 30, topY + 124 + slideY + i * 32));

    const gridTop = topY + 266;
    const cw = (rightW - 22) / 2;
    const ch = 210;
    const kpis = [
      {
        label: 'RETIREE SOLO',
        val: `$${c.costOfLiving.monthlyBudgetSingleUSD.toLocaleString()}/mo`,
        sub: `Couple $${c.costOfLiving.monthlyBudgetCoupleUSD.toLocaleString()}/mo`,
        accent: '#0d9488',
        border: 'rgba(20, 184, 166, 0.34)',
        tint: 'rgba(240, 253, 250, 0.96)',
      },
      {
        label: 'NOMAD BURN',
        val: `$${blueprint.nomadBurnUSD.toLocaleString()}/mo`,
        sub: `${blueprint.fiberMbps} Mbps Fiber`,
        accent: '#4f46e5',
        border: 'rgba(99, 102, 241, 0.34)',
        tint: 'rgba(238, 242, 255, 0.96)',
      },
      {
        label: 'ANNUAL SAVINGS',
        val: `$${blueprint.annualSavingsVsBaseline.toLocaleString()}`,
        sub: `vs NYC $5,400/mo baseline`,
        accent: '#d97706',
        border: 'rgba(245, 158, 11, 0.38)',
        tint: 'rgba(255, 251, 235, 0.96)',
      },
      {
        label: 'SUN & SAFETY',
        val: `${c.climate.annualSunnyDays} Days`,
        sub: `Safety ${c.lifestyle.safetyScore} · Health ${c.lifestyle.healthcareScore}`,
        accent: '#7c3aed',
        border: 'rgba(139, 92, 246, 0.32)',
        tint: 'rgba(245, 243, 255, 0.96)',
      },
    ];
    kpis.forEach((k, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const kx = rx + col * (cw + 22);
      const ky = gridTop + row * (ch + 22);
      const pop = easeOutBack(Math.max(0, Math.min(1, (p - idx * 0.1) * 2.4)));
      ctx.save();
      ctx.globalAlpha = Math.min(1, pop);
      drawRefirelyCard(ctx, kx, ky, cw, ch, 24, k.border, k.tint);

      drawRoundedRect(ctx, kx + 24, ky + 14, 48, 5, 3);
      ctx.fillStyle = k.accent;
      ctx.fill();

      ctx.fillStyle = k.accent;
      ctx.font = `800 17px ${fonts.display}`;
      ctx.textBaseline = 'top';
      ctx.fillText(k.label, kx + 24, ky + 28);

      ctx.fillStyle = '#0f172a';
      ctx.font = `800 44px ${fonts.display}`;
      ctx.fillText(k.val, kx + 24, ky + 64, cw - 44);

      ctx.fillStyle = '#475569';
      ctx.font = `600 20px ${fonts.body}`;
      ctx.fillText(k.sub, kx + 24, ky + 138, cw - 44);
      ctx.restore();
    });
  }
}

// ============================================================================
// SCENE: COST & TAX COMPARISON ANIMATED BAR CHARTS
// ============================================================================

function drawSceneCostTax(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  isVertical: boolean,
  blueprint: PromoVideoBlueprint,
  p: number,
  fonts: ActiveThemeFonts
) {
  const c = blueprint.country;
  const padX = isVertical ? 54 : 72;
  const topY = isVertical ? 172 : 142;
  const availW = w - padX * 2;
  const anim = easeOutCubic(Math.min(1, p * 1.55));

  ctx.fillStyle = '#4f46e5';
  ctx.font = `800 22px ${fonts.display}`;
  ctx.textBaseline = 'top';
  ctx.fillText('COST ARBITRAGE & TAX COMPARISON', padX, topY);

  ctx.fillStyle = '#0f172a';
  ctx.font = `800 ${isVertical ? 52 : 46}px ${fonts.display}`;
  ctx.fillText(`${c.flag} Monthly Cost vs. Benchmark`, padX, topY + 34, availW);

  const cardsTop = topY + (isVertical ? 118 : 100);

  const rows: Array<{ label: string; value: number; colorStart: string; colorEnd: string; highlight: boolean }> = [
    {
      label: `${c.flag} ${c.name} (Retiree Solo)`,
      value: c.costOfLiving.monthlyBudgetSingleUSD,
      colorStart: '#0d9488',
      colorEnd: '#10b981',
      highlight: true,
    },
    {
      label: `💻 ${c.name} (Nomad Burn)`,
      value: blueprint.nomadBurnUSD,
      colorStart: '#4f46e5',
      colorEnd: '#0ea5e9',
      highlight: false,
    },
  ];
  if (blueprint.comparisonCountry) {
    rows.push({
      label: `${blueprint.comparisonCountry.flag} ${blueprint.comparisonCountry.name} (Comparison)`,
      value: blueprint.comparisonCountry.costOfLiving.monthlyBudgetSingleUSD,
      colorStart: '#7c3aed',
      colorEnd: '#a78bfa',
      highlight: false,
    });
  }
  rows.push({
    label: `🏙️ High-Cost City (NYC / London)`,
    value: blueprint.highCostBaselineMonthly,
    colorStart: '#e11d48',
    colorEnd: '#fb7185',
    highlight: false,
  });

  const maxVal = Math.max(...rows.map(r => r.value), 5500) * 1.08;

  const drawBarChartCard = (x: number, y: number, cw: number, ch: number) => {
    drawRefirelyCard(ctx, x, y, cw, ch, 32, 'rgba(20, 184, 166, 0.3)', 'rgba(255, 255, 255, 0.96)');
    ctx.fillStyle = '#0d9488';
    ctx.font = `800 20px ${fonts.display}`;
    ctx.textBaseline = 'top';
    ctx.fillText('MONTHLY LIVING COST ($ USD · LOWER = HIGHER FIRE RUNWAY)', x + 32, y + 30, cw - 64);

    const startY = y + 86;
    const step = (ch - 116) / rows.length;
    const trackW = cw - 64;

    rows.forEach((row, idx) => {
      const ry = startY + idx * step;
      const ratio = Math.max(0.12, (row.value / maxVal) * anim);

      ctx.fillStyle = row.highlight ? '#0f766e' : '#1e293b';
      ctx.font = `${row.highlight ? 800 : 700} 25px ${fonts.body}`;
      ctx.fillText(row.label, x + 32, ry, trackW - 190);

      ctx.textAlign = 'right';
      ctx.fillStyle = row.highlight ? '#059669' : '#0f172a';
      ctx.font = `800 26px ${fonts.mono}`;
      ctx.fillText(`$${Math.round(row.value * anim).toLocaleString()}/mo`, x + cw - 32, ry);
      ctx.textAlign = 'left';

      const barY = ry + 38;
      const barH = 34;
      drawRoundedRect(ctx, x + 32, barY, trackW, barH, 12);
      ctx.fillStyle = '#f1f5f9';
      ctx.fill();

      const fillW = Math.max(40, trackW * ratio);
      drawRoundedRect(ctx, x + 32, barY, fillW, barH, 12);
      const grad = ctx.createLinearGradient(x + 32, barY, x + 32 + fillW, barY);
      grad.addColorStop(0, row.colorStart);
      grad.addColorStop(1, row.colorEnd);
      ctx.fillStyle = grad;
      ctx.fill();
    });
  };

  const drawTaxVisaSummaryCard = (x: number, y: number, cw: number, ch: number) => {
    drawRefirelyCard(ctx, x, y, cw, ch, 32, 'rgba(99, 102, 241, 0.28)', 'rgba(255, 255, 255, 0.96)');

    // Annual Savings Callout Banner (Light Emerald-Teal Pastel)
    drawRoundedRect(ctx, x + 28, y + 28, cw - 56, 118, 22);
    const savGrad = ctx.createLinearGradient(x + 28, y + 28, x + cw - 28, y + 28);
    savGrad.addColorStop(0, '#ecfdf5');
    savGrad.addColorStop(1, '#f0fdfa');
    ctx.fillStyle = savGrad;
    ctx.fill();
    ctx.strokeStyle = '#6ee7b7';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#065f46';
    ctx.font = `800 18px ${fonts.display}`;
    ctx.textBaseline = 'top';
    ctx.fillText('ANNUAL GEO-ARBITRAGE SAVINGS VS HIGH-COST CITY', x + 50, y + 44, cw - 100);

    ctx.fillStyle = '#047857';
    ctx.font = `800 46px ${fonts.display}`;
    ctx.fillText(
      `$${Math.round(blueprint.annualSavingsVsBaseline * anim).toLocaleString()} / yr (${blueprint.savingsPercentVsBaseline}% Less)`,
      x + 50,
      y + 76,
      cw - 100
    );

    // Visa & Tax Rows
    const blockY = y + 174;
    ctx.fillStyle = '#d97706';
    ctx.font = `800 19px ${fonts.display}`;
    ctx.fillText('🛂 VISA PATHWAY & INCOME THRESHOLD', x + 32, blockY);

    ctx.fillStyle = '#0f172a';
    ctx.font = `800 32px ${fonts.display}`;
    ctx.fillText(c.visa.retirementVisaName, x + 32, blockY + 34, cw - 64);

    ctx.fillStyle = '#475569';
    ctx.font = `700 22px ${fonts.body}`;
    ctx.fillText(
      `Min Income: ${c.visa.minimumIncomeUSD > 0 ? `$${c.visa.minimumIncomeUSD.toLocaleString()}/mo` : 'Flexible'}   ·   Processing: ${c.visa.processingMonths} mo   ·   ${c.visa.pathwayToPR}`,
      x + 32,
      blockY + 80,
      cw - 64
    );

    ctx.fillStyle = '#4f46e5';
    ctx.font = `800 19px ${fonts.display}`;
    ctx.fillText('🏛️ TAX REGIME HIGHLIGHTS', x + 32, blockY + 140);

    ctx.fillStyle = '#334155';
    ctx.font = `600 24px ${fonts.body}`;
    const taxLines = wrapLines(ctx, `${blueprint.taxBadgeLabel} — ${c.visa.taxStatus}`, cw - 64, 3);
    taxLines.forEach((l, i) => ctx.fillText(l, x + 32, blockY + 174 + i * 34));
  };

  if (isVertical) {
    drawBarChartCard(padX, cardsTop, availW, 560);
    drawTaxVisaSummaryCard(padX, cardsTop + 590, availW, 540);
  } else {
    const colW = (availW - 34) / 2;
    drawBarChartCard(padX, cardsTop, colW, 610);
    drawTaxVisaSummaryCard(padX + colW + 34, cardsTop, colW, 610);
  }
}

// ============================================================================
// SCENE: VISA & TAX DEEP DIVE (USED IN 30-SECOND MODE)
// ============================================================================

function drawSceneVisaTax(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  isVertical: boolean,
  blueprint: PromoVideoBlueprint,
  p: number,
  fonts: ActiveThemeFonts
) {
  const c = blueprint.country;
  const padX = isVertical ? 54 : 72;
  const topY = isVertical ? 172 : 142;
  const availW = w - padX * 2;
  const reveal = easeOutCubic(Math.min(1, p * 1.8));

  ctx.fillStyle = '#ea580c';
  ctx.font = `800 22px ${fonts.display}`;
  ctx.textBaseline = 'top';
  ctx.fillText('VISA PATHWAY, TAX REGIME & RESIDENCY', padX, topY);

  ctx.fillStyle = '#0f172a';
  ctx.font = `800 ${isVertical ? 50 : 46}px ${fonts.display}`;
  ctx.fillText(`${c.flag} How to Move to ${c.name}`, padX, topY + 34, availW);

  const cardsTop = topY + (isVertical ? 118 : 100);

  const drawVisaBlueprint = (x: number, y: number, cw: number, ch: number) => {
    drawRefirelyCard(ctx, x, y, cw, ch, 32, 'rgba(99, 102, 241, 0.28)', 'rgba(255, 255, 255, 0.96)');
    ctx.fillStyle = '#0d9488';
    ctx.font = `800 20px ${fonts.display}`;
    ctx.textBaseline = 'top';
    ctx.fillText('PRIMARY RETIREMENT & NOMAD VISAS', x + 32, y + 32);

    ctx.fillStyle = '#0f172a';
    ctx.font = `800 36px ${fonts.display}`;
    ctx.fillText(c.visa.retirementVisaName, x + 32, y + 70, cw - 64);

    ctx.fillStyle = '#4f46e5';
    ctx.font = `700 23px ${fonts.body}`;
    ctx.fillText(`Remote Work Option: ${blueprint.remoteWorkVisaName}`, x + 32, y + 120, cw - 64);

    // 3 Clean Pastel Metric Tiles
    const ty = y + 174;
    const tw = (cw - 64 - 28) / 3;
    const tiles = [
      { label: 'MIN INCOME', val: c.visa.minimumIncomeUSD > 0 ? `$${c.visa.minimumIncomeUSD.toLocaleString()}/mo` : 'Flexible', accent: '#0d9488', bg: '#f0fdfa', border: '#99f6e4' },
      { label: 'APPROVAL', val: `${c.visa.processingMonths} Months`, accent: '#4f46e5', bg: '#eef2ff', border: '#c7d2fe' },
      { label: 'WORK RIGHTS', val: c.visa.allowedToWork ? 'Allowed ✓' : 'Passive', accent: '#d97706', bg: '#fffbeb', border: '#fde68a' },
    ];
    tiles.forEach((t, idx) => {
      const tx = x + 32 + idx * (tw + 14);
      drawRoundedRect(ctx, tx, ty, tw, 112, 18);
      ctx.fillStyle = t.bg;
      ctx.fill();
      ctx.strokeStyle = t.border;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = t.accent;
      ctx.font = `800 17px ${fonts.display}`;
      ctx.fillText(t.label, tx + 18, ty + 20);
      ctx.fillStyle = '#0f172a';
      ctx.font = `800 29px ${fonts.display}`;
      ctx.fillText(t.val, tx + 18, ty + 56, tw - 32);
    });

    // Checklist Requirements
    ctx.fillStyle = '#64748b';
    ctx.font = `800 18px ${fonts.display}`;
    ctx.fillText('KEY APPLICATION CHECKLIST', x + 32, ty + 144);

    const reqs = (c.visa.keyRequirements || []).slice(0, 3);
    reqs.forEach((req, idx) => {
      const ry = ty + 182 + idx * 66;
      ctx.save();
      ctx.globalAlpha = Math.min(1, Math.max(0, (p - idx * 0.12) * 3));
      ctx.fillStyle = '#0d9488';
      ctx.font = `800 24px ${fonts.display}`;
      ctx.fillText('✓', x + 32, ry);
      ctx.fillStyle = '#1e293b';
      ctx.font = `600 22px ${fonts.body}`;
      const rl = wrapLines(ctx, req, cw - 92, 2);
      rl.forEach((l, li) => ctx.fillText(l, x + 64, ry + li * 28));
      ctx.restore();
    });
  };

  const drawTaxCard = (x: number, y: number, cw: number, ch: number) => {
    drawRefirelyCard(ctx, x, y, cw, ch, 32, 'rgba(245, 158, 11, 0.34)', 'rgba(255, 255, 255, 0.96)');
    ctx.fillStyle = '#d97706';
    ctx.font = `800 20px ${fonts.display}`;
    ctx.textBaseline = 'top';
    ctx.fillText('🏛️ EXPAT TAX & PR ROADMAP', x + 32, y + 32);

    // Warm Amber Tax Regime Highlight Pill
    drawRoundedRect(ctx, x + 32, y + 76, cw - 64, 88, 20);
    ctx.fillStyle = '#fffbeb';
    ctx.fill();
    ctx.strokeStyle = '#fcd34d';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#92400e';
    ctx.font = `800 30px ${fonts.display}`;
    ctx.textBaseline = 'middle';
    ctx.fillText(blueprint.taxBadgeLabel, x + 54, y + 120, cw - 108);

    ctx.textBaseline = 'top';
    ctx.fillStyle = '#334155';
    ctx.font = `600 25px ${fonts.body}`;
    const taxLines = wrapLines(ctx, c.visa.taxStatus, cw - 64, 4);
    taxLines.forEach((l, i) => ctx.fillText(l, x + 32, y + 194 + i * 36));

    // PR Pathway highlight box at bottom (Light Emerald-Teal)
    const prY = y + ch - 148;
    ctx.save();
    ctx.globalAlpha = reveal;
    drawRoundedRect(ctx, x + 32, prY, cw - 64, 114, 20);
    ctx.fillStyle = '#ecfdf5';
    ctx.fill();
    ctx.strokeStyle = '#6ee7b7';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#047857';
    ctx.font = `800 18px ${fonts.display}`;
    ctx.fillText('PERMANENT RESIDENCY & CITIZENSHIP', x + 52, prY + 22);
    ctx.fillStyle = '#0f172a';
    ctx.font = `800 28px ${fonts.display}`;
    ctx.fillText(c.visa.pathwayToPR, x + 52, prY + 56, cw - 104);
    ctx.restore();
  };

  if (isVertical) {
    drawVisaBlueprint(padX, cardsTop, availW, 600);
    drawTaxCard(padX, cardsTop + 628, availW, 495);
  } else {
    const colW = (availW - 34) / 2;
    drawVisaBlueprint(padX, cardsTop, colW, 610);
    drawTaxCard(padX + colW + 34, cardsTop, colW, 610);
  }
}

// ============================================================================
// SCENE: 4-AXIS ANIMATED RADAR CHART + LIVE SCORE BARS
// ============================================================================

function drawAnimatedRadar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  maxR: number,
  axes: Array<{ label: string; value: number; peerValue?: number }>,
  anim: number,
  fonts: ActiveThemeFonts
) {
  const n = axes.length;
  const startAngle = -Math.PI / 2;

  // Concentric radar grid polygons (25%, 50%, 75%, 100%)
  for (let ring = 1; ring <= 4; ring++) {
    const r = (maxR * ring) / 4;
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const a = startAngle + (i * Math.PI * 2) / n;
      const px = cx + Math.cos(a) * r;
      const py = cy + Math.sin(a) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.strokeStyle = ring === 4 ? 'rgba(99, 102, 241, 0.36)' : 'rgba(148, 163, 184, 0.28)';
    ctx.lineWidth = ring === 4 ? 2 : 1.5;
    ctx.stroke();
  }

  // Axis spokes & crisp dark labels
  for (let i = 0; i < n; i++) {
    const a = startAngle + (i * Math.PI * 2) / n;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(a) * maxR, cy + Math.sin(a) * maxR);
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    const lx = cx + Math.cos(a) * (maxR + 36);
    const ly = cy + Math.sin(a) * (maxR + 32);
    ctx.fillStyle = '#1e293b';
    ctx.font = `800 20px ${fonts.display}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(axes[i].label, lx, ly);
  }
  ctx.textAlign = 'left';

  // Comparison Peer polygon (Indigo outline if available)
  if (axes.every(ax => typeof ax.peerValue === 'number')) {
    ctx.beginPath();
    axes.forEach((ax, i) => {
      const a = startAngle + (i * Math.PI * 2) / n;
      const r = maxR * Math.min(1, Math.max(0.1, (ax.peerValue || 50) / 100)) * anim;
      const px = cx + Math.cos(a) * r;
      const py = cy + Math.sin(a) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.closePath();
    ctx.fillStyle = 'rgba(99, 102, 241, 0.14)';
    ctx.fill();
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 2.5;
    ctx.stroke();
  }

  // Target Country Vibrant Teal-Emerald Radar Polygon
  ctx.beginPath();
  axes.forEach((ax, i) => {
    const a = startAngle + (i * Math.PI * 2) / n;
    const r = maxR * Math.min(1, Math.max(0.12, ax.value / 100)) * anim;
    const px = cx + Math.cos(a) * r;
    const py = cy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  });
  ctx.closePath();
  ctx.fillStyle = 'rgba(13, 148, 136, 0.24)';
  ctx.fill();
  ctx.strokeStyle = '#0d9488';
  ctx.lineWidth = 3.5;
  ctx.stroke();

  // Crisp vertex dots
  axes.forEach((ax, i) => {
    const a = startAngle + (i * Math.PI * 2) / n;
    const r = maxR * Math.min(1, Math.max(0.12, ax.value / 100)) * anim;
    const px = cx + Math.cos(a) * r;
    const py = cy + Math.sin(a) * r;
    ctx.beginPath();
    ctx.arc(px, py, 7.5, 0, Math.PI * 2);
    ctx.fillStyle = '#0d9488';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.stroke();
  });
}

function drawSceneScoresRadar(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  isVertical: boolean,
  blueprint: PromoVideoBlueprint,
  p: number,
  fonts: ActiveThemeFonts
) {
  const c = blueprint.country;
  const peer = blueprint.comparisons.find(x => x.role === 'peer');
  const padX = isVertical ? 54 : 72;
  const topY = isVertical ? 172 : 142;
  const availW = w - padX * 2;
  const anim = easeOutCubic(Math.min(1, p * 1.55));

  ctx.fillStyle = '#4f46e5';
  ctx.font = `800 22px ${fonts.display}`;
  ctx.textBaseline = 'top';
  ctx.fillText('HEALTHCARE, SAFETY, SUNSHINE & FIBER SPEED', padX, topY);

  ctx.fillStyle = '#0f172a';
  ctx.font = `800 ${isVertical ? 50 : 46}px ${fonts.display}`;
  ctx.fillText(`${c.flag} Livability & Infrastructure Index`, padX, topY + 34, availW);

  const cardsTop = topY + (isVertical ? 118 : 100);

  const sunScore = Math.min(100, Math.round((c.climate.annualSunnyDays / 340) * 100));
  const fiberScore = Math.min(100, Math.round((blueprint.fiberMbps / 300) * 100));
  const peerSunScore = peer ? Math.min(100, Math.round((peer.sunnyDays / 340) * 100)) : undefined;
  const peerFiberScore = peer ? Math.min(100, Math.round((peer.fiberMbps / 300) * 100)) : undefined;

  const radarAxes = [
    { label: 'HEALTHCARE', value: c.lifestyle.healthcareScore, peerValue: peer?.healthcareScore },
    { label: 'FIBER Mbps', value: fiberScore, peerValue: peerFiberScore },
    { label: 'SUNSHINE', value: sunScore, peerValue: peerSunScore },
    { label: 'SAFETY', value: c.lifestyle.safetyScore, peerValue: peer?.safetyScore },
  ];

  const barMetrics = [
    { label: '🏥 Healthcare Quality', display: `${c.lifestyle.healthcareScore} / 100`, pct: c.lifestyle.healthcareScore / 100, color: '#0d9488' },
    { label: '🛡️ Safety & Stability', display: `${c.lifestyle.safetyScore} / 100`, pct: c.lifestyle.safetyScore / 100, color: '#4f46e5' },
    { label: '☀️ Annual Sunshine', display: `${c.climate.annualSunnyDays} Days / yr`, pct: sunScore / 100, color: '#f59e0b' },
    { label: '⚡ Verified Fiber Speed', display: `${blueprint.fiberMbps} Mbps`, pct: fiberScore / 100, color: '#ea580c' },
  ];

  const drawRadarCard = (x: number, y: number, cw: number, ch: number) => {
    drawRefirelyCard(ctx, x, y, cw, ch, 32, 'rgba(20, 184, 166, 0.32)', 'rgba(255, 255, 255, 0.96)');
    ctx.fillStyle = '#0f766e';
    ctx.font = `800 19px ${fonts.display}`;
    ctx.textBaseline = 'top';
    ctx.fillText(
      peer ? `● ${c.name} (Teal)   ● ${peer.name} (Indigo)` : `● ${c.name} 4-Axis Profile`,
      x + 32,
      y + 28,
      cw - 64
    );

    const maxR = Math.min(cw * 0.31, ch * 0.35);
    drawAnimatedRadar(ctx, x + cw / 2, y + ch / 2 + 18, maxR, radarAxes, anim, fonts);
  };

  const drawScoreBarsCard = (x: number, y: number, cw: number, ch: number) => {
    drawRefirelyCard(ctx, x, y, cw, ch, 32, 'rgba(99, 102, 241, 0.28)', 'rgba(255, 255, 255, 0.96)');
    ctx.fillStyle = '#4f46e5';
    ctx.font = `800 20px ${fonts.display}`;
    ctx.textBaseline = 'top';
    ctx.fillText('VERIFIED DOSSIER SCORES', x + 32, y + 30);

    const startY = y + 84;
    const step = (ch - 110) / barMetrics.length;
    const barW = cw - 64;

    barMetrics.forEach((m, idx) => {
      const my = startY + idx * step;
      ctx.fillStyle = '#1e293b';
      ctx.font = `700 25px ${fonts.body}`;
      ctx.fillText(m.label, x + 32, my);

      ctx.textAlign = 'right';
      ctx.fillStyle = m.color;
      ctx.font = `800 25px ${fonts.mono}`;
      ctx.fillText(m.display, x + cw - 32, my);
      ctx.textAlign = 'left';

      drawRoundedRect(ctx, x + 32, my + 38, barW, 28, 12);
      ctx.fillStyle = '#f1f5f9';
      ctx.fill();

      drawRoundedRect(ctx, x + 32, my + 38, Math.max(36, barW * m.pct * anim), 28, 12);
      ctx.fillStyle = m.color;
      ctx.fill();
    });
  };

  if (isVertical) {
    drawRadarCard(padX, cardsTop, availW, 560);
    drawScoreBarsCard(padX, cardsTop + 588, availW, 540);
  } else {
    const colW = (availW - 34) / 2;
    drawRadarCard(padX, cardsTop, colW, 610);
    drawScoreBarsCard(padX + colW + 34, cardsTop, colW, 610);
  }
}

// ============================================================================
// SCENE: HONEST PROS & CONS + TOP EXPAT CITIES (30s MODE)
// ============================================================================

function drawSceneProsCons(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  isVertical: boolean,
  blueprint: PromoVideoBlueprint,
  p: number,
  fonts: ActiveThemeFonts
) {
  const c = blueprint.country;
  const padX = isVertical ? 54 : 72;
  const topY = isVertical ? 172 : 142;
  const availW = w - padX * 2;

  ctx.fillStyle = '#0d9488';
  ctx.font = `800 22px ${fonts.display}`;
  ctx.textBaseline = 'top';
  ctx.fillText('REALISTIC EXPAT REALITY CHECK', padX, topY);

  ctx.fillStyle = '#0f172a';
  ctx.font = `800 ${isVertical ? 50 : 46}px ${fonts.display}`;
  ctx.fillText(`${c.flag} Honest Pros & Watchouts`, padX, topY + 34, availW);

  const cardsTop = topY + (isVertical ? 118 : 100);

  const drawList = (
    x: number,
    y: number,
    cw: number,
    ch: number,
    title: string,
    items: string[],
    isPro: boolean
  ) => {
    const border = isPro ? 'rgba(16, 185, 129, 0.38)' : 'rgba(244, 63, 94, 0.36)';
    const bg = isPro ? 'rgba(240, 253, 244, 0.96)' : 'rgba(255, 241, 242, 0.96)';
    const titleColor = isPro ? '#047857' : '#be123c';
    const dotBg = isPro ? '#10b981' : '#f43f5e';
    const sym = isPro ? '✓' : '!';

    drawRefirelyCard(ctx, x, y, cw, ch, 30, border, bg);
    ctx.fillStyle = titleColor;
    ctx.font = `800 23px ${fonts.display}`;
    ctx.textBaseline = 'top';
    ctx.fillText(title, x + 32, y + 28);

    const step = (ch - 102) / Math.max(1, items.length);
    items.forEach((item, idx) => {
      const reveal = easeOutCubic(Math.max(0, Math.min(1, (p - idx * 0.14) * 2.5)));
      const iy = y + 82 + idx * step;
      ctx.save();
      ctx.globalAlpha = reveal;

      ctx.beginPath();
      ctx.arc(x + 50, iy + 22, 19, 0, Math.PI * 2);
      ctx.fillStyle = dotBg;
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = `800 22px ${fonts.display}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(sym, x + 50, iy + 23);
      ctx.textAlign = 'left';

      ctx.fillStyle = '#0f172a';
      ctx.font = `700 25px ${fonts.body}`;
      ctx.textBaseline = 'top';
      const lines = wrapLines(ctx, item, cw - 118, 2);
      lines.forEach((l, li) => ctx.fillText(l, x + 84, iy + 4 + li * 33));
      ctx.restore();
    });
  };

  if (isVertical) {
    drawList(padX, cardsTop, availW, 470, '✅ TOP ADVANTAGES', c.pros.slice(0, 3), true);
    drawList(padX, cardsTop + 498, availW, 430, '⚠️ REAL TRADE-OFFS', c.cons.slice(0, 3), false);

    // Top Expat Hubs Strip
    const cityY = cardsTop + 954;
    drawRefirelyCard(ctx, padX, cityY, availW, 175, 26, 'rgba(99, 102, 241, 0.28)', 'rgba(255, 255, 255, 0.96)');
    ctx.fillStyle = '#4f46e5';
    ctx.font = `800 19px ${fonts.display}`;
    ctx.textBaseline = 'top';
    ctx.fillText('🏙️ TOP EXPAT HUBS & MONTHLY BUDGETS', padX + 30, cityY + 24);

    const cities = c.topCities.slice(0, 3);
    const chipW = (availW - 60 - 28) / Math.max(1, cities.length);
    cities.forEach((city, idx) => {
      const cx = padX + 30 + idx * (chipW + 14);
      drawRoundedRect(ctx, cx, cityY + 62, chipW, 86, 16);
      ctx.fillStyle = '#f8fafc';
      ctx.fill();
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = '#0f172a';
      ctx.font = `800 21px ${fonts.display}`;
      ctx.fillText(city.name, cx + 16, cityY + 78, chipW - 30);
      ctx.fillStyle = '#0d9488';
      ctx.font = `800 22px ${fonts.mono}`;
      ctx.fillText(`$${city.monthlyCostUSD.toLocaleString()}/mo`, cx + 16, cityY + 112, chipW - 30);
    });
  } else {
    const colW = (availW - 32) / 2;
    drawList(padX, cardsTop, colW, 450, '✅ TOP ADVANTAGES', c.pros.slice(0, 3), true);
    drawList(padX + colW + 32, cardsTop, colW, 450, '⚠️ REAL TRADE-OFFS', c.cons.slice(0, 3), false);

    const cityY = cardsTop + 476;
    drawRefirelyCard(ctx, padX, cityY, availW, 136, 26, 'rgba(99, 102, 241, 0.28)', 'rgba(255, 255, 255, 0.96)');
    ctx.fillStyle = '#4f46e5';
    ctx.font = `800 18px ${fonts.display}`;
    ctx.textBaseline = 'top';
    ctx.fillText('🏙️ TOP EXPAT CITIES', padX + 30, cityY + 20);

    const cities = c.topCities.slice(0, 3);
    const chipW = (availW - 60 - 32) / Math.max(1, cities.length);
    cities.forEach((city, idx) => {
      const cx = padX + 30 + idx * (chipW + 16);
      drawRoundedRect(ctx, cx, cityY + 52, chipW, 64, 16);
      ctx.fillStyle = '#f8fafc';
      ctx.fill();
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = '#0f172a';
      ctx.font = `800 22px ${fonts.display}`;
      ctx.textBaseline = 'middle';
      ctx.fillText(city.name, cx + 18, cityY + 84, chipW - 156);
      ctx.fillStyle = '#0d9488';
      ctx.font = `800 21px ${fonts.mono}`;
      ctx.textAlign = 'right';
      ctx.fillText(`$${city.monthlyCostUSD.toLocaleString()}/mo`, cx + chipW - 18, cityY + 84);
      ctx.textAlign = 'left';
    });
  }
}

// ============================================================================
// SCENE: BRANDED REFIRELY.COM LIGHT END CARD
// ============================================================================

function drawSceneOutro(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  isVertical: boolean,
  blueprint: PromoVideoBlueprint,
  logoImg: HTMLImageElement | null,
  p: number,
  fonts: ActiveThemeFonts
) {
  const c = blueprint.country;
  const cx = w / 2;
  const cy = isVertical ? h * 0.47 : h * 0.49;
  const pop = easeOutBack(Math.min(1, p * 2.1));

  // Soft radiating Indigo & Teal rings behind end card
  for (let i = 0; i < 3; i++) {
    const phase = (p * 1.35 + i * 0.33) % 1;
    const radius = (isVertical ? 190 : 170) + phase * (isVertical ? 380 : 360);
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle =
      i % 2 === 0
        ? `rgba(99, 102, 241, ${(1 - phase) * 0.28})`
        : `rgba(20, 184, 166, ${(1 - phase) * 0.28})`;
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  const cardW = isVertical ? w - 108 : 1320;
  const cardH = isVertical ? 1040 : 655;
  const cardX = cx - cardW / 2;
  const cardY = cy - cardH / 2;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(0.92 + 0.08 * pop, 0.92 + 0.08 * pop);
  ctx.translate(-cx, -cy);

  drawRefirelyCard(ctx, cardX, cardY, cardW, cardH, 42, 'rgba(99, 102, 241, 0.34)', 'rgba(255, 255, 255, 0.98)');

  // Signature multi-colored top accent stripe inside the card
  ctx.save();
  drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 42);
  ctx.clip();
  const topStripe = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY);
  topStripe.addColorStop(0, '#14b8a6');
  topStripe.addColorStop(0.5, '#6366f1');
  topStripe.addColorStop(1, '#f59e0b');
  ctx.fillStyle = topStripe;
  ctx.fillRect(cardX, cardY, cardW, 12);
  ctx.restore();

  // Squircle ReFIREly Logo + Multi-Colored Wordmark
  const logoY = cardY + (isVertical ? 66 : 48);
  const logoSize = isVertical ? 116 : 94;
  drawSquircleLogo(ctx, cx - logoSize / 2, logoY, logoSize, logoImg);

  const wordmarkY = logoY + logoSize + (isVertical ? 42 : 34);
  drawRefirelyWordmark(ctx, cx, wordmarkY, isVertical ? 52 : 44, fonts, {
    showDotCom: false,
    centered: true,
    underline: true,
  });

  // Country Dossier Pastel Pill
  const badgeY = wordmarkY + (isVertical ? 50 : 40);
  const badgeText = `${c.flag} FULL ${c.name.toUpperCase()} DOSSIER · $${c.costOfLiving.monthlyBudgetSingleUSD.toLocaleString()}/MO`;
  ctx.font = `800 21px ${fonts.display}`;
  const bw = Math.min(cardW - 80, ctx.measureText(badgeText).width + 54);
  drawRoundedRect(ctx, cx - bw / 2, badgeY, bw, 46, 23);
  ctx.fillStyle = '#eef2ff';
  ctx.fill();
  ctx.strokeStyle = '#a5b4fc';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#3730a3';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(badgeText, cx, badgeY + 23, bw - 28);

  // Required Bold Call-To-Action Headline
  ctx.fillStyle = '#0f172a';
  ctx.font = `800 ${isVertical ? 58 : 54}px ${fonts.display}`;
  ctx.textBaseline = 'top';
  ctx.fillText('Compare 209 Global Havens', cx, badgeY + (isVertical ? 76 : 62), cardW - 80);

  const ctaLineY = badgeY + (isVertical ? 148 : 126);
  const ctaTextGrad = ctx.createLinearGradient(cx - 280, ctaLineY, cx + 280, ctaLineY);
  ctaTextGrad.addColorStop(0, '#0d9488');
  ctaTextGrad.addColorStop(0.5, '#4f46e5');
  ctaTextGrad.addColorStop(1, '#ea580c');
  ctx.fillStyle = ctaTextGrad;
  ctx.font = `800 ${isVertical ? 60 : 54}px ${fonts.display}`;
  ctx.fillText('Free at Refirely.com', cx, ctaLineY, cardW - 80);

  // 4 Pastel Feature Chips matching Refirely UI
  const features = [
    { label: '📊 Cost & Tax Charts', bg: '#f0fdfa', border: '#99f6e4', text: '#115e59' },
    { label: '🛂 Global Visa Check', bg: '#eef2ff', border: '#c7d2fe', text: '#3730a3' },
    { label: '🧮 FIRE Runway Calc', bg: '#fffbeb', border: '#fde68a', text: '#92400e' },
    { label: '✈️ Scout & Hop Trips', bg: '#fdf2f8', border: '#fbcfe8', text: '#9d174d' },
  ];
  const featY = badgeY + (isVertical ? 250 : 210);
  if (isVertical) {
    const fw = (cardW - 108) / 2;
    features.forEach((f, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const fx = cardX + 44 + col * (fw + 20);
      const fy = featY + row * 76;
      drawRoundedRect(ctx, fx, fy, fw, 60, 18);
      ctx.fillStyle = f.bg;
      ctx.fill();
      ctx.strokeStyle = f.border;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = f.text;
      ctx.font = `800 22px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(f.label, fx + fw / 2, fy + 30, fw - 20);
    });
  } else {
    const fw = (cardW - 140) / 4;
    features.forEach((f, idx) => {
      const fx = cardX + 40 + idx * (fw + 20);
      drawRoundedRect(ctx, fx, featY, fw, 60, 18);
      ctx.fillStyle = f.bg;
      ctx.fill();
      ctx.strokeStyle = f.border;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = f.text;
      ctx.font = `800 20px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(f.label, fx + fw / 2, fyCenter(featY, 60), fw - 18);
    });
  }

  // Prominent Signature Refirely Gradient CTA Button
  const ctaW = isVertical ? 690 : 640;
  const ctaH = isVertical ? 108 : 92;
  const ctaY = cardY + cardH - ctaH - (isVertical ? 96 : 62);
  const pulse = 1 + Math.sin(p * Math.PI * 5) * 0.02;

  ctx.save();
  ctx.translate(cx, ctaY + ctaH / 2);
  ctx.scale(pulse, pulse);
  ctx.shadowColor = 'rgba(79, 70, 229, 0.32)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 8;
  drawRoundedRect(ctx, -ctaW / 2, -ctaH / 2, ctaW, ctaH, 28);
  const grad = ctx.createLinearGradient(-ctaW / 2, 0, ctaW / 2, 0);
  grad.addColorStop(0, '#0d9488');
  grad.addColorStop(0.5, '#4f46e5');
  grad.addColorStop(1, '#f59e0b');
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.shadowColor = 'transparent';

  ctx.fillStyle = '#ffffff';
  ctx.font = `800 ${isVertical ? 46 : 42}px ${fonts.display}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Refirely.com →', 0, 2);
  ctx.restore();

  ctx.fillStyle = '#475569';
  ctx.font = `700 22px ${fonts.body}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('100% Free to Explore · Where Your Freedom Goes Further', cx, ctaY + ctaH + 22);
  ctx.textAlign = 'left';
  ctx.restore();
}

function fyCenter(y: number, h: number): number {
  return y + h / 2;
}

// ============================================================================
// MASTER FRAME RENDERER
// ============================================================================

export function renderPromoVideoFrame(params: {
  ctx: CanvasRenderingContext2D;
  orientation: VideoOrientation;
  blueprint: PromoVideoBlueprint;
  scenes: VideoSceneSpec[];
  currentTimeSec: number;
  photoImg: HTMLImageElement | null;
  logoImg: HTMLImageElement | null;
}) {
  const { ctx, orientation, blueprint, scenes, currentTimeSec, photoImg, logoImg } = params;
  const { width: w, height: h } = VIDEO_DIMENSIONS[orientation];
  const isVertical = orientation === 'vertical';
  const totalSec = blueprint.durationSec;
  const fonts = getActiveThemeFonts();

  let activeIdx = scenes.length - 1;
  for (let i = 0; i < scenes.length; i++) {
    const s = scenes[i];
    if (currentTimeSec >= s.startSec && currentTimeSec < s.startSec + s.durationSec) {
      activeIdx = i;
      break;
    }
  }
  const activeScene = scenes[activeIdx] || scenes[0];
  const localT = Math.max(0, currentTimeSec - activeScene.startSec);
  const sceneProgress = Math.max(0, Math.min(1, localT / Math.max(0.1, activeScene.durationSec)));
  const globalProgress = Math.max(0, Math.min(1, currentTimeSec / Math.max(0.1, totalSec)));

  drawRefirelyLightBackdrop(ctx, w, h, globalProgress);
  drawTopChrome(ctx, w, isVertical, blueprint, logoImg, activeIdx, sceneProgress, scenes.length, fonts);

  // Smooth fade-in per scene
  ctx.save();
  ctx.globalAlpha = Math.min(1, localT / 0.25);
  switch (activeScene.id) {
    case 'hook':
      drawSceneHook(ctx, w, h, isVertical, blueprint, photoImg, sceneProgress, fonts);
      break;
    case 'cost_tax':
      drawSceneCostTax(ctx, w, h, isVertical, blueprint, sceneProgress, fonts);
      break;
    case 'visa_tax':
      drawSceneVisaTax(ctx, w, h, isVertical, blueprint, sceneProgress, fonts);
      break;
    case 'scores_radar':
      drawSceneScoresRadar(ctx, w, h, isVertical, blueprint, sceneProgress, fonts);
      break;
    case 'pros_cons':
      drawSceneProsCons(ctx, w, h, isVertical, blueprint, sceneProgress, fonts);
      break;
    case 'outro':
      drawSceneOutro(ctx, w, h, isVertical, blueprint, logoImg, sceneProgress, fonts);
      break;
  }
  ctx.restore();

  if (activeScene.id !== 'outro') {
    drawKineticSubtitles(ctx, w, h, isVertical, activeScene.text, sceneProgress, fonts);
  }
}

export function pickBestVideoMimeType(): { mimeType: string; extension: 'mp4' | 'webm' } {
  if (typeof MediaRecorder === 'undefined') {
    return { mimeType: 'video/webm', extension: 'webm' };
  }
  const candidates: Array<{ mimeType: string; extension: 'mp4' | 'webm' }> = [
    { mimeType: 'video/mp4;codecs=avc1.42E01E,mp4a.40.2', extension: 'mp4' },
    { mimeType: 'video/mp4', extension: 'mp4' },
    { mimeType: 'video/webm;codecs=vp9,opus', extension: 'webm' },
    { mimeType: 'video/webm;codecs=vp8,opus', extension: 'webm' },
    { mimeType: 'video/webm', extension: 'webm' },
  ];
  for (const c of candidates) {
    if (MediaRecorder.isTypeSupported(c.mimeType)) {
      return c;
    }
  }
  return { mimeType: 'video/webm', extension: 'webm' };
}
