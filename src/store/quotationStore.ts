import { InvoiceItem, createInvoice } from './invoiceStore';
import { BusinessProfile } from './businessStore';

export interface Quotation {
  id: string;
  quote_number: string;
  template: string;
  business_snapshot: BusinessProfile;
  client_name: string;
  client_phone: string;
  project_title: string;
  project_description?: string;
  items: InvoiceItem[];
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total_amount: number;
  status: 'draft' | 'sent' | 'accepted' | 'declined' | 'expired';
  notes?: string;
  terms?: string;
  valid_until: string;
  created_at: string;
  sent_at?: string | null;
  accepted_at?: string | null;
  declined_at?: string | null;
  converted_to_invoice_id?: string | null;
  is_deleted: boolean;
}

const STORAGE_KEY = 'invoiceflow_quotations';

export const getQuotations = (): Quotation[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  try {
    let quotes: Quotation[] = JSON.parse(data);
    let updated = false;
    
    // Auto-detect expired
    quotes = quotes.map(q => {
      if (q.status === 'sent' && new Date() > new Date(q.valid_until)) {
        updated = true;
        return { ...q, status: 'expired' };
      }
      return q;
    });

    if (updated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
    }

    return quotes.filter(q => !q.is_deleted);
  } catch (e) {
    console.error('Failed to parse quotations', e);
    return [];
  }
};

export const getQuotationById = (id: string): Quotation | null => {
  const quotes = getQuotations();
  return quotes.find(q => q.id === id) || null;
};

export const getNextQuoteNumber = (): string => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return 'QUO-001';
  try {
    const quotes: Quotation[] = JSON.parse(data);
    if (quotes.length === 0) return 'QUO-001';
    
    const numbers = quotes
      .map(q => {
        const match = q.quote_number.match(/QUO-(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter(n => !isNaN(n));
      
    if (numbers.length === 0) return 'QUO-001';
    const max = Math.max(...numbers);
    return `QUO-${String(max + 1).padStart(3, '0')}`;
  } catch (e) {
    return 'QUO-001';
  }
};

export const createQuotation = (data: Omit<Quotation, 'id' | 'quote_number' | 'created_at' | 'status' | 'is_deleted'>): Quotation => {
  const quotes = getQuotations();
  
  const newQuote: Quotation = {
    ...data,
    id: crypto.randomUUID(),
    quote_number: getNextQuoteNumber(),
    created_at: new Date().toISOString(),
    status: 'draft',
    is_deleted: false,
  };
  
  quotes.push(newQuote);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
  return newQuote;
};

export const updateQuotation = (id: string, updates: Partial<Quotation>): Quotation | null => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return null;
  try {
    const quotes: Quotation[] = JSON.parse(data);
    const index = quotes.findIndex(q => q.id === id);
    if (index === -1) return null;
    
    quotes[index] = { ...quotes[index], ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
    return quotes[index];
  } catch (e) {
    return null;
  }
};

export const updateQuotationStatus = (id: string, status: Quotation['status']): Quotation | null => {
  const updates: Partial<Quotation> = { status };
  if (status === 'sent') updates.sent_at = new Date().toISOString();
  if (status === 'accepted') updates.accepted_at = new Date().toISOString();
  if (status === 'declined') updates.declined_at = new Date().toISOString();
  
  return updateQuotation(id, updates);
};

export const deleteQuotation = (id: string): void => {
  updateQuotation(id, { is_deleted: true });
};

export const convertQuotationToInvoice = (quotationId: string): string | null => {
  const quote = getQuotationById(quotationId);
  if (!quote) return null;

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 7);

  const newInvoiceData = {
    client_name: quote.client_name,
    client_phone: quote.client_phone,
    items: quote.items.map(i => ({ ...i, id: crypto.randomUUID() })),
    subtotal: quote.subtotal,
    tax_rate: quote.tax_rate,
    tax_amount: quote.tax_amount,
    total_amount: quote.total_amount,
    due_date: dueDate.toISOString(),
    notes: `Converted from ${quote.quote_number}`,
    template: quote.template,
  };

  // We need to use createInvoice from invoiceStore
  // createInvoice will generate ID, invoice_number, created_at, status='draft', and attach business_snapshot
  const newInvoice = createInvoice(newInvoiceData);

  updateQuotation(quotationId, { converted_to_invoice_id: newInvoice.id });

  return newInvoice.id;
};
