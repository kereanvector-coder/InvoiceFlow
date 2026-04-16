import React from 'react';
import { Invoice } from '../../store/invoiceStore';
import { Quotation } from '../../store/quotationStore';
import { getDocumentDetails } from '../../utils/documentUtils';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import LogoDisplay from './LogoDisplay';
import { getLogo } from './LogoDisplay';

export default function EducationTemplate({ invoice }: { invoice: Invoice | Quotation }) {
  const { business_snapshot: business, items } = invoice;
  const details = getDocumentDetails(invoice);
  const hasLogo = !!getLogo(invoice);

  return (
    <div className="bg-[#EFF6FF] aspect-[210/297] font-sans text-[#1E3A8A] pb-6">
      {/* Official header */}
      <div className="bg-white border-b-[3px] border-b-[#1D4ED8] p-1.5 flex justify-between items-center">
        <div className="flex items-center gap-1.5">
          {hasLogo ? (
            <LogoDisplay invoice={invoice} size={32} style={{ borderRadius: '50%', border: '2px solid #DBEAFE' }} />
          ) : (
            <div className="w-[32px] h-[32px] bg-[#1D4ED8] border-[2px] border-[#DBEAFE] rounded-full flex items-center justify-center shrink-0">
              <div className="text-white text-[6px] text-center font-bold leading-tight uppercase">Official<br/>{details.documentTypeLabel}</div>
            </div>
          )}
          <div>
            <div className="text-[12px] font-bold text-[#1D4ED8]">{business.business_name}</div>
            <div className="text-[9px] text-[#1D4ED8] mt-0.5">Educational Services</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[8px] text-[#6B7280] uppercase tracking-wider mb-0.5">Tuition Invoice</div>
          <div className="text-[12px] font-bold text-[#1E3A8A] font-mono leading-none mb-1">#{details.documentNumber}</div>
          <div className="text-[9px] text-[#6B7280] mb-1">{formatDate(invoice.created_at)}</div>
          <div className="bg-[#DBEAFE] text-[#1D4ED8] px-1.5 py-0.5 rounded-full text-[7px] font-bold uppercase tracking-wider inline-block">
            {invoice.status}
          </div>
        </div>
      </div>

      {/* Student section */}
      <div className="bg-[#EFF6FF] py-1 px-2 flex justify-between items-start">
        <div>
          <div className="text-[7px] text-[#1D4ED8] uppercase tracking-wider font-bold mb-0.5">Student / Client</div>
          <div className="text-[11px] font-bold text-[#1E3A8A]">{invoice.client_name}</div>
          <div className="text-[9px] text-[#6B7280] mt-0.5">{invoice.client_phone}</div>
        </div>
        <div className="text-right">
          <div className="text-[7px] text-[#1D4ED8] uppercase tracking-wider font-bold mb-0.5">Training Period</div>
          <div className="text-[9px] text-[#1E3A8A] font-bold">{formatDate(invoice.created_at)} — {formatDate(details.dateValue)}</div>
        </div>
      </div>

      {/* Tuition card */}
      <div className="mx-2 mt-1 bg-[#1D4ED8] rounded-md p-2 flex justify-between items-center">
        <div>
          <div className="text-[8px] text-[#FFFFFFB3] uppercase tracking-wider font-bold mb-0.5">Tuition Fee</div>
          <div className="text-[20px] font-bold text-white leading-none">{formatCurrency(invoice.total_amount)}</div>
        </div>
        <div className="text-right">
          <div className="text-[9px] text-[#FFFFFFB3] mb-0.5">Due: {formatDate(details.dateValue)}</div>
        </div>
      </div>

      {/* Courses card */}
      <div className="mx-2 mt-1 bg-white rounded-md border border-[#BFDBFE] overflow-hidden">
        <div className="bg-[#DBEAFE] py-1 px-2">
          <div className="text-[8px] text-[#1E3A8A] font-bold uppercase tracking-wider mb-0.5">📚 Courses & Sessions</div>
          <div className="text-[7px] text-[#1D4ED8] uppercase tracking-wider grid grid-cols-12 gap-1 mt-0.5">
            <div className="col-span-6">Subject</div>
            <div className="col-span-2 text-center">Sessions</div>
            <div className="col-span-4 text-right">Fee</div>
          </div>
        </div>
        
        <div>
          {items.map((item, i) => (
            <div key={i} className="p-1 px-2 border-b border-[#EFF6FF] grid grid-cols-12 gap-1 items-center">
              <div className="col-span-6">
                <div className="text-[10px] font-bold text-[#1E3A8A]">{item.description}</div>
                <div className="text-[8px] text-[#1D4ED8] mt-0.5">{item.quantity} session(s)</div>
              </div>
              <div className="col-span-2 text-center text-[#6B7280] text-[9px]">{item.quantity}</div>
              <div className="col-span-4 text-right font-bold text-[#1E3A8A] text-[10px]">
                {formatCurrency(item.quantity * item.unit_price)}
              </div>
            </div>
          ))}
        </div>
        
        <div className="bg-[#EFF6FF] py-1 px-2 text-right">
          <div className="font-bold text-[#1E3A8A] text-[11px]">Total Tuition: {formatCurrency(invoice.total_amount)}</div>
        </div>
      </div>

      
        {details.isQuote && details.terms && (
          <div className="mx-2 mt-1 mb-1">
            <div className="text-[8px] text-[#6B7280] uppercase tracking-[0.1em] font-bold mb-0.5">TERMS & CONDITIONS</div>
            <div className="bg-[#F9FAFB] p-1 rounded-sm">
              <div className="text-[9px] text-[#4B5563] whitespace-pre-wrap">
                {details.terms}
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
      {invoice.notes && (
        <div className="mx-2 mt-1 bg-white rounded-md border border-[#BFDBFE] p-1.5">
          <div className="text-[9px] font-bold text-[#1E3A8A] mb-0.5">📋 Learning Notes & Objectives</div>
          <div className="text-[9px] text-[#4B5563] leading-[1.3]">{invoice.notes}</div>
        </div>
      )}

      {/* Payment */}
      <div className="mx-2 mt-1 bg-white rounded-md border border-[#BFDBFE] p-1.5">
        <div className="text-[9px] font-bold text-[#1E3A8A] mb-1">🏦 Payment Instructions</div>
        <div className="space-y-0.5 text-[9px]">
          <div className="flex justify-between">
            <span className="text-[#6B7280]">Bank</span>
            <span className="font-bold text-[#1E3A8A]">{business.bank_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#6B7280]">Account</span>
            <span className="font-bold text-[#1E3A8A]">{business.account_number}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#6B7280]">Name</span>
            <span className="font-bold text-[#1E3A8A]">{business.account_name}</span>
          </div>
        </div>
      </div>

      {/* Certificate note */}
      {invoice.status === 'paid' && (
        <div className="mx-2 mt-1 bg-[#DCFCE7] rounded-md p-1.5 px-2">
          <div className="text-[9px] text-[#166534] font-bold">🎓 Payment confirmed. Certificate of completion available on request.</div>
        </div>
      )}

      {/* Blue footer card */}
      <div className="mx-2 mt-1 mb-1 bg-[#1D4ED8] rounded-md p-1.5 text-center">
        <div className="text-[9px] font-bold text-white leading-relaxed">
          Knowledge is the greatest investment you can make. Thank you for choosing {business.business_name}. 📖
        </div>
      </div>
    </div>
  );
}