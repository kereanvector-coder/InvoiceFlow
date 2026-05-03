import { Invoice } from '../store/invoiceStore';
import { Quotation } from '../store/quotationStore';

export const isQuotation = (doc: Invoice | Quotation): doc is Quotation => {
  return 'quote_number' in doc;
};

export const getDocumentDetails = (doc: Invoice | Quotation, isReceipt: boolean = false) => {
  const isQuote = isQuotation(doc);
  
  if (isReceipt && !isQuote) {
    const inv = doc as Invoice;
    return {
      isQuote: false,
      documentTypeLabel: 'RECEIPT',
      documentNumber: inv.receipt_number || 'RECEIPT', // Assume generated
      amountLabel: 'Total Paid',
      dateLabel: 'Payment Date',
      dateValue: inv.paid_at || new Date().toISOString(),
      projectTitle: null,
      projectDescription: null,
      terms: null,
    };
  }
  
  return {
    isQuote,
    documentTypeLabel: isQuote ? 'QUOTATION' : 'INVOICE',
    documentNumber: isQuote ? doc.quote_number : doc.invoice_number,
    amountLabel: isQuote ? 'Estimated Total' : 'Total Due',
    dateLabel: isQuote ? 'Valid Until' : 'Due Date',
    dateValue: isQuote ? doc.valid_until : doc.due_date,
    projectTitle: isQuote ? doc.project_title : null,
    projectDescription: isQuote ? doc.project_description : null,
    terms: doc.terms || null,
  };
};