import React from 'react';
import { Invoice } from '../../store/invoiceStore';
import { Quotation } from '../../store/quotationStore';
import { getDocumentDetails } from '../../utils/documentUtils';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import LogoDisplay from './LogoDisplay';

export default function TradesTemplate({ invoice, isReceipt }: { invoice: Invoice | Quotation, isReceipt?: boolean }) {
  const { business_snapshot: business, items } = invoice;
  const details = getDocumentDetails(invoice, isReceipt);

  return (
    <div className="bg-[#1C1917] aspect-[210/297] font-sans text-[#FEF3C7] pb-6">
      {/* Orange ID bar */}
      <div className={`${isReceipt ? 'bg-emerald-600' : 'bg-[#EA580C]'} py-1.5 px-4 flex justify-between items-center`}>
        <div className="text-[11px] text-white font-bold">⚙ JOB INVOICE</div>
        <div className="text-[11px] text-white font-mono">{details.documentNumber}</div>
      </div>

      {/* Dark header */}
      <div className="bg-[#1C1917] pt-4 pb-3 px-4 flex justify-between items-start">
        <div className="flex items-center gap-2">
          <LogoDisplay invoice={invoice} size={40} style={{ borderRadius: '4px' }} />
          <div>
            <div className="text-[16px] font-bold text-[#FEF3C7]">{business.business_name}</div>
            <div className={`text-[11px] ${isReceipt ? 'text-emerald-600' : 'text-[#EA580C]'} mt-0.5`}>Trades & General Services</div>
          </div>
        </div>
        <div className="text-right">
          <div className={`border ${isReceipt ? 'border-emerald-600' : 'border-[#EA580C]'} ${isReceipt ? 'text-emerald-600' : 'text-[#EA580C]'} px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider mb-1 inline-block`}>
            {isReceipt ? "PAID IN FULL" : invoice.status}
          </div>
          <div className="text-[11px] text-[#9CA3AF] block">{formatDate(invoice.created_at)}</div>
        </div>
      </div>

      {/* Job reference bar */}
      <div className="bg-[#292524] border-l-[4px] border-l-[#EA580C] py-2 px-3 mx-4 mb-3">
        <div className={`text-[8px] ${isReceipt ? 'text-emerald-600' : 'text-[#EA580C]'} uppercase tracking-wider font-bold mb-0.5`}>Job Reference</div>
        <div className="text-[12px] text-[#FEF3C7] font-bold">{invoice.notes || 'General Works & Services'}</div>
      </div>

      {/* Amount + client */}
      <div className="bg-[#292524] rounded-lg p-3 mx-4 mb-3">
        <div className={`text-[8px] ${isReceipt ? 'text-emerald-600' : 'text-[#EA580C]'} uppercase tracking-wider font-bold mb-0.5`}>Balance Due</div>
        <div className="text-[28px] font-bold text-[#FEF3C7] leading-none mb-3">{formatCurrency(invoice.total_amount)}</div>
        
        <div className="h-px bg-[#44403C] w-full mb-3"></div>
        
        <div className={`text-[8px] ${isReceipt ? 'text-emerald-600' : 'text-[#EA580C]'} uppercase tracking-wider font-bold mb-0.5`}>Billed To</div>
        <div className="text-[13px] text-[#FEF3C7] font-bold">{invoice.client_name}</div>
        <div className="text-[11px] text-[#9CA3AF] mt-0.5">{invoice.client_phone}</div>
      </div>

      {/* Labour & materials table */}
      <div className="bg-[#292524] rounded-lg overflow-hidden mx-4 mb-3">
        <div className={`${isReceipt ? 'bg-emerald-600' : 'bg-[#EA580C]'} py-2 px-3 grid grid-cols-12 gap-2`}>
          <div className="col-span-6 text-[9px] text-white uppercase font-bold">Description</div>
          <div className="col-span-2 text-[9px] text-white uppercase font-bold text-center">Qty</div>
          <div className="col-span-4 text-[9px] text-white uppercase font-bold text-right">Total</div>
        </div>
        
        <div>
          {items.map((item, i) => (
            <div key={i} className={`p-2.5 grid grid-cols-12 gap-2 border-b border-[#44403C] items-center ${i % 2 === 0 ? 'bg-[#292524]' : 'bg-[#2C2926]'}`}>
              <div className="col-span-6">
                <div className="text-[12px] text-[#FEF3C7]">{item.description}</div>
                <div className={`text-[10px] ${isReceipt ? 'text-emerald-600' : 'text-[#EA580C]'} italic mt-0.5`}>Labour / Materials</div>
              </div>
              <div className="col-span-2 text-center text-[#9CA3AF] text-xs">{item.quantity}</div>
              <div className="col-span-4 text-right text-[#FEF3C7] font-bold text-xs">
                {formatCurrency(item.quantity * item.unit_price)}
              </div>
            </div>
          ))}
        </div>
        
        <div className="bg-[#1C1917] border-t-2 border-t-[#EA580C] p-2.5 text-right">
          <span className={`${isReceipt ? 'text-emerald-600' : 'text-[#EA580C]'} font-bold text-[14px]`}>{formatCurrency(invoice.total_amount)}</span>
        </div>
      </div>

      {/* Payment */}
      <div className="bg-[#292524] rounded-lg p-3 mx-4 mb-3">
        <div className={`${isReceipt ? 'text-emerald-600' : 'text-[#EA580C]'} font-bold text-[11px] mb-2`}>🔧 PAYMENT INSTRUCTIONS</div>
        <div className="space-y-1.5 text-[11px]">
          <div className="flex justify-between">
            <span className="text-[#9CA3AF]">Bank</span>
            <span className="font-bold text-[#FEF3C7]">{business.bank_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#9CA3AF]">Account</span>
            <span className="font-bold text-[#FEF3C7]">{business.account_number}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#9CA3AF]">Name</span>
            <span className="font-bold text-[#FEF3C7]">{business.account_name}</span>
          </div>
        </div>
      </div>

      {/* Terms */}
      <div className="border border-dashed border-[#44403C] p-2.5 mx-4 mb-3">
        <div className="text-[10px] text-[#9CA3AF] italic leading-relaxed whitespace-pre-wrap">
          {details.terms ? details.terms : 'TERMS: Balance due on completion of works. Materials costs are non-refundable.'}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-[#6B7280] italic text-[10px] mt-2">
        Thank you for choosing {business.business_name}
      </div>
    </div>
  );
}