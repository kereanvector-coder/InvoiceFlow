import React from 'react';
import { Invoice } from '../../store/invoiceStore';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';

export default function ModernTemplate({ invoice }: { invoice: Invoice }) {
  const { business_snapshot: business, items } = invoice;
  
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  const taxAmount = Math.round(subtotal * invoice.tax_rate);
  const total = subtotal + taxAmount;

  return (
    <div className="bg-[#0A0A0A] font-sans text-neutral-300 p-4 sm:p-8 min-h-[1056px]">
      <div className="max-w-4xl mx-auto bg-[#141414] rounded-2xl border border-neutral-800 overflow-hidden shadow-2xl print:shadow-none print:border-none">
        
        {/* Header */}
        <div className="p-6 sm:p-10 border-b border-neutral-800 flex flex-col sm:flex-row justify-between items-start gap-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{business.business_name}</h1>
            <p className="text-neutral-500 text-sm leading-relaxed max-w-xs">{business.owner_name}</p>
            <p className="text-neutral-500 text-sm mt-1">{business.phone_number}</p>
          </div>
          <div className="sm:text-right">
            <div className="text-emerald-500 font-semibold tracking-widest uppercase text-sm mb-1">Invoice</div>
            <div className="text-white text-xl font-mono">{invoice.invoice_number}</div>
            <div className="text-neutral-500 text-sm mt-3">Date: {formatDate(invoice.created_at)}</div>
            <div className="text-neutral-500 text-sm">Due: {formatDate(invoice.due_date)}</div>
          </div>
        </div>

        {/* Amount Display */}
        <div className="bg-emerald-500/10 border-y border-emerald-500/20 p-6 sm:p-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <p className="text-emerald-500/80 text-sm uppercase tracking-wider mb-1 font-medium">Total Amount Due</p>
            <p className="text-4xl sm:text-5xl font-bold text-emerald-400">{formatCurrency(total)}</p>
          </div>
          <div className="sm:text-right">
            <p className="text-neutral-400 text-sm mb-2">Status</p>
            <div className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase ${
              invoice.status === 'paid' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
              invoice.status === 'overdue' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
              'bg-neutral-800 text-neutral-300 border border-neutral-700'
            }`}>
              {invoice.status}
            </div>
          </div>
        </div>

        {/* Cards: Client & Payment */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 sm:p-10 border-b border-neutral-800">
          <div className="bg-[#1A1A1A] p-6 rounded-xl border border-neutral-800/60">
            <h3 className="text-neutral-500 text-xs font-bold uppercase tracking-wider mb-4">Billed To</h3>
            <p className="text-white font-medium text-lg mb-1">{invoice.client_name}</p>
            <p className="text-neutral-400 text-sm">{invoice.client_phone}</p>
          </div>
          <div className="bg-[#1A1A1A] p-6 rounded-xl border border-neutral-800/60">
            <h3 className="text-neutral-500 text-xs font-bold uppercase tracking-wider mb-4">Payment Details</h3>
            <p className="text-white font-medium mb-1">{business.bank_name}</p>
            <p className="text-emerald-400 text-lg font-mono mb-1">{business.account_number}</p>
            <p className="text-neutral-400 text-sm">{business.account_name}</p>
          </div>
        </div>

        {/* Items */}
        <div className="p-6 sm:p-10">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-500 text-sm">
                  <th className="pb-4 font-medium uppercase tracking-wider text-xs">Description</th>
                  <th className="pb-4 font-medium uppercase tracking-wider text-xs text-right">Qty</th>
                  <th className="pb-4 font-medium uppercase tracking-wider text-xs text-right">Price</th>
                  <th className="pb-4 font-medium uppercase tracking-wider text-xs text-right">Total</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {items.map((item, idx) => (
                  <tr key={idx} className="border-b border-neutral-800/50 last:border-0">
                    <td className="py-5 text-neutral-200">{item.description}</td>
                    <td className="py-5 text-right text-neutral-400">{item.quantity}</td>
                    <td className="py-5 text-right text-neutral-400">{formatCurrency(item.unit_price)}</td>
                    <td className="py-5 text-right text-white font-medium">{formatCurrency(item.quantity * item.unit_price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="mt-8 flex justify-end">
            <div className="w-full sm:w-72 space-y-3">
              <div className="flex justify-between text-sm text-neutral-400">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {invoice.tax_rate > 0 && (
                <div className="flex justify-between text-sm text-neutral-400">
                  <span>Tax ({(invoice.tax_rate * 100).toFixed(0)}%)</span>
                  <span>{formatCurrency(taxAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-xl font-bold text-white pt-4 border-t border-neutral-800 mt-4">
                <span>Total</span>
                <span className="text-emerald-400">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="p-6 sm:p-10 bg-[#1A1A1A] border-t border-neutral-800">
            <h3 className="text-neutral-500 text-xs font-bold uppercase tracking-wider mb-3">Notes</h3>
            <p className="text-neutral-300 text-sm leading-relaxed">{invoice.notes}</p>
          </div>
        )}

        {/* Signature */}
        {business.signature && (
          <div className="p-6 sm:p-10 border-t border-neutral-800 flex justify-end">
            <div className="text-center">
              <img src={business.signature} alt="Signature" className="h-16 object-contain mb-2 mx-auto filter invert opacity-80" />
              <div className="w-40 border-t border-neutral-700 mx-auto"></div>
              <div className="text-neutral-400 text-sm mt-2 font-medium">{business.owner_name}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
