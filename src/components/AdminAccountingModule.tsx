import React, { useState, useEffect, useMemo } from 'react';
import {
  IndianRupee,
  DollarSign,
  Plus,
  Trash2,
  Edit,
  Download,
  TrendingDown,
  TrendingUp,
  Wallet,
  Calendar,
  Building2,
  Tag,
  FileText,
  Search,
  Filter,
  CheckCircle2,
  X,
  RefreshCw,
  PieChart,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  CloudUpload,
} from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';

export type TransactionType = 'expense' | 'revenue';
export type TransactionCurrency = 'INR' | 'USD';

export interface AccountingTransaction {
  id: string;
  date: string; // YYYY-MM-DD
  type: TransactionType;
  currency: TransactionCurrency;
  amount: number; // In original currency
  exchangeRateAtEntry: number; // 1 USD = X INR
  amountINR: number;
  amountUSD: number;
  vendor: string; // Paid To (Expense) or Received From (Revenue)
  category: string; // Head of Transaction
  description: string;
  paymentMode: string;
  referenceNo?: string;
  createdAt: string;
}

const STORAGE_KEY_TRANSACTIONS = 'refirely_admin_accounting_transactions_v1';
const STORAGE_KEY_VENDORS = 'refirely_admin_accounting_vendors_v1';
const STORAGE_KEY_EXPENSE_CATEGORIES = 'refirely_admin_accounting_expense_cats_v1';
const STORAGE_KEY_REVENUE_CATEGORIES = 'refirely_admin_accounting_revenue_cats_v1';
const STORAGE_KEY_FX_RATE = 'refirely_admin_accounting_usd_inr_rate_v1';

const DEFAULT_VENDORS: string[] = [
  'Google Cloud / Firebase',
  'Namecheap / GoDaddy (Domain)',
  'Cloudflare',
  'Google Workspace / Analytics',
  'Meta Ads (Facebook / Instagram)',
  'Google Ads',
  'Gemini / AI API Services',
  'Canva / Design Assets',
  'Vercel / Hosting Provider',
  'Freelance Developer / Designer',
  'CA / Legal & Compliance',
  'Direct Client / Sponsor',
];

const DEFAULT_EXPENSE_CATEGORIES: string[] = [
  'Cloud Hosting & Database',
  'Domain & DNS Renewal',
  'AI & API Subscriptions',
  'Social Media & Paid Marketing',
  'Software & SaaS Tools',
  'Design, Logo & Media Assets',
  'Content & Country Research',
  'Freelancer / Contractor Payout',
  'Legal, Tax & Accounting',
  'Office & Internet Utilities',
  'Miscellaneous Website Expense',
];

const DEFAULT_REVENUE_CATEGORIES: string[] = [
  'Affiliate & Partner Commissions',
  'Sponsored Country Dossier / Ad',
  'Premium Membership / Subscription',
  'PDF Country Guide Sales',
  'Relocation Consultation Fee',
  'Other Website Revenue',
];

const PAYMENT_MODES: string[] = [
  'UPI / GPay / PhonePe',
  'Credit Card',
  'NetBanking / NEFT / IMPS',
  'Debit Card',
  'Auto-Debit / Standing Instruction',
  'PayPal / International Wire',
  'Cash / Other',
];

export function formatINR(value: number): string {
  const rounded = Math.round(value);
  return `₹${rounded.toLocaleString('en-IN')}`;
}

