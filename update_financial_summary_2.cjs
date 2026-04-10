const fs = require('fs');

let content = fs.readFileSync('src/pages/FinancialSummary.tsx', 'utf8');

const returnIndex = content.indexOf('  return (');
if (returnIndex === -1) throw new Error('Could not find return statement');

const beforeReturn = content.substring(0, returnIndex);

const newReturn = `  return (
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
      <div className="bg-surface border-b border-border sticky top-0 z-10 px-4 sm:px-6 py-3 flex items-center justify-between">
        <button onClick={() => navigate('/app')} className="p-2 -ml-2 hover:bg-bg rounded-lg text-text-secondary transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-text">Financial Summary</h1>
        <div className="w-9"></div>
      </div>
      
      {/* 2. Month Navigator */}
      <div className="bg-surface border-b border-border sticky top-[52px] z-10 mb-4 px-4 sm:px-6 py-3 flex items-center justify-between">
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
          className={\`p-2 rounded-full transition-colors \${isCurrentMonth ? 'text-neutral-300' : 'text-text-secondary hover:bg-bg'}\`}
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
            {collectionRate !== null ? \`\${collectionRate}%\` : '—'}
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
                <div key={status} className={\`px-4 py-3.5 \${!isLast ? 'border-b border-[#F3F4F6]' : ''}\`}>
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
                      style={{ width: \`\${width}%\`, backgroundColor: statusColors[status] }}
                    ></div>
                  </div>
                </div>
              );
            })
          )}
        </div>
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
                className={\`px-4 py-3.5 flex justify-between items-center active:bg-neutral-50 transition-colors cursor-pointer \${idx !== topClients.length - 1 ? 'border-b border-[#F3F4F6]' : ''}\`}
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
                      <span className={\`text-[10px] font-bold \${data.isCurrent ? 'text-[#059669]' : 'text-[#6B7280]'}\`}>
                        {formatAbbreviated(data.amount)}
                      </span>
                    )}
                  </div>
                  <div className="w-full max-w-[32px] rounded-t-md transition-all duration-300" style={{ height: \`\${height}px\`, backgroundColor: barColor }}></div>
                  <div className={\`text-[11px] mt-1.5 \${data.isCurrent ? 'text-[#059669] font-bold' : 'text-[#9CA3AF]'}\`}>
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
              <span className={\`text-lg font-bold \${colorClass}\`}>{rate}%</span>
            </div>
          );
        })()}
      </div>

      {/* 9. Bottom spacer */}
      <div style={{ height: '100px' }} />
    </div>
  );
}
`;

fs.writeFileSync('src/pages/FinancialSummary.tsx', beforeReturn + newReturn, 'utf8');
