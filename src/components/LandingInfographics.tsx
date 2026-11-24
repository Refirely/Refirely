import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  Flame,
  Globe,
  Stamp,
  Plane,
  Users,
  Calendar,
  Award,
  Compass,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  MapPin,
  TrendingDown,
  CheckCircle2,
  SlidersHorizontal,
  MessageSquare,
  FileBadge,
} from 'lucide-react';
import type { AppView } from '../context/AppContext';
import heroCoastalHavenImg from '../assets/images/home_hero_coastal_haven_1795244442300.jpg';
import scoutHopItineraryImg from '../assets/images/home_scout_hop_itinerary_1795244438884.jpg';
import expatMeetupImg from '../assets/images/home_expat_community_meetup_1795244439195.jpg';
import fireLifestyleImg from '../assets/images/home_fire_geoarbitrage_lifestyle_1795244440248.jpg';
import visaPassportsImg from '../assets/images/visa_passports_infographic_1795241302411.jpg';

// ============================================================================
// 1. HERO VISUAL SHOWCASE + LIVE GEO-ARBITRAGE & RELOCATION PULSE INFOGRAPHIC
// ============================================================================

interface HeroVisualShowcaseProps {
  countriesCount: number;
  currentPersona: 'retiree' | 'nomad';
  onScrollTo: (id: string) => void;
  onNavigateView: (view: AppView) => void;
}

