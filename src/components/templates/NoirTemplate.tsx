import React from 'react';
import { Invoice } from '../../store/invoiceStore';
import { Quotation } from '../../store/quotationStore';
import { getDocumentDetails } from '../../utils/documentUtils';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import LogoDisplay from './LogoDisplay';

export default function NoirTemplate({ invoice }: { invoice: Invoice | Quotation }) {
  const { business_snapshot: business, items } = invoice;
  const details = getDocumentDetails(invoice);

  return (
    <div className="bg-[#0A0A0A] min-h-screen font-sans text-[#F5F5F5] border-t-[2px] border-t-[#C4977A] border-b-[2px] border-b-[#C4977A] flex flex-col">
      {/* Header */}
      <div className="bg-[#0A0A0A] pt-10 pb-8 px-7 flex justify-between items-start">
        <div className="flex flex-col items-start">
          <div className="text-[48px] font-[100] tracking-[8px] text-[#F5F5F5] italic leading-none mb-4">STATEMENT</div>
          <LogoDisplay invoice={invoice} size={64} className="mb-3" style={{ filter: 'invert(1)', borderRadius: 0, border: '1px solid rgba(255,255,255,0.2)' }} />
          <div className="text-[12px] text-[#C4977A] uppercase tracking-[0.3em] mt-2">{business.business_name}</div>
        </div>
        <div className="text-right pt-2">
          <div className="text-[11px] text-[#888888] font-mono mb-1">{details.documentNumber}</div>
          <div className="text-[11px] text-[#888888]">{formatDate(invoice.created_at)}</div>
        </div>
      </div>

      <div className="h-px w-full bg-[#C4977A]"></div>

      {/* Two-column section */}
      <div className="py-8 px-7 flex justify-between">
        <div>
          <div className="text-[9px] text-[#C4977A] uppercase tracking-widest mb-2">Billed To</div>
          <div className="text-[22px] font-[300] text-[#F5F0E8] tracking-[1px]">{invoice.client_name}</div>
          <div className="text-[13px] text-[#888888] mt-1">{invoice.client_phone}</div>
        </div>
        <div className="text-right">
          <div className="text-[9px] text-[#C4977A] uppercase tracking-widest mb-2">Status</div>
          <div className="text-[15px] text-[#F5F0E8] capitalize">{invoice.status}</div>
        </div>
      </div>

      {/* Amount */}
      <div className="px-7 pb-8">
        <div className="text-[9px] text-[#888888] uppercase tracking-widest mb-2">Total Remittance</div>
        <div className="text-[52px] font-bold text-[#F5F0E8] tracking-[-2px] leading-none">{formatCurrency(invoice.total_amount)}</div>
        <div className="text-[13px] text-[#888888] mt-2">Due {formatDate(details.dateValue)}</div>
      </div>

      <div className="h-px w-full bg-[#C4977A]"></div>

      
        {details.isQuote && details.projectTitle && (
          <div className="bg-gray-50 border-l-4 border-gray-400 px-4 py-3 rounded-r-lg mb-6">
            <div className="text-[10px] text-gray-500 uppercase tracking-[0.1em] font-bold mb-1">PROJECT</div>
            <div className="text-[15px] text-gray-900 font-bold">
              {details.projectTitle}
            </div>
            {details.projectDescription && (
              <div className="text-[13px] text-gray-600 italic mt-1">
                {details.projectDescription}
              </div>
            )}
          </div>
        )}

        {/* Items */}
      <div className="p-7 flex-1">
        <div className="text-[9px] text-[#C4977A] uppercase tracking-widest mb-1">Items</div>
        <div className="w-[24px] h-[1px] bg-[#C4977A] mb-4"></div>
        
        <div className="mb-6">
          {items.map((item, i) => (
            <div key={i} className="py-5 border-b border-[#1A1A1A] flex justify-between items-center">
              <div>
                <div className="text-[16px] font-[300] text-[#F5F0E8] tracking-[0.5px]">{item.description}</div>
                <div className="text-[10px] text-[#C4977A] italic mt-1">Bespoke Service</div>
              </div>
              <div className="text-right">
                <div className="text-[16px] text-[#F5F0E8] font-bold">{formatCurrency(item.quantity * item.unit_price)}</div>
                <div className="text-[11px] text-[#888888] mt-1">{item.quantity} × {formatCurrency(item.unit_price)}</div>
              </div>
            </div>
          ))}
        </div>
        
        
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
        <div className="flex flex-col items-end space-y-2 mb-8">
          <div className="flex justify-between w-48">
            <span className="text-[#888888] text-sm">Subtotal</span>
            <span className="text-[#F5F0E8] text-sm">{formatCurrency(invoice.subtotal)}</span>
          </div>
          <div className="flex justify-between w-48">
            <span className="text-[#888888] text-sm">Tax</span>
            <span className="text-[#F5F0E8] text-sm">{formatCurrency(invoice.tax_amount)}</span>
          </div>
          <div className="flex justify-between w-48 pt-2 border-t border-[#1A1A1A]">
            <span className="text-[#C4977A] font-bold text-sm">Total</span>
            <span className="text-[#F5F0E8] font-bold text-[18px]">{formatCurrency(invoice.total_amount)}</span>
          </div>
        </div>

        {/* Remittance details */}
        <div className="mt-8 pt-6 border-t border-[#1A1A1A]">
          <div className="text-[9px] text-[#C4977A] uppercase tracking-widest mb-4">Remittance Details</div>
          <div className="flex flex-col items-end space-y-2 text-sm">
            <div className="flex justify-between w-full max-w-xs">
              <span className="text-[#888888]">Bank</span>
              <span className="text-[#F5F0E8]">{business.bank_name}</span>
            </div>
            <div className="flex justify-between w-full max-w-xs">
              <span className="text-[#888888]">Account</span>
              <span className="text-[#F5F0E8]">{business.account_number}</span>
            </div>
            <div className="flex justify-between w-full max-w-xs">
              <span className="text-[#888888]">Name</span>
              <span className="text-[#F5F0E8]">{business.account_name}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="mt-6 border border-[#222222] p-4 text-[#888888] italic text-sm">
            {invoice.notes}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-5 px-7 text-center mt-auto">
        <div className="text-[#C4977A] text-[12px] uppercase tracking-widest mb-1">{business.business_name}</div>
        <div className="text-[#333333] text-[10px]">InvoiceFlow</div>
      </div>
    </div>
  );
}