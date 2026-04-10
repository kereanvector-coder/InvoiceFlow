import React from 'react';
import { Invoice } from '../../store/invoiceStore';
import { Quotation } from '../../store/quotationStore';
import { getDocumentDetails } from '../../utils/documentUtils';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import LogoDisplay from './LogoDisplay';

export default function WellnessTemplate({ invoice }: { invoice: Invoice | Quotation }) {
  const { business_snapshot: business, items } = invoice;
  const details = getDocumentDetails(invoice);

  return (
    <div className="bg-[#F0FDF9] min-h-screen font-sans text-[#134E4A] pb-6">
      {/* Teal organic header */}
      <div className="bg-[#0D9488] rounded-b-[32px] pt-8 px-6 pb-10">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <LogoDisplay invoice={invoice} size={48} style={{ borderRadius: '50%', border: '2px solid white' }} />
            <div>
              <div className="text-[20px] font-bold text-white mb-1">{business.business_name}</div>
              <div className="text-[11px] text-white/70 uppercase tracking-widest">Wellness Invoice</div>
            </div>
          </div>
          <div className="text-right">
            <div className="bg-white text-[#0D9488] px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-1 inline-block">
              {invoice.status}
            </div>
            <div className="text-[13px] text-white/70 block">{details.documentNumber}</div>
          </div>
        </div>
      </div>

      {/* White amount bubble */}
      <div className="mx-6 -mt-6 bg-white rounded-[20px] shadow-[0_8px_30px_rgba(13,148,136,0.15)] p-5 flex justify-between items-center relative z-10">
        <div>
          <div className="text-[10px] text-[#0D9488] uppercase tracking-wider font-bold mb-1">Session Fee</div>
          <div className="text-[28px] font-bold text-[#134E4A] leading-none">{formatCurrency(invoice.total_amount)}</div>
        </div>
        <div className="text-right">
          <div className="text-[12px] text-gray-500 mb-1">Due: {formatDate(details.dateValue)}</div>
        </div>
      </div>

      {/* Client card */}
      <div className="mx-6 mt-4 bg-white rounded-[16px] p-4">
        <div className="text-[10px] text-[#0D9488] uppercase tracking-wider font-bold mb-2">Client Details</div>
        <div className="flex justify-between items-center">
          <div className="font-bold text-[#134E4A] text-sm">{invoice.client_name}</div>
          <div className="text-gray-500 text-xs">{invoice.client_phone}</div>
        </div>
      </div>

      {/* Sessions card */}
      <div className="mx-6 mt-3 bg-white rounded-[16px] overflow-hidden">
        <div className="bg-[#CCFBF1] py-3 px-4">
          <div className="text-[13px] text-[#134E4A] font-bold">🌿 Sessions Completed</div>
        </div>
        
        <div>
          {items.map((item, i) => (
            <div key={i} className="p-4 border-b border-[#F0FDF9] flex justify-between items-center">
              <div>
                <div className="font-bold text-[#134E4A] text-[14px]">{item.description}</div>
                <div className="text-[12px] text-[#0D9488] mt-0.5">{item.quantity} session(s)</div>
              </div>
              <div className="text-right">
                <div className="text-[11px] text-gray-500 mb-0.5">{formatCurrency(item.unit_price)}/session</div>
                <div className="text-[14px] font-bold text-[#0D9488]">{formatCurrency(item.quantity * item.unit_price)}</div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="bg-[#F0FDF9] py-3.5 px-4 text-right">
          <div className="font-bold text-[#134E4A]">Total: {formatCurrency(invoice.total_amount)}</div>
        </div>
      </div>

      {/* Payment card */}
      <div className="mx-6 mt-3 bg-white rounded-[16px] p-4">
        <div className="text-[13px] font-bold text-[#134E4A] mb-3">💚 How to Pay</div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Bank</span>
            <span className="font-bold text-[#134E4A]">{business.bank_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Account</span>
            <span className="font-bold text-[#134E4A]">{business.account_number}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Name</span>
            <span className="font-bold text-[#134E4A]">{business.account_name}</span>
          </div>
        </div>
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

        {/* Notes */}
      {invoice.notes && (
        <div className="mx-6 mt-3 bg-[#CCFBF1] rounded-[16px] p-3.5 px-4">
          <div className="text-[12px] text-[#134E4A] font-bold mb-1">📋 Notes</div>
          <div className="text-[13px] text-[#134E4A]">{invoice.notes}</div>
        </div>
      )}

      {/* Teal footer card */}
      <div className="mx-6 mt-3 bg-[#0D9488] rounded-[16px] p-5 text-center">
        <div className="text-[14px] font-bold text-white mb-1">Thank you for trusting us with your wellness journey. 🌱</div>
        <div className="text-[13px] text-white/80 italic">We look forward to your next session.</div>
      </div>
    </div>
  );
}