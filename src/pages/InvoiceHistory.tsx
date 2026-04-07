import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getInvoices, Invoice } from '../store/invoiceStore';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';
import { Card, Badge, EmptyState } from '../components/ui';
import { ChevronLeft, Search, FileText, ArrowUpDown } from 'lucide-react';

type TabType = 'All' | 'Overdue' | 'Sent' | 'Draft' | 'Paid';
type SortOrder = 'newest' | 'oldest' | 'amount_desc' | 'amount_asc';

export default function InvoiceHistory() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');

  useEffect(() => {
    setInvoices(getInvoices());
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const tabs: TabType[] = ['All', 'Overdue', 'Sent', 'Draft', 'Paid'];

  const getTabCount = (tab: TabType) => {
    if (tab === 'All') return 0;
    return invoices.filter(i => i.status.toLowerCase() === tab.toLowerCase()).length;
  };

  const filteredInvoices = invoices.filter(inv => {
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

  return (
    <div className="min-h-screen bg-bg pb-24 font-sans">
      <div className="bg-surface border-b border-border sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/app')} className="p-2 -ml-2 hover:bg-bg rounded-lg text-text-secondary transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold text-text">Invoice History</h1>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Search and Sort */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input 
              type="text" 
              placeholder="Search client or invoice #" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-text placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
          </div>
          <button 
            onClick={cycleSort}
            className="px-4 py-2.5 bg-surface border border-border rounded-xl text-text-secondary hover:text-text hover:bg-bg transition-colors flex items-center gap-2 font-medium whitespace-nowrap"
          >
            <ArrowUpDown className="w-4 h-4" />
            <span className="hidden sm:inline">{getSortLabel()}</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 gap-2">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === tab 
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' 
                  : 'bg-surface text-text-secondary hover:bg-bg border border-border'
              }`}
            >
              {tab}
              {getTabCount(tab) > 0 && (
                <span className={`ml-2 px-1.5 py-0.5 rounded-full text-[10px] ${
                  activeTab === tab 
                    ? 'bg-white/20 text-white dark:bg-black/20 dark:text-black' 
                    : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                }`}>
                  {getTabCount(tab)}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Invoice List */}
        <div className="space-y-3">
          {sortedInvoices.length === 0 ? (
            <EmptyState 
              icon={<FileText className="w-12 h-12" />}
              title="No invoices found"
              description={searchQuery ? "Try adjusting your search or filters." : "You haven't created any invoices yet."}
            />
          ) : (
            sortedInvoices.map(inv => (
              <Card 
                key={inv.id} 
                className="p-4 cursor-pointer hover:border-primary-300 transition-colors"
                onClick={() => navigate(inv.status === 'draft' ? `/edit/${inv.id}` : `/invoice/${inv.id}`)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-text">{inv.client_name}</h3>
                    <p className="text-sm text-text-secondary">{inv.invoice_number}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-text">{formatCurrency(inv.total_amount)}</p>
                    <p className="text-xs text-text-secondary mt-0.5">{getRelativeDateText(inv.created_at)}</p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <Badge variant={inv.status}>
                    {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                  </Badge>
                  
                  {getDueDateText(inv)}
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
