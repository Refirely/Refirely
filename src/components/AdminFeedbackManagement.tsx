import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { FeedbackReport, FeedbackStatus, FeedbackPriority, FeedbackType } from '../types';
import {
  MessageSquarePlus,
  Bug,
  Sparkles,
  Search,
  CheckCircle,
  Clock,
  AlertTriangle,
  AlertCircle,
  Send,
  Mail,
  Copy,
  Check,
  Trash2,
  MessageCircle,
  MapPin,
  HelpCircle,
  UserCheck,
  Download,
  Edit3,
  X,
  Layers,
  ArrowRight
} from 'lucide-react';

export const AdminFeedbackManagement: React.FC = () => {
  const {
    feedbackReports,
    updateFeedbackStatus,
    deleteFeedbackReport,
    startDmWithPeer,
    setActiveDmThreadId,
    setCurrentView,
    registeredAccounts,
  } = useApp();

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'feedback' | 'bug'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [providerFilter, setProviderFilter] = useState<'all' | 'registered' | 'unregistered'>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  // Interactive editing state
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState('');
  const [copiedEmailId, setCopiedEmailId] = useState<string | null>(null);

  // Email reply composer modal state (for unregistered users)
  const [emailModalReport, setEmailModalReport] = useState<FeedbackReport | null>(null);
  const [customEmailReplyBody, setCustomEmailReplyBody] = useState('');

  // Status update toast
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  // KPI Calculations
  const stats = useMemo(() => {
    const total = feedbackReports.length;
    const newCount = feedbackReports.filter(r => r.status === 'new').length;
    const underReviewCount = feedbackReports.filter(r => r.status === 'under_review').length;
    const inProgressCount = feedbackReports.filter(r => r.status === 'in_progress').length;
    const resolvedCount = feedbackReports.filter(r => r.status === 'resolved' || r.status === 'closed').length;
    const bugsCount = feedbackReports.filter(r => r.type === 'bug').length;
    const feedbackCount = feedbackReports.filter(r => r.type === 'feedback').length;
    const criticalBugs = feedbackReports.filter(r => r.type === 'bug' && (r.bugSeverity === 'Critical' || r.priority === 'critical')).length;
    const withMissingData = feedbackReports.filter(r => Boolean(r.missingDataPoint?.trim())).length;
    const registeredCount = feedbackReports.filter(r => r.isRegisteredUser).length;

    return {
      total,
      newCount,
      underReviewCount,
      inProgressCount,
      resolvedCount,
      bugsCount,
      feedbackCount,
      criticalBugs,
      withMissingData,
      registeredCount,
    };
  }, [feedbackReports]);

  // Filtered List
  const filteredReports = useMemo(() => {
    return feedbackReports.filter(report => {
      // Type filter
      if (typeFilter !== 'all' && report.type !== typeFilter) return false;

      // Status filter
      if (statusFilter !== 'all' && report.status !== statusFilter) return false;

      // Provider filter
      if (providerFilter === 'registered' && !report.isRegisteredUser) return false;
      if (providerFilter === 'unregistered' && report.isRegisteredUser) return false;

      // Bug severity filter
      if (severityFilter !== 'all' && report.bugSeverity !== severityFilter) return false;

      // Search filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesName = report.userName.toLowerCase().includes(query);
        const matchesEmail = report.userEmail.toLowerCase().includes(query);
        const matchesMsg = report.message.toLowerCase().includes(query);
        const matchesCountry = (report.countryName || '').toLowerCase().includes(query);
        const matchesMissing = (report.missingDataPoint || '').toLowerCase().includes(query);
        const matchesId = report.id.toLowerCase().includes(query);
        const matchesNotes = (report.adminNotes || '').toLowerCase().includes(query);

        if (!matchesName && !matchesEmail && !matchesMsg && !matchesCountry && !matchesMissing && !matchesId && !matchesNotes) {
          return false;
        }
      }

      return true;
    });
  }, [feedbackReports, typeFilter, statusFilter, providerFilter, severityFilter, searchTerm]);

  // Status Change Handler
  const handleStatusChange = async (reportId: string, newStatus: FeedbackStatus) => {
    const res = await updateFeedbackStatus(reportId, newStatus);
    if (res.success) {
      showNotice(`Updated ticket #${reportId} status to "${newStatus.replace('_', ' ')}".`);
    }
  };

  // Priority Change Handler
  const handlePriorityChange = async (reportId: string, newPriority: FeedbackPriority) => {
    const res = await updateFeedbackStatus(reportId, undefined as any, undefined, newPriority);
    if (res.success) {
      showNotice(`Updated ticket #${reportId} priority to "${newPriority}".`);
    }
  };

  // Save Admin Note Handler
  const handleSaveNote = async (reportId: string) => {
    const res = await updateFeedbackStatus(reportId, undefined as any, noteDraft.trim());
    if (res.success) {
      setEditingNotesId(null);
      showNotice(`Saved administrative note on ticket #${reportId}.`);
    }
  };

  // Connect via Direct Message (for Registered Member)
  const handleConnectViaDirectMessage = (report: FeedbackReport) => {
    // Locate member account if possible
    const memberAcc = registeredAccounts.find(
      a => (report.userId && a.id === report.userId) || a.email.toLowerCase() === report.userEmail.toLowerCase()
    );

    const targetUserId = memberAcc?.id || report.userId || report.userName;
    const targetName = memberAcc?.name || report.userName;
    const targetCountry = memberAcc?.profile?.residingCountry || report.countryName || 'Expat Member';
    const targetCity = memberAcc?.profile?.originCity || 'Verified Expat';

    const introMessage = `Hi ${targetName.split(' ')[0]}, thank you for submitting your ${
      report.type === 'bug' ? 'bug report' : 'feedback'
    } on ReFIREly regarding ${report.countryName || 'our retirement intelligence'} (Ticket #${report.id}):\n\n"${report.message}"\n\nOur team is reviewing this and wanted to follow up with you directly. Let us know if you have any additional details!`;

    const threadId = startDmWithPeer(targetName, targetCountry, targetCity, introMessage, {
      peerAvatar: memberAcc?.profile?.avatarUrl || report.userAvatar,
      peerStatus: memberAcc?.profile?.relocationStatus || 'Registered Expat Member',
      peerUserId: targetUserId,
      stayOnCurrentView: false,
    });

    setActiveDmThreadId(threadId);
    setCurrentView('messages');
  };

  // Connect via Email (for Unregistered / Guest Provider)
  const handleOpenEmailModal = (report: FeedbackReport) => {
    setEmailModalReport(report);
    setCustomEmailReplyBody(
      `Hi ${report.userName || 'there'},\n\nThank you for reaching out to ReFIREly with your ${
        report.type === 'bug' ? 'bug report' : 'feedback'
      } regarding ${report.countryName || 'our havens'}.\n\nReference Ticket: #${report.id}\nYour note: "${report.message}"\n\nWe have reviewed your submission and wanted to follow up:\n\n[Write resolution details here...]\n\nWarm regards,\nReFIREly Relocation Intelligence Team\nhttps://refirely.app`
    );
  };

  const handleLaunchMailto = (report: FeedbackReport, bodyText?: string) => {
    const subject = encodeURIComponent(`Re: Your ReFIREly ${report.type === 'bug' ? 'Bug Report' : 'Feedback'} (#${report.id})`);
    const body = encodeURIComponent(
      bodyText ||
      `Hi ${report.userName || 'there'},\n\nThank you for reaching out to ReFIREly with your ${
        report.type === 'bug' ? 'bug report' : 'feedback'
      } regarding ${report.countryName || 'our havens'}.\n\nReference Ticket: #${report.id}\nYour note: "${report.message}"\n\n[Write resolution details here...]\n\nWarm regards,\nReFIREly Relocation Intelligence Team`
    );
    window.location.href = `mailto:${report.userEmail}?subject=${subject}&body=${body}`;
  };

  // Copy email address helper
  const handleCopyEmail = (reportId: string, email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmailId(reportId);
    setTimeout(() => setCopiedEmailId(null), 2500);
  };

  // Delete Report Handler
  const handleDelete = async (reportId: string) => {
    if (window.confirm(`Are you sure you want to delete ticket #${reportId}? This action cannot be undone.`)) {
      await deleteFeedbackReport(reportId);
      showNotice(`Deleted ticket #${reportId}.`);
    }
  };

  // Export to CSV
  const handleExportCsv = () => {
    const headers = [
      'Ticket ID',
      'Type',
      'Status',
      'Priority',
      'Is Registered',
      'User ID',
      'Provider Name',
      'Provider Email',
      'Country Context',
      'FIRE Numbers Realistic',
      'FIRE Numbers Comment',
      'Missing Data Point',
      'Message / Description',
      'Bug Severity',
      'Bug Steps',
      'Page Context',
      'Admin Notes',
      'Created At',
      'Resolved At',
    ];

    const rows = filteredReports.map(r => [
      r.id,
      r.type,
      r.status,
      r.priority || 'medium',
      r.isRegisteredUser ? 'Yes' : 'No',
      r.userId || 'guest',
      r.userName,
      r.userEmail,
      r.countryName || '',
      r.fireNumbersRating || '',
      r.fireNumbersComment || '',
      r.missingDataPoint || '',
      r.message,
      r.bugSeverity || '',
      r.bugStepsToReproduce || '',
      r.currentUrlOrView || '',
      r.adminNotes || '',
      r.createdAt,
      r.resolvedAt || '',
    ].map(val => `"${String(val).replace(/"/g, '""')}"`));

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `refirely-feedback-reports-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showNotice(`Exported ${filteredReports.length} feedback tickets to CSV.`);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notice */}
      {actionNotice && (
        <div className="p-3.5 rounded-xl bg-slate-900 text-white text-xs font-semibold flex items-center justify-between shadow-lg animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Tickets</span>
          <p className="font-mono text-2xl font-extrabold text-slate-900">{stats.total}</p>
          <p className="text-[10px] text-slate-500">{stats.feedbackCount} Feedback · {stats.bugsCount} Bugs</p>
        </div>

        <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">New Submissions</span>
          <p className="font-mono text-2xl font-extrabold text-amber-950">{stats.newCount}</p>
          <p className="text-[10px] text-amber-700">Awaiting triage &amp; review</p>
        </div>

        <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider block">Bug Reports</span>
          <p className="font-mono text-2xl font-extrabold text-rose-950">{stats.bugsCount}</p>
          <p className="text-[10px] text-rose-700">{stats.criticalBugs} Critical / High priority</p>
        </div>

        <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-purple-800 uppercase tracking-wider block">Missing Data Points</span>
          <p className="font-mono text-2xl font-extrabold text-purple-950">{stats.withMissingData}</p>
          <p className="text-[10px] text-purple-700">Havens or metrics suggested</p>
        </div>

        <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider block">Registered Expats</span>
          <p className="font-mono text-2xl font-extrabold text-blue-950">{stats.registeredCount}</p>
          <p className="text-[10px] text-blue-700">Direct message capable</p>
        </div>

        <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">Resolved Tickets</span>
          <p className="font-mono text-2xl font-extrabold text-emerald-950">{stats.resolvedCount}</p>
          <p className="text-[10px] text-emerald-700">{stats.inProgressCount} currently in progress</p>
        </div>
      </div>

      {/* Filter & Control Bar */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3 shadow-2xs">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by user, email, country, message, ticket ID, or missing data point..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleExportCsv}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 text-xs">
          {/* Type Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <span className="text-[10px] font-bold text-slate-500 px-1.5 uppercase">Type:</span>
            {[
              { id: 'all', label: 'All' },
              { id: 'feedback', label: 'Feedback' },
              { id: 'bug', label: 'Bugs' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setTypeFilter(tab.id as any)}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                  typeFilter === tab.id ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <span className="text-[10px] font-bold text-slate-500 px-1.5 uppercase">Status:</span>
            {[
              { id: 'all', label: 'All' },
              { id: 'new', label: 'New' },
              { id: 'under_review', label: 'Review' },
              { id: 'in_progress', label: 'In Progress' },
              { id: 'resolved', label: 'Resolved' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                  statusFilter === tab.id ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Provider Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <span className="text-[10px] font-bold text-slate-500 px-1.5 uppercase">Provider:</span>
            {[
              { id: 'all', label: 'All' },
              { id: 'registered', label: 'Members' },
              { id: 'unregistered', label: 'Guests' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setProviderFilter(tab.id as any)}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                  providerFilter === tab.id ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Ticket List Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>
            Showing <strong className="text-slate-800 font-mono">{filteredReports.length}</strong> of{' '}
            <strong className="text-slate-800 font-mono">{feedbackReports.length}</strong> tickets
          </span>
          <span className="text-[11px] text-slate-400">
            Click any ticket to expand full research details &amp; notes
          </span>
        </div>

        {filteredReports.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-10 text-center space-y-2">
            <MessageSquarePlus className="w-8 h-8 text-slate-400 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800">No matching tickets found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search criteria, type filters, or status selections.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReports.map(report => {
              const isSelected = selectedReportId === report.id;
              const isNotesEditing = editingNotesId === report.id;

              return (
                <div
                  key={report.id}
                  className={`bg-white rounded-xl border transition-all overflow-hidden ${
                    isSelected
                      ? 'border-orange-500 shadow-md ring-2 ring-orange-500/10'
                      : 'border-slate-200 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  {/* Card Header Strip */}
                  <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/40">
                    <div className="flex flex-wrap items-center gap-2.5">
                      {/* Ticket Type Tag */}
                      <span
                        className={`px-2.5 py-1 rounded-md text-xs font-extrabold flex items-center gap-1.5 ${
                          report.type === 'bug'
                            ? 'bg-rose-100 text-rose-900 border border-rose-300'
                            : 'bg-orange-100 text-orange-950 border border-orange-300'
                        }`}
                      >
                        {report.type === 'bug' ? (
                          <>
                            <Bug className="w-3.5 h-3.5 text-rose-600" />
                            <span>Bug Report</span>
                            {report.bugSeverity && (
                              <span className="ml-1 px-1.5 py-0.2 rounded bg-rose-200 text-rose-900 text-[10px] font-mono">
                                {report.bugSeverity}
                              </span>
                            )}
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                            <span>General Feedback</span>
                          </>
                        )}
                      </span>

                      {/* Ticket ID */}
                      <code className="text-xs font-mono font-bold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded">
                        #{report.id}
                      </code>

                      {/* Country Context Tag */}
                      {report.countryName && (
                        <span className="text-xs bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded font-medium flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          <span>{report.countryName}</span>
                        </span>
                      )}

                      {/* Timestamp */}
                      <span className="text-[11px] text-slate-400 font-mono">
                        {new Date(report.createdAt).toLocaleDateString()} at{' '}
                        {new Date(report.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Right Status & Priority Dropdowns */}
                    <div className="flex items-center gap-2">
                      {/* Status Selector */}
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] text-slate-400 hidden sm:inline">Status:</span>
                        <select
                          value={report.status}
                          onChange={e => handleStatusChange(report.id, e.target.value as FeedbackStatus)}
                          className={`text-xs font-bold rounded-lg px-2.5 py-1 border transition-colors cursor-pointer ${
                            report.status === 'new'
                              ? 'bg-amber-50 text-amber-900 border-amber-300'
                              : report.status === 'under_review'
                                ? 'bg-blue-50 text-blue-900 border-blue-300'
                                : report.status === 'in_progress'
                                  ? 'bg-purple-50 text-purple-900 border-purple-300'
                                  : 'bg-emerald-50 text-emerald-900 border-emerald-300'
                          }`}
                        >
                          <option value="new">New</option>
                          <option value="under_review">Under Review</option>
                          <option value="in_progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                          <option value="closed">Closed</option>
                        </select>
                      </div>

                      {/* Priority Selector */}
                      <select
                        value={report.priority || 'medium'}
                        onChange={e => handlePriorityChange(report.id, e.target.value as FeedbackPriority)}
                        className="text-xs font-semibold bg-white border border-slate-200 text-slate-700 rounded-lg px-2 py-1 cursor-pointer"
                        title="Set Priority"
                      >
                        <option value="low">Low Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="high">High Priority</option>
                        <option value="critical">Critical</option>
                      </select>

                      {/* Delete Ticket Button */}
                      <button
                        onClick={() => handleDelete(report.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete Ticket"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Card Main Body */}
                  <div className="p-4 sm:p-5 space-y-4">
                    {/* Primary Message Description */}
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 leading-snug">
                        {report.title || report.message.slice(0, 100)}
                      </h4>
                      <p className="text-xs text-slate-700 mt-1.5 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                        {report.message}
                      </p>
                    </div>

                    {/* Bug Steps to Reproduce if provided */}
                    {report.type === 'bug' && report.bugStepsToReproduce && (
                      <div className="p-3 bg-rose-50/50 rounded-lg border border-rose-100 text-xs space-y-1">
                        <span className="font-bold text-rose-900 text-[11px] block">Steps to Reproduce:</span>
                        <p className="text-slate-700">{report.bugStepsToReproduce}</p>
                      </div>
                    )}

                    {/* 2 REQUIRED QUESTIONS RESPONSES GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      {/* Q1: Did you find the FIRE numbers realistic for this country? */}
                      <div className="p-3.5 rounded-xl bg-teal-50/40 border border-teal-200/80 space-y-1.5">
                        <span className="text-[11px] font-bold text-teal-900 flex items-center gap-1.5">
                          <HelpCircle className="w-3.5 h-3.5 text-teal-700" />
                          <span>Q1: FIRE Numbers Realistic?</span>
                        </span>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-extrabold ${
                              report.fireNumbersRating === 'realistic'
                                ? 'bg-emerald-100 text-emerald-900'
                                : report.fireNumbersRating === 'somewhat_realistic'
                                  ? 'bg-amber-100 text-amber-900'
                                  : report.fireNumbersRating === 'too_optimistic'
                                    ? 'bg-rose-100 text-rose-900'
                                    : report.fireNumbersRating === 'too_conservative'
                                      ? 'bg-blue-100 text-blue-900'
                                      : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {report.fireNumbersRating ? report.fireNumbersRating.replace('_', ' ').toUpperCase() : 'NOT SPECIFIED'}
                          </span>
                        </div>
                        {report.fireNumbersComment ? (
                          <p className="text-xs text-slate-700 italic mt-1 leading-relaxed">
                            “{report.fireNumbersComment}”
                          </p>
                        ) : (
                          <p className="text-[11px] text-slate-400 italic">No specific number comments provided.</p>
                        )}
                      </div>

                      {/* Q2: What country or data point is missing? */}
                      <div className="p-3.5 rounded-xl bg-purple-50/40 border border-purple-200/80 space-y-1.5">
                        <span className="text-[11px] font-bold text-purple-950 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-purple-700" />
                          <span>Q2: What Country or Data Point is Missing?</span>
                        </span>
                        {report.missingDataPoint ? (
                          <p className="text-xs text-purple-950 font-medium leading-relaxed bg-white/70 p-2 rounded border border-purple-100">
                            {report.missingDataPoint}
                          </p>
                        ) : (
                          <p className="text-[11px] text-slate-400 italic">No missing data points flagged.</p>
                        )}
                      </div>
                    </div>

                    {/* Metadata & Context Bar */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 pt-1">
                      {report.currentUrlOrView && (
                        <span>
                          Origin View: <strong className="text-slate-700">{report.currentUrlOrView}</strong>
                        </span>
                      )}
                      {report.deviceInfo && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="truncate max-w-xs" title={report.deviceInfo}>
                            Device: <span className="font-mono text-slate-600">{report.deviceInfo}</span>
                          </span>
                        </>
                      )}
                      {report.resolvedAt && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-emerald-700 font-semibold">
                            Resolved on {new Date(report.resolvedAt).toLocaleDateString()}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Administrative Notes Display & Editor */}
                    <div className="pt-2 border-t border-slate-100">
                      {isNotesEditing ? (
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-800 block">
                            Internal Administrative Notes / Resolution Log:
                          </label>
                          <textarea
                            rows={2}
                            value={noteDraft}
                            onChange={e => setNoteDraft(e.target.value)}
                            placeholder="Add action taken, research findings, or response notes..."
                            className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                          />
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleSaveNote(report.id)}
                              className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
                            >
                              Save Note
                            </button>
                            <button
                              onClick={() => setEditingNotesId(null)}
                              className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-200 transition-colors cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between gap-3 text-xs">
                          <div>
                            <span className="font-bold text-slate-700 mr-1.5">Admin Note:</span>
                            {report.adminNotes ? (
                              <span className="text-slate-600 font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded">
                                {report.adminNotes}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic">No administrative note logged yet.</span>
                            )}
                          </div>
                          <button
                            onClick={() => {
                              setEditingNotesId(report.id);
                              setNoteDraft(report.adminNotes || '');
                            }}
                            className="text-orange-600 hover:text-orange-800 font-semibold text-xs flex items-center gap-1 cursor-pointer shrink-0"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>{report.adminNotes ? 'Edit Note' : '+ Add Note'}</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* CONNECT WITH PROVIDER ACTION BAR (USER REQUIREMENT) */}
                    <div className="p-3.5 rounded-xl bg-gradient-to-r from-slate-50 via-white to-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* Provider Details */}
                      <div className="flex items-center gap-3 min-w-0">
                        {report.userAvatar ? (
                          <img
                            src={report.userAvatar}
                            alt={report.userName}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center shrink-0">
                            {report.userName.charAt(0)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-bold text-slate-900 truncate">{report.userName}</span>
                            {report.isRegisteredUser ? (
                              <span className="text-[10px] font-bold px-1.5 py-0.2 bg-teal-100 text-teal-900 rounded-full flex items-center gap-1">
                                <UserCheck className="w-2.5 h-2.5" />
                                <span>Registered Member ({report.userId || 'account'})</span>
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded-full">
                                Guest / Unregistered
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500">
                            <span className="font-mono truncate">{report.userEmail}</span>
                            <button
                              onClick={() => handleCopyEmail(report.id, report.userEmail)}
                              className="text-slate-400 hover:text-slate-700 transition-colors"
                              title="Copy Email Address"
                            >
                              {copiedEmailId === report.id ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Connect Buttons (Conditional per Registered vs Unregistered) */}
                      <div className="flex items-center gap-2 shrink-0">
                        {report.isRegisteredUser ? (
                          /* Registered Expat: Connect via Direct Message */
                          <button
                            onClick={() => handleConnectViaDirectMessage(report)}
                            className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
                            title="Open In-App Direct Message Thread with this registered member"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>Connect via Direct Message</span>
                            <ArrowRight className="w-3 h-3 opacity-80" />
                          </button>
                        ) : (
                          /* Unregistered / Guest: Connect via Email */
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleOpenEmailModal(report)}
                              className="px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
                              title="Prepare formal email response with ticket reference"
                            >
                              <Mail className="w-3.5 h-3.5" />
                              <span>Reply by Email</span>
                            </button>
                            <button
                              onClick={() => handleLaunchMailto(report)}
                              className="p-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                              title="Open in your default Mail app (mailto:)"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Email Response Composer Modal (For Unregistered Guests) */}
      {emailModalReport && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          onClick={() => setEmailModalReport(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Mail className="w-5 h-5 text-orange-400" />
                <div>
                  <h4 className="text-sm font-bold text-white">Email Response to {emailModalReport.userName}</h4>
                  <p className="text-[11px] text-slate-400 font-mono">Ticket #{emailModalReport.id}</p>
                </div>
              </div>
              <button
                onClick={() => setEmailModalReport(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 bg-slate-50/50">
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-500">Recipient Email:</span>
                  <div className="flex items-center gap-1.5">
                    <strong className="font-mono text-slate-800">{emailModalReport.userEmail}</strong>
                    <button
                      onClick={() => handleCopyEmail(emailModalReport.id, emailModalReport.userEmail)}
                      className="p-1 hover:bg-slate-200 rounded text-slate-500"
                      title="Copy email"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-500">Subject:</span>
                  <span className="text-slate-800 font-medium">
                    Re: Your ReFIREly {emailModalReport.type === 'bug' ? 'Bug Report' : 'Feedback'} (#{emailModalReport.id})
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 block">Message Body Draft:</label>
                <textarea
                  rows={8}
                  value={customEmailReplyBody}
                  onChange={e => setCustomEmailReplyBody(e.target.value)}
                  className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white font-mono leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(customEmailReplyBody);
                    showNotice('Email body text copied to clipboard!');
                  }}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Text</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEmailModalReport(null)}
                    className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleLaunchMailto(emailModalReport, customEmailReplyBody);
                      // Auto-update status to in_progress or under_review
                      if (emailModalReport.status === 'new') {
                        handleStatusChange(emailModalReport.id, 'under_review');
                      }
                      setEmailModalReport(null);
                    }}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Launch in Mail Client</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
