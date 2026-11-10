import { BadgeDefinition, EarnedBadge, BadgeProgress, BadgeTier } from '../types/badges';
import { UserProfile, UserAccount } from '../types';

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: 'globetrotter',
    name: 'Globetrotter',
    category: 'travel',
    categoryLabel: 'Global Exploration',
    shortDescription: 'Awarded for scouting, visiting, and tracking countries worldwide.',
    fullDescription:
      'The Globetrotter badge honors expats and retirees who actively explore destinations across the globe. Each tier marks a significant milestone in firsthand geographic and cultural reconnaissance.',
    howToEarn: [
      'Log countries you have physically visited in your Scouting & Travel History.',
      'Track target retirement havens in your Country Shortlist & Private Journal.',
      'Bronze unlocks at 5 countries, Silver at 15 countries, and Gold at 30+ countries.',
    ],
    isTiered: true,
    tiers: [
      {
        id: 'globetrotter-bronze',
        name: 'Bronze Globetrotter',
        level: 1,
        threshold: 5,
        unitLabel: 'countries',
        tagline: '5+ Countries Explored',
        description: 'Completed reconnaissance across at least 5 different countries.',
        accentGradient: 'from-amber-600 via-amber-700 to-amber-900',
        badgeRingGradient: 'from-amber-500 via-amber-600 to-amber-800',
        borderClass: 'border-amber-600/70',
        bgClass: 'bg-amber-950/20',
        textClass: 'text-amber-300',
        glowClass: 'shadow-amber-900/30',
        pillBgClass: 'bg-gradient-to-r from-amber-900/80 via-amber-800/80 to-amber-950/90 text-amber-200 border-amber-600/60',
        iconName: 'Globe',
      },
      {
        id: 'globetrotter-silver',
        name: 'Silver Globetrotter',
        level: 2,
        threshold: 15,
        unitLabel: 'countries',
        tagline: '15+ Countries Explored',
        description: 'Vast international scouting experience across 15+ global destinations.',
        accentGradient: 'from-slate-300 via-slate-400 to-indigo-300',
        badgeRingGradient: 'from-slate-200 via-slate-400 to-indigo-400',
        borderClass: 'border-slate-300/80',
        bgClass: 'bg-slate-900/20',
        textClass: 'text-slate-200',
        glowClass: 'shadow-slate-400/30',
        pillBgClass: 'bg-gradient-to-r from-slate-800/90 via-slate-700/80 to-indigo-950/90 text-slate-100 border-slate-400/60',
        iconName: 'Compass',
      },
      {
        id: 'globetrotter-gold',
        name: 'Gold Globetrotter',
        level: 3,
        threshold: 30,
        unitLabel: 'countries',
        tagline: '30+ Countries Explored',
        description: 'Elite world traveler and seasoned international resident with 30+ countries traversed.',
        accentGradient: 'from-amber-300 via-yellow-400 to-amber-600',
        badgeRingGradient: 'from-yellow-300 via-amber-400 to-yellow-500',
        borderClass: 'border-yellow-400/90',
        bgClass: 'bg-amber-950/30',
        textClass: 'text-yellow-300',
        glowClass: 'shadow-yellow-500/40',
        pillBgClass: 'bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 text-yellow-50 border-yellow-300/80 shadow-xs',
        iconName: 'Crown',
      },
    ],
  },
  {
    id: 'polyglot',
    name: 'Polyglot',
    category: 'language',
    categoryLabel: 'Linguistic Mastery',
    shortDescription: 'Celebrates multilingual proficiency and language acquisition for international living.',
    fullDescription:
      'Language is the fastest bridge to genuine local integration. The Polyglot badge celebrates expats who speak multiple languages, from bilingual conversationalists to versatile hyperpolyglots.',
    howToEarn: [
      'Add the languages you speak to your Expat Profile with your proficiency level.',
      'Bilingual unlocks when you speak 2 languages.',
      'Trilingual unlocks when you speak 3 languages.',
      'Hyperpolyglot unlocks when you speak 4 or more languages.',
    ],
    isTiered: true,
    tiers: [
      {
        id: 'polyglot-bilingual',
        name: 'Bilingual',
        level: 1,
        threshold: 2,
        unitLabel: 'languages',
        tagline: 'Speaks 2 Languages',
        description: 'Conversant in two distinct languages, bridging cultural boundaries.',
        accentGradient: 'from-teal-500 via-cyan-600 to-emerald-600',
        badgeRingGradient: 'from-teal-400 via-cyan-500 to-emerald-500',
        borderClass: 'border-teal-400/70',
        bgClass: 'bg-teal-950/20',
        textClass: 'text-teal-300',
        glowClass: 'shadow-teal-500/30',
        pillBgClass: 'bg-gradient-to-r from-teal-900/90 via-cyan-900/80 to-teal-950/90 text-teal-100 border-teal-500/60',
        iconName: 'Languages',
      },
      {
        id: 'polyglot-trilingual',
        name: 'Trilingual',
        level: 2,
        threshold: 3,
        unitLabel: 'languages',
        tagline: 'Speaks 3 Languages',
        description: 'Speaks three languages fluently or conversationally, enabling deep local connection across continents.',
        accentGradient: 'from-indigo-500 via-purple-600 to-fuchsia-600',
        badgeRingGradient: 'from-indigo-400 via-violet-500 to-purple-500',
        borderClass: 'border-purple-400/70',
        bgClass: 'bg-purple-950/20',
        textClass: 'text-purple-300',
        glowClass: 'shadow-purple-500/30',
        pillBgClass: 'bg-gradient-to-r from-indigo-900/90 via-purple-900/80 to-fuchsia-950/90 text-purple-100 border-purple-400/60',
        iconName: 'Sparkles',
      },
      {
        id: 'polyglot-hyperpolyglot',
        name: 'Hyperpolyglot',
        level: 3,
        threshold: 4,
        unitLabel: 'languages',
        tagline: 'Speaks 4+ Languages',
        description: 'Rare linguistic mastery across four or more languages, commanding global mobility.',
        accentGradient: 'from-rose-500 via-amber-500 via-teal-500 to-indigo-600',
        badgeRingGradient: 'from-rose-400 via-amber-400 to-teal-400',
        borderClass: 'border-pink-400/80',
        bgClass: 'bg-indigo-950/30',
        textClass: 'text-rose-200',
        glowClass: 'shadow-pink-500/40',
        pillBgClass: 'bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 text-rose-50 border-rose-300/80 shadow-xs',
        iconName: 'Flame',
      },
    ],
  },
  {
    id: 'early-pioneer',
    name: 'Early Pioneer',
    category: 'milestone',
    categoryLabel: 'Founding Member',
    shortDescription: 'Awarded to inaugural founding cohorts and early Firebase signups on Refirely.',
    fullDescription:
      'The Early Pioneer badge honors founding cohorts who joined Refirely in its early growth phases. Instead of individual rankings, members belong to exclusive founding cohorts (First 10, First 50, First 100, First 500, First 1,000) that preserve member privacy while recognizing early adoption.',
    howToEarn: [
      'Be among the earliest registered user accounts / Firebase signups on Refirely.',
      'Awarded automatically across founding cohorts: First 10, First 50, First 100, First 500, or First 1,000.',
      'Active eligibility ceiling can be managed by Platform Administrators.',
    ],
    isTiered: true,
    tiers: [
      {
        id: 'early-pioneer-10',
        name: 'First 10 Pioneer',
        level: 5,
        threshold: 10,
        unitLabel: 'cohort',
        tagline: 'Genesis 10 Founding Cohort',
        description: 'Elite founding member among the legendary first 10 registered accounts on Refirely.',
        accentGradient: 'from-amber-400 via-rose-400 to-cyan-400',
        badgeRingGradient: 'from-amber-300 via-rose-300 to-cyan-400',
        borderClass: 'border-amber-400/80',
        bgClass: 'bg-amber-950/25',
        textClass: 'text-amber-200',
        glowClass: 'shadow-amber-500/30',
        pillBgClass: 'bg-gradient-to-r from-amber-950/95 via-yellow-900/90 to-amber-950/95 text-amber-200 border-amber-400/80 shadow-xs',
        iconName: 'Crown',
      },
      {
        id: 'early-pioneer-50',
        name: 'First 50 Pioneer',
        level: 4,
        threshold: 50,
        unitLabel: 'cohort',
        tagline: 'First 50 Founding Circle',
        description: 'Pioneering member among the inaugural 50 registered accounts establishing Refirely.',
        accentGradient: 'from-purple-500 via-fuchsia-500 to-amber-400',
        badgeRingGradient: 'from-purple-400 via-fuchsia-400 to-amber-300',
        borderClass: 'border-purple-400/80',
        bgClass: 'bg-purple-950/20',
        textClass: 'text-purple-200',
        glowClass: 'shadow-purple-500/30',
        pillBgClass: 'bg-gradient-to-r from-purple-950/95 via-fuchsia-950/90 to-indigo-950/95 text-purple-200 border-purple-400/70',
        iconName: 'Sparkles',
      },
      {
        id: 'early-pioneer-100',
        name: 'First 100 Pioneer',
        level: 3,
        threshold: 100,
        unitLabel: 'cohort',
        tagline: 'First 100 Founding Vanguard',
        description: 'Centurion founding member among the first 100 registered accounts on Refirely.',
        accentGradient: 'from-emerald-400 via-teal-500 to-cyan-500',
        badgeRingGradient: 'from-emerald-300 via-teal-400 to-cyan-400',
        borderClass: 'border-emerald-400/80',
        bgClass: 'bg-emerald-950/20',
        textClass: 'text-emerald-200',
        glowClass: 'shadow-emerald-500/30',
        pillBgClass: 'bg-gradient-to-r from-emerald-950/95 via-teal-900/90 to-cyan-950/95 text-emerald-200 border-emerald-400/70',
        iconName: 'Star',
      },
      {
        id: 'early-pioneer-500',
        name: 'First 500 Pioneer',
        level: 2,
        threshold: 500,
        unitLabel: 'cohort',
        tagline: 'First 500 Trailblazers',
        description: 'Early explorer member among the first 500 registered accounts navigating global relocation.',
        accentGradient: 'from-blue-400 via-indigo-500 to-sky-500',
        badgeRingGradient: 'from-blue-300 to-indigo-400',
        borderClass: 'border-sky-400/70',
        bgClass: 'bg-blue-950/20',
        textClass: 'text-sky-200',
        glowClass: 'shadow-sky-500/30',
        pillBgClass: 'bg-gradient-to-r from-slate-900 via-sky-950 to-indigo-950 text-sky-200 border-sky-400/70',
        iconName: 'Award',
      },
      {
        id: 'early-pioneer-1000',
        name: 'First 1,000 Pioneer',
        level: 1,
        threshold: 1000,
        unitLabel: 'cohort',
        tagline: 'First 1,000 Early Adopters',
        description: 'Early community adopter among the first 1,000 registered accounts on Refirely.',
        accentGradient: 'from-amber-600 via-orange-600 to-rose-600',
        badgeRingGradient: 'from-amber-400 to-orange-400',
        borderClass: 'border-amber-500/70',
        bgClass: 'bg-orange-950/20',
        textClass: 'text-amber-200',
        glowClass: 'shadow-orange-500/30',
        pillBgClass: 'bg-gradient-to-r from-slate-900 via-amber-950 to-orange-950 text-amber-200 border-amber-500/60',
        iconName: 'Compass',
      },
    ],
  },
  {
    id: 'fire-vanguard',
    name: 'FIRE Vanguard',
    category: 'milestone',
    categoryLabel: 'Financial Mastery',
    shortDescription: 'Coming Soon: Unlocks with calibrated retirement portfolio and timeline modeling.',
    fullDescription:
      'Recognizes members with fully configured financial ledgers, calculated safe withdrawal rates, and active relocation timelines.',
    howToEarn: [
      'Maintain an active FIRE timeline and financial projection ledger in your personal dashboard.',
      'Achieve a calibrated retirement runway and realistic cost-of-living match.',
    ],
    isTiered: true,
    comingSoon: true,
    tiers: [
      {
        id: 'fire-vanguard-silver',
        name: 'FIRE Vanguard',
        level: 1,
        threshold: 1,
        unitLabel: 'plan',
        tagline: 'Portfolio Calibrated',
        description: 'Complete financial portfolio and FIRE ledger active on Refirely.',
        accentGradient: 'from-blue-500 via-indigo-600 to-violet-600',
        badgeRingGradient: 'from-blue-400 to-indigo-500',
        borderClass: 'border-blue-400/70',
        bgClass: 'bg-blue-950/20',
        textClass: 'text-blue-300',
        glowClass: 'shadow-blue-500/30',
        pillBgClass: 'bg-gradient-to-r from-blue-900/80 to-indigo-900/80 text-blue-200 border-blue-400/60',
        iconName: 'Award',
      },
    ],
  },
  {
    id: 'scout-master',
    name: 'Scout Master',
    category: 'scout',
    categoryLabel: 'Field Reconnaissance',
    shortDescription: 'Coming Soon: Built multi-country sabbatical hopping itineraries in Scout Planner.',
    fullDescription:
      'Honors tactical planners who have assembled multi-stop scouting expeditions with Schengen tracking and burn rates.',
    howToEarn: [
      'Build and save multi-stop scouting itineraries in Scout Hop Planner.',
    ],
    isTiered: false,
    comingSoon: true,
    singleTier: {
      id: 'scout-master-tier',
      name: 'Scout Master',
      level: 1,
      threshold: 3,
      unitLabel: 'itineraries',
      tagline: '3+ Expeditions Planned',
      description: 'Master of Schengen-optimized scouting trips and living burn calculations.',
      accentGradient: 'from-amber-500 via-orange-600 to-rose-600',
      badgeRingGradient: 'from-amber-400 to-orange-500',
      borderClass: 'border-orange-400/70',
      bgClass: 'bg-orange-950/20',
      textClass: 'text-orange-300',
      glowClass: 'shadow-orange-500/30',
      pillBgClass: 'bg-gradient-to-r from-amber-900/80 to-orange-900/80 text-orange-200 border-orange-400/60',
      iconName: 'Compass',
    },
  },
];

