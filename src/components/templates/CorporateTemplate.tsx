import React from 'react';
import { Invoice } from '../../store/invoiceStore';
import { Quotation } from '../../store/quotationStore';
import { getDocumentDetails } from '../../utils/documentUtils';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import LogoDisplay from './LogoDisplay';

export default function CorporateTemplate({ invoice }: { invoice: Invoice | Quotation }) {
  const { business_snapshot: business, items } = invoice;
  const details = getDocumentDetails(invoice);
  
  return (
    <div className="bg-[#F8FAFC] aspect-[210/297] font-sans text-[#0F172A]">
      {/* Header band */}
      <div className="bg-[#1E3A5F] px-4 py-2 w-full">
        <div className="flex justify-between items-start">
          <div className="text-[10px] text-white uppercase tracking-[0.1em] opacity-80">
            PROFESSIONAL SERVICES {details.documentTypeLabel}
          </div>
          <div className="border border-white text-white bg-[#1E3A5F] px-1.5 py-0.5 text-[10px] font-medium rounded-sm uppercase">
            {invoice.status}
          </div>
        </div>
        
        <div className="flex justify-between items-end mt-2">
          <div>
            <div className="text-[24px] font-bold text-white font-mono">{details.documentNumber}</div>
            <div className="w-8 h-[2px] bg-[#C9A84C] mt-1.5"></div>
          </div>
          <div className="text-right text-white flex flex-col items-end">
            <LogoDisplay invoice={invoice} size={40} className="mb-2" style={{ border: '2px solid white', borderRadius: '6px' }} />
            <div className="text-[14px] font-bold">{business.business_name}</div>
            <div className="text-[11px] opacity-80 mt-0.5">Date: {formatDate(invoice.created_at)}</div>
            <div className="text-[11px] opacity-80">{details.dateLabel}: {formatDate(details.dateValue)}</div>
            <div className="text-[11px] opacity-80 text-[#C9A84C] mt-0.5">
              Payment Terms: Net {Math.max(0, Math.ceil((new Date(details.dateValue).getTime() - new Date(invoice.created_at).getTime()) / (1000 * 60 * 60 * 24)))}
            </div>
          </div>
        </div>
      </div>

      {/* Body card */}
      <div className="bg-white mx-3 -mt-2 rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-3 mb-3 relative z-10">
        
        {/* Matter/Reference */}
        <div className="bg-[#F8FAFC] border-l-4 border-[#C9A84C] px-3 py-2 rounded-r-lg mb-2">
          <div className="text-[12px] text-[#0F172A] font-bold">
            RE: {invoice.notes ? invoice.notes.split('\n')[0] : 'Professional Consulting Services'}
          </div>
          <div className="text-[10px] text-[#475569] mt-0.5">
            Project Reference: <span className="font-mono">{details.documentNumber}</span>
          </div>
        </div>

        {/* Two columns */}
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div>
            <div className="text-[9px] text-[#1E3A5F] uppercase tracking-[0.1em] font-bold">BILLED TO</div>
            <div className="w-[20px] h-[2px] bg-[#C9A84C] mt-0.5 mb-1.5"></div>
            <div className="text-[14px] font-bold text-[#0F172A]">{invoice.client_name}</div>
            <div className="text-[12px] text-[#475569] mt-0.5">{invoice.client_phone}</div>
          </div>
          <div>
            <div className="text-[9px] text-[#1E3A5F] uppercase tracking-[0.1em] font-bold">REMITTANCE TO</div>
            <div className="w-[20px] h-[2px] bg-[#C9A84C] mt-0.5 mb-1.5"></div>
            <div className="text-[12px] font-bold text-[#0F172A]">{business.business_name}</div>
            <div className="text-[11px] text-[#475569] mt-0.5">Bank: {business.bank_name}</div>
            <div className="text-[13px] font-bold font-mono text-[#0F172A] mt-0.5">{business.account_number}</div>
            <div className="text-[11px] text-[#475569]">Account Name: {business.account_name}</div>
          </div>
        </div>

        <div className="border-t border-dashed border-[#E2E8F0] my-2"></div>

        
        {details.isQuote && details.projectTitle && (
          <div className="bg-[#F9FAFB] border-l-4 border-[#9CA3AF] px-3 py-1.5 rounded-r-lg mb-1.5">
            <div className="text-[9px] text-[#6B7280] uppercase tracking-[0.1em] font-bold mb-0.5">PROJECT</div>
            <div className="text-[12px] text-[#111827] font-bold">
              {details.projectTitle}
            </div>
            {details.projectDescription && (
              <div className="text-[10px] text-[#4B5563] italic mt-0.5">
                {details.projectDescription}
              </div>
            )}
          </div>
        )}

        {/* Services table */}
        <div className="mb-1.5">
          <div className="text-[9px] text-[#1E3A5F] uppercase tracking-[0.1em] font-bold">SERVICES RENDERED</div>
          <div className="w-[20px] h-[2px] bg-[#C9A84C] mt-0.5 mb-1.5"></div>
          
          <div className="bg-[#1E3A5F] text-white px-2.5 py-1 flex text-[9px] uppercase tracking-[0.05em] rounded-t-sm">
            <div className="w-1/2">DESCRIPTION OF SERVICES</div>
            <div className="w-[15%] text-center">HOURS/QTY</div>
            <div className="w-[15%] text-right">RATE (₦)</div>
            <div className="w-[20%] text-right">AMOUNT (₦)</div>
          </div>
          
          <div>
            {items.map((item, idx) => (
              <div key={item.id} className={`flex px-2.5 py-1.5 border-b border-[#F1F5F9] ${idx % 2 === 1 ? 'bg-[#FAFBFD]' : 'bg-white'}`}>
                <div className="w-1/2 pr-2">
                  <div className="text-[11px] font-bold text-[#0F172A]">{item.description}</div>
                  <div className="text-[9px] text-[#475569] italic mt-0.5">Professional Services</div>
                </div>
                <div className="w-[15%] text-center text-[11px] text-[#475569]">{item.quantity}</div>
                <div className="w-[15%] text-right text-[11px] text-[#475569]">{formatCurrency(item.unit_price).replace('₦', '')}</div>
                <div className="w-[20%] text-right text-[11px] font-bold text-[#0F172A]">{formatCurrency(item.quantity * item.unit_price).replace('₦', '')}</div>
              </div>
            ))}
          </div>
        </div>

        
        {details.isQuote && details.terms && (
          <div className="mb-1.5">
            <div className="text-[9px] text-[#6B7280] uppercase tracking-[0.1em] font-bold mb-0.5">TERMS & CONDITIONS</div>
            <div className="bg-[#F9FAFB] p-1.5 rounded-md">
              <div className="text-[10px] text-[#4B5563] whitespace-pre-wrap">
                {details.terms}
              </div>
            </div>
          </div>
        )}

        {/* Totals */}
        <div className="flex justify-end mb-1.5">
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-2 min-w-[200px]">
            <div className="flex justify-between text-[10px] text-[#475569] mb-1">
              <span>Subtotal</span>
              <span>{formatCurrency(invoice.subtotal)}</span>
            </div>
            {invoice.tax_amount > 0 && (
              <div className="flex justify-between text-[10px] text-[#475569] mb-1">
                <span>Tax ({invoice.tax_rate * 100}%)</span>
                <span>{formatCurrency(invoice.tax_amount)}</span>
              </div>
            )}
            <div className="border-t border-dashed border-[#E2E8F0] my-1"></div>
            <div className="bg-[#1E3A5F] -mx-2 -mb-2 p-2 rounded-b-lg flex justify-between items-center mt-1">
              <span className="text-white font-bold text-[10px] uppercase">{details.amountLabel.toUpperCase()}</span>
              <span className="text-white font-bold text-[13px]">{formatCurrency(invoice.total_amount)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="mb-1.5">
            <div className="text-[9px] text-[#1E3A5F] uppercase tracking-[0.1em] font-bold mb-0.5">TERMS & CONDITIONS</div>
            <div className="bg-[#F8FAFC] p-1.5 rounded-md">
              <div className="text-[10px] text-[#475569] italic whitespace-pre-wrap">
                {invoice.notes}
                {'\n\n'}Payment is due within the agreed terms. Late payments may attract interest charges.
              </div>
            </div>
          </div>
        )}

        {/* Signature */}
        {business.signature && (
          <div className="mb-1.5 flex justify-end">
            <div className="text-center">
              <img src={business.signature} alt="Signature" className="h-10 object-contain mb-1 mx-auto" />
              <div className="w-32 border-t border-[#D4D4D4] mx-auto"></div>
              <div className="text-[10px] text-[#475569] mt-1 font-medium">{business.owner_name}</div>
              <div className="text-[8px] text-[#94A3B8] uppercase tracking-wider">Authorized Signatory</div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-[#E2E8F0] pt-2 flex justify-between items-center">
          <div className="italic text-[10px] text-[#475569]">Thank you for your business</div>
          <div className="text-[8px] text-[#94A3B8]">Generated by InvoiceFlow</div>
        </div>

      </div>
    </div>
  );
}
