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
} from 'lucide-react';

interface HavenMatcherPromoCardProps {
  variant?: 'explore' | 'dossier';
  countryName?: string;
  className?: string;
}

export const HavenMatcherPromoCard: React.FC<HavenMatcherPromoCardProps> = ({
  variant = 'explore',
  countryName,
  className = '',
}) => {
  const { isAuthenticated, userProfile, openAuthModal, setCurrentView } = useApp();

  const handlePrimaryAction = () => {
    if (!isAuthenticated) {
      openAuthModal('signup');
    } else {
      setCurrentView('dashboard');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSignInAction = () => {
    openAuthModal('login');
  };

  const isDossier = variant === 'dossier';

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
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Healthcare &amp; Safety Scoring</h4>
                  <p className="text-[11px] text-slate-500">
                    Empirical healthcare scores, emergency access, walkability, and expat safety.
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
                    {isAuthenticated ? 'Active Member Profile' : 'Get Matched in 30s'}
                  </span>
                </div>
                <p className="text-lg font-extrabold text-slate-900">
                  {isAuthenticated ? (
                    <span>Welcome back, {userProfile.name.split(' ')[0]}</span>
                  ) : (
                    <span>Find Your Perfect Haven</span>
                  )}
                </p>
                <p className="text-xs text-slate-600">
                  {isAuthenticated ? (
                    'Your preferences and finances are ready. Open your personal dashboard to see your custom match rankings.'
                  ) : (
                    'Answer a few quick questions about your citizenship and budget to unlock custom rankings.'
                  )}
                </p>
              </div>

              <div className="space-y-2.5 pt-1">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handlePrimaryAction}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-teal-600 via-indigo-600 to-amber-600 hover:from-teal-700 hover:via-indigo-700 hover:to-amber-700 text-white font-extrabold text-sm shadow-md shadow-indigo-100 flex items-center justify-center gap-2 cursor-pointer transition-all border border-indigo-500/20"
                >
                  <Sparkles className="w-4 h-4 text-amber-200" />
                  <span>
                    {isAuthenticated
                      ? isDossier
                        ? `Evaluate ${countryName || 'Match'} in Dashboard`
                        : 'Open Haven Matcher'
                      : 'Sign Up Free — Let Us Match You'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>

                {!isAuthenticated && (
                  <button
                    type="button"
                    onClick={handleSignInAction}
                    className="w-full py-2 px-3 rounded-lg text-xs font-semibold text-slate-700 hover:text-indigo-700 hover:bg-indigo-50/70 border border-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Already have an account? Sign In</span>
                  </button>
                )}

                {isAuthenticated && (
                  <div className="flex items-center justify-center gap-2 text-[11px] text-teal-800 font-semibold bg-teal-50 py-1.5 rounded-lg border border-teal-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                    <span>Logged in as {userProfile.email || userProfile.id}</span>
                  </div>
                )}
              </div>

              {/* Trust micro-badges */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Privacy Protected
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
