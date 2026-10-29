import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Country, UserProfile, CommunityThread, ExpatMeetup, DirectMessageThread, 
  RelocationChecklistTask, Region, ClimateCategory, VisitedCountry, KnownLanguage, 
  UserAccount, CountryJournalEntry, InterestLevel, UserFinancialPortfolio, SortByType,
  InAppMessageNotification, FeedbackReport, FeedbackType, FeedbackStatus, FeedbackPriority,
  FireNumbersRating, DossierDownloadRecord
} from '../types';
import { INITIAL_COUNTRIES } from '../data/countries';
import { getCountryTravelLeisureScore } from '../data/countryTravelMobility';
import { INITIAL_THREADS, INITIAL_MEETUPS, INITIAL_DM_THREADS, INITIAL_CHECKLIST } from '../data/community';
import { DEFAULT_ACCOUNTS, DEFAULT_FINANCIAL_PORTFOLIO, GUEST_PROFILE, isPublicMemberAccount } from '../data/userAccounts';
import { INITIAL_JOURNAL_ENTRIES } from '../data/initialJournal';
import { INITIAL_FEEDBACK_REPORTS } from '../data/seedFeedback';
import { INITIAL_DOSSIER_DOWNLOADS } from '../data/seedDossierDownloads';
import { playNotificationChime } from '../utils/audioNotification';
import { parseUrlToRoute, getViewUrl } from '../utils/seo';
import { matchesContinentFilter } from '../utils/continents';
import { trackAnalyticsEvent } from '../utils/analytics';
import {
  loadUserDmThreads,
  saveUserDmThreads,
  dispatchMessageToRecipient,
  popPendingNotificationForUser,
  sortDmThreadsByLatest
} from '../utils/messagingMultiUser';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../firebase';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, getDocFromServer, setDoc, updateDoc, getDocs, deleteDoc, collection } from 'firebase/firestore';

export type AppView = 
  | 'landing'
  | 'explore' 
  | 'country-detail' 
  | 'compare' 
  | 'community' 
  | 'meetups' 
  | 'messages' 
  | 'dashboard' 
  | 'admin';

interface AppContextType {
  // Navigation & View
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  activeCountryId: string;
  setActiveCountryId: (id: string) => void;
  navigateToCountry: (id: string) => void;

  // Data & Countries
  countries: Country[];
  selectedCountry: Country | undefined;
  updateCountry: (country: Country) => void;
  addCountry: (country: Country) => void;
  deleteCountry: (id: string) => void;

  // Authentication & Registered Accounts
  isAuthenticated: boolean;
  currentUserId: string;
  registeredAccounts: UserAccount[];
  login: (identifier: string, password?: string) => { success: boolean; error?: string };
  signup: (data: {
    customUserId?: string;
    name: string;
    email: string;
    password?: string;
    originCountry?: string;
    residingCountry?: string;
    originCity?: string;
    targetCountry?: string;
    retirementTimelineYear?: number;
    monthlyBudgetUSD?: number;
    preferredClimate?: ClimateCategory | 'Any';
    relocationStatus?: 'Exploring Options' | 'Scouting In-Person' | 'Visa In-Progress' | 'Relocated & Settled' | 'Early Retired (FIRE)';
    occupationOrBackground?: string;
    bio?: string;
    aboutMe?: string;
    avatarUrl?: string;
    interests?: string[];
    languagesKnown?: KnownLanguage[];
    travelHistory?: VisitedCountry[];
  }) => { success: boolean; error?: string; createdUserId?: string };
  logout: () => void;
  switchAccount: (userId: string) => void;
  deleteUserAccount: (userId: string) => Promise<{ success: boolean; error?: string }>;
  deleteAllTestAccounts: () => Promise<{ success: boolean; deletedCount: number }>;
  adminUpdateUserAccount: (updatedAccount: UserAccount) => Promise<void>;
  refreshRegisteredUsersFromCloud: () => Promise<{ success: boolean; count: number; error?: string }>;

  // Modals for Auth, Profile & Firebase Cloud Connection
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalTab: 'login' | 'signup';
  setAuthModalTab: (tab: 'login' | 'signup') => void;
  openAuthModal: (tab?: 'login' | 'signup') => void;

  isFirebaseModalOpen: boolean;
  setIsFirebaseModalOpen: (open: boolean) => void;
  openFirebaseModal: () => void;

  isEditProfileOpen: boolean;
  setIsEditProfileOpen: (open: boolean) => void;
  editProfileInitialTab: 'about' | 'picture' | 'finances' | 'travel' | 'languages' | 'interests';
  setEditProfileInitialTab: (tab: 'about' | 'picture' | 'finances' | 'travel' | 'languages' | 'interests') => void;
  openEditProfile: (tab?: 'about' | 'picture' | 'finances' | 'travel' | 'languages' | 'interests') => void;

  // Public Member Profiles (Strictly Non-Admin Registered Users)
  publicMemberAccounts: UserAccount[];
  selectedPublicProfileId: string | null;
  openPublicProfile: (identifier: string) => boolean;
  closePublicProfile: () => void;

  // Role & User
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  isOwnerAdmin: boolean;
  toggleRole: () => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  updateFinances: (finances: Partial<UserFinancialPortfolio>) => void;

  // Travel History, Languages, Interests actions
  addVisitedCountry: (entry: Omit<VisitedCountry, 'id'>) => void;
  updateVisitedCountry: (id: string, entry: Partial<VisitedCountry>) => void;
  removeVisitedCountry: (id: string) => void;

  addLanguage: (entry: Omit<KnownLanguage, 'id'>) => void;
  removeLanguage: (id: string) => void;

  toggleInterest: (interest: string) => void;

  // Filters
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedRegion: string;
  setSelectedRegion: (region: string) => void;
  budgetMax: number;
  setBudgetMax: (budget: number) => void;
  selectedClimate: string;
  setSelectedClimate: (climate: string) => void;
  visaDifficultyMax: number;
  setVisaDifficultyMax: (difficulty: number) => void;
  visaIncomeMax: number;
  setVisaIncomeMax: (income: number) => void;
  discreetLifestyleEnabled: boolean;
  setDiscreetLifestyleEnabled: (enabled: boolean) => void;
  sortBy: SortByType;
  setSortBy: (sort: SortByType) => void;
  resetFilters: () => void;
  filteredCountries: Country[];

  // Saved / Compare / Ignore
  savedCountryIds: string[];
  toggleSaveCountry: (id: string) => void;
  isCountrySaved: (id: string) => boolean;
  ignoredCountryIds: string[];
  toggleIgnoreCountry: (id: string) => void;
  isCountryIgnored: (id: string) => boolean;
  restoreCountry: (id: string) => void;
  comparedCountryIds: string[];
  toggleCompareCountry: (id: string) => void;
  replaceCompareCountry: (oldId: string, newId: string) => void;
  isCountryCompared: (id: string) => boolean;
  clearComparedCountries: () => void;

  // Relocation Checklist
  checklist: RelocationChecklistTask[];
  toggleChecklistTask: (id: string) => void;
  addChecklistTask: (task: Omit<RelocationChecklistTask, 'id' | 'completed'>) => void;

  // Community & Social
  threads: CommunityThread[];
  addThread: (thread: Omit<CommunityThread, 'id' | 'createdAt' | 'upvotes' | 'comments'>) => void;
  addComment: (threadId: string, text: string) => void;
  toggleUpvoteThread: (threadId: string) => void;
  deleteThread: (threadId: string) => void;
  togglePinThread: (threadId: string) => void;

  // Meetups
  meetups: ExpatMeetup[];
  toggleRsvpMeetup: (meetupId: string) => void;
  addMeetup: (meetup: Omit<ExpatMeetup, 'id' | 'attendeesCount' | 'isRsvped'>) => void;
  deleteMeetup: (meetupId: string) => void;

  // Direct Messages & Notification Mechanism
  dmThreads: DirectMessageThread[];
  activeDmThreadId: string | null;
  setActiveDmThreadId: (id: string | null) => void;
  sendMessage: (threadId: string, text: string) => void;
  startDmWithPeer: (
    peerName: string,
    peerCountry: string,
    peerCity: string,
    initialNote?: string,
    peerOptions?: {
      peerAvatar?: string;
      peerStatus?: string;
      peerUserId?: string;
      stayOnCurrentView?: boolean;
    }
  ) => string;
  totalUnreadDms: number;
  markThreadAsRead: (threadId: string) => void;
  markAllThreadsAsRead: () => void;
  incomingNotification: InAppMessageNotification | null;
  dismissNotification: () => void;
  enablePeerAutoReplies: boolean;
  setEnablePeerAutoReplies: (enabled: boolean) => void;
  notificationSoundEnabled: boolean;
  setNotificationSoundEnabled: (enabled: boolean) => void;
  openChatThread: (threadId: string) => void;
  simulateIncomingPeerMessage: (threadId?: string, customText?: string) => void;

  // Country Journal & Interest Level Tracking
  journalEntries: Record<string, CountryJournalEntry>;
  getJournalEntry: (countryId: string) => CountryJournalEntry | undefined;
  saveJournalEntry: (entry: {
    countryId: string;
    countryName: string;
    countryFlag: string;
    interestLevel: InterestLevel;
    privateNotes: string;
    tags?: string[];
    scoutingTimeline?: string;
    personalBudgetEstimateUSD?: number;
    visitedBefore?: boolean;
    isFavorited?: boolean;
  }) => Promise<{ success: boolean; error?: string }>;
  deleteJournalEntry: (countryId: string) => Promise<{ success: boolean; error?: string }>;

  // Feedback & Bug Reports
  feedbackReports: FeedbackReport[];
  submitFeedbackReport: (
    data: Omit<FeedbackReport, 'id' | 'createdAt' | 'status'>
  ) => Promise<{ success: boolean; id?: string; error?: string }>;
  updateFeedbackStatus: (
    id: string,
    status: FeedbackStatus,
    adminNotes?: string,
    priority?: FeedbackPriority
  ) => Promise<{ success: boolean; error?: string }>;
  deleteFeedbackReport: (id: string) => Promise<{ success: boolean; error?: string }>;
  deleteAllTestFeedbacks: () => Promise<{ success: boolean; deletedCount: number }>;
  isFeedbackModalOpen: boolean;
  setIsFeedbackModalOpen: (open: boolean) => void;
  feedbackInitialType: FeedbackType;
  openFeedbackModal: (initialType?: FeedbackType) => void;
  closeFeedbackModal: () => void;

  // Dossier Downloads Tracking & Analytics
  dossierDownloads: DossierDownloadRecord[];
  trackDossierDownload: (countryId: string, countryName: string, exportFormat?: string) => void;
  clearAllDossierDownloads: () => void;

