import { BadgeDefinition, EarnedBadge, BadgeProgress, BadgeTier } from '../types/badges';
import { UserProfile, UserAccount, Country } from '../types';
import { calculateUnifiedFireMetrics } from '../utils/fireCalculations';

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
  // ==========================================
  // New FIRE Calculator & Geoarbitrage Badges
  // ==========================================
  {
    id: 'fire-progress-milestones',
    name: 'FIRE Progress Milestones',
    category: 'milestone',
    categoryLabel: 'Financial Independence',
    shortDescription: 'Privacy-safe percentage-based milestones toward work-optional freedom.',
    fullDescription: 'Recognizes members achieving key percentage milestones toward their target Financial Independence number.',
    howToEarn: ['Grow your investment portfolio and net worth toward your target FIRE number.'],
    isTiered: true,
    tiers: [
      {
        id: 'seed_planter',
        name: 'Seed Planter (10% FI)',
        level: 1,
        threshold: 10,
        unitLabel: '% FI',
        tagline: '10% to Financial Independence',
        description: 'Reached 10% of your target Financial Independence number.',
        accentGradient: 'from-amber-500 via-yellow-600 to-amber-700',
        badgeRingGradient: 'from-amber-400 via-yellow-500 to-amber-600',
        borderClass: 'border-amber-500/70',
        bgClass: 'bg-amber-950/20',
        textClass: 'text-amber-300',
        glowClass: 'shadow-amber-500/30',
        pillBgClass: 'bg-gradient-to-r from-amber-900/85 via-amber-800/80 to-amber-950/90 text-amber-200 border-amber-500/60',
        iconName: 'Star',
      },
      {
        id: 'momentum_builder',
        name: 'Momentum Builder (25% FI)',
        level: 2,
        threshold: 25,
        unitLabel: '% FI',
        tagline: 'Quarter-way to Freedom',
        description: 'Quarter-way to work-optional freedom.',
        accentGradient: 'from-teal-500 via-emerald-600 to-teal-700',
        badgeRingGradient: 'from-teal-400 via-emerald-500 to-teal-600',
        borderClass: 'border-teal-500/70',
        bgClass: 'bg-teal-950/20',
        textClass: 'text-teal-300',
        glowClass: 'shadow-teal-500/30',
        pillBgClass: 'bg-gradient-to-r from-teal-900/85 via-emerald-800/80 to-teal-950/90 text-teal-200 border-teal-500/60',
        iconName: 'Sparkles',
      },
      {
        id: 'halfway_sovereign',
        name: 'Halfway Sovereign (50% FI)',
        level: 3,
        threshold: 50,
        unitLabel: '% FI',
        tagline: '50% Funded Toward FI',
        description: 'Officially 50% funded toward Financial Independence.',
        accentGradient: 'from-indigo-500 via-violet-600 to-purple-700',
        badgeRingGradient: 'from-indigo-400 via-violet-500 to-purple-600',
        borderClass: 'border-indigo-500/70',
        bgClass: 'bg-indigo-950/20',
        textClass: 'text-indigo-300',
        glowClass: 'shadow-indigo-500/30',
        pillBgClass: 'bg-gradient-to-r from-indigo-900/85 via-violet-800/80 to-indigo-950/90 text-indigo-200 border-indigo-500/60',
        iconName: 'Crown',
      },
      {
        id: 'escape_velocity',
        name: 'Escape Velocity (75% FI)',
        level: 4,
        threshold: 75,
        unitLabel: '% FI',
        tagline: '75% Funded (Compounding Active)',
        description: 'Three-quarters funded; passive compounding is taking over.',
        accentGradient: 'from-rose-500 via-orange-600 to-amber-600',
        badgeRingGradient: 'from-rose-400 via-orange-500 to-amber-500',
        borderClass: 'border-rose-500/70',
        bgClass: 'bg-rose-950/20',
        textClass: 'text-rose-300',
        glowClass: 'shadow-rose-500/30',
        pillBgClass: 'bg-gradient-to-r from-rose-900/85 via-orange-800/80 to-rose-950/90 text-rose-200 border-rose-500/60',
        iconName: 'Flame',
      },
      {
        id: 'hundred_percent_fi',
        name: '100% FI / Work-Optional',
        level: 5,
        threshold: 100,
        unitLabel: '% FI',
        tagline: '100% Financial Independence',
        description: 'Achieved 100% Financial Independence target.',
        accentGradient: 'from-purple-600 via-fuchsia-600 to-rose-600',
        badgeRingGradient: 'from-purple-400 via-fuchsia-400 to-rose-400',
        borderClass: 'border-purple-500/80',
        bgClass: 'bg-purple-950/25',
        textClass: 'text-purple-200',
        glowClass: 'shadow-purple-500/40',
        pillBgClass: 'bg-gradient-to-r from-purple-900/90 via-fuchsia-900/85 to-rose-900/90 text-purple-100 border-purple-400/80',
        iconName: 'Crown',
      },
    ],
  },
  {
    id: 'arbitrage_architect',
    name: 'Arbitrage Architect',
    category: 'milestone',
    categoryLabel: 'Geoarbitrage Strategy',
    shortDescription: 'Shaved 5+ years off your retirement timeline via geoarbitrage.',
    fullDescription: 'Awarded to planners who shaved 5 or more years off their retirement timeline through international geoarbitrage.',
    howToEarn: ['Save 5+ working years by selecting an economic target haven.'],
    isTiered: false,
    singleTier: {
      id: 'arbitrage_architect_tier',
      name: 'Arbitrage Architect',
      level: 1,
      threshold: 5,
      unitLabel: 'years saved',
      tagline: '5+ Years Saved',
      description: 'Shaved 5+ years off your retirement timeline via geoarbitrage.',
      accentGradient: 'from-indigo-600 via-violet-600 to-purple-600',
      badgeRingGradient: 'from-indigo-400 via-violet-500 to-purple-500',
      borderClass: 'border-indigo-500/70',
      bgClass: 'bg-indigo-950/20',
      textClass: 'text-indigo-300',
      glowClass: 'shadow-indigo-500/30',
      pillBgClass: 'bg-gradient-to-r from-indigo-900/85 to-purple-900/85 text-indigo-200 border-indigo-400/60',
      iconName: 'Sparkles',
    },
  },
  {
    id: 'decade_jumper',
    name: 'Decade Jumper',
    category: 'milestone',
    categoryLabel: 'Timeline Compression',
    shortDescription: 'Cut 10+ years off your working life by choosing a high-leverage haven.',
    fullDescription: 'Awarded to forward-thinking planners who cut 10 or more years off their working life through strategic international geoarbitrage.',
    howToEarn: ['Save 10+ working years by selecting an economic target haven.'],
    isTiered: false,
    singleTier: {
      id: 'decade_jumper_tier',
      name: 'Decade Jumper',
      level: 1,
      threshold: 10,
      unitLabel: 'years saved',
      tagline: '10+ Years Saved',
      description: 'Cut 10+ years off your working life by choosing a high-leverage haven.',
      accentGradient: 'from-teal-600 via-cyan-600 to-blue-600',
      badgeRingGradient: 'from-teal-400 via-cyan-500 to-blue-500',
      borderClass: 'border-teal-500/70',
      bgClass: 'bg-teal-950/20',
      textClass: 'text-teal-300',
      glowClass: 'shadow-teal-500/30',
      pillBgClass: 'bg-gradient-to-r from-teal-900/85 to-blue-900/85 text-teal-200 border-teal-400/60',
      iconName: 'Globe',
    },
  },
  {
    id: 'coast_fire_nomad',
    name: 'Coast FIRE Nomad',
    category: 'milestone',
    categoryLabel: 'Coast Strategy',
    shortDescription: 'Current portfolio will grow to full FIRE by retirement age with $0 new contributions.',
    fullDescription: 'Honors practitioners who reached the Coast FIRE tipping point where compound growth alone ensures full financial independence.',
    howToEarn: ['Reach portfolio equilibrium where compounding alone fulfills future FIRE targets.'],
    isTiered: false,
    singleTier: {
      id: 'coast_fire_nomad_tier',
      name: 'Coast FIRE Nomad',
      level: 1,
      threshold: 1,
      unitLabel: 'status',
      tagline: 'Coast FIRE Reached',
      description: 'Current portfolio will grow to full FIRE by retirement age with $0 new contributions.',
      accentGradient: 'from-sky-500 via-blue-600 to-indigo-700',
      badgeRingGradient: 'from-sky-400 via-blue-500 to-indigo-500',
      borderClass: 'border-sky-500/70',
      bgClass: 'bg-sky-950/20',
      textClass: 'text-sky-300',
      glowClass: 'shadow-sky-500/30',
      pillBgClass: 'bg-gradient-to-r from-sky-900/85 to-indigo-900/85 text-sky-200 border-sky-400/60',
      iconName: 'Compass',
    },
  },
  {
    id: 'lean_fire_minimalist',
    name: 'Lean FIRE Minimalist',
    category: 'milestone',
    categoryLabel: 'Efficiency',
    shortDescription: 'Modeled a complete early retirement plan under $1,500/month.',
    fullDescription: 'Awarded for curating highly efficient, streamlined early retirement plans requiring under $1,500/month in living expenses.',
    howToEarn: ['Configure target retirement expenses below $1,500/mo.'],
    isTiered: false,
    singleTier: {
      id: 'lean_fire_minimalist_tier',
      name: 'Lean FIRE Minimalist',
      level: 1,
      threshold: 1500,
      unitLabel: '/mo',
      tagline: 'Under $1,500/mo Plan',
      description: 'Modeled a complete early retirement plan under $1,500/month.',
      accentGradient: 'from-emerald-500 via-teal-600 to-cyan-700',
      badgeRingGradient: 'from-emerald-400 via-teal-500 to-cyan-500',
      borderClass: 'border-emerald-500/70',
      bgClass: 'bg-emerald-950/20',
      textClass: 'text-emerald-300',
      glowClass: 'shadow-emerald-500/30',
      pillBgClass: 'bg-gradient-to-r from-emerald-900/85 to-cyan-900/85 text-emerald-200 border-emerald-400/60',
      iconName: 'Star',
    },
  },
  {
    id: 'fat_fire_voyager',
    name: 'Chubby / Fat FIRE Voyager',
    category: 'milestone',
    categoryLabel: 'Luxury Scale',
    shortDescription: 'Configured a luxury global FIRE plan with a $1.5M+ target portfolio.',
    fullDescription: 'Recognizes ambitious planners structuring high-net-worth global retirement plans with target portfolios exceeding $1.5M.',
    howToEarn: ['Configure a target FIRE portfolio of $1,500,000 or greater.'],
    isTiered: false,
    singleTier: {
      id: 'fat_fire_voyager_tier',
      name: 'Chubby / Fat FIRE Voyager',
      level: 1,
      threshold: 1500000,
      unitLabel: 'corpus',
      tagline: '$1.5M+ Luxury FIRE Target',
      description: 'Configured a luxury global FIRE plan with a $1.5M+ target portfolio.',
      accentGradient: 'from-amber-600 via-yellow-500 to-orange-600',
      badgeRingGradient: 'from-amber-400 via-yellow-400 to-orange-500',
      borderClass: 'border-amber-500/80',
      bgClass: 'bg-amber-950/30',
      textClass: 'text-amber-200',
      glowClass: 'shadow-amber-500/40',
      pillBgClass: 'bg-gradient-to-r from-amber-800 via-yellow-700 to-orange-800 text-amber-100 border-amber-400/80',
      iconName: 'Crown',
    },
  },
  {
    id: 'runway_sovereign',
    name: 'Runway Sovereign',
    category: 'milestone',
    categoryLabel: 'Liquidity Runway',
    shortDescription: 'Built 24+ months of living runway in your target haven.',
    fullDescription: 'Honors members with robust liquid cash and equity buffers providing 24 or more months of untethered living runway abroad.',
    howToEarn: ['Accumulate 24+ months of liquid living expenses in your financial portfolio.'],
    isTiered: false,
    singleTier: {
      id: 'runway_sovereign_tier',
      name: 'Runway Sovereign',
      level: 1,
      threshold: 24,
      unitLabel: 'months',
      tagline: '24+ Months Runway',
      description: 'Built 24+ months of living runway in your target haven.',
      accentGradient: 'from-rose-500 via-pink-600 to-purple-700',
      badgeRingGradient: 'from-rose-400 via-pink-500 to-purple-500',
      borderClass: 'border-rose-500/70',
      bgClass: 'bg-rose-950/20',
      textClass: 'text-rose-300',
      glowClass: 'shadow-rose-500/30',
      pillBgClass: 'bg-gradient-to-r from-rose-900/85 to-purple-900/85 text-rose-200 border-rose-400/60',
      iconName: 'Award',
    },
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

export function calculateUserCountryCount(profile?: Partial<UserProfile> | null): number {
  if (!profile) return 0;
  const visitedNames = (profile.travelHistory || []).map(t => t.countryName.trim().toLowerCase());
  const savedIds = (profile.savedCountryIds || []).map(s => s.trim().toLowerCase());
  const set = new Set([...visitedNames, ...savedIds]);
  if (profile.originCountry) set.add(profile.originCountry.trim().toLowerCase());
  if (profile.residingCountry) set.add(profile.residingCountry.trim().toLowerCase());
  return set.size;
}

export function calculateUserLanguageCount(profile?: Partial<UserProfile> | null): number {
  if (!profile) return 1;
  const langs = profile.languagesKnown || [];
  if (langs.length === 0) return 1;
  const uniqueLangs = new Set(langs.map(l => l.language.trim().toLowerCase()));
  return Math.max(1, uniqueLangs.size);
}

export const SYSTEM_TEST_USER_IDS = new Set<string>([
  'usr-elena',
  'usr-marcus',
  'usr-arthur',
  'usr-margaret',
  'usr-david',
  'usr-carlos',
]);

export function isSystemTestAccount(
  accountOrId?: string | Partial<UserAccount> | Partial<UserProfile> | null
): boolean {
  if (!accountOrId) return false;
  if (typeof accountOrId === 'string') {
    const cleanId = accountOrId.trim().toLowerCase();
    return SYSTEM_TEST_USER_IDS.has(cleanId);
  }
  const id = (accountOrId.id || (accountOrId as any).profile?.id || '').trim().toLowerCase();
  if (SYSTEM_TEST_USER_IDS.has(id)) return true;
  const email = (accountOrId.email || (accountOrId as any).profile?.email || '').trim().toLowerCase();
  if (email.endsWith('@expats.io') || email.endsWith('@nomadretiree.org')) return true;
  return false;
}

export function resolveUserSignupNumber(
  accountOrProfileId?: string,
  allAccounts?: UserAccount[],
  explicitSignupNumber?: number
): number {
  if (!accountOrProfileId) return 0;
  const cleanId = accountOrProfileId.trim().toLowerCase();
  if (cleanId === 'guest' || isSystemTestAccount(cleanId)) {
    return 0;
  }
  if (allAccounts && allAccounts.length > 0) {
    const matchedAcc = allAccounts.find(
      a => a.id.toLowerCase() === cleanId || a.profile?.id?.toLowerCase() === cleanId
    );
    if (matchedAcc && isSystemTestAccount(matchedAcc)) {
      return 0;
    }
  }
  if (explicitSignupNumber && explicitSignupNumber > 0) {
    return explicitSignupNumber;
  }
  if (cleanId === 'usr-ganesh') {
    return 1;
  }
  if (allAccounts && allAccounts.length > 0) {
    const realAccounts = allAccounts.filter(
      a => a && a.id && a.id !== 'guest' && !isSystemTestAccount(a)
    );
    const sorted = [...realAccounts].sort((a, b) => {
      if (a.id === 'usr-ganesh') return -1;
      if (b.id === 'usr-ganesh') return 1;
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateA - dateB;
    });
    const foundIdx = sorted.findIndex(
      a => a.id.toLowerCase() === cleanId || a.profile?.id?.toLowerCase() === cleanId
    );
    if (foundIdx >= 0) {
      return foundIdx + 1;
    }
    return sorted.length + 1;
  }
  return 2;
}

export function getPioneerCohortLabel(signupNumber: number, earlyPioneerThreshold = 100): string | null {
  if (!signupNumber || signupNumber <= 0 || signupNumber > earlyPioneerThreshold) return null;
  if (signupNumber <= 10) return 'First 10 Pioneer';
  if (signupNumber <= 50) return 'First 50 Pioneer';
  if (signupNumber <= 100) return 'First 100 Pioneer';
  if (signupNumber <= 500) return 'First 500 Pioneer';
  if (signupNumber <= 1000) return 'First 1,000 Pioneer';
  return 'Early Pioneer';
}

/**
 * Evaluates FIRE & Geoarbitrage earned badges for a user profile
 */
export function evaluateFireBadges(profile?: Partial<UserProfile> | null, countries: Country[] = []): EarnedBadge[] {
  if (!profile || !profile.finances) return [];
  const metrics = calculateUnifiedFireMetrics(profile as UserProfile, countries);
  const earned: EarnedBadge[] = [];

  const addTierBadge = (tier: BadgeTier, badgeDef: BadgeDefinition, currVal: number) => {
    earned.push({
      id: tier.id,
      badgeId: badgeDef.id,
      badgeName: badgeDef.name,
      category: badgeDef.category,
      tierId: tier.id,
      tierName: tier.name,
      tierLevel: tier.level,
      tagline: tier.tagline,
      description: tier.description,
      iconName: tier.iconName,
      accentGradient: tier.accentGradient,
      borderClass: tier.borderClass,
      bgClass: tier.bgClass,
      textClass: tier.textClass,
      glowClass: tier.glowClass,
      pillBgClass: tier.pillBgClass,
      currentValue: currVal,
      targetValue: tier.threshold,
      metadata: { details: tier.description },
    });
  };

  const addSingleBadge = (badgeDef: BadgeDefinition, currVal: number) => {
    const tier = badgeDef.singleTier;
    if (!tier) return;
    earned.push({
      id: tier.id,
      badgeId: badgeDef.id,
      badgeName: badgeDef.name,
      category: badgeDef.category,
      tierId: tier.id,
      tierName: tier.name,
      tierLevel: tier.level,
      tagline: tier.tagline,
      description: tier.description,
      iconName: tier.iconName,
      accentGradient: tier.accentGradient,
      borderClass: tier.borderClass,
      bgClass: tier.bgClass,
      textClass: tier.textClass,
      glowClass: tier.glowClass,
      pillBgClass: tier.pillBgClass,
      currentValue: currVal,
      targetValue: tier.threshold,
      metadata: { details: tier.description },
    });
  };

  // 1. FIRE Progress Milestones (Show ONLY highest achieved tier)
  const progressDef = BADGE_DEFINITIONS.find(b => b.id === 'fire-progress-milestones');
  if (progressDef?.tiers) {
    const achieved = progressDef.tiers
      .filter(t => metrics.uncappedFireProgressPct >= t.threshold)
      .sort((a, b) => b.threshold - a.threshold);
    if (achieved.length > 0) {
      addTierBadge(achieved[0], progressDef, metrics.uncappedFireProgressPct);
    }
  }

  // 2. Arbitrage Architect (>= 5 yrs saved)
  if (metrics.yearsSaved >= 5) {
    const archDef = BADGE_DEFINITIONS.find(b => b.id === 'arbitrage_architect');
    if (archDef) addSingleBadge(archDef, metrics.yearsSaved);
  }

  // 3. Decade Jumper (>= 10 yrs saved)
  if (metrics.yearsSaved >= 10) {
    const decDef = BADGE_DEFINITIONS.find(b => b.id === 'decade_jumper');
    if (decDef) addSingleBadge(decDef, metrics.yearsSaved);
  }

  // 4. Coast FIRE Nomad
  const yearsToRetire = Math.max(1, (profile.finances?.targetFireAge || 50) - (profile.finances?.currentAge || 42));
  const realReturn = 0.04;
  const coastTarget = metrics.comprehensiveFireTargetUSD / Math.pow(1 + realReturn, yearsToRetire);
  if (metrics.effectiveFireCorpusUSD >= coastTarget) {
    const coastDef = BADGE_DEFINITIONS.find(b => b.id === 'coast_fire_nomad');
    if (coastDef) addSingleBadge(coastDef, 1);
  }

  // 5. Lean FIRE Minimalist (<= $1,500/mo burn)
  if (metrics.monthlyBurnUSD > 0 && metrics.monthlyBurnUSD <= 1500) {
    const leanDef = BADGE_DEFINITIONS.find(b => b.id === 'lean_fire_minimalist');
    if (leanDef) addSingleBadge(leanDef, metrics.monthlyBurnUSD);
  }

  // 6. Fat FIRE Voyager (>= $1.5M target corpus)
  if (metrics.targetFireNestEggUSD >= 1500000) {
    const fatDef = BADGE_DEFINITIONS.find(b => b.id === 'fat_fire_voyager');
    if (fatDef) addSingleBadge(fatDef, metrics.targetFireNestEggUSD);
  }

  // 7. Runway Sovereign (>= 24 mos runway)
  if (metrics.nomadRunwayMonths >= 24) {
    const runDef = BADGE_DEFINITIONS.find(b => b.id === 'runway_sovereign');
    if (runDef) addSingleBadge(runDef, metrics.nomadRunwayMonths);
  }

  return earned;
}

/**
 * Evaluates all earned badges for a user profile (Globetrotter, Polyglot, Early Pioneer, FIRE Progress & Geoarbitrage)
 */
export function getUserEarnedBadges(
  profile?: Partial<UserProfile> | null,
  account?: Partial<UserAccount> | null,
  earlyPioneerThreshold = 100,
  allAccounts?: UserAccount[],
  countries: Country[] = []
): EarnedBadge[] {
  if (!profile) return [];

  const earned: EarnedBadge[] = [];

  // 1. Globetrotter Evaluation
  const countryCount = calculateUserCountryCount(profile);
  const globetrotterDef = BADGE_DEFINITIONS.find(b => b.id === 'globetrotter');
  if (globetrotterDef?.tiers) {
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

  // 3. Early Pioneer Evaluation
  const pioneerDef = BADGE_DEFINITIONS.find(b => b.id === 'early-pioneer');
  const signupNumber = resolveUserSignupNumber(
    account?.id || profile.id,
    allAccounts,
    (account as any)?.signupNumber || (profile as any)?.signupNumber
  );

  if (pioneerDef?.tiers && signupNumber > 0 && signupNumber <= earlyPioneerThreshold) {
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

  // 4. FIRE & Geoarbitrage Badges
  const fireEarned = evaluateFireBadges(profile, countries);
  earned.push(...fireEarned);

  return earned;
}

/**
 * Gets progress status for all badges (active & upcoming) for a user
 */
export function getAllBadgesProgress(
  profile?: Partial<UserProfile> | null,
  account?: Partial<UserAccount> | null,
  earlyPioneerThreshold = 100,
  allAccounts?: UserAccount[],
  countries: Country[] = []
): BadgeProgress[] {
  const countryCount = calculateUserCountryCount(profile);
  const languageCount = calculateUserLanguageCount(profile);
  const signupNumber = resolveUserSignupNumber(
    account?.id || profile?.id,
    allAccounts,
    (account as any)?.signupNumber || (profile as any)?.signupNumber
  );
  const earnedFireBadges = evaluateFireBadges(profile, countries);
  const earnedFireIds = new Set(earnedFireBadges.map(b => b.tierId));

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
      const isAchieved = signupNumber > 0 && signupNumber <= earlyPioneerThreshold;
      const qualifyingTiers = badge.tiers
        .filter(t => signupNumber > 0 && signupNumber <= t.threshold)
        .sort((a, b) => b.level - a.level);
      const highestAchieved = isAchieved ? qualifyingTiers[0] : undefined;
      const nextTier = highestAchieved
        ? badge.tiers.find(t => t.level === highestAchieved.level + 1)
        : badge.tiers.slice().reverse().find(t => signupNumber > 0 && signupNumber <= t.threshold) || badge.tiers[0];

      return {
        badge,
        isUnlocked: isAchieved,
        highestEarnedTier: highestAchieved,
        nextTier,
        currentValue: signupNumber,
        targetValue: highestAchieved ? highestAchieved.threshold : earlyPioneerThreshold,
        progressPercent: isAchieved ? 100 : signupNumber > 0 ? Math.min(100, Math.round((earlyPioneerThreshold / Math.max(1, signupNumber)) * 100)) : 0,
        remainingToNextTier: isAchieved ? 0 : signupNumber > 0 ? signupNumber - earlyPioneerThreshold : earlyPioneerThreshold,
        allTiersWithStatus: badge.tiers
          .slice()
          .sort((a, b) => b.level - a.level)
          .map(t => ({
            tier: t,
            isAchieved: signupNumber > 0 && signupNumber <= t.threshold && signupNumber <= earlyPioneerThreshold,
            isCurrent: highestAchieved?.id === t.id,
          })),
      };
    }

    // Handle tiered FIRE milestones badge
    if (badge.id === 'fire-progress-milestones' && badge.tiers) {
      const metrics = profile ? calculateUnifiedFireMetrics(profile as UserProfile, countries) : null;
      const val = metrics ? metrics.uncappedFireProgressPct : 0;
      const achievedTiers = badge.tiers.filter(t => val >= t.threshold);
      const highestAchieved = achievedTiers.length > 0 ? achievedTiers[achievedTiers.length - 1] : undefined;
      const nextTier = badge.tiers.find(t => val < t.threshold);
      const target = nextTier ? nextTier.threshold : 100;
      const progressPercent = nextTier ? Math.min(100, Math.round((val / nextTier.threshold) * 100)) : 100;

      return {
        badge,
        isUnlocked: achievedTiers.length > 0,
        highestEarnedTier: highestAchieved,
        nextTier,
        currentValue: val,
        targetValue: target,
        progressPercent,
        remainingToNextTier: nextTier ? Math.max(0, nextTier.threshold - val) : 0,
        allTiersWithStatus: badge.tiers.map(t => ({
          tier: t,
          isAchieved: val >= t.threshold,
          isCurrent: highestAchieved?.id === t.id,
        })),
      };
    }

    // Handle single-tier FIRE / geoarbitrage badges
    if (badge.singleTier) {
      const tier = badge.singleTier;
      const isUnlocked = earnedFireIds.has(tier.id);
      return {
        badge,
        isUnlocked,
        highestEarnedTier: isUnlocked ? tier : undefined,
        currentValue: isUnlocked ? tier.threshold : 0,
        targetValue: tier.threshold,
        progressPercent: isUnlocked ? 100 : 0,
        remainingToNextTier: isUnlocked ? 0 : 1,
        allTiersWithStatus: [
          {
            tier,
            isAchieved: isUnlocked,
            isCurrent: isUnlocked,
          },
        ],
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
