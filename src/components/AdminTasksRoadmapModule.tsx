import React, { useState, useEffect, useMemo } from 'react';
import {
  CheckSquare,
  Plus,
  Trash2,
  Edit,
  Download,
  Calendar,
  Flag,
  CheckCircle2,
  Clock,
  Sparkles,
  Search,
  LayoutGrid,
  ListChecks,
  Milestone,
  ArrowRight,
  RotateCcw,
  CloudUpload,
  AlertTriangle,
  Layers,
  Target,
  Lightbulb,
  Rocket,
  Check,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { motion } from 'motion/react';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';

export type AdminTaskStatus = 'ideation' | 'planned' | 'in_progress' | 'testing' | 'finished';
export type AdminTaskPriority = 'critical' | 'high' | 'medium' | 'low';
export type AdminTaskCategory =
  | 'Feature Development'
  | 'UI / UX & Design'
  | 'Marketing & Growth'
  | 'SEO & Content'
  | 'Database & Infrastructure'
  | 'Monetization & Affiliates'
  | 'Community & Expats'
  | 'Future Milestone';

export interface AdminSubtaskItem {
  id: string;
  title: string;
  completed: boolean;
}

export interface AdminRoadmapTask {
  id: string;
  title: string;
  description: string;
  category: AdminTaskCategory;
  status: AdminTaskStatus;
  priority: AdminTaskPriority;
  deadline: string; // YYYY-MM-DD
  milestoneTag: string;
  progressPercent: number; // 0 - 100
  subtasks: AdminSubtaskItem[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export const STORAGE_KEY_ADMIN_TASKS = 'refirely_admin_tasks_roadmap_v1';

export const TASK_CATEGORIES: AdminTaskCategory[] = [
  'Feature Development',
  'UI / UX & Design',
  'Marketing & Growth',
  'SEO & Content',
  'Database & Infrastructure',
  'Monetization & Affiliates',
  'Community & Expats',
  'Future Milestone',
];

export const TASK_STATUS_META: Record<
  AdminTaskStatus,
  {
    label: string;
    shortLabel: string;
    badgeClass: string;
    barColor: string;
    dotColor: string;
    defaultProgress: number;
  }
> = {
  ideation: {
    label: 'Ideation & Backlog',
    shortLabel: 'Ideation',
    badgeClass: 'bg-purple-50 text-purple-900 border-purple-200',
    barColor: 'bg-purple-500',
    dotColor: 'bg-purple-500',
    defaultProgress: 10,
  },
  planned: {
    label: 'Planned & Scoped',
    shortLabel: 'Planned',
    badgeClass: 'bg-sky-50 text-sky-900 border-sky-200',
    barColor: 'bg-sky-500',
    dotColor: 'bg-sky-500',
    defaultProgress: 25,
  },
  in_progress: {
    label: 'In Execution',
    shortLabel: 'In Progress',
    badgeClass: 'bg-amber-50 text-amber-900 border-amber-300',
    barColor: 'bg-amber-500',
    dotColor: 'bg-amber-500',
    defaultProgress: 60,
  },
  testing: {
    label: 'Testing & QA Review',
    shortLabel: 'Testing / QA',
    badgeClass: 'bg-indigo-50 text-indigo-900 border-indigo-200',
    barColor: 'bg-indigo-500',
    dotColor: 'bg-indigo-500',
    defaultProgress: 85,
  },
  finished: {
    label: 'Finished & Shipped',
    shortLabel: 'Finished',
    badgeClass: 'bg-emerald-50 text-emerald-900 border-emerald-300',
    barColor: 'bg-emerald-500',
    dotColor: 'bg-emerald-500',
    defaultProgress: 100,
  },
};

export const TASK_PRIORITY_META: Record<
  AdminTaskPriority,
  {
    label: string;
    badgeClass: string;
    barColor: string;
    rank: number;
  }
> = {
  critical: {
    label: 'Critical',
    badgeClass: 'bg-rose-100 text-rose-900 border-rose-300',
    barColor: 'bg-rose-600',
    rank: 4,
  },
  high: {
    label: 'High',
    badgeClass: 'bg-orange-100 text-orange-900 border-orange-300',
    barColor: 'bg-orange-500',
    rank: 3,
  },
  medium: {
    label: 'Medium',
    badgeClass: 'bg-amber-50 text-amber-900 border-amber-200',
    barColor: 'bg-amber-500',
    rank: 2,
  },
  low: {
    label: 'Low',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
    barColor: 'bg-slate-400',
    rank: 1,
  },
};

export const DEFAULT_ADMIN_TASKS: AdminRoadmapTask[] = [
  {
    id: 'task-shareable-fire-card',
    title: 'Shareable FIRE Badge & Freedom Card Generator (9:16 & 1:1 PNG)',
    description:
      'Client-side social card generator using html-to-image with Privacy Mode toggle, persona-based viral hooks, and Web Share API.',
    category: 'Marketing & Growth',
    status: 'finished',
    priority: 'high',
    deadline: '2026-11-14',
    milestoneTag: 'Q4 2026 Viral Growth',
    progressPercent: 100,
    subtasks: [
      { id: 'st-1', title: 'Add html-to-image CDN & CORS font attributes', completed: true },
      { id: 'st-2', title: 'Build 9:16 Story & 1:1 Post preview modal with Privacy Mode', completed: true },
      { id: 'st-3', title: 'Add trigger buttons in Home Calculator & User Dashboard', completed: true },
    ],
    createdAt: '2026-11-10',
    updatedAt: '2026-11-14',
    completedAt: '2026-11-14',
  },
  {
    id: 'task-google-ads-conversion',
    title: 'Google Ads Campaign Tag (GTM-N9HJNPS6) & /?signup=success Conversion URL',
    description:
      'Install GTM-N9HJNPS6 across all pages and push /?signup=success via history.pushState on new Email & Google signups.',
    category: 'Marketing & Growth',
    status: 'finished',
    priority: 'critical',
    deadline: '2026-11-14',
    milestoneTag: 'Q4 2026 Viral Growth',
    progressPercent: 100,
    subtasks: [
      { id: 'st-4', title: 'Inject GTM-N9HJNPS6 script in root index.html', completed: true },
      { id: 'st-5', title: 'Push /?signup=success on new user registration', completed: true },
    ],
    createdAt: '2026-11-12',
    updatedAt: '2026-11-14',
    completedAt: '2026-11-14',
  },
  {
    id: 'task-sitemap-seo-indexing',
    title: 'Complete 209-Country Sitemap.xml & Google Search Console Indexing',
    description:
      'Generate standard XML sitemap for all 209 country dossiers and primary views, plus robots.txt pointing to https://refirely.com/sitemap.xml.',
    category: 'SEO & Content',
    status: 'finished',
    priority: 'high',
    deadline: '2026-11-14',
    milestoneTag: 'Q4 2026 SEO Expansion',
    progressPercent: 100,
    subtasks: [
      { id: 'st-6', title: 'Generate 212 URL entries in public/sitemap.xml', completed: true },
      { id: 'st-7', title: 'Configure robots.txt with Sitemap directive', completed: true },
    ],
    createdAt: '2026-11-11',
    updatedAt: '2026-11-14',
    completedAt: '2026-11-14',
  },
  {
    id: 'task-affiliate-partner-hub',
    title: 'Expand Expat Partner & Affiliate Integrations (Wise, SafetyWing, Airalo eSIM)',
    description:
      'Add contextual partner comparison cards inside Country Dossiers and Scout & Hop itineraries to grow recurring affiliate commission revenue.',
    category: 'Monetization & Affiliates',
    status: 'in_progress',
    priority: 'high',
    deadline: '2026-11-28',
    milestoneTag: 'Q4 2026 Monetization',
    progressPercent: 65,
    subtasks: [
      { id: 'st-8', title: 'Audit Wise & SafetyWing contextual CTAs in Dossiers', completed: true },
      { id: 'st-9', title: 'Add global eSIM & international tax consult partner links', completed: false },
      { id: 'st-10', title: 'Track outbound partner clicks in Google Analytics', completed: true },
    ],
    createdAt: '2026-11-08',
    updatedAt: '2026-11-14',
  },
  {
    id: 'task-expat-ambassador-program',
    title: 'Verified City Ambassador & Local Meetup Host Onboarding',
    description:
      'Recruit 15 founding expat community hosts across Lisbon, Chiang Mai, Valencia, Da Nang, and Medellín to lead monthly ReFIREly meetups.',
    category: 'Community & Expats',
    status: 'planned',
    priority: 'medium',
    deadline: '2026-12-10',
    milestoneTag: 'Q1 2027 Community Hub',
    progressPercent: 30,
    subtasks: [
      { id: 'st-11', title: 'Define Ambassador badge tier & profile verification', completed: true },
      { id: 'st-12', title: 'Outreach to top 20 Early Pioneer members via Admin DM', completed: false },
    ],
    createdAt: '2026-11-09',
    updatedAt: '2026-11-14',
  },
  {
    id: 'task-ai-tax-treaty-comparator',
    title: 'Bilateral Pension & Capital Gains Tax Treaty Matrix (US, UK, India, Canada, AU)',
    description:
      'Interactive matrix comparing how 5 major origin countries tax 401(k)/IRA, Superannuation, EPF/NPS, and brokerage dividends across top 30 havens.',
    category: 'Feature Development',
    status: 'ideation',
    priority: 'high',
    deadline: '2026-12-22',
    milestoneTag: 'Q1 2027 Product Roadmap',
    progressPercent: 15,
    subtasks: [
      { id: 'st-13', title: 'Compile DTAA treaty withholding rates for top 30 havens', completed: false },
      { id: 'st-14', title: 'Integrate net-after-tax toggle into FIRE Calculator', completed: false },
    ],
    createdAt: '2026-11-12',
    updatedAt: '2026-11-14',
  },
  {
    id: 'task-live-cost-crowdsourcing',
    title: 'Member-Submitted Real-World Rent & Grocery Receipt Verification',
    description:
      'Allow verified expats residing in a target haven to submit monthly rent, utility, and grocery data points to enrich country cost benchmarks.',
    category: 'Future Milestone',
    status: 'ideation',
    priority: 'medium',
    deadline: '2027-01-15',
    milestoneTag: 'Q1 2027 Community Hub',
    progressPercent: 10,
    subtasks: [
      { id: 'st-15', title: 'Design member cost submission form with Admin moderation queue', completed: false },
    ],
    createdAt: '2026-11-13',
    updatedAt: '2026-11-14',
  },
];

export function loadStoredAdminTasks(): AdminRoadmapTask[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ADMIN_TASKS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {}
  return DEFAULT_ADMIN_TASKS;
}

export const AdminTasksRoadmapModule: React.FC = () => {
  const [tasks, setTasks] = useState<AdminRoadmapTask[]>(() => loadStoredAdminTasks());
  const [viewMode, setViewMode] = useState<'list' | 'kanban' | 'milestones'>('list');

  // Filter & Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | AdminTaskStatus>('active');
  const [priorityFilter, setPriorityFilter] = useState<'all' | AdminTaskPriority>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | AdminTaskCategory>('all');
  const [sortBy, setSortBy] = useState<'deadline-asc' | 'priority-desc' | 'progress-desc' | 'updated-desc'>('priority-desc');

  // Form state for Creating / Editing a Task
  const todayStr = new Date().toISOString().split('T')[0];
  const defaultDeadlineStr = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];

  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<AdminTaskCategory>('Feature Development');
  const [status, setStatus] = useState<AdminTaskStatus>('planned');
  const [priority, setPriority] = useState<AdminTaskPriority>('high');
  const [deadline, setDeadline] = useState<string>(defaultDeadlineStr);
  const [milestoneTag, setMilestoneTag] = useState<string>('Q4 2026 Product Sprint');
  const [progressPercent, setProgressPercent] = useState<number>(25);
  const [subtasksDraft, setSubtasksDraft] = useState<AdminSubtaskItem[]>([]);
  const [newSubtaskInput, setNewSubtaskInput] = useState('');

  // Expanded task cards for viewing subtasks inline
  const [expandedTaskIds, setExpandedTaskIds] = useState<Record<string, boolean>>({});
  const [inlineSubtaskInputs, setInlineSubtaskInputs] = useState<Record<string, string>>({});

  // Toast & Cloud Sync state
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Persist to localStorage whenever tasks change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ADMIN_TASKS, JSON.stringify(tasks));
    } catch {}
  }, [tasks]);

  // Sync to Firebase Cloud (/users/{uid}/workspace/adminTasks)
  const syncTasksToCloud = async (tasksToSave = tasks, silent = false) => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      if (!silent) {
        showToast('Saved locally. Sign in with Google in Admin Cloud tab to sync across devices.');
      }
      return;
    }
    setIsSyncingCloud(true);
    const docPath = `users/${currentUser.uid}/workspace/adminTasks`;
    try {
      await setDoc(doc(db, 'users', currentUser.uid, 'workspace', 'adminTasks'), {
        id: 'adminTasks',
        userId: currentUser.uid,
        tasks: tasksToSave,
        updatedAt: new Date().toISOString().slice(0, 40),
      });
      if (!silent) {
        showToast('Admin tasks & roadmap milestones synced to Firebase Cloud!');
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, docPath);
    } finally {
      setIsSyncingCloud(false);
    }
  };

  // Load from Firebase Cloud on mount if authenticated
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    getDoc(doc(db, 'users', currentUser.uid, 'workspace', 'adminTasks'))
      .then(snap => {
        if (snap.exists()) {
          const data = snap.data();
          if (Array.isArray(data.tasks) && data.tasks.length > 0) {
            // Merge cloud tasks with local tasks by ID, preferring latest updatedAt
            const map = new Map<string, AdminRoadmapTask>();
            tasks.forEach(t => map.set(t.id, t));
            data.tasks.forEach((cloudTask: AdminRoadmapTask) => {
              if (!cloudTask || !cloudTask.id) return;
              const existing = map.get(cloudTask.id);
              if (!existing || (cloudTask.updatedAt || '') >= (existing.updatedAt || '')) {
                map.set(cloudTask.id, cloudTask);
              }
            });
            const merged = Array.from(map.values());
            setTasks(merged);
            try {
              localStorage.setItem(STORAGE_KEY_ADMIN_TASKS, JSON.stringify(merged));
            } catch {}
          }
        }
      })
      .catch(err => {
        console.warn('Could not load cloud adminTasks doc:', err);
      });
  }, []);

  // ============================================================================
  // OVERALL SNAPSHOT & INFOGRAPHIC METRICS
  // ============================================================================
  const stats = useMemo(() => {
    const total = tasks.length;
    const ideationCount = tasks.filter(t => t.status === 'ideation').length;
    const plannedCount = tasks.filter(t => t.status === 'planned').length;
    const inProgressCount = tasks.filter(t => t.status === 'in_progress').length;
    const testingCount = tasks.filter(t => t.status === 'testing').length;
    const finishedCount = tasks.filter(t => t.status === 'finished').length;
    const activeCount = total - finishedCount;

    const completionRate = total > 0 ? Math.round((finishedCount / total) * 100) : 0;
    const avgOverallProgress =
      total > 0
        ? Math.round(
            tasks.reduce((sum, t) => sum + (t.status === 'finished' ? 100 : t.progressPercent || 0), 0) / total
          )
        : 0;

    const criticalCount = tasks.filter(t => t.priority === 'critical' && t.status !== 'finished').length;
    const highCount = tasks.filter(t => t.priority === 'high' && t.status !== 'finished').length;

    const nowMs = new Date(todayStr).getTime();
    let overdueCount = 0;
    let dueSoonCount = 0; // within 7 days

    tasks.forEach(t => {
      if (t.status === 'finished' || !t.deadline) return;
      const dMs = new Date(t.deadline).getTime();
      if (isNaN(dMs)) return;
      const diffDays = Math.ceil((dMs - nowMs) / 86400000);
      if (diffDays < 0) overdueCount += 1;
      else if (diffDays <= 7) dueSoonCount += 1;
    });

    // Category Breakdown
    const categoryStats = TASK_CATEGORIES.map(cat => {
      const catTasks = tasks.filter(t => t.category === cat);
      const catFinished = catTasks.filter(t => t.status === 'finished').length;
      const catAvgProgress =
        catTasks.length > 0
          ? Math.round(
              catTasks.reduce((s, t) => s + (t.status === 'finished' ? 100 : t.progressPercent || 0), 0) /
                catTasks.length
            )
          : 0;
      return {
        category: cat,
        total: catTasks.length,
        finished: catFinished,
        avgProgress: catAvgProgress,
      };
    }).filter(c => c.total > 0);

    // Priority Breakdown
    const priorityStats = (['critical', 'high', 'medium', 'low'] as AdminTaskPriority[]).map(p => {
      const pTasks = tasks.filter(t => t.priority === p);
      const pFinished = pTasks.filter(t => t.status === 'finished').length;
      return {
        priority: p,
        meta: TASK_PRIORITY_META[p],
        total: pTasks.length,
        active: pTasks.length - pFinished,
        finished: pFinished,
        pctOfTotal: total > 0 ? Math.round((pTasks.length / total) * 100) : 0,
      };
    });

    return {
      total,
      ideationCount,
      plannedCount,
      inProgressCount,
      testingCount,
      finishedCount,
      activeCount,
      completionRate,
      avgOverallProgress,
      criticalCount,
      highCount,
      overdueCount,
      dueSoonCount,
      categoryStats,
      priorityStats,
    };
  }, [tasks, todayStr]);

  // Filtered & Sorted Tasks
  const filteredTasks = useMemo(() => {
    return tasks
      .filter(t => {
        if (statusFilter === 'active' && t.status === 'finished') return false;
        if (statusFilter !== 'all' && statusFilter !== 'active' && t.status !== statusFilter) return false;
        if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
        if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = t.title.toLowerCase().includes(q);
          const matchDesc = t.description.toLowerCase().includes(q);
          const matchMilestone = (t.milestoneTag || '').toLowerCase().includes(q);
          const matchCategory = t.category.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchMilestone && !matchCategory) return false;
        }
        return true;
      })
      .sort((a, b) => {
        // Keep unfinished tasks above finished tasks unless sorting by updated
        if (sortBy !== 'updated-desc' && a.status === 'finished' && b.status !== 'finished') return 1;
        if (sortBy !== 'updated-desc' && a.status !== 'finished' && b.status === 'finished') return -1;

        if (sortBy === 'priority-desc') {
          const diff = TASK_PRIORITY_META[b.priority].rank - TASK_PRIORITY_META[a.priority].rank;
          if (diff !== 0) return diff;
          return (a.deadline || '9999-99-99').localeCompare(b.deadline || '9999-99-99');
        }
        if (sortBy === 'deadline-asc') {
          return (a.deadline || '9999-99-99').localeCompare(b.deadline || '9999-99-99');
        }
        if (sortBy === 'progress-desc') {
          return (b.progressPercent || 0) - (a.progressPercent || 0);
        }
        return (b.updatedAt || '').localeCompare(a.updatedAt || '');
      });
  }, [tasks, statusFilter, priorityFilter, categoryFilter, searchQuery, sortBy]);

  // Grouped by Milestone Tag for Milestone Roadmap View
  const milestoneGroups = useMemo(() => {
    const map = new Map<string, AdminRoadmapTask[]>();
    filteredTasks.forEach(t => {
      const tag = t.milestoneTag?.trim() || 'General Platform Backlog';
      const list = map.get(tag) || [];
      list.push(t);
      map.set(tag, list);
    });
    return Array.from(map.entries()).map(([milestone, items]) => {
      const done = items.filter(i => i.status === 'finished').length;
      const avgPct =
        items.length > 0
          ? Math.round(items.reduce((s, i) => s + (i.status === 'finished' ? 100 : i.progressPercent), 0) / items.length)
          : 0;
      return { milestone, items, done, total: items.length, avgPct };
    });
  }, [filteredTasks]);

  // Helper to compute deadline badge
  const getDeadlineBadge = (task: AdminRoadmapTask) => {
    if (task.status === 'finished') {
      return {
        text: `Finished ${task.completedAt || task.deadline}`,
        className: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      };
    }
    if (!task.deadline) {
      return { text: 'No Deadline', className: 'bg-slate-100 text-slate-600 border-slate-200' };
    }
    const nowMs = new Date(todayStr).getTime();
    const dueMs = new Date(task.deadline).getTime();
    const diffDays = Math.ceil((dueMs - nowMs) / 86400000);

    if (diffDays < 0) {
      return {
        text: `Overdue by ${Math.abs(diffDays)}d (${task.deadline})`,
        className: 'bg-rose-50 text-rose-800 border-rose-300 font-bold',
      };
    }
    if (diffDays === 0) {
      return {
        text: `Due Today (${task.deadline})`,
        className: 'bg-amber-100 text-amber-950 border-amber-300 font-bold',
      };
    }
    if (diffDays <= 7) {
      return {
        text: `Due in ${diffDays}d (${task.deadline})`,
        className: 'bg-amber-50 text-amber-900 border-amber-200',
      };
    }
    return {
      text: `Due ${task.deadline} (${diffDays}d)`,
      className: 'bg-slate-50 text-slate-700 border-slate-200',
    };
  };

  // ============================================================================
  // TASK CRUD & QUICK ACTIONS
  // ============================================================================
  const resetForm = () => {
    setEditingTaskId(null);
    setTitle('');
    setDescription('');
    setCategory('Feature Development');
    setStatus('planned');
    setPriority('high');
    setDeadline(defaultDeadlineStr);
    setMilestoneTag('Q4 2026 Product Sprint');
    setProgressPercent(25);
    setSubtasksDraft([]);
    setNewSubtaskInput('');
  };

  const openCreateForm = (initialStatus: AdminTaskStatus = 'planned') => {
    resetForm();
    setStatus(initialStatus);
    setProgressPercent(TASK_STATUS_META[initialStatus].defaultProgress);
    setIsFormOpen(true);
  };

  const openEditForm = (task: AdminRoadmapTask) => {
    setEditingTaskId(task.id);
    setTitle(task.title);
    setDescription(task.description);
    setCategory(task.category);
    setStatus(task.status);
    setPriority(task.priority);
    setDeadline(task.deadline);
    setMilestoneTag(task.milestoneTag || 'General Platform Roadmap');
    setProgressPercent(task.progressPercent);
    setSubtasksDraft(task.subtasks ? [...task.subtasks] : []);
    setIsFormOpen(true);
    window.scrollTo({ top: 180, behavior: 'smooth' });
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Please enter a task or feature title.');
      return;
    }

    const finalProgress = status === 'finished' ? 100 : Math.min(99, Math.max(0, Number(progressPercent) || 0));
    const nowDate = new Date().toISOString().split('T')[0];

    if (editingTaskId) {
      const updated = tasks.map(t =>
        t.id === editingTaskId
          ? {
              ...t,
              title: title.trim(),
              description: description.trim(),
              category,
              status,
              priority,
              deadline,
              milestoneTag: milestoneTag.trim() || 'General Platform Roadmap',
              progressPercent: finalProgress,
              subtasks: subtasksDraft,
              updatedAt: nowDate,
              completedAt: status === 'finished' ? t.completedAt || nowDate : undefined,
            }
          : t
      );
      setTasks(updated);
      syncTasksToCloud(updated, true);
      showToast(`Updated task "${title.trim()}".`);
    } else {
      const newTask: AdminRoadmapTask = {
        id: `task-${Date.now()}`,
        title: title.trim(),
        description: description.trim() || 'Planned platform feature and execution milestone.',
        category,
        status,
        priority,
        deadline,
        milestoneTag: milestoneTag.trim() || 'General Platform Roadmap',
        progressPercent: finalProgress,
        subtasks: subtasksDraft,
        createdAt: nowDate,
        updatedAt: nowDate,
        completedAt: status === 'finished' ? nowDate : undefined,
      };
      const updated = [newTask, ...tasks];
      setTasks(updated);
      syncTasksToCloud(updated, true);
      showToast(`Created new task "${newTask.title}".`);
    }

    resetForm();
    setIsFormOpen(false);
  };

  // Instant toggle "Mark as Finished" / "Reopen Task"
  const handleToggleFinished = (task: AdminRoadmapTask) => {
    const nowDate = new Date().toISOString().split('T')[0];
    const isNowFinished = task.status !== 'finished';
    const updated = tasks.map(t => {
      if (t.id !== task.id) return t;
      if (isNowFinished) {
        return {
          ...t,
          status: 'finished' as AdminTaskStatus,
          progressPercent: 100,
          subtasks: (t.subtasks || []).map(st => ({ ...st, completed: true })),
          updatedAt: nowDate,
          completedAt: nowDate,
        };
      } else {
        return {
          ...t,
          status: 'in_progress' as AdminTaskStatus,
          progressPercent: 60,
          updatedAt: nowDate,
          completedAt: undefined,
        };
      }
    });
    setTasks(updated);
    syncTasksToCloud(updated, true);
    showToast(
      isNowFinished
        ? `Marked "${task.title}" as Finished (100%)!`
        : `Reopened "${task.title}" for active execution.`
    );
  };

  // Change status directly from dropdown or Kanban card
  const handleQuickStatusChange = (taskId: string, nextStatus: AdminTaskStatus) => {
    const nowDate = new Date().toISOString().split('T')[0];
    const updated = tasks.map(t => {
      if (t.id !== taskId) return t;
      const nextProgress =
        nextStatus === 'finished'
          ? 100
          : t.status === 'finished'
          ? TASK_STATUS_META[nextStatus].defaultProgress
          : Math.max(t.progressPercent, TASK_STATUS_META[nextStatus].defaultProgress);
      return {
        ...t,
        status: nextStatus,
        progressPercent: nextProgress,
        updatedAt: nowDate,
        completedAt: nextStatus === 'finished' ? nowDate : undefined,
      };
    });
    setTasks(updated);
    syncTasksToCloud(updated, true);
  };

  // Toggle individual subtask completion and auto-recalculate task progress %
  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    const nowDate = new Date().toISOString().split('T')[0];
    const updated = tasks.map(t => {
      if (t.id !== taskId) return t;
      const nextSubtasks = (t.subtasks || []).map(st =>
        st.id === subtaskId ? { ...st, completed: !st.completed } : st
      );
      const completedCount = nextSubtasks.filter(st => st.completed).length;
      const nextPct =
        nextSubtasks.length > 0 ? Math.round((completedCount / nextSubtasks.length) * 100) : t.progressPercent;
      const autoStatus: AdminTaskStatus =
        nextPct === 100
          ? 'finished'
          : t.status === 'finished'
          ? 'in_progress'
          : t.status;
      return {
        ...t,
        subtasks: nextSubtasks,
        progressPercent: nextPct,
        status: autoStatus,
        updatedAt: nowDate,
        completedAt: autoStatus === 'finished' ? nowDate : undefined,
      };
    });
    setTasks(updated);
    syncTasksToCloud(updated, true);
  };

  const handleAddInlineSubtask = (taskId: string) => {
    const text = (inlineSubtaskInputs[taskId] || '').trim();
    if (!text) return;
    const nowDate = new Date().toISOString().split('T')[0];
    const updated = tasks.map(t => {
      if (t.id !== taskId) return t;
      const nextSubtasks = [
        ...(t.subtasks || []),
        { id: `st-${Date.now()}`, title: text, completed: false },
      ];
      const completedCount = nextSubtasks.filter(st => st.completed).length;
      const nextPct = Math.round((completedCount / nextSubtasks.length) * 100);
      return {
        ...t,
        subtasks: nextSubtasks,
        progressPercent: t.status === 'finished' ? 100 : nextPct,
        updatedAt: nowDate,
      };
    });
    setTasks(updated);
    setInlineSubtaskInputs(prev => ({ ...prev, [taskId]: '' }));
    syncTasksToCloud(updated, true);
  };

  const handleDeleteTask = (task: AdminRoadmapTask) => {
    const updated = tasks.filter(t => t.id !== task.id);
    setTasks(updated);
    syncTasksToCloud(updated, true);
    showToast(`Deleted task "${task.title}".`);
  };

  const handleExportTasksCsv = () => {
    const headers = [
      'Task ID',
      'Title',
      'Category',
      'Milestone Tag',
      'Status',
      'Priority',
      'Progress (%)',
      'Deadline',
      'Subtasks Completed',
      'Created Date',
      'Completed Date',
      'Description',
    ];
    const rows = tasks.map(t => {
      const doneSub = (t.subtasks || []).filter(s => s.completed).length;
      const totalSub = (t.subtasks || []).length;
      return [
        t.id,
        t.title,
        t.category,
        t.milestoneTag || '',
        TASK_STATUS_META[t.status].label,
        TASK_PRIORITY_META[t.priority].label,
        String(t.progressPercent),
        t.deadline || '',
        `${doneSub}/${totalSub}`,
        t.createdAt,
        t.completedAt || '',
        t.description,
      ].map(v => `"${String(v).replace(/"/g, '""')}"`);
    });
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `refirely-admin-roadmap-tasks-${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Exported ${tasks.length} roadmap tasks to CSV.`);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification Banner */}
      {toastMsg && (
        <div className="px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs font-semibold flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMsg}</span>
          </div>
          <button onClick={() => setToastMsg(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* =====================================================================
          1. MODULE HEADER & PRIMARY ACTION BAR
      ===================================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-900 text-[11px] font-bold uppercase tracking-wider mb-2">
              <Rocket className="w-3.5 h-3.5 text-indigo-600" />
              <span>Product Ideation, Execution &amp; Milestone Governance</span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
              Admin Tasks, Feature Roadmap &amp; Milestone Tracker
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 max-w-3xl">
              Ideate upcoming ReFIREly features, set priority levels and target deadlines, track subtask progress across stages, and mark milestones as Finished.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => openCreateForm('planned')}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span>New Task / Milestone</span>
            </button>
            <button
              type="button"
              onClick={() => syncTasksToCloud(tasks, false)}
              disabled={isSyncingCloud}
              className="px-3.5 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 whitespace-nowrap"
            >
              <CloudUpload className="w-3.5 h-3.5 text-indigo-600" />
              <span>{isSyncingCloud ? 'Syncing...' : 'Sync to Cloud'}</span>
            </button>
            <button
              type="button"
              onClick={handleExportTasksCsv}
              className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* ===================================================================
            2. OVERALL SNAPSHOT & INFOGRAPHIC DASHBOARD (COMPACT & SPACIOUS)
        =================================================================== */}
        <div className="mt-5 pt-5 border-t border-slate-100 space-y-4">
          {/* 4 Executive KPI Cards — Slim Horizontal Layout */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50/90 border border-slate-200/90 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                <span>Total Roadmap Tasks</span>
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
              </div>
              <div className="mt-1.5 flex items-baseline justify-between gap-2">
                <span className="font-mono tabular-nums text-xl font-extrabold text-slate-900">
                  {stats.total}
                </span>
                <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded-md font-mono tabular-nums whitespace-nowrap">
                  {stats.avgOverallProgress}% Avg
                </span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1 truncate">
                {stats.ideationCount} Idea · {stats.plannedCount} Plan · {stats.inProgressCount + stats.testingCount} Active
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/90 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[11px] font-bold text-emerald-800">
                <span>Finished &amp; Shipped</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="mt-1.5 flex items-baseline justify-between gap-2">
                <span className="font-mono tabular-nums text-xl font-extrabold text-emerald-950">
                  {stats.finishedCount}{' '}
                  <span className="text-xs font-normal text-emerald-700">/ {stats.total}</span>
                </span>
                <span className="text-[11px] font-extrabold text-emerald-800 bg-emerald-100 border border-emerald-300 px-1.5 py-0.5 rounded-md font-mono tabular-nums whitespace-nowrap">
                  {stats.completionRate}% Done
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-emerald-100 overflow-hidden mt-1.5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.completionRate}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="h-full bg-emerald-600 rounded-full"
                />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/90 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[11px] font-bold text-amber-900">
                <span>Active Execution</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div className="mt-1.5 flex items-baseline justify-between gap-2">
                <span className="font-mono tabular-nums text-xl font-extrabold text-slate-900">
                  {stats.inProgressCount + stats.testingCount}
                </span>
                <span className="text-[11px] font-bold text-amber-900 bg-amber-100/80 border border-amber-300 px-1.5 py-0.5 rounded-md whitespace-nowrap">
                  {stats.testingCount} in QA
                </span>
              </div>
              <div className="text-[11px] text-slate-600 mt-1 truncate">
                {stats.inProgressCount} In Progress · {stats.plannedCount} Queued
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-50/50 border border-rose-200/80 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[11px] font-bold text-rose-900">
                <span>Priority &amp; Deadlines</span>
                <Flag className="w-3.5 h-3.5 text-rose-600" />
              </div>
              <div className="mt-1.5 flex items-baseline justify-between gap-2">
                <span className="font-mono tabular-nums text-xl font-extrabold text-slate-900">
                  {stats.criticalCount + stats.highCount}{' '}
                  <span className="text-[11px] font-semibold text-rose-800">High/Crit</span>
                </span>
                {stats.overdueCount > 0 ? (
                  <span className="text-[11px] font-extrabold text-rose-800 bg-rose-100 border border-rose-300 px-1.5 py-0.5 rounded-md whitespace-nowrap">
                    {stats.overdueCount} Overdue
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-slate-700 bg-white border border-slate-200 px-1.5 py-0.5 rounded-md whitespace-nowrap">
                    {stats.dueSoonCount} Due ≤7d
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-600 mt-1 truncate">
                {stats.criticalCount} Critical · {stats.highCount} High open
              </div>
            </div>
          </div>

          {/* Full-Width, Low-Profile Animated 5-Stage Lifecycle & Execution Funnel */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-indigo-50/65 via-white to-emerald-50/65 border border-indigo-200/75 shadow-2xs relative overflow-hidden space-y-3.5"
          >
            {/* Row 1: Header + Inline Priority Filter Pills + Completion Badge */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-teal-600 text-white flex items-center justify-center shadow-2xs shrink-0">
                  <Milestone className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-700">
                      Visual Roadmap Infographic
                    </span>
                    <span className="hidden sm:inline-block text-slate-300">•</span>
                    <span className="hidden sm:inline-block font-mono tabular-nums text-[11px] font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                      {stats.avgOverallProgress}% Weighted Progress
                    </span>
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    5-Stage Product Lifecycle &amp; Execution Funnel
                  </h3>
                </div>
              </div>

              {/* Inline Priority Breakdown Pills & Filter Reset */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-500 mr-1">Priority:</span>
                {stats.priorityStats.map(item => {
                  const isPriActive = priorityFilter === item.priority;
                  return (
                    <button
                      key={item.priority}
                      type="button"
                      onClick={() =>
                        setPriorityFilter(isPriActive ? 'all' : item.priority)
                      }
                      className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                        isPriActive
                          ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                          : 'bg-white/90 hover:bg-white text-slate-700 border-slate-200/90'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${item.meta.barColor}`} />
                      <span>{item.meta.label}</span>
                      <span
                        className={`font-mono tabular-nums text-[10px] font-extrabold px-1 rounded ${
                          isPriActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {item.total}
                      </span>
                    </button>
                  );
                })}
                {(statusFilter !== 'active' ||
                  priorityFilter !== 'all' ||
                  categoryFilter !== 'all' ||
                  searchQuery) && (
                  <button
                    type="button"
                    onClick={() => {
                      setStatusFilter('active');
                      setPriorityFilter('all');
                      setCategoryFilter('all');
                      setSearchQuery('');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] cursor-pointer whitespace-nowrap"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            </div>

            {/* Row 2: Full-Width 5-Stage Horizontal Funnel Stepper */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {(
                [
                  {
                    st: 'ideation' as AdminTaskStatus,
                    stepNum: '01',
                    icon: Lightbulb,
                    cardBg: 'from-purple-50/80 to-white',
                    borderCls: 'border-purple-200/90 hover:border-purple-400',
                    activeCls: 'ring-2 ring-purple-500 border-purple-500 bg-purple-50/90',
                    iconWrap: 'bg-purple-100 text-purple-700',
                    numText: 'text-purple-950',
                    pctBadge: 'bg-purple-100/90 text-purple-800',
                  },
                  {
                    st: 'planned' as AdminTaskStatus,
                    stepNum: '02',
                    icon: Target,
                    cardBg: 'from-sky-50/80 to-white',
                    borderCls: 'border-sky-200/90 hover:border-sky-400',
                    activeCls: 'ring-2 ring-sky-500 border-sky-500 bg-sky-50/90',
                    iconWrap: 'bg-sky-100 text-sky-700',
                    numText: 'text-sky-950',
                    pctBadge: 'bg-sky-100/90 text-sky-800',
                  },
                  {
                    st: 'in_progress' as AdminTaskStatus,
                    stepNum: '03',
                    icon: Rocket,
                    cardBg: 'from-amber-50/80 to-white',
                    borderCls: 'border-amber-200/90 hover:border-amber-400',
                    activeCls: 'ring-2 ring-amber-500 border-amber-500 bg-amber-50/90',
                    iconWrap: 'bg-amber-100 text-amber-800',
                    numText: 'text-amber-950',
                    pctBadge: 'bg-amber-100/90 text-amber-900',
                  },
                  {
                    st: 'testing' as AdminTaskStatus,
                    stepNum: '04',
                    icon: Sparkles,
                    cardBg: 'from-indigo-50/80 to-white',
                    borderCls: 'border-indigo-200/90 hover:border-indigo-400',
                    activeCls: 'ring-2 ring-indigo-500 border-indigo-500 bg-indigo-50/90',
                    iconWrap: 'bg-indigo-100 text-indigo-700',
                    numText: 'text-indigo-950',
                    pctBadge: 'bg-indigo-100/90 text-indigo-800',
                  },
                  {
                    st: 'finished' as AdminTaskStatus,
                    stepNum: '05',
                    icon: CheckCircle2,
                    cardBg: 'from-emerald-50/80 to-white',
                    borderCls: 'border-emerald-300/90 hover:border-emerald-500',
                    activeCls: 'ring-2 ring-emerald-600 border-emerald-600 bg-emerald-50/90',
                    iconWrap: 'bg-emerald-100 text-emerald-700',
                    numText: 'text-emerald-950',
                    pctBadge: 'bg-emerald-100/90 text-emerald-800',
                  },
                ] as const
              ).map((stageCfg, idx) => {
                const StageIcon = stageCfg.icon;
                const count =
                  stageCfg.st === 'finished'
                    ? stats.finishedCount
                    : stageCfg.st === 'testing'
                    ? stats.testingCount
                    : stageCfg.st === 'in_progress'
                    ? stats.inProgressCount
                    : stageCfg.st === 'planned'
                    ? stats.plannedCount
                    : stats.ideationCount;
                const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                const isSelected = statusFilter === stageCfg.st;

                return (
                  <motion.button
                    key={stageCfg.st}
                    type="button"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05, duration: 0.3, ease: 'easeOut' }}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.985 }}
                    onClick={() => setStatusFilter(isSelected ? 'active' : stageCfg.st)}
                    className={`group relative text-left px-3.5 py-2.5 rounded-xl bg-gradient-to-br ${stageCfg.cardBg} border transition-all cursor-pointer shadow-2xs ${
                      isSelected ? stageCfg.activeCls : stageCfg.borderCls
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${stageCfg.iconWrap} transition-transform group-hover:scale-110`}
                        >
                          <StageIcon className="w-3.5 h-3.5" />
                        </span>
                        <span className="text-xs font-extrabold text-slate-800 truncate">
                          {TASK_STATUS_META[stageCfg.st].shortLabel}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] font-bold text-slate-400 shrink-0">
                        {stageCfg.stepNum}
                      </span>
                    </div>

                    <div className="mt-2 flex items-baseline justify-between gap-2">
                      <div className="flex items-baseline gap-1">
                        <span className={`font-mono tabular-nums text-lg font-black ${stageCfg.numText}`}>
                          {count}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500">tasks</span>
                      </div>
                      <span
                        className={`font-mono tabular-nums text-[10px] font-extrabold px-1.5 py-0.5 rounded ${stageCfg.pctBadge}`}
                      >
                        {pct}%
                      </span>
                    </div>

                    <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden mt-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.65, delay: 0.1 + idx * 0.05, ease: 'easeOut' }}
                        className={`h-full rounded-full ${TASK_STATUS_META[stageCfg.st].barColor}`}
                      />
                    </div>

                    {idx < 4 && (
                      <div className="hidden sm:flex items-center justify-center absolute -right-2.5 top-1/2 -translate-y-1/2 z-10 w-4 h-4 rounded-full bg-white border border-slate-200 text-slate-400 shadow-2xs pointer-events-none">
                        <ArrowRight className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Row 3: Slim Single-Row Workstream Velocity Strip (6 columns on desktop) */}
            <div className="pt-2.5 border-t border-indigo-100/80">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {stats.categoryStats.slice(0, 6).map((cat, catIdx) => (
                  <motion.button
                    key={cat.category}
                    type="button"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 + catIdx * 0.04, duration: 0.25 }}
                    whileHover={{ y: -1 }}
                    onClick={() =>
                      setCategoryFilter(categoryFilter === cat.category ? 'all' : cat.category)
                    }
                    className={`text-left px-2.5 py-2 rounded-lg bg-white/90 border transition-all cursor-pointer ${
                      categoryFilter === cat.category
                        ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                        : 'border-slate-200/80 hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] gap-1 mb-1">
                      <span className="font-bold text-slate-700 truncate">{cat.category}</span>
                      <span className="font-mono tabular-nums text-[10px] font-extrabold text-teal-700 shrink-0">
                        {cat.avgProgress}%
                      </span>
                    </div>
                    <div className="w-full h-1 rounded-full bg-slate-100 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${cat.avgProgress}%` }}
                        transition={{ duration: 0.65, delay: 0.15 + catIdx * 0.04, ease: 'easeOut' }}
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-teal-500 to-emerald-500"
                      />
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* =====================================================================
          3. COLLAPSIBLE CREATE / EDIT TASK FORM
      ===================================================================== */}
      {isFormOpen && (
        <form
          onSubmit={handleSaveTask}
          className="bg-white rounded-2xl border-2 border-indigo-300 p-5 sm:p-6 shadow-md space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-600 text-white">
                <CheckSquare className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {editingTaskId ? 'Edit Task / Milestone' : 'Create New Project Task or Feature Milestone'}
                </h3>
                <p className="text-xs text-slate-500">
                  Set deadline, priority, execution status, and optional checklist subtasks.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                resetForm();
                setIsFormOpen(false);
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-6">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Task / Feature Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g., Launch Interactive Healthcare Cost Estimator for Top 50 Havens"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Workstream Category
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as AdminTaskCategory)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 bg-white focus:outline-none focus:border-indigo-500"
              >
                {TASK_CATEGORIES.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Milestone / Release Tag
              </label>
              <input
                type="text"
                value={milestoneTag}
                onChange={e => setMilestoneTag(e.target.value)}
                placeholder="e.g., Q1 2027 Product Roadmap"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Current Stage / Status
              </label>
              <select
                value={status}
                onChange={e => {
                  const next = e.target.value as AdminTaskStatus;
                  setStatus(next);
                  setProgressPercent(TASK_STATUS_META[next].defaultProgress);
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 bg-white focus:outline-none focus:border-indigo-500"
              >
                {(Object.keys(TASK_STATUS_META) as AdminTaskStatus[]).map(st => (
                  <option key={st} value={st}>
                    {TASK_STATUS_META[st].label}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Priority Level
              </label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as AdminTaskPriority)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 bg-white focus:outline-none focus:border-indigo-500"
              >
                {(Object.keys(TASK_PRIORITY_META) as AdminTaskPriority[]).map(p => (
                  <option key={p} value={p}>
                    {TASK_PRIORITY_META[p].label}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Target Deadline
              </label>
              <input
                type="date"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-semibold text-slate-900 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Completion Progress ({status === 'finished' ? 100 : progressPercent}%)
              </label>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                disabled={status === 'finished'}
                value={status === 'finished' ? 100 : progressPercent}
                onChange={e => setProgressPercent(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer mt-2"
              />
            </div>

            <div className="md:col-span-12">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Scope, Ideation Notes &amp; Acceptance Criteria
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe the feature goal, user impact, technical notes, or success metrics..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Subtasks Builder inside Create/Edit Form */}
            <div className="md:col-span-12 p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
              <label className="block text-xs font-bold text-slate-700">
                Actionable Subtasks / Checklist ({subtasksDraft.length})
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSubtaskInput}
                  onChange={e => setNewSubtaskInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (!newSubtaskInput.trim()) return;
                      setSubtasksDraft(prev => [
                        ...prev,
                        { id: `st-${Date.now()}`, title: newSubtaskInput.trim(), completed: false },
                      ]);
                      setNewSubtaskInput('');
                    }
                  }}
                  placeholder="Add a step or subtask (press Enter or click Add)..."
                  className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newSubtaskInput.trim()) return;
                    setSubtasksDraft(prev => [
                      ...prev,
                      { id: `st-${Date.now()}`, title: newSubtaskInput.trim(), completed: false },
                    ]);
                    setNewSubtaskInput('');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer"
                >
                  + Add Step
                </button>
              </div>
              {subtasksDraft.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  {subtasksDraft.map(st => (
                    <div
                      key={st.id}
                      className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs"
                    >
                      <label className="flex items-center gap-2 cursor-pointer flex-1">
                        <input
                          type="checkbox"
                          checked={st.completed}
                          onChange={() =>
                            setSubtasksDraft(prev =>
                              prev.map(item =>
                                item.id === st.id ? { ...item, completed: !item.completed } : item
                              )
                            )
                          }
                          className="rounded accent-emerald-600"
                        />
                        <span className={st.completed ? 'line-through text-slate-400' : 'text-slate-800'}>
                          {st.title}
                        </span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setSubtasksDraft(prev => prev.filter(item => item.id !== st.id))}
                        className="text-slate-400 hover:text-rose-600 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                resetForm();
                setIsFormOpen(false);
              }}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>{editingTaskId ? 'Save Task Changes' : 'Create Task'}</span>
            </button>
          </div>
        </form>
      )}

      {/* =====================================================================
          4. FILTER BAR & VIEW MODE SWITCHER (LIST / KANBAN / MILESTONES)
      ===================================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* View Mode Tabs */}
          <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200/80 self-start">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                viewMode === 'list' ? 'bg-slate-900 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ListChecks className="w-3.5 h-3.5" />
              <span>Task Ledger ({filteredTasks.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                viewMode === 'kanban' ? 'bg-slate-900 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>5-Stage Kanban Board</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('milestones')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                viewMode === 'milestones' ? 'bg-slate-900 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Milestone className="w-3.5 h-3.5" />
              <span>Milestone Roadmap ({milestoneGroups.length})</span>
            </button>
          </div>

          {/* Search & Dropdown Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[200px] flex-1 sm:flex-initial">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search features, milestones..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none"
            >
              <option value="active">Active / Open Only ({stats.activeCount})</option>
              <option value="all">All Stages ({tasks.length})</option>
              <option value="ideation">Ideation ({stats.ideationCount})</option>
              <option value="planned">Planned ({stats.plannedCount})</option>
              <option value="in_progress">In Progress ({stats.inProgressCount})</option>
              <option value="testing">Testing / QA ({stats.testingCount})</option>
              <option value="finished">Finished ({stats.finishedCount})</option>
            </select>

            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical Priority</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>

            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none"
            >
              <option value="all">All Categories</option>
              {TASK_CATEGORIES.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none"
            >
              <option value="priority-desc">Sort: Priority &amp; Deadline</option>
              <option value="deadline-asc">Sort: Earliest Deadline</option>
              <option value="progress-desc">Sort: Highest Progress %</option>
              <option value="updated-desc">Sort: Recently Updated</option>
            </select>
          </div>
        </div>
      </div>

      {/* =====================================================================
          5A. LIST & LEDGER VIEW
      ===================================================================== */}
      {viewMode === 'list' && (
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-3">
              <CheckSquare className="w-8 h-8 text-slate-400 mx-auto" />
              <div className="text-sm font-bold text-slate-800">No tasks match your active filters</div>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Try clearing your search filter or click &ldquo;New Task / Milestone&rdquo; to add a new feature idea.
              </p>
            </div>
          ) : (
            filteredTasks.map(task => {
              const isFinished = task.status === 'finished';
              const statusMeta = TASK_STATUS_META[task.status];
              const priorityMeta = TASK_PRIORITY_META[task.priority];
              const deadlineBadge = getDeadlineBadge(task);
              const subtasks = task.subtasks || [];
              const completedSubtasks = subtasks.filter(s => s.completed).length;
              const isExpanded = Boolean(expandedTaskIds[task.id]);

              return (
                <div
                  key={task.id}
                  className={`bg-white rounded-2xl border transition-all p-4 sm:p-5 shadow-2xs ${
                    isFinished
                      ? 'border-emerald-200/90 bg-emerald-50/15'
                      : task.priority === 'critical'
                      ? 'border-rose-200/90 hover:border-rose-300'
                      : 'border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left: Title, Badges, Description */}
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase border ${priorityMeta.badgeClass}`}
                        >
                          {priorityMeta.label}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${statusMeta.badgeClass}`}
                        >
                          {statusMeta.label}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          {task.category}
                        </span>
                        {task.milestoneTag && (
                          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
                            🎯 {task.milestoneTag}
                          </span>
                        )}
                        <span
                          className={`px-2.5 py-0.5 rounded-md text-[10px] font-mono border ${deadlineBadge.className}`}
                        >
                          📅 {deadlineBadge.text}
                        </span>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <h3
                          className={`text-sm sm:text-base font-extrabold ${
                            isFinished ? 'line-through text-slate-500' : 'text-slate-900'
                          }`}
                        >
                          {task.title}
                        </h3>
                      </div>

                      {task.description && (
                        <p className="text-xs text-slate-600 leading-relaxed">{task.description}</p>
                      )}
                    </div>

                    {/* Right: Progress Bar, Status Switcher, & Mark as Finished Button */}
                    <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end justify-between gap-3 shrink-0 lg:w-72">
                      {/* Progress bar */}
                      <div className="w-full space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-bold">
                          <span className="text-slate-500">
                            {subtasks.length > 0
                              ? `Checklist: ${completedSubtasks}/${subtasks.length} steps`
                              : 'Execution Progress'}
                          </span>
                          <span className="font-mono tabular-nums text-slate-900">
                            {isFinished ? 100 : task.progressPercent}%
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${statusMeta.barColor}`}
                            style={{ width: `${isFinished ? 100 : task.progressPercent}%` }}
                          />
                        </div>
                      </div>

                      {/* Action Buttons Row */}
                      <div className="flex flex-wrap items-center justify-end gap-1.5">
                        {/* Quick Stage Select */}
                        <select
                          value={task.status}
                          onChange={e =>
                            handleQuickStatusChange(task.id, e.target.value as AdminTaskStatus)
                          }
                          className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-[11px] font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 cursor-pointer focus:outline-none"
                          title="Change Task Stage"
                        >
                          {(Object.keys(TASK_STATUS_META) as AdminTaskStatus[]).map(st => (
                            <option key={st} value={st}>
                              {TASK_STATUS_META[st].shortLabel}
                            </option>
                          ))}
                        </select>

                        {/* Primary Option to Mark as Finished */}
                        <button
                          type="button"
                          onClick={() => handleToggleFinished(task)}
                          className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap ${
                            isFinished
                              ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                          }`}
                        >
                          {isFinished ? (
                            <>
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Reopen</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Mark Finished</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setExpandedTaskIds(prev => ({ ...prev, [task.id]: !prev[task.id] }))
                          }
                          className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                          title="Toggle Checklist Subtasks"
                        >
                          <span>Steps ({subtasks.length})</span>
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => openEditForm(task)}
                          className="p-1.5 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 cursor-pointer"
                          title="Edit Task"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteTask(task)}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                          title="Delete Task"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expandable Subtasks Checklist Drawer */}
                  {isExpanded && (
                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Actionable Subtasks &amp; Acceptance Steps
                      </div>
                      {subtasks.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {subtasks.map(st => (
                            <label
                              key={st.id}
                              className={`flex items-center gap-2.5 p-2 rounded-xl border text-xs cursor-pointer transition-colors ${
                                st.completed
                                  ? 'bg-emerald-50/50 border-emerald-200 text-slate-500 line-through'
                                  : 'bg-slate-50 border-slate-200/80 text-slate-800 hover:border-indigo-300'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={st.completed}
                                onChange={() => handleToggleSubtask(task.id, st.id)}
                                className="rounded accent-emerald-600 cursor-pointer"
                              />
                              <span className="font-medium">{st.title}</span>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400">No subtasks added yet.</p>
                      )}

                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="text"
                          value={inlineSubtaskInputs[task.id] || ''}
                          onChange={e =>
                            setInlineSubtaskInputs(prev => ({ ...prev, [task.id]: e.target.value }))
                          }
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddInlineSubtask(task.id);
                            }
                          }}
                          placeholder="Add a quick subtask step..."
                          className="flex-1 max-w-md px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddInlineSubtask(task.id)}
                          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
                        >
                          + Add Step
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* =====================================================================
          5B. 5-STAGE KANBAN BOARD VIEW
      ===================================================================== */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 items-start">
          {(['ideation', 'planned', 'in_progress', 'testing', 'finished'] as AdminTaskStatus[]).map(
            stage => {
              const stageMeta = TASK_STATUS_META[stage];
              const stageTasks = filteredTasks.filter(t => t.status === stage);

              return (
                <div
                  key={stage}
                  className="bg-slate-100/80 rounded-2xl border border-slate-200/90 p-3 space-y-3"
                >
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${stageMeta.dotColor}`} />
                      <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                        {stageMeta.shortLabel}
                      </h4>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-full bg-white border border-slate-200 font-mono text-[11px] font-bold text-slate-700">
                        {stageTasks.length}
                      </span>
                      <button
                        type="button"
                        onClick={() => openCreateForm(stage)}
                        className="p-1 rounded-lg bg-white hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 border border-slate-200 cursor-pointer"
                        title={`Add task to ${stageMeta.shortLabel}`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {stageTasks.length === 0 ? (
                      <div className="p-4 rounded-xl border border-dashed border-slate-300 text-center text-[11px] text-slate-400">
                        No tasks in {stageMeta.shortLabel}
                      </div>
                    ) : (
                      stageTasks.map(task => {
                        const priorityMeta = TASK_PRIORITY_META[task.priority];
                        const isFinished = task.status === 'finished';
                        return (
                          <div
                            key={task.id}
                            className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-2.5 flex flex-col justify-between"
                          >
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between gap-1">
                                <span
                                  className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase border ${priorityMeta.badgeClass}`}
                                >
                                  {priorityMeta.label}
                                </span>
                                <span className="text-[10px] font-mono text-slate-500">
                                  {task.deadline}
                                </span>
                              </div>
                              <h5
                                className={`text-xs font-extrabold leading-snug ${
                                  isFinished ? 'line-through text-slate-500' : 'text-slate-900'
                                }`}
                              >
                                {task.title}
                              </h5>
                              <p className="text-[11px] text-slate-500 line-clamp-2">
                                {task.description}
                              </p>
                            </div>

                            <div className="space-y-2 pt-2 border-t border-slate-100">
                              <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${stageMeta.barColor}`}
                                  style={{ width: `${isFinished ? 100 : task.progressPercent}%` }}
                                />
                              </div>

                              <div className="flex items-center justify-between gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleToggleFinished(task)}
                                  className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                                    isFinished
                                      ? 'bg-slate-100 text-slate-600'
                                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                  }`}
                                >
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>{isFinished ? 'Reopen' : 'Finish'}</span>
                                </button>

                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => openEditForm(task)}
                                    className="p-1 rounded text-slate-400 hover:text-indigo-600 cursor-pointer"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteTask(task)}
                                    className="p-1 rounded text-slate-400 hover:text-rose-600 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            }
          )}
        </div>
      )}

      {/* =====================================================================
          5C. MILESTONE & RELEASE ROADMAP VIEW
      ===================================================================== */}
      {viewMode === 'milestones' && (
        <div className="space-y-4">
          {milestoneGroups.map(group => (
            <div
              key={group.milestone}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200">
                    <Target className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">{group.milestone}</h3>
                    <p className="text-xs text-slate-500">
                      {group.done} of {group.total} tasks finished · {group.avgPct}% overall milestone completion
                    </p>
                  </div>
                </div>
                <div className="w-full sm:w-48 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono font-bold text-indigo-900">
                    <span>Milestone Progress</span>
                    <span>{group.avgPct}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-emerald-500"
                      style={{ width: `${group.avgPct}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {group.items.map(task => {
                  const isFinished = task.status === 'finished';
                  const priorityMeta = TASK_PRIORITY_META[task.priority];
                  const statusMeta = TASK_STATUS_META[task.status];
                  return (
                    <div
                      key={task.id}
                      className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase border ${priorityMeta.badgeClass}`}
                          >
                            {priorityMeta.label}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[9px] font-bold border ${statusMeta.badgeClass}`}
                          >
                            {statusMeta.shortLabel}
                          </span>
                          <span className="font-bold text-slate-900">{task.title}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">{task.description}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono text-[11px] text-slate-500">
                          Due {task.deadline}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleToggleFinished(task)}
                          className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                            isFinished
                              ? 'bg-slate-100 text-slate-700'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{isFinished ? 'Finished ✓' : 'Mark Finished'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
