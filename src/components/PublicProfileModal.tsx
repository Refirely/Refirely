import React, { useState } from 'react';
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
  Calendar,
  Briefcase,
  Sun,
  Compass,
  ShieldCheck,
  ExternalLink,
  CheckCheck,
  Edit3,
  MessageSquare,
  Users,
  ArrowRight,
  Lock,
  LogIn,
  UserPlus,
} from 'lucide-react';

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
      t.peerUserId === memberAccount.id ||
      t.peerName.toLowerCase() === profile.name.toLowerCase() ||
      profile.name.toLowerCase().includes(t.peerName.toLowerCase())
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
  const topLanguage = languagesKnown.find(l => l.language !== 'English')?.language || languagesKnown[0]?.language || 'local language';
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
    <div
      className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
      onClick={closePublicProfile}
    >
      <div
        className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh] my-4"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Banner & Member Identity Header */}
        <div className="relative bg-slate-900 text-white px-6 py-6 sm:px-8 sm:py-7 border-b border-slate-800">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              {/* Avatar */}
              <div className="relative shrink-0">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.name}
                    referrerPolicy="no-referrer"
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-white/20 shadow-md"
                  />
                ) : (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-teal-800 text-white text-2xl font-bold flex items-center justify-center border-2 border-white/20">
                    {profile.name.charAt(0)}
                  </div>
                )}
              </div>

              {/* Name, Headline & Unboxed Metadata */}
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2 text-xs text-teal-300 font-medium">
                  <span>{profile.relocationStatus || 'Exploring Options'}</span>
                  <span aria-hidden="true">·</span>
                  <span>Member since {memberAccount.createdAt || '2025'}</span>
                  {memberAccount.username && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono text-slate-400">@{memberAccount.username}</span>
                    </>
                  )}
                </div>

                <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                  {profile.name}
                </h2>

                {profile.occupationOrBackground && (
                  <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{profile.occupationOrBackground}</span>
                  </p>
                )}

                {/* Origin & Residing Location */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-300 pt-1">
                  <span className="flex items-center gap-1">
                    <span>From:</span>
                    <strong className="text-white font-semibold">
                      {getWorldCountryFlag(profile.originCountry)} {profile.originCountry}
                    </strong>
                  </span>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    <span>Residing:</span>
                    <strong className="text-white font-semibold">
                      {getWorldCountryFlag(profile.residingCountry || profile.originCountry)}{' '}
                      {profile.originCity ? `${profile.originCity}, ` : ''}
                      {profile.residingCountry || profile.originCountry}
                    </strong>
                  </span>
                  {profile.preferredClimate && (
                    <>
                      <span aria-hidden="true" className="text-slate-600">·</span>
                      <span className="flex items-center gap-1">
                        <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>{profile.preferredClimate} Climate</span>
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Top-right Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              {isOwnProfile ? (
                <button
                  onClick={() => {
                    closePublicProfile();
                    openEditProfile('about');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit My Profile</span>
                </button>
              ) : (
                <button
                  onClick={handleOpenFullMessenger}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm whitespace-nowrap cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Open in Messenger</span>
                </button>
              )}

              <button
                onClick={closePublicProfile}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
                aria-label="Close Public Profile"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Privacy Assurance Strip */}
          <div className="mt-5 pt-3.5 border-t border-slate-800/90 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              <span>
                Public Expat Profile · Personal financial status, budget figures &amp; shortlisted countries are kept strictly private.
              </span>
            </div>
            <div className="flex items-center gap-3 font-mono tabular-nums text-slate-300">
              <span>{visitedCountries.length} Countries Visited</span>
              <span aria-hidden="true">·</span>
              <span>{languagesKnown.length} Languages</span>
              <span aria-hidden="true">·</span>
              <span>{interests.length} Interests</span>
            </div>
          </div>
        </div>

        {/* Scrollable Profile Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-8 bg-slate-50/50">
          {/* 1. Basic Details & Retirement Vision */}
          <section className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Compass className="w-4 h-4 text-teal-700" />
                <span>About &amp; International Lifestyle Background</span>
              </h3>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>Relocation Stage: <strong className="text-slate-800">{profile.relocationStatus || 'Exploring Options'}</strong></span>
                {profile.retirementTimelineYear && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>Timeline: <strong className="text-slate-800 font-mono tabular-nums">{profile.retirementTimelineYear}</strong></span>
                  </>
                )}
              </div>
            </div>

            {profile.bio && (
              <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                “{profile.bio}”
              </p>
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

            {/* Structured Basic Details Grid (Strictly Non-Financial) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                <span className="text-[11px] text-slate-500 block">Origin Country</span>
                <span className="text-xs font-bold text-slate-900 mt-0.5 block truncate">
                  {getWorldCountryFlag(profile.originCountry)} {profile.originCountry}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                <span className="text-[11px] text-slate-500 block">Current Residence</span>
                <span className="text-xs font-bold text-slate-900 mt-0.5 block truncate">
                  {getWorldCountryFlag(profile.residingCountry || profile.originCountry)}{' '}
                  {profile.originCity ? `${profile.originCity}, ` : ''}
                  {profile.residingCountry || profile.originCountry}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                <span className="text-[11px] text-slate-500 block">Preferred Climate</span>
                <span className="text-xs font-bold text-slate-900 mt-0.5 block truncate">
                  {profile.preferredClimate || 'Mediterranean'}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                <span className="text-[11px] text-slate-500 block">Background</span>
                <span className="text-xs font-bold text-slate-900 mt-0.5 block truncate" title={profile.occupationOrBackground}>
                  {profile.occupationOrBackground || 'Expat Community Member'}
                </span>
              </div>
            </div>
          </section>

          {/* 2. Countries Visited & Scouting Passport */}
          <section className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-teal-700" />
                  <span>Countries Visited &amp; Firsthand Travel Log ({visitedCountries.length})</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Destinations {profile.name.split(' ')[0]} has personally visited, lived in, or scouted for retirement.
                </p>
              </div>
              {isOwnProfile && (
                <button
                  onClick={() => {
                    closePublicProfile();
                    openEditProfile('travel');
                  }}
                  className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Add Visited Country</span>
                </button>
              )}
            </div>

            {visitedCountries.length === 0 ? (
              <div className="p-6 text-center bg-slate-50 rounded-lg border border-slate-200/80">
                <Globe className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                <p className="text-xs font-semibold text-slate-700">No visited countries logged yet</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Send {profile.name.split(' ')[0]} a message to ask about their upcoming travel or scouting plans.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {visitedCountries.map(visit => {
                  const catalogCountry = countries.find(
                    c => c.name.toLowerCase() === visit.countryName.toLowerCase()
                  );
                  return (
                    <div
                      key={visit.id}
                      className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <span className="text-2xl leading-none">
                              {visit.flag || getWorldCountryFlag(visit.countryName)}
                            </span>
                            <div>
                              <h4 className="text-sm font-bold text-slate-900">
                                {visit.countryName}
                              </h4>
                              <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
                                <span className="font-mono tabular-nums">{visit.yearVisited}</span>
                                <span aria-hidden="true">·</span>
                                <span>{visit.purpose}</span>
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
                          <div className="flex items-center gap-0.5 text-amber-500 shrink-0" title={`Rated ${visit.rating}/5`}>
                            {Array.from({ length: 5 }).map((_, idx) => (
                              <Star
                                key={idx}
                                className={`w-3.5 h-3.5 ${
                                  idx < visit.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        {visit.favoriteSpotOrMemory && (
                          <p className="text-xs text-slate-800 font-medium leading-relaxed">
                            <span className="text-slate-500 font-normal">Highlight: </span>
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
                        <span className="text-slate-500">
                          Retire verdict:{' '}
                          <strong
                            className={
                              visit.wouldRetireHere === 'Definitely'
                                ? 'text-emerald-700'
                                : visit.wouldRetireHere === 'Maybe'
                                  ? 'text-amber-700'
                                  : 'text-slate-700'
                            }
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
                            className="text-teal-700 hover:text-teal-900 font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <span>Country Dossier</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* 3. Languages Known & Lifestyle Interests (2-Column Split) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
            {/* Languages Known (5 cols) */}
            <section className="md:col-span-5 bg-white rounded-xl border border-slate-200 p-5 sm:p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Languages className="w-4 h-4 text-teal-700" />
                    <span>Languages Known ({languagesKnown.length})</span>
                  </h3>
                </div>

                {languagesKnown.length === 0 ? (
                  <p className="text-xs text-slate-500">English (Conversational)</p>
                ) : (
                  <div className="space-y-3">
                    {languagesKnown.map(lang => {
                      const pct = getProficiencyPercent(lang.proficiency);
                      return (
                        <div key={lang.id} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-900">{lang.language}</span>
                            <span className="text-slate-500 font-medium">{lang.proficiency}</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-teal-600 rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                Open to language exchange &amp; local integration advice with fellow expats.
              </div>
            </section>

            {/* Interests & Passions (7 cols) */}
            <section className="md:col-span-7 bg-white rounded-xl border border-slate-200 p-5 sm:p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-rose-600" />
                    <span>Interests &amp; Lifestyle Passions ({interests.length})</span>
                  </h3>
                  {!isOwnProfile && sharedInterestsCount > 0 && (
                    <span className="text-xs font-semibold text-teal-700">
                      {sharedInterestsCount} shared with you
                    </span>
                  )}
                </div>

                {interests.length === 0 ? (
                  <p className="text-xs text-slate-500">Coastal walks, cultural exploration, and expat social meetups.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {interests.map(interest => {
                      const isShared = !isOwnProfile && viewerInterests.has(interest.toLowerCase());
                      return (
                        <div
                          key={interest}
                          className={`px-3.5 py-2.5 rounded-lg border text-xs flex items-center justify-between ${
                            isShared
                              ? 'bg-teal-50/70 border-teal-200 text-teal-950 font-semibold'
                              : 'bg-slate-50 border-slate-200/80 text-slate-800 font-medium'
                          }`}
                        >
                          <span className="truncate">{interest}</span>
                          {isShared && (
                            <span className="text-[10px] text-teal-700 font-bold ml-2 shrink-0">
                              Shared
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                Connect with {profile.name.split(' ')[0]} if you share similar hobbies, outdoor activities, or cultural interests.
              </div>
            </section>
          </div>

          {/* 4. Community Activity (Discussions & Meetups) */}
          {(memberThreads.length > 0 || memberMeetups.length > 0) && (
            <section className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 space-y-4">
              <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-orange-600" />
                  <span>Community Posts &amp; Hosted Meetups</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {memberThreads.map(t => (
                  <div
                    key={t.id}
                    className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80 flex flex-col justify-between space-y-2"
                  >
                    <div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <span className="font-semibold text-orange-800">{t.countryName}</span>
                        <span aria-hidden="true">·</span>
                        <span>{t.category}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 mt-1 line-clamp-1">
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
                      className="text-[11px] font-semibold text-orange-700 hover:underline flex items-center gap-1 self-start cursor-pointer"
                    >
                      <span>View in Community Hub</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                {memberMeetups.map(m => (
                  <div
                    key={m.id}
                    className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80 flex flex-col justify-between space-y-2"
                  >
                    <div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <span className="font-semibold text-teal-800">{m.city}, {m.countryName}</span>
                        <span aria-hidden="true">·</span>
                        <span>{m.date}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 mt-1">
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
                      className="text-[11px] font-semibold text-teal-700 hover:underline flex items-center gap-1 self-start cursor-pointer"
                    >
                      <span>View Meetup &amp; RSVP ({m.attendeesCount} attending)</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 5. Personal Message & Direct Connection Integration */}
          {!isOwnProfile && (
            <section className="bg-white rounded-xl border border-teal-200 p-5 sm:p-6 space-y-4 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-teal-700" />
                    <span>Connect &amp; Send Personal Message to {profile.name}</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Messages sent here sync directly with your Direct Messenger inbox.
                  </p>
                </div>

                {isAuthenticated && currentUserId !== 'guest' && (
                  <button
                    onClick={handleOpenFullMessenger}
                    className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1 cursor-pointer self-start sm:self-auto"
                  >
                    <span>Open Full Chat Window</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {!isAuthenticated || currentUserId === 'guest' ? (
                <div className="py-6 px-4 bg-slate-50 rounded-2xl border border-slate-200/90 text-center space-y-3">
                  <div className="w-11 h-11 rounded-2xl bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center mx-auto shadow-2xs">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-900">Member Sign-In Required to Message {profile.name.split(' ')[0]}</h4>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      Direct peer messaging and conversation histories are reserved exclusively for authenticated members to protect privacy and prevent unsolicited messages.
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2.5 pt-1">
                    <button
                      onClick={() => openAuthModal('login')}
                      className="px-4 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Log In to Message</span>
                    </button>
                    <button
                      onClick={() => openAuthModal('signup')}
                      className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Create Account</span>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Recent messages preview if conversation already exists */}
                  {existingDmThread && existingDmThread.messages.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 max-h-44 overflow-y-auto">
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pb-1 border-b border-slate-200/70">
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
                              className={`max-w-[85%] rounded-xl px-3 py-1.5 text-xs ${
                                isMe
                                  ? 'bg-teal-800 text-white'
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
                    <span className="text-[11px] font-semibold text-slate-500 block">
                      Quick conversation starters (click to pre-fill):
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {quickIcebreakers.map((prompt, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setPersonalMessage(prompt)}
                          className="text-left text-xs px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-900 border border-slate-200 hover:border-teal-300 transition-colors cursor-pointer"
                        >
                          “{prompt}”
                        </button>
                      ))}
                    </div>
                  </div>

                  {sentConfirmation && (
                    <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between gap-2">
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
                    </div>
                  )}

                  {/* Message Composer Form */}
                  <form onSubmit={handleSendPersonalMessage} className="flex flex-col sm:flex-row gap-2.5">
                    <input
                      type="text"
                      placeholder={`Write a personal message to ${profile.name} about countries visited, languages, or expat life...`}
                      value={personalMessage}
                      onChange={e => setPersonalMessage(e.target.value)}
                      className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                    />
                    <button
                      type="submit"
                      disabled={!personalMessage.trim()}
                      className="px-5 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 disabled:opacity-50 text-white text-xs sm:text-sm font-bold transition-colors flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      <span>Send Personal Message</span>
                    </button>
                  </form>
                </>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
