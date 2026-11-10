import React from 'react';
import { motion } from 'motion/react';
import { Globe, Languages, Compass, Sparkles, Award, Star, Crown, Flame, ChevronRight, CheckCircle2, LucideIcon } from 'lucide-react';
import { EarnedBadge, BadgeProgress } from '../types/badges';

const ICON_MAP: Record<string, LucideIcon> = {
  Globe,
  Languages,
  Compass,
  Sparkles,
  Award,
  Star,
  Crown,
  Flame,
};

interface BadgeShowcaseCardProps {
  badge: EarnedBadge;
  onOpenCodex?: () => void;
}

export const BadgeShowcaseCard: React.FC<BadgeShowcaseCardProps> = ({ badge, onOpenCodex }) => {
  const IconComponent = ICON_MAP[badge.iconName] || Award;

  return (
    <motion.div
      whileHover={{ y: -3 }}
      className={`relative overflow-hidden rounded-2xl border p-4 bg-white/95 shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-3 ${badge.borderClass}`}
    >
      {/* Top accent line */}
      <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${badge.accentGradient}`} />

      <div className="flex items-start gap-3.5">
        {/* Glowing Badge Disc / Medal */}
        <div className={`relative p-2.5 rounded-2xl bg-gradient-to-br ${badge.accentGradient} text-white shadow-sm shrink-0 flex items-center justify-center`}>
          <IconComponent className="w-6 h-6" />
          <div className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full bg-slate-900 border border-white/60 text-[9px] font-mono font-bold text-amber-300">
            T{badge.tierLevel}
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            <h4 className="text-sm font-extrabold text-slate-900 truncate">
              {badge.tierName}
            </h4>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
              {badge.category}
            </span>
          </div>
          <p className="text-[11px] font-semibold text-slate-600 mt-0.5 line-clamp-1">
            {badge.tagline}
          </p>
          <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
            {badge.description}
          </p>
        </div>
      </div>

      {/* Next Tier Progression Bar if applicable */}
      {badge.nextTier ? (
        <div className="pt-2 border-t border-slate-100 space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-bold">
            <span className="text-slate-500">
              Next: <strong className="text-slate-800">{badge.nextTier.name}</strong> ({badge.nextTier.threshold} {badge.nextTier.unitLabel})
            </span>
            <span className="text-indigo-600 font-mono">
              {badge.currentValue} / {badge.nextTier.threshold} ({badge.nextTierProgressPercent}%)
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${badge.nextTierProgressPercent || 0}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={`h-full rounded-full bg-gradient-to-r ${badge.nextTier.accentGradient}`}
            />
          </div>
        </div>
      ) : (
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-emerald-700">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Highest Tier Unlocked</span>
          </span>
          {onOpenCodex && (
            <button
              onClick={onOpenCodex}
              className="text-slate-400 hover:text-indigo-600 transition-colors flex items-center gap-0.5 cursor-pointer"
            >
              <span>Guide</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
};

interface BadgeProgressRowProps {
  progress: BadgeProgress;
  onOpenCodex?: () => void;
}

export const BadgeProgressRow: React.FC<BadgeProgressRowProps> = ({ progress, onOpenCodex }) => {
  const badge = progress.badge;
  const currentTier = progress.highestEarnedTier;
  const nextTier = progress.nextTier;
  const IconComponent = currentTier ? ICON_MAP[currentTier.iconName] || Award : Award;

  return (
    <div className="p-3.5 rounded-xl border border-slate-200/90 bg-white hover:border-indigo-200 transition-colors space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
              progress.isUnlocked && currentTier
                ? `bg-gradient-to-br ${currentTier.accentGradient} text-white shadow-2xs`
                : 'bg-slate-100 text-slate-400'
            }`}
          >
            <IconComponent className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-slate-900 truncate">{badge.name}</h4>
              {progress.isUnlocked && currentTier && (
                <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold border ${currentTier.pillBgClass}`}>
                  {currentTier.name}
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-500 truncate">{badge.shortDescription}</p>
          </div>
        </div>

        {onOpenCodex && (
          <button
            onClick={onOpenCodex}
            className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors shrink-0 flex items-center gap-0.5 cursor-pointer"
          >
            <span>Tiers</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Progress track */}
      {badge.id === 'early-pioneer' ? (
        progress.isUnlocked ? (
          <div className="text-[10px] font-bold text-emerald-700 flex items-center justify-between pt-1 border-t border-slate-100">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Founding Cohort Member: <strong>{currentTier?.name}</strong></span>
            </span>
            <span className="text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md font-semibold text-[9px]">
              {currentTier?.tagline}
            </span>
          </div>
        ) : (
          <div className="text-[10px] font-semibold text-slate-400 flex items-center gap-1 pt-1 border-t border-slate-100">
            <span>Inaugural cohort membership limit reached.</span>
          </div>
        )
      ) : nextTier ? (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
            <span>
              Progress to {nextTier.name}: {progress.currentValue} / {nextTier.threshold} {nextTier.unitLabel}
            </span>
            <span className="text-indigo-600 font-mono">
              {progress.remainingToNextTier} more needed
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${nextTier.accentGradient}`}
              style={{ width: `${progress.progressPercent}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>Maximum Tier Achieved ({progress.currentValue} {badge.tiers?.[0]?.unitLabel || 'points'})</span>
        </div>
      )}
    </div>
  );
};
