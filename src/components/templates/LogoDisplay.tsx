import React from 'react';
import { Invoice } from '../../store/invoiceStore';

export const getLogo = (invoice: Invoice | null | undefined): string | null => {
  if (invoice?.business_snapshot?.business_logo) {
    return invoice.business_snapshot.business_logo;
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
  invoice: Invoice;
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