  // Firebase Auth & Cloud Sync
  firebaseUser: FirebaseUser | null;
  isFirebaseConnected: boolean;
  isFirebaseSyncing: boolean;
  lastCloudSyncTime: string | null;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  syncAllAccountsToCloud: () => Promise<{ success: boolean; syncedCount: number; error?: string }>;
  resetCloudAndLocalState: () => Promise<{ success: boolean; message: string }>;
  testFirestoreConnection: () => Promise<{ connected: boolean; latencyMs: number; message: string }>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'refirely_app_state_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial state with local storage fallback, ensuring newly added INITIAL_COUNTRIES are always included
  const [countries, setCountries] = useState<Country[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_countries`) || localStorage.getItem('havenroute_app_state_v1_countries');
      if (saved) {
        const parsed: Country[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const savedMap = new Map(parsed.map(c => [c.id, c]));
          const merged = INITIAL_COUNTRIES.map(initCountry => {
            const savedC = savedMap.get(initCountry.id);
            if (!savedC) return initCountry;
            return {
              ...initCountry,
              ...savedC,
              demographics: {
                ...initCountry.demographics,
                ...savedC.demographics,
                femalesPer100Males:
                  savedC.demographics?.femalesPer100Males ?? initCountry.demographics.femalesPer100Males,
              },
            };
          });
          const customAdded = parsed
            .filter(c => !INITIAL_COUNTRIES.some(initC => initC.id === c.id))
            .map(c => ({
              ...c,
              demographics: {
                ...c.demographics,
                femalesPer100Males: c.demographics?.femalesPer100Males ?? 100.0,
              },
            }));
          return [...customAdded, ...merged];
        }
      }
      return INITIAL_COUNTRIES;
    } catch {
      return INITIAL_COUNTRIES;
    }
  });

  const initialRoute = React.useMemo(() => parseUrlToRoute(countries), []);
  const [currentView, setCurrentView] = useState<AppView>(() => {
    try {
      const explicitAuth = localStorage.getItem(`${LOCAL_STORAGE_KEY}_explicit_auth_v2`);
      const savedUserId = localStorage.getItem(`${LOCAL_STORAGE_KEY}_current_user_id`);
      if (explicitAuth === 'true' && savedUserId === 'usr-ganesh') {
        return 'admin';
      }
    } catch {}
    return initialRoute.view;
  });
  const [activeCountryId, setActiveCountryId] = useState<string>(initialRoute.countryId || 'portugal');
  const isPopStateNavigationRef = React.useRef<boolean>(false);

  // Listen to browser Back / Forward buttons (popstate)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handlePopState = () => {
      isPopStateNavigationRef.current = true;
      const parsed = parseUrlToRoute(countries);
      if (parsed.countryId) {
        setActiveCountryId(parsed.countryId);
      }
      setCurrentView(parsed.view);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [countries]);

  // Synchronize URL address bar when currentView or activeCountryId changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isPopStateNavigationRef.current) {
      isPopStateNavigationRef.current = false;
      return;
    }
    const targetUrl = getViewUrl(currentView, currentView === 'country-detail' ? activeCountryId : undefined);
    const currentFull = window.location.pathname + window.location.search;
    if (currentFull !== targetUrl) {
      try {
        window.history.pushState({ view: currentView, countryId: activeCountryId }, '', targetUrl);
      } catch {
        // Ignore if history push is restricted in iframe
      }
    }
  }, [currentView, activeCountryId]);

  // Helper to sanitize custom User IDs to adhere to Firestore document ID rules ^[a-zA-Z0-9_\-]+$
  const sanitizeAccountId = (rawId: string): string => {
    const cleaned = rawId
      .trim()
      .replace(/[^a-zA-Z0-9_\-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 64);
    return cleaned || `usr-${Date.now()}`;
  };

  // Helper to detect preloaded sample Unsplash stock avatars so they never override a user's real Gmail photoURL
  const isSampleStockAvatar = (url?: string | null): boolean => {
    if (!url) return true;
    const clean = url.trim();
    if (!clean) return true;
    return clean.includes('images.unsplash.com');
  };

  // Persistent tombstone set of deleted user account IDs so deleted test personas NEVER reload
  const getDeletedUserAccountIds = (): Set<string> => {
    try {
      const raw = localStorage.getItem(`${LOCAL_STORAGE_KEY}_deleted_user_ids`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return new Set(parsed);
      }
    } catch {}
    return new Set();
  };

  const markUserAccountIdsDeleted = (ids: string[]) => {
    try {
      const current = getDeletedUserAccountIds();
      ids.forEach(id => {
        if (id && id !== 'usr-ganesh') {
          current.add(id);
        }
      });
      const arr = Array.from(current);
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_deleted_user_ids`, JSON.stringify(arr));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_accounts_seeded`, 'true');

      if (auth.currentUser) {
        const nowIso = new Date().toISOString();
        setDoc(doc(db, 'users', auth.currentUser.uid, 'workspace', 'deletedAccounts'), {
          id: 'deletedAccounts',
          userId: auth.currentUser.uid,
          deletedUserIds: arr,
          updatedAt: nowIso,
        }).catch(() => {});
      }
    } catch {}
  };

  // Registered accounts in local storage (guarantees deleted personas stay deleted and never resurrect)
  const [registeredAccounts, setRegisteredAccounts] = useState<UserAccount[]>(() => {
    const deletedUserIds = getDeletedUserAccountIds();
    const isAccountsSeeded = localStorage.getItem(`${LOCAL_STORAGE_KEY}_accounts_seeded`) === 'true';

    try {
      const savedGooglePhoto =
        localStorage.getItem(`${LOCAL_STORAGE_KEY}_google_photo_ganesh.indireddy@gmail.com`) ||
        localStorage.getItem(`${LOCAL_STORAGE_KEY}_google_photo_usr-ganesh`) ||
        '';
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_registered_accounts`);
      if (saved) {
        const parsed: UserAccount[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Strictly exclude any accounts marked deleted
          const nonDeleted = parsed.filter(acc => acc && acc.id && !deletedUserIds.has(acc.id));
          const repaired = nonDeleted.map(acc => {
            if (acc.id === 'usr-ganesh' || acc.email?.toLowerCase() === 'ganesh.indireddy@gmail.com') {
              const currentAvatar = acc.profile?.avatarUrl || '';
              const cleanedAvatar = isSampleStockAvatar(currentAvatar) ? savedGooglePhoto : currentAvatar;
              return {
                ...acc,
                profile: {
                  ...acc.profile,
                  avatarUrl: cleanedAvatar,
                  role: 'admin' as const,
                },
              };
            }
            return acc;
          });

          // Always ensure primary admin account usr-ganesh exists
          const hasGanesh = repaired.some(a => a.id === 'usr-ganesh' || a.email?.toLowerCase() === 'ganesh.indireddy@gmail.com');
          const finalAccounts = hasGanesh ? repaired : [DEFAULT_ACCOUNTS[0], ...repaired];

          // If accounts have already been seeded or modified, NEVER re-insert missing default test personas!
          if (isAccountsSeeded) {
            return finalAccounts;
          }

          // First run only: add any non-deleted defaults
          const existingIds = new Set(finalAccounts.map(a => a.id));
          const missingDefaults = DEFAULT_ACCOUNTS.filter(d => !existingIds.has(d.id) && !deletedUserIds.has(d.id));
          localStorage.setItem(`${LOCAL_STORAGE_KEY}_accounts_seeded`, 'true');
          return [...finalAccounts, ...missingDefaults];
        }
      }
    } catch {}

    // First time initial seed: filter out any tombstoned IDs and mark seeded
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_accounts_seeded`, 'true');
    return DEFAULT_ACCOUNTS.filter(d => !deletedUserIds.has(d.id));
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const explicitAuth = localStorage.getItem(`${LOCAL_STORAGE_KEY}_explicit_auth_v2`);
      return explicitAuth === 'true';
    } catch {}
    return false; // Always require explicit login with password or Google Auth
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    try {
      const explicitAuth = localStorage.getItem(`${LOCAL_STORAGE_KEY}_explicit_auth_v2`);
      if (explicitAuth !== 'true') return 'guest';
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_current_user_id`);
      if (saved) return saved;
    } catch {}
    return 'guest';
  });

  // Auth, Profile, and Firebase Cloud Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'signup'>('login');
  const openAuthModal = (tab: 'login' | 'signup' = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState(false);
  const openFirebaseModal = () => setIsFirebaseModalOpen(true);

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editProfileInitialTab, setEditProfileInitialTab] = useState<'about' | 'picture' | 'finances' | 'travel' | 'languages' | 'interests'>('about');
  const openEditProfile = (tab: 'about' | 'picture' | 'finances' | 'travel' | 'languages' | 'interests' = 'about') => {
    setEditProfileInitialTab(tab);
    setIsEditProfileOpen(true);
  };

  // Public Member Profile modal state (excludes admin role / admin user)
  const [selectedPublicProfileId, setSelectedPublicProfileId] = useState<string | null>(null);
  const publicMemberAccounts = React.useMemo(
    () => registeredAccounts.filter(acc => isPublicMemberAccount(acc)),
    [registeredAccounts]
  );

  const openPublicProfile = (identifier: string): boolean => {
    const clean = (identifier || '').trim().toLowerCase();
    if (!clean) return false;
    const matched = publicMemberAccounts.find(acc => {
      const idMatch = acc.id.toLowerCase() === clean;
      const usernameMatch = (acc.username || '').toLowerCase() === clean;
      const nameLower = (acc.profile.name || acc.name || '').toLowerCase();
      const nameMatch =
        nameLower === clean ||
        (clean.includes(nameLower.split(' ')[0]) && clean.includes(nameLower.split(' ').slice(-1)[0]));
      return idMatch || usernameMatch || nameMatch;
    });
    if (matched) {
      setSelectedPublicProfileId(matched.id);
      return true;
    }
    return false;
  };

  const closePublicProfile = () => setSelectedPublicProfileId(null);

  // Role and profile
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const explicitAuth = localStorage.getItem(`${LOCAL_STORAGE_KEY}_explicit_auth_v2`);
      if (explicitAuth !== 'true') {
        return GUEST_PROFILE;
      }
      const savedAdminGooglePhoto =
        localStorage.getItem(`${LOCAL_STORAGE_KEY}_google_photo_ganesh.indireddy@gmail.com`) ||
        localStorage.getItem(`${LOCAL_STORAGE_KEY}_google_photo_usr-ganesh`) ||
        '';

      // First check if the active User ID exists in registeredAccounts
      const savedAccountsRaw = localStorage.getItem(`${LOCAL_STORAGE_KEY}_registered_accounts`);
      const savedUserId = localStorage.getItem(`${LOCAL_STORAGE_KEY}_current_user_id`);
      if (savedAccountsRaw && savedUserId) {
        const parsedAccounts: UserAccount[] = JSON.parse(savedAccountsRaw);
        const matchedAcc = parsedAccounts.find(a => a.id === savedUserId);
        if (matchedAcc && matchedAcc.profile) {
          const isAdminAcc =
            matchedAcc.id === 'usr-ganesh' ||
            matchedAcc.email?.toLowerCase() === 'ganesh.indireddy@gmail.com' ||
            matchedAcc.profile.role === 'admin';
          const rawAvatar = matchedAcc.profile.avatarUrl || '';
          const cleanedAvatar =
            isAdminAcc && isSampleStockAvatar(rawAvatar) ? savedAdminGooglePhoto : rawAvatar;
          return {
            ...matchedAcc.profile,
            avatarUrl: cleanedAvatar,
            role: isAdminAcc ? 'admin' : matchedAcc.profile.role || 'member',
            finances: matchedAcc.profile.finances ? {
              ...DEFAULT_FINANCIAL_PORTFOLIO,
              ...matchedAcc.profile.finances,
              investments: {
                ...DEFAULT_FINANCIAL_PORTFOLIO.investments,
                ...(matchedAcc.profile.finances.investments || {}),
              },
            } : DEFAULT_FINANCIAL_PORTFOLIO,
          };
        }
      }
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_profile`) || localStorage.getItem('havenroute_app_state_v1_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        const isAdminProf =
          parsed.id === 'usr-ganesh' ||
          parsed.email?.toLowerCase() === 'ganesh.indireddy@gmail.com' ||
          parsed.role === 'admin';
        const rawAvatar = parsed.avatarUrl || '';
        const cleanedAvatar =
          isAdminProf && isSampleStockAvatar(rawAvatar) ? savedAdminGooglePhoto : rawAvatar;
        return {
          ...parsed,
          avatarUrl: cleanedAvatar,
          finances: parsed.finances ? {
            ...DEFAULT_FINANCIAL_PORTFOLIO,
            ...parsed.finances,
            investments: {
              ...DEFAULT_FINANCIAL_PORTFOLIO.investments,
              ...(parsed.finances.investments || {}),
            },
          } : DEFAULT_FINANCIAL_PORTFOLIO,
        };
      }
    } catch {}
    return GUEST_PROFILE;
  });

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [budgetMax, setBudgetMax] = useState(3500);
  const [selectedClimate, setSelectedClimate] = useState('All');
  const [visaDifficultyMax, setVisaDifficultyMax] = useState(5);
  const [visaIncomeMax, setVisaIncomeMax] = useState(3500);
  const [discreetLifestyleEnabled, setDiscreetLifestyleEnabled] = useState(true);
  const [sortBy, setSortBy] = useState<SortByType>('recommended');

  // Compared countries
  const [comparedCountryIds, setComparedCountryIds] = useState<string[]>(['portugal', 'spain']);

  // Checklist
  const [checklist, setChecklist] = useState<RelocationChecklistTask[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_checklist`) || localStorage.getItem('havenroute_app_state_v1_checklist');
      return saved ? JSON.parse(saved) : INITIAL_CHECKLIST;
    } catch {
      return INITIAL_CHECKLIST;
    }
  });

  // Helper to strip any Admin-authored threads or comments from public community state
  const sanitizePublicThreads = (list: CommunityThread[]): CommunityThread[] => {
    return list
      .filter(t => !(t.authorName || '').toLowerCase().includes('ganesh'))
      .map(t => ({
        ...t,
        comments: (t.comments || []).filter(c => !(c.authorName || '').toLowerCase().includes('ganesh')),
      }));
  };

  // Threads
  const [threads, setThreads] = useState<CommunityThread[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_threads`) || localStorage.getItem('havenroute_app_state_v1_threads');
      return saved ? sanitizePublicThreads(JSON.parse(saved)) : sanitizePublicThreads(INITIAL_THREADS);
    } catch {
      return sanitizePublicThreads(INITIAL_THREADS);
    }
  });

  // Meetups
  const [meetups, setMeetups] = useState<ExpatMeetup[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_meetups`) || localStorage.getItem('havenroute_app_state_v1_meetups');
      return saved ? JSON.parse(saved) : INITIAL_MEETUPS;
    } catch {
      return INITIAL_MEETUPS;
    }
  });

  // Direct Messages
  const [dmThreads, setDmThreads] = useState<DirectMessageThread[]>(() => {
    try {
      const explicitAuth = localStorage.getItem(`${LOCAL_STORAGE_KEY}_explicit_auth_v2`);
      const savedUserId = localStorage.getItem(`${LOCAL_STORAGE_KEY}_current_user_id`) || 'guest';
      if (explicitAuth === 'true' && savedUserId !== 'guest') {
        return loadUserDmThreads(savedUserId, DEFAULT_ACCOUNTS);
      }
    } catch {}
    return loadUserDmThreads('usr-ganesh', DEFAULT_ACCOUNTS);
  });
  const [activeDmThreadId, setActiveDmThreadId] = useState<string | null>(() => {
    try {
      const explicitAuth = localStorage.getItem(`${LOCAL_STORAGE_KEY}_explicit_auth_v2`);
      const savedUserId = localStorage.getItem(`${LOCAL_STORAGE_KEY}_current_user_id`) || 'guest';
      if (explicitAuth === 'true' && savedUserId !== 'guest') {
        const loaded = loadUserDmThreads(savedUserId, DEFAULT_ACCOUNTS);
        return loaded[0]?.id || null;
      }
    } catch {}
    return 'dm-arthur';
  });

  // Notifications & Auto-Reply configuration state
  const [incomingNotification, setIncomingNotification] = useState<InAppMessageNotification | null>(null);
  const [enablePeerAutoReplies, setEnablePeerAutoRepliesState] = useState<boolean>(() => {
    try {
      return localStorage.getItem(`${LOCAL_STORAGE_KEY}_enable_peer_auto_replies`) === 'true';
    } catch {
      return false; // Disabled by default for authentic user-to-user messaging!
    }
  });

  const [notificationSoundEnabled, setNotificationSoundEnabledState] = useState<boolean>(() => {
    try {
      return localStorage.getItem(`${LOCAL_STORAGE_KEY}_notif_sound`) !== 'false';
    } catch {
      return true;
    }
  });

  const setEnablePeerAutoReplies = (enabled: boolean) => {
    setEnablePeerAutoRepliesState(enabled);
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_enable_peer_auto_replies`, String(enabled));
    } catch {}
  };

  const setNotificationSoundEnabled = (enabled: boolean) => {
    setNotificationSoundEnabledState(enabled);
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_notif_sound`, String(enabled));
    } catch {}
  };

  const dismissNotification = () => {
    setIncomingNotification(null);
  };

  const totalUnreadDms = React.useMemo(() => {
    if (!isAuthenticated || currentUserId === 'guest') return 0;
    return dmThreads.reduce((sum, t) => sum + (t.unreadCount || 0), 0);
  }, [dmThreads, isAuthenticated, currentUserId]);

  // Country Journal state with local storage fallback
  const [journalEntries, setJournalEntries] = useState<Record<string, CountryJournalEntry>>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_journal_entries`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_JOURNAL_ENTRIES;
  });

  // Persistent tombstone set of deleted feedback report IDs so deleted sample/testing tickets never reload
  const getDeletedFeedbackIds = (): Set<string> => {
    try {
      const raw = localStorage.getItem(`${LOCAL_STORAGE_KEY}_deleted_feedback_ids`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return new Set(parsed);
      }
    } catch {}
    return new Set();
  };

  const markFeedbackIdsDeleted = (ids: string[]) => {
    try {
      const current = getDeletedFeedbackIds();
      ids.forEach(id => current.add(id));
      const arr = Array.from(current);
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_deleted_feedback_ids`, JSON.stringify(arr));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_feedback_seeded`, 'true');

      if (auth.currentUser) {
        const nowIso = new Date().toISOString();
        setDoc(doc(db, 'users', auth.currentUser.uid, 'workspace', 'deletedFeedbacks'), {
          id: 'deletedFeedbacks',
          userId: auth.currentUser.uid,
          deletedFeedbackIds: arr,
          updatedAt: nowIso,
        }).catch(() => {});
      }
    } catch {}
  };

  // Feedback & Bug Reports state with local storage fallback (strictly respects empty array [] and deleted IDs!)
  const [feedbackReports, setFeedbackReports] = useState<FeedbackReport[]>(() => {
    const deletedIds = getDeletedFeedbackIds();
    const isFeedbackSeeded = localStorage.getItem(`${LOCAL_STORAGE_KEY}_feedback_seeded`) === 'true';

    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_feedback_reports`);
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(r => r && r.id && !deletedIds.has(r.id));
        }
      }
      // If feedback was already initialized or purged before, NEVER reload sample tickets
      if (isFeedbackSeeded) {
        return [];
      }
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_feedback_seeded`, 'true');
      return INITIAL_FEEDBACK_REPORTS.filter(r => !deletedIds.has(r.id));
    } catch {
      if (isFeedbackSeeded) return [];
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_feedback_seeded`, 'true');
      return INITIAL_FEEDBACK_REPORTS.filter(r => !deletedIds.has(r.id));
    }
  });

  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackInitialType, setFeedbackInitialType] = useState<FeedbackType>('feedback');

  const openFeedbackModal = (type: FeedbackType = 'feedback') => {
    setFeedbackInitialType(type);
    setIsFeedbackModalOpen(true);
  };

  const closeFeedbackModal = () => {
    setIsFeedbackModalOpen(false);
  };

  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_feedback_reports`, JSON.stringify(feedbackReports));
    } catch {}
  }, [feedbackReports]);

  // Dossier Downloads Tracking State with localStorage & Firestore persistence
  const [dossierDownloads, setDossierDownloads] = useState<DossierDownloadRecord[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_dossier_downloads`);
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      return INITIAL_DOSSIER_DOWNLOADS;
    } catch {
      return INITIAL_DOSSIER_DOWNLOADS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_dossier_downloads`, JSON.stringify(dossierDownloads));
    } catch {}
  }, [dossierDownloads]);

  const trackDossierDownload = React.useCallback(
    (countryId: string, countryName: string, exportFormat: string = 'Comprehensive 29-Page PDF Dossier') => {
      const isAuth = isAuthenticatedRef.current;
      const currentProfile = userProfileRef.current;
      const currentId = currentUserIdRef.current;
      const targetCountry = countriesRef.current.find(c => c.id === countryId);

      const resolvedUserName =
        isAuth && currentProfile?.name && currentProfile.name !== 'Guest User'
          ? currentProfile.name
          : 'Guest (Anonymous)';

      const resolvedEmail =
        isAuth && currentProfile?.email && !currentProfile.email.includes('guest')
          ? currentProfile.email
          : undefined;

      const newRecord: DossierDownloadRecord = {
        id: `dl-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        countryId,
        countryName: countryName || targetCountry?.name || countryId,
        countryCode: targetCountry?.code,
        flag: targetCountry?.flag,
        isRegisteredUser: isAuth && currentId !== 'guest',
        userId: isAuth && currentId !== 'guest' ? currentId : 'guest',
        userName: resolvedUserName,
        userEmail: resolvedEmail,
        exportFormat,
        downloadedAt: new Date().toISOString(),
        deviceInfo: typeof navigator !== 'undefined'
          ? `${navigator.platform || 'Desktop'} · ${navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'}`
          : 'Desktop Browser',
      };

      setDossierDownloads(prev => [newRecord, ...prev]);

      // Sync record to Firestore if database is available
      try {
        if (db) {
          const docRef = doc(db, 'dossierDownloads', newRecord.id);
          setDoc(docRef, newRecord).catch(() => {});
        }
      } catch {}

      // Fire Google Analytics 4 event
      try {
        trackAnalyticsEvent('dossier_pdf_download', {
          country_id: countryId,
          country_name: countryName,
          export_format: exportFormat,
          user_type: isAuth ? 'registered' : 'guest',
        });
      } catch {}
    },
    []
  );

  const clearAllDossierDownloads = React.useCallback(() => {
    setDossierDownloads([]);
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_dossier_downloads`, JSON.stringify([]));
    } catch {}
  }, []);

  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(true);
  const [isFirebaseSyncing, setIsFirebaseSyncing] = useState<boolean>(false);
  const [lastCloudSyncTime, setLastCloudSyncTime] = useState<string | null>(() => {
    try {
      return localStorage.getItem(`${LOCAL_STORAGE_KEY}_last_cloud_sync`);
    } catch {
      return null;
    }
  });
  const persistedFirestoreRoleRef = React.useRef<'member' | 'admin'>('member');

  // Live refs to prevent stale closures inside onAuthStateChanged, timers & async Firestore handlers
  const registeredAccountsRef = React.useRef<UserAccount[]>(registeredAccounts);
  const currentUserIdRef = React.useRef<string>(currentUserId);
  const isAuthenticatedRef = React.useRef<boolean>(isAuthenticated);
  const userProfileRef = React.useRef<UserProfile>(userProfile);
  const checklistRef = React.useRef<RelocationChecklistTask[]>(checklist);
  const journalEntriesRef = React.useRef<Record<string, CountryJournalEntry>>(journalEntries);
  const threadsRef = React.useRef<CommunityThread[]>(threads);
  const meetupsRef = React.useRef<ExpatMeetup[]>(meetups);
  const dmThreadsRef = React.useRef<DirectMessageThread[]>(dmThreads);
  const countriesRef = React.useRef<Country[]>(countries);
  const currentViewRef = React.useRef<AppView>(currentView);
  const activeDmThreadIdRef = React.useRef<string | null>(activeDmThreadId);
  const enablePeerAutoRepliesRef = React.useRef<boolean>(enablePeerAutoReplies);
  const notificationSoundEnabledRef = React.useRef<boolean>(notificationSoundEnabled);
  const logoutEpochRef = React.useRef<number>(0);

  useEffect(() => { registeredAccountsRef.current = registeredAccounts; }, [registeredAccounts]);
  useEffect(() => { currentUserIdRef.current = currentUserId; }, [currentUserId]);
  useEffect(() => { isAuthenticatedRef.current = isAuthenticated; }, [isAuthenticated]);
  useEffect(() => { userProfileRef.current = userProfile; }, [userProfile]);
  useEffect(() => { checklistRef.current = checklist; }, [checklist]);
  useEffect(() => { journalEntriesRef.current = journalEntries; }, [journalEntries]);
  useEffect(() => { threadsRef.current = threads; }, [threads]);
  useEffect(() => { meetupsRef.current = meetups; }, [meetups]);
  useEffect(() => { dmThreadsRef.current = dmThreads; }, [dmThreads]);
  useEffect(() => { countriesRef.current = countries; }, [countries]);
  useEffect(() => { currentViewRef.current = currentView; }, [currentView]);
  useEffect(() => { activeDmThreadIdRef.current = activeDmThreadId; }, [activeDmThreadId]);
  useEffect(() => { enablePeerAutoRepliesRef.current = enablePeerAutoReplies; }, [enablePeerAutoReplies]);
  useEffect(() => { notificationSoundEnabledRef.current = notificationSoundEnabled; }, [notificationSoundEnabled]);

  const recordSyncTimestamp = () => {
    const nowIso = new Date().toISOString();
    setLastCloudSyncTime(nowIso);
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_last_cloud_sync`, nowIso);
    } catch {}
    return nowIso;
  };

  // Helper to persist a single UserAccount into Firestore (/users/{accountId}, /savedAccounts/{accountId}, /relocationChecklists/{accountId}, and /users/{uid}/savedAccounts/{accountId})
  const syncSingleAccountToFirestore = async (account: UserAccount): Promise<boolean> => {
    const currentUser = auth.currentUser;
    if (!currentUser) return false;
    const safeId = sanitizeAccountId(account.id);
    let currentAttemptPath = `users/${currentUser.uid}/savedAccounts/${safeId}`;
    const nowIso = new Date().toISOString();
    const safeName = (account.name?.trim() || account.profile?.name?.trim() || 'Retiree Member').slice(0, 100);
    const safeEmail = (account.email?.trim() || account.profile?.email?.trim() || currentUser.email || 'member@refirely.org').slice(0, 150);
    const accountChecklist = JSON.parse(JSON.stringify(account.checklist || checklistRef.current || []));
    const cleanProfile = JSON.parse(
      JSON.stringify({
        ...account.profile,
        id: safeId,
        name: safeName,
        email: safeEmail,
      })
    );
    const safePayload = {
      id: safeId,
      userId: currentUser.uid,
      username: String(account.username || safeId).trim().slice(0, 64) || safeId,
      name: safeName,
      email: safeEmail,
      createdAt: String(account.createdAt || nowIso.split('T')[0]).slice(0, 40),
      updatedAt: nowIso.slice(0, 40),
      profile: cleanProfile,
      checklist: accountChecklist,
    };

    try {
      // 1. Write to subcollection /users/{uid}/savedAccounts/{safeId}
      currentAttemptPath = `users/${currentUser.uid}/savedAccounts/${safeId}`;
      await setDoc(doc(db, 'users', currentUser.uid, 'savedAccounts', safeId), safePayload);

      // 2. Write to top-level /savedAccounts/{safeId} so all 3+ User IDs are visible at root level
      currentAttemptPath = `savedAccounts/${safeId}`;
      await setDoc(doc(db, 'savedAccounts', safeId), safePayload);

      // 3. Write to root /users/{safeId} so all 3+ User IDs (usr-ganesh, usr-elena, usr-marcus) appear side-by-side in /users
      currentAttemptPath = `users/${safeId}`;
      await setDoc(doc(db, 'users', safeId), {
        ...cleanProfile,
        id: safeId,
        userId: currentUser.uid,
        username: String(account.username || safeId).trim().slice(0, 64) || safeId,
        name: safeName,
        email: safeEmail,
        role: account.profile?.role === 'admin' && persistedFirestoreRoleRef.current === 'admin' ? 'admin' : 'member',
        checklist: accountChecklist,
        updatedAt: nowIso.slice(0, 40),
      });

      // 4. Write to top-level /relocationChecklists/{safeId}
      currentAttemptPath = `relocationChecklists/${safeId}`;
      await setDoc(doc(db, 'relocationChecklists', safeId), {
        id: safeId,
        userId: currentUser.uid,
        accountName: safeName,
        tasks: accountChecklist,
        updatedAt: nowIso.slice(0, 40),
      });

      recordSyncTimestamp();
      setIsFirebaseConnected(true);
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, currentAttemptPath);
      return false;
    }
  };

  // Helper to sync root user document (/users/{uid}) + activeAccountId + active savedAccount
  const syncProfileToFirestore = async (
    profileSnapshot: UserProfile,
    checklistSnapshot?: RelocationChecklistTask[],
    explicitActiveAccountId?: string
  ) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    const activeAccId = sanitizeAccountId(explicitActiveAccountId || currentUserIdRef.current || profileSnapshot.id || currentUser.uid);
    const docPath = `users/${currentUser.uid}`;
    const safeName = (profileSnapshot.name?.trim() || currentUser.displayName?.trim() || 'Retiree Member').slice(0, 100);
    const safeEmail = (profileSnapshot.email?.trim() || currentUser.email?.trim() || 'member@refirely.org').slice(0, 150);
    const safePayload = {
      ...profileSnapshot,
      id: currentUser.uid,
      userId: currentUser.uid,
      activeAccountId: activeAccId,
      name: safeName,
      email: safeEmail,
      role: persistedFirestoreRoleRef.current || 'member',
      checklist: checklistSnapshot ?? checklistRef.current,
      updatedAt: new Date().toISOString(),
    };
    try {
      await setDoc(doc(db, 'users', currentUser.uid), safePayload);
      // Also persist into /users/{activeAccId}, /savedAccounts/{activeAccId}, and /users/{uid}/savedAccounts/{activeAccId}
      const matchingAcc = registeredAccountsRef.current.find(a => a.id === activeAccId);
      await syncSingleAccountToFirestore({
        id: activeAccId,
        username: matchingAcc?.username || activeAccId,
        email: safeEmail,
        name: safeName,
        createdAt: matchingAcc?.createdAt || new Date().toISOString().split('T')[0],
        profile: { ...profileSnapshot, id: activeAccId, name: safeName, email: safeEmail },
        checklist: checklistSnapshot ?? checklistRef.current,
      });
      recordSyncTimestamp();
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, docPath);
    }
  };

  // Helper to sync workspace state (community threads, meetups, direct messages, custom countries) to /users/{uid}/workspace/{docId} AND top-level collections
  const syncWorkspaceToFirestore = async (
    docId: 'community' | 'countries',
    payloadData: Record<string, unknown>
  ): Promise<boolean> => {
    const currentUser = auth.currentUser;
    if (!currentUser) return false;
    const docPath = `users/${currentUser.uid}/workspace/${docId}`;
    const nowIso = new Date().toISOString().slice(0, 40);
    try {
      await setDoc(doc(db, 'users', currentUser.uid, 'workspace', docId), {
        ...payloadData,
        id: docId,
        userId: currentUser.uid,
        updatedAt: nowIso,
      });

      if (docId === 'community') {
        const threadsList = (payloadData.threads as CommunityThread[]) || threadsRef.current;
        for (const t of threadsList) {
          const safeThreadId = sanitizeAccountId(t.id);
          await setDoc(doc(db, 'communityThreads', safeThreadId), {
            ...t,
            id: safeThreadId,
            userId: currentUser.uid,
            updatedAt: nowIso,
          });
        }
        const meetupsList = (payloadData.meetups as ExpatMeetup[]) || meetupsRef.current;
        for (const m of meetupsList) {
          const safeMeetupId = sanitizeAccountId(m.id);
          await setDoc(doc(db, 'expatMeetups', safeMeetupId), {
            ...m,
            id: safeMeetupId,
            userId: currentUser.uid,
            updatedAt: nowIso,
          });
        }
      }

      recordSyncTimestamp();
      setIsFirebaseConnected(true);
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, docPath);
      return false;
    }
  };

  // Helper to check if a string is a guest placeholder that should never overwrite a real Google user's name/email
  const isGuestPlaceholder = (val?: string | null): boolean => {
    if (!val) return true;
    const clean = val.trim().toLowerCase();
    return (
      clean === '' ||
      clean === 'guest' ||
      clean === 'guest explorer' ||
      clean === 'guest@refirely.org' ||
      clean === 'retiree member'
    );
  };

  // Format an email prefix (e.g. "rahul.sharma@gmail.com") into a clean display name ("Rahul Sharma")
  const formatNameFromEmail = (email?: string | null): string => {
    if (!email) return 'Expat Member';
    const prefix = email.split('@')[0] || '';
    const words = prefix
      .replace(/[._\-+]+/g, ' ')
      .replace(/\d+/g, ' ')
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (words.length === 0) return prefix || 'Expat Member';
    return words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  };

  // Build or resolve a complete UserAccount + UserProfile for any Google Auth user (admin or general Gmail user)
  const resolveGoogleAccountForUser = (
    user: FirebaseUser,
    accountsList: UserAccount[],
    firestoreRootData?: (Partial<UserProfile> & { activeAccountId?: string; checklist?: RelocationChecklistTask[] }) | null
  ): UserAccount => {
    const googleEmail = (user.email || '').trim().toLowerCase();
    const isAdminEmail = googleEmail === 'ganesh.indireddy@gmail.com';
    const defaultIds = new Set(DEFAULT_ACCOUNTS.map(d => d.id));

    // 1. Check if there is already a non-guest account matching this Google email
    // Non-admin Google users never match the 3 preloaded default IDs (usr-ganesh, usr-elena, usr-marcus)
    const existingByEmail = accountsList.find(
      a =>
        a.id !== 'guest' &&
        (isAdminEmail || !defaultIds.has(a.id)) &&
        a.email &&
        a.email.trim().toLowerCase() === googleEmail
    );

    // 2. Generate a clean human-readable User ID from the Gmail handle (e.g., usr-ganesh-photolife)
    const emailPrefix = googleEmail ? googleEmail.split('@')[0].replace(/[^a-z0-9]/g, '-') : '';
    let candidateId = existingByEmail?.id
      ? sanitizeAccountId(existingByEmail.id)
      : isAdminEmail
        ? 'usr-ganesh'
        : sanitizeAccountId(emailPrefix ? `usr-${emailPrefix}` : `usr-${user.uid.slice(0, 10)}`);

    // Ensure a non-admin Gmail user NEVER collides with the 3 preloaded default IDs
    if (!isAdminEmail && defaultIds.has(candidateId)) {
      candidateId = sanitizeAccountId(`usr-${emailPrefix || user.uid.slice(0, 8).toLowerCase()}-${user.uid.slice(0, 4).toLowerCase()}`);
    }

    // 3. Resolve real display name, email, and avatar from Google Auth (never 'Guest Explorer'!)
    const googleDisplayName = !isGuestPlaceholder(user.displayName)
      ? user.displayName!.trim()
      : formatNameFromEmail(user.email);

    const resolvedName = (
      !isGuestPlaceholder(user.displayName)
        ? user.displayName!.trim()
        : !isGuestPlaceholder(existingByEmail?.profile?.name)
          ? existingByEmail!.profile.name.trim()
          : !isGuestPlaceholder(firestoreRootData?.name)
            ? firestoreRootData!.name!.trim()
            : googleDisplayName
    ).slice(0, 100);

    const resolvedEmail = (
      user.email?.trim() ||
      (!isGuestPlaceholder(existingByEmail?.email) ? existingByEmail!.email.trim() : '') ||
      (!isGuestPlaceholder(firestoreRootData?.email) ? firestoreRootData!.email!.trim() : '')
    ).slice(0, 150);

    // 3b. Resolve avatar prioritizing the user's real Google Auth photoURL over any preloaded sample Unsplash images!
    const googlePhotoUrl = user.photoURL?.trim() || '';
    if (googlePhotoUrl) {
      try {
        if (googleEmail) {
          localStorage.setItem(`${LOCAL_STORAGE_KEY}_google_photo_${googleEmail}`, googlePhotoUrl);
        }
        localStorage.setItem(`${LOCAL_STORAGE_KEY}_google_photo_${candidateId}`, googlePhotoUrl);
      } catch {}
    }

    let localSavedAvatar: string | null = null;
    let savedGooglePhoto: string | null = googlePhotoUrl || null;
    try {
      if (!savedGooglePhoto) {
        savedGooglePhoto =
          (googleEmail ? localStorage.getItem(`${LOCAL_STORAGE_KEY}_google_photo_${googleEmail}`) : null) ||
          localStorage.getItem(`${LOCAL_STORAGE_KEY}_google_photo_${candidateId}`);
      }

      const candidateLocalAvatar =
        (googleEmail ? localStorage.getItem(`${LOCAL_STORAGE_KEY}_avatar_${googleEmail}`) : null) ||
        localStorage.getItem(`${LOCAL_STORAGE_KEY}_avatar_${candidateId}`) ||
        (user.uid ? localStorage.getItem(`${LOCAL_STORAGE_KEY}_avatar_${user.uid}`) : null);

      if (candidateLocalAvatar && !isSampleStockAvatar(candidateLocalAvatar)) {
        localSavedAvatar = candidateLocalAvatar;
      }

      if (!localSavedAvatar) {
        const savedProfStr = localStorage.getItem(`${LOCAL_STORAGE_KEY}_profile_${candidateId}`);
        if (savedProfStr) {
          const parsed = JSON.parse(savedProfStr);
          if (parsed?.avatarUrl && !isSampleStockAvatar(parsed.avatarUrl)) {
            localSavedAvatar = parsed.avatarUrl;
          }
        }
      }
    } catch {}

    const nonSampleExistingAvatar =
      existingByEmail?.profile?.avatarUrl && !isSampleStockAvatar(existingByEmail.profile.avatarUrl)
        ? existingByEmail.profile.avatarUrl
        : null;

    const nonSampleFirestoreAvatar =
      firestoreRootData?.avatarUrl && !isSampleStockAvatar(firestoreRootData.avatarUrl)
        ? firestoreRootData.avatarUrl
        : null;

    const resolvedAvatar =
      savedGooglePhoto ||
      localSavedAvatar ||
      nonSampleExistingAvatar ||
      nonSampleFirestoreAvatar ||
      existingByEmail?.profile?.avatarUrl ||
      firestoreRootData?.avatarUrl ||
      '';

    // Heal any cached Unsplash sample avatar keys in localStorage with the resolved Gmail photo
    if (resolvedAvatar && !isSampleStockAvatar(resolvedAvatar)) {
      try {
        localStorage.setItem(`${LOCAL_STORAGE_KEY}_avatar_${candidateId}`, resolvedAvatar);
        if (googleEmail) {
          localStorage.setItem(`${LOCAL_STORAGE_KEY}_avatar_${googleEmail}`, resolvedAvatar);
        }
        if (user.uid) {
          localStorage.setItem(`${LOCAL_STORAGE_KEY}_avatar_${user.uid}`, resolvedAvatar);
        }
      } catch {}
    }

    // Use a clean member base profile (never GUEST_PROFILE)
    const cleanBaseProfile: UserProfile =
      existingByEmail && existingByEmail.id !== 'guest'
        ? existingByEmail.profile
        : {
            ...DEFAULT_ACCOUNTS[0].profile,
            id: candidateId,
            name: resolvedName,
            email: resolvedEmail,
            avatarUrl: resolvedAvatar,
            originCountry: firestoreRootData?.originCountry && firestoreRootData.originCountry !== 'United States'
              ? firestoreRootData.originCountry
              : 'United States',
            residingCountry: firestoreRootData?.residingCountry || firestoreRootData?.originCountry || 'United States',
            originCity: firestoreRootData?.originCity || '',
            targetCountry: firestoreRootData?.targetCountry || 'Portugal',
            retirementTimelineYear: firestoreRootData?.retirementTimelineYear || 2027,
            monthlyBudgetUSD: firestoreRootData?.monthlyBudgetUSD || 2500,
            preferredClimate: firestoreRootData?.preferredClimate || 'Mediterranean',
            savedCountryIds:
              Array.isArray(firestoreRootData?.savedCountryIds) && firestoreRootData!.savedCountryIds.length > 0
                ? firestoreRootData!.savedCountryIds
                : ['portugal', 'spain', 'costa-rica'],
            rsvpMeetupIds: Array.isArray(firestoreRootData?.rsvpMeetupIds) ? firestoreRootData!.rsvpMeetupIds : [],
            appliedVisas: Array.isArray(firestoreRootData?.appliedVisas) ? firestoreRootData!.appliedVisas : [],
            bio:
              firestoreRootData?.bio && !firestoreRootData.bio.includes('Log in or create a free account')
                ? firestoreRootData.bio
                : `Exploring global retirement havens and expat communities (${resolvedEmail}).`,
            aboutMe: firestoreRootData?.aboutMe || '',
            occupationOrBackground:
              firestoreRootData?.occupationOrBackground && firestoreRootData.occupationOrBackground !== 'Prospective Retiree'
                ? firestoreRootData.occupationOrBackground
                : 'Global Expat Member',
            relocationStatus: firestoreRootData?.relocationStatus || 'Exploring Options',
            finances: firestoreRootData?.finances || DEFAULT_FINANCIAL_PORTFOLIO,
            role: isAdminEmail ? 'admin' : 'member',
            languagesKnown:
              Array.isArray(firestoreRootData?.languagesKnown) && firestoreRootData!.languagesKnown.length > 0
                ? firestoreRootData!.languagesKnown
                : [{ id: 'lang-en', language: 'English', proficiency: 'Fluent' }],
            interests:
              Array.isArray(firestoreRootData?.interests) && firestoreRootData!.interests.length > 0
                ? firestoreRootData!.interests
                : ['Coastal Living & Beaches', 'Healthcare & Wellness', 'Expat Meetups & Socializing'],
            travelHistory: Array.isArray(firestoreRootData?.travelHistory) ? firestoreRootData!.travelHistory : [],
          };

    const finalProfile: UserProfile = {
      ...cleanBaseProfile,
      id: candidateId,
      name: resolvedName,
      email: resolvedEmail,
      avatarUrl: resolvedAvatar,
      finances: cleanBaseProfile.finances || DEFAULT_FINANCIAL_PORTFOLIO,
      role: isAdminEmail ? (cleanBaseProfile.role || 'admin') : 'member',
    };

    const nowIso = new Date().toISOString();
    return {
      id: candidateId,
      username: emailPrefix || candidateId,
      email: resolvedEmail,
      password: existingByEmail?.password || 'password123',
      name: resolvedName,
      createdAt: existingByEmail?.createdAt || nowIso.split('T')[0],
      profile: finalProfile,
      checklist: existingByEmail?.checklist || firestoreRootData?.checklist || INITIAL_CHECKLIST,
      cloudSynced: true,
      lastSyncedAt: nowIso,
    };
  };

  // Force sync all local User IDs, Journal Entries, and Workspace Data to Firestore
  const syncAllAccountsToCloud = async (): Promise<{ success: boolean; syncedCount: number; error?: string }> => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return {
        success: false,
        syncedCount: 0,
        error: 'Not signed in to Firebase Auth yet. Click "Connect Google Auth" to link your cloud database.',
      };
    }
    setIsFirebaseSyncing(true);
    try {
      const isAdminUser = (currentUser.email || '').trim().toLowerCase() === 'ganesh.indireddy@gmail.com';
      const defaultIds = new Set(DEFAULT_ACCOUNTS.map(d => d.id));
      let syncedCount = 0;
      const updatedAccounts: UserAccount[] = [];
      for (const acc of registeredAccountsRef.current) {
        const safeId = sanitizeAccountId(acc.id);
        // Non-admin users only sync their own accounts, never admin-owned DEFAULT_ACCOUNTS
        const canSyncThisAccount =
          isAdminUser ||
          !defaultIds.has(safeId) ||
          acc.email.trim().toLowerCase() === (currentUser.email || '').trim().toLowerCase();

        const ok = canSyncThisAccount ? await syncSingleAccountToFirestore({ ...acc, id: safeId }) : false;
        const nowIso = new Date().toISOString();
        updatedAccounts.push({
          ...acc,
          id: safeId,
          cloudSynced: ok || acc.cloudSynced,
          lastSyncedAt: ok ? nowIso : acc.lastSyncedAt,
        });
        if (ok) syncedCount++;
      }
      setRegisteredAccounts(updatedAccounts);
      await syncProfileToFirestore(userProfileRef.current, checklistRef.current, currentUserIdRef.current);

      // Sync all Country Journal entries to /countryJournals/{countryId} and /users/{uid}/journalEntries/{countryId}
      const entries = Object.values(journalEntriesRef.current);
      for (const entry of entries) {
        if (!entry || !entry.countryId) continue;
        const safeCountryId = sanitizeAccountId(entry.countryId);
        const journalPayload = {
          ...entry,
          id: safeCountryId,
          countryId: safeCountryId,
          userId: currentUser.uid,
          countryName: (entry.countryName || safeCountryId).slice(0, 100),
          privateNotes: (entry.privateNotes || '').slice(0, 5000),
          tags: Array.isArray(entry.tags) ? entry.tags.slice(0, 20) : [],
          scoutingTimeline: (entry.scoutingTimeline || '').slice(0, 100),
        };
        await setDoc(doc(db, 'users', currentUser.uid, 'journalEntries', safeCountryId), journalPayload);
        await setDoc(doc(db, 'countryJournals', safeCountryId), journalPayload);
      }

      // Sync community threads, meetups, and direct messages to /users/{uid}/workspace/community and top-level collections
      await syncWorkspaceToFirestore('community', {
        threads: threadsRef.current,
        meetups: meetupsRef.current,
        dmThreads: dmThreadsRef.current,
      });

      setIsFirebaseConnected(true);
      return { success: true, syncedCount };
    } catch (err: any) {
      return { success: false, syncedCount: 0, error: err?.message || 'Failed to sync accounts to Firestore.' };
    } finally {
      setIsFirebaseSyncing(false);
    }
  };

  // Cleanly reset local & Firestore user state and re-seed fresh defaults
  const resetCloudAndLocalState = async (): Promise<{ success: boolean; message: string }> => {
    setIsFirebaseSyncing(true);
    try {
      // Clear local storage keys
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && (k.startsWith(LOCAL_STORAGE_KEY) || k.startsWith('havenroute_app_state'))) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach(k => {
        try {
          localStorage.removeItem(k);
        } catch {}
      });

      // Reset React state to fresh defaults
      const freshDefaultAcc = DEFAULT_ACCOUNTS[0];
      const freshProfile: UserProfile = {
        ...freshDefaultAcc.profile,
        finances: freshDefaultAcc.profile.finances || DEFAULT_FINANCIAL_PORTFOLIO,
      };
      setCountries(INITIAL_COUNTRIES);
      setRegisteredAccounts(DEFAULT_ACCOUNTS);
      registeredAccountsRef.current = DEFAULT_ACCOUNTS;
      setCurrentUserId(freshDefaultAcc.id);
      currentUserIdRef.current = freshDefaultAcc.id;
      setUserProfile(freshProfile);
      userProfileRef.current = freshProfile;
      setChecklist(INITIAL_CHECKLIST);
      checklistRef.current = INITIAL_CHECKLIST;
      setThreads(INITIAL_THREADS);
      setMeetups(INITIAL_MEETUPS);
      setDmThreads(INITIAL_DM_THREADS);
      setJournalEntries(INITIAL_JOURNAL_ENTRIES);
      journalEntriesRef.current = INITIAL_JOURNAL_ENTRIES;
      setIsAuthenticated(true);

      // If signed in to Firebase, clean and re-seed Firestore documents for this user
      const currentUser = auth.currentUser;
      if (currentUser) {
        const savedAccSnap = await getDocs(collection(db, 'users', currentUser.uid, 'savedAccounts'));
        for (const docSnap of savedAccSnap.docs) {
          await deleteDoc(doc(db, 'users', currentUser.uid, 'savedAccounts', docSnap.id));
        }
        const journalSnap = await getDocs(collection(db, 'users', currentUser.uid, 'journalEntries'));
        for (const docSnap of journalSnap.docs) {
          await deleteDoc(doc(db, 'users', currentUser.uid, 'journalEntries', docSnap.id));
        }
        for (const acc of DEFAULT_ACCOUNTS) {
          await syncSingleAccountToFirestore(acc);
        }
        await syncProfileToFirestore(freshProfile, INITIAL_CHECKLIST, freshDefaultAcc.id);
        return {
          success: true,
          message: 'Firestore database & local state have been freshly reset and re-seeded with clean defaults!',
        };
      }

      return {
        success: true,
        message: 'Application state & local storage have been freshly reset to clean defaults!',
      };
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || 'Encountered an error while resetting state.',
      };
    } finally {
      setIsFirebaseSyncing(false);
    }
  };

  // Live Firestore connection health check
  const testFirestoreConnection = async (): Promise<{ connected: boolean; latencyMs: number; message: string }> => {
    const start = performance.now();
    try {
      if (auth.currentUser) {
        await getDocFromServer(doc(db, 'users', auth.currentUser.uid));
      } else {
        await getDocFromServer(doc(db, 'test', 'connection'));
      }
      const latencyMs = Math.max(1, Math.round(performance.now() - start));
      setIsFirebaseConnected(true);
      return {
        connected: true,
        latencyMs,
        message: auth.currentUser
          ? `Connected & authenticated as ${auth.currentUser.email || auth.currentUser.uid} (${latencyMs}ms)`
          : `Firestore database reachable (${latencyMs}ms). Connect Google Auth to enable write sync.`,
      };
    } catch (err: any) {
      const latencyMs = Math.max(1, Math.round(performance.now() - start));
      const msg = err instanceof Error ? err.message : String(err);
      // Permission-denied on /test/connection when unauthenticated actually proves the Firestore server is online and enforcing rules!
      if (msg.includes('Missing or insufficient permissions') || msg.includes('permission-denied')) {
        setIsFirebaseConnected(true);
        return {
          connected: true,
          latencyMs,
          message: `Firestore security rules active & server reachable (${latencyMs}ms). Sign in with Google to read/write your private User IDs.`,
        };
      }
      setIsFirebaseConnected(false);
      return {
        connected: false,
        latencyMs,
        message: `Connection issue: ${msg}`,
      };
    }
  };

  // Sync journal entries to local storage and active account
  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_journal_entries`, JSON.stringify(journalEntries));
      if (currentUserId && currentUserId !== 'guest') {
        localStorage.setItem(`${LOCAL_STORAGE_KEY}_journal_${currentUserId}`, JSON.stringify(journalEntries));
      }
    } catch {}
  }, [journalEntries, currentUserId]);

  // Sync with Firebase Authentication & Firestore WITHOUT overwriting custom created User IDs!
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // If user explicitly logged out, do not auto-restore session from cached Firebase IndexedDB state
        try {
          if (localStorage.getItem(`${LOCAL_STORAGE_KEY}_logged_out_explicitly`) === 'true') {
            setFirebaseUser(null);
            setIsAuthenticated(false);
            isAuthenticatedRef.current = false;
            await signOut(auth).catch(() => {});
            return;
          }
        } catch {}

        const syncEpoch = logoutEpochRef.current;
        setFirebaseUser(user);
        setIsFirebaseSyncing(true);

        // Immediately resolve and activate the Google user's account BEFORE any Firestore network calls
        // so the UI immediately shows their real Google Name, Gmail ID, and usr-<gmail> User ID (never "Guest")!
        const googleEmail = (user.email || '').trim().toLowerCase();
        const isAdminUser = googleEmail === 'ganesh.indireddy@gmail.com';
        const immediateGoogleAcc = resolveGoogleAccountForUser(user, registeredAccountsRef.current, null);

        setCurrentUserId(immediateGoogleAcc.id);
        currentUserIdRef.current = immediateGoogleAcc.id;
        setUserProfile(immediateGoogleAcc.profile);
        userProfileRef.current = immediateGoogleAcc.profile;
        setIsAuthenticated(true);
        isAuthenticatedRef.current = true;
        if (
          (isAdminUser || immediateGoogleAcc.id === 'usr-ganesh' || immediateGoogleAcc.profile.role === 'admin') &&
          (currentViewRef.current === 'landing' || currentViewRef.current === 'dashboard')
        ) {
          setCurrentView('admin');
          currentViewRef.current = 'admin';
        }
        try {
          localStorage.setItem(`${LOCAL_STORAGE_KEY}_current_user_id`, immediateGoogleAcc.id);
          localStorage.setItem(`${LOCAL_STORAGE_KEY}_profile`, JSON.stringify(immediateGoogleAcc.profile));
          localStorage.setItem(`${LOCAL_STORAGE_KEY}_is_authenticated`, 'true');
          localStorage.setItem(`${LOCAL_STORAGE_KEY}_explicit_auth_v2`, 'true');
        } catch {}

        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);

          // Load any remote tombstones for deleted users and feedback
          try {
            const delAccDocSnap = await getDoc(doc(db, 'users', user.uid, 'workspace', 'deletedAccounts'));
            if (delAccDocSnap.exists()) {
              const data = delAccDocSnap.data() as any;
              if (Array.isArray(data.deletedUserIds)) {
                const localDeleted = getDeletedUserAccountIds();
                data.deletedUserIds.forEach((id: string) => localDeleted.add(id));
                localStorage.setItem(`${LOCAL_STORAGE_KEY}_deleted_user_ids`, JSON.stringify(Array.from(localDeleted)));
              }
            }
          } catch {}

          try {
            const delFbDocSnap = await getDoc(doc(db, 'users', user.uid, 'workspace', 'deletedFeedbacks'));
            if (delFbDocSnap.exists()) {
              const data = delFbDocSnap.data() as any;
              if (Array.isArray(data.deletedFeedbackIds)) {
                const localDeleted = getDeletedFeedbackIds();
                data.deletedFeedbackIds.forEach((id: string) => localDeleted.add(id));
                localStorage.setItem(`${LOCAL_STORAGE_KEY}_deleted_feedback_ids`, JSON.stringify(Array.from(localDeleted)));
              }
            }
          } catch {}

          const currentDeletedUserIds = getDeletedUserAccountIds();
          const currentDeletedFeedbackIds = getDeletedFeedbackIds();

          // 1. Fetch all saved custom User IDs belonging to this Firebase user from /users/{uid}/savedAccounts
          const savedAccCollRef = collection(db, 'users', user.uid, 'savedAccounts');
          const savedAccSnap = await getDocs(savedAccCollRef);
          const defaultIds = new Set(DEFAULT_ACCOUNTS.map(d => d.id));
          const remoteAccountsMap = new Map<string, UserAccount>();
          savedAccSnap.forEach(d => {
            const data = d.data() as any;
            if (data && data.id && data.id !== 'guest' && data.profile) {
              // Ignore any deleted or tombstoned account IDs
              if (currentDeletedUserIds.has(data.id)) {
                return;
              }
              // Non-admin users ignore any stale copies of the 3 default admin personas in their subcollection
              if (!isAdminUser && defaultIds.has(data.id)) {
                return;
              }
              const matchingDefault = DEFAULT_ACCOUNTS.find(def => def.id === data.id);
              const cleanName = !isGuestPlaceholder(data.name)
                ? data.name
                : !isGuestPlaceholder(data.profile?.name)
                  ? data.profile.name
                  : matchingDefault?.name || immediateGoogleAcc.name;
              const cleanEmail = matchingDefault
                ? matchingDefault.email
                : !isGuestPlaceholder(data.email)
                  ? data.email
                  : !isGuestPlaceholder(data.profile?.email)
                    ? data.profile.email
                    : immediateGoogleAcc.email;
              remoteAccountsMap.set(data.id, {
                id: data.id,
                username: data.username || data.id,
                email: cleanEmail,
                password: data.password || matchingDefault?.password || 'password123',
                name: cleanName,
                createdAt: data.createdAt || '2026-01-01',
                profile: {
                  ...data.profile,
                  id: data.id,
                  name: cleanName,
                  email: cleanEmail,
                  finances: data.profile.finances || DEFAULT_FINANCIAL_PORTFOLIO,
                },
                checklist: Array.isArray(data.checklist) ? data.checklist : undefined,
                cloudSynced: true,
                lastSyncedAt: data.updatedAt || new Date().toISOString(),
              });
            }
          });

          // If admin user, also fetch top-level /savedAccounts and /users to include all cloud-registered users
          if (isAdminUser) {
            try {
              const topSavedSnap = await getDocs(collection(db, 'savedAccounts'));
              topSavedSnap.forEach(d => {
                const data = d.data() as any;
                if (data && data.id && data.id !== 'guest' && data.profile && !remoteAccountsMap.has(data.id)) {
                  if (currentDeletedUserIds.has(data.id)) {
                    return;
                  }
                  const cleanName = !isGuestPlaceholder(data.name)
                    ? data.name
                    : !isGuestPlaceholder(data.profile?.name)
                      ? data.profile.name
                      : formatNameFromEmail(data.email);
                  const cleanEmail = !isGuestPlaceholder(data.email)
                    ? data.email
                    : !isGuestPlaceholder(data.profile?.email)
                      ? data.profile.email
                      : 'member@refirely.org';
                  remoteAccountsMap.set(data.id, {
                    id: data.id,
                    username: data.username || data.id,
                    email: cleanEmail,
                    password: data.password || 'password123',
                    name: cleanName,
                    createdAt: data.createdAt || '2026-01-01',
                    profile: {
                      ...data.profile,
                      id: data.id,
                      name: cleanName,
                      email: cleanEmail,
                      finances: data.profile.finances || DEFAULT_FINANCIAL_PORTFOLIO,
                    },
                    checklist: Array.isArray(data.checklist) ? data.checklist : undefined,
                    cloudSynced: true,
                    lastSyncedAt: data.updatedAt || new Date().toISOString(),
                  });
                }
              });
            } catch (e) {
              console.warn('Admin top-level savedAccounts fetch notice:', e);
            }
          }

          // 2. Read root /users/{uid} document if it exists
          let firestoreRootData: (UserProfile & { activeAccountId?: string; checklist?: RelocationChecklistTask[] }) | null = null;
          if (userDocSnap.exists()) {
            firestoreRootData = userDocSnap.data() as UserProfile & { activeAccountId?: string; checklist?: RelocationChecklistTask[] };
            persistedFirestoreRoleRef.current =
              isAdminUser || firestoreRootData.role === 'admin' ? 'admin' : 'member';
          } else {
            persistedFirestoreRoleRef.current = isAdminUser ? 'admin' : 'member';
          }

          // 3. Build merged accounts map (NEVER force-reinject deleted DEFAULT_ACCOUNTS!)
          const localAccounts = registeredAccountsRef.current.filter(
            a => a.id !== 'guest' && !currentDeletedUserIds.has(a.id)
          );
          const mergedMap = new Map<string, UserAccount>();

          // Ensure primary admin account (usr-ganesh) is retained
          const ganeshDefault = DEFAULT_ACCOUNTS[0];
          if (!currentDeletedUserIds.has(ganeshDefault.id)) {
            mergedMap.set(sanitizeAccountId(ganeshDefault.id), ganeshDefault);
          }

          for (const localAcc of localAccounts) {
            const safeLocalId = sanitizeAccountId(localAcc.id);
            if (currentDeletedUserIds.has(safeLocalId)) continue;
            const matchingDefault = DEFAULT_ACCOUNTS.find(d => d.id === safeLocalId);
            if (matchingDefault) {
              mergedMap.set(safeLocalId, {
                ...localAcc,
                email: matchingDefault.email,
                profile: {
                  ...localAcc.profile,
                  email: matchingDefault.email,
                },
              });
            } else {
              mergedMap.set(safeLocalId, localAcc);
            }
          }
          remoteAccountsMap.forEach((acc, id) => {
            if (!currentDeletedUserIds.has(id)) {
              mergedMap.set(id, acc);
            }
          });

          // Proactively purge any tombstoned accounts from Firestore
          for (const deadId of Array.from(currentDeletedUserIds)) {
            if (deadId === 'usr-ganesh') continue;
            const safeDeadId = sanitizeAccountId(deadId);
            try {
              await deleteDoc(doc(db, 'users', user.uid, 'savedAccounts', safeDeadId));
              await deleteDoc(doc(db, 'savedAccounts', safeDeadId));
              if (safeDeadId !== user.uid) {
                await deleteDoc(doc(db, 'users', safeDeadId));
              }
              await deleteDoc(doc(db, 'relocationChecklists', safeDeadId));
            } catch {}
          }

          // Proactively purge any tombstoned feedback tickets from Firestore and clean up active state
          for (const deadFbId of Array.from(currentDeletedFeedbackIds)) {
            try {
              await deleteDoc(doc(db, 'feedbackReports', deadFbId));
            } catch {}
          }
          setFeedbackReports(prev => {
            const cleaned = prev.filter(r => !currentDeletedFeedbackIds.has(r.id));
            try {
              localStorage.setItem(`${LOCAL_STORAGE_KEY}_feedback_reports`, JSON.stringify(cleaned));
            } catch {}
            return cleaned;
          });

          // 4. Resolve the signed-in Google user's dedicated UserAccount (e.g. usr-<gmail-handle>) with their Google Name, Gmail ID, and Avatar
          const resolvedGoogleAccount = resolveGoogleAccountForUser(
            user,
            Array.from(mergedMap.values()),
            firestoreRootData
          );
          mergedMap.set(resolvedGoogleAccount.id, resolvedGoogleAccount);

          // 5. Sync accounts to Firestore:
          // - Only sync active, non-deleted accounts!
          const nowIso = new Date().toISOString();
          for (const [safeId, acc] of Array.from(mergedMap.entries())) {
            if (currentDeletedUserIds.has(safeId)) continue;
            const belongsToCurrentUser =
              isAdminUser ||
              safeId === resolvedGoogleAccount.id ||
              (!defaultIds.has(safeId) &&
                (remoteAccountsMap.has(safeId) || acc.email.trim().toLowerCase() === googleEmail));

            if (belongsToCurrentUser) {
              const synced = await syncSingleAccountToFirestore({ ...acc, id: safeId });
              mergedMap.set(safeId, {
                ...acc,
                id: safeId,
                cloudSynced: synced,
                lastSyncedAt: synced ? nowIso : acc.lastSyncedAt,
              });
            }
          }

          if (logoutEpochRef.current !== syncEpoch || !isAuthenticatedRef.current) {
            return;
          }

          const mergedAccountsList = Array.from(mergedMap.values());
          setRegisteredAccounts(mergedAccountsList);
          registeredAccountsRef.current = mergedAccountsList;

          // 6. Activate the signed-in Google user's User ID and profile
          const activeAccount = mergedMap.get(resolvedGoogleAccount.id) || resolvedGoogleAccount;
          setCurrentUserId(activeAccount.id);
          currentUserIdRef.current = activeAccount.id;
          setUserProfile({
            ...activeAccount.profile,
            id: activeAccount.id,
            name: activeAccount.name,
            email: activeAccount.email,
            finances: activeAccount.profile.finances || DEFAULT_FINANCIAL_PORTFOLIO,
          });
          userProfileRef.current = activeAccount.profile;
          if (Array.isArray(activeAccount.checklist) && activeAccount.checklist.length > 0) {
            setChecklist(activeAccount.checklist);
          }

          try {
            localStorage.setItem(`${LOCAL_STORAGE_KEY}_current_user_id`, activeAccount.id);
            localStorage.setItem(`${LOCAL_STORAGE_KEY}_profile`, JSON.stringify(activeAccount.profile));
          } catch {}

          // 7. Always write/repair root /users/{uid} document with the real Google Name, Email, and activeAccountId (healing any old "Guest" record)
          await setDoc(userDocRef, {
            ...activeAccount.profile,
            id: user.uid,
            userId: user.uid,
            activeAccountId: activeAccount.id,
            name: activeAccount.name.slice(0, 100),
            email: activeAccount.email.slice(0, 150),
            role: persistedFirestoreRoleRef.current,
            checklist: activeAccount.checklist || checklistRef.current,
            updatedAt: nowIso,
          });

          // 4. Fetch user's journal entries from Firestore and sync all entries to top-level /countryJournals
          const journalCollRef = collection(db, 'users', user.uid, 'journalEntries');
          const journalSnap = await getDocs(journalCollRef);
          const mergedJournal: Record<string, CountryJournalEntry> = {
            ...INITIAL_JOURNAL_ENTRIES,
            ...journalEntriesRef.current,
          };
          if (!journalSnap.empty) {
            journalSnap.forEach(d => {
              mergedJournal[d.id] = d.data() as CountryJournalEntry;
            });
          }
          setJournalEntries(mergedJournal);
          for (const entry of Object.values(mergedJournal)) {
            if (!entry?.countryId) continue;
            const safeCountryId = sanitizeAccountId(entry.countryId);
            const journalPayload = {
              ...entry,
              id: safeCountryId,
              countryId: safeCountryId,
              userId: user.uid,
              countryName: (entry.countryName || safeCountryId).slice(0, 100),
              privateNotes: (entry.privateNotes || '').slice(0, 5000),
              tags: Array.isArray(entry.tags) ? entry.tags.slice(0, 20) : [],
              scoutingTimeline: (entry.scoutingTimeline || '').slice(0, 100),
            };
            await setDoc(doc(db, 'users', user.uid, 'journalEntries', safeCountryId), journalPayload);
            await setDoc(doc(db, 'countryJournals', safeCountryId), journalPayload);
          }

          // 5. Fetch or seed workspace community data (/users/{uid}/workspace/community, /communityThreads, /expatMeetups)
          const commDocRef = doc(db, 'users', user.uid, 'workspace', 'community');
          const commSnap = await getDoc(commDocRef);
          let nextThreads = threadsRef.current;
          let nextMeetups = meetupsRef.current;
          let nextDmThreads = dmThreadsRef.current;
          if (commSnap.exists()) {
            const commData = commSnap.data() as any;
            if (Array.isArray(commData.threads) && commData.threads.length > 0) {
              nextThreads = sanitizePublicThreads(commData.threads);
              setThreads(nextThreads);
            }
            if (Array.isArray(commData.meetups) && commData.meetups.length > 0) {
              nextMeetups = commData.meetups;
              setMeetups(nextMeetups);
            }
            // Load user-specific authentic DM threads, never overwrite with generic workspace community data
            const userDmThreads = loadUserDmThreads(activeAccount.id, mergedAccountsList);
            nextDmThreads = userDmThreads;
            setDmThreads(userDmThreads);
          } else {
            const userDmThreads = loadUserDmThreads(activeAccount.id, mergedAccountsList);
            nextDmThreads = userDmThreads;
            setDmThreads(userDmThreads);
          }
          await syncWorkspaceToFirestore('community', {
            threads: nextThreads,
            meetups: nextMeetups,
            dmThreads: nextDmThreads,
          });

          if (logoutEpochRef.current !== syncEpoch || !isAuthenticatedRef.current) {
            return;
          }

          recordSyncTimestamp();
          setIsFirebaseConnected(true);
          setIsAuthenticated(true);
          try {
            localStorage.setItem(`${LOCAL_STORAGE_KEY}_explicit_auth_v2`, 'true');
          } catch {}
        } catch (error) {
          console.warn('Firestore initial sync notice:', error);
        } finally {
          setIsFirebaseSyncing(false);
        }
      } else {
        setFirebaseUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_registered_accounts`, JSON.stringify(registeredAccounts));
    } catch {}
  }, [registeredAccounts]);

  // Live listener for real-time in-app direct message dispatching across active sessions
  useEffect(() => {
    const handleDmDispatched = (e: Event) => {
      const customEvent = e as CustomEvent;
      const detail = customEvent.detail;
      if (!detail) return;
      if (detail.recipientId === currentUserIdRef.current && isAuthenticatedRef.current) {
        const reloaded = loadUserDmThreads(currentUserIdRef.current, registeredAccountsRef.current);
        const sorted = sortDmThreadsByLatest(reloaded);
        setDmThreads(sorted);

        const isActivelyViewingThisThread =
          currentViewRef.current === 'messages' && activeDmThreadIdRef.current === detail.threadId;

        if (isActivelyViewingThisThread) {
          markThreadAsRead(detail.threadId);
        } else {
          setIncomingNotification(detail.notification);
          if (notificationSoundEnabledRef.current) {
            playNotificationChime();
          }
        }
      }
    };

    window.addEventListener('refirely:dm_dispatched', handleDmDispatched);
    return () => {
      window.removeEventListener('refirely:dm_dispatched', handleDmDispatched);
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_current_user_id`, currentUserId);
    } catch {}
  }, [currentUserId]);

  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_is_authenticated`, JSON.stringify(isAuthenticated));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_explicit_auth_v2`, isAuthenticated ? 'true' : 'false');
    } catch {}
  }, [isAuthenticated]);

  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_countries`, JSON.stringify(countries));
    } catch {}
  }, [countries]);

  useEffect(() => {
    if (!isAuthenticated) return;
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_profile`, JSON.stringify(userProfile));
    } catch {}
  }, [userProfile, isAuthenticated]);

  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_checklist`, JSON.stringify(checklist));
      if (currentUserId && currentUserId !== 'guest') {
        localStorage.setItem(`${LOCAL_STORAGE_KEY}_checklist_${currentUserId}`, JSON.stringify(checklist));
      }
    } catch {}
  }, [checklist, currentUserId]);

  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_threads`, JSON.stringify(threads));
    } catch {}
  }, [threads]);

  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_meetups`, JSON.stringify(meetups));
    } catch {}
  }, [meetups]);

  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_dmThreads`, JSON.stringify(dmThreads));
    } catch {}
  }, [dmThreads]);

  // Handlers
  const navigateToCountry = (id: string) => {
    setActiveCountryId(id);
    setCurrentView('country-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const selectedCountry = countries.find(c => c.id === activeCountryId) || countries[0];

  const updateCountry = (updated: Country) => {
    setCountries(prev => prev.map(c => c.id === updated.id ? updated : c));
  };

  const addCountry = (newCountry: Country) => {
    setCountries(prev => [newCountry, ...prev]);
  };

  const deleteCountry = (id: string) => {
    setCountries(prev => prev.filter(c => c.id !== id));
  };

  // Auth operations: supports login by User ID (id), Username, OR Email Address with strict password verification
  const login = (identifier: string, password?: string) => {
    const cleanInput = identifier.trim().toLowerCase();
    if (!password || !password.trim()) {
      return {
        success: false,
        error: 'Please enter your password to sign in.',
      };
    }

    const account = registeredAccounts.find(
      a =>
        a.email.toLowerCase() === cleanInput ||
        a.id.toLowerCase() === cleanInput ||
        (a.username && a.username.toLowerCase() === cleanInput)
    );

    if (!account) {
      // Also attempt Firebase Email/Password sign-in in the background if it looks like an email
      if (cleanInput.includes('@') && password) {
        signInWithEmailAndPassword(auth, cleanInput, password).catch(() => {});
      }
      return {
        success: false,
        error: `No User ID or email matching "${identifier.trim()}" was found. Please check your User ID or create a new account.`,
      };
    }

    const expectedPassword = account.password || 'password123';
    if (password !== expectedPassword) {
      return {
        success: false,
        error: 'Incorrect password. Please enter the valid password for this account.',
      };
    }

    const isAccountOwnerAdmin =
      account.id === 'usr-ganesh' ||
      account.email.toLowerCase() === 'ganesh.indireddy@gmail.com' ||
      account.profile.role === 'admin';

    // If logging in as Admin or a Google-linked account, prefer any saved Google photo or live auth.currentUser.photoURL over sample Unsplash photos
    let effectiveAvatar = account.profile.avatarUrl || '';
    if (isSampleStockAvatar(effectiveAvatar)) {
      try {
        const storedGooglePhoto =
          localStorage.getItem(`${LOCAL_STORAGE_KEY}_google_photo_${account.email.toLowerCase()}`) ||
          localStorage.getItem(`${LOCAL_STORAGE_KEY}_google_photo_${account.id}`) ||
          (auth.currentUser?.email?.toLowerCase() === account.email.toLowerCase() ? auth.currentUser?.photoURL : '') ||
          '';
        if (storedGooglePhoto) {
          effectiveAvatar = storedGooglePhoto;
        } else if (isAccountOwnerAdmin) {
          effectiveAvatar = '';
        }
      } catch {}
    }

    const restoredProfile: UserProfile = {
      ...account.profile,
      id: account.id,
      avatarUrl: effectiveAvatar,
      role: isAccountOwnerAdmin ? 'admin' : account.profile.role || 'member',
      finances: account.profile.finances || DEFAULT_FINANCIAL_PORTFOLIO,
    };

    setCurrentUserId(account.id);
    currentUserIdRef.current = account.id;
    setUserProfile(restoredProfile);
    userProfileRef.current = restoredProfile;
    setIsAuthenticated(true);
    isAuthenticatedRef.current = true;
    if (isAccountOwnerAdmin) {
      setCurrentView('admin');
      currentViewRef.current = 'admin';
    }

    // Restore per-account checklist & journal if stored
    try {
      localStorage.removeItem(`${LOCAL_STORAGE_KEY}_logged_out_explicitly`);
      const savedChecklist = localStorage.getItem(`${LOCAL_STORAGE_KEY}_checklist_${account.id}`);
      if (savedChecklist) {
        setChecklist(JSON.parse(savedChecklist));
      } else if (account.checklist) {
        setChecklist(account.checklist);
      }
      const savedJournal = localStorage.getItem(`${LOCAL_STORAGE_KEY}_journal_${account.id}`);
      if (savedJournal) {
        setJournalEntries(JSON.parse(savedJournal));
      } else if (account.journalEntries) {
        setJournalEntries(account.journalEntries);
      }
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_current_user_id`, account.id);
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_profile`, JSON.stringify(restoredProfile));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_is_authenticated`, 'true');
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_explicit_auth_v2`, 'true');
    } catch {}

    // Load account-specific DM threads and check for pending notification alerts
    try {
      if (currentUserIdRef.current && currentUserIdRef.current !== 'guest' && currentUserIdRef.current !== account.id) {
        saveUserDmThreads(currentUserIdRef.current, dmThreadsRef.current);
      }
      const userThreads = loadUserDmThreads(account.id, registeredAccountsRef.current);
      setDmThreads(userThreads);
      setActiveDmThreadId(userThreads[0]?.id || null);

      const pendingNotif = popPendingNotificationForUser(account.id);
      if (pendingNotif) {
        setIncomingNotification(pendingNotif);
        if (notificationSoundEnabledRef.current) {
          playNotificationChime();
        }
      }
    } catch (e) {
      console.warn('Notice loading user inbox on signin:', e);
    }

    // If connected to Firebase, persist activeAccountId to Firestore so page refresh keeps this User ID active
    if (auth.currentUser) {
      syncProfileToFirestore(restoredProfile, account.checklist || checklist, account.id);
    }

    return { success: true };
  };

  const signup = (data: {
    customUserId?: string;
    name: string;
    email: string;
    password?: string;
    originCountry?: string;
    residingCountry?: string;
    originCity?: string;
    targetCountry?: string;
    retirementTimelineYear?: number;
    monthlyBudgetUSD?: number;
    preferredClimate?: ClimateCategory | 'Any';
    relocationStatus?: 'Exploring Options' | 'Scouting In-Person' | 'Visa In-Progress' | 'Relocated & Settled' | 'Early Retired (FIRE)';
    occupationOrBackground?: string;
    bio?: string;
    aboutMe?: string;
    avatarUrl?: string;
    interests?: string[];
    languagesKnown?: KnownLanguage[];
    travelHistory?: VisitedCountry[];
  }) => {
    const cleanEmail = data.email.trim().toLowerCase();
    const desiredIdRaw = data.customUserId?.trim()
      ? sanitizeAccountId(data.customUserId.trim())
      : sanitizeAccountId(`usr-${data.name.trim().toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`);

    const existing = registeredAccounts.find(
      a =>
        a.email.toLowerCase() === cleanEmail ||
        a.id.toLowerCase() === desiredIdRaw.toLowerCase() ||
        (a.username && a.username.toLowerCase() === desiredIdRaw.toLowerCase())
    );
    if (existing) {
      return {
        success: false,
        error: `An account with this User ID ("${existing.id}") or email ("${existing.email}") already exists. Please sign in or pick a different User ID.`,
      };
    }

    const newId = desiredIdRaw;
    const newProfile: UserProfile = {
      id: newId,
      name: data.name.trim(),
      email: cleanEmail,
      avatarUrl: data.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
      originCountry: data.originCountry || 'United States',
      residingCountry: data.residingCountry || data.originCountry || 'United States',
      originCity: data.originCity || '',
      targetCountry: data.targetCountry || 'Portugal',
      retirementTimelineYear: data.retirementTimelineYear || 2027,
      monthlyBudgetUSD: data.monthlyBudgetUSD || 2500,
      preferredClimate: data.preferredClimate || 'Mediterranean',
      savedCountryIds: [data.targetCountry?.toLowerCase().replace(/\s+/g, '-') || 'portugal'],
      rsvpMeetupIds: [],
      appliedVisas: [],
      bio: data.bio || `Aspiring retiree heading to ${data.targetCountry || 'abroad'}.`,
      aboutMe: data.aboutMe || '',
      occupationOrBackground: data.occupationOrBackground || 'Retiree',
      relocationStatus: data.relocationStatus || 'Exploring Options',
      finances: {
        ...DEFAULT_FINANCIAL_PORTFOLIO,
        updatedAt: new Date().toISOString().split('T')[0],
      },
      role: 'member',
      languagesKnown: data.languagesKnown || [
        { id: `lang-${Date.now()}`, language: 'English', proficiency: 'Native' },
      ],
      interests: data.interests || [
        'Coastal Living & Beaches',
        'Healthcare & Wellness',
        'Expat Meetups & Socializing',
      ],
      travelHistory: data.travelHistory || [],
    };

    const isCloudReady = Boolean(auth.currentUser);
    const nowIso = new Date().toISOString();

    const newAccount: UserAccount = {
      id: newId,
      username: data.customUserId?.trim() || newId,
      email: cleanEmail,
      password: data.password || 'password123',
      name: data.name.trim(),
      createdAt: nowIso.split('T')[0],
      profile: newProfile,
      checklist: INITIAL_CHECKLIST,
      journalEntries: INITIAL_JOURNAL_ENTRIES,
      cloudSynced: isCloudReady,
      lastSyncedAt: isCloudReady ? nowIso : undefined,
    };

    const nextAccounts = [newAccount, ...registeredAccounts];
    setRegisteredAccounts(nextAccounts);
    registeredAccountsRef.current = nextAccounts;
    setCurrentUserId(newId);
    currentUserIdRef.current = newId;
    setUserProfile(newProfile);
    userProfileRef.current = newProfile;
    setChecklist(INITIAL_CHECKLIST);
    setIsAuthenticated(true);

    try {
      localStorage.removeItem(`${LOCAL_STORAGE_KEY}_logged_out_explicitly`);
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_registered_accounts`, JSON.stringify(nextAccounts));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_current_user_id`, newId);
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_profile`, JSON.stringify(newProfile));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_checklist_${newId}`, JSON.stringify(INITIAL_CHECKLIST));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_is_authenticated`, 'true');
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_explicit_auth_v2`, 'true');
    } catch {}

    // Immediately persist the newly created User ID to Firestore if authenticated!
    if (auth.currentUser) {
      syncProfileToFirestore(newProfile, INITIAL_CHECKLIST, newId);
    } else if (data.password && data.password.length >= 6) {
      // Optionally attempt Firebase Email/Password creation if enabled in Firebase Console
      createUserWithEmailAndPassword(auth, cleanEmail, data.password)
        .then(async () => {
          await syncProfileToFirestore(newProfile, INITIAL_CHECKLIST, newId);
        })
        .catch(() => {
          // Email/password provider not enabled in Firebase Console; account is safely stored in registeredAccounts and will auto-sync on Google connect
        });
    }

    return { success: true, createdUserId: newId };
  };

  const logout = async () => {
    // Save current account snapshot into registeredAccounts before logging out so zero work is ever lost
    if (currentUserId && currentUserId !== 'guest') {
      const activeId = currentUserIdRef.current;
      const latestProfile = userProfileRef.current;
      saveUserDmThreads(activeId, dmThreadsRef.current);
      const updatedAccounts = registeredAccountsRef.current.map(acc =>
        acc.id === activeId
          ? {
              ...acc,
              profile: latestProfile,
              name: latestProfile.name,
              email: latestProfile.email,
              checklist: checklistRef.current,
              journalEntries: journalEntriesRef.current,
            }
          : acc
      );
      registeredAccountsRef.current = updatedAccounts;
      setRegisteredAccounts(updatedAccounts);
      try {
        localStorage.setItem(`${LOCAL_STORAGE_KEY}_registered_accounts`, JSON.stringify(updatedAccounts));
        localStorage.setItem(`${LOCAL_STORAGE_KEY}_profile_${activeId}`, JSON.stringify(latestProfile));
        if (latestProfile.avatarUrl) {
          localStorage.setItem(`${LOCAL_STORAGE_KEY}_avatar_${activeId}`, latestProfile.avatarUrl);
          if (latestProfile.email) {
            localStorage.setItem(`${LOCAL_STORAGE_KEY}_avatar_${latestProfile.email.trim().toLowerCase()}`, latestProfile.avatarUrl);
          }
          if (auth.currentUser?.uid) {
            localStorage.setItem(`${LOCAL_STORAGE_KEY}_avatar_${auth.currentUser.uid}`, latestProfile.avatarUrl);
          }
        }
      } catch {}
    }
    // Increment logout epoch so any in-flight Firestore sync immediately aborts
    logoutEpochRef.current += 1;

    // Immediately clear local storage auth state & active session refs before async Firebase signOut
    setIsAuthenticated(false);
    isAuthenticatedRef.current = false;
    setFirebaseUser(null);
    setCurrentUserId('guest');
    currentUserIdRef.current = 'guest';
    setUserProfile(GUEST_PROFILE);
    userProfileRef.current = GUEST_PROFILE;
    setDmThreads([]);
    dmThreadsRef.current = [];
    setActiveDmThreadId(null);
    activeDmThreadIdRef.current = null;
    setIncomingNotification(null);
    setCurrentView('landing');
    currentViewRef.current = 'landing';
    setAuthModalTab('login');
    setIsAuthModalOpen(true);

    try {
      window.history.pushState({ view: 'landing' }, '', '/');
    } catch {}

    try {
      // IMPORTANT: Never delete _registered_accounts or per-user snapshots on logout!
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_logged_out_explicitly`, 'true');
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_current_user_id`, 'guest');
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_profile`, JSON.stringify(GUEST_PROFILE));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_is_authenticated`, 'false');
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_explicit_auth_v2`, 'false');
    } catch {}

    try {
      if (auth.currentUser) {
        await signOut(auth);
      }
    } catch (e) {
      console.warn('Firebase sign-out notice:', e);
    }
  };

  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      try {
        localStorage.removeItem(`${LOCAL_STORAGE_KEY}_logged_out_explicitly`);
      } catch {}
      setIsFirebaseSyncing(true);
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Pre-fetch user document from Firestore if it exists so custom avatar & profile are instantly resolved
      let firestoreRootData: (UserProfile & { activeAccountId?: string; checklist?: RelocationChecklistTask[] }) | null = null;
      try {
        const docSnap = await getDoc(doc(db, 'users', user.uid));
        if (docSnap.exists()) {
          firestoreRootData = docSnap.data() as any;
        }
      } catch {}

      // Immediately create/resolve the Google user's dedicated User ID (e.g., usr-<gmail-handle>) and profile
      const googleAcc = resolveGoogleAccountForUser(user, registeredAccountsRef.current, firestoreRootData);
      const nextAccounts = [
        googleAcc,
        ...registeredAccountsRef.current.filter(a => a.id !== googleAcc.id && a.id !== 'guest'),
      ];

      setFirebaseUser(user);
      setRegisteredAccounts(nextAccounts);
      registeredAccountsRef.current = nextAccounts;
      setCurrentUserId(googleAcc.id);
      currentUserIdRef.current = googleAcc.id;
      setUserProfile(googleAcc.profile);
      userProfileRef.current = googleAcc.profile;
      setIsAuthenticated(true);
      if (googleAcc.id === 'usr-ganesh' || googleAcc.profile.role === 'admin') {
        setCurrentView('admin');
      }

      try {
        localStorage.setItem(`${LOCAL_STORAGE_KEY}_registered_accounts`, JSON.stringify(nextAccounts));
        localStorage.setItem(`${LOCAL_STORAGE_KEY}_current_user_id`, googleAcc.id);
        localStorage.setItem(`${LOCAL_STORAGE_KEY}_profile`, JSON.stringify(googleAcc.profile));
        localStorage.setItem(`${LOCAL_STORAGE_KEY}_profile_${googleAcc.id}`, JSON.stringify(googleAcc.profile));
        if (googleAcc.profile.avatarUrl) {
          localStorage.setItem(`${LOCAL_STORAGE_KEY}_avatar_${googleAcc.id}`, googleAcc.profile.avatarUrl);
          if (googleAcc.email) {
            localStorage.setItem(`${LOCAL_STORAGE_KEY}_avatar_${googleAcc.email.trim().toLowerCase()}`, googleAcc.profile.avatarUrl);
          }
          localStorage.setItem(`${LOCAL_STORAGE_KEY}_avatar_${user.uid}`, googleAcc.profile.avatarUrl);
        }
        localStorage.setItem(`${LOCAL_STORAGE_KEY}_is_authenticated`, 'true');
        localStorage.setItem(`${LOCAL_STORAGE_KEY}_explicit_auth_v2`, 'true');
      } catch {}

      // Load Google user's DM inbox and pop pending notifications
      try {
        const userThreads = loadUserDmThreads(googleAcc.id, nextAccounts);
        setDmThreads(userThreads);
        setActiveDmThreadId(userThreads[0]?.id || null);

        const pendingNotif = popPendingNotificationForUser(googleAcc.id);
        if (pendingNotif) {
          setIncomingNotification(pendingNotif);
          if (notificationSoundEnabledRef.current) {
            playNotificationChime();
          }
        }
      } catch {}

      return { success: true };
    } catch (err: any) {
      console.error('Google Sign-in error:', err);
      return { success: false, error: err.message || 'Google sign-in was not completed.' };
    } finally {
      setIsFirebaseSyncing(false);
    }
  };

  // Country Journal operations
  const getJournalEntry = (countryId: string): CountryJournalEntry | undefined => {
    return journalEntries[countryId];
  };

  const saveJournalEntry = async (entry: {
    countryId: string;
    countryName: string;
    countryFlag: string;
    interestLevel: InterestLevel;
    privateNotes: string;
    tags?: string[];
    scoutingTimeline?: string;
    personalBudgetEstimateUSD?: number;
    visitedBefore?: boolean;
    isFavorited?: boolean;
  }): Promise<{ success: boolean; error?: string }> => {
    const existing = journalEntries[entry.countryId];
    const now = new Date().toISOString();
    const resolvedBudget = entry.personalBudgetEstimateUSD ?? existing?.personalBudgetEstimateUSD;
    const updatedEntry: CountryJournalEntry = {
      id: entry.countryId,
      userId: auth.currentUser?.uid || userProfile.id,
      countryId: entry.countryId,
      countryName: entry.countryName.slice(0, 100),
      countryFlag: entry.countryFlag,
      interestLevel: entry.interestLevel,
      privateNotes: (entry.privateNotes || '').slice(0, 5000),
      tags: (entry.tags || existing?.tags || []).slice(0, 20),
      scoutingTimeline: (entry.scoutingTimeline || existing?.scoutingTimeline || '').slice(0, 100),
      ...(resolvedBudget !== undefined ? { personalBudgetEstimateUSD: resolvedBudget } : {}),
      visitedBefore: entry.visitedBefore ?? (userProfile.travelHistory?.some(t => t.countryName.toLowerCase() === entry.countryName.toLowerCase()) || false),
      isFavorited: entry.isFavorited ?? userProfile.savedCountryIds.includes(entry.countryId),
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };

    // Immediate local update
    setJournalEntries(prev => {
      const next = {
        ...prev,
        [entry.countryId]: updatedEntry,
      };
      // Also attach to active account in registeredAccounts
      setRegisteredAccounts(accs =>
        accs.map(a => (a.id === currentUserId ? { ...a, journalEntries: next } : a))
      );
      return next;
    });

    // Firestore persistence
    if (auth.currentUser) {
      const safeCountryId = sanitizeAccountId(entry.countryId);
      const docPath = `users/${auth.currentUser.uid}/journalEntries/${safeCountryId}`;
      const journalPayload = {
        ...updatedEntry,
        id: safeCountryId,
        countryId: safeCountryId,
        userId: auth.currentUser.uid,
      };
      try {
        await setDoc(doc(db, 'users', auth.currentUser.uid, 'journalEntries', safeCountryId), journalPayload);
        await setDoc(doc(db, 'countryJournals', safeCountryId), journalPayload);
        recordSyncTimestamp();
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, docPath);
        return { success: false, error: 'Could not sync journal entry to Firestore' };
      }
    }

    return { success: true };
  };

  const deleteJournalEntry = async (countryId: string): Promise<{ success: boolean; error?: string }> => {
    setJournalEntries(prev => {
      const copy = { ...prev };
      delete copy[countryId];
      setRegisteredAccounts(accs =>
        accs.map(a => (a.id === currentUserId ? { ...a, journalEntries: copy } : a))
      );
      return copy;
    });

    if (auth.currentUser) {
      const safeCountryId = sanitizeAccountId(countryId);
      const docPath = `users/${auth.currentUser.uid}/journalEntries/${safeCountryId}`;
      try {
        await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'journalEntries', safeCountryId));
        await deleteDoc(doc(db, 'countryJournals', safeCountryId));
        recordSyncTimestamp();
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, docPath);
        return { success: false, error: 'Could not delete journal entry from Firestore' };
      }
    }

    return { success: true };
  };

  const submitFeedbackReport = async (
    data: Omit<FeedbackReport, 'id' | 'createdAt' | 'status'>
  ): Promise<{ success: boolean; id?: string; error?: string }> => {
    try {
      const newId = `fb-${Date.now()}`;
      const now = new Date().toISOString();
      const newReport: FeedbackReport = {
        ...data,
        id: newId,
        status: 'new',
        createdAt: now,
      };

      setFeedbackReports(prev => [newReport, ...prev]);

      try {
        if (db) {
          const docRef = doc(db, 'feedbackReports', newId);
          await setDoc(docRef, newReport);
        }
      } catch (firestoreErr) {
        console.warn('Firestore feedback submission write failed, kept in local state:', firestoreErr);
      }

      return { success: true, id: newId };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to submit report' };
    }
  };

  const updateFeedbackStatus = async (
    id: string,
    status: FeedbackStatus,
    adminNotes?: string,
    priority?: FeedbackPriority
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const now = new Date().toISOString();
      setFeedbackReports(prev =>
        prev.map(r => {
          if (r.id !== id) return r;
          const updated: FeedbackReport = {
            ...r,
            status,
            updatedAt: now,
            ...(status === 'resolved' && !r.resolvedAt ? { resolvedAt: now } : {}),
            ...(adminNotes !== undefined ? { adminNotes } : {}),
            ...(priority !== undefined ? { priority } : {}),
          };
          return updated;
        })
      );

      try {
        if (db) {
          const docRef = doc(db, 'feedbackReports', id);
          const updatePayload: Record<string, any> = {
            status,
            updatedAt: now,
          };
          if (status === 'resolved') updatePayload.resolvedAt = now;
          if (adminNotes !== undefined) updatePayload.adminNotes = adminNotes;
          if (priority !== undefined) updatePayload.priority = priority;
          await updateDoc(docRef, updatePayload);
        }
      } catch (firestoreErr) {
        console.warn('Firestore updateFeedbackStatus failed:', firestoreErr);
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to update feedback status' };
    }
  };

  const deleteFeedbackReport = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      markFeedbackIdsDeleted([id]);
      setFeedbackReports(prev => {
        const next = prev.filter(r => r.id !== id);
        try {
          localStorage.setItem(`${LOCAL_STORAGE_KEY}_feedback_reports`, JSON.stringify(next));
          localStorage.setItem(`${LOCAL_STORAGE_KEY}_feedback_seeded`, 'true');
        } catch {}
        return next;
      });
      try {
        if (db) {
          const docRef = doc(db, 'feedbackReports', id);
          await deleteDoc(docRef);
        }
      } catch (firestoreErr) {
        console.warn('Firestore deleteFeedbackReport failed:', firestoreErr);
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to delete feedback report' };
    }
  };

  const deleteAllTestFeedbacks = async (): Promise<{ success: boolean; deletedCount: number }> => {
    const sampleIds = new Set(['fb-101', 'fb-102', 'fb-103', 'fb-104', 'fb-105']);
    const testTickets = feedbackReports.filter(
      r => sampleIds.has(r.id) || r.id.startsWith('fb-10') || INITIAL_FEEDBACK_REPORTS.some(i => i.id === r.id)
    );

    if (testTickets.length === 0) {
      return { success: true, deletedCount: 0 };
    }

    const testTicketIds = testTickets.map(r => r.id);
    markFeedbackIdsDeleted(testTicketIds);

    const remainingReports = feedbackReports.filter(r => !testTicketIds.includes(r.id));
    setFeedbackReports(remainingReports);
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_feedback_reports`, JSON.stringify(remainingReports));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_feedback_seeded`, 'true');
    } catch {}

    if (db) {
      for (const id of testTicketIds) {
        try {
          await deleteDoc(doc(db, 'feedbackReports', id));
        } catch {}
      }
    }

    return { success: true, deletedCount: testTicketIds.length };
  };

  const switchAccount = (userId: string) => {
    // Admin user cannot switch into a normal/retiree user view
    const isCurrentlyAdmin =
      currentUserIdRef.current === 'usr-ganesh' ||
      userProfileRef.current.role === 'admin' ||
      userProfileRef.current.email?.toLowerCase() === 'ganesh.indireddy@gmail.com';
    if (isCurrentlyAdmin && userId !== 'usr-ganesh') {
      return;
    }

    const acc = registeredAccounts.find(a => a.id === userId);
    if (acc) {
      const isAccAdmin =
        acc.id === 'usr-ganesh' ||
        acc.email?.toLowerCase() === 'ganesh.indireddy@gmail.com' ||
        acc.profile.role === 'admin';
      const restoredProfile: UserProfile = {
        ...acc.profile,
        id: acc.id,
        role: isAccAdmin ? 'admin' : acc.profile.role || 'member',
        finances: acc.profile.finances || DEFAULT_FINANCIAL_PORTFOLIO,
      };
      setCurrentUserId(acc.id);
      currentUserIdRef.current = acc.id;
      setUserProfile(restoredProfile);
      userProfileRef.current = restoredProfile;
      setIsAuthenticated(true);
      if (isAccAdmin) {
        setCurrentView('admin');
      }

      try {
        const savedChecklist = localStorage.getItem(`${LOCAL_STORAGE_KEY}_checklist_${acc.id}`);
        if (savedChecklist) {
          setChecklist(JSON.parse(savedChecklist));
        } else if (acc.checklist) {
          setChecklist(acc.checklist);
        }
        const savedJournal = localStorage.getItem(`${LOCAL_STORAGE_KEY}_journal_${acc.id}`);
        if (savedJournal) {
          setJournalEntries(JSON.parse(savedJournal));
        } else if (acc.journalEntries) {
          setJournalEntries(acc.journalEntries);
        }
        localStorage.setItem(`${LOCAL_STORAGE_KEY}_current_user_id`, acc.id);
        localStorage.setItem(`${LOCAL_STORAGE_KEY}_profile`, JSON.stringify(restoredProfile));
        localStorage.setItem(`${LOCAL_STORAGE_KEY}_is_authenticated`, 'true');
        localStorage.setItem(`${LOCAL_STORAGE_KEY}_explicit_auth_v2`, 'true');
      } catch {}

      // Load user-scoped direct message inbox & pop any pending cross-account notifications
      try {
        if (currentUserIdRef.current && currentUserIdRef.current !== 'guest' && currentUserIdRef.current !== acc.id) {
          saveUserDmThreads(currentUserIdRef.current, dmThreadsRef.current);
        }
        const userThreads = loadUserDmThreads(acc.id, registeredAccountsRef.current);
        setDmThreads(userThreads);
        setActiveDmThreadId(userThreads[0]?.id || null);

        const pendingNotif = popPendingNotificationForUser(acc.id);
        if (pendingNotif) {
          setIncomingNotification(pendingNotif);
          if (notificationSoundEnabledRef.current) {
            playNotificationChime();
          }
        }
      } catch (e) {
        console.warn('Notice switching user inbox:', e);
      }

      if (auth.currentUser) {
        syncProfileToFirestore(restoredProfile, acc.checklist || checklist, acc.id);
      }
    }
  };

  const deleteUserAccount = async (userId: string): Promise<{ success: boolean; error?: string }> => {
    if (userId === 'usr-ganesh' || userId === 'ganesh.reddy') {
      return { success: false, error: 'Cannot delete the primary Administrator account (Ganesh Reddy).' };
    }
    const targetAccount = registeredAccounts.find(a => a.id === userId);
    if (targetAccount?.email?.toLowerCase() === 'ganesh.indireddy@gmail.com' || targetAccount?.profile?.role === 'admin') {
      return { success: false, error: 'Cannot delete an Administrator account.' };
    }
    if (registeredAccounts.length <= 1) {
      return { success: false, error: 'Cannot delete the only remaining user account.' };
    }

    markUserAccountIdsDeleted([userId]);

    const nextAccounts = registeredAccounts.filter(a => a.id !== userId);
    setRegisteredAccounts(nextAccounts);
    registeredAccountsRef.current = nextAccounts;
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_registered_accounts`, JSON.stringify(nextAccounts));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_accounts_seeded`, 'true');
      localStorage.removeItem(`${LOCAL_STORAGE_KEY}_checklist_${userId}`);
      localStorage.removeItem(`${LOCAL_STORAGE_KEY}_journal_${userId}`);
      localStorage.removeItem(`${LOCAL_STORAGE_KEY}_profile_${userId}`);
      localStorage.removeItem(`${LOCAL_STORAGE_KEY}_avatar_${userId}`);
    } catch {}

    if (currentUserId === userId) {
      const fallback = nextAccounts.find(a => a.id === 'usr-ganesh') || nextAccounts[0];
      switchAccount(fallback.id);
    }

    if (auth.currentUser) {
      const safeId = sanitizeAccountId(userId);
      const docPath = `users/${auth.currentUser.uid}/savedAccounts/${safeId}`;
      try {
        await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'savedAccounts', safeId));
        await deleteDoc(doc(db, 'savedAccounts', safeId));
        if (safeId !== auth.currentUser.uid) {
          await deleteDoc(doc(db, 'users', safeId));
        }
        await deleteDoc(doc(db, 'relocationChecklists', safeId));
        recordSyncTimestamp();
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, docPath);
      }
    }
    return { success: true };
  };

  const deleteAllTestAccounts = async (): Promise<{ success: boolean; deletedCount: number }> => {
    const testAccounts = registeredAccounts.filter(
      acc =>
        acc.id !== 'guest' &&
        acc.id !== 'usr-ganesh' &&
        acc.id !== currentUserId &&
        acc.profile?.role !== 'admin' &&
        acc.email?.toLowerCase() !== 'ganesh.indireddy@gmail.com'
    );

    if (testAccounts.length === 0) {
      return { success: true, deletedCount: 0 };
    }

    const testIds = testAccounts.map(a => a.id);
    markUserAccountIdsDeleted(testIds);

    const remainingAccounts = registeredAccounts.filter(acc => !testIds.includes(acc.id));
    setRegisteredAccounts(remainingAccounts);
    registeredAccountsRef.current = remainingAccounts;
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_registered_accounts`, JSON.stringify(remainingAccounts));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_accounts_seeded`, 'true');
      for (const id of testIds) {
        localStorage.removeItem(`${LOCAL_STORAGE_KEY}_checklist_${id}`);
        localStorage.removeItem(`${LOCAL_STORAGE_KEY}_journal_${id}`);
        localStorage.removeItem(`${LOCAL_STORAGE_KEY}_profile_${id}`);
        localStorage.removeItem(`${LOCAL_STORAGE_KEY}_avatar_${id}`);
      }
    } catch {}

    if (auth.currentUser) {
      for (const id of testIds) {
        const safeId = sanitizeAccountId(id);
        try {
          await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'savedAccounts', safeId));
          await deleteDoc(doc(db, 'savedAccounts', safeId));
          if (safeId !== auth.currentUser.uid) {
            await deleteDoc(doc(db, 'users', safeId));
          }
          await deleteDoc(doc(db, 'relocationChecklists', safeId));
        } catch {}
      }
      recordSyncTimestamp();
    }

    return { success: true, deletedCount: testIds.length };
  };

  const adminUpdateUserAccount = async (updatedAccount: UserAccount): Promise<void> => {
    const safeId = sanitizeAccountId(updatedAccount.id);
    const nowIso = new Date().toISOString();
    const isCloudReady = Boolean(auth.currentUser);
    const normalizedAcc: UserAccount = {
      ...updatedAccount,
      id: safeId,
      name: updatedAccount.name || updatedAccount.profile.name,
      email: updatedAccount.email || updatedAccount.profile.email,
      profile: {
        ...updatedAccount.profile,
        id: safeId,
        name: updatedAccount.name || updatedAccount.profile.name,
        email: updatedAccount.email || updatedAccount.profile.email,
        finances: updatedAccount.profile.finances || DEFAULT_FINANCIAL_PORTFOLIO,
      },
      cloudSynced: isCloudReady ? true : updatedAccount.cloudSynced,
      lastSyncedAt: isCloudReady ? nowIso : updatedAccount.lastSyncedAt,
    };

    setRegisteredAccounts(prev => {
      const exists = prev.some(a => a.id === safeId);
      const next = exists
        ? prev.map(a => (a.id === safeId ? normalizedAcc : a))
        : [normalizedAcc, ...prev];
      registeredAccountsRef.current = next;
      return next;
    });

    if (currentUserIdRef.current === safeId) {
      setUserProfile(normalizedAcc.profile);
      userProfileRef.current = normalizedAcc.profile;
    }

    if (auth.currentUser) {
      await syncSingleAccountToFirestore(normalizedAcc);
    }
  };

  const refreshRegisteredUsersFromCloud = async (): Promise<{ success: boolean; count: number; error?: string }> => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return {
        success: false,
        count: registeredAccountsRef.current.length,
        error: 'Sign in with Google Auth in Cloud DB Center to pull cloud-registered accounts from Firestore.',
      };
    }
    setIsFirebaseSyncing(true);
    try {
      const deletedUserIds = getDeletedUserAccountIds();
      const mergedMap = new Map<string, UserAccount>();
      for (const acc of registeredAccountsRef.current) {
        if (acc.id !== 'guest' && !deletedUserIds.has(acc.id)) {
          mergedMap.set(sanitizeAccountId(acc.id), acc);
        }
      }

      // 1. User's subcollection /users/{uid}/savedAccounts
      const subSnap = await getDocs(collection(db, 'users', currentUser.uid, 'savedAccounts'));
      subSnap.forEach(d => {
        const data = d.data() as any;
        if (data && data.id && data.id !== 'guest' && data.profile) {
          const safeId = sanitizeAccountId(data.id);
          if (deletedUserIds.has(safeId)) {
            return;
          }
          mergedMap.set(safeId, {
            id: safeId,
            username: data.username || safeId,
            email: data.email || data.profile.email || 'member@refirely.org',
            password: data.password || 'password123',
            name: data.name || data.profile.name || 'Retiree Member',
            createdAt: data.createdAt || '2026-01-01',
            profile: {
              ...data.profile,
              id: safeId,
              finances: data.profile.finances || DEFAULT_FINANCIAL_PORTFOLIO,
            },
            checklist: Array.isArray(data.checklist) ? data.checklist : undefined,
            cloudSynced: true,
            lastSyncedAt: data.updatedAt || new Date().toISOString(),
          });
        }
      });

      // 2. Top-level /savedAccounts (if admin has list permissions)
      try {
        const topSnap = await getDocs(collection(db, 'savedAccounts'));
        topSnap.forEach(d => {
          const data = d.data() as any;
          if (data && data.id && data.id !== 'guest' && data.profile) {
            const safeId = sanitizeAccountId(data.id);
            if (deletedUserIds.has(safeId)) {
              return;
            }
            if (!mergedMap.has(safeId)) {
              mergedMap.set(safeId, {
                id: safeId,
                username: data.username || safeId,
                email: data.email || data.profile.email || 'member@refirely.org',
                password: data.password || 'password123',
                name: data.name || data.profile.name || 'Retiree Member',
                createdAt: data.createdAt || '2026-01-01',
                profile: {
                  ...data.profile,
                  id: safeId,
                  finances: data.profile.finances || DEFAULT_FINANCIAL_PORTFOLIO,
                },
                checklist: Array.isArray(data.checklist) ? data.checklist : undefined,
                cloudSynced: true,
                lastSyncedAt: data.updatedAt || new Date().toISOString(),
              });
            }
          }
        });
      } catch {}

      const nextList = Array.from(mergedMap.values()).filter(a => !deletedUserIds.has(a.id));
      setRegisteredAccounts(nextList);
      registeredAccountsRef.current = nextList;
      recordSyncTimestamp();
      return { success: true, count: nextList.length };
    } catch (err: any) {
      return {
        success: false,
        count: registeredAccountsRef.current.length,
        error: err?.message || 'Unable to fetch cloud accounts.',
      };
    } finally {
      setIsFirebaseSyncing(false);
    }
  };

  const toggleRole = () => {
    // Admin user is permanently locked to Admin modules and cannot switch to normal/retiree user
    return;
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUserProfile(prev => {
      // Preserve the active account's custom User ID! Do NOT overwrite it with auth.currentUser.uid
      const activeAccId = currentUserIdRef.current && currentUserIdRef.current !== 'guest'
        ? currentUserIdRef.current
        : (prev.id || auth.currentUser?.uid || DEFAULT_ACCOUNTS[0].id);

      const updated: UserProfile = {
        ...prev,
        ...updates,
        id: activeAccId,
      };

      userProfileRef.current = updated;

      // Synchronously persist profile and dedicated avatar keys to localStorage
      try {
        localStorage.setItem(`${LOCAL_STORAGE_KEY}_profile`, JSON.stringify(updated));
        localStorage.setItem(`${LOCAL_STORAGE_KEY}_profile_${activeAccId}`, JSON.stringify(updated));
        if (updated.avatarUrl) {
          localStorage.setItem(`${LOCAL_STORAGE_KEY}_avatar_${activeAccId}`, updated.avatarUrl);
          if (updated.email) {
            localStorage.setItem(`${LOCAL_STORAGE_KEY}_avatar_${updated.email.trim().toLowerCase()}`, updated.avatarUrl);
          }
          if (auth.currentUser?.uid) {
            localStorage.setItem(`${LOCAL_STORAGE_KEY}_avatar_${auth.currentUser.uid}`, updated.avatarUrl);
          }
        }
      } catch {}

      const isCloudReady = Boolean(auth.currentUser);
      const nowIso = new Date().toISOString();

      setRegisteredAccounts(prevAccounts => {
        const exists = prevAccounts.some(acc => acc.id === activeAccId);
        const next = exists
          ? prevAccounts.map(acc =>
              acc.id === activeAccId
                ? {
                    ...acc,
                    id: activeAccId,
                    profile: updated,
                    name: updated.name,
                    email: updated.email,
                    cloudSynced: isCloudReady ? true : acc.cloudSynced,
                    lastSyncedAt: isCloudReady ? nowIso : acc.lastSyncedAt,
                  }
                : acc
            )
          : [
              {
                id: activeAccId,
                username: activeAccId,
                email: updated.email,
                name: updated.name,
                createdAt: nowIso.split('T')[0],
                profile: updated,
                checklist: checklistRef.current,
                cloudSynced: isCloudReady,
                lastSyncedAt: isCloudReady ? nowIso : undefined,
              },
              ...prevAccounts,
            ];

        registeredAccountsRef.current = next;
        try {
          localStorage.setItem(`${LOCAL_STORAGE_KEY}_registered_accounts`, JSON.stringify(next));
        } catch {}
        return next;
      });

      // If signed into Firebase, update both root user doc and /users/{uid}/savedAccounts/{activeAccId}
      if (auth.currentUser) {
        syncProfileToFirestore(updated, checklistRef.current, activeAccId);
      }

      return updated;
    });
  };

  const updateFinances = (financesUpdate: Partial<UserFinancialPortfolio>) => {
    setUserProfile(prev => {
      const existingFinances = prev.finances || DEFAULT_FINANCIAL_PORTFOLIO;
      const updatedSalary = financesUpdate.currentSalaryUSD !== undefined
        ? financesUpdate.currentSalaryUSD
        : existingFinances.currentSalaryUSD;

      const updatedMonthly = financesUpdate.monthlySalaryUSD !== undefined
        ? financesUpdate.monthlySalaryUSD
        : (financesUpdate.currentSalaryUSD !== undefined
            ? Math.round(financesUpdate.currentSalaryUSD / 12)
            : existingFinances.monthlySalaryUSD);

      const updatedFinances: UserFinancialPortfolio = {
        ...existingFinances,
        ...financesUpdate,
        currentSalaryUSD: updatedSalary,
        monthlySalaryUSD: updatedMonthly,
        investments: {
          ...existingFinances.investments,
          ...(financesUpdate.investments || {}),
        },
        updatedAt: new Date().toISOString().split('T')[0],
      };

      const nextProfile: UserProfile = {
        ...prev,
        finances: updatedFinances,
      };

      updateUserProfile(nextProfile);
      return nextProfile;
    });
  };

  // Travel History Actions
  const addVisitedCountry = (entry: Omit<VisitedCountry, 'id'>) => {
    const newEntry: VisitedCountry = {
      ...entry,
      id: `travel-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    updateUserProfile({
      travelHistory: [newEntry, ...(userProfile.travelHistory || [])],
    });
  };

  const updateVisitedCountry = (id: string, entry: Partial<VisitedCountry>) => {
    const updated = (userProfile.travelHistory || []).map(item =>
      item.id === id ? { ...item, ...entry } : item
    );
    updateUserProfile({ travelHistory: updated });
  };

  const removeVisitedCountry = (id: string) => {
    const updated = (userProfile.travelHistory || []).filter(item => item.id !== id);
    updateUserProfile({ travelHistory: updated });
  };

  // Language Actions
  const addLanguage = (entry: Omit<KnownLanguage, 'id'>) => {
    const existing = (userProfile.languagesKnown || []).find(
      l => l.language.toLowerCase() === entry.language.toLowerCase()
    );
    if (existing) {
      const updated = (userProfile.languagesKnown || []).map(l =>
        l.id === existing.id ? { ...l, proficiency: entry.proficiency } : l
      );
      updateUserProfile({ languagesKnown: updated });
      return;
    }

    const newLang: KnownLanguage = {
      ...entry,
      id: `lang-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    updateUserProfile({
      languagesKnown: [...(userProfile.languagesKnown || []), newLang],
    });
  };

  const removeLanguage = (id: string) => {
    const updated = (userProfile.languagesKnown || []).filter(l => l.id !== id);
    updateUserProfile({ languagesKnown: updated });
  };

  // Interest Actions
  const toggleInterest = (interest: string) => {
    const current = userProfile.interests || [];
    const exists = current.includes(interest);
    const updated = exists ? current.filter(i => i !== interest) : [...current, interest];
    updateUserProfile({ interests: updated });
  };

  const toggleSaveCountry = (id: string) => {
    const exists = userProfile.savedCountryIds.includes(id);
    const nextSaved = exists
      ? userProfile.savedCountryIds.filter(cid => cid !== id)
      : [...userProfile.savedCountryIds, id];
    updateUserProfile({ savedCountryIds: nextSaved });
  };

  const isCountrySaved = (id: string) => userProfile.savedCountryIds.includes(id);

  const ignoredCountryIds = userProfile.ignoredCountryIds || [];

  const toggleIgnoreCountry = (id: string) => {
    const current = userProfile.ignoredCountryIds || [];
    const exists = current.includes(id);
    const nextIgnored = exists
      ? current.filter(cid => cid !== id)
      : [...current, id];
    updateUserProfile({ ignoredCountryIds: nextIgnored });
  };

  const isCountryIgnored = (id: string) => (userProfile.ignoredCountryIds || []).includes(id);

  const restoreCountry = (id: string) => {
    const current = userProfile.ignoredCountryIds || [];
    const nextIgnored = current.filter(cid => cid !== id);
    updateUserProfile({ ignoredCountryIds: nextIgnored });
  };

  const toggleCompareCountry = (id: string) => {
    setComparedCountryIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(cid => cid !== id);
      }
      if (prev.length >= 4) {
        // limit to 4 countries max for clean layout
        return [...prev.slice(1), id];
      }
      return [...prev, id];
    });
  };

  const replaceCompareCountry = (oldId: string, newId: string) => {
    setComparedCountryIds(prev => {
      if (oldId === newId) return prev;
      // If newId is already in the list, swap their positions
      const oldIdx = prev.indexOf(oldId);
      const newIdx = prev.indexOf(newId);
      if (oldIdx === -1) return prev;
      const next = [...prev];
      if (newIdx !== -1) {
        next[oldIdx] = newId;
        next[newIdx] = oldId;
        return next;
      }
      next[oldIdx] = newId;
      return next;
    });
  };

  const isCountryCompared = (id: string) => comparedCountryIds.includes(id);

  const clearComparedCountries = () => setComparedCountryIds([]);

  const toggleChecklistTask = (id: string) => {
    setChecklist(prev => {
      const nextChecklist = prev.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      );
      setRegisteredAccounts(accs =>
        accs.map(a => (a.id === currentUserId ? { ...a, checklist: nextChecklist } : a))
      );
      if (auth.currentUser) {
        syncProfileToFirestore(userProfile, nextChecklist, currentUserId);
      }
      return nextChecklist;
    });
  };

  const addChecklistTask = (task: Omit<RelocationChecklistTask, 'id' | 'completed'>) => {
    const newTask: RelocationChecklistTask = {
      ...task,
      id: `task-${Date.now()}`,
      completed: false,
    };
    setChecklist(prev => {
      const nextChecklist = [newTask, ...prev];
      setRegisteredAccounts(accs =>
        accs.map(a => (a.id === currentUserId ? { ...a, checklist: nextChecklist } : a))
      );
      if (auth.currentUser) {
        syncProfileToFirestore(userProfile, nextChecklist, currentUserId);
      }
      return nextChecklist;
    });
  };

  const toggleRsvpMeetup = (meetupId: string) => {
    setMeetups(prev => prev.map(m => {
      if (m.id === meetupId) {
        const nextRsvped = !m.isRsvped;
        return {
          ...m,
          isRsvped: nextRsvped,
          attendeesCount: nextRsvped ? m.attendeesCount + 1 : Math.max(0, m.attendeesCount - 1),
        };
      }
      return m;
    }));

    const exists = userProfile.rsvpMeetupIds.includes(meetupId);
    const nextRsvps = exists
      ? userProfile.rsvpMeetupIds.filter(id => id !== meetupId)
      : [...userProfile.rsvpMeetupIds, meetupId];
    updateUserProfile({ rsvpMeetupIds: nextRsvps });
    if (auth.currentUser) {
      setTimeout(() => {
        syncWorkspaceToFirestore('community', {
          threads: threadsRef.current,
          meetups: meetupsRef.current,
          dmThreads: dmThreadsRef.current,
        });
      }, 50);
    }
  };

  const addMeetup = (meetupData: Omit<ExpatMeetup, 'id' | 'attendeesCount' | 'isRsvped'>) => {
    const newMeetup: ExpatMeetup = {
      ...meetupData,
      id: `meetup-${Date.now()}`,
      attendeesCount: 1,
      isRsvped: true,
    };
    setMeetups(prev => {
      const next = [newMeetup, ...prev];
      if (auth.currentUser) {
        syncWorkspaceToFirestore('community', {
          threads: threadsRef.current,
          meetups: next,
          dmThreads: dmThreadsRef.current,
        });
      }
      return next;
    });
    updateUserProfile({
      rsvpMeetupIds: [...userProfile.rsvpMeetupIds, newMeetup.id],
    });
  };

  const addThread = (threadData: Omit<CommunityThread, 'id' | 'createdAt' | 'upvotes' | 'comments'>) => {
    const newThread: CommunityThread = {
      ...threadData,
      id: `thread-${Date.now()}`,
      createdAt: 'Just now',
      upvotes: 1,
      hasUpvoted: true,
      comments: [],
    };
    setThreads(prev => {
      const next = [newThread, ...prev];
      if (auth.currentUser) {
        syncWorkspaceToFirestore('community', {
          threads: next,
          meetups: meetupsRef.current,
          dmThreads: dmThreadsRef.current,
        });
      }
      return next;
    });
  };

  const addComment = (threadId: string, text: string) => {
    if (!text.trim()) return;
    const newComment = {
      id: `c-${Date.now()}`,
      authorName: userProfile.name,
      authorLocation: `Prospective expat (${userProfile.targetCountry})`,
      authorAvatar: userProfile.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
      text: text.trim(),
      createdAt: 'Just now',
    };
    setThreads(prev => {
      const next = prev.map(t => {
        if (t.id === threadId) {
          return {
            ...t,
            comments: [...t.comments, newComment],
          };
        }
        return t;
      });
      if (auth.currentUser) {
        syncWorkspaceToFirestore('community', {
          threads: next,
          meetups: meetupsRef.current,
          dmThreads: dmThreadsRef.current,
        });
      }
      return next;
    });
  };

  const toggleUpvoteThread = (threadId: string) => {
    setThreads(prev => {
      const next = prev.map(t => {
        if (t.id === threadId) {
          const hasUpvoted = t.hasUpvoted;
          return {
            ...t,
            hasUpvoted: !hasUpvoted,
            upvotes: hasUpvoted ? t.upvotes - 1 : t.upvotes + 1,
          };
        }
        return t;
      });
      if (auth.currentUser) {
        syncWorkspaceToFirestore('community', {
          threads: next,
          meetups: meetupsRef.current,
          dmThreads: dmThreadsRef.current,
        });
      }
      return next;
    });
  };

  const deleteThread = (threadId: string) => {
    setThreads(prev => {
      const next = prev.filter(t => t.id !== threadId);
      if (auth.currentUser) {
        syncWorkspaceToFirestore('community', {
          threads: next,
          meetups: meetupsRef.current,
          dmThreads: dmThreadsRef.current,
        });
      }
      return next;
    });
  };

  const togglePinThread = (threadId: string) => {
    setThreads(prev => {
      const next = prev.map(t => (t.id === threadId ? { ...t, isPinned: !t.isPinned } : t));
      if (auth.currentUser) {
        syncWorkspaceToFirestore('community', {
          threads: next,
          meetups: meetupsRef.current,
          dmThreads: dmThreadsRef.current,
        });
      }
      return next;
    });
  };

  const deleteMeetup = (meetupId: string) => {
    setMeetups(prev => {
      const next = prev.filter(m => m.id !== meetupId);
      if (auth.currentUser) {
        syncWorkspaceToFirestore('community', {
          threads: threadsRef.current,
          meetups: next,
          dmThreads: dmThreadsRef.current,
        });
      }
      return next;
    });
  };

  const markThreadAsRead = (threadId: string) => {
    setDmThreads(prev => {
      const hasUnread = prev.some(t => t.id === threadId && (t.unreadCount || 0) > 0);
      if (!hasUnread) return prev;
      const next = prev.map(t => (t.id === threadId ? { ...t, unreadCount: 0 } : t));
      try {
        localStorage.setItem(`${LOCAL_STORAGE_KEY}_dmThreads`, JSON.stringify(next));
      } catch {}
      if (auth.currentUser) {
        syncWorkspaceToFirestore('community', {
          threads: threadsRef.current,
          meetups: meetupsRef.current,
          dmThreads: next,
        });
      }
      return next;
    });
    setIncomingNotification(prev => (prev?.threadId === threadId ? null : prev));
  };

  const markAllThreadsAsRead = () => {
    setDmThreads(prev => {
      const next = prev.map(t => ({ ...t, unreadCount: 0 }));
      try {
        localStorage.setItem(`${LOCAL_STORAGE_KEY}_dmThreads`, JSON.stringify(next));
      } catch {}
      if (auth.currentUser) {
        syncWorkspaceToFirestore('community', {
          threads: threadsRef.current,
          meetups: meetupsRef.current,
          dmThreads: next,
        });
      }
      return next;
    });
    setIncomingNotification(null);
  };

  const triggerSimulatedPeerReply = (threadId: string, customText?: string) => {
    if (!isAuthenticatedRef.current || currentUserIdRef.current === 'guest') {
      return;
    }
    const thread = dmThreadsRef.current.find(t => t.id === threadId);
    if (!thread) return;

    const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const defaultReplies = [
      `Thanks for reaching out! Living in ${thread.peerCountry} has been wonderful for our retirement lifestyle. Happy to share what daily living expenses and healthcare look like!`,
      `That's a great question. You will definitely want to double-check local municipality requirements as they can vary slightly by region in ${thread.peerCountry}.`,
      `Yes, absolutely! The healthcare here in ${thread.peerCity} has been prompt and very affordable. I can share some tips on finding English-speaking clinics.`,
      `Feel free to ask anytime! If you're attending any of the upcoming expat meetups, we can also chat in person over coffee.`,
      `If you plan a scouting trip to ${thread.peerCity}, I'd be glad to recommend some safe, walkable neighborhoods with great transit access.`
    ];
    const text = customText || defaultReplies[Math.floor(Math.random() * defaultReplies.length)];

    const isActivelyViewingThisThread =
      currentViewRef.current === 'messages' && activeDmThreadIdRef.current === threadId;

    const peerMsg = {
      id: `m-${Date.now() + Math.floor(Math.random() * 100)}`,
      sender: 'peer' as const,
      text,
      timestamp: replyTime,
    };

    setDmThreads(prev => {
      const activeIdx = prev.findIndex(t => t.id === threadId);
      let targetThread = activeIdx >= 0 ? prev[activeIdx] : null;
      if (!targetThread) return prev;

      targetThread = {
        ...targetThread,
        lastMessage: text,
        lastMessageTime: replyTime,
        lastActivityAt: new Date().toISOString(),
        unreadCount: isActivelyViewingThisThread ? 0 : (targetThread.unreadCount || 0) + 1,
        messages: [...targetThread.messages, peerMsg],
      };

      const otherThreads = prev.filter(t => t.id !== threadId);
      const next = sortDmThreadsByLatest([targetThread, ...otherThreads]);
      saveUserDmThreads(currentUserIdRef.current, next);
      if (auth.currentUser) {
        syncWorkspaceToFirestore('community', {
          threads: threadsRef.current,
          meetups: meetupsRef.current,
          dmThreads: next,
        });
      }
      return next;
    });

    // Notify user with chime & floating toast banner if not actively looking at this thread on the messages view
    if (!isActivelyViewingThisThread) {
      if (notificationSoundEnabledRef.current) {
        playNotificationChime();
      }
      setIncomingNotification({
        id: `notif-${Date.now()}`,
        threadId,
        peerName: thread.peerName,
        peerAvatar: thread.peerAvatar,
        peerCountry: thread.peerCountry,
        peerCity: thread.peerCity,
        text,
        timestamp: replyTime,
      });
    }
  };

  const simulateIncomingPeerMessage = (targetThreadId?: string, customText?: string) => {
    const thread = targetThreadId
      ? dmThreadsRef.current.find(t => t.id === targetThreadId)
      : (activeDmThreadIdRef.current ? dmThreadsRef.current.find(t => t.id === activeDmThreadIdRef.current) : dmThreadsRef.current[0]);
    if (!thread) return;
    triggerSimulatedPeerReply(thread.id, customText);
  };

  const openChatThread = (threadId: string) => {
    if (!isAuthenticatedRef.current || currentUserIdRef.current === 'guest') {
      openAuthModal('login');
      return;
    }
    const reloaded = loadUserDmThreads(currentUserIdRef.current, registeredAccountsRef.current);
    const sorted = sortDmThreadsByLatest(reloaded);
    setDmThreads(sorted);
    setActiveDmThreadId(threadId);
    markThreadAsRead(threadId);
    setCurrentView('messages');
    setIncomingNotification(null);
  };

  const sendMessage = (threadId: string, text: string) => {
    if (!isAuthenticatedRef.current || currentUserIdRef.current === 'guest') {
      console.warn('Blocked: Cannot send direct message when unauthenticated.');
      openAuthModal('login');
      return;
    }
    if (!text.trim()) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const activeThread = dmThreadsRef.current.find(t => t.id === threadId);
    const recipientUserId = activeThread?.peerUserId;
    const recipientName = activeThread?.peerName || 'Expat Member';

    const userMsg = {
      id: `m-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      sender: 'user' as const,
      senderUserId: currentUserIdRef.current,
      senderName: userProfileRef.current.name,
      recipientUserId: recipientUserId,
      recipientName: recipientName,
      text: text.trim(),
      timestamp: timeStr,
      createdAt: now.toISOString(),
      read: true,
    };

    setDmThreads(prev => {
      const activeIdx = prev.findIndex(t => t.id === threadId);
      let targetThread = activeIdx >= 0 ? prev[activeIdx] : null;
      if (!targetThread) return prev;

      targetThread = {
        ...targetThread,
        lastMessage: userMsg.text,
        lastMessageTime: timeStr,
        lastActivityAt: now.toISOString(),
        messages: [...targetThread.messages, userMsg],
      };

      const otherThreads = prev.filter(t => t.id !== threadId);
      const next = sortDmThreadsByLatest([targetThread, ...otherThreads]);
      saveUserDmThreads(currentUserIdRef.current, next);
      if (auth.currentUser) {
        syncWorkspaceToFirestore('community', {
          threads: threadsRef.current,
          meetups: meetupsRef.current,
          dmThreads: next,
        });
      }
      return next;
    });

    // Cross-user dispatch to recipient's inbox and pending alert queue:
    if (recipientUserId && recipientUserId !== currentUserIdRef.current && recipientUserId !== 'guest') {
      dispatchMessageToRecipient(
        currentUserIdRef.current,
        userProfileRef.current.name,
        userProfileRef.current.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
        userProfileRef.current.residingCountry || userProfileRef.current.targetCountry || userProfileRef.current.originCountry || 'Portugal',
        userProfileRef.current.originCity || 'Expat Hub',
        recipientUserId,
        text.trim(),
        registeredAccountsRef.current
      );
    }

    // NOTE: Simulated peer auto-replies are OFF by default to keep real messaging authentic!
    // They only fire if the user has explicitly enabled "Simulated Peer Auto-Replies" in the messenger testing controls:
    if (enablePeerAutoRepliesRef.current) {
      setTimeout(() => {
        triggerSimulatedPeerReply(threadId);
      }, 1200);
    }
  };

  const startDmWithPeer = (
    peerName: string,
    peerCountry: string,
    peerCity: string,
    initialNote?: string,
    peerOptions?: {
      peerAvatar?: string;
      peerStatus?: string;
      peerUserId?: string;
      stayOnCurrentView?: boolean;
    }
  ): string => {
    if (!isAuthenticatedRef.current || currentUserIdRef.current === 'guest') {
      openAuthModal('login');
      return '';
    }
    const cleanPeerName = peerName.trim();
    const matchedMember = registeredAccountsRef.current.find(
      acc =>
        (peerOptions?.peerUserId && acc.id === peerOptions.peerUserId) ||
        acc.profile.name.toLowerCase() === cleanPeerName.toLowerCase() ||
        acc.name.toLowerCase() === cleanPeerName.toLowerCase()
    );

    const targetPeerId = peerOptions?.peerUserId || matchedMember?.id;

    // Enforce DM initiation rule: Only Admin can initiate a direct message with a normal user, and NOT vice versa.
    const isCurrentUserAdmin =
      currentUserIdRef.current === 'usr-ganesh' ||
      userProfileRef.current.role === 'admin' ||
      userProfileRef.current.email?.toLowerCase() === 'ganesh.indireddy@gmail.com';
    const isTargetPeerAdmin =
      targetPeerId === 'usr-ganesh' ||
      matchedMember?.id === 'usr-ganesh' ||
      matchedMember?.profile.role === 'admin' ||
      matchedMember?.email?.toLowerCase() === 'ganesh.indireddy@gmail.com' ||
      cleanPeerName.toLowerCase().includes('ganesh');

    if (!isCurrentUserAdmin && isTargetPeerAdmin) {
      console.warn('Blocked: Normal users cannot initiate a direct message with an Administrator.');
      return '';
    }

    const resolvedPeerName = matchedMember?.profile.name || matchedMember?.name || cleanPeerName;
    const resolvedAvatar =
      peerOptions?.peerAvatar ||
      matchedMember?.profile.avatarUrl ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80';
    const resolvedCountry =
      peerCountry ||
      matchedMember?.profile.residingCountry ||
      matchedMember?.profile.targetCountry ||
      matchedMember?.profile.originCountry ||
      'Portugal';
    const resolvedCity =
      peerCity ||
      matchedMember?.profile.originCity ||
      matchedMember?.profile.residingCountry ||
      resolvedCountry;
    const resolvedStatus =
      peerOptions?.peerStatus ||
      matchedMember?.profile.relocationStatus ||
      'Expat Community Member';

    // Check if thread already exists by peerUserId or exact peerName
    const existingIndex = dmThreadsRef.current.findIndex(
      t =>
        (targetPeerId && t.peerUserId === targetPeerId) ||
        t.peerName.toLowerCase() === cleanPeerName.toLowerCase()
    );

    if (existingIndex >= 0) {
      const existing = dmThreadsRef.current[existingIndex];
      // Update existing thread with latest authentic peer details
      const updatedExisting: DirectMessageThread = {
        ...existing,
        peerUserId: targetPeerId || existing.peerUserId,
        peerName: resolvedPeerName,
        peerAvatar: resolvedAvatar,
        peerCountry: resolvedCountry,
        peerCity: resolvedCity,
        peerStatus: resolvedStatus,
      };

      const nextThreads = [
        updatedExisting,
        ...dmThreadsRef.current.filter((_, idx) => idx !== existingIndex),
      ];

      setDmThreads(nextThreads);
      saveUserDmThreads(currentUserIdRef.current, nextThreads);
      setActiveDmThreadId(updatedExisting.id);

      if (initialNote && initialNote.trim()) {
        sendMessage(updatedExisting.id, initialNote.trim());
      }
      if (!peerOptions?.stayOnCurrentView) {
        setSelectedPublicProfileId(null);
        setCurrentView('messages');
      }
      return updatedExisting.id;
    }

    const newId = targetPeerId ? `dm-${targetPeerId}` : `dm-${Date.now()}`;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newThread: DirectMessageThread = {
      id: newId,
      peerUserId: targetPeerId,
      peerName: resolvedPeerName,
      peerAvatar: resolvedAvatar,
      peerCountry: resolvedCountry,
      peerCity: resolvedCity,
      peerStatus: resolvedStatus,
      lastMessage: initialNote?.trim() || 'Connected via Expat Member Profile',
      lastMessageTime: initialNote?.trim() ? nowTime : 'Just now',
      unreadCount: 0,
      messages: initialNote?.trim()
        ? [
            {
              id: `m-${Date.now()}`,
              sender: 'user',
              senderUserId: currentUserIdRef.current,
              senderName: userProfileRef.current.name,
              recipientUserId: targetPeerId,
              recipientName: resolvedPeerName,
              text: initialNote.trim(),
              timestamp: nowTime,
              createdAt: new Date().toISOString(),
              read: true,
            },
          ]
        : [],
    };

    const nextThreads = [newThread, ...dmThreadsRef.current];
    setDmThreads(nextThreads);
    saveUserDmThreads(currentUserIdRef.current, nextThreads);
    setActiveDmThreadId(newId);

    // If initial note, dispatch to recipient
    if (initialNote?.trim() && targetPeerId && targetPeerId !== currentUserIdRef.current) {
      dispatchMessageToRecipient(
        currentUserIdRef.current,
        userProfileRef.current.name,
        userProfileRef.current.avatarUrl || resolvedAvatar,
        userProfileRef.current.residingCountry || 'Portugal',
        userProfileRef.current.originCity || 'Expat Hub',
        targetPeerId,
        initialNote.trim(),
        registeredAccountsRef.current
      );
    }

    if (initialNote?.trim() && enablePeerAutoRepliesRef.current) {
      setTimeout(() => {
        const welcomeReply = `Hi ${userProfileRef.current.name.split(' ')[0] || 'there'}! Great to connect with you on ReFIREly. Happy to chat about ${resolvedCountry} or share tips from my travels!`;
        triggerSimulatedPeerReply(newId, welcomeReply);
      }, 1100);
    }

    if (!peerOptions?.stayOnCurrentView) {
      setSelectedPublicProfileId(null);
      setCurrentView('messages');
    }
    return newId;
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedRegion('All');
    setBudgetMax(3500);
    setSelectedClimate('All');
    setVisaDifficultyMax(5);
    setVisaIncomeMax(3500);
    setSortBy('recommended');
  };

  // Filter and sort countries
  const filteredCountries = countries.filter(c => {
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const match =
        c.name.toLowerCase().includes(q) ||
        c.capital.toLowerCase().includes(q) ||
        c.region.toLowerCase().includes(q) ||
        c.tagline.toLowerCase().includes(q) ||
        c.overview.toLowerCase().includes(q) ||
        c.climate.category.toLowerCase().includes(q) ||
        c.climate.bestMonths.toLowerCase().includes(q) ||
        c.visa.retirementVisaName.toLowerCase().includes(q) ||
        c.visa.pathwayToPR.toLowerCase().includes(q) ||
        c.visa.taxStatus.toLowerCase().includes(q) ||
        c.visa.keyRequirements.some(req => req.toLowerCase().includes(q)) ||
        c.topCities.some(tc => tc.name.toLowerCase().includes(q) || tc.vibe.toLowerCase().includes(q));
      if (!match) return false;
    }

    if (!matchesContinentFilter(c, selectedRegion)) {
      return false;
    }

    if (budgetMax < 3500 && c.costOfLiving.monthlyBudgetSingleUSD > budgetMax) {
      return false;
    }

    if (selectedClimate !== 'All' && c.climate.category !== selectedClimate) {
      return false;
    }

    if (c.visa.difficultyRating > visaDifficultyMax) {
      return false;
    }

    if (visaIncomeMax < 3500 && c.visa.minimumIncomeUSD > visaIncomeMax) {
      return false;
    }

    return true;
  }).sort((a, b) => {
    if (sortBy === 'alpha-asc') {
      return a.name.localeCompare(b.name);
    }
    if (sortBy === 'alpha-desc') {
      return b.name.localeCompare(a.name);
    }
    if (sortBy === 'budget-asc') {
      return a.costOfLiving.monthlyBudgetSingleUSD - b.costOfLiving.monthlyBudgetSingleUSD;
    }
    if (sortBy === 'healthcare-desc') {
      return b.lifestyle.healthcareScore - a.lifestyle.healthcareScore;
    }
    if (sortBy === 'travel-leisure-desc') {
      const scoreA = getCountryTravelLeisureScore(a);
      const scoreB = getCountryTravelLeisureScore(b);
      if (scoreB !== scoreA) return scoreB - scoreA;
      // Tie-breaker: safety score + walkability
      return (b.lifestyle.safetyScore + b.lifestyle.walkabilityScore) - (a.lifestyle.safetyScore + a.lifestyle.walkabilityScore);
    }
    if (sortBy === 'sunny-desc') {
      return b.climate.annualSunnyDays - a.climate.annualSunnyDays;
    }
    if (sortBy === 'safety-desc') {
      return b.lifestyle.safetyScore - a.lifestyle.safetyScore;
    }
    if (sortBy === 'visa-difficulty-asc') {
      return a.visa.difficultyRating - b.visa.difficultyRating;
    }
    if (sortBy === 'visa-income-asc') {
      return a.visa.minimumIncomeUSD - b.visa.minimumIncomeUSD;
    }
    if (sortBy === 'female-ratio-desc') {
      return (b.demographics.femalesPer100Males || 100) - (a.demographics.femalesPer100Males || 100);
    }
    if (sortBy === 'dating-nightlife-desc') {
      const scoreA = (a.demographics.datingRating || 0) + (a.adultEntertainment.nightlifeScore || 0);
      const scoreB = (b.demographics.datingRating || 0) + (b.adultEntertainment.nightlifeScore || 0);
      if (scoreB !== scoreA) return scoreB - scoreA;
      const adultDiff = (b.adultEntertainment.adultEntertainmentScore || 0) - (a.adultEntertainment.adultEntertainmentScore || 0);
      if (adultDiff !== 0) return adultDiff;
      return (b.demographics.youngPopulationPercent || 0) - (a.demographics.youngPopulationPercent || 0);
    }
    return 0; // Default recommended
  });

  const isOwnerAdmin = Boolean(
    isAuthenticated &&
      (userProfile.role === 'admin' ||
        currentUserId === 'usr-ganesh' ||
        userProfile.email?.toLowerCase() === 'ganesh.indireddy@gmail.com' ||
        firebaseUser?.email?.toLowerCase() === 'ganesh.indireddy@gmail.com')
  );

  // Enforce role-based view guards:
  // 1. If not Admin (or after logout), never stay on 'admin' view.
  // 2. If Admin tries to open normal user's 'dashboard', route to 'admin' instead.
  useEffect(() => {
    if (!isOwnerAdmin && currentView === 'admin') {
      setCurrentView('landing');
    } else if (isOwnerAdmin && currentView === 'dashboard') {
      setCurrentView('admin');
    }
  }, [isOwnerAdmin, currentView]);

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        activeCountryId,
        setActiveCountryId,
        navigateToCountry,
        countries,
        selectedCountry,
        updateCountry,
        addCountry,
        deleteCountry,
        isAuthenticated,
        currentUserId,
        registeredAccounts,
        login,
        signup,
        logout,
        switchAccount,
        deleteUserAccount,
        deleteAllTestAccounts,
        adminUpdateUserAccount,
        refreshRegisteredUsersFromCloud,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalTab,
        setAuthModalTab,
        openAuthModal,
        isFirebaseModalOpen,
        setIsFirebaseModalOpen,
        openFirebaseModal,
        isEditProfileOpen,
        setIsEditProfileOpen,
        editProfileInitialTab,
        setEditProfileInitialTab,
        openEditProfile,
        publicMemberAccounts,
        selectedPublicProfileId,
        openPublicProfile,
        closePublicProfile,
        userProfile,
        setUserProfile,
        isOwnerAdmin,
        toggleRole,
        updateUserProfile,
        updateFinances,
        addVisitedCountry,
        updateVisitedCountry,
        removeVisitedCountry,
        addLanguage,
        removeLanguage,
        toggleInterest,
        searchQuery,
        setSearchQuery,
        selectedRegion,
        setSelectedRegion,
        budgetMax,
        setBudgetMax,
        selectedClimate,
        setSelectedClimate,
        visaDifficultyMax,
        setVisaDifficultyMax,
        visaIncomeMax,
        setVisaIncomeMax,
        discreetLifestyleEnabled,
        setDiscreetLifestyleEnabled,
        sortBy,
        setSortBy,
        resetFilters,
        filteredCountries,
        savedCountryIds: userProfile.savedCountryIds,
        toggleSaveCountry,
        isCountrySaved,
        ignoredCountryIds,
        toggleIgnoreCountry,
        isCountryIgnored,
        restoreCountry,
        comparedCountryIds,
        toggleCompareCountry,
        replaceCompareCountry,
        isCountryCompared,
        clearComparedCountries,
        checklist,
        toggleChecklistTask,
        addChecklistTask,
        threads,
        addThread,
        addComment,
        toggleUpvoteThread,
        deleteThread,
        togglePinThread,
        meetups,
        toggleRsvpMeetup,
        addMeetup,
        deleteMeetup,
        dmThreads,
        activeDmThreadId,
        setActiveDmThreadId,
        sendMessage,
        startDmWithPeer,
        totalUnreadDms,
        markThreadAsRead,
        markAllThreadsAsRead,
        incomingNotification,
        dismissNotification,
        enablePeerAutoReplies,
        setEnablePeerAutoReplies,
        notificationSoundEnabled,
        setNotificationSoundEnabled,
        openChatThread,
        simulateIncomingPeerMessage,
        journalEntries,
        getJournalEntry,
        saveJournalEntry,
        deleteJournalEntry,
        feedbackReports,
        submitFeedbackReport,
        updateFeedbackStatus,
        deleteFeedbackReport,
        deleteAllTestFeedbacks,
        isFeedbackModalOpen,
        setIsFeedbackModalOpen,
        feedbackInitialType,
        openFeedbackModal,
        closeFeedbackModal,
        dossierDownloads,
        trackDossierDownload,
        clearAllDossierDownloads,
        firebaseUser,
        isFirebaseConnected,
        isFirebaseSyncing,
        lastCloudSyncTime,
        loginWithGoogle,
        syncAllAccountsToCloud,
        resetCloudAndLocalState,
        testFirestoreConnection,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
