import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Award,
  X,
  Globe,
  Languages,
  Star,
  Sparkles,
  Crown,
  CheckCircle2,
  Lock,
  ChevronRight,
  TrendingUp,
  Shield,
  Layers,
  Flame,
  UserCheck,
  Compass,
  ArrowUpRight,
} from 'lucide-react';
import { BADGE_DEFINITIONS, getAllBadgesProgress } from '../data/badgeDefinitions';
import { useApp } from '../context/AppContext';
import { BadgeCategory, BadgeTier } from '../types/badges';

interface BadgeCodexModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategory?: BadgeCategory | 'all' | 'user';
}

export const BadgeCodexModal: React.FC<BadgeCodexModalProps> = ({
  isOpen,
  onClose,
  initialCategory = 'all',
}) => {
  const {
    userProfile,
    currentUserId,
    registeredAccounts,
    earlyPioneerThreshold,
    openEditProfile,
  } = useApp();
  const activeAccount = registeredAccounts.find(a => a.id === currentUserId) || null;
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [activeTab, setActiveTab] = useState<'codex' | 'my-progress'>('codex');

  if (!isOpen) return null;

  const allProgress = getAllBadgesProgress(
    userProfile,
    activeAccount,
    earlyPioneerThreshold,
    registeredAccounts
  );

  const earnedBadgesCount = allProgress.filter(p => p.isUnlocked).length;

  const categories = [
    { id: 'all', label: 'All Badges', icon: Layers },
    { id: 'travel', label: 'Travel & Scouting', icon: Globe },
    { id: 'language', label: 'Languages', icon: Languages },
    { id: 'milestone', label: 'Founding & FIRE', icon: Star },
  ];

  const filteredBadges = BADGE_DEFINITIONS.filter(b => {
    if (selectedCategory === 'all') return true;
    return b.category === selectedCategory;
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          className="relative w-full max-w-4xl bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Top Multi-Color Header Bar */}
          <div className="h-2 bg-gradient-to-r from-amber-500 via-rose-500 via-purple-600 via-teal-500 to-indigo-600" />

          {/* Modal Header */}
          <div className="px-5 py-4 sm:px-7 sm:py-5 border-b border-slate-100 flex items-center justify-between gap-4 bg-gradient-to-b from-slate-50/80 to-white">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-600 text-white flex items-center justify-center shadow-md shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                    Refirely Honors &amp; Badge Codex
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-[10px] font-extrabold uppercase tracking-wider">
                    Official Guide
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Milestones, tier thresholds, and prestige honors awarded across the Refirely community
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors flex items-center justify-center shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Subheader / Tabs Row */}
          <div className="px-5 sm:px-7 py-3 border-b border-slate-100 bg-slate-50/60 flex flex-wrap items-center justify-between gap-3">
            {/* View Switcher: Codex vs My Progress */}
            <div className="flex items-center p-1 rounded-xl bg-slate-200/70 text-xs font-bold">
              <button
                onClick={() => setActiveTab('codex')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'codex'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Badge Directory &amp; Tiers
              </button>
              <button
                onClick={() => setActiveTab('my-progress')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'my-progress'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>My Honors</span>
                <span className="px-1.5 py-0.2 rounded-full bg-indigo-100 text-indigo-900 text-[10px] font-mono">
                  {earnedBadgesCount} Earned
                </span>
              </button>
            </div>

            {/* Category Filter Pills (when in codex mode) */}
            {activeTab === 'codex' && (
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {categories.map(cat => {
                  const Icon = cat.icon;
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? 'bg-slate-900 text-white shadow-2xs'
                          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Modal Body */}
          <div className="p-5 sm:p-7 overflow-y-auto space-y-6 flex-1">
            {activeTab === 'my-progress' ? (
              /* User Progress View */
              <div className="space-y-6">
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-indigo-50 via-teal-50 to-amber-50 border border-indigo-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Your Expat Credential Portfolio</span>
                    </span>
                    <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                      {userProfile.name}
                    </h3>
                    <p className="text-xs text-slate-600 max-w-xl">
                      Badges showcase your firsthand global exploration, multilingual capability, and early platform tenure across the public member directory and discussion forums.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      openEditProfile();
                    }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-teal-600 text-white text-xs font-bold hover:from-indigo-700 hover:to-teal-700 transition-all shadow-xs flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <span>Update Profile Data</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-3.5">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                    Badge Progress &amp; Next Milestones
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {allProgress.map(p => {
                      const badge = p.badge;
                      const highest = p.highestEarnedTier;
                      const next = p.nextTier;

                      return (
                        <div
                          key={badge.id}
                          className="p-4 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-3 flex flex-col justify-between"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                {badge.categoryLabel}
                              </span>
                              {p.isUnlocked ? (
                                <span className="flex items-center gap-1 text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Unlocked</span>
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                                  <Lock className="w-3 h-3" />
                                  <span>Locked</span>
                                </span>
                              )}
                            </div>

                            <div className="flex items-start gap-3">
                              <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                  highest
                                    ? `bg-gradient-to-br ${highest.accentGradient} text-white shadow-sm`
                                    : 'bg-slate-100 text-slate-400'
                                }`}
                              >
                                <Award className="w-5 h-5" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h5 className="text-sm font-extrabold text-slate-900 truncate">
                                  {highest ? highest.name : badge.name}
                                </h5>
                                <p className="text-[11px] text-slate-500 line-clamp-1">
                                  {highest ? highest.tagline : badge.shortDescription}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Progress bar */}
                          {next ? (
                            <div className="space-y-1.5 pt-2 border-t border-slate-100">
                              <div className="flex items-center justify-between text-[11px] font-bold">
                                <span className="text-slate-600">
                                  Next: <strong className="text-slate-900">{next.name}</strong>
                                </span>
                                <span className="text-indigo-600 font-mono">
                                  {p.currentValue} / {next.threshold} ({p.progressPercent}%)
                                </span>
                              </div>
                              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                                <div
                                  className={`h-full rounded-full bg-gradient-to-r ${next.accentGradient}`}
                                  style={{ width: `${p.progressPercent}%` }}
                                />
                              </div>
                              <p className="text-[10px] text-slate-500">
                                Need {p.remainingToNextTier} more to reach {next.name}.
                              </p>
                            </div>
                          ) : (
                            <div className="pt-2 border-t border-slate-100 text-[11px] font-bold text-emerald-700 flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Maximum Tier Achieved!</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              /* Codex Directory View */
              <div className="space-y-8">
                {filteredBadges.map(badge => {
                  return (
                    <div
                      key={badge.id}
                      className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 space-y-5 shadow-xs"
                    >
                      {/* Badge Card Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200/80">
                              {badge.categoryLabel}
                            </span>
                            {badge.comingSoon && (
                              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200/80">
                                In Calibration / Coming Soon
                              </span>
                            )}
                          </div>
                          <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                            {badge.name}
                          </h3>
                          <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                            {badge.fullDescription}
                          </p>
                        </div>

                        {badge.id === 'early-pioneer' && (
                          <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/80 text-xs text-emerald-950 font-medium shrink-0 space-y-1">
                            <div className="font-extrabold flex items-center gap-1 text-emerald-900">
                              <Star className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
                              <span>Current Pioneer Cutoff</span>
                            </div>
                            <p className="font-mono text-base font-extrabold text-emerald-800">
                              First {earlyPioneerThreshold} Signups
                            </p>
                            <p className="text-[10px] text-emerald-700">
                              Adjustable via Admin Dashboard
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Tier Showcase Grid */}
                      <div className="space-y-2">
                        <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                          {badge.isTiered ? 'Badge Tiers & Visual Styles' : 'Badge Visual Style'}
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                          {(badge.tiers || (badge.singleTier ? [badge.singleTier] : [])).map(tier => {
                            const TierIcon = {
                              Globe,
                              Languages,
                              Compass,
                              Sparkles,
                              Award,
                              Star,
                              Crown,
                              Flame,
                            }[tier.iconName] || Award;

                            return (
                              <div
                                key={tier.id}
                                className={`relative overflow-hidden rounded-2xl border p-4 bg-gradient-to-b from-white to-slate-50/60 shadow-2xs space-y-3 flex flex-col justify-between ${tier.borderClass}`}
                              >
                                {/* Top color strip */}
                                <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${tier.accentGradient}`} />

                                <div className="space-y-2 pt-1">
                                  {/* Visual Badge Display */}
                                  <div className="flex items-center gap-3">
                                    <div
                                      className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tier.accentGradient} text-white shadow-sm flex items-center justify-center shrink-0 border border-white/40`}
                                    >
                                      <TierIcon className="w-6 h-6" />
                                    </div>

                                    <div className="min-w-0">
                                      <h5 className="text-sm font-extrabold text-slate-900 truncate">
                                        {tier.name}
                                      </h5>
                                      <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border mt-0.5 ${tier.pillBgClass}`}>
                                        {tier.tagline}
                                      </span>
                                    </div>
                                  </div>

                                  <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                                    {tier.description}
                                  </p>
                                </div>

                                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold">
                                  <span className="text-slate-400 uppercase tracking-wider text-[10px]">
                                    Cohort Ceiling:
                                  </span>
                                  <span className="text-slate-800 font-mono">
                                    {badge.id === 'early-pioneer'
                                      ? `First ${tier.threshold} Signups`
                                      : `${tier.threshold}+ ${tier.unitLabel}`}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* How To Earn Block */}
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                          <span>How to Unlock this Honor</span>
                        </span>
                        <ul className="space-y-1.5 text-xs text-slate-600">
                          {badge.howToEarn.map((step, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                              <span>{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Bar */}
          <div className="px-5 py-3 sm:px-7 sm:py-4 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-500">
              <Shield className="w-4 h-4 text-teal-600" />
              <span>Badges update dynamically as you explore havens, record trips, and learn languages.</span>
            </div>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-colors cursor-pointer shrink-0"
            >
              Close Codex
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
