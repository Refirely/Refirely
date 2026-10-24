import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { AVATAR_PRESETS, WORLD_COUNTRIES } from '../data/userAccounts';
import {
  X, LogIn, UserPlus, Check, AlertCircle, Compass,
  Sparkles, Lock, Mail, User, ArrowRight, Cloud, Database
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalTab,
    setAuthModalTab,
    login,
    signup,
    countries,
    loginWithGoogle,
    isFirebaseSyncing,
    firebaseUser,
    openFirebaseModal,
    isOwnerAdmin,
    registeredAccounts,
    currentUserId,
  } = useApp();

  // Login form state (supports User ID, Username, or Email)
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Signup form state (includes Custom User ID)
  const [signupForm, setSignupForm] = useState({
    customUserId: '',
    name: '',
    email: '',
    password: '',
    originCountry: 'United States',
    residingCountry: 'United States',
    targetCountry: 'Portugal',
    retirementTimelineYear: 2027,
    monthlyBudgetUSD: 2500,
    relocationStatus: 'Exploring Options' as const,
    bio: '',
    avatarUrl: AVATAR_PRESETS[0].url,
  });
  const [signupError, setSignupError] = useState<string | null>(null);
  const [signupStep, setSignupStep] = useState<1 | 2>(1);

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    if (!loginIdentifier.trim()) {
      setLoginError('Please enter your User ID or email address.');
      return;
    }
    if (!loginPassword.trim()) {
      setLoginError('Please enter your password to sign in.');
      return;
    }
    const result = login(loginIdentifier, loginPassword);
    if (result.success) {
      setIsAuthModalOpen(false);
      setLoginIdentifier('');
      setLoginPassword('');
    } else {
      setLoginError(result.error || 'Failed to log in. Please check your User ID and password.');
    }
  };

  const handleGoogleSignIn = async () => {
    setLoginError(null);
    setSignupError(null);
    const result = await loginWithGoogle();
    if (result.success) {
      setIsAuthModalOpen(false);
    } else {
      const err = result.error || 'Failed to authenticate with Google';
      setLoginError(err);
      setSignupError(err);
    }
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError(null);

    if (!signupForm.name.trim()) {
      setSignupError('Please enter your full name.');
      return;
    }
    if (!signupForm.email.trim()) {
      setSignupError('Please enter a valid email address.');
      return;
    }
    if (!signupForm.password || signupForm.password.length < 6) {
      setSignupError('Please enter a password of at least 6 characters.');
      return;
    }

    const autoSuggestedId =
      signupForm.customUserId.trim() ||
      `usr-${signupForm.name.trim().toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

    const result = signup({
      customUserId: autoSuggestedId,
      name: signupForm.name.trim(),
      email: signupForm.email.trim().toLowerCase(),
      password: signupForm.password,
      originCountry: signupForm.originCountry,
      residingCountry: signupForm.residingCountry,
      targetCountry: signupForm.targetCountry,
      retirementTimelineYear: Number(signupForm.retirementTimelineYear),
      monthlyBudgetUSD: Number(signupForm.monthlyBudgetUSD),
      bio: signupForm.bio.trim() || `Aspiring retiree preparing for life in ${signupForm.targetCountry}.`,
      avatarUrl: signupForm.avatarUrl,
    });

    if (result.success) {
      setIsAuthModalOpen(false);
      setSignupForm({
        customUserId: '',
        name: '',
        email: '',
        password: '',
        originCountry: 'United States',
        residingCountry: 'United States',
        targetCountry: 'Portugal',
        retirementTimelineYear: 2027,
        monthlyBudgetUSD: 2500,
        relocationStatus: 'Exploring Options',
        bio: '',
        avatarUrl: AVATAR_PRESETS[0].url,
      });
      setSignupStep(1);
    } else {
      setSignupError(result.error || 'Could not create account.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        className="bg-white rounded-3xl max-w-md sm:max-w-lg w-full p-4 sm:p-6 shadow-2xl border border-indigo-200/80 my-auto relative max-h-[92vh] flex flex-col overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-teal-400 via-indigo-500 to-amber-500" />

        {/* Header with Brand & Close Button */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-100 shrink-0 gap-2 pt-1">
          <div className="flex items-center gap-2.5 min-w-0">
            <BrandLogo variant="icon" size="md" />
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 truncate">
                {authModalTab === 'login' ? 'Sign In to ReFIREly' : 'Create User ID'}
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 truncate">
                {authModalTab === 'login'
                  ? 'Sign in with your User ID, email, or Google'
                  : 'Create a password-protected User ID'}
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.08, rotate: 90 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setIsAuthModalOpen(false)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Cloud Database Connection Status Pill (Owner / Admin Only) */}
        {isOwnerAdmin && (
          <div className="mt-3 p-2.5 rounded-xl bg-gradient-to-r from-teal-50/80 via-indigo-50/60 to-amber-50/60 border border-indigo-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <Database className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span className="text-slate-700 truncate">
                {firebaseUser ? (
                  <>
                    Cloud Sync Active (<strong className="text-emerald-700">{firebaseUser.email}</strong>)
                  </>
                ) : (
                  <>
                    Owner Admin: Connect Google Auth to sync Firestore
                  </>
                )}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsAuthModalOpen(false);
                openFirebaseModal();
              }}
              className="px-2.5 py-1 rounded-lg bg-white border border-indigo-200 text-indigo-800 hover:bg-indigo-50 font-bold shrink-0 transition-colors cursor-pointer text-center"
            >
              Cloud &amp; Hosting Setup
            </button>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 bg-slate-100/90 rounded-2xl my-3 text-xs font-bold shrink-0">
          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setAuthModalTab('login');
              setLoginError(null);
            }}
            className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              authModalTab === 'login'
                ? 'bg-gradient-to-r from-teal-600 to-indigo-600 text-white font-bold shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </motion.button>
          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setAuthModalTab('signup');
              setSignupError(null);
            }}
            className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              authModalTab === 'signup'
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create User ID</span>
          </motion.button>
        </div>

        {/* Scrollable Form Body Container for Mobile Responsiveness */}
        <div className="overflow-y-auto overscroll-contain flex-1 pr-0.5">

        {/* TAB 1: LOG IN */}
        {authModalTab === 'login' && (
          <div className="space-y-4">
            {loginError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                <span>{loginError}</span>
              </div>
            )}

            {/* Google Firebase Auth 1-Click Sign-In */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isFirebaseSyncing}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-all flex items-center justify-center gap-2.5 shadow-2xs hover:shadow-xs disabled:opacity-60 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>{isFirebaseSyncing ? 'Signing in with Google...' : 'Continue with Google'}</span>
            </button>

            <div className="relative flex items-center justify-center my-3">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider absolute">
                or sign in with User ID &amp; Password
              </span>
            </div>

            {/* Quick account switcher strip for fast testing and role verification */}
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Quick Select Registered User:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {registeredAccounts
                  .filter(acc => acc.id !== 'guest')
                  .slice(0, 5)
                  .map(acc => {
                    const isSelected = loginIdentifier.toLowerCase() === acc.id.toLowerCase();
                    return (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => {
                          setLoginIdentifier(acc.id);
                          setLoginPassword(acc.password || 'password123');
                          setLoginError(null);
                        }}
                        className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-all flex items-center gap-1.5 cursor-pointer border ${
                          isSelected
                            ? 'bg-orange-600 text-white border-orange-600 shadow-2xs font-bold'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100/70'
                        }`}
                      >
                        <img
                          src={acc.profile.avatarUrl}
                          alt={acc.name}
                          className="w-3.5 h-3.5 rounded-full object-cover shrink-0"
                        />
                        <span>{acc.name.split(' ')[0]}</span>
                        <span className="text-[9px] opacity-70 font-mono">({acc.id})</span>
                      </button>
                    );
                  })}
              </div>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  User ID or Email Address *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. usr-ganesh, usr-elena, or email"
                    value={loginIdentifier}
                    onChange={e => setLoginIdentifier(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">Password *</label>
                  <span className="text-[11px] text-slate-400 font-medium">
                    Required
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    placeholder="Enter your password"
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-orange-600 via-amber-500 to-purple-600 hover:from-orange-700 hover:to-purple-700 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In with Password</span>
              </button>
            </form>

            {/* Switch to Sign Up */}
            <div className="pt-3 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-500">
                Don&apos;t have a User ID yet?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalTab('signup');
                    setSignupError(null);
                  }}
                  className="text-orange-600 font-bold hover:underline cursor-pointer"
                >
                  Create one now
                </button>
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: SIGN UP */}
        {authModalTab === 'signup' && (
          <div>
            {signupError && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                <span>{signupError}</span>
              </div>
            )}

            {/* Google 1-Click Fast Registration */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isFirebaseSyncing}
              className="w-full mb-4 py-2.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-all flex items-center justify-center gap-2.5 shadow-2xs hover:shadow-xs disabled:opacity-60 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>{isFirebaseSyncing ? 'Connecting...' : 'Link Google Auth for Automatic Cloud Sync'}</span>
            </button>

            <div className="relative flex items-center justify-center my-3">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider absolute">
                create custom User ID & profile
              </span>
            </div>

            <form onSubmit={handleSignupSubmit} className="space-y-3.5">
              {signupStep === 1 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ganesh Indireddy"
                        value={signupForm.name}
                        onChange={e => {
                          const newName = e.target.value;
                          const suggestedId =
                            !signupForm.customUserId ||
                            signupForm.customUserId ===
                              `usr-${signupForm.name.trim().toLowerCase().replace(/[^a-z0-9]/g, '-')}`
                              ? newName.trim()
                                ? `usr-${newName.trim().toLowerCase().replace(/[^a-z0-9]/g, '-')}`
                                : ''
                              : signupForm.customUserId;
                          setSignupForm({ ...signupForm, name: newName, customUserId: suggestedId });
                        }}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-purple-900 block mb-1">
                        Custom User ID (Login Handle) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. usr-ganesh-2027"
                        value={signupForm.customUserId}
                        onChange={e => setSignupForm({ ...signupForm, customUserId: e.target.value })}
                        className="w-full px-3 py-2 text-xs font-mono border border-purple-300 bg-purple-50/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Email Address *
                      </label>
                      <div className="relative">
                        <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="email"
                          required
                          placeholder="e.g. ganesh@example.com"
                          value={signupForm.email}
                          onChange={e => setSignupForm({ ...signupForm, email: e.target.value })}
                          className="w-full pl-8 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Password *
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="Min 6 characters"
                        value={signupForm.password}
                        onChange={e => setSignupForm({ ...signupForm, password: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Origin Country / Nationality
                      </label>
                      <select
                        value={signupForm.originCountry}
                        onChange={e => setSignupForm({ ...signupForm, originCountry: e.target.value })}
                        className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                      >
                        {WORLD_COUNTRIES.map(c => (
                          <option key={`signup-origin-${c.code}-${c.name}`} value={c.name}>
                            {c.flag} {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Residing Country
                      </label>
                      <select
                        value={signupForm.residingCountry}
                        onChange={e => setSignupForm({ ...signupForm, residingCountry: e.target.value })}
                        className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                      >
                        {WORLD_COUNTRIES.map(c => (
                          <option key={`signup-residing-${c.code}-${c.name}`} value={c.name}>
                            {c.flag} {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Target Haven Country
                      </label>
                      <select
                        value={signupForm.targetCountry}
                        onChange={e => setSignupForm({ ...signupForm, targetCountry: e.target.value })}
                        className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                      >
                        {countries.map(c => (
                          <option key={c.id} value={c.name}>
                            {c.flag} {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Target Departure Year
                      </label>
                      <input
                        type="number"
                        min={2024}
                        max={2045}
                        value={signupForm.retirementTimelineYear}
                        onChange={e => setSignupForm({ ...signupForm, retirementTimelineYear: Number(e.target.value) })}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Monthly Budget ($ USD)
                      </label>
                      <input
                        type="number"
                        min={500}
                        max={25000}
                        step={100}
                        value={signupForm.monthlyBudgetUSD}
                        onChange={e => setSignupForm({ ...signupForm, monthlyBudgetUSD: Number(e.target.value) })}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        if (!signupForm.name.trim() || !signupForm.email.trim()) {
                          setSignupError('Please fill in your name and email.');
                          return;
                        }
                        setSignupError(null);
                        setSignupStep(2);
                      }}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-purple-600 text-white font-bold text-xs flex items-center gap-1.5 hover:from-orange-700 hover:to-purple-700 transition-all cursor-pointer"
                    >
                      <span>Next: Avatar & Profile Bio</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Step 2: Avatar & Bio */}
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-2">
                      Choose Your Expat Avatar Preset
                    </label>
                    <div className="grid grid-cols-4 gap-2.5">
                      {AVATAR_PRESETS.map(preset => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => setSignupForm({ ...signupForm, avatarUrl: preset.url })}
                          className={`relative p-1 rounded-xl border transition-all cursor-pointer ${
                            signupForm.avatarUrl === preset.url
                              ? 'border-orange-600 bg-orange-50/50 ring-2 ring-orange-500'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <img
                            src={preset.url}
                            alt={preset.label}
                            className="w-full h-14 rounded-lg object-cover"
                          />
                          {signupForm.avatarUrl === preset.url && (
                            <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-orange-600 text-white flex items-center justify-center">
                              <Check className="w-3 h-3" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Short Expat Bio & Retirement Goal
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Tell the community what brings you to explore international retirement..."
                      value={signupForm.bio}
                      onChange={e => setSignupForm({ ...signupForm, bio: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-200 text-[11px] text-purple-950 flex items-center gap-2">
                    <Cloud className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>
                      Your User ID (<code className="font-mono font-bold">{signupForm.customUserId || 'usr-custom'}</code>) will be saved to your account registry{firebaseUser ? ' and immediately synced to Firestore cloud!' : ' and synced to Firestore when Google Auth is connected.'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setSignupStep(1)}
                      className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 via-amber-500 to-purple-600 text-white font-bold text-xs hover:from-orange-700 hover:to-purple-700 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Save User ID & Sign In</span>
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        )}
        </div>
      </motion.div>
    </motion.div>
  );
};
