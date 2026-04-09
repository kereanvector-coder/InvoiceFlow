import React from 'react';
import { Invoice } from '../store/invoiceStore';
import CorporateTemplate from './templates/CorporateTemplate';
import TechTemplate from './templates/TechTemplate';
import ClassicTemplate from './templates/ClassicTemplate';
import ModernTemplate from './templates/ModernTemplate';
import CreativeTemplate from './templates/CreativeTemplate';
import EcommerceTemplate from './templates/EcommerceTemplate';
import ExecutiveTemplate from './templates/ExecutiveTemplate';
import WellnessTemplate from './templates/WellnessTemplate';
import TradesTemplate from './templates/TradesTemplate';
import NoirTemplate from './templates/NoirTemplate';
import EducationTemplate from './templates/EducationTemplate';
import CateringTemplate from './templates/CateringTemplate';

export default function TemplateThumbnail({ templateId }: { templateId: string }) {
  const getDummyInvoice = (): Invoice => {
    let businessLogo = undefined;
    try {
      const bizStr = localStorage.getItem("invoiceflow_business");
      if (bizStr) {
        const biz = JSON.parse(bizStr);
        businessLogo = biz.business_logo;
      }
    } catch (e) {
      // ignore
    }

    return {
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
      template: templateId,
      business_snapshot: {
        business_name: 'My Business',
        owner_name: 'John Doe',
        phone_number: '+234 801 000 0000',
        bank_name: 'GTBank',
        account_number: '0123456789',
        account_name: 'John Doe',
        business_logo: businessLogo
      }
    } as Invoice;
  };

  const renderTemplate = () => {
    const invoice = getDummyInvoice();
    switch (templateId) {
      case 'corporate': return <CorporateTemplate invoice={invoice} />;
      case 'tech': return <TechTemplate invoice={invoice} />;
      case 'classic': return <ClassicTemplate invoice={invoice} />;
      case 'modern': return <ModernTemplate invoice={invoice} />;
      case 'creative': return <CreativeTemplate invoice={invoice} />;
      case 'ecommerce': return <EcommerceTemplate invoice={invoice} />;
      case 'executive': return <ExecutiveTemplate invoice={invoice} />;
      case 'wellness': return <WellnessTemplate invoice={invoice} />;
      case 'trades': return <TradesTemplate invoice={invoice} />;
      case 'noir': return <NoirTemplate invoice={invoice} />;
      case 'education': return <EducationTemplate invoice={invoice} />;
      case 'catering': return <CateringTemplate invoice={invoice} />;
      default: return <CorporateTemplate invoice={invoice} />;
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
