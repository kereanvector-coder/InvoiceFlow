import React from 'react';
import { Invoice } from '../../store/invoiceStore';
import { Quotation } from '../../store/quotationStore';
import { getDocumentDetails } from '../../utils/documentUtils';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import LogoDisplay from './LogoDisplay';

export default function ExecutiveTemplate({ invoice }: { invoice: Invoice | Quotation }) {
  const { business_snapshot: business, items } = invoice;
  const details = getDocumentDetails(invoice);

  return (
    <div className="bg-[#1A1A1A] min-h-screen font-sans text-[#F5F0E8]">
      {/* Top gold gradient band */}
      <div className="h-1 w-full bg-gradient-to-r from-[#C9A84C] via-[#F0D080] to-[#C9A84C]"></div>

      {/* Dark header */}
      <div className="bg-[#1A1A1A] px-7 py-9 flex justify-between items-start">
        <div className="flex flex-col items-start">
          <LogoDisplay invoice={invoice} size={56} className="mb-3" style={{ border: '2px solid #D4AF37', borderRadius: '4px' }} />
          <div className="text-[24px] font-[300] text-[#F5F0E8] uppercase tracking-[2px]">{business.business_name}</div>
          <div className="w-[60px] h-[1px] bg-[#C9A84C] my-3"></div>
          <div className="text-[10px] text-[#C9A84C] uppercase tracking-[0.3em]">Executive Invoice</div>
        </div>
        <div className="text-right flex flex-col items-end">
          <div className="border border-[#C9A84C] text-[#C9A84C] px-2 py-0.5 text-[10px] uppercase tracking-wider mb-2">
            {invoice.status}
          </div>
          <div className="text-[14px] text-[#A09880] font-mono">{details.documentNumber}</div>
        </div>
      </div>

      <div className="h-px w-full bg-[#C9A84C]/30"></div>

      {/* Client section */}
      <div className="px-7 py-6 flex justify-between">
        <div>
          <div className="text-[9px] text-[#C9A84C] uppercase tracking-widest mb-1">Engagement Client</div>
          <div className="text-[18px] text-[#F5F0E8] font-bold">{invoice.client_name}</div>
          <div className="text-[14px] text-[#A09880] mt-0.5">{invoice.client_phone}</div>
        </div>
        <div className="text-right">
          <div className="text-[9px] text-[#C9A84C] uppercase tracking-widest mb-1">Invoice Date</div>
          <div className="text-[14px] text-[#F5F0E8] mb-3">{formatDate(invoice.created_at)}</div>
          <div className="text-[9px] text-[#C9A84C] uppercase tracking-widest mb-1">Payment Due</div>
          <div className="text-[14px] text-[#F5F0E8]">{formatDate(details.dateValue)}</div>
        </div>
      </div>

      {/* Amount card */}
      <div className="mx-7 bg-[#242424] border border-[#C9A84C]/40 rounded p-6">
        <div className="text-[10px] text-[#C9A84C] uppercase tracking-widest mb-2">Engagement Fee</div>
        <div className="text-[48px] font-bold text-[#F5F0E8] leading-none mb-4">{formatCurrency(invoice.total_amount)}</div>
        <div className="w-[40px] h-[1px] bg-[#C9A84C]"></div>
      </div>

      
        {details.isQuote && details.projectTitle && (
          <div className="bg-gray-50 border-l-4 border-gray-400 px-4 py-3 rounded-r-lg mb-6">
            <div className="text-[10px] text-gray-500 uppercase tracking-[0.1em] font-bold mb-1">PROJECT</div>
            <div className="text-[15px] text-gray-900 font-bold">
              {details.projectTitle}
            </div>
            {details.projectDescription && (
              <div className="text-[13px] text-gray-600 italic mt-1">
                {details.projectDescription}
              </div>
            )}
          </div>
        )}

        {/* Services table */}
      <div className="mx-7 mt-5">
        <div className="text-[9px] text-[#C9A84C] uppercase tracking-widest mb-1">Services Rendered</div>
        <div className="w-[40px] h-[1px] bg-[#C9A84C] mb-2"></div>
        
        <div className="mb-4">
          {items.map((item, i) => (
            <div key={i} className="py-4 border-b border-[#333] flex justify-between items-center">
              <div>
                <div className="text-[14px] text-[#F5F0E8]">{item.description}</div>
                <div className="text-[11px] text-[#C9A84C] italic mt-1">Engagement</div>
              </div>
              <div className="text-[14px] text-[#C9A84C] font-bold">
                {formatCurrency(item.quantity * item.unit_price)}
              </div>
            </div>
          ))}
        </div>
        
        <div className="bg-[#242424] border border-[#333] p-4 flex justify-between items-center">
          <div className="text-[#F5F0E8] text-sm">Total</div>
          <div className="text-[#C9A84C] font-bold text-[18px]">{formatCurrency(invoice.total_amount)}</div>
        </div>
      </div>

      {/* Wire transfer section */}
      <div className="mx-7 mt-5 bg-[#242424] border border-[#333] p-5">
        <div className="text-[9px] text-[#C9A84C] uppercase tracking-widest mb-4">Wire Transfer Instructions</div>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-[#A09880]">Bank Name</span>
            <span className="text-[#F5F0E8] font-medium">{business.bank_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#A09880]">Account Number</span>
            <span className="text-[#F5F0E8] font-medium">{business.account_number}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#A09880]">Account Name</span>
            <span className="text-[#F5F0E8] font-medium">{business.account_name}</span>
          </div>
        </div>
      </div>

      {/* Terms */}
      <div className="mx-7 mt-4 mb-8 border border-dashed border-[#333] p-4">
        <div className="text-[9px] text-[#C9A84C] uppercase tracking-widest mb-2">Terms & Conditions</div>
        <div className="text-[12px] text-[#A09880] italic leading-[1.8]">
          Payment is due within agreed terms. Engagement fees are non-refundable once work has commenced. All matters are strictly confidential.
        </div>
      </div>

      {/* Bottom gold band */}
      <div className="h-1 w-full bg-gradient-to-r from-[#C9A84C] via-[#F0D080] to-[#C9A84C]"></div>
    </div>
  );
}