/**
 * Calculates unique count of visited or tracked countries for a user profile
 */
export function calculateUserCountryCount(profile?: Partial<UserProfile> | null): number {
  if (!profile) return 0;
  const visitedNames = (profile.travelHistory || []).map(t => t.countryName.trim().toLowerCase());
  const savedIds = (profile.savedCountryIds || []).map(s => s.trim().toLowerCase());
  const set = new Set([...visitedNames, ...savedIds]);
  // Also count origin & residing countries if valid
  if (profile.originCountry) set.add(profile.originCountry.trim().toLowerCase());
  if (profile.residingCountry) set.add(profile.residingCountry.trim().toLowerCase());
  return set.size;
}

/**
 * Calculates number of languages known
 */
export function calculateUserLanguageCount(profile?: Partial<UserProfile> | null): number {
  if (!profile) return 1; // Base English
  const langs = profile.languagesKnown || [];
  if (langs.length === 0) return 1;
  const uniqueLangs = new Set(langs.map(l => l.language.trim().toLowerCase()));
  return Math.max(1, uniqueLangs.size);
}

/**
 * Resolves the user's signup sequence number (1-based index)
 */
export function resolveUserSignupNumber(
  accountOrProfileId?: string,
  allAccounts?: UserAccount[],
  explicitSignupNumber?: number
): number {
  if (explicitSignupNumber && explicitSignupNumber > 0) {
    return explicitSignupNumber;
  }
  if (!accountOrProfileId) return 999;

  // Preset known order for default accounts
  const KNOWN_ORDER: Record<string, number> = {
    'usr-ganesh': 1,
    'usr-elena': 2,
    'usr-marcus': 3,
    'usr-arthur': 4,
    'usr-margaret': 5,
    'usr-david': 6,
    'usr-carlos': 7,
  };

  if (KNOWN_ORDER[accountOrProfileId]) {
    return KNOWN_ORDER[accountOrProfileId];
  }

  if (allAccounts && allAccounts.length > 0) {
    const sorted = [...allAccounts].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateA - dateB;
    });
    const foundIdx = sorted.findIndex(
      a => a.id === accountOrProfileId || a.profile?.id === accountOrProfileId
    );
    if (foundIdx >= 0) {
      return foundIdx + 1;
    }
  }

  return 8; // Default fallback for early custom accounts
}

