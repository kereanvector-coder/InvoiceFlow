import { Invoice } from '../store/invoiceStore';

export const encodeInvoice = (invoice: Invoice): string => {
  try {
    const slim = {
      id:             invoice.id,
      n:              invoice.invoice_number,
      t:              invoice.template || "corporate",
      cn:             invoice.client_name,
      cp:             invoice.client_phone,
      items:          invoice.items.map(item => ({
                        d: item.description,
                        q: item.quantity,
                        p: item.unit_price
                      })),
      total:          invoice.total_amount,
      sub:            invoice.subtotal,
      tax:            invoice.tax_rate || 0,
      due:            invoice.due_date,
      created:        invoice.created_at,
      status:         invoice.status,
      notes:          invoice.notes || "",
      biz: {
        name:         invoice.business_snapshot?.business_name || "",
        bank:         invoice.business_snapshot?.bank_name || "",
        acc:          invoice.business_snapshot?.account_number || "",
        accName:      invoice.business_snapshot?.account_name || "",
        phone:        invoice.business_snapshot?.phone_number || ""
      }
    };

    const json = JSON.stringify(slim);
    const compressed = btoa(encodeURIComponent(json));
    return compressed;
  } catch (error) {
    console.error('Failed to encode invoice', error);
    return '';
  }
};

export const decodeInvoice = (base64: string): Invoice | null => {
  try {
    const json = decodeURIComponent(atob(base64));
    const slim = JSON.parse(json);
    
    return {
      id:             slim.id,
      invoice_number: slim.n,
      template:       slim.t || "corporate",
      client_name:    slim.cn,
      client_phone:   slim.cp,
      items:          slim.items.map((item: any) => ({
                        id: Math.random().toString(36).substring(2, 9),
                        description: item.d,
                        quantity:    item.q,
                        unit_price:  item.p,
                        line_total:  item.q * item.p
                      })),
      total_amount:   slim.total,
      subtotal:       slim.sub,
      tax_rate:       slim.tax || 0,
      tax_amount:     slim.sub * (slim.tax / 100),
      due_date:       slim.due,
      created_at:     slim.created,
      status:         slim.status,
      notes:          slim.notes || "",
      business_snapshot: {
        business_name:   slim.biz.name,
        bank_name:       slim.biz.bank,
        account_number:  slim.biz.acc,
        account_name:    slim.biz.accName,
        phone_number:    slim.biz.phone,
        owner_name:      "",
      }
    } as Invoice;
  } catch (error) {
    console.error('Failed to decode invoice', error);
    return null;
  }
};
