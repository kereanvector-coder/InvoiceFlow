import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Camera, X, Trash2, Receipt, ChevronLeft, ChevronRight } from 'lucide-react';
import { getExpenses, EXPENSE_CATEGORIES, deleteExpense, updateExpense } from '../store/expenseStore';
import { formatCurrency } from '../utils/formatCurrency';
import { getInvoices } from '../store/invoiceStore';

export default function ExpensesScreen() {
  const navigate = useNavigate();
  const allExpenses = getExpenses();
  const invoices = getInvoices();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewReceipt, setViewReceipt] = useState<{ id: string, image: string } | null>(null);

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  const filteredExpenses = useMemo(() => {
    return allExpenses.filter(exp => {
      const expDate = new Date(exp.date);
      const isSameMonth = expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
      if (!isSameMonth) return false;

      if (selectedCategory !== 'all' && exp.category !== selectedCategory) return false;

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchDesc = exp.description.toLowerCase().includes(query);
        const matchVendor = exp.vendor?.toLowerCase().includes(query);
        if (!matchDesc && !matchVendor) return false;
      }

      return true;
    });
  }, [allExpenses, currentMonth, currentYear, selectedCategory, searchQuery]);

  const totalFilteredAmount = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  // Calculate Net Profit for the month
  const totalPaidThisMonth = useMemo(() => {
    return invoices
      .filter(inv => inv.status === 'paid' && inv.paid_at)
      .filter(inv => {
        const d = new Date(inv.paid_at!);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((sum, inv) => sum + inv.total_amount, 0);
  }, [invoices, currentMonth, currentYear]);

  const totalExpensesThisMonth = allExpenses
    .filter(exp => {
      const d = new Date(exp.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((sum, exp) => sum + exp.amount, 0);

  const netProfit = totalPaidThisMonth - totalExpensesThisMonth;

  // Group by date
  const groupedExpenses = useMemo(() => {
    const groups: Record<string, typeof filteredExpenses> = {};
    filteredExpenses.forEach(exp => {
      const dateStr = exp.date.split('T')[0];
      if (!groups[dateStr]) groups[dateStr] = [];
      groups[dateStr].push(exp);
    });
    return groups;
  }, [filteredExpenses]);

  const sortedDates = Object.keys(groupedExpenses).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  // Category Breakdown
  const categoryBreakdown = useMemo(() => {
    const breakdown: Record<string, number> = {};
    const counts: Record<string, number> = {};
    
    // Only use expenses for the current month (ignoring search/category filter for the breakdown section)
    const monthExpenses = allExpenses.filter(exp => {
      const d = new Date(exp.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    monthExpenses.forEach(exp => {
      breakdown[exp.category] = (breakdown[exp.category] || 0) + exp.amount;
      counts[exp.category] = (counts[exp.category] || 0) + 1;
    });

    return Object.entries(breakdown)
      .map(([catId, amount]) => {
        const catDef = EXPENSE_CATEGORIES.find(c => c.id === catId);
        return {
          id: catId,
          label: catDef?.label || 'Other',
          emoji: catDef?.emoji || '📝',
          color: catDef?.color || '#9CA3AF',
          amount,
          count: counts[catId],
          percentage: totalExpensesThisMonth > 0 ? (amount / totalExpensesThisMonth) * 100 : 0
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [allExpenses, currentMonth, currentYear, totalExpensesThisMonth]);

  const handleRemoveReceipt = () => {
    if (viewReceipt) {
      if (window.confirm('Remove this receipt?')) {
        updateExpense(viewReceipt.id, { receipt: null });
        setViewReceipt(null);
        window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: 'Receipt removed', variant: 'success' } }));
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-32">
      {/* Header */}
      <div className="bg-white border-b border-[#E5E7EB] sticky top-0 z-10">
        <div className="flex items-center justify-between h-14 px-4">
          <div>
            <h1 className="text-[18px] font-bold text-gray-900 leading-tight">Expenses</h1>
            <p className="text-[12px] text-gray-500">{formatCurrency(totalExpensesThisMonth)} spent</p>
          </div>
          <button
            onClick={() => navigate('/log-expense')}
            className="flex items-center gap-1 bg-[#059669] text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>

        {/* Month Navigator */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-t border-gray-100">
          <button onClick={handlePrevMonth} className="p-1 hover:bg-gray-200 rounded-full text-gray-600">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-bold text-[14px] text-gray-800">{monthName} {currentYear}</span>
          <button onClick={handleNextMonth} className="p-1 hover:bg-gray-200 rounded-full text-gray-600">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Category Filter */}
        <div className="px-4 py-3 overflow-x-auto hide-scrollbar flex gap-2 border-t border-gray-100">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[13px] font-medium transition-colors ${
              selectedCategory === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {EXPENSE_CATEGORIES.map(cat => {
            const count = allExpenses.filter(e => {
              const d = new Date(e.date);
              return e.category === cat.id && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
            }).length;
            
            if (count === 0 && selectedCategory !== cat.id) return null;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[13px] font-medium transition-colors flex items-center gap-1.5 ${
                  selectedCategory === cat.id ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
                <span className={`text-[11px] ${selectedCategory === cat.id ? 'text-gray-300' : 'text-gray-400'}`}>({count})</span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search expenses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-100 border-transparent rounded-xl text-sm focus:bg-white focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/20 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Summary Row */}
      <div className="px-4 py-3 text-center">
        <span className="text-[12px] text-gray-500 font-medium">
          {filteredExpenses.length} {filteredExpenses.length === 1 ? 'expense' : 'expenses'} · {formatCurrency(totalFilteredAmount)} total
        </span>
      </div>

      {/* Expense List */}
      <div className="px-4 space-y-6">
        {sortedDates.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Receipt className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No expenses logged</h3>
            <p className="text-sm text-gray-500 mb-6 max-w-[250px] mx-auto">Track your business spending to see your real profit</p>
            <button
              onClick={() => navigate('/log-expense')}
              className="bg-[#059669] text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:bg-[#047857]"
            >
              Log First Expense
            </button>
          </div>
        ) : (
          sortedDates.map(dateStr => {
            const dateObj = new Date(dateStr);
            const dateLabel = dateObj.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });
            
            return (
              <div key={dateStr}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-px bg-gray-200 flex-1"></div>
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{dateLabel}</span>
                  <div className="h-px bg-gray-200 flex-1"></div>
                </div>
                
                <div className="space-y-3">
                  {groupedExpenses[dateStr].map(exp => {
                    const catDef = EXPENSE_CATEGORIES.find(c => c.id === exp.category);
                    const timeStr = new Date(exp.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
                    
                    return (
                      <div 
                        key={exp.id}
                        onClick={() => navigate(`/edit-expense/${exp.id}`)}
                        className="bg-white p-3.5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3 active:scale-[0.98] transition-transform cursor-pointer"
                      >
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${catDef?.color || '#9CA3AF'}20` }}
                        >
                          <span className="text-2xl">{catDef?.emoji || '📝'}</span>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-0.5">
                            <div className="font-bold text-[15px] text-gray-900 truncate pr-2">{exp.description}</div>
                            <div className="font-bold text-[15px] text-gray-900 shrink-0">{formatCurrency(exp.amount)}</div>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-1.5 text-[12px] text-gray-500 truncate">
                              <span>{catDef?.label || 'Other'}</span>
                              {exp.vendor && (
                                <>
                                  <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                  <span className="truncate">{exp.vendor}</span>
                                </>
                              )}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {exp.receipt && (
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setViewReceipt({ id: exp.id, image: exp.receipt! });
                                  }}
                                  className="p-1 bg-gray-100 rounded-md hover:bg-gray-200"
                                >
                                  <Camera className="w-3.5 h-3.5 text-gray-600" />
                                </button>
                              )}
                              <span className="text-[11px] text-gray-400">{timeStr}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Category Breakdown */}
      {categoryBreakdown.length > 0 && (
        <div className="px-4 mt-8 mb-8">
          <h2 className="text-[16px] font-bold text-gray-900 mb-4">Spending by Category</h2>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="divide-y divide-gray-100">
              {categoryBreakdown.map(cat => (
                <div key={cat.id} className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-lg" style={{ backgroundColor: `${cat.color}20` }}>
                        {cat.emoji}
                      </div>
                      <div>
                        <div className="font-bold text-[14px] text-gray-900">{cat.label}</div>
                        <div className="text-[12px] text-gray-500">{cat.count} {cat.count === 1 ? 'expense' : 'expenses'}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-[15px] text-gray-900">{formatCurrency(cat.amount)}</div>
                      <div className="text-[12px] text-gray-500">{cat.percentage.toFixed(1)}%</div>
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full" 
                      style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Monthly Total Bar (Sticky Bottom) */}
      <div className="fixed bottom-[calc(60px+env(safe-area-inset-bottom))] left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-10">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[14px] text-gray-600 font-medium">Total for {monthName}</span>
          <span className="text-[18px] font-bold text-gray-900">{formatCurrency(totalExpensesThisMonth)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[13px] text-gray-500">Net Profit</span>
          <span className={`text-[15px] font-bold ${netProfit > 0 ? 'text-[#059669]' : netProfit < 0 ? 'text-red-500' : 'text-gray-500'}`}>
            {netProfit > 0 ? '+' : ''}{formatCurrency(netProfit)}
          </span>
        </div>
      </div>

      {/* Receipt Viewer Modal */}
      {viewReceipt && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          <div className="flex justify-between items-center p-4 bg-gradient-to-b from-black/60 to-transparent absolute top-0 left-0 right-0 z-10">
            <div className="text-white font-medium text-sm">Receipt Photo</div>
            <button onClick={() => setViewReceipt(null)} className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20">
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="flex-1 flex items-center justify-center overflow-hidden touch-manipulation">
            <img 
              src={viewReceipt.image} 
              alt="Receipt Fullscreen" 
              className="w-full h-full object-contain"
            />
          </div>
          
          <div className="p-6 bg-gradient-to-t from-black/80 to-transparent absolute bottom-0 left-0 right-0 flex justify-center pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
            <button 
              onClick={handleRemoveReceipt}
              className="flex items-center gap-2 bg-red-500/20 text-red-400 px-6 py-3 rounded-full font-bold text-[15px] border border-red-500/30 hover:bg-red-500/30 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
              Remove Receipt
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