/**
 * Resolves the clean, non-individual cohort name (e.g. "First 10 Pioneer", "First 50 Pioneer")
 * instead of exposing raw individual numbers.
 */
export function getPioneerCohortLabel(signupNumber: number, earlyPioneerThreshold = 100): string | null {
  if (signupNumber > earlyPioneerThreshold) return null;
  if (signupNumber <= 10) return 'First 10 Pioneer';
  if (signupNumber <= 50) return 'First 50 Pioneer';
  if (signupNumber <= 100) return 'First 100 Pioneer';
  if (signupNumber <= 500) return 'First 500 Pioneer';
  if (signupNumber <= 1000) return 'First 1,000 Pioneer';
  return 'Early Pioneer';
}

/**
 * Evaluates all earned badges for a user profile
 */
export function getUserEarnedBadges(
  profile?: Partial<UserProfile> | null,
  account?: Partial<UserAccount> | null,
  earlyPioneerThreshold = 100,
  allAccounts?: UserAccount[]
): EarnedBadge[] {
  if (!profile) return [];

  const earned: EarnedBadge[] = [];

  // 1. Globetrotter Evaluation
  const countryCount = calculateUserCountryCount(profile);
  const globetrotterDef = BADGE_DEFINITIONS.find(b => b.id === 'globetrotter');
  if (globetrotterDef?.tiers) {
    // Find highest tier achieved
    const achievedTiers = globetrotterDef.tiers
      .filter(t => countryCount >= t.threshold)
      .sort((a, b) => b.level - a.level);

    if (achievedTiers.length > 0) {
      const highest = achievedTiers[0];
      const nextTier = globetrotterDef.tiers.find(t => t.level === highest.level + 1);
      const nextProgress = nextTier
        ? Math.min(100, Math.round((countryCount / nextTier.threshold) * 100))
        : 100;

      earned.push({
        id: highest.id,
        badgeId: globetrotterDef.id,
        badgeName: globetrotterDef.name,
        category: globetrotterDef.category,
        tierId: highest.id,
        tierName: highest.name,
        tierLevel: highest.level,
        tagline: highest.tagline,
        description: highest.description,
        iconName: highest.iconName,
        accentGradient: highest.accentGradient,
        borderClass: highest.borderClass,
        bgClass: highest.bgClass,
        textClass: highest.textClass,
        glowClass: highest.glowClass,
        pillBgClass: highest.pillBgClass,
        currentValue: countryCount,
        targetValue: highest.threshold,
        nextTier,
        nextTierProgressPercent: nextProgress,
        metadata: {
          countriesCount: countryCount,
          details: `${countryCount} countries visited/tracked`,
        },
      });
    }
  }

  // 2. Polyglot Evaluation
  const languageCount = calculateUserLanguageCount(profile);
  const polyglotDef = BADGE_DEFINITIONS.find(b => b.id === 'polyglot');
  if (polyglotDef?.tiers) {
    const achievedTiers = polyglotDef.tiers
      .filter(t => languageCount >= t.threshold)
      .sort((a, b) => b.level - a.level);

    if (achievedTiers.length > 0) {
      const highest = achievedTiers[0];
      const nextTier = polyglotDef.tiers.find(t => t.level === highest.level + 1);
      const nextProgress = nextTier
        ? Math.min(100, Math.round((languageCount / nextTier.threshold) * 100))
        : 100;

      earned.push({
        id: highest.id,
        badgeId: polyglotDef.id,
        badgeName: polyglotDef.name,
        category: polyglotDef.category,
        tierId: highest.id,
        tierName: highest.name,
        tierLevel: highest.level,
        tagline: highest.tagline,
        description: highest.description,
        iconName: highest.iconName,
        accentGradient: highest.accentGradient,
        borderClass: highest.borderClass,
        bgClass: highest.bgClass,
        textClass: highest.textClass,
        glowClass: highest.glowClass,
        pillBgClass: highest.pillBgClass,
        currentValue: languageCount,
        targetValue: highest.threshold,
        nextTier,
        nextTierProgressPercent: nextProgress,
        metadata: {
          languagesCount: languageCount,
          details: `Speaks ${languageCount} languages`,
        },
      });
    }
  }

  // 3. Early Pioneer Evaluation (Cohort-based: First 10, First 50, First 100, First 500, First 1,000)
  const pioneerDef = BADGE_DEFINITIONS.find(b => b.id === 'early-pioneer');
  const signupNumber = resolveUserSignupNumber(
    account?.id || profile.id,
    allAccounts,
    (account as any)?.signupNumber || (profile as any)?.signupNumber
  );

  if (pioneerDef?.tiers && signupNumber <= earlyPioneerThreshold) {
    const qualifyingTiers = pioneerDef.tiers
      .filter(t => signupNumber <= t.threshold)
      .sort((a, b) => b.level - a.level);

    if (qualifyingTiers.length > 0) {
      const highest = qualifyingTiers[0];
      const nextTier = pioneerDef.tiers.find(t => t.level === highest.level + 1);

      earned.push({
        id: highest.id,
        badgeId: pioneerDef.id,
        badgeName: pioneerDef.name,
        category: pioneerDef.category,
        tierId: highest.id,
        tierName: highest.name,
        tierLevel: highest.level,
        tagline: highest.tagline,
        description: highest.description,
        iconName: highest.iconName,
        accentGradient: highest.accentGradient,
        borderClass: highest.borderClass,
        bgClass: highest.bgClass,
        textClass: highest.textClass,
        glowClass: highest.glowClass,
        pillBgClass: highest.pillBgClass,
        currentValue: signupNumber,
        targetValue: highest.threshold,
        nextTier,
        nextTierProgressPercent: 100,
        metadata: {
          signupNumber,
          details: `${highest.name} founding cohort member`,
        },
      });
    }
  }

  return earned;
}