export function formatUSD(value: number): string {
  return `$${value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

const CATEGORY_COLORS = [
  '#0d9488', // teal-600
  '#4f46e5', // indigo-600
  '#f59e0b', // amber-500
  '#e11d48', // rose-600
  '#8b5cf6', // violet-500
  '#0284c7', // sky-600
  '#10b981', // emerald-500
  '#ea580c', // orange-600
];

export const AdminAccountingModule: React.FC = () => {
  // Exchange rate: 1 USD = X INR
  const [usdToInrRate, setUsdToInrRate] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_FX_RATE);
      const parsed = saved ? parseFloat(saved) : 94.5;
      return !isNaN(parsed) && parsed > 0 ? parsed : 94.5;
    } catch {
      return 94.5;
    }
  });

  // Display currency for summary & charts (Default: INR ₹)
  const [displayCurrency, setDisplayCurrency] = useState<TransactionCurrency>('INR');

  // Vendors list
  const [vendors, setVendors] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_VENDORS);
      return saved ? JSON.parse(saved) : DEFAULT_VENDORS;
    } catch {
      return DEFAULT_VENDORS;
    }
  });

  // Expense Categories / Heads of Transaction
  const [expenseCategories, setExpenseCategories] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_EXPENSE_CATEGORIES);
      return saved ? JSON.parse(saved) : DEFAULT_EXPENSE_CATEGORIES;
    } catch {
      return DEFAULT_EXPENSE_CATEGORIES;
    }
  });

  // Revenue Categories / Heads of Transaction
  const [revenueCategories, setRevenueCategories] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_REVENUE_CATEGORIES);
      return saved ? JSON.parse(saved) : DEFAULT_REVENUE_CATEGORIES;
    } catch {
      return DEFAULT_REVENUE_CATEGORIES;
    }
  });

  // Transactions Ledger (Starts with 0 revenue as requested)
  const [transactions, setTransactions] = useState<AccountingTransaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Entry Form State
  const todayStr = new Date().toISOString().split('T')[0];
  const [txType, setTxType] = useState<TransactionType>('expense');
  const [txDate, setTxDate] = useState<string>(todayStr);
  const [txCurrency, setTxCurrency] = useState<TransactionCurrency>('INR'); // Default Indian Rupee
  const [txAmount, setTxAmount] = useState<string>('');
  const [txVendor, setTxVendor] = useState<string>(vendors[0] || DEFAULT_VENDORS[0]);
  const [txCategory, setTxCategory] = useState<string>(
    expenseCategories[0] || DEFAULT_EXPENSE_CATEGORIES[0]
  );
  const [txDescription, setTxDescription] = useState<string>('');
  const [txPaymentMode, setTxPaymentMode] = useState<string>(PAYMENT_MODES[0]);
  const [txReferenceNo, setTxReferenceNo] = useState<string>('');
  const [editingTxId, setEditingTxId] = useState<string | null>(null);

  // Inline "Add New Vendor" and "Add New Category / Head" toggles
  const [isAddingNewVendor, setIsAddingNewVendor] = useState(false);
  const [newVendorInput, setNewVendorInput] = useState('');
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState('');

  // Filters for Ledger Table
  const [filterType, setFilterType] = useState<'all' | TransactionType>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterVendor, setFilterVendor] = useState<string>('all');
  const [filterCurrency, setFilterCurrency] = useState<'all' | TransactionCurrency>('all');
  const [filterMonth, setFilterMonth] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Status feedback
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Persist to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(transactions));
    } catch {}
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_VENDORS, JSON.stringify(vendors));
    } catch {}
  }, [vendors]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_EXPENSE_CATEGORIES, JSON.stringify(expenseCategories));
    } catch {}
  }, [expenseCategories]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_REVENUE_CATEGORIES, JSON.stringify(revenueCategories));
    } catch {}
  }, [revenueCategories]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_FX_RATE, String(usdToInrRate));
    } catch {}
  }, [usdToInrRate]);

  // Keep category dropdown synced when switching between Expense and Revenue
  useEffect(() => {
    if (editingTxId) return;
    if (txType === 'expense') {
      if (!expenseCategories.includes(txCategory)) {
        setTxCategory(expenseCategories[0] || DEFAULT_EXPENSE_CATEGORIES[0]);
      }
    } else {
      if (!revenueCategories.includes(txCategory)) {
        setTxCategory(revenueCategories[0] || DEFAULT_REVENUE_CATEGORIES[0]);
      }
    }
  }, [txType, expenseCategories, revenueCategories, editingTxId, txCategory]);

  // Sync with Firebase Cloud (/users/{uid}/workspace/accounting)
  const syncAccountingToCloud = async (
    txList = transactions,
    vendorList = vendors,
    expCats = expenseCategories,
    revCats = revenueCategories,
    fxRate = usdToInrRate
  ) => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      showToast('Saved locally. Sign in with Google in Admin Cloud tab to sync across devices.');
      return;
    }
    setIsSyncingCloud(true);
    const docPath = `users/${currentUser.uid}/workspace/accounting`;
    try {
      await setDoc(doc(db, 'users', currentUser.uid, 'workspace', 'accounting'), {
        id: 'accounting',
        userId: currentUser.uid,
        transactions: txList,
        vendors: vendorList,
        expenseCategories: expCats,
        revenueCategories: revCats,
        usdToInrRate: fxRate,
        updatedAt: new Date().toISOString().slice(0, 40),
      });
      showToast('Accounting ledger & categories synced to Firebase Cloud!');
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
    const docPath = `users/${currentUser.uid}/workspace/accounting`;
    getDoc(doc(db, 'users', currentUser.uid, 'workspace', 'accounting'))
      .then(snap => {
        if (snap.exists()) {
          const data = snap.data();
          if (Array.isArray(data.transactions) && data.transactions.length > 0 && transactions.length === 0) {
            setTransactions(data.transactions);
          }
          if (Array.isArray(data.vendors) && data.vendors.length > 0) {
            setVendors(Array.from(new Set([...DEFAULT_VENDORS, ...data.vendors])));
          }
          if (Array.isArray(data.expenseCategories) && data.expenseCategories.length > 0) {
            setExpenseCategories(
              Array.from(new Set([...DEFAULT_EXPENSE_CATEGORIES, ...data.expenseCategories]))
            );
          }
          if (Array.isArray(data.revenueCategories) && data.revenueCategories.length > 0) {
            setRevenueCategories(
              Array.from(new Set([...DEFAULT_REVENUE_CATEGORIES, ...data.revenueCategories]))
            );
          }
          if (typeof data.usdToInrRate === 'number' && data.usdToInrRate > 0 && data.usdToInrRate !== 84.5) {
            setUsdToInrRate(data.usdToInrRate);
          }
        }
      })
      .catch(err => {
        console.warn('Could not fetch cloud accounting doc:', err, docPath);
      });
  }, []);

  const handleAddNewVendor = () => {
    const clean = newVendorInput.trim();
    if (!clean) return;
    if (!vendors.includes(clean)) {
      const updated = [clean, ...vendors];
      setVendors(updated);
    }
    setTxVendor(clean);
    setNewVendorInput('');
    setIsAddingNewVendor(false);
    showToast(`Added vendor "${clean}" to your vendor list.`);
  };

  const handleAddNewCategory = () => {
    const clean = newCategoryInput.trim();
    if (!clean) return;
    if (txType === 'expense') {
      if (!expenseCategories.includes(clean)) {
        setExpenseCategories([clean, ...expenseCategories]);
      }
    } else {
      if (!revenueCategories.includes(clean)) {
        setRevenueCategories([clean, ...revenueCategories]);
      }
    }
    setTxCategory(clean);
    setNewCategoryInput('');
    setIsAddingNewCategory(false);
    showToast(`Added "${clean}" to ${txType === 'expense' ? 'Expense' : 'Revenue'} Heads.`);
  };

  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(txAmount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      showToast('Please enter a valid amount greater than 0.');
      return;
    }

    const rate = usdToInrRate > 0 ? usdToInrRate : 94.5;
    const amountINR = txCurrency === 'INR' ? numericAmount : numericAmount * rate;
    const amountUSD = txCurrency === 'USD' ? numericAmount : numericAmount / rate;

    const finalVendor = txVendor.trim() || 'Direct Vendor';
    const finalCategory =
      txCategory.trim() ||
      (txType === 'expense' ? 'Miscellaneous Website Expense' : 'Other Website Revenue');

    const newRecord: AccountingTransaction = {
      id: editingTxId || `tx-${Date.now()}`,
      date: txDate || todayStr,
      type: txType,
      currency: txCurrency,
      amount: numericAmount,
      exchangeRateAtEntry: rate,
      amountINR: Math.round(amountINR * 100) / 100,
      amountUSD: Math.round(amountUSD * 100) / 100,
      vendor: finalVendor,
      category: finalCategory,
      description: txDescription.trim() || `${finalCategory} — ${finalVendor}`,
      paymentMode: txPaymentMode,
      referenceNo: txReferenceNo.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    let nextTransactions: AccountingTransaction[];
    if (editingTxId) {
      nextTransactions = transactions.map(t => (t.id === editingTxId ? newRecord : t));
      setEditingTxId(null);
      showToast('Updated transaction in accounting ledger.');
    } else {
      nextTransactions = [newRecord, ...transactions];
      showToast(
        `Recorded ${txType === 'expense' ? 'Expense' : 'Revenue'}: ${
          txCurrency === 'INR' ? formatINR(numericAmount) : formatUSD(numericAmount)
        }`
      );
    }

    // Sort newest date first
    nextTransactions.sort((a, b) => b.date.localeCompare(a.date));
    setTransactions(nextTransactions);

    // Reset form fields
    setTxAmount('');
    setTxDescription('');
    setTxReferenceNo('');

    if (auth.currentUser) {
      syncAccountingToCloud(nextTransactions);
    }
  };

  const handleEditTransaction = (tx: AccountingTransaction) => {
    setEditingTxId(tx.id);
    setTxType(tx.type);
    setTxDate(tx.date);
    setTxCurrency(tx.currency);
    setTxAmount(String(tx.amount));
    setTxVendor(tx.vendor);
    setTxCategory(tx.category);
    setTxDescription(tx.description);
    setTxPaymentMode(tx.paymentMode || PAYMENT_MODES[0]);
    setTxReferenceNo(tx.referenceNo || '');
    window.scrollTo({ top: 180, behavior: 'smooth' });
  };

  const handleDeleteTransaction = (id: string) => {
    const next = transactions.filter(t => t.id !== id);
    setTransactions(next);
    if (editingTxId === id) {
      setEditingTxId(null);
      setTxAmount('');
      setTxDescription('');
    }
    showToast('Deleted transaction entry.');
    if (auth.currentUser) {
      syncAccountingToCloud(next);
    }
  };

  // Available months from transactions + last 6 months for charts
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      set.add(ym);
    }
    transactions.forEach(t => {
      if (t.date && t.date.length >= 7) {
        set.add(t.date.slice(0, 7));
      }
    });
    return Array.from(set).sort();
  }, [transactions]);

  // Filtered transactions for Ledger Table
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      if (filterType !== 'all' && t.type !== filterType) return false;
      if (filterCategory !== 'all' && t.category !== filterCategory) return false;
      if (filterVendor !== 'all' && t.vendor !== filterVendor) return false;
      if (filterCurrency !== 'all' && t.currency !== filterCurrency) return false;
      if (filterMonth !== 'all' && !t.date.startsWith(filterMonth)) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          t.description.toLowerCase().includes(q) ||
          t.vendor.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          (t.referenceNo && t.referenceNo.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }, [
    transactions,
    filterType,
    filterCategory,
    filterVendor,
    filterCurrency,
    filterMonth,
    searchQuery,
  ]);

  // Aggregate Financial Metrics
  const summary = useMemo(() => {
    let totalExpenseINR = 0;
    let totalExpenseUSD = 0;
    let directINRSpent = 0;
    let directUSDSpent = 0;

    let totalRevenueINR = 0;
    let totalRevenueUSD = 0;
    let directINRRevenue = 0;
    let directUSDRevenue = 0;

    const byCategoryINR: Record<string, number> = {};
    const byVendorINR: Record<string, number> = {};
    const monthlyMap: Record<
      string,
      { month: string; expenseINR: number; revenueINR: number; expenseUSD: number; revenueUSD: number }
    > = {};

    availableMonths.forEach(ym => {
      monthlyMap[ym] = { month: ym, expenseINR: 0, revenueINR: 0, expenseUSD: 0, revenueUSD: 0 };
    });

    transactions.forEach(t => {
      const ym = t.date.slice(0, 7);
      if (!monthlyMap[ym]) {
        monthlyMap[ym] = { month: ym, expenseINR: 0, revenueINR: 0, expenseUSD: 0, revenueUSD: 0 };
      }

      if (t.type === 'expense') {
        totalExpenseINR += t.amountINR;
        totalExpenseUSD += t.amountUSD;
        if (t.currency === 'INR') directINRSpent += t.amount;
        else directUSDSpent += t.amount;

        byCategoryINR[t.category] = (byCategoryINR[t.category] || 0) + t.amountINR;
        byVendorINR[t.vendor] = (byVendorINR[t.vendor] || 0) + t.amountINR;

        monthlyMap[ym].expenseINR += t.amountINR;
        monthlyMap[ym].expenseUSD += t.amountUSD;
      } else {
        totalRevenueINR += t.amountINR;
        totalRevenueUSD += t.amountUSD;
        if (t.currency === 'INR') directINRRevenue += t.amount;
        else directUSDRevenue += t.amount;

        monthlyMap[ym].revenueINR += t.amountINR;
        monthlyMap[ym].revenueUSD += t.amountUSD;
      }
    });

    const categoryBreakdown = Object.entries(byCategoryINR)
      .map(([name, amountINR]) => ({
        name,
        amountINR,
        amountUSD: amountINR / (usdToInrRate || 94.5),
        pct: totalExpenseINR > 0 ? Math.round((amountINR / totalExpenseINR) * 100) : 0,
      }))
      .sort((a, b) => b.amountINR - a.amountINR);

    const vendorBreakdown = Object.entries(byVendorINR)
      .map(([name, amountINR]) => ({
        name,
        amountINR,
        amountUSD: amountINR / (usdToInrRate || 94.5),
        pct: totalExpenseINR > 0 ? Math.round((amountINR / totalExpenseINR) * 100) : 0,
      }))
      .sort((a, b) => b.amountINR - a.amountINR);

    const monthlySeries = Object.values(monthlyMap).sort((a, b) =>
      a.month.localeCompare(b.month)
    );

    return {
      totalExpenseINR,
      totalExpenseUSD,
      directINRSpent,
      directUSDSpent,
      totalRevenueINR,
      totalRevenueUSD,
      directINRRevenue,
      directUSDRevenue,
      netBalanceINR: totalRevenueINR - totalExpenseINR,
      netBalanceUSD: totalRevenueUSD - totalExpenseUSD,
      categoryBreakdown,
      vendorBreakdown,
      monthlySeries,
    };
  }, [transactions, availableMonths, usdToInrRate]);

  // Filtered Table Subtotals
  const filteredTotals = useMemo(() => {
    let expINR = 0;
    let expUSD = 0;
    let revINR = 0;
    let revUSD = 0;
    filteredTransactions.forEach(t => {
      if (t.type === 'expense') {
        expINR += t.amountINR;
        expUSD += t.amountUSD;
      } else {
        revINR += t.amountINR;
        revUSD += t.amountUSD;
      }
    });
    return { expINR, expUSD, revINR, revUSD };
  }, [filteredTransactions]);

  // Export CSV
  const handleExportCsv = () => {
    const headers = [
      'Transaction ID',
      'Date',
      'Type',
      'Category / Head of Transaction',
      'Paid To / Vendor',
      'Description',
      'Original Currency',
      'Original Amount',
      'Amount in INR (Rs)',
      'Amount in USD ($)',
      'FX Rate (USD to INR)',
      'Payment Mode',
      'Reference / Invoice No',
    ];

    const rows = filteredTransactions.map(t =>
      [
        t.id,
        t.date,
        t.type.toUpperCase(),
        t.category,
        t.vendor,
        t.description,
        t.currency,
        t.amount.toFixed(2),
        t.amountINR.toFixed(2),
        t.amountUSD.toFixed(2),
        t.exchangeRateAtEntry.toFixed(2),
        t.paymentMode,
        t.referenceNo || '',
      ].map(v => `"${String(v).replace(/"/g, '""')}"`)
    );

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `refirely-accounting-ledger-${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Exported ${filteredTransactions.length} accounting entries to CSV.`);
  };

  // Format YYYY-MM into "Oct 2026"
  const formatMonthLabel = (ym: string) => {
    const [y, m] = ym.split('-').map(Number);
    if (!y || !m) return ym;
    const d = new Date(y, m - 1, 1);
    return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  };

  const activeCategoryOptions = txType === 'expense' ? expenseCategories : revenueCategories;

  // Live conversion preview while typing amount
  const parsedDraftAmount = parseFloat(txAmount);
  const hasValidDraftAmount = !isNaN(parsedDraftAmount) && parsedDraftAmount > 0;
  const convertedPreviewText = hasValidDraftAmount
    ? txCurrency === 'INR'
      ? `≈ ${formatUSD(parsedDraftAmount / (usdToInrRate || 94.5))} USD (at ₹${usdToInrRate}/$)`
      : `≈ ${formatINR(parsedDraftAmount * (usdToInrRate || 94.5))} INR (at ₹${usdToInrRate}/$)`
    : txCurrency === 'INR'
      ? 'Default Currency: Indian Rupee (₹)'
      : `USD ($) converts to ₹ at 1 USD = ₹${usdToInrRate}`;

  const maxMonthlyVal = useMemo(() => {
    let max = 1000;
    summary.monthlySeries.forEach(m => {
      const exp = displayCurrency === 'INR' ? m.expenseINR : m.expenseUSD;
      const rev = displayCurrency === 'INR' ? m.revenueINR : m.revenueUSD;
      if (exp > max) max = exp;
      if (rev > max) max = rev;
    });
    return max;
  }, [summary.monthlySeries, displayCurrency]);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="bg-emerald-950 text-white px-4 py-3 rounded-2xl shadow-lg border border-emerald-500/40 flex items-center justify-between text-xs font-bold">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMsg}</span>
          </div>
          <button onClick={() => setToastMsg(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* =====================================================================
          1. EXECUTIVE HEADER & CURRENCY / FX CONTROLS
      ===================================================================== */}
      <div className="relative overflow-hidden bg-white rounded-3xl border border-indigo-200/80 p-6 sm:p-7 shadow-sm">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 via-indigo-600 to-amber-500" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-teal-50 text-teal-900 border border-teal-200">
                <IndianRupee className="w-3.5 h-3.5 text-teal-600" />
                Admin Accounting &amp; Expense Ledger
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-900 border border-indigo-200">
                Default Currency: INR (₹) · Secondary: USD ($)
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Website Expenses, Vendor Payouts &amp; Revenue Tracker
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl">
              Record expenses and revenue in Indian Rupees (<span className="font-bold text-slate-900">₹ INR</span>) by default or in US Dollars (<span className="font-bold text-slate-900">$ USD</span>). Manage custom Vendors and Transaction Heads, and track monthly financial snapshots.
            </p>
          </div>

          {/* Right Controls: Display Currency Switcher, FX Rate, CSV & Cloud Sync */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* FX Rate Input Pill */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/90 rounded-xl px-3 py-1.5 text-xs">
              <span className="font-semibold text-slate-600">1 USD ($) =</span>
              <span className="font-bold text-slate-900">₹</span>
              <input
                type="number"
                step="0.25"
                min="1"
                value={usdToInrRate}
                onChange={e => setUsdToInrRate(Math.max(1, parseFloat(e.target.value) || 94.5))}
                className="w-16 font-mono font-bold text-indigo-950 bg-white border border-slate-300 rounded-lg px-2 py-0.5 text-xs focus:outline-none focus:border-indigo-500"
                title="USD to INR conversion rate used for unified totals"
              />
            </div>

            {/* Display Currency Toggle */}
            <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
              <button
                type="button"
                onClick={() => setDisplayCurrency('INR')}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1 ${
                  displayCurrency === 'INR'
                    ? 'bg-gradient-to-r from-teal-600 to-indigo-600 text-white shadow-2xs'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                <span>₹ INR View</span>
              </button>
              <button
                type="button"
                onClick={() => setDisplayCurrency('USD')}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1 ${
                  displayCurrency === 'USD'
                    ? 'bg-gradient-to-r from-teal-600 to-indigo-600 text-white shadow-2xs'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                <span>$ USD View</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => syncAccountingToCloud()}
              disabled={isSyncingCloud}
              className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-950 border border-indigo-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Save Accounting Ledger to Firebase Cloud"
            >
              <CloudUpload className={`w-3.5 h-3.5 text-indigo-600 ${isSyncingCloud ? 'animate-bounce' : ''}`} />
              <span>Sync Cloud</span>
            </button>

            <button
              type="button"
              onClick={handleExportCsv}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-teal-300" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* =====================================================================
            2. TOP KPI SUMMARY CARDS (TOTAL SPENT, REVENUE RECEIVED, NET BALANCE)
        ===================================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
          {/* Card 1: Total Amount Spent (Expenses) */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-50/90 via-white to-orange-50/50 border border-rose-200/80 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-rose-800">
                Total Amount Spent
              </span>
              <span className="p-2 rounded-xl bg-rose-100/80 text-rose-700">
                <TrendingDown className="w-4 h-4" />
              </span>
            </div>
            <div className="font-mono tabular-nums text-2xl font-black text-slate-900 mt-2">
              {displayCurrency === 'INR'
                ? formatINR(summary.totalExpenseINR)
                : formatUSD(summary.totalExpenseUSD)}
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-600 mt-1.5 pt-1.5 border-t border-rose-100">
              <span>
                {displayCurrency === 'INR'
                  ? `≈ ${formatUSD(summary.totalExpenseUSD)}`
                  : `≈ ${formatINR(summary.totalExpenseINR)}`}
              </span>
              <span className="font-semibold text-rose-900">
                {transactions.filter(t => t.type === 'expense').length} expense entries
              </span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              Paid in ₹: <strong className="text-slate-700">{formatINR(summary.directINRSpent)}</strong> · Paid in $: <strong className="text-slate-700">{formatUSD(summary.directUSDSpent)}</strong>
            </div>
          </div>

          {/* Card 2: Total Revenue Received */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/50 border border-emerald-200/80 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800">
                Total Revenue Received
              </span>
              <span className="p-2 rounded-xl bg-emerald-100/80 text-emerald-700">
                <TrendingUp className="w-4 h-4" />
              </span>
            </div>
            <div className="font-mono tabular-nums text-2xl font-black text-slate-900 mt-2">
              {displayCurrency === 'INR'
                ? formatINR(summary.totalRevenueINR)
                : formatUSD(summary.totalRevenueUSD)}
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-600 mt-1.5 pt-1.5 border-t border-emerald-100">
              <span>
                {displayCurrency === 'INR'
                  ? `≈ ${formatUSD(summary.totalRevenueUSD)}`
                  : `≈ ${formatINR(summary.totalRevenueINR)}`}
              </span>
              <span className="font-semibold text-emerald-900">
                {transactions.filter(t => t.type === 'revenue').length === 0
                  ? 'No revenue yet'
                  : `${transactions.filter(t => t.type === 'revenue').length} revenue entries`}
              </span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              {summary.totalRevenueINR === 0
                ? 'Pre-revenue phase · Ready whenever income begins'
                : `Received in ₹: ${formatINR(summary.directINRRevenue)} · In $: ${formatUSD(summary.directUSDRevenue)}`}
            </div>
          </div>

          {/* Card 3: Net Position (Revenue - Expenses) */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/90 via-white to-violet-50/50 border border-indigo-200/80 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-900">
                Net Cashflow (Rev − Exp)
              </span>
              <span className="p-2 rounded-xl bg-indigo-100/80 text-indigo-700">
                <Wallet className="w-4 h-4" />
              </span>
            </div>
            <div
              className={`font-mono tabular-nums text-2xl font-black mt-2 ${
                summary.netBalanceINR >= 0 ? 'text-emerald-700' : 'text-indigo-950'
              }`}
            >
              {summary.netBalanceINR < 0 ? '−' : '+'}
              {displayCurrency === 'INR'
                ? formatINR(Math.abs(summary.netBalanceINR))
                : formatUSD(Math.abs(summary.netBalanceUSD))}
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-600 mt-1.5 pt-1.5 border-t border-indigo-100">
              <span>
                {displayCurrency === 'INR'
                  ? `≈ ${summary.netBalanceUSD < 0 ? '−' : '+'}${formatUSD(Math.abs(summary.netBalanceUSD))}`
                  : `≈ ${summary.netBalanceINR < 0 ? '−' : '+'}${formatINR(Math.abs(summary.netBalanceINR))}`}
              </span>
              <span className="font-semibold text-indigo-900">
                {summary.netBalanceINR < 0 ? 'Net Platform Investment' : 'Net Surplus'}
              </span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              Total Entries: <strong className="text-slate-700">{transactions.length}</strong>
            </div>
          </div>

          {/* Card 4: Top Head of Transaction & Top Vendor */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/90 via-white to-teal-50/40 border border-amber-200/80 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-900">
                Top Expense Head &amp; Vendor
              </span>
              <span className="p-2 rounded-xl bg-amber-100/80 text-amber-700">
                <PieChart className="w-4 h-4" />
              </span>
            </div>
            <div className="text-sm font-extrabold text-slate-900 mt-2 truncate">
              {summary.categoryBreakdown[0]?.name || 'No expenses logged yet'}
            </div>
            <div className="font-mono text-xs font-bold text-amber-900 mt-0.5">
              {summary.categoryBreakdown[0]
                ? `${formatINR(summary.categoryBreakdown[0].amountINR)} (${summary.categoryBreakdown[0].pct}% of spend)`
                : 'Add an expense below'}
            </div>
            <div className="text-[11px] text-slate-600 mt-1.5 pt-1.5 border-t border-amber-100 truncate">
              Top Vendor:{' '}
              <strong className="text-slate-900">
                {summary.vendorBreakdown[0]?.name || '—'}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================================
          3. ADD / EDIT TRANSACTION FORM (WITH INLINE VENDOR & CATEGORY CREATOR)
      ===================================================================== */}
      <div className="bg-white rounded-3xl border border-indigo-200/80 p-6 sm:p-7 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Plus className="w-5 h-5 text-teal-600" />
              <span>
                {editingTxId ? 'Edit Accounting Transaction' : 'Record New Expense or Revenue Entry'}
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Indian Rupee (<strong className="text-slate-800">₹ INR</strong>) is selected by default. Switch to <strong className="text-slate-800">$ USD</strong> whenever paying an international invoice in dollars.
            </p>
          </div>

          {/* Transaction Type Switcher: Expense vs Revenue */}
          <div className="inline-flex rounded-2xl bg-slate-100 p-1 border border-slate-200 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setTxType('expense')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                txType === 'expense'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <ArrowDownRight className="w-4 h-4" />
              <span>Expense (Money Spent)</span>
            </button>
            <button
              type="button"
              onClick={() => setTxType('revenue')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                txType === 'revenue'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Income / Revenue</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSaveTransaction} className="mt-5 space-y-5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Date */}
            <div>
              <label className="font-bold text-slate-700 flex items-center gap-1.5 mb-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                <span>Transaction Date *</span>
              </label>
              <input
                type="date"
                required
                value={txDate}
                onChange={e => setTxDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-semibold text-slate-900 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* 2. Currency Selector (INR ₹ Default vs USD $) */}
            <div>
              <label className="font-bold text-slate-700 flex items-center gap-1.5 mb-1.5">
                <IndianRupee className="w-3.5 h-3.5 text-teal-600" />
                <span>Currency *</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTxCurrency('INR')}
                  className={`py-2.5 px-3 rounded-xl font-extrabold border text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    txCurrency === 'INR'
                      ? 'bg-teal-950 text-white border-teal-900 shadow-2xs'
                      : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-sm">₹</span>
                  <span>INR (Default)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTxCurrency('USD')}
                  className={`py-2.5 px-3 rounded-xl font-extrabold border text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    txCurrency === 'USD'
                      ? 'bg-indigo-950 text-white border-indigo-900 shadow-2xs'
                      : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-sm">$</span>
                  <span>USD ($)</span>
                </button>
              </div>
            </div>

            {/* 3. Amount Spent / Received */}
            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 flex items-center justify-between mb-1.5">
                <span>
                  {txType === 'expense' ? 'Amount Spent *' : 'Revenue Amount Received *'} (in{' '}
                  {txCurrency === 'INR' ? '₹ INR' : '$ USD'})
                </span>
                <span className="text-[11px] font-mono text-indigo-700 font-bold">
                  {convertedPreviewText}
                </span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-black text-slate-700">
                  {txCurrency === 'INR' ? '₹' : '$'}
                </span>
                <input
                  type="number"
                  step="any"
                  min="0.01"
                  required
                  placeholder={txCurrency === 'INR' ? 'e.g. 2500' : 'e.g. 29.00'}
                  value={txAmount}
                  onChange={e => setTxAmount(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 font-mono text-sm font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 4. Paid To / Vendor Dropdown + Add New Vendor */}
            <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200/90 space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{txType === 'expense' ? 'Paid To / Vendor *' : 'Received From / Payer *'}</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsAddingNewVendor(!isAddingNewVendor)}
                  className="text-[11px] font-extrabold text-indigo-700 hover:text-indigo-950 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isAddingNewVendor ? 'Select Existing' : 'Add New Vendor'}</span>
                </button>
              </div>

              {isAddingNewVendor ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Enter new vendor name (e.g. Hostinger, Zoho, AWS)..."
                    value={newVendorInput}
                    onChange={e => setNewVendorInput(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-indigo-300 bg-white font-semibold text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                  <button
                    type="button"
                    onClick={handleAddNewVendor}
                    className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer shrink-0"
                  >
                    Save Vendor
                  </button>
                </div>
              ) : (
                <select
                  value={txVendor}
                  onChange={e => setTxVendor(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-semibold text-slate-900 focus:outline-none focus:border-indigo-500"
                >
                  {vendors.map(v => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* 5. Category / Head of Transaction Dropdown + Add New Category */}
            <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200/90 space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-teal-600" />
                  <span>Category / Head of Transaction *</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsAddingNewCategory(!isAddingNewCategory)}
                  className="text-[11px] font-extrabold text-teal-700 hover:text-teal-950 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isAddingNewCategory ? 'Select Existing' : 'Add New Category / Head'}</span>
                </button>
              </div>

              {isAddingNewCategory ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={`Enter new ${txType} category / head...`}
                    value={newCategoryInput}
                    onChange={e => setNewCategoryInput(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-teal-300 bg-white font-semibold text-slate-900 focus:outline-none focus:border-teal-600"
                  />
                  <button
                    type="button"
                    onClick={handleAddNewCategory}
                    className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold cursor-pointer shrink-0"
                  >
                    Save Head
                  </button>
                </div>
              ) : (
                <select
                  value={txCategory}
                  onChange={e => setTxCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-semibold text-slate-900 focus:outline-none focus:border-indigo-500"
                >
                  {activeCategoryOptions.map(c => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* 6. Description, Payment Mode & Reference */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 flex items-center gap-1.5 mb-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>Description / Particulars *</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Annual refirely.com domain renewal, Firebase Blaze plan, Instagram promotion..."
                value={txDescription}
                onChange={e => setTxDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium text-slate-900 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1.5">Payment Mode</label>
              <select
                value={txPaymentMode}
                onChange={e => setTxPaymentMode(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-semibold text-slate-900 focus:outline-none focus:border-indigo-500"
              >
                {PAYMENT_MODES.map(pm => (
                  <option key={pm} value={pm}>
                    {pm}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <span>Optional Invoice / Ref #:</span>
              <input
                type="text"
                placeholder="INV-2026-01"
                value={txReferenceNo}
                onChange={e => setTxReferenceNo(e.target.value)}
                className="px-2.5 py-1 rounded-lg border border-slate-200 font-mono text-xs text-slate-800"
              />
            </div>

            <div className="flex items-center gap-2.5">
              {editingTxId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingTxId(null);
                    setTxAmount('');
                    setTxDescription('');
                    setTxReferenceNo('');
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel Edit
                </button>
              )}
              <button
                type="submit"
                className={`px-6 py-2.5 rounded-xl font-extrabold text-white shadow-sm flex items-center gap-2 cursor-pointer transition-all ${
                  txType === 'expense'
                    ? 'bg-gradient-to-r from-rose-600 via-orange-600 to-amber-600 hover:from-rose-700 hover:to-amber-700'
                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>
                  {editingTxId
                    ? 'Update Transaction'
                    : txType === 'expense'
                      ? `Record Expense (${txCurrency === 'INR' ? '₹' : '$'})`
                      : `Record Revenue (${txCurrency === 'INR' ? '₹' : '$'})`}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* =====================================================================
          4. VISUAL CHARTS & MONTHLY SNAPSHOTS (MONTHLY BAR CHART + CATEGORY & VENDOR BREAKDOWN)
      ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Monthly Expenses vs Revenue Bar Chart */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-indigo-200/80 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-indigo-600" />
                  <span>Monthly Expenses &amp; Revenue Snapshot ({displayCurrency === 'INR' ? '₹ INR' : '$ USD'})</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Month-by-month comparison of total money spent vs. revenue received
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs font-bold">
                <span className="flex items-center gap-1.5 text-rose-700">
                  <span className="w-3 h-3 rounded-xs bg-rose-500 inline-block" />
                  Expenses
                </span>
                <span className="flex items-center gap-1.5 text-emerald-700">
                  <span className="w-3 h-3 rounded-xs bg-emerald-500 inline-block" />
                  Revenue
                </span>
              </div>
            </div>

            {/* Bar Chart Area */}
            <div className="mt-6 pt-4">
              <div className="grid grid-cols-6 sm:grid-cols-6 gap-3 items-end h-56 pt-6 px-2 border-b border-slate-200">
                {summary.monthlySeries.slice(-6).map(item => {
                  const expVal = displayCurrency === 'INR' ? item.expenseINR : item.expenseUSD;
                  const revVal = displayCurrency === 'INR' ? item.revenueINR : item.revenueUSD;
                  const expHeightPct = maxMonthlyVal > 0 ? Math.max(expVal > 0 ? 8 : 2, Math.round((expVal / maxMonthlyVal) * 100)) : 2;
                  const revHeightPct = maxMonthlyVal > 0 ? Math.max(revVal > 0 ? 8 : 2, Math.round((revVal / maxMonthlyVal) * 100)) : 2;

                  return (
                    <div
                      key={item.month}
                      className="flex flex-col items-center h-full justify-end group"
                    >
                      {/* Values on top of bars */}
                      <div className="text-[10px] font-mono font-bold text-slate-600 mb-1 text-center leading-tight">
                        {expVal > 0 && (
                          <div className="text-rose-700">
                            {displayCurrency === 'INR' ? formatINR(expVal) : formatUSD(expVal)}
                          </div>
                        )}
                        {revVal > 0 && (
                          <div className="text-emerald-700">
                            {displayCurrency === 'INR' ? formatINR(revVal) : formatUSD(revVal)}
                          </div>
                        )}
                      </div>

                      {/* Dual Bars */}
                      <div className="w-full flex items-end justify-center gap-1.5 h-40">
                        <div
                          style={{ height: `${expHeightPct}%` }}
                          className={`w-5 sm:w-6 rounded-t-lg transition-all ${
                            expVal > 0
                              ? 'bg-gradient-to-t from-rose-600 to-orange-400 shadow-2xs'
                              : 'bg-slate-100'
                          }`}
                          title={`${formatMonthLabel(item.month)} Expenses: ${formatINR(item.expenseINR)} (${formatUSD(item.expenseUSD)})`}
                        />
                        <div
                          style={{ height: `${revHeightPct}%` }}
                          className={`w-5 sm:w-6 rounded-t-lg transition-all ${
                            revVal > 0
                              ? 'bg-gradient-to-t from-emerald-600 to-teal-400 shadow-2xs'
                              : 'bg-slate-100'
                          }`}
                          title={`${formatMonthLabel(item.month)} Revenue: ${formatINR(item.revenueINR)} (${formatUSD(item.revenueUSD)})`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Month X-Axis Labels */}
              <div className="grid grid-cols-6 gap-3 pt-2.5 px-2 text-center">
                {summary.monthlySeries.slice(-6).map(item => (
                  <div key={item.month} className="text-[11px] font-bold text-slate-700">
                    {formatMonthLabel(item.month)}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Monthly Summary Table Strip */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
            <span>
              Total 6-Month Spend:{' '}
              <strong className="font-mono text-rose-700">
                {formatINR(summary.totalExpenseINR)}
              </strong>{' '}
              ({formatUSD(summary.totalExpenseUSD)})
            </span>
            <span>
              Total Revenue:{' '}
              <strong className="font-mono text-emerald-700">
                {formatINR(summary.totalRevenueINR)}
              </strong>{' '}
              ({formatUSD(summary.totalRevenueUSD)})
            </span>
          </div>
        </div>

        {/* Right 5 Cols: Category / Head of Transaction & Vendor Breakdown */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-indigo-200/80 p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
              <PieChart className="w-4 h-4 text-teal-600" />
              <span>Spend by Category / Head of Transaction</span>
            </h3>

            {summary.categoryBreakdown.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No expenses recorded yet. Once you add expenses above, your category breakdown bars will appear here.
              </div>
            ) : (
              <div className="space-y-3 mt-4">
                {summary.categoryBreakdown.slice(0, 6).map((cat, idx) => {
                  const color = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
                  return (
                    <div key={cat.name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800 truncate pr-2">{cat.name}</span>
                        <span className="font-mono font-extrabold text-slate-900 shrink-0">
                          {displayCurrency === 'INR'
                            ? formatINR(cat.amountINR)
                            : formatUSD(cat.amountUSD)}{' '}
                          <span className="text-slate-400 font-normal">({cat.pct}%)</span>
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${Math.max(4, cat.pct)}%`, backgroundColor: color }}
                          className="h-full rounded-full transition-all"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-3">
              Top Paid Vendors
            </h4>
            {summary.vendorBreakdown.length === 0 ? (
              <div className="text-xs text-slate-400">No vendor payouts logged yet.</div>
            ) : (
              <div className="space-y-2">
                {summary.vendorBreakdown.slice(0, 4).map(v => (
                  <div
                    key={v.name}
                    className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/70 text-xs"
                  >
                    <span className="font-bold text-slate-800 truncate">{v.name}</span>
                    <span className="font-mono font-bold text-indigo-950">
                      {displayCurrency === 'INR' ? formatINR(v.amountINR) : formatUSD(v.amountUSD)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =====================================================================
          5. TRANSACTION LEDGER TABLE & FILTERS + GRAND TOTAL FOOTER
      ===================================================================== */}
      <div className="bg-white rounded-3xl border border-indigo-200/80 p-6 sm:p-7 shadow-sm space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
              Complete Accounting Ledger ({filteredTransactions.length} Transactions)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Filter by month, transaction head, vendor, or currency. Every entry displays both ₹ INR and $ USD values.
            </p>
          </div>

          {/* Search & Filters Row */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search description, vendor..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-300 bg-white font-semibold text-slate-700"
            >
              <option value="all">All Types</option>
              <option value="expense">Expenses Only</option>
              <option value="revenue">Revenue Only</option>
            </select>

            <select
              value={filterCurrency}
              onChange={e => setFilterCurrency(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-300 bg-white font-semibold text-slate-700"
            >
              <option value="all">All Currencies (₹ &amp; $)</option>
              <option value="INR">₹ INR Only</option>
              <option value="USD">$ USD Only</option>
            </select>

            <select
              value={filterVendor}
              onChange={e => setFilterVendor(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-300 bg-white font-semibold text-slate-700 max-w-[160px]"
            >
              <option value="all">All Vendors</option>
              {vendors.map(v => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>

            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-300 bg-white font-semibold text-slate-700 max-w-[170px]"
            >
              <option value="all">All Heads / Categories</option>
              {[...expenseCategories, ...revenueCategories].map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              value={filterMonth}
              onChange={e => setFilterMonth(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-300 bg-white font-semibold text-slate-700"
            >
              <option value="all">All Months</option>
              {availableMonths.map(ym => (
                <option key={ym} value={ym}>
                  {formatMonthLabel(ym)} ({ym})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        {filteredTransactions.length === 0 ? (
          <div className="py-12 text-center bg-slate-50/70 rounded-2xl border border-dashed border-slate-200 space-y-2">
            <IndianRupee className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No accounting transactions recorded yet</p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Use the form above to log your website expenses in Indian Rupees (<strong className="text-slate-700">₹</strong>) or US Dollars (<strong className="text-slate-700">$</strong>).
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 bg-slate-50/80">
                  <th className="py-3 px-3 rounded-tl-xl">Date</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Category / Head</th>
                  <th className="py-3 px-3">Paid To / Vendor</th>
                  <th className="py-3 px-3">Description &amp; Mode</th>
                  <th className="py-3 px-3 text-right">Entered Amount</th>
                  <th className="py-3 px-3 text-right">Amount in ₹ (INR)</th>
                  <th className="py-3 px-3 text-right">Amount in $ (USD)</th>
                  <th className="py-3 px-3 text-right rounded-tr-xl">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="py-3 px-3 font-mono font-semibold text-slate-800 whitespace-nowrap">
                      {tx.date}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          tx.type === 'expense'
                            ? 'bg-rose-50 text-rose-800 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {tx.type === 'expense' ? 'Expense' : 'Revenue'}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-indigo-950">{tx.category}</td>
                    <td className="py-3 px-3 font-semibold text-slate-800">{tx.vendor}</td>
                    <td className="py-3 px-3 text-slate-600 max-w-xs">
                      <div className="font-medium text-slate-900">{tx.description}</div>
                      <div className="text-[10px] text-slate-400">
                        {tx.paymentMode}
                        {tx.referenceNo ? ` · Ref: ${tx.referenceNo}` : ''}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-md ${
                          tx.currency === 'INR'
                            ? 'bg-teal-50 text-teal-900 border border-teal-200'
                            : 'bg-indigo-50 text-indigo-900 border border-indigo-200'
                        }`}
                      >
                        {tx.currency === 'INR' ? formatINR(tx.amount) : formatUSD(tx.amount)}
                      </span>
                    </td>
                    <td
                      className={`py-3 px-3 text-right font-mono font-extrabold whitespace-nowrap ${
                        tx.type === 'expense' ? 'text-rose-700' : 'text-emerald-700'
                      }`}
                    >
                      {tx.type === 'expense' ? '−' : '+'}
                      {formatINR(tx.amountINR)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-600 whitespace-nowrap">
                      {tx.type === 'expense' ? '−' : '+'}
                      {formatUSD(tx.amountUSD)}
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleEditTransaction(tx)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-700 hover:bg-indigo-50 cursor-pointer"
                          title="Edit Transaction"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteTransaction(tx.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
                          title="Delete Transaction"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Grand Totals Summary Bar at the Bottom */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-teal-300">
              End-of-Ledger Grand Totals (Filtered View)
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Unified in Indian Rupees (₹) and US Dollars ($) at 1 USD = ₹{usdToInrRate}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-rose-300 font-bold">
                Total Amount Spent
              </div>
              <div className="font-mono text-lg font-black text-white">
                {formatINR(filteredTotals.expINR)}{' '}
                <span className="text-xs font-normal text-slate-300">
                  ({formatUSD(filteredTotals.expUSD)})
                </span>
              </div>
            </div>

            <div className="h-8 w-px bg-slate-700 hidden sm:block" />

            <div>
              <div className="text-[10px] uppercase tracking-wider text-emerald-300 font-bold">
                Total Revenue Received
              </div>
              <div className="font-mono text-lg font-black text-white">
                {formatINR(filteredTotals.revINR)}{' '}
                <span className="text-xs font-normal text-slate-300">
                  ({formatUSD(filteredTotals.revUSD)})
                </span>
              </div>
            </div>

            <div className="h-8 w-px bg-slate-700 hidden sm:block" />

            <div>
              <div className="text-[10px] uppercase tracking-wider text-amber-300 font-bold">
                Net Balance (Rev − Spend)
              </div>
              <div className="font-mono text-lg font-black text-amber-300">
                {filteredTotals.revINR - filteredTotals.expINR < 0 ? '−' : '+'}
                {formatINR(Math.abs(filteredTotals.revINR - filteredTotals.expINR))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
