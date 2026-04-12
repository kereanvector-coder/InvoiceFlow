import React from 'react';
import { Invoice } from '../../store/invoiceStore';
import { Quotation } from '../../store/quotationStore';
import { getDocumentDetails } from '../../utils/documentUtils';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import LogoDisplay from './LogoDisplay';

export default function EcommerceTemplate({ invoice }: { invoice: Invoice | Quotation }) {
  const { business_snapshot: business, items } = invoice;
  const details = getDocumentDetails(invoice);

  return (
    <div className="bg-[#F8FAFC] min-h-[1056px] font-sans text-[#0F172A]">
      {/* Blue confirmation strip */}
      <div className="bg-[#2563EB] py-1.5 px-3 text-center">
        {invoice.status === 'paid' ? (
          <div className="text-[10px] text-white font-medium">✓ Order Confirmed · Thank you for your purchase!</div>
        ) : (
          <div className="text-[10px] text-white font-medium">{business.business_name} · Order Invoice</div>
        )}
      </div>

      {/* White header card */}
      <div className="bg-white m-1.5 rounded-lg shadow-sm p-2 border border-[#E2E8F0]">
        <div className="flex justify-between items-start mb-1.5">
          <div className="flex items-center gap-1.5">
            <LogoDisplay invoice={invoice} size={28} style={{ borderRadius: '4px' }} />
            <div>
              <div className="text-[12px] font-bold text-[#0F172A]">{business.business_name}</div>
              <div className="text-[9px] text-[#2563EB] font-medium mt-0.5">Online Store</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[8px] text-[#9CA3AF] uppercase tracking-wider font-bold">Order</div>
            <div className="text-[14px] font-bold text-[#2563EB] font-mono leading-tight">#{details.documentNumber}</div>
            <div className="text-[9px] text-[#6B7280] mt-0.5">{formatDate(invoice.created_at)}</div>
          </div>
        </div>
        
        <div className="h-px bg-[#E2E8F0] my-1.5"></div>
        
        <div className="mb-1.5">
          <div className="text-[8px] text-[#9CA3AF] uppercase tracking-wider font-bold mb-0.5">Billing Details</div>
          <div className="text-[11px] font-bold text-[#0F172A]">{invoice.client_name}</div>
          <div className="text-[9px] text-[#6B7280] mt-0.5">{invoice.client_phone}</div>
        </div>
        
        <div className="bg-[#DBEAFE] rounded-md p-1.5 px-2 flex justify-between items-center">
          <div className="bg-[#2563EB] text-white px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider">
            {invoice.status}
          </div>
          <div className="text-[#2563EB] text-[9px] font-medium">
            Due: {formatDate(details.dateValue)}
          </div>
        </div>
      </div>

      {/* Order summary card */}
      <div className="bg-white mx-1.5 rounded-lg shadow-sm border border-[#E2E8F0] overflow-hidden">
        <div className="bg-[#F9FAFB] px-2 py-1.5 border-b border-[#E2E8F0]">
          <div className="text-[8px] text-[#6B7280] uppercase tracking-wider font-bold">Order Summary</div>
        </div>
        
        <div className="divide-y divide-[#E2E8F0]">
          {items.map((item, i) => (
            <div key={i} className="p-1.5 px-2 flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-md bg-[#DBEAFE] flex items-center justify-center shrink-0">
                <span className="text-[9px]">📦</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-[#0F172A] text-[10px] truncate">{item.description}</div>
                <div className="text-[#6B7280] text-[8px] mt-0.5">Qty: {item.quantity}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[8px] text-[#6B7280] mb-0.5">{formatCurrency(item.unit_price)} each</div>
                <div className="text-[11px] font-bold text-[#0F172A]">{formatCurrency(item.quantity * item.unit_price)}</div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="bg-[#F8FAFC] border-t border-[#E2E8F0] p-2">
          <div className="space-y-1 mb-1.5 text-[10px]">
            <div className="flex justify-between text-[#4B5563]">
              <span>Subtotal</span>
              <span>{formatCurrency(invoice.subtotal)}</span>
            </div>
            {invoice.tax_amount > 0 && (
              <div className="flex justify-between text-[#4B5563]">
                <span>Tax ({invoice.tax_rate * 100}%)</span>
                <span>{formatCurrency(invoice.tax_amount)}</span>
              </div>
            )}
          </div>
          <div className="h-px bg-[#E2E8F0] my-1.5"></div>
          <div className="flex justify-between items-center">
            <div className="font-bold text-[#0F172A] text-[10px]">ORDER TOTAL</div>
            <div className="font-bold text-[#2563EB] text-[14px]">{formatCurrency(invoice.total_amount)}</div>
          </div>
        </div>
      </div>

      {/* Payment card */}
      <div className="bg-white m-1.5 rounded-lg shadow-sm border border-[#E2E8F0] p-2">
        <div className="text-[#2563EB] font-bold text-[9px] mb-1.5">💳 PAYMENT INSTRUCTIONS</div>
        <div className="space-y-1 text-[9px] text-[#0F172A]">
          <div>1. Transfer <span className="font-bold">{formatCurrency(invoice.total_amount)}</span> to:</div>
          <div className="bg-[#F9FAFB] border border-[#E2E8F0] rounded-md p-1.5 text-center">
            <div className="text-[12px] font-bold text-[#2563EB] font-mono">{business.account_number}</div>
            <div className="text-[8px] text-[#6B7280] mt-0.5">{business.bank_name} · {business.account_name}</div>
          </div>
          <div>2. Send proof of payment to <span className="font-bold">{business.phone_number}</span></div>
          <div>3. Order confirmed within 24 hours</div>
        </div>
      </div>

      {/* CSS barcode footer */}
      <div className="bg-white m-1.5 mb-1.5 rounded-lg shadow-sm border border-[#E2E8F0] p-2 text-center">
        <div className="inline-flex h-6 gap-[2px] mb-1">
          {[1,3,2,1,2,3,1,2,1,3,2,1,3,1,2,3,1,2,1,2].map((w, i) => (
            <div key={i} className="bg-black h-full" style={{ width: `${w}px` }}></div>
          ))}
        </div>
        <div className="font-mono text-[8px] text-[#4B5563] tracking-widest">{details.documentNumber}-{new Date(invoice.created_at).getFullYear()}</div>
        <div className="text-[8px] text-[#9CA3AF] mt-0.5">Powered by InvoiceFlow</div>
      </div>
    </div>
  );
}