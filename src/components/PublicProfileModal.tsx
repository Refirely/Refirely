import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { getWorldCountryFlag } from '../data/userAccounts';
import {
  X,
  MapPin,
  Globe,
  Languages,
  Heart,
  MessageCircle,
  Send,
  Star,
  Briefcase,
  Sun,
  Compass,
  ShieldCheck,
  ExternalLink,
  CheckCheck,
  Edit3,
  MessageSquare,
  ArrowRight,
  Lock,
  LogIn,
  UserPlus,
  Sparkles,
} from 'lucide-react';

const VISIT_CARD_ACCENTS = [
  'from-emerald-500 via-teal-500 to-cyan-500',
  'from-indigo-500 via-violet-500 to-purple-500',
  'from-amber-500 via-orange-500 to-rose-500',
  'from-teal-500 via-indigo-500 to-amber-500',
];

const LANG_BAR_GRADIENTS = [
  'from-teal-500 via-emerald-500 to-cyan-500',
  'from-indigo-500 via-violet-500 to-purple-500',
  'from-amber-500 via-orange-500 to-rose-500',
  'from-sky-500 via-indigo-500 to-teal-500',
];

const INTEREST_THEMES = [
  'bg-indigo-50/85 border-indigo-200/80 text-indigo-950 hover:bg-indigo-100/70',
  'bg-amber-50/85 border-amber-200/80 text-amber-950 hover:bg-amber-100/70',
  'bg-rose-50/85 border-rose-200/80 text-rose-950 hover:bg-rose-100/70',
  'bg-sky-50/85 border-sky-200/80 text-sky-950 hover:bg-sky-100/70',
  'bg-violet-50/85 border-violet-200/80 text-violet-950 hover:bg-violet-100/70',
];

