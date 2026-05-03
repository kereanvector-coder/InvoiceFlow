import React from 'react';
import { Invoice } from '../../store/invoiceStore';
import { Quotation } from '../../store/quotationStore';
import { getDocumentDetails } from '../../utils/documentUtils';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import LogoDisplay from './LogoDisplay';

export default function ModernTemplate({ invoice, isReceipt }: { invoice: Invoice | Quotation, isReceipt?: boolean }) {
  const { business_snapshot: business, items } = invoice;
  const details = getDocumentDetails(invoice, isReceipt);
  
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  const taxAmount = Math.round(subtotal * invoice.tax_rate);
  const total = subtotal + taxAmount;

  return (
    <div className="bg-[#0A0A0A] font-sans text-[#D4D4D4] p-4 sm:p-4 aspect-[210/297]">
      <div className="max-w-4xl mx-auto bg-[#141414] rounded-lg border border-[#262626] overflow-hidden shadow-2xl print:shadow-none print:border-none">
        
        {/* Header */}
        <div className="p-2 sm:p-3 border-b border-[#262626] flex flex-col sm:flex-row justify-between items-start gap-1.5">
          <div>
            <LogoDisplay invoice={invoice} size={28} className="mb-1" style={{ borderRadius: 0 }} />
            <h1 className="text-xs font-bold text-white mb-0.5">{business.business_name}</h1>
            <p className="text-[#737373] text-[10px] leading-relaxed max-w-xs">{business.owner_name}</p>
            <p className="text-[#737373] text-[10px] mt-0.5">{business.phone_number}</p>
          </div>
          <div className="sm:text-right">
            <div className="text-[#10B981] font-semibold tracking-widest uppercase text-[9px] mb-0.5">{details.documentTypeLabel}</div>
            <div className="text-white text-[11px] font-mono">{details.documentNumber}</div>
            <div className="text-[#737373] text-[9px] mt-1">Date: {formatDate(invoice.created_at)}</div>
            <div className="text-[#737373] text-[9px]">Due: {formatDate(details.dateValue)}</div>
          </div>
        </div>

        {/* Amount Display */}
        <div className="bg-[#10B9811A] border-y border-[#10B98133] p-2 sm:p-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1.5">
          <div>
            <p className="text-[#10B981CC] text-[9px] uppercase tracking-wider mb-0.5 font-medium">Total Amount Due</p>
            <p className="text-sm sm:text-lg font-bold text-[#34D399]">{formatCurrency(total)}</p>
          </div>
          <div className="sm:text-right">
            <p className="text-[#A3A3A3] text-[9px] mb-0.5">Status</p>
            <div className={`inline-block px-1.5 py-0.5 rounded-full text-[8px] font-bold tracking-wide uppercase ${
              invoice.status === 'paid' ? 'bg-[#10B98133] text-[#34D399] border border-[#10B9814D]' :
              invoice.status === 'overdue' ? 'bg-[#EF444433] text-[#F87171] border border-[#EF44444D]' :
              'bg-[#262626] text-[#D4D4D4] border border-[#404040]'
            }`}>
              {isReceipt ? "PAID IN FULL" : invoice.status}
            </div>
          </div>
        </div>

        {/* Cards: Client & Payment */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 p-2 sm:p-3 border-b border-[#262626]">
          <div className="bg-[#1A1A1A] p-1.5 rounded-md border border-[#26262699]">
            <h3 className="text-[#737373] text-[8px] font-bold uppercase tracking-wider mb-0.5">Billed To</h3>
            <p className="text-white font-medium text-[11px] mb-0.5">{invoice.client_name}</p>
            <p className="text-[#A3A3A3] text-[9px]">{invoice.client_phone}</p>
          </div>
          <div className="bg-[#1A1A1A] p-1.5 rounded-md border border-[#26262699]">
            {!isReceipt && <>
            <h3 className="text-[#737373] text-[8px] font-bold uppercase tracking-wider mb-0.5">Payment Details</h3>
            <p className="text-white font-medium text-[11px] mb-0.5">{business.bank_name}</p>
            <p className="text-[#34D399] text-[11px] font-mono mb-0.5">{business.account_number}</p>
            <p className="text-[#A3A3A3] text-[9px]">{business.account_name}</p>
            </>}
          </div>
        </div>

        
        {details.isQuote && details.projectTitle && (
          <div className="bg-[#1A1A1A] border-l-4 border-[#26262699] px-2 py-1 mx-2 sm:mx-3 mt-2 rounded-r-md mb-1">
            <div className="text-[8px] text-[#A3A3A3] uppercase tracking-[0.1em] font-bold mb-0.5">PROJECT</div>
            <div className="text-[11px] text-[#D4D4D4] font-bold">
              {details.projectTitle}
            </div>
            {details.projectDescription && (
              <div className="text-[9px] text-[#737373] italic mt-0.5">
                {details.projectDescription}
              </div>
            )}
          </div>
        )}

        {/* Items */}
        <div className="p-2 sm:p-3">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[400px]">
              <thead>
                <tr className="border-b border-[#262626] text-[#737373] text-[9px]">
                  <th className="pb-1 font-medium uppercase tracking-wider">Description</th>
                  <th className="pb-1 font-medium uppercase tracking-wider text-right">Qty</th>
                  <th className="pb-1 font-medium uppercase tracking-wider text-right">Price</th>
                  <th className="pb-1 font-medium uppercase tracking-wider text-right">Total</th>
                </tr>
              </thead>
              <tbody className="text-[10px]">
                {items.map((item, idx) => (
                  <tr key={idx} className="border-b border-[#26262680] last:border-0">
                    <td className="py-1 text-[#E5E5E5] text-[10px]">{item.description}</td>
                    <td className="py-1 text-right text-[#A3A3A3] text-[10px]">{item.quantity}</td>
                    <td className="py-1 text-right text-[#A3A3A3] text-[10px]">{formatCurrency(item.unit_price)}</td>
                    <td className="py-1 text-right text-white font-medium text-[10px]">{formatCurrency(item.quantity * item.unit_price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          
        {details.terms && (
          <div className="mb-1 mt-2">
            <div className="text-[8px] text-[#A3A3A3] uppercase tracking-[0.1em] font-bold mb-0.5">TERMS & CONDITIONS</div>
            <div className="bg-[#1A1A1A] p-1 rounded-sm">
              <div className="text-[9px] text-[#737373] whitespace-pre-wrap">
                {details.terms}
              </div>
            </div>
          </div>
        )}

        {/* Totals */}
          <div className="mt-2 flex justify-end">
            <div className="w-full sm:w-48 space-y-0.5">
              <div className="flex justify-between text-[9px] text-[#A3A3A3]">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {invoice.tax_rate > 0 && (
                <div className="flex justify-between text-[9px] text-[#A3A3A3]">
                  <span>Tax ({(invoice.tax_rate * 100).toFixed(0)}%)</span>
                  <span>{formatCurrency(taxAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-[11px] font-bold text-white pt-1 border-t border-[#262626] mt-1">
                <span>Total</span>
                <span className="text-[#34D399]">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="p-2 sm:p-3 bg-[#1A1A1A] border-t border-[#262626]">
            <h3 className="text-[#737373] text-[8px] font-bold uppercase tracking-wider mb-0.5">Notes</h3>
            <p className="text-[#D4D4D4] text-[9px] leading-relaxed">{invoice.notes}</p>
          </div>
        )}

        {/* Signature */}
        {business.signature && (
          <div className="p-2 sm:p-3 border-t border-[#262626] flex justify-end">
            <div className="text-center">
              <img src={business.signature} alt="Signature" className="h-8 object-contain mb-0.5 mx-auto filter invert opacity-80" />
              <div className="w-20 border-t border-[#404040] mx-auto"></div>
              <div className="text-[#A3A3A3] text-[9px] mt-0.5 font-medium">{business.owner_name}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
