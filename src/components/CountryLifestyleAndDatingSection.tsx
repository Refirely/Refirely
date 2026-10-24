import React from 'react';
import { Country } from '../types';
import { getCountryDatingAndLifestyleProfile } from '../data/countryDatingAndLifestyle';
import {
  HeartHandshake,
  Sparkles,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Scale,
  Users,
  MessageCircleHeart,
  Lock,
} from 'lucide-react';
import { motion } from 'motion/react';

interface CountryLifestyleAndDatingSectionProps {
  country: Country;
}

export const CountryLifestyleAndDatingSection: React.FC<
  CountryLifestyleAndDatingSectionProps
> = ({ country }) => {
  const profile = getCountryDatingAndLifestyleProfile(country);

  const getRiskBadgeClasses = (level: string) => {
    if (level === 'High Vigilance') {
      return 'bg-rose-100/90 text-rose-950 border-rose-300';
    }
    if (level === 'Moderate Vigilance') {
      return 'bg-amber-100/90 text-amber-950 border-amber-300';
    }
    return 'bg-teal-100/90 text-teal-950 border-teal-300';
  };

  return (
    <div className="space-y-6">
      {/* 1. DATING STYLE, COURTSHIP PACE & PARTNER EXPECTATIONS */}
      <div className="relative overflow-hidden bg-white rounded-3xl border border-indigo-100/90 p-6 sm:p-8 shadow-sm">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-400 via-indigo-500 to-teal-500" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-rose-700 mb-1">
              <HeartHandshake className="w-3.5 h-3.5 text-rose-600" />
              Cultural Courtship &amp; Partner Expectations
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-slate-900 via-indigo-950 to-rose-900 bg-clip-text text-transparent">
              Dating Style &amp; Relationship Expectations in {country.name}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1.5 max-w-3xl leading-relaxed">
              {profile.datingStyleOverview}
            </p>
          </div>

          <div className="px-4 py-3 rounded-2xl bg-gradient-to-br from-rose-50/90 via-indigo-50/60 to-amber-50/70 border border-rose-200/80 shrink-0 lg:max-w-xs">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-800 block">
              Dominant Cultural Archetype
            </span>
            <span className="text-xs sm:text-sm font-extrabold text-slate-900 mt-0.5 block">
              {profile.culturalArchetype}
            </span>
          </div>
        </div>

        {/* 4 Quick Courtship Snapshot Strips */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-50/80 via-white to-emerald-50/40 border border-teal-200/80">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-800 block">
              Courtship Pace
            </span>
            <p className="text-xs font-bold text-slate-900 mt-1 leading-relaxed">
              {profile.courtshipPace}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/80 via-white to-violet-50/40 border border-indigo-200/80">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-800 block">
              Who Pays &amp; Bill Etiquette
            </span>
            <p className="text-xs font-bold text-slate-900 mt-1 leading-relaxed">
              {profile.billSplittingNorm}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/80 via-white to-orange-50/40 border border-amber-200/80">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-900 block">
              Age-Gap Reception
            </span>
            <p className="text-xs font-bold text-slate-900 mt-1 leading-relaxed">
              {profile.ageGapNorms}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-50/80 via-white to-rose-50/40 border border-violet-200/80">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-violet-900 block">
              Best Ways to Meet Partners
            </span>
            <p className="text-xs font-bold text-slate-900 mt-1 leading-relaxed">
              {profile.popularAppsAndVenues}
            </p>
          </div>
        </div>

        {/* Partner Expectations Grid */}
        <h4 className="text-sm sm:text-base font-extrabold text-slate-900 mb-3 flex items-center gap-2">
          <MessageCircleHeart className="w-4 h-4 text-indigo-600" />
          <span>What Local &amp; Expat Partners Expect in {country.name}</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {profile.partnerExpectations.map((exp, idx) => (
            <motion.div
              key={exp.dimension}
              whileHover={{ y: -2 }}
              className="p-4 rounded-2xl bg-slate-50/90 hover:bg-white border border-slate-200/80 hover:border-indigo-200 transition-colors shadow-2xs"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 via-violet-500 to-teal-500 text-white font-mono text-xs font-extrabold flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-800">
                  {exp.dimension}
                </span>
              </div>
              <h5 className="text-sm font-extrabold text-slate-900">{exp.headline}</h5>
              <p className="text-xs text-slate-600 leading-relaxed mt-1">{exp.detail}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 2. WHAT IS COMPLETELY NORMAL VS. WHAT IS NOT NORMAL (CULTURAL REALITY CHECK) */}
      <div className="relative overflow-hidden bg-white rounded-3xl border border-indigo-100/90 p-6 sm:p-8 shadow-sm">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-400 via-indigo-500 to-amber-500" />
        <div className="mb-5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 block mb-0.5">
            Cultural Calibration Matrix
          </span>
          <h3 className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-slate-900 via-indigo-950 to-teal-900 bg-clip-text text-transparent">
            What Is Completely Normal vs. What Is NOT Normal in {country.name}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Distinguish healthy local dating customs from genuine red flags so you neither overreact to normal culture nor ignore warning signs.
          </p>
        </div>

        <div className="space-y-4">
          {profile.normalVsNotNormal.map((item, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-indigo-100/90 bg-gradient-to-r from-teal-50/40 via-white to-rose-50/40 p-4 sm:p-5 shadow-2xs"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200/80">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-900 block">
                      Completely Normal Local Custom
                    </span>
                    <p className="text-xs sm:text-sm font-semibold text-slate-800 mt-1 leading-relaxed">
                      {item.completelyNormal}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-50/80 border border-rose-200/80">
                  <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-900 block">
                      NOT Normal (Red Flag — Walk Away)
                    </span>
                    <p className="text-xs sm:text-sm font-semibold text-slate-800 mt-1 leading-relaxed">
                      {item.notNormalRedFlag}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-200/70 flex items-center gap-2 text-xs text-indigo-950 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>
                  <strong>Cultural Context:</strong> {item.contextNote}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. DATING & SOCIAL ETIQUETTE: DO'S AND DON'TS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="relative overflow-hidden bg-gradient-to-br from-teal-50/70 via-white to-emerald-50/40 rounded-3xl border border-teal-200/90 p-6 sm:p-7 shadow-xs">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-400 via-emerald-500 to-cyan-500" />
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white flex items-center justify-center shadow-2xs">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                Dating &amp; Social Do’s in {country.name}
              </h3>
              <span className="text-[11px] text-teal-800 font-semibold">
                Habits that earn immediate respect &amp; warmth
              </span>
            </div>
          </div>
          <ul className="space-y-3 text-xs sm:text-sm text-slate-700">
            {profile.dosList.map((doItem, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-900 font-mono text-[11px] font-extrabold flex items-center justify-center shrink-0 mt-0.5 border border-teal-300">
                  ✓
                </span>
                <span className="leading-relaxed">{doItem}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative overflow-hidden bg-gradient-to-br from-amber-50/70 via-white to-rose-50/40 rounded-3xl border border-amber-200/90 p-6 sm:p-7 shadow-xs">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500" />
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-rose-500 text-white flex items-center justify-center shadow-2xs">
              <XCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                Dating &amp; Social Don’ts in {country.name}
              </h3>
              <span className="text-[11px] text-rose-800 font-semibold">
                Cultural faux pas &amp; costly mistakes to avoid
              </span>
            </div>
          </div>
          <ul className="space-y-3 text-xs sm:text-sm text-slate-700">
            {profile.dontsList.map((dontItem, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-900 font-mono text-[11px] font-extrabold flex items-center justify-center shrink-0 mt-0.5 border border-rose-300">
                  ✕
                </span>
                <span className="leading-relaxed">{dontItem}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 4. HOW TO AVOID ROMANCE, NIGHTLIFE & FINANCIAL SCAMS */}
      <div className="relative overflow-hidden bg-white rounded-3xl border border-indigo-100/90 p-6 sm:p-8 shadow-sm">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-rose-500 to-indigo-600" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-amber-800 mb-1">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
              Expat Personal &amp; Financial Protection
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-slate-900 via-indigo-950 to-amber-900 bg-clip-text text-transparent">
              How to Avoid Dating, Nightlife &amp; Financial Scams in {country.name}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Practical safeguards to protect your savings, property, and personal safety while enjoying an active social life.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {profile.scamPreventionTips.map(scam => (
            <div
              key={scam.scamName}
              className="rounded-2xl bg-gradient-to-br from-slate-50 via-white to-amber-50/30 border border-slate-200/90 p-5 flex flex-col justify-between shadow-2xs"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${getRiskBadgeClasses(
                      scam.riskLevel
                    )}`}
                  >
                    {scam.riskLevel}
                  </span>
                </div>
                <h4 className="text-sm sm:text-base font-extrabold text-slate-900">
                  {scam.scamName}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed mt-2">
                  <strong className="text-slate-800">How It Works:</strong> {scam.howItWorks}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/80 p-3 rounded-xl bg-teal-50/70 border border-teal-200/70 text-xs text-teal-950">
                <strong className="font-extrabold block mb-0.5 text-teal-900">
                  ✓ How to Protect Yourself:
                </strong>
                <span className="leading-relaxed">{scam.howToProtectYourself}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Legal & Cohabitation Asset Protection Banner */}
        <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-indigo-50/90 via-teal-50/60 to-amber-50/80 border border-indigo-200/80 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-teal-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-extrabold text-indigo-950 block">
              Cohabitation, Real Estate &amp; Retirement Asset Protection Rule
            </span>
            <p className="text-xs text-slate-700 mt-0.5 leading-relaxed">
              {profile.assetAndLegalProtectionNote}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
