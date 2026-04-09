import React from 'react';
import { Invoice } from '../../store/invoiceStore';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import LogoDisplay from './LogoDisplay';

export default function EcommerceTemplate({ invoice }: { invoice: Invoice }) {
  const { business_snapshot: business, items } = invoice;

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-sans text-[#0F172A]">
      {/* Blue confirmation strip */}
      <div className="bg-[#2563EB] py-2.5 px-6 text-center">
        {invoice.status === 'paid' ? (
          <div className="text-[13px] text-white font-medium">✓ Order Confirmed · Thank you for your purchase!</div>
        ) : (
          <div className="text-[13px] text-white font-medium">{business.business_name} · Order Invoice</div>
        )}
      </div>

      {/* White header card */}
      <div className="bg-white m-3 rounded-xl shadow-sm p-5 border border-[#E2E8F0]">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <LogoDisplay invoice={invoice} size={40} style={{ borderRadius: '4px' }} />
            <div>
              <div className="text-[18px] font-bold text-[#0F172A]">{business.business_name}</div>
              <div className="text-[12px] text-[#2563EB] font-medium mt-0.5">Online Store</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Order</div>
            <div className="text-[20px] font-bold text-[#2563EB] font-mono leading-tight">#{invoice.invoice_number}</div>
            <div className="text-[13px] text-gray-500 mt-1">{formatDate(invoice.created_at)}</div>
          </div>
        </div>
        
        <div className="h-px bg-[#E2E8F0] my-4"></div>
        
        <div className="mb-4">
          <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-1">Billing Details</div>
          <div className="text-[14px] font-bold text-[#0F172A]">{invoice.client_name}</div>
          <div className="text-[13px] text-gray-500 mt-0.5">{invoice.client_phone}</div>
        </div>
        
        <div className="bg-[#DBEAFE] rounded-lg p-2.5 px-3.5 flex justify-between items-center">
          <div className="bg-[#2563EB] text-white px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider">
            {invoice.status}
          </div>
          <div className="text-[#2563EB] text-[13px] font-medium">
            Due: {formatDate(invoice.due_date)}
          </div>
        </div>
      </div>

      {/* Order summary card */}
      <div className="bg-white mx-3 rounded-xl shadow-sm border border-[#E2E8F0] overflow-hidden">
        <div className="bg-gray-50 px-4 py-2.5 border-b border-[#E2E8F0]">
          <div className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Order Summary</div>
        </div>
        
        <div className="divide-y divide-[#E2E8F0]">
          {items.map((item, i) => (
            <div key={i} className="p-3.5 px-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#DBEAFE] flex items-center justify-center shrink-0">
                <span className="text-sm">📦</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-[#0F172A] text-sm truncate">{item.description}</div>
                <div className="text-gray-500 text-xs mt-0.5">Qty: {item.quantity}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[11px] text-gray-500 mb-0.5">{formatCurrency(item.unit_price)} each</div>
                <div className="text-[15px] font-bold text-[#0F172A]">{formatCurrency(item.quantity * item.unit_price)}</div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="bg-[#F8FAFC] border-t border-[#E2E8F0] p-4">
          <div className="space-y-2 mb-3 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>{formatCurrency(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tax ({invoice.tax_rate * 100}%)</span>
              <span>{formatCurrency(invoice.tax_amount)}</span>
            </div>
          </div>
          <div className="h-px bg-[#E2E8F0] my-3"></div>
          <div className="flex justify-between items-center">
            <div className="font-bold text-[#0F172A]">ORDER TOTAL</div>
            <div className="font-bold text-[#2563EB] text-[20px]">{formatCurrency(invoice.total_amount)}</div>
          </div>
        </div>
      </div>

      {/* Payment card */}
      <div className="bg-white m-3 rounded-xl shadow-sm border border-[#E2E8F0] p-4">
        <div className="text-[#2563EB] font-bold text-sm mb-3">💳 PAYMENT INSTRUCTIONS</div>
        <div className="space-y-3 text-[13px] text-[#0F172A]">
          <div>1. Transfer <span className="font-bold">{formatCurrency(invoice.total_amount)}</span> to:</div>
          <div className="bg-gray-50 border border-[#E2E8F0] rounded-lg p-3 text-center">
            <div className="text-[18px] font-bold text-[#2563EB] font-mono">{business.account_number}</div>
            <div className="text-[12px] text-gray-500 mt-1">{business.bank_name} · {business.account_name}</div>
          </div>
          <div>2. Send proof of payment to <span className="font-bold">{business.phone_number}</span></div>
          <div>3. Order confirmed within 24 hours</div>
        </div>
      </div>

      {/* CSS barcode footer */}
      <div className="bg-white m-3 mb-6 rounded-xl shadow-sm border border-[#E2E8F0] p-4 text-center">
        <div className="inline-flex h-10 gap-[2px] mb-2">
          {[1,3,2,1,2,3,1,2,1,3,2,1,3,1,2,3,1,2,1,2].map((w, i) => (
            <div key={i} className="bg-black h-full" style={{ width: `${w}px` }}></div>
          ))}
        </div>
        <div className="font-mono text-[11px] text-gray-600 tracking-widest">{invoice.invoice_number}-{new Date(invoice.created_at).getFullYear()}</div>
        <div className="text-[10px] text-gray-400 mt-2">Powered by InvoiceFlow</div>
      </div>
    </div>
  );
}