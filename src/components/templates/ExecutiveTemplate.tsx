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
    <div className="bg-[#1A1A1A] aspect-[210/297] font-sans text-[#F5F0E8]">
      {/* Top gold gradient band */}
      <div className="h-1 w-full bg-gradient-to-r from-[#C9A84C] via-[#F0D080] to-[#C9A84C]"></div>

      {/* Dark header */}
      <div className="bg-[#1A1A1A] px-4 py-2 flex justify-between items-start">
        <div className="flex flex-col items-start">
          <LogoDisplay invoice={invoice} size={40} className="mb-2" style={{ border: '2px solid #D4AF37', borderRadius: '4px' }} />
          <div className="text-[16px] font-[300] text-[#F5F0E8] uppercase tracking-[1px]">{business.business_name}</div>
          <div className="w-[40px] h-[1px] bg-[#C9A84C] my-1.5"></div>
          <div className="text-[9px] text-[#C9A84C] uppercase tracking-[0.2em]">Executive Invoice</div>
        </div>
        <div className="text-right flex flex-col items-end">
          <div className="border border-[#C9A84C] text-[#C9A84C] px-1.5 py-0.5 text-[9px] uppercase tracking-wider mb-1.5">
            {invoice.status}
          </div>
          <div className="text-[12px] text-[#A09880] font-mono">{details.documentNumber}</div>
        </div>
      </div>

      <div className="h-px w-full bg-[#C9A84C4D]"></div>

      {/* Client section and Amount */}
      <div className="px-4 py-2 flex justify-between items-stretch gap-3">
        <div className="w-1/2 flex flex-col justify-between">
          <div>
            <div className="text-[8px] text-[#C9A84C] uppercase tracking-widest mb-0.5">Engagement Client</div>
            <div className="text-[14px] text-[#F5F0E8] font-bold">{invoice.client_name}</div>
            <div className="text-[12px] text-[#A09880] mt-0.5">{invoice.client_phone}</div>
          </div>
          <div className="mt-2 flex gap-4">
            <div>
              <div className="text-[8px] text-[#C9A84C] uppercase tracking-widest mb-0.5">Invoice Date</div>
              <div className="text-[11px] text-[#F5F0E8]">{formatDate(invoice.created_at)}</div>
            </div>
            <div>
              <div className="text-[8px] text-[#C9A84C] uppercase tracking-widest mb-0.5">Payment Due</div>
              <div className="text-[11px] text-[#F5F0E8]">{formatDate(details.dateValue)}</div>
            </div>
          </div>
        </div>
        
        <div className="w-1/2">
          <div className="bg-[#242424] border border-[#C9A84C66] rounded p-3 h-full flex flex-col justify-center">
            <div className="text-[9px] text-[#C9A84C] uppercase tracking-widest mb-1.5">Engagement Fee</div>
            <div className="text-[24px] font-bold text-[#F5F0E8] leading-none mb-2">{formatCurrency(invoice.total_amount)}</div>
            <div className="w-[30px] h-[1px] bg-[#C9A84C]"></div>
          </div>
        </div>
      </div>

      
        {details.isQuote && details.projectTitle && (
          <div className="mx-4 bg-[#242424] border-l-4 border-[#C9A84C] px-3 py-1.5 rounded-r-lg mb-1.5">
            <div className="text-[9px] text-[#C9A84C] uppercase tracking-[0.1em] font-bold mb-0.5">PROJECT</div>
            <div className="text-[12px] text-[#F5F0E8] font-bold">
              {details.projectTitle}
            </div>
            {details.projectDescription && (
              <div className="text-[10px] text-[#A09880] italic mt-0.5">
                {details.projectDescription}
              </div>
            )}
          </div>
        )}

        {/* Services table */}
      <div className="mx-4 mt-1.5">
        <div className="text-[8px] text-[#C9A84C] uppercase tracking-widest mb-0.5">Services Rendered</div>
        <div className="w-[30px] h-[1px] bg-[#C9A84C] mb-1"></div>
        
        <div className="mb-1.5">
          {items.map((item, i) => (
            <div key={i} className="py-1 border-b border-[#333] flex justify-between items-center">
              <div>
                <div className="text-[11px] text-[#F5F0E8]">{item.description}</div>
                <div className="text-[9px] text-[#C9A84C] italic mt-0.5">Engagement</div>
              </div>
              <div className="text-[11px] text-[#C9A84C] font-bold">
                {formatCurrency(item.quantity * item.unit_price)}
              </div>
            </div>
          ))}
        </div>
        
        <div className="bg-[#242424] border border-[#333] p-2 flex justify-between items-center">
          <div className="text-[#F5F0E8] text-xs">Total</div>
          <div className="text-[#C9A84C] font-bold text-[14px]">{formatCurrency(invoice.total_amount)}</div>
        </div>
      </div>

      {/* Footer sections */}
      <div className="mx-4 mt-2 mb-2 flex gap-3">
        {/* Wire transfer section */}
        <div className="w-1/2 bg-[#242424] border border-[#333] p-2">
          <div className="text-[8px] text-[#C9A84C] uppercase tracking-widest mb-2">Wire Transfer Instructions</div>
          <div className="space-y-1 text-[10px]">
            <div className="flex justify-between">
              <span className="text-[#A09880]">Bank Name</span>
              <span className="text-[#F5F0E8] font-medium">{business.bank_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#A09880]">Account No</span>
              <span className="text-[#F5F0E8] font-medium">{business.account_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#A09880]">Account Name</span>
              <span className="text-[#F5F0E8] font-medium">{business.account_name}</span>
            </div>
          </div>
        </div>

        {/* Terms */}
        <div className="w-1/2 border border-dashed border-[#333] p-2">
          <div className="text-[8px] text-[#C9A84C] uppercase tracking-widest mb-1.5">Terms & Conditions</div>
          <div className="text-[9px] text-[#A09880] italic leading-[1.4]">
            Payment is due within agreed terms. Engagement fees are non-refundable once work has commenced. All matters are strictly confidential.
          </div>
        </div>
      </div>

      {/* Bottom gold band */}
      <div className="h-1 w-full bg-gradient-to-r from-[#C9A84C] via-[#F0D080] to-[#C9A84C]"></div>
    </div>
  );
}