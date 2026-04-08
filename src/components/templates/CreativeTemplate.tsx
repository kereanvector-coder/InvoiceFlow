import React from 'react';
import { Invoice } from '../../store/invoiceStore';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';

export default function CreativeTemplate({ invoice }: { invoice: Invoice }) {
  const { business_snapshot: business, items } = invoice;

  return (
    <div className="bg-[#FAF5FF] min-h-screen font-sans text-[#1E1B4B]">
      {/* Purple gradient hero band */}
      <div className="bg-gradient-to-br from-[#7C3AED] to-[#4F46E5] p-8 pb-10">
        <div className="flex justify-between items-start">
          <div className="text-[11px] text-white/70 uppercase tracking-widest font-bold">Creative Invoice</div>
          <div className="bg-[#F59E0B] text-[#1E1B4B] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            {invoice.status}
          </div>
        </div>
        
        <div className="mt-5">
          <div className="text-[10px] text-white/60 uppercase tracking-wider font-bold mb-1">Your Investment</div>
          <div className="text-[44px] font-bold text-white leading-none">{formatCurrency(invoice.total_amount)}</div>
        </div>
        
        <div className="flex justify-between items-end mt-6">
          <div className="bg-[#F59E0B] text-[#1E1B4B] px-3 py-1 rounded-full text-xs font-bold">
            #{invoice.invoice_number}
          </div>
          <div className="text-white/80 text-sm font-medium">
            Due {formatDate(invoice.due_date)}
          </div>
        </div>
      </div>

      {/* Three colored dots row */}
      <div className="flex gap-2 px-8 mt-4">
        <div className="w-2 h-2 rounded-full bg-[#7C3AED]"></div>
        <div className="w-2 h-2 rounded-full bg-[#F59E0B]"></div>
        <div className="w-2 h-2 rounded-full bg-white/30"></div>
      </div>

      {/* Two cards side by side */}
      <div className="px-6 mt-6 grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border-t-[3px] border-t-[#F59E0B]">
          <div className="text-[10px] text-[#7C3AED] uppercase tracking-wider font-bold mb-2">Client</div>
          <div className="font-bold text-[#1E1B4B] text-sm">{invoice.client_name}</div>
          <div className="text-gray-500 text-xs mt-1">{invoice.client_phone}</div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border-t-[3px] border-t-[#7C3AED]">
          <div className="text-[10px] text-[#7C3AED] uppercase tracking-wider font-bold mb-2">From</div>
          <div className="font-bold text-[#1E1B4B] text-sm">{business.business_name}</div>
          <div className="text-gray-500 text-xs mt-1">{business.owner_name}</div>
        </div>
      </div>

      {/* Deliverables */}
      <div className="px-6 mt-6">
        <div className="bg-[#1E1B4B] rounded-t-xl p-3">
          <div className="text-[11px] text-[#F59E0B] uppercase tracking-wider font-bold">📦 Deliverables</div>
        </div>
        <div className="bg-white border border-[#EDE9FE] border-t-0 rounded-b-xl overflow-hidden">
          {items.map((item, i) => (
            <div key={i} className="p-4 border-b border-[#EDE9FE] last:border-b-0 flex justify-between items-center">
              <div>
                <div className="text-[15px] font-bold text-[#1E1B4B]">{item.description}</div>
                <div className="text-[12px] text-[#7C3AED] italic mt-0.5">Creative Deliverable</div>
              </div>
              <div className="text-[16px] font-bold text-[#7C3AED]">
                {formatCurrency(item.quantity * item.unit_price)}
              </div>
            </div>
          ))}
          <div className="bg-[#7C3AED] p-4 flex justify-between items-center">
            <div className="text-[#F59E0B] text-sm font-bold uppercase tracking-wider">Total Investment</div>
            <div className="text-white font-bold text-[20px]">{formatCurrency(invoice.total_amount)}</div>
          </div>
        </div>
      </div>

      {/* Payment block */}
      <div className="px-6 mt-6">
        <div className="bg-white border-2 border-[#EDE9FE] rounded-2xl p-4">
          <div className="font-bold text-[#1E1B4B] mb-3">⚡ Payment Instructions</div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Bank</span>
              <span className="font-bold text-[#1E1B4B]">{business.bank_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Account Number</span>
              <span className="font-bold text-[#1E1B4B]">{business.account_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Account Name</span>
              <span className="font-bold text-[#1E1B4B]">{business.account_name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dark footer card */}
      <div className="px-6 mt-6 pb-8">
        <div className="bg-[#1E1B4B] rounded-2xl p-5 text-center">
          <div className="text-white font-bold text-sm mb-2">Let's create something amazing together! 🚀</div>
          <div className="text-[#F59E0B] text-xs font-bold">{business.business_name}</div>
        </div>
      </div>
    </div>
  );
}