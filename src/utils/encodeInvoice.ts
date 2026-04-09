import { Invoice } from '../store/invoiceStore';
import LZString from 'lz-string';

const compressLogo = (base64: string, maxSize: number): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      
      const ratio = Math.min(maxSize / img.width, maxSize / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        // Compress heavily to JPEG quality 0.3 to save maximum space
        const dataUrl = canvas.toDataURL('image/jpeg', 0.3);
        // Strip the prefix to save space
        resolve(dataUrl.replace(/^data:image\/[a-z]+;base64,/, ''));
      } else {
        resolve(base64.replace(/^data:image\/[a-z]+;base64,/, ''));
      }
    };
    img.onerror = () => resolve(base64.replace(/^data:image\/[a-z]+;base64,/, ''));
    img.src = base64;
  });
};

export const encodeInvoice = async (invoice: Invoice): Promise<string> => {
  try {
    const fullLogo = invoice.business_snapshot?.business_logo || null;
    let logoToEncode = null;

    if (fullLogo) {
      // Always compress for share link to ensure it's tiny
      logoToEncode = await compressLogo(fullLogo, 32); // 32px is enough for a tiny logo on a receipt
    }

    const slim = {
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
      // Use timestamps (numbers) instead of ISO strings to save space
      due:            new Date(invoice.due_date).getTime(),
      created:        new Date(invoice.created_at).getTime(),
      status:         invoice.status === 'draft' ? 'd' : invoice.status === 'sent' ? 's' : invoice.status === 'paid' ? 'p' : invoice.status === 'overdue' ? 'o' : 'd',
      notes:          invoice.notes || "",
      biz: {
        name:         invoice.business_snapshot?.business_name || "",
        bank:         invoice.business_snapshot?.bank_name || "",
        acc:          invoice.business_snapshot?.account_number || "",
        accName:      invoice.business_snapshot?.account_name || "",
        phone:        invoice.business_snapshot?.phone_number || "",
        logo:         logoToEncode
      }
    };

    const json = JSON.stringify(slim);
    // Use LZString to compress the JSON string into a URL-safe string
    const compressed = LZString.compressToEncodedURIComponent(json);
    return compressed;
  } catch (error) {
    console.error('Failed to encode invoice', error);
    return '';
  }
};

export const decodeInvoice = (encoded: string): Invoice | null => {
  try {
    // Try to decompress using LZString first
    let json = LZString.decompressFromEncodedURIComponent(encoded);
    
    // Fallback for old links (base64 encoded)
    if (!json) {
      try {
        json = decodeURIComponent(atob(encoded));
      } catch (e) {
        return null;
      }
    }

    if (!json) return null;

    const slim = JSON.parse(json);
    
    // Reconstruct full logo data URI if it exists
    let fullLogo = slim.biz?.logo || null;
    if (fullLogo && !fullLogo.startsWith('data:')) {
      fullLogo = `data:image/jpeg;base64,${fullLogo}`;
    }

    // Map status back
    const statusMap: Record<string, string> = { 'd': 'draft', 's': 'sent', 'p': 'paid', 'o': 'overdue' };
    const status = statusMap[slim.status] || slim.status || 'draft';

    // Handle both old ISO strings and new timestamps
    const dueDate = typeof slim.due === 'number' ? new Date(slim.due).toISOString() : slim.due;
    const createdAt = typeof slim.created === 'number' ? new Date(slim.created).toISOString() : slim.created;

    return {
      id:             slim.id || Math.random().toString(36).substring(2, 9),
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
      due_date:       dueDate,
      created_at:     createdAt,
      status:         status,
      notes:          slim.notes || "",
      business_snapshot: {
        business_name:   slim.biz.name,
        bank_name:       slim.biz.bank,
        account_number:  slim.biz.acc,
        account_name:    slim.biz.accName,
        phone_number:    slim.biz.phone,
        owner_name:      "",
        business_logo:   fullLogo
      }
    } as Invoice;
  } catch (error) {
    console.error('Failed to decode invoice', error);
    return null;
  }
};