export const PublicProfileModal: React.FC = () => {
  const {
    publicMemberAccounts,
    selectedPublicProfileId,
    closePublicProfile,
    currentUserId,
    userProfile,
    countries,
    navigateToCountry,
    dmThreads,
    startDmWithPeer,
    setActiveDmThreadId,
    setCurrentView,
    openEditProfile,
    threads,
    meetups,
    isAuthenticated,
    openAuthModal,
  } = useApp();

  const [personalMessage, setPersonalMessage] = useState('');
  const [sentConfirmation, setSentConfirmation] = useState(false);

  if (!selectedPublicProfileId) return null;

  const memberAccount = publicMemberAccounts.find(acc => acc.id === selectedPublicProfileId);
  if (!memberAccount) return null;

  const profile = memberAccount.profile;
  const isOwnProfile = memberAccount.id === currentUserId;

  const visitedCountries = profile.travelHistory || [];
  const languagesKnown = profile.languagesKnown || [];
  const interests = profile.interests || [];

  // Shared interests with current user
  const viewerInterests = new Set((userProfile.interests || []).map(i => i.toLowerCase()));
  const sharedInterestsCount = interests.filter(i => viewerInterests.has(i.toLowerCase())).length;

  // Existing DM thread with this member
  const existingDmThread = dmThreads.find(
    t =>
      (t.peerUserId && t.peerUserId === memberAccount.id) ||
      t.peerName.toLowerCase() === profile.name.toLowerCase()
  );

  // Community threads & meetups by this member
  const memberFirstLast = profile.name.toLowerCase().split(' ');
  const memberThreads = threads.filter(t => {
    const authorLower = t.authorName.toLowerCase();
    return (
      authorLower === profile.name.toLowerCase() ||
      (memberFirstLast.length >= 2 &&
        authorLower.includes(memberFirstLast[0]) &&
        authorLower.includes(memberFirstLast[memberFirstLast.length - 1]))
    );
  });

  const memberMeetups = meetups.filter(m => {
    const hostLower = m.hostName.toLowerCase();
    return (
      hostLower === profile.name.toLowerCase() ||
      (memberFirstLast.length >= 2 &&
        hostLower.includes(memberFirstLast[0]) &&
        hostLower.includes(memberFirstLast[memberFirstLast.length - 1]))
    );
  });

  // Quick icebreakers tailored to this member's public profile
  const topVisited = visitedCountries[0]?.countryName || profile.residingCountry || 'Portugal';
  const topLanguage =
    languagesKnown.find(l => l.language !== 'English')?.language ||
    languagesKnown[0]?.language ||
    'local language';
  const topInterest = interests[0] || 'expat living';

  const quickIcebreakers = [
    `Hi ${profile.name.split(' ')[0]}! I saw your travel notes on ${topVisited} and would love to connect.`,
    `Hello ${profile.name.split(' ')[0]}, we both enjoy ${topInterest.toLowerCase()}! How has your experience been in ${profile.residingCountry || profile.originCountry}?`,
    `Hi ${profile.name.split(' ')[0]}! Any tips on learning ${topLanguage} or settling into daily life abroad?`,
  ];

  const handleSendPersonalMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || currentUserId === 'guest') {
      openAuthModal('login');
      return;
    }
    if (!personalMessage.trim()) return;

    startDmWithPeer(
      profile.name,
      profile.residingCountry || profile.originCountry || 'Portugal',
      profile.originCity || profile.residingCountry || 'Coastal Hub',
      personalMessage.trim(),
      {
        peerAvatar: profile.avatarUrl,
        peerStatus: profile.relocationStatus || 'Expat Community Member',
        peerUserId: memberAccount.id,
        stayOnCurrentView: true,
      }
    );

    setPersonalMessage('');
    setSentConfirmation(true);
    setTimeout(() => setSentConfirmation(false), 4000);
  };

  const handleOpenFullMessenger = () => {
    if (!isAuthenticated || currentUserId === 'guest') {
      openAuthModal('login');
      return;
    }
    const threadId = startDmWithPeer(
      profile.name,
      profile.residingCountry || profile.originCountry || 'Portugal',
      profile.originCity || profile.residingCountry || 'Coastal Hub',
      personalMessage.trim() || undefined,
      {
        peerAvatar: profile.avatarUrl,
        peerStatus: profile.relocationStatus || 'Expat Community Member',
        peerUserId: memberAccount.id,
        stayOnCurrentView: false,
      }
    );
    setActiveDmThreadId(threadId);
    closePublicProfile();
    setCurrentView('messages');
  };

  const getProficiencyPercent = (prof: string): number => {
    switch (prof) {
      case 'Native':
        return 100;
      case 'Fluent':
        return 88;
      case 'Conversational':
        return 68;
      case 'Intermediate':
        return 50;
      default:
        return 30;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
        onClick={closePublicProfile}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          className="relative bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-indigo-200/80 overflow-hidden flex flex-col max-h-[92vh] my-4"
          onClick={e => e.stopPropagation()}
        >
          {/* Top Multi-Colored Gradient Accent Ribbon */}
          <div className="h-2 w-full bg-gradient-to-r from-teal-400 via-indigo-500 to-amber-500 shrink-0" />

          {/* Top Banner & Member Identity Header */}
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-teal-950 text-white px-6 py-6 sm:px-8 sm:py-7 border-b border-indigo-900/60 shrink-0">
            {/* Ambient Multi-Color Glow Orbs */}
            <div className="absolute -top-20 -right-16 w-72 h-72 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 left-1/4 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-6 right-1/3 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex items-start justify-between gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-5 flex-1 min-w-0">
                {/* Avatar with Multi-Color Gradient Halo */}
                <motion.div
                  whileHover={{ scale: 1.04, rotate: 1 }}
                  className="relative shrink-0 p-1 rounded-2xl bg-gradient-to-br from-teal-400 via-indigo-400 to-amber-400 shadow-lg"
                >
                  {profile.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt={profile.name}
                      referrerPolicy="no-referrer"
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover border-2 border-slate-950"
                    />
                  ) : (
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-gradient-to-br from-teal-700 to-indigo-800 text-white text-2xl font-extrabold flex items-center justify-center border-2 border-slate-950">
                      {profile.name.charAt(0)}
                    </div>
                  )}
                  <span
                    className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 border-2 border-slate-950 shadow-xs"
                    title="Verified Expat Member"
                  />
                </motion.div>

                {/* Name, Headline & Multi-Color Metadata Badges */}
                <div className="space-y-2 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                    <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-200 border border-teal-400/30 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      <span>{profile.relocationStatus || 'Exploring Options'}</span>
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-400/30">
                      Member since {memberAccount.createdAt || '2025'}
                    </span>
                    {memberAccount.username && (
                      <span className="font-mono text-amber-300/90 bg-amber-500/15 border border-amber-400/25 px-2 py-0.5 rounded-full">
                        @{memberAccount.username}
                      </span>
                    )}
                  </div>

                  <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                    {profile.name}
                  </h2>

                  {profile.occupationOrBackground && (
                    <p className="text-xs sm:text-sm text-slate-200 flex items-center gap-1.5 font-medium">
                      <Briefcase className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{profile.occupationOrBackground}</span>
                    </p>
                  )}

                  {/* Origin & Residing Location */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-slate-200 pt-0.5">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 border border-white/10">
                      <span className="text-slate-300">From:</span>
                      <strong className="text-white font-bold">
                        {getWorldCountryFlag(profile.originCountry)} {profile.originCountry}
                      </strong>
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-500/15 border border-teal-400/25">
                      <MapPin className="w-3.5 h-3.5 text-teal-300 shrink-0" />
                      <span className="text-teal-200">Residing:</span>
                      <strong className="text-white font-bold">
                        {getWorldCountryFlag(profile.residingCountry || profile.originCountry)}{' '}
                        {profile.originCity ? `${profile.originCity}, ` : ''}
                        {profile.residingCountry || profile.originCountry}
                      </strong>
                    </span>
                    {profile.preferredClimate && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-400/25 text-amber-200 font-semibold">
                        <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>{profile.preferredClimate} Climate</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Top-right Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                {isOwnProfile ? (
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      closePublicProfile();
                      openEditProfile('about');
                    }}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-500/30 to-teal-500/30 hover:from-indigo-500/50 hover:to-teal-500/50 border border-white/20 text-white text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer shadow-xs"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-amber-300" />
                    <span>Edit My Profile</span>
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleOpenFullMessenger}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-teal-950/30 whitespace-nowrap cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Open in Messenger</span>
                  </motion.button>
                )}

                <motion.button
                  whileHover={{ scale: 1.08, rotate: 90 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={closePublicProfile}
                  className="p-2 rounded-xl bg-white/10 hover:bg-rose-500/80 text-slate-200 hover:text-white transition-colors cursor-pointer"
                  aria-label="Close Public Profile"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            {/* Privacy Assurance & Multi-Color Telemetry Strip */}
            <div className="relative z-10 mt-5 pt-3.5 border-t border-white/15 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-300">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>
                  Public Expat Profile · Personal financial status, budget figures &amp; shortlisted countries are kept strictly private.
                </span>
              </div>
              <div className="flex items-center gap-2 font-mono tabular-nums">
                <span className="px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-200 border border-teal-400/25 font-bold">
                  {visitedCountries.length} Countries Visited
                </span>
                <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-200 border border-indigo-400/25 font-bold">
                  {languagesKnown.length} Languages
                </span>
                <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-200 border border-rose-400/25 font-bold">
                  {interests.length} Interests
                </span>
              </div>
            </div>
          </div>

          {/* Scrollable Profile Body */}
          <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-7 bg-gradient-to-br from-slate-50 via-indigo-50/25 to-teal-50/30">
            {/* 1. Basic Details & Retirement Vision */}
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="relative overflow-hidden bg-white rounded-2xl border border-indigo-100/90 p-5 sm:p-6 space-y-4 shadow-xs"
            >
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-teal-500 via-indigo-500 to-amber-500" />
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-gradient-to-br from-teal-500 to-indigo-600 text-white shadow-2xs">
                    <Compass className="w-4 h-4" />
                  </span>
                  <span>About &amp; International Lifestyle Background</span>
                </h3>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="px-2.5 py-1 rounded-full bg-teal-50 text-teal-900 border border-teal-200/80 font-bold">
                    Stage: {profile.relocationStatus || 'Exploring Options'}
                  </span>
                  {profile.retirementTimelineYear && (
                    <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200/80 font-mono font-bold">
                      Target Year: {profile.retirementTimelineYear}
                    </span>
                  )}
                </div>
              </div>

              {profile.bio && (
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-indigo-50/70 via-teal-50/50 to-amber-50/50 border border-indigo-100/80">
                  <p className="text-sm font-bold text-slate-800 leading-relaxed italic">
                    &ldquo;{profile.bio}&rdquo;
                  </p>
                </div>
              )}

              {profile.aboutMe ? (
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {profile.aboutMe}
                </p>
              ) : (
                <p className="text-xs text-slate-500 italic">
                  Connect with {profile.name.split(' ')[0]} via personal message to exchange experiences on international living, healthcare, and local communities.
                </p>
              )}

              {/* 4-Color Structured Basic Details Grid (Strictly Non-Financial) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-50/85 to-teal-50/40 border border-emerald-200/80">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                    Origin Country
                  </span>
                  <span className="text-xs font-extrabold text-slate-900 mt-1 block truncate">
                    {getWorldCountryFlag(profile.originCountry)} {profile.originCountry}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-50/85 to-sky-50/40 border border-indigo-200/80">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-800 block">
                    Current Residence
                  </span>
                  <span className="text-xs font-extrabold text-slate-900 mt-1 block truncate">
                    {getWorldCountryFlag(profile.residingCountry || profile.originCountry)}{' '}
                    {profile.originCity ? `${profile.originCity}, ` : ''}
                    {profile.residingCountry || profile.originCountry}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-amber-50/85 to-orange-50/40 border border-amber-200/80">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
                    Preferred Climate
                  </span>
                  <span className="text-xs font-extrabold text-slate-900 mt-1 block truncate">
                    {profile.preferredClimate || 'Mediterranean'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-rose-50/85 to-purple-50/40 border border-rose-200/80">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 block">
                    Background
                  </span>
                  <span
                    className="text-xs font-extrabold text-slate-900 mt-1 block truncate"
                    title={profile.occupationOrBackground}
                  >
                    {profile.occupationOrBackground || 'Expat Community Member'}
                  </span>
                </div>
              </div>
            </motion.section>

            {/* 2. Countries Visited & Scouting Passport */}
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="relative overflow-hidden bg-white rounded-2xl border border-teal-200/80 p-5 sm:p-6 space-y-4 shadow-xs"
            >
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-2xs">
                      <Globe className="w-4 h-4" />
                    </span>
                    <span>Countries Visited &amp; Firsthand Travel Log ({visitedCountries.length})</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Destinations {profile.name.split(' ')[0]} has personally visited, lived in, or scouted for retirement.
                  </p>
                </div>
                {isOwnProfile && (
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      closePublicProfile();
                      openEditProfile('travel');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-xs font-bold text-teal-800 border border-teal-200 flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Add Visited Country</span>
                  </motion.button>
                )}
              </div>

              {visitedCountries.length === 0 ? (
                <div className="p-6 text-center bg-gradient-to-br from-slate-50 to-teal-50/40 rounded-xl border border-slate-200/80">
                  <Globe className="w-6 h-6 text-teal-500 mx-auto mb-1.5" />
                  <p className="text-xs font-bold text-slate-700">No visited countries logged yet</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Send {profile.name.split(' ')[0]} a message to ask about their upcoming travel or scouting plans.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {visitedCountries.map((visit, vIdx) => {
                    const catalogCountry = countries.find(
                      c => c.name.toLowerCase() === visit.countryName.toLowerCase()
                    );
                    const topAccent = VISIT_CARD_ACCENTS[vIdx % VISIT_CARD_ACCENTS.length];
                    return (
                      <motion.div
                        key={visit.id}
                        whileHover={{ y: -3 }}
                        className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-white via-slate-50/60 to-indigo-50/30 border border-slate-200/90 hover:border-indigo-300 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-3"
                      >
                        <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${topAccent}`} />
                        <div className="space-y-2 pt-0.5">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <span className="text-2xl leading-none drop-shadow-2xs">
                                {visit.flag || getWorldCountryFlag(visit.countryName)}
                              </span>
                              <div>
                                <h4 className="text-sm font-extrabold text-slate-900">
                                  {visit.countryName}
                                </h4>
                                <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                                  <span className="font-mono tabular-nums font-bold text-indigo-700">
                                    {visit.yearVisited}
                                  </span>
                                  <span aria-hidden="true">·</span>
                                  <span className="px-1.5 py-0.2 rounded bg-teal-50 text-teal-800 border border-teal-200/70 font-semibold">
                                    {visit.purpose}
                                  </span>
                                  {visit.duration && (
                                    <>
                                      <span aria-hidden="true">·</span>
                                      <span>{visit.duration}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Star Rating */}
                            <div
                              className="flex items-center gap-0.5 text-amber-500 shrink-0 bg-amber-50/90 border border-amber-200/70 px-2 py-1 rounded-lg"
                              title={`Rated ${visit.rating}/5`}
                            >
                              {Array.from({ length: 5 }).map((_, idx) => (
                                <Star
                                  key={idx}
                                  className={`w-3 h-3 ${
                                    idx < visit.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>

                          {visit.favoriteSpotOrMemory && (
                            <p className="text-xs text-slate-800 font-semibold leading-relaxed bg-amber-50/50 border border-amber-200/50 px-2.5 py-1.5 rounded-lg">
                              <span className="text-amber-800 font-bold">Highlight: </span>
                              {visit.favoriteSpotOrMemory}
                            </p>
                          )}

                          {visit.notes && (
                            <p className="text-xs text-slate-600 leading-relaxed">
                              {visit.notes}
                            </p>
                          )}
                        </div>

                        <div className="pt-2.5 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
                          <span className="text-slate-500 font-medium">
                            Retire verdict:{' '}
                            <strong
                              className={`px-2 py-0.5 rounded-full font-bold ${
                                visit.wouldRetireHere === 'Definitely'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : visit.wouldRetireHere === 'Maybe'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {visit.wouldRetireHere || 'Definitely'}
                            </strong>
                          </span>

                          {catalogCountry && (
                            <button
                              onClick={() => {
                                closePublicProfile();
                                navigateToCountry(catalogCountry.id);
                              }}
                              className="text-indigo-700 hover:text-teal-700 font-bold flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <span>Country Dossier</span>
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.section>

            {/* 3. Languages Known & Lifestyle Interests (2-Column Split) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
              {/* Languages Known (5 cols) */}
              <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.14 }}
                className="relative overflow-hidden md:col-span-5 bg-white rounded-2xl border border-indigo-200/80 p-5 sm:p-6 flex flex-col justify-between space-y-4 shadow-xs"
              >
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />
                <div className="space-y-4">
                  <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-2xs">
                        <Languages className="w-4 h-4" />
                      </span>
                      <span>Languages Known ({languagesKnown.length})</span>
                    </h3>
                  </div>

                  {languagesKnown.length === 0 ? (
                    <p className="text-xs text-slate-500">English (Conversational)</p>
                  ) : (
                    <div className="space-y-3.5">
                      {languagesKnown.map((lang, idx) => {
                        const pct = getProficiencyPercent(lang.proficiency);
                        const barGrad = LANG_BAR_GRADIENTS[idx % LANG_BAR_GRADIENTS.length];
                        return (
                          <div key={lang.id} className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-extrabold text-slate-900">{lang.language}</span>
                              <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-800 border border-indigo-200/70 text-[11px] font-bold">
                                {lang.proficiency}
                              </span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.7, delay: 0.15 + idx * 0.08, ease: 'easeOut' }}
                                className={`h-full bg-gradient-to-r ${barGrad} rounded-full`}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
                  Open to language exchange &amp; local integration advice with fellow expats.
                </div>
              </motion.section>

              {/* Interests & Passions (7 cols) */}
              <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18 }}
                className="relative overflow-hidden md:col-span-7 bg-white rounded-2xl border border-rose-200/80 p-5 sm:p-6 flex flex-col justify-between space-y-4 shadow-xs"
              >
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-rose-500 via-amber-500 to-teal-500" />
                <div className="space-y-4">
                  <div className="pb-3 border-b border-slate-100 flex items-center justify-between gap-2">
                    <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-gradient-to-br from-rose-500 to-amber-500 text-white shadow-2xs">
                        <Heart className="w-4 h-4" />
                      </span>
                      <span>Interests &amp; Lifestyle Passions ({interests.length})</span>
                    </h3>
                    {!isOwnProfile && sharedInterestsCount > 0 && (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-extrabold">
                        {sharedInterestsCount} shared with you
                      </span>
                    )}
                  </div>

                  {interests.length === 0 ? (
                    <p className="text-xs text-slate-500">
                      Coastal walks, cultural exploration, and expat social meetups.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {interests.map((interest, idx) => {
                        const isShared = !isOwnProfile && viewerInterests.has(interest.toLowerCase());
                        const themeClass = INTEREST_THEMES[idx % INTEREST_THEMES.length];
                        return (
                          <motion.div
                            key={interest}
                            whileHover={{ y: -2 }}
                            className={`px-3.5 py-2.5 rounded-xl border text-xs flex items-center justify-between transition-all ${
                              isShared
                                ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-300 text-emerald-950 font-extrabold shadow-2xs'
                                : `${themeClass} font-bold`
                            }`}
                          >
                            <span className="truncate">{interest}</span>
                            {isShared && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold ml-2 shrink-0">
                                Shared
                              </span>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
                  Connect with {profile.name.split(' ')[0]} if you share similar hobbies, outdoor activities, or cultural interests.
                </div>
              </motion.section>
            </div>

            {/* 4. Community Activity (Discussions & Meetups) */}
            {(memberThreads.length > 0 || memberMeetups.length > 0) && (
              <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.22 }}
                className="relative overflow-hidden bg-white rounded-2xl border border-amber-200/80 p-5 sm:p-6 space-y-4 shadow-xs"
              >
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-purple-500" />
                <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-2xs">
                      <MessageSquare className="w-4 h-4" />
                    </span>
                    <span>Community Posts &amp; Hosted Meetups</span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {memberThreads.map(t => (
                    <motion.div
                      key={t.id}
                      whileHover={{ y: -2 }}
                      className="p-4 rounded-xl bg-gradient-to-br from-amber-50/60 via-white to-orange-50/40 border border-amber-200/80 flex flex-col justify-between space-y-2.5 shadow-2xs"
                    >
                      <div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                          <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-bold">
                            {t.countryName}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="font-semibold text-indigo-700">{t.category}</span>
                        </div>
                        <h4 className="text-xs font-extrabold text-slate-900 mt-1.5 line-clamp-1">
                          {t.title}
                        </h4>
                        <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                          {t.content}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          closePublicProfile();
                          setCurrentView('community');
                        }}
                        className="text-[11px] font-bold text-orange-700 hover:text-orange-900 flex items-center gap-1 self-start cursor-pointer"
                      >
                        <span>View in Community Hub</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </motion.div>
                  ))}

                  {memberMeetups.map(m => (
                    <motion.div
                      key={m.id}
                      whileHover={{ y: -2 }}
                      className="p-4 rounded-xl bg-gradient-to-br from-teal-50/60 via-white to-emerald-50/40 border border-teal-200/80 flex flex-col justify-between space-y-2.5 shadow-2xs"
                    >
                      <div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                          <span className="px-2 py-0.5 rounded-md bg-teal-100 text-teal-900 font-bold">
                            {m.city}, {m.countryName}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono font-semibold text-slate-700">{m.date}</span>
                        </div>
                        <h4 className="text-xs font-extrabold text-slate-900 mt-1.5">
                          Host: {m.title}
                        </h4>
                        <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                          {m.description}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          closePublicProfile();
                          setCurrentView('meetups');
                        }}
                        className="text-[11px] font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1 self-start cursor-pointer"
                      >
                        <span>View Meetup &amp; RSVP ({m.attendeesCount} attending)</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            )}

            {/* 5. Personal Message & Direct Connection Integration */}
            {!isOwnProfile && (
              <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="relative overflow-hidden bg-white rounded-2xl border border-teal-300/90 p-5 sm:p-6 space-y-4 shadow-md shadow-teal-950/5"
              >
                <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-teal-500 via-indigo-500 to-amber-500" />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-gradient-to-br from-teal-500 to-indigo-600 text-white shadow-2xs">
                        <MessageCircle className="w-4 h-4" />
                      </span>
                      <span>Connect &amp; Send Personal Message to {profile.name}</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Messages sent here sync directly with your Direct Messenger inbox.
                    </p>
                  </div>

                  {isAuthenticated && currentUserId !== 'guest' && (
                    <motion.button
                      whileHover={{ x: 2 }}
                      onClick={handleOpenFullMessenger}
                      className="text-xs font-extrabold text-indigo-700 hover:text-teal-700 flex items-center gap-1 cursor-pointer self-start sm:self-auto"
                    >
                      <span>Open Full Chat Window</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </motion.button>
                  )}
                </div>

                {!isAuthenticated || currentUserId === 'guest' ? (
                  <div className="py-6 px-4 bg-gradient-to-br from-teal-50/70 via-indigo-50/50 to-amber-50/50 rounded-2xl border border-teal-200/80 text-center space-y-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-teal-600 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-sm">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-extrabold text-slate-900">
                        Member Sign-In Required to Message {profile.name.split(' ')[0]}
                      </h4>
                      <p className="text-xs text-slate-600 max-w-md mx-auto">
                        Direct peer messaging and conversation histories are reserved exclusively for authenticated members to protect privacy and prevent unsolicited messages.
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-2.5 pt-1">
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => openAuthModal('login')}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-700 hover:to-indigo-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>Log In to Message</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => openAuthModal('signup')}
                        className="px-4 py-2 rounded-xl bg-white border border-indigo-200 hover:bg-indigo-50 text-indigo-950 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <UserPlus className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Create Account</span>
                      </motion.button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Recent messages preview if conversation already exists */}
                    {existingDmThread && existingDmThread.messages.length > 0 && (
                      <div className="p-3.5 rounded-xl bg-gradient-to-br from-slate-50 to-indigo-50/40 border border-indigo-100 space-y-2 max-h-44 overflow-y-auto">
                        <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold pb-1 border-b border-slate-200/70">
                          <span>Active Conversation History</span>
                          <span className="font-mono">{existingDmThread.lastMessageTime}</span>
                        </div>
                        {existingDmThread.messages.slice(-3).map(msg => {
                          const isMe = msg.sender === 'user';
                          return (
                            <div
                              key={msg.id}
                              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                            >
                              <div
                                className={`max-w-[85%] rounded-xl px-3 py-1.5 text-xs font-medium ${
                                  isMe
                                    ? 'bg-gradient-to-r from-teal-600 to-indigo-600 text-white shadow-2xs'
                                    : 'bg-white text-slate-800 border border-slate-200'
                                }`}
                              >
                                {msg.text}
                              </div>
                              <span className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                                {msg.timestamp}
                                {isMe && <CheckCheck className="w-3 h-3 text-teal-600" />}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Quick Icebreaker Starters */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        <span>Quick conversation starters (click to pre-fill):</span>
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {quickIcebreakers.map((prompt, idx) => (
                          <motion.button
                            key={idx}
                            type="button"
                            whileHover={{ y: -1.5 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setPersonalMessage(prompt)}
                            className="text-left text-xs px-3 py-1.5 rounded-xl bg-gradient-to-r from-teal-50/80 via-indigo-50/50 to-amber-50/60 hover:from-teal-100/80 hover:to-indigo-100/70 text-slate-800 font-medium border border-teal-200/80 hover:border-indigo-300 transition-all cursor-pointer"
                          >
                            &ldquo;{prompt}&rdquo;
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {sentConfirmation && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>
                            Personal message sent to <strong>{profile.name}</strong>! It is now in your Direct Messages inbox.
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleOpenFullMessenger}
                          className="font-bold text-emerald-800 underline whitespace-nowrap cursor-pointer"
                        >
                          View Inbox
                        </button>
                      </motion.div>
                    )}

                    {/* Message Composer Form */}
                    <form onSubmit={handleSendPersonalMessage} className="flex flex-col sm:flex-row gap-2.5">
                      <input
                        type="text"
                        placeholder={`Write a personal message to ${profile.name} about countries visited, languages, or expat life...`}
                        value={personalMessage}
                        onChange={e => setPersonalMessage(e.target.value)}
                        className="flex-1 px-4 py-2.5 text-xs sm:text-sm border border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/60 focus:bg-white font-medium"
                      />
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        type="submit"
                        disabled={!personalMessage.trim()}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 via-indigo-600 to-violet-600 hover:from-teal-700 hover:to-violet-700 disabled:opacity-50 text-white text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-sm"
                      >
                        <Send className="w-4 h-4" />
                        <span>Send Personal Message</span>
                      </motion.button>
                    </form>
                  </>
                )}
              </motion.section>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

