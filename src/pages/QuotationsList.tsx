import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getQuotations, updateQuotationStatus, deleteQuotation, Quotation } from '../store/quotationStore';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';
import { Card, Button, EmptyState, Badge, Toast } from '../components/ui';
import { 
  FileText, Search, X, MoreVertical, CheckCircle, Send, Trash2, Eye, ArrowUpDown, AlertCircle
} from 'lucide-react';

type TabType = 'All' | 'Draft' | 'Sent' | 'Accepted' | 'Declined' | 'Expired';
type SortOrder = 'newest' | 'oldest' | 'amount_desc' | 'expiring_soon';

export default function QuotationsList() {
  const navigate = useNavigate();
  
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

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
    setQuotations(getQuotations());
  };

  useEffect(() => {
    loadData();
    const handleFocus = () => loadData();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const filteredQuotations = quotations.filter(q => {
    if (activeTab !== 'All' && q.status.toLowerCase() !== activeTab.toLowerCase()) return false;
    
    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase();
      return (
        q.client_name.toLowerCase().includes(query) ||
        q.project_title.toLowerCase().includes(query) ||
        q.quote_number.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const sortedQuotations = [...filteredQuotations].sort((a, b) => {
    if (sortOrder === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    if (sortOrder === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    if (sortOrder === 'amount_desc') return b.total_amount - a.total_amount;
    if (sortOrder === 'expiring_soon') {
      const aTime = new Date(a.valid_until).getTime();
      const bTime = new Date(b.valid_until).getTime();
      const now = Date.now();
      if (aTime < now && bTime < now) return bTime - aTime;
      if (aTime < now) return 1;
      if (bTime < now) return -1;
      return aTime - bTime;
    }
    return 0;
  });

  const handleAction = (e: React.MouseEvent, action: string, quote: Quotation) => {
    e.stopPropagation();
    setOpenMenuId(null);

    if (action === 'view') {
      navigate(`/app/quotation/${quote.id}`);
    } else if (action === 'delete') {
      if (window.confirm('Are you sure you want to delete this quotation?')) {
        deleteQuotation(quote.id);
        loadData();
        setToast({ isVisible: true, message: 'Quotation deleted', variant: 'success' });
        setTimeout(() => setToast(prev => ({ ...prev, isVisible: false })), 2000);
      }
    } else if (action === 'accept') {
      updateQuotationStatus(quote.id, 'accepted');
      loadData();
      setToast({ isVisible: true, message: 'Quotation marked as accepted', variant: 'success' });
      setTimeout(() => setToast(prev => ({ ...prev, isVisible: false })), 2000);
    }
  };

  const getDaysUntilExpiry = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="min-h-screen bg-bg pb-24">
      {toast.isVisible && (
        <Toast message={toast.message} variant={toast.variant} onClose={() => setToast(prev => ({ ...prev, isVisible: false }))} />
      )}

      {/* Header */}
      <div className="bg-white border-b border-border sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 pt-6 pb-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-text">Quotations</h1>
              <p className="text-sm text-text-secondary">{quotations.length} quotes</p>
            </div>
            <Button onClick={() => navigate('/app/quotation/new')} className="bg-green-600 hover:bg-green-700 border-green-600">
              + New Quote
            </Button>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
            <input
              type="text"
              placeholder="Search client or project..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-bg border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-text-tertiary hover:text-text">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {(['All', 'Draft', 'Sent', 'Accepted', 'Declined', 'Expired'] as TabType[]).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab 
                      ? 'bg-text text-white' 
                      : 'bg-bg text-text-secondary hover:bg-border'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            
            <div className="relative ml-4 shrink-0">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                className="appearance-none bg-bg border border-border rounded-lg pl-3 pr-8 py-1.5 text-sm font-medium text-text focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="amount_desc">High Value</option>
                <option value="expiring_soon">Expiring Soon</option>
              </select>
              <ArrowUpDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        {sortedQuotations.length === 0 ? (
          <EmptyState 
            icon={<FileText className="w-12 h-12 text-text-tertiary" />}
            title="No quotations found"
            description={searchQuery ? "Try adjusting your search or filters." : "Create a quote to share your project pricing with clients."}
            action={!searchQuery && <Button onClick={() => navigate('/app/quotation/new')}>Create First Quote</Button>}
          />
        ) : (
          <div className="space-y-3">
            {sortedQuotations.map(quote => {
              const daysLeft = getDaysUntilExpiry(quote.valid_until);
              const isExpiringSoon = quote.status === 'sent' && daysLeft > 0 && daysLeft <= 3;
              
              let borderClass = 'border-border';
              if (quote.status === 'accepted') borderClass = 'border-l-[3px] border-l-green-600';
              if (quote.status === 'declined') borderClass = 'border-l-[3px] border-l-red-500';
              if (isExpiringSoon) borderClass = 'border-l-[3px] border-l-amber-500';

              return (
                <Card 
                  key={quote.id} 
                  className={`p-4 cursor-pointer hover:border-primary/30 transition-colors relative ${borderClass} ${quote.status === 'expired' ? 'opacity-60' : ''}`}
                  onClick={() => navigate(`/app/quotation/${quote.id}`)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-text">{quote.client_name}</h3>
                      <p className="text-sm text-text-secondary font-medium">{quote.project_title}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {isExpiringSoon && <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Expiring soon!</span>}
                      <Badge variant={
                        quote.status === 'accepted' ? 'success' :
                        quote.status === 'declined' ? 'danger' :
                        quote.status === 'expired' ? 'warning' :
                        quote.status === 'sent' ? 'info' : 'neutral'
                      }>
                        {quote.status}
                      </Badge>
                      
                      <div className="relative">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(openMenuId === quote.id ? null : quote.id);
                          }}
                          className="p-1 text-text-tertiary hover:text-text rounded-md hover:bg-bg"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                        
                        {openMenuId === quote.id && (
                          <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-border py-1 z-20">
                            <button onClick={(e) => handleAction(e, 'view', quote)} className="w-full text-left px-4 py-2 text-sm text-text hover:bg-bg flex items-center">
                              <Eye className="w-4 h-4 mr-2 text-text-secondary" /> View Details
                            </button>
                            {quote.status === 'sent' && (
                              <button onClick={(e) => handleAction(e, 'accept', quote)} className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50 flex items-center">
                                <CheckCircle className="w-4 h-4 mr-2" /> Mark Accepted
                              </button>
                            )}
                            <button onClick={(e) => handleAction(e, 'delete', quote)} className="w-full text-left px-4 py-2 text-sm text-danger hover:bg-red-50 flex items-center">
                              <Trash2 className="w-4 h-4 mr-2" /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-end mt-4">
                    <div>
                      <p className="text-xs text-text-tertiary mb-0.5">{quote.quote_number} · {formatDate(quote.created_at)}</p>
                      <p className="font-bold text-text">₦{formatCurrency(quote.total_amount).replace('₦', '')}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-text-tertiary mb-0.5">Valid until {formatDate(quote.valid_until)}</p>
                      {quote.status === 'sent' && (
                        <p className={`text-xs font-medium ${daysLeft < 0 ? 'text-red-500' : daysLeft <= 3 ? 'text-amber-500' : 'text-text-secondary'}`}>
                          {daysLeft < 0 ? 'Expired' : `Expires in ${daysLeft} days`}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
