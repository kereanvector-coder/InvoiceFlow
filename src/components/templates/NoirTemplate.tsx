import React from 'react';
import { Invoice } from '../../store/invoiceStore';
import { Quotation } from '../../store/quotationStore';
import { getDocumentDetails } from '../../utils/documentUtils';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import LogoDisplay from './LogoDisplay';

export default function NoirTemplate({ invoice, isReceipt }: { invoice: Invoice | Quotation, isReceipt?: boolean }) {
  const { business_snapshot: business, items } = invoice;
  const details = getDocumentDetails(invoice, isReceipt);

  return (
    <div className={`bg-[#0A0A0A] aspect-[210/297] font-sans ${isReceipt ? 'text-emerald-600' : 'text-[#F5F5F5]'} border-t-[2px] border-t-[#C4977A] border-b-[2px] border-b-[#C4977A] flex flex-col`}>
      {/* Header */}
      <div className="bg-[#0A0A0A] pt-6 pb-4 px-4 flex justify-between items-start">
        <div className="flex flex-col items-start">
          <div className={`text-[24px] font-[100] tracking-[6px] ${isReceipt ? 'text-emerald-600' : 'text-[#F5F5F5]'} italic leading-none mb-2`}>STATEMENT</div>
          <LogoDisplay invoice={invoice} size={48} className="mb-2" style={{ filter: 'invert(1)', borderRadius: 0, border: '1px solid rgba(255,255,255,0.2)' }} />
          <div className="text-[10px] text-[#C4977A] uppercase tracking-[0.2em] mt-1">{business.business_name}</div>
        </div>
        <div className="text-right pt-1">
          <div className="text-[10px] text-[#888888] font-mono mb-0.5">{details.documentNumber}</div>
          <div className="text-[10px] text-[#888888]">{formatDate(invoice.created_at)}</div>
        </div>
      </div>

      <div className="h-px w-full bg-[#C4977A]"></div>

      {/* Two-column section and Amount */}
      <div className="py-3 px-4 flex justify-between items-stretch gap-3">
        <div className="w-1/2 flex flex-col justify-between">
          <div>
            <div className="text-[8px] text-[#C4977A] uppercase tracking-widest mb-0.5">Billed To</div>
            <div className={`text-[14px] font-[300] ${isReceipt ? 'text-emerald-600' : 'text-[#F5F0E8]'} tracking-[0.5px]`}>{invoice.client_name}</div>
            <div className="text-[11px] text-[#888888] mt-0.5">{invoice.client_phone}</div>
          </div>
          <div className="mt-1.5 text-[11px] text-[#888888]">
            Due {formatDate(details.dateValue)}
          </div>
        </div>
        <div className="w-1/2 text-right flex flex-col justify-between">
          <div>
            <div className="text-[8px] text-[#C4977A] uppercase tracking-widest mb-0.5">Status</div>
            <div className={`text-[12px] ${isReceipt ? 'text-emerald-600' : 'text-[#F5F0E8]'} capitalize`}>{isReceipt ? "PAID IN FULL" : invoice.status}</div>
          </div>
          <div className="mt-1.5">
            <div className="text-[8px] text-[#888888] uppercase tracking-widest mb-0.5">Total Remittance</div>
            <div className={`text-[24px] font-bold ${isReceipt ? 'text-emerald-600' : 'text-[#F5F0E8]'} tracking-[-0.5px] leading-none`}>{formatCurrency(invoice.total_amount)}</div>
          </div>
        </div>
      </div>

      <div className="h-px w-full bg-[#C4977A]"></div>

      
        {details.isQuote && details.projectTitle && (
          <div className="mx-4 mt-2 bg-[#1A1A1A] border-l-4 border-[#C4977A] px-3 py-1.5 rounded-r-lg mb-1.5">
            <div className="text-[9px] text-[#C4977A] uppercase tracking-[0.1em] font-bold mb-0.5">PROJECT</div>
            <div className={`text-[12px] ${isReceipt ? 'text-emerald-600' : 'text-[#F5F0E8]'} font-bold`}>
              {details.projectTitle}
            </div>
            {details.projectDescription && (
              <div className="text-[10px] text-[#888888] italic mt-0.5">
                {details.projectDescription}
              </div>
            )}
          </div>
        )}

        {/* Items */}
      <div className="p-3 px-4 flex-1">
        <div className="text-[8px] text-[#C4977A] uppercase tracking-widest mb-0.5">Items</div>
        <div className="w-[20px] h-[1px] bg-[#C4977A] mb-1.5"></div>
        
        <div className="mb-2">
          {items.map((item, i) => (
            <div key={i} className="py-1.5 border-b border-[#1A1A1A] flex justify-between items-center">
              <div>
                <div className={`text-[12px] font-[300] ${isReceipt ? 'text-emerald-600' : 'text-[#F5F0E8]'} tracking-[0.5px]`}>{item.description}</div>
                <div className="text-[9px] text-[#C4977A] italic mt-0.5">Bespoke Service</div>
              </div>
              <div className="text-right">
                <div className={`text-[12px] ${isReceipt ? 'text-emerald-600' : 'text-[#F5F0E8]'} font-bold`}>{formatCurrency(item.quantity * item.unit_price)}</div>
                <div className="text-[9px] text-[#888888] mt-0.5">{item.quantity} × {formatCurrency(item.unit_price)}</div>
              </div>
            </div>
          ))}
        </div>
        
        
        {details.terms && (
          <div className="mb-2">
            <div className="text-[9px] text-[#C4977A] uppercase tracking-[0.1em] font-bold mb-0.5">TERMS & CONDITIONS</div>
            <div className="bg-[#1A1A1A] p-1.5 rounded-md">
              <div className="text-[10px] text-[#888888] whitespace-pre-wrap">
                {details.terms}
              </div>
            </div>
          </div>
        )}

        {/* Remittance and Totals */}
        <div className="mt-2 pt-2 border-t border-[#1A1A1A] flex justify-between items-start">
          {/* Remittance details */}
          <div className="w-1/2 pr-3">
            {!isReceipt && <>
            <div className="text-[8px] text-[#C4977A] uppercase tracking-widest mb-1.5">Remittance Details</div>
            <div className="flex flex-col space-y-1 text-[10px]">
              <div className="flex justify-between">
                <span className="text-[#888888]">Bank</span>
                <span className={`${isReceipt ? 'text-emerald-600' : 'text-[#F5F0E8]'}`}>{business.bank_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#888888]">Account</span>
                <span className={`${isReceipt ? 'text-emerald-600' : 'text-[#F5F0E8]'}`}>{business.account_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#888888]">Name</span>
                <span className={`${isReceipt ? 'text-emerald-600' : 'text-[#F5F0E8]'}`}>{business.account_name}</span>
              </div>
            </div>
            </>}
          </div>

          {/* Totals */}
          <div className="w-1/2 pl-3 flex flex-col items-end space-y-1">
            <div className="flex justify-between w-full max-w-[160px]">
              <span className="text-[#888888] text-[10px]">Subtotal</span>
              <span className={`${isReceipt ? 'text-emerald-600' : 'text-[#F5F0E8]'} text-[10px]`}>{formatCurrency(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between w-full max-w-[160px]">
              <span className="text-[#888888] text-[10px]">Tax</span>
              <span className={`${isReceipt ? 'text-emerald-600' : 'text-[#F5F0E8]'} text-[10px]`}>{formatCurrency(invoice.tax_amount)}</span>
            </div>
            <div className="flex justify-between w-full max-w-[160px] pt-1 border-t border-[#1A1A1A]">
              <span className="text-[#C4977A] font-bold text-[10px]">Total</span>
              <span className={`${isReceipt ? 'text-emerald-600' : 'text-[#F5F0E8]'} font-bold text-[13px]`}>{formatCurrency(invoice.total_amount)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="mt-2 border border-[#222222] p-2 text-[#888888] italic text-[10px]">
            {invoice.notes}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-2 px-4 text-center mt-auto">
        <div className="text-[#C4977A] text-[10px] uppercase tracking-widest mb-0.5">{business.business_name}</div>
        <div className="text-[#333333] text-[8px]">InvoiceFlow</div>
      </div>
    </div>
  );
}