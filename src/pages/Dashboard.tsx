import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBusinessStore } from '../store/businessStore';
import { getInvoices, updateInvoiceStatus, deleteInvoice, markInvoiceAsPaid, recordReminder, Invoice } from '../store/invoiceStore';
import { getQuotations, Quotation } from '../store/quotationStore';
import { getExpenses } from '../store/expenseStore';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';
import { Card, Button, EmptyState, FAB, Badge, Toast } from '../components/ui';
import { 
  FileText, Search, X, ChevronLeft, ChevronRight, 
  MoreVertical, CheckCircle, Bell, Send, Trash2, Eye, ArrowUpDown,
  CheckCircle2, CheckSquare, Square, AlertCircle, FileSignature, Wallet
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

type TabType = 'All' | 'Overdue' | 'Sent' | 'Draft' | 'Paid';
type SortOrder = 'newest' | 'oldest' | 'amount_desc' | 'amount_asc';

export default function Dashboard() {
  const navigate = useNavigate();
  const { state: businessState } = useBusinessStore();
  
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [showFabMenu, setShowFabMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [hasVisited, setHasVisited] = useState(false);

  // Bulk Actions State
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteModal, setDeleteModal] = useState<{isOpen: boolean, invoice: Invoice | null}>({isOpen: false, invoice: null});

  const [toast, setToast] = useState<{ isVisible: boolean; message: string; variant: 'success' | 'error' | 'info' }>({
    isVisible: false,
    message: '',
    variant: 'success'
  });

  useEffect(() => {
    document.body.style.backgroundColor = '#F9FAFB';
    return () => {
      document.body.style.backgroundColor = '#030712';
    };
  }, []);

  const loadData = () => {
    setInvoices(getInvoices());
    setQuotations(getQuotations());
    setExpenses(getExpenses());
  };

  useEffect(() => {
    loadData();
    
    const handleFocus = () => loadData();
    window.addEventListener('focus', handleFocus);
    
    const visited = localStorage.getItem('invoiceflow_fab_visited');
    if (visited) {
      setHasVisited(true);
    }

    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      setOpenMenuId(null);
      const target = e.target as HTMLElement;
      if (!target.closest('.fab-container')) {
        setShowFabMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const ownerName = businessState.profile?.owner_name || 'there';
  const initials = ownerName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning,' : hour < 17 ? 'Good afternoon,' : 'Good evening,';

  // Month Navigation
  const isCurrentMonth = selectedMonth.getMonth() === new Date().getMonth() && selectedMonth.getFullYear() === new Date().getFullYear();

  const handlePrevMonth = () => {
    setSelectedMonth(prev => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() - 1);
      return d;
    });
  };

  const handleNextMonth = () => {
    if (isCurrentMonth) return;
    setSelectedMonth(prev => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + 1);
      return d;
    });
  };

  const resetMonth = () => setSelectedMonth(new Date());

  // Filter invoices by selected month
  const monthInvoices = invoices.filter(inv => {
    const d = new Date(inv.created_at);
    return d.getMonth() === selectedMonth.getMonth() && d.getFullYear() === selectedMonth.getFullYear();
  });

  const monthExpenses = expenses.filter(exp => {
    const d = new Date(exp.date);
    return d.getMonth() === selectedMonth.getMonth() && d.getFullYear() === selectedMonth.getFullYear();
  });

  // Summary Stats
  const outstanding = monthInvoices.filter(i => i.status === 'sent' || i.status === 'overdue').reduce((sum, i) => sum + i.total_amount, 0);
  const paidThisMonth = monthInvoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total_amount, 0);
  const totalExpensesThisMonth = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const netProfit = paidThisMonth - totalExpensesThisMonth;
  const overdue = monthInvoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + i.total_amount, 0);
  const totalCount = monthInvoices.length;

  // Filter & Sort
  const filteredInvoices = monthInvoices.filter(inv => {
    if (activeTab !== 'All' && inv.status.toLowerCase() !== activeTab.toLowerCase()) return false;
    
    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase();
      return inv.client_name.toLowerCase().includes(query) || 
             inv.invoice_number.toLowerCase().includes(query);
    }
    
    return true;
  });

  const statusOrder = { overdue: 0, sent: 1, draft: 2, paid: 3 };

  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
    if (statusOrder[a.status] !== statusOrder[b.status]) {
      return statusOrder[a.status] - statusOrder[b.status];
    }
    
    if (sortOrder === 'newest') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    } else if (sortOrder === 'oldest') {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    } else if (sortOrder === 'amount_desc') {
      return b.total_amount - a.total_amount;
    } else if (sortOrder === 'amount_asc') {
      return a.total_amount - b.total_amount;
    }
    return 0;
  });

  const cycleSort = () => {
    const sortOptions: SortOrder[] = ['newest', 'oldest', 'amount_desc', 'amount_asc'];
    const currentIndex = sortOptions.indexOf(sortOrder);
    setSortOrder(sortOptions[(currentIndex + 1) % sortOptions.length]);
  };

  const getSortLabel = () => {
    switch (sortOrder) {
      case 'newest': return 'Newest first';
      case 'oldest': return 'Oldest first';
      case 'amount_desc': return 'Amount ↓';
      case 'amount_asc': return 'Amount ↑';
    }
  };

  const getRelativeDateText = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    now.setHours(0,0,0,0);
    date.setHours(0,0,0,0);
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  const getDueDateText = (inv: Invoice) => {
    if (inv.status === 'paid') {
      return <span className="text-success text-sm font-medium">Paid {formatDate(inv.paid_at || inv.created_at)}</span>;
    }
    
    const dueDate = new Date(inv.due_date);
    const now = new Date();
    now.setHours(0,0,0,0);
    dueDate.setHours(0,0,0,0);
    
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (inv.status === 'overdue' || diffDays < 0) {
      return <span className="text-danger text-sm font-medium">Overdue by {Math.abs(diffDays)} days</span>;
    }
    
    if (diffDays === 0) {
      return <span className="text-neutral-500 text-sm">Due today</span>;
    }
    
    return <span className="text-neutral-500 text-sm">Due in {diffDays} days</span>;
  };

  const handleAction = (e: React.MouseEvent, action: string, inv: Invoice) => {
    e.stopPropagation();
    setOpenMenuId(null);
    
    if (action === 'paid') {
      markInvoiceAsPaid(inv.id);
      loadData();
      setToast({ isVisible: true, message: '✅ Invoice marked as paid', variant: 'success' });
    } else if (action === 'remind' || action === 'send' || action === 'view' || action === 'edit') {
      if (action === 'edit') {
        navigate(`/edit/${inv.id}`);
      } else {
        navigate(`/invoice/${inv.id}`);
      }
    } else if (action === 'delete') {
      if (inv.status === 'paid') {
        setToast({ isVisible: true, message: 'Paid invoices cannot be deleted for record keeping purposes.', variant: 'error' });
      } else {
        setDeleteModal({ isOpen: true, invoice: inv });
      }
    }
  };

  const handleFabClick = () => {
    localStorage.setItem('invoiceflow_fab_visited', 'true');
    setShowFabMenu(!showFabMenu);
  };

  const tabs: TabType[] = ['All', 'Overdue', 'Sent', 'Draft', 'Paid'];

  const getTabCount = (tab: TabType) => {
    if (tab === 'All') return 0; // Don't show count for All
    return monthInvoices.filter(i => i.status.toLowerCase() === tab.toLowerCase()).length;
  };

  // Virtual List Logic
  const [scrollTop, setScrollTop] = useState(0);
  const ITEM_HEIGHT = 100; // Approximate height of an invoice card
  const OVERSCAN = 5;

  useEffect(() => {
    const handleScroll = () => {
      setScrollTop(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
  
  // Calculate virtual list parameters
  const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - OVERSCAN);
  const endIndex = Math.min(
    sortedInvoices.length - 1,
    Math.floor((scrollTop + windowHeight) / ITEM_HEIGHT) + OVERSCAN
  );

  const visibleInvoices = sortedInvoices.slice(startIndex, endIndex + 1);
  const topPadding = startIndex * ITEM_HEIGHT;
  const bottomPadding = Math.max(0, (sortedInvoices.length - endIndex - 1) * ITEM_HEIGHT);

  // Bulk Actions Logic
  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedIds(new Set());
  };

  const toggleInvoiceSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleBulkMarkPaid = () => {
    if (window.confirm(`Mark ${selectedIds.size} invoices as paid?`)) {
      selectedIds.forEach(id => {
        const inv = invoices.find(i => i.id === id);
        if (inv && (inv.status === 'sent' || inv.status === 'overdue')) {
          markInvoiceAsPaid(id);
        }
      });
      loadData();
      setIsSelectionMode(false);
      setToast({ isVisible: true, message: `✅ ${selectedIds.size} invoices marked as paid`, variant: 'success' });
    }
  };

  const handleBulkRemind = () => {
    let sentCount = 0;
    let skippedCount = 0;

    selectedIds.forEach(id => {
      const inv = invoices.find(i => i.id === id);
      if (inv && (inv.status === 'sent' || inv.status === 'overdue')) {
        // Check cooldown
        let canSend = true;
        if (inv.last_reminder_at) {
          const last = new Date(inv.last_reminder_at).getTime();
          const now = Date.now();
          const hoursElapsed = (now - last) / (1000 * 60 * 60);
          if (hoursElapsed < 24) canSend = false;
        }

        if (canSend) {
          recordReminder(id);
          sentCount++;
        } else {
          skippedCount++;
        }
      }
    });

    loadData();
    setIsSelectionMode(false);
    setToast({ 
      isVisible: true, 
      message: `🔔 Sent ${sentCount} reminders${skippedCount > 0 ? ` (${skippedCount} skipped due to cooldown)` : ''}`, 
      variant: 'success' 
    });
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Delete ${selectedIds.size} draft invoices?`)) {
      selectedIds.forEach(id => {
        const inv = invoices.find(i => i.id === id);
        if (inv && inv.status === 'draft') {
          deleteInvoice(id);
        }
      });
      loadData();
      setIsSelectionMode(false);
      setToast({ isVisible: true, message: `🗑️ ${selectedIds.size} drafts deleted`, variant: 'success' });
    }
  };

  // Determine what bulk actions are available based on selection
  const selectedInvoices = invoices.filter(inv => selectedIds.has(inv.id));
  const canBulkMarkPaid = selectedInvoices.length > 0 && selectedInvoices.every(inv => inv.status === 'sent' || inv.status === 'overdue');
  const canBulkRemind = selectedInvoices.length > 0 && selectedInvoices.every(inv => inv.status === 'sent' || inv.status === 'overdue');
  const canBulkDelete = selectedInvoices.length > 0 && selectedInvoices.every(inv => inv.status === 'draft');

  const getMonthlyExpensesData = () => {
    const data = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const targetMonth = d.getMonth();
      const targetYear = d.getFullYear();
      
      const sum = expenses.reduce((acc, exp) => {
        const expDate = new Date(exp.date);
        if (expDate.getMonth() === targetMonth && expDate.getFullYear() === targetYear) {
          return acc + exp.amount;
        }
        return acc;
      }, 0);
      
      const monthLabel = d.toLocaleString('en-US', { month: 'short' });
      data.push({ name: monthLabel, amount: sum, isCurrentMonth: i === 0 });
    }
    return data;
  };

  const monthlyExpensesData = getMonthlyExpensesData();

  return (
    <div className="min-h-screen bg-bg pb-32 font-sans">
      <Toast 
        isVisible={toast.isVisible} 
        message={toast.message} 
        variant={toast.variant} 
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))} 
      />

      {/* PART 1 — HEADER */}
      <header className="bg-surface px-4 py-6 sm:px-6 flex justify-between items-center">
        <div>
          <p className="text-neutral-600 dark:text-neutral-400 text-lg">{greeting}</p>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50 tracking-tight">
            {ownerName}
          </h1>
        </div>
        <button 
          onClick={() => navigate('/setup')}
          className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold shadow-sm hover:bg-primary-700 transition-colors"
        >
          {initials}
        </button>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* PART 2 — FINANCIAL SUMMARY STRIP */}
        <div className="bg-neutral-900 dark:bg-neutral-950 rounded-2xl p-5 text-white shadow-lg">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-[11px] text-neutral-400 uppercase tracking-wider mb-1">Collected</p>
              <p className="text-xl font-bold tracking-tight">{formatCurrency(paidThisMonth)}</p>
            </div>
            <div>
              <p className="text-[11px] text-neutral-400 uppercase tracking-wider mb-1">Outstanding</p>
              <p className={`text-xl font-bold tracking-tight ${outstanding > 0 ? 'text-danger' : 'text-white'}`}>{formatCurrency(outstanding)}</p>
            </div>
            <div>
              <p className="text-[11px] text-neutral-400 uppercase tracking-wider mb-1">Expenses</p>
              <p className="text-xl font-bold tracking-tight text-white">{formatCurrency(totalExpensesThisMonth)}</p>
            </div>
            <div>
              <p className="text-[11px] text-neutral-400 uppercase tracking-wider mb-1">Net Profit</p>
              <p className={`text-xl font-bold tracking-tight ${netProfit > 0 ? 'text-[#10B981]' : netProfit < 0 ? 'text-[#EF4444]' : 'text-white'}`}>
                {netProfit > 0 ? '+' : ''}{formatCurrency(netProfit)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center -mt-4">
          <button 
            onClick={() => navigate('/log-expense')}
            className="text-[13px] font-medium text-neutral-500 hover:text-neutral-700"
          >
            Quick log an expense →
          </button>
          <button 
            onClick={() => navigate('/summary')}
            className="text-[13px] font-medium text-primary-600 hover:text-primary-700 hover:underline"
          >
            View Summary →
          </button>
        </div>

        {/* PART 10 — MONTH NAVIGATOR */}
        <div className="flex flex-col items-center justify-center py-2">
          <div className="flex items-center gap-4">
            <button onClick={handlePrevMonth} className="p-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-50 transition-colors rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-medium text-neutral-800 dark:text-neutral-200 w-32 text-center">
              {new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(selectedMonth)}
            </span>
            <button 
              onClick={handleNextMonth} 
              disabled={isCurrentMonth}
              className={`p-2 rounded-full transition-colors ${isCurrentMonth ? 'text-neutral-300 dark:text-neutral-700 cursor-not-allowed' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-50 hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          {!isCurrentMonth && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-neutral-500">Showing past month</span>
              <button onClick={resetMonth} className="text-xs text-primary-600 font-medium hover:underline">
                × Back to Today
              </button>
            </div>
          )}
        </div>

        {/* PART 3 — FILTER TABS */}
        <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          {tabs.map(tab => {
            const count = getTabCount(tab);
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  if (isSelectionMode) toggleSelectionMode();
                }}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-primary-600 text-white shadow-sm' 
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'
                }`}
              >
                {tab} {count > 0 && <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${isActive ? 'bg-primary-700 text-white' : 'bg-neutral-200 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400'}`}>{count}</span>}
              </button>
            );
          })}
        </div>

        {/* PART 6 — SEARCH */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-neutral-400" />
          </div>
          <input
            type="text"
            placeholder="Search client or invoice..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-10 py-2.5 border-none rounded-full bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50 placeholder-neutral-400 focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-neutral-950 transition-colors"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* EXPENSE CHART */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.08)] mb-6">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-50 mb-4">Monthly Expenses</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyExpensesData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6B7280', fontSize: 12 }} 
                  tickFormatter={(value) => {
                    if (value === 0) return '0';
                    return value >= 1000 ? `${(value / 1000).toFixed(value % 1000 !== 0 ? 1 : 0)}k` : value;
                  }}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(243, 244, 246, 0.5)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white dark:bg-neutral-800 p-2 border border-neutral-200 dark:border-neutral-700 shadow-md rounded-lg">
                          <p className="text-sm font-medium text-neutral-900 dark:text-neutral-50 mb-1">{payload[0].payload.name}</p>
                          <p className="text-sm font-bold text-emerald-600">{formatCurrency(payload[0].value as number)}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                  {monthlyExpensesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.isCurrentMonth ? '#059669' : '#A7F3D0'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PART 4 — INVOICE LIST */}
        <div>
          <div className="flex justify-between items-center mb-4 px-1">
            {isSelectionMode ? (
              <div className="flex items-center gap-2">
                <button onClick={toggleSelectionMode} className="text-sm text-neutral-500 hover:text-neutral-800">Cancel</button>
                <span className="font-bold text-primary-600">{selectedIds.size} selected</span>
              </div>
            ) : (
              <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-50">Invoices</h2>
            )}
            
            <div className="flex items-center gap-4">
              {!isSelectionMode && sortedInvoices.length > 0 && (
                <button 
                  onClick={toggleSelectionMode}
                  className="text-sm text-primary-600 font-medium hover:text-primary-700"
                >
                  Select
                </button>
              )}
              {!isSelectionMode && (
                <button 
                  onClick={cycleSort}
                  className="flex items-center text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
                >
                  <span className="mr-1.5">{getSortLabel()}</span>
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* PART 5 — EMPTY STATES */}
          {sortedInvoices.length === 0 ? (
            <div className="py-12 flex flex-col items-center text-center px-4">
              {searchQuery ? (
                <>
                  <Search className="w-12 h-12 text-neutral-300 mb-4" />
                  <p className="text-neutral-500 text-sm">No invoices match '{searchQuery}'</p>
                </>
              ) : activeTab === 'All' ? (
                <>
                  <FileText className="w-16 h-16 text-neutral-300 mb-4" />
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-50 mb-1">No invoices yet</h3>
                  <p className="text-neutral-500 mb-6">Create your first invoice and start getting paid</p>
                  <Button onClick={() => navigate('/create')}>Create Invoice</Button>
                </>
              ) : activeTab === 'Overdue' ? (
                <>
                  <CheckCircle2 className="w-16 h-16 text-success mb-4" />
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-50 mb-1">No overdue invoices</h3>
                  <p className="text-neutral-500">You're all caught up!</p>
                </>
              ) : activeTab === 'Sent' ? (
                <>
                  <Send className="w-16 h-16 text-neutral-300 mb-4" />
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-50 mb-1">No sent invoices</h3>
                  <p className="text-neutral-500 mb-6">Send an invoice to see it tracked here</p>
                  <Button onClick={() => navigate('/create')}>Create Invoice</Button>
                </>
              ) : activeTab === 'Draft' ? (
                <>
                  <FileText className="w-16 h-16 text-neutral-300 mb-4" />
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-50 mb-1">No drafts</h3>
                  <p className="text-neutral-500">Saved drafts will appear here</p>
                </>
              ) : (
                <>
                  <CheckCircle className="w-16 h-16 text-neutral-300 mb-4" />
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-50 mb-1">No paid invoices yet</h3>
                  <p className="text-neutral-500">Mark invoices as paid when you receive payment</p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {topPadding > 0 && <div style={{ height: topPadding }} />}
              {visibleInvoices.map(inv => (
                <div 
                  key={inv.id}
                  onClick={() => {
                    if (isSelectionMode) {
                      toggleInvoiceSelection(inv.id);
                    } else {
                      navigate(`/invoice/${inv.id}`);
                    }
                  }}
                  className={`bg-white dark:bg-neutral-900 rounded-xl p-4 cursor-pointer transition-all relative flex items-center gap-3
                    ${inv.status === 'overdue' && !isSelectionMode ? 'border-l-4 border-l-danger' : 'border border-transparent'}
                    ${inv.status === 'paid' ? 'opacity-70' : ''}
                    ${selectedIds.has(inv.id) ? 'ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-900/20' : ''}
                    shadow-[0_1px_3px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_6px_rgba(0,0,0,0.05)]
                  `}
                  style={{ height: ITEM_HEIGHT - 8, marginBottom: 8 }} // -8 for space-y-2 gap
                >
                  {isSelectionMode && (
                    <div className="shrink-0">
                      {selectedIds.has(inv.id) ? (
                        <CheckSquare className="w-6 h-6 text-primary-600" />
                      ) : (
                        <Square className="w-6 h-6 text-neutral-300" />
                      )}
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-neutral-900 dark:text-neutral-50 text-base truncate">{inv.client_name}</h3>
                        <p className="text-xs text-neutral-500 mt-0.5"><span className="font-mono">{inv.invoice_number}</span> • {getRelativeDateText(inv.created_at)}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {inv.receipt_generated_at && (
                          <div className="flex items-center text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded text-xs gap-0.5" title="Receipt Generated">
                            <FileSignature className="w-3.5 h-3.5" />
                          </div>
                        )}
                        <Badge variant={inv.status}>{inv.status.toUpperCase()}</Badge>
                        
                        {/* PART 8 — THREE-DOT MENU */}
                        {!isSelectionMode && (
                          <div className="relative">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuId(openMenuId === inv.id ? null : inv.id);
                              }}
                              className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                            
                            {openMenuId === inv.id && (
                              <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-neutral-800 rounded-md shadow-lg border border-neutral-200 dark:border-neutral-700 z-50 py-1 overflow-hidden">
                                {(inv.status === 'sent' || inv.status === 'overdue') && (
                                  <>
                                    <button onClick={(e) => handleAction(e, 'paid', inv)} className="w-full text-left px-4 py-2 text-sm text-success hover:bg-neutral-50 dark:hover:bg-neutral-700 flex items-center">
                                      <CheckCircle className="w-4 h-4 mr-2" /> Mark as Paid
                                    </button>
                                    <button onClick={(e) => handleAction(e, 'remind', inv)} className="w-full text-left px-4 py-2 text-sm text-primary-600 hover:bg-neutral-50 dark:hover:bg-neutral-700 flex items-center">
                                      <Bell className="w-4 h-4 mr-2" /> Send Reminder
                                    </button>
                                    <button onClick={(e) => handleAction(e, 'edit', inv)} className="w-full text-left px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 flex items-center">
                                      <FileText className="w-4 h-4 mr-2" /> Edit
                                    </button>
                                  </>
                                )}
                                {inv.status === 'draft' && (
                                  <>
                                    <button onClick={(e) => handleAction(e, 'send', inv)} className="w-full text-left px-4 py-2 text-sm text-primary-600 hover:bg-neutral-50 dark:hover:bg-neutral-700 flex items-center">
                                      <Send className="w-4 h-4 mr-2" /> Send Invoice
                                    </button>
                                    <button onClick={(e) => handleAction(e, 'edit', inv)} className="w-full text-left px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 flex items-center">
                                      <FileText className="w-4 h-4 mr-2" /> Edit
                                    </button>
                                    <button onClick={(e) => handleAction(e, 'delete', inv)} className="w-full text-left px-4 py-2 text-sm text-danger hover:bg-neutral-50 dark:hover:bg-neutral-700 flex items-center">
                                      <Trash2 className="w-4 h-4 mr-2" /> Delete
                                    </button>
                                  </>
                                )}
                                {inv.status === 'paid' && (
                                  <button onClick={(e) => handleAction(e, 'view', inv)} className="w-full text-left px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 flex items-center">
                                    <Eye className="w-4 h-4 mr-2" /> View Details
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-end">
                      <p className="font-bold text-neutral-900 dark:text-neutral-50 text-lg tracking-tight">{formatCurrency(inv.total_amount)}</p>
                      {getDueDateText(inv)}
                    </div>
                  </div>
                </div>
              ))}
              {bottomPadding > 0 && <div style={{ height: bottomPadding }} />}
            </div>
          )}
          
          {!isSelectionMode && sortedInvoices.length > 0 && (
            <div className="mt-6 flex justify-center">
              <button 
                onClick={() => navigate('/invoices')}
                className="text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline"
              >
                See All Invoices →
              </button>
            </div>
          )}
        </div>
      </main>

      {/* BULK ACTION BOTTOM BAR */}
      {isSelectionMode && selectedIds.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-surface border-t border-border shadow-[0_-4px_12px_rgba(0,0,0,0.05)] z-40 flex justify-center gap-3" style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}>
          {canBulkMarkPaid && (
            <Button variant="primary" onClick={handleBulkMarkPaid} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white border-transparent">
              <CheckCircle className="w-4 h-4 mr-2" /> Mark Paid
            </Button>
          )}
          {canBulkRemind && (
            <Button variant="secondary" onClick={handleBulkRemind} className="flex-1 border-primary-500 text-primary-600 hover:bg-primary-50">
              <Bell className="w-4 h-4 mr-2" /> Remind
            </Button>
          )}
          {canBulkDelete && (
            <Button variant="danger" onClick={handleBulkDelete} className="flex-1">
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </Button>
          )}
          {!canBulkMarkPaid && !canBulkRemind && !canBulkDelete && (
            <p className="text-sm text-neutral-500 py-2 text-center w-full">Select invoices of the same status to perform actions.</p>
          )}
        </div>
      )}

      {/* PART 7 — FLOATING ACTION BUTTON */}
      {!isSelectionMode && (
        <div className="fixed right-6 z-50 fab-container" style={{ bottom: 'calc(64px + 20px + env(safe-area-inset-bottom))' }}>
          {showFabMenu && (
            <div className="absolute bottom-16 right-0 mb-2 flex flex-col gap-2 items-end">
              <button
                onClick={() => { setShowFabMenu(false); navigate('/create'); }}
                className="flex items-center gap-3 bg-white px-4 py-3 rounded-xl shadow-lg border border-gray-100 hover:bg-gray-50 transition-colors whitespace-nowrap"
              >
                <span className="font-medium text-gray-700">New Invoice</span>
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-blue-600" />
                </div>
              </button>
              <button
                onClick={() => { setShowFabMenu(false); navigate('/app/quotation/new'); }}
                className="flex items-center gap-3 bg-white px-4 py-3 rounded-xl shadow-lg border border-gray-100 hover:bg-gray-50 transition-colors whitespace-nowrap"
              >
                <span className="font-medium text-gray-700">New Quotation</span>
                <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center">
                  <FileSignature className="w-4 h-4 text-purple-600" />
                </div>
              </button>
              <button
                onClick={() => { setShowFabMenu(false); navigate('/log-expense'); }}
                className="flex items-center gap-3 bg-white px-4 py-3 rounded-xl shadow-lg border border-gray-100 hover:bg-gray-50 transition-colors whitespace-nowrap"
              >
                <span className="font-medium text-gray-700">Log Expense</span>
                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
                  <Wallet className="w-4 h-4 text-emerald-600" />
                </div>
              </button>
            </div>
          )}
          <button
            onClick={handleFabClick}
            className={`w-14 h-14 bg-primary-600 rounded-full flex items-center justify-center text-white shadow-[0_4px_16px_rgba(5,150,105,0.4)] hover:bg-primary-700 hover:scale-105 active:scale-95 active:bg-primary-800 transition-all ${!hasVisited ? 'animate-pulse-ring' : ''} ${showFabMenu ? 'rotate-45' : ''}`}
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <span className="text-3xl font-light leading-none mb-1">+</span>
          </button>
        </div>
      )}

      {/* Delete Confirmation Bottom Sheet */}
      {deleteModal.isOpen && deleteModal.invoice && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50" onClick={() => setDeleteModal({ isOpen: false, invoice: null })}>
          <div 
            className="bg-white dark:bg-neutral-900 w-full max-w-2xl rounded-t-[20px] p-6 shadow-xl transform transition-transform duration-300 translate-y-0 relative"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-full flex justify-center absolute top-3 left-0 right-0">
              <div style={{ width: '36px', height: '4px', borderRadius: '999px', background: '#E5E7EB', margin: '0 auto 16px' }} />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-50 mb-4 mt-2 text-center">
              Delete {deleteModal.invoice.invoice_number}?
            </h3>
            <div className="text-center mb-6">
              {deleteModal.invoice.status === 'draft' ? (
                <p className="text-neutral-600 dark:text-neutral-400">
                  This draft will be permanently removed.
                </p>
              ) : (
                <p className="text-danger flex flex-col items-center justify-center gap-2">
                  <span className="flex items-center"><AlertCircle className="w-5 h-5 mr-1" /> Warning</span>
                  <span className="text-sm">This invoice has been sent to <span className="font-bold">{deleteModal.invoice.client_name}</span>. Deleting it will not unsend the WhatsApp message.</span>
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setDeleteModal({ isOpen: false, invoice: null })}>Cancel</Button>
              <Button 
                variant="danger" 
                className="flex-1" 
                onClick={() => {
                  if (deleteModal.invoice) {
                    deleteInvoice(deleteModal.invoice.id);
                    loadData();
                    setToast({ isVisible: true, message: '🗑️ Invoice deleted', variant: 'success' });
                    setDeleteModal({ isOpen: false, invoice: null });
                  }
                }}
              >
                {deleteModal.invoice.status === 'draft' ? 'Delete' : 'Delete Anyway'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
