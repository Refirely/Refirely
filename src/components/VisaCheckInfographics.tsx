import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { CountryFlag } from './CountryFlag';
import {
  CountryPassportType,
  GlobalDestinationAccess,
  VisaRegion,
  VisaRequirementStatus,
  VisaWorldCountry,
} from '../types/visaCheck';
import {
  CheckCircle2,
  Compass,
  FileCheck2,
  Globe,
  Landmark,
  Plane,
  ShieldAlert,
  ShieldCheck,
  Stamp,
  Ticket,
} from 'lucide-react';
import visaPassportsImg from '../assets/images/visa_passports_infographic_1795241302411.jpg';
import visaMobilityWorldImg from '../assets/images/visa_mobility_world_1795241174950.jpg';

// ============================================================================
// 1. LIVE MINIATURE PASSPORT BOOKLET GRAPHIC (DYNAMICALLY COLORED BY TYPE)
// ============================================================================

interface PassportBookletGraphicProps {
  countryCode: string;
  countryName: string;
  passport: CountryPassportType;
  size?: 'sm' | 'md';
}

export const PassportBookletGraphic: React.FC<PassportBookletGraphicProps> = ({
  countryCode,
  countryName,
  passport,
  size = 'md',
}) => {
  const isLightCover =
    passport.coverColorHex.toLowerCase() === '#e2e8f0' ||
    passport.coverColor.toLowerCase().includes('white');

  const inkColor = isLightCover ? '#1e293b' : '#fef3c7';
  const mutedInk = isLightCover ? '#475569' : 'rgba(254, 243, 199, 0.78)';
  const spineBg = isLightCover ? 'rgba(15, 23, 42, 0.08)' : 'rgba(255, 255, 255, 0.14)';

  const dims =
    size === 'sm'
      ? 'w-12 h-[64px] rounded-r-md rounded-l-xs p-1.5'
      : 'w-[68px] h-[92px] rounded-r-lg rounded-l-xs p-2';

  const shortCategory =
    passport.category === 'diplomatic'
      ? 'DIPLO'
      : passport.category === 'official'
      ? 'OFFICIAL'
      : passport.category === 'service'
      ? 'SERVICE'
      : passport.category === 'special'
      ? 'SPECIAL'
      : passport.category === 'public_affairs'
      ? 'PUBLIC'
      : passport.category === 'passport_card'
      ? 'CARD'
      : 'PASSPORT';

  return (
    <motion.div
      key={`${countryCode}-${passport.id}`}
      initial={{ opacity: 0.7, scale: 0.94, rotateY: -12 }}
      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
      whileHover={{ y: -2, scale: 1.03 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      title={`${countryName} — ${passport.label}`}
      className={`relative shrink-0 select-none overflow-hidden shadow-md border ${
        isLightCover ? 'border-slate-300' : 'border-black/15'
      } flex flex-col items-center justify-between ${dims}`}
      style={{ backgroundColor: passport.coverColorHex }}
    >
      {/* Left Binding Spine */}
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-1.5"
        style={{ backgroundColor: spineBg }}
      />
      {/* Diagonal Soft Paper Sheen */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/25"
      />

      {/* Country Code Header */}
      <span
        className={`relative z-10 font-mono font-bold tracking-wider leading-none ${
          size === 'sm' ? 'text-[8px]' : 'text-[9px]'
        }`}
        style={{ color: mutedInk }}
      >
        {countryCode}
      </span>

      {/* Embossed Globe Crest SVG */}
      <svg
        viewBox="0 0 32 32"
        className={`relative z-10 ${size === 'sm' ? 'w-5 h-5' : 'w-7 h-7'}`}
        fill="none"
        aria-hidden="true"
      >
        <circle cx="16" cy="16" r="11" stroke={inkColor} strokeWidth="1.5" />
        <ellipse cx="16" cy="16" rx="5.5" ry="11" stroke={inkColor} strokeWidth="1.2" />
        <line x1="5" y1="16" x2="27" y2="16" stroke={inkColor} strokeWidth="1.2" />
        <path d="M7.5 10.5C10.5 12 21.5 12 24.5 10.5" stroke={inkColor} strokeWidth="1" />
        <path d="M7.5 21.5C10.5 20 21.5 20 24.5 21.5" stroke={inkColor} strokeWidth="1" />
      </svg>

      {/* Category + Biometric e-Passport Chip Mark */}
      <div className="relative z-10 flex flex-col items-center gap-0.5">
        <span
          className={`font-mono font-bold tracking-wide leading-none ${
            size === 'sm' ? 'text-[6.5px]' : 'text-[7.5px]'
          }`}
          style={{ color: inkColor }}
        >
          {shortCategory}
        </span>
        <span
          aria-hidden="true"
          className="inline-flex items-center justify-center w-3.5 h-2 rounded-[1px] border"
          style={{ borderColor: mutedInk }}
        >
          <span
            className="w-1 h-1 rounded-full"
            style={{ backgroundColor: mutedInk }}
          />
        </span>
      </div>
    </motion.div>
  );
};

// ============================================================================
// 2. ANIMATED FLIGHT ROUTE ARC GRAPHIC (VERDICT CARD HEADER)
// ============================================================================

interface FlightRouteArcGraphicProps {
  origin: VisaWorldCountry;
  destination: VisaWorldCountry;
  status: VisaRequirementStatus;
  shortStatusLabel: string;
}

function getRouteArcPalette(status: VisaRequirementStatus) {
  switch (status) {
    case 'domestic':
    case 'freedom_of_movement':
    case 'visa_free':
      return {
        stroke: '#059669',
        bg: 'from-emerald-50/90 via-teal-50/70 to-emerald-50/90 border-emerald-200/80',
        planeBg: 'bg-emerald-600 text-white',
        text: 'text-emerald-800',
      };
    case 'visa_free_conditional':
      return {
        stroke: '#0d9488',
        bg: 'from-teal-50/90 via-cyan-50/70 to-teal-50/90 border-teal-200/80',
        planeBg: 'bg-teal-600 text-white',
        text: 'text-teal-800',
      };
    case 'eta_required':
      return {
        stroke: '#0284c7',
        bg: 'from-sky-50/90 via-indigo-50/60 to-sky-50/90 border-sky-200/80',
        planeBg: 'bg-sky-600 text-white',
        text: 'text-sky-800',
      };
    case 'visa_on_arrival':
      return {
        stroke: '#4f46e5',
        bg: 'from-indigo-50/90 via-violet-50/65 to-indigo-50/90 border-indigo-200/80',
        planeBg: 'bg-indigo-600 text-white',
        text: 'text-indigo-800',
      };
    case 'e_visa':
      return {
        stroke: '#d97706',
        bg: 'from-amber-50/90 via-orange-50/60 to-amber-50/90 border-amber-200/80',
        planeBg: 'bg-amber-600 text-white',
        text: 'text-amber-900',
      };
    case 'visa_required':
      return {
        stroke: '#e11d48',
        bg: 'from-rose-50/90 via-pink-50/60 to-rose-50/90 border-rose-200/80',
        planeBg: 'bg-rose-600 text-white',
        text: 'text-rose-800',
      };
  }
}

export const FlightRouteArcGraphic: React.FC<FlightRouteArcGraphicProps> = ({
  origin,
  destination,
  status,
  shortStatusLabel,
}) => {
  const palette = getRouteArcPalette(status);

  return (
    <div
      className={`rounded-xl bg-gradient-to-r ${palette.bg} border px-3.5 py-3 sm:px-5 sm:py-3.5`}
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:gap-4">
        {/* Origin Node */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <CountryFlag
            countryCode={origin.code}
            countryName={origin.name}
            fallbackEmoji={origin.flag}
            size="md"
            className="rounded-xs shadow-xs shrink-0"
          />
          <div className="min-w-0">
            <div className="text-[11px] font-mono font-bold text-slate-500 leading-none">
              {origin.code}
            </div>
            <div className="text-xs sm:text-sm font-bold text-slate-900 truncate mt-0.5">
              {origin.name}
            </div>
          </div>
        </div>

        {/* Center Animated SVG Flight Arc */}
        <div className="flex flex-col items-center justify-center min-w-[104px] sm:min-w-[176px]">
          <div className="relative w-full h-9 flex items-center justify-center">
            <svg
              viewBox="0 0 180 40"
              className="w-full h-full overflow-visible"
              fill="none"
              aria-hidden="true"
            >
              {/* Soft background guide arc */}
              <path
                d="M 10 30 Q 90 2 170 30"
                stroke={palette.stroke}
                strokeOpacity="0.22"
                strokeWidth="2"
                strokeDasharray="4 4"
                strokeLinecap="round"
              />
              {/* Animated foreground arc */}
              <motion.path
                key={`${origin.code}-${destination.code}-${status}`}
                d="M 10 30 Q 90 2 170 30"
                stroke={palette.stroke}
                strokeWidth="2.4"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0.4 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
              />
              <circle cx="10" cy="30" r="3.5" fill={palette.stroke} />
              <circle cx="170" cy="30" r="3.5" fill={palette.stroke} />
            </svg>

            {/* Center Airplane Crest */}
            <motion.div
              key={`plane-${origin.code}-${destination.code}-${status}`}
              initial={{ opacity: 0, scale: 0.75, x: -16 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className={`absolute top-0.5 w-6 h-6 rounded-full flex items-center justify-center shadow-xs ${palette.planeBg}`}
            >
              <Plane className="w-3.5 h-3.5" />
            </motion.div>
          </div>
          <span
            className={`text-[11px] font-bold tracking-tight whitespace-nowrap -mt-0.5 ${palette.text}`}
          >
            {shortStatusLabel}
          </span>
        </div>

        {/* Destination Node */}
        <div className="flex items-center justify-end gap-2 sm:gap-2.5 min-w-0 text-right">
          <div className="min-w-0">
            <div className="text-[11px] font-mono font-bold text-slate-500 leading-none">
              {destination.code}
            </div>
            <div className="text-xs sm:text-sm font-bold text-slate-900 truncate mt-0.5">
              {destination.name}
            </div>
          </div>
          <CountryFlag
            countryCode={destination.code}
            countryName={destination.name}
            fallbackEmoji={destination.flag}
            size="md"
            className="rounded-xs shadow-xs shrink-0"
          />
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 3. INTERACTIVE GLOBAL MOBILITY INFOGRAPHIC (GAUGE + SPECTRUM + 6 REGIONS)
// ============================================================================

interface MobilityOverviewInfographicProps {
  globalAccessList: GlobalDestinationAccess[];
  mobilityStats: {
    totalDestinations: number;
    totalAccessibleNoEmbassy: number;
    visaFreeTotal: number;
    etaOrVoaTotal: number;
    eVisaTotal: number;
    visaRequiredTotal: number;
    unlockedByHeldVisaCount: number;
    unlockedByPassportTierCount: number;
    totalBonusUnlocked: number;
  };
  activeRegion: VisaRegion | 'All';
  onSelectRegion: (region: VisaRegion | 'All') => void;
}

const REGION_STYLE: Record<
  VisaRegion,
  { bar: string; tint: string; activeBorder: string; text: string }
> = {
  Europe: {
    bar: 'from-indigo-500 to-violet-500',
    tint: 'bg-indigo-50/75',
    activeBorder: 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50',
    text: 'text-indigo-800',
  },
  Asia: {
    bar: 'from-teal-500 to-emerald-500',
    tint: 'bg-teal-50/75',
    activeBorder: 'border-teal-500 ring-2 ring-teal-500/20 bg-teal-50',
    text: 'text-teal-800',
  },
  Americas: {
    bar: 'from-sky-500 to-blue-500',
    tint: 'bg-sky-50/75',
    activeBorder: 'border-sky-500 ring-2 ring-sky-500/20 bg-sky-50',
    text: 'text-sky-800',
  },
  'Middle East': {
    bar: 'from-amber-500 to-orange-500',
    tint: 'bg-amber-50/75',
    activeBorder: 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50',
    text: 'text-amber-900',
  },
  Africa: {
    bar: 'from-emerald-500 to-lime-500',
    tint: 'bg-emerald-50/75',
    activeBorder: 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50',
    text: 'text-emerald-800',
  },
  Oceania: {
    bar: 'from-cyan-500 to-teal-500',
    tint: 'bg-cyan-50/75',
    activeBorder: 'border-cyan-500 ring-2 ring-cyan-500/20 bg-cyan-50',
    text: 'text-cyan-900',
  },
};

const ORDERED_REGIONS: VisaRegion[] = [
  'Europe',
  'Asia',
  'Americas',
  'Middle East',
  'Africa',
  'Oceania',
];

export const MobilityOverviewInfographic: React.FC<MobilityOverviewInfographicProps> = ({
  globalAccessList,
  mobilityStats,
  activeRegion,
  onSelectRegion,
}) => {
  const total = Math.max(1, mobilityStats.totalDestinations);
  const accessPct = Math.round((mobilityStats.totalAccessibleNoEmbassy / total) * 100);

  // SVG Ring Math (radius = 48, circumference = 2 * pi * 48 ≈ 301.59)
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (accessPct / 100) * circumference;

  const regionBreakdown = useMemo(() => {
    const map = new Map<
      VisaRegion,
      { total: number; accessible: number; visaFree: number }
    >();
    for (const r of ORDERED_REGIONS) {
      map.set(r, { total: 0, accessible: 0, visaFree: 0 });
    }
    for (const item of globalAccessList) {
      const entry = map.get(item.destination.region);
      if (!entry) continue;
      entry.total += 1;
      if (item.status !== 'visa_required') entry.accessible += 1;
      if (
        item.status === 'freedom_of_movement' ||
        item.status === 'visa_free' ||
        item.status === 'visa_free_conditional'
      ) {
        entry.visaFree += 1;
      }
    }
    return ORDERED_REGIONS.map(region => {
      const data = map.get(region)!;
      const pct = data.total > 0 ? Math.round((data.accessible / data.total) * 100) : 0;
      return { region, ...data, pct };
    });
  }, [globalAccessList]);

  const vfPct = (mobilityStats.visaFreeTotal / total) * 100;
  const etaVoaPct = (mobilityStats.etaOrVoaTotal / total) * 100;
  const eVisaPct = (mobilityStats.eVisaTotal / total) * 100;
  const reqPct = Math.max(0, 100 - vfPct - etaVoaPct - eVisaPct);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-stretch">
      {/* Left 5 cols: Animated World Access Gauge + Stacked Spectrum Bar */}
      <div className="lg:col-span-5 rounded-2xl bg-gradient-to-br from-white via-indigo-50/45 to-teal-50/55 border border-indigo-200/80 p-5 sm:p-6 flex flex-col justify-between gap-5 shadow-xs">
        <div className="flex items-center gap-4 sm:gap-5">
          {/* Animated Circular Gauge SVG */}
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 shrink-0 flex items-center justify-center">
            <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90" aria-hidden="true">
              <defs>
                <linearGradient id="mobilityGaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0d9488" />
                  <stop offset="55%" stopColor="#4f46e5" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
              </defs>
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="11"
              />
              <motion.circle
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke="url(#mobilityGaugeGrad)"
                strokeWidth="11"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-950 font-mono tabular-nums leading-none">
                {accessPct}%
              </span>
              <span className="text-[11px] font-semibold text-indigo-700 mt-1">
                World Access
              </span>
            </div>
          </div>

          <div className="space-y-1.5 min-w-0">
            <div className="text-xs font-semibold text-indigo-700">
              Passport Mobility Score
            </div>
            <div className="text-lg sm:text-xl font-extrabold text-slate-950 leading-snug font-mono tabular-nums">
              {mobilityStats.totalAccessibleNoEmbassy}{' '}
              <span className="text-sm font-semibold text-slate-500">
                of {mobilityStats.totalDestinations} destinations
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Accessible via Visa-Free, eTA/ESTA, Visa on Arrival, or online e-Visa without visiting an embassy.
            </p>
          </div>
        </div>

        {/* Multi-Segment Stacked Spectrum Bar */}
        <div className="space-y-2.5 pt-1 border-t border-indigo-100/90">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
            <span>Global Entry Spectrum</span>
            <span className="font-mono tabular-nums text-slate-500">
              {mobilityStats.totalDestinations} total
            </span>
          </div>

          <div
            className="h-3.5 w-full rounded-full bg-slate-100 overflow-hidden flex gap-0.5 p-0.5 border border-slate-200/80"
            role="img"
            aria-label={`Visa-Free ${mobilityStats.visaFreeTotal}, eTA or Visa on Arrival ${mobilityStats.etaOrVoaTotal}, e-Visa ${mobilityStats.eVisaTotal}, Embassy Visa Required ${mobilityStats.visaRequiredTotal}`}
          >
            {vfPct > 0 && (
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                style={{ width: `${vfPct}%`, transformOrigin: 'left' }}
                className="h-full rounded-l-full bg-gradient-to-r from-emerald-500 to-teal-500"
                title={`Visa-Free: ${mobilityStats.visaFreeTotal}`}
              />
            )}
            {etaVoaPct > 0 && (
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.65, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
                style={{ width: `${etaVoaPct}%`, transformOrigin: 'left' }}
                className="h-full bg-gradient-to-r from-sky-500 to-indigo-500"
                title={`eTA / VoA: ${mobilityStats.etaOrVoaTotal}`}
              />
            )}
            {eVisaPct > 0 && (
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.65, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
                style={{ width: `${eVisaPct}%`, transformOrigin: 'left' }}
                className="h-full bg-gradient-to-r from-amber-400 to-amber-500"
                title={`Online e-Visa: ${mobilityStats.eVisaTotal}`}
              />
            )}
            {reqPct > 0 && (
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.65, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
                style={{ width: `${reqPct}%`, transformOrigin: 'left' }}
                className="h-full rounded-r-full bg-rose-300"
                title={`Embassy Visa Required: ${mobilityStats.visaRequiredTotal}`}
              />
            )}
          </div>

          {/* Clean Legend with Icons & Tabular Counts (No Color-Only State Signaling) */}
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
            <div className="flex items-center justify-between gap-1 text-emerald-800">
              <span className="inline-flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Visa-Free</span>
              </span>
              <span className="font-mono font-bold tabular-nums">{mobilityStats.visaFreeTotal}</span>
            </div>
            <div className="flex items-center justify-between gap-1 text-sky-900">
              <span className="inline-flex items-center gap-1.5 font-medium">
                <Ticket className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span>eTA / VoA</span>
              </span>
              <span className="font-mono font-bold tabular-nums">{mobilityStats.etaOrVoaTotal}</span>
            </div>
            <div className="flex items-center justify-between gap-1 text-amber-900">
              <span className="inline-flex items-center gap-1.5 font-medium">
                <FileCheck2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>e-Visa</span>
              </span>
              <span className="font-mono font-bold tabular-nums">{mobilityStats.eVisaTotal}</span>
            </div>
            <div className="flex items-center justify-between gap-1 text-rose-800">
              <span className="inline-flex items-center gap-1.5 font-medium">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span>Embassy Visa</span>
              </span>
              <span className="font-mono font-bold tabular-nums">{mobilityStats.visaRequiredTotal}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right 7 cols: Interactive 6-Continent Mobility Bar Chart */}
      <div className="lg:col-span-7 rounded-2xl bg-gradient-to-br from-white via-sky-50/40 to-indigo-50/45 border border-sky-200/80 p-5 sm:p-6 flex flex-col justify-between gap-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-950">
              Regional Reach Breakdown
            </h3>
            <p className="text-xs text-slate-600">
              Tap any continent bar to filter the destination grid below.
            </p>
          </div>
          {activeRegion !== 'All' && (
            <button
              type="button"
              onClick={() => onSelectRegion('All')}
              className="min-h-[36px] px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-xs font-bold text-indigo-800 transition-colors cursor-pointer whitespace-nowrap"
            >
              Show All Regions
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
          {regionBreakdown.map(({ region, accessible, total: regionTotal, visaFree, pct }) => {
            const style = REGION_STYLE[region];
            const isSelected = activeRegion === region;
            return (
              <button
                key={region}
                type="button"
                onClick={() => onSelectRegion(isSelected ? 'All' : region)}
                aria-pressed={isSelected}
                className={`min-h-[68px] p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? style.activeBorder
                    : `${style.tint} border-slate-200/80 hover:border-indigo-300 hover:bg-white`
                }`}
              >
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className={`font-bold ${style.text}`}>{region}</span>
                  <span className="font-mono font-bold text-slate-900 tabular-nums">
                    {accessible}
                    <span className="text-slate-400 font-normal">/{regionTotal}</span>
                    <span className="text-slate-500 font-medium ml-1.5">({pct}%)</span>
                  </span>
                </div>

                <div className="mt-2 h-2 w-full rounded-full bg-white/90 border border-slate-200/70 overflow-hidden">
                  <motion.div
                    key={`${region}-${accessible}-${regionTotal}`}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    style={{ width: `${pct}%`, transformOrigin: 'left' }}
                    className={`h-full rounded-full bg-gradient-to-r ${style.bar}`}
                  />
                </div>

                <div className="mt-1.5 text-[11px] text-slate-600 font-mono tabular-nums">
                  {visaFree} visa-free · {accessible - visaFree} eTA / VoA / e-Visa
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 4. EDITORIAL VISUAL GUIDE: HOW PASSPORT CLASS & HELD VISAS WORK
// ============================================================================

export const MobilityPillarsShowcase: React.FC = () => {
  const [passportsImgFailed, setPassportsImgFailed] = useState(false);
  const [worldImgFailed, setWorldImgFailed] = useState(false);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-14">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 items-stretch">
        {/* Visual Guide Card 1: Passport Types & Bilateral Agreements */}
        <article className="rounded-2xl bg-gradient-to-br from-white via-amber-50/40 to-indigo-50/45 border border-indigo-200/80 overflow-hidden shadow-xs flex flex-col">
          <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50/50 to-indigo-100/60">
            {!passportsImgFailed ? (
              <img
                src={visaPassportsImg}
                alt="International Ordinary, Official, Diplomatic, and Special passport covers fanned beside a brass compass"
                referrerPolicy="no-referrer"
                onError={() => setPassportsImgFailed(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-indigo-700">
                <Landmark className="w-10 h-10" />
                <span className="text-xs font-bold">Diplomatic, Official &amp; Ordinary Passports</span>
              </div>
            )}
          </div>

          <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700">
                <span>Passport Class Intelligence</span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span className="text-slate-500">Ordinary · Official · Diplomatic · Special</span>
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-950 leading-snug">
                Why Diplomatic vs. Official Passport Treaties Differ
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Sovereign states negotiate Bilateral Visa Waiver Agreements strictly by booklet class. Many European treaties (including India–Portugal, Germany, France, Italy, Spain, and EU–China Schengen) cover Diplomatic passports only while requiring visas for Official or Service booklets.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-indigo-100/90 text-xs">
              <div className="p-2.5 rounded-xl bg-white/90 border border-slate-200/80">
                <div className="font-bold text-slate-900">Ordinary</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Standard citizen rules</div>
              </div>
              <div className="p-2.5 rounded-xl bg-teal-50/80 border border-teal-200/80">
                <div className="font-bold text-teal-900">Official / Service</div>
                <div className="text-[11px] text-teal-700 mt-0.5">Dual-class pacts only</div>
              </div>
              <div className="p-2.5 rounded-xl bg-indigo-50/80 border border-indigo-200/80">
                <div className="font-bold text-indigo-950">Diplomatic</div>
                <div className="text-[11px] text-indigo-700 mt-0.5">Widest BVWA access</div>
              </div>
            </div>
          </div>
        </article>

        {/* Visual Guide Card 2: Power Visas & Third-Country Exemptions */}
        <article className="rounded-2xl bg-gradient-to-br from-white via-teal-50/45 to-sky-50/55 border border-teal-200/80 overflow-hidden shadow-xs flex flex-col">
          <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-gradient-to-br from-sky-50 via-teal-50 to-amber-50">
            {!worldImgFailed ? (
              <img
                src={visaMobilityWorldImg}
                alt="Global travel destinations connected by colorful teal, indigo, and coral flight ribbons"
                referrerPolicy="no-referrer"
                onError={() => setWorldImgFailed(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-teal-700">
                <Globe className="w-10 h-10" />
                <span className="text-xs font-bold">Third-Country Visa Reciprocity</span>
              </div>
            )}
          </div>

          <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-teal-700">
                <span>Multi-Visa Leverage</span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span className="text-slate-500">U.S. B1/B2 · Schengen · UK · Canada · GCC</span>
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-950 leading-snug">
                Unlock 35+ Bonus Destinations With Visas You Already Hold
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Holding a valid multiple-entry U.S., Schengen, UK, Canadian, Japanese, Australian, or GCC residence visa lets travelers bypass consular applications across Mexico, Central America, the Balkans, Cyprus, Georgia, the UAE, Saudi Arabia, and the Philippines.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-teal-100/90 text-xs">
              <div className="p-2.5 rounded-xl bg-sky-50/85 border border-sky-200/80">
                <div className="font-bold text-sky-950 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                  <span>U.S. / CA</span>
                </div>
                <div className="text-[11px] text-sky-800 mt-0.5">Americas + UAE + PH</div>
              </div>
              <div className="p-2.5 rounded-xl bg-indigo-50/85 border border-indigo-200/80">
                <div className="font-bold text-indigo-950 flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Schengen</span>
                </div>
                <div className="text-[11px] text-indigo-800 mt-0.5">Cyprus + Balkans + GE</div>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50/85 border border-emerald-200/80">
                <div className="font-bold text-emerald-950 flex items-center gap-1">
                  <Stamp className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>UK / GCC</span>
                </div>
                <div className="text-[11px] text-emerald-800 mt-0.5">Ireland + Gulf + TR</div>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
};
