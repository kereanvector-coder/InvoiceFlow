import { Invoice } from '../store/invoiceStore';
import { Quotation } from '../store/quotationStore';

export const isQuotation = (doc: Invoice | Quotation): doc is Quotation => {
  return 'quote_number' in doc;
};

export const getDocumentDetails = (doc: Invoice | Quotation) => {
  const isQuote = isQuotation(doc);
  
  return {
    isQuote,
    documentTypeLabel: isQuote ? 'QUOTATION' : 'INVOICE',
    documentNumber: isQuote ? doc.quote_number : doc.invoice_number,
    amountLabel: isQuote ? 'Estimated Total' : 'Total Due',
    dateLabel: isQuote ? 'Valid Until' : 'Due Date',
    dateValue: isQuote ? doc.valid_until : doc.due_date,
    projectTitle: isQuote ? doc.project_title : null,
    projectDescription: isQuote ? doc.project_description : null,
    terms: isQuote ? doc.terms : null,
  };
};