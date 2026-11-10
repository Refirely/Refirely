export type BadgeCategory = 'travel' | 'language' | 'milestone' | 'community' | 'scout';

export interface BadgeTier {
  id: string; // e.g. 'globetrotter-bronze', 'globetrotter-silver', 'globetrotter-gold'
  name: string; // 'Bronze', 'Silver', 'Gold', 'Bilingual', 'Trilingual', 'Hyperpolyglot'
  level: number; // 1, 2, 3
  threshold: number; // e.g. 5, 15, 30, 2, 3, 4
  unitLabel: string; // 'countries', 'languages'
  tagline: string; // '5+ Countries Explored'
  description: string;
  // Styling
  accentGradient: string;
  badgeRingGradient: string;
  borderClass: string;
  bgClass: string;
  textClass: string;
  glowClass: string;
  pillBgClass: string;
  iconName: 'Globe' | 'Languages' | 'Compass' | 'Sparkles' | 'Award' | 'Star' | 'Crown' | 'Flame';
}

export interface BadgeDefinition {
  id: string; // 'globetrotter', 'polyglot', 'early-pioneer'
  name: string;
  category: BadgeCategory;
  categoryLabel: string;
  shortDescription: string;
  fullDescription: string;
  howToEarn: string[];
  isTiered: boolean;
  tiers?: BadgeTier[];
  singleTier?: BadgeTier;
  comingSoon?: boolean;
}

export interface EarnedBadge {
  id: string; // unique identifier (tierId or badgeId)
  badgeId: string;
  badgeName: string;
  category: BadgeCategory;
  tierId: string;
  tierName: string;
  tierLevel: number;
  tagline: string;
  description: string;
  iconName: string;
  accentGradient: string;
  borderClass: string;
  bgClass: string;
  textClass: string;
  glowClass: string;
  pillBgClass: string;
  earnedAt?: string;
  currentValue: number;
  targetValue: number;
  nextTier?: BadgeTier;
  nextTierProgressPercent?: number; // 0 - 100
  metadata?: {
    signupNumber?: number;
    countriesCount?: number;
    languagesCount?: number;
    details?: string;
  };
}

export interface BadgeProgress {
  badge: BadgeDefinition;
  isUnlocked: boolean;
  highestEarnedTier?: BadgeTier;
  nextTier?: BadgeTier;
  currentValue: number;
  targetValue: number;
  progressPercent: number; // 0 to 100
  remainingToNextTier: number;
  allTiersWithStatus: {
    tier: BadgeTier;
    isAchieved: boolean;
    isCurrent: boolean;
  }[];
}

export interface PlatformBadgesConfig {
  id: 'badges';
  earlyPioneerThreshold: number; // default 100
  updatedAt: string;
  updatedBy?: string;
}
