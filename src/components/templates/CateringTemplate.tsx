import React from 'react';
import { Invoice } from '../../store/invoiceStore';
import { Quotation } from '../../store/quotationStore';
import { getDocumentDetails } from '../../utils/documentUtils';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import LogoDisplay from './LogoDisplay';
import { getLogo } from './LogoDisplay';

export default function CateringTemplate({ invoice }: { invoice: Invoice | Quotation }) {
  const { business_snapshot: business, items } = invoice;
  const details = getDocumentDetails(invoice);
  const hasLogo = !!getLogo(invoice);

  return (
    <div className="bg-[#FFF8F0] aspect-[210/297] font-sans text-[#450A0A] pb-6">
      {/* Deep red top bar */}
      <div className="bg-[#9B1C1C] py-1.5 px-3 flex justify-between items-center">
        <div className="text-[10px] text-white font-bold">🍽 CATERING INVOICE</div>
        <div className="text-[10px] text-[#FFFFFFCC]">{business.business_name}</div>
      </div>

      {/* Chef header */}
      <div className="bg-white py-1.5 px-3 border-b-[2px] border-b-[#FEE2E2] flex justify-between items-center">
        <div className="flex items-center gap-2">
          {hasLogo ? (
            <LogoDisplay invoice={invoice} size={40} style={{ borderRadius: '50%', backgroundColor: '#FEE2E2' }} />
          ) : (
            <div className="w-[40px] h-[40px] bg-[#FEE2E2] rounded-full flex items-center justify-center shrink-0 text-[20px]">
              🎂
            </div>
          )}
          <div>
            <div className="text-[13px] font-bold text-[#9B1C1C]">{business.business_name}</div>
            <div className="text-[9px] text-[#DC2626] mt-0.5">Culinary Services</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[13px] font-bold text-[#450A0A] font-mono leading-none mb-1">#{details.documentNumber}</div>
          <div className="bg-[#FEE2E2] text-[#9B1C1C] px-1.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider inline-block mb-1">
            {invoice.status}
          </div>
          <div className="text-[9px] text-[#6B7280] block">{formatDate(invoice.created_at)}</div>
        </div>
      </div>

      {/* Event card */}
      <div className="mx-3 mt-1.5 bg-[#FEF3C7] rounded-[8px] border border-[#FDE68A] p-2 flex justify-between items-center">
        <div>
          <div className="text-[8px] text-[#92400E] uppercase tracking-wider font-bold mb-0.5">📅 Event / Service Details</div>
          <div className="text-[11px] font-bold text-[#450A0A]">{invoice.notes || 'Food Service / Catering'}</div>
        </div>
        <div className="text-[9px] text-[#92400E] font-medium">Due: {formatDate(details.dateValue)}</div>
      </div>

      {/* Red client+amount card */}
      <div className="mx-3 mt-1.5 bg-[#9B1C1C] rounded-[8px] p-2 px-2.5 flex justify-between items-center">
        <div>
          <div className="text-[8px] text-[#FFFFFF99] uppercase tracking-wider font-bold mb-0.5">Billed To</div>
          <div className="text-[12px] font-bold text-white">{invoice.client_name}</div>
          <div className="text-[9px] text-[#FFFFFFB3] mt-0.5">{invoice.client_phone}</div>
        </div>
        <div className="text-right">
          <div className="text-[8px] text-[#FFFFFF99] uppercase tracking-wider font-bold mb-0.5">Total</div>
          <div className="text-[20px] font-bold text-white leading-none">{formatCurrency(invoice.total_amount)}</div>
        </div>
      </div>

      {/* Menu items card */}
      <div className="mx-3 mt-1.5 bg-white rounded-[8px] border border-[#FECACA] overflow-hidden">
        <div className="bg-[#FEE2E2] py-1.5 px-2.5">
          <div className="text-[9px] text-[#9B1C1C] font-bold uppercase tracking-wider mb-0.5">🍽 Menu Items & Services</div>
          <div className="text-[8px] text-[#DC2626] uppercase tracking-wider grid grid-cols-12 gap-2 mt-0.5">
            <div className="col-span-6">Item</div>
            <div className="col-span-2 text-center">Portions</div>
            <div className="col-span-4 text-right">Total</div>
          </div>
        </div>
        
        <div>
          {items.map((item, i) => (
            <div key={i} className="p-1.5 px-2.5 border-b border-[#FFF8F0] grid grid-cols-12 gap-2 items-center">
              <div className="col-span-6">
                <div className="text-[11px] font-bold text-[#9B1C1C]">{item.description}</div>
                <div className="text-[8px] text-[#6B7280] italic mt-0.5">Food & Beverage</div>
              </div>
              <div className="col-span-2 text-center text-[#6B7280] text-[9px]">{item.quantity} portions</div>
              <div className="col-span-4 text-right font-bold text-[#DC2626] text-[11px]">
                {formatCurrency(item.quantity * item.unit_price)}
              </div>
            </div>
          ))}
        </div>
        
        <div className="bg-[#FFF8F0] py-1.5 px-2.5 border-t border-[#FECACA] flex flex-col items-end space-y-0.5">
          <div className="text-[#6B7280] text-[9px]">Subtotal: {formatCurrency(invoice.subtotal)}</div>
          <div className="text-[#6B7280] text-[9px]">Tax: {formatCurrency(invoice.tax_amount)}</div>
          <div className="font-bold text-[#9B1C1C] text-[13px] mt-0.5">Total: {formatCurrency(invoice.total_amount)}</div>
        </div>
      </div>

      {/* Payment */}
      <div className="mx-3 mt-1.5 bg-white rounded-[8px] border border-[#FECACA] p-2">
        <div className="text-[10px] font-bold text-[#9B1C1C] mb-1.5">🏦 Payment Details</div>
        <div className="space-y-1 text-[9px]">
          <div className="flex justify-between">
            <span className="text-[#6B7280]">Bank</span>
            <span className="font-bold text-[#450A0A]">{business.bank_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#6B7280]">Account</span>
            <span className="font-bold text-[#450A0A]">{business.account_number}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#6B7280]">Name</span>
            <span className="font-bold text-[#450A0A]">{business.account_name}</span>
          </div>
        </div>
      </div>

      
        {details.isQuote && details.terms && (
          <div className="mx-3 mt-1.5 mb-1.5">
            <div className="text-[9px] text-[#6B7280] uppercase tracking-[0.1em] font-bold mb-0.5">TERMS & CONDITIONS</div>
            <div className="bg-[#F9FAFB] p-1.5 rounded-md">
              <div className="text-[9px] text-[#4B5563] whitespace-pre-wrap">
                {details.terms}
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
      {invoice.notes && (
        <div className="mx-3 mt-1.5 bg-[#FEF3C7] rounded-[8px] p-2 px-2.5">
          <div className="text-[9px] text-[#92400E] font-bold mb-0.5">📝 Special Instructions</div>
          <div className="text-[9px] text-[#450A0A]">{invoice.notes}</div>
        </div>
      )}

      {/* Red footer card */}
      <div className="mx-3 mt-1.5 mb-1.5 bg-[#9B1C1C] rounded-[8px] p-2 text-center">
        <div className="text-[11px] font-bold text-white mb-0.5">Thank you for letting us feed you! 🍽</div>
        <div className="text-[9px] text-[#FFFFFFCC] italic mb-1.5">We hope every bite was worth it.</div>
        <div className="text-[8px] text-[#FEE2E2]">{business.business_name}</div>
      </div>
    </div>
  );
}