import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { FeedbackType, FireNumbersRating } from '../types';
import {
  MessageSquarePlus,
  Bug,
  Sparkles,
  CheckCircle2,
  X,
  Send,
  MapPin,
  AlertCircle,
  HelpCircle,
  UserCheck,
  Check,
  ChevronDown
} from 'lucide-react';

export const FeedbackWidget: React.FC = () => {
  const {
    currentView,
    selectedCountry,
    countries,
    userProfile,
    isAuthenticated,
    currentUserId,
    submitFeedbackReport,
    isFeedbackModalOpen,
    setIsFeedbackModalOpen,
    feedbackInitialType,
    openFeedbackModal,
    closeFeedbackModal,
  } = useApp();

  const [type, setType] = useState<FeedbackType>('feedback');
  const [selectedCountryName, setSelectedCountryName] = useState<string>('General / All Havens');
  const [fireRating, setFireRating] = useState<FireNumbersRating>('realistic');
  const [fireComment, setFireComment] = useState<string>('');
  const [missingDataPoint, setMissingDataPoint] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [bugSteps, setBugSteps] = useState<string>('');
  const [bugSeverity, setBugSeverity] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium');
  
  // Provider contact info
  const [providerName, setProviderName] = useState<string>('');
  const [providerEmail, setProviderEmail] = useState<string>('');
  
  // Submission UI state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedTicketId, setSubmittedTicketId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Synchronize initial feedback type when opened from context
  useEffect(() => {
    if (isFeedbackModalOpen) {
      setType(feedbackInitialType);
      setSubmittedTicketId(null);
      setErrorMessage(null);

      // Auto-populate contextual country
      if (currentView === 'country-detail' && selectedCountry) {
        setSelectedCountryName(selectedCountry.name);
      } else if (userProfile.targetCountry) {
        setSelectedCountryName(userProfile.targetCountry);
      } else {
        setSelectedCountryName('General / All Havens');
      }

      // Auto-populate registered user details if signed in
      if (isAuthenticated && currentUserId !== 'guest') {
        setProviderName(userProfile.name || '');
        setProviderEmail(userProfile.email || '');
      }
    }
  }, [isFeedbackModalOpen, feedbackInitialType, currentView, selectedCountry, userProfile, isAuthenticated, currentUserId]);

  const handleOpenWidget = (initialCategory: FeedbackType = 'feedback') => {
    openFeedbackModal(initialCategory);
  };

  const handleClose = () => {
    closeFeedbackModal();
    // Reset after animation
    setTimeout(() => {
      setSubmittedTicketId(null);
      setMessage('');
      setFireComment('');
      setMissingDataPoint('');
      setBugSteps('');
      setErrorMessage(null);
    }, 250);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!message.trim()) {
      setErrorMessage(type === 'bug' ? 'Please describe what went wrong or how to reproduce the bug.' : 'Please enter your feedback comments.');
      return;
    }

    const emailToUse = isAuthenticated && currentUserId !== 'guest' ? (userProfile.email || providerEmail.trim()) : providerEmail.trim();
    if (!emailToUse && (!isAuthenticated || currentUserId === 'guest')) {
      setErrorMessage('Please provide an email address so our team can follow up with your resolution.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Build location context string
      let locationContext = currentView as string;
      if (currentView === 'country-detail' && selectedCountry) {
        locationContext = `Country Dossier (${selectedCountry.name})`;
      } else if (currentView === 'dashboard') {
        locationContext = 'User Dashboard & FIRE Calculator';
      } else if (currentView === 'explore') {
        locationContext = 'Haven Directory Explorer';
      } else if (currentView === 'compare') {
        locationContext = 'Side-by-Side Compare Matrix';
      } else if (currentView === 'community') {
        locationContext = 'Expat Community Boards';
      } else if (currentView === 'meetups') {
        locationContext = 'Expat Meetups & Socials';
      } else if (currentView === 'messages') {
        locationContext = 'Direct Member Messenger';
      }

      const deviceInfo = typeof navigator !== 'undefined'
        ? `${navigator.userAgent.slice(0, 140)}`
        : 'Web Browser';

      const res = await submitFeedbackReport({
        type,
        isRegisteredUser: isAuthenticated && currentUserId !== 'guest',
        userId: isAuthenticated && currentUserId !== 'guest' ? currentUserId : undefined,
        userName: (isAuthenticated && currentUserId !== 'guest' ? userProfile.name : providerName.trim()) || 'Visitor',
        userEmail: emailToUse || 'no-email@refirely.local',
        userAvatar: isAuthenticated && currentUserId !== 'guest' ? userProfile.avatarUrl : undefined,
        title: type === 'bug'
          ? `Bug: ${message.slice(0, 60)}...`
          : `Feedback: ${selectedCountryName} — ${message.slice(0, 50)}...`,
        message: message.trim(),
        countryName: selectedCountryName,
        fireNumbersRating: fireRating,
        fireNumbersComment: fireComment.trim() || undefined,
        missingDataPoint: missingDataPoint.trim() || undefined,
        bugStepsToReproduce: type === 'bug' ? bugSteps.trim() || undefined : undefined,
        bugSeverity: type === 'bug' ? bugSeverity : undefined,
        currentUrlOrView: locationContext,
        deviceInfo,
        priority: type === 'bug' && bugSeverity === 'Critical' ? 'critical' : type === 'bug' && bugSeverity === 'High' ? 'high' : 'medium',
      });

      if (res.success && res.id) {
        setSubmittedTicketId(res.id);
      } else {
        setErrorMessage(res.error || 'Failed to submit feedback. Please try again.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Persistent Floating Widget Trigger Button */}
      <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 flex items-center gap-2 group">
        <button
          onClick={() => handleOpenWidget('feedback')}
          aria-label="Send Feedback or Report Bug"
          className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white font-semibold text-xs shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 border border-orange-400/40 cursor-pointer"
        >
          <div className="relative">
            <MessageSquarePlus className="w-4 h-4 text-white" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          </div>
          <span className="tracking-wide">Feedback &amp; Bugs</span>
        </button>
      </div>

      {/* Floating Interactive Feedback & Bug Modal */}
      <AnimatePresence>
        {isFeedbackModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
            onClick={handleClose}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              className="relative bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-indigo-200/80 overflow-hidden flex flex-col max-h-[92vh] my-4"
              onClick={e => e.stopPropagation()}
            >
              {/* Top Multi-Color Accent Ribbon */}
              <div className="h-2 w-full bg-gradient-to-r from-teal-400 via-indigo-500 to-amber-500 shrink-0" />

              {/* Modal Header */}
              <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-teal-950 text-white px-5 py-4 sm:px-6 sm:py-5 flex items-center justify-between border-b border-indigo-900/60">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-xs ${
                      type === 'bug'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-teal-500/20 text-teal-200 border border-teal-400/30'
                    }`}
                  >
                    {type === 'bug' ? (
                      <Bug className="w-5 h-5 text-rose-400" />
                    ) : (
                      <Sparkles className="w-5 h-5 text-amber-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white">
                      {type === 'bug' ? 'Report a Bug or Data Issue' : 'Share Feedback & Haven Insights'}
                    </h3>
                    <p className="text-[11px] text-slate-300">
                      Help us refine retirement numbers, havens, and empirical calculations.
                    </p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.08, rotate: 90 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={handleClose}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-rose-500/80 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  aria-label="Close feedback modal"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>

            {/* Modal Content */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5 bg-slate-50/60">
              {submittedTicketId ? (
                /* Success Confirmation State */
                <div className="py-8 text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-xs border border-emerald-200">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="text-lg font-extrabold text-slate-900">Thank You for Your Contribution!</h4>
                    <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                      Your {type === 'bug' ? 'bug report' : 'feedback'} has been logged in our Admin Dashboard under Ticket{' '}
                      <strong className="font-mono text-orange-950 font-bold">{submittedTicketId}</strong>.
                    </p>
                  </div>

                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 text-left max-w-md mx-auto space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-500 text-[11px]">
                      <span>Follow-up Method:</span>
                      <strong className="text-slate-800">
                        {isAuthenticated && currentUserId !== 'guest' ? 'Direct Messages (In-App)' : providerEmail ? `Email to ${providerEmail}` : 'Logged in System'}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-500 text-[11px]">
                      <span>Status:</span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-semibold text-[10px]">
                        New &amp; Queued for Review
                      </span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={handleClose}
                      className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                    >
                      Done &amp; Close
                    </button>
                  </div>
                </div>
              ) : (
                /* Interactive Multi-Part Form */
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Step 1: Starting Option (Feedback vs Bug) */}
                  <div>
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
                      What are you submitting today?
                    </label>
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setType('feedback')}
                        className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                          type === 'feedback'
                            ? 'bg-orange-50/80 border-orange-500 text-orange-950 ring-2 ring-orange-400/20 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${type === 'feedback' ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold">Giving Feedback</p>
                          <p className="text-[10px] text-slate-500">Suggestions, data inputs, praises</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setType('bug')}
                        className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                          type === 'bug'
                            ? 'bg-rose-50/80 border-rose-500 text-rose-950 ring-2 ring-rose-400/20 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${type === 'bug' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                          <Bug className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold">Reporting a Bug</p>
                          <p className="text-[10px] text-slate-500">Broken feature, typo, calculation glitch</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Country Context Selector */}
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-orange-600" />
                        <span>Which country or haven does this relate to?</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-normal">Optional</span>
                    </label>
                    <div className="relative">
                      <select
                        value={selectedCountryName}
                        onChange={e => setSelectedCountryName(e.target.value)}
                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 pr-8 text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none cursor-pointer"
                      >
                        <option value="General / All Havens">General / All Havens (Entire Platform)</option>
                        {countries.map(c => (
                          <option key={c.id} value={c.name}>
                            {c.flag} {c.name} ({c.region})
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* REQUIRED QUESTION 1: Did you find the FIRE numbers realistic for this country? */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                        <span>Did you find the FIRE numbers realistic for this country?</span>
                      </label>
                      <p className="text-[11px] text-slate-500">
                        Evaluates cost of living, monthly single/couple budget, and safe withdrawal assumptions.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        { id: 'realistic', label: 'Yes, Realistic & Spot-on', color: 'border-emerald-300 bg-emerald-50/70 text-emerald-950 hover:bg-emerald-100' },
                        { id: 'somewhat_realistic', label: 'Somewhat Realistic', color: 'border-amber-300 bg-amber-50/70 text-amber-950 hover:bg-amber-100' },
                        { id: 'too_optimistic', label: 'Too Optimistic (Low)', color: 'border-rose-300 bg-rose-50/70 text-rose-950 hover:bg-rose-100' },
                        { id: 'too_conservative', label: 'Too Conservative (High)', color: 'border-blue-300 bg-blue-50/70 text-blue-950 hover:bg-blue-100' },
                        { id: 'not_sure', label: 'Not Sure / Haven’t Checked', color: 'border-slate-300 bg-slate-50 text-slate-800 hover:bg-slate-100' },
                      ].map(opt => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setFireRating(opt.id as FireNumbersRating)}
                          className={`p-2 rounded-lg border text-xs font-semibold text-left transition-all flex items-center justify-between cursor-pointer ${
                            fireRating === opt.id
                              ? `${opt.color} ring-2 ring-teal-500/30 font-bold shadow-xs`
                              : 'border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <span className="truncate">{opt.label}</span>
                          {fireRating === opt.id && <Check className="w-3.5 h-3.5 shrink-0 ml-1" />}
                        </button>
                      ))}
                    </div>

                    <div>
                      <input
                        type="text"
                        placeholder="Optional comment on FIRE numbers (e.g., rent in capital, private healthcare cost)..."
                        value={fireComment}
                        onChange={e => setFireComment(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50/50"
                      />
                    </div>
                  </div>

                  {/* REQUIRED QUESTION 2: What country or data point is missing? */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                    <label className="text-xs font-bold text-slate-900 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                        <span>What country or data point is missing?</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-normal">High priority for our researchers</span>
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. A missing country (e.g. Uruguay, Georgia), tax treaty nuance, healthcare scale, digital nomad visa, or local rental rates..."
                      value={missingDataPoint}
                      onChange={e => setMissingDataPoint(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-slate-50/50 leading-relaxed"
                    />
                  </div>

                  {/* Primary Message / Bug Description */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-900">
                        {type === 'bug' ? 'Describe the bug or unexpected behavior *' : 'Your Detailed Feedback or Suggestion *'}
                      </label>
                      {type === 'bug' && (
                        <div className="flex items-center gap-1 text-[11px]">
                          <span className="text-slate-500">Severity:</span>
                          <select
                            value={bugSeverity}
                            onChange={e => setBugSeverity(e.target.value as any)}
                            className="font-bold text-xs bg-slate-100 rounded px-1.5 py-0.5 border border-slate-200"
                          >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                            <option value="Critical">Critical</option>
                          </select>
                        </div>
                      )}
                    </div>
                    <textarea
                      rows={3}
                      required
                      placeholder={
                        type === 'bug'
                          ? 'What happened, on which button or screen, and what did you expect to happen?'
                          : 'Share your ideas, experience using ReFIREly, or recommendations...'
                      }
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-slate-50/50 leading-relaxed"
                    />

                    {type === 'bug' && (
                      <div className="pt-1">
                        <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                          Steps to reproduce (optional):
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., 1. Clicked compare -> 2. Selected Spain -> 3. Page froze"
                          value={bugSteps}
                          onChange={e => setBugSteps(e.target.value)}
                          className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 bg-slate-50/50"
                        />
                      </div>
                    )}
                  </div>

                  {/* Provider Identity & Follow-Up Channel */}
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-teal-700" />
                        <span>Feedback Provider &amp; Follow-up Channel</span>
                      </span>
                      {isAuthenticated && currentUserId !== 'guest' ? (
                        <span className="text-[10px] bg-teal-50 text-teal-900 border border-teal-200 font-semibold px-2 py-0.5 rounded-full">
                          Verified Member
                        </span>
                      ) : (
                        <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-full">
                          Visitor / Guest
                        </span>
                      )}
                    </div>

                    {isAuthenticated && currentUserId !== 'guest' ? (
                      <div className="p-2.5 rounded-lg bg-teal-50/60 border border-teal-200/80 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          {userProfile.avatarUrl ? (
                            <img
                              src={userProfile.avatarUrl}
                              alt={userProfile.name}
                              className="w-7 h-7 rounded-full object-cover border border-teal-300 shrink-0"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-teal-800 text-white font-bold text-xs flex items-center justify-center shrink-0">
                              {userProfile.name.charAt(0)}
                            </div>
                          )}
                          <div className="text-xs">
                            <p className="font-bold text-teal-950">{userProfile.name}</p>
                            <p className="text-[11px] text-teal-700">{userProfile.email || `ID: ${currentUserId}`}</p>
                          </div>
                        </div>
                        <span className="text-[11px] text-teal-800 font-medium">
                          Admin can follow up via Direct Messages
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-[11px] text-slate-500">
                          Provide your email so our administrators can notify you when your feedback is reviewed or the bug is resolved.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="Your Name (optional)"
                            value={providerName}
                            onChange={e => setProviderName(e.target.value)}
                            className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-slate-50/50"
                          />
                          <input
                            type="email"
                            required
                            placeholder="Your Email (for response) *"
                            value={providerEmail}
                            onChange={e => setProviderEmail(e.target.value)}
                            className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-slate-50/50"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {errorMessage && (
                    <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Submission Action Bar */}
                  <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-200">
                    <span className="text-[11px] text-slate-500">
                      View context auto-attached: <strong className="text-slate-700">{currentView}</strong>
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleClose}
                        className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/70 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`px-5 py-2 rounded-xl text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer ${
                          type === 'bug'
                            ? 'bg-rose-600 hover:bg-rose-700 disabled:opacity-50'
                            : 'bg-orange-600 hover:bg-orange-700 disabled:opacity-50'
                        }`}
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{isSubmitting ? 'Submitting...' : type === 'bug' ? 'Submit Bug Report' : 'Send Feedback'}</span>
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </>
  );
};
