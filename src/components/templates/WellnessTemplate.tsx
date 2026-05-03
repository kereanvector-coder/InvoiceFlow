import React from 'react';
import { Invoice } from '../../store/invoiceStore';
import { Quotation } from '../../store/quotationStore';
import { getDocumentDetails } from '../../utils/documentUtils';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import LogoDisplay from './LogoDisplay';

export default function WellnessTemplate({ invoice, isReceipt }: { invoice: Invoice | Quotation, isReceipt?: boolean }) {
  const { business_snapshot: business, items } = invoice;
  const details = getDocumentDetails(invoice, isReceipt);

  return (
    <div className="bg-[#F0FDF9] aspect-[210/297] font-sans text-[#134E4A] pb-6">
      {/* Teal organic header */}
      <div className="bg-[#0D9488] rounded-b-[24px] pt-4 px-4 pb-6">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <LogoDisplay invoice={invoice} size={40} style={{ borderRadius: '50%', border: '2px solid white' }} />
            <div>
              <div className="text-[16px] font-bold text-white mb-0.5">{business.business_name}</div>
              <div className="text-[10px] text-[#FFFFFFB3] uppercase tracking-widest">Wellness Invoice</div>
            </div>
          </div>
          <div className="text-right">
            <div className="bg-white text-[#0D9488] px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider mb-1 inline-block">
              {isReceipt ? "PAID IN FULL" : invoice.status}
            </div>
            <div className="text-[11px] text-[#FFFFFFB3] block">{details.documentNumber}</div>
          </div>
        </div>
      </div>

      {/* White amount bubble */}
      <div className="mx-4 -mt-3 bg-white rounded-[16px] shadow-[0_4px_20px_rgba(13,148,136,0.15)] p-3 flex justify-between items-center relative z-10">
        <div>
          <div className="text-[9px] text-[#0D9488] uppercase tracking-wider font-bold mb-0.5">Session Fee</div>
          <div className="text-[24px] font-bold text-[#134E4A] leading-none">{formatCurrency(invoice.total_amount)}</div>
        </div>
        <div className="text-right">
          <div className="text-[11px] text-[#6B7280] mb-0.5">Due: {formatDate(details.dateValue)}</div>
        </div>
      </div>

      {/* Client card */}
      <div className="mx-4 mt-3 bg-white rounded-[12px] p-3">
        <div className="text-[9px] text-[#0D9488] uppercase tracking-wider font-bold mb-1">Client Details</div>
        <div className="flex justify-between items-center">
          <div className="font-bold text-[#134E4A] text-[13px]">{invoice.client_name}</div>
          <div className="text-[#6B7280] text-[11px]">{invoice.client_phone}</div>
        </div>
      </div>

      {/* Sessions card */}
      <div className="mx-4 mt-2 bg-white rounded-[12px] overflow-hidden">
        <div className="bg-[#CCFBF1] py-2 px-3">
          <div className="text-[11px] text-[#134E4A] font-bold">🌿 Sessions Completed</div>
        </div>
        
        <div>
          {items.map((item, i) => (
            <div key={i} className="p-3 border-b border-[#F0FDF9] flex justify-between items-center">
              <div>
                <div className="font-bold text-[#134E4A] text-[13px]">{item.description}</div>
                <div className="text-[11px] text-[#0D9488] mt-0.5">{item.quantity} session(s)</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-[#6B7280] mb-0.5">{formatCurrency(item.unit_price)}/session</div>
                <div className="text-[13px] font-bold text-[#0D9488]">{formatCurrency(item.quantity * item.unit_price)}</div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="bg-[#F0FDF9] py-2 px-3 text-right">
          <div className="font-bold text-[#134E4A] text-[14px]">Total: {formatCurrency(invoice.total_amount)}</div>
        </div>
      </div>

      {/* Payment card */}
      <div className="mx-4 mt-2 bg-white rounded-[12px] p-3">
        <div className="text-[11px] font-bold text-[#134E4A] mb-2">💚 How to Pay</div>
        <div className="space-y-1.5 text-[11px]">
          <div className="flex justify-between">
            <span className="text-[#6B7280]">Bank</span>
            <span className="font-bold text-[#134E4A]">{business.bank_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#6B7280]">Account</span>
            <span className="font-bold text-[#134E4A]">{business.account_number}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#6B7280]">Name</span>
            <span className="font-bold text-[#134E4A]">{business.account_name}</span>
          </div>
        </div>
      </div>

      
        {details.terms && (
          <div className="mx-4 mt-2 mb-2">
            <div className="text-[10px] text-[#6B7280] uppercase tracking-[0.1em] font-bold mb-1">TERMS & CONDITIONS</div>
            <div className="bg-[#F9FAFB] p-2 rounded-md">
              <div className="text-[11px] text-[#4B5563] whitespace-pre-wrap">
                {details.terms}
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
      {invoice.notes && (
        <div className="mx-4 mt-2 bg-[#CCFBF1] rounded-[12px] p-2.5 px-3">
          <div className="text-[11px] text-[#134E4A] font-bold mb-1">📋 Notes</div>
          <div className="text-[11px] text-[#134E4A]">{invoice.notes}</div>
        </div>
      )}

      {/* Teal footer card */}
      <div className="mx-4 mt-2 bg-[#0D9488] rounded-[12px] p-2.5 text-center">
        <div className="text-[12px] font-bold text-white mb-0.5">Thank you for trusting us with your wellness journey. 🌱</div>
        <div className="text-[11px] text-[#FFFFFFCC] italic">We look forward to your next session.</div>
      </div>
    </div>
  );
}