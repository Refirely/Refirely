import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { DossierDownloadRecord, CountryDownloadAggregate } from '../types';
import { CountryFlag } from './CountryFlag';
import {
  Download,
  FileText,
  Users,
  UserCheck,
  Calendar,
  Clock,
  TrendingUp,
  BarChart3,
  Award,
  Globe2,
  Search,
  Filter,
  CheckCircle2,
  Trash2,
  FileSpreadsheet,
  ExternalLink,
  Laptop,
  Smartphone,
  Eye,
  Sparkles,
  ArrowUpRight,
  ShieldAlert,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const AdminDossierDownloadsModule: React.FC = () => {
  const {
    dossierDownloads,
    clearAllDossierDownloads,
    countries,
    navigateToCountry,
    setCurrentView,
  } = useApp();

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState<'all' | 'registered' | 'guest'>('all');
  const [timeRangeFilter, setTimeRangeFilter] = useState<'all' | 'today' | '7days' | '30days'>('all');
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'countries' | 'logs'>('overview');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [resetSuccessBanner, setResetSuccessBanner] = useState<string | null>(null);

  // Filtered downloads log
  const filteredDownloads = useMemo(() => {
    const now = new Date().getTime();
    const oneDay = 24 * 60 * 60 * 1000;

    return dossierDownloads.filter(record => {
      // Search term
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchCountry = record.countryName.toLowerCase().includes(term);
        const matchUser = record.userName.toLowerCase().includes(term);
        const matchEmail = (record.userEmail || '').toLowerCase().includes(term);
        if (!matchCountry && !matchUser && !matchEmail) return false;
      }

      // User Type filter
      if (userTypeFilter === 'registered' && !record.isRegisteredUser) return false;
      if (userTypeFilter === 'guest' && record.isRegisteredUser) return false;

      // Time range filter
      if (timeRangeFilter !== 'all') {
        const recordTime = new Date(record.downloadedAt).getTime();
        const diffDays = (now - recordTime) / oneDay;
        if (timeRangeFilter === 'today' && diffDays > 1) return false;
        if (timeRangeFilter === '7days' && diffDays > 7) return false;
        if (timeRangeFilter === '30days' && diffDays > 30) return false;
      }

      return true;
    });
  }, [dossierDownloads, searchTerm, userTypeFilter, timeRangeFilter]);

  // Aggregated data per country
  const countryAggregates = useMemo<CountryDownloadAggregate[]>(() => {
    const map = new Map<string, CountryDownloadAggregate>();
    const now = new Date().getTime();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;

    dossierDownloads.forEach(rec => {
      const existing = map.get(rec.countryId) || {
        countryId: rec.countryId,
        countryName: rec.countryName,
        flag: rec.flag,
        totalDownloads: 0,
        registeredUserDownloads: 0,
        guestDownloads: 0,
        latestDownloadDate: rec.downloadedAt,
        latestUser: rec.userName,
        downloadsLast7Days: 0,
      };

      existing.totalDownloads += 1;
      if (rec.isRegisteredUser) {
        existing.registeredUserDownloads += 1;
      } else {
        existing.guestDownloads += 1;
      }

      // Check if this record is newer than the recorded latest
      if (new Date(rec.downloadedAt).getTime() > new Date(existing.latestDownloadDate).getTime()) {
        existing.latestDownloadDate = rec.downloadedAt;
        existing.latestUser = rec.userName;
      }

      // 7-day counter
      if (now - new Date(rec.downloadedAt).getTime() <= oneWeek) {
        existing.downloadsLast7Days += 1;
      }

      map.set(rec.countryId, existing);
    });

    return Array.from(map.values()).sort((a, b) => b.totalDownloads - a.totalDownloads);
  }, [dossierDownloads]);

  // High-level statistics
  const stats = useMemo(() => {
    const total = dossierDownloads.length;
    const registered = dossierDownloads.filter(d => d.isRegisteredUser).length;
    const guests = total - registered;
    const now = new Date().getTime();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    const oneDay = 24 * 60 * 60 * 1000;

    const last7Days = dossierDownloads.filter(
      d => now - new Date(d.downloadedAt).getTime() <= oneWeek
    ).length;

    const last24h = dossierDownloads.filter(
      d => now - new Date(d.downloadedAt).getTime() <= oneDay
    ).length;

    const topCountry = countryAggregates[0];

    return {
      total,
      registered,
      guests,
      memberRatio: total > 0 ? Math.round((registered / total) * 100) : 0,
      guestRatio: total > 0 ? Math.round((guests / total) * 100) : 0,
      last7Days,
      last24h,
      uniqueCountriesCount: countryAggregates.length,
      topCountryName: topCountry ? topCountry.countryName : 'N/A',
      topCountryDownloads: topCountry ? topCountry.totalDownloads : 0,
    };
  }, [dossierDownloads, countryAggregates]);

  // Regional breakdown
  const regionalBreakdown = useMemo(() => {
    const regionMap: Record<string, number> = {
      Europe: 0,
      'Southeast Asia': 0,
      'Americas & Caribbean': 0,
      'Asia & Middle East': 0,
      Africa: 0,
      Oceania: 0,
    };

    dossierDownloads.forEach(rec => {
      const match = countries.find(c => c.id === rec.countryId);
      if (match) {
        if (match.region === 'Europe') regionMap['Europe'] += 1;
        else if (match.region === 'Southeast Asia') regionMap['Southeast Asia'] += 1;
        else if (
          match.region === 'Americas' ||
          match.region === 'North & Central America' ||
          match.region === 'South America'
        ) {
          regionMap['Americas & Caribbean'] += 1;
        } else if (match.region === 'Africa') regionMap['Africa'] += 1;
        else if (match.region === 'Oceania') regionMap['Oceania'] += 1;
        else regionMap['Asia & Middle East'] += 1;
      }
    });

    return Object.entries(regionMap)
      .map(([region, count]) => ({ region, count }))
      .sort((a, b) => b.count - a.count);
  }, [dossierDownloads, countries]);

  // Export CSV Handler
  const handleExportCsv = () => {
    const headers = [
      'Event ID',
      'Country ID',
      'Country Name',
      'User Status',
      'User ID',
      'User Name',
      'User Email',
      'Export Format',
      'Downloaded At (ISO)',
      'Device Info',
    ];

    const rows = dossierDownloads.map(d => [
      d.id,
      d.countryId,
      `"${d.countryName}"`,
      d.isRegisteredUser ? 'Registered Member' : 'Anonymous Guest',
      d.userId || 'guest',
      `"${d.userName}"`,
      `"${d.userEmail || ''}"`,
      `"${d.exportFormat}"`,
      d.downloadedAt,
      `"${d.deviceInfo || ''}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `refirely_dossier_downloads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper format relative time
  const formatTimeAgo = (isoDate: string) => {
    try {
      const ms = new Date().getTime() - new Date(isoDate).getTime();
      const mins = Math.floor(ms / (60 * 1000));
      if (mins < 1) return 'Just now';
      if (mins < 60) return `${mins}m ago`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      if (days === 1) return 'Yesterday';
      return `${days}d ago`;
    } catch {
      return isoDate;
    }
  };

  return (
    <div className="space-y-6">
      {/* MODULE HEADER BAR */}
      <div className="relative overflow-hidden bg-white rounded-3xl border border-indigo-100/90 p-6 sm:p-8 shadow-sm">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-400 via-indigo-600 to-amber-500" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-teal-700 uppercase tracking-wider mb-1">
              <Download className="w-4 h-4 text-teal-600" />
              <span>Real-Time Relocation Intelligence</span>
              <span className="text-slate-300">·</span>
              <span className="text-slate-500 font-semibold">Dossier PDF Downloads</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-slate-900 via-indigo-950 to-teal-900 bg-clip-text text-transparent">
              Country Dossier Downloads &amp; Expat Interest Tracker
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
              Real-time audit log of country dossier exports. Track which destinations generate the highest conversion, analyze registered member vs. guest downloads, and visualize top haven demand trends.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={handleExportCsv}
              disabled={dossierDownloads.length === 0}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
              title="Download CSV spreadsheet of all dossier download records"
            >
              <FileSpreadsheet className="w-4 h-4 text-teal-400" />
              <span>Export CSV Audit</span>
            </button>

            {showClearConfirm ? (
              <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 p-1 rounded-xl">
                <span className="text-[11px] font-bold text-rose-800 px-2">Clear all?</span>
                <button
                  onClick={() => {
                    clearAllDossierDownloads();
                    setShowClearConfirm(false);
                    setResetSuccessBanner('Log has been successfully reset! All future dossier downloads will be captured in real-time from now onwards.');
                    setTimeout(() => setResetSuccessBanner(null), 6000);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold cursor-pointer transition-colors"
                >
                  Yes
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="px-2 py-1 rounded-lg bg-slate-200 text-slate-700 text-[11px] font-bold cursor-pointer"
                >
                  No
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 font-bold text-xs border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Reset local dossier download log"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Reset Log</span>
              </button>
            )}
          </div>
        </div>

        {/* RESET CONFIRMATION SUCCESS BANNER */}
        <AnimatePresence>
          {resetSuccessBanner && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mt-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between gap-3 shadow-2xs"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{resetSuccessBanner}</span>
              </div>
              <button
                onClick={() => setResetSuccessBanner(null)}
                className="text-emerald-700 hover:text-emerald-950 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 4 CORE KPI STAT CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-50/80 via-white to-emerald-50/40 border border-teal-200/80">
            <div className="flex items-center justify-between text-teal-800 text-[11px] font-bold uppercase tracking-wider">
              <span>Total Dossiers Downloaded</span>
              <Download className="w-3.5 h-3.5" />
            </div>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="font-mono tabular-nums text-3xl font-extrabold text-teal-950">
                {stats.total.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                +{stats.last24h} today
              </span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Across all 209 verified havens
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/80 via-white to-sky-50/40 border border-indigo-200/80">
            <div className="flex items-center justify-between text-indigo-800 text-[11px] font-bold uppercase tracking-wider">
              <span>Past 7 Days Demand</span>
              <Calendar className="w-3.5 h-3.5" />
            </div>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="font-mono tabular-nums text-3xl font-extrabold text-indigo-950">
                {stats.last7Days.toLocaleString()}
              </span>
              <span className="text-xs text-indigo-600 font-semibold">downloads</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Weekly relocation scouting velocity
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-50/80 via-white to-purple-50/40 border border-violet-200/80">
            <div className="flex items-center justify-between text-violet-800 text-[11px] font-bold uppercase tracking-wider">
              <span>User Demographics</span>
              <Users className="w-3.5 h-3.5" />
            </div>
            <div className="mt-1.5 flex items-baseline gap-1.5">
              <span className="font-mono tabular-nums text-2xl font-extrabold text-violet-950">
                {stats.registered}
              </span>
              <span className="text-xs text-slate-400 font-medium">Members</span>
              <span className="text-slate-300">·</span>
              <span className="font-mono tabular-nums text-2xl font-extrabold text-slate-700">
                {stats.guests}
              </span>
              <span className="text-xs text-slate-400 font-medium">Guests</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              {stats.memberRatio}% logged-in account conversion
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/80 via-white to-orange-50/40 border border-amber-200/80">
            <div className="flex items-center justify-between text-amber-800 text-[11px] font-bold uppercase tracking-wider">
              <span>#1 Top Haven in Demand</span>
              <Award className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="text-xl font-extrabold text-slate-900 truncate">
                {stats.topCountryName}
              </span>
              <span className="font-mono text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                {stats.topCountryDownloads} DLs
              </span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Leading global retirement interest
            </span>
          </div>
        </div>

        {/* SUB-NAVIGATION TABS */}
        <div className="flex items-center gap-2 pt-6 border-t border-slate-100 mt-6 text-xs font-bold">
          <button
            onClick={() => setActiveSubTab('overview')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeSubTab === 'overview'
                ? 'bg-gradient-to-r from-teal-600 to-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Infographics &amp; Country Demand
          </button>
          <button
            onClick={() => setActiveSubTab('countries')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeSubTab === 'countries'
                ? 'bg-gradient-to-r from-teal-600 to-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Country Aggregates Matrix ({countryAggregates.length})
          </button>
          <button
            onClick={() => setActiveSubTab('logs')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeSubTab === 'logs'
                ? 'bg-gradient-to-r from-teal-600 to-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Live Activity Audit Stream ({dossierDownloads.length})
          </button>
        </div>
      </div>

      {/* VIEW 1: INFOGRAPHICS & TOP COUNTRIES VISUAL CHARTS */}
      {activeSubTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2/3 width): Top Countries Bar Infographics */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-indigo-100/90 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider block mb-0.5">
                  Leaderboard Rankings
                </span>
                <h3 className="text-lg font-extrabold text-slate-900">
                  Top 8 Most Downloaded Country Dossiers
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                Ranked by lifetime exports
              </span>
            </div>

            {countryAggregates.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No dossier downloads recorded yet.
              </div>
            ) : (
              <div className="space-y-4">
                {countryAggregates.slice(0, 8).map((agg, idx) => {
                  const maxDownloads = countryAggregates[0]?.totalDownloads || 1;
                  const percentOfTop = Math.round((agg.totalDownloads / maxDownloads) * 100);
                  const shareOfAll = stats.total > 0 ? Math.round((agg.totalDownloads / stats.total) * 100) : 0;

                  const rankMedals = ['🥇 #1', '🥈 #2', '🥉 #3'];
                  const medalBadge = rankMedals[idx] || `#${idx + 1}`;

                  const barGradients = [
                    'from-teal-500 to-emerald-500',
                    'from-indigo-500 to-violet-500',
                    'from-amber-500 to-orange-500',
                    'from-sky-500 to-indigo-500',
                    'from-rose-500 to-pink-500',
                    'from-purple-500 to-indigo-500',
                    'from-cyan-500 to-teal-500',
                    'from-emerald-500 to-teal-600',
                  ];
                  const barGradient = barGradients[idx % barGradients.length];

                  return (
                    <motion.div
                      key={agg.countryId}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      className="group p-3.5 rounded-2xl bg-slate-50/70 hover:bg-indigo-50/40 border border-slate-200/80 hover:border-indigo-200 transition-all space-y-2"
                    >
                      <div className="flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-bold shrink-0 ${
                            idx === 0
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : idx === 1
                              ? 'bg-slate-200 text-slate-800'
                              : idx === 2
                              ? 'bg-orange-100 text-orange-900'
                              : 'bg-white text-slate-600 border border-slate-200'
                          }`}>
                            {medalBadge}
                          </span>

                          <CountryFlag countryName={agg.countryName} countryCode={agg.countryId} fallbackEmoji={agg.flag} className="w-5 h-4 rounded shadow-2xs shrink-0" />

                          <button
                            onClick={() => navigateToCountry(agg.countryId)}
                            className="font-extrabold text-slate-900 hover:text-indigo-600 transition-colors truncate text-sm flex items-center gap-1 cursor-pointer"
                          >
                            <span>{agg.countryName}</span>
                            <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 text-indigo-500 transition-opacity" />
                          </button>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-[11px] text-slate-500 font-medium">
                            {agg.registeredUserDownloads} members <span className="text-slate-300">·</span> {agg.guestDownloads} guests
                          </span>
                          <span className="font-mono tabular-nums font-extrabold text-slate-900 text-sm">
                            {agg.totalDownloads} <span className="text-[10px] text-slate-400 font-sans font-normal">({shareOfAll}%)</span>
                          </span>
                        </div>
                      </div>

                      {/* Visual Meter Bar */}
                      <div className="w-full h-2.5 rounded-full bg-slate-200/80 overflow-hidden relative">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentOfTop}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut', delay: idx * 0.05 }}
                          className={`h-full rounded-full bg-gradient-to-r ${barGradient}`}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                        <span>Latest download: {formatTimeAgo(agg.latestDownloadDate)} by <strong className="text-slate-600 font-semibold">{agg.latestUser}</strong></span>
                        <span className="font-mono font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                          +{agg.downloadsLast7Days} this week
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column (1/3 width): Regional Distribution & User Segment Breakdown */}
          <div className="space-y-6">
            {/* Regional Infographic Card */}
            <div className="bg-white rounded-3xl border border-indigo-100/90 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-800 uppercase tracking-wider">
                <Globe2 className="w-4 h-4 text-indigo-600" />
                <span>Regional Interest Share</span>
              </div>

              <h4 className="text-base font-extrabold text-slate-900">
                Downloads by Global Region
              </h4>

              <div className="space-y-3 pt-1">
                {regionalBreakdown.map(rb => {
                  const share = stats.total > 0 ? Math.round((rb.count / stats.total) * 100) : 0;
                  return (
                    <div key={rb.region} className="space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-700">{rb.region}</span>
                        <span className="font-mono font-extrabold text-slate-900">
                          {rb.count} <span className="text-[10px] text-slate-400">({share}%)</span>
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-teal-500 to-indigo-600"
                          style={{ width: `${share}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* User Type Breakdown Card */}
            <div className="bg-white rounded-3xl border border-indigo-100/90 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-violet-800 uppercase tracking-wider">
                <Users className="w-4 h-4 text-violet-600" />
                <span>Audience Conversion</span>
              </div>

              <h4 className="text-base font-extrabold text-slate-900">
                Registered vs. Guest Downloads
              </h4>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-50/70 to-indigo-50/50 border border-violet-100 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-violet-600" />
                    <span className="font-semibold text-slate-700">Verified Members:</span>
                  </div>
                  <strong className="font-mono font-extrabold text-violet-950">
                    {stats.registered} ({stats.memberRatio}%)
                  </strong>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-slate-400" />
                    <span className="font-semibold text-slate-700">Anonymous Guests:</span>
                  </div>
                  <strong className="font-mono font-extrabold text-slate-800">
                    {stats.guests} ({stats.guestRatio}%)
                  </strong>
                </div>

                {/* Compound Progress bar */}
                <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden flex">
                  <div
                    className="h-full bg-violet-600 transition-all duration-300"
                    style={{ width: `${stats.memberRatio}%` }}
                    title={`Verified Members: ${stats.memberRatio}%`}
                  />
                  <div
                    className="h-full bg-slate-400 transition-all duration-300"
                    style={{ width: `${stats.guestRatio}%` }}
                    title={`Anonymous Guests: ${stats.guestRatio}%`}
                  />
                </div>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed">
                Registered users who download dossiers can receive automated visa milestone notifications and save country notes in their personal journal.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: COUNTRY AGGREGATES MATRIX */}
      {activeSubTab === 'countries' && (
        <div className="bg-white rounded-3xl border border-indigo-100/90 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">
                Country Dossier Download Aggregates
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Summary of all {countryAggregates.length} destinations with active PDF downloads.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search country..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-bold">
                  <th className="py-3 px-4">Rank &amp; Country</th>
                  <th className="py-3 px-4">Total Downloads</th>
                  <th className="py-3 px-4">Member vs. Guest</th>
                  <th className="py-3 px-4">Last 7 Days</th>
                  <th className="py-3 px-4">Latest Download</th>
                  <th className="py-3 px-4">Latest Downloader</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {countryAggregates.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                      No dossier downloads recorded yet. As visitors or members export PDF dossiers, real-time country statistics will appear here.
                    </td>
                  </tr>
                ) : (
                  countryAggregates
                  .filter(c => !searchTerm || c.countryName.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((agg, idx) => (
                    <tr key={agg.countryId} className="hover:bg-indigo-50/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono text-slate-400 font-bold w-5">#{idx + 1}</span>
                          <CountryFlag countryName={agg.countryName} countryCode={agg.countryId} fallbackEmoji={agg.flag} className="w-5 h-4 rounded shadow-2xs" />
                          <span className="font-extrabold text-slate-900">{agg.countryName}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono font-extrabold text-slate-900 text-sm">
                        {agg.totalDownloads}
                      </td>

                      <td className="py-3 px-4 text-slate-600">
                        <span className="text-violet-700 font-bold">{agg.registeredUserDownloads}</span>
                        <span className="text-slate-400 mx-1">/</span>
                        <span className="text-slate-600">{agg.guestDownloads}</span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md font-bold">
                          +{agg.downloadsLast7Days}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        {formatTimeAgo(agg.latestDownloadDate)}
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800">
                          {agg.latestUser}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => navigateToCountry(agg.countryId)}
                          className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] transition-colors cursor-pointer"
                        >
                          View Dossier →
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: LIVE ACTIVITY AUDIT STREAM */}
      {activeSubTab === 'logs' && (
        <div className="bg-white rounded-3xl border border-indigo-100/90 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">
                Individual Download Audit Log
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Every single PDF export event recorded with user identity, device, and timestamp.
              </p>
            </div>

            {/* Filter controls */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-full sm:w-52">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search user or country..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <select
                value={userTypeFilter}
                onChange={e => setUserTypeFilter(e.target.value as any)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="all">All Users</option>
                <option value="registered">Registered Members Only</option>
                <option value="guest">Anonymous Guests Only</option>
              </select>

              <select
                value={timeRangeFilter}
                onChange={e => setTimeRangeFilter(e.target.value as any)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="all">All Time</option>
                <option value="today">Today Only</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
              </select>
            </div>
          </div>

          {/* Audit Rows */}
          {filteredDownloads.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No download records match the selected filter criteria.
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredDownloads.map(record => (
                <div
                  key={record.id}
                  className="p-3.5 rounded-2xl bg-slate-50/80 hover:bg-indigo-50/30 border border-slate-200/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <CountryFlag countryName={record.countryName} countryCode={record.countryCode || record.countryId} fallbackEmoji={record.flag} className="w-7 h-5 rounded shadow-2xs shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-slate-900 font-extrabold text-sm">
                          {record.countryName}
                        </strong>
                        <span className="text-slate-400 font-mono text-[10px]">
                          ({record.countryCode || record.countryId})
                        </span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          record.isRegisteredUser
                            ? 'bg-violet-100 text-violet-900 border border-violet-200'
                            : 'bg-slate-200 text-slate-700'
                        }`}>
                          {record.isRegisteredUser ? 'Verified Member' : 'Guest'}
                        </span>
                      </div>
                      <div className="text-slate-500 text-[11px] mt-0.5 flex items-center gap-2">
                        <span>Downloader: <strong className="text-slate-700">{record.userName}</strong></span>
                        {record.userEmail && (
                          <>
                            <span className="text-slate-300">·</span>
                            <span>{record.userEmail}</span>
                          </>
                        )}
                        <span className="text-slate-300">·</span>
                        <span className="text-teal-700 font-medium">{record.exportFormat}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-right shrink-0">
                    <div className="text-[11px] text-slate-400">
                      <div className="font-mono text-slate-700 font-medium">
                        {new Date(record.downloadedAt).toLocaleDateString()} {new Date(record.downloadedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {formatTimeAgo(record.downloadedAt)} {record.deviceInfo && `· ${record.deviceInfo}`}
                      </span>
                    </div>

                    <button
                      onClick={() => navigateToCountry(record.countryId)}
                      className="p-2 rounded-xl bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer shadow-2xs"
                      title="Open country dossier"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
