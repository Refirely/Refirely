import { DirectMessageThread, DirectMessage, UserAccount, InAppMessageNotification } from '../types';
import { INITIAL_DM_THREADS } from '../data/community';

export const LOCAL_STORAGE_KEY = 'refirely_app_state_v1';

export const getUserDmThreadsKey = (userId: string): string => {
  return `${LOCAL_STORAGE_KEY}_dmThreads_${userId}`;
};

export const getPendingNotifsKey = (userId: string): string => {
  return `${LOCAL_STORAGE_KEY}_pending_notifs_${userId}`;
};

/**
 * Generates tailored initial direct message threads for any registered user.
 */
export const getInitialThreadsForUser = (userId: string, accounts: UserAccount[]): DirectMessageThread[] => {
  const getAcc = (accId: string) => accounts.find(a => a.id === accId);

  const ganeshAcc = getAcc('usr-ganesh');
  const elenaAcc = getAcc('usr-elena');
  const marcusAcc = getAcc('usr-marcus');
  const arthurAcc = getAcc('usr-arthur');
  const margaretAcc = getAcc('usr-margaret');

  const ganeshAvatar = ganeshAcc?.profile.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80';
  const elenaAvatar = elenaAcc?.profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80';
  const marcusAvatar = marcusAcc?.profile.avatarUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80';
  const arthurAvatar = arthurAcc?.profile.avatarUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80';
  const margaretAvatar = margaretAcc?.profile.avatarUrl || 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&q=80';

  if (userId === 'usr-ganesh') {
    return JSON.parse(JSON.stringify(INITIAL_DM_THREADS));
  }

  if (userId === 'usr-elena') {
    return [
      {
        id: 'dm-ganesh',
        peerUserId: 'usr-ganesh',
        peerName: 'Ganesh Reddy',
        peerAvatar: ganeshAvatar,
        peerCountry: 'Portugal',
        peerCity: 'Austin & Porto',
        peerStatus: 'Scouting In-Person',
        lastMessage: 'Happy to share my experience with the Spanish Non-Lucrative Visa paperwork and health insurance!',
        lastMessageTime: '3 days ago',
        unreadCount: 0,
        messages: [
          {
            id: 'm-e1',
            sender: 'user',
            senderUserId: 'usr-elena',
            senderName: 'Elena Rostova',
            recipientUserId: 'usr-ganesh',
            recipientName: 'Ganesh Reddy',
            text: 'Hi Ganesh! I saw you are looking at Spain alongside Portugal. Valencia has been wonderful for walking and cultural arts.',
            timestamp: '3 days ago',
          },
          {
            id: 'm-e2',
            sender: 'peer',
            senderUserId: 'usr-ganesh',
            senderName: 'Ganesh Reddy',
            recipientUserId: 'usr-elena',
            recipientName: 'Elena Rostova',
            text: 'Thanks Elena! How are you finding the Non-Lucrative Visa income threshold requirements?',
            timestamp: '3 days ago',
          },
          {
            id: 'm-e3',
            sender: 'user',
            senderUserId: 'usr-elena',
            senderName: 'Elena Rostova',
            recipientUserId: 'usr-ganesh',
            recipientName: 'Ganesh Reddy',
            text: 'Happy to share my experience with the Spanish Non-Lucrative Visa paperwork and health insurance!',
            timestamp: '3 days ago',
          },
        ],
      },
      {
        id: 'dm-marcus',
        peerUserId: 'usr-marcus',
        peerName: 'Marcus Vance',
        peerAvatar: marcusAvatar,
        peerCountry: 'Thailand',
        peerCity: 'Chiang Mai',
        peerStatus: 'Relocated & Settled (3 yrs)',
        lastMessage: 'We usually walk in without an appointment at Bangkok Hospital Chiang Mai and see a specialist within 25 minutes!',
        lastMessageTime: '2 days ago',
        unreadCount: 0,
        messages: [
          {
            id: 'm-e4',
            sender: 'user',
            senderUserId: 'usr-elena',
            senderName: 'Elena Rostova',
            recipientUserId: 'usr-marcus',
            recipientName: 'Marcus Vance',
            text: 'Marcus, what hospital network do you recommend for routine checkups in Chiang Mai?',
            timestamp: '3 days ago',
          },
          {
            id: 'm-e5',
            sender: 'peer',
            senderUserId: 'usr-marcus',
            senderName: 'Marcus Vance',
            recipientUserId: 'usr-elena',
            recipientName: 'Elena Rostova',
            text: 'We usually walk in without an appointment at Bangkok Hospital Chiang Mai and see a specialist within 25 minutes!',
            timestamp: '2 days ago',
          },
        ],
      },
      {
        id: 'dm-arthur',
        peerUserId: 'usr-arthur',
        peerName: 'Arthur Sterling',
        peerAvatar: arthurAvatar,
        peerCountry: 'Portugal',
        peerCity: 'Matosinhos, Porto',
        peerStatus: 'Relocated & Settled (5 yrs)',
        lastMessage: 'Great seeing your post on the Convenio Especial health insurance!',
        lastMessageTime: '4 days ago',
        unreadCount: 0,
        messages: [
          {
            id: 'm-e6',
            sender: 'peer',
            senderUserId: 'usr-arthur',
            senderName: 'Arthur Sterling',
            recipientUserId: 'usr-elena',
            recipientName: 'Elena Rostova',
            text: 'Great seeing your post on the Convenio Especial health insurance!',
            timestamp: '4 days ago',
          },
        ],
      },
    ];
  }

  if (userId === 'usr-marcus') {
    return [
      {
        id: 'dm-ganesh',
        peerUserId: 'usr-ganesh',
        peerName: 'Ganesh Reddy',
        peerAvatar: ganeshAvatar,
        peerCountry: 'Portugal',
        peerCity: 'Austin & Porto',
        peerStatus: 'Scouting In-Person',
        lastMessage: 'If you plan a scouting trip to Chiang Mai, I can show you the best neighborhood streets to rent in.',
        lastMessageTime: '2 days ago',
        unreadCount: 0,
        messages: [
          {
            id: 'm-m1',
            sender: 'user',
            senderUserId: 'usr-marcus',
            senderName: 'Marcus Vance',
            recipientUserId: 'usr-ganesh',
            recipientName: 'Ganesh Reddy',
            text: 'Saw your interest in Thailand! The weather in Chiang Mai right now is 78°F and breezy. Great time to visit.',
            timestamp: '2 days ago',
          },
          {
            id: 'm-m2',
            sender: 'peer',
            senderUserId: 'usr-ganesh',
            senderName: 'Ganesh Reddy',
            recipientUserId: 'usr-marcus',
            recipientName: 'Marcus Vance',
            text: 'Hi Marcus! How difficult was opening the Thai bank account for the 800k THB requirement?',
            timestamp: '2 days ago',
          },
          {
            id: 'm-m3',
            sender: 'user',
            senderUserId: 'usr-marcus',
            senderName: 'Marcus Vance',
            recipientUserId: 'usr-ganesh',
            recipientName: 'Ganesh Reddy',
            text: 'Quite straightforward with Bangkok Bank in Chiang Mai. Bring your passport and condominium rental contract. Takes about 45 minutes.',
            timestamp: '2 days ago',
          },
          {
            id: 'm-m4',
            sender: 'user',
            senderUserId: 'usr-marcus',
            senderName: 'Marcus Vance',
            recipientUserId: 'usr-ganesh',
            recipientName: 'Ganesh Reddy',
            text: 'If you plan a scouting trip to Chiang Mai, I can show you the best neighborhood streets to rent in.',
            timestamp: '2 days ago',
          },
        ],
      },
      {
        id: 'dm-elena',
        peerUserId: 'usr-elena',
        peerName: 'Elena Rostova',
        peerAvatar: elenaAvatar,
        peerCountry: 'Spain',
        peerCity: 'Valencia',
        peerStatus: 'Visa In-Progress',
        lastMessage: 'We usually walk in without an appointment at Bangkok Hospital Chiang Mai and see a specialist within 25 minutes!',
        lastMessageTime: '2 days ago',
        unreadCount: 0,
        messages: [
          {
            id: 'm-m5',
            sender: 'peer',
            senderUserId: 'usr-elena',
            senderName: 'Elena Rostova',
            recipientUserId: 'usr-marcus',
            recipientName: 'Marcus Vance',
            text: 'Marcus, what hospital network do you recommend for routine checkups in Chiang Mai?',
            timestamp: '3 days ago',
          },
          {
            id: 'm-m6',
            sender: 'user',
            senderUserId: 'usr-marcus',
            senderName: 'Marcus Vance',
            recipientUserId: 'usr-elena',
            recipientName: 'Elena Rostova',
            text: 'We usually walk in without an appointment at Bangkok Hospital Chiang Mai and see a specialist within 25 minutes!',
            timestamp: '2 days ago',
          },
        ],
      },
    ];
  }

  if (userId === 'usr-arthur') {
    return [
      {
        id: 'dm-ganesh',
        peerUserId: 'usr-ganesh',
        peerName: 'Ganesh Reddy',
        peerAvatar: ganeshAvatar,
        peerCountry: 'Portugal',
        peerCity: 'Austin & Porto',
        peerStatus: 'Scouting In-Person',
        lastMessage: 'Let me know if you want the contact for our English-speaking lawyer in Porto. She saved us weeks.',
        lastMessageTime: '10:45 AM',
        unreadCount: 0,
        messages: [
          {
            id: 'm-a1',
            sender: 'user',
            senderUserId: 'usr-arthur',
            senderName: 'Arthur Sterling',
            recipientUserId: 'usr-ganesh',
            recipientName: 'Ganesh Reddy',
            text: 'Hi there! I saw you are shortlisting Portugal for your retirement. My wife Helen and I made the move 5 years ago from New Jersey.',
            timestamp: '10:30 AM',
          },
          {
            id: 'm-a2',
            sender: 'peer',
            senderUserId: 'usr-ganesh',
            senderName: 'Ganesh Reddy',
            recipientUserId: 'usr-arthur',
            recipientName: 'Arthur Sterling',
            text: 'Hello Arthur! Yes, we are debating between Cascais and Porto. How are you finding the healthcare system up in Porto?',
            timestamp: '10:38 AM',
          },
          {
            id: 'm-a3',
            sender: 'user',
            senderUserId: 'usr-arthur',
            senderName: 'Arthur Sterling',
            recipientUserId: 'usr-ganesh',
            recipientName: 'Ganesh Reddy',
            text: 'The healthcare is world-class. We use Hospital CUF Porto for private care. Out of pocket checkups are €70 without insurance, and our private policy is under €90/month each. Very stress-free.',
            timestamp: '10:42 AM',
          },
          {
            id: 'm-a4',
            sender: 'user',
            senderUserId: 'usr-arthur',
            senderName: 'Arthur Sterling',
            recipientUserId: 'usr-ganesh',
            recipientName: 'Ganesh Reddy',
            text: 'Let me know if you want the contact for our English-speaking lawyer in Porto. She saved us weeks.',
            timestamp: '10:45 AM',
          },
        ],
      },
      {
        id: 'dm-margaret',
        peerUserId: 'usr-margaret',
        peerName: 'Margaret O’Connor',
        peerAvatar: margaretAvatar,
        peerCountry: 'Portugal',
        peerCity: 'Cascais',
        peerStatus: 'Relocated & Settled (4 yrs)',
        lastMessage: 'Looking forward to catching up on Thursday in Cascais!',
        lastMessageTime: 'Yesterday',
        unreadCount: 0,
        messages: [
          {
            id: 'm-a5',
            sender: 'user',
            senderUserId: 'usr-arthur',
            senderName: 'Arthur Sterling',
            recipientUserId: 'usr-margaret',
            recipientName: 'Margaret O’Connor',
            text: 'Looking forward to catching up on Thursday in Cascais!',
            timestamp: 'Yesterday',
          },
        ],
      },
    ];
  }

  // Default fallback for Margaret or any other custom/new user
  const peerList = [
    { acc: ganeshAcc, defaultCity: 'Porto', defaultCountry: 'Portugal', defaultStatus: 'Scouting In-Person' },
    { acc: elenaAcc, defaultCity: 'Valencia', defaultCountry: 'Spain', defaultStatus: 'Visa In-Progress' },
    { acc: arthurAcc, defaultCity: 'Matosinhos, Porto', defaultCountry: 'Portugal', defaultStatus: 'Relocated & Settled (5 yrs)' },
    { acc: marcusAcc, defaultCity: 'Chiang Mai', defaultCountry: 'Thailand', defaultStatus: 'Relocated & Settled (3 yrs)' },
  ].filter(p => p.acc && p.acc.id !== userId);

  return peerList.map(item => {
    const acc = item.acc!;
    return {
      id: `dm-${acc.id}`,
      peerUserId: acc.id,
      peerName: acc.profile.name,
      peerAvatar: acc.profile.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
      peerCountry: acc.profile.residingCountry || acc.profile.targetCountry || item.defaultCountry,
      peerCity: acc.profile.originCity || item.defaultCity,
      peerStatus: acc.profile.relocationStatus || item.defaultStatus,
      lastMessage: `Connected via ReFIREly Expat Network`,
      lastMessageTime: 'Recently',
      unreadCount: 0,
      messages: [],
    };
  });
};

