import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  X, Database, Cloud, Globe, CheckCircle2, AlertCircle, RefreshCw,
  ExternalLink, ShieldCheck, UserPlus, Copy, Check, Server, Key,
  Trash2, LogIn, Sparkles, Terminal
} from 'lucide-react';

export const FirebaseConnectionModal: React.FC = () => {
  const {
    isFirebaseModalOpen,
    setIsFirebaseModalOpen,
    firebaseUser,
    isFirebaseSyncing,
    lastCloudSyncTime,
    loginWithGoogle,
    syncAllAccountsToCloud,
    resetCloudAndLocalState,
    testFirestoreConnection,
    registeredAccounts,
    currentUserId,
    switchAccount,
    deleteUserAccount,
    openAuthModal,
    journalEntries,
    threads,
    meetups,
    dmThreads,
    checklist,
    isOwnerAdmin,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'database' | 'accounts' | 'hosting'>('database');
  const [pingResult, setPingResult] = useState<{
    connected: boolean;
    latencyMs: number;
    message: string;
  } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [syncBanner, setSyncBanner] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    if (isFirebaseModalOpen && isOwnerAdmin) {
      handleTestConnection();
    }
  }, [isFirebaseModalOpen, isOwnerAdmin, firebaseUser]);

  if (!isFirebaseModalOpen || !isOwnerAdmin) return null;

  const handleTestConnection = async () => {
    setIsTesting(true);
    try {
      const res = await testFirestoreConnection();
      setPingResult(res);
    } finally {
      setIsTesting(false);
    }
  };

  const handleConnectGoogleAndSync = async () => {
    setSyncBanner(null);
    const loginRes = await loginWithGoogle();
    if (!loginRes.success) {
      setSyncBanner({
        type: 'error',
        text: loginRes.error || 'Google authentication was cancelled or blocked by popup settings.',
      });
      return;
    }
    const syncRes = await syncAllAccountsToCloud();
    if (syncRes.success) {
      setSyncBanner({
        type: 'success',
        text: `Connected to Firebase & saved ${syncRes.syncedCount} User IDs, ${Object.keys(journalEntries).length} journal entries, and community data to Firestore!`,
      });
      handleTestConnection();
    } else {
      setSyncBanner({
        type: 'error',
        text: syncRes.error || 'Connected, but encountered an issue syncing accounts.',
      });
    }
  };

  const handleManualSyncAll = async () => {
    setSyncBanner(null);
    const syncRes = await syncAllAccountsToCloud();
    if (syncRes.success) {
      setSyncBanner({
        type: 'success',
        text: `Saved all ${syncRes.syncedCount} User IDs, ${Object.keys(journalEntries).length} Country Journal notes, ${checklist.length} checklist tasks, and community data to Firestore!`,
      });
      handleTestConnection();
    } else {
      setSyncBanner({
        type: 'error',
        text: syncRes.error || 'Could not sync accounts. Ensure you are signed in with Google Auth.',
      });
    }
  };

  const handleResetAndReseed = async () => {
    setSyncBanner(null);
    const res = await resetCloudAndLocalState();
    setSyncBanner({
      type: res.success ? 'success' : 'error',
      text: res.message,
    });
    handleTestConnection();
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const firestoreConsoleUrl = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/firestore/databases/${firebaseConfig.firestoreDatabaseId}/data`;
  const authUsersConsoleUrl = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/users`;
  const authSettingsConsoleUrl = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/settings`;
  const hostingConsoleUrl = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/hosting/sites`;
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://ais-pre-42tzfbkwrce22dibqje3r2-165057540295.asia-southeast1.run.app';
  const sharedAppUrl = currentOrigin.includes('ais-dev-')
    ? currentOrigin.replace('ais-dev-', 'ais-pre-')
    : 'https://ais-pre-42tzfbkwrce22dibqje3r2-165057540295.asia-southeast1.run.app';
  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : 'ais-pre-42tzfbkwrce22dibqje3r2-165057540295.asia-southeast1.run.app';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-indigo-200/80 overflow-hidden my-8"
      >
        {/* Top Multi-Color Accent Bar */}
        <div className="h-2 bg-gradient-to-r from-teal-400 via-indigo-500 to-amber-500" />

        {/* Modal Header */}
        <div className="p-6 border-b border-indigo-100/80 flex items-start justify-between gap-4 bg-gradient-to-r from-teal-50/70 via-indigo-50/50 to-amber-50/60">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-teal-500 via-indigo-600 to-amber-500 text-white flex items-center justify-center shadow-xs shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-extrabold text-slate-900">
                  Firebase Cloud Database &amp; Hosting Center
                </h2>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                    firebaseUser
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}
                >
                  {firebaseUser ? 'Cloud Sync Active' : 'Local Session · Link Cloud'}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Project <strong className="font-mono text-indigo-800">{firebaseConfig.projectId}</strong> · Persistent User ID Vault &amp; Hosting Configuration
              </p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.08, rotate: 90 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setIsFirebaseModalOpen(false)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 pt-3 bg-slate-50/70 border-b border-slate-200 flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('database')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'database'
                ? 'border-orange-600 text-orange-950 bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Cloud className="w-3.5 h-3.5 text-orange-600" />
            <span>1. Database Connection & Sync</span>
          </button>

          <button
            onClick={() => setActiveTab('accounts')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'accounts'
                ? 'border-purple-600 text-purple-950 bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5 text-purple-600" />
            <span>2. Saved User IDs ({registeredAccounts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('hosting')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'hosting'
                ? 'border-orange-600 text-orange-950 bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-orange-600" />
            <span>3. Hosting & Domain Setup</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 max-h-[72vh] overflow-y-auto space-y-5 text-xs">
          {syncBanner && (
            <div
              className={`p-3.5 rounded-xl border flex items-start gap-2.5 ${
                syncBanner.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {syncBanner.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 font-medium">{syncBanner.text}</div>
            </div>
          )}

          {/* TAB 1: DATABASE CONNECTION & SYNC */}
          {activeTab === 'database' && (
            <div className="space-y-5">
              {/* Auto-provisioned collections overview */}
              <div className="p-4 rounded-xl bg-orange-50/70 border border-orange-200 space-y-2.5">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 text-orange-950 font-bold text-xs">
                    <Sparkles className="w-4 h-4 text-orange-600 shrink-0" />
                    <span>6 Root-Level Firestore Collections + All {registeredAccounts.length} User IDs in <code className="font-mono">/users</code></span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-orange-800 border border-orange-200">
                    Visible in Root Console Panel
                  </span>
                </div>
                <p className="text-slate-700 leading-relaxed">
                  Click <strong>Sync All ({registeredAccounts.length}) User IDs</strong> below (or sign in with Google) to populate all <strong>6 top-level collections</strong> in the left-most column of your Firebase Console, with all User IDs (<code className="font-mono text-orange-900">usr-ganesh</code>, <code className="font-mono text-orange-900">usr-elena</code>, <code className="font-mono text-orange-900">usr-marcus</code>, etc.) listed side-by-side inside <code className="font-mono font-bold">/users</code> and <code className="font-mono font-bold">/savedAccounts</code>:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  <div className="p-2.5 rounded-lg bg-white border border-orange-200/80 flex items-center justify-between">
                    <div>
                      <code className="font-mono font-bold text-slate-900 text-[11px]">/users</code>
                      <span className="block text-[10px] text-slate-500">All {registeredAccounts.length} User IDs side-by-side</span>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-orange-200/80 flex items-center justify-between">
                    <div>
                      <code className="font-mono font-bold text-slate-900 text-[11px]">/savedAccounts</code>
                      <span className="block text-[10px] text-slate-500">{registeredAccounts.length} Full Expat Profiles &amp; Finances</span>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-orange-200/80 flex items-center justify-between">
                    <div>
                      <code className="font-mono font-bold text-slate-900 text-[11px]">/countryJournals</code>
                      <span className="block text-[10px] text-slate-500">{Object.keys(journalEntries).length} Country Dossier Notes</span>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-orange-200/80 flex items-center justify-between">
                    <div>
                      <code className="font-mono font-bold text-slate-900 text-[11px]">/communityThreads</code>
                      <span className="block text-[10px] text-slate-500">{threads.length} Forum Discussions</span>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-orange-200/80 flex items-center justify-between">
                    <div>
                      <code className="font-mono font-bold text-slate-900 text-[11px]">/expatMeetups</code>
                      <span className="block text-[10px] text-slate-500">{meetups.length} Expat Meetup Events</span>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-orange-200/80 flex items-center justify-between">
                    <div>
                      <code className="font-mono font-bold text-slate-900 text-[11px]">/relocationChecklists</code>
                      <span className="block text-[10px] text-slate-500">{checklist.length} Readiness Tasks / User</span>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  </div>
                </div>
              </div>

              {/* Live Connection Status Card */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700">
                      Live Cloud Telemetry
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                      Firebase Project & Firestore Database Status
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleTestConnection}
                      disabled={isTesting}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin text-orange-600' : ''}`} />
                      <span>{isTesting ? 'Pinging...' : 'Test Connection'}</span>
                    </button>

                    <button
                      onClick={handleResetAndReseed}
                      disabled={isFirebaseSyncing}
                      className="px-3 py-1.5 rounded-lg border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-900 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Reset and re-seed database & local state to clean defaults"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isFirebaseSyncing ? 'animate-spin text-amber-600' : 'text-amber-700'}`} />
                      <span>Reset &amp; Re-Seed DB</span>
                    </button>

                    {firebaseUser ? (
                      <button
                        onClick={handleManualSyncAll}
                        disabled={isFirebaseSyncing}
                        className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-orange-600 to-purple-600 hover:from-orange-700 hover:to-purple-700 text-white font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                      >
                        <Cloud className="w-3.5 h-3.5" />
                        <span>{isFirebaseSyncing ? 'Syncing...' : `Sync All (${registeredAccounts.length}) User IDs`}</span>
                      </button>
                    ) : (
                      <button
                        onClick={handleConnectGoogleAndSync}
                        disabled={isFirebaseSyncing}
                        className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-orange-600 to-purple-600 hover:from-orange-700 hover:to-purple-700 text-white font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>{isFirebaseSyncing ? 'Connecting...' : 'Connect Google Auth & Sync to Cloud'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Connection Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Firebase Project ID
                    </span>
                    <div className="flex items-center justify-between mt-1">
                      <span className="font-mono font-bold text-slate-900 text-xs">{firebaseConfig.projectId}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                        Provisioned
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Auth Domain
                    </span>
                    <div className="flex items-center justify-between mt-1">
                      <span className="font-mono font-semibold text-slate-800 text-xs truncate">
                        {firebaseConfig.authDomain}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 sm:col-span-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Firestore Database Instance ID
                    </span>
                    <div className="flex items-center justify-between gap-2 mt-1">
                      <code className="font-mono text-[11px] text-orange-900 font-semibold break-all">
                        {firebaseConfig.firestoreDatabaseId}
                      </code>
                      <button
                        onClick={() => copyToClipboard(firebaseConfig.firestoreDatabaseId, 'dbId')}
                        className="px-2 py-1 rounded bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shrink-0 flex items-center gap-1"
                      >
                        {copiedKey === 'dbId' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span className="text-[10px]">{copiedKey === 'dbId' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Firebase Auth Session
                    </span>
                    <div className="mt-1">
                      {firebaseUser ? (
                        <div>
                          <span className="font-bold text-emerald-700 block truncate">
                            {firebaseUser.email || firebaseUser.displayName}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">
                            UID: {firebaseUser.uid.slice(0, 16)}...
                          </span>
                        </div>
                      ) : (
                        <span className="text-amber-800 font-semibold">
                          Not signed in with Google yet (Local storage active)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Active App User ID
                    </span>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="font-mono font-bold text-purple-900">{currentUserId}</span>
                      {lastCloudSyncTime && (
                        <span className="text-[10px] text-slate-500">
                          Synced {new Date(lastCloudSyncTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Ping result bar */}
                {pingResult && (
                  <div
                    className={`p-3 rounded-lg border flex items-center justify-between gap-2 ${
                      pingResult.connected
                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                        : 'bg-rose-50 border-rose-200 text-rose-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{pingResult.message}</span>
                    </div>
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-white border border-emerald-200">
                      {pingResult.latencyMs} ms
                    </span>
                  </div>
                )}

                {/* Direct Links to Firebase Console */}
                <div className="pt-2 flex flex-wrap items-center gap-2.5">
                  <a
                    href={firestoreConsoleUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-900 border border-orange-200 font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Database className="w-3.5 h-3.5 text-orange-600" />
                    <span>Open Firestore Database in Console</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <a
                    href={authUsersConsoleUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Key className="w-3.5 h-3.5 text-purple-600" />
                    <span>Open Firebase Auth Users</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SAVED USER IDS */}
          {activeTab === 'accounts' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Your Registered User IDs & Expat Profiles ({registeredAccounts.length})
                  </h3>
                  <p className="text-slate-500 text-xs">
                    You can log in with any User ID or Email below. When Google Auth is connected, all User IDs sync to <code className="font-mono text-orange-800">/users/&#123;uid&#125;/savedAccounts</code>.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setIsFirebaseModalOpen(false);
                      openAuthModal('signup');
                    }}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-purple-600 text-white font-bold flex items-center gap-1.5 shadow-xs hover:from-orange-600 hover:to-purple-700 transition-all cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Create New User ID</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2.5">
                {registeredAccounts.map(acc => {
                  const isActive = acc.id === currentUserId;
                  return (
                    <div
                      key={acc.id}
                      className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isActive
                          ? 'bg-orange-50/60 border-orange-300 ring-1 ring-orange-300'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={acc.profile.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80'}
                          alt={acc.name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-900 text-xs">{acc.name}</span>
                            <code className="px-2 py-0.5 rounded bg-purple-50 text-purple-900 border border-purple-200 font-mono text-[11px] font-bold">
                              ID: {acc.id}
                            </code>
                            {isActive && (
                              <span className="px-2 py-0.5 rounded-full bg-orange-600 text-white text-[10px] font-bold">
                                Active Now
                              </span>
                            )}
                            {acc.cloudSynced || firebaseUser ? (
                              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-semibold">
                                Cloud Synced
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-medium">
                                Local Saved
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                            Email: <strong className="text-slate-700">{acc.email}</strong> · Target: <strong className="text-orange-800">{acc.profile.targetCountry}</strong> · Budget: ${acc.profile.monthlyBudgetUSD}/mo
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {!isActive && (
                          <button
                            onClick={() => switchAccount(acc.id)}
                            className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs transition-colors cursor-pointer"
                          >
                            Switch to User ID
                          </button>
                        )}
                        {registeredAccounts.length > 1 && (
                          <button
                            onClick={() => deleteUserAccount(acc.id)}
                            title="Delete this User ID"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: HOSTING & DOMAIN SETUP */}
          {activeTab === 'hosting' && (
            <div className="space-y-5">
              {/* Live Working Website URLs Card */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50/90 via-teal-50/50 to-white border border-emerald-200 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <h3 className="text-sm font-bold text-slate-900">
                      Your Live Hosted Website URLs (Active Now)
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                    Online · Port 3000 Cloud Run
                  </span>
                </div>

                <p className="text-slate-600 leading-relaxed">
                  Your application is hosted and running live on Google Cloud Run via AI Studio. Use these working URLs to access and share your website:
                </p>

                 <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-white border border-emerald-200">
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                        Public Shared Website URL
                      </span>
                      <a
                        href={sharedAppUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-xs text-orange-700 hover:underline font-bold truncate block"
                      >
                        {sharedAppUrl}
                      </a>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() =>
                          copyToClipboard(
                            sharedAppUrl,
                            'sharedUrl'
                          )
                        }
                        className="px-2.5 py-1.5 rounded bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === 'sharedUrl' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedKey === 'sharedUrl' ? 'Copied' : 'Copy URL'}</span>
                      </button>
                      <a
                        href={sharedAppUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1"
                      >
                        <span>Open</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-amber-50/80 border border-amber-200 text-[11px] text-amber-900">
                  <strong>Why does <code className="font-mono">{firebaseConfig.projectId}.web.app</code> / <code className="font-mono">{firebaseConfig.authDomain}</code> say &ldquo;Site Not Found&rdquo; until deployed?</strong>
                  <p className="mt-0.5 text-slate-700">
                    Firebase creates <code className="font-mono">{firebaseConfig.authDomain}</code> automatically as an authentication handler domain for Google Sign-In, but it does not host your web pages until you run <code className="font-mono">firebase deploy --only hosting</code> from your computer or click <strong>Publish / Deploy</strong> in the top-right bar of AI Studio. Use the <strong>Public Shared Website URL</strong> above for immediate access!
                  </p>
                </div>
              </div>

              {/* Step 1: Authorize Hosting Domain for Google Auth */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-800 font-bold flex items-center justify-center text-xs">
                      1
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">
                      Authorize Your Hosted Domain in Firebase Authentication
                    </h3>
                  </div>
                  <a
                    href={authSettingsConsoleUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-700 hover:text-orange-900 font-bold flex items-center gap-1"
                  >
                    <span>Open Auth Settings</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  When opening the app via the Shared App URL, add this domain under <strong>Firebase Console → Authentication → Settings → Authorized domains</strong> so Google Sign-In popups are permitted:
                </p>
                <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <code className="font-mono text-xs text-slate-800 font-semibold truncate">
                    {currentHostname}
                  </code>
                  <button
                    onClick={() => copyToClipboard(currentHostname, 'domain')}
                    className="px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    {copiedKey === 'domain' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'domain' ? 'Copied Domain' : 'Copy Domain'}</span>
                  </button>
                </div>
              </div>

              {/* Step 2: Optional Deploy to Firebase Hosting (refirely.web.app) */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-800 font-bold flex items-center justify-center text-xs">
                      2
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">
                      Optional: Publish Static Build to Firebase Hosting
                    </h3>
                  </div>
                  <a
                    href={hostingConsoleUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-700 hover:text-purple-900 font-bold flex items-center gap-1"
                  >
                    <span>Open Hosting Console</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  If you also want <code className="font-mono text-purple-800">https://{firebaseConfig.projectId}.web.app</code> to serve this app, download/export the project zip from AI Studio and run these commands in the project folder on your computer:
                </p>
                <div className="p-3 rounded-xl bg-slate-900 text-slate-100 font-mono text-[11px] space-y-1 relative">
                  <div className="flex items-center justify-between text-slate-400 text-[10px] pb-1 border-b border-slate-800">
                    <span className="flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-orange-400" />
                      <span>Local Terminal Commands (After Downloading Project)</span>
                    </span>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          'npm install && npm run build && npx firebase-tools login && npx firebase-tools deploy --only hosting',
                          'cli'
                        )
                      }
                      className="text-orange-300 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'cli' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'cli' ? 'Copied' : 'Copy Commands'}</span>
                    </button>
                  </div>
                  <p className="pt-1 text-emerald-400"># Build production bundle & deploy to Firebase Hosting</p>
                  <p>npm install && npm run build</p>
                  <p>npx firebase-tools login && npx firebase-tools deploy --only hosting</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Server className="w-4 h-4 text-orange-600" />
            <span>
              Database: <strong className="text-slate-900 font-mono">{firebaseConfig.projectId}</strong> (Firestore Enterprise)
            </span>
          </div>
          <button
            onClick={() => setIsFirebaseModalOpen(false)}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
