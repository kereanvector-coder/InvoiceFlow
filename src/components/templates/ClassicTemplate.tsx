import React from 'react';
import { Invoice } from '../../store/invoiceStore';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import LogoDisplay from './LogoDisplay';
import { getLogo } from './LogoDisplay';

export default function ClassicTemplate({ invoice }: { invoice: Invoice }) {
  const { business_snapshot: business, items } = invoice;
  const hasLogo = !!getLogo(invoice);
  const initials = business.business_name ? business.business_name.charAt(0).toUpperCase() : 'B';
  
  return (
    <div className="bg-[#FAF9F6] min-h-screen font-serif text-[#2C3E50]">
      <div className="max-w-4xl mx-auto p-8 md:p-12">
        {/* Header */}
        <div className="flex justify-between items-end border-b-2 border-[#2C3E50] pb-8 mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-[#1A252F] mb-2">INVOICE</h1>
            <p className="text-sm text-[#7F8C8D] tracking-widest uppercase font-mono">No. {invoice.invoice_number}</p>
          </div>
          <div className="text-right flex flex-col items-end">
            {hasLogo ? (
              <LogoDisplay invoice={invoice} size={56} className="mb-3" style={{ borderRadius: '50%' }} />
            ) : (
              <div className="w-14 h-14 rounded-full bg-[#2C3E50] text-white flex items-center justify-center text-xl font-bold mb-3">
                {initials}
              </div>
            )}
            <h2 className="text-2xl font-bold text-[#2C3E50] mb-2">{business.business_name}</h2>
            <div className="text-sm text-[#34495E] leading-relaxed">
              <p>{business.owner_name}</p>
              <p>{business.phone_number}</p>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-12 mb-12">
          <div>
            <h3 className="text-xs font-bold text-[#7F8C8D] uppercase tracking-widest mb-3 border-b border-[#BDC3C7] pb-2">Billed To</h3>
            <p className="text-lg font-bold text-[#2C3E50] mb-1">{invoice.client_name}</p>
            <p className="text-sm text-[#34495E]">{invoice.client_phone}</p>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-xs font-bold text-[#7F8C8D] uppercase tracking-widest mb-3 border-b border-[#BDC3C7] pb-2">Date of Issue</h3>
              <p className="text-sm font-medium text-[#2C3E50]">{formatDate(invoice.created_at)}</p>
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#7F8C8D] uppercase tracking-widest mb-3 border-b border-[#BDC3C7] pb-2">Due Date</h3>
              <p className="text-sm font-medium text-[#2C3E50]">{formatDate(invoice.due_date)}</p>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-12">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="py-3 border-b-2 border-[#2C3E50] text-xs font-bold text-[#7F8C8D] uppercase tracking-widest w-1/2">Description</th>
                <th className="py-3 border-b-2 border-[#2C3E50] text-xs font-bold text-[#7F8C8D] uppercase tracking-widest text-center">Qty</th>
                <th className="py-3 border-b-2 border-[#2C3E50] text-xs font-bold text-[#7F8C8D] uppercase tracking-widest text-right">Unit Price</th>
                <th className="py-3 border-b-2 border-[#2C3E50] text-xs font-bold text-[#7F8C8D] uppercase tracking-widest text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {items.map((item, index) => (
                <tr key={item.id} className={index !== items.length - 1 ? 'border-b border-[#ECF0F1]' : ''}>
                  <td className="py-4 pr-4">
                    <p className="font-medium text-[#2C3E50]">{item.description}</p>
                  </td>
                  <td className="py-4 text-center text-[#34495E]">{item.quantity}</td>
                  <td className="py-4 text-right text-[#34495E]">{formatCurrency(item.unit_price)}</td>
                  <td className="py-4 text-right font-bold text-[#2C3E50]">{formatCurrency(item.quantity * item.unit_price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary & Payment Info */}
        <div className="grid grid-cols-2 gap-12 mb-12">
          {/* Payment Info */}
          <div>
            <h3 className="text-xs font-bold text-[#7F8C8D] uppercase tracking-widest mb-3 border-b border-[#BDC3C7] pb-2">Payment Information</h3>
            <div className="bg-[#ECF0F1] p-4 rounded-sm text-sm text-[#34495E] leading-relaxed">
              <p><span className="font-bold text-[#2C3E50]">Bank:</span> {business.bank_name}</p>
              <p><span className="font-bold text-[#2C3E50]">Account Name:</span> {business.account_name}</p>
              <p><span className="font-bold text-[#2C3E50]">Account No:</span> <span className="font-mono">{business.account_number}</span></p>
            </div>
          </div>

          {/* Totals */}
          <div>
            <div className="border-t border-[#BDC3C7] pt-4 space-y-3 text-sm">
              <div className="flex justify-between text-[#34495E]">
                <span>Subtotal</span>
                <span>{formatCurrency(invoice.subtotal)}</span>
              </div>
              {invoice.tax_amount > 0 && (
                <div className="flex justify-between text-[#34495E]">
                  <span>Tax ({invoice.tax_rate * 100}%)</span>
                  <span>{formatCurrency(invoice.tax_amount)}</span>
                </div>
              )}
              <div className="flex justify-between items-center border-t-2 border-[#2C3E50] pt-4 mt-4">
                <span className="text-lg font-bold text-[#2C3E50] uppercase tracking-widest">Total Due</span>
                <span className="text-2xl font-bold text-[#2C3E50]">{formatCurrency(invoice.total_amount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="mb-12">
            <h3 className="text-xs font-bold text-[#7F8C8D] uppercase tracking-widest mb-3 border-b border-[#BDC3C7] pb-2">Notes</h3>
            <p className="text-sm text-[#34495E] italic whitespace-pre-wrap leading-relaxed">{invoice.notes}</p>
          </div>
        )}

        {/* Signature */}
        {business.signature && (
          <div className="mb-12 flex justify-end">
            <div className="text-center">
              <img src={business.signature} alt="Signature" className="h-16 object-contain mb-2 mx-auto" />
              <div className="w-48 border-t border-[#2C3E50] mx-auto"></div>
              <div className="text-sm text-[#2C3E50] mt-2 font-bold">{business.owner_name}</div>
              <div className="text-xs text-[#7F8C8D] uppercase tracking-widest mt-1">Authorized Signature</div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center pt-8 border-t border-[#BDC3C7] text-xs text-[#7F8C8D]">
          <p>Thank you for your business.</p>
        </div>
      </div>
    </div>
  );
}