/**
 * Extracts numeric timestamp for sorting threads with the most recent message on top.
 */
export const getThreadLatestTimestamp = (thread: DirectMessageThread): number => {
  if (thread.messages && thread.messages.length > 0) {
    const lastMsg = thread.messages[thread.messages.length - 1];
    if (lastMsg.createdAt) {
      const t = new Date(lastMsg.createdAt).getTime();
      if (!isNaN(t)) return t;
    }
  }
  const timeStr = thread.lastMessageTime || '';
  if (timeStr === 'Just now' || timeStr === 'Recently') return Date.now();
  if (timeStr.includes(':')) {
    // Today's time (e.g. "10:45 AM")
    return Date.now() - 60 * 1000;
  }
  if (timeStr.toLowerCase().includes('yesterday')) {
    return Date.now() - 86400 * 1000;
  }
  const daysMatch = timeStr.match(/(\d+)\s*days?\s*ago/i);
  if (daysMatch) {
    return Date.now() - parseInt(daysMatch[1], 10) * 86400 * 1000;
  }
  return 0;
};

/**
 * Sorts direct message threads so the conversation with the newest activity is always at index [0].
 */
export const sortDmThreadsByLatest = (threads: DirectMessageThread[]): DirectMessageThread[] => {
  return [...threads].sort((a, b) => getThreadLatestTimestamp(b) - getThreadLatestTimestamp(a));
};

