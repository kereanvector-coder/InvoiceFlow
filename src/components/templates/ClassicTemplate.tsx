import React from 'react';
import { Invoice } from '../../store/invoiceStore';
import { Quotation } from '../../store/quotationStore';
import { getDocumentDetails } from '../../utils/documentUtils';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import LogoDisplay from './LogoDisplay';
import { getLogo } from './LogoDisplay';

export default function ClassicTemplate({ invoice, isReceipt }: { invoice: Invoice | Quotation, isReceipt?: boolean }) {
  const { business_snapshot: business, items } = invoice;
  const details = getDocumentDetails(invoice, isReceipt);
  const hasLogo = !!getLogo(invoice);
  const initials = business.business_name ? business.business_name.charAt(0).toUpperCase() : 'B';
  
  return (
    <div className="bg-[#FAF9F6] aspect-[210/297] font-serif text-[#2C3E50]">
      <div className="max-w-4xl mx-auto p-2 md:p-4">
        {/* Header */}
        <div className="flex justify-between items-end border-b-2 border-[#2C3E50] pb-2 mb-2">
          <div>
            <h1 className="text-sm font-bold tracking-tight text-[#1A252F] mb-0.5">{details.documentTypeLabel}</h1>
            <p className="text-[10px] text-[#7F8C8D] tracking-widest uppercase font-mono">No. {details.documentNumber}</p>
          </div>
          <div className="text-right flex flex-col items-end">
            {hasLogo ? (
              <LogoDisplay invoice={invoice} size={32} className="mb-1" style={{ borderRadius: '50%' }} />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#2C3E50] text-white flex items-center justify-center text-xs font-bold mb-1">
                {initials}
              </div>
            )}
            <h2 className="text-xs font-bold text-[#2C3E50] mb-0.5">{business.business_name}</h2>
            <div className="text-[10px] text-[#34495E] leading-relaxed">
              <p>{business.owner_name}</p>
              <p>{business.phone_number}</p>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <h3 className="text-[9px] font-bold text-[#7F8C8D] uppercase tracking-widest mb-1 border-b border-[#BDC3C7] pb-0.5">Billed To</h3>
            <p className="text-xs font-bold text-[#2C3E50] mb-0.5">{invoice.client_name}</p>
            <p className="text-[10px] text-[#34495E]">{invoice.client_phone}</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <h3 className="text-[9px] font-bold text-[#7F8C8D] uppercase tracking-widest mb-1 border-b border-[#BDC3C7] pb-0.5">Date of Issue</h3>
              <p className="text-[10px] font-medium text-[#2C3E50]">{formatDate(invoice.created_at)}</p>
            </div>
            <div>
              <h3 className="text-[9px] font-bold text-[#7F8C8D] uppercase tracking-widest mb-1 border-b border-[#BDC3C7] pb-0.5">{details.dateLabel}</h3>
              <p className="text-[10px] font-medium text-[#2C3E50]">{formatDate(details.dateValue)}</p>
            </div>
          </div>
        </div>

        
        {details.isQuote && details.projectTitle && (
          <div className="bg-[#F9FAFB] border-l-4 border-[#9CA3AF] px-2 py-1 rounded-r-lg mb-2">
            <div className="text-[8px] text-[#6B7280] uppercase tracking-[0.1em] font-bold mb-0.5">PROJECT</div>
            <div className="text-[11px] text-[#111827] font-bold">
              {details.projectTitle}
            </div>
            {details.projectDescription && (
              <div className="text-[9px] text-[#4B5563] italic mt-0.5">
                {details.projectDescription}
              </div>
            )}
          </div>
        )}

        {/* Items Table */}
        <div className="mb-3">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="py-1 border-b-2 border-[#2C3E50] text-[9px] font-bold text-[#7F8C8D] uppercase tracking-widest w-1/2">Description</th>
                <th className="py-1 border-b-2 border-[#2C3E50] text-[9px] font-bold text-[#7F8C8D] uppercase tracking-widest text-center">Qty</th>
                <th className="py-1 border-b-2 border-[#2C3E50] text-[9px] font-bold text-[#7F8C8D] uppercase tracking-widest text-right">Unit Price</th>
                <th className="py-1 border-b-2 border-[#2C3E50] text-[9px] font-bold text-[#7F8C8D] uppercase tracking-widest text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="text-[10px]">
              {items.map((item, index) => (
                <tr key={item.id} className={index !== items.length - 1 ? 'border-b border-[#ECF0F1]' : ''}>
                  <td className="py-1 pr-2">
                    <p className="font-medium text-[#2C3E50]">{item.description}</p>
                  </td>
                  <td className="py-1 text-center text-[#34495E]">{item.quantity}</td>
                  <td className="py-1 text-right text-[#34495E]">{formatCurrency(item.unit_price)}</td>
                  <td className="py-1 text-right font-bold text-[#2C3E50]">{formatCurrency(item.quantity * item.unit_price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary & Payment Info */}
        <div className="grid grid-cols-2 gap-4 mb-3">
          {/* Payment Info */}
          <div>
            {!isReceipt && <>
            <h3 className="text-[9px] font-bold text-[#7F8C8D] uppercase tracking-widest mb-1 border-b border-[#BDC3C7] pb-0.5">Payment Information</h3>
            <div className="bg-[#ECF0F1] p-1.5 rounded-sm text-[10px] text-[#34495E] leading-relaxed">
              <p><span className="font-bold text-[#2C3E50]">Bank:</span> {business.bank_name}</p>
              <p><span className="font-bold text-[#2C3E50]">Account Name:</span> {business.account_name}</p>
              <p><span className="font-bold text-[#2C3E50]">Account No:</span> <span className="font-mono">{business.account_number}</span></p>
            </div>
            </>}
            
            {details.terms && (
              <div className="mt-2">
                <div className="text-[8px] text-[#6B7280] uppercase tracking-[0.1em] font-bold mb-0.5">TERMS & CONDITIONS</div>
                <div className="bg-[#F9FAFB] p-1 rounded-md">
                  <div className="text-[9px] text-[#4B5563] whitespace-pre-wrap">
                    {details.terms}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Totals */}
          <div>
            <div className="border-t border-[#BDC3C7] pt-1.5 space-y-0.5 text-[10px]">
              <div className="flex justify-between text-[#34495E]">
                <span>Subtotal</span>
                <span>{formatCurrency(invoice.subtotal)}</span>
              </div>
              {invoice.tax_amount > 0 && (
                <div className="flex justify-between text-[#34495E]">
                  <span>Tax ({invoice.tax_rate * 100}%)</span>
                  <span>{formatCurrency(invoice.tax_amount)}</span>
                </div>
              )}
              <div className="flex justify-between items-center border-t-2 border-[#2C3E50] pt-1.5 mt-1.5">
                <span className="text-xs font-bold text-[#2C3E50] uppercase tracking-widest">{details.amountLabel}</span>
                <span className="text-xs font-bold text-[#2C3E50]">{formatCurrency(invoice.total_amount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="mb-3">
            <h3 className="text-[9px] font-bold text-[#7F8C8D] uppercase tracking-widest mb-1 border-b border-[#BDC3C7] pb-0.5">Notes</h3>
            <p className="text-[10px] text-[#34495E] italic whitespace-pre-wrap leading-relaxed">{invoice.notes}</p>
          </div>
        )}

        {/* Signature */}
        {business.signature && (
          <div className="mb-3 flex justify-end">
            <div className="text-center">
              <img src={business.signature} alt="Signature" className="h-8 object-contain mb-0.5 mx-auto" />
              <div className="w-24 border-t border-[#2C3E50] mx-auto"></div>
              <div className="text-[10px] text-[#2C3E50] mt-0.5 font-bold">{business.owner_name}</div>
              <div className="text-[8px] text-[#7F8C8D] uppercase tracking-widest mt-0.5">Authorized Signature</div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center pt-2 border-t border-[#BDC3C7] text-[9px] text-[#7F8C8D]">
          <p>Thank you for your business.</p>
        </div>
      </div>
    </div>
  );
}
