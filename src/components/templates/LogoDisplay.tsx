import React from 'react';
import { Invoice } from '../../store/invoiceStore';
import { Quotation } from '../../store/quotationStore';

export const getLogo = (document: Invoice | Quotation | null | undefined): string | null => {
  if (document?.business_snapshot?.business_logo) {
    return document.business_snapshot.business_logo;
  }
  
  try {
    const bizStr = localStorage.getItem("invoiceflow_business");
    if (bizStr) {
      const biz = JSON.parse(bizStr);
      return biz.business_logo || null;
    }
  } catch (e) {
    // ignore
  }
  return null;
};

interface LogoDisplayProps {
  invoice: Invoice | Quotation;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export default function LogoDisplay({ invoice, size = 56, className = '', style = {} }: LogoDisplayProps) {
  const logo = getLogo(invoice);
  
  if (!logo) return null;
  
  return (
    <img
      src={logo}
      alt="Business Logo"
      className={className}
      style={{
        width: size + 'px',
        height: size + 'px',
        objectFit: 'contain',
        display: 'block',
        ...style
      }}
    />
  );
}