/**
 * Loads, heals, and returns the direct message threads for a given user.
 * Ensures avatars and peer details match the real registered accounts,
 * and sorts threads so the latest active conversation is always on top.
 */
export const loadUserDmThreads = (userId: string, accounts: UserAccount[]): DirectMessageThread[] => {
  if (!userId || userId === 'guest') {
    return [];
  }

  let threads: DirectMessageThread[] = [];
  try {
    const saved = localStorage.getItem(getUserDmThreadsKey(userId));
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        threads = parsed;
      }
    }
  } catch {}

  // If no user-specific threads, check if userId is usr-ganesh and general key exists
  if (threads.length === 0 && userId === 'usr-ganesh') {
    try {
      const generalSaved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_dmThreads`);
      if (generalSaved) {
        const parsed = JSON.parse(generalSaved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          threads = parsed;
        }
      }
    } catch {}
  }

  // If still empty, generate initial tailored threads
  if (threads.length === 0) {
    threads = getInitialThreadsForUser(userId, accounts);
  }

  // Heal threads against registered accounts so display pictures and names never mismatch!
  const healedThreads = threads.map(t => {
    const matched = accounts.find(
      a =>
        (t.peerUserId && a.id === t.peerUserId) ||
        a.profile.name.toLowerCase() === t.peerName.toLowerCase() ||
        a.name.toLowerCase() === t.peerName.toLowerCase()
    );

    const safePeerUserId = matched?.id || t.peerUserId;
    const safePeerName = matched?.profile.name || matched?.name || t.peerName;
    const safePeerAvatar = matched?.profile.avatarUrl || t.peerAvatar;
    const safePeerCountry = matched?.profile.residingCountry || matched?.profile.targetCountry || t.peerCountry;
    const safePeerCity = matched?.profile.originCity || t.peerCity;
    const safePeerStatus = matched?.profile.relocationStatus || t.peerStatus;

    // Heal message sender perspective
    const safeMessages: DirectMessage[] = (t.messages || []).map(m => {
      const isMe = m.senderUserId ? m.senderUserId === userId : m.sender === 'user';
      return {
        ...m,
        sender: isMe ? ('user' as const) : ('peer' as const),
        senderUserId: m.senderUserId || (isMe ? userId : safePeerUserId),
        recipientUserId: m.recipientUserId || (isMe ? safePeerUserId : userId),
      };
    });

    return {
      ...t,
      peerUserId: safePeerUserId,
      peerName: safePeerName,
      peerAvatar: safePeerAvatar,
      peerCountry: safePeerCountry,
      peerCity: safePeerCity,
      peerStatus: safePeerStatus,
      messages: safeMessages,
    };
  });

  const sortedHealed = sortDmThreadsByLatest(healedThreads);

  try {
    localStorage.setItem(getUserDmThreadsKey(userId), JSON.stringify(sortedHealed));
  } catch {}

  return sortedHealed;
};

/**
 * Persists the direct message threads for a given user into localStorage.
 */
export const saveUserDmThreads = (userId: string, threads: DirectMessageThread[]): void => {
  if (!userId || userId === 'guest') return;
  const sorted = sortDmThreadsByLatest(threads);
  try {
    localStorage.setItem(getUserDmThreadsKey(userId), JSON.stringify(sorted));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_dmThreads`, JSON.stringify(sorted));
  } catch {}
};

