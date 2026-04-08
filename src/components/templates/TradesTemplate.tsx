import React from 'react';
import { Invoice } from '../../store/invoiceStore';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';

export default function TradesTemplate({ invoice }: { invoice: Invoice }) {
  const { business_snapshot: business, items } = invoice;

  return (
    <div className="bg-[#1C1917] min-h-screen font-sans text-[#FEF3C7] pb-6">
      {/* Orange ID bar */}
      <div className="bg-[#EA580C] py-2 px-5 flex justify-between items-center">
        <div className="text-[12px] text-white font-bold">⚙ JOB INVOICE</div>
        <div className="text-[12px] text-white font-mono">{invoice.invoice_number}</div>
      </div>

      {/* Dark header */}
      <div className="bg-[#1C1917] pt-6 pb-4 px-5 flex justify-between items-start">
        <div>
          <div className="text-[20px] font-bold text-[#FEF3C7]">{business.business_name}</div>
          <div className="text-[12px] text-[#EA580C] mt-1">Trades & General Services</div>
        </div>
        <div className="text-right">
          <div className="border border-[#EA580C] text-[#EA580C] px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mb-1 inline-block">
            {invoice.status}
          </div>
          <div className="text-[13px] text-gray-400 block">{formatDate(invoice.created_at)}</div>
        </div>
      </div>

      {/* Job reference bar */}
      <div className="bg-[#292524] border-l-[4px] border-l-[#EA580C] py-3.5 px-4 mx-5 mb-4">
        <div className="text-[9px] text-[#EA580C] uppercase tracking-wider font-bold mb-1">Job Reference</div>
        <div className="text-[14px] text-[#FEF3C7] font-bold">{invoice.notes || 'General Works & Services'}</div>
      </div>

      {/* Amount + client */}
      <div className="bg-[#292524] rounded-lg p-4 mx-5 mb-4">
        <div className="text-[9px] text-[#EA580C] uppercase tracking-wider font-bold mb-1">Balance Due</div>
        <div className="text-[34px] font-bold text-[#FEF3C7] leading-none mb-4">{formatCurrency(invoice.total_amount)}</div>
        
        <div className="h-px bg-[#44403C] w-full mb-4"></div>
        
        <div className="text-[9px] text-[#EA580C] uppercase tracking-wider font-bold mb-1">Billed To</div>
        <div className="text-[15px] text-[#FEF3C7] font-bold">{invoice.client_name}</div>
        <div className="text-[13px] text-gray-400 mt-0.5">{invoice.client_phone}</div>
      </div>

      {/* Labour & materials table */}
      <div className="bg-[#292524] rounded-lg overflow-hidden mx-5 mb-3">
        <div className="bg-[#EA580C] py-2.5 px-3.5 grid grid-cols-12 gap-2">
          <div className="col-span-6 text-[10px] text-white uppercase font-bold">Description</div>
          <div className="col-span-2 text-[10px] text-white uppercase font-bold text-center">Qty</div>
          <div className="col-span-4 text-[10px] text-white uppercase font-bold text-right">Total</div>
        </div>
        
        <div>
          {items.map((item, i) => (
            <div key={i} className={`p-3.5 grid grid-cols-12 gap-2 border-b border-[#44403C] items-center ${i % 2 === 0 ? 'bg-[#292524]' : 'bg-[#2C2926]'}`}>
              <div className="col-span-6">
                <div className="text-[14px] text-[#FEF3C7]">{item.description}</div>
                <div className="text-[11px] text-[#EA580C] italic mt-0.5">Labour / Materials</div>
              </div>
              <div className="col-span-2 text-center text-gray-400 text-sm">{item.quantity}</div>
              <div className="col-span-4 text-right text-[#FEF3C7] font-bold text-sm">
                {formatCurrency(item.quantity * item.unit_price)}
              </div>
            </div>
          ))}
        </div>
        
        <div className="bg-[#1C1917] border-t-2 border-t-[#EA580C] p-3.5 text-right">
          <span className="text-[#EA580C] font-bold text-[18px]">{formatCurrency(invoice.total_amount)}</span>
        </div>
      </div>

      {/* Payment */}
      <div className="bg-[#292524] rounded-lg p-4 mx-5 mb-3">
        <div className="text-[#EA580C] font-bold text-sm mb-3">🔧 PAYMENT INSTRUCTIONS</div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Bank</span>
            <span className="font-bold text-[#FEF3C7]">{business.bank_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Account</span>
            <span className="font-bold text-[#FEF3C7]">{business.account_number}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Name</span>
            <span className="font-bold text-[#FEF3C7]">{business.account_name}</span>
          </div>
        </div>
      </div>

      {/* Terms */}
      <div className="border border-dashed border-[#44403C] p-3 mx-5 mb-4">
        <div className="text-[11px] text-gray-400 italic leading-relaxed">
          TERMS: Balance due on completion of works. Materials costs are non-refundable.
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-gray-500 italic text-xs mt-6">
        Thank you for choosing {business.business_name}
      </div>
    </div>
  );
}