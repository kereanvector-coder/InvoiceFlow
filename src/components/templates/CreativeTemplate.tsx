import React from 'react';
import { Invoice } from '../../store/invoiceStore';
import { Quotation } from '../../store/quotationStore';
import { getDocumentDetails } from '../../utils/documentUtils';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import LogoDisplay from './LogoDisplay';

export default function CreativeTemplate({ invoice, isReceipt }: { invoice: Invoice | Quotation, isReceipt?: boolean }) {
  const { business_snapshot: business, items } = invoice;
  const details = getDocumentDetails(invoice, isReceipt);

  return (
    <div className="bg-[#FAF5FF] aspect-[210/297] font-sans text-[#1E1B4B]">
      {/* Purple gradient hero band */}
      <div className="bg-gradient-to-br from-[#7C3AED] to-[#4F46E5] p-1.5 pb-2">
        <div className="flex justify-between items-start">
          <div className="flex flex-col items-start gap-1">
            <LogoDisplay invoice={invoice} size={28} style={{ borderRadius: '8px', border: '2px solid white' }} />
            <div className="text-[8px] text-[#FFFFFFB3] uppercase tracking-widest font-bold">Creative Invoice</div>
          </div>
          <div className="bg-[#F59E0B] text-[#1E1B4B] px-1.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider">
            {isReceipt ? "PAID IN FULL" : invoice.status}
          </div>
        </div>
        
        <div className="mt-1">
          <div className="text-[7px] text-[#FFFFFF99] uppercase tracking-wider font-bold mb-0.5">Your Investment</div>
          <div className="text-[24px] font-bold text-white leading-none">{formatCurrency(invoice.total_amount)}</div>
        </div>
        
        <div className="flex justify-between items-end mt-1">
          <div className="bg-[#F59E0B] text-[#1E1B4B] px-1.5 py-0.5 rounded-full text-[9px] font-bold">
            #{details.documentNumber}
          </div>
          <div className="text-[#FFFFFFCC] text-[9px] font-medium">
            Due {formatDate(details.dateValue)}
          </div>
        </div>
      </div>

      {/* Three colored dots row */}
      <div className="flex gap-1 px-2 mt-1">
        <div className={`w-1.5 h-1.5 rounded-full ${isReceipt ? 'bg-emerald-600' : 'bg-[#7C3AED]'}`}></div>
        <div className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]"></div>
        <div className="w-1.5 h-1.5 rounded-full bg-[#FFFFFF4D]"></div>
      </div>

      {/* Two cards side by side */}
      <div className="px-2 mt-1 grid grid-cols-2 gap-1.5">
        <div className="bg-white rounded-md p-1.5 shadow-sm border-t-[3px] border-t-[#F59E0B]">
          <div className={`text-[7px] ${isReceipt ? 'text-emerald-600' : 'text-[#7C3AED]'} uppercase tracking-wider font-bold mb-0.5`}>Client</div>
          <div className="font-bold text-[#1E1B4B] text-[10px]">{invoice.client_name}</div>
          <div className="text-[#6B7280] text-[8px] mt-0.5">{invoice.client_phone}</div>
        </div>
        <div className="bg-white rounded-md p-1.5 shadow-sm border-t-[3px] border-t-[#7C3AED]">
          <div className={`text-[7px] ${isReceipt ? 'text-emerald-600' : 'text-[#7C3AED]'} uppercase tracking-wider font-bold mb-0.5`}>From</div>
          <div className="font-bold text-[#1E1B4B] text-[10px]">{business.business_name}</div>
          <div className="text-[#6B7280] text-[8px] mt-0.5">{business.owner_name}</div>
        </div>
      </div>

      {/* Deliverables */}
      <div className="px-2 mt-1">
        <div className="bg-[#1E1B4B] rounded-t-md p-1 px-2">
          <div className="text-[8px] text-[#F59E0B] uppercase tracking-wider font-bold">📦 Deliverables</div>
        </div>
        <div className="bg-white border border-[#EDE9FE] border-t-0 rounded-b-md overflow-hidden">
          {items.map((item, i) => (
            <div key={i} className="p-1.5 border-b border-[#EDE9FE] last:border-b-0 flex justify-between items-center">
              <div>
                <div className="text-[10px] font-bold text-[#1E1B4B]">{item.description}</div>
                <div className={`text-[8px] ${isReceipt ? 'text-emerald-600' : 'text-[#7C3AED]'} italic mt-0.5`}>Creative Deliverable</div>
              </div>
              <div className={`text-[11px] font-bold ${isReceipt ? 'text-emerald-600' : 'text-[#7C3AED]'}`}>
                {formatCurrency(item.quantity * item.unit_price)}
              </div>
            </div>
          ))}
          <div className={`${isReceipt ? 'bg-emerald-600' : 'bg-[#7C3AED]'} p-1.5 flex justify-between items-center`}>
            <div className="text-[#F59E0B] text-[9px] font-bold uppercase tracking-wider">Total Investment</div>
            <div className="text-white font-bold text-[12px]">{formatCurrency(invoice.total_amount)}</div>
          </div>
        </div>
      </div>

      {/* Payment block */}
      <div className="px-2 mt-1">
        {!isReceipt && <div className="bg-white border-2 border-[#EDE9FE] rounded-md p-1.5">
          <div className="font-bold text-[#1E1B4B] text-[9px] mb-1">⚡ Payment Instructions</div>
          <div className="space-y-0.5 text-[9px]">
            <div className="flex justify-between">
              <span className="text-[#6B7280]">Bank</span>
              <span className="font-bold text-[#1E1B4B]">{business.bank_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B7280]">Account Number</span>
              <span className="font-bold text-[#1E1B4B]">{business.account_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B7280]">Account Name</span>
              <span className="font-bold text-[#1E1B4B]">{business.account_name}</span>
            </div>
          </div>
        </div>}
      </div>

      {/* Terms */}
      {details.terms && (
        <div className="px-2 mt-1">
          <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-md p-1.5">
            <div className="font-bold text-[#D97706] text-[8px] uppercase tracking-wider mb-0.5">Terms & Conditions</div>
            <div className="text-[9px] text-[#92400E] whitespace-pre-wrap">
              {details.terms}
            </div>
          </div>
        </div>
      )}

      {/* Dark footer card */}
      <div className="px-2 mt-1 pb-1">
        <div className="bg-[#1E1B4B] rounded-md p-1.5 text-center">
          <div className="text-white font-bold text-[9px] mb-0.5">Let's create something amazing together! 🚀</div>
          <div className="text-[#F59E0B] text-[7px] font-bold">{business.business_name}</div>
        </div>
      </div>
    </div>
  );
}