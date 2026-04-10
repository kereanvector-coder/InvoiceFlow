import React from 'react';
import { Invoice } from '../../store/invoiceStore';
import { Quotation } from '../../store/quotationStore';
import { getDocumentDetails } from '../../utils/documentUtils';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import LogoDisplay from './LogoDisplay';
import { getLogo } from './LogoDisplay';

export default function TechTemplate({ invoice }: { invoice: Invoice | Quotation }) {
  const { business_snapshot: business, items } = invoice;
  const details = getDocumentDetails(invoice);
  
  const getRelativeDateText = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    now.setHours(0,0,0,0);
    date.setHours(0,0,0,0);
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'tomorrow';
    if (diffDays === -1) return 'yesterday';
    if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
    return `in ${diffDays} days`;
  };

  const isOverdue = invoice.status === 'overdue' || (new Date(details.dateValue) < new Date() && invoice.status !== 'paid');
  const hasLogo = !!getLogo(invoice);

  return (
    <div className="bg-[#0D1117] min-h-screen font-mono text-[#E6EDF3]">
      {/* Top bar */}
      <div className="bg-[#161B22] border-b border-[#30363D] px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          {hasLogo ? (
            <LogoDisplay invoice={invoice} size={36} style={{ borderRadius: '6px' }} />
          ) : (
            <div className="text-[14px] text-[#238636]">// INVOICE</div>
          )}
          <div>
            <div className="text-[12px] text-[#58A6FF] opacity-80 mt-1 font-mono">const id = '{details.documentNumber}';</div>
          </div>
        </div>
        <div className="text-[12px] text-[#8B949E]">
          /* status: {invoice.status.toUpperCase()} */
        </div>
      </div>

      {/* Hero amount block */}
      <div className="px-6 py-8">
        <div className="text-[12px] text-[#8B949E] mb-2">// total amount due</div>
        <div className="text-[42px] font-bold text-white tracking-tight">
          {formatCurrency(invoice.total_amount)}
        </div>
        <div className="flex items-center gap-3 mt-3">
          <div className="bg-[#238636]/10 text-[#238636] px-2 py-0.5 rounded-full text-[11px] flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-[#238636] rounded-full"></div>
            active
          </div>
          <div className="text-[12px] text-[#8B949E]">
            due {getRelativeDateText(details.dateValue)}
          </div>
        </div>
        
        <div className="bg-[#21262D] border border-[#30363D] rounded-md px-3 py-1.5 inline-block mt-4">
          <div className="text-[11px] text-[#58A6FF]">
            invoice_id: '<span className="font-mono">{details.documentNumber}</span>' | issued: '{formatDate(invoice.created_at)}'
          </div>
        </div>
      </div>

      {/* Two panel cards */}
      <div className="px-6 grid grid-cols-2 gap-4 mb-5">
        <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-4">
          <div className="text-[11px] text-[#238636] mb-1">client_name:</div>
          <div className="text-[15px] text-white font-bold mb-3">{invoice.client_name}</div>
          
          <div className="text-[11px] text-[#238636] mb-1">client_phone:</div>
          <div className="text-[13px] text-[#8B949E] mb-3">{invoice.client_phone}</div>
          
          <div className="text-[11px] text-[#238636] mb-1">due_date:</div>
          <div className={`text-[13px] ${isOverdue ? 'text-red-400' : 'text-[#8B949E]'}`}>
            '{formatDate(details.dateValue)}'
          </div>
        </div>
        
        <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-4">
          <div className="text-[11px] text-[#238636] mb-1">bank_name:</div>
          <div className="text-[13px] text-white mb-3">'{business.bank_name}'</div>
          
          <div className="text-[11px] text-[#238636] mb-1">account_no:</div>
          <div className="text-[15px] text-[#58A6FF] font-bold mb-3">'{business.account_number}'</div>
          
          <div className="text-[11px] text-[#238636] mb-1">account_name:</div>
          <div className="text-[13px] text-[#8B949E]">'{business.account_name}'</div>
        </div>
      </div>

      {/* Deliverables section */}
      <div className="px-6 my-5">
        <div className="text-[12px] text-[#238636] mb-2">// deliverables</div>
        <div className="border-t border-[#30363D]"></div>
        
        {items.map((item) => (
          <div key={item.id} className="py-3.5 border-b border-dashed border-[#21262D] flex justify-between items-center">
            <div>
              <div className="text-[14px] text-white">{item.description}</div>
              <div className="text-[12px] text-[#8B949E] mt-1">
                → {item.quantity} unit(s) @ {formatCurrency(item.unit_price)} each
              </div>
            </div>
            <div className="text-[15px] font-bold text-[#238636]">
              {formatCurrency(item.quantity * item.unit_price)}
            </div>
          </div>
        ))}

        
        {details.isQuote && details.terms && (
          <div className="mb-6">
            <div className="text-[11px] text-gray-500 uppercase tracking-[0.1em] font-bold mb-2">TERMS & CONDITIONS</div>
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="text-[13px] text-gray-600 whitespace-pre-wrap">
                {details.terms}
              </div>
            </div>
          </div>
        )}

        {/* Totals */}
        <div className="flex justify-end mt-4">
          <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-3.5 min-w-[240px]">
            <div className="flex justify-between text-[13px] text-[#8B949E] mb-2">
              <span>subtotal:</span>
              <span>{formatCurrency(invoice.subtotal)}</span>
            </div>
            {invoice.tax_amount > 0 && (
              <div className="flex justify-between text-[13px] text-[#8B949E] mb-3">
                <span>tax:</span>
                <span>{formatCurrency(invoice.tax_amount)}</span>
              </div>
            )}
            <div className="border-t border-[#30363D] my-2"></div>
            <div className="flex justify-between items-center">
              <span className="text-[13px] text-[#8B949E]">total_due:</span>
              <span className="text-[16px] font-bold text-[#238636]">{formatCurrency(invoice.total_amount)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Transfer instructions */}
      <div className="mx-6 mt-4 bg-[#161B22] border border-[#238636] rounded-lg p-4">
        <div className="text-[12px] text-[#238636] mb-2">// transfer_instructions</div>
        <div className="text-[13px] leading-relaxed">
          <span className="text-[#E6EDF3]">{'{'}</span><br/>
          <span className="text-[#58A6FF] ml-4">bank:</span> <span className="text-[#A5D6FF]">'{business.bank_name}'</span>,<br/>
          <span className="text-[#58A6FF] ml-4">account:</span> <span className="text-[#A5D6FF]">'{business.account_number}'</span>,<br/>
          <span className="text-[#58A6FF] ml-4">name:</span> <span className="text-[#A5D6FF]">'{business.account_name}'</span><br/>
          <span className="text-[#E6EDF3]">{'}'}</span>
        </div>
      </div>

      {/* Notes */}
      {invoice.notes && (
        <div className="mx-6 mt-4 text-[13px] text-[#8B949E] italic whitespace-pre-wrap">
          /* {invoice.notes} */
        </div>
      )}

      {/* Signature */}
      {business.signature && (
        <div className="mx-6 mt-6 flex justify-end">
          <div className="text-center">
            <div className="text-[11px] text-[#238636] mb-2">// auth_signature</div>
            <img src={business.signature} alt="Signature" className="h-16 object-contain mb-2 mx-auto" />
            <div className="w-40 border-t border-[#30363D] mx-auto"></div>
            <div className="text-[12px] text-[#8B949E] mt-1 font-medium">{business.owner_name}</div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-[#30363D] mt-6 px-6 py-4">
        <div className="text-[11px] text-[#8B949E]">
          // Invoice generated via InvoiceFlow API
        </div>
      </div>

    </div>
  );
}