export const HeroVisualShowcase: React.FC<HeroVisualShowcaseProps> = ({
  countriesCount,
  currentPersona,
  onScrollTo,
  onNavigateView,
}) => {
  const [heroImgFailed, setHeroImgFailed] = useState(false);

  const steps = [
    {
      id: 'match',
      label: 'Match',
      sub: `${countriesCount} Havens`,
      icon: Sparkles,
      accent: 'from-indigo-500 to-violet-600',
      tint: 'bg-indigo-50/90 border-indigo-200/80 text-indigo-800',
      onClick: () => onScrollTo('haven-matcher'),
    },
    {
      id: 'visa',
      label: 'Visa Check',
      sub: '155+ Rules',
      icon: Stamp,
      accent: 'from-teal-500 to-emerald-600',
      tint: 'bg-teal-50/90 border-teal-200/80 text-teal-800',
      onClick: () => onNavigateView('visa-check'),
    },
    {
      id: 'fire',
      label: currentPersona === 'nomad' ? 'Runway' : 'FIRE Plan',
      sub: currentPersona === 'nomad' ? 'Burn Calc' : '8.4 Yrs Saved',
      icon: Flame,
      accent: 'from-amber-500 to-orange-600',
      tint: 'bg-amber-50/90 border-amber-200/80 text-amber-900',
      onClick: () => onNavigateView('fire-calculator'),
    },
    {
      id: 'scout',
      label: 'Scout & Meet',
      sub: 'Trips & Expats',
      icon: Plane,
      accent: 'from-sky-500 to-indigo-600',
      tint: 'bg-sky-50/90 border-sky-200/80 text-sky-900',
      onClick: () => onNavigateView('scout'),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-4 h-full justify-between"
    >
      {/* Sunlit Mediterranean Haven Panorama Card */}
      <div className="relative rounded-3xl overflow-hidden border border-indigo-200/80 bg-gradient-to-br from-sky-100 via-white to-teal-100 shadow-lg shadow-indigo-950/5 flex-1 min-h-[240px] lg:min-h-[290px]">
        {!heroImgFailed ? (
          <img
            src={heroCoastalHavenImg}
            alt="Sunlit Mediterranean coastal terrace overlooking turquoise sea with travel journal and brass compass"
            referrerPolicy="no-referrer"
            onError={() => setHeroImgFailed(true)}
            className="w-full h-full object-cover object-center"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-sky-100 via-indigo-50 to-teal-100">
            <Globe className="w-12 h-12 text-indigo-600 mb-2" />
            <span className="text-sm font-bold text-slate-900">{countriesCount} Verified Global Havens</span>
          </div>
        )}
      </div>

      {/* Live Geo-Arbitrage Savings & 4-Step Relocation Flow Infographic */}
      <div className="rounded-3xl bg-white/95 backdrop-blur-md border border-indigo-200/80 p-4 sm:p-5 shadow-md shadow-indigo-950/5 space-y-4">
        {/* Geo-Arbitrage Visual Bar Comparison */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
              <TrendingDown className="w-3.5 h-3.5 text-teal-600" />
              <span>{currentPersona === 'nomad' ? 'Monthly Nomad Burn Advantage' : 'Geo-Arbitrage Monthly Snapshot'}</span>
            </span>
            <span className="font-mono tabular-nums font-bold text-emerald-700">
              {currentPersona === 'nomad' ? '-48% Lower Burn' : '-54% Monthly Cost'}
            </span>
          </div>

          <div className="space-y-2">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
                <span>Typical US / UK Metro Base</span>
                <span className="font-mono tabular-nums text-slate-800 font-bold">
                  {currentPersona === 'nomad' ? '$3,600/mo' : '$5,200/mo'}
                </span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  style={{ transformOrigin: 'left' }}
                  className="h-full w-full rounded-full bg-gradient-to-r from-slate-300 via-rose-300 to-amber-300"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] font-semibold text-teal-800">
                <span>{currentPersona === 'nomad' ? 'Verified Nomad Hub (Turnkey + Fiber)' : 'Verified Top-Tier Haven (Couple)'}</span>
                <span className="font-mono tabular-nums text-teal-700 font-extrabold">
                  {currentPersona === 'nomad' ? '$1,850/mo' : '$2,400/mo'}
                </span>
              </div>
              <div className="h-2.5 rounded-full bg-teal-50 overflow-hidden">
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: currentPersona === 'nomad' ? 0.52 : 0.46 }}
                  transition={{ duration: 0.85, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
                  style={{ transformOrigin: 'left' }}
                  className="h-full w-full rounded-full bg-gradient-to-r from-teal-500 via-emerald-500 to-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Clickable 4-Step Relocation Flow Nodes */}
        <div className="pt-3 border-t border-slate-100">
          <div className="grid grid-cols-4 gap-2">
            {steps.map(step => {
              const Icon = step.icon;
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={step.onClick}
                  className={`group p-2 rounded-2xl border text-left transition-all hover:-translate-y-0.5 hover:shadow-sm cursor-pointer ${step.tint}`}
                >
                  <div className={`w-7 h-7 rounded-xl bg-gradient-to-br ${step.accent} text-white flex items-center justify-center mb-1.5 shadow-xs group-hover:scale-105 transition-transform`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-[11px] font-extrabold text-slate-900 leading-tight truncate">
                    {step.label}
                  </div>
                  <div className="text-[10px] font-medium text-slate-600 truncate mt-0.5">
                    {step.sub}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================================================
// 2. "BUILT FOR REAL PLANNERS" — ECOSYSTEM & INTERACTIVE INFOGRAPHIC SHOWCASE
// ============================================================================

interface RelocationEcosystemShowcaseProps {
  countriesCount: number;
  isGuestUser: boolean;
  onScrollTo: (id: string) => void;
  onNavigateView: (view: AppView) => void;
  onOpenExplorer: () => void;
  onOpenBadges: () => void;
  onOpenAuth: (mode: 'login' | 'signup') => void;
}

export const RelocationEcosystemShowcase: React.FC<RelocationEcosystemShowcaseProps> = ({
  countriesCount,
  isGuestUser,
  onScrollTo,
  onNavigateView,
  onOpenExplorer,
  onOpenBadges,
  onOpenAuth,
}) => {
  const [passportsImgErr, setPassportsImgErr] = useState(false);
  const [fireImgErr, setFireImgErr] = useState(false);
  const [scoutImgErr, setScoutImgErr] = useState(false);
  const [meetupImgErr, setMeetupImgErr] = useState(false);

  // Compact swipeable mobile highlight cards (Visa Check first!)
  const mobileQuickModules = [
    {
      id: 'visa-check',
      title: 'Global Visa Check',
      desc: '155+ official links, passport classes & US/Schengen perks.',
      cta: 'Check Visa',
      icon: Stamp,
      gradient: 'from-teal-50 via-white to-sky-50 border-teal-200/90',
      iconBg: 'from-teal-600 to-indigo-600',
      ctaColor: 'text-teal-700',
      onClick: () => onNavigateView('visa-check'),
    },
    {
      id: 'match-engine',
      title: 'Haven Match Engine',
      desc: `Rank ${countriesCount} havens by budget, healthcare & fiber.`,
      cta: 'Match Now',
      icon: Sparkles,
      gradient: 'from-indigo-50 via-white to-violet-50 border-indigo-200/90',
      iconBg: 'from-indigo-600 to-violet-600',
      ctaColor: 'text-indigo-700',
      onClick: () => onScrollTo('haven-matcher'),
    },
    {
      id: 'fire-calc',
      title: 'FIRE & Runway Calc',
      desc: 'Model 3%–5% SWR abroad & years shaved off retirement.',
      cta: 'Simulate',
      icon: Flame,
      gradient: 'from-amber-50 via-white to-orange-50 border-amber-200/90',
      iconBg: 'from-amber-500 to-orange-600',
      ctaColor: 'text-orange-700',
      onClick: () => onNavigateView('fire-calculator'),
    },
    {
      id: 'scout-hop',
      title: 'Scout & Hop Planner',
      desc: 'Build multi-country scouting trips & seasonal loops.',
      cta: 'Plan Trip',
      icon: Plane,
      gradient: 'from-sky-50 via-white to-indigo-50 border-sky-200/90',
      iconBg: 'from-sky-500 to-indigo-600',
      ctaColor: 'text-sky-700',
      onClick: () => onNavigateView('scout'),
    },
    {
      id: 'expats-meetups',
      title: 'Expats & Meetups',
      desc: 'Connect with relocated members & join local coffee socials.',
      cta: 'Meet Expats',
      icon: Users,
      gradient: 'from-rose-50 via-white to-amber-50 border-rose-200/90',
      iconBg: 'from-rose-500 to-orange-500',
      ctaColor: 'text-rose-700',
      onClick: () => onNavigateView('meetups'),
    },
    {
      id: 'badges',
      title: 'Profile Badges',
      desc: 'Earn verified planner, scout & community milestones.',
      cta: 'View Badges',
      icon: Award,
      gradient: 'from-yellow-50 via-white to-amber-50 border-amber-200/90',
      iconBg: 'from-amber-500 to-yellow-600',
      ctaColor: 'text-amber-800',
      onClick: onOpenBadges,
    },
  ];

  // Animated circular score geometry for Live Match card
  const scoreRadius = 38;
  const scoreCircumference = 2 * Math.PI * scoreRadius;
  const scoreOffset = scoreCircumference * (1 - 0.94);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* ======================================================== */}
      {/* MOBILE COMPACT PLATFORM HIGHLIGHTS RAIL (< md)           */}
      {/* ======================================================== */}
      <div className="md:hidden space-y-3">
        <div className="flex items-end justify-between gap-2">
          <div>
            <div className="text-[11px] font-extrabold text-indigo-700 flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-indigo-600" />
              <span>Built For Real Planners</span>
            </div>
            <h2 className="text-lg font-extrabold text-slate-950 tracking-tight leading-snug">
              Relocate Abroad with Clarity
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigateView('visa-check')}
            className="text-xs font-extrabold text-teal-700 hover:text-teal-900 inline-flex items-center gap-0.5 shrink-0 min-h-[36px] cursor-pointer"
          >
            <span>Visa Check</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory -mx-4 px-4 no-scrollbar">
          {mobileQuickModules.map(mod => {
            const Icon = mod.icon;
            return (
              <button
                key={mod.id}
                type="button"
                onClick={mod.onClick}
                className={`snap-start shrink-0 w-[228px] p-4 rounded-2xl bg-gradient-to-br ${mod.gradient} border text-left shadow-xs active:scale-[0.98] transition-transform flex flex-col justify-between gap-3 cursor-pointer`}
              >
                <div className="space-y-2">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${mod.iconBg} text-white flex items-center justify-center shadow-sm`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-950">{mod.title}</h3>
                    <p className="text-xs text-slate-600 leading-snug mt-0.5">{mod.desc}</p>
                  </div>
                </div>
                <div className={`text-xs font-extrabold ${mod.ctaColor} inline-flex items-center gap-1`}>
                  <span>{mod.cta}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* DESKTOP & TABLET FULL ECOSYSTEM BENTO SHOWCASE (>= md)   */}
      {/* ======================================================== */}
      <div className="hidden md:block">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-extrabold text-indigo-700">
            <Compass className="w-4 h-4 text-indigo-600" />
            <span>Built For Real Planners</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="text-teal-700">8 Integrated Relocation Tools</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-950 tracking-tight text-balance">
            Everything You Need to{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-teal-600 to-amber-600 bg-clip-text text-transparent">
              Relocate Abroad with Clarity
            </span>
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
            No vague sales pitches or sponsored real estate ads. Raw empirical living data, official passport &amp; visa treaty checks, scouting trip planners, and real expat communities in one bright workspace.
          </p>
        </div>

        {/* Interactive 4-Stage Relocation Roadmap Infographic Ribbon */}
        <div className="mb-7 rounded-3xl bg-gradient-to-r from-indigo-50/90 via-sky-50/80 to-teal-50/90 border border-indigo-200/80 p-4 lg:p-5 shadow-xs">
          <div className="grid grid-cols-4 gap-3 relative">
            {[
              {
                num: '01',
                title: 'Match Your Haven',
                detail: `${countriesCount} countries · 55+ metrics`,
                accent: 'from-indigo-600 to-violet-600',
                onClick: () => onScrollTo('haven-matcher'),
              },
              {
                num: '02',
                title: 'Check Passport & Visas',
                detail: 'Official treaties & US/Schengen perks',
                accent: 'from-teal-600 to-emerald-600',
                onClick: () => onNavigateView('visa-check'),
              },
              {
                num: '03',
                title: 'Model FIRE & Runway',
                detail: '3%–5% SWR & monthly burn math',
                accent: 'from-amber-500 to-orange-600',
                onClick: () => onNavigateView('fire-calculator'),
              },
              {
                num: '04',
                title: 'Scout, Meet & Earn Badges',
                detail: 'Multi-stop trips & local expat circles',
                accent: 'from-rose-500 to-indigo-600',
                onClick: () => onNavigateView('scout'),
              },
            ].map((stage, idx) => (
              <button
                key={stage.num}
                type="button"
                onClick={stage.onClick}
                className="group relative flex items-center gap-3 p-3 rounded-2xl bg-white/90 hover:bg-white border border-white hover:border-indigo-200 transition-all text-left shadow-2xs hover:shadow-md cursor-pointer"
              >
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${stage.accent} text-white font-mono font-extrabold text-xs flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform`}>
                  {stage.num}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-extrabold text-slate-950 truncate">{stage.title}</div>
                  <div className="text-[11px] text-slate-600 truncate">{stage.detail}</div>
                </div>
                {idx < 3 && (
                  <ChevronRight className="hidden lg:block w-4 h-4 text-indigo-300 group-hover:text-indigo-600 shrink-0 ml-auto transition-colors" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ROW 1: ASYMMETRIC MARQUEE BENTO (7 cols Visa Check + 5 cols Live Match Scoring) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6 items-stretch">
          {/* Marquee Card 1: Global Visa Check & Passport Mobility (7 cols) */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            className="lg:col-span-7 relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-50/90 via-white to-sky-50/85 border border-teal-200/90 shadow-sm hover:shadow-xl hover:shadow-teal-950/5 transition-shadow grid grid-cols-1 md:grid-cols-12"
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 via-sky-500 to-indigo-500" />
            <div className="md:col-span-7 p-6 lg:p-7 flex flex-col justify-between gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-teal-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-teal-500/20 shrink-0">
                    <Stamp className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-teal-700">Passport &amp; Treaty Intelligence</div>
                    <h3 className="text-xl font-extrabold text-slate-950 leading-tight">
                      Global Visa Check &amp; Mobility
                    </h3>
                  </div>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed">
                  Select your nationality, exact passport class (Ordinary, Official, Diplomatic, or Special), and visas you already hold like U.S. B1/B2 or Schengen. Verify entry requirements with 155+ live official government &amp; bilateral waiver links.
                </p>

                {/* Animated Mini Infographic: Passport Reach Spectrum */}
                <div className="p-3.5 rounded-2xl bg-white/90 border border-teal-100 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                    <span>Entry Leverage Breakdown</span>
                    <span className="font-mono tabular-nums text-teal-700">Official + Bilateral Treaties</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden flex gap-0.5">
                    <motion.div
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                      style={{ width: '44%', transformOrigin: 'left' }}
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-l-full"
                    />
                    <motion.div
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.65, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                      style={{ width: '24%', transformOrigin: 'left' }}
                      className="h-full bg-sky-500"
                    />
                    <motion.div
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.65, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
                      style={{ width: '20%', transformOrigin: 'left' }}
                      className="h-full bg-indigo-500"
                    />
                    <div style={{ width: '12%' }} className="h-full bg-amber-400 rounded-r-full" />
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-600 font-medium">
                    <span className="text-emerald-700 font-semibold">Visa-Free</span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span className="text-sky-700 font-semibold">eTA / VoA</span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span className="text-indigo-700 font-semibold">US/Schengen Bonus</span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span className="text-amber-700 font-semibold">BVWA Treaties</span>
                  </div>
                </div>
              </div>

              <div className="pt-1 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => onNavigateView('visa-check')}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-500 hover:to-indigo-500 text-white text-xs font-extrabold shadow-sm inline-flex items-center gap-1.5 cursor-pointer transition-all whitespace-nowrap"
                >
                  <span>Open Global Visa Check</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs text-slate-500 font-medium">
                  Diplomatic vs. Official verified
                </span>
              </div>
            </div>

            <div className="md:col-span-5 relative min-h-[210px] bg-gradient-to-br from-amber-50 via-orange-50/40 to-teal-100/60 overflow-hidden">
              {!passportsImgErr ? (
                <img
                  src={visaPassportsImg}
                  alt="International Ordinary, Official, and Diplomatic passport booklets beside a brass compass"
                  referrerPolicy="no-referrer"
                  onError={() => setPassportsImgErr(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-teal-700 gap-2">
                  <FileBadge className="w-10 h-10" />
                  <span className="text-xs font-bold">Global Visa &amp; Passport Explorer</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Marquee Card 2: Live Haven Match Scoring (5 cols) */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            className="lg:col-span-5 relative overflow-hidden p-6 lg:p-7 rounded-3xl bg-gradient-to-br from-indigo-50/90 via-white to-violet-50/75 border border-indigo-200/90 shadow-sm hover:shadow-xl hover:shadow-indigo-950/5 transition-shadow flex flex-col justify-between gap-5"
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />
            <div className="space-y-3.5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-indigo-700">Retiree &amp; Nomad Modes</div>
                    <h3 className="text-xl font-extrabold text-slate-950 leading-tight">
                      Live Haven Match Scoring
                    </h3>
                  </div>
                </div>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed">
                Tune your monthly budget, continent, and priorities—from healthcare and safety to fiber speeds and coworking—for live mathematical rankings across all {countriesCount} havens.
              </p>

              {/* Animated Match Score Donut + Factor Bars Infographic */}
              <div className="p-3.5 rounded-2xl bg-white/90 border border-indigo-100 flex items-center gap-4">
                <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                  <svg viewBox="0 0 92 92" className="w-full h-full -rotate-90" aria-hidden="true">
                    <defs>
                      <linearGradient id="homeMatchGauge" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#4f46e5" />
                        <stop offset="100%" stopColor="#0d9488" />
                      </linearGradient>
                    </defs>
                    <circle cx="46" cy="46" r={scoreRadius} fill="none" stroke="#e2e8f0" strokeWidth="8" />
                    <motion.circle
                      cx="46"
                      cy="46"
                      r={scoreRadius}
                      fill="none"
                      stroke="url(#homeMatchGauge)"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={scoreCircumference}
                      initial={{ strokeDashoffset: scoreCircumference }}
                      whileInView={{ strokeDashoffset: scoreOffset }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-base font-black text-slate-950 font-mono tabular-nums leading-none">94%</span>
                    <span className="text-[9px] font-bold text-indigo-600 mt-0.5">Fit Score</span>
                  </div>
                </div>

                <div className="flex-1 space-y-2 min-w-0">
                  {[
                    { label: 'Budget Fit', pct: '92%', bar: 'bg-indigo-500' },
                    { label: 'Healthcare & Safety', pct: '89%', bar: 'bg-teal-500' },
                    { label: 'Fiber & Travel Ease', pct: '96%', bar: 'bg-violet-500' },
                  ].map(row => (
                    <div key={row.label} className="space-y-0.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-slate-700 truncate">{row.label}</span>
                        <span className="font-mono tabular-nums font-bold text-slate-900">{row.pct}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div className={`h-full rounded-full ${row.bar}`} style={{ width: row.pct }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-1">
              <button
                type="button"
                onClick={() => onScrollTo('haven-matcher')}
                className="text-xs font-extrabold text-indigo-700 hover:text-indigo-950 inline-flex items-center gap-1 group cursor-pointer"
              >
                <span>Try Match Engine below</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        </div>

        {/* ROW 2: 3 VISUAL EDITORIAL CARDS (FIRE Geo-Arbitrage, Scout & Hop, Expats & Meetups) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 items-stretch">
          {/* Card 3: FIRE Geo-Arbitrage & Nomad Runway */}
          <motion.div
            whileHover={{ y: -5 }}
            transition={{ type: 'spring', stiffness: 320, damping: 24 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-50/85 via-white to-orange-50/70 border border-amber-200/90 shadow-sm hover:shadow-xl hover:shadow-amber-950/5 transition-shadow flex flex-col"
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 z-10" />
            <div className="relative h-40 w-full overflow-hidden bg-gradient-to-br from-amber-50 to-orange-100/60">
              {!fireImgErr ? (
                <img
                  src={fireLifestyleImg}
                  alt="Bright coastal home balcony opening to turquoise sea and pine hills"
                  referrerPolicy="no-referrer"
                  onError={() => setFireImgErr(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-orange-600">
                  <Flame className="w-10 h-10" />
                </div>
              )}
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between gap-4">
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-sm shrink-0">
                    <Flame className="w-4 h-4" />
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-950 leading-snug">
                    FIRE Geo-Arbitrage &amp; Runway
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Model exact 3.0%–5.0% safe withdrawal rates abroad or calculate your digital nomad cash runway. See how $2,200/mo vs $5,000/mo halves your required nest egg.
                </p>
              </div>
              <div className="pt-2 border-t border-amber-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onNavigateView('fire-calculator')}
                  className="text-xs font-extrabold text-orange-700 hover:text-orange-950 inline-flex items-center gap-1 group cursor-pointer"
                >
                  <span>Simulate FIRE &amp; Runway</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
                <span className="text-[11px] font-mono font-bold text-amber-800">40–65% Less Capital</span>
              </div>
            </div>
          </motion.div>

          {/* Card 4: Scout & Hop Multi-Country Trip Planner */}
          <motion.div
            whileHover={{ y: -5 }}
            transition={{ type: 'spring', stiffness: 320, damping: 24 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-50/85 via-white to-indigo-50/75 border border-sky-200/90 shadow-sm hover:shadow-xl hover:shadow-sky-950/5 transition-shadow flex flex-col"
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-500 via-indigo-500 to-violet-500 z-10" />
            <div className="relative h-40 w-full overflow-hidden bg-gradient-to-br from-sky-50 to-indigo-100/60">
              {!scoutImgErr ? (
                <img
                  src={scoutHopItineraryImg}
                  alt="Illustrated coastal scouting travel map with wooden markers, journal, and brass compass"
                  referrerPolicy="no-referrer"
                  onError={() => setScoutImgErr(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sky-600">
                  <Plane className="w-10 h-10" />
                </div>
              )}
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between gap-4">
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white flex items-center justify-center shadow-sm shrink-0">
                    <Plane className="w-4 h-4" />
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-950 leading-snug">
                    Scout &amp; Hop Trip Planner
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Test-drive your top 3 countries before relocating. Map seasonal multi-stop itineraries, budget your scouting loop, and compare neighborhoods firsthand.
                </p>
              </div>
              <div className="pt-2 border-t border-sky-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onNavigateView('scout')}
                  className="text-xs font-extrabold text-sky-700 hover:text-indigo-950 inline-flex items-center gap-1 group cursor-pointer"
                >
                  <span>Build Scout &amp; Hop Trip</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
                <span className="text-[11px] font-semibold text-sky-800 inline-flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>Multi-Stop</span>
                </span>
              </div>
            </div>
          </motion.div>

          {/* Card 5: Expat Directory & Local Meetups */}
          <motion.div
            whileHover={{ y: -5 }}
            transition={{ type: 'spring', stiffness: 320, damping: 24 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-50/80 via-white to-amber-50/70 border border-rose-200/85 shadow-sm hover:shadow-xl hover:shadow-rose-950/5 transition-shadow flex flex-col"
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 z-10" />
            <div className="relative h-40 w-full overflow-hidden bg-gradient-to-br from-rose-50 to-amber-100/60">
              {!meetupImgErr ? (
                <img
                  src={expatMeetupImg}
                  alt="International expats and early retirees chatting over morning coffee at a sunlit European plaza"
                  referrerPolicy="no-referrer"
                  onError={() => setMeetupImgErr(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-rose-600">
                  <Users className="w-10 h-10" />
                </div>
              )}
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between gap-4">
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 text-white flex items-center justify-center shadow-sm shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-950 leading-snug">
                    Expats Hub &amp; Local Meetups
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Browse real expat profiles by destination, swap relocation notes via direct messages, and RSVP to coffee socials and scouting dinners worldwide.
                </p>
              </div>
              <div className="pt-2 border-t border-rose-100 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => onNavigateView('community')}
                  className="text-xs font-extrabold text-rose-700 hover:text-rose-950 inline-flex items-center gap-1 group cursor-pointer"
                >
                  <span>Explore Expats</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateView('meetups')}
                  className="text-xs font-extrabold text-orange-700 hover:text-orange-950 inline-flex items-center gap-1 group cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Meetups</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ROW 3: COMPACT POWER-TOOLS STRIP (Profile Badges, Explorer & Compare, Member Workspace) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Power Tool 1: Profile Badges & Milestones */}
          <motion.div
            whileHover={{ y: -3 }}
            transition={{ type: 'spring', stiffness: 320, damping: 24 }}
            className="p-5 rounded-2xl bg-gradient-to-br from-amber-50/80 via-white to-yellow-50/75 border border-amber-200/90 shadow-xs flex flex-col justify-between gap-3"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 text-white flex items-center justify-center shadow-sm shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-extrabold text-slate-950">Verified Profile Badges</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Earn milestone badges as you shortlist havens, complete scouting hops, host expat meetups, and share field reports.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-amber-100/90">
              <span className="text-[11px] font-semibold text-amber-800">Scout · FIRE · Community Tiers</span>
              <button
                type="button"
                onClick={onOpenBadges}
                className="text-xs font-extrabold text-amber-800 hover:text-amber-950 inline-flex items-center gap-0.5 group cursor-pointer"
              >
                <span>Explore Badges</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </motion.div>

          {/* Power Tool 2: Advanced Haven Explorer & Compare */}
          <motion.div
            whileHover={{ y: -3 }}
            transition={{ type: 'spring', stiffness: 320, damping: 24 }}
            className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/75 border border-emerald-200/90 shadow-xs flex flex-col justify-between gap-3"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-sm shrink-0">
                <SlidersHorizontal className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-extrabold text-slate-950">Haven Explorer &amp; Side-by-Side Compare</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Filter all {countriesCount} countries by climate, D7 / DTV visas, healthcare, tax status, and compare finalists side by side.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-emerald-100/90">
              <button
                type="button"
                onClick={onOpenExplorer}
                className="text-xs font-extrabold text-teal-700 hover:text-teal-950 inline-flex items-center gap-0.5 group cursor-pointer"
              >
                <span>Explore Havens</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button
                type="button"
                onClick={() => onNavigateView('compare')}
                className="text-xs font-extrabold text-emerald-700 hover:text-emerald-950 inline-flex items-center gap-0.5 cursor-pointer"
              >
                <span>Compare Countries</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>

          {/* Power Tool 3: Direct Messaging & Saved Dossiers */}
          <motion.div
            whileHover={{ y: -3 }}
            transition={{ type: 'spring', stiffness: 320, damping: 24 }}
            className="p-5 rounded-2xl bg-gradient-to-br from-violet-50/80 via-white to-indigo-50/75 border border-violet-200/90 shadow-xs flex flex-col justify-between gap-3"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white flex items-center justify-center shadow-sm shrink-0">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-extrabold text-slate-950">Saved Blueprints &amp; Member DMs</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Export printable country PDF dossiers, sync your FIRE portfolio in the cloud, and message expats already living there.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-violet-100/90">
              <span className="text-[11px] font-semibold text-violet-800">100% Free Member Portal</span>
              <button
                type="button"
                onClick={() => (isGuestUser ? onOpenAuth('signup') : onNavigateView('dashboard'))}
                className="text-xs font-extrabold text-indigo-700 hover:text-indigo-950 inline-flex items-center gap-0.5 group cursor-pointer"
              >
                <span>{isGuestUser ? 'Create Free Account' : 'Open Dashboard'}</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// ============================================================================
// 3. PORTAL BLUEPRINT INFOGRAPHIC (BOTTOM LIGHT-GRADIENT CTA RIGHT COLUMN)
// ============================================================================

interface PortalBlueprintInfographicProps {
  countriesCount: number;
  onNavigateView: (view: AppView) => void;
  onOpenBadges: () => void;
}

export const PortalBlueprintInfographic: React.FC<PortalBlueprintInfographicProps> = ({
  countriesCount,
  onNavigateView,
  onOpenBadges,
}) => {
  const milestones = [
    {
      label: 'Passport & Visa Rules Verified',
      detail: 'Official foreign ministry & BVWA treaty links',
      pct: 100,
      color: 'from-teal-500 to-emerald-500',
      icon: Stamp,
      onClick: () => onNavigateView('visa-check'),
    },
    {
      label: `Top Havens Shortlisted (${countriesCount} Rated)`,
      detail: 'Healthcare, safety, taxes & fiber scored',
      pct: 88,
      color: 'from-indigo-500 to-violet-500',
      icon: ShieldCheck,
      onClick: () => onNavigateView('explore'),
    },
    {
      label: 'Scout & Hop Itinerary Ready',
      detail: 'Multi-country test-drive & local expat meetups',
      pct: 76,
      color: 'from-sky-500 to-indigo-500',
      icon: Plane,
      onClick: () => onNavigateView('scout'),
    },
    {
      label: 'Member Badges & Expat Network',
      detail: 'Earn verified planner & scout milestones',
      pct: 64,
      color: 'from-amber-500 to-orange-500',
      icon: Award,
      onClick: onOpenBadges,
    },
  ];

  return (
    <div className="rounded-3xl bg-white/95 backdrop-blur-md border border-indigo-200/80 p-5 sm:p-6 shadow-lg shadow-indigo-950/5 space-y-4">
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div>
          <div className="text-[11px] font-extrabold text-indigo-700">Your Member Blueprint</div>
          <h3 className="text-base font-extrabold text-slate-950">Relocation Readiness Tracker</h3>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-teal-600 text-white flex items-center justify-center shadow-sm">
          <CheckCircle2 className="w-5 h-5" />
        </div>
      </div>

      <div className="space-y-3">
        {milestones.map((m, idx) => {
          const Icon = m.icon;
          return (
            <button
              key={m.label}
              type="button"
              onClick={m.onClick}
              className="w-full text-left p-3 rounded-2xl bg-gradient-to-r from-slate-50/90 to-white hover:from-indigo-50/70 hover:to-teal-50/60 border border-slate-200/80 hover:border-indigo-200 transition-all group cursor-pointer space-y-2"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${m.color} text-white flex items-center justify-center shrink-0 shadow-xs`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-extrabold text-slate-900 truncate group-hover:text-indigo-700 transition-colors">
                    {m.label}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">{m.detail}</div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all shrink-0" />
              </div>
              <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <motion.div
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: m.pct / 100 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.75, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  style={{ transformOrigin: 'left' }}
                  className={`h-full w-full rounded-full bg-gradient-to-r ${m.color}`}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
