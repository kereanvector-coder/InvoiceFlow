import React from 'react';
import { Invoice } from '../../store/invoiceStore';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import LogoDisplay from './LogoDisplay';
import { getLogo } from './LogoDisplay';

export default function CateringTemplate({ invoice }: { invoice: Invoice }) {
  const { business_snapshot: business, items } = invoice;
  const hasLogo = !!getLogo(invoice);

  return (
    <div className="bg-[#FFF8F0] min-h-screen font-sans text-[#450A0A] pb-6">
      {/* Deep red top bar */}
      <div className="bg-[#9B1C1C] py-3 px-6 flex justify-between items-center">
        <div className="text-[12px] text-white font-bold">🍽 CATERING INVOICE</div>
        <div className="text-[12px] text-white/80">{business.business_name}</div>
      </div>

      {/* Chef header */}
      <div className="bg-white py-5 px-6 border-b-[2px] border-b-[#FEE2E2] flex justify-between items-center">
        <div className="flex items-center gap-4">
          {hasLogo ? (
            <LogoDisplay invoice={invoice} size={56} style={{ borderRadius: '50%', backgroundColor: '#FEE2E2' }} />
          ) : (
            <div className="w-[56px] h-[56px] bg-[#FEE2E2] rounded-full flex items-center justify-center shrink-0 text-[32px]">
              🎂
            </div>
          )}
          <div>
            <div className="text-[18px] font-bold text-[#9B1C1C]">{business.business_name}</div>
            <div className="text-[12px] text-[#DC2626] mt-0.5">Culinary Services</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[18px] font-bold text-[#450A0A] font-mono leading-none mb-2">#{invoice.invoice_number}</div>
          <div className="bg-[#FEE2E2] text-[#9B1C1C] px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider inline-block mb-1">
            {invoice.status}
          </div>
          <div className="text-[13px] text-gray-500 block">{formatDate(invoice.created_at)}</div>
        </div>
      </div>

      {/* Event card */}
      <div className="mx-6 mt-4 bg-[#FEF3C7] rounded-xl border border-[#FDE68A] p-4 flex justify-between items-center">
        <div>
          <div className="text-[9px] text-[#92400E] uppercase tracking-wider font-bold mb-1">📅 Event / Service Details</div>
          <div className="text-[14px] font-bold text-[#450A0A]">{invoice.notes || 'Food Service / Catering'}</div>
        </div>
        <div className="text-[13px] text-[#92400E] font-medium">Due: {formatDate(invoice.due_date)}</div>
      </div>

      {/* Red client+amount card */}
      <div className="mx-6 mt-3 bg-[#9B1C1C] rounded-[16px] p-5 px-6 flex justify-between items-center">
        <div>
          <div className="text-[9px] text-white/60 uppercase tracking-wider font-bold mb-1">Billed To</div>
          <div className="text-[16px] font-bold text-white">{invoice.client_name}</div>
          <div className="text-[13px] text-white/70 mt-0.5">{invoice.client_phone}</div>
        </div>
        <div className="text-right">
          <div className="text-[9px] text-white/60 uppercase tracking-wider font-bold mb-1">Total</div>
          <div className="text-[26px] font-bold text-white leading-none">{formatCurrency(invoice.total_amount)}</div>
        </div>
      </div>

      {/* Menu items card */}
      <div className="mx-6 mt-6 bg-white rounded-[16px] border border-[#FECACA] overflow-hidden">
        <div className="bg-[#FEE2E2] py-3 px-4">
          <div className="text-[11px] text-[#9B1C1C] font-bold uppercase tracking-wider mb-1">🍽 Menu Items & Services</div>
          <div className="text-[9px] text-[#DC2626] uppercase tracking-wider grid grid-cols-12 gap-2 mt-2">
            <div className="col-span-6">Item</div>
            <div className="col-span-2 text-center">Portions</div>
            <div className="col-span-4 text-right">Total</div>
          </div>
        </div>
        
        <div>
          {items.map((item, i) => (
            <div key={i} className="p-3.5 px-4 border-b border-[#FFF8F0] grid grid-cols-12 gap-2 items-center">
              <div className="col-span-6">
                <div className="text-[14px] font-bold text-[#9B1C1C]">{item.description}</div>
                <div className="text-[11px] text-gray-500 italic mt-0.5">Food & Beverage</div>
              </div>
              <div className="col-span-2 text-center text-gray-500 text-[12px]">{item.quantity} portions</div>
              <div className="col-span-4 text-right font-bold text-[#DC2626] text-[14px]">
                {formatCurrency(item.quantity * item.unit_price)}
              </div>
            </div>
          ))}
        </div>
        
        <div className="bg-[#FFF8F0] py-3.5 px-4 border-t border-[#FECACA] flex flex-col items-end space-y-1">
          <div className="text-gray-500 text-sm">Subtotal: {formatCurrency(invoice.subtotal)}</div>
          <div className="text-gray-500 text-sm">Tax: {formatCurrency(invoice.tax_amount)}</div>
          <div className="font-bold text-[#9B1C1C] text-[17px] mt-1">Total: {formatCurrency(invoice.total_amount)}</div>
        </div>
      </div>

      {/* Payment */}
      <div className="mx-6 mt-3 bg-white rounded-[16px] border border-[#FECACA] p-4">
        <div className="text-[14px] font-bold text-[#9B1C1C] mb-3">🏦 Payment Details</div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Bank</span>
            <span className="font-bold text-[#450A0A]">{business.bank_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Account</span>
            <span className="font-bold text-[#450A0A]">{business.account_number}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Name</span>
            <span className="font-bold text-[#450A0A]">{business.account_name}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {invoice.notes && (
        <div className="mx-6 mt-3 bg-[#FEF3C7] rounded-[16px] p-3.5 px-4">
          <div className="text-[13px] text-[#92400E] font-bold mb-1">📝 Special Instructions</div>
          <div className="text-[13px] text-[#450A0A]">{invoice.notes}</div>
        </div>
      )}

      {/* Red footer card */}
      <div className="mx-6 mt-3 mb-6 bg-[#9B1C1C] rounded-[16px] p-5 text-center">
        <div className="text-[15px] font-bold text-white mb-1">Thank you for letting us feed you! 🍽</div>
        <div className="text-[13px] text-white/80 italic mb-3">We hope every bite was worth it.</div>
        <div className="text-[12px] text-[#FEE2E2]">{business.business_name}</div>
      </div>
    </div>
  );
}