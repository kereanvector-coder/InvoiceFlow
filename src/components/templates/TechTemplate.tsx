import React from 'react';
import { Invoice } from '../../store/invoiceStore';
import { Quotation } from '../../store/quotationStore';
import { getDocumentDetails } from '../../utils/documentUtils';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import LogoDisplay from './LogoDisplay';
import { getLogo } from './LogoDisplay';

export default function TechTemplate({ invoice, isReceipt }: { invoice: Invoice | Quotation, isReceipt?: boolean }) {
  const { business_snapshot: business, items } = invoice;
  const details = getDocumentDetails(invoice, isReceipt);
  
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
    <div className="bg-[#0D1117] aspect-[210/297] font-mono text-[#E6EDF3]">
      {/* Top bar */}
      <div className="bg-[#161B22] border-b border-[#30363D] px-2 py-1 flex justify-between items-center">
        <div className="flex items-center gap-1.5">
          {hasLogo ? (
            <LogoDisplay invoice={invoice} size={24} style={{ borderRadius: '4px' }} />
          ) : (
            <div className="text-[10px] text-[#238636]">// INVOICE</div>
          )}
          <div>
            <div className="text-[9px] text-[#58A6FF] opacity-80 mt-0.5 font-mono">const id = '{details.documentNumber}';</div>
          </div>
        </div>
        <div className="text-[9px] text-[#8B949E]">
          /* status: {invoice.status.toUpperCase()} */
        </div>
      </div>

      {/* Hero amount block */}
      <div className="px-2 py-1 flex justify-between items-end">
        <div>
          <div className="text-[9px] text-[#8B949E] mb-0.5">// total amount due</div>
          <div className="text-[20px] font-bold text-white tracking-tight leading-none">
            {formatCurrency(invoice.total_amount)}
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <div className="bg-[#2386361A] text-[#238636] px-1 py-0.5 rounded-full text-[8px] flex items-center gap-0.5">
              <div className="w-1 h-1 bg-[#238636] rounded-full"></div>
              active
            </div>
            <div className="text-[9px] text-[#8B949E]">
              due {getRelativeDateText(details.dateValue)}
            </div>
          </div>
        </div>
        
        <div className="bg-[#21262D] border border-[#30363D] rounded-md px-1.5 py-0.5 inline-block">
          <div className="text-[8px] text-[#58A6FF]">
            invoice_id: '<span className="font-mono">{details.documentNumber}</span>' | issued: '{formatDate(invoice.created_at)}'
          </div>
        </div>
      </div>

      {/* Two panel cards */}
      <div className="px-2 grid grid-cols-2 gap-1.5 mt-1 mb-1">
        <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-1.5">
          <div className="text-[8px] text-[#238636] mb-0.5">client_name:</div>
          <div className="text-[11px] text-white font-bold mb-1">{invoice.client_name}</div>
          
          <div className="text-[8px] text-[#238636] mb-0.5">client_phone:</div>
          <div className="text-[9px] text-[#8B949E] mb-1">{invoice.client_phone}</div>
          
          <div className="text-[8px] text-[#238636] mb-0.5">due_date:</div>
          <div className={`text-[9px] ${isOverdue ? 'text-[#F87171]' : 'text-[#8B949E]'}`}>
            '{formatDate(details.dateValue)}'
          </div>
        </div>
        
        {/* <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-1.5"> */}
        {!isReceipt && <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-1.5">
          <div className="text-[8px] text-[#238636] mb-0.5">bank_name:</div>
          <div className="text-[9px] text-white mb-1">'{business.bank_name}'</div>
          
          <div className="text-[8px] text-[#238636] mb-0.5">account_no:</div>
          <div className="text-[11px] text-[#58A6FF] font-bold mb-1">'{business.account_number}'</div>
          
          <div className="text-[8px] text-[#238636] mb-0.5">account_name:</div>
          <div className="text-[9px] text-[#8B949E]">'{business.account_name}'</div>
        </div>}
      </div>

      {/* Deliverables section */}
      <div className="px-2 my-1">
        <div className="text-[9px] text-[#238636] mb-0.5">// deliverables</div>
        <div className="border-t border-[#30363D]"></div>
        
        {items.map((item) => (
          <div key={item.id} className="py-1 border-b border-dashed border-[#21262D] flex justify-between items-center">
            <div>
              <div className="text-[10px] text-white">{item.description}</div>
              <div className="text-[8px] text-[#8B949E] mt-0.5">
                → {item.quantity} unit(s) @ {formatCurrency(item.unit_price)} each
              </div>
            </div>
            <div className="text-[11px] font-bold text-[#238636]">
              {formatCurrency(item.quantity * item.unit_price)}
            </div>
          </div>
        ))}

        
        {details.terms && (
          <div className="mb-1 mt-1">
            <div className="text-[8px] text-[#8B949E] uppercase tracking-[0.1em] font-bold mb-0.5">TERMS & CONDITIONS</div>
            <div className="bg-[#161B22] p-1 rounded-md">
              <div className="text-[9px] text-[#8B949E] whitespace-pre-wrap">
                {details.terms}
              </div>
            </div>
          </div>
        )}

        {/* Totals */}
        <div className="flex justify-end mt-1">
          <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-1.5 min-w-[180px]">
            <div className="flex justify-between text-[9px] text-[#8B949E] mb-0.5">
              <span>subtotal:</span>
              <span>{formatCurrency(invoice.subtotal)}</span>
            </div>
            {invoice.tax_amount > 0 && (
              <div className="flex justify-between text-[9px] text-[#8B949E] mb-0.5">
                <span>tax:</span>
                <span>{formatCurrency(invoice.tax_amount)}</span>
              </div>
            )}
            <div className="border-t border-[#30363D] my-0.5"></div>
            <div className="flex justify-between items-center">
              <span className="text-[9px] text-[#8B949E]">total_due:</span>
              <span className="text-[12px] font-bold text-[#238636]">{formatCurrency(invoice.total_amount)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Transfer instructions */}
      {!isReceipt && <div className="mx-2 mt-1 bg-[#161B22] border border-[#238636] rounded-lg p-1.5">
        <div className="text-[8px] text-[#238636] mb-0.5">// transfer_instructions</div>
        <div className="text-[9px] leading-relaxed">
          <span className="text-[#E6EDF3]">{'{'}</span><br/>
          <span className="text-[#58A6FF] ml-2">bank:</span> <span className="text-[#A5D6FF]">'{business.bank_name}'</span>,<br/>
          <span className="text-[#58A6FF] ml-2">account:</span> <span className="text-[#A5D6FF]">'{business.account_number}'</span>,<br/>
          <span className="text-[#58A6FF] ml-2">name:</span> <span className="text-[#A5D6FF]">'{business.account_name}'</span><br/>
          <span className="text-[#E6EDF3]">{'}'}</span>
        </div>
      </div>}

      {/* Notes */}
      {invoice.notes && (
        <div className="mx-2 mt-1 text-[9px] text-[#8B949E] italic whitespace-pre-wrap">
          /* {invoice.notes} */
        </div>
      )}

      {/* Signature */}
      {business.signature && (
        <div className="mx-2 mt-1 flex justify-end">
          <div className="text-center">
            <div className="text-[8px] text-[#238636] mb-0.5">// auth_signature</div>
            <img src={business.signature} alt="Signature" className="h-6 object-contain mb-0.5 mx-auto" />
            <div className="w-20 border-t border-[#30363D] mx-auto"></div>
            <div className="text-[8px] text-[#8B949E] mt-0.5 font-medium">{business.owner_name}</div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-[#30363D] mt-1 px-2 py-1">
        <div className="text-[8px] text-[#8B949E]">
          // Invoice generated via InvoiceFlow API
        </div>
      </div>

    </div>
  );
}
