import { Quotation } from '../store/quotationStore';
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
        const dataUrl = canvas.toDataURL('image/jpeg', 0.3);
        resolve(dataUrl.replace(/^data:image\/[a-z]+;base64,/, ''));
      } else {
        resolve(base64.replace(/^data:image\/[a-z]+;base64,/, ''));
      }
    };
    img.onerror = () => resolve(base64.replace(/^data:image\/[a-z]+;base64,/, ''));
    img.src = base64;
  });
};

export const encodeQuotation = async (quotation: Quotation): Promise<string> => {
  try {
    const fullLogo = quotation.business_snapshot?.business_logo || null;
    let logoToEncode = null;

    if (fullLogo) {
      logoToEncode = await compressLogo(fullLogo, 32);
    }

    const slim = {
      id:     quotation.id,
      n:      quotation.quote_number,
      t:      quotation.template || "corporate",
      pt:     quotation.project_title,
      pd:     quotation.project_description || "",
      cn:     quotation.client_name,
      cp:     quotation.client_phone,
      items:  quotation.items.map(item => ({
                d: item.description,
                q: item.quantity,
                p: item.unit_price
              })),
      total:  quotation.total_amount,
      sub:    quotation.subtotal,
      tax:    quotation.tax_rate || 0,
      vu:     new Date(quotation.valid_until).getTime(),
      created:new Date(quotation.created_at).getTime(),
      status: quotation.status === 'draft' ? 'd' : quotation.status === 'sent' ? 's' : quotation.status === 'accepted' ? 'a' : quotation.status === 'declined' ? 'x' : quotation.status === 'expired' ? 'e' : 'd',
      notes:  quotation.notes || "",
      terms:  quotation.terms || "",
      biz: {
        name:    quotation.business_snapshot?.business_name || "",
        bank:    quotation.business_snapshot?.bank_name || "",
        acc:     quotation.business_snapshot?.account_number || "",
        accName: quotation.business_snapshot?.account_name || "",
        phone:   quotation.business_snapshot?.phone_number || "",
        logo:    logoToEncode
      }
    };

    const json = JSON.stringify(slim);
    const compressed = LZString.compressToEncodedURIComponent(json);
    return compressed;
  } catch (error) {
    console.error('Failed to encode quotation', error);
    return '';
  }
};

export const decodeQuotation = (encoded: string): Quotation | null => {
  try {
    let json = LZString.decompressFromEncodedURIComponent(encoded);
    
    if (!json) {
      try {
        json = decodeURIComponent(atob(encoded));
      } catch (e) {
        return null;
      }
    }

    if (!json) return null;

    const slim = JSON.parse(json);
    
    let fullLogo = slim.biz?.logo || null;
    if (fullLogo && !fullLogo.startsWith('data:')) {
      fullLogo = `data:image/jpeg;base64,${fullLogo}`;
    }

    const statusMap: Record<string, string> = { 'd': 'draft', 's': 'sent', 'a': 'accepted', 'x': 'declined', 'e': 'expired' };
    const status = statusMap[slim.status] || slim.status || 'draft';

    const validUntil = typeof slim.vu === 'number' ? new Date(slim.vu).toISOString() : slim.vu;
    const createdAt = typeof slim.created === 'number' ? new Date(slim.created).toISOString() : slim.created;

    return {
      id:                  slim.id || Math.random().toString(36).substring(2, 9),
      quote_number:        slim.n,
      template:            slim.t || "corporate",
      project_title:       slim.pt,
      project_description: slim.pd || "",
      client_name:         slim.cn,
      client_phone:        slim.cp,
      items:               slim.items.map((item: any) => ({
                             id: Math.random().toString(36).substring(2, 9),
                             description: item.d,
                             quantity:    item.q,
                             unit_price:  item.p,
                             line_total:  item.q * item.p
                           })),
      total_amount:        slim.total,
      subtotal:            slim.sub,
      tax_rate:            slim.tax || 0,
      tax_amount:          slim.sub * (slim.tax / 100),
      valid_until:         validUntil,
      created_at:          createdAt,
      status:              status as any,
      notes:               slim.notes || "",
      terms:               slim.terms || "",
      is_deleted:          false,
      business_snapshot: {
        business_name:   slim.biz.name,
        bank_name:       slim.biz.bank,
        account_number:  slim.biz.acc,
        account_name:    slim.biz.accName,
        phone_number:    slim.biz.phone,
        owner_name:      "",
        business_logo:   fullLogo
      }
    } as Quotation;
  } catch (error) {
    console.error('Failed to decode quotation', error);
    return null;
  }
};