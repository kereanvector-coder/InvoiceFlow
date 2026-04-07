import { Invoice } from '../store/invoiceStore';

export const encodeInvoice = (invoice: Invoice): string => {
  try {
    // Strip business logo to save massive amounts of space in URL
    const clientViewInvoice = {
      ...invoice,
      business_snapshot: {
        ...invoice.business_snapshot,
        business_logo: undefined 
      }
    };

    let jsonString = JSON.stringify(clientViewInvoice);
    
    // If it's still too long (WhatsApp limits around 2000 chars for URLs), truncate items
    if (jsonString.length > 1500 && clientViewInvoice.items.length > 3) {
      const truncatedItems = clientViewInvoice.items.slice(0, 3);
      truncatedItems.push({
        id: 'truncated',
        description: '...and other items (see PDF/Sender for full list)',
        quantity: 1,
        unit_price: 0
      });
      clientViewInvoice.items = truncatedItems;
      jsonString = JSON.stringify(clientViewInvoice);
    }

    // Encode to base64 safely handling unicode
    const encoded = btoa(unescape(encodeURIComponent(jsonString)));
    return encoded;
  } catch (error) {
    console.error('Failed to encode invoice', error);
    return '';
  }
};

export const decodeInvoice = (base64: string): Invoice | null => {
  try {
    const jsonString = decodeURIComponent(escape(atob(base64)));
    return JSON.parse(jsonString) as Invoice;
  } catch (error) {
    console.error('Failed to decode invoice', error);
    return null;
  }
};
