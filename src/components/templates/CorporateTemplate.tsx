import React from 'react';
import { Invoice } from '../../store/invoiceStore';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import LogoDisplay from './LogoDisplay';

export default function CorporateTemplate({ invoice }: { invoice: Invoice }) {
  const { business_snapshot: business, items } = invoice;
  
  return (
    <div className="bg-[#F8FAFC] min-h-screen font-sans text-[#0F172A]">
      {/* Header band */}
      <div className="bg-[#1E3A5F] px-7 py-8 w-full">
        <div className="flex justify-between items-start">
          <div className="text-[11px] text-white uppercase tracking-[0.15em] opacity-80">
            PROFESSIONAL SERVICES INVOICE
          </div>
          <div className="border border-white text-white bg-[#1E3A5F] px-2 py-0.5 text-xs font-medium rounded-sm uppercase">
            {invoice.status}
          </div>
        </div>
        
        <div className="flex justify-between items-end mt-4">
          <div>
            <div className="text-[28px] font-bold text-white font-mono">{invoice.invoice_number}</div>
            <div className="w-10 h-[3px] bg-[#C9A84C] mt-2"></div>
          </div>
          <div className="text-right text-white flex flex-col items-end">
            <LogoDisplay invoice={invoice} size={48} className="mb-3" style={{ border: '2px solid white', borderRadius: '8px' }} />
            <div className="text-[16px] font-bold">{business.business_name}</div>
            <div className="text-[13px] opacity-80 mt-1">Invoice Date: {formatDate(invoice.created_at)}</div>
            <div className="text-[13px] opacity-80">Due Date: {formatDate(invoice.due_date)}</div>
            <div className="text-[13px] opacity-80 text-[#C9A84C] mt-1">
              Payment Terms: Net {Math.max(0, Math.ceil((new Date(invoice.due_date).getTime() - new Date(invoice.created_at).getTime()) / (1000 * 60 * 60 * 24)))}
            </div>
          </div>
        </div>
      </div>

      {/* Body card */}
      <div className="bg-white mx-4 -mt-3 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-6 mb-8 relative z-10">
        
        {/* Matter/Reference */}
        <div className="bg-[#F8FAFC] border-l-4 border-[#C9A84C] px-4 py-3 rounded-r-lg mb-5">
          <div className="text-[14px] text-[#0F172A] font-bold">
            RE: {invoice.notes ? invoice.notes.split('\n')[0] : 'Professional Consulting Services'}
          </div>
          <div className="text-[12px] text-[#475569] mt-0.5">
            Project Reference: <span className="font-mono">{invoice.invoice_number}</span>
          </div>
        </div>

        {/* Two columns */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <div className="text-[10px] text-[#1E3A5F] uppercase tracking-[0.1em] font-bold">BILLED TO</div>
            <div className="w-[30px] h-[2px] bg-[#C9A84C] mt-1 mb-2"></div>
            <div className="text-[16px] font-bold text-[#0F172A]">{invoice.client_name}</div>
            <div className="text-[14px] text-[#475569] mt-1">{invoice.client_phone}</div>
          </div>
          <div>
            <div className="text-[10px] text-[#1E3A5F] uppercase tracking-[0.1em] font-bold">REMITTANCE TO</div>
            <div className="w-[30px] h-[2px] bg-[#C9A84C] mt-1 mb-2"></div>
            <div className="text-[14px] font-bold text-[#0F172A]">{business.business_name}</div>
            <div className="text-[13px] text-[#475569] mt-1">Bank: {business.bank_name}</div>
            <div className="text-[15px] font-bold font-mono text-[#0F172A] mt-0.5">{business.account_number}</div>
            <div className="text-[13px] text-[#475569]">Account Name: {business.account_name}</div>
          </div>
        </div>

        <div className="border-t border-dashed border-[#E2E8F0] my-6"></div>

        {/* Services table */}
        <div className="mb-6">
          <div className="text-[11px] text-[#1E3A5F] uppercase tracking-[0.1em] font-bold">SERVICES RENDERED</div>
          <div className="w-[30px] h-[2px] bg-[#C9A84C] mt-1 mb-3"></div>
          
          <div className="bg-[#1E3A5F] text-white px-3.5 py-2.5 flex text-[10px] uppercase tracking-[0.05em] rounded-t-sm">
            <div className="w-1/2">DESCRIPTION OF SERVICES</div>
            <div className="w-[15%] text-center">HOURS/QTY</div>
            <div className="w-[15%] text-right">RATE (₦)</div>
            <div className="w-[20%] text-right">AMOUNT (₦)</div>
          </div>
          
          <div>
            {items.map((item, idx) => (
              <div key={item.id} className={`flex px-3.5 py-3.5 border-b border-[#F1F5F9] ${idx % 2 === 1 ? 'bg-[#FAFBFD]' : 'bg-white'}`}>
                <div className="w-1/2 pr-2">
                  <div className="text-[14px] font-bold text-[#0F172A]">{item.description}</div>
                  <div className="text-[12px] text-[#475569] italic mt-0.5">Professional Services</div>
                </div>
                <div className="w-[15%] text-center text-[14px] text-[#475569]">{item.quantity}</div>
                <div className="w-[15%] text-right text-[14px] text-[#475569]">{formatCurrency(item.unit_price).replace('₦', '')}</div>
                <div className="w-[20%] text-right text-[14px] font-bold text-[#0F172A]">{formatCurrency(item.quantity * item.unit_price).replace('₦', '')}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-6">
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-4 min-w-[240px]">
            <div className="flex justify-between text-[13px] text-[#475569] mb-2">
              <span>Subtotal</span>
              <span>{formatCurrency(invoice.subtotal)}</span>
            </div>
            {invoice.tax_amount > 0 && (
              <div className="flex justify-between text-[13px] text-[#475569] mb-3">
                <span>Tax ({invoice.tax_rate * 100}%)</span>
                <span>{formatCurrency(invoice.tax_amount)}</span>
              </div>
            )}
            <div className="border-t border-dashed border-[#E2E8F0] my-3"></div>
            <div className="bg-[#1E3A5F] -mx-4 -mb-4 p-3.5 rounded-b-lg flex justify-between items-center mt-2">
              <span className="text-white font-bold text-[13px] uppercase">TOTAL DUE</span>
              <span className="text-white font-bold text-[22px]">{formatCurrency(invoice.total_amount)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="mb-6">
            <div className="text-[11px] text-[#1E3A5F] uppercase tracking-[0.1em] font-bold mb-2">TERMS & CONDITIONS</div>
            <div className="bg-[#F8FAFC] p-3 rounded-md">
              <div className="text-[13px] text-[#475569] italic whitespace-pre-wrap">
                {invoice.notes}
                {'\n\n'}Payment is due within the agreed terms. Late payments may attract interest charges.
              </div>
            </div>
          </div>
        )}

        {/* Signature */}
        {business.signature && (
          <div className="mb-6 flex justify-end">
            <div className="text-center">
              <img src={business.signature} alt="Signature" className="h-16 object-contain mb-2 mx-auto" />
              <div className="w-40 border-t border-neutral-300 mx-auto"></div>
              <div className="text-[12px] text-[#475569] mt-1 font-medium">{business.owner_name}</div>
              <div className="text-[10px] text-[#94A3B8] uppercase tracking-wider">Authorized Signatory</div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-[#E2E8F0] pt-4 flex justify-between items-center">
          <div className="italic text-[13px] text-[#475569]">Thank you for your business</div>
          <div className="text-[11px] text-[#94A3B8]">Generated by InvoiceFlow</div>
        </div>

      </div>
    </div>
  );
}
