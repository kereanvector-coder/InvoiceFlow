import React from 'react';
import { Invoice } from '../../store/invoiceStore';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';

export default function EducationTemplate({ invoice }: { invoice: Invoice }) {
  const { business_snapshot: business, items } = invoice;

  return (
    <div className="bg-[#EFF6FF] min-h-screen font-sans text-[#1E3A8A] pb-6">
      {/* Official header */}
      <div className="bg-white border-b-[3px] border-b-[#1D4ED8] p-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-[64px] h-[64px] bg-[#1D4ED8] border-[3px] border-[#DBEAFE] rounded-full flex items-center justify-center shrink-0">
            <div className="text-white text-[10px] text-center font-bold leading-tight uppercase">Official<br/>Invoice</div>
          </div>
          <div>
            <div className="text-[18px] font-bold text-[#1D4ED8]">{business.business_name}</div>
            <div className="text-[12px] text-[#1D4ED8] mt-0.5">Educational Services</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[12px] text-gray-500 uppercase tracking-wider mb-1">Tuition Invoice</div>
          <div className="text-[20px] font-bold text-[#1E3A8A] font-mono leading-none mb-1">#{invoice.invoice_number}</div>
          <div className="text-[13px] text-gray-500 mb-2">{formatDate(invoice.created_at)}</div>
          <div className="bg-[#DBEAFE] text-[#1D4ED8] px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider inline-block">
            {invoice.status}
          </div>
        </div>
      </div>

      {/* Student section */}
      <div className="bg-[#EFF6FF] py-4 px-6 flex justify-between items-start">
        <div>
          <div className="text-[9px] text-[#1D4ED8] uppercase tracking-wider font-bold mb-1">Student / Client</div>
          <div className="text-[16px] font-bold text-[#1E3A8A]">{invoice.client_name}</div>
          <div className="text-[13px] text-gray-500 mt-0.5">{invoice.client_phone}</div>
        </div>
        <div className="text-right">
          <div className="text-[9px] text-[#1D4ED8] uppercase tracking-wider font-bold mb-1">Training Period</div>
          <div className="text-[13px] text-[#1E3A8A] font-bold">{formatDate(invoice.created_at)} — {formatDate(invoice.due_date)}</div>
        </div>
      </div>

      {/* Tuition card */}
      <div className="mx-6 mt-4 bg-[#1D4ED8] rounded-xl p-5 flex justify-between items-center">
        <div>
          <div className="text-[10px] text-white/70 uppercase tracking-wider font-bold mb-1">Tuition Fee</div>
          <div className="text-[32px] font-bold text-white leading-none">{formatCurrency(invoice.total_amount)}</div>
        </div>
        <div className="text-right">
          <div className="text-[12px] text-white/70 mb-1">Due: {formatDate(invoice.due_date)}</div>
        </div>
      </div>

      {/* Courses card */}
      <div className="mx-6 mt-6 bg-white rounded-xl border border-[#BFDBFE] overflow-hidden">
        <div className="bg-[#DBEAFE] py-3 px-4">
          <div className="text-[11px] text-[#1E3A8A] font-bold uppercase tracking-wider mb-1">📚 Courses & Sessions</div>
          <div className="text-[10px] text-[#1D4ED8] uppercase tracking-wider grid grid-cols-12 gap-2 mt-2">
            <div className="col-span-6">Subject</div>
            <div className="col-span-2 text-center">Sessions</div>
            <div className="col-span-4 text-right">Fee</div>
          </div>
        </div>
        
        <div>
          {items.map((item, i) => (
            <div key={i} className="p-3.5 px-4 border-b border-[#EFF6FF] grid grid-cols-12 gap-2 items-center">
              <div className="col-span-6">
                <div className="text-[14px] font-bold text-[#1E3A8A]">{item.description}</div>
                <div className="text-[12px] text-[#1D4ED8] mt-0.5">{item.quantity} session(s)</div>
              </div>
              <div className="col-span-2 text-center text-gray-500 text-sm">{item.quantity}</div>
              <div className="col-span-4 text-right font-bold text-[#1E3A8A] text-sm">
                {formatCurrency(item.quantity * item.unit_price)}
              </div>
            </div>
          ))}
        </div>
        
        <div className="bg-[#EFF6FF] py-3.5 px-4 text-right">
          <div className="font-bold text-[#1E3A8A] text-[17px]">Total Tuition: {formatCurrency(invoice.total_amount)}</div>
        </div>
      </div>

      {/* Notes */}
      {invoice.notes && (
        <div className="mx-6 mt-3 bg-white rounded-xl border border-[#BFDBFE] p-4">
          <div className="text-[13px] font-bold text-[#1E3A8A] mb-1">📋 Learning Notes & Objectives</div>
          <div className="text-[13px] text-gray-600 leading-[1.7]">{invoice.notes}</div>
        </div>
      )}

      {/* Payment */}
      <div className="mx-6 mt-3 bg-white rounded-xl border border-[#BFDBFE] p-4">
        <div className="text-[13px] font-bold text-[#1E3A8A] mb-3">🏦 Payment Instructions</div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Bank</span>
            <span className="font-bold text-[#1E3A8A]">{business.bank_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Account</span>
            <span className="font-bold text-[#1E3A8A]">{business.account_number}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Name</span>
            <span className="font-bold text-[#1E3A8A]">{business.account_name}</span>
          </div>
        </div>
      </div>

      {/* Certificate note */}
      {invoice.status === 'paid' && (
        <div className="mx-6 mt-3 bg-[#DCFCE7] rounded-xl p-3.5 px-4">
          <div className="text-[13px] text-[#166534] font-bold">🎓 Payment confirmed. Certificate of completion available on request.</div>
        </div>
      )}

      {/* Blue footer card */}
      <div className="mx-6 mt-3 mb-6 bg-[#1D4ED8] rounded-xl p-5 text-center">
        <div className="text-[14px] font-bold text-white leading-relaxed">
          Knowledge is the greatest investment you can make. Thank you for choosing {business.business_name}. 📖
        </div>
      </div>
    </div>
  );
}