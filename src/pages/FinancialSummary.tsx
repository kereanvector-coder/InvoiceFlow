import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, BarChart3 } from 'lucide-react';
import { getInvoices, Invoice } from '../store/invoiceStore';
import { getQuotations, Quotation } from '../store/quotationStore';
import { getExpenses, EXPENSE_CATEGORIES } from '../store/expenseStore';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const SHORT_MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

// Helper functions
const getInvoicesForMonth = (invoices: Invoice[], month: number, year: number) => {
  return invoices.filter(inv => {
    if (inv.is_deleted) return false;
    const date = new Date(inv.created_at);
    return date.getMonth() === month && date.getFullYear() === year;
  });
};

const getPaidForMonth = (invoices: Invoice[], month: number, year: number) => {
  return invoices.filter(inv => {
    if (inv.is_deleted || inv.status !== 'paid' || !inv.paid_at) return false;
    const date = new Date(inv.paid_at);
    return date.getMonth() === month && date.getFullYear() === year;
  });
};

const sumAmount = (items: { total_amount: number }[]) => {
  const sumKobo = items.reduce((sum, item) => sum + item.total_amount, 0);
  return sumKobo / 100;
};

const formatMoney = (amount: number) => {
  return "₦" + amount.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

const formatAbbreviated = (amount: number) => {
  if (amount >= 1000000) {
    return `₦${(amount / 1000000).toFixed(1)}m`;
  }
  if (amount >= 1000) {
    return `₦${Math.floor(amount / 1000)}k`;
  }
  return `₦${amount}`;
};

export default function FinancialSummary() {
  const navigate = useNavigate();
  const allInvoices = useMemo(() => getInvoices(), []);
  const allQuotations = useMemo(() => getQuotations(), []);
  const allExpenses = useMemo(() => getExpenses(), []);
  
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const isCurrentMonth = selectedMonth === currentDate.getMonth() && selectedYear === currentDate.getFullYear();

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(prev => prev - 1);
    } else {
      setSelectedMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (isCurrentMonth) return;
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(prev => prev + 1);
    } else {
      setSelectedMonth(prev => prev + 1);
    }
  };

  // Empty state check
  if (allInvoices.length === 0) {
    return (
      <div className="min-h-screen bg-bg flex flex-col pb-[100px]">
        <div className="bg-surface border-b border-border">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3">
            <button onClick={() => navigate('/app')} className="p-2 -ml-2 hover:bg-bg rounded-lg text-text-secondary transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-text">Financial Summary</h1>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <BarChart3 className="w-12 h-12 text-neutral-400 mb-4" />
          <h2 className="text-xl font-bold text-text mb-2">No data yet</h2>
          <p className="text-body text-text-secondary mb-6 max-w-xs">
            Create your first invoice to start seeing your financial summary here
          </p>
          <button 
            onClick={() => navigate('/create')}
            className="bg-primary-500 text-white font-bold py-3 px-6 rounded-xl hover:bg-primary-600 transition-colors"
          >
            Create Invoice
          </button>
        </div>
      </div>
    );
  }

  // Section 1 Calculations
  const invoicesThisMonth = getInvoicesForMonth(allInvoices, selectedMonth, selectedYear);
  const paidThisMonth = getPaidForMonth(allInvoices, selectedMonth, selectedYear);
  
  const totalEarned = sumAmount(paidThisMonth);
  const invoicedAmount = sumAmount(invoicesThisMonth);
  const collectedAmount = sumAmount(invoicesThisMonth.filter(inv => inv.status === 'paid'));
  const outstandingAmount = sumAmount(invoicesThisMonth.filter(inv => inv.status === 'sent' || inv.status === 'overdue'));

  const collectionRate = invoicedAmount > 0 ? Math.round((collectedAmount / invoicedAmount) * 100) : null;
  let rateColor = '#6B7280';
  if (collectionRate !== null) {
    if (collectionRate >= 80) rateColor = '#10B981';
    else if (collectionRate >= 50) rateColor = '#F59E0B';
    else rateColor = '#EF4444';
  }

  // Section 2 Calculations
  const statusCounts = { paid: 0, sent: 0, overdue: 0, draft: 0 };
  const statusAmounts = { paid: 0, sent: 0, overdue: 0, draft: 0 };
  
  invoicesThisMonth.forEach(inv => {
    statusCounts[inv.status]++;
    statusAmounts[inv.status] += (inv.total_amount / 100);
  });

  const statusColors = {
    paid: '#10B981',
    sent: '#F59E0B',
    overdue: '#EF4444',
    draft: '#9CA3AF'
  };

  const statusNames = {
    paid: 'Paid',
    sent: 'Sent',
    overdue: 'Overdue',
    draft: 'Draft'
  };

  // Expenses & Profit Calculations
  const expensesThisMonth = allExpenses.filter(exp => {
    const d = new Date(exp.date);
    return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
  });
  
  const totalExpensesThisMonth = expensesThisMonth.reduce((sum, exp) => sum + exp.amount, 0);
  const netProfitThisMonth = totalEarned - totalExpensesThisMonth;
  const profitMargin = totalEarned > 0 ? Math.round((netProfitThisMonth / totalEarned) * 100) : 0;

  const expenseCategoryBreakdown = useMemo(() => {
    const breakdown: Record<string, number> = {};
    expensesThisMonth.forEach(exp => {
      breakdown[exp.category] = (breakdown[exp.category] || 0) + exp.amount;
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
          percentage: totalExpensesThisMonth > 0 ? (amount / totalExpensesThisMonth) * 100 : 0
        };
      })
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3); // Top 3 only
  }, [expensesThisMonth, totalExpensesThisMonth]);

  // Section 3 Calculations
  const clientTotals: Record<string, { count: number, amount: number, statuses: string[] }> = {};
  invoicesThisMonth.forEach(inv => {
    if (!clientTotals[inv.client_name]) {
      clientTotals[inv.client_name] = { count: 0, amount: 0, statuses: [] };
    }
    clientTotals[inv.client_name].count++;
    clientTotals[inv.client_name].amount += (inv.total_amount / 100);
    clientTotals[inv.client_name].statuses.push(inv.status);
  });

  const topClients = Object.entries(clientTotals)
    .sort((a, b) => b[1].amount - a[1].amount)
    .slice(0, 5);

  // Section 4 Calculations (YTD)
  const invoicesThisYear = allInvoices.filter(inv => !inv.is_deleted && new Date(inv.created_at).getFullYear() === currentDate.getFullYear());
  const ytdInvoiced = sumAmount(invoicesThisYear);
  const ytdCollected = sumAmount(invoicesThisYear.filter(inv => inv.status === 'paid'));
  const ytdOverdue = sumAmount(invoicesThisYear.filter(inv => inv.status === 'overdue'));
  
  const expensesThisYear = allExpenses.filter(exp => new Date(exp.date).getFullYear() === currentDate.getFullYear());
  const ytdExpenses = expensesThisYear.reduce((sum, exp) => sum + exp.amount, 0);
  const ytdNetProfit = ytdCollected - ytdExpenses;
  
  const monthlyTotals = new Array(12).fill(0);
  allInvoices.forEach(inv => {
    if (!inv.is_deleted && inv.status === 'paid' && inv.paid_at) {
      const d = new Date(inv.paid_at);
      if (d.getFullYear() === currentDate.getFullYear()) {
        monthlyTotals[d.getMonth()] += (inv.total_amount / 100);
      }
    }
  });
  
  let bestMonthIdx = -1;
  let bestMonthAmount = 0;
  monthlyTotals.forEach((amt, idx) => {
    if (amt > bestMonthAmount) {
      bestMonthAmount = amt;
      bestMonthIdx = idx;
    }
  });

  // Section 5 Calculations (6-Month Trend)
  const trendData = [];
  let maxTrendAmount = 0;
  
  for (let i = 5; i >= 0; i--) {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const m = d.getMonth();
    const y = d.getFullYear();
    
    const paidInMonth = getPaidForMonth(allInvoices, m, y);
    const amt = sumAmount(paidInMonth);
    
    if (amt > maxTrendAmount) maxTrendAmount = amt;
    
    trendData.push({
      month: m,
      year: y,
      label: SHORT_MONTHS[m],
      amount: amt,
      isCurrent: m === currentDate.getMonth() && y === currentDate.getFullYear()
    });
  }

  return (
    <div 
      className="bg-bg max-w-3xl mx-auto"
      style={{
        height: '100vh',
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch',
        paddingBottom: '100px'
      }}
    >
      {/* 1. Header */}
      <div className="bg-surface border-b border-border px-4 sm:px-6 py-3 flex items-center justify-between">
        <button onClick={() => navigate('/app')} className="p-2 -ml-2 hover:bg-bg rounded-lg text-text-secondary transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-text">Financial Summary</h1>
        <div className="w-9"></div>
      </div>
      
      {/* 2. Month Navigator */}
      <div className="bg-surface border-b border-border mb-4 px-4 sm:px-6 py-3 flex items-center justify-between">
        <button 
          onClick={handlePrevMonth}
          className="p-2 text-text-secondary hover:bg-bg rounded-full transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="font-bold text-[16px] text-text">
          {MONTHS[selectedMonth]} {selectedYear}
        </div>
        <button 
          onClick={handleNextMonth}
          disabled={isCurrentMonth}
          className={`p-2 rounded-full transition-colors ${isCurrentMonth ? 'text-neutral-300' : 'text-text-secondary hover:bg-bg'}`}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* 3. Monthly Overview Card */}
      <div style={{ background: '#111827', borderRadius: '16px', margin: '0 16px 16px', padding: '20px' }} className="text-white">
        <div className="mb-4">
          <div className="text-[13px] text-[#9CA3AF] mb-1">Total Earned</div>
          <div className="text-[32px] font-bold text-white leading-tight">
            {formatMoney(totalEarned)}
          </div>
          {paidThisMonth.length > 0 ? (
            <div className="text-[13px] text-[#6B7280] mt-1">
              from {paidThisMonth.length} invoice(s)
            </div>
          ) : (
            <div className="text-[14px] text-[#6B7280] italic mt-1">
              No payments received this month
            </div>
          )}
        </div>
        
        <div className="h-[1px] bg-[#1F2937] my-4"></div>
        
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div>
            <div className="font-bold text-white text-[16px]">{formatAbbreviated(invoicedAmount)}</div>
            <div className="text-[11px] text-[#9CA3AF] mt-1">Invoiced</div>
          </div>
          <div>
            <div className="font-bold text-white text-[16px]">{formatAbbreviated(collectedAmount)}</div>
            <div className="text-[11px] text-[#9CA3AF] mt-1">Collected</div>
          </div>
          <div>
            <div className="font-bold text-white text-[16px]">{formatAbbreviated(outstandingAmount)}</div>
            <div className="text-[11px] text-[#9CA3AF] mt-1">Outstanding</div>
          </div>
        </div>
        
        <div className="h-[1px] bg-[#1F2937] mb-3"></div>
        
        <div className="flex justify-between items-center">
          <div className="text-[13px] text-[#9CA3AF]">Collection Rate</div>
          <div className="font-bold text-[15px]" style={{ color: rateColor }}>
            {collectionRate !== null ? `${collectionRate}%` : '—'}
          </div>
        </div>
      </div>

      {/* 4. Status Breakdown */}
      <div style={{ margin: '0 16px 16px' }}>
        <h2 className="text-[16px] font-bold text-[#111827] mb-3">This Month's Invoices</h2>
        <div className="bg-white border border-[#E5E7EB] rounded-xl py-1">
          {invoicesThisMonth.length === 0 ? (
            <div className="text-center text-[#9CA3AF] text-[14px] py-5">
              No invoices this month
            </div>
          ) : (
            (['paid', 'sent', 'overdue', 'draft'] as const).map((status, idx, arr) => {
              if (statusCounts[status] === 0) return null;
              const isLast = idx === arr.length - 1 || arr.slice(idx + 1).every(s => statusCounts[s] === 0);
              const width = invoicedAmount > 0 ? (statusAmounts[status] / invoicedAmount) * 100 : 0;
              
              return (
                <div key={status} className={`px-4 py-3.5 ${!isLast ? 'border-b border-[#F3F4F6]' : ''}`}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: statusColors[status] }}></div>
                      <span className="text-[14px] text-[#374151]">{statusNames[status]}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-[13px] text-[#6B7280] mr-3">{statusCounts[status]} invoice(s)</span>
                      <span className="text-[14px] font-bold" style={{ color: statusColors[status] }}>
                        {formatMoney(statusAmounts[status])}
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-[3px] bg-[#F3F4F6] rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full" 
                      style={{ width: `${width}%`, backgroundColor: statusColors[status] }}
                    ></div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 4.5 Expenses & Profit */}
      <div style={{ margin: '0 16px 16px' }}>
        <h2 className="text-[16px] font-bold text-[#111827] mb-3">Expenses & Profit</h2>
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 mb-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-[10px] text-[#059669] font-bold uppercase tracking-wider mb-1">Income</div>
              <div className="text-[20px] font-bold text-[#059669]">{formatMoney(totalEarned)}</div>
            </div>
            <div>
              <div className="text-[10px] text-[#EF4444] font-bold uppercase tracking-wider mb-1">Expenses</div>
              <div className="text-[20px] font-bold text-[#EF4444]">{formatMoney(totalExpensesThisMonth)}</div>
            </div>
          </div>
          
          <div className="flex items-end gap-2 mb-4 h-[60px]">
            <div className="flex-1 flex flex-col justify-end h-full">
              <div className="w-full bg-[#059669] rounded-t-md" style={{ height: `${Math.max(4, totalEarned > 0 ? (totalEarned / Math.max(totalEarned, totalExpensesThisMonth)) * 100 : 0)}%` }}></div>
            </div>
            <div className="flex-1 flex flex-col justify-end h-full">
              <div className="w-full bg-[#EF4444] rounded-t-md" style={{ height: `${Math.max(4, totalExpensesThisMonth > 0 ? (totalExpensesThisMonth / Math.max(totalEarned, totalExpensesThisMonth)) * 100 : 0)}%` }}></div>
            </div>
          </div>
          
          <div className={`rounded-lg p-3 flex justify-between items-center ${netProfitThisMonth > 0 ? 'bg-[#D1FAE5]' : netProfitThisMonth < 0 ? 'bg-[#FEE2E2]' : 'bg-[#F3F4F6]'}`}>
            <div className="font-bold text-[14px] text-[#111827]">Net Profit</div>
            <div className={`font-bold text-[17px] ${netProfitThisMonth > 0 ? 'text-[#059669]' : netProfitThisMonth < 0 ? 'text-[#EF4444]' : 'text-[#111827]'}`}>
              {netProfitThisMonth > 0 ? '+' : ''}{formatMoney(netProfitThisMonth)}
            </div>
          </div>
          
          {totalEarned > 0 && (
            <div className="text-center text-[13px] text-[#6B7280] mt-3">
              Profit Margin: {profitMargin}%
            </div>
          )}
        </div>

        {expenseCategoryBreakdown.length > 0 && (
          <>
            <h3 className="text-[14px] font-bold text-[#111827] mb-2">Top Spending Categories</h3>
            <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden mb-3">
              <div className="divide-y divide-[#F3F4F6]">
                {expenseCategoryBreakdown.map(cat => (
                  <div key={cat.id} className="p-3">
                    <div className="flex justify-between items-center mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{cat.emoji}</span>
                        <span className="font-bold text-[13px] text-[#111827]">{cat.label}</span>
                      </div>
                      <span className="font-bold text-[14px] text-[#111827]">{formatMoney(cat.amount)}</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-center">
              <button 
                onClick={() => navigate('/expenses')}
                className="text-[13px] font-medium text-[#059669] hover:text-[#047857] hover:underline"
              >
                See all →
              </button>
            </div>
          </>
        )}
      </div>

      {/* 5. Top Clients */}
      <div style={{ margin: '0 16px 16px' }}>
        <h2 className="text-[16px] font-bold text-[#111827] mb-3">Top Clients</h2>
        <div className="bg-white border border-[#E5E7EB] rounded-xl py-1">
          {topClients.length === 0 ? (
            <div className="text-center text-[#9CA3AF] text-[14px] py-5">
              No clients invoiced this month
            </div>
          ) : (
            topClients.map(([clientName, data], idx) => (
              <div 
                key={clientName} 
                className={`px-4 py-3.5 flex justify-between items-center active:bg-neutral-50 transition-colors cursor-pointer ${idx !== topClients.length - 1 ? 'border-b border-[#F3F4F6]' : ''}`}
                onClick={() => navigate('/invoices')}
              >
                <div className="flex items-center gap-3">
                  <div className="font-bold text-[#059669] text-[18px] min-w-[24px]">{idx + 1}</div>
                  <div>
                    <div className="font-bold text-[14px] text-[#111827]">{clientName}</div>
                    <div className="text-[12px] text-[#9CA3AF]">{data.count} invoice(s)</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-[16px] text-[#111827] mb-1">{formatMoney(data.amount)}</div>
                  <div className="flex justify-end gap-1">
                    {data.statuses.map((s, i) => (
                      <div key={i} className="w-2 h-2 rounded-full" style={{ backgroundColor: statusColors[s as keyof typeof statusColors] }}></div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 6. Year to Date */}
      <div style={{ margin: '0 16px 16px' }}>
        <h2 className="text-[16px] font-bold text-[#111827] mb-3">{currentDate.getFullYear()} Year to Date</h2>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-4">
            <div className="text-[12px] text-[#6B7280] mb-1">Total Invoiced</div>
            <div className="font-bold text-[16px] text-[#111827]">{formatMoney(ytdInvoiced)}</div>
          </div>
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-4">
            <div className="text-[12px] text-[#6B7280] mb-1">Total Collected</div>
            <div className="font-bold text-[16px] text-[#059669]">{formatMoney(ytdCollected)}</div>
          </div>
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-4">
            <div className="text-[12px] text-[#6B7280] mb-1">Total Overdue</div>
            <div className="font-bold text-[16px]" style={{ color: ytdOverdue > 0 ? '#EF4444' : '#111827' }}>
              {formatMoney(ytdOverdue)}
            </div>
          </div>
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-4">
            <div className="text-[12px] text-[#6B7280] mb-1">Total Invoices</div>
            <div className="font-bold text-[16px] text-[#111827]">{invoicesThisYear.length}</div>
            <div className="text-[11px] text-[#9CA3AF]">invoices created</div>
          </div>
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-4">
            <div className="text-[12px] text-[#6B7280] mb-1">Total Expenses</div>
            <div className="font-bold text-[16px]" style={{ color: ytdExpenses > 0 ? '#EF4444' : '#111827' }}>
              {formatMoney(ytdExpenses)}
            </div>
          </div>
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-4">
            <div className="text-[12px] text-[#6B7280] mb-1">Net Profit</div>
            <div className="font-bold text-[16px]" style={{ color: ytdNetProfit > 0 ? '#059669' : ytdNetProfit < 0 ? '#EF4444' : '#111827' }}>
              {ytdNetProfit > 0 ? '+' : ''}{formatMoney(ytdNetProfit)}
            </div>
          </div>
        </div>
        
        <div className="bg-[#F0FDF4] rounded-xl p-4 flex justify-between items-center">
          <div className="text-[13px] text-[#059669] font-bold">🏆 Best Month</div>
          <div className="text-right">
            {bestMonthIdx !== -1 && bestMonthAmount > 0 ? (
              <>
                <div className="font-bold text-[#111827]">{MONTHS[bestMonthIdx]}</div>
                <div className="font-bold text-[#059669]">{formatMoney(bestMonthAmount)}</div>
              </>
            ) : (
              <div className="text-[13px] text-[#6B7280]">No payments yet this year</div>
            )}
          </div>
        </div>
      </div>

      {/* 7. 6-Month Trend Chart */}
      <div style={{ margin: '0 16px 16px' }}>
        <h2 className="text-[16px] font-bold text-[#111827] mb-3">6-Month Trend</h2>
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-5">
          <div className="flex justify-between items-end h-[100px]">
            {trendData.map((data, idx) => {
              const height = maxTrendAmount === 0 ? 4 : Math.max(4, (data.amount / maxTrendAmount) * 80);
              let barColor = '#F3F4F6';
              if (data.isCurrent) barColor = '#059669';
              else if (data.amount > 0) barColor = '#D1FAE5';

              return (
                <div 
                  key={idx} 
                  className="flex flex-col items-center w-[14%] cursor-pointer"
                  onClick={() => {
                    setSelectedMonth(data.month);
                    setSelectedYear(data.year);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  <div className="h-4 mb-1 flex items-end justify-center">
                    {data.amount > 0 && (
                      <span className={`text-[10px] font-bold ${data.isCurrent ? 'text-[#059669]' : 'text-[#6B7280]'}`}>
                        {formatAbbreviated(data.amount)}
                      </span>
                    )}
                  </div>
                  <div className="w-full max-w-[32px] rounded-t-md transition-all duration-300" style={{ height: `${height}px`, backgroundColor: barColor }}></div>
                  <div className={`text-[11px] mt-1.5 ${data.isCurrent ? 'text-[#059669] font-bold' : 'text-[#9CA3AF]'}`}>
                    {data.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 8. Quotation Pipeline */}
      <div style={{ background: '#111827', borderRadius: '16px', margin: '0 16px 16px', padding: '20px' }} className="text-white">
        <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-4">QUOTATION PIPELINE</h2>
        
        <p className="text-sm text-neutral-300 font-medium mb-1">Total Pipeline Value</p>
        <h2 className="text-3xl font-bold mb-4">
          {formatMoney(sumAmount(allQuotations.filter(q => q.status === 'sent')))}
        </h2>
        
        <div className="flex justify-between items-end mb-6">
          <div>
            <p className="text-xs text-neutral-400 mb-1">Accepted this month</p>
            <p className="text-sm font-semibold text-green-400">
              {formatMoney(sumAmount(allQuotations.filter(q => q.status === 'accepted' && new Date(q.accepted_at || '').getMonth() === selectedMonth && new Date(q.accepted_at || '').getFullYear() === selectedYear)))}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-neutral-400 mb-1">Pending response</p>
            <p className="text-sm font-semibold text-white">
              {allQuotations.filter(q => q.status === 'sent').length} quotes
            </p>
          </div>
        </div>

        {/* Conversion Rate */}
        {(() => {
          const sentQuotes = allQuotations.filter(q => q.status === 'sent' || q.status === 'accepted' || q.status === 'declined' || q.status === 'expired').length;
          const acceptedQuotes = allQuotations.filter(q => q.status === 'accepted').length;
          const rate = sentQuotes > 0 ? Math.round((acceptedQuotes / sentQuotes) * 100) : 0;
          const colorClass = rate >= 70 ? 'text-green-400' : rate >= 40 ? 'text-amber-400' : 'text-red-400';
          
          return (
            <div className="bg-white/10 rounded-xl border border-white/10 p-4 flex justify-between items-center">
              <span className="text-sm font-medium text-neutral-300">Quote to Invoice Rate</span>
              <span className={`text-lg font-bold ${colorClass}`}>{rate}%</span>
            </div>
          );
        })()}
      </div>

      {/* 9. Bottom spacer */}
      <div style={{ height: '100px' }} />
    </div>
  );
}
