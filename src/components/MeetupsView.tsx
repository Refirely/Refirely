import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Calendar, MapPin, Users, Plus, Check, Search, X, Clock, MessageCircle, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';
import { ExpatMeetup } from '../types';

export const MeetupsView: React.FC = () => {
  const {
    meetups,
    toggleRsvpMeetup,
    addMeetup,
    countries,
    userProfile,
    publicMemberAccounts,
    openPublicProfile,
    startDmWithPeer,
    isAuthenticated,
    openAuthModal,
  } = useApp();

  const [countryFilter, setCountryFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Host modal state
  const [isHostModalOpen, setIsHostModalOpen] = useState(false);
  const [newCountryId, setNewCountryId] = useState(countries[0]?.id || 'portugal');
  const [newCity, setNewCity] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState<ExpatMeetup['category']>('Coffee & Chat');

  const categories = [
    'All',
    'Coffee & Chat',
    'Sunset Drinks & Tapas',
    'Relocation Workshop',
    'Outdoor Hike / Excursion',
  ];

  const filteredMeetups = meetups.filter(m => {
    if (countryFilter !== 'All' && m.countryId !== countryFilter) return false;
    if (categoryFilter !== 'All' && m.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        m.title.toLowerCase().includes(q) ||
        m.city.toLowerCase().includes(q) ||
        m.countryName.toLowerCase().includes(q) ||
        m.location.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCreateMeetup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCity.trim() || !newTitle.trim() || !newDate.trim() || !newLocation.trim()) return;

    const matchedCountry = countries.find(c => c.id === newCountryId);

    addMeetup({
      countryId: newCountryId,
      countryName: matchedCountry?.name || 'Global',
      city: newCity.trim(),
      title: newTitle.trim(),
      date: newDate.trim(),
      time: newTime.trim() || '18:00 - 20:00',
      location: newLocation.trim(),
      description: newDescription.trim() || 'Casual community gathering to connect prospective and resident retirees.',
      hostName: userProfile.name,
      hostRole: 'Community Organizer',
      category: newCategory,
    });

    setIsHostModalOpen(false);
    setNewCity('');
    setNewTitle('');
    setNewDate('');
    setNewTime('');
    setNewLocation('');
    setNewDescription('');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Page Header - Multi-Colored Luminous Banner */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 26 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-50/90 via-white to-indigo-50/85 border border-teal-200/80 p-6 sm:p-8 shadow-md"
      >
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 via-indigo-500 via-50% to-amber-500" />
        <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-teal-400/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-indigo-400/15 blur-3xl" />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-500 via-emerald-600 to-indigo-600 text-white flex items-center justify-center shadow-sm shadow-teal-500/20">
                <Calendar className="w-5 h-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                Expat Meetups &amp;{' '}
                <span className="bg-gradient-to-r from-teal-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                  Social Gatherings
                </span>
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1.5">
              Connect in-person with fellow retirees and seasoned expats living across your favorite destinations.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setIsHostModalOpen(true)}
            className="px-4 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-teal-600 via-emerald-600 to-indigo-600 text-white hover:from-teal-700 hover:to-indigo-700 transition-all flex items-center gap-1.5 self-start sm:self-auto shadow-sm shadow-teal-600/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Host a Meetup</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Filter and Search Bar */}
      <div className="my-6 space-y-3 bg-gradient-to-r from-white via-teal-50/35 to-indigo-50/35 p-4 sm:p-5 rounded-2xl border border-teal-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-teal-600 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search meetups by city, venue, or title..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-teal-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white shadow-2xs"
            />
          </div>

          <div className="w-full sm:w-56">
            <select
              value={countryFilter}
              onChange={e => setCountryFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-teal-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white font-semibold text-slate-800 shadow-2xs"
            >
              <option value="All">All Countries</option>
              {countries.map(c => (
                <option key={c.id} value={c.id}>
                  {c.flag} {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-gradient-to-r from-teal-600 via-emerald-600 to-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200/80 hover:text-teal-950 hover:border-teal-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Meetups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredMeetups.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white rounded-2xl border border-slate-200">
            <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-800">No meetups found for this criteria</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Be the first to schedule an informal coffee or dinner gathering in this town!
            </p>
            <button
              onClick={() => setIsHostModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-teal-600 to-indigo-600 text-white text-xs font-bold hover:from-teal-700 hover:to-indigo-700"
            >
              Create New Meetup
            </button>
          </div>
        ) : (
          filteredMeetups.map(meetup => (
            <motion.div
              key={meetup.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4, scale: 1.01 }}
              className="relative overflow-hidden bg-gradient-to-br from-white via-white to-teal-50/40 rounded-2xl border border-teal-200/80 p-5 flex flex-col justify-between hover:border-teal-400 transition-all shadow-xs hover:shadow-md"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 via-indigo-500 to-amber-500" />
              <div>
                {/* Clean unboxed metadata with typographic separators */}
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-teal-800">{meetup.countryName}</span>
                    <span aria-hidden="true">·</span>
                    <span>{meetup.city}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-semibold text-indigo-700">{meetup.category}</span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-2">
                  {meetup.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {meetup.description}
                </p>

                <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                    <span className="font-medium text-slate-800">{meetup.date}</span>
                    <Clock className="w-3.5 h-3.5 text-slate-400 ml-2 shrink-0" />
                    <span>{meetup.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span className="truncate">{meetup.location}</span>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-slate-500 text-[11px] pt-1 border-t border-slate-200/70">
                    <div className="flex items-center gap-1.5">
                      <span>Host:</span>
                      <button
                        type="button"
                        onClick={() => openPublicProfile(meetup.hostName)}
                        className="font-bold text-slate-800 hover:text-teal-800 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>{meetup.hostName}</span>
                        {publicMemberAccounts.some(
                          a => a.profile.name.toLowerCase() === meetup.hostName.toLowerCase()
                        ) && <ExternalLink className="w-2.5 h-2.5 text-teal-700" />}
                      </button>
                      <span className="text-slate-400">({meetup.hostRole})</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (!isAuthenticated) {
                          openAuthModal('login');
                          return;
                        }
                        startDmWithPeer(meetup.hostName, meetup.countryName, meetup.city);
                      }}
                      className="text-teal-700 hover:text-teal-900 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <MessageCircle className="w-3 h-3" />
                      <span>Message Host</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* RSVP Action Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span className="font-mono tabular-nums font-semibold">{meetup.attendeesCount}</span>
                  <span>fellow retirees attending</span>
                </div>

                <button
                  onClick={() => toggleRsvpMeetup(meetup.id)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                    meetup.isRsvped
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  {meetup.isRsvped ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>RSVP Confirmed</span>
                    </>
                  ) : (
                    <span>RSVP Free</span>
                  )}
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Host a Meetup Modal */}
      {isHostModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">Host an Expat Gathering</h3>
              <button
                onClick={() => setIsHostModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMeetup} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Country</label>
                  <select
                    value={newCountryId}
                    onChange={e => setNewCountryId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    {countries.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.flag} {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">City / Town</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cascais, Chiang Mai"
                    value={newCity}
                    onChange={e => setNewCity(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Meetup Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sunday Sunset Drinks on the Esplanade"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Date</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Saturday, Nov 28, 2026"
                    value={newDate}
                    onChange={e => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 17:30 - 20:00"
                    value={newTime}
                    onChange={e => setNewTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Location / Venue</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Marina Lounge Terrace, Cafe do Mar"
                  value={newLocation}
                  onChange={e => setNewLocation(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Activity Category</label>
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value as ExpatMeetup['category'])}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {categories.filter(c => c !== 'All').map(cat => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Description & Agenda</label>
                <textarea
                  rows={3}
                  placeholder="Share a short note about who should attend and what you will discuss..."
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsHostModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-teal-800 text-white hover:bg-teal-900 transition-colors"
                >
                  Publish Meetup
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