/**
 * Dispatches a message bidirectionally:
 * 1. Writes to sender's inbox (as sender: 'user', read: true)
 * 2. Writes to recipient's inbox (as sender: 'peer', read: false, unreadCount + 1)
 * 3. Enqueues an in-app pending notification for recipient with chime alert info.
 * 4. Puts the thread with latest message at the top of recipient's inbox.
 * 5. Dispatches a window event so running client sessions immediately update.
 */
export const dispatchMessageToRecipient = (
  senderId: string,
  senderName: string,
  senderAvatar: string,
  senderCountry: string,
  senderCity: string,
  recipientId: string,
  text: string,
  accounts: UserAccount[]
): void => {
  if (!recipientId || recipientId === senderId || recipientId === 'guest') {
    return;
  }

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const msgId = `m-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

  // Load recipient's threads
  const recipientThreads = loadUserDmThreads(recipientId, accounts);

  // Find or create thread with sender
  let recipientThread = recipientThreads.find(t => t.peerUserId === senderId);

  const peerMsg: DirectMessage = {
    id: msgId,
    sender: 'peer',
    senderUserId: senderId,
    senderName,
    recipientUserId: recipientId,
    text: text.trim(),
    timestamp: timeStr,
    createdAt: now.toISOString(),
    read: false,
  };

  let nextRecipientThreads: DirectMessageThread[];
  if (recipientThread) {
    recipientThread = {
      ...recipientThread,
      peerName: senderName,
      peerAvatar: senderAvatar,
      peerCountry: senderCountry,
      peerCity: senderCity,
      lastMessage: text.trim(),
      lastMessageTime: timeStr,
      unreadCount: (recipientThread.unreadCount || 0) + 1,
      messages: [...(recipientThread.messages || []), peerMsg],
    };
    const otherThreads = recipientThreads.filter(t => t.id !== recipientThread!.id);
    nextRecipientThreads = [recipientThread, ...otherThreads];
  } else {
    recipientThread = {
      id: `dm-${senderId}`,
      peerUserId: senderId,
      peerName: senderName,
      peerAvatar: senderAvatar,
      peerCountry: senderCountry,
      peerCity: senderCity,
      peerStatus: 'Community Member',
      lastMessage: text.trim(),
      lastMessageTime: timeStr,
      unreadCount: 1,
      messages: [peerMsg],
    };
    nextRecipientThreads = [recipientThread, ...recipientThreads];
  }

  // Ensure latest activity is at the very top
  nextRecipientThreads = sortDmThreadsByLatest(nextRecipientThreads);

  // Save recipient inbox
  try {
    localStorage.setItem(getUserDmThreadsKey(recipientId), JSON.stringify(nextRecipientThreads));
  } catch {}

  // Enqueue pending notification for recipient
  const newNotif: InAppMessageNotification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    threadId: recipientThread.id,
    peerName: senderName,
    peerAvatar: senderAvatar,
    peerCountry: senderCountry,
    peerCity: senderCity,
    text: text.trim(),
    timestamp: timeStr,
  };

  try {
    const pendingKey = getPendingNotifsKey(recipientId);
    const existingRaw = localStorage.getItem(pendingKey);
    const pendingList: InAppMessageNotification[] = existingRaw ? JSON.parse(existingRaw) : [];
    pendingList.push(newNotif);
    localStorage.setItem(pendingKey, JSON.stringify(pendingList));
  } catch {}

  // Broadcast window event for live in-session synchronization
  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(
        new CustomEvent('refirely:dm_dispatched', {
          detail: {
            recipientId,
            senderId,
            threadId: recipientThread.id,
            message: peerMsg,
            notification: newNotif,
          },
        })
      );
    } catch {}
  }
};

/**
 * Checks for and pops pending notifications for a user upon login or account switch.
 */
export const popPendingNotificationForUser = (userId: string): InAppMessageNotification | null => {
  if (!userId || userId === 'guest') return null;
  try {
    const pendingKey = getPendingNotifsKey(userId);
    const saved = localStorage.getItem(pendingKey);
    if (saved) {
      const list: InAppMessageNotification[] = JSON.parse(saved);
      if (Array.isArray(list) && list.length > 0) {
        // Return latest notification and clear pending queue
        const latest = list[list.length - 1];
        localStorage.removeItem(pendingKey);
        return latest;
      }
    }
  } catch {}
  return null;
};
