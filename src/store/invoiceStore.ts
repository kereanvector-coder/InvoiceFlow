import { generateId } from '../utils/generateId';
import { BusinessProfile } from './businessStore';
import { safeGetItem, safeSetItem } from '../utils/storage';

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue';

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number; // in kobo
}

export interface Invoice {
  id: string; // uuid v4
  invoice_number: string;
  template?: string;
  business_snapshot: BusinessProfile;
  client_name: string;
  client_phone: string;
  items: InvoiceItem[];
  subtotal: number; // kobo
  tax_rate: number;
  tax_amount: number; // kobo
  total_amount: number; // kobo
  status: InvoiceStatus;
  notes?: string;
  terms?: string;
  created_at: string;
  due_date: string;
  sent_at: string | null;
  paid_at: string | null;
  last_reminder_at: string | null;
  reminder_count: number;
  reminder_history: string[];
  is_deleted: boolean;
  receipt_number?: string | null;
  receipt_generated_at?: string | null;
  receipt_sent_at?: string | null;
  receipt_snapshot?: string | null;
}

const STORAGE_KEY = 'invoiceflow_invoices';

let invoiceCache: Invoice[] | null = null;
let cacheTimestamp: number | null = null;

export const invalidateCache = () => {
  invoiceCache = null;
  cacheTimestamp = null;
};

// Internal helper to read all raw invoices
const readInvoices = (): Invoice[] => {
  try {
    const data = safeGetItem(STORAGE_KEY);
    if (!data) return [];
    
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return [];
    
    const validInvoices: Invoice[] = [];
    let hasCorrupted = false;

    parsed.forEach((inv: any) => {
      // Data validation
      if (inv && inv.id && inv.invoice_number && inv.client_name && typeof inv.total_amount === 'number' && inv.status && inv.created_at) {
        validInvoices.push(inv);
      } else {
        hasCorrupted = true;
        console.warn(`[InvoiceFlow] Skipping corrupted invoice: ${inv?.id || 'unknown'}`);
      }
    });

    if (hasCorrupted) {
      window.dispatchEvent(new CustomEvent('app-toast', { 
        detail: { message: "Some invoice data could not be loaded. [Contact Support]", variant: "error" } 
      }));
    }

    return validInvoices;
  } catch (error) {
    console.error('Failed to read invoices', error);
    window.dispatchEvent(new CustomEvent('app-toast', { 
      detail: { message: "Some invoice data could not be loaded. [Contact Support]", variant: "error" } 
    }));
    return [];
  }
};

// Internal helper to write all raw invoices
const writeInvoices = (invoices: Invoice[]) => {
  safeSetItem(STORAGE_KEY, JSON.stringify(invoices));
  invalidateCache();
};

export const getNextInvoiceNumber = (): string => {
  const invoices = readInvoices();
  if (invoices.length === 0) return 'INV-001';
  
  let maxNum = 0;
  invoices.forEach(inv => {
    const match = inv.invoice_number.match(/^INV-(\d+)$/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;
    }
  });
  
  const nextNum = maxNum + 1;
  return `INV-${nextNum.toString().padStart(3, '0')}`;
};

