import React from 'react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  ArrowRight,
  Compass,
  CheckCircle2,
  ShieldCheck,
  Coins,
  Globe2,
  LogIn,
  Scale,
} from 'lucide-react';

interface HavenMatcherPromoCardProps {
  variant?: 'explore' | 'dossier' | 'compare';
  countryName?: string;
  comparedCountryNames?: string[];
  className?: string;
}

export const HavenMatcherPromoCard: React.FC<HavenMatcherPromoCardProps> = ({
  variant = 'explore',
  countryName,
  comparedCountryNames = [],
  className = '',
}) => {
  const { isAuthenticated, currentUserId, openAuthModal } = useApp();

  // If the user is already logged in, do not display this promotional sign-up card
  if (isAuthenticated && currentUserId !== 'guest') {
    return null;
  }

  const handleSignUpAction = () => {
    openAuthModal('signup');
  };

  const handleSignInAction = () => {
    openAuthModal('login');
  };

  const isDossier = variant === 'dossier';
  const isCompare = variant === 'compare';

  // Format compare countries string if provided
  const compareHeadlineNames =
    comparedCountryNames.length > 0
      ? comparedCountryNames.slice(0, 3).join(' vs ')
      : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-indigo-50/40 to-teal-50/50 text-slate-900 shadow-lg border border-indigo-200/80 ${className}`}
    >
      {/* Top Multi-Colored Spectrum Accent Bar */}
      <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-teal-500 via-indigo-600 via-55% to-amber-500" />

      {/* Ambient Radial Color Orbs for Soft Depth */}
      <div className="pointer-events-none absolute -top-20 -right-20 w-80 h-80 rounded-full bg-teal-400/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-indigo-400/10 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-amber-400/10 blur-3xl" />

      <div className="relative z-10 p-6 sm:p-8 lg:p-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          
          {/* Left Column: Copy & Value Proposition */}
          <div className="space-y-4 max-w-3xl">
            
            {/* Catchy Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 border border-teal-200 shadow-2xs text-teal-900 text-xs font-bold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
              <span>
                {isDossier
                  ? `Personalized ${countryName || 'Haven'} Match Evaluation`
                  : isCompare
                  ? 'Objective Comparison & Haven Matcher'
                  : 'Algorithmic Retirement Haven Matcher'}
              </span>
              <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full font-extrabold normal-case">
                100% FREE
              </span>
            </div>

            {/* Main Catchy Heading */}
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
              {isDossier ? (
                <>
                  Still wondering if{' '}
                  <span className="bg-gradient-to-r from-teal-700 via-indigo-700 to-amber-700 bg-clip-text text-transparent">
                    {countryName || 'this destination'}
                  </span>{' '}
                  is truly the right haven for you?
                </>
              ) : isCompare ? (
                <>
                  {compareHeadlineNames ? (
                    <>
                      Can&apos;t decide between{' '}
                      <span className="bg-gradient-to-r from-teal-700 via-indigo-700 to-amber-700 bg-clip-text text-transparent">
                        {compareHeadlineNames}
                      </span>
                      ? Let us do the work for you.
                    </>
                  ) : (
                    <>
                      Torn between multiple destinations?{' '}
                      <span className="bg-gradient-to-r from-teal-700 via-indigo-700 to-amber-700 bg-clip-text text-transparent">
                        Let us do the work for you.
                      </span>
                    </>
                  )}
                </>
              ) : (
                <>
                  Still confused by all the options?{' '}
                  <span className="bg-gradient-to-r from-teal-700 via-indigo-700 to-amber-700 bg-clip-text text-transparent">
                    Let us do the work for you.
                  </span>
                </>
              )}
            </h2>

            {/* Catchy Value Description */}
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              {isDossier ? (
                <>
                  Stop spending hours deciphering complex immigration rules and estimated tables. Sign up in seconds and ReFIREly will evaluate{' '}
                  <strong className="text-slate-900 font-semibold">{countryName || 'this country'}</strong>{' '}
                  directly against your <span className="text-teal-800 font-semibold">nationality</span>,{' '}
                  <span className="text-amber-800 font-semibold">financial portfolio in your preferred local currency</span>, and{' '}
                  <span className="text-indigo-800 font-semibold">lifestyle preferences</span> — plus show you any alternative havens that fit you even better. It&apos;s much easier and completely{' '}
                  <strong className="text-emerald-700 uppercase tracking-wider font-extrabold">FREE</strong>.
                </>
              ) : isCompare ? (
                <>
                  Comparing side-by-side matrices is helpful, but your ultimate choice depends on your personal financial reality and citizenship. Sign up for free and let ReFIREly&apos;s intelligent matchmaking engine analyze your{' '}
                  <span className="text-teal-800 font-semibold">nationality &amp; passport visa eligibility</span>, your{' '}
                  <span className="text-amber-800 font-semibold">real monthly budget in your preferred local currency</span>, and your{' '}
                  <span className="text-indigo-800 font-semibold">healthcare &amp; climate priorities</span> to compute which destination is objectively your #1 best match. It&apos;s much easier and completely{' '}
                  <strong className="text-emerald-700 uppercase tracking-wider font-extrabold">FREE</strong>.
                </>
              ) : (
                <>
                  Sign up here and let us do the work for you! Our intelligent matchmaking engine analyzes your{' '}
                  <span className="text-teal-800 font-semibold">nationality &amp; passport visa eligibility</span>,{' '}
                  <span className="text-amber-800 font-semibold">financial status &amp; real monthly budget in your preferred local currency</span>, and{' '}
                  <span className="text-indigo-800 font-semibold">personal preferences</span> to instantly recommend and rank the best retirement havens for your future. It&apos;s much easier and completely{' '}
                  <strong className="text-emerald-700 uppercase tracking-wider font-extrabold">FREE</strong>.
                </>
              )}
            </p>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/70 border border-teal-100 shadow-2xs">
                <div className="p-1.5 rounded-lg bg-teal-50 text-teal-700 border border-teal-200 shrink-0 mt-0.5">
                  <Globe2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Passport &amp; Visa Compatibility</h4>
                  <p className="text-[11px] text-slate-500">
                    Instant visa qualification analysis calibrated to your exact citizenship.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/70 border border-amber-100 shadow-2xs">
                <div className="p-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 shrink-0 mt-0.5">
                  <Coins className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Local Currency Financial Simulation</h4>
                  <p className="text-[11px] text-slate-500">
                    Realistic budget matching and safe withdrawal calculations in your local currency.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/70 border border-indigo-100 shadow-2xs">
                <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0 mt-0.5">
                  {isCompare ? <Scale className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    {isCompare ? 'Objective Decision Scoring' : 'Healthcare & Safety Scoring'}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {isCompare
                      ? 'Weighted multi-factor score tailored to your personal priorities.'
                      : 'Empirical healthcare scores, emergency access, walkability, and expat safety.'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/70 border border-emerald-100 shadow-2xs">
                <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Zero Cost · Instant Setup</h4>
                  <p className="text-[11px] text-slate-500">
                    No credit card required. Free member access with zero paywalls.
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: High-Impact Call to Action Card */}
          <div className="w-full lg:w-80 shrink-0">
            <div className="p-5 sm:p-6 rounded-2xl bg-white/95 backdrop-blur-md border border-indigo-200/90 shadow-md flex flex-col justify-between space-y-4">
              
              <div className="space-y-1.5 text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-2">
                  <Compass className="w-5 h-5 text-teal-600" />
                  <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
                    Get Matched in 30s
                  </span>
                </div>
                <p className="text-lg font-extrabold text-slate-900">
                  {isCompare
                    ? 'Find Your #1 Winner'
                    : isDossier
                    ? 'Test Your Personal Fit'
                    : 'Find Your Perfect Haven'}
                </p>
                <p className="text-xs text-slate-600">
                  {isCompare
                    ? 'Answer a few quick questions about your citizenship and budget to see which country wins.'
                    : 'Answer a few quick questions about your citizenship and budget to unlock custom rankings.'}
                </p>
              </div>

              <div className="space-y-2.5 pt-1">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSignUpAction}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-teal-600 via-indigo-600 to-amber-600 hover:from-teal-700 hover:via-indigo-700 hover:to-amber-700 text-white font-extrabold text-sm shadow-md shadow-indigo-100 flex items-center justify-center gap-2 cursor-pointer transition-all border border-indigo-500/20"
                >
                  <Sparkles className="w-4 h-4 text-amber-200" />
                  <span>
                    {isCompare
                      ? 'Sign Up Free — Pick My Winner'
                      : 'Sign Up Free — Let Us Match You'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>

                <button
                  type="button"
                  onClick={handleSignInAction}
                  className="w-full py-2 px-3 rounded-lg text-xs font-semibold text-slate-700 hover:text-indigo-700 hover:bg-indigo-50/70 border border-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Already have an account? Sign In</span>
                </button>
              </div>

              {/* Trust micro-badges */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" /> Privacy Protected
                </span>
                <span>•</span>
                <span>No Spam</span>
                <span>•</span>
                <span className="text-amber-700 font-bold">100% Free</span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
};
