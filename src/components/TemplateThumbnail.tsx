import React from 'react';
import { Invoice } from '../store/invoiceStore';
import CorporateTemplate from './templates/CorporateTemplate';
import TechTemplate from './templates/TechTemplate';
import ClassicTemplate from './templates/ClassicTemplate';
import ModernTemplate from './templates/ModernTemplate';

const dummyInvoice = {
  id: 'dummy',
  invoice_number: 'INV-001',
  client_name: 'Acme Corp',
  client_phone: '+234 800 000 0000',
  items: [
    { id: '1', description: 'Web Development', quantity: 1, unit_price: 250000 }
  ],
  subtotal: 250000,
  tax_rate: 0.05,
  tax_amount: 12500,
  total_amount: 262500,
  status: 'draft',
  created_at: new Date().toISOString(),
  due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  notes: 'Thank you for your business.',
  template: 'corporate',
  business_snapshot: {
    business_name: 'My Business',
    owner_name: 'John Doe',
    phone_number: '+234 801 000 0000',
    bank_name: 'GTBank',
    account_number: '0123456789',
    account_name: 'John Doe',
  }
} as Invoice;

export default function TemplateThumbnail({ templateId }: { templateId: string }) {
  const renderTemplate = () => {
    switch (templateId) {
      case 'corporate': return <CorporateTemplate invoice={dummyInvoice} />;
      case 'tech': return <TechTemplate invoice={dummyInvoice} />;
      case 'classic': return <ClassicTemplate invoice={dummyInvoice} />;
      case 'modern': return <ModernTemplate invoice={dummyInvoice} />;
      default: return <CorporateTemplate invoice={dummyInvoice} />;
    }
  };

  return (
    <div className="relative w-[105px] h-[148px] bg-white rounded overflow-hidden border border-border pointer-events-none select-none shrink-0">
      <div 
        className="absolute top-0 left-0 origin-top-left"
        style={{ 
          width: '800px', 
          height: '1131px', // A4 aspect ratio
          transform: 'scale(0.13125)' // 105 / 800
        }}
      >
        {renderTemplate()}
      </div>
    </div>
  );
}