/**
 * Gets progress status for all badges (active & upcoming) for a user
 */
export function getAllBadgesProgress(
  profile?: Partial<UserProfile> | null,
  account?: Partial<UserAccount> | null,
  earlyPioneerThreshold = 100,
  allAccounts?: UserAccount[]
): BadgeProgress[] {
  const countryCount = calculateUserCountryCount(profile);
  const languageCount = calculateUserLanguageCount(profile);
  const signupNumber = resolveUserSignupNumber(
    account?.id || profile?.id,
    allAccounts,
    (account as any)?.signupNumber || (profile as any)?.signupNumber
  );

  return BADGE_DEFINITIONS.map(badge => {
    if (badge.id === 'globetrotter' && badge.tiers) {
      const highestAchieved = [...badge.tiers]
        .reverse()
        .find(t => countryCount >= t.threshold);
      const nextTier = badge.tiers.find(t => countryCount < t.threshold);

      const target = nextTier ? nextTier.threshold : highestAchieved?.threshold || 5;
      const progressPercent = nextTier
        ? Math.min(100, Math.round((countryCount / nextTier.threshold) * 100))
        : 100;
      const remaining = nextTier ? Math.max(0, nextTier.threshold - countryCount) : 0;

      return {
        badge,
        isUnlocked: Boolean(highestAchieved),
        highestEarnedTier: highestAchieved,
        nextTier,
        currentValue: countryCount,
        targetValue: target,
        progressPercent,
        remainingToNextTier: remaining,
        allTiersWithStatus: badge.tiers.map(t => ({
          tier: t,
          isAchieved: countryCount >= t.threshold,
          isCurrent: highestAchieved?.id === t.id,
        })),
      };
    }

    if (badge.id === 'polyglot' && badge.tiers) {
      const highestAchieved = [...badge.tiers]
        .reverse()
        .find(t => languageCount >= t.threshold);
      const nextTier = badge.tiers.find(t => languageCount < t.threshold);

      const target = nextTier ? nextTier.threshold : highestAchieved?.threshold || 2;
      const progressPercent = nextTier
        ? Math.min(100, Math.round((languageCount / nextTier.threshold) * 100))
        : 100;
      const remaining = nextTier ? Math.max(0, nextTier.threshold - languageCount) : 0;

      return {
        badge,
        isUnlocked: Boolean(highestAchieved),
        highestEarnedTier: highestAchieved,
        nextTier,
        currentValue: languageCount,
        targetValue: target,
        progressPercent,
        remainingToNextTier: remaining,
        allTiersWithStatus: badge.tiers.map(t => ({
          tier: t,
          isAchieved: languageCount >= t.threshold,
          isCurrent: highestAchieved?.id === t.id,
        })),
      };
    }

    if (badge.id === 'early-pioneer' && badge.tiers) {
      const isAchieved = signupNumber <= earlyPioneerThreshold;
      const qualifyingTiers = badge.tiers
        .filter(t => signupNumber <= t.threshold)
        .sort((a, b) => b.level - a.level);
      const highestAchieved = isAchieved ? qualifyingTiers[0] : undefined;
      const nextTier = highestAchieved
        ? badge.tiers.find(t => t.level === highestAchieved.level + 1)
        : badge.tiers.slice().reverse().find(t => signupNumber <= t.threshold) || badge.tiers[0];

      return {
        badge,
        isUnlocked: isAchieved,
        highestEarnedTier: highestAchieved,
        nextTier,
        currentValue: signupNumber,
        targetValue: highestAchieved ? highestAchieved.threshold : earlyPioneerThreshold,
        progressPercent: isAchieved ? 100 : Math.min(100, Math.round((earlyPioneerThreshold / Math.max(1, signupNumber)) * 100)),
        remainingToNextTier: isAchieved ? 0 : signupNumber - earlyPioneerThreshold,
        allTiersWithStatus: badge.tiers
          .slice()
          .sort((a, b) => b.level - a.level)
          .map(t => ({
            tier: t,
            isAchieved: signupNumber <= t.threshold && signupNumber <= earlyPioneerThreshold,
            isCurrent: highestAchieved?.id === t.id,
          })),
      };
    }

    // Default / Coming soon
    return {
      badge,
      isUnlocked: false,
      currentValue: 0,
      targetValue: 1,
      progressPercent: 0,
      remainingToNextTier: 1,
      allTiersWithStatus: (badge.tiers || (badge.singleTier ? [badge.singleTier] : [])).map(t => ({
        tier: t,
        isAchieved: false,
        isCurrent: false,
      })),
    };
  });
}