export const getNextReceiptNumber = (): string => {
  const invoices = readInvoices();
  let maxNum = 0;
  invoices.forEach(inv => {
    if (inv.receipt_number) {
      const match = inv.receipt_number.match(/^RCT-(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    }
  });
  
  const nextNum = maxNum + 1;
  return `RCT-${nextNum.toString().padStart(3, '0')}`;
};

const calculateTotals = (items: InvoiceItem[], tax_rate: number) => {
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  const tax_amount = Math.round(subtotal * tax_rate);
  const total_amount = subtotal + tax_amount;
  return { subtotal, tax_amount, total_amount };
};

export const canTransitionTo = (invoice: Invoice, targetStatus: InvoiceStatus): boolean => {
  if (targetStatus === 'paid') {
    return invoice.status === 'sent' || invoice.status === 'overdue';
  }
  if (targetStatus === 'sent') {
    return invoice.status === 'draft';
  }
  if (targetStatus === 'overdue') {
    return invoice.status === 'sent';
  }
  return false;
};

export const getInvoices = (): Invoice[] => {
  if (invoiceCache && cacheTimestamp && (Date.now() - cacheTimestamp < 5000)) {
    return invoiceCache;
  }

  try {
    const invoices = readInvoices();
    let hasChanges = false;
    const now = new Date();

    const activeInvoices = invoices.filter(inv => !inv.is_deleted).map(inv => {
      if (inv.status === 'sent' && now > new Date(inv.due_date)) {
        inv.status = 'overdue';
        hasChanges = true;
      }
      return inv;
    });

    if (hasChanges) {
      // Update the full list including deleted ones to persist the status change
      const updatedFullList = invoices.map(inv => {
        if (!inv.is_deleted && inv.status === 'sent' && now > new Date(inv.due_date)) {
          return { ...inv, status: 'overdue' as InvoiceStatus };
        }
        return inv;
      });
      writeInvoices(updatedFullList);
    }

    invoiceCache = activeInvoices;
    cacheTimestamp = Date.now();
    return activeInvoices;
  } catch (error) {
    console.error('Failed to get invoices', error);
    return [];
  }
};

export const getInvoiceById = (id: string): Invoice | null => {
  try {
    const invoices = getInvoices(); // This also handles overdue auto-update
    const invoice = invoices.find(inv => inv.id === id);
    return invoice || null;
  } catch (error) {
    console.error('Failed to get invoice by id', error);
    return null;
  }
};

export const createInvoice = (data: Partial<Invoice>): Invoice => {
  try {
    const invoices = readInvoices();
    
    const items = data.items || [];
    const tax_rate = data.tax_rate || 0;
    const { subtotal, tax_amount, total_amount } = calculateTotals(items, tax_rate);

    const businessSnapshot = { ...data.business_snapshot! };
    delete businessSnapshot.signature;

    const newInvoice: Invoice = {
      id: crypto.randomUUID(),
      invoice_number: getNextInvoiceNumber(),
      template: data.template || localStorage.getItem('invoiceflow_default_template') || 'corporate',
      business_snapshot: businessSnapshot,
      client_name: data.client_name!,
      client_phone: data.client_phone!,
      items,
      subtotal,
      tax_rate,
      tax_amount,
      total_amount,
      status: data.status || 'draft',
      notes: data.notes || '',
      created_at: new Date().toISOString(),
      due_date: data.due_date!,
      sent_at: data.status === 'sent' ? new Date().toISOString() : null,
      paid_at: data.status === 'paid' ? new Date().toISOString() : null,
      last_reminder_at: null,
      reminder_count: 0,
      reminder_history: [],
      is_deleted: false,
    };

    invoices.push(newInvoice);
    writeInvoices(invoices);
    return newInvoice;
  } catch (error) {
    console.error('Failed to create invoice', error);
    throw error;
  }
};

export const updateInvoice = (id: string, updates: Partial<Invoice>): Invoice => {
  try {
    const invoices = readInvoices();
    const index = invoices.findIndex(inv => inv.id === id && !inv.is_deleted);
    
    if (index === -1) throw new Error('Invoice not found');

    const existing = invoices[index];
    const items = updates.items || existing.items;
    const tax_rate = updates.tax_rate !== undefined ? updates.tax_rate : existing.tax_rate;
    
    const { subtotal, tax_amount, total_amount } = calculateTotals(items, tax_rate);

    const businessSnapshot = updates.business_snapshot ? { ...updates.business_snapshot } : existing.business_snapshot;
    if (businessSnapshot) {
      delete businessSnapshot.signature;
    }

    const updatedInvoice: Invoice = {
      ...existing,
      ...updates,
      business_snapshot: businessSnapshot,
      template: updates.template || existing.template || localStorage.getItem('invoiceflow_default_template') || 'corporate',
      items,
      subtotal,
      tax_rate,
      tax_amount,
      total_amount,
    };

    invoices[index] = updatedInvoice;
    writeInvoices(invoices);
    return updatedInvoice;
  } catch (error) {
    console.error('Failed to update invoice', error);
    throw error;
  }
};

export const markInvoiceAsPaid = (id: string, paidAtDate?: string): Invoice => {
  try {
    const invoices = readInvoices();
    const index = invoices.findIndex(inv => inv.id === id && !inv.is_deleted);
    
    if (index === -1) throw new Error('Invoice not found');

    const existing = invoices[index];
    
    if (!canTransitionTo(existing, 'paid')) {
      throw new Error(`Invalid status transition from ${existing.status} to paid`);
    }

    const updatedInvoice = { 
      ...existing, 
      status: 'paid' as InvoiceStatus,
      paid_at: paidAtDate || new Date().toISOString()
    };
    
    invoices[index] = updatedInvoice;
    writeInvoices(invoices);
    return updatedInvoice;
  } catch (error) {
    console.error('Failed to mark invoice as paid', error);
    throw error;
  }
};

export const recordReminder = (id: string): Invoice => {
  try {
    const invoices = readInvoices();
    const index = invoices.findIndex(inv => inv.id === id && !inv.is_deleted);
    
    if (index === -1) throw new Error('Invoice not found');

    const existing = invoices[index];
    const now = new Date().toISOString();
    
    const updatedInvoice = { 
      ...existing, 
      reminder_count: existing.reminder_count + 1,
      last_reminder_at: now,
      reminder_history: [...(existing.reminder_history || []), now]
    };
    
    invoices[index] = updatedInvoice;
    writeInvoices(invoices);
    return updatedInvoice;
  } catch (error) {
    console.error('Failed to record reminder', error);
    throw error;
  }
};

export const updateInvoiceStatus = (id: string, status: InvoiceStatus): Invoice => {
  try {
    const invoices = readInvoices();
    const index = invoices.findIndex(inv => inv.id === id && !inv.is_deleted);
    
    if (index === -1) throw new Error('Invoice not found');

    const existing = invoices[index];
    
    if (!canTransitionTo(existing, status)) {
      throw new Error(`Invalid status transition from ${existing.status} to ${status}`);
    }

    const updates: Partial<Invoice> = { status };

    if (status === 'sent' && existing.status !== 'sent') {
      updates.sent_at = new Date().toISOString();
    } else if (status === 'paid' && existing.status !== 'paid') {
      updates.paid_at = new Date().toISOString();
    }

    const updatedInvoice = { ...existing, ...updates };
    invoices[index] = updatedInvoice;
    writeInvoices(invoices);
    return updatedInvoice;
  } catch (error) {
    console.error('Failed to update invoice status', error);
    throw error;
  }
};

export const deleteInvoice = (id: string): void => {
  try {
    const invoices = readInvoices();
    const index = invoices.findIndex(inv => inv.id === id && !inv.is_deleted);
    
    if (index === -1) throw new Error('Invoice not found');

    invoices[index].is_deleted = true;
    writeInvoices(invoices);
  } catch (error) {
    console.error('Failed to delete invoice', error);
    throw error;
  }
};

export const debugInvoices = () => {
  console.log('--- RUNNING INVOICE DEBUG ---');
  
  // Clear existing for clean test
  localStorage.removeItem(STORAGE_KEY);
  
  const mockBusiness = {
    business_name: 'Test Corp',
    owner_name: 'John Doe',
    phone_number: '+2348012345678',
    bank_name: 'Test Bank',
    account_number: '1234567890',
    account_name: 'Test Corp'
  };

  // 1. Draft
  createInvoice({
    business_snapshot: mockBusiness,
    client_name: 'Client A',
    client_phone: '+2348000000001',
    items: [{ id: generateId('ITM'), description: 'Web Design', quantity: 1, unit_price: 15000000 }], // 150,000.00 NGN
    tax_rate: 0.075,
    status: 'draft',
    due_date: new Date(Date.now() + 86400000 * 7).toISOString(), // +7 days
  });

  // 2. Sent (Overdue)
  createInvoice({
    business_snapshot: mockBusiness,
    client_name: 'Client B',
    client_phone: '+2348000000002',
    items: [{ id: generateId('ITM'), description: 'SEO', quantity: 2, unit_price: 5000000 }], // 50,000.00 NGN
    tax_rate: 0,
    status: 'sent',
    due_date: new Date(Date.now() - 86400000 * 2).toISOString(), // -2 days
  });

  // 3. Paid
  createInvoice({
    business_snapshot: mockBusiness,
    client_name: 'Client C',
    client_phone: '+2348000000003',
    items: [{ id: generateId('ITM'), description: 'Hosting', quantity: 1, unit_price: 2500000 }], // 25,000.00 NGN
    tax_rate: 0,
    status: 'paid',
    due_date: new Date(Date.now() + 86400000 * 30).toISOString(),
  });

  const allInvoices = getInvoices(); // This will auto-update Client B to overdue
  console.log('All Invoices:', allInvoices);

  const monthlySummary = allInvoices.reduce((acc, inv) => {
    acc.total += inv.total_amount;
    if (inv.status === 'paid') acc.paid += inv.total_amount;
    if (inv.status === 'overdue') acc.overdue += inv.total_amount;
    if (inv.status === 'draft') acc.draft += inv.total_amount;
    return acc;
  }, { total: 0, paid: 0, overdue: 0, draft: 0 });

  console.log('Monthly Summary (in kobo):', monthlySummary);
  console.log('--- DEBUG COMPLETE ---');
};

// Also export the empty hook so existing imports don't break
export const useInvoiceStore = () => {};